import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// --- GENERADORES EXISTENTES ---

function getGridExample(className: string) {
  const isItemClass = className.includes('col-span') || className.includes('row-span') || className.startsWith('place-self') || className.startsWith('self-');
  
  if (isItemClass) {
    return `<div class="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
  <div class="${className} bg-indigo-500 text-white p-4 rounded shadow flex items-center justify-center font-bold">Target</div>
  <div class="bg-indigo-200 text-indigo-700 p-4 rounded shadow flex items-center justify-center">02</div>
  <div class="bg-indigo-200 text-indigo-700 p-4 rounded shadow flex items-center justify-center">03</div>
  <div class="bg-indigo-200 text-indigo-700 p-4 rounded shadow flex items-center justify-center">04</div>
  <div class="bg-indigo-200 text-indigo-700 p-4 rounded shadow flex items-center justify-center">05</div>
  <div class="bg-indigo-200 text-indigo-700 p-4 rounded shadow flex items-center justify-center">06</div>
</div>`;
  }

  let containerClasses = "grid gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200";
  if (!className.includes('grid-cols-')) {
    containerClasses += " grid-cols-3";
  }
  if (className.includes('items-') || className.includes('content-') || className.includes('place-')) {
    containerClasses += " h-64";
  }

  return `<div class="${containerClasses} ${className}">
  <div class="bg-indigo-500 text-white p-4 rounded shadow flex items-center justify-center">01</div>
  <div class="bg-indigo-500 text-white p-4 rounded shadow flex items-center justify-center">02</div>
  <div class="bg-indigo-500 text-white p-4 rounded shadow flex items-center justify-center">03</div>
  <div class="bg-indigo-500 text-white p-4 rounded shadow flex items-center justify-center">04</div>
  <div class="bg-indigo-500 text-white p-4 rounded shadow flex items-center justify-center">05</div>
  <div class="bg-indigo-500 text-white p-4 rounded shadow flex items-center justify-center">06</div>
</div>`;
}

function getFlexExample(className: string) {
  const isItemClass = className.startsWith('flex-') || className.startsWith('grow') || className.startsWith('shrink') || className.startsWith('basis') || className.startsWith('self-') || className.startsWith('order-');

  if (isItemClass) {
    return `<div class="flex gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
  <div class="${className} bg-sky-500 text-white p-4 rounded shadow flex items-center justify-center font-bold">Target</div>
  <div class="flex-none bg-sky-200 text-sky-700 p-4 rounded shadow flex items-center justify-center">02</div>
  <div class="flex-none bg-sky-200 text-sky-700 p-4 rounded shadow flex items-center justify-center">03</div>
</div>`;
  }

  let containerClasses = "flex gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200";
  if (className.includes('items-') || className.includes('content-') || className.includes('justify-')) {
    containerClasses += " h-64";
  }
  if (className.includes('content-')) {
    containerClasses += " flex-wrap";
  }

  return `<div class="${containerClasses} ${className}">
  <div class="p-4 bg-sky-500 text-white rounded shadow">01</div>
  <div class="p-4 bg-sky-500 text-white rounded shadow">02</div>
  <div class="p-4 bg-sky-500 text-white rounded shadow">03</div>
</div>`;
}

function getTypographyExample(className: string) {
  return `<div class="bg-white p-8 rounded-lg shadow border border-slate-200 max-w-md mx-auto">
  <span class="text-slate-400 text-xs font-mono mb-2 block">.${className}</span>
  <p class="${className} text-slate-800">
    The quick brown fox jumps over the lazy dog.
  </p>
  <p class="mt-4 text-slate-500 text-sm">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  </p>
</div>`;
}

