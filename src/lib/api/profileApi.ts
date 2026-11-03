import type { MeResponse, PublicUser } from '@/shared/types/auth';

import { getApiBaseUrl } from './baseUrl';
import { apiRequest } from './client';
import { buildPhotoForm } from './photoForm';

export const ProfileApi = {
  // Token Bearer disisipkan otomatis oleh request interceptor di client.ts.
  async updateAvatar(localUri: string): Promise<PublicUser> {
    const form = await buildPhotoForm(localUri);
    return (await apiRequest<MeResponse>('/api/profile/avatar', { method: 'PUT', form })).user;
  },

  async removeAvatar(): Promise<PublicUser> {
    return (await apiRequest<MeResponse>('/api/profile/avatar', { method: 'DELETE' })).user;
  },

  /** Source expo-image untuk foto profil (tidak lewat apiRequest, jadi token dipasang di sini). */
  avatarSource(token: string | null, user: PublicUser) {
    if (!user.avatarUrl) return null;
    return {
      uri: `${getApiBaseUrl()}${user.avatarUrl}`,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cacheKey: `avatar-${user.id}-${user.avatarUrl}`,
    };
  },
};
