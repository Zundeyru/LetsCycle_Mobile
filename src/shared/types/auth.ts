import type { AuthErrorCode } from '@/shared/errors';

/** Data akun yang aman dikirim ke client (tanpa hash password). */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmation: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthSessionResponse {
  user: PublicUser;
  token: string;
  expiresAt: string;
}

export interface MeResponse {
  user: PublicUser;
}

export interface ApiErrorBody {
  error: { code: AuthErrorCode; message: string };
}
