export const DOCUMENT_TYPE_KEYS = [
  'legajo',
  'recibos-anteriores',
  'licencias',
  'sanciones',
  'otros',
] as const;

export type DocumentTypeKey = (typeof DOCUMENT_TYPE_KEYS)[number];

export type PermissionRequestType = 'camera' | 'file';

export type SelectedFile = {
  uri: string;
  name: string;
  mimeType?: string | null;
  isImage: boolean;
};

export type PermissionPrompt = {
  type: PermissionRequestType;
  onAllow: () => Promise<void>;
};

export type PermissionPromptState = PermissionPrompt | null;

export type UploadFormValues = {
  documentType: DocumentTypeKey;
  notes?: string;
  fileUri: string;
};
