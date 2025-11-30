import { PrismaClient, Language } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface DocumentationTerm {
  id: number;
  term: string;
  translation: string;
  category: string;
  meaningEs: string | null;
  meaningEn: string | null;
  whatEs: string | null;
  whatEn: string | null;
  howEs: string | null;
  howEn: string | null;
  examples: any[];
  variants: Array<{
    id: number;
    language: Language;
    snippet: string;
    level: string;
  }>;
  useCases: Array<{
    id: number;
    context: string;
    summary: string;
    steps: any[];
    tips: string | null;
  }>;
  faqs: Array<{
    id: number;
    questionEs: string;
    questionEn: string | null;
    answerEs: string;
    answerEn: string | null;
    snippet: string | null;
  }>;
  exercises: Array<{
    id: number;
    titleEs: string;
    titleEn: string | null;
    promptEs: string;
    promptEn: string | null;
    difficulty: string;
    solutions: any[];
  }>;
}

function formatLanguageLabel(lang: Language): string {
  const labels: Record<Language, string> = {
    js: "JavaScript",
    ts: "TypeScript",
    css: "CSS",
    html: "HTML",
    py: "Python",
    java: "Java",
    csharp: "C#",
    go: "Go",
    php: "PHP",
    ruby: "Ruby",
    rust: "Rust",
    cpp: "C++",
    swift: "Swift",
    kotlin: "Kotlin",
  };
  return labels[lang] || lang;
}

function createTermDocumentation(term: DocumentationTerm): string {
  let doc = `
## ${term.term.toUpperCase()}

### 📝 Traducción
**${term.translation}**

---

### 🎯 Definición

#### Español
${term.meaningEs || "No disponible"}

#### English
${term.meaningEn || "Not available"}

---

### 💡 ¿Para qué sirve?

#### Español
${term.whatEs || "No disponible"}

#### English
${term.whatEn || "Not available"}

---

### 🛠️ ¿Cómo se usa?

#### Español
${term.howEs || "No disponible"}

#### English
${term.howEn || "Not available"}

`;

  // Snippets de código por lenguaje
  if (term.variants && term.variants.length > 0) {
    doc += `### 💻 Ejemplos de Código

`;
    term.variants.forEach((variant) => {
      doc += `#### ${formatLanguageLabel(variant.language)}
\`\`\`${variant.language}
${variant.snippet}
\`\`\`

`;
    });
  }

  // Casos de uso
  if (term.useCases && term.useCases.length > 0) {
    doc += `### 🔍 Casos de Uso

`;
    term.useCases.forEach((useCase, idx) => {
      const contextLabel =
        useCase.context === "interview"
          ? "🎤 Entrevista"
          : useCase.context === "project"
            ? "🏗️ Proyecto"
            : "🐛 Bug Fix";

      doc += `#### ${idx + 1}. ${contextLabel}
**${useCase.summary}**

`;
      if (useCase.steps && Array.isArray(useCase.steps) && useCase.steps.length > 0) {
        doc += `**Pasos:**
`;
        useCase.steps.forEach((step, stepIdx) => {
          doc += `${stepIdx + 1}. ${step.title || step}\n`;
        });
        doc += "\n";
      }

      if (useCase.tips) {
        doc += `**💡 Tips:** ${useCase.tips}\n\n`;
      }
    });
  }

  // FAQs
  if (term.faqs && term.faqs.length > 0) {
    doc += `### ❓ Preguntas Frecuentes

`;
    term.faqs.forEach((faq, idx) => {
      doc += `#### ${idx + 1}. ${faq.questionEs}
**Respuesta:** ${faq.answerEs}

`;
      if (faq.snippet) {
        doc += `\`\`\`
${faq.snippet}
\`\`\`

`;
      }

      if (faq.questionEn) {
        doc += `**Q (English):** ${faq.questionEn}
**A (English):** ${faq.answerEn || faq.answerEs}

`;
      }
    });
  }

  // Ejercicios
  if (term.exercises && term.exercises.length > 0) {
    doc += `### 🎓 Ejercicios

`;
    term.exercises.forEach((exercise, idx) => {
      doc += `#### Ejercicio ${idx + 1}: ${exercise.titleEs}
**Dificultad:** ${"⭐".repeat(exercise.difficulty === "easy" ? 1 : exercise.difficulty === "medium" ? 2 : 3)}

**${exercise.promptEs}**

`;

      if (exercise.solutions && Array.isArray(exercise.solutions)) {
        exercise.solutions.forEach((solution, solIdx) => {
          doc += `**Solución ${solIdx + 1}:**
\`\`\`${solution.language || "typescript"}
${solution.code || solution}
\`\`\`

`;
        });
      }
    });
  }

  doc += `---

**Categoría:** ${term.category} | **ID:** ${term.id}

`;

  return doc;
}

