const vscode = require("vscode");
const https = require("https");
const http = require("http");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const output = vscode.window.createOutputChannel("Diccionario Dev");
  
  // Log de activación para debugging
  output.appendLine("✅ Diccionario Dev Helper activado");

  const disposable = vscode.commands.registerCommand("diccionarioDev.translateSelection", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage("No hay un editor activo.");
      return;
    }
    const selection = editor.document.getText(editor.selection) || editor.document.lineAt(editor.selection.active.line).text;
    const query = selection.trim();
    if (!query) {
      vscode.window.showInformationMessage("Selecciona texto o código para enviarlo al Diccionario.");
      return;
    }
    const config = vscode.workspace.getConfiguration("diccionarioDev");
    const baseUrl = normalizeBaseUrl(config.get("baseUrl"));
    const defaultContext = config.get("defaultContext") || "dictionary";
    
    output.appendLine(`🔍 Consultando: "${trimTo(query, 50)}"`);
    output.appendLine(`📡 URL base: ${baseUrl}`);
    output.show(true);
    
    try {
      if (shouldTranslate(query)) {
        await handleTranslate(query, baseUrl, output);
      } else {
        await handleLookup(query, baseUrl, defaultContext, output);
      }
    } catch (error) {
      const errorMsg = error?.message ?? String(error);
      output.appendLine(`⚠️ Error solicitando datos: ${errorMsg}`);
      output.show(true);
      
      if (errorMsg.includes("ECONNREFUSED")) {
        vscode.window.showErrorMessage(
          "No se pudo conectar al backend. Verifica que Next.js esté corriendo en " + baseUrl,
          "Abrir configuración"
        ).then(selection => {
          if (selection === "Abrir configuración") {
            vscode.commands.executeCommand("workbench.action.openSettings", "diccionarioDev.baseUrl");
          }
        });
      } else if (errorMsg.includes("ENOTFOUND") || errorMsg.includes("DNS")) {
        vscode.window.showErrorMessage(
          "Error de DNS. El dominio no está accesible. Usa http://localhost:3000 para desarrollo.",
          "Abrir configuración"
        ).then(selection => {
          if (selection === "Abrir configuración") {
            vscode.commands.executeCommand("workbench.action.openSettings", "diccionarioDev.baseUrl");
          }
        });
      } else {
        vscode.window.showErrorMessage("No se pudo contactar el backend de Diccionario Dev: " + errorMsg);
      }
    }
  });

  context.subscriptions.push(disposable, output);
}

/**
 * @param {string} snippet
 * @param {string} baseUrl
 * @param {vscode.OutputChannel} output
 */
async function handleTranslate(snippet, baseUrl, output) {
  output.clear();
  output.appendLine("🔁 Traducción estructural solicitada...");
  const url = new URL("/api/translate", baseUrl).toString();
  const payload = await requestJson(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: snippet }),
  });
  const result = payload?.result;
  if (!result) {
    vscode.window.showInformationMessage("No se detectaron segmentos traducibles.");
    return;
  }
  const translatedSegments = (result.replacedStrings || 0) + (result.replacedComments || 0);
  output.clear();
  output.appendLine(`🔁 Lenguaje detectado: ${result.language}`);
  output.appendLine(`Segmentos traducidos: ${translatedSegments}`);
  if (result.fallbackApplied) {
    output.appendLine("Se aplicó modo textual básico.");
  }
  if (Array.isArray(result.segments)) {
    result.segments.slice(0, 5).forEach((segment, index) => {
      output.appendLine(`(${index + 1}) ${segment.type} :: ${segment.original} → ${segment.translated}`);
    });
    if (result.segments.length > 5) {
      output.appendLine(`... ${result.segments.length - 5} segmentos adicionales`);
    }
  }
  output.show(true);

  if (result.code) {
    const languageId = detectLanguageId(result.language);
    const document = await vscode.workspace.openTextDocument({
      content: result.code,
      language: languageId,
    });
    await vscode.window.showTextDocument(document, { preview: true });
  }
}

