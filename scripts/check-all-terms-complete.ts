import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkAllTerms() {
  console.log("🔍 Verificando que TODOS los términos tengan los 6 PUNTOS OBLIGATORIOS...\n");

  const terms = await prisma.term.findMany({
    include: {
      variants: true,
      useCases: true,
      faqs: true,
      exercises: true,
    },
  });

  console.log(`📊 Total de términos en BD: ${terms.length}\n`);

  let completeTerms = 0;
  let incompleteTerms = 0;
  const incompleteList: string[] = [];

  for (const term of terms) {
    const examplesArray = Array.isArray(term.examples) ? term.examples : [];

    const hasAll =
      term.meaning &&
      term.what &&
      term.useCases?.length > 0 &&
      term.variants?.length > 0 &&
      examplesArray.length > 0 &&
      term.faqs?.length > 0 &&
      term.exercises?.length > 0;

    if (hasAll) {
      completeTerms++;
      console.log(`✅ ${term.term.padEnd(20)} - COMPLETO`);
    } else {
      incompleteTerms++;
      const missing = [];
      if (!term.meaning) missing.push("meaning");
      if (!term.what) missing.push("what");
      if (!term.useCases?.length) missing.push("useCases");
      if (!term.variants?.length) missing.push("variantes");
      if (!examplesArray.length) missing.push("examples");
      if (!term.faqs?.length) missing.push("faqs");
      if (!term.exercises?.length) missing.push("exercises");

      console.log(
        `❌ ${term.term.padEnd(20)} - INCOMPLETO [${missing.join(", ")}]`
      );
      incompleteList.push(`${term.term} [${missing.join(", ")}]`);
    }
  }

  console.log("\n=====================================");
  console.log("📈 RESUMEN:");
  console.log(`   ✅ COMPLETOS: ${completeTerms}/${terms.length}`);
  console.log(`   ❌ INCOMPLETOS: ${incompleteTerms}/${terms.length}`);
  const percentage = ((completeTerms / terms.length) * 100).toFixed(1);
  console.log(`   📊 Completitud: ${percentage}%`);

  if (incompleteList.length > 0) {
    console.log("\n⚠️  TÉRMINOS INCOMPLETOS:");
    incompleteList.forEach((item) => {
      console.log(`   - ${item}`);
    });
  } else {
    console.log("\n🎉 ¡TODOS LOS TÉRMINOS ESTÁN COMPLETOS!");
  }

  await prisma.$disconnect();
}

checkAllTerms();
