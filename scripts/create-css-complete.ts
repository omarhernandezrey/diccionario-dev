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
  // SELECTORS (13)
  { term: "universal-selector", meaning: "Selector * que selecciona todos los elementos", what: "Aplica estilos a cada elemento de la página", how: "* { margin: 0; }", snippet: `* { margin: 0; padding: 0; box-sizing: border-box; }` },
  { term: "type-selector", meaning: "Selector de elemento HTML", what: "Selecciona por nombre de etiqueta", how: "h1 { color: blue; } div { margin: 10px; }", snippet: `p { color: #333; line-height: 1.6; }
div { display: flex; }` },
  { term: "class-selector", meaning: "Selector de clase con punto", what: "Selecciona elementos con class específica", how: ".primary { color: blue; }", snippet: `.card { border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.active { background-color: #0066cc; }` },
  { term: "id-selector", meaning: "Selector de ID con numeral", what: "Selecciona elemento único por ID", how: "#header { background: white; }", snippet: `#main { width: 100%; max-width: 1200px; }
#footer { background: #333; color: white; }` },
  { term: "attribute-selector", meaning: "Selector de atributo con [atributo]", what: "Selecciona por atributo HTML", how: "[type='text'] { border: 1px solid; }", snippet: `input[type='email'] { color: #666; }
a[target='_blank']::after { content: ' ↗'; }
img[alt] { border: 2px solid gold; }` },
  { term: "descendant-selector", meaning: "Selector con espacio: padre descendiente", what: "Selecciona elementos dentro de otro", how: ".container p { font-size: 1rem; }", snippet: `.sidebar p { font-size: 0.9rem; }
.card h2 { margin-top: 0; }` },
  { term: "child-selector", meaning: "Selector hijo con >: padre > hijo", what: "Selecciona hijo directo", how: "ul > li { margin: 5px; }", snippet: `.menu > li { display: inline-block; }
.list > .item { border-bottom: 1px solid #ddd; }` },
  { term: "adjacent-sibling-selector", meaning: "Selector hermano adyacente con +", what: "Selecciona elemento inmediatamente después", how: "h1 + p { margin-top: 0; }", snippet: `h2 + p { font-weight: bold; }
.heading + .subtitle { color: #666; }` },
  { term: "sibling-selector", meaning: "Selector hermano general con ~", what: "Selecciona hermanos que vienen después", how: "h1 ~ p { color: gray; }", snippet: `.active ~ .sibling { opacity: 0.5; }
input:checked ~ label { font-weight: bold; }` },
  { term: "group-selector", meaning: "Selector múltiple separado por comas", what: "Aplica mismo estilo a varios selectores", how: "h1, h2, h3 { margin-bottom: 1rem; }", snippet: `h1, h2, h3 { font-weight: bold; margin: 1rem 0; }
.btn-primary, .btn-secondary { padding: 0.5rem 1rem; }` },
  { term: "pseudo-class-selector", meaning: "Selector de pseudo-clase con :", what: ":hover, :focus, :visited, etc", how: "a:hover { color: blue; }", snippet: `.button:hover { background-color: #005fa3; }
input:focus { outline: 2px solid blue; }` },
  { term: "pseudo-element-selector", meaning: "Selector de pseudo-elemento con ::", what: "::before, ::after, ::first-letter", how: "p::first-line { font-weight: bold; }", snippet: `.quote::before { content: '"'; }
p::first-letter { font-size: 2em; color: red; }` },
  { term: "negation-selector", meaning: "Selector :not() para excluir", what: "Selecciona elementos que no cumplen condición", how: "li:not(.active) { opacity: 0.5; }", snippet: `a:not([href]) { cursor: default; }
input:not([type='hidden']) { display: block; }` },

  // PSEUDO-CLASSES (41)
  { term: "hover", meaning: "Pseudo-clase cuando ratón está sobre elemento", what: "Se activa al pasar mouse", how: "button:hover { background: blue; }", snippet: `.link:hover { text-decoration: underline; color: #0066cc; }
button:hover { transform: scale(1.05); }` },
  { term: "active", meaning: "Pseudo-clase cuando elemento está activo (click)", what: "Se activa al hacer click", how: "button:active { transform: scale(0.95); }", snippet: `a:active { color: purple; }
button:active { box-shadow: inset 0 2px 4px rgba(0,0,0,0.2); }` },
  { term: "focus", meaning: "Pseudo-clase cuando elemento tiene foco", what: "Se activa al tabular a elemento", how: "input:focus { outline: 2px solid blue; }", snippet: `input:focus { border-color: blue; box-shadow: 0 0 5px rgba(0,0,204,0.3); }` },
  { term: "focus-visible", meaning: "Pseudo-clase cuando foco es visible (keyboard)", what: "Solo con navegación teclado", how: "button:focus-visible { outline: 3px solid; }", snippet: `.button:focus-visible { outline: 2px solid blue; outline-offset: 2px; }` },
  { term: "focus-within", meaning: "Pseudo-clase cuando elemento o descendiente tiene foco", what: "Contenedor con foco dentro", how: "form:focus-within { border: 2px solid blue; }", snippet: `.form-group:focus-within { background: #f0f0f0; }` },
  { term: "visited", meaning: "Pseudo-clase para links visitados", what: "Solo aplica a <a> visitados", how: "a:visited { color: purple; }", snippet: `a:visited { color: #4b0082; }` },
  { term: "link", meaning: "Pseudo-clase para links no visitados", what: "Solo aplica a <a> sin visitar", how: "a:link { color: blue; }", snippet: `a:link { color: #0066cc; text-decoration: none; }` },
  { term: "checked", meaning: "Pseudo-clase para radio/checkbox checked", what: "Se activa cuando input está checked", how: "input:checked { accent-color: blue; }", snippet: `input[type='checkbox']:checked + label { font-weight: bold; }
input[type='radio']:checked { background: blue; }` },
  { term: "disabled", meaning: "Pseudo-clase para elementos disabled", what: "Aplica a elementos deshabilitados", how: "button:disabled { opacity: 0.5; }", snippet: `button:disabled { opacity: 0.5; cursor: not-allowed; }
input:disabled { background: #f0f0f0; }` },
  { term: "enabled", meaning: "Pseudo-clase para elementos habilitados", what: "Inverso de :disabled", how: "input:enabled { border: 1px solid #ccc; }", snippet: `input:enabled { background: white; }` },
  { term: "required", meaning: "Pseudo-clase para input required", what: "Aplica a inputs con required", how: "input:required { border: 2px solid blue; }", snippet: `input:required::after { content: ' *'; color: red; }
input:required { border-color: #ff6b6b; }` },
  { term: "optional", meaning: "Pseudo-clase para input opcional", what: "Aplica a inputs sin required", how: "input:optional { border: 1px solid gray; }", snippet: `input:optional { border-color: #ccc; }` },
  { term: "placeholder-shown", meaning: "Pseudo-clase cuando placeholder visible", what: "Se activa si input está vacío", how: "input:placeholder-shown { color: #999; }", snippet: `input:placeholder-shown { border-color: #ddd; }` },
  { term: "read-only", meaning: "Pseudo-clase para elementos readonly", what: "Aplica a readonly inputs", how: "input:read-only { background: #f0f0f0; }", snippet: `textarea:read-only { background: #e0e0e0; color: #666; }` },
  { term: "read-write", meaning: "Pseudo-clase para elementos editable", what: "Aplica a inputs editables", how: "input:read-write { background: white; }", snippet: `input:read-write { border: 2px solid blue; }` },
  { term: "target", meaning: "Pseudo-clase elemento objetivo de hash URL", what: "Se activa cuando es destino de link", how: "#section1:target { background: yellow; }", snippet: `.section:target { background: #fff3cd; padding: 1rem; }` },
  { term: "first-child", meaning: "Pseudo-clase primer hijo", what: "Selecciona primer elemento", how: "li:first-child { font-weight: bold; }", snippet: `li:first-child { margin-top: 0; }
.item:first-child { border-radius: 8px 8px 0 0; }` },
  { term: "last-child", meaning: "Pseudo-clase último hijo", what: "Selecciona último elemento", how: "li:last-child { margin-bottom: 0; }", snippet: `li:last-child { margin-bottom: 0; }
.item:last-child { border-radius: 0 0 8px 8px; }` },
  { term: "only-child", meaning: "Pseudo-clase único hijo", what: "Selecciona único elemento", how: "p:only-child { margin: 0; }", snippet: `article:only-child { width: 100%; }` },
  { term: "nth-child", meaning: "Pseudo-clase n-ésimo hijo", what: "2n, 3n+1, odd, even, etc", how: "li:nth-child(2n) { background: #f0f0f0; }", snippet: `.row:nth-child(odd) { background: #f9f9f9; }
li:nth-child(3n+1) { color: red; }` },
  { term: "nth-last-child", meaning: "Pseudo-clase n-ésimo hijo desde final", what: "nth-child contando de atrás", how: "li:nth-last-child(2) { font-weight: bold; }", snippet: `li:nth-last-child(1) { margin-bottom: 0; }` },
  { term: "first-of-type", meaning: "Pseudo-clase primer elemento de tipo", what: "Primer <p>, <div>, etc", how: "p:first-of-type { margin-top: 0; }", snippet: `.section p:first-of-type { font-weight: bold; }` },
  { term: "last-of-type", meaning: "Pseudo-clase último elemento de tipo", what: "Último <p>, <div>, etc", how: "p:last-of-type { margin-bottom: 0; }", snippet: `.content p:last-of-type { margin-bottom: 0; }` },
  { term: "only-of-type", meaning: "Pseudo-clase único elemento de tipo", what: "Único <p> en contenedor", how: "h1:only-of-type { text-align: center; }", snippet: `article h1:only-of-type { margin: 0; }` },
  { term: "nth-of-type", meaning: "Pseudo-clase n-ésimo elemento de tipo", what: "p:nth-of-type(2) = segundo <p>", how: "h2:nth-of-type(odd) { color: blue; }", snippet: `.content p:nth-of-type(even) { color: #666; }` },
  { term: "nth-last-of-type", meaning: "Pseudo-clase n-ésimo elemento desde final", what: "nth-of-type contando de atrás", how: "h2:nth-last-of-type(1) { margin-bottom: 0; }", snippet: `p:nth-last-of-type(1) { font-style: italic; }` },
  { term: "root", meaning: "Pseudo-clase elemento raíz HTML", what: "Selecciona <html>", how: ":root { --primary: blue; }", snippet: `:root { --primary-color: #0066cc; --spacing: 1rem; }` },
  { term: "empty", meaning: "Pseudo-clase elemento vacío", what: "Sin contenido ni hijos", how: "p:empty { display: none; }", snippet: `div:empty { min-height: 100px; background: #f0f0f0; }` },
  { term: "not", meaning: "Pseudo-clase negación :not()", what: "Excluye elementos", how: "li:not(.active) { opacity: 0.5; }", snippet: `a:not([href]) { cursor: default; }
*:not(.special) { color: inherit; }` },
  { term: "is", meaning: "Pseudo-clase :is() para simplificar", what: "Agrupa múltiples selectores", how: ":is(h1, h2, h3) { margin-bottom: 1rem; }", snippet: `:is(.card, .panel, .box) { border-radius: 8px; }` },
  { term: "where", meaning: "Pseudo-clase :where() similar a :is()", what: "Sin aumentar especificidad", how: ":where(h1, h2, h3) { color: blue; }", snippet: `:where(.btn, .button, [role='button']) { cursor: pointer; }` },
  { term: "has", meaning: "Pseudo-clase :has() para parent selector", what: "Selecciona padre con cierto hijo", how: "article:has(video) { background: blue; }", snippet: `.card:has(img) { display: grid; grid-template-columns: 1fr 1fr; }` },
  { term: "valid", meaning: "Pseudo-clase para input válido", what: "Aplica a inputs con datos válidos", how: "input:valid { border-color: green; }", snippet: `input:valid { border-color: #28a745; background: #f0f8f0; }` },
  { term: "invalid", meaning: "Pseudo-clase para input inválido", what: "Aplica a inputs con datos inválidos", how: "input:invalid { border-color: red; }", snippet: `input:invalid { border-color: #dc3545; background: #fff5f5; }` },
  { term: "in-range", meaning: "Pseudo-clase para input en rango", what: "Aplica cuando valor está en min/max", how: "input:in-range { border-color: green; }", snippet: `input[type='number']:in-range { border-color: #28a745; }` },
  { term: "out-of-range", meaning: "Pseudo-clase para input fuera de rango", what: "Aplica cuando valor excede límites", how: "input:out-of-range { border-color: red; }", snippet: `input[type='number']:out-of-range { border-color: #dc3545; }` },
  { term: "fullscreen", meaning: "Pseudo-clase elemento en fullscreen", what: "Aplica cuando está fullscreen", how: "video:fullscreen { width: 100vw; height: 100vh; }", snippet: `video:fullscreen { width: 100%; height: 100%; }` },

  // BOX MODEL (29)
  { term: "width", meaning: "Propiedad que define el ancho de un elemento", what: "Controla el ancho de contenido", how: "width: 100px; width: 50%; width: 100vw;", snippet: `div { width: 300px; }
.container { width: 80%; }
img { width: auto; }` },
  { term: "height", meaning: "Propiedad que define la altura de un elemento", what: "Controla la altura de contenido", how: "height: 100px; height: 50vh;", snippet: `div { height: 200px; }
.box { height: 100%; }
video { height: auto; }` },
  { term: "min-width", meaning: "Ancho mínimo que un elemento nunca será más pequeño", what: "Asegura tamaño mínimo", how: "min-width: 200px;", snippet: `div { min-width: 300px; width: 100%; }` },
  { term: "max-width", meaning: "Ancho máximo que un elemento nunca superará", what: "Limita tamaño máximo", how: "max-width: 1200px;", snippet: `.container { max-width: 1200px; margin: 0 auto; }
img { max-width: 100%; height: auto; }` },
  { term: "min-height", meaning: "Altura mínima que un elemento nunca será más pequeña", what: "Asegura altura mínima", how: "min-height: 100vh;", snippet: `main { min-height: 100vh; }
.section { min-height: 500px; }` },
  { term: "max-height", meaning: "Altura máxima que un elemento nunca superará", what: "Limita altura máxima", how: "max-height: 500px;", snippet: `.dropdown { max-height: 300px; overflow-y: auto; }` },
  { term: "margin", meaning: "Espaciado externo alrededor de un elemento", what: "Separación entre elemento y otros", how: "margin: 20px; margin: 10px 20px;", snippet: `div { margin: 20px; }
p { margin: 1rem 0; }
.card { margin: 10px 20px 30px 40px; }` },
  { term: "margin-top", meaning: "Margen superior de un elemento", what: "Espaciado superior", how: "margin-top: 20px;", snippet: `h1 { margin-top: 0; }` },
  { term: "margin-right", meaning: "Margen derecho de un elemento", what: "Espaciado a la derecha", how: "margin-right: 20px;", snippet: `span { margin-right: 0.5rem; }` },
  { term: "margin-bottom", meaning: "Margen inferior de un elemento", what: "Espaciado inferior", how: "margin-bottom: 20px;", snippet: `p { margin-bottom: 1rem; }` },
  { term: "margin-left", meaning: "Margen izquierdo de un elemento", what: "Espaciado a la izquierda", how: "margin-left: 20px;", snippet: `.indented { margin-left: 40px; }` },
  { term: "padding", meaning: "Espaciado interno dentro de un elemento", what: "Espaciado interior", how: "padding: 20px; padding: 10px 20px;", snippet: `div { padding: 20px; }
.box { padding: 1rem; }
button { padding: 0.5rem 1rem; }` },
  { term: "padding-top", meaning: "Padding superior", what: "Espaciado interior arriba", how: "padding-top: 20px;", snippet: `h1 { padding-top: 1rem; }` },
  { term: "padding-right", meaning: "Padding derecho", what: "Espaciado interior derecha", how: "padding-right: 20px;", snippet: `.text { padding-right: 20px; }` },
  { term: "padding-bottom", meaning: "Padding inferior", what: "Espaciado interior abajo", how: "padding-bottom: 20px;", snippet: `footer { padding-bottom: 2rem; }` },
  { term: "padding-left", meaning: "Padding izquierdo", what: "Espaciado interior izquierda", how: "padding-left: 20px;", snippet: `.content { padding-left: 30px; }` },
  { term: "border", meaning: "Borde alrededor de un elemento (shorthand)", what: "Define ancho, estilo y color de borde", how: "border: 1px solid black;", snippet: `div { border: 2px solid #333; }
button { border: 1px solid #ccc; }` },
  { term: "box-sizing", meaning: "Define cómo se calcula el tamaño total del elemento", what: "border-box incluye padding/border en width", how: "box-sizing: border-box;", snippet: `* { box-sizing: border-box; }
div { width: 100%; box-sizing: border-box; }` },
  { term: "border-width", meaning: "Ancho del borde", what: "Grosor del borde en píxeles", how: "border-width: 2px;", snippet: `div { border-width: 2px; }` },
  { term: "border-style", meaning: "Estilo del borde (solid, dashed, dotted, etc)", what: "Tipo de línea del borde", how: "border-style: solid;", snippet: `div { border-style: solid; }
.dashed { border: 2px dashed #333; }` },
  { term: "border-color", meaning: "Color del borde", what: "Define color de la línea", how: "border-color: red;", snippet: `div { border-color: #333; }` },
  { term: "border-radius", meaning: "Radio de esquinas redondeadas del borde", what: "Redondea las esquinas", how: "border-radius: 8px;", snippet: `.card { border-radius: 8px; }
.circle { border-radius: 50%; width: 100px; height: 100px; }` },
  { term: "border-top", meaning: "Borde superior (shorthand)", what: "Define borde arriba", how: "border-top: 2px solid black;", snippet: `h1 { border-top: 2px solid blue; }` },
  { term: "border-right", meaning: "Borde derecho", what: "Define borde derecha", how: "border-right: 1px solid gray;", snippet: `.sidebar { border-right: 2px solid #ccc; }` },
  { term: "border-bottom", meaning: "Borde inferior", what: "Define borde abajo", how: "border-bottom: 2px solid black;", snippet: `header { border-bottom: 1px solid #ddd; }` },
  { term: "border-left", meaning: "Borde izquierdo", what: "Define borde izquierda", how: "border-left: 4px solid green;", snippet: `.highlight { border-left: 4px solid orange; }` },
  { term: "box-shadow", meaning: "Sombra alrededor del elemento", what: "Añade sombra para efecto de profundidad", how: "box-shadow: 0 2px 8px rgba(0,0,0,0.2);", snippet: `.card { box-shadow: 0 2px 10px rgba(0,0,0,0.1); }` },
  { term: "outline", meaning: "Línea alrededor de elemento pero fuera del borde", what: "Contorno externo al borde", how: "outline: 2px solid blue;", snippet: `button:focus { outline: 2px solid blue; }` }
];

async function createTerms() {
  let count = 0;
  for (const t of cssTerms) {
    try {
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
    } catch (e) {
      console.log(`❌ ${t.term}`);
    }
  }
  console.log(`\n✅ Total: ${count}/${cssTerms.length}`);
}

createTerms().then(() => prisma.$disconnect());
