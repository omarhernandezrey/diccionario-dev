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
  // TYPOGRAPHY (18)
  { term: "font-family", meaning: "Define el tipo de fuente del texto", what: "serif, sans-serif, monospace, custom fonts", how: "font-family: 'Arial', sans-serif;", snippet: `body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
code { font-family: 'Courier New', monospace; }` },
  { term: "font-size", meaning: "Define el tamaño de la fuente", what: "px, em, rem, vw, etc", how: "font-size: 16px; font-size: 1.5rem;", snippet: `body { font-size: 16px; }
h1 { font-size: 2.5rem; }
small { font-size: 0.875em; }` },
  { term: "font-weight", meaning: "Define el grosor de la fuente", what: "100-900, bold, normal, lighter", how: "font-weight: bold; font-weight: 600;", snippet: `h1 { font-weight: 700; }
strong { font-weight: bold; }
.light { font-weight: 300; }` },
  { term: "font-style", meaning: "Define el estilo de fuente (normal o itálica)", what: "normal, italic, oblique", how: "font-style: italic;", snippet: `em { font-style: italic; }
.highlight { font-style: oblique; }` },
  { term: "line-height", meaning: "Define el alto de línea (espaciado entre líneas)", what: "Múltiplo de font-size o valor", how: "line-height: 1.5; line-height: 24px;", snippet: `body { line-height: 1.6; }
p { line-height: 1.8; }
code { line-height: 1.4; }` },
  { term: "letter-spacing", meaning: "Define el espaciado entre caracteres", what: "Distancia horizontal entre letras", how: "letter-spacing: 0.05em;", snippet: `h1 { letter-spacing: 0.1em; }
.spaced { letter-spacing: 2px; }` },
  { term: "word-spacing", meaning: "Define el espaciado entre palabras", what: "Distancia entre palabras", how: "word-spacing: 0.5em;", snippet: `.spread { word-spacing: 0.2em; }` },
  { term: "text-align", meaning: "Alinea el contenido de texto", what: "left, center, right, justify", how: "text-align: center;", snippet: `h1 { text-align: center; }
.justify { text-align: justify; }
.right { text-align: right; }` },
  { term: "text-decoration", meaning: "Añade decoración al texto (underline, overline, etc)", what: "underline, overline, line-through, none", how: "text-decoration: underline;", snippet: `a { text-decoration: none; }
a:hover { text-decoration: underline; }
del { text-decoration: line-through; }` },
  { term: "text-transform", meaning: "Transforma mayúsculas/minúsculas del texto", what: "uppercase, lowercase, capitalize, none", how: "text-transform: uppercase;", snippet: `h1 { text-transform: uppercase; }
.title { text-transform: capitalize; }` },
  { term: "text-shadow", meaning: "Añade sombra al texto", what: "Efecto de profundidad en texto", how: "text-shadow: 2px 2px 4px rgba(0,0,0,0.3);", snippet: `h1 { text-shadow: 2px 2px 8px rgba(0,0,0,0.3); }
.neon { text-shadow: 0 0 10px #0ff; }` },
  { term: "text-indent", meaning: "Indentación de la primera línea de texto", what: "Sangría de párrafos", how: "text-indent: 2em;", snippet: `p { text-indent: 1.5em; }` },
  { term: "white-space", meaning: "Define cómo se manejan espacios en blanco y saltos de línea", what: "normal, pre, nowrap, pre-wrap, pre-line", how: "white-space: pre-wrap;", snippet: `code { white-space: pre; }
.nowrap { white-space: nowrap; }` },
  { term: "word-break", meaning: "Define si romper palabras largas", what: "normal, break-all, break-word", how: "word-break: break-word;", snippet: `.url { word-break: break-all; }` },
  { term: "overflow-wrap", meaning: "Envuelve palabra larga si no cabe", what: "normal, break-word", how: "overflow-wrap: break-word;", snippet: `.text { overflow-wrap: break-word; }` },
  { term: "text-overflow", meaning: "Define cómo se trunca texto con overflow", what: "clip, ellipsis, custom", how: "text-overflow: ellipsis;", snippet: `.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }` },
  { term: "font-variant", meaning: "Variantes tipográficas", what: "small-caps, normal, etc", how: "font-variant: small-caps;", snippet: `.caps { font-variant: small-caps; }` },
  { term: "text-orientation", meaning: "Orienta el texto en elemento rotado", what: "mixed, upright, sideways", how: "text-orientation: upright;", snippet: `.vertical { writing-mode: vertical-rl; text-orientation: mixed; }` },

  // COLORS & BACKGROUNDS (15)
  { term: "color", meaning: "Define el color del texto", what: "hex, rgb, hsl, named colors", how: "color: #333; color: rgb(51,51,51); color: blue;", snippet: `body { color: #333; }
.primary { color: rgb(0, 102, 204); }
a { color: blue; }` },
  { term: "background-color", meaning: "Define el color de fondo", what: "Rellena fondo del elemento", how: "background-color: white;", snippet: `.header { background-color: #2c3e50; }
button { background-color: #0066cc; }` },
  { term: "background-image", meaning: "Define imagen de fondo", what: "url('path') o gradientes", how: "background-image: url('bg.jpg');", snippet: `.hero { background-image: url('hero.jpg'); background-size: cover; }` },
  { term: "background-size", meaning: "Define tamaño de imagen de fondo", what: "cover, contain, auto, 100%", how: "background-size: cover;", snippet: `.header { background-size: cover; background-position: center; }` },
  { term: "background-position", meaning: "Define posición de imagen de fondo", what: "top, center, bottom, left, etc", how: "background-position: center;", snippet: `.bg { background-position: top right; }` },
  { term: "background-repeat", meaning: "Define si se repite la imagen de fondo", what: "repeat, no-repeat, repeat-x, repeat-y", how: "background-repeat: no-repeat;", snippet: `.pattern { background-repeat: repeat-x; }` },
  { term: "background-attachment", meaning: "Define si fondo se mueve con scroll", what: "scroll, fixed", how: "background-attachment: fixed;", snippet: `.hero { background-attachment: fixed; }` },
  { term: "opacity", meaning: "Define la transparencia del elemento", what: "0 (transparente) a 1 (opaco)", how: "opacity: 0.5;", snippet: `.fade { opacity: 0.7; }
.hidden { opacity: 0; }
button:hover { opacity: 1; }` },
  { term: "background", meaning: "Shorthand para todas las propiedades de fondo", what: "Combina color, image, size, position, etc", how: "background: url('bg.jpg') center/cover no-repeat;", snippet: `.hero { background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('img.jpg') center/cover; }` },
  { term: "linear-gradient", meaning: "Crea gradiente lineal", what: "De un color a otro en dirección", how: "background: linear-gradient(to right, red, blue);", snippet: `.gradient { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }` },
  { term: "radial-gradient", meaning: "Crea gradiente radial (desde centro)", what: "Desde punto central hacia afuera", how: "background: radial-gradient(circle, red, blue);", snippet: `.circle-grad { background: radial-gradient(circle, #ff6b6b, #4ecdc4); }` },
  { term: "conic-gradient", meaning: "Crea gradiente cónico (angular)", what: "Gira alrededor del punto central", how: "background: conic-gradient(red, yellow, lime);", snippet: `.color-wheel { background: conic-gradient(from 0deg, red, yellow, lime, cyan, blue, magenta, red); }` },
  { term: "filter", meaning: "Aplica filtros visuales al elemento", what: "blur, brightness, contrast, grayscale, etc", how: "filter: blur(5px); filter: brightness(1.2);", snippet: `img { filter: brightness(1.1) contrast(1.1); }
.grayscale { filter: grayscale(100%); }` },
  { term: "backdrop-filter", meaning: "Aplica filtro al fondo detrás del elemento", what: "Desenfoque del fondo, glassmorphism", how: "backdrop-filter: blur(10px);", snippet: `.glass { backdrop-filter: blur(10px); background: rgba(255,255,255,0.3); }` },

  // ANIMATIONS & TRANSITIONS (18)
  { term: "transition", meaning: "Suaviza cambios de propiedad a lo largo del tiempo", what: "Anima cambios de propiedades", how: "transition: all 0.3s ease;", snippet: `button { transition: background-color 0.3s ease; }
button:hover { background-color: blue; }` },
  { term: "transition-property", meaning: "Define qué propiedades se animan", what: "all, background-color, opacity, etc", how: "transition-property: background-color;", snippet: `.element { transition-property: background-color, transform; }` },
  { term: "transition-duration", meaning: "Define duración de la transición", what: "En segundos o milisegundos", how: "transition-duration: 0.5s;", snippet: `div { transition-duration: 300ms; }` },
  { term: "transition-timing-function", meaning: "Define aceleración de la transición", what: "ease, linear, ease-in, ease-out, cubic-bezier", how: "transition-timing-function: ease-in-out;", snippet: `.element { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }` },
  { term: "transition-delay", meaning: "Define retraso antes de iniciar transición", what: "En segundos", how: "transition-delay: 0.2s;", snippet: `.list li { transition: all 0.3s ease; }
.list li:nth-child(1) { transition-delay: 0s; }` },
  { term: "animation", meaning: "Ejecuta animación keyframe", what: "Combina name, duration, timing, etc", how: "animation: spin 2s linear infinite;", snippet: `.spinner { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }` },
  { term: "animation-name", meaning: "Define el nombre de la animación", what: "Referencia a @keyframes", how: "animation-name: slide-in;", snippet: `.animated { animation-name: fadeIn; }` },
  { term: "animation-duration", meaning: "Define duración de la animación", what: "En segundos", how: "animation-duration: 1s;", snippet: `.bounce { animation-duration: 0.6s; }` },
  { term: "animation-timing-function", meaning: "Define aceleración de animación", what: "ease, linear, steps(), etc", how: "animation-timing-function: ease-in-out;", snippet: `.jump { animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); }` },
  { term: "animation-delay", meaning: "Retraso antes de iniciar animación", what: "En segundos", how: "animation-delay: 0.5s;", snippet: `.delayed { animation-delay: 1s; }` },
  { term: "animation-iteration-count", meaning: "Cuántas veces se repite la animación", what: "Número o infinite", how: "animation-iteration-count: infinite;", snippet: `.infinite { animation-iteration-count: infinite; }` },
  { term: "animation-direction", meaning: "Dirección de la animación", what: "normal, reverse, alternate, alternate-reverse", how: "animation-direction: alternate;", snippet: `.back-forth { animation-direction: alternate; }` },
  { term: "animation-fill-mode", meaning: "Estado del elemento antes/después de animación", what: "none, forwards, backwards, both", how: "animation-fill-mode: forwards;", snippet: `.stay { animation-fill-mode: forwards; }` },
  { term: "animation-play-state", meaning: "Pausa o reanuda la animación", what: "running, paused", how: "animation-play-state: paused;", snippet: `.pause:hover { animation-play-state: paused; }` },
  { term: "keyframes", meaning: "Define estados clave de una animación", what: "@keyframes nombre { 0% { ... } 100% { ... } }", how: "@keyframes fadein { from { opacity: 0; } to { opacity: 1; } }", snippet: `@keyframes slideIn {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(0); }
}` },
  { term: "transform", meaning: "Aplica transformación 2D o 3D", what: "rotate, scale, translate, skew", how: "transform: rotate(45deg) scale(1.5);", snippet: `button:hover { transform: scale(1.1); }
.box { transform: rotate(45deg); }` },
  { term: "transform-origin", meaning: "Define punto de origen para transformaciones", what: "Centro de rotación/escala", how: "transform-origin: center;", snippet: `.spin { transform-origin: top center; animation: spin 1s linear infinite; }` },
  { term: "perspective", meaning: "Define profundidad 3D para transformaciones", what: "Distancia del espectador", how: "perspective: 1000px;", snippet: `.scene { perspective: 1000px; }
.card { transform: rotateY(45deg); }` },

  // FLEXBOX (13)
  { term: "display-flex", meaning: "Activa el modelo de cajas flexible (flexbox)", what: "Contenedor para layout flexible", how: "display: flex;", snippet: `.flex-container { display: flex; gap: 1rem; }` },
  { term: "flex-direction", meaning: "Define la dirección principal de los elementos flex", what: "row, column, row-reverse, column-reverse", how: "flex-direction: row; flex-direction: column;", snippet: `.container { display: flex; flex-direction: column; }
.row { display: flex; flex-direction: row; }` },
  { term: "flex-wrap", meaning: "Define si elementos flex se envuelven a nueva línea", what: "wrap, nowrap, wrap-reverse", how: "flex-wrap: wrap;", snippet: `.flex { display: flex; flex-wrap: wrap; }` },
  { term: "justify-content", meaning: "Alinea elementos flex en eje principal", what: "flex-start, center, space-between, space-around", how: "justify-content: center;", snippet: `.center { display: flex; justify-content: center; }
.spread { display: flex; justify-content: space-between; }` },
  { term: "align-items", meaning: "Alinea elementos flex en eje secundario", what: "flex-start, center, stretch, baseline", how: "align-items: center;", snippet: `.centered { display: flex; align-items: center; justify-content: center; }` },
  { term: "align-content", meaning: "Alinea líneas de flex cuando hay múltiples líneas", what: "Similar a justify-content pero para líneas", how: "align-content: space-between;", snippet: `.flex { display: flex; flex-wrap: wrap; align-content: space-between; }` },
  { term: "flex-grow", meaning: "Factor de crecimiento de elemento flex", what: "Cómo crece elemento flexible en espacio libre", how: "flex-grow: 1;", snippet: `.flex { display: flex; }
.grow { flex-grow: 1; }` },
  { term: "flex-shrink", meaning: "Factor de encogimiemto de elemento flex", what: "Cómo se encoge cuando hay poco espacio", how: "flex-shrink: 0;", snippet: `.no-shrink { flex-shrink: 0; }` },
  { term: "flex-basis", meaning: "Tamaño base del elemento flex antes de crecer/encoger", what: "Tamaño inicial en eje principal", how: "flex-basis: 200px;", snippet: `.item { flex-basis: 300px; flex-grow: 1; }` },
  { term: "flex", meaning: "Shorthand para flex-grow, flex-shrink, flex-basis", what: "Combina grow, shrink, basis en uno", how: "flex: 1; flex: 0 0 200px;", snippet: `.flex-item { flex: 1; }
.fixed-size { flex: 0 0 300px; }` },
  { term: "gap", meaning: "Espacio entre elementos flex", what: "Distancia entre items", how: "gap: 1rem; gap: 10px 20px;", snippet: `.flex { display: flex; gap: 1rem; }` },
  { term: "order", meaning: "Ordena elementos flex visualmente", what: "Cambia orden de visualización", how: "order: 2; order: -1;", snippet: `.first { order: 1; }
.second { order: 2; }` },
  { term: "align-self", meaning: "Alinea individualmente un elemento flex", what: "Sobrescribe align-items para elemento", how: "align-self: center;", snippet: `.special { align-self: flex-end; }` },

  // GRID (18)
  { term: "display-grid", meaning: "Activa el modelo de cuadrícula CSS", what: "Contenedor para layout grid", how: "display: grid;", snippet: `.grid { display: grid; grid-template-columns: 1fr 1fr 1fr; }` },
  { term: "grid-template-columns", meaning: "Define las columnas del grid", what: "1fr, 200px, repeat(3, 1fr), etc", how: "grid-template-columns: 1fr 2fr 1fr;", snippet: `.grid { grid-template-columns: repeat(3, 1fr); }
.responsive { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }` },
  { term: "grid-template-rows", meaning: "Define las filas del grid", what: "Altura de las filas", how: "grid-template-rows: 100px 1fr 100px;", snippet: `.grid { grid-template-rows: auto 1fr auto; }` },
  { term: "grid-column", meaning: "Posiciona elemento en columnas del grid", what: "grid-column-start y grid-column-end", how: "grid-column: 1 / 3;", snippet: `.item { grid-column: 1 / span 2; }` },
  { term: "grid-row", meaning: "Posiciona elemento en filas del grid", what: "grid-row-start y grid-row-end", how: "grid-row: 1 / 3;", snippet: `.item { grid-row: 1 / span 2; }` },
  { term: "grid-auto-flow", meaning: "Define cómo se llenan las celdas vacías del grid", what: "row, column, dense", how: "grid-auto-flow: dense;", snippet: `.grid { grid-auto-flow: row dense; }` },
  { term: "justify-items", meaning: "Alinea todos los items horizontalmente en grid", what: "Alineación horizontal en celdas", how: "justify-items: center;", snippet: `.grid { justify-items: center; }` },
  { term: "align-items-grid", meaning: "Alinea todos los items verticalmente en grid", what: "Alineación vertical en celdas", how: "align-items: center;", snippet: `.grid { align-items: center; }` },
  { term: "justify-content-grid", meaning: "Alinea todo el grid horizontalmente", what: "Alineación del grid como un todo", how: "justify-content: space-between;", snippet: `.container { justify-content: center; }` },
  { term: "align-content-grid", meaning: "Alinea todo el grid verticalmente", what: "Alineación vertical del grid", how: "align-content: space-around;", snippet: `.grid { align-content: center; }` },
  { term: "grid-template-areas", meaning: "Define áreas nombradas en el grid", what: "Plantilla visual de layout", how: "grid-template-areas: 'header header' 'sidebar main';", snippet: `.grid {
  grid-template-columns: 200px 1fr;
  grid-template-areas: 'header header'
                       'sidebar main'
                       'footer footer';
}` },
  { term: "grid-area", meaning: "Asigna elemento a área nombrada", what: "Coloca elemento en grid-template-area", how: "grid-area: header;", snippet: `header { grid-area: header; }
main { grid-area: main; }` },
  { term: "auto-fit", meaning: "Autoajusta número de columnas en grid", what: "Responsivo automático", how: "grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));", snippet: `.grid { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }` },
  { term: "auto-fill", meaning: "Llena colum nas pero no ajusta tamaño", what: "Diferente a auto-fit", how: "grid-template-columns: repeat(auto-fill, 300px);", snippet: `.grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }` },
  { term: "minmax", meaning: "Define tamaño mínimo y máximo", what: "minmax(min, max)", how: "minmax(200px, 1fr)", snippet: `.grid { grid-template-columns: repeat(3, minmax(200px, 1fr)); }` },
  { term: "fr-unit", meaning: "Unidad fraccionaria para grid", what: "1fr = una fracción del espacio", how: "grid-template-columns: 1fr 2fr 1fr;", snippet: `.layout { grid-template-columns: 1fr 1fr 1fr; }` },
  { term: "grid-gap", meaning: "Espacio entre celdas del grid", what: "Combina row-gap y column-gap", how: "grid-gap: 1rem;", snippet: `.grid { display: grid; grid-gap: 2rem; }` },
  { term: "subgrid", meaning: "Grid anidado que hereda de padre", what: "Grid dentro de grid", how: "display: grid; grid-column: 1 / -1;", snippet: `.parent { display: grid; grid-template-columns: 1fr 1fr; }
.child { display: grid; grid-column: 1 / -1; }` },

  // UNITS (20)
  { term: "px-unit", meaning: "Píxeles - unidad absoluta de medida", what: "Tamaño fijo en pantalla", how: "width: 100px; font-size: 16px;", snippet: `div { width: 300px; height: 200px; padding: 20px; }` },
  { term: "em-unit", meaning: "Unidad relativa al tamaño de fuente del elemento", what: "1em = font-size del elemento", how: "margin: 2em; (2 × font-size)", snippet: `body { font-size: 16px; }
p { margin: 1em; /* = 16px */ }` },
  { term: "rem-unit", meaning: "Unidad relativa al tamaño de fuente del elemento raíz", what: "1rem = font-size del html", how: "margin: 1rem; (siempre relativo a html)", snippet: `html { font-size: 16px; }
body { margin: 0; padding: 1rem; /* = 16px */ }` },
  { term: "percentage-unit", meaning: "Porcentaje - relativo al elemento padre", what: "Porcentaje del tamaño padre", how: "width: 50%; height: 100%;", snippet: `.container { width: 1200px; }
.col { width: 50%; /* = 600px */ }` },
  { term: "vw-unit", meaning: "Viewport width - 1% del ancho de la ventana", what: "Relativo al ancho de pantalla", how: "width: 100vw;", snippet: `body { width: 100vw; }
header { font-size: 5vw; }` },
  { term: "vh-unit", meaning: "Viewport height - 1% de la altura de la ventana", what: "Relativo a la altura de pantalla", how: "height: 100vh;", snippet: `section { height: 100vh; }
.hero { min-height: 50vh; }` },
  { term: "vmin-unit", meaning: "Mínimo entre vw y vh", what: "Relativo a dimensión más pequeña", how: "font-size: 4vmin;", snippet: `.responsive { font-size: 5vmin; }` },
  { term: "vmax-unit", meaning: "Máximo entre vw y vh", what: "Relativo a dimensión más grande", how: "font-size: 4vmax;", snippet: `.big { font-size: 6vmax; }` },
  { term: "cm-unit", meaning: "Centímetros", what: "Unidad absoluta física", how: "width: 10cm;", snippet: `@media print { body { width: 21cm; /* A4 */ } }` },
  { term: "mm-unit", meaning: "Milímetros", what: "Unidad absoluta física", how: "margin: 5mm;", snippet: `@page { margin: 20mm; }` },
  { term: "in-unit", meaning: "Pulgadas", what: "1in = 96px", how: "width: 8.5in;", snippet: `@media print { div { width: 8.5in; } }` },
  { term: "pt-unit", meaning: "Puntos tipográficos", what: "1pt = 1/72 in", how: "font-size: 12pt;", snippet: `body { font-size: 12pt; }` },
  { term: "pc-unit", meaning: "Picas tipográficas", what: "1pc = 12pt", how: "margin: 1pc;", snippet: `body { margin: 1pc; }` },
  { term: "ch-unit", meaning: "Ancho del carácter '0' en la fuente", what: "Útil para monoespacio", how: "width: 80ch;", snippet: `code { width: 80ch; overflow: auto; }` },
  { term: "ex-unit", meaning: "Altura de la letra 'x' de la fuente", what: "Relativo a fuente", how: "line-height: 2ex;", snippet: `sup { font-size: 0.8ex; }` },
  { term: "deg-unit", meaning: "Grados de rotación", what: "0-360 grados", how: "transform: rotate(45deg);", snippet: `div { transform: rotate(45deg); }` },
  { term: "rad-unit", meaning: "Radianes de rotación", what: "0-2π radianes", how: "transform: rotate(1.57rad);", snippet: `div { transform: rotate(3.14159rad); }` },
  { term: "turn-unit", meaning: "Vueltas (rotación completa)", what: "1turn = 360deg", how: "transform: rotate(0.5turn);", snippet: `div { animation: spin 2s; }
@keyframes spin { to { transform: rotate(1turn); } }` },
  { term: "ms-unit", meaning: "Milisegundos para animaciones", what: "Duración o delay en ms", how: "animation-duration: 500ms;", snippet: `div { animation-duration: 300ms; animation-delay: 100ms; }` },
  { term: "s-unit", meaning: "Segundos para animaciones", what: "Duración o delay en segundos", how: "animation-duration: 1s;", snippet: `button { transition-duration: 0.3s; }` }
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
