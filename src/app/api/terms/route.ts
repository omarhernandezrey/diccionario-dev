import {
  HistoryAction,
  Prisma,
  Language,
  SkillLevel,
  ReviewStatus,
  ContributionEntity,
  ContributionAction,
} from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDictionarySeeded } from "@/lib/bootstrap-dataset";
import { termSchema, termsQuerySchema, type TermsQueryInput } from "@/lib/validation";
import { requireAdmin, type AuthTokenPayload } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { incrementMetric, logger } from "@/lib/logger";
import { recordContributionEvent } from "@/lib/contributors";
import type { TermDTO } from "@/types/term";
import { serializeTerm, type PrismaTermWithRelations } from "@/lib/term-serializer";

export const dynamic = "force-dynamic";



const noStoreHeaders = { "Cache-Control": "no-store" } as const;
const DEFAULT_PAGE_SIZE = 50;
const RATE_LIMIT_PREFIX = "terms:list";
const TRUTHY = new Set(["1", "true", "yes", "on"]);

const envDisablesSearchLogs = (() => {
  const raw = process.env.DISABLE_SEARCH_LOGS;
  return raw ? TRUTHY.has(raw.trim().toLowerCase()) : false;
})();

const sqliteReadonlyOnVercel = Boolean(process.env.VERCEL && (process.env.DATABASE_URL ?? "").startsWith("file:"));

let searchLogWritesDisabled = envDisablesSearchLogs || sqliteReadonlyOnVercel;

if (searchLogWritesDisabled) {
  logger.info(
    { reason: envDisablesSearchLogs ? "env_flag" : "sqlite_readonly" },
    "search.log_disabled_initialization",
  );
}

/**
 * Intenta autenticar como administrador. Si falla devuelve la respuesta HTTP lista para retornar.
 */
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

/**
 * Extrae la IP del cliente usando cabeceras comunes de proxies/reverse-proxy.
 */
function getClientIp(req: NextRequest) {
  const xForwarded = req.headers.get("x-forwarded-for");
  if (xForwarded) return xForwarded.split(",")[0]?.trim() || "anonymous";
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  if (req.ip) return String(req.ip);
  return "anonymous";
}

/**
 * Respuesta de error normalizada para la API de términos.
 */
function jsonError(message: unknown, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status, headers: noStoreHeaders });
}

/**
 * Persistencia del historial de cambios de un término para auditoría.
 */
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

/**
 * Clona un payload serializable para almacenar en histórico sin referencias circulares.
 */
function sanitizeSnapshot<T>(payload: T) {
  try {
    return JSON.parse(JSON.stringify(payload));
  } catch {
    return payload;
  }
}

const REVIEW_STATUSES: ReviewStatus[] = ["pending", "in_review", "approved", "rejected"];

function normalizeReviewStatus(value?: string | null): ReviewStatus {
  if (value && REVIEW_STATUSES.includes(value as ReviewStatus)) {
    return value as ReviewStatus;
  }
  return ReviewStatus.pending;
}

function buildReviewMetadata(status: ReviewStatus, reviewerId: number) {
  if (status === ReviewStatus.pending) {
    return {};
  }
  return { reviewedAt: new Date(), reviewedById: reviewerId };
}

function isReadOnlySqliteError(error: unknown) {
  if (!error) return false;
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
    return true;
  }
  if (typeof error === "object" && error && "message" in error) {
    const message = String((error as { message: unknown }).message);
    return message.toLowerCase().includes("attempt to write a readonly database");
  }
  if (typeof error === "string") {
    return error.toLowerCase().includes("attempt to write a readonly database");
  }
  return false;
}

async function recordSearchEvent(event: {
  query: string;
  language: string;
  context: string;
  mode: string;
  termId?: number | null;
  resultCount?: number;
  hadResults?: boolean;
}) {
  const { query, language, context, mode, termId = null, resultCount = 0, hadResults = false } = event;

  if (searchLogWritesDisabled) return;

  try {
    await prisma.searchLog.create({
      data: {
        query,
        language,
        context,
        mode,
        termId,
        resultCount,
        hadResults,
      },
    });
  } catch (error) {
    if (isReadOnlySqliteError(error)) {
      searchLogWritesDisabled = true;
      logger.warn({ query, context, mode }, "search.log_disabled_readonly");
      return;
    }
    logger.warn({ err: error, query, context, mode }, "search.log_failed");
  }
}

/**
 * GET /api/terms
 * Lista términos con búsqueda FTS, filtros, paginación y rate limiting por IP.
 */
