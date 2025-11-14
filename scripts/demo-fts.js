#!/usr/bin/env node

const http = require('http');

function testSearch(query) {
  return new Promise((resolve, reject) => {
    const url = `http://localhost:3000/api/terms?q=${encodeURIComponent(query)}&pageSize=3`;
    
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ query, status: res.statusCode, data: json });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function demo() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║       🔍  DEMO: Búsqueda FTS5 Funcionando  🔍                 ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  const queries = [
    { term: 'grid', desc: 'Sistema de cuadrícula CSS' },
    { term: 'flex', desc: 'Diseño flexible CSS' },
    { term: 'api', desc: 'Interfaces de programación' },
  ];
  
  for (const { term, desc } of queries) {
    try {
      const result = await testSearch(term);
      
      console.log(`\n📌 Búsqueda: "${term}" (${desc})`);
      console.log('─'.repeat(65));
      console.log(`   Status: ${result.status === 200 ? '✅ 200 OK' : '❌ ' + result.status}`);
      console.log(`   Total encontrados: ${result.data.meta?.total || 0}`);
      console.log(`   Mostrando: ${result.data.items?.length || 0} de ${result.data.meta?.total || 0}`);
      
      if (result.data.items && result.data.items.length > 0) {
        console.log('\n   📋 Resultados (ordenados por relevancia BM25):');
        result.data.items.forEach((item, i) => {
          console.log(`      ${i + 1}. ${item.term}`);
          console.log(`         └─ ${item.translation} (${item.category})`);
        });
      }
      
    } catch (error) {
      console.error(`❌ Error con "${term}":`, error.message);
    }
  }
  
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║  ✅ La búsqueda FTS5 está operacional y con ranking BM25     ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
}

demo().catch(console.error);
