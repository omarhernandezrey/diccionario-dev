import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const terms = [
  // GLOBAL ATTRIBUTES (15)
  { term: "id", meaning: "Identificador único del elemento", what: "ID único para referenciar", how: "id='miId' para seleccionar con CSS/JS", snippet: `<div id='contenedor'>Contenido</div>` },
  { term: "class", meaning: "Clases CSS para aplicar estilos", what: "Aplicar estilos a grupo de elementos", how: "class='miClase' para CSS", snippet: `<p class='parrafo rojo'>Texto</p>` },
  { term: "style-attribute", meaning: "Estilos CSS inline directos", what: "CSS aplicado directamente al elemento", how: "style='color: red; font-size: 16px;'", snippet: `<span style='color: blue;'>Azul</span>` },
  { term: "title-attribute", meaning: "Tooltip mostrado al pasar el mouse", what: "Información adicional en tooltip", how: "title='Aquí va el tooltip'", snippet: `<button title='Haz click aquí'>Botón</button>` },
  { term: "lang", meaning: "Idioma del contenido", what: "Define idioma para navegador", how: "lang='es' para español", snippet: `<html lang='es'><body>...</body></html>` },
  { term: "dir", meaning: "Dirección del texto (LTR o RTL)", what: "Dirección izquierda-derecha o árabe", how: "dir='rtl' para derecha-izquierda", snippet: `<p dir='rtl'>النص العربي</p>` },
  { term: "hidden", meaning: "Oculta elemento del documento", what: "El elemento no se muestra", how: "hidden o hidden='hidden'", snippet: `<div hidden>No visible</div>` },
  { term: "tabindex", meaning: "Orden de tabulación con Tab", what: "Define orden del tabulador", how: "tabindex='1' para primer orden", snippet: `<input tabindex='1'><input tabindex='2'>` },
  { term: "draggable", meaning: "Permite arrastrar el elemento", what: "Elemento es arrastra ble", how: "draggable='true' para activar", snippet: `<div draggable='true'>Arrastra</div>` },
  { term: "contenteditable", meaning: "El contenido es editable", what: "Permite editar texto en navegador", how: "contenteditable='true'", snippet: `<div contenteditable='true'>Edita esto</div>` },
  { term: "spellcheck", meaning: "Verificación ortográfica", what: "Activar/desactivar spell check", how: "spellcheck='true' o 'false'", snippet: `<textarea spellcheck='true'></textarea>` },
  { term: "translate", meaning: "Si se traduce con Google Translate", what: "Controla traducción automática", how: "translate='no' para no traducir", snippet: `<p translate='no'>No traduzca</p>` },
  { term: "accesskey", meaning: "Tecla de acceso rápido", what: "Atajo de teclado para elemento", how: "accesskey='s' para Alt+S", snippet: `<button accesskey='s'>Guardar</button>` },
  { term: "role", meaning: "Rol semántico para accesibilidad", what: "Define rol del elemento para A11y", how: "role='button' para botón accesible", snippet: `<div role='button' tabindex='0'>Click</div>` },
  { term: "part", meaning: "Define parte de Web Component", what: "Expone partes internas de componente", how: "part='header'", snippet: `<div part='header'>Encabezado</div>` },

  // ARIA ATTRIBUTES (10)
  { term: "aria-label", meaning: "Nombre accesible del elemento", what: "Descripción para lectores de pantalla", how: "aria-label='Cerrar'", snippet: `<button aria-label='Cerrar modal'>×</button>` },
  { term: "aria-labelledby", meaning: "Vincula a elemento que lo etiqueta", what: "Referencia a ID del etiqueta", how: "aria-labelledby='id-label'", snippet: `<h2 id='titulo'>Título</h2><div aria-labelledby='titulo'>` },
  { term: "aria-hidden", meaning: "Oculta del árbol de accesibilidad", what: "No accesible a lectores de pantalla", how: "aria-hidden='true'", snippet: `<div aria-hidden='true'>Decorativo</div>` },
  { term: "aria-role", meaning: "Define rol ARIA del elemento", what: "Especifica rol semántico", how: "role='alert' para alerta", snippet: `<div role='alert'>¡Advertencia!</div>` },
  { term: "aria-expanded", meaning: "Si contenido expandible está abierto", what: "Indica estado expandido/colapsado", how: "aria-expanded='true/false'", snippet: `<button aria-expanded='false'>Más</button>` },
  { term: "aria-controls", meaning: "Controla elemento especificado", what: "Vincula control con contenido", how: "aria-controls='panel-id'", snippet: `<button aria-controls='panel'>Toggle</button><div id='panel'>` },
  { term: "aria-describedby", meaning: "Descripción larga del elemento", what: "Referencia a descripción extendida", how: "aria-describedby='desc-id'", snippet: `<img aria-describedby='desc'><span id='desc'>Descripción</span>` },
  { term: "aria-selected", meaning: "Si opción está seleccionada", what: "Indica selección en lista", how: "aria-selected='true'", snippet: `<option aria-selected='true'>Opción 1</option>` },
  { term: "aria-disabled", meaning: "Si elemento está deshabilitado", what: "Indica deshabilitación", how: "aria-disabled='true'", snippet: `<button aria-disabled='true'>Deshabilitado</button>` },
  { term: "aria-modal", meaning: "Si diálogo es modal", what: "Indica modal bloqueante", how: "aria-modal='true'", snippet: `<div role='dialog' aria-modal='true'>` },

  // MORE ARIA (5)
  { term: "aria-live", meaning: "Notifica cambios de contenido", what: "Anuncia actualizaciones dinámicas", how: "aria-live='polite' o 'assertive'", snippet: `<div aria-live='polite'>Contenido actualiza</div>` },
  { term: "aria-busy", meaning: "Si elemento está cargando", what: "Indica estado de carga", how: "aria-busy='true'", snippet: `<div aria-busy='true'>Cargando...</div>` },

  // COMMON ATTRIBUTES (8)
  { term: "href", meaning: "URL destino del enlace", what: "Dirección del enlace", how: "href='https://ejemplo.com'", snippet: `<a href='https://google.com'>Google</a>` },
  { term: "src", meaning: "Fuente del recurso (imagen, script, etc)", what: "Ruta del archivo", how: "src='imagen.jpg'", snippet: `<img src='foto.jpg' alt='Foto'>` },
  { term: "alt", meaning: "Texto alternativo para imagen", what: "Descripción para imagen", how: "alt='Descripción de la imagen'", snippet: `<img src='pic.jpg' alt='Logo de empresa'>` },
  { term: "placeholder", meaning: "Texto de ayuda en input", what: "Sugerencia en campo de entrada", how: "placeholder='Ingrese su nombre'", snippet: `<input placeholder='Nombre completo'>` },
  { term: "value", meaning: "Valor del elemento (input, option)", what: "Valor inicial o enviado", how: "value='contenido'", snippet: `<input value='valor inicial'>` },
  { term: "name", meaning: "Nombre del elemento para formulario", what: "Nombre de campo en submit", how: "name='email'", snippet: `<input name='correo' type='email'>` },
  { term: "maxlength", meaning: "Máximo caracteres permitidos", what: "Limita longitud de texto", how: "maxlength='50'", snippet: `<input maxlength='20' placeholder='Max 20 chars'>` },
  { term: "minlength", meaning: "Mínimo caracteres requeridos", what: "Requiere longitud mínima", how: "minlength='3'", snippet: `<input minlength='3' required>` },

  // FORM ATTRIBUTES (8)
  { term: "required", meaning: "Campo es obligatorio", what: "Valida que no esté vacío", how: "required o required='required'", snippet: `<input type='email' required>` },
  { term: "readonly", meaning: "Campo no editable pero visible", what: "Solo lectura, sin edición", how: "readonly o readonly='readonly'", snippet: `<input value='No editable' readonly>` },
  { term: "disabled", meaning: "Elemento está deshabilitado", what: "No interactuable, grisado", how: "disabled", snippet: `<button disabled>Deshabilitado</button>` },
  { term: "autocomplete", meaning: "Autocompletado de navegador", what: "Permite autocompletado", how: "autocomplete='on' o 'off'", snippet: `<input type='email' autocomplete='on'>` },
  { term: "autofocus", meaning: "Foco automático al cargar", what: "El input obtiene foco", how: "autofocus", snippet: `<input autofocus placeholder='Enfocado'>` },
  { term: "multiple", meaning: "Permite múltiples selecciones", what: "Seleccionar varios en select", how: "multiple", snippet: `<select multiple><option>A</option></select>` },
  { term: "checked", meaning: "Checkbox/radio preseleccionado", what: "Seleccionado por defecto", how: "checked", snippet: `<input type='checkbox' checked>` },
  { term: "selected", meaning: "Opción preseleccionada en select", what: "Opción por defecto", how: "selected", snippet: `<option selected>Opción 1</option>` },

  // EVENT HANDLERS (sample - 8 importantes)
  { term: "onclick", meaning: "Evento de click del mouse", what: "Ejecutar código al hacer click", how: "onclick='funcionJS()'", snippet: `<button onclick='alert(\"Click!\")'>Botón</button>` },
  { term: "onchange", meaning: "Evento de cambio de valor", what: "Ejecutar cuando cambia valor", how: "onchange='procesar()'", snippet: `<select onchange='cambio()'><option>Opción</option></select>` },
  { term: "oninput", meaning: "Evento mientras escribe usuario", what: "En tiempo real mientras tipea", how: "oninput='validar()'", snippet: `<input oninput='mostrarCaracteres()'>` },
  { term: "onsubmit", meaning: "Evento al enviar formulario", what: "Ejecutar al hacer submit", how: "onsubmit='validarForm()'", snippet: `<form onsubmit='return validar()'>` },
  { term: "onfocus", meaning: "Evento cuando elemento obtiene foco", what: "Ejecutar al enfocar elemento", how: "onfocus='alerta()'", snippet: `<input onfocus='this.select()'>` },
  { term: "onblur", meaning: "Evento cuando elemento pierde foco", what: "Ejecutar al desenfocarse", how: "onblur='validar()'", snippet: `<input onblur='chequearVacio()'>` },
  { term: "onload", meaning: "Evento cuando página/imagen carga", what: "Ejecutar cuando termina carga", how: "onload='inicio()'", snippet: `<body onload='init()'></body>` },
  { term: "onerror", meaning: "Evento cuando hay error", what: "Ejecutar si hay error", how: "onerror='manejarError()'", snippet: `<img src='pic.jpg' onerror='noEncontrada()'>` },

  // HTML CONCEPTS (8)
  { term: "doctype", meaning: "Declaración del tipo de documento", what: "Define versión HTML", how: "<!DOCTYPE html> al inicio", snippet: `<!DOCTYPE html>
<html>
<head><title>Página</title></head>
<body></body>
</html>` },
  { term: "html-entities", meaning: "Caracteres especiales codificados", what: "Representación de caracteres especiales", how: "&lt; &gt; &amp; &quot; &#169;", snippet: `<p>&lt;html&gt; es escrito como &amp;lt;html&amp;gt;</p>` },
  { term: "semantic-html", meaning: "HTML que comunica significado", what: "Usar etiquetas semánticas correctas", how: "<header>, <nav>, <main>, <footer>", snippet: `<header><h1>Título</h1></header>
<main><article>Contenido</article></main>` },
  { term: "dom", meaning: "Document Object Model - árbol de elementos", what: "Representación de documento en memoria", how: "Acceder via JavaScript", snippet: `<script>
  const elem = document.getElementById('id');
  elem.textContent = 'Nuevo contenido';
</script>` },
  { term: "shadow-dom", meaning: "DOM oculto para Web Components", what: "Encapsulación de estilos y estructura", how: "attachShadow(), shadowRoot", snippet: `<script>
  const shadow = element.attachShadow({mode: 'open'});
  shadow.appendChild(contenido);
</script>` },
  { term: "custom-elements", meaning: "Elementos HTML personalizados", what: "Crear elementos reutilizables", how: "customElements.define('mi-elemento', Clase)", snippet: `<script>
  class MiElemento extends HTMLElement {}
  customElements.define('mi-elemento', MiElemento);
</script>` },
  { term: "void-elements", meaning: "Etiquetas sin contenido cerrado", what: "Elementos que no tienen cierre", how: "<br>, <img>, <input>, <hr>", snippet: `<img src='foto.jpg'>
<input type='text'>
<br>` },
  { term: "block-elements", meaning: "Elementos que ocupan línea completa", what: "div, p, h1-h6, header, footer", how: "display: block en CSS", snippet: `<div style='display: block; width: 100%;'>
  Ocupa todo el ancho
</div>` },
];