export async function GET(req: NextRequest) {
  await ensureDictionarySeeded();
  const url = new URL(req.url);
  const searchParams = url.searchParams;
  const context = searchParams.get("context") ?? "dictionary";
  const mode = searchParams.get("mode") ?? "list";
  const language =
    searchParams.get("language") ?? req.headers.get("accept-language")?.split(",")[0]?.trim()?.toLowerCase() ?? "es";
  const rawQuery = searchParams.get("q") ?? "";
  const ip = getClientIp(req);
  const rate = await rateLimit(`${RATE_LIMIT_PREFIX}:${ip}`, { limit: 180, windowMs: 60_000 });
  if (!rate.ok) {
    incrementMetric("terms.list.rate_limited");
    logger.warn({ route: "/api/terms", ip }, "terms.list.rate_limited");
    void recordSearchEvent({ query: rawQuery, language, context, mode, termId: null, resultCount: 0, hadResults: false });
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

  const parsed = termsQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    incrementMetric("terms.list.invalid");
    logger.warn({ route: "/api/terms", reason: "invalid_query", details: parsed.error.flatten() }, "terms.list.invalid");
    void recordSearchEvent({ query: rawQuery, language, context, mode, termId: null, resultCount: 0, hadResults: false });
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
    const primaryTermId = items.length ? items[0]?.id ?? null : null;
    void recordSearchEvent({
      query: rawQuery,
      language,
      context,
      mode,
      termId: primaryTermId,
      resultCount: items.length,
      hadResults: items.length > 0,
    });
    return NextResponse.json({ ok: true, items, meta }, { headers: noStoreHeaders });
  } catch (error) {
    logger.error({ err: error, route: "/api/terms" }, "terms.list.error");
    incrementMetric("terms.list.error");
    void recordSearchEvent({ query: rawQuery, language, context, mode, termId: null, resultCount: 0, hadResults: false });
    return jsonError("No se pudo obtener la lista de términos", 500);
  }
}

/**
 * POST /api/terms
 * Crea un término nuevo. Solo accesible para admins. Registra historial y métricas.
 */
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
    const termStatus = normalizeReviewStatus(t.status as string);
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
        status: termStatus,
        ...buildReviewMetadata(termStatus, admin.id),
        createdById: admin.id,
        updatedById: admin.id,
        variants: t.variants?.length
          ? {
            create: t.variants.map((variant) => {
              const status = normalizeReviewStatus(variant.status as string);
              return {
                language: variant.language as Language,
                snippet: variant.snippet,
                notes: variant.notes,
                level: (variant.level as SkillLevel) ?? SkillLevel.intermediate,
                status,
                ...buildReviewMetadata(status, admin.id),
              };
            }),
          }
          : undefined,
        useCases: t.useCases?.length
          ? {
            create: t.useCases.map((useCase) => {
              const status = normalizeReviewStatus(useCase.status as string);
              return {
                context: useCase.context,
                summary: useCase.summary,
                steps: useCase.steps,
                tips: useCase.tips,
                status,
                ...buildReviewMetadata(status, admin.id),
              };
            }),
          }
          : undefined,
        faqs: t.faqs?.length
          ? {
            create: t.faqs.map((faq) => {
              const status = normalizeReviewStatus(faq.status as string);
              return {
                questionEs: faq.questionEs,
                questionEn: faq.questionEn,
                answerEs: faq.answerEs,
                answerEn: faq.answerEn,
                snippet: faq.snippet,
                category: faq.category,
                howToExplain: faq.howToExplain,
                status,
                ...buildReviewMetadata(status, admin.id),
              };
            }),
          }
          : undefined,
        exercises: t.exercises?.length
          ? {
            create: t.exercises.map((exercise) => {
              const status = normalizeReviewStatus(exercise.status as string);
              return {
                titleEs: exercise.titleEs,
                titleEn: exercise.titleEn,
                promptEs: exercise.promptEs,
                promptEn: exercise.promptEn,
                difficulty: exercise.difficulty,
                solutions: exercise.solutions,
                status,
                ...buildReviewMetadata(status, admin.id),
              };
            }),
          }
          : undefined,
      },
      include: { variants: true, useCases: true, faqs: true, exercises: true },
    });

    await recordHistory(created.id, created, HistoryAction.create, admin.id);
    await prisma.termStats.create({ data: { termId: created.id } }).catch(() => undefined);

    void recordContributionEvent({
      userId: admin.id,
      username: admin.username ?? `admin#${admin.id}`,
      termId: created.id,
      entityId: created.id,
      entityType: ContributionEntity.term,
      action: ContributionAction.create,
      points: 25,
      metadata: { category: created.category },
    });

    // Registrar evento de búsqueda (modo create) para analítica básica
    void recordSearchEvent({
      query: t.term,
      language: "es",
      context: "dictionary",
      mode: "create",
      termId: created.id,
      resultCount: 1,
      hadResults: true,
    });

    incrementMetric("terms.create.success");
    logger.info({ termId: created.id, route: "/api/terms" }, "terms.create.success");
    const serialized = serializeTerm(created as PrismaTermWithRelations);
    return NextResponse.json({ ok: true, item: serialized }, { status: 201, headers: noStoreHeaders });
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

