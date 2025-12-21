# Despliegue en Vercel + Supabase

Guía paso a paso para desplegar Diccionario Dev en Vercel con PostgreSQL de Supabase.

## Requisitos previos

- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Supabase](https://supabase.com) con proyecto creado
- Repositorio conectado a Vercel

---

## 1. Configurar Supabase (Transaction Pooler)

### Obtener la URL de conexión

1. Ve a tu proyecto en Supabase → **Database** → **Connection string**
2. Selecciona **Transaction Pooler** (puerto `6543`)
3. Copia la URL y agrega `?pgbouncer=true` al final

**Formato correcto:**

```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Ejemplo real:**

```
DATABASE_URL="postgresql://postgres.abc123:MiPassword@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

> ⚠️ **Importante:** El puerto `6543` y `?pgbouncer=true` son obligatorios para Vercel (serverless). Sin esto, Prisma fallará con errores de conexión.

---

## 2. Configurar variables de entorno en Vercel

Ve a tu proyecto en Vercel → **Settings** → **Environment Variables**.

### Variables obligatorias

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de Supabase (Transaction Pooler) | `postgresql://...6543/postgres?pgbouncer=true` |
| `JWT_SECRET` | Secreto para firmar tokens (min 32 chars) | Genera con `openssl rand -base64 48` |
| `JWT_EXPIRES_IN` | Duración del token | `1d` |
| `APP_URL` | URL de tu app en Vercel | `https://diccionario-dev.vercel.app` |
| `ADMIN_USERNAME` | Usuario admin inicial | `admin` |
| `ADMIN_PASSWORD` | Contraseña admin (fuerte) | `MiPassword$egura123!` |
| `ADMIN_EMAIL` | Email del admin | `admin@tudominio.com` |

### Variables opcionales

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `REDIS_URL` | Redis para rate limiting consistente | Fallback a memoria |
| `RESEND_API_KEY` | API key de Resend para emails | Deshabilitado |
| `EMAIL_FROM` | Remitente de emails | `onboarding@resend.dev` |
| `GOOGLE_CLIENT_ID` | OAuth Google (server) | Deshabilitado |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | OAuth Google (client) | Deshabilitado |

> 💡 **Tip:** Genera un `JWT_SECRET` seguro:
> ```bash
> openssl rand -base64 48
> ```

---

## 3. Configuración de Build en Vercel

El archivo `vercel.json` ya está configurado. Vercel usará:

- **Build Command:** `npx prisma migrate deploy && npm run build`
- **Install Command:** `npm install`
- **Framework:** Next.js

Si prefieres configurarlo manualmente en Vercel → **Settings** → **Build & Development Settings**:

```
Build Command: npx prisma migrate deploy && npm run build
```

---

## 4. Desplegar

### Opción A: Desde Vercel Dashboard

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Importa el repositorio `diccionario-dev`
3. Configura las variables de entorno (paso 2)
4. Click en **Deploy**

### Opción B: Desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Desplegar (primera vez, configura el proyecto)
vercel

# Desplegar a producción
vercel --prod
```

---

## 5. Ejecutar Seed inicial (una sola vez)

El seed crea el usuario admin y los términos iniciales. Ejecútalo desde tu máquina local apuntando a la BD de Supabase:

```bash
# Exporta la DATABASE_URL de Supabase
export DATABASE_URL="postgresql://postgres.abc123:MiPassword@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Ejecuta el seed
npm run prisma:seed
```

> ⚠️ **Nota:** Solo ejecuta el seed una vez en producción. Si necesitas reiniciar datos, usa `npm run db:reset` (¡borra todo!).

---

## 6. Verificación post-deploy

Una vez desplegado, verifica que todo funciona:

| Endpoint | URL | Respuesta esperada |
|----------|-----|-------------------|
| App | `https://tu-app.vercel.app` | Landing page |
| Health | `https://tu-app.vercel.app/api/health` | `{ "ok": true, "db": "up" }` |
| OpenAPI | `https://tu-app.vercel.app/api/openapi` | JSON con spec |
| Login | `https://tu-app.vercel.app/admin` | Formulario de login |

### Test rápido con curl

```bash
# Health check
curl https://tu-app.vercel.app/api/health

# Buscar términos
curl "https://tu-app.vercel.app/api/terms?q=javascript"
```

---

## Troubleshooting

### Error: `Can't reach database server`

- Verifica que usas puerto `6543` (no `5432`)
- Verifica que `?pgbouncer=true` está en la URL
- Confirma que la IP de Vercel no está bloqueada en Supabase

### Error: `Prepared statement already exists`

- Falta `?pgbouncer=true` en `DATABASE_URL`

### Error: `DATABASE_URL not found` durante build

- La variable debe estar en **todas** las fases (Build, Development, Production)
- Verifica en Vercel → Settings → Environment Variables

### El seed no crea el admin

- Verifica que `ADMIN_USERNAME`, `ADMIN_PASSWORD` y `ADMIN_EMAIL` están definidas
- Ejecuta `npm run admin:ensure` si ya existe la BD pero falta el admin

### Rate limiting inconsistente

- Sin `REDIS_URL`, cada instancia serverless tiene su propio contador
- Para rate limit consistente, agrega Redis (Upstash ofrece tier gratuito)

---

## Configuración de Redis (opcional pero recomendado)

Para rate limiting consistente en serverless, usa [Upstash Redis](https://upstash.com):

1. Crea una base de datos en Upstash
2. Copia la URL de conexión
3. Agrega en Vercel:

```
REDIS_URL="rediss://default:xxx@xxx.upstash.io:6379"
```

---

## Checklist de despliegue

- [ ] Proyecto creado en Supabase
- [ ] DATABASE_URL con puerto 6543 y `?pgbouncer=true`
- [ ] Variables obligatorias configuradas en Vercel
- [ ] JWT_SECRET generado (min 32 chars)
- [ ] APP_URL apunta al dominio de Vercel
- [ ] Deploy exitoso
- [ ] Seed ejecutado desde local
- [ ] Health check responde OK
- [ ] Login de admin funciona

---

## URLs de referencia

- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting/connection-pooling)
- [Prisma + PgBouncer](https://www.prisma.io/docs/orm/overview/databases/postgresql#pgbouncer)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Upstash Redis](https://upstash.com)
