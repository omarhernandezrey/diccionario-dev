import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function addRules() {
  const rulesMap: Record<string, string[]> = {
    fetch: ["Siempre usar try/catch", "Validar res.ok y status", "Usar AbortController", "Especificar cache", "Parsear como text"],
    useEffect: ["Funciones async en el interior", "Siempre retorna cleanup", "Declara dependencias", "No mutes estado"],
    "bg-gradient-to-r": ["Define en padre", "Combina clases", "Usa variantes", "Verifica compatibilidad"],
    "flex-col": ["En contenedor", "Usa gap", "Combina layouts", "Respeta caja"],
    "aria-label": ["Conciso", "No duplices", "En iconos", "Específico"],
    useState: ["Nivel superior", "Independiente", "No loops", "Setter síncrono"],
    debounce: ["Espera tiempo", "Resetea", "En inputs", "Guarda ref"],
    JWT: ["httpOnly", "Valida firma", "Sin datos sensibles", "HTTPS"],
    Docker: ["Imagen primero", ".dockerignore", "Capas cacheadas", "USER"],
    GraphQL: ["Schema", "Queries/mutations", "WebSocket", "Valida"],
    "CI/CD": ["Tests antes", "Checks pasan", "Secrets env", "Rollback"],
    Prisma: ["Schema relaciones", "include/select", "Migraciones versionadas", "Tests"],
    REST: ["Verbos HTTP", "Status codes", "Paginación", "Versionamiento"],
    "align-items": ["Eje transversal", "flex/grid", "center", "stretch defecto"],
    clamp: ["3 valores", "Relativas", "Responsive", "Cualquier propiedad"],
    "grid-template-columns": ["Columnas", "fr fracciones", "auto-fit/fill", "repeat"],
    "aspect-ratio": ["Proporción", "Imágenes/videos", "Antiguos", "object-fit"],
    "backdrop-filter": ["Fondo", "Transparencia", "Performance", "Compat limitada"],
    "scroll-snap": ["Puntos snap", "scroll-snap-type", "scroll-snap-align", "Mobile"]
  };

  for (const [termName, rules] of Object.entries(rulesMap)) {
    const term = await p.term.findUnique({ where: { term: termName } });
    if (!term) continue;

    const examples = Array.isArray(term.examples) ? term.examples : [];
    await p.term.update({
      where: { id: term.id },
      data: {
        examples: examples.map((ex: any) => ({ ...ex, rules }))
      }
    });
    console.log(`✅ ${termName}`);
  }

  console.log("\n✅ Reglas agregadas a todos los términos");
  await p.$disconnect();
}

addRules();
