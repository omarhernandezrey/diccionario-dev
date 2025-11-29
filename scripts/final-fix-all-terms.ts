import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

const termsData = {
  fetch: {
    what: "Hacer solicitudes HTTP desde el navegador o Node.js sin depender de librerías externas.",
    how: "El navegador expone fetch como una función global. Se usa con async/await o .then(). Siempre retorna una Promise con una Response que debe ser parseada.",
    examples: [
      { code: 'const res = await fetch("/api/data");\nconst data = await res.json();', desc: "GET básico" },
      { code: 'const res = await fetch("/api/data", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ name: "Omar" })\n});', desc: "POST con body" },
      { code: 'const controller = new AbortController();\nsetTimeout(() => controller.abort(), 5000);\nconst res = await fetch("/slow", { signal: controller.signal });', desc: "Con timeout" },
    ],
    rules: [
      "Siempre usar try/catch",
      "Validar res.ok y status",
      "Usar AbortController para cancelar/timeout",
      "Especificar cache: \"no-store\" en GET críticos",
      "Parsear respuesta como text primero si es dudosa"
    ]
  },
  "useEffect": {
    what: "Hook de React que ejecuta efectos secundarios (API calls, suscripciones, DOM updates) cuando el componente se monta o dependencias cambian.",
    how: "Se ejecuta después del render. Recibe una función y un array de dependencias. Si el array está vacío, corre solo al montar. Si no existe, corre cada render. La función puede retornar una función cleanup.",
    examples: [
      { code: 'useEffect(() => {\n  console.log("Montado");\n  return () => console.log("Desmontado");\n}, []);', desc: "Efecto en mount" },
      { code: 'useEffect(() => {\n  const unsub = subscribe(user.id);\n  return () => unsub();\n}, [user.id]);', desc: "Con cleanup" },
      { code: 'useEffect(() => {\n  const timer = setTimeout(() => setCount(c => c + 1), 1000);\n  return () => clearTimeout(timer);\n}, []);', desc: "Timer con cleanup" },
    ],
    rules: [
      "Coloca las funciones async en el interior del efecto",
      "Siempre retorna una función cleanup",
      "Declara todas las dependencias en el array",
      "No mutates directamente el estado"
    ]
  },
  "bg-gradient-to-r": {
    what: "Clase Tailwind que aplica un gradiente de fondo de izquierda a derecha.",
    how: "Aplica un gradiente en el elemento. Se combina con colores (bg-gradient-to-r from-blue-500 to-purple-600). El navegador interpola los colores automáticamente.",
    examples: [
      { code: '<div class="bg-gradient-to-r from-blue-500 to-purple-600 p-8">Gradiente</div>', desc: "Gradiente básico" },
      { code: '<button class="bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 hover:opacity-90">CTA</button>', desc: "Con via color" },
      { code: '<div class="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-100 dark:to-slate-200">Dark mode</div>', desc: "Responsivo" },
    ],
    rules: [
      "Define en el elemento padre del contenido",
      "Combina con otras clases de Tailwind",
      "Usa variantes de estado (hover, dark, etc)",
      "Verifica compatibilidad en navegadores antiguos"
    ]
  },
  "flex-col": {
    what: "Clase Tailwind que aplica display: flex con flex-direction: column, alineando items verticalmente.",
    how: "Establece el contenedor como flexbox con dirección vertical. Los hijos se apilan uno debajo del otro. Se combina con gap, justify-content, align-items.",
    examples: [
      { code: '<div class="flex flex-col gap-4">\n  <div>Item 1</div>\n  <div>Item 2</div>\n</div>', desc: "Básico" },
      { code: '<nav class="flex flex-col gap-2 md:flex-row">\n  <a href="#">Home</a>\n  <a href="#">About</a>\n</nav>', desc: "Responsive" },
      { code: '<div class="flex flex-col justify-center items-center h-screen">\n  <h1>Centered</h1>\n</div>', desc: "Centrado" },
    ],
    rules: [
      "Aplica en el contenedor, no en los hijos",
      "Usa gap para espaciado entre items",
      "Combina con otros layouts (grid, flex)",
      "Respeta el modelo de caja"
    ]
  },
  "aria-label": {
    what: "Atributo HTML que proporciona texto accesible para lectores de pantalla cuando no hay texto visible.",
    how: "El navegador expone aria-label a tecnologías asistivas (lectores de pantalla). Se usa cuando no hay texto visible. Cuando aria-label y texto visible coexisten, el lector prioriza aria-label.",
    examples: [
      { code: '<button aria-label=\"Cerrar diálogo\" onclick=\"closeModal()\">✕</button>', desc: "Botón con icono" },
      { code: '<input type=\"search\" aria-label=\"Buscar términos\" placeholder=\"Ingresa...\" />', desc: "Input sin etiqueta" },
      { code: '<nav aria-label=\"Navegación principal\"><ul><li><a href=\"/\">Inicio</a></li></ul></nav>', desc: "Landmark" },
    ],
    rules: [
      "Usa texto conciso y descriptivo (máximo 100 caracteres)",
      "No duplices si ya hay texto visible en el elemento",
      "Aplica especialmente en iconos, botones sin etiqueta y landmarks (nav, main, aside)",
      "Evita etiquetas genéricas: especifica la acción o propósito del elemento"
    ]
  },
  "useState": {
    what: "Hook de React que agrega estado a componentes funcionales.",
    how: "Retorna un array [value, setValue]. El setter puede ser una función (para tomar el estado anterior) o un valor directo. Cada llamada es independiente.",
    examples: [
      { code: 'const [count, setCount] = useState(0);\nreturn <button onClick={() => setCount(c => c + 1)}>{count}</button>;', desc: "Contador básico" },
      { code: 'const [formData, setFormData] = useState({ name: "", email: "" });\nconst handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));', desc: "Objeto con spread" },
      { code: 'const [isOpen, setIsOpen] = useState(false);\nreturn <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>;', desc: "Boolean toggle" },
    ],
    rules: [
      "Solo llama en el nivel superior del componente",
      "Cada llamada crea una variable de estado independiente",
      "No uses en loops o condiciones",
      "El setter es síncrono pero el re-render es asíncrono"
    ]
  },
  "debounce": {
    what: "Técnica que retrasa la ejecución de una función hasta que haya pasado cierto tiempo sin que se invoque.",
    how: "Se usa un setTimeout que se resetea cada vez que se llama la función. Cuando pasa el tiempo sin nuevas llamadas, se ejecuta. Útil para inputs y eventos de scroll.",
    examples: [
      { code: 'const debounce = (fn, delay) => {\n  let timeout;\n  return (...args) => {\n    clearTimeout(timeout);\n    timeout = setTimeout(() => fn(...args), delay);\n  };\n};', desc: "Implementación básica" },
      { code: 'const debouncedSearch = debounce((query) => searchAPI(query), 300);\ninput.addEventListener("input", (e) => debouncedSearch(e.target.value));', desc: "Search input" },
      { code: 'const debouncedResize = debounce(() => recalculateLayout(), 500);\nwindow.addEventListener("resize", debouncedResize);', desc: "Resize listener" },
    ],
    rules: [
      "Espera el tiempo especificado antes de ejecutar",
      "La próxima llamada resetea el temporizador",
      "Úsalo en inputs y eventos frecuentes",
      "Guarda la referencia del timeout para cancel si es necesario"
    ]
  },
  "JWT": {
    what: "Token de autenticación sin estado que contiene información codificada (header.payload.signature).",
    how: "El servidor firma el token con un secret. El cliente lo envía en Authorization: Bearer <token>. El servidor valida la firma sin consultar la BD.",
    examples: [
      { code: 'const token = jwt.sign({ userId: 123, role: "admin" }, SECRET, { expiresIn: "1h" });\n// Client sends: Authorization: Bearer <token>', desc: "Crear JWT" },
      { code: 'const decoded = jwt.verify(req.headers.authorization.split(" ")[1], SECRET);\nconsole.log(decoded.userId);', desc: "Verificar JWT" },
      { code: 'const refreshToken = jwt.sign({ userId: 123 }, REFRESH_SECRET, { expiresIn: "7d" });\n// Almacenar en httpOnly cookie', desc: "Refresh token" },
    ],
    rules: [
      "Almacena en httpOnly cookies en producción",
      "Valida la firma en cada petición",
      "No guardes datos sensibles en el payload",
      "Usa HTTPS para transmisión"
    ]
  },
  "Docker": {
    what: "Containerización que empaqueta la aplicación con sus dependencias en una imagen reutilizable.",
    how: "Dockerfile define los pasos para crear la imagen. docker build crea la imagen. docker run inicia un contenedor. Las capas se cachean para builds más rápidos.",
    examples: [
      { code: 'FROM node:18\\nWORKDIR /app\\nCOPY package*.json .\\nRUN npm ci --production\\nCOPY . .\\nEXPOSE 3000\\nCMD ["node", "server.js"]', desc: "Dockerfile básico" },
      { code: 'docker build -t myapp:1.0 .\\ndocker run -p 3000:3000 myapp:1.0', desc: "Build y run" },
      { code: 'docker-compose up -d\\ndocker-compose logs -f', desc: "Con docker-compose" },
    ],
    rules: [
      "Crea una imagen antes de ejecutar contenedor",
      "Usa .dockerignore para excluir archivos",
      "Las capas se cachean, ordena comandos por frecuencia de cambio",
      "Especifica USER en el Dockerfile por seguridad"
    ]
  },
  "GraphQL": {
    what: "Lenguaje de query flexible que permite solicitar exactamente los datos que necesitas (vs REST que devuelve recursos completos).",
    how: "Cliente envía query (lectura) o mutation (escritura). El servidor resuelve cada campo con un resolver. Las suscripciones usan WebSocket para datos en tiempo real.",
    examples: [
      { code: 'query GetUser($id: ID!) {\\n  user(id: $id) { id name email }\\n}', desc: "Query básica" },
      { code: 'mutation CreatePost($title: String!) {\\n  createPost(title: $title) { id title createdAt }\\n}', desc: "Mutation" },
      { code: 'subscription OnNewComment($postId: ID!) {\\n  newComment(postId: $postId) { id text author { name } }\\n}', desc: "Suscripción" },
    ],
    rules: [
      "Define schema claramente antes de implementar",
      "Usa queries para lectura, mutations para escritura",
      "Las suscripciones requieren WebSocket",
      "Valida inputs en los resolvers"
    ]
  },
  "CI/CD": {
    what: "Automatización de pruebas, construcción y despliegue de código para acelerar el desarrollo y reducir errores.",
    how: "Un webhook dispara el pipeline cuando hay push. Se ejecutan tests, builds y validaciones. Si todo pasa, se despliega automáticamente.",
    examples: [
      { code: '.github/workflows/test.yml\\n- name: Run tests\\n  run: npm test\\n- name: Build\\n  run: npm run build', desc: "GitHub Actions" },
      { code: '.gitlab-ci.yml\\nstages:\\n  - test\\n  - build\\n  - deploy', desc: "GitLab CI" },
      { code: 'stage: deploy\\nscript:\\n  - npm install\\n  - npm run build\\n  - npm run deploy', desc: "Deploy stage" },
    ],
    rules: [
      "Automatiza tests antes de merge",
      "Despliega solo si todos los checks pasan",
      "Mantén secrets seguros en variables de entorno",
      "Rollback automático en caso de fallo"
    ]
  },
  "Prisma": {
    what: "ORM (Object-Relational Mapping) moderno que simplifica el acceso a bases de datos con autocompletado y type-safety.",
    how: "Define schema en schema.prisma. Prisma genera el cliente TypeScript. Las queries se escriben con métodos como findUnique, create, update.",
    examples: [
      { code: 'const user = await prisma.user.findUnique({ where: { id: 1 }, include: { posts: true } });', desc: "Query con relación" },
      { code: 'const user = await prisma.user.create({ data: { email: "user@example.com", name: "John" } });', desc: "Create" },
      { code: 'await prisma.user.update({ where: { id: 1 }, data: { name: "Jane" } });', desc: "Update" },
    ],
    rules: [
      "Define relaciones claramente en schema",
      "Usa `include` para relaciones, `select` para campos específicos",
      "Las migraciones son versionadas y rastreables",
      "Testa queries contra base real"
    ]
  },
  "REST": {
    what: "Arquitectura de API que usa verbos HTTP (GET, POST, PUT, DELETE) y URLs para representar recursos.",
    how: "Cada endpoint representa un recurso (/users, /posts). Los verbos definen la acción. Los códigos de estado indican el resultado (200, 201, 404, 500).",
    examples: [
      { code: 'GET /api/users → Obtener todos\\nGET /api/users/123 → Obtener uno\\nPOST /api/users → Crear\\nPUT /api/users/123 → Actualizar', desc: "Verbos REST" },
      { code: 'curl -X POST http://localhost:3000/api/users \\\\\\n  -H "Content-Type: application/json" \\\\\\n  -d \'{"name": "Omar", "email": "omar@example.com"}\'', desc: "POST con curl" },
      { code: 'GET /api/users?page=1&limit=10 → Con paginación', desc: "Paginación" },
    ],
    rules: [
      "Usa verbos HTTP correctamente (GET, POST, PUT, DELETE)",
      "Devuelve códigos de estado apropiados",
      "Pagina resultados largos",
      "Usa versionamiento en URLs (/v1/, /v2/)"
    ]
  },
  "align-items": {
    what: "Propiedad CSS que alinea elementos en el eje transversal (vertical en flex-row, horizontal en flex-column).",
    how: "Requiere display: flex o grid. Los valores comunes son: center, flex-start, flex-end, stretch. Afecta a todos los hijos del contenedor.",
    examples: [
      { code: '.container {\\n  display: flex;\\n  align-items: center;\\n  height: 200px;\\n}', desc: "Vertical center" },
      { code: '.container {\\n  display: flex;\\n  flex-direction: column;\\n  align-items: flex-end;\\n}', desc: "En columna" },
      { code: '.container {\\n  display: grid;\\n  grid-template-columns: 1fr 1fr;\\n  align-items: start;\\n}', desc: "En grid" },
    ],
    rules: [
      "Alinea elementos en el eje transversal (vertical en flex-row)",
      "Requiere display: flex o display: grid",
      "center alinea verticalmente en flex-row",
      "stretch es el valor por defecto"
    ]
  },
  "clamp": {
    what: "Función CSS que asegura que un valor esté entre un mínimo y máximo, escalando fluidamente.",
    how: "Sintaxis: clamp(MIN, PREFERRED, MAX). Si PREFERRED es menor que MIN, usa MIN. Si es mayor que MAX, usa MAX. Útil para responsive sin media queries.",
    examples: [
      { code: '.title {\\n  font-size: clamp(1rem, 5vw, 3rem);\\n}\\n/* Mínimo 1rem, preferido 5% del viewport, máximo 3rem */', desc: "Font size responsive" },
      { code: '.container {\\n  padding: clamp(1rem, 2vw, 2rem);\\n}', desc: "Padding responsivo" },
      { code: '.width {\\n  width: clamp(200px, 90vw, 1200px);\\n}', desc: "Width responsivo" },
    ],
    rules: [
      "Toma 3 valores: mínimo, preferido, máximo",
      "El valor preferido puede usar unidades relativas",
      "Muy útil para responsive design sin media queries",
      "Aplica a cualquier propiedad CSS que acepte longitud"
    ]
  },
  "grid-template-columns": {
    what: "Propiedad CSS Grid que define el número y tamaño de las columnas en la grilla.",
    how: "Define pistas (columnas) usando unidades: px, fr (fracciones), %, auto. Puedes usar repeat() para patrones. auto-fit/auto-fill llenan dinámicamente.",
    examples: [
      { code: '.grid {\\n  display: grid;\\n  grid-template-columns: 1fr 1fr 1fr;\\n}\\n/* 3 columnas iguales */', desc: "3 columnas iguales" },
      { code: '.grid {\\n  display: grid;\\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\\n}\\n/* Responsive */', desc: "Responsive auto" },
      { code: '.grid {\\n  display: grid;\\n  grid-template-columns: 2fr 1fr;\\n}\\n/* 2:1 ratio */', desc: "Ratio 2:1" },
    ],
    rules: [
      "Define el número y tamaño de columnas",
      "Usa fr para fracciones del espacio disponible",
      "auto-fit o auto-fill para grillas responsivas",
      "repeat() es útil para patrones repetidos"
    ]
  },
  "aspect-ratio": {
    what: "Propiedad CSS que mantiene una proporción de ancho:alto constante sin importar el tamaño.",
    how: "Sintaxis: aspect-ratio: 16 / 9. Cuando el ancho cambia, la altura se ajusta automáticamente. Muy útil para imágenes y videos responsivos.",
    examples: [
      { code: '.video {\\n  aspect-ratio: 16 / 9;\\n  width: 100%;\\n}\\n/* El alto se calcula automáticamente */', desc: "Video 16:9" },
      { code: '.square {\\n  aspect-ratio: 1;\\n  width: 200px;\\n}', desc: "Cuadrado perfecto" },
      { code: '.image {\\n  aspect-ratio: 4 / 3;\\n  object-fit: cover;\\n  width: 100%;\\n}', desc: "Con object-fit" },
    ],
    rules: [
      "Mantiene la proporción cuando cambia el tamaño",
      "Útil para imágenes, videos y componentes responsivos",
      "Los navegadores antiguos no lo soportan",
      "Combinalo con object-fit para imágenes"
    ]
  },
  "backdrop-filter": {
    what: "Propiedad CSS que aplica efectos visuales (blur, brightness, etc) al fondo detrás de un elemento.",
    how: "Se usa en elementos con transparencia. Aplica filtros CSS al contenido detrás. Requiere que el elemento tenga rgba o transparencia.",
    examples: [
      { code: '.modal {\\n  background-color: rgba(0, 0, 0, 0.5);\\n  backdrop-filter: blur(4px);\\n}', desc: "Blur background" },
      { code: '.glass {\\n  background: rgba(255, 255, 255, 0.1);\\n  backdrop-filter: blur(10px) brightness(1.1);\\n}\\n/* Glassmorphism */', desc: "Glassmorphism" },
      { code: '.overlay {\\n  backdrop-filter: brightness(0.8) contrast(1.1);\\n}', desc: "Brightness + contrast" },
    ],
    rules: [
      "Aplica efectos al fondo detrás del elemento",
      "Requiere transparencia en el elemento",
      "Recuerda que el performance puede sufrir",
      "Algunos navegadores tienen soporte limitado"
    ]
  },
  "scroll-snap": {
    what: "Propiedad CSS que fuerza que el scroll se alinee a puntos específicos para una mejor UX.",
    how: "scroll-snap-type define el contenedor. scroll-snap-align en hijos especifica la alineación. Útil en carruseles, galerías y listados móviles.",
    examples: [
      { code: '.carousel {\\n  scroll-snap-type: x mandatory;\\n}\\n.item {\\n  scroll-snap-align: center;\\n}', desc: "Carrusel horizontal" },
      { code: '.gallery {\\n  display: flex;\\n  overflow-x: scroll;\\n  scroll-snap-type: x proximity;\\n}', desc: "Proximity snap" },
      { code: '.fullscreen-scroll {\\n  scroll-snap-type: y mandatory;\\n}\\n.section {\\n  height: 100vh;\\n  scroll-snap-align: start;\\n}', desc: "Fullscreen sections" },
    ],
    rules: [
      "Define puntos de snap en contenedores y elementos",
      "scroll-snap-type en el contenedor",
      "scroll-snap-align en los elementos hijos",
      "Proporciona una mejor UX en scroll móvil"
    ]
  }
};

async function main() {
  try {
    for (const [termName, data] of Object.entries(termsData)) {
      const term = await p.term.findUnique({ where: { term: termName } });
      if (!term) {
        console.log(`❌ ${termName} no encontrado`);
        continue;
      }

      await p.term.update({
        where: { id: term.id },
        data: {
          what: data.what,
          whatEs: data.what,
          how: data.how,
          howEs: data.how,
          examples: data.examples
        }
      });

      console.log(`✅ ${termName} actualizado`);
    }

    console.log("\n✅ TODOS los términos han sido actualizados correctamente");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await p.$disconnect();
  }
}

main();
