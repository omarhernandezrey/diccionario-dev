# 🔄 Flujo Completo de Implementación de Nuevos Términos

**Propósito:** Guía paso a paso para implementar un término desde cero

---

## 📊 Diagrama de Flujo

```
┌─────────────────────────────┐
│  1. DEFINIR TÉRMINO         │
│  (Nombre, categoría, tipo)  │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  2. ESCRIBIR CONTENIDO      │
│  (meaning, what, how)       │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  3. CREAR CÓDIGO (Snippet)  │
│  (HTML, CSS, JS, etc)       │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  4. AGREGAR USE CASES       │
│  (3 casos: interview,       │
│   project, bug)             │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  5. CREAR FAQs              │
│  (Mínimo 3 preguntas)       │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  6. AGREGAR EJEMPLOS        │
│  (Mínimo 1)                 │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  7. CREAR EJERCICIOS        │
│  (Mínimo 1)                 │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  8. VERIFICAR EN BD         │
│  (Todos los datos)          │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  9. PROBAR EN UI            │
│  (Preview, layout, datos)   │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  10. DEPLOY & COMMIT        │
│  (Guardar cambios)          │
└─────────────────────────────┘
```

---

## 1️⃣ PASO 1: Definir el Término

**Objetivo:** Establecer qué término vamos a crear

### Información a recopilar:

```typescript
interface TermDefinition {
  term: string;                    // "mi-nuevo-termino"
  translation: string;             // "Traducción en otro idioma"
  category: Category;              // "frontend" | "backend" | "database" | "devops" | "general"
  language?: string;               // Lenguaje principal (html, css, js, etc)
  related?: string[];              // Términos relacionados
}

// Ejemplo:
const miTermino: TermDefinition = {
  term: "use-callback",
  translation: "Hook que memoriza funciones",
  category: "frontend",
  language: "javascript",
  related: ["useEffect", "useMemo", "useState"]
};
```

### Preguntas a responder:

- [ ] ¿Cuál es el nombre exacto del término?
- [ ] ¿A qué categoría pertenece?
- [ ] ¿Cuál es su traducción o equivalente?
- [ ] ¿Con qué otros términos se relaciona?
- [ ] ¿Qué lenguaje(s) de programación usa principalmente?

---

## 2️⃣ PASO 2: Escribir Contenido Base

**Objetivo:** Crear la definición, explicación y cómo se usa

### Campos a completar:

```typescript
const contenido = {
  // 1. MEANING - Definición técnica (200+ caracteres)
  meaning: `
    Explicación técnica completa del término. 
    Incluir:
    - Qué es exactamente
    - Para qué sirve
    - Contexto de uso
    - Importancia en programación
  `,

  // 2. WHAT - Explicación de para qué sirve (150+ caracteres)
  what: `
    Enfocarse en:
    - El propósito principal
    - Casos de uso comunes
    - Beneficios clave
    - Problemas que resuelve
  `,

  // 3. HOW - Instrucciones de implementación (100+ caracteres)
  how: `
    Explicar:
    - Pasos básicos de implementación
    - Sintaxis o estructura básica
    - Buenas prácticas iniciales
    - Errores comunes a evitar
  `
};
```

### Ejemplo completo:

```typescript
const ejemploTermino = {
  term: "use-callback",
  
  meaning: `useCallback es un Hook de React que memoriza una función. 
            Devuelve una versión memorizada de la función que solo cambia 
            si una de sus dependencias ha cambiado. Es útil para optimizar 
            el rendimiento cuando pasas callbacks a componentes hijos.`,
  
  what: `Se utiliza para evitar re-renders innecesarios en componentes hijos 
         al optimizar referencias de funciones. Previene que las funciones 
         se creen nuevas en cada render, lo que permite que React evite 
         re-renderizar componentes que dependen de esa función.`,
  
  how: `Envuelve tu función con useCallback y proporciona un array de 
        dependencias. La función retornada será la misma entre renders a 
        menos que alguna dependencia cambio. Úsalo cuando pases funciones 
        a componentes hijos optimizados con React.memo.`
};
```

### Checklist:

