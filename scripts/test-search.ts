import { prisma } from "../src/lib/prisma";

async function main() {
  const q = process.argv[2] || "";
    if (!q) {
      const items = await prisma.term.findMany({ orderBy: [{ term: "asc" }], take: 50 });
      console.log(`Query=${q} → found ${items.length} item(s)`);
      for (const it of items) console.log(`- [#${it.id}] ${it.term} (${it.category})`);
      return;
    }

    const like = `%${q.toLowerCase()}%`;
    let sql = `SELECT * FROM "Term" WHERE (
      lower("term") LIKE ? OR
      lower("meaning") LIKE ? OR
      lower("what") LIKE ? OR
      lower("how") LIKE ? OR
      lower(CAST(aliases AS TEXT)) LIKE ?
    ) ORDER BY "term" ASC LIMIT 50;`;
    // @ts-ignore
    const items = await prisma.$queryRawUnsafe(sql, like, like, like, like, like);
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
