import { AuthError } from '@/shared/errors';
import type { PublicUser } from '@/shared/types/auth';
import type { StoredUser } from '@/server/db/JsonDatabase';
import type { IPhotoFileStorage, IUserRepository } from '@/server/repositories/types';
import { generateImageFileName, validateImage } from '@/server/security/imageType';
import { toPublicUser } from '@/server/services/AuthService';

export class ProfileService {
  constructor(
    private readonly users: IUserRepository,
    private readonly files: IPhotoFileStorage,
  ) {}

  async updateAvatar(userId: string, bytes: Uint8Array): Promise<PublicUser> {
    const mimeType = validateImage(bytes);
    const fileName = generateImageFileName(mimeType);

    await this.files.save(fileName, bytes);
    let result: Awaited<ReturnType<IUserRepository['setAvatar']>>;
    try {
      result = await this.users.setAvatar(userId, { fileName, mimeType });
    } catch (error) {
      await this.files.delete(fileName);
      throw error;
    }

    if (result.previousFileName) await this.files.delete(result.previousFileName);
    return toPublicUser(result.user);
  }

  async removeAvatar(userId: string): Promise<PublicUser> {
    const { user, previousFileName } = await this.users.setAvatar(userId, null);
    if (previousFileName) await this.files.delete(previousFileName);
    return toPublicUser(user);
  }

  async readAvatar(user: StoredUser): Promise<{ bytes: Uint8Array; mimeType: string }> {
    if (!user.avatarFileName || !user.avatarMimeType) {
      throw new AuthError('Foto profil belum diatur.', 'NOT_FOUND');
    }
    return { bytes: await this.files.read(user.avatarFileName), mimeType: user.avatarMimeType };
  }
}
