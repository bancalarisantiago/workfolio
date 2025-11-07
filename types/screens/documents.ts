import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import type { DocumentStatus } from '@/types/db';

export const DOCUMENT_TYPE_KEYS = ['legajo', 'recibos-anteriores', 'licencias', 'sanciones', 'otros'] as const;
export type DocumentTypeKey = (typeof DOCUMENT_TYPE_KEYS)[number];

export const DOCUMENT_TYPE_LABELS: Record<DocumentTypeKey, string> = {
  legajo: 'Legajo',
  'recibos-anteriores': 'Recibos Anteriores',
  licencias: 'Licencias',
  sanciones: 'Sanciones',
  otros: 'Otros',
};

export const DOCUMENT_TYPE_ICONS: Record<DocumentTypeKey, React.ComponentProps<typeof MaterialIcons>['name']> = {
  legajo: 'folder',
  'recibos-anteriores': 'receipt-long',
  licencias: 'medical-services',
  sanciones: 'gavel',
  otros: 'insert-drive-file',
};

export const DOCUMENT_TYPES = DOCUMENT_TYPE_KEYS.map((key) => ({
  key,
  label: DOCUMENT_TYPE_LABELS[key],
  icon: DOCUMENT_TYPE_ICONS[key],
}));

export const DEFAULT_DOCUMENT_TYPE: DocumentTypeKey = 'otros';

export const normalizeDocumentTypeKey = (value?: string | null): DocumentTypeKey => {
  if (!value) {
    return DEFAULT_DOCUMENT_TYPE;
  }

  return DOCUMENT_TYPE_KEYS.includes(value as DocumentTypeKey)
    ? (value as DocumentTypeKey)
    : DEFAULT_DOCUMENT_TYPE;
};

export type DocumentRecord = {
  id: string;
  title: string;
  status: DocumentStatus;
  categoryKey: DocumentTypeKey;
  categoryLabel: string;
  notes?: string | null;
  fileId: string | null;
  filePath: string | null;
  fileVersion: number | null;
  contentType: string | null;
  uploadedAt: string | null;
};

export type DocumentGroup = {
  key: DocumentTypeKey;
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  documents: DocumentRecord[];
};

export const createEmptyDocumentGroups = (): DocumentGroup[] =>
  DOCUMENT_TYPES.map(({ key, label, icon }) => ({
    key,
    label,
    icon,
    documents: [],
  }));

export type SelectedFile = {
  uri: string;
  name: string;
  mimeType?: string | null;
  isImage: boolean;
};

export type PermissionRequestType = 'camera' | 'file';

export type PermissionPrompt = {
  type: PermissionRequestType;
  onAllow: () => Promise<void>;
};

export type UploadFormValues = {
  documentType: DocumentTypeKey;
  notes?: string;
  fileUri: string;
};
