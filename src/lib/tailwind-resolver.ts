import type { TermDTO } from "@/types/term";

type TailwindResolveOptions = {
  query: string;
  page: number;
  pageSize: number;
  category?: string;
  tag?: string;
  status?: string;
  context?: string;
};

type TailwindResolveResult = {
  items: TermDTO[];
  total: number;
};

type ParsedTailwindToken = {
  raw: string;
  base: string;
  variants: string[];
  important: boolean;
  negative: boolean;
  prefix: string | null;
  value: string | null;
  alpha: string | null;
  arbitrary: boolean;
  arbitraryValue: string | null;
  isBare: boolean;
};

const VARIANT_LABELS: Record<string, string> = {
  sm: "sm (>=640px)",
  md: "md (>=768px)",
  lg: "lg (>=1024px)",
  xl: "xl (>=1280px)",
  "2xl": "2xl (>=1536px)",
  hover: "hover",
  focus: "focus",
  "focus-visible": "focus-visible",
  active: "active",
  disabled: "disabled",
  visited: "visited",
  checked: "checked",
  first: "first",
  last: "last",
  odd: "odd",
  even: "even",
  "group-hover": "group-hover",
  "group-focus": "group-focus",
  "peer-checked": "peer-checked",
  "peer-focus": "peer-focus",
  dark: "dark",
  "motion-safe": "motion-safe",
  "motion-reduce": "motion-reduce",
  print: "print",
  landscape: "landscape",
  portrait: "portrait",
  ltr: "ltr",
  rtl: "rtl",
  open: "open",
  "read-only": "read-only",
  "read-write": "read-write",
  "placeholder-shown": "placeholder-shown",
  required: "required",
  optional: "optional",
  invalid: "invalid",
  valid: "valid",
  target: "target",
  selection: "selection",
  marker: "marker",
  file: "file",
  before: "before",
  after: "after",
  "first-letter": "first-letter",
  "first-line": "first-line",
};

const PREFIX_DESCRIPTIONS: Record<string, string> = {
  bg: "color de fondo",
  text: "color o tamano de texto",
  font: "tipografia",
  tracking: "tracking (espaciado de letras)",
  leading: "interlineado",
  w: "ancho",
  h: "alto",
  "min-w": "ancho minimo",
  "max-w": "ancho maximo",
  "min-h": "alto minimo",
  "max-h": "alto maximo",
  p: "padding",
  px: "padding horizontal",
  py: "padding vertical",
  pt: "padding superior",
  pr: "padding derecho",
  pb: "padding inferior",
  pl: "padding izquierdo",
  m: "margin",
  mx: "margin horizontal",
  my: "margin vertical",
  mt: "margin superior",
  mr: "margin derecho",
  mb: "margin inferior",
  ml: "margin izquierdo",
  "space-x": "espaciado horizontal entre hijos",
  "space-y": "espaciado vertical entre hijos",
  gap: "gap",
  "gap-x": "gap horizontal",
  "gap-y": "gap vertical",
  "grid-cols": "numero de columnas",
  "grid-rows": "numero de filas",
  "auto-cols": "auto columns",
  "auto-rows": "auto rows",
  "col-span": "column span",
  "col-start": "inicio de columna",
  "col-end": "fin de columna",
  "row-span": "row span",
  "row-start": "inicio de fila",
  "row-end": "fin de fila",
  items: "alineacion de items",
  justify: "justificacion",
  content: "alineacion de contenido",
  self: "alineacion propia",
  "place-items": "alineacion de items (place)",
  "place-content": "alineacion de contenido (place)",
  "place-self": "alineacion propia (place)",
  flex: "flexbox",
  basis: "flex-basis",
  grow: "flex-grow",
  shrink: "flex-shrink",
  order: "orden",
  rounded: "radio de borde",
  shadow: "sombra",
  ring: "ring (focus)",
  "ring-offset": "ring-offset",
  border: "borde",
  "border-x": "borde horizontal",
  "border-y": "borde vertical",
  "border-t": "borde superior",
  "border-b": "borde inferior",
  "border-l": "borde izquierdo",
  "border-r": "borde derecho",
  opacity: "opacidad",
  z: "z-index",
  top: "posicion top",
  right: "posicion right",
  bottom: "posicion bottom",
  left: "posicion left",
  inset: "posicion inset",
  "inset-x": "posicion inset-x",
  "inset-y": "posicion inset-y",
  "translate-x": "traslacion X",
  "translate-y": "traslacion Y",
  scale: "escala",
  rotate: "rotacion",
  "skew-x": "skew X",
  "skew-y": "skew Y",
  duration: "duracion de transicion",
  ease: "timing de transicion",
  delay: "delay de transicion",
  transition: "transicion",
  animate: "animacion",
  overflow: "overflow",
  object: "object-fit/position",
  aspect: "aspect ratio",
  "line-clamp": "line clamp",
  whitespace: "white-space",
  truncate: "truncate",
  cursor: "cursor",
  select: "user-select",
  "pointer-events": "pointer events",
  "bg-gradient-to": "direccion del gradiente",
  from: "color inicial del gradiente",
  via: "color intermedio del gradiente",
  to: "color final del gradiente",
  outline: "outline",
  "outline-offset": "outline offset",
  "divide-x": "divisor horizontal",
  "divide-y": "divisor vertical",
  fill: "fill",
  stroke: "stroke",
  "backdrop-blur": "backdrop blur",
  "backdrop-opacity": "backdrop opacity",
  "backdrop-brightness": "backdrop brightness",
  "backdrop-contrast": "backdrop contrast",
  "backdrop-grayscale": "backdrop grayscale",
  "backdrop-hue-rotate": "backdrop hue-rotate",
  "backdrop-invert": "backdrop invert",
  "backdrop-saturate": "backdrop saturate",
  "backdrop-sepia": "backdrop sepia",
  filter: "filter",
  blur: "blur",
  brightness: "brightness",
  contrast: "contrast",
  grayscale: "grayscale",
  "hue-rotate": "hue-rotate",
  invert: "invert",
  saturate: "saturate",
  sepia: "sepia",
};

