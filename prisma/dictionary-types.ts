import { Category } from "@prisma/client";

export type ExampleSnippet = {
  title: string;
  code: string;
  note?: string;
};

export type SeedTerm = {
  term: string;
  translation: string;
  aliases: string[];
  category: Category;
  meaning: string;
  what: string;
  how: string;
  examples: ExampleSnippet[];
};
