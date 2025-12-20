import { OpenAPIRegistry, OpenApiGeneratorV31, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

const termExampleSchema = registry.register(
  "TermExample",
  z.object({
    title: z.string().min(1).openapi({ example: "Grid layout" }),
    code: z.string().min(1).openapi({ example: "display: grid;" }),
    note: z.string().optional().openapi({ example: "Snippet para documentación interna" }),
  }),
);

const termPayloadSchema = registry.register(
  "TermPayload",
  z.object({
    translation: z.string().min(1).openapi({ example: "Layout de cuadrícula" }),
    term: z.string().min(1).openapi({ example: "CSS Grid" }),
    aliases: z.array(z.string().min(1)).optional().default([]).openapi({ example: ["grid layout"] }),
    tags: z.array(z.string().min(1)).optional().default([]).openapi({ example: ["css", "layout"] }),
    category: z.enum(["frontend", "backend", "database", "devops", "general"]).openapi({ example: "frontend" }),
    meaning: z.string().min(1).openapi({ example: "Sistema bidimensional para maquetar interfaces." }),
    what: z.string().min(1).openapi({ example: "Define áreas flexibles sin usar floats." }),
    how: z.string().min(1).openapi({ example: "Utiliza contenedores `display:grid` y fracciones (fr)." }),
    examples: z.array(termExampleSchema).optional().default([]),
  }),
);

const termSchema = registry.register(
  "Term",
  termPayloadSchema.extend({
    id: z.number().int().openapi({ example: 42 }),
    createdAt: z.string().datetime().openapi({ example: "2024-09-01T12:00:00.000Z" }),
    updatedAt: z.string().datetime().openapi({ example: "2024-09-10T09:30:00.000Z" }),
    createdById: z.number().int().nullable().optional(),
    updatedById: z.number().int().nullable().optional(),
  }),
);

const authUserSchema = registry.register(
  "AuthUser",
  z.object({
    id: z.number().int().openapi({ example: 1 }),
    username: z.string().openapi({ example: "admin" }),
    role: z.enum(["admin", "user"]).openapi({ example: "admin" }),
    email: z.string().email().nullable().optional().openapi({ example: "admin@example.com" }),
  }),
);

const paginationMetaSchema = registry.register(
  "PaginationMeta",
  z.object({
    page: z.number().int().min(1).openapi({ example: 1 }),
    pageSize: z.number().int().min(1).openapi({ example: 50 }),
    total: z.number().int().min(0).openapi({ example: 200 }),
    totalPages: z.number().int().min(1).openapi({ example: 4 }),
  }),
);

const okResponseSchema = registry.register(
  "OkResponse",
  z.object({ ok: z.literal(true).default(true) }).openapi({ example: { ok: true } }),
);

const errorResponseSchema = registry.register(
  "ErrorResponse",
  z
    .object({
      ok: z.literal(false).default(false),
      error: z.string().default("Error inesperado"),
      allowBootstrap: z.boolean().optional(),
    })
    .openapi({
      example: { ok: false, error: "Unauthorized" },
    }),
);

const termsListResponseSchema = registry.register(
  "TermsListResponse",
  okResponseSchema.extend({
    items: z.array(termSchema),
    meta: paginationMetaSchema,
  }),
);

const termItemResponseSchema = registry.register(
  "TermItemResponse",
  okResponseSchema.extend({
    item: termSchema,
  }),
);

const authResponseSchema = registry.register(
  "AuthResponse",
  okResponseSchema.extend({
    user: authUserSchema,
  }),
);

const sessionResponseSchema = registry.register(
  "SessionResponse",
  okResponseSchema.extend({
    user: authUserSchema,
    allowBootstrap: z.boolean().default(false),
  }),
);

const loginPayloadSchema = registry.register(
  "LoginPayload",
  z.object({
    username: z.string().min(3).openapi({ example: "admin" }),
    password: z.string().min(8).openapi({ example: "super-secret" }),
  }),
);

const registerPayloadSchema = registry.register(
  "RegisterPayload",
  z.object({
    username: z.string().min(3).openapi({ example: "new-admin" }),
    password: z.string().min(8).openapi({ example: "StrongP@ss123" }),
    email: z.string().email().optional().openapi({ example: "new-admin@example.com" }),
    role: z.enum(["admin", "user"]).optional().openapi({ example: "admin" }),
  }),
);

const recoveryRequestSchema = registry.register(
  "RecoveryRequest",
  z.object({
    identifier: z.string().min(3).openapi({ example: "admin@example.com" }),
  }),
);

const recoveryConfirmSchema = registry.register(
  "RecoveryConfirm",
  z.object({
    token: z.string().min(16).openapi({ example: "token" }),
    password: z.string().min(8).openapi({ example: "NuevaPass123" }),
  }),
);

const recoveryResponseSchema = registry.register(
  "RecoveryResponse",
  okResponseSchema.extend({
    message: z.string().openapi({ example: "Si existe una cuenta asociada, enviaremos instrucciones para recuperar la contraseña." }),
    expiresIn: z.number().int().optional().openapi({ example: 1800 }),
    retryAfter: z.number().int().optional().openapi({ example: 60 }),
    recoveryToken: z.string().optional().openapi({ example: "token" }),
    resetUrl: z.string().optional().openapi({ example: "https://app.local/admin/access?token=token" }),
  }),
);

const termsQuerySchema = registry.register(
  "TermsQuery",
  z.object({
    q: z.string().optional().openapi({ description: "Texto libre para buscar" }),
    category: z.enum(["frontend", "backend", "database", "devops", "general"]).optional(),
    tag: z.string().optional(),
    page: z.number().int().min(1).default(1).openapi({ example: 1 }),
    pageSize: z.number().int().min(1).max(100).default(50).openapi({ example: 50 }),
    sort: z.enum(["recent", "oldest", "term_asc", "term_desc"]).default("term_asc"),
  }),
);

registry.registerPath({
  method: "get",
  path: "/api/terms",
  tags: ["Terms"],
  summary: "Listar términos con filtros y paginación",
  request: {
    query: termsQuerySchema,
  },
  responses: {
    200: {
      description: "Listado paginado",
      content: {
        "application/json": {
          schema: termsListResponseSchema,
        },
      },
    },
    400: {
      description: "Consulta inválida",
      content: {
        "application/json": { schema: errorResponseSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/terms",
  tags: ["Terms"],
  summary: "Crear un término (requiere admin)",
  request: {
    body: {
      content: {
        "application/json": {
          schema: termPayloadSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Término creado",
      content: {
        "application/json": { schema: termItemResponseSchema },
      },
    },
    400: { description: "Datos inválidos", content: { "application/json": { schema: errorResponseSchema } } },
    401: { description: "No autorizado", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/terms/{id}",
  tags: ["Terms"],
  summary: "Obtener un término por ID",
  request: {
    params: z.object({
      id: z.string().openapi({ example: "1" }),
    }),
  },
  responses: {
    200: { description: "Término encontrado", content: { "application/json": { schema: termItemResponseSchema } } },
    404: { description: "No existe", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/terms/{id}",
  tags: ["Terms"],
  summary: "Actualizar parcialmente un término (admin)",
  request: {
    params: z.object({ id: z.string().openapi({ example: "1" }) }),
    body: {
      content: {
        "application/json": {
          schema: termPayloadSchema.partial(),
        },
      },
    },
  },
  responses: {
    200: { description: "Actualizado", content: { "application/json": { schema: termItemResponseSchema } } },
    400: { description: "Datos inválidos", content: { "application/json": { schema: errorResponseSchema } } },
    401: { description: "No autorizado", content: { "application/json": { schema: errorResponseSchema } } },
    404: { description: "No existe", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/terms/{id}",
  tags: ["Terms"],
  summary: "Eliminar un término (admin)",
  request: {
    params: z.object({ id: z.string().openapi({ example: "1" }) }),
  },
  responses: {
    200: { description: "Eliminado", content: { "application/json": { schema: okResponseSchema } } },
    401: { description: "No autorizado", content: { "application/json": { schema: errorResponseSchema } } },
    404: { description: "No existe", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  tags: ["Auth"],
  summary: "Iniciar sesión",
  request: {
    body: {
      content: {
        "application/json": { schema: loginPayloadSchema },
      },
    },
  },
  responses: {
    200: { description: "Sesión iniciada", content: { "application/json": { schema: authResponseSchema } } },
    400: { description: "Datos inválidos", content: { "application/json": { schema: errorResponseSchema } } },
    401: { description: "Credenciales incorrectas", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/register",
  tags: ["Auth"],
  summary: "Registrar usuario",
  request: {
    body: {
      content: {
        "application/json": { schema: registerPayloadSchema },
      },
    },
  },
  responses: {
    201: { description: "Usuario creado", content: { "application/json": { schema: authResponseSchema } } },
    400: { description: "Datos inválidos", content: { "application/json": { schema: errorResponseSchema } } },
    401: { description: "No autorizado", content: { "application/json": { schema: errorResponseSchema } } },
    409: { description: "Conflicto", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/recovery",
  tags: ["Auth"],
  summary: "Solicitar recuperación de contraseña",
  request: {
    body: {
      content: {
        "application/json": { schema: recoveryRequestSchema },
      },
    },
  },
  responses: {
    200: { description: "Solicitud recibida", content: { "application/json": { schema: recoveryResponseSchema } } },
    400: { description: "Datos inválidos", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/recovery/confirm",
  tags: ["Auth"],
  summary: "Confirmar recuperación y cambiar contraseña",
  request: {
    body: {
      content: {
        "application/json": { schema: recoveryConfirmSchema },
      },
    },
  },
  responses: {
    200: { description: "Contraseña actualizada", content: { "application/json": { schema: recoveryResponseSchema } } },
    400: { description: "Datos inválidos", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/auth",
  tags: ["Auth"],
  summary: "Obtener sesión actual",
  responses: {
    200: { description: "Sesión válida", content: { "application/json": { schema: sessionResponseSchema } } },
    401: { description: "No autenticado", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/auth",
  tags: ["Auth"],
  summary: "Cerrar sesión",
  responses: {
    200: { description: "Sesión cerrada", content: { "application/json": { schema: okResponseSchema } } },
  },
});

const documentConfig = {
  openapi: "3.1.0",
  info: {
    title: "Diccionario Técnico Web API",
    version: "1.0.0",
    description: "Endpoints públicos y protegidos del diccionario técnico administrado por Omar Hernandez Rey.",
  },
  servers: [
    { url: "http://localhost:3000", description: "Desarrollo local" },
    { url: "https://diccionario.omar.dev", description: "Producción (ejemplo)" },
  ],
};

export function getOpenApiDocument() {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument(documentConfig);
}
