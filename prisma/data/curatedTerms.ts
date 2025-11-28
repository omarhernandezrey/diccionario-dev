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
      code: `// Declaramos una función asíncrona llamada loadPosts.
// Las funciones asíncronas permiten usar "await" para esperar respuestas de promesas.
async function loadPosts() {

  // Hacemos una petición HTTP a la ruta "/api/posts".
  // "await" pausa la ejecución hasta que la respuesta llegue.
  const response = await fetch("/api/posts");

  // Verificamos si la respuesta NO fue exitosa.
  // "response.ok" es true cuando el código HTTP es 200–299.
  // Si no es exitosa, lanzamos un error para detener el flujo.
  if (!response.ok) throw new Error("Error al cargar");

  // Convertimos la respuesta a formato JSON.
  // Esto también es una operación asíncrona que devuelve una promesa.
  return response.json();
}`,
      noteEs: "Controlas estados pending/success/error con promesas.",
      noteEn: "You manage pending/success/error states with promises.",
    },
    secondExample: {
      titleEs: "Fetch con Async/Await y Headers",
      titleEn: "Fetch with Async/Await and Headers",
      code: `async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST", 
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data), 
  });
  return response.json(); 
}`,
      noteEs: "Ejemplo común para enviar datos JSON.",
      noteEn: "Common pattern for sending JSON data.",
    },
    exerciseExample: {
      titleEs: "Crear publicación con manejo de errores",
      titleEn: "Create post with error handling",
      code: `// Función para crear una nueva publicación en el servidor
async function createPost(title, content) {
  
  try {
    // Hacemos una petición POST con datos en el body
    // Configuramos headers para indicar que enviamos JSON
    const response = await fetch("/api/posts", {
      method: "POST", // Método HTTP para crear recursos
      headers: {
        "Content-Type": "application/json", // Tipo de contenido
      },
      // Convertimos el objeto JavaScript a string JSON
      body: JSON.stringify({ title, content }),
    });

    // Verificamos si hubo error en la respuesta
    if (!response.ok) {
      // Intentamos obtener el mensaje de error del servidor
      const error = await response.json();
      throw new Error(error.message || "Error al crear");
    }

    // Si todo salió bien, retornamos la publicación creada
    const newPost = await response.json();
    return newPost;
    
  } catch (error) {
    // Capturamos errores de red o del servidor
    console.error("Error:", error.message);
    throw error; // Re-lanzamos para que el llamador lo maneje
  }
}`,
      noteEs: "Maneja errores de red y del servidor de forma robusta.",
      noteEn: "Handles both network and server errors robustly.",
    },
    whatEs: "Nos ayuda a comunicarnos con APIs REST o GraphQL sin depender de librerías externas.",
    whatEn: "It lets you talk to REST or GraphQL APIs without extra libraries.",
    howEs: "Usa await fetch(url, { method, headers, body }) y maneja los posibles errores con try/catch.",
    howEn: "Call await fetch(url, { method, headers, body }) and wrap it with try/catch for error handling.",
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
];
