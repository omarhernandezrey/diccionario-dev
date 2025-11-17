// Predeterminado seguro para dev; configurable desde opciones
const DEFAULT_BASE_URL = "http://localhost:3000";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "diccionario-dev-lookup",
    title: "Buscar en Diccionario Dev: \"%s\"",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== "diccionario-dev-lookup" || !info.selectionText) return;
  await openDictionaryTab(info.selectionText);
});

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command !== "lookup-selection" || !tab?.id) return;
  const selected = await getSelectionFromTab(tab.id);
  if (!selected) {
    return;
  }
  await openDictionaryTab(selected);
});

async function openDictionaryTab(rawText) {
  const query = rawText.trim();
  if (!query) return;
  const baseUrl = await resolveBaseUrl();
  const url = new URL(baseUrl);
  url.searchParams.set("q", query);
  if (looksLikeCode(query)) {
    url.searchParams.set("context", "translate");
    url.searchParams.set("mode", "code");
  } else if (looksLikeQuestion(query)) {
    url.searchParams.set("context", "interview");
    url.searchParams.set("mode", "question");
  } else {
    url.searchParams.set("context", "dictionary");
    url.searchParams.set("mode", "list");
  }
  await chrome.tabs.create({ url: url.toString() });
}

async function resolveBaseUrl() {
  const stored = await chrome.storage.sync.get(["baseUrl"]);
  const value = stored?.baseUrl?.trim();
  if (!value) return DEFAULT_BASE_URL;
  try {
    return new URL(value).toString();
  } catch {
    return DEFAULT_BASE_URL;
  }
}

async function getSelectionFromTab(tabId) {
  try {
    const [response] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => window.getSelection()?.toString() ?? "",
    });
    return response?.result?.trim() || "";
  } catch {
    return "";
  }
}

function looksLikeCode(value) {
  if (value.includes("\n")) return true;
  return /[{<>=;)]/.test(value) || /\bfunction\b|\bclass\b|\bconst\b/.test(value);
}

function looksLikeQuestion(value) {
  return value.trim().endsWith("?") || /\b(why|cómo|por qué|what)\b/i.test(value);
}
