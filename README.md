## Diccionario Técnico Web (ES)

Aplicación web para consultar y administrar términos técnicos de desarrollo web en español. Cada término incluye:

- Significado
- Qué hace
- Cómo se usa (snippet / explicación)
- Ejemplos de código con título y nota opcional

Construido con:

- Next.js (App Router)
- Prisma + SQLite
- TypeScript + React 18
- Zod para validación

### Demo local

```bash
npm install
npm run prisma:migrate   # genera/actualiza la base de datos
npm run prisma:seed      # inserta términos iniciales
npm run dev              # arranca en http://localhost:3000
```

### Variables de entorno

Crear un archivo `.env` (o usar `.env.local` si prefieres) basado en `.env.example`:

```
DATABASE_URL="file:./dev.db"
ADMIN_TOKEN="pon-un-token-fuerte"
```

- `DATABASE_URL`: apunta al archivo SQLite local.
- `ADMIN_TOKEN`: token tipo Bearer para proteger las rutas de administración (crear/editar/eliminar términos).

### Modelo de datos (Prisma)

```prisma
model Term {
	id        Int      @id @default(autoincrement())
	term      String   @unique
	aliases   Json     @default("[]")
	category  Category
	meaning   String
	what      String
	how       String
	examples  Json     @default("[]")
	createdAt DateTime @default(now())
	updatedAt DateTime @updatedAt
}

enum Category {
	frontend
	backend
	database
	devops
	general
}
```

### Rutas principales

Frontend:

- `GET /` Página de búsqueda de términos.
- `GET /admin` Panel de administración (requiere pegar token en el campo "Token admin").

API (JSON):

- `GET /api/terms?q=texto&category=frontend|backend|database|devops|general`
	- Busca hasta 50 términos por coincidencia parcial en `term`, `meaning`, `what`, `how` o por alias exacto.
	- Respuesta: `{ items: Term[] }`.
- `POST /api/terms` (Auth Bearer) Crea un término. Body validado por Zod.
- `GET /api/terms/:id` Obtiene un término.
- `PATCH /api/terms/:id` (Auth Bearer) Actualización parcial.
- `DELETE /api/terms/:id` (Auth Bearer) Elimina.

### Validación

`src/lib/validation.ts` define `termSchema` (Zod) con los campos requeridos y ejemplos como arreglo.

### Scripts útiles

```bash
npm run dev             # Desarrollo
npm run build           # Genera prisma client y build Next
npm run start           # Producción
npm run prisma:migrate  # Migración (dev)
npm run prisma:seed     # Insertar datos iniciales
npm run db:reset        # Borrar base y reset migraciones
```

### Autenticación admin simple

`Authorization: Bearer <ADMIN_TOKEN>` en las operaciones de escritura/borrado. Se compara con la variable de entorno; no hay sesiones.

### Mejoras futuras sugeridas

- Filtro por categoría en el buscador principal.
- Normalizar búsqueda por alias (case-insensitive).
- Paginación para más de 50 resultados.
- Autenticación más robusta (JWT u OAuth) para admin.
- Tests automatizados de API y validación.

### Licencia

Sin licencia explícita (privado). Añade una licencia si planeas publicar.

# iccionario-dev
