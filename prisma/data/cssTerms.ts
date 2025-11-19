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
      code: `section.cards {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}
section.cards > article {
  flex: 1;
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
  font-size: clamp(2.5rem, 4vw, 3.75rem);
  line-height: 1.1;
}`,
      noteEs: "La fuente crece con el ancho pero nunca deja de ser legible.",
      noteEn: "Font size reacts to viewport width but stays readable.",
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}`,
      noteEs: "Las tarjetas ocupan el espacio disponible sin romper filas.",
      noteEn: "Cards reflow automatically without hard breakpoints.",
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
  aspect-ratio: 16 / 9;
  background: #0f172a;
  border-radius: 1rem;
}`,
      noteEs: "Evita los viejos hacks con padding-top.",
      noteEn: "Replaces the classic padding-top hacks.",
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
  backdrop-filter: blur(18px) saturate(120%);
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.15);
}`,
      noteEs: "Funciona sólo si el elemento tiene fondo semi-transparente.",
      noteEn: "Needs a translucent background to be visible.",
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
  display: grid;
  grid-auto-flow: column;
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}
.carousel > article {
  scroll-snap-align: center;
}`,
      noteEs: "Funciona con scroll natural, sin JS adicional.",
      noteEn: "Works with natural scrolling, no JS required.",
    },
    whatEs: "Sirve para experiencias táctiles consistentes donde cada card se centra.",
    whatEn: "Ensures every card or slide centers perfectly on touch experiences.",
    howEs: "Añade scroll-snap-type al contenedor y scroll-snap-align a cada ítem.",
    howEn: "Set scroll-snap-type on the container plus scroll-snap-align on the children.",
    languageOverride: Language.css,
  },
];
