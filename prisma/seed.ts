import { PrismaClient, Category } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getMetricsSnapshot, incrementMetric, logger } from "@/lib/logger";
import type { SeedTerm, ExampleSnippet } from "./dictionary-types";
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

const categoryContext: Record<Category, string> = {
  frontend: "la capa visual y de interacción",
  backend: "las APIs, servicios y lógica de negocio",
  database: "el modelado y las consultas de datos",
  devops: "los pipelines, CLI y despliegues",
  general: "todo el stack",
};

const howByCategory: Record<Category, (term: string) => string> = {
  frontend: term => `Implementa "${term}" dentro de tus componentes React/Next para mantener una UI coherente y accesible.`,
  backend: term => `Incluye "${term}" en tus controladores o servicios Node/Nest garantizando reglas de negocio claras.`,
  database: term => `Modela "${term}" en tus esquemas SQL/Prisma y valida los datos antes de almacenarlos.`,
  devops: term => `Automatiza "${term}" con scripts, contenedores y pipelines de CI/CD para despliegues repetibles.`,
  general: term => `Documenta y reutiliza "${term}" como parte de tus utilidades para que todo el equipo comparta el mismo lenguaje.`,
};

const exampleByCategory: Record<Category, (term: string, explanation: string) => ExampleSnippet> = {
  frontend: (term, explanation) => ({
    title: `Componente ${term}`,
    code: `const Demo${toPascal(term)} = () => (\n  <section className="card">\n    <strong>${term}</strong>\n    <p>${explanation}</p>\n  </section>\n);\nexport default Demo${toPascal(term)};`,
    note: "Se aplica dentro de la interfaz usando React.",
  }),
  backend: (term, explanation) => ({
    title: `Endpoint ${term}`,
    code: `app.get("/api/${toSlug(term)}", (req, res) => {\n  res.json({ term: "${term}", detail: "${explanation}" });\n});`,
    note: "Se integra en tus controladores o rutas.",
  }),
  database: (term, explanation) => ({
    title: `Consulta ${term}`,
    code: `await prisma.term.findMany({\n  where: { term: "${term}" },\n  select: { term: true, translation: true }\n});`,
    note: "Consulta el concepto dentro de Prisma/SQL.",
  }),
  devops: (term, explanation) => ({
    title: `CLI ${term}`,
    code: `#!/bin/bash\n# ${term}: ${explanation}\necho "${term} listo para el pipeline"\n`,
    note: "Úsalo en scripts o pipelines de automatización.",
  }),
  general: (term, explanation) => ({
    title: `Utilidad ${term}`,
    code: `function explain${toPascal(term)}(){\n  return "${term}: ${explanation}";\n}\nconsole.log(explain${toPascal(term)}());`,
    note: "Sirve como helper educativo en cualquier capa.",
  }),
};

const generatedTerms: SeedTerm[] = rawTerms.map(item => {
  const example = exampleByCategory[item.category](item.term, item.explanation);
  return {
    term: item.term,
    translation: item.translation,
    aliases: item.aliases ?? [],
    category: item.category,
    meaning: `En programación "${item.term}" se refiere a ${item.explanation}.`,
    what: `Lo empleamos para ${item.explanation} dentro de ${categoryContext[item.category]}.`,
    how: howByCategory[item.category](item.term),
    examples: [example],
  };
});

const dictionary: SeedTerm[] = dedupeTerms([...generatedTerms, ...cssTerms]);

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
    aliases: term.aliases ?? [],
    tags: buildTags(term),
  }));

  // elimina historiales solo si el modelo existe en el cliente Prisma
  const deletedHistory = await (prisma as any).termHistory?.deleteMany?.({});
  if (deletedHistory?.count) {
    incrementMetric("seed.term_history.deleted", deletedHistory.count);
  }
  const deletedTerms = await prisma.term.deleteMany({});
  incrementMetric("seed.terms.deleted", deletedTerms.count);
  // si no existe TermHistory en el esquema, no lo incluimos aquí
  await resetSequences(["Term"]);

  const createdTerms: Awaited<ReturnType<typeof prisma.term.create>>[] = [];
  for (const term of preparedTerms) {
    const created = await prisma.term.create({ data: term });
    createdTerms.push(created);
  }

  if (createdTerms.length) {
    // crea eventos de historial solo si el cliente Prisma expone el modelo
    if ((prisma as any).termHistory?.createMany) {
      await (prisma as any).termHistory.createMany({
        data: createdTerms.map(created => ({
          termId: created.id,
          snapshot: snapshotTerm(created),
          action: "seed" as any,
        })),
      });
    }
  }
  incrementMetric("seed.terms.created", createdTerms.length);

  const adminUser = process.env.ADMIN_USERNAME || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || process.env.ADMIN_TOKEN || "admin12345";
  const adminEmail = process.env.ADMIN_EMAIL || `${adminUser}@seed.local`;
  const hashed = await bcrypt.hash(adminPass, 10);

  await prisma.user.upsert({
    where: { username: adminUser },
    update: { password: hashed, email: adminEmail, role: "admin" },
    create: { username: adminUser, email: adminEmail, password: hashed, role: "admin" },
  });

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
      aliases: mergeUnique(existing.aliases ?? [], term.aliases ?? []),
      tags: mergeUnique(existing.tags ?? [], term.tags ?? []),
      examples: term.examples?.length ? term.examples : existing.examples,
    });
  }

  return Array.from(map.values());
}

function mergeUnique<T>(a: T[], b: T[]) {
  return Array.from(new Set([...a, ...b].filter(Boolean)));
}
