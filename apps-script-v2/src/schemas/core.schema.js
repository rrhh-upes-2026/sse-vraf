/**
 * core.schema.js — esquemas de las entidades principales del sistema.
 *
 * Se registran en SchemaRegistry al momento de carga del script.
 * Agregar aquí cualquier entidad de uso transversal (no específica de workspace).
 */
(function registerCoreSchemas_() {

  SchemaRegistry.register("usuarios", {
    sheetName: "Usuarios",
    columns: [
      "id", "nombre", "email", "unidadId", "rol", "activo",
      "passwordHash", "passwordSalt", "mustChangePassword",
      "avatarInitials", "lastLoginAt", "createdAt", "updatedAt",
    ],
  });

  SchemaRegistry.register("workspaces", {
    sheetName: "Workspaces",
    columns: ["id", "nombre", "codigo", "descripcion", "activo", "createdAt"],
  });

  SchemaRegistry.register("wsUsers", {
    sheetName: "WsUsers",
    columns: ["id", "wsId", "usuarioId", "email", "nombre", "rol", "activo", "createdAt", "updatedAt"],
  });

  SchemaRegistry.register("loginAudit", {
    sheetName: "LoginAudit",
    columns: ["id", "email", "ip", "userAgent", "resultado", "motivo", "usuarioId", "timestamp"],
  });

  SchemaRegistry.register("auditLog", {
    sheetName: "AuditLog",
    columns: ["id", "accion", "entidadTipo", "entidadId", "usuarioId", "resultado", "detalle", "timestamp"],
  });

  SchemaRegistry.register("passwordResets", {
    sheetName: "PasswordResets",
    columns: ["id", "email", "token", "expiresAt", "usado", "createdAt"],
  });

})();
