export type StorageBucket = 'documents' | 'paychecks' | 'avatars';

export type StorageFile =
  | Blob
  | File
  | ArrayBuffer
  | Uint8Array
  | Int8Array
  | Uint16Array
  | Int16Array
  | Uint32Array
  | Int32Array
  | Float32Array
  | Float64Array
  | DataView;

export interface StorageUploadOptions {
  cacheControl?: string;
  contentType?: string;
  metadata?: Record<string, string>;
  upsert?: boolean;
}

export interface StorageUploadResult {
  path: string;
  fullPath: string;
  bucket: StorageBucket;
}

export interface SignedUrlOptions {
  download?: boolean;
  fileName?: string;
  expiresIn: number;
  transform?: {
    width?: number;
    height?: number;
    resize?: 'cover' | 'contain' | 'fill';
    quality?: number;
    format?: 'origin' | 'webp' | 'png' | 'jpg';
  };
}

export interface SignedUrlResult {
  signedUrl: string;
  path: string;
  bucket: StorageBucket;
  expiresAt: number;
}

export interface StorageRemoveResult {
  path: string;
  bucket: StorageBucket;
}
