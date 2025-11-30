import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const allTermsExamples: Record<string, { snippet: string; language: string }> = {
  "align-items": {
    language: "css",
    snippet: `/* Definimos un contenedor flex para las tarjetas */
section.cards {
  /* Activamos flexbox en el contenedor */
  display: flex;
  
  /* Centramos los elementos en el eje cruzado (vertical) */
  /* Esto hace que todas las cards tengan la misma altura visual */
  align-items: center;
  
  /* Añadimos espacio entre las tarjetas */
  gap: 1.25rem;
}

/* Estilizamos cada tarjeta individual */
section.cards > article {
  /* Cada card ocupa el mismo espacio disponible */
  flex: 1;
  
  /* Establecemos una altura mínima */
  min-height: 280px;
}`,
  },
  "aria-label": {
    language: "html",
    snippet: `<button aria-label="Abrir menú" class="p-2 rounded hover:bg-slate-100">
  <svg aria-hidden="true" viewBox="0 0 24 24" class="h-5 w-5">
    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2"/>
  </svg>
</button>

<!-- Ejemplo avanzado con aria-label dinámico -->
<button 
  aria-label="Favorito"
  onclick="this.classList.toggle('liked'); this.setAttribute('aria-label', this.classList.contains('liked') ? 'Remover de favoritos' : 'Agregar a favoritos')"
  class="w-8 h-8 flex items-center justify-center"
>
  ♥
</button>`,
  },
  "aspect-ratio": {
    language: "css",
    snippet: `/* Mantener proporción 16:9 para videos */
.video-container {
  aspect-ratio: 16 / 9;
  width: 100%;
  background: #000;
  overflow: hidden;
}

.video-container iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* Imagen con proporción cuadrada 1:1 */
.avatar {
  width: 64px;
  aspect-ratio: 1;
  border-radius: 50%;
  object-fit: cover;
}

/* Tarjeta con proporción custom */
.card {
  aspect-ratio: 3 / 4;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
}`,
  },
  "backdrop-filter": {
    language: "css",
    snippet: `/* Efecto blur en el fondo */
.modal-backdrop {
  backdrop-filter: blur(4px);
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  inset: 0;
  z-index: 40;
}

/* Navbar con efecto glass morphism */
.navbar {
  backdrop-filter: blur(10px) brightness(1.1);
  background-color: rgba(255, 255, 255, 0.7);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 50;
}

/* Tarjeta con efecto glassmorphism */
.glass-card {
  backdrop-filter: blur(8px) saturate(180%);
  background-color: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 2rem;
}`,
  },
  "bg-gradient-to-r": {
    language: "html",
    snippet: `<!-- Gradient de izquierda a derecha (Tailwind) -->
<div class="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-8 rounded-lg">
  <h1 class="text-white font-bold text-2xl">Título con Gradient</h1>
</div>

<!-- Gradient personalizado en CSS puro -->
<div style="background: linear-gradient(to right, #3b82f6, #10b981, #f59e0b); padding: 2rem; border-radius: 8px;">
  <p style="color: white; font-weight: bold;">Contenido con fondo gradiente</p>
</div>

<!-- Combinación con otros estilos -->
<button class="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow">
  Click aquí
</button>`,
  },
  "CI/CD": {
    language: "yaml",
    snippet: `# Configuración básica de CI/CD con GitHub Actions
name: Build and Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm run test
      
      - name: Build project
        run: npm run build
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json`,
  },
  clamp: {
    language: "css",
    snippet: `/* Tamaño fluido de fuente: mínimo 1rem, máximo 2rem */
h1 {
  font-size: clamp(1rem, 2vw + 0.5rem, 2rem);
}

/* Ancho fluido: mínimo 300px, máximo 1200px */
.container {
  width: clamp(300px, 90vw, 1200px);
  margin: 0 auto;
}

/* Padding fluido que responde al viewport */
.card {
  padding: clamp(1rem, 5vw, 2rem);
  margin-bottom: clamp(0.5rem, 2vw, 1rem);
}

/* Altura de línea responsiva */
p {
  line-height: clamp(1.5, 1.5vw, 1.8);
  font-size: clamp(0.875rem, 1vw, 1.125rem);
}`,
  },
  debounce: {
    language: "ts",
    snippet: `// Función debounce genérica
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Uso en un componente React
import { useMemo } from 'react';

function SearchComponent() {
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      console.log('Buscando:', query);
      // Hacer llamada a API
    }, 300),
    []
  );
  
  return (
    <input
      type="text"
      onChange={(e) => debouncedSearch(e.target.value)}
      placeholder="Escribe para buscar..."
    />
  );
}`,
  },
  "Docker": {
    language: "dockerfile",
    snippet: `# Usar imagen base ligera de Node.js
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Compilar si es necesario
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"]`,
  },
  fetch: {
    language: "ts",
    snippet: `// GET simple
async function getUser(id: number) {
  const response = await fetch(\`/api/users/\${id}\`);
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}

// POST con datos
async function createPost(data: { title: string; body: string }) {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Con timeout
function fetchWithTimeout(url: string, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  return fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(id));
}`,
  },
  "flex-col": {
    language: "css",
    snippet: `/* Dirección de columna vertical */
.flex-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Combinación con other flex properties */
.card-layout {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 300px;
  padding: 1rem;
  border-radius: 8px;
  background: #f5f5f5;
}

/* Con Tailwind CSS -->
<!-- Solo usar la clase -->
<!-- <div class="flex flex-col gap-4">
  <div>Elemento 1</div>
  <div>Elemento 2</div>
  <div>Elemento 3</div>
</div> -->`,
  },
  "GraphQL": {
    language: "graphql",
    snippet: `# Definir tipo de Usuario
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

# Definir tipo de Post
type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
}

# Root Query
type Query {
  user(id: ID!): User
  posts(limit: Int = 10): [Post!]!
}

# Root Mutation
type Mutation {
  createUser(name: String!, email: String!): User!
  createPost(title: String!, content: String!, authorId: ID!): Post!
}`,
  },
  "grid-template-columns": {
    language: "css",
    snippet: `/* Grid con 3 columnas iguales */
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

/* Grid responsivo con auto-fit */
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

/* Grid con tamaños específicos */
.custom-grid {
  display: grid;
  grid-template-columns: 200px 1fr 100px;
  gap: 1rem;
}

/* Grid con media queries -->
@media (max-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}`,
  },
  "JWT": {
    language: "ts",
    snippet: `import jwt from 'jsonwebtoken';

// Generar JWT
function generateToken(payload: { id: number; email: string }) {
  const secret = process.env.JWT_SECRET || 'secret-key';
  return jwt.sign(payload, secret, { expiresIn: '24h' });
}

// Verificar JWT
function verifyToken(token: string) {
  try {
    const secret = process.env.JWT_SECRET || 'secret-key';
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Middleware Express
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.sendStatus(403);
  }
}`,
  },
  "Prisma": {
    language: "prisma",
    snippet: `// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id    Int     @id @default(autoincrement())
  title String
  content String
  published Boolean @default(false)
  author User @relation(fields: [authorId], references: [id])
  authorId Int
}`,
  },
  "REST": {
    language: "ts",
    snippet: `// API REST con Express
import express from 'express';

const app = express();
app.use(express.json());

// GET todos los usuarios
app.get('/api/users', (req, res) => {
  res.json([{ id: 1, name: 'Juan' }]);
});

// GET usuario por ID
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  res.json({ id, name: 'Juan' });
});

// POST crear usuario
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  res.status(201).json({ id: 1, name, email });
});

// PUT actualizar usuario
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  res.json({ id, name });
});

// DELETE usuario
app.delete('/api/users/:id', (req, res) => {
  res.sendStatus(204);
});

app.listen(3000);`,
  },
  "scroll-snap": {
    language: "css",
    snippet: `/* Contenedor con scroll snap */
.scroll-container {
  scroll-snap-type: x mandatory;
  overflow-x: scroll;
  scroll-behavior: smooth;
  width: 100%;
  height: 500px;
}

/* Elementos que snappean */
.scroll-item {
  scroll-snap-align: center;
  scroll-snap-stop: always;
  flex-shrink: 0;
  width: 100%;
  height: 100%;
}

/* Gallery con scroll snap vertical -->
.gallery {
  scroll-snap-type: y proximity;
  overflow-y: scroll;
  height: 100vh;
}

.gallery-item {
  scroll-snap-align: start;
  height: 100vh;
}`,
  },
  "useEffect": {
    language: "tsx",
    snippet: `import { useEffect, useState } from 'react';

// Efecto que corre al montar
useEffect(() => {
  console.log('Componente montado');
  
  return () => {
    console.log('Componente desmontado');
  };
}, []);

// Efecto que corre cuando count cambia
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);
  
  return (
    <>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </>
  );
}

// Efecto con cleanup
function Timer() {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Tick');
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return <div>Timer running...</div>;
}`,
  },
  "useState": {
    language: "tsx",
    snippet: `import { useState } from 'react';

// Estado simple
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </>
  );
}

// Estado con objeto
function Form() {
  const [form, setForm] = useState({ name: '', email: '' });
  
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };
  
  return (
    <>
      <input name="name" value={form.name} onChange={handleChange} />
      <input name="email" value={form.email} onChange={handleChange} />
    </>
  );
}

// Estado con función inicial
function ExpensiveComponent() {
  const [data, setData] = useState(() => {
    console.log('Calculando...');
    return []// Cálculo costoso
  });
  
  return <div>{data.length}</div>;
}`,
  },
};

