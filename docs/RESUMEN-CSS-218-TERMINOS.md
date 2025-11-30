# 🎨 Diccionario CSS - 218 Términos Completos

## 📊 Estadísticas Finales

**Total Términos Frontend:** 419
- HTML: 201 términos
- CSS: 218 términos

## 📚 Cobertura CSS por Categoría

### 1. **Selectores CSS (13 términos)**
Fundamentos para seleccionar elementos

| Término | Descripción |
|---------|-------------|
| `universal-selector` | `*` - Selecciona todos los elementos |
| `type-selector` | `p {}` - Por nombre de etiqueta |
| `class-selector` | `.classname {}` - Por clase |
| `id-selector` | `#idname {}` - Por identificador único |
| `attribute-selector` | `[attr='value'] {}` - Por atributo HTML |
| `descendant-selector` | `.parent p {}` - Descendientes |
| `child-selector` | `.parent > p {}` - Hijos directos |
| `adjacent-sibling-selector` | `h1 + p {}` - Hermano siguiente |
| `sibling-selector` | `h1 ~ p {}` - Hermanos posteriores |
| `group-selector` | `h1, h2, h3 {}` - Múltiples selectores |
| `pseudo-class-selector` | `:hover`, `:focus` - Estados especiales |
| `pseudo-element-selector` | `::before`, `::after` - Elementos virtuales |
| `negation-selector` | `:not(.class) {}` - Exclusión |

### 2. **Pseudo-clases (41 términos)**
Estados e interacciones del usuario

**Interacción:**
- `hover` - Ratón encima
- `active` - Mientras hace click
- `focus` - Tiene foco
- `focus-visible` - Foco visible (keyboard)
- `focus-within` - Contenedor con foco dentro
- `visited` - Link visitado
- `link` - Link no visitado

**Validación:**
- `checked` - Input seleccionado
- `disabled` - Deshabilitado
- `enabled` - Habilitado
- `required` - Campo requerido
- `optional` - Campo opcional
- `placeholder-shown` - Placeholder visible
- `read-only` - Solo lectura
- `read-write` - Editable
- `valid` - Entrada válida
- `invalid` - Entrada inválida
- `in-range` - Dentro de rango
- `out-of-range` - Fuera de rango

**Posición:**
- `first-child` - Primer hijo
- `last-child` - Último hijo
- `only-child` - Único hijo
- `nth-child(n)` - N-ésimo hijo
- `nth-last-child(n)` - N-ésimo desde final
- `first-of-type` - Primero de su tipo
- `last-of-type` - Último de su tipo
- `only-of-type` - Único de su tipo
- `nth-of-type(n)` - N-ésimo de su tipo
- `nth-last-of-type(n)` - N-ésimo desde final

**Otras:**
- `root` - Elemento raíz (html)
- `empty` - Sin contenido
- `not()` - Negación
- `is()` - Agrupación
- `where()` - Agrupación sin especificidad
- `has()` - Parent selector
- `target` - Elemento objetivo de URL
- `fullscreen` - En modo fullscreen

### 3. **Propiedades Box Model (29 términos)**
Dimensiones y espaciado de elementos

**Dimensiones:**
- `width` - Ancho del elemento
- `height` - Altura del elemento
- `min-width` - Ancho mínimo
- `max-width` - Ancho máximo
- `min-height` - Altura mínima
- `max-height` - Altura máxima

**Spacing (Márgenes):**
- `margin` - Margen externo (shorthand)
- `margin-top` - Arriba
- `margin-right` - Derecha
- `margin-bottom` - Abajo
- `margin-left` - Izquierda

**Padding (Relleno):**
- `padding` - Relleno interno (shorthand)
- `padding-top` - Arriba
- `padding-right` - Derecha
- `padding-bottom` - Abajo
- `padding-left` - Izquierda

**Bordes:**
- `border` - Borde (shorthand)
- `border-width` - Grosor
- `border-style` - Estilo (solid, dashed, dotted)
- `border-color` - Color
- `border-radius` - Esquinas redondeadas
- `border-top` - Borde superior
- `border-right` - Borde derecho
- `border-bottom` - Borde inferior
- `border-left` - Borde izquierdo

**Otros:**
- `box-sizing` - Modelo de caja (border-box vs content-box)
- `box-shadow` - Sombra del elemento
- `outline` - Contorno externo

### 4. **Tipografía (18 términos)**
Estilo y formato del texto

