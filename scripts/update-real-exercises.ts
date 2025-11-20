import { PrismaClient, ReviewStatus, Difficulty } from "@prisma/client";

const prisma = new PrismaClient();

const realExercises = [
    {
        slug: "fetch",
        titleEs: "Implementar sistema de retry automático",
        titleEn: "Implement automatic retry system",
        promptEs: "Crea una función `fetchWithRetry` que reintente automáticamente una petición hasta 3 veces si falla, con un delay exponencial entre intentos.",
        starterCode: "async function fetchWithRetry(url: string, maxRetries = 3) {\n  // Tu implementación aquí\n  // Debe reintentar con delays de 1s, 2s, 4s\n}\n\n// Ejemplo de uso:\nconst data = await fetchWithRetry('/api/users');",
        starterLang: "tsx",
        solution: {
            language: "tsx",
            code: "async function fetchWithRetry(url: string, maxRetries = 3): Promise<any> {\n  let lastError: Error;\n  \n  for (let attempt = 0; attempt < maxRetries; attempt++) {\n    try {\n      const response = await fetch(url);\n      if (!response.ok) throw new Error(`HTTP ${response.status}`);\n      return await response.json();\n    } catch (error) {\n      lastError = error as Error;\n      \n      if (attempt < maxRetries - 1) {\n        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s\n        console.log(`Retry ${attempt + 1}/${maxRetries} after ${delay}ms`);\n        await new Promise(resolve => setTimeout(resolve, delay));\n      }\n    }\n  }\n  \n  throw new Error(`Failed after ${maxRetries} attempts: ${lastError!.message}`);\n}",
            explainEs: "Este patrón es común en sistemas de producción. El delay exponencial evita sobrecargar el servidor. En entrevistas evalúan: manejo de errores, async/await, y conocimiento de patrones de resiliencia.",
            explainEn: "This pattern is common in production systems. Exponential backoff prevents server overload. Interviews test: error handling, async/await, and resilience patterns."
        }
    },
    {
        slug: "usestate",
        titleEs: "Crear un contador con límite máximo",
        titleEn: "Create a counter with max limit",
        promptEs: "Implementa un componente Counter que incremente/decremente pero nunca exceda 10 ni baje de 0. Debe mostrar un mensaje cuando alcance los límites.",
        starterCode: "function Counter() {\n  // Implementa el estado y la lógica\n  \n  return (\n    <div>\n      <button>-</button>\n      <span>{/* count */}</span>\n      <button>+</button>\n      {/* Mensaje de límite */}\n    </div>\n  );\n}",
        starterLang: "tsx",
        solution: {
            language: "tsx",
            code: "function Counter() {\n  const [count, setCount] = useState(0);\n  const [message, setMessage] = useState('');\n\n  const increment = () => {\n    setCount(prev => {\n      if (prev >= 10) {\n        setMessage('¡Límite máximo alcanzado!');\n        setTimeout(() => setMessage(''), 2000);\n        return prev;\n      }\n      setMessage('');\n      return prev + 1;\n    });\n  };\n\n  const decrement = () => {\n    setCount(prev => {\n      if (prev <= 0) {\n        setMessage('¡Límite mínimo alcanzado!');\n        setTimeout(() => setMessage(''), 2000);\n        return prev;\n      }\n      setMessage('');\n      return prev - 1;\n    });\n  };\n\n  return (\n    <div className=\"flex items-center gap-4\">\n      <button onClick={decrement} className=\"px-4 py-2 bg-red-500 text-white rounded\">-</button>\n      <span className=\"text-2xl font-bold\">{count}</span>\n      <button onClick={increment} className=\"px-4 py-2 bg-green-500 text-white rounded\">+</button>\n      {message && <p className=\"text-sm text-orange-600\">{message}</p>}\n    </div>\n  );\n}",
            explainEs: "Clave: usar la forma funcional `setCount(prev => ...)` para evitar stale closures. El setTimeout limpia el mensaje automáticamente. Evalúan: manejo de estado derivado y UX.",
            explainEn: "Key: use functional form `setCount(prev => ...)` to avoid stale closures. setTimeout auto-clears the message. Tests: derived state handling and UX."
        }
    },
    {
        slug: "debounce",
        titleEs: "Buscador con debounce en tiempo real",
        titleEn: "Real-time search with debounce",
        promptEs: "Crea un input de búsqueda que solo haga la petición al servidor 500ms después de que el usuario deje de escribir. Debe cancelar peticiones anteriores.",
        starterCode: "function SearchBox() {\n  const [query, setQuery] = useState('');\n  const [results, setResults] = useState([]);\n  \n  // Implementa el debounce y la búsqueda\n  \n  return (\n    <div>\n      <input \n        value={query} \n        onChange={(e) => setQuery(e.target.value)}\n        placeholder=\"Buscar...\"\n      />\n      <ul>{/* resultados */}</ul>\n    </div>\n  );\n}",
        starterLang: "tsx",
        solution: {
            language: "tsx",
            code: "function SearchBox() {\n  const [query, setQuery] = useState('');\n  const [results, setResults] = useState<string[]>([]);\n  const [loading, setLoading] = useState(false);\n\n  useEffect(() => {\n    if (!query.trim()) {\n      setResults([]);\n      return;\n    }\n\n    const controller = new AbortController();\n    const timeoutId = setTimeout(async () => {\n      setLoading(true);\n      try {\n        const res = await fetch(`/api/search?q=${query}`, {\n          signal: controller.signal\n        });\n        const data = await res.json();\n        setResults(data.results);\n      } catch (err) {\n        if (err.name !== 'AbortError') console.error(err);\n      } finally {\n        setLoading(false);\n      }\n    }, 500);\n\n    return () => {\n      clearTimeout(timeoutId);\n      controller.abort();\n    };\n  }, [query]);\n\n  return (\n    <div>\n      <input \n        value={query} \n        onChange={(e) => setQuery(e.target.value)}\n        placeholder=\"Buscar...\"\n        className=\"border p-2 rounded w-full\"\n      />\n      {loading && <p>Buscando...</p>}\n      <ul className=\"mt-2\">\n        {results.map((item, i) => (\n          <li key={i} className=\"p-2 hover:bg-gray-100\">{item}</li>\n        ))}\n      </ul>\n    </div>\n  );\n}",
            explainEs: "Combina debounce (setTimeout) con cancelación de peticiones (AbortController). El cleanup del useEffect cancela tanto el timeout como el fetch. Patrón crítico en apps reales.",
            explainEn: "Combines debounce (setTimeout) with request cancellation (AbortController). useEffect cleanup cancels both timeout and fetch. Critical pattern in real apps."
        }
    },
    {
        slug: "rest",
        titleEs: "CRUD completo de tareas (TODO API)",
        titleEn: "Complete TODO CRUD API",
        promptEs: "Diseña e implementa los 5 endpoints REST para un sistema de tareas: listar, crear, obtener por ID, actualizar y eliminar.",
        starterCode: "// Define los endpoints y sus respuestas:\n// GET    /todos\n// POST   /todos\n// GET    /todos/:id\n// PUT    /todos/:id\n// DELETE /todos/:id\n\ninterface Todo {\n  id: string;\n  title: string;\n  completed: boolean;\n}",
        starterLang: "ts",
        solution: {
            language: "ts",
            code: "import { NextRequest, NextResponse } from 'next/server';\n\nconst todos: Todo[] = [];\n\n// GET /todos - Listar todas\nexport async function GET() {\n  return NextResponse.json({ todos });\n}\n\n// POST /todos - Crear nueva\nexport async function POST(req: NextRequest) {\n  const { title } = await req.json();\n  \n  if (!title?.trim()) {\n    return NextResponse.json(\n      { error: 'Title is required' },\n      { status: 400 }\n    );\n  }\n\n  const todo = {\n    id: crypto.randomUUID(),\n    title: title.trim(),\n    completed: false\n  };\n  \n  todos.push(todo);\n  return NextResponse.json(todo, { status: 201 });\n}\n\n// PUT /todos/:id - Actualizar\nexport async function PUT(req: NextRequest, { params }: { params: { id: string } }) {\n  const index = todos.findIndex(t => t.id === params.id);\n  \n  if (index === -1) {\n    return NextResponse.json(\n      { error: 'Todo not found' },\n      { status: 404 }\n    );\n  }\n  \n  const { title, completed } = await req.json();\n  todos[index] = { ...todos[index], title, completed };\n  \n  return NextResponse.json(todos[index]);\n}\n\n// DELETE /todos/:id - Eliminar\nexport async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {\n  const index = todos.findIndex(t => t.id === params.id);\n  \n  if (index === -1) {\n    return NextResponse.json(\n      { error: 'Todo not found' },\n      { status: 404 }\n    );\n  }\n  \n  todos.splice(index, 1);\n  return NextResponse.json({}, { status: 204 });\n}",
            explainEs: "Implementación completa de CRUD REST. Clave: códigos de estado correctos (200, 201, 204, 400, 404), validación de entrada, y estructura de rutas RESTful. Esto es lo que piden en entrevistas reales.",
            explainEn: "Complete REST CRUD implementation. Key: correct status codes (200, 201, 204, 400, 404), input validation, and RESTful route structure. This is what real interviews ask for."
        }
    },
    {
        slug: "jwt",
        titleEs: "Sistema de login con JWT",
        titleEn: "Login system with JWT",
        promptEs: "Implementa un endpoint /login que valide credenciales y devuelva un JWT, y un middleware que proteja rutas verificando el token.",
        starterCode: "// POST /api/login\n// Recibe: { email, password }\n// Devuelve: { token }\n\n// Middleware: verifyToken\n// Protege rutas privadas",
        starterLang: "ts",
        solution: {
            language: "ts",
            code: "import jwt from 'jsonwebtoken';\nimport bcrypt from 'bcryptjs';\n\nconst SECRET = process.env.JWT_SECRET!;\n\n// POST /api/login\nexport async function POST(req: Request) {\n  const { email, password } = await req.json();\n  \n  // Buscar usuario (ejemplo simplificado)\n  const user = { id: 1, email: 'admin@test.com', hashedPassword: '...' };\n  \n  const valid = await bcrypt.compare(password, user.hashedPassword);\n  if (!valid) {\n    return Response.json({ error: 'Invalid credentials' }, { status: 401 });\n  }\n  \n  const token = jwt.sign(\n    { userId: user.id, email: user.email },\n    SECRET,\n    { expiresIn: '24h' }\n  );\n  \n  return Response.json({ token });\n}\n\n// Middleware de protección\nexport function verifyToken(req: Request) {\n  const authHeader = req.headers.get('authorization');\n  const token = authHeader?.split(' ')[1];\n  \n  if (!token) {\n    return Response.json({ error: 'No token' }, { status: 401 });\n  }\n  \n  try {\n    const decoded = jwt.verify(token, SECRET);\n    return { user: decoded };\n  } catch (err) {\n    return Response.json({ error: 'Invalid token' }, { status: 403 });\n  }\n}",
            explainEs: "Sistema completo de autenticación. Clave: hashear passwords con bcrypt, firmar JWT con expiración, separar token del header 'Bearer', y distinguir 401 (no autenticado) de 403 (token inválido).",
            explainEn: "Complete auth system. Key: hash passwords with bcrypt, sign JWT with expiration, extract token from 'Bearer' header, and distinguish 401 (not authenticated) from 403 (invalid token)."
        }
    }
];

async function main() {
    console.log("Updating exercises with REAL coding challenges...");

    for (const item of realExercises) {
        const term = await prisma.term.findFirst({ where: { slug: item.slug } });
        if (!term) {
            console.log(`Term ${item.slug} not found, skipping...`);
            continue;
        }

        await prisma.exercise.deleteMany({ where: { termId: term.id } });

        const codeBlockMarker = "```";
        const fullPrompt = item.promptEs + "\n\n" + codeBlockMarker + item.starterLang + "\n" + item.starterCode + "\n" + codeBlockMarker;

        await prisma.term.update({
            where: { id: term.id },
            data: {
                exercises: {
                    create: {
                        titleEs: item.titleEs,
                        titleEn: item.titleEn,
                        promptEs: fullPrompt,
                        promptEn: item.promptEs,
                        difficulty: Difficulty[item.slug === "fetch" || item.slug === "debounce" || item.slug === "jwt" ? "hard" : "medium"],
                        status: ReviewStatus.approved,
                        solutions: [item.solution]
                    }
                }
            }
        });
        console.log(`✓ Updated ${item.slug}`);
    }

    console.log("\n🎯 Done! Now you have REAL interview exercises.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
