# 📘 Plan de Implementación por Prioridades Diccionario Dev

## 1. Arquitectura y Datos

### 1. Extender modelo en Prisma ✅
- **Completado**: Ampliamos `prisma/schema.prisma` con los modelos definidos:
  - **Term**: título ES/EN, categoría, significado ES/EN, “cómo se usa”, tags, alias, slug.
  - **TermVariant**: FK a Term, lenguaje (js, py, go, etc.), snippet, notas, nivel.
  - **UseCase**: FK a Term, contexto (entrevista, proyecto, bug), explicación corta, pasos, tips de comunicación.
  - **Faq**: pregunta, respuesta larga ES/EN, snippet, categoría, campo “cómo responder”.
  - **Exercise**: enunciado ES/EN, dificultad, soluciones (language, code, explain).
- **Formateado**: El esquema fue formateado con `DATABASE_URL=file:./prisma/dev.db npx prisma format` para asegurar consistencia.

### 2. Dataset ✅
- **Completado**: Migramos los datos actuales a la nueva estructura.
  - prisma/schema.prisma ahora refleja el modelo completo: añadimos slug, títulos ES/EN, campos bilingües (meaningEs/En, whatEs/En, howEs/En), y los nuevos modelos TermVariant, UseCase, Faq y Exercise con sus enums (Language, SkillLevel, UseCaseContext, Difficulty).
  - prisma/dictionary-types.ts y prisma/data/cssTerms.ts se actualizaron para soportar el nuevo dataset: los ejemplos son bilingües y los términos pueden declarar variantes por lenguaje, casos de uso, FAQs y ejercicios.
  - prisma/seed.ts ahora genera automáticamente toda esa información: crea slugs, ejemplos ES/EN, variantes según el stack (incluye CSS), casos de uso para entrevista/proyecto/bug, FAQs y ejercicios, y persiste cada bloque en las tablas relacionadas. También deduplica términos respetando las colecciones nuevas.
  - Generamos la migración prisma/migrations/20251115210519_expand_term_structure/ con todo el SQL para ampliar Term y crear las tablas auxiliares. Utilizamos `npx prisma migrate deploy` localmente (tras generar la migración vía `prisma migrate diff`) y ejecutamos `npx prisma db seed` para validar el nuevo sembrado.

### 3. Observabilidad ✅
- **Completado**: Añadimos la tabla/evento `SearchLog` y habilitamos el registro de búsquedas.
  - **Prisma**:
    - `prisma/schema.prisma` incluye el modelo `SearchLog` (query, language, context, mode, termId opcional) con relaciones e índices.
    - Generamos la migración `20251115213055_add_search_log` para crear la tabla.
    - El dataset y tipos (`prisma/dictionary-types.ts`, `prisma/data/cssTerms.ts`, `prisma/seed.ts`) quedaron intactos; solo se amplió el schema y se añadió el logging.
  - **API / Observabilidad**:
    - `src/app/api/terms/route.ts` ahora registra cada búsqueda mediante `recordSearchEvent`. Captura:
      - `query` (valor de q o vacío).
      - `language` (parámetro language o cabecera accept-language).
      - `context` y `mode` (query params, default dictionary/list).
      - `termId` si hay un único resultado.
    - Se logea tanto en éxitos como en rate limit, validaciones fallidas y errores, sin impactar la respuesta al usuario.
  - **Migraciones**:
    - Nueva carpeta `prisma/migrations/20251115213055_add_search_log/` con el SQL que añade `SearchLog`.
    - Ejecutamos `export DATABASE_URL="file:./prisma/dev.db" && npx prisma migrate deploy` para aplicar los cambios.

## 2. Experiencia principal (Buscador unificado) ✅

### 1. Input inteligente ✅
- **Completado**: El buscador identifica el tipo de entrada y permite ajustar el contexto explícitamente.
  - `src/components/SearchBox.tsx`: Añadimos detectores heurísticos que reconocen:
    - Código (multi‑línea, símbolos como `{`, `<`, `;`, etc.).
    - Preguntas (`?`, palabras como “cómo”, “why”).
  - Se muestra el modo detectado (“Concepto”, “Código” o “Pregunta”) y puedes alternarlo manualmente.
  - Incorporamos chips de contexto (Diccionario, Entrevista, Debug, Traducción). Cada chip actualiza el estado `context`, que se envía en la query.
  - Las llamadas a `/api/terms` ahora incluyen `context` y `mode`, lo que alimenta el nuevo `SearchLog`, asociando cada búsqueda a estos parámetros.

