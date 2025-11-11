import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const COOKIE_NAME = "admin_token";
const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_TOKEN || "";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
const IS_PROD = process.env.NODE_ENV === "production";

export type AuthTokenPayload = {
  id: number;
  username: string;
  role: string;
} & Record<string, unknown>;

const AUTH_ERROR = { ok: false, error: "Unauthorized" };

const FORBIDDEN_ERROR = { ok: false, error: "Forbidden" };

const MAX_AGE_SECONDS = (() => {
  const matcher = /^(\d+)([smhd])?$/i;
  const match = JWT_EXPIRES_IN.match(matcher);
  if (!match) return 60 * 60 * 24; // fallback 1d
  const value = Number(match[1]);
  const unit = (match[2] || "s").toLowerCase();
  switch (unit) {
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 60 * 60 * 24;
    default:
      return value;
  }
})();

function ensureSecret() {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET no está configurado. Define JWT_SECRET en tu .env.");
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signJwt(payload: AuthTokenPayload | Partial<AuthTokenPayload>) {
  ensureSecret();
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJwt(token: string): AuthTokenPayload | null {
  ensureSecret();
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function cookieName() {
  return COOKIE_NAME;
}

export function buildAuthCookie(token: string, maxAgeSeconds = MAX_AGE_SECONDS) {
  const flags = [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (IS_PROD) {
    flags.push("Secure");
  }
  return flags.join("; ");
}

export function buildLogoutCookie() {
  return buildAuthCookie("", 0);
}

export function getTokenFromHeaders(headers: Headers) {
  const authHeader = headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "").trim();
  }
  const cookieHeader = headers.get("cookie");
  if (!cookieHeader) return "";
  const cookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!cookie) return "";
  return cookie.slice(cookie.indexOf("=") + 1);
}

function handleAuthError(error: Response): never {
  throw error;
}

function unauthorized() {
  return NextResponse.json(AUTH_ERROR, { status: 401 });
}

function forbidden() {
  return NextResponse.json(FORBIDDEN_ERROR, { status: 403 });
}

export function requireAuth(headers: Headers): AuthTokenPayload {
  const token = getTokenFromHeaders(headers);
  if (!token) {
    handleAuthError(unauthorized());
  }
  const payload = verifyJwt(token);
  if (!payload) {
    handleAuthError(unauthorized());
  }
  return payload;
}

export function requireAdmin(headers: Headers): AuthTokenPayload {
  const payload = requireAuth(headers);
  if (payload.role !== "admin") {
    handleAuthError(forbidden());
  }
  return payload;
}
