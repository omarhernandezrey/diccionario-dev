import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

interface CSSTermDef {
  term: string;
  meaning: string;
  what: string;
  how: string;
  snippet: string;
}

const cssTerms: CSSTermDef[] = [
  // FUNCTIONS (15)
  { term: "rgb-function", meaning: "Define color con rojo, verde, azul", what: "rgb(r, g, b) o rgba(r, g, b, a)", how: "color: rgb(255, 0, 0); rgba(255, 0, 0, 0.5);", snippet: `div { color: rgb(51, 102, 153); background: rgba(255, 255, 255, 0.9); }` },
  { term: "hsl-function", meaning: "Define color con matiz, saturación, luminosidad", what: "hsl(h, s%, l%) o hsla(h, s%, l%, a)", how: "color: hsl(0, 100%, 50%);", snippet: `div { color: hsl(120, 100%, 50%); background: hsla(240, 100%, 50%, 0.5); }` },
  { term: "url-function", meaning: "Referencia a recurso externo", what: "url('path/to/resource')", how: "background-image: url('bg.jpg');", snippet: `div { background-image: url('images/texture.png'); }
@font-face { src: url('font.woff2'); }` },
  { term: "calc-function", meaning: "Calcula expresiones CSS dinámicamente", what: "Sumas, restas, multiplicación, división", how: "width: calc(100% - 20px);", snippet: `.box { width: calc(100% - 2rem); margin: calc(1rem * 2); }` },
  { term: "var-function", meaning: "Referencia a variable CSS custom", what: "var(--nombre, valor-por-defecto)", how: "color: var(--primary-color);", snippet: `:root { --primary: #0066cc; }
div { color: var(--primary); }` },
  { term: "min-function", meaning: "Retorna el valor mínimo", what: "min(value1, value2, ...)", how: "width: min(100%, 1200px);", snippet: `div { width: min(90vw, 1200px); }` },
  { term: "max-function", meaning: "Retorna el valor máximo", what: "max(value1, value2, ...)", how: "font-size: max(16px, 2.5vw);", snippet: `h1 { font-size: max(1.5rem, 4vw); }` },
  { term: "clamp-function", meaning: "Fija valor entre mínimo y máximo con preferencia", what: "clamp(min, preferred, max)", how: "font-size: clamp(16px, 2.5vw, 32px);", snippet: `body { font-size: clamp(14px, 2vw, 20px); }
h1 { font-size: clamp(1.5rem, 5vw, 3rem); }` },
  { term: "repeat-function", meaning: "Repite patrón en grid", what: "repeat(count, value) o repeat(auto-fit, ...)", how: "grid-template-columns: repeat(3, 1fr);", snippet: `.grid { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }` },
  { term: "attr-function", meaning: "Obtiene valor de atributo HTML", what: "attr(attribute-name)", how: "content: attr(data-label);", snippet: `a::after { content: ' (' attr(href) ')'; }` },
  { term: "translate-function", meaning: "Traslada elemento en 2D o 3D", what: "translate(x, y) o translate3d(x, y, z)", how: "transform: translate(10px, 20px);", snippet: `div { transform: translate(50%, -50%); }` },
  { term: "scale-function", meaning: "Escala elemento", what: "scale(x) o scale(x, y)", how: "transform: scale(1.5);", snippet: `button:hover { transform: scale(1.1); }` },
  { term: "rotate-function", meaning: "Rota elemento", what: "rotate(deg) o rotateX/Y/Z(deg)", how: "transform: rotate(45deg);", snippet: `div { transform: rotate(45deg); }
card { transform: rotateY(45deg); }` },
  { term: "skew-function", meaning: "Sesga/inclina elemento", what: "skew(x-angle, y-angle)", how: "transform: skew(10deg, 20deg);", snippet: `div { transform: skew(10deg); }` },
  { term: "cubic-bezier-function", meaning: "Define curva de animación personalizada", what: "cubic-bezier(x1, y1, x2, y2)", how: "transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);", snippet: `div { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }` },

  // AT-RULES (12)
  { term: "media-rule", meaning: "Aplica estilos para cierta condición de medios", what: "@media (condition) { ... }", how: "@media (max-width: 768px) { ... }", snippet: `@media (max-width: 768px) {
  .sidebar { display: none; }
  .content { width: 100%; }
}` },
  { term: "keyframes-rule", meaning: "Define estados de animación", what: "@keyframes nombre { 0% { ... } 100% { ... } }", how: "@keyframes slide { from { left: 0; } to { left: 100%; } }", snippet: `@keyframes fadeIn {
  0% { opacity: 0; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}` },
  { term: "font-face-rule", meaning: "Define fuente personalizada", what: "@font-face { font-family: ...; src: ... }", how: "@font-face { font-family: 'Custom'; src: url(...); }", snippet: `@font-face {
  font-family: 'Montserrat';
  src: url('montserrat.woff2') format('woff2');
}` },
  { term: "import-rule", meaning: "Importa stylesheet externo", what: "@import 'file.css'; o @import url(...);", how: "@import 'normalize.css';", snippet: `@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700');
@import 'variables.css';` },
  { term: "support-rule", meaning: "Aplica estilos si navegador soporta propiedad", what: "@supports (property: value) { ... }", how: "@supports (display: grid) { ... }", snippet: `@supports (display: grid) {
  .grid { display: grid; }
}` },
  { term: "document-rule", meaning: "Aplica estilos según URL del documento", what: "@document url(...) { ... }", how: "@document url(http://example.com/) { ... }", snippet: `@document url(http://example.com/), url-prefix(http://example.com/docs/) {
  body { color: purple; }
}` },
  { term: "page-rule", meaning: "Estilos para documentos impresos", what: "@page { margin: 2cm; }", how: "@page { margin: 20mm; size: A4; }", snippet: `@page {
  margin: 1in;
  @bottom-center { content: 'Page ' counter(page); }
}` },
  { term: "counter-style-rule", meaning: "Define estilo personalizado de contador", what: "@counter-style nombre { system: ...; }", how: "@counter-style thumbs { symbols: 👍 👎; }", snippet: `@counter-style custom-list {
  system: cyclic;
  symbols: '→' '→' '→';
}` },
  { term: "namespace-rule", meaning: "Define namespace para elementos XML/SVG", what: "@namespace url|prefix;", how: "@namespace url(http://www.w3.org/1999/xhtml);", snippet: `@namespace svg url(http://www.w3.org/2000/svg);
svg|circle { fill: blue; }` },
  { term: "color-profile-rule", meaning: "Define perfil de color ICC", what: "@color-profile { ... }", how: "@color-profile { src: url(...); }", snippet: `@color-profile P3 { src: url('path/to/profile.icc'); }` },
  { term: "layer-rule", meaning: "Define capas en cascada CSS", what: "@layer nombre { ... }", how: "@layer utilities { ... }", snippet: `@layer reset, base, theme, utilities;
@layer utilities {
  .text-center { text-align: center; }
}` },
  { term: "container-rule", meaning: "Consultas de contenedor para responsive", what: "@container (condition) { ... }", how: "@container (min-width: 400px) { ... }", snippet: `@container (min-width: 300px) {
  .card { display: grid; grid-template-columns: 1fr 1fr; }
}` },

  // ADVANCED CONCEPTS (25)
  { term: "css-variables", meaning: "Variables reutilizables en CSS (custom properties)", what: "--nombre: valor; acceso con var(--nombre)", how: ":root { --primary: #0066cc; } div { color: var(--primary); }", snippet: `:root {
  --primary: #0066cc;
  --spacing: 1rem;
  --shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.card { box-shadow: var(--shadow); }` },
  { term: "cascade", meaning: "Orden en que se aplican estilos CSS", what: "Inline > ID > Clase > Elemento > Herencia", how: "La especificidad determina cuál gana", snippet: `/* Especificidad: elemento (1) < clase (10) < id (100) < inline (1000) */
#main { color: red; } /* Gana sobre clase y elemento */
.header { color: blue; }
h1 { color: green; }` },
  { term: "specificity", meaning: "Peso de un selector CSS", what: "Determina qué estilo se aplica si hay conflicto", how: "ID=100, Clase=10, Elemento=1", snippet: `#header .title { /* 100 + 10 = 110 */ }
.header .title { /* 10 + 10 = 20 */ }
h1 { /* 1 */ }` },
  { term: "inheritance", meaning: "Propiedades heredadas de elementos padre", what: "color, font-family, line-height, etc se heredan", how: "body { color: #333; } /* heredado por todos */ ", snippet: `body { font-family: Arial; color: #333; line-height: 1.6; }
/* todos los elementos heredan estas propiedades */` },
  { term: "cascade-layers", meaning: "Capas para control avanzado de especificidad", what: "@layer para organizar estilos", how: "@layer reset, base, theme, utilities;", snippet: `@layer base {
  html { scroll-behavior: smooth; }
}
@layer utilities {
  .text-center { text-align: center; }
}` },
  { term: "css-grid-layout", meaning: "Sistema de layout de dos dimensiones", what: "display: grid; grid-template-columns/rows", how: "Crea grillas complejas fácilmente", snippet: `.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}` },
  { term: "responsive-design", meaning: "Diseño que se adapta a diferentes pantallas", what: "Media queries y unidades relativas", how: "@media (max-width: 768px) { ... }", snippet: `@media (max-width: 768px) {
  .sidebar { display: none; }
  body { font-size: 14px; }
}` },
  { term: "mobile-first", meaning: "Diseño comenzando por mobile", what: "Estilos base mobile + media queries up", how: "Agregar estilos para pantallas más grandes", snippet: `/* Base: mobile */
.container { width: 100%; }
/* Tablet y arriba */
@media (min-width: 768px) { .container { width: 750px; } }
@media (min-width: 1200px) { .container { width: 1170px; } }` },
  { term: "bem-methodology", meaning: "Metodología de nombres CSS", what: "Block__Element--Modifier", how: ".card .card__header .card__header--active", snippet: `.button { }
.button__icon { }
.button--primary { }
.button--primary:hover { }` },
  { term: "z-stacking", meaning: "Orden de apilamiento en eje Z", what: "z-index determina cuál elemento sale adelante", how: "Mayor z-index = más adelante", snippet: `.modal { position: fixed; z-index: 1000; }
.dropdown { position: absolute; z-index: 100; }` },
  { term: "stacking-context", meaning: "Contexto de apilamiento que aísla z-index", what: "opacity, transform, etc crean nuevo contexto", how: "opacity < 1 crea nuevo contexto", snippet: `.parent { opacity: 0.9; }
.child { z-index: 999; /* confinado al parent */ }` },
  { term: "containing-block", meaning: "Bloque que contiene posicionamiento absoluto", what: "position: relative crea containing block", how: "Hijos absolute se posicionan respecto a este", snippet: `.parent { position: relative; }
.child { position: absolute; top: 10px; left: 10px; }` },
  { term: "bfc", meaning: "Block Formatting Context", what: "overflow: hidden crea BFC", how: "Aísla contenido de flujo del documento", snippet: `.clearfix { overflow: auto; }
.column { overflow: hidden; }` },
  { term: "cssom", meaning: "CSS Object Model - interfaz para manipular CSS", what: "Acceso a estilos vía JavaScript", how: "element.style.property", snippet: `const el = document.querySelector('.box');
el.style.color = 'red';
el.style.backgroundColor = '#fff';` },
  { term: "reset-styles", meaning: "Resetear estilos predeterminados", what: "normalize o reset css", how: "* { margin: 0; padding: 0; }", snippet: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui; line-height: 1.5; }` },
  { term: "utility-first", meaning: "Enfoque de utilidades CSS (Tailwind)", what: "Clases pequeñas reutilizables", how: "<div class='flex items-center justify-between p-4'>", snippet: `<!-- Utility-first approach -->
<div class="flex gap-4 p-6 bg-white rounded-lg shadow">
  <img class="w-16 h-16 rounded-full" src="avatar.jpg">
  <div class="flex-1">
    <h3 class="font-bold text-lg">Título</h3>
  </div>
</div>` },
  { term: "postcss", meaning: "Herramienta para procesar CSS con JavaScript", what: "Plugins para transformar CSS", how: "Autoprefixer, nested, variables", snippet: `/* PostCSS input */
.button {
  &:hover { background: blue; }
  &--primary { color: white; }
}` },
  { term: "sass-scss", meaning: "Preprocesador de CSS", what: "Variables, mixins, nesting, functions", how: "$color: blue; @mixin center { ... }", snippet: `$primary: #0066cc;
$spacing: 1rem;
.button {
  color: $primary;
  padding: $spacing;
  &:hover { opacity: 0.8; }
}` },
  { term: "less", meaning: "Otro preprocesador de CSS", what: "Similar a Sass", how: "@color: blue; .mixin() { ... }", snippet: `@primary: #0066cc;
.button { color: @primary; }` },
  { term: "critical-css", meaning: "CSS crítico para above-the-fold", what: "Inlinar CSS esencial", how: "<style>/* critical css */</style>", snippet: `<!-- Inline critical styles -->
<style>
  body { margin: 0; font-family: system-ui; }
  .hero { min-height: 100vh; }
</style>` },
  { term: "css-in-js", meaning: "CSS dentro de JavaScript", what: "Styled Components, Emotion, etc", how: "const Button = styled.button`...`", snippet: `// Styled Components example
const Button = styled.button\`
  background: \${props => props.primary ? '#0066cc' : '#ccc'};
  color: white;
  padding: 0.5rem 1rem;
\`;` },
  { term: "dark-mode", meaning: "Implementar modo oscuro en CSS", what: "prefers-color-scheme, variables", how: "@media (prefers-color-scheme: dark) { ... }", snippet: `@media (prefers-color-scheme: dark) {
  body { background: #1a1a1a; color: #fff; }
}
:root {
  color-scheme: light dark;
}` },
  { term: "accessibility-css", meaning: "Estilos accesibles", what: "Focus visible, high contrast, etc", how: "outline, ::focus-visible, reduce-motion", snippet: `button:focus-visible { outline: 3px solid blue; }
@media (prefers-reduced-motion) {
  * { animation-duration: 0.01ms !important; }
}` },
  { term: "performance-css", meaning: "Optimizar rendimiento de CSS", what: "Minimizar, separar crítico, lazy load", how: "Herramientas: PurgeCSS, critical", snippet: `<!-- Async non-critical CSS -->
<link rel="stylesheet" href="non-critical.css" media="print" onload="this.media='all'">` },
  { term: "cross-browser", meaning: "Compatibilidad entre navegadores", what: "Prefijos -webkit-, -moz-, etc", how: "-webkit-appearance, -moz-user-select", snippet: `.element {
  -webkit-transform: rotate(45deg);
  -moz-transform: rotate(45deg);
  transform: rotate(45deg);
}` }
];

