import { HistoryAction, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { termSchema, termsQuerySchema, type TermsQueryInput } from "@/lib/validation";
import { requireAdmin, type AuthTokenPayload } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { incrementMetric, logger } from "@/lib/logger";

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
    logger.error({ err: error, termId, action }, "history.write_failed");
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
    incrementMetric("terms.list.rate_limited");
    logger.warn({ route: "/api/terms", ip }, "terms.list.rate_limited");
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
    incrementMetric("terms.list.invalid");
    logger.warn({ route: "/api/terms", reason: "invalid_query", details: parsed.error.flatten() }, "terms.list.invalid");
    return jsonError(parsed.error.flatten(), 400);
  }

  const query = normalizeQuery(parsed.data);
  try {
    incrementMetric("terms.list.requests");
    const { items, total } = await fetchTermsWithFilters(query);
    const meta = {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    };
    incrementMetric("terms.list.success");
    logger.info(
      { route: "/api/terms", total: meta.total, page: meta.page, filtered: Boolean(query.q) },
      "terms.list.success",
    );
    return NextResponse.json({ ok: true, items, meta }, { headers: noStoreHeaders });
  } catch (error) {
    logger.error({ err: error, route: "/api/terms" }, "terms.list.error");
    incrementMetric("terms.list.error");
    return jsonError("No se pudo obtener la lista de términos", 500);
  }
}

export async function POST(req: NextRequest) {
  const admin = adminOrResponse(req.headers);
  if (admin instanceof Response) return admin;
  const body = await req.json();
  const parsed = termSchema.safeParse(body);
  if (!parsed.success) {
    logger.warn({ route: "/api/terms", reason: "invalid_body", details: parsed.error.flatten() }, "terms.create.invalid");
    incrementMetric("terms.create.invalid");
    return jsonError(parsed.error.flatten(), 400);
  }
  const t = parsed.data;
  try {
    incrementMetric("terms.create.attempt");
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
    incrementMetric("terms.create.success");
    logger.info({ termId: created.id, route: "/api/terms" }, "terms.create.success");
    return NextResponse.json({ ok: true, item: created }, { status: 201, headers: noStoreHeaders });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      incrementMetric("terms.create.conflict");
      return jsonError("Ya existe un término con ese nombre", 409);
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      incrementMetric("terms.create.invalid");
      return jsonError(error.message, 400);
    }
    logger.error({ err: error, route: "/api/terms" }, "terms.create.error");
    incrementMetric("terms.create.error");
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

function buildFtsQuery(raw: string) {
  const tokens = raw
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/[^\p{L}\p{N}]+/gu, ""))
    .filter(Boolean);
  if (!tokens.length) {
    return raw.trim();
  }
  return tokens.map((token) => `${token}*`).join(" ");
}

async function fetchTermsWithFilters(query: TermsQueryInput) {
  const { category, tag, q, page, pageSize, sort } = query;
  const useFts = Boolean(q);
  const termAlias = "t";
  const searchAlias = "ts";
  const filters: string[] = [];
  const params: Array<string | number> = [];

  if (category) {
    filters.push(`${termAlias}."category" = ?`);
    params.push(category);
  }
  if (tag) {
    filters.push(`lower(CAST(${termAlias}."tags" AS TEXT)) LIKE ?`);
    params.push(`%${tag.toLowerCase()}%`);
  }
  if (useFts && q) {
    filters.push(`${searchAlias} MATCH ?`);
    params.push(buildFtsQuery(q));
  } else if (q) {
    const like = `%${q.toLowerCase()}%`;
    filters.push(`(
      lower(${termAlias}."term") LIKE ? OR
      lower(${termAlias}."translation") LIKE ? OR
      lower(${termAlias}."meaning") LIKE ? OR
      lower(${termAlias}."what") LIKE ? OR
      lower(${termAlias}."how") LIKE ? OR
      lower(CAST(${termAlias}."aliases" AS TEXT)) LIKE ? OR
      lower(CAST(${termAlias}."tags" AS TEXT)) LIKE ? OR
      lower(CAST(${termAlias}."examples" AS TEXT)) LIKE ?
    )`);
    params.push(like, like, like, like, like, like, like, like);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const joinClause = useFts
    ? `FROM "TermSearch" AS ${searchAlias} JOIN "Term" AS ${termAlias} ON ${termAlias}."id" = ${searchAlias}."rowid"`
    : `FROM "Term" AS ${termAlias}`;
  const orderByClause = useFts ? `bm25(${searchAlias}) ASC, ${resolveOrder(sort, termAlias)}` : resolveOrder(sort, termAlias);

  const countSql = `SELECT COUNT(*) as count ${joinClause} ${whereClause};`;
  const countResult = await prisma.$queryRawUnsafe<{ count: bigint | number }[]>(countSql, ...params);
  const countValue = countResult?.[0]?.count ?? 0;
  const total = typeof countValue === "bigint" ? Number(countValue) : Number(countValue);

  const listSql = `SELECT ${termAlias}.* ${joinClause} ${whereClause} ORDER BY ${orderByClause} LIMIT ? OFFSET ?;`;
  const listParams: Array<string | number> = [...params, pageSize, (page - 1) * pageSize];
  const items = await prisma.$queryRawUnsafe(listSql, ...listParams);

  return { items, total };
}

function resolveOrder(sort: TermsQueryInput["sort"], alias = '"Term"') {
  switch (sort) {
    case "recent":
      return `${alias}."createdAt" DESC, ${alias}."id" DESC`;
    case "oldest":
      return `${alias}."createdAt" ASC, ${alias}."id" ASC`;
    case "term_desc":
      return `${alias}."term" DESC`;
    case "term_asc":
    default:
      return `${alias}."term" ASC`;
  }
}
