import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verify() {
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

  console.log("✅ Verificando variantes HTML...\n");

  for (const term of htmlTerms) {
    const t = await prisma.term.findUnique({
      where: { term },
      include: { variants: { where: { language: "html" } } },
    });

    if (t?.variants?.[0]?.snippet) {
      const lines = t.variants[0].snippet.split("\n").length;
      console.log(`✅ ${term}: ${lines} líneas de código`);
    } else {
      console.log(`❌ ${term}: SIN CÓDIGO`);
    }
  }

  await prisma.$disconnect();
}

verify();
