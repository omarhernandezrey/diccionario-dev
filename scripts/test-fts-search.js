#!/usr/bin/env node

const http = require('http');

function testSearch(query) {
  return new Promise((resolve, reject) => {
    const url = `http://localhost:3000/api/terms?q=${encodeURIComponent(query)}&pageSize=5`;
    
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

async function runTests() {
  console.log('🔍 Probando búsqueda FTS5...\n');
  
  const queries = ['grid', 'css', 'flex', 'container', 'media'];
  
  for (const query of queries) {
    try {
      const result = await testSearch(query);
      console.log(`✅ Query: "${result.query}"`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Total resultados: ${result.data.meta?.total || 0}`);
      if (result.data.items && result.data.items.length > 0) {
        console.log(`   Primeros términos:`);
        result.data.items.slice(0, 3).forEach(item => {
          console.log(`     - ${item.term} (${item.category})`);
        });
      }
      console.log('');
    } catch (error) {
      console.error(`❌ Error con query "${query}":`, error.message);
    }
  }
}

runTests().catch(console.error);
