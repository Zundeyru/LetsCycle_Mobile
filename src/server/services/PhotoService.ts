import { AuthError } from '@/shared/errors';
import type { PhotoDto } from '@/shared/types/photos';
import { ServerConfig } from '@/server/config';
import type { StoredPhoto } from '@/server/db/JsonDatabase';
import type { IPhotoFileStorage, IPhotoRepository } from '@/server/repositories/types';
import { extensionByMime, validateImage } from '@/server/security/imageType';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function toPhotoDto(photo: StoredPhoto): PhotoDto {
  return {
    id: photo.id,
    mimeType: photo.mimeType,
    size: photo.size,
    createdAt: photo.createdAt,
    url: `/api/photos/${photo.id}`,
  };
}

function notFound(): AuthError {
  // Sama untuk "tidak ada" dan "milik orang lain" agar ID foto orang lain tidak bisa ditebak.
  return new AuthError('Foto tidak ditemukan.', 'NOT_FOUND');
}

export class PhotoService {
  constructor(
    private readonly photos: IPhotoRepository,
    private readonly files: IPhotoFileStorage,
  ) {}

  async upload(userId: string, bytes: Uint8Array): Promise<PhotoDto> {
    const mimeType = validateImage(bytes);
    const id = crypto.randomUUID();
    const photo: StoredPhoto = {
      id,
      userId,
      fileName: `${id}.${extensionByMime[mimeType]}`,
      mimeType,
      size: bytes.length,
      createdAt: new Date().toISOString(),
    };

    await this.files.save(photo.fileName, bytes);
    try {
      await this.photos.create(photo, ServerConfig.photos.maxPerUser);
    } catch (error) {
      // Jangan tinggalkan file yatim bila metadata gagal disimpan.
      await this.files.delete(photo.fileName);
      throw error;
    }
    return toPhotoDto(photo);
  }

  async list(userId: string): Promise<PhotoDto[]> {
    return (await this.photos.listByUser(userId)).map(toPhotoDto);
  }

  async read(userId: string, id: string): Promise<{ photo: StoredPhoto; bytes: Uint8Array }> {
    if (!uuidPattern.test(id)) throw notFound();
    const photo = await this.photos.findForUser(userId, id);
    if (!photo) throw notFound();
    return { photo, bytes: await this.files.read(photo.fileName) };
  }

  async delete(userId: string, id: string): Promise<void> {
    if (!uuidPattern.test(id)) throw notFound();
    const removed = await this.photos.delete(userId, id);
    if (!removed) throw notFound();
    await this.files.delete(removed.fileName);
  }
}
