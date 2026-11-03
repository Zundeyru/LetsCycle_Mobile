import { AuthError } from '@/shared/errors';
import { ServerConfig } from '@/server/config';
import type { PhotoMimeType } from '@/server/db/JsonDatabase';

export const extensionByMime: Record<PhotoMimeType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

/**
 * Menentukan jenis gambar dari isi file (magic bytes), bukan dari nama file
 * atau Content-Type kiriman client yang bisa dipalsukan.
 */
export function detectImageType(bytes: Uint8Array): PhotoMimeType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
    return 'image/webp';
  }
  return null;
}

/** Validasi ukuran & jenis gambar; mengembalikan MIME hasil deteksi isi file. */
export function validateImage(bytes: Uint8Array): PhotoMimeType {
  if (bytes.length === 0) throw new AuthError('File foto kosong.', 'VALIDATION');
  if (bytes.length > ServerConfig.photos.maxBytes) {
    throw new AuthError('Ukuran foto maksimal 5 MB.', 'PAYLOAD_TOO_LARGE');
  }
  const mimeType = detectImageType(bytes);
  if (!mimeType) {
    throw new AuthError('Format foto harus JPG, PNG, atau WebP.', 'UNSUPPORTED_MEDIA_TYPE');
  }
  return mimeType;
}

/** Nama file acak buatan server; tidak pernah memakai nama dari client. */
export function generateImageFileName(mimeType: PhotoMimeType): string {
  return `${crypto.randomUUID()}.${extensionByMime[mimeType]}`;
}
