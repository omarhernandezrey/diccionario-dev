// Script para validar el total de términos en /terms
// Ejecuta: node scripts/validate-terms-total.js

const fetch = require('node-fetch');

const EXPECTED_TOTAL = 201; // Cambia este valor si el total esperado es diferente
const TERMS_URL = process.env.TERMS_URL || 'http://localhost:3000/api/terms';

async function main() {
  try {
    const res = await fetch(TERMS_URL);
    if (!res.ok) {
      console.error(`Error al consultar ${TERMS_URL}:`, res.status, res.statusText);
      process.exit(1);
    }
    const data = await res.json();
    const total = data?.meta?.total;
    if (typeof total !== 'number') {
      console.error('No se encontró meta.total en la respuesta:', data);
      process.exit(1);
    }
    if (total === EXPECTED_TOTAL) {
      console.log(`✅ Total correcto de términos (${total}) en /terms.`);
      process.exit(0);
    } else {
      console.warn(`⚠️  Total de términos incorrecto: ${total} (esperado: ${EXPECTED_TOTAL})`);
      console.warn('Sugerencia: Corre el seed en producción (npm run prisma:seed o /api/admin/seed)');
      process.exit(2);
    }
  } catch (err) {
    console.error('Error al validar /terms:', err);
    process.exit(1);
  }
}

main();
