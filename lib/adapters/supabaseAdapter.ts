import type {
  PostgrestError,
  PostgrestMaybeSingleResponse,
  PostgrestResponse,
  PostgrestSingleResponse,
} from '@supabase/supabase-js';

export class RepositoryError extends Error {
  public readonly original?: PostgrestError;

  public readonly status?: number;

  public readonly code?: string;

  public readonly details?: string;

  public readonly hint?: string;

  constructor(message: string, options: { cause?: PostgrestError; status?: number } = {}) {
    super(message);
    this.name = 'RepositoryError';
    this.original = options.cause;
    this.status = options.status;

    if (options.cause) {
      this.code = options.cause.code;
      this.details = options.cause.details;
      this.hint = options.cause.hint;
    }
  }
}

const formatMessage = (fallback: string, error?: PostgrestError) => {
  if (!error) {
    return fallback;
  }

  return `${fallback}: ${error.message}`;
};

export const unwrapSingle = <T>(
  response: PostgrestSingleResponse<T>,
  notFoundMessage = 'Record not found',
  failureMessage = 'Failed to fetch record',
): T => {
  if (response.error) {
    throw new RepositoryError(formatMessage(failureMessage, response.error), {
      cause: response.error,
      status: response.status,
    });
  }

  if (!response.data) {
    throw new RepositoryError(notFoundMessage, { status: 404 });
  }

  return response.data;
};

export const unwrapMaybeSingle = <T>(
  response: PostgrestMaybeSingleResponse<T>,
  failureMessage = 'Failed to fetch record',
): T | null => {
  if (response.error) {
    throw new RepositoryError(formatMessage(failureMessage, response.error), {
      cause: response.error,
      status: response.status,
    });
  }

  return response.data ?? null;
};

export const unwrapList = <T>(
  response: PostgrestResponse<T>,
  failureMessage = 'Failed to fetch records',
): T[] => {
  if (response.error) {
    throw new RepositoryError(formatMessage(failureMessage, response.error), {
      cause: response.error,
      status: response.status,
    });
  }

  return response.data ?? [];
};

export const ensureMutation = <T>(
  response: PostgrestSingleResponse<T>,
  failureMessage = 'Failed to persist record',
): T => unwrapSingle(response, 'Record not found', failureMessage);

export const ensureNoError = (
  response: PostgrestResponse<unknown>,
  failureMessage = 'Failed to execute operation',
): void => {
  if (response.error) {
    throw new RepositoryError(formatMessage(failureMessage, response.error), {
      cause: response.error,
      status: response.status,
    });
  }
};
