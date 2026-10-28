import { AuthError } from '@/shared/errors';

export class RateLimitError extends AuthError {
  constructor(readonly retryAfterSeconds: number) {
    super('Terlalu banyak percobaan. Coba lagi beberapa saat lagi.', 'RATE_LIMITED');
  }
}

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Rate limiter fixed-window di memori. Cukup untuk satu instance server;
 * untuk banyak instance gunakan penyimpanan bersama (mis. Redis/KV).
 */
export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(private readonly windowMs: number) {}

  consume(key: string, limit: number, now = Date.now()): void {
    this.sweep(now);
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return;
    }
    if (bucket.count >= limit) {
      throw new RateLimitError(Math.ceil((bucket.resetAt - now) / 1000));
    }
    bucket.count++;
  }

  reset(key: string): void {
    this.buckets.delete(key);
  }

  private sweep(now: number): void {
    if (this.buckets.size < 1000) return;
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }
}
