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
import type { SeedTerm, ExampleSnippet, VariantSeed, UseCaseSeed, FaqSeed, ExerciseSeed } from "./dictionary-types";
import { cssTerms } from "./data/cssTerms";

const prisma = new PrismaClient();

type RawTerm = {
  term: string;
  translation: string;
  explanation: string;
  category: Category;
  aliases?: string[];
};

const rawTerms: RawTerm[] = [
  { term: "abstract", translation: "abstracto", explanation: "concepto general, no concreto", category: Category.general },
  { term: "API", translation: "interfaz para comunicar sistemas", explanation: "interfaz para comunicar sistemas", category: Category.backend, aliases: ["application programming interface"] },
  { term: "array", translation: "lista de datos", explanation: "lista de datos", category: Category.general },
  { term: "arrow function", translation: "función con ⇒", explanation: "función con ⇒", category: Category.frontend, aliases: ["arrow"] },
  { term: "async", translation: "función que espera procesos", explanation: "función que espera procesos", category: Category.general },
  { term: "await", translation: "esperar una operación", explanation: "esperar una operación", category: Category.general },
  { term: "backend", translation: "lógica del servidor", explanation: "lógica del servidor", category: Category.backend },
  { term: "boolean", translation: "verdadero o falso", explanation: "valor verdadero o falso", category: Category.general },
  { term: "bug", translation: "error en el código", explanation: "error en el código", category: Category.general },
  { term: "build", translation: "versión final del proyecto", explanation: "construcción final lista para entregar", category: Category.devops },
  { term: "bundle", translation: "archivo empacado", explanation: "archivo empacado con dependencias", category: Category.devops },
  { term: "callback", translation: "función que se ejecuta después", explanation: "función que se ejecuta después", category: Category.general },
  { term: "class", translation: "plantilla para crear objetos", explanation: "plantilla para crear objetos", category: Category.general },
  { term: "client", translation: "navegador o aplicación", explanation: "navegador o aplicación que consume tu API", category: Category.frontend },
  { term: "clone", translation: "copiar un proyecto", explanation: "copiar un proyecto", category: Category.devops },
  { term: "component", translation: "bloque reutilizable de UI", explanation: "bloque reutilizable de interface", category: Category.frontend },
  { term: "console", translation: "terminal o mensajes de depuración", explanation: "terminal o mensajes de depuración", category: Category.frontend },
  { term: "const", translation: "variable que no cambia", explanation: "variable que no cambia su referencia", category: Category.general },
  { term: "constructor", translation: "función que crea objetos en clases", explanation: "inicializador dentro de una clase", category: Category.general },
  { term: "CSS", translation: "estilos", explanation: "estilos para la web", category: Category.frontend },
  { term: "current", translation: "actual", explanation: "valor actual", category: Category.general },
  { term: "custom", translation: "personalizado", explanation: "hecho a medida", category: Category.general },
  { term: "data", translation: "datos", explanation: "datos en general", category: Category.general },
  { term: "database", translation: "base de datos", explanation: "sistema que almacena datos", category: Category.database },
  { term: "debug", translation: "encontrar y corregir errores", explanation: "proceso para encontrar y corregir errores", category: Category.general },
  { term: "default", translation: "por defecto", explanation: "valor inicial usado automáticamente", category: Category.general },
  { term: "deploy", translation: "publicar tu proyecto", explanation: "publicar tu proyecto", category: Category.devops },
  { term: "deprecation", translation: "algo que ya no se recomienda usar", explanation: "característica marcada para retiro", category: Category.general },
  { term: "design", translation: "diseño", explanation: "diseño visual o UX", category: Category.frontend },
  { term: "directory", translation: "carpeta", explanation: "carpeta del proyecto", category: Category.general },
  { term: "DOM", translation: "estructura del HTML", explanation: "estructura del HTML", category: Category.frontend, aliases: ["document object model"] },
  { term: "element", translation: "parte del DOM", explanation: "nodo específico del DOM", category: Category.frontend },
  { term: "error", translation: "fallo", explanation: "fallo dentro del código o ejecución", category: Category.general },
  { term: "event", translation: "acción de usuario", explanation: "acción (click, input, etc.)", category: Category.frontend },
  { term: "export", translation: "enviar código para usarlo en otro archivo", explanation: "exponer código a otros módulos", category: Category.frontend },
  { term: "fetch", translation: "traer datos del servidor", explanation: "traer datos del servidor", category: Category.frontend },
  { term: "field", translation: "campo", explanation: "campo individual dentro de un registro", category: Category.database },
  { term: "file", translation: "archivo", explanation: "archivo físico o lógico", category: Category.general },
  { term: "filter", translation: "filtrar valores", explanation: "filtrar valores dentro de una colección", category: Category.frontend },
  { term: "flex", translation: "diseño flexible en CSS", explanation: "diseño flexible en CSS", category: Category.frontend, aliases: ["flexbox"] },
  { term: "frontend", translation: "lo que ve el usuario", explanation: "capa visible para el usuario", category: Category.frontend },
  { term: "function", translation: "bloque de código reutilizable", explanation: "bloque reutilizable que recibe parámetros", category: Category.general },
  { term: "Git", translation: "sistema para guardar versiones", explanation: "sistema distribuido de control de versiones", category: Category.devops },
  { term: "GitHub", translation: "plataforma para proyectos con Git", explanation: "plataforma para repositorios Git", category: Category.devops },
  { term: "global", translation: "disponible en todo el proyecto", explanation: "alcance global dentro del código", category: Category.general },
  { term: "handler", translation: "función que maneja un evento", explanation: "función que maneja un evento", category: Category.frontend },
  { term: "hover", translation: "pasar el mouse por encima", explanation: "estado hover en UI", category: Category.frontend },
  { term: "HTML", translation: "estructura del sitio", explanation: "lenguaje de marcado base", category: Category.frontend },
  { term: "HTTP request", translation: "solicitud al servidor", explanation: "solicitud al servidor", category: Category.backend },
  { term: "HTTP response", translation: "respuesta del servidor", explanation: "respuesta del servidor", category: Category.backend },
  { term: "if", translation: "condición", explanation: "condicional que evalúa expresiones", category: Category.general },
  { term: "import", translation: "traer funciones o código", explanation: "traer código de otro módulo", category: Category.frontend },
  { term: "index", translation: "archivo principal", explanation: "archivo principal o raíz", category: Category.frontend },
  { term: "input", translation: "entrada del usuario", explanation: "dato introducido por el usuario", category: Category.frontend },
  { term: "instance", translation: "objeto creado desde una clase", explanation: "instancia de una clase", category: Category.general },
  { term: "iterator", translation: "recorrer elementos", explanation: "mecanismo para recorrer elementos", category: Category.general },
  { term: "JSON", translation: "formato de datos", explanation: "formato de datos basado en texto", category: Category.backend },
  { term: "JSX", translation: "HTML dentro de JavaScript (React)", explanation: "sintaxis de React que mezcla JS y HTML", category: Category.frontend },
  { term: "key", translation: "clave", explanation: "clave única", category: Category.general },
  { term: "keyword", translation: "palabra reservada", explanation: "palabra reservada del lenguaje", category: Category.general },
  { term: "layout", translation: "organización de la página", explanation: "organización visual de la página", category: Category.frontend },
  { term: "library", translation: "librería", explanation: "colección de código prehecho", category: Category.general },
  { term: "listener", translation: "escucha de eventos", explanation: "suscriptor de eventos", category: Category.frontend },
  { term: "link", translation: "enlace", explanation: "enlace a otra ruta o recurso", category: Category.frontend },
  { term: "list", translation: "lista", explanation: "colección ordenada", category: Category.general },
  { term: "local", translation: "dentro de un bloque o función", explanation: "alcance limitado", category: Category.general },
  { term: "login", translation: "iniciar sesión", explanation: "proceso de autenticación", category: Category.backend },
  { term: "logout", translation: "cerrar sesión", explanation: "cerrar sesión", category: Category.backend },
  { term: "loop", translation: "ciclo", explanation: "ciclo repetitivo", category: Category.general },
  { term: "map", translation: "recorrer y transformar una lista", explanation: "recorrer y transformar una lista", category: Category.general },
  { term: "method", translation: "función dentro de una clase", explanation: "función declarada en una clase", category: Category.general },
  { term: "module", translation: "archivo que exporta código", explanation: "archivo que exporta código", category: Category.general },
  { term: "navigate", translation: "navegar entre páginas", explanation: "moverse entre rutas", category: Category.frontend },
  { term: "node", translation: "elemento del DOM", explanation: "nodo del DOM", category: Category.frontend },
  { term: "npm", translation: "gestor de paquetes de JS", explanation: "gestor de paquetes de JavaScript", category: Category.devops },
  { term: "object", translation: "estructura con clave:valor", explanation: "estructura con clave:valor", category: Category.general },
  { term: "optional", translation: "opcional", explanation: "valor opcional", category: Category.general },
  { term: "output", translation: "salida", explanation: "resultado o salida de un proceso", category: Category.general },
  { term: "override", translation: "sobrescribir", explanation: "sobrescribir comportamiento existente", category: Category.general },
  { term: "package", translation: "conjunto de archivos o librerías", explanation: "conjunto de archivos o librerías", category: Category.devops },
  { term: "param", translation: "parámetro", explanation: "parámetro de función", category: Category.general },
  { term: "parent", translation: "elemento padre", explanation: "elemento padre en DOM o árbol", category: Category.frontend },
  { term: "parse", translation: "convertir un dato", explanation: "convertir un dato de un formato a otro", category: Category.general },
  { term: "path", translation: "ruta", explanation: "ruta de archivos o URLs", category: Category.general },
  { term: "perform", translation: "ejecutar", explanation: "realizar una operación", category: Category.general },
  { term: "props", translation: "datos que recibe un componente", explanation: "datos que recibe un componente", category: Category.frontend },
  { term: "push", translation: "enviar cambios (Git)", explanation: "enviar cambios (Git)", category: Category.devops },
  { term: "query", translation: "consulta", explanation: "consulta a datos o APIs", category: Category.database },
  { term: "React", translation: "librería para interfaces", explanation: "librería para interfaces", category: Category.frontend },
  { term: "ref", translation: "referencia a un elemento", explanation: "referencia a un elemento/valor mutable", category: Category.frontend },
  { term: "render", translation: "mostrar en pantalla", explanation: "mostrar en pantalla", category: Category.frontend },
  { term: "repository", translation: "repositorio", explanation: "repositorio de código", category: Category.devops },
  { term: "request", translation: "solicitud", explanation: "solicitud HTTP o RPC", category: Category.backend },
  { term: "response", translation: "respuesta", explanation: "respuesta HTTP o RPC", category: Category.backend },
  { term: "return", translation: "devolver un valor", explanation: "devolver un valor", category: Category.general },
  { term: "route", translation: "ruta o sección de una web", explanation: "definición de ruta", category: Category.frontend },
  { term: "runtime", translation: "mientras se ejecuta", explanation: "contexto de ejecución", category: Category.general },
  { term: "scope", translation: "alcance de una variable", explanation: "alcance de una variable", category: Category.general },
  { term: "server", translation: "servidor", explanation: "servidor que atiende peticiones", category: Category.backend },
  { term: "service", translation: "servicio", explanation: "servicio reutilizable del backend", category: Category.backend },
  { term: "session", translation: "sesión", explanation: "estado asociado a un usuario autenticado", category: Category.backend },
  { term: "shadow DOM", translation: "DOM encapsulado", explanation: "DOM encapsulado", category: Category.frontend },
  { term: "state", translation: "estado de un componente (React)", explanation: "estado de un componente (React)", category: Category.frontend },
  { term: "string", translation: "texto", explanation: "tipo de dato textual", category: Category.general },
  { term: "submit", translation: "enviar formulario", explanation: "enviar formulario", category: Category.frontend },
  { term: "sync", translation: "sincronizar", explanation: "mantener datos sincronizados", category: Category.backend },
  { term: "testing", translation: "pruebas", explanation: "pruebas automatizadas", category: Category.devops },
  { term: "token", translation: "clave de autenticación", explanation: "clave de autenticación", category: Category.backend },
  { term: "try/catch", translation: "intentar / capturar error", explanation: "mecanismo para manejar errores", category: Category.general },
  { term: "UI", translation: "interfaz de usuario", explanation: "interfaz de usuario", category: Category.frontend },
  { term: "update", translation: "actualizar", explanation: "actualizar datos o UI", category: Category.general },
  { term: "URL", translation: "dirección web", explanation: "dirección web única", category: Category.general },
  { term: "useEffect", translation: "efecto secundario (React)", explanation: "efecto secundario (React)", category: Category.frontend },
  { term: "useState", translation: "manejar estado (React)", explanation: "hook para manejar estado (React)", category: Category.frontend },
  { term: "user", translation: "usuario", explanation: "usuario final de la plataforma", category: Category.backend },
  { term: "utility", translation: "función de utilidad", explanation: "función de utilidad general", category: Category.general },
  { term: "variable", translation: "dato que cambia", explanation: "dato que cambia", category: Category.general },
  { term: "version", translation: "versión de un software", explanation: "release o versión del software", category: Category.devops },
  { term: "viewport", translation: "área visible de la pantalla", explanation: "área visible de la pantalla", category: Category.frontend },
  { term: "virtual DOM", translation: "DOM virtual usado por React", explanation: "DOM virtual usado por React", category: Category.frontend },
  { term: "visual", translation: "visual o gráfico", explanation: "aspecto visual", category: Category.frontend },
  { term: "warning", translation: "advertencia", explanation: "advertencia", category: Category.general },
  { term: "webpack", translation: "empacador de JavaScript", explanation: "empacador de JavaScript", category: Category.devops },
  { term: "wrapper", translation: "contenedor", explanation: "contenedor que envuelve otro elemento", category: Category.frontend },
  { term: "REST", translation: "transferencia de estado representacional", explanation: "estilo de arquitectura para APIs", category: Category.backend },
  { term: "JOIN", translation: "unión", explanation: "operación SQL para unir tablas", category: Category.database },
  { term: "Docker", translation: "contenedor", explanation: "plataforma de contenedores para empaquetar apps", category: Category.devops },
  { term: "JWT", translation: "token web JSON", explanation: "token firmado para autenticación sin estado", category: Category.backend },
  { term: "CORS", translation: "uso compartido de recursos de origen cruzado", explanation: "política de seguridad de navegadores", category: Category.backend },
  { term: "Promise", translation: "promesa", explanation: "objeto que representa una operación asíncrona", category: Category.general },
];

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

