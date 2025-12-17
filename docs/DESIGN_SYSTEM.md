# Design System — Diccionario Dev

## Paleta (tokens)

La paleta oficial vive en `src/app/globals.css` y se expone por Tailwind como `neo-*` (superficies) y `accent-*` (semánticos).

### Superficies (`neo`)
- `--neo-bg`: fondo global
- `--neo-card`: tarjetas / contenedores
- `--neo-surface`: superficies elevadas / inputs
- `--neo-border`: bordes
- `--neo-text-primary`: texto principal
- `--neo-text-secondary`: texto secundario

### Marca y acentos (`neo`)
- `--neo-primary`: color primario de marca
- `--neo-accent-purple`, `--neo-accent-cyan`, `--neo-accent-pink`, `--neo-accent-orange`, `--neo-accent-lime`: acentos puntuales (usar con moderación)

### Estados semánticos (`neo`)
- `--neo-success`, `--neo-warning`, `--neo-danger`, `--neo-info`

### Alias Tailwind (`accent-*`)
Estas clases están mapeadas a variables para que se adapten a light/dark:
- `accent-primary` → `--accent-primary` → `--neo-primary`
- `accent-secondary` → `--accent-secondary` → `--neo-accent-purple`
- `accent-emerald` → `--accent-emerald` → `--neo-success`
- `accent-amber` → `--accent-amber` → `--neo-warning`
- `accent-danger` / `accent-rose` → `--neo-danger`
- `accent-cyan` → `--neo-info`

### Charts
Colores para gráficas (Recharts / SVG) con soporte light/dark:
- `--chart-1` … `--chart-8`

## Tipografía

La fuente global (para todo el texto) es **JetBrains Mono** vía `next/font/google` y el token `--font-ui`.

Regla práctica:
- UI/Texto: usa estilos neutros (`neo-*`) y resalta con `accent-*` cuando sea estado/acción.
- Evita hardcodes (`#...`) y colores directos (`text-emerald-*`, `bg-indigo-*`, etc.). Si hace falta un nuevo color, se agrega como token en `src/app/globals.css` y se expone en `tailwind.config.cjs`.

