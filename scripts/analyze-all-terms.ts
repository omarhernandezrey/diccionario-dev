import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TermAnalysis {
  id: number;
  term: string;
  category: string;
  status: string;
  fields: {
    translation: string;
    titleEs: string | null;
    titleEn: string | null;
    aliases: string[];
    tags: string[];
    meaningEs: string;
    meaningEn: string | null;
    what: string;
    whatEs: string | null;
    whatEn: string | null;
    how: string;
    howEs: string | null;
    howEn: string | null;
  };
  relations: {
    variants: number;
    useCases: number;
    faqs: number;
    exercises: number;
  };
  completeness: {
    hasDefinition: boolean;
    hasWhat: boolean;
    hasHow: boolean;
    hasVariants: boolean;
    hasUseCases: boolean;
    hasFaqs: boolean;
    hasExercises: boolean;
    completenessPercentage: number;
  };
}

async function analyzeAllTerms() {
  console.log("🔍 Analizando todos los términos en la base de datos...\n");

  try {
    const terms = await prisma.term.findMany({
      include: {
        variants: true,
        useCases: true,
        faqs: true,
        exercises: true,
      },
      orderBy: { term: "asc" },
    });

    console.log(`📊 Total de términos encontrados: ${terms.length}\n`);
    console.log("═".repeat(120));

    const analysis: TermAnalysis[] = [];
    let totalCompleteness = 0;

    terms.forEach((term, index) => {
      const hasDefinition = !!(term.meaningEs && term.meaningEs.length > 0);
      const hasWhat = !!(term.whatEs && term.whatEs.length > 0) || !!(term.what && term.what.length > 0);
      const hasHow = !!(term.howEs && term.howEs.length > 0) || !!(term.how && term.how.length > 0);
      const hasVariants = term.variants.length > 0;
      const hasUseCases = term.useCases.length > 0;
      const hasFaqs = term.faqs.length > 0;
      const hasExercises = term.exercises.length > 0;

      const completenessScore = [
        hasDefinition,
        hasWhat,
        hasHow,
        hasVariants,
        hasUseCases,
        hasFaqs,
        hasExercises,
      ].filter(Boolean).length;

      const completenessPercentage = Math.round((completenessScore / 7) * 100);

      const termAnalysis: TermAnalysis = {
        id: term.id,
        term: term.term,
        category: term.category,
        status: term.status,
        fields: {
          translation: term.translation,
          titleEs: term.titleEs,
          titleEn: term.titleEn,
          aliases: Array.isArray(term.aliases) ? (term.aliases as string[]) : [],
          tags: Array.isArray(term.tags) ? (term.tags as string[]) : [],
          meaningEs: term.meaningEs || "",
          meaningEn: term.meaningEn,
          what: term.what,
          whatEs: term.whatEs,
          whatEn: term.whatEn,
          how: term.how,
          howEs: term.howEs,
          howEn: term.howEn,
        },
        relations: {
          variants: term.variants.length,
          useCases: term.useCases.length,
          faqs: term.faqs.length,
          exercises: term.exercises.length,
        },
        completeness: {
          hasDefinition,
          hasWhat,
          hasHow,
          hasVariants,
          hasUseCases,
          hasFaqs,
          hasExercises,
          completenessPercentage,
        },
      };

      analysis.push(termAnalysis);
      totalCompleteness += completenessPercentage;

      console.log(`\n[${index + 1}/${terms.length}] 📚 TÉRMINO: "${term.term}"`);
      console.log(`├─ ID: ${term.id}`);
      console.log(`├─ Categoría: ${term.category}`);
      console.log(`├─ Estado: ${term.status}`);
      console.log(`├─ Traducción: ${term.translation}`);
      console.log(`│`);
      console.log(`├─ 📖 CAMPOS DE DOCUMENTACIÓN:`);
      console.log(`│  ├─ Título ES: ${term.titleEs || "❌ VACÍO"}`);
      console.log(`│  ├─ Título EN: ${term.titleEn || "❌ VACÍO"}`);
      console.log(`│  ├─ Alias: ${(term.aliases as string[]).length > 0 ? (term.aliases as string[]).join(", ") : "❌ VACÍO"}`);
      console.log(`│  ├─ Tags: ${(term.tags as string[]).length > 0 ? (term.tags as string[]).join(", ") : "❌ VACÍO"}`);
      console.log(`│  │`);
      console.log(`│  ├─ 1️⃣ Definición ES: ${term.meaningEs ? `✅ ${term.meaningEs.substring(0, 60)}...` : "❌ VACÍO"}`);
      console.log(`│  ├─ 1️⃣ Definición EN: ${term.meaningEn ? `✅ ${term.meaningEn.substring(0, 60)}...` : "⚠️ OPCIONAL"}`);
      console.log(`│  │`);
      console.log(`│  ├─ 2️⃣ Para qué sirve: ${term.whatEs ? `✅ ${term.whatEs.substring(0, 60)}...` : term.what ? `✅ ${term.what.substring(0, 60)}...` : "❌ VACÍO"}`);
      console.log(`│  ├─ 2️⃣ Para qué sirve EN: ${term.whatEn ? `✅ ${term.whatEn.substring(0, 60)}...` : "⚠️ OPCIONAL"}`);
      console.log(`│  │`);
      console.log(`│  ├─ 3️⃣ Cómo funciona: ${term.howEs ? `✅ ${term.howEs.substring(0, 60)}...` : term.how ? `✅ ${term.how.substring(0, 60)}...` : "❌ VACÍO"}`);
      console.log(`│  ├─ 3️⃣ Cómo funciona EN: ${term.howEn ? `✅ ${term.howEn.substring(0, 60)}...` : "⚠️ OPCIONAL"}`);
      console.log(`│`);
      console.log(`├─ 🔗 RELACIONES:`);
      console.log(`│  ├─ Variantes: ${term.variants.length > 0 ? `✅ ${term.variants.length}` : "❌ SIN VARIANTES"}`);
      console.log(`│  │  ${term.variants.length > 0 ? term.variants.map(v => `  [${v.language}]`).join(", ") : ""}`);
      console.log(`│  ├─ Casos de uso: ${term.useCases.length > 0 ? `✅ ${term.useCases.length}` : "⚠️ SIN CASOS DE USO"}`);
      console.log(`│  │  ${term.useCases.length > 0 ? term.useCases.map(u => `  [${u.context}]`).join(", ") : ""}`);
      console.log(`│  ├─ FAQs: ${term.faqs.length > 0 ? `✅ ${term.faqs.length}` : "⚠️ SIN FAQs"}`);
      console.log(`│  └─ Ejercicios: ${term.exercises.length > 0 ? `✅ ${term.exercises.length}` : "⚠️ SIN EJERCICIOS"}`);
      console.log(`│`);
      console.log(`└─ 📊 INTEGRIDAD: ${completenessPercentage}% (${completenessScore}/7 elementos)`);
      console.log(`   ${getCompleteBars(completenessPercentage)}`);
    });

    // Resumen General
    console.log("\n" + "═".repeat(120));
    console.log("\n📈 RESUMEN GENERAL\n");

    const avgCompleteness = Math.round(totalCompleteness / terms.length);
    console.log(`┌─ Promedio de integridad: ${avgCompleteness}%`);
    console.log(`│  ${getCompleteBars(avgCompleteness)}`);

    const byCategory = terms.reduce(
      (acc, term) => {
        acc[term.category] = (acc[term.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log(`│`);
    console.log(`├─ Términos por categoría:`);
    Object.entries(byCategory).forEach(([cat, count]) => {
      console.log(`│  ├─ ${cat}: ${count} términos`);
    });

    const withVariants = terms.filter(t => t.variants.length > 0).length;
    const withUseCases = terms.filter(t => t.useCases.length > 0).length;
    const withFaqs = terms.filter(t => t.faqs.length > 0).length;
    const withExercises = terms.filter(t => t.exercises.length > 0).length;

    console.log(`│`);
    console.log(`├─ Términos con contenido adicional:`);
    console.log(`│  ├─ Con variantes: ${withVariants}/${terms.length} (${Math.round((withVariants / terms.length) * 100)}%)`);
    console.log(`│  ├─ Con casos de uso: ${withUseCases}/${terms.length} (${Math.round((withUseCases / terms.length) * 100)}%)`);
    console.log(`│  ├─ Con FAQs: ${withFaqs}/${terms.length} (${Math.round((withFaqs / terms.length) * 100)}%)`);
    console.log(`│  └─ Con ejercicios: ${withExercises}/${terms.length} (${Math.round((withExercises / terms.length) * 100)}%)`);

    const byStatus = terms.reduce(
      (acc, term) => {
        acc[term.status] = (acc[term.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log(`│`);
    console.log(`├─ Términos por estado de revisión:`);
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`│  ├─ ${status}: ${count} términos`);
    });

    console.log(`│`);
    console.log(`└─ Total de términos documentados: ${terms.length}\n`);

    // Exportar análisis detallado
    await saveAnalysisReport(analysis);
  } catch (error) {
    console.error("❌ Error al consultar términos:", error);
  } finally {
    await prisma.$disconnect();
  }
}

function getCompleteBars(percentage: number): string {
  const filled = Math.round(percentage / 5);
  const empty = 20 - filled;
  return `[${("█".repeat(filled) + "░".repeat(empty))}] ${percentage}%`;
}

async function saveAnalysisReport(analysis: TermAnalysis[]) {
  const fs = await import("fs").then(m => m.promises);
  const report = {
    timestamp: new Date().toISOString(),
    totalTerms: analysis.length,
    averageCompleteness: Math.round(analysis.reduce((s, a) => s + a.completeness.completenessPercentage, 0) / analysis.length),
    termsAnalyzed: analysis,
  };

  const reportPath = "/home/omar/personalProjects/diccionario-dev/scripts/analysis-report.json";
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n✅ Reporte guardado en: ${reportPath}`);
}

analyzeAllTerms();