- [ ] `meaning` tiene 200+ caracteres
- [ ] `what` tiene 150+ caracteres
- [ ] `how` tiene 100+ caracteres
- [ ] Lenguaje claro y accesible
- [ ] Sin faltas de ortografía

---

## 3️⃣ PASO 3: Crear Código (Snippet)

**Objetivo:** Hacer código ejecutable que muestre cómo funciona el término

### Requisitos:

```
✅ Código válido y funcional
✅ Autónomo (no depende de imports externos)
✅ 200+ caracteres mínimo
✅ Comentado en partes complejas
✅ Produce output visible
✅ Compatible con el LivePreview
```

### Por tipo de término:

#### Para HTML:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Demo</title>
</head>
<body>
  <h1>Contenido aquí</h1>
</body>
</html>
```

#### Para CSS:
```css
:root { --color: #667eea; }
body { background: white; font-family: Arial; }
.container { max-width: 1200px; margin: 0 auto; }
button { background: var(--color); padding: 10px 20px; }
```

#### Para JavaScript:
```javascript
// Código funcional con ejemplos
const suma = (a, b) => a + b;
console.log(suma(5, 3)); // Output: 8
```

### Validación:

```bash
# Para HTML - debe tener estructura completa
✓ <!DOCTYPE html>
✓ <html>, <head>, <body>
✓ Contenido visible

# Para CSS - debe tener selectores
✓ Selectores válidos
✓ Propiedades CSS válidas
✓ Puede aplicarse a elemento

# Para JS - debe ejecutarse sin errores
✓ Sin errores de sintaxis
✓ Sin dependencias no disponibles
✓ Produce console output visible
```

---

## 4️⃣ PASO 4: Agregar Use Cases (3 obligatorios)

**Objetivo:** Mostrar 3 contextos de uso diferentes

### Estructura fija:

```typescript
const useCases = [
  {
    // CASO 1: Para entrevista de trabajo
    context: "interview",
    summary: "Explicar el término en una entrevista",
    steps: [
      "Explica qué es el término",
      "Proporciona un ejemplo práctico",
      "Menciona los beneficios principales",
      "Discute casos de uso comunes"
    ],
    tips: "Sé claro y conciso, evita tecnicismos innecesarios"
  },
  {
    // CASO 2: Para usarlo en un proyecto
    context: "project",
    summary: "Implementar el término en un proyecto real",
    steps: [
      "Identifica dónde necesitas usar el término",
      "Implementa según las especificaciones",
      "Prueba en diferentes escenarios",
      "Optimiza si es necesario"
    ],
    tips: "Sigue las mejores prácticas y estándares del proyecto"
  },
  {
    // CASO 3: Para debuggear problemas
    context: "bug",
    summary: "Encontrar y solucionar problemas relacionados",
    steps: [
      "Identifica el problema específico",
      "Inspecciona con DevTools",
      "Prueba con diferentes valores",
      "Verifica la solución"
    ],
    tips: "Usa console.log y DevTools para investigar"
  }
];
```

### Checklist:

- [ ] Exactamente 3 casos (no más, no menos)
- [ ] Un caso para cada contexto (interview, project, bug)
- [ ] Cada caso tiene 3-4 pasos
- [ ] Cada paso es claro y accionable
- [ ] Tips es útil y específico

---

## 5️⃣ PASO 5: Crear FAQs (Mínimo 3)

**Objetivo:** Responder dudas comunes de desarrolladores

### Estructura:

```typescript
const faqs = [
  {
    questionEs: "¿Cuándo debería usar este término?",
    answerEs: "Deberías usarlo cuando...",
    snippet: null // Opcional
  },
  {
    questionEs: "¿Cómo lo implemento correctamente?",
    answerEs: "Para implementarlo correctamente...",
    snippet: "codigo_de_ejemplo_aqui"
  },
  {
    questionEs: "¿Cuál es la diferencia con...?",
    answerEs: "La diferencia principal es...",
    snippet: null
  },
  {
    // Opcional: 4ta FAQ
    questionEs: "¿Qué errores comunes debo evitar?",
    answerEs: "Los errores más comunes son...",
    snippet: null
  }
];
```

### Pautas:

- Pregunta real que un desarrollador haría
- Respuesta útil y directa (100-200 caracteres)
- Incluir snippet solo si suma claridad
- Evitar preguntas muy obvias

---

## 6️⃣ PASO 6: Agregar Ejemplos (Mínimo 1)

**Objetivo:** Mostrar ejemplos prácticos de uso

### Estructura:

```typescript
const examples = [
  {
    code: "Código de ejemplo funcional",
    title: "Título descriptivo del ejemplo",
    language: "html|css|js|jsx|ts|py",
    explanation: "Explicación de qué hace el código"
  }
];
```

### Ejemplo completo:

```typescript
const ejemplos = [
  {
    code: `
const mensaje = "Hola";
console.log(mensaje);
    `,
    title: "Ejemplo básico",
    language: "javascript",
    explanation: "Muestra cómo crear una variable y mostrarla en consola"
  },
  {
    code: `
function suma(a, b) {
  return a + b;
}
console.log(suma(5, 3)); // 8
    `,
    title: "Función simple",
    language: "javascript",
    explanation: "Demuestra una función que suma dos números"
  }
];
```

### Checklist:

- [ ] Mínimo 1 ejemplo (máximo 3)
- [ ] Código es completo y funciona
- [ ] Título es descriptivo
- [ ] Explicación es clara

---

## 7️⃣ PASO 7: Crear Ejercicios (Mínimo 1)

**Objetivo:** Proporcionar práctica para aprender

### Estructura:

```typescript
const ejercicios = [
  {
    titleEs: "Nombre del ejercicio",
    promptEs: "Descripción del problema a resolver",
    difficulty: "easy|medium|hard",
    solutions: [
      {
        title: "Solución básica",
        code: "Tu código aquí",
        explanation: "Explicación de cómo funciona"
      },
      {
        title: "Solución avanzada",
        code: "Código más optimizado",
        explanation: "Por qué es mejor"
      }
    ]
  }
];
```

### Ejemplo:

```typescript
const ejercicio = {
  titleEs: "Contador Interactivo",
  promptEs: `Crea un contador que incremente cuando se hace clic 
             en un botón y se reste cuando se presiona otro.`,
  difficulty: "medium",
  solutions: [
    {
      title: "Solución con JavaScript vanilla",
      code: `
let contador = 0;
document.getElementById('btn').addEventListener('click', () => {
  contador++;
  console.log(contador);
});
      `,
      explanation: "Usa un event listener para incrementar"
    }
  ]
};
```

---

## 8️⃣ PASO 8: Verificar en Base de Datos

**Objetivo:** Validar que todos los datos están guardados correctamente

### Script de verificación:

```typescript
// scripts/verify-term.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verificarTermino(nombreTermino: string) {
  const term = await prisma.term.findUnique({
    where: { term: nombreTermino },
    include: {
      variants: true,
      useCases: true,
      faqs: true,
      exercises: true,
      examples: true
    }
  });

  if (!term) {
    console.error("❌ Término no encontrado");
    return;
  }

  console.log("✅ VERIFICACIÓN DE TÉRMINO:", nombreTermino);
  console.log("");
  
  // Verificar cada punto
  console.log("1. Meaning:", term.meaning?.length || 0, "caracteres", 
              term.meaning?.length >= 200 ? "✅" : "❌");
  
  console.log("2. What:", term.what?.length || 0, "caracteres", 
              term.what?.length >= 150 ? "✅" : "❌");
  
  console.log("3. How:", term.how?.length || 0, "caracteres", 
              term.how?.length >= 100 ? "✅" : "❌");
  
  console.log("4. Use Cases:", term.useCases.length, 
              term.useCases.length === 3 ? "✅" : "❌");
  
  console.log("5. Variants (Código):", term.variants.length, 
              term.variants.length > 0 && term.variants[0].snippet.length > 200 ? "✅" : "❌");
  
  console.log("6. Examples:", term.examples?.length || 0, 
              (Array.isArray(term.examples) && term.examples.length > 0) ? "✅" : "❌");
  
  console.log("7. FAQs:", term.faqs.length, 
              term.faqs.length >= 3 ? "✅" : "❌");
  
  console.log("8. Exercises:", term.exercises.length, 
              term.exercises.length >= 1 ? "✅" : "❌");

  await prisma.$disconnect();
}

