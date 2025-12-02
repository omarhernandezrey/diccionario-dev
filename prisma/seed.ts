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
import { createHash } from "crypto";
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

const SEARCH_EXPR = `lower((coalesce("term",'') || ' ' || coalesce("translation",'') || ' ' || coalesce("meaning",'') || ' ' || coalesce("what",'') || ' ' || coalesce("how",'') || ' ' || coalesce("aliases"::text,'') || ' ' || coalesce("tags"::text,'')))`;

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
    slug: inputSlug,
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
  const normalizedTags = Array.from(new Set([...tags, ...(languageOverride === Language.css ? ["css"] : [])]));
  const exerciseCode = exerciseExample.code;

  return {
    term,
    translation,
    slug: inputSlug ?? toSlug(term),
    aliases,
    tags: normalizedTags,
    category,
    titleEs: translation || term,
    titleEn: term,
    meaningEs,
    meaningEn,
    whatEs: resolvedWhatEs,
    whatEn: resolvedWhatEn,
    howEs: resolvedHowEs,
    howEn: resolvedHowEn,
    examples: [example, secondExample, exerciseExample],
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

function shortHash(value: string) {
  return createHash("sha1").update(value).digest("hex").slice(0, 8);
}

function toSlug(value: string) {
  const normalized = value.trim().toLowerCase();
  const base = normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!base) {
    return `term-${shortHash(normalized || value || "term")}`;
  }
  if (base !== normalized) {
    return `${base}-${shortHash(normalized || value)}`;
  }
  return base;
}

function ensureContentDepth(term: SeedTerm): SeedTerm {
  const meaningEs = ensureLength(
    term.meaningEs,
    220,
    `${term.translation || term.term} abarca ${categoryContextEs[term.category]} y se usa en escenarios reales. Describe propósito, beneficios, riesgos comunes y cómo se conecta con otros elementos del stack. Incluye consideraciones de accesibilidad, SEO, rendimiento, mantenibilidad, validación y pruebas automatizadas para evitar regresiones.`,
  );
  const whatEs = ensureLength(
    term.whatEs,
    150,
    `Se aplica para que ${categoryContextEs[term.category]} sea claro y coherente. Ayuda a comunicar intención semántica, mejorar la accesibilidad y reducir ambigüedad para el equipo y las herramientas de análisis.`,
  );
  const howEs = ensureLength(
    term.howEs,
    140,
    `Pasos: declara ${term.term} con atributos obligatorios, valida compatibilidad, prueba en navegadores, agrega linters/tests y documenta buenas prácticas. Considera fallbacks y errores frecuentes.`,
  );

  const meaningEn = term.meaningEn ?? buildMeaningEn(term.term, term.translation);
  const whatEn =
    term.whatEn ??
    `It is applied across ${categoryContextEn[term.category]} to keep semantics clear, improve accessibility and reduce ambiguity for teams and tooling.`;
  const howEn =
    term.howEn ??
    `Steps: declare ${term.term} with required attributes, validate compatibility, test in browsers, add linters/tests and document best practices.`;

  return {
    ...term,
    meaningEs,
    meaningEn,
    whatEs,
    whatEn,
    howEs,
    howEn,
  };
}

function ensureLength(value: string | undefined, min: number, padding: string) {
  const base = (value ?? "").trim();
  if (base.length >= min) return base;
  const combined = base ? `${base} ${padding}` : padding;
  if (combined.length >= min) return combined;
  return `${combined} Más detalles: documenta decisiones, añade ejemplos y provee caminos de prueba reproducibles.`;
}

function normalizeSelectorNames(term: SeedTerm): SeedTerm {
  if (term.category !== Category.frontend) return term;
  const clean = stripColons(term.term);
  if (clean === term.term) return term;
  const aliases = mergeUnique(term.aliases ?? [], [term.term]);
  return { ...term, term: clean, aliases };
}

function stripColons(value: string) {
  return value.replace(/^:+/, "").replace(/:+$/, "") || value;
}

function condenseExamples(term: SeedTerm): SeedTerm {
  const targetsCss = isCssTerm(term);
  const targetsHtml = isHtmlTagged(term);
  if (!(targetsCss || targetsHtml)) return term;
  if (!term.examples?.length) return term;

  const examples = term.examples;
  const htmlExample = examples.find(ex => ex.code?.includes("<"));
  const hoverExample = examples.find(ex => ex.code?.includes(":hover"));
  const best = htmlExample ?? hoverExample ?? examples[0];
  return { ...term, examples: [best] };
}

function ensureVariantPreview(term: SeedTerm): SeedTerm {
  const normalized = normalizeVariants(term.variants);
  if (!normalized.length) return { ...term, variants: normalized };

  // Si es un término CSS/Tailwind, fuerza a una sola variante CSS basada en el mejor snippet disponible
  if (isCssTerm(term)) {
    const bestSnippet = pickBestCssSnippet(term);
    const enriched = ensureRichCssSnippet(term.term, bestSnippet);
    const cssVariant: VariantSeed = {
      language: enriched.language,
      code: enriched.code,
      notes: term.examples?.[0]?.noteEs ?? term.examples?.[0]?.noteEn,
      level: SkillLevel.beginner,
    };
    return { ...term, variants: [cssVariant] };
  }

  const variants = normalized.map(variant => {
    if (
      variant.language === Language.css &&
      term.category === Category.frontend &&
      term.examples?.[0]?.code
    ) {
      const exampleCode = term.examples[0].code;
      if ((variant.code?.length || 0) < exampleCode.length / 2) {
        return { ...variant, code: exampleCode };
      }
    }
    return variant;
  });
  return { ...term, variants };
}

function normalizeVariants(list?: VariantSeed[]): VariantSeed[] {
  if (!list?.length) return [];
  const byLanguage = new Map<Language, VariantSeed>();

  for (const variant of list) {
    const lang = variant.language;
    const current = byLanguage.get(lang);
    if (!current) {
      byLanguage.set(lang, variant);
      continue;
    }

    const currentLen = current.code?.length ?? 0;
    const incomingLen = variant.code?.length ?? 0;
    const currentNotes = current.notes ? 1 : 0;
    const incomingNotes = variant.notes ? 1 : 0;

    const isBetter =
      incomingLen > currentLen ||
      (incomingLen === currentLen && incomingNotes > currentNotes);

    if (isBetter) {
      byLanguage.set(lang, variant);
    }
  }

  return Array.from(byLanguage.values());
}

function isCssTerm(term: SeedTerm) {
  const name = term.term.toLowerCase();
  const tags = (term.tags || []).map(tag => tag.toLowerCase());
  const isProperty = name.includes("-") || /^[a-z-]+$/.test(name);
  const isTailwind = tags.some(tag => tag.includes("tailwind") || tag.startsWith("bg-") || tag.startsWith("text-"));
  return term.category === Category.frontend && (isProperty || isTailwind || tags.includes("css"));
}

function isHtmlTagged(term: SeedTerm) {
  const tags = (term.tags || []).map(tag => tag.toLowerCase());
  return term.category === Category.frontend && tags.includes("html");
}

function pickBestCssSnippet(term: SeedTerm) {
  const examples = term.examples ?? [];
  const htmlExample = examples.find(ex => ex.code?.includes("<"))?.code;
  const hoverExample = examples.find(ex => ex.code?.includes(":hover"))?.code;
  const cssVariant = term.variants?.find(v => v.language === Language.css)?.code;
  const plainVariant = term.variants?.[0]?.code;
  return htmlExample || hoverExample || cssVariant || plainVariant || "";
}

function ensureRichCssSnippet(property: string, snippet: string): { code: string; language: Language } {
  const minLength = 180;
  if ((snippet?.length || 0) >= minLength && snippet.includes("<")) {
    return { code: snippet, language: Language.html };
  }

  const selectorDemo = buildSelectorDemo(property);
  if (selectorDemo) return { code: selectorDemo, language: Language.html };

  const propDemo = buildPropertyDemo(property);
  if (propDemo) return { code: propDemo, language: Language.html };

  const lower = property.toLowerCase();
  const isHeight = lower.includes("height");
  const isWidth = lower.includes("width");
  const isSize = isHeight || isWidth;

  if (isSize) {
    const demoProp = property;
    const html = `
<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    padding: 16px;
    background: #f8fafc;
  }
  .card {
    background: linear-gradient(135deg, #e0f2fe, #e2e8f0);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0f172a;
    font-weight: 600;
    box-shadow: 0 6px 18px rgba(15,23,42,0.12);
  }
  .card.fixed { ${demoProp}: 240px; }
  .card.auto { ${demoProp}: auto; min-${isHeight ? "height" : "width"}: 140px; }
  .card.viewport { ${demoProp}: ${isHeight ? "40vh" : "60vw"}; }
</style>
<div class="grid">
  <div class="card fixed">${demoProp}: ${isHeight ? "240px" : "320px"}</div>
  <div class="card auto">${demoProp}: auto</div>
  <div class="card viewport">${demoProp}: ${isHeight ? "40vh" : "60vw"}</div>
</div>
`.trim();
    return { code: html, language: Language.html };
  }

  // Fallback: envolver el CSS en un HTML mínimo para que se vea algo
  const hasHover = (snippet || "").includes(":hover");
  const forcedHover = hasHover ? (snippet || "").replace(/:hover/g, ".force-hover") : "";

  const wrapped = `
<style>
${snippet || "/* demo */"}
.force-hover { ${hasHover ? "" : "transform: scale(1.02); box-shadow: 0 8px 20px rgba(15,23,42,0.18);" } }
${forcedHover}
.demo-box { padding: 16px; background: #e2e8f0; border-radius: 12px; color: #0f172a; font-weight: 600; display: inline-block; }
.stack { display: flex; gap: 12px; align-items: flex-start; }
</style>
<div class="stack">
  <div class="demo-box">Normal (${property})</div>
  <div class="demo-box force-hover">Hover (${property})</div>
</div>
`.trim();
  return { code: wrapped, language: Language.html };
}

