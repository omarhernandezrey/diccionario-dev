import { HistoryAction, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { termSchema, termsQuerySchema, type TermsQueryInput } from "@/lib/validation";
import { requireAdmin, type AuthTokenPayload } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const noStoreHeaders = { "Cache-Control": "no-store" } as const;
const DEFAULT_PAGE_SIZE = 50;
const RATE_LIMIT_PREFIX = "terms:list";

function adminOrResponse(headers: Headers): AuthTokenPayload | Response {
  try {
    return requireAdmin(headers);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    throw error;
  }
}

function getClientIp(req: NextRequest) {
  const xForwarded = req.headers.get("x-forwarded-for");
  if (xForwarded) return xForwarded.split(",")[0]?.trim() || "anonymous";
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  if (req.ip) return String(req.ip);
  return "anonymous";
}

function jsonError(message: unknown, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status, headers: noStoreHeaders });
}

async function recordHistory(termId: number, snapshot: unknown, action: HistoryAction, authorId?: number) {
  try {
    await prisma.termHistory.create({
      data: {
        termId,
        snapshot: sanitizeSnapshot(snapshot),
        action,
        authorId,
      },
    });
  } catch (error) {
    console.error("[History] Error registrando historial", { termId, action, error });
  }
}

function sanitizeSnapshot<T>(payload: T) {
  try {
    return JSON.parse(JSON.stringify(payload));
  } catch {
    return payload;
  }
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rate = rateLimit(`${RATE_LIMIT_PREFIX}:${ip}`, { limit: 180, windowMs: 60_000 });
  if (!rate.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "Demasiadas solicitudes. Intenta nuevamente en unos segundos.",
      },
      {
        status: 429,
        headers: { ...noStoreHeaders, "Retry-After": String(rate.retryAfterSeconds) },
      },
    );
  }

  const parsed = termsQuerySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) {
    return jsonError(parsed.error.flatten(), 400);
  }

  const query = normalizeQuery(parsed.data);
  try {
    const { items, total } = await fetchTermsWithFilters(query);
    const meta = {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    };
    return NextResponse.json({ ok: true, items, meta }, { headers: noStoreHeaders });
  } catch (error) {
    console.error("Error listando términos", error);
    return jsonError("No se pudo obtener la lista de términos", 500);
  }
}

export async function POST(req: NextRequest) {
  const admin = adminOrResponse(req.headers);
  if (admin instanceof Response) return admin;
  const body = await req.json();
  const parsed = termSchema.safeParse(body);
  if (!parsed.success) {
    console.warn("[POST /api/terms] Validación fallida", parsed.error.flatten());
    return jsonError(parsed.error.flatten(), 400);
  }
  const t = parsed.data;
  try {
    const created = await prisma.term.create({
      data: {
        term: t.term,
        translation: t.translation,
        aliases: t.aliases,
        tags: t.tags,
        category: t.category,
        meaning: t.meaning,
        what: t.what,
        how: t.how,
        examples: t.examples as Prisma.JsonArray,
        createdById: admin.id,
        updatedById: admin.id,
      },
    });
    await recordHistory(created.id, created, HistoryAction.create, admin.id);
    return NextResponse.json({ ok: true, item: created }, { status: 201, headers: noStoreHeaders });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("Ya existe un término con ese nombre", 409);
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      return jsonError(error.message, 400);
    }
    console.error("Error creando término", error);
    const message = error instanceof Error ? error.message : "No se pudo guardar el término";
    return jsonError(message, 500);
  }
}

function normalizeQuery(data: TermsQueryInput): TermsQueryInput {
  return {
    ...data,
    q: data.q?.trim() || undefined,
    tag: data.tag?.trim() || undefined,
    pageSize: data.pageSize || DEFAULT_PAGE_SIZE,
  };
}

async function fetchTermsWithFilters(query: TermsQueryInput) {
  const { category, tag, q, page, pageSize, sort } = query;
  const filters: string[] = [];
  const params: Array<string | number> = [];

  if (category) {
    filters.push(`"category" = ?`);
    params.push(category);
  }
  if (tag) {
    filters.push(`lower(CAST(tags AS TEXT)) LIKE ?`);
    params.push(`%${tag.toLowerCase()}%`);
  }
  if (q) {
    const like = `%${q.toLowerCase()}%`;
    filters.push(`(
      lower("term") LIKE ? OR
      lower("translation") LIKE ? OR
      lower("meaning") LIKE ? OR
      lower("what") LIKE ? OR
      lower("how") LIKE ? OR
      lower(CAST(aliases AS TEXT)) LIKE ? OR
      lower(CAST(tags AS TEXT)) LIKE ? OR
      lower(CAST(examples AS TEXT)) LIKE ?
    )`);
    params.push(like, like, like, like, like, like, like, like);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const orderByClause = resolveOrder(sort);

  const countSql = `SELECT COUNT(*) as count FROM "Term" ${whereClause};`;
  const countResult = await prisma.$queryRawUnsafe<{ count: bigint | number }[]>(countSql, ...params);
  const countValue = countResult?.[0]?.count ?? 0;
  const total = typeof countValue === "bigint" ? Number(countValue) : Number(countValue);

  const listSql = `SELECT * FROM "Term" ${whereClause} ORDER BY ${orderByClause} LIMIT ? OFFSET ?;`;
  const listParams: Array<string | number> = [...params, pageSize, (page - 1) * pageSize];
  const items = await prisma.$queryRawUnsafe(listSql, ...listParams);

  return { items, total };
}

function resolveOrder(sort?: TermsQueryInput["sort"]) {
  switch (sort) {
    case "recent":
      return `"createdAt" DESC, "id" DESC`;
    case "oldest":
      return `"createdAt" ASC, "id" ASC`;
    case "term_desc":
      return `"term" DESC`;
    case "term_asc":
    default:
      return `"term" ASC`;
  }
}
