import { z } from "zod";

const normalizedStringArray = z
  .array(z.string().transform(value => value.trim()).pipe(z.string().min(1, "El texto no puede estar vacío")))
  .optional()
  .default([])
  .transform(values => {
    const unique = new Set<string>();
    values.forEach(value => {
      const lower = value.toLowerCase();
      if (lower) unique.add(lower);
    });
    return Array.from(unique);
  });

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

export const termsQuerySchema = z.object({
  q: z
    .string()
    .optional()
    .transform(value => value?.trim())
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
    .transform(value => value?.trim())
    .pipe(z.string().min(1).optional()),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  sort: z.enum(["recent", "oldest", "term_asc", "term_desc"]).default("term_asc"),
});

export type TermInput = z.infer<typeof termSchema>;
export type TermsQueryInput = z.infer<typeof termsQuerySchema>;
