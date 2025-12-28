import { NextRequest, NextResponse } from "next/server";
import postcss from "postcss";

export async function POST(req: NextRequest) {
    try {
        let html = "";
        try {
            const body = await req.json();
            html = body.html || "";
        } catch {
            // Si no hay body o no es JSON, html queda vacío
        }

        // Carga perezosa para no fallar si no existe @tailwindcss/postcss
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let tailwindPlugin: any = null;
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
            tailwindPlugin = require("@tailwindcss/postcss");
        } catch {
            try {
                // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
                tailwindPlugin = require("tailwindcss");
            } catch {
                tailwindPlugin = null;
            }
        }

        if (!tailwindPlugin) {
            return NextResponse.json({ css: "" });
        }

        const result = await postcss([
            tailwindPlugin({
                content: [{ raw: html }],
                theme: {},
                corePlugins: true,
            }),
        ]).process("@tailwind utilities;", { from: undefined });

        return NextResponse.json({ css: result.css });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        console.error("compile-tailwind error:", e);

        // Si falta el plugin de PostCSS en Tailwind 4, devolvemos CSS vacío para no romper el preview.
        if (typeof message === "string" && message.includes("use `@tailwindcss/postcss`")) {
            return NextResponse.json({ css: "" });
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
