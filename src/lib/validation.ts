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
  examples: z
    .array(
      z.object({
        title: z.string().min(1),
        code: z.string().min(1),
        note: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
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
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  sort: z.enum(["recent", "oldest", "term_asc", "term_desc"]).default("term_asc"),
});

/** Tipo utilitario derivado de `termSchema` para servicios que reciben un payload validado. */
export type TermInput = z.infer<typeof termSchema>;

/** Tipo utilitario derivado de `termsQuerySchema` que resume filtros ya normalizados. */
export type TermsQueryInput = z.infer<typeof termsQuerySchema>;
