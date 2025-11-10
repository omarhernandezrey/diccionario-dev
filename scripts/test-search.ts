import "./../src/app/globals.css";
import { prisma } from "../src/lib/prisma";

async function main() {
  const q = process.argv[2] || "";
  const where: any = {
    AND: [
      q
        ? {
            OR: [
              { term: { contains: q, mode: "insensitive" } },
              { aliases: { has: q } },
              { meaning: { contains: q, mode: "insensitive" } },
              { what: { contains: q, mode: "insensitive" } },
              { how: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
    ],
  };

  const items = await prisma.term.findMany({ where, orderBy: [{ term: "asc" }], take: 50 });
  console.log(`Query=${q} → found ${items.length} item(s)`);
  for (const it of items) {
    console.log(`- [#${it.id}] ${it.term} (${it.category})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
