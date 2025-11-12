export type TermDTO = {
  id: number;
  term: string;
  translation: string;
  aliases: string[];
  tags?: string[];
  category: string;
  meaning: string;
  what: string;
  how: string;
  examples: { title: string; code: string; note?: string }[];
};