verificarTermino("tu-termino");
```

### Ejecutar:

```bash
npx ts-node scripts/verify-term.ts
```

---

## 9️⃣ PASO 9: Probar en la UI

**Objetivo:** Validar que se ve bien en la interfaz

### Checklist visual:

```
DESKTOP (1024px+)
☐ El término aparece en búsqueda
☐ Se muestra el "Punto 1: Definición"
☐ Se muestra el "Punto 2: Para qué sirve"
☐ Se muestra el "Punto 3: Cómo funciona"
☐ CÓDIGO y PREVIEW están lado a lado
☐ El preview se renderiza correctamente
☐ El código tiene syntax highlighting
☐ Se muestran los FAQs
☐ Se muestran los ejercicios

TABLET (768px - 1023px)
☐ Layout es legible
☐ Código y preview están apilados
☐ No hay overflow horizontal
☐ Los botones son clickeables

MOBILE (< 768px)
☐ Todo es 1 columna
☐ Preview es del tamaño correcto
☐ Código es scrolleable
☐ Es funcional en touch

PREVIEW
☐ HTML: Renderiza correctamente
☐ CSS: Los estilos se aplican
☐ JS: Funciona sin errores
☐ Altura 450px es adecuada
```

---

## 🔟 PASO 10: Commit y Deploy

**Objetivo:** Guardar los cambios en el repositorio

### Comandos:

```bash
# 1. Ver estado
git status

