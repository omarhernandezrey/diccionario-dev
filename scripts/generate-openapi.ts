#!/usr/bin/env tsx
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { getOpenApiDocument } from "../src/lib/openapi";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const document = getOpenApiDocument();
  const outputPath = path.resolve(__dirname, "openapi.json");
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(document, null, 2), "utf-8");
  console.log(`OpenAPI guardado en ${outputPath}`);
}

main().catch((error) => {
  console.error("Error generando OpenAPI:", error);
  process.exit(1);
});
