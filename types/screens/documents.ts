import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export const DOCUMENT_TYPE_KEYS = ['legajo', 'recibos-anteriores', 'licencias', 'sanciones', 'otros'] as const;
export type DocumentTypeKey = (typeof DOCUMENT_TYPE_KEYS)[number];

export const DOCUMENT_TYPE_LABELS: Record<DocumentTypeKey, string> = {
  legajo: 'Legajo',
  'recibos-anteriores': 'Recibos Anteriores',
  licencias: 'Licencias',
  sanciones: 'Sanciones',
  otros: 'Otros',
};

export const DOCUMENT_TYPES = DOCUMENT_TYPE_KEYS.map((key) => ({
  key,
  label: DOCUMENT_TYPE_LABELS[key],
}));

export type DocumentRecord = {
  id: string;
  title: string;
  status: 'signed' | 'pending';
  category?: string;
  uri?: string;
};

type DocumentGroup = {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  documents: DocumentRecord[];
};

export const documentMockData: Record<DocumentTypeKey, DocumentGroup> = {
  legajo: {
    icon: 'folder',
    documents: [],
  },
  'recibos-anteriores': {
    icon: 'receipt-long',
    documents: [],
  },
  licencias: {
    icon: 'medical-services',
    documents: [
      {
        id: 'licencia-2024',
        title: 'Lic. 2024 - Santi Bancalari.pdf',
        status: 'signed',
        category: 'Vacaciones',
      },
    ],
  },
  sanciones: {
    icon: 'gavel',
    documents: [],
  },
  otros: {
    icon: 'insert-drive-file',
    documents: [],
  },
};

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
