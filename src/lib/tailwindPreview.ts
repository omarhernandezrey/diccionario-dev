import { generateCssDemoHtml } from "./cssPreview";

export function getHtmlForPreview(snippet: string) {
  const hasHtml = /<[^>]+>/.test(snippet);
  if (hasHtml) return snippet;

  // Si NO hay HTML, usar demo CSS para aplicar estilos
  return generateCssDemoHtml();
}

export function extractRawCss(snippet: string) {
  const hasHtml = /<[^>]+>/.test(snippet);
  // Si no hay HTML, todo el snippet es CSS puro
  if (!hasHtml) return snippet;

  // Si hay HTML, busca <style> interno
  const match = snippet.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  return match ? match[1] : "";
}
