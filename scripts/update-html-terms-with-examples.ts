import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const htmlTermsExamples = {
  html: {
    snippet: `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Mi Primera Página</title>
  </head>
  <body>
    <h1>¡Hola Mundo!</h1>
    <p>Este es el contenido visible.</p>
  </body>
</html>`,
  },
  head: {
    snippet: `<head>
  <!-- Configuración de caracteres -->
  <meta charset="UTF-8">
  
  <!-- Viewport para responsive -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Título de la página (aparece en la pestaña) -->
  <title>Mi Aplicación</title>
  
  <!-- Hojas de estilos -->
  <link rel="stylesheet" href="styles.css">
  
  <!-- Estilos inline -->
  <style>
    body { font-family: Arial, sans-serif; }
  </style>
  
  <!-- Scripts que cargan primero -->
  <script src="config.js"></script>
</head>`,
  },
  body: {
    snippet: `<body>
  <!-- Encabezado de la página -->
  <header>
    <nav>Menú de navegación</nav>
  </header>
  
  <!-- Contenido principal -->
  <main>
    <section>
      <article>
        <h1>Título del artículo</h1>
        <p>Contenido que el usuario ve...</p>
      </article>
    </section>
  </main>
  
  <!-- Pie de página -->
  <footer>
    <p>&copy; 2025 Mi Empresa</p>
  </footer>
  
  <!-- Scripts al final para mejor rendimiento -->
  <script src="app.js"></script>
</body>`,
  },
  base: {
    snippet: `<!-- Define URL base para todas las rutas relativas -->
<head>
  <!-- Sin base: rutas relativas dependen de la URL actual -->
  <base href="https://ejemplo.com/app/">
  
  <!-- Ahora /imagen.png se resuelve como -->
  <!-- https://ejemplo.com/app/imagen.png -->
</head>
<body>
  <!-- href relativo se resuelve con la URL base -->
  <a href="pagina.html">Mi Página</a>
  
  <!-- Imagen relativa -->
  <img src="logo.png" alt="Logo">
</body>`,
  },
  link: {
    snippet: `<head>
  <!-- Importar hoja de estilos externa -->
  <link rel="stylesheet" href="styles.css">
  
  <!-- Favicon (icono de la pestaña) -->
  <link rel="icon" href="favicon.ico">
  
  <!-- Precargar recursos críticos -->
  <link rel="preload" href="fonts/main.woff2" as="font" crossorigin>
  
  <!-- Prefetch para recursos que posiblemente se usen -->
  <link rel="prefetch" href="pagina-siguiente.html">
  
  <!-- Información del sitio web (RSS, etc) -->
  <link rel="alternate" type="application/rss+xml" href="feed.xml">
  
  <!-- Asociar con hoja de estilos alternativa -->
  <link rel="alternate stylesheet" href="dark.css" title="Tema Oscuro">
</head>`,
  },
  meta: {
    snippet: `<head>
  <!-- Codificación de caracteres -->
  <meta charset="UTF-8">
  
  <!-- Viewport para diseño responsive -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Descripción de la página (SEO) -->
  <meta name="description" content="Aprende HTML, CSS y JavaScript">
  
  <!-- Palabras clave (menos importante ahora) -->
  <meta name="keywords" content="html, css, javascript, desarrollo web">
  
  <!-- Autor de la página -->
  <meta name="author" content="Omar Hernández">
  
  <!-- Controlar caché -->
  <meta http-equiv="Cache-Control" content="no-cache">
  
  <!-- Color de la barra de direcciones en móviles -->
  <meta name="theme-color" content="#667eea">
  
  <!-- Open Graph para redes sociales -->
  <meta property="og:title" content="Mi Sitio Web">
  <meta property="og:description" content="Descripción para compartir">
  <meta property="og:image" content="imagen.jpg">
</head>`,
  },
  "style-element": {
    snippet: `<!DOCTYPE html>
<html>
<head>
  <!-- Estilos globales inline -->
  <style>
    /* Variables CSS */
    :root {
      --color-primary: #667eea;
      --spacing-unit: 1rem;
    }
    
    /* Reset y estilos base */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', sans-serif;
      color: #333;
      background-color: #f5f5f5;
    }
    
    /* Componente button -->
    button {
      background-color: var(--color-primary);
      color: white;
      padding: var(--spacing-unit);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    button:hover {
      background-color: #5568d3;
    }
    
    /* Media query para responsive -->
    @media (max-width: 768px) {
      body {
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <button>Click aquí</button>
</body>
</html>`,
  },
  title: {
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <!-- El título aparece en la pestaña del navegador -->
  <title>Mi Diccionario Dev - Aprende a Programar</title>
  
  <!-- El título también se usa en: -->
  <!-- 1. Resultados de Google (SEO) -->
  <!-- 2. Marcadores -->
  <!-- 3. Historial del navegador -->
  <!-- 4. Cuando compartes en redes sociales (si no hay og:title) -->
</head>
<body>
  <h1>Este es un encabezado dentro de la página</h1>
  <p>Nota: el &lt;title&gt; NO aparece en la página, solo en la pestaña</p>
</body>
</html>`,
  },
  script: {
    snippet: `<!DOCTYPE html>
<html>
<head>
  <!-- Script en el head: se carga antes que el contenido -->
  <script src="config.js"></script>
  
  <!-- Script inline en el head -->
  <script>
    console.log('Este script corre apenas carga la página');
  </script>
</head>
<body>
  <h1>Contenido</h1>
  <button id="btn">Click</button>
  
  <!-- Script al final del body: mejor para rendimiento -->
  <script src="app.js"></script>
  
  <!-- Script inline que accede a elementos del DOM -->
  <script>
    const button = document.getElementById('btn');
    button.addEventListener('click', () => {
      alert('¡Botón clickeado!');
    });
  </script>
</body>
</html>`,
  },
  noscript: {
    snippet: `<!DOCTYPE html>
<html>
<head>
  <title>Mi App</title>
  <style>
    .js-warning { display: none; color: red; }
  </style>
</head>
<body>
  <!-- Este contenido se muestra si JavaScript está deshabilitado -->
  <noscript>
    <div class="js-warning">
      <h1>⚠️ JavaScript Deshabilitado</h1>
      <p>Esta aplicación requiere JavaScript para funcionar correctamente.</p>
      <p>Por favor, habilita JavaScript en tu navegador.</p>
    </div>
  </noscript>
  
  <!-- Contenido normal que depende de JavaScript -->
  <div id="app">
    <p>Cargando aplicación...</p>
  </div>
  
  <script src="app.js"></script>
</body>
</html>`,
  },
  template: {
    snippet: `<!DOCTYPE html>
<html>
<head>
  <title>Template Demo</title>
</head>
<body>
  <!-- El contenido del template NO se renderiza hasta que se clona -->
  <template id="card-template">
    <div class="card">
      <img class="card-image" src="" alt="">
      <h3 class="card-title"></h3>
      <p class="card-description"></p>
      <button class="card-button">Ver más</button>
    </div>
  </template>
  
  <!-- Contenedor donde inyectaremos las tarjetas -->
  <div id="cards-container"></div>
  
  <script>
    const template = document.getElementById('card-template');
    const data = [
      { title: 'Card 1', description: 'Contenido 1', image: 'img1.jpg' },
      { title: 'Card 2', description: 'Contenido 2', image: 'img2.jpg' },
    ];
    
    data.forEach(item => {
      // Clonar el template
      const clone = template.content.cloneNode(true);
      
      // Rellenar datos
      clone.querySelector('.card-title').textContent = item.title;
      clone.querySelector('.card-description').textContent = item.description;
      clone.querySelector('.card-image').src = item.image;
      
      // Insertar en el DOM
      document.getElementById('cards-container').appendChild(clone);
    });
  </script>
</body>
</html>`,
  },
  slot: {
    snippet: `<!-- archivo: my-component.js (Web Component) -->
class MyCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    this.shadowRoot.innerHTML = \`
      <style>
        .card { border: 1px solid #ccc; padding: 1rem; }
        .header { font-weight: bold; }
      </style>
      
      <div class="card">
        <!-- El slot "header" acepta contenido del usuario -->
        <div class="header">
          <slot name="header">Título por defecto</slot>
        </div>
        
        <!-- El slot sin nombre acepta contenido por defecto -->
        <div class="content">
          <slot>Contenido por defecto</slot>
        </div>
        
        <!-- El slot "footer" acepta pie de página -->
        <div class="footer">
          <slot name="footer"></slot>
        </div>
      </div>
    \`;
  }
}

customElements.define('my-card', MyCard);

// Uso:
// <my-card>
//   <div slot="header">Mi Título</div>
//   <p>Mi contenido personalizado</p>
//   <div slot="footer">Pie de página</div>
// </my-card>`,
  },
};