async function updateAllTermsWithCode() {
  try {
    console.log("📝 Agregando ejemplos de código a TODOS los términos...\n");

    let updated = 0;
    let failed = 0;

    for (const [termName, data] of Object.entries(allTermsExamples)) {
      try {
        const term = await prisma.term.findUnique({
          where: { term: termName },
          include: { variants: true },
        });

        if (!term) {
          console.log(`⚠️  No encontrado: ${termName}`);
          failed++;
          continue;
        }

        // Buscar variante existente
        const languageMap: Record<string, any> = {
          css: "css",
          html: "html",
          yaml: "go", // Usamos 'go' como placeholder
          ts: "ts",
          tsx: "ts",
          dockerfile: "go",
          graphql: "go",
          prisma: "go",
          typescript: "ts",
        };

        const lang = (languageMap[data.language] || "ts") as any;

        if (term.variants.length > 0) {
          // Actualizar variante existente
          await prisma.termVariant.update({
            where: { id: term.variants[0].id },
            data: { snippet: data.snippet },
          });
        } else {
          // Crear nueva variante
          await prisma.termVariant.create({
            data: {
              termId: term.id,
              language: lang,
              snippet: data.snippet,
              level: "intermediate",
              status: "approved",
            },
          });
        }

        const lines = data.snippet.split("\n").length;
        console.log(`✅ ${termName}: ${lines} líneas de código`);
        updated++;
      } catch (error) {
        console.error(`❌ Error en ${termName}:`, error);
        failed++;
      }
    }

    console.log(
      `\n✨ Actualización completada: ${updated} términos actualizados, ${failed} errores`
    );
  } catch (error) {
    console.error("❌ Error general:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateAllTermsWithCode();
