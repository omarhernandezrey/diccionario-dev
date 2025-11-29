import { NextApiRequest, NextApiResponse } from "next";
import postcss from "postcss";
import tailwindcss from "tailwindcss";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { html } = (req.body || {}) as { html?: string };

  try {
    const result = await postcss([
      tailwindcss({
        content: [{ raw: html || "" }],
        theme: {},
        corePlugins: true,
      }),
    ]).process("@tailwind utilities;", { from: undefined });

    res.status(200).json({ css: result.css });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("compile-tailwind error:", e);
    res.status(500).json({ error: message });
  }
}