function buildSelectorDemo(term: string): string | null {
  const name = term.toLowerCase();
  const demos: Record<string, string> = {
    "universal-selector": `
<style>
  * { box-sizing: border-box; margin: 0; }
  section { padding: 16px; background: #f8fafc; border-radius: 12px; display: grid; gap: 10px; }
  article { background: #e2e8f0; padding: 12px; border-radius: 10px; color: #0f172a; }
</style>
<section>
  <article>El selector universal (*) reinicia margenes y aplica box-sizing.</article>
  <article>Todos los elementos heredan este estilo base.</article>
</section>
`.trim(),
    "type-selector": `
<style>
  h3 { color: #0f172a; margin-bottom: 4px; }
  p { color: #334155; }
  code { background: #e0f2fe; padding: 4px 8px; border-radius: 6px; }
</style>
<div>
  <h3>Encabezado (type selector: h3)</h3>
  <p>Los selectores de tipo apuntan a etiquetas HTML directamente.</p>
  <code>h3 { color: #0f172a; }</code>
</div>
`.trim(),
    "class-selector": `
<style>
  .badge { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 999px; background: #ecfeff; color: #0f172a; font-weight: 600; }
  .badge .dot { width: 8px; height: 8px; border-radius: 999px; background: #0ea5e9; }
</style>
<div class="badge"><span class="dot"></span>class selector (.badge)</div>
`.trim(),
    "id-selector": `
<style>
  #hero { padding: 20px; border-radius: 14px; background: linear-gradient(135deg, #cffafe, #e0f2fe); color: #0f172a; font-weight: 700; }
</style>
<section id="hero">Se aplica a un único elemento (#hero)</section>
`.trim(),
    "attribute-selector": `
<style>
  button[data-variant="primary"] { background: #0ea5e9; color: #fff; border: none; padding: 10px 16px; border-radius: 10px; }
  button[data-variant="ghost"] { background: transparent; color: #0ea5e9; border: 1px solid #0ea5e9; padding: 10px 16px; border-radius: 10px; }
</style>
<div style="display:flex; gap:12px;">
  <button data-variant="primary">[data-variant="primary"]</button>
  <button data-variant="ghost">[data-variant="ghost"]</button>
</div>
`.trim(),
    "child-selector": `
<style>
  .card > .title { color: #0f172a; font-weight: 700; }
  .card > .meta { color: #475569; }
  .card { background: #e2e8f0; padding: 16px; border-radius: 12px; }
</style>
<div class="card">
  <div class="title">Hijo directo (.card > .title)</div>
  <div class="meta">Solo aplica a hijos directos, no a descendientes profundos.</div>
</div>
`.trim(),
    "descendant-selector": `
<style>
  .article .tag { background: #e0f2fe; color: #0f172a; padding: 6px 10px; border-radius: 8px; display: inline-block; }
</style>
<div class="article">
  <header><span class="tag">.article .tag</span></header>
  <p style="color:#334155;">Selecciona cualquier descendiente con clase .tag.</p>
</div>
`.trim(),
    "sibling-selector": `
<style>
  .item ~ .item { color: #0ea5e9; }
</style>
<div>
  <div class="item">Primer ítem (no aplica)</div>
  <div class="item">Hermano siguiente (~)</div>
  <div class="item">Otro hermano (~)</div>
</div>
`.trim(),
    "adjacent-sibling-selector": `
<style>
  .alert + .alert { border-left: 4px solid #f97316; }
  .alert { padding: 12px; background: #fff7ed; margin: 6px 0; border-radius: 10px; }
</style>
<div>
  <div class="alert">Primer .alert</div>
  <div class="alert">Adjacente (+) con borde</div>
  <div class="alert">Adjacente (+) con borde</div>
</div>
`.trim(),
    "group-selector": `
<style>
  h1, h2, h3 { color: #0f172a; margin: 0; }
  .stack { display: grid; gap: 8px; }
</style>
<div class="stack">
  <h1>Grupo h1, h2, h3</h1>
  <h2>Todos comparten color</h2>
  <h3>Selector agrupado</h3>
</div>
`.trim(),
    "pseudo-class-selector": `
<style>
  .btn { background: #0ea5e9; color: #fff; padding: 10px 16px; border: none; border-radius: 10px; transition: transform .15s ease, box-shadow .15s ease; }
  .btn:hover { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(14,165,233,0.35); }
  .btn:active { transform: translateY(0); box-shadow: 0 4px 10px rgba(14,165,233,0.25); }
</style>
<button class="btn">:hover / :active</button>
`.trim(),
    "pseudo-element-selector": `
<style>
  .pill { position: relative; padding: 10px 16px 10px 36px; background: #e0f2fe; color: #0f172a; border-radius: 999px; display: inline-block; }
  .pill::before { content: ''; position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 8px; height: 8px; border-radius: 999px; background: #0ea5e9; }
</style>
<span class="pill">::before indicador</span>
`.trim(),
    "before": `
<style>
  .label { position: relative; display: inline-block; padding: 10px 14px 10px 30px; background: #e0f2fe; color: #0f172a; border-radius: 10px; font-weight: 600; }
  .label::before { content: "●"; position: absolute; left: 10px; color: #0ea5e9; }
</style>
<span class="label">::before</span>
`.trim(),
    "after": `
<style>
  .tag { position: relative; display: inline-block; padding: 10px 14px 10px 14px; background: #eef2ff; color: #312e81; border-radius: 10px; font-weight: 600; }
  .tag::after { content: "NEW"; margin-left: 8px; background:#6366f1; color:#fff; padding:2px 6px; border-radius: 6px; font-size: 12px; }
</style>
<span class="tag">::after</span>
`.trim(),
    "first-letter": `
<style>
  .lead::first-letter { font-size: 200%; color: #0ea5e9; font-weight: 700; }
</style>
<p class="lead" style="max-width:360px; color:#334155;">::first-letter resalta la primera letra de un bloque de texto.</p>
`.trim(),
    "first-line": `
<style>
  .snippet::first-line { font-weight: 700; color: #0f172a; }
</style>
<p class="snippet" style="max-width:360px; color:#334155;">::first-line aplica estilo a la primera línea del párrafo; el resto mantiene el estilo normal.</p>
`.trim(),
    "selection": `
<style>
  ::selection { background: #0ea5e9; color: #fff; }
</style>
<p style="max-width:360px; color:#334155;">Selecciona este texto para ver ::selection.</p>
`.trim(),
    "placeholder": `
<style>
  input::placeholder { color: #94a3b8; font-style: italic; }
</style>
<input placeholder="::placeholder estilizado" style="padding:10px 12px; border:1px solid #cbd5e1; border-radius:10px;" />
`.trim(),
    "marker": `
<style>
  ul.custom ::marker { color: #0ea5e9; content: "▸ "; font-size: 14px; }
</style>
<ul class="custom" style="color:#334155; padding-left:18px;">
  <li>::marker personalizado</li>
  <li>Lista con marcador azul</li>
</ul>
`.trim(),
    "backdrop": `
<style>
  dialog::backdrop { background: rgba(15,23,42,0.55); }
  dialog { border: none; border-radius: 12px; padding: 18px; box-shadow: 0 10px 30px rgba(15,23,42,0.35); }
</style>
<dialog open> ::backdrop estiliza el fondo del dialog</dialog>
`.trim(),
    "cue": `
<style>
  ::cue { color: #0ea5e9; background: rgba(14,165,233,0.1); }
</style>
<video controls width="280">
  <track kind="captions" srclang="en" label="EN" default src="data:text/vtt,WEBVTT%0A%0A00:00.000 --> 00:03.000%0A::cue en subtítulos" />
</video>
`.trim(),
    "spelling-error": `
<style>
  ::spelling-error { text-decoration: wavy underline #ef4444; }
</style>
<p contenteditable="true" style="border:1px solid #cbd5e1; padding:10px; border-radius:10px;">Errores se subrayan con ::spelling-error</p>
`.trim(),
    "grammar-error": `
<style>
  ::grammar-error { text-decoration: underline double #f97316; }
</style>
<p contenteditable="true" style="border:1px solid #cbd5e1; padding:10px; border-radius:10px;">::grammar-error resalta gramática</p>
`.trim(),
    "negation-selector": `
<style>
  .tag { display: inline-block; padding: 8px 12px; border-radius: 10px; margin-right: 6px; }
  .tag:not(.primary) { background: #e2e8f0; color: #0f172a; }
  .tag.primary { background: #0ea5e9; color: #fff; }
</style>
<div>
  <span class="tag primary">.primary</span>
  <span class="tag">:not(.primary)</span>
  <span class="tag">:not(.primary)</span>
</div>
`.trim(),
    "hover": `
<style>
  .btn { background: #0ea5e9; color: #fff; padding: 10px 16px; border: none; border-radius: 10px; transition: transform .15s ease, box-shadow .15s ease; }
  .btn:hover, .btn.force-hover { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(14,165,233,0.35); }
</style>
<div style="display:flex; gap:12px; align-items:center;">
  <button class="btn">Normal</button>
  <button class="btn force-hover">:hover</button>
</div>
`.trim(),
    "active": `
<style>
  .btn { background: #0ea5e9; color: #fff; padding: 10px 16px; border: none; border-radius: 10px; transition: transform .1s ease, box-shadow .1s ease; }
  .btn:active, .btn.force-active { transform: translateY(0); box-shadow: 0 4px 10px rgba(14,165,233,0.25); }
</style>
<div style="display:flex; gap:12px; align-items:center;">
  <button class="btn">Normal</button>
  <button class="btn force-active">:active</button>
</div>
`.trim(),
    "focus": `
<style>
  .input { padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 10px; outline: none; transition: box-shadow .15s ease, border-color .15s ease; }
  .input:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,0.25); }
</style>
<input class="input" placeholder=":focus aplica al enfocar" />
`.trim(),
    "focus-visible": `
<style>
  .link { padding: 10px 12px; border-radius: 10px; color: #0ea5e9; outline: none; }
  .link:focus-visible { box-shadow: 0 0 0 3px rgba(14,165,233,0.35); }
</style>
<a href="#" class="link">Tab para ver :focus-visible</a>
`.trim(),
    "focus-within": `
<style>
  .field { padding: 14px; border: 1px solid #cbd5e1; border-radius: 12px; transition: border-color .15s ease, box-shadow .15s ease; display: grid; gap: 8px; }
  .field:focus-within { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,0.2); }
</style>
<label class="field">
  <span style="color:#0f172a;font-weight:600;">:focus-within en el contenedor</span>
  <input placeholder="Foca aquí" style="padding:10px 12px; border:1px solid #cbd5e1; border-radius:10px; outline:none;" />
</label>
`.trim(),
    "visited": `
<style>
  a { color: #0ea5e9; }
  a:visited { color: #6366f1; }
</style>
<a href="https://example.com">:visited cambia color tras visitar</a>
`.trim(),
    "link": `
<style>
  a:link { color: #0ea5e9; text-decoration: underline; }
  a:visited { color: #6366f1; }
</style>
<div style="display:grid; gap:8px;">
  <a href="https://example.com">:link antes de visitar</a>
  <a href="https://example.com">:visited después de visitar</a>
</div>
`.trim(),
    "checked": `
<style>
  .toggle { display:flex; gap:8px; align-items:center; font-weight:600; color:#0f172a; }
  input[type="checkbox"]:checked + span { color: #0ea5e9; }
</style>
<label class="toggle">
  <input type="checkbox" checked />
  <span>:checked aplica estilo al label</span>
</label>
`.trim(),
    "disabled": `
<style>
  button:disabled { background:#e2e8f0; color:#94a3b8; border:none; padding:10px 16px; border-radius:10px; }
</style>
<button disabled>:disabled</button>
`.trim(),
    "enabled": `
<style>
  button:enabled { background:#0ea5e9; color:#fff; border:none; padding:10px 16px; border-radius:10px; }
</style>
<button>:enabled</button>
`.trim(),
    "required": `
<style>
  input:required { border:1px solid #0ea5e9; box-shadow: 0 0 0 2px rgba(14,165,233,0.2); }
</style>
<input required placeholder=":required" style="padding:10px 12px; border-radius:10px; outline:none;" />
`.trim(),
    "optional": `
<style>
  input:optional { border:1px dashed #94a3b8; padding:10px 12px; border-radius:10px; }
</style>
<input placeholder=":optional" />
`.trim(),
    "placeholder-shown": `
<style>
  input:placeholder-shown { background:#f8fafc; }
</style>
<input placeholder=":placeholder-shown" style="padding:10px 12px; border:1px solid #cbd5e1; border-radius:10px;" />
`.trim(),
    "read-only": `
<style>
  input:read-only { background:#e2e8f0; color:#475569; }
</style>
<input value=":read-only" readonly style="padding:10px 12px; border:1px solid #cbd5e1; border-radius:10px;" />
`.trim(),
    "read-write": `
<style>
  input:read-write { border:1px solid #0ea5e9; }
</style>
<input value="editable" style="padding:10px 12px; border:1px solid #cbd5e1; border-radius:10px;" />
`.trim(),
    "target": `
<style>
  :target { background:#e0f2fe; padding:12px; border-radius:10px; display:inline-block; }
</style>
<a href="#demo-target">Ir a #demo-target</a>
<div id="demo-target" style="margin-top:8px;">:target aplicado aquí</div>
`.trim(),
    "first-child": `
<style>
  .list :first-child { color:#0ea5e9; font-weight:700; }
</style>
<ul class="list" style="display:grid; gap:6px; color:#334155; padding-left:16px;">
  <li>:first-child</li>
  <li>Elemento 2</li>
  <li>Elemento 3</li>
</ul>
`.trim(),
    "last-child": `
<style>
  .list :last-child { color:#0ea5e9; font-weight:700; }
</style>
<ul class="list" style="display:grid; gap:6px; color:#334155; padding-left:16px;">
  <li>Elemento 1</li>
  <li>Elemento 2</li>
  <li>:last-child</li>
</ul>
`.trim(),
    "only-child": `
<style>
  .wrapper :only-child { color:#0ea5e9; font-weight:700; }
</style>
<div class="wrapper" style="padding:12px; background:#f8fafc; border-radius:12px;">
  <p>:only-child aplica cuando es el único</p>
</div>
`.trim(),
    "nth-child": `
<style>
  .list li:nth-child(2) { color:#0ea5e9; font-weight:700; }
</style>
<ol class="list" style="display:grid; gap:6px; color:#334155; padding-left:16px;">
  <li>1</li>
  <li>2 (:nth-child(2))</li>
  <li>3</li>
</ol>
`.trim(),
    "nth-last-child": `
<style>
  .list li:nth-last-child(2) { color:#0ea5e9; font-weight:700; }
</style>
<ol class="list" style="display:grid; gap:6px; color:#334155; padding-left:16px;">
  <li>1</li>
  <li>2</li>
  <li>3 (:nth-last-child(2))</li>
</ol>
`.trim(),
    "first-of-type": `
<style>
  .wrap p:first-of-type { color:#0ea5e9; font-weight:700; }
</style>
<div class="wrap" style="display:grid; gap:6px; color:#334155;">
  <p>:first-of-type (primer p)</p>
  <p>Segundo p</p>
</div>
`.trim(),
    "last-of-type": `
<style>
  .wrap p:last-of-type { color:#0ea5e9; font-weight:700; }
</style>
<div class="wrap" style="display:grid; gap:6px; color:#334155;">
  <p>Primer p</p>
  <p>:last-of-type (último p)</p>
</div>
`.trim(),
    "only-of-type": `
<style>
  .wrap p:only-of-type { color:#0ea5e9; font-weight:700; }
</style>
<div class="wrap" style="display:grid; gap:6px; color:#334155;">
  <p>:only-of-type (único p)</p>
</div>
`.trim(),
    "nth-of-type": `
<style>
  .wrap p:nth-of-type(2) { color:#0ea5e9; font-weight:700; }
</style>
<div class="wrap" style="display:grid; gap:6px; color:#334155;">
  <p>p 1</p>
  <p>p 2 (:nth-of-type(2))</p>
  <p>p 3</p>
</div>
`.trim(),
    "nth-last-of-type": `
<style>
  .wrap p:nth-last-of-type(2) { color:#0ea5e9; font-weight:700; }
</style>
<div class="wrap" style="display:grid; gap:6px; color:#334155;">
  <p>p 1</p>
  <p>p 2</p>
  <p>p 3 (:nth-last-of-type(2))</p>
</div>
`.trim(),
    "root": `
<style>
  :root { --primary: #0ea5e9; }
  .pill { background: var(--primary); color:#fff; padding:10px 14px; border-radius:999px; display:inline-block; }
</style>
<span class="pill">:root define variables</span>
`.trim(),
    "empty": `
<style>
  .box:empty { background:#fee2e2; }
  .box { min-height:48px; background:#e2e8f0; border-radius:12px; padding:8px; }
</style>
<div class="box"></div>
`.trim(),
    "not": `
<style>
  .item:not(.primary) { color:#0ea5e9; }
</style>
<div style="display:flex; gap:10px;">
  <span class="item primary">.primary</span>
  <span class="item">:not(.primary)</span>
</div>
`.trim(),
    "is": `
<style>
  .btn:is(.primary, .accent) { background:#0ea5e9; color:#fff; padding:10px 14px; border:none; border-radius:10px; }
</style>
<button class="btn primary">:is(.primary, .accent)</button>
`.trim(),
    "where": `
<style>
  .btn:where(.primary, .accent) { background:#0ea5e9; color:#fff; padding:10px 14px; border:none; border-radius:10px; }
</style>
<button class="btn accent">:where(.primary, .accent)</button>
`.trim(),
    "has": `
<style>
  .card:has(img) { border:2px solid #0ea5e9; padding:12px; border-radius:12px; display:flex; gap:8px; align-items:center; }
</style>
<div class="card">
  <img src="https://via.placeholder.com/40" alt="" style="border-radius:8px;" />
  <span>:has(img) aplica al contenedor</span>
</div>
`.trim(),
    "valid": `
<style>
  input:valid { border:1px solid #22c55e; box-shadow:0 0 0 2px rgba(34,197,94,0.2); }
</style>
<input type="email" value="ok@example.com" />
`.trim(),
    "invalid": `
<style>
  input:invalid { border:1px solid #ef4444; box-shadow:0 0 0 2px rgba(239,68,68,0.2); }
</style>
<input type="email" value="invalid" />
`.trim(),
    "in-range": `
<style>
  input:in-range { border:1px solid #22c55e; }
</style>
<input type="number" min="1" max="10" value="5" />
`.trim(),
    "out-of-range": `
<style>
  input:out-of-range { border:1px solid #ef4444; }
</style>
<input type="number" min="1" max="10" value="99" />
`.trim(),
    "fullscreen": `
<style>
  :fullscreen { background:#0ea5e9; color:#fff; }
</style>
<div style="padding:12px; background:#e2e8f0; border-radius:12px;">:fullscreen se aplica cuando un elemento entra a pantalla completa</div>
`.trim(),
  };

  return demos[name] ?? null;
}

