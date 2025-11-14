import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFtsQuery() {
  console.log('🔍 Probando consulta SQL FTS...\n');
  
  const q = 'grid';
  const pageSize = 5;
  const page = 1;
  const termAlias = 't';
  const searchAlias = 'ts';
  
  // Simular buildFtsQuery
  const tokens = q.trim().split(/\s+/).filter(Boolean);
  const ftsQuery = tokens.map(token => `${token}*`).join(' ');
  
  console.log(`FTS Query: "${ftsQuery}"\n`);
  
  const filters = [`${searchAlias} MATCH ?`];
  const params = [ftsQuery];
  
  const whereClause = `WHERE ${filters.join(' AND ')}`;
  const joinClause = `FROM "TermSearch" AS ${searchAlias} JOIN "Term" AS ${termAlias} ON ${termAlias}."id" = ${searchAlias}."rowid"`;
  const orderByClause = `bm25(${searchAlias}) ASC, ${termAlias}."term" ASC`;
  
  const countSql = `SELECT COUNT(*) as count ${joinClause} ${whereClause};`;
  const listSql = `SELECT ${termAlias}.* ${joinClause} ${whereClause} ORDER BY ${orderByClause} LIMIT ? OFFSET ?;`;
  const listParams = [...params, pageSize, (page - 1) * pageSize];
  
  console.log('📊 COUNT SQL:');
  console.log(countSql);
  console.log('Params:', params);
  console.log('');
  
  console.log('📋 LIST SQL:');
  console.log(listSql);
  console.log('Params:', listParams);
  console.log('');
  
  try {
    console.log('⏳ Ejecutando COUNT...');
    const countResult = await prisma.$queryRawUnsafe(countSql, ...params);
    console.log('✅ COUNT Result:', countResult);
    console.log('');
    
    console.log('⏳ Ejecutando LIST...');
    const listResult = await prisma.$queryRawUnsafe(listSql, ...listParams);
    console.log('✅ LIST Result count:', Array.isArray(listResult) ? listResult.length : 0);
    if (Array.isArray(listResult)) {
      listResult.forEach((item: any) => {
        console.log(`  - ${item.term} (${item.category})`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFtsQuery();
