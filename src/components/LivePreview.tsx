'use client';

import React, { useEffect, useRef, useState } from 'react';

interface LivePreviewProps {
  code: string;
  language?: 'html' | 'javascript' | 'jsx' | 'css';
  title?: string;
  height?: string;
}

export function LivePreview({ code, language = 'html', title, height = '400px' }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);

  const wrapDocument = (bodyContent: string, headContent = '') => `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      ${headContent}
    </head>
    <body>
      ${bodyContent}
    </body>
    </html>
  `;

  useEffect(() => {
    if (!iframeRef.current) return;

    try {
      setError(null);

      // Determinar el contenido según el lenguaje
      const hasFullHtml = /<html[\s>]/i.test(code) || /<body[\s>]/i.test(code);
      let htmlContent = '';

      if (language === 'html') {
        // Respetar el HTML tal cual venga en el snippet
        htmlContent = hasFullHtml ? code : wrapDocument(code);
      } else if (language === 'javascript' || language === 'jsx') {
        const script = `
          <script>
            try {
              ${code}
            } catch (err) {
              const pre = document.createElement('pre');
              pre.style.color = '#dc2626';
              pre.textContent = err?.message || String(err);
              document.body.appendChild(pre);
            }
          </script>
        `;

        const baseStyles = `
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
            button { background: #0f172a; color: white; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; }
            input, textarea { padding: 8px 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-family: inherit; }
          </style>
        `;

        htmlContent = hasFullHtml
          ? code
          : wrapDocument('<div id="root"></div>', `${baseStyles}${script}`);
      } else if (language === 'css') {
        const styleTag = `<style>${code}</style>`;
        htmlContent = hasFullHtml ? code : wrapDocument('<div class="preview"></div>', styleTag);
      }

      // Escribir contenido en el iframe
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }, [code, language]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {title && (
        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
          <p className="text-sm font-semibold text-slate-700">{title}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <p className="text-sm text-red-700">
            <span className="font-semibold">Error:</span> {error}
          </p>
        </div>
      )}

      <div className="bg-white">
        <iframe
          ref={iframeRef}
          style={{
            width: '100%',
            height,
            border: 'none',
            display: error ? 'none' : 'block',
          }}
          title="Live Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200">
        <p className="text-xs text-slate-600">
          Preview en vivo de: <span className="font-mono bg-slate-100 px-2 py-1 rounded">{language}</span>
        </p>
      </div>
    </div>
  );
}
