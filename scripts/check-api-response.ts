import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkResponse() {
  console.log("🔍 Revisando TODOS los PUNTOS que debe devolver cada término...\n");

  const term = await prisma.term.findUnique({
    where: { term: "html" },
    include: {
      variants: true,
      useCases: true,
      faqs: true,
      exercises: true,
    },
  });

  if (!term) {
    console.log("❌ Término 'html' no encontrado");
    await prisma.$disconnect();
    return;
  }

  console.log("📋 TÉRMINO: html");
  console.log("=====================================\n");

  // 1. Definición / Qué es
  console.log("1️⃣  DEFINICIÓN (¿Qué es?):");
  console.log(`   meaning: ${term.meaning ? "✅ " + term.meaning.substring(0, 80) : "❌ FALTA"}`);
  console.log(`   what: ${term.what ? "✅ " + term.what.substring(0, 80) : "❌ FALTA"}`);
  console.log("");

  // 2. Cómo se usa (Use Cases)
  console.log("2️⃣  CÓMO SE USA (Use Cases):");
  if (term.useCases && term.useCases.length > 0) {
    console.log(`   ✅ Total: ${term.useCases.length} casos de uso`);
    term.useCases.slice(0, 2).forEach((uc, i) => {
      console.log(`      ${i + 1}. Contexto: ${uc.context}, Summary: "${uc.summary.substring(0, 40)}..."`);
    });
  } else {
    console.log("   ❌ SIN USE CASES");
  }
  console.log("");

  // 3. Código / Cómo funciona (Variantes)
  console.log("3️⃣  CÓDIGO (¿Cómo funciona?):");
  if (term.variants && term.variants.length > 0) {
    console.log(`   ✅ Total: ${term.variants.length} variantes`);
    term.variants.forEach((v) => {
      const snippetLength = v.snippet ? v.snippet.length : 0;
      console.log(`      - ${v.language}: ${snippetLength} caracteres`);
      if (v.snippet) {
        console.log(`        "${v.snippet.substring(0, 60)}..."`);
      }
    });
  } else {
    console.log("   ❌ SIN VARIANTES (SIN CÓDIGO)");
  }
  console.log("");

  // 4. Ejemplos
  console.log("4️⃣  EJEMPLOS:");
  const examplesArray = Array.isArray(term.examples) ? term.examples : [];
  if (examplesArray.length > 0) {
    console.log(`   ✅ Total: ${examplesArray.length} ejemplos`);
    examplesArray.slice(0, 2).forEach((ex, i) => {
      console.log(`      ${i + 1}. ${JSON.stringify(ex).substring(0, 60)}...`);
    });
  } else {
    console.log("   ❌ SIN EJEMPLOS");
  }
  console.log("");

  // 5. FAQs / Preguntas frecuentes
  console.log("5️⃣  PREGUNTAS FRECUENTES (FAQs):");
  if (term.faqs && term.faqs.length > 0) {
    console.log(`   ✅ Total: ${term.faqs.length} FAQs`);
    term.faqs.slice(0, 2).forEach((faq, i) => {
      console.log(`      ${i + 1}. Q: "${faq.questionEs.substring(0, 50)}..."`);
      console.log(`         A: "${faq.answerEs.substring(0, 50)}..."`);
    });
  } else {
    console.log("   ❌ SIN FAQS");
  }
  console.log("");

  // 6. Ejercicios
  console.log("6️⃣  EJERCICIOS:");
  if (term.exercises && term.exercises.length > 0) {
    console.log(`   ✅ Total: ${term.exercises.length} ejercicios`);
    term.exercises.slice(0, 2).forEach((ex, i) => {
      console.log(`      ${i + 1}. ${ex.titleEs}`);
      console.log(`         Dificultad: ${ex.difficulty}`);
    });
  } else {
    console.log("   ❌ SIN EJERCICIOS");
  }
  console.log("");

  // Resumen
  console.log("📊 RESUMEN:");
  const hasAll = 
    term.meaning && 
    term.what && 
    term.useCases?.length > 0 && 
    term.variants?.length > 0 && 
    examplesArray.length > 0 && 
    term.faqs?.length > 0 && 
    term.exercises?.length > 0;

  if (hasAll) {
    console.log("✅ TÉRMINO COMPLETO - Tiene TODOS los puntos");
  } else {
    console.log("⚠️  TÉRMINO INCOMPLETO - Faltan campos:");
    if (!term.meaning) console.log("   ❌ Falta: meaning");
    if (!term.what) console.log("   ❌ Falta: what");
    if (!term.useCases?.length) console.log("   ❌ Falta: useCases");
    if (!term.variants?.length) console.log("   ❌ Falta: variantes (código)");
    if (!examplesArray.length) console.log("   ❌ Falta: examples");
    if (!term.faqs?.length) console.log("   ❌ Falta: faqs");
    if (!term.exercises?.length) console.log("   ❌ Falta: exercises");
  }

  await prisma.$disconnect();
}

checkResponse();
