import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const term = await prisma.term.findUnique({
    where: { term: "align-items" },
    include: {
      examples: true,
      faqs: true,
      variants: true,
    },
  });

  console.log("\n=== ALIGN-ITEMS DATA ===");
  console.log(`Total ejemplos: ${term?.examples?.length || 0}`);
  console.log(`Total FAQs: ${term?.faqs?.length || 0}`);
  console.log(`Total variantes: ${term?.variants?.length || 0}`);
  
  console.log("\n--- Ejemplos ---");
  term?.examples?.forEach((ex, i) => {
    console.log(`\n[${i}] ${ex.title || ex.titleEs}`);
    console.log(`Nota: ${ex.noteEs}`);
  });

  console.log("\n--- FAQs ---");
  term?.faqs?.forEach((faq, i) => {
    console.log(`\n[${i}] ${faq.questionEs}`);
    console.log(`Categoría: ${faq.category}`);
    console.log(`Snippet length: ${faq.snippet?.length || 0}`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