const BARE_DESCRIPTIONS: Record<string, string> = {
  flex: "contenedor flex",
  grid: "contenedor grid",
  block: "display block",
  inline: "display inline",
  "inline-block": "display inline-block",
  "inline-flex": "display inline-flex",
  "inline-grid": "display inline-grid",
  hidden: "ocultar elemento",
  contents: "display contents",
  relative: "posicion relative",
  absolute: "posicion absolute",
  fixed: "posicion fixed",
  sticky: "posicion sticky",
  container: "container responsive",
  "sr-only": "solo lectores de pantalla",
  "not-sr-only": "visibilidad normal (screen readers)",
  underline: "subrayado",
  "no-underline": "sin subrayado",
  "line-through": "tachado",
  uppercase: "texto en mayusculas",
  lowercase: "texto en minusculas",
  capitalize: "texto capitalizado",
  italic: "texto italico",
  "not-italic": "texto sin italica",
  visible: "visible",
  invisible: "invisible",
  "table-auto": "tabla auto",
  "table-fixed": "tabla fixed",
  table: "tabla",
  "antialiased": "antialiasing",
  "subpixel-antialiased": "subpixel antialiasing",
  prose: "tipografia (plugin)",
};

const PREFIXES = Object.keys(PREFIX_DESCRIPTIONS).sort((a, b) => b.length - a.length);
const BARE_UTILITIES = new Set(Object.keys(BARE_DESCRIPTIONS));

export function resolveTailwindTerms(options: TailwindResolveOptions): TailwindResolveResult | null {
  const query = options.query.trim();
  if (!query) return null;
  if (options.category && options.category !== "frontend") return null;
  if (options.tag && !options.tag.toLowerCase().includes("tailwind")) return null;
  if (options.status && options.status !== "approved") return null;
  if (options.context && options.context === "interview") return null;

  const tokens = extractTokens(query);
  const parsedTokens = dedupe(tokens.map(parseTailwindToken).filter(isParsedToken));
  if (!parsedTokens.length) return null;

  const allItems = parsedTokens.map((token, index) => buildTailwindItem(token, index));
  const start = (options.page - 1) * options.pageSize;
  const items = allItems.slice(start, start + options.pageSize);
  return {
    items,
    total: allItems.length,
  };
}

