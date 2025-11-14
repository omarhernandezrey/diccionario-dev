import type { NextRequest } from "next/server";
import { beforeEach, vi } from "vitest";
import { Prisma } from "@prisma/client";
import { testApiHandler } from "next-test-api-route-handler";

type AnyRecord = Record<string, unknown>;

const baseTerm = {
  id: 10,
  term: "Sample",
  translation: "Ejemplo",
  aliases: [],
  tags: [],
  category: "frontend" as const,
  meaning: "Meaning",
  what: "What",
  how: "How",
  examples: [],
};

export const prismaMock = {
  user: {
    count: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  term: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  termHistory: {
    create: vi.fn(),
  },
  $queryRawUnsafe: vi.fn(),
};

export const authMock = {
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
  signJwt: vi.fn(),
  buildAuthCookie: vi.fn(),
  buildLogoutCookie: vi.fn(),
  requireAdmin: vi.fn(),
  requireAuth: vi.fn(),
  getTokenFromHeaders: vi.fn(),
  verifyJwt: vi.fn(),
};

export const rateLimitMock = vi.fn();

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth", () => authMock);
vi.mock("@/lib/rate-limit", () => ({ rateLimit: rateLimitMock }));

export function prismaKnownError(code: string) {
  return new Prisma.PrismaClientKnownRequestError("error", { code, clientVersion: "test" });
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";
type GenericHandler = (req: NextRequest, context?: { params?: Record<string, string> }) => Promise<Response> | Response;
type AppRouteModule = Partial<Record<HttpMethod, GenericHandler>> & Record<string, unknown>;

export async function runRoute(
  module: AppRouteModule,
  opts: { method?: HttpMethod; url: string; body?: AnyRecord; headers?: Record<string, string>; params?: Record<string, string> },
) {
  const { method = "GET", url, body, headers = {}, params } = opts;
  const normalizedMethod = method.toUpperCase() as HttpMethod;
  if (typeof module[normalizedMethod] !== "function") {
    throw new Error(`La ruta no implementa el método HTTP ${normalizedMethod}`);
  }
  type FetchResponse = Response & { cookies?: Array<Record<string, string>> };
  let response: FetchResponse | null = null;
  const finalHeaders: Record<string, string> = { ...headers };
  const hasBody = body != null && normalizedMethod !== "GET" && normalizedMethod !== "HEAD";
  if (hasBody && finalHeaders["content-type"] == null) {
    finalHeaders["content-type"] = "application/json";
  }

  await testApiHandler({
    appHandler: module as any,
    url,
    params,
    test: async ({ fetch }) => {
      response = (await fetch({
        method: normalizedMethod,
        headers: finalHeaders,
        body: hasBody ? JSON.stringify(body) : undefined,
      })) as FetchResponse;
    },
  });

  if (!response) throw new Error("La respuesta de la ruta no se capturó");
  let json: AnyRecord | null = null;
  try {
    json = await response.clone().json();
  } catch {
    json = null;
  }
  return {
    res: response,
    status: response.status,
    json,
    headers: response.headers,
    setCookie: response.headers.get("set-cookie"),
    cookies: response.cookies ?? [],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.ADMIN_TOKEN = "";
  rateLimitMock.mockReturnValue({ ok: true });
  authMock.hashPassword.mockImplementation(async (value: string) => `hashed-${value}`);
  authMock.comparePassword.mockResolvedValue(true);
  authMock.signJwt.mockReturnValue("signed-jwt");
  authMock.buildAuthCookie.mockReturnValue("admin_token=signed");
  authMock.buildLogoutCookie.mockReturnValue("admin_token=; Max-Age=0");
  authMock.requireAdmin.mockReturnValue({ id: 1, username: "admin", role: "admin" });
  authMock.requireAuth.mockReturnValue({ id: 1, username: "user", role: "user" });
  authMock.getTokenFromHeaders.mockReturnValue("token");
  authMock.verifyJwt.mockReturnValue({ id: 1, username: "admin", role: "admin" });

  prismaMock.user.count.mockResolvedValue(0);
  prismaMock.user.findUnique.mockResolvedValue(null);
  prismaMock.user.findFirst.mockResolvedValue(null);
  prismaMock.user.create.mockResolvedValue({ id: 2, username: "admin", email: "admin@example.com", role: "admin" });

  prismaMock.term.findUnique.mockResolvedValue({ ...baseTerm });
  prismaMock.term.create.mockResolvedValue({ ...baseTerm });
  prismaMock.term.update.mockResolvedValue({ ...baseTerm, term: "Updated" });
  prismaMock.term.delete.mockResolvedValue({ ...baseTerm });
  prismaMock.termHistory.create.mockResolvedValue({});
  prismaMock.$queryRawUnsafe.mockResolvedValue([{ count: 0 }]);
});
