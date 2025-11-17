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

### Solución de problemas

- Error de DNS (DNS_PROBE_FINISHED_NXDOMAIN) al abrir diccionario.dev:
	- El dominio público aún puede no estar configurado. Usa `http://localhost:3000` como `baseUrl` durante el desarrollo.
	- En producción, apunta `diccionario.dev` al hosting donde esté desplegada la app (por ejemplo, Vercel) y añade los registros DNS A/AAAA o CNAME correspondientes.
- Conexión rechazada desde VSCode:
	- Verifica que la app de Next.js esté corriendo en `localhost:3000` o actualiza `diccionarioDev.baseUrl` al puerto correcto.
	- Asegúrate que el endpoint `/api/translate` y `/api/terms` responden sin autenticación para consultas básicas.

> El código usa únicamente APIs nativas (`https/http`), evitando dependencias. Puedes extenderlo con diagnósticos o code actions manteniéndolo aislado del monorepo principal.

Además, `SearchBox` hidrata `q`, `context` y `mode` desde los parámetros de la URL y los sincroniza para que la extensión de navegador y VSCode puedan prellenar búsquedas profundas.