function extractTokens(query: string): string[] {
  const classMatch = query.match(/class(Name)?\s*=\s*(["'`])([\s\S]*?)\2/i);
  const source = classMatch ? classMatch[3] : query;
  return source
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function dedupe(tokens: ParsedTailwindToken[]): ParsedTailwindToken[] {
  const seen = new Set<string>();
  const result: ParsedTailwindToken[] = [];
  tokens.forEach((token) => {
    const key = token.raw;
    if (seen.has(key)) return;
    seen.add(key);
    result.push(token);
  });
  return result;
}

function isParsedToken(value: ParsedTailwindToken | null): value is ParsedTailwindToken {
  return value !== null;
}

function parseTailwindToken(rawToken: string): ParsedTailwindToken | null {
  const cleaned = normalizeToken(rawToken);
  if (!cleaned) return null;
  const segments = splitVariants(cleaned);
  if (!segments.length) return null;
  const baseSegmentRaw = segments.pop() ?? "";
  if (!baseSegmentRaw) return null;
  const variants = segments;
  let important = false;
  let negative = false;
  let baseSegment = baseSegmentRaw;
  if (baseSegment.startsWith("!")) {
    important = true;
    baseSegment = baseSegment.slice(1);
  }
  if (baseSegment.startsWith("-")) {
    negative = true;
    baseSegment = baseSegment.slice(1);
  }
  const baseInfo = parseBase(baseSegment);
  if (!baseInfo) return null;
  return {
    raw: cleaned,
    base: baseSegment,
    variants,
    important,
    negative,
    ...baseInfo,
  };
}

function normalizeToken(rawToken: string): string {
  let token = rawToken.trim();
  if (!token) return "";
  const wrapper = token[0];
  if ((wrapper === '"' || wrapper === "'" || wrapper === "`") && token.endsWith(wrapper)) {
    token = token.slice(1, -1);
  }
  token = token.replace(/[;,]+$/g, "");
  return token.trim();
}

function splitVariants(token: string): string[] {
  const segments: string[] = [];
  let current = "";
  let depth = 0;
  for (const char of token) {
    if (char === "[") depth += 1;
    if (char === "]" && depth > 0) depth -= 1;
    if (char === ":" && depth === 0) {
      if (current) segments.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  if (current) segments.push(current);
  return segments;
}

function parseBase(base: string): Omit<ParsedTailwindToken, "raw" | "variants" | "important" | "negative" | "base"> | null {
  let prefix: string | null = null;
  let value: string | null = null;
  let alpha: string | null = null;
  let arbitrary = false;
  let arbitraryValue: string | null = null;
  let isBare = false;

  const arbitraryMatch = base.match(/^([a-z0-9-]+)-\[(.+)\]$/i);
  if (arbitraryMatch) {
    prefix = arbitraryMatch[1];
    arbitraryValue = arbitraryMatch[2];
    arbitrary = true;
    value = arbitraryValue;
  } else {
    prefix = matchPrefix(base);
  }

  if (prefix) {
    if (base === prefix) {
      isBare = true;
    } else if (base.startsWith(prefix + "-")) {
      value = base.slice(prefix.length + 1);
    }
  } else if (BARE_UTILITIES.has(base)) {
    isBare = true;
  } else {
    return null;
  }

  if (value && value.includes("/")) {
    const [baseValue, alphaValue] = value.split("/", 2);
    value = baseValue || value;
    alpha = alphaValue || null;
  }

  return {
    prefix,
    value,
    alpha,
    arbitrary,
    arbitraryValue,
    isBare,
  };
}

function matchPrefix(base: string): string | null {
  for (const prefix of PREFIXES) {
    if (base === prefix) return prefix;
    if (base.startsWith(prefix + "-")) return prefix;
  }
  return null;
}

function buildTailwindItem(token: ParsedTailwindToken, index: number): TermDTO {
  const variantLabels = token.variants.map(describeVariant).filter(Boolean);
  const baseDescription = describeBase(token);
  const details: string[] = [];

  if (token.value) {
    const valueLabel = token.alpha ? `${token.value}/${token.alpha}` : token.value;
    details.push(`valor ${valueLabel}`);
  }
  if (token.arbitrary) details.push("valor arbitrario");
  if (token.important) details.push("!important");
  if (token.negative) details.push("valor negativo");
  if (variantLabels.length) details.push(`variantes ${variantLabels.join(", ")}`);

  const detailText = details.length ? ` (${details.join(", ")})` : "";
  const meaning = `Clase utilitaria de Tailwind CSS para ${baseDescription}${detailText}.`;
  const what = variantLabels.length
    ? `Aplica ${baseDescription} cuando se cumplan las variantes ${variantLabels.join(", ")}.`
    : `Aplica ${baseDescription} con Tailwind CSS.`;
  const how = `Usala en class o className: ${buildExample(token.raw)}`;
  const translation = `Tailwind: ${baseDescription}`;
  const aliasBase = token.base;

  return {
    id: -(index + 1),
    term: token.raw,
    translation,
    aliases: aliasBase ? [aliasBase] : [],
    tags: ["tailwind", "css", "utility"],
    category: "frontend",
    titleEs: token.raw,
    titleEn: token.raw,
    meaning,
    meaningEs: meaning,
    meaningEn: undefined,
    what,
    whatEs: what,
    whatEn: undefined,
    how,
    howEs: how,
    howEn: undefined,
    examples: [{ code: buildExample(token.raw) }],
    exampleCount: 1,
    variants: [],
    useCases: [],
    faqs: [],
    exercises: [],
    exerciseCount: 0,
    status: "approved",
    reviewedAt: null,
    reviewedById: null,
    hasInterviewUseCase: false,
  };
}

function describeVariant(variant: string): string {
  if (!variant) return "";
  if (VARIANT_LABELS[variant]) return VARIANT_LABELS[variant];
  if (variant.includes("[") || variant.includes("]")) {
    return `${variant} (arbitraria)`;
  }
  return variant;
}

function describeBase(token: ParsedTailwindToken): string {
  if (token.isBare) {
    return BARE_DESCRIPTIONS[token.base] ?? `utilidad ${token.base}`;
  }
  const prefix = token.prefix ?? token.base;
  return PREFIX_DESCRIPTIONS[prefix] ?? `utilidad ${prefix}`;
}

function buildExample(raw: string): string {
  const safe = raw.replace(/"/g, '\\"');
  return `<div class="${safe}">...</div>`;
}
