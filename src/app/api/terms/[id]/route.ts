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
import { termSchema, type TermInput } from "@/lib/validation";
import { serializeTerm, type PrismaTermWithRelations } from "@/lib/term-serializer";
import { requireAdmin, type AuthTokenPayload } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { incrementMetric, logger } from "@/lib/logger";
import { recordContributionEvent } from "@/lib/contributors";

export const dynamic = "force-dynamic";

const noStoreHeaders = { "Cache-Control": "no-store" } as const;
const RATE_LIMIT_PREFIX = "terms:item";
const relationsInclude = { variants: true, useCases: true, faqs: true, exercises: true } as const;

type VariantInput = (NonNullable<TermInput["variants"]>[number] & { code?: string });
type UseCaseInput = NonNullable<TermInput["useCases"]>[number];
type FaqInput = NonNullable<TermInput["faqs"]>[number];
type ExerciseInput = NonNullable<TermInput["exercises"]>[number];

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

type PrismaWithHistory = typeof prisma & {
  termHistory?: {
    create?: (args: Prisma.TermHistoryCreateArgs) => Promise<unknown>;
  };
};

async function recordHistory(termId: number, snapshot: unknown, action: HistoryAction, authorId?: number) {
  try {
    // prisma.termHistory puede no existir según el schema generado; chequeamos en runtime.
    const client = prisma as PrismaWithHistory;
    if (client && typeof client.termHistory?.create === "function") {
      await client.termHistory.create({
        data: {
          termId,
          snapshot: sanitizeSnapshot(snapshot),
          action,
          authorId,
        },
      });
    } else {
      // If the termHistory model is not available at runtime, skip recording history.
      // This avoids throwing at runtime and preserves existing behavior.
      logger.warn({ termId, action }, "history.model_missing");
    }
  } catch (error) {
    logger.error({ err: error, termId, action }, "history.write_failed");
  }
}

