import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function findMissing() {
  const allTerms = await prisma.term.findMany({
    select: { id: true, term: true },
    orderBy: { term: "asc" },
  });

  console.log("📋 Términos actuales en BD:\n");
  allTerms.forEach((t) => {
    console.log(`"${t.term}"`);
  });

  await prisma.$disconnect();
}

findMissing().catch(console.error);
