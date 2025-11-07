import { uploadFile, createSignedUrl, removeFiles } from '@/lib/adapters/supabaseStorage';
import { RepositoryError } from '@/lib/adapters/supabaseAdapter';
import { ensureCompanyScope, ensureIdentifier } from '@/lib/middlewares/ensureCompanyScope';
import {
  getPaycheckById,
  updatePaycheck,
} from '@/lib/repositories/paychecksRepository';
import type { Paycheck } from '@/types/db';
import type { SignedUrlOptions, SignedUrlResult, StorageFile, StorageUploadOptions } from '@/types/storage';

const sanitizeFileName = (fileName: string): string => fileName.trim().replace(/\s+/g, '-');

const buildPaycheckFilePath = ({
  companyId,
  paycheckId,
  fileName,
}: {
  companyId: string;
  paycheckId: string;
  fileName: string;
}): string => `company/${companyId}/paychecks/${paycheckId}/${sanitizeFileName(fileName)}`;

export interface UploadPaycheckFileParams {
  companyId: string;
  paycheckId: string;
  file: StorageFile;
  fileName: string;
  contentType?: string;
  storageOptions?: StorageUploadOptions;
  metadata?: Record<string, unknown>;
  fileSize?: number;
  checksum?: string;
  removePrevious?: boolean;
}

export const uploadPaycheckFile = async (
  params: UploadPaycheckFileParams,
): Promise<Paycheck> => {
  const companyId = ensureCompanyScope(params.companyId);
  const paycheckId = ensureIdentifier(params.paycheckId, 'paycheckId');
  const existing = await getPaycheckById(companyId, paycheckId);
  const path = buildPaycheckFilePath({
    companyId,
    paycheckId,
    fileName: params.fileName,
  });

  await uploadFile('paychecks', path, params.file, {
    cacheControl: params.storageOptions?.cacheControl,
    contentType: params.contentType,
    metadata: params.storageOptions?.metadata,
    upsert: params.storageOptions?.upsert ?? false,
  });

  if (params.removePrevious !== false && existing.file_path && existing.file_path !== path) {
    await removeFiles('paychecks', [existing.file_path]);
  }

  const baseMetadata =
    typeof existing.metadata === 'object' && existing.metadata !== null
      ? (existing.metadata as Record<string, unknown>)
      : {};

  const updatedMetadata: Record<string, unknown> = {
    ...baseMetadata,
    ...params.metadata,
    lastUploadedAt: new Date().toISOString(),
  };

  if (params.contentType || baseMetadata.contentType) {
    updatedMetadata.contentType = params.contentType ?? baseMetadata.contentType;
  }

  if (params.fileSize || baseMetadata.size) {
    updatedMetadata.size = params.fileSize ?? baseMetadata.size;
  }

  if (params.checksum || baseMetadata.checksum) {
    updatedMetadata.checksum = params.checksum ?? baseMetadata.checksum;
  }

  const updated = await updatePaycheck(companyId, paycheckId, {
    file_path: path,
    metadata: updatedMetadata,
  });

  return updated;
};

export const createPaycheckSignedUrl = async (
  companyId: string,
  paycheckId: string,
  options: SignedUrlOptions,
): Promise<SignedUrlResult> => {
  const paycheck = await getPaycheckById(companyId, paycheckId);

  if (!paycheck.file_path) {
    throw new RepositoryError('Paycheck file not available', { status: 404 });
  }

  return createSignedUrl('paychecks', paycheck.file_path, options);
};

export const deletePaycheckFile = async (
  companyId: string,
  paycheckId: string,
): Promise<Paycheck> => {
  const existing = await getPaycheckById(companyId, paycheckId);

  if (!existing.file_path) {
    throw new RepositoryError('Paycheck file not available', { status: 404 });
  }

  await removeFiles('paychecks', [existing.file_path]);

  const metadata: Record<string, unknown> =
    typeof existing.metadata === 'object' && existing.metadata !== null
      ? { ...(existing.metadata as Record<string, unknown>) }
      : {};
  // Remove file-specific metadata keys if present
  delete metadata.contentType;
  delete metadata.size;
  delete metadata.checksum;
  metadata.lastRemovedAt = new Date().toISOString();

  const updated = await updatePaycheck(companyId, paycheckId, {
    file_path: null,
    metadata,
  });

  return updated;
};
