import { PrismaClient, Category } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const data = [
    {
      term: "fetch",
      translation: "obtener",
      aliases: ["window.fetch", "http fetch"],
      category: Category.frontend,
      meaning: "Función para hacer solicitudes HTTP desde el navegador.",
      what: "Permite pedir datos a un servidor y manejar respuestas.",
      how: "Usa promesas o async/await. response.json() para parsear JSON.",
      examples: [
        {
          title: "GET JSON",
          code: `const r = await fetch("/api/users"); const d = await r.json();`,
        },
        {
          title: "POST JSON",
          code: `await fetch("/api/users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:"Omar"})});`,
        },
      ],
    },
    {
      term: "useState",
      translation: "usar estado",
      aliases: [],
      category: Category.frontend,
      meaning: "Hook de React para manejar estado en componentes.",
      what: "Almacena valores que cambian y re-renderizan el componente.",
      how: "const [v, setV] = useState(valorInicial);",
      examples: [
        {
          title: "Contador",
          code: `const [n,setN]=useState(0); <button onClick={()=>setN(n+1)}>{n}</button>`,
        },
      ],
    },
    {
      term: "REST",
      translation: "transferencia de estado representacional",
      aliases: ["rest api"],
      category: Category.backend,
      meaning: "Estilo para diseñar APIs basadas en recursos con HTTP.",
      what: "Endpoints /recurso y verbos GET/POST/PUT/DELETE.",
      how: "Define rutas en el backend y consume con fetch/axios en el frontend.",
      examples: [
        {
          title: "Express GET",
          code: `app.get("/api/users/:id",(req,res)=>res.json({id:req.params.id}))`,
        },
      ],
    },
    {
      term: "JOIN",
      translation: "unión",
      aliases: [],
      category: Category.database,
      meaning: "Operación SQL para combinar filas de tablas relacionadas.",
      what: "Trae datos relacionados en una sola consulta.",
      how: "INNER JOIN, LEFT JOIN, etc.",
      examples: [
        {
          title: "INNER JOIN",
          code: `SELECT u.id,u.name,p.title FROM users u INNER JOIN posts p ON p.user_id=u.id;`,
        },
      ],
    },
    {
      term: "Docker",
      translation: "contenedor",
      aliases: [],
      category: Category.devops,
      meaning: "Contenedores para empaquetar apps con sus dependencias.",
      what: "Mismo entorno en dev/prod.",
      how: "Dockerfile -> build -> run.",
      examples: [
        {
          title: "Dockerfile Node",
          code: `FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nEXPOSE 3000\nCMD ["npm","start"]`,
        },
      ],
    },
    {
      term: "JWT",
      translation: "token web JSON",
      aliases: ["json web token", "token"],
      category: Category.backend,
      meaning: "Token firmado para autenticación sin estado.",
      what: "Servidor emite token; cliente lo envía en cada request.",
      how: "Firmas/verificas con secreto/clave.",
      examples: [
        {
          title: "Middleware",
          code: `const t=req.headers.authorization?.replace("Bearer ",""); jwt.verify(t,process.env.JWT_SECRET)`,
        },
      ],
    },
    {
      term: "CORS",
      translation: "uso compartido de recursos de origen cruzado",
      aliases: [],
      category: Category.backend,
      meaning: "Política que controla quién puede consumir tu API (navegadores).",
      what: "Restringe orígenes no autorizados.",
      how: "Configura encabezados Access-Control-* o usa middleware.",
      examples: [
        {
          title: "Express CORS",
          code: `app.use(cors({origin:"https://mi-frontend.com"}))`,
        },
      ],
    },
    {
      term: "Promise",
      translation: "promesa",
      aliases: [],
      category: Category.general,
      meaning: "Objeto que representa una operación asíncrona.",
      what: "Estandariza asincronía: pendiente/éxito/error.",
      how: "then/catch o async/await.",
      examples: [
        {
          title: "Delay",
          code: `await new Promise(r=>setTimeout(r,500));`,
        },
      ],
    },
  ];

  for (const t of data) {
    await prisma.term.upsert({
      where: { term: t.term },
      update: { translation: t.translation } as any,
      create: {
        term: t.term,
        translation: t.translation,
        aliases: t.aliases ?? [],
        category: t.category,
        meaning: t.meaning,
        what: t.what,
        how: t.how,
        examples: t.examples as any,
      },
    });
  }
  const adminUser = process.env.ADMIN_USERNAME || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || process.env.ADMIN_TOKEN || "admin12345";
  const adminEmail = process.env.ADMIN_EMAIL || `${adminUser}@seed.local`;
  const hashed = await bcrypt.hash(adminPass, 10);
  await prisma.user.upsert({
    where: { username: adminUser },
    update: { password: hashed, email: adminEmail, role: "admin" },
    create: { username: adminUser, email: adminEmail, password: hashed, role: "admin" },
  });

  console.log("Seed OK");
}

main().finally(async () => prisma.$disconnect());
