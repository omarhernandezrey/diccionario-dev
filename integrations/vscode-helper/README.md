# VSCode Helper – Diccionario Dev

Extensión mínima para VSCode que envía la selección actual al backend de Diccionario Dev. Decide automáticamente si debe traducir código en modo estructural (`/api/translate`) o buscar la definición del concepto (`/api/terms`).

## Capacidades

- Comando `Diccionario Dev: Traducir o explicar selección` (`diccionarioDev.translateSelection`).
- Detecta bloques de código (multilínea, símbolos `{}`, `<`, `;`) y abre un documento con el resultado traducido.
- Para términos/preguntas, muestra un QuickPick con coincidencias y despliega significado + snippet + caso de uso en el panel “Diccionario Dev”.
- Usa la configuración `diccionarioDev.baseUrl` para apuntar a producción o `http://localhost:3000`.

## Instalación local

1. Abre la paleta de comandos y ejecuta `Extensiones: Instalar desde VSIX...`.
2. Empaqueta la extensión (opcional) con `vsce package` dentro de `integrations/vscode-helper` o simplemente usa “Extensiones: Instalar desde ubicación...” apuntando a esta carpeta.
3. Ajusta `diccionarioDev.baseUrl` en tu `settings.json` si usas otra URL.

> El código usa únicamente APIs nativas (`https/http`), evitando dependencias. Puedes extenderlo con diagnósticos o code actions manteniéndolo aislado del monorepo principal.
