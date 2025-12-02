import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const term = await prisma.term.findUnique({
    where: { term: "align-items" },
    include: {
      faqs: true,
      variants: true,
      exercises: true,
      useCases: true,
    },
  });

  const examples = (term?.examples as any[]) ?? [];
  const faqs = term?.faqs ?? [];

  console.log("\n=== ALIGN-ITEMS DATA ===");
  console.log(`Total ejemplos: ${examples.length}`);
  console.log(`Total FAQs: ${faqs.length}`);
  console.log(`Total variantes: ${term?.variants?.length || 0}`);
  
  console.log("\n--- Ejemplos ---");
  examples.forEach((ex, i) => {
    console.log(`\n[${i}] ${ex.title || ex.titleEs}`);
    console.log(`Nota: ${ex.noteEs}`);
  });

  console.log("\n--- FAQs ---");
  faqs.forEach((faq, i) => {
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
