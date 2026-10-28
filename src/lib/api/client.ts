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
  token?: string | null;
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, form, token }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

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
    throw new AuthError(
      error?.message ?? 'Terjadi kesalahan pada server.',
      (error?.code as AuthErrorCode | undefined) ?? 'SERVER',
    );
  }
  return payload as T;
}
