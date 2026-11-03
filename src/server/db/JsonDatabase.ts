/// <reference types="node" />
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { ServerConfig } from '@/server/config';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  /** Nama file foto profil buatan server, bila ada. */
  avatarFileName?: string;
  avatarMimeType?: PhotoMimeType;
  avatarUpdatedAt?: string;
}

export interface StoredSession {
  /** SHA-256 dari token; token asli tidak pernah disimpan. */
  tokenHash: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export type PhotoMimeType = 'image/jpeg' | 'image/png' | 'image/webp';

export interface StoredPhoto {
  id: string;
  userId: string;
  /** Nama file dibuat server (UUID + ekstensi), tidak pernah dari client. */
  fileName: string;
  mimeType: PhotoMimeType;
  size: number;
  createdAt: string;
}

export interface DatabaseSchema {
  users: StoredUser[];
  sessions: StoredSession[];
  photos: StoredPhoto[];
}

const emptyDatabase = (): DatabaseSchema => ({ users: [], sessions: [], photos: [] });

/**
 * Database file JSON sederhana untuk pengembangan. Semua operasi diserialkan
 * agar tidak ada penulisan yang saling menimpa, dan file ditulis secara atomik
 * (tulis ke file sementara lalu rename).
 *
 * Untuk produksi (mis. EAS Hosting tanpa filesystem permanen), ganti
 * repository di src/server/repositories dengan database sungguhan.
 */
export class JsonDatabase {
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly filePath: string) {}

  read<T>(selector: (data: DatabaseSchema) => T): Promise<T> {
    return this.enqueue(async () => selector(await this.load()));
  }

  transaction<T>(mutate: (data: DatabaseSchema) => T): Promise<T> {
    return this.enqueue(async () => {
      const data = await this.load();
      const result = mutate(data);
      await this.persist(data);
      return result;
    });
  }

  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    const run = this.queue.then(task, task);
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async load(): Promise<DatabaseSchema> {
    try {
      const parsed = JSON.parse(await readFile(this.filePath, 'utf8')) as Partial<DatabaseSchema>;
      return { users: parsed.users ?? [], sessions: parsed.sessions ?? [], photos: parsed.photos ?? [] };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return emptyDatabase();
      throw error;
    }
  }

  private async persist(data: DatabaseSchema): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    const tempPath = `${this.filePath}.${process.pid}.tmp`;
    await writeFile(tempPath, JSON.stringify(data, null, 2), { encoding: 'utf8', mode: 0o600 });
    await rename(tempPath, this.filePath);
  }
}

const globalForDb = globalThis as typeof globalThis & { __letcycleDb?: JsonDatabase };

/** Satu instance per proses, tetap sama saat dev server melakukan hot reload. */
export function getDatabase(): JsonDatabase {
  globalForDb.__letcycleDb ??= new JsonDatabase(path.resolve(ServerConfig.dataDir, 'db.json'));
  return globalForDb.__letcycleDb;
}
