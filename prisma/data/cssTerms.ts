import { Category } from "@prisma/client";

export type CssInputTerm = {
  term: string;
  translation: string;
  description: string;
  example: { title: string; code: string; note?: string };
  aliases?: string[];
  what?: string;
  how?: string;
};

const cssBaseTerms: CssInputTerm[] = [
  {
    term: "align-items",
    translation: "alinear elementos verticalmente dentro de un contenedor flex",
    description: "alinear elementos verticalmente dentro de un contenedor basado en flex o grid",
    aliases: ["alignItems"],
    example: {
      title: "Cards centradas verticalmente",
      code: `section.cards {
  display: flex;
  align-items: center;
  min-height: 280px;
}`,
      note: "Se usa en contenedores flex y grid para ajustar el eje cruzado.",
    },
  },
  {
    term: "align-content",
    translation: "alinear líneas completas en flexbox o grid",
    description: "controlar el alineado de filas completas dentro de contenedores con varias líneas",
    aliases: ["alignContent"],
    example: {
      title: "Grid con espacio inferior",
      code: `main.gallery {
  display: flex;
  flex-wrap: wrap;
  align-content: space-between;
  height: 400px;
}`,
      note: "Solo aplica cuando hay varias líneas generadas por wrap.",
    },
  },
  {
    term: "align-self",
    translation: "alinear un solo ítem individual",
    description: "sobrescribir el alineado vertical de un elemento específico dentro de un flex/grid",
    aliases: ["alignSelf"],
    example: {
      title: "Botón destacado",
      code: `.actions {
  display: flex;
  align-items: center;
}
.actions button.cta {
  align-self: flex-end;
}`,
    },
  },
  {
    term: "animation",
    translation: "animación controlada con keyframes",
    description: "asignar la animación definida por @keyframes a un elemento",
    aliases: ["animation shorthand"],
    example: {
      title: "Fade in reusable",
      code: `.toast {
  animation: fade-in 400ms ease-out both;
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}`,
    },
  },
  {
    term: "animation-delay",
    translation: "tiempo antes de que empiece una animación",
    description: "definir cuánto debe esperar una animación antes de ejecutarse",
    aliases: ["animationDelay"],
    example: {
      title: "Escalonar elementos",
      code: `.list-item {
  animation: enter 300ms ease-out;
  animation-delay: calc(var(--index) * 80ms);
}`,
    },
  },
  {
    term: "animation-duration",
    translation: "cuánto dura la animación",
    description: "indicar la duración total de una animación en milisegundos o segundos",
    aliases: ["animationDuration"],
    example: {
      title: "Loading lento",
      code: `.spinner {
  animation: rotate 1.2s linear infinite;
}`,
    },
  },
  {
    term: "animation-iteration-count",
    translation: "cuántas veces se repite la animación",
    description: "definir el número de repeticiones de una animación",
    aliases: ["animationIterationCount"],
    example: {
      title: "Sólo una vez",
      code: `.modal {
  animation: drop-in 500ms ease-out;
  animation-iteration-count: 1;
}`,
    },
  },
  {
    term: "auto",
    translation: "valor automático",
    description: "delegar en el navegador el cálculo del valor más adecuado",
    example: {
      title: "Centrar con margin auto",
      code: `.card {
  width: min(480px, 100%);
  margin: 0 auto;
}`,
      note: "Funciona como valor en múltiples propiedades.",
    },
    how: "Úsalo como valor en propiedades soportadas (margin, width, grid, etc.) para dejar que el navegador calcule el tamaño ideal.",
  },
  {
    term: "background",
    translation: "propiedad shorthand para el fondo",
    description: "establecer color, imagen, posición y repetición del fondo en una sola declaración",
    aliases: ["background shorthand"],
    example: {
      title: "Hero con degradado",
      code: `.hero {
  background: linear-gradient(135deg, #111, #2d2dff) center/cover no-repeat;
}`,
    },
  },
  {
    term: "background-color",
    translation: "color de fondo",
    description: "definir el color sólido que rellena el fondo del elemento",
    aliases: ["backgroundColor"],
    example: {
      title: "Card contrastada",
      code: `.card {
  background-color: #0f172a;
  color: #e2e8f0;
}`,
    },
  },
  {
    term: "background-image",
    translation: "imagen de fondo",
    description: "aplicar imágenes o gradientes al fondo",
    aliases: ["backgroundImage"],
    example: {
      title: "Textura repetida",
      code: `body {
  background-image: url(/textures/noise.png);
}`,
      note: "Acepta rutas, data URIs o gradientes.",
    },
  },
  {
    term: "background-size",
    translation: "tamaño del fondo",
    description: "controlar cómo se escala la imagen de fondo",
    aliases: ["backgroundSize"],
    example: {
      title: "Cover en hero",
      code: `.hero {
  background-image: url(/images/team.jpg);
  background-size: cover;
}`,
    },
  },
  {
    term: "border",
    translation: "borde",
    description: "definir grosor, estilo y color del borde",
    aliases: ["border shorthand"],
    example: {
      title: "Tarjeta con borde",
      code: `.card {
  border: 1px solid rgba(148, 163, 184, 0.3);
}`,
    },
  },
  {
    term: "border-radius",
    translation: "esquinas redondeadas",
    description: "redondear las esquinas de la caja",
    aliases: ["borderRadius"],
    example: {
      title: "Avatar circular",
      code: `.avatar {
  width: 64px;
  height: 64px;
  border-radius: 999px;
}`,
    },
  },
  {
    term: "box-shadow",
    translation: "sombra del elemento",
    description: "aplicar sombras difusas o duras a la caja",
    aliases: ["boxShadow"],
    example: {
      title: "Elevación suave",
      code: `.panel {
  box-shadow: 0 20px 40px -25px rgba(15, 23, 42, 0.8);
}`,
    },
  },
  {
    term: "box-sizing",
    translation: "cómo se calcula el tamaño de la caja",
    description: "definir si width/height incluyen padding y borde",
    aliases: ["boxSizing"],
    example: {
      title: "Border-box global",
      code: `*, *::before, *::after {
  box-sizing: border-box;
}`,
      note: "Usa border-box para layout predecible.",
    },
  },
  {
    term: "calc",
    translation: "función para calcular valores",
    description: "combinar unidades y operaciones matemáticas directamente en CSS",
    aliases: ["calc()"],
    example: {
      title: "Ancho adaptable",
      code: `.sidebar {
  width: calc(100% - 320px);
}`,
    },
    how: "Escribe calc(valor + valor) respetando los espacios alrededor de los operadores para realizar ajustes dinámicos.",
  },
  {
    term: "class selector",
    translation: "selector de clase (.clase)",
    description: "aplicar estilos a elementos que comparten una clase",
    aliases: ["selector de clase", ".class"],
    example: {
      title: "Selector reusable",
      code: `.badge {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
}`,
      note: "Se invoca desde el HTML con class=\"badge\".",
    },
    how: "Prefija el nombre con un punto (.mi-clase) y úsalo para agrupar estilos reutilizables.",
  },
  {
    term: "color",
    translation: "color del texto",
    description: "definir el color del contenido textual",
    example: {
      title: "Texto secundario",
      code: `p.helper {
  color: #94a3b8;
}`,
    },
  },
  {
    term: "column",
    translation: "columna",
    description: "organizar contenido en columnas dentro de layout flex/grid o propiedades multi-column",
    example: {
      title: "Flex en columna",
      code: `.stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}`,
      note: "También aplica al valor column en flex-direction.",
    },
    what: "Lo usamos para estructurar elementos de arriba hacia abajo dentro de layouts responsivos.",
  },
  {
    term: "container",
    translation: "contenedor",
    description: "elemento que agrupa contenido y define límites o medidas",
    example: {
      title: "Wrapper central",
      code: `.container {
  width: min(1200px, 100% - 2rem);
  margin: 0 auto;
}`,
    },
    what: "Lo empleamos para envolver secciones y controlar el ancho máximo.",
    how: "Define una clase container con márgenes automáticos y paddings laterales para mantener la lectura.",
  },
  {
    term: "cursor",
    translation: "puntero del mouse",
    description: "indicar el tipo de cursor que debe mostrarse sobre un elemento interactivo",
    example: {
      title: "Botón deshabilitado",
      code: `.button[disabled] {
  cursor: not-allowed;
  opacity: 0.5;
}`,
    },
  },
  {
    term: "display",
    translation: "cómo se muestra un elemento",
    description: "definir el modelo de caja (block, inline, flex, grid, etc.)",
    example: {
      title: "Layout flexible",
      code: `.layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
}`,
    },
  },
  {
    term: "direction",
    translation: "dirección del texto o flex",
    description: "configurar el flujo del texto o del layout (ltr, rtl)",
    example: {
      title: "Soporte RTL",
      code: `[dir="rtl"] .breadcrumb {
  direction: rtl;
}`,
      note: "Útil en idiomas de derecha a izquierda.",
    },
  },
  {
    term: "dominant-baseline",
    translation: "línea base dominante en SVG",
    description: "alinear texto SVG respecto a su baseline principal",
    example: {
      title: "Texto centrado en SVG",
      code: `<text dominant-baseline="middle" text-anchor="middle">
  Métrica
</text>`,
      note: "Solo aplica dentro de SVG.",
    },
    what: "Lo empleamos para alinear texto dentro de gráficos SVG sin cálculos manuales.",
    how: "Combina dominant-baseline con text-anchor para ubicar etiquetas en el lienzo SVG.",
  },
  {
    term: "em",
    translation: "unidad relativa al tamaño del texto padre",
    description: "medir basado en el font-size del elemento padre inmediato",
    example: {
      title: "Padding relativo",
      code: `.tag {
  font-size: 0.875rem;
  padding: 0.5em 1.5em;
}`,
    },
  },
  {
    term: "flex",
    translation: "diseño flexible",
    description: "crear contenedores flexibles basados en ejes",
    example: {
      title: "Fila responsiva",
      code: `.toolbar {
  display: flex;
  gap: 0.75rem;
}`,
    },
  },
  {
    term: "flex-direction",
    translation: "dirección del eje flex",
    description: "definir si los ítems se acomodan en fila o columna",
    aliases: ["flexDirection"],
    example: {
      title: "Stack adaptable",
      code: `.stack {
  display: flex;
  flex-direction: column;
}`,
    },
  },
  {
    term: "flex-wrap",
    translation: "permitir que los elementos salten de línea",
    description: "autorizar que los ítems flex formen varias líneas",
    aliases: ["flexWrap"],
    example: {
      title: "Chips responsivos",
      code: `.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}`,
    },
  },
  {
    term: "flex-grow",
    translation: "cuánto crece un elemento",
    description: "indicar qué proporción del espacio sobrante toma cada ítem",
    aliases: ["flexGrow"],
    example: {
      title: "Columna expansible",
      code: `.sidebar { flex-grow: 1; }
.content { flex-grow: 3; }`,
    },
  },
  {
    term: "flex-shrink",
    translation: "cuánto se encoge un elemento",
    description: "definir qué tanto puede reducirse un ítem al faltar espacio",
    aliases: ["flexShrink"],
    example: {
      title: "Evitar encogimiento",
      code: `.logo {
  flex-shrink: 0;
}`,
    },
  },
  {
    term: "flex-basis",
    translation: "tamaño base del ítem",
    description: "establecer el tamaño inicial de un ítem flex antes de distribuir espacio",
    aliases: ["flexBasis"],
    example: {
      title: "Tarjetas iguales",
      code: `.card {
  flex: 1 1 220px;
  flex-basis: 220px;
}`,
    },
  },
  {
    term: "float",
    translation: "flotar a la izquierda o derecha",
    description: "sacar un elemento del flujo normal para envolver texto",
    example: {
      title: "Imagen flotante",
      code: `.article img {
  float: right;
  margin-left: 1rem;
}`,
    },
  },
  {
    term: "font-family",
    translation: "tipo de letra",
    description: "definir la familia tipográfica",
    aliases: ["fontFamily"],
    example: {
      title: "Stack moderno",
      code: `body {
  font-family: "Inter", system-ui, -apple-system, sans-serif;
}`,
    },
  },
  {
    term: "font-size",
    translation: "tamaño del texto",
    description: "controlar la altura del texto",
    aliases: ["fontSize"],
    example: {
      title: "Escala tipográfica",
      code: `h1 {
  font-size: clamp(2rem, 4vw, 3rem);
}`,
    },
  },
  {
    term: "font-weight",
    translation: "grosor del texto",
    description: "seleccionar el peso tipográfico (400, 600, bold)",
    aliases: ["fontWeight"],
    example: {
      title: "Titular bold",
      code: `h2 {
  font-weight: 600;
}`,
    },
  },
  {
    term: "form-control",
    translation: "control de formulario",
    description: "conjunto de estilos aplicados a inputs, selects y textareas",
    example: {
      title: "Input estilizado",
      code: `.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #334155;
  border-radius: 0.75rem;
}`,
    },
    what: "Lo usamos para estandarizar la apariencia de los campos de formulario.",
    how: "Crea una clase .form-control que puedas reutilizar en todos los elementos interactivos.",
  },
  {
    term: "gap",
    translation: "espacio entre elementos",
    description: "definir el espacio entre filas y columnas en flex o grid",
    example: {
      title: "Stack aireado",
      code: `.stack {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}`,
    },
  },
  {
    term: "grid",
    translation: "sistema de cuadrícula",
    description: "activar el layout basado en filas y columnas",
    example: {
      title: "Layout de tablero",
      code: `.dashboard {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}`,
    },
  },
  {
    term: "grid-template-columns",
    translation: "definición de columnas del grid",
    description: "establecer cuántas columnas y sus tamaños",
    aliases: ["gridTemplateColumns"],
    example: {
      title: "Tres columnas fluidas",
      code: `.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}`,
    },
  },
  {
    term: "grid-template-rows",
    translation: "definición de filas del grid",
    description: "controlar la altura de cada fila",
    aliases: ["gridTemplateRows"],
    example: {
      title: "Filas fijas",
      code: `.schedule {
  display: grid;
  grid-template-rows: 64px auto 64px;
}`,
    },
  },
  {
    term: "grid-gap",
    translation: "separación entre celdas",
    description: "espacio entre filas y columnas del grid (equivalente a gap)",
    aliases: ["gridGap"],
    example: {
      title: "Compatibilidad antigua",
      code: `.legacy-grid {
  display: grid;
  grid-gap: 1.5rem;
}`,
      note: "Usa gap en especificaciones modernas.",
    },
  },
  {
    term: "height",
    translation: "alto del elemento",
    description: "definir la altura explícita",
    example: {
      title: "Hero alto",
      code: `.hero {
  height: 70vh;
}`,
    },
  },
  {
    term: "hover",
    translation: "estado al pasar el cursor",
    description: "pseudo-clase que responde al cursor encima",
    aliases: [":hover"],
    example: {
      title: "Botón reactivo",
      code: `.button:hover {
  transform: translateY(-2px);
}`,
    },
    what: "Lo usamos para dar feedback visual inmediato a elementos interactivos.",
  },
  {
    term: "inherit",
    translation: "heredar valores del padre",
    description: "forzar que una propiedad tome el mismo valor que su elemento contenedor",
    example: {
      title: "Colores consistentes",
      code: `.link {
  color: inherit;
}`,
    },
    how: "Establece inherit cuando quieras que propiedades como color, font o visibility sigan al ancestro.",
  },
  {
    term: "inline",
    translation: "elemento en línea",
    description: "hacer que el elemento no rompa la línea y respete el flujo del texto",
    example: {
      title: "Etiqueta inline",
      code: `.tag {
  display: inline;
}`,
    },
  },
  {
    term: "isolation",
    translation: "controla el stacking context",
    description: "forzar que un elemento cree un nuevo contexto de apilamiento",
    example: {
      title: "Popup aislado",
      code: `.modal {
  isolation: isolate;
}`,
      note: "Evita que z-index externos interfieran.",
    },
  },
  {
    term: "justify-content",
    translation: "alinear elementos horizontalmente en flex/grid",
    description: "distribuir los ítems a lo largo del eje principal",
    aliases: ["justifyContent"],
    example: {
      title: "Espaciado uniforme",
      code: `.toolbar {
  display: flex;
  justify-content: space-between;
}`,
    },
  },
  {
    term: "justify-items",
    translation: "alinear ítems dentro de una celda de grid",
    description: "controlar la alineación horizontal de cada celda del grid",
    aliases: ["justifyItems"],
    example: {
      title: "Cards centradas",
      code: `.pricing {
  display: grid;
  justify-items: center;
}`,
    },
  },
  {
    term: "justify-self",
    translation: "alinear un solo ítem dentro de su celda",
    description: "sobrescribir el alineado horizontal de un elemento en grid",
    aliases: ["justifySelf"],
    example: {
      title: "Botón alineado a la derecha",
      code: `.card button {
  justify-self: end;
}`,
    },
  },
  {
    term: "keyframes",
    translation: "bloques que definen animaciones paso a paso",
    description: "describir los estados intermedios de una animación CSS",
    aliases: ["@keyframes"],
    example: {
      title: "Brillo infinito",
      code: `@keyframes pulse {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}`,
    },
    how: "Define @keyframes nombre { 0% {...} 100% {...} } y referencia el nombre desde animation.",
  },
  {
    term: "left",
    translation: "posición horizontal izquierda",
    description: "mover un elemento posicionado respecto al borde izquierdo",
    example: {
      title: "Tooltip alineado",
      code: `.tooltip {
  position: absolute;
  left: 0;
}`,
    },
  },
  {
    term: "letter-spacing",
    translation: "espacio entre letras",
    description: "ajustar la separación horizontal entre caracteres",
    aliases: ["letterSpacing"],
    example: {
      title: "Título amplio",
      code: `.eyebrow {
  letter-spacing: 0.12em;
  text-transform: uppercase;
}`,
    },
  },
  {
    term: "line-height",
    translation: "altura de línea",
    description: "definir la distancia vertical entre líneas de texto",
    aliases: ["lineHeight"],
    example: {
      title: "Lectura cómoda",
      code: `p {
  line-height: 1.7;
}`,
    },
  },
  {
    term: "list-style",
    translation: "estilo de listas",
    description: "controlar el tipo de viñeta, posición e imagen de listas",
    aliases: ["listStyle"],
    example: {
      title: "Lista custom",
      code: `ul.features {
  list-style: square inside;
}`,
    },
  },
  {
    term: "margin",
    translation: "margen externo",
    description: "espacio exterior que separa un elemento de otros",
    example: {
      title: "Sección respirable",
      code: `.section {
  margin: 3rem auto;
}`,
    },
  },
  {
    term: "margin-top",
    translation: "margen arriba",
    description: "separación exterior en la parte superior",
    aliases: ["marginTop"],
    example: {
      title: "Offset superior",
      code: `.section + .section {
  margin-top: 4rem;
}`,
    },
  },
  {
    term: "margin-bottom",
    translation: "margen abajo",
    description: "espacio exterior inferior",
    aliases: ["marginBottom"],
    example: {
      title: "Separar cards",
      code: `.card {
  margin-bottom: 1.5rem;
}`,
    },
  },
  {
    term: "margin-left",
    translation: "margen izquierda",
    description: "espacio exterior en el lado izquierdo",
    aliases: ["marginLeft"],
    example: {
      title: "Empujar al centro",
      code: `.cta {
  margin-left: auto;
}`,
    },
  },
  {
    term: "margin-right",
    translation: "margen derecha",
    description: "espacio exterior en el lado derecho",
    aliases: ["marginRight"],
    example: {
      title: "Separar icono",
      code: `.button svg {
  margin-right: 0.5rem;
}`,
    },
  },
  {
    term: "max-height",
    translation: "altura máxima",
    description: "límite superior para la altura",
    aliases: ["maxHeight"],
    example: {
      title: "Contenedor recortado",
      code: `.preview {
  max-height: 320px;
  overflow: auto;
}`,
    },
  },
  {
    term: "max-width",
    translation: "anchura máxima",
    description: "límite superior para el ancho",
    aliases: ["maxWidth"],
    example: {
      title: "Texto legible",
      code: `.article {
  max-width: 720px;
}`,
    },
  },
  {
    term: "min-height",
    translation: "altura mínima",
    description: "altura mínima que debe ocupar un elemento",
    aliases: ["minHeight"],
    example: {
      title: "Viewport completo",
      code: `.hero {
  min-height: 100vh;
}`,
    },
  },
  {
    term: "min-width",
    translation: "anchura mínima",
    description: "ancho mínimo aceptado",
    aliases: ["minWidth"],
    example: {
      title: "Botón ancho",
      code: `.button {
  min-width: 160px;
}`,
    },
  },
  {
    term: "object-fit",
    translation: "cómo se ajusta una imagen dentro de un contenedor",
    description: "controlar el recorte y escalado de contenido reemplazado como imágenes o videos",
    aliases: ["objectFit"],
    example: {
      title: "Portada centrada",
      code: `.card img {
  width: 100%;
  height: 240px;
  object-fit: cover;
}`,
    },
  },
  {
    term: "opacity",
    translation: "transparencia",
    description: "regular la opacidad visual de 0 a 1",
    aliases: ["opacity value"],
    example: {
      title: "Estado deshabilitado",
      code: `.button[disabled] {
  opacity: 0.4;
}`,
    },
  },
  {
    term: "outline",
    translation: "borde externo adicional",
    description: "dibujar un trazo alrededor del borde sin afectar el layout",
    example: {
      title: "Focus accesible",
      code: `.card:focus-visible {
  outline: 2px solid #22d3ee;
  outline-offset: 4px;
}`,
      note: "Ideal para estados de enfoque accesibles.",
    },
  },
  {
    term: "overflow",
    translation: "qué hacer si el contenido sobrepasa",
    description: "definir si el contenido extra se oculta, muestra scroll o se desborda",
    example: {
      title: "Recorte controlado",
      code: `.thumbnail {
  overflow: hidden;
}`,
    },
  },
  {
    term: "overflow-x",
    translation: "desbordamiento horizontal",
    description: "manejar el overflow en el eje X",
    aliases: ["overflowX"],
    example: {
      title: "Scroll horizontal",
      code: `.chips {
  display: flex;
  overflow-x: auto;
  gap: 1rem;
}`,
    },
  },
  {
    term: "overflow-y",
    translation: "desbordamiento vertical",
    description: "manejar el overflow en el eje Y",
    aliases: ["overflowY"],
    example: {
      title: "Panel con scroll",
      code: `.log {
  max-height: 240px;
  overflow-y: scroll;
}`,
    },
  },
  {
    term: "padding",
    translation: "espacio interno",
    description: "separación interna entre el contenido y el borde",
    example: {
      title: "Card acolchada",
      code: `.card {
  padding: 2rem;
}`,
    },
  },
  {
    term: "padding-left",
    translation: "padding izquierdo",
    description: "espacio interno en el lado izquierdo",
    aliases: ["paddingLeft"],
    example: {
      title: "Texto alineado",
      code: `.list-item {
  padding-left: 1.5rem;
}`,
    },
  },
  {
    term: "padding-right",
    translation: "padding derecho",
    description: "espacio interno en el lado derecho",
    aliases: ["paddingRight"],
    example: {
      title: "Acción separada",
      code: `.button {
  padding-right: 2.5rem;
}`,
    },
  },
  {
    term: "padding-top",
    translation: "padding arriba",
    description: "espacio interno superior",
    aliases: ["paddingTop"],
    example: {
      title: "Hero equilibrado",
      code: `.hero {
  padding-top: 6rem;
}`,
    },
  },
  {
    term: "padding-bottom",
    translation: "padding abajo",
    description: "espacio interno inferior",
    aliases: ["paddingBottom"],
    example: {
      title: "Footer aireado",
      code: `.footer {
  padding-bottom: 4rem;
}`,
    },
  },
  {
    term: "position",
    translation: "modelo de posicionamiento",
    description: "definir si un elemento es static, relative, absolute, fixed o sticky",
    example: {
      title: "Header sticky",
      code: `header {
  position: sticky;
  top: 0;
}`,
    },
  },
  {
    term: "pseudo-class",
    translation: "estado especial",
    description: "selector que representa un estado dinámico como :hover, :focus o :checked",
    aliases: ["pseudo class"],
    example: {
      title: "Focus visible",
      code: `.input:focus-visible {
  border-color: #38bdf8;
}`,
      note: "Activa estilos cuando el elemento cumple una condición.",
    },
    what: "Lo empleamos para responder a interacciones o estados semánticos sin JavaScript.",
  },
  {
    term: "pseudo-element",
    translation: "elemento falso",
    description: "selector que crea un nodo virtual como ::before o ::after",
    aliases: ["pseudo element"],
    example: {
      title: "Decorador antes",
      code: `.title::before {
  content: "";
  width: 48px;
  height: 4px;
  background: currentColor;
}`,
    },
  },
  {
    term: "relative",
    translation: "posición relativa",
    description: "activar un nuevo contexto sin salir del flujo",
    example: {
      title: "Wrapper relativo",
      code: `.card {
  position: relative;
}`,
    },
  },
  {
    term: "absolute",
    translation: "posición absoluta",
    description: "sacar el elemento del flujo y posicionarlo respecto a su contenedor posicionado",
    example: {
      title: "Badge posicionado",
      code: `.badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}`,
    },
  },
  {
    term: "right",
    translation: "alineación derecha",
    description: "mover un elemento posicionado respecto al borde derecho",
    example: {
      title: "Tooltip derecho",
      code: `.tooltip {
  right: -1rem;
}`,
    },
  },
  {
    term: "rotate",
    translation: "rotar elementos",
    description: "girar un elemento usando transform",
    example: {
      title: "Etiqueta inclinada",
      code: `.label {
  transform: rotate(-5deg);
}`,
    },
  },
  {
    term: "row",
    translation: "fila",
    description: "disponer elementos en sentido horizontal",
    example: {
      title: "Row en flex",
      code: `.toolbar {
  display: flex;
  flex-direction: row;
}`,
    },
    what: "Lo usamos para colocar información de izquierda a derecha en layouts.",
  },
  {
    term: "scale",
    translation: "escalar el tamaño",
    description: "aumentar o disminuir el tamaño mediante transform",
    example: {
      title: "Hover ampliado",
      code: `.card:hover {
  transform: scale(1.02);
}`,
    },
  },
  {
    term: "scroll-behavior",
    translation: "comportamiento del scroll",
    description: "definir si el desplazamiento es instantáneo o suave",
    aliases: ["scrollBehavior"],
    example: {
      title: "Scroll suave",
      code: `html {
  scroll-behavior: smooth;
}`,
    },
  },
  {
    term: "shadow",
    translation: "sombra",
    description: "representar zonas sombreadas para dar profundidad",
    example: {
      title: "Drop shadow",
      code: `.avatar {
  filter: drop-shadow(0 10px 25px rgba(15, 23, 42, 0.35));
}`,
    },
  },
  {
    term: "size",
    translation: "tamaño",
    description: "definir el tamaño total de un recurso o página",
    example: {
      title: "Página A4",
      code: `@page {
  size: A4 portrait;
}`,
      note: "Común en estilos para impresión.",
    },
    how: "Define size dentro de @page o componentes que necesitan declarar el formato completo.",
  },
  {
    term: "sticky",
    translation: "pegajoso al hacer scroll",
    description: "comportar un elemento como relativo hasta que alcanza un offset y se fija",
    example: {
      title: "Columna sticky",
      code: `.summary {
  position: sticky;
  top: 2rem;
}`,
    },
  },
  {
    term: "stroke",
    translation: "borde en SVG",
    description: "definir color y grosor de trazos SVG",
    example: {
      title: "Gráfico vectorial",
      code: `path {
  fill: none;
  stroke: #0ea5e9;
  stroke-width: 2;
}`,
    },
  },
  {
    term: "style",
    translation: "estilos en línea",
    description: "atributo HTML que permite declarar CSS directamente",
    example: {
      title: "Override puntual",
      code: `<button style="background:#0f172a;color:white;">
  Guardar
</button>`,
      note: "Úsalo solo para ajustes puntuales o generados dinámicamente.",
    },
    how: "Prefiere clases reutilizables y deja los estilos en línea para casos generados en runtime.",
  },
  {
    term: "text-align",
    translation: "alineación del texto",
    description: "alinear contenido inline respecto al contenedor",
    aliases: ["textAlign"],
    example: {
      title: "Texto centrado",
      code: `.empty-state {
  text-align: center;
}`,
    },
  },
  {
    term: "text-decoration",
    translation: "decoraciones del texto",
    description: "aplicar subrayado, tachado o estilos personalizados",
    aliases: ["textDecoration"],
    example: {
      title: "Links discretos",
      code: `a {
  text-decoration: underline;
  text-decoration-color: rgba(255,255,255,0.4);
}`,
    },
  },
  {
    term: "text-transform",
    translation: "mayúsculas o minúsculas",
    description: "convertir el texto a uppercase, lowercase o capitalize",
    aliases: ["textTransform"],
    example: {
      title: "Etiqueta uppercase",
      code: `.tag {
  text-transform: uppercase;
}`,
    },
  },
  {
    term: "transform",
    translation: "transformaciones",
    description: "aplicar rotaciones, traslaciones, escalados o sesgos",
    example: {
      title: "Tarjeta animada",
      code: `.card:hover {
  transform: translateY(-6px) scale(1.01);
}`,
    },
  },
  {
    term: "transition",
    translation: "animación suave entre cambios",
    description: "definir la duración y curva de cambio para propiedades",
    example: {
      title: "Transición global",
      code: `.interactive {
  transition: all 200ms ease-out;
}`,
    },
  },
  {
    term: "translate",
    translation: "mover el elemento en X/Y",
    description: "desplazar elementos usando transform translate",
    example: {
      title: "Botón deslizante",
      code: `.button:active {
  transform: translateY(1px);
}`,
    },
  },
  {
    term: "unit",
    translation: "unidad",
    description: "medidas como px, %, rem, em, vh, vw",
    example: {
      title: "Unidades combinadas",
      code: `.hero {
  padding: 8vh 5vw;
  font-size: clamp(1rem, 1.2vw, 1.5rem);
}`,
    },
    how: "Selecciona la unidad según el contexto: px para precisión, rem para accesibilidad y porcentajes para layouts fluidos.",
  },
  {
    term: "user-select",
    translation: "permitir o impedir seleccionar texto",
    description: "controlar si el usuario puede seleccionar el contenido",
    aliases: ["userSelect"],
    example: {
      title: "Evitar selección",
      code: `.button {
  user-select: none;
}`,
    },
  },
  {
    term: "variable (custom property)",
    translation: "valor CSS definido con --nombre",
    description: "definir valores reutilizables mediante propiedades personalizadas",
    aliases: ["custom property", "CSS variable", "var()"],
    example: {
      title: "Paleta global",
      code: `:root {
  --brand: #0ea5e9;
}
button {
  background: var(--brand);
}`,
    },
    how: "Declara --nombre en un scope (idealmente :root) y consúmelo con var(--nombre).",
  },
  {
    term: "vertical-align",
    translation: "alineación vertical en inline o tabla",
    description: "alinear elementos en línea o celdas de tabla respecto a la línea base",
    aliases: ["verticalAlign"],
    example: {
      title: "Icono alineado",
      code: `.icon {
  vertical-align: middle;
}`,
    },
  },
  {
    term: "visibility",
    translation: "visible u oculto",
    description: "mostrar u ocultar un elemento manteniendo su espacio",
    example: {
      title: "Ocultar sin colapsar",
      code: `.banner[aria-hidden="true"] {
  visibility: hidden;
}`,
    },
  },
  {
    term: "vw",
    translation: "porcentaje del ancho de la ventana",
    description: "unidad relativa al ancho del viewport",
    example: {
      title: "Tipografía fluida",
      code: `h1 {
  font-size: clamp(2.5rem, 7vw, 4rem);
}`,
    },
  },
  {
    term: "vh",
    translation: "porcentaje del alto de la ventana",
    description: "unidad relativa al alto del viewport",
    example: {
      title: "Sección pantalla completa",
      code: `.section {
  min-height: 100vh;
}`,
    },
  },
  {
    term: "z-index",
    translation: "orden de apilamiento",
    description: "controlar qué elemento se muestra encima cuando hay solapamientos",
    aliases: ["zIndex"],
    example: {
      title: "Modal en frente",
      code: `.modal {
  position: fixed;
  z-index: 50;
}`,
    },
  },
  {
    term: "zoom",
    translation: "escalar la vista",
    description: "ajustar el zoom de un elemento (soporte limitado)",
    example: {
      title: "Compatibilidad heredada",
      code: `.legacy {
  zoom: 1;
}`,
      note: "Úsalo solo para hacks en navegadores antiguos.",
    },
    how: "Evita zoom salvo que necesites compatibilidad con motores antiguos; prefiere transform: scale.",
  },
];

export const cssTerms: CssInputTerm[] = cssBaseTerms;
