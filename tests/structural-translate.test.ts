import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { translateStructural, resetTranslationCache } from "@/lib/structural-translate";
import { prisma } from "@/lib/prisma";

const dictionary = [
  { term: "fetch", translation: "obtener", aliases: ["request"] },
  { term: "user", translation: "usuario", aliases: [] },
  { term: "welcome", translation: "bienvenido", aliases: [] },
  { term: "state", translation: "estado", aliases: [] },
];

describe("translateStructural", () => {
  beforeEach(() => {
    resetTranslationCache();
    vi.spyOn(prisma.term, "findMany").mockResolvedValue(dictionary as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("translates JS string literals without altering the rest of the snippet", async () => {
    const code = 'const label = "fetch user";';
    const result = await translateStructural({ code, language: "js" });
    expect(result.code).toContain('"obtener usuario"');
    expect(result.fallbackApplied).toBe(false);
    expect(result.replacedStrings).toBeGreaterThan(0);
  });

  it("translates template literals preserving expressions", async () => {
    const code = "const view = `Welcome ${user.name}`;";
    const result = await translateStructural({ code, language: "js" });
    expect(result.code).toContain("`Bienvenido ${user.name}`");
    expect(result.replacedStrings).toBe(1);
  });

  it("updates comments independently from code", async () => {
    const code = '// fetch user\nconst name = "user";';
    const result = await translateStructural({ code, language: "ts" });
    expect(result.code.startsWith("// obtener usuario")).toBe(true);
    expect(result.replacedComments).toBe(1);
  });

  it("supports python strings", async () => {
    const code = 'def example():\n    greeting = "welcome user"\n';
    const result = await translateStructural({ code, language: "python" });
    expect(result.code).toContain('"bienvenido usuario"');
    expect(result.replacedStrings).toBe(1);
  });

  it("falls back to textual translation for unsupported languages", async () => {
    const code = "FETCH USER";
    const result = await translateStructural({ code, language: "go" });
    expect(result.fallbackApplied).toBe(true);
    expect(result.code).toContain("OBTENER USUARIO");
  });
});
