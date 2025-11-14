import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@ladle/react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  stories: "./src/**/*.stories.@(ts|tsx)",
  viteConfig: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  },
});
