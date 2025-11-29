import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const CORRECTED_TERMS = [
  {
    id: 5,
    term: "bg-gradient-to-r",
    meaning: "Utilidad Tailwind CSS que aplica un degradado de colores de izquierda a derecha en el fondo de un elemento.",
    what: "Crear fondos visuales atractivos sin escribir CSS. Mejorar jerarquía visual y UX. Destacar CTAs y secciones.",
    how: "Usa: bg-gradient-to-r from-[color] to-[color]. Opcionalmente via-[color] para 3 colores. Combina con bg-clip-text text-transparent para gradients en texto.",
    examples: [
      "<button class=\"bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-4 py-2 rounded-lg\">CTA</button>",
      "<h1 class=\"bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent text-5xl font-bold\">Heading</h1>",
      "<div class=\"bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 h-32 rounded\"></div>"
    ]
  },
  {
    id: 6,
    term: "flex-col",
    meaning: "Utilidad Tailwind CSS que establece flexbox con dirección columna (vertical) para sus hijos.",
    what: "Alinear elementos verticalmente sin CSS adicional. Crear layouts columna. Reemplazar flex-direction: column.",
    how: "Usa: flex flex-col. Combina con gap-X, items-center, justify-center, etc. Es responsive con md:flex-row.",
    examples: [
      "<div class=\"flex flex-col gap-4\">\n  <header>Header</header>\n  <main>Main</main>\n  <footer>Footer</footer>\n</div>",
      "<div class=\"flex flex-col items-center justify-center h-screen gap-6\">\n  <h1>Centrado</h1>\n  <button>Acción</button>\n</div>",
      "<ul class=\"flex flex-col gap-2\">\n  {items.map(item => <li key={item}>{item}</li>)}\n</ul>"
    ]
  },
  {
    id: 7,
    term: "aria-label",
    meaning: "Atributo HTML que proporciona una etiqueta accesible para lectores de pantalla cuando no hay texto visible.",
    what: "Mejorar accesibilidad para usuarios con discapacidad visual. Describir elementos sin texto visible. Cumplir WCAG.",
    how: "Añade aria-label=\"descripción clara\". Úsalo en botones icon-only, inputs sin label visible, y elementos de control.",
    examples: [
      "<button aria-label=\"Cerrar diálogo\" class=\"text-2xl\">✕</button>",
      "<input type=\"search\" aria-label=\"Buscar términos\" placeholder=\"Ingresa...\" />",
      "<a href=\"/menu\" aria-label=\"Abrir navegación\"><Icon name=\"menu\" /></a>"
    ]
  },
  {
    id: 8,
    term: "useState",
    meaning: "Hook de React que permite agregar estado local a componentes funcionales.",
    what: "Gestionar estado local reactivo. Actualizar UI automáticamente. Guardar valores entre renders sin perder estado.",
    how: "const [state, setState] = useState(initialValue). Llamar setState dispara re-render. Úsalo solo en nivel superior.",
    examples: [
      "const [count, setCount] = useState(0);\nreturn <button onClick={() => setCount(count + 1)}>Clicks: {count}</button>;",
      "const [name, setName] = useState('');\nreturn (\n  <input \n    value={name} \n    onChange={e => setName(e.target.value)} \n    placeholder=\"Tu nombre\"\n  />\n);",
      "const [isOpen, setIsOpen] = useState(false);\nreturn (\n  <>\n    <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>\n    {isOpen && <Menu />}\n  </>\n);"
    ]
  },
  {
    id: 9,
    term: "debounce",
    meaning: "Técnica que retrasa la ejecución de una función hasta que un evento se detiene por X milisegundos.",
    what: "Optimizar performance en búsquedas. Reducir llamadas a API. Mejorar UX en inputs, resize, scroll.",
    how: "Retarda X ms desde última activación. Si hay nueva activación, reinicia contador. Evita múltiples ejecutiones.",
    examples: [
      "function debounce(fn, delay) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}",
      "const debouncedSearch = debounce((query) => fetchResults(query), 300);\ninput.addEventListener('input', (e) => debouncedSearch(e.target.value));",
      "const handleResize = debounce(() => {\n  console.log('Resize ended:', window.innerWidth);\n}, 500);\nwindow.addEventListener('resize', handleResize);"
    ]
  },
  {
    id: 10,
    term: "JWT",
    meaning: "JSON Web Token. Token criptográficamente firmado que contiene datos codificados en base64url.",
    what: "Autenticar usuarios sin mantener sesión en servidor. Verificar integridad y autenticidad de datos.",
    how: "Estructura: header.payload.signature. Cliente envía en Authorization: Bearer <token>. Servidor verifica firma.",
    examples: [
      "const token = jwt.sign({ userId: 123, email: 'user@example.com' }, 'secret_key', { expiresIn: '1h' });",
      "const decoded = jwt.verify(token, 'secret_key');\nconsole.log(decoded.userId);",
      "// En request: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    ]
  },
  {
    id: 11,
    term: "Docker",
    meaning: "Plataforma de containerización que empaqueta aplicación + dependencias en imagen ejecutable portable.",
    what: "Garantizar mismo comportamiento en dev, staging, producción. Escalar apps fácilmente. Simplificar despliegue.",
    how: "Dockerfile define imagen. docker build crea. docker run ejecuta contenedor. docker-compose orquesta múltiples.",
    examples: [
      "FROM node:18\nWORKDIR /app\nCOPY package*.json .\nRUN npm install\nCOPY . .\nCMD [\"npm\", \"start\"]",
      "docker build -t mi-app:latest .\ndocker run -p 3000:3000 -e NODE_ENV=production mi-app:latest",
      "version: '3'\nservices:\n  app:\n    build: .\n    ports:\n      - \"3000:3000\"\n  db:\n    image: postgres:15"
    ]
  },
  {
    id: 12,
    term: "GraphQL",
    meaning: "Lenguaje de consulta que permite solicitar exactamente los datos que necesitas (sin datos extra).",
    what: "Evitar over-fetching (datos innecesarios) y under-fetching. Consultas flexibles. Mejor performance.",
    how: "Cliente envía query con campos específicos. Servidor devuelve solo eso. Define schema con tipos tipados.",
    examples: [
      "query GetUser($id: ID!) {\n  user(id: $id) {\n    id\n    name\n    email\n  }\n}",
      "type User {\n  id: ID!\n  name: String!\n  email: String!\n  posts: [Post!]!\n}",
      "mutation CreatePost($title: String!, $content: String!) {\n  createPost(title: $title, content: $content) {\n    id\n    title\n  }\n}"
    ]
  },
  {
    id: 13,
    term: "CI/CD",
    meaning: "Integración Continua / Despliegue Continuo. Automatiza pruebas y despliegue cada vez que hay cambios.",
    what: "Detectar bugs rápido. Desplegar sin downtime. Automatizar tests, builds, releases. Feedback inmediato.",
    how: "Herramientas: GitHub Actions, GitLab CI, Jenkins. Al push → ejecutan tests → si ok, despliegan.",
    examples: [
      "name: CI/CD\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - run: npm test\n      - run: npm run build",
      "push main → CI tests → if pass → deploy staging → manual approval → deploy production",
      "script: 'npm run test && npm run build && npm run deploy'"
    ]
  },
  {
    id: 14,
    term: "Prisma",
    meaning: "ORM tipado para Node.js/TypeScript que simplifica acceso a BD con generación automática de queries.",
    what: "Escribir queries type-safe. Evitar SQL injection. Migrar esquema automáticamente. Mejor DX.",
    how: "Define schema.prisma → Prisma genera cliente tipado → Usa await prisma.model.action().",
    examples: [
      "const user = await prisma.user.findUnique({ where: { id: 1 } });",
      "const newUser = await prisma.user.create({\n  data: { name: 'John', email: 'john@example.com' }\n});",
      "const updated = await prisma.post.update({\n  where: { id: 5 },\n  data: { published: true }\n});"
    ]
  },
  {
    id: 15,
    term: "REST",
    meaning: "Estilo arquitectónico para servicios web basado en recursos identificables por URL y verbos HTTP.",
    what: "Crear APIs escalables y estándar. Usar HTTP nativamente. Recurso como concepto central.",
    how: "GET /users → listar. POST /users → crear. PUT /users/1 → actualizar. DELETE /users/1 → borrar.",
    examples: [
      "GET /api/users → [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]",
      "POST /api/users { \"name\": \"Bob\", \"email\": \"bob@example.com\" } → { id: 3, name: 'Bob' }",
      "PUT /api/users/1 { \"name\": \"John Updated\" } → { id: 1, name: 'John Updated' }\nDELETE /api/users/1 → 204 No Content"
    ]
  },
  {
    id: 16,
    term: "align-items",
    meaning: "Propiedad CSS que alinea items en el eje cruzado (vertical en flex-row, horizontal en flex-col).",
    what: "Centrar contenido. Distribuir elementos verticalmente. Controlar alineación sin posicionamiento absoluto.",
    how: "align-items: center | flex-start | flex-end | stretch | baseline. Funciona en flex y grid.",
    examples: [
      ".container { display: flex; align-items: center; height: 200px; }",
      "<div class=\"flex align-items-center gap-4\">\n  <Icon size={24} />\n  <span>Texto alineado</span>\n</div>",
      ".grid { display: grid; align-items: center; }"
    ]
  },
  {
    id: 17,
    term: "clamp",
    meaning: "Función CSS que limita un valor entre mínimo y máximo con preferencia: clamp(min, preferido, max).",
    what: "Crear tamaños responsivos sin media queries. Evitar valores fuera de rango. Scaling fluido.",
    how: "clamp(min, preferred, max). Si preferred < min → min. Si preferred > max → max. Else → preferred.",
    examples: [
      "font-size: clamp(16px, 5vw, 48px); /* Min 16px, escalable, max 48px */",
      "width: clamp(200px, 80vw, 1200px); /* Ancho responsivo */",
      "padding: clamp(1rem, 2vw, 3rem); /* Padding fluido */"
    ]
  },
  {
    id: 18,
    term: "grid-template-columns",
    meaning: "Propiedad CSS que define el patrón de columnas para un grid layout.",
    what: "Crear layouts en grilla flexible. Definir número y tamaño de columnas. Reemplazar layouts complejos.",
    how: "grid-template-columns: 1fr 2fr | repeat(3, 1fr) | auto 1fr auto | minmax(200px, 1fr).",
    examples: [
      ".grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }",
      "grid-template-columns: 200px 1fr 200px; /* Sidebar-Content-Sidebar */",
      "grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* Responsive cards */"
    ]
  },
  {
    id: 19,
    term: "aspect-ratio",
    meaning: "Propiedad CSS que mantiene una relación de aspecto (ancho/alto) fija en un elemento.",
    what: "Mantener proporción de imágenes/videos. Evitar layout shift. Responsive sin distorsión.",
    how: "aspect-ratio: 16 / 9 | 1 / 1 | 3 / 2. Combina con width: 100% para escalar.",
    examples: [
      ".video { aspect-ratio: 16 / 9; width: 100%; }",
      ".thumbnail { aspect-ratio: 1 / 1; object-fit: cover; width: 100%; }",
      "img { aspect-ratio: 4 / 3; width: 100%; object-fit: cover; }"
    ]
  },
  {
    id: 20,
    term: "backdrop-filter",
    meaning: "Efecto CSS que aplica filtros (blur, brillo, etc) al fondo detrás de un elemento.",
    what: "Crear efectos glassmorphism. Mejorar legibilidad sobre fondos complejos. Efectos visuales avanzados.",
    how: "backdrop-filter: blur(10px) | brightness(0.8) | saturate(2) | opacity(0.8). Funciona en navegadores modernos.",
    examples: [
      ".modal { backdrop-filter: blur(5px); background: rgba(0, 0, 0, 0.5); }",
      ".navbar { backdrop-filter: blur(10px) brightness(1.1); background: rgba(255, 255, 255, 0.1); }",
      ".overlay { backdrop-filter: saturate(1.5) contrast(1.2); }"
    ]
  },
  {
    id: 21,
    term: "scroll-snap",
    meaning: "Propiedad CSS que alinea automáticamente el scroll a posiciones definidas en el contenedor.",
    what: "Crear scroll pulido y controlado. Alinear secciones en galerías. Mejorar UX en carousels.",
    how: "En contenedor: scroll-snap-type: x mandatory | y proximity. En items: scroll-snap-align: center | start.",
    examples: [
      ".carousel { scroll-snap-type: x mandatory; overflow-x: scroll; }\n.slide { scroll-snap-align: center; width: 100%; }",
      ".sections { scroll-snap-type: y proximity; }\nsection { scroll-snap-align: start; min-height: 100vh; }",
      "/* Full-screen sections con scroll snap */\n<div class=\"scroll-snap-type: y mandatory\">\n  <section class=\"scroll-snap-align: start\">Sección 1</section>\n  <section class=\"scroll-snap-align: start\">Sección 2</section>\n</div>"
    ]
  }
];

async function fixAllTerms() {
  console.log("Corrigiendo todos los términos en BD...\n");

  for (const termData of CORRECTED_TERMS) {
    try {
      const updated = await prisma.term.update({
        where: { id: termData.id },
        data: {
          meaning: termData.meaning,
          meaningEs: termData.meaning,
          what: termData.what,
          whatEs: termData.what,
          how: termData.how,
          howEs: termData.how,
          examples: termData.examples as Prisma.JsonArray
        }
      });

      console.log(`✅ ${termData.term} corregido`);
    } catch (error) {
      console.error(`❌ Error en ${termData.term}:`, error);
    }
  }

  console.log("\n✅ Todos los términos han sido corregidos");
  await prisma.$disconnect();
}

fixAllTerms();