function getColorExample(className: string) {
  if (className.startsWith('bg-')) {
    return `<div class="grid grid-cols-1 gap-4">
  <div class="${className} h-24 rounded-lg shadow-lg flex items-center justify-center text-white font-bold border border-slate-200">
    .${className}
  </div>
</div>`;
  }
  if (className.startsWith('text-')) {
    return `<div class="bg-white p-6 rounded-lg shadow border border-slate-200 text-center">
  <p class="${className} text-4xl font-bold">Aa</p>
  <p class="${className} mt-2 font-medium">The quick brown fox</p>
</div>`;
  }
  if (className.startsWith('border-') || className.startsWith('divide-') || className.startsWith('ring-')) {
    return `<div class="bg-white p-8 rounded-lg shadow border border-slate-200 flex justify-center">
  <div class="${className} border-4 w-24 h-24 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
    Box
  </div>
</div>`;
  }
  return `<div class="${className} p-4">Ejemplo de color</div>`;
}

function getSizingExample(className: string) {
  return `<div class="bg-slate-50 p-8 rounded-lg border border-slate-200 overflow-hidden">
  <div class="${className} bg-indigo-500 text-white rounded shadow flex items-center justify-center p-2 min-h-12 min-w-12">
    <span class="text-xs">${className}</span>
  </div>
</div>`;
}

function getSpacingExample(className: string) {
  if (className.startsWith('m')) {
    return `<div class="bg-slate-200 rounded-lg border border-slate-300 inline-block">
  <div class="${className} bg-indigo-500 text-white rounded shadow p-4">
    Elemento con margen
  </div>
</div>`;
  }
  if (className.startsWith('p')) {
    return `<div class="${className} bg-indigo-500 text-white rounded shadow border border-indigo-600 inline-block">
  Contenido con padding
</div>`;
  }
  return getSizingExample(className);
}

function getEffectExample(className: string) {
  return `<div class="bg-slate-50 p-12 rounded-lg border border-slate-200 flex justify-center">
  <div class="${className} w-32 h-32 bg-white rounded-lg flex items-center justify-center text-slate-500 font-medium">
    Efecto
  </div>
</div>`;
}

function getTransformExample(className: string) {
  return `<div class="bg-slate-50 p-12 rounded-lg border border-slate-200 flex justify-center overflow-hidden">
  <div class="${className} w-24 h-24 bg-indigo-500 rounded-lg shadow-lg flex items-center justify-center text-white">
    Transform
  </div>
</div>`;
}

// --- NUEVOS GENERADORES ---

function getDirectiveExample(term: string) {
  return `<div class="bg-slate-900 text-slate-300 p-6 rounded-lg font-mono text-sm shadow-lg">
  <span class="text-purple-400">${term}</span>;
  <br>
  <span class="text-slate-500">// Directiva de configuración Tailwind</span>
</div>`;
}

function getPseudoClassExample(term: string) {
  // hover, focus, active, etc.
  const pseudo = term.replace(':', '');
  return `<div class="bg-white p-8 rounded-lg shadow border border-slate-200 flex justify-center">
  <button class="bg-indigo-500 ${term}:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300">
    Interactúa conmigo (${pseudo})
  </button>
</div>`;
}

function getResponsiveExample(term: string) {
  // sm, md, lg, xl, 2xl
  return `<div class="bg-white p-8 rounded-lg shadow border border-slate-200 text-center">
  <div class="bg-indigo-200 text-indigo-800 p-4 rounded mb-4">
    Redimensiona la ventana
  </div>
  <div class="bg-red-500 ${term}:bg-green-500 text-white p-4 rounded font-bold transition-colors duration-500">
    Rojo por defecto / Verde en ${term}
  </div>
</div>`;
}

function getDarkModeExample(term: string) {
  return `<div class="p-8 rounded-lg shadow border border-slate-200 text-center bg-white dark:bg-slate-800 transition-colors duration-300">
  <p class="text-slate-900 dark:text-white font-bold text-xl">Modo Oscuro</p>
  <p class="text-slate-500 dark:text-slate-400 mt-2">
    Cambia el tema del sistema o añade la clase 'dark' al padre.
  </p>
</div>`;
}

