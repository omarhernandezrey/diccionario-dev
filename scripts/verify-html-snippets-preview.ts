import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyHtmlSnippets() {
  console.log("🔍 Verificando que los snippets HTML sean válidos para LivePreview...\n");

  const htmlTerms = [
    "html",
    "head",
    "body",
    "base",
    "link",
    "meta",
    "style-element",
    "title",
    "script",
    "noscript",
    "template",
    "slot",
  ];

  for (const termName of htmlTerms) {
    const term = await prisma.term.findUnique({
      where: { term: termName },
      include: { variants: { where: { language: "html" } } },
    });

    if (!term) {
      console.log(`⚠️  ${termName}: NO ENCONTRADO`);
      continue;
    }

    const variant = term.variants[0];
    if (!variant?.snippet) {
      console.log(`❌ ${termName}: SIN SNIPPET`);
      continue;
    }

    // Verificar que sea HTML válido
    const snippet = variant.snippet;
    const hasHtmlTag = snippet.includes("<") && snippet.includes(">");
    const lines = snippet.split("\n").length;
    const chars = snippet.length;

    if (hasHtmlTag) {
      console.log(`✅ ${termName}: ${lines} líneas, ${chars} caracteres`);
      console.log(`   Primeros 80 chars: "${snippet.substring(0, 80)}..."`);
    } else {
      console.log(`❌ ${termName}: NO CONTIENE HTML VÁLIDO`);
    }
  }

  await prisma.$disconnect();
}

verifyHtmlSnippets();
