import { parse, type ParserPlugin } from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import type { StringLiteral, TemplateElement, TemplateLiteral, JSXText } from "@babel/types";
import MagicString from "magic-string";
import { prisma } from "@/lib/prisma";
import type { StructuralTranslationResult, TranslationSegment } from "@/types/translate";

type SupportedLanguage = "js" | "ts" | "jsx" | "python" | "plain" | "go";

type DictionaryEntry = {
  key: string;
  value: string;
  regex: RegExp;
};

const JS_PLUGINS: ParserPlugin[] = [
  "jsx",
  "typescript",
  "classProperties",
  "classPrivateProperties",
  "classPrivateMethods",
  "decorators-legacy",
  "dynamicImport",
  "optionalChaining",
  "nullishCoalescingOperator",
  "topLevelAwait",
];

const DEFAULT_TRANSLATIONS: Record<string, string> = {
  function: "función",
  component: "componente",
  hook: "hook",
  state: "estado",
  request: "solicitud",
  response: "respuesta",
  error: "error",
  success: "éxito",
  loading: "cargando",
  retry: "reintentar",
  fetch: "obtener",
  submit: "enviar",
  cancel: "cancelar",
  save: "guardar",
  delete: "eliminar",
  update: "actualizar",
  create: "crear",
  user: "usuario",
  admin: "administrador",
  password: "contraseña",
  token: "token",
  session: "sesión",
  value: "valor",
  terms: "términos",
  description: "descripción",
  example: "ejemplo",
  retrying: "reintentando",
  timeout: "tiempo de espera",
  welcome: "bienvenido",
};

let dictionaryPromise: Promise<DictionaryEntry[]> | null = null;

export type TranslationRequest = {
  code: string;
  language?: SupportedLanguage;
};

export async function translateStructural({
  code,
  language,
}: TranslationRequest): Promise<StructuralTranslationResult> {
  const trimmed = code ?? "";
  if (!trimmed.trim()) {
    return {
      language: language ?? "plain",
      code,
      fallbackApplied: false,
      segments: [],
      replacedStrings: 0,
      replacedComments: 0,
    };
  }
  const detected = normalizeLanguage(language ?? detectLanguage(trimmed));
  const dictionary = await loadDictionary();
  if (detected === "plain") {
    const translated = translateText(trimmed, dictionary);
    return {
      language: detected,
      fallbackApplied: true,
      code: translated,
      segments: translated === trimmed ? [] : [buildTextSegment(trimmed, translated)],
      replacedStrings: 0,
      replacedComments: 0,
    };
  }
  if (detected === "python") {
    return translatePython(trimmed, dictionary);
  }
  try {
    return translateJsLike(trimmed, dictionary, detected);
  } catch {
    const translated = translateText(trimmed, dictionary);
    return {
      language: detected,
      fallbackApplied: true,
      code: translated,
      segments: translated === trimmed ? [] : [buildTextSegment(trimmed, translated)],
      replacedStrings: 0,
      replacedComments: 0,
    };
  }
}

function buildTextSegment(original: string, translated: string): TranslationSegment {
  return {
    type: "text",
    original,
    translated,
    start: 0,
    end: original.length,
  };
}

function normalizeLanguage(value: string): SupportedLanguage {
  switch (value) {
    case "js":
    case "javascript":
    case "node":
      return "js";
    case "ts":
    case "typescript":
      return "ts";
    case "jsx":
    case "tsx":
    case "react":
      return "jsx";
    case "python":
    case "py":
      return "python";
    case "plain":
    case "text":
      return "plain";
    case "go":
    case "php":
    case "ruby":
    case "java":
    case "csharp":
    case "c#":
    case "kotlin":
    case "swift":
    case "rust":
      return "plain";
    default:
      return "js";
  }
}

function detectLanguage(source: string): SupportedLanguage {
  const snippet = source.trim();
  if (!snippet) return "plain";
  const hasJsx = /<\w[\w\d]*[^>]*>/.test(snippet) && /<\/\w/.test(snippet);
  if (hasJsx) return "jsx";
  if (/^\s*(def |class )/m.test(snippet) || /^\s*import\s+\w+\s*$/m.test(snippet) || /:\s*\n\s+pass/.test(snippet)) {
    return "python";
  }
  if (/interface\s+\w+/.test(snippet) || /type\s+\w+\s*=/.test(snippet) || snippet.includes(": string")) {
    return "ts";
  }
  return "js";
}