function getAccessibilityExample(term: string) {
  if (term === 'sr-only') {
    return `<div class="bg-white p-6 rounded-lg shadow border border-slate-200">
  <p>El siguiente texto está oculto visualmente pero disponible para screen readers:</p>
  <span class="sr-only">Este texto solo lo leen los lectores de pantalla.</span>
  <div class="mt-2 p-2 bg-slate-100 rounded text-xs text-slate-500">
    (Inspecciona el elemento para verlo en el DOM)
  </div>
</div>`;
  }
  return `<div class="bg-white p-6 rounded-lg shadow border border-slate-200">
  <button class="${term} bg-slate-200 p-2 rounded">Botón Accesible</button>
</div>`;
}

function getLayoutMiscExample(term: string) {
  // z-index, position, overflow, etc.
  if (term.startsWith('z-')) {
    return `<div class="relative h-32 bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-center items-center">
  <div class="z-0 absolute w-16 h-16 bg-indigo-300 rounded-full -ml-8"></div>
  <div class="${term} absolute w-16 h-16 bg-indigo-500 rounded-full shadow-lg flex items-center justify-center text-white font-bold border-2 border-white">
    ${term}
  </div>
  <div class="z-0 absolute w-16 h-16 bg-indigo-300 rounded-full -mr-8"></div>
</div>`;
  }
  
  if (term.startsWith('overflow-')) {
    return `<div class="${term} h-24 w-48 bg-white border border-slate-200 rounded p-4 shadow">
  <p class="w-64">Este contenido es más ancho que el contenedor para demostrar el comportamiento de desbordamiento.</p>
</div>`;
  }

  if (term.includes('cursor-')) {
    return `<div class="${term} bg-indigo-50 p-8 rounded-lg border border-indigo-100 flex items-center justify-center text-indigo-700 font-medium hover:bg-indigo-100 transition-colors min-h-12 min-w-12">
      Pasa el mouse aquí (${term})
    </div>`;
  }

  if (term.includes('select-')) {
    return `<div class="${term} bg-white p-6 rounded-lg shadow border border-slate-200">
      <p>Intenta seleccionar este texto (${term}).</p>
    </div>`;
  }

  if (term.startsWith('object-')) {
    return `<div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
      <img src="https://images.unsplash.com/photo-1554629947-334ff61d85dc?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=320&h=320&q=80" 
           class="${term} w-32 h-32 bg-slate-300 rounded border border-slate-400" alt="Example">
    </div>`;
  }

  return `<div class="${term} bg-indigo-100 p-4 rounded border border-indigo-200 text-indigo-800">
    Elemento con clase ${term}
  </div>`;
}

function getPluginExample(term: string) {
  return `<div class="bg-slate-900 text-slate-300 p-6 rounded-lg font-mono text-sm shadow-lg">
  <span class="text-slate-500">// tailwind.config.js</span><br>
  module.exports = {<br>
  &nbsp;&nbsp;plugins: [<br>
  &nbsp;&nbsp;&nbsp;&nbsp;<span class="text-purple-400">require('@tailwindcss/${term}')</span>,<br>
  &nbsp;&nbsp;],<br>
  }
</div>`;
}

