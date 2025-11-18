import { Category, Language } from "@prisma/client";
import type { SeedTermInput } from "../dictionary-types";

export const curatedTerms: SeedTermInput[] = [
  {
    term: "fetch",
    translation: "traer datos del servidor",
    category: Category.frontend,
    descriptionEs: "API nativa del navegador para hacer solicitudes HTTP con promesas.",
    descriptionEn: "Native browser API to perform HTTP requests returning promises.",
    aliases: ["fetch API", "window.fetch"],
    tags: ["http", "api", "promises"],
    example: {
      titleEs: "Traer publicaciones",
      titleEn: "Fetch posts",
      code: `async function loadPosts() {
  const response = await fetch("/api/posts");
  if (!response.ok) throw new Error("Error al cargar");
  return response.json();
}`,
      noteEs: "Controlas estados pending/success/error con promesas.",
      noteEn: "You manage pending/success/error states with promises.",
    },
    whatEs: "Nos ayuda a comunicarnos con APIs REST o GraphQL sin depender de librerías externas.",
    whatEn: "It lets you talk to REST or GraphQL APIs without extra libraries.",
    howEs: "Usa await fetch(url, { method, headers, body }) y maneja los posibles errores con try/catch.",
    howEn: "Call await fetch(url, { method, headers, body }) and wrap it with try/catch for error handling.",
  },
  {
    term: "useState",
    translation: "estado local en React",
    category: Category.frontend,
    descriptionEs: "Hook que crea y actualiza valores reactivos dentro de componentes.",
    descriptionEn: "React Hook that creates a reactive value inside function components.",
    aliases: ["hook state"],
    tags: ["react", "hooks", "state"],
    example: {
      titleEs: "Contador minimal",
      titleEn: "Minimal counter",
      code: `export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount((value) => value + 1)}>
      {count}
    </button>
  );
}`,
      noteEs: "Cada actualización re-renderiza únicamente este componente.",
      noteEn: "Each update re-renders only this component.",
    },
    whatEs: "Resuelve la necesidad de guardar input del usuario, flags de UI o datos cacheados.",
    whatEn: "Solves local UI data like user input, flags or cached responses.",
    howEs: "Importa useState desde react, inicializa con un valor y usa el setter para actualizar de forma inmutable.",
    howEn: "Import useState from react, provide an initial value and call the setter to update immutably.",
    languageOverride: Language.ts,
  },
  {
    term: "debounce",
    translation: "espera antes de ejecutar",
    category: Category.frontend,
    descriptionEs: "Patrón que retrasa la ejecución hasta que pasa un intervalo sin nuevos eventos.",
    descriptionEn: "Pattern that delays execution until no new events fire within a window.",
    aliases: ["debouncer"],
    tags: ["performance", "ux"],
    example: {
      titleEs: "Input con debounce",
      titleEn: "Debounced input",
      code: `const debouncedChange = useMemo(() => debounce((value) => {
  search(value);
}, 250), []);`,
      noteEs: "Evita bombardear al servidor en cada pulsación.",
      noteEn: "Avoids hammering the server on every keystroke.",
    },
    whatEs: "Sirve para buscadores, auto guardados o listeners scroll.",
    whatEn: "Useful for search bars, autosave workflows or scroll listeners.",
    howEs: "Envuelve la función costosa con debounce(fn, tiempo) y limpia el timer al desmontar.",
    howEn: "Wrap the expensive logic with debounce(fn, wait) and clear the timer on unmount.",
  },
  {
    term: "JWT",
    translation: "token firmado",
    category: Category.backend,
    descriptionEs: "JSON Web Token firmado que transporta claims entre cliente y servidor.",
    descriptionEn: "Signed JSON Web Token that carries claims between client and server.",
    aliases: ["json web token"],
    tags: ["auth", "security"],
    example: {
      titleEs: "Generar token en Node",
      titleEn: "Issue token in Node",
      code: `const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET!, {
  expiresIn: "1h",
});`,
      noteEs: "Incluye sólo la info necesaria y revoca cuando sea posible.",
      noteEn: "Only include required claims and rotate secrets.",
    },
    whatEs: "Resuelve autenticación stateless y delega la verificación al backend.",
    whatEn: "Enables stateless authentication where the backend validates signatures.",
    howEs: "Firma con una clave segura, ajusta expiración corta y valida con middleware en cada request.",
    howEn: "Sign tokens with a strong secret, set short TTLs and validate them in middleware per request.",
  },
  {
    term: "Docker",
    translation: "contenedores reproducibles",
    category: Category.devops,
    descriptionEs: "Plataforma para empacar aplicaciones y dependencias en contenedores aislados.",
    descriptionEn: "Platform to package apps and dependencies into isolated containers.",
    aliases: ["docker compose"],
    tags: ["containers", "devops"],
    example: {
      titleEs: "API empaquetada",
      titleEn: "Packaged API",
      code: `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "dist/server.js"]`,
      noteEs: "La imagen se ejecuta igual en tu laptop o en producción.",
      noteEn: "Image behaves the same locally and in prod.",
    },
    whatEs: "Facilita ambientes consistentes y despliegues predecibles.",
    whatEn: "Gives consistent environments and predictable deployments.",
    howEs: "Escribe un Dockerfile, construye la imagen y orquesta servicios con compose o Kubernetes.",
    howEn: "Craft a Dockerfile, build the image and orchestrate services via Compose or Kubernetes.",
  },
  {
    term: "GraphQL",
    translation: "consultas declarativas",
    category: Category.backend,
    descriptionEs: "Especificación para exponer APIs donde el cliente define la forma exacta de los datos.",
    descriptionEn: "Specification that lets clients ask precisely for the data shape they need.",
    aliases: ["gql"],
    tags: ["api", "schema"],
    example: {
      titleEs: "Resolver básico",
      titleEn: "Basic resolver",
      code: `const resolvers = {
  Query: {
    term: (_parent, args, ctx) => ctx.prisma.term.findUnique({ where: { slug: args.slug } }),
  },
};`,
      noteEs: "Cada resolver retorna justo lo que la consulta solicita.",
      noteEn: "Each resolver matches what the query asked for.",
    },
    whatEs: "Resuelve overfetching/subfetching al dejar que el frontend describa los campos.",
    whatEn: "Solves overfetching/underfetching by letting frontend describe fields.",
    howEs: "Define un schema, implementa resolvers y usa herramientas como Apollo o Yoga para exponer el endpoint.",
    howEn: "Write the schema, map resolvers and expose it using Apollo, Mercurius or Yoga.",
  },
  {
    term: "CI/CD",
    translation: "entrega continua",
    category: Category.devops,
    descriptionEs: "Práctica que automatiza tests, builds y despliegues en cada cambio.",
    descriptionEn: "Practice that automates tests, builds and deployments on every change.",
    aliases: ["pipelines"],
    tags: ["automation", "quality"],
    example: {
      titleEs: "GitHub Actions",
      titleEn: "GitHub Actions",
      code: `name: ci
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test`,
      noteEs: "Cada commit ejecuta tests antes de mergear.",
      noteEn: "Every commit runs tests before merging.",
    },
    whatEs: "Nos da feedback rápido sobre regresiones y acelera releases.",
    whatEn: "Delivers fast feedback on regressions and accelerates releases.",
    howEs: "Define pipelines declarativos que compilen, prueben y desplieguen usando ambientes efímeros.",
    howEn: "Create declarative pipelines that build, test and deploy using ephemeral environments.",
  },
  {
    term: "Prisma",
    translation: "ORM tipado",
    category: Category.backend,
    descriptionEs: "ORM moderno para TypeScript que genera cliente tipado y migraciones.",
    descriptionEn: "Type-safe ORM for TypeScript that ships with generated client and migrations.",
    aliases: ["prisma orm"],
    tags: ["orm", "database"],
    example: {
      titleEs: "Consulta tipada",
      titleEn: "Typed query",
      code: `const term = await prisma.term.findUnique({
  where: { slug },
  include: { variants: true },
});`,
      noteEs: "Typescript infiere el shape del resultado.",
      noteEn: "TypeScript infers the return shape automatically.",
    },
    whatEs: "Resuelve el puente entre modelos y base de datos con DX amigable.",
    whatEn: "Bridges schema and DB with great DX.",
    howEs: "Describe modelos en schema.prisma, ejecuta migrate dev y usa el cliente generado en servicios.",
    howEn: "Describe models in schema.prisma, run migrate dev and use the generated client inside services.",
    languageOverride: Language.ts,
  },
];
