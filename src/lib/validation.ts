import { z } from "zod";

export const termSchema = z.object({
  translation: z.string().min(1),
  term: z.string().min(1),
  aliases: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  category: z.enum(["frontend", "backend", "database", "devops", "general"]),
  meaning: z.string().min(1),
  what: z.string().min(1),
  how: z.string().min(1),
  examples: z
    .array(
      z.object({
        title: z.string(),
        code: z.string(),
        note: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
});

export type TermInput = z.infer<typeof termSchema>;