async function createTerms() {
  let count = 0;
  for (const t of cssTerms) {
    try {
      const existing = await prisma.term.findFirst({ where: { term: t.term } });
      if (existing) {
        console.log(`⏭️  ${t.term} (ya existe)`);
        continue;
      }

      const term = await prisma.term.create({
        data: {
          term: t.term,
          translation: `CSS: ${t.term}`,
          meaning: t.meaning,
          what: t.what,
          how: t.how,
          category: "frontend",
          examples: [{ code: t.snippet, title: `${t.term}`, language: "css", explanation: "Demo" }]
        }
      });

      await prisma.termVariant.create({
        data: {
          termId: term.id,
          language: "css",
          snippet: t.snippet,
          level: "intermediate",
          status: "approved"
        }
      });

      for (let i = 0; i < 3; i++) {
        const contexts = ["interview", "project", "bug"] as const;
        await prisma.useCase.create({
          data: {
            termId: term.id,
            context: contexts[i],
            summary: `Caso ${i + 1}`,
            steps: ["Paso 1", "Paso 2"],
            tips: "Info"
          }
        });
      }

      for (let i = 0; i < 3; i++) {
        await prisma.faq.create({
          data: {
            termId: term.id,
            questionEs: `P${i + 1}`,
            answerEs: t.meaning,
            snippet: null
          }
        });
      }

      await prisma.exercise.create({
        data: {
          termId: term.id,
          titleEs: `Practica`,
          promptEs: `Usa ${t.term}`,
          difficulty: "medium",
          solutions: [{ title: "Sol", code: t.snippet, explanation: "OK" }]
        }
      });

      count++;
      console.log(`✅ ${t.term}`);
    } catch (e: any) {
      console.log(`❌ ${t.term}: ${e.message}`);
    }
  }
  console.log(`\n✅ Total nuevos: ${count}/${cssTerms.length}`);
}

createTerms().then(() => prisma.$disconnect());
