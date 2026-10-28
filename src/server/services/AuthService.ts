import { AuthError } from '@/shared/errors';
import type { AuthSessionResponse, PublicUser } from '@/shared/types/auth';
import { AuthValidator } from '@/shared/validators/authValidator';
import { ServerConfig } from '@/server/config';
import type { StoredUser } from '@/server/db/JsonDatabase';
import type { ISessionRepository, IUserRepository } from '@/server/repositories/types';
import { randomBytes, sha256Hex, toBase64Url } from '@/server/security/crypto';
import { getDummyPasswordHash, hashPassword, verifyPassword } from '@/server/security/password';

export function toPublicUser(user: StoredUser): PublicUser {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

export class AuthService {
  constructor(
    private readonly users: IUserRepository,
    private readonly sessions: ISessionRepository,
  ) {}

  async register(input: Record<string, unknown>): Promise<AuthSessionResponse> {
    const { name, email, password } = AuthValidator.validateRegistration(input);
    if (await this.users.findByEmail(email)) {
      throw new AuthError('Email ini sudah terdaftar.', 'EMAIL_TAKEN');
    }

    const user: StoredUser = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    await this.users.create(user);
    return this.startSession(user);
  }

  async login(input: Record<string, unknown>): Promise<AuthSessionResponse> {
    const { email, password } = AuthValidator.validateLogin(input);
    const user = await this.users.findByEmail(email);
    const passwordHash = user?.passwordHash ?? (await getDummyPasswordHash());
    const valid = await verifyPassword(password, passwordHash);

    if (!user || !valid) {
      throw new AuthError('Email atau kata sandi salah.', 'INVALID_CREDENTIALS');
    }
    return this.startSession(user);
  }

  async logout(token: string): Promise<void> {
    await this.sessions.delete(await sha256Hex(token));
  }

  async authenticate(token: string | null): Promise<StoredUser> {
    if (!token) throw new AuthError('Silakan masuk terlebih dahulu.', 'UNAUTHORIZED');

    const session = await this.sessions.findActive(await sha256Hex(token), new Date());
    const user = session ? await this.users.findById(session.userId) : null;
    if (!user) throw new AuthError('Sesi berakhir. Silakan masuk kembali.', 'UNAUTHORIZED');
    return user;
  }

  private async startSession(user: StoredUser): Promise<AuthSessionResponse> {
    const token = toBase64Url(randomBytes(32));
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ServerConfig.session.ttlMs).toISOString();

    await this.sessions.create({
      tokenHash: await sha256Hex(token),
      userId: user.id,
      createdAt: now.toISOString(),
      expiresAt,
    });
    return { user: toPublicUser(user), token, expiresAt };
  }
}