/**
 * @param {string} snippet
 * @param {string} baseUrl
 * @param {string} defaultContext
 * @param {vscode.OutputChannel} output
 */
async function handleLookup(snippet, baseUrl, defaultContext, output) {
  const mode = detectMode(snippet);
  const url = new URL("/api/terms", baseUrl);
  url.searchParams.set("q", snippet);
  url.searchParams.set("pageSize", "5");
  url.searchParams.set("sort", "term_asc");
  url.searchParams.set("context", defaultContext);
  url.searchParams.set("mode", mode);

  const payload = await requestJson(url.toString());
  const items = Array.isArray(payload?.items) ? payload.items : [];
  if (!items.length) {
    vscode.window.showInformationMessage("No encontré términos para esa selección.");
    return;
  }

  let selected = items[0];
  if (items.length > 1) {
    const pick = await vscode.window.showQuickPick(
      items.map((term) => ({
        label: term.term,
        description: term.translation,
        detail: trimTo(term.meaningEs || term.meaning, 120),
        term,
      })),
      { placeHolder: "Selecciona un término para ver el desglose" }
    );
    if (!pick) return;
    selected = pick.term;
  }

  renderTerm(selected, output);
}

/**
 * @param {any} term
 * @param {vscode.OutputChannel} output
 */
function renderTerm(term, output) {
  output.clear();
  output.appendLine(`📚 ${term.term} (${term.translation})`);
  if (term.meaningEs || term.meaning) {
    output.appendLine(`Significado: ${term.meaningEs || term.meaning}`);
  }
  if (term.whatEs || term.what) {
    output.appendLine(`¿Qué es?: ${term.whatEs || term.what}`);
  }
  if (term.howEs || term.how) {
    output.appendLine(`¿Cómo se usa?: ${term.howEs || term.how}`);
  }
  if (Array.isArray(term.variants) && term.variants.length) {
    const variant = term.variants[0];
    output.appendLine(`Snippet (${variant.language || "general"}):`);
    output.appendLine(variant.snippet);
  }
  if (Array.isArray(term.useCases) && term.useCases.length) {
    const useCase = term.useCases[0];
    output.appendLine(`Caso (${useCase.context}): ${useCase.summary}`);
  }
  output.show(true);
}

/**
 * @param {string} url
 * @param {{ method?: string, headers?: Record<string,string>, body?: string }} [options]
 * @returns {Promise<any>}
 */
function requestJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const transport = parsed.protocol === "https:" ? https : http;
    const requestOptions = {
      method: options.method || "GET",
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path: parsed.pathname + parsed.search,
      headers: options.headers || {},
    };
    const req = transport.request(requestOptions, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf8");
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          return;
        }
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on("error", reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

function shouldTranslate(value) {
  if (value.length > 120) return true;
  if (value.includes("\n")) return true;
  if (/[{};<>=]/.test(value)) return true;
  if (/<[a-z][\s\S]*?>/.test(value)) return true;
  return false;
}

function detectMode(value) {
  if (value.trim().endsWith("?")) return "question";
  return "list";
}

function detectLanguageId(language) {
  const map = {
    js: "javascript",
    ts: "typescript",
    jsx: "javascriptreact",
    tsx: "typescriptreact",
    py: "python",
    java: "java",
    csharp: "csharp",
    go: "go",
    php: "php",
    ruby: "ruby",
    css: "css",
    html: "html",
  };
  return map[language] || "plaintext";
}

function normalizeBaseUrl(value) {
  const candidate = (value || "").trim();
  const toUse = candidate || "http://localhost:3000";
  try {
    const normalized = new URL(toUse.startsWith("http") ? toUse : `https://${toUse}`);
    return normalized.toString().replace(/\/$/, "");
  } catch {
    return "http://localhost:3000";
  }
}

function trimTo(value, max) {
  if (!value) return "";
  if (value.length <= max) return value;
  return `${value.slice(0, max - 3)}...`;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
