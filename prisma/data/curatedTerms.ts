import { Category, Language } from "@prisma/client";
import type { SeedTermInput } from "../dictionary-types";

export const curatedTerms: SeedTermInput[] = [
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
