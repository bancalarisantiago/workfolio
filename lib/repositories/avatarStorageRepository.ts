import { uploadFile, createSignedUrl, removeFiles, getPublicUrl } from '@/lib/adapters/supabaseStorage';
import { RepositoryError } from '@/lib/adapters/supabaseAdapter';
import { ensureIdentifier } from '@/lib/middlewares/ensureCompanyScope';
import {
  getUserProfileById,
  updateUserProfile,
} from '@/lib/repositories/userRepository';
import type { UserProfile } from '@/types/db';
import type { SignedUrlOptions, SignedUrlResult, StorageFile, StorageUploadOptions } from '@/types/storage';

const sanitizeFileName = (fileName: string): string => fileName.trim().replace(/\s+/g, '-');

const buildAvatarPath = ({
  userId,
  fileName,
}: {
  userId: string;
  fileName: string;
}): string => `users/${userId}/${Date.now()}-${sanitizeFileName(fileName)}`;

const extractStoredPath = (avatarUrl: string | null): string | null => {
  if (!avatarUrl) {
    return null;
  }

  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return null;
  }

  return avatarUrl;
};

export interface UploadAvatarParams {
  userId: string;
  file: StorageFile;
  fileName: string;
  contentType?: string;
  storageOptions?: StorageUploadOptions;
  usePublicUrl?: boolean;
  removePrevious?: boolean;
}

export interface UploadAvatarResult {
  profile: UserProfile;
  path: string;
  publicUrl?: string;
}

export const uploadAvatar = async (
  params: UploadAvatarParams,
): Promise<UploadAvatarResult> => {
  const userId = ensureIdentifier(params.userId, 'userId');
  const profile = await getUserProfileById(userId);
  const path = buildAvatarPath({ userId, fileName: params.fileName });

  await uploadFile('avatars', path, params.file, {
    cacheControl: params.storageOptions?.cacheControl,
    contentType: params.contentType,
    metadata: params.storageOptions?.metadata,
    upsert: params.storageOptions?.upsert ?? true,
  });

  const previousPath = extractStoredPath(profile.avatar_url);
  if (params.removePrevious !== false && previousPath && previousPath !== path) {
    await removeFiles('avatars', [previousPath]);
  }

  const updatedProfile = await updateUserProfile(userId, {
    avatar_url: params.usePublicUrl ? getPublicUrl('avatars', path) : path,
  });

  const result: UploadAvatarResult = {
    profile: updatedProfile,
    path,
  };

  if (params.usePublicUrl) {
    result.publicUrl = updatedProfile.avatar_url ?? undefined;
  }

  return result;
};

export const createAvatarSignedUrl = async (
  userId: string,
  options: SignedUrlOptions,
): Promise<SignedUrlResult> => {
  const profile = await getUserProfileById(ensureIdentifier(userId, 'userId'));
  const storedPath = extractStoredPath(profile.avatar_url);

  if (!storedPath) {
    throw new RepositoryError('Avatar not found or stored as external URL', { status: 404 });
  }

  return createSignedUrl('avatars', storedPath, options);
};

export const deleteAvatar = async (userId: string): Promise<UserProfile> => {
  const profile = await getUserProfileById(ensureIdentifier(userId, 'userId'));
  const storedPath = extractStoredPath(profile.avatar_url);

  if (storedPath) {
    await removeFiles('avatars', [storedPath]);
  }

  return updateUserProfile(profile.user_id, {
    avatar_url: null,
  });
};
