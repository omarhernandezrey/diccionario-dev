# 📚 Guía Completa de Implementación de Términos con Preview en Vivo

**Fecha:** 29 de noviembre de 2025  
**Propósito:** Documento de referencia para implementar nuevos términos con diseño, preview interactivo, código y documentación.

---

## 📋 Tabla de Contenidos

1. [Estructura de Datos Requerida](#estructura-de-datos-requerida)
2. [Los 8 Puntos Obligatorios](#los-8-puntos-obligatorios)
3. [Cómo Crear un Término Completo](#cómo-crear-un-término-completo)
4. [Preview en Vivo - Implementación](#preview-en-vivo---implementación)
5. [Layout Responsive](#layout-responsive)
6. [Checklist de Validación](#checklist-de-validación)
7. [Errores Comunes y Soluciones](#errores-comunes-y-soluciones)

---

## 🗂️ Estructura de Datos Requerida

### Base de Datos (Prisma Schema)

Cada término DEBE tener esta estructura:

```prisma
model Term {
  id            Int             @id @default(autoincrement())
  term          String          @unique
  meaning       String          // ✅ OBLIGATORIO
  what          String          // ✅ OBLIGATORIO
  how           String          // ✅ OBLIGATORIO
  examples      Json            // ✅ OBLIGATORIO (array)
  variants      TermVariant[]   // ✅ OBLIGATORIO (código)
  useCases      UseCase[]       // ✅ OBLIGATORIO (3+ mínimo)
  faqs          Faq[]           // ✅ OBLIGATORIO (3+ mínimo)
  exercises     Exercise[]      // ✅ OBLIGATORIO (1+ mínimo)
}

model TermVariant {
  id       Int          @id @default(autoincrement())
  termId   Int
  language Language     // html, css, js, ts, etc.
  snippet  String       // ✅ Código ejecutable
  level    SkillLevel   // beginner, intermediate, advanced
  status   ReviewStatus // approved, pending, etc.
}

model UseCase {
  id       Int            @id @default(autoincrement())
  termId   Int
  context  UseCaseContext // interview, project, bug
  summary  String
  steps    Json          // Array de pasos
  tips     String
}

model Faq {
  id        Int    @id @default(autoincrement())
  termId    Int
  questionEs String // Pregunta en español
  answerEs  String  // Respuesta en español
  snippet   String? // Código opcional
}

model Exercise {
  id       Int    @id @default(autoincrement())
  termId   Int
  titleEs  String
  promptEs String
  difficulty Difficulty // easy, medium, hard
  solutions Json
}
```

---

## 8️⃣ Los 8 Puntos Obligatorios

TODOS los términos deben incluir estos 8 puntos:

### 1. ✅ **MEANING** (Definición)
**Campo:** `Term.meaning`  
**Descripción:** Explicación técnica del término  
**Ejemplo:**
```
"En programación 'html' se refiere a HyperText Markup Language: 
lenguaje de marcado usado para crear la estructura y contenido 
semántico de páginas web mediante etiquetas."
```
**Longitud mínima:** 200 caracteres

---

### 2. ✅ **WHAT** (Qué es)
**Campo:** `Term.what`  
**Descripción:** Explicación de para qué sirve  
**Ejemplo:**
```
"Se usa para definir la estructura semántica de documentos web, 
organizando contenido en elementos reutilizables que facilitan 
la accesibilidad, el SEO y la mantenibilidad del código."
```
**Longitud mínima:** 150 caracteres

---

### 3. ✅ **HOW** (Cómo funciona)
**Campo:** `Term.how`  
**Descripción:** Instrucciones básicas de implementación  
**Ejemplo:**
```
"Declara elementos HTML anidando etiquetas de apertura y cierre; 
usa atributos para añadir propiedades y siempre incluye doctype, 
html, head y body como estructura base."
```
**Longitud mínima:** 100 caracteres

---

### 4. ✅ **USE CASES** (Casos de Uso)
**Campo:** `Term.useCases[]`  
**Requerimiento:** MÍNIMO 3 casos  
**Estructura:** Array con contextos (interview, project, bug)

**Ejemplo:**
```javascript
[
  {
    context: "project",
    summary: "Usar html en un proyecto real",
    steps: [
      "Identificar dónde necesitas html",
      "Implementar correctamente según especificaciones",
      "Probar en navegadores compatibles"
    ],
    tips: "Asegúrate de seguir las mejores prácticas de accesibilidad"
  },
  {
    context: "interview",
    summary: "Explicar html en una entrevista",
    steps: [
      "Explicar qué es html",
      "Dar ejemplos prácticos de uso",
      "Mencionar por qué es importante"
    ],
    tips: "Sé claro y conciso, evita tecnicismos innecesarios"
  },
  {
    context: "bug",
    summary: "Debuggear problemas con html",
    steps: [
      "Inspecciona el elemento en DevTools",
      "Verifica que el contenido esté correcto",
      "Revisa el rendering en diferentes navegadores"
    ],
    tips: "Usa la consola para verificar el estado"
  }
]
```

---

### 5. ✅ **VARIANTS** (Código - "Cómo funciona")
**Campo:** `Term.variants[]`  
**Requerimiento:** MÍNIMO 1 variante con código ejecutable  
**Lenguajes soportados:** html, css, js, ts, jsx, py, java, etc.

**Importante:**
- El código DEBE ser válido y ejecutable
- Para HTML: debe ser código HTML completo
- Para CSS: debe ser CSS válido con selectores
- Para JS/TS: debe ser código funcional

**Ejemplo para HTML:**
```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Mi Primera Página</title>
  </head>
  <body>
    <h1>¡Hola Mundo!</h1>
    <p>Este es el contenido visible.</p>
  </body>
</html>
```

**Ejemplo para CSS:**
```css
:root {
  --color-primary: #667eea;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', sans-serif;
  background-color: #f5f5f5;
}

button {
  background-color: var(--color-primary);
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #5568d3;
}
```

---

### 6. ✅ **EXAMPLES** (Ejemplos)
**Campo:** `Term.examples[]`  
**Requerimiento:** MÍNIMO 1 ejemplo  
**Estructura:** Array de objetos con código, título y explicación

**Ejemplo:**
```javascript
[
  {
    code: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mi Página</title>
</head>
<body>
  <h1>Bienvenido</h1>
  <p>Este es mi primer sitio web.</p>
</body>
</html>`,
    title: "Documento HTML básico",
    language: "html",
    explanation: "Estructura mínima de un documento HTML válido con DOCTYPE, metadatos y contenido base."
  }
]
```

---

### 7. ✅ **FAQs** (Preguntas Frecuentes)
**Campo:** `Term.faqs[]`  
**Requerimiento:** MÍNIMO 3 FAQs  
**Campos:** questionEs, answerEs, snippet (opcional)

**Ejemplo:**
```javascript
[
  {
    questionEs: "¿Cuándo debo usar html?",
    answerEs: "Debes usar html cuando necesites definir la estructura semántica de documentos web, organizando contenido en elementos reutilizables.",
    snippet: null
  },
  {
    questionEs: "¿Cómo implemento html correctamente?",
    answerEs: "Declara elementos HTML anidando etiquetas de apertura y cierre; usa atributos para añadir propiedades.",
    snippet: "<div id='demo'>Contenido</div>"
  },
  {
    questionEs: "¿Es html compatible con todos los navegadores?",
    answerEs: "Sí, html es un estándar y es compatible con todos los navegadores modernos.",
    snippet: null
  }
]
```

---

### 8. ✅ **EXERCISES** (Ejercicios)
**Campo:** `Term.exercises[]`  
**Requerimiento:** MÍNIMO 1 ejercicio  
**Campos:** titleEs, promptEs, difficulty, solutions

**Ejemplo:**
```javascript
[
  {
    titleEs: "Práctica: Usar html",
    promptEs: "Implementa un ejemplo funcional usando html. Estructura tu documento con las etiquetas base.",
    difficulty: "medium",
    solutions: [
      {
        title: "Solución básica",
        code: "<!DOCTYPE html>\n<html>\n<head><title>Demo</title></head>\n<body><h1>Hola</h1></body>\n</html>",
        explanation: "Estructura mínima de HTML"
      }
    ]
  }
]
```

---

## 🎯 Cómo Crear un Término Completo

### Paso 1: Crear el Término Base en BD

```typescript
// scripts/create-new-term.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const newTerm = await prisma.term.create({
  data: {
    term: "mi-nuevo-termino",
    translation: "Traducción del término",
    meaning: "Definición técnica completa del término (200+ caracteres)...",
    what: "Explicación de para qué sirve (150+ caracteres)...",
    how: "Instrucciones de cómo se implementa (100+ caracteres)...",
    examples: [
      {
        code: "Código de ejemplo aquí",
        title: "Título del ejemplo",
        language: "html",
        explanation: "Explicación del ejemplo"
      }
    ],
    category: "frontend"
  }
});
```

### Paso 2: Agregar Variantes (Código)

```typescript
// Agregar código para que aparezca en preview
const variant = await prisma.termVariant.create({
  data: {
    termId: newTerm.id,
    language: "html",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Demo</title></head>
<body>
  <h1>Contenido de demo</h1>
</body>
</html>`,
    level: "intermediate",
    status: "approved"
  }
});
```

### Paso 3: Agregar Use Cases (3+)

```typescript
// 3 casos de uso obligatorios
const useCases = await prisma.useCase.createMany({
  data: [
    {
      termId: newTerm.id,
      context: "project",
      summary: "Usar en un proyecto real",
      steps: ["Paso 1", "Paso 2", "Paso 3"],
      tips: "Consejo importante"
    },
    {
      termId: newTerm.id,
      context: "interview",
      summary: "Explicar en entrevista",
      steps: ["Explicar qué es", "Dar ejemplos", "Mencionar importancia"],
      tips: "Sé claro y conciso"
    },
    {
      termId: newTerm.id,
      context: "bug",
      summary: "Debuggear problemas",
      steps: ["Inspeccionar", "Verificar", "Probar"],
      tips: "Usa DevTools"
    }
  ]
});
```

### Paso 4: Agregar FAQs (3+)

```typescript
const faqs = await prisma.faq.createMany({
  data: [
    {
      termId: newTerm.id,
      questionEs: "¿Cuándo debo usar esto?",
      answerEs: "Deberías usarlo cuando..."
    },
    {
      termId: newTerm.id,
      questionEs: "¿Cómo implemento esto?",
      answerEs: "Implementa de la siguiente manera..."
    },
    {
      termId: newTerm.id,
      questionEs: "¿Es compatible?",
      answerEs: "Sí, es compatible con..."
    }
  ]
});
```

### Paso 5: Agregar Ejercicios (1+)

```typescript
const exercises = await prisma.exercise.createMany({
  data: [
    {
      termId: newTerm.id,
      titleEs: "Práctica básica",
      promptEs: "Implementa un ejemplo siguiendo las instrucciones...",
      difficulty: "medium",
      solutions: [
        {
          title: "Solución",
          code: "Tu código aquí",
          explanation: "Explicación de la solución"
        }
      ]
    }
  ]
});
```

---

## 🎨 Preview en Vivo - Implementación

### Lenguajes Soportados

El preview en vivo funciona para:
- ✅ **HTML** - Renderiza directamente
- ✅ **CSS** - Se aplica a un contenedor
- ✅ **JavaScript** - Ejecuta código JS
- ✅ **JSX** - Compila y renderiza componentes React

### Componente LivePreview

Ubicación: `src/components/LivePreview.tsx`

```typescript
interface LivePreviewProps {
  code: string;
  language: 'html' | 'javascript' | 'jsx' | 'css';
  title: string;
  height?: string;
}

<LivePreview
  code={activeVariant.snippet}
  language={displayLanguage as 'html' | 'javascript' | 'jsx' | 'css'}
  title={`Demo de ${activeTerm.term}`}
  height="450px"
/>
```

### Detección de Términos para Preview

En `src/components/DiccionarioDevApp.tsx`:

```typescript
// Para HTML
function isHtmlTerm(term: TermDTO, language: string): boolean {
  const htmlTerms = ["html", "head", "body", "base", "link", "meta", 
                     "style-element", "title", "script", "noscript", 
                     "template", "slot"];
  return htmlTerms.includes(term.term.toLowerCase()) || language === 'html';
}

// Para CSS
function isCssTerm(term: TermDTO, language: string): boolean {
  const cssTerms = ["flex-col", "grid-template-columns", "bg-gradient-to-r", 
                    "align-items", "aspect-ratio", "backdrop-filter", 
                    "scroll-snap", "clamp"];
  return cssTerms.includes(term.term.toLowerCase()) || language === 'css';
}
```

---

## 📱 Layout Responsive

### Estructura en Desktop (1024px+)

```
┌─────────────────────────────────────────┐
│ SECCIÓN 1: DEFINICIÓN                   │
├─────────────────────────────────────────┤
│ SECCIÓN 2: PARA QUÉ SIRVE               │
├─────────────────────────────────────────┤
│ SECCIÓN 3: CÓMO FUNCIONA                │
├──────────────────┬──────────────────────┤
│   CÓDIGO         │   PREVIEW EN VIVO     │
│   (50%)          │   (50%)               │
├──────────────────┴──────────────────────┤
│ SECCIÓN 4: REGLAS IMPORTANTES           │
├─────────────────────────────────────────┤
│ SECCIÓN 5: EJEMPLOS ADICIONALES         │
└─────────────────────────────────────────┘
```

**CSS Tailwind:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  {/* Código */}
  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
    <StyleAwareCode ... />
  </div>

  {/* Preview */}
  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
    <LivePreview ... />
  </div>
</div>
```

### Estructura en Mobile (<768px)

```
┌─────────────────────┐
│ SECCIÓN 1           │
├─────────────────────┤
│ SECCIÓN 2           │
├─────────────────────┤
│ SECCIÓN 3           │
├─────────────────────┤
│ CÓDIGO              │
├─────────────────────┤
│ PREVIEW EN VIVO     │
├─────────────────────┤
│ SECCIÓN 4           │
└─────────────────────┘
```

---

## ✅ Checklist de Validación

Antes de dar por completado un término, verificar:

### Datos Completos
- [ ] `meaning` - 200+ caracteres ✅
- [ ] `what` - 150+ caracteres ✅
- [ ] `how` - 100+ caracteres ✅
- [ ] `examples` - Mínimo 1 ejemplo ✅
- [ ] `variants` - Mínimo 1 código válido ✅
- [ ] `useCases` - EXACTAMENTE 3 (project, interview, bug) ✅
- [ ] `faqs` - Mínimo 3 preguntas ✅
- [ ] `exercises` - Mínimo 1 ejercicio ✅

### Código Ejecutable
- [ ] HTML: Válido y completo ✅
- [ ] CSS: Tiene selectores válidos ✅
- [ ] JS: No tiene errores de sintaxis ✅
- [ ] Longitud: 200+ caracteres mínimo ✅

### UI/UX
- [ ] Preview aparece en desktop (lado a lado) ✅
- [ ] Preview se ve correctamente en mobile ✅
- [ ] Código está syntax-highlighted ✅
- [ ] Altura del preview: 450px ✅

### Verificación en BD

```typescript
// Script: scripts/verify-term-complete.ts
const term = await prisma.term.findUnique({
  where: { term: "tu-termino" },
  include: { variants: true, useCases: true, faqs: true, exercises: true }
});

// Verificar:
console.log(`meaning: ${term.meaning?.length > 200 ? '✅' : '❌'}`);
console.log(`what: ${term.what?.length > 150 ? '✅' : '❌'}`);
console.log(`how: ${term.how?.length > 100 ? '✅' : '❌'}`);
console.log(`useCases: ${term.useCases.length === 3 ? '✅' : '❌'}`);
console.log(`variants: ${term.variants.length > 0 && term.variants[0].snippet.length > 200 ? '✅' : '❌'}`);
console.log(`faqs: ${term.faqs.length >= 3 ? '✅' : '❌'}`);
console.log(`exercises: ${term.exercises.length >= 1 ? '✅' : '❌'}`);
```

---

## ⚠️ Errores Comunes y Soluciones

### Error 1: Preview no aparece

**Problema:** Código está bien pero no se ve preview

**Causas posibles:**
- [ ] `displayLanguage` no es 'html', 'css', 'js', 'jsx'
- [ ] `activeVariant.snippet` está vacío
- [ ] El término no está en la función `isHtmlTerm()` o `isCssTerm()`

**Solución:**
```typescript
// Verificar que el término está detectado correctamente
const isHtmlActive = isHtmlTerm(activeTerm, displayLanguage);
// Si devuelve false, agregar el término a la lista
```

---

### Error 2: Código no se ejecuta en preview

**Problema:** El preview aparece pero no muestra nada

**Causas posibles:**
- [ ] HTML incompleto (sin DOCTYPE)
- [ ] CSS sin selectores válidos
- [ ] JavaScript con errores de sintaxis
- [ ] Código que requiere APIs externas

**Solución:**
```html
<!-- Para HTML, siempre incluir estructura completa -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Demo</title>
</head>
<body>
  <!-- Contenido aquí -->
</body>
</html>
```

---

### Error 3: Layout desordenado en mobile

**Problema:** En mobile se ve mal el layout

**Causas posibles:**
- [ ] `lg:` breakpoint es para 1024px, usa `md:` para 768px
- [ ] Gap entre columnas muy grande
- [ ] Padding demasiado

**Solución:**
```tsx
// ❌ Incorrecto
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

// ✅ Correcto para mejor visualización mobile
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
```

---

### Error 4: FAQs o Use Cases incompletos

**Problema:** Los datos se guardan pero faltan algunos

**Causas posibles:**
- [ ] Menos de 3 FAQs guardadas
- [ ] Menos de 3 Use Cases guardados
- [ ] Use Cases con contextos duplicados

**Solución:**
```typescript
// Verificar que haya exactamente 3 use cases con diferentes contextos
const contexts = term.useCases.map(uc => uc.context);
if (contexts.length !== 3 || 
    !contexts.includes("project") || 
    !contexts.includes("interview") || 
    !contexts.includes("bug")) {
  console.error("❌ FAQs o Use Cases incompletos");
}
```

---

### Error 5: Variantes no se muestran

**Problema:** El código en "Cómo funciona" aparece vacío

**Causas posibles:**
- [ ] No se creó la variante en la BD
- [ ] El snippet es nulo o vacío
- [ ] Problema de hidratación de Next.js

**Solución:**
```typescript
// Verificar directamente en BD
const variant = await prisma.termVariant.findFirst({
  where: { 
    termId: term.id,
    language: "html"
  }
});

if (!variant || !variant.snippet) {
  console.error("❌ Variante no existe o snippet vacío");
}
```

---

## 📊 Estadísticas de Términos Actuales

**Estado:** 31/31 términos COMPLETOS ✅

| Categoría | Términos | Estado |
|-----------|----------|--------|
| HTML | 12 | ✅ Con Preview |
| CSS/Tailwind | 10 | ✅ Con Preview |
| JavaScript | 6 | ✅ Con Preview |
| Backend/DevOps | 3 | ✅ Completados |
| **TOTAL** | **31** | **✅ 100%** |

---

## 🎓 Resumen de Mejores Prácticas

1. **Siempre crear los 8 puntos** - No omitir ninguno
2. **Código debe ser ejecutable** - Probar antes de guardar
3. **Respecto a accesibilidad** - Incluir atributos ARIA en HTML
4. **Documentar paso a paso** - Los pasos deben ser claros
5. **Use cases variados** - Interview, project, bug (no repetir)
6. **FAQs prácticas** - Basadas en dudas reales de desarrolladores
7. **Ejercicios progresivos** - Fácil → Medio → Difícil
8. **Preview responsive** - Verificar en desktop y mobile

---

**Última actualización:** 29 de noviembre de 2025  
**Versión:** 1.0  
**Estado:** Documentación Completa ✅
