import "next-test-api-route-handler";
import { describe, expect, it } from "vitest";
import { prismaMock, runRoute } from "./test-utils";

describe("/api/health", () => {
  const baseUrl = "http://localhost:3000";

  it("200 cuando la DB responde", async () => {
    const mod = await import("@/app/api/health/route");
    prismaMock.$queryRaw.mockResolvedValue([{ "1": 1 }]);
    const { status, json } = await runRoute(mod, { url: `${baseUrl}/api/health` });
    expect(status).toBe(200);
    expect(json).toMatchObject({ ok: true, db: "up" });
  });

  it("503 cuando la DB falla", async () => {
    const mod = await import("@/app/api/health/route");
    prismaMock.$queryRaw.mockRejectedValue(new Error("db-down"));
    const { status, json } = await runRoute(mod, { url: `${baseUrl}/api/health` });
    expect(status).toBe(503);
    expect(json).toMatchObject({ ok: false, db: "down" });
  });
});
