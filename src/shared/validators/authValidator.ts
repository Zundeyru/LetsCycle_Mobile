import { AuthError } from '@/shared/errors';
import type { LoginRequest, RegisterRequest } from '@/shared/types/auth';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AuthLimits = {
  nameMax: 100,
  emailMax: 254,
  passwordMin: 8,
  // Batas atas mencegah input raksasa membebani hashing di server.
  passwordMax: 128,
} as const;

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Dipakai di client (umpan balik cepat) dan di server (sumber kebenaran). */
export class AuthValidator {
  static validateRegistration(input: Partial<Record<keyof RegisterRequest, unknown>>): RegisterRequest {
    const { name, email, password, confirmation } = input;
    if (!isString(name) || !isString(email) || !isString(password) || !isString(confirmation)) {
      throw new AuthError('Semua kolom wajib diisi.', 'VALIDATION');
    }
    if (!name.trim() || !email.trim() || !password || !confirmation) {
      throw new AuthError('Semua kolom wajib diisi.', 'VALIDATION');
    }
    if (name.trim().length > AuthLimits.nameMax) {
      throw new AuthError(`Nama maksimal ${AuthLimits.nameMax} karakter.`, 'VALIDATION');
    }
    if (/[\u0000-\u001f\u007f<>]/.test(name)) {
      throw new AuthError('Nama mengandung karakter yang tidak diizinkan.', 'VALIDATION');
    }
    AuthValidator.validateEmail(email);
    if (password.length < AuthLimits.passwordMin) {
      throw new AuthError(`Kata sandi minimal ${AuthLimits.passwordMin} karakter.`, 'VALIDATION');
    }
    if (password.length > AuthLimits.passwordMax) {
      throw new AuthError(`Kata sandi maksimal ${AuthLimits.passwordMax} karakter.`, 'VALIDATION');
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      throw new AuthError('Kata sandi harus berisi huruf dan angka.', 'VALIDATION');
    }
    if (password !== confirmation) {
      throw new AuthError('Konfirmasi kata sandi tidak cocok.', 'VALIDATION');
    }
    return { name: name.trim(), email: normalizeEmail(email), password, confirmation };
  }

  static validateLogin(input: Partial<Record<keyof LoginRequest, unknown>>): LoginRequest {
    const { email, password } = input;
    if (!isString(email) || !isString(password) || !email.trim() || !password) {
      throw new AuthError('Email dan kata sandi wajib diisi.', 'VALIDATION');
    }
    AuthValidator.validateEmail(email);
    if (password.length > AuthLimits.passwordMax) {
      throw new AuthError('Email atau kata sandi salah.', 'INVALID_CREDENTIALS');
    }
    return { email: normalizeEmail(email), password };
  }

  private static validateEmail(email: string): void {
    if (email.trim().length > AuthLimits.emailMax || !emailPattern.test(email.trim())) {
      throw new AuthError('Masukkan alamat email yang valid.', 'VALIDATION');
    }
  }
}
