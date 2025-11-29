import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateFetchTerm() {
  const fetchDoc = {
    definition: 'API nativa del navegador para hacer solicitudes HTTP asincrónicas. Devuelve una promesa con la respuesta.',
    purpose: 'Consumir APIs REST/GraphQL sin librerías. Enviar y recibir JSON. Manejo de errores con try/catch.',
    howItWorks: 'Usa await fetch(url, { method, headers, body, signal }) con AbortController para timeouts, valida res.ok y maneja cuerpos vacíos.',
    basicSyntax: `const res = await fetch(url, { method, headers, body, signal });
if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
return res.json();`,
    professionalExample: `async function fetchWithTimeout(url, timeoutMs = 8000) {
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
    commonCases: [
      'GET: fetch(url) — obtener datos',
      'POST: fetch(url, { method: "POST", body: JSON.stringify(data) })',
      'DELETE/PUT: Similar a POST con method respectivo'
    ],
    commonErrors: [
      'No validar res.ok antes de .json()',
      'No manejar timeouts (usa AbortController)',
      'Ignorar respuestas vacías (primero res.text(), luego parse)',
      'No configurar headers (Content-Type: application/json)'
    ],
    bestPractices: [
      'Siempre usar try/catch',
      'Validar res.ok y status',
      'Usar AbortController para cancelar/timeout',
      'Especificar cache: "no-store" en GET críticos',
      'Parsear respuesta como text primero si es dudosa'
    ],
    relatedConcepts: ['REST', 'HTTP', 'Promise', 'async/await', 'AbortController']
  };

  try {
    const updated = await prisma.term.update({
      where: { id: 1 },
      data: {
        meaning: fetchDoc.definition,
        meaningEs: fetchDoc.definition,
        what: fetchDoc.purpose,
        whatEs: fetchDoc.purpose,
        how: fetchDoc.howItWorks,
        howEs: fetchDoc.howItWorks,
        examples: [
          fetchDoc.basicSyntax,
          fetchDoc.professionalExample,
          ...fetchDoc.commonCases
        ]
      }
    });

    console.log('✅ fetch term updated:', updated);
  } catch (error) {
    console.error('❌ Error updating fetch term:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateFetchTerm();
