import { HistoryAction, Prisma, Language, SkillLevel } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { termSchema, termsQuerySchema, type TermsQueryInput } from "@/lib/validation";
import { requireAdmin, type AuthTokenPayload } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { incrementMetric, logger } from "@/lib/logger";
import type {
  TermDTO,
  TermExampleDTO,
  TermExerciseSolutionDTO,
  UseCaseStepDTO,
} from "@/types/term";

export const dynamic = "force-dynamic";

const noStoreHeaders = { "Cache-Control": "no-store" } as const;
const DEFAULT_PAGE_SIZE = 50;
const RATE_LIMIT_PREFIX = "terms:list";

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

async function recordSearchEvent(event: {
  query: string;
  language: string;
  context: string;
  mode: string;
  termId?: number | null;
}) {
  const { query, language, context, mode, termId = null } = event;
  try {
    await prisma.searchLog.create({
      data: {
        query,
        language,
        context,
        mode,
        termId,
      },
    });
  } catch (error) {
    logger.warn({ err: error, query, context, mode }, "search.log_failed");
  }
}

/**
 * GET /api/terms
 * Lista términos con búsqueda FTS, filtros, paginación y rate limiting por IP.
 */
export async function GET(req: NextRequest) {
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
    void recordSearchEvent({ query: rawQuery, language, context, mode, termId: null });
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
    void recordSearchEvent({ query: rawQuery, language, context, mode, termId: null });
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
    const primaryTermId = items.length === 1 ? items[0]?.id ?? null : null;
    void recordSearchEvent({ query: rawQuery, language, context, mode, termId: primaryTermId });
    return NextResponse.json({ ok: true, items, meta }, { headers: noStoreHeaders });
  } catch (error) {
    logger.error({ err: error, route: "/api/terms" }, "terms.list.error");
    incrementMetric("terms.list.error");
    void recordSearchEvent({ query: rawQuery, language, context, mode, termId: null });
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

    // Crear variantes si vienen en el payload
    if (t.variants?.length) {
      await prisma.termVariant.createMany({
        data: t.variants.map(v => ({
          termId: created.id,
          language: v.language as Language,
          snippet: v.snippet,
          notes: v.notes,
          level: (v.level as SkillLevel) || undefined,
        })),
      });
    }

    // Recargar término con relaciones para respuesta completa
    const fullTerm = await prisma.term.findUnique({
      where: { id: created.id },
      include: { variants: true, useCases: true, faqs: true, exercises: true },
    });

    if (fullTerm) {
      await recordHistory(fullTerm.id, fullTerm, HistoryAction.create, admin.id);
    } else {
      await recordHistory(created.id, created, HistoryAction.create, admin.id);
    }

    // Registrar evento de búsqueda (modo create) para analítica básica
    void recordSearchEvent({ query: t.term, language: "es", context: "dictionary", mode: "create", termId: created.id });

    incrementMetric("terms.create.success");
    logger.info({ termId: created.id, route: "/api/terms" }, "terms.create.success");
    const serialized = fullTerm ? serializeTerm(fullTerm as PrismaTermWithRelations) : created;
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
 * Ejecuta la consulta principal sobre SQLite/FTS y devuelve items + total.
 */
async function fetchTermsWithFilters(query: TermsQueryInput) {
  const { category, tag, q, page, pageSize, sort } = query;
  const useFts = Boolean(q);
  const termAlias = "t";
  const searchTable = `"TermSearch"`;
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
    filters.push(`${searchTable} MATCH ?`);
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
    ? `FROM ${searchTable} JOIN "Term" AS ${termAlias} ON ${termAlias}."id" = ${searchTable}."rowid"`
    : `FROM "Term" AS ${termAlias}`;
  const orderByClause = useFts ? `bm25(${searchTable}) ASC, ${resolveOrder(sort, termAlias)}` : resolveOrder(sort, termAlias);

  const countSql = `SELECT COUNT(*) as count ${joinClause} ${whereClause};`;
  const countResult = await prisma.$queryRawUnsafe<{ count: bigint | number }[]>(countSql, ...params);
  const countValue = countResult?.[0]?.count ?? 0;
  const total = typeof countValue === "bigint" ? Number(countValue) : Number(countValue);

  const listSql = `SELECT ${termAlias}."id" ${joinClause} ${whereClause} ORDER BY ${orderByClause} LIMIT ? OFFSET ?;`;
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

type PrismaTermWithRelations = Prisma.TermGetPayload<{
  include: { variants: true; useCases: true; faqs: true; exercises: true };
}>;

function serializeTerm(record: PrismaTermWithRelations): TermDTO {
  const examples = parseExamples(record.examples);
  const aliases = toStringArray(record.aliases);
  const tags = toStringArray(record.tags);
  return {
    id: record.id,
    term: record.term,
    translation: record.translation,
    slug: record.slug ?? undefined,
    aliases,
    tags,
    category: record.category,
    titleEs: record.titleEs ?? record.translation ?? record.term,
    titleEn: record.titleEn ?? record.term,
    meaning: record.meaning,
    meaningEs: record.meaningEs ?? record.meaning,
    meaningEn: record.meaningEn ?? undefined,
    what: record.what,
    whatEs: record.whatEs ?? record.what,
    whatEn: record.whatEn ?? undefined,
    how: record.how,
    howEs: record.howEs ?? record.how,
    howEn: record.howEn ?? undefined,
    examples,
    variants: record.variants?.map(variant => ({
      id: variant.id,
      language: variant.language,
      snippet: variant.snippet,
      notes: variant.notes ?? undefined,
      level: variant.level,
    })),
    useCases: record.useCases?.map(useCase => ({
      id: useCase.id,
      context: useCase.context,
      summary: useCase.summary,
      steps: parseSteps(useCase.steps),
      tips: useCase.tips ?? undefined,
    })),
    faqs: record.faqs?.map(faq => ({
      id: faq.id,
      questionEs: faq.questionEs,
      questionEn: faq.questionEn ?? undefined,
      answerEs: faq.answerEs,
      answerEn: faq.answerEn ?? undefined,
      snippet: faq.snippet ?? undefined,
      category: faq.category ?? undefined,
      howToExplain: faq.howToExplain ?? undefined,
    })),
    exercises: record.exercises?.map(exercise => ({
      id: exercise.id,
      titleEs: exercise.titleEs,
      titleEn: exercise.titleEn ?? undefined,
      promptEs: exercise.promptEs,
      promptEn: exercise.promptEn ?? undefined,
      difficulty: exercise.difficulty,
      solutions: parseSolutions(exercise.solutions),
    })),
  };
}

function parseExamples(value: Prisma.JsonValue | null | undefined): TermExampleDTO[] {
  if (!value || typeof value !== "object" || !Array.isArray(value)) return [];
  const items: TermExampleDTO[] = [];
  for (const raw of value) {
    if (!isRecord(raw)) continue;
    const code = getString(raw.code) ?? "";
    if (!code) continue;
    const title = getString(raw.title) ?? getString(raw.titleEs) ?? getString(raw.titleEn);
    const note = getString(raw.note) ?? getString(raw.noteEs) ?? getString(raw.noteEn);
    items.push({
      title,
      titleEs: getString(raw.titleEs),
      titleEn: getString(raw.titleEn),
      code,
      note,
      noteEs: getString(raw.noteEs),
      noteEn: getString(raw.noteEn),
    });
  }
  return items;
}

function parseSteps(value: Prisma.JsonValue | null | undefined): UseCaseStepDTO[] {
  if (!value || !Array.isArray(value)) return [];
  const steps: UseCaseStepDTO[] = [];
  for (const raw of value) {
    if (typeof raw === "string") {
      steps.push({ es: raw });
      continue;
    }
    if (isRecord(raw)) {
      steps.push({ es: getString(raw.es), en: getString(raw.en) });
    }
  }
  return steps;
}

function parseSolutions(value: Prisma.JsonValue | null | undefined): TermExerciseSolutionDTO[] {
  if (!value || !Array.isArray(value)) return [];
  const solutions: TermExerciseSolutionDTO[] = [];
  for (const raw of value) {
    if (!isRecord(raw)) continue;
    const code = getString(raw.code) ?? "";
    if (!code) continue;
    solutions.push({
      language: getString(raw.language) ?? "js",
      code,
      explainEs: getString(raw.explainEs) ?? "",
      explainEn: getString(raw.explainEn),
    });
  }
  return solutions;
}

function toStringArray(value: Prisma.JsonValue | null | undefined) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map(item => {
        if (typeof item === "string") return item;
        if (typeof item === "number" || typeof item === "boolean") return String(item);
        return null;
      })
      .filter((item): item is string => Boolean(item));
  }
  return [];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getString = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);
