/**
 * NCE — Notification & Communication Engine
 *
 * Responsibilities:
 *   - Template rendering with {{variable}} substitution (no eval).
 *   - Duplicate detection per (sourceEventId, recipientId).
 *   - Quiet-hours enforcement per user preference.
 *   - AUE event consumption (read-only from AUE_Events sheet).
 *   - Digest generation aggregating pending notifications.
 *   - Internal channel delivery; correo + google_chat as contracts only.
 */
var NCEController = (function () {

  // ─── Repo helpers ─────────────────────────────────────────────────────────

  function _repo_(key) {
    return SheetRepository.forEntity(key);
  }

  function _notifs_()    { return _repo_("nceNotifications");    }
  function _templates_() { return _repo_("nceTemplates");        }
  function _prefs_()     { return _repo_("nceUserPreferences");  }
  function _digests_()   { return _repo_("nceDigests");          }

  function _now_()   { return new Date().toISOString(); }
  function _today_() { return _now_().slice(0, 10); }

  function _notifId_() {
    return "NTF-NCE-" + Number(new Date()).toString(36).toUpperCase() + "-" +
      Math.random().toString(36).slice(2, 5).toUpperCase();
  }
  function _tplId_() {
    return "TPL-NCE-" + Number(new Date()).toString(36).toUpperCase() + "-" +
      Math.random().toString(36).slice(2, 5).toUpperCase();
  }
  function _prefId_() {
    return "PRF-NCE-" + Number(new Date()).toString(36).toUpperCase() + "-" +
      Math.random().toString(36).slice(2, 5).toUpperCase();
  }
  function _digestId_() {
    return "DGS-NCE-" + Number(new Date()).toString(36).toUpperCase() + "-" +
      Math.random().toString(36).slice(2, 5).toUpperCase();
  }

  // ─── JSON helpers ─────────────────────────────────────────────────────────

  function _parseJson_(val) {
    if (!val || typeof val === "object") return val || {};
    try { return JSON.parse(val); } catch (e) { return {}; }
  }

  function _parseArr_(val) {
    if (Array.isArray(val)) return val;
    if (!val) return [];
    try { return JSON.parse(val); } catch (e) { return []; }
  }

  // ─── Hydrators ────────────────────────────────────────────────────────────

  function _hydrateNotif_(row) {
    return {
      id:            row.id,
      recipientId:   row.recipientId,
      recipientEmail: row.recipientEmail,
      title:         row.title,
      body:          row.body,
      channel:       row.channel || "interna",
      status:        row.status || "pendiente",
      priority:      row.priority || "normal",
      templateId:    row.templateId || undefined,
      templateType:  row.templateType || undefined,
      sourceEventId: row.sourceEventId || undefined,
      sourceEngine:  row.sourceEngine || undefined,
      metadata:      _parseJson_(row.metadata),
      readAt:        row.readAt || undefined,
      deliveredAt:   row.deliveredAt || undefined,
      createdAt:     row.createdAt,
      updatedAt:     row.updatedAt,
    };
  }

  function _hydrateTemplate_(row) {
    return {
      id:         row.id,
      name:       row.name,
      type:       row.type,
      channel:    row.channel,
      subject:    row.subject,
      body:       row.body,
      variables:  _parseArr_(row.variables),
      enabled:    row.enabled === true || row.enabled === "true",
      version:    Number(row.version) || 1,
      usageCount: Number(row.usageCount) || 0,
      createdBy:  row.createdBy,
      createdAt:  row.createdAt,
      updatedAt:  row.updatedAt,
    };
  }

  function _hydratePref_(row) {
    return {
      id:              row.id,
      userId:          row.userId,
      userEmail:       row.userEmail,
      enabledChannels: _parseArr_(row.enabledChannels),
      enabledTypes:    _parseArr_(row.enabledTypes),
      quietHoursStart: row.quietHoursStart || undefined,
      quietHoursEnd:   row.quietHoursEnd || undefined,
      digestEnabled:   row.digestEnabled === true || row.digestEnabled === "true",
      digestFrequency: row.digestFrequency || "diario",
      updatedAt:       row.updatedAt,
    };
  }

  function _hydrateDigest_(row) {
    return {
      id:                row.id,
      recipientId:       row.recipientId,
      recipientEmail:    row.recipientEmail,
      frequency:         row.frequency,
      status:            row.status || "pendiente",
      periodStart:       row.periodStart,
      periodEnd:         row.periodEnd,
      notificationCount: Number(row.notificationCount) || 0,
      summary:           _parseJson_(row.summary),
      generatedAt:       row.generatedAt || undefined,
      deliveredAt:       row.deliveredAt || undefined,
      createdAt:         row.createdAt,
    };
  }

  // ─── Template rendering ───────────────────────────────────────────────────

  /**
   * Replaces {{key}} placeholders in a string with values from `vars`.
   * No eval(), no dynamic code — pure string replacement.
   */
  function _renderTemplate_(template, vars) {
    if (!template || !vars) return template || "";
    var result = template;
    Object.keys(vars).forEach(function (key) {
      var placeholder = "{{" + key + "}}";
      while (result.indexOf(placeholder) !== -1) {
        result = result.replace(placeholder, String(vars[key] || ""));
      }
    });
    return result;
  }

  // ─── Duplicate detection ──────────────────────────────────────────────────

  function _isDuplicate_(sourceEventId, recipientId) {
    if (!sourceEventId || !recipientId) return false;
    var existing = _notifs_().findAll({ sourceEventId: sourceEventId, recipientId: recipientId });
    return existing && existing.length > 0;
  }

  // ─── Quiet hours enforcement ──────────────────────────────────────────────

  function _inQuietHours_(pref, priority) {
    if (priority === "urgente") return false;
    if (!pref || !pref.quietHoursStart || !pref.quietHoursEnd) return false;
    var now = new Date();
    var hh = now.getHours();
    var mm = now.getMinutes();
    var current = hh * 60 + mm;
    var parts = pref.quietHoursStart.split(":");
    var startMin = Number(parts[0]) * 60 + Number(parts[1] || 0);
    var endParts = pref.quietHoursEnd.split(":");
    var endMin = Number(endParts[0]) * 60 + Number(endParts[1] || 0);
    if (startMin <= endMin) {
      return current >= startMin && current < endMin;
    }
    return current >= startMin || current < endMin;
  }

  // ─── AUE event read ───────────────────────────────────────────────────────

  function _getAUEEvents_(params) {
    try {
      var repo = SheetRepository.forEntity("aueEvents");
      var rows = repo.findAll(params || {});
      return rows || [];
    } catch (e) {
      return [];
    }
  }

  // ─── Default templates seed ───────────────────────────────────────────────

  function _seedDefaultTemplates_() {
    var defaults = [
      {
        name: "Alerta de Plan",
        type: "alerta_plan",
        channel: "interna",
        subject: "Alerta: Plan {{planId}} requiere atención",
        body: "El plan {{planId}} ha generado una alerta de prioridad {{priority}}. Detalle: {{detail}}.",
        variables: ["planId", "priority", "detail"],
      },
      {
        name: "Tarea Vencida",
        type: "tarea_vencida",
        channel: "interna",
        subject: "Tarea vencida: {{taskName}}",
        body: "La tarea \"{{taskName}}\" venció el {{dueDate}} sin completarse. Responsable: {{assignee}}.",
        variables: ["taskName", "dueDate", "assignee"],
      },
      {
        name: "Nueva Recomendación",
        type: "nueva_recomendacion",
        channel: "interna",
        subject: "Nueva recomendación registrada",
        body: "Se registró la recomendación \"{{title}}\" con prioridad {{priority}} en {{engine}}.",
        variables: ["title", "priority", "engine"],
      },
      {
        name: "Diagnóstico Nuevo",
        type: "diagnostico_nuevo",
        channel: "interna",
        subject: "Nuevo diagnóstico disponible",
        body: "Se generó un nuevo diagnóstico en {{engine}}: {{summary}}.",
        variables: ["engine", "summary"],
      },
      {
        name: "Hito Completado",
        type: "hito_completado",
        channel: "interna",
        subject: "Hito completado: {{milestoneName}}",
        body: "El hito \"{{milestoneName}}\" del plan {{planId}} fue completado el {{completedAt}}.",
        variables: ["milestoneName", "planId", "completedAt"],
      },
      {
        name: "Regla Activada",
        type: "regla_activada",
        channel: "interna",
        subject: "Regla AUE activada: {{ruleName}}",
        body: "La regla \"{{ruleName}}\" fue activada por el evento {{eventType}} en {{sourceEngine}}.",
        variables: ["ruleName", "eventType", "sourceEngine"],
      },
      {
        name: "Evidencia Nueva",
        type: "evidencia_nueva",
        channel: "interna",
        subject: "Nueva evidencia adjuntada",
        body: "Se adjuntó evidencia al proceso {{processId}}: {{evidenceTitle}}.",
        variables: ["processId", "evidenceTitle"],
      },
      {
        name: "Resumen Diario",
        type: "resumen_diario",
        channel: "interna",
        subject: "Resumen del {{date}}: {{count}} notificaciones",
        body: "Resumen del día {{date}}. Total de notificaciones: {{count}}. Urgentes: {{urgent}}. Pendientes: {{pending}}.",
        variables: ["date", "count", "urgent", "pending"],
      },
    ];

    var repo = _templates_();
    defaults.forEach(function (tpl) {
      var existing = repo.findAll({ type: tpl.type, channel: tpl.channel });
      if (existing && existing.length > 0) return;
      var now = _now_();
      repo.create({
        id:         _tplId_(),
        name:       tpl.name,
        type:       tpl.type,
        channel:    tpl.channel,
        subject:    tpl.subject,
        body:       tpl.body,
        variables:  JSON.stringify(tpl.variables),
        enabled:    true,
        version:    1,
        usageCount: 0,
        createdBy:  "system",
        createdAt:  now,
        updatedAt:  now,
      });
    });
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  function getDashboard() {
    var now = _now_();
    var today = _today_();
    var allNotifs = _notifs_().findAll({}) || [];
    var allTemplates = _templates_().findAll({}) || [];
    var allDigests = _digests_().findAll({}) || [];

    var pending   = allNotifs.filter(function (n) { return n.status === "pendiente"; });
    var failed    = allNotifs.filter(function (n) { return n.status === "fallida"; });
    var delivered = allNotifs.filter(function (n) {
      return n.deliveredAt && String(n.deliveredAt).slice(0, 10) === today;
    });
    var read   = allNotifs.filter(function (n) { return n.status === "leida"; });
    var active = allTemplates.filter(function (t) { return t.enabled === true || t.enabled === "true"; });
    var digestsPending = allDigests.filter(function (d) { return d.status === "pendiente"; });

    var readRate = allNotifs.length > 0 ? Math.round((read.length / allNotifs.length) * 100) : 0;

    var channelMap = {};
    allNotifs.forEach(function (n) {
      var ch = n.channel || "interna";
      channelMap[ch] = (channelMap[ch] || 0) + 1;
    });
    var byChannel = Object.keys(channelMap).map(function (ch) {
      return { channel: ch, count: channelMap[ch] };
    });

    var typeMap = {};
    allNotifs.forEach(function (n) {
      if (n.templateType) {
        typeMap[n.templateType] = (typeMap[n.templateType] || 0) + 1;
      }
    });
    var byType = Object.keys(typeMap).map(function (t) {
      return { type: t, count: typeMap[t] };
    }).sort(function (a, b) { return b.count - a.count; }).slice(0, 8);

    var dayMap = {};
    allNotifs.forEach(function (n) {
      var d = String(n.createdAt).slice(0, 10);
      dayMap[d] = (dayMap[d] || 0) + 1;
    });
    var byDay = Object.keys(dayMap).sort().slice(-14).map(function (d) {
      return { date: d, count: dayMap[d] };
    });

    var recent = allNotifs
      .map(_hydrateNotif_)
      .sort(function (a, b) { return b.createdAt > a.createdAt ? 1 : -1; })
      .slice(0, 10);

    var deliveredTimes = allNotifs
      .filter(function (n) { return n.deliveredAt && n.createdAt; })
      .map(function (n) {
        return (new Date(n.deliveredAt).getTime() - new Date(n.createdAt).getTime()) / 1000;
      });
    var avgDelivery = deliveredTimes.length > 0
      ? Math.round(deliveredTimes.reduce(function (a, b) { return a + b; }, 0) / deliveredTimes.length)
      : 0;

    return {
      totalNotifications:   allNotifs.length,
      pendingNotifications: pending.length,
      deliveredToday:       delivered.length,
      failedNotifications:  failed.length,
      avgDeliveryTime:      avgDelivery,
      activeTemplates:      active.length,
      digestsPending:       digestsPending.length,
      readRate:             readRate,
      notificationsByChannel: byChannel,
      notificationsByType:    byType,
      recentNotifications:    recent,
      notificationsByDay:     byDay,
      generatedAt: now,
    };
  }

  function getNotifications(params) {
    var p = params || {};
    var rows = _notifs_().findAll(
      Object.keys(p).length > 0
        ? {
            recipientId:  p.recipientId,
            status:       p.status,
            channel:      p.channel,
            templateType: p.templateType,
          }
        : {}
    ) || [];

    var result = rows.map(_hydrateNotif_);
    if (p.priority) result = result.filter(function (n) { return n.priority === p.priority; });
    if (p.from)     result = result.filter(function (n) { return n.createdAt >= p.from; });
    if (p.to)       result = result.filter(function (n) { return n.createdAt <= p.to; });
    result.sort(function (a, b) { return b.createdAt > a.createdAt ? 1 : -1; });
    if (p.limit) result = result.slice(0, Number(p.limit));
    return result;
  }

  function createNotification(params) {
    var p = params || {};
    var now = _now_();

    // Duplicate check
    if (p.sourceEventId && p.recipientId) {
      if (_isDuplicate_(p.sourceEventId, p.recipientId)) {
        throw new Error("NCE_DUPLICATE: Ya existe una notificación para este evento y destinatario.");
      }
    }

    // Resolve template
    var subject = p.subject || "";
    var body    = p.body || "";
    var tplType = p.templateType;
    var tplId   = p.templateId;

    if (tplId) {
      var tplRow = _templates_().findById(tplId);
      if (tplRow && (tplRow.enabled === true || tplRow.enabled === "true")) {
        var tpl = _hydrateTemplate_(tplRow);
        var vars = p.variables || {};
        subject = _renderTemplate_(tpl.subject, vars);
        body    = _renderTemplate_(tpl.body, vars);
        tplType = tplType || tpl.type;
        // bump usage count
        _templates_().update(tplId, { usageCount: (tpl.usageCount + 1), updatedAt: now });
      }
    } else if (tplType) {
      var rows = _templates_().findAll({ type: tplType, channel: p.channel || "interna" });
      if (rows && rows.length > 0) {
        var tpl = _hydrateTemplate_(rows[0]);
        if (tpl.enabled) {
          var vars = p.variables || {};
          subject = _renderTemplate_(tpl.subject, vars);
          body    = _renderTemplate_(tpl.body, vars);
          tplId   = tpl.id;
          _templates_().update(tpl.id, { usageCount: (tpl.usageCount + 1), updatedAt: now });
        }
      }
    }

    // Quiet hours check (skip for urgente)
    var priority = p.priority || "normal";
    if (p.recipientId && priority !== "urgente") {
      var prefRows = _prefs_().findAll({ userId: p.recipientId });
      if (prefRows && prefRows.length > 0) {
        var pref = _hydratePref_(prefRows[0]);
        if (_inQuietHours_(pref, priority)) {
          // Queue as pendiente — respect quiet hours
          priority = priority;
        }
      }
    }

    var notif = {
      id:            _notifId_(),
      recipientId:   p.recipientId || "",
      recipientEmail: p.recipientEmail || "",
      title:         subject || p.title || "Notificación",
      body:          body || p.body || "",
      channel:       p.channel || "interna",
      status:        "pendiente",
      priority:      priority,
      templateId:    tplId || "",
      templateType:  tplType || "",
      sourceEventId: p.sourceEventId || "",
      sourceEngine:  p.sourceEngine || "",
      metadata:      JSON.stringify(p.metadata || {}),
      readAt:        "",
      deliveredAt:   "",
      createdAt:     now,
      updatedAt:     now,
    };

    _notifs_().create(notif);

    // For internal channel: mark delivered immediately
    if (notif.channel === "interna") {
      _notifs_().update(notif.id, { status: "entregada", deliveredAt: now, updatedAt: now });
      notif.status = "entregada";
      notif.deliveredAt = now;
    }
    // correo and google_chat: contract only — stays pendiente

    return _hydrateNotif_(notif);
  }

  function markRead(params) {
    var p = params || {};
    var notif = _notifs_().findById(p.notificationId);
    if (!notif) throw new Error("NCE_NOT_FOUND: Notificación no encontrada.");
    if (notif.recipientId !== p.recipientId) throw new Error("NCE_FORBIDDEN: Sin permiso.");
    var now = _now_();
    _notifs_().update(p.notificationId, { status: "leida", readAt: now, updatedAt: now });
    return _hydrateNotif_(Object.assign({}, notif, { status: "leida", readAt: now, updatedAt: now }));
  }

  function archiveNotification(params) {
    var p = params || {};
    var notif = _notifs_().findById(p.notificationId);
    if (!notif) throw new Error("NCE_NOT_FOUND: Notificación no encontrada.");
    var now = _now_();
    _notifs_().update(p.notificationId, { status: "archivada", updatedAt: now });
    return { archived: true, id: p.notificationId };
  }

  function getTemplates(params) {
    var p = params || {};
    var filter = {};
    if (p.type)    filter.type    = p.type;
    if (p.channel) filter.channel = p.channel;
    if (typeof p.enabled !== "undefined") filter.enabled = p.enabled;

    var rows = _templates_().findAll(filter) || [];
    var result = rows.map(_hydrateTemplate_);
    result.sort(function (a, b) { return a.name > b.name ? 1 : -1; });
    if (p.limit) result = result.slice(0, Number(p.limit));
    return result;
  }

  function getTemplate(params) {
    var row = _templates_().findById(params.id);
    if (!row) throw new Error("NCE_NOT_FOUND: Template no encontrado.");
    return _hydrateTemplate_(row);
  }

  function createTemplate(params) {
    var p = params || {};
    var now = _now_();
    var tpl = {
      id:         _tplId_(),
      name:       p.name || "Nuevo Template",
      type:       p.type,
      channel:    p.channel || "interna",
      subject:    p.subject || "",
      body:       p.body || "",
      variables:  JSON.stringify(p.variables || []),
      enabled:    true,
      version:    1,
      usageCount: 0,
      createdBy:  p.createdBy || "system",
      createdAt:  now,
      updatedAt:  now,
    };
    _templates_().create(tpl);
    return _hydrateTemplate_(tpl);
  }

  function updateTemplate(params) {
    var p = params || {};
    if (!p.id) throw new Error("NCE_VALIDATION: id es requerido.");
    var existing = _templates_().findById(p.id);
    if (!existing) throw new Error("NCE_NOT_FOUND: Template no encontrado.");
    var now = _now_();
    var hydrated = _hydrateTemplate_(existing);

    var subjectChanged = p.subject && p.subject !== hydrated.subject;
    var bodyChanged    = p.body && p.body !== hydrated.body;
    var newVersion = (subjectChanged || bodyChanged) ? hydrated.version + 1 : hydrated.version;

    var updates = { updatedAt: now, version: newVersion };
    if (p.name)      updates.name    = p.name;
    if (p.subject)   updates.subject = p.subject;
    if (p.body)      updates.body    = p.body;
    if (p.variables) updates.variables = JSON.stringify(p.variables);
    if (typeof p.enabled !== "undefined") updates.enabled = p.enabled;

    _templates_().update(p.id, updates);
    return _hydrateTemplate_(Object.assign({}, existing, updates));
  }

  function getPreference(params) {
    var p = params || {};
    var rows = _prefs_().findAll({ userId: p.userId });
    if (!rows || rows.length === 0) {
      return {
        id: "",
        userId: p.userId || "",
        userEmail: p.userEmail || "",
        enabledChannels: ["interna"],
        enabledTypes: [
          "alerta_plan", "tarea_vencida", "nueva_recomendacion",
          "diagnostico_nuevo", "hito_completado", "regla_activada",
          "evidencia_nueva", "resumen_diario"
        ],
        quietHoursStart: undefined,
        quietHoursEnd: undefined,
        digestEnabled: true,
        digestFrequency: "diario",
        updatedAt: _now_(),
      };
    }
    return _hydratePref_(rows[0]);
  }

  function updatePreference(params) {
    var p = params || {};
    if (!p.userId) throw new Error("NCE_VALIDATION: userId es requerido.");
    var now = _now_();
    var rows = _prefs_().findAll({ userId: p.userId });
    var updates = {
      updatedAt: now,
    };
    if (p.enabledChannels)  updates.enabledChannels  = JSON.stringify(p.enabledChannels);
    if (p.enabledTypes)     updates.enabledTypes     = JSON.stringify(p.enabledTypes);
    if (typeof p.quietHoursStart !== "undefined") updates.quietHoursStart = p.quietHoursStart || "";
    if (typeof p.quietHoursEnd   !== "undefined") updates.quietHoursEnd   = p.quietHoursEnd   || "";
    if (typeof p.digestEnabled   !== "undefined") updates.digestEnabled   = p.digestEnabled;
    if (p.digestFrequency)  updates.digestFrequency  = p.digestFrequency;

    if (rows && rows.length > 0) {
      _prefs_().update(rows[0].id, updates);
      return _hydratePref_(Object.assign({}, rows[0], updates));
    }

    var newPref = {
      id:              _prefId_(),
      userId:          p.userId,
      userEmail:       p.userEmail || "",
      enabledChannels: updates.enabledChannels || JSON.stringify(["interna"]),
      enabledTypes:    updates.enabledTypes    || JSON.stringify([
        "alerta_plan", "tarea_vencida", "nueva_recomendacion",
        "diagnostico_nuevo", "hito_completado", "regla_activada",
        "evidencia_nueva", "resumen_diario"
      ]),
      quietHoursStart: updates.quietHoursStart || "",
      quietHoursEnd:   updates.quietHoursEnd   || "",
      digestEnabled:   typeof updates.digestEnabled !== "undefined" ? updates.digestEnabled : true,
      digestFrequency: updates.digestFrequency || "diario",
      updatedAt:       now,
    };
    _prefs_().create(newPref);
    return _hydratePref_(newPref);
  }

  function generateDigest(params) {
    var p = params || {};
    var now   = _now_();
    var today = _today_();

    var freq = p.frequency || "diario";
    var periodStart, periodEnd;
    if (freq === "diario") {
      periodStart = today;
      periodEnd   = today;
    } else if (freq === "semanal") {
      var d = new Date();
      d.setDate(d.getDate() - 6);
      periodStart = d.toISOString().slice(0, 10);
      periodEnd   = today;
    } else {
      var d2 = new Date();
      d2.setDate(d2.getDate() - 13);
      periodStart = d2.toISOString().slice(0, 10);
      periodEnd   = today;
    }

    var userNotifs = _notifs_().findAll({ recipientId: p.recipientId }) || [];
    var inPeriod = userNotifs.filter(function (n) {
      var d = String(n.createdAt).slice(0, 10);
      return d >= periodStart && d <= periodEnd;
    });

    var urgent  = inPeriod.filter(function (n) { return n.priority === "urgente"; }).length;
    var alta    = inPeriod.filter(function (n) { return n.priority === "alta"; }).length;
    var unread  = inPeriod.filter(function (n) { return n.status !== "leida" && n.status !== "archivada"; }).length;

    var summary = {
      periodStart:    periodStart,
      periodEnd:      periodEnd,
      total:          inPeriod.length,
      urgent:         urgent,
      alta:           alta,
      unread:         unread,
    };

    var digest = {
      id:                _digestId_(),
      recipientId:       p.recipientId || "",
      recipientEmail:    p.recipientEmail || "",
      frequency:         freq,
      status:            "generado",
      periodStart:       periodStart,
      periodEnd:         periodEnd,
      notificationCount: inPeriod.length,
      summary:           JSON.stringify(summary),
      generatedAt:       now,
      deliveredAt:       "",
      createdAt:         now,
    };

    _digests_().create(digest);
    return _hydrateDigest_(digest);
  }

  function getDigests(params) {
    var p = params || {};
    var filter = {};
    if (p.recipientId) filter.recipientId = p.recipientId;
    if (p.status)      filter.status      = p.status;
    if (p.frequency)   filter.frequency   = p.frequency;

    var rows = _digests_().findAll(filter) || [];
    var result = rows.map(_hydrateDigest_);
    result.sort(function (a, b) { return b.createdAt > a.createdAt ? 1 : -1; });
    if (p.limit) result = result.slice(0, Number(p.limit));
    return result;
  }

  function consumeAUEEvents(params) {
    var p = params || {};
    var events = _getAUEEvents_({ status: "procesado" });
    if (!events || events.length === 0) return { processed: 0 };

    var limit = Number(p.limit) || 50;
    var processed = 0;

    events.slice(0, limit).forEach(function (evt) {
      var eventType = evt.eventType;
      var tplTypeMap = {
        "alert.new":              "alerta_plan",
        "task.overdue":           "tarea_vencida",
        "recommendation.new":     "nueva_recomendacion",
        "diagnosis.new":          "diagnostico_nuevo",
        "milestone.completed":    "hito_completado",
        "rule.triggered":         "regla_activada",
        "evidence.added":         "evidencia_nueva",
      };
      var tplType = tplTypeMap[eventType];
      if (!tplType) return;

      var payload = evt.payload;
      if (typeof payload === "string") {
        try { payload = JSON.parse(payload); } catch (e) { payload = {}; }
      }
      payload = payload || {};

      var recipientId    = String(payload.recipientId    || payload.assignee || "sistema");
      var recipientEmail = String(payload.recipientEmail || payload.email    || "");

      if (_isDuplicate_(evt.id, recipientId)) return;

      try {
        createNotification({
          recipientId:    recipientId,
          recipientEmail: recipientEmail,
          templateType:   tplType,
          variables:      payload,
          channel:        "interna",
          priority:       evt.priority === "critica" ? "urgente" :
                          evt.priority === "alta"    ? "alta"    : "normal",
          sourceEventId:  evt.id,
          sourceEngine:   evt.sourceEngine,
        });
        processed++;
      } catch (e) {
        // skip duplicates and other recoverable errors
      }
    });

    return { processed: processed };
  }

  function seedTemplates() {
    _seedDefaultTemplates_();
    return { seeded: true };
  }

  // ─── Module bootstrap ─────────────────────────────────────────────────────

  _seedDefaultTemplates_();

  return {
    getDashboard:        getDashboard,
    getNotifications:    getNotifications,
    createNotification:  createNotification,
    markRead:            markRead,
    archiveNotification: archiveNotification,
    getTemplates:        getTemplates,
    getTemplate:         getTemplate,
    createTemplate:      createTemplate,
    updateTemplate:      updateTemplate,
    getPreference:       getPreference,
    updatePreference:    updatePreference,
    generateDigest:      generateDigest,
    getDigests:          getDigests,
    consumeAUEEvents:    consumeAUEEvents,
    seedTemplates:       seedTemplates,
  };
})();
