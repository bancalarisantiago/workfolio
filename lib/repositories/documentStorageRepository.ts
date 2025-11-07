import { uploadFile, createSignedUrl, removeFiles } from '@/lib/adapters/supabaseStorage';
import {
  ensureMutation,
  RepositoryError,
  unwrapMaybeSingle,
} from '@/lib/adapters/supabaseAdapter';
import { ensureCompanyScope, ensureIdentifier } from '@/lib/middlewares/ensureCompanyScope';
import { supabase } from '@/lib/supabase';
import {
  deleteDocumentFile,
  getDocumentFileById,
} from '@/lib/repositories/documentsRepository';
import type {
  DocumentFile,
  DocumentFileInsert,
} from '@/types/db';
import type { SignedUrlOptions, SignedUrlResult, StorageFile, StorageUploadOptions } from '@/types/storage';

const sanitizeFileName = (fileName: string): string => fileName.trim().replace(/\s+/g, '-');

const buildDocumentFilePath = ({
  companyId,
  documentId,
  version,
  fileName,
}: {
  companyId: string;
  documentId: string;
  version: number;
  fileName: string;
}): string => `company/${companyId}/documents/${documentId}/${version}/${sanitizeFileName(fileName)}`;

const fetchLatestVersion = async (documentId: string): Promise<number> => {
  const response = await supabase
    .from<{ version: number }>('document_files')
    .select('version')
    .eq('document_id', ensureIdentifier(documentId, 'documentId'))
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  const record = unwrapMaybeSingle(response, 'Unable to determine document file version');
  return record?.version ?? 0;
};

export const getNextDocumentFileVersion = async (
  documentId: string,
): Promise<number> => {
  const latest = await fetchLatestVersion(documentId);
  return latest + 1;
};

export interface UploadDocumentFileParams {
  companyId: string;
  documentId: string;
  uploadedBy?: string | null;
  templateId?: string | null;
  version?: number;
  file: StorageFile;
  fileName: string;
  fileSize?: number | null;
  contentType?: string;
  checksum?: string | null;
  storageOptions?: StorageUploadOptions;
}

export const uploadDocumentFile = async (
  params: UploadDocumentFileParams,
): Promise<DocumentFile> => {
  const companyId = ensureCompanyScope(params.companyId);
  const documentId = ensureIdentifier(params.documentId, 'documentId');
  const version = params.version ?? (await getNextDocumentFileVersion(documentId));
  const path = buildDocumentFilePath({
    companyId,
    documentId,
    version,
    fileName: params.fileName,
  });

  await uploadFile('documents', path, params.file, {
    cacheControl: params.storageOptions?.cacheControl,
    contentType: params.contentType,
    metadata: params.storageOptions?.metadata,
    upsert: params.storageOptions?.upsert ?? false,
  });

  const payload: DocumentFileInsert = {
    company_id: companyId,
    document_id: documentId,
    template_id: params.templateId ?? null,
    file_path: path,
    file_size: params.fileSize ?? null,
    content_type: params.contentType ?? null,
    version,
    uploaded_by: params.uploadedBy ?? null,
    checksum: params.checksum ?? null,
  };

  const response = await supabase
    .from<DocumentFile>('document_files')
    .insert(payload)
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to persist document file metadata');
};

export const createDocumentFileSignedUrl = async (
  path: string,
  options: SignedUrlOptions,
): Promise<SignedUrlResult> => {
  const filePath = ensureIdentifier(path, 'filePath');
  return createSignedUrl('documents', filePath, options);
};

export const removeDocumentFileAssets = async (paths: string[]): Promise<void> => {
  await removeFiles('documents', paths);
};

export const deleteDocumentFileWithAsset = async (
  companyId: string,
  fileId: string,
): Promise<void> => {
  const record = await getDocumentFileById(companyId, fileId);

  if (!record.file_path) {
    throw new RepositoryError('Document file path is missing', { status: 400 });
  }

  await removeDocumentFileAssets([record.file_path]);
  await deleteDocumentFile(companyId, fileId);
};
