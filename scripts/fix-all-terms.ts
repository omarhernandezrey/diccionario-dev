import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const TERMS_DATA = [
  {
    id: 1,
    term: "fetch",
    meaning: "API nativa del navegador para hacer solicitudes HTTP asincrónicas. Devuelve una promesa con la respuesta.",
    what: "Consumir APIs REST/GraphQL sin librerías. Enviar y recibir JSON. Manejo de errores con try/catch.",
    how: "Usa await fetch(url, { method, headers, body, signal }) con AbortController para timeouts. Valida res.ok antes de parsear.",
    examples: [
      "const res = await fetch(url);\nif (!res.ok) throw new Error(`HTTP ${res.status}`);\nreturn res.json();",
      "async function fetchWithTimeout(url, timeoutMs = 8000) {\n  const controller = new AbortController();\n  const timer = setTimeout(() => controller.abort(), timeoutMs);\n  try {\n    const res = await fetch(url, { signal: controller.signal });\n    if (!res.ok) throw new Error(`HTTP ${res.status}`);\n    return res.json();\n  } finally {\n    clearTimeout(timer);\n  }\n}"
    ]
  },
  {
    id: 2,
    term: "useEffect",
    meaning: "Hook de React que ejecuta efectos secundarios después de render. Maneja lógica que no es pura.",
    what: "Sincronizar componentes con sistemas externos. Cargar datos. Suscribirse a eventos. Manejar timers.",
    how: "useEffect(() => { /* efecto */ }, [dependencias]). Se ejecuta tras render. Devuelve cleanup function.",
    examples: [
      "useEffect(() => {\n  console.log('Componente montado');\n  return () => console.log('Desmontado');\n}, []);",
      "useEffect(() => {\n  const data = fetchData(id);\n  setData(data);\n}, [id]);"
    ]
  },
  {
    id: 5,
    term: "bg-gradient-to-r",
    meaning: "Utilidad Tailwind que aplica un degradado de colores de izquierda a derecha.",
    what: "Crear fondos visuales atractivos. Destacar secciones. Mejorar UX con efectos visuales.",
    how: "Combina con from-color y to-color. Ej: bg-gradient-to-r from-blue-500 to-purple-500.",
    examples: [
      "<div class=\"bg-gradient-to-r from-blue-500 to-purple-500 p-4\">Contenido</div>",
      "<div class=\"bg-gradient-to-r from-emerald-400 via-blue-500 to-indigo-600\">Gradiente 3 colores</div>"
    ]
  },
  {
    id: 6,
    term: "flex-col",
    meaning: "Utilidad Tailwind que establece dirección de flex a columna (vertical).",
    what: "Alinear elementos verticalmente. Crear layouts con dirección vertical.",
    how: "Aplica flex-direction: column. Combina con gap, justify, align según necesites.",
    examples: [
      "<div class=\"flex flex-col gap-4\">\n  <div>Item 1</div>\n  <div>Item 2</div>\n</div>",
      "<div class=\"flex flex-col items-center gap-2\">\n  <h1>Título</h1>\n  <p>Descripción</p>\n</div>"
    ]
  },
  {
    id: 7,
    term: "aria-label",
    meaning: "Atributo HTML que proporciona etiqueta accesible para lectores de pantalla.",
    what: "Mejorar accesibilidad. Describir elementos sin texto visible. Ayudar usuarios con discapacidad visual.",
    how: "Añade aria-label=\"descripción\" a elementos que necesitan contexto.",
    examples: [
      "<button aria-label=\"Cerrar diálogo\">✕</button>",
      "<input type=\"search\" aria-label=\"Buscar términos\" placeholder=\"Ingresa término...\" />"
    ]
  },
  {
    id: 8,
    term: "useState",
    meaning: "Hook de React que agrega estado local a componentes funcionales.",
    what: "Gestionar estado local. Actualizar UI cuando cambia el estado. Guardar valores entre renders.",
    how: "const [state, setState] = useState(initialValue). setState dispara re-render.",
    examples: [
      "const [count, setCount] = useState(0);\nreturn <button onClick={() => setCount(count + 1)}>Clicks: {count}</button>;",
      "const [name, setName] = useState('');\nreturn <input value={name} onChange={e => setName(e.target.value)} />;"
    ]
  },
  {
    id: 9,
    term: "debounce",
    meaning: "Técnica que retrasa ejecución de función hasta que se detiene un evento (ej: input).",
    what: "Optimizar performance. Reducir llamadas a API. Mejorar UX en búsquedas y redimensionamiento.",
    how: "Espera X ms sin activación antes de ejecutar. Si hay activación, reinicia contador.",
    examples: [
      "function debounce(fn, delay) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}",
      "const debouncedSearch = debounce((query) => fetchResults(query), 300);\ninput.addEventListener('input', (e) => debouncedSearch(e.target.value));"
    ]
  },
  {
    id: 10,
    term: "JWT",
    meaning: "JSON Web Token. Token firmado que contiene datos codificados en base64, usado para autenticación.",
    what: "Autenticar usuarios sin mantener sesión en servidor. Verificar integridad de datos. Autorización.",
    how: "Estructura: header.payload.signature. Cliente envía en Authorization: Bearer <token>.",
    examples: [
      "const token = jwt.sign({ userId: 123 }, 'secret_key', { expiresIn: '1h' });",
      "const decoded = jwt.verify(token, 'secret_key');"
    ]
  },
  {
    id: 11,
    term: "Docker",
    meaning: "Plataforma de containerización que empaqueta app + dependencias en imagen ejecutable.",
    what: "Garantizar consistencia entre desarrollo y producción. Escalar aplicaciones. Simplificar despliegue.",
    how: "Dockerfile define imagen. docker build crea imagen. docker run ejecuta contenedor.",
    examples: [
      "FROM node:18\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"npm\", \"start\"]",
      "docker build -t mi-app . && docker run -p 3000:3000 mi-app"
    ]
  },
  {
    id: 12,
    term: "GraphQL",
    meaning: "Lenguaje de consulta que permite solicitar exactamente los datos que necesitas.",
    what: "Evitar over-fetching y under-fetching. Consultas flexibles. Mejor performance.",
    how: "Define schema con tipos. Cliente envía query. Servidor devuelve solo campos solicitados.",
    examples: [
      "query GetUser($id: ID!) {\n  user(id: $id) {\n    name\n    email\n  }\n}",
      "type User { id: ID!, name: String!, email: String }"
    ]
  },
  {
    id: 13,
    term: "CI/CD",
    meaning: "Integración Continua / Despliegue Continuo. Automatiza pruebas y despliegue de código.",
    what: "Detectar bugs rápido. Desplegar sin downtime. Automatizar procesos repetitivos.",
    how: "Herramientas como GitHub Actions, GitLab CI. Ejecutan tests y despliegues automáticamente.",
    examples: [
      "name: Test\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - run: npm test",
      "push to main → CI runs tests → if pass, deploy to production"
    ]
  },
  {
    id: 14,
    term: "Prisma",
    meaning: "ORM tipado para Node.js/TypeScript que simplifica acceso a base de datos.",
    what: "Escribir queries type-safe. Evitar SQL injection. Migrar esquema automáticamente.",
    how: "Define schema.prisma → Prisma genera cliente → Usa await prisma.model.action().",
    examples: [
      "const user = await prisma.user.findUnique({ where: { id: 1 } });",
      "const newUser = await prisma.user.create({ data: { name: 'John', email: 'john@example.com' } });"
    ]
  },
  {
    id: 15,
    term: "REST",
    meaning: "Estilo arquitectónico para servicios web basado en recursos y verbos HTTP.",
    what: "Crear APIs escalables. Usar estándares HTTP. Recurso identificable por URL.",
    how: "GET /users → obtener. POST /users → crear. PUT /users/1 → actualizar. DELETE /users/1 → borrar.",
    examples: [
      "GET /api/users → [{ id: 1, name: 'John' }]",
      "POST /api/users { name: 'Jane', email: 'jane@example.com' } → { id: 2, name: 'Jane' }"
    ]
  },
  {
    id: 16,
    term: "align-items",
    meaning: "Propiedad CSS que alinea items en el eje cruzado (vertical en flex-row, horizontal en flex-col).",
    what: "Centrar contenido vertically. Distribuir elementos. Controlar alineación.",
    how: "align-items: center | flex-start | flex-end | stretch | baseline.",
    examples: [
      ".container { display: flex; align-items: center; }",
      "<div class=\"flex align-items-center gap-2\"><Icon /> Texto</div>"
    ]
  },
  {
    id: 17,
    term: "clamp",
    meaning: "Función CSS que limita valor entre mínimo y máximo: clamp(min, preferido, max).",
    what: "Crear tamaños responsivos. Evitar valores fuera de rango. Scaling fluido.",
    how: "clamp(1rem, 2vw, 3rem) → min 1rem, preferido 2vw del viewport, max 3rem.",
    examples: [
      "font-size: clamp(16px, 5vw, 48px);",
      "width: clamp(200px, 80vw, 1200px);"
    ]
  },
  {
    id: 18,
    term: "grid-template-columns",
    meaning: "Propiedad CSS que define patrón de columnas para grid layout.",
    what: "Crear layouts en grilla. Definir número y tamaño de columnas.",
    how: "grid-template-columns: 1fr 2fr | repeat(3, 1fr) | auto 1fr auto.",
    examples: [
      ".grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }",
      "grid-template-columns: 200px 1fr 200px; /* Sidebar-Content-Sidebar */"
    ]
  },
  {
    id: 19,
    term: "aspect-ratio",
    meaning: "Propiedad CSS que mantiene relación de aspecto (ancho/alto) de elemento.",
    what: "Mantener proporción de imágenes/videos. Evitar layout shift. Responsive sin distorsión.",
    how: "aspect-ratio: 16 / 9 | 1 / 1 | auto.",
    examples: [
      ".video { aspect-ratio: 16 / 9; width: 100%; }",
      ".thumbnail { aspect-ratio: 1 / 1; object-fit: cover; }"
    ]
  },
  {
    id: 20,
    term: "backdrop-filter",
    meaning: "Efecto CSS que aplica filtros (blur, brillo) al fondo detrás de elemento.",
    what: "Crear efectos glassmorphism. Mejorar legibilidad sobre fondos complejos.",
    how: "backdrop-filter: blur(10px) | brightness(0.8) | saturate(2).",
    examples: [
      ".modal { backdrop-filter: blur(5px); background: rgba(0,0,0,0.5); }",
      ".card { backdrop-filter: blur(10px) brightness(1.1); }"
    ]
  },
  {
    id: 21,
    term: "scroll-snap",
    meaning: "Propiedad CSS que alinea scroll a posiciones definidas en contenedor.",
    what: "Crear scroll pulido. Alinear secciones. Mejorar UX en galerías/carousels.",
    how: "scroll-snap-type: x mandatory. En hijos: scroll-snap-align: center.",
    examples: [
      ".carousel { scroll-snap-type: x mandatory; overflow-x: scroll; }\n.slide { scroll-snap-align: center; }",
      ".sections { scroll-snap-type: y proximity; }\nsection { scroll-snap-align: start; }"
    ]
  }
];

async function updateAllTerms() {
  console.log("Iniciando actualización de todos los términos...\n");

  for (const termData of TERMS_DATA) {
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

      console.log(`✅ ${termData.term} (ID: ${termData.id}) actualizado`);
    } catch (error) {
      console.error(`❌ Error actualizando ${termData.term}:`, error);
    }
  }

  console.log("\n✅ Todos los términos actualizados exitosamente");
  await prisma.$disconnect();
}

updateAllTerms();
