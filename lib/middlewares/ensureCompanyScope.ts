import { RepositoryError } from '@/lib/adapters/supabaseAdapter';

export const ensureCompanyScope = (companyId: string | null | undefined): string => {
  if (!companyId) {
    throw new RepositoryError('A company identifier is required for this operation.', {
      status: 400,
    });
  }

  return companyId;
};

export const ensureIdentifier = (value: string | null | undefined, label = 'id'): string => {
  if (!value) {
    throw new RepositoryError(`A valid ${label} must be provided.`, {
      status: 400,
    });
  }

  return value;
};
