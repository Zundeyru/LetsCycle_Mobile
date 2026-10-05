import * as Crypto from 'expo-crypto';

import { User } from '@/models/User';
import type { IFileStorage } from '@/types/IFileStorage';
import type { IUserRepository } from '@/types/IUserRepository';
import { AuthError } from '@/types/AuthError';
import { AuthValidator } from '@/validators/AuthValidator';

const SESSION_FILE = 'session.txt';

export class AuthService {
  constructor(
    private readonly users: IUserRepository,
    private readonly storage: IFileStorage,
  ) {}

  async register(name: string, email: string, password: string, confirmation: string): Promise<User> {
    AuthValidator.validateRegistration(name, email, password, confirmation);
    const normalizedEmail = email.trim().toLowerCase();
    if (await this.users.findByEmail(normalizedEmail)) {
      throw new AuthError('Email ini sudah terdaftar.', 'EMAIL_TAKEN');
    }

    const salt = Crypto.randomUUID();
    const passwordHash = await this.hashPassword(password, salt);
    const user = new User(
      Crypto.randomUUID(),
      name.trim(),
      normalizedEmail,
      `${salt}$${passwordHash}`,
      new Date().toISOString(),
    );
    await this.users.save(user);
    await this.storage.write(SESSION_FILE, user.getId());
    return user;
  }

  async login(email: string, password: string): Promise<User> {
    AuthValidator.validateLogin(email, password);
    const user = await this.users.findByEmail(email.trim().toLowerCase());
    if (!user) throw new AuthError('Email atau kata sandi salah.', 'INVALID_CREDENTIALS');

    const [salt, expectedHash] = user.getPasswordHash().split('$');
    if (!salt || !expectedHash || (await this.hashPassword(password, salt)) !== expectedHash) {
      throw new AuthError('Email atau kata sandi salah.', 'INVALID_CREDENTIALS');
    }

    await this.storage.write(SESSION_FILE, user.getId());
    return user;
  }

  async logout(): Promise<void> {
    await this.storage.write(SESSION_FILE, '');
  }

  async getCurrentUser(): Promise<User | null> {
    const userId = (await this.storage.read(SESSION_FILE)).trim();
    if (!userId) return null;

    const user = await this.users.findById(userId);
    if (!user) throw new AuthError('Sesi akun tidak valid. Silakan masuk kembali.', 'SESSION_INVALID');
    return user;
  }

  private hashPassword(password: string, salt: string): Promise<string> {
    return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
  }
}