function parseId(idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

function sanitizeSnapshot<T>(payload: T) {
  try {
    return JSON.parse(JSON.stringify(payload));
  } catch {
    return payload;
  }
}

const REVIEW_STATUSES: ReviewStatus[] = ["pending", "in_review", "approved", "rejected"];

function normalizeReviewStatus(value?: string | null) {
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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseId(params.id);
  if (!id) {
    return jsonError("Identificador inválido", 400);
  }
  const rate = await rateLimit(`${RATE_LIMIT_PREFIX}:${getClientIp(req)}:${id}`, { limit: 240, windowMs: 60_000 });
  if (!rate.ok) {
    incrementMetric("terms.detail.rate_limited");
    logger.warn({ route: "/api/terms/:id", id }, "terms.detail.rate_limited");
    return NextResponse.json(
      { ok: false, error: "Demasiadas solicitudes. Intenta nuevamente en unos segundos." },
      { status: 429, headers: { ...noStoreHeaders, "Retry-After": String(rate.retryAfterSeconds) } },
    );
  }
  incrementMetric("terms.detail.requests");
  const item = await prisma.term.findUnique({ where: { id }, include: relationsInclude });
  if (!item) {
    incrementMetric("terms.detail.not_found");
    return jsonError("No se encontró el término", 404);
  }
  incrementMetric("terms.detail.success");
  logger.info({ route: "/api/terms/:id", id }, "terms.detail.success");
  return NextResponse.json({ ok: true, item: serializeTerm(item as PrismaTermWithRelations) }, { headers: noStoreHeaders });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = adminOrResponse(req.headers);
  if (admin instanceof Response) return admin;
  const id = parseId(params.id);
  if (!id) {
    return jsonError("Identificador inválido", 400);
  }
  const body = await req.json();

  const partial = termSchema.partial().safeParse(body);
  if (!partial.success) {
    incrementMetric("terms.update.invalid");
    logger.warn({ route: "/api/terms/:id", id, reason: "invalid_body", details: partial.error.flatten() }, "terms.update.invalid");
    return jsonError(partial.error.flatten(), 400);
  }
  const updateData = partial.data;

  try {
    incrementMetric("terms.update.attempt");
    const existing = await prisma.term.findUnique({ where: { id }, include: relationsInclude });
    if (!existing) {
      incrementMetric("terms.update.not_found");
      return jsonError("No se encontró el término", 404);
    }

    const { variants, useCases, faqs, exercises, status, ...rest } = updateData as Partial<TermInput> & {
      variants?: VariantInput[];
      useCases?: UseCaseInput[];
      faqs?: FaqInput[];
      exercises?: ExerciseInput[];
    };

    const reviewStatus = status ? normalizeReviewStatus(status as string) : undefined;
    await prisma.term.update({
      where: { id },
      data: {
        ...rest,
        ...(reviewStatus ? { status: reviewStatus, ...buildReviewMetadata(reviewStatus, admin.id) } : {}),
        updatedById: admin.id,
      },
    });

    if (Array.isArray(variants)) {
      await replaceVariants(id, variants, admin.id);
    }
    if (Array.isArray(useCases)) {
      await replaceUseCases(id, useCases, admin.id);
    }
    if (Array.isArray(faqs)) {
      await replaceFaqs(id, faqs, admin.id);
    }
    if (Array.isArray(exercises)) {
      await replaceExercises(id, exercises, admin.id);
    }

    const fresh = await prisma.term.findUnique({ where: { id }, include: relationsInclude });
    if (!fresh) {
      throw new Error("No se pudo recargar el término actualizado");
    }

    await recordHistory(id, fresh, HistoryAction.update, admin.id);

    const statusChanged = !!reviewStatus && reviewStatus !== existing.status;
    const action = statusChanged
      ? reviewStatus === ReviewStatus.approved
        ? ContributionAction.approve
        : reviewStatus === ReviewStatus.rejected
          ? ContributionAction.reject
          : ContributionAction.review
      : ContributionAction.update;

    void recordContributionEvent({
      userId: admin.id,
      username: admin.username ?? `admin#${admin.id}`,
      termId: id,
      entityId: id,
      entityType: ContributionEntity.term,
      action,
      metadata: statusChanged ? { previousStatus: existing.status, status: reviewStatus } : undefined,
    });
    incrementMetric("terms.update.success");
    logger.info({ route: "/api/terms/:id", id }, "terms.update.success");
    return NextResponse.json({ ok: true, item: serializeTerm(fresh as PrismaTermWithRelations) }, { headers: noStoreHeaders });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      incrementMetric("terms.update.conflict");
      return jsonError("Ya existe un término con ese nombre", 409);
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      incrementMetric("terms.update.invalid");
      return jsonError(error.message, 400);
    }
    logger.error({ err: error, route: "/api/terms/:id", id }, "terms.update.error");
    incrementMetric("terms.update.error");
    const message = error instanceof Error ? error.message : "No se pudo actualizar el término";
    return jsonError(message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = adminOrResponse(req.headers);
  if (admin instanceof Response) return admin;
  const id = parseId(params.id);
  if (!id) {
    return jsonError("Identificador inválido", 400);
  }
  try {
    const existing = await prisma.term.findUnique({ where: { id } });
    if (!existing) {
      incrementMetric("terms.delete.not_found");
      return jsonError("No se encontró el término para eliminar", 404);
    }
    await recordHistory(existing.id, existing, HistoryAction.delete, admin.id);
    await prisma.term.delete({ where: { id } });
    incrementMetric("terms.delete.success");
    logger.info({ route: "/api/terms/:id", id }, "terms.delete.success");
    return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      incrementMetric("terms.delete.not_found");
      return jsonError("No se encontró el término para eliminar", 404);
    }
    logger.error({ err: error, route: "/api/terms/:id", id }, "terms.delete.error");
    incrementMetric("terms.delete.error");
    return jsonError("No se pudo eliminar el término", 500);
  }
}

async function replaceVariants(termId: number, variants: VariantInput[], reviewerId: number) {
  await prisma.termVariant.deleteMany({ where: { termId } });
  if (!variants.length) return;
  await prisma.termVariant.createMany({
    data: variants.map((variant) => {
      const status = normalizeReviewStatus(variant.status as string);
      return {
        termId,
        language: variant.language as Language,
        snippet: (variant.snippet ?? variant.code ?? "").trim(),
        notes: variant.notes,
        level: (variant.level as SkillLevel) ?? SkillLevel.intermediate,
        status,
        reviewedAt: status === ReviewStatus.pending ? null : new Date(),
        reviewedById: status === ReviewStatus.pending ? null : reviewerId,
      };
    }),
  });
}

async function replaceUseCases(termId: number, useCases: UseCaseInput[], reviewerId: number) {
  await prisma.useCase.deleteMany({ where: { termId } });
  if (!useCases.length) return;
  await prisma.useCase.createMany({
    data: useCases.map((useCase) => {
      const status = normalizeReviewStatus(useCase.status as string);
      return {
        termId,
        context: useCase.context,
        summary: useCase.summary,
        steps: useCase.steps,
        tips: useCase.tips,
        status,
        reviewedAt: status === ReviewStatus.pending ? null : new Date(),
        reviewedById: status === ReviewStatus.pending ? null : reviewerId,
      };
    }),
  });
}

async function replaceFaqs(termId: number, faqs: FaqInput[], reviewerId: number) {
  await prisma.faq.deleteMany({ where: { termId } });
  if (!faqs.length) return;
  await prisma.faq.createMany({
    data: faqs.map((faq) => {
      const status = normalizeReviewStatus(faq.status as string);
      return {
        termId,
        questionEs: faq.questionEs,
        questionEn: faq.questionEn,
        answerEs: faq.answerEs,
        answerEn: faq.answerEn,
        snippet: faq.snippet,
        category: faq.category,
        howToExplain: faq.howToExplain,
        status,
        reviewedAt: status === ReviewStatus.pending ? null : new Date(),
        reviewedById: status === ReviewStatus.pending ? null : reviewerId,
      };
    }),
  });
}

async function replaceExercises(termId: number, exercises: ExerciseInput[], reviewerId: number) {
  await prisma.exercise.deleteMany({ where: { termId } });
  if (!exercises.length) return;
  await prisma.exercise.createMany({
    data: exercises.map((exercise) => {
      const status = normalizeReviewStatus(exercise.status as string);
      return {
        termId,
        titleEs: exercise.titleEs,
        titleEn: exercise.titleEn,
        promptEs: exercise.promptEs,
        promptEn: exercise.promptEn,
        difficulty: exercise.difficulty,
        solutions: exercise.solutions,
        status,
        reviewedAt: status === ReviewStatus.pending ? null : new Date(),
        reviewedById: status === ReviewStatus.pending ? null : reviewerId,
      };
    }),
  });
}
