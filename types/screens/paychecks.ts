export type PaycheckStatus = 'signed' | 'pending';

export type PaycheckEntry = {
  id: string;
  month: string;
  description: string;
  status: PaycheckStatus;
};

export type PaycheckGroup = {
  year: number;
  items: PaycheckEntry[];
};
