/**
 * Web: token TIDAK disimpan di JavaScript (localStorage rawan XSS). Sesi
 * dibawa oleh cookie HttpOnly + SameSite=Strict yang diset server.
 */
export const TokenStorage = {
  usesCookieSession: true,
  get: async (): Promise<string | null> => null,
  set: async (_token: string): Promise<void> => {},
  clear: async (): Promise<void> => {},
};
