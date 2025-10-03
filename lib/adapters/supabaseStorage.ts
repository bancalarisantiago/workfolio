import type { StorageError } from '@supabase/storage-js';

import { supabase } from '@/lib/supabase';
import { RepositoryError } from '@/lib/adapters/supabaseAdapter';
import type {
  SignedUrlOptions,
  SignedUrlResult,
  StorageBucket,
  StorageFile,
  StorageRemoveResult,
  StorageUploadOptions,
  StorageUploadResult,
} from '@/types/storage';

const formatMessage = (fallback: string, error?: StorageError | Error) => {
  if (!error) {
    return fallback;
  }

  const message = 'message' in error ? error.message : fallback;
  return `${fallback}: ${message}`;
};

const ensureBucket = (bucket: StorageBucket): StorageBucket => bucket;

export const uploadFile = async (
  bucket: StorageBucket,
  path: string,
  file: StorageFile,
  options: StorageUploadOptions = {},
): Promise<StorageUploadResult> => {
  const client = supabase.storage.from(ensureBucket(bucket));
  const { data, error } = await client.upload(path, file, options);

  if (error || !data?.path) {
    throw new RepositoryError(formatMessage('Failed to upload file', error ?? undefined), {
      cause: error ?? undefined,
      status: error?.status,
    });
  }

  return {
    bucket,
    path: data.path,
    fullPath: `${bucket}/${data.path}`,
  };
};

export const createSignedUrl = async (
  bucket: StorageBucket,
  path: string,
  options: SignedUrlOptions,
): Promise<SignedUrlResult> => {
  const client = supabase.storage.from(ensureBucket(bucket));
  const { data, error } = await client.createSignedUrl(path, options.expiresIn, {
    download: options.download,
    fileName: options.fileName,
    transform: options.transform,
  });

  if (error || !data?.signedUrl) {
    throw new RepositoryError(formatMessage('Failed to create signed URL', error ?? undefined), {
      cause: error ?? undefined,
      status: error?.status,
    });
  }

  return {
    bucket,
    path,
    signedUrl: data.signedUrl,
    expiresAt: data.expiry ?? Date.now() + options.expiresIn * 1000,
  };
};

export const getPublicUrl = (bucket: StorageBucket, path: string): string => {
  const client = supabase.storage.from(ensureBucket(bucket));
  const { data } = client.getPublicUrl(path);

  return data.publicUrl;
};

export const removeFiles = async (
  bucket: StorageBucket,
  paths: string[],
): Promise<StorageRemoveResult[]> => {
  if (!paths.length) {
    return [];
  }

  const client = supabase.storage.from(ensureBucket(bucket));
  const { data, error } = await client.remove(paths);

  if (error) {
    throw new RepositoryError(formatMessage('Failed to remove files', error), {
      cause: error,
      status: error.status,
    });
  }

  return (data ?? []).map((path) => ({ bucket, path }));
};

export const moveFile = async (
  bucket: StorageBucket,
  from: string,
  to: string,
): Promise<StorageUploadResult> => {
  const client = supabase.storage.from(ensureBucket(bucket));
  const { data, error } = await client.move(from, to);

  if (error || !data?.path) {
    throw new RepositoryError(formatMessage('Failed to move file', error ?? undefined), {
      cause: error ?? undefined,
      status: error?.status,
    });
  }

  return {
    bucket,
    path: data.path,
    fullPath: `${bucket}/${data.path}`,
  };
};

export const downloadFile = async (
  bucket: StorageBucket,
  path: string,
): Promise<Blob | ArrayBuffer> => {
  const client = supabase.storage.from(ensureBucket(bucket));
  const { data, error } = await client.download(path);

  if (error || !data) {
    throw new RepositoryError(formatMessage('Failed to download file', error ?? undefined), {
      cause: error ?? undefined,
      status: error?.status,
    });
  }

  return data;
};
