import { Category, Difficulty, Language, SkillLevel, UseCaseContext } from "@prisma/client";

export type ExampleSnippet = {
  titleEs: string;
  titleEn: string;
  code: string;
  noteEs?: string;
  noteEn?: string;
};

export type VariantSeed = {
  language: Language;
  code: string;
  notes?: string;
  level?: SkillLevel;
};

export type UseCaseSeed = {
  context: UseCaseContext;
  summaryEs: string;
  summaryEn: string;
  stepsEs: string[];
  stepsEn: string[];
  tipsEs?: string;
  tipsEn?: string;
};

export type FaqSeed = {
  questionEs: string;
  questionEn: string;
  answerEs: string;
  answerEn: string;
  snippet?: string;
  category?: string;
  howToExplain?: string;
};

export type ExerciseSolutionSeed = {
  language: Language;
  code: string;
  explainEs: string;
  explainEn: string;
};

export type ExerciseSeed = {
  titleEs: string;
  titleEn: string;
  promptEs: string;
  promptEn: string;
  difficulty: Difficulty;
  solutions: ExerciseSolutionSeed[];
};

export type SeedTerm = {
  term: string;
  translation: string;
  slug?: string;
  aliases: string[];
  tags?: string[];
  category: Category;
  titleEs: string;
  titleEn: string;
  meaningEs: string;
  meaningEn?: string;
  whatEs: string;
  whatEn?: string;
  howEs: string;
  howEn?: string;
  examples: ExampleSnippet[];
  variants?: VariantSeed[];
  useCases?: UseCaseSeed[];
  faqs?: FaqSeed[];
  exercises?: ExerciseSeed[];
};
