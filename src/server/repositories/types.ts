import type { StoredPhoto, StoredSession, StoredUser } from '@/server/db/JsonDatabase';

export interface IPhotoRepository {
  /** Terbaru lebih dulu. */
  listByUser(userId: string): Promise<StoredPhoto[]>;
  /** Hanya mengembalikan foto milik user tersebut. */
  findForUser(userId: string, id: string): Promise<StoredPhoto | null>;
  /** Melempar AuthError QUOTA_EXCEEDED bila jumlah foto user sudah maksimal. */
  create(photo: StoredPhoto, maxPerUser: number): Promise<void>;
  delete(userId: string, id: string): Promise<StoredPhoto | null>;
}

/** Penyimpanan isi file foto (lokal sekarang; bisa diganti S3/R2 nanti). */
export interface IPhotoFileStorage {
  save(fileName: string, bytes: Uint8Array): Promise<void>;
  read(fileName: string): Promise<Uint8Array>;
  delete(fileName: string): Promise<void>;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<StoredUser | null>;
  findById(id: string): Promise<StoredUser | null>;
  /** Melempar AuthError EMAIL_TAKEN bila email sudah dipakai. */
  create(user: StoredUser): Promise<void>;
}

export interface ISessionRepository {
  create(session: StoredSession): Promise<void>;
  /** Mengembalikan sesi yang belum kedaluwarsa, atau null. */
  findActive(tokenHash: string, now: Date): Promise<StoredSession | null>;
  delete(tokenHash: string): Promise<void>;
}
