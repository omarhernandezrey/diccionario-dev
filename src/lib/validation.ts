import { z } from "zod";

/**
 * Utilidad para normalizar arrays de cadenas: limpia espacios, fuerza minúsculas y quita duplicados.
 */
const normalizedStringArray = z
  .array(z.string().transform((value) => value.trim()).pipe(z.string().min(1, "El texto no puede estar vacío")))
  .optional()
  .default([])
  .transform((values) => {
    const unique = new Set<string>();
    values.forEach((value) => {
      const lower = value.toLowerCase();
      if (lower) unique.add(lower);
    });
    return Array.from(unique);
  });

const reviewStatusSchema = z.enum(["pending", "in_review", "approved", "rejected"]);

const languageEnum = z.enum([
  "js",
  "ts",
  "css",
  "py",
  "java",
  "csharp",
  "go",
  "php",
  "ruby",
  "rust",
  "cpp",
  "swift",
  "kotlin",
]);

const useCaseContextEnum = z.enum(["interview", "project", "bug"]);

const exampleSchema = z.object({
  title: z.string().min(1),
  code: z.string().min(1),
  note: z.string().optional(),
});

const variantSchema = z.object({
  language: languageEnum,
  snippet: z.string().min(1),
  notes: z.string().optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  status: reviewStatusSchema.optional(),
});

const useCaseSchema = z.object({
  context: useCaseContextEnum,
  summary: z.string().min(1),
  steps: z
    .array(
      z.object({
        es: z.string().min(1),
        en: z.string().optional(),
      }),
    )
    .min(1),
  tips: z.string().optional(),
  status: reviewStatusSchema.optional(),
});

const faqSchema = z.object({
  questionEs: z.string().min(1),
  questionEn: z.string().optional(),
  answerEs: z.string().min(1),
  answerEn: z.string().optional(),
  snippet: z.string().optional(),
  category: z.string().optional(),
  howToExplain: z.string().optional(),
  status: reviewStatusSchema.optional(),
});

const exerciseSchema = z.object({
  titleEs: z.string().min(1),
  titleEn: z.string().optional(),
  promptEs: z.string().min(1),
  promptEn: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  solutions: z
    .array(
      z.object({
        language: languageEnum,
        code: z.string().min(1),
        explainEs: z.string().min(1),
        explainEn: z.string().optional(),
      }),
    )
    .min(1),
  status: reviewStatusSchema.optional(),
});

/**
 * Contrato de entrada para crear/actualizar un término completo del diccionario.
 * Mantiene consistencia con `prisma.term` y evita valores vacíos o incoherentes.
 */
export const termSchema = z.object({
  translation: z.string().min(1),
  term: z.string().min(1),
  aliases: normalizedStringArray,
  tags: normalizedStringArray,
  category: z.enum(["frontend", "backend", "database", "devops", "general"]),
  meaning: z.string().min(1),
  what: z.string().min(1),
  how: z.string().min(1),
  status: reviewStatusSchema.optional(),
  examples: z.array(exampleSchema).optional().default([]),
  variants: z.array(variantSchema).optional().default([]),
  useCases: z.array(useCaseSchema).optional().default([]),
  faqs: z.array(faqSchema).optional().default([]),
  exercises: z.array(exerciseSchema).optional().default([]),
});

/**
 * Query params permitidos para `/api/terms`, incluyendo filtros, paginación y orden.
 */
export const termsQuerySchema = z.object({
  q: z
    .string()
    .optional()
    .transform((value) => value?.trim())
    .pipe(
      z
        .string()
        .min(1)
        .optional(),
    ),
  category: z.enum(["frontend", "backend", "database", "devops", "general"]).optional(),
  tag: z
    .string()
    .optional()
    .transform((value) => value?.trim())
    .pipe(z.string().min(1).optional()),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(25),
  sort: z.enum(["recent", "oldest", "term_asc", "term_desc"]).default("term_asc"),
});

/** Tipo utilitario derivado de `termSchema` para servicios que reciben un payload validado. */
export type TermInput = z.infer<typeof termSchema>;

/** Tipo utilitario derivado de `termsQuerySchema` que resume filtros ya normalizados. */
export type TermsQueryInput = z.infer<typeof termsQuerySchema>;

export const translationRequestSchema = z.object({
  code: z.string().min(1, "El fragmento no puede estar vacío"),
  language: z
    .enum(["js", "ts", "jsx", "python", "plain", "go"])
    .optional(),
});

export type TranslationRequestInput = z.infer<typeof translationRequestSchema>;
