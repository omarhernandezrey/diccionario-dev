import { describe, expect, it } from "vitest";
import { termSchema, termsQuerySchema } from "@/lib/validation";

describe("validation schemas", () => {
  it("normaliza alias/tags y aplica defaults en termSchema", () => {
    const parsed = termSchema.parse({
      term: "CSS Grid",
      translation: "Rejilla CSS",
      aliases: [" CSS ", "css", "Css Grid"],
      tags: ["Layout", "layout"],
      category: "frontend",
      meaning: "Sistema bidimensional.",
      what: "Permite acomodar elementos en filas/columnas.",
      how: "Definir display:grid y columnas con fracciones.",
      examples: [
        {
          title: "Declaración",
          code: "display: grid;",
          note: "Snippet básico",
        },
      ],
    });

    expect(parsed.aliases).toEqual(["css", "css grid"]);
    expect(parsed.tags).toEqual(["layout"]);
    expect(Array.isArray(parsed.examples)).toBe(true);
  });

  it("aplica defaults cuando no se envían arreglos opcionales", () => {
    const parsed = termSchema.parse({
      term: "API",
      translation: "Interfaz de programación",
      category: "general",
      meaning: "Conjunto de contratos.",
      what: "Define métodos y estructuras.",
      how: "A través de protocolos HTTP.",
    });

    expect(parsed.aliases).toEqual([]);
    expect(parsed.tags).toEqual([]);
    expect(parsed.examples).toEqual([]);
  });

  it("normaliza filtros y defaults en termsQuerySchema", () => {
    const parsed = termsQuerySchema.parse({
      q: "   grid   ",
      category: "frontend",
      tag: "   layout ",
    });

    expect(parsed.q).toBe("grid");
    expect(parsed.tag).toBe("layout");
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(50);
    expect(parsed.sort).toBe("term_asc");
  });
});
