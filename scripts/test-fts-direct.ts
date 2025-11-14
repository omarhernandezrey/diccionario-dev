import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFts() {
  console.log('🔍 Probando FTS5 directamente...\n');
  
  try {
    // 1. Contar términos
    const count = await prisma.term.count();
    console.log(`✅ Total términos en DB: ${count}`);
    
    // 2. Verificar que TermSearch existe
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%Search%';
    `;
    console.log('✅ Tablas de búsqueda:', tables);
    
    // 3. Intentar una consulta FTS simple
    try {
      const searchResults = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM "TermSearch" WHERE "TermSearch" MATCH 'grid*';
      `);
      console.log('✅ Resultados FTS para "grid*":', searchResults);
    } catch (e) {
      console.error('❌ Error en consulta FTS:', e instanceof Error ? e.message : String(e));
    }
    
    // 4. Ver algunos términos
    const someTerms = await prisma.term.findMany({ take: 3 });
    console.log('\n✅ Primeros términos:');
    someTerms.forEach((t: { term: string; category: string }) => console.log(`  - ${t.term} (${t.category})`));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFts();
