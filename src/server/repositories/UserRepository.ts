import { AuthError } from '@/shared/errors';
import type { JsonDatabase, PhotoMimeType, StoredUser } from '@/server/db/JsonDatabase';
import type { IUserRepository } from '@/server/repositories/types';

export class UserRepository implements IUserRepository {
  constructor(private readonly db: JsonDatabase) {}

  findByEmail(email: string): Promise<StoredUser | null> {
    return this.db.read((data) => data.users.find((user) => user.email === email) ?? null);
  }

  findById(id: string): Promise<StoredUser | null> {
    return this.db.read((data) => data.users.find((user) => user.id === id) ?? null);
  }

  create(user: StoredUser): Promise<void> {
    return this.db.transaction((data) => {
      // Dicek di dalam transaksi agar dua pendaftaran bersamaan tidak lolos.
      if (data.users.some((saved) => saved.email === user.email)) {
        throw new AuthError('Email ini sudah terdaftar.', 'EMAIL_TAKEN');
      }
      data.users.push(user);
    });
  }

  setAvatar(
    userId: string,
    avatar: { fileName: string; mimeType: PhotoMimeType } | null,
  ): Promise<{ user: StoredUser; previousFileName?: string }> {
    return this.db.transaction((data) => {
      const user = data.users.find((saved) => saved.id === userId);
      if (!user) throw new AuthError('Sesi berakhir. Silakan masuk kembali.', 'UNAUTHORIZED');

      const previousFileName = user.avatarFileName;
      if (avatar) {
        user.avatarFileName = avatar.fileName;
        user.avatarMimeType = avatar.mimeType;
        user.avatarUpdatedAt = new Date().toISOString();
      } else {
        delete user.avatarFileName;
        delete user.avatarMimeType;
        delete user.avatarUpdatedAt;
      }
      return { user: { ...user }, previousFileName };
    });
  }
}
