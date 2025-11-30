import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function simulateApiResponse() {
  console.log(
    "🔄 Simulando respuesta de API para /api/terms?search=html\n"
  );

  // Simulación de lo que devuelve la API
  const result = await prisma.term.findUnique({
    where: { term: "html" },
    include: {
      variants: true,
      useCases: true,
      faqs: true,
      exercises: true,
    },
  });

  if (!result) {
    console.log("❌ Término no encontrado");
    await prisma.$disconnect();
    return;
  }

  // Convertir a DTO (lo que envía la API)
  const dto = {
    id: result.id,
    term: result.term,
    translation: result.translation,
    meaning: result.meaning,
    what: result.what,
    how: result.how,
    examples: result.examples,
    variants: result.variants.map((v) => ({
      id: v.id,
      language: v.language,
      snippet: v.snippet,
      level: v.level,
      status: v.status,
    })),
    useCases: result.useCases.map((uc) => ({
      id: uc.id,
      context: uc.context,
      summary: uc.summary,
      steps: uc.steps,
      tips: uc.tips,
    })),
    faqs: result.faqs.map((faq) => ({
      id: faq.id,
      questionEs: faq.questionEs,
      answerEs: faq.answerEs,
      snippet: faq.snippet,
    })),
    exercises: result.exercises.map((ex) => ({
      id: ex.id,
      titleEs: ex.titleEs,
      promptEs: ex.promptEs,
      difficulty: ex.difficulty,
    })),
  };

  console.log("✅ RESPUESTA DE API (simulada):\n");
  console.log(JSON.stringify(dto, null, 2));

  console.log("\n📋 VERIFICACIÓN DE PUNTOS:");
  console.log(
    `1️⃣  meaning: ${dto.meaning ? "✅" : "❌"} (${dto.meaning?.length || 0} caracteres)`
  );
  console.log(
    `2️⃣  what: ${dto.what ? "✅" : "❌"} (${dto.what?.length || 0} caracteres)`
  );
  console.log(
    `3️⃣  how: ${dto.how ? "✅" : "❌"} (${dto.how?.length || 0} caracteres)`
  );
  console.log(
    `4️⃣  useCases: ${dto.useCases.length > 0 ? "✅" : "❌"} (${dto.useCases.length} casos)`
  );
  console.log(
    `5️⃣  variants (código): ${dto.variants.length > 0 ? "✅" : "❌"} (${dto.variants.length} variantes)`
  );
  if (dto.variants.length > 0) {
    console.log(`    └─ ${dto.variants[0].language}: ${dto.variants[0].snippet.length} caracteres`);
  }
  console.log(
    `6️⃣  examples: ${Array.isArray(dto.examples) && dto.examples.length > 0 ? "✅" : "❌"} (${Array.isArray(dto.examples) ? dto.examples.length : 0} ejemplos)`
  );
  console.log(
    `7️⃣  faqs: ${dto.faqs.length > 0 ? "✅" : "❌"} (${dto.faqs.length} FAQs)`
  );
  console.log(
    `8️⃣  exercises: ${dto.exercises.length > 0 ? "✅" : "❌"} (${dto.exercises.length} ejercicios)`
  );

  await prisma.$disconnect();
}

simulateApiResponse();
