const DEFAULT_BASE_URL = "https://diccionario.dev";

const form = document.getElementById("options-form");
const baseUrlInput = document.getElementById("baseUrl");
const statusElement = document.getElementById("status");

chrome.storage.sync.get(["baseUrl"]).then(({ baseUrl }) => {
  baseUrlInput.value = baseUrl || DEFAULT_BASE_URL;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const value = baseUrlInput.value.trim();
  if (!value) return;
  try {
    const normalized = new URL(value).toString().replace(/\/$/, "");
    await chrome.storage.sync.set({ baseUrl: normalized });
    statusElement.textContent = "URL guardada correctamente.";
    setTimeout(() => (statusElement.textContent = ""), 2200);
  } catch (error) {
    statusElement.textContent = `URL inválida: ${error?.message ?? "verifica el formato"}`;
  }
});
