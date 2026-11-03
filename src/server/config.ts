// Konfigurasi backend. Hanya boleh di-import dari kode server (src/server, file +api.ts).
export const ServerConfig = {
  /** Folder database JSON. Bisa diganti lewat env DATA_DIR. */
  dataDir: process.env.DATA_DIR ?? '.data',
  session: {
    cookieName: 'lc_session',
    ttlMs: 30 * 24 * 60 * 60 * 1000,
  },
  password: {
    // Rekomendasi OWASP untuk PBKDF2-HMAC-SHA256.
    iterations: 600_000,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    loginPerIp: 20,
    loginPerEmail: 5,
    registerPerIp: 10,
    photoUploadsPerUser: 30,
    avatarUpdatesPerUser: 10,
  },
  maxBodyBytes: 10 * 1024,
  photos: {
    maxBytes: 5 * 1024 * 1024,
    maxPerUser: 100,
  },
} as const;
