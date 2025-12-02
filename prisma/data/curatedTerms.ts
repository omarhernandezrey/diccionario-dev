import { Category, Language } from "@prisma/client";
import type { ExampleSnippet, SeedTermInput } from "../dictionary-types";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const toPascal = (value: string) =>
  value
    .replace(/[^a-z0-9]+/gi, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");

const curatedTermsBase: SeedTermInput[] = [
  {
    term: "fetch",
    translation: "traer datos del servidor",
    category: Category.frontend,
    descriptionEs: "API nativa del navegador para hacer solicitudes HTTP asincrónicas basadas en promesas.",
    descriptionEn: "Native browser API for asynchronous HTTP requests that returns promises.",
    aliases: ["fetch API", "window.fetch", "native fetch"],
    tags: ["http", "api", "promises", "abortcontroller"],
    example: {
      titleEs: "GET con verificación de estado",
      titleEn: "GET with status check",
      code: `async function loadPosts() {
  const res = await fetch("/api/posts", { cache: "no-store" });

  if (!res.ok) throw new Error(\`HTTP \${res.status} \${res.statusText}\`);

  return res.json();
}`,
      noteEs: "Siempre valida res.ok y devuelve JSON parseado.",
      noteEn: "Always check res.ok and parse JSON before using it.",
    },
    secondExample: {
      titleEs: "Timeout y cancelación con AbortController",
      titleEn: "Timeout and cancel with AbortController",
      code: `async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);

    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } finally {
    clearTimeout(timer);
  }
}`,
      noteEs: "Evita fetch colgados, maneja respuestas vacías y permite cancelar.",
      noteEn: "Prevents hanging requests, handles empty bodies, and supports cancelation.",
    },
    exerciseExample: {
      titleEs: "POST JSON con reintento básico",
      titleEn: "JSON POST with basic retry",
      code: `async function postJson(url, payload, retries = 1) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(\`HTTP \${res.status}: \${message || res.statusText}\`);
      }

      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      lastError = error;
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }

  throw lastError;
}`,
      noteEs: "Diferencia errores HTTP de fallos de red y agrega reintentos con backoff corto.",
      noteEn: "Separates HTTP errors from network failures and adds short backoff retries.",
    },
    whatEs: "Consumir APIs REST o GraphQL y enviar/recibir JSON sin dependencias externas.",
    whatEn: "Consume REST/GraphQL APIs and send/receive JSON without extra dependencies.",
    howEs: "Usa fetch(url, { method, headers, body, signal }) con AbortController para timeouts, valida res.ok y maneja cuerpos vacíos o no-JSON.",
    howEn: "Use fetch(url, { method, headers, body, signal }) with AbortController for timeouts, check res.ok, and handle empty or non-JSON bodies.",
  },
  {
    term: "useEffect",
    translation: "efectos en React",
    category: Category.frontend,
    descriptionEs: "Hook de React para ejecutar efectos secundarios (fetch, suscripciones, timers) sincronizados con el ciclo de vida del componente.",
    descriptionEn: "React hook to run side effects (fetching, subscriptions, timers) tied to the component lifecycle.",
    aliases: ["react effect", "effect hook"],
    tags: ["react", "hooks", "lifecycle"],
    example: {
      titleEs: "Suscripción y limpieza",
      titleEn: "Subscribe and cleanup",
      code: `import { useEffect } from "react";

function OnlineStatus() {
  useEffect(() => {
    function handleOnline() {
      console.log("Estoy online");
    }

    window.addEventListener("online", handleOnline);

    // 🔥 Limpieza: se ejecuta al desmontar o al cambiar dependencias.
    return () => window.removeEventListener("online", handleOnline);
  }, []); // Array vacío => solo al montar/desmontar

  return <p>Escuchando estado de red...</p>;
}`,
      noteEs: "Devuelve una función de limpieza para evitar fugas y listeners duplicados.",
      noteEn: "Return a cleanup function to avoid leaks and duplicate listeners.",
    },
    secondExample: {
      titleEs: "Fetch al montar componente",
      titleEn: "Fetch on mount",
      code: `useEffect(() => {
  let ignore = false;
  
  async function startFetching() {
    const json = await fetchTodos(userId);
    if (!ignore) {
      setTodos(json);
    }
  }

  startFetching();

  return () => {
    ignore = true;
  };
}, [userId]);`,
      noteEs: "Patrón para evitar condiciones de carrera en fetch.",
      noteEn: "Pattern to avoid race conditions in data fetching.",
    },
    exerciseExample: {
      titleEs: "Temporizador con limpieza",
      titleEn: "Timer with cleanup",
      code: `function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    
    return () => clearInterval(id);
  }, []);

  return <h1>{count}</h1>;
}`,
      noteEs: "Es crucial limpiar el intervalo al desmontar.",
      noteEn: "Cleaning up the interval on unmount is crucial.",
    },
    whatEs: "Sincroniza lógica externa (fetch, eventos, timers) con el render y las dependencias declaradas.",
    whatEn: "Sync external logic (fetch, events, timers) with render and declared dependencies.",
    howEs: "Declara dependencias en el array final; limpia recursos retornando una función.",
    howEn: "List dependencies in the array; return a cleanup to release resources.",
    languageOverride: Language.ts,
  },

  {
    term: "bg-gradient-to-r",
    translation: "degradado horizontal Tailwind",
    category: Category.frontend,
    descriptionEs: "Clase utilitaria de Tailwind CSS que aplica un fondo degradado de izquierda a derecha.",
    descriptionEn: "Tailwind utility that applies a left-to-right gradient background.",
    aliases: ["gradient tailwind", "bg gradient"],
    tags: ["tailwind", "css", "ui"],
    example: {
      titleEs: "Botón con degradado",
      titleEn: "Gradient button",
      code: `<button class=\"bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 text-white px-4 py-2 rounded-lg shadow\">CTA</button>`,
      noteEs: "Combínalo con from-*, via-* y to-* para definir colores.",
      noteEn: "Combine with from-*, via-*, and to-* to set colors.",
    },
    secondExample: {
      titleEs: "Texto con degradado",
      titleEn: "Gradient text",
      code: `<h1 class="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent text-5xl font-bold">
  Hello World
</h1>`,
      noteEs: "Usa bg-clip-text y text-transparent para aplicar el degradado al texto.",
      noteEn: "Use bg-clip-text and text-transparent to apply gradient to text.",
    },
    exerciseExample: {
      titleEs: "Tarjeta con borde degradado",
      titleEn: "Gradient border card",
      code: `<div class="p-1 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rounded-xl">
  <div class="bg-white p-6 rounded-lg">
    <h2 class="font-bold text-xl">Card Title</h2>
    <p>Content goes here...</p>
  </div>
</div>`,
      noteEs: "Un contenedor con padding crea el efecto de borde.",
      noteEn: "A container with padding creates the border effect.",
    },
    whatEs: "Aporta contraste y jerarquía visual a botones o secciones sin escribir CSS adicional.",
    whatEn: "Adds contrast and visual hierarchy to buttons or sections without extra CSS.",
    howEs: "Aplica la clase bg-gradient-to-r en el atributo class junto con from-*, to-* y opcionalmente via-*. Para texto usa bg-clip-text y text-transparent. Combina con variantes como hover:, dark: o md: para diseños responsivos.",
    howEn: "Apply the bg-gradient-to-r class in the class attribute along with from-*, to-* and optionally via-*. For text use bg-clip-text and text-transparent. Combine with variants like hover:, dark: or md: for responsive designs.",
    languageOverride: Language.html,
  },
  {
    term: "flex-col",
    translation: "columna en flex (Tailwind)",
    category: Category.frontend,
    descriptionEs: "Clase de Tailwind CSS que establece la dirección de los hijos en columna dentro de un contenedor flex.",
    descriptionEn: "Tailwind utility to set flex direction to column inside a flex container.",
    aliases: ["flex column", "tailwind flex-col"],
    tags: ["tailwind", "flexbox", "layout"],
    example: {
      titleEs: "Stack vertical en tarjeta",
      titleEn: "Vertical stack in card",
      code: `<div class=\"flex flex-col gap-3 p-4 border rounded-lg\">
  <h3 class=\"text-lg font-semibold\">Título</h3>
  <p class=\"text-sm text-slate-500\">Descripción breve del item.</p>
  <button class=\"self-end bg-emerald-500 text-white px-3 py-2 rounded\">Acción</button>
</div>`,
      noteEs: "Usa gap-* para espaciar y self-* para alinear elementos puntuales.",
      noteEn: "Pair with gap-* for spacing and self-* to align specific items.",
    },
    secondExample: {
      titleEs: "Formulario vertical",
      titleEn: "Vertical form",
      code: `<form class="flex flex-col gap-4">
  <label class="flex flex-col">
    Email
    <input type="email" class="border p-2 rounded" />
  </label>
  <button type="submit" class="bg-blue-500 text-white p-2 rounded">
    Sign In
  </button>
</form>`,
      noteEs: "Ideal para formularios móviles.",
      noteEn: "Ideal for mobile-first forms.",
    },
    exerciseExample: {
      titleEs: "Layout de barra lateral",
      titleEn: "Sidebar layout",
      code: `<div class="flex h-screen">
  <aside class="w-64 bg-gray-800 text-white flex flex-col p-4">
    <nav class="flex-1 flex flex-col gap-2">
      <a href="#" class="p-2 hover:bg-gray-700 rounded">Home</a>
      <a href="#" class="p-2 hover:bg-gray-700 rounded">Settings</a>
    </nav>
    <div class="mt-auto">
      User Profile
    </div>
  </aside>
  <main class="flex-1 p-8">
    Content
  </main>
</div>`,
      noteEs: "Flex-col organiza la navegación verticalmente.",
      noteEn: "Flex-col organizes navigation vertically.",
    },
    whatEs: "Simplifica layouts en columna sin escribir CSS personalizado.",
    whatEn: "Simplifies column layouts without custom CSS.",
    howEs: "Aplica flex y flex-col en el contenedor; ajusta gap y alineación con justify/align utilities.",
    howEn: "Apply flex and flex-col on the container; adjust gap and alignment with justify/align utilities.",
  },
  {
    term: "aria-label",
    translation: "etiqueta accesible",
    category: Category.frontend,
    descriptionEs: "Atributo HTML que proporciona texto accesible para lectores de pantalla cuando no hay texto visible.",
    descriptionEn: "HTML attribute providing accessible text for screen readers when no visible text exists.",
    aliases: ["aria label", "accessibility label"],
    tags: ["html", "a11y", "accessibility"],
    example: {
      titleEs: "Botón icono accesible",
      titleEn: "Accessible icon button",
      code: `<button aria-label=\"Abrir menú\" class=\"p-2 rounded hover:bg-slate-100\">
  <svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" class=\"h-5 w-5\">
    <path d=\"M4 6h16M4 12h16M4 18h16\" stroke=\"currentColor\" stroke-width=\"2\"/>
  </svg>
</button>`,
      noteEs: "aria-label describe la acción cuando el botón solo muestra un ícono.",
      noteEn: "aria-label describes the action when the button only shows an icon.",
    },
    secondExample: {
      titleEs: "Navegación accesible",
      titleEn: "Accessible navigation",
      code: `<nav aria-label="Principal">
  <ul>
    <li><a href="/">Inicio</a></li>
    <li><a href="/shop">Tienda</a></li>
  </ul>
</nav>`,
      noteEs: "Distingue múltiples regiones de navegación.",
      noteEn: "Distinguishes multiple navigation regions.",
    },
    exerciseExample: {
      titleEs: "Input de búsqueda solo icono",
      titleEn: "Icon-only search input",
      code: `<form role="search">
  <label for="search" class="sr-only">Buscar productos</label>
  <input id="search" type="text" placeholder="Buscar..." />
  <button type="submit" aria-label="Realizar búsqueda">
    🔍
  </button>
</form>`,
      noteEs: "Usa sr-only o aria-label para inputs sin etiqueta visible.",
      noteEn: "Use sr-only or aria-label for inputs without visible labels.",
    },
    whatEs: "Hace que controles sin texto visible sean anunciados correctamente por tecnologías asistivas.",
    whatEn: "Ensures controls without visible text are announced by assistive tech.",
    howEs: "Añade aria-label conciso y accionable; evita duplicar cuando ya hay texto visible.",
    howEn: "Add a concise, action-oriented aria-label; avoid duplicating visible text.",
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
  // Inicializamos el estado "count" en 0.
  // "setCount" es la función que usaremos para actualizarlo.
  const [count, setCount] = useState(0);

  return (
    // Al hacer clic, llamamos a setCount.
    // Usamos una función callback (value => value + 1) para asegurar
    // que trabajamos con el valor más reciente del estado.
    <button onClick={() => setCount((value) => value + 1)}>
      {/* Renderizamos el valor actual de count */}
      {count}
    </button>
  );
}`,
      noteEs: "Cada actualización re-renderiza únicamente este componente.",
      noteEn: "Each update re-renders only this component.",
    },
    secondExample: {
      titleEs: "Estado de formulario",
      titleEn: "Form state",
      code: `function Form() {
  const [text, setText] = useState('hello');

  function handleChange(e) {
    setText(e.target.value);
  }

  return (
    <>
      <input value={text} onChange={handleChange} />
      <p>You typed: {text}</p>
      <button onClick={() => setText('hello')}>
        Reset
      </button>
    </>
  );
}`,
      noteEs: "Controla inputs de formulario (controlled components).",
      noteEn: "Controls form inputs (controlled components).",
    },
    exerciseExample: {
      titleEs: "Toggle booleano",
      titleEn: "Boolean toggle",
      code: `function Toggle() {
  const [isOn, setIsOn] = useState(false);

  return (
    <button onClick={() => setIsOn(!isOn)}>
      {isOn ? 'ON' : 'OFF'}
    </button>
  );
}`,
      noteEs: "Patrón simple para interruptores o modales.",
      noteEn: "Simple pattern for switches or modals.",
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
      code: `// Creamos una versión "debounced" de nuestra función de búsqueda.
// useMemo asegura que no se recree la función en cada render.
const debouncedChange = useMemo(() => 
  debounce((value) => {
    // Esta lógica solo se ejecutará si pasan 250ms
    // sin que el usuario escriba nada nuevo.
    search(value);
  }, 250), 
[]); // El array vacío [] indica que solo se crea al montar el componente.`,
      noteEs: "Evita bombardear al servidor en cada pulsación.",
      noteEn: "Avoids hammering the server on every keystroke.",
    },
    secondExample: {
      titleEs: "Resize handler",
      titleEn: "Resize handler",
      code: `window.addEventListener('resize', debounce(() => {
  console.log('Window resized');
  // Recalcular layout costoso aquí
}, 200));`,
      noteEs: "Optimiza eventos frecuentes como resize o scroll.",
      noteEn: "Optimizes frequent events like resize or scroll.",
    },
    exerciseExample: {
      titleEs: "Botón de guardado automático",
      titleEn: "Autosave button",
      code: `const save = debounce((data) => {
  api.save(data);
  console.log('Guardado!');
}, 1000);

function Editor({ data }) {
  return (
    <textarea 
      onChange={(e) => save(e.target.value)}
      defaultValue={data}
    />
  );
}`,
      noteEs: "Guarda cambios después de que el usuario deja de escribir.",
      noteEn: "Saves changes after user stops typing.",
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
      code: `// Firmamos un nuevo token JWT.
// El primer argumento es el payload (datos del usuario).
const token = jwt.sign(
  { sub: user.id, role: user.role }, 
  
  // El segundo argumento es la clave secreta para firmar.
  // Usamos una variable de entorno por seguridad.
  process.env.JWT_SECRET!, 
  
  // Configuramos opciones como la expiración (1 hora).
  { expiresIn: "1h" }
);`,
      noteEs: "Incluye sólo la info necesaria y revoca cuando sea posible.",
      noteEn: "Only include required claims and rotate secrets.",
    },
    secondExample: {
      titleEs: "Verificar token (Middleware)",
      titleEn: "Verify token (Middleware)",
      code: `function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}`,
      noteEs: "Middleware estándar para proteger rutas en Express.",
      noteEn: "Standard middleware to protect routes in Express.",
    },
    exerciseExample: {
      titleEs: "Decodificar token en cliente",
      titleEn: "Decode token on client",
      code: `function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}`,
      noteEs: "Útil para leer claims (rol, exp) sin validar firma.",
      noteEn: "Useful to read claims (role, exp) without signature validation.",
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
      code: `# Usamos una imagen base ligera de Node.js (Alpine Linux).
FROM node:20-alpine

# Establecemos el directorio de trabajo dentro del contenedor.
WORKDIR /app

# Copiamos primero los archivos de dependencias.
# Esto aprovecha la caché de capas de Docker si no han cambiado.
COPY package*.json ./

# Instalamos solo las dependencias de producción.
RUN npm ci --only=production

# Copiamos el resto del código fuente de la aplicación.
COPY . .

# Definimos el comando por defecto para iniciar el servidor.
CMD ["node", "dist/server.js"]`,
      noteEs: "La imagen se ejecuta igual en tu laptop o en producción.",
      noteEn: "Image behaves the same locally and in prod.",
    },
    secondExample: {
      titleEs: "Docker Compose básico",
      titleEn: "Basic Docker Compose",
      code: `version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
  db:
    image: postgres:13
    environment:
      POSTGRES_PASSWORD: example`,
      noteEs: "Orquesta múltiples contenedores (app + db).",
      noteEn: "Orchestrates multiple containers (app + db).",
    },
    exerciseExample: {
      titleEs: "Contenedor de Python",
      titleEn: "Python container",
      code: `FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "./app.py"]`,
      noteEs: "Estructura similar para cualquier lenguaje.",
      noteEn: "Similar structure for any language.",
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
    // Resolver para la query "term".
    // Recibe: parent, argumentos (args), y contexto (ctx).
    term: (_parent, args, ctx) => {
      // Usamos Prisma desde el contexto para buscar en la DB.
      // Buscamos un término único por su "slug".
      return ctx.prisma.term.findUnique({ 
        where: { slug: args.slug } 
      });
    },
  },
};`,
      noteEs: "Cada resolver retorna justo lo que la consulta solicita.",
      noteEn: "Each resolver matches what the query asked for.",
    },
    secondExample: {
      titleEs: "Consulta desde cliente",
      titleEn: "Client query",
      code: `query GetUser($id: ID!) {
  user(id: $id) {
    name
    posts {
      title
    }
  }
}`,
      noteEs: "Pide datos anidados en una sola petición.",
      noteEn: "Requests nested data in a single request.",
    },
    exerciseExample: {
      titleEs: "Mutación para crear usuario",
      titleEn: "Create user mutation",
      code: `mutation CreateUser($name: String!, $email: String!) {
  createUser(name: $name, email: $email) {
    id
    name
    email
  }
}`,
      noteEs: "Las mutaciones modifican datos en el servidor.",
      noteEn: "Mutations modify data on the server.",
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
# Definimos cuándo se ejecuta este workflow.
# En este caso, en cada "push" a la rama "main".
on:
  push:
    branches: [main]

jobs:
  test:
    # Especificamos el sistema operativo del runner.
    runs-on: ubuntu-latest
    steps:
      # Paso 1: Descargar el código del repositorio.
      - uses: actions/checkout@v4
      
      # Paso 2: Instalar Node.js versión 20.
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          
      # Paso 3: Instalar dependencias de forma limpia (CI).
      - run: npm ci
      
      # Paso 4: Ejecutar la suite de tests.
      - run: npm test`,
      noteEs: "Cada commit ejecuta tests antes de mergear.",
      noteEn: "Every commit runs tests before merging.",
    },
    secondExample: {
      titleEs: "Pipeline de despliegue",
      titleEn: "Deployment pipeline",
      code: `deploy:
  needs: test
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main'
  steps:
    - uses: actions/checkout@v2
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: \${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "my-app"
        heroku_email: "me@example.com"`,
      noteEs: "Despliega automáticamente si los tests pasan.",
      noteEn: "Deploys automatically if tests pass.",
    },
    exerciseExample: {
      titleEs: "Linter check",
      titleEn: "Linter check",
      code: `lint:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
    - run: npm ci
    - run: npm run lint`,
      noteEs: "Asegura calidad de código estática.",
      noteEn: "Ensures static code quality.",
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
      code: `// Usamos el cliente de Prisma para buscar en la base de datos.
// "await" espera a que la consulta termine.
const term = await prisma.term.findUnique({
  // Condición de búsqueda: donde el slug coincida.
  where: { slug },
  
  // Incluimos relaciones: queremos traer también las variantes del término.
  include: { variants: true },
});
// TypeScript infiere el shape del resultado automáticamente.`,
      noteEs: "Typescript infiere el shape del resultado.",
      noteEn: "TypeScript infers the return shape automatically.",
    },
    secondExample: {
      titleEs: "Creación de registro",
      titleEn: "Create record",
      code: `const newUser = await prisma.user.create({
  data: {
    email: 'alice@prisma.io',
    name: 'Alice',
    posts: {
      create: { title: 'Hello World' },
    },
  },
})`,
      noteEs: "Crea registros relacionados en una sola transacción.",
      noteEn: "Creates related records in a single transaction.",
    },
    exerciseExample: {
      titleEs: "Actualización condicional",
      titleEn: "Conditional update",
      code: `const updatedUser = await prisma.user.update({
  where: { email: 'alice@prisma.io' },
  data: {
    name: 'Alice the Great',
  },
})`,
      noteEs: "Actualiza un registro existente.",
      noteEn: "Updates an existing record.",
    },
    whatEs: "Resuelve el puente entre modelos y base de datos con DX amigable.",
    whatEn: "Bridges schema and DB with great DX.",
    howEs: "Describe modelos en schema.prisma, ejecuta migrate dev y usa el cliente generado en servicios.",
    howEn: "Describe models in schema.prisma, run migrate dev and use the generated client inside services.",
    languageOverride: Language.ts,
  },
  {
    term: "REST",
    translation: "transferencia de estado representacional",
    category: Category.backend,
    descriptionEs: "Estilo de arquitectura para diseñar servicios web basados en recursos y verbos HTTP.",
    descriptionEn: "Architectural style for designing networked applications based on resources and HTTP verbs.",
    aliases: ["restful", "rest api"],
    tags: ["api", "http", "architecture"],
    example: {
      titleEs: "Endpoint REST típico",
      titleEn: "Typical REST endpoint",
      code: `// Definimos una ruta GET para obtener un usuario por ID.
// ":id" es un parámetro dinámico en la URL.
app.get('/users/:id', async (req, res) => {
  
  // Buscamos el usuario en la DB usando el ID de los parámetros.
  const user = await db.findUser(req.params.id);
  
  // Si no existe, devolvemos un error 404 (Not Found) temprano.
  if (!user) return res.status(404).json({ error: 'Not found' });
  
  // Si existe, devolvemos el usuario en formato JSON con estado 200 (OK).
  res.json(user);
});`,
      noteEs: "Usa verbos estándar (GET) y códigos de estado (404, 200).",
      noteEn: "Uses standard verbs (GET) and status codes (404, 200).",
    },
    secondExample: {
      titleEs: "Recurso anidado",
      titleEn: "Nested resource",
      code: `GET /users/123/posts
GET /users/123/posts/456`,
      noteEs: "URLs jerárquicas representan relaciones.",
      noteEn: "Hierarchical URLs represent relationships.",
    },
    exerciseExample: {
      titleEs: "Crear recurso (POST)",
      titleEn: "Create resource (POST)",
      code: `POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}

// Response: 201 Created`,
      noteEs: "POST crea nuevos recursos y retorna 201.",
      noteEn: "POST creates new resources and returns 201.",
    },
    whatEs: "Estandariza la comunicación entre cliente y servidor usando la infraestructura existente de la web.",
    whatEn: "Standardizes client-server communication leveraging existing web infrastructure.",
    howEs: "Diseña recursos (URLs), usa verbos HTTP correctos (GET, POST, PUT, DELETE) y devuelve representaciones (JSON).",
    howEn: "Design resources (URLs), use proper HTTP verbs and return representations (JSON).",
  },
  {
    term: "html",
    translation: "elemento raíz HTML",
    category: Category.frontend,
    descriptionEs: "Etiqueta raíz que envuelve todo el documento y define el idioma base.",
    descriptionEn: "Root element that wraps the entire document and defines the base language.",
    aliases: ["<html>", "root element", "html tag"],
    tags: ["html", "dom", "document", "a11y"],
    example: {
      titleEs: "Documento mínimo con idioma",
      titleEn: "Minimal document with language",
      code: `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Diccionario Dev</title>
  </head>
  <body>
    <p>Hola mundo</p>
  </body>
</html>`,
      noteEs: "El atributo lang habilita anuncios correctos en lectores de pantalla.",
      noteEn: "The lang attribute helps screen readers announce content correctly.",
    },
    secondExample: {
      titleEs: "Dirección y tema global",
      titleEn: "Global direction and theme",
      code: `<html lang="en" dir="ltr" data-theme="dark">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <main>Contenido</main>
  </body>
</html>`,
      noteEs: "data-* y dir en html se heredan a todo el árbol DOM.",
      noteEn: "data-* and dir on html cascade to the whole DOM tree.",
    },
    exerciseExample: {
      titleEs: "Shell base para SPA",
      titleEn: "Base shell for SPA",
      code: `<!DOCTYPE html>
<html lang="es" class="font-sans">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Panel</title>
  </head>
  <body>
    <div id="app">Cargando...</div>
  </body>
</html>`,
      noteEs: "Prepara el nodo raíz para hidratar una app sin dependencias externas.",
      noteEn: "Prepares the root node to hydrate an app without extra dependencies.",
    },
    languageOverride: Language.html,
    whatEs: "Define el contenedor raíz del DOM y el idioma para accesibilidad y estilos globales.",
    whatEn: "Defines the DOM root container and language for accessibility and global styles.",
    howEs: "Incluye siempre <!DOCTYPE html> y el atributo lang en la etiqueta html.",
    howEn: "Always include <!DOCTYPE html> and the lang attribute on the html tag.",
  },
  {
    term: "head",
    translation: "cabecera del documento",
    category: Category.frontend,
    descriptionEs: "Sección que agrupa metadatos, enlaces a recursos y el título de la página.",
    descriptionEn: "Section that holds metadata, resource links, and the page title.",
    aliases: ["<head>", "document head"],
    tags: ["html", "metadata", "seo", "performance"],
    example: {
      titleEs: "Head básico para layout responsivo",
      titleEn: "Basic head for responsive layout",
      code: `<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dashboard</title>
  <link rel="stylesheet" href="/styles/app.css" />
</head>`,
      noteEs: "charset y viewport deben ir primero para que el navegador procese el documento correctamente.",
      noteEn: "charset and viewport should be first so the browser parses the document correctly.",
    },
    secondExample: {
      titleEs: "Optimización de fuentes y analytics",
      titleEn: "Fonts and analytics optimization",
      code: `<head>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="icon" href="/favicon.ico" />
  <title>Tienda | Marca</title>
  <script src="/analytics.js" defer></script>
</head>`,
      noteEs: "Los hints (preconnect/preload) reducen la latencia de recursos críticos.",
      noteEn: "Hints like preconnect/preload cut latency for critical assets.",
    },
    exerciseExample: {
      titleEs: "Head listo para PWA",
      titleEn: "PWA-ready head",
      code: `<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <meta name="theme-color" content="#0f172a" />
  <link rel="apple-touch-icon" href="/icons/icon-192.png" />
  <title>App Offline</title>
</head>`,
      noteEs: "Incluye manifest y theme-color para que el navegador trate la app como instalable.",
      noteEn: "Add manifest and theme-color so the browser treats the app as installable.",
    },
    languageOverride: Language.html,
    whatEs: "Centraliza los metadatos y recursos que afectan cómo se carga y presenta la página.",
    whatEn: "Centralizes metadata and resources that drive how the page loads and is presented.",
    howEs: "Coloca charset y viewport al inicio; añade títulos, íconos y hints según tus necesidades.",
    howEn: "Place charset and viewport first; add titles, icons, and hints as needed.",
  },
  {
    term: "body",
    translation: "cuerpo del documento",
    category: Category.frontend,
    descriptionEs: "Contenedor principal del contenido visible y de los manejadores de eventos de la página.",
    descriptionEn: "Main container for visible content and page event handlers.",
    aliases: ["<body>", "document body"],
    tags: ["html", "dom", "layout", "a11y"],
    example: {
      titleEs: "Estructura semántica básica",
      titleEn: "Basic semantic structure",
      code: `<body>
  <header>
    <h1>Diccionario Dev</h1>
    <nav>
      <a href="/">Inicio</a>
      <a href="/glosario">Glosario</a>
    </nav>
  </header>
  <main>
    <article>
      <h2>Términos nuevos</h2>
      <p>Explora conceptos claves.</p>
    </article>
  </main>
  <footer>© 2024</footer>
</body>`,
      noteEs: "Usa etiquetas semánticas para mejorar accesibilidad y SEO.",
      noteEn: "Use semantic tags to improve accessibility and SEO.",
    },
    secondExample: {
      titleEs: "Body con tema y atajo de acceso",
      titleEn: "Body with theme and skip link",
      code: `<body class="bg-slate-50 text-slate-900" data-theme="light">
  <a href="#contenido" class="sr-only focus:not-sr-only">Saltar al contenido</a>
  <main id="contenido">
    <p>Contenido principal.</p>
  </main>
</body>`,
      noteEs: "La clase sr-only permite accesos directos visibles al enfocar.",
      noteEn: "sr-only links become visible on focus for keyboard navigation.",
    },
    exerciseExample: {
      titleEs: "Body listo para hidratar",
      titleEn: "Hydration-ready body",
      code: `<body>
  <noscript>Esta app requiere JavaScript.</noscript>
  <div id="root">Cargando...</div>
  <script type="module" src="/main.js" defer></script>
</body>`,
      noteEs: "Separa un contenedor root y agrega fallback sin JS.",
      noteEn: "Separates a root container and adds a no-JS fallback.",
    },
    languageOverride: Language.html,
    whatEs: "Agrupa todo lo que el usuario ve e interactúa dentro del documento.",
    whatEn: "Wraps everything the user sees and interacts with in the document.",
    howEs: "Estructura el body con regiones semánticas y deja un nodo root para apps SPA/SSR.",
    howEn: "Structure body with semantic regions and leave a root node for SPA/SSR apps.",
  },
  {
    term: "base",
    translation: "URL base del documento",
    category: Category.frontend,
    descriptionEs: "Etiqueta que define la URL y el target por defecto para enlaces y rutas relativas.",
    descriptionEn: "Tag that sets the default URL and target for relative links and resources.",
    aliases: ["<base>", "base href"],
    tags: ["html", "routing", "seo"],
    example: {
      titleEs: "Base para abrir enlaces en nueva pestaña",
      titleEn: "Base to open links in new tab",
      code: `<head>
  <base href="https://ejemplo.com/app/" target="_blank" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <a href="docs/guia.pdf">Ver guía</a>
</body>`,
      noteEs: "El target global aplica a todos los anchors sin target explícito.",
      noteEn: "The global target applies to all anchors without an explicit target.",
    },
    secondExample: {
      titleEs: "Base para rutas relativas en SPA",
      titleEn: "Base for relative SPA routes",
      code: `<head>
  <base href="/dashboard/" />
</head>
<body>
  <a href="reports">Reportes</a>
  <img src="assets/avatar.png" alt="Avatar" />
</body>`,
      noteEs: "Coloca base al inicio del head para que el navegador resuelva rutas correctamente.",
      noteEn: "Place base at the start of head so the browser resolves routes correctly.",
    },
    exerciseExample: {
      titleEs: "Base por entorno",
      titleEn: "Environment-driven base",
      code: `<head>
  <!-- Cambia href en build según entorno -->
  <base href="%PUBLIC_URL%/" />
  <link rel="stylesheet" href="app.css" />
</head>`,
      noteEs: "En builds estáticos puedes interpolar la URL pública para servir desde subdirectorios.",
      noteEn: "Static builds can interpolate the public URL to serve from subdirectories.",
    },
    languageOverride: Language.html,
    whatEs: "Controla cómo se resuelven los enlaces relativos y el target predeterminado del documento.",
    whatEn: "Controls how relative links resolve and sets the document's default target.",
    howEs: "Declara base una sola vez al inicio del head y evita cambiarla dinámicamente.",
    howEn: "Declare base only once at the top of head and avoid changing it at runtime.",
  },
  {
    term: "link",
    translation: "enlace a recursos",
    category: Category.frontend,
    descriptionEs: "Elemento vacío que referencia recursos externos como estilos, íconos o hints de carga.",
    descriptionEn: "Void element referencing external resources like styles, icons, or loading hints.",
    aliases: ["<link>", "stylesheet tag"],
    tags: ["html", "performance", "css", "preload"],
    example: {
      titleEs: "Cargar una hoja de estilos",
      titleEn: "Load a stylesheet",
      code: `<head>
  <link rel="stylesheet" href="/css/app.css" />
</head>`,
      noteEs: "rel=\"stylesheet\" bloquea el render hasta descargar el CSS.",
      noteEn: "rel=\"stylesheet\" blocks render until CSS is downloaded.",
    },
    secondExample: {
      titleEs: "Optimizar fuentes con preload",
      titleEn: "Optimize fonts with preload",
      code: `<head>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="/css/typography.css" />
</head>`,
      noteEs: "Preload reduce el CLS al adelantar la descarga de fuentes críticas.",
      noteEn: "Preload reduces CLS by fetching critical fonts early.",
    },
    exerciseExample: {
      titleEs: "Íconos y theme alterno",
      titleEn: "Icons and alternate theme",
      code: `<head>
  <link rel="icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" href="/icons/icon-192.png" />
  <link rel="alternate stylesheet" title="Dark" href="/css/dark.css" />
</head>`,
      noteEs: "Puedes ofrecer un stylesheet alterno para cambios de tema manuales.",
      noteEn: "You can expose an alternate stylesheet for manual theme switching.",
    },
    languageOverride: Language.html,
    whatEs: "Permite declarar recursos externos y pistas de carga que afectan el rendimiento.",
    whatEn: "Lets you declare external assets and loading hints that affect performance.",
    howEs: "Usa rel adecuado (stylesheet, preload, preconnect) y define crossorigin cuando aplica.",
    howEn: "Use the proper rel (stylesheet, preload, preconnect) and set crossorigin when needed.",
  },
  {
    term: "meta",
    translation: "metadatos del documento",
    category: Category.frontend,
    descriptionEs: "Etiqueta para definir charset, viewport, SEO, social cards y preferencias de color.",
    descriptionEn: "Tag to declare charset, viewport, SEO, social cards, and color preferences.",
    aliases: ["<meta>", "meta tag"],
    tags: ["html", "seo", "a11y", "performance"],
    example: {
      titleEs: "Metas esenciales",
      titleEn: "Essential metas",
      code: `<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Glosario práctico para devs." />
</head>`,
      noteEs: "charset y viewport deben estar al inicio; description mejora el snippet en buscadores.",
      noteEn: "Place charset and viewport first; description improves search snippets.",
    },
    secondExample: {
      titleEs: "Tarjetas sociales completas",
      titleEn: "Complete social cards",
      code: `<head>
  <meta property="og:title" content="Diccionario Dev" />
  <meta property="og:description" content="Conceptos clave explicados con ejemplos." />
  <meta property="og:image" content="https://ejemplo.com/og-card.png" />
  <meta name="twitter:card" content="summary_large_image" />
</head>`,
      noteEs: "Open Graph y Twitter card controlan el preview al compartir enlaces.",
      noteEn: "Open Graph and Twitter cards control previews when sharing links.",
    },
    exerciseExample: {
      titleEs: "Preferencias de color y PWA",
      titleEn: "Color preferences and PWA",
      code: `<head>
  <meta name="theme-color" content="#0f172a" />
  <meta name="color-scheme" content="light dark" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'self';" />
</head>`,
      noteEs: "theme-color y color-scheme ajustan UI del navegador; CSP fortalece seguridad.",
      noteEn: "theme-color and color-scheme tune browser UI; CSP hardens security.",
    },
    languageOverride: Language.html,
    whatEs: "Comunica al navegador y a los buscadores cómo interpretar y mostrar la página.",
    whatEn: "Tells the browser and crawlers how to interpret and present the page.",
    howEs: "Define charset/viewport primero y añade metas específicas para SEO, social y seguridad.",
    howEn: "Define charset/viewport first and add targeted metas for SEO, social, and security.",
  },
  {
    term: "style-element",
    translation: "etiqueta style",
    category: Category.frontend,
    descriptionEs: "Elemento que aloja CSS embebido dentro del documento sin archivo externo.",
    descriptionEn: "Element that hosts embedded CSS inside the document without an external file.",
    aliases: ["<style>", "embedded styles"],
    tags: ["html", "css", "inline styles"],
    example: {
      titleEs: "Estilo rápido en el head",
      titleEn: "Quick style in head",
      code: `<head>
  <style>
    button {
      background: #0f172a;
      color: white;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
    }
  </style>
</head>`,
      noteEs: "Ideal para prototipos o estilos críticos pequeños.",
      noteEn: "Great for prototypes or small critical styles.",
    },
    secondExample: {
      titleEs: "Tema con atributos de datos",
      titleEn: "Theme using data attributes",
      code: `<style>
  [data-theme="dark"] body { background: #0b1221; color: #e2e8f0; }
  [data-theme="light"] body { background: #ffffff; color: #0f172a; }
</style>`,
      noteEs: "Puedes cambiar el tema aplicando data-theme en html o body.",
      noteEn: "Switch themes by toggling data-theme on html or body.",
    },
    exerciseExample: {
      titleEs: "CSS crítico inline",
      titleEn: "Inline critical CSS",
      code: `<style>
  /* Layout principal para evitar FOUC */
  body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
  main { max-width: 960px; margin: 0 auto; padding: 1.5rem; }
  .card { border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1rem; }
</style>`,
      noteEs: "Coloca estilos críticos inline para mejorar el LCP inicial.",
      noteEn: "Inline critical styles to improve initial LCP.",
    },
    languageOverride: Language.html,
    whatEs: "Permite definir CSS rápido o crítico sin dependencias externas.",
    whatEn: "Lets you define quick or critical CSS without external dependencies.",
    howEs: "Ubica style en el head y evita CSS extenso inline; migra a archivos cuando crezca.",
    howEn: "Place style in head and avoid large inline CSS; move to files as it grows.",
  },
  {
    term: "title",
    translation: "título del documento",
    category: Category.frontend,
    descriptionEs: "Texto que se muestra en la pestaña del navegador y sirve como título principal de la página.",
    descriptionEn: "Text shown in the browser tab and used as the page's primary title.",
    aliases: ["<title>", "document title"],
    tags: ["html", "seo", "ux"],
    example: {
      titleEs: "Título claro para dashboard",
      titleEn: "Clear dashboard title",
      code: `<head>
  <title>Dashboard | Diccionario Dev</title>
</head>`,
      noteEs: "Incluye el contexto del producto para que sea reconocible en la pestaña.",
      noteEn: "Include product context so the tab is recognizable.",
    },
    secondExample: {
      titleEs: "Título por sección",
      titleEn: "Section-based title",
      code: `<head>
  <title>Perfil de usuario | App</title>
</head>`,
      noteEs: "Combina sección + marca para mejorar SEO y usabilidad.",
      noteEn: "Combine section + brand to improve SEO and usability.",
    },
    exerciseExample: {
      titleEs: "Título para landing",
      titleEn: "Landing title",
      code: `<head>
  <title>Aprende HTML en minutos</title>
  <meta name="description" content="Guías cortas y ejemplos listos para usar." />
</head>`,
      noteEs: "Alinea el título con la meta description para evitar discrepancias en buscadores.",
      noteEn: "Align the title with meta description to avoid mismatches in search results.",
    },
    languageOverride: Language.html,
    whatEs: "Nombra la página en la pestaña del navegador y aporta señal primaria a SEO.",
    whatEn: "Names the page in the browser tab and gives primary SEO signal.",
    howEs: "Ponlo dentro de head y mantenlo corto (50–60 caracteres).",
    howEn: "Place it inside head and keep it concise (50–60 characters).",
  },
  {
    term: "script",
    translation: "carga de JavaScript",
    category: Category.frontend,
    descriptionEs: "Etiqueta para ejecutar o enlazar scripts controlando estrategia con defer, async o type=module.",
    descriptionEn: "Tag to execute or load scripts while controlling strategy with defer, async, or type=module.",
    aliases: ["<script>", "script tag"],
    tags: ["html", "javascript", "performance", "security"],
    example: {
      titleEs: "Script módulo con defer",
      titleEn: "Module script with defer",
      code: `<body>
  <script type="module" src="/js/app.js" defer></script>
</body>`,
      noteEs: "type=module usa ES modules y defer evita bloquear el render.",
      noteEn: "type=module leverages ES modules and defer avoids render blocking.",
    },
    secondExample: {
      titleEs: "Config inline segura",
      titleEn: "Safe inline config",
      code: `<head>
  <script nonce="abc123">
    window.appConfig = { apiBase: "/api" };
  </script>
</head>`,
      noteEs: "Usa nonce o hash si tienes CSP para permitir scripts inline controlados.",
      noteEn: "Use a nonce or hash with CSP to allow controlled inline scripts.",
    },
    exerciseExample: {
      titleEs: "Carga diferida y fallback",
      titleEn: "Deferred load with fallback",
      code: `<body>
  <div id="root">Cargando...</div>
  <script src="https://cdn.example.com/react.production.min.js" crossorigin defer></script>
  <script src="/js/app.bundle.js" defer></script>
  <noscript>Activa JavaScript para usar la aplicación.</noscript>
</body>`,
      noteEs: "Agrupa scripts al final del body y agrega noscript como respaldo.",
      noteEn: "Group scripts at the end of body and add noscript as fallback.",
    },
    languageOverride: Language.html,
    whatEs: "Inyecta JavaScript en la página controlando bloqueo, integridad y seguridad.",
    whatEn: "Injects JavaScript into the page while controlling blocking, integrity, and security.",
    howEs: "Prefiere type=module + defer; aplica nonce/CSP y coloca scripts al final cuando sean clásicos.",
    howEn: "Prefer type=module + defer; apply nonce/CSP and place classic scripts at the end.",
  },
  {
    term: "noscript",
    translation: "contenido sin JavaScript",
    category: Category.frontend,
    descriptionEs: "Bloque alternativo que se muestra cuando el navegador no ejecuta JavaScript.",
    descriptionEn: "Alternative block displayed when the browser does not run JavaScript.",
    aliases: ["<noscript>", "no script fallback"],
    tags: ["html", "progressive enhancement", "a11y"],
    example: {
      titleEs: "Aviso de funcionalidad limitada",
      titleEn: "Limited functionality notice",
      code: `<body>
  <noscript>
    <div class="alert">Activa JavaScript para usar todas las funciones.</div>
  </noscript>
</body>`,
      noteEs: "Informa a usuarios sin JS sobre las limitaciones.",
      noteEn: "Let no-JS users know about limitations.",
    },
    secondExample: {
      titleEs: "Estilos alternos sin JS",
      titleEn: "Alternate styles without JS",
      code: `<head>
  <noscript>
    <style>
      .requires-js { display: none; }
    </style>
  </noscript>
</head>`,
      noteEs: "Oculta UI que depende de JS para evitar confusión.",
      noteEn: "Hide JS-dependent UI to avoid confusion.",
    },
    exerciseExample: {
      titleEs: "Fallback de datos estáticos",
      titleEn: "Static data fallback",
      code: `<body>
  <section class="requires-js">
    <div id="app">Cargando app...</div>
  </section>
  <noscript>
    <article>
      <h1>Versión estática</h1>
      <p>Descarga el PDF con la guía completa.</p>
      <a href="/guia.pdf">Abrir guía</a>
    </article>
  </noscript>
</body>`,
      noteEs: "Ofrece una ruta alternativa para acceso a contenido esencial.",
      noteEn: "Provide an alternate path to essential content.",
    },
    languageOverride: Language.html,
    whatEs: "Comunica contenido alternativo cuando JS está deshabilitado o bloqueado.",
    whatEn: "Communicates alternate content when JS is disabled or blocked.",
    howEs: "Coloca noscript cerca de la UI dependiente y ofrece acciones claras.",
    howEn: "Place noscript near JS-dependent UI and offer clear actions.",
  },
  {
    term: "template",
    translation: "plantilla HTML reutilizable",
    category: Category.frontend,
    descriptionEs: "Contenedor inerte que guarda marcado reutilizable hasta que se instancia vía JavaScript.",
    descriptionEn: "Inactive container that stores reusable markup until instantiated via JavaScript.",
    aliases: ["<template>", "html template"],
    tags: ["html", "dom", "web components"],
    example: {
      titleEs: "Clonar tarjeta desde template",
      titleEn: "Clone card from template",
      code: `<template id="card-template">
  <article class="card">
    <h3 class="title"></h3>
    <p class="body"></p>
  </article>
</template>
<script>
  const tpl = document.getElementById("card-template");
  const card = tpl.content.cloneNode(true);
  card.querySelector(".title").textContent = "Nueva entrada";
  card.querySelector(".body").textContent = "Detalle del término.";
  document.body.appendChild(card);
</script>`,
      noteEs: "template.content no se renderiza hasta clonarlo y adjuntarlo al DOM.",
      noteEn: "template.content stays inert until cloned and attached to the DOM.",
    },
    secondExample: {
      titleEs: "Renderizar listas dinámicas",
      titleEn: "Render dynamic lists",
      code: `<template id="item-template">
  <li class="item">
    <span class="label"></span>
  </li>
</template>
<ul id="list"></ul>
<script>
  const tpl = document.getElementById("item-template");
  const list = document.getElementById("list");
  ["HTML", "CSS", "JS"].forEach((label) => {
    const node = tpl.content.cloneNode(true);
    node.querySelector(".label").textContent = label;
    list.appendChild(node);
  });
</script>`,
      noteEs: "Evita innerHTML manual y conserva estructura consistente.",
      noteEn: "Avoids manual innerHTML while keeping structure consistent.",
    },
    exerciseExample: {
      titleEs: "Modal reutilizable",
      titleEn: "Reusable modal",
      code: `<template id="modal-template">
  <div class="backdrop">
    <div class="modal">
      <h2 class="title"></h2>
      <p class="body"></p>
      <button class="close">Cerrar</button>
    </div>
  </div>
</template>
<script>
  function openModal(title, body) {
    const tpl = document.getElementById("modal-template");
    const fragment = tpl.content.cloneNode(true);
    fragment.querySelector(".title").textContent = title;
    fragment.querySelector(".body").textContent = body;
    fragment.querySelector(".close").addEventListener("click", () => {
      document.body.removeChild(modalNode);
    });
    const modalNode = fragment.firstElementChild;
    document.body.appendChild(modalNode);
  }
</script>`,
      noteEs: "Centraliza el HTML de modales y solo rellena textos dinámicos al abrir.",
      noteEn: "Keeps modal HTML centralized and only fills dynamic text on open.",
    },
    languageOverride: Language.html,
    whatEs: "Guarda marcado listo para clonar sin ejecutarse hasta que lo uses.",
    whatEn: "Stores markup ready to clone without executing until you use it.",
    howEs: "Define el template en el HTML y clónalo con template.content.cloneNode(true) antes de inyectarlo.",
    howEn: "Define the template in HTML and clone it with template.content.cloneNode(true) before injecting.",
  },
  {
    term: "slot",
    translation: "ranura de contenido",
    category: Category.frontend,
    descriptionEs: "Marcador dentro del shadow DOM donde se proyecta contenido hijo de un componente.",
    descriptionEn: "Placeholder inside shadow DOM where child content is projected.",
    aliases: ["<slot>", "web components slot"],
    tags: ["html", "web components", "shadow dom"],
    example: {
      titleEs: "Slot por defecto y nombrado",
      titleEn: "Default and named slot",
      code: `<template id="card-shell">
  <style>
    .card { border: 1px solid #e2e8f0; padding: 1rem; border-radius: 0.75rem; }
    .title { font-weight: 700; }
  </style>
  <article class="card">
    <h3 class="title"><slot name="title">Título</slot></h3>
    <p><slot>Contenido por defecto</slot></p>
    <div class="actions"><slot name="actions"></slot></div>
  </article>
</template>
<script>
  class AppCard extends HTMLElement {
    constructor() {
      super();
      const root = this.attachShadow({ mode: "open" });
      const tpl = document.getElementById("card-shell");
      root.appendChild(tpl.content.cloneNode(true));
    }
  }
  customElements.define("app-card", AppCard);
</script>
<app-card>
  <span slot="title">Resumen</span>
  <span>Detalle corto.</span>
  <button slot="actions">Acción</button>
</app-card>`,
      noteEs: "slot proyecta nodos hijos dentro del shadow DOM preservando accesibilidad.",
      noteEn: "slot projects child nodes into shadow DOM while keeping accessibility.",
    },
    secondExample: {
      titleEs: "Fallback para slot vacío",
      titleEn: "Fallback for empty slot",
      code: `<template id="pill-shell">
  <style>.pill { padding: 0.25rem 0.75rem; border-radius: 999px; background: #e2e8f0; }</style>
  <span class="pill"><slot>Estado pendiente</slot></span>
</template>
<script>
  class AppPill extends HTMLElement {
    constructor() {
      super();
      const root = this.attachShadow({ mode: "open" });
      const tpl = document.getElementById("pill-shell");
      root.appendChild(tpl.content.cloneNode(true));
    }
  }
  customElements.define("app-pill", AppPill);
</script>
<app-pill></app-pill>`,
      noteEs: "Si no se pasa contenido, se muestra el fallback definido dentro del slot.",
      noteEn: "If no content is provided, the fallback defined inside the slot is rendered.",
    },
    exerciseExample: {
      titleEs: "Slot para layout compuesto",
      titleEn: "Slot for composed layout",
      code: `<template id="panel-shell">
  <style>
    .panel { display: grid; gap: 0.5rem; padding: 1rem; border: 1px solid #cbd5e1; }
    .header { display: flex; justify-content: space-between; align-items: center; }
  </style>
  <section class="panel">
    <header class="header">
      <slot name="title">Panel</slot>
      <slot name="toolbar"></slot>
    </header>
    <div class="content"><slot></slot></div>
  </section>
</template>
<app-panel>
  <h2 slot="title">Usuarios</h2>
  <button slot="toolbar">Refrescar</button>
  <p>Lista de usuarios...</p>
</app-panel>`,
      noteEs: "Define slots por región para recomponer layouts sin duplicar HTML.",
      noteEn: "Define region-specific slots to recompose layouts without duplicating HTML.",
    },
    languageOverride: Language.html,
    whatEs: "Expone puntos de inserción en web components para que el consumidor personalice el contenido.",
    whatEn: "Exposes insertion points in web components so consumers customize content.",
    howEs: "Declara slots en tu shadow DOM y usa atributos slot en el contenido hijo que proyectas.",
    howEn: "Declare slots in your shadow DOM and use slot attributes on projected child content.",
  },
];

const voidHtmlElements = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

type AutoSeedConfig = {
  term: string;
  kind: "element" | "attribute" | "event" | "concept" | "inputType" | "legacy";
  translation?: string;
  descriptionEs?: string;
  descriptionEn?: string;
  tags?: string[];
};

function buildHtmlSeed({
  term,
  kind,
  translation,
  descriptionEs,
  descriptionEn,
  tags = [],
}: AutoSeedConfig): SeedTermInput {
  const baseTags = ["html", kind, term].concat(tags).map((t) => t.toLowerCase());
  const resolvedTranslation =
    translation ??
    (kind === "attribute"
      ? `atributo ${term}`
      : kind === "event"
        ? `evento ${term}`
        : kind === "inputType"
          ? `input tipo ${term.replace("input-", "")}`
          : kind === "concept"
            ? `concepto ${term}`
            : kind === "legacy"
              ? `elemento legacy ${term}`
              : `etiqueta ${term}`);

  const descEs =
    descriptionEs ??
    (kind === "attribute"
      ? `Atributo HTML ${term} para configurar comportamiento o accesibilidad.`
      : kind === "event"
        ? `Manejador de evento ${term} que responde a interacciones del usuario o del navegador.`
        : kind === "inputType"
          ? `Tipo de input HTML ${term.replace("input-", "")} para capturar datos específicos.`
          : kind === "concept"
            ? `Concepto de HTML relacionado con ${term}.`
            : kind === "legacy"
              ? `Elemento HTML legado (${term}) que debería evitarse en favor de etiquetas semánticas.`
              : `Elemento HTML <${term}> usado en la estructura de un documento.`);

  const descEn =
    descriptionEn ??
    (kind === "attribute"
      ? `HTML attribute ${term} to configure behavior or accessibility.`
      : kind === "event"
        ? `${term} event handler reacting to user or browser interactions.`
        : kind === "inputType"
          ? `HTML input type ${term.replace("input-", "")} for specific data capture.`
          : kind === "concept"
            ? `HTML concept related to ${term}.`
            : kind === "legacy"
              ? `Legacy HTML element (${term}) that should be avoided in favor of semantic tags.`
              : `HTML element <${term}> used in document structure.`);

  const tagName = term.startsWith("input-") ? "input" : term;
  const isVoid = voidHtmlElements.has(tagName);
  const sampleContent = `Contenido de ${tagName}`;
  const attrSample = kind === "attribute" ? `${term}=\"valor\"` : "";
  const openTag = `<${tagName}${attrSample ? ` ${attrSample}` : ""}>`;
  const closeTag = isVoid ? "" : `</${tagName}>`;

  const defaultExample =
    kind === "event"
      ? `<button ${term}=\"console.log('click')\">Acción</button>`
      : kind === "attribute"
        ? `<div ${term}=\"valor\">${sampleContent}</div>`
        : kind === "inputType"
          ? `<label>
  ${resolvedTranslation}
  <input type=\"${term.replace("input-", "")}\" />
</label>`
          : kind === "concept"
            ? `<section>
  <h2>${resolvedTranslation}</h2>
  <p>${descEs}</p>
</section>`
            : kind === "legacy"
              ? `<${tagName}>${sampleContent}</${tagName}>`
              : `${openTag}${isVoid ? "" : sampleContent + closeTag}`;

  const secondExample =
    kind === "event"
      ? `<script>
  document.querySelector('#action')?.addEventListener('${term.replace("on", "")}', () => {
    console.log('Evento ${term} disparado');
  });
</script>
<button id=\"action\">Disparar</button>`
      : kind === "attribute"
        ? `<img src=\"/logo.png\" ${term}=\"valor\" alt=\"Logo\" />`
        : kind === "inputType"
          ? `<input type=\"${term.replace("input-", "")}\" placeholder=\"${resolvedTranslation}\" />`
          : kind === "concept"
            ? `<article>
  <header>${resolvedTranslation}</header>
  <p>${descEn}</p>
</article>`
            : kind === "legacy"
              ? `<${tagName}>Ejemplo legacy</${tagName}>`
              : isVoid
                ? `${openTag}`
                : `<${tagName} class=\"${tagName}-box\">${sampleContent}</${tagName}>`;

  const exerciseExample =
    kind === "event"
      ? `<button id=\"cta\">CTA</button>
<script>
  const btn = document.getElementById('cta');
  btn?.addEventListener('${term.replace("on", "")}', (event) => {
    event.preventDefault();
    btn.textContent = 'Evento ${term} capturado';
  });
</script>`
      : kind === "attribute"
        ? `<form>
  <label>
    Campo con ${term}
    <input ${term}=\"valor\" />
  </label>
</form>`
        : kind === "inputType"
          ? `<form>
  <label>
    ${resolvedTranslation}
    <input type=\"${term.replace("input-", "")}\" required />
  </label>
</form>`
          : kind === "concept"
            ? `<style>
  main { display: grid; gap: 1rem; }
</style>
<main>
  <section aria-label=\"${resolvedTranslation}\">
    <h2>${resolvedTranslation}</h2>
    <p>${descEs}</p>
  </section>
</main>`
            : kind === "legacy"
              ? `<${tagName}>No recomendado en HTML moderno</${tagName}>
<!-- Sustituir por una alternativa semántica -->`
              : isVoid
                ? `${openTag}
<!-- ${resolvedTranslation} -->`
                : `<${tagName}>
  <p>${descEs}</p>
</${tagName}>`;

  return {
    term,
    translation: resolvedTranslation,
    category: Category.frontend,
    descriptionEs: descEs,
    descriptionEn: descEn,
    aliases: [term],
    tags: baseTags,
    example: {
      titleEs: `Ejemplo ${term}`,
      titleEn: `${term} example`,
      code: defaultExample,
    },
    secondExample: {
      titleEs: `Variación ${term}`,
      titleEn: `${term} variation`,
      code: secondExample,
    },
    exerciseExample: {
      titleEs: `Practica ${term}`,
      titleEn: `${term} practice`,
      code: exerciseExample,
    },
  };
}

const elements = [
  "main",
  "section",
  "article",
  "aside",
  "nav",
  "header",
  "footer",
  "address",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "div",
  "span",
  "p",
  "hr",
  "br",
  "pre",
  "blockquote",
  "figure",
  "figcaption",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "mark",
  "small",
  "del",
  "ins",
  "sub",
  "sup",
  "abbr",
  "dfn",
  "kbd",
  "samp",
  "var",
  "cite",
  "q",
  "code",
  "time",
  "data",
  "s",
  "wbr",
  "img",
  "picture",
  "source",
  "video",
  "audio",
  "track",
  "iframe",
  "embed",
  "object",
  "param",
  "canvas",
  "svg",
  "math",
  "ul",
  "ol",
  "li",
  "dl",
  "dt",
  "dd",
  "table",
  "caption",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "col",
  "colgroup",
  "form",
  "label",
  "input",
  "textarea",
  "button",
  "select",
  "option",
  "optgroup",
  "fieldset",
  "legend",
  "datalist",
  "output",
  "progress",
  "meter",
  "details",
  "summary",
  "dialog",
  "menu",
  "menuitem",
  "command",
];

const inputTypes = [
  "input-text",
  "input-password",
  "input-email",
  "input-number",
  "input-checkbox",
  "input-radio",
  "input-date",
  "input-datetime-local",
  "input-month",
  "input-week",
  "input-time",
  "input-file",
  "input-color",
  "input-url",
  "input-tel",
  "input-range",
  "input-search",
];

const attributes = [
  "id",
  "class",
  "style-attribute",
  "title-attribute",
  "lang",
  "dir",
  "hidden",
  "tabindex",
  "draggable",
  "contenteditable",
  "spellcheck",
  "translate",
  "accesskey",
  "role",
  "part",
  "slot-attribute",
  "exportparts",
  "alt",
  "src",
  "srcset",
  "sizes",
  "loading",
  "decoding",
  "fetchpriority",
  "crossorigin",
  "referrerpolicy",
  "poster",
  "autoplay",
  "controls",
  "loop",
  "muted",
  "preload",
  "playsinline",
  "href",
  "target",
  "rel",
  "download",
  "media",
  "type",
  "hreflang",
  "ping",
  "aria-labelledby",
  "aria-hidden",
  "aria-role",
  "aria-expanded",
  "aria-controls",
  "aria-describedby",
  "aria-selected",
  "aria-disabled",
  "aria-modal",
  "aria-live",
  "aria-busy",
  "value",
  "name",
  "placeholder",
  "required",
  "readonly",
  "disabled",
  "maxlength",
  "minlength",
  "min",
  "max",
  "step",
  "pattern",
  "autocomplete",
  "autofocus",
  "multiple",
  "checked",
  "selected",
  "accept",
  "formenctype",
  "formmethod",
  "formaction",
  "formnovalidate",
  "rows",
  "cols",
  "wrap",
];

const events = [
  "onclick",
  "ondblclick",
  "onmousedown",
  "onmouseup",
  "onmousemove",
  "onmouseenter",
  "onmouseleave",
  "onkeydown",
  "onkeyup",
  "onkeypress",
  "onchange",
  "oninput",
  "oninvalid",
  "onsubmit",
  "onreset",
  "onfocus",
  "onblur",
  "onload",
  "onloadeddata",
  "onloadedmetadata",
  "onerror",
  "onplay",
  "onpause",
  "onseeking",
  "onended",
  "ondrag",
  "ondrop",
  "ondragstart",
  "ondragend",
  "ondragover",
  "onscroll",
  "onresize",
  "onwheel",
];

const concepts = [
  "doctype",
  "html-entities",
  "semantic-html",
  "dom",
  "shadow-dom",
  "custom-elements",
  "content-model",
  "void-elements",
  "self-closing-tags",
  "block-elements",
  "inline-elements",
  "metadata-content",
  "flow-content",
  "phrasing-content",
  "interactive-content",
  "transparent-content",
  "api-html",
  "html5-specification",
];

const legacyElements = [
  "center",
  "font",
  "big",
  "small",
  "strike",
  "tt",
  "acronym",
  "applet",
  "basefont",
  "bgsound",
  "blink",
  "marquee",
  "frameset",
  "frame",
  "noframes",
];

const autogeneratedHtmlTerms: SeedTermInput[] = [
  ...elements.map((term) =>
    buildHtmlSeed({
      term,
      kind: "element",
    }),
  ),
  ...inputTypes.map((term) =>
    buildHtmlSeed({
      term,
      kind: "inputType",
    }),
  ),
  ...attributes.map((term) =>
    buildHtmlSeed({
      term,
      kind: "attribute",
    }),
  ),
  ...events.map((term) =>
    buildHtmlSeed({
      term,
      kind: "event",
    }),
  ),
  ...concepts.map((term) =>
    buildHtmlSeed({
      term,
      kind: "concept",
    }),
  ),
  ...legacyElements.map((term) =>
    buildHtmlSeed({
      term,
      kind: "legacy",
    }),
  ),
];

const baseTermSet = new Set([...curatedTermsBase, ...autogeneratedHtmlTerms].map((item) => item.term.toLowerCase()));

type CssKind =
  | "selector"
  | "pseudo-class"
  | "pseudo-element"
  | "property"
  | "property-logical"
  | "property-legacy"
  | "concept"
  | "at-rule"
  | "function"
  | "unit";

type CssSeedConfig = {
  term: string;
  kind: CssKind;
  translation?: string;
  descriptionEs?: string;
  descriptionEn?: string;
  sampleValue?: string;
  tags?: string[];
};

const cssSampleValue: Record<string, string> = {
  display: "flex",
  "display-flex": "flex",
  "display-grid": "grid",
  width: "100%",
  height: "100%",
  margin: "1rem",
  padding: "1rem",
  gap: "1rem",
  "grid-gap": "1rem",
  "row-gap": "0.75rem",
  "column-gap": "0.75rem",
  "grid-template-columns": "repeat(3, 1fr)",
  "grid-template-rows": "auto 1fr",
  "grid-template-areas": `"header header" "main sidebar"`,
  "grid-auto-flow": "row dense",
  "grid-auto-rows": "minmax(120px, auto)",
  "grid-auto-columns": "1fr",
  "justify-content": "space-between",
  "align-items": "center",
  "place-items": "center",
  "place-content": "center",
  "font-size": "16px",
  "font-family": "Inter, system-ui, sans-serif",
  "font-weight": "600",
  "line-height": "1.5",
  color: "#0f172a",
  "background-color": "#f8fafc",
  "background-image": "linear-gradient(135deg, #0ea5e9, #6366f1)",
  "background-size": "cover",
  "background-position": "center",
  "border-radius": "12px",
  border: "1px solid #e2e8f0",
  "box-shadow": "0 10px 30px rgba(15, 23, 42, 0.12)",
  opacity: "0.9",
  transition: "all 200ms ease",
  "transition-duration": "200ms",
  "transition-property": "transform, opacity",
  "animation-duration": "1.2s",
  "animation-name": "pulse",
  transform: "translateY(-2px)",
  "transform-origin": "center",
  perspective: "1000px",
  "backface-visibility": "hidden",
  "object-fit": "cover",
  "object-position": "center",
  position: "relative",
  inset: "0",
  top: "0",
  left: "0",
  right: "0",
  bottom: "0",
  overflow: "hidden",
  "overflow-x": "auto",
  "overflow-y": "auto",
  "z-index": "10",
  "text-align": "center",
  "text-transform": "uppercase",
  "text-decoration": "underline",
  "letter-spacing": "0.05em",
  "word-break": "break-word",
  "white-space": "nowrap",
  "line-height-step": "1.4",
  "box-sizing": "border-box",
  "isolation": "isolate",
  "filter": "blur(2px)",
  "backdrop-filter": "blur(8px)",
  cursor: "pointer",
  "pointer-events": "none",
  "user-select": "none",
  "scroll-behavior": "smooth",
  "scroll-snap-type": "x mandatory",
  "scroll-snap-align": "center",
  "scroll-margin": "1rem",
  "scroll-padding": "1rem",
  "accent-color": "#22c55e",
};

function cssPropertyValue(term: string) {
  return cssSampleValue[term] ?? "1rem";
}

function buildCssSeed({
  term,
  kind,
  translation,
  descriptionEs,
  descriptionEn,
  sampleValue,
  tags = [],
}: CssSeedConfig): SeedTermInput {
  const baseTags = ["css", kind, term].concat(tags).map((t) => t.toLowerCase());
  const resolvedTranslation =
    translation ??
    (kind === "selector"
      ? `selector ${term}`
      : kind === "pseudo-class"
        ? `pseudo-clase :${term}`
        : kind === "pseudo-element"
          ? `pseudo-elemento ::${term}`
          : kind === "property"
            ? `propiedad CSS ${term}`
            : kind === "property-logical"
              ? `propiedad lógica ${term}`
              : kind === "property-legacy"
                ? `propiedad legacy ${term}`
                : kind === "at-rule"
                  ? `regla @${term}`
                  : kind === "function"
                    ? `función CSS ${term}()`
                    : kind === "unit"
                      ? `unidad CSS ${term}`
                      : `concepto CSS ${term}`);

  const descEs =
    descriptionEs ??
    (kind === "selector"
      ? `Selector CSS ${term} para apuntar nodos específicos del DOM.`
      : kind === "pseudo-class"
        ? `Estado o condición :${term} aplicado en tiempo de ejecución.`
        : kind === "pseudo-element"
          ? `Marca ::${term} para generar contenido o estilos sobre partes del elemento.`
          : kind === "property"
            ? `Propiedad CSS ${term} para ajustar estilo o layout.`
            : kind === "property-logical"
              ? `Propiedad lógica ${term} adaptable a escrituras LTR/RTL.`
              : kind === "property-legacy"
                ? `Propiedad obsoleta ${term}, evita usarla en código nuevo.`
                : kind === "at-rule"
                  ? `Regla @${term} para controlar el comportamiento del CSS.`
                  : kind === "function"
                    ? `Función CSS ${term}() para calcular o interpolar valores.`
                    : kind === "unit"
                      ? `Unidad ${term} para medir longitudes o ángulos en CSS.`
                      : `Concepto clave de CSS: ${term}.`);

  const descEn =
    descriptionEn ??
    (kind === "selector"
      ? `CSS selector ${term} targeting specific DOM nodes.`
      : kind === "pseudo-class"
        ? `Runtime state :${term} applied to elements.`
        : kind === "pseudo-element"
          ? `Pseudo-element ::${term} to style generated content or element parts.`
          : kind === "property"
            ? `CSS property ${term} to adjust style or layout.`
            : kind === "property-logical"
              ? `Logical property ${term} that adapts to LTR/RTL writing.`
              : kind === "property-legacy"
                ? `Legacy property ${term}; avoid in modern code.`
                : kind === "at-rule"
                  ? `@${term} rule controlling CSS behavior.`
                  : kind === "function"
                    ? `CSS function ${term}() to compute or interpolate values.`
                    : kind === "unit"
                      ? `CSS unit ${term} for measurements.`
                      : `Key CSS concept: ${term}.`);

  const cssValue = sampleValue ?? cssPropertyValue(term);
  const selectorLabel = term.includes("selector") ? term.replace("-selector", "") : term;
  const pseudoPrefix = kind === "pseudo-element" ? "::" : ":";
  const selectorExample =
    kind === "selector"
      ? `/* Ejemplo de ${selectorLabel} */\n.card ${selectorLabel === "universal" ? "*" : selectorLabel} {\n  color: #0f172a;\n}`
      : kind === "pseudo-class"
        ? `button${pseudoPrefix}${term} {\n  transform: translateY(-2px);\n}\n`
        : kind === "pseudo-element"
          ? `p${pseudoPrefix}${term} {\n  color: #64748b;\n  content: "${term}";\n}\n`
          : "";

  const propertyExample =
    kind.startsWith("property")
      ? `.card {\n  ${term.includes("display-") ? `display: ${term.replace("display-", "")};` : `${term}: ${cssValue};`}\n}\n`
      : "";

  const baseExample =
    kind === "at-rule"
      ? `@${term} ${term === "media" ? "(min-width: 768px)" : term === "supports" ? "(display: grid)" : ""} {\n  .card { padding: 1rem; }\n}`
      : kind === "function"
        ? `.btn {\n  color: ${term}(var(--value, #0f172a));\n}\n`
        : kind === "unit"
          ? `.spacing { margin: 2${term}; }\n`
          : kind === "concept"
            ? `/* ${term}: ${descEs} */\n.card { color: #0f172a; }\n`
            : "";

  const exampleCode = [selectorExample, propertyExample, baseExample].filter(Boolean).join("\n") || `.card { ${term}: ${cssValue}; }`;

  const secondCode =
    kind === "at-rule"
      ? `@${term} ${term === "keyframes" ? "spin" : "(prefers-reduced-motion: reduce)"} {\n  .card { opacity: 1; }\n}`
      : kind === "function"
        ? `.progress { width: ${term === "clamp" ? "clamp(240px, 50vw, 1200px)" : `${term}(10px, 20px)`}; }\n`
        : kind === "unit"
          ? `.text { font-size: 2${term}; }\n`
          : `.card:hover { ${term.includes("display-") ? `display: ${term.replace("display-", "")};` : `${term}: ${cssValue};`} }`;

  const exerciseCode = `.panel {\n  ${term.includes("display-") ? `display: ${term.replace("display-", "")};` : `${term}: ${cssValue};`}\n  transition: all 200ms ease;\n}\n.panel:hover {\n  ${term.includes("display-") ? `display: ${term.replace("display-", "")};` : `${term}: ${cssValue};`}\n}`;

  return {
    term,
    translation: resolvedTranslation,
    category: Category.frontend,
    descriptionEs: descEs,
    descriptionEn: descEn,
    aliases: [term, kind.startsWith("pseudo") ? `${pseudoPrefix}${term}` : term],
    tags: baseTags,
    example: {
      titleEs: `Ejemplo ${term}`,
      titleEn: `${term} example`,
      code: exampleCode,
    },
    secondExample: {
      titleEs: `Variación ${term}`,
      titleEn: `${term} variation`,
      code: secondCode,
    },
    exerciseExample: {
      titleEs: `Práctica ${term}`,
      titleEn: `${term} practice`,
      code: exerciseCode,
    },
  };
}

const cssSelectors = [
  "universal-selector",
  "type-selector",
  "class-selector",
  "id-selector",
  "attribute-selector",
  "child-selector",
  "descendant-selector",
  "sibling-selector",
  "adjacent-sibling-selector",
  "group-selector",
  "pseudo-class-selector",
  "pseudo-element-selector",
  "negation-selector",
];

const cssPseudoClasses = [
  "hover",
  "active",
  "focus",
  "focus-visible",
  "focus-within",
  "visited",
  "link",
  "checked",
  "disabled",
  "enabled",
  "required",
  "optional",
  "placeholder-shown",
  "read-only",
  "read-write",
  "target",
  "first-child",
  "last-child",
  "only-child",
  "nth-child",
  "nth-last-child",
  "first-of-type",
  "last-of-type",
  "only-of-type",
  "nth-of-type",
  "nth-last-of-type",
  "root",
  "empty",
  "not",
  "is",
  "where",
  "has",
  "valid",
  "invalid",
  "in-range",
  "out-of-range",
  "fullscreen",
];

const cssPseudoElements = [
  "before",
  "after",
  "first-letter",
  "first-line",
  "selection",
  "placeholder",
  "marker",
  "backdrop",
  "cue",
  "spelling-error",
  "grammar-error",
];

const cssBoxProperties = [
  "width",
  "height",
  "min-width",
  "max-width",
  "min-height",
  "max-height",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "border",
  "border-width",
  "border-style",
  "border-color",
  "border-radius",
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
  "border-image",
  "border-collapse",
  "box-sizing",
  "box-shadow",
  "outline",
  "outline-width",
  "outline-style",
  "outline-color",
  "outline-offset",
];

const cssDisplayLayout = [
  "display",
  "visibility",
  "opacity",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "z-index",
  "float",
  "clear",
  "overflow",
  "overflow-x",
  "overflow-y",
  "object-fit",
  "object-position",
  "isolation",
];

const cssFlexbox = [
  "display-flex",
  "flex",
  "flex-direction",
  "flex-wrap",
  "flex-flow",
  "justify-content",
  "align-items",
  "align-content",
  "align-self",
  "order",
  "flex-grow",
  "flex-shrink",
  "flex-basis",
];

const cssGrid = [
  "display-grid",
  "grid-template-columns",
  "grid-template-rows",
  "grid-template-areas",
  "grid-auto-columns",
  "grid-auto-rows",
  "grid-auto-flow",
  "grid-column",
  "grid-row",
  "grid-column-start",
  "grid-column-end",
  "grid-row-start",
  "grid-row-end",
  "grid-gap",
  "row-gap",
  "column-gap",
  "place-items",
  "place-content",
  "place-self",
  "justify-items",
  "justify-self",
  "align-items",
  "align-self",
];

const cssTypography = [
  "font",
  "font-family",
  "font-size",
  "font-style",
  "font-weight",
  "font-variant",
  "font-feature-settings",
  "font-stretch",
  "line-height",
  "letter-spacing",
  "word-spacing",
  "text-align",
  "text-decoration",
  "text-decoration-color",
  "text-decoration-style",
  "text-decoration-thickness",
  "text-transform",
  "text-indent",
  "text-rendering",
  "white-space",
  "word-break",
  "overflow-wrap",
  "hyphens",
  "direction",
  "unicode-bidi",
  "vertical-align",
];

const cssColorBackground = [
  "color",
  "background",
  "background-color",
  "background-image",
  "background-position",
  "background-size",
  "background-repeat",
  "background-origin",
  "background-clip",
  "background-attachment",
  "mix-blend-mode",
  "background-blend-mode",
  "opacity",
  "filter",
  "backdrop-filter",
];

const cssAnimation = [
  "transition",
  "transition-property",
  "transition-duration",
  "transition-delay",
  "transition-timing-function",
  "animation",
  "animation-name",
  "animation-duration",
  "animation-timing-function",
  "animation-delay",
  "animation-iteration-count",
  "animation-direction",
  "animation-fill-mode",
  "animation-play-state",
];

const cssTransform = [
  "transform",
  "transform-origin",
  "transform-style",
  "perspective",
  "perspective-origin",
  "backface-visibility",
];

const cssUnits = [
  "px",
  "%",
  "em",
  "rem",
  "vh",
  "vw",
  "vmin",
  "vmax",
  "ch",
  "ex",
  "cm",
  "mm",
  "in",
  "pt",
  "pc",
  "fr",
  "deg",
  "rad",
  "turn",
  "s",
  "ms",
];

const cssFunctions = [
  "var",
  "calc",
  "min",
  "max",
  "clamp",
  "rgb",
  "rgba",
  "hsl",
  "hsla",
  "url",
  "attr",
  "env",
  "linear-gradient",
  "radial-gradient",
  "conic-gradient",
  "repeating-linear-gradient",
  "repeating-radial-gradient",
];

const cssAtRules = [
  "media",
  "keyframes",
  "font-face",
  "supports",
  "import",
  "charset",
  "page",
  "namespace",
  "container",
  "layer",
  "counter-style",
  "property",
];

const cssCursorUi = [
  "cursor",
  "pointer-events",
  "touch-action",
  "caret-color",
  "caret-shape",
  "appearance",
  "accent-color",
  "resize",
  "user-select",
  "scroll-behavior",
  "scroll-snap-type",
  "scroll-snap-align",
  "scroll-margin",
  "scroll-padding",
];

const cssFilters = [
  "filter",
  "blur",
  "brightness",
  "contrast",
  "drop-shadow",
  "grayscale",
  "hue-rotate",
  "invert",
  "saturate",
  "sepia",
  "backdrop-filter",
];

const cssLogical = [
  "margin-inline",
  "margin-block",
  "padding-inline",
  "padding-block",
  "border-inline",
  "border-block",
  "inset-inline",
  "inset-block",
];

const cssLegacy = [
  "clip",
  "zoom",
  "filter-progid",
  "word-wrap",
  "big",
  "strike",
  "tt",
  "acronym",
  "applet",
  "basefont",
  "bgsound",
  "blink",
  "marquee",
  "frameset",
  "frame",
  "noframes",
];

const cssConcepts = [
  "cascade",
  "specificity",
  "inheritance",
  "initial-value",
  "computed-value",
  "custom-properties",
  "shorthand-properties",
  "important-flag",
  "vendor-prefixes",
  "box-model",
  "stacking-context",
  "replaced-elements",
  "css-variables",
];

const autogeneratedCssTerms: SeedTermInput[] = [
  ...cssSelectors.map((term) =>
    buildCssSeed({
      term,
      kind: "selector",
    }),
  ),
  ...cssPseudoClasses.map((term) =>
    buildCssSeed({
      term,
      kind: "pseudo-class",
    }),
  ),
  ...cssPseudoElements.map((term) =>
    buildCssSeed({
      term,
      kind: "pseudo-element",
    }),
  ),
  ...cssBoxProperties.map((term) =>
    buildCssSeed({
      term,
      kind: "property",
    }),
  ),
  ...cssDisplayLayout.map((term) =>
    buildCssSeed({
      term,
      kind: "property",
    }),
  ),
  ...cssFlexbox.map((term) =>
    buildCssSeed({
      term,
      kind: "property",
    }),
  ),
  ...cssGrid.map((term) =>
    buildCssSeed({
      term,
      kind: "property",
    }),
  ),
  ...cssTypography.map((term) =>
    buildCssSeed({
      term,
      kind: "property",
    }),
  ),
  ...cssColorBackground.map((term) =>
    buildCssSeed({
      term,
      kind: "property",
    }),
  ),
  ...cssAnimation.map((term) =>
    buildCssSeed({
      term,
      kind: "property",
    }),
  ),
  ...cssTransform.map((term) =>
    buildCssSeed({
      term,
      kind: "property",
    }),
  ),
  ...cssUnits.map((term) =>
    buildCssSeed({
      term,
      kind: "unit",
      translation: `unidad ${term}`,
      sampleValue: `2${term}`,
    }),
  ),
  ...cssFunctions.map((term) =>
    buildCssSeed({
      term,
      kind: "function",
    }),
  ),
  ...cssAtRules.map((term) =>
    buildCssSeed({
      term,
      kind: "at-rule",
    }),
  ),
  ...cssCursorUi.map((term) =>
    buildCssSeed({
      term,
      kind: "property",
    }),
  ),
  ...cssFilters.map((term) =>
    buildCssSeed({
      term,
      kind: "property",
    }),
  ),
  ...cssLogical.map((term) =>
    buildCssSeed({
      term,
      kind: "property-logical",
    }),
  ),
  ...cssLegacy.map((term) =>
    buildCssSeed({
      term,
      kind: "property-legacy",
    }),
  ),
  ...cssConcepts.map((term) =>
    buildCssSeed({
      term,
      kind: "concept",
    }),
  ),
];

const dedupedCssTerms = autogeneratedCssTerms.filter((term) => !baseTermSet.has(term.term.toLowerCase()));

const cssTermSet = new Set([...baseTermSet, ...dedupedCssTerms.map((item) => item.term.toLowerCase())]);

type JsKind =
  | "async"
  | "array-method"
  | "concept"
  | "data-structure"
  | "date"
  | "dom"
  | "error"
  | "global"
  | "json"
  | "keyword"
  | "module"
  | "node"
  | "number-math"
  | "operator"
  | "pattern"
  | "primitive"
  | "regex"
  | "string-method"
  | "syntax"
  | "web-api";

type JsDocOverride = {
  translation?: string;
  descriptionEs?: string;
  descriptionEn?: string;
  whatEs?: string;
  whatEn?: string;
  howEs?: string;
  howEn?: string;
  example?: ExampleSnippet;
  secondExample?: ExampleSnippet;
  exerciseExample?: ExampleSnippet;
  tags?: string[];
};

const jsCategoryByKind: Record<JsKind, Category> = {
  keyword: Category.general,
  operator: Category.general,
  primitive: Category.general,
  global: Category.general,
  "array-method": Category.general,
  "string-method": Category.general,
  "number-math": Category.general,
  date: Category.general,
  regex: Category.general,
  async: Category.general,
  dom: Category.frontend,
  "web-api": Category.frontend,
  module: Category.general,
  error: Category.general,
  "data-structure": Category.general,
  pattern: Category.general,
  syntax: Category.general,
  node: Category.backend,
  json: Category.general,
  concept: Category.general,
};

const jsKindMeta: Record<
  JsKind,
  {
    translation: (term: string) => string;
    descriptionEs: (term: string) => string;
    descriptionEn: (term: string) => string;
    whatEs: (term: string) => string;
    whatEn: (term: string) => string;
    howEs: (term: string) => string;
    howEn: (term: string) => string;
    tags?: string[];
  }
> = {
  keyword: {
    translation: (term) => `palabra clave ${term} en JavaScript`,
    descriptionEs: (term) => `Palabra reservada "${term}" usada en la sintaxis principal de JavaScript.`,
    descriptionEn: (term) => `"${term}" reserved keyword used by the JavaScript syntax.`,
    whatEs: (term) => `Define control de flujo, declaraciones o metaprogramación usando "${term}".`,
    whatEn: (term) => `Sets control flow, declarations, or metaprogramming using "${term}".`,
    howEs: (term) => `Incluye "${term}" dentro de funciones, clases o bloques respetando el scope y el modo estricto.`,
    howEn: (term) => `Place "${term}" inside functions, classes, or blocks while respecting scope and strict mode.`,
    tags: ["javascript", "syntax", "keyword"],
  },
  operator: {
    translation: (term) => `operador ${term} en JavaScript`,
    descriptionEs: (term) => `Operador "${term}" para componer expresiones y evaluarlas en tiempo de ejecución.`,
    descriptionEn: (term) => `"${term}" operator to build expressions evaluated at runtime.`,
    whatEs: (term) => `Combina valores y expresiones con el operador "${term}" para obtener resultados lógicos o numéricos.`,
    whatEn: (term) => `Combine values and expressions with the "${term}" operator to get logical or numeric results.`,
    howEs: (term) => `Usa "${term}" en expresiones legibles y agrega paréntesis para claridad cuando mezclas operadores.`,
    howEn: (term) => `Use "${term}" in readable expressions and add parentheses for clarity when mixing operators.`,
    tags: ["javascript", "operator", "syntax"],
  },
  primitive: {
    translation: (term) => `tipo primitivo ${term}`,
    descriptionEs: (term) => `"${term}" es un tipo primitivo base en JavaScript.`,
    descriptionEn: (term) => `"${term}" is a primitive type in JavaScript.`,
    whatEs: (term) => `Representa valores atómicos como "${term}" que no son objetos ni métodos.`,
    whatEn: (term) => `Represents atomic values like "${term}" that are not objects and have no methods.`,
    howEs: () => "Declara y compara primitivos directamente o con typeof/=== para validaciones.",
    howEn: () => "Declare and compare primitives directly or with typeof/=== for validation.",
    tags: ["javascript", "primitives"],
  },
  global: {
    translation: (term) => `objeto global ${term}`,
    descriptionEs: (term) => `"${term}" es un objeto global disponible en el runtime de JavaScript.`,
    descriptionEn: (term) => `"${term}" is a global object available in the JavaScript runtime.`,
    whatEs: (term) => `Expones utilidades nativas con "${term}" sin importar el entorno (navegador o Node).`,
    whatEn: (term) => `Expose native utilities via "${term}" regardless of environment (browser or Node).`,
    howEs: (term) => `Accede a "${term}" directamente y revisa la compatibilidad del entorno antes de usarlo en producción.`,
    howEn: (term) => `Access "${term}" directly and check environment compatibility before shipping to production.`,
    tags: ["javascript", "standard-library"],
  },
  "array-method": {
    translation: (term) => `método de Array ${term}`,
    descriptionEs: (term) => `Método de Array "${term}" para transformar, consultar o mutar colecciones.`,
    descriptionEn: (term) => `Array method "${term}" to transform, query, or mutate collections.`,
    whatEs: (term) => `Aplica "${term}" sobre listas para mapear, filtrar, buscar o modificar elementos.`,
    whatEn: (term) => `Use "${term}" on lists to map, filter, search, or mutate elements.`,
    howEs: () => "Trabaja con callbacks puros y evita mutaciones cuando no son necesarias.",
    howEn: () => "Prefer pure callbacks and avoid mutations when they are not needed.",
    tags: ["javascript", "array"],
  },
  "string-method": {
    translation: (term) => `método de String ${term}`,
    descriptionEs: (term) => `Método de String "${term}" para inspeccionar o transformar texto.`,
    descriptionEn: (term) => `String method "${term}" to inspect or transform text.`,
    whatEs: (term) => `Usa "${term}" para buscar, cortar o limpiar cadenas.`,
    whatEn: (term) => `Use "${term}" to search, slice, or sanitize strings.`,
    howEs: () => "Normaliza mayúsculas/minúsculas cuando compares y evita mutar cadenas originales.",
    howEn: () => "Normalize casing when comparing and avoid mutating original strings.",
    tags: ["javascript", "string"],
  },
  "number-math": {
    translation: (term) => `API numérica ${term}`,
    descriptionEs: (term) => `Método numérico o función Math "${term}" para calcular valores.`,
    descriptionEn: (term) => `Numeric method or Math helper "${term}" to compute values.`,
    whatEs: (term) => `Sirve para formatear, redondear o calcular con "${term}".`,
    whatEn: (term) => `Used to format, round, or compute numbers with "${term}".`,
    howEs: () => "Controla la precisión y redondeo; evita errores flotantes sumando pequeñas tolerancias.",
    howEn: () => "Handle precision/rounding; avoid floating errors by adding small tolerances.",
    tags: ["javascript", "math", "numbers"],
  },
  date: {
    translation: (term) => `API de fecha ${term}`,
    descriptionEs: (term) => `Método de Date "${term}" para leer o escribir partes de una fecha.`,
    descriptionEn: (term) => `Date method "${term}" to read or write parts of a date.`,
    whatEs: () => "Manipula fechas y zonas horarias usando objetos Date.",
    whatEn: () => "Manipulate dates and time zones using Date objects.",
    howEs: () => "Siempre crea Date en UTC o ajusta la zona con toISOString para evitar desfases.",
    howEn: () => "Create Date in UTC or use toISOString to avoid offsets.",
    tags: ["javascript", "date"],
  },
  regex: {
    translation: (term) => `API regex ${term}`,
    descriptionEs: (term) => `Método o propiedad regex "${term}" para buscar o reemplazar patrones.`,
    descriptionEn: (term) => `Regex method or property "${term}" to search or replace patterns.`,
    whatEs: () => "Trabaja con expresiones regulares para validar, extraer o reemplazar texto.",
    whatEn: () => "Use regular expressions to validate, extract, or replace text.",
    howEs: () => "Declara flags explícitamente (g, i, m) y prueba patrones con test cases.",
    howEn: () => "Declare flags explicitly (g, i, m) and test patterns with sample cases.",
    tags: ["javascript", "regex"],
  },
  async: {
    translation: (term) => `asincronía ${term}`,
    descriptionEs: (term) => `API asíncrona "${term}" para coordinar tareas no bloqueantes.`,
    descriptionEn: (term) => `Async API "${term}" to orchestrate non-blocking tasks.`,
    whatEs: (term) => `Permite programar timers, promesas o microtareas con "${term}".`,
    whatEn: (term) => `Lets you schedule timers, promises, or microtasks with "${term}".`,
    howEs: () => "Encadena promesas con .then/.catch o usa async/await con try/catch.",
    howEn: () => "Chain promises with .then/.catch or use async/await with try/catch.",
    tags: ["javascript", "async"],
  },
  dom: {
    translation: (term) => `API del DOM ${term}`,
    descriptionEs: (term) => `Método o propiedad del DOM "${term}" para manipular el documento.`,
    descriptionEn: (term) => `DOM method or property "${term}" to manipulate the document.`,
    whatEs: () => "Accede o modifica nodos y eventos del árbol DOM.",
    whatEn: () => "Access or mutate nodes and events in the DOM tree.",
    howEs: () => "Consulta con selectores seguros, limpia listeners al desmontar y evita innerHTML inseguro.",
    howEn: () => "Query with safe selectors, clean listeners on unmount, and avoid unsafe innerHTML.",
    tags: ["javascript", "dom", "frontend"],
  },
  "web-api": {
    translation: (term) => `Web API ${term}`,
    descriptionEs: (term) => `API del navegador "${term}" para capacidades de plataforma.`,
    descriptionEn: (term) => `Browser Web API "${term}" exposing platform capabilities.`,
    whatEs: (term) => `Expone funciones del navegador como red, almacenamiento o sensores mediante "${term}".`,
    whatEn: (term) => `Exposes browser features like networking, storage, or sensors via "${term}".`,
    howEs: () => "Valida compatibilidad, maneja permisos y encapsula accesos en helpers.",
    howEn: () => "Check compatibility, handle permissions, and wrap usage in helpers.",
    tags: ["javascript", "web", "api"],
  },
  module: {
    translation: (term) => `módulos ES ${term}`,
    descriptionEs: (term) => `Sintaxis de módulos ES "${term}" para importar o exportar código.`,
    descriptionEn: (term) => `ES module syntax "${term}" to import or export code.`,
    whatEs: (term) => `Organiza dependencias con "${term}" manteniendo archivos reutilizables.`,
    whatEn: (term) => `Organize dependencies with "${term}" keeping files reusable.`,
    howEs: () => "Usa rutas relativas o alias, exporta lo mínimo y agrupa APIs claras.",
    howEn: () => "Use relative paths or aliases, export minimal APIs, and keep imports explicit.",
    tags: ["javascript", "modules"],
  },
  error: {
    translation: (term) => `manejo de errores ${term}`,
    descriptionEs: (term) => `Herramienta de debugging/errores "${term}" para diagnosticar problemas.`,
    descriptionEn: (term) => `Debugging/error tool "${term}" to diagnose issues.`,
    whatEs: () => "Detecta, lanza y registra errores de forma consistente.",
    whatEn: () => "Detect, throw, and log errors consistently.",
    howEs: () => "Envuélvelos en try/catch, agrega contexto y usa console con etiquetas.",
    howEn: () => "Wrap in try/catch, add context, and log with console labels.",
    tags: ["javascript", "debug"],
  },
  "data-structure": {
    translation: (term) => `estructura de datos ${term}`,
    descriptionEs: (term) => `Estructura de datos nativa "${term}" para manejar memoria y referencias.`,
    descriptionEn: (term) => `Native data structure "${term}" to handle memory and references.`,
    whatEs: () => "Administra colecciones, referencias débiles o buffers binarios.",
    whatEn: () => "Manage collections, weak references, or binary buffers.",
    howEs: () => "Inicializa con valores claros y documenta si es débil o mutable.",
    howEn: () => "Initialize with clear values and document whether it's weak or mutable.",
    tags: ["javascript", "data-structures"],
  },
  pattern: {
    translation: (term) => `patrón ${term} en JavaScript`,
    descriptionEs: (term) => `Patrón de programación "${term}" aplicado en JS.`,
    descriptionEn: (term) => `Programming pattern "${term}" applied in JS.`,
    whatEs: (term) => `Describe cómo estructurar código con el patrón "${term}".`,
    whatEn: (term) => `Explains how to structure code using the "${term}" pattern.`,
    howEs: () => "Implementa el patrón con funciones puras, módulos o eventos según el caso.",
    howEn: () => "Implement the pattern with pure functions, modules, or events as needed.",
    tags: ["javascript", "patterns"],
  },
  syntax: {
    translation: (term) => `sintaxis avanzada ${term}`,
    descriptionEs: (term) => `Constructo de sintaxis "${term}" para escribir JS moderno.`,
    descriptionEn: (term) => `Syntax construct "${term}" to write modern JS.`,
    whatEs: (term) => `Permite escribir código expresivo con "${term}".`,
    whatEn: (term) => `Lets you write expressive code with "${term}".`,
    howEs: () => "Combina la sintaxis con types o linters para mantener legibilidad.",
    howEn: () => "Combine the syntax with types or linters to keep readability high.",
    tags: ["javascript", "syntax"],
  },
  node: {
    translation: (term) => `Node.js ${term}`,
    descriptionEs: (term) => `"${term}" es parte del runtime o núcleo de Node.js.`,
    descriptionEn: (term) => `"${term}" belongs to Node.js runtime or core modules.`,
    whatEs: () => "Expone APIs de servidor, sistema de archivos o procesos en Node.",
    whatEn: () => "Exposes server, filesystem, or process APIs in Node.",
    howEs: () => "Importa con require o ES Modules y maneja callbacks/streams de forma segura.",
    howEn: () => "Import with require or ES Modules and handle callbacks/streams safely.",
    tags: ["node", "backend", "javascript"],
  },
  json: {
    translation: (term) => `utilidad JSON ${term}`,
    descriptionEs: (term) => `Función de serialización/parseo "${term}" para JSON o URL.`,
    descriptionEn: (term) => `Serialization/parsing helper "${term}" for JSON or URLs.`,
    whatEs: () => "Convierte estructuras a texto o decodifica datos para transporte.",
    whatEn: () => "Convert structures to text or decode data for transport.",
    howEs: () => "Valida esquemas antes de parsear y captura errores para evitar caídas.",
    howEn: () => "Validate schemas before parsing and catch errors to prevent crashes.",
    tags: ["javascript", "json"],
  },
  concept: {
    translation: (term) => `concepto clave ${term}`,
    descriptionEs: (term) => `Concepto fundamental "${term}" del runtime de JavaScript.`,
    descriptionEn: (term) => `Core runtime concept "${term}" in JavaScript.`,
    whatEs: (term) => `Ayuda a entender el rendimiento y comportamiento de JS: ${term}.`,
    whatEn: (term) => `Helps you understand JS performance and behavior: ${term}.`,
    howEs: () => "Relaciona el concepto con ejemplos de código y profiling.",
    howEn: () => "Relate the concept to code examples and profiling.",
    tags: ["javascript", "concepts"],
  },
};

function buildJsSnippets(term: string, kind: JsKind) {
  const clean = term.trim();
  const titleBaseEs = `Ejemplo ${clean}`;
  const titleBaseEn = `${clean} example`;
  const variantTitleEs = `Variación ${clean}`;
  const variantTitleEn = `${clean} variation`;
  const practiceTitleEs = `Práctica ${clean}`;
  const practiceTitleEn = `${clean} practice`;

  const notes: Record<JsKind, { es: string; en: string }> = {
    keyword: {
      es: "Palabra reservada, respeta el modo estricto y el scope.",
      en: "Reserved word, respect strict mode and scope.",
    },
    operator: {
      es: "Agrupa operaciones con paréntesis para legibilidad.",
      en: "Group operations with parentheses for readability.",
    },
    primitive: {
      es: "Los primitivos son inmutables; compara con ===.",
      en: "Primitives are immutable; compare with ===.",
    },
    global: {
      es: "APIs nativas disponibles sin importar entorno.",
      en: "Native APIs available across environments.",
    },
    "array-method": {
      es: "Prefiere métodos inmutables al transformar colecciones.",
      en: "Prefer immutable methods when transforming collections.",
    },
    "string-method": {
      es: "Las cadenas son inmutables; cada método retorna una nueva.",
      en: "Strings are immutable; methods return new values.",
    },
    "number-math": {
      es: "Cuida el redondeo y los flotantes.",
      en: "Watch rounding and floating point quirks.",
    },
    date: {
      es: "Usa UTC para evitar desfases de zona horaria.",
      en: "Use UTC to avoid timezone drift.",
    },
    regex: {
      es: "Prueba tus patrones con casos simples y edge cases.",
      en: "Test your patterns with simple and edge cases.",
    },
    async: {
      es: "Maneja errores con catch y cancela cuando sea posible.",
      en: "Handle errors with catch and cancel when possible.",
    },
    dom: {
      es: "Limpia listeners y evita mutar el DOM en bucles pesados.",
      en: "Clean listeners and avoid heavy DOM mutations in loops.",
    },
    "web-api": {
      es: "Valida compatibilidad y permisos de cada API.",
      en: "Validate compatibility and permissions for each API.",
    },
    module: {
      es: "Usa imports explícitos para tree-shaking efectivo.",
      en: "Use explicit imports to enable effective tree shaking.",
    },
    error: {
      es: "Agrega contexto a cada error y registra métricas.",
      en: "Add context to each error and log metrics.",
    },
    "data-structure": {
      es: "Elige la estructura según mutabilidad y performance.",
      en: "Pick structures based on mutability and performance.",
    },
    pattern: {
      es: "Aplica el patrón con funciones pequeñas y testeables.",
      en: "Apply the pattern with small, testable functions.",
    },
    syntax: {
      es: "Mezcla la sintaxis moderna con linters para legibilidad.",
      en: "Blend modern syntax with linters for readability.",
    },
    node: {
      es: "Revisa la versión de Node para APIs experimentales.",
      en: "Check Node version for experimental APIs.",
    },
    json: {
      es: "Captura errores de parseo y valida esquemas.",
      en: "Catch parse errors and validate schemas.",
    },
    concept: {
      es: "Conecta el concepto con ejemplos y diagramas mentales.",
      en: "Connect the concept with examples and mental models.",
    },
  };

  const baseNote = notes[kind];

  const sample = getJsCodeSample(clean, kind);

  return {
    example: {
      titleEs: titleBaseEs,
      titleEn: titleBaseEn,
      code: sample.example,
      noteEs: baseNote.es,
      noteEn: baseNote.en,
    },
    secondExample: {
      titleEs: variantTitleEs,
      titleEn: variantTitleEn,
      code: sample.variant,
      noteEs: baseNote.es,
      noteEn: baseNote.en,
    },
    exerciseExample: {
      titleEs: practiceTitleEs,
      titleEn: practiceTitleEn,
      code: sample.exercise,
      noteEs: baseNote.es,
      noteEn: baseNote.en,
    },
  };
}

function getJsCodeSample(term: string, kind: JsKind): { example: string; variant: string; exercise: string } {
  switch (kind) {
    case "keyword":
      return keywordSnippet(term);
    case "operator":
      return operatorSnippet(term);
    case "primitive":
      return primitiveSnippet(term);
    case "global":
      return globalSnippet(term);
    case "array-method":
      return arrayMethodSnippet(term);
    case "string-method":
      return stringMethodSnippet(term);
    case "number-math":
      return numberMathSnippet(term);
    case "date":
      return dateSnippet(term);
    case "regex":
      return regexSnippet(term);
    case "async":
      return asyncSnippet(term);
    case "dom":
      return domSnippet(term);
    case "web-api":
      return webApiSnippet(term);
    case "module":
      return moduleSnippet(term);
    case "error":
      return errorSnippet(term);
    case "data-structure":
      return dataStructureSnippet(term);
    case "pattern":
      return patternSnippet(term);
    case "syntax":
      return syntaxSnippet(term);
    case "node":
      return nodeSnippet(term);
    case "json":
      return jsonSnippet(term);
    case "concept":
      return conceptSnippet(term);
    default:
      return defaultSnippet(term);
  }
}

function defaultSnippet(term: string) {
  const base = `// Ejemplo de ${term}\nconst demo = "${term}";\nconsole.log(demo);`;
  return {
    example: base,
    variant: `${base}\n// Variación: úsalo dentro de una función\nfunction use${toPascal(term)}() { return demo; }`,
    exercise: `${base}\n// Práctica: explica qué hace "${term}" en tu propio snippet.`,
  };
}

function keywordSnippet(term: string) {
  switch (term) {
    case "let":
    case "const":
      return {
        example: `${term} counter = 0;\ncounter += 1;`,
        variant: `${term} user = { name: "Ada", active: true };\nconsole.log(user.name);`,
        exercise: `function toggle(flag) {\n  ${term} enabled = flag ?? false;\n  return enabled;\n}`,
      };
    case "var":
      return {
        example: `function legacy() {\n  var message = "var tiene scope de función";\n  return message;\n}`,
        variant: `for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}`,
        exercise: `// Practica evitando hoisting sorpresa\nfunction demoVar() {\n  console.log(value);\n  var value = 3;\n}`,
      };
    case "function":
      return {
        example: `function greet(name) {\n  return \`Hola \${name}\`;\n}\nconsole.log(greet("Linus"));`,
        variant: `const greet = function (name) {\n  return \`Hola \${name}\`;\n};`,
        exercise: `const add = new Function("a", "b", "return a + b");\nconsole.log(add(2, 3));`,
      };
    case "return":
      return {
        example: `function sum(a, b) {\n  return a + b;\n}`,
        variant: `const double = (n) => {\n  if (n < 0) return 0;\n  return n * 2;\n};`,
        exercise: `function safeDivide(a, b) {\n  if (b === 0) return null;\n  return a / b;\n}`,
      };
    case "if":
    case "else":
      return {
        example: `const isAdult = (age) => {\n  if (age >= 18) return true;\n  else return false;\n};`,
        variant: `let status = "idle";\nif (loading) status = "loading";\nelse if (error) status = "error";`,
        exercise: `function guard(user) {\n  if (!user) return "anon";\n  return user.name;\n}`,
      };
    case "switch":
    case "case":
    case "default":
      return {
        example: `function badge(role) {\n  switch (role) {\n    case "admin":\n      return "🛡️";\n    case "editor":\n      return "✏️";\n    default:\n      return "👤";\n  }\n}`,
        variant: `const httpStatus = (code) => {\n  switch (code) {\n    case 200:\n    case 204:\n      return "ok";\n    case 404:\n      return "not-found";\n    default:\n      return "error";\n  }\n};`,
        exercise: `function featureFlag(flag) {\n  switch (flag) {\n    case true:\n      return "on";\n    default:\n      return "off";\n  }\n}`,
      };
    case "break":
    case "continue":
      return {
        example: `for (const item of [1, 2, 3, 0, 4]) {\n  if (item === 0) break;\n  console.log(item);\n}`,
        variant: `for (const n of [1, 2, 3]) {\n  if (n % 2 === 0) continue;\n  console.log("impar", n);\n}`,
        exercise: `function findFirstEven(nums) {\n  for (const n of nums) {\n    if (n % 2 !== 0) continue;\n    return n;\n  }\n  return null;\n}`,
      };
    case "for":
      return {
        example: `for (let i = 0; i < 3; i++) {\n  console.log(i);\n}`,
        variant: `for (const name of ["Ada", "Linus"]) {\n  console.log(name);\n}`,
        exercise: `const users = [{ id: 1 }, { id: 2 }];\nfor (let index = 0; index < users.length; index++) {\n  users[index].seen = true;\n}`,
      };
    case "while":
      return {
        example: `let total = 0;\nwhile (total < 3) {\n  total++;\n}`,
        variant: `let retries = 0;\nwhile (retries < 2 && !isReady()) {\n  retries++;\n}`,
        exercise: `function poll(fn) {\n  let attempts = 0;\n  while (attempts < 3 && !fn()) {\n    attempts++;\n  }\n  return attempts;\n}`,
      };
    case "do":
      return {
        example: `let count = 0;\ndo {\n  count++;\n} while (count < 2);`,
        variant: `do {\n  console.log("Siempre corre al menos una vez");\n} while (false);`,
        exercise: `function repeatUntil(fn) {\n  let done;\n  do {\n    done = fn();\n  } while (!done);\n}`,
      };
    case "try":
    case "catch":
    case "finally":
    case "throw":
      return {
        example: `try {\n  JSON.parse("{ bad json }");\n} catch (error) {\n  console.error("Parse falló", error);\n} finally {\n  console.log("Listo para limpiar recursos");\n}`,
        variant: `function assert(condition, message) {\n  if (!condition) throw new Error(message);\n}\ntry {\n  assert(false, "Debe ser verdadero");\n} catch (err) {\n  console.warn("Capturado:", err.message);\n}`,
        exercise: `async function loadUser() {\n  try {\n    const res = await fetch("/api/user");\n    if (!res.ok) throw new Error("HTTP " + res.status);\n    return res.json();\n  } finally {\n    console.log("Finalizó petición");\n  }\n}`,
      };
    case "class":
    case "extends":
    case "constructor":
    case "super":
      return {
        example: `class Person {\n  constructor(name) {\n    this.name = name;\n  }\n  greet() { return \`Hola \${this.name}\`; }\n}\nclass Admin extends Person {\n  constructor(name) {\n    super(name);\n    this.role = "admin";\n  }\n}\nconst ada = new Admin("Ada");`,
        variant: `class Rectangle {\n  constructor(width, height) {\n    this.width = width;\n    this.height = height;\n  }\n  get area() {\n    return this.width * this.height;\n  }\n}`,
        exercise: `class Service {\n  constructor(http) { this.http = http; }\n  async fetchData() { return this.http("/api"); }\n}\nclass MockService extends Service {\n  constructor() { super(() => Promise.resolve({ ok: true })); }\n}`,
      };
    case "import":
    case "export":
    case "from":
    case "as":
      return moduleSnippet("import/export");
    case "async":
    case "await":
      return {
        example: `async function load() {\n  const res = await fetch("/api");\n  return res.json();\n}`,
        variant: `const read = async () => {\n  try {\n    const res = await fetch("/data");\n    return await res.text();\n  } catch (err) {\n    return "fallback";\n  }\n};`,
        exercise: `async function parallel(urls) {\n  const results = await Promise.all(urls.map((u) => fetch(u)));\n  return results.map((r) => r.status);\n}`,
      };
    case "new":
      return {
        example: `const date = new Date();\nconst map = new Map();`,
        variant: `const user = new (class User {})();\nconsole.log(user instanceof Object);`,
        exercise: `function buildInstance(Ctor, value) {\n  return new Ctor(value);\n}\nconst num = buildInstance(Number, "5");`,
      };
    case "delete":
      return {
        example: `const user = { name: "Ada", password: "secret" };\ndelete user.password;`,
        variant: `const cache = { a: 1, b: 2 };\ndelete cache.a;`,
        exercise: `function removeKey(obj, key) {\n  delete obj[key];\n  return obj;\n}`,
      };
    case "typeof":
      return {
        example: `const kind = typeof 42; // "number"`,
        variant: `console.log(typeof undefined); // "undefined"`,
        exercise: `function typeOfValue(value) {\n  return typeof value;\n}`,
      };
    case "instanceof":
      return {
        example: `class User {}\nconst u = new User();\nconsole.log(u instanceof User);`,
        variant: `const date = new Date();\nconsole.log(date instanceof Date);`,
        exercise: `function isPromise(value) {\n  return value instanceof Promise;\n}`,
      };
    case "in":
      return {
        example: `const user = { name: "Ada" };\nconsole.log("name" in user);`,
        variant: `const arr = [1, 2, 3];\nconsole.log(1 in arr);`,
        exercise: `function hasKey(obj, key) {\n  return key in obj;\n}`,
      };
    case "of":
      return {
        example: `for (const name of ["Ada", "Linus"]) {\n  console.log(name);\n}`,
        variant: `const set = new Set([1, 2, 3]);\nfor (const item of set) console.log(item);`,
        exercise: `function collect(values) {\n  const result = [];\n  for (const value of values) result.push(value * 2);\n  return result;\n}`,
      };
    case "yield":
      return {
        example: `function* counter() {\n  yield 1;\n  yield 2;\n}\nconsole.log([...counter()]);`,
        variant: `function* ids() {\n  let id = 0;\n  while (true) yield id++;\n}\nconst gen = ids();`,
        exercise: `function* paginate(items, size) {\n  for (let i = 0; i < items.length; i += size) {\n    yield items.slice(i, i + size);\n  }\n}`,
      };
    case "this":
      return {
        example: `const user = {\n  name: "Ada",\n  say() { return this.name; },\n};`,
        variant: `class Timer {\n  start() { this.t = Date.now(); }\n}\nconst t = new Timer(); t.start();`,
        exercise: `const bound = user.say.bind(user);\nconsole.log(bound());`,
      };
    case "with":
      return {
        example: `const user = { name: "Ada", age: 30 };\n// with está en desuso, evita usarlo\nwith (user) {\n  console.log(name, age);\n}`,
        variant: `// Usa destructuring en vez de with\nconst { name, age } = user;\nconsole.log(name, age);`,
        exercise: `// Refactoriza 'with' a destructuring en proyectos legacy.`,
      };
    case "debugger":
      return {
        example: `function compute(a, b) {\n  debugger;\n  return a + b;\n}`,
        variant: `const handler = (e) => {\n  debugger;\n  console.log(e.type);\n};`,
        exercise: `// Inserta debugger y abre DevTools para inspeccionar variables.`,
      };
    case "void":
      return {
        example: `const noop = () => void 0;\nconst result = noop(); // undefined`,
        variant: `void function log() { console.log("side-effect only"); }();`,
        exercise: `// Usa void para ignorar promesas intencionalmente\nvoid fetch("/ping");`,
      };
    default:
      return defaultSnippet(term);
  }
}

function operatorSnippet(term: string) {
  const clean = term.trim();
  switch (clean) {
    case "+":
    case "-":
    case "*":
    case "/":
    case "%":
    case "**":
      return {
        example: `const result = 10 ${clean} 3;`,
        variant: `const calc = (a, b) => a ${clean} b;`,
        exercise: `const values = [1, 2, 3];\nconst reduced = values.reduce((acc, n) => acc ${clean} n);`,
      };
    case "++":
    case "--":
      return {
        example: `let count = 0;\ncount${clean};`,
        variant: `let i = 1;\n${clean}i;`,
        exercise: `function step(n) {\n  ${clean}n;\n  return n;\n}`,
      };
    case "=":
    case "+=":
    case "-=":
    case "*=":
    case "/=":
    case "%=":
    case "**=":
      return {
        example: `let total = 10;\ntotal ${clean} 2;`,
        variant: `let points = 0;\npoints ${clean} 5;`,
        exercise: `function accumulate(values) {\n  let acc = 0;\n  for (const v of values) acc ${clean} v;\n  return acc;\n}`,
      };
    case "==":
    case "!=":
    case "===":
    case "!==":
      return {
        example: `console.log(2 ${clean} "2");`,
        variant: `const same = value ${clean} expected;`,
        exercise: `function isUser(id) {\n  return id ${clean} 42;\n}`,
      };
    case "<":
    case ">":
    case "<=":
    case ">=":
      return {
        example: `console.log(3 ${clean} 5);`,
        variant: `const compare = (a, b) => a ${clean} b;`,
        exercise: `function withinRange(value, min, max) {\n  return value ${clean === "<" || clean === "<=" ? "<=" : ">="} max;\n}`,
      };
    case "&&":
    case "||":
      return {
        example: `const canEdit = isAdmin ${clean} hasAccess;`,
        variant: `const value = input ${clean} fallback;`,
        exercise: `function guard(value) {\n  return value ${clean} "default";\n}`,
      };
    case "!":
      return {
        example: `const isEmpty = (value) => !value;`,
        variant: `const notReady = !ready;`,
        exercise: `function invert(flag) { return !flag; }`,
      };
    case "??":
      return {
        example: `const title = userInput ?? "Sin título";`,
        variant: `const port = env.PORT ?? 3000;`,
        exercise: `function fallback(value, alt) { return value ?? alt; }`,
      };
    case "?:": {
      const code = `const status = isOnline ? "online" : "offline";`;
      return { example: code, variant: code.replace("status", "label"), exercise: `${code}\n// Practica cambiando las condiciones` };
    }
    case "?.": {
      const code = `const city = user?.address?.city ?? "N/A";`;
      return { example: code, variant: `const first = list?.[0];`, exercise: `const length = payload?.items?.length ?? 0;` };
    }
    case "...":
      return {
        example: `const clone = { ...user, active: true };`,
        variant: `const merged = [...a, ...b];`,
        exercise: `function collect(...args) { return args.join(","); }`,
      };
    case "|":
    case "&":
    case "^":
    case "<<":
    case ">>":
    case ">>>":
      return {
        example: `const mask = 0b0011 ${clean} 0b0101;`,
        variant: `const shifted = 8 ${clean} 1;`,
        exercise: `function toggleBit(value) { return value ${clean} 1; }`,
      };
    default:
      return defaultSnippet(term);
  }
}

function primitiveSnippet(term: string) {
  const literal =
    term === "string"
      ? `"texto"`
      : term === "number"
        ? "42"
        : term === "boolean"
          ? "true"
          : term === "undefined"
            ? "undefined"
            : term === "null"
              ? "null"
              : term === "bigint"
                ? "9007199254740991n"
                : term === "symbol"
                  ? "Symbol('id')"
                  : term === "NaN"
                    ? "NaN"
                    : term === "Infinity"
                      ? "Infinity"
                      : term;
  return {
    example: `const value = ${literal};\nconsole.log(typeof value);`,
    variant: `const list = [${literal}, ${literal}];`,
    exercise: `function describe(value) {\n  return typeof value;\n}\nconsole.log(describe(${literal}));`,
  };
}

function globalSnippet(term: string) {
  switch (term) {
    case "Object":
      return {
        example: `const user = Object.assign({}, { name: "Ada" });`,
        variant: `const clone = Object.create({ role: "admin" });`,
        exercise: `const frozen = Object.freeze({ id: 1 });`,
      };
    case "Function":
      return {
        example: `const sum = new Function("a", "b", "return a + b");`,
        variant: `function wrap(fn) { return new Function("value", "return fn(value)"); }`,
        exercise: `const identity = new Function("x", "return x");`,
      };
    case "Boolean":
      return {
        example: `const flag = Boolean("value");`,
        variant: `console.log(new Boolean(false).valueOf());`,
        exercise: `function toBool(value) { return Boolean(value); }`,
      };
    case "Symbol":
      return {
        example: `const id = Symbol("id");`,
        variant: `const registry = { [Symbol.iterator]: () => [] };`,
        exercise: `const unique = Symbol.for("global");`,
      };
    case "BigInt":
      return {
        example: `const big = BigInt(Number.MAX_SAFE_INTEGER);`,
        variant: `const doubled = big * 2n;`,
        exercise: `function addBig(a, b) { return BigInt(a) + BigInt(b); }`,
      };
    case "Number":
      return {
        example: `const parsed = Number("42");`,
        variant: `console.log(Number.isNaN(NaN));`,
        exercise: `const safe = Number.isFinite(10 / 0);`,
      };
    case "Math":
      return {
        example: `const rounded = Math.round(3.6);`,
        variant: `const random = Math.random();`,
        exercise: `function clamp(value, min, max) {\n  return Math.min(max, Math.max(min, value));\n}`,
      };
    case "Date":
      return dateSnippet("getFullYear");
    case "String":
      return {
        example: `const text = new String("hola");`,
        variant: `console.log(String(123));`,
        exercise: `function normalize(value) { return String(value).trim(); }`,
      };
    case "RegExp":
      return regexSnippet("test");
    case "Array":
      return arrayMethodSnippet("map");
    case "Map":
      return dataStructureSnippet("Map");
    case "Set":
      return dataStructureSnippet("Set");
    case "WeakMap":
      return dataStructureSnippet("WeakMap");
    case "WeakSet":
      return dataStructureSnippet("WeakSet");
    case "Promise":
      return asyncSnippet("Promise");
    case "Proxy":
      return {
        example: `const target = { secret: 42 };\nconst proxy = new Proxy(target, {\n  get(obj, key) {\n    console.log("Leyendo", key);\n    return obj[key];\n  },\n});\nproxy.secret;`,
        variant: `const blocker = new Proxy({}, { set() { throw new Error("Solo lectura"); } });`,
        exercise: `const validator = new Proxy({}, { set(obj, key, value) { obj[key] = value; return true; } });`,
      };
    case "Reflect":
      return {
        example: `const user = {};\nReflect.set(user, "name", "Ada");`,
        variant: `const keys = Reflect.ownKeys({ a: 1, [Symbol("s")]: 2 });`,
        exercise: `function call(fn, ctx, args) { return Reflect.apply(fn, ctx, args); }`,
      };
    case "JSON":
      return jsonSnippet("JSON.parse");
    case "Error":
    case "EvalError":
    case "TypeError":
    case "RangeError":
    case "SyntaxError":
    case "URIError":
    case "AggregateError":
      return errorSnippet(term);
    case "ArrayBuffer":
    case "SharedArrayBuffer":
    case "DataView":
    case "Int8Array":
    case "Uint8Array":
    case "Uint8ClampedArray":
    case "Int16Array":
    case "Uint16Array":
    case "Int32Array":
    case "Uint32Array":
    case "Float32Array":
    case "Float64Array":
    case "Atomics":
    case "WebAssembly":
      return dataStructureSnippet(term);
    case "Function":
    default:
      return defaultSnippet(term);
  }
}

function arrayMethodSnippet(term: string) {
  const base = `const nums = [1, 2, 3, 4];`;
  switch (term) {
    case "push":
      return {
        example: `${base}\nnums.push(5);`,
        variant: `${base}\nnums.push(6, 7);`,
        exercise: `${base}\nfunction append(list, value) { list.push(value); return list; }`,
      };
    case "pop":
      return { example: `${base}\nnums.pop();`, variant: `${base}\nconst last = nums.pop();`, exercise: `${base}\nwhile (nums.length) nums.pop();` };
    case "shift":
      return { example: `${base}\nnums.shift();`, variant: `${base}\nconst first = nums.shift();`, exercise: `${base}\nwhile (nums.length) nums.shift();` };
    case "unshift":
      return { example: `${base}\nnums.unshift(0);`, variant: `${base}\nnums.unshift(-1, 0);`, exercise: `${base}\nfunction prepend(list, value) { list.unshift(value); }` };
    case "slice":
      return { example: `${base}\nconst firstTwo = nums.slice(0, 2);`, variant: `${base}\nconst copy = nums.slice();`, exercise: `${base}\nconst tail = nums.slice(1);` };
    case "splice":
      return { example: `${base}\nnums.splice(1, 1, 9);`, variant: `${base}\nnums.splice(2, 0, 99);`, exercise: `${base}\nnums.splice(nums.length - 1, 1);` };
    case "concat":
      return { example: `${base}\nconst merged = nums.concat([5, 6]);`, variant: `${base}\nconst clone = [].concat(nums);`, exercise: `${base}\nconst long = [0].concat(nums, [5]);` };
    case "map":
      return { example: `${base}\nconst doubled = nums.map((n) => n * 2);`, variant: `${base}\nconst labels = nums.map((n, i) => \`#\${i}: \${n}\`);`, exercise: `${base}\nconst withIndex = nums.map((n, i) => ({ n, i }));` };
    case "filter":
      return { example: `${base}\nconst evens = nums.filter((n) => n % 2 === 0);`, variant: `${base}\nconst gtTwo = nums.filter((n) => n > 2);`, exercise: `${base}\nconst truthy = [0, 1, null, 2].filter(Boolean);` };
    case "reduce":
      return { example: `${base}\nconst sum = nums.reduce((acc, n) => acc + n, 0);`, variant: `${base}\nconst max = nums.reduce((a, n) => Math.max(a, n), -Infinity);`, exercise: `${base}\nconst grouped = ["a", "b", "a"].reduce((acc, key) => {\n  acc[key] = (acc[key] || 0) + 1;\n  return acc;\n}, {});` };
    case "reduceRight":
      return { example: `${base}\nconst join = nums.reduceRight((acc, n) => acc + n, "");`, variant: `${base}\nconst stack = ["c", "b", "a"].reduceRight((s, n) => s + n, "");`, exercise: `${base}\nconst reversed = nums.reduceRight((acc, n) => [...acc, n], []);` };
    case "find":
      return { example: `${base}\nconst firstEven = nums.find((n) => n % 2 === 0);`, variant: `${base}\nconst gtThree = nums.find((n) => n > 3);`, exercise: `${base}\nfunction findById(list, id) { return list.find((item) => item.id === id); }` };
    case "findIndex":
      return { example: `${base}\nconst idx = nums.findIndex((n) => n === 3);`, variant: `${base}\nconst evenIndex = nums.findIndex((n) => n % 2 === 0);`, exercise: `${base}\nfunction findPos(list, value) { return list.findIndex((n) => n === value); }` };
    case "findLast":
      return { example: `${base}\nconst lastEven = nums.findLast((n) => n % 2 === 0);`, variant: `${base}\nconst lastLarge = nums.findLast((n) => n > 2);`, exercise: `${base}\nconst lastMatch = nums.findLast((n) => n < 4);` };
    case "findLastIndex":
      return { example: `${base}\nconst idx = nums.findLastIndex((n) => n % 2 === 0);`, variant: `${base}\nconst lastIdx = nums.findLastIndex((n) => n > 2);`, exercise: `${base}\nconst lastPos = nums.findLastIndex((n) => n < 4);` };
    case "every":
      return { example: `${base}\nconst allPositive = nums.every((n) => n > 0);`, variant: `${base}\nconst allEven = nums.every((n) => n % 2 === 0);`, exercise: `${base}\nfunction allMatch(list, predicate) { return list.every(predicate); }` };
    case "some":
      return { example: `${base}\nconst hasEven = nums.some((n) => n % 2 === 0);`, variant: `${base}\nconst hasNegative = nums.some((n) => n < 0);`, exercise: `${base}\nfunction anyMatch(list, predicate) { return list.some(predicate); }` };
    case "includes":
      return { example: `${base}\nconst present = nums.includes(3);`, variant: `${base}\nconst missing = nums.includes(9);`, exercise: `${base}\nfunction hasValue(list, value) { return list.includes(value); }` };
    case "indexOf":
      return { example: `${base}\nconst idx = nums.indexOf(3);`, variant: `${base}\nconst missing = nums.indexOf(99);`, exercise: `${base}\nfunction position(list, value) { return list.indexOf(value); }` };
    case "lastIndexOf":
      return { example: `const items = [1, 2, 3, 2];\nconst idx = items.lastIndexOf(2);`, variant: `const last = items.lastIndexOf(3);`, exercise: `function lastPos(list, value) { return list.lastIndexOf(value); }` };
    case "flat":
      return { example: `const nested = [1, [2, [3]]];\nconst result = nested.flat();`, variant: `const deep = nested.flat(2);`, exercise: `const flattened = nested.flat(Infinity);` };
    case "flatMap":
      return { example: `${base}\nconst doubled = nums.flatMap((n) => [n, n * 2]);`, variant: `${base}\nconst rows = nums.flatMap((n) => (n % 2 ? [n] : []));`, exercise: `${base}\nconst tagged = nums.flatMap((n) => [{ n }]);` };
    case "reverse":
      return { example: `${base}\nnums.reverse();`, variant: `${base}\nconst copy = [...nums].reverse();`, exercise: `${base}\nfunction reversed(list) { return [...list].reverse(); }` };
    case "sort":
      return { example: `${base}\nnums.sort((a, b) => a - b);`, variant: `${base}\nconst alpha = ["b", "a"].sort();`, exercise: `${base}\nfunction sortBy<T>(list: T[], fn: (item: T) => number) { return [...list].sort((a, b) => fn(a) - fn(b)); }` };
    case "fill":
      return { example: `const arr = Array(3).fill(0);`, variant: `${base}\nnums.fill(1, 1, 3);`, exercise: `const mask = new Array(5).fill(true);` };
    case "copyWithin":
      return { example: `${base}\nnums.copyWithin(1, 2);`, variant: `${base}\nnums.copyWithin(0, 2, 3);`, exercise: `${base}\nfunction copy(list) { return [...list].copyWithin(0, 1); }` };
    case "join":
      return { example: `${base}\nconst csv = nums.join(",");`, variant: `${base}\nconst dashed = nums.join("-");`, exercise: `${base}\nfunction joinLines(list) { return list.join("\\n"); }` };
    case "toString":
      return { example: `${base}\nconsole.log(nums.toString());`, variant: `${base}\nconst repr = nums.toString();`, exercise: `${base}\nfunction stringify(list) { return list.toString(); }` };
    case "entries":
      return { example: `${base}\nfor (const [index, value] of nums.entries()) {\n  console.log(index, value);\n}`, variant: `${base}\nconst entries = [...nums.entries()];`, exercise: `${base}\nfunction toEntries(list) { return [...list.entries()]; }` };
    case "keys":
      return { example: `${base}\nfor (const key of nums.keys()) console.log(key);`, variant: `${base}\nconst keys = [...nums.keys()];`, exercise: `${base}\nfunction keyList(list) { return [...list.keys()]; }` };
    case "values":
      return { example: `${base}\nfor (const value of nums.values()) console.log(value);`, variant: `${base}\nconst vals = [...nums.values()];`, exercise: `${base}\nfunction valueList(list) { return [...list.values()]; }` };
    case "forEach":
      return { example: `${base}\nnums.forEach((n) => console.log(n));`, variant: `${base}\nnums.forEach((n, i) => console.log(i, n));`, exercise: `${base}\nfunction logAll(list) { list.forEach(console.log); }` };
    case "from":
      return { example: `const arr = Array.from("hola");`, variant: `const mapped = Array.from([1, 2], (n) => n * 2);`, exercise: `const set = new Set([1, 2]);\nconst arr = Array.from(set);` };
    case "isArray":
      return { example: `Array.isArray([]);`, variant: `Array.isArray({});`, exercise: `function isList(value) { return Array.isArray(value); }` };
    case "of":
      return { example: `const arr = Array.of(1, 2, 3);`, variant: `const single = Array.of("value");`, exercise: `function makeArray(...values) { return Array.of(...values); }` };
    default:
      return defaultSnippet(term);
  }
}

function stringMethodSnippet(term: string) {
  const base = `const text = "  Hola JavaScript  ";`;
  switch (term) {
    case "charAt":
      return { example: `${base}\nconst first = text.charAt(0);`, variant: `${base}\nconst last = text.charAt(text.length - 1);`, exercise: `${base}\nfunction firstChar(str) { return str.charAt(0); }` };
    case "charCodeAt":
      return { example: `${base}\nconst code = text.charCodeAt(0);`, variant: `${base}\nconst codeLast = text.charCodeAt(text.length - 1);`, exercise: `${base}\nfunction codes(str) { return [...str].map((c, i) => str.charCodeAt(i)); }` };
    case "at":
      return { example: `${base}\nconst last = text.at(-1);`, variant: `${base}\nconst second = text.at(1);`, exercise: `${base}\nfunction pick(str, index) { return str.at(index); }` };
    case "indexOf":
      return { example: `${base}\nconst pos = text.indexOf("Java");`, variant: `${base}\nconst notFound = text.indexOf("React");`, exercise: `${base}\nfunction findWord(str, word) { return str.indexOf(word); }` };
    case "lastIndexOf":
      return { example: `const phrase = "abra cadabra";\nconst pos = phrase.lastIndexOf("abra");`, variant: `const last = phrase.lastIndexOf("a");`, exercise: `function lastPos(str, value) { return str.lastIndexOf(value); }` };
    case "substring":
      return { example: `${base}\nconst sub = text.substring(2, 6);`, variant: `${base}\nconst tail = text.substring(5);`, exercise: `${base}\nfunction initials(str) { return str.substring(0, 1); }` };
    case "substr":
      return { example: `${base}\nconst sub = text.substr(2, 4);`, variant: `${base}\nconst tail = text.substr(5);`, exercise: `${base}\nfunction clip(str) { return str.substr(0, 5); }` };
    case "slice":
      return { example: `${base}\nconst sub = text.slice(2, 6);`, variant: `${base}\nconst end = text.slice(-4);`, exercise: `${base}\nfunction middle(str) { return str.slice(1, -1); }` };
    case "toUpperCase":
      return { example: `${base}\nconst upper = text.toUpperCase();`, variant: `${base}\nconst shout = "dev".toUpperCase();`, exercise: `${base}\nfunction normalize(str) { return str.trim().toUpperCase(); }` };
    case "toLowerCase":
      return { example: `${base}\nconst lower = text.toLowerCase();`, variant: `${base}\nconst word = "DEV".toLowerCase();`, exercise: `${base}\nfunction normalize(str) { return str.trim().toLowerCase(); }` };
    case "trim":
      return { example: `${base}\nconst clean = text.trim();`, variant: `${base}\nconst compact = text.trim().toLowerCase();`, exercise: `${base}\nfunction safe(str) { return (str || "").trim(); }` };
    case "trimStart":
      return { example: `${base}\nconst clean = text.trimStart();`, variant: `${base}\nconst normalized = text.trimStart().toLowerCase();`, exercise: `${base}\nfunction cleanStart(str) { return str.trimStart(); }` };
    case "trimEnd":
      return { example: `${base}\nconst clean = text.trimEnd();`, variant: `${base}\nconst normalized = text.trimEnd().toLowerCase();`, exercise: `${base}\nfunction cleanEnd(str) { return str.trimEnd(); }` };
    case "replace":
      return { example: `${base}\nconst replaced = text.replace("JavaScript", "JS");`, variant: `${base}\nconst safe = text.replace(/\\s+/g, " ");`, exercise: `${base}\nfunction sanitize(str) { return str.replace(/</g, "&lt;"); }` };
    case "replaceAll":
      return { example: `${base}\nconst spaced = text.replaceAll(" ", "_");`, variant: `${base}\nconst dots = "1.2.3".replaceAll(".", "-");`, exercise: `${base}\nfunction strip(str) { return str.replaceAll("a", ""); }` };
    case "split":
      return { example: `const tags = "js,ts,node".split(",");`, variant: `${base}\nconst words = text.trim().split(" ");`, exercise: `${base}\nfunction lines(str) { return str.split("\\n"); }` };
    case "startsWith":
      return { example: `${base}\nconst ok = text.trim().startsWith("Hola");`, variant: `${base}\nconst prefix = "https://".startsWith("http");`, exercise: `${base}\nfunction hasPrefix(str, prefix) { return str.startsWith(prefix); }` };
    case "endsWith":
      return { example: `${base}\nconst ok = text.trim().endsWith("Script");`, variant: `${base}\nconst ext = "file.ts".endsWith(".ts");`, exercise: `${base}\nfunction hasSuffix(str, suffix) { return str.endsWith(suffix); }` };
    case "includes":
      return { example: `${base}\nconst ok = text.includes("Java");`, variant: `${base}\nconst yes = "frontend".includes("end");`, exercise: `${base}\nfunction contains(str, value) { return str.includes(value); }` };
    case "repeat":
      return { example: `"js ".repeat(3);`, variant: `"=".repeat(10);`, exercise: `function divider(char, times) { return char.repeat(times); }` };
    case "padStart":
      return { example: `"7".padStart(2, "0");`, variant: `"42".padStart(5, "0");`, exercise: `function padLeft(str, size) { return String(str).padStart(size, " "); }` };
    case "padEnd":
      return { example: `"js".padEnd(4, "!");`, variant: `"line".padEnd(10, ".");`, exercise: `function padRight(str, size) { return String(str).padEnd(size, " "); }` };
    case "normalize":
      return { example: `"mañana".normalize("NFC");`, variant: `"mañana".normalize("NFD");`, exercise: `function normalizeText(str) { return str.normalize("NFC"); }` };
    case "match":
      return { example: `"abc123".match(/\\d+/);`, variant: `"hola".match(/h.*/);`, exercise: `function numbers(str) { return str.match(/\\d+/g); }` };
    case "matchAll":
      return { example: `const matches = [..."a1b2".matchAll(/\\d/g)];`, variant: `const words = [..."uno dos".matchAll(/\\w+/g)];`, exercise: `function collectMatches(str, regex) { return [...str.matchAll(regex)]; }` };
    case "search":
      return { example: `"JavaScript".search(/Script/);`, variant: `"Dev".search(/v/);`, exercise: `function findIndex(str, regex) { return str.search(regex); }` };
    case "localeCompare":
      return { example: `"a".localeCompare("b");`, variant: `"ß".localeCompare("ss", "de");`, exercise: `function sortIntl(list) { return [...list].sort((a, b) => a.localeCompare(b)); }` };
    case "toString":
      return { example: `${base}\ntext.toString();`, variant: `const num = (42).toString();`, exercise: `function stringify(value) { return value.toString(); }` };
    default:
      return defaultSnippet(term);
  }
}

function numberMathSnippet(term: string) {
  const base = `const price = 12.3456;`;
  switch (term) {
    case "toFixed":
      return { example: `${base}\nprice.toFixed(2);`, variant: `${base}\nNumber(price.toFixed(1));`, exercise: `${base}\nfunction format(num) { return num.toFixed(3); }` };
    case "toPrecision":
      return { example: `${base}\nprice.toPrecision(4);`, variant: `${base}\nconst p = price.toPrecision(5);`, exercise: `${base}\nfunction precise(num) { return num.toPrecision(3); }` };
    case "toExponential":
      return { example: `${base}\nprice.toExponential(2);`, variant: `${base}\nconst exp = (1000).toExponential();`, exercise: `${base}\nfunction sci(num) { return num.toExponential(3); }` };
    case "valueOf":
      return { example: `${base}\nprice.valueOf();`, variant: `new Number(5).valueOf();`, exercise: `${base}\nfunction raw(num) { return num.valueOf(); }` };
    case "Math.abs":
      return { example: `Math.abs(-5);`, variant: `const distance = Math.abs(-10);`, exercise: `function abs(v) { return Math.abs(v); }` };
    case "Math.ceil":
      return { example: `Math.ceil(4.2);`, variant: `Math.ceil(-1.8);`, exercise: `function roundUp(n) { return Math.ceil(n); }` };
    case "Math.floor":
      return { example: `Math.floor(4.8);`, variant: `Math.floor(-1.2);`, exercise: `function roundDown(n) { return Math.floor(n); }` };
    case "Math.round":
      return { example: `Math.round(4.5);`, variant: `Math.round(4.4);`, exercise: `function roundHalf(n) { return Math.round(n); }` };
    case "Math.trunc":
      return { example: `Math.trunc(4.9);`, variant: `Math.trunc(-4.9);`, exercise: `function trunc(n) { return Math.trunc(n); }` };
    case "Math.pow":
      return { example: `Math.pow(2, 3);`, variant: `2 ** 3;`, exercise: `function square(n) { return Math.pow(n, 2); }` };
    case "Math.sqrt":
      return { example: `Math.sqrt(16);`, variant: `Math.sqrt(2);`, exercise: `function distance(x, y) { return Math.sqrt(x * x + y * y); }` };
    case "Math.random":
      return { example: `Math.random();`, variant: `const die = Math.floor(Math.random() * 6) + 1;`, exercise: `function randomBetween(min, max) { return Math.random() * (max - min) + min; }` };
    case "Math.max":
      return { example: `Math.max(1, 2, 3);`, variant: `Math.max(...[5, 2, 9]);`, exercise: `function max(list) { return Math.max(...list); }` };
    case "Math.min":
      return { example: `Math.min(1, 2, 3);`, variant: `Math.min(...[5, 2, 9]);`, exercise: `function min(list) { return Math.min(...list); }` };
    case "Math.sign":
      return { example: `Math.sign(-5);`, variant: `Math.sign(0);`, exercise: `function sign(n) { return Math.sign(n); }` };
    case "Math.imul":
      return { example: `Math.imul(3, 4);`, variant: `Math.imul(-1, 8);`, exercise: `function mul32(a, b) { return Math.imul(a, b); }` };
    case "Math.clz32":
      return { example: `Math.clz32(1);`, variant: `Math.clz32(16);`, exercise: `function countLeading(num) { return Math.clz32(num); }` };
    case "Math.log":
      return { example: `Math.log(Math.E);`, variant: `Math.log(10);`, exercise: `function ln(n) { return Math.log(n); }` };
    case "Math.exp":
      return { example: `Math.exp(1);`, variant: `Math.exp(2);`, exercise: `function ePow(n) { return Math.exp(n); }` };
    case "Math.sin":
      return { example: `Math.sin(Math.PI / 2);`, variant: `Math.sin(0);`, exercise: `function wave(rad) { return Math.sin(rad); }` };
    case "Math.cos":
      return { example: `Math.cos(0);`, variant: `Math.cos(Math.PI);`, exercise: `function cos(rad) { return Math.cos(rad); }` };
    case "Math.tan":
      return { example: `Math.tan(Math.PI / 4);`, variant: `Math.tan(0);`, exercise: `function tan(rad) { return Math.tan(rad); }` };
    default:
      return defaultSnippet(term);
  }
}

function dateSnippet(term: string) {
  const base = `const now = new Date("2024-01-01T12:00:00Z");`;
  if (term === "now") {
    return {
      example: `const timestamp = Date.now();`,
      variant: `const later = Date.now() + 1000;`,
      exercise: `function elapsed(start: number) { return Date.now() - start; }`,
    };
  }
  if (term === "parse") {
    return {
      example: `const ms = Date.parse("2024-01-01T00:00:00Z");`,
      variant: `const date = new Date(Date.parse("2024-02-01"));`,
      exercise: `function parseDate(value: string) { return new Date(Date.parse(value)); }`,
    };
  }
  if (term === "UTC") {
    return {
      example: `const utc = Date.UTC(2024, 0, 1, 12, 0, 0);`,
      variant: `const date = new Date(Date.UTC(2024, 0, 1));`,
      exercise: `function utcDate(year: number, month: number, day: number) { return new Date(Date.UTC(year, month, day)); }`,
    };
  }
  if (term === "setDay") {
    return {
      example: `${base}\n// setDay no es estándar; usa setDate para ajustar el día del mes\nnow.setDate(now.getDate());`,
      variant: `${base}\nnow.setDate(now.getDate() + 1);`,
      exercise: `${base}\nfunction nextDay(date: Date) { const d = new Date(date); d.setDate(d.getDate() + 1); return d; }`,
    };
  }
  return {
    example: `${base}\nnow.${term}();`,
    variant: `${base}\nconst copy = new Date(now.getTime());`,
    exercise: `${base}\nfunction addDays(date, days) {\n  const d = new Date(date);\n  d.setDate(d.getDate() + days);\n  return d;\n}`,
  };
}

function regexSnippet(term: string) {
  const base = `const re = /dev/gi;\nconst text = "Diccionario Dev";`;
  switch (term) {
    case "test":
      return { example: `${base}\nre.test(text);`, variant: `${base}\nconst ok = /Dev/i.test(text);`, exercise: `${base}\nfunction hasTerm(str) { return re.test(str); }` };
    case "exec":
      return { example: `${base}\nconst match = re.exec(text);`, variant: `${base}\nconst found = /\\d+/.exec("v2");`, exercise: `${base}\nfunction execAll(str) { const res = []; let m; while ((m = re.exec(str))) res.push(m[0]); return res; }` };
    case "match":
      return { example: `${base}\nconst parts = text.match(re);`, variant: `"2024-01-01".match(/\\d+/g);`, exercise: `${base}\nfunction numbers(str) { return str.match(/\\d+/g); }` };
    case "matchAll":
      return { example: `${base}\nconst all = [...text.matchAll(re)];`, variant: `[..."2024".matchAll(/\\d/g)];`, exercise: `${base}\nfunction collect(str, pattern) { return [...str.matchAll(pattern)]; }` };
    case "replace":
      return { example: `${base}\ntext.replace(re, "developer");`, variant: `"1,2,3".replace(/,/g, ";");`, exercise: `${base}\nfunction sanitize(str) { return str.replace(/<[^>]+>/g, ""); }` };
    case "search":
      return { example: `${base}\ntext.search(re);`, variant: `"hola".search(/o/);`, exercise: `${base}\nfunction position(str, pattern) { return str.search(pattern); }` };
    case "split":
      return { example: `"a,b,c".split(/,/);`, variant: `"a1b2".split(/\\d/);`, exercise: `function splitWords(str) { return str.split(/\\s+/); }` };
    case "flags":
      return { example: `const re = /demo/gi;\nconsole.log(re.flags);`, variant: `const flags = new RegExp("demo", "gi").flags;`, exercise: `function hasFlag(regex, flag) { return regex.flags.includes(flag); }` };
    case "source":
      return { example: `const re = /demo/;\nconsole.log(re.source);`, variant: `const src = new RegExp("test").source;`, exercise: `function pattern(regex) { return regex.source; }` };
    default:
      return defaultSnippet(term);
  }
}

function asyncSnippet(term: string) {
  switch (term) {
    case "setTimeout":
      return { example: `const id = setTimeout(() => console.log("hola"), 500);`, variant: `setTimeout(() => console.log("tick"), 0);`, exercise: `function delay(ms) { return new Promise((res) => setTimeout(res, ms)); }` };
    case "setInterval":
      return { example: `const id = setInterval(() => console.log("ping"), 1000);`, variant: `setInterval(() => console.log(new Date().toISOString()), 2000);`, exercise: `function ticker(ms, limit = 3) {\n  let count = 0;\n  const id = setInterval(() => {\n    console.log("tick", ++count);\n    if (count === limit) clearInterval(id);\n  }, ms);\n}` };
    case "clearTimeout":
      return { example: `const id = setTimeout(() => console.log("hola"), 1000);\nclearTimeout(id);`, variant: `const timer = setTimeout(() => {}, 500);\nclearTimeout(timer);`, exercise: `function cancelable(ms) {\n  const id = setTimeout(() => console.log("done"), ms);\n  return () => clearTimeout(id);\n}` };
    case "clearInterval":
      return { example: `const id = setInterval(() => console.log("ping"), 1000);\nclearInterval(id);`, variant: `const loop = setInterval(() => {}, 1000);\nclearInterval(loop);`, exercise: `function stopAfter(id, ms) { setTimeout(() => clearInterval(id), ms); }` };
    case "Promise":
      return { example: `const p = new Promise((resolve) => resolve(42));`, variant: `new Promise((_, reject) => reject(new Error("fail")));`, exercise: `function wrap(value) { return Promise.resolve(value); }` };
    case "Promise.resolve":
      return { example: `Promise.resolve("ok");`, variant: `const ready = Promise.resolve({ status: "ready" });`, exercise: `function ensure(value) { return Promise.resolve(value); }` };
    case "Promise.reject":
      return { example: `Promise.reject(new Error("oops"));`, variant: `const fail = Promise.reject("fail");`, exercise: `function failFast(message) { return Promise.reject(message); }` };
    case "Promise.all":
      return { example: `await Promise.all([fetch("/a"), fetch("/b")]);`, variant: `Promise.all([Promise.resolve(1), Promise.resolve(2)]);`, exercise: `function parallel(promises) { return Promise.all(promises); }` };
    case "Promise.allSettled":
      return { example: `await Promise.allSettled([fetch("/a"), fetch("/b")]);`, variant: `Promise.allSettled([Promise.resolve(1), Promise.reject("x")]);`, exercise: `function settle(promises) { return Promise.allSettled(promises); }` };
    case "Promise.race":
      return { example: `await Promise.race([fetch("/slow"), fetch("/fast")]);`, variant: `Promise.race([delay(500), delay(100)]);`, exercise: `function fastest(promises) { return Promise.race(promises); }` };
    case "Promise.any":
      return { example: `await Promise.any([Promise.reject("x"), Promise.resolve("ok")]);`, variant: `Promise.any([delay(10), Promise.resolve("ready")]);`, exercise: `function firstSuccess(promises) { return Promise.any(promises); }` };
    case "async":
    case "await":
      return keywordSnippet(term);
    case "queueMicrotask":
      return { example: `queueMicrotask(() => console.log("microtask"));`, variant: `queueMicrotask(() => perform());`, exercise: `function defer(fn) { queueMicrotask(fn); }` };
    case "EventLoop":
    case "JobQueue":
    case "TickQueue":
    case "callback":
      return { example: `console.log("sync");\nqueueMicrotask(() => console.log("microtask"));\nsetTimeout(() => console.log("macrotask"), 0);`, variant: `Promise.resolve().then(() => console.log("micro"));`, exercise: `function traceLoop() {\n  console.log("start");\n  setTimeout(() => console.log("timeout"), 0);\n  Promise.resolve().then(() => console.log("promise"));\n  console.log("end");\n}` };
    default:
      return defaultSnippet(term);
  }
}

function domSnippet(term: string) {
  switch (term) {
    case "window":
      return { example: `console.log(window.innerWidth);`, variant: `window.addEventListener("resize", () => console.log(window.innerWidth));`, exercise: `function scrollTop() { window.scrollTo({ top: 0, behavior: "smooth" }); }` };
    case "document":
      return { example: `const root = document.getElementById("app");`, variant: `document.title = "Diccionario Dev";`, exercise: `function create(tag) { return document.createElement(tag); }` };
    case "querySelector":
      return { example: `const btn = document.querySelector("button");`, variant: `const active = document.querySelector(".active");`, exercise: `function find(selector) { return document.querySelector(selector); }` };
    case "querySelectorAll":
      return { example: `const items = document.querySelectorAll("li");`, variant: `const buttons = document.querySelectorAll("button.primary");`, exercise: `function all(selector) { return [...document.querySelectorAll(selector)]; }` };
    case "getElementById":
      return { example: `const form = document.getElementById("form");`, variant: `const modal = document.getElementById("modal");`, exercise: `function byId(id) { return document.getElementById(id); }` };
    case "getElementsByClassName":
      return { example: `const badges = document.getElementsByClassName("badge");`, variant: `const panels = document.getElementsByClassName("panel");`, exercise: `function classes(name) { return [...document.getElementsByClassName(name)]; }` };
    case "getElementsByTagName":
      return { example: `const inputs = document.getElementsByTagName("input");`, variant: `const sections = document.getElementsByTagName("section");`, exercise: `function tags(tag) { return [...document.getElementsByTagName(tag)]; }` };
    case "createElement":
      return { example: `const el = document.createElement("button");\nel.textContent = "Click";`, variant: `const div = document.createElement("div");\ndiv.className = "card";`, exercise: `function card(title) {\n  const el = document.createElement("article");\n  el.textContent = title;\n  return el;\n}` };
    case "createTextNode":
      return { example: `const text = document.createTextNode("hola");`, variant: `const node = document.createTextNode("Diccionario");`, exercise: `function label(value) { return document.createTextNode(value); }` };
    case "appendChild":
      return { example: `const list = document.querySelector("ul");\nconst item = document.createElement("li");\nlist.appendChild(item);`, variant: `const root = document.getElementById("root");\nroot.appendChild(document.createElement("section"));`, exercise: `function mount(parent, child) { parent.appendChild(child); }` };
    case "prepend":
      return { example: `const list = document.querySelector("ul");\nlist.prepend(document.createElement("li"));`, variant: `const container = document.getElementById("app");\ncontainer.prepend(document.createElement("header"));`, exercise: `function addFirst(parent, el) { parent.prepend(el); }` };
    case "insertBefore":
      return { example: `parent.insertBefore(newNode, referenceNode);`, variant: `const ref = list.firstChild;\nlist.insertBefore(item, ref);`, exercise: `function insert(parent, child, ref) { parent.insertBefore(child, ref); }` };
    case "removeChild":
      return { example: `list.removeChild(list.lastChild);`, variant: `parent.removeChild(node);`, exercise: `function remove(parent, child) { if (child.parentNode === parent) parent.removeChild(child); }` };
    case "replaceChild":
      return { example: `parent.replaceChild(newNode, oldNode);`, variant: `list.replaceChild(document.createElement("li"), list.firstChild);`, exercise: `function swap(parent, oldEl, newEl) { parent.replaceChild(newEl, oldEl); }` };
    case "cloneNode":
      return { example: `const copy = node.cloneNode(true);`, variant: `const shallow = node.cloneNode(false);`, exercise: `function duplicate(el) { return el.cloneNode(true); }` };
    case "innerHTML":
      return { example: `element.innerHTML = "<strong>Hola</strong>";`, variant: `const html = element.innerHTML;`, exercise: `function render(el, html) { el.innerHTML = html; }` };
    case "outerHTML":
      return { example: `console.log(element.outerHTML);`, variant: `element.outerHTML = "<p>Reemplazado</p>";`, exercise: `function snapshot(el) { return el.outerHTML; }` };
    case "textContent":
      return { example: `element.textContent = "Solo texto";`, variant: `const text = element.textContent;`, exercise: `function setText(el, value) { el.textContent = value; }` };
    case "classList":
      return { example: `element.classList.add("active");`, variant: `element.classList.remove("hidden");`, exercise: `element.classList.toggle("dark", true);` };
    case "classList.add":
      return { example: `element.classList.add("primary");`, variant: `button.classList.add("loading");`, exercise: `function addClass(el, name) { el.classList.add(name); }` };
    case "classList.remove":
      return { example: `element.classList.remove("hidden");`, variant: `nav.classList.remove("active");`, exercise: `function removeClass(el, name) { el.classList.remove(name); }` };
    case "classList.toggle":
      return { example: `element.classList.toggle("open");`, variant: `menu.classList.toggle("open", true);`, exercise: `function toggle(el, name, state) { el.classList.toggle(name, state); }` };
    case "setAttribute":
      return { example: `element.setAttribute("aria-label", "Cerrar");`, variant: `img.setAttribute("alt", "Avatar");`, exercise: `function setAttr(el, key, value) { el.setAttribute(key, value); }` };
    case "getAttribute":
      return { example: `const alt = img.getAttribute("alt");`, variant: `const value = el.getAttribute("data-id");`, exercise: `function readAttr(el, key) { return el.getAttribute(key); }` };
    case "removeAttribute":
      return { example: `element.removeAttribute("disabled");`, variant: `input.removeAttribute("readonly");`, exercise: `function clearAttr(el, key) { el.removeAttribute(key); }` };
    case "style":
      return { example: `element.style.background = "black";`, variant: `element.style.setProperty("color", "white");`, exercise: `function setHeight(el, value) { el.style.height = value; }` };
    case "dataset":
      return { example: `element.dataset.track = "cta";`, variant: `const id = element.dataset.id;`, exercise: `function setData(el, key, value) { el.dataset[key] = value; }` };
    case "addEventListener":
      return { example: `button.addEventListener("click", handleClick);`, variant: `window.addEventListener("resize", () => console.log("resize"));`, exercise: `function listen(el, type, handler) { el.addEventListener(type, handler); }` };
    case "removeEventListener":
      return { example: `button.removeEventListener("click", handleClick);`, variant: `window.removeEventListener("scroll", onScroll);`, exercise: `function unlisten(el, type, handler) { el.removeEventListener(type, handler); }` };
    case "dispatchEvent":
      return { example: `const event = new Event("ready");\nel.dispatchEvent(event);`, variant: `button.dispatchEvent(new MouseEvent("click"));`, exercise: `function emit(el, type) { el.dispatchEvent(new Event(type)); }` };
    case "Event":
    case "CustomEvent":
    case "MouseEvent":
    case "KeyboardEvent":
    case "InputEvent":
    case "SubmitEvent":
    case "TouchEvent":
      return { example: `const evt = new ${term}("${term === "CustomEvent" ? "custom" : "click"}");`, variant: `document.body.dispatchEvent(evt);`, exercise: `function emit${toPascal(term)}() { return new ${term}("${term.toLowerCase()}"); }` };
    case "DOMContentLoaded":
    case "load":
    case "scroll":
    case "resize":
      return { example: `window.addEventListener("${term.toLowerCase()}", () => console.log("${term}"));`, variant: `document.addEventListener("${term.toLowerCase()}", () => {});`, exercise: `function on${toPascal(term)}(fn) { window.addEventListener("${term.toLowerCase()}", fn); }` };
    default:
      return defaultSnippet(term);
  }
}

function webApiSnippet(term: string) {
  switch (term) {
    case "fetch":
      return {
        example: `const res = await fetch("/api");\nconst data = await res.json();`,
        variant: `fetch("https://api.dev").then((r) => r.text());`,
        exercise: `async function getJson(url) { const r = await fetch(url); return r.json(); }`,
      };
    case "AbortController":
      return { example: `const controller = new AbortController();\nfetch("/api", { signal: controller.signal });\ncontroller.abort();`, variant: `const c = new AbortController();\nsetTimeout(() => c.abort(), 2000);`, exercise: `function cancelableFetch(url) {\n  const ctrl = new AbortController();\n  const req = fetch(url, { signal: ctrl.signal });\n  return { req, cancel: () => ctrl.abort() };\n}` };
    case "AbortSignal":
      return { example: `const { signal } = new AbortController();`, variant: `signal.addEventListener("abort", () => console.log("canceled"));`, exercise: `function onAbort(signal, fn) { signal.addEventListener("abort", fn); }` };
    case "localStorage":
      return { example: `localStorage.setItem("token", "123");`, variant: `const value = localStorage.getItem("token");`, exercise: `function remember(key, value) { localStorage.setItem(key, value); }` };
    case "sessionStorage":
      return { example: `sessionStorage.setItem("flash", "ok");`, variant: `sessionStorage.removeItem("flash");`, exercise: `function once(key, value) { sessionStorage.setItem(key, value); }` };
    case "Cookies":
      return { example: `document.cookie = "theme=dark; path=/";`, variant: `const cookies = document.cookie;`, exercise: `function setCookie(name, value) { document.cookie = \`\${name}=\${value}\`; }` };
    case "console":
      return errorSnippet("console.log");
    case "history":
      return { example: `history.pushState({ page: 1 }, "", "/page");`, variant: `history.back();`, exercise: `function navigate(path) { history.pushState({}, "", path); }` };
    case "location":
      return { example: `console.log(location.href);`, variant: `location.assign("https://example.com");`, exercise: `function go(path) { location.href = path; }` };
    case "navigator":
      return { example: `console.log(navigator.userAgent);`, variant: `console.log(navigator.onLine);`, exercise: `async function copy(text) { return navigator.clipboard.writeText(text); }` };
    case "Clipboard API":
      return { example: `await navigator.clipboard.writeText("copiado");`, variant: `const text = await navigator.clipboard.readText();`, exercise: `async function copyValue(value) { await navigator.clipboard.writeText(value); }` };
    case "Fullscreen API":
      return { example: `await document.documentElement.requestFullscreen();`, variant: `document.exitFullscreen();`, exercise: `async function toggleFullscreen(el) { if (!document.fullscreenElement) await el.requestFullscreen(); else await document.exitFullscreen(); }` };
    case "Geolocation API":
      return { example: `navigator.geolocation.getCurrentPosition((pos) => console.log(pos.coords));`, variant: `navigator.geolocation.watchPosition((pos) => console.log(pos.coords));`, exercise: `function locate() { return new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej)); }` };
    case "IntersectionObserver":
      return { example: `const observer = new IntersectionObserver((entries) => console.log(entries));\nobserver.observe(document.querySelector("#target"));`, variant: `observer.unobserve(document.querySelector("#target"));`, exercise: `function onVisible(el, cb) { const obs = new IntersectionObserver((e) => e[0]?.isIntersecting && cb()); obs.observe(el); return () => obs.disconnect(); }` };
    case "MutationObserver":
      return { example: `const obs = new MutationObserver((mutations) => console.log(mutations));\nobs.observe(document.body, { childList: true });`, variant: `obs.disconnect();`, exercise: `function watch(el, options) { const o = new MutationObserver(console.log); o.observe(el, options); return () => o.disconnect(); }` };
    case "ResizeObserver":
      return { example: `const obs = new ResizeObserver((entries) => console.log(entries[0].contentRect));\nobs.observe(document.body);`, variant: `obs.disconnect();`, exercise: `function trackSize(el, cb) { const o = new ResizeObserver(([e]) => cb(e.contentRect)); o.observe(el); return () => o.disconnect(); }` };
    case "Blob":
      return { example: `const blob = new Blob(["hola"], { type: "text/plain" });`, variant: `const url = URL.createObjectURL(blob);`, exercise: `function toBlob(text) { return new Blob([text], { type: "text/plain" }); }` };
    case "File":
      return { example: `const file = new File(["hola"], "note.txt", { type: "text/plain" });`, variant: `console.log(file.name);`, exercise: `function isImage(file) { return file.type.startsWith("image/"); }` };
    case "FileReader":
      return { example: `const reader = new FileReader();\nreader.onload = () => console.log(reader.result);\nreader.readAsText(new Blob(["hola"]));`, variant: `reader.readAsDataURL(new Blob(["hola"]));`, exercise: `function readFile(file) { return new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsText(file); }); }` };
    case "FormData":
      return { example: `const form = new FormData();\nform.append("name", "Ada");`, variant: `form.append("file", new Blob(["hi"], { type: "text/plain" }));`, exercise: `function buildForm(obj) { const f = new FormData(); Object.entries(obj).forEach(([k, v]) => f.append(k, v as string)); return f; }` };
    case "URL":
      return { example: `const url = new URL("https://dev.com/path?debug=1");`, variant: `url.searchParams.get("debug");`, exercise: `function withParam(url, key, value) { const u = new URL(url); u.searchParams.set(key, value); return u.toString(); }` };
    case "URLSearchParams":
      return { example: `const params = new URLSearchParams("a=1&b=2");`, variant: `params.set("c", "3");`, exercise: `function toQuery(obj) { const p = new URLSearchParams(); Object.entries(obj).forEach(([k, v]) => p.set(k, String(v))); return p.toString(); }` };
    case "WebSocket":
      return { example: `const socket = new WebSocket("wss://echo.websocket.org");\nsocket.addEventListener("message", (e) => console.log(e.data));`, variant: `socket.send("ping");`, exercise: `function connect(url) { const ws = new WebSocket(url); return ws; }` };
    case "BroadcastChannel":
      return { example: `const channel = new BroadcastChannel("updates");\nchannel.postMessage({ hello: true });`, variant: `channel.onmessage = (e) => console.log(e.data);`, exercise: `function broadcast(name, data) { const c = new BroadcastChannel(name); c.postMessage(data); }` };
    case "Worker":
      return { example: `const worker = new Worker("worker.js");\nworker.postMessage("hola");`, variant: `worker.onmessage = (e) => console.log(e.data);`, exercise: `function stop(worker) { worker.terminate(); }` };
    case "ServiceWorker":
      return { example: `navigator.serviceWorker.register("/sw.js");`, variant: `navigator.serviceWorker.ready.then((reg) => console.log(reg.scope));`, exercise: `async function unregister() { const reg = await navigator.serviceWorker.ready; await reg.unregister(); }` };
    case "Notification":
      return { example: `Notification.requestPermission().then(() => new Notification("Hola"));`, variant: `new Notification("Hey", { body: "Diccionario Dev" });`, exercise: `async function notify(title, body) { if ((await Notification.requestPermission()) === "granted") new Notification(title, { body }); }` };
    case "IndexedDB":
      return { example: `const open = indexedDB.open("db", 1);\nopen.onupgradeneeded = () => open.result.createObjectStore("items");`, variant: `open.onsuccess = () => open.result.transaction("items", "readwrite");`, exercise: `function openDb(name) { return indexedDB.open(name, 1); }` };
    case "CacheStorage":
      return { example: `const cache = await caches.open("v1");\nawait cache.put("/hello", new Response("world"));`, variant: `const res = await cache.match("/hello");`, exercise: `async function cacheText(key, value) { const c = await caches.open("v1"); await c.put(key, new Response(value)); }` };
    case "Request":
      return { example: `const req = new Request("/api", { method: "POST" });`, variant: `req.headers.get("content-type");`, exercise: `function buildRequest(url, options) { return new Request(url, options); }` };
    case "Response":
      return { example: `const res = new Response("ok", { status: 200 });`, variant: `await res.text();`, exercise: `function jsonResponse(data) { return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } }); }` };
    case "Headers":
      return { example: `const headers = new Headers({ "Content-Type": "application/json" });`, variant: `headers.set("Authorization", "Bearer token");`, exercise: `function authHeaders(token) { const h = new Headers(); h.set("Authorization", \`Bearer \${token}\`); return h; }` };
    default:
      return defaultSnippet(term);
  }
}

function moduleSnippet(term: string) {
  return {
    example: `// math.js\nexport function sum(a, b) { return a + b; }\n\n// app.js\nimport { sum } from "./math.js";\nsum(2, 3);`,
    variant: `// export default\nexport default function greet(name) { return \`Hola \${name}\`; }\n// import\nimport greet from "./greet.js";`,
    exercise: `// Renombrar import\nimport { sum as add } from "./math.js";\nconsole.log(add(1, 2));`,
  };
}

function errorSnippet(term: string) {
  switch (term) {
    case "try":
    case "catch":
    case "finally":
    case "throw":
      return keywordSnippet(term);
    case "Error":
    case "TypeError":
    case "SyntaxError":
    case "RangeError":
    case "ReferenceError":
      return {
        example: `throw new ${term}("Mensaje descriptivo");`,
        variant: `try {\n  risky();\n} catch (error) {\n  if (error instanceof ${term}) console.error(error.message);\n}`,
        exercise: `function assert(condition, message) {\n  if (!condition) throw new ${term}(message);\n}`,
      };
    case "console.log":
    case "console.error":
    case "console.warn":
    case "console.table":
    case "console.group":
    case "console.time":
    case "console.timeEnd":
      return {
        example: `${term}("Estado", { ok: true });`,
        variant: `${term}("Paso 1");\n${term.replace("log", "error")}("Algo salió mal");`,
        exercise: `console.group("debug");\nconsole.log("dato");\nconsole.groupEnd();`,
      };
    case "debugger":
      return keywordSnippet("debugger");
    default:
      return defaultSnippet(term);
  }
}

function dataStructureSnippet(term: string) {
  switch (term) {
    case "Map":
      return { example: `const map = new Map([["key", 1]]);\nmap.set("name", "Ada");`, variant: `const value = map.get("key");`, exercise: `function toMap(entries) { return new Map(entries); }` };
    case "Set":
      return { example: `const set = new Set([1, 2]);\nset.add(3);`, variant: `set.has(2);`, exercise: `function unique(list) { return [...new Set(list)]; }` };
    case "WeakMap":
      return { example: `const wm = new WeakMap();\nconst obj = {};\nwm.set(obj, "meta");`, variant: `console.log(wm.get(obj));`, exercise: `function memo(obj) { const cache = new WeakMap(); cache.set(obj, true); return cache; }` };
    case "WeakSet":
      return { example: `const ws = new WeakSet();\nconst obj = {};\nws.add(obj);`, variant: `ws.has(obj);`, exercise: `function mark(obj) { const set = new WeakSet(); set.add(obj); return set; }` };
    case "ArrayBuffer":
    case "SharedArrayBuffer":
      return { example: `const buffer = new ${term}(8);`, variant: `const view = new DataView(buffer);`, exercise: `function createBuffer(size) { return new ${term}(size); }` };
    case "DataView":
      return { example: `const buffer = new ArrayBuffer(8);\nconst view = new DataView(buffer);\nview.setInt8(0, 7);`, variant: `view.getInt8(0);`, exercise: `function read(buffer) { return new DataView(buffer).getInt8(0); }` };
    case "Int8Array":
    case "Uint8Array":
    case "Uint8ClampedArray":
    case "Int16Array":
    case "Uint16Array":
    case "Int32Array":
    case "Uint32Array":
    case "Float32Array":
    case "Float64Array":
      return { example: `const typed = new ${term}([1, 2, 3]);`, variant: `typed[0] = 9;`, exercise: `function average(arr) { const t = new ${term}(arr); return t.reduce((a, n) => a + n, 0) / t.length; }` };
    case "Atomics":
      return { example: `const buffer = new SharedArrayBuffer(16);\nconst view = new Int32Array(buffer);\nAtomics.store(view, 0, 123);`, variant: `Atomics.add(view, 0, 1);`, exercise: `function waitFlag(view) { Atomics.wait(view, 0, 0); }` };
    case "WeakRef":
      return { example: `const ref = new WeakRef({ value: 1 });`, variant: `const value = ref.deref();`, exercise: `function weak(obj) { return new WeakRef(obj); }` };
    case "FinalizationRegistry":
      return { example: `const registry = new FinalizationRegistry((value) => console.log("clean", value));`, variant: `registry.register({}, "meta");`, exercise: `function register(target, meta) { const r = new FinalizationRegistry(console.log); r.register(target, meta); return r; }` };
    default:
      return defaultSnippet(term);
  }
}

function patternSnippet(term: string) {
  switch (term) {
    case "callbacks":
      return { example: `function fetchData(cb) { setTimeout(() => cb("ok"), 100); }`, variant: `fetchData((value) => console.log(value));`, exercise: `function withError(cb) { cb(null, "data"); }` };
    case "promises":
      return { example: `fetch("/api").then((r) => r.json());`, variant: `Promise.resolve("ok").then(console.log);`, exercise: `function delay(ms) { return new Promise((res) => setTimeout(res, ms)); }` };
    case "async-await":
      return { example: `async function main() { const res = await fetch("/api"); return res.ok; }`, variant: `await Promise.all([Promise.resolve(1), Promise.resolve(2)]);`, exercise: `async function safe(fn) { try { return await fn(); } catch (e) { return null; } }` };
    case "closures":
      return { example: `function counter() { let count = 0; return () => ++count; }`, variant: `const inc = counter(); inc();`, exercise: `function makeAdder(a) { return (b) => a + b; }` };
    case "hoisting":
      return { example: `console.log(value); // undefined\nvar value = 3;`, variant: `hoisted();\nfunction hoisted() {}`, exercise: `// Practica reescribiendo var -> let/const para evitar hoisting.` };
    case "scope":
    case "block-scope":
    case "lexical-scope":
      return { example: `if (true) { const secret = 1; }\n// secret no está afuera`, variant: `function outer() { const a = 1; function inner() { return a; } return inner(); }`, exercise: `function makeScope(value) { return () => value; }` };
    case "prototype":
    case "inheritance":
      return { example: `function User(name) { this.name = name; }\nUser.prototype.greet = function () { return this.name; };`, variant: `function Admin(name) { User.call(this, name); }\nAdmin.prototype = Object.create(User.prototype);`, exercise: `Admin.prototype.role = "admin";` };
    case "composition":
      return { example: `const withLogger = (fn) => (...args) => { console.log(args); return fn(...args); };`, variant: `const sum = (a, b) => a + b;\nconst safeSum = withLogger(sum);`, exercise: `const withTiming = (fn) => (...args) => { const t = performance.now(); const res = fn(...args); console.log(performance.now() - t); return res; };` };
    case "immutability":
      return { example: `const user = { name: "Ada" };\nconst updated = { ...user, active: true };`, variant: `const arr = [1, 2];\nconst arr2 = [...arr, 3];`, exercise: `function freeze(obj) { return Object.freeze(obj); }` };
    case "event-driven":
    case "observer-pattern":
    case "pubsub":
      return { example: `const listeners = [];\nfunction on(event) { listeners.push(event); }\nfunction emit(value) { listeners.forEach((fn) => fn(value)); }`, variant: `on((v) => console.log("listener", v));\nemit("ping");`, exercise: `function once(fn) { return (value) => { fn(value); listeners.length = 0; }; }` };
    case "factory-pattern":
      return { example: `const createUser = (name) => ({ name, role: "user" });`, variant: `const admin = createUser("Ada"); admin.role = "admin";`, exercise: `function make(type) { return { type, createdAt: Date.now() }; }` };
    case "module-pattern":
      return { example: `const counter = (() => {\n  let value = 0;\n  return { inc: () => ++value, get: () => value };\n})();`, variant: `counter.inc();`, exercise: `function makeModule() { let v = 0; return { add: () => ++v }; }` };
    case "singleton-pattern":
      return { example: `const singleton = (() => {\n  let instance;\n  return () => instance || (instance = { id: Date.now() });\n})();`, variant: `const a = singleton(); const b = singleton();`, exercise: `function getConfig() { return singleton(); }` };
    case "currying":
      return { example: `const sum = (a) => (b) => a + b;`, variant: `const add5 = sum(5); add5(2);`, exercise: `const multiply = (a) => (b) => (c) => a * b * c;` };
    case "memoization":
      return { example: `const memo = (fn) => {\n  const cache = new Map();\n  return (x) => cache.get(x) ?? cache.set(x, fn(x)).get(x);\n};`, variant: `const fib = memo((n) => (n < 2 ? n : fib(n - 1) + fib(n - 2)));`, exercise: `function memoJson(fn) { const cache = new Map(); return (args) => { const key = JSON.stringify(args); if (!cache.has(key)) cache.set(key, fn(...args)); return cache.get(key); }; }` };
    case "throttling":
      return { example: `function throttle(fn, wait) {\n  let last = 0;\n  return (...args) => {\n    const now = Date.now();\n    if (now - last >= wait) {\n      last = now;\n      fn(...args);\n    }\n  };\n}`, variant: `const onScroll = throttle(() => console.log("scroll"), 200);`, exercise: `window.addEventListener("scroll", throttle(() => {}, 100));` };
    case "debouncing":
      return { example: `function debounce(fn, wait) {\n  let id;\n  return (...args) => {\n    clearTimeout(id);\n    id = setTimeout(() => fn(...args), wait);\n  };\n}`, variant: `const onInput = debounce(() => console.log("type"), 300);`, exercise: `input.addEventListener("input", debounce(() => {}, 250));` };
    default:
      return defaultSnippet(term);
  }
}

function syntaxSnippet(term: string) {
  switch (term) {
    case "template-literals":
      return { example: "const msg = `Hola ${name}!`;", variant: "const multi = `linea 1\nlinea 2`;", exercise: "function greet(name) { return `Hola ${name}`; }" };
    case "destructuring":
      return { example: `const { name, age } = { name: "Ada", age: 30 };`, variant: `const [first, ...rest] = [1, 2, 3];`, exercise: `function pick(obj) { const { id, ...rest } = obj; return rest; }` };
    case "spread-operator":
      return operatorSnippet("...");
    case "rest-parameters":
      return { example: `function sum(...nums) { return nums.reduce((a, n) => a + n, 0); }`, variant: `const fn = (first, ...rest) => rest;`, exercise: `function logAll(...values) { console.log(values); }` };
    case "arrow-functions":
      return { example: `const sum = (a, b) => a + b;`, variant: `const greet = (name) => \`Hola \${name}\`;`, exercise: `const double = (n) => n * 2;` };
    case "optional-chaining":
      return operatorSnippet("?.");
    case "nullish-coalescing":
      return operatorSnippet("??");
    case "object-literals":
      return { example: `const user = { name: "Ada", active: true };`, variant: `const dynamic = { ["id"]: 1 };`, exercise: `function build(key, value) { return { [key]: value }; }` };
    case "computed-properties":
      return { example: `const key = "score";\nconst obj = { [key]: 100 };`, variant: `const route = (id) => ({ ["user-" + id]: true });`, exercise: `function flag(key) { return { [key]: true }; }` };
    case "iterators":
      return { example: `const iterator = [1, 2][Symbol.iterator]();\nconsole.log(iterator.next());`, variant: `const custom = { [Symbol.iterator]: function* () { yield 1; yield 2; } };`, exercise: `function* range(n) { for (let i = 0; i < n; i++) yield i; }` };
    case "generators":
      return keywordSnippet("yield");
    case "for-of":
      return keywordSnippet("of");
    case "for-in":
      return { example: `const obj = { a: 1, b: 2 };\nfor (const key in obj) console.log(key);`, variant: `for (const key in Object.create(obj)) console.log(key);`, exercise: `function keys(obj) { const list = []; for (const k in obj) list.push(k); return list; }` };
    default:
      return defaultSnippet(term);
  }
}

function nodeSnippet(term: string) {
  switch (term) {
    case "require":
      return { example: `const fs = require("fs");`, variant: `const path = require("path");`, exercise: `const os = require("os");` };
    case "module":
    case "module.exports":
    case "exports":
      return { example: `// math.js\nfunction sum(a, b) { return a + b; }\nmodule.exports = { sum };`, variant: `exports.hello = () => "hola";`, exercise: `const math = require("./math");\nconsole.log(math.sum(2, 3));` };
    case "__dirname":
      return { example: `console.log(__dirname);`, variant: `const full = path.join(__dirname, "file.txt");`, exercise: `function resolveLocal(file) { return path.join(__dirname, file); }` };
    case "__filename":
      return { example: `console.log(__filename);`, variant: `const dir = path.dirname(__filename);`, exercise: `function currentFile() { return __filename; }` };
    case "process":
      return { example: `console.log(process.env.NODE_ENV);`, variant: `process.on("exit", () => console.log("bye"));`, exercise: `function env(key) { return process.env[key]; }` };
    case "Buffer":
      return { example: `const buf = Buffer.from("hola");`, variant: `buf.toString("utf8");`, exercise: `function toBuffer(text) { return Buffer.from(text, "utf8"); }` };
    case "fs":
      return { example: `const fs = require("fs");\nfs.readFileSync("./README.md", "utf8");`, variant: `fs.writeFileSync("./out.txt", "hola");`, exercise: `function exists(path) { return fs.existsSync(path); }` };
    case "path":
      return { example: `const path = require("path");\npath.join("/home", "user");`, variant: `path.resolve("src", "index.js");`, exercise: `function ext(file) { return path.extname(file); }` };
    case "http":
      return { example: `const http = require("http");\nhttp.createServer((req, res) => res.end("ok")).listen(3000);`, variant: `const server = http.createServer();`, exercise: `function status(server) { return server.listening; }` };
    case "events":
      return { example: `const EventEmitter = require("events");\nconst bus = new EventEmitter();\nbus.on("ping", () => console.log("pong"));\nbus.emit("ping");`, variant: `bus.once("ready", () => console.log("once"));`, exercise: `function emitter() { return new (require("events"))(); }` };
    case "readline":
      return { example: `const readline = require("readline");\nconst rl = readline.createInterface({ input: process.stdin, output: process.stdout });`, variant: `rl.question("Nombre? ", (answer) => console.log(answer));`, exercise: `function close(rl) { rl.close(); }` };
    case "crypto":
      return { example: `const crypto = require("crypto");\ncrypto.randomUUID();`, variant: `crypto.createHash("sha256").update("data").digest("hex");`, exercise: `function hash(text) { return crypto.createHash("sha1").update(text).digest("hex"); }` };
    case "os":
      return { example: `const os = require("os");\nconsole.log(os.platform());`, variant: `console.log(os.cpus().length);`, exercise: `function memory() { return os.totalmem(); }` };
    case "cluster":
      return { example: `const cluster = require("cluster");\nif (cluster.isPrimary) cluster.fork();`, variant: `for (let i = 0; i < 2; i++) cluster.fork();`, exercise: `function workers(n) { for (let i = 0; i < n; i++) cluster.fork(); }` };
    case "util":
      return { example: `const util = require("util");\nconst delay = util.promisify(setTimeout);`, variant: `util.inspect({ a: 1 });`, exercise: `function promisify(fn) { return require("util").promisify(fn); }` };
    case "timers":
      return asyncSnippet("setTimeout");
    default:
      return defaultSnippet(term);
  }
}

function jsonSnippet(term: string) {
  switch (term) {
    case "JSON.stringify":
      return { example: `JSON.stringify({ ok: true });`, variant: `JSON.stringify({ date: new Date() });`, exercise: `function toJson(data) { return JSON.stringify(data, null, 2); }` };
    case "JSON.parse":
      return { example: `JSON.parse('{"ok":true}');`, variant: `JSON.parse('{"value":42}', (k, v) => v);`, exercise: `function safeParse(text) { try { return JSON.parse(text); } catch { return null; } }` };
    case "encodeURI":
      return { example: `encodeURI("https://example.com/espacio aquí");`, variant: `encodeURI("https://dev.com/ñ");`, exercise: `function safeUrl(url) { return encodeURI(url); }` };
    case "decodeURI":
      return { example: `decodeURI("https://example.com/espacio%20aqu%C3%AD");`, variant: `decodeURI("https://dev.com/%C3%B1");`, exercise: `function parseUrl(url) { return decodeURI(url); }` };
    case "encodeURIComponent":
      return { example: `encodeURIComponent("hola mundo");`, variant: `encodeURIComponent("a/b");`, exercise: `function encodeParam(value) { return encodeURIComponent(value); }` };
    case "decodeURIComponent":
      return { example: `decodeURIComponent("hola%20mundo");`, variant: `decodeURIComponent("a%2Fb");`, exercise: `function decodeParam(value) { return decodeURIComponent(value); }` };
    case "btoa":
      return { example: `btoa("texto");`, variant: `btoa("hello");`, exercise: `function base64Encode(value) { return btoa(value); }` };
    case "atob":
      return { example: `atob("aGVsbG8=");`, variant: `atob("dGVzdA==");`, exercise: `function base64Decode(value) { return atob(value); }` };
    case "structuredClone":
      return { example: `const original = { user: { name: "Ada" } };\nconst copy = structuredClone(original);`, variant: `copy.user.name = "Linus";`, exercise: `function clone(value) { return structuredClone(value); }` };
    default:
      return defaultSnippet(term);
  }
}

function conceptSnippet(term: string) {
  switch (term) {
    case "event-loop":
      return asyncSnippet("EventLoop");
    case "call-stack":
      return { example: `function a() { b(); }\nfunction b() { c(); }\nfunction c() { console.log("stack"); }\na();`, variant: `console.trace("stack");`, exercise: `// Usa DevTools para inspeccionar el call stack durante un breakpoint.` };
    case "heap":
      return { example: `const big = new Array(1_000_000).fill(0);`, variant: `globalThis.cache = {};`, exercise: `// Observa el heap en DevTools Performance.` };
    case "microtasks":
    case "macrotasks":
      return asyncSnippet("queueMicrotask");
    case "strict-mode":
      return { example: `"use strict";\nfunction demo() { return this; }`, variant: `"use strict";\nconst x = 1;`, exercise: `// Añade "use strict" al inicio de tus módulos.` };
    case "interpreter":
    case "jit-compiler":
    case "v8-engine":
    case "ecmascript":
    case "polyfills":
    case "shims":
    case "transpiling":
    case "tree-shaking":
    case "dead-code-elimination":
      return { example: `// ${term}\n// Concepto teórico: documenta cómo funciona en tu proyecto.\nconsole.log("${term} en acción");`, variant: `// Usa Babel/TS para transpilar y tree-shake\nimport { sum } from "./math";`, exercise: `// Investiga cómo tu bundler maneja ${term}.` };
    default:
      return defaultSnippet(term);
  }
}

const jsKeywordTerms = [
  "let",
  "const",
  "var",
  "function",
  "return",
  "if",
  "else",
  "switch",
  "case",
  "default",
  "break",
  "continue",
  "for",
  "while",
  "do",
  "try",
  "catch",
  "finally",
  "throw",
  "class",
  "extends",
  "constructor",
  "super",
  "import",
  "export",
  "from",
  "as",
  "async",
  "await",
  "new",
  "delete",
  "typeof",
  "instanceof",
  "in",
  "of",
  "yield",
  "this",
  "with",
  "debugger",
  "void",
];

const jsOperators = [
  "+",
  "-",
  "*",
  "/",
  "%",
  "**",
  "++",
  "--",
  "=",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "**=",
  "==",
  "!=",
  "===",
  "!==",
  "<",
  ">",
  "<=",
  ">=",
  "&&",
  "||",
  "!",
  "??",
  "?:",
  "?.",
  "...",
  "|",
  "&",
  "^",
  "<<",
  ">>",
  ">>>",
];

const jsPrimitives = ["string", "number", "boolean", "undefined", "null", "bigint", "symbol", "NaN", "Infinity"];

const jsGlobalObjects = [
  "Object",
  "Function",
  "Boolean",
  "Symbol",
  "BigInt",
  "Number",
  "Math",
  "Date",
  "String",
  "RegExp",
  "Array",
  "Map",
  "Set",
  "WeakMap",
  "WeakSet",
  "Promise",
  "Proxy",
  "Reflect",
  "JSON",
  "Error",
  "EvalError",
  "TypeError",
  "RangeError",
  "SyntaxError",
  "URIError",
  "AggregateError",
  "ArrayBuffer",
  "SharedArrayBuffer",
  "DataView",
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Uint16Array",
  "Int32Array",
  "Uint32Array",
  "Float32Array",
  "Float64Array",
  "Atomics",
  "WebAssembly",
];

const jsArrayMethods = [
  "push",
  "pop",
  "shift",
  "unshift",
  "slice",
  "splice",
  "concat",
  "map",
  "filter",
  "reduce",
  "reduceRight",
  "find",
  "findIndex",
  "findLast",
  "findLastIndex",
  "every",
  "some",
  "includes",
  "indexOf",
  "lastIndexOf",
  "flat",
  "flatMap",
  "reverse",
  "sort",
  "fill",
  "copyWithin",
  "join",
  "toString",
  "entries",
  "keys",
  "values",
  "forEach",
  "from",
  "isArray",
  "of",
];

const jsStringMethods = [
  "charAt",
  "charCodeAt",
  "at",
  "indexOf",
  "lastIndexOf",
  "substring",
  "substr",
  "slice",
  "toUpperCase",
  "toLowerCase",
  "trim",
  "trimStart",
  "trimEnd",
  "replace",
  "replaceAll",
  "split",
  "startsWith",
  "endsWith",
  "includes",
  "repeat",
  "padStart",
  "padEnd",
  "normalize",
  "match",
  "matchAll",
  "search",
  "toString",
  "localeCompare",
];

const jsNumberMath = [
  "toFixed",
  "toPrecision",
  "toExponential",
  "valueOf",
  "Math.abs",
  "Math.ceil",
  "Math.floor",
  "Math.round",
  "Math.trunc",
  "Math.pow",
  "Math.sqrt",
  "Math.random",
  "Math.max",
  "Math.min",
  "Math.sign",
  "Math.imul",
  "Math.clz32",
  "Math.log",
  "Math.exp",
  "Math.sin",
  "Math.cos",
  "Math.tan",
];

const jsDateApi = [
  "getDate",
  "getDay",
  "getFullYear",
  "getHours",
  "getMilliseconds",
  "getMinutes",
  "getMonth",
  "getSeconds",
  "getTime",
  "getTimezoneOffset",
  "setDate",
  "setDay",
  "setFullYear",
  "setHours",
  "setMilliseconds",
  "setMinutes",
  "setMonth",
  "setSeconds",
  "setTime",
  "now",
  "parse",
  "UTC",
];

const jsRegexApi = ["test", "exec", "match", "matchAll", "replace", "search", "split", "flags", "source"];

const jsAsync = [
  "setTimeout",
  "setInterval",
  "clearTimeout",
  "clearInterval",
  "Promise",
  "Promise.resolve",
  "Promise.reject",
  "Promise.all",
  "Promise.allSettled",
  "Promise.race",
  "Promise.any",
  "async",
  "await",
  "queueMicrotask",
  "EventLoop",
  "JobQueue",
  "TickQueue",
  "callback",
];

const jsDomApi = [
  "window",
  "document",
  "querySelector",
  "querySelectorAll",
  "getElementById",
  "getElementsByClassName",
  "getElementsByTagName",
  "createElement",
  "createTextNode",
  "appendChild",
  "prepend",
  "insertBefore",
  "removeChild",
  "replaceChild",
  "cloneNode",
  "innerHTML",
  "outerHTML",
  "textContent",
  "classList",
  "classList.add",
  "classList.remove",
  "classList.toggle",
  "setAttribute",
  "getAttribute",
  "removeAttribute",
  "style",
  "dataset",
  "addEventListener",
  "removeEventListener",
  "dispatchEvent",
  "Event",
  "CustomEvent",
  "MouseEvent",
  "KeyboardEvent",
  "InputEvent",
  "SubmitEvent",
  "TouchEvent",
  "DOMContentLoaded",
  "load",
  "scroll",
  "resize",
];

const jsWebApis = [
  "fetch",
  "AbortController",
  "AbortSignal",
  "localStorage",
  "sessionStorage",
  "Cookies",
  "console",
  "history",
  "location",
  "navigator",
  "Clipboard API",
  "Fullscreen API",
  "Geolocation API",
  "IntersectionObserver",
  "MutationObserver",
  "ResizeObserver",
  "Blob",
  "File",
  "FileReader",
  "FormData",
  "URL",
  "URLSearchParams",
  "WebSocket",
  "BroadcastChannel",
  "Worker",
  "ServiceWorker",
  "Notification",
  "IndexedDB",
  "CacheStorage",
  "Request",
  "Response",
  "Headers",
];

const jsModules = ["import", "export", "export default", "export function", "export const", "import.meta", "import()"];

const jsErrorsDebug = [
  "try",
  "catch",
  "finally",
  "throw",
  "Error",
  "TypeError",
  "SyntaxError",
  "RangeError",
  "ReferenceError",
  "console.log",
  "console.error",
  "console.warn",
  "console.table",
  "console.group",
  "console.time",
  "console.timeEnd",
  "debugger",
];

const jsDataStructures = [
  "Map",
  "Set",
  "WeakMap",
  "WeakSet",
  "ArrayBuffer",
  "TypedArray",
  "DataView",
  "Proxy",
  "Reflect",
  "WeakRef",
  "FinalizationRegistry",
];

const jsPatterns = [
  "callbacks",
  "promises",
  "async-await",
  "closures",
  "hoisting",
  "scope",
  "block-scope",
  "lexical-scope",
  "prototype",
  "inheritance",
  "composition",
  "immutability",
  "event-driven",
  "observer-pattern",
  "factory-pattern",
  "module-pattern",
  "singleton-pattern",
  "pubsub",
  "currying",
  "memoization",
  "throttling",
  "debouncing",
];

const jsSyntaxAdvanced = [
  "template-literals",
  "destructuring",
  "spread-operator",
  "rest-parameters",
  "arrow-functions",
  "optional-chaining",
  "nullish-coalescing",
  "object-literals",
  "computed-properties",
  "iterators",
  "generators",
  "for-of",
  "for-in",
];

const jsNodeBasics = [
  "require",
  "module",
  "module.exports",
  "exports",
  "__dirname",
  "__filename",
  "process",
  "Buffer",
  "fs",
  "path",
  "http",
  "events",
  "readline",
  "crypto",
  "os",
  "cluster",
  "util",
  "timers",
];

const jsJsonUtils = [
  "JSON.stringify",
  "JSON.parse",
  "encodeURI",
  "decodeURI",
  "encodeURIComponent",
  "decodeURIComponent",
  "btoa",
  "atob",
  "structuredClone",
];

const jsConcepts = [
  "event-loop",
  "call-stack",
  "heap",
  "microtasks",
  "macrotasks",
  "strict-mode",
  "interpreter",
  "jit-compiler",
  "v8-engine",
  "ecmascript",
  "polyfills",
  "shims",
  "transpiling",
  "tree-shaking",
  "dead-code-elimination",
];

function buildJsSeed(term: string, kind: JsKind, override: JsDocOverride = {}): SeedTermInput {
  const cleanTerm = term.trim();
  const meta = jsKindMeta[kind];
  const category = jsCategoryByKind[kind];
  const snippets = buildJsSnippets(cleanTerm, kind);
  const translation = override.translation ?? meta.translation(cleanTerm);
  const descriptionEs = override.descriptionEs ?? meta.descriptionEs(cleanTerm);
  const descriptionEn = override.descriptionEn ?? meta.descriptionEn(cleanTerm);
  const whatEs = override.whatEs ?? meta.whatEs(cleanTerm);
  const whatEn = override.whatEn ?? meta.whatEn(cleanTerm);
  const howEs = override.howEs ?? meta.howEs(cleanTerm);
  const howEn = override.howEn ?? meta.howEn(cleanTerm);
  const baseTags = (meta.tags ?? []).concat(["javascript", kind, cleanTerm]).map((tag) => tag.toLowerCase());

  return {
    term: cleanTerm,
    slug: slugify(`js-${cleanTerm.replace(/[^a-z0-9]+/gi, "-")}`),
    translation,
    category,
    descriptionEs,
    descriptionEn,
    aliases: [cleanTerm],
    tags: override.tags ?? baseTags,
    example: override.example ?? snippets.example,
    secondExample: override.secondExample ?? snippets.secondExample,
    exerciseExample: override.exerciseExample ?? snippets.exerciseExample,
    whatEs,
    whatEn,
    howEs,
    howEn,
  };
}

const jsSeedTerms: SeedTermInput[] = [];
const jsSeen = new Set<string>();

function pushJsTerms(list: string[], kind: JsKind) {
  for (const raw of list) {
    const term = raw.trim();
    if (!term) continue;
    const key = term.toLowerCase();
    if (jsSeen.has(key)) continue;
    jsSeen.add(key);
    jsSeedTerms.push(buildJsSeed(term, kind));
  }
}

// Orden: prioriza documentación específica antes de genéricas para evitar duplicados no deseados.
pushJsTerms(jsModules, "module");
pushJsTerms(jsAsync, "async");
pushJsTerms(jsErrorsDebug, "error");
pushJsTerms(jsDataStructures, "data-structure");
pushJsTerms(jsPatterns, "pattern");
pushJsTerms(jsSyntaxAdvanced, "syntax");
pushJsTerms(jsKeywordTerms, "keyword");
pushJsTerms(jsOperators, "operator");
pushJsTerms(jsPrimitives, "primitive");
pushJsTerms(jsGlobalObjects, "global");
pushJsTerms(jsArrayMethods, "array-method");
pushJsTerms(jsStringMethods, "string-method");
pushJsTerms(jsNumberMath, "number-math");
pushJsTerms(jsDateApi, "date");
pushJsTerms(jsRegexApi, "regex");
pushJsTerms(jsDomApi, "dom");
pushJsTerms(jsWebApis, "web-api");
pushJsTerms(jsNodeBasics, "node");
pushJsTerms(jsJsonUtils, "json");
pushJsTerms(jsConcepts, "concept");

const dedupedJsTerms = jsSeedTerms.filter((term) => !cssTermSet.has(term.term.toLowerCase()));
const jsTermSet = new Set([...cssTermSet, ...dedupedJsTerms.map((item) => item.term.toLowerCase())]);

type ReactKind =
  | "hook"
  | "server-hook"
  | "component"
  | "render-api"
  | "event"
  | "prop-pattern"
  | "utility"
  | "lifecycle"
  | "state"
  | "context"
  | "suspense"
  | "server-component"
  | "next-api"
  | "form"
  | "pattern"
  | "error"
  | "rendering"
  | "optimization"
  | "browser-event"
  | "native";

type ReactDocOverride = {
  translation?: string;
  descriptionEs?: string;
  descriptionEn?: string;
  whatEs?: string;
  whatEn?: string;
  howEs?: string;
  howEn?: string;
  example?: ExampleSnippet;
  secondExample?: ExampleSnippet;
  exerciseExample?: ExampleSnippet;
  tags?: string[];
};

const reactKindMeta: Record<
  ReactKind,
  {
    translation: (term: string) => string;
    descriptionEs: (term: string) => string;
    descriptionEn: (term: string) => string;
    whatEs: (term: string) => string;
    whatEn: (term: string) => string;
    howEs: (term: string) => string;
    howEn: (term: string) => string;
    tags?: string[];
  }
> = {
  hook: {
    translation: (term) => `hook ${term} de React`,
    descriptionEs: (term) => `Hook "${term}" para gestionar estado, efectos o referencias en componentes funcionales.`,
    descriptionEn: (term) => `"${term}" hook to manage state, effects, or refs in function components.`,
    whatEs: (term) => `Usa "${term}" para encapsular lógica de render y sincronizar con el ciclo de React.`,
    whatEn: (term) => `Use "${term}" to encapsulate render logic and sync with React's lifecycle.`,
    howEs: () => "Invócalo en el nivel superior del componente y respeta las reglas de hooks.",
    howEn: () => "Call it at the top level of the component and follow the rules of hooks.",
    tags: ["react", "hooks"],
  },
  "server-hook": {
    translation: (term) => `hook server ${term}`,
    descriptionEs: (term) => `Hook de entorno server "${term}" para React 18/Next.js.`,
    descriptionEn: (term) => `Server-side hook "${term}" for React 18/Next.js.`,
    whatEs: (term) => `Ayuda a inyectar o coordinar HTML/estado en renderizado de servidor con "${term}".`,
    whatEn: (term) => `Helps inject or coordinate HTML/state in server rendering with "${term}".`,
    howEs: () => "Úsalo en Server Components o layouts server; no en Client Components.",
    howEn: () => "Use inside Server Components or server layouts; not in Client Components.",
    tags: ["react", "hooks", "server"],
  },
  component: {
    translation: (term) => `componente ${term} de React`,
    descriptionEs: (term) => `Componente base "${term}" que controla envolturas o monitoreo en React.`,
    descriptionEn: (term) => `Base component "${term}" that handles wrapping or monitoring in React.`,
    whatEs: (term) => `Usa "${term}" para estructurar árboles y gestionar renderizado o profiling.`,
    whatEn: (term) => `Use "${term}" to structure trees and manage rendering or profiling.`,
    howEs: () => "Importa desde react y colócalo como wrapper según el contexto.",
    howEn: () => "Import from react and place it as a wrapper as needed.",
    tags: ["react", "components"],
  },
  "render-api": {
    translation: (term) => `API de render ${term}`,
    descriptionEs: (term) => `Función de render/hidratación "${term}" para montar React en el DOM.`,
    descriptionEn: (term) => `Render/hydration function "${term}" to mount React into the DOM.`,
    whatEs: (term) => `Permite montar, hidratar o desmontar árboles React con "${term}".`,
    whatEn: (term) => `Enables mounting, hydrating, or unmounting React trees with "${term}".`,
    howEs: () => "Úsalo en entrypoints de cliente/SSR cuidando el modo concurrente.",
    howEn: () => "Use in client/SSR entrypoints, respecting concurrent mode.",
    tags: ["react", "render"],
  },
  event: {
    translation: (term) => `evento sintético ${term}`,
    descriptionEs: (term) => `Prop de evento "${term}" dentro del sistema de Synthetic Events de React.`,
    descriptionEn: (term) => `"${term}" event prop inside React's Synthetic Events system.`,
    whatEs: (term) => `Captura o emite interacciones del usuario con "${term}".`,
    whatEn: (term) => `Capture or emit user interactions via "${term}".`,
    howEs: () => "Prefija con on* en JSX y maneja preventDefault/stopPropagation según sea necesario.",
    howEn: () => "Use on* in JSX and handle preventDefault/stopPropagation when needed.",
    tags: ["react", "events"],
  },
  "prop-pattern": {
    translation: (term) => `patrón ${term} en React`,
    descriptionEs: (term) => `Patrón de composición/props "${term}" para componentes React.`,
    descriptionEn: (term) => `Composition/props pattern "${term}" for React components.`,
    whatEs: (term) => `Define cómo pasan datos y responsabilidades con el patrón "${term}".`,
    whatEn: (term) => `Defines data flow and responsibility using the "${term}" pattern.`,
    howEs: () => "Documenta la API del componente y valida con TypeScript/PropTypes.",
    howEn: () => "Document the component API and validate with TypeScript/PropTypes.",
    tags: ["react", "patterns"],
  },
  utility: {
    translation: (term) => `utilidad ${term} de React`,
    descriptionEs: (term) => `API utilitaria "${term}" que acompaña el render y creación de elementos.`,
    descriptionEn: (term) => `Utility API "${term}" that complements render and element creation.`,
    whatEs: (term) => `Expone helpers de React como "${term}" para portales o clonación.`,
    whatEn: (term) => `Exposes React helpers like "${term}" for portals or cloning.`,
    howEs: () => "Importa desde react o react-dom y úsalos para manipular el árbol.",
    howEn: () => "Import from react or react-dom to manipulate the tree.",
    tags: ["react", "utilities"],
  },
  lifecycle: {
    translation: (term) => `ciclo de vida ${term}`,
    descriptionEs: (term) => `Método de ciclo de vida legacy "${term}" en componentes de clase.`,
    descriptionEn: (term) => `Legacy lifecycle method "${term}" in class components.`,
    whatEs: (term) => `Coordina efectos y sincronización de clases a través de "${term}".`,
    whatEn: (term) => `Coordinate effects and syncing in classes via "${term}".`,
    howEs: () => "Implementa en componentes extendiendo React.Component y llama super cuando aplique.",
    howEn: () => "Implement in components extending React.Component and call super when needed.",
    tags: ["react", "lifecycle", "legacy"],
  },
  state: {
    translation: (term) => `gestión de estado ${term}`,
    descriptionEs: (term) => `Concepto de estado/updates "${term}" dentro del flujo de render React.`,
    descriptionEn: (term) => `State/update concept "${term}" within React's render flow.`,
    whatEs: (term) => `Controla cómo se leen o actualizan estados con "${term}".`,
    whatEn: (term) => `Controls how state is read or updated via "${term}".`,
    howEs: () => "Usa setters inmutables y batching automático para performance.",
    howEn: () => "Use immutable setters and automatic batching for performance.",
    tags: ["react", "state"],
  },
  context: {
    translation: (term) => `Context API ${term}`,
    descriptionEs: (term) => `Elemento de Context API "${term}" para compartir estado global.`,
    descriptionEn: (term) => `Context API element "${term}" to share global state.`,
    whatEs: (term) => `Propaga valores sin prop drilling usando "${term}".`,
    whatEn: (term) => `Propagate values without prop drilling using "${term}".`,
    howEs: () => "Crea contextos con valores por defecto y memorizados; coloca Provider alto en el árbol.",
    howEn: () => "Create contexts with default/memoized values; place Provider high in the tree.",
    tags: ["react", "context"],
  },
  suspense: {
    translation: (term) => `Suspense/stream ${term}`,
    descriptionEs: (term) => `API de Suspense/streaming "${term}" para coordinación de carga.`,
    descriptionEn: (term) => `Suspense/streaming API "${term}" for coordinating loading.`,
    whatEs: (term) => `Controla límites y carga diferida con "${term}".`,
    whatEn: (term) => `Controls boundaries and deferred loading using "${term}".`,
    howEs: () => "Envuelve componentes con fallbacks claros y usa transiciones para UX fluida.",
    howEn: () => "Wrap components with clear fallbacks and use transitions for smooth UX.",
    tags: ["react", "suspense"],
  },
  "server-component": {
    translation: (term) => `Server Component ${term}`,
    descriptionEs: (term) => `Concepto/etiqueta de Server Components "${term}" en React 18/Next.`,
    descriptionEn: (term) => `Server Components concept/tag "${term}" in React 18/Next.`,
    whatEs: (term) => `Separa lógica cliente/servidor marcando "${term}" en archivos o funciones.`,
    whatEn: (term) => `Split client/server logic by marking "${term}" in files or functions.`,
    howEs: () => "Añade directivas 'use client'/'use server' y mantiene límites claros.",
    howEn: () => "Add 'use client'/'use server' directives and keep boundaries clear.",
    tags: ["react", "server-components"],
  },
  "next-api": {
    translation: (term) => `API de Next.js ${term}`,
    descriptionEs: (term) => `Hook o helper de Next.js "${term}" para navegación o acciones.`,
    descriptionEn: (term) => `Next.js hook/helper "${term}" for navigation or actions.`,
    whatEs: (term) => `Expone utilidades de routing o server actions con "${term}".`,
    whatEn: (term) => `Exposes routing or server action helpers with "${term}".`,
    howEs: () => "Importa desde next/navigation o next/link y úsalo en Client/Server Components según soporte.",
    howEn: () => "Import from next/navigation or next/link and use in Client/Server Components as supported.",
    tags: ["react", "nextjs"],
  },
  form: {
    translation: (term) => `manejo de formularios ${term}`,
    descriptionEs: (term) => `Patrón o hook para formularios "${term}" en React.`,
    descriptionEn: (term) => `Form pattern/hook "${term}" in React.`,
    whatEs: (term) => `Define cómo controlar inputs y envío con "${term}".`,
    whatEn: (term) => `Defines how to control inputs and submissions with "${term}".`,
    howEs: () => "Sincroniza valor con estado, previene recarga y usa refs cuando sea no controlado.",
    howEn: () => "Sync value with state, prevent reload, and use refs when uncontrolled.",
    tags: ["react", "forms"],
  },
  pattern: {
    translation: (term) => `patrón avanzado ${term}`,
    descriptionEs: (term) => `Patrón avanzado de arquitectura "${term}" aplicado a React.`,
    descriptionEn: (term) => `Advanced architecture pattern "${term}" applied to React.`,
    whatEs: (term) => `Mejora reusabilidad y DX implementando "${term}".`,
    whatEn: (term) => `Improves reusability and DX by applying "${term}".`,
    howEs: () => "Extrae lógica en hooks/fábricas y documenta contratos de props/contexto.",
    howEn: () => "Extract logic into hooks/factories and document prop/context contracts.",
    tags: ["react", "patterns"],
  },
  error: {
    translation: (term) => `manejo de errores ${term}`,
    descriptionEs: (term) => `Mecanismo de error/boundary "${term}" en React.`,
    descriptionEn: (term) => `Error/boundary mechanism "${term}" in React.`,
    whatEs: (term) => `Captura y muestra fallbacks seguros con "${term}".`,
    whatEn: (term) => `Capture and render safe fallbacks using "${term}".`,
    howEs: () => "Envuelve ramas con boundaries y registra los errores para depuración.",
    howEn: () => "Wrap branches with boundaries and log errors for debugging.",
    tags: ["react", "errors"],
  },
  rendering: {
    translation: (term) => `renderización ${term}`,
    descriptionEs: (term) => `Concepto de renderización "${term}" dentro del motor Fiber/SSR.`,
    descriptionEn: (term) => `Rendering concept "${term}" within Fiber/SSR.`,
    whatEs: (term) => `Explica cómo React reconcilia o hidrata con "${term}".`,
    whatEn: (term) => `Explains how React reconciles or hydrates via "${term}".`,
    howEs: () => "Relaciona el concepto con performance y fase de commit/render.",
    howEn: () => "Relate the concept to performance and commit/render phases.",
    tags: ["react", "rendering"],
  },
  optimization: {
    translation: (term) => `optimización ${term}`,
    descriptionEs: (term) => `Técnica de optimización "${term}" para evitar renders innecesarios.`,
    descriptionEn: (term) => `Optimization technique "${term}" to avoid unnecessary renders.`,
    whatEs: (term) => `Reduce trabajo en UI mediante "${term}".`,
    whatEn: (term) => `Reduce UI work by applying "${term}".`,
    howEs: () => "Memoriza valores, divide bundles y revisa dependencias.",
    howEn: () => "Memoize values, split bundles, and review dependencies.",
    tags: ["react", "performance"],
  },
  "browser-event": {
    translation: (term) => `tipo de evento ${term}`,
    descriptionEs: (term) => `Tipo de evento usado por React para tipar Synthetic Events: "${term}".`,
    descriptionEn: (term) => `Event type used by React to type Synthetic Events: "${term}".`,
    whatEs: (term) => `Usa "${term}" para tipar handlers y acceso a propiedades del evento.`,
    whatEn: (term) => `Use "${term}" to type handlers and access event properties.`,
    howEs: () => "Importa tipos desde react y asigna en handlers con TypeScript.",
    howEn: () => "Import types from react and assign them to handlers in TypeScript.",
    tags: ["react", "events", "types"],
  },
  native: {
    translation: (term) => `componente React Native ${term}`,
    descriptionEs: (term) => `Elemento clave de React Native "${term}" para UI móvil.`,
    descriptionEn: (term) => `Key React Native element "${term}" for mobile UI.`,
    whatEs: (term) => `Construye UI nativa con el componente "${term}".`,
    whatEn: (term) => `Build native UI using the "${term}" component.`,
    howEs: () => "Importa desde react-native y compón estilos con StyleSheet/useWindowDimensions.",
    howEn: () => "Import from react-native and compose styles with StyleSheet/useWindowDimensions.",
    tags: ["react", "react-native"],
  },
};

function buildReactSnippets(term: string, kind: ReactKind) {
  const titleEs = `Ejemplo ${term}`;
  const titleEn = `${term} example`;
  const variantTitleEs = `Variación ${term}`;
  const variantTitleEn = `${term} variation`;
  const practiceTitleEs = `Práctica ${term}`;
  const practiceTitleEn = `${term} practice`;
  const sample = getReactSample(term, kind);
  const note = reactKindMeta[kind];

  return {
    example: {
      titleEs,
      titleEn,
      code: sample.example,
      noteEs: note.whatEs(term),
      noteEn: note.whatEn(term),
    },
    secondExample: {
      titleEs: variantTitleEs,
      titleEn: variantTitleEn,
      code: sample.variant,
      noteEs: note.howEs(term),
      noteEn: note.howEn(term),
    },
    exerciseExample: {
      titleEs: practiceTitleEs,
      titleEn: practiceTitleEn,
      code: sample.exercise,
      noteEs: "Aplica el patrón en un componente real y documenta dependencias.",
      noteEn: "Apply the pattern in a real component and document dependencies.",
    },
  };
}

function getReactSample(term: string, kind: ReactKind): { example: string; variant: string; exercise: string } {
  if (kind === "hook" || kind === "server-hook") {
    return reactHookSnippet(term);
  }
  if (kind === "component") return reactComponentSnippet(term);
  if (kind === "render-api") return reactRenderSnippet(term);
  if (kind === "event") return reactEventSnippet(term);
  if (kind === "prop-pattern" || kind === "pattern") return reactPatternSnippet(term);
  if (kind === "utility") return reactUtilitySnippet(term);
  if (kind === "lifecycle") return reactLifecycleSnippet(term);
  if (kind === "state") return reactStateSnippet(term);
  if (kind === "context") return reactContextSnippet(term);
  if (kind === "suspense") return reactSuspenseSnippet(term);
  if (kind === "server-component") return reactServerComponentSnippet(term);
  if (kind === "next-api") return reactNextSnippet(term);
  if (kind === "form") return reactFormSnippet(term);
  if (kind === "error") return reactErrorSnippet(term);
  if (kind === "rendering") return reactRenderingSnippet(term);
  if (kind === "optimization") return reactOptimizationSnippet(term);
  if (kind === "browser-event") return reactBrowserEventSnippet(term);
  if (kind === "native") return reactNativeSnippet(term);
  return reactPatternSnippet(term);
}

function reactHookSnippet(term: string) {
  switch (term) {
    case "useState":
      return {
        example: `import { useState } from "react";\nconst Counter = () => {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;\n};`,
        variant: `const Toggle = () => {\n  const [open, setOpen] = useState(false);\n  return <button onClick={() => setOpen((v) => !v)}>{open ? "Cerrar" : "Abrir"}</button>;\n};`,
        exercise: `const useToggle = (initial = false) => {\n  const [value, setValue] = useState(initial);\n  const toggle = () => setValue((v) => !v);\n  return [value, toggle] as const;\n};`,
      };
    case "useEffect":
      return {
        example: `useEffect(() => {\n  const id = setInterval(() => console.log("tick"), 1000);\n  return () => clearInterval(id);\n}, []);`,
        variant: `useEffect(() => {\n  if (!userId) return;\n  fetchUser(userId);\n}, [userId]);`,
        exercise: `function useDocumentTitle(title: string) {\n  useEffect(() => {\n    document.title = title;\n  }, [title]);\n}`,
      };
    case "useMemo":
      return {
        example: `const total = useMemo(() => items.reduce((sum, item) => sum + item.price, 0), [items]);`,
        variant: `const sorted = useMemo(() => [...list].sort(), [list]);`,
        exercise: `const columns = useMemo(() => buildColumns(schema), [schema]);`,
      };
    case "useCallback":
      return {
        example: `const handleSave = useCallback(() => api.save(form), [form]);`,
        variant: `const onClick = useCallback(() => setOpen((v) => !v), []);`,
        exercise: `const useStableHandler = (fn: () => void) => useCallback(fn, [fn]);`,
      };
    case "useRef":
      return {
        example: `const inputRef = useRef<HTMLInputElement>(null);\nuseEffect(() => inputRef.current?.focus(), []);`,
        variant: `const intervalRef = useRef<NodeJS.Timeout>();`,
        exercise: `function useLatest<T>(value: T) {\n  const ref = useRef(value);\n  useEffect(() => { ref.current = value; }, [value]);\n  return ref;\n}`,
      };
    case "useContext":
      return reactContextSnippet("useContext");
    case "useReducer":
      return {
        example: `const [state, dispatch] = useReducer((s, a) => {\n  if (a.type === "inc") return { count: s.count + 1 };\n  return s;\n}, { count: 0 });`,
        variant: `dispatch({ type: "inc" });`,
        exercise: `function useCounter() {\n  return useReducer((s: number, a: "inc" | "dec") => (a === "inc" ? s + 1 : s - 1), 0);\n}`,
      };
    case "useLayoutEffect":
      return {
        example: `useLayoutEffect(() => {\n  const { height } = ref.current?.getBoundingClientRect() || { height: 0 };\n  setHeight(height);\n}, []);`,
        variant: `useLayoutEffect(() => { scrollTo(0, 0); }, []);`,
        exercise: `function useMeasure(ref: React.RefObject<HTMLElement>) {\n  const [rect, setRect] = useState<DOMRect | null>(null);\n  useLayoutEffect(() => { if (ref.current) setRect(ref.current.getBoundingClientRect()); }, [ref]);\n  return rect;\n}`,
      };
    case "useId":
      return {
        example: `const id = useId();\nreturn <label htmlFor={id}>Email<input id={id} /></label>;`,
        variant: `const ids = { name: useId(), password: useId() };`,
        exercise: `function useStableId(prefix: string) { return \`\${prefix}-\${useId()}\`; }`,
      };
    case "useTransition":
      return {
        example: `const [pending, startTransition] = useTransition();\nconst onSearch = (value: string) => startTransition(() => setFilter(value));`,
        variant: `startTransition(() => setPage(p => p + 1));`,
        exercise: `const useDeferredUpdate = () => {\n  const [pending, start] = useTransition();\n  return { pending, start };\n};`,
      };
    case "useDeferredValue":
      return {
        example: `const deferred = useDeferredValue(value);\nconst list = useMemo(() => heavyFilter(data, deferred), [data, deferred]);`,
        variant: `const text = useDeferredValue(search);`,
        exercise: `function useDeferredSearch(term: string) {\n  const deferred = useDeferredValue(term);\n  return useMemo(() => find(term), [deferred]);\n}`,
      };
    case "useSyncExternalStore":
      return {
        example: `const state = useSyncExternalStore(store.subscribe, store.getSnapshot);`,
        variant: `const theme = useSyncExternalStore(themeStore.subscribe, themeStore.snapshot);`,
        exercise: `function useOnline() {\n  return useSyncExternalStore(\n    (cb) => { window.addEventListener("online", cb); window.addEventListener("offline", cb); return () => { window.removeEventListener("online", cb); window.removeEventListener("offline", cb); }; },\n    () => navigator.onLine,\n  );\n}`,
      };
    case "useInsertionEffect":
      return {
        example: `useInsertionEffect(() => {\n  const style = document.createElement("style");\n  style.innerHTML = ".badge { color: red; }";\n  document.head.appendChild(style);\n  return () => style.remove();\n}, []);`,
        variant: `useInsertionEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);`,
        exercise: `function useCssRule(rule: string) {\n  useInsertionEffect(() => {\n    const style = document.createElement("style");\n    style.innerHTML = rule;\n    document.head.appendChild(style);\n    return () => style.remove();\n  }, [rule]);\n}`,
      };
    case "useImperativeHandle":
      return {
        example: `const FancyInput = React.forwardRef((props, ref) => {\n  const inputRef = useRef<HTMLInputElement>(null);\n  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }));\n  return <input ref={inputRef} {...props} />;\n});`,
        variant: `useImperativeHandle(ref, () => ({ reset: () => (inputRef.current!.value = "") }));`,
        exercise: `function useFocusHandle(ref: React.Ref<{ focus: () => void }>) {\n  const inner = useRef<HTMLInputElement>(null);\n  useImperativeHandle(ref, () => ({ focus: () => inner.current?.focus() }));\n  return inner;\n}`,
      };
    case "useDebugValue":
      return {
        example: `function useAuth() {\n  const [user] = useState({ name: "Ada" });\n  useDebugValue(user?.name ?? "guest");\n  return user;\n}`,
        variant: `useDebugValue(isLoading ? "loading" : "ready");`,
        exercise: `function useFeature(flag: boolean) { useDebugValue(flag); return flag; }`,
      };
    case "use":
      return {
        example: `// React experimental\nconst data = use(fetch("/api").then((r) => r.json()));`,
        variant: `const result = use(resource);`,
        exercise: `// Prueba use() en Server Components con promesas/responses.`,
      };
    case "useServerInsertedHTML":
      return {
        example: `import { useServerInsertedHTML } from "next/navigation";\nuseServerInsertedHTML(() => <style id="server-style">body{opacity:1}</style>);`,
        variant: `useServerInsertedHTML(() => <link rel="preload" href="/font.woff2" as="font" />);`,
        exercise: `// Inserta estilos críticos desde el servidor con useServerInsertedHTML.`,
      };
    case "useFormState":
      return {
        example: `const [state, formAction] = useFormState(async (prev, formData) => {\n  return { message: formData.get("name") };\n}, { message: "" });`,
        variant: `const [state, action] = useFormState(actionFn, initialState);`,
        exercise: `// Usa useFormState en formularios server actions para manejar errores.`,
      };
    case "useFormStatus":
      return {
        example: `const { pending } = useFormStatus();\nreturn <button disabled={pending}>Enviar</button>;`,
        variant: `const status = useFormStatus();`,
        exercise: `// Lee pending/submission state dentro de formularios con useFormStatus.`,
      };
    case "useOptimistic":
      return {
        example: `const [optimistic, addOptimistic] = useOptimistic(list, (state, value: string) => [...state, value]);`,
        variant: `addOptimistic("nuevo item");`,
        exercise: `// Renderiza UI optimista mientras llega la mutación real.`,
      };
    case "useActionState":
      return {
        example: `const [state, submitAction] = useActionState(async (prev, formData) => {\n  return { ok: true, name: formData.get("name") };\n}, { ok: false });`,
        variant: `const [state, act] = useActionState(action, initial);`,
        exercise: `// Combina useActionState con server actions para feedback de formularios.`,
      };
    default:
      return {
        example: `// Hook ${term}\n${term}();`,
        variant: `// Variación\n${term}();`,
        exercise: `// Aplica ${term} en un componente real.`,
      };
  }
}

function reactComponentSnippet(term: string) {
  switch (term) {
    case "Fragment":
      return {
        example: `return <>\n  <h1>Título</h1>\n  <p>Descripción</p>\n</>;`,
        variant: `return <React.Fragment key="group">Contenido</React.Fragment>;`,
        exercise: `// Usa Fragment para devolver múltiples nodos sin wrapper extra.`,
      };
    case "Suspense":
      return reactSuspenseSnippet("Suspense");
    case "StrictMode":
      return {
        example: `const root = createRoot(document.getElementById("root")!);\nroot.render(<React.StrictMode><App /></React.StrictMode>);`,
        variant: `<StrictMode><App /></StrictMode>;`,
        exercise: `// Activa StrictMode en desarrollo para detectar efectos inseguros.`,
      };
    case "Profiler":
      return {
        example: `<Profiler id="App" onRender={(id, phase, actual) => console.log(id, phase, actual)}>\n  <App />\n</Profiler>;`,
        variant: `<Profiler id="List" onRender={console.log}><List /></Profiler>;`,
        exercise: `// Usa Profiler para medir rutas críticas.`,
      };
    case "ConcurrentMode":
      return {
        example: `// Concepto histórico, ahora se usa createRoot para modo concurrente\nconst root = createRoot(container);`,
        variant: `// ConcurrentMode ya no se habilita con un componente separado.`,
        exercise: `// Migra a createRoot/hydrateRoot para concurrent rendering.`,
      };
    default:
      return {
        example: `<${term} />`,
        variant: `<${term} prop="demo" />`,
        exercise: `// Coloca ${term} donde necesites monitoreo o envoltura.`,
      };
  }
}

function reactRenderSnippet(term: string) {
  switch (term) {
    case "createRoot":
      return {
        example: `import { createRoot } from "react-dom/client";\nconst root = createRoot(document.getElementById("root")!);\nroot.render(<App />);`,
        variant: `const root = createRoot(container, { onRecoverableError: console.error });`,
        exercise: `// Usa createRoot en entrypoints de cliente.`,
      };
    case "hydrateRoot":
      return {
        example: `import { hydrateRoot } from "react-dom/client";\nhydrateRoot(document, <App />);`,
        variant: `hydrateRoot(container, <App />, { onRecoverableError: console.error });`,
        exercise: `// Hidrata HTML renderizado en servidor con hydrateRoot.`,
      };
    case "render":
      return {
        example: `import { render } from "react-dom";\nrender(<App />, document.getElementById("root"));`,
        variant: `render(<StrictMode><App /></StrictMode>, document.getElementById("root"));`,
        exercise: `// API legacy: migra a createRoot.`,
      };
    case "hydrate":
      return {
        example: `import { hydrate } from "react-dom";\nhydrate(<App />, document.getElementById("root"));`,
        variant: `hydrate(<App />, document.body);`,
        exercise: `// Legacy hydrate: usa hydrateRoot en React 18+.`,
      };
    case "unmountComponentAtNode":
      return {
        example: `import { unmountComponentAtNode } from "react-dom";\nunmountComponentAtNode(container);`,
        variant: `// Limpia contenedor legacy\nunmountComponentAtNode(document.getElementById("root")!);`,
        exercise: `// Usa root.unmount() en createRoot para la alternativa moderna.`,
      };
    case "flushSync":
      return {
        example: `import { flushSync } from "react-dom";\nflushSync(() => setCount((c) => c + 1));`,
        variant: `flushSync(() => { setOpen(false); });`,
        exercise: `// Enfoca un input justo después de actualizar estado con flushSync.`,
      };
    case "startTransition":
      return reactHookSnippet("useTransition");
    default:
      return {
        example: `// Render API ${term}\n${term}();`,
        variant: `// Variante ${term}`,
        exercise: `// Integra ${term} en tu entrypoint.`,
      };
  }
}

function reactEventSnippet(term: string) {
  const prop = term.startsWith("on") ? term : `on${toPascal(term)}`;
  return {
    example: `<button ${prop}={(event) => console.log("${prop}", event.type)}>Click</button>`,
    variant: `<div ${prop}={(e) => e.preventDefault?.()}>Demo</div>`,
    exercise: `// Maneja ${prop} y usa preventDefault/stopPropagation según sea necesario.`,
  };
}

function reactPatternSnippet(term: string) {
  switch (term) {
    case "props":
    case "children":
      return {
        example: `const Card = ({ children }) => <section className="card">{children}</section>;`,
        variant: `<Card><p>Contenido</p></Card>;`,
        exercise: `// Documenta las props con TypeScript/PropTypes.`,
      };
    case "defaultProps":
      return {
        example: `function Button({ variant = "primary" }) { return <button className={variant}>CTA</button>; }`,
        variant: `Button.defaultProps = { variant: "secondary" };`,
        exercise: `// Usa valores por defecto en el destructuring.`,
      };
    case "propTypes":
      return {
        example: `MyComponent.propTypes = { title: PropTypes.string.isRequired };`,
        variant: `Button.propTypes = { onClick: PropTypes.func };`,
        exercise: `// Prefiere TypeScript pero propTypes ayuda en runtime.`,
      };
    case "component composition":
      return {
        example: `const Card = ({ header, children, footer }) => (\n  <article>\n    {header}\n    <div>{children}</div>\n    {footer}\n  </article>\n);`,
        variant: `<Card header={<Header />} footer={<Footer />}>Contenido</Card>;`,
        exercise: `// Divide UI en slots y pásalos como props.`,
      };
    case "render props":
      return {
        example: `const Data = ({ render }) => render({ user: "Ada" });\n<Data render={({ user }) => <p>{user}</p>} />;`,
        variant: `<Data>{({ user }) => <p>{user}</p>}</Data>;`,
        exercise: `// Usa función como hijo para exponer estado interno.`,
      };
    case "controlled components":
      return reactFormSnippet("controlled input");
    case "uncontrolled components":
      return reactFormSnippet("uncontrolled input");
    case "lifting state up":
      return {
        example: `const Parent = () => {\n  const [value, setValue] = useState("");\n  return <Child value={value} onChange={setValue} />;\n};`,
        variant: `<Child value={value} onChange={setValue} />;`,
        exercise: `// Mueve el estado al ancestro común para sincronizar hijos.`,
      };
    case "forwardRef":
      return reactUtilitySnippet("React.forwardRef");
    case "memo":
      return reactUtilitySnippet("React.memo");
    case "lazy":
      return reactUtilitySnippet("React.lazy");
    case "suspense":
    case "Suspense":
      return reactSuspenseSnippet("Suspense");
    case "error boundaries":
      return reactErrorSnippet("error boundaries");
    case "portals":
      return reactUtilitySnippet("ReactDOM.createPortal");
    case "keys":
      return {
        example: `{items.map((item) => <li key={item.id}>{item.name}</li>)}`,
        variant: `<Fragment key={route}>{route}</Fragment>`,
        exercise: `// Usa keys estables en listas para evitar renders inesperados.`,
      };
    case "lists":
      return {
        example: `{list.map((item) => <Item key={item.id} item={item} />)}`,
        variant: `{items.map((value, index) => <li key={index}>{value}</li>)}`,
        exercise: `// Aplica memo y keys únicas en listas grandes.`,
      };
    default:
      return {
        example: `// Patrón ${term}\nconst Component = (props) => <div {...props} />;`,
        variant: `// Variante ${term}`,
        exercise: `// Implementa ${term} en un componente real.`,
      };
  }
}

function reactUtilitySnippet(term: string) {
  switch (term) {
    case "ReactDOM":
      return {
        example: `import * as ReactDOM from "react-dom/client";\nconst root = ReactDOM.createRoot(document.getElementById("root")!);\nroot.render(<App />);`,
        variant: `ReactDOM.flushSync(() => setCount((c) => c + 1));`,
        exercise: `// Usa APIs de ReactDOM para montar y sincronizar render.`,
      };
    case "ReactDOMServer":
      return {
        example: `import { renderToString } from "react-dom/server";\nconst html = renderToString(<App />);`,
        variant: `import { renderToReadableStream } from "react-dom/server";`,
        exercise: `// Genera HTML server-side con ReactDOMServer.`,
      };
    case "ReactDOM.createPortal":
      return {
        example: `const modalRoot = document.getElementById("modal")!;\nreturn ReactDOM.createPortal(children, modalRoot);`,
        variant: `ReactDOM.createPortal(<Alert />, document.body);`,
        exercise: `// Usa portales para overlays/modales fuera del flujo DOM.`,
      };
    case "React.lazy":
      return {
        example: `const LazyComp = React.lazy(() => import("./Comp"));\n<Suspense fallback="Loading..."><LazyComp /></Suspense>`,
        variant: `const Page = React.lazy(() => import("./pages/Home"));`,
        exercise: `// Implementa code splitting con lazy y Suspense.`,
      };
    case "React.memo":
      return {
        example: `const Memoized = React.memo(({ value }) => <div>{value}</div>);`,
        variant: `const FastList = React.memo(List, (prev, next) => prev.ids === next.ids);`,
        exercise: `// Usa memo para evitar re-renders si props no cambian.`,
      };
    case "React.forwardRef":
      return {
        example: `const Input = React.forwardRef((props, ref) => <input ref={ref} {...props} />);`,
        variant: `const Button = React.forwardRef((props, ref) => <button ref={ref}>{props.children}</button>);`,
        exercise: `// Pasa refs a elementos DOM internos desde el padre.`,
      };
    case "React.cloneElement":
      return {
        example: `React.cloneElement(element, { className: "active" });`,
        variant: `React.Children.map(children, child => React.cloneElement(child, { extraProp: true }));`,
        exercise: `// Clona elementos para inyectar props adicionales.`,
      };
    case "React.createElement":
      return {
        example: `React.createElement("div", { className: "box" }, "Hello");`,
        variant: `React.createElement(MyComponent, { id: 1 }, null);`,
        exercise: `// Entiende cómo JSX se compila a createElement.`,
      };
    case "React.Children":
      return {
        example: `React.Children.map(children, (child) => <div className="wrapper">{child}</div>);`,
        variant: `const count = React.Children.count(children);`,
        exercise: `// Itera sobre children de forma segura (maneja null/arrays).`,
      };
    case "React.PureComponent":
    case "React.Component":
      return {
        example: `class Button extends React.PureComponent { render() { return <button>{this.props.children}</button>; } }`,
        variant: `class Base extends React.Component { render() { return <div>{this.props.title}</div>; } }`,
        exercise: `// Usa PureComponent para comparaciones superficiales de props.`,
      };
    default:
      return {
        example: `// Utilidad ${term}\n${term};`,
        variant: `// Variante ${term}`,
        exercise: `// Practica ${term} en tu árbol.`,
      };
  }
}

function reactLifecycleSnippet(term: string) {
  return {
    example: `class Legacy extends React.Component {\n  constructor(props) {\n    super(props);\n    this.state = { ready: false };\n  }\n  ${term}() {\n    console.log("${term}");\n  }\n  render() { return null; }\n}`,
    variant: `class Demo extends React.Component {\n  ${term}() {}\n  render() { return <div />; }\n}`,
    exercise: `// Implementa ${term} para sincronizar efectos en clases.`,
  };
}

function reactStateSnippet(term: string) {
  switch (term) {
    case "state":
    case "setState":
    case "prevState":
      return {
        example: `this.setState((prevState) => ({ count: prevState.count + 1 }));`,
        variant: `const [state, setState] = useState({ ready: false });`,
        exercise: `// Usa funciones updater para leer prevState de forma segura.`,
      };
    case "batching":
    case "automatic batching":
      return {
        example: `setA(1);\nsetB(2);\n// React agrupa estos updates automáticamente`,
        variant: `flushSync(() => setA(3));`,
        exercise: `// Observa batching en eventos y promesas.`,
      };
    case "updaters":
      return {
        example: `setCount((c) => c + 1);`,
        variant: `setItems((items) => items.concat(newItem));`,
        exercise: `// Usa updaters cuando dependes del valor previo.`,
      };
    case "state immutability":
      return {
        example: `setUser((u) => ({ ...u, active: true }));`,
        variant: `setList((list) => list.filter((i) => i.id !== id));`,
        exercise: `// Evita mutar arrays/objetos directamente.`,
      };
    default:
      return {
        example: `// Concepto de estado ${term}`,
        variant: `// Variante ${term}`,
        exercise: `// Aplica ${term} en un caso real.`,
      };
  }
}

function reactContextSnippet(term: string) {
  const base = `const ThemeContext = React.createContext("light");`;
  switch (term) {
    case "createContext":
    case "Context.Provider":
    case "Context.Consumer":
    case "context value":
    case "context default value":
      return {
        example: `${base}\nconst App = () => (\n  <ThemeContext.Provider value="dark">\n    <Child />\n  </ThemeContext.Provider>\n);`,
        variant: `const value = useContext(ThemeContext);`,
        exercise: `// Usa Provider en alto nivel y memoiza el value.`,
      };
    case "useContext":
      return {
        example: `${base}\nfunction Child() { const theme = useContext(ThemeContext); return <p>{theme}</p>; }`,
        variant: `const value = useContext(ThemeContext);`,
        exercise: `// Crea un hook useTheme que envuelva useContext(ThemeContext).`,
      };
    default:
      return {
        example: `${base}`,
        variant: `// Consumidores con useContext`,
        exercise: `// Define valores por defecto claros.`,
      };
  }
}

function reactSuspenseSnippet(term: string) {
  switch (term) {
    case "Suspense":
      return {
        example: `<Suspense fallback={<p>Cargando...</p>}>\n  <Comments />\n</Suspense>`,
        variant: `<Suspense fallback={<Spinner />}><List /></Suspense>`,
        exercise: `// Envuelve fetchers o componentes lazy con un fallback amigable.`,
      };
    case "SuspenseList":
      return {
        example: `<SuspenseList revealOrder="forwards">\n  <Suspense fallback="Cargando A"><A /></Suspense>\n  <Suspense fallback="Cargando B"><B /></Suspense>\n</SuspenseList>`,
        variant: `<SuspenseList tail="collapsed">...</SuspenseList>`,
        exercise: `// Coordina múltiples Suspense con revealOrder.`,
      };
    case "lazy loading":
      return {
        example: `const Settings = React.lazy(() => import("./Settings"));\n<Suspense fallback="..."><Settings /></Suspense>;`,
        variant: `<Suspense fallback={<Spinner />}><Lazy /></Suspense>`,
        exercise: `// Divide el bundle con React.lazy + Suspense.`,
      };
    case "deferred value":
      return reactHookSnippet("useDeferredValue");
    case "startTransition":
      return reactHookSnippet("useTransition");
    case "useTransition":
      return reactHookSnippet("useTransition");
    case "useDeferredValue":
      return reactHookSnippet("useDeferredValue");
    case "streaming server rendering":
      return {
        example: `import { renderToReadableStream } from "react-dom/server";\nconst stream = await renderToReadableStream(<App />);`,
        variant: `// Usa en Next.js con streaming responses`,
        exercise: `// Implementa SSR streaming en rutas server.`,
      };
    default:
      return {
        example: `// Suspense ${term}`,
        variant: `// Variante ${term}`,
        exercise: `// Aplica ${term} en un boundary.`,
      };
  }
}

function reactServerComponentSnippet(term: string) {
  switch (term) {
    case "server components":
    case '"use server"':
    case "server actions":
      return {
        example: `"use server";\nexport async function action(formData: FormData) {\n  return await save(formData);\n}`,
        variant: `// Server Component\nexport default async function Page() {\n  const data = await fetchData();\n  return <List data={data} />;\n}`,
        exercise: `// Marca server actions con "use server" y evita APIs del cliente.`,
      };
    case "client components":
    case '"use client"':
      return {
        example: `"use client";\nimport { useState } from "react";\nexport default function Button() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;\n}`,
        variant: `// Coloca "use client" al inicio del archivo.`,
        exercise: `// Separa UI interactiva en Client Components.`,
      };
    case "async components":
      return {
        example: `export default async function Page() {\n  const data = await fetchData();\n  return <pre>{JSON.stringify(data)}</pre>;\n}`,
        variant: `// Server Component async`,
        exercise: `// Usa async Server Components para data fetching.`,
      };
    case "RSC boundaries":
    case "streaming rendering":
      return reactSuspenseSnippet("streaming server rendering");
    default:
      return {
        example: `// Concepto ${term} en RSC`,
        variant: `// Marca límites server/cliente`,
        exercise: `// Define qué va al server y qué al client.`,
      };
  }
}

function reactNextSnippet(term: string) {
  switch (term) {
    case "useRouter":
      return {
        example: `"use client";\nimport { useRouter } from "next/navigation";\nconst router = useRouter();\nrouter.push("/dashboard");`,
        variant: `router.replace("/login");`,
        exercise: `// Usa useRouter en Client Components para navegación imperativa.`,
      };
    case "useSearchParams":
      return {
        example: `"use client";\nconst searchParams = useSearchParams();\nconst q = searchParams.get("q");`,
        variant: `const page = searchParams.get("page");`,
        exercise: `// Lee query params reactivos con useSearchParams.`,
      };
    case "usePathname":
      return {
        example: `"use client";\nconst path = usePathname();`,
        variant: `if (usePathname() === "/") { /* ... */ }`,
        exercise: `// Cambia breadcrumbs según pathname.`,
      };
    case "useParams":
      return {
        example: `"use client";\nconst params = useParams();\nconst id = params.id as string;`,
        variant: `const locale = params.locale;`,
        exercise: `// Usa useParams en páginas dinámicas.`,
      };
    case "Link":
      return {
        example: `import Link from "next/link";\n<Link href="/dashboard">Ir</Link>;`,
        variant: `<Link href={{ pathname: "/post", query: { id: 1 } }}>Post</Link>;`,
        exercise: `// Usa Link para navegación declarativa con prefetch.`,
      };
    case "Image":
      return {
        example: `import Image from "next/image";\n<Image src="/logo.png" alt="Logo" width={120} height={40} />;`,
        variant: `<Image src="https://..." fill alt="Hero" />;`,
        exercise: `// Configura domains en next.config para imágenes remotas.`,
      };
    case "redirect":
    case "notFound":
      return {
        example: `import { ${term} } from "next/navigation";\n${term}();`,
        variant: `if (!user) ${term}();`,
        exercise: `// Usa en Server Components o actions para redirecciones/404.`,
      };
    case "Route Handlers":
      return {
        example: `export async function GET() { return Response.json({ ok: true }); }`,
        variant: `export async function POST(req: Request) { const body = await req.json(); return Response.json(body); }`,
        exercise: `// Implementa rutas en app/api/**/route.ts.`,
      };
    default:
      return {
        example: `// Next.js API ${term}`,
        variant: `// Variante ${term}`,
        exercise: `// Aplica ${term} en rutas o componentes.`,
      };
  }
}

function reactFormSnippet(term: string) {
  switch (term) {
    case "controlled input":
      return {
        example: `const [value, setValue] = useState("");\n<input value={value} onChange={(e) => setValue(e.target.value)} />;`,
        variant: `<textarea value={bio} onChange={(e) => setBio(e.target.value)} />;`,
        exercise: `// Usa estado y onChange para controlar el input.`,
      };
    case "uncontrolled input":
      return {
        example: `const ref = useRef<HTMLInputElement>(null);\n<form onSubmit={(e) => { e.preventDefault(); console.log(ref.current?.value); }}>\n  <input ref={ref} defaultValue="hola" />\n</form>;`,
        variant: `<input defaultValue="valor" />;`,
        exercise: `// Usa refs para leer valores cuando no necesitas render controlado.`,
      };
    case "useFormState":
      return reactHookSnippet("useFormState");
    case "useFormStatus":
      return reactHookSnippet("useFormStatus");
    case "onSubmit":
      return {
        example: `<form onSubmit={(e) => { e.preventDefault(); save(); }}>\n  <button>Enviar</button>\n</form>;`,
        variant: `<form onSubmit={handleSubmit}>...</form>;`,
        exercise: `// Siempre previene reload y valida antes de enviar.`,
      };
    case "preventDefault":
      return {
        example: `<a href="/action" onClick={(e) => e.preventDefault()}>Link</a>`,
        variant: `<form onSubmit={(e) => { e.preventDefault(); submit(); }} />;`,
        exercise: `// Usa preventDefault en formularios controlados.`,
      };
    case "refs for forms":
      return {
        example: `const formRef = useRef<HTMLFormElement>(null);`,
        variant: `formRef.current?.reset();`,
        exercise: `// Maneja reset/enfoque con refs.`,
      };
    default:
      return {
        example: `// Form term ${term}\n<form />`,
        variant: `<input />`,
        exercise: `// Aplica ${term} en manejo de formularios.`,
      };
  }
}

function reactErrorSnippet(term: string) {
  if (term === "error boundaries" || term === "componentDidCatch") {
    return {
      example: `class Boundary extends React.Component {\n  state = { hasError: false };\n  componentDidCatch(error) {\n    this.setState({ hasError: true });\n    console.error(error);\n  }\n  render() {\n    if (this.state.hasError) return <p>Fallback</p>;\n    return this.props.children;\n  }\n}`,
      variant: `<Boundary><App /></Boundary>;`,
      exercise: `// Envuelve ramas propensas a error con boundaries.`,
    };
  }
  if (term === "fallback UI" || term === "Suspense fallback") {
    return reactSuspenseSnippet("Suspense");
  }
  if (term === "try/catch inside effects") {
    return {
      example: `useEffect(() => {\n  const run = async () => {\n    try { await fetchData(); } catch (e) { setError(e as Error); }\n  };\n  run();\n}, []);`,
      variant: `// Manejo de errores dentro de efectos`,
      exercise: `// Envuelve código async en efectos con try/catch.`,
    };
  }
  return {
    example: `// Manejo de error ${term}`,
    variant: `// Variante ${term}`,
    exercise: `// Implementa ${term} en tu flujo de error.`,
  };
}

function reactRenderingSnippet(term: string) {
  return {
    example: `// Concepto ${term} en React\nconsole.log("${term}");`,
    variant: `// Relaciona ${term} con Fiber y commit/render phases`,
    exercise: `// Documenta cómo ${term} afecta performance.`,
  };
}

function reactOptimizationSnippet(term: string) {
  switch (term) {
    case "react memo":
    case "React.memo":
      return {
        example: `const Memo = React.memo(function List({ items }) { return <ul>{items.map((i) => <li key={i}>{i}</li>)}</ul>; });`,
        variant: `const Button = memo(ButtonBase);`,
        exercise: `// Usa memo cuando las props cambian poco y son estables.`,
      };
    case "useMemo":
    case "useCallback":
      return reactHookSnippet(term);
    case "render blocking":
    case "tearing":
    case "batch updates":
    case "avoid re-renders":
    case "dependency arrays":
    case "code splitting":
    case "tree shaking":
    case "dynamic imports":
      return {
        example: `// Optimización ${term}\n// Revisa dependencias y divide bundles cuando sea posible.`,
        variant: `// Aplica ${term} según el caso.`,
        exercise: `// Mide impacto de ${term} con Profiler.`,
      };
    default:
      return reactRenderingSnippet(term);
  }
}

function reactBrowserEventSnippet(term: string) {
  return {
    example: `import type { ${term} } from "react";\nconst handle: ${term}<HTMLButtonElement> = (event) => {\n  console.log(event.type);\n};`,
    variant: `const onInput: ${term}<HTMLInputElement> = (e) => e.preventDefault();`,
    exercise: `// Tipar handlers con ${term} mejora DX.`,
  };
}

function reactNativeSnippet(term: string) {
  switch (term) {
    case "View":
    case "Text":
    case "ScrollView":
    case "TouchableOpacity":
    case "FlatList":
    case "SectionList":
    case "Pressable":
      return {
        example: `import { ${term} } from "react-native";\n<${term} />;`,
        variant: `<${term} style={{ padding: 12 }}>Contenido</${term}>;`,
        exercise: `// Compón ${term} con estilos via StyleSheet.`,
      };
    case "useWindowDimensions":
      return {
        example: `const { width, height } = useWindowDimensions();`,
        variant: `const isTablet = useWindowDimensions().width > 768;`,
        exercise: `// Adapta layouts según dimensiones.`,
      };
    case "StyleSheet":
      return {
        example: `const styles = StyleSheet.create({ container: { padding: 16 } });`,
        variant: `<View style={styles.container} />;`,
        exercise: `// Usa StyleSheet para validar claves de estilo.`,
      };
    default:
      return {
        example: `// React Native ${term}`,
        variant: `// Variante ${term}`,
        exercise: `// Implementa ${term} en un componente móvil.`,
      };
  }
}

function buildReactSeed(term: string, kind: ReactKind, override: ReactDocOverride = {}): SeedTermInput {
  const cleanTerm = term.trim();
  const meta = reactKindMeta[kind];
  const snippets = buildReactSnippets(cleanTerm, kind);
  const translation = override.translation ?? meta.translation(cleanTerm);
  const descriptionEs = override.descriptionEs ?? meta.descriptionEs(cleanTerm);
  const descriptionEn = override.descriptionEn ?? meta.descriptionEn(cleanTerm);
  const whatEs = override.whatEs ?? meta.whatEs(cleanTerm);
  const whatEn = override.whatEn ?? meta.whatEn(cleanTerm);
  const howEs = override.howEs ?? meta.howEs(cleanTerm);
  const howEn = override.howEn ?? meta.howEn(cleanTerm);
  const baseTags = (meta.tags ?? []).concat(["react", kind, cleanTerm]).map((tag) => tag.toLowerCase());

  return {
    term: cleanTerm,
    slug: slugify(`react-${cleanTerm.replace(/[^a-z0-9]+/gi, "-")}`),
    translation,
    category: Category.frontend,
    descriptionEs,
    descriptionEn,
    aliases: [cleanTerm],
    tags: override.tags ?? baseTags,
    example: override.example ?? snippets.example,
    secondExample: override.secondExample ?? snippets.secondExample,
    exerciseExample: override.exerciseExample ?? snippets.exerciseExample,
    whatEs,
    whatEn,
    howEs,
    howEn,
  };
}

const reactSeedTerms: SeedTermInput[] = [];
const reactSeen = new Set<string>();

function pushReactTerms(list: string[], kind: ReactKind) {
  for (const raw of list) {
    const term = raw.trim();
    if (!term) continue;
    const key = term.toLowerCase();
    if (reactSeen.has(key) || jsTermSet.has(key)) continue;
    reactSeen.add(key);
    reactSeedTerms.push(buildReactSeed(term, kind));
  }
}

const reactHooks = [
  "useState",
  "useEffect",
  "useMemo",
  "useCallback",
  "useRef",
  "useContext",
  "useReducer",
  "useLayoutEffect",
  "useId",
  "useTransition",
  "useDeferredValue",
  "useSyncExternalStore",
  "useInsertionEffect",
  "useImperativeHandle",
  "useDebugValue",
  "use",
];

const reactServerHooks = ["useServerInsertedHTML", "useFormState", "useFormStatus", "useOptimistic", "useActionState"];

const reactComponents = ["Fragment", "Suspense", "StrictMode", "Profiler", "ConcurrentMode"];

const reactRenderApis = ["createRoot", "hydrateRoot", "render", "hydrate", "unmountComponentAtNode", "flushSync", "startTransition"];

const reactEvents = [
  "onClick",
  "onDoubleClick",
  "onMouseDown",
  "onMouseUp",
  "onMouseMove",
  "onMouseEnter",
  "onMouseLeave",
  "onMouseOver",
  "onMouseOut",
  "onChange",
  "onInput",
  "onSubmit",
  "onFocus",
  "onBlur",
  "onKeyDown",
  "onKeyUp",
  "onKeyPress",
  "onScroll",
  "onWheel",
  "onDrag",
  "onDragStart",
  "onDragEnd",
  "onDragEnter",
  "onDragLeave",
  "onDragOver",
  "onDrop",
  "onCopy",
  "onCut",
  "onPaste",
  "onTouchStart",
  "onTouchMove",
  "onTouchEnd",
  "onPointerDown",
  "onPointerUp",
  "onPointerMove",
];

const reactPropPatterns = [
  "props",
  "children",
  "defaultProps",
  "propTypes",
  "component composition",
  "render props",
  "controlled components",
  "uncontrolled components",
  "lifting state up",
  "forwardRef",
  "memo",
  "lazy",
  "suspense",
  "error boundaries",
  "portals",
  "keys",
  "lists",
];

const reactUtilities = [
  "ReactDOM",
  "ReactDOMServer",
  "ReactDOM.createPortal",
  "React.lazy",
  "React.memo",
  "React.forwardRef",
  "React.cloneElement",
  "React.createElement",
  "React.Children",
  "React.PureComponent",
  "React.Component",
];

const reactLifecycle = [
  "constructor",
  "componentDidMount",
  "componentDidUpdate",
  "componentWillUnmount",
  "shouldComponentUpdate",
  "getDerivedStateFromProps",
  "getSnapshotBeforeUpdate",
  "componentDidCatch",
];

const reactState = ["state", "setState", "prevState", "batching", "automatic batching", "updaters", "state immutability"];

const reactContext = ["createContext", "useContext", "Context.Provider", "Context.Consumer", "context value", "context default value"];

const reactSuspenseApis = ["Suspense", "SuspenseList", "lazy loading", "deferred value", "startTransition", "useTransition", "useDeferredValue", "streaming server rendering"];

const reactServerComponents = ["server components", "client components", '"use client"', '"use server"', "server actions", "async components", "streaming rendering", "RSC boundaries"];

const reactNextApis = ["useRouter", "useSearchParams", "usePathname", "useParams", "Link", "Image", "redirect", "notFound", "server actions", "Route Handlers"];

const reactForms = ["controlled input", "uncontrolled input", "useFormState", "useFormStatus", "onSubmit", "preventDefault", "refs for forms"];

const reactPatterns = [
  "custom hooks",
  "compound components",
  "controlled props pattern",
  "state reducer pattern",
  "prop getters",
  "context module functions",
  "function as child",
  "hooks factory",
  "side effects cleanup",
  "debounced inputs",
  "throttled inputs",
  "optimistic UI",
  "infinite scrolling",
  "virtualized lists",
  "portal pattern",
  "dispatcher",
];

const reactErrors = ["error boundaries", "componentDidCatch", "fallback UI", "try/catch inside effects", "Suspense fallback"];

const reactRendering = [
  "reconciliation",
  "diffing algorithm",
  "fiber",
  "commit phase",
  "render phase",
  "hydration",
  "partial hydration",
  "selective hydration",
  "ISR",
  "CSR",
  "SSR",
  "SSG",
];

const reactOptimizations = [
  "react memo",
  "useMemo",
  "useCallback",
  "render blocking",
  "tearing",
  "batch updates",
  "avoid re-renders",
  "dependency arrays",
  "code splitting",
  "tree shaking",
  "dynamic imports",
];

const reactBrowserEvents = ["FormEvent", "MouseEvent", "KeyboardEvent", "TouchEvent", "WheelEvent", "FocusEvent", "SyntheticEvent"];

const reactNative = ["View", "Text", "ScrollView", "TouchableOpacity", "useWindowDimensions", "StyleSheet", "FlatList", "SectionList", "Pressable"];

pushReactTerms(reactHooks, "hook");
pushReactTerms(reactServerHooks, "server-hook");
pushReactTerms(reactComponents, "component");
pushReactTerms(reactRenderApis, "render-api");
pushReactTerms(reactEvents, "event");
pushReactTerms(reactPropPatterns, "prop-pattern");
pushReactTerms(reactUtilities, "utility");
pushReactTerms(reactLifecycle, "lifecycle");
pushReactTerms(reactState, "state");
pushReactTerms(reactContext, "context");
pushReactTerms(reactSuspenseApis, "suspense");
pushReactTerms(reactServerComponents, "server-component");
pushReactTerms(reactNextApis, "next-api");
pushReactTerms(reactForms, "form");
pushReactTerms(reactPatterns, "pattern");
pushReactTerms(reactErrors, "error");
pushReactTerms(reactRendering, "rendering");
pushReactTerms(reactOptimizations, "optimization");
pushReactTerms(reactBrowserEvents, "browser-event");
pushReactTerms(reactNative, "native");

const dedupedReactTerms = reactSeedTerms.filter((term) => !jsTermSet.has(term.term.toLowerCase()));
const reactTermSet = new Set([...jsTermSet, ...dedupedReactTerms.map((item) => item.term.toLowerCase())]);

type TsKind =
  | "keyword"
  | "type-system"
  | "utility"
  | "generic"
  | "narrowing"
  | "function"
  | "class"
  | "interface"
  | "module"
  | "decorator"
  | "promise"
  | "error"
  | "assertion"
  | "react-ts"
  | "dom"
  | "config"
  | "compiler"
  | "pattern"
  | "node-ts";

type TsDocOverride = {
  translation?: string;
  descriptionEs?: string;
  descriptionEn?: string;
  whatEs?: string;
  whatEn?: string;
  howEs?: string;
  howEn?: string;
  example?: ExampleSnippet;
  secondExample?: ExampleSnippet;
  exerciseExample?: ExampleSnippet;
  tags?: string[];
};

const tsKindMeta: Record<
  TsKind,
  {
    translation: (term: string) => string;
    descriptionEs: (term: string) => string;
    descriptionEn: (term: string) => string;
    whatEs: (term: string) => string;
    whatEn: (term: string) => string;
    howEs: (term: string) => string;
    howEn: (term: string) => string;
    tags?: string[];
  }
> = {
  keyword: {
    translation: (term) => `palabra clave ${term} en TypeScript`,
    descriptionEs: (term) => `"${term}" es parte de la sintaxis central de TypeScript.`,
    descriptionEn: (term) => `"${term}" is part of TypeScript core syntax.`,
    whatEs: (term) => `Define estructuras o contratos con "${term}".`,
    whatEn: (term) => `Defines structures or contracts using "${term}".`,
    howEs: () => "Declara tipos e interfaces en el nivel superior o en módulos.",
    howEn: () => "Declare types/interfaces at top-level or inside modules.",
    tags: ["typescript", "syntax"],
  },
  "type-system": {
    translation: (term) => `tipo avanzado ${term}`,
    descriptionEs: (term) => `Construcción de tipos "${term}" para modelar datos en TS.`,
    descriptionEn: (term) => `Type construction "${term}" to model data in TS.`,
    whatEs: (term) => `Usa "${term}" para describir dominios con seguridad de tipos.`,
    whatEn: (term) => `Use "${term}" to describe domains with type safety.`,
    howEs: () => "Combina tipos y utilidades para componer contratos expresivos.",
    howEn: () => "Combine types and utilities to compose expressive contracts.",
    tags: ["typescript", "types"],
  },
  utility: {
    translation: (term) => `utility type ${term}`,
    descriptionEs: (term) => `Utility Type "${term}" provisto por TS para transformar tipos.`,
    descriptionEn: (term) => `Utility Type "${term}" provided by TS to transform types.`,
    whatEs: (term) => `Ajusta propiedades o picks con "${term}".`,
    whatEn: (term) => `Adjust properties or picks using "${term}".`,
    howEs: () => "Aplica utilidades sobre tipos existentes y compón varias en cadena.",
    howEn: () => "Apply utilities over existing types and compose multiple in sequence.",
    tags: ["typescript", "utility-types"],
  },
  generic: {
    translation: (term) => `genérico ${term}`,
    descriptionEs: (term) => `Característica genérica "${term}" para parametrizar tipos.`,
    descriptionEn: (term) => `Generic feature "${term}" to parametrize types.`,
    whatEs: (term) => `Generaliza contratos con parámetros de tipo mediante "${term}".`,
    whatEn: (term) => `Generalize contracts with type parameters using "${term}".`,
    howEs: () => "Declara <T> y agrega constraints con extends/infer según el caso.",
    howEn: () => "Declare <T> and add constraints with extends/infer as needed.",
    tags: ["typescript", "generics"],
  },
  narrowing: {
    translation: (term) => `narrowing ${term}`,
    descriptionEs: (term) => `Técnica de refinamiento de tipos "${term}".`,
    descriptionEn: (term) => `Type refinement technique "${term}".`,
    whatEs: (term) => `Reduce un union a casos seguros con "${term}".`,
    whatEn: (term) => `Reduce a union into safe cases using "${term}".`,
    howEs: () => "Combina guardas (typeof, in, instanceof) y exhaustive checks.",
    howEn: () => "Combine guards (typeof, in, instanceof) with exhaustive checks.",
    tags: ["typescript", "narrowing"],
  },
  function: {
    translation: (term) => `función ${term} en TS`,
    descriptionEs: (term) => `Firma o característica de funciones "${term}" en TS.`,
    descriptionEn: (term) => `Function signature/feature "${term}" in TS.`,
    whatEs: (term) => `Define cómo tipar funciones con "${term}".`,
    whatEn: (term) => `Defines how to type functions using "${term}".`,
    howEs: () => "Declara tipos explícitos de parámetros, this y retornos.",
    howEn: () => "Declare explicit parameter, this, and return types.",
    tags: ["typescript", "functions"],
  },
  class: {
    translation: (term) => `clase ${term} en TS`,
    descriptionEs: (term) => `Característica de clases "${term}" con tipos estáticos.`,
    descriptionEn: (term) => `Class feature "${term}" with static typing.`,
    whatEs: (term) => `Controla visibilidad y herencia con "${term}".`,
    whatEn: (term) => `Control visibility and inheritance using "${term}".`,
    howEs: () => "Declara modificadores (public/protected/private/readonly) y campos tipados.",
    howEn: () => "Declare modifiers (public/protected/private/readonly) and typed fields.",
    tags: ["typescript", "classes"],
  },
  interface: {
    translation: (term) => `interface ${term}`,
    descriptionEs: (term) => `Interfaces y merging "${term}" para contratos estructurales.`,
    descriptionEn: (term) => `Interfaces and merging "${term}" for structural contracts.`,
    whatEs: (term) => `Define shape y extensiones con "${term}".`,
    whatEn: (term) => `Defines shape and extensions using "${term}".`,
    howEs: () => "Extiende interfaces o combínalas con tipos según convenga.",
    howEn: () => "Extend interfaces or combine with types as needed.",
    tags: ["typescript", "interfaces"],
  },
  module: {
    translation: (term) => `módulos ${term}`,
    descriptionEs: (term) => `Sistema de módulos "${term}" en TS (ESM/CJS/ambient).`,
    descriptionEn: (term) => `Module system "${term}" in TS (ESM/CJS/ambient).`,
    whatEs: (term) => `Organiza código y tipos con "${term}".`,
    whatEn: (term) => `Organize code and types using "${term}".`,
    howEs: () => "Declara imports/exports y configs para interoperabilidad.",
    howEn: () => "Declare imports/exports and configs for interoperability.",
    tags: ["typescript", "modules"],
  },
  decorator: {
    translation: (term) => `decorador ${term}`,
    descriptionEs: (term) => `Decorador "${term}" aplicado a clases, métodos o propiedades.`,
    descriptionEn: (term) => `Decorator "${term}" applied to classes, methods, or properties.`,
    whatEs: (term) => `Anota y modifica metadatos/definiciones con "${term}".`,
    whatEn: (term) => `Annotate and modify metadata/definitions using "${term}".`,
    howEs: () => "Habilita decorators en tsconfig y define factories con reflect-metadata cuando aplique.",
    howEn: () => "Enable decorators in tsconfig and define factories with reflect-metadata when applicable.",
    tags: ["typescript", "decorators", "experimental"],
  },
  promise: {
    translation: (term) => `promesa ${term} en TS`,
    descriptionEs: (term) => `Tipado de promesas y async "${term}" en TS.`,
    descriptionEn: (term) => `Promise/async typing "${term}" in TS.`,
    whatEs: (term) => `Modela flujos async con tipos seguros usando "${term}".`,
    whatEn: (term) => `Model async flows with safe types using "${term}".`,
    howEs: () => "Declara funciones async, Awaited y PromiseLike cuando corresponda.",
    howEn: () => "Declare async functions, Awaited, and PromiseLike when needed.",
    tags: ["typescript", "async"],
  },
  error: {
    translation: (term) => `manejo de errores ${term} en TS`,
    descriptionEs: (term) => `Patrón de error/seguridad "${term}" en TypeScript.`,
    descriptionEn: (term) => `Error/safety pattern "${term}" in TypeScript.`,
    whatEs: (term) => `Mejora robustez y exhaustividad con "${term}".`,
    whatEn: (term) => `Improve robustness and exhaustiveness using "${term}".`,
    howEs: () => "Tipa errores como unknown y usa asserts/never para exhaustividad.",
    howEn: () => "Type errors as unknown and use asserts/never for exhaustiveness.",
    tags: ["typescript", "errors"],
  },
  assertion: {
    translation: (term) => `aserción ${term}`,
    descriptionEs: (term) => `Aserción de tipos "${term}" para guiar el checker.`,
    descriptionEn: (term) => `Type assertion "${term}" to guide the checker.`,
    whatEs: (term) => `Fuerza o estrecha tipos con "${term}" bajo tu responsabilidad.`,
    whatEn: (term) => `Force or narrow types with "${term}" at your responsibility.`,
    howEs: () => "Usa assertions con cautela y prefiere guards cuando sea posible.",
    howEn: () => "Use assertions sparingly and prefer guards when possible.",
    tags: ["typescript", "assertions"],
  },
  "react-ts": {
    translation: (term) => `tipado React ${term}`,
    descriptionEs: (term) => `Tipo clave de React+TS "${term}" para props/JSX.`,
    descriptionEn: (term) => `Key React+TS type "${term}" for props/JSX.`,
    whatEs: (term) => `Tipa componentes y JSX con "${term}".`,
    whatEn: (term) => `Type components and JSX using "${term}".`,
    howEs: () => "Importa tipos desde react y usa genéricos para props y estados.",
    howEn: () => "Import types from react and use generics for props and state.",
    tags: ["typescript", "react"],
  },
  dom: {
    translation: (term) => `tipo DOM ${term}`,
    descriptionEs: (term) => `Tipo DOM "${term}" disponible en lib DOM de TS.`,
    descriptionEn: (term) => `DOM type "${term}" available in TS DOM lib.`,
    whatEs: (term) => `Tipa handlers y refs del navegador con "${term}".`,
    whatEn: (term) => `Type browser handlers and refs using "${term}".`,
    howEs: () => "Habilita lib DOM en tsconfig y exporta tipos desde eventos.",
    howEn: () => "Enable DOM lib in tsconfig and export types from events.",
    tags: ["typescript", "dom"],
  },
  config: {
    translation: (term) => `opción tsconfig ${term}`,
    descriptionEs: (term) => `Bandera de compilador "${term}" dentro de tsconfig.json.`,
    descriptionEn: (term) => `Compiler flag "${term}" in tsconfig.json.`,
    whatEs: (term) => `Controla salida, módulos o estrictos con "${term}".`,
    whatEn: (term) => `Controls output, modules, or strictness via "${term}".`,
    howEs: () => "Configura flags según target/build y comparte tsconfig base.",
    howEn: () => "Configure flags per target/build and share a base tsconfig.",
    tags: ["typescript", "config"],
  },
  compiler: {
    translation: (term) => `concepto compilador ${term}`,
    descriptionEs: (term) => `Concepto del compilador/type checker "${term}".`,
    descriptionEn: (term) => `Compiler/type checker concept "${term}".`,
    whatEs: (term) => `Entiende cómo TS analiza tipos a través de "${term}".`,
    whatEn: (term) => `Understand how TS analyzes types through "${term}".`,
    howEs: () => "Relaciónalo con pipeline (parse, check, emit) y tooling.",
    howEn: () => "Relate it to pipeline (parse, check, emit) and tooling.",
    tags: ["typescript", "compiler"],
  },
  pattern: {
    translation: (term) => `patrón avanzado ${term} en TS`,
    descriptionEs: (term) => `Patrón avanzado tipado "${term}" para modelar dominios.`,
    descriptionEn: (term) => `Advanced typed pattern "${term}" to model domains.`,
    whatEs: (term) => `Aplica técnicas de unions, guards y utilidades en "${term}".`,
    whatEn: (term) => `Apply unions, guards, and utilities in "${term}".`,
    howEs: () => "Implementa el patrón con tipos exhaustivos y pruebas.",
    howEn: () => "Implement the pattern with exhaustive types and tests.",
    tags: ["typescript", "patterns"],
  },
  "node-ts": {
    translation: (term) => `TypeScript + Node ${term}`,
    descriptionEs: (term) => `Integración TS con Node: "${term}".`,
    descriptionEn: (term) => `TS with Node integration: "${term}".`,
    whatEs: (term) => `Configura interoperabilidad y tipos para Node con "${term}".`,
    whatEn: (term) => `Configure interoperability and typing for Node using "${term}".`,
    howEs: () => "Usa import type, augmentations y types de @types/node según módulo.",
    howEn: () => "Use import type, augmentations, and @types/node as needed.",
    tags: ["typescript", "node"],
  },
};

function buildTsSnippets(term: string, kind: TsKind) {
  const sample = getTsSample(term, kind);
  const title = `Ejemplo ${term}`;
  const titleEn = `${term} example`;
  const variation = `Variación ${term}`;
  const variationEn = `${term} variation`;
  const practice = `Práctica ${term}`;
  const practiceEn = `${term} practice`;
  const note = tsKindMeta[kind];

  return {
    example: {
      titleEs: title,
      titleEn: titleEn,
      code: sample.example,
      noteEs: note.whatEs(term),
      noteEn: note.whatEn(term),
    },
    secondExample: {
      titleEs: variation,
      titleEn: variationEn,
      code: sample.variant,
      noteEs: note.howEs(term),
      noteEn: note.howEn(term),
    },
    exerciseExample: {
      titleEs: practice,
      titleEn: practiceEn,
      code: sample.exercise,
      noteEs: "Implementa el tipo en un caso real y valida con tsc.",
      noteEn: "Implement the type in a real case and validate with tsc.",
    },
  };
}

function getTsSample(term: string, kind: TsKind): { example: string; variant: string; exercise: string } {
  switch (kind) {
    case "keyword":
      return tsKeywordSnippet(term);
    case "type-system":
    case "utility":
    case "generic":
    case "narrowing":
    case "function":
    case "class":
    case "interface":
    case "module":
    case "decorator":
    case "promise":
    case "error":
    case "assertion":
    case "react-ts":
    case "dom":
    case "config":
    case "compiler":
    case "pattern":
    case "node-ts":
      return tsPatternSnippet(term, kind);
    default:
      return defaultSnippet(term);
  }
}

function tsKeywordSnippet(term: string) {
  switch (term) {
    case "Type":
    case "Type Alias":
      return {
        example: `type User = { id: string; name: string };`,
        variant: `type Id = string | number;`,
        exercise: `type Result<T> = { ok: true; value: T } | { ok: false; error: string };`,
      };
    case "Interface":
      return {
        example: `interface User { id: string; name: string; }`,
        variant: `interface Admin extends User { role: "admin"; }`,
        exercise: `interface Repository<T> { find(id: string): T | null; }`,
      };
    case "Enum":
      return {
        example: `enum Role { Admin = "admin", User = "user" }`,
        variant: `enum Status { Pending, Done }`,
        exercise: `enum HttpStatus { OK = 200, NotFound = 404 }`,
      };
    case "Tuple":
      return {
        example: `type Point = [number, number];`,
        variant: `const entry: [string, number] = ["age", 30];`,
        exercise: `type RGB = [red: number, green: number, blue: number];`,
      };
    case "Union":
      return {
        example: `type Result = "success" | "error";`,
        variant: `type Input = string | number;`,
        exercise: `type Status = "idle" | "loading" | "done";`,
      };
    case "Intersection":
      return {
        example: `type WithId = { id: string } & { createdAt: Date };`,
        variant: `type FullUser = User & { role: string };`,
        exercise: `type WithAudit<T> = T & { updatedAt: Date };`,
      };
    case "Literal Types":
      return {
        example: `type Direction = "left" | "right";`,
        variant: `const theme: "dark" | "light" = "dark";`,
        exercise: `type Size = 320 | 640 | 1024;`,
      };
    case "Any":
      return {
        example: `let value: any;`,
        variant: `function log(anyValue: any) { console.log(anyValue); }`,
        exercise: `// Evita any; prefiere unknown.`,
      };
    case "Unknown":
      return {
        example: `function parse(value: unknown) {\n  if (typeof value === "string") return value.toUpperCase();\n  return null;\n}`,
        variant: `let input: unknown;`,
        exercise: `function ensureString(value: unknown): string | null { return typeof value === "string" ? value : null; }`,
      };
    case "Never":
      return {
        example: `function fail(msg: string): never { throw new Error(msg); }`,
        variant: `type Impossible = string & number; // never`,
        exercise: `function exhaustive(value: never): never { throw new Error("unreachable " + value); }`,
      };
    case "Void":
      return {
        example: `function log(message: string): void { console.log(message); }`,
        variant: `type Handler = () => void;`,
        exercise: `const noop = (): void => {};`,
      };
    case "Null":
    case "Undefined":
    case "BigInt":
    case "Boolean":
    case "Number":
    case "String":
    case "Symbol":
      return {
        example: `const value: ${term.toLowerCase()} = ${term === "Boolean" ? "true" : term === "Number" ? "42" : term === "String" ? '"text"' : term === "BigInt" ? "1n" : term === "Symbol" ? "Symbol('id')" : "null"};`,
        variant: `let maybe: ${term.toLowerCase()};`,
        exercise: `// Declara y usa ${term} en tus tipos.`,
      };
    default:
      return defaultSnippet(term);
  }
}

function tsPatternSnippet(term: string, kind: TsKind) {
  switch (term) {
    case "Type Alias":
      return tsKeywordSnippet("Type Alias");
    case "Extends":
      return {
        example: `interface Admin extends User { role: "admin"; }`,
        variant: `type WithMeta<T extends { id: string }> = T & { createdAt: Date };`,
        exercise: `type OnlyIds<T extends { id: string }> = Pick<T, "id">;`,
      };
    case "Implements":
      return {
        example: `class Service implements Repository<string> {\n  find() { return null; }\n}`,
        variant: `class Logger implements Disposable { dispose() {} }`,
        exercise: `// Implementa interfaces para contratos explícitos.`,
      };
    case "Readonly":
      return {
        example: `type User = { readonly id: string; name: string };`,
        variant: `interface Props { readonly title: string; }`,
        exercise: `const user: Readonly<User> = { id: "1", name: "Ada" };`,
      };
    case "Partial":
    case "Required":
    case "Record":
    case "Pick":
    case "Omit":
    case "Exclude":
    case "Extract":
    case "NonNullable":
    case "ReturnType":
    case "Parameters":
    case "ConstructorParameters":
    case "InstanceType":
    case "ThisType":
    case "ReadonlyArray":
    case "Readonly<T>":
    case "Awaited<T>":
    case "Uppercase":
    case "Lowercase":
    case "Capitalize":
    case "Uncapitalize":
      return utilitySnippet(term);
    case "Record":
      return utilitySnippet("Record");
    case "Generics":
      return {
        example: `function identity<T>(value: T): T { return value; }`,
        variant: `type Box<T> = { value: T };`,
        exercise: `function mapArray<T, U>(arr: T[], fn: (item: T) => U): U[] { return arr.map(fn); }`,
      };
    case "Generic Constraints":
      return {
        example: `function withId<T extends { id: string }>(value: T) { return value.id; }`,
        variant: `function len<T extends { length: number }>(value: T) { return value.length; }`,
        exercise: `function merge<T extends object, U extends object>(a: T, b: U) { return { ...a, ...b }; }`,
      };
    case "Default Generics":
      return {
        example: `type ApiResponse<T = unknown> = { ok: boolean; data: T };`,
        variant: `interface Box<T = string> { value: T }`,
        exercise: `function createStore<T = number>(initial: T) { let state = initial; return { get: () => state }; }`,
      };
    case "Infer":
      return {
        example: `type ElementType<T> = T extends (infer U)[] ? U : T;`,
        variant: `type PromiseValue<T> = T extends Promise<infer U> ? U : T;`,
        exercise: `type FirstArg<T> = T extends (arg: infer A, ...rest: any[]) => any ? A : never;`,
      };
    case "Conditional Types":
      return {
        example: `type IsString<T> = T extends string ? "yes" : "no";`,
        variant: `type Nullable<T> = T | null;`,
        exercise: `type RequireId<T> = T extends { id: infer I } ? I : never;`,
      };
    case "Mapped Types":
      return {
        example: `type Flags<T> = { [K in keyof T]: boolean };`,
        variant: `type Optional<T> = { [K in keyof T]?: T[K] };`,
        exercise: `type Mutable<T> = { -readonly [K in keyof T]: T[K] };`,
      };
    case "Template Literal Types":
      return {
        example: `type EventName = \`on${"$"}{Capitalize<string>}\`;`,
        variant: `type Route = \`/${"$"}{string}\`;`,
        exercise: `type Namespaced<K extends string> = \`ns:${"$"}{K}\`;`,
      };
    case "Key Remapping":
      return {
        example: `type RemoveUnderscore<T> = { [K in keyof T as K extends \`_${"$"}{infer R}\` ? R : K]: T[K] };`,
        variant: `type Events<T> = { [K in keyof T as \`on${"$"}{Capitalize<string & K>}\`]: T[K] };`,
        exercise: `type StripId<T> = { [K in keyof T as K extends "id" ? never : K]: T[K] };`,
      };
    case "Index Signatures":
      return {
        example: `type Dictionary = { [key: string]: string };`,
        variant: `interface Cache { [id: number]: { value: string } }`,
        exercise: `type LocaleStrings = { [key: string]: string };`,
      };
    case "Index Access Types":
    case "Lookup Types":
      return {
        example: `type UserName = User["name"];`,
        variant: `type Id = User["id"];`,
        exercise: `type PropsOf<T> = T[keyof T];`,
      };
    case "Keyof":
      return {
        example: `type Keys = keyof User;`,
        variant: `function get<T, K extends keyof T>(obj: T, key: K): T[K] { return obj[key]; }`,
        exercise: `type KeyList<T> = Array<keyof T>;`,
      };
    case "Awaited<T>":
      return {
        example: `type ResponseData = Awaited<ReturnType<typeof fetchData>>;`,
        variant: `type Unwrapped = Awaited<Promise<string>>;`,
        exercise: `type MaybePromise<T> = Awaited<T | Promise<T>>;`,
      };
    case "Type Narrowing":
    case "Control Flow Analysis":
    case "Type Guards":
    case "in Operator Narrowing":
    case "typeof Narrowing":
    case "instanceof Narrowing":
      return narrowingSnippet(term);
    case "Function Overloads":
      return {
        example: `function format(value: string): string;\nfunction format(value: number): string;\nfunction format(value: string | number) { return value.toString(); }`,
        variant: `function len(value: string): number;\nfunction len(value: any[]): number;\nfunction len(value: string | any[]) { return value.length; }`,
        exercise: `// Añade overloads para mejorar DX en tus APIs.`,
      };
    case "Arrow Functions":
      return {
        example: `const sum = (a: number, b: number): number => a + b;`,
        variant: `const greet = (name: string = "dev") => \`Hola ${"$"}{name}\`;`,
        exercise: `const pipe = <T>(value: T, fn: (v: T) => T) => fn(value);`,
      };
    case "Call Signatures":
      return {
        example: `type Fn = { (value: string): number };`,
        variant: `interface Formatter { (value: string): string; }`,
        exercise: `type Comparator<T> = (a: T, b: T) => number;`,
      };
    case "Construct Signatures":
      return {
        example: `interface ServiceCtor { new (url: string): Service }`,
        variant: `type Factory<T> = new (...args: any[]) => T;`,
        exercise: `function make<T>(Ctor: new () => T): T { return new Ctor(); }`,
      };
    case "Optional Parameters":
      return {
        example: `function log(message: string, level?: "info" | "error") {}`,
        variant: `const fn = (value?: number) => value ?? 0;`,
        exercise: `function greet(name?: string) { return name ?? "anon"; }`,
      };
    case "Rest Parameters":
      return {
        example: `function sum(...values: number[]) { return values.reduce((a, b) => a + b, 0); }`,
        variant: `const logAll = (...args: string[]) => console.log(args);`,
        exercise: `type Tail<T extends any[]> = T extends [any, ...infer R] ? R : never;`,
      };
    case "This Parameter":
      return {
        example: `function handler(this: HTMLButtonElement, e: MouseEvent) { console.log(this.disabled); }`,
        variant: `type Bound = (this: { state: number }, value: number) => void;`,
        exercise: `// Declara this para reforzar contexto.`,
      };
    case "void Functions":
    case "never Functions":
      return tsKeywordSnippet(term.split(" ")[0]);
    case "Classes":
    case "Class Fields":
    case "Class Heritage":
    case "Abstract Classes":
    case "Protected Members":
    case "Private Members":
    case "Public Members":
    case "Static Members":
    case "Getters":
    case "Setters":
    case "Constructor Overloading":
      return classSnippet(term);
    case "Interfaces vs Types":
    case "Declaration Merging":
    case "Interface Extension":
    case "Hybrid Types":
      return interfaceSnippet(term);
    case "Modules":
    case "ESM Modules":
    case "CommonJS Modules":
    case "Import":
    case "Export":
    case "Export Default":
    case "Re-export":
    case "Ambient Modules":
    case "Global Declarations":
    case "Namespaces":
      return moduleSnippetTs(term);
    case "Decorators":
    case "Class Decorator":
    case "Method Decorator":
    case "Accessor Decorator":
    case "Property Decorator":
    case "Parameter Decorator":
    case "Metadata Reflection":
      return decoratorSnippet(term);
    case "Promises":
    case "Async/Await":
    case "PromiseLike":
    case "Awaited Type":
    case "Async Functions":
      return promiseSnippet(term);
    case "Errors":
    case "try/catch":
    case "unknown error":
    case "never throw":
    case "asserts":
    case "asserts condition":
    case "asserts condition is Type":
    case "user-defined type guards":
    case "never exhaustivity":
      return errorTsSnippet(term);
    case "Assertion Functions":
    case "as const":
    case "as Type":
    case "Non-null Assertion (!)":
    case "Definite Assignment Assertion (!)":
    case "Type Assertion":
    case "Double Assertion":
    case "as unknown as":
    case "Satisfies Operator":
    case "Const Assertions":
      return assertionSnippet(term);
    case "Utility Types (completos)":
      return utilitySnippet("Partial");
    case "React + TS":
    case "JSX.IntrinsicElements":
    case "React.FC":
    case "PropsWithChildren":
    case "Dispatch<SetStateAction<T>>":
    case "ReactNode":
    case "ReactElement":
    case "ComponentProps":
    case "JSX.Element":
      return reactTsSnippet(term);
    case "DOM Types":
    case "HTMLElement":
    case "Event":
    case "MouseEvent":
    case "KeyboardEvent":
    case "FormEvent":
    case "InputEvent":
    case "EventTarget":
    case "HTMLInputElement":
    case "HTMLButtonElement":
      return domTsSnippet(term);
    case "tsconfig.json Keywords":
    case "target":
    case "module":
    case "lib":
    case "strict":
    case "noImplicitAny":
    case "strictNullChecks":
    case "skipLibCheck":
    case "esModuleInterop":
    case "allowJs":
    case "resolveJsonModule":
    case "baseUrl":
    case "paths":
    case "rootDir":
    case "outDir":
    case "jsx":
    case "types":
    case "typeRoots":
      return tsconfigSnippet(term);
    case "Compiler Concepts":
    case "Type Checker":
    case "Structural Typing":
    case "Nominal Typing (simulado)":
    case "Duck Typing":
    case "Declaration Files":
    case "Ambient Types":
    case ".d.ts Files":
    case "DefinitelyTyped":
    case "tsc CLI":
    case "Source Maps":
      return compilerSnippet(term);
    case "Advanced Patterns":
    case "Discriminated Unions":
    case "Exhaustive Checks":
    case "Branded Types":
    case "Opaque Types":
    case "Fluent APIs":
    case "State Machines":
    case "Builder Pattern with TS":
    case "Zod Schemas (TS inference)":
    case "Generics Factories":
    case "Conditional Component Props":
      return advancedPatternSnippet(term);
    case "Node.js + TypeScript":
    case "import type":
    case "require types":
    case "module augmentation":
    case "global declarations":
      return nodeTsSnippet(term);
    default:
      return defaultSnippet(term);
  }
}

function utilitySnippet(term: string) {
  const typeName = term.replace(/<.*>/, "");
  return {
    example: `type Demo = ${typeName}<any>;`,
    variant: `type Mapped = ${typeName}<User>;`,
    exercise: `// Aplica ${typeName} a uno de tus tipos.`,
  };
}

function narrowingSnippet(term: string) {
  return {
    example: `function print(value: string | number) {\n  if (typeof value === "string") {\n    return value.toUpperCase();\n  }\n  return value.toFixed(2);\n}`,
    variant: `type Shape = { kind: "circle"; r: number } | { kind: "square"; s: number };\nfunction area(shape: Shape) {\n  if ("r" in shape) return Math.PI * shape.r * shape.r;\n  return shape.s * shape.s;\n}`,
    exercise: `function exhaustive(shape: never): never { throw new Error("Exhaustive " + shape); }`,
  };
}

function classSnippet(term: string) {
  return {
    example: `abstract class Base {\n  protected id: string;\n  constructor(id: string) { this.id = id; }\n}\nclass Service extends Base {\n  static version = 1;\n  private token: string;\n  get info() { return this.id; }\n  set info(value: string) { this.id = value; }\n  constructor(id: string, token: string) {\n    super(id);\n    this.token = token;\n  }\n}`,
    variant: `class User {\n  constructor(public name: string, readonly role: string) {}\n}\nclass Admin extends User {}\n`,
    exercise: `class Logger {\n  private logs: string[] = [];\n  log(msg: string) { this.logs.push(msg); }\n}\nconst logger = new Logger();`,
  };
}

function interfaceSnippet(term: string) {
  return {
    example: `interface Api { url: string }\ninterface Api { timeout?: number }\n// Merging`,
    variant: `interface ButtonProps extends BaseProps { label: string }`,
    exercise: `type Hybrid = { (value: string): number; meta?: string };`,
  };
}

function moduleSnippetTs(term: string) {
  return {
    example: `// ESM\nimport { sum } from "./math";\nexport const value = sum(1, 2);`,
    variant: `// CJS\ntype Sum = (a: number, b: number) => number;\nexport = function sum(a: number, b: number) { return a + b; };`,
    exercise: `// Ambient module\ndeclare module "env" { export const API: string; }`,
  };
}

function decoratorSnippet(term: string) {
  return {
    example: `function Controller(prefix: string) {\n  return (target: Function) => { Reflect.defineMetadata("prefix", prefix, target); };\n}`,
    variant: `function Log(target: any, key: string, descriptor: PropertyDescriptor) {\n  const original = descriptor.value;\n  descriptor.value = function (...args: any[]) {\n    console.log(key, args);\n    return original.apply(this, args);\n  };\n}\nclass Service { @Log fetch() {} }`,
    exercise: `// Habilita "experimentalDecorators" y "emitDecoratorMetadata" en tsconfig.`,
  };
}

function promiseSnippet(term: string) {
  return {
    example: `async function load(): Promise<string> { return "ok"; }`,
    variant: `type MaybePromise<T> = T | Promise<T>;`,
    exercise: `type AwaitedValue<T> = Awaited<T>;`,
  };
}

function errorTsSnippet(term: string) {
  return {
    example: `function parse(json: string): unknown {\n  try {\n    return JSON.parse(json);\n  } catch (error) {\n    return error as unknown;\n  }\n}`,
    variant: `function neverReach(value: never): never { throw new Error("Unexpected " + value); }`,
    exercise: `function assert(condition: any, message: string): asserts condition {\n  if (!condition) throw new Error(message);\n}`,
  };
}

function assertionSnippet(term: string) {
  return {
    example: `const value = "text" as const;`,
    variant: `const num = (0 as unknown as number);`,
    exercise: `function assertString(value: unknown): asserts value is string {\n  if (typeof value !== "string") throw new Error("Not string");\n}`,
  };
}

function reactTsSnippet(term: string) {
  return {
    example: `type Props = { title: string };\nconst Component: React.FC<Props> = ({ title, children }) => <h1>{title}{children}</h1>;`,
    variant: `function Button(props: React.ComponentProps<"button">) { return <button {...props} />; }`,
    exercise: `type WithChildren<T> = React.PropsWithChildren<T>;`,
  };
}

function domTsSnippet(term: string) {
  return {
    example: `const handle = (event: ${term}) => { console.log(event.type); };`,
    variant: `const ref = useRef<${term === "HTMLElement" ? "HTMLDivElement" : term}>(null);`,
    exercise: `// Usa ${term} para tipar handlers/refs en componentes.`,
  };
}

function tsconfigSnippet(term: string) {
  return {
    example: `// tsconfig.json\n{\n  "compilerOptions": {\n    "${term}": true\n  }\n}`,
    variant: `// Ajusta "${term}" según target/entorno`,
    exercise: `// Documenta el valor elegido para "${term}" en tu proyecto.`,
  };
}

function compilerSnippet(term: string) {
  return {
    example: `// ${term}\n// Describe cómo TS analiza y emite tipos.`,
    variant: `// Usa tsc --noEmit para validar tipos.`,
    exercise: `// Lee los .d.ts generados para entender la salida.`,
  };
}

function advancedPatternSnippet(term: string) {
  return {
    example: `type State = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string } | { kind: "success"; data: string };\nfunction reduce(state: State, action: { type: "RESET" | "SUCCESS"; data?: string }): State {\n  switch (action.type) {\n    case "RESET":\n      return { kind: "idle" };\n    case "SUCCESS":\n      return { kind: "success", data: action.data ?? "" };\n    default:\n      return state;\n  }\n}`,
    variant: `type Brand<T, B> = T & { __brand: B };\ntype UserId = Brand<string, "UserId">;`,
    exercise: `// Implementa exhaustive checks y opaque types en tus modelos.`,
  };
}

function nodeTsSnippet(term: string) {
  return {
    example: `import type { IncomingMessage } from "http";\nimport type { RequestHandler } from "express";`,
    variant: `declare global { namespace NodeJS { interface ProcessEnv { API_URL: string; } } }`,
    exercise: `// Usa module augmentation para ampliar tipos de librerías.`,
  };
}

const tsKeywords = [
  "Type",
  "Interface",
  "Enum",
  "Tuple",
  "Union",
  "Intersection",
  "Literal Types",
  "Any",
  "Unknown",
  "Never",
  "Void",
  "Null",
  "Undefined",
  "BigInt",
  "Boolean",
  "Number",
  "String",
  "Symbol",
  "Type Alias",
  "Extends",
  "Implements",
  "Readonly",
  "Partial",
  "Required",
  "Record",
  "Pick",
  "Omit",
  "Exclude",
  "Extract",
  "NonNullable",
  "ReturnType",
  "Parameters",
  "ConstructorParameters",
  "InstanceType",
  "ThisType",
];

const tsGenerics = [
  "Generics",
  "Generic Constraints",
  "Default Generics",
  "Infer",
  "Conditional Types",
  "Mapped Types",
  "Template Literal Types",
  "Key Remapping",
  "Index Signatures",
  "Index Access Types",
  "Lookup Types",
  "Keyof",
  "ReadonlyArray",
  "Readonly<T>",
  "Awaited<T>",
];

const tsNarrowing = [
  "Type Narrowing",
  "Control Flow Analysis",
  "Type Guards",
  "in Operator Narrowing",
  "typeof Narrowing",
  "instanceof Narrowing",
];

const tsFunctions = [
  "Function Overloads",
  "Arrow Functions",
  "Call Signatures",
  "Construct Signatures",
  "Optional Parameters",
  "Rest Parameters",
  "This Parameter",
  "void Functions",
  "never Functions",
];

const tsClasses = [
  "Classes",
  "Abstract Classes",
  "Protected Members",
  "Private Members",
  "Public Members",
  "Static Members",
  "Class Fields",
  "Getters",
  "Setters",
  "Constructor Overloading",
  "Class Heritage",
];

const tsInterfaces = ["Interfaces vs Types", "Declaration Merging", "Interface Extension", "Hybrid Types"];

const tsModules = [
  "Modules",
  "ESM Modules",
  "CommonJS Modules",
  "Import",
  "Export",
  "Export Default",
  "Re-export",
  "Ambient Modules",
  "Global Declarations",
  "Namespaces",
];

const tsDecorators = [
  "Decorators",
  "Class Decorator",
  "Method Decorator",
  "Accessor Decorator",
  "Property Decorator",
  "Parameter Decorator",
  "Metadata Reflection",
];

const tsPromises = ["Promises", "Async/Await", "PromiseLike", "Awaited Type", "Async Functions"];

const tsErrors = [
  "Errors",
  "try/catch",
  "unknown error",
  "never throw",
  "asserts",
  "asserts condition",
  "asserts condition is Type",
  "user-defined type guards",
  "never exhaustivity",
];

const tsAssertions = [
  "Assertion Functions",
  "as const",
  "as Type",
  "Non-null Assertion (!)",
  "Definite Assignment Assertion (!)",
  "Type Assertion",
  "Double Assertion",
  "as unknown as",
  "Satisfies Operator",
  "Const Assertions",
];

const tsUtilities = [
  "Partial",
  "Required",
  "Readonly",
  "Record",
  "Pick",
  "Omit",
  "Exclude",
  "Extract",
  "NonNullable",
  "Parameters",
  "ConstructorParameters",
  "ReturnType",
  "InstanceType",
  "ThisType",
  "Awaited",
  "Uppercase",
  "Lowercase",
  "Capitalize",
  "Uncapitalize",
];

const tsReact = [
  "React + TS",
  "JSX.IntrinsicElements",
  "React.FC",
  "PropsWithChildren",
  "Dispatch<SetStateAction<T>>",
  "ReactNode",
  "ReactElement",
  "ComponentProps",
  "JSX.Element",
];

const tsDom = [
  "DOM Types",
  "HTMLElement",
  "Event",
  "MouseEvent",
  "KeyboardEvent",
  "FormEvent",
  "InputEvent",
  "EventTarget",
  "HTMLInputElement",
  "HTMLButtonElement",
];

const tsConfig = [
  "tsconfig.json Keywords",
  "target",
  "module",
  "lib",
  "strict",
  "noImplicitAny",
  "strictNullChecks",
  "skipLibCheck",
  "esModuleInterop",
  "allowJs",
  "resolveJsonModule",
  "baseUrl",
  "paths",
  "rootDir",
  "outDir",
  "jsx",
  "types",
  "typeRoots",
];

const tsCompiler = [
  "Compiler Concepts",
  "Type Checker",
  "Structural Typing",
  "Nominal Typing (simulado)",
  "Duck Typing",
  "Declaration Files",
  "Ambient Types",
  ".d.ts Files",
  "DefinitelyTyped",
  "tsc CLI",
  "Source Maps",
];

const tsAdvanced = [
  "Advanced Patterns",
  "Discriminated Unions",
  "Exhaustive Checks",
  "Branded Types",
  "Opaque Types",
  "Fluent APIs",
  "State Machines",
  "Builder Pattern with TS",
  "Zod Schemas (TS inference)",
  "Generics Factories",
  "Conditional Component Props",
];

const tsNode = ["Node.js + TypeScript", "import type", "require types", "module augmentation", "global declarations"];

const tsTypeSystem = ["Type", "Interface", "Enum", "Tuple", "Union", "Intersection", "Literal Types", "Any", "Unknown", "Never", "Void", "Null", "Undefined", "BigInt", "Boolean", "Number", "String", "Symbol"];

const tsAssertionsGroup = [
  "Assertion Functions",
  "as const",
  "as Type",
  "Non-null Assertion (!)",
  "Definite Assignment Assertion (!)",
  "Type Assertion",
  "Double Assertion",
  "as unknown as",
  "Satisfies Operator",
  "Const Assertions",
];

const tsSeedTerms: SeedTermInput[] = [];
const tsSeen = new Set<string>();

function pushTsTerms(list: string[], kind: TsKind) {
  for (const raw of list) {
    const term = raw.trim();
    if (!term) continue;
    const key = term.toLowerCase();
    if (tsSeen.has(key) || reactTermSet.has(key)) continue;
    tsSeen.add(key);
    tsSeedTerms.push(buildTsSeed(term, kind));
  }
}

function buildTsSeed(term: string, kind: TsKind, override: TsDocOverride = {}): SeedTermInput {
  const cleanTerm = term.trim();
  const meta = tsKindMeta[kind];
  const snippets = buildTsSnippets(cleanTerm, kind);
  const translation = override.translation ?? meta.translation(cleanTerm);
  const descriptionEs = override.descriptionEs ?? meta.descriptionEs(cleanTerm);
  const descriptionEn = override.descriptionEn ?? meta.descriptionEn(cleanTerm);
  const whatEs = override.whatEs ?? meta.whatEs(cleanTerm);
  const whatEn = override.whatEn ?? meta.whatEn(cleanTerm);
  const howEs = override.howEs ?? meta.howEs(cleanTerm);
  const howEn = override.howEn ?? meta.howEn(cleanTerm);
  const baseTags = (meta.tags ?? []).concat(["typescript", kind, cleanTerm]).map((tag) => tag.toLowerCase());

  return {
    term: cleanTerm,
    slug: slugify(`ts-${cleanTerm.replace(/[^a-z0-9]+/gi, "-")}`),
    translation,
    category: Category.general,
    descriptionEs,
    descriptionEn,
    aliases: [cleanTerm],
    tags: override.tags ?? baseTags,
    example: override.example ?? snippets.example,
    secondExample: override.secondExample ?? snippets.secondExample,
    exerciseExample: override.exerciseExample ?? snippets.exerciseExample,
    whatEs,
    whatEn,
    howEs,
    howEn,
  };
}

pushTsTerms(tsKeywords, "keyword");
pushTsTerms(tsGenerics, "generic");
pushTsTerms(tsNarrowing, "narrowing");
pushTsTerms(tsFunctions, "function");
pushTsTerms(tsClasses, "class");
pushTsTerms(tsInterfaces, "interface");
pushTsTerms(tsModules, "module");
pushTsTerms(tsDecorators, "decorator");
pushTsTerms(tsPromises, "promise");
pushTsTerms(tsErrors, "error");
pushTsTerms(tsAssertions, "assertion");
pushTsTerms(tsUtilities, "utility");
pushTsTerms(tsReact, "react-ts");
pushTsTerms(tsDom, "dom");
pushTsTerms(tsConfig, "config");
pushTsTerms(tsCompiler, "compiler");
pushTsTerms(tsAdvanced, "pattern");
pushTsTerms(tsNode, "node-ts");

const dedupedTsTerms = tsSeedTerms.filter((term) => !reactTermSet.has(term.term.toLowerCase()));
const tsTermSet = new Set([...reactTermSet, ...dedupedTsTerms.map((item) => item.term.toLowerCase())]);

type NodeKind =
  | "runtime"
  | "global"
  | "fs"
  | "http"
  | "event"
  | "stream"
  | "buffer"
  | "crypto"
  | "child-process"
  | "path"
  | "url"
  | "process"
  | "os"
  | "net"
  | "timer"
  | "stream-util"
  | "worker"
  | "cluster"
  | "module-system"
  | "tool"
  | "express"
  | "database"
  | "architecture"
  | "deploy"
  | "security";

type NodeDocOverride = {
  translation?: string;
  descriptionEs?: string;
  descriptionEn?: string;
  whatEs?: string;
  whatEn?: string;
  howEs?: string;
  howEn?: string;
  example?: ExampleSnippet;
  secondExample?: ExampleSnippet;
  exerciseExample?: ExampleSnippet;
  tags?: string[];
};

const nodeKindMeta: Record<
  NodeKind,
  {
    translation: (term: string) => string;
    descriptionEs: (term: string) => string;
    descriptionEn: (term: string) => string;
    whatEs: (term: string) => string;
    whatEn: (term: string) => string;
    howEs: (term: string) => string;
    howEn: (term: string) => string;
    tags?: string[];
  }
> = {
  runtime: {
    translation: (term) => `concepto Node ${term}`,
    descriptionEs: (term) => `Concepto base de Node.js: "${term}".`,
    descriptionEn: (term) => `Node.js core concept: "${term}".`,
    whatEs: (term) => `Explica cómo funciona Node con "${term}".`,
    whatEn: (term) => `Explains how Node works via "${term}".`,
    howEs: () => "Relaciona con el event loop, libuv y el modelo single-thread.",
    howEn: () => "Relate it to event loop, libuv, and the single-thread model.",
    tags: ["node", "concept"],
  },
  global: {
    translation: (term) => `global de Node ${term}`,
    descriptionEs: (term) => `Objeto o función global en Node: "${term}".`,
    descriptionEn: (term) => `Global object/function in Node: "${term}".`,
    whatEs: (term) => `Disponible sin importar imports: "${term}".`,
    whatEn: (term) => `Available without imports: "${term}".`,
    howEs: () => "Úsalo con cuidado y tipa en TS si es necesario.",
    howEn: () => "Use carefully and type it in TS if needed.",
    tags: ["node", "globals"],
  },
  fs: {
    translation: (term) => `módulo FS ${term}`,
    descriptionEs: (term) => `APIs de sistema de archivos: "${term}".`,
    descriptionEn: (term) => `Filesystem APIs: "${term}".`,
    whatEs: (term) => `Lee, escribe o observa archivos con "${term}".`,
    whatEn: (term) => `Read, write, or watch files using "${term}".`,
    howEs: () => "Prefiere versiones async de fs/promises y maneja errores.",
    howEn: () => "Prefer async fs/promises versions and handle errors.",
    tags: ["node", "fs"],
  },
  http: {
    translation: (term) => `HTTP/HTTPS ${term}`,
    descriptionEs: (term) => `APIs HTTP/HTTPS nativas: "${term}".`,
    descriptionEn: (term) => `Native HTTP/HTTPS APIs: "${term}".`,
    whatEs: (term) => `Crea servidores o clientes HTTP con "${term}".`,
    whatEn: (term) => `Create HTTP servers/clients with "${term}".`,
    howEs: () => "Configura headers, status y streams en respuestas.",
    howEn: () => "Configure headers, status, and streams in responses.",
    tags: ["node", "http"],
  },
  event: {
    translation: (term) => `eventos ${term}`,
    descriptionEs: (term) => `Sistema de eventos en Node: "${term}".`,
    descriptionEn: (term) => `Node event system: "${term}".`,
    whatEs: (term) => `Emite y escucha eventos con "${term}".`,
    whatEn: (term) => `Emit and listen to events with "${term}".`,
    howEs: () => "Usa EventEmitter y limpia listeners para evitar fugas.",
    howEn: () => "Use EventEmitter and remove listeners to avoid leaks.",
    tags: ["node", "events"],
  },
  stream: {
    translation: (term) => `stream ${term}`,
    descriptionEs: (term) => `APIs de streams en Node: "${term}".`,
    descriptionEn: (term) => `Node stream APIs: "${term}".`,
    whatEs: (term) => `Procesa datos chunked con "${term}".`,
    whatEn: (term) => `Process chunked data using "${term}".`,
    howEs: () => "Encadena pipes y maneja backpressure.",
    howEn: () => "Chain pipes and handle backpressure.",
    tags: ["node", "streams"],
  },
  buffer: {
    translation: (term) => `buffer ${term}`,
    descriptionEs: (term) => `APIs de Buffer: "${term}".`,
    descriptionEn: (term) => `Buffer APIs: "${term}".`,
    whatEs: (term) => `Maneja binarios con "${term}".`,
    whatEn: (term) => `Handle binary data with "${term}".`,
    howEs: () => "Convierte entre encodings (utf8, base64, hex).",
    howEn: () => "Convert between encodings (utf8, base64, hex).",
    tags: ["node", "buffer"],
  },
  crypto: {
    translation: (term) => `cripto ${term}`,
    descriptionEs: (term) => `APIs criptográficas de Node: "${term}".`,
    descriptionEn: (term) => `Node cryptography APIs: "${term}".`,
    whatEs: (term) => `Genera hashes, claves o firmas con "${term}".`,
    whatEn: (term) => `Generate hashes, keys, or signatures using "${term}".`,
    howEs: () => "Usa algoritmos seguros y maneja claves fuera del repo.",
    howEn: () => "Use secure algorithms and keep keys out of the repo.",
    tags: ["node", "crypto"],
  },
  "child-process": {
    translation: (term) => `proceso hijo ${term}`,
    descriptionEs: (term) => `APIs de child_process: "${term}".`,
    descriptionEn: (term) => `child_process APIs: "${term}".`,
    whatEs: (term) => `Ejecuta comandos o forks con "${term}".`,
    whatEn: (term) => `Run commands or forks using "${term}".`,
    howEs: () => "Controla stdout/stderr y errores; evita deadlocks.",
    howEn: () => "Handle stdout/stderr and errors; avoid deadlocks.",
    tags: ["node", "process"],
  },
  path: {
    translation: (term) => `ruta ${term}`,
    descriptionEs: (term) => `Utilidades de path: "${term}".`,
    descriptionEn: (term) => `Path utilities: "${term}".`,
    whatEs: (term) => `Normaliza y resuelve rutas con "${term}".`,
    whatEn: (term) => `Normalize and resolve paths using "${term}".`,
    howEs: () => "Evita concatenar strings; usa path.join/resolve.",
    howEn: () => "Avoid string concat; use path.join/resolve.",
    tags: ["node", "path"],
  },
  url: {
    translation: (term) => `URL ${term}`,
    descriptionEs: (term) => `APIs URL en Node: "${term}".`,
    descriptionEn: (term) => `URL APIs in Node: "${term}".`,
    whatEs: (term) => `Parsea y construye URLs con "${term}".`,
    whatEn: (term) => `Parse/build URLs using "${term}".`,
    howEs: () => "Usa URL/URLSearchParams y maneja file:// cuando aplique.",
    howEn: () => "Use URL/URLSearchParams and handle file:// when needed.",
    tags: ["node", "url"],
  },
  process: {
    translation: (term) => `process ${term}`,
    descriptionEs: (term) => `APIs de process: "${term}".`,
    descriptionEn: (term) => `process APIs: "${term}".`,
    whatEs: (term) => `Lee entorno, argumentos o memoria con "${term}".`,
    whatEn: (term) => `Read env, args, or memory via "${term}".`,
    howEs: () => "Valida variables de entorno y maneja señales/salidas limpias.",
    howEn: () => "Validate env vars and handle signals/clean exits.",
    tags: ["node", "process"],
  },
  os: {
    translation: (term) => `OS ${term}`,
    descriptionEs: (term) => `APIs del módulo os: "${term}".`,
    descriptionEn: (term) => `os module APIs: "${term}".`,
    whatEs: (term) => `Consulta info del sistema con "${term}".`,
    whatEn: (term) => `Query system info using "${term}".`,
    howEs: () => "Úsalo para diagnósticos y feature flags.",
    howEn: () => "Use for diagnostics and feature flags.",
    tags: ["node", "os"],
  },
  net: {
    translation: (term) => `red ${term}`,
    descriptionEs: (term) => `APIs de red (net/dns): "${term}".`,
    descriptionEn: (term) => `Network APIs (net/dns): "${term}".`,
    whatEs: (term) => `Crea sockets TCP/UDP o resoluciones DNS con "${term}".`,
    whatEn: (term) => `Create TCP/UDP sockets or DNS resolutions via "${term}".`,
    howEs: () => "Maneja errores de conexión y timeouts.",
    howEn: () => "Handle connection errors and timeouts.",
    tags: ["node", "network"],
  },
  timer: {
    translation: (term) => `timer ${term}`,
    descriptionEs: (term) => `Timers de Node: "${term}".`,
    descriptionEn: (term) => `Node timers: "${term}".`,
    whatEs: (term) => `Agenda tareas con "${term}".`,
    whatEn: (term) => `Schedule tasks with "${term}".`,
    howEs: () => "Limpia timers y usa setImmediate para saltar la cola.",
    howEn: () => "Clear timers and use setImmediate to skip the queue.",
    tags: ["node", "timers"],
  },
  "stream-util": {
    translation: (term) => `utilidad de stream ${term}`,
    descriptionEs: (term) => `Helpers de streams: "${term}".`,
    descriptionEn: (term) => `Stream helpers: "${term}".`,
    whatEs: (term) => `Administra backpressure y transformación con "${term}".`,
    whatEn: (term) => `Manage backpressure/transform with "${term}".`,
    howEs: () => "Usa pipeline y highWaterMark para controlar flujo.",
    howEn: () => "Use pipeline and highWaterMark to control flow.",
    tags: ["node", "streams"],
  },
  worker: {
    translation: (term) => `worker threads ${term}`,
    descriptionEs: (term) => `APIs de worker_threads: "${term}".`,
    descriptionEn: (term) => `worker_threads APIs: "${term}".`,
    whatEs: (term) => `Corre trabajo paralelo seguro con "${term}".`,
    whatEn: (term) => `Run parallel work safely with "${term}".`,
    howEs: () => "Comparte datos con Transferable/SharedArrayBuffer y controla isMainThread.",
    howEn: () => "Share data with Transferable/SharedArrayBuffer and check isMainThread.",
    tags: ["node", "workers"],
  },
  cluster: {
    translation: (term) => `cluster ${term}`,
    descriptionEs: (term) => `APIs de cluster: "${term}".`,
    descriptionEn: (term) => `cluster APIs: "${term}".`,
    whatEs: (term) => `Replica procesos para multi-core con "${term}".`,
    whatEn: (term) => `Fork processes for multi-core using "${term}".`,
    howEs: () => "Sincroniza workers y maneja caídas; considera PM2/containers.",
    howEn: () => "Sync workers and handle crashes; consider PM2/containers.",
    tags: ["node", "cluster"],
  },
  "module-system": {
    translation: (term) => `sistema de módulos ${term}`,
    descriptionEs: (term) => `APIs CommonJS/ESM: "${term}".`,
    descriptionEn: (term) => `CommonJS/ESM APIs: "${term}".`,
    whatEs: (term) => `Importa/expone módulos con "${term}".`,
    whatEn: (term) => `Import/export modules with "${term}".`,
    howEs: () => "Configura type/module en package.json y usa import/require según formato.",
    howEn: () => "Configure type/module in package.json and use import/require accordingly.",
    tags: ["node", "modules"],
  },
  tool: {
    translation: (term) => `tooling ${term}`,
    descriptionEs: (term) => `Herramienta del ecosistema Node: "${term}".`,
    descriptionEn: (term) => `Node ecosystem tool: "${term}".`,
    whatEs: (term) => `Automatiza build/dev/deploy con "${term}".`,
    whatEn: (term) => `Automate build/dev/deploy using "${term}".`,
    howEs: () => "Instala localmente y configura scripts en package.json.",
    howEn: () => "Install locally and configure scripts in package.json.",
    tags: ["node", "tooling"],
  },
  express: {
    translation: (term) => `Express ${term}`,
    descriptionEs: (term) => `APIs/patrones de Express: "${term}".`,
    descriptionEn: (term) => `Express APIs/patterns: "${term}".`,
    whatEs: (term) => `Construye middlewares y rutas con "${term}".`,
    whatEn: (term) => `Build middlewares/routes using "${term}".`,
    howEs: () => "Configura app, router y middlewares de seguridad/log.",
    howEn: () => "Configure app, router, and security/log middlewares.",
    tags: ["node", "express"],
  },
  database: {
    translation: (term) => `DB ${term}`,
    descriptionEs: (term) => `Drivers/ORM usados en Node: "${term}".`,
    descriptionEn: (term) => `Drivers/ORM in Node: "${term}".`,
    whatEs: (term) => `Conecta y modela datos con "${term}".`,
    whatEn: (term) => `Connect/model data using "${term}".`,
    howEs: () => "Maneja pooling, migraciones y variables de entorno.",
    howEn: () => "Handle pooling, migrations, and environment vars.",
    tags: ["node", "database"],
  },
  architecture: {
    translation: (term) => `patrón ${term} en Node`,
    descriptionEs: (term) => `Patrones de arquitectura en Node: "${term}".`,
    descriptionEn: (term) => `Architecture patterns in Node: "${term}".`,
    whatEs: (term) => `Diseña servicios con "${term}".`,
    whatEn: (term) => `Design services using "${term}".`,
    howEs: () => "Define límites, contratos y monitoreo.",
    howEn: () => "Define boundaries, contracts, and monitoring.",
    tags: ["node", "architecture"],
  },
  deploy: {
    translation: (term) => `deploy ${term}`,
    descriptionEs: (term) => `Prácticas/CLI de despliegue: "${term}".`,
    descriptionEn: (term) => `Deployment practices/CLIs: "${term}".`,
    whatEs: (term) => `Opera Node en producción con "${term}".`,
    whatEn: (term) => `Operate Node in production using "${term}".`,
    howEs: () => "Automatiza con CI/CD, PM2, Docker y nvm.",
    howEn: () => "Automate with CI/CD, PM2, Docker, and nvm.",
    tags: ["node", "devops"],
  },
  security: {
    translation: (term) => `seguridad ${term}`,
    descriptionEs: (term) => `Término de seguridad en Node: "${term}".`,
    descriptionEn: (term) => `Security term in Node: "${term}".`,
    whatEs: (term) => `Mitiga riesgos con "${term}".`,
    whatEn: (term) => `Mitigate risks using "${term}".`,
    howEs: () => "Configura middlewares, tokens seguros y cifrado robusto.",
    howEn: () => "Configure middlewares, secure tokens, and strong crypto.",
    tags: ["node", "security"],
  },
};

function buildNodeSnippets(term: string, kind: NodeKind) {
  const sample = getNodeSample(term, kind);
  const baseNote = nodeKindMeta[kind];
  return {
    example: {
      titleEs: `Ejemplo ${term}`,
      titleEn: `${term} example`,
      code: sample.example,
      noteEs: baseNote.whatEs(term),
      noteEn: baseNote.whatEn(term),
    },
    secondExample: {
      titleEs: `Variación ${term}`,
      titleEn: `${term} variation`,
      code: sample.variant,
      noteEs: baseNote.howEs(term),
      noteEn: baseNote.howEn(term),
    },
    exerciseExample: {
      titleEs: `Práctica ${term}`,
      titleEn: `${term} practice`,
      code: sample.exercise,
      noteEs: "Implementa este término en un script real y maneja errores.",
      noteEn: "Apply this term in a real script and handle errors.",
    },
  };
}

function getNodeSample(term: string, kind: NodeKind): { example: string; variant: string; exercise: string } {
  switch (kind) {
    case "global":
      return {
        example: `console.log(${term});`,
        variant: `typeof ${term} !== "undefined" && console.log("${term} listo");`,
        exercise: `// Referencia ${term} directamente en un módulo Node.`,
      };
    case "fs":
      return {
        example: `import { readFile } from "fs/promises";\nconst data = await readFile("file.txt", "utf8");`,
        variant: `import { writeFile } from "fs/promises";\nawait writeFile("out.txt", "hola");`,
        exercise: `import { mkdir } from "fs/promises";\nawait mkdir("logs", { recursive: true });`,
      };
    case "http":
      return {
        example: `import http from "http";\nhttp.createServer((req, res) => {\n  res.writeHead(200, { "Content-Type": "text/plain" });\n  res.end("ok");\n}).listen(3000);`,
        variant: `import https from "https";\nhttps.get("https://example.com", (res) => res.pipe(process.stdout));`,
        exercise: `// Implementa middlewares simples en http.createServer.`,
      };
    case "event":
      return {
        example: `import { EventEmitter } from "events";\nconst bus = new EventEmitter();\nbus.on("ping", () => console.log("pong"));\nbus.emit("ping");`,
        variant: `bus.once("ready", () => console.log("ready"));`,
        exercise: `// Limpia listeners con removeListener o removeAllListeners.`,
      };
    case "stream":
      return {
        example: `import { createReadStream, createWriteStream } from "fs";\ncreateReadStream("input.txt").pipe(createWriteStream("out.txt"));`,
        variant: `import { Transform } from "stream";\nconst upper = new Transform({ transform(chunk, _enc, cb) { cb(null, chunk.toString().toUpperCase()); } });`,
        exercise: `// Usa pipeline para manejar errores en streams.`,
      };
    case "buffer":
      return {
        example: `const buf = Buffer.from("hola", "utf8");`,
        variant: `const base64 = buf.toString("base64");`,
        exercise: `const hex = Buffer.from("api-key").toString("hex");`,
      };
    case "crypto":
      return {
        example: `import { createHash, randomUUID } from "crypto";\nconst id = randomUUID();\nconst hash = createHash("sha256").update("data").digest("hex");`,
        variant: `import { randomBytes } from "crypto";\nconst key = randomBytes(32);`,
        exercise: `// Firma/valida datos con createHmac o sign/verify.`,
      };
    case "child-process":
      return {
        example: `import { spawn } from "child_process";\nconst ls = spawn("ls", ["-la"]);`,
        variant: `import { exec } from "child_process";\nexec("node -v", (err, stdout) => console.log(stdout));`,
        exercise: `// Usa spawn para streams largos y exec para comandos cortos.`,
      };
    case "path":
      return {
        example: `import path from "path";\nconst full = path.join(process.cwd(), "file.txt");`,
        variant: `const resolved = path.resolve("src", "index.ts");`,
        exercise: `const parsed = path.parse("/tmp/app/index.js");`,
      };
    case "url":
      return {
        example: `const url = new URL("https://example.com/path?debug=1");`,
        variant: `const params = new URLSearchParams({ q: "node" });`,
        exercise: `const fileUrl = new URL("file:///tmp/data.txt");`,
      };
    case "process":
      return {
        example: `console.log(process.env.NODE_ENV);`,
        variant: `console.log(process.cwd());`,
        exercise: `process.on("SIGINT", () => { console.log("bye"); process.exit(0); });`,
      };
    case "os":
      return {
        example: `import os from "os";\nconsole.log(os.platform(), os.cpus().length);`,
        variant: `console.log(os.totalmem(), os.freemem());`,
        exercise: `console.log(os.homedir());`,
      };
    case "net":
      return {
        example: `import net from "net";\nconst server = net.createServer((socket) => { socket.write("hola"); socket.end(); });\nserver.listen(4000);`,
        variant: `import dns from "dns";\ndns.lookup("example.com", (err, addr) => console.log(addr));`,
        exercise: `// Maneja errores de red y timeouts en sockets/dns.`,
      };
    case "timer":
      return {
        example: `const id = setTimeout(() => console.log("done"), 100);`,
        variant: `const loop = setImmediate(() => console.log("immediate"));`,
        exercise: `const interval = setInterval(() => console.log("tick"), 1000); clearInterval(interval);`,
      };
    case "stream-util":
      return {
        example: `import { pipeline, Readable } from "stream";\npipeline(Readable.from(["a", "b"]), process.stdout, (err) => { if (err) console.error(err); });`,
        variant: `const readable = Readable.from([1, 2, 3], { objectMode: true });`,
        exercise: `// Ajusta highWaterMark para controlar backpressure.`,
      };
    case "worker":
      return {
        example: `import { Worker, isMainThread, parentPort } from "worker_threads";\nif (isMainThread) { new Worker(__filename, { workerData: 2 }); }\nelse { parentPort?.postMessage(workerData * 2); }`,
        variant: `// Pasa SharedArrayBuffer a workers para compartir memoria`,
        exercise: `// Usa isMainThread para dividir lógica main/worker.`,
      };
    case "cluster":
      return {
        example: `import cluster from "cluster";\nif (cluster.isPrimary) {\n  cluster.fork();\n  cluster.on("exit", (w) => cluster.fork());\n} else {\n  require("./server");\n}`,
        variant: `console.log(cluster.isWorker ? "worker" : "master");`,
        exercise: `// Reemplaza cluster con PM2 o contenedores para prod.`,
      };
    case "module-system":
      return {
        example: `// CommonJS\nconst pkg = require("./package.json");\nmodule.exports = pkg;`,
        variant: `// ESM\nimport data from "./file.json" assert { type: "json" };`,
        exercise: `// Usa createRequire para cargar CJS desde ESM.`,
      };
    case "tool":
      return {
        example: `// Usa ${term} en scripts de dev\n// npm run dev -- usando ${term}`,
        variant: `// Configura ${term} en package.json`,
        exercise: `// Integra ${term} en CI/CD o dev local.`,
      };
    case "express":
      return {
        example: `import express from "express";\nconst app = express();\napp.use(express.json());\napp.get("/ping", (_req, res) => res.json({ ok: true }));\napp.listen(3000);`,
        variant: `app.use(require("cors")());\napp.use(require("helmet")());`,
        exercise: `const router = express.Router();\nrouter.post("/items", (req, res) => res.status(201).json(req.body));`,
      };
    case "database":
      return {
        example: `import { PrismaClient } from "@prisma/client";\nconst db = new PrismaClient();\nawait db.user.findMany();`,
        variant: `import mongoose from "mongoose";\nawait mongoose.connect(process.env.MONGO_URL!);`,
        exercise: `// Configura pooling/conexiones en el driver elegido.`,
      };
    case "architecture":
      return {
        example: `// Patrón ${term}\n// Define capas (routes -> services -> repo) y middlewares.`,
        variant: `// Usa Pub/Sub o eventos para desacoplar módulos.`,
        exercise: `// Documenta contratos REST/GraphQL y agrega observabilidad.`,
      };
    case "deploy":
      return {
        example: `// Usa pm2 para orquestar\npm2 start npm --name api -- run start`,
        variant: `// nvm use 20 && npm ci && npm run build`,
        exercise: `// Configura docker build y CI/CD para despliegue.`,
      };
    case "security":
      return {
        example: `import helmet from "helmet";\napp.use(helmet());`,
        variant: `import rateLimit from "express-rate-limit";\napp.use(rateLimit({ windowMs: 60_000, max: 100 }));`,
        exercise: `// Usa bcrypt/argon2 para contraseñas y tokens httpOnly.`,
      };
    case "runtime":
    default:
      return {
        example: `// Concepto ${term} en Node.js`,
        variant: `// Explica ${term} en el contexto del event loop`,
        exercise: `// Escribe un ejemplo práctico de ${term}.`,
      };
  }
}

function buildNodeSeed(term: string, kind: NodeKind, override: NodeDocOverride = {}): SeedTermInput {
  const cleanTerm = term.trim();
  const meta = nodeKindMeta[kind];
  const snippets = buildNodeSnippets(cleanTerm, kind);
  const translation = override.translation ?? meta.translation(cleanTerm);
  const descriptionEs = override.descriptionEs ?? meta.descriptionEs(cleanTerm);
  const descriptionEn = override.descriptionEn ?? meta.descriptionEn(cleanTerm);
  const whatEs = override.whatEs ?? meta.whatEs(cleanTerm);
  const whatEn = override.whatEn ?? meta.whatEn(cleanTerm);
  const howEs = override.howEs ?? meta.howEs(cleanTerm);
  const howEn = override.howEn ?? meta.howEn(cleanTerm);
  const baseTags = (meta.tags ?? []).concat(["node", kind, cleanTerm]).map((tag) => tag.toLowerCase());

  return {
    term: cleanTerm,
    slug: slugify(`node-${cleanTerm.replace(/[^a-z0-9]+/gi, "-")}`),
    translation,
    category: Category.backend,
    descriptionEs,
    descriptionEn,
    aliases: [cleanTerm],
    tags: override.tags ?? baseTags,
    example: override.example ?? snippets.example,
    secondExample: override.secondExample ?? snippets.secondExample,
    exerciseExample: override.exerciseExample ?? snippets.exerciseExample,
    whatEs,
    whatEn,
    howEs,
    howEn,
  };
}

const nodeRuntime = [
  "Node.js",
  "JavaScript Runtime",
  "Event Loop",
  "Call Stack",
  "Callback Queue",
  "Microtasks",
  "Non-blocking IO",
  "Single Thread",
  "Libuv",
  "C++ bindings",
  "CommonJS",
  "ESM (ECMAScript Modules)",
  "module.exports",
  "require()",
  "import/export",
  "package.json",
  "package-lock.json",
  "node_modules",
  "npx",
  "npm",
  "yarn",
  "pnpm",
  "TSX",
  "Nodemon",
  "PM2",
];

const nodeGlobalsList = [
  "global",
  "__filename",
  "__dirname",
  "process",
  "Buffer",
  "setTimeout",
  "setInterval",
  "clearTimeout",
  "clearInterval",
  "queueMicrotask",
  "structuredClone",
];

const nodeFs = [
  "fs",
  "fs/promises",
  "fs.readFile",
  "fs.readFileSync",
  "fs.writeFile",
  "fs.writeFileSync",
  "fs.appendFile",
  "fs.mkdir",
  "fs.rm",
  "fs.rmdir",
  "fs.readdir",
  "fs.rename",
  "fs.stat",
  "fs.createReadStream",
  "fs.createWriteStream",
  "watch",
  "watchFile",
];

const nodeHttp = [
  "http",
  "https",
  "http.createServer",
  "http.request",
  "http.get",
  "https.request",
  "https.get",
  "IncomingMessage",
  "ServerResponse",
];

const nodeEvents = ["events", "EventEmitter", "on", "emit", "once", "removeListener"];

const nodeStreams = [
  "stream",
  "stream.Readable",
  "stream.Writable",
  "stream.Duplex",
  "stream.Transform",
  "pipeline",
  "finished",
  "cork",
  "uncork",
];

const nodeBuffer = [
  "Buffer.from",
  "Buffer.alloc",
  "Buffer.concat",
  "Buffer.byteLength",
  "buffer.toString",
  "encoding base64",
  "encoding hex",
  "encoding utf-8",
];

const nodeCrypto = [
  "crypto",
  "crypto.randomUUID",
  "crypto.randomBytes",
  "crypto.createHash",
  "crypto.createHmac",
  "crypto.createCipheriv",
  "crypto.createDecipheriv",
  "crypto.pbkdf2",
  "crypto.scrypt",
  "crypto.generateKeyPair",
  "crypto.verify",
  "crypto.sign",
];

const nodeChild = ["child_process", "spawn", "spawnSync", "exec", "execSync", "execFile", "fork"];

const nodePath = ["path", "path.join", "path.resolve", "path.basename", "path.dirname", "path.parse", "path.extname", "path.normalize"];

const nodeUrl = ["URL", "URLSearchParams", "file://", "import.meta.url"];

const nodeProcessTerms = [
  "process.env",
  "process.argv",
  "process.cwd()",
  "process.exit()",
  "process.pid",
  "process.ppid",
  "process.uptime()",
  "process.memoryUsage()",
];

const nodeOs = ["os", "os.cpus()", "os.platform()", "os.homedir()", "os.freemem()", "os.totalmem()", "os.hostname()"];

const nodeNet = [
  "net",
  "net.createServer",
  "net.Socket",
  "TCP server",
  "UDP server",
  "dns",
  "dns.lookup",
  "dns.resolve",
  "dns.resolve4",
  "dns.reverse",
];

const nodeTimers = ["setTimeout", "setInterval", "setImmediate", "clearImmediate"];

const nodeStreamUtils = ["Readable.from", "Transform stream", "Writable stream", "flush", "highWaterMark", "backpressure"];

const nodeWorkers = ["worker_threads", "Worker", "parentPort", "workerData", "shareable", "MessagePort", "isMainThread"];

const nodeCluster = ["cluster", "cluster.fork", "cluster.workers", "cluster.isMaster", "cluster.isWorker"];

const nodeModules = ["module", "exports", "require.main", "require.resolve", "import()", "dynamic import", "createRequire()"];

const nodeTools = [
  "ts-node",
  "tsx",
  "nodemon",
  "pm2",
  "docker-node",
  "dotenv",
  "dotenv-expand",
  "cross-env",
  "babel-node",
  "esbuild",
  "swc-node",
  "vite-node",
];

const nodeExpress = [
  "express",
  "app.use",
  "app.get",
  "app.post",
  "app.put",
  "app.delete",
  "app.patch",
  "app.listen",
  "req",
  "res",
  "next",
  "middleware",
  "router",
  "json parser",
  "urlencoded parser",
  "CORS",
  "morgan",
  "helmet",
];

const nodeDatabases = ["mongoose", "mongodb", "prisma", "typeORM", "sequelize", "knex", "redis", "postgres", "mysql2", "sqlite3"];

const nodeArchitecture = [
  "callback hell",
  "promisify",
  "async/await",
  "middleware",
  "dependency injection",
  "monolith",
  "microservices",
  "REST API",
  "GraphQL",
  "WebSockets",
  "Socket.IO",
  "Event-driven architecture",
  "Pub/Sub",
  "Message Queue",
  "RabbitMQ",
  "Kafka",
];

const nodeDeploy = [
  "nvm",
  "nvm use",
  "nvm install",
  "pm2 start",
  "pm2 logs",
  "pm2 restart",
  "pm2 monit",
  "docker build",
  "docker run",
  "CI/CD",
  "environment variables",
  "logging",
  "monitoring",
];

const nodeSecurity = [
  "helmet",
  "csrf",
  "cors",
  "rate limit",
  "xss",
  "sql injection",
  "dotenv security",
  "jsonwebtoken",
  "bcrypt",
  "argon2",
  "session cookies",
  "httpOnly",
  "secure cookies",
];

const nodeSeedTerms: SeedTermInput[] = [];
const nodeSeen = new Set<string>();

function pushNodeTerms(list: string[], kind: NodeKind) {
  for (const raw of list) {
    const term = raw.trim();
    if (!term) continue;
    const key = term.toLowerCase();
    if (nodeSeen.has(key) || tsTermSet.has(key)) continue;
    nodeSeen.add(key);
    nodeSeedTerms.push(buildNodeSeed(term, kind));
  }
}

pushNodeTerms(nodeRuntime, "runtime");
pushNodeTerms(nodeGlobalsList, "global");
pushNodeTerms(nodeFs, "fs");
pushNodeTerms(nodeHttp, "http");
pushNodeTerms(nodeEvents, "event");
pushNodeTerms(nodeStreams, "stream");
pushNodeTerms(nodeBuffer, "buffer");
pushNodeTerms(nodeCrypto, "crypto");
pushNodeTerms(nodeChild, "child-process");
pushNodeTerms(nodePath, "path");
pushNodeTerms(nodeUrl, "url");
pushNodeTerms(nodeProcessTerms, "process");
pushNodeTerms(nodeOs, "os");
pushNodeTerms(nodeNet, "net");
pushNodeTerms(nodeTimers, "timer");
pushNodeTerms(nodeStreamUtils, "stream-util");
pushNodeTerms(nodeWorkers, "worker");
pushNodeTerms(nodeCluster, "cluster");
pushNodeTerms(nodeModules, "module-system");
pushNodeTerms(nodeTools, "tool");
pushNodeTerms(nodeExpress, "express");
pushNodeTerms(nodeDatabases, "database");
pushNodeTerms(nodeArchitecture, "architecture");
pushNodeTerms(nodeDeploy, "deploy");
pushNodeTerms(nodeSecurity, "security");

const dedupedNodeTerms = nodeSeedTerms.filter((term) => !tsTermSet.has(term.term.toLowerCase()));
const nodeTermSet = new Set([...tsTermSet, ...dedupedNodeTerms.map((item) => item.term.toLowerCase())]);

type StackKind = "express" | "prisma" | "postgres" | "nest" | "mongodb" | "websocket" | "typeorm" | "git" | "vercel";

const stackCategory: Record<StackKind, Category> = {
  express: Category.backend,
  prisma: Category.backend,
  postgres: Category.database,
  nest: Category.backend,
  mongodb: Category.database,
  websocket: Category.backend,
  typeorm: Category.backend,
  git: Category.devops,
  vercel: Category.devops,
};

const stackKindMeta: Record<
  StackKind,
  {
    translation: (term: string) => string;
    descriptionEs: (term: string) => string;
    descriptionEn: (term: string) => string;
    whatEs: (term: string) => string;
    whatEn: (term: string) => string;
    howEs: (term: string) => string;
    howEn: (term: string) => string;
    tags: string[];
  }
> = {
  express: {
    translation: (term) => `Express ${term}`,
    descriptionEs: (term) => `Concepto o API de Express.js: "${term}".`,
    descriptionEn: (term) => `Express.js concept or API: "${term}".`,
    whatEs: (term) => `Construye middlewares y rutas HTTP usando "${term}".`,
    whatEn: (term) => `Build HTTP middlewares and routes using "${term}".`,
    howEs: () => "Configura app/router, middlewares de seguridad/log y controla orden de registro.",
    howEn: () => "Configure app/router, security/log middlewares, and control registration order.",
    tags: ["node", "express", "backend"],
  },
  prisma: {
    translation: (term) => `Prisma ${term}`,
    descriptionEs: (term) => `Término de Prisma ORM: "${term}".`,
    descriptionEn: (term) => `Prisma ORM term: "${term}".`,
    whatEs: (term) => `Define modelos, migraciones o consultas con "${term}".`,
    whatEn: (term) => `Define models, migrations, or queries using "${term}".`,
    howEs: () => "Edita schema.prisma, ejecuta generate/migrate y usa Prisma Client tipado.",
    howEn: () => "Edit schema.prisma, run generate/migrate, and use the typed Prisma Client.",
    tags: ["prisma", "orm", "database"],
  },
  postgres: {
    translation: (term) => `PostgreSQL ${term}`,
    descriptionEs: (term) => `Concepto/SQL de PostgreSQL: "${term}".`,
    descriptionEn: (term) => `PostgreSQL concept/SQL: "${term}".`,
    whatEs: (term) => `Modela y consulta datos en Postgres usando "${term}".`,
    whatEn: (term) => `Model and query data in Postgres using "${term}".`,
    howEs: () => "Escribe SQL claro, usa índices y analiza planes con EXPLAIN/ANALYZE.",
    howEn: () => "Write clear SQL, use indexes, and analyze plans with EXPLAIN/ANALYZE.",
    tags: ["postgres", "sql", "database"],
  },
  nest: {
    translation: (term) => `NestJS ${term}`,
    descriptionEs: (term) => `Concepto/API de NestJS: "${term}".`,
    descriptionEn: (term) => `NestJS concept/API: "${term}".`,
    whatEs: (term) => `Arquitectura modular con decoradores y DI usando "${term}".`,
    whatEn: (term) => `Modular architecture with decorators and DI using "${term}".`,
    howEs: () => "Declara módulos, providers y controladores; registra pipes/guards globales cuando aplique.",
    howEn: () => "Declare modules, providers, controllers; register global pipes/guards as needed.",
    tags: ["nestjs", "backend", "node"],
  },
  mongodb: {
    translation: (term) => `MongoDB ${term}`,
    descriptionEs: (term) => `Concepto/API de MongoDB: "${term}".`,
    descriptionEn: (term) => `MongoDB concept/API: "${term}".`,
    whatEs: (term) => `Opera documentos y colecciones con "${term}".`,
    whatEn: (term) => `Operate documents and collections using "${term}".`,
    howEs: () => "Usa índices, validaciones y monitorea writeConcern/readConcern.",
    howEn: () => "Use indexes, validation, and monitor writeConcern/readConcern.",
    tags: ["mongodb", "database", "nosql"],
  },
  websocket: {
    translation: (term) => `WebSocket ${term}`,
    descriptionEs: (term) => `Concepto/API de WebSockets: "${term}".`,
    descriptionEn: (term) => `WebSockets concept/API: "${term}".`,
    whatEs: (term) => `Comunicación tiempo real con "${term}".`,
    whatEn: (term) => `Real-time communication using "${term}".`,
    howEs: () => "Maneja handshake, rooms/broadcast y backpressure/autenticación.",
    howEn: () => "Handle handshake, rooms/broadcast, and backpressure/auth.",
    tags: ["websocket", "realtime", "backend"],
  },
  typeorm: {
    translation: (term) => `TypeORM ${term}`,
    descriptionEs: (term) => `Concepto/API de TypeORM: "${term}".`,
    descriptionEn: (term) => `TypeORM concept/API: "${term}".`,
    whatEs: (term) => `Modela entidades y repositorios con "${term}".`,
    whatEn: (term) => `Model entities and repositories using "${term}".`,
    howEs: () => "Define entidades, relaciones y migraciones; usa DataSource y repositorios.",
    howEn: () => "Define entities, relations, migrations; use DataSource and repositories.",
    tags: ["typeorm", "orm", "database", "backend"],
  },
  git: {
    translation: (term) => `Git/GitHub ${term}`,
    descriptionEs: (term) => `Concepto/acción de Git/GitHub: "${term}".`,
    descriptionEn: (term) => `Git/GitHub concept/action: "${term}".`,
    whatEs: (term) => `Versiona y colabora con "${term}".`,
    whatEn: (term) => `Version and collaborate using "${term}".`,
    howEs: () => "Usa ramas, PRs y CI/CD con commits convencionales y firmas.",
    howEn: () => "Use branches, PRs, and CI/CD with conventional commits and signing.",
    tags: ["git", "github", "devops"],
  },
  vercel: {
    translation: (term) => `Vercel ${term}`,
    descriptionEs: (term) => `Concepto/API de Vercel: "${term}".`,
    descriptionEn: (term) => `Vercel concept/API: "${term}".`,
    whatEs: (term) => `Despliega y opera apps en Vercel con "${term}".`,
    whatEn: (term) => `Deploy and operate apps on Vercel using "${term}".`,
    howEs: () => "Configura vercel.json, env vars, edge/serverless y revisa logs/analytics.",
    howEn: () => "Configure vercel.json, env vars, edge/serverless, and review logs/analytics.",
    tags: ["vercel", "deploy", "devops"],
  },
};

function buildStackSnippets(term: string, kind: StackKind) {
  const samples = getStackSample(term, kind);
  const meta = stackKindMeta[kind];
  return {
    example: {
      titleEs: `Ejemplo ${term}`,
      titleEn: `${term} example`,
      code: samples.example,
      noteEs: meta.whatEs(term),
      noteEn: meta.whatEn(term),
    },
    secondExample: {
      titleEs: `Variación ${term}`,
      titleEn: `${term} variation`,
      code: samples.variant,
      noteEs: meta.howEs(term),
      noteEn: meta.howEn(term),
    },
    exerciseExample: {
      titleEs: `Práctica ${term}`,
      titleEn: `${term} practice`,
      code: samples.exercise,
      noteEs: "Implementa este concepto en tu stack y valida con pruebas.",
      noteEn: "Implement this concept in your stack and validate with tests.",
    },
  };
}

function getStackSample(term: string, kind: StackKind): { example: string; variant: string; exercise: string } {
  switch (kind) {
    case "express":
      return {
        example: `import express from "express";\nconst app = express();\napp.use(express.json());\napp.get("/health", (_req, res) => res.json({ ok: true }));\napp.listen(3000);`,
        variant: `const router = express.Router();\nrouter.post("/items", async (req, res, next) => {\n  try { res.status(201).json(req.body); } catch (err) { next(err); }\n});\napp.use("/api/v1", router);`,
        exercise: `app.use((err, _req, res, _next) => {\n  console.error(err);\n  res.status(500).json({ error: "internal" });\n});`,
      };
    case "prisma":
      return {
        example: `import { PrismaClient } from "@prisma/client";\nconst prisma = new PrismaClient();\nconst users = await prisma.user.findMany({ take: 5 });`,
        variant: `await prisma.user.create({ data: { email: "ada@example.com" } });`,
        exercise: `await prisma.$transaction(async (tx) => {\n  await tx.user.create({ data: { email: "ops@example.com" } });\n});`,
      };
    case "postgres":
      return {
        example: `-- Consulta básica\nSELECT id, email FROM users WHERE active = true ORDER BY created_at DESC LIMIT 10;`,
        variant: `-- Índice\nCREATE INDEX CONCURRENTLY idx_users_email ON users (email);`,
        exercise: `EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'ada@example.com';`,
      };
    case "nest":
      return {
        example: `@Controller("users")\nexport class UsersController {\n  constructor(private readonly service: UsersService) {}\n  @Get()\n  findAll() { return this.service.findAll(); }\n}`,
        variant: `@Module({ providers: [UsersService], controllers: [UsersController] })\nexport class UsersModule {}`,
        exercise: `const app = await NestFactory.create(AppModule);\napp.useGlobalPipes(new ValidationPipe());\nawait app.listen(3000);`,
      };
    case "mongodb":
      return {
        example: `import { MongoClient } from "mongodb";\nconst client = new MongoClient(process.env.MONGO_URL!);\nconst db = client.db("app");\nawait db.collection("users").find({ active: true }).toArray();`,
        variant: `await db.collection("users").createIndex({ email: 1 }, { unique: true });`,
        exercise: `const pipeline = [ { $match: { active: true } }, { $group: { _id: "$role", total: { $sum: 1 } } } ];\nawait db.collection("users").aggregate(pipeline).toArray();`,
      };
    case "websocket":
      return {
        example: `import { WebSocketServer } from "ws";\nconst wss = new WebSocketServer({ port: 8080 });\nwss.on("connection", (socket) => {\n  socket.on("message", (msg) => socket.send(msg));\n});`,
        variant: `wss.clients.forEach((client) => client.send("broadcast"));`,
        exercise: `// Implementa heartbeat\nsetInterval(() => {\n  wss.clients.forEach((client) => client.ping());\n}, 30000);`,
      };
    case "typeorm":
      return {
        example: `@Entity()\nclass User {\n  @PrimaryGeneratedColumn()\n  id!: number;\n\n  @Column()\n  email!: string;\n}\nconst ds = new DataSource({ type: "postgres", url: process.env.DATABASE_URL, entities: [User], synchronize: false });\nawait ds.initialize();`,
        variant: `const repo = ds.getRepository(User);\nawait repo.find({ where: { email: "ada@example.com" } });`,
        exercise: `await ds.transaction(async (manager) => { await manager.save(User, { email: "ops@example.com" }); });`,
      };
    case "git":
      return {
        example: `git checkout -b feature/api\n# Cambia código\ngit add .\ngit commit -m "feat: add api route"\ngit push origin feature/api`,
        variant: `git rebase main\ngit revert <commit>\ngit cherry-pick <sha>`,
        exercise: `# Configura firma GPG/SSH y ejecuta CI\n`,
      };
    case "vercel":
      return {
        example: `# Despliegue\nvercel --prod`,
        variant: `# Configuración vercel.json\n{\n  "rewrites": [{ "source": "/api/:path*", "destination": "/api/:path*" }]\n}`,
        exercise: `# Variables de entorno\nvercel env add DATABASE_URL`,
      };
    default:
      return {
        example: `// ${term}`,
        variant: `// Uso de ${term}`,
        exercise: `// Implementa ${term} en tu proyecto.`,
      };
  }
}

function buildStackSeed(term: string, kind: StackKind): SeedTermInput {
  const cleanTerm = term.trim();
  const meta = stackKindMeta[kind];
  const snippets = buildStackSnippets(cleanTerm, kind);
  const translation = meta.translation(cleanTerm);
  const descriptionEs = meta.descriptionEs(cleanTerm);
  const descriptionEn = meta.descriptionEn(cleanTerm);
  const whatEs = meta.whatEs(cleanTerm);
  const whatEn = meta.whatEn(cleanTerm);
  const howEs = meta.howEs(cleanTerm);
  const howEn = meta.howEn(cleanTerm);
  const tags = meta.tags.concat([kind, cleanTerm.toLowerCase()]);

  return {
    term: cleanTerm,
    slug: slugify(`stack-${cleanTerm.replace(/[^a-z0-9]+/gi, "-")}`),
    translation,
    category: stackCategory[kind],
    descriptionEs,
    descriptionEn,
    aliases: [cleanTerm],
    tags,
    example: snippets.example,
    secondExample: snippets.secondExample,
    exerciseExample: snippets.exerciseExample,
    whatEs,
    whatEn,
    howEs,
    howEn,
  };
}

const stackSeedTerms: SeedTermInput[] = [];
const stackSeen = new Set<string>();

function pushStackTerms(list: string[], kind: StackKind) {
  for (const raw of list) {
    const term = raw.trim();
    if (!term) continue;
    const key = term.toLowerCase();
    if (stackSeen.has(key) || nodeTermSet.has(key)) continue;
    stackSeen.add(key);
    stackSeedTerms.push(buildStackSeed(term, kind));
  }
}

const stackExpress = [
  "express",
  "Express Application",
  "app.use",
  "app.get",
  "app.post",
  "app.put",
  "app.patch",
  "app.delete",
  "app.options",
  "app.head",
  "router",
  "express.Router",
  "next",
  "middleware",
  "error middleware",
  "request handler",
  "express.json",
  "express.urlencoded",
  "static files",
  "res.send",
  "res.json",
  "res.status",
  "res.end",
  "res.redirect",
  "req.params",
  "req.query",
  "req.body",
  "req.headers",
  "req.cookies",
  "CORS",
  "helmet",
  "morgan",
  "dotenv",
  "compression",
  "rate-limit",
  "express-session",
  "cookie-parser",
  "csrf",
  "body-parser",
  "multer",
  "file upload middleware",
  "404 handler",
  "500 handler",
  "custom errors",
  "async handlers",
  "route chaining",
  "mounting routers",
  "API versioning",
  "REST API",
  "MVC pattern",
  "service layer",
  "controller",
  "model",
  "router layer",
  "cluster mode",
  "pm2 cluster",
  "jwt auth",
  "bcrypt",
  "input validation",
  "celebrate",
  "joi",
  "zod",
  "express-validator",
  "logging",
  "middleware order",
  "proxy trust",
  "error propagation",
];

const stackPrisma = [
  "Prisma",
  "schema.prisma",
  "Prisma Client",
  "prisma generate",
  "prisma migrate",
  "prisma migrate dev",
  "prisma migrate deploy",
  "prisma migrate reset",
  "data source",
  "generator",
  "model",
  "field",
  "relation",
  "@@id",
  "@id",
  "@@unique",
  "@unique",
  "@default",
  "@updatedAt",
  "@map",
  "@relation",
  "enum",
  "Prisma Studio",
  "prisma studio",
  "npx prisma studio",
  "CRUD",
  "findMany",
  "findUnique",
  "findFirst",
  "create",
  "createMany",
  "update",
  "updateMany",
  "delete",
  "deleteMany",
  "upsert",
  "select",
  "include",
  "where",
  "orderBy",
  "take",
  "skip",
  "cursor",
  "connect",
  "disconnect",
  "connectOrCreate",
  "nested writes",
  "middleware prisma",
  "transaction",
  "$transaction",
  "$executeRaw",
  "$queryRaw",
  "raw query",
  "seed script",
  "seed.ts",
  "migration history",
  "preview features",
  "PlanetScale + Prisma",
  "PostgreSQL + Prisma",
  "MySQL + Prisma",
  "SQLite + Prisma",
  "MongoDB + Prisma",
  "prisma errors",
  "relation mode",
  "referential integrity",
  "Prisma Pulse (real-time)",
  "Prisma with Next.js",
  "Prisma with Express",
  "Prisma with NestJS",
];

const stackPostgres = [
  "PostgreSQL",
  "psql",
  "database",
  "schema",
  "table",
  "column",
  "row",
  "primary key",
  "foreign key",
  "index",
  "unique index",
  "enum type",
  "serial",
  "bigserial",
  "uuid",
  "varchar",
  "text",
  "integer",
  "bigint",
  "boolean",
  "json",
  "jsonb",
  "timestamp",
  "date",
  "time",
  "interval",
  "numeric",
  "float",
  "array type",
  "constraints",
  "default value",
  "not null",
  "check constraint",
  "views",
  "materialized views",
  "stored procedures",
  "functions",
  "triggers",
  "sequences",
  "CTE",
  "WITH",
  "join",
  "inner join",
  "left join",
  "right join",
  "full join",
  "cross join",
  "union",
  "union all",
  "group by",
  "having",
  "order by",
  "limit",
  "offset",
  "window functions",
  "partition by",
  "ROW_NUMBER()",
  "RANK()",
  "dense_rank",
  "transactions",
  "begin",
  "commit",
  "rollback",
  "savepoints",
  "isolation levels",
  "deadlocks",
  "locking",
  "explain",
  "analyze",
  "query plan",
  "index scan",
  "sequential scan",
  "btree",
  "hash index",
  "gist index",
  "gin index",
  "tsvector",
  "full text search",
  "pg_dump",
  "pg_restore",
  "backup",
  "restore",
  "replica",
  "pg_stat_statements",
  "connection pooling",
  "pgBouncer",
  "Supabase PostgreSQL",
  "Neon PostgreSQL",
  "TimescaleDB",
  "extensions",
  "uuid-ossp",
  "pgcrypto",
  "citext",
  "hstore",
  "PostGIS",
];

const stackNest = [
  "Nest.js",
  "modules",
  "controllers",
  "providers",
  "services",
  "decorators",
  "@Module()",
  "@Controller()",
  "@Service()",
  "@Inject()",
  "Injectable",
  "Dependency Injection",
  "pipes",
  "guards",
  "interceptors",
  "filters",
  "DTO",
  "ValidationPipe",
  "ParseIntPipe",
  "class-validator",
  "class-transformer",
  "middleware",
  "nest-cli.json",
  "nest g resource",
  "nest generate",
  "AppModule",
  "feature module",
  "global module",
  "singleton provider",
  "request-scoped provider",
  "module encapsulation",
  "app.useGlobalPipes",
  "app.useGlobalFilters",
  "main.ts",
  "bootstrap",
  "HTTP exceptions",
  "ExceptionFilter",
  "CallHandler",
  "ExecutionContext",
  "CanActivate",
  "JwtAuthGuard",
  "AuthGuard",
  "Passport.js",
  "JWT strategy",
  "Local strategy",
  "Sessions",
  "ThrottlerGuard",
  "SwaggerModule",
  "OpenAPI",
  "nestjs/swagger",
  "Logger",
  "ConfigModule",
  "ConfigService",
  "Env variables",
  "CacheModule",
  "HttpModule",
  "TypeORMModule",
  "PrismaModule",
  "MongooseModule",
  "GraphQLModule",
  "Resolvers",
  "Mutations",
  "Queries",
  "Subscriptions",
  "WebSockets",
  "Gateway",
  "OnGatewayConnection",
  "OnGatewayInit",
  "OnGatewayDisconnect",
  "NestFactory",
  "FastifyAdapter",
  "ExpressAdapter",
  "Microservices",
  "MessagePattern",
  "Kafka transport",
  "Redis transport",
  "RabbitMQ transport",
  "CQRS module",
  "Command",
  "Query",
  "Event",
  "Handlers",
  "Sagas",
  "TestingModule",
  "unit tests",
  "e2e tests",
  "Jest",
];

const stackMongo = [
  "MongoDB",
  "document",
  "collection",
  "database",
  "_ id",
  "ObjectId",
  "insertOne",
  "insertMany",
  "find",
  "findOne",
  "updateOne",
  "updateMany",
  "deleteOne",
  "deleteMany",
  "replaceOne",
  "bulkWrite",
  "aggregation pipeline",
  "$match",
  "$group",
  "$sort",
  "$limit",
  "$project",
  "$lookup",
  "$unwind",
  "$addFields",
  "indexes",
  "compound index",
  "text index",
  "TTL index",
  "schema-less",
  "replica set",
  "sharding",
  "transactions",
  "ACID (Mongo)",
  "change streams",
  "Mongo Atlas",
  "Mongo Compass",
  "Mongoose",
  "schema",
  "model",
  "virtuals",
  "pre hooks",
  "post hooks",
  "populate",
  "lean()",
  "discriminators",
  "schema validation (JSON schema)",
  "performance concerns",
  "write concern",
  "read concern",
];

const stackWs = [
  "WebSockets",
  "ws protocol",
  "upgrade header",
  "socket server",
  "socket client",
  "ws library",
  "on connection",
  "on message",
  "on close",
  "broadcast",
  "rooms",
  "channels",
  "ws.send",
  "heartbeat",
  "ping",
  "pong",
  "socket termination",
  "socket reconnect",
  "Socket.IO",
  "io.on",
  "emit",
  "emitToRoom",
  "namespace",
  "adapters",
  "redis adapter",
  "acknowledgements",
  "binary messages",
  "JSON messages",
  "connection pooling",
  "presence system",
  "real-time events",
  "Backpressure WS",
  "Rate limiting WS",
  "Authentication WS",
  "JWT + WebSocket",
  "WebSocket over HTTPS",
];

const stackTypeorm = [
  "TypeORM",
  "DataSource",
  "Entity",
  "Column",
  "PrimaryColumn",
  "PrimaryGeneratedColumn",
  "ManyToOne",
  "OneToMany",
  "ManyToMany",
  "OneToOne",
  "JoinColumn",
  "JoinTable",
  "Repository",
  "QueryBuilder",
  "find",
  "findOne",
  "save",
  "delete",
  "update",
  "insert",
  "remove",
  "soft delete",
  "soft remove",
  "relations",
  "lazy relations",
  "eager relations",
  "migrations",
  "migration:generate",
  "migration:run",
  "migration:revert",
  "entity schema",
  "naming strategy",
  "subscribers",
  "listeners",
  "indices",
  "unique constraints",
  "enum fields",
  "embedded entities",
  "transactions",
  "isolation levels",
  "cascade",
  "onDelete",
  "onUpdate",
  "inheritance",
  "cache",
  "logging",
  "connection pooling",
  "CLI config",
  "ORMConfig",
];

const stackGit = [
  "git",
  "repository",
  "clone",
  "commit",
  "push",
  "pull",
  "fetch",
  "merge",
  "rebase",
  "branch",
  "checkout",
  "switch",
  "stash",
  "stash apply",
  "stash pop",
  "tag",
  "release",
  "remote",
  "origin",
  "HEAD",
  "HEAD~1",
  "cherry-pick",
  "reset",
  "reset --soft",
  "reset --mixed",
  "reset --hard",
  "revert",
  "conflict",
  "resolve conflict",
  "gitignore",
  "git add",
  "git rm",
  "git restore",
  "blame",
  "diff",
  "log",
  "bisect",
  "hooks",
  "pre-commit",
  "pre-push",
  "GitHub",
  "GitHub Actions",
  "GitHub Pages",
  "GitHub Issues",
  "GitHub Pull Request",
  "fork",
  "star",
  "watch",
  "workflow",
  "CI/CD",
  "actions runner",
  "protected branches",
  "environments",
  "secrets",
  "SSH key",
  "GPG signing",
  "semantic versioning",
  "conventional commits",
];

const stackVercel = [
  "Vercel",
  "Vercel Deploy",
  "Preview Deploy",
  "Production Deploy",
  "vercel.json",
  "Environment variables",
  "Edge Functions",
  "Vercel Serverless Functions",
  "Regions",
  "Build Output API",
  "Logs",
  "Analytics",
  "Monitoring",
  "Domains",
  "custom domains",
  "DNS records",
  "rewrites",
  "redirects",
  "headers",
  "caching",
  "ISR on Vercel",
  "Cron Jobs (Vercel Cron)",
  "Rate limiting Vercel",
  "Vercel KV",
  "Vercel Blob",
  "Vercel Postgres",
  "Vercel Edge Config",
  "Web Analytics",
  "Speed Insights",
  "Rollback",
];

pushStackTerms(stackExpress, "express");
pushStackTerms(stackPrisma, "prisma");
pushStackTerms(stackPostgres, "postgres");
pushStackTerms(stackNest, "nest");
pushStackTerms(stackMongo, "mongodb");
pushStackTerms(stackWs, "websocket");
pushStackTerms(stackTypeorm, "typeorm");
pushStackTerms(stackGit, "git");
pushStackTerms(stackVercel, "vercel");

const dedupedStackTerms = stackSeedTerms.filter((term) => !nodeTermSet.has(term.term.toLowerCase()));
const stackTermSet = new Set([...nodeTermSet, ...dedupedStackTerms.map((item) => item.term.toLowerCase())]);

type VueKind =
  | "base"
  | "options"
  | "composition"
  | "template"
  | "directive"
  | "component"
  | "event"
  | "reactivity"
  | "router"
  | "pinia"
  | "transition"
  | "sfc"
  | "utility"
  | "ssr"
  | "vite"
  | "testing"
  | "advanced"
  | "ecosystem";

const vueKindMeta: Record<
  VueKind,
  {
    translation: (term: string) => string;
    descriptionEs: (term: string) => string;
    descriptionEn: (term: string) => string;
    whatEs: (term: string) => string;
    whatEn: (term: string) => string;
    howEs: (term: string) => string;
    howEn: (term: string) => string;
    tags: string[];
  }
> = {
  base: {
    translation: (term) => `concepto Vue ${term}`,
    descriptionEs: (term) => `Concepto base de Vue: "${term}".`,
    descriptionEn: (term) => `Vue base concept: "${term}".`,
    whatEs: (term) => `Entiende el runtime y render con "${term}".`,
    whatEn: (term) => `Understand runtime/render via "${term}".`,
    howEs: () => "Relaciona MVVM, VDOM y reactividad en componentes.",
    howEn: () => "Relate MVVM, VDOM, and reactivity inside components.",
    tags: ["vue", "base"],
  },
  options: {
    translation: (term) => `Options API ${term}`,
    descriptionEs: (term) => `API Options de Vue: "${term}".`,
    descriptionEn: (term) => `Vue Options API: "${term}".`,
    whatEs: (term) => `Declara opciones clásicas (data, methods, hooks) con "${term}".`,
    whatEn: (term) => `Declare classic options (data, methods, hooks) using "${term}".`,
    howEs: () => "Usa defineComponent y retorna datos/métodos reactivos.",
    howEn: () => "Use defineComponent and return reactive data/methods.",
    tags: ["vue", "options-api"],
  },
  composition: {
    translation: (term) => `Composition API ${term}`,
    descriptionEs: (term) => `API de composición: "${term}".`,
    descriptionEn: (term) => `Composition API: "${term}".`,
    whatEs: (term) => `Crea lógica reusable con "${term}".`,
    whatEn: (term) => `Create reusable logic using "${term}".`,
    howEs: () => "Declara refs/reactive, hooks de ciclo y exposes en setup.",
    howEn: () => "Declare refs/reactive, lifecycle hooks, and expose in setup.",
    tags: ["vue", "composition-api"],
  },
  template: {
    translation: (term) => `sintaxis template ${term}`,
    descriptionEs: (term) => `Sintaxis de plantillas en Vue: "${term}".`,
    descriptionEn: (term) => `Vue template syntax: "${term}".`,
    whatEs: (term) => `Controla render declarativo con "${term}".`,
    whatEn: (term) => `Control declarative render using "${term}".`,
    howEs: () => "Usa bindings, eventos y slots de forma declarativa.",
    howEn: () => "Use bindings, events, and slots declaratively.",
    tags: ["vue", "template"],
  },
  directive: {
    translation: (term) => `directiva ${term}`,
    descriptionEs: (term) => `Directiva de Vue: "${term}".`,
    descriptionEn: (term) => `Vue directive: "${term}".`,
    whatEs: (term) => `Manipula DOM y bindings con "${term}".`,
    whatEn: (term) => `Manipulate DOM/bindings via "${term}".`,
    howEs: () => "Aplica directivas en template y usa :/@ para alias cortos.",
    howEn: () => "Apply directives in templates and use :/@ as shorthands.",
    tags: ["vue", "directives"],
  },
  component: {
    translation: (term) => `componente/props ${term}`,
    descriptionEs: (term) => `Concepto de componentes/props/slots: "${term}".`,
    descriptionEn: (term) => `Component/props/slots concept: "${term}".`,
    whatEs: (term) => `Define interfaces de componentes con "${term}".`,
    whatEn: (term) => `Define component interfaces using "${term}".`,
    howEs: () => "Valida props, emite eventos y usa slots nombrados.",
    howEn: () => "Validate props, emit events, and use named slots.",
    tags: ["vue", "components"],
  },
  event: {
    translation: (term) => `evento ${term}`,
    descriptionEs: (term) => `Sistema de eventos/emitters: "${term}".`,
    descriptionEn: (term) => `Events/emitters system: "${term}".`,
    whatEs: (term) => `Emite y escucha eventos personalizados con "${term}".`,
    whatEn: (term) => `Emit/listen custom events using "${term}".`,
    howEs: () => "Usa $emit/emit y modifiers para UX accesible.",
    howEn: () => "Use $emit/emit and modifiers for accessible UX.",
    tags: ["vue", "events"],
  },
  reactivity: {
    translation: (term) => `reactividad ${term}`,
    descriptionEs: (term) => `Sistema reactivo de Vue: "${term}".`,
    descriptionEn: (term) => `Vue reactivity system: "${term}".`,
    whatEs: (term) => `Crea/inspecciona estado reactivo con "${term}".`,
    whatEn: (term) => `Create/inspect reactive state using "${term}".`,
    howEs: () => "Usa ref/reactive/shallow* y marca objetos sin proxy cuando corresponda.",
    howEn: () => "Use ref/reactive/shallow* and mark raw objects when needed.",
    tags: ["vue", "reactivity"],
  },
  router: {
    translation: (term) => `Vue Router ${term}`,
    descriptionEs: (term) => `API de Vue Router: "${term}".`,
    descriptionEn: (term) => `Vue Router API: "${term}".`,
    whatEs: (term) => `Navega y protege rutas con "${term}".`,
    whatEn: (term) => `Navigate and guard routes using "${term}".`,
    howEs: () => "Declara routes, lazy load y guards con meta/params.",
    howEn: () => "Declare routes, lazy load, and guards with meta/params.",
    tags: ["vue", "router"],
  },
  pinia: {
    translation: (term) => `Pinia ${term}`,
    descriptionEs: (term) => `State management con Pinia: "${term}".`,
    descriptionEn: (term) => `Pinia state management: "${term}".`,
    whatEs: (term) => `Crea stores tipadas con "${term}".`,
    whatEn: (term) => `Create typed stores using "${term}".`,
    howEs: () => "defineStore + storeToRefs, acciones y persistencia SSR.",
    howEn: () => "defineStore + storeToRefs, actions, and SSR hydration.",
    tags: ["vue", "pinia", "state"],
  },
  transition: {
    translation: (term) => `transición ${term}`,
    descriptionEs: (term) => `APIs de transición/animación: "${term}".`,
    descriptionEn: (term) => `Transition/animation APIs: "${term}".`,
    whatEs: (term) => `Anima entrada/salida con "${term}".`,
    whatEn: (term) => `Animate enter/leave using "${term}".`,
    howEs: () => "Combina clases CSS o hooks JS y modes out-in/in-out.",
    howEn: () => "Combine CSS classes or JS hooks with out-in/in-out modes.",
    tags: ["vue", "transitions"],
  },
  sfc: {
    translation: (term) => `SFC ${term}`,
    descriptionEs: (term) => `Estructura de Single File Components: "${term}".`,
    descriptionEn: (term) => `Single File Component structure: "${term}".`,
    whatEs: (term) => `Separa template/script/style con "${term}".`,
    whatEn: (term) => `Split template/script/style using "${term}".`,
    howEs: () => "Usa <script setup> y estilos scoped/module según necesidad.",
    howEn: () => "Use <script setup> and scoped/module styles as needed.",
    tags: ["vue", "sfc"],
  },
  utility: {
    translation: (term) => `utilidad Vue ${term}`,
    descriptionEs: (term) => `Utilidades/renderer/herramientas: "${term}".`,
    descriptionEn: (term) => `Utilities/renderer/tools: "${term}".`,
    whatEs: (term) => `Carga dinámica, nextTick o render functions con "${term}".`,
    whatEn: (term) => `Dynamic load, nextTick, or render functions via "${term}".`,
    howEs: () => "Importa desde vue y usa para control fino del render.",
    howEn: () => "Import from vue and use for fine-grained render control.",
    tags: ["vue", "utility"],
  },
  ssr: {
    translation: (term) => `SSR/SSG ${term}`,
    descriptionEs: (term) => `Renderizado servidor/estático: "${term}".`,
    descriptionEn: (term) => `Server/static rendering: "${term}".`,
    whatEs: (term) => `Sincroniza render/hidratación con "${term}".`,
    whatEn: (term) => `Sync render/hydration using "${term}".`,
    howEs: () => "Usa onServerPrefetch y frameworks (Nuxt/VitePress) según caso.",
    howEn: () => "Use onServerPrefetch and frameworks (Nuxt/VitePress) as needed.",
    tags: ["vue", "ssr"],
  },
  vite: {
    translation: (term) => `Vite ${term}`,
    descriptionEs: (term) => `Herramienta Vite para Vue: "${term}".`,
    descriptionEn: (term) => `Vite tool for Vue: "${term}".`,
    whatEs: (term) => `Configura build/dev con "${term}".`,
    whatEn: (term) => `Configure build/dev using "${term}".`,
    howEs: () => "Define plugins, env y HMR en vite.config.",
    howEn: () => "Define plugins, env, and HMR in vite.config.",
    tags: ["vue", "vite", "tooling"],
  },
  testing: {
    translation: (term) => `testing Vue ${term}`,
    descriptionEs: (term) => `Pruebas con Vue Test Utils/jest/vitest: "${term}".`,
    descriptionEn: (term) => `Testing with Vue Test Utils/jest/vitest: "${term}".`,
    whatEs: (term) => `Monta y asserta componentes con "${term}".`,
    whatEn: (term) => `Mount and assert components using "${term}".`,
    howEs: () => "Usa mount/shallowMount, mocks y asserts de eventos/props/slots.",
    howEn: () => "Use mount/shallowMount, mocks, and assert events/props/slots.",
    tags: ["vue", "testing"],
  },
  advanced: {
    translation: (term) => `avance Vue ${term}`,
    descriptionEs: (term) => `Conceptos avanzados del runtime/compilador: "${term}".`,
    descriptionEn: (term) => `Advanced runtime/compiler concept: "${term}".`,
    whatEs: (term) => `Optimiza render y compilación con "${term}".`,
    whatEn: (term) => `Optimize render/compilation using "${term}".`,
    howEs: () => "Entiende VNode, scheduler y tree-shaking para perf.",
    howEn: () => "Understand VNode, scheduler, and tree-shaking for perf.",
    tags: ["vue", "advanced"],
  },
  ecosystem: {
    translation: (term) => `ecosistema Vue ${term}`,
    descriptionEs: (term) => `Paquete/framework del ecosistema Vue: "${term}".`,
    descriptionEn: (term) => `Vue ecosystem package/framework: "${term}".`,
    whatEs: (term) => `Integra UI/estado utilitarios con "${term}".`,
    whatEn: (term) => `Integrate UI/state utilities using "${term}".`,
    howEs: () => "Instala vía npm/yarn y registra plugins/componentes globales.",
    howEn: () => "Install via npm/yarn and register plugins/global components.",
    tags: ["vue", "ecosystem"],
  },
};

function buildVueSnippets(term: string, kind: VueKind) {
  const sample = getVueSample(term, kind);
  const meta = vueKindMeta[kind];
  return {
    example: {
      titleEs: `Ejemplo ${term}`,
      titleEn: `${term} example`,
      code: sample.example,
      noteEs: meta.whatEs(term),
      noteEn: meta.whatEn(term),
    },
    secondExample: {
      titleEs: `Variación ${term}`,
      titleEn: `${term} variation`,
      code: sample.variant,
      noteEs: meta.howEs(term),
      noteEn: meta.howEn(term),
    },
    exerciseExample: {
      titleEs: `Práctica ${term}`,
      titleEn: `${term} practice`,
      code: sample.exercise,
      noteEs: "Implementa este patrón en un componente real y valida con tests.",
      noteEn: "Apply this pattern in a real component and validate with tests.",
    },
  };
}

function getVueSample(term: string, kind: VueKind): { example: string; variant: string; exercise: string } {
  const tpl = `<template>\n  <div>{{ message }}</div>\n</template>\n<script setup lang="ts">\nimport { ref } from "vue";\nconst message = ref("Hola Vue");\n</script>`;
  switch (kind) {
    case "base":
      return {
        example: `import { createApp } from "vue";\nconst App = { template: "<h1>Hola Vue</h1>" };\ncreateApp(App).mount("#app");`,
        variant: `import { defineComponent } from "vue";\nexport default defineComponent({ name: "Base", template: "<p>Base</p>" });`,
        exercise: tpl,
      };
    case "options":
      return {
        example: `import { defineComponent } from "vue";\nexport default defineComponent({\n  data() { return { count: 0 }; },\n  methods: { inc() { this.count++; } },\n  mounted() { this.inc(); },\n});`,
        variant: `export default defineComponent({\n  props: { title: String },\n  computed: { upper() { return this.title?.toUpperCase(); } },\n});`,
        exercise: `export default defineComponent({\n  watch: { count(value) { console.log(value); } },\n  data: () => ({ count: 0 }),\n});`,
      };
    case "composition":
      return {
        example: `<script setup lang="ts">\nimport { ref, onMounted } from "vue";\nconst count = ref(0);\nonMounted(() => { count.value++; });\n</script>`,
        variant: `<script setup>\nimport { reactive, computed } from "vue";\nconst state = reactive({ items: [1,2,3] });\nconst total = computed(() => state.items.length);\n</script>`,
        exercise: `<script setup>\nimport { watch, ref } from "vue";\nconst query = ref("");\nwatch(query, (value) => console.log(value));\n</script>`,
      };
    case "template":
      return {
        example: `<template>\n  <div v-if="ready">{{ title }}</div>\n  <div v-else>Cargando...</div>\n</template>`,
        variant: `<template>\n  <ul>\n    <li v-for="item in items" :key="item.id">{{ item.name }}</li>\n  </ul>\n</template>`,
        exercise: `<template>\n  <input v-model.trim="text" />\n  <p v-show="text">Hola {{ text }}</p>\n</template>\n<script setup>import { ref } from "vue"; const text = ref("");</script>`,
      };
    case "directive":
      return {
        example: `<template><input v-model="text" /></template>\n<script setup>import { ref } from "vue"; const text = ref("");</script>`,
        variant: `<template><button v-on:click="click">Click</button></template>\n<script setup>const click = () => console.log("click");</script>`,
        exercise: `<template><p v-html="html"></p></template>\n<script setup>const html = "<strong>Seguro?</strong>";</script>`,
      };
    case "component":
      return {
        example: `<template>\n  <Child :title="title" @save="onSave">\n    <template #default>Contenido</template>\n  </Child>\n</template>`,
        variant: `<script setup>\nconst props = defineProps<{ title: string }>();\ndefineEmits<{ (e: "save"): void }>();\n</script>`,
        exercise: `<template>\n  <teleport to="#modals"><slot /></teleport>\n</template>`,
      };
    case "event":
      return {
        example: `<template><button @click="$emit('submit')">Enviar</button></template>`,
        variant: `<template><input @keyup.enter="onEnter" /></template>`,
        exercise: `<template><form @submit.prevent="onSubmit"></form></template>`,
      };
    case "reactivity":
      return {
        example: `<script setup>\nimport { ref, isRef, toRaw } from "vue";\nconst state = ref({ ok: true });\nconsole.log(isRef(state), toRaw(state.value));\n</script>`,
        variant: `<script setup>\nimport { markRaw, reactive } from "vue";\nconst raw = markRaw(new Map());\nconst wrapped = reactive({ raw });\n</script>`,
        exercise: `<script setup>\nimport { effectScope, ref } from "vue";\nconst scope = effectScope();\nscope.run(() => {\n  const count = ref(0);\n  count.value++;\n});\n</script>`,
      };
    case "router":
      return {
        example: `import { createRouter, createWebHistory } from "vue-router";\nconst routes = [{ path: "/", component: Home }];\nconst router = createRouter({ history: createWebHistory(), routes });`,
        variant: `router.beforeEach((to, from, next) => { if (!auth && to.meta.protected) return next("/login"); next(); });`,
        exercise: `router.push({ name: "user", params: { id: 1 } });`,
      };
    case "pinia":
      return {
        example: `import { defineStore } from "pinia";\nexport const useCounter = defineStore("counter", { state: () => ({ count: 0 }), actions: { inc() { this.count++; } } });`,
        variant: `const store = useCounter();\nconst { count } = storeToRefs(store);`,
        exercise: `store.$patch({ count: 10 });`,
      };
    case "transition":
      return {
        example: `<transition name="fade">\n  <p v-if="open">Hola</p>\n</transition>`,
        variant: `<transition-group name="list" tag="ul">\n  <li v-for="item in items" :key="item.id">{{ item.text }}</li>\n</transition-group>`,
        exercise: `<transition mode="out-in">\n  <component :is="view" />\n</transition>`,
      };
    case "sfc":
      return {
        example: `<template><h1>SFC</h1></template>\n<script setup lang="ts">const msg = "Hola";</script>\n<style scoped>h1 { color: teal; }</style>`,
        variant: `<style module>.title { color: rebeccapurple; }</style>`,
        exercise: `<script lang="ts">export default { name: "Legacy" };</script>`,
      };
    case "utility":
      return {
        example: `import { defineAsyncComponent, nextTick, h } from "vue";\nconst AsyncCard = defineAsyncComponent(() => import("./Card.vue"));\nawait nextTick();\nconst vnode = h("div", "hola");`,
        variant: `app.component("Card", Card);\napp.directive("focus", { mounted(el) { el.focus(); } });`,
        exercise: `// Usa error boundaries o render functions para control fino.`,
      };
    case "ssr":
      return {
        example: `<script setup>\nimport { onServerPrefetch } from "vue";\nonServerPrefetch(async () => fetchData());\n</script>`,
        variant: `// Nuxt/Nitro\nexport default defineNuxtPlugin(() => {});`,
        exercise: `// Usa useSSRContext para pasar datos al cliente.`,
      };
    case "vite":
      return {
        example: `// vite.config.ts\nimport { defineConfig } from "vite";\nimport vue from "@vitejs/plugin-vue";\nexport default defineConfig({ plugins: [vue()], server: { port: 5173 } });`,
        variant: `console.log(import.meta.env.VITE_API_URL);`,
        exercise: `// Ejecuta vite build / vite preview.`,
      };
    case "testing":
      return {
        example: `import { mount } from "@vue/test-utils";\nimport Component from "./Component.vue";\nconst wrapper = mount(Component, { props: { title: "Hola" } });\nexpect(wrapper.text()).toContain("Hola");`,
        variant: `await wrapper.find("button").trigger("click");\nexpect(wrapper.emitted("click")).toBeTruthy();`,
        exercise: `// Prueba slots y snapshots con testing-library/vue o vitest.`,
      };
    case "advanced":
      return {
        example: `// VNode/hoisting\n// Comprende VNode y scheduler para optimizar render`,
        variant: `// Static hoisting y diff algorithm reducen trabajo de render`,
        exercise: `// Inspecciona hydration mismatch y corrígelo.`,
      };
    case "ecosystem":
      return {
        example: `// Instala e importa ${term}\nimport ${term.replace(/\s|\./g, "") || "Plugin"} from "${term.split(" ")[0].toLowerCase()}";`,
        variant: `// Registra el plugin/componente global si aplica`,
        exercise: `// Integra ${term} en tu app con estilos/config requeridos.`,
      };
    default:
      return {
        example: tpl,
        variant: tpl,
        exercise: tpl,
      };
  }
}

function buildVueSeed(term: string, kind: VueKind): SeedTermInput {
  const cleanTerm = term.trim();
  const meta = vueKindMeta[kind];
  const snippets = buildVueSnippets(cleanTerm, kind);
  const translation = meta.translation(cleanTerm);
  const descriptionEs = meta.descriptionEs(cleanTerm);
  const descriptionEn = meta.descriptionEn(cleanTerm);
  const whatEs = meta.whatEs(cleanTerm);
  const whatEn = meta.whatEn(cleanTerm);
  const howEs = meta.howEs(cleanTerm);
  const howEn = meta.howEn(cleanTerm);
  const tags = meta.tags.concat(["vue", kind, cleanTerm.toLowerCase()]);

  return {
    term: cleanTerm,
    slug: slugify(`vue-${cleanTerm.replace(/[^a-z0-9]+/gi, "-")}`),
    translation,
    category: Category.frontend,
    descriptionEs,
    descriptionEn,
    aliases: [cleanTerm],
    tags,
    example: snippets.example,
    secondExample: snippets.secondExample,
    exerciseExample: snippets.exerciseExample,
    whatEs,
    whatEn,
    howEs,
    howEn,
  };
}

const vueSeedTerms: SeedTermInput[] = [];
const vueSeen = new Set<string>();

function pushVueTerms(list: string[], kind: VueKind) {
  for (const raw of list) {
    const term = raw.trim();
    if (!term) continue;
    const key = term.toLowerCase();
    if (vueSeen.has(key) || stackTermSet.has(key)) continue;
    vueSeen.add(key);
    vueSeedTerms.push(buildVueSeed(term, kind));
  }
}

const vueBase = [
  "Vue.js",
  "Vue 2",
  "Vue 3",
  "MVVM",
  "Virtual DOM",
  "Reactividad",
  "Hydration",
  "Template Compilation",
  "Componentes",
  "Directivas",
  "Instance",
  "App Instance",
  "defineComponent",
  "createApp",
  "mount",
  "unmount",
  "Single File Component (SFC)",
  ".vue files",
];

const vueOptions = [
  "data",
  "methods",
  "computed",
  "watch",
  "props",
  "emits",
  "provide",
  "inject",
  "created",
  "mounted",
  "updated",
  "unmounted",
  "beforeCreate",
  "beforeMount",
  "beforeUpdate",
  "beforeUnmount",
  "mixins",
  "extends",
  "filters (Vue 2)",
  "model",
  "components",
  "directives",
  "template",
  "render",
  "watchEffect (en Options API vía setup)",
];

const vueComposition = [
  "setup",
  "ref",
  "reactive",
  "readonly",
  "toRefs",
  "toRef",
  "shallowRef",
  "shallowReactive",
  "computed",
  "watch",
  "watchEffect",
  "onMounted",
  "onUpdated",
  "onUnmounted",
  "onBeforeMount",
  "onBeforeUpdate",
  "onBeforeUnmount",
  "onErrorCaptured",
  "onRenderTracked",
  "onRenderTriggered",
  "provide",
  "inject",
  "getCurrentInstance",
  "defineProps",
  "defineEmits",
  "defineExpose",
  "defineSlots",
  "useSlots",
  "useAttrs",
];

const vueTemplateSyntax = [
  "{{ interpolation }}",
  "v-bind",
  "v-bind:attribute",
  ":",
  "v-on",
  "v-on:event",
  "@",
  "v-model",
  "v-model.lazy",
  "v-model.number",
  "v-model.trim",
  "v-if",
  "v-else",
  "v-else-if",
  "v-show",
  "v-for",
  ":key",
  "v-pre",
  "v-once",
  "v-memo",
  "v-html",
  "v-text",
  "v-slot",
  "#default",
  "#header",
  "#footer",
  "slot props",
  "component is=",
];

const vueDirectives = [
  "v-model",
  "v-bind",
  "v-on",
  "v-if",
  "v-else",
  "v-else-if",
  "v-show",
  "v-for",
  "v-slot",
  "v-html",
  "v-text",
  "v-pre",
  "v-once",
  "v-memo",
  "v-cloak",
];

const vueComponentsProps = [
  "props",
  "emits",
  "slots",
  "default slot",
  "named slots",
  "scoped slots",
  "props validation",
  "dynamic props",
  "inheritAttrs",
  "attrs",
  "expose",
  "exposed API",
  "teleport",
  "suspense",
  "fragment",
];

const vueEvents = [
  "$emit",
  "emit",
  "custom events",
  "event modifiers",
  ".prevent",
  ".stop",
  ".capture",
  ".once",
  ".passive",
  "self",
  "keyup.enter",
  "keyup.esc",
];

const vueReactivity = [
  "ref",
  "reactive",
  "proxy",
  "toRaw",
  "markRaw",
  "shallowReactive",
  "shallowRef",
  "isRef",
  "isReactive",
  "isProxy",
  "isReadonly",
  "effect scope",
  "effect",
  "computed cache",
  "Reactivity Transform (deprecated)",
];

const vueRouter = [
  "Vue Router",
  "createRouter",
  "createWebHistory",
  "createWebHashHistory",
  "createMemoryHistory",
  "routes",
  "route params",
  "dynamic route",
  "nested routes",
  "router-link",
  "router-view",
  "router.push",
  "router.replace",
  "router.back",
  "router.beforeEach",
  "router.afterEach",
  "scrollBehavior",
  "meta fields",
  "named routes",
  "guards",
  "lazy-loaded routes",
  "404 route",
  "catch-all route",
  "history mode",
  "query params",
];

const vuePinia = [
  "Pinia",
  "createPinia",
  "defineStore",
  "storeToRefs",
  "state",
  "getters",
  "actions",
  "$patch",
  "$reset",
  "persist plugin",
  "subscriptions",
  "store hydration",
  "SSR pinia",
];

const vueTransitions = [
  "transition",
  "transition-group",
  "enter-from-class",
  "enter-active-class",
  "enter-to-class",
  "leave-from-class",
  "leave-active-class",
  "leave-to-class",
  "appear",
  'mode="out-in"',
  'mode="in-out"',
  "CSS transitions",
  "JS hooks",
  "before-enter",
  "enter",
  "after-enter",
  "before-leave",
  "leave",
  "after-leave",
];

const vueSfc = [
  "<template>",
  "<script>",
  "<script setup>",
  "<script lang=\"ts\">",
  "<style>",
  "<style scoped>",
  "<style module>",
  "<style lang=\"scss\">",
  "<style lang=\"less\">",
  "<style lang=\"postcss\">",
];

const vueUtilities = [
  "defineAsyncComponent",
  "nextTick",
  "h (createElement)",
  "render function",
  "custom directives",
  "global components",
  "global properties",
  "app.provide",
  "app.component",
  "app.directive",
  "async components",
  "error boundaries",
  "Custom renderer",
  "Vite integration",
];

const vueSsr = [
  "SSR",
  "Hydration",
  "Server Prefetch",
  "onServerPrefetch",
  "useSSRContext",
  "Nuxt.js (framework)",
  "VitePress (SSG)",
  "Universal rendering",
];

const vueVite = [
  "Vite",
  "vite.config.js",
  "HMR (Hot Module Replacement)",
  "env variables",
  "import.meta.env",
  "plugins",
  "vite build",
  "vite preview",
  "vite dev",
];

const vueTesting = [
  "Vue Test Utils",
  "mount",
  "shallowMount",
  "wrapper",
  "find",
  "findComponent",
  "trigger",
  "emitted",
  "jest",
  "vitest",
  "testing-library/vue",
  "component mocking",
  "slots testing",
  "prop testing",
  "event testing",
  "snapshot testing",
];

const vueAdvanced = [
  "Compiler macros",
  "Tree-shaking",
  "Hydration mismatch",
  "Template compilation",
  "Static hoisting",
  "Block tree",
  "VNode",
  "diff algorithm",
  "scheduler",
  "async rendering",
  "Teleport target",
  "Suspense fallback",
  "isVNode",
];

const vueEcosystem = [
  "Vuetify",
  "Quasar",
  "Naive UI",
  "Element Plus",
  "PrimeVue",
  "VueUse",
  "Vue Query",
  "Vuex (Vue 2 legacy)",
  "Composition API plugin Vue 2",
  "Vue CLI (legacy)",
  "Vue DevTools",
];

pushVueTerms(vueBase, "base");
pushVueTerms(vueOptions, "options");
pushVueTerms(vueComposition, "composition");
pushVueTerms(vueTemplateSyntax, "template");
pushVueTerms(vueDirectives, "directive");
pushVueTerms(vueComponentsProps, "component");
pushVueTerms(vueEvents, "event");
pushVueTerms(vueReactivity, "reactivity");
pushVueTerms(vueRouter, "router");
pushVueTerms(vuePinia, "pinia");
pushVueTerms(vueTransitions, "transition");
pushVueTerms(vueSfc, "sfc");
pushVueTerms(vueUtilities, "utility");
pushVueTerms(vueSsr, "ssr");
pushVueTerms(vueVite, "vite");
pushVueTerms(vueTesting, "testing");
pushVueTerms(vueAdvanced, "advanced");
pushVueTerms(vueEcosystem, "ecosystem");

const dedupedVueTerms = vueSeedTerms.filter((term) => !stackTermSet.has(term.term.toLowerCase()));
const vueTermSet = new Set([...stackTermSet, ...dedupedVueTerms.map((item) => item.term.toLowerCase())]);

type AngularKind =
  | "base"
  | "cli"
  | "workspace"
  | "component"
  | "lifecycle"
  | "module"
  | "directive"
  | "pipe"
  | "service"
  | "routing"
  | "forms"
  | "http"
  | "rxjs"
  | "cdk"
  | "material"
  | "standalone"
  | "signals"
  | "change-detection"
  | "state"
  | "template"
  | "performance"
  | "ssr"
  | "testing"
  | "animation";

const angularKindMeta: Record<
  AngularKind,
  {
    translation: (term: string) => string;
    descriptionEs: (term: string) => string;
    descriptionEn: (term: string) => string;
    whatEs: (term: string) => string;
    whatEn: (term: string) => string;
    howEs: (term: string) => string;
    howEn: (term: string) => string;
    tags: string[];
  }
> = {
  base: {
    translation: (term) => `concepto Angular ${term}`,
    descriptionEs: (term) => `Concepto base de Angular: "${term}".`,
    descriptionEn: (term) => `Angular base concept: "${term}".`,
    whatEs: (term) => `Entiende el framework y su CLI a través de "${term}".`,
    whatEn: (term) => `Understand the framework/CLI through "${term}".`,
    howEs: () => "Instala Angular CLI y crea proyectos usando ng commands.",
    howEn: () => "Install Angular CLI and scaffold projects using ng commands.",
    tags: ["angular", "base"],
  },
  cli: {
    translation: (term) => `comando Angular CLI ${term}`,
    descriptionEs: (term) => `Comando CLI de Angular: "${term}".`,
    descriptionEn: (term) => `Angular CLI command: "${term}".`,
    whatEs: (term) => `Automatiza generación/build con "${term}".`,
    whatEn: (term) => `Automate generation/build using "${term}".`,
    howEs: () => "Ejecuta ng desde el workspace y revisa angular.json.",
    howEn: () => "Run ng in the workspace and review angular.json.",
    tags: ["angular", "cli"],
  },
  workspace: {
    translation: (term) => `workspace Angular ${term}`,
    descriptionEs: (term) => `Archivo/estructura del workspace: "${term}".`,
    descriptionEn: (term) => `Workspace file/structure: "${term}".`,
    whatEs: (term) => `Configura proyectos y builds con "${term}".`,
    whatEn: (term) => `Configure projects/builds using "${term}".`,
    howEs: () => "Edita angular.json/tsconfig para paths, builds y budgets.",
    howEn: () => "Edit angular.json/tsconfig for paths, builds, and budgets.",
    tags: ["angular", "workspace"],
  },
  component: {
    translation: (term) => `componente Angular ${term}`,
    descriptionEs: (term) => `Decoradores y APIs de componentes: "${term}".`,
    descriptionEn: (term) => `Component decorators/APIs: "${term}".`,
    whatEs: (term) => `Define UI con @Component y estrategias de cambio.`,
    whatEn: (term) => `Define UI with @Component and change strategies.`,
    howEs: () => "Declara selector, template y changeDetection según necesidad.",
    howEn: () => "Declare selector, template, and changeDetection as needed.",
    tags: ["angular", "components"],
  },
  lifecycle: {
    translation: (term) => `hook de ciclo ${term}`,
    descriptionEs: (term) => `Lifecycle hook de Angular: "${term}".`,
    descriptionEn: (term) => `Angular lifecycle hook: "${term}".`,
    whatEs: (term) => `Sincroniza efectos con el ciclo del componente usando "${term}".`,
    whatEn: (term) => `Sync effects with component lifecycle via "${term}".`,
    howEs: () => "Implementa la interfaz del hook y limpia subscripciones en destroy.",
    howEn: () => "Implement the hook interface and clean subscriptions on destroy.",
    tags: ["angular", "lifecycle"],
  },
  module: {
    translation: (term) => `módulo Angular ${term}`,
    descriptionEs: (term) => `API de NgModule y módulos core: "${term}".`,
    descriptionEn: (term) => `NgModule/core module API: "${term}".`,
    whatEs: (term) => `Organiza imports/providers con "${term}".`,
    whatEn: (term) => `Organize imports/providers using "${term}".`,
    howEs: () => "Declara imports/declarations/providers/exports en NgModule.",
    howEn: () => "Declare imports/declarations/providers/exports in NgModule.",
    tags: ["angular", "modules"],
  },
  directive: {
    translation: (term) => `directiva ${term}`,
    descriptionEs: (term) => `Directiva/atributo Angular: "${term}".`,
    descriptionEn: (term) => `Angular directive/attribute: "${term}".`,
    whatEs: (term) => `Controla render/estilo o eventos con "${term}".`,
    whatEn: (term) => `Control render/style or events using "${term}".`,
    howEs: () => "Usa * para estructurales y []/() para bindings.",
    howEn: () => "Use * for structural and []/() for bindings.",
    tags: ["angular", "directives"],
  },
  pipe: {
    translation: (term) => `pipe ${term}`,
    descriptionEs: (term) => `Pipe integrado o custom: "${term}".`,
    descriptionEn: (term) => `Built-in/custom pipe: "${term}".`,
    whatEs: (term) => `Transforma valores en templates con "${term}".`,
    whatEn: (term) => `Transform values in templates using "${term}".`,
    howEs: () => "Declara pure/impure pipes y registra en modules/standalone.",
    howEn: () => "Declare pure/impure pipes and register in modules/standalone.",
    tags: ["angular", "pipes"],
  },
  service: {
    translation: (term) => `servicio Angular ${term}`,
    descriptionEs: (term) => `Servicios/DI en Angular: "${term}".`,
    descriptionEn: (term) => `Services/DI in Angular: "${term}".`,
    whatEs: (term) => `Inyecta dependencias con @Injectable y providers.`,
    whatEn: (term) => `Inject dependencies with @Injectable and providers.`,
    howEs: () => "Configura providedIn o registra en providers para scope adecuado.",
    howEn: () => "Set providedIn or register in providers for proper scope.",
    tags: ["angular", "services", "di"],
  },
  routing: {
    translation: (term) => `routing ${term}`,
    descriptionEs: (term) => `APIs de Router Angular: "${term}".`,
    descriptionEn: (term) => `Angular Router APIs: "${term}".`,
    whatEs: (term) => `Define rutas, guards y navegación con "${term}".`,
    whatEn: (term) => `Define routes, guards, and navigation using "${term}".`,
    howEs: () => "Configura RouterModule/guards y usa routerLink/router.navigate.",
    howEn: () => "Configure RouterModule/guards and use routerLink/router.navigate.",
    tags: ["angular", "router"],
  },
  forms: {
    translation: (term) => `formularios ${term}`,
    descriptionEs: (term) => `APIs de FormsModule/ReactiveForms: "${term}".`,
    descriptionEn: (term) => `FormsModule/ReactiveForms APIs: "${term}".`,
    whatEs: (term) => `Construye formularios reactivos o template-driven con "${term}".`,
    whatEn: (term) => `Build reactive or template-driven forms using "${term}".`,
    howEs: () => "Usa FormControl/FormGroup o ngModel + validators.",
    howEn: () => "Use FormControl/FormGroup or ngModel + validators.",
    tags: ["angular", "forms"],
  },
  http: {
    translation: (term) => `HTTP ${term}`,
    descriptionEs: (term) => `HttpClient y APIs relacionadas: "${term}".`,
    descriptionEn: (term) => `HttpClient and related APIs: "${term}".`,
    whatEs: (term) => `Consume APIs y maneja interceptores/errores con "${term}".`,
    whatEn: (term) => `Consume APIs and handle interceptors/errors using "${term}".`,
    howEs: () => "Inyecta HttpClient y compón interceptores para headers/logging.",
    howEn: () => "Inject HttpClient and compose interceptors for headers/logging.",
    tags: ["angular", "http"],
  },
  rxjs: {
    translation: (term) => `RxJS ${term}`,
    descriptionEs: (term) => `Streams y operadores RxJS: "${term}".`,
    descriptionEn: (term) => `RxJS streams/operators: "${term}".`,
    whatEs: (term) => `Gestiona asincronía y eventos con "${term}".`,
    whatEn: (term) => `Manage async/events using "${term}".`,
    howEs: () => "Encadena operadores y maneja suscripciones/unsubscribe.",
    howEn: () => "Chain operators and manage subscriptions/unsubscribe.",
    tags: ["angular", "rxjs"],
  },
  cdk: {
    translation: (term) => `CDK ${term}`,
    descriptionEs: (term) => `Component Dev Kit: "${term}".`,
    descriptionEn: (term) => `Component Dev Kit: "${term}".`,
    whatEs: (term) => `Construye UI accesible con ${term}.`,
    whatEn: (term) => `Build accessible UI using ${term}.`,
    howEs: () => "Importa módulos CDK (Overlay, DragDrop, etc.) según necesidad.",
    howEn: () => "Import CDK modules (Overlay, DragDrop, etc.) as needed.",
    tags: ["angular", "cdk"],
  },
  material: {
    translation: (term) => `Angular Material ${term}`,
    descriptionEs: (term) => `Componente Angular Material: "${term}".`,
    descriptionEn: (term) => `Angular Material component: "${term}".`,
    whatEs: (term) => `Usa componentes Material con ${term}.`,
    whatEn: (term) => `Use Material components via ${term}.`,
    howEs: () => "Importa módulos individuales y temas; habilita BrowserAnimationsModule.",
    howEn: () => "Import individual modules and themes; enable BrowserAnimationsModule.",
    tags: ["angular", "material"],
  },
  standalone: {
    translation: (term) => `Standalone Angular ${term}`,
    descriptionEs: (term) => `APIs standalone/provider: "${term}".`,
    descriptionEn: (term) => `Standalone/provider APIs: "${term}".`,
    whatEs: (term) => `Declara componentes standalone y providers bootstrapped con "${term}".`,
    whatEn: (term) => `Declare standalone components and providers bootstrapped via "${term}".`,
    howEs: () => "Usa bootstrapApplication e importProvidersFrom/provideRouter.",
    howEn: () => "Use bootstrapApplication and importProvidersFrom/provideRouter.",
    tags: ["angular", "standalone"],
  },
  signals: {
    translation: (term) => `Signals ${term}`,
    descriptionEs: (term) => `APIs de señales (Angular 17+): "${term}".`,
    descriptionEn: (term) => `Angular signals APIs (17+): "${term}".`,
    whatEs: (term) => `Modelo reactivo sin Zone con "${term}".`,
    whatEn: (term) => `Zone-less reactive model using "${term}".`,
    howEs: () => "Declara signal/computed/effect y maneja set/update/mutate.",
    howEn: () => "Declare signal/computed/effect and manage set/update/mutate.",
    tags: ["angular", "signals"],
  },
  "change-detection": {
    translation: (term) => `detección de cambios ${term}`,
    descriptionEs: (term) => `Estrategias y zones: "${term}".`,
    descriptionEn: (term) => `Strategies/zones: "${term}".`,
    whatEs: (term) => `Optimiza renders controlando detección con "${term}".`,
    whatEn: (term) => `Optimize renders by controlling detection via "${term}".`,
    howEs: () => "Usa OnPush, NgZone.runOutsideAngular y markForCheck.",
    howEn: () => "Use OnPush, NgZone.runOutsideAngular, and markForCheck.",
    tags: ["angular", "change-detection"],
  },
  state: {
    translation: (term) => `estado Angular ${term}`,
    descriptionEs: (term) => `State management (NgRx/Akita/NGXS): "${term}".`,
    descriptionEn: (term) => `State management (NgRx/Akita/NGXS): "${term}".`,
    whatEs: (term) => `Orquesta estado global/efectos con "${term}".`,
    whatEn: (term) => `Orchestrate global state/effects using "${term}".`,
    howEs: () => "Define acciones, reducers/effects y selectores/memoization.",
    howEn: () => "Define actions, reducers/effects, and selectors/memoization.",
    tags: ["angular", "state"],
  },
  template: {
    translation: (term) => `binding Angular ${term}`,
    descriptionEs: (term) => `Sintaxis de template/binding: "${term}".`,
    descriptionEn: (term) => `Template/binding syntax: "${term}".`,
    whatEs: (term) => `Compones UI con interpolación, bindings y pipes usando "${term}".`,
    whatEn: (term) => `Compose UI with interpolation, bindings, and pipes using "${term}".`,
    howEs: () => "Combina property/event/two-way binding y operadores seguros.",
    howEn: () => "Combine property/event/two-way binding and safe navigation.",
    tags: ["angular", "template"],
  },
  performance: {
    translation: (term) => `performance Angular ${term}`,
    descriptionEs: (term) => `Optimización/performance: "${term}".`,
    descriptionEn: (term) => `Optimization/performance: "${term}".`,
    whatEs: (term) => `Reduce bundle/render con "${term}".`,
    whatEn: (term) => `Reduce bundle/render using "${term}".`,
    howEs: () => "Activa AOT/Ivy, defer/SSR y preloading/code splitting.",
    howEn: () => "Enable AOT/Ivy, defer/SSR, and preloading/code splitting.",
    tags: ["angular", "performance"],
  },
  ssr: {
    translation: (term) => `SSR/SSG Angular ${term}`,
    descriptionEs: (term) => `Renderizado servidor/prerender: "${term}".`,
    descriptionEn: (term) => `Server rendering/prerender: "${term}".`,
    whatEs: (term) => `Mejora SEO/TTFB con "${term}".`,
    whatEn: (term) => `Improve SEO/TTFB via "${term}".`,
    howEs: () => "Usa Angular Universal, hydration y App Shell/prerender.",
    howEn: () => "Use Angular Universal, hydration, and App Shell/prerender.",
    tags: ["angular", "ssr"],
  },
  testing: {
    translation: (term) => `testing Angular ${term}`,
    descriptionEs: (term) => `Pruebas con Jasmine/Karma/TestBed: "${term}".`,
    descriptionEn: (term) => `Testing with Jasmine/Karma/TestBed: "${term}".`,
    whatEs: (term) => `Monta y testa componentes/servicios con "${term}".`,
    whatEn: (term) => `Mount/test components/services using "${term}".`,
    howEs: () => "Configura TestBed, fakeAsync/tick y HttpTestingController.",
    howEn: () => "Configure TestBed, fakeAsync/tick, and HttpTestingController.",
    tags: ["angular", "testing"],
  },
  animation: {
    translation: (term) => `animación Angular ${term}`,
    descriptionEs: (term) => `APIs de animación: "${term}".`,
    descriptionEn: (term) => `Animation APIs: "${term}".`,
    whatEs: (term) => `Define triggers/estados/transiciones con "${term}".`,
    whatEn: (term) => `Define triggers/states/transitions using "${term}".`,
    howEs: () => "Importa BrowserAnimationsModule y declara triggers en componentes.",
    howEn: () => "Import BrowserAnimationsModule and declare triggers in components.",
    tags: ["angular", "animations"],
  },
};

function getAngularSample(term: string, kind: AngularKind): { example: string; variant: string; exercise: string } {
  switch (kind) {
    case "cli":
      return {
        example: `ng new app && cd app && ng serve`,
        variant: `ng generate component home`,
        exercise: `ng build --configuration production`,
      };
    case "component":
      return {
        example: `@Component({ selector: "app-hero", template: "<h1>{{title}}</h1>" })\nexport class HeroComponent { title = "Angular"; }`,
        variant: `@Component({ selector: "app-card", templateUrl: "./card.component.html", changeDetection: ChangeDetectionStrategy.OnPush })\nexport class CardComponent {}`,
        exercise: `@Component({ selector: "app-standalone", standalone: true, template: "<p>Ready</p>" }) export class StandaloneComponent {}`,
      };
    case "lifecycle":
      return {
        example: `export class Sample implements OnInit, OnDestroy {\n  ngOnInit() { console.log("init"); }\n  ngOnDestroy() { console.log("destroy"); }\n}`,
        variant: `ngAfterViewInit() { /* DOM ready */ }\nngAfterViewChecked() {}`,
        exercise: `ngOnChanges(changes: SimpleChanges) { console.log(changes); }`,
      };
    case "module":
      return {
        example: `@NgModule({ declarations: [AppComponent], imports: [BrowserModule], bootstrap: [AppComponent] })\nexport class AppModule {}`,
        variant: `@NgModule({ imports: [CommonModule, FormsModule], exports: [CommonModule, FormsModule] }) export class SharedModule {}`,
        exercise: `@NgModule({ providers: [HttpClientModule] }) export class CoreModule {}`,
      };
    case "directive":
      return {
        example: `<div *ngIf="ready">Listo</div>`,
        variant: `<li *ngFor="let item of items; trackBy: trackId">{{ item.name }}</li>`,
        exercise: `<button [ngClass]="{ active: isActive }" (click)="toggle()"></button>`,
      };
    case "pipe":
      return {
        example: `<p>{{ price | currency:'USD' }}</p>`,
        variant: `<p>{{ date | date:'short' }}</p>`,
        exercise: `<p>{{ items | json }}</p>`,
      };
    case "service":
      return {
        example: `@Injectable({ providedIn: "root" })\nexport class ApiService { constructor(private http: HttpClient) {} }`,
        variant: `export const TOKEN = new InjectionToken<string>("token");`,
        exercise: `@Injectable() export class CounterService { value = 0; inc() { this.value++; } }`,
      };
    case "routing":
      return {
        example: `const routes: Routes = [{ path: "", component: HomeComponent }];\n@NgModule({ imports: [RouterModule.forRoot(routes)], exports: [RouterModule] })\nexport class AppRoutingModule {}`,
        variant: `this.router.navigate(["/users", id], { queryParams: { ref: "home" } });`,
        exercise: `canActivate(route: ActivatedRouteSnapshot) { return isLoggedIn(); }`,
      };
    case "forms":
      return {
        example: `form = new FormGroup({ email: new FormControl("", [Validators.required, Validators.email]) });`,
        variant: `<form (ngSubmit)="submit()" #f="ngForm"><input name="title" ngModel required /></form>`,
        exercise: `this.form.valueChanges.subscribe((value) => console.log(value));`,
      };
    case "http":
      return {
        example: `this.http.get<User[]>("/api/users").subscribe();`,
        variant: `@Injectable({ providedIn: "root" }) export class AuthInterceptor implements HttpInterceptor {\n  intercept(req: HttpRequest<any>, next: HttpHandler) { return next.handle(req.clone({ setHeaders: { Authorization: "token" } })); }\n}`,
        exercise: `this.http.post("/api/login", body).pipe(catchError(err => of(null)));`,
      };
    case "rxjs":
      return {
        example: `interval(1000).pipe(take(3), map((n) => n + 1)).subscribe();`,
        variant: `this.http.get("/api").pipe(switchMap(() => of("done")));`,
        exercise: `const stop$ = new Subject<void>();\ninterval(500).pipe(takeUntil(stop$)).subscribe();`,
      };
    case "cdk":
      return {
        example: `import { Overlay } from "@angular/cdk/overlay";`,
        variant: `import { DragDropModule } from "@angular/cdk/drag-drop";`,
        exercise: `// Usa CDK Scrolling/Overlay según la UX requerida.`,
      };
    case "material":
      return {
        example: `<button mat-button>Click</button>`,
        variant: `<mat-form-field><input matInput placeholder="Email" /></mat-form-field>`,
        exercise: `<mat-dialog-content>Contenido</mat-dialog-content>`,
      };
    case "standalone":
      return {
        example: `bootstrapApplication(AppComponent, { providers: [importProvidersFrom(HttpClientModule)] });`,
        variant: `@Component({ selector: "app-root", standalone: true, imports: [RouterModule], template: "<router-outlet />" }) export class AppComponent {}`,
        exercise: `provideRouter(routes);`,
      };
    case "signals":
      return {
        example: `const count = signal(0);\nconst doubled = computed(() => count() * 2);\neffect(() => console.log(doubled()));`,
        variant: `count.update((v) => v + 1);`,
        exercise: `const todo = model<{ title: string }>({ title: "" });`,
      };
    case "change-detection":
      return {
        example: `@Component({ changeDetection: ChangeDetectionStrategy.OnPush, template: "<p>{{value}}</p>" }) export class Demo {}`,
        variant: `this.ngZone.runOutsideAngular(() => setTimeout(() => this.ngZone.run(() => this.tick()), 0));`,
        exercise: `this.cdr.markForCheck();`,
      };
    case "state":
      return {
        example: `import { Store } from "@ngrx/store";\nstore.dispatch(loadUsers());`,
        variant: `const users$ = store.select(selectUsers);`,
        exercise: `@Injectable() export class Effects { load$ = createEffect(() => this.actions$.pipe(ofType(loadUsers), switchMap(() => this.api.getUsers().pipe(map(success), catchError(fail))))); }`,
      };
    case "template":
      return {
        example: `<div>{{ title }}</div>`,
        variant: `<button (click)="save()" [disabled]="loading">Guardar</button>`,
        exercise: `<input [(ngModel)]="value" /> <p>{{ value | uppercase }}</p>`,
      };
    case "performance":
      return {
        example: `// Usa lazy loading y preloading strategy`,
        variant: `// Habilita AOT e Ivy en builds de producción`,
        exercise: `// Emplea defer/hydration en Angular 17 para TTFB`,
      };
    case "ssr":
      return {
        example: `// Angular Universal\nng add @nguniversal/express-engine`,
        variant: `// prerender\ngenerateAppShell: true`,
        exercise: `// Hidrata con Angular 17 hydration.`,
      };
    case "testing":
      return {
        example: `TestBed.configureTestingModule({ declarations: [AppComponent] }).compileComponents();`,
        variant: `const fixture = TestBed.createComponent(AppComponent);\nfixture.detectChanges();`,
        exercise: `httpMock.expectOne("/api").flush({ ok: true });`,
      };
    case "animation":
      return {
        example: `animations: [trigger("fade", [transition(":enter", [style({ opacity: 0 }), animate("200ms", style({ opacity: 1 }))])])]`,
        variant: `import { BrowserAnimationsModule } from "@angular/platform-browser/animations";`,
        exercise: `@Component({ animations: [trigger("list", [transition("* => *", [query(":enter", [stagger(100, animate("200ms"))], { optional: true })])]) ]}) class Demo {}`,
      };
    case "workspace":
    case "base":
    default:
      return {
        example: `// ${term} en Angular`,
        variant: `// Usa ${term} en tu proyecto`,
        exercise: `// Documenta ${term} en tu wiki.`,
      };
  }
}

function buildAngularSeed(term: string, kind: AngularKind): SeedTermInput {
  const cleanTerm = term.trim();
  const meta = angularKindMeta[kind];
  const snippets = getAngularSample(cleanTerm, kind);
  const translation = meta.translation(cleanTerm);
  const descriptionEs = meta.descriptionEs(cleanTerm);
  const descriptionEn = meta.descriptionEn(cleanTerm);
  const whatEs = meta.whatEs(cleanTerm);
  const whatEn = meta.whatEn(cleanTerm);
  const howEs = meta.howEs(cleanTerm);
  const howEn = meta.howEn(cleanTerm);
  const tags = meta.tags.concat(["angular", kind, cleanTerm.toLowerCase()]);

  return {
    term: cleanTerm,
    slug: slugify(`ng-${cleanTerm.replace(/[^a-z0-9]+/gi, "-")}`),
    translation,
    category: Category.frontend,
    descriptionEs,
    descriptionEn,
    aliases: [cleanTerm],
    tags,
    example: {
      titleEs: "Ejemplo básico",
      titleEn: "Basic example",
      code: snippets.example,
    },
    secondExample: {
      titleEs: "Variante de uso",
      titleEn: "Usage variant",
      code: snippets.variant,
    },
    exerciseExample: {
      titleEs: "Ejercicio práctico",
      titleEn: "Practical exercise",
      code: snippets.exercise,
    },
    whatEs,
    whatEn,
    howEs,
    howEn,
  };
}

const angularSeedTerms: SeedTermInput[] = [];
const angularSeen = new Set<string>();

function pushAngularTerms(list: string[], kind: AngularKind) {
  for (const raw of list) {
    const term = raw.trim();
    if (!term) continue;
    const key = term.toLowerCase();
    if (angularSeen.has(key) || vueTermSet.has(key)) continue;
    angularSeen.add(key);
    angularSeedTerms.push(buildAngularSeed(term, kind));
  }
}

const angularBase = [
  "Angular",
  "Angular CLI",
  "ng new",
  "ng serve",
  "ng build",
  "ng generate",
  "ng g component",
  "ng g service",
  "ng g module",
  "ng g pipe",
  "ng g directive",
  "ng g guard",
  "ng update",
  "ng deploy",
];

const angularWorkspace = ["Angular Workspace", "Project Structure", "angular.json", "tsconfig.json", "package.json"];

const angularComponents = [
  "Components",
  "@Component",
  "selector",
  "template",
  "templateUrl",
  "styles",
  "styleUrls",
  "standalone components",
  "changeDetection",
  "ChangeDetectionStrategy",
];

const angularLifecycle = [
  "ngOnInit",
  "ngOnChanges",
  "ngDoCheck",
  "ngAfterContentInit",
  "ngAfterContentChecked",
  "ngAfterViewInit",
  "ngAfterViewChecked",
  "ngOnDestroy",
];

const angularModules = [
  "Modules",
  "NgModule",
  "imports",
  "declarations",
  "providers",
  "exports",
  "bootstrap",
  "BrowserModule",
  "CommonModule",
  "FormsModule",
  "ReactiveFormsModule",
  "HttpClientModule",
];

const angularDirectives = [
  "*ngIf",
  "*ngFor",
  "*ngSwitch",
  "*ngSwitchCase",
  "*ngSwitchDefault",
  "ngClass",
  "ngStyle",
  "ngModel",
  "ngModelChange",
  "ngTemplate",
  "ngContainer",
  "ngTemplateOutlet",
  "Custom Directives",
  "HostListener",
  "HostBinding",
  "Input",
  "Output",
];

const angularPipes = [
  "| date",
  "| uppercase",
  "| lowercase",
  "| currency",
  "| percent",
  "| json",
  "| async",
  "| slice",
  "| keyvalue",
  "Custom Pipes",
  "pure pipe",
  "impure pipe",
];

const angularServices = ["Services", "@Injectable", "Singleton service", "providedIn", "Dependency Injection", "InjectionToken", "multi providers"];

const angularRouting = [
  "RouterModule",
  "Routes",
  "Router",
  "ActivatedRoute",
  "routerLink",
  "routerLinkActive",
  "router-outlet",
  "Child routes",
  "Lazy loading",
  "Preloading",
  "Guards",
  "CanActivate",
  "CanDeactivate",
  "CanActivateChild",
  "CanLoad",
  "Resolve",
  "Router events",
];

const angularForms = [
  "FormsModule",
  "ReactiveFormsModule",
  "FormControl",
  "FormGroup",
  "FormArray",
  "Validators",
  "AbstractControl",
  "valueChanges",
  "statusChanges",
  "template-driven forms",
  "reactive forms",
];

const angularHttp = [
  "HttpClient",
  "HttpHeaders",
  "HttpParams",
  "HttpErrorResponse",
  "interceptors",
  "HttpInterceptor",
  "HttpHandler",
  "HttpRequest",
  "HttpResponse",
  "tap",
  "catchError",
  "retry",
];

const angularRxjs = [
  "Observable",
  "Subject",
  "BehaviorSubject",
  "ReplaySubject",
  "AsyncSubject",
  "Subscription",
  "unsubscribe",
  "of",
  "from",
  "interval",
  "timer",
  "map",
  "tap",
  "filter",
  "switchMap",
  "mergeMap",
  "concatMap",
  "exhaustMap",
  "take",
  "takeUntil",
  "forkJoin",
  "combineLatest",
  "withLatestFrom",
  "debounceTime",
  "throttleTime",
  "distinctUntilChanged",
  "shareReplay",
];

const angularCdk = ["Overlay", "Portal", "DragDrop", "Scrolling", "Accessibility", "Clipboard"];

const angularMaterial = [
  "MatButton",
  "MatCard",
  "MatInput",
  "MatFormField",
  "MatToolbar",
  "MatIcon",
  "MatTable",
  "MatDialog",
  "MatSnackBar",
  "MatSidenav",
  "MatMenu",
  "MatList",
  "MatTabs",
  "MatGridList",
  "MatExpansionPanel",
  "MatProgressSpinner",
  "MatProgressBar",
  "MatTooltip",
  "MatSelect",
  "MatCheckbox",
  "MatRadio",
  "MatDatepicker",
];

const angularStandalone = [
  "standalone: true",
  "importProvidersFrom",
  "provideRouter",
  "provideHttpClient",
  "bootstrapApplication",
];

const angularSignals = [
  "signal",
  "computed",
  "effect",
  "model()",
  "input()",
  "output()",
  "outputFromObservable",
  "inputSignal",
  "set",
  "update",
  "mutate",
  "resource",
  "toSignal",
];

const angularChangeDetection = ["Zones", "NgZone", "runOutsideAngular", "markForCheck", "detectChanges"];

const angularState = [
  "NgRx Store",
  "Actions",
  "Reducers",
  "Effects",
  "Selectors",
  "StoreModule",
  "EffectsModule",
  "EntityAdapter",
  "SignalStore (Angular 17)",
  "Akita",
  "NGXS",
];

const angularTemplate = [
  "Interpolation",
  "Property binding",
  "Event binding",
  "Two-way binding",
  "Attribute binding",
  "Class binding",
  "Style binding",
  "Template reference variables (#var)",
  "Safe navigation operator (?.)",
  "Async pipe",
];

const angularPerformance = [
  "Defer loading",
  "route preloading",
  "code splitting",
  "tree-shaking",
  "AOT compilation",
  "Ivy compiler",
  "hydration (Angular 17)",
  "SSR optimization",
];

const angularSsr = ["Angular Universal", "Server Rendering", "prerender", "App Shell", "hydrateRoot"];

const angularTesting = [
  "Jasmine",
  "Karma",
  "TestBed",
  "ComponentFixture",
  "fakeAsync",
  "tick",
  "flush",
  "HttpTestingController",
  "unit tests",
  "integration tests",
];

const angularAnimations = [
  "BrowserAnimationsModule",
  "trigger",
  "state",
  "transition",
  "animate",
  "style",
  "keyframes",
  "query",
  "stagger",
  "group",
];

pushAngularTerms(angularBase, "cli");
pushAngularTerms(angularWorkspace, "workspace");
pushAngularTerms(angularComponents, "component");
pushAngularTerms(angularLifecycle, "lifecycle");
pushAngularTerms(angularModules, "module");
pushAngularTerms(angularDirectives, "directive");
pushAngularTerms(angularPipes, "pipe");
pushAngularTerms(angularServices, "service");
pushAngularTerms(angularRouting, "routing");
pushAngularTerms(angularForms, "forms");
pushAngularTerms(angularHttp, "http");
pushAngularTerms(angularRxjs, "rxjs");
pushAngularTerms(angularCdk, "cdk");
pushAngularTerms(angularMaterial, "material");
pushAngularTerms(angularStandalone, "standalone");
pushAngularTerms(angularSignals, "signals");
pushAngularTerms(angularChangeDetection, "change-detection");
pushAngularTerms(angularState, "state");
pushAngularTerms(angularTemplate, "template");
pushAngularTerms(angularPerformance, "performance");
pushAngularTerms(angularSsr, "ssr");
pushAngularTerms(angularTesting, "testing");
pushAngularTerms(angularAnimations, "animation");

const dedupedAngularTerms = angularSeedTerms.filter((term) => !vueTermSet.has(term.term.toLowerCase()));
const angularTermSet = new Set([...vueTermSet, ...dedupedAngularTerms.map((item) => item.term.toLowerCase())]);

type InfraKind =
  | "docker"
  | "kubernetes"
  | "api"
  | "testing"
  | "security"
  | "performance"
  | "cloud"
  | "search"
  | "auth"
  | "patterns"
  | "build"
  | "state"
  | "graphql"
  | "scraping"
  | "fullstack-tools";

const infraCategory: Record<InfraKind, Category> = {
  docker: Category.devops,
  kubernetes: Category.devops,
  api: Category.backend,
  testing: Category.general,
  security: Category.devops,
  performance: Category.frontend,
  cloud: Category.devops,
  search: Category.backend,
  auth: Category.backend,
  patterns: Category.general,
  build: Category.devops,
  state: Category.frontend,
  graphql: Category.backend,
  scraping: Category.backend,
  "fullstack-tools": Category.general,
};

const infraKindMeta: Record<
  InfraKind,
  {
    translation: (term: string) => string;
    descriptionEs: (term: string) => string;
    descriptionEn: (term: string) => string;
    whatEs: (term: string) => string;
    whatEn: (term: string) => string;
    howEs: (term: string) => string;
    howEn: (term: string) => string;
    tags: string[];
  }
> = {
  docker: {
    translation: (term) => `Docker ${term}`,
    descriptionEs: (term) => `Concepto/CLI de Docker: "${term}".`,
    descriptionEn: (term) => `Docker concept/CLI: "${term}".`,
    whatEs: () => "Empaqueta y ejecuta contenedores reproducibles.",
    whatEn: () => "Package and run reproducible containers.",
    howEs: () => "Escribe Dockerfile, construye con docker build y orquesta con compose.",
    howEn: () => "Write Dockerfile, build with docker build, orchestrate with compose.",
    tags: ["docker", "containers", "devops"],
  },
  kubernetes: {
    translation: (term) => `Kubernetes ${term}`,
    descriptionEs: (term) => `Concepto básico de Kubernetes: "${term}".`,
    descriptionEn: (term) => `Kubernetes basic concept: "${term}".`,
    whatEs: () => "Orquesta despliegues en clusters con pods, services e ingress.",
    whatEn: () => "Orchestrate deployments in clusters with pods, services, ingress.",
    howEs: () => "Define manifests y aplica con kubectl; usa namespaces/configmap/secret.",
    howEn: () => "Define manifests and apply with kubectl; use namespaces/configmap/secret.",
    tags: ["kubernetes", "devops"],
  },
  api: {
    translation: (term) => `API ${term}`,
    descriptionEs: (term) => `Concepto/protocolo de API: "${term}".`,
    descriptionEn: (term) => `API concept/protocol: "${term}".`,
    whatEs: () => "Diseña y protege APIs REST/HTTP con autenticación y rate limiting.",
    whatEn: () => "Design and secure REST/HTTP APIs with auth and rate limiting.",
    howEs: () => "Define contratos, status codes y headers; documenta y versiona.",
    howEn: () => "Define contracts, status codes, headers; document and version.",
    tags: ["api", "protocols", "backend"],
  },
  testing: {
    translation: (term) => `Testing ${term}`,
    descriptionEs: (term) => `Herramienta o tipo de prueba: "${term}".`,
    descriptionEn: (term) => `Testing tool or type: "${term}".`,
    whatEs: () => "Automatiza validaciones de frontend/backend.",
    whatEn: () => "Automate validations for frontend/backend.",
    howEs: () => "Usa librerías adecuadas para unit/integration/E2E y CI.",
    howEn: () => "Use proper libs for unit/integration/E2E and CI.",
    tags: ["testing", "quality"],
  },
  security: {
    translation: (term) => `Seguridad ${term}`,
    descriptionEs: (term) => `Concepto OWASP/seguridad: "${term}".`,
    descriptionEn: (term) => `OWASP/security concept: "${term}".`,
    whatEs: () => "Mitiga vulnerabilidades comunes con controles adecuados.",
    whatEn: () => "Mitigate common vulns with proper controls.",
    howEs: () => "Valida inputs, protege sesiones/tokens y configura headers/CORS.",
    howEn: () => "Validate inputs, protect sessions/tokens, set headers/CORS.",
    tags: ["security", "owasp"],
  },
  performance: {
    translation: (term) => `Performance ${term}`,
    descriptionEs: (term) => `Optimización web: "${term}".`,
    descriptionEn: (term) => `Web performance: "${term}".`,
    whatEs: () => "Mide y mejora tiempos de carga y UX.",
    whatEn: () => "Measure and improve load times and UX.",
    howEs: () => "Usa Lighthouse/CWV, caching, preload/prefetch e imágenes optimizadas.",
    howEn: () => "Use Lighthouse/CWV, caching, preload/prefetch, optimized images.",
    tags: ["performance", "web"],
  },
  cloud: {
    translation: (term) => `Cloud ${term}`,
    descriptionEs: (term) => `Concepto cloud/serverless: "${term}".`,
    descriptionEn: (term) => `Cloud/serverless concept: "${term}".`,
    whatEs: () => "Arquitecta almacenamiento, funciones y jobs en la nube.",
    whatEn: () => "Architect storage, functions, and jobs in the cloud.",
    howEs: () => "Usa S3/CDN/queues y jobs programados; separa edge/serverless/background.",
    howEn: () => "Use S3/CDN/queues and scheduled jobs; split edge/serverless/background.",
    tags: ["cloud", "devops"],
  },
  search: {
    translation: (term) => `Búsqueda ${term}`,
    descriptionEs: (term) => `Motor/servicio de búsqueda: "${term}".`,
    descriptionEn: (term) => `Search engine/service: "${term}".`,
    whatEs: () => "Indexa y consulta texto con relevancia y filtros.",
    whatEn: () => "Index and query text with relevance and filters.",
    howEs: () => "Configura índices, relevancia y sinónimos según el motor.",
    howEn: () => "Configure indexes, relevance, and synonyms per engine.",
    tags: ["search", "backend"],
  },
  auth: {
    translation: (term) => `Auth ${term}`,
    descriptionEs: (term) => `Autenticación/autorización: "${term}".`,
    descriptionEn: (term) => `Auth/authz concept: "${term}".`,
    whatEs: () => "Protege APIs y sesiones con JWT/OAuth/RBAC.",
    whatEn: () => "Protect APIs and sessions with JWT/OAuth/RBAC.",
    howEs: () => "Gestiona tokens, refresh y cookies httpOnly; aplica roles/permisos.",
    howEn: () => "Manage tokens, refresh, httpOnly cookies; apply roles/permissions.",
    tags: ["auth", "security"],
  },
  patterns: {
    translation: (term) => `Patrón ${term}`,
    descriptionEs: (term) => `Patrón de arquitectura: "${term}".`,
    descriptionEn: (term) => `Architecture pattern: "${term}".`,
    whatEs: () => "Estructura capas y dependencias con el patrón indicado.",
    whatEn: () => "Structure layers and dependencies via the pattern.",
    howEs: () => "Define límites, DTOs y adaptadores para aislar dominios.",
    howEn: () => "Define boundaries, DTOs, adapters to isolate domains.",
    tags: ["architecture", "patterns"],
  },
  build: {
    translation: (term) => `Herramienta build ${term}`,
    descriptionEs: (term) => `Herramienta de build/lint/pre-commit: "${term}".`,
    descriptionEn: (term) => `Build/lint/pre-commit tool: "${term}".`,
    whatEs: () => "Compila/transpila y valida código con la herramienta.",
    whatEn: () => "Compile/transpile and lint code with the tool.",
    howEs: () => "Configura scripts y cache; integra en CI.",
    howEn: () => "Configure scripts and cache; integrate into CI.",
    tags: ["build", "tooling"],
  },
  state: {
    translation: (term) => `Estado ${term}`,
    descriptionEs: (term) => `State management avanzado: "${term}".`,
    descriptionEn: (term) => `Advanced state management: "${term}".`,
    whatEs: () => "Gestiona estado global/caché en frontend.",
    whatEn: () => "Manage global/cache state on the frontend.",
    howEs: () => "Usa librerías según framework (Redux, Pinia, NgRx, etc.).",
    howEn: () => "Use libs per framework (Redux, Pinia, NgRx, etc.).",
    tags: ["state", "frontend"],
  },
  graphql: {
    translation: (term) => `GraphQL ${term}`,
    descriptionEs: (term) => `Concepto/API de GraphQL: "${term}".`,
    descriptionEn: (term) => `GraphQL concept/API: "${term}".`,
    whatEs: () => "Modela schemas y resolvers para queries/mutations/subs.",
    whatEn: () => "Model schemas/resolvers for queries/mutations/subs.",
    howEs: () => "Define SDL o code-first y usa Apollo u otra lib.",
    howEn: () => "Define SDL or code-first and use Apollo or similar.",
    tags: ["graphql", "api"],
  },
  scraping: {
    translation: (term) => `Scraping ${term}`,
    descriptionEs: (term) => `Herramienta/patrón de scraping: "${term}".`,
    descriptionEn: (term) => `Scraping tool/pattern: "${term}".`,
    whatEs: () => "Automatiza extracción de datos web.",
    whatEn: () => "Automate web data extraction.",
    howEs: () => "Combina HTTP clients, headless browsers y parsers (HTML/DOM).",
    howEn: () => "Combine HTTP clients, headless browsers, and parsers (HTML/DOM).",
    tags: ["scraping", "automation"],
  },
  "fullstack-tools": {
    translation: (term) => `Herramienta full-stack ${term}`,
    descriptionEs: (term) => `API/feature del stack web: "${term}".`,
    descriptionEn: (term) => `Web stack API/feature: "${term}".`,
    whatEs: () => "Habilita capacidades modernas del navegador y apps web.",
    whatEn: () => "Enables modern browser capabilities and web apps.",
    howEs: () => "Implementa según soporte (Service Workers/WebRTC/PWA/Storage).",
    howEn: () => "Implement per support (Service Workers/WebRTC/PWA/Storage).",
    tags: ["web", "fullstack"],
  },
};

function buildInfraSnippets(term: string, kind: InfraKind) {
  const meta = infraKindMeta[kind];
  return {
    example: {
      titleEs: `Ejemplo ${term}`,
      titleEn: `${term} example`,
      code: `// ${term}\n// Describe o ejecuta ${term} en tu proyecto`,
      noteEs: meta.whatEs(term),
      noteEn: meta.whatEn(term),
    },
    secondExample: {
      titleEs: `Variación ${term}`,
      titleEn: `${term} variation`,
      code: `// Uso alternativo de ${term}`,
      noteEs: meta.howEs(term),
      noteEn: meta.howEn(term),
    },
    exerciseExample: {
      titleEs: `Práctica ${term}`,
      titleEn: `${term} practice`,
      code: `// Implementa ${term} en un entorno real y valida resultados`,
      noteEs: "Aplica el concepto en tu stack y documenta comandos/config.",
      noteEn: "Apply the concept in your stack and document commands/config.",
    },
  };
}

function buildInfraSeed(term: string, kind: InfraKind): SeedTermInput {
  const cleanTerm = term.trim();
  const meta = infraKindMeta[kind];
  const snippets = buildInfraSnippets(cleanTerm, kind);
  const translation = meta.translation(cleanTerm);
  const descriptionEs = meta.descriptionEs(cleanTerm);
  const descriptionEn = meta.descriptionEn(cleanTerm);
  const whatEs = meta.whatEs(cleanTerm);
  const whatEn = meta.whatEn(cleanTerm);
  const howEs = meta.howEs(cleanTerm);
  const howEn = meta.howEn(cleanTerm);
  const tags = meta.tags.concat(["infra", kind, cleanTerm.toLowerCase()]);

  return {
    term: cleanTerm,
    slug: slugify(`infra-${cleanTerm.replace(/[^a-z0-9]+/gi, "-")}`),
    translation,
    category: infraCategory[kind],
    descriptionEs,
    descriptionEn,
    aliases: [cleanTerm],
    tags,
    example: snippets.example,
    secondExample: snippets.secondExample,
    exerciseExample: snippets.exerciseExample,
    whatEs,
    whatEn,
    howEs,
    howEn,
  };
}

const infraSeedTerms: SeedTermInput[] = [];
const infraSeen = new Set<string>();

function pushInfraTerms(list: string[], kind: InfraKind) {
  for (const raw of list) {
    const term = raw.trim();
    if (!term) continue;
    const key = term.toLowerCase();
    if (infraSeen.has(key) || angularTermSet.has(key)) continue;
    infraSeen.add(key);
    infraSeedTerms.push(buildInfraSeed(term, kind));
  }
}

const infraDocker = [
  "Docker",
  "Dockerfile",
  "docker build",
  "docker run",
  "docker stop",
  "docker ps",
  "docker-compose",
  "docker volume",
  "docker network",
  "ENTRYPOINT",
  "CMD",
  "COPY",
  "EXPOSE",
  "WORKDIR",
  "ENV",
  "bind mounts",
  "container logs",
  "restart policies",
  "healthcheck",
];

const infraKubernetes = [
  "Kubernetes",
  "pods",
  "deployments",
  "services",
  "ingress",
  "configmap",
  "secret",
  "namespace",
  "cluster",
  "node",
  "kubectl",
  "scaling",
  "rolling update",
];

const infraApi = [
  "REST",
  "CRUD",
  "HTTP",
  "HTTPS",
  "CORS",
  "JSON",
  "status codes",
  "Webhooks",
  "Rate limiting",
  "Pagination",
  "Etag",
  "OAuth2",
  "JWT",
  "Refresh Token",
  "API Keys",
  "Basic Auth",
  "Bearer token",
  "HMAC",
];

const infraTesting = [
  "Jest",
  "Vitest",
  "React Testing Library",
  "Cypress",
  "Playwright",
  "Supertest",
  "Postman",
  "Thunder Client",
  "API Testing",
  "Unit tests",
  "Integration tests",
  "E2E tests",
];

const infraSecurity = [
  "XSS",
  "CSRF",
  "SQL Injection",
  "Command Injection",
  "Directory Traversal",
  "CORS misconfig",
  "Session fixation",
  "Password hashing",
  "bcrypt",
  "argon2",
  "helmet",
  "rate limiting",
];

const infraPerformance = [
  "Lighthouse",
  "Core Web Vitals",
  "Preload",
  "Prefetch",
  "Cache-Control",
  "CDN",
  "Optimización de imágenes",
  "Lazy loading",
  "Streaming",
  "Partial hydration",
];

const infraCloud = [
  "S3 storage",
  "CDN",
  "Object Storage",
  "Serverless Functions",
  "Edge Functions",
  "Background jobs",
  "Cron jobs",
  "Redis",
  "Queues",
  "Message brokers",
  "RabbitMQ",
  "Kafka",
  "Webhooks",
];

const infraSearch = ["ElasticSearch", "Meilisearch", "Algolia", "OpenSearch"];

const infraAuth = [
  "JWT",
  "OAuth",
  "OAuth2 PKCE",
  "NextAuth",
  "Auth.js",
  "RBAC (roles)",
  "Permissions",
  "Sessions",
  "Cookies httpOnly",
  "Refresh tokens",
];

const infraPatterns = [
  "MVC",
  "Clean Architecture",
  "Hexagonal Architecture",
  "Repository pattern",
  "Service layer",
  "DTO",
  "Adapter pattern",
  "Factory pattern",
  "Singleton",
  "Observer pattern",
];

const infraBuild = [
  "Vite",
  "Webpack",
  "Rollup",
  "SWC",
  "Turbopack",
  "Babel",
  "ESLint",
  "Prettier",
  "Husky",
  "Lint-staged",
];

const infraState = [
  "Redux",
  "Redux Toolkit",
  "Zustand",
  "Jotai",
  "Recoil",
  "TanStack Query (React Query)",
  "SWR",
  "Vuex (Vue 2)",
  "Pinia (Vue 3)",
  "NgRx (Angular)",
];

const infraGraphql = [
  "GraphQL",
  "Resolvers",
  "Queries",
  "Mutations",
  "Subscriptions",
  "Apollo Client",
  "Apollo Server",
  "Code-first schema",
  "SDL",
];

const infraScraping = ["Puppeteer", "Playwright scraping", "Cheerio", "HTTP clients", "Axios", "Fetch"];

const infraFullstackTools = ["WebRTC", "Service Workers", "PWA", "IndexedDB", "LocalStorage", "SessionStorage", "Cookies"];

pushInfraTerms(infraDocker, "docker");
pushInfraTerms(infraKubernetes, "kubernetes");
pushInfraTerms(infraApi, "api");
pushInfraTerms(infraTesting, "testing");
pushInfraTerms(infraSecurity, "security");
pushInfraTerms(infraPerformance, "performance");
pushInfraTerms(infraCloud, "cloud");
pushInfraTerms(infraSearch, "search");
pushInfraTerms(infraAuth, "auth");
pushInfraTerms(infraPatterns, "patterns");
pushInfraTerms(infraBuild, "build");
pushInfraTerms(infraState, "state");
pushInfraTerms(infraGraphql, "graphql");
pushInfraTerms(infraScraping, "scraping");
pushInfraTerms(infraFullstackTools, "fullstack-tools");

const dedupedInfraTerms = infraSeedTerms.filter((term) => !angularTermSet.has(term.term.toLowerCase()));
const infraTermSet = new Set([...angularTermSet, ...dedupedInfraTerms.map((item) => item.term.toLowerCase())]);

type TailwindKind = "directive" | "config" | "variant" | "utility" | "plugin";
type TailwindDocOverride = {
  translation?: string;
  descriptionEs?: string;
  descriptionEn?: string;
  sample?: string;
  whatEs?: string;
  whatEn?: string;
  howEs?: string;
  howEn?: string;
};

const tailwindUtilitySamples: Record<string, string> = {
  "text-{color}": "text-emerald-600",
  "bg-{color}": "bg-slate-900",
  "border-{color}": "border-amber-500",
  "divide-{color}": "divide-emerald-400",
  "placeholder-{color}": "placeholder-slate-400",
  "from-{color}": "from-indigo-500",
  "via-{color}": "via-purple-500",
  "to-{color}": "to-sky-500",
  "ring-{color}": "ring-orange-400",
  "ring-offset-{color}": "ring-offset-slate-900",
  "shadow-{color}": "shadow-emerald-500/30",
  "outline-{color}": "outline-blue-500",
  "accent-{color}": "accent-emerald-600",
  "mt-*": "mt-6",
  "mb-*": "mb-4",
  "ml-*": "ml-3",
  "mr-*": "mr-3",
  "mx-*": "mx-5",
  "my-*": "my-6",
  "px-*": "px-4",
  "py-*": "py-3",
};

const tailwindOverrides: Record<string, TailwindDocOverride> = {
  "text-{color}": {
    translation: "color de texto (paleta)",
    descriptionEs: "Plantilla text-{color} para aplicar cualquier color definido en el tema al texto.",
    descriptionEn: "text-{color} template to apply any theme color to text.",
  },
  "bg-{color}": {
    translation: "color de fondo (paleta)",
    descriptionEs: "Plantilla bg-{color} para pintar fondos con los colores del tema.",
    descriptionEn: "bg-{color} template to paint backgrounds with the theme palette.",
  },
  "border-{color}": {
    translation: "color de borde (paleta)",
    descriptionEs: "border-{color} aplica la paleta al trazo del borde.",
    descriptionEn: "border-{color} applies theme colors to borders.",
  },
  "divide-{color}": {
    translation: "color del separador",
    descriptionEs: "divide-{color} colorea las líneas divisorias generadas por divide-x o divide-y.",
    descriptionEn: "divide-{color} tints the separators created with divide-x or divide-y.",
  },
  "placeholder-{color}": {
    translation: "color del placeholder",
    descriptionEs: "placeholder-{color} controla el color del texto de placeholder en inputs y textareas.",
    descriptionEn: "placeholder-{color} sets placeholder text color in form fields.",
  },
  "from-{color}": {
    translation: "color inicial del degradado",
    descriptionEs: "from-{color} define el primer color en degradados generados con bg-gradient-to-*.",
    descriptionEn: "from-{color} sets the starting color for bg-gradient-to-* gradients.",
  },
  "via-{color}": {
    translation: "color intermedio del degradado",
    descriptionEs: "via-{color} agrega un stop intermedio dentro del degradado.",
    descriptionEn: "via-{color} adds an intermediate color stop in gradients.",
  },
  "to-{color}": {
    translation: "color final del degradado",
    descriptionEs: "to-{color} cierra el degradado con el color final.",
    descriptionEn: "to-{color} closes the gradient with the ending color.",
  },
  "ring-{color}": {
    translation: "color del focus ring",
    descriptionEs: "ring-{color} cambia el color del anillo de enfoque generado por Tailwind.",
    descriptionEn: "ring-{color} customizes the focus ring color from Tailwind.",
  },
  "ring-offset-{color}": {
    translation: "color de ring-offset",
    descriptionEs: "ring-offset-{color} controla el color del espacio entre el ring y el elemento.",
    descriptionEn: "ring-offset-{color} sets the color between the focus ring and the element.",
  },
  "shadow-{color}": {
    translation: "color de sombra",
    descriptionEs: "shadow-{color} añade color al shadow cuando la configuración lo permite.",
    descriptionEn: "shadow-{color} tints the drop shadow when enabled in the config.",
  },
  "outline-{color}": {
    translation: "color de outline",
    descriptionEs: "outline-{color} aplica color al contorno accesible de un elemento.",
    descriptionEn: "outline-{color} tints the accessible outline around an element.",
  },
  "accent-{color}": {
    translation: "color de controles nativos",
    descriptionEs: "accent-{color} define el color de radios y checkboxes soportados por navegadores modernos.",
    descriptionEn: "accent-{color} sets the color for native radios and checkboxes in modern browsers.",
  },
  "mt-*": {
    translation: "margen superior escalable",
    descriptionEs: "Prefijo mt-* para sumar margen superior usando la escala de spacing de Tailwind.",
    descriptionEn: "mt-* prefix to add top margin using Tailwind's spacing scale.",
  },
  "mb-*": {
    translation: "margen inferior escalable",
    descriptionEs: "Prefijo mb-* que aplica margen inferior con la escala de spacing.",
    descriptionEn: "mb-* prefix that applies bottom margin from the spacing scale.",
  },
  "ml-*": {
    translation: "margen izquierdo escalable",
    descriptionEs: "Prefijo ml-* para ajustar margen a la izquierda en la escala estándar.",
    descriptionEn: "ml-* prefix to set left margin using the spacing scale.",
  },
  "mr-*": {
    translation: "margen derecho escalable",
    descriptionEs: "Prefijo mr-* para margen derecho con la escala de Tailwind.",
    descriptionEn: "mr-* prefix to add right margin using the Tailwind spacing scale.",
  },
  "mx-*": {
    translation: "margen horizontal escalable",
    descriptionEs: "mx-* aplica el mismo margen a izquierda y derecha con la escala de spacing.",
    descriptionEn: "mx-* applies equal left/right margin from the spacing scale.",
  },
  "my-*": {
    translation: "margen vertical escalable",
    descriptionEs: "my-* aplica margen arriba y abajo con la escala de spacing.",
    descriptionEn: "my-* applies top/bottom margin using the spacing scale.",
  },
  "px-*": {
    translation: "padding horizontal escalable",
    descriptionEs: "px-* suma padding en eje X usando la escala de spacing.",
    descriptionEn: "px-* adds horizontal padding using the spacing scale.",
  },
  "py-*": {
    translation: "padding vertical escalable",
    descriptionEs: "py-* suma padding en eje Y con la escala de spacing.",
    descriptionEn: "py-* adds vertical padding from the spacing scale.",
  },
};

const tailwindExampleNotes: Record<TailwindKind, { es: string; en: string }> = {
  directive: {
    es: "Coloca las directivas al inicio de tu CSS de entrada para que Tailwind genere las capas.",
    en: "Place directives at the top of your input CSS so Tailwind can expand the layers.",
  },
  config: {
    es: "Tailwind lee tailwind.config.js en cada build; reinicia el watcher si cambias content.",
    en: "Tailwind reads tailwind.config.js on every build; restart the watcher if you change content paths.",
  },
  variant: {
    es: "El prefijo se pega sin espacio a la utilidad y depende del estado o breakpoint.",
    en: "Prefix sticks to the utility with no space and depends on state or breakpoint.",
  },
  utility: {
    es: "Clase atómica que puedes encadenar con hover:, focus:, sm:, md: y dark:.",
    en: "Atomic class you can chain with hover:, focus:, sm:, md:, and dark:.",
  },
  plugin: {
    es: "Instala el paquete e inclúyelo en plugins para que Tailwind exponga sus utilidades.",
    en: "Install the package and include it in plugins so Tailwind exposes its utilities.",
  },
};

const tailwindVariationNotes: Record<TailwindKind, { es: string; en: string }> = {
  directive: {
    es: "Usa @layer para documentar componentes y utilidades personalizadas.",
    en: "Use @layer to document custom components and utilities.",
  },
  config: {
    es: "Extiende el tema para no perder los valores por defecto.",
    en: "Extend the theme to keep Tailwind defaults intact.",
  },
  variant: {
    es: "Combina group, peer o breakpoints para condicionar estilos con un solo prefijo.",
    en: "Combine group, peer or breakpoints to scope styles with a single prefix.",
  },
  utility: {
    es: "Ejemplifica la utilidad junto a transición u otras clases reusables.",
    en: "Pair the utility with transitions or other reusable classes.",
  },
  plugin: {
    es: "Visualiza la salida del plugin (prose, formularios, aspect-ratio, etc.).",
    en: "Preview the plugin output (prose, forms, aspect-ratio, etc.).",
  },
};

const tailwindPracticeNotes: Record<TailwindKind, { es: string; en: string }> = {
  directive: {
    es: "Añade tus propias utilidades en @layer utilities y prueba variantes.",
    en: "Add your own utilities inside @layer utilities and test variants.",
  },
  config: {
    es: "Modifica los valores y corre el build para ver el efecto en el diseño.",
    en: "Tweak the values and run the build to see the design impact.",
  },
  variant: {
    es: "Practica agregando variantes de estado y breakpoints al mismo componente.",
    en: "Practice adding state and breakpoint variants to the same component.",
  },
  utility: {
    es: "Cambia la utilidad por otro valor de la escala y observa el layout.",
    en: "Swap the utility for another scale value and observe the layout.",
  },
  plugin: {
    es: "Revisa la documentación del plugin y agrega opciones personalizadas.",
    en: "Check the plugin docs and add custom options.",
  },
};

function resolveTailwindDocs({
  term,
  kind,
  translation,
  descriptionEs,
  descriptionEn,
  sample,
}: {
  term: string;
  kind: TailwindKind;
  translation?: string;
  descriptionEs?: string;
  descriptionEn?: string;
  sample?: string;
}) {
  const override = tailwindOverrides[term] ?? {};
  const fallbackSample =
    kind === "variant" ? "bg-emerald-600" : kind === "config" ? "{ /* config */ }" : term;
  const sampleClass = override.sample ?? sample ?? tailwindUtilitySamples[term] ?? fallbackSample;
  const resolvedTranslation =
    translation ??
    override.translation ??
    (kind === "directive"
      ? `directiva ${term}`
      : kind === "config"
        ? `clave ${term} en tailwind.config`
        : kind === "variant"
          ? `variante ${term}`
          : kind === "plugin"
            ? `plugin ${term}`
            : `utility ${term}`);

  const descEs =
    descriptionEs ??
    override.descriptionEs ??
    (kind === "directive"
      ? `Directiva ${term} para inyectar o componer las capas generadas por Tailwind CSS.`
      : kind === "config"
        ? `Clave ${term} de tailwind.config.js para adaptar rutas de contenido, tema o extensiones.`
        : kind === "variant"
          ? `Prefijo ${term} que aplica utilidades cuando se cumple un estado, breakpoint o contexto.`
          : kind === "plugin"
            ? `Plugin ${term} que extiende Tailwind con utilidades, componentes o variantes adicionales.`
            : `Clase utilitaria de Tailwind (${term}) para componer estilos directamente en el marcado.`);

  const descEn =
    descriptionEn ??
    override.descriptionEn ??
    (kind === "directive"
      ? `${term} directive to inject or compose Tailwind-generated layers.`
      : kind === "config"
        ? `${term} key in tailwind.config.js to tune content paths, theme, or extensions.`
        : kind === "variant"
          ? `Variant prefix (${term}) that applies utilities when a state, breakpoint, or context matches.`
          : kind === "plugin"
            ? `Plugin ${term} extending Tailwind with additional utilities, components, or variants.`
            : `Tailwind utility class (${term}) to compose styles directly in markup.`);

  const whatEs =
    override.whatEs ??
    (kind === "directive"
      ? `Activa ${term} en tu hoja global para que Tailwind genere la capa base, de componentes o utilidades.`
      : kind === "config"
        ? `Define ${term} en tailwind.config.js para ajustar tema, rutas escaneadas o extensiones sin escribir CSS extra.`
        : kind === "variant"
          ? `Permite condicionar utilidades a estados, breakpoints o contexto (por ejemplo ${term}${sampleClass}).`
          : kind === "plugin"
            ? `Añade ${term} para sumar nuevas clases o variantes sin declararlas a mano.`
            : `Se usa como clase atómica (${sampleClass}) para aplicar estilos rápidos manteniendo JSX/HTML limpio.`);

  const whatEn =
    override.whatEn ??
    (kind === "directive"
      ? `Enable ${term} in your global CSS so Tailwind generates the base, components, or utilities layers.`
      : kind === "config"
        ? `Set ${term} inside tailwind.config.js to adjust the theme, scanned paths, or extensions without custom CSS.`
        : kind === "variant"
          ? `Lets you scope utilities to states, breakpoints, or context (e.g. ${term}${sampleClass}).`
          : kind === "plugin"
            ? `Add ${term} to bring extra classes or variants without hand-writing CSS.`
            : `Use it as an atomic class (${sampleClass}) to style quickly while keeping markup tidy.`);

  const howEs =
    override.howEs ??
    (kind === "directive"
      ? `Coloca ${term} en tu CSS de entrada (globals.css) y combina con @layer/@apply para componentes reutilizables.`
      : kind === "config"
        ? `Exporta la clave ${term} en tailwind.config.js; reinicia el watcher si cambias content y usa theme.extend para sumar tokens.`
        : kind === "variant"
          ? `Antepon ${term} sin espacio a la utilidad (\"${term}${sampleClass}\") y mezcla variantes responsive (sm:, md:) si aplica.`
          : kind === "plugin"
            ? `Instala el paquete y añádelo en plugins de tailwind.config.js; sigue la guía del plugin para sus nuevas clases.`
            : `Agrega "${sampleClass}" en className y combínalo con estados (hover:, focus:) o breakpoints (sm:, lg:) según necesites.`);

  const howEn =
    override.howEn ??
    (kind === "directive"
      ? `Place ${term} in your entry CSS (globals.css) and combine it with @layer/@apply for reusable components.`
      : kind === "config"
        ? `Expose the ${term} key in tailwind.config.js; restart the watcher if you change content and prefer theme.extend to add tokens.`
        : kind === "variant"
          ? `Prefix the utility with ${term} (\"${term}${sampleClass}\") and mix responsive variants (sm:, md:) when relevant.`
          : kind === "plugin"
            ? `Install the package and register it under plugins in tailwind.config.js; follow the plugin docs for its classes.`
            : `Drop "${sampleClass}" in className and chain state (hover:, focus:) or breakpoint variants (sm:, lg:) as needed.`);

  return {
    translation: resolvedTranslation,
    descriptionEs: descEs,
    descriptionEn: descEn,
    whatEs,
    whatEn,
    howEs,
    howEn,
    sampleClass,
  };
}

function buildTailwindSeed({
  term,
  kind,
  translation,
  descriptionEs,
  descriptionEn,
  sample,
  tags = [],
}: {
  term: string;
  kind: TailwindKind;
  translation?: string;
  descriptionEs?: string;
  descriptionEn?: string;
  sample?: string;
  tags?: string[];
}): SeedTermInput {
  const baseTags = ["tailwind", kind, term].concat(tags).map((t) => t.toLowerCase());
  const docs = resolveTailwindDocs({ term, kind, translation, descriptionEs, descriptionEn, sample });
  const configValue = sample ?? (term === "content" ? "['./src/**/*.{ts,tsx,html}']" : "{ /* config */ }");
  const configExtendValue = sample ?? "{ custom: 'value' }";
  const configExerciseValue = sample ?? (term === "content" ? "['./src/**/*.{ts,tsx}']" : "{ /* config */ }");

  const exampleCode =
    kind === "directive"
      ? `/* globals.css */\n@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n@layer components {\n  .btn-primary { @apply px-4 py-2 rounded bg-indigo-600 text-white; }\n}`
      : kind === "config"
        ? `// tailwind.config.js\nmodule.exports = {\n  ${term}: ${configValue},\n};`
        : kind === "variant"
          ? `<button class="${term}${docs.sampleClass} bg-emerald-500 text-white px-4 py-2 rounded transition">Acción</button>`
          : kind === "plugin"
            ? `// tailwind.config.js\nmodule.exports = {\n  plugins: [require('${term}')],\n};`
            : `<div class="${docs.sampleClass} bg-slate-900 text-white p-4 rounded">Bloque usando ${term}</div>`;

  const secondExample =
    kind === "config"
      ? term === "content"
        ? `// tailwind.config.js\nmodule.exports = {\n  content: ${configValue},\n  theme: { extend: {} },\n};`
        : `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      ${term}: ${configExtendValue},\n    },\n  },\n};`
      : kind === "variant"
        ? `<div class="group p-4 rounded border">\n  <span class="group-hover:${docs.sampleClass} transition-colors">Hover de grupo</span>\n</div>`
        : kind === "directive"
          ? `@layer utilities {\n  .card-shadow { box-shadow: 0 10px 30px rgba(15,23,42,0.12); }\n}\n@layer components {\n  .badge { @apply inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600 text-white; }\n}`
          : kind === "plugin"
            ? `<article class="prose">\n  <h1>Título estilizado</h1>\n  <p>Contenido del post.</p>\n</article>`
            : `<div class="${docs.sampleClass} hover:shadow-lg transition duration-200">Contenido usando ${term}</div>`;

  const exerciseExample =
    kind === "config"
      ? `// tailwind.config.js\nmodule.exports = {\n  ${term}: ${configExerciseValue},\n  theme: { extend: {} },\n};`
      : kind === "variant"
        ? `<button class="${term}${docs.sampleClass} bg-slate-800 text-white px-3 py-2 rounded w-full sm:w-auto">Estado controlado</button>`
        : kind === "directive"
          ? `@layer components {\n  .pill { @apply inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-100 text-slate-800; }\n}\n/* Practica agregando variantes como hover: o focus-visible: */`
          : kind === "plugin"
            ? `// tailwind.config.js\nmodule.exports = {\n  theme: {},\n  plugins: [require('${term}')],\n};`
            : `<section class="${docs.sampleClass} p-4 border border-slate-200 rounded-lg">\n  <h2 class="text-lg font-semibold">Demo ${term}</h2>\n  <p>Combina esta utilidad con variantes responsive y de estado.</p>\n</section>`;

  const aliases = [term];
  if ((kind === "utility" || kind === "variant") && docs.sampleClass && docs.sampleClass !== term) {
    aliases.push(docs.sampleClass);
  }

  return {
    term,
    slug: slugify(`tw-${term.replace(/[:@]/g, "-").replace(/\*/g, "any")}`),
    translation: docs.translation,
    category: Category.frontend,
    descriptionEs: docs.descriptionEs,
    descriptionEn: docs.descriptionEn,
    aliases,
    tags: baseTags,
    whatEs: docs.whatEs,
    whatEn: docs.whatEn,
    howEs: docs.howEs,
    howEn: docs.howEn,
    example: {
      titleEs: `Ejemplo ${term}`,
      titleEn: `${term} example`,
      code: exampleCode,
      noteEs: tailwindExampleNotes[kind].es,
      noteEn: tailwindExampleNotes[kind].en,
    },
    secondExample: {
      titleEs: `Variación ${term}`,
      titleEn: `${term} variation`,
      code: secondExample,
      noteEs: tailwindVariationNotes[kind].es,
      noteEn: tailwindVariationNotes[kind].en,
    },
    exerciseExample: {
      titleEs: `Práctica ${term}`,
      titleEn: `${term} practice`,
      code: exerciseExample,
      noteEs: tailwindPracticeNotes[kind].es,
      noteEn: tailwindPracticeNotes[kind].en,
    },
  };
}

const twDirectives = [
  "@tailwind base",
  "@tailwind components",
  "@tailwind utilities",
  "@layer",
  "@apply",
  "@screen",
  "@variants",
  "@config",
  "@theme",
  "@font-face",
  "@keyframes",
];

const twConfig = [
  "content",
  "theme",
  "extend",
  "plugins",
  "darkMode",
  "variants",
  "important",
  "prefix",
  "corePlugins",
  "safelist",
  "screens",
  "colors",
  "spacing",
  "fontFamily",
  "fontSize",
  "borderRadius",
  "boxShadow",
  "transitionProperty",
  "backgroundImage",
  "animation",
  "keyframes",
  "container",
  "typography",
  "forms",
  "aspectRatio",
  "lineClamp",
  "scrollbar",
];

const twVariants = [
  "hover:",
  "focus:",
  "active:",
  "visited:",
  "checked:",
  "disabled:",
  "focus-visible:",
  "focus-within:",
  "first:",
  "last:",
  "odd:",
  "even:",
  "empty:",
  "required:",
  "valid:",
  "invalid:",
  "read-only:",
  "read-write:",
  "placeholder:",
  "before:",
  "after:",
  "file:",
  "selection:",
  "open:",
  "marker:",
  "group-hover:",
  "group-focus:",
  "peer-hover:",
  "peer-focus:",
  "peer-checked:",
  "peer-disabled:",
  "peer-invalid:",
  "motion-safe:",
  "motion-reduce:",
  "rtl:",
  "ltr:",
  "dark:",
  "portrait:",
  "landscape:",
  "sm:",
  "md:",
  "lg:",
  "xl:",
  "2xl:",
  "aria-selected:",
  "aria-checked:",
  "aria-expanded:",
  "aria-disabled:",
  "aria-hidden:",
  "aria-pressed:",
];

const twUtilities = [
  "container",
  "box-border",
  "box-content",
  "block",
  "inline-block",
  "inline",
  "flex",
  "inline-flex",
  "table",
  "grid",
  "inline-grid",
  "contents",
  "hidden",
  "flow-root",
  "float-left",
  "float-right",
  "clear-left",
  "clear-right",
  "clear-both",
  "overflow-auto",
  "overflow-hidden",
  "overflow-visible",
  "overflow-scroll",
  "overflow-x-auto",
  "overflow-y-auto",
  "overscroll-auto",
  "overscroll-contain",
  "overscroll-none",
  "columns-1",
  "columns-2",
  "columns-3",
  "columns-4",
  "columns-5",
  "columns-6",
  "columns-12",
  "break-before-auto",
  "break-after-auto",
  "break-inside-auto",
  "break-inside-avoid",
  "flex-row",
  "flex-row-reverse",
  "flex-col",
  "flex-col-reverse",
  "flex-wrap",
  "flex-wrap-reverse",
  "flex-nowrap",
  "items-start",
  "items-end",
  "items-center",
  "items-baseline",
  "items-stretch",
  "justify-start",
  "justify-end",
  "justify-center",
  "justify-between",
  "justify-around",
  "justify-evenly",
  "content-center",
  "content-start",
  "content-end",
  "content-between",
  "content-around",
  "content-evenly",
  "self-auto",
  "self-start",
  "self-end",
  "self-center",
  "self-stretch",
  "flex-1",
  "flex-auto",
  "flex-initial",
  "flex-none",
  "grow",
  "grow-0",
  "shrink",
  "shrink-0",
  "basis-0",
  "basis-1/2",
  "basis-full",
  "grid-cols-1",
  "grid-cols-2",
  "grid-cols-3",
  "grid-cols-4",
  "grid-cols-5",
  "grid-cols-6",
  "grid-cols-12",
  "grid-rows-1",
  "grid-rows-2",
  "grid-flow-row",
  "grid-flow-col",
  "grid-flow-dense",
  "col-span-1",
  "col-span-2",
  "col-span-3",
  "col-span-full",
  "row-span-1",
  "row-span-2",
  "row-span-full",
  "auto-cols-auto",
  "auto-cols-min",
  "auto-cols-max",
  "auto-cols-fr",
  "auto-rows-auto",
  "auto-rows-min",
  "auto-rows-max",
  "auto-rows-fr",
  "gap-0",
  "gap-1",
  "gap-2",
  "gap-3",
  "gap-4",
  "gap-6",
  "gap-8",
  "gap-10",
  "m-0",
  "m-1",
  "m-2",
  "m-3",
  "m-4",
  "m-5",
  "m-6",
  "m-8",
  "m-10",
  "mt-*",
  "mb-*",
  "ml-*",
  "mr-*",
  "mx-*",
  "my-*",
  "p-0",
  "p-1",
  "p-2",
  "p-3",
  "p-4",
  "p-5",
  "p-6",
  "px-*",
  "py-*",
  "w-0",
  "w-px",
  "w-1",
  "w-2",
  "w-3",
  "w-4",
  "w-6",
  "w-8",
  "w-10",
  "w-12",
  "w-16",
  "w-20",
  "w-24",
  "w-32",
  "w-full",
  "w-screen",
  "w-auto",
  "min-w-0",
  "min-w-full",
  "max-w-xs",
  "max-w-sm",
  "max-w-md",
  "max-w-lg",
  "max-w-xl",
  "max-w-2xl",
  "max-w-7xl",
  "h-0",
  "h-px",
  "h-1",
  "h-2",
  "h-4",
  "h-8",
  "h-10",
  "h-12",
  "h-16",
  "h-20",
  "h-24",
  "h-full",
  "h-screen",
  "min-h-0",
  "min-h-full",
  "max-h-full",
  "font-sans",
  "font-serif",
  "font-mono",
  "font-light",
  "font-normal",
  "font-medium",
  "font-semibold",
  "font-bold",
  "font-black",
  "text-xs",
  "text-sm",
  "text-base",
  "text-lg",
  "text-xl",
  "text-2xl",
  "text-3xl",
  "text-4xl",
  "text-5xl",
  "text-6xl",
  "tracking-tight",
  "tracking-normal",
  "tracking-wide",
  "leading-none",
  "leading-tight",
  "leading-normal",
  "leading-relaxed",
  "line-through",
  "underline",
  "italic",
  "not-italic",
  "antialiased",
  "subpixel-antialiased",
  "truncate",
  "text-ellipsis",
  "text-clip",
  "text-{color}",
  "bg-{color}",
  "border-{color}",
  "divide-{color}",
  "placeholder-{color}",
  "from-{color}",
  "via-{color}",
  "to-{color}",
  "ring-{color}",
  "ring-offset-{color}",
  "shadow-{color}",
  "outline-{color}",
  "accent-{color}",
  "border",
  "border-0",
  "border-2",
  "border-4",
  "border-8",
  "border-t",
  "border-b",
  "border-l",
  "border-r",
  "border-dashed",
  "border-dotted",
  "border-double",
  "border-none",
  "rounded",
  "rounded-sm",
  "rounded-md",
  "rounded-lg",
  "rounded-xl",
  "rounded-2xl",
  "rounded-full",
  "bg-fixed",
  "bg-local",
  "bg-scroll",
  "bg-center",
  "bg-left",
  "bg-right",
  "bg-top",
  "bg-bottom",
  "bg-cover",
  "bg-contain",
  "bg-no-repeat",
  "bg-repeat",
  "bg-repeat-x",
  "bg-repeat-y",
  "bg-auto",
  "shadow",
  "shadow-sm",
  "shadow-md",
  "shadow-lg",
  "shadow-xl",
  "shadow-2xl",
  "shadow-inner",
  "opacity-0",
  "opacity-25",
  "opacity-50",
  "opacity-75",
  "opacity-100",
  "mix-blend-normal",
  "mix-blend-multiply",
  "mix-blend-screen",
  "backdrop-blur",
  "backdrop-brightness",
  "backdrop-contrast",
  "transform",
  "scale-0",
  "scale-50",
  "scale-75",
  "scale-90",
  "scale-100",
  "rotate-0",
  "rotate-45",
  "rotate-90",
  "translate-x-0",
  "translate-x-1",
  "translate-y-1",
  "skew-x-1",
  "skew-y-1",
  "origin-center",
  "transition",
  "transition-all",
  "transition-colors",
  "transition-opacity",
  "transition-transform",
  "duration-75",
  "duration-150",
  "duration-300",
  "ease-linear",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "animate-spin",
  "animate-ping",
  "animate-pulse",
  "animate-bounce",
  "cursor-default",
  "cursor-pointer",
  "resize",
  "select-none",
  "select-text",
  "select-all",
  "pointer-events-none",
  "pointer-events-auto",
  "overflow-scroll",
  "overscroll-none",
  "scroll-auto",
  "scroll-smooth",
  "snap-start",
  "snap-end",
  "snap-center",
  "snap-align",
  "sr-only",
  "not-sr-only",
  "aria-selected:",
  "aria-hidden:",
  "aria-disabled:",
  "aria-pressed:",
];

const twPlugins = [
  "@tailwindcss/forms",
  "@tailwindcss/typography",
  "@tailwindcss/aspect-ratio",
  "@tailwindcss/container-queries",
  "@tailwindcss/line-clamp",
  "@tailwindcss/scrollbar",
];

const autogeneratedTailwindTerms: SeedTermInput[] = [
  ...twDirectives.map((term) =>
    buildTailwindSeed({
      term,
      kind: "directive",
    }),
  ),
  ...twConfig.map((term) =>
    buildTailwindSeed({
      term,
      kind: "config",
      sample: term === "content" ? "['./src/**/*.{ts,tsx,html}']" : undefined,
    }),
  ),
  ...twVariants.map((term) =>
    buildTailwindSeed({
      term,
      kind: "variant",
      sample: "text-blue-600",
    }),
  ),
  ...twUtilities.map((term) =>
    buildTailwindSeed({
      term,
      kind: "utility",
      sample: tailwindUtilitySamples[term] ?? (term.includes("{color}") ? "text-emerald-600" : term),
    }),
  ),
  ...twPlugins.map((term) =>
    buildTailwindSeed({
      term,
      kind: "plugin",
    }),
  ),
].filter((item) => !infraTermSet.has(item.term.toLowerCase()));

export const curatedTerms: SeedTermInput[] = [
  ...curatedTermsBase,
  ...autogeneratedHtmlTerms,
  ...dedupedCssTerms,
  ...dedupedJsTerms,
  ...dedupedReactTerms,
  ...dedupedTsTerms,
  ...dedupedNodeTerms,
  ...dedupedStackTerms,
  ...dedupedVueTerms,
  ...dedupedAngularTerms,
  ...dedupedInfraTerms,
  ...autogeneratedTailwindTerms,
];
