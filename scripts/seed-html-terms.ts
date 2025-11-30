import { PrismaClient, Category, Language, SkillLevel, ReviewStatus, UseCaseContext, Difficulty } from "@prisma/client";

const prisma = new PrismaClient();

const htmlTerms = [
  {
    term: "html",
    translation: "lenguaje de marcado para estructura web",
    category: "frontend" as Category,
    titleEs: "HyperText Markup Language",
    titleEn: "HyperText Markup Language",
    aliases: ["HTML5", "markup language", "documento HTML"],
    tags: ["html", "markup", "web", "structure", "semantics"],
    meaningEs:
      "En programación \"html\" se refiere a HyperText Markup Language: lenguaje de marcado usado para crear la estructura y contenido semántico de páginas web mediante etiquetas que definen elementos como párrafos, encabezados, listas e imágenes.",
    meaningEn:
      "HyperText Markup Language: a markup language used to structure and semantically define web page content using tags that define elements like paragraphs, headings, lists, and images.",
    whatEs:
      "Se usa para definir la estructura semántica de documentos web, organizando contenido en elementos reutilizables que facilitan la accesibilidad, el SEO y la mantenibilidad del código.",
    whatEn:
      "It defines the semantic structure of web documents, organizing content into reusable elements that improve accessibility, SEO, and code maintainability.",
    howEs:
      "Declara elementos HTML anidando etiquetas de apertura y cierre; usa atributos para añadir propiedades y siempre incluye doctype, html, head y body como estructura base.",
    howEn:
      "Declare HTML elements by nesting opening and closing tags; use attributes to add properties and always include doctype, html, head and body as the base structure.",
    examples: [
      {
        title: "Documento HTML básico",
        code: "<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Mi Página</title>\n</head>\n<body>\n  <h1>Bienvenido</h1>\n  <p>Este es mi primer sitio web.</p>\n</body>\n</html>",
        language: "html",
        explanation: "Estructura mínima de un documento HTML válido con DOCTYPE, metadatos y contenido base.",
      },
    ],
  },
  {
    term: "head",
    translation: "sección de metadatos del documento",
    category: "frontend" as Category,
    titleEs: "Elemento HEAD",
    titleEn: "HEAD Element",
    aliases: ["document head", "metadata section"],
    tags: ["html", "metadata", "seo", "document"],
    meaningEs:
      "En programación \"head\" se refiere al elemento HTML que contiene metadatos del documento: título, vinculaciones a hojas de estilo, scripts, y otros datos que describen el documento pero no se muestran directamente en la página.",
    meaningEn:
      "The HTML element that contains document metadata: title, style sheets, scripts, and other data that describes the document but is not directly displayed on the page.",
    whatEs:
      "Se usa para almacenar información del documento como título de página, codificación de caracteres, descripción, palabras clave y referencias a CSS, fuentes y scripts.",
    whatEn:
      "It stores document information like page title, character encoding, description, keywords and references to CSS, fonts and scripts.",
    howEs:
      "Coloca todas las etiquetas meta, link, style y script dentro del elemento <head>, antes del <body>; siempre incluye <meta charset> y <title>.",
    howEn:
      "Place all meta, link, style and script tags inside the <head> element, before <body>; always include <meta charset> and <title>.",
    examples: [
      {
        title: "HEAD con metadatos completos",
        code: "<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <meta name=\"description\" content=\"Descripción de la página\">\n  <title>Mi Sitio Web</title>\n  <link rel=\"stylesheet\" href=\"styles.css\">\n  <script src=\"app.js\" defer></script>\n</head>",
        language: "html",
        explanation: "Elemento HEAD con metadatos esenciales, título, CSS y script.",
      },
    ],
  },
  {
    term: "body",
    translation: "contenido visible del documento",
    category: "frontend" as Category,
    titleEs: "Elemento BODY",
    titleEn: "BODY Element",
    aliases: ["document body", "content section"],
    tags: ["html", "content", "document", "structure"],
    meaningEs:
      "En programación \"body\" se refiere al elemento HTML que contiene todo el contenido visible de la página: texto, imágenes, formularios, enlaces y elementos interactivos que el usuario ve en el navegador.",
    meaningEn:
      "The HTML element that contains all visible page content: text, images, forms, links and interactive elements that users see in the browser.",
    whatEs:
      "Se usa para envolver todo el contenido que debe mostrarse al usuario, permitiendo aplicar estilos globales y scripts que manipulen el contenido visible.",
    whatEn:
      "It wraps all content that should be displayed to users, allowing global styles and scripts that manipulate visible content.",
    howEs:
      "Coloca todos los elementos de contenido dentro del <body> después del </head>; organiza el contenido usando estructura semántica con header, main, section, article, footer.",
    howEn:
      "Place all content elements inside <body> after </head>; organize content using semantic structure with header, main, section, article, footer.",
    examples: [
      {
        title: "BODY con estructura semántica",
        code: "<body>\n  <header>\n    <nav>Navegación</nav>\n  </header>\n  <main>\n    <section>\n      <article>\n        <h1>Título del artículo</h1>\n        <p>Contenido...</p>\n      </article>\n    </section>\n  </main>\n  <footer>\n    <p>&copy; 2025</p>\n  </footer>\n</body>",
        language: "html",
        explanation: "Estructura semántica completa del body con header, main, section, article y footer.",
      },
    ],
  },
  {
    term: "base",
    translation: "URL base para enlaces relativos",
    category: "frontend" as Category,
    titleEs: "Elemento BASE",
    titleEn: "BASE Element",
    aliases: ["base URL", "base element", "relative links"],
    tags: ["html", "url", "links", "seo"],
    meaningEs:
      "En programación \"base\" se refiere al elemento HTML que especifica una URL base para todos los enlaces relativos de la página, permitiendo que el navegador resuelva correctamente rutas relativas.",
    meaningEn:
      "The HTML element that specifies a base URL for all relative links on the page, allowing the browser to correctly resolve relative paths.",
    whatEs:
      "Se usa para definir un URL base único para toda la página, útil cuando los archivos están en subdirectorios o cuando necesitas cambiar la raíz de referencias sin modificar cada enlace.",
    whatEn:
      "It defines a single base URL for the entire page, useful when files are in subdirectories or when you need to change the root of references without modifying each link.",
    howEs:
      "Incluye la etiqueta <base href=\"URL\"> en el <head> antes de otros enlaces; todas las rutas relativas se resolverán respecto a esta URL base.",
    howEn:
      "Include <base href=\"URL\"> tag in <head> before other links; all relative paths will be resolved relative to this base URL.",
    examples: [
      {
        title: "BASE especificando URL raíz",
        code: "<head>\n  <base href=\"https://ejemplo.com/app/\">\n</head>\n<body>\n  <a href=\"pagina.html\">Página</a> <!-- Resuelto a https://ejemplo.com/app/pagina.html -->\n</body>",
        language: "html",
        explanation: "Elemento BASE que define la URL raíz para todos los enlaces relativos de la página.",
      },
    ],
  },
  {
    term: "link",
    translation: "vinculación de recursos externos",
    category: "frontend" as Category,
    titleEs: "Elemento LINK",
    titleEn: "LINK Element",
    aliases: ["resource link", "external link", "stylesheet link"],
    tags: ["html", "resources", "css", "metadata"],
    meaningEs:
      "En programación \"link\" se refiere al elemento HTML que vincula recursos externos como hojas de estilo CSS, fuentes web, iconos y otros archivos que enriquecen la presentación del documento.",
    meaningEn:
      "The HTML element that links external resources such as CSS stylesheets, web fonts, icons and other files that enhance document presentation.",
    whatEs:
      "Se usa para cargar estilos CSS, fuentes tipográficas, favicons e información de preload para optimizar rendimiento sin mostrar contenido en la página.",
    whatEn:
      "It loads CSS styles, web fonts, favicons and preload information to optimize performance without displaying content on the page.",
    howEs:
      "Usa <link rel=\"\" href=\"\"> en el <head> con rel indicando el tipo de relación (stylesheet, icon, preconnect) y href apuntando al recurso.",
    howEn:
      "Use <link rel=\"\" href=\"\"> in <head> with rel indicating relationship type (stylesheet, icon, preconnect) and href pointing to resource.",
    examples: [
      {
        title: "LINK cargando CSS y fuentes",
        code: "<head>\n  <link rel=\"stylesheet\" href=\"estilos.css\">\n  <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n  <link href=\"https://fonts.googleapis.com/css2?family=Roboto\" rel=\"stylesheet\">\n  <link rel=\"icon\" href=\"favicon.ico\">\n</head>",
        language: "html",
        explanation: "Múltiples elementos LINK para CSS, preconexión a Google Fonts, fuentes web y favicon.",
      },
    ],
  },
  {
    term: "meta",
    translation: "información descriptiva del documento",
    category: "frontend" as Category,
    titleEs: "Elemento META",
    titleEn: "META Element",
    aliases: ["metadata", "meta tag", "meta attribute"],
    tags: ["html", "metadata", "seo", "charset"],
    meaningEs:
      "En programación \"meta\" se refiere al elemento HTML que proporciona metadatos sobre el documento: codificación, viewport, descripción, palabras clave y datos de compartir en redes sociales.",
    meaningEn:
      "The HTML element that provides metadata about the document: encoding, viewport, description, keywords and social media sharing data.",
    whatEs:
      "Se usa para mejorar SEO, definir comportamiento en dispositivos móviles, especificar codificación de caracteres y proporcionar información para compartir en redes sociales.",
    whatEn:
      "It improves SEO, defines mobile device behavior, specifies character encoding and provides information for social media sharing.",
    howEs:
      "Coloca múltiples <meta> tags en el <head> con atributos name/content o property/content; incluye siempre charset y viewport para compatibilidad.",
    howEn:
      "Place multiple <meta> tags in <head> with name/content or property/content attributes; always include charset and viewport for compatibility.",
    examples: [
      {
        title: "META tags esenciales",
        code: "<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <meta name=\"description\" content=\"Descripción de la página para SEO\">\n  <meta name=\"keywords\" content=\"html, desarrollo, web\">\n  <meta property=\"og:title\" content=\"Título para redes sociales\">\n  <meta property=\"og:image\" content=\"imagen.jpg\">\n</head>",
        language: "html",
        explanation: "META tags para charset, viewport, SEO y Open Graph para redes sociales.",
      },
    ],
  },
  {
    term: "style-element",
    translation: "estilos CSS internos en el documento",
    category: "frontend" as Category,
    titleEs: "Elemento STYLE",
    titleEn: "STYLE Element",
    aliases: ["style tag", "internal CSS", "inline styles"],
    tags: ["html", "css", "styling", "document"],
    meaningEs:
      "En programación \"style\" se refiere al elemento HTML que contiene reglas CSS incrustadas directamente en el documento, permitiendo estilos específicos sin necesidad de archivos externos.",
    meaningEn:
      "The HTML element that contains CSS rules embedded directly in the document, allowing specific styles without needing external files.",
    whatEs:
      "Se usa para aplicar estilos locales a la página, útil para estilos críticos, personalizaciones dinámicas o cuando prefieres CSS incrustado sobre archivos externos.",
    whatEn:
      "It applies local styles to the page, useful for critical styles, dynamic customizations or when you prefer embedded CSS over external files.",
    howEs:
      "Coloca <style> en el <head> o <body> con reglas CSS; puede contener media queries y selectores complejos como en archivos CSS externos.",
    howEn:
      "Place <style> in <head> or <body> with CSS rules; can contain media queries and complex selectors like in external CSS files.",
    examples: [
      {
        title: "STYLE con CSS incrustado",
        code: "<head>\n  <style>\n    body {\n      font-family: Arial, sans-serif;\n      line-height: 1.6;\n    }\n    h1 {\n      color: #333;\n      border-bottom: 2px solid #007bff;\n    }\n    @media (max-width: 768px) {\n      h1 { font-size: 1.5rem; }\n    }\n  </style>\n</head>",
        language: "html",
        explanation: "Elemento STYLE con reglas CSS incluyendo estilos base y media queries.",
      },
    ],
  },
  {
    term: "title",
    translation: "título de la página en navegador",
    category: "frontend" as Category,
    titleEs: "Elemento TITLE",
    titleEn: "TITLE Element",
    aliases: ["page title", "browser title", "document title"],
    tags: ["html", "seo", "metadata", "accessibility"],
    meaningEs:
      "En programación \"title\" se refiere al elemento HTML que define el título de la página, mostrado en la pestaña del navegador, en la historia de búsqueda y en los resultados de buscadores.",
    meaningEn:
      "The HTML element that defines the page title, displayed in the browser tab, search history and search engine results.",
    whatEs:
      "Se usa para identificar el contenido de la página en la pestaña del navegador y mejorar el SEO al indicar a los motores de búsqueda el tema principal.",
    whatEn:
      "It identifies page content in the browser tab and improves SEO by telling search engines the main topic.",
    howEs:
      "Incluye un único <title> en el <head> con texto descriptivo y conciso (30-60 caracteres); debe ser única para cada página y contener palabras clave relevantes.",
    howEn:
      "Include a single <title> in <head> with descriptive and concise text (30-60 characters); should be unique per page and contain relevant keywords.",
    examples: [
      {
        title: "TITLE descriptivo para SEO",
        code: "<head>\n  <title>Aprende HTML: Guía Completa para Desarrolladores</title>\n</head>",
        language: "html",
        explanation: "Elemento TITLE con texto descriptivo que mejora SEO y claridad en pestañas.",
      },
    ],
  },
  {
    term: "script",
    translation: "código ejecutable en el cliente",
    category: "frontend" as Category,
    titleEs: "Elemento SCRIPT",
    titleEn: "SCRIPT Element",
    aliases: ["script tag", "javascript", "client script"],
    tags: ["html", "javascript", "interactivity", "performance"],
    meaningEs:
      "En programación \"script\" se refiere al elemento HTML que incluye o referencia código JavaScript ejecutable en el navegador, permitiendo interactividad, validación y manipulación del DOM.",
    meaningEn:
      "The HTML element that includes or references executable JavaScript code in the browser, enabling interactivity, validation and DOM manipulation.",
    whatEs:
      "Se usa para añadir comportamiento interactivo a la página: detectar eventos, validar formularios, manipular el DOM y comunicarse con APIs.",
    whatEn:
      "It adds interactive behavior to the page: detect events, validate forms, manipulate DOM and communicate with APIs.",
    howEs:
      "Usa <script src=\"\"> para código externo o <script> para código incrustado; coloca al final del <body> para no bloquear renderizado; usa async/defer para optimizar carga.",
    howEn:
      "Use <script src=\"\"> for external code or <script> for embedded code; place at end of <body> to not block rendering; use async/defer to optimize loading.",
    examples: [
      {
        title: "SCRIPT externo e incrustado",
        code: "<head>\n  <script src=\"libreria.js\" defer></script>\n</head>\n<body>\n  <button id=\"btn\">Haz clic</button>\n  <script>\n    document.getElementById('btn').addEventListener('click', () => {\n      alert('¡Hiciste clic!');\n    });\n  </script>\n</body>",
        language: "html",
        explanation: "Script externo con defer y código incrustado con event listener.",
      },
    ],
  },
  {
    term: "noscript",
    translation: "contenido alternativo sin JavaScript",
    category: "frontend" as Category,
    titleEs: "Elemento NOSCRIPT",
    titleEn: "NOSCRIPT Element",
    aliases: ["no script", "fallback content", "javascript disabled"],
    tags: ["html", "javascript", "accessibility", "fallback"],
    meaningEs:
      "En programación \"noscript\" se refiere al elemento HTML que contiene contenido alternativo mostrado solo cuando JavaScript está deshabilitado en el navegador, mejorando la accesibilidad.",
    meaningEn:
      "The HTML element that contains alternative content displayed only when JavaScript is disabled in the browser, improving accessibility.",
    whatEs:
      "Se usa para proporcionar contenido de fallback o mensajes cuando JavaScript no está disponible, mejorando la experiencia de usuarios con navegadores antiguos o configuración restrictiva.",
    whatEn:
      "It provides fallback content or messages when JavaScript is unavailable, improving experience for users with older browsers or restrictive settings.",
    howEs:
      "Coloca <noscript> al final del <body> con HTML alternativo; el contenido dentro se muestra solo si JavaScript está completamente deshabilitado.",
    howEn:
      "Place <noscript> at end of <body> with alternative HTML; content inside displays only if JavaScript is completely disabled.",
    examples: [
      {
        title: "NOSCRIPT con contenido alternativo",
        code: "<body>\n  <div id=\"app\"><!-- Contenido renderizado por JavaScript --></div>\n  <noscript>\n    <div style=\"padding: 20px; background: #fff3cd; border: 1px solid #ffc107;\">\n      <p>Esta página requiere JavaScript. Por favor, habilítalo en tu navegador.</p>\n      <a href=\"/sitio-estatico\">Ir a versión sin JavaScript</a>\n    </div>\n  </noscript>\n</body>",
        language: "html",
        explanation: "Elemento NOSCRIPT con mensaje de fallback cuando JavaScript está deshabilitado.",
      },
    ],
  },
  {
    term: "template",
    translation: "plantilla de contenido reutilizable",
    category: "frontend" as Category,
    titleEs: "Elemento TEMPLATE",
    titleEn: "TEMPLATE Element",
    aliases: ["html template", "template tag", "reusable template"],
    tags: ["html", "template", "javascript", "components"],
    meaningEs:
      "En programación \"template\" se refiere al elemento HTML que contiene HTML que no se renderiza inicialmente pero puede clonarse y usarse dinámicamente con JavaScript, facilitando componentes reutilizables.",
    meaningEn:
      "The HTML element that contains HTML that is not initially rendered but can be cloned and used dynamically with JavaScript, facilitating reusable components.",
    whatEs:
      "Se usa para definir fragmentos de HTML que se duplican dinámicamente, útil para listas generadas, componentes repetitvos y arquetipos que se instancian múltiples veces.",
    whatEn:
      "It defines HTML fragments that are duplicated dynamically, useful for generated lists, repeated components and prototypes instantiated multiple times.",
    howEs:
      "Coloca HTML dentro de <template>; accede con document.querySelector('template').content; clona con .cloneNode(true) y añade al DOM donde necesites.",
    howEn:
      "Place HTML inside <template>; access with document.querySelector('template').content; clone with .cloneNode(true) and append to DOM where needed.",
    examples: [
      {
        title: "TEMPLATE para lista dinámica",
        code: "<body>\n  <ul id=\"lista\"></ul>\n  <template id=\"item-template\">\n    <li>\n      <strong>Título:</strong> <span class=\"titulo\"></span>\n      <button class=\"eliminar\">Borrar</button>\n    </li>\n  </template>\n  <script>\n    const template = document.getElementById('item-template');\n    const lista = document.getElementById('lista');\n    const items = [{titulo: 'Item 1'}, {titulo: 'Item 2'}];\n    items.forEach(item => {\n      const clone = template.content.cloneNode(true);\n      clone.querySelector('.titulo').textContent = item.titulo;\n      lista.appendChild(clone);\n    });\n  </script>\n</body>",
        language: "html",
        explanation: "Elemento TEMPLATE usado para generar múltiples items de lista dinámicamente.",
      },
    ],
  },
  {
    term: "slot",
    translation: "punto de inserción en componentes web",
    category: "frontend" as Category,
    titleEs: "Elemento SLOT",
    titleEn: "SLOT Element",
    aliases: ["shadow dom slot", "slot placeholder", "web components"],
    tags: ["html", "web components", "shadow dom", "components"],
    meaningEs:
      "En programación \"slot\" se refiere al elemento HTML que define un punto de inserción nombrado o anónimo dentro de componentes web (Web Components), permitiendo que el contenido del usuario se proyecte en la plantilla.",
    meaningEn:
      "The HTML element that defines a named or unnamed insertion point within web components, allowing user content to be projected into the template.",
    whatEs:
      "Se usa en Web Components para permitir que usuarios del componente inserten su propio contenido en ubicaciones específicas, facilitando composición flexible y reutilización.",
    whatEn:
      "It's used in Web Components to allow component users to insert their own content in specific locations, facilitating flexible composition and reuse.",
    howEs:
      "Define <slot> dentro de una plantilla de Web Component; usa name=\"\" para slots nombrados o deja vacío para slot anónimo; el contenido se proyecta automáticamente.",
    howEn:
      "Define <slot> inside a Web Component template; use name=\"\" for named slots or leave empty for anonymous slot; content projects automatically.",
    examples: [
      {
        title: "SLOT en Web Component",
        code: "<template id=\"card-template\">\n  <style>\n    :host { display: block; border: 1px solid #ccc; padding: 1rem; }\n  </style>\n  <div class=\"header\">\n    <slot name=\"title\">Título por defecto</slot>\n  </div>\n  <div class=\"body\">\n    <slot>Contenido por defecto</slot>\n  </div>\n  <div class=\"footer\">\n    <slot name=\"actions\">Acciones</slot>\n  </div>\n</template>\n<script>\n  class Card extends HTMLElement {\n    connectedCallback() {\n      const template = document.getElementById('card-template');\n      this.attachShadow({mode: 'open'}).appendChild(\n        template.content.cloneNode(true)\n      );\n    }\n  }\n  customElements.define('my-card', Card);\n</script>\n<my-card>\n  <h2 slot=\"title\">Mi Tarjeta</h2>\n  <p>Contenido personalizado</p>\n  <button slot=\"actions\">Enviar</button>\n</my-card>",
        language: "html",
        explanation: "Web Component usando SLOT para proyectar contenido en posiciones específicas.",
      },
    ],
  },
];