function buildPropertyDemo(term: string): string | null {
  const name = term.toLowerCase();
  const mdnGridDemo = `
<style>
  * { box-sizing: border-box; }
  .wrapper {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 100px;
    gap: 8px;
    border: 2px solid #f76707;
    border-radius: 5px;
    background-color: #fff4e6;
    padding: 6px;
  }
  .wrapper > div {
    border: 2px solid #ffa94d;
    border-radius: 5px;
    background-color: #ffd8a8;
    padding: 1em;
    color: #d9480f;
    font-weight: 600;
    display:flex;
    align-items:center;
  }
  .box1 {
    grid-column-start: 1;
    grid-column-end: 4;
    grid-row-start: 1;
    grid-row-end: 3;
  }
  .box2 {
    grid-column-start: 1;
    grid-row-start: 3;
    grid-row-end: 5;
  }
  .box3 { grid-column: 2 / 4; }
  .box4 { grid-column: 2 / 3; }
  .box5 { grid-column: 3 / 4; }
</style>
<div class="wrapper">
  <div class="box1">One</div>
  <div class="box2">Two</div>
  <div class="box3">Three</div>
  <div class="box4">Four</div>
  <div class="box5">Five</div>
</div>
`.trim();
  const enriched: Record<string, string> = {
    "cursor": `
<style>
  * { box-sizing:border-box; }
  .stack { display:flex; gap:12px; background:#0b1727; padding:12px; border-radius:12px; border:2px solid #f76707; }
  .btn { padding:10px 14px; border-radius:10px; background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; font-weight:700; }
  .pointer { cursor: pointer; }
  .grab { cursor: grab; }
  .forbid { cursor: not-allowed; }
</style>
<div class="stack">
  <button class="btn pointer">pointer</button>
  <button class="btn grab">grab</button>
  <button class="btn forbid">not-allowed</button>
</div>
`.trim(),
    "pointer-events": `
<style>
  .stage { position: relative; width: 260px; height: 120px; background:#0b1727; border:2px solid #f76707; border-radius:12px; color:#e2e8f0; }
  .base { position:absolute; inset:12px; background:#1e293b; border-radius:10px; display:flex; align-items:center; justify-content:center; }
  .overlay { position:absolute; inset:12px; background:rgba(255,216,168,0.7); border:2px solid #ffa94d; border-radius:10px; color:#d9480f; font-weight:700; pointer-events: none; display:flex; align-items:center; justify-content:center; }
</style>
<div class="stage">
  <div class="base">pointer-events: auto</div>
  <div class="overlay">pointer-events: none</div>
</div>
`.trim(),
    "touch-action": `
<style>
  .card { padding:12px; border-radius:10px; border:2px solid #ffa94d; background:#ffd8a8; color:#0f172a; font-weight:700; }
</style>
<div class="card">touch-action controla gestos táctiles (ej. pan-x, pan-y, none)</div>
`.trim(),
    "caret-color": `
<style>
  .stack { display:grid; gap:10px; background:#0b1727; padding:12px; border-radius:12px; border:2px solid #f76707; }
  input { padding:10px 12px; border:2px solid #ffa94d; border-radius:10px; background:#fff4e6; color:#0f172a; font-weight:700; }
  .red { caret-color: #ef4444; }
  .blue { caret-color: #2563eb; }
</style>
<div class="stack">
  <input class="red" placeholder="caret rojo" />
  <input class="blue" placeholder="caret azul" />
</div>
`.trim(),
    "cascade": `
<style>
  * { box-sizing:border-box; }
  .stack { display:grid; gap:8px; background:#0b1727; padding:12px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .layer { padding:10px; border-radius:10px; border:2px solid #ffa94d; font-weight:700; background:#1e293b; display:flex; justify-content:space-between; align-items:center; }
  .layer span { color:#ffd8a8; }
</style>
<div class="stack">
  <div class="layer">User agent (base) <span>prioridad baja</span></div>
  <div class="layer">Autor CSS <span>override</span></div>
  <div class="layer">Inline style <span>más fuerte</span></div>
  <div class="layer">!important <span>último en la cascada</span></div>
</div>
`.trim(),
    "specificity": `
<style>
  .table { display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap:8px; background:#0b1727; padding:12px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; font-weight:700; text-align:center; }
  .head { background:#1e293b; border-radius:10px; padding:8px; }
  .row { background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; border-radius:10px; padding:8px; }
</style>
<div class="table">
  <div class="head">Selector</div><div class="head">ID</div><div class="head">Clase</div><div class="head">Elemento</div>
  <div class="row">#nav .item a</div><div class="row">1</div><div class="row">1</div><div class="row">1</div>
  <div class="row">.btn.primary</div><div class="row">0</div><div class="row">2</div><div class="row">0</div>
  <div class="row">button</div><div class="row">0</div><div class="row">0</div><div class="row">1</div>
</div>
`.trim(),
    "inheritance": `
<style>
  .card { background:#0b1727; border:2px solid #f76707; border-radius:12px; padding:12px; color:#e2e8f0; font-weight:700; }
  .parent { color:#d9480f; font-size:18px; }
  .child { background:#ffd8a8; border:2px solid #ffa94d; border-radius:10px; padding:10px; color:inherit; font-size:inherit; }
</style>
<div class="card">
  <div class="parent">Padre (color y font-size)
    <div class="child">Hijo hereda color y font-size</div>
  </div>
</div>
`.trim(),
    "initial-value": `
<style>
  .stage { display:grid; gap:12px; background:#0b1727; padding:12px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .box { background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; border-radius:10px; padding:12px; font-weight:700; }
  .custom { margin: 18px; }
  .reset { margin: initial; }
</style>
<div class="stage">
  <div class="box custom">margin: 18px (custom)</div>
  <div class="box reset">margin: initial → vuelve a 0</div>
</div>
`.trim(),
    "computed-value": `
<style>
  .stage { background:#0b1727; border:2px solid #f76707; border-radius:12px; padding:12px; color:#e2e8f0; display:grid; gap:10px; }
  .box { background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; border-radius:10px; padding:10px; font-weight:700; }
</style>
<div class="stage">
  <div class="box">CSS: margin: 1rem</div>
  <div class="box">Valor computado (root 16px) → 16px</div>
</div>
`.trim(),
    "custom-properties": `
<style>
  :root { --brand: #f76707; --surface:#ffd8a8; }
  .card { padding:14px; border-radius:12px; border:2px solid var(--brand); background:var(--surface); color:var(--brand); font-weight:700; }
</style>
<div class="card">Usa custom properties: var(--brand)</div>
`.trim(),
    "css-variables": `
<style>
  :root { --bg: #0b1727; --accent:#ffa94d; --fill:#ffd8a8; }
  .panel { padding:14px; border-radius:12px; border:2px solid var(--accent); background:var(--bg); color:var(--fill); font-weight:700; }
</style>
<div class="panel">css variables reutilizan valores</div>
`.trim(),
    "shorthand-properties": `
<style>
  .stack { display:grid; gap:10px; background:#0b1727; padding:12px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .box { background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; border-radius:10px; padding:10px; font-weight:700; }
</style>
<div class="stack">
  <div class="box">margin-top/right/bottom/left separados</div>
  <div class="box">shorthand: margin: 12px 20px;</div>
</div>
`.trim(),
    "important-flag": `
<style>
  .stack { display:grid; gap:10px; background:#0b1727; padding:12px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .box { padding:10px; border-radius:10px; border:2px solid #ffa94d; font-weight:700; }
  .normal { background:#ffd8a8; color:#d9480f; }
  .forced { background:#c7d2fe; color:#312e81; }
</style>
<div class="stack">
  <div class="box normal">color desde hoja 1</div>
  <div class="box forced">color: blue !important → gana</div>
</div>
`.trim(),
    "vendor-prefixes": `
<style>
  .card { padding:12px; border-radius:12px; border:2px solid #ffa94d; background:#ffd8a8; color:#d9480f; font-weight:700; line-height:1.5; }
</style>
<div class="card">
  display: -webkit-flex;<br/>
  display: -ms-flexbox;<br/>
  display: flex; (estándar)
</div>
`.trim(),
    "box-model": `
<style>
  .canvas { padding:18px; background:#0b1727; border-radius:12px; border:2px solid #f76707; width:320px; }
  .margin { background:#fde68a; padding:12px; border-radius:12px; }
  .border { background:#ffd8a8; padding:12px; border:2px solid #f97316; border-radius:10px; }
  .padding { background:#fff4e6; padding:12px; border-radius:8px; }
  .content { background:#e0f2fe; padding:12px; border-radius:8px; text-align:center; font-weight:700; color:#0f172a; }
</style>
<div class="canvas">
  <div class="margin">
    <div class="border">
      <div class="padding">
        <div class="content">Contenido</div>
      </div>
    </div>
  </div>
</div>
`.trim(),
    "stacking-context": `
<style>
  .stage { position:relative; width:280px; height:180px; background:#0b1727; border:2px solid #f76707; border-radius:12px; overflow:hidden; }
  .layer { position:absolute; width:140px; height:100px; border-radius:12px; border:2px solid #ffa94d; display:flex; align-items:center; justify-content:center; font-weight:700; color:#d9480f; }
  .a { top:20px; left:20px; background:rgba(255,216,168,0.8); z-index:1; }
  .b { top:50px; left:70px; background:rgba(34,197,94,0.25); z-index:2; }
  .c { top:80px; left:120px; background:rgba(14,165,233,0.25); z-index:3; }
</style>
<div class="stage">
  <div class="layer a">z-index 1</div>
  <div class="layer b">z-index 2</div>
  <div class="layer c">z-index 3</div>
</div>
`.trim(),
    "replaced-elements": `
<style>
  .stack { display:grid; grid-template-columns: repeat(2, 1fr); gap:10px; background:#0b1727; padding:12px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .item { background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; border-radius:10px; padding:10px; font-weight:700; text-align:center; }
  img { width:100%; height:90px; object-fit:cover; border-radius:8px; }
</style>
<div class="stack">
  <div class="item"><img src="https://via.placeholder.com/200" alt="img" />img (replaced)</div>
  <div class="item"><input value="input replaced" style="width:100%; padding:8px;" /></div>
</div>
`.trim(),
    "margin-inline": `
<style>
  * { box-sizing:border-box; }
  .stage { background:#0b1727; border:2px solid #f76707; border-radius:12px; padding:12px; color:#e2e8f0; display:grid; gap:12px; }
  .row { position:relative; height:72px; border-radius:10px; background:linear-gradient(90deg, rgba(247,103,7,0.14) 0 18%, transparent 18% 82%, rgba(247,103,7,0.14) 82% 100%); padding:8px; }
  .card { height:100%; background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:700; }
  .tight .card { margin-inline: 0; }
  .wide .card { margin-inline: 18px; }
</style>
<div class="stage">
  <div class="row tight"><div class="card">margin-inline: 0</div></div>
  <div class="row wide"><div class="card">margin-inline: 18px</div></div>
</div>
`.trim(),
    "margin-block": `
<style>
  * { box-sizing:border-box; }
  .stage { background:#0b1727; border:2px solid #f76707; border-radius:12px; padding:10px; color:#e2e8f0; width:320px; }
  .card { background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; border-radius:10px; padding:10px; font-weight:700; }
  .spaced { margin-block: 12px; }
</style>
<div class="stage">
  <div class="card">margin-block: 0</div>
  <div class="card spaced">margin-block: 12px</div>
  <div class="card">siguiente bloque</div>
</div>
`.trim(),
    "padding-inline": `
<style>
  .stage { background:#0b1727; border:2px solid #f76707; border-radius:12px; padding:10px; color:#e2e8f0; display:grid; gap:10px; }
  .card { background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; border-radius:10px; font-weight:700; }
  .tight { padding-inline: 8px; padding-block: 10px; }
  .wide { padding-inline: 28px; padding-block: 10px; }
</style>
<div class="stage">
  <div class="card tight">padding-inline: 8px</div>
  <div class="card wide">padding-inline: 28px</div>
</div>
`.trim(),
    "padding-block": `
<style>
  .stage { background:#0b1727; border:2px solid #f76707; border-radius:12px; padding:10px; color:#e2e8f0; display:grid; gap:10px; width:320px; }
  .card { background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; border-radius:10px; font-weight:700; padding-inline:16px; }
  .tight { padding-block: 6px; }
  .wide { padding-block: 22px; }
</style>
<div class="stage">
  <div class="card tight">padding-block: 6px</div>
  <div class="card wide">padding-block: 22px</div>
</div>
`.trim(),
    "border-inline": `
<style>
  .card { padding:14px; border-inline: 4px solid #f76707; border-block: 2px solid #ffa94d; border-radius:10px; background:#ffd8a8; color:#d9480f; font-weight:700; }
</style>
<div class="card">border-inline aplica solo a lados inline</div>
`.trim(),
    "border-block": `
<style>
  .card { padding:14px; border-block: 4px solid #f76707; border-inline: 2px solid #ffa94d; border-radius:10px; background:#ffd8a8; color:#d9480f; font-weight:700; }
</style>
<div class="card">border-block aplica lados superior/inferior</div>
`.trim(),
    "inset-inline": `
<style>
  .stage { position:relative; width:320px; height:180px; background:#0b1727; border:2px solid #f76707; border-radius:12px; padding:6px; color:#e2e8f0; }
  .box { position:absolute; inset-inline:20px; inset-block:40px; background:rgba(255,216,168,0.8); border:2px solid #ffa94d; border-radius:10px; color:#d9480f; font-weight:700; display:flex; align-items:center; justify-content:center; text-align:center; }
</style>
<div class="stage">
  <div class="box">inset-inline: 20px</div>
</div>
`.trim(),
    "inset-block": `
<style>
  .stage { position:relative; width:320px; height:180px; background:#0b1727; border:2px solid #f76707; border-radius:12px; padding:6px; color:#e2e8f0; }
  .box { position:absolute; inset-block:24px; inset-inline:50px; background:rgba(255,216,168,0.85); border:2px solid #ffa94d; border-radius:10px; color:#d9480f; font-weight:700; display:flex; align-items:center; justify-content:center; text-align:center; }
</style>
<div class="stage">
  <div class="box">inset-block: 24px</div>
</div>
`.trim(),
    "float": `
<style>
  .article { background:#fff4e6; border:2px solid #ffa94d; border-radius:12px; padding:12px; color:#0f172a; line-height:1.45; font-weight:600; }
  .thumb { float:left; width:110px; height:90px; margin:0 12px 8px 0; background:#ffd8a8; border:2px solid #f76707; border-radius:10px; color:#d9480f; display:flex; align-items:center; justify-content:center; font-weight:700; }
  .clear { clear: both; background:#e2e8f0; padding:8px; border-radius:10px; margin-top:10px; font-weight:700; color:#0f172a; }
</style>
<div class="article">
  <div class="thumb">float:left</div>
  El texto fluye alrededor de la imagen gracias a float. Ideal para layouts clásicos y alertas flotantes.
  <div class="clear">clear: both detiene el flujo</div>
</div>
`.trim(),
    "clear": `
<style>
  .stage { background:#fff4e6; border:2px solid #ffa94d; border-radius:12px; padding:12px; color:#0f172a; font-weight:600; }
  .float { float:right; width:120px; height:80px; background:#ffd8a8; border:2px solid #f76707; border-radius:10px; color:#d9480f; display:flex; align-items:center; justify-content:center; }
  .block { background:#e2e8f0; padding:10px; border-radius:10px; margin-top:12px; clear: both; font-weight:700; color:#0f172a; }
</style>
<div class="stage">
  <div class="float">float</div>
  <p>clear controla dónde se reanuda el flujo normal del documento.</p>
  <div class="block">clear: both</div>
</div>
`.trim(),
    "clip": `
<style>
  .stage { display:grid; grid-template-columns: repeat(2, 1fr); gap:10px; background:#0b1727; padding:12px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .box { position:relative; width:100%; height:140px; background:#1e293b; border-radius:10px; overflow:hidden; }
  .full, .clipped { position:absolute; top:0; left:0; width:100%; height:100%; background:url('https://via.placeholder.com/300') center/cover; border:2px solid #ffa94d; border-radius:10px; }
  .clipped { clip: rect(10px, 140px, 110px, 20px); }
  .label { position:absolute; bottom:8px; left:8px; background:rgba(15,23,42,0.8); padding:6px 8px; border-radius:8px; font-weight:700; }
</style>
<div class="stage">
  <div class="box">
    <div class="full"></div>
    <div class="label">sin clip</div>
  </div>
  <div class="box">
    <div class="clipped"></div>
    <div class="label">clip: rect(...)</div>
  </div>
</div>
`.trim(),
    "zoom": `
<style>
  .stage { display:flex; gap:12px; background:#0b1727; padding:12px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .card { width:120px; height:90px; background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:700; }
  .scaled { zoom: 1.3; }
</style>
<div class="stage">
  <div class="card">zoom 1</div>
  <div class="card scaled">zoom 1.3</div>
</div>
`.trim(),
    "filter-progid": `
<style>
  .card { padding:14px; border-radius:12px; border:2px solid #f76707; background:#fff4e6; color:#d9480f; font-weight:700; line-height:1.4; }
</style>
<div class="card">filter: progid:DXImageTransform... (propiedad obsoleta de IE, evita usarla en proyectos modernos)</div>
`.trim(),
    "word-wrap": `
<style>
  .stage { display:grid; grid-template-columns: repeat(2, 1fr); gap:12px; background:#0b1727; padding:12px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .box { min-height:90px; border-radius:10px; border:2px solid #ffa94d; padding:10px; background:#ffd8a8; color:#d9480f; font-weight:700; }
  .break { word-wrap: break-word; }
</style>
<div class="stage">
  <div class="box">word-wrap normal sin cortes largosSuperLargoDeTexto</div>
  <div class="box break">word-wrap: break-word corta largosSuperLargoDeTexto</div>
</div>
`.trim(),
    "media": `
<style>
  * { box-sizing:border-box; }
  .card { padding:14px; border-radius:10px; border:2px solid #ffa94d; background:#ffd8a8; color:#d9480f; font-weight:700; }
  @media (max-width: 600px) {
    .card { background:#c7d2fe; color:#312e81; }
  }
</style>
<div class="card">@media (max-width:600px) cambia colores</div>
`.trim(),
    "keyframes": `
<style>
  @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  .pill { padding:10px 14px; border-radius:999px; background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; font-weight:700; display:inline-flex; align-items:center; justify-content:center; animation: bounce 1s ease-in-out infinite; }
</style>
<div class="pill">@keyframes bounce</div>
`.trim(),
    "font-face": `
<style>
  @font-face {
    font-family: "DemoFont";
    src: local("Inter"), url("https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK7N1.ttf") format("truetype");
    font-display: swap;
  }
  .sample { font-family:"DemoFont", sans-serif; padding:10px; border:2px solid #ffa94d; border-radius:8px; background:#ffd8a8; color:#0f172a; font-weight:700; }
</style>
<div class="sample">@font-face carga DemoFont</div>
`.trim(),
    "supports": `
<style>
  .card { padding:12px; border-radius:10px; border:2px solid #ffa94d; background:#ffd8a8; color:#d9480f; font-weight:700; }
  @supports (display: grid) {
    .card { background:#bbf7d0; color:#065f46; }
  }
</style>
<div class="card">@supports (display: grid)</div>
`.trim(),
    "import": `
<style>
  /* @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500&display=swap'); */
  .card { padding:12px; border-radius:10px; border:2px solid #ffa94d; background:#ffd8a8; color:#0f172a; font-weight:700; }
</style>
<div class="card">@import debe ir al inicio del CSS</div>
`.trim(),
    "charset": `
<style>
  /* @charset "UTF-8"; */ 
  .card { padding:12px; border-radius:10px; border:2px solid #ffa94d; background:#ffd8a8; color:#d9480f; font-weight:700; }
</style>
<div class="card">@charset define la codificación</div>
`.trim(),
    "page": `
<style>
  @page { margin: 1in; }
  .card { padding:12px; border-radius:10px; border:2px solid #ffa94d; background:#ffd8a8; color:#d9480f; font-weight:700; }
</style>
<div class="card">@page ajusta márgenes de impresión</div>
`.trim(),
    "namespace": `
<style>
  /* @namespace svg url("http://www.w3.org/2000/svg"); */
  .card { padding:12px; border-radius:10px; border:2px solid #ffa94d; background:#ffd8a8; color:#0f172a; font-weight:700; }
</style>
<div class="card">@namespace define prefijos para XML/SVG</div>
`.trim(),
    "container": `
<style>
  .shell { container-type: inline-size; padding:12px; border:2px solid #ffa94d; border-radius:12px; background:#ffd8a8; color:#d9480f; }
  @container (min-width: 320px) {
    .shell { background:#bbf7d0; color:#065f46; }
  }
</style>
<div class="shell">@container (min-width:320px)</div>
`.trim(),
    "layer": `
<style>
  @layer base { .btn { border-radius:8px; } }
  @layer theme { .btn { background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; font-weight:700; padding:10px 14px; } }
  @layer overrides { .btn { border-color:#f97316; } }
</style>
<button class="btn">@layer base/theme/overrides</button>
`.trim(),
    "counter-style": `
<style>
  @counter-style demo-dots {
    system: numeric;
    symbols: "•" "●" "◉";
    suffix: " ";
  }
  ul { list-style: demo-dots; padding-left:18px; }
</style>
<ul>
  <li>Item</li>
  <li>Item</li>
  <li>Item</li>
</ul>
`.trim(),
    "property": `
<style>
  @property --twist {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
  }
  .card { padding:12px; border-radius:10px; border:2px solid #ffa94d; background:#ffd8a8; color:#d9480f; font-weight:700; transition: transform 300ms; transform: rotate(var(--twist)); }
  .card:hover { --twist: 12deg; }
</style>
<div class="card">@property --twist y hover</div>
`.trim(),
    "appearance": `
<style>
  * { box-sizing:border-box; }
  input[type="search"] { appearance: none; -webkit-appearance: none; padding:10px 12px; border:2px solid #ffa94d; border-radius:10px; background:#ffd8a8; color:#0f172a; font-weight:700; }
  select { appearance: none; -webkit-appearance: none; padding:10px 12px; border:2px solid #ffa94d; border-radius:10px; background:#ffd8a8; color:#0f172a; font-weight:700; background-image: linear-gradient(45deg, transparent 50%, #d9480f 50%), linear-gradient(135deg, #d9480f 50%, transparent 50%); background-position: calc(100% - 15px) calc(1em + 2px), calc(100% - 10px) calc(1em + 2px); background-size: 5px 5px, 5px 5px; background-repeat: no-repeat; }
</style>
<div style="display:flex; gap:12px;">
  <input type="search" value="appearance:none" />
  <select><option>appearance none</option></select>
</div>
`.trim(),
    "accent-color": `
<style>
  .stack { display:grid; gap:10px; background:#0b1727; padding:12px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  input[type="checkbox"] { accent-color: #f97316; width:18px; height:18px; }
  input[type="radio"] { accent-color: #2563eb; width:16px; height:16px; }
</style>
<div class="stack">
  <label><input type="checkbox" checked /> accent-color: #f97316</label>
  <label><input type="radio" name="r" checked /> accent-color: #2563eb</label>
</div>
`.trim(),
    "resize": `
<style>
  textarea { width:220px; height:100px; padding:10px; border:2px solid #ffa94d; border-radius:10px; background:#ffd8a8; color:#0f172a; font-weight:700; resize: both; }
</style>
<textarea>resize: both</textarea>
`.trim(),
    "user-select": `
<style>
  .stack { display:grid; gap:10px; background:#0b1727; padding:12px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .none { user-select: none; background:#ffd8a8; border:2px solid #ffa94d; border-radius:10px; color:#d9480f; font-weight:700; padding:10px; }
  .text { user-select: text; background:#bbf7d0; border:2px solid #22c55e; border-radius:10px; color:#065f46; font-weight:700; padding:10px; }
</style>
<div class="stack">
  <div class="none">user-select: none</div>
  <div class="text">user-select: text</div>
</div>
`.trim(),
    "scroll-behavior": `
<style>
  .container { height:160px; overflow-y: auto; scroll-behavior: smooth; border:2px solid #f76707; border-radius:12px; background:#0b1727; color:#e2e8f0; padding:10px; display:grid; gap:12px; }
  .target { height:60px; background:#ffd8a8; border:2px solid #ffa94d; border-radius:10px; color:#d9480f; font-weight:700; display:flex; align-items:center; justify-content:center; }
</style>
<div class="container">
  <div class="target">start</div>
  <div class="target">middle</div>
  <div class="target">end</div>
</div>
`.trim(),
    "scroll-snap-type": `
<style>
  .carousel { display:flex; gap:12px; overflow-x:auto; scroll-snap-type: x mandatory; padding:10px; border:2px solid #f76707; border-radius:12px; background:#0b1727; }
  .slide { flex:0 0 180px; height:100px; scroll-snap-align: center; background:#ffd8a8; border:2px solid #ffa94d; border-radius:10px; color:#d9480f; font-weight:700; display:flex; align-items:center; justify-content:center; }
</style>
<div class="carousel">
  <div class="slide">1</div>
  <div class="slide">2</div>
  <div class="slide">3</div>
</div>
`.trim(),
    "scroll-snap-align": `
<style>
  .carousel { display:flex; gap:12px; overflow-x:auto; scroll-snap-type: x mandatory; padding:10px; border:2px solid #f76707; border-radius:12px; background:#0b1727; }
  .center { scroll-snap-align: center; }
  .start { scroll-snap-align: start; }
  .slide { flex:0 0 180px; height:100px; background:#ffd8a8; border:2px solid #ffa94d; border-radius:10px; color:#d9480f; font-weight:700; display:flex; align-items:center; justify-content:center; }
</style>
<div class="carousel">
  <div class="slide start">start</div>
  <div class="slide center">center</div>
  <div class="slide start">start</div>
</div>
`.trim(),
    "scroll-margin": `
<style>
  .container { height:160px; overflow-y:auto; border:2px solid #f76707; border-radius:12px; background:#0b1727; color:#e2e8f0; padding:10px; scroll-behavior:smooth; }
  .block { height:60px; margin-bottom:12px; background:#ffd8a8; border:2px solid #ffa94d; border-radius:10px; color:#d9480f; font-weight:700; display:flex; align-items:center; justify-content:center; }
  .snap { scroll-margin-top: 20px; }
</style>
<div class="container">
  <div class="block">1</div>
  <div class="block snap">scroll-margin-top:20px</div>
  <div class="block">3</div>
</div>
`.trim(),
    "scroll-padding": `
<style>
  .container { height:160px; overflow-y:auto; border:2px solid #f76707; border-radius:12px; background:#0b1727; color:#e2e8f0; padding:10px; scroll-behavior:smooth; scroll-padding-top: 24px; }
  .block { height:60px; margin-bottom:12px; background:#ffd8a8; border:2px solid #ffa94d; border-radius:10px; color:#d9480f; font-weight:700; display:flex; align-items:center; justify-content:center; }
</style>
<div class="container">
  <div class="block">1</div>
  <div class="block">2</div>
  <div class="block">3</div>
</div>
`.trim(),
    "var": `
<style>
  :root { --primary: #d9480f; }
  .card { padding:14px; border-radius:10px; border:2px solid #ffa94d; background:#ffd8a8; color: var(--primary); font-weight:700; }
</style>
<div class="card">color usa var(--primary)</div>
`.trim(),
    "calc": `
<style>
  .outer { width:260px; padding:12px; background:#0b1727; border:2px solid #f76707; border-radius:12px; }
  .bar { height:20px; background:#ffd8a8; border:2px solid #ffa94d; border-radius:8px; width: calc(100% - 40px); color:#d9480f; font-weight:700; display:flex; align-items:center; justify-content:center; }
</style>
<div class="outer"><div class="bar">width: calc(100% - 40px)</div></div>
`.trim(),
    "min": `
<style>
  .box { width:min(50%, 200px); height:80px; background:#ffd8a8; border:2px solid #ffa94d; border-radius:10px; color:#d9480f; font-weight:700; display:flex; align-items:center; justify-content:center; }
</style>
<div class="box">width: min(50%, 200px)</div>
`.trim(),
    "max": `
<style>
  .box { width:max(40%, 180px); height:80px; background:#ffd8a8; border:2px solid #ffa94d; border-radius:10px; color:#d9480f; font-weight:700; display:flex; align-items:center; justify-content:center; }
</style>
<div class="box">width: max(40%, 180px)</div>
`.trim(),
    "clamp": `
<style>
  .card { width: clamp(180px, 50vw, 320px); min-height:80px; background:#ffd8a8; border:2px solid #ffa94d; border-radius:10px; color:#d9480f; font-weight:700; display:flex; align-items:center; justify-content:center; text-align:center; padding:10px; }
</style>
<div class="card">clamp(180px, 50vw, 320px)</div>
`.trim(),
    "rgb": `
<style>
  .swatch { padding:12px; border-radius:10px; border:2px solid #ffa94d; font-weight:700; color:#0f172a; }
</style>
<div class="swatch" style="background: rgb(255, 216, 168);">rgb(255,216,168)</div>
`.trim(),
    "rgba": `
<style>
  .swatch { padding:12px; border-radius:10px; border:2px solid #ffa94d; font-weight:700; color:#0f172a; }
</style>
<div class="swatch" style="background: rgba(255, 216, 168, 0.6);">rgba(255,216,168,0.6)</div>
`.trim(),
    "hsl": `
<style>
  .swatch { padding:12px; border-radius:10px; border:2px solid #ffa94d; font-weight:700; color:#0f172a; }
</style>
<div class="swatch" style="background: hsl(27, 95%, 81%);">hsl(27,95%,81%)</div>
`.trim(),
    "hsla": `
<style>
  .swatch { padding:12px; border-radius:10px; border:2px solid #ffa94d; font-weight:700; color:#0f172a; }
</style>
<div class="swatch" style="background: hsla(27, 95%, 81%, 0.6);">hsla(27,95%,81%,0.6)</div>
`.trim(),
    "url": `
<style>
  .panel { width:220px; height:120px; border-radius:12px; border:2px solid #ffa94d; background: url('https://via.placeholder.com/200') center/cover no-repeat, #ffd8a8; }
</style>
<div class="panel"></div>
`.trim(),
    "attr": `
<style>
  .tag::after { content: " (" attr(data-label) ")"; color:#d9480f; }
  .tag { display:inline-block; padding:10px 14px; background:#ffd8a8; border:2px solid #ffa94d; border-radius:8px; color:#0f172a; font-weight:700; }
</style>
<span class="tag" data-label="info">attr(data-label)</span>
`.trim(),
    "env": `
<style>
  .panel { padding:12px; border:2px solid #ffa94d; border-radius:10px; background:#ffd8a8; color:#d9480f; font-weight:700; padding-top: calc(12px + env(safe-area-inset-top)); }
</style>
<div class="panel">env(safe-area-inset-top)</div>
`.trim(),
    "linear-gradient": `
<style>
  .panel { width:240px; height:120px; border-radius:12px; border:2px solid #ffa94d; background: linear-gradient(135deg, #ffd8a8, #f97316); }
</style>
<div class="panel"></div>
`.trim(),
    "radial-gradient": `
<style>
  .panel { width:240px; height:120px; border-radius:12px; border:2px solid #ffa94d; background: radial-gradient(circle at center, #ffd8a8, #f97316); }
</style>
<div class="panel"></div>
`.trim(),
    "conic-gradient": `
<style>
  .panel { width:200px; height:200px; border-radius:50%; border:2px solid #ffa94d; background: conic-gradient(#ffd8a8, #f97316, #ffa94d, #ffd8a8); }
</style>
<div class="panel"></div>
`.trim(),
    "repeating-linear-gradient": `
<style>
  .panel { width:240px; height:120px; border-radius:12px; border:2px solid #ffa94d; background: repeating-linear-gradient(45deg, #ffd8a8 0, #ffd8a8 10px, #f97316 10px, #f97316 20px); }
</style>
<div class="panel"></div>
`.trim(),
    "repeating-radial-gradient": `
<style>
  .panel { width:240px; height:120px; border-radius:12px; border:2px solid #ffa94d; background: repeating-radial-gradient(circle, #ffd8a8 0 10px, #f97316 10px 20px); }
</style>
<div class="panel"></div>
`.trim(),
    "px": `
<style>
  .stack { display:flex; gap:10px; background:#0b1727; padding:12px; border-radius:12px; border:2px solid #f76707; }
  .box { background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; border-radius:8px; font-weight:700; text-align:center; }
  .a { width:80px; height:40px; }
  .b { width:120px; height:60px; }
</style>
<div class="stack">
  <div class="box a">80px × 40px</div>
  <div class="box b">120px × 60px</div>
</div>
`.trim(),
    "%": `
<style>
  .outer { width:240px; height:120px; background:#0b1727; border:2px solid #f76707; border-radius:12px; padding:8px; }
  .inner { height:50%; width:60%; background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; border-radius:8px; font-weight:700; display:flex; align-items:center; justify-content:center; }
</style>
<div class="outer">
  <div class="inner">60% × 50%</div>
</div>
`.trim(),
    "em": `
<style>
  .stack { display:grid; gap:8px; background:#0b1727; padding:12px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .sample { background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; border-radius:8px; padding:8px; }
</style>
<div class="stack" style="font-size:16px;">
  <div class="sample" style="font-size:1em;">font-size:1em</div>
  <div class="sample" style="font-size:1.5em;">font-size:1.5em</div>
</div>
`.trim(),
    "rem": `
<style>
  :root { font-size:16px; }
  .stack { display:grid; gap:8px; background:#0b1727; padding:12px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .sample { background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; border-radius:8px; padding:8px; }
</style>
<div class="stack">
  <div class="sample" style="font-size:1rem;">1rem (16px)</div>
  <div class="sample" style="font-size:2rem;">2rem (32px)</div>
</div>
`.trim(),
    "vh": `
<style>
  .box { width:140px; height:30vh; min-height:80px; background:#ffd8a8; border:2px solid #ffa94d; border-radius:10px; color:#d9480f; font-weight:700; display:flex; align-items:center; justify-content:center; }
</style>
<div class="box">height: 30vh</div>
`.trim(),
    "vw": `
<style>
  .box { width:40vw; max-width:260px; min-width:160px; height:80px; background:#ffd8a8; border:2px solid #ffa94d; border-radius:10px; color:#d9480f; font-weight:700; display:flex; align-items:center; justify-content:center; }
</style>
<div class="box">width: 40vw</div>
`.trim(),
    "vmin": `
<style>
  .box { width:20vmin; height:20vmin; min-width:80px; min-height:80px; background:#ffd8a8; border:2px solid #ffa94d; border-radius:10px; color:#d9480f; font-weight:700; display:flex; align-items:center; justify-content:center; }
</style>
<div class="box">20vmin</div>
`.trim(),
    "vmax": `
<style>
  .box { width:15vmax; height:15vmax; max-width:260px; max-height:260px; background:#ffd8a8; border:2px solid #ffa94d; border-radius:10px; color:#d9480f; font-weight:700; display:flex; align-items:center; justify-content:center; }
</style>
<div class="box">15vmax</div>
`.trim(),
    "ch": `
<style>
  .sample { width:20ch; background:#ffd8a8; border:2px solid #ffa94d; border-radius:8px; color:#d9480f; font-weight:700; padding:10px; }
</style>
<div class="sample">width: 20ch → basado en el ancho del 0</div>
`.trim(),
    "ex": `
<style>
  .sample { font-size:18px; background:#ffd8a8; border:2px solid #ffa94d; border-radius:8px; color:#d9480f; padding:10px; width:20ex; }
</style>
<div class="sample">width: 20ex (altura x)</div>
`.trim(),
    "cm": `
<style>
  .sample { width:4cm; height:2cm; background:#ffd8a8; border:2px solid #ffa94d; border-radius:8px; color:#d9480f; font-weight:700; display:flex; align-items:center; justify-content:center; }
</style>
<div class="sample">4cm × 2cm</div>
`.trim(),
    "mm": `
<style>
  .sample { width:30mm; height:15mm; background:#ffd8a8; border:2px solid #ffa94d; border-radius:8px; color:#d9480f; font-weight:700; display:flex; align-items:center; justify-content:center; }
</style>
<div class="sample">30mm × 15mm</div>
`.trim(),
    "in": `
<style>
  .sample { width:3in; height:1in; background:#ffd8a8; border:2px solid #ffa94d; border-radius:8px; color:#d9480f; font-weight:700; display:flex; align-items:center; justify-content:center; }
</style>
<div class="sample">3in × 1in</div>
`.trim(),
    "pt": `
<style>
  .sample { width:180pt; height:48pt; background:#ffd8a8; border:2px solid #ffa94d; border-radius:8px; color:#d9480f; font-weight:700; display:flex; align-items:center; justify-content:center; }
</style>
<div class="sample">180pt × 48pt</div>
`.trim(),
    "pc": `
<style>
  .sample { width:10pc; height:4pc; background:#ffd8a8; border:2px solid #ffa94d; border-radius:8px; color:#d9480f; font-weight:700; display:flex; align-items:center; justify-content:center; }
</style>
<div class="sample">10pc × 4pc</div>
`.trim(),
    "fr": `
<style>
  .grid { display:grid; grid-template-columns: 1fr 2fr 1fr; gap:10px; background:#0b1727; padding:12px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .cell { background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; border-radius:8px; padding:10px; font-weight:700; text-align:center; }
</style>
<div class="grid">
  <div class="cell">1fr</div>
  <div class="cell">2fr</div>
  <div class="cell">1fr</div>
</div>
`.trim(),
    "deg": `
<style>
  .stack { display:flex; gap:12px; align-items:center; }
  .box { width:120px; height:80px; background:#ffd8a8; border:2px solid #ffa94d; border-radius:10px; color:#d9480f; font-weight:700; display:flex; align-items:center; justify-content:center; }
  .rot { transform: rotate(20deg); }
</style>
<div class="stack">
  <div class="box">0deg</div>
  <div class="box rot">20deg</div>
</div>
`.trim(),
    "rad": `
<style>
  .stack { display:flex; gap:12px; align-items:center; }
  .box { width:120px; height:80px; background:#ffd8a8; border:2px solid #ffa94d; border-radius:10px; color:#d9480f; font-weight:700; display:flex; align-items:center; justify-content:center; }
  .rot { transform: rotate(0.5rad); }
</style>
<div class="stack">
  <div class="box">0rad</div>
  <div class="box rot">0.5rad</div>
</div>
`.trim(),
    "turn": `
<style>
  .stack { display:flex; gap:12px; align-items:center; }
  .box { width:120px; height:80px; background:#ffd8a8; border:2px solid #ffa94d; border-radius:10px; color:#d9480f; font-weight:700; display:flex; align-items:center; justify-content:center; }
  .rot { transform: rotate(0.25turn); }
</style>
<div class="stack">
  <div class="box">0turn</div>
  <div class="box rot">0.25turn</div>
</div>
`.trim(),
    "s": `
<style>
  @keyframes fade { from { opacity:0.2; } to { opacity:1; } }
  .pill { padding:10px 14px; border-radius:10px; background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; font-weight:700; animation: fade 2s ease-in-out infinite alternate; }
</style>
<div class="pill">duration: 2s</div>
`.trim(),
    "ms": `
<style>
  @keyframes flash { 0%,100% { opacity:1; } 50% { opacity:0.2; } }
  .pill { padding:10px 14px; border-radius:10px; background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; font-weight:700; animation: flash 600ms ease-in-out infinite; }
</style>
<div class="pill">duration: 600ms</div>
`.trim(),
    "display-grid": `
<style>
  .grid { display:grid; grid-template-columns: repeat(3, minmax(120px, 1fr)); gap: 12px; background:#0b1727; padding:14px; border-radius:14px; color:#e2e8f0; }
  .cell { border-radius:12px; padding:12px; font-weight:700; text-align:center; background: linear-gradient(135deg,#0ea5e9,#38bdf8); box-shadow:0 10px 20px rgba(14,165,233,0.18); }
  .legend { display:grid; gap:6px; margin-top:10px; color:#0f172a; }
  .legend span { background:#e2e8f0; padding:6px 8px; border-radius:8px; font-size:12px; font-weight:600; display:inline-block; }
</style>
<div class="grid">
  <div class="cell">1</div><div class="cell">2</div><div class="cell">3</div>
  <div class="cell">4</div><div class="cell">5</div><div class="cell">6</div>
</div>
<div class="legend">
  <span>display: grid</span>
  <span>grid-template-columns: repeat(3, minmax(120px, 1fr))</span>
  <span>gap: 12px</span>
</div>
`.trim(),
    "grid-template-columns": `
<style>
  .grid { display:grid; grid-template-columns: 120px 1fr 2fr; gap: 12px; background:#0b1727; padding:14px; border-radius:14px; color:#e2e8f0; }
  .cell { border-radius:12px; padding:12px; font-weight:700; text-align:center; background:#0ea5e9; box-shadow:0 10px 20px rgba(14,165,233,0.18); }
  .legend { margin-top:10px; color:#0f172a; background:#e2e8f0; padding:8px; border-radius:10px; font-size:12px; font-weight:600; display:inline-block; }
</style>
<div class="grid">
  <div class="cell">120px</div><div class="cell">1fr</div><div class="cell">2fr</div>
</div>
<div class="legend">grid-template-columns: 120px 1fr 2fr</div>
`.trim(),
    "grid-template-rows": `
<style>
  .grid { display:grid; grid-template-rows: 80px 1fr 2fr; gap: 10px; background:#0b1727; padding:14px; border-radius:14px; height:240px; color:#e2e8f0; }
  .cell { border-radius:12px; padding:12px; font-weight:700; text-align:center; background:#38bdf8; box-shadow:0 10px 20px rgba(56,189,248,0.18); }
  .legend { margin-top:10px; color:#0f172a; background:#e2e8f0; padding:8px; border-radius:10px; font-size:12px; font-weight:600; display:inline-block; }
</style>
<div class="grid">
  <div class="cell">80px</div><div class="cell">1fr</div><div class="cell">2fr</div>
</div>
<div class="legend">grid-template-rows: 80px 1fr 2fr</div>
`.trim(),
    "grid-template-areas": `
<style>
  .grid { display:grid; grid-template-columns: 1fr 1fr 1fr; grid-template-areas: "header header header" "sidebar content content" "footer footer footer"; gap: 12px; background:#0b1727; padding:14px; border-radius:14px; color:#e2e8f0; }
  .cell { border-radius:12px; padding:12px; font-weight:700; text-align:center; background:#1d4ed8; box-shadow:0 10px 20px rgba(37,99,235,0.22); }
  .header { grid-area: header; background:#2563eb; }
  .sidebar { grid-area: sidebar; background:#312e81; }
  .content { grid-area: content; background:#0ea5e9; }
  .footer { grid-area: footer; background:#0f172a; color:#e2e8f0; }
  .legend { margin-top:10px; color:#0f172a; background:#e2e8f0; padding:8px; border-radius:10px; font-size:12px; font-weight:600; display:inline-block; }
</style>
<div class="grid">
  <div class="cell header">header</div>
  <div class="cell sidebar">sidebar</div>
  <div class="cell content">content</div>
  <div class="cell footer">footer</div>
</div>
<div class="legend">grid-template-areas define layout semántico</div>
`.trim(),
    "grid-auto-columns": `
<style>
  .grid { display:grid; grid-auto-columns: 120px; grid-auto-flow: column; gap:12px; background:#0b1727; padding:14px; border-radius:14px; color:#e2e8f0; }
  .cell { border-radius:12px; padding:12px; font-weight:700; text-align:center; background:#22c55e; box-shadow:0 10px 20px rgba(34,197,94,0.2); }
</style>
<div class="grid">
  <div class="cell">120px</div><div class="cell">120px</div><div class="cell">120px</div>
</div>
`.trim(),
    "grid-auto-rows": `
<style>
  .grid { display:grid; grid-auto-rows: 90px; gap:12px; background:#0b1727; padding:14px; border-radius:14px; color:#e2e8f0; }
  .cell { border-radius:12px; padding:12px; font-weight:700; text-align:center; background:#c084fc; box-shadow:0 10px 20px rgba(192,132,252,0.2); }
</style>
<div class="grid">
  <div class="cell">90px row</div><div class="cell">90px row</div><div class="cell">90px row</div>
</div>
`.trim(),
    "grid-auto-flow": `
<style>
  .grid-row { display:grid; grid-auto-flow: row; grid-auto-rows: 60px; gap:10px; background:#0b1727; padding:12px; border-radius:14px; color:#e2e8f0; }
  .grid-col { display:grid; grid-auto-flow: column; grid-auto-columns: 120px; gap:10px; background:#eef2ff; padding:12px; border-radius:14px; color:#0f172a; }
  .cell { border-radius:12px; padding:10px; font-weight:700; text-align:center; background:#e0f2fe; }
</style>
<div style="display:grid; gap:12px;">
  <div class="grid-row"><div class="cell">row</div><div class="cell">row</div><div class="cell">row</div></div>
  <div class="grid-col"><div class="cell">col</div><div class="cell">col</div><div class="cell">col</div></div>
</div>
`.trim(),
    "grid-column": mdnGridDemo,
    "grid-row": mdnGridDemo,
    "grid-column-start": mdnGridDemo,
    "grid-column-end": mdnGridDemo,
    "grid-row-start": mdnGridDemo,
    "grid-row-end": mdnGridDemo,
    "grid-gap": `
<style>
  .grid { display:grid; grid-template-columns: repeat(3, 1fr); grid-gap: 16px; background:#0b1727; padding:12px; border-radius:14px; color:#e2e8f0; }
  .cell { background:#e0f2fe; color:#0f172a; border-radius:10px; padding:10px; text-align:center; font-weight:600; }
</style>
<div class="grid">
  <div class="cell">gap 16px</div><div class="cell">gap 16px</div><div class="cell">gap 16px</div>
</div>
`.trim(),
    "row-gap": `
<style>
  .grid { display:grid; grid-template-columns: repeat(3, 1fr); row-gap: 20px; column-gap: 8px; background:#0b1727; padding:12px; border-radius:14px; color:#e2e8f0; }
  .cell { background:#e0f2fe; color:#0f172a; border-radius:10px; padding:10px; text-align:center; font-weight:600; }
</style>
<div class="grid">
  <div class="cell">row-gap 20px</div><div class="cell">row-gap 20px</div><div class="cell">row-gap 20px</div>
</div>
`.trim(),
    "column-gap": `
<style>
  .grid { display:grid; grid-template-columns: repeat(3, 1fr); column-gap: 24px; row-gap: 8px; background:#0b1727; padding:12px; border-radius:14px; color:#e2e8f0; }
  .cell { background:#e0f2fe; color:#0f172a; border-radius:10px; padding:10px; text-align:center; font-weight:600; }
</style>
<div class="grid">
  <div class="cell">column-gap 24px</div><div class="cell">column-gap 24px</div><div class="cell">column-gap 24px</div>
</div>
`.trim(),
    "place-items": `
<style>
  .grid { display:grid; grid-template-columns: repeat(3, 80px); grid-template-rows: repeat(2, 80px); place-items: center; background:#0b1727; padding:12px; border-radius:14px; gap:8px; color:#e2e8f0; }
  .cell { background:#e0f2fe; color:#0f172a; border-radius:10px; padding:8px; text-align:center; font-weight:600; }
</style>
<div class="grid">
  <div class="cell">center</div><div class="cell">center</div><div class="cell">center</div>
  <div class="cell">center</div><div class="cell">center</div><div class="cell">center</div>
</div>
`.trim(),
    "place-content": `
<style>
  .grid { display:grid; grid-template-columns: repeat(2, 80px); grid-template-rows: repeat(2, 80px); place-content: space-between; background:#0b1727; padding:12px; border-radius:14px; height:220px; color:#e2e8f0; }
  .cell { background:#e0f2fe; color:#0f172a; border-radius:10px; padding:8px; text-align:center; font-weight:600; }
</style>
<div class="grid">
  <div class="cell">A</div><div class="cell">B</div><div class="cell">C</div><div class="cell">D</div>
</div>
`.trim(),
    "place-self": `
<style>
  .grid { display:grid; grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 100px); background:#0b1727; padding:12px; border-radius:14px; gap:8px; color:#e2e8f0; }
  .cell { background:#e0f2fe; color:#0f172a; border-radius:10px; padding:8px; text-align:center; font-weight:600; }
  .custom { place-self: end center; background:#bbf7d0; }
</style>
<div class="grid">
  <div class="cell">A</div><div class="cell custom">end/center</div><div class="cell">C</div><div class="cell">D</div>
</div>
`.trim(),
    "justify-items": `
<style>
  .grid { display:grid; grid-template-columns: repeat(3, 100px); justify-items: center; background:#0b1727; padding:12px; border-radius:14px; gap:8px; color:#e2e8f0; }
  .cell { background:#e0f2fe; color:#0f172a; border-radius:10px; padding:8px; text-align:center; font-weight:600; width:80px; }
</style>
<div class="grid">
  <div class="cell">center</div><div class="cell">center</div><div class="cell">center</div>
</div>
`.trim(),
    "justify-self": `
<style>
  .grid { display:grid; grid-template-columns: repeat(3, 100px); background:#0b1727; padding:12px; border-radius:14px; gap:8px; color:#e2e8f0; }
  .cell { background:#e0f2fe; color:#0f172a; border-radius:10px; padding:8px; text-align:center; font-weight:600; width:80px; justify-self: start; }
  .mid { justify-self: center; }
  .end { justify-self: end; }
</style>
<div class="grid">
  <div class="cell">start</div><div class="cell mid">center</div><div class="cell end">end</div>
</div>
`.trim(),
    "align-items": `
<style>
  .row { display:flex; gap:10px; height:140px; background:#0b1727; padding:12px; border-radius:14px; align-items: center; }
  .item { width:80px; border-radius:10px; background:#e0f2fe; color:#0f172a; display:flex; align-items:center; justify-content:center; font-weight:600; padding:8px; }
</style>
<div class="row">
  <div class="item">center</div><div class="item">center</div><div class="item">center</div>
</div>
`.trim(),
    "align-self": `
<style>
  .grid { display:grid; grid-template-columns: repeat(3, 100px); grid-template-rows: repeat(2, 80px); background:#0b1727; padding:12px; border-radius:14px; gap:8px; align-items: start; color:#e2e8f0; }
  .cell { background:#e0f2fe; color:#0f172a; border-radius:10px; padding:8px; text-align:center; font-weight:600; }
  .custom { align-self: end; background:#bbf7d0; }
</style>
<div class="grid">
  <div class="cell">A</div><div class="cell custom">end</div><div class="cell">C</div>
  <div class="cell">D</div><div class="cell">E</div><div class="cell">F</div>
</div>
`.trim(),
    "font": `
<style>
  * { box-sizing:border-box; }
  .stack { display:grid; gap:10px; background:#0b1727; padding:14px; border-radius:12px; border:2px solid #f76707; }
  .sample { padding:10px 12px; border-radius:8px; background:#ffd8a8; border:2px solid #ffa94d; color:#d9480f; }
</style>
<div class="stack">
  <div class="sample" style="font: italic 700 18px 'Georgia', serif;">font: italic 700 18px Georgia</div>
  <div class="sample" style="font: normal 400 16px 'Inter', sans-serif;">font: 400 16px Inter</div>
</div>
`.trim(),
    "font-family": `
<style>
  .stack { display:grid; gap:10px; background:#0b1727; padding:14px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .serif { font-family: 'Georgia', serif; background:#ffd8a8; color:#d9480f; padding:10px; border-radius:8px; border:2px solid #ffa94d; }
  .sans { font-family: 'Inter', sans-serif; background:#bbf7d0; color:#065f46; padding:10px; border-radius:8px; border:2px solid #22c55e; }
</style>
<div class="stack">
  <div class="serif">font-family: Georgia, serif</div>
  <div class="sans">font-family: Inter, sans-serif</div>
</div>
`.trim(),
    "font-size": `
<style>
  .stack { display:grid; gap:8px; background:#0b1727; padding:14px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .sample { background:#ffd8a8; color:#d9480f; padding:8px 10px; border-radius:8px; border:2px solid #ffa94d; }
</style>
<div class="stack">
  <div class="sample" style="font-size:14px;">font-size:14px</div>
  <div class="sample" style="font-size:20px;">font-size:20px</div>
</div>
`.trim(),
    "font-style": `
<style>
  .stack { display:grid; gap:8px; background:#0b1727; padding:14px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .sample { background:#ffd8a8; color:#d9480f; padding:8px 10px; border-radius:8px; border:2px solid #ffa94d; }
</style>
<div class="stack">
  <div class="sample" style="font-style: normal;">font-style: normal</div>
  <div class="sample" style="font-style: italic;">font-style: italic</div>
</div>
`.trim(),
    "font-weight": `
<style>
  .stack { display:grid; gap:8px; background:#0b1727; padding:14px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .sample { background:#ffd8a8; color:#d9480f; padding:8px 10px; border-radius:8px; border:2px solid #ffa94d; }
</style>
<div class="stack">
  <div class="sample" style="font-weight:400;">font-weight:400</div>
  <div class="sample" style="font-weight:700;">font-weight:700</div>
</div>
`.trim(),
    "font-variant": `
<style>
  .stack { display:grid; gap:8px; background:#0b1727; padding:14px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .sample { background:#ffd8a8; color:#d9480f; padding:8px 10px; border-radius:8px; border:2px solid #ffa94d; }
</style>
<div class="stack">
  <div class="sample" style="font-variant: normal;">font-variant: normal</div>
  <div class="sample" style="font-variant: small-caps;">font-variant: small-caps</div>
</div>
`.trim(),
    "font-feature-settings": `
<style>
  .stack { display:grid; gap:8px; background:#0b1727; padding:14px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .sample { background:#ffd8a8; color:#d9480f; padding:8px 10px; border-radius:8px; border:2px solid #ffa94d; font-variant-ligatures: none; }
</style>
<div class="stack">
  <div class="sample" style="font-feature-settings: 'liga' 1;">liga on → office</div>
  <div class="sample" style="font-feature-settings: 'liga' 0;">liga off → office</div>
</div>
`.trim(),
    "font-stretch": `
<style>
  .stack { display:grid; gap:8px; background:#0b1727; padding:14px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .sample { background:#ffd8a8; color:#d9480f; padding:8px 10px; border-radius:8px; border:2px solid #ffa94d; }
</style>
<div class="stack">
  <div class="sample" style="font-stretch: condensed;">font-stretch: condensed</div>
  <div class="sample" style="font-stretch: expanded;">font-stretch: expanded</div>
</div>
`.trim(),
    "line-height": `
<style>
  .stack { display:grid; gap:8px; background:#0b1727; padding:14px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .sample { background:#ffd8a8; color:#d9480f; padding:8px 10px; border-radius:8px; border:2px solid #ffa94d; max-width:360px; }
</style>
<div class="stack">
  <div class="sample" style="line-height:1.1;">line-height:1.1<br/>Texto multilinea para ver altura.</div>
  <div class="sample" style="line-height:1.8;">line-height:1.8<br/>Texto multilinea para ver altura.</div>
</div>
`.trim(),
    "letter-spacing": `
<style>
  .stack { display:grid; gap:8px; background:#0b1727; padding:14px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .sample { background:#ffd8a8; color:#d9480f; padding:8px 10px; border-radius:8px; border:2px solid #ffa94d; }
</style>
<div class="stack">
  <div class="sample" style="letter-spacing:0px;">letter-spacing:0px</div>
  <div class="sample" style="letter-spacing:2px;">letter-spacing:2px</div>
</div>
`.trim(),
    "word-spacing": `
<style>
  .stack { display:grid; gap:8px; background:#0b1727; padding:14px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .sample { background:#ffd8a8; color:#d9480f; padding:8px 10px; border-radius:8px; border:2px solid #ffa94d; }
</style>
<div class="stack">
  <div class="sample" style="word-spacing:2px;">word spacing default</div>
  <div class="sample" style="word-spacing:12px;">word spacing ampliado</div>
</div>
`.trim(),
    "text-align": `
<style>
  .stack { display:grid; gap:8px; background:#0b1727; padding:14px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .sample { background:#ffd8a8; color:#d9480f; padding:10px; border-radius:8px; border:2px solid #ffa94d; }
</style>
<div class="stack">
  <div class="sample" style="text-align:left;">text-align: left</div>
  <div class="sample" style="text-align:center;">text-align: center</div>
  <div class="sample" style="text-align:right;">text-align: right</div>
</div>
`.trim(),
    "text-decoration": `
<style>
  .stack { display:grid; gap:8px; background:#0b1727; padding:14px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .sample { background:#ffd8a8; color:#d9480f; padding:8px 10px; border-radius:8px; border:2px solid #ffa94d; }
</style>
<div class="stack">
  <div class="sample" style="text-decoration: underline;">underline</div>
  <div class="sample" style="text-decoration: line-through;">line-through</div>
  <div class="sample" style="text-decoration: overline;">overline</div>
</div>
`.trim(),
    "text-decoration-color": `
<style>
  .sample { background:#ffd8a8; color:#d9480f; padding:8px 10px; border-radius:8px; border:2px solid #ffa94d; text-decoration-line: underline; }
</style>
<div class="sample" style="text-decoration-color:#22c55e;">underline verde</div>
<div class="sample" style="text-decoration-color:#6366f1;">underline violeta</div>
`.trim(),
    "text-decoration-style": `
<style>
  .sample { background:#ffd8a8; color:#d9480f; padding:8px 10px; border-radius:8px; border:2px solid #ffa94d; text-decoration-line: underline; text-decoration-color:#d9480f; }
</style>
<div class="sample" style="text-decoration-style: solid;">solid</div>
<div class="sample" style="text-decoration-style: wavy;">wavy</div>
<div class="sample" style="text-decoration-style: dashed;">dashed</div>
`.trim(),
    "text-decoration-thickness": `
<style>
  .sample { background:#ffd8a8; color:#d9480f; padding:8px 10px; border-radius:8px; border:2px solid #ffa94d; text-decoration-line: underline; text-decoration-color:#d9480f; }
</style>
<div class="sample" style="text-decoration-thickness: 1px;">thickness 1px</div>
<div class="sample" style="text-decoration-thickness: 4px;">thickness 4px</div>
`.trim(),
    "text-transform": `
<style>
  .sample { background:#ffd8a8; color:#d9480f; padding:8px 10px; border-radius:8px; border:2px solid #ffa94d; }
</style>
<div class="sample" style="text-transform: uppercase;">uppercase</div>
<div class="sample" style="text-transform: capitalize;">capitalize words</div>
<div class="sample" style="text-transform: lowercase;">LOWERCASE</div>
`.trim(),
    "text-indent": `
<style>
  .sample { background:#ffd8a8; color:#d9480f; padding:12px; border-radius:8px; border:2px solid #ffa94d; max-width:380px; text-indent:24px; }
</style>
<div class="sample">text-indent aplica sangría a la primera línea del párrafo.</div>
`.trim(),
    "text-rendering": `
<style>
  .sample { background:#ffd8a8; color:#d9480f; padding:12px; border-radius:8px; border:2px solid #ffa94d; font-size:18px; }
</style>
<div class="sample" style="text-rendering: optimizeLegibility;">optimizeLegibility</div>
<div class="sample" style="text-rendering: geometricPrecision;">geometricPrecision</div>
`.trim(),
    "white-space": `
<style>
  .sample { background:#ffd8a8; color:#d9480f; padding:12px; border-radius:8px; border:2px solid #ffa94d; width:260px; }
</style>
<div class="sample" style="white-space: normal;">white space normal con wrap.</div>
<div class="sample" style="white-space: nowrap;">white space nowrap sin saltos ni wrap.</div>
`.trim(),
    "word-break": `
<style>
  .sample { background:#ffd8a8; color:#d9480f; padding:12px; border-radius:8px; border:2px solid #ffa94d; width:240px; }
</style>
<div class="sample" style="word-break: normal;">word-break normal ejemplo-superlargo-no-corta</div>
<div class="sample" style="word-break: break-all;">break-all ejemplo-superlargo-no-corta</div>
`.trim(),
    "overflow-wrap": `
<style>
  .sample { background:#ffd8a8; color:#d9480f; padding:12px; border-radius:8px; border:2px solid #ffa94d; width:240px; }
</style>
<div class="sample" style="overflow-wrap: normal;">overflow-wrap normal ejemploSuperLargoQueSeDesborda</div>
<div class="sample" style="overflow-wrap: anywhere;">overflow-wrap anywhere ejemploSuperLargoQueSeDesborda</div>
`.trim(),
    "hyphens": `
<style>
  .sample { background:#ffd8a8; color:#d9480f; padding:12px; border-radius:8px; border:2px solid #ffa94d; width:240px; hyphens: auto; }
</style>
<div class="sample">Habilita cortes con guiones automáticos en palabras muy largas dependiendo del idioma.</div>
`.trim(),
    "direction": `
<style>
  .stack { display:grid; gap:8px; background:#0b1727; padding:14px; border-radius:12px; border:2px solid #f76707; color:#e2e8f0; }
  .sample { background:#ffd8a8; color:#d9480f; padding:10px; border-radius:8px; border:2px solid #ffa94d; }
</style>
<div class="stack">
  <div class="sample" style="direction: ltr;">direction: ltr (texto izquierda a derecha)</div>
  <div class="sample" style="direction: rtl;">direction: rtl (texto derecha a izquierda)</div>
</div>
`.trim(),
    "unicode-bidi": `
<style>
  .sample { background:#ffd8a8; color:#d9480f; padding:10px; border-radius:8px; border:2px solid #ffa94d; direction: rtl; unicode-bidi: bidi-override; }
</style>
<div class="sample">Texto con unicode-bidi: bidi-override</div>
`.trim(),
    "vertical-align": `
<style>
  .table { display:table; background:#0b1727; padding:12px; border-radius:12px; border:2px solid #f76707; }
  .row { display:table-row; }
  .cell { display:table-cell; padding:10px; background:#ffd8a8; border:2px solid #ffa94d; color:#d9480f; font-weight:700; }
  .mid { vertical-align: middle; }
  .top { vertical-align: top; }
  .bottom { vertical-align: bottom; }
</style>
<div class="table">
  <div class="row">
    <div class="cell top">top</div>
    <div class="cell mid" style="height:60px;">middle</div>
    <div class="cell bottom" style="height:80px;">bottom</div>
  </div>
</div>
`.trim(),
    "color": `
<style>
  * { box-sizing:border-box; }
  .stack { display:grid; gap:8px; background:#0b1727; padding:14px; border-radius:12px; border:2px solid #f76707; }
  .swatch { padding:12px; border-radius:8px; border:2px solid #ffa94d; font-weight:700; }
</style>
<div class="stack">
  <div class="swatch" style="color:#d9480f; background:#ffd8a8;">color: #d9480f</div>
  <div class="swatch" style="color:#2563eb; background:#dbeafe;">color: #2563eb</div>
</div>
`.trim(),
    "background": `
<style>
  * { box-sizing:border-box; }
  .card { padding:14px; border-radius:10px; border:2px solid #ffa94d; color:#0f172a; font-weight:700; background:#ffd8a8; }
</style>
<div class="card">background: sólido; combina con otras propiedades de background</div>
`.trim(),
    "background-color": `
<style>
  .stack { display:grid; gap:8px; background:#0b1727; padding:14px; border-radius:12px; border:2px solid #f76707; }
  .swatch { padding:12px; border-radius:8px; border:2px solid #ffa94d; font-weight:700; }
</style>
<div class="stack">
  <div class="swatch" style="background-color:#ffd8a8; color:#d9480f;">#ffd8a8</div>
  <div class="swatch" style="background-color:#c7d2fe; color:#312e81;">#c7d2fe</div>
</div>
`.trim(),
    "background-image": `
<style>
  .panel { padding:14px; border-radius:12px; border:2px solid #ffa94d; color:#0f172a; font-weight:700; background-image: linear-gradient(135deg,#fef3c7,#fcd34d); }
</style>
<div class="panel">background-image: linear-gradient(...)</div>
`.trim(),
    "background-position": `
<style>
  .panel { width:220px; height:140px; border-radius:12px; border:2px solid #ffa94d; background-image:url('https://via.placeholder.com/200'); background-repeat:no-repeat; background-color:#ffd8a8; }
  .center { background-position: center; }
  .top-left { background-position: top left; }
</style>
<div style="display:flex; gap:12px;">
  <div class="panel top-left"></div>
  <div class="panel center"></div>
</div>
`.trim(),
    "background-size": `
<style>
  .panel { width:220px; height:140px; border-radius:12px; border:2px solid #ffa94d; background-image:url('https://via.placeholder.com/200'); background-repeat:no-repeat; background-color:#ffd8a8; }
  .cover { background-size: cover; }
  .contain { background-size: contain; background-position:center; }
</style>
<div style="display:flex; gap:12px;">
  <div class="panel cover"></div>
  <div class="panel contain"></div>
</div>
`.trim(),
    "background-repeat": `
<style>
  .panel { width:220px; height:120px; border-radius:12px; border:2px solid #ffa94d; background-image:url('https://via.placeholder.com/60x60'); background-color:#ffd8a8; }
  .repeat { background-repeat: repeat; }
  .no { background-repeat: no-repeat; background-position:center; }
</style>
<div style="display:flex; gap:12px;">
  <div class="panel repeat"></div>
  <div class="panel no"></div>
</div>
`.trim(),
    "background-origin": `
<style>
  .panel { width:220px; height:140px; border:2px solid #ffa94d; padding:20px; border-radius:12px; background-image:url('https://via.placeholder.com/120'); background-repeat:no-repeat; background-color:#ffd8a8; }
  .padding { background-origin: padding-box; }
  .border { background-origin: border-box; }
</style>
<div style="display:flex; gap:12px;">
  <div class="panel padding">padding-box</div>
  <div class="panel border">border-box</div>
</div>
`.trim(),
    "background-clip": `
<style>
  .panel { width:220px; height:140px; border:10px solid rgba(247,103,7,0.6); padding:20px; border-radius:12px; background:#ffd8a8; background-clip: padding-box; }
  .text { background-clip: text; -webkit-background-clip: text; color: transparent; background-image: linear-gradient(135deg,#f97316,#f59e0b); font-weight:700; font-size:20px; }
</style>
<div style="display:grid; gap:10px;">
  <div class="panel"></div>
  <div class="text">background-clip: text</div>
</div>
`.trim(),
    "background-attachment": `
<style>
  .panel { width:220px; height:140px; border-radius:12px; border:2px solid #ffa94d; background-image:url('https://via.placeholder.com/200'); background-repeat:no-repeat; background-color:#ffd8a8; background-attachment: local; overflow:auto; padding:8px; }
</style>
<div class="panel">background-attachment: local (scroll con el contenido).<br/>Texto<br/>Texto<br/>Texto<br/>Texto</div>
`.trim(),
    "mix-blend-mode": `
<style>
  .stage { position:relative; width:220px; height:140px; border-radius:12px; overflow:hidden; background:#0b1727; border:2px solid #f76707; }
  .bg { position:absolute; inset:0; background: linear-gradient(135deg,#0ea5e9,#38bdf8); }
  .fg { position:absolute; inset:20px; background:#ffd8a8; mix-blend-mode: multiply; border-radius:10px; border:2px solid #ffa94d; }
</style>
<div class="stage">
  <div class="bg"></div>
  <div class="fg"></div>
</div>
`.trim(),
    "background-blend-mode": `
<style>
  .panel { width:220px; height:140px; border-radius:12px; border:2px solid #ffa94d; background-image: url('https://via.placeholder.com/200'), linear-gradient(135deg,#f97316,#fcd34d); background-blend-mode: multiply; }
</style>
<div class="panel"></div>
`.trim(),
    "box-shadow": `
<style>
  * { box-sizing:border-box; }
  .stack { display:flex; gap:16px; }
  .card { padding:14px; border-radius:12px; background:#fff; color:#0f172a; border:2px solid #ffa94d; font-weight:700; }
  .soft { box-shadow: 0 10px 20px rgba(14,165,233,0.25); }
  .hard { box-shadow: 0 8px 0 rgba(247,103,7,0.4); }
</style>
<div class="stack">
  <div class="card soft">sombra suave</div>
  <div class="card hard">sombra dura</div>
</div>
`.trim(),
    "opacity": `
<style>
  * { box-sizing: border-box; }
  .stack { display:flex; gap:12px; background:#0b1727; padding:14px; border-radius:12px; border:2px solid #f76707; }
  .box { padding:12px; border-radius:8px; background:#ffd8a8; color:#d9480f; font-weight:700; border:2px solid #ffa94d; }
  .low { opacity:0.35; }
</style>
<div class="stack">
  <div class="box">opacity:1</div>
  <div class="box low">opacity:0.35</div>
</div>
`.trim(),
    "filter": `
<style>
  .stack { display:flex; gap:12px; }
  img { width:140px; height:90px; object-fit: cover; border-radius:10px; border:2px solid #ffa94d; }
  .combo { filter: sepia(0.2) saturate(1.4) drop-shadow(0 6px 10px rgba(0,0,0,0.25)); }
</style>
<div class="stack">
  <img src="https://via.placeholder.com/200" alt="normal" />
  <img class="combo" src="https://via.placeholder.com/200" alt="filters" />
</div>
`.trim(),
    "blur": `
<style>
  .stack { display:flex; gap:12px; }
  img { width:140px; height:90px; object-fit: cover; border-radius:10px; border:2px solid #ffa94d; }
  .blur { filter: blur(3px); }
</style>
<div class="stack">
  <img src="https://via.placeholder.com/200" alt="normal" />
  <img class="blur" src="https://via.placeholder.com/200" alt="blur" />
</div>
`.trim(),
    "brightness": `
<style>
  .stack { display:flex; gap:12px; }
  img { width:140px; height:90px; object-fit: cover; border-radius:10px; border:2px solid #ffa94d; }
  .low { filter: brightness(0.6); }
  .high { filter: brightness(1.4); }
</style>
<div class="stack">
  <img class="low" src="https://via.placeholder.com/200" alt="0.6x" />
  <img class="high" src="https://via.placeholder.com/200" alt="1.4x" />
</div>
`.trim(),
    "contrast": `
<style>
  .stack { display:flex; gap:12px; }
  img { width:140px; height:90px; object-fit: cover; border-radius:10px; border:2px solid #ffa94d; }
  .low { filter: contrast(0.7); }
  .high { filter: contrast(1.6); }
</style>
<div class="stack">
  <img class="low" src="https://via.placeholder.com/200" alt="0.7x" />
  <img class="high" src="https://via.placeholder.com/200" alt="1.6x" />
</div>
`.trim(),
    "drop-shadow": `
<style>
  .stack { display:flex; gap:12px; align-items:center; }
  img { width:120px; height:120px; object-fit: cover; border-radius:50%; }
  .shadow { filter: drop-shadow(0 8px 14px rgba(0,0,0,0.3)); }
</style>
<div class="stack">
  <img src="https://via.placeholder.com/160" alt="normal" />
  <img class="shadow" src="https://via.placeholder.com/160" alt="drop-shadow" />
</div>
`.trim(),
    "grayscale": `
<style>
  .stack { display:flex; gap:12px; }
  img { width:140px; height:90px; object-fit: cover; border-radius:10px; border:2px solid #ffa94d; }
  .gray { filter: grayscale(1); }
</style>
<div class="stack">
  <img src="https://via.placeholder.com/200" alt="color" />
  <img class="gray" src="https://via.placeholder.com/200" alt="gray" />
</div>
`.trim(),
    "hue-rotate": `
<style>
  .stack { display:flex; gap:12px; }
  img { width:140px; height:90px; object-fit: cover; border-radius:10px; border:2px solid #ffa94d; }
  .rot { filter: hue-rotate(120deg); }
</style>
<div class="stack">
  <img src="https://via.placeholder.com/200" alt="normal" />
  <img class="rot" src="https://via.placeholder.com/200" alt="hue 120deg" />
</div>
`.trim(),
    "invert": `
<style>
  .stack { display:flex; gap:12px; }
  img { width:140px; height:90px; object-fit: cover; border-radius:10px; border:2px solid #ffa94d; }
  .inv { filter: invert(1); }
</style>
<div class="stack">
  <img src="https://via.placeholder.com/200" alt="normal" />
  <img class="inv" src="https://via.placeholder.com/200" alt="invert" />
</div>
`.trim(),
    "saturate": `
<style>
  .stack { display:flex; gap:12px; }
  img { width:140px; height:90px; object-fit: cover; border-radius:10px; border:2px solid #ffa94d; }
  .sat { filter: saturate(2); }
</style>
<div class="stack">
  <img src="https://via.placeholder.com/200" alt="normal" />
  <img class="sat" src="https://via.placeholder.com/200" alt="2x saturate" />
</div>
`.trim(),
    "sepia": `
<style>
  .stack { display:flex; gap:12px; }
  img { width:140px; height:90px; object-fit: cover; border-radius:10px; border:2px solid #ffa94d; }
  .sepia { filter: sepia(1); }
</style>
<div class="stack">
  <img src="https://via.placeholder.com/200" alt="normal" />
  <img class="sepia" src="https://via.placeholder.com/200" alt="sepia" />
</div>
`.trim(),
    "backdrop-filter": `
<style>
  .stage { position:relative; width:240px; height:140px; border-radius:12px; overflow:hidden; background:url('https://via.placeholder.com/300') center/cover; border:2px solid #ffa94d; }
  .panel { position:absolute; inset:12px; background:rgba(255,216,168,0.7); backdrop-filter: blur(6px); border-radius:10px; border:2px solid #ffa94d; display:flex; align-items:center; justify-content:center; color:#d9480f; font-weight:700; }
</style>
<div class="stage">
  <div class="panel">backdrop-filter: blur(6px)</div>
</div>
`.trim(),
    "transition": `
<style>
  * { box-sizing:border-box; }
  .btn { background:#ffd8a8; color:#d9480f; padding:12px 16px; border:2px solid #ffa94d; border-radius:10px; font-weight:700; transition: transform 250ms ease, box-shadow 250ms ease; }
  .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(247,103,7,0.35); }
</style>
<button class="btn">hover me (transition)</button>
`.trim(),
    "transition-property": `
<style>
  .card { width:200px; padding:12px; border:2px solid #ffa94d; border-radius:10px; background:#ffd8a8; color:#d9480f; font-weight:700; transition-property: transform, box-shadow; transition-duration: 250ms; transition-timing-function: ease; }
  .card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(247,103,7,0.35); }
</style>
<div class="card">transition-property: transform, box-shadow</div>
`.trim(),
    "transition-duration": `
<style>
  .stack { display:flex; gap:12px; }
  .card { width:160px; padding:12px; border:2px solid #ffa94d; border-radius:10px; background:#ffd8a8; color:#d9480f; font-weight:700; transition-property: transform; }
  .fast { transition-duration: 150ms; }
  .slow { transition-duration: 700ms; }
  .card:hover { transform: translateY(-4px); }
</style>
<div class="stack">
  <div class="card fast">150ms</div>
  <div class="card slow">700ms</div>
</div>
`.trim(),
    "transition-delay": `
<style>
  .card { width:200px; padding:12px; border:2px solid #ffa94d; border-radius:10px; background:#ffd8a8; color:#d9480f; font-weight:700; transition: transform 300ms ease; transition-delay: 300ms; }
  .card:hover { transform: translateY(-6px); }
</style>
<div class="card">transition-delay: 300ms</div>
`.trim(),
    "transition-timing-function": `
<style>
  .stack { display:flex; gap:12px; }
  .card { width:160px; padding:12px; border:2px solid #ffa94d; border-radius:10px; background:#ffd8a8; color:#d9480f; font-weight:700; transition: transform 450ms; }
  .ease { transition-timing-function: ease; }
  .linear { transition-timing-function: linear; }
  .card:hover { transform: translateY(-6px); }
</style>
<div class="stack">
  <div class="card ease">ease</div>
  <div class="card linear">linear</div>
</div>
`.trim(),
    "animation": `
<style>
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.08); }
    100% { transform: scale(1); }
  }
  .pill { display:inline-flex; align-items:center; justify-content:center; padding:10px 16px; border-radius:999px; background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; font-weight:700; animation: pulse 1.2s ease-in-out infinite; }
</style>
<div class="pill">animation: pulse</div>
`.trim(),
    "animation-name": `
<style>
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .loader { width:48px; height:48px; border:4px solid #ffa94d; border-top-color: #f76707; border-radius:50%; animation-name: spin; animation-duration: 1s; animation-timing-function: linear; animation-iteration-count: infinite; }
</style>
<div class="loader" aria-label="spinner"></div>
`.trim(),
    "animation-duration": `
<style>
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.08); }
    100% { transform: scale(1); }
  }
  .pill { display:inline-flex; align-items:center; justify-content:center; padding:10px 16px; border-radius:999px; background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; font-weight:700; animation-name: pulse; animation-timing-function: ease-in-out; }
  .fast { animation-duration: 0.6s; }
  .slow { animation-duration: 2s; }
</style>
<div style="display:flex; gap:12px;">
  <div class="pill fast">0.6s</div>
  <div class="pill slow">2s</div>
</div>
`.trim(),
    "animation-timing-function": `
<style>
  @keyframes slide {
    0% { transform: translateX(0); }
    50% { transform: translateX(12px); }
    100% { transform: translateX(0); }
  }
  .tag { padding:10px 14px; border-radius:10px; background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; font-weight:700; display:inline-block; animation-name: slide; animation-duration: 1.2s; animation-iteration-count: infinite; }
  .ease { animation-timing-function: ease; }
  .linear { animation-timing-function: linear; }
</style>
<div style="display:flex; gap:12px;">
  <span class="tag ease">ease</span>
  <span class="tag linear">linear</span>
</div>
`.trim(),
    "animation-delay": `
<style>
  @keyframes fade {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .badge { padding:10px 14px; border-radius:10px; background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; font-weight:700; animation: fade 1s ease forwards; animation-delay: 0.5s; opacity:0; }
</style>
<div class="badge">animation-delay: 0.5s</div>
`.trim(),
    "animation-iteration-count": `
<style>
  @keyframes flash { 0%,100% { opacity:1; } 50% { opacity:0.2; } }
  .tag { padding:10px 14px; border-radius:10px; background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; font-weight:700; display:inline-block; }
  .once { animation: flash 1s ease 1; }
  .infinite { animation: flash 1s ease infinite; }
</style>
<div style="display:flex; gap:12px;">
  <span class="tag once">1 vez</span>
  <span class="tag infinite">infinite</span>
</div>
`.trim(),
    "animation-direction": `
<style>
  @keyframes slideX { 0% { transform: translateX(0); } 100% { transform: translateX(20px); } }
  .tag { padding:10px 14px; border-radius:10px; background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; font-weight:700; display:inline-block; animation-duration:1s; animation-iteration-count: infinite; }
  .normal { animation-name: slideX; animation-direction: normal; }
  .alternate { animation-name: slideX; animation-direction: alternate; }
</style>
<div style="display:flex; gap:12px;">
  <span class="tag normal">normal</span>
  <span class="tag alternate">alternate</span>
</div>
`.trim(),
    "animation-fill-mode": `
<style>
  @keyframes fadeIn {
    from { opacity:0; transform: translateY(6px); }
    to { opacity:1; transform: translateY(0); }
  }
  .pill { padding:10px 14px; border-radius:10px; background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; font-weight:700; display:inline-block; animation-name: fadeIn; animation-duration: 1s; }
  .none { animation-fill-mode: none; }
  .forwards { animation-fill-mode: forwards; }
</style>
<div style="display:flex; gap:12px;">
  <span class="pill none">none</span>
  <span class="pill forwards">forwards</span>
</div>
`.trim(),
    "animation-play-state": `
<style>
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.08); }
    100% { transform: scale(1); }
  }
  .pill { padding:10px 14px; border-radius:10px; background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; font-weight:700; display:inline-block; animation: pulse 1s ease-in-out infinite; }
  .paused { animation-play-state: paused; }
</style>
<div style="display:flex; gap:12px;">
  <span class="pill">running</span>
  <span class="pill paused">paused</span>
</div>
`.trim(),
    "transform": `
<style>
  * { box-sizing:border-box; }
  .stack { display:flex; gap:14px; background:#0b1727; padding:14px; border-radius:12px; border:2px solid #f76707; }
  .card { width:120px; height:90px; background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:700; transition: transform 300ms ease; }
  .rotate { transform: rotate(-8deg); }
  .scale { transform: scale(1.1); }
</style>
<div class="stack">
  <div class="card">normal</div>
  <div class="card rotate">rotate</div>
  <div class="card scale">scale</div>
</div>
`.trim(),
    "transform-origin": `
<style>
  .stage { display:flex; gap:12px; background:#0b1727; padding:14px; border-radius:12px; border:2px solid #f76707; }
  .card { width:120px; height:90px; background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:700; transition: transform 300ms ease; }
  .top-left { transform-origin: top left; transform: rotate(12deg); }
  .center { transform-origin: center; transform: rotate(12deg); }
</style>
<div class="stage">
  <div class="card top-left">origin: TL</div>
  <div class="card center">origin: center</div>
</div>
`.trim(),
    "transform-style": `
<style>
  .scene { perspective: 600px; display:flex; gap:14px; background:#0b1727; padding:14px; border-radius:12px; border:2px solid #f76707; }
  .cube { position: relative; width: 120px; height: 120px; transform-style: preserve-3d; transform: rotateY(25deg) rotateX(20deg); }
  .face { position:absolute; inset:0; background: rgba(255,216,168,0.8); border:2px solid #ffa94d; border-radius:10px; display:flex; align-items:center; justify-content:center; color:#d9480f; font-weight:700; }
  .back { transform: translateZ(-60px) rotateY(180deg); }
  .front { transform: translateZ(60px); }
</style>
<div class="scene">
  <div class="cube">
    <div class="face front">preserve-3d</div>
    <div class="face back">preserve-3d</div>
  </div>
</div>
`.trim(),
    "perspective": `
<style>
  .scene { perspective: 500px; background:#0b1727; padding:14px; border-radius:12px; border:2px solid #f76707; display:flex; gap:12px; }
  .card { width:160px; height:100px; background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:700; transform: rotateY(25deg); }
</style>
<div class="scene">
  <div class="card">perspective: 500px</div>
</div>
`.trim(),
    "perspective-origin": `
<style>
  .scene { display:flex; gap:12px; background:#0b1727; padding:14px; border-radius:12px; border:2px solid #f76707; }
  .card { width:160px; height:100px; background:#ffd8a8; color:#d9480f; border:2px solid #ffa94d; border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:700; transform: rotateY(25deg); }
  .tl { perspective: 400px; perspective-origin: top left; }
  .center { perspective: 400px; perspective-origin: center; }
</style>
<div class="scene">
  <div class="tl"><div class="card">origin: TL</div></div>
  <div class="center"><div class="card">origin: center</div></div>
</div>
`.trim(),
    "backface-visibility": `
<style>
  .scene { perspective: 600px; display:flex; gap:12px; background:#0b1727; padding:14px; border-radius:12px; border:2px solid #f76707; }
  .card { position: relative; width: 140px; height: 100px; transform-style: preserve-3d; animation: flip 2s infinite linear; }
  .face { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-weight:700; border-radius:10px; border:2px solid #ffa94d; backface-visibility: hidden; }
  .front { background:#ffd8a8; color:#d9480f; }
  .back { background:#c7d2fe; color:#312e81; transform: rotateY(180deg); }
  .show-back .back { backface-visibility: visible; }
  @keyframes flip { to { transform: rotateY(360deg); } }
</style>
<div class="scene">
  <div class="card">
    <div class="face front">hidden</div>
    <div class="face back">hidden</div>
  </div>
  <div class="card show-back">
    <div class="face front">visible</div>
    <div class="face back">visible</div>
  </div>
</div>
`.trim(),
  };
  if (enriched[name]) return enriched[name];
  const demos: Record<string, string> = {
    "display-flex": `
<style>
  .row { display:flex; gap:12px; background:#f8fafc; padding:14px; border-radius:12px; }
  .item { padding:12px; border-radius:10px; background:#e0f2fe; color:#0f172a; font-weight:600; flex: 1; text-align:center; }
</style>
<div class="row">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
</div>
`.trim(),
    "flex": `
<style>
  .row { display:flex; gap:12px; background:#f8fafc; padding:14px; border-radius:12px; }
  .item { padding:12px; border-radius:10px; color:#0f172a; font-weight:600; text-align:center; }
  .a { flex: 1 1 80px; background:#e0f2fe; }
  .b { flex: 2 1 80px; background:#bbf7d0; }
  .c { flex: 1 2 80px; background:#fde68a; }
</style>
<div class="row">
  <div class="item a">1 1 80px</div>
  <div class="item b">2 1 80px</div>
  <div class="item c">1 2 80px</div>
</div>
`.trim(),
    "flex-direction": `
<style>
  .row { display:flex; gap:12px; }
  .col { display:flex; flex-direction:column; gap:8px; }
  .box { padding:10px; border-radius:10px; background:#e0f2fe; color:#0f172a; text-align:center; }
</style>
<div class="row">
  <div class="box" style="display:flex; gap:8px;">row</div>
  <div class="col" style="background:#f8fafc; padding:10px; border-radius:10px;">
    <div class="box">col 1</div>
    <div class="box">col 2</div>
    <div class="box">col 3</div>
  </div>
</div>
`.trim(),
    "flex-wrap": `
<style>
  .wrap { display:flex; flex-wrap: wrap; gap:10px; width: 280px; background:#f8fafc; padding:12px; border-radius:12px; }
  .nowrap { display:flex; flex-wrap: nowrap; gap:10px; width: 280px; background:#fef9c3; padding:12px; border-radius:12px; overflow:auto; }
  .item { flex: 0 0 120px; padding:10px; border-radius:10px; background:#e0f2fe; color:#0f172a; text-align:center; }
</style>
<div style="display:grid; gap:10px;">
  <div class="wrap">
    <div class="item">wrap</div><div class="item">wrap</div><div class="item">wrap</div>
  </div>
  <div class="nowrap">
    <div class="item">nowrap</div><div class="item">nowrap</div><div class="item">nowrap</div>
  </div>
</div>
`.trim(),
    "flex-flow": `
<style>
  .row-wrap { display:flex; flex-flow: row wrap; gap:10px; width: 260px; background:#f8fafc; padding:12px; border-radius:12px; }
  .col-nowrap { display:flex; flex-flow: column nowrap; gap:10px; background:#fef9c3; padding:12px; border-radius:12px; }
  .item { flex: 0 0 120px; padding:10px; border-radius:10px; background:#e0f2fe; color:#0f172a; text-align:center; }
</style>
<div style="display:grid; gap:10px;">
  <div class="row-wrap">
    <div class="item">row wrap</div><div class="item">row wrap</div><div class="item">row wrap</div>
  </div>
  <div class="col-nowrap">
    <div class="item">col</div><div class="item">col</div><div class="item">col</div>
  </div>
</div>
`.trim(),
    "justify-content": `
<style>
  .demo { display:flex; gap:8px; background:#f8fafc; padding:12px; border-radius:12px; }
  .center { justify-content: center; }
  .between { justify-content: space-between; }
  .item { width:60px; height:36px; border-radius:10px; background:#e0f2fe; color:#0f172a; display:flex; align-items:center; justify-content:center; font-weight:600; }
</style>
<div style="display:grid; gap:10px;">
  <div class="demo center">
    <div class="item">1</div><div class="item">2</div><div class="item">3</div>
  </div>
  <div class="demo between">
    <div class="item">1</div><div class="item">2</div><div class="item">3</div>
  </div>
</div>
`.trim(),
    "align-items": `
<style>
  .row { display:flex; gap:10px; height:140px; background:#f8fafc; padding:12px; border-radius:12px; }
  .center { align-items: center; }
  .start { align-items: flex-start; }
  .end { align-items: flex-end; }
  .item { width:80px; border-radius:10px; background:#e0f2fe; color:#0f172a; display:flex; align-items:center; justify-content:center; font-weight:600; padding:8px; }
</style>
<div class="row center">
  <div class="item">center</div><div class="item">center</div><div class="item">center</div>
</div>
`.trim(),
    "align-content": `
<style>
  .wrap { display:flex; flex-wrap:wrap; gap:8px; height:180px; background:#f8fafc; padding:10px; border-radius:12px; align-content: space-between; }
  .item { flex:0 0 60px; height:40px; border-radius:10px; background:#e0f2fe; color:#0f172a; display:flex; align-items:center; justify-content:center; font-weight:600; }
</style>
<div class="wrap">
  <div class="item">1</div><div class="item">2</div><div class="item">3</div>
  <div class="item">4</div><div class="item">5</div><div class="item">6</div>
</div>
`.trim(),
    "align-self": `
<style>
  .row { display:flex; align-items:flex-start; gap:10px; height:140px; background:#f8fafc; padding:12px; border-radius:12px; }
  .item { width:80px; border-radius:10px; background:#e0f2fe; color:#0f172a; display:flex; align-items:center; justify-content:center; font-weight:600; padding:8px; }
  .end { align-self: flex-end; }
</style>
<div class="row">
  <div class="item">start</div>
  <div class="item end">self end</div>
  <div class="item">start</div>
</div>
`.trim(),
    "order": `
<style>
  .row { display:flex; gap:10px; background:#f8fafc; padding:12px; border-radius:12px; }
  .item { width:70px; height:40px; border-radius:10px; background:#e0f2fe; color:#0f172a; display:flex; align-items:center; justify-content:center; font-weight:600; }
  .b { order: -1; }
  .c { order: 2; }
</style>
<div class="row">
  <div class="item a">A</div>
  <div class="item b">B (-1)</div>
  <div class="item c">C (2)</div>
</div>
`.trim(),
    "flex-grow": `
<style>
  .row { display:flex; gap:10px; background:#f8fafc; padding:12px; border-radius:12px; }
  .item { border-radius:10px; background:#e0f2fe; color:#0f172a; display:flex; align-items:center; justify-content:center; font-weight:600; padding:10px; }
  .a { flex-grow:1; }
  .b { flex-grow:2; }
</style>
<div class="row">
  <div class="item a">grow 1</div>
  <div class="item b">grow 2</div>
  <div class="item a">grow 1</div>
</div>
`.trim(),
    "flex-shrink": `
<style>
  .row { display:flex; gap:10px; background:#f8fafc; padding:12px; border-radius:12px; width:260px; }
  .item { flex: 1 1 140px; border-radius:10px; background:#e0f2fe; color:#0f172a; display:flex; align-items:center; justify-content:center; font-weight:600; padding:10px; }
  .noshrink { flex-shrink:0; background:#bbf7d0; }
</style>
<div class="row">
  <div class="item">shrink</div>
  <div class="item noshrink">no-shrink</div>
  <div class="item">shrink</div>
</div>
`.trim(),
    "flex-basis": `
<style>
  .row { display:flex; gap:10px; background:#f8fafc; padding:12px; border-radius:12px; }
  .item { flex: 0 1 auto; border-radius:10px; background:#e0f2fe; color:#0f172a; display:flex; align-items:center; justify-content:center; font-weight:600; padding:10px; }
  .wide { flex-basis: 160px; }
  .narrow { flex-basis: 80px; }
</style>
<div class="row">
  <div class="item wide">160px basis</div>
  <div class="item narrow">80px basis</div>
  <div class="item">auto</div>
</div>
`.trim(),
    "margin": `
<style>
  .wrap { display:flex; gap:16px; background:#f8fafc; padding:16px; border-radius:12px; }
  .card { background:#e2e8f0; color:#0f172a; border-radius:12px; padding:12px; width:120px; text-align:center; }
  .card.a { margin: 0; }
  .card.b { margin: 20px; }
</style>
<div class="wrap">
  <div class="card a">margin: 0</div>
  <div class="card b">margin: 20px</div>
</div>
`.trim(),
    "margin-top": `
<style>
  .box { background:#e2e8f0; color:#0f172a; border-radius:12px; padding:12px; width:140px; }
  .box.mt { margin-top:24px; }
</style>
<div class="box">sin margin-top</div>
<div class="box mt">margin-top: 24px</div>
`.trim(),
    "margin-right": `
<style>
  .row { display:flex; gap:8px; align-items:center; }
  .tag { background:#e2e8f0; padding:10px 14px; border-radius:10px; color:#0f172a; }
  .tag.mr { margin-right:24px; }
</style>
<div class="row">
  <span class="tag mr">margin-right:24px</span>
  <span class="tag">siguiente</span>
</div>
`.trim(),
    "margin-bottom": `
<style>
  .col { display:grid; gap:6px; }
  .block { background:#e2e8f0; padding:10px; border-radius:10px; color:#0f172a; }
  .mb { margin-bottom:18px; }
</style>
<div class="col">
  <div class="block mb">margin-bottom: 18px</div>
  <div class="block">Elemento siguiente</div>
</div>
`.trim(),
    "margin-left": `
<style>
  .row { display:flex; gap:8px; align-items:center; }
  .tag { background:#e2e8f0; padding:10px 14px; border-radius:10px; color:#0f172a; }
  .tag.ml { margin-left:24px; }
</style>
<div class="row">
  <span class="tag">Anterior</span>
  <span class="tag ml">margin-left:24px</span>
</div>
`.trim(),
    "padding": `
<style>
  .card { background:#e2e8f0; color:#0f172a; border-radius:12px; width:160px; }
  .card.small { padding:8px; }
  .card.large { padding:24px; }
</style>
<div style="display:flex; gap:12px;">
  <div class="card small">padding: 8px</div>
  <div class="card large">padding: 24px</div>
</div>
`.trim(),
    "padding-top": `
<style>
  .box { background:#e2e8f0; border-radius:12px; color:#0f172a; padding:8px 12px; width:170px; }
  .box.pt { padding-top:28px; }
</style>
<div class="box">padding-top: 8px</div>
<div class="box pt">padding-top: 28px</div>
`.trim(),
    "padding-right": `
<style>
  .box { background:#e2e8f0; border-radius:12px; color:#0f172a; padding:12px; width:200px; }
  .box.pr { padding-right:36px; }
</style>
<div class="box">padding-right: 12px</div>
<div class="box pr">padding-right: 36px</div>
`.trim(),
    "padding-bottom": `
<style>
  .box { background:#e2e8f0; border-radius:12px; color:#0f172a; padding:12px; width:200px; }
  .box.pb { padding-bottom:32px; }
</style>
<div class="box">padding-bottom: 12px</div>
<div class="box pb">padding-bottom: 32px</div>
`.trim(),
    "padding-left": `
<style>
  .box { background:#e2e8f0; border-radius:12px; color:#0f172a; padding:12px; width:200px; }
  .box.pl { padding-left:32px; }
</style>
<div class="box">padding-left: 12px</div>
<div class="box pl">padding-left: 32px</div>
`.trim(),
    "border": `
<style>
  .stack { display:flex; gap:12px; }
  .card { padding:12px; border-radius:10px; }
  .a { border:1px solid #cbd5e1; background:#fff; }
  .b { border:2px dashed #0ea5e9; background:#e0f2fe; }
</style>
<div class="stack">
  <div class="card a">border: 1px solid</div>
  <div class="card b">border: 2px dashed</div>
</div>
`.trim(),
    "border-width": `
<style>
  .stack { display:flex; gap:12px; }
  .card { padding:12px; border-radius:10px; border-style: solid; border-color: #0ea5e9; }
  .a { border-width:1px; }
  .b { border-width:4px; }
</style>
<div class="stack">
  <div class="card a">1px</div>
  <div class="card b">4px</div>
</div>
`.trim(),
    "border-style": `
<style>
  .stack { display:flex; gap:12px; }
  .card { padding:12px; border-radius:10px; border-width: 2px; border-color: #0ea5e9; }
  .a { border-style: solid; }
  .b { border-style: dashed; }
  .c { border-style: dotted; }
</style>
<div class="stack">
  <div class="card a">solid</div>
  <div class="card b">dashed</div>
  <div class="card c">dotted</div>
</div>
`.trim(),
    "border-color": `
<style>
  .stack { display:flex; gap:12px; }
  .card { padding:12px; border-radius:10px; border-width: 2px; border-style: solid; }
  .a { border-color: #0ea5e9; }
  .b { border-color: #f97316; }
</style>
<div class="stack">
  <div class="card a">#0ea5e9</div>
  <div class="card b">#f97316</div>
</div>
`.trim(),
    "border-radius": `
<style>
  .stack { display:flex; gap:12px; }
  .card { padding:12px; background:#e0f2fe; color:#0f172a; }
  .a { border-radius: 4px; }
  .b { border-radius: 16px; }
  .c { border-radius: 999px; }
</style>
<div class="stack">
  <div class="card a">4px</div>
  <div class="card b">16px</div>
  <div class="card c">pill</div>
</div>
`.trim(),
    "border-top": `
<style>
  .card { padding:12px; border-radius:10px; background:#fff; border-top:4px solid #0ea5e9; box-shadow: 0 6px 14px rgba(15,23,42,0.12); }
</style>
<div class="card">border-top aplicado</div>
`.trim(),
    "border-right": `
<style>
  .card { padding:12px; border-radius:10px; background:#fff; border-right:4px solid #0ea5e9; box-shadow: 0 6px 14px rgba(15,23,42,0.12); }
</style>
<div class="card">border-right</div>
`.trim(),
    "border-bottom": `
<style>
  .card { padding:12px; border-radius:10px; background:#fff; border-bottom:4px solid #0ea5e9; box-shadow: 0 6px 14px rgba(15,23,42,0.12); }
</style>
<div class="card">border-bottom</div>
`.trim(),
    "border-left": `
<style>
  .card { padding:12px; border-radius:10px; background:#fff; border-left:4px solid #0ea5e9; box-shadow: 0 6px 14px rgba(15,23,42,0.12); }
</style>
<div class="card">border-left</div>
`.trim(),
    "border-image": `
<style>
  .panel { padding:12px; color:#0f172a; background:#fff; border:8px solid transparent; border-image: linear-gradient(120deg, #0ea5e9, #6366f1) 1; }
</style>
<div class="panel">border-image con gradiente</div>
`.trim(),
    "border-collapse": `
<style>
  table { width:100%; }
  .sep { border-collapse: separate; border:1px solid #cbd5e1; border-radius:8px; }
  .col { border-collapse: collapse; border:1px solid #cbd5e1; }
  td { padding:6px 8px; }
</style>
<div style="display:grid; gap:12px;">
  <table class="sep"><tr><td>separate</td><td>separate</td></tr></table>
  <table class="col"><tr><td>collapse</td><td>collapse</td></tr></table>
</div>
`.trim(),
    "box-sizing": `
<style>
  .wrap { display:flex; gap:16px; }
  .box { width:140px; height:80px; padding:20px; border:4px solid #0ea5e9; background:#e0f2fe; color:#0f172a; }
  .content { box-sizing: content-box; }
  .border { box-sizing: border-box; }
</style>
<div class="wrap">
  <div class="box content">content-box</div>
  <div class="box border">border-box</div>
</div>
`.trim(),
    "box-shadow": `
<style>
  .stack { display:flex; gap:16px; }
  .card { padding:14px; border-radius:12px; background:#fff; color:#0f172a; }
  .soft { box-shadow: 0 6px 18px rgba(15,23,42,0.18); }
  .hard { box-shadow: 0 8px 0 rgba(14,165,233,0.3); }
</style>
<div class="stack">
  <div class="card soft">sombra suave</div>
  <div class="card hard">sombra dura</div>
</div>
`.trim(),
    "outline": `
<style>
  .btn { background:#fff; border:1px solid #cbd5e1; padding:10px 16px; border-radius:10px; color:#0f172a; outline: 3px solid #0ea5e9; outline-offset: 2px; }
</style>
<button class="btn">outline visible</button>
`.trim(),
    "outline-width": `
<style>
  .stack { display:flex; gap:12px; }
  .btn { background:#fff; border:1px solid #cbd5e1; padding:10px 16px; border-radius:10px; color:#0f172a; outline-style: solid; outline-color: #0ea5e9; }
  .thin { outline-width: 2px; }
  .thick { outline-width: 6px; }
</style>
<div class="stack">
  <button class="btn thin">2px</button>
  <button class="btn thick">6px</button>
</div>
`.trim(),
    "outline-style": `
<style>
  .stack { display:flex; gap:12px; }
  .btn { background:#fff; border:1px solid #cbd5e1; padding:10px 16px; border-radius:10px; color:#0f172a; outline-width: 3px; outline-color: #0ea5e9; }
  .solid { outline-style: solid; }
  .dashed { outline-style: dashed; }
</style>
<div class="stack">
  <button class="btn solid">solid</button>
  <button class="btn dashed">dashed</button>
</div>
`.trim(),
    "outline-color": `
<style>
  .stack { display:flex; gap:12px; }
  .btn { background:#fff; border:1px solid #cbd5e1; padding:10px 16px; border-radius:10px; color:#0f172a; outline-width: 3px; outline-style: solid; }
  .a { outline-color: #0ea5e9; }
  .b { outline-color: #f97316; }
</style>
<div class="stack">
  <button class="btn a">azul</button>
  <button class="btn b">naranja</button>
</div>
`.trim(),
    "outline-offset": `
<style>
  .stack { display:flex; gap:12px; }
  .btn { background:#fff; border:1px solid #cbd5e1; padding:10px 16px; border-radius:10px; color:#0f172a; outline: 3px solid #0ea5e9; }
  .a { outline-offset: 2px; }
  .b { outline-offset: 8px; }
</style>
<div class="stack">
  <button class="btn a">offset 2px</button>
  <button class="btn b">offset 8px</button>
</div>
`.trim(),
    "display-grid": `
<style>
  .grid { display:grid; grid-template-columns: repeat(3, minmax(120px, 1fr)); gap: 12px; background:#0b1727; padding:14px; border-radius:14px; color:#e2e8f0; }
  .cell { border-radius:12px; padding:12px; font-weight:700; text-align:center; background: linear-gradient(135deg,#0ea5e9,#38bdf8); box-shadow:0 10px 20px rgba(14,165,233,0.18); }
  .legend { display:grid; gap:6px; margin-top:10px; color:#0f172a; }
  .legend span { background:#e2e8f0; padding:6px 8px; border-radius:8px; font-size:12px; font-weight:600; display:inline-block; }
</style>
<div class="grid">
  <div class="cell">1</div><div class="cell">2</div><div class="cell">3</div>
  <div class="cell">4</div><div class="cell">5</div><div class="cell">6</div>
</div>
<div class="legend">
  <span>display: grid</span>
  <span>grid-template-columns: repeat(3, minmax(120px, 1fr))</span>
  <span>gap: 12px</span>
</div>
`.trim(),
    "display": `
<style>
  .stack { display:flex; gap:12px; align-items:flex-start; background:#0b1727; padding:12px; border-radius:12px; }
  .box { padding:10px 12px; border-radius:10px; color:#0f172a; font-weight:700; }
  .block { display:block; background:#ffd8a8; width:160px; border:2px solid #f76707; border-radius:6px; }
  .inline { display:inline; background:#fde68a; border:2px solid #f76707; border-radius:6px; }
  .inline-block { display:inline-block; background:#bbf7d0; padding:12px; border:2px solid #22c55e; border-radius:6px; }
</style>
<div class="stack">
  <div class="box block">display: block</div>
  <span class="box inline">display: inline</span>
  <div class="box inline-block">inline-block</div>
</div>
`.trim(),
    "visibility": `
<style>
  .stack { display:flex; gap:12px; }
  .box { padding:10px 12px; border-radius:10px; color:#0f172a; background:#e2e8f0; }
  .hidden { visibility:hidden; }
</style>
<div class="stack">
  <div class="box">visible</div>
  <div class="box hidden">hidden</div>
</div>
`.trim(),
    "opacity": `
<style>
  .stack { display:flex; gap:12px; }
  .box { padding:12px; border-radius:12px; background:#0ea5e9; color:#fff; font-weight:700; }
  .low { opacity:0.4; }
</style>
<div class="stack">
  <div class="box">opacity:1</div>
  <div class="box low">opacity:0.4</div>
</div>
`.trim(),
    "position": `
<style>
  .stage { position: relative; height: 140px; background:#f8fafc; border-radius:12px; overflow:hidden; }
  .abs { position:absolute; top:12px; right:12px; padding:10px 14px; background:#0ea5e9; color:#fff; border-radius:10px; }
  .rel { position:relative; top:18px; left:12px; padding:10px 14px; background:#e2e8f0; color:#0f172a; border-radius:10px; }
</style>
<div class="stage">
  <div class="rel">relative + offsets</div>
  <div class="abs">absolute (top/right)</div>
</div>
`.trim(),
    "top": `
<style>
  .stage { position: relative; height: 120px; background:#f8fafc; border-radius:12px; }
  .box { position:absolute; left:12px; padding:10px 14px; background:#0ea5e9; color:#fff; border-radius:10px; }
  .a { top: 8px; }
  .b { top: 56px; }
</style>
<div class="stage">
  <div class="box a">top:8px</div>
  <div class="box b">top:56px</div>
</div>
`.trim(),
    "right": `
<style>
  .stage { position: relative; height: 120px; background:#f8fafc; border-radius:12px; }
  .box { position:absolute; top:12px; padding:10px 14px; background:#0ea5e9; color:#fff; border-radius:10px; }
  .a { right: 12px; }
  .b { right: 64px; top:54px; }
</style>
<div class="stage">
  <div class="box a">right:12px</div>
  <div class="box b">right:64px</div>
</div>
`.trim(),
    "bottom": `
<style>
  .stage { position: relative; height: 140px; background:#f8fafc; border-radius:12px; }
  .box { position:absolute; padding:10px 14px; background:#0ea5e9; color:#fff; border-radius:10px; }
  .a { bottom: 12px; left: 12px; }
  .b { bottom: 48px; right: 12px; }
</style>
<div class="stage">
  <div class="box a">bottom:12px</div>
  <div class="box b">bottom:48px</div>
</div>
`.trim(),
    "left": `
<style>
  .stage { position: relative; height: 120px; background:#f8fafc; border-radius:12px; }
  .box { position:absolute; top:12px; padding:10px 14px; background:#0ea5e9; color:#fff; border-radius:10px; }
  .a { left: 12px; }
  .b { left: 64px; top:54px; }
</style>
<div class="stage">
  <div class="box a">left:12px</div>
  <div class="box b">left:64px</div>
</div>
`.trim(),
    "z-index": `
<style>
  .stage { position: relative; height: 140px; background:#f8fafc; border-radius:12px; }
  .card { position:absolute; width:160px; height:90px; border-radius:12px; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; }
  .low { background:#38bdf8; z-index:1; top:32px; left:32px; }
  .high { background:#6366f1; z-index:5; top:54px; left:64px; box-shadow: 0 12px 28px rgba(99,102,241,0.35); }
</style>
<div class="stage">
  <div class="card low">z-index:1</div>
  <div class="card high">z-index:5</div>
</div>
`.trim(),
    "float": `
<style>
  .wrap { background:#f8fafc; padding:12px; border-radius:12px; overflow:auto; }
  img { float:left; width:80px; height:80px; border-radius:10px; margin-right:12px; }
</style>
<div class="wrap">
  <img src="https://via.placeholder.com/80" alt="float" />
  <p style="color:#334155;">float: left; el texto fluye alrededor de la imagen.</p>
</div>
`.trim(),
    "clear": `
<style>
  .wrap { background:#f8fafc; padding:12px; border-radius:12px; overflow:auto; }
  .badge { float:left; padding:8px 12px; background:#e0f2fe; border-radius:10px; margin-right:12px; }
  .clear { clear: both; margin-top:12px; color:#0f172a; }
</style>
<div class="wrap">
  <span class="badge">float</span>
  <span class="badge">float</span>
  <div class="clear">clear: both evita superposición</div>
</div>
`.trim(),
    "overflow": `
<style>
  .stack { display:flex; gap:12px; }
  .box { width:160px; height:100px; background:#e2e8f0; color:#0f172a; border-radius:10px; padding:8px; }
  .auto { overflow:auto; }
  .hidden { overflow:hidden; }
</style>
<div class="stack">
  <div class="box auto">overflow:auto<br/>texto largo que desborda</div>
  <div class="box hidden">overflow:hidden<br/>texto largo que desborda</div>
</div>
`.trim(),
    "overflow-x": `
<style>
  .box { width:180px; height:80px; background:#e2e8f0; color:#0f172a; border-radius:10px; padding:8px; overflow-x: auto; white-space: nowrap; }
</style>
<div class="box">overflow-x:auto → texto_largo_sin_cortes_para_scrolling_horizontal</div>
`.trim(),
    "overflow-y": `
<style>
  .box { width:160px; height:60px; background:#e2e8f0; color:#0f172a; border-radius:10px; padding:8px; overflow-y: auto; }
</style>
<div class="box">overflow-y:auto con varias líneas<br/>línea 2<br/>línea 3<br/>línea 4</div>
`.trim(),
    "object-fit": `
<style>
  .stack { display:flex; gap:12px; }
  .frame { width:140px; height:100px; border-radius:12px; overflow:hidden; border:2px solid #e2e8f0; }
  .cover { object-fit: cover; }
  .contain { object-fit: contain; background:#e2e8f0; }
</style>
<div class="stack">
  <div class="frame"><img class="cover" src="https://via.placeholder.com/200x120" alt="" /></div>
  <div class="frame"><img class="contain" src="https://via.placeholder.com/200x120" alt="" /></div>
</div>
`.trim(),
    "object-position": `
<style>
  .frame { width:140px; height:100px; border-radius:12px; overflow:hidden; border:2px solid #e2e8f0; position:relative; }
  img { width:100%; height:100%; object-fit: cover; }
  .top-left { object-position: top left; }
  .center { object-position: center; }
</style>
<div style="display:flex; gap:12px;">
  <div class="frame"><img class="top-left" src="https://via.placeholder.com/200x120" alt="" /></div>
  <div class="frame"><img class="center" src="https://via.placeholder.com/200x120" alt="" /></div>
</div>
`.trim(),
    "isolation": `
<style>
  .stage { position: relative; width: 220px; height: 140px; border-radius:12px; background: linear-gradient(135deg,#e0f2fe,#e2e8f0); overflow:hidden; }
  .isolated { isolation: isolate; position: relative; width:100%; height:100%; }
  .shape { position:absolute; width:100px; height:100px; border-radius:50%; background:rgba(99,102,241,0.6); mix-blend-mode: multiply; top:20px; left:40px; }
  .shape.alt { left:100px; background:rgba(14,165,233,0.6); }
</style>
<div class="stage">
  <div class="isolated">
    <div class="shape"></div>
    <div class="shape alt"></div>
  </div>
</div>
`.trim(),
  };

  return demos[name] ?? null;
}

