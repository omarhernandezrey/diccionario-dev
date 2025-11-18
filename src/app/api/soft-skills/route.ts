import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { SoftSkillTemplateDTO, SoftSkillStructure } from "@/types/soft-skills";

const noStore = { "Cache-Control": "no-store" } as const;

type TemplateRecord = Awaited<ReturnType<typeof prisma.softSkillTemplate.findMany>>[number];

function normalizeArrayValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }
  if (typeof value === "string" && value.trim().length) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(String).filter(Boolean);
      }
    } catch {
      return value.split(",").map((entry) => entry.trim()).filter(Boolean);
    }
  }
  return [];
}

function normalizeStructure(value: unknown): SoftSkillStructure[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (entry && typeof entry === "object") {
        const record = entry as Record<string, unknown>;
        return {
          title: String(record.title ?? "Paso"),
          es: String(record.es ?? record.description ?? ""),
          en: String(record.en ?? record.description ?? ""),
        };
      }
      return null;
    })
    .filter((entry): entry is SoftSkillStructure => Boolean(entry?.title));
}

function serialize(template: TemplateRecord): SoftSkillTemplateDTO {
  return {
    id: template.id,
    slug: template.slug,
    title: template.title,
    questionEs: template.questionEs,
    questionEn: template.questionEn,
    scenario: template.scenario,
    tags: normalizeArrayValue(template.tags),
    answerStructure: normalizeStructure(template.answerStructure),
    sampleAnswerEs: template.sampleAnswerEs,
    sampleAnswerEn: template.sampleAnswerEn,
    tipsEs: template.tipsEs,
    tipsEn: template.tipsEn,
  };
}

export async function GET(req: NextRequest) {
  const tagsParam = req.nextUrl.searchParams.get("tags");
  const limitParam = req.nextUrl.searchParams.get("limit") ?? "6";
  const limit = Number.parseInt(limitParam, 10);
  const requestedTags = tagsParam
    ? tagsParam
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    : [];
  try {
    const templates = await prisma.softSkillTemplate.findMany({ orderBy: { createdAt: "desc" } });
    const list = requestedTags.length
      ? templates.filter((entry) => {
          const tags = normalizeArrayValue(entry.tags).map((tag) => tag.toLowerCase());
          return requestedTags.some((tag) => tags.includes(tag));
        })
      : templates;
    const items = list.slice(0, Number.isFinite(limit) ? Math.max(1, Math.min(12, limit)) : 6).map(serialize);
    return NextResponse.json({ ok: true, items }, { headers: noStore });
  } catch (error) {
    logger.error({ err: error }, "soft_skills.list_failed");
    return NextResponse.json({ ok: false, error: "No se pudieron cargar las plantillas" }, { status: 500, headers: noStore });
  }
}