async function translateJsLike(
  source: string,
  dictionary: DictionaryEntry[],
  language: SupportedLanguage,
): Promise<StructuralTranslationResult> {
  const magic = new MagicString(source);
  const segments: TranslationSegment[] = [];
  let replacedStrings = 0;
  const ast = parse(source, {
    sourceType: "module",
    plugins: JS_PLUGINS,
    allowReturnOutsideFunction: true,
    errorRecovery: true,
    ranges: true,
    tokens: true,
  });

  const replaceLiteral = (node: StringLiteral) => {
    if (node.start == null || node.end == null) return;
    const raw = source.slice(node.start, node.end);
    const quote = raw[0] ?? '"';
    const inner = raw.slice(1, -1);
    const translated = translateText(inner, dictionary);
    if (inner === translated) return;
    const escaped = escapeString(translated, quote);
    const next = `${quote}${escaped}${quote}`;
    magic.overwrite(node.start, node.end, next);
    segments.push({
      type: "string",
      original: raw,
      translated: next,
      start: node.start,
      end: node.end,
    });
    replacedStrings += 1;
  };

  const replaceTemplate = (node: TemplateLiteral) => {
    node.quasis.forEach((quasi: TemplateElement) => {
      if (quasi.start == null || quasi.end == null) return;
      const rawSlice = source.slice(quasi.start, quasi.end);
      const translated = translateText(rawSlice, dictionary);
      if (rawSlice === translated) return;
      const escaped = escapeTemplate(translated);
      magic.overwrite(quasi.start, quasi.end, escaped);
      segments.push({
        type: "string",
        original: rawSlice,
        translated: escaped,
        start: quasi.start,
        end: quasi.end,
      });
      replacedStrings += 1;
    });
  };

  const replaceJsxText = (path: NodePath<JSXText>) => {
    const node = path.node;
    if (node.start == null || node.end == null) return;
    const raw = source.slice(node.start, node.end);
    const translated = translateText(raw, dictionary);
    if (raw === translated) return;
    magic.overwrite(node.start, node.end, translated);
    segments.push({
      type: "string",
      original: raw,
      translated,
      start: node.start,
      end: node.end,
    });
    replacedStrings += 1;
  };

  traverse(ast, {
    StringLiteral(path) {
      replaceLiteral(path.node);
    },
    TemplateLiteral(path) {
      replaceTemplate(path.node);
    },
    JSXText(path) {
      replaceJsxText(path);
    },
  });

  const comments = (ast.comments ?? []).filter((comment) => comment.start != null && comment.end != null);
  let replacedComments = 0;
  for (const comment of comments) {
    const original = source.slice(comment.start!, comment.end!);
    const translated = translateComment(comment.type === "CommentBlock", original, dictionary);
    if (original === translated) continue;
    magic.overwrite(comment.start!, comment.end!, translated);
    segments.push({
      type: "comment",
      original,
      translated,
      start: comment.start!,
      end: comment.end!,
    });
    replacedComments += 1;
  }

  return {
    code: magic.toString(),
    language,
    fallbackApplied: false,
    segments,
    replacedStrings,
    replacedComments,
  };
}

function translateComment(isBlock: boolean, raw: string, dictionary: DictionaryEntry[]) {
  if (isBlock) {
    const inner = raw.slice(2, -2);
    const translated = translateText(inner, dictionary);
    if (inner === translated) return raw;
    return `/*${translated}*/`;
  }
  const inner = raw.slice(2);
  const translated = translateText(inner, dictionary);
  if (inner === translated) return raw;
  return `//${translated}`;
}

function escapeString(value: string, quote: string) {
  let escaped = value.replace(/\\/g, "\\\\");
  const regex = new RegExp(escapeRegExp(quote), "g");
  escaped = escaped.replace(regex, `\\${quote}`);
  return escaped;
}

