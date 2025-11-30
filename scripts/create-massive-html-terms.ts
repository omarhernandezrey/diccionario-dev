import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TermData {
  term: string;
  meaning: string;
  what: string;
  how: string;
  snippet: string;
}

const htmlTerms: TermData[] = [
  // TEXT AND FORMATTING (13 términos)
  {
    term: "strong",
    meaning: "La etiqueta <strong> define texto con fuerte importancia semántica. Se usa para marcar contenido crítico o muy importante. Los navegadores generalmente lo renderizan en negrita.",
    what: "Se utiliza para indicar que el contenido tiene importancia especial o crítica. Mejora la accesibilidad al comunicar semánticamente la importancia del texto.",
    how: "Envuelve el texto importante con <strong>. Úsala cuando el contenido sea crítico, no solo para negrita visual. Diferente de <b> que es solo estilo.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Importancia</title></head>
<body>
  <p>Este es un texto <strong>muy importante</strong> que necesita atención.</p>
  <p><strong>Advertencia:</strong> No ignores este mensaje.</p>
</body>
</html>`
  },
  {
    term: "em",
    meaning: "La etiqueta <em> define énfasis enfatizado. Marca contenido que se acentúa para cambiar el significado de la oración. Los navegadores generalmente lo renderizan en cursiva.",
    what: "Se utiliza para énfasis semántico que cambia el significado. Importante para lectores de pantalla que pueden cambiar el tono de voz.",
    how: "Envuelve texto que necesita énfasis con <em>. Úsala cuando el énfasis cambie el significado. Diferente de <i> que es solo estilo.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Énfasis</title></head>
<body>
  <p>Yo <em>realmente</em> disfruto programar.</p>
  <p><em>Por favor</em> hazlo correctamente.</p>
</body>
</html>`
  },
  {
    term: "b",
    meaning: "La etiqueta <b> define texto en negrita sin importancia semántica especial. Se usa puramente para destacado visual, no semántico. Equivalente a <strong> pero sin importancia.",
    what: "Se utiliza para negrita visual cuando no hay importancia semántica. Diferente de <strong> que es semánticamente importante.",
    how: "Usa <b> para destacado visual de palabras clave, nombres de productos o términos. No es semánticamente importante.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Bold</title></head>
<body>
  <p>El producto <b>SuperWidget</b> es el mejor.</p>
  <p>Los <b>términos técnicos</b> pueden ser complicados.</p>
</body>
</html>`
  },
  {
    term: "i",
    meaning: "La etiqueta <i> define texto en cursiva sin énfasis semántico especial. Se usa para cursiva visual, alternativamente para palabras en otros idiomas, términos técnicos o pensamiento.",
    what: "Se utiliza para cursiva visual cuando no hay énfasis semántico. Puede marcar palabras en otros idiomas, pensamientos o términos técnicos.",
    how: "Usa <i> para cursiva visual. Combinala con title para indicar idioma. Diferente de <em> que es semánticamente enfatizado.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Italic</title></head>
<body>
  <p>El término <i>lorem ipsum</i> es popular en diseño.</p>
  <p><i>Pensó: ¿qué debo hacer?</i></p>
</body>
</html>`
  },
  {
    term: "u",
    meaning: "La etiqueta <u> subraya texto. Se usa para marcar anotaciones, números, nombres propios o texto que requiere atención especial sin ser importante ni enfatizado.",
    what: "Se utiliza para subrayado visual de contenido específico. Cuidado: el subrayado tradicionalmente indica enlaces, así que úsalo con cuidado.",
    how: "Usa <u> para subrayar texto especial. Combina con CSS para cambiar estilo. Indica contenido que difiere del texto normal.",
    snippet: `<!DOCTYPE html>
<html>
<head>
  <title>Underline</title>
  <style>u { text-decoration: underline; text-decoration-style: wavy; }</style>
</head>
<body>
  <p>Este nombre <u>está subrayado</u> para énfasis.</p>
  <p>Usa <u>CSS</u> para personalizar el estilo.</p>
</body>
</html>`
  },
  {
    term: "mark",
    meaning: "La etiqueta <mark> destaca texto como marcado o resaltado. Se usa para indicar relevancia o coincidencias en búsquedas. Los navegadores generalmente lo renderizan con fondo amarillo.",
    what: "Se utiliza para marcar/resaltar texto relevante. Común en resultados de búsqueda o texto importante que necesita atención visual.",
    how: "Envuelve texto que necesita resaltado con <mark>. Personaliza el color con CSS. Ideal para resultados de búsqueda.",
    snippet: `<!DOCTYPE html>
<html>
<head>
  <title>Mark/Highlight</title>
  <style>mark { background-color: yellow; padding: 2px; }</style>
</head>
<body>
  <p>Resultados para <mark>HTML</mark>:</p>
  <p><mark>HTML</mark> es el lenguaje de marcado para web.</p>
</body>
</html>`
  },
  {
    term: "small",
    meaning: "La etiqueta <small> define texto pequeño o comentarios secundarios. Reduce semánticamente la importancia del contenido. Usado para letra pequeña, avisos legales o comentarios.",
    what: "Se utiliza para contenido secundario o de menor importancia. Cambiar el tamaño visualmente y comunicar importancia reducida.",
    how: "Usa <small> para avisos legales, comentarios, términos. Combina con <strong> para 'letra pequeña importante'.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Small</title></head>
<body>
  <p>Compra ahora <small>(sujeto a términos y condiciones)</small></p>
  <p><small>© 2025 Mi Empresa</small></p>
</body>
</html>`
  },
  {
    term: "del",
    meaning: "La etiqueta <del> define texto eliminado o tachado. Indica contenido que fue removido o ya no es válido. Generalmente aparece con una línea a través.",
    what: "Se utiliza para marcar texto eliminado o reemplazado. Importante para historial de cambios y documentos con versiones.",
    how: "Envuelve texto eliminado con <del>. Combina con <ins> para mostrar cambios. Usa datetime y cite para documentar cambios.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Deleted</title></head>
<body>
  <p>El precio era <del datetime="2025-11-01">$100</del> 
     <ins>$80</ins></p>
  <p><del>Texto antiguo</del> ha sido reemplazado.</p>
</body>
</html>`
  },
  {
    term: "ins",
    meaning: "La etiqueta <ins> define texto insertado o añadido. Marca contenido nuevo o actualizado. Generalmente aparece subrayado.",
    what: "Se utiliza para marcar texto insertado o actualizado. Importante para documentar cambios y versiones.",
    how: "Envuelve texto nuevo con <ins>. Combina con <del> para cambios. Usa datetime y cite para documentar cuándo.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Inserted</title></head>
<body>
  <p>Se agregó <ins datetime="2025-11-15">esta nueva sección</ins>.</p>
  <p>El precio <del>$100</del> <ins>$80</ins></p>
</body>
</html>`
  },
  {
    term: "sub",
    meaning: "La etiqueta <sub> define texto subíndice. Se usa para notación química, matemática o fórmulas donde ciertos caracteres deben aparecer más bajos.",
    what: "Se utiliza para subíndices en fórmulas químicas, matemáticas y científicas. Reduce el tamaño y desplaza el texto hacia abajo.",
    how: "Envuelve caracteres que necesitan subíndice con <sub>. Úsala en fórmulas científicas. Combina con <sup> para exponentes.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Subscript</title></head>
<body>
  <p>La fórmula del agua es H<sub>2</sub>O.</p>
  <p>La glucosa es C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>.</p>
</body>
</html>`
  },
  {
    term: "sup",
    meaning: "La etiqueta <sup> define texto superíndice. Se usa para exponentes, notas al pie, notación científica y fórmulas donde ciertos caracteres deben aparecer más altos.",
    what: "Se utiliza para superíndices en fórmulas matemáticas, exponentes y notaciones científicas. Reduce el tamaño y desplaza hacia arriba.",
    how: "Envuelve caracteres que necesitan superíndice con <sup>. Úsala en potencias y exponentes. Combina con <sub> para subíndices.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Superscript</title></head>
<body>
  <p>2<sup>3</sup> = 8</p>
  <p>E = mc<sup>2</sup></p>
  <p>Vea la nota<sup>1</sup> al final.</p>
</body>
</html>`
  },
  {
    term: "abbr",
    meaning: "La etiqueta <abbr> define una abreviatura o acrónimo. Proporciona la forma expandida mediante el atributo title. Mejora la accesibilidad y semántica.",
    what: "Se utiliza para marcar abreviaturas como HTML, CSS, API. El atributo title proporciona el significado completo.",
    how: "Envuelve la abreviatura con <abbr title='Significado Completo'>. Mejora la accesibilidad. Los lectores de pantalla lo leen completo.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Abbreviation</title></head>
<body>
  <p><abbr title="HyperText Markup Language">HTML</abbr> es esencial.</p>
  <p>La <abbr title="Organización Mundial de la Salud">OMS</abbr> advierte...</p>
</body>
</html>`
  },
  {
    term: "dfn",
    meaning: "La etiqueta <dfn> define un término siendo definido. Se usa cuando introduces un término por primera vez en el documento. Indica que es una definición.",
    what: "Se utiliza para marcar términos cuando se definen por primera vez. Mejora la semántica para motores de búsqueda y lectores.",
    how: "Envuelve el término con <dfn> cuando lo definas por primera vez. Combina con <abbr> si es una abreviatura.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Definition</title></head>
<body>
  <p><dfn>Semántica</dfn> es el significado de las palabras.</p>
  <p>En programación, <dfn>variable</dfn> es un contenedor de datos.</p>
</body>
</html>`
  },
  {
    term: "kbd",
    meaning: "La etiqueta <kbd> define entrada de teclado. Se usa para indicar qué teclas debe presionar el usuario. Generalmente se renderiza en monoespaciado.",
    what: "Se utiliza en documentación técnica para indicar pulsaciones de teclado. Mejora la claridad en instrucciones.",
    how: "Envuelve las teclas con <kbd>. Usa <kbd>Ctrl</kbd>+<kbd>C</kbd> para combinaciones. Combina con <samp> para salida.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Keyboard Input</title></head>
<body>
  <p>Presiona <kbd>Ctrl</kbd>+<kbd>C</kbd> para copiar.</p>
  <p>Use <kbd>Enter</kbd> para enviar.</p>
</body>
</html>`
  },
  {
    term: "samp",
    meaning: "La etiqueta <samp> define salida de ejemplo de un programa. Se usa para mostrar resultados, mensajes o salida esperada. Generalmente en monoespaciado.",
    what: "Se utiliza para mostrar salida de ejemplo o resultados. Diferencia lo que ve el usuario de lo que escribe.",
    how: "Envuelve la salida de ejemplo con <samp>. Combina con <kbd> para entrada/salida. Útil en documentación técnica.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Sample Output</title></head>
<body>
  <p>Escriba <kbd>npm start</kbd> y verá:</p>
  <p><samp>Server running on port 3000</samp></p>
</body>
</html>`
  },
  {
    term: "var",
    meaning: "La etiqueta <var> define una variable en código o programación. Se usa para marcar nombres de variables, constantes o parámetros. Generalmente en monoespaciado.",
    what: "Se utiliza para marcar variables en explicaciones técnicas. Mejora la legibilidad de documentación de código.",
    how: "Envuelve nombres de variables con <var>. Úsala en documentación técnica. Combina con <code> para contexto.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Variable</title></head>
<body>
  <p>La variable <var>contador</var> almacena números.</p>
  <p>Use <var>x</var> como variable temporal.</p>
</body>
</html>`
  },
  {
    term: "cite",
    meaning: "La etiqueta <cite> define una cita o referencia a un trabajo creativo. Se usa para títulos de libros, películas, artículos, obras. Generalmente en cursiva.",
    what: "Se utiliza para marcar referencias a obras. Diferente de <blockquote> que es para citas textuales.",
    how: "Envuelve títulos de obras con <cite>. Diferente de <blockquote> (para contenido citado). Para el autor usa <blockquote>.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Citation</title></head>
<body>
  <p>Recomiendo leer <cite>Clean Code</cite> de Robert Martin.</p>
  <p>La película <cite>Matrix</cite> influyó en la tecnología.</p>
</body>
</html>`
  },
  {
    term: "q",
    meaning: "La etiqueta <q> define una cita corta o citación breve. Se usa para citas pequeñas que van dentro del texto. Los navegadores generalmente añaden comillas.",
    what: "Se utiliza para citas cortas dentro del párrafo. Las comillas se añaden automáticamente. Diferente de <blockquote> para citas largas.",
    how: "Envuelve citas cortas con <q>. Úsala para frases dentro del párrafo. Usa cite para referencia de fuente.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Short Quote</title></head>
<body>
  <p>Einstein dijo <q>La imaginación es más importante que el conocimiento</q>.</p>
  <p>El resultado fue <q cite='https://example.com'>inesperado</q>.</p>
</body>
</html>`
  },
  {
    term: "code",
    meaning: "La etiqueta <code> define fragmento de código. Se usa para mostrar código en línea dentro del texto. Generalmente en monoespaciado.",
    what: "Se utiliza para mostrar código dentro de párrafos. Diferente de <pre> que preserva formato.",
    how: "Envuelve código en línea con <code>. Combina con <pre> para bloques de código. Usa con <span> para resaltado.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Code</title></head>
<body>
  <p>La función <code>console.log()</code> imprime en la consola.</p>
  <p>Usa <code>const</code> para constantes en JavaScript.</p>
</body>
</html>`
  },
  {
    term: "time",
    meaning: "La etiqueta <time> define una fecha u hora legible por máquina. Se usa para marcar fechas, horas y duraciones con formato ISO 8601.",
    what: "Se utiliza para fechas y horas que las máquinas pueden entender. El atributo datetime define el formato preciso.",
    how: "Envuelve la fecha con <time datetime='ISO-format'>. Mejora SEO y permite procesamiento automático.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Time</title></head>
<body>
  <p>La reunión es <time datetime='2025-12-15T14:00:00Z'>15 de diciembre a las 2 PM</time>.</p>
  <p>Se tardó <time>2 horas</time> en completar.</p>
</body>
</html>`
  },
  {
    term: "data",
    meaning: "La etiqueta <data> proporciona un valor legible por máquina junto con una representación legible por humanos. Se usa para asociar datos con contenido textual.",
    what: "Se utiliza para marcar datos que tanto humanos como máquinas necesitan entender. El atributo value define el valor para máquinas.",
    how: "Envuelve contenido con <data value='valor-máquina'>. Úsala para precios, códigos, referencias.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Data</title></head>
<body>
  <p>El producto cuesta <data value='99.99'>$99.99</data>.</p>
  <p>Código: <data value='SKU-12345'>Producto 12345</data></p>
</body>
</html>`
  },
  {
    term: "s",
    meaning: "La etiqueta <s> define texto sin relevancia o incorrecto. Se renderiza con una línea a través. Diferente de <del> que indica eliminación.",
    what: "Se utiliza para marcar contenido que ya no es relevante o válido. Diferente de <del> (eliminación histórica).",
    how: "Envuelve texto sin relevancia con <s>. Útil para precios antiguos o información desactualizada.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Strikethrough</title></head>
<body>
  <p>Precio: <s>$100</s> Ahora: $80</p>
  <p><s>Esta información está desactualizada</s></p>
</body>
</html>`
  },
  {
    term: "wbr",
    meaning: "La etiqueta <wbr> define una oportunidad de salto de línea. Se usa para indicar dónde puede romper el texto largo si es necesario. Útil para URLs largas.",
    what: "Se utiliza para sugerir puntos de quiebre en texto largo. Ayuda con responsividad sin forzar saltos.",
    how: "Inserta <wbr> en puntos lógicos de texto largo. Útil en URLs largas, palabras compuestas o código.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Word Break</title></head>
<body>
  <p>URL: https://ejemplo.com<wbr>/ruta<wbr>/muy<wbr>/larga</p>
  <p>Palabra larga: supercalifragilístico<wbr>expialidoso</p>
</body>
</html>`
  },

  // MULTIMEDIA (10 términos)
  {
    term: "img",
    meaning: "La etiqueta <img> incrusta una imagen en el documento. Es un elemento vacío que requiere atributos src y alt. Soporta formatos JPEG, PNG, GIF, WebP y SVG.",
    what: "Se utiliza para mostrar imágenes en la página. El atributo alt es obligatorio para accesibilidad. Soporta múltiples formatos.",
    how: "Usa <img src='ruta' alt='descripción'>. Siempre incluye alt descriptivo. Usa srcset para imágenes responsivas.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Imágenes</title></head>
<body>
  <img src='foto.jpg' alt='Foto del evento' width='400'>
  <img src='logo.png' alt='Logo de la empresa' srcset='logo-2x.png 2x'>
</body>
</html>`
  },
  {
    term: "picture",
    meaning: "La etiqueta <picture> es un contenedor para proporcionar múltiples fuentes de imagen según condiciones. Se usa con <source> para imágenes responsivas avanzadas.",
    what: "Se utiliza para arte dirigido de imágenes basado en viewport, formato o densidad. Permite usar diferentes imágenes según dispositivo.",
    how: "Coloca múltiples <source> dentro de <picture>. Incluye <img> como fallback. Define media queries.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Picture</title></head>
<body>
  <picture>
    <source media='(min-width: 768px)' srcset='grande.jpg'>
    <source media='(min-width: 480px)' srcset='medio.jpg'>
    <img src='pequeño.jpg' alt='Imagen responsiva'>
  </picture>
</body>
</html>`
  },
  {
    term: "source",
    meaning: "La etiqueta <source> define múltiples fuentes de media para <video>, <audio> o <picture>. Permite navegadores elegir formato soportado.",
    what: "Se utiliza con picture, video y audio para proporcionar alternativas. Los navegadores usan el primer formato soportado.",
    how: "Coloca dentro de picture/video/audio. Define src y type. Crea para diferentes formatos o tamaños.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Source</title></head>
<body>
  <video controls>
    <source src='video.mp4' type='video/mp4'>
    <source src='video.webm' type='video/webm'>
    Tu navegador no soporta video.
  </video>
</body>
</html>`
  },
  {
    term: "video",
    meaning: "La etiqueta <video> incrusta un reproductor de video en la página. Soporta múltiples formatos (MP4, WebM, Ogg). Incluye controles nativos.",
    what: "Se utiliza para reproducir video en la página sin plugins. Soporta controles, autoplay y loop.",
    how: "Usa <video src='video.mp4' controls>. Incluye <source> para múltiples formatos. Añade atributos como autoplay, muted, loop.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Video</title></head>
<body>
  <video width='640' height='480' controls poster='poster.jpg'>
    <source src='video.mp4' type='video/mp4'>
    Tu navegador no soporta video.
  </video>
</body>
</html>`
  },
  {
    term: "audio",
    meaning: "La etiqueta <audio> incrusta un reproductor de audio en la página. Soporta MP3, WAV, Ogg. Incluye controles nativos para reproducción.",
    what: "Se utiliza para reproducir archivos de audio sin plugins. Soporta controles, autoplay, loop y preload.",
    how: "Usa <audio src='audio.mp3' controls>. Incluye <source> para múltiples formatos. Personaliza con atributos.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Audio</title></head>
<body>
  <audio controls preload='metadata'>
    <source src='cancion.mp3' type='audio/mpeg'>
    Tu navegador no soporta audio.
  </audio>
</body>
</html>`
  },
  {
    term: "track",
    meaning: "La etiqueta <track> define pistas de texto para video (subtítulos, títulos, descripciones). Se usa con <video> para múltiples idiomas.",
    what: "Se utiliza para agregar subtítulos, títulos o descripciones a video. Formato WebVTT estándar.",
    how: "Coloca dentro de <video>. Define kind (subtitles, captions, descriptions). Especifica src y language.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Track/Subtítulos</title></head>
<body>
  <video controls>
    <source src='video.mp4' type='video/mp4'>
    <track kind='subtitles' src='subtitulos-es.vtt' srclang='es' label='Español'>
    <track kind='subtitles' src='subtitulos-en.vtt' srclang='en' label='English'>
  </video>
</body>
</html>`
  },
  {
    term: "iframe",
    meaning: "La etiqueta <iframe> incrusta otro documento HTML dentro del documento actual. Se usa para incrustar maps, videos, redes sociales.",
    what: "Se utiliza para incrustar contenido externo como mapas, videos de YouTube, widgets sociales. Crea un contexto separado.",
    how: "Usa <iframe src='url'></iframe>. Define sandbox para seguridad. Incluye title para accesibilidad.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Iframe</title></head>
<body>
  <iframe src='https://maps.google.com' width='400' height='300'></iframe>
  <iframe src='https://www.youtube.com/embed/dQw4w9WgXcQ' title='Video'></iframe>
</body>
</html>`
  },
  {
    term: "embed",
    meaning: "La etiqueta <embed> incrusta contenido externo como Flash, PDF o applets. Se usa para multimedia que no es HTML nativo.",
    what: "Se utiliza para incrustar PDF, Flash u otro contenido externo. Alternativa a <object>.",
    how: "Usa <embed src='archivo.pdf' type='application/pdf'>. Define width y height. Proporciona fallback.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Embed</title></head>
<body>
  <embed src='documento.pdf' type='application/pdf' width='100%' height='500px'>
  <embed src='animacion.swf' width='400' height='300'>
</body>
</html>`
  },
  {
    term: "object",
    meaning: "La etiqueta <object> incrusta un recurso externo como PDF, Flash, applet. Generalmente reemplazada por <embed> o <iframe>.",
    what: "Se utiliza para incrustar contenido externo con fallback. Más flexible que <embed> pero menos usado.",
    how: "Usa <object data='archivo' type='tipo/mime'></object>. Incluye <param> para parámetros. Proporciona contenido alternativo.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Object</title></head>
<body>
  <object data='documento.pdf' type='application/pdf' width='100%'>
    <p>Fallback: <a href='documento.pdf'>Descargar PDF</a></p>
  </object>
</body>
</html>`
  },
  {
    term: "param",
    meaning: "La etiqueta <param> define parámetros para <object>. Se usa para pasar configuración al objeto incrustado.",
    what: "Se utiliza con <object> para pasar parámetros. Especifica opciones de configuración para el plugin.",
    how: "Coloca dentro de <object>. Define name y value. Depende del plugin específico.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Param</title></head>
<body>
  <object data='animacion.swf'>
    <param name='autoplay' value='true'>
    <param name='loop' value='false'>
  </object>
</body>
</html>`
  },
  {
    term: "canvas",
    meaning: "La etiqueta <canvas> proporciona un área para dibujar gráficos usando JavaScript. Se usa para gráficos, animaciones, games.",
    what: "Se utiliza para gráficos 2D renderizados dinámicamente. Acceso mediante JavaScript API.",
    how: "Crea <canvas id='micanvas' width='400' height='300'></canvas>. Accede via JavaScript con getContext('2d').",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Canvas</title></head>
<body>
  <canvas id='micanvas' width='400' height='300'></canvas>
  <script>
    const ctx = document.getElementById('micanvas').getContext('2d');
    ctx.fillStyle = 'blue';
    ctx.fillRect(10, 10, 100, 100);
  </script>
</body>
</html>`
  },
  {
    term: "svg",
    meaning: "La etiqueta <svg> define gráficos vectoriales escalables. Se usa para gráficos, iconos y animaciones basados en vectores.",
    what: "Se utiliza para gráficos vectoriales que escalan sin perder calidad. Diferente de canvas (raster).",
    how: "Define <svg viewBox='0 0 100 100'></svg>. Incluye elementos como <circle>, <rect>, <path>.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>SVG</title></head>
<body>
  <svg viewBox='0 0 100 100' width='100' height='100'>
    <circle cx='50' cy='50' r='40' fill='blue'/>
    <rect x='10' y='10' width='30' height='30' fill='red'/>
  </svg>
</body>
</html>`
  },
  {
    term: "math",
    meaning: "La etiqueta <math> define fórmulas matemáticas usando MathML. Se usa para ecuaciones y notación matemática compleja.",
    what: "Se utiliza para representar ecuaciones matemáticas. Estándar W3C para matemáticas en web.",
    how: "Define <math></math> con elementos MathML. Requiere soporte del navegador. Usa <mrow>, <mi>, <mo>, etc.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Math</title></head>
<body>
  <math>
    <mrow>
      <mi>a</mi>
      <mo>=</mo>
      <mfrac>
        <mrow><mo>-</mo><mi>b</mi><mo>±</mo><msqrt><msup><mi>b</mi><mn>2</mn></msup><mo>-</mo><mn>4</mn><mi>ac</mi></msqrt></mrow>
        <mrow><mn>2</mn><mi>a</mi></mrow>
      </mfrac>
    </mrow>
  </math>
</body>
</html>`
  }
];

