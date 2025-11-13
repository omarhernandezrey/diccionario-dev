import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  {
    ignores: [
      // Default ignores de eslint-config-next (redefinidos para ESLint 8).
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "scripts/**",
      "prisma/**",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
  ...compat.extends("next/typescript"),
];

export default eslintConfig;
