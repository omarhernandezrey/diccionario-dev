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

### 3. Modo traducción estructural
- Parser por lenguaje (JS/TS, JSX, Python). Traducir solo strings/comentarios manteniendo identación.
- Fallback textual para lenguajes sin parser.

### 4. Selector de lenguaje/contexto
- Cambia dinámicamente las secciones usando `TermVariant` y `UseCase`.

### 5. Atajos
- Copiar definición, copiar snippet, abrir “cheat sheet”, generar respuesta en ES/EN.

## 3. Integraciones y flujo real

### 1. Extensión navegador / Hotkey
- Capturar selección y abrir diccionario con query prellenada.

### 2. VSCode helper
- Comando para traducir/explicar el texto seleccionado en el editor.

### 3. Portapapeles inteligente
- Auto detectar bloque pegado y sugerir traducción estructural.

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