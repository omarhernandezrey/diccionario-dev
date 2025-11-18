export type SoftSkillStructure = {
  title: string;
  es: string;
  en: string;
};

export type SoftSkillTemplateDTO = {
  id: number;
  slug: string;
  title: string;
  questionEs: string;
  questionEn: string;
  scenario?: string | null;
  tags: string[];
  answerStructure: SoftSkillStructure[];
  sampleAnswerEs: string;
  sampleAnswerEn: string;
  tipsEs?: string | null;
  tipsEn?: string | null;
};
