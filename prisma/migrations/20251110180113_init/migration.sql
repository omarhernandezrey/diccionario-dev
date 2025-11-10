-- CreateTable
CREATE TABLE "Term" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "term" TEXT NOT NULL,
    "aliases" JSONB NOT NULL DEFAULT [],
    "category" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "what" TEXT NOT NULL,
    "how" TEXT NOT NULL,
    "examples" JSONB NOT NULL DEFAULT [],
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Term_term_key" ON "Term"("term");

-- CreateIndex
CREATE INDEX "Term_term_idx" ON "Term"("term");

-- CreateIndex
CREATE INDEX "Term_category_idx" ON "Term"("category");
