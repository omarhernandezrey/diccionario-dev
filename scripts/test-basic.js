#!/usr/bin/env node

const http = require('http');

function testEndpoint(url) {
  return new Promise((resolve, reject) => {
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
          resolve({ status: res.statusCode, data: data });
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('📋 Probando endpoint sin búsqueda...\n');
  
  try {
    const result = await testEndpoint('http://localhost:3000/api/terms?pageSize=3');
    console.log(`Status: ${result.status}`);
    console.log(`Response:`, JSON.stringify(result.data, null, 2).substring(0, 500));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runTests().catch(console.error);