### 2. Resultados
- Bloques: Significado (ES/EN), traducción literal, snippet base, botones para cambiar lenguaje/contexto.
- Panel lateral con UseCases, Faqs, Exercises relacionados.

### 3. Modo traducción estructural ✅
- **Completado**: Implementamos un motor de traducción estructural con parsers por lenguaje y fallback textual.
  - **Parsers implementados**:
    - ✅ **JavaScript/TypeScript**: @babel/parser con plugins (jsx, typescript, decorators, etc.). Detecta strings, templates, comentarios.
    - ✅ **JSX/TSX**: Detección automática via regex de tags XML. Traduce textos dentro de elementos preservando estructura.
    - ✅ **Python**: Parser manual personalizado. Detecta strings (triple-quoted, raw, f-strings), comentarios, mantiene identación.
    - ✅ **Fallback textual**: Para Go, PHP, Ruby, Java, C#, Kotlin, Swift, Rust, C++. Usa regex case-insensitive global con preservación de mayúsculas.
  - **Características principales**:
    - ✅ **Traducción selectiva**: Solo strings y comentarios; código estructural PRESERVADO (variables, funciones, sintaxis intactas).
    - ✅ **Mantenimiento de identación**: Usa `magic-string` (position-based, no regex global) para preservar espacios y saltos de línea exactamente.
    - ✅ **Diccionario dinámico**: Carga desde Prisma, caché memoizado, incluye aliases y traducciones por defecto.
    - ✅ **Segmentación**: Array de cambios (`segments`) con original/traducido/posiciones para UI preview.
  - **Endpoint API**:
    - POST `/api/translate` con rate limiting (120 req/min), validación Zod, logging en `SearchLog`.
    - Input: `{ code: string, language?: string }` | Output: `{ code, language, fallbackApplied, segments, replacedStrings, replacedComments }`
    - Archivos: `src/app/api/translate/route.ts`, `src/lib/validation.ts`, `src/lib/structural-translate.ts`.
  - **Pruebas unitarias** (5/5 PASS):
    - ✅ JS string literals without altering structure
    - ✅ Template literals preserving expressions
    - ✅ Comments independently from code
    - ✅ Python strings with correct parsing
    - ✅ Fallback textual for unsupported languages (Go)
    - Archivo: `tests/structural-translate.test.ts`
  - **Validación completa**: Documento `docs/validacion-traduccion-estructural.md` con requisitos, implementación detallada y pruebas.

### 4. Selector de lenguaje/contexto ✅
- **Completado**: Componentes dinámicos para seleccionar lenguaje y contexto de uso en tiempo real.
  - **ResultPreview** (líneas 296-341):
    - Recibe `term: TermDTO` y `activeContext: string`
    - Memoiza `variantLang` y `useCaseContext` (estado local preservado)
    - Se reinicia al cambiar término seleccionado (`useEffect` línea 319-320)
    - Actualizaciones en tiempo real sin recargar el resto del card
  
  - **SelectorPanel** (líneas 539-591):
    - Chips de lenguaje basados en `TermVariant`
    - Etiquetas legibles: `JavaScript`, `TypeScript`, `Python`, etc.
    - Badge de nivel: `Principiante`, `Intermedio`, `Avanzado` (del enum `SkillLevel`)
    - Snippet dinámico: se actualiza al cambiar lenguaje
    - Notas específicas: mostradas solo si la variante tiene datos
  
  - **UseCaseSelector** (líneas 431-484):
    - Chips de contexto: `interview`, `project`, `bug` (disponibles dinámicamente)
    - Filtrado en tiempo real: solo muestra `UseCase` del contexto seleccionado
    - Mensaje fallback: "No tenemos guías para este contexto todavía." cuando no hay datos
  
  - **Datos Prisma cargados**:
    - `variants: TermVariant[]` (language, snippet, notes, level)
    - `useCases: UseCase[]` (context, summary, steps, tips)
    - Query: `/api/terms` con `include: { variants, useCases, ... }`
  
  - **Estado y Memoización**:
    - `useMemo` para `availableUseCaseContexts` (evita recálculos)
    - Estado local preserva selecciones del usuario
    - Ajuste inteligente si contexto global no está disponible
  
  - **Validación**: Documento `docs/validacion-selector-dinamico.md` con arquitectura, flujo de datos, ejemplos UX.
  - **Typecheck**: ✅ 0 errores

