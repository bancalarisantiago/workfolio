import { useCallback, useEffect, useMemo, useState } from 'react';

import { createPaycheckSignedUrl, getPaychecksForEmployee } from '@/lib/repositories';
import type { Paycheck } from '@/types/db';
import type { PaycheckEntry, PaycheckGroup } from '@/types/screens/paychecks';

import { useEmployeeContext } from './useEmployeeContext';

const formatMonthLabel = (isoDate: string): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return 'Recibo';
  }

  const formatter = new Intl.DateTimeFormat('es-AR', {
    month: 'short',
    year: 'numeric',
  });

  return formatter.format(date);
};

const formatPeriodDescription = (paycheck: Paycheck, fallback: string): string => {
  const metadata = (paycheck.metadata ?? {}) as Record<string, unknown>;
  const description = metadata.description;

  if (typeof description === 'string' && description.trim().length > 0) {
    return description.trim();
  }

  const { period_start: start, period_end: end } = paycheck;
  if (start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
      const formatter = new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: 'short',
      });
      return `Período ${formatter.format(startDate)} – ${formatter.format(endDate)}`;
    }
  }

  return fallback;
};

const buildPaycheckEntry = (paycheck: Paycheck): PaycheckEntry => {
  const issuedLabel = paycheck.issued_at ? formatMonthLabel(paycheck.issued_at) : 'Recibo';
  const description = formatPeriodDescription(paycheck, 'Recibo salarial');

  return {
    id: paycheck.id,
    issuedAt: paycheck.issued_at,
    label: issuedLabel,
    description,
    status: paycheck.status,
    grossAmount: paycheck.gross_amount,
    netAmount: paycheck.net_amount,
    currency: paycheck.currency,
    filePath: paycheck.file_path,
  };
};

const groupPaychecks = (entries: PaycheckEntry[]): PaycheckGroup[] => {
  const groupsMap = new Map<number, PaycheckGroup>();

  for (const entry of entries) {
    const year = entry.issuedAt ? new Date(entry.issuedAt).getFullYear() : new Date().getFullYear();
    if (!groupsMap.has(year)) {
      groupsMap.set(year, { year, items: [] });
    }
    groupsMap.get(year)?.items.push(entry);
  }

  const groups = Array.from(groupsMap.values());
  groups.sort((a, b) => b.year - a.year);
  groups.forEach((group) => {
    group.items.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  });
  return groups;
};

export type EmployeePaychecksValue = {
  companyId: string | null;
  employeeId: string | null;
  paychecks: PaycheckEntry[];
  groups: PaycheckGroup[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  downloadPaycheck: (entry: PaycheckEntry) => Promise<string>;
};

export function useEmployeePaychecks(): EmployeePaychecksValue {
  const { companyId, employeeId, isLoading: isContextLoading, error: contextError } =
    useEmployeeContext();
  const [paychecks, setPaychecks] = useState<PaycheckEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!companyId || !employeeId) {
      setPaychecks([]);
      setError(contextError ?? null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const rows = await getPaychecksForEmployee(companyId, employeeId);
      const entries = rows
        .map((row) => buildPaycheckEntry(row))
        .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
      setPaychecks(entries);
    } catch (unknownError) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : 'No pudimos cargar tus recibos de sueldo.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, employeeId, contextError]);

  useEffect(() => {
    if (isContextLoading) {
      return;
    }

    void refresh();
  }, [refresh, isContextLoading]);

  const downloadPaycheck = useCallback(
    async (entry: PaycheckEntry) => {
      if (!companyId) {
        throw new Error('No pudimos determinar tu compañía para descargar el recibo.');
      }

      if (!entry.filePath) {
        throw new Error('El recibo no tiene un archivo disponible.');
      }

      const result = await createPaycheckSignedUrl(companyId, entry.id, {
        expiresIn: 120,
        download: true,
        fileName: `${entry.label}.pdf`,
      });

      return result.signedUrl;
    },
    [companyId],
  );

  const groups = useMemo(() => groupPaychecks(paychecks), [paychecks]);

  return {
    companyId,
    employeeId,
    paychecks,
    groups,
    isLoading: isLoading || isContextLoading,
    error: error ?? contextError ?? null,
    refresh,
    downloadPaycheck,
  };
}