async function create() {
  let c = 0;
  for (const t of terms) {
    try {
      const html = `<!DOCTYPE html>
<html>
<head><title>${t.term}</title></head>
<body>
  ${t.snippet}
</body>
</html>`;

      const term = await prisma.term.create({
        data: {
          term: t.term,
          translation: `HTML: ${t.term}`,
          meaning: t.meaning,
          what: t.what,
          how: t.how,
          category: "frontend",
          examples: [{ code: html, title: `${t.term}`, language: "html", explanation: "Demo" }]
        }
      });

      await prisma.termVariant.create({
        data: { termId: term.id, language: "html", snippet: html, level: "beginner", status: "approved" }
      });

      for (let i = 0; i < 3; i++) {
        const contexts = ["interview", "project", "bug"] as const;
        await prisma.useCase.create({
          data: {
            termId: term.id,
            context: contexts[i] as "interview" | "project" | "bug",
            summary: `Caso de uso ${i + 1}`,
            steps: ["Paso 1", "Paso 2"],
            tips: "Info"
          }
        });
      }

      for (let i = 0; i < 3; i++) {
        await prisma.faq.create({
          data: {
            termId: term.id,
            questionEs: `P${i + 1}`,
            answerEs: t.meaning,
            snippet: null
          }
        });
      }

      await prisma.exercise.create({
        data: {
          termId: term.id,
          titleEs: `Practica`,
          promptEs: `Usa ${t.term}`,
          difficulty: "easy",
          solutions: [{ title: "Solucion", code: html, explanation: "OK" }]
        }
      });

      c++;
      console.log(`✅ ${t.term}`);
    } catch (e) {
      console.log(`❌ ${t.term}`);
    }
  }
  console.log(`\n✅ Total: ${c}/${terms.length}`);
}

create().then(() => prisma.$disconnect());
