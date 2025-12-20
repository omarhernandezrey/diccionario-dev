import crypto from "crypto";

export const RECOVERY_TOKEN_BYTES = 32;
export const RECOVERY_TOKEN_TTL_MINUTES = 30;
export const RECOVERY_TOKEN_COOLDOWN_MINUTES = 2;

export function createRecoveryToken() {
  return crypto.randomBytes(RECOVERY_TOKEN_BYTES).toString("hex");
}

export function hashRecoveryToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function recoveryExpiresAt(from = Date.now()) {
  return new Date(from + RECOVERY_TOKEN_TTL_MINUTES * 60 * 1000);
}

export function recoveryCooldownUntil(createdAt: Date) {
  return new Date(createdAt.getTime() + RECOVERY_TOKEN_COOLDOWN_MINUTES * 60 * 1000);
}

export function getClientInfo(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || headers.get("x-real-ip") || undefined;
  const userAgent = headers.get("user-agent") || undefined;
  return { ip, userAgent };
}

export function getRecoveryBaseUrl(origin?: string) {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || origin || "http://localhost:3000";
}

export function shouldExposeRecoveryToken() {
  if (process.env.AUTH_RECOVERY_EXPOSE_TOKEN === "true") return true;
  return process.env.NODE_ENV !== "production";
}
