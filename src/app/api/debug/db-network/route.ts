import { NextRequest, NextResponse } from "next/server";
import { lookup } from "dns/promises";
import net from "net";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStore = { "Cache-Control": "no-store" } as const;

type ErrorPayload = {
  code?: string;
  message: string;
};

async function tcpProbe(host: string, port: number, timeoutMs = 3_000) {
  const startedAt = Date.now();
  return new Promise<{ ok: boolean; durationMs: number; error?: ErrorPayload }>((resolve) => {
    const socket = net.connect({ host, port });

    const finalize = (payload: { ok: boolean; error?: ErrorPayload }) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve({ ...payload, durationMs: Date.now() - startedAt });
    };

    socket.setTimeout(timeoutMs);
    socket.on("connect", () => finalize({ ok: true }));
    socket.on("timeout", () =>
      finalize({ ok: false, error: { code: "ETIMEDOUT", message: "Connection timed out" } }),
    );
    socket.on("error", (err: NodeJS.ErrnoException) =>
      finalize({ ok: false, error: { code: err.code, message: err.message } }),
    );
  });
}

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req.headers);
    const url = new URL(req.url);
    const timeoutMs = Number(url.searchParams.get("timeoutMs") || 3000);
    const raw = process.env.DATABASE_URL || "";
    if (!raw) {
      return NextResponse.json(
        { ok: false, error: "DATABASE_URL no configurada" },
        { status: 500, headers: noStore },
      );
    }

    let parsed: URL;
    try {
      parsed = new URL(raw);
    } catch {
      return NextResponse.json(
        { ok: false, error: "DATABASE_URL invalida" },
        { status: 500, headers: noStore },
      );
    }

    const host = parsed.hostname;
    const port = Number(parsed.port || 5432);
    const user = parsed.username || "unknown";
    const database = parsed.pathname?.replace("/", "") || "unknown";

    let dnsResult: { ok: boolean; addresses?: Array<{ address: string; family: number }>; error?: ErrorPayload } = {
      ok: true,
      addresses: [],
    };

    try {
      const addresses = await lookup(host, { all: true });
      dnsResult = {
        ok: true,
        addresses: addresses.map((entry) => ({ address: entry.address, family: entry.family })),
      };
    } catch (err: unknown) {
      const dnsError = err as NodeJS.ErrnoException;
      dnsResult = {
        ok: false,
        error: { code: dnsError.code, message: dnsError.message || "DNS error" },
      };
    }

    const tcpResult = await tcpProbe(host, port, Number.isFinite(timeoutMs) ? timeoutMs : 3000);

    return NextResponse.json(
      {
        ok: true,
        target: {
          host,
          port,
          user,
          database,
          ssl: parsed.searchParams.get("sslmode") || "default",
        },
        dns: dnsResult,
        tcp: tcpResult,
      },
      { headers: noStore },
    );
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json(
      { ok: false, error: (error as Error)?.message || "Network probe failed" },
      { status: 500, headers: noStore },
    );
  }
}