/**
 * Limpia parámetros opcionales para evitar strings vacíos y aplica valores por defecto de paginación.
 */
function normalizeQuery(data: TermsQueryInput): TermsQueryInput {
  return {
    ...data,
    q: data.q?.trim() || undefined,
    tag: data.tag?.trim() || undefined,
    pageSize: data.pageSize || DEFAULT_PAGE_SIZE,
  };
}

/**
 * Convierte una búsqueda libre en un query válido para FTS5, aplicando comodines.
 */
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

/**
 * Ejecuta la consulta principal sobre PostgreSQL y devuelve items + total.
 */
async function fetchTermsWithFilters(query: TermsQueryInput) {
  const { category, tag, q, page, pageSize, sort } = query;
  const termAlias = "t";
  const filters: string[] = [];
  const params: Array<string | number> = [];
  let paramIndex = 1;

  if (category) {
    filters.push(`${termAlias}."category" = $${paramIndex++}`);
    params.push(category);
  }
  if (tag) {
    filters.push(`lower(CAST(${termAlias}."tags" AS TEXT)) LIKE $${paramIndex++}`);
    params.push(`%${tag.toLowerCase()}%`);
  }
  if (q) {
    const like = `%${q.toLowerCase()}%`;
    filters.push(`(
      lower(${termAlias}."term") ILIKE $${paramIndex} OR
      lower(${termAlias}."translation") ILIKE $${paramIndex + 1} OR
      lower(${termAlias}."meaning") ILIKE $${paramIndex + 2} OR
      lower(${termAlias}."what") ILIKE $${paramIndex + 3} OR
      lower(${termAlias}."how") ILIKE $${paramIndex + 4} OR
      lower(CAST(${termAlias}."aliases" AS TEXT)) ILIKE $${paramIndex + 5} OR
      lower(CAST(${termAlias}."tags" AS TEXT)) ILIKE $${paramIndex + 6} OR
      lower(CAST(${termAlias}."examples" AS TEXT)) ILIKE $${paramIndex + 7}
    )`);
    params.push(like, like, like, like, like, like, like, like);
    paramIndex += 8;
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const joinClause = `FROM "Term" AS ${termAlias}`;
  const orderByClause = resolveOrder(sort, termAlias);

  const countSql = `SELECT COUNT(*) as count ${joinClause} ${whereClause};`;
  const countResult = await prisma.$queryRawUnsafe<{ count: bigint | number }[]>(countSql, ...params);
  const countValue = countResult?.[0]?.count ?? 0;
  const total = typeof countValue === "bigint" ? Number(countValue) : Number(countValue);

  const listSql = `SELECT ${termAlias}."id" ${joinClause} ${whereClause} ORDER BY ${orderByClause} LIMIT $${paramIndex} OFFSET $${paramIndex + 1};`;
  const listParams: Array<string | number> = [...params, pageSize, (page - 1) * pageSize];
  const orderedIds = (await prisma.$queryRawUnsafe<{ id: number }[]>(listSql, ...listParams)).map(row => row.id);
  let items: TermDTO[] = [];
  if (orderedIds.length) {
    const related = await prisma.term.findMany({
      where: { id: { in: orderedIds } },
      include: {
        variants: true,
        useCases: true,
        faqs: true,
        exercises: true,
      },
    });
    const map = new Map(related.map(term => [term.id, term]));
    items = orderedIds
      .map(id => map.get(id))
      .filter((term): term is PrismaTermWithRelations => Boolean(term))
      .map(term => serializeTerm(term));
  }

  return { items, total };
}

/**
 * Traductor del enum de ordenamiento a su expresión SQL correspondiente.
 */
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

// serializeTerm y tipos auxiliares viven en '@/lib/term-serializer'
