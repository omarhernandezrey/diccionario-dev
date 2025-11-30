import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyHtmlTermsPreview() {
  try {
    console.log("🔍 Verificando que todos los términos HTML tengan preview en vivo...\n");

    const htmlTerms = [
      "html", "head", "body", "base", "link", "meta", "style-element", "title", "script", "noscript", "template", "slot",
      "main", "section", "article", "aside", "nav", "header", "footer", "address",
      "h1", "h2", "h3", "h4", "h5", "h6", "div", "span", "p", "hr", "br", "pre", "blockquote", "figure", "figcaption"
    ];

    for (const termName of htmlTerms) {
      const term = await prisma.term.findUnique({
        where: { term: termName },
        include: {
          variants: true,
          useCases: true,
          faqs: true,
          exercises: true
        }
      });

      if (!term) {
        console.log(`❌ ${termName}: NO EXISTE`);
        continue;
      }

      const hasVariant = term.variants && term.variants.length > 0 && term.variants[0].snippet;
      const hasUseCases = term.useCases && term.useCases.length >= 3;
      const hasFaqs = term.faqs && term.faqs.length >= 3;
      const hasExercises = term.exercises && term.exercises.length > 0;
      const hasExamples = term.examples && Array.isArray(term.examples) && term.examples.length > 0;

      if (hasVariant && hasUseCases && hasFaqs && hasExercises && hasExamples) {
        console.log(`✅ ${termName}: PREVIEW ACTIVO (variant: ${term.variants[0].snippet.length} chars)`);
      } else {
        console.log(`⚠️  ${termName}: INCOMPLETO`);
        if (!hasVariant) console.log(`   - Sin variant/código`);
        if (!hasUseCases) console.log(`   - Tiene ${term.useCases?.length || 0}/3 useCases`);
        if (!hasFaqs) console.log(`   - Tiene ${term.faqs?.length || 0}/3 faqs`);
        if (!hasExercises) console.log(`   - Sin ejercicios`);
        if (!hasExamples) console.log(`   - Sin ejemplos`);
      }
    }

    console.log(`\n📊 Total de términos HTML: ${htmlTerms.length}`);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyHtmlTermsPreview();