async function updateHtmlTermsWithExamples() {
  try {
    console.log(
      "📝 Actualizando términos HTML con ejemplos de código detallados...\n"
    );

    for (const [termName, data] of Object.entries(htmlTermsExamples)) {
      try {
        // Buscar el término
        const term = await prisma.term.findUnique({
          where: { term: termName },
          include: { variants: true },
        });

        if (!term) {
          console.log(`⚠️  Término no encontrado: ${termName}`);
          continue;
        }

        // Actualizar o crear la variante HTML
        if (term.variants.length > 0) {
          // Actualizar la variante existente
          await prisma.termVariant.update({
            where: { id: term.variants[0].id },
            data: {
              snippet: data.snippet,
            },
          });
        } else {
          // Crear nueva variante si no existe
          await prisma.termVariant.create({
            data: {
              termId: term.id,
              language: "html",
              snippet: data.snippet,
              level: "intermediate",
              status: "approved",
            },
          });
        }

        console.log(`✅ ${termName}: código actualizado (${data.snippet.split('\n').length} líneas)`);
      } catch (error) {
        console.error(`❌ Error procesando ${termName}:`, error);
      }
    }

    console.log(
      "\n✨ Todos los términos HTML han sido actualizados con ejemplos detallados"
    );

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateHtmlTermsWithExamples();
