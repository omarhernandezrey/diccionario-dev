import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const COOKIE_NAME = "admin_token";
const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_TOKEN || "";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
const IS_PROD = process.env.NODE_ENV === "production";

/**
 * Carga mínima que se firma en el JWT de administración y que el frontend consume.
 * Debe contener suficiente información para validar permisos sin consultar la base de datos.
 */
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

/**
 * Hash seguro de contraseñas administrativas usando bcrypt con salt configurables.
 */
export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compara un texto plano con su hash persistido para validar credenciales.
 */
export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/**
 * Firma un JWT con expiración controlada que luego se envía en cabeceras/cookies HTTP only.
 */
export function signJwt(payload: AuthTokenPayload | Partial<AuthTokenPayload>) {
  ensureSecret();
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifica y decodifica un JWT del administrador.
 * @returns El payload autenticado o `null` si el token es inválido/expirado.
 */
export function verifyJwt(token: string): AuthTokenPayload | null {
  ensureSecret();
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Devuelve el nombre estándar de la cookie de administración para compartirlo entre capas.
 */
export function cookieName() {
  return COOKIE_NAME;
}

/**
 * Genera la cabecera `Set-Cookie` que mantiene la sesión administrativa en modo seguro.
 */
export function buildAuthCookie(token: string, maxAgeSeconds = MAX_AGE_SECONDS) {
  const flags = [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    // Usamos Lax para que la cookie sobreviva a aperturas desde buscadores (ej. Google)
    // sin exponernos a peticiones de terceros como si fuese un cookie de terceros.
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (IS_PROD) {
    flags.push("Secure");
  }
  return flags.join("; ");
}

/**
 * Cookie que expira inmediatamente la sesión y elimina el token del navegador.
 */
export function buildLogoutCookie() {
  return buildAuthCookie("", 0);
}

/**
 * Obtiene el token JWT desde Authorization Bearer o de la cookie HTTP only.
 */
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

/**
 * Garantiza que la solicitud proviene de un administrador; lanza una respuesta JSON si no.
 */
export function requireAdmin(headers: Headers): AuthTokenPayload {
  const payload = requireAuth(headers);
  if (payload.role !== "admin") {
    handleAuthError(forbidden());
  }
  return payload;
}
