/*
  Warnings:

  - You are about to drop the `TermSearch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TermSearch_config` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TermSearch_data` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TermSearch_docsize` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TermSearch_idx` table. If the table is not empty, all the data it contains will be lost.

*/
-- Drop FTS5 triggers before altering or dropping FTS virtual tables
DROP TRIGGER IF EXISTS term_search_ai;
DROP TRIGGER IF EXISTS term_search_au;
DROP TRIGGER IF EXISTS term_search_ad;
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE IF EXISTS "TermSearch";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE IF EXISTS "TermSearch_config";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE IF EXISTS "TermSearch_data";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE IF EXISTS "TermSearch_docsize";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE IF EXISTS "TermSearch_idx";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ContributorProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT DEFAULT '',
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "preferredLanguages" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContributorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contributorId" INTEGER NOT NULL,
    "userId" INTEGER,
    "termId" INTEGER,
    "entityId" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Contribution_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "ContributorProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Contribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Contribution_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "language" TEXT,
    "criteria" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ContributorBadge" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "badgeId" INTEGER NOT NULL,
    "contributorId" INTEGER NOT NULL,
    "awardedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    CONSTRAINT "ContributorBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContributorBadge_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "ContributorProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TermStats" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "termId" INTEGER NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "favorites" INTEGER NOT NULL DEFAULT 0,
    "searchHits" INTEGER NOT NULL DEFAULT 0,
    "copyActions" INTEGER NOT NULL DEFAULT 0,
    "contextHits" TEXT NOT NULL DEFAULT '{}',
    "languageHits" TEXT NOT NULL DEFAULT '{}',
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TermStats_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InsightMetric" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "termId" INTEGER,
    "kind" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'es',
    "context" TEXT NOT NULL DEFAULT 'dictionary',
    "value" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InsightMetric_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Exercise" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "termId" INTEGER,
    "titleEs" TEXT NOT NULL,
    "titleEn" TEXT,
    "promptEs" TEXT NOT NULL,
    "promptEn" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "solutions" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedAt" DATETIME,
    "reviewedById" INTEGER,
    CONSTRAINT "Exercise_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Exercise_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Exercise" ("difficulty", "id", "promptEn", "promptEs", "solutions", "termId", "titleEn", "titleEs") SELECT "difficulty", "id", "promptEn", "promptEs", "solutions", "termId", "titleEn", "titleEs" FROM "Exercise";
DROP TABLE "Exercise";
ALTER TABLE "new_Exercise" RENAME TO "Exercise";
CREATE INDEX "Exercise_termId_idx" ON "Exercise"("termId");
CREATE INDEX "Exercise_difficulty_idx" ON "Exercise"("difficulty");
CREATE TABLE "new_Faq" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "termId" INTEGER,
    "questionEs" TEXT NOT NULL,
    "questionEn" TEXT,
    "answerEs" TEXT NOT NULL,
    "answerEn" TEXT,
    "snippet" TEXT,
    "category" TEXT,
    "howToExplain" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedAt" DATETIME,
    "reviewedById" INTEGER,
    CONSTRAINT "Faq_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Faq_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Faq" ("answerEn", "answerEs", "category", "howToExplain", "id", "questionEn", "questionEs", "snippet", "termId") SELECT "answerEn", "answerEs", "category", "howToExplain", "id", "questionEn", "questionEs", "snippet", "termId" FROM "Faq";
DROP TABLE "Faq";
ALTER TABLE "new_Faq" RENAME TO "Faq";
CREATE INDEX "Faq_termId_idx" ON "Faq"("termId");
CREATE INDEX "Faq_category_idx" ON "Faq"("category");
CREATE TABLE "new_SearchLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "termId" INTEGER,
    "query" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'es',
    "context" TEXT NOT NULL DEFAULT 'dictionary',
    "mode" TEXT NOT NULL DEFAULT 'list',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "hadResults" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "SearchLog_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SearchLog" ("context", "createdAt", "id", "language", "mode", "query", "termId") SELECT "context", "createdAt", "id", "language", "mode", "query", "termId" FROM "SearchLog";
