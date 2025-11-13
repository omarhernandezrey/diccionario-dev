import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const html = String.raw;

function getHtml() {
  return html`<!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>API Docs · Diccionario</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
      <style>
        body { margin: 0; background: #0b1220; }
        #swagger-ui { max-width: 980px; margin: 0 auto; }
        .swagger-ui .topbar { display: none; }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin="anonymous"></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            url: '/api/openapi',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [SwaggerUIBundle.presets.apis],
            layout: 'BaseLayout',
          });
        };
      </script>
    </body>
  </html>`;
}

export async function GET() {
  return new NextResponse(getHtml(), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
