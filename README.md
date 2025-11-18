## Diccionario Técnico Web (ES)

[![CI](https://github.com/omarhernandezrey/diccionario-dev/actions/workflows/ci.yml/badge.svg)](https://github.com/omarhernandezrey/diccionario-dev/actions/workflows/ci.yml)
[![OpenAPI Pages](https://github.com/omarhernandezrey/diccionario-dev/actions/workflows/openapi-pages.yml/badge.svg?branch=main)](https://github.com/omarhernandezrey/diccionario-dev/actions/workflows/openapi-pages.yml)
[![OpenAPI Docs](https://img.shields.io/badge/OpenAPI-docs-6BA539?logo=swagger)](https://omarhernandezrey.github.io/diccionario-dev/)

Buscador y panel de administración para términos técnicos de desarrollo web en español. Cada entrada describe significado, qué hace, cómo implementarlo y ejemplos de código.

Stack principal:

- Next.js (App Router) + React 18 + TypeScript
- Prisma ORM con SQLite
- Zod para validación
- JWT + cookies HttpOnly para autenticación

---

### Quickstart (5 minutos)

1. Copia el archivo [`./.env.example`](./.env.example) a `.env` y ajusta los secretos (`JWT_SECRET`, `ADMIN_PASSWORD`, etc.).
2. Instala dependencias: `npm install`.
3. Aplica migraciones y genera el cliente: `npx prisma migrate dev`.
4. Inserta datos + admin inicial: `npm run prisma:seed`.
5. Levanta el entorno local: `npm run dev` (http://localhost:3000).
6. Verifica el build con Prisma 6 exportando la base al vuelo:

   ```bash
   DATABASE_URL="file:./prisma/dev.db" npm run build
   ```

> Prisma 6 necesita que `DATABASE_URL` esté disponible en el entorno en tiempo de compilación (e.g. CI/Vercel). Si usas otro motor o variable secreta, expórtala antes de `npm run build`.

---

## Desarrollo en Dev Containers (un clic)

Este repo incluye configuración de Dev Containers. Al abrir la carpeta en VS Code y seleccionar “Reopen in Container”:

- Se usa la imagen `typescript-node:20` (Node LTS).
- Se instalan dependencias y se ejecuta `npm run dev:init` automáticamente (Prisma generate + migrate deploy + seed).
- Quedas listo para ejecutar `npm run dev` dentro del contenedor.

Requisitos previos en tu host:

- Docker Desktop/Engine activo.
- Extensión “Dev Containers” en VS Code.

Consejos:
- El socket Docker del host está montado, por lo que puedes ejecutar comandos Docker desde el contenedor si lo necesitas.
- Ajusta secretos copiando `.env.example` a `.env` antes de “Reopen in Container” (o dentro del contenedor).

---

### 1. Requisitos de entorno

- Node.js >= 18
- NPM (incluido con Node)
- SQLite viene embebido vía Prisma

Clona el repo y copia `.env.example` a `.env`, luego ajusta los valores (ver sección _Variables de entorno_).

---

### 2. Instalación y comandos clave

```bash
npm install

# Genera/actualiza esquema y cliente Prisma
npx prisma migrate dev
npx prisma generate

# Inserta datos de demostración + admin inicial
npm run prisma:seed

# Levanta la app en http://localhost:3000
npm run dev

# Script de humo para auth (opcional, ver sección Tests)
node scripts/test-auth.js
```

Atajos disponibles en `package.json`:

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Next.js en modo desarrollo |
| `npm run build` | `prisma generate` + `next build` |
| `npm run start` | Ejecuta el build en modo producción |
| `npm run prisma:migrate` | Alias de `prisma migrate dev` |
| `npm run prisma:seed` | Rellena términos + admin |
| `npm run db:reset` | Limpia el `dev.db` y reaplica migraciones |
| `npm run test:auth` | Ejecuta `node scripts/test-auth.js` |

---

## Despliegue local con Docker Compose

Este stack incluye `next` (Next.js + SQLite) y `redis` (para rate limit). El servicio `next` corre `npm run dev:init` al arrancar, expone el puerto 3000 en el contenedor como 3001 en el host y tiene healthcheck con curl.

Arranque:

```bash
docker compose up -d
# App disponible en http://localhost:3001
```

Logs de la app:

```bash
docker compose logs -f next
```

Pruebas con Compose (perfil test):

```bash
docker compose --profile test up --abort-on-container-exit --exit-code-from test test
```

Para detener:

```bash
docker compose down
```

Notas:
- El healthcheck comprueba `/api/terms` y marca el servicio como healthy.
- Si no deseas Redis, puedes omitir su uso (la app tiene fallback en memoria para rate limit), pero el servicio está listo para usar `REDIS_URL`.

---

### Integraciones y flujo real

- **Extensión de navegador** (`integrations/browser-extension`): instala la carpeta como extensión sin empaquetar (Chrome → More Tools → Extensions → Load unpacked). Obtienes 2 gestos rápidos:
  - Menú contextual sobre cualquier texto para “Buscar en Diccionario Dev”.
  - Hotkey `Ctrl/Cmd + Shift + D` que envía la selección de la pestaña activa; si el fragmento parece código, abre la app directamente en modo traducción estructural.
- **Helper de VS Code** (`integrations/vscode-helper`): ejecuta `F5` dentro de la carpeta o empaqueta como extensión local. El comando `Diccionario Dev: Translate Selection` detecta automáticamente si debe traducir un bloque de código o buscar un término. El resultado se refleja en el output channel y, si hay traducción estructural, abre un documento temporal con el snippet traducido.
- **Portapapeles inteligente**: el buscador web detecta cuando pegas un bloque grande de código en el input principal. En cuanto identificamos llaves, imports o múltiples líneas, cambiamos el contexto a “Traducción”, activamos el modo `code` y mostramos un aviso para que sigas trabajando sin tener que mover switches manualmente.

---

### 3. Variables de entorno

Referencia rápida (`.env.example` tiene valores sugeridos):

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="cambia-este-secreto-muy-seguro"
JWT_EXPIRES_IN="1d"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="cambia-esta-contraseña"
ADMIN_EMAIL="admin@example.com"
# ADMIN_TOKEN="token-anterior"            # opcional, usado como fallback de contraseña
```

- `DATABASE_URL`: ruta SQLite.
- `JWT_SECRET`: secreto para firmar/verificar JWT (obligatorio).
- `JWT_EXPIRES_IN`: duración del token (ej. `1d`, `12h`, `3600`).
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_EMAIL`: credenciales para el usuario sembrado (rol admin).
- `ADMIN_TOKEN` (opcional): si ya tenías un token previo lo puedes reutilizar como fallback de contraseña para el seed.

---

### 4. Modelo Prisma (resumen)

```prisma
model Term {
  id           Int       @id @default(autoincrement())
  term         String    @unique
  translation  String    @default("")
  aliases      Json      @default("[]")
  tags         Json      @default("[]")
  category     Category
  meaning      String
  what         String
  how          String
  examples     Json      @default("[]")
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  createdById  Int?
  updatedById  Int?
  createdBy    User?     @relation("TermsCreated", fields: [createdById], references: [id])
  updatedBy    User?     @relation("TermsUpdated", fields: [updatedById], references: [id])
  history      TermHistory[]

  @@index([term])
  @@index([translation])
  @@index([category])
  @@index([createdAt])
  @@index([updatedAt])
}

model User {
  id            Int            @id @default(autoincrement())
  username      String         @unique
  email         String?        @unique
  password      String
  role          String         @default("user")
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  createdTerms  Term[]         @relation("TermsCreated")
  updatedTerms  Term[]         @relation("TermsUpdated")
  historyEvents TermHistory[]  @relation("HistoryAuthor")
}

model TermHistory {
  id        Int           @id @default(autoincrement())
  termId    Int
  snapshot  Json
  action    HistoryAction
  note      String?
  authorId  Int?
  createdAt DateTime       @default(now())

  term   Term  @relation(fields: [termId], references: [id], onDelete: Cascade)
  author User? @relation("HistoryAuthor", fields: [authorId], references: [id])

  @@index([termId, createdAt])
  @@index([action])
}
```

- `tags` permite agrupar/buscar el término por alias/sección.
- `createdBy`/`updatedBy` enlazan con usuarios para auditoría.
- `TermHistory` guarda cada snapshot (create/update/delete/seed) y se rellena automáticamente desde la API y el seed.

---

### 5. Autenticación

- **Registro** (`POST /api/auth/register`)
  - Si no existen admins, cualquiera puede crear el primer admin y queda logueado automáticamente.
  - Si ya existe un admin, solo otro admin autenticado puede crear usuarios adicionales (admin o user).
- **Login** (`POST /api/auth/login`)
  - Valida credenciales, emite JWT y lo guarda en la cookie HttpOnly `admin_token` (`SameSite=Lax`, `Secure` en producción).
- **Sesión** (`GET /api/auth`)
  - Devuelve `{ ok: true, user }` si la cookie/JWT es válido. También expone `allowBootstrap` para que el frontend sepa si falta crear un admin.
- **Logout** (`DELETE /api/auth`)
  - Expira la cookie `admin_token`.

Helpers (ver `src/lib/auth.ts`):

- `hashPassword` / `comparePassword` (bcryptjs).
- `signJwt` / `verifyJwt` (jsonwebtoken).
- `requireAuth` / `requireAdmin` lanzan `Response` 401/403 si el token no es válido.
- `buildAuthCookie` / `buildLogoutCookie` generan el header `Set-Cookie`.

La cookie se lee automáticamente usando `credentials: "include"` en el frontend. También se acepta `Authorization: Bearer <token>` para integraciones externas.

---

### 6. API principal

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET /api/health` | Health check con verificación de BD. Devuelve `{ ok: true, db: "up" }` (200) o `{ ok: false, db: "down" }` (503). |
| `GET /api/terms` | Búsqueda pública (`q`, `category`). |
| `POST /api/terms` | **Admin**: crea término (valida con `termSchema`). |
| `GET /api/terms/:id` | Consulta pública de un término. |
| `PATCH /api/terms/:id` | **Admin**: actualiza parcialmente. |
| `DELETE /api/terms/:id` | **Admin**: elimina. |
| `POST /api/auth/register` | Registro descrito arriba. |
| `POST /api/auth/login` | Inicia sesión y emite cookie. |
| `GET /api/auth` | Verifica sesión (`allowBootstrap` incluido). |
| `DELETE /api/auth` | Logout y eliminación de cookie. |

**Monitorización**: Ver [docs/HEALTH_CHECK_MONITORING.md](./docs/HEALTH_CHECK_MONITORING.md) para configurar health checks en Kubernetes, UptimeRobot, Datadog, CloudWatch y más.

Respuestas de ejemplo:

```json
// POST /api/auth/login
{
  "ok": true,
  "user": { "id": 1, "username": "admin", "role": "admin" }
}

// Error auth
{ "ok": false, "error": "Invalid credentials" }

// Conflicto registro
{ "ok": false, "error": "username already exists" }
```

---

### 7. Panel `/admin`

- Maneja sesión via cookies (sin LocalStorage).
- Muestra estado de sesión y permite refrescarla.
- Form de login y (si aplica) form de registro para bootstrap o para administradores autenticados.
- CRUD de términos protegido: los botones se deshabilitan si no hay sesión admin.
- Editor visual para aliases y ejemplos.

---

### 8. Seed

`npm run prisma:seed`:

1. Borra `Term` y `TermHistory`, reinicia los autoincrement (`sqlite_sequence`) y evita IDs “huecos”.
2. Genera tags automáticos por término / alias / categoría y crea todo el dataset (`generatedTerms` + `cssTerms`).
3. Registra un evento `HistoryAction.seed` por cada término sembrado (para auditoría).
4. Upsert del usuario admin usando `ADMIN_USERNAME` / `ADMIN_PASSWORD` (`ADMIN_TOKEN` como fallback) cifrado con bcrypt.

---

### 9. Script de humo `scripts/test-auth.js`

Formas de ejecutarlo:

- Opción A (recomendada): el script arranca y detiene el dev server automáticamente

```bash
npm run test:auth
```

- Opción B: si ya tienes el server corriendo en otra terminal

```bash
npm run dev &
node scripts/test-auth.js
```

- Opción C: si tu entorno requiere inyectar `DATABASE_URL` (Prisma 6 con `prisma.config.ts`)

```bash
TEST_SERVER_CMD='DATABASE_URL="file:./prisma/dev.db" npm run dev' \
TEST_SERVER_TIMEOUT_MS=120000 \
npm run test:auth
```

Qué verifica:

1. Registro (si el endpoint aún permite crear admin público) o detecta el 409/401.
2. Login y captura de la cookie `admin_token`.
3. `GET /api/auth` con la cookie → espera 200.
4. `POST /api/terms` creando un término efímero → espera 201.
5. Logout (`DELETE /api/auth`) y verificación de que la sesión queda en 401.

Notas:

- El payload de creación de término incluye `translation` (requisito del `termSchema` en Zod) y `tags` vacíos.
- Puedes ajustar `TEST_BASE_URL` si tu server no expone `http://localhost:3000`.
- El script finaliza con código distinto de cero si alguna etapa falla.

---

### 10. Próximos pasos sugeridos

- Rotación y refresco de tokens JWT para sesiones prolongadas.
- UI para gestión de usuarios/roles más allá del bootstrap.
- Tests e2e (Playwright) cubriendo flujos de búsqueda/admin.
- Despliegue en Vercel con `DATABASE_URL` apuntando a SQLite/file o Prisma Data Proxy.

---

¡Listo! Con los pasos anteriores deberías poder migrar, sembrar y levantar el diccionario con autenticación basada en JWT + cookies HttpOnly. Si necesitas ampliar la arquitectura (por ejemplo, OAuth o roles adicionales), los helpers en `src/lib/auth.ts` son el punto de partida.

---

## Troubleshooting

- Dev Containers no puede usar Docker (permiso denegado en `/var/run/docker.sock`):
  - Asegúrate de que Docker Desktop/Engine esté corriendo en tu host.
  - En Linux, agrega tu usuario al grupo `docker` y reinicia sesión:
    ```bash
    sudo usermod -aG docker "$USER"
    newgrp docker
    docker ps
    ```
  - El `devcontainer.json` ya monta el socket del host. Si persiste el error, reabre el proyecto en contenedor tras reiniciar Docker.

- El servicio `next` queda en `health: starting` con Docker Compose:
  - El healthcheck llama a `GET /api/terms` dentro del contenedor. Puede tardar mientras corre `dev:init` (migraciones y seed).
  - Revisa logs: `docker compose logs -f next`.
  - Si necesitas más tiempo de calentamiento, incrementa `start_period` en `docker-compose.yml`.

- Puerto 3001 ocupado en el host:
  - Cambia el mapeo en `docker-compose.yml`:
    ```yaml
    ports:
      - "3002:3000"
    ```
  - Luego: `docker compose up -d`.

- Prisma 6 falla al compilar por `DATABASE_URL` ausente:
  - En local, el script de `build` ya carga `.env` con `-r dotenv/config`. Si usas CI o no hay `.env`, exporta la variable antes de construir:
    ```bash
    export DATABASE_URL="file:./prisma/dev.db"
    npm run build
    ```
  - Si `prisma.config.ts` detecta config y omite `.env`, define `DATABASE_URL` en el entorno del job.

- SQLite bloqueada o seed repetible:
  - Cierra procesos que accedan a `dev.db` y usa:
    ```bash
    npm run db:reset
    npm run prisma:seed
    ```

- Redis no disponible o logs de fallback del rate limiter:
  - Si no defines `REDIS_URL`, el rate limiter usa memoria local. Los logs pueden indicar fallback; es esperado en desarrollo.
  - Para usar Redis en Compose, ya está el servicio `redis` y `REDIS_URL=redis://redis:6379` configurado en el servicio `next`.

- Next no escucha en la red del contenedor:
  - El comando ya usa `next dev -H 0.0.0.0`. Si cambias el script, asegúrate de mantener `-H 0.0.0.0` para exponer el puerto.
