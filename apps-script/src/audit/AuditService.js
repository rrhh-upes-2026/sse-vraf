/**
 * Centralized audit service. Every create / update / remove action is recorded
 * here in the HistorialAudit sheet. Reads (list, get) are not audited by default
 * to keep the log focused on state changes.
 *
 * The HistorialAudit sheet is append-only — no updateEntity_ or removeEntity_
 * is ever called against it (business rule: audit records are immutable).
 * Future sprints may enrich the detalleJson with before/after diffs, but the
 * column structure is fixed here for the lifetime of the project.
 *
 * AuditService errors never propagate to the calling action — they are logged
 * and swallowed so an audit failure cannot block a legitimate write.
 */
var AuditService = {
  /**
   * Write a single audit record to HistorialAudit.
   *
   * @param {Object} opts
   * @param {string} opts.accion       — wire action, e.g. "procesos.create"
   * @param {string} opts.entidadTipo  — entity name, e.g. "procesos"
   * @param {string} [opts.entidadId]  — affected entity id (if known at call time)
   * @param {string} [opts.usuarioId]  — acting user id
   * @param {string} opts.resultado    — "ok" | "error"
   * @param {Object} [opts.detalle]    — arbitrary context, serialised to JSON
   */
  record: function (opts) {
    try {
      createEntity_("historial", {
        id: IdGen.uuid(),
        entidadTipo:  opts.entidadTipo  || "",
        entidadId:    opts.entidadId    || "",
        usuarioId:    opts.usuarioId    || "",
        accion:       opts.accion       || "",
        resultado:    opts.resultado    || "ok",
        fecha:        new Date().toISOString(),
        detalleJson:  opts.detalle ? JSON.stringify(opts.detalle) : "",
      });
    } catch (err) {
      AppLogger.error("AuditService.record failed — audit write skipped", {
        error: String((err && err.message) || err),
        accion: opts.accion,
        entidadId: opts.entidadId,
      });
    }
  },
};
