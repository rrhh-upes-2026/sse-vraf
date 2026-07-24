// ============================================================
// ICE — Indicator Capture Engine Controller  |  Sprint 018
// ============================================================

var ICEController = (function () {
  "use strict";

  var SHEET = {
    PERIODS:   "ICE_Periods",
    CAPTURAS:  "ICE_Capturas",
    CAP_VARS:  "ICE_CaptureVariables",
    APPROVALS: "ICE_Approvals",
    LOCKS:     "ICE_Locks",
    AUDIT:     "ICE_AuditTrail",
  };

  var repo_ = {
    get periods()   { return SheetRepository.for(SHEET.PERIODS);   },
    get capturas()  { return SheetRepository.for(SHEET.CAPTURAS);  },
    get capVars()   { return SheetRepository.for(SHEET.CAP_VARS);  },
    get approvals() { return SheetRepository.for(SHEET.APPROVALS); },
    get locks()     { return SheetRepository.for(SHEET.LOCKS);     },
    get audit()     { return SheetRepository.for(SHEET.AUDIT);     },
  };

  function now_() { return new Date().toISOString(); }

  // ── AuditService ────────────────────────────────────────────────────────────

  var AuditService_ = {
    record: function (opts) {
      try {
        repo_.audit.create({
          id:         IdGen.entityId("ICE-AUD"),
          entityType: opts.entityType || "",
          entityId:   opts.entityId  || "",
          action:     opts.action    || "",
          userId:     opts.userId    || "",
          timestamp:  now_(),
          before:     typeof opts.before === "string" ? opts.before : JSON.stringify(opts.before || ""),
          after:      typeof opts.after  === "string" ? opts.after  : JSON.stringify(opts.after  || ""),
          notes:      opts.notes     || "",
        });
      } catch (e) {}
    },
  };

  // ── LockService ──────────────────────────────────────────────────────────────

  var LockService_ = {
    isPeriodLocked: function (periodId) {
      var period = repo_.periods.find(periodId);
      return period && (period.estado === "cerrado" || period.estado === "bloqueado");
    },
    isCaptureLocked: function (captureId) {
      var lock = repo_.locks.findAll().filter(function (l) { return l.captureId === captureId; })[0];
      return !!lock;
    },
    lockCapture: function (captureId, periodId, userId, reason) {
      repo_.locks.create({
        id:        IdGen.entityId("ICE-LOCK"),
        periodId:  periodId || "",
        captureId: captureId,
        lockedAt:  now_(),
        lockedBy:  userId,
        reason:    reason || "Período cerrado",
      });
    },
    lockPeriodCaptures: function (periodId, userId) {
      var captures = repo_.capturas.findAll().filter(function (c) { return c.periodId === periodId; });
      captures.forEach(function (c) {
        LockService_.lockCapture(c.id, periodId, userId, "Período bloqueado");
      });
    },
  };

  // ── CaptureValidator ─────────────────────────────────────────────────────────

  var CaptureValidator_ = {
    validatePeriod: function (period) {
      if (!period) throw new Error("Período no encontrado.");
      if (period.estado !== "abierto") throw new Error("El período '" + period.nombre + "' no está abierto. Estado: " + period.estado);
    },
    validateNoDuplicate: function (indicatorId, periodId, existingId) {
      var existing = repo_.capturas.findAll().filter(function (c) {
        return c.indicatorId === indicatorId && c.periodId === periodId && c.id !== (existingId || "");
      });
      if (existing.length > 0) throw new Error("Ya existe una captura para este indicador en el período seleccionado.");
    },
    validateVariables: function (variables) {
      (variables || []).forEach(function (v) {
        if (v.valor === null || v.valor === undefined || v.valor === "") {
          throw new Error("La variable '" + v.variableId + "' no puede estar vacía.");
        }
        var num = Number(v.valor);
        if (isNaN(num)) throw new Error("El valor de la variable '" + v.variableId + "' debe ser numérico.");
      });
    },
  };

  // ── CalculationService ───────────────────────────────────────────────────────

  var CalculationService_ = {
    calculate: function (indicatorId, variables, ctx) {
      var indicator = IDEController.handle("ide.getIndicator", { id: indicatorId }, ctx || {});
      if (!indicator) throw new Error("Indicador no encontrado: " + indicatorId);
      if (!indicator.formulaId) throw new Error("El indicador no tiene fórmula asignada.");

      var formula = FMIController.handle("fmi.getFormula", { id: indicator.formulaId }, ctx || {});
      if (!formula) throw new Error("Fórmula no encontrada: " + indicator.formulaId);

      var valuesMap = {};
      (variables || []).forEach(function (v) {
        var fmiVar = (formula.variables || []).filter(function (fv) { return fv.id === v.variableId; })[0];
        if (fmiVar) valuesMap[fmiVar.nombre] = Number(v.valor);
      });

      var calcResult = FMIController.handle("fmi.calculateFormula", { id: indicator.formulaId, values: valuesMap }, ctx || {});
      var resultado = calcResult.result;

      var rangeLevel = null;
      if (indicator.rangeConfigId) {
        try {
          var evalResult = FMIController.handle("fmi.evaluateRange", { id: indicator.rangeConfigId, value: resultado }, ctx || {});
          rangeLevel = evalResult.status || evalResult.level || null;
        } catch (e) {}
      }

      var meta = Number(indicator.meta) || 0;
      var cumplimiento = meta > 0 ? Math.round((resultado / meta) * 10000) / 100 : null;

      return {
        resultado:       resultado,
        meta:            meta,
        cumplimiento:    cumplimiento,
        rangeLevel:      rangeLevel,
        formulaVersion:  indicator.version || 1,
        indicatorId:     indicatorId,
        valuesUsed:      valuesMap,
      };
    },
  };

  // ── PeriodService ────────────────────────────────────────────────────────────

  var PeriodService_ = {
    list: function (params) {
      var all = repo_.periods.findAll();
      if (params && params.estado) all = all.filter(function (p) { return p.estado === params.estado; });
      if (params && params.activo !== undefined) all = all.filter(function (p) { return String(p.activo) === String(params.activo); });
      return all;
    },
    get: function (id) {
      var p = repo_.periods.find(id);
      if (!p) throw new Error("Período no encontrado: " + id);
      return p;
    },
    create: function (params, ctx) {
      if (!params.nombre) throw new Error("El nombre del período es requerido.");
      if (!params.fechaInicio || !params.fechaFin) throw new Error("fechaInicio y fechaFin son requeridos.");
      var period = repo_.periods.create({
        id:          IdGen.entityId("ICE-PER"),
        nombre:      params.nombre,
        tipo:        params.tipo       || "mensual",
        fechaInicio: params.fechaInicio,
        fechaFin:    params.fechaFin,
        estado:      "abierto",
        activo:      true,
        createdAt:   now_(),
        updatedAt:   now_(),
        createdBy:   ctx && ctx.userId || "",
      });
      AuditService_.record({ entityType: "period", entityId: period.id, action: "crear", userId: ctx && ctx.userId, after: period });
      return period;
    },
    update: function (params, ctx) {
      var old = PeriodService_.get(params.id);
      if (LockService_.isPeriodLocked(params.id)) throw new Error("El período está cerrado o bloqueado.");
      var updated = repo_.periods.update(params.id, {
        nombre:      params.nombre      || old.nombre,
        tipo:        params.tipo        || old.tipo,
        fechaInicio: params.fechaInicio || old.fechaInicio,
        fechaFin:    params.fechaFin    || old.fechaFin,
        activo:      params.activo !== undefined ? params.activo : old.activo,
        updatedAt:   now_(),
      });
      AuditService_.record({ entityType: "period", entityId: params.id, action: "actualizar", userId: ctx && ctx.userId, before: old, after: updated });
      return updated;
    },
    transition: function (id, newEstado, ctx) {
      var old = PeriodService_.get(id);
      var allowed = { abierto: ["en_revision","cerrado"], en_revision: ["abierto","cerrado","bloqueado"], cerrado: ["abierto"], bloqueado: [] };
      var validNext = allowed[old.estado] || [];
      if (validNext.indexOf(newEstado) === -1) {
        throw new Error("Transición no permitida: " + old.estado + " → " + newEstado);
      }
      var updated = repo_.periods.update(id, { estado: newEstado, activo: newEstado === "abierto", updatedAt: now_() });
      if (newEstado === "bloqueado" || newEstado === "cerrado") {
        LockService_.lockPeriodCaptures(id, ctx && ctx.userId);
      }
      AuditService_.record({ entityType: "period", entityId: id, action: newEstado, userId: ctx && ctx.userId, before: old.estado, after: newEstado });
      tryNotify_("periodo_" + newEstado, ctx && ctx.userId, { periodId: id, nombre: old.nombre });
      return updated;
    },
  };

  // ── CaptureService ───────────────────────────────────────────────────────────

  var CaptureService_ = {
    list: function (params) {
      var all = repo_.capturas.findAll();
      if (params && params.periodId)     all = all.filter(function (c) { return c.periodId     === params.periodId;     });
      if (params && params.indicatorId)  all = all.filter(function (c) { return c.indicatorId  === params.indicatorId;  });
      if (params && params.responsibleId)all = all.filter(function (c) { return c.responsibleId=== params.responsibleId;});
      if (params && params.status)       all = all.filter(function (c) { return c.status       === params.status;       });
      return all;
    },
    get: function (id) {
      var c = repo_.capturas.find(id);
      if (!c) throw new Error("Captura no encontrada: " + id);
      return c;
    },
    create: function (params, ctx) {
      var period = PeriodService_.get(params.periodId);
      CaptureValidator_.validatePeriod(period);
      CaptureValidator_.validateNoDuplicate(params.indicatorId, params.periodId, null);

      var captura = repo_.capturas.create({
        id:                 IdGen.entityId("ICE-CAP"),
        indicatorId:        params.indicatorId,
        periodId:           params.periodId,
        responsibleId:      params.responsibleId || (ctx && ctx.userId) || "",
        captureDate:        now_(),
        formulaVersion:     null,
        resultadoCalculado: null,
        meta:               null,
        cumplimiento:       null,
        rangeLevel:         null,
        status:             "borrador",
        comments:           params.comments || "",
        evidenceRefs:       "[]",
        createdBy:          ctx && ctx.userId || "",
        updatedBy:          ctx && ctx.userId || "",
        createdAt:          now_(),
        updatedAt:          now_(),
      });
      AuditService_.record({ entityType: "captura", entityId: captura.id, action: "crear", userId: ctx && ctx.userId, after: captura });
      return captura;
    },
    update: function (params, ctx) {
      var old = CaptureService_.get(params.id);
      if (LockService_.isCaptureLocked(params.id)) throw new Error("La captura está bloqueada.");
      if (old.status === "aprobada" || old.status === "cerrada") throw new Error("No se puede editar una captura en estado '" + old.status + "'.");
      var updated = repo_.capturas.update(params.id, {
        comments:  params.comments !== undefined ? params.comments : old.comments,
        updatedBy: ctx && ctx.userId || "",
        updatedAt: now_(),
      });
      AuditService_.record({ entityType: "captura", entityId: params.id, action: "actualizar", userId: ctx && ctx.userId, before: old, after: updated });
      return updated;
    },
    delete: function (id, ctx) {
      var old = CaptureService_.get(id);
      if (old.status !== "borrador") throw new Error("Solo se pueden eliminar capturas en borrador.");
      repo_.capturas.delete(id);
      repo_.capVars.findAll().filter(function (v) { return v.captureId === id; }).forEach(function (v) { repo_.capVars.delete(v.id); });
      AuditService_.record({ entityType: "captura", entityId: id, action: "eliminar", userId: ctx && ctx.userId, before: old });
      return { deleted: true, id: id };
    },
    calculate: function (params, ctx) {
      var captura = CaptureService_.get(params.captureId);
      var vars    = VariableCaptureService_.list(params.captureId);
      if (params.variables) vars = params.variables;

      var calcData = CalculationService_.calculate(captura.indicatorId, vars, ctx);
      var updated  = repo_.capturas.update(captura.id, {
        resultadoCalculado: calcData.resultado,
        meta:               calcData.meta,
        cumplimiento:       calcData.cumplimiento,
        rangeLevel:         calcData.rangeLevel,
        formulaVersion:     calcData.formulaVersion,
        updatedAt:          now_(),
        updatedBy:          ctx && ctx.userId || "",
      });

      if (calcData.rangeLevel === "critico") {
        tryTriggerAUE_("resultado_critico", { capturaId: captura.id, indicatorId: captura.indicatorId, resultado: calcData.resultado });
      }
      if (calcData.cumplimiento !== null && calcData.cumplimiento < 100) {
        tryTriggerAUE_("meta_incumplida", { capturaId: captura.id, indicatorId: captura.indicatorId, cumplimiento: calcData.cumplimiento });
      }

      return Object.assign({}, updated, { calculation: calcData });
    },
    submit: function (id, ctx) {
      var old = CaptureService_.get(id);
      if (old.status !== "borrador") throw new Error("Solo se pueden enviar capturas en borrador.");

      var vars = VariableCaptureService_.list(id);
      if (!vars.length) throw new Error("Debe ingresar al menos una variable antes de enviar.");

      // Recalculate before submit
      CaptureService_.calculate({ captureId: id }, ctx);

      var updated = repo_.capturas.update(id, { status: "enviada", updatedBy: ctx && ctx.userId || "", updatedAt: now_() });

      // Create first pending approval
      ApprovalService_.createPending_(id, 1, ctx);

      AuditService_.record({ entityType: "captura", entityId: id, action: "enviar", userId: ctx && ctx.userId, before: "borrador", after: "enviada" });
      tryNotify_("captura_enviada", old.responsibleId, { capturaId: id, indicatorId: old.indicatorId });
      tryIngestIIA_({ capturaId: id, indicatorId: old.indicatorId, periodId: old.periodId, resultado: updated.resultadoCalculado, rangeLevel: updated.rangeLevel, cumplimiento: updated.cumplimiento, captureDate: updated.captureDate });

      return updated;
    },
    getMyIndicators: function (params, ctx) {
      var userId = (params && params.userId) || (ctx && ctx.userId) || "";
      var indicators = IDEController.handle("ide.listIndicators", { status: "publicado" }, ctx || {});
      var mine = (indicators || []).filter(function (ind) { return ind.responsibleId === userId; });

      var activePeriods = PeriodService_.list({ estado: "abierto" });
      var activePeriod  = activePeriods[0] || null;

      return mine.map(function (ind) {
        var captura = activePeriod
          ? (repo_.capturas.findAll().filter(function (c) { return c.indicatorId === ind.id && c.periodId === activePeriod.id; })[0] || null)
          : null;
        return { indicator: ind, captura: captura, activePeriod: activePeriod };
      });
    },
    getContext: function (indicatorId, periodId) {
      var indicator = IDEController.handle("ide.getIndicator", { id: indicatorId }, {});
      if (!indicator) throw new Error("Indicador no encontrado: " + indicatorId);

      var period  = PeriodService_.get(periodId);
      var formula = null;
      var rangeConfig = null;

      if (indicator.formulaId) {
        try { formula = FMIController.handle("fmi.getFormula", { id: indicator.formulaId }, {}); } catch (e) {}
      }
      if (indicator.rangeConfigId) {
        try { rangeConfig = FMIController.handle("fmi.getRangeConfig", { id: indicator.rangeConfigId }, {}); } catch (e) {}
      }

      var existing = repo_.capturas.findAll().filter(function (c) { return c.indicatorId === indicatorId && c.periodId === periodId; })[0] || null;
      var existingVars = existing ? VariableCaptureService_.list(existing.id) : [];

      return { indicator: indicator, period: period, formula: formula, rangeConfig: rangeConfig, existingCaptura: existing, existingVariables: existingVars };
    },
  };

  // ── VariableCaptureService ───────────────────────────────────────────────────

  var VariableCaptureService_ = {
    list: function (captureId) {
      return repo_.capVars.findAll().filter(function (v) { return v.captureId === captureId; });
    },
    save: function (captureId, variables, ctx) {
      var captura = CaptureService_.get(captureId);
      if (LockService_.isCaptureLocked(captureId)) throw new Error("La captura está bloqueada.");
      if (captura.status !== "borrador") throw new Error("Solo se pueden editar variables en capturas en borrador.");

      CaptureValidator_.validateVariables(variables);

      var existing = VariableCaptureService_.list(captureId);
      existing.forEach(function (v) { repo_.capVars.delete(v.id); });

      var saved = (variables || []).map(function (v) {
        return repo_.capVars.create({
          id:         IdGen.entityId("ICE-VAR"),
          captureId:  captureId,
          variableId: v.variableId,
          valor:      String(v.valor),
          unidad:     v.unidad || "",
          createdAt:  now_(),
        });
      });

      AuditService_.record({ entityType: "captura_vars", entityId: captureId, action: "guardar_variables", userId: ctx && ctx.userId, after: variables });
      return saved;
    },
  };

  // ── ApprovalService ──────────────────────────────────────────────────────────

  var ApprovalService_ = {
    list: function (captureId) {
      return repo_.approvals.findAll().filter(function (a) { return a.captureId === captureId; });
    },
    createPending_: function (captureId, nivel, ctx) {
      return repo_.approvals.create({
        id:           IdGen.entityId("ICE-APR"),
        captureId:    captureId,
        nivel:        nivel,
        responsable:  ctx && ctx.userId || "",
        fecha:        now_(),
        estado:       "pendiente",
        comentarios:  "",
      });
    },
    approve: function (params, ctx) {
      var captura = CaptureService_.get(params.captureId);
      var approvals = ApprovalService_.list(params.captureId);
      var pending   = approvals.filter(function (a) { return a.estado === "pendiente"; })[0];
      if (!pending) throw new Error("No hay aprobación pendiente para esta captura.");

      repo_.approvals.update(pending.id, { estado: "aprobado", responsable: ctx && ctx.userId || "", fecha: now_(), comentarios: params.comentarios || "" });

      var nextStatus;
      if (pending.nivel >= 2) {
        nextStatus = "aprobada";
        ApprovalService_.createPending_(params.captureId, pending.nivel + 1, ctx);
        nextStatus = "aprobada";
      } else {
        ApprovalService_.createPending_(params.captureId, pending.nivel + 1, ctx);
        nextStatus = "en_revision";
      }

      repo_.capturas.update(params.captureId, { status: nextStatus, updatedBy: ctx && ctx.userId || "", updatedAt: now_() });
      AuditService_.record({ entityType: "captura", entityId: params.captureId, action: "aprobar_nivel_" + pending.nivel, userId: ctx && ctx.userId, before: captura.status, after: nextStatus });
      tryNotify_("captura_aprobada", captura.responsibleId, { capturaId: params.captureId, nivel: pending.nivel });

      if (nextStatus === "aprobada") {
        LockService_.lockCapture(params.captureId, captura.periodId, ctx && ctx.userId, "Captura aprobada");
      }

      return repo_.capturas.find(params.captureId);
    },
    reject: function (params, ctx) {
      var captura = CaptureService_.get(params.captureId);
      var approvals = ApprovalService_.list(params.captureId);
      var pending   = approvals.filter(function (a) { return a.estado === "pendiente"; })[0];
      if (!pending) throw new Error("No hay aprobación pendiente para esta captura.");

      repo_.approvals.update(pending.id, { estado: "rechazado", responsable: ctx && ctx.userId || "", fecha: now_(), comentarios: params.comentarios || "" });
      repo_.capturas.update(params.captureId, { status: "rechazada", updatedBy: ctx && ctx.userId || "", updatedAt: now_() });

      AuditService_.record({ entityType: "captura", entityId: params.captureId, action: "rechazar_nivel_" + pending.nivel, userId: ctx && ctx.userId, before: captura.status, after: "rechazada" });
      tryNotify_("captura_rechazada", captura.responsibleId, { capturaId: params.captureId, motivo: params.comentarios });

      return repo_.capturas.find(params.captureId);
    },
    reopen: function (params, ctx) {
      var captura = CaptureService_.get(params.captureId);
      if (captura.status !== "rechazada") throw new Error("Solo se pueden reabrir capturas rechazadas.");
      if (LockService_.isCaptureLocked(params.captureId)) throw new Error("La captura está bloqueada y no puede reabrirse.");

      // Clear pending approvals
      ApprovalService_.list(params.captureId).forEach(function (a) {
        if (a.estado === "pendiente") repo_.approvals.update(a.id, { estado: "anulado", comentarios: "Reapertura manual" });
      });

      repo_.capturas.update(params.captureId, { status: "borrador", updatedBy: ctx && ctx.userId || "", updatedAt: now_() });
      AuditService_.record({ entityType: "captura", entityId: params.captureId, action: "reabrir", userId: ctx && ctx.userId, before: "rechazada", after: "borrador", notes: params.motivo || "" });

      return repo_.capturas.find(params.captureId);
    },
  };

  // ── EvidenceLinkService ──────────────────────────────────────────────────────

  var EvidenceLinkService_ = {
    list: function (captureId) {
      var captura = CaptureService_.get(captureId);
      try { return JSON.parse(captura.evidenceRefs || "[]"); } catch (e) { return []; }
    },
    link: function (captureId, evidenceId, ctx) {
      var captura = CaptureService_.get(captureId);
      if (LockService_.isCaptureLocked(captureId)) throw new Error("La captura está bloqueada.");
      var refs = EvidenceLinkService_.list(captureId);
      if (refs.indexOf(evidenceId) === -1) refs.push(evidenceId);
      repo_.capturas.update(captureId, { evidenceRefs: JSON.stringify(refs), updatedAt: now_(), updatedBy: ctx && ctx.userId || "" });
      AuditService_.record({ entityType: "captura", entityId: captureId, action: "adjuntar_evidencia", userId: ctx && ctx.userId, after: evidenceId });
      return refs;
    },
    unlink: function (captureId, evidenceId, ctx) {
      var refs = EvidenceLinkService_.list(captureId);
      var filtered = refs.filter(function (r) { return r !== evidenceId; });
      repo_.capturas.update(captureId, { evidenceRefs: JSON.stringify(filtered), updatedAt: now_(), updatedBy: ctx && ctx.userId || "" });
      AuditService_.record({ entityType: "captura", entityId: captureId, action: "desadjuntar_evidencia", userId: ctx && ctx.userId, after: evidenceId });
      return filtered;
    },
  };

  // ── Cross-module integrations ────────────────────────────────────────────────

  function tryNotify_(tipo, destinatarioId, datos) {
    try {
      if (typeof NCEController !== "undefined") {
        NCEController.handle("nce.send", { tipo: tipo, destinatarioId: destinatarioId, datos: JSON.stringify(datos || {}) });
      }
    } catch (e) {}
  }

  function tryTriggerAUE_(evento, datos) {
    try {
      if (typeof AUEController !== "undefined") {
        AUEController.handle("aue.trigger", { evento: evento, datos: JSON.stringify(datos || {}) });
      }
    } catch (e) {}
  }

  function tryIngestIIA_(data) {
    try {
      if (typeof IIAController !== "undefined") {
        IIAController.handle("iia.ingestCaptura", data);
      }
    } catch (e) {}
  }

  // ── Public handle dispatcher ─────────────────────────────────────────────────

  function handle(action, params, ctx) {
    switch (action) {
      // Periods
      case "ice.listPeriods":         return PeriodService_.list(params);
      case "ice.getPeriod":           return PeriodService_.get(params.id);
      case "ice.createPeriod":        return PeriodService_.create(params, ctx);
      case "ice.updatePeriod":        return PeriodService_.update(params, ctx);
      case "ice.openPeriod":          return PeriodService_.transition(params.id, "abierto",      ctx);
      case "ice.reviewPeriod":        return PeriodService_.transition(params.id, "en_revision",  ctx);
      case "ice.closePeriod":         return PeriodService_.transition(params.id, "cerrado",      ctx);
      case "ice.lockPeriod":          return PeriodService_.transition(params.id, "bloqueado",    ctx);

      // Captures
      case "ice.listCapturas":        return CaptureService_.list(params);
      case "ice.getCaptura":          return CaptureService_.get(params.id);
      case "ice.createCaptura":       return CaptureService_.create(params, ctx);
      case "ice.updateCaptura":       return CaptureService_.update(params, ctx);
      case "ice.deleteCaptura":       return CaptureService_.delete(params.id, ctx);
      case "ice.calculateCaptura":    return CaptureService_.calculate(params, ctx);
      case "ice.submitCaptura":       return CaptureService_.submit(params.id, ctx);

      // Variables
      case "ice.listCaptureVars":     return VariableCaptureService_.list(params.captureId);
      case "ice.saveCaptureVars":     return VariableCaptureService_.save(params.captureId, params.variables, ctx);

      // Approvals
      case "ice.listApprovals":       return ApprovalService_.list(params.captureId);
      case "ice.approve":             return ApprovalService_.approve(params, ctx);
      case "ice.reject":              return ApprovalService_.reject(params, ctx);
      case "ice.reopen":              return ApprovalService_.reopen(params, ctx);

      // Evidence
      case "ice.listEvidenceRefs":    return EvidenceLinkService_.list(params.captureId);
      case "ice.linkEvidence":        return EvidenceLinkService_.link(params.captureId, params.evidenceId, ctx);
      case "ice.unlinkEvidence":      return EvidenceLinkService_.unlink(params.captureId, params.evidenceId, ctx);

      // Audit
      case "ice.listAudit":           return repo_.audit.findAll().filter(function (a) {
        if (params && params.entityId) return a.entityId === params.entityId;
        return true;
      });

      // Composite
      case "ice.getMyIndicators":     return CaptureService_.getMyIndicators(params, ctx);
      case "ice.getCaptureContext":   return CaptureService_.getContext(params.indicatorId, params.periodId);

      default:
        var err = new Error("ICEController: acción desconocida: " + action);
        err.code = "UNKNOWN_ACTION";
        throw err;
    }
  }

  // ── Bootstrap ────────────────────────────────────────────────────────────────

  function bootstrap() {
    SheetRepository.ensureSheet(SHEET.PERIODS,   ["id","nombre","tipo","fechaInicio","fechaFin","estado","activo","createdAt","updatedAt","createdBy"]);
    SheetRepository.ensureSheet(SHEET.CAPTURAS,  ["id","indicatorId","periodId","responsibleId","captureDate","formulaVersion","resultadoCalculado","meta","cumplimiento","rangeLevel","status","comments","evidenceRefs","createdBy","updatedBy","createdAt","updatedAt"]);
    SheetRepository.ensureSheet(SHEET.CAP_VARS,  ["id","captureId","variableId","valor","unidad","createdAt"]);
    SheetRepository.ensureSheet(SHEET.APPROVALS, ["id","captureId","nivel","responsable","fecha","estado","comentarios"]);
    SheetRepository.ensureSheet(SHEET.LOCKS,     ["id","periodId","captureId","lockedAt","lockedBy","reason"]);
    SheetRepository.ensureSheet(SHEET.AUDIT,     ["id","entityType","entityId","action","userId","timestamp","before","after","notes"]);
  }

  return { handle: handle, bootstrap: bootstrap };
})();
