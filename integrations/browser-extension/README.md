# Extensión de navegador – Diccionario Dev Lookup

Extensión ligera (Manifest v3) que captura la selección actual y abre Diccionario Dev con la consulta y contexto apropiados.

## Características

- Hotkey `Ctrl+Shift+D` (`⌘+Shift+D` en macOS) para abrir Diccionario Dev con la selección actual.
- Menú contextual “Buscar en Diccionario Dev” sobre cualquier selección.
- Detecta si el texto parece código, pregunta o concepto y ajusta `mode` y `context` en la URL (`translate`, `interview`, `dictionary`).
- Página de opciones para configurar la URL base (prod o entorno local).

## Instalación local

1. Abre `chrome://extensions` y habilita el modo desarrollador.
2. Haz clic en **Cargar descomprimida** y selecciona `integrations/browser-extension`.
3. Ajusta la URL base desde el enlace “Detalles → Opciones de la extensión” (ej. `http://localhost:3000` en desarrollo).

## Flujo de uso

1. Selecciona texto/código en cualquier pestaña.
2. Ejecuta el atajo `Ctrl+Shift+D` o usa el menú contextual.
3. Se abrirá una nueva pestaña de Diccionario Dev con:
   - `context=translate` + `mode=code` si parece código.
   - `context=interview` + `mode=question` si detecta pregunta.
   - `context=dictionary` + `mode=list` para términos simples.

> Nota: La extensión no impacta bundles del front. Se mantiene aislada en `integrations/browser-extension` para empaquetarla o publicarla más adelante.
