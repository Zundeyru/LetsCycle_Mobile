import { TokenStorage } from '@/lib/storage/tokenStorage';
import { AuthError, type AuthErrorCode } from '@/shared/errors';
import type { ApiErrorBody } from '@/shared/types/auth';

import { getApiBaseUrl } from './baseUrl';

const REQUEST_TIMEOUT_MS = 15_000;
const UPLOAD_TIMEOUT_MS = 60_000;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  /** Dikirim sebagai multipart/form-data; Content-Type diisi otomatis beserta boundary. */
  form?: FormData;
  /** false = endpoint publik (login/register): token tidak disisipkan dan 401 tidak memicu logout otomatis. */
  auth?: boolean;
}

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

/** Didaftarkan AuthProvider: dipanggil saat server menolak sesi (token kedaluwarsa/dicabut). */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

/** REQUEST INTERCEPTOR: menyisipkan `Authorization: Bearer <token>` otomatis ke setiap request. */
async function attachAuthorization(headers: Record<string, string>) {
  // Native: token dari SecureStore. Web: null, sesi dibawa cookie HttpOnly.
  const token = await TokenStorage.get();
  if (token) headers.Authorization = `Bearer ${token}`;
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, form, auth = true }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) await attachAuthorization(headers);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), form ? UPLOAD_TIMEOUT_MS : REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers,
      body: form ?? (body === undefined ? undefined : JSON.stringify(body)),
      credentials: 'same-origin',
      signal: controller.signal,
    });
  } catch {
    throw new AuthError('Tidak dapat terhubung ke server. Periksa koneksi internet.', 'NETWORK');
  } finally {
    clearTimeout(timeout);
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = (payload as Partial<ApiErrorBody> | null)?.error;
    const code = (error?.code as AuthErrorCode | undefined) ?? 'SERVER';

    // RESPONSE INTERCEPTOR: 401 UNAUTHORIZED = sesi tidak berlaku lagi, keluarkan user secara terpusat.
    // (INVALID_CREDENTIALS juga 401, tetapi itu salah password dan tidak boleh memicu logout.)
    if (auth && response.status === 401 && code === 'UNAUTHORIZED') unauthorizedHandler?.();

    throw new AuthError(error?.message ?? 'Terjadi kesalahan pada server.', code);
  }
  return payload as T;
}
