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
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', reject);
  });
}

async function runTest() {
  console.log('🔍 Probando búsqueda FTS5 con término "grid"...\n');
  
  try {
    const result = await testSearch('grid');
    console.log(`Status: ${result.status}`);
    console.log(`Response:`, result.data || result.raw);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runTest().catch(console.error);
