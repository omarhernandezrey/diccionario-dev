export type TranslationSegment = {
  type: "string" | "comment" | "text";
  original: string;
  translated: string;
  start: number;
  end: number;
};

export type StructuralTranslationResult = {
  language: string;
  fallbackApplied: boolean;
  code: string;
  segments: TranslationSegment[];
  replacedStrings: number;
  replacedComments: number;
};
