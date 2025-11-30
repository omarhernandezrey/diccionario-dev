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
  // LISTS (6 términos)
  {
    term: "ul",
    meaning: "La etiqueta <ul> define una lista sin orden. Cada elemento se define con <li>. Los elementos aparecen con viñetas.",
    what: "Se utiliza para listas donde el orden no importa. Cada elemento es una viñeta independiente.",
    how: "Crea <ul> con múltiples <li>. Usa CSS para personalizar viñetas. Puede anidar listas.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Listas Sin Orden</title></head>
<body>
  <h2>Compras</h2>
  <ul>
    <li>Manzanas</li>
    <li>Plátanos</li>
    <li>Naranjas</li>
  </ul>
</body>
</html>`
  },
  {
    term: "ol",
    meaning: "La etiqueta <ol> define una lista ordenada. Cada elemento se define con <li>. Los elementos aparecen numerados.",
    what: "Se utiliza para listas donde el orden importa. Elementos numerados secuencialmente.",
    how: "Crea <ol> con múltiples <li>. Usa type para cambiar numeración (a, i, 1, etc). Puede anidar listas.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Listas Ordenadas</title></head>
<body>
  <h2>Pasos</h2>
  <ol>
    <li>Descargar archivo</li>
    <li>Extraer contenido</li>
    <li>Ejecutar instalador</li>
  </ol>
</body>
</html>`
  },
  {
    term: "li",
    meaning: "La etiqueta <li> define un elemento de lista. Se usa dentro de <ul>, <ol> o <menu>. Cada <li> es un elemento independiente.",
    what: "Se utiliza para cada elemento en listas. Puede contener texto, enlaces e incluso otras listas.",
    how: "Coloca dentro de <ul> u <ol>. Puede anidar listas. Personaliza con CSS.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Elementos Lista</title></head>
<body>
  <ul>
    <li>Elemento 1</li>
    <li>Elemento 2
      <ul>
        <li>Subelemento 2.1</li>
        <li>Subelemento 2.2</li>
      </ul>
    </li>
  </ul>
</body>
</html>`
  },
  {
    term: "dl",
    meaning: "La etiqueta <dl> define una lista de descripción. Contiene términos (<dt>) y sus descripciones (<dd>). Útil para glosarios.",
    what: "Se utiliza para listas de términos con descripciones. Diferente de ul/ol.",
    how: "Crea <dl> con pares <dt>/<dd>. <dt> es el término, <dd> es la descripción. Personaliza con CSS.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Lista Descripción</title></head>
<body>
  <dl>
    <dt>HTML</dt>
    <dd>Lenguaje de marcado para web</dd>
    <dt>CSS</dt>
    <dd>Lenguaje para estilos</dd>
  </dl>
</body>
</html>`
  },
  {
    term: "dt",
    meaning: "La etiqueta <dt> define un término en una lista de descripción. Se usa dentro de <dl>. Precede a <dd>.",
    what: "Se utiliza para el término o concepto siendo definido en listas de descripción.",
    how: "Coloca dentro de <dl> antes de <dd>. Contiene el término. Puede tener múltiples <dd>.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Términos</title></head>
<body>
  <dl>
    <dt>Semántica</dt>
    <dd>Significado de las palabras</dd>
    <dd>En programación: estructura de datos</dd>
  </dl>
</body>
</html>`
  },
  {
    term: "dd",
    meaning: "La etiqueta <dd> define una descripción en una lista de descripción. Se usa dentro de <dl> después de <dt>.",
    what: "Se utiliza para la descripción o definición de un término en listas de descripción.",
    how: "Coloca dentro de <dl> después de <dt>. Contiene la descripción. Puede haber múltiples <dd> por <dt>.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Definiciones</title></head>
<body>
  <dl>
    <dt>API</dt>
    <dd>Interfaz de Programación de Aplicaciones</dd>
    <dd>Permite comunicación entre programas</dd>
  </dl>
</body>
</html>`
  },

  // TABLES (7 términos)
  {
    term: "table",
    meaning: "La etiqueta <table> define una tabla de datos. Contiene <tr>, <td>, <th>, <thead>, <tbody>, <tfoot>. Estructura datos en filas y columnas.",
    what: "Se utiliza para mostrar datos tabulares. Proporciona estructura para filas y columnas.",
    how: "Crea <table> con <tr> para filas. Usa <th> para encabezados, <td> para datos. Organiza con thead, tbody, tfoot.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Tabla</title></head>
<body>
  <table border='1'>
    <thead>
      <tr><th>Nombre</th><th>Edad</th></tr>
    </thead>
    <tbody>
      <tr><td>Juan</td><td>30</td></tr>
      <tr><td>María</td><td>28</td></tr>
    </tbody>
  </table>
</body>
</html>`
  },
  {
    term: "caption",
    meaning: "La etiqueta <caption> proporciona un título o descripción para una tabla. Se coloca como primer elemento dentro de <table>.",
    what: "Se utiliza para dar contexto y describir el contenido de la tabla. Mejora accesibilidad.",
    how: "Coloca como primer hijo de <table>. Proporciona descripción clara. Puede tener múltiples líneas.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Caption</title></head>
<body>
  <table>
    <caption>Resultados de Ventas 2025</caption>
    <tr><th>Mes</th><th>Ventas</th></tr>
    <tr><td>Enero</td><td>$5000</td></tr>
  </table>
</body>
</html>`
  },
  {
    term: "thead",
    meaning: "La etiqueta <thead> agrupa filas de encabezado en una tabla. Se coloca antes de <tbody>. Generalmente contiene <tr> con <th>.",
    what: "Se utiliza para agrupar la fila o filas de encabezado. Mejora la estructura y semántica de la tabla.",
    how: "Coloca al inicio de la tabla después de <caption>. Contiene filas de encabezado. Combina con tbody y tfoot.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Thead</title></head>
<body>
  <table>
    <thead>
      <tr><th>Producto</th><th>Precio</th><th>Stock</th></tr>
    </thead>
    <tbody>
      <tr><td>Widget</td><td>$10</td><td>50</td></tr>
    </tbody>
  </table>
</body>
</html>`
  },
  {
    term: "tbody",
    meaning: "La etiqueta <tbody> agrupa filas de contenido en una tabla. Se coloca entre <thead> y <tfoot>. Contiene los datos.",
    what: "Se utiliza para agrupar el cuerpo principal de la tabla. Mejora la estructura y semántica.",
    how: "Coloca entre thead y tfoot. Contiene filas de datos. Puede tener múltiples tr.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Tbody</title></head>
<body>
  <table>
    <thead><tr><th>Nombre</th></tr></thead>
    <tbody>
      <tr><td>Alice</td></tr>
      <tr><td>Bob</td></tr>
    </tbody>
  </table>
</body>
</html>`
  },
  {
    term: "tfoot",
    meaning: "La etiqueta <tfoot> agrupa filas de pie en una tabla. Típicamente para totales o resúmenes. Se coloca después de <tbody>.",
    what: "Se utiliza para filas de resumen, totales o pie de tabla. Mejora la estructura.",
    how: "Coloca al final de la tabla después de tbody. Contiene filas de resumen. Úsala para totales.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Tfoot</title></head>
<body>
  <table>
    <thead><tr><th>Item</th><th>Precio</th></tr></thead>
    <tbody>
      <tr><td>A</td><td>$10</td></tr>
    </tbody>
    <tfoot>
      <tr><th>Total</th><th>$10</th></tr>
    </tfoot>
  </table>
</body>
</html>`
  },
  {
    term: "tr",
    meaning: "La etiqueta <tr> define una fila en una tabla. Contiene <th> o <td>. Cada <tr> es una fila horizontal.",
    what: "Se utiliza para cada fila en una tabla. Contiene celdas de encabezado o datos.",
    how: "Coloca dentro de table, thead, tbody o tfoot. Llena con <th> o <td>.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Filas</title></head>
<body>
  <table>
    <tr>
      <td>Celda 1,1</td>
      <td>Celda 1,2</td>
    </tr>
    <tr>
      <td>Celda 2,1</td>
      <td>Celda 2,2</td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    term: "th",
    meaning: "La etiqueta <th> define una celda de encabezado en una tabla. Se usa en filas de encabezado. Generalmente en negrita.",
    what: "Se utiliza para encabezados de columnas o filas. Indica celdas de encabezado.",
    how: "Coloca dentro de <tr> en filas de encabezado. Usa scope para indicar fila o columna.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Encabezados</title></head>
<body>
  <table>
    <tr>
      <th scope='col'>Nombre</th>
      <th scope='col'>Edad</th>
    </tr>
    <tr>
      <td>Juan</td>
      <td>30</td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    term: "td",
    meaning: "La etiqueta <td> define una celda de datos en una tabla. Se usa para contenido regular en filas. Puede contener cualquier HTML.",
    what: "Se utiliza para celdas de datos en una tabla. Contenedor general para datos.",
    how: "Coloca dentro de <tr>. Puede contener texto, enlaces, imágenes. Usa colspan/rowspan para fusionar.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Celdas</title></head>
<body>
  <table border='1'>
    <tr>
      <td>Dato 1</td>
      <td colspan='2'>Dato que ocupa 2 columnas</td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    term: "col",
    meaning: "La etiqueta <col> especifica propiedades de columna en una tabla. Se usa dentro de <colgroup>. Aplicar estilos a columnas.",
    what: "Se utiliza para aplicar propiedades a columnas. Útil para estilos uniformes.",
    how: "Coloca dentro de <colgroup>. Define span para múltiples columnas. Combina con CSS.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Col</title></head>
<body>
  <table>
    <colgroup>
      <col style='background-color: yellow;'>
      <col style='background-color: blue;'>
    </colgroup>
    <tr><td>Dato 1</td><td>Dato 2</td></tr>
  </table>
</body>
</html>`
  },
  {
    term: "colgroup",
    meaning: "La etiqueta <colgroup> agrupa columnas en una tabla. Contiene <col>. Permite aplicar propiedades a múltiples columnas.",
    what: "Se utiliza para organizar y estilizar columnas de tabla. Mejora la estructura.",
    how: "Coloca como primer elemento de <table>. Contiene <col>. Define span para agrupar columnas.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Colgroup</title></head>
<body>
  <table>
    <colgroup span='2' style='background-color: #ccc;'></colgroup>
    <colgroup style='background-color: #fff;'></colgroup>
    <tr><td>A</td><td>B</td><td>C</td></tr>
  </table>
</body>
</html>`
  },

  // FORMS - STRUCTURE (6 términos)
  {
    term: "form",
    meaning: "La etiqueta <form> define un formulario para entrada de usuario. Contiene elementos como input, textarea, button. Envía datos a servidor.",
    what: "Se utiliza para recopilar información del usuario. Define método de envío (GET/POST) y acción.",
    how: "Crea <form action='script.php' method='POST'>. Agrega campos input. Define botón submit.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Formulario</title></head>
<body>
  <form action='enviar.php' method='POST'>
    <label>Nombre:</label>
    <input type='text' name='nombre' required>
    <button type='submit'>Enviar</button>
  </form>
</body>
</html>`
  },
  {
    term: "label",
    meaning: "La etiqueta <label> define una etiqueta para un elemento de entrada. Mejora accesibilidad asociando texto con campos.",
    what: "Se utiliza para describir campos de entrada. El atributo for vincula a input por id.",
    how: "Usa <label for='idDelInput'>Descripción</label>. Aumenta área de clic del input.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Labels</title></head>
<body>
  <form>
    <label for='email'>Email:</label>
    <input type='email' id='email' name='email'>
    
    <label for='password'>Contraseña:</label>
    <input type='password' id='password' name='password'>
  </form>
</body>
</html>`
  },
  {
    term: "textarea",
    meaning: "La etiqueta <textarea> define un área de texto multilínea. Se usa para entrada de texto largo. Diferente de input text.",
    what: "Se utiliza para comentarios, mensajes y texto extenso. Redimensionable y multilínea.",
    how: "Crea <textarea name='mensaje' rows='5' cols='40'></textarea>. Define dimensiones. Personaliza con CSS.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Textarea</title></head>
<body>
  <form>
    <label for='comentario'>Comentario:</label>
    <textarea id='comentario' name='comentario' rows='4' cols='50'></textarea>
    <button>Enviar</button>
  </form>
</body>
</html>`
  },
  {
    term: "button",
    meaning: "La etiqueta <button> define un botón clickeable. Puede ser submit, reset o button. Más flexible que input button.",
    what: "Se utiliza para acciones de formulario o scripts. Puede contener HTML dentro.",
    how: "Crea <button type='submit'>Enviar</button>. Define type (submit, reset, button). Personaliza con CSS.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Buttons</title></head>
<body>
  <form>
    <button type='submit'>Enviar</button>
    <button type='reset'>Limpiar</button>
    <button type='button' onclick='alert(\"Hola\")'>Click</button>
  </form>
</body>
</html>`
  },
  {
    term: "select",
    meaning: "La etiqueta <select> define un menú desplegable. Contiene <option>. Permite seleccionar una opción de lista.",
    what: "Se utiliza para seleccionar de múltiples opciones. Compacto y fácil de usar.",
    how: "Crea <select name='opciones'> con <option>. Usa multiple para seleccionar varios. Personaliza con size.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Select</title></head>
<body>
  <form>
    <label for='pais'>País:</label>
    <select id='pais' name='pais'>
      <option value='es'>España</option>
      <option value='mx'>México</option>
      <option value='ar'>Argentina</option>
    </select>
  </form>
</body>
</html>`
  },
  {
    term: "option",
    meaning: "La etiqueta <option> define una opción en un menú <select>. Cada opción es seleccionable. El value es enviado al servidor.",
    what: "Se utiliza como elemento dentro de <select>. Define valor y texto visible.",
    how: "Coloca dentro de <select>. Define value. Puede estar seleccionado con 'selected'.",
    snippet: `<!DOCTYPE html>
<html>
<head><title>Options</title></head>
<body>
  <select name='tamaño'>
    <option value='s'>Pequeño</option>
    <option value='m' selected>Mediano</option>
    <option value='l'>Grande</option>
  </select>
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
              explanation: `Demostración de <${termData.term}>`
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
            summary: `Usar <${termData.term}>`,
            steps: ["Identificar uso", "Implementar", "Probar", "Validar"],
            tips: "Consulta MDN"
          },
          {
            termId: term.id,
            context: "interview",
            summary: `Explicar <${termData.term}>`,
            steps: ["Qué es", "Cuándo", "Ejemplo", "Diferencias"],
            tips: "Sé conciso"
          },
          {
            termId: term.id,
            context: "bug",
            summary: `Debug <${termData.term}>`,
            steps: ["Verifica", "Inspecciona", "Valida", "Prueba"],
            tips: "DevTools"
          }
        ]
      });

      await prisma.faq.createMany({
        data: [
          {
            termId: term.id,
            questionEs: `¿Para qué <${termData.term}>?`,
            answerEs: termData.what,
            snippet: null
          },
          {
            termId: term.id,
            questionEs: `¿Cuándo <${termData.term}>?`,
            answerEs: termData.meaning,
            snippet: null
          },
          {
            termId: term.id,
            questionEs: `¿Cómo <${termData.term}>?`,
            answerEs: termData.how,
            snippet: null
          }
        ]
      });

      await prisma.exercise.create({
        data: {
          termId: term.id,
          titleEs: `Practica <${termData.term}>`,
          promptEs: `Crea ejemplo con <${termData.term}>`,
          difficulty: "medium",
          solutions: [
            {
              title: "Solución",
              code: termData.snippet,
              explanation: `Ejemplo funcional`
            }
          ]
        }
      });

      created++;
      console.log(`✅ ${termData.term}`);
    } catch (error: any) {
      failed++;
      console.log(`❌ ${termData.term}: ${error.message.substring(0, 50)}`);
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
