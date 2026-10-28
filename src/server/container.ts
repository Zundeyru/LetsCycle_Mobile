import path from 'node:path';

import { ServerConfig } from '@/server/config';
import { getDatabase } from '@/server/db/JsonDatabase';
import { PhotoRepository } from '@/server/repositories/PhotoRepository';
import { SessionRepository } from '@/server/repositories/SessionRepository';
import { UserRepository } from '@/server/repositories/UserRepository';
import { RateLimiter } from '@/server/security/rateLimiter';
import { AuthService } from '@/server/services/AuthService';
import { PhotoService } from '@/server/services/PhotoService';
import { LocalPhotoStorage } from '@/server/storage/LocalPhotoStorage';

interface Container {
  authService: AuthService;
  photoService: PhotoService;
  rateLimiter: RateLimiter;
}

const globalForContainer = globalThis as typeof globalThis & { __letcycleContainer?: Container };

/** Tempat merakit dependency backend. Ganti repository/storage di sini untuk pindah database. */
export function getContainer(): Container {
  if (!globalForContainer.__letcycleContainer) {
    const db = getDatabase();
    globalForContainer.__letcycleContainer = {
      authService: new AuthService(new UserRepository(db), new SessionRepository(db)),
      photoService: new PhotoService(
        new PhotoRepository(db),
        new LocalPhotoStorage(path.resolve(ServerConfig.dataDir, 'uploads')),
      ),
      rateLimiter: new RateLimiter(ServerConfig.rateLimit.windowMs),
    };
  }
  return globalForContainer.__letcycleContainer;
}
