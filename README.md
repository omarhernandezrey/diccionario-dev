# Diccionario Dev — Diccionario técnico web en español con snippets auditados

[![CI](https://github.com/omarhernandezrey/diccionario-dev/actions/workflows/ci.yml/badge.svg)](https://github.com/omarhernandezrey/diccionario-dev/actions/workflows/ci.yml)
[![OpenAPI Pages](https://github.com/omarhernandezrey/diccionario-dev/actions/workflows/openapi-pages.yml/badge.svg?branch=main)](https://github.com/omarhernandezrey/diccionario-dev/actions/workflows/openapi-pages.yml)
[![OpenAPI Docs](https://img.shields.io/badge/OpenAPI-docs-6BA539?logo=swagger)](https://omarhernandezrey.github.io/diccionario-dev/)

Buscador y panel de administración para términos técnicos de desarrollo web en español. Centraliza definiciones, traducciones, ejemplos y variantes de código en una sola app, con API pública y extensiones.

## Demo / URL

- App local: `http://localhost:3000` (tras el Quickstart).
- OpenAPI Docs: `https://omarhernandezrey.github.io/diccionario-dev/`.
- Demo pública: no publicada en este repo (usa el entorno local o despliega tu instancia).

## Credenciales de prueba

El admin inicial se crea en el seed con las credenciales definidas en `.env`:

- `ADMIN_USERNAME` y `ADMIN_PASSWORD` (ver `.env.example`).

## Screenshots / GIF

Pendiente de agregar. Sugerencia: `docs/screenshots/home.png`, `docs/screenshots/admin.png`, `docs/screenshots/translate.gif`.

## Características

- Búsqueda de términos con modos: Concepto, Entrevista, Debug y Traducción.
- Definiciones ES/EN, tags, aliases, ejemplos y variantes por lenguaje.
- Preview interactivo para snippets HTML/CSS/Tailwind.
- Panel admin con autenticación JWT + cookies HttpOnly y CRUD de términos.
- Historial, métricas, rate limiting y logging estructurado.
- Módulos de entrenamiento: quizzes, soft skills, entrevistas en vivo.
- Extensiones oficiales: navegador y VS Code.
- OpenAPI generado automáticamente para integraciones.

## Stack / Tecnologías

- Next.js 14 (App Router) + React 18 + TypeScript.
- Prisma ORM + PostgreSQL.
- Zod para validación de payloads.
- Redis opcional para rate limiting.
- Vitest + c8 para tests.
- Tailwind CSS 4 para UI.

## Requisitos

- Node.js 20.x recomendado (CI/DevContainers usan 20).
- NPM (incluido con Node).
- PostgreSQL (local o gestionado; Docker Compose usa Postgres 16).
- Redis opcional (fallback a memoria si no hay `REDIS_URL`).

## Quickstart

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma generate
npm run prisma:seed
npm run dev
```

Abrir: `http://localhost:3000`.

Nota Prisma 6: `DATABASE_URL` debe existir en tiempo de build (`npm run build`), tanto en local como en CI.

## Variables de entorno

`.env.example` incluye todos los defaults. Nunca pongas secretos reales en el repo.

| Variable | Requerida | Descripción | Ejemplo |
| --- | --- | --- | --- |
| `DATABASE_URL` | Sí | Conexión PostgreSQL | `postgresql://postgres:postgres@localhost:5432/diccionario` |
| `JWT_SECRET` | Sí | Secreto para firmar JWT | `openssl rand -base64 48` |
| `JWT_EXPIRES_IN` | Sí | TTL de JWT | `1d` |
| `APP_URL` | Sí | Base URL para recovery | `http://localhost:3000` |
| `AUTH_RECOVERY_EXPOSE_TOKEN` | No | Dev-only: expone token en respuesta | `true` |
| `RESEND_API_KEY` | No | API key de Resend | `re_xxx` |
| `EMAIL_FROM` | No | Remitente de emails | `onboarding@resend.dev` |
| `ADMIN_USERNAME` | Sí | Usuario admin seed | `admin` |
| `ADMIN_PASSWORD` | Sí | Password admin seed | `S3gura!` |
| `ADMIN_EMAIL` | Sí | Email admin seed | `admin@example.com` |
| `GOOGLE_CLIENT_ID` | No | OAuth Google (server) | `tu-client-id` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | No | OAuth Google (client) | `tu-client-id` |
| `ADMIN_TOKEN` | No | Registro sin sesión admin (solo dev) | `token-dev` |
| `NEXT_PUBLIC_ADMIN_TOKEN` | No | Registro sin sesión admin (client) | `token-dev` |
| `DISABLE_SEARCH_LOGS` | No | Desactiva logs de búsqueda | `true` |
| `ENABLE_QUIZ_AUTOSEED` | No | Autoseed de quizzes | `true` |
| `QUIZ_AUTOSEED_INCLUDE_TERMS` | No | Incluye términos en autoseed | `true` |
| `REDIS_URL` | No | Redis para rate limiting | `redis://localhost:6379` |

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Next.js en modo desarrollo |
| `npm run build` | `prisma generate` + `next build` |
| `npm run start` | Ejecuta el build en producción |
| `npm run lint` | ESLint con warnings = 0 |
| `npm run typecheck` | TypeScript sin emitir |
| `npm run test` | Vitest (suite completa) |
| `npm run test:unit` | Tests unitarios |
| `npm run test:integration` | Tests de integración |
| `npm run test:coverage` | Cobertura mínima 60% (c8) |
| `npm run prisma:migrate` | Prisma migrate dev |
| `npm run prisma:seed` | Seed de términos + admin |
| `npm run db:reset` | Reset completo de BD |
| `npm run docs:openapi` | Genera `scripts/openapi.json` |
| `npm run dev:init` | Setup inicial en contenedores |

## Estructura del proyecto

```text
.
├─ src/
│  ├─ app/                # App Router + páginas + API routes
│  ├─ components/         # UI y módulos de dominio
│  ├─ lib/                # Auth, validación, rate limit, OpenAPI, utils
│  ├─ hooks/              # Hooks de datos
│  └─ types/              # Tipos de dominio
├─ prisma/                # schema.prisma, seeds y dataset
├─ integrations/          # Extensión navegador + VS Code
├─ tests/                 # Vitest (unit + integration)
├─ scripts/               # Utilidades y generación de data/OpenAPI
├─ docs/                  # Documentación extendida
└─ public/                # Assets estáticos
```

## Arquitectura

- **Frontend**: Next.js App Router con UI modular en `src/components`.
- **API**: endpoints en `src/app/api/*/route.ts` con validación Zod (`src/lib/validation.ts`).
- **Auth**: JWT + cookies HttpOnly (`src/lib/auth.ts`) y bootstrap admin vía seed.
- **Datos**: Prisma Client + PostgreSQL (`prisma/schema.prisma`).
- **Rate limit**: Redis opcional con fallback en memoria (`src/lib/rate-limit.ts`).
- **Observabilidad**: logging estructurado con Pino (`src/lib/logger.ts`).

## API / Endpoints

Base URL local: `http://localhost:3000`.

Endpoints principales:

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/terms` | Búsqueda con filtros y paginación |
| `GET` | `/api/terms/:id` | Detalle de término |
| `POST` | `/api/terms` | Crear término (admin) |
| `PATCH` | `/api/terms/:id` | Actualizar término (admin) |
| `DELETE` | `/api/terms/:id` | Eliminar término (admin) |
| `POST` | `/api/auth/login` | Login (cookie HttpOnly) |
| `POST` | `/api/auth/register` | Registro (admin o bootstrap) |
| `GET` | `/api/auth` | Sesión actual |
| `DELETE` | `/api/auth` | Logout |
| `POST` | `/api/translate` | Traducción estructural de código |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/openapi` | OpenAPI JSON |
| `GET` | `/api/extensions/browser` | Descarga extensión navegador |
| `GET` | `/api/extensions/vscode` | Descarga extensión VS Code |

Documentación completa: `https://omarhernandezrey.github.io/diccionario-dev/` o `GET /api/openapi`.

## Base de datos / migraciones

- Prisma + PostgreSQL con modelo ampliado (términos, variantes, historial, quizzes, soft skills, métricas).
- Migraciones:

```bash
npx prisma migrate dev --name init
npx prisma migrate deploy
```

- Seed:

```bash
npm run prisma:seed
```

## Testing

```bash
npm run test
npm run test:unit
npm run test:integration
npm run test:coverage
```

Smoke test para auth (opcional):

```bash
npm run test:auth
```

## CI/CD

GitHub Actions:

- `ci.yml`: lint + typecheck + build + tests.
- `pr-build.yml`: build rápido en PRs.
- `openapi-pages.yml`: genera y publica Swagger UI en GitHub Pages.
- `release.yml`: releases con Changesets.

## Deploy

### Vercel

1. Conecta el repo en Vercel.
2. Define env vars (`DATABASE_URL`, `JWT_SECRET`, etc.).
3. Build command: `npm run build`.
4. Start command: `npm run start`.

### Docker Compose (local)

```bash
docker compose up -d
docker compose logs -f next
```

App en `http://localhost:3001`.

## Seguridad

- JWT + cookies HttpOnly (SameSite Lax, Secure en prod).
- Rate limiting opcional con Redis.
- Reporte responsable en `SECURITY.md` (seguridad@diccionario.dev).

## Accesibilidad + performance

- UI basada en componentes y Tailwind; evita controles no accesibles.
- Recomiendo ejecutar Lighthouse en la landing y el panel admin antes de releases.
- Optimiza imágenes en `public/` y evita renders innecesarios en `src/components`.

## Roadmap

- Refresh tokens y sesiones prolongadas.
- Roles avanzados + gestión de usuarios en el panel.
- E2E tests con Playwright.
- Demo pública estable con dataset curado.

## Contribuir

Lee `CONTRIBUTING.md` y `CODE_OF_CONDUCT.md`. Usa Conventional Commits y ejecuta `npm run lint` + `npm run test` antes de abrir PR.

## Licencia

MIT. Ver `LICENSE`.

## Changelog / Releases

- `CHANGELOG.md` con el historial público.
- Releases automatizados vía Changesets.

## Autor / Contacto

Omar Hernandez Rey — `seguridad@diccionario.dev` (seguridad) · GitHub: `omarhernandezrey`.
