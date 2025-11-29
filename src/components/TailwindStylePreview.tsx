import { useEffect, useRef } from "react";

type Props = {
  html: string;
  css: string;
};

export default function TailwindStylePreview({ html, rawCss, compiledCss }: Props & { rawCss?: string; compiledCss?: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`
      <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            ${rawCss || ""}
            ${compiledCss || ""}
          </style>
        </head>
        <body class="p-6 bg-white min-h-[250px]">
          ${html}
        </body>
      </html>
    `);
    doc.close();
  }, [html, rawCss, compiledCss]);

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
