import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Ejemplos optimizados para preview en vivo
const livePreviewExamples = {
  html: {
    language: "html",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML - Documento Web</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      background: rgba(255, 255, 255, 0.1);
      padding: 20px;
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }
    h1 { color: #fff; }
    p { line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎉 ¡Estructura HTML Básica!</h1>
    <p>Este es un ejemplo de un documento HTML válido.</p>
    <p>Elementos incluidos:</p>
    <ul>
      <li>&lt;head&gt; - Metadatos</li>
      <li>&lt;body&gt; - Contenido visible</li>
      <li>&lt;meta&gt; - Información adicional</li>
      <li>&lt;title&gt; - Título de la página</li>
    </ul>
  </div>
</body>
</html>`,
  },
  head: {
    language: "html",
    snippet: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Elemento HEAD</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui; padding: 20px; background: #f5f5f5; }
    .info-box { 
      background: white; 
      padding: 20px; 
      border-radius: 8px; 
      border-left: 4px solid #667eea;
      margin: 10px 0;
    }
    .title { color: #667eea; font-weight: bold; }
  </style>
</head>
<body>
  <div class="info-box">
    <div class="title">📋 Contenido del &lt;head&gt;</div>
    <p><strong>Meta tags:</strong> UTF-8, viewport, etc.</p>
    <p><strong>Title:</strong> "Elemento HEAD"</p>
    <p><strong>CSS:</strong> Estilos cargados aquí</p>
  </div>
  <div class="info-box">
    <p>El &lt;head&gt; contiene metadatos invisibles para el usuario pero esenciales para el navegador.</p>
  </div>
</body>
</html>`,
  },
  "align-items": {
    language: "css",
    snippet: `/* Demostración de align-items */
body {
  margin: 0;
  padding: 20px;
  background: #f5f5f5;
  font-family: system-ui;
}

.container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 300px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 20px;
  gap: 10px;
}

.item {
  background: white;
  padding: 20px;
  border-radius: 4px;
  text-align: center;
  font-weight: bold;
  color: #667eea;
}

.item.small { height: 60px; }
.item.medium { height: 100px; }
.item.large { height: 140px; }`,
  },
  "flex-col": {
    language: "css",
    snippet: `/* Demostración de flex-col (flex-direction: column) */
body {
  margin: 0;
  padding: 20px;
  background: #f5f5f5;
  font-family: system-ui;
}

.flex-col-demo {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 8px;
}

.item {
  background: white;
  padding: 15px 20px;
  border-radius: 4px;
  font-weight: bold;
  color: #667eea;
}

.item:nth-child(1) { width: 100%; }
.item:nth-child(2) { width: 80%; }
.item:nth-child(3) { width: 60%; }`,
  },
  "bg-gradient-to-r": {
    language: "css",
    snippet: `/* Demostración de gradientes de izquierda a derecha */
body {
  margin: 0;
  padding: 20px;
  background: #f5f5f5;
  font-family: system-ui;
}

.gradient-demo {
  margin-top: 20px;
}

.gradient-box {
  height: 80px;
  margin: 15px 0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.gradient-1 {
  background: linear-gradient(to right, #667eea, #764ba2);
}

.gradient-2 {
  background: linear-gradient(to right, #f093fb, #f5576c);
}

.gradient-3 {
  background: linear-gradient(to right, #4facfe, #00f2fe);
}`,
  },
  "grid-template-columns": {
    language: "css",
    snippet: `/* Demostración de grid-template-columns */
body {
  margin: 0;
  padding: 20px;
  background: #f5f5f5;
  font-family: system-ui;
}

.grid-demo {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.grid-item {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px;
  border-radius: 8px;
  color: white;
  text-align: center;
  font-weight: bold;
}

.grid-item:nth-child(1) { grid-column: 1; }
.grid-item:nth-child(2) { grid-column: 2; }
.grid-item:nth-child(3) { grid-column: 3; }`,
  },
  "aspect-ratio": {
    language: "css",
    snippet: `/* Demostración de aspect-ratio */
body {
  margin: 0;
  padding: 20px;
  background: #f5f5f5;
  font-family: system-ui;
}

.aspect-ratio-demo {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ratio-box {
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.ratio-1-1 { aspect-ratio: 1; }
.ratio-16-9 { aspect-ratio: 16 / 9; }
.ratio-4-3 { aspect-ratio: 4 / 3; }`,
  },
  "scroll-snap": {
    language: "css",
    snippet: `/* Demostración de scroll-snap */
body {
  margin: 0;
  padding: 20px;
  background: #f5f5f5;
  font-family: system-ui;
}

.scroll-container {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 10px;
  padding: 10px;
  background: white;
  border-radius: 8px;
}

.snap-item {
  scroll-snap-align: center;
  scroll-snap-stop: always;
  flex: 0 0 250px;
  height: 150px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}

.snap-item:nth-child(1) { background: linear-gradient(135deg, #667eea, #764ba2); }
.snap-item:nth-child(2) { background: linear-gradient(135deg, #f093fb, #f5576c); }
.snap-item:nth-child(3) { background: linear-gradient(135deg, #4facfe, #00f2fe); }
.snap-item:nth-child(4) { background: linear-gradient(135deg, #43e97b, #38f9d7); }`,
  },
  template: {
    language: "html",
    snippet: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui; padding: 20px; background: #f5f5f5; }
    .cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
    .card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      border-radius: 8px;
      color: white;
    }
    .card h3 { margin: 0; color: #fff; }
  </style>
</head>
<body>
  <!-- Plantilla reutilizable -->
  <template id="card-template">
    <div class="card">
      <h3 class="title"></h3>
      <p class="description"></p>
    </div>
  </template>

  <div id="cards" class="cards"></div>

  <script>
    const template = document.getElementById('card-template');
    const items = [
      { title: '📱 Responsive', description: 'Adapta tu contenido' },
      { title: '⚡ Rápido', description: 'Carga instantánea' }
    ];
    
    items.forEach(item => {
      const clone = template.content.cloneNode(true);
      clone.querySelector('.title').textContent = item.title;
      clone.querySelector('.description').textContent = item.description;
      document.getElementById('cards').appendChild(clone);
    });
  </script>
</body>
</html>`,
  },
};

async function updateLivePreviewExamples() {
  console.log("🔄 Actualizando snippets para preview en vivo...\n");

  for (const [termName, previewData] of Object.entries(livePreviewExamples)) {
    const term = await prisma.term.findUnique({
      where: { term: termName },
      include: { variants: true },
    });

    if (!term) {
      console.log(`⚠️  ${termName} no encontrado`);
      continue;
    }

    // Buscar la variante con el mismo lenguaje
    const variant = term.variants.find(
      (v) => v.language === (previewData.language as any)
    );

    if (variant) {
      await prisma.termVariant.update({
        where: { id: variant.id },
        data: { snippet: previewData.snippet },
      });
      console.log(`✅ ${termName}: snippet actualizado para preview`);
    } else {
      console.log(`⚠️  ${termName}: no tiene variante ${previewData.language}`);
    }
  }

  console.log("\n✨ Snippets actualizados para preview en vivo");
}

async function main() {
  await updateLivePreviewExamples();
  await prisma.$disconnect();
}

main().catch(console.error);
