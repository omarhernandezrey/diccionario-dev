-- CreateTable
CREATE TABLE "SearchLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "termId" INTEGER,
    "query" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'es',
    "context" TEXT NOT NULL DEFAULT 'dictionary',
    "mode" TEXT NOT NULL DEFAULT 'list',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SearchLog_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SearchLog_termId_idx" ON "SearchLog"("termId");

-- CreateIndex
CREATE INDEX "SearchLog_context_idx" ON "SearchLog"("context");

-- CreateIndex
CREATE INDEX "SearchLog_createdAt_idx" ON "SearchLog"("createdAt");
