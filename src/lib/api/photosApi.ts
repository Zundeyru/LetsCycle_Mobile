import { Platform } from 'react-native';

import type { PhotoDto, PhotoListResponse, PhotoUploadResponse } from '@/shared/types/photos';

import { getApiBaseUrl } from './baseUrl';
import { apiRequest } from './client';

async function buildPhotoForm(localUri: string): Promise<FormData> {
  const form = new FormData();
  if (Platform.OS === 'web') {
    // Di web, kamera mengembalikan data URI base64; ubah ke Blob dulu.
    const blob = await (await fetch(localUri)).blob();
    form.append('photo', blob, 'photo.jpg');
  } else {
    // React Native mengirim file langsung dari path lokal tanpa memuatnya ke memori JS.
    form.append('photo', { uri: localUri, name: 'photo.jpg', type: 'image/jpeg' } as unknown as Blob);
  }
  return form;
}

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
