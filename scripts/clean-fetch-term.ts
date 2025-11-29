import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function updateFetchClean() {
  const cleanDoc = {
    // 1. Definición
    meaning: 'API nativa del navegador para hacer solicitudes HTTP asincrónicas. Devuelve una promesa con la respuesta.',
    meaningEs: 'API nativa del navegador para hacer solicitudes HTTP asincrónicas. Devuelve una promesa con la respuesta.',
    meaningEn: 'Native browser API for asynchronous HTTP requests that returns promises.',
    
    // 2. Para qué sirve
    what: 'Consumir APIs REST o GraphQL sin librerías. Enviar y recibir JSON. Manejo de errores con try/catch.',
    whatEs: 'Consumir APIs REST o GraphQL sin librerías. Enviar y recibir JSON. Manejo de errores con try/catch.',
    whatEn: 'Consume REST/GraphQL APIs without external libraries. Send and receive JSON. Handle errors with try/catch.',
    
    // 3. Cómo funciona + ejemplos
    how: 'Usa await fetch(url, { method, headers, body, signal }) con AbortController para timeouts. Valida res.ok antes de parsear. Maneja cuerpos vacíos con res.text() primero.',
    howEs: 'Usa await fetch(url, { method, headers, body, signal }) con AbortController para timeouts. Valida res.ok antes de parsear. Maneja cuerpos vacíos con res.text() primero.',
    howEn: 'Use fetch(url, { method, headers, body, signal }) with AbortController for timeouts. Validate res.ok before parsing. Handle empty bodies with res.text() first.',
    
    // Ejemplos técnicos
    examples: [
      // Básico
      `const res = await fetch(url, { method, headers, body, signal });
if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
return res.json();`,
      
      // GET simple
      `async function loadPosts() {
  const res = await fetch("/api/posts", { cache: "no-store" });
  if (!res.ok) throw new Error(\`HTTP \${res.status} \${res.statusText}\`);
  return res.json();
}`,
      
      // Con timeout y AbortController
      `async function fetchWithTimeout(url, timeoutMs = 8000) {
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
      
      // POST con JSON
      `async function postData(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}`
    ] as Prisma.JsonArray
  };

  try {
    const updated = await prisma.term.update({
      where: { id: 1 }, // fetch
      data: {
        meaning: cleanDoc.meaning,
        meaningEs: cleanDoc.meaningEs,
        meaningEn: cleanDoc.meaningEn,
        what: cleanDoc.what,
        whatEs: cleanDoc.whatEs,
        whatEn: cleanDoc.whatEn,
        how: cleanDoc.how,
        howEs: cleanDoc.howEs,
        howEn: cleanDoc.howEn,
        examples: cleanDoc.examples
      }
    });

    console.log('✅ fetch term cleaned and updated');
    console.log('- meaning:', updated.meaning?.substring(0, 60));
    console.log('- what:', updated.what?.substring(0, 60));
    console.log('- how:', updated.how?.substring(0, 60));
    console.log('- examples:', Array.isArray(updated.examples) ? updated.examples.length : '0');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateFetchClean();
