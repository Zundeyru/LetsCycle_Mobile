import { useSyncExternalStore } from 'react';

export interface CapturedPhoto {
  uri: string;
  width: number;
  height: number;
  takenAt: string;
}

let current: CapturedPhoto | null = null;
const listeners = new Set<() => void>();

/** Menyimpan foto terakhir dari layar kamera agar bisa dipakai layar pemanggil. */
export const CapturedPhotoStore = {
  set(photo: CapturedPhoto | null) {
    current = photo;
    listeners.forEach((listener) => listener());
  },
  get: () => current,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useCapturedPhoto(): CapturedPhoto | null {
  return useSyncExternalStore(CapturedPhotoStore.subscribe, CapturedPhotoStore.get, CapturedPhotoStore.get);
}
