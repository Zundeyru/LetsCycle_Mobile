import type { JsonDatabase, StoredSession } from '@/server/db/JsonDatabase';
import type { ISessionRepository } from '@/server/repositories/types';

export class SessionRepository implements ISessionRepository {
  constructor(private readonly db: JsonDatabase) {}

  create(session: StoredSession): Promise<void> {
    return this.db.transaction((data) => {
      const now = Date.now();
      // Sekalian bersihkan sesi yang sudah kedaluwarsa.
      data.sessions = data.sessions.filter((saved) => Date.parse(saved.expiresAt) > now);
      data.sessions.push(session);
    });
  }

  findActive(tokenHash: string, now: Date): Promise<StoredSession | null> {
    return this.db.read(
      (data) =>
        data.sessions.find(
          (session) => session.tokenHash === tokenHash && Date.parse(session.expiresAt) > now.getTime(),
        ) ?? null,
    );
  }

  delete(tokenHash: string): Promise<void> {
    return this.db.transaction((data) => {
      data.sessions = data.sessions.filter((session) => session.tokenHash !== tokenHash);
    });
  }
}
