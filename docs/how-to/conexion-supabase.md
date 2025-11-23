# Configuración de Conexión a Supabase (Prisma)

## Problema
Al intentar conectar la aplicación con Supabase, pueden aparecer errores como:
- `PrismaClientKnownRequestError: Can't reach database server`
- `Invalid prisma.user.count() invocation`
- Tiempos de espera (timeouts) en entornos que solo soportan IPv4.

## Causa
Supabase ofrece dos modos de conexión:
1. **Session Mode (Puerto 5432):** Conexión directa. Ideal para servidores persistentes, pero a veces requiere IPv6 o configuración específica de red.
2. **Transaction Mode (Puerto 6543):** Pooler de conexiones (PgBouncer). Ideal para entornos serverless (como Vercel) o redes IPv4, ya que reutiliza conexiones activas.

Prisma, por defecto, intenta usar *Prepared Statements*, lo cual puede causar conflictos con PgBouncer si no se configura explícitamente.

## Solución Implementada

Para garantizar una conexión estable y compatible con IPv4, hemos configurado la aplicación para usar el **Transaction Pooler**.

### 1. Actualización del Puerto
Cambiamos el puerto de `5432` a `6543` en la cadena de conexión.

### 2. Configuración de PgBouncer
Añadimos el parámetro `?pgbouncer=true` al final de la URL. Esto indica a Prisma que deshabilite los *Prepared Statements* incompatibles con este modo.

### Ejemplo de Configuración (`.env`)

```dotenv
# INCORRECTO (Session Mode / Directo)
# DATABASE_URL="postgresql://user:pass@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"

# CORRECTO (Transaction Mode / PgBouncer)
DATABASE_URL="postgresql://user:pass@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

> **Nota:** La contraseña debe estar codificada en URL (URL encoded) si contiene caracteres especiales.

## Referencias
- [Supabase Docs: Connection Pooling](https://supabase.com/docs/guides/database/connecting/connection-pooling)
- [Prisma Docs: Configuring PgBouncer](https://www.prisma.io/docs/orm/overview/databases/postgresql#pgbouncer)