// Crear términos en lotes
async function createTermsBatch(terms: TermData[]) {
  let created = 0;
  let failed = 0;

  for (const termData of terms) {
    try {
      const term = await prisma.term.create({
        data: {
          term: termData.term,
          translation: `Etiqueta HTML: <${termData.term}>`,
          meaning: termData.meaning,
          what: termData.what,
          how: termData.how,
          category: "frontend",
          examples: [
            {
              code: termData.snippet,
              title: `Ejemplo de ${termData.term}`,
              language: "html",
              explanation: `Demostración completa de cómo usar <${termData.term}>`
            }
          ]
        }
      });

      await prisma.termVariant.create({
        data: {
          termId: term.id,
          language: "html",
          snippet: termData.snippet,
          level: "intermediate",
          status: "approved"
        }
      });

      await prisma.useCase.createMany({
        data: [
          {
            termId: term.id,
            context: "project",
            summary: `Usar <${termData.term}> en proyecto`,
            steps: [
              `Identificar donde necesitas <${termData.term}>`,
              `Implementar correctamente`,
              `Probar compatibilidad`,
              `Validar accesibilidad`
            ],
            tips: "Consulta la documentación de MDN para detalles"
          },
          {
            termId: term.id,
            context: "interview",
            summary: `Explicar <${termData.term}> en entrevista`,
            steps: [
              `Describe qué es <${termData.term}>`,
              `Cuándo se usa`,
              `Proporciona ejemplo`,
              `Menciona alternativas`
            ],
            tips: "Sé claro y conciso"
          },
          {
            termId: term.id,
            context: "bug",
            summary: `Debuggear problemas con <${termData.term}>`,
            steps: [
              `Verifica atributos requeridos`,
              `Inspecciona con DevTools`,
              `Valida HTML`,
              `Prueba en navegadores`
            ],
            tips: "Usa Inspector de Elementos"
          }
        ]
      });

      await prisma.faq.createMany({
        data: [
          {
            termId: term.id,
            questionEs: `¿Para qué sirve <${termData.term}>?`,
            answerEs: termData.what,
            snippet: null
          },
          {
            termId: term.id,
            questionEs: `¿Cuándo usar <${termData.term}>?`,
            answerEs: termData.meaning,
            snippet: null
          },
          {
            termId: term.id,
            questionEs: `¿Cómo implementar <${termData.term}>?`,
            answerEs: termData.how,
            snippet: termData.snippet.substring(0, 300)
          }
        ]
      });

      await prisma.exercise.create({
        data: {
          termId: term.id,
          titleEs: `Práctica con <${termData.term}>`,
          promptEs: `Crea un ejemplo HTML que use correctamente <${termData.term}>.`,
          difficulty: "medium",
          solutions: [
            {
              title: "Solución",
              code: termData.snippet,
              explanation: `Ejemplo de <${termData.term}> funcionando`
            }
          ]
        }
      });

      created++;
      console.log(`✅ ${termData.term}`);
    } catch (error: any) {
      failed++;
      console.log(`❌ ${termData.term}: ${error.message}`);
    }
  }

  return { created, failed };
}

async function main() {
  try {
    console.log(`🔧 Creando ${htmlTerms.length} términos HTML...\n`);
    const { created, failed } = await createTermsBatch(htmlTerms);
    console.log(`\n✅ Creados: ${created}/${htmlTerms.length}`);
    if (failed > 0) console.log(`❌ Fallidos: ${failed}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
