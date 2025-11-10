import jwt from "jsonwebtoken";

const COOKIE_NAME = "admin_token";
const JWT_EXPIRES_IN = "1d";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.ADMIN_TOKEN || "";

export function cookieName() {
  return COOKIE_NAME;
}

export function signJwt(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (e) {
    return null;
  }
}

export function requireAdmin(headers: Headers) {
  // Check Authorization header
  const auth = headers.get("authorization") || "";
  const bearer = auth.replace("Bearer ", "").trim();
  if (bearer) {
    const payload = verifyJwt(bearer);
    if (payload) return true;
  }

  // Check cookie
  const cookie = headers.get("cookie") || "";
  const match = cookie.split(";").map((s) => s.trim()).find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return false;
  const token = match.split("=")[1] || "";
  if (!token) return false;
  const payload = verifyJwt(token);
  return !!payload;
}
