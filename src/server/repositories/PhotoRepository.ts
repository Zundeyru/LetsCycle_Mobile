import { AuthError } from '@/shared/errors';
import type { JsonDatabase, StoredPhoto } from '@/server/db/JsonDatabase';
import type { IPhotoRepository } from '@/server/repositories/types';

export class PhotoRepository implements IPhotoRepository {
  constructor(private readonly db: JsonDatabase) {}

  listByUser(userId: string): Promise<StoredPhoto[]> {
    return this.db.read((data) =>
      data.photos
        .filter((photo) => photo.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  }

  findForUser(userId: string, id: string): Promise<StoredPhoto | null> {
    return this.db.read(
      (data) => data.photos.find((photo) => photo.id === id && photo.userId === userId) ?? null,
    );
  }

  create(photo: StoredPhoto, maxPerUser: number): Promise<void> {
    return this.db.transaction((data) => {
      // Kuota dicek di dalam transaksi agar upload paralel tidak bisa melewatinya.
      if (data.photos.filter((saved) => saved.userId === photo.userId).length >= maxPerUser) {
        throw new AuthError(`Batas ${maxPerUser} foto tercapai. Hapus foto lama dulu.`, 'QUOTA_EXCEEDED');
      }
      data.photos.push(photo);
    });
  }

  delete(userId: string, id: string): Promise<StoredPhoto | null> {
    return this.db.transaction((data) => {
      const index = data.photos.findIndex((photo) => photo.id === id && photo.userId === userId);
      if (index < 0) return null;
      const [removed] = data.photos.splice(index, 1);
      return removed;
    });
  }
}