const exampleByCategory: Record<Category, (term: string, explanation: string) => ExampleSnippet> = {
  frontend: (term, explanation) => ({
    titleEs: `Componente ${term}`,
    titleEn: `${term} component`,
    code: `const Demo${toPascal(term)} = () => (\n  <section className="card">\n    <strong>${term}</strong>\n    <p>${explanation}</p>\n  </section>\n);\nexport default Demo${toPascal(term)};`,
    noteEs: "Se aplica dentro de la interfaz usando React.",
    noteEn: "Use it inside your React UI.",
  }),
  backend: (term, explanation) => ({
    titleEs: `Endpoint ${term}`,
    titleEn: `${term} endpoint`,
    code: `app.get("/api/${toSlug(term)}", (req, res) => {\n  res.json({ term: "${term}", detail: "${explanation}" });\n});`,
    noteEs: "Se integra en tus controladores o rutas.",
    noteEn: "Add it to your controllers or routes.",
  }),
  database: (term, explanation) => ({
    titleEs: `Consulta ${term}`,
    titleEn: `${term} query`,
    code: `await prisma.term.findMany({\n  where: { term: "${term}" },\n  select: { term: true, translation: true }\n});`,
    noteEs: "Consulta el concepto dentro de Prisma/SQL.",
    noteEn: "Query the concept in Prisma/SQL.",
  }),
  devops: (term, explanation) => ({
    titleEs: `CLI ${term}`,
    titleEn: `${term} CLI`,
    code: `#!/bin/bash\n# ${term}: ${explanation}\necho "${term} listo para el pipeline"\n`,
    noteEs: "Úsalo en scripts o pipelines de automatización.",
    noteEn: "Use it in scripts or automation pipelines.",
  }),
  general: (term, explanation) => ({
    titleEs: `Utilidad ${term}`,
    titleEn: `${term} helper`,
    code: `function explain${toPascal(term)}(){\n  return "${term}: ${explanation}";\n}\nconsole.log(explain${toPascal(term)}());`,
    noteEs: "Sirve como helper educativo en cualquier capa.",
    noteEn: "Works as an educational helper anywhere.",
  }),
};

