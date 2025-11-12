type Bucket = {
  count: number;
  expiresAt: number;
};

const buckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  limit?: number;
  windowMs?: number;
};

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterMs: number; retryAfterSeconds: number };

export function rateLimit(key: string, options: RateLimitOptions = {}): RateLimitResult {
  const limit = options.limit ?? 120;
  const windowMs = options.windowMs ?? 60_000;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (bucket && bucket.expiresAt > now) {
    if (bucket.count >= limit) {
      const retryAfterMs = bucket.expiresAt - now;
      return { ok: false, retryAfterMs, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
    }
    bucket.count += 1;
    buckets.set(key, bucket);
    return { ok: true };
  }

  buckets.set(key, { count: 1, expiresAt: now + windowMs });
  return { ok: true };
}
