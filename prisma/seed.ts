import {
  Prisma,
  PrismaClient,
  Category,
  Difficulty,
  Language,
  SkillLevel,
  UseCaseContext,
  ReviewStatus,
  ContributionAction,
  ContributionEntity,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { getMetricsSnapshot, incrementMetric, logger } from "@/lib/logger";
import type {
  SeedTerm,
  ExampleSnippet,
  VariantSeed,
  UseCaseSeed,
  FaqSeed,
  ExerciseSeed,
  SeedTermInput,
} from "./dictionary-types";
import { cssCuratedTerms } from "./data/cssTerms";
import { curatedTerms } from "./data/curatedTerms";

const prisma = new PrismaClient();

const categoryContextEs: Record<Category, string> = {
  frontend: "la capa visual y de interacción",
  backend: "las APIs, servicios y lógica de negocio",
  database: "el modelado y las consultas de datos",
  devops: "los pipelines, CLI y despliegues",
  general: "todo el stack",
};

const categoryContextEn: Record<Category, string> = {
  frontend: "the UI layer",
  backend: "APIs, services, and business logic",
  database: "data modeling and querying",
  devops: "pipelines, CLIs, and deployments",
  general: "the entire stack",
};

const howByCategoryEs: Record<Category, (term: string) => string> = {
  frontend: term => `Implementa "${term}" dentro de tus componentes React/Next para mantener una UI coherente y accesible.`,
  backend: term => `Incluye "${term}" en tus controladores o servicios Node/Nest garantizando reglas de negocio claras.`,
  database: term => `Modela "${term}" en tus esquemas SQL/Prisma y valida los datos antes de almacenarlos.`,
  devops: term => `Automatiza "${term}" con scripts, contenedores y pipelines de CI/CD para despliegues repetibles.`,
  general: term => `Documenta y reutiliza "${term}" como parte de tus utilidades para que todo el equipo comparta el mismo lenguaje.`,
};

const howByCategoryEn: Record<Category, (term: string) => string> = {
  frontend: term => `Use "${term}" across your React/Next components to keep the UI consistent and accessible.`,
  backend: term => `Add "${term}" to your Node/Nest controllers or services to keep business rules explicit.`,
  database: term => `Model "${term}" in your SQL/Prisma schemas and validate the data before persisting it.`,
  devops: term => `Automate "${term}" through scripts, containers, and CI/CD pipelines for reliable deployments.`,
  general: term => `Document and reuse "${term}" as a shared utility so the team speaks the same language.`,
};

const variantLanguageByCategory: Record<Category, Language> = {
  frontend: Language.ts,
  backend: Language.js,
  database: Language.py,
  devops: Language.go,
  general: Language.ts,
};

const curatedSeedTerms: SeedTerm[] = curatedTerms.map((item) => createSeedTerm(item));
const cssSeedTerms: SeedTerm[] = cssCuratedTerms.map((item) => createSeedTerm(item));
const dictionary: SeedTerm[] = dedupeTerms([...curatedSeedTerms, ...cssSeedTerms]);

type SoftSkillTemplateSeed = {
  slug: string;
  title: string;
  questionEs: string;
  questionEn: string;
  scenario?: string;
  tags: string[];
  answerStructure: Array<{ title: string; es: string; en: string }>;
  sampleAnswerEs: string;
  sampleAnswerEn: string;
  tipsEs?: string;
  tipsEn?: string;
};

const softSkillTemplatesSeed: SoftSkillTemplateSeed[] = [
  {
    slug: "team-conflict-resolution",
    title: "Resolución de conflictos",
    questionEs: "Cuéntame de una ocasión en la que tuviste que resolver un conflicto dentro del equipo.",
    questionEn: "Tell me about a time you had to resolve conflict inside your team.",
    scenario: "HR",
    tags: ["teamwork", "leadership", "hr"],
    answerStructure: [
      { title: "Situación", es: "Describe el contexto y por qué el conflicto era relevante.", en: "Set the context and why the conflict mattered." },
      { title: "Acción", es: "Explica cómo facilitaste la conversación y qué decisiones tomaste.", en: "Explain how you facilitated the conversation and the decisions you made." },
      { title: "Resultado", es: "Comparte métricas o aprendizajes que evitaron que se repita.", en: "Share metrics or learnings that prevented future issues." },
    ],
    sampleAnswerEs:
      "Durante el rediseño del diccionario dos squads discutían por prioridades. Organicé una retro con reglas claras, mapeamos dependencias y acordamos lanzar primero el buscador mientras la otra célula terminaba el seed. Con eso mantuvimos el release y el NPS del equipo subió 14 puntos al siguiente sprint.",
    sampleAnswerEn:
      "During the dictionary redesign two squads were clashing over priorities. I ran a structured retro, mapped dependencies on a mural board and we agreed to ship the search revamp while the second squad finalized the seed. The release stayed on track and team NPS went up 14 points the following sprint.",
    tipsEs: "Usa método STAR y menciona impacto en negocio o clima.",
    tipsEn: "Lean on STAR and tie the ending to business impact or team health.",
  },
  {
    slug: "feedback-dificil",
    title: "Feedback difícil",
    questionEs: "¿Cómo das feedback cuando alguien del equipo no está cumpliendo las expectativas?",
    questionEn: "How do you deliver feedback when someone is underperforming?",
    scenario: "One-on-one",
    tags: ["feedback", "communication", "coaching"],
    answerStructure: [
      { title: "Empatía", es: "Reconoce el contexto y valida el esfuerzo.", en: "Recognize context and validate the effort." },
      { title: "Hechos", es: "Describe ejemplos observables sin juicios personales.", en: "Describe observable examples without personal judgement." },
      { title: "Plan", es: "Propón acciones, métricas y seguimiento concreto.", en: "Co-create next steps, metrics and follow-up." },
    ],
    sampleAnswerEs:
      "En mi última retrospectiva noté que un dev llegaba tarde a las revisiones de código. En la 1:1 agradecí lo que sí aportaba, compartí tres ejemplos donde el retraso bloqueó despliegues y acordamos pair sessions dos veces por semana. A las tres semanas la cola de PR bajó 35% y documentamos el acuerdo en Notion.",
    sampleAnswerEn:
      "I noticed a dev constantly joining code reviews late. In the 1:1 I acknowledged his impact, walked through three concrete PRs that blocked the release and we agreed on two weekly pairing blocks. Three weeks later the PR queue dropped by 35% and we documented the new expectation in Notion.",
    tipsEs: "Cierra con seguimiento claro y ofrece ayuda.",
    tipsEn: "Close with a clear follow-up and offer support.",
  },
];

type QuizTemplateSeed = {
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  items: Array<{
    questionEs: string;
    questionEn: string;
    options: string[];
    answerIndex: number;
    explanationEs: string;
    explanationEn: string;
  }>;
};

const quizTemplatesSeed: QuizTemplateSeed[] = [
  {
    slug: "frontend-basics",
    title: "Fundamentos Frontend",
    description: "Repaso rápido de conceptos clave en React y CSS.",
    difficulty: Difficulty.easy,
    tags: ["frontend", "react", "css"],
    items: [
      {
        questionEs: "¿Qué hace el hook useMemo?",
        questionEn: "What does the useMemo hook do?",
        options: [
          "Memoriza un valor derivado para evitar cálculos costosos",
          "Dispara efectos secundarios al montar",
          "Actualiza refs sincronamente",
        ],
        answerIndex: 0,
        explanationEs: "useMemo memoriza operaciones pesadas basadas en dependencias.",
        explanationEn: "useMemo caches expensive computations based on dependencies.",
      },
      {
        questionEs: "¿Qué valor retorna grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))?",
        questionEn: "What does grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)) achieve?",
        options: [
          "Columnas fijas de 240px",
          "Columnas fluidas que se adaptan al ancho disponible",
          "Oculta columnas cuando no hay espacio",
        ],
        answerIndex: 1,
        explanationEs: "repeat auto-fit crea columnas que crecen hasta 1fr manteniendo 240px mínimos.",
        explanationEn: "auto-fit with minmax creates fluid columns that grow up to 1fr keeping 240px as the floor.",
      },
      {
        questionEs: "¿Cuál es la diferencia entre estado local y global en React?",
        questionEn: "What's the difference between local and global state in React?",
        options: [
          "Ninguna, ambos viven en useState",
          "El local pertenece al componente y el global se comparte vía context/store",
          "El global sólo se puede mutar con Redux",
        ],
        answerIndex: 1,
        explanationEs: "El estado local vive en un componente, el global se comparte con context o stores externos.",
        explanationEn: "Local state belongs to a component, global state is shared via context or state libraries.",
      },
    ],
  },
  {
    slug: "api-design",
    title: "Diseño de APIs",
    description: "Escenarios sobre seguridad y contratos en APIs modernas.",
    difficulty: Difficulty.medium,
    tags: ["backend", "api", "security"],
    items: [
      {
        questionEs: "¿Qué ventaja aporta GraphQL frente a REST en clientes móviles?",
        questionEn: "Which benefit does GraphQL bring to mobile clients versus REST?",
        options: [
          "Evita overfetching al pedir exactamente los campos necesarios",
          "Usa HTTP/3 por defecto",
          "Impide que existan errores 500",
        ],
        answerIndex: 0,
        explanationEs: "GraphQL permite definir exactamente los campos, reduciendo overfetching.",
        explanationEn: "GraphQL lets clients request exactly the fields they need, reducing overfetching.",
      },
      {
        questionEs: "¿Qué claim mínimo debes incluir en un JWT?",
        questionEn: "Which minimal claim should you include in a JWT?",
        options: ["sub (identificador del sujeto)", "color favorito", "URL del repositorio"],
        answerIndex: 0,
        explanationEs: "El claim sub identifica al usuario y es la base para validar permisos.",
        explanationEn: "The sub claim identifies the user and is required to validate permissions.",
      },
      {
        questionEs: "¿Qué estrategia reduce el riesgo de exponer tokens en un SPA?",
        questionEn: "Which strategy reduces the risk of leaking tokens in a SPA?",
        options: [
          "Almacenar el JWT en cookies httpOnly con SameSite strict",
          "Guardar tokens en localStorage",
          "Incluir el token en la URL",
        ],
        answerIndex: 0,
        explanationEs: "Cookies httpOnly con SameSite strict mitigan XSS y CSRF.",
        explanationEn: "httpOnly + SameSite strict cookies help mitigate XSS/CSRF.",
      },
    ],
  },
];

function buildMeaningEn(term: string, translation: string) {
  if (!translation) {
    return `In programming, "${term}" is a common concept used across the stack.`;
  }
  return `In programming, "${term}" refers to ${translation}.`;
}

function createSeedTerm(input: SeedTermInput): SeedTerm {
  const {
    term,
    translation,
    category,
    descriptionEs,
    descriptionEn,
    aliases = [],
    tags = [],
    example,
    secondExample,
    exerciseExample,
    whatEs,
    whatEn,
    howEs,
    howEn,
    languageOverride,
  } = input;

  const meaningEs = `En programación "${term}" se refiere a ${descriptionEs}.`;
  const meaningEn = descriptionEn ?? buildMeaningEn(term, translation);
  const resolvedWhatEs = whatEs ?? `Lo empleamos para ${descriptionEs} dentro de ${categoryContextEs[category]}.`;
  const resolvedWhatEn = whatEn ?? `We use it for ${categoryContextEn[category]}.`;
  const resolvedHowEs = howEs ?? howByCategoryEs[category](term);
  const resolvedHowEn = howEn ?? howByCategoryEn[category](term);
  const variantLanguage = languageOverride ?? variantLanguageByCategory[category];
  const exerciseCode = exerciseExample.code;

  return {
    term,
    translation,
    slug: toSlug(term),
    aliases,
    tags,
    category,
    titleEs: translation || term,
    titleEn: term,
    meaningEs,
    meaningEn,
    whatEs: resolvedWhatEs,
    whatEn: resolvedWhatEn,
    howEs: resolvedHowEs,
    howEn: resolvedHowEn,
    examples: [example, secondExample],
    variants: buildVariants(variantLanguage, example.code, example.noteEs ?? example.noteEn),
    useCases: buildUseCases(term, category, resolvedWhatEs, resolvedWhatEn),
    faqs: buildFaqs(term, translation, meaningEs, meaningEn, example, resolvedHowEs, resolvedHowEn, category),
    exercises: buildExercises(term, variantLanguage, exerciseCode, resolvedHowEs, resolvedHowEn),
  };
}

function buildVariants(language: Language, code: string, notes?: string): VariantSeed[] {
  return [
    {
      language,
      code,
      notes,
      level: language === Language.css ? SkillLevel.beginner : SkillLevel.intermediate,
    },
  ];
}

function buildUseCases(term: string, category: Category, whatEs: string, whatEn: string): UseCaseSeed[] {
  return [
    {
      context: UseCaseContext.project,
      summaryEs: `Aplica "${term}" en ${categoryContextEs[category]} para destrabar un caso real.`,
      summaryEn: `Apply "${term}" in ${categoryContextEn[category]} to unblock a real scenario.`,
      stepsEs: [
        `Describe el problema dentro de ${categoryContextEs[category]}.`,
        `Explica cómo "${term}" lo resuelve.`,
        "Comparte el impacto final.",
      ],
      stepsEn: [
        `Describe the problem inside ${categoryContextEn[category]}.`,
        `Explain how "${term}" solves it.`,
        "Share the outcome.",
      ],
      tipsEs: "Conecta el concepto con un proyecto o métrica real.",
      tipsEn: "Connect the concept with a real project or metric.",
    },
    {
      context: UseCaseContext.interview,
      summaryEs: `Explica "${term}" como si estuvieras frente a un líder técnico.`,
      summaryEn: `Explain "${term}" as if you were in front of a tech lead.`,
      stepsEs: [
        `Menciona qué resuelve "${term}".`,
        "Ilustra un ejemplo concreto.",
        "Cierra con el impacto en negocio.",
      ],
      stepsEn: [
        `Mention what "${term}" solves.`,
        "Illustrate a concrete example.",
        "Close with the business impact.",
      ],
      tipsEs: "Usa analogías claras y evita jerga innecesaria.",
      tipsEn: "Use clear analogies and avoid unnecessary jargon.",
    },
    {
      context: UseCaseContext.bug,
      summaryEs: `Usa "${term}" para diagnosticar o prevenir bugs relacionados.`,
      summaryEn: `Use "${term}" to diagnose or prevent related bugs.`,
      stepsEs: [
        "Identifica el síntoma o error.",
        `Relaciona el bug con "${term}".`,
        "Explica la solución aplicada.",
      ],
      stepsEn: [
        "Identify the symptom or error.",
        `Relate the bug to "${term}".`,
        "Explain the applied fix.",
      ],
      tipsEs: "Resalta logs o métricas relevantes.",
      tipsEn: "Highlight relevant logs or metrics.",
    },
  ].map(useCase => ({
    ...useCase,
    summaryEs: useCase.summaryEs || whatEs,
    summaryEn: useCase.summaryEn || whatEn,
  }));
}

function buildFaqs(
  term: string,
  translation: string,
  meaningEs: string,
  meaningEn: string,
  example: ExampleSnippet,
  howEs: string,
  howEn: string,
  category: Category,
): FaqSeed[] {
  const isFrontend = category === Category.frontend;

  // Improved CSS detection heuristic
  const isCss = isFrontend && (
    // CSS properties (lowercase with hyphens, no "use" prefix)
    (/^[a-z-]+$/.test(term) && !term.startsWith("use")) ||
    // Tailwind utilities (bg-, text-, flex-, grid-, etc.)
    /^(bg|text|flex|grid|w-|h-|p-|m-|border|rounded|shadow|gap|space|justify|items|content|overflow|position|top|bottom|left|right|inset|z-|opacity|transform|transition|animate|cursor|select|pointer|resize|outline|ring|divide|sr-|not-sr|focus|hover|active|disabled|group|peer|dark|sm:|md:|lg:|xl:|2xl:)/.test(term) ||
    // CSS functions
    term.includes("clamp") || term.includes("calc") || term.includes("var") ||
    // Specific CSS terms
    term === "aspect-ratio" || term === "backdrop-filter" || term === "scroll-snap"
  );

  const resetQ = {
    es: isCss ? `¿Cómo reiniciar o resetear ${term}?` : `¿Cómo reiniciar o resetear ${term}?`,
    en: `How to reset or reinitialize ${term}?`,
    ansEs: isCss
      ? `Usa el valor 'initial', 'unset' o el valor por defecto de la propiedad para anular estilos heredados.`
      : `Reinicia ${term} a su valor inicial respetando el contexto del concepto.`,
    ansEn: isCss
      ? `Use 'initial', 'unset' or the default property value to override inherited styles.`
      : `Reset ${term} to its initial value respecting the concept's context.`,
    snippet: isCss
      ? `.element {\n  ${term}: initial;\n}`
      : `// Reinicia ${term} a su estado inicial\n// Usa este patrón cuando necesites volver al estado base`,
  };

  const bestPracticesQ = {
    es: `¿Cuáles son las buenas prácticas para usar ${term}?`,
    en: `What are best practices for using ${term}?`,
    ansEs: isCss
      ? `Usa clases utilitarias o componentes, evita selectores anidados profundos y verifica el soporte en navegadores.`
      : `Aplica ${term} de forma consistente, respeta su ciclo de vida y valida entradas.`,
    ansEn: isCss
      ? `Use utility classes or components, avoid deep nesting and check browser support.`
      : `Apply ${term} consistently, respect its lifecycle and validate inputs.`,
    snippet: isCss
      ? `/* Buenas prácticas */\n.component {\n  /* Usa variables para consistencia */\n  ${term}: var(--${term});\n}`
      : `// Buenas prácticas para ${term}\n// 1. Usa de forma consistente\n// 2. Respeta dependencias y ciclo de vida\n// 3. Valida inputs y maneja errores`,
  };

  return [
    {
      questionEs: `¿Cómo explicas ${term} en una entrevista?`,
      questionEn: `How do you explain ${term} during an interview?`,
      answerEs: `${meaningEs} ${howEs}`,
      answerEn: `${meaningEn} ${howEn}`,
      snippet: example.code,
      category: translation,
      howToExplain: "Usa un ejemplo, enlaza con impacto real y ofrece métricas cuando sea posible.",
    },
    {
      questionEs: resetQ.es,
      questionEn: resetQ.en,
      answerEs: resetQ.ansEs,
      answerEn: resetQ.ansEn,
      snippet: resetQ.snippet,
      category: "reset",
      howToExplain: "Muestra cómo volver al estado inicial de forma segura.",
    },
    {
      questionEs: bestPracticesQ.es,
      questionEn: bestPracticesQ.en,
      answerEs: bestPracticesQ.ansEs,
      answerEn: bestPracticesQ.ansEn,
      snippet: bestPracticesQ.snippet,
      category: "best-practices",
      howToExplain: "Enfatiza seguridad, rendimiento e inmutabilidad.",
    },
  ];
}

function buildExercises(
  term: string,
  language: Language,
  code: string,
  howEs: string,
  howEn: string,
): ExerciseSeed[] {
  return [
    {
      titleEs: `Ejercicio ${term}`,
      titleEn: `${term} challenge`,
      promptEs: `Implementa "${term}" en un ejemplo práctico y explica cada paso.`,
      promptEn: `Implement "${term}" in a practical snippet and explain each step.`,
      difficulty: Difficulty.medium,
      solutions: [
        {
          language,
          code,
          explainEs: howEs,
          explainEn: howEn,
        },
      ],
    },
  ];
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toPascal(value: string) {
  return value
    .replace(/[^a-z0-9]+/gi, " ")
    .split(" ")
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

async function main() {
  const preparedTerms = dictionary.map(term => ({
    ...term,
    slug: term.slug ?? toSlug(term.term),
    aliases: term.aliases ?? [],
    tags: buildTags(term),
  }));

  // Limpieza total de tablas relacionadas
  await prisma.quizAttempt.deleteMany({});
  await prisma.quizTemplate.deleteMany({});
  await prisma.softSkillResponse.deleteMany({});
  await prisma.softSkillTemplate.deleteMany({});
  await prisma.contributorBadge.deleteMany({});
  await prisma.contribution.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.contributorProfile.deleteMany({});
  await prisma.insightMetric.deleteMany({});
  await prisma.termStats.deleteMany({});
  await prisma.useCase.deleteMany({});
  await prisma.faq.deleteMany({});
  await prisma.exercise.deleteMany({});

  const deletedHistory = await (prisma as any).termHistory?.deleteMany?.({});
  if (deletedHistory?.count) {
    incrementMetric("seed.term_history.deleted", deletedHistory.count);
  }

  const deletedTerms = await prisma.term.deleteMany({});
  incrementMetric("seed.terms.deleted", deletedTerms.count);
  await resetSequences([
    "Term",
    "TermVariant",
    "UseCase",
    "Faq",
    "Exercise",
    "TermStats",
    "InsightMetric",
    "SoftSkillTemplate",
    "SoftSkillResponse",
    "QuizTemplate",
    "QuizAttempt",
    "ContributorProfile",
    "Contribution",
    "Badge",
    "ContributorBadge",
  ]);

  const adminUser = process.env.ADMIN_USERNAME || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || process.env.ADMIN_TOKEN || "admin12345";
  const adminEmail = process.env.ADMIN_EMAIL || `${adminUser}@seed.local`;
  const hashed = await bcrypt.hash(adminPass, 10);

  const admin = await prisma.user.upsert({
    where: { username: adminUser },
    update: { password: hashed, email: adminEmail, role: "admin" },
    create: { username: adminUser, email: adminEmail, password: hashed, role: "admin" },
    select: { id: true, username: true, email: true },
  });

  const contributor = await prisma.contributorProfile.create({
    data: {
      userId: admin.id,
      displayName: admin.username,
      preferredLanguages: [Language.js, Language.ts, Language.css],
    },
  });

  const createdTerms: Prisma.TermGetPayload<{ include: { variants: true; useCases: true; faqs: true; exercises: true } }>[] = [];
  for (const term of preparedTerms) {
    const reviewMeta = { reviewedAt: new Date(), reviewedById: admin.id };
    const created = await prisma.term.create({
      data: {
        term: term.term,
        translation: term.translation,
        slug: term.slug,
        titleEs: term.titleEs,
        titleEn: term.titleEn,
        aliases: term.aliases,
        tags: term.tags,
        category: term.category,
        meaning: term.meaningEs,
        meaningEs: term.meaningEs,
        meaningEn: term.meaningEn,
        what: term.whatEs ?? term.whatEn ?? "",
        whatEs: term.whatEs,
        whatEn: term.whatEn,
        how: term.howEs ?? term.howEn ?? "",
        howEs: term.howEs,
        howEn: term.howEn,
        examples: term.examples ?? [],
        status: ReviewStatus.approved,
        ...reviewMeta,
        createdById: admin.id,
        updatedById: admin.id,
        variants: term.variants?.length
          ? {
            create: term.variants.map(variant => ({
              language: variant.language,
              snippet: variant.code,
              notes: variant.notes,
              level: variant.level ?? SkillLevel.intermediate,
              status: ReviewStatus.approved,
              ...reviewMeta,
            })),
          }
          : undefined,
        useCases: term.useCases?.length
          ? {
            create: term.useCases.map(useCase => ({
              context: useCase.context,
              summary: [useCase.summaryEs, useCase.summaryEn].filter(Boolean).join(" | "),
              steps: useCase.stepsEs.map((es, index) => ({
                es,
                en: useCase.stepsEn[index] ?? useCase.stepsEn[useCase.stepsEn.length - 1] ?? es,
              })),
              tips: [useCase.tipsEs, useCase.tipsEn].filter(Boolean).join(" | ") || undefined,
              status: ReviewStatus.approved,
              ...reviewMeta,
            })),
          }
          : undefined,
        faqs: term.faqs?.length
          ? {
            create: term.faqs.map(faq => ({
              questionEs: faq.questionEs,
              questionEn: faq.questionEn,
              answerEs: faq.answerEs,
              answerEn: faq.answerEn,
              snippet: faq.snippet,
              category: faq.category,
              howToExplain: faq.howToExplain,
              status: ReviewStatus.approved,
              ...reviewMeta,
            })),
          }
          : undefined,
        exercises: term.exercises?.length
          ? {
            create: term.exercises.map(exercise => ({
              titleEs: exercise.titleEs,
              titleEn: exercise.titleEn,
              promptEs: exercise.promptEs,
              promptEn: exercise.promptEn,
              difficulty: exercise.difficulty,
              solutions: exercise.solutions,
              status: ReviewStatus.approved,
              ...reviewMeta,
            })),
          }
          : undefined,
      },
      include: { variants: true, useCases: true, faqs: true, exercises: true },
    });
    createdTerms.push(created);

    await prisma.termStats.create({
      data: {
        termId: created.id,
        contextHits: { dictionary: 0 },
        languageHits: { es: 0 },
      },
    });

    await prisma.contribution.create({
      data: {
        contributorId: contributor.id,
        userId: admin.id,
        termId: created.id,
        entityId: created.id,
        entityType: ContributionEntity.term,
        action: ContributionAction.create,
        points: 30,
        metadata: { source: "seed", category: term.category },
      },
    });
  }

  if (createdTerms.length && (prisma as any).termHistory?.createMany) {
    await (prisma as any).termHistory.createMany({
      data: createdTerms.map(created => ({
        termId: created.id,
        snapshot: snapshotTerm(created),
        action: "seed" as any,
      })),
    });
  }
  incrementMetric("seed.terms.created", createdTerms.length);

  await seedSoftSkills(admin.id);
  await seedQuizzes(admin.id);
  await seedBadges(contributor.id);

  incrementMetric("seed.admin.upserted");
  logger.info(
    { createdTerms: createdTerms.length, adminUser, metrics: getMetricsSnapshot() },
    "seed.completed",
  );
}

main()
  .catch(err => {
    logger.error({ err }, "seed.failed");
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());

function buildTags(term: SeedTerm) {
  const bucket = new Set<string>();
  const add = (value?: string) => {
    if (!value) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    bucket.add(trimmed.toLowerCase());
    bucket.add(toSlug(trimmed));
    bucket.add(toPascal(trimmed));
  };
  add(term.term);
  add(term.translation);
  add(term.slug);
  add(term.titleEs);
  add(term.titleEn);
  add(term.category);
  (term.aliases || []).forEach(alias => add(alias));
  (term.tags || []).forEach(tag => add(tag));
  return Array.from(bucket).filter(Boolean);
}

async function resetSequences(tableNames: string[]) {
  if (!tableNames.length) return;
  for (const table of tableNames) {
    const relation = `'\"${table.replace(/"/g, '""')}\"'`;
    try {
      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence(${relation}, 'id'), 1, false);`,
      );
    } catch (error) {
      logger.warn({ err: error, table }, "seed.reset_sequences_failed");
    }
  }
}

async function seedSoftSkills(adminId: number) {
  for (const template of softSkillTemplatesSeed) {
    const created = await prisma.softSkillTemplate.create({
      data: {
        slug: template.slug,
        title: template.title,
        questionEs: template.questionEs,
        questionEn: template.questionEn,
        scenario: template.scenario,
        tags: template.tags,
        answerStructure: template.answerStructure,
        sampleAnswerEs: template.sampleAnswerEs,
        sampleAnswerEn: template.sampleAnswerEn,
        tipsEs: template.tipsEs,
        tipsEn: template.tipsEn,
      },
    });
    await prisma.softSkillResponse.createMany({
      data: [
        {
          templateId: created.id,
          language: "es",
          tone: "storytelling",
          answer: template.sampleAnswerEs,
        },
        {
          templateId: created.id,
          language: "en",
          tone: "concise",
          answer: template.sampleAnswerEn,
        },
      ],
    });
  }
  incrementMetric("seed.soft_skills.created", softSkillTemplatesSeed.length);
}

async function seedQuizzes(adminId: number) {
  for (const template of quizTemplatesSeed) {
    const created = await prisma.quizTemplate.create({
      data: {
        slug: template.slug,
        title: template.title,
        description: template.description,
        difficulty: template.difficulty,
        tags: template.tags,
        items: template.items,
      },
    });
    const answers = template.items.map((item, index) => ({
      question: item.questionEs,
      option: item.options[item.answerIndex],
      selectedIndex: item.answerIndex,
      correct: true,
      order: index + 1,
    }));
    await prisma.quizAttempt.create({
      data: {
        templateId: created.id,
        userId: adminId,
        score: template.items.length,
        totalQuestions: template.items.length,
        answers,
      },
    });
  }
  incrementMetric("seed.quizzes.created", quizTemplatesSeed.length);
}

async function seedBadges(contributorId: number) {
  const templates = [
    { slug: "polyglot-js", title: "Mentor JS", icon: "🟨", category: "language", language: Language.js },
    { slug: "polyglot-css", title: "Artista CSS", icon: "🎨", category: "language", language: Language.css },
    { slug: "guardian-review", title: "Guardian", icon: "🛡️", category: "quality", language: null },
  ];
  for (const template of templates) {
    const badge = await prisma.badge.create({
      data: {
        slug: template.slug,
        title: template.title,
        description: template.title,
        icon: template.icon,
        category: template.category,
        language: template.language ?? undefined,
      },
    });
    if (template.slug !== "guardian-review") {
      await prisma.contributorBadge.create({
        data: {
          badgeId: badge.id,
          contributorId,
          reason: "Semilla inicial",
        },
      });
    }
  }
}

function snapshotTerm<T>(term: T) {
  try {
    return JSON.parse(JSON.stringify(term));
  } catch {
    return term;
  }
}

function dedupeTerms(terms: SeedTerm[]) {
  const map = new Map<string, SeedTerm>();

  for (const term of terms) {
    const key = term.term.trim().toLowerCase();
    if (!key) continue;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        ...term,
        aliases: term.aliases ?? [],
        tags: term.tags ?? [],
      });
      continue;
    }

    map.set(key, {
      ...existing,
      ...term,
      slug: existing.slug ?? term.slug,
      aliases: mergeUnique(existing.aliases ?? [], term.aliases ?? []),
      tags: mergeUnique(existing.tags ?? [], term.tags ?? []),
      examples: term.examples?.length ? term.examples : existing.examples,
      variants: mergeCollection(existing.variants, term.variants),
      useCases: mergeCollection(existing.useCases, term.useCases),
      faqs: mergeCollection(existing.faqs, term.faqs),
      exercises: mergeCollection(existing.exercises, term.exercises),
    });
  }

  return Array.from(map.values());
}

function mergeUnique<T>(a: T[], b: T[]) {
  return Array.from(new Set([...a, ...b].filter(Boolean)));
}

function mergeCollection<T>(a?: T[], b?: T[]) {
  if (!a?.length) return b ?? [];
  if (!b?.length) return a;
  return [...a, ...b];
}
