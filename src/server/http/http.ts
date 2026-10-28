import { AuthError, isAuthError, type AuthErrorCode } from '@/shared/errors';
import type { ApiErrorBody } from '@/shared/types/auth';
import { ServerConfig } from '@/server/config';
import type { RateLimitError } from '@/server/security/rateLimiter';

const statusByCode: Record<AuthErrorCode, number> = {
  VALIDATION: 400,
  EMAIL_TAKEN: 409,
  INVALID_CREDENTIALS: 401,
  UNAUTHORIZED: 401,
  RATE_LIMITED: 429,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  QUOTA_EXCEEDED: 403,
  NOT_FOUND: 404,
  NETWORK: 503,
  SERVER: 500,
};

function securityHeaders(request: Request): Headers {
  const headers = new Headers({
    'Cache-Control': 'no-store',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  });
  if (new URL(request.url).protocol === 'https:') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  return headers;
}

export function jsonResponse(request: Request, data: unknown, status = 200, extraHeaders?: HeadersInit): Response {
  const headers = securityHeaders(request);
  new Headers(extraHeaders).forEach((value, key) => headers.append(key, value));
  return Response.json(data, { status, headers });
}

export function errorResponse(request: Request, error: unknown): Response {
  if (isAuthError(error)) {
    const body: ApiErrorBody = { error: { code: error.code, message: error.message } };
    const retryAfter = (error as Partial<RateLimitError>).retryAfterSeconds;
    const headers: HeadersInit = retryAfter ? { 'Retry-After': String(retryAfter) } : {};
    return jsonResponse(request, body, statusByCode[error.code], headers);
  }

  // Detail error hanya dicatat di server, tidak pernah dikirim ke client.
  console.error('[api] Unhandled error', error);
  const body: ApiErrorBody = { error: { code: 'SERVER', message: 'Terjadi kesalahan pada server.' } };
  return jsonResponse(request, body, 500);
}

/** Membungkus handler agar semua error menjadi respons JSON yang aman. */
export function handle<P extends Record<string, string> = Record<string, string>>(
  handler: (request: Request, params: P) => Promise<Response>,
) {
  return async (request: Request, params: P): Promise<Response> => {
    try {
      return await handler(request, params);
    } catch (error) {
      return errorResponse(request, error);
    }
  };
}

/** Respons file (mis. gambar) dengan header keamanan yang sama. */
export function binaryResponse(request: Request, bytes: Uint8Array, contentType: string): Response {
  const headers = securityHeaders(request);
  headers.set('Content-Type', contentType);
  headers.set('Content-Length', String(bytes.length));
  headers.set('Content-Disposition', 'inline');
  // Konten pribadi: boleh di-cache perangkat pengguna, tidak oleh proxy/CDN bersama.
  headers.set('Cache-Control', 'private, max-age=3600');
  return new Response(bytes as Uint8Array<ArrayBuffer>, { status: 200, headers });
}

/** Membaca body mentah dan berhenti begitu melewati batas, walau Content-Length tidak dikirim. */
async function readLimitedBody(request: Request, maxBytes: number): Promise<Uint8Array> {
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > maxBytes) throw new AuthError('Permintaan terlalu besar.', 'PAYLOAD_TOO_LARGE');
  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > maxBytes) {
      await reader.cancel();
      throw new AuthError('Permintaan terlalu besar.', 'PAYLOAD_TOO_LARGE');
    }
    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.length;
  }
  return body;
}

// Bentuk FormData Web/Node di server; tipe global FormData di project ini milik React Native.
interface ServerFormData {
  get(name: string): string | { arrayBuffer(): Promise<ArrayBuffer> } | null;
}

/** Mengambil satu file dari body multipart/form-data dengan batas ukuran. */
export async function readMultipartFile(request: Request, fieldName: string, maxFileBytes: number): Promise<Uint8Array> {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('multipart/form-data')) {
    throw new AuthError('Content-Type harus multipart/form-data.', 'VALIDATION');
  }

  // Sisakan ruang untuk header multipart di luar isi file.
  const body = await readLimitedBody(request, maxFileBytes + 64 * 1024);
  let form: ServerFormData;
  try {
    const parsed = await new Response(body as Uint8Array<ArrayBuffer>, {
      headers: { 'Content-Type': contentType },
    }).formData();
    form = parsed as unknown as ServerFormData;
  } catch {
    throw new AuthError('Format upload tidak valid.', 'VALIDATION');
  }

  const file = form.get(fieldName);
  if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
    throw new AuthError(`Field "${fieldName}" berisi file wajib dikirim.`, 'VALIDATION');
  }
  return new Uint8Array(await file.arrayBuffer());
}

/**
 * Membaca body JSON dengan batas ukuran. Mewajibkan Content-Type JSON juga
 * menahan CSRF dari form HTML biasa (browser tidak bisa mengirimnya tanpa preflight).
 */
export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    throw new AuthError('Content-Type harus application/json.', 'VALIDATION');
  }
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > ServerConfig.maxBodyBytes) {
    throw new AuthError('Permintaan terlalu besar.', 'PAYLOAD_TOO_LARGE');
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).length > ServerConfig.maxBodyBytes) {
    throw new AuthError('Permintaan terlalu besar.', 'PAYLOAD_TOO_LARGE');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new AuthError('Format JSON tidak valid.', 'VALIDATION');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new AuthError('Format JSON tidak valid.', 'VALIDATION');
  }
  return parsed as Record<string, unknown>;
}

export function getClientIp(request: Request): string {
  // Header ini hanya dapat dipercaya bila server berada di belakang proxy tepercaya.
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

/** Token dari header Authorization (aplikasi native) atau cookie HttpOnly (web). */
export function getSessionToken(request: Request): string | null {
  const authorization = request.headers.get('authorization');
  if (authorization?.startsWith('Bearer ')) return authorization.slice(7).trim() || null;

  const cookie = request.headers.get('cookie') ?? '';
  for (const part of cookie.split(';')) {
    const [name, ...value] = part.trim().split('=');
    if (name === ServerConfig.session.cookieName) return decodeURIComponent(value.join('=')) || null;
  }
  return null;
}

export function sessionCookie(request: Request, token: string, expiresAt: string): string {
  const maxAge = Math.max(0, Math.floor((Date.parse(expiresAt) - Date.now()) / 1000));
  return buildCookie(request, encodeURIComponent(token), maxAge);
}

export function clearSessionCookie(request: Request): string {
  return buildCookie(request, '', 0);
}

function buildCookie(request: Request, value: string, maxAge: number): string {
  const parts = [
    `${ServerConfig.session.cookieName}=${value}`,
    'Path=/api',
    `Max-Age=${maxAge}`,
    'HttpOnly',
    'SameSite=Strict',
  ];
  if (new URL(request.url).protocol === 'https:') parts.push('Secure');
  return parts.join('; ');
}
