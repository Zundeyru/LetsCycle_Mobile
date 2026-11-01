import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { PhotosApi } from '@/lib/api/photosApi';
import { TokenStorage } from '@/lib/storage/tokenStorage';
import { isAuthError } from '@/shared/errors';
import type { PhotoDto } from '@/shared/types/photos';

/** Daftar foto milik user dari API; dimuat ulang setiap layar kembali fokus (mis. setelah kamera ditutup). */
export function usePhotos() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<PhotoDto[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!user) {
      setPhotos([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Token hanya dipakai untuk memuat gambar (expo-image tidak lewat apiRequest).
      const sessionToken = await TokenStorage.get();
      setToken(sessionToken);
      setPhotos((await PhotosApi.list()).photos);
    } catch (requestError) {
      setError(isAuthError(requestError) ? requestError.message : 'Gagal memuat foto.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const remove = useCallback(
    async (id: string) => {
      await PhotosApi.remove(id);
      setPhotos((current) => current.filter((photo) => photo.id !== id));
    },
    [],
  );

  return { photos, token, loading, error, refresh, remove };
}
