import { AuthError } from '@/shared/errors';
import type { JsonDatabase, StoredUser } from '@/server/db/JsonDatabase';
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
}