DROP TABLE "SearchLog";
ALTER TABLE "new_SearchLog" RENAME TO "SearchLog";
CREATE INDEX "SearchLog_termId_idx" ON "SearchLog"("termId");
CREATE INDEX "SearchLog_context_idx" ON "SearchLog"("context");
CREATE INDEX "SearchLog_createdAt_idx" ON "SearchLog"("createdAt");
CREATE TABLE "new_Term" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "term" TEXT NOT NULL,
    "translation" TEXT NOT NULL DEFAULT '',
    "titleEs" TEXT,
    "titleEn" TEXT,
    "slug" TEXT,
    "aliases" TEXT NOT NULL DEFAULT '[]',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "category" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "meaningEs" TEXT,
    "meaningEn" TEXT,
    "what" TEXT NOT NULL,
    "whatEs" TEXT,
    "whatEn" TEXT,
    "how" TEXT NOT NULL,
    "howEs" TEXT,
    "howEn" TEXT,
    "examples" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedAt" DATETIME,
    "reviewedById" INTEGER,
    CONSTRAINT "Term_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Term_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Term_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Term" ("aliases", "category", "createdAt", "createdById", "examples", "how", "howEn", "howEs", "id", "meaning", "meaningEn", "meaningEs", "slug", "tags", "term", "titleEn", "titleEs", "translation", "updatedAt", "updatedById", "what", "whatEn", "whatEs") SELECT "aliases", "category", "createdAt", "createdById", "examples", "how", "howEn", "howEs", "id", "meaning", "meaningEn", "meaningEs", "slug", "tags", "term", "titleEn", "titleEs", "translation", "updatedAt", "updatedById", "what", "whatEn", "whatEs" FROM "Term";
DROP TABLE "Term";
ALTER TABLE "new_Term" RENAME TO "Term";
CREATE UNIQUE INDEX "Term_term_key" ON "Term"("term");
CREATE UNIQUE INDEX "Term_slug_key" ON "Term"("slug");
CREATE INDEX "Term_term_idx" ON "Term"("term");
CREATE INDEX "Term_slug_idx" ON "Term"("slug");
CREATE INDEX "Term_category_idx" ON "Term"("category");
CREATE INDEX "Term_translation_idx" ON "Term"("translation");
CREATE INDEX "Term_createdAt_idx" ON "Term"("createdAt");
CREATE INDEX "Term_updatedAt_idx" ON "Term"("updatedAt");
CREATE TABLE "new_TermVariant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "termId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "snippet" TEXT NOT NULL,
    "notes" TEXT,
    "level" TEXT NOT NULL DEFAULT 'intermediate',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedAt" DATETIME,
    "reviewedById" INTEGER,
    CONSTRAINT "TermVariant_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TermVariant_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TermVariant" ("id", "language", "level", "notes", "snippet", "termId") SELECT "id", "language", "level", "notes", "snippet", "termId" FROM "TermVariant";
DROP TABLE "TermVariant";
ALTER TABLE "new_TermVariant" RENAME TO "TermVariant";
CREATE INDEX "TermVariant_termId_idx" ON "TermVariant"("termId");
CREATE INDEX "TermVariant_language_idx" ON "TermVariant"("language");
CREATE TABLE "new_UseCase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "termId" INTEGER NOT NULL,
    "context" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "steps" TEXT NOT NULL DEFAULT '[]',
    "tips" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedAt" DATETIME,
    "reviewedById" INTEGER,
    CONSTRAINT "UseCase_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "UseCase_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UseCase" ("context", "id", "steps", "summary", "termId", "tips") SELECT "context", "id", "steps", "summary", "termId", "tips" FROM "UseCase";
DROP TABLE "UseCase";
ALTER TABLE "new_UseCase" RENAME TO "UseCase";
CREATE INDEX "UseCase_termId_idx" ON "UseCase"("termId");
CREATE INDEX "UseCase_context_idx" ON "UseCase"("context");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ContributorProfile_userId_key" ON "ContributorProfile"("userId");

-- CreateIndex
CREATE INDEX "Contribution_termId_idx" ON "Contribution"("termId");

-- CreateIndex
CREATE INDEX "Contribution_entityType_action_idx" ON "Contribution"("entityType", "action");

-- CreateIndex
CREATE INDEX "Contribution_createdAt_idx" ON "Contribution"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_slug_key" ON "Badge"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ContributorBadge_badgeId_contributorId_key" ON "ContributorBadge"("badgeId", "contributorId");

-- CreateIndex
CREATE UNIQUE INDEX "TermStats_termId_key" ON "TermStats"("termId");

-- CreateIndex
CREATE INDEX "InsightMetric_termId_idx" ON "InsightMetric"("termId");

-- CreateIndex
CREATE INDEX "InsightMetric_kind_recordedAt_idx" ON "InsightMetric"("kind", "recordedAt");
