import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Código CSS limpio para style-element (sin HTML envolvente)
const cleanStyleElementCode = `<style>
  :root {
    --color-primary: #667eea;
    --spacing-unit: 1rem;
  }
  
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
  
  @media (max-width: 768px) {
    body {
      font-size: 14px;
    }
  }
</style>

<button>Click aquí</button>`;

async function fixStyleElement() {
  try {
    console.log("🔧 Arreglando style-element...\n");

    const term = await prisma.term.findUnique({
      where: { term: "style-element" },
      include: { variants: true }
    });

    if (!term) {
      console.log("❌ Término style-element no encontrado");
      await prisma.$disconnect();
      return;
    }

    // Encontrar la variante HTML
    const htmlVariant = term.variants.find(v => v.language === "html");

    if (!htmlVariant) {
      console.log("❌ No hay variante HTML para style-element");
      await prisma.$disconnect();
      return;
    }

    // Actualizar con código limpio
    await prisma.termVariant.update({
      where: { id: htmlVariant.id },
      data: {
        snippet: cleanStyleElementCode
      }
    });

    console.log("✅ style-element actualizado correctamente");
    console.log(`\n📝 Código guardado: ${cleanStyleElementCode.length} caracteres`);

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    await prisma.$disconnect();
  }
}

fixStyleElement();
