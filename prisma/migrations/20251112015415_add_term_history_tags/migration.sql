-- CreateTable
CREATE TABLE "TermHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "termId" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "authorId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TermHistory_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TermHistory_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Term" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "term" TEXT NOT NULL,
    "translation" TEXT NOT NULL DEFAULT '',
    "aliases" JSONB NOT NULL DEFAULT [],
    "tags" JSONB NOT NULL DEFAULT [],
    "category" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "what" TEXT NOT NULL,
    "how" TEXT NOT NULL,
    "examples" JSONB NOT NULL DEFAULT [],
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    CONSTRAINT "Term_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Term_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Term" ("aliases", "category", "createdAt", "examples", "how", "id", "meaning", "term", "translation", "updatedAt", "what") SELECT "aliases", "category", "createdAt", "examples", "how", "id", "meaning", "term", "translation", "updatedAt", "what" FROM "Term";
DROP TABLE "Term";
ALTER TABLE "new_Term" RENAME TO "Term";
CREATE UNIQUE INDEX "Term_term_key" ON "Term"("term");
CREATE INDEX "Term_term_idx" ON "Term"("term");
CREATE INDEX "Term_category_idx" ON "Term"("category");
CREATE INDEX "Term_translation_idx" ON "Term"("translation");
CREATE INDEX "Term_createdAt_idx" ON "Term"("createdAt");
CREATE INDEX "Term_updatedAt_idx" ON "Term"("updatedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "TermHistory_termId_createdAt_idx" ON "TermHistory"("termId", "createdAt");

-- CreateIndex
CREATE INDEX "TermHistory_action_idx" ON "TermHistory"("action");
