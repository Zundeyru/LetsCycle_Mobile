export type AuthErrorCode =
  | 'VALIDATION'
  | 'EMAIL_TAKEN'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'RATE_LIMITED'
  | 'PAYLOAD_TOO_LARGE'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'QUOTA_EXCEEDED'
  | 'NOT_FOUND'
  | 'NETWORK'
  | 'SERVER';

export class AuthError extends Error {
  constructor(
    message: string,
    readonly code: AuthErrorCode,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Jangan pakai `instanceof AuthError` di server: tiap file +api.ts dibundel
 * terpisah sehingga kelasnya bisa berbeda walau berasal dari file yang sama.
 */
export function isAuthError(error: unknown): error is AuthError {
  return error instanceof Error && error.name === 'AuthError' && typeof (error as AuthError).code === 'string';
}