### 5. Atajos ✅
- **Completado**: Panel de acciones rápidas para copiar, compartir y generar respuestas.
  - **Componentes implementados**:
    - ✅ **ShortcutPanel** (líneas 690-720): Barra de botones de acciones con 5 opciones:
      - "Copiar definición": llama `handleCopyDefinition()`
      - "Copiar snippet": llama `handleCopySnippet()`
      - "Abrir cheat sheet": alterna `cheatSheetOpen`
      - "Respuesta ES": llama `handleGenerateAnswer("es")`
      - "Respuesta EN": llama `handleGenerateAnswer("en")`
    - ✅ **ShortcutButton** (líneas 722-740): Botón individual con estado `active` y feedback visual (accent-teal cuando activo)
    - ✅ **CheatSheetCard** (líneas 742-800): Vista compacta para consulta rápida con:
      - Término y traducción
      - Significado bilingüe
      - Uso (cómo se usa)
      - Lenguaje de variante (badge)
      - Contexto de uso case
      - Tags del término
  
  - **Handlers implementados**:
    - ✅ **copyText()** (líneas 309-318): Función async con navigator.clipboard.writeText + manejo de errores, activa `actionMessage` por 2s
    - ✅ **handleCopyDefinition()** (líneas 320-327): Construye texto con `buildDefinitionSnippet()`, copia y muestra confirmación
    - ✅ **handleCopySnippet()** (líneas 329-334): Copia el snippet de la variante seleccionada
    - ✅ **handleGenerateAnswer()** (líneas 336-349): Genera respuesta de entrevista con `buildInterviewAnswer()` en idioma seleccionado (ES/EN), copia y activa preview
    - ✅ **actionMessage**: Estado que muestra feedback por 2s ("Copiado a portapapeles", "Respuesta lista")
    - ✅ **answerPreview**: Estado que almacena respuesta generada para mostrar en preview
  
  - **Funciones helper**:
    - ✅ **buildDefinitionSnippet()** (líneas 935-947): Arma texto "{term} ({translation}): {meaning}. Se aplica para {usage}."
    - ✅ **buildInterviewAnswer()** (líneas 949-1000): Genera respuesta multilinea estructurada:
      - Intro contextual bilingüe
      - Punto "Significa"
      - Punto "Lo uso para"
      - Punto opcional "Caso de uso" si existe UseCase
      - Punto opcional "Snippet" si existe TermVariant
      - Outro reafirmando consistencia
      - Conecta por idioma: etiquetas `contextLabels` y `languageLabels` para traducciones
  
  - **Estado y Memoización**:
    - `variantLang`: lenguaje seleccionado en SelectorPanel (predeterminado al primero disponible)
    - `useCaseContext`: contexto de caso de uso (predeterminado al primero disponible)
    - `cheatSheetOpen`: booleano que alterna vista compacta
    - `actionMessage`: string que se limpia automáticamente tras 2s
    - `answerPreview`: string con respuesta generada para mostrar en preview temporal
  
  - **UX**:
    - Retroalimentación inmediata: mensaje "Copiado a portapapeles" al copiar
    - Respuesta generada se muestra en preview antes de copiar (opcional)
    - Cheat sheet abre/cierra sin recargar el componente
    - Botones se desactivan si no hay datos relevantes (ej: "Copiar snippet" si no hay variante)
  
  - **Validación**: Typecheck ✅ 0 errores, componentes integrados en `ResultPreview`

## 3. Integraciones y flujo real ✅

