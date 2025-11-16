-- AlterTable
ALTER TABLE "Term" ADD COLUMN "howEn" TEXT;
ALTER TABLE "Term" ADD COLUMN "howEs" TEXT;
ALTER TABLE "Term" ADD COLUMN "meaningEn" TEXT;
ALTER TABLE "Term" ADD COLUMN "meaningEs" TEXT;
ALTER TABLE "Term" ADD COLUMN "slug" TEXT;
ALTER TABLE "Term" ADD COLUMN "titleEn" TEXT;
ALTER TABLE "Term" ADD COLUMN "titleEs" TEXT;
ALTER TABLE "Term" ADD COLUMN "whatEn" TEXT;
ALTER TABLE "Term" ADD COLUMN "whatEs" TEXT;

-- CreateTable
CREATE TABLE "TermVariant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "termId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "snippet" TEXT NOT NULL,
    "notes" TEXT,
    "level" TEXT NOT NULL DEFAULT 'intermediate',
    CONSTRAINT "TermVariant_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UseCase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "termId" INTEGER NOT NULL,
    "context" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "steps" JSONB NOT NULL DEFAULT [],
    "tips" TEXT,
    CONSTRAINT "UseCase_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "termId" INTEGER,
    "questionEs" TEXT NOT NULL,
    "questionEn" TEXT,
    "answerEs" TEXT NOT NULL,
    "answerEn" TEXT,
    "snippet" TEXT,
    "category" TEXT,
    "howToExplain" TEXT,
    CONSTRAINT "Faq_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "termId" INTEGER,
    "titleEs" TEXT NOT NULL,
    "titleEn" TEXT,
    "promptEs" TEXT NOT NULL,
    "promptEn" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "solutions" JSONB NOT NULL DEFAULT [],
    CONSTRAINT "Exercise_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TermVariant_termId_idx" ON "TermVariant"("termId");

-- CreateIndex
CREATE INDEX "TermVariant_language_idx" ON "TermVariant"("language");

-- CreateIndex
CREATE INDEX "UseCase_termId_idx" ON "UseCase"("termId");

-- CreateIndex
CREATE INDEX "UseCase_context_idx" ON "UseCase"("context");

-- CreateIndex
CREATE INDEX "Faq_termId_idx" ON "Faq"("termId");

-- CreateIndex
CREATE INDEX "Faq_category_idx" ON "Faq"("category");

-- CreateIndex
CREATE INDEX "Exercise_termId_idx" ON "Exercise"("termId");

-- CreateIndex
CREATE INDEX "Exercise_difficulty_idx" ON "Exercise"("difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "Term_slug_key" ON "Term"("slug");

-- CreateIndex
CREATE INDEX "Term_slug_idx" ON "Term"("slug");
