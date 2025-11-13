import { describe, expect, it, vi } from "vitest";

type EnvOverrides = Partial<Record<"JWT_SECRET" | "JWT_EXPIRES_IN" | "NODE_ENV" | "ADMIN_TOKEN", string>>;

async function loadAuth(overrides: EnvOverrides = {}) {
  vi.resetModules();
  process.env.JWT_SECRET = overrides.JWT_SECRET ?? "vitest-secret";
  process.env.JWT_EXPIRES_IN = overrides.JWT_EXPIRES_IN ?? "1h";
  // NODE_ENV override (assignment is fine for tests; ignore TS read-only complaint via any cast)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- override NODE_ENV solo para pruebas
  (process.env as any).NODE_ENV = overrides.NODE_ENV ?? "test";
  process.env.ADMIN_TOKEN = overrides.ADMIN_TOKEN ?? "";
  return import("@/lib/auth");
}

describe("auth helpers", () => {
  it("firma y verifica JWT con el mismo payload", async () => {
    const auth = await loadAuth();
    const token = auth.signJwt({ id: 7, username: "omar", role: "admin" });
    const payload = auth.verifyJwt(token);
    expect(payload).toMatchObject({ id: 7, username: "omar", role: "admin" });
  });

  it("devuelve null si el token es inválido", async () => {
    const auth = await loadAuth();
    expect(auth.verifyJwt("token-invalido")).toBeNull();
  });


  it("hashPassword y comparePassword funcionan en conjunto", async () => {
    const auth = await loadAuth();
    const hash = await auth.hashPassword("Sup3rPass!");
    await expect(auth.comparePassword("Sup3rPass!", hash)).resolves.toBe(true);
    await expect(auth.comparePassword("otra", hash)).resolves.toBe(false);
  });

  it("buildAuthCookie arma flags correctos y usa Secure solo en producción", async () => {
    const auth = await loadAuth({ NODE_ENV: "test" });
    const cookie = auth.buildAuthCookie("token123", 120);
    expect(cookie).toContain("admin_token=token123");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Max-Age=120");
    expect(cookie).not.toContain("Secure");

    const authProd = await loadAuth({ NODE_ENV: "production" });
    expect(authProd.buildAuthCookie("prod")).toContain("Secure");
    expect(authProd.buildLogoutCookie()).toContain("Max-Age=0");
  });

  it("getTokenFromHeaders prioriza Authorization sobre cookies", async () => {
    const auth = await loadAuth();
    const headers = new Headers({
      authorization: "Bearer 123",
      cookie: "admin_token=abc",
    });
    expect(auth.getTokenFromHeaders(headers)).toBe("123");
  });

  it("requireAuth extrae token de la cookie y retorna el payload", async () => {
    const auth = await loadAuth();
    const token = auth.signJwt({ id: 11, username: "cookie-user", role: "user" });
    const headers = new Headers({ cookie: `${auth.cookieName()}=${token}` });
    const payload = auth.requireAuth(headers);
    expect(payload.username).toBe("cookie-user");
  });

  it("requireAuth arroja Response si no hay token", async () => {
    const auth = await loadAuth();
    expect(() => auth.requireAuth(new Headers())).toThrow(Response);
  });

  it("requireAdmin valida el rol y rechaza usuarios no admin", async () => {
    const auth = await loadAuth();
    const token = auth.signJwt({ id: 20, username: "user", role: "user" });
    const headers = new Headers({ cookie: `${auth.cookieName()}=${token}` });
    expect(() => auth.requireAdmin(headers)).toThrow(Response);

    const adminToken = auth.signJwt({ id: 1, username: "root", role: "admin" });
    const adminHeaders = new Headers({ cookie: `${auth.cookieName()}=${adminToken}` });
    expect(auth.requireAdmin(adminHeaders)).toMatchObject({ username: "root" });
  });
});
