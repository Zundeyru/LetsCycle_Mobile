import type { PhotoDto, PhotoListResponse, PhotoUploadResponse } from '@/shared/types/photos';

import { getApiBaseUrl } from './baseUrl';
import { apiRequest } from './client';
import { buildPhotoForm } from './photoForm';

export const PhotosApi = {
  list: () => apiRequest<PhotoListResponse>('/api/photos'),

  async upload(localUri: string): Promise<PhotoDto> {
    const form = await buildPhotoForm(localUri);
    return (await apiRequest<PhotoUploadResponse>('/api/photos', { method: 'POST', form })).photo;
  },

  remove: (id: string) =>
    apiRequest<{ success: true }>(`/api/photos/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  /** Source untuk expo-image: native mengirim token lewat header, web memakai cookie sesi. */
  imageSource: (token: string | null, photo: PhotoDto) => ({
    uri: `${getApiBaseUrl()}${photo.url}`,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cacheKey: photo.id,
  }),
};
