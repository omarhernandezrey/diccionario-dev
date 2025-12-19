"use client";

export type TermUsageAction = "view" | "copy" | "favorite";

type UsagePayload = {
  termId: number;
  action: TermUsageAction;
  context?: string;
  language?: string;
};

export async function trackTermUsage(payload: UsagePayload) {
  if (!payload || !Number.isInteger(payload.termId) || payload.termId <= 0) return;
  try {
    await fetch("/api/insights/usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Silencioso para no romper la UX
  }
}