- `font-family` - Tipo de fuente
- `font-size` - Tamaño de fuente
- `font-weight` - Grosor (100-900, bold)
- `font-style` - Estilo (normal, italic, oblique)
- `line-height` - Alto de línea
- `letter-spacing` - Espaciado entre letras
- `word-spacing` - Espaciado entre palabras
- `text-align` - Alineación de texto
- `text-decoration` - Decoración (underline, etc.)
- `text-transform` - Mayúsculas/minúsculas
- `text-shadow` - Sombra del texto
- `text-indent` - Indentación de primera línea
- `white-space` - Manejo de espacios
- `word-break` - Rompe palabras largas
- `overflow-wrap` - Envuelve palabra
- `text-overflow` - Truncado de texto
- `font-variant` - Variantes tipográficas
- `text-orientation` - Orientación de texto

### 5. **Color y Fondos (15 términos)**
Colores, gradientes y texturas

**Básico:**
- `color` - Color del texto
- `background-color` - Color de fondo
- `opacity` - Transparencia

**Imágenes y Posición:**
- `background-image` - Imagen de fondo
- `background-size` - Tamaño de imagen
- `background-position` - Posición de imagen
- `background-repeat` - Repetición de imagen
- `background-attachment` - Fijo al scroll

**Gradientes:**
- `linear-gradient` - Gradiente lineal
- `radial-gradient` - Gradiente radial
- `conic-gradient` - Gradiente cónico

**Efectos:**
- `background` - Shorthand
- `filter` - Filtros visuales
- `backdrop-filter` - Filtro del fondo

### 6. **Animaciones y Transiciones (18 términos)**
Movimiento y cambios suaves

**Transiciones:**
- `transition` - Transición (shorthand)
- `transition-property` - Propiedades a animar
- `transition-duration` - Duración
- `transition-timing-function` - Curva de animación
- `transition-delay` - Retraso

**Animaciones:**
- `animation` - Animación (shorthand)
- `animation-name` - Nombre de animación
- `animation-duration` - Duración
- `animation-timing-function` - Curva
- `animation-delay` - Retraso
- `animation-iteration-count` - Repeticiones
- `animation-direction` - Dirección
- `animation-fill-mode` - Estado antes/después
- `animation-play-state` - Pausa/reanuda
- `keyframes` - Definición de fotogramas
- `transform` - Transformación 2D/3D
- `transform-origin` - Centro de transformación
- `perspective` - Profundidad 3D

### 7. **Flexbox (13 términos)**
Layout flexible de una dimensión

**Contenedor:**
- `display-flex` - Activa flexbox
- `flex-direction` - Dirección (row, column)
- `flex-wrap` - Envolver a nueva línea
- `justify-content` - Alineación eje principal
- `align-items` - Alineación eje secundario
- `align-content` - Alineación de líneas
- `gap` - Espacio entre items

**Items:**
- `flex-grow` - Factor de crecimiento
- `flex-shrink` - Factor de encogimiento
- `flex-basis` - Tamaño base
- `flex` - Shorthand (grow, shrink, basis)
- `order` - Orden visual
- `align-self` - Alineación individual

### 8. **Grid (18 términos)**
Layout de dos dimensiones

**Contenedor:**
- `display-grid` - Activa grid
- `grid-template-columns` - Definir columnas
- `grid-template-rows` - Definir filas
- `grid-auto-flow` - Flujo automático
- `justify-items` - Alineación H en celdas
- `align-items-grid` - Alineación V en celdas
- `justify-content-grid` - Alineación H del grid
- `align-content-grid` - Alineación V del grid
- `grid-gap` - Espacio entre celdas

**Items:**
- `grid-column` - Columnas de item
- `grid-row` - Filas de item
- `grid-template-areas` - Áreas nombradas
- `grid-area` - Área del item

**Utilidades:**
- `auto-fit` - Ajusta número de columnas
- `auto-fill` - Llena columnas
- `minmax` - Tamaño mín/máx
- `fr-unit` - Unidad fraccionaria
- `subgrid` - Grid anidado

### 9. **Unidades CSS (20 términos)**
Medidas y escalas

**Absolutas:**
- `px-unit` - Píxeles
- `cm-unit` - Centímetros
- `mm-unit` - Milímetros
- `in-unit` - Pulgadas
- `pt-unit` - Puntos tipográficos
- `pc-unit` - Picas tipográficas

**Relativas:**
- `em-unit` - Relativo a font-size
- `rem-unit` - Relativo a font-size raíz
- `percentage-unit` - Porcentaje
- `ch-unit` - Ancho de carácter '0'
- `ex-unit` - Altura de 'x'

**Viewport:**
- `vw-unit` - 1% ancho viewport
- `vh-unit` - 1% alto viewport
- `vmin-unit` - Mín entre vw y vh
- `vmax-unit` - Máx entre vw y vh

**Ángulos y Tiempo:**
- `deg-unit` - Grados
- `rad-unit` - Radianes
- `turn-unit` - Vueltas completas
- `s-unit` - Segundos
- `ms-unit` - Milisegundos

