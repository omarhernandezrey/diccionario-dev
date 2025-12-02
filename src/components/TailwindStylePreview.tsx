import { useEffect, useRef } from "react";

type TailwindStylePreviewProps = {
  html: string;
  css?: string;
  rawCss?: string;
  compiledCss?: string;
};

export default function TailwindStylePreview({ html, css, rawCss, compiledCss }: TailwindStylePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    const cssToInject = css ?? rawCss ?? "";

    doc.open();
    doc.write(`
      <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            ${cssToInject}
            ${compiledCss || ""}
          </style>
        </head>
        <body class="p-6 bg-white min-h-[250px]">
          ${html}
        </body>
      </html>
    `);
    doc.close();
  }, [html, css, rawCss, compiledCss]);

  return (
    <div className="border rounded-xl shadow-sm bg-white overflow-hidden w-full min-h-[350px]">
      <iframe
        ref={iframeRef}
        className="w-full h-[350px] border-0"
        sandbox="allow-scripts allow-same-origin"
        title="Tailwind live preview"
      />
    </div>
  );
}
