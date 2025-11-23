import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { QuizAttemptDTO } from "@/types/quiz";

const noStore = { "Cache-Control": "no-store" } as const;

type AttemptWithTemplate = {
  id: number;
  templateId: number;
  score: number;
  totalQuestions: number;
  createdAt: Date;
  template: { slug: string; title: string };
};

function serializeAttempt(attempt: AttemptWithTemplate): QuizAttemptDTO {
  return {
    id: attempt.id,
    templateId: attempt.templateId,
    templateSlug: attempt.template.slug,
    templateTitle: attempt.template.title,
    score: attempt.score,
    totalQuestions: attempt.totalQuestions,
    createdAt: attempt.createdAt.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const limitParam = req.nextUrl.searchParams.get("limit") ?? "5";
  const limit = Number.parseInt(limitParam, 10);
  try {
    const attempts = await prisma.quizAttempt.findMany({
      include: { template: { select: { slug: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: Number.isFinite(limit) ? Math.max(1, Math.min(20, limit)) : 5,
    });
    return NextResponse.json(
      { ok: true, items: attempts.map(serializeAttempt) },
      { headers: noStore },
    );
  } catch (error) {
    logger.error({ err: error }, "quizzes.attempts_list_failed");
    return NextResponse.json({ ok: false, error: "No se pudo leer historial" }, { status: 500, headers: noStore });
  }
}

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400, headers: noStore });
  }
  const data = payload as Record<string, unknown>;
  const templateId = Number(data.templateId);
  const userAnswers = Array.isArray(data.userAnswers) ? (data.userAnswers as (number | null)[]) : [];

  if (!templateId) {
    return NextResponse.json({ ok: false, error: "Datos incompletos" }, { status: 400, headers: noStore });
  }

  try {
    const template = await prisma.quizTemplate.findUnique({ where: { id: templateId } });
    if (!template) {
      return NextResponse.json({ ok: false, error: "Quiz no encontrado" }, { status: 404, headers: noStore });
    }

    // Server-side score calculation
    const items = Array.isArray(template.items) ? (template.items as any[]) : [];
    const totalQuestions = items.length;
    let score = 0;

    // Reconstruct the detailed answers object for storage
    const storedAnswers = items.map((item, index) => {
      const selectedIndex = userAnswers[index] ?? null;
      const correctIndex = Number(item.answerIndex);

      if (selectedIndex === correctIndex) {
        score++;
      }

      return {
        question: item.questionEs,
        selectedIndex,
        correctIndex,
      };
    });

    const created = await prisma.quizAttempt.create({
      data: {
        templateId,
        score,
        totalQuestions,
        answers: storedAnswers,
      },
      include: { template: { select: { title: true, slug: true } } },
    });

    return NextResponse.json({ ok: true, item: serializeAttempt(created) }, { status: 201, headers: noStore });
  } catch (error) {
    logger.error({ err: error }, "quizzes.attempt_create_failed");
    return NextResponse.json({ ok: false, error: "No se pudo registrar el intento" }, { status: 500, headers: noStore });
  }
}
