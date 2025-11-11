-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Term" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "term" TEXT NOT NULL,
    "translation" TEXT NOT NULL DEFAULT '',
    "aliases" JSONB NOT NULL DEFAULT [],
    "category" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "what" TEXT NOT NULL,
    "how" TEXT NOT NULL,
    "examples" JSONB NOT NULL DEFAULT [],
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Term" ("aliases", "category", "createdAt", "examples", "how", "id", "meaning", "term", "translation", "updatedAt", "what") SELECT "aliases", "category", "createdAt", "examples", "how", "id", "meaning", "term", '' as translation, "updatedAt", "what" FROM "Term";
DROP TABLE "Term";
ALTER TABLE "new_Term" RENAME TO "Term";
CREATE UNIQUE INDEX "Term_term_key" ON "Term"("term");
CREATE INDEX "Term_term_idx" ON "Term"("term");
CREATE INDEX "Term_category_idx" ON "Term"("category");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
