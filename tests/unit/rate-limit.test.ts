import { afterEach, describe, expect, it, vi } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("permite solicitudes hasta alcanzar el límite y luego bloquea", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
    const key = "ip:1";

    expect(rateLimit(key, { limit: 2, windowMs: 1000 })).toEqual({ ok: true });
    expect(rateLimit(key, { limit: 2, windowMs: 1000 })).toEqual({ ok: true });

    const blocked = rateLimit(key, { limit: 2, windowMs: 1000 });
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    }
  });

  it("reinicia el contador cuando la ventana expira", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
    const key = "ip:2";

    rateLimit(key, { limit: 1, windowMs: 500 });
    const blocked = rateLimit(key, { limit: 1, windowMs: 500 });
    expect(blocked.ok).toBe(false);

    vi.advanceTimersByTime(600);
    expect(rateLimit(key, { limit: 1, windowMs: 500 })).toEqual({ ok: true });
  });
});
