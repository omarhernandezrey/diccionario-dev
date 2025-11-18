import type { Difficulty } from "@prisma/client";

export type QuizItem = {
  questionEs: string;
  questionEn: string;
  options: string[];
  answerIndex: number;
  explanationEs: string;
  explanationEn: string;
};

export type QuizTemplateDTO = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  difficulty: Difficulty;
  tags: string[];
  items: QuizItem[];
};

export type QuizAttemptDTO = {
  id: number;
  templateId: number;
  templateSlug: string;
  templateTitle: string;
  score: number;
  totalQuestions: number;
  createdAt: string;
};
