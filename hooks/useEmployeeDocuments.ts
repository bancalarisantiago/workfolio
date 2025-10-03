import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  createDocumentFileSignedUrl,
  getDocumentFilesByDocumentIds,
  getDocumentsForEmployee,
} from '@/lib/repositories';
import type { Document, DocumentFile } from '@/types/db';
import type { DocumentGroup, DocumentRecord, DocumentTypeKey } from '@/types/screens/documents';
import {
  createEmptyDocumentGroups,
  DOCUMENT_TYPE_LABELS,
  normalizeDocumentTypeKey,
} from '@/types/screens/documents';

import { useEmployeeContext } from './useEmployeeContext';

const mapFilesByDocument = (files: DocumentFile[]): Map<string, DocumentFile> => {
  const latest = new Map<string, DocumentFile>();

  for (const file of files) {
    const documentId = file.document_id;
    if (!documentId) {
      continue;
    }

    const existing = latest.get(documentId);
    if (!existing) {
      latest.set(documentId, file);
      continue;
    }

    if (file.version > existing.version) {
      latest.set(documentId, file);
      continue;
    }

    if (file.version === existing.version) {
      const existingDate = existing.uploaded_at ? new Date(existing.uploaded_at).getTime() : 0;
      const candidateDate = file.uploaded_at ? new Date(file.uploaded_at).getTime() : 0;
      if (candidateDate > existingDate) {
        latest.set(documentId, file);
      }
    }
  }

  return latest;
};

const buildDocumentRecord = (
  document: Document,
  file: DocumentFile | undefined,
): DocumentRecord => {
  const metadata = (document.metadata ?? {}) as Record<string, unknown>;
  const categoryRaw = (metadata.categoryKey ?? metadata.category_key) as string | undefined;
  const categoryKey = normalizeDocumentTypeKey(categoryRaw);
  const categoryLabel = DOCUMENT_TYPE_LABELS[categoryKey];
  const notes = typeof metadata.notes === 'string' ? metadata.notes : null;

  return {
    id: document.id,
    title: document.title,
    status: document.status,
    categoryKey,
    categoryLabel,
    notes,
    fileId: file?.id ?? null,
    filePath: file?.file_path ?? null,
    fileVersion: file?.version ?? null,
    contentType: file?.content_type ?? null,
    uploadedAt: file?.uploaded_at ?? null,
  };
};

const groupDocuments = (records: DocumentRecord[]): DocumentGroup[] => {
  const baseMap = new Map<DocumentTypeKey, DocumentGroup>(
    createEmptyDocumentGroups().map((group) => [group.key, { ...group }]),
  );

  for (const record of records) {
    const group = baseMap.get(record.categoryKey);
    if (group) {
      group.documents.push(record);
    } else {
      const fallback = baseMap.get('otros');
      fallback?.documents.push(record);
    }
  }

  return Array.from(baseMap.values());
};

export type EmployeeDocumentsValue = {
  companyId: string | null;
  employeeId: string | null;
  documents: DocumentRecord[];
  groups: DocumentGroup[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  downloadDocument: (record: DocumentRecord) => Promise<string>;
};

export function useEmployeeDocuments(): EmployeeDocumentsValue {
  const { companyId, employeeId, isLoading: isContextLoading, error: contextError } =
    useEmployeeContext();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [groups, setGroups] = useState<DocumentGroup[]>(createEmptyDocumentGroups);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!companyId || !employeeId) {
      setDocuments([]);
      setGroups(createEmptyDocumentGroups());
      setError(contextError ?? null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const docs = await getDocumentsForEmployee(companyId, employeeId);
      const documentIds = docs.map((doc) => doc.id);

      const files =
        documentIds.length > 0
          ? await getDocumentFilesByDocumentIds(companyId, documentIds)
          : ([] as DocumentFile[]);

      const fileMap = mapFilesByDocument(files);
      const records = docs.map((doc) => buildDocumentRecord(doc, fileMap.get(doc.id)));
      records.sort((a, b) => {
        const aDate = a.uploadedAt ?? null;
        const bDate = b.uploadedAt ?? null;
        if (!aDate && !bDate) {
          return 0;
        }
        if (!aDate) {
          return 1;
        }
        if (!bDate) {
          return -1;
        }
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });

      setDocuments(records);
      setGroups(groupDocuments(records));
    } catch (unknownError) {
      const message =
        unknownError instanceof Error ? unknownError.message : 'No pudimos cargar tus documentos.';
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

  const downloadDocument = useCallback(
    async (record: DocumentRecord) => {
      if (!record.filePath) {
        throw new Error('El documento no tiene un archivo asociado.');
      }

      const result = await createDocumentFileSignedUrl(record.filePath, {
        expiresIn: 60,
        download: true,
        fileName: record.title,
      });

      return result.signedUrl;
    },
    [],
  );

  return {
    companyId,
    employeeId,
    documents,
    groups,
    isLoading: isLoading || isContextLoading,
    error: error ?? contextError ?? null,
    refresh,
    downloadDocument,
  };
}
