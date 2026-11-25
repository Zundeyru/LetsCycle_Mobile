import type { DepositStatus } from '@/shared/types/deposits';
import type { PhotoMimeType, StoredDeposit, StoredPhoto, StoredSession, StoredUser } from '@/server/db/JsonDatabase';

export interface IDepositRepository {
  /** Terbaru lebih dulu. */
  listByUser(userId: string): Promise<StoredDeposit[]>;
  /** Melempar AuthError QUOTA_EXCEEDED bila jumlah setoran user sudah maksimal. */
  create(deposit: StoredDeposit, maxPerUser: number): Promise<void>;
  /** Hanya mengubah setoran milik user tersebut; null bila tidak ditemukan. */
  updateStatus(userId: string, id: string, status: DepositStatus): Promise<StoredDeposit | null>;
}

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
  /** Mengganti/menghapus foto profil; mengembalikan user baru dan nama file lama (untuk dihapus). */
  setAvatar(
    userId: string,
    avatar: { fileName: string; mimeType: PhotoMimeType } | null,
  ): Promise<{ user: StoredUser; previousFileName?: string }>;
}

export interface ISessionRepository {
  create(session: StoredSession): Promise<void>;
  /** Mengembalikan sesi yang belum kedaluwarsa, atau null. */
  findActive(tokenHash: string, now: Date): Promise<StoredSession | null>;
  delete(tokenHash: string): Promise<void>;
}