function generateVisualExample(term: string): string | null {
  // Directivas (@tailwind, @apply, etc)
  if (term.startsWith('@')) {
    return getDirectiveExample(term);
  }

  // Configuración (theme, content, extend)
  if (['theme', 'content', 'extend', 'darkMode', 'variants', 'important', 'corePlugins', 'safelist', 'screens', 'colors', 'spacing', 'fontFamily', 'fontSize', 'borderRadius', 'boxShadow', 'backgroundImage', 'presets', 'prefix', 'separator'].includes(term)) {
    return `<div class="bg-slate-800 text-slate-300 p-4 rounded-lg font-mono text-xs">
  // tailwind.config.js
  module.exports = {
    <span class="text-purple-400">${term}</span>: { ... }
  }
</div>`;
  }

  // Plugins
  if (['typography', 'forms', 'aspect-ratio', 'line-clamp', 'scrollbar', 'container-queries'].includes(term) || term === 'aspectRatio' || term === 'lineClamp') {
    return getPluginExample(term.replace(/[A-Z]/g, m => "-" + m.toLowerCase()));
  }

  // Pseudo-clases / Variantes
  if (['hover', 'focus', 'active', 'visited', 'disabled', 'checked', 'first', 'last', 'odd', 'even', 'empty', 'group-hover', 'peer-hover', 'focus-visible', 'focus-within', 'invalid', 'valid', 'required', 'optional', 'read-only', 'target', 'indeterminate', 'default', 'autofill', 'placeholder-shown', 'read-write', 'open', 'group-focus', 'peer-focus', 'group-active', 'peer-active'].includes(term)) {
    return getPseudoClassExample(term);
  }

  // Variantes de Medios / Dirección
  if (['rtl', 'ltr', 'portrait', 'landscape', 'motion-safe', 'motion-reduce', 'print'].includes(term)) {
    return getResponsiveExample(term);
  }

  // Pseudo-elementos
  if (['after', 'before', 'placeholder', 'file', 'marker', 'selection', 'backdrop', 'first-letter', 'first-line'].includes(term)) {
    return `<div class="bg-white p-8 rounded-lg shadow border border-slate-200 text-center">
  <p class="${term}:bg-yellow-200 ${term}:text-slate-900">
    Ejemplo de pseudo-elemento <span class="font-bold text-indigo-600">${term}</span>
  </p>
</div>`;
  }

  // Responsive
  if (['sm', 'md', 'lg', 'xl', '2xl'].includes(term)) {
    return getResponsiveExample(term);
  }

  // Dark Mode
  if (term === 'dark') {
    return getDarkModeExample(term);
  }

  // Accesibilidad
  if (term.startsWith('aria-') || term === 'sr-only' || term === 'not-sr-only') {
    return getAccessibilityExample(term);
  }

  // Layout Misc
  if (term.startsWith('z-') || term.startsWith('overflow-') || term.startsWith('cursor-') || term.startsWith('select-') || term.startsWith('pointer-events-') || term.startsWith('resize') || term.startsWith('object-') || term.startsWith('inset-') || term.startsWith('top-') || term.startsWith('bottom-') || term.startsWith('left-') || term.startsWith('right-') || term.startsWith('visible') || term.startsWith('invisible') || term.startsWith('collapse') || term.startsWith('box-') || term.startsWith('float-') || term.startsWith('clear-') || term.startsWith('overscroll-') || term.startsWith('isolate') || term.startsWith('isolation') || term.startsWith('mix-blend') || term.startsWith('bg-blend')) {
    return getLayoutMiscExample(term);
  }

  // Display
  if (['block', 'inline-block', 'inline', 'contents', 'flow-root', 'hidden', 'table', 'table-caption', 'table-cell', 'table-column', 'table-column-group', 'table-footer-group', 'table-header-group', 'table-row-group', 'table-row'].includes(term)) {
    return `<div class="bg-slate-50 p-4 rounded border border-slate-200">
      <div class="${term} bg-indigo-500 text-white p-2 rounded">Elemento ${term}</div>
      <div class="${term} bg-indigo-400 text-white p-2 rounded">Elemento ${term}</div>
    </div>`;
  }

  // --- Lógica anterior ---
  if (term.includes('grid') || term.includes('col-') || term.includes('cols-') || term.includes('row-') || term.includes('rows-') || term.includes('gap-') || term.startsWith('place-') || term.startsWith('justify-items') || term.startsWith('align-content')) return getGridExample(term);
  if (term.includes('flex') || term.startsWith('items-') || term.startsWith('justify-') || term.startsWith('content-') || term.startsWith('self-') || term.startsWith('order-') || term.startsWith('grow') || term.startsWith('shrink') || term.startsWith('basis')) return getFlexExample(term);
  if (term.startsWith('text-') && !term.match(/text-(white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-/)) return getTypographyExample(term);
  if (term.startsWith('font-') || term.startsWith('tracking-') || term.startsWith('leading-') || term.startsWith('align-') || term.startsWith('decoration-') || term.startsWith('uppercase') || term.startsWith('lowercase') || term.startsWith('capitalize') || term.startsWith('italic') || term.startsWith('not-italic') || term.startsWith('whitespace-') || term.startsWith('break-') || term.startsWith('list-') || term === 'underline' || term === 'overline' || term === 'line-through' || term === 'no-underline' || term === 'antialiased' || term === 'subpixel-antialiased' || term === 'truncate') return getTypographyExample(term);
  if (term.startsWith('bg-') || term.startsWith('text-') || term.startsWith('border-') || term.startsWith('ring-') || term.startsWith('divide-') || term.startsWith('from-') || term.startsWith('via-') || term.startsWith('to-') || term.startsWith('outline-') || term.startsWith('accent-') || term.startsWith('caret-')) return getColorExample(term);
  if (term.startsWith('w-') || term.startsWith('h-') || term.startsWith('min-w') || term.startsWith('max-w') || term.startsWith('min-h') || term.startsWith('max-h')) return getSizingExample(term);
  if (term.startsWith('m') || term.startsWith('p') || term.startsWith('-m') || term.startsWith('space-')) return getSpacingExample(term);
  if (term.startsWith('rounded')) return `<div class="bg-slate-50 p-8 flex justify-center"><div class="${term} w-32 h-32 bg-indigo-500 shadow-lg flex items-center justify-center text-white">Rounded</div></div>`;
  if (term.startsWith('shadow') || term.startsWith('opacity') || term.startsWith('blur') || term.startsWith('brightness') || term.startsWith('contrast') || term.startsWith('grayscale') || term.startsWith('hue-rotate') || term.startsWith('invert') || term.startsWith('saturate') || term.startsWith('sepia') || term.startsWith('drop-shadow') || term.startsWith('mix-blend-') || term.startsWith('bg-blend-')) return getEffectExample(term);
  if (term.startsWith('scale') || term.startsWith('rotate') || term.startsWith('translate') || term.startsWith('skew') || term.startsWith('origin')) return getTransformExample(term);
  if (term.startsWith('transition') || term.startsWith('duration') || term.startsWith('ease') || term.startsWith('delay') || term.startsWith('animate')) return `<div class="bg-white p-8 rounded-lg shadow border border-slate-200 flex justify-center"><div class="${term} w-24 h-24 bg-indigo-500 rounded hover:bg-indigo-700 hover:scale-110">Hover me</div></div>`;
  if (term.startsWith('columns-')) return `<div class="${term} gap-4 bg-slate-50 p-4 rounded border border-slate-200"><div class="bg-indigo-500 text-white p-4 mb-4 rounded">01</div><div class="bg-indigo-500 text-white p-4 mb-4 rounded">02</div><div class="bg-indigo-500 text-white p-4 mb-4 rounded">03</div><div class="bg-indigo-500 text-white p-4 mb-4 rounded">04</div></div>`;

  return null;
}

async function updateTailwindExamples() {
  console.log("🎨 Actualizando ejemplos visuales de Tailwind (Fase 2 - Cobertura Completa)...\n");

  const allTerms = await prisma.term.findMany({
    where: {
      tags: {
        array_contains: "tailwind"
      }
    }
  });

  console.log(`Encontrados ${allTerms.length} términos de Tailwind.`);

  let updatedCount = 0;
  const missingTerms: string[] = [];

  for (const term of allTerms) {
    const visualCode = generateVisualExample(term.term);

    if (visualCode) {
      const newExample = {
        code: visualCode,
        title: "Vista Previa",
        language: "html",
        explanation: `Demostración visual de la clase ${term.term}`
      };

      const updatedExamples = [newExample];

      await prisma.term.update({
        where: { id: term.id },
        data: {
          examples: updatedExamples
        }
      });
      
      updatedCount++;
    } else {
      missingTerms.push(term.term);
    }
  }

  console.log(`\n✨ Actualizados ${updatedCount} términos con ejemplos visuales ricos.`);
  
  if (missingTerms.length > 0) {
    console.log(`\n⚠️ Faltaron ${missingTerms.length} términos por cubrir. Muestra:`);
    missingTerms.slice(0, 20).forEach(t => console.log(`   - ${t}`));
  }

  await prisma.$disconnect();
}

updateTailwindExamples();