async function seedHTMLTerms() {
  console.log("🌱 Insertando términos HTML...\n");

  try {
    for (const termData of htmlTerms) {
      console.log(`📝 Insertando: ${termData.term}`);

      const term = await prisma.term.create({
        data: {
          term: termData.term,
          translation: termData.translation,
          category: termData.category,
          titleEs: termData.titleEs,
          titleEn: termData.titleEn,
          aliases: termData.aliases,
          tags: termData.tags,
          meaning: termData.meaningEs,
          meaningEs: termData.meaningEs,
          meaningEn: termData.meaningEn,
          what: termData.whatEs,
          whatEs: termData.whatEs,
          whatEn: termData.whatEn,
          how: termData.howEs,
          howEs: termData.howEs,
          howEn: termData.howEn,
          examples: termData.examples,
          status: "approved" as any,
        },
      });

      // Crear variante
      await prisma.termVariant.create({
        data: {
          termId: term.id,
          language: "html" as Language,
          snippet: termData.examples[0]?.code || "",
          notes: `Ejemplo de ${termData.term}`,
          level: "intermediate" as SkillLevel,
          status: "approved" as ReviewStatus,
        },
      });

      // Crear 3 casos de uso
      const useCases = [
        {
          context: "project" as UseCaseContext,
          summary: `Usar ${termData.term} en un proyecto real`,
          steps: [
            `Identificar dónde necesitas ${termData.term}`,
            `Implementar correctamente según especificaciones`,
            `Probar en navegadores compatibles`,
          ],
          tips: `Asegúrate de seguir las mejores prácticas de accesibilidad`,
        },
        {
          context: "interview" as UseCaseContext,
          summary: `Explicar ${termData.term} en una entrevista`,
          steps: [
            `Explicar qué es ${termData.term}`,
            `Dar ejemplos prácticos de uso`,
            `Mencionar por qué es importante`,
          ],
          tips: `Sé claro y conciso, evita tecnicismos innecesarios`,
        },
        {
          context: "bug" as UseCaseContext,
          summary: `Debuggear problemas con ${termData.term}`,
          steps: [
            `Inspecciona el elemento en DevTools`,
            `Verifica que el contenido esté correcto`,
            `Revisa el rendering en diferentes navegadores`,
          ],
          tips: `Usa la consola para verificar el estado`,
        },
      ];

      for (const useCase of useCases) {
        await prisma.useCase.create({
          data: {
            termId: term.id,
            context: useCase.context,
            summary: useCase.summary,
            steps: useCase.steps,
            tips: useCase.tips,
            status: "approved" as ReviewStatus,
          },
        });
      }

      // Crear 3 FAQs
      const faqs = [
        {
          questionEs: `¿Cuándo debo usar ${termData.term}?`,
          answerEs: `Debes usar ${termData.term} cuando necesites ${termData.whatEs?.toLowerCase() || "implementar esta funcionalidad"}.`,
          questionEn: `When should I use ${termData.term}?`,
          answerEn: `You should use ${termData.term} when you need to ${termData.whatEn?.toLowerCase() || "implement this functionality"}.`,
        },
        {
          questionEs: `¿Cómo implemento ${termData.term} correctamente?`,
          answerEs: `${termData.howEs}`,
          questionEn: `How do I implement ${termData.term} correctly?`,
          answerEn: `${termData.howEn}`,
        },
        {
          questionEs: `¿Es ${termData.term} compatible con todos los navegadores?`,
          answerEs: `Sí, ${termData.term} es un estándar HTML y es compatible con todos los navegadores modernos.`,
          questionEn: `Is ${termData.term} compatible with all browsers?`,
          answerEn: `Yes, ${termData.term} is an HTML standard and is compatible with all modern browsers.`,
        },
      ];

      for (const faq of faqs) {
        await prisma.faq.create({
          data: {
            termId: term.id,
            questionEs: faq.questionEs,
            answerEs: faq.answerEs,
            questionEn: faq.questionEn,
            answerEn: faq.answerEn,
            status: "approved" as ReviewStatus,
          },
        });
      }

      // Crear 1 ejercicio
      await prisma.exercise.create({
        data: {
          termId: term.id,
          titleEs: `Práctica: Usar ${termData.term}`,
          titleEn: `Practice: Use ${termData.term}`,
          promptEs: `Implementa un ejemplo funcional usando ${termData.term}. ${termData.whatEs}`,
          promptEn: `Implement a working example using ${termData.term}. ${termData.whatEn}`,
          difficulty: "medium" as Difficulty,
          solutions: [
            {
              title: "Solución Básica",
              code: termData.examples[0]?.code || "",
              explanation: `Este es un ejemplo funcional de ${termData.term}`,
            },
          ],
          status: "approved" as ReviewStatus,
        },
      });

      console.log(`✅ ${termData.term} insertado correctamente\n`);
    }

    console.log("\n✨ ¡Todos los términos HTML han sido insertados exitosamente!");
  } catch (error) {
    console.error("❌ Error al insertar términos:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedHTMLTerms();
