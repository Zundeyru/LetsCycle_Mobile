import { AuthError } from '@/types/AuthError';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AuthValidator {
  static validateRegistration(name: string, email: string, password: string, confirmation: string): void {
    if (!name.trim() || !email.trim() || !password || !confirmation) {
      throw new AuthError('Semua kolom wajib diisi.', 'VALIDATION');
    }
    if (/[|\r\n]/.test(name)) {
      throw new AuthError('Nama tidak boleh mengandung karakter pemisah baris.', 'VALIDATION');
    }
    if (!emailPattern.test(email.trim())) {
      throw new AuthError('Masukkan alamat email yang valid.', 'VALIDATION');
    }
    if (password.length < 6) {
      throw new AuthError('Kata sandi minimal 6 karakter.', 'VALIDATION');
    }
    if (password !== confirmation) {
      throw new AuthError('Konfirmasi kata sandi tidak cocok.', 'VALIDATION');
    }
  }

  static validateLogin(email: string, password: string): void {
    if (!email.trim() || !password) {
      throw new AuthError('Email dan kata sandi wajib diisi.', 'VALIDATION');
    }
    if (!emailPattern.test(email.trim())) {
      throw new AuthError('Masukkan alamat email yang valid.', 'VALIDATION');
    }
  }
}