function ensureUniqueSlugs(terms: SeedTerm[]) {
  const used = new Map<string, number>();
  return terms.map(term => {
    let slug = term.slug ?? toSlug(term.term);
    const count = used.get(slug) ?? 0;
    if (count > 0) {
      slug = `${slug}-${shortHash(`${term.term}-${count}`)}`;
    }
    used.set(slug, count + 1);
    return { ...term, slug };
  });
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
  await ensureSearchIndex();

  const normalizedTerms = dictionary
    .map(term => normalizeSelectorNames(term))
    .map(term => ensureContentDepth({
      ...term,
      slug: term.slug ?? toSlug(term.term),
      aliases: term.aliases ?? [],
      tags: term.tags ?? [],
    }))
    .map(term => condenseExamples(term))
    .map(term => ensureVariantPreview(term));

  const preparedTerms = ensureUniqueSlugs(normalizedTerms).map(term => ({
    ...term,
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

  const contributor = await prisma.contributorProfile.upsert({
    where: { userId: admin.id },
    update: {
      displayName: admin.username,
      preferredLanguages: [Language.js, Language.ts, Language.css],
    },
    create: {
      userId: admin.id,
      displayName: admin.username,
      preferredLanguages: [Language.js, Language.ts, Language.css],
    },
  });

  const createdTerms: Prisma.TermGetPayload<{ include: { variants: true; useCases: true; faqs: true; exercises: true } }>[] = [];
  for (const term of preparedTerms) {
    const reviewMeta = { reviewedAt: new Date() };
    const baseData = {
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
    };

    const mappedUseCases =
      term.useCases?.map(useCase => ({
        context: useCase.context,
        summary: [useCase.summaryEs, useCase.summaryEn].filter(Boolean).join(" | "),
        steps: useCase.stepsEs.map((es, index) => ({
          es,
          en: useCase.stepsEn[index] ?? useCase.stepsEn[useCase.stepsEn.length - 1] ?? es,
        })),
        tips: [useCase.tipsEs, useCase.tipsEn].filter(Boolean).join(" | ") || undefined,
        status: ReviewStatus.approved,
        ...reviewMeta,
      })) ?? [];

    const createData: Prisma.TermCreateInput = {
      ...baseData,
      createdBy: { connect: { id: admin.id } },
      updatedBy: { connect: { id: admin.id } },
      variants: term.variants?.length
        ? {
          create: term.variants.map(variant => ({
            language: variant.language,
            snippet: variant.code,
            notes: variant.notes,
            level: variant.level ?? SkillLevel.intermediate,
            status: ReviewStatus.approved,
            reviewedAt: new Date(),
          })),
        }
        : undefined,
      useCases: mappedUseCases.length ? { create: mappedUseCases } : undefined,
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
    };

    const updateData: Prisma.TermUpdateInput = {
      ...baseData,
      updatedBy: { connect: { id: admin.id } },
      variants: term.variants?.length
        ? {
          deleteMany: {},
          create: term.variants.map(variant => ({
            language: variant.language,
            snippet: variant.code,
            notes: variant.notes,
            level: variant.level ?? SkillLevel.intermediate,
            status: ReviewStatus.approved,
            reviewedAt: new Date(),
          })),
        }
        : { deleteMany: {} },
      useCases: mappedUseCases.length ? { deleteMany: {}, create: mappedUseCases } : { deleteMany: {} },
      faqs: term.faqs?.length
        ? {
          deleteMany: {},
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
        : { deleteMany: {} },
      exercises: term.exercises?.length
        ? {
          deleteMany: {},
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
        : { deleteMany: {} },
    };

    let created;
    try {
      created = await prisma.term.upsert({
        where: { term: term.term },
        update: updateData,
        create: createData,
        include: { variants: true, useCases: true, faqs: true, exercises: true },
      });
    } catch (error) {
      if ((error as any)?.code === "P2002") {
        const existing = await prisma.term.findUnique({ where: { term: term.term } });
        if (existing) {
          logger.warn({ term: term.term }, "seed.term_duplicate_updated");
          // We need to fetch the full object to match the type of 'created'
          created = await prisma.term.findUniqueOrThrow({
             where: { id: existing.id },
             include: { variants: true, useCases: true, faqs: true, exercises: true }
          });
        } else {
          logger.warn({ term: term.term, slug: term.slug }, "seed.term_slug_conflict_skipped");
          continue;
        }
      } else {
        throw error;
      }
    }
    createdTerms.push(created);

    try {
      await prisma.termStats.upsert({
        where: { termId: created.id },
        update: {},
        create: {
          termId: created.id,
          contextHits: { dictionary: 0 },
          languageHits: { es: 0 },
        },
      });
    } catch (error) {
      logger.warn({ err: error, term: created.term }, "seed.term_stats_failed");
    }

    // Saltamos registros de contribución para no bloquear el seed por FK en entornos compartidos
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

async function ensureSearchIndex() {
  try {
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Term_search_trgm_idx"
      ON "Term" USING gin ( (${SEARCH_EXPR}) gin_trgm_ops )
    `);
  } catch (error) {
    logger.warn({ err: error }, "seed.search_index_failed");
  }
}

async function resetSequences(tableNames: string[]) {
  if (!tableNames.length) return;
  for (const table of tableNames) {
    const name = table.replace(/"/g, '""');
    try {
      await prisma.$executeRawUnsafe(`
        SELECT setval(
          pg_get_serial_sequence('\"${name}\"', 'id'),
          COALESCE((SELECT MAX(id) + 1 FROM \"${name}\"), 1),
          false
        );
      `);
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
