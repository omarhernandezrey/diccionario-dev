import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

(async () => {
  const count = await prisma.term.count({ where: { category: "frontend" } });
  const cssTerms = await prisma.term.findMany({ 
    where: { term: { contains: "selector" } },
    select: { term: true }
  });
  console.log(`Total frontend: ${count}`);
  console.log(`Sample CSS: ${cssTerms.map((t: any) => t.term).join(", ")}`);
  await prisma.$disconnect();
})();