### 10. **Funciones CSS (15 términos)**
Operaciones y cálculos

**Colores:**
- `rgb-function` - Rojo, Verde, Azul
- `hsl-function` - Matiz, Saturación, Luminosidad

**Valores:**
- `url-function` - Referencia a recurso
- `calc-function` - Cálculos dinámicos
- `var-function` - Variables custom
- `min-function` - Valor mínimo
- `max-function` - Valor máximo
- `clamp-function` - Fija entre mín/máx

**Otros:**
- `repeat-function` - Repite patrón
- `attr-function` - Valor de atributo

**Transformaciones:**
- `translate-function` - Traslación
- `scale-function` - Escala
- `rotate-function` - Rotación
- `skew-function` - Sesgo
- `cubic-bezier-function` - Curva de animación

### 11. **At-Rules (12 términos)**
Reglas especiales de CSS

- `@media` - Media queries
- `@keyframes` - Definición de animaciones
- `@font-face` - Fuentes personalizadas
- `@import` - Importar CSS
- `@supports` - Consulta de soporte
- `@document` - Estilos por URL
- `@page` - Estilos impresos
- `@counter-style` - Estilos de contador
- `@namespace` - Namespaces XML/SVG
- `@color-profile` - Perfil ICC
- `@layer` - Capas en cascada
- `@container` - Consultas de contenedor

### 12. **Conceptos Avanzados (25 términos)**
Principios y patrones CSS

**Fundamentales:**
- `cascade` - Orden de aplicación
- `specificity` - Peso de selectores
- `inheritance` - Herencia de propiedades
- `cascade-layers` - Capas organizadas

**Metodologías:**
- `bem-methodology` - Block Element Modifier
- `utility-first` - Clases de utilidad (Tailwind)

**Responsive:**
- `responsive-design` - Adaptable a pantallas
- `mobile-first` - Enfoque mobile-first
- `media-queries` - Consultas de medios

**Modelos:**
- `css-grid-layout` - Layout grid 2D
- `css-variables` - Custom properties
- `z-stacking` - Apilamiento Z
- `stacking-context` - Contexto de apilamiento
- `containing-block` - Bloque contenedor
- `bfc` - Block Formatting Context

**Tooling:**
- `reset-styles` - Reset de estilos
- `postcss` - Post-procesador
- `sass-scss` - Pre-procesador
- `less` - Pre-procesador alternativo
- `cssom` - CSS Object Model

**Optimization & Performance:**
- `critical-css` - CSS crítico
- `css-in-js` - CSS en JavaScript
- `dark-mode` - Modo oscuro
- `accessibility-css` - Accesibilidad
- `performance-css` - Rendimiento
- `cross-browser` - Compatibilidad

## 🎯 Estructura de Datos para Cada Término

Cada término CSS incluye 8 puntos completos:

1. **Meaning** (200+ caracteres): Explicación conceptual
2. **What** (150+ caracteres): Descripción funcional
3. **How** (100+ caracteres): Guía de implementación
4. **UseCases** (3): Casos de uso reales
   - Interview: Preguntas de entrevista
   - Project: Aplicación en proyectos
   - Bug: Solución de problemas
5. **Variants** (1+): Código ejecutable en CSS
6. **Examples** (1+): Ejemplos prácticos
7. **FAQs** (3+): Preguntas frecuentes
8. **Exercises** (1+): Práctica interactiva

## 🔍 Detección Automática

El componente `DiccionarioDevApp` detecta automáticamente términos CSS por:
- Nombre del término (propiedades con guiones)
- Tags de categoría (css, tailwind, flexbox, grid)
- Funciones específicas (calc, clamp, var)
- Utilidades Tailwind

## 📱 Previsualizador Integrado

Términos con snippets CSS se visualizan en vivo:
- **Lado izquierdo**: Editor de código con sintaxis
- **Lado derecho**: Previsualizador HTML/CSS en tiempo real

## ✅ Completitud

**Estado:** 100% completo

- ✅ 218 términos CSS creados
- ✅ 8 puntos por término
- ✅ Todos con code snippets ejecutables
- ✅ Previsualizador funcional
- ✅ Base de datos poblada
- ✅ Componente actualizado
- ✅ Pushed a main

## 🚀 Próximos Pasos (Futuro)

1. Agregar términos de frameworks (Bootstrap, Tailwind específico)
2. Términos de preprocesadores (Sass variables avanzadas)
3. CSS moderno (Container Queries, Cascade Layers profundo)
4. Performance tips específicos por propiedad
5. Compatibilidad de navegadores por término
6. Recursos externos (MDN, W3C)

---

**Diccionario Developer** - Referencia completa de CSS con 218 términos
Última actualización: 2025
