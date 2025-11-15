# Contribuciones

Gracias por tu interés en mejorar el diccionario de CSS de Omar Hernandez Rey. Este documento describe el flujo de trabajo esperado para mantener el repositorio con un estándar profesional.

## Requisitos previos

- Node.js LTS y pnpm/npm instalados.
- Docker si deseas levantar la base de datos local.
- Familiaridad con Next.js, Prisma y TypeScript.

## Configuración local

1. Haz un fork del repositorio.
2. Clona tu fork y crea una rama descriptiva (`feature/mi-mejora`, `fix/bug-x`).
3. Instala dependencias (`npm install`).
4. Ejecuta la base de datos y aplica migraciones (`npx prisma migrate dev` o `docker compose up -d` según corresponda).
5. Corre `npm run dev` para verificar que el entorno funciona antes de empezar.

## Estándares de código

- TypeScript estricto, componentes funcionales y hooks idiomáticos.
- Tailwind: utiliza utilidades existentes, evita CSS ad-hoc salvo componentes globales.
- Prisma: cualquier cambio en datos debe pasar por migraciones o seed.
- Ejecuta `npm run lint` y `npm run test` antes de abrir un PR.

## Flujo de trabajo de Git

1. Rama basada en `main` actualizada.
2. Commits pequeños, con mensajes claros en imperativo.
3. Sin force-push sobre ramas compartidas. Rebase solo en tu fork.

## Pull requests

- Completa el template provisto.
- Describe el contexto, capturas relevantes y pasos para probar.
- Incluye pruebas o explica por qué no aplican.
- Espera revisión antes de fusionar.

## Reporte de issues

- Revisa issues existentes para evitar duplicados.
- Usa los templates (bug/performance/feature).
- Proporciona pasos reproducibles, logs y entorno.

## Seguridad

Fallas de seguridad jamás deben publicarse en issues. Sigue las instrucciones de `SECURITY.md` para divulgación responsable.

## Código de conducta

Todo colaborador debe cumplir el `CODE_OF_CONDUCT.md`. El incumplimiento implica acciones a discreción de la mantención del proyecto.
