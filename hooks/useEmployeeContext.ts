import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  getActiveMembershipForUser,
  getEmployeeProfileByMemberId,
  ensureEmployeeProfileForMember,
} from '@/lib/repositories';
import type { CompanyMember, EmployeeProfile } from '@/types/db';

import { useAuth } from './useAuth';

export type EmployeeContextValue = {
  companyId: string | null;
  membershipId: string | null;
  membership: CompanyMember | null;
  employeeId: string | null;
  employeeProfile: EmployeeProfile | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const initialState = {
  membership: null as CompanyMember | null,
  employeeProfile: null as EmployeeProfile | null,
  error: null as string | null,
  isLoading: false,
};

export function useEmployeeContext(): EmployeeContextValue {
  const { user, isAuthLoading } = useAuth();
  const [state, setState] = useState(initialState);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setState({
        membership: null,
        employeeProfile: null,
        error: null,
        isLoading: false,
      });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const membership = await getActiveMembershipForUser(user.id);

      if (!membership) {
        setState({
          membership: null,
          employeeProfile: null,
          error: 'No encontramos una compañía asociada a tu usuario.',
          isLoading: false,
        });
        return;
      }

      let employeeProfile: EmployeeProfile | null = null;

      if (membership.role === 'employee') {
        employeeProfile = await getEmployeeProfileByMemberId(membership.id);
      } else if (membership.role === 'admin') {
        employeeProfile = await ensureEmployeeProfileForMember(membership.company_id, membership.id);
      }
      setState({
        membership,
        employeeProfile: employeeProfile ?? null,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos cargar tus datos.';
      setState({
        membership: null,
        employeeProfile: null,
        error: message,
        isLoading: false,
      });
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    void refresh();
  }, [isAuthLoading, refresh]);
  const value = useMemo(() => {
    const companyId = state.membership?.company_id ?? null;
    const membershipId = state.membership?.id ?? null;
    const employeeId = state.employeeProfile?.id ?? null;

    return {
      companyId,
      membershipId,
      membership: state.membership ?? null,
      employeeId,
      employeeProfile: state.employeeProfile ?? null,
      isLoading: isAuthLoading || state.isLoading,
      error: state.error,
      refresh,
    };
  }, [state, refresh, isAuthLoading]);

  return value;
}
