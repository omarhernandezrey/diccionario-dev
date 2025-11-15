import { createClient, type RedisClientType } from "redis";
import { logger } from "@/lib/logger";

type Bucket = {
  count: number;
  expiresAt: number;
};

export type RateLimitOptions = {
  limit?: number;
  windowMs?: number;
};

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterMs: number; retryAfterSeconds: number };

type RateLimitStore = {
  consume(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
};

class MemoryRateLimitStore implements RateLimitStore {
  private buckets = new Map<string, Bucket>();

  async consume(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (bucket && bucket.expiresAt > now) {
      if (bucket.count >= limit) {
        const retryAfterMs = bucket.expiresAt - now;
        return {
          ok: false,
          retryAfterMs,
          retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
        };
      }
      bucket.count += 1;
      this.buckets.set(key, bucket);
      return { ok: true };
    }

    this.buckets.set(key, { count: 1, expiresAt: now + windowMs });
    return { ok: true };
  }
}

class RedisRateLimitStore implements RateLimitStore {
  private client: RedisClientType;
  private connecting: Promise<void> | null = null;

  constructor(private url: string) {
    this.client = createClient({ url });
    this.client.on("error", (err) => {
      logger.error({ err }, "ratelimit.redis_error");
    });
    void this.ensureConnection();
  }

  private async ensureConnection() {
    if (this.client.isOpen) return;
    if (!this.connecting) {
      this.connecting = this.client
        .connect()
        .then(() => {
          logger.info({ driver: "redis", url: this.url }, "ratelimit.redis_connected");
        })
        .catch((error) => {
          logger.error({ err: error, url: this.url }, "ratelimit.redis_connect_failed");
          throw error;
        })
        .finally(() => {
          this.connecting = null;
        });
    }
    await this.connecting;
  }

  async consume(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    await this.ensureConnection();
    const redisKey = `ratelimit:${key}`;
    // redis@4.x pipeline: multi() -> add commands -> exec() returns [[err, result], ...]
    const pipeline = this.client.multi();
    pipeline.incr(redisKey);
    pipeline.pttl(redisKey);
    const responses = await pipeline.exec();

    if (!responses || responses.length < 2) {
      throw new Error("Redis transaction returned no results");
    }

    // responses: [[err, result], [err, result]]
    const countReply = responses[0][1];
    const ttlReply = responses[1][1];
    const count = typeof countReply === "number" ? countReply : Number(countReply);
    let ttl = typeof ttlReply === "number" ? ttlReply : Number(ttlReply);

    if (count === 1 || ttl < 0) {
      await this.client.pexpire(redisKey, windowMs);
      ttl = windowMs;
    }

    if (count > limit) {
      const retryAfterMs = ttl > 0 ? ttl : windowMs;
      return {
        ok: false,
        retryAfterMs,
        retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
      };
    }

    return { ok: true };
  }
}

const memoryStore = new MemoryRateLimitStore();
const shouldUseRedis = process.env.RATE_LIMIT_DRIVER !== "memory" && !!process.env.REDIS_URL;
const redisStore = shouldUseRedis && process.env.REDIS_URL ? new RedisRateLimitStore(process.env.REDIS_URL) : null;

export async function rateLimit(key: string, options: RateLimitOptions = {}): Promise<RateLimitResult> {
  const limit = options.limit ?? 120;
  const windowMs = options.windowMs ?? 60_000;

  if (redisStore) {
    try {
      return await redisStore.consume(key, limit, windowMs);
    } catch (error) {
      logger.error({ err: error, key }, "ratelimit.redis_fallback");
    }
  }

  return memoryStore.consume(key, limit, windowMs);
}
