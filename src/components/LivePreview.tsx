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

  useEffect(() => {
    if (!iframeRef.current) return;

    try {
      setError(null);

      // Determinar el contenido según el lenguaje
      let htmlContent = '';

      if (language === 'html') {
        // Código HTML puro
        htmlContent = code;
      } else if (language === 'javascript' || language === 'jsx') {
        // Envolver JavaScript en HTML
        htmlContent = `
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                margin: 0;
                padding: 20px;
                background: #f5f5f5;
              }
              .output { color: #333; }
              .error { color: #d32f2f; font-weight: bold; }
              button {
                background: #667eea;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
              }
              button:hover { background: #5568d3; }
              input, textarea {
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-family: monospace;
              }
            </style>
          </head>
          <body>
            <div id="root"></div>
            <script>
              ${code}
            </script>
          </body>
          </html>
        `;
      } else if (language === 'css') {
        // Envolver CSS en HTML
        htmlContent = `
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              ${code}
            </style>
          </head>
          <body>
            <div class="demo">
              <h1>Demo CSS</h1>
              <p>Este es un elemento de demostración.</p>
              <button>Ejemplo de Botón</button>
              <input type="text" placeholder="Ejemplo de input">
            </div>
          </body>
          </html>
        `;
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
