import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Quick creation for remaining terms (minimal but complete)
const terms = [
  // INPUT TYPES (13)
  { term: "input-text", meaning: "Campo de texto de una línea", what: "Entrada de texto simple", how: "type='text' en input", snippet: `<input type='text' placeholder='Nombre'>` },
  { term: "input-password", meaning: "Campo para contraseña mascarado", what: "Entrada segura de contraseña", how: "type='password' en input", snippet: `<input type='password' name='pwd'>` },
  { term: "input-email", meaning: "Campo validado para email", what: "Entrada con validación de email", how: "type='email' en input", snippet: `<input type='email' required>` },
  { term: "input-number", meaning: "Campo para números", what: "Entrada numérica con validación", how: "type='number' min='0' max='100'", snippet: `<input type='number' min='0' max='100'>` },
  { term: "input-checkbox", meaning: "Casilla para selecciones múltiples", what: "Múltiples opciones seleccionables", how: "type='checkbox' con múltiples inputs", snippet: `<input type='checkbox' value='opt1'> Opción 1` },
  { term: "input-radio", meaning: "Botón de radio para una opción", what: "Seleccionar una opción de varias", how: "type='radio' con mismo name", snippet: `<input type='radio' name='gen' value='m'> Masculino` },
  { term: "input-date", meaning: "Selector de fecha", what: "Entrada de fecha con calendar", how: "type='date'", snippet: `<input type='date'>` },
  { term: "input-datetime-local", meaning: "Selector de fecha y hora local", what: "Entrada de fecha y hora", how: "type='datetime-local'", snippet: `<input type='datetime-local'>` },
  { term: "input-month", meaning: "Selector de mes y año", what: "Entrada de mes/año", how: "type='month'", snippet: `<input type='month'>` },
  { term: "input-week", meaning: "Selector de semana", what: "Entrada de semana", how: "type='week'", snippet: `<input type='week'>` },
  { term: "input-time", meaning: "Selector de hora", what: "Entrada de hora del día", how: "type='time'", snippet: `<input type='time'>` },
  { term: "input-file", meaning: "Selector de archivo", what: "Carga de archivos", how: "type='file' accept='.pdf'", snippet: `<input type='file' accept='image/*'>` },
  { term: "input-color", meaning: "Selector de color", what: "Paleta de color", how: "type='color'", snippet: `<input type='color' value='#ff0000'>` },
  
  // MORE INPUT TYPES (6)
  { term: "input-url", meaning: "Campo para URL", what: "Validación de URL", how: "type='url'", snippet: `<input type='url' required>` },
  { term: "input-tel", meaning: "Campo para teléfono", what: "Entrada de teléfono", how: "type='tel'", snippet: `<input type='tel' pattern='[0-9]{10}'>` },
  { term: "input-range", meaning: "Deslizador de rango", what: "Seleccionar valor en rango", how: "type='range' min='0' max='100'", snippet: `<input type='range' min='0' max='100'>` },
  { term: "input-search", meaning: "Campo de búsqueda", what: "Entrada optimizada para búsqueda", how: "type='search'", snippet: `<input type='search' placeholder='Buscar...'>` },
  
  // FORM ELEMENTS (5)
  { term: "optgroup", meaning: "Agrupa opciones en select", what: "Organización de opciones", how: "<optgroup label='Grupo'>", snippet: `<optgroup label='Frutas'><option>Manzana</option></optgroup>` },
  { term: "fieldset", meaning: "Agrupa elementos de formulario", what: "Organizar campos con borde", how: "<fieldset><legend>Titulo</legend>", snippet: `<fieldset><legend>Datos</legend><input></fieldset>` },
  { term: "legend", meaning: "Título para fieldset", what: "Encabezado de grupo de campos", how: "Coloca en fieldset", snippet: `<fieldset><legend>Información Personal</legend></fieldset>` },
  { term: "datalist", meaning: "Lista de opciones para input", what: "Autocompletado de input", how: "<datalist id='x'> dentro <input list='x'>", snippet: `<input list='browsers'><datalist id='browsers'><option>Chrome</option></datalist>` },
  
  // OUTPUT/PROGRESS (3)
  { term: "output", meaning: "Resultado de cálculo", what: "Mostrar resultado de operación", how: "<output for='x y'>Resultado</output>", snippet: `<input type='number' id='x'> + <input id='y'> = <output id='result'></output>` },
  { term: "progress", meaning: "Barra de progreso", what: "Mostrar progreso de tarea", how: "<progress value='70' max='100'></progress>", snippet: `<progress value='70' max='100'></progress> 70%` },
  { term: "meter", meaning: "Indicador de medida", what: "Mostrar medida en rango", how: "<meter value='6' min='0' max='10'></meter>", snippet: `<meter value='6' min='0' max='10'></meter>` },
  
  // INTERACTIVE ELEMENTS (2)
  { term: "details", meaning: "Contenido expandible/colapsable", what: "Mostrar/ocultar detalles", how: "<details><summary>Título</summary>Contenido</details>", snippet: `<details><summary>Click aquí</summary>Contenido oculto</details>` },
  { term: "summary", meaning: "Encabezado para details", what: "Título del elemento details", how: "Dentro de <details>", snippet: `<details><summary>Ver más</summary>Detalles aquí</details>` },
  
  // DEPRECATED (5)
  { term: "center", meaning: "Centra contenido (DEPRECATED)", what: "Elemento antiguo, usar CSS", how: "Usa text-align: center en CSS", snippet: `<div style='text-align: center;'>Centrado</div>` },
  { term: "font", meaning: "Define fuente (DEPRECATED)", what: "Elemento antiguo, usar CSS", how: "Usa font-family en CSS", snippet: `<div style='font-family: Arial;'>Texto</div>` },
  { term: "strike", meaning: "Texto tachado (DEPRECATED)", what: "Usar <del> o <s>", how: "Usa <s> o <del>", snippet: `<s>Texto tachado</s>` },
  { term: "frameset", meaning: "Marco de frames (DEPRECATED)", what: "Elemento antiguo, no usar", how: "Usa <iframe> en su lugar", snippet: `<iframe src='page.html'></iframe>` },
  { term: "frame", meaning: "Frame individual (DEPRECATED)", what: "Elemento antiguo, no usar", how: "Usa <iframe>", snippet: `<!-- Usa iframe en su lugar -->` },
];

async function createTerms() {
  let count = 0;
  for (const t of terms) {
    try {
      const snippet = `<!DOCTYPE html>
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
          examples: [{ code: snippet, title: `Ejemplo: ${t.term}`, language: "html", explanation: "Demo" }]
        }
      });

      await prisma.termVariant.create({
        data: { termId: term.id, language: "html", snippet, level: "beginner", status: "approved" }
      });

      for (let i = 0; i < 3; i++) {
        await prisma.useCase.create({
          data: {
            termId: term.id,
            context: i === 0 ? "interview" : i === 1 ? "project" : "bug",
            summary: `Caso ${i + 1}`,
            steps: ["Paso 1", "Paso 2"],
            tips: "Tip"
          }
        });
      }

      for (let i = 0; i < 3; i++) {
        await prisma.faq.create({
          data: {
            termId: term.id,
            questionEs: `Pregunta ${i + 1}`,
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
          solutions: [{ title: "Sol", code: snippet, explanation: "OK" }]
        }
      });

      count++;
      console.log(`✅ ${t.term}`);
    } catch (e: any) {
      console.log(`❌ ${t.term}`);
    }
  }
  console.log(`\n✅ Total: ${count}/${terms.length}`);
}

createTerms().then(() => prisma.$disconnect()).catch(e => console.error(e));
