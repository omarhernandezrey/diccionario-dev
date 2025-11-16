export type TermVariantDTO = {
  id?: number;
  language: string;
  snippet: string;
  notes?: string | null;
  level?: string | null;
};

export type UseCaseStepDTO = {
  es?: string;
  en?: string;
};

export type TermUseCaseDTO = {
  id?: number;
  context: string;
  summary: string;
  steps: UseCaseStepDTO[];
  tips?: string | null;
};

export type TermFaqDTO = {
  id?: number;
  questionEs: string;
  questionEn?: string | null;
  answerEs: string;
  answerEn?: string | null;
  snippet?: string | null;
  category?: string | null;
  howToExplain?: string | null;
};

export type TermExerciseSolutionDTO = {
  language: string;
  code: string;
  explainEs: string;
  explainEn?: string | null;
};

export type TermExerciseDTO = {
  id?: number;
  titleEs: string;
  titleEn?: string | null;
  promptEs: string;
  promptEn?: string | null;
  difficulty: string;
  solutions: TermExerciseSolutionDTO[];
};

export type TermExampleDTO = {
  title?: string;
  titleEs?: string;
  titleEn?: string;
  code: string;
  note?: string;
  noteEs?: string;
  noteEn?: string;
};

export type TermDTO = {
  id: number;
  term: string;
  translation: string;
  slug?: string | null;
  aliases: string[];
  tags?: string[];
  category: string;
  titleEs?: string | null;
  titleEn?: string | null;
  meaning: string;
  meaningEs?: string | null;
  meaningEn?: string | null;
  what: string;
  whatEs?: string | null;
  whatEn?: string | null;
  how: string;
  howEs?: string | null;
  howEn?: string | null;
  examples: TermExampleDTO[];
  variants?: TermVariantDTO[];
  useCases?: TermUseCaseDTO[];
  faqs?: TermFaqDTO[];
  exercises?: TermExerciseDTO[];
};
