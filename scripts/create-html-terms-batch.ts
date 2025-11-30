import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TermData {
  term: string;
  meaning: string;
  what: string;
  how: string;
  snippet: string;
}

const newHtmlTerms: TermData[] = [
  {
    term: "main",
    meaning: "La etiqueta <main> define el contenido principal de un documento HTML. Representa el contenido central y único de la página, excluyendo barras laterales, navegación y otros elementos secundarios. Solo debe haber una etiqueta <main> por documento.",
    what: "Se utiliza para estructurar semánticamente el contenido principal de la página, mejorando la accesibilidad y el SEO. Ayuda a los lectores de pantalla y motores de búsqueda a identificar el contenido más importante.",
    how: "Envuelve el contenido principal de tu página con la etiqueta <main>. Coloca dentro todos los artículos, secciones y contenido que representa el propósito central de la página. Usa una sola etiqueta <main> por documento.",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mi Página</title>
</head>
<body>
  <header><h1>Mi Sitio Web</h1></header>
  <nav><a href="#">Inicio</a></nav>
  
  <main>
    <article>
      <h2>Artículo Principal</h2>
      <p>Este es el contenido principal de la página.</p>
    </article>
  </main>
  
  <footer><p>&copy; 2025</p></footer>
</body>
</html>`
  },
  {
    term: "section",
    meaning: "La etiqueta <section> define una sección temática genérica dentro de un documento HTML. Agrupa contenido relacionado temáticamente que forma una unidad lógica dentro de la página. Es más específica que <div> pero menos que <article>.",
    what: "Se usa para organizar el contenido en secciones temáticas, mejorando la estructura semántica. Facilita la navegación y comprensión del documento, especialmente para tecnologías asistivas.",
    how: "Divide tu contenido en secciones temáticas usando <section>. Cada sección debe tratar un tema específico. Generalmente cada sección tiene un encabezado (<h1>-<h6>) que describe su contenido.",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Secciones</title>
</head>
<body>
  <section>
    <h2>Introducción</h2>
    <p>Contenido introductorio aquí.</p>
  </section>
  
  <section>
    <h2>Desarrollo</h2>
    <p>Contenido del desarrollo aquí.</p>
  </section>
  
  <section>
    <h2>Conclusión</h2>
    <p>Contenido de conclusión aquí.</p>
  </section>
</body>
</html>`
  },
  {
    term: "article",
    meaning: "La etiqueta <article> representa contenido independiente que podría distribuirse o reutilizarse de forma autónoma. Puede ser un artículo de blog, un comentario de foro, una tarjeta de producto o cualquier contenido que forme una unidad completa e independiente.",
    what: "Se utiliza para marcar contenido que es autocontenenido y podría existir por sí mismo. Mejora la semántica del documento y ayuda a distinguir el contenido principal de otros elementos.",
    how: "Usa <article> cuando tengas contenido que podría publicarse independientemente. Generalmente incluye título, fecha, autor y el contenido. Puedes anidar múltiples <article> dentro de una página.",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Blog</title>
</head>
<body>
  <article>
    <h2>Mi Primer Post</h2>
    <p>Autor: Juan</p>
    <p>Fecha: 29 de noviembre de 2025</p>
    <p>Este es el contenido del artículo que puede ser reutilizado independientemente.</p>
  </article>
</body>
</html>`
  },
  {
    term: "aside",
    meaning: "La etiqueta <aside> define contenido tangencialmente relacionado con el contenido principal. Típicamente se usa para barras laterales, publicidad, enlaces relacionados, o información complementaria que no es central al contenido principal.",
    what: "Se utiliza para contenido secundario como barras laterales, widgets o información complementaria. Mejora la estructura semántica al distinguir contenido auxiliar del contenido principal.",
    how: "Coloca contenido secundario dentro de <aside>. Típicamente aparece como barra lateral. Puede contener enlaces relacionados, publicidad, definiciones o información adicional que complementa el contenido principal.",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Artículo con Sidebar</title>
</head>
<body>
  <article>
    <h2>Artículo Principal</h2>
    <p>Contenido del artículo aquí.</p>
  </article>
  
  <aside>
    <h3>Artículos Relacionados</h3>
    <ul>
      <li><a href="#">Link 1</a></li>
      <li><a href="#">Link 2</a></li>
      <li><a href="#">Link 3</a></li>
    </ul>
  </aside>
</body>
</html>`
  },
  {
    term: "nav",
    meaning: "La etiqueta <nav> define una sección de navegación que contiene enlaces principales del sitio. Es un contenedor para menús de navegación, tablas de contenido, índices o cualquier conjunto de enlaces de navegación importantes.",
    what: "Se utiliza para agrupar enlaces de navegación, mejorando la estructura semántica. Permite que lectores de pantalla y motores de búsqueda identifiquen fácilmente la navegación principal.",
    how: "Coloca los enlaces de navegación principales dentro de <nav>. Generalmente contiene una lista de enlaces (<ul> o <ol>). Puedes tener múltiples <nav> en una página si hay diferentes secciones de navegación.",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Navegación</title>
</head>
<body>
  <nav>
    <ul>
      <li><a href="/">Inicio</a></li>
      <li><a href="/about">Acerca de</a></li>
      <li><a href="/services">Servicios</a></li>
      <li><a href="/contact">Contacto</a></li>
    </ul>
  </nav>
  
  <main>
    <h1>Bienvenido</h1>
  </main>
</body>
</html>`
  },
  {
    term: "header",
    meaning: "La etiqueta <header> define un encabezado para un documento o sección. Típicamente contiene logo, título del sitio, lema, formularios de búsqueda y navegación. Representa el contenido introductorio de una página o sección.",
    what: "Se utiliza para agrupar contenido de encabezado como logo, título y navegación. Mejora la accesibilidad y semántica del documento, permitiendo que los usuarios identifiquen rápidamente el encabezado de la página.",
    how: "Coloca contenido de encabezado como logo, título y navegación dentro de <header>. Generalmente aparece al principio de la página o de una sección. Puede contener <nav>, títulos, búsqueda y otros elementos de encabezado.",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Sitio Web</title>
</head>
<body>
  <header>
    <h1>Mi Empresa</h1>
    <p>Soluciones innovadoras</p>
    <nav>
      <a href="/">Inicio</a>
      <a href="/about">Acerca de</a>
      <a href="/contact">Contacto</a>
    </nav>
  </header>
  
  <main>
    <h2>Contenido</h2>
  </main>
</body>
</html>`
  },
  {
    term: "footer",
    meaning: "La etiqueta <footer> define un pie de página para un documento o sección. Típicamente contiene información de autor, copyright, enlaces relacionados, términos de servicio o información de contacto. Aparece al final del contenido.",
    what: "Se utiliza para pie de página con información de copyright, enlaces relacionados y datos de contacto. Ayuda a estructurar semánticamente el final del documento y proporciona información de cierre importante.",
    how: "Coloca contenido de pie de página como copyright, enlaces legales y contacto dentro de <footer>. Generalmente aparece al final de la página. Puede contener información del autor, enlaces relacionados y datos de contacto.",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Sitio Web</title>
</head>
<body>
  <main>
    <h1>Contenido</h1>
  </main>
  
  <footer>
    <p>&copy; 2025 Mi Empresa. Todos los derechos reservados.</p>
    <nav>
      <a href="/privacy">Privacidad</a>
      <a href="/terms">Términos</a>
      <a href="/contact">Contacto</a>
    </nav>
  </footer>
</body>
</html>`
  },
  {
    term: "address",
    meaning: "La etiqueta <address> define información de contacto del autor o propietario del documento. Contiene dirección, teléfono, email u otra información de contacto. Se usa específicamente para datos de contacto, no para direcciones postales genéricas.",
    what: "Se utiliza para marcar información de contacto, permitiendo que navegadores y tecnologías asistivas la identifiquen correctamente. Facilita que usuarios encuentren cómo contactar con el propietario de la página.",
    how: "Coloca información de contacto dentro de <address>. Puede incluir dirección, teléfono, email o enlaces de contacto. Generalmente aparece en el <footer> o cerca de información del autor.",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Contacto</title>
</head>
<body>
  <footer>
    <address>
      <strong>Mi Empresa</strong><br>
      Calle Principal 123<br>
      Ciudad, País 12345<br>
      Teléfono: +1 234 567 8900<br>
      Email: <a href="mailto:info@example.com">info@example.com</a>
    </address>
  </footer>
</body>
</html>`
  },
  {
    term: "h1",
    meaning: "La etiqueta <h1> define el encabezado de nivel 1 (el más importante) en HTML. Representa el título principal o asunto más importante de la página. Solo debe haber un <h1> por página para mantener una jerarquía semántica clara.",
    what: "Se utiliza para el título principal de la página, mejorando el SEO y la accesibilidad. Los motores de búsqueda dan mucha importancia al contenido del <h1>, así que debe ser descriptivo y relevante.",
    how: "Coloca el título principal de la página dentro de <h1>. Debe ser único y descriptivo. Generalmente aparece cerca del principio de la página. Solo usa un <h1> por página para mantener la estructura semántica.",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mi Página</title>
</head>
<body>
  <h1>Bienvenido a Mi Sitio Web</h1>
  <h2>Subtítulo</h2>
  <p>Contenido aquí...</p>
</body>
</html>`
  },
  {
    term: "h2",
    meaning: "La etiqueta <h2> define un encabezado de nivel 2. Se usa para subtítulos principales o divisiones importantes dentro de la página. Es jerárquicamente inferior a <h1> pero superior a <h3>. Ayuda a estructurar el contenido en secciones.",
    what: "Se utiliza para subtítulos principales y divisiones de contenido importantes. Mejora la estructura del documento y facilita la lectura y navegación del contenido.",
    how: "Usa <h2> para subtítulos principales y encabezados de secciones importantes. Generalmente la página tiene varios <h2>. Mantén una jerarquía clara: <h1> para título principal, <h2> para subtítulos.",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Estructura de Encabezados</title>
</head>
<body>
  <h1>Título Principal</h1>
  
  <h2>Primera Sección</h2>
  <p>Contenido de la primera sección.</p>
  
  <h2>Segunda Sección</h2>
  <p>Contenido de la segunda sección.</p>
</body>
</html>`
  },
  {
    term: "h3",
    meaning: "La etiqueta <h3> define un encabezado de nivel 3. Se usa para subsecciones dentro de secciones <h2>. Es jerárquicamente inferior a <h2> pero superior a <h4>. Ayuda a crear estructura detallada del contenido.",
    what: "Se utiliza para encabezados de subsecciones y subdivisiones del contenido. Completa la estructura jerárquica del documento al proporcionar divisiones más detalladas.",
    how: "Usa <h3> para encabezados de subsecciones dentro de <h2>. Mantén la jerarquía: <h1> > <h2> > <h3>. No saltes niveles de encabezados (no uses <h3> directamente después de <h1>).",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Jerarquía de Encabezados</title>
</head>
<body>
  <h1>Guía de HTML</h1>
  
  <h2>Etiquetas Semánticas</h2>
  <h3>¿Qué son?</h3>
  <p>Son etiquetas que dan significado al contenido.</p>
  
  <h3>Beneficios</h3>
  <p>Mejoran SEO y accesibilidad.</p>
</body>
</html>`
  },
  {
    term: "h4",
    meaning: "La etiqueta <h4> define un encabezado de nivel 4. Se usa para divisiones menores dentro de secciones <h3>. Es jerárquicamente inferior a <h3>. Proporciona niveles adicionales de estructura para contenido complejo.",
    what: "Se utiliza para encabezados de nivel más bajo, permitiendo una estructura más detallada. Útil para documentos con mucho contenido que necesita estructura profunda.",
    how: "Usa <h4> para subdivisiones dentro de <h3>. Respeta la jerarquía: no saltes niveles. Generalmente indica contenido menos importante que <h1>, <h2> y <h3>.",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Estructura Profunda</title>
</head>
<body>
  <h1>Documentación</h1>
  <h2>Sección Principal</h2>
  <h3>Subsección</h3>
  <h4>Detalle Importante</h4>
  <p>Información detallada.</p>
</body>
</html>`
  },
  {
    term: "h5",
    meaning: "La etiqueta <h5> define un encabezado de nivel 5. Se usa para divisiones muy menores. Es jerárquicamente inferior a <h4>. Proporciona niveles adicionales de estructura para contenido muy detallado.",
    what: "Se utiliza para encabezados de menor importancia en documentos con estructura muy profunda. Menos común que <h1>-<h3>.",
    how: "Usa <h5> para subsecciones menores dentro de <h4>. Mantén la jerarquía clara y consistente. Es menos frecuente que otros niveles de encabezados.",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Niveles de Encabezados</title>
</head>
<body>
  <h1>Nivel 1</h1>
  <h2>Nivel 2</h2>
  <h3>Nivel 3</h3>
  <h4>Nivel 4</h4>
  <h5>Nivel 5</h5>
  <p>Contenido con estructura profunda.</p>
</body>
</html>`
  },
  {
    term: "h6",
    meaning: "La etiqueta <h6> define un encabezado de nivel 6 (el más bajo). Es el nivel jerárquicamente más bajo de encabezados. Se usa para divisiones menores en documentos con estructura muy profunda.",
    what: "Se utiliza para el nivel más bajo de encabezados. Raramente se usa en práctica, pero está disponible para documentos que necesitan estructura muy detallada.",
    how: "Usa <h6> para el nivel más bajo de subsecciones. Respeta la jerarquía completa. En la mayoría de páginas web, <h6> rara vez se necesita.",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Todos los Niveles</title>
</head>
<body>
  <h1>Nivel 1: Título Principal</h1>
  <h2>Nivel 2: Sección</h2>
  <h3>Nivel 3: Subsección</h3>
  <h4>Nivel 4: Apartado</h4>
  <h5>Nivel 5: Detalle</h5>
  <h6>Nivel 6: Subdetalle</h6>
  <p>Jerarquía completa de encabezados.</p>
</body>
</html>`
  },
  {
    term: "div",
    meaning: "La etiqueta <div> es un contenedor genérico para agrupar contenido. No tiene significado semántico específico; es un simple bloque divisor. Se usa comúnmente para aplicar estilos CSS o estructura de diseño.",
    what: "Se utiliza como contenedor genérico cuando no hay etiqueta semántica más específica disponible. Es útil para agregar estilos CSS, crear layouts y organizar contenido visualmente.",
    how: "Usa <div> cuando necesites un contenedor genérico para aplicar estilos o estructura. Preferiblemente usa etiquetas semánticas específicas (<section>, <article>, <nav>) cuando sea posible.",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Contenedores</title>
  <style>
    .container { max-width: 1200px; margin: 0 auto; }
    .row { display: flex; gap: 20px; }
    .column { flex: 1; }
  </style>
</head>
<body>
  <div class="container">
    <div class="row">
      <div class="column">Columna 1</div>
      <div class="column">Columna 2</div>
    </div>
  </div>
</body>
</html>`
  },
  {
    term: "span",
    meaning: "La etiqueta <span> es un contenedor genérico inline (dentro de línea) para envolver texto o elementos. No tiene significado semántico específico. Se usa comúnmente para aplicar estilos CSS a partes específicas del texto.",
    what: "Se utiliza para envolver porciones de texto inline cuando necesitas aplicar estilos específicos. Es la versión inline de <div>.",
    how: "Usa <span> cuando necesites aplicar estilos a partes específicas del texto. Ejemplo: colorear palabras, resaltar o aplicar formatos especiales a secciones de texto.",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Span Styling</title>
  <style>
    .highlight { background-color: yellow; }
    .error { color: red; }
    .success { color: green; }
  </style>
</head>
<body>
  <p>Este es un texto normal con <span class="highlight">texto resaltado</span>.</p>
  <p>También puedes tener <span class="error">errores</span> y <span class="success">éxitos</span>.</p>
</body>
</html>`
  },
  {
    term: "p",
    meaning: "La etiqueta <p> define un párrafo de texto. Es el elemento básico para agrupar texto relacionado. Cada <p> representa un párrafo independiente con saltos de línea automáticos antes y después.",
    what: "Se utiliza para definir párrafos de texto. Es esencial para la estructura de contenido legible. Mejora la semántica al indicar divisiones de pensamiento en el texto.",
    how: "Envuelve bloques de texto relacionados en etiquetas <p>. Cada párrafo debe tratar un tema o idea coherente. No uses <p> solo para añadir espacio; usa CSS para márgenes.",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Párrafos</title>
</head>
<body>
  <h1>Artículo</h1>
  
  <p>Este es el primer párrafo que introduce el tema y proporciona contexto al lector.</p>
  
  <p>El segundo párrafo continúa con la argumentación y proporciona más detalles.</p>
  
  <p>El tercero resume y concluye los puntos principales del artículo.</p>
</body>
</html>`
  },
  {
    term: "hr",
    meaning: "La etiqueta <hr> representa una ruptura temática horizontal. Crea una línea divisoria visual que indica un cambio de tema o sección. Es un elemento vacío que no requiere etiqueta de cierre.",
    what: "Se utiliza para separar visualmente secciones temáticas diferentes. Indica al lector que hay un cambio de tema o una transición importante.",
    how: "Usa <hr> entre secciones temáticas para crear separación visual. Es útil para dividir contenido en bloques lógicamente independientes. Personaliza su apariencia con CSS.",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Separadores</title>
  <style>
    hr { 
      border: none; 
      border-top: 2px solid #333; 
      margin: 30px 0; 
    }
  </style>
</head>
<body>
  <h2>Sección 1</h2>
  <p>Contenido de la sección 1.</p>
  
  <hr>
  
  <h2>Sección 2</h2>
  <p>Contenido de la sección 2.</p>
</body>
</html>`
  },
  {
    term: "br",
    meaning: "La etiqueta <br> crea un salto de línea. Fuerza que el contenido siguiente comience en una nueva línea sin crear un nuevo párrafo. Es un elemento vacío usado principalmente para direcciones, poesía o texto donde el salto de línea es significativo.",
    what: "Se utiliza para crear saltos de línea dentro del contenido. Diferente de <p>, no crea espacios adicionales. Útil para formatos donde el salto de línea es importante.",
    how: "Usa <br> cuando necesites saltos de línea dentro del contenido (direcciones, poesía). No uses <br> múltiples para crear espacios; usa CSS para márgenes.",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Saltos de Línea</title>
</head>
<body>
  <address>
    Juan García<br>
    Calle Principal 123<br>
    Ciudad, País 12345<br>
    Teléfono: +1 234 567 8900
  </address>
  
  <p>
    Roses are red,<br>
    Violets are blue,<br>
    HTML is fun,<br>
    And CSS too!
  </p>
</body>
</html>`
  },
  {
    term: "pre",
    meaning: "La etiqueta <pre> define texto preformateado. Preserva exactamente el espaciado, saltos de línea y tabulaciones del contenido. Es útil para mostrar código, poesía o texto donde el formato es importante.",
    what: "Se utiliza para mostrar texto que requiere formato específico. El espaciado y saltos de línea se preservan exactamente como se escriben. Generalmente se usa con <code> para mostrar código.",
    how: "Usa <pre> cuando necesites preservar espaciado exacto. Combinalo con <code> para mostrar bloques de código. El texto en <pre> generalmente aparece en monoespaciado.",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Preformateado</title>
</head>
<body>
  <h2>Código ASCII Art</h2>
  <pre>
    ___
   (o o)
   ( = )
   /|   |\\
    |   |
  </pre>
  
  <h2>Código de Ejemplo</h2>
  <pre><code>
function hello() {
  console.log("Hola Mundo");
}
  </code></pre>
</body>
</html>`
  },
  {
    term: "blockquote",
    meaning: "La etiqueta <blockquote> define una cita larga o bloque de cita. Indica que el contenido es una cita de otra fuente. Los navegadores generalmente sangran el contenido para distinguirlo visualmente.",
    what: "Se utiliza para marcar citas largas de otras fuentes. Mejora la semántica al indicar que el contenido es citado de otro lugar. Importante para mantener integridad intelectual.",
    how: "Envuelve citas largas en <blockquote>. Usa el atributo 'cite' para indicar la fuente. Para citas cortas usa <q>. Generalmente va acompañada de información sobre la fuente.",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Citas</title>
</head>
<body>
  <h2>Inspiración</h2>
  
  <blockquote cite="https://example.com">
    <p>La calidad no es un acto, es un hábito.</p>
    <footer>— Aristóteles</footer>
  </blockquote>
  
  <p>Esta cita nos recuerda la importancia de la consistencia.</p>
</body>
</html>`
  },
  {
    term: "figure",
    meaning: "La etiqueta <figure> agrupa contenido que se autoexplica (imágenes, diagramas, código, etc.) que generalmente se referencia desde el texto principal. Es un contenedor semántico para contenido visual o ilustrativo.",
    what: "Se utiliza para agrupar ilustraciones, diagramas e imágenes con su descripción. Mejora la semántica al asociar visualmente contenido relacionado. Generalmente acompaña de <figcaption>.",
    how: "Usa <figure> para envolver imágenes, diagramas o contenido ilustrativo junto con su descripción. Combina con <figcaption> para proporcionar título o descripción. Puede incluirse en el flujo del documento.",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Figuras</title>
</head>
<body>
  <h1>Galería</h1>
  
  <figure>
    <img src="imagen.jpg" alt="Puesta de sol en la playa" width="400">
    <figcaption>Una hermosa puesta de sol sobre el océano</figcaption>
  </figure>
  
  <p>Las puestas de sol son uno de los espectáculos naturales más bellos.</p>
</body>
</html>`
  },
  {
    term: "figcaption",
    meaning: "La etiqueta <figcaption> proporciona un título o descripción para el contenido de una etiqueta <figure>. Es la leyenda o explicación de la figura. Debe estar dentro de <figure>.",
    what: "Se utiliza para describir o proporcionar título a figuras. Asocia el texto descriptivo con la imagen o diagrama de forma semántica. Mejora la accesibilidad.",
    how: "Coloca <figcaption> dentro de <figure> como primer o último elemento. Proporciona descripción clara y concisa de la figura. Mejora SEO y accesibilidad de imágenes.",
    snippet: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Figuras con Captions</title>
</head>
<body>
  <figure>
    <img src="diagrama.png" alt="Ciclo del Agua">
    <figcaption>Figura 1: El ciclo hidrológico del agua en la naturaleza</figcaption>
  </figure>
  
  <figure>
    <code>
      function saludar() {
        console.log("¡Hola!");
      }
    </code>
    <figcaption>Código: Función simple de saludo</figcaption>
  </figure>
</body>
</html>`
  }
];

async function createNewHtmlTerms() {
  try {
    console.log("🔧 Creando 20 nuevos términos HTML...\n");

    for (const termData of newHtmlTerms) {
      // Crear el término base
      const term = await prisma.term.create({
        data: {
          term: termData.term,
          translation: `Etiqueta HTML: <${termData.term}>`,
          meaning: termData.meaning,
          what: termData.what,
          how: termData.how,
          category: "frontend",
          examples: [
            {
              code: termData.snippet,
              title: `Ejemplo de ${termData.term}`,
              language: "html",
              explanation: `Demostración completa de cómo usar la etiqueta <${termData.term}>`
            }
          ]
        }
      });

      // Crear la variante (código)
      await prisma.termVariant.create({
        data: {
          termId: term.id,
          language: "html",
          snippet: termData.snippet,
          level: "intermediate",
          status: "approved"
        }
      });

      // Crear 3 use cases
      await prisma.useCase.createMany({
        data: [
          {
            termId: term.id,
            context: "project",
            summary: `Usar <${termData.term}> en un proyecto real`,
            steps: [
              `Identificar dónde necesitas la etiqueta <${termData.term}>`,
              `Implementar según la estructura del documento`,
              `Probar en diferentes navegadores`,
              `Validar que sea semánticamente correcto`
            ],
            tips: "Asegúrate de usar etiquetas semánticas correctas para mejor accesibilidad"
          },
          {
            termId: term.id,
            context: "interview",
            summary: `Explicar <${termData.term}> en una entrevista`,
            steps: [
              `Explica qué es la etiqueta <${termData.term}>`,
              `Describe cuándo usarla`,
              `Proporciona un ejemplo práctico`,
              `Menciona el impacto en SEO y accesibilidad`
            ],
            tips: "Sé claro sobre la diferencia con etiquetas similares"
          },
          {
            termId: term.id,
            context: "bug",
            summary: `Debuggear problemas con <${termData.term}>`,
            steps: [
              `Verifica que la etiqueta esté correctamente anidada`,
              `Inspecciona con DevTools`,
              `Valida el HTML en W3C`,
              `Prueba con lectores de pantalla`
            ],
            tips: "Usa el Inspector de Elementos para verificar la estructura"
          }
        ]
      });

      // Crear 3+ FAQs
      await prisma.faq.createMany({
        data: [
          {
            termId: term.id,
            questionEs: `¿Cuándo debo usar <${termData.term}>?`,
            answerEs: `Debes usar <${termData.term}> cuando ${termData.what.toLowerCase().substring(0, 100)}...`,
            snippet: null
          },
          {
            termId: term.id,
            questionEs: `¿Cómo implemento <${termData.term}> correctamente?`,
            answerEs: `Para implementar <${termData.term}> correctamente: ${termData.how.substring(0, 100)}...`,
            snippet: termData.snippet.substring(0, 200)
          },
          {
            termId: term.id,
            questionEs: `¿Afecta <${termData.term}> el SEO?`,
            answerEs: `Sí, el uso correcto de <${termData.term}> mejora el SEO y la accesibilidad del sitio. Los motores de búsqueda valoran la estructura semántica correcta.`,
            snippet: null
          }
        ]
      });

      // Crear 1 ejercicio
      await prisma.exercise.create({
        data: {
          termId: term.id,
          titleEs: `Práctica con <${termData.term}>`,
          promptEs: `Crea un documento HTML que use correctamente la etiqueta <${termData.term}>. Asegúrate de que sea semánticamente correcto.`,
          difficulty: "medium",
          solutions: [
            {
              title: "Solución básica",
              code: termData.snippet,
              explanation: `Este código muestra el uso correcto de <${termData.term}> en contexto.`
            }
          ]
        }
      });

      console.log(`✅ ${termData.term}: Creado con todos los 8 puntos`);
    }

    console.log(`\n🎉 Se han creado exitosamente 20 nuevos términos HTML`);
    console.log(`✅ Cada término tiene: meaning, what, how, useCase(3), variants, examples, faqs(3), exercises`);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createNewHtmlTerms();
