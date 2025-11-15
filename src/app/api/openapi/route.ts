import { NextResponse } from "next/server";
import { getOpenApiDocument } from "@/lib/openapi";

export const dynamic = "force-dynamic";

/**
 * GET /api/openapi
 * Expone el documento OpenAPI generado en tiempo de ejecución para clientes o `/api/docs`.
 */
export async function GET() {
  const doc = getOpenApiDocument();
  return NextResponse.json(doc, {
    headers: { "Cache-Control": "no-store" },
  });
}
