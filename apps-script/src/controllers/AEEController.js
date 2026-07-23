/**
 * AEE — Activity Execution Engine Controller.
 *
 * Records the real execution of institutional activities planned by APE.
 * Scope: execution recording ONLY.
 * No evidence uploads, no compliance calculation, no indicator modification.
 *
 * STATE MACHINE:
 *   Pendiente            → En ejecución | Reprogramada | Cancelada | No ejecutada
 *   En ejecución         → Finalizada | Finalizada con observaciones | Reprogramada | Cancelada
 *   Finalizada           → (terminal)
 *   Finalizada con obs.  → (terminal)
 *   Reprogramada         → Pendiente | Cancelada
 *   Cancelada            → (terminal)
 *   No ejecutada         → Pendiente
 *
 * CATALOG TYPES:
 *   resultadoEjecucion — Ejecutada exitosamente | Ejecutada parcialmente |
 *                        Requiere seguimiento | Suspendida | Cancelada | No ejecutada
 *   nivelRiesgo        — Sin riesgo | Riesgo bajo | Riesgo medio | Riesgo alto | Riesgo crítico
 */
var AEEController = (function () {

  var AEE_WS_ID = "aee";

  // ── Private helpers ──────────────────────────────────────────────────────────

  function _wsId(params) {
    return params.wsId || AEE_WS_ID;
  }

  function _now() {
    return new Date().toISOString();
  }

  var ALLOWED_STATES = [
    "Pendiente",
    "En ejecución",
    "Finalizada",
    "Finalizada con observaciones",
    "Reprogramada",
    "Cancelada",
    "No ejecutada",
  ];

  var VALID_TRANSITIONS = {
    "Pendiente":                   ["En ejecución", "Reprogramada", "Cancelada", "No ejecutada"],
    "En ejecución":                ["Finalizada", "Finalizada con observaciones", "Reprogramada", "Cancelada"],
    "Finalizada":                  [],
    "Finalizada con observaciones":[],
    "Reprogramada":                ["Pendiente", "Cancelada"],
    "Cancelada":                   [],
    "No ejecutada":                ["Pendiente"],
  };

  // Default catalog values (returned when catalog sheet is empty)
  var DEFAULT_CATALOGOS = {
    resultadoEjecucion: [
      { valor: "ejecutada-exitosamente",  etiqueta: "Ejecutada exitosamente",  orden: 1 },
      { valor: "ejecutada-parcialmente",  etiqueta: "Ejecutada parcialmente",  orden: 2 },
      { valor: "requiere-seguimiento",    etiqueta: "Requiere seguimiento",    orden: 3 },
      { valor: "suspendida",              etiqueta: "Suspendida",              orden: 4 },
      { valor: "cancelada",               etiqueta: "Cancelada",               orden: 5 },
      { valor: "no-ejecutada",            etiqueta: "No ejecutada",            orden: 6 },
    ],
    nivelRiesgo: [
      { valor: "sin-riesgo",    etiqueta: "Sin riesgo",    orden: 1 },
      { valor: "riesgo-bajo",   etiqueta: "Riesgo bajo",   orden: 2 },
      { valor: "riesgo-medio",  etiqueta: "Riesgo medio",  orden: 3 },
      { valor: "riesgo-alto",   etiqueta: "Riesgo alto",   orden: 4 },
      { valor: "riesgo-critico",etiqueta: "Riesgo crítico",orden: 5 },
    ],
  };

  function _record(ejecucionId, accion, estadoAnterior, estadoNuevo, usuario, detalle, wsId) {
    try {
      createEntity_("aeeHistorial", {
        id:            IdGen.uuid(),
        wsId:          wsId || AEE_WS_ID,
        ejecucionId:   ejecucionId,
        accion:        accion,
        estadoAnterior: estadoAnterior || "",
        estadoNuevo:   estadoNuevo || "",
        usuario:       usuario || "",
        detalle:       JSON.stringify(detalle || {}),
        createdAt:     _now(),
      });
    } catch (e) {
      AppLogger.warn("AEEController._record failed", { error: String(e) });
    }
  }

  function _assertPlanNotArchived(planId) {
    if (!planId) return;
    try {
      var plan = getEntity_("apePlanes", planId);
      if (plan && (plan.status === "Archivada" || plan.status === "Cancelada")) {
        throw new Error(
          "No se puede registrar ejecución sobre un plan con estado '" + plan.status + "'."
        );
      }
    } catch (e) {
      if (e.message && e.message.indexOf("No se puede") === 0) throw e;
      // Plan not found or sheet error — allow creation (plan may be in different ws)
    }
  }

  // ── Ejecuciones: List / Get ──────────────────────────────────────────────────

  function listEjecuciones(params) {
    var filter = { wsId: _wsId(params) };
    if (params.planId)               filter.planId               = params.planId;
    if (params.activityId)           filter.activityId           = params.activityId;
    if (params.processId)            filter.processId            = params.processId;
    if (params.organizationalUnitId) filter.organizationalUnitId = params.organizationalUnitId;
    if (params.executedBy)           filter.executedBy           = params.executedBy;
    if (params.status)               filter.status               = params.status;
    if (params.executionDate)        filter.executionDate        = params.executionDate;
    if (params.riskDetected)         filter.riskDetected         = params.riskDetected;
    if (params._page)                filter._page                = params._page;
    if (params._pageSize)            filter._pageSize            = params._pageSize;
    filter._sortBy  = params._sortBy  || "executionDate";
    filter._sortDir = params._sortDir || "desc";
    return listEntities_("aeeEjecuciones", filter);
  }

  function getEjecucion(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("aeeEjecuciones", params.id);
  }

  // ── Ejecuciones: Create ──────────────────────────────────────────────────────

  function createEjecucion(params) {
    Validator.requireFields(params, ["planId", "executedBy", "executionDate"]);
    if (!params.executedBy || params.executedBy.trim() === "") {
      throw new Error("El campo 'executedBy' (responsable) es requerido.");
    }
    if (params.durationMinutes !== undefined && Number(params.durationMinutes) < 0) {
      throw new Error("La duración no puede ser negativa.");
    }
    if (params.startTime && params.endTime && params.startTime > params.endTime) {
      throw new Error("La hora de inicio no puede ser posterior a la hora de fin.");
    }

    _assertPlanNotArchived(params.planId);

    var wsId = _wsId(params);
    var now  = _now();

    // Auto-calculate duration if times provided but duration missing
    var durationMinutes = params.durationMinutes;
    if (!durationMinutes && params.startTime && params.endTime) {
      var parts1 = params.startTime.split(":").map(Number);
      var parts2 = params.endTime.split(":").map(Number);
      durationMinutes = (parts2[0] * 60 + parts2[1]) - (parts1[0] * 60 + parts1[1]);
      if (durationMinutes < 0) durationMinutes = 0;
    }

    // Auto-assign executionNumber within the plan
    var existingForPlan = listEntities_("aeeEjecuciones", {
      wsId: wsId, planId: params.planId, _pageSize: 9999,
    });
    var existingItems = existingForPlan.items || [];
    var executionNumber = existingItems.length + 1;

    var data = Object.assign({}, params, {
      id:              IdGen.uuid(),
      wsId:            wsId,
      executionNumber: String(executionNumber),
      durationMinutes: String(durationMinutes || ""),
      status:          params.status || "Pendiente",
      executionResult: params.executionResult || "",
      completionNotes: params.completionNotes || "",
      observations:    params.observations    || "",
      requiresEvidence: params.requiresEvidence ? "true" : "false",
      hasEvidence:      "false",
      riskDetected:     params.riskDetected   || "sin-riesgo",
      incidentReported: params.incidentReported ? "true" : "false",
      requiresApproval: params.requiresApproval ? "true" : "false",
      approvedBy:       "",
      approvalDate:     "",
      createdBy:        params.userId || "",
      createdAt:        now,
      updatedBy:        params.userId || "",
      updatedAt:        now,
      deletedAt:        "",
    });
    delete data.userId;

    var entity = createEntity_("aeeEjecuciones", data);
    _record(entity.id, "creado", "", entity.status, data.createdBy,
      { planId: entity.planId, executionNumber: executionNumber }, wsId);
    return entity;
  }

  // ── Ejecuciones: Update ──────────────────────────────────────────────────────

  function updateEjecucion(params) {
    Validator.requireFields(params, ["id"]);
    var existing = getEntity_("aeeEjecuciones", params.id);
    if (existing && existing.deletedAt) {
      throw new Error("No se puede modificar una ejecución archivada.");
    }

    var wsId = _wsId(params);
    var now  = _now();

    var patch = Object.assign({}, params, {
      updatedBy: params.userId || "",
      updatedAt: now,
    });
    delete patch.userId;

    var entity = updateEntity_("aeeEjecuciones", params.id, patch);
    _record(entity.id, "actualizado", "", "", patch.updatedBy, {}, wsId);
    return entity;
  }

  // ── Ejecuciones: State Machine ───────────────────────────────────────────────

  function cambiarEstado(params) {
    Validator.requireFields(params, ["id", "status"]);

    if (ALLOWED_STATES.indexOf(params.status) === -1) {
      throw new Error(
        "Estado inválido: '" + params.status + "'. " +
        "Permitidos: " + ALLOWED_STATES.join(", ")
      );
    }

    var existing = getEntity_("aeeEjecuciones", params.id);
    if (!existing) throw new Error("Ejecución no encontrada: " + params.id);
    if (existing.deletedAt) throw new Error("No se puede cambiar el estado de una ejecución archivada.");

    var allowed = VALID_TRANSITIONS[existing.status] || [];
    if (allowed.indexOf(params.status) === -1) {
      throw new Error(
        "Transición inválida: '" + existing.status + "' → '" + params.status + "'. " +
        "Transiciones permitidas: " + (allowed.length > 0 ? allowed.join(", ") : "ninguna (estado terminal)")
      );
    }

    var wsId = _wsId(params);
    var now  = _now();
    var prev = existing.status;

    var entity = updateEntity_("aeeEjecuciones", params.id, {
      status:    params.status,
      updatedBy: params.userId || "",
      updatedAt: now,
    });

    _record(entity.id, "estado_cambiado", prev, params.status,
      params.userId || "", { from: prev, to: params.status }, wsId);
    return entity;
  }

  // ── Ejecuciones: Archive ─────────────────────────────────────────────────────

  function archivarEjecucion(params) {
    Validator.requireFields(params, ["id"]);
    var wsId = _wsId(params);
    var now  = _now();
    var existing = getEntity_("aeeEjecuciones", params.id);
    var prev = existing ? existing.status : "";

    var entity = updateEntity_("aeeEjecuciones", params.id, {
      status:    "Cancelada",
      deletedAt: now,
      updatedBy: params.userId || "",
      updatedAt: now,
    });
    _record(entity.id, "archivado", prev, "Cancelada",
      params.userId || "", {}, wsId);
    return entity;
  }

  // ── Mis actividades (APE plans assigned to current user) ─────────────────────

  function getMisActividades(params) {
    Validator.requireFields(params, ["executedBy"]);
    var filter = {
      wsId:            "ape",
      responsibleUser: params.executedBy,
      _pageSize:       params._pageSize || 200,
      _sortBy:         params._sortBy   || "plannedStartDate",
      _sortDir:        params._sortDir  || "asc",
    };
    if (params.year)   filter.year   = params.year;
    if (params.status) filter.status = params.status;
    var result = listEntities_("apePlanes", filter);
    var items  = (result.items || []).filter(function (p) {
      return p.status !== "Archivada" && p.status !== "Cancelada";
    });
    return { total: items.length, items: items };
  }

  // ── Catálogos ─────────────────────────────────────────────────────────────────

  function listCatalogos(params) {
    var wsId = _wsId(params);
    var filter = { wsId: wsId };
    if (params.tipo)   filter.tipo   = params.tipo;
    if (params.activo !== undefined) filter.activo = params.activo;
    filter._sortBy  = "orden";
    filter._sortDir = "asc";
    filter._pageSize = 999;

    var result = listEntities_("aeeCatalogos", filter);
    var stored = result.items || [];

    // Return defaults when catalog sheet is empty for this type
    if (stored.length === 0 && params.tipo && DEFAULT_CATALOGOS[params.tipo]) {
      return {
        total: DEFAULT_CATALOGOS[params.tipo].length,
        items: DEFAULT_CATALOGOS[params.tipo].map(function (d) {
          return Object.assign({ id: d.valor, wsId: wsId, tipo: params.tipo, activo: "true" }, d);
        }),
        isDefault: true,
      };
    }

    return { total: stored.length, items: stored };
  }

  function createCatalogo(params) {
    Validator.requireFields(params, ["tipo", "valor", "etiqueta"]);
    var now = _now();
    return createEntity_("aeeCatalogos", Object.assign({}, params, {
      id:        IdGen.uuid(),
      wsId:      _wsId(params),
      activo:    params.activo !== undefined ? params.activo : "true",
      orden:     params.orden  || "99",
      createdAt: now,
      updatedAt: now,
    }));
  }

  function updateCatalogo(params) {
    Validator.requireFields(params, ["id"]);
    return updateEntity_("aeeCatalogos", params.id,
      Object.assign({}, params, { updatedAt: _now() }));
  }

  // ── Historial ─────────────────────────────────────────────────────────────────

  function getHistorial(params) {
    var filter = { wsId: _wsId(params) };
    if (params.ejecucionId) filter.ejecucionId = params.ejecucionId;
    if (params.planId)      filter.planId      = params.planId;
    if (params.executedBy)  filter.usuario     = params.executedBy;
    filter._sortBy  = "createdAt";
    filter._sortDir = "desc";
    filter._pageSize = params._pageSize || 500;
    return listEntities_("aeeHistorial", filter);
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────────

  function getDashboard(params) {
    var wsId    = _wsId(params);
    var todayStr = (new Date()).toISOString().slice(0, 10);

    var result  = listEntities_("aeeEjecuciones", { wsId: wsId, _pageSize: 9999 });
    var items   = result.items || [];

    var byStatus = {}, byUser = {}, byProcess = {};
    var todayList = [], pendingList = [], inProgressList = [];
    var incidentList = [], reprogramadaList = [];
    var totalDuration = 0, durCount = 0;

    items.forEach(function (e) {
      // By status
      byStatus[e.status]  = (byStatus[e.status]  || 0) + 1;
      // By user
      if (e.executedBy)  byUser[e.executedBy]    = (byUser[e.executedBy]    || 0) + 1;
      // By process
      if (e.processId)   byProcess[e.processId]  = (byProcess[e.processId]  || 0) + 1;

      // Duration average
      if (e.durationMinutes && Number(e.durationMinutes) > 0) {
        totalDuration += Number(e.durationMinutes);
        durCount++;
      }

      // Categorized lists
      if (e.executionDate === todayStr)                  todayList.push(e);
      if (e.status === "Pendiente")                       pendingList.push(e);
      if (e.status === "En ejecución")                    inProgressList.push(e);
      if (e.incidentReported === "true" || e.incidentReported === true) incidentList.push(e);
      if (e.status === "Reprogramada")                    reprogramadaList.push(e);
    });

    return {
      total:               items.length,
      today:               todayList.length,
      pending:             pendingList.length,
      inProgress:          inProgressList.length,
      withIncidents:       incidentList.length,
      rescheduled:         reprogramadaList.length,
      avgDurationMinutes:  durCount > 0 ? Math.round(totalDuration / durCount) : 0,
      byStatus:            byStatus,
      byUser:              byUser,
      byProcess:           byProcess,
      todayExecutions:     todayList.slice(0, 10),
      pendingExecutions:   pendingList.slice(0, 10),
      inProgressExecutions:inProgressList.slice(0, 10),
    };
  }

  // ── Public API ────────────────────────────────────────────────────────────────

  return {
    listEjecuciones:   listEjecuciones,
    getEjecucion:      getEjecucion,
    createEjecucion:   createEjecucion,
    updateEjecucion:   updateEjecucion,
    cambiarEstado:     cambiarEstado,
    archivarEjecucion: archivarEjecucion,
    getMisActividades: getMisActividades,
    listCatalogos:     listCatalogos,
    createCatalogo:    createCatalogo,
    updateCatalogo:    updateCatalogo,
    getHistorial:      getHistorial,
    getDashboard:      getDashboard,
  };
})();
