import { generateCssDemoHtml } from "./cssPreview";

export function getHtmlForPreview(snippet: string) {
  const trimmed = snippet.trim();
  if (!trimmed) return generateCssDemoHtml();

  if (isHtmlSnippet(trimmed)) return trimmed;
  if (isTailwindClassList(trimmed)) return buildHtmlFromClassList(trimmed);
  if (isCssSnippet(trimmed)) return buildHtmlFromCss(trimmed);

  // Fallback seguro
  return generateCssDemoHtml();
}

export function extractRawCss(snippet: string) {
  const trimmed = snippet.trim();
  if (!trimmed) return "";

  if (isHtmlSnippet(trimmed)) {
    const match = trimmed.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    return match ? match[1] : "";
  }

  // Si parece CSS, úsalo tal cual
  if (isCssSnippet(trimmed)) return trimmed;

  // Listas de clases Tailwind no requieren CSS adicional
  if (isTailwindClassList(trimmed)) return "";

  return "";
}

function isHtmlSnippet(snippet: string) {
  return /<[^>]+>/.test(snippet);
}

function isCssSnippet(snippet: string) {
  return /{[^}]*}/.test(snippet) || /@[a-z-]+\s+[^{]+{/.test(snippet);
}

function isTailwindClassList(snippet: string) {
  if (snippet.includes("{") || snippet.includes(";") || snippet.includes("=")) return false;
  const tokens = snippet.split(/\s+/).filter(Boolean);
  if (!tokens.length) return false;
  const hasUtility = tokens.some(token =>
    /^(bg-|text-|from-|to-|via-|flex|grid|gap-|p[trblxy]?-\d|m[trblxy]?-\d|rounded|shadow|border-|w-|h-|justify-|items-|content-|place-|translate-|rotate-|scale-|skew-|backdrop-)/.test(token) ||
    token.includes(":"),
  );
  return hasUtility;
}

function buildHtmlFromClassList(classes: string) {
  return `
    <div class="${classes} min-h-[160px] flex items-center justify-center text-white font-semibold">
      Preview Tailwind
    </div>
  `;
}

function buildHtmlFromCss(snippet: string) {
  // Caso específico: demos con "cards" + article para propiedades como align-items
  if (/cards/.test(snippet) && /article/.test(snippet)) {
    return `
      <section class="cards">
        <article>Uno</article>
        <article>Dos</article>
        <article>Tres</article>
      </section>
    `;
  }

  const classNames = Array.from(new Set((snippet.match(/\.([a-z0-9_-]+)/gi) || []).map(item => item.replace(/^[.#]/, ""))));
  const tags = Array.from(new Set((snippet.match(/\b(h1|h2|h3|p|button|a|section|article|div|span|ul|li|nav|header|footer|main|code|pre|img)\b/gi) || []).map(t => t.toLowerCase())));

  const tagBlocks = tags.slice(0, 4).map(tag => `<${tag} class="demo-${tag}">Ejemplo ${tag}</${tag}>`).join("\n");
  const classBlocks = classNames.slice(0, 4).map(cls => `<div class="${cls} demo-box">.${cls}</div>`).join("\n");

  if (!tagBlocks && !classBlocks) {
    return generateCssDemoHtml();
  }

  return `
    <section class="css-demo space-y-3">
      ${tagBlocks}
      <div class="flex gap-3 flex-wrap">
        ${classBlocks}
      </div>
    </section>
  `;
}
