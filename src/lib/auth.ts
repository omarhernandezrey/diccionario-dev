import { createHmac } from "crypto";

const COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 1 day in seconds

function makeHmac(secret: string, value: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function requireAdminToken(headers: Headers) {
  const expected = process.env.ADMIN_TOKEN || "";
  // 1) Check Authorization header first (Bearer token)
  const got = headers.get("authorization")?.replace("Bearer ", "") || "";
  if (expected && got && got === expected) return true;

  // 2) Check cookie header for signed session
  const cookie = headers.get("cookie") || "";
  const match = cookie.split(";").map((s) => s.trim()).find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!expected || !match) return false;
  const val = match.split("=")[1] || "";
  const parts = val.split(":");
  if (parts.length !== 2) return false;
  const exp = Number(parts[0]);
  const sig = parts[1];
  if (Number.isNaN(exp) || Date.now() / 1000 > exp) return false;
  const expectedSig = makeHmac(expected, String(exp));
  return sig === expectedSig;
}

export function createSessionValue() {
  const secret = process.env.ADMIN_TOKEN || "";
  const exp = Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE;
  const sig = makeHmac(secret, String(exp));
  return `${exp}:${sig}`;
}

export function cookieName() {
  return COOKIE_NAME;
}