# 2. Agregar cambios
git add -A

# 3. Hacer commit
git commit -m "feat: agregar término 'mi-nuevo-termino' con preview en vivo"

# 4. Push a main
git push origin main

# 5. Verificar deploy
# Esperar a que se construya en tu plataforma de hosting
```

### Mensaje de commit recomendado:

```
feat: agregar término 'nombre-termino' con 8 puntos completos

- Agregar definición, explicación y modo de uso
- Incluir código ejecutable con preview en vivo
- Crear 3 casos de uso (interview, project, bug)
- Agregar 3+ FAQs con respuestas
- Incluir ejemplos prácticos
- Crear ejercicios interactivos
```

---

## 📝 Template Rápido (Copy-Paste)

```typescript
// Usar este template para crear nuevos términos rápidamente

const nuevoTermino = {
  // INFORMACIÓN BÁSICA
  term: "nombre-del-termino",
  translation: "Traducción",
  category: "frontend",
  
  // 1. MEANING (200+ caracteres)
  meaning: "Definición técnica completa del término...",
  
  // 2. WHAT (150+ caracteres)
  what: "Explicación de para qué sirve...",
  
  // 3. HOW (100+ caracteres)
  how: "Instrucciones de cómo implementar...",
  
  // 4. USE CASES (exactamente 3)
  useCases: [
    { context: "interview", summary: "...", steps: [...], tips: "..." },
    { context: "project", summary: "...", steps: [...], tips: "..." },
    { context: "bug", summary: "...", steps: [...], tips: "..." }
  ],
  
  // 5. VARIANT (código ejecutable, 200+ caracteres)
  variants: [
    { language: "html", snippet: "...", level: "intermediate", status: "approved" }
  ],
  
  // 6. EXAMPLES (mínimo 1)
  examples: [
    { code: "...", title: "...", language: "...", explanation: "..." }
  ],
  
  // 7. FAQs (mínimo 3)
  faqs: [
    { questionEs: "...", answerEs: "...", snippet: null },
    { questionEs: "...", answerEs: "...", snippet: null },
    { questionEs: "...", answerEs: "...", snippet: null }
  ],
  
  // 8. EXERCISES (mínimo 1)
  exercises: [
    { 
      titleEs: "...", 
      promptEs: "...", 
      difficulty: "medium", 
      solutions: [{ title: "...", code: "...", explanation: "..." }]
    }
  ]
};
```

---

**Versión:** 1.0  
**Última actualización:** 29 de noviembre de 2025  
**Estado:** Documentación Completa ✅
