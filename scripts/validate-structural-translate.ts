/**
 * Script de validación manual para traducción estructural.
 * Prueba: parsers por lenguaje, identación, strings/comentarios, fallback.
 */

import { translateStructural, resetTranslationCache } from "@/lib/structural-translate";

const testDictionary = [
  { term: "fetch", translation: "obtener", aliases: [] },
  { term: "user", translation: "usuario", aliases: [] },
  { term: "welcome", translation: "bienvenido", aliases: [] },
  { term: "state", translation: "estado", aliases: [] },
  { term: "component", translation: "componente", aliases: [] },
  { term: "function", translation: "función", aliases: [] },
];

async function runValidation() {
  resetTranslationCache();

  console.log("\n========== VALIDACIÓN: TRADUCCIÓN ESTRUCTURAL ==========\n");

  // Test 1: JS - Strings simples
  console.log("✓ Test 1: JS - Strings simples");
  const jsCode = 'const msg = "fetch user";';
  const jsResult = await translateStructural({ code: jsCode, language: "js" });
  console.log(`  Original: ${jsCode}`);
  console.log(`  Traducido: ${jsResult.code}`);
  console.log(`  Strings reemplazados: ${jsResult.replacedStrings}`);
  console.log(`  Código intacto: ${!jsResult.code.includes("const")} ✓\n`);

  // Test 2: TS - Template literals con expresiones
  console.log("✓ Test 2: TS - Template literals con expresiones");
  const tsCode = "const greeting = `welcome ${user.name}`;";
  const tsResult = await translateStructural({ code: tsCode, language: "ts" });
  console.log(`  Original: ${tsCode}`);
  console.log(`  Traducido: ${tsResult.code}`);
  console.log(`  Expresión preservada: ${tsResult.code.includes("${user.name}")} ✓\n`);

  // Test 3: JSX - Textos y comentarios con identación
  console.log("✓ Test 3: JSX - Textos y comentarios con identación");
  const jsxCode = `export const UserCard = () => {
  // fetch user data
  return (
    <div className="card">
      <p>welcome user</p>
    </div>
  );
};`;
  const jsxResult = await translateStructural({ code: jsxCode, language: "jsx" });
  console.log(`  Original:\n${jsxCode}`);
  console.log(`\n  Traducido:\n${jsxResult.code}`);
  console.log(`  Comentario traducido: ${jsxResult.code.includes("obtener usuario datos")} ✓`);
  console.log(`  Texto JSX traducido: ${jsxResult.code.includes("bienvenido usuario")} ✓`);
  console.log(`  Identación preservada: ${jsxResult.code.includes("    <div")} ✓\n`);

  // Test 4: Python - Strings y comentarios
  console.log("✓ Test 4: Python - Strings y comentarios");
  const pyCode = `def get_user():
    # fetch user from db
    message = "welcome user"
    return message`;
  const pyResult = await translateStructural({ code: pyCode, language: "python" });
  console.log(`  Original:\n${pyCode}`);
  console.log(`\n  Traducido:\n${pyResult.code}`);
  console.log(`  Comentario traducido: ${pyResult.code.includes("obtener usuario")} ✓`);
  console.log(`  String traducido: ${pyResult.code.includes("bienvenido usuario")} ✓`);
  console.log(`  Identación preservada: ${pyResult.code.includes("    # ")} ✓\n`);

  // Test 5: Fallback - Go (sin parser)
  console.log("✓ Test 5: Fallback - Go (sin parser)");
  const goCode = `func FetchUser() {
    // fetch user data
    message := "welcome user"
}`;
  const goResult = await translateStructural({ code: goCode, language: "go" });
  console.log(`  Original:\n${goCode}`);
  console.log(`\n  Traducido (fallback textual):\n${goResult.code}`);
  console.log(`  Fallback aplicado: ${goResult.fallbackApplied} ✓`);
  console.log(`  Palabras traducidas: ${goResult.code.includes("obtener")} y ${goResult.code.includes("bienvenido")} ✓\n`);

  // Test 6: Detección automática
  console.log("✓ Test 6: Detección automática - JSX");
  const autoJsx = `<UserComponent>
    <h1>welcome user</h1>
  </UserComponent>`;
  const autoResult = await translateStructural({ code: autoJsx });
  console.log(`  Original:\n${autoJsx}`);
  console.log(`\n  Detectado como: ${autoResult.language}`);
  console.log(`  Traducido:\n${autoResult.code}`);
  console.log(`  Lenguaje correcto (jsx): ${autoResult.language === "jsx"} ✓\n`);

  // Test 7: Comentarios independientes
  console.log("✓ Test 7: Comentarios independientes");
  const commentCode = `// fetch user data
const name = "function";`;
  const commentResult = await translateStructural({ code: commentCode, language: "js" });
  console.log(`  Original:\n${commentCode}`);
  console.log(`\n  Traducido:\n${commentResult.code}`);
  console.log(`  Comentarios reemplazados: ${commentResult.replacedComments}`);
  console.log(`  Strings reemplazados: ${commentResult.replacedStrings}`);
  console.log(`  Contadores correctos: ${commentResult.replacedComments + commentResult.replacedStrings === 2} ✓\n`);

  console.log("========== VALIDACIÓN COMPLETADA ==========\n");
}

runValidation().catch(err => {
  console.error("Error en validación:", err);
  process.exit(1);
});