async function generateDocumentation() {
  try {
    console.log("📚 Generando documentación con ejemplos de código...\n");

    // Obtener todos los términos con sus relaciones
    const terms = (await prisma.term.findMany({
      include: {
        variants: true,
        useCases: true,
        faqs: true,
        exercises: true,
      },
      orderBy: { term: "asc" },
    })) as DocumentationTerm[];

    console.log(`✅ Encontrados ${terms.length} términos\n`);

    // Generar documentación completa
    let fullDocumentation = `# 📖 Diccionario Dev - Documentación Completa

> Documentación interactiva del diccionario de desarrolladores con ejemplos de código en múltiples lenguajes

**Última actualización:** ${new Date().toLocaleDateString("es-ES")}
**Total de términos:** ${terms.length}

---

## Tabla de Contenidos

`;

    // Generar tabla de contenidos
    terms.forEach((term) => {
      fullDocumentation += `- [${term.term.toUpperCase()}](#${term.term.toLowerCase()})\n`;
    });

    fullDocumentation += "\n---\n";

    // Generar documentación para cada término
    terms.forEach((term) => {
      fullDocumentation += createTermDocumentation(term);
    });

    // Guardar archivo
    const outputPath = path.join(
      process.cwd(),
      "docs/DICCIONARIO-COMPLETO-CON-CODIGO.md"
    );
    fs.writeFileSync(outputPath, fullDocumentation);

    console.log(`✨ Documentación generada exitosamente`);
    console.log(`📁 Archivo guardado en: ${outputPath}`);

    // Estadísticas
    console.log("\n📊 Estadísticas:");
    console.log(`├─ Términos documentados: ${terms.length}`);

    const termsWithVariants = terms.filter((t) => t.variants.length > 0).length;
    console.log(`├─ Términos con variantes de código: ${termsWithVariants}`);

    const termsWithUseCases = terms.filter((t) => t.useCases.length > 0).length;
    console.log(`├─ Términos con casos de uso: ${termsWithUseCases}`);

    const termsWithFaqs = terms.filter((t) => t.faqs.length > 0).length;
    console.log(`├─ Términos con FAQs: ${termsWithFaqs}`);

    const termsWithExercises = terms.filter((t) => t.exercises.length > 0).length;
    console.log(`└─ Términos con ejercicios: ${termsWithExercises}`);

    // Contar líneas de código total
    let totalCodeLines = 0;
    terms.forEach((term) => {
      term.variants.forEach((variant) => {
        totalCodeLines += (variant.snippet.match(/\n/g) || []).length + 1;
      });
      term.exercises.forEach((exercise) => {
        if (Array.isArray(exercise.solutions)) {
          exercise.solutions.forEach((sol) => {
            const code = typeof sol === "string" ? sol : sol.code || "";
            totalCodeLines += (code.match(/\n/g) || []).length + 1;
          });
        }
      });
    });

    console.log(`\n💻 Líneas de código total: ${totalCodeLines}`);

    // Por categoría
    console.log("\n📂 Distribución por categoría:");
    const byCategory: Record<string, number> = {};
    terms.forEach((term) => {
      byCategory[term.category] = (byCategory[term.category] || 0) + 1;
    });
    Object.entries(byCategory).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} términos`);
    });

  } catch (error) {
    console.error("❌ Error generando documentación:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

generateDocumentation();