const generatedTerms: SeedTerm[] = rawTerms.map(item => {
  const example = exampleByCategory[item.category](item.term, item.explanation);
  return createSeedTerm({
    term: item.term,
    translation: item.translation,
    category: item.category,
    descriptionEs: item.explanation,
    descriptionEn: buildMeaningEn(item.term, item.translation),
    aliases: item.aliases ?? [],
    example,
  });
});

const cssSeedTerms: SeedTerm[] = cssTerms.map(item => {
  const example: ExampleSnippet = {
    titleEs: item.example.title,
    titleEn: `${item.example.title} snippet`,
    code: item.example.code,
    noteEs: item.example.note,
    noteEn: item.example.note,
  };
  return createSeedTerm({
    term: item.term,
    translation: item.translation,
    category: Category.frontend,
    descriptionEs: item.description,
    descriptionEn: `In CSS, "${item.term}" helps you control layout and presentation.`,
    aliases: item.aliases ?? [],
    example,
    whatEs: item.what ?? `Lo empleamos para ${item.description} dentro de interfaces frontend.`,
    whatEn: item.what ? `We use it to ${item.description}.` : `We use it to keep the UI consistent.`,
    howEs:
      item.how ??
      `Declara "${item.term}" en tus estilos o utilidades para ${item.description} y prueba el resultado en distintos breakpoints.`,
    howEn: item.how ? `Declare "${item.term}" to ${item.description}.` : `Declare "${item.term}" and test it across breakpoints.`,
    languageOverride: Language.css,
  });
});

const dictionary: SeedTerm[] = dedupeTerms([...generatedTerms, ...cssSeedTerms]);

type SeedTermInput = {
  term: string;
  translation: string;
  category: Category;
  descriptionEs: string;
  descriptionEn?: string;
  aliases?: string[];
  tags?: string[];
  example: ExampleSnippet;
  whatEs?: string;
  whatEn?: string;
  howEs?: string;
  howEn?: string;
  languageOverride?: Language;
};

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
    examples: [example],
    variants: buildVariants(variantLanguage, example.code, example.noteEs ?? example.noteEn),
    useCases: buildUseCases(term, category, resolvedWhatEs, resolvedWhatEn),
    faqs: buildFaqs(term, translation, meaningEs, meaningEn, example, resolvedHowEs, resolvedHowEn),
    exercises: buildExercises(term, variantLanguage, example.code, resolvedHowEs, resolvedHowEn),
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
): FaqSeed[] {
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
  const names = tableNames.map(name => `'${name}'`).join(", ");
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence WHERE name IN (${names});`);
  } catch (error) {
    logger.warn({ err: error, tables: tableNames }, "seed.reset_sequences_failed");
  }
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
