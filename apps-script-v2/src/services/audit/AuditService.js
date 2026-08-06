/**
 * AuditService — registro de auditoría de acciones y accesos.
 *
 * Los fallos de auditoría nunca propagan errores al flujo principal.
 * Todas las excepciones se capturan y loguean en consola.
 */
var AuditService = {
  log: function (entry) {
    try {
      Repository.for("auditLog").create({
        id:          Crypto.uuid(),
        accion:      String(entry.accion      || ""),
        entidadTipo: String(entry.entidadTipo || ""),
        entidadId:   String(entry.entidadId   || ""),
        usuarioId:   String(entry.usuarioId   || ""),
        resultado:   String(entry.resultado   || "ok"),
        detalle:     typeof entry.detalle === "object"
                       ? JSON.stringify(entry.detalle)
                       : String(entry.detalle || ""),
        timestamp:   new Date().toISOString(),
      });
    } catch (e) {
      console.error("[AuditService.log]", e.message);
    }
  },

  loginRecord: function (entry) {
    try {
      Repository.for("loginAudit").create({
        id:        Crypto.uuid(),
        email:     String(entry.email     || ""),
        ip:        String(entry.ip        || ""),
        userAgent: String(entry.userAgent || ""),
        resultado: String(entry.resultado || ""),
        motivo:    String(entry.motivo    || ""),
        usuarioId: String(entry.usuarioId || ""),
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.error("[AuditService.loginRecord]", e.message);
    }
  },

  list: function (filter, limit) {
    var rows = Repository.for("auditLog").findAll(filter || null);
    rows.sort(function (a, b) { return b.timestamp > a.timestamp ? 1 : -1; });
    return limit ? rows.slice(0, limit) : rows;
  },

  loginHistory: function (email, limit) {
    var filter = email ? { email: email } : null;
    var rows   = Repository.for("loginAudit").findAll(filter);
    rows.sort(function (a, b) { return b.timestamp > a.timestamp ? 1 : -1; });
    return limit ? rows.slice(0, limit) : rows;
  },
};
