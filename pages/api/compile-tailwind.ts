import { NextApiRequest, NextApiResponse } from "next";
import postcss from "postcss";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { html } = (req.body || {}) as { html?: string };

  try {
    // Carga perezosa para no fallar si no existe @tailwindcss/postcss
    let tailwindPlugin: any = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      tailwindPlugin = require("@tailwindcss/postcss");
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      tailwindPlugin = require("tailwindcss");
    }

    if (!tailwindPlugin) {
      return res.status(200).json({ css: "" });
    }

    const result = await postcss([
      tailwindPlugin({
        content: [{ raw: html || "" }],
        theme: {},
        corePlugins: true,
      }),
    ]).process("@tailwind utilities;", { from: undefined });

    res.status(200).json({ css: result.css });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("compile-tailwind error:", e);
    // Si falta el plugin de PostCSS en Tailwind 4, devolvemos CSS vacío para no romper el preview.
    if (typeof message === "string" && message.includes("use `@tailwindcss/postcss`")) {
      return res.status(200).json({ css: "" });
    }
    res.status(500).json({ error: message });
  }
}
