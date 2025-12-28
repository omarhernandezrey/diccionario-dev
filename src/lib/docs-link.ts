export function getDocsLink(term: string) {
  const query = encodeURIComponent(term.trim());
  return `https://developer.mozilla.org/search?q=${query}`;
}
