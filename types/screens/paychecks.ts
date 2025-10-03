import type { PaycheckStatus } from '@/types/db';

export type PaycheckEntry = {
  id: string;
  issuedAt: string;
  label: string;
  description: string;
  status: PaycheckStatus;
  grossAmount?: number | null;
  netAmount?: number | null;
  currency?: string | null;
  filePath?: string | null;
};

export type PaycheckGroup = {
  year: number;
  items: PaycheckEntry[];
};
