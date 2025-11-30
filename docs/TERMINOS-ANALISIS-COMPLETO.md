# 📖 Diccionario Dev - Documentación Completa

> Documentación interactiva del diccionario de desarrolladores con ejemplos de código en múltiples lenguajes

**Última actualización:** 29/11/2025
**Total de términos:** 31

---

## Tabla de Contenidos

- [ALIGN-ITEMS](#align-items)
- [ARIA-LABEL](#aria-label)
- [ASPECT-RATIO](#aspect-ratio)
- [BACKDROP-FILTER](#backdrop-filter)
- [BASE](#base)
- [BG-GRADIENT-TO-R](#bg-gradient-to-r)
- [BODY](#body)
- [CI/CD](#ci/cd)
- [CLAMP](#clamp)
- [DEBOUNCE](#debounce)
- [DOCKER](#docker)
- [FETCH](#fetch)
- [FLEX-COL](#flex-col)
- [GRAPHQL](#graphql)
- [GRID-TEMPLATE-COLUMNS](#grid-template-columns)
- [HEAD](#head)
- [HTML](#html)
- [JWT](#jwt)
- [LINK](#link)
- [META](#meta)
- [NOSCRIPT](#noscript)
- [PRISMA](#prisma)
- [REST](#rest)
- [SCRIPT](#script)
- [SCROLL-SNAP](#scroll-snap)
- [SLOT](#slot)
- [STYLE-ELEMENT](#style-element)
- [TEMPLATE](#template)
- [TITLE](#title)
- [USEEFFECT](#useeffect)
- [USESTATE](#usestate)

---

## ALIGN-ITEMS

### 📝 Traducción
**alinear elementos en el eje cruzado**

---

### 🎯 Definición

#### Español
En programación "align-items" se refiere a Propiedad de flexbox y grid que alinea los hijos verticalmente cuando sobra espacio en el eje cruzado..

#### English
Flexbox and grid property that aligns items along the cross axis whenever there is extra space.

---

### 💡 ¿Para qué sirve?

#### Español
Se usa para definir cómo se acomodan los elementos respecto al eje perpendicular al flujo.

#### English
It controls how children sit on the cross axis when there is remaining room.

---

### 🛠️ ¿Cómo se usa?

#### Español
Declara display:flex o display:grid y ajusta align-items en el contenedor. Experimenta con valores como center, flex-end o stretch.

#### English
Set display:flex or grid on the container and tweak align-items with values such as center, flex-end or stretch.

### 💻 Ejemplos de Código

#### CSS
```css
/* Definimos un contenedor flex para las tarjetas */
section.cards {
  /* Activamos flexbox en el contenedor */
  display: flex;
  
  /* Centramos los elementos en el eje cruzado (vertical) */
  /* Esto hace que todas las cards tengan la misma altura visual */
  align-items: center;
  
  /* Añadimos espacio entre las tarjetas */
  gap: 1.25rem;
}

/* Estilizamos cada tarjeta individual */
section.cards > article {
  /* Cada card ocupa el mismo espacio disponible */
  flex: 1;
  
  /* Establecemos una altura mínima */
  min-height: 280px;
}
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Aplica "align-items" en la capa visual y de interacción para destrabar un caso real. | Apply "align-items" in the UI layer to unblock a real scenario.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Conecta el concepto con un proyecto o métrica real. | Connect the concept with a real project or metric.

#### 2. 🎤 Entrevista
**Explica "align-items" como si estuvieras frente a un líder técnico. | Explain "align-items" as if you were in front of a tech lead.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Usa analogías claras y evita jerga innecesaria. | Use clear analogies and avoid unnecessary jargon.

#### 3. 🐛 Bug Fix
**Usa "align-items" para diagnosticar o prevenir bugs relacionados. | Use "align-items" to diagnose or prevent related bugs.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Resalta logs o métricas relevantes. | Highlight relevant logs or metrics.

### ❓ Preguntas Frecuentes

#### 1. ¿Cómo explicas align-items en una entrevista?
**Respuesta:** En programación "align-items" se refiere a Propiedad de flexbox y grid que alinea los hijos verticalmente cuando sobra espacio en el eje cruzado.. Declara display:flex o display:grid y ajusta align-items en el contenedor. Experimenta con valores como center, flex-end o stretch.

```
/* Definimos un contenedor flex para las tarjetas */
section.cards {
  /* Activamos flexbox en el contenedor */
  display: flex;
  
  /* Centramos los elementos en el eje cruzado (vertical) */
  /* Esto hace que todas las cards tengan la misma altura visual */
  align-items: center;
  
  /* Añadimos espacio entre las tarjetas */
  gap: 1.25rem;
}

/* Estilizamos cada tarjeta individual */
section.cards > article {
  /* Cada card ocupa el mismo espacio disponible */
  flex: 1;
  
  /* Establecemos una altura mínima */
  min-height: 280px;
}
```

**Q (English):** How do you explain align-items during an interview?
**A (English):** Flexbox and grid property that aligns items along the cross axis whenever there is extra space. Set display:flex or grid on the container and tweak align-items with values such as center, flex-end or stretch.

#### 2. ¿Cómo reiniciar o resetear align-items?
**Respuesta:** Usa el valor 'initial', 'unset' o el valor por defecto de la propiedad para anular estilos heredados.

```
.element {
  align-items: initial;
}
```

**Q (English):** How to reset or reinitialize align-items?
**A (English):** Use 'initial', 'unset' or the default property value to override inherited styles.

#### 3. ¿Cuáles son las buenas prácticas para usar align-items?
**Respuesta:** Usa clases utilitarias o componentes, evita selectores anidados profundos y verifica el soporte en navegadores.

```
/* Buenas prácticas */
.component {
  /* Usa variables para consistencia */
  align-items: var(--align-items);
}
```

**Q (English):** What are best practices for using align-items?
**A (English):** Use utility classes or components, avoid deep nesting and check browser support.

### 🎓 Ejercicios

#### Ejercicio 1: Ejercicio align-items
**Dificultad:** ⭐⭐

**Implementa "align-items" en un ejemplo práctico y explica cada paso.**

**Solución 1:**
```css
<div style="display: flex; justify-content: center; align-items: center; height: 300px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;">
  <div style="background: white; padding: 30px 50px; border-radius: 8px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
    <h2 style="margin: 0 0 10px 0; color: #333; font-size: 24px;">Centrado Perfecto</h2>
    <p style="margin: 0; color: #666; font-size: 14px;">justify-content + align-items = centro absoluto</p>
  </div>
</div>
```

---

**Categoría:** frontend | **ID:** 14


## ARIA-LABEL

### 📝 Traducción
**etiqueta accesible**

---

### 🎯 Definición

#### Español
En programación "aria-label" se refiere a Atributo HTML que proporciona texto accesible para lectores de pantalla cuando no hay texto visible..

#### English
HTML attribute providing accessible text for screen readers when no visible text exists.

---

### 💡 ¿Para qué sirve?

#### Español
Hace que controles sin texto visible sean anunciados correctamente por tecnologías asistivas.

#### English
Ensures controls without visible text are announced by assistive tech.

---

### 🛠️ ¿Cómo se usa?

#### Español
Añade aria-label conciso y accionable; evita duplicar cuando ya hay texto visible.

#### English
Add a concise, action-oriented aria-label; avoid duplicating visible text.

### 💻 Ejemplos de Código

#### TypeScript
```ts
<button aria-label="Abrir menú" class="p-2 rounded hover:bg-slate-100">
  <svg aria-hidden="true" viewBox="0 0 24 24" class="h-5 w-5">
    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2"/>
  </svg>
</button>
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Aplica "aria-label" en la capa visual y de interacción para destrabar un caso real. | Apply "aria-label" in the UI layer to unblock a real scenario.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Conecta el concepto con un proyecto o métrica real. | Connect the concept with a real project or metric.

#### 2. 🎤 Entrevista
**Explica "aria-label" como si estuvieras frente a un líder técnico. | Explain "aria-label" as if you were in front of a tech lead.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Usa analogías claras y evita jerga innecesaria. | Use clear analogies and avoid unnecessary jargon.

#### 3. 🐛 Bug Fix
**Usa "aria-label" para diagnosticar o prevenir bugs relacionados. | Use "aria-label" to diagnose or prevent related bugs.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Resalta logs o métricas relevantes. | Highlight relevant logs or metrics.

### ❓ Preguntas Frecuentes

#### 1. ¿Cómo explicas aria-label en una entrevista?
**Respuesta:** En programación "aria-label" se refiere a Atributo HTML que proporciona texto accesible para lectores de pantalla cuando no hay texto visible.. Añade aria-label conciso y accionable; evita duplicar cuando ya hay texto visible.

```
<button aria-label="Abrir menú" class="p-2 rounded hover:bg-slate-100">
  <svg aria-hidden="true" viewBox="0 0 24 24" class="h-5 w-5">
    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2"/>
  </svg>
</button>
```

**Q (English):** How do you explain aria-label during an interview?
**A (English):** HTML attribute providing accessible text for screen readers when no visible text exists. Add a concise, action-oriented aria-label; avoid duplicating visible text.

#### 2. ¿Cómo reiniciar o resetear aria-label?
**Respuesta:** Usa el valor 'initial', 'unset' o el valor por defecto de la propiedad para anular estilos heredados.

```
.element {
  aria-label: initial;
}
```

**Q (English):** How to reset or reinitialize aria-label?
**A (English):** Use 'initial', 'unset' or the default property value to override inherited styles.

#### 3. ¿Cuáles son las buenas prácticas para usar aria-label?
**Respuesta:** Usa clases utilitarias o componentes, evita selectores anidados profundos y verifica el soporte en navegadores.

```
/* Buenas prácticas */
.component {
  /* Usa variables para consistencia */
  aria-label: var(--aria-label);
}
```

**Q (English):** What are best practices for using aria-label?
**A (English):** Use utility classes or components, avoid deep nesting and check browser support.

### 🎓 Ejercicios

#### Ejercicio 1: Ejercicio aria-label
**Dificultad:** ⭐⭐

**Implementa "aria-label" en un ejemplo práctico y explica cada paso.**

**Solución 1:**
```ts
<form role="search">
  <label for="search" class="sr-only">Buscar productos</label>
  <input id="search" type="text" placeholder="Buscar..." />
  <button type="submit" aria-label="Realizar búsqueda">
    🔍
  </button>
</form>
```

---

**Categoría:** frontend | **ID:** 5


## ASPECT-RATIO

### 📝 Traducción
**relación de aspecto nativa**

---

### 🎯 Definición

#### Español
En programación "aspect-ratio" se refiere a Propiedad que reserva el alto correcto de un elemento aunque sólo definas el ancho..

#### English
Property that locks the intrinsic ratio so height is calculated automatically from width.

---

### 💡 ¿Para qué sirve?

#### Español
Resuelve placeholders para videos, iframes o componentes con proporción fija.

#### English
Keeps placeholders for videos, iframes or cards perfectly scaled.

---

### 🛠️ ¿Cómo se usa?

#### Español
Declara aspect-ratio en contenedores multimedia o componentes gráficos y deja que el layout se ajuste.

#### English
Set aspect-ratio on media containers or graphical components and let the browser honor it.

### 💻 Ejemplos de Código

#### CSS
```css
.video-card {
  /* Establecemos una relación de aspecto 16:9 */
  /* El navegador calculará automáticamente la altura */
  /* basándose en el ancho del elemento */
  aspect-ratio: 16 / 9;
  
  /* Color de fondo mientras carga el video */
  background: #0f172a;
  
  /* Bordes redondeados para estética moderna */
  border-radius: 1rem;
}
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Aplica "aspect-ratio" en la capa visual y de interacción para destrabar un caso real. | Apply "aspect-ratio" in the UI layer to unblock a real scenario.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Conecta el concepto con un proyecto o métrica real. | Connect the concept with a real project or metric.

#### 2. 🎤 Entrevista
**Explica "aspect-ratio" como si estuvieras frente a un líder técnico. | Explain "aspect-ratio" as if you were in front of a tech lead.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Usa analogías claras y evita jerga innecesaria. | Use clear analogies and avoid unnecessary jargon.

#### 3. 🐛 Bug Fix
**Usa "aspect-ratio" para diagnosticar o prevenir bugs relacionados. | Use "aspect-ratio" to diagnose or prevent related bugs.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Resalta logs o métricas relevantes. | Highlight relevant logs or metrics.

### ❓ Preguntas Frecuentes

#### 1. ¿Cómo explicas aspect-ratio en una entrevista?
**Respuesta:** En programación "aspect-ratio" se refiere a Propiedad que reserva el alto correcto de un elemento aunque sólo definas el ancho.. Declara aspect-ratio en contenedores multimedia o componentes gráficos y deja que el layout se ajuste.

```
.video-card {
  /* Establecemos una relación de aspecto 16:9 */
  /* El navegador calculará automáticamente la altura */
  /* basándose en el ancho del elemento */
  aspect-ratio: 16 / 9;
  
  /* Color de fondo mientras carga el video */
  background: #0f172a;
  
  /* Bordes redondeados para estética moderna */
  border-radius: 1rem;
}
```

**Q (English):** How do you explain aspect-ratio during an interview?
**A (English):** Property that locks the intrinsic ratio so height is calculated automatically from width. Set aspect-ratio on media containers or graphical components and let the browser honor it.

#### 2. ¿Cómo reiniciar o resetear aspect-ratio?
**Respuesta:** Usa el valor 'initial', 'unset' o el valor por defecto de la propiedad para anular estilos heredados.

```
.element {
  aspect-ratio: initial;
}
```

**Q (English):** How to reset or reinitialize aspect-ratio?
**A (English):** Use 'initial', 'unset' or the default property value to override inherited styles.

#### 3. ¿Cuáles son las buenas prácticas para usar aspect-ratio?
**Respuesta:** Usa clases utilitarias o componentes, evita selectores anidados profundos y verifica el soporte en navegadores.

```
/* Buenas prácticas */
.component {
  /* Usa variables para consistencia */
  aspect-ratio: var(--aspect-ratio);
}
```

**Q (English):** What are best practices for using aspect-ratio?
**A (English):** Use utility classes or components, avoid deep nesting and check browser support.

### 🎓 Ejercicios

#### Ejercicio 1: Ejercicio aspect-ratio
**Dificultad:** ⭐⭐

**Implementa "aspect-ratio" en un ejemplo práctico y explica cada paso.**

**Solución 1:**
```css
.hero-image {
  width: 100%;
  aspect-ratio: 21 / 9;
  object-fit: cover;
}
```

---

**Categoría:** frontend | **ID:** 17


## BACKDROP-FILTER

### 📝 Traducción
**aplicar desenfoques al fondo**

---

### 🎯 Definición

#### Español
En programación "backdrop-filter" se refiere a Permite difuminar o saturar el contenido que está detrás de un elemento translúcido..

#### English
Applies blur or color effects to what lives behind a translucent element.

---

### 💡 ¿Para qué sirve?

#### Español
Es útil para overlays, barras flotantes o paneles donde quieres ver el contenido subyacente.

#### English
Great for overlays, floating panels or nav bars where you want to hint at underlying content.

---

### 🛠️ ¿Cómo se usa?

#### Español
Combínalo con background rgba() y border suaves para dar profundidad sin saturar la UI.

#### English
Combine it with rgba backgrounds and subtle borders to add depth without clutter.

### 💻 Ejemplos de Código

#### CSS
```css
.glass-card {
  /* Aplicamos efectos al contenido detrás del elemento */
  /* blur(18px) = desenfoque de 18 píxeles */
  /* saturate(120%) = aumentamos la saturación de color en 20% */
  backdrop-filter: blur(18px) saturate(120%);
  
  /* Fondo semi-transparente (REQUERIDO para que funcione backdrop-filter) */
  /* rgba(15, 23, 42, 0.45) = color oscuro con 45% de opacidad */
  background: rgba(15, 23, 42, 0.45);
  
  /* Borde sutil semi-transparente para definir los límites */
  border: 1px solid rgba(255, 255, 255, 0.15);
}
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Aplica "backdrop-filter" en la capa visual y de interacción para destrabar un caso real. | Apply "backdrop-filter" in the UI layer to unblock a real scenario.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Conecta el concepto con un proyecto o métrica real. | Connect the concept with a real project or metric.

#### 2. 🎤 Entrevista
**Explica "backdrop-filter" como si estuvieras frente a un líder técnico. | Explain "backdrop-filter" as if you were in front of a tech lead.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Usa analogías claras y evita jerga innecesaria. | Use clear analogies and avoid unnecessary jargon.

#### 3. 🐛 Bug Fix
**Usa "backdrop-filter" para diagnosticar o prevenir bugs relacionados. | Use "backdrop-filter" to diagnose or prevent related bugs.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Resalta logs o métricas relevantes. | Highlight relevant logs or metrics.

### ❓ Preguntas Frecuentes

#### 1. ¿Cómo explicas backdrop-filter en una entrevista?
**Respuesta:** En programación "backdrop-filter" se refiere a Permite difuminar o saturar el contenido que está detrás de un elemento translúcido.. Combínalo con background rgba() y border suaves para dar profundidad sin saturar la UI.

```
.glass-card {
  /* Aplicamos efectos al contenido detrás del elemento */
  /* blur(18px) = desenfoque de 18 píxeles */
  /* saturate(120%) = aumentamos la saturación de color en 20% */
  backdrop-filter: blur(18px) saturate(120%);
  
  /* Fondo semi-transparente (REQUERIDO para que funcione backdrop-filter) */
  /* rgba(15, 23, 42, 0.45) = color oscuro con 45% de opacidad */
  background: rgba(15, 23, 42, 0.45);
  
  /* Borde sutil semi-transparente para definir los límites */
  border: 1px solid rgba(255, 255, 255, 0.15);
}
```

**Q (English):** How do you explain backdrop-filter during an interview?
**A (English):** Applies blur or color effects to what lives behind a translucent element. Combine it with rgba backgrounds and subtle borders to add depth without clutter.

#### 2. ¿Cómo reiniciar o resetear backdrop-filter?
**Respuesta:** Usa el valor 'initial', 'unset' o el valor por defecto de la propiedad para anular estilos heredados.

```
.element {
  backdrop-filter: initial;
}
```

**Q (English):** How to reset or reinitialize backdrop-filter?
**A (English):** Use 'initial', 'unset' or the default property value to override inherited styles.

#### 3. ¿Cuáles son las buenas prácticas para usar backdrop-filter?
**Respuesta:** Usa clases utilitarias o componentes, evita selectores anidados profundos y verifica el soporte en navegadores.

```
/* Buenas prácticas */
.component {
  /* Usa variables para consistencia */
  backdrop-filter: var(--backdrop-filter);
}
```

**Q (English):** What are best practices for using backdrop-filter?
**A (English):** Use utility classes or components, avoid deep nesting and check browser support.

### 🎓 Ejercicios

#### Ejercicio 1: Ejercicio backdrop-filter
**Dificultad:** ⭐⭐

**Implementa "backdrop-filter" en un ejemplo práctico y explica cada paso.**

**Solución 1:**
```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 50;
}
```

---

**Categoría:** frontend | **ID:** 19


## BASE

### 📝 Traducción
**URL base para enlaces relativos**

---

### 🎯 Definición

#### Español
En programación "base" se refiere al elemento HTML que especifica una URL base para todos los enlaces relativos de la página, permitiendo que el navegador resuelva correctamente rutas relativas.

#### English
The HTML element that specifies a base URL for all relative links on the page, allowing the browser to correctly resolve relative paths.

---

### 💡 ¿Para qué sirve?

#### Español
Se usa para definir un URL base único para toda la página, útil cuando los archivos están en subdirectorios o cuando necesitas cambiar la raíz de referencias sin modificar cada enlace.

#### English
It defines a single base URL for the entire page, useful when files are in subdirectories or when you need to change the root of references without modifying each link.

---

### 🛠️ ¿Cómo se usa?

#### Español
Incluye la etiqueta <base href="URL"> en el <head> antes de otros enlaces; todas las rutas relativas se resolverán respecto a esta URL base.

#### English
Include <base href="URL"> tag in <head> before other links; all relative paths will be resolved relative to this base URL.

### 💻 Ejemplos de Código

#### HTML
```html
<!-- Define URL base para todas las rutas relativas -->
<head>
  <!-- Sin base: rutas relativas dependen de la URL actual -->
  <base href="https://ejemplo.com/app/">
  
  <!-- Ahora /imagen.png se resuelve como -->
  <!-- https://ejemplo.com/app/imagen.png -->
</head>
<body>
  <!-- href relativo se resuelve con la URL base -->
  <a href="pagina.html">Mi Página</a>
  
  <!-- Imagen relativa -->
  <img src="logo.png" alt="Logo">
</body>
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Usar base en un proyecto real**

**Pasos:**
1. Identificar dónde necesitas base
2. Implementar correctamente según especificaciones
3. Probar en navegadores compatibles

**💡 Tips:** Asegúrate de seguir las mejores prácticas de accesibilidad

#### 2. 🎤 Entrevista
**Explicar base en una entrevista**

**Pasos:**
1. Explicar qué es base
2. Dar ejemplos prácticos de uso
3. Mencionar por qué es importante

**💡 Tips:** Sé claro y conciso, evita tecnicismos innecesarios

#### 3. 🐛 Bug Fix
**Debuggear problemas con base**

**Pasos:**
1. Inspecciona el elemento en DevTools
2. Verifica que el contenido esté correcto
3. Revisa el rendering en diferentes navegadores

**💡 Tips:** Usa la consola para verificar el estado

### ❓ Preguntas Frecuentes

#### 1. ¿Cuándo debo usar base?
**Respuesta:** Debes usar base cuando necesites se usa para definir un url base único para toda la página, útil cuando los archivos están en subdirectorios o cuando necesitas cambiar la raíz de referencias sin modificar cada enlace..

**Q (English):** When should I use base?
**A (English):** You should use base when you need to it defines a single base url for the entire page, useful when files are in subdirectories or when you need to change the root of references without modifying each link..

#### 2. ¿Cómo implemento base correctamente?
**Respuesta:** Incluye la etiqueta <base href="URL"> en el <head> antes de otros enlaces; todas las rutas relativas se resolverán respecto a esta URL base.

**Q (English):** How do I implement base correctly?
**A (English):** Include <base href="URL"> tag in <head> before other links; all relative paths will be resolved relative to this base URL.

#### 3. ¿Es base compatible con todos los navegadores?
**Respuesta:** Sí, base es un estándar HTML y es compatible con todos los navegadores modernos.

**Q (English):** Is base compatible with all browsers?
**A (English):** Yes, base is an HTML standard and is compatible with all modern browsers.

### 🎓 Ejercicios

#### Ejercicio 1: Práctica: Usar base
**Dificultad:** ⭐⭐

**Implementa un ejemplo funcional usando base. Se usa para definir un URL base único para toda la página, útil cuando los archivos están en subdirectorios o cuando necesitas cambiar la raíz de referencias sin modificar cada enlace.**

**Solución 1:**
```typescript
<head>
  <base href="https://ejemplo.com/app/">
</head>
<body>
  <a href="pagina.html">Página</a> <!-- Resuelto a https://ejemplo.com/app/pagina.html -->
</body>
```

---

**Categoría:** frontend | **ID:** 24


## BG-GRADIENT-TO-R

### 📝 Traducción
**degradado horizontal Tailwind**

---

### 🎯 Definición

#### Español
En programación "bg-gradient-to-r" se refiere a Clase utilitaria de Tailwind CSS que aplica un fondo degradado de izquierda a derecha..

#### English
Tailwind utility that applies a left-to-right gradient background.

---

### 💡 ¿Para qué sirve?

#### Español
Aporta contraste y jerarquía visual a botones o secciones sin escribir CSS adicional.

#### English
Adds contrast and visual hierarchy to buttons or sections without extra CSS.

---

### 🛠️ ¿Cómo se usa?

#### Español
Aplica la clase bg-gradient-to-r en el atributo class junto con from-*, to-* y opcionalmente via-*. Para texto usa bg-clip-text y text-transparent. Combina con variantes como hover:, dark: o md: para diseños responsivos.

#### English
Apply the bg-gradient-to-r class in the class attribute along with from-*, to-* and optionally via-*. For text use bg-clip-text and text-transparent. Combine with variants like hover:, dark: or md: for responsive designs.

### 💻 Ejemplos de Código

#### HTML
```html
<button class="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 text-white px-4 py-2 rounded-lg shadow">CTA</button>
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Aplica "bg-gradient-to-r" en la capa visual y de interacción para destrabar un caso real. | Apply "bg-gradient-to-r" in the UI layer to unblock a real scenario.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Conecta el concepto con un proyecto o métrica real. | Connect the concept with a real project or metric.

#### 2. 🎤 Entrevista
**Explica "bg-gradient-to-r" como si estuvieras frente a un líder técnico. | Explain "bg-gradient-to-r" as if you were in front of a tech lead.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Usa analogías claras y evita jerga innecesaria. | Use clear analogies and avoid unnecessary jargon.

#### 3. 🐛 Bug Fix
**Usa "bg-gradient-to-r" para diagnosticar o prevenir bugs relacionados. | Use "bg-gradient-to-r" to diagnose or prevent related bugs.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Resalta logs o métricas relevantes. | Highlight relevant logs or metrics.

### ❓ Preguntas Frecuentes

#### 1. ¿Cómo explicas bg-gradient-to-r en una entrevista?
**Respuesta:** En programación "bg-gradient-to-r" se refiere a Clase utilitaria de Tailwind CSS que aplica un fondo degradado de izquierda a derecha.. Aplica la clase bg-gradient-to-r en el atributo class junto con from-*, to-* y opcionalmente via-*. Para texto usa bg-clip-text y text-transparent. Combina con variantes como hover:, dark: o md: para diseños responsivos.

```
<button class="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 text-white px-4 py-2 rounded-lg shadow">CTA</button>
```

**Q (English):** How do you explain bg-gradient-to-r during an interview?
**A (English):** Tailwind utility that applies a left-to-right gradient background. Apply the bg-gradient-to-r class in the class attribute along with from-*, to-* and optionally via-*. For text use bg-clip-text and text-transparent. Combine with variants like hover:, dark: or md: for responsive designs.

#### 2. ¿Cómo reiniciar o resetear bg-gradient-to-r?
**Respuesta:** Usa el valor 'initial', 'unset' o el valor por defecto de la propiedad para anular estilos heredados.

```
.element {
  bg-gradient-to-r: initial;
}
```

**Q (English):** How to reset or reinitialize bg-gradient-to-r?
**A (English):** Use 'initial', 'unset' or the default property value to override inherited styles.

#### 3. ¿Cuáles son las buenas prácticas para usar bg-gradient-to-r?
**Respuesta:** Usa clases utilitarias o componentes, evita selectores anidados profundos y verifica el soporte en navegadores.

```
/* Buenas prácticas */
.component {
  /* Usa variables para consistencia */
  bg-gradient-to-r: var(--bg-gradient-to-r);
}
```

**Q (English):** What are best practices for using bg-gradient-to-r?
**A (English):** Use utility classes or components, avoid deep nesting and check browser support.

### 🎓 Ejercicios

#### Ejercicio 1: Ejercicio bg-gradient-to-r
**Dificultad:** ⭐⭐

**Implementa "bg-gradient-to-r" en un ejemplo práctico y explica cada paso.**

**Solución 1:**
```html
<div class="p-1 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rounded-xl">
  <div class="bg-white p-6 rounded-lg">
    <h2 class="font-bold text-xl">Card Title</h2>
    <p>Content goes here...</p>
  </div>
</div>
```

---

**Categoría:** frontend | **ID:** 3


## BODY

### 📝 Traducción
**contenido visible del documento**

---

### 🎯 Definición

#### Español
En programación "body" se refiere al elemento HTML que contiene todo el contenido visible de la página: texto, imágenes, formularios, enlaces y elementos interactivos que el usuario ve en el navegador.

#### English
The HTML element that contains all visible page content: text, images, forms, links and interactive elements that users see in the browser.

---

### 💡 ¿Para qué sirve?

#### Español
Se usa para envolver todo el contenido que debe mostrarse al usuario, permitiendo aplicar estilos globales y scripts que manipulen el contenido visible.

#### English
It wraps all content that should be displayed to users, allowing global styles and scripts that manipulate visible content.

---

### 🛠️ ¿Cómo se usa?

#### Español
Coloca todos los elementos de contenido dentro del <body> después del </head>; organiza el contenido usando estructura semántica con header, main, section, article, footer.

#### English
Place all content elements inside <body> after </head>; organize content using semantic structure with header, main, section, article, footer.

### 💻 Ejemplos de Código

#### HTML
```html
<body>
  <!-- Encabezado de la página -->
  <header>
    <nav>Menú de navegación</nav>
  </header>
  
  <!-- Contenido principal -->
  <main>
    <section>
      <article>
        <h1>Título del artículo</h1>
        <p>Contenido que el usuario ve...</p>
      </article>
    </section>
  </main>
  
  <!-- Pie de página -->
  <footer>
    <p>&copy; 2025 Mi Empresa</p>
  </footer>
  
  <!-- Scripts al final para mejor rendimiento -->
  <script src="app.js"></script>
</body>
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Usar body en un proyecto real**

**Pasos:**
1. Identificar dónde necesitas body
2. Implementar correctamente según especificaciones
3. Probar en navegadores compatibles

**💡 Tips:** Asegúrate de seguir las mejores prácticas de accesibilidad

#### 2. 🎤 Entrevista
**Explicar body en una entrevista**

**Pasos:**
1. Explicar qué es body
2. Dar ejemplos prácticos de uso
3. Mencionar por qué es importante

**💡 Tips:** Sé claro y conciso, evita tecnicismos innecesarios

#### 3. 🐛 Bug Fix
**Debuggear problemas con body**

**Pasos:**
1. Inspecciona el elemento en DevTools
2. Verifica que el contenido esté correcto
3. Revisa el rendering en diferentes navegadores

**💡 Tips:** Usa la consola para verificar el estado

### ❓ Preguntas Frecuentes

#### 1. ¿Cuándo debo usar body?
**Respuesta:** Debes usar body cuando necesites se usa para envolver todo el contenido que debe mostrarse al usuario, permitiendo aplicar estilos globales y scripts que manipulen el contenido visible..

**Q (English):** When should I use body?
**A (English):** You should use body when you need to it wraps all content that should be displayed to users, allowing global styles and scripts that manipulate visible content..

#### 2. ¿Cómo implemento body correctamente?
**Respuesta:** Coloca todos los elementos de contenido dentro del <body> después del </head>; organiza el contenido usando estructura semántica con header, main, section, article, footer.

**Q (English):** How do I implement body correctly?
**A (English):** Place all content elements inside <body> after </head>; organize content using semantic structure with header, main, section, article, footer.

#### 3. ¿Es body compatible con todos los navegadores?
**Respuesta:** Sí, body es un estándar HTML y es compatible con todos los navegadores modernos.

**Q (English):** Is body compatible with all browsers?
**A (English):** Yes, body is an HTML standard and is compatible with all modern browsers.

### 🎓 Ejercicios

#### Ejercicio 1: Práctica: Usar body
**Dificultad:** ⭐⭐

**Implementa un ejemplo funcional usando body. Se usa para envolver todo el contenido que debe mostrarse al usuario, permitiendo aplicar estilos globales y scripts que manipulen el contenido visible.**

**Solución 1:**
```typescript
<body>
  <header>
    <nav>Navegación</nav>
  </header>
  <main>
    <section>
      <article>
        <h1>Título del artículo</h1>
        <p>Contenido...</p>
      </article>
    </section>
  </main>
  <footer>
    <p>&copy; 2025</p>
  </footer>
</body>
```

---

**Categoría:** frontend | **ID:** 23


## CI/CD

### 📝 Traducción
**entrega continua**

---

### 🎯 Definición

#### Español
En programación "CI/CD" se refiere a Práctica que automatiza tests, builds y despliegues en cada cambio..

#### English
Practice that automates tests, builds and deployments on every change.

---

### 💡 ¿Para qué sirve?

#### Español
Nos da feedback rápido sobre regresiones y acelera releases.

#### English
Delivers fast feedback on regressions and accelerates releases.

---

### 🛠️ ¿Cómo se usa?

#### Español
Define pipelines declarativos que compilen, prueben y desplieguen usando ambientes efímeros.

#### English
Create declarative pipelines that build, test and deploy using ephemeral environments.

### 💻 Ejemplos de Código

#### Go
```go
name: ci
# Definimos cuándo se ejecuta este workflow.
# En este caso, en cada "push" a la rama "main".
on:
  push:
    branches: [main]

jobs:
  test:
    # Especificamos el sistema operativo del runner.
    runs-on: ubuntu-latest
    steps:
      # Paso 1: Descargar el código del repositorio.
      - uses: actions/checkout@v4
      
      # Paso 2: Instalar Node.js versión 20.
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          
      # Paso 3: Instalar dependencias de forma limpia (CI).
      - run: npm ci
      
      # Paso 4: Ejecutar la suite de tests.
      - run: npm test
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Aplica "CI/CD" en los pipelines, CLI y despliegues para destrabar un caso real. | Apply "CI/CD" in pipelines, CLIs, and deployments to unblock a real scenario.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Conecta el concepto con un proyecto o métrica real. | Connect the concept with a real project or metric.

#### 2. 🎤 Entrevista
**Explica "CI/CD" como si estuvieras frente a un líder técnico. | Explain "CI/CD" as if you were in front of a tech lead.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Usa analogías claras y evita jerga innecesaria. | Use clear analogies and avoid unnecessary jargon.

#### 3. 🐛 Bug Fix
**Usa "CI/CD" para diagnosticar o prevenir bugs relacionados. | Use "CI/CD" to diagnose or prevent related bugs.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Resalta logs o métricas relevantes. | Highlight relevant logs or metrics.

### ❓ Preguntas Frecuentes

#### 1. ¿Cómo explicas CI/CD en una entrevista?
**Respuesta:** En programación "CI/CD" se refiere a Práctica que automatiza tests, builds y despliegues en cada cambio.. Define pipelines declarativos que compilen, prueben y desplieguen usando ambientes efímeros.

```
name: ci
# Definimos cuándo se ejecuta este workflow.
# En este caso, en cada "push" a la rama "main".
on:
  push:
    branches: [main]

jobs:
  test:
    # Especificamos el sistema operativo del runner.
    runs-on: ubuntu-latest
    steps:
      # Paso 1: Descargar el código del repositorio.
      - uses: actions/checkout@v4
      
      # Paso 2: Instalar Node.js versión 20.
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          
      # Paso 3: Instalar dependencias de forma limpia (CI).
      - run: npm ci
      
      # Paso 4: Ejecutar la suite de tests.
      - run: npm test
```

**Q (English):** How do you explain CI/CD during an interview?
**A (English):** Practice that automates tests, builds and deployments on every change. Create declarative pipelines that build, test and deploy using ephemeral environments.

#### 2. ¿Cómo reiniciar o resetear CI/CD?
**Respuesta:** Reinicia CI/CD a su valor inicial respetando el contexto del concepto.

```
// Reinicia CI/CD a su estado inicial
// Usa este patrón cuando necesites volver al estado base
```

**Q (English):** How to reset or reinitialize CI/CD?
**A (English):** Reset CI/CD to its initial value respecting the concept's context.

#### 3. ¿Cuáles son las buenas prácticas para usar CI/CD?
**Respuesta:** Aplica CI/CD de forma consistente, respeta su ciclo de vida y valida entradas.

```
// Buenas prácticas para CI/CD
// 1. Usa de forma consistente
// 2. Respeta dependencias y ciclo de vida
// 3. Valida inputs y maneja errores
```

**Q (English):** What are best practices for using CI/CD?
**A (English):** Apply CI/CD consistently, respect its lifecycle and validate inputs.

### 🎓 Ejercicios

#### Ejercicio 1: Ejercicio CI/CD
**Dificultad:** ⭐⭐

**Implementa "CI/CD" en un ejemplo práctico y explica cada paso.**

**Solución 1:**
```go
lint:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
    - run: npm ci
    - run: npm run lint
```

---

**Categoría:** devops | **ID:** 11


## CLAMP

### 📝 Traducción
**limitar valores con un rango lógico**

---

### 🎯 Definición

#### Español
En programación "clamp" se refiere a Función CSS que fija un mínimo, un valor ideal y un máximo sin medias queries..

#### English
CSS helper that sets a min, preferred and max value without media queries.

---

### 💡 ¿Para qué sirve?

#### Español
Resuelve diseños fluidos declarando un valor responsive sin cálculos manuales.

#### English
It gives you responsive sizing logic with a single expression.

---

### 🛠️ ¿Cómo se usa?

#### Español
Define clamp(min, preferido, max) en propiedades numéricas: font-size, width, gaps o padding.

#### English
Use clamp(min, preferred, max) on numeric properties like font-size, width, gaps or padding.

### 💻 Ejemplos de Código

#### CSS
```css
h1 {
  /* Usamos clamp() para crear tipografía responsive */
  /* Sintaxis: clamp(mínimo, valor preferido, máximo) */
  /* 2.5rem = tamaño mínimo en pantallas pequeñas */
  /* 4vw = crece con el ancho del viewport */
  /* 3.75rem = tamaño máximo en pantallas grandes */
  font-size: clamp(2.5rem, 4vw, 3.75rem);
  
  /* Altura de línea compacta para títulos */
  line-height: 1.1;
}
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Aplica "clamp" en la capa visual y de interacción para destrabar un caso real. | Apply "clamp" in the UI layer to unblock a real scenario.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Conecta el concepto con un proyecto o métrica real. | Connect the concept with a real project or metric.

#### 2. 🎤 Entrevista
**Explica "clamp" como si estuvieras frente a un líder técnico. | Explain "clamp" as if you were in front of a tech lead.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Usa analogías claras y evita jerga innecesaria. | Use clear analogies and avoid unnecessary jargon.

#### 3. 🐛 Bug Fix
**Usa "clamp" para diagnosticar o prevenir bugs relacionados. | Use "clamp" to diagnose or prevent related bugs.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Resalta logs o métricas relevantes. | Highlight relevant logs or metrics.

### ❓ Preguntas Frecuentes

#### 1. ¿Cómo explicas clamp en una entrevista?
**Respuesta:** En programación "clamp" se refiere a Función CSS que fija un mínimo, un valor ideal y un máximo sin medias queries.. Define clamp(min, preferido, max) en propiedades numéricas: font-size, width, gaps o padding.

```
h1 {
  /* Usamos clamp() para crear tipografía responsive */
  /* Sintaxis: clamp(mínimo, valor preferido, máximo) */
  /* 2.5rem = tamaño mínimo en pantallas pequeñas */
  /* 4vw = crece con el ancho del viewport */
  /* 3.75rem = tamaño máximo en pantallas grandes */
  font-size: clamp(2.5rem, 4vw, 3.75rem);
  
  /* Altura de línea compacta para títulos */
  line-height: 1.1;
}
```

**Q (English):** How do you explain clamp during an interview?
**A (English):** CSS helper that sets a min, preferred and max value without media queries. Use clamp(min, preferred, max) on numeric properties like font-size, width, gaps or padding.

#### 2. ¿Cómo reiniciar o resetear clamp?
**Respuesta:** Usa el valor 'initial', 'unset' o el valor por defecto de la propiedad para anular estilos heredados.

```
.element {
  clamp: initial;
}
```

**Q (English):** How to reset or reinitialize clamp?
**A (English):** Use 'initial', 'unset' or the default property value to override inherited styles.

#### 3. ¿Cuáles son las buenas prácticas para usar clamp?
**Respuesta:** Usa clases utilitarias o componentes, evita selectores anidados profundos y verifica el soporte en navegadores.

```
/* Buenas prácticas */
.component {
  /* Usa variables para consistencia */
  clamp: var(--clamp);
}
```

**Q (English):** What are best practices for using clamp?
**A (English):** Use utility classes or components, avoid deep nesting and check browser support.

### 🎓 Ejercicios

#### Ejercicio 1: Ejercicio clamp
**Dificultad:** ⭐⭐

**Implementa "clamp" en un ejemplo práctico y explica cada paso.**

**Solución 1:**
```css
.section {
  /* Padding crece con la pantalla */
  padding: clamp(1rem, 5vw, 4rem);
}
```

---

**Categoría:** frontend | **ID:** 15


## DEBOUNCE

### 📝 Traducción
**espera antes de ejecutar**

---

### 🎯 Definición

#### Español
En programación "debounce" se refiere a Patrón que retrasa la ejecución hasta que pasa un intervalo sin nuevos eventos..

#### English
Pattern that delays execution until no new events fire within a window.

---

### 💡 ¿Para qué sirve?

#### Español
Sirve para buscadores, auto guardados o listeners scroll.

#### English
Useful for search bars, autosave workflows or scroll listeners.

---

### 🛠️ ¿Cómo se usa?

#### Español
Envuelve la función costosa con debounce(fn, tiempo) y limpia el timer al desmontar.

#### English
Wrap the expensive logic with debounce(fn, wait) and clear the timer on unmount.

### 💻 Ejemplos de Código

#### TypeScript
```ts
// Creamos una versión "debounced" de nuestra función de búsqueda.
// useMemo asegura que no se recree la función en cada render.
const debouncedChange = useMemo(() => 
  debounce((value) => {
    // Esta lógica solo se ejecutará si pasan 250ms
    // sin que el usuario escriba nada nuevo.
    search(value);
  }, 250), 
[]); // El array vacío [] indica que solo se crea al montar el componente.
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Aplica "debounce" en la capa visual y de interacción para destrabar un caso real. | Apply "debounce" in the UI layer to unblock a real scenario.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Conecta el concepto con un proyecto o métrica real. | Connect the concept with a real project or metric.

#### 2. 🎤 Entrevista
**Explica "debounce" como si estuvieras frente a un líder técnico. | Explain "debounce" as if you were in front of a tech lead.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Usa analogías claras y evita jerga innecesaria. | Use clear analogies and avoid unnecessary jargon.

#### 3. 🐛 Bug Fix
**Usa "debounce" para diagnosticar o prevenir bugs relacionados. | Use "debounce" to diagnose or prevent related bugs.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Resalta logs o métricas relevantes. | Highlight relevant logs or metrics.

### ❓ Preguntas Frecuentes

#### 1. ¿Cómo explicas debounce en una entrevista?
**Respuesta:** En programación "debounce" se refiere a Patrón que retrasa la ejecución hasta que pasa un intervalo sin nuevos eventos.. Envuelve la función costosa con debounce(fn, tiempo) y limpia el timer al desmontar.

```
// Creamos una versión "debounced" de nuestra función de búsqueda.
// useMemo asegura que no se recree la función en cada render.
const debouncedChange = useMemo(() => 
  debounce((value) => {
    // Esta lógica solo se ejecutará si pasan 250ms
    // sin que el usuario escriba nada nuevo.
    search(value);
  }, 250), 
[]); // El array vacío [] indica que solo se crea al montar el componente.
```

**Q (English):** How do you explain debounce during an interview?
**A (English):** Pattern that delays execution until no new events fire within a window. Wrap the expensive logic with debounce(fn, wait) and clear the timer on unmount.

#### 2. ¿Cómo reiniciar o resetear debounce?
**Respuesta:** Usa el valor 'initial', 'unset' o el valor por defecto de la propiedad para anular estilos heredados.

```
.element {
  debounce: initial;
}
```

**Q (English):** How to reset or reinitialize debounce?
**A (English):** Use 'initial', 'unset' or the default property value to override inherited styles.

#### 3. ¿Cuáles son las buenas prácticas para usar debounce?
**Respuesta:** Usa clases utilitarias o componentes, evita selectores anidados profundos y verifica el soporte en navegadores.

```
/* Buenas prácticas */
.component {
  /* Usa variables para consistencia */
  debounce: var(--debounce);
}
```

**Q (English):** What are best practices for using debounce?
**A (English):** Use utility classes or components, avoid deep nesting and check browser support.

### 🎓 Ejercicios

#### Ejercicio 1: Ejercicio debounce
**Dificultad:** ⭐⭐

**Implementa "debounce" en un ejemplo práctico y explica cada paso.**

**Solución 1:**
```ts
const save = debounce((data) => {
  api.save(data);
  console.log('Guardado!');
}, 1000);

function Editor({ data }) {
  return (
    <textarea 
      onChange={(e) => save(e.target.value)}
      defaultValue={data}
    />
  );
}
```

---

**Categoría:** frontend | **ID:** 7


## DOCKER

### 📝 Traducción
**contenedores reproducibles**

---

### 🎯 Definición

#### Español
En programación "Docker" se refiere a Plataforma para empacar aplicaciones y dependencias en contenedores aislados..

#### English
Platform to package apps and dependencies into isolated containers.

---

### 💡 ¿Para qué sirve?

#### Español
Facilita ambientes consistentes y despliegues predecibles.

#### English
Gives consistent environments and predictable deployments.

---

### 🛠️ ¿Cómo se usa?

#### Español
Escribe un Dockerfile, construye la imagen y orquesta servicios con compose o Kubernetes.

#### English
Craft a Dockerfile, build the image and orchestrate services via Compose or Kubernetes.

### 💻 Ejemplos de Código

#### Go
```go
# Usamos una imagen base ligera de Node.js (Alpine Linux).
FROM node:20-alpine

# Establecemos el directorio de trabajo dentro del contenedor.
WORKDIR /app

# Copiamos primero los archivos de dependencias.
# Esto aprovecha la caché de capas de Docker si no han cambiado.
COPY package*.json ./

# Instalamos solo las dependencias de producción.
RUN npm ci --only=production

# Copiamos el resto del código fuente de la aplicación.
COPY . .

# Definimos el comando por defecto para iniciar el servidor.
CMD ["node", "dist/server.js"]
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Aplica "Docker" en los pipelines, CLI y despliegues para destrabar un caso real. | Apply "Docker" in pipelines, CLIs, and deployments to unblock a real scenario.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Conecta el concepto con un proyecto o métrica real. | Connect the concept with a real project or metric.

#### 2. 🎤 Entrevista
**Explica "Docker" como si estuvieras frente a un líder técnico. | Explain "Docker" as if you were in front of a tech lead.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Usa analogías claras y evita jerga innecesaria. | Use clear analogies and avoid unnecessary jargon.

#### 3. 🐛 Bug Fix
**Usa "Docker" para diagnosticar o prevenir bugs relacionados. | Use "Docker" to diagnose or prevent related bugs.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Resalta logs o métricas relevantes. | Highlight relevant logs or metrics.

### ❓ Preguntas Frecuentes

#### 1. ¿Cómo explicas Docker en una entrevista?
**Respuesta:** En programación "Docker" se refiere a Plataforma para empacar aplicaciones y dependencias en contenedores aislados.. Escribe un Dockerfile, construye la imagen y orquesta servicios con compose o Kubernetes.

```
# Usamos una imagen base ligera de Node.js (Alpine Linux).
FROM node:20-alpine

# Establecemos el directorio de trabajo dentro del contenedor.
WORKDIR /app

# Copiamos primero los archivos de dependencias.
# Esto aprovecha la caché de capas de Docker si no han cambiado.
COPY package*.json ./

# Instalamos solo las dependencias de producción.
RUN npm ci --only=production

# Copiamos el resto del código fuente de la aplicación.
COPY . .

# Definimos el comando por defecto para iniciar el servidor.
CMD ["node", "dist/server.js"]
```

**Q (English):** How do you explain Docker during an interview?
**A (English):** Platform to package apps and dependencies into isolated containers. Craft a Dockerfile, build the image and orchestrate services via Compose or Kubernetes.

#### 2. ¿Cómo reiniciar o resetear Docker?
**Respuesta:** Reinicia Docker a su valor inicial respetando el contexto del concepto.

```
// Reinicia Docker a su estado inicial
// Usa este patrón cuando necesites volver al estado base
```

**Q (English):** How to reset or reinitialize Docker?
**A (English):** Reset Docker to its initial value respecting the concept's context.

#### 3. ¿Cuáles son las buenas prácticas para usar Docker?
**Respuesta:** Aplica Docker de forma consistente, respeta su ciclo de vida y valida entradas.

```
// Buenas prácticas para Docker
// 1. Usa de forma consistente
// 2. Respeta dependencias y ciclo de vida
// 3. Valida inputs y maneja errores
```

**Q (English):** What are best practices for using Docker?
**A (English):** Apply Docker consistently, respect its lifecycle and validate inputs.

### 🎓 Ejercicios

#### Ejercicio 1: Ejercicio Docker
**Dificultad:** ⭐⭐

**Implementa "Docker" en un ejemplo práctico y explica cada paso.**

**Solución 1:**
```go
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "./app.py"]
```

---

**Categoría:** devops | **ID:** 9


## FETCH

### 📝 Traducción
**traer datos del servidor**

---

### 🎯 Definición

#### Español
En programación "fetch" se refiere a API nativa del navegador para hacer solicitudes HTTP asincrónicas basadas en promesas..

#### English
Native browser API for asynchronous HTTP requests that returns promises.

---

### 💡 ¿Para qué sirve?

#### Español
Consumir APIs REST o GraphQL y enviar/recibir JSON sin dependencias externas.

#### English
Consume REST/GraphQL APIs and send/receive JSON without extra dependencies.

---

### 🛠️ ¿Cómo se usa?

#### Español
Usa fetch(url, { method, headers, body, signal }) con AbortController para timeouts, valida res.ok y maneja cuerpos vacíos o no-JSON.

#### English
Use fetch(url, { method, headers, body, signal }) with AbortController for timeouts, check res.ok, and handle empty or non-JSON bodies.

### 💻 Ejemplos de Código

#### TypeScript
```ts
async function loadPosts() {
  const res = await fetch("/api/posts", { cache: "no-store" });

  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

  return res.json();
}
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Aplica "fetch" en la capa visual y de interacción para destrabar un caso real. | Apply "fetch" in the UI layer to unblock a real scenario.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Conecta el concepto con un proyecto o métrica real. | Connect the concept with a real project or metric.

#### 2. 🎤 Entrevista
**Explica "fetch" como si estuvieras frente a un líder técnico. | Explain "fetch" as if you were in front of a tech lead.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Usa analogías claras y evita jerga innecesaria. | Use clear analogies and avoid unnecessary jargon.

#### 3. 🐛 Bug Fix
**Usa "fetch" para diagnosticar o prevenir bugs relacionados. | Use "fetch" to diagnose or prevent related bugs.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Resalta logs o métricas relevantes. | Highlight relevant logs or metrics.

### ❓ Preguntas Frecuentes

#### 1. ¿Cómo explicas fetch en una entrevista?
**Respuesta:** En programación "fetch" se refiere a API nativa del navegador para hacer solicitudes HTTP asincrónicas basadas en promesas.. Usa fetch(url, { method, headers, body, signal }) con AbortController para timeouts, valida res.ok y maneja cuerpos vacíos o no-JSON.

```
async function loadPosts() {
  const res = await fetch("/api/posts", { cache: "no-store" });

  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

  return res.json();
}
```

**Q (English):** How do you explain fetch during an interview?
**A (English):** Native browser API for asynchronous HTTP requests that returns promises. Use fetch(url, { method, headers, body, signal }) with AbortController for timeouts, check res.ok, and handle empty or non-JSON bodies.

#### 2. ¿Cómo reiniciar o resetear fetch?
**Respuesta:** Usa el valor 'initial', 'unset' o el valor por defecto de la propiedad para anular estilos heredados.

```
.element {
  fetch: initial;
}
```

**Q (English):** How to reset or reinitialize fetch?
**A (English):** Use 'initial', 'unset' or the default property value to override inherited styles.

#### 3. ¿Cuáles son las buenas prácticas para usar fetch?
**Respuesta:** Usa clases utilitarias o componentes, evita selectores anidados profundos y verifica el soporte en navegadores.

```
/* Buenas prácticas */
.component {
  /* Usa variables para consistencia */
  fetch: var(--fetch);
}
```

**Q (English):** What are best practices for using fetch?
**A (English):** Use utility classes or components, avoid deep nesting and check browser support.

### 🎓 Ejercicios

#### Ejercicio 1: Ejercicio fetch
**Dificultad:** ⭐⭐

**Implementa "fetch" en un ejemplo práctico y explica cada paso.**

**Solución 1:**
```ts
async function postJson(url, payload, retries = 1) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(`HTTP ${res.status}: ${message || res.statusText}`);
      }

      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      lastError = error;
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }

  throw lastError;
}
```

---

**Categoría:** frontend | **ID:** 1


## FLEX-COL

### 📝 Traducción
**columna en flex (Tailwind)**

---

### 🎯 Definición

#### Español
En programación "flex-col" se refiere a Clase de Tailwind CSS que establece la dirección de los hijos en columna dentro de un contenedor flex..

#### English
Tailwind utility to set flex direction to column inside a flex container.

---

### 💡 ¿Para qué sirve?

#### Español
Simplifica layouts en columna sin escribir CSS personalizado.

#### English
Simplifies column layouts without custom CSS.

---

### 🛠️ ¿Cómo se usa?

#### Español
Aplica flex y flex-col en el contenedor; ajusta gap y alineación con justify/align utilities.

#### English
Apply flex and flex-col on the container; adjust gap and alignment with justify/align utilities.

### 💻 Ejemplos de Código

#### TypeScript
```ts
<div class="flex flex-col gap-3 p-4 border rounded-lg">
  <h3 class="text-lg font-semibold">Título</h3>
  <p class="text-sm text-slate-500">Descripción breve del item.</p>
  <button class="self-end bg-emerald-500 text-white px-3 py-2 rounded">Acción</button>
</div>
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Aplica "flex-col" en la capa visual y de interacción para destrabar un caso real. | Apply "flex-col" in the UI layer to unblock a real scenario.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Conecta el concepto con un proyecto o métrica real. | Connect the concept with a real project or metric.

#### 2. 🎤 Entrevista
**Explica "flex-col" como si estuvieras frente a un líder técnico. | Explain "flex-col" as if you were in front of a tech lead.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Usa analogías claras y evita jerga innecesaria. | Use clear analogies and avoid unnecessary jargon.

#### 3. 🐛 Bug Fix
**Usa "flex-col" para diagnosticar o prevenir bugs relacionados. | Use "flex-col" to diagnose or prevent related bugs.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Resalta logs o métricas relevantes. | Highlight relevant logs or metrics.

### ❓ Preguntas Frecuentes

#### 1. ¿Cómo explicas flex-col en una entrevista?
**Respuesta:** En programación "flex-col" se refiere a Clase de Tailwind CSS que establece la dirección de los hijos en columna dentro de un contenedor flex.. Aplica flex y flex-col en el contenedor; ajusta gap y alineación con justify/align utilities.

```
<div class="flex flex-col gap-3 p-4 border rounded-lg">
  <h3 class="text-lg font-semibold">Título</h3>
  <p class="text-sm text-slate-500">Descripción breve del item.</p>
  <button class="self-end bg-emerald-500 text-white px-3 py-2 rounded">Acción</button>
</div>
```

**Q (English):** How do you explain flex-col during an interview?
**A (English):** Tailwind utility to set flex direction to column inside a flex container. Apply flex and flex-col on the container; adjust gap and alignment with justify/align utilities.

#### 2. ¿Cómo reiniciar o resetear flex-col?
**Respuesta:** Usa el valor 'initial', 'unset' o el valor por defecto de la propiedad para anular estilos heredados.

```
.element {
  flex-col: initial;
}
```

**Q (English):** How to reset or reinitialize flex-col?
**A (English):** Use 'initial', 'unset' or the default property value to override inherited styles.

#### 3. ¿Cuáles son las buenas prácticas para usar flex-col?
**Respuesta:** Usa clases utilitarias o componentes, evita selectores anidados profundos y verifica el soporte en navegadores.

```
/* Buenas prácticas */
.component {
  /* Usa variables para consistencia */
  flex-col: var(--flex-col);
}
```

**Q (English):** What are best practices for using flex-col?
**A (English):** Use utility classes or components, avoid deep nesting and check browser support.

### 🎓 Ejercicios

#### Ejercicio 1: Ejercicio flex-col
**Dificultad:** ⭐⭐

**Implementa "flex-col" en un ejemplo práctico y explica cada paso.**

**Solución 1:**
```ts
<div class="flex h-screen">
  <aside class="w-64 bg-gray-800 text-white flex flex-col p-4">
    <nav class="flex-1 flex flex-col gap-2">
      <a href="#" class="p-2 hover:bg-gray-700 rounded">Home</a>
      <a href="#" class="p-2 hover:bg-gray-700 rounded">Settings</a>
    </nav>
    <div class="mt-auto">
      User Profile
    </div>
  </aside>
  <main class="flex-1 p-8">
    Content
  </main>
</div>
```

---

**Categoría:** frontend | **ID:** 4


## GRAPHQL

### 📝 Traducción
**consultas declarativas**

---

### 🎯 Definición

#### Español
En programación "GraphQL" se refiere a Especificación para exponer APIs donde el cliente define la forma exacta de los datos..

#### English
Specification that lets clients ask precisely for the data shape they need.

---

### 💡 ¿Para qué sirve?

#### Español
Resuelve overfetching/subfetching al dejar que el frontend describa los campos.

#### English
Solves overfetching/underfetching by letting frontend describe fields.

---

### 🛠️ ¿Cómo se usa?

#### Español
Define un schema, implementa resolvers y usa herramientas como Apollo o Yoga para exponer el endpoint.

#### English
Write the schema, map resolvers and expose it using Apollo, Mercurius or Yoga.

### 💻 Ejemplos de Código

#### JavaScript
```js
const resolvers = {
  Query: {
    // Resolver para la query "term".
    // Recibe: parent, argumentos (args), y contexto (ctx).
    term: (_parent, args, ctx) => {
      // Usamos Prisma desde el contexto para buscar en la DB.
      // Buscamos un término único por su "slug".
      return ctx.prisma.term.findUnique({ 
        where: { slug: args.slug } 
      });
    },
  },
};
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Aplica "GraphQL" en las APIs, servicios y lógica de negocio para destrabar un caso real. | Apply "GraphQL" in APIs, services, and business logic to unblock a real scenario.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Conecta el concepto con un proyecto o métrica real. | Connect the concept with a real project or metric.

#### 2. 🎤 Entrevista
**Explica "GraphQL" como si estuvieras frente a un líder técnico. | Explain "GraphQL" as if you were in front of a tech lead.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Usa analogías claras y evita jerga innecesaria. | Use clear analogies and avoid unnecessary jargon.

#### 3. 🐛 Bug Fix
**Usa "GraphQL" para diagnosticar o prevenir bugs relacionados. | Use "GraphQL" to diagnose or prevent related bugs.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Resalta logs o métricas relevantes. | Highlight relevant logs or metrics.

### ❓ Preguntas Frecuentes

#### 1. ¿Cómo explicas GraphQL en una entrevista?
**Respuesta:** En programación "GraphQL" se refiere a Especificación para exponer APIs donde el cliente define la forma exacta de los datos.. Define un schema, implementa resolvers y usa herramientas como Apollo o Yoga para exponer el endpoint.

```
const resolvers = {
  Query: {
    // Resolver para la query "term".
    // Recibe: parent, argumentos (args), y contexto (ctx).
    term: (_parent, args, ctx) => {
      // Usamos Prisma desde el contexto para buscar en la DB.
      // Buscamos un término único por su "slug".
      return ctx.prisma.term.findUnique({ 
        where: { slug: args.slug } 
      });
    },
  },
};
```

**Q (English):** How do you explain GraphQL during an interview?
**A (English):** Specification that lets clients ask precisely for the data shape they need. Write the schema, map resolvers and expose it using Apollo, Mercurius or Yoga.

#### 2. ¿Cómo reiniciar o resetear GraphQL?
**Respuesta:** Reinicia GraphQL a su valor inicial respetando el contexto del concepto.

```
// Reinicia GraphQL a su estado inicial
// Usa este patrón cuando necesites volver al estado base
```

**Q (English):** How to reset or reinitialize GraphQL?
**A (English):** Reset GraphQL to its initial value respecting the concept's context.

#### 3. ¿Cuáles son las buenas prácticas para usar GraphQL?
**Respuesta:** Aplica GraphQL de forma consistente, respeta su ciclo de vida y valida entradas.

```
// Buenas prácticas para GraphQL
// 1. Usa de forma consistente
// 2. Respeta dependencias y ciclo de vida
// 3. Valida inputs y maneja errores
```

**Q (English):** What are best practices for using GraphQL?
**A (English):** Apply GraphQL consistently, respect its lifecycle and validate inputs.

### 🎓 Ejercicios

#### Ejercicio 1: Ejercicio GraphQL
**Dificultad:** ⭐⭐

**Implementa "GraphQL" en un ejemplo práctico y explica cada paso.**

**Solución 1:**
```js
mutation CreateUser($name: String!, $email: String!) {
  createUser(name: $name, email: $email) {
    id
    name
    email
  }
}
```

---

**Categoría:** backend | **ID:** 10


## GRID-TEMPLATE-COLUMNS

### 📝 Traducción
**patrón de columnas para layouts**

---

### 🎯 Definición

#### Español
En programación "grid-template-columns" se refiere a Declara cómo se distribuyen las columnas de un grid con fracciones, minmax o repeat..

#### English
Defines the column track list in CSS Grid using fractions, minmax or repeat helpers.

---

### 💡 ¿Para qué sirve?

#### Español
Permite describir estructuras complejas con pocas líneas y mantiene el grid estable.

#### English
Lets you describe complex grids declaratively while keeping layouts stable.

---

### 🛠️ ¿Cómo se usa?

#### Español
Combina repeat y minmax para columnas fluidas o nombra líneas con '[]' si necesitas colocar elementos por nombre.

#### English
Mix repeat with minmax for fluid columns or name grid lines with brackets to place elements explicitly.

### 💻 Ejemplos de Código

#### CSS
```css
.dashboard {
  /* Activamos CSS Grid en el contenedor */
  display: grid;
  
  /* Creamos columnas que se adaptan automáticamente */
  /* repeat(auto-fit, ...) = crea tantas columnas como quepan */
  /* minmax(240px, 1fr) = cada columna mínimo 240px, máximo 1 fracción del espacio */
  /* Resultado: las tarjetas se reorganizan automáticamente según el espacio */
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  
  /* Espacio entre las tarjetas del grid */
  gap: 1.5rem;
}
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Aplica "grid-template-columns" en la capa visual y de interacción para destrabar un caso real. | Apply "grid-template-columns" in the UI layer to unblock a real scenario.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Conecta el concepto con un proyecto o métrica real. | Connect the concept with a real project or metric.

#### 2. 🎤 Entrevista
**Explica "grid-template-columns" como si estuvieras frente a un líder técnico. | Explain "grid-template-columns" as if you were in front of a tech lead.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Usa analogías claras y evita jerga innecesaria. | Use clear analogies and avoid unnecessary jargon.

#### 3. 🐛 Bug Fix
**Usa "grid-template-columns" para diagnosticar o prevenir bugs relacionados. | Use "grid-template-columns" to diagnose or prevent related bugs.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Resalta logs o métricas relevantes. | Highlight relevant logs or metrics.

### ❓ Preguntas Frecuentes

#### 1. ¿Cuáles son las buenas prácticas para usar grid-template-columns?
**Respuesta:** Usa clases utilitarias o componentes, evita selectores anidados profundos y verifica el soporte en navegadores.

```
/* Buenas prácticas */
.component {
  /* Usa variables para consistencia */
  grid-template-columns: var(--grid-template-columns);
}
```

**Q (English):** What are best practices for using grid-template-columns?
**A (English):** Use utility classes or components, avoid deep nesting and check browser support.

#### 2. ¿Cómo explicas grid-template-columns en una entrevista?
**Respuesta:** En programación "grid-template-columns" se refiere a Declara cómo se distribuyen las columnas de un grid con fracciones, minmax o repeat.. Combina repeat y minmax para columnas fluidas o nombra líneas con '[]' si necesitas colocar elementos por nombre.

```
.dashboard {
  /* Activamos CSS Grid en el contenedor */
  display: grid;
  
  /* Creamos columnas que se adaptan automáticamente */
  /* repeat(auto-fit, ...) = crea tantas columnas como quepan */
  /* minmax(240px, 1fr) = cada columna mínimo 240px, máximo 1 fracción del espacio */
  /* Resultado: las tarjetas se reorganizan automáticamente según el espacio */
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  
  /* Espacio entre las tarjetas del grid */
  gap: 1.5rem;
}
```

**Q (English):** How do you explain grid-template-columns during an interview?
**A (English):** Defines the column track list in CSS Grid using fractions, minmax or repeat helpers. Mix repeat with minmax for fluid columns or name grid lines with brackets to place elements explicitly.

#### 3. ¿Cómo reiniciar o resetear grid-template-columns?
**Respuesta:** Usa el valor 'initial', 'unset' o el valor por defecto de la propiedad para anular estilos heredados.

```
.element {
  grid-template-columns: initial;
}
```

**Q (English):** How to reset or reinitialize grid-template-columns?
**A (English):** Use 'initial', 'unset' or the default property value to override inherited styles.

### 🎓 Ejercicios

#### Ejercicio 1: Ejercicio grid-template-columns
**Dificultad:** ⭐⭐

**Implementa "grid-template-columns" en un ejemplo práctico y explica cada paso.**

**Solución 1:**
```css
.container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
}

.col-4 { grid-column: span 4; }
.col-8 { grid-column: span 8; }
```

---

**Categoría:** frontend | **ID:** 16


## HEAD

### 📝 Traducción
**sección de metadatos del documento**

---

### 🎯 Definición

#### Español
En programación "head" se refiere al elemento HTML que contiene metadatos del documento: título, vinculaciones a hojas de estilo, scripts, y otros datos que describen el documento pero no se muestran directamente en la página.

#### English
The HTML element that contains document metadata: title, style sheets, scripts, and other data that describes the document but is not directly displayed on the page.

---

### 💡 ¿Para qué sirve?

#### Español
Se usa para almacenar información del documento como título de página, codificación de caracteres, descripción, palabras clave y referencias a CSS, fuentes y scripts.

#### English
It stores document information like page title, character encoding, description, keywords and references to CSS, fonts and scripts.

---

### 🛠️ ¿Cómo se usa?

#### Español
Coloca todas las etiquetas meta, link, style y script dentro del elemento <head>, antes del <body>; siempre incluye <meta charset> y <title>.

#### English
Place all meta, link, style and script tags inside the <head> element, before <body>; always include <meta charset> and <title>.

### 💻 Ejemplos de Código

#### HTML
```html
<head>
  <!-- Configuración de caracteres -->
  <meta charset="UTF-8">
  
  <!-- Viewport para responsive -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Título de la página (aparece en la pestaña) -->
  <title>Mi Aplicación</title>
  
  <!-- Hojas de estilos -->
  <link rel="stylesheet" href="styles.css">
  
  <!-- Estilos inline -->
  <style>
    body { font-family: Arial, sans-serif; }
  </style>
  
  <!-- Scripts que cargan primero -->
  <script src="config.js"></script>
</head>
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Usar head en un proyecto real**

**Pasos:**
1. Identificar dónde necesitas head
2. Implementar correctamente según especificaciones
3. Probar en navegadores compatibles

**💡 Tips:** Asegúrate de seguir las mejores prácticas de accesibilidad

#### 2. 🎤 Entrevista
**Explicar head en una entrevista**

**Pasos:**
1. Explicar qué es head
2. Dar ejemplos prácticos de uso
3. Mencionar por qué es importante

**💡 Tips:** Sé claro y conciso, evita tecnicismos innecesarios

#### 3. 🐛 Bug Fix
**Debuggear problemas con head**

**Pasos:**
1. Inspecciona el elemento en DevTools
2. Verifica que el contenido esté correcto
3. Revisa el rendering en diferentes navegadores

**💡 Tips:** Usa la consola para verificar el estado

### ❓ Preguntas Frecuentes

#### 1. ¿Cuándo debo usar head?
**Respuesta:** Debes usar head cuando necesites se usa para almacenar información del documento como título de página, codificación de caracteres, descripción, palabras clave y referencias a css, fuentes y scripts..

**Q (English):** When should I use head?
**A (English):** You should use head when you need to it stores document information like page title, character encoding, description, keywords and references to css, fonts and scripts..

#### 2. ¿Cómo implemento head correctamente?
**Respuesta:** Coloca todas las etiquetas meta, link, style y script dentro del elemento <head>, antes del <body>; siempre incluye <meta charset> y <title>.

**Q (English):** How do I implement head correctly?
**A (English):** Place all meta, link, style and script tags inside the <head> element, before <body>; always include <meta charset> and <title>.

#### 3. ¿Es head compatible con todos los navegadores?
**Respuesta:** Sí, head es un estándar HTML y es compatible con todos los navegadores modernos.

**Q (English):** Is head compatible with all browsers?
**A (English):** Yes, head is an HTML standard and is compatible with all modern browsers.

### 🎓 Ejercicios

#### Ejercicio 1: Práctica: Usar head
**Dificultad:** ⭐⭐

**Implementa un ejemplo funcional usando head. Se usa para almacenar información del documento como título de página, codificación de caracteres, descripción, palabras clave y referencias a CSS, fuentes y scripts.**

**Solución 1:**
```typescript
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Descripción de la página">
  <title>Mi Sitio Web</title>
  <link rel="stylesheet" href="styles.css">
  <script src="app.js" defer></script>
</head>
```

---

**Categoría:** frontend | **ID:** 22


## HTML

### 📝 Traducción
**lenguaje de marcado para estructura web**

---

### 🎯 Definición

#### Español
En programación "html" se refiere a HyperText Markup Language: lenguaje de marcado usado para crear la estructura y contenido semántico de páginas web mediante etiquetas que definen elementos como párrafos, encabezados, listas e imágenes.

#### English
HyperText Markup Language: a markup language used to structure and semantically define web page content using tags that define elements like paragraphs, headings, lists, and images.

---

### 💡 ¿Para qué sirve?

#### Español
Se usa para definir la estructura semántica de documentos web, organizando contenido en elementos reutilizables que facilitan la accesibilidad, el SEO y la mantenibilidad del código.

#### English
It defines the semantic structure of web documents, organizing content into reusable elements that improve accessibility, SEO, and code maintainability.

---

### 🛠️ ¿Cómo se usa?

#### Español
Declara elementos HTML anidando etiquetas de apertura y cierre; usa atributos para añadir propiedades y siempre incluye doctype, html, head y body como estructura base.

#### English
Declare HTML elements by nesting opening and closing tags; use attributes to add properties and always include doctype, html, head and body as the base structure.

### 💻 Ejemplos de Código

#### HTML
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

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Usar html en un proyecto real**

**Pasos:**
1. Identificar dónde necesitas html
2. Implementar correctamente según especificaciones
3. Probar en navegadores compatibles

**💡 Tips:** Asegúrate de seguir las mejores prácticas de accesibilidad

#### 2. 🎤 Entrevista
**Explicar html en una entrevista**

**Pasos:**
1. Explicar qué es html
2. Dar ejemplos prácticos de uso
3. Mencionar por qué es importante

**💡 Tips:** Sé claro y conciso, evita tecnicismos innecesarios

#### 3. 🐛 Bug Fix
**Debuggear problemas con html**

**Pasos:**
1. Inspecciona el elemento en DevTools
2. Verifica que el contenido esté correcto
3. Revisa el rendering en diferentes navegadores

**💡 Tips:** Usa la consola para verificar el estado

### ❓ Preguntas Frecuentes

#### 1. ¿Cuándo debo usar html?
**Respuesta:** Debes usar html cuando necesites se usa para definir la estructura semántica de documentos web, organizando contenido en elementos reutilizables que facilitan la accesibilidad, el seo y la mantenibilidad del código..

**Q (English):** When should I use html?
**A (English):** You should use html when you need to it defines the semantic structure of web documents, organizing content into reusable elements that improve accessibility, seo, and code maintainability..

#### 2. ¿Cómo implemento html correctamente?
**Respuesta:** Declara elementos HTML anidando etiquetas de apertura y cierre; usa atributos para añadir propiedades y siempre incluye doctype, html, head y body como estructura base.

**Q (English):** How do I implement html correctly?
**A (English):** Declare HTML elements by nesting opening and closing tags; use attributes to add properties and always include doctype, html, head and body as the base structure.

#### 3. ¿Es html compatible con todos los navegadores?
**Respuesta:** Sí, html es un estándar HTML y es compatible con todos los navegadores modernos.

**Q (English):** Is html compatible with all browsers?
**A (English):** Yes, html is an HTML standard and is compatible with all modern browsers.

### 🎓 Ejercicios

#### Ejercicio 1: Práctica: Usar html
**Dificultad:** ⭐⭐

**Implementa un ejemplo funcional usando html. Se usa para definir la estructura semántica de documentos web, organizando contenido en elementos reutilizables que facilitan la accesibilidad, el SEO y la mantenibilidad del código.**

**Solución 1:**
```typescript
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mi Página</title>
</head>
<body>
  <h1>Bienvenido</h1>
  <p>Este es mi primer sitio web.</p>
</body>
</html>
```

---

**Categoría:** frontend | **ID:** 21


## JWT

### 📝 Traducción
**token firmado**

---

### 🎯 Definición

#### Español
En programación "JWT" se refiere a JSON Web Token firmado que transporta claims entre cliente y servidor..

#### English
Signed JSON Web Token that carries claims between client and server.

---

### 💡 ¿Para qué sirve?

#### Español
Resuelve autenticación stateless y delega la verificación al backend.

#### English
Enables stateless authentication where the backend validates signatures.

---

### 🛠️ ¿Cómo se usa?

#### Español
Firma con una clave segura, ajusta expiración corta y valida con middleware en cada request.

#### English
Sign tokens with a strong secret, set short TTLs and validate them in middleware per request.

### 💻 Ejemplos de Código

#### JavaScript
```js
// Firmamos un nuevo token JWT.
// El primer argumento es el payload (datos del usuario).
const token = jwt.sign(
  { sub: user.id, role: user.role }, 
  
  // El segundo argumento es la clave secreta para firmar.
  // Usamos una variable de entorno por seguridad.
  process.env.JWT_SECRET!, 
  
  // Configuramos opciones como la expiración (1 hora).
  { expiresIn: "1h" }
);
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Aplica "JWT" en las APIs, servicios y lógica de negocio para destrabar un caso real. | Apply "JWT" in APIs, services, and business logic to unblock a real scenario.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Conecta el concepto con un proyecto o métrica real. | Connect the concept with a real project or metric.

#### 2. 🎤 Entrevista
**Explica "JWT" como si estuvieras frente a un líder técnico. | Explain "JWT" as if you were in front of a tech lead.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Usa analogías claras y evita jerga innecesaria. | Use clear analogies and avoid unnecessary jargon.

#### 3. 🐛 Bug Fix
**Usa "JWT" para diagnosticar o prevenir bugs relacionados. | Use "JWT" to diagnose or prevent related bugs.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Resalta logs o métricas relevantes. | Highlight relevant logs or metrics.

### ❓ Preguntas Frecuentes

#### 1. ¿Cómo explicas JWT en una entrevista?
**Respuesta:** En programación "JWT" se refiere a JSON Web Token firmado que transporta claims entre cliente y servidor.. Firma con una clave segura, ajusta expiración corta y valida con middleware en cada request.

```
// Firmamos un nuevo token JWT.
// El primer argumento es el payload (datos del usuario).
const token = jwt.sign(
  { sub: user.id, role: user.role }, 
  
  // El segundo argumento es la clave secreta para firmar.
  // Usamos una variable de entorno por seguridad.
  process.env.JWT_SECRET!, 
  
  // Configuramos opciones como la expiración (1 hora).
  { expiresIn: "1h" }
);
```

**Q (English):** How do you explain JWT during an interview?
**A (English):** Signed JSON Web Token that carries claims between client and server. Sign tokens with a strong secret, set short TTLs and validate them in middleware per request.

#### 2. ¿Cómo reiniciar o resetear JWT?
**Respuesta:** Reinicia JWT a su valor inicial respetando el contexto del concepto.

```
// Reinicia JWT a su estado inicial
// Usa este patrón cuando necesites volver al estado base
```

**Q (English):** How to reset or reinitialize JWT?
**A (English):** Reset JWT to its initial value respecting the concept's context.

#### 3. ¿Cuáles son las buenas prácticas para usar JWT?
**Respuesta:** Aplica JWT de forma consistente, respeta su ciclo de vida y valida entradas.

```
// Buenas prácticas para JWT
// 1. Usa de forma consistente
// 2. Respeta dependencias y ciclo de vida
// 3. Valida inputs y maneja errores
```

**Q (English):** What are best practices for using JWT?
**A (English):** Apply JWT consistently, respect its lifecycle and validate inputs.

### 🎓 Ejercicios

#### Ejercicio 1: Ejercicio JWT
**Dificultad:** ⭐⭐

**Implementa "JWT" en un ejemplo práctico y explica cada paso.**

**Solución 1:**
```js
function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}
```

---

**Categoría:** backend | **ID:** 8


## LINK

### 📝 Traducción
**vinculación de recursos externos**

---

### 🎯 Definición

#### Español
En programación "link" se refiere al elemento HTML que vincula recursos externos como hojas de estilo CSS, fuentes web, iconos y otros archivos que enriquecen la presentación del documento.

#### English
The HTML element that links external resources such as CSS stylesheets, web fonts, icons and other files that enhance document presentation.

---

### 💡 ¿Para qué sirve?

#### Español
Se usa para cargar estilos CSS, fuentes tipográficas, favicons e información de preload para optimizar rendimiento sin mostrar contenido en la página.

#### English
It loads CSS styles, web fonts, favicons and preload information to optimize performance without displaying content on the page.

---

### 🛠️ ¿Cómo se usa?

#### Español
Usa <link rel="" href=""> en el <head> con rel indicando el tipo de relación (stylesheet, icon, preconnect) y href apuntando al recurso.

#### English
Use <link rel="" href=""> in <head> with rel indicating relationship type (stylesheet, icon, preconnect) and href pointing to resource.

### 💻 Ejemplos de Código

#### HTML
```html
<head>
  <!-- Importar hoja de estilos externa -->
  <link rel="stylesheet" href="styles.css">
  
  <!-- Favicon (icono de la pestaña) -->
  <link rel="icon" href="favicon.ico">
  
  <!-- Precargar recursos críticos -->
  <link rel="preload" href="fonts/main.woff2" as="font" crossorigin>
  
  <!-- Prefetch para recursos que posiblemente se usen -->
  <link rel="prefetch" href="pagina-siguiente.html">
  
  <!-- Información del sitio web (RSS, etc) -->
  <link rel="alternate" type="application/rss+xml" href="feed.xml">
  
  <!-- Asociar con hoja de estilos alternativa -->
  <link rel="alternate stylesheet" href="dark.css" title="Tema Oscuro">
</head>
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Usar link en un proyecto real**

**Pasos:**
1. Identificar dónde necesitas link
2. Implementar correctamente según especificaciones
3. Probar en navegadores compatibles

**💡 Tips:** Asegúrate de seguir las mejores prácticas de accesibilidad

#### 2. 🎤 Entrevista
**Explicar link en una entrevista**

**Pasos:**
1. Explicar qué es link
2. Dar ejemplos prácticos de uso
3. Mencionar por qué es importante

**💡 Tips:** Sé claro y conciso, evita tecnicismos innecesarios

#### 3. 🐛 Bug Fix
**Debuggear problemas con link**

**Pasos:**
1. Inspecciona el elemento en DevTools
2. Verifica que el contenido esté correcto
3. Revisa el rendering en diferentes navegadores

**💡 Tips:** Usa la consola para verificar el estado

### ❓ Preguntas Frecuentes

#### 1. ¿Cuándo debo usar link?
**Respuesta:** Debes usar link cuando necesites se usa para cargar estilos css, fuentes tipográficas, favicons e información de preload para optimizar rendimiento sin mostrar contenido en la página..

**Q (English):** When should I use link?
**A (English):** You should use link when you need to it loads css styles, web fonts, favicons and preload information to optimize performance without displaying content on the page..

#### 2. ¿Cómo implemento link correctamente?
**Respuesta:** Usa <link rel="" href=""> en el <head> con rel indicando el tipo de relación (stylesheet, icon, preconnect) y href apuntando al recurso.

**Q (English):** How do I implement link correctly?
**A (English):** Use <link rel="" href=""> in <head> with rel indicating relationship type (stylesheet, icon, preconnect) and href pointing to resource.

#### 3. ¿Es link compatible con todos los navegadores?
**Respuesta:** Sí, link es un estándar HTML y es compatible con todos los navegadores modernos.

**Q (English):** Is link compatible with all browsers?
**A (English):** Yes, link is an HTML standard and is compatible with all modern browsers.

### 🎓 Ejercicios

#### Ejercicio 1: Práctica: Usar link
**Dificultad:** ⭐⭐

**Implementa un ejemplo funcional usando link. Se usa para cargar estilos CSS, fuentes tipográficas, favicons e información de preload para optimizar rendimiento sin mostrar contenido en la página.**

**Solución 1:**
```typescript
<head>
  <link rel="stylesheet" href="estilos.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Roboto" rel="stylesheet">
  <link rel="icon" href="favicon.ico">
</head>
```

---

**Categoría:** frontend | **ID:** 25


## META

### 📝 Traducción
**información descriptiva del documento**

---

### 🎯 Definición

#### Español
En programación "meta" se refiere al elemento HTML que proporciona metadatos sobre el documento: codificación, viewport, descripción, palabras clave y datos de compartir en redes sociales.

#### English
The HTML element that provides metadata about the document: encoding, viewport, description, keywords and social media sharing data.

---

### 💡 ¿Para qué sirve?

#### Español
Se usa para mejorar SEO, definir comportamiento en dispositivos móviles, especificar codificación de caracteres y proporcionar información para compartir en redes sociales.

#### English
It improves SEO, defines mobile device behavior, specifies character encoding and provides information for social media sharing.

---

### 🛠️ ¿Cómo se usa?

#### Español
Coloca múltiples <meta> tags en el <head> con atributos name/content o property/content; incluye siempre charset y viewport para compatibilidad.

#### English
Place multiple <meta> tags in <head> with name/content or property/content attributes; always include charset and viewport for compatibility.

### 💻 Ejemplos de Código

#### HTML
```html
<head>
  <!-- Codificación de caracteres -->
  <meta charset="UTF-8">
  
  <!-- Viewport para diseño responsive -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Descripción de la página (SEO) -->
  <meta name="description" content="Aprende HTML, CSS y JavaScript">
  
  <!-- Palabras clave (menos importante ahora) -->
  <meta name="keywords" content="html, css, javascript, desarrollo web">
  
  <!-- Autor de la página -->
  <meta name="author" content="Omar Hernández">
  
  <!-- Controlar caché -->
  <meta http-equiv="Cache-Control" content="no-cache">
  
  <!-- Color de la barra de direcciones en móviles -->
  <meta name="theme-color" content="#667eea">
  
  <!-- Open Graph para redes sociales -->
  <meta property="og:title" content="Mi Sitio Web">
  <meta property="og:description" content="Descripción para compartir">
  <meta property="og:image" content="imagen.jpg">
</head>
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Usar meta en un proyecto real**

**Pasos:**
1. Identificar dónde necesitas meta
2. Implementar correctamente según especificaciones
3. Probar en navegadores compatibles

**💡 Tips:** Asegúrate de seguir las mejores prácticas de accesibilidad

#### 2. 🎤 Entrevista
**Explicar meta en una entrevista**

**Pasos:**
1. Explicar qué es meta
2. Dar ejemplos prácticos de uso
3. Mencionar por qué es importante

**💡 Tips:** Sé claro y conciso, evita tecnicismos innecesarios

#### 3. 🐛 Bug Fix
**Debuggear problemas con meta**

**Pasos:**
1. Inspecciona el elemento en DevTools
2. Verifica que el contenido esté correcto
3. Revisa el rendering en diferentes navegadores

**💡 Tips:** Usa la consola para verificar el estado

### ❓ Preguntas Frecuentes

#### 1. ¿Cuándo debo usar meta?
**Respuesta:** Debes usar meta cuando necesites se usa para mejorar seo, definir comportamiento en dispositivos móviles, especificar codificación de caracteres y proporcionar información para compartir en redes sociales..

**Q (English):** When should I use meta?
**A (English):** You should use meta when you need to it improves seo, defines mobile device behavior, specifies character encoding and provides information for social media sharing..

#### 2. ¿Cómo implemento meta correctamente?
**Respuesta:** Coloca múltiples <meta> tags en el <head> con atributos name/content o property/content; incluye siempre charset y viewport para compatibilidad.

**Q (English):** How do I implement meta correctly?
**A (English):** Place multiple <meta> tags in <head> with name/content or property/content attributes; always include charset and viewport for compatibility.

#### 3. ¿Es meta compatible con todos los navegadores?
**Respuesta:** Sí, meta es un estándar HTML y es compatible con todos los navegadores modernos.

**Q (English):** Is meta compatible with all browsers?
**A (English):** Yes, meta is an HTML standard and is compatible with all modern browsers.

### 🎓 Ejercicios

#### Ejercicio 1: Práctica: Usar meta
**Dificultad:** ⭐⭐

**Implementa un ejemplo funcional usando meta. Se usa para mejorar SEO, definir comportamiento en dispositivos móviles, especificar codificación de caracteres y proporcionar información para compartir en redes sociales.**

**Solución 1:**
```typescript
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Descripción de la página para SEO">
  <meta name="keywords" content="html, desarrollo, web">
  <meta property="og:title" content="Título para redes sociales">
  <meta property="og:image" content="imagen.jpg">
</head>
```

---

**Categoría:** frontend | **ID:** 26


## NOSCRIPT

### 📝 Traducción
**contenido alternativo sin JavaScript**

---

### 🎯 Definición

#### Español
En programación "noscript" se refiere al elemento HTML que contiene contenido alternativo mostrado solo cuando JavaScript está deshabilitado en el navegador, mejorando la accesibilidad.

#### English
The HTML element that contains alternative content displayed only when JavaScript is disabled in the browser, improving accessibility.

---

### 💡 ¿Para qué sirve?

#### Español
Se usa para proporcionar contenido de fallback o mensajes cuando JavaScript no está disponible, mejorando la experiencia de usuarios con navegadores antiguos o configuración restrictiva.

#### English
It provides fallback content or messages when JavaScript is unavailable, improving experience for users with older browsers or restrictive settings.

---

### 🛠️ ¿Cómo se usa?

#### Español
Coloca <noscript> al final del <body> con HTML alternativo; el contenido dentro se muestra solo si JavaScript está completamente deshabilitado.

#### English
Place <noscript> at end of <body> with alternative HTML; content inside displays only if JavaScript is completely disabled.

### 💻 Ejemplos de Código

#### HTML
```html
<!DOCTYPE html>
<html>
<head>
  <title>Mi App</title>
  <style>
    .js-warning { display: none; color: red; }
  </style>
</head>
<body>
  <!-- Este contenido se muestra si JavaScript está deshabilitado -->
  <noscript>
    <div class="js-warning">
      <h1>⚠️ JavaScript Deshabilitado</h1>
      <p>Esta aplicación requiere JavaScript para funcionar correctamente.</p>
      <p>Por favor, habilita JavaScript en tu navegador.</p>
    </div>
  </noscript>
  
  <!-- Contenido normal que depende de JavaScript -->
  <div id="app">
    <p>Cargando aplicación...</p>
  </div>
  
  <script src="app.js"></script>
</body>
</html>
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Usar noscript en un proyecto real**

**Pasos:**
1. Identificar dónde necesitas noscript
2. Implementar correctamente según especificaciones
3. Probar en navegadores compatibles

**💡 Tips:** Asegúrate de seguir las mejores prácticas de accesibilidad

#### 2. 🎤 Entrevista
**Explicar noscript en una entrevista**

**Pasos:**
1. Explicar qué es noscript
2. Dar ejemplos prácticos de uso
3. Mencionar por qué es importante

**💡 Tips:** Sé claro y conciso, evita tecnicismos innecesarios

#### 3. 🐛 Bug Fix
**Debuggear problemas con noscript**

**Pasos:**
1. Inspecciona el elemento en DevTools
2. Verifica que el contenido esté correcto
3. Revisa el rendering en diferentes navegadores

**💡 Tips:** Usa la consola para verificar el estado

### ❓ Preguntas Frecuentes

#### 1. ¿Cuándo debo usar noscript?
**Respuesta:** Debes usar noscript cuando necesites se usa para proporcionar contenido de fallback o mensajes cuando javascript no está disponible, mejorando la experiencia de usuarios con navegadores antiguos o configuración restrictiva..

**Q (English):** When should I use noscript?
**A (English):** You should use noscript when you need to it provides fallback content or messages when javascript is unavailable, improving experience for users with older browsers or restrictive settings..

#### 2. ¿Cómo implemento noscript correctamente?
**Respuesta:** Coloca <noscript> al final del <body> con HTML alternativo; el contenido dentro se muestra solo si JavaScript está completamente deshabilitado.

**Q (English):** How do I implement noscript correctly?
**A (English):** Place <noscript> at end of <body> with alternative HTML; content inside displays only if JavaScript is completely disabled.

#### 3. ¿Es noscript compatible con todos los navegadores?
**Respuesta:** Sí, noscript es un estándar HTML y es compatible con todos los navegadores modernos.

**Q (English):** Is noscript compatible with all browsers?
**A (English):** Yes, noscript is an HTML standard and is compatible with all modern browsers.

### 🎓 Ejercicios

#### Ejercicio 1: Práctica: Usar noscript
**Dificultad:** ⭐⭐

**Implementa un ejemplo funcional usando noscript. Se usa para proporcionar contenido de fallback o mensajes cuando JavaScript no está disponible, mejorando la experiencia de usuarios con navegadores antiguos o configuración restrictiva.**

**Solución 1:**
```typescript
<body>
  <div id="app"><!-- Contenido renderizado por JavaScript --></div>
  <noscript>
    <div style="padding: 20px; background: #fff3cd; border: 1px solid #ffc107;">
      <p>Esta página requiere JavaScript. Por favor, habilítalo en tu navegador.</p>
      <a href="/sitio-estatico">Ir a versión sin JavaScript</a>
    </div>
  </noscript>
</body>
```

---

**Categoría:** frontend | **ID:** 30


## PRISMA

### 📝 Traducción
**ORM tipado**

---

### 🎯 Definición

#### Español
En programación "Prisma" se refiere a ORM moderno para TypeScript que genera cliente tipado y migraciones..

#### English
Type-safe ORM for TypeScript that ships with generated client and migrations.

---

### 💡 ¿Para qué sirve?

#### Español
Resuelve el puente entre modelos y base de datos con DX amigable.

#### English
Bridges schema and DB with great DX.

---

### 🛠️ ¿Cómo se usa?

#### Español
Describe modelos en schema.prisma, ejecuta migrate dev y usa el cliente generado en servicios.

#### English
Describe models in schema.prisma, run migrate dev and use the generated client inside services.

### 💻 Ejemplos de Código

#### TypeScript
```ts
// Usamos el cliente de Prisma para buscar en la base de datos.
// "await" espera a que la consulta termine.
const term = await prisma.term.findUnique({
  // Condición de búsqueda: donde el slug coincida.
  where: { slug },
  
  // Incluimos relaciones: queremos traer también las variantes del término.
  include: { variants: true },
});
// TypeScript infiere el shape del resultado automáticamente.
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Aplica "Prisma" en las APIs, servicios y lógica de negocio para destrabar un caso real. | Apply "Prisma" in APIs, services, and business logic to unblock a real scenario.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Conecta el concepto con un proyecto o métrica real. | Connect the concept with a real project or metric.

#### 2. 🎤 Entrevista
**Explica "Prisma" como si estuvieras frente a un líder técnico. | Explain "Prisma" as if you were in front of a tech lead.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Usa analogías claras y evita jerga innecesaria. | Use clear analogies and avoid unnecessary jargon.

#### 3. 🐛 Bug Fix
**Usa "Prisma" para diagnosticar o prevenir bugs relacionados. | Use "Prisma" to diagnose or prevent related bugs.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Resalta logs o métricas relevantes. | Highlight relevant logs or metrics.

### ❓ Preguntas Frecuentes

#### 1. ¿Cómo reiniciar o resetear Prisma?
**Respuesta:** Reinicia Prisma a su valor inicial respetando el contexto del concepto.

```
// Reinicia Prisma a su estado inicial
// Usa este patrón cuando necesites volver al estado base
```

**Q (English):** How to reset or reinitialize Prisma?
**A (English):** Reset Prisma to its initial value respecting the concept's context.

#### 2. ¿Cuáles son las buenas prácticas para usar Prisma?
**Respuesta:** Aplica Prisma de forma consistente, respeta su ciclo de vida y valida entradas.

```
// Buenas prácticas para Prisma
// 1. Usa de forma consistente
// 2. Respeta dependencias y ciclo de vida
// 3. Valida inputs y maneja errores
```

**Q (English):** What are best practices for using Prisma?
**A (English):** Apply Prisma consistently, respect its lifecycle and validate inputs.

#### 3. ¿Cómo explicas Prisma en una entrevista?
**Respuesta:** En programación "Prisma" se refiere a ORM moderno para TypeScript que genera cliente tipado y migraciones.. Describe modelos en schema.prisma, ejecuta migrate dev y usa el cliente generado en servicios.

```
// Usamos el cliente de Prisma para buscar en la base de datos.
// "await" espera a que la consulta termine.
const term = await prisma.term.findUnique({
  // Condición de búsqueda: donde el slug coincida.
  where: { slug },
  
  // Incluimos relaciones: queremos traer también las variantes del término.
  include: { variants: true },
});
// TypeScript infiere el shape del resultado automáticamente.
```

**Q (English):** How do you explain Prisma during an interview?
**A (English):** Type-safe ORM for TypeScript that ships with generated client and migrations. Describe models in schema.prisma, run migrate dev and use the generated client inside services.

### 🎓 Ejercicios

#### Ejercicio 1: Ejercicio Prisma
**Dificultad:** ⭐⭐

**Implementa "Prisma" en un ejemplo práctico y explica cada paso.**

**Solución 1:**
```ts
const updatedUser = await prisma.user.update({
  where: { email: 'alice@prisma.io' },
  data: {
    name: 'Alice the Great',
  },
})
```

---

**Categoría:** backend | **ID:** 12


## REST

### 📝 Traducción
**transferencia de estado representacional**

---

### 🎯 Definición

#### Español
En programación "REST" se refiere a Estilo de arquitectura para diseñar servicios web basados en recursos y verbos HTTP..

#### English
Architectural style for designing networked applications based on resources and HTTP verbs.

---

### 💡 ¿Para qué sirve?

#### Español
Estandariza la comunicación entre cliente y servidor usando la infraestructura existente de la web.

#### English
Standardizes client-server communication leveraging existing web infrastructure.

---

### 🛠️ ¿Cómo se usa?

#### Español
Diseña recursos (URLs), usa verbos HTTP correctos (GET, POST, PUT, DELETE) y devuelve representaciones (JSON).

#### English
Design resources (URLs), use proper HTTP verbs and return representations (JSON).

### 💻 Ejemplos de Código

#### JavaScript
```js
// Definimos una ruta GET para obtener un usuario por ID.
// ":id" es un parámetro dinámico en la URL.
app.get('/users/:id', async (req, res) => {
  
  // Buscamos el usuario en la DB usando el ID de los parámetros.
  const user = await db.findUser(req.params.id);
  
  // Si no existe, devolvemos un error 404 (Not Found) temprano.
  if (!user) return res.status(404).json({ error: 'Not found' });
  
  // Si existe, devolvemos el usuario en formato JSON con estado 200 (OK).
  res.json(user);
});
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Aplica "REST" en las APIs, servicios y lógica de negocio para destrabar un caso real. | Apply "REST" in APIs, services, and business logic to unblock a real scenario.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Conecta el concepto con un proyecto o métrica real. | Connect the concept with a real project or metric.

#### 2. 🎤 Entrevista
**Explica "REST" como si estuvieras frente a un líder técnico. | Explain "REST" as if you were in front of a tech lead.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Usa analogías claras y evita jerga innecesaria. | Use clear analogies and avoid unnecessary jargon.

#### 3. 🐛 Bug Fix
**Usa "REST" para diagnosticar o prevenir bugs relacionados. | Use "REST" to diagnose or prevent related bugs.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Resalta logs o métricas relevantes. | Highlight relevant logs or metrics.

### ❓ Preguntas Frecuentes

#### 1. ¿Cómo explicas REST en una entrevista?
**Respuesta:** En programación "REST" se refiere a Estilo de arquitectura para diseñar servicios web basados en recursos y verbos HTTP.. Diseña recursos (URLs), usa verbos HTTP correctos (GET, POST, PUT, DELETE) y devuelve representaciones (JSON).

```
// Definimos una ruta GET para obtener un usuario por ID.
// ":id" es un parámetro dinámico en la URL.
app.get('/users/:id', async (req, res) => {
  
  // Buscamos el usuario en la DB usando el ID de los parámetros.
  const user = await db.findUser(req.params.id);
  
  // Si no existe, devolvemos un error 404 (Not Found) temprano.
  if (!user) return res.status(404).json({ error: 'Not found' });
  
  // Si existe, devolvemos el usuario en formato JSON con estado 200 (OK).
  res.json(user);
});
```

**Q (English):** How do you explain REST during an interview?
**A (English):** Architectural style for designing networked applications based on resources and HTTP verbs. Design resources (URLs), use proper HTTP verbs and return representations (JSON).

#### 2. ¿Cómo reiniciar o resetear REST?
**Respuesta:** Reinicia REST a su valor inicial respetando el contexto del concepto.

```
// Reinicia REST a su estado inicial
// Usa este patrón cuando necesites volver al estado base
```

**Q (English):** How to reset or reinitialize REST?
**A (English):** Reset REST to its initial value respecting the concept's context.

#### 3. ¿Cuáles son las buenas prácticas para usar REST?
**Respuesta:** Aplica REST de forma consistente, respeta su ciclo de vida y valida entradas.

```
// Buenas prácticas para REST
// 1. Usa de forma consistente
// 2. Respeta dependencias y ciclo de vida
// 3. Valida inputs y maneja errores
```

**Q (English):** What are best practices for using REST?
**A (English):** Apply REST consistently, respect its lifecycle and validate inputs.

### 🎓 Ejercicios

#### Ejercicio 1: Ejercicio REST
**Dificultad:** ⭐⭐

**Implementa "REST" en un ejemplo práctico y explica cada paso.**

**Solución 1:**
```js
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}

// Response: 201 Created
```

---

**Categoría:** backend | **ID:** 13


## SCRIPT

### 📝 Traducción
**código ejecutable en el cliente**

---

### 🎯 Definición

#### Español
En programación "script" se refiere al elemento HTML que incluye o referencia código JavaScript ejecutable en el navegador, permitiendo interactividad, validación y manipulación del DOM.

#### English
The HTML element that includes or references executable JavaScript code in the browser, enabling interactivity, validation and DOM manipulation.

---

### 💡 ¿Para qué sirve?

#### Español
Se usa para añadir comportamiento interactivo a la página: detectar eventos, validar formularios, manipular el DOM y comunicarse con APIs.

#### English
It adds interactive behavior to the page: detect events, validate forms, manipulate DOM and communicate with APIs.

---

### 🛠️ ¿Cómo se usa?

#### Español
Usa <script src=""> para código externo o <script> para código incrustado; coloca al final del <body> para no bloquear renderizado; usa async/defer para optimizar carga.

#### English
Use <script src=""> for external code or <script> for embedded code; place at end of <body> to not block rendering; use async/defer to optimize loading.

### 💻 Ejemplos de Código

#### HTML
```html
<!DOCTYPE html>
<html>
<head>
  <!-- Script en el head: se carga antes que el contenido -->
  <script src="config.js"></script>
  
  <!-- Script inline en el head -->
  <script>
    console.log('Este script corre apenas carga la página');
  </script>
</head>
<body>
  <h1>Contenido</h1>
  <button id="btn">Click</button>
  
  <!-- Script al final del body: mejor para rendimiento -->
  <script src="app.js"></script>
  
  <!-- Script inline que accede a elementos del DOM -->
  <script>
    const button = document.getElementById('btn');
    button.addEventListener('click', () => {
      alert('¡Botón clickeado!');
    });
  </script>
</body>
</html>
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Usar script en un proyecto real**

**Pasos:**
1. Identificar dónde necesitas script
2. Implementar correctamente según especificaciones
3. Probar en navegadores compatibles

**💡 Tips:** Asegúrate de seguir las mejores prácticas de accesibilidad

#### 2. 🎤 Entrevista
**Explicar script en una entrevista**

**Pasos:**
1. Explicar qué es script
2. Dar ejemplos prácticos de uso
3. Mencionar por qué es importante

**💡 Tips:** Sé claro y conciso, evita tecnicismos innecesarios

#### 3. 🐛 Bug Fix
**Debuggear problemas con script**

**Pasos:**
1. Inspecciona el elemento en DevTools
2. Verifica que el contenido esté correcto
3. Revisa el rendering en diferentes navegadores

**💡 Tips:** Usa la consola para verificar el estado

### ❓ Preguntas Frecuentes

#### 1. ¿Cuándo debo usar script?
**Respuesta:** Debes usar script cuando necesites se usa para añadir comportamiento interactivo a la página: detectar eventos, validar formularios, manipular el dom y comunicarse con apis..

**Q (English):** When should I use script?
**A (English):** You should use script when you need to it adds interactive behavior to the page: detect events, validate forms, manipulate dom and communicate with apis..

#### 2. ¿Cómo implemento script correctamente?
**Respuesta:** Usa <script src=""> para código externo o <script> para código incrustado; coloca al final del <body> para no bloquear renderizado; usa async/defer para optimizar carga.

**Q (English):** How do I implement script correctly?
**A (English):** Use <script src=""> for external code or <script> for embedded code; place at end of <body> to not block rendering; use async/defer to optimize loading.

#### 3. ¿Es script compatible con todos los navegadores?
**Respuesta:** Sí, script es un estándar HTML y es compatible con todos los navegadores modernos.

**Q (English):** Is script compatible with all browsers?
**A (English):** Yes, script is an HTML standard and is compatible with all modern browsers.

### 🎓 Ejercicios

#### Ejercicio 1: Práctica: Usar script
**Dificultad:** ⭐⭐

**Implementa un ejemplo funcional usando script. Se usa para añadir comportamiento interactivo a la página: detectar eventos, validar formularios, manipular el DOM y comunicarse con APIs.**

**Solución 1:**
```typescript
<head>
  <script src="libreria.js" defer></script>
</head>
<body>
  <button id="btn">Haz clic</button>
  <script>
    document.getElementById('btn').addEventListener('click', () => {
      alert('¡Hiciste clic!');
    });
  </script>
</body>
```

---

**Categoría:** frontend | **ID:** 29


## SCROLL-SNAP

### 📝 Traducción
**alinear scroll en posiciones definidas**

---

### 🎯 Definición

#### Español
En programación "scroll-snap" se refiere a Familia de propiedades que hace que el scroll se detenga en puntos exactos (galerías, carruseles)..

#### English
Set of properties that snaps scrolling containers to exact stops (carousels, stories, onboarding).

---

### 💡 ¿Para qué sirve?

#### Español
Sirve para experiencias táctiles consistentes donde cada card se centra.

#### English
Ensures every card or slide centers perfectly on touch experiences.

---

### 🛠️ ¿Cómo se usa?

#### Español
Añade scroll-snap-type al contenedor y scroll-snap-align a cada ítem.

#### English
Set scroll-snap-type on the container plus scroll-snap-align on the children.

### 💻 Ejemplos de Código

#### CSS
```css
.carousel {
  /* Usamos grid para layout horizontal */
  display: grid;
  
  /* Las columnas se crean automáticamente en dirección horizontal */
  grid-auto-flow: column;
  
  /* Espacio entre cada slide del carrusel */
  gap: 1rem;
  
  /* Permitimos scroll horizontal */
  overflow-x: auto;
  
  /* Activamos snap en el eje X (horizontal) */
  /* "mandatory" = siempre se ajusta a un punto de snap */
  scroll-snap-type: x mandatory;
}

/* Configuramos cada slide individual */
.carousel > article {
  /* Cada slide se centra cuando el usuario hace scroll */
  scroll-snap-align: center;
}
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Aplica "scroll-snap" en la capa visual y de interacción para destrabar un caso real. | Apply "scroll-snap" in the UI layer to unblock a real scenario.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Conecta el concepto con un proyecto o métrica real. | Connect the concept with a real project or metric.

#### 2. 🎤 Entrevista
**Explica "scroll-snap" como si estuvieras frente a un líder técnico. | Explain "scroll-snap" as if you were in front of a tech lead.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Usa analogías claras y evita jerga innecesaria. | Use clear analogies and avoid unnecessary jargon.

#### 3. 🐛 Bug Fix
**Usa "scroll-snap" para diagnosticar o prevenir bugs relacionados. | Use "scroll-snap" to diagnose or prevent related bugs.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Resalta logs o métricas relevantes. | Highlight relevant logs or metrics.

### ❓ Preguntas Frecuentes

#### 1. ¿Cómo explicas scroll-snap en una entrevista?
**Respuesta:** En programación "scroll-snap" se refiere a Familia de propiedades que hace que el scroll se detenga en puntos exactos (galerías, carruseles).. Añade scroll-snap-type al contenedor y scroll-snap-align a cada ítem.

```
.carousel {
  /* Usamos grid para layout horizontal */
  display: grid;
  
  /* Las columnas se crean automáticamente en dirección horizontal */
  grid-auto-flow: column;
  
  /* Espacio entre cada slide del carrusel */
  gap: 1rem;
  
  /* Permitimos scroll horizontal */
  overflow-x: auto;
  
  /* Activamos snap en el eje X (horizontal) */
  /* "mandatory" = siempre se ajusta a un punto de snap */
  scroll-snap-type: x mandatory;
}

/* Configuramos cada slide individual */
.carousel > article {
  /* Cada slide se centra cuando el usuario hace scroll */
  scroll-snap-align: center;
}
```

**Q (English):** How do you explain scroll-snap during an interview?
**A (English):** Set of properties that snaps scrolling containers to exact stops (carousels, stories, onboarding). Set scroll-snap-type on the container plus scroll-snap-align on the children.

#### 2. ¿Cómo reiniciar o resetear scroll-snap?
**Respuesta:** Usa el valor 'initial', 'unset' o el valor por defecto de la propiedad para anular estilos heredados.

```
.element {
  scroll-snap: initial;
}
```

**Q (English):** How to reset or reinitialize scroll-snap?
**A (English):** Use 'initial', 'unset' or the default property value to override inherited styles.

#### 3. ¿Cuáles son las buenas prácticas para usar scroll-snap?
**Respuesta:** Usa clases utilitarias o componentes, evita selectores anidados profundos y verifica el soporte en navegadores.

```
/* Buenas prácticas */
.component {
  /* Usa variables para consistencia */
  scroll-snap: var(--scroll-snap);
}
```

**Q (English):** What are best practices for using scroll-snap?
**A (English):** Use utility classes or components, avoid deep nesting and check browser support.

### 🎓 Ejercicios

#### Ejercicio 1: Ejercicio scroll-snap
**Dificultad:** ⭐⭐

**Implementa "scroll-snap" en un ejemplo práctico y explica cada paso.**

**Solución 1:**
```css
.tags {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  gap: 8px;
  padding: 16px;
}

.tag {
  scroll-snap-align: start;
}
```

---

**Categoría:** frontend | **ID:** 20


## SLOT

### 📝 Traducción
**punto de inserción en componentes web**

---

### 🎯 Definición

#### Español
En programación "slot" se refiere al elemento HTML que define un punto de inserción nombrado o anónimo dentro de componentes web (Web Components), permitiendo que el contenido del usuario se proyecte en la plantilla.

#### English
The HTML element that defines a named or unnamed insertion point within web components, allowing user content to be projected into the template.

---

### 💡 ¿Para qué sirve?

#### Español
Se usa en Web Components para permitir que usuarios del componente inserten su propio contenido en ubicaciones específicas, facilitando composición flexible y reutilización.

#### English
It's used in Web Components to allow component users to insert their own content in specific locations, facilitating flexible composition and reuse.

---

### 🛠️ ¿Cómo se usa?

#### Español
Define <slot> dentro de una plantilla de Web Component; usa name="" para slots nombrados o deja vacío para slot anónimo; el contenido se proyecta automáticamente.

#### English
Define <slot> inside a Web Component template; use name="" for named slots or leave empty for anonymous slot; content projects automatically.

### 💻 Ejemplos de Código

#### HTML
```html
<!-- archivo: my-component.js (Web Component) -->
class MyCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        .card { border: 1px solid #ccc; padding: 1rem; }
        .header { font-weight: bold; }
      </style>
      
      <div class="card">
        <!-- El slot "header" acepta contenido del usuario -->
        <div class="header">
          <slot name="header">Título por defecto</slot>
        </div>
        
        <!-- El slot sin nombre acepta contenido por defecto -->
        <div class="content">
          <slot>Contenido por defecto</slot>
        </div>
        
        <!-- El slot "footer" acepta pie de página -->
        <div class="footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('my-card', MyCard);

// Uso:
// <my-card>
//   <div slot="header">Mi Título</div>
//   <p>Mi contenido personalizado</p>
//   <div slot="footer">Pie de página</div>
// </my-card>
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Usar slot en un proyecto real**

**Pasos:**
1. Identificar dónde necesitas slot
2. Implementar correctamente según especificaciones
3. Probar en navegadores compatibles

**💡 Tips:** Asegúrate de seguir las mejores prácticas de accesibilidad

#### 2. 🎤 Entrevista
**Explicar slot en una entrevista**

**Pasos:**
1. Explicar qué es slot
2. Dar ejemplos prácticos de uso
3. Mencionar por qué es importante

**💡 Tips:** Sé claro y conciso, evita tecnicismos innecesarios

#### 3. 🐛 Bug Fix
**Debuggear problemas con slot**

**Pasos:**
1. Inspecciona el elemento en DevTools
2. Verifica que el contenido esté correcto
3. Revisa el rendering en diferentes navegadores

**💡 Tips:** Usa la consola para verificar el estado

### ❓ Preguntas Frecuentes

#### 1. ¿Cuándo debo usar slot?
**Respuesta:** Debes usar slot cuando necesites se usa en web components para permitir que usuarios del componente inserten su propio contenido en ubicaciones específicas, facilitando composición flexible y reutilización..

**Q (English):** When should I use slot?
**A (English):** You should use slot when you need to it's used in web components to allow component users to insert their own content in specific locations, facilitating flexible composition and reuse..

#### 2. ¿Cómo implemento slot correctamente?
**Respuesta:** Define <slot> dentro de una plantilla de Web Component; usa name="" para slots nombrados o deja vacío para slot anónimo; el contenido se proyecta automáticamente.

**Q (English):** How do I implement slot correctly?
**A (English):** Define <slot> inside a Web Component template; use name="" for named slots or leave empty for anonymous slot; content projects automatically.

#### 3. ¿Es slot compatible con todos los navegadores?
**Respuesta:** Sí, slot es un estándar HTML y es compatible con todos los navegadores modernos.

**Q (English):** Is slot compatible with all browsers?
**A (English):** Yes, slot is an HTML standard and is compatible with all modern browsers.

### 🎓 Ejercicios

#### Ejercicio 1: Práctica: Usar slot
**Dificultad:** ⭐⭐

**Implementa un ejemplo funcional usando slot. Se usa en Web Components para permitir que usuarios del componente inserten su propio contenido en ubicaciones específicas, facilitando composición flexible y reutilización.**

**Solución 1:**
```typescript
<template id="card-template">
  <style>
    :host { display: block; border: 1px solid #ccc; padding: 1rem; }
  </style>
  <div class="header">
    <slot name="title">Título por defecto</slot>
  </div>
  <div class="body">
    <slot>Contenido por defecto</slot>
  </div>
  <div class="footer">
    <slot name="actions">Acciones</slot>
  </div>
</template>
<script>
  class Card extends HTMLElement {
    connectedCallback() {
      const template = document.getElementById('card-template');
      this.attachShadow({mode: 'open'}).appendChild(
        template.content.cloneNode(true)
      );
    }
  }
  customElements.define('my-card', Card);
</script>
<my-card>
  <h2 slot="title">Mi Tarjeta</h2>
  <p>Contenido personalizado</p>
  <button slot="actions">Enviar</button>
</my-card>
```

---

**Categoría:** frontend | **ID:** 32


## STYLE-ELEMENT

### 📝 Traducción
**estilos CSS internos en el documento**

---

### 🎯 Definición

#### Español
En programación "style" se refiere al elemento HTML que contiene reglas CSS incrustadas directamente en el documento, permitiendo estilos específicos sin necesidad de archivos externos.

#### English
The HTML element that contains CSS rules embedded directly in the document, allowing specific styles without needing external files.

---

### 💡 ¿Para qué sirve?

#### Español
Se usa para aplicar estilos locales a la página, útil para estilos críticos, personalizaciones dinámicas o cuando prefieres CSS incrustado sobre archivos externos.

#### English
It applies local styles to the page, useful for critical styles, dynamic customizations or when you prefer embedded CSS over external files.

---

### 🛠️ ¿Cómo se usa?

#### Español
Coloca <style> en el <head> o <body> con reglas CSS; puede contener media queries y selectores complejos como en archivos CSS externos.

#### English
Place <style> in <head> or <body> with CSS rules; can contain media queries and complex selectors like in external CSS files.

### 💻 Ejemplos de Código

#### HTML
```html
<!DOCTYPE html>
<html>
<head>
  <!-- Estilos globales inline -->
  <style>
    /* Variables CSS */
    :root {
      --color-primary: #667eea;
      --spacing-unit: 1rem;
    }
    
    /* Reset y estilos base */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', sans-serif;
      color: #333;
      background-color: #f5f5f5;
    }
    
    /* Componente button -->
    button {
      background-color: var(--color-primary);
      color: white;
      padding: var(--spacing-unit);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    button:hover {
      background-color: #5568d3;
    }
    
    /* Media query para responsive -->
    @media (max-width: 768px) {
      body {
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <button>Click aquí</button>
</body>
</html>
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Usar style-element en un proyecto real**

**Pasos:**
1. Identificar dónde necesitas style-element
2. Implementar correctamente según especificaciones
3. Probar en navegadores compatibles

**💡 Tips:** Asegúrate de seguir las mejores prácticas de accesibilidad

#### 2. 🎤 Entrevista
**Explicar style-element en una entrevista**

**Pasos:**
1. Explicar qué es style-element
2. Dar ejemplos prácticos de uso
3. Mencionar por qué es importante

**💡 Tips:** Sé claro y conciso, evita tecnicismos innecesarios

#### 3. 🐛 Bug Fix
**Debuggear problemas con style-element**

**Pasos:**
1. Inspecciona el elemento en DevTools
2. Verifica que el contenido esté correcto
3. Revisa el rendering en diferentes navegadores

**💡 Tips:** Usa la consola para verificar el estado

### ❓ Preguntas Frecuentes

#### 1. ¿Cuándo debo usar style-element?
**Respuesta:** Debes usar style-element cuando necesites se usa para aplicar estilos locales a la página, útil para estilos críticos, personalizaciones dinámicas o cuando prefieres css incrustado sobre archivos externos..

**Q (English):** When should I use style-element?
**A (English):** You should use style-element when you need to it applies local styles to the page, useful for critical styles, dynamic customizations or when you prefer embedded css over external files..

#### 2. ¿Cómo implemento style-element correctamente?
**Respuesta:** Coloca <style> en el <head> o <body> con reglas CSS; puede contener media queries y selectores complejos como en archivos CSS externos.

**Q (English):** How do I implement style-element correctly?
**A (English):** Place <style> in <head> or <body> with CSS rules; can contain media queries and complex selectors like in external CSS files.

#### 3. ¿Es style-element compatible con todos los navegadores?
**Respuesta:** Sí, style-element es un estándar HTML y es compatible con todos los navegadores modernos.

**Q (English):** Is style-element compatible with all browsers?
**A (English):** Yes, style-element is an HTML standard and is compatible with all modern browsers.

### 🎓 Ejercicios

#### Ejercicio 1: Práctica: Usar style-element
**Dificultad:** ⭐⭐

**Implementa un ejemplo funcional usando style-element. Se usa para aplicar estilos locales a la página, útil para estilos críticos, personalizaciones dinámicas o cuando prefieres CSS incrustado sobre archivos externos.**

**Solución 1:**
```typescript
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
    }
    h1 {
      color: #333;
      border-bottom: 2px solid #007bff;
    }
    @media (max-width: 768px) {
      h1 { font-size: 1.5rem; }
    }
  </style>
</head>
```

---

**Categoría:** frontend | **ID:** 27


## TEMPLATE

### 📝 Traducción
**plantilla de contenido reutilizable**

---

### 🎯 Definición

#### Español
En programación "template" se refiere al elemento HTML que contiene HTML que no se renderiza inicialmente pero puede clonarse y usarse dinámicamente con JavaScript, facilitando componentes reutilizables.

#### English
The HTML element that contains HTML that is not initially rendered but can be cloned and used dynamically with JavaScript, facilitating reusable components.

---

### 💡 ¿Para qué sirve?

#### Español
Se usa para definir fragmentos de HTML que se duplican dinámicamente, útil para listas generadas, componentes repetitvos y arquetipos que se instancian múltiples veces.

#### English
It defines HTML fragments that are duplicated dynamically, useful for generated lists, repeated components and prototypes instantiated multiple times.

---

### 🛠️ ¿Cómo se usa?

#### Español
Coloca HTML dentro de <template>; accede con document.querySelector('template').content; clona con .cloneNode(true) y añade al DOM donde necesites.

#### English
Place HTML inside <template>; access with document.querySelector('template').content; clone with .cloneNode(true) and append to DOM where needed.

### 💻 Ejemplos de Código

#### HTML
```html
<!DOCTYPE html>
<html>
<head>
  <title>Template Demo</title>
</head>
<body>
  <!-- El contenido del template NO se renderiza hasta que se clona -->
  <template id="card-template">
    <div class="card">
      <img class="card-image" src="" alt="">
      <h3 class="card-title"></h3>
      <p class="card-description"></p>
      <button class="card-button">Ver más</button>
    </div>
  </template>
  
  <!-- Contenedor donde inyectaremos las tarjetas -->
  <div id="cards-container"></div>
  
  <script>
    const template = document.getElementById('card-template');
    const data = [
      { title: 'Card 1', description: 'Contenido 1', image: 'img1.jpg' },
      { title: 'Card 2', description: 'Contenido 2', image: 'img2.jpg' },
    ];
    
    data.forEach(item => {
      // Clonar el template
      const clone = template.content.cloneNode(true);
      
      // Rellenar datos
      clone.querySelector('.card-title').textContent = item.title;
      clone.querySelector('.card-description').textContent = item.description;
      clone.querySelector('.card-image').src = item.image;
      
      // Insertar en el DOM
      document.getElementById('cards-container').appendChild(clone);
    });
  </script>
</body>
</html>
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Usar template en un proyecto real**

**Pasos:**
1. Identificar dónde necesitas template
2. Implementar correctamente según especificaciones
3. Probar en navegadores compatibles

**💡 Tips:** Asegúrate de seguir las mejores prácticas de accesibilidad

#### 2. 🎤 Entrevista
**Explicar template en una entrevista**

**Pasos:**
1. Explicar qué es template
2. Dar ejemplos prácticos de uso
3. Mencionar por qué es importante

**💡 Tips:** Sé claro y conciso, evita tecnicismos innecesarios

#### 3. 🐛 Bug Fix
**Debuggear problemas con template**

**Pasos:**
1. Inspecciona el elemento en DevTools
2. Verifica que el contenido esté correcto
3. Revisa el rendering en diferentes navegadores

**💡 Tips:** Usa la consola para verificar el estado

### ❓ Preguntas Frecuentes

#### 1. ¿Cuándo debo usar template?
**Respuesta:** Debes usar template cuando necesites se usa para definir fragmentos de html que se duplican dinámicamente, útil para listas generadas, componentes repetitvos y arquetipos que se instancian múltiples veces..

**Q (English):** When should I use template?
**A (English):** You should use template when you need to it defines html fragments that are duplicated dynamically, useful for generated lists, repeated components and prototypes instantiated multiple times..

#### 2. ¿Cómo implemento template correctamente?
**Respuesta:** Coloca HTML dentro de <template>; accede con document.querySelector('template').content; clona con .cloneNode(true) y añade al DOM donde necesites.

**Q (English):** How do I implement template correctly?
**A (English):** Place HTML inside <template>; access with document.querySelector('template').content; clone with .cloneNode(true) and append to DOM where needed.

#### 3. ¿Es template compatible con todos los navegadores?
**Respuesta:** Sí, template es un estándar HTML y es compatible con todos los navegadores modernos.

**Q (English):** Is template compatible with all browsers?
**A (English):** Yes, template is an HTML standard and is compatible with all modern browsers.

### 🎓 Ejercicios

#### Ejercicio 1: Práctica: Usar template
**Dificultad:** ⭐⭐

**Implementa un ejemplo funcional usando template. Se usa para definir fragmentos de HTML que se duplican dinámicamente, útil para listas generadas, componentes repetitvos y arquetipos que se instancian múltiples veces.**

**Solución 1:**
```typescript
<body>
  <ul id="lista"></ul>
  <template id="item-template">
    <li>
      <strong>Título:</strong> <span class="titulo"></span>
      <button class="eliminar">Borrar</button>
    </li>
  </template>
  <script>
    const template = document.getElementById('item-template');
    const lista = document.getElementById('lista');
    const items = [{titulo: 'Item 1'}, {titulo: 'Item 2'}];
    items.forEach(item => {
      const clone = template.content.cloneNode(true);
      clone.querySelector('.titulo').textContent = item.titulo;
      lista.appendChild(clone);
    });
  </script>
</body>
```

---

**Categoría:** frontend | **ID:** 31


## TITLE

### 📝 Traducción
**título de la página en navegador**

---

### 🎯 Definición

#### Español
En programación "title" se refiere al elemento HTML que define el título de la página, mostrado en la pestaña del navegador, en la historia de búsqueda y en los resultados de buscadores.

#### English
The HTML element that defines the page title, displayed in the browser tab, search history and search engine results.

---

### 💡 ¿Para qué sirve?

#### Español
Se usa para identificar el contenido de la página en la pestaña del navegador y mejorar el SEO al indicar a los motores de búsqueda el tema principal.

#### English
It identifies page content in the browser tab and improves SEO by telling search engines the main topic.

---

### 🛠️ ¿Cómo se usa?

#### Español
Incluye un único <title> en el <head> con texto descriptivo y conciso (30-60 caracteres); debe ser única para cada página y contener palabras clave relevantes.

#### English
Include a single <title> in <head> with descriptive and concise text (30-60 characters); should be unique per page and contain relevant keywords.

### 💻 Ejemplos de Código

#### HTML
```html
<!DOCTYPE html>
<html lang="es">
<head>
  <!-- El título aparece en la pestaña del navegador -->
  <title>Mi Diccionario Dev - Aprende a Programar</title>
  
  <!-- El título también se usa en: -->
  <!-- 1. Resultados de Google (SEO) -->
  <!-- 2. Marcadores -->
  <!-- 3. Historial del navegador -->
  <!-- 4. Cuando compartes en redes sociales (si no hay og:title) -->
</head>
<body>
  <h1>Este es un encabezado dentro de la página</h1>
  <p>Nota: el &lt;title&gt; NO aparece en la página, solo en la pestaña</p>
</body>
</html>
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Usar title en un proyecto real**

**Pasos:**
1. Identificar dónde necesitas title
2. Implementar correctamente según especificaciones
3. Probar en navegadores compatibles

**💡 Tips:** Asegúrate de seguir las mejores prácticas de accesibilidad

#### 2. 🎤 Entrevista
**Explicar title en una entrevista**

**Pasos:**
1. Explicar qué es title
2. Dar ejemplos prácticos de uso
3. Mencionar por qué es importante

**💡 Tips:** Sé claro y conciso, evita tecnicismos innecesarios

#### 3. 🐛 Bug Fix
**Debuggear problemas con title**

**Pasos:**
1. Inspecciona el elemento en DevTools
2. Verifica que el contenido esté correcto
3. Revisa el rendering en diferentes navegadores

**💡 Tips:** Usa la consola para verificar el estado

### ❓ Preguntas Frecuentes

#### 1. ¿Cuándo debo usar title?
**Respuesta:** Debes usar title cuando necesites se usa para identificar el contenido de la página en la pestaña del navegador y mejorar el seo al indicar a los motores de búsqueda el tema principal..

**Q (English):** When should I use title?
**A (English):** You should use title when you need to it identifies page content in the browser tab and improves seo by telling search engines the main topic..

#### 2. ¿Cómo implemento title correctamente?
**Respuesta:** Incluye un único <title> en el <head> con texto descriptivo y conciso (30-60 caracteres); debe ser única para cada página y contener palabras clave relevantes.

**Q (English):** How do I implement title correctly?
**A (English):** Include a single <title> in <head> with descriptive and concise text (30-60 characters); should be unique per page and contain relevant keywords.

#### 3. ¿Es title compatible con todos los navegadores?
**Respuesta:** Sí, title es un estándar HTML y es compatible con todos los navegadores modernos.

**Q (English):** Is title compatible with all browsers?
**A (English):** Yes, title is an HTML standard and is compatible with all modern browsers.

### 🎓 Ejercicios

#### Ejercicio 1: Práctica: Usar title
**Dificultad:** ⭐⭐

**Implementa un ejemplo funcional usando title. Se usa para identificar el contenido de la página en la pestaña del navegador y mejorar el SEO al indicar a los motores de búsqueda el tema principal.**

**Solución 1:**
```typescript
<head>
  <title>Aprende HTML: Guía Completa para Desarrolladores</title>
</head>
```

---

**Categoría:** frontend | **ID:** 28


## USEEFFECT

### 📝 Traducción
**efectos en React**

---

### 🎯 Definición

#### Español
En programación "useEffect" se refiere a Hook de React para ejecutar efectos secundarios (fetch, suscripciones, timers) sincronizados con el ciclo de vida del componente..

#### English
React hook to run side effects (fetching, subscriptions, timers) tied to the component lifecycle.

---

### 💡 ¿Para qué sirve?

#### Español
Sincroniza lógica externa (fetch, eventos, timers) con el render y las dependencias declaradas.

#### English
Sync external logic (fetch, events, timers) with render and declared dependencies.

---

### 🛠️ ¿Cómo se usa?

#### Español
Declara dependencias en el array final; limpia recursos retornando una función.

#### English
List dependencies in the array; return a cleanup to release resources.

### 💻 Ejemplos de Código

#### TypeScript
```ts
import { useEffect } from "react";

function OnlineStatus() {
  useEffect(() => {
    function handleOnline() {
      console.log("Estoy online");
    }

    window.addEventListener("online", handleOnline);

    // 🔥 Limpieza: se ejecuta al desmontar o al cambiar dependencias.
    return () => window.removeEventListener("online", handleOnline);
  }, []); // Array vacío => solo al montar/desmontar

  return <p>Escuchando estado de red...</p>;
}
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Aplica "useEffect" en la capa visual y de interacción para destrabar un caso real. | Apply "useEffect" in the UI layer to unblock a real scenario.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Conecta el concepto con un proyecto o métrica real. | Connect the concept with a real project or metric.

#### 2. 🎤 Entrevista
**Explica "useEffect" como si estuvieras frente a un líder técnico. | Explain "useEffect" as if you were in front of a tech lead.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Usa analogías claras y evita jerga innecesaria. | Use clear analogies and avoid unnecessary jargon.

#### 3. 🐛 Bug Fix
**Usa "useEffect" para diagnosticar o prevenir bugs relacionados. | Use "useEffect" to diagnose or prevent related bugs.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Resalta logs o métricas relevantes. | Highlight relevant logs or metrics.

### ❓ Preguntas Frecuentes

#### 1. ¿Cómo explicas useEffect en una entrevista?
**Respuesta:** En programación "useEffect" se refiere a Hook de React para ejecutar efectos secundarios (fetch, suscripciones, timers) sincronizados con el ciclo de vida del componente.. Declara dependencias en el array final; limpia recursos retornando una función.

```
import { useEffect } from "react";

function OnlineStatus() {
  useEffect(() => {
    function handleOnline() {
      console.log("Estoy online");
    }

    window.addEventListener("online", handleOnline);

    // 🔥 Limpieza: se ejecuta al desmontar o al cambiar dependencias.
    return () => window.removeEventListener("online", handleOnline);
  }, []); // Array vacío => solo al montar/desmontar

  return <p>Escuchando estado de red...</p>;
}
```

**Q (English):** How do you explain useEffect during an interview?
**A (English):** React hook to run side effects (fetching, subscriptions, timers) tied to the component lifecycle. List dependencies in the array; return a cleanup to release resources.

#### 2. ¿Cómo reiniciar o resetear useEffect?
**Respuesta:** Reinicia useEffect a su valor inicial respetando el contexto del concepto.

```
// Reinicia useEffect a su estado inicial
// Usa este patrón cuando necesites volver al estado base
```

**Q (English):** How to reset or reinitialize useEffect?
**A (English):** Reset useEffect to its initial value respecting the concept's context.

#### 3. ¿Cuáles son las buenas prácticas para usar useEffect?
**Respuesta:** Aplica useEffect de forma consistente, respeta su ciclo de vida y valida entradas.

```
// Buenas prácticas para useEffect
// 1. Usa de forma consistente
// 2. Respeta dependencias y ciclo de vida
// 3. Valida inputs y maneja errores
```

**Q (English):** What are best practices for using useEffect?
**A (English):** Apply useEffect consistently, respect its lifecycle and validate inputs.

### 🎓 Ejercicios

#### Ejercicio 1: Ejercicio useEffect
**Dificultad:** ⭐⭐

**Implementa "useEffect" en un ejemplo práctico y explica cada paso.**

**Solución 1:**
```ts
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    
    return () => clearInterval(id);
  }, []);

  return <h1>{count}</h1>;
}
```

---

**Categoría:** frontend | **ID:** 2


## USESTATE

### 📝 Traducción
**estado local en React**

---

### 🎯 Definición

#### Español
En programación "useState" se refiere a Hook que crea y actualiza valores reactivos dentro de componentes..

#### English
React Hook that creates a reactive value inside function components.

---

### 💡 ¿Para qué sirve?

#### Español
Resuelve la necesidad de guardar input del usuario, flags de UI o datos cacheados.

#### English
Solves local UI data like user input, flags or cached responses.

---

### 🛠️ ¿Cómo se usa?

#### Español
Importa useState desde react, inicializa con un valor y usa el setter para actualizar de forma inmutable.

#### English
Import useState from react, provide an initial value and call the setter to update immutably.

### 💻 Ejemplos de Código

#### TypeScript
```ts
export function Counter() {
  // Inicializamos el estado "count" en 0.
  // "setCount" es la función que usaremos para actualizarlo.
  const [count, setCount] = useState(0);

  return (
    // Al hacer clic, llamamos a setCount.
    // Usamos una función callback (value => value + 1) para asegurar
    // que trabajamos con el valor más reciente del estado.
    <button onClick={() => setCount((value) => value + 1)}>
      {/* Renderizamos el valor actual de count */}
      {count}
    </button>
  );
}
```

### 🔍 Casos de Uso

#### 1. 🏗️ Proyecto
**Aplica "useState" en la capa visual y de interacción para destrabar un caso real. | Apply "useState" in the UI layer to unblock a real scenario.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Conecta el concepto con un proyecto o métrica real. | Connect the concept with a real project or metric.

#### 2. 🎤 Entrevista
**Explica "useState" como si estuvieras frente a un líder técnico. | Explain "useState" as if you were in front of a tech lead.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Usa analogías claras y evita jerga innecesaria. | Use clear analogies and avoid unnecessary jargon.

#### 3. 🐛 Bug Fix
**Usa "useState" para diagnosticar o prevenir bugs relacionados. | Use "useState" to diagnose or prevent related bugs.**

**Pasos:**
1. [object Object]
2. [object Object]
3. [object Object]

**💡 Tips:** Resalta logs o métricas relevantes. | Highlight relevant logs or metrics.

### ❓ Preguntas Frecuentes

#### 1. ¿Cómo explicas useState en una entrevista?
**Respuesta:** En programación "useState" se refiere a Hook que crea y actualiza valores reactivos dentro de componentes.. Importa useState desde react, inicializa con un valor y usa el setter para actualizar de forma inmutable.

```
export function Counter() {
  // Inicializamos el estado "count" en 0.
  // "setCount" es la función que usaremos para actualizarlo.
  const [count, setCount] = useState(0);

  return (
    // Al hacer clic, llamamos a setCount.
    // Usamos una función callback (value => value + 1) para asegurar
    // que trabajamos con el valor más reciente del estado.
    <button onClick={() => setCount((value) => value + 1)}>
      {/* Renderizamos el valor actual de count */}
      {count}
    </button>
  );
}
```

**Q (English):** How do you explain useState during an interview?
**A (English):** React Hook that creates a reactive value inside function components. Import useState from react, provide an initial value and call the setter to update immutably.

#### 2. ¿Cómo reiniciar o resetear useState?
**Respuesta:** Reinicia useState a su valor inicial respetando el contexto del concepto.

```
// Reinicia useState a su estado inicial
// Usa este patrón cuando necesites volver al estado base
```

**Q (English):** How to reset or reinitialize useState?
**A (English):** Reset useState to its initial value respecting the concept's context.

#### 3. ¿Cuáles son las buenas prácticas para usar useState?
**Respuesta:** Aplica useState de forma consistente, respeta su ciclo de vida y valida entradas.

```
// Buenas prácticas para useState
// 1. Usa de forma consistente
// 2. Respeta dependencias y ciclo de vida
// 3. Valida inputs y maneja errores
```

**Q (English):** What are best practices for using useState?
**A (English):** Apply useState consistently, respect its lifecycle and validate inputs.

### 🎓 Ejercicios

#### Ejercicio 1: Ejercicio useState
**Dificultad:** ⭐⭐

**Implementa "useState" en un ejemplo práctico y explica cada paso.**

**Solución 1:**
```ts
function Toggle() {
  const [isOn, setIsOn] = useState(false);

  return (
    <button onClick={() => setIsOn(!isOn)}>
      {isOn ? 'ON' : 'OFF'}
    </button>
  );
}
```

---

**Categoría:** frontend | **ID:** 6

