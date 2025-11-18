-- Soft skills knowledge base
CREATE TABLE "SoftSkillTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "questionEs" TEXT NOT NULL,
    "questionEn" TEXT NOT NULL,
    "scenario" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "answerStructure" TEXT NOT NULL DEFAULT '[]',
    "sampleAnswerEs" TEXT NOT NULL,
    "sampleAnswerEn" TEXT NOT NULL,
    "tipsEs" TEXT,
    "tipsEn" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "SoftSkillTemplate_slug_key" ON "SoftSkillTemplate"("slug");

CREATE TABLE "SoftSkillResponse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "templateId" INTEGER NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'es',
    "tone" TEXT NOT NULL DEFAULT 'professional',
    "answer" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SoftSkillResponse_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "SoftSkillTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "SoftSkillResponse_templateId_idx" ON "SoftSkillResponse"("templateId");

-- Training quizzes
CREATE TABLE "QuizTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "items" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "QuizTemplate_slug_key" ON "QuizTemplate"("slug");

CREATE TABLE "QuizAttempt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "templateId" INTEGER NOT NULL,
    "userId" INTEGER,
    "score" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "answers" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizAttempt_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "QuizTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "QuizAttempt_templateId_idx" ON "QuizAttempt"("templateId");
CREATE INDEX "QuizAttempt_userId_idx" ON "QuizAttempt"("userId");
