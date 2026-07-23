/**
 * CPEController — Compliance & Performance Engine.
 * Analytical-only engine. Reads from IME/PME/APE/AEE/EME without modifying them.
 * Writes only to CPE-owned sheets: cpeSnapshots, cpePlanesMejora, cpeHistorial, cpeCatalogos.
 */
var CPEController = (function () {
  var CPE_WS = "cpe";

  // ── Default Catalogos ────────────────────────────────────────────────────────

  var DEFAULT_CATALOGOS = {
    pesoCumplimiento: [
      { valor: "planificacion", etiqueta: "Planificación",  peso: 40, orden: 1 },
      { valor: "ejecucion",     etiqueta: "Ejecución",      peso: 30, orden: 2 },
      { valor: "documentacion", etiqueta: "Documentación",  peso: 20, orden: 3 },
      { valor: "indicadores",   etiqueta: "Indicadores",    peso: 10, orden: 4 },
    ],
    semaforo: [
      { valor: "verde",    etiqueta: "Verde",    scoreMin: 90,  scoreMax: 100, orden: 1 },
      { valor: "amarillo", etiqueta: "Amarillo", scoreMin: 75,  scoreMax: 89,  orden: 2 },
      { valor: "naranja",  etiqueta: "Naranja",  scoreMin: 60,  scoreMax: 74,  orden: 3 },
      { valor: "rojo",     etiqueta: "Rojo",     scoreMin: 0,   scoreMax: 59,  orden: 4 },
    ],
    rangoRiesgo: [
      { valor: "muy-bajo", etiqueta: "Muy Bajo",  scoreMin: 90, scoreMax: 100, orden: 1 },
      { valor: "bajo",     etiqueta: "Bajo",       scoreMin: 80, scoreMax: 89,  orden: 2 },
      { valor: "medio",    etiqueta: "Medio",      scoreMin: 65, scoreMax: 79,  orden: 3 },
      { valor: "alto",     etiqueta: "Alto",       scoreMin: 50, scoreMax: 64,  orden: 4 },
      { valor: "critico",  etiqueta: "Crítico",    scoreMin: 0,  scoreMax: 49,  orden: 5 },
    ],
    estadoPlanMejora: [
      { valor: "Pendiente",   etiqueta: "Pendiente",   orden: 1 },
      { valor: "En proceso",  etiqueta: "En proceso",  orden: 2 },
      { valor: "Completado",  etiqueta: "Completado",  orden: 3 },
      { valor: "Cancelado",   etiqueta: "Cancelado",   orden: 4 },
      { valor: "Pausado",     etiqueta: "Pausado",     orden: 5 },
    ],
    prioridadPlan: [
      { valor: "Crítica", etiqueta: "Crítica", orden: 1 },
      { valor: "Alta",    etiqueta: "Alta",    orden: 2 },
      { valor: "Media",   etiqueta: "Media",   orden: 3 },
      { valor: "Baja",    etiqueta: "Baja",    orden: 4 },
    ],
  };

  // ── Scoring helpers ───────────────────────────────────────────────────────────

  function _getPesos_() {
    var cats = listEntities_("cpeCatalogos", { wsId: CPE_WS, tipo: "pesoCumplimiento" });
    if (!cats || cats.length === 0) {
      return { planificacion: 40, ejecucion: 30, documentacion: 20, indicadores: 10 };
    }
    var pesos = {};
    cats.forEach(function (c) { pesos[c.valor] = Number(c.peso) || 0; });
    return pesos;
  }

  function _getComplianceStatus_(score) {
    if (score >= 90) return "Verde";
    if (score >= 75) return "Amarillo";
    if (score >= 60) return "Naranja";
    return "Rojo";
  }

  function _getRiskLevel_(score) {
    if (score >= 90) return "Muy Bajo";
    if (score >= 80) return "Bajo";
    if (score >= 65) return "Medio";
    if (score >= 50) return "Alto";
    return "Crítico";
  }

  function _calcScore_(planned, executed, validated, required) {
    var planningScore   = planned > 0 ? Math.min(100, (executed / planned) * 100) : 100;
    var executionScore  = executed > 0 ? Math.min(100, (executed / planned) * 100) : 0;
    var docScore        = required > 0 ? Math.min(100, (validated / required) * 100) : 100;
    return {
      planningScore:      Math.round(planningScore),
      executionScore:     Math.round(executionScore),
      documentationScore: Math.round(docScore),
      indicatorScore:     null,
    };
  }

  function _weightedOverall_(scores, pesos) {
    var totalPeso = pesos.planificacion + pesos.ejecucion + pesos.documentacion;
    var sum = (scores.planningScore * pesos.planificacion)
            + (scores.executionScore * pesos.ejecucion)
            + (scores.documentationScore * pesos.documentacion);
    return totalPeso > 0 ? Math.round(sum / totalPeso) : 0;
  }

  // ── Breach detection ──────────────────────────────────────────────────────────

  function _detectBrechas_(year) {
    var brechas = [];
    var now     = new Date().toISOString();

    // 1. APE plans with no executed AEE execution (overdue by plannedEndDate)
    var apePlanes = listEntities_("apePlanes", { wsId: "ape" });
    var apePlanesYear = (apePlanes || []).filter(function (p) {
      return p.plannedStartDate && String(p.plannedStartDate).indexOf(String(year)) !== -1;
    });
    apePlanesYear.forEach(function (plan) {
      var ejecuciones = listEntities_("aeeEjecuciones", { planId: plan.id });
      var hasFinished = (ejecuciones || []).some(function (e) { return e.status === "Finalizada"; });
      if (!hasFinished && plan.plannedEndDate && plan.plannedEndDate < now) {
        brechas.push({
          tipo: "actividad_no_ejecutada",
          descripcion: "Plan sin ejecución finalizada y vencido: " + (plan.title || plan.id),
          severidad: "alta",
          entidadId: plan.id,
          entidadTipo: "apePlan",
          fechaDeteccion: now,
        });
      }
    });

    // 2. AEE executions that require evidence but have no validated evidence
    var ejecucionesConEvidencia = listEntities_("aeeEjecuciones", { requiresEvidence: "true" });
    (ejecucionesConEvidencia || []).forEach(function (ej) {
      var evidencias = listEntities_("emeEvidencias", { executionId: ej.id, status: "Validada" });
      if (!evidencias || evidencias.length === 0) {
        brechas.push({
          tipo: "evidencia_faltante",
          descripcion: "Ejecución sin evidencia validada: " + (ej.activityName || ej.id),
          severidad: "media",
          entidadId: ej.id,
          entidadTipo: "aeeEjecucion",
          fechaDeteccion: now,
        });
      }
    });

    // 3. Rejected evidence (EME)
    var rechazadas = listEntities_("emeEvidencias", { status: "Rechazada" });
    (rechazadas || []).forEach(function (ev) {
      brechas.push({
        tipo: "evidencia_rechazada",
        descripcion: "Evidencia rechazada pendiente de acción: " + (ev.title || ev.id),
        severidad: "media",
        entidadId: ev.id,
        entidadTipo: "emeEvidencia",
        fechaDeteccion: now,
      });
    });

    // 4. IME indicators without targetValue (not configured)
    var indicadores = listEntities_("imeIndicadores", { active: "true" });
    (indicadores || []).forEach(function (ind) {
      if (!ind.targetValue || ind.targetValue === "") {
        brechas.push({
          tipo: "indicador_sin_datos",
          descripcion: "Indicador sin valor objetivo configurado: " + (ind.name || ind.id),
          severidad: "baja",
          entidadId: ind.id,
          entidadTipo: "imeIndicador",
          fechaDeteccion: now,
        });
      }
    });

    // 5. PME processes without any APE plan
    var procesos = listEntities_("pmeProcesos", {});
    (procesos || []).forEach(function (proc) {
      var planes = (apePlanes || []).filter(function (p) { return p.processId === proc.id; });
      if (planes.length === 0) {
        brechas.push({
          tipo: "proceso_sin_plan",
          descripcion: "Proceso sin plan de actividades: " + (proc.name || proc.id),
          severidad: "baja",
          entidadId: proc.id,
          entidadTipo: "pmeProceso",
          fechaDeteccion: now,
        });
      }
    });

    return brechas;
  }

  // ── Public handlers ───────────────────────────────────────────────────────────

  function calcularCumplimiento(params) {
    var wsId   = params.wsId || CPE_WS;
    var year   = Number(params.year)  || new Date().getFullYear();
    var month  = Number(params.month) || new Date().getMonth() + 1;
    var userId = params.userId || "";
    var startMs = new Date().getTime();

    var pesos = _getPesos_();

    // Gather cross-engine data
    var apePlanes    = listEntities_("apePlanes",    { wsId: "ape" });
    var aeeEjecucion = listEntities_("aeeEjecuciones", {});
    var emeEvidencias = listEntities_("emeEvidencias", {});

    var yearStr = String(year);
    var planesYear = (apePlanes || []).filter(function (p) {
      return p.plannedStartDate && p.plannedStartDate.indexOf(yearStr) !== -1;
    });
    var monStr = year + "-" + (month < 10 ? "0" + month : month);
    var ejecMonth = (aeeEjecucion || []).filter(function (e) {
      return e.executedAt && e.executedAt.indexOf(monStr) !== -1;
    });

    var planned  = planesYear.length;
    var executed = (aeeEjecucion || []).filter(function (e) { return e.status === "Finalizada"; }).length;
    var required = (emeEvidencias || []).filter(function (ev) { return ev.isRequired === "true" || ev.isRequired === true; }).length;
    var validated = (emeEvidencias || []).filter(function (ev) {
      return ev.status === "Validada" && (ev.isRequired === "true" || ev.isRequired === true);
    }).length;

    var scores = _calcScore_(planned, executed, validated, required);
    var overall = _weightedOverall_(scores, pesos);
    var status  = _getComplianceStatus_(overall);
    var risk    = _getRiskLevel_(overall);

    var now       = new Date().toISOString();
    var snapshotId = IdGen.generate("SNAP");
    var snap = {
      id:                   snapshotId,
      wsId:                 wsId,
      snapshotDate:         now,
      year:                 year,
      month:                month,
      plannedActivities:    planned,
      executedActivities:   executed,
      validatedEvidence:    validated,
      requiredEvidence:     required,
      planningScore:        scores.planningScore,
      executionScore:       scores.executionScore,
      documentationScore:   scores.documentationScore,
      indicatorScore:       "",
      overallScore:         overall,
      complianceStatus:     status,
      riskLevel:            risk,
      calculatedAt:         now,
      calculatedBy:         userId,
      createdAt:            now,
    };
    createEntity_("cpeSnapshots", snap);

    // Log to historial
    var duracion = new Date().getTime() - startMs;
    var total    = planned + required + (aeeEjecucion || []).length;
    createEntity_("cpeHistorial", {
      id:                  IdGen.generate("CHIST"),
      wsId:                wsId,
      tipoCalculo:         "cumplimiento-mensual",
      duracion:            duracion,
      registrosAnalizados: total,
      resultado:           status + " (" + overall + ")",
      usuario:             userId,
      createdAt:           now,
    });

    return snap;
  }

  function getSnapshot(params) {
    var id = params.id;
    var snap = getEntity_("cpeSnapshots", id);
    if (!snap) throw new Error("Snapshot no encontrado: " + id);
    return snap;
  }

  function listSnapshots(params) {
    var filter = {};
    if (params.wsId)  filter.wsId  = params.wsId;
    if (params.year)  filter.year  = String(params.year);
    if (params.month) filter.month = String(params.month);
    var items = listEntities_("cpeSnapshots", filter);
    return { total: items.length, items: items };
  }

  function getDashboard(params) {
    var wsId = params.wsId || CPE_WS;
    var year = Number(params.year) || new Date().getFullYear();

    var snaps = listEntities_("cpeSnapshots", { wsId: wsId });
    snaps.sort(function (a, b) { return a.snapshotDate > b.snapshotDate ? -1 : 1; });

    var actual    = snaps.length > 0 ? snaps[0] : null;
    var tendencia = snaps.slice(0, 12).reverse();

    var brechas = _detectBrechas_(year);

    var planes = listEntities_("cpePlanesMejora", { wsId: wsId });
    var activos  = (planes || []).filter(function (p) { return p.status === "Pendiente" || p.status === "En proceso"; }).length;
    var now      = new Date().toISOString();
    var vencidos = (planes || []).filter(function (p) {
      return (p.status === "Pendiente" || p.status === "En proceso") && p.targetDate && p.targetDate < now;
    }).length;

    return {
      snapshotActual: actual,
      tendencia:      tendencia,
      brechas:        brechas,
      planesActivos:  activos,
      planesVencidos: vencidos,
      ultimoCalculo:  actual ? actual.calculatedAt : null,
    };
  }

  function getBrechas(params) {
    var year = Number(params.year) || new Date().getFullYear();
    return _detectBrechas_(year);
  }

  // ── Planes de Mejora CRUD ────────────────────────────────────────────────────

  function listPlanesMejora(params) {
    var filter = { wsId: params.wsId || CPE_WS };
    if (params.status)   filter.status   = params.status;
    if (params.priority) filter.priority = params.priority;
    var items = listEntities_("cpePlanesMejora", filter);
    return { total: items.length, items: items };
  }

  function getPlanMejora(params) {
    var plan = getEntity_("cpePlanesMejora", params.id);
    if (!plan) throw new Error("Plan de mejora no encontrado: " + params.id);
    return plan;
  }

  function createPlanMejora(params) {
    var now = new Date().toISOString();
    var plan = {
      id:                  IdGen.generate("PLAN"),
      wsId:                params.wsId || CPE_WS,
      relatedComplianceId: params.relatedComplianceId || "",
      title:               params.title || "",
      description:         params.description || "",
      priority:            params.priority || "Media",
      responsible:         params.responsible || "",
      targetDate:          params.targetDate || "",
      status:              "Pendiente",
      progress:            0,
      notes:               params.notes || "",
      createdBy:           params.userId || "",
      createdAt:           now,
      updatedAt:           now,
      deletedAt:           "",
    };
    return createEntity_("cpePlanesMejora", plan);
  }

  function updatePlanMejora(params) {
    var id   = params.id;
    var plan = getEntity_("cpePlanesMejora", id);
    if (!plan) throw new Error("Plan de mejora no encontrado: " + id);
    var now  = new Date().toISOString();
    var patch = {
      updatedAt: now,
    };
    var allowed = ["title", "description", "priority", "responsible", "targetDate", "status", "progress", "notes"];
    allowed.forEach(function (f) { if (params[f] !== undefined) patch[f] = params[f]; });
    return updateEntity_("cpePlanesMejora", id, patch);
  }

  function deletePlanMejora(params) {
    var id   = params.id;
    var plan = getEntity_("cpePlanesMejora", id);
    if (!plan) throw new Error("Plan de mejora no encontrado: " + id);
    updateEntity_("cpePlanesMejora", id, { deletedAt: new Date().toISOString() });
    return { success: true };
  }

  // ── Catálogos ────────────────────────────────────────────────────────────────

  function listCatalogos(params) {
    var filter = { wsId: params.wsId || CPE_WS };
    if (params.tipo) filter.tipo = params.tipo;
    var items = listEntities_("cpeCatalogos", filter);
    if (!items || items.length === 0) {
      var tipo = params.tipo;
      var defaults = tipo && DEFAULT_CATALOGOS[tipo]
        ? DEFAULT_CATALOGOS[tipo]
        : Object.keys(DEFAULT_CATALOGOS).reduce(function (acc, k) {
            return acc.concat(DEFAULT_CATALOGOS[k]);
          }, []);
      return { total: defaults.length, items: defaults, isDefault: true };
    }
    return { total: items.length, items: items };
  }

  function updateCatalogo(params) {
    var id  = params.id;
    var cat = getEntity_("cpeCatalogos", id);
    if (!cat) throw new Error("Catálogo no encontrado: " + id);
    var patch = { updatedAt: new Date().toISOString() };
    ["peso", "umbralMin", "umbralMax", "scoreMin", "scoreMax", "activo"].forEach(function (f) {
      if (params[f] !== undefined) patch[f] = params[f];
    });
    return updateEntity_("cpeCatalogos", id, patch);
  }

  function getHistorial(params) {
    var filter = { wsId: params.wsId || CPE_WS };
    var items  = listEntities_("cpeHistorial", filter);
    items.sort(function (a, b) { return a.createdAt > b.createdAt ? -1 : 1; });
    return items;
  }

  // ── Return public interface ───────────────────────────────────────────────────
  return {
    calcularCumplimiento: calcularCumplimiento,
    getSnapshot:          getSnapshot,
    listSnapshots:        listSnapshots,
    getDashboard:         getDashboard,
    getBrechas:           getBrechas,
    listPlanesMejora:     listPlanesMejora,
    getPlanMejora:        getPlanMejora,
    createPlanMejora:     createPlanMejora,
    updatePlanMejora:     updatePlanMejora,
    deletePlanMejora:     deletePlanMejora,
    listCatalogos:        listCatalogos,
    updateCatalogo:       updateCatalogo,
    getHistorial:         getHistorial,
  };
})();
