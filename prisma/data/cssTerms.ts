import { Category, Language } from "@prisma/client";
import type { SeedTermInput } from "../dictionary-types";

export const cssCuratedTerms: SeedTermInput[] = [
  {
    term: "align-items",
    translation: "alinear elementos en el eje cruzado",
    category: Category.frontend,
    descriptionEs: "Propiedad de flexbox y grid que alinea los hijos verticalmente cuando sobra espacio en el eje cruzado.",
    descriptionEn: "Flexbox and grid property that aligns items along the cross axis whenever there is extra space.",
    aliases: ["alignItems", "align-items property"],
    tags: ["css", "flexbox", "layout"],
    example: {
      titleEs: "Cards centradas verticalmente",
      titleEn: "Vertically centered cards",
      code: `/* Definimos un contenedor flex para las tarjetas */
section.cards {
  /* Activamos flexbox en el contenedor */
  display: flex;
  
  /* Centramos los elementos en el eje cruzado (vertical) */
  /* Esto hace que todas las cards tengan la misma altura visual */
  align-items: center;
  
  /* Añadimos espacio entre las tarjetas */
  gap: 1.25rem;
}

/* Estilizamos cada tarjeta individual */
section.cards > article {
  /* Cada card ocupa el mismo espacio disponible */
  flex: 1;
  
  /* Establecemos una altura mínima */
  min-height: 280px;
}`,
      noteEs: "Mantiene cada card en la misma altura sin trucos adicionales.",
      noteEn: "Keeps every card aligned without trick properties.",
    },
    whatEs: "Se usa para definir cómo se acomodan los elementos respecto al eje perpendicular al flujo.",
    whatEn: "It controls how children sit on the cross axis when there is remaining room.",
    howEs: "Declara display:flex o display:grid y ajusta align-items en el contenedor. Experimenta con valores como center, flex-end o stretch.",
    howEn: "Set display:flex or grid on the container and tweak align-items with values such as center, flex-end or stretch.",
    languageOverride: Language.css,
    secondExample: {
      titleEs: "Diferentes valores de align-items",
      titleEn: "Different align-items values",
      code: `<div style="display: flex; height: 150px; gap: 10px; margin-bottom: 20px;">
  <div style="flex: 1; display: flex; align-items: flex-start; background: linear-gradient(to bottom, #667eea, #764ba2); border-radius: 8px; padding: 10px; color: white; font-size: 12px; font-weight: bold;">
    flex-start
  </div>
  <div style="flex: 1; display: flex; align-items: center; background: linear-gradient(to bottom, #f093fb, #f5576c); border-radius: 8px; padding: 10px; color: white; font-size: 12px; font-weight: bold;">
    center
  </div>
  <div style="flex: 1; display: flex; align-items: flex-end; background: linear-gradient(to bottom, #4facfe, #00f2fe); border-radius: 8px; padding: 10px; color: white; font-size: 12px; font-weight: bold;">
    flex-end
  </div>
  <div style="flex: 1; display: flex; align-items: stretch; background: linear-gradient(to bottom, #43e97b, #38f9d7); border-radius: 8px; padding: 10px; color: white; font-size: 12px; font-weight: bold;">
    stretch
  </div>
</div>`,
      noteEs: "Cada columna usa un valor diferente de align-items. Observa cómo se posiciona el texto dentro de cada contenedor.",
      noteEn: "Each column uses a different align-items value. Notice how text positions within each container.",
    },
    exerciseExample: {
      titleEs: "Centrado absoluto (Patrón clásico)",
      titleEn: "Absolute centering (Classic pattern)",
      code: `<div style="display: flex; justify-content: center; align-items: center; height: 300px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;">
  <div style="background: white; padding: 30px 50px; border-radius: 8px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
    <h2 style="margin: 0 0 10px 0; color: #333; font-size: 24px;">Centrado Perfecto</h2>
    <p style="margin: 0; color: #666; font-size: 14px;">justify-content + align-items = centro absoluto</p>
  </div>
</div>`,
      noteEs: "La combinación clásica para centrar cualquier contenido dentro de un contenedor.",
      noteEn: "The classic combo to center any content within a container.",
    },
  },
  {
    term: "clamp",
    translation: "limitar valores con un rango lógico",
    category: Category.frontend,
    descriptionEs: "Función CSS que fija un mínimo, un valor ideal y un máximo sin medias queries.",
    descriptionEn: "CSS helper that sets a min, preferred and max value without media queries.",
    aliases: ["clamp()"],
    tags: ["css", "fluid", "typography"],
    example: {
      titleEs: "Tipografía fluida",
      titleEn: "Fluid type",
      code: `h1 {
  /* Usamos clamp() para crear tipografía responsive */
  /* Sintaxis: clamp(mínimo, valor preferido, máximo) */
  /* 2.5rem = tamaño mínimo en pantallas pequeñas */
  /* 4vw = crece con el ancho del viewport */
  /* 3.75rem = tamaño máximo en pantallas grandes */
  font-size: clamp(2.5rem, 4vw, 3.75rem);
  
  /* Altura de línea compacta para títulos */
  line-height: 1.1;
}`,
      noteEs: "La fuente crece con el ancho pero nunca deja de ser legible.",
      noteEn: "Font size reacts to viewport width but stays readable.",
    },
    secondExample: {
      titleEs: "Ancho de tarjeta fluido",
      titleEn: "Fluid card width",
      code: `.card {
  /* Mínimo 300px, idealmente 50%, máximo 600px */
  width: clamp(300px, 50%, 600px);
  margin: 0 auto;
}`,
      noteEs: "Controla el ancho sin media queries.",
      noteEn: "Controls width without media queries.",
    },
    exerciseExample: {
      titleEs: "Espaciado dinámico",
      titleEn: "Dynamic spacing",
      code: `.section {
  /* Padding crece con la pantalla */
  padding: clamp(1rem, 5vw, 4rem);
}`,
      noteEs: "Espaciado cómodo en móvil y escritorio.",
      noteEn: "Comfortable spacing on mobile and desktop.",
    },
    whatEs: "Resuelve diseños fluidos declarando un valor responsive sin cálculos manuales.",
    whatEn: "It gives you responsive sizing logic with a single expression.",
    howEs: "Define clamp(min, preferido, max) en propiedades numéricas: font-size, width, gaps o padding.",
    howEn: "Use clamp(min, preferred, max) on numeric properties like font-size, width, gaps or padding.",
    languageOverride: Language.css,
  },
  {
    term: "grid-template-columns",
    translation: "patrón de columnas para layouts",
    category: Category.frontend,
    descriptionEs: "Declara cómo se distribuyen las columnas de un grid con fracciones, minmax o repeat.",
    descriptionEn: "Defines the column track list in CSS Grid using fractions, minmax or repeat helpers.",
    aliases: ["grid template columns"],
    tags: ["css", "grid", "layout"],
    example: {
      titleEs: "Dashboard elástico",
      titleEn: "Elastic dashboard",
      code: `.dashboard {
  /* Activamos CSS Grid en el contenedor */
  display: grid;
  
  /* Creamos columnas que se adaptan automáticamente */
  /* repeat(auto-fit, ...) = crea tantas columnas como quepan */
  /* minmax(240px, 1fr) = cada columna mínimo 240px, máximo 1 fracción del espacio */
  /* Resultado: las tarjetas se reorganizan automáticamente según el espacio */
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  
  /* Espacio entre las tarjetas del grid */
  gap: 1.5rem;
}`,
      noteEs: "Las tarjetas ocupan el espacio disponible sin romper filas.",
      noteEn: "Cards reflow automatically without hard breakpoints.",
    },
    secondExample: {
      titleEs: "Layout principal",
      titleEn: "Main layout",
      code: `.layout {
  display: grid;
  /* Sidebar fijo 250px, contenido resto */
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
}`,
      noteEs: "Estructura clásica de dashboard.",
      noteEn: "Classic dashboard structure.",
    },
    exerciseExample: {
      titleEs: "Grid 12 columnas",
      titleEn: "12-column grid",
      code: `.container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
}

.col-4 { grid-column: span 4; }
.col-8 { grid-column: span 8; }`,
      noteEs: "Sistema de grid flexible.",
      noteEn: "Flexible grid system.",
    },
    whatEs: "Permite describir estructuras complejas con pocas líneas y mantiene el grid estable.",
    whatEn: "Lets you describe complex grids declaratively while keeping layouts stable.",
    howEs: "Combina repeat y minmax para columnas fluidas o nombra líneas con '[]' si necesitas colocar elementos por nombre.",
    howEn: "Mix repeat with minmax for fluid columns or name grid lines with brackets to place elements explicitly.",
    languageOverride: Language.css,
  },
  {
    term: "aspect-ratio",
    translation: "relación de aspecto nativa",
    category: Category.frontend,
    descriptionEs: "Propiedad que reserva el alto correcto de un elemento aunque sólo definas el ancho.",
    descriptionEn: "Property that locks the intrinsic ratio so height is calculated automatically from width.",
    aliases: ["aspectRatio"],
    tags: ["css", "media", "responsive"],
    example: {
      titleEs: "Tarjetas de video",
      titleEn: "Video cards",
      code: `.video-card {
  /* Establecemos una relación de aspecto 16:9 */
  /* El navegador calculará automáticamente la altura */
  /* basándose en el ancho del elemento */
  aspect-ratio: 16 / 9;
  
  /* Color de fondo mientras carga el video */
  background: #0f172a;
  
  /* Bordes redondeados para estética moderna */
  border-radius: 1rem;
}`,
      noteEs: "Evita los viejos hacks con padding-top.",
      noteEn: "Replaces the classic padding-top hacks.",
    },
    secondExample: {
      titleEs: "Avatar cuadrado",
      titleEn: "Square avatar",
      code: `.avatar {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 50%;
}`,
      noteEs: "Mantiene la imagen cuadrada sin importar el ancho.",
      noteEn: "Keeps image square regardless of width.",
    },
    exerciseExample: {
      titleEs: "Imagen de héroe cinematográfica",
      titleEn: "Cinematic hero image",
      code: `.hero-image {
  width: 100%;
  aspect-ratio: 21 / 9;
  object-fit: cover;
}`,
      noteEs: "Proporción ultra ancha para impacto visual.",
      noteEn: "Ultra-wide ratio for visual impact.",
    },
    whatEs: "Resuelve placeholders para videos, iframes o componentes con proporción fija.",
    whatEn: "Keeps placeholders for videos, iframes or cards perfectly scaled.",
    howEs: "Declara aspect-ratio en contenedores multimedia o componentes gráficos y deja que el layout se ajuste.",
    howEn: "Set aspect-ratio on media containers or graphical components and let the browser honor it.",
    languageOverride: Language.css,
  },
  {
    term: "backdrop-filter",
    translation: "aplicar desenfoques al fondo",
    category: Category.frontend,
    descriptionEs: "Permite difuminar o saturar el contenido que está detrás de un elemento translúcido.",
    descriptionEn: "Applies blur or color effects to what lives behind a translucent element.",
    aliases: ["frosted glass"],
    tags: ["css", "effects", "ui"],
    example: {
      titleEs: "Glassmorphism en cards",
      titleEn: "Glassmorphism cards",
      code: `.glass-card {
  /* Aplicamos efectos al contenido detrás del elemento */
  /* blur(18px) = desenfoque de 18 píxeles */
  /* saturate(120%) = aumentamos la saturación de color en 20% */
  backdrop-filter: blur(18px) saturate(120%);
  
  /* Fondo semi-transparente (REQUERIDO para que funcione backdrop-filter) */
  /* rgba(15, 23, 42, 0.45) = color oscuro con 45% de opacidad */
  background: rgba(15, 23, 42, 0.45);
  
  /* Borde sutil semi-transparente para definir los límites */
  border: 1px solid rgba(255, 255, 255, 0.15);
}`,
      noteEs: "Funciona sólo si el elemento tiene fondo semi-transparente.",
      noteEn: "Needs a translucent background to be visible.",
    },
    secondExample: {
      titleEs: "Efecto blanco y negro",
      titleEn: "Grayscale effect",
      code: `.overlay {
  position: absolute;
  inset: 0;
  backdrop-filter: grayscale(100%);
  pointer-events: none;
}`,
      noteEs: "Desatura todo lo que está detrás.",
      noteEn: "Desaturates everything behind it.",
    },
    exerciseExample: {
      titleEs: "Modal con fondo borroso",
      titleEn: "Blurred modal background",
      code: `.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 50;
}`,
      noteEs: "Enfoca la atención en el modal.",
      noteEn: "Focuses attention on the modal.",
    },
    whatEs: "Es útil para overlays, barras flotantes o paneles donde quieres ver el contenido subyacente.",
    whatEn: "Great for overlays, floating panels or nav bars where you want to hint at underlying content.",
    howEs: "Combínalo con background rgba() y border suaves para dar profundidad sin saturar la UI.",
    howEn: "Combine it with rgba backgrounds and subtle borders to add depth without clutter.",
    languageOverride: Language.css,
  },
  {
    term: "scroll-snap",
    translation: "alinear scroll en posiciones definidas",
    category: Category.frontend,
    descriptionEs: "Familia de propiedades que hace que el scroll se detenga en puntos exactos (galerías, carruseles).",
    descriptionEn: "Set of properties that snaps scrolling containers to exact stops (carousels, stories, onboarding).",
    aliases: ["scroll snapping"],
    tags: ["css", "scroll", "ux"],
    example: {
      titleEs: "Carrusel accesible",
      titleEn: "Accessible carousel",
      code: `.carousel {
  /* Usamos grid para layout horizontal */
  display: grid;
  
  /* Las columnas se crean automáticamente en dirección horizontal */
  grid-auto-flow: column;
  
  /* Espacio entre cada slide del carrusel */
  gap: 1rem;
  
  /* Permitimos scroll horizontal */
  overflow-x: auto;
  
  /* Activamos snap en el eje X (horizontal) */
  /* "mandatory" = siempre se ajusta a un punto de snap */
  scroll-snap-type: x mandatory;
}

/* Configuramos cada slide individual */
.carousel > article {
  /* Cada slide se centra cuando el usuario hace scroll */
  scroll-snap-align: center;
}`,
      noteEs: "Funciona con scroll natural, sin JS adicional.",
      noteEn: "Works with natural scrolling, no JS required.",
    },
    secondExample: {
      titleEs: "Scroll vertical página completa",
      titleEn: "Full page vertical scroll",
      code: `html {
  scroll-snap-type: y mandatory;
}

section {
  height: 100vh;
  scroll-snap-align: start;
}`,
      noteEs: "Efecto de presentación de diapositivas.",
      noteEn: "Slideshow presentation effect.",
    },
    exerciseExample: {
      titleEs: "Lista de tags horizontal",
      titleEn: "Horizontal tag list",
      code: `.tags {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  gap: 8px;
  padding: 16px;
}

.tag {
  scroll-snap-align: start;
}`,
      noteEs: "Proximity es menos agresivo que mandatory.",
      noteEn: "Proximity is less aggressive than mandatory.",
    },
    whatEs: "Sirve para experiencias táctiles consistentes donde cada card se centra.",
    whatEn: "Ensures every card or slide centers perfectly on touch experiences.",
    howEs: "Añade scroll-snap-type al contenedor y scroll-snap-align a cada ítem.",
    howEn: "Set scroll-snap-type on the container plus scroll-snap-align on the children.",
    languageOverride: Language.css,
  },
];