function escapeTemplate(value: string) {
  return value.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

async function loadDictionary(): Promise<DictionaryEntry[]> {
  if (!dictionaryPromise) {
    dictionaryPromise = prisma.term
      .findMany({
        select: {
          term: true,
          translation: true,
          aliases: true,
        },
      })
      .then((terms) => {
        const entries = new Map<string, string>();
        const addEntry = (key: string | null | undefined, value: string | null | undefined) => {
          if (!key || !value) return;
          const normalized = key.trim().toLowerCase();
          if (!normalized) return;
          if (!entries.has(normalized)) entries.set(normalized, value);
        };

        terms.forEach((term) => {
          addEntry(term.term, term.translation);
          const aliasesRaw: unknown[] = Array.isArray(term.aliases) ? term.aliases : [];
          for (const aliasRaw of aliasesRaw) {
            if (typeof aliasRaw === "string") {
              addEntry(aliasRaw, term.translation);
            }
          }
        });
        Object.entries(DEFAULT_TRANSLATIONS).forEach(([key, value]) => addEntry(key, value));
        return Array.from(entries.entries())
          .sort((a, b) => b[0].length - a[0].length)
          .map(([key, value]) => ({
            key,
            value,
            regex: buildWordRegex(key),
          }));
      });
  }
  return dictionaryPromise;
}

function translateText(text: string, dictionary: DictionaryEntry[]) {
  let result = text;
  for (const entry of dictionary) {
    result = result.replace(entry.regex, (match) => preserveCase(entry.value, match));
  }
  return result;
}

function buildWordRegex(value: string) {
  const escaped = escapeRegExp(value);
  if (/^[\w]+$/.test(value)) {
    return new RegExp(`\\b${escaped}\\b`, "gi");
  }
  return new RegExp(`(?<![\\w])${escaped}(?![\\w])`, "gi");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function preserveCase(value: string, sample: string) {
  if (!sample) return value;
  if (sample === sample.toUpperCase()) return value.toUpperCase();
  if (sample === sample.toLowerCase()) return value.toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
}

type PythonLiteral = {
  start: number;
  end: number;
  contentStart: number;
  contentEnd: number;
  quoteChar: string;
  isTriple: boolean;
};

function translatePython(source: string, dictionary: DictionaryEntry[]): StructuralTranslationResult {
  const magic = new MagicString(source);
  const segments: TranslationSegment[] = [];
  let replacedStrings = 0;
  let replacedComments = 0;
  let index = 0;
  const length = source.length;

  const flushString = (literal: PythonLiteral) => {
    const { start, end, contentStart, contentEnd, quoteChar, isTriple } = literal;
    const raw = source.slice(contentStart, contentEnd);
    const translated = translateText(raw, dictionary);
    if (raw === translated) return;
    const prefix = source.slice(start, contentStart);
    const suffix = source.slice(contentEnd, end);
    const escaped = escapePythonString(translated, quoteChar, isTriple);
    const updated = `${prefix}${escaped}${suffix}`;
    magic.overwrite(start, end, updated);
    segments.push({
      type: "string",
      original: source.slice(start, end),
      translated: updated,
      start,
      end,
    });
    replacedStrings += 1;
  };

  while (index < length) {
    const char = source[index];
    if (char === "#") {
      const start = index;
      let end = index + 1;
      while (end < length && source[end] !== "\n") end += 1;
      const original = source.slice(start, end);
      const translated = translateText(original.slice(1), dictionary);
      if (original.slice(1) !== translated) {
        const updated = `#${translated}`;
        magic.overwrite(start, end, updated);
        segments.push({
          type: "comment",
          original,
          translated: updated,
          start,
          end,
        });
        replacedComments += 1;
      }
      index = end;
      continue;
    }
    if (char === '"' || char === "'") {
      const literal = readPythonString(source, index);
      if (!literal || literal.end === literal.start) {
        index += 1;
        continue;
      }
      flushString(literal);
      index = literal.end;
      continue;
    }
    index += 1;
  }

  return {
    code: magic.toString(),
    language: "python",
    fallbackApplied: false,
    segments,
    replacedStrings,
    replacedComments,
  };
}

function readPythonString(source: string, quoteIndex: number): PythonLiteral | null {
  const length = source.length;
  let prefixStart = quoteIndex;
  while (prefixStart > 0 && /[rRbBuUfF]/.test(source[prefixStart - 1])) {
    prefixStart -= 1;
  }
  if (prefixStart > 0 && /[a-zA-Z0-9_]/.test(source[prefixStart - 1])) {
    prefixStart = quoteIndex;
  }
  const quoteChar = source[quoteIndex];
  const tripleToken = quoteChar.repeat(3);
  const isTriple = source.slice(quoteIndex, quoteIndex + 3) === tripleToken;
  const prefix = source.slice(prefixStart, quoteIndex);
  const isRaw = /r/i.test(prefix);
  const start = prefixStart;
  const openLength = isTriple ? 3 : 1;
  let cursor = quoteIndex + openLength;
  const contentStart = cursor;
  let contentEnd = cursor;
  while (cursor < length) {
    const current = source[cursor];
    if (!isRaw && current === "\\" && source[cursor - 1] !== "\\") {
      cursor += 2;
      continue;
    }
    if (current === quoteChar) {
      if (isTriple) {
        if (source.slice(cursor, cursor + 3) === tripleToken) {
          contentEnd = cursor;
          cursor += 3;
          break;
        }
        cursor += 1;
        continue;
      }
      contentEnd = cursor;
      cursor += 1;
      break;
    }
    cursor += 1;
  }
  const end = cursor;
  return { start, end, contentStart, contentEnd, quoteChar, isTriple };
}

function escapePythonString(text: string, quoteChar: string, isTriple: boolean) {
  let escaped = text.replace(/\\/g, "\\\\");
  if (isTriple) {
    const repeated = quoteChar.repeat(3);
    const pattern = new RegExp(repeated, "g");
    escaped = escaped.replace(pattern, `${quoteChar.repeat(2)}\\${quoteChar}`);
    return escaped;
  }
  const regex = new RegExp(escapeRegExp(quoteChar), "g");
  return escaped.replace(regex, `\\${quoteChar}`);
}

export function resetTranslationCache() {
  dictionaryPromise = null;
}
