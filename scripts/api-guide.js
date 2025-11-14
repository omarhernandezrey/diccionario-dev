#!/usr/bin/env node

console.log('\n╔══════════════════════════════════════════════════════════════════╗');
console.log('║           📚 GUÍA DE PRUEBAS - Búsqueda FTS5 API               ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

console.log('🚀 La API está corriendo en: http://localhost:3000\n');

console.log('📋 EJEMPLOS DE URLs PARA PROBAR:\n');

const examples = [
  {
    title: '1. Búsqueda simple - "grid"',
    url: 'http://localhost:3000/api/terms?q=grid',
    description: 'Encuentra todos los términos relacionados con CSS Grid (14 resultados)',
    curl: `curl -s 'http://localhost:3000/api/terms?q=grid&pageSize=3'`
  },
  {
    title: '2. Búsqueda multi-palabra - "flex direction"',
    url: 'http://localhost:3000/api/terms?q=flex%20direction',
    description: 'Busca términos que contengan ambas palabras',
    curl: `curl -s 'http://localhost:3000/api/terms?q=flex%20direction&pageSize=3'`
  },
  {
    title: '3. Términos de backend - "api"',
    url: 'http://localhost:3000/api/terms?q=api',
    description: 'Encuentra conceptos de backend (22 resultados)',
    curl: `curl -s 'http://localhost:3000/api/terms?q=api&pageSize=5'`
  },
  {
    title: '4. Propiedades CSS - "color"',
    url: 'http://localhost:3000/api/terms?q=color',
    description: 'Encuentra todas las propiedades relacionadas con color',
    curl: `curl -s 'http://localhost:3000/api/terms?q=color&pageSize=5'`
  },
  {
    title: '5. Búsqueda con paginación',
    url: 'http://localhost:3000/api/terms?q=css&page=2&pageSize=10',
    description: 'Segunda página de resultados para "css"',
    curl: `curl -s 'http://localhost:3000/api/terms?q=css&page=2&pageSize=10'`
  }
];

examples.forEach((ex, i) => {
  console.log(`${ex.title}`);
  console.log(`${'─'.repeat(70)}`);
  console.log(`📝 ${ex.description}`);
  console.log(`🌐 URL: ${ex.url}`);
  console.log(`\n💻 Prueba con curl:`);
  console.log(`   ${ex.curl}\n`);
});

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║                    🔍 CARACTERÍSTICAS FTS5                      ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

console.log('✨ Funcionalidades implementadas:\n');
console.log('   ✅ Búsqueda full-text con SQLite FTS5');
console.log('   ✅ Ranking BM25 para relevancia de resultados');
console.log('   ✅ Tokenización Unicode con remoción de diacríticos');
console.log('   ✅ Búsqueda con prefijos (ej: "grid" encuentra "grid-template")');
console.log('   ✅ Búsqueda multi-palabra (ej: "flex direction")');
console.log('   ✅ Sincronización automática con triggers');
console.log('   ✅ Búsqueda en 9 campos: term, translation, meaning, what,');
console.log('      how, aliases, tags, examples, category\n');

console.log('📊 Parámetros de consulta disponibles:\n');
console.log('   • q         - Texto de búsqueda (requerido para FTS)');
console.log('   • page      - Número de página (default: 1)');
console.log('   • pageSize  - Resultados por página (default: 50, max: 100)');
console.log('   • sort      - Ordenamiento: term_asc, term_desc, recent, oldest');
console.log('   • category  - Filtrar por categoría: frontend, backend, general');
console.log('   • tag       - Filtrar por etiqueta\n');

console.log('🎯 Respuesta JSON incluye:\n');
console.log('   {');
console.log('     "ok": true,');
console.log('     "items": [...],  // Array de términos encontrados');
console.log('     "meta": {');
console.log('       "page": 1,');
console.log('       "pageSize": 50,');
console.log('       "total": 14,');
console.log('       "totalPages": 1');
console.log('     }');
console.log('   }\n');

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║  💡 TIP: Abre las URLs en tu navegador para ver JSON formateado ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');
