/**
 * NotificationService — in-app notification creation and Gmail dispatch.
 *
 * In-app notifications are rows appended to the "notificaciones" sheet via
 * SheetRepository. Gmail notifications are sent via GmailApp (requires the
 * gmail.send scope in appsscript.json). Gmail is gated by Config.gmailEnabled().
 *
 * Call processEvent() from an EventDispatcher handler to fan-out any emitted
 * event into the appropriate notifications based on wsNotifRules.
 */

var NotificationService = {
  /**
   * Create an in-app notification record in the notificaciones sheet.
   *
   * @param {Object} opts
   * @param {string} opts.destinatarioId   — user id
   * @param {string} opts.wsId
   * @param {string} opts.tipo             — 'info' | 'warning' | 'error' | 'success'
   * @param {string} opts.titulo
   * @param {string} opts.mensaje
   * @param {string} [opts.entityName]
   * @param {string} [opts.entityId]
   * @param {string} [opts.link]
   * @returns {Object} created notification record
   */
  sendInApp: function (opts) {
    var required = ["destinatarioId", "wsId", "titulo", "mensaje"];
    Validator.requireFields(opts, required);

    var payload = {
      destinatarioId: opts.destinatarioId,
      wsId:           opts.wsId,
      tipo:           opts.tipo || "info",
      titulo:         opts.titulo,
      mensaje:        opts.mensaje,
      entidadNombre:  opts.entityName || "",
      entidadId:      opts.entityId   || "",
      link:           opts.link       || "",
      leida:          "false",
      fechaCreacion:  new Date().toISOString(),
    };

    var created = createEntity_("notificaciones", payload);
    AppLogger.info("NotificationService.sendInApp", {
      destinatarioId: opts.destinatarioId,
      titulo:         opts.titulo,
    });
    return created;
  },

  /**
   * Send an email notification via GmailApp.
   * No-ops if Config.gmailEnabled() returns false or recipient email is empty.
   *
   * @param {string} toEmail
   * @param {string} subject
   * @param {string} htmlBody
   */
  sendEmail: function (toEmail, subject, htmlBody) {
    try {
      GmailService.sendEmail(toEmail, subject, htmlBody);
    } catch (e) {
      AppLogger.error("NotificationService.sendEmail: failed", {
        to:    toEmail,
        error: String(e.message || e),
      });
    }
  },

  /**
   * Process a platform event and dispatch notifications based on wsNotifRules
   * matching the event trigger. Called by EventDispatcher handlers.
   *
   * @param {string} eventType  — EVENT_TYPES constant value (e.g. "blueprint.publicado")
   * @param {Object} payload    — event payload from EventDispatcher.emit
   */
  processEvent: function (eventType, payload) {
    if (!payload || !payload.wsId) return;

    var rulesResult = listEntities_("wsNotifRules", {
      wsId:   payload.wsId,
      active: "true",
    });
    var rules = rulesResult && rulesResult.items || [];

    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      if (rule.trigger !== eventType) continue;
      if (rule.deletedAt) continue;

      // Resolve destination role users
      var roles = [];
      try { roles = JSON.parse(rule.destinatarioRolesJson || "[]"); } catch (_) {}

      var destinatarios = NotificationService._resolveRoleUsers_(payload.wsId, roles);

      for (var j = 0; j < destinatarios.length; j++) {
        var user = destinatarios[j];

        // In-app
        NotificationService.sendInApp({
          destinatarioId: user.id,
          wsId:           payload.wsId,
          tipo:           "info",
          titulo:         rule.asunto || rule.nombre,
          mensaje:        NotificationService._interpolate_(rule.mensaje, payload),
          entityName:     payload.entityName || "",
          entityId:       payload.id || "",
        });

        // Email channel
        if (rule.canal === "email" || rule.canal === "both") {
          NotificationService.sendEmail(
            user.email,
            rule.asunto || rule.nombre,
            NotificationService._interpolate_(rule.mensaje, payload)
          );
        }
      }
    }
  },

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Find users in a workspace that have one of the given roles.
   * @private
   */
  _resolveRoleUsers_: function (wsId, roles) {
    if (!roles || roles.length === 0) return [];

    var usersResult = listEntities_("wsUsers", { wsId: wsId, activo: "true" });
    var allUsers    = usersResult && usersResult.items || [];

    var matched = [];
    for (var i = 0; i < allUsers.length; i++) {
      var u = allUsers[i];
      if (!u.deletedAt && u.activo !== "false") {
        for (var j = 0; j < roles.length; j++) {
          if (u.rol === roles[j]) {
            matched.push(u);
            break;
          }
        }
      }
    }
    return matched;
  },

  /**
   * Simple {{key}} template interpolation from an event payload object.
   * @private
   */
  _interpolate_: function (template, values) {
    if (!template) return "";
    return template.replace(/\{\{(\w+)\}\}/g, function (match, key) {
      return values && values[key] !== undefined ? String(values[key]) : match;
    });
  },
};
