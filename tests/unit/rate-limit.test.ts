import { afterEach, describe, expect, it, vi } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("permite solicitudes hasta alcanzar el límite y luego bloquea", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
    const key = "ip:1";

    await expect(rateLimit(key, { limit: 2, windowMs: 1000 })).resolves.toEqual({ ok: true });
    await expect(rateLimit(key, { limit: 2, windowMs: 1000 })).resolves.toEqual({ ok: true });

    const blocked = await rateLimit(key, { limit: 2, windowMs: 1000 });
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    }
  });

  it("reinicia el contador cuando la ventana expira", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
    const key = "ip:2";

    await rateLimit(key, { limit: 1, windowMs: 500 });
    const blocked = await rateLimit(key, { limit: 1, windowMs: 500 });
    expect(blocked.ok).toBe(false);

    vi.advanceTimersByTime(600);
    await expect(rateLimit(key, { limit: 1, windowMs: 500 })).resolves.toEqual({ ok: true });
  });
});