### 1. Extensión navegador / Hotkey ✅
- Carpeta `integrations/browser-extension/` con manifest V3, `background.js`, `options.html/js` y README.
- Atajo `Ctrl+Shift+D` / `⌘+Shift+D` + menú contextual “Buscar en Diccionario Dev”.
- Usa `chrome.storage.sync` para definir la URL base (prod o local). Mapea selección → query + context/mode (code/question/list).
- Zero build: se carga descomprimida desde `chrome://extensions`.

### 2. VSCode helper ✅
- Carpeta `integrations/vscode-helper/` con `package.json`, `extension.js` (sin dependencias externas) y README.
- Comando `Diccionario Dev: Traducir o explicar selección` (`diccionarioDev.translateSelection`).
- Detecta si la selección es código y llama a `/api/translate` mostrando el resultado en un panel + editor temporal.
- Para términos/preguntas usa `/api/terms`, QuickPick para elegir coincidencia y renderiza significado/snippet/caso en el canal “Diccionario Dev”.
- Configurable vía `diccionarioDev.baseUrl` + `diccionarioDev.defaultContext`.

### 3. Portapapeles inteligente ✅
- `SearchBox` ahora intercepta `paste` y, si detecta bloque (≥60 chars, multilínea o símbolos de código), cambia automáticamente a contexto “Traducción”, fija el texto y lanza `/api/translate`.
- Muestra hint “Detecté un bloque...” para indicar que se activó la traducción estructural.
- Se apoya en `shouldTriggerStructuralTranslation` para mantener heurísticas en un único helper.
- Además, `SearchBox` hidrata `q`, `context` y `mode` desde los query params y los sincroniza en la URL para que la extensión de navegador y VSCode puedan prellenar búsquedas profundas.

## 4. Comunidad y colaboración

### 1. Panel interno
- CRUD de términos, variantes, FAQs, ejercicios. Workflow de revisión con estados (pendiente/aprobado).

### 2. Gamificación ligera
- Rank de contribuidores, insignias por lenguajes cubiertos.

### 3. Analítica
- Métricas de términos más consultados, idiomas más usados, huecos detectados.

## 5. Entrenamiento y entrevistas

### 1. FAQ técnico
- Biblioteca por stack (frontend/backend/arquitectura/algoritmos) con respuesta + snippet + “cómo explicarlo”.

### 2. Recetario de ejercicios
- Reto por lenguaje con solución y guía narrativa.

### 3. Soft skills
- Plantillas bilingües para preguntas de HR.

### 4. Modo cheat sheet
- Overlay compacto para consultas durante una call (atajo de teclado, historial).

### 5. Modo entrenamiento
- Quizzes autogenerados con feedback e historial de progreso.

## 6. Español ↔ Inglés context-aware

### 1. Microtraductor técnico
- Analizar la query y mapear términos automáticamente para mostrar traducción + explicación contextual.

### 2. Respuesta bilingüe
- Botón para alternar entre ES y EN en todas las secciones, incluyendo respuestas listas para entrevistas.

## 7. Modo “Entrevista en vivo”

### 1. UI ultra compacta
- Mini buscador flotante con respuestas resumidas y botones de copia rápida.

### 2. Frases listas
- Generar “cómo explicarlo en inglés/español” con un click.

### 3. Soluciones instantáneas
- Para cada reto propuesto, devolver solución, pasos, edge cases y cómo defenderla verbalmente.

## 8. Integración por fases (lanzamientos)

### 1. MVP enriquecido
- Nuevos campos en Term, variantes por lenguaje, buscador traducido.

### 2. FAQ + Ejercicios
- Indexar y mostrar en resultados.

### 3. Traducción estructural + integraciones (extensión/VSCode).

### 4. Entrenamiento + cheat sheet + modo entrevista en vivo.

### 5. Comunidad + observabilidad avanzada.

---

Con esta hoja de ruta tienes tareas claras para cada área. Podemos ir bloque por bloque (datos → buscador → integraciones → comunidad → entrenamiento → entrevista) y desplegar en fases, asegurando que el diccionario siempre sea útil, tanto estudiando como en una entrevista en vivo.
