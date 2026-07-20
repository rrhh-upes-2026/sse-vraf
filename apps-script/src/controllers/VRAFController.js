/**
 * VRAFController — Vicerrectoría Administrativa y Financiera operations.
 *
 * Scopes all queries to wsId = "vraf" and orchestrates VRAF-specific
 * business logic. Persistence delegates to the generic SheetRepository
 * via existing entities (planes, objetivos, proyectos, procesos,
 * actividades, indicadores, solicitudes).
 *
 * No new sheets are required — VRAF re-uses the institutional entity
 * schemas from entities.js, filtered by wsId / unidadId.
 */
var VRAFController = (function () {

  var VRAF_WS_ID = "vraf";

  // ── Plans / POA ──────────────────────────────────────────────────────────────

  function listPlanes(params) {
    var filter = { wsId: params.wsId || VRAF_WS_ID };
    if (params.tipo)   filter.tipo   = params.tipo;
    if (params.estado) filter.estado = params.estado;
    var result = listEntities_("planes", filter);
    return result.items || [];
  }

  function getPlan(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("planes", params.id);
  }

  function createPlan(params) {
    Validator.requireFields(params, ["nombre"]);
    AppLogger.info("VRAFController.createPlan", { nombre: params.nombre });
    var now = new Date().toISOString();
    var data = Object.assign({
      tipo:          "estrategico",
      estado:        "borrador",
      periodoInicio: "",
      periodoFin:    "",
      descripcion:   "",
      responsableId: "",
      avancePct:     0,
    }, params, {
      id:        IdGen.uuid(),
      wsId:      params.wsId || VRAF_WS_ID,
      createdAt: now,
      updatedAt: now,
    });
    createEntity_("planes", data);
    return data;
  }

  function updatePlan(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: new Date().toISOString() });
    delete patch.id;
    return updateEntity_("planes", params.id, patch);
  }

  function deletePlan(params) {
    Validator.requireFields(params, ["id"]);
    removeEntity_("planes", params.id);
    return { deleted: true };
  }

  // ── Objetivos Estratégicos ───────────────────────────────────────────────────

  function listObjetivos(params) {
    var filter = {};
    if (params.planId) filter.planId = params.planId;
    if (params.wsId)   filter.wsId   = params.wsId;
    var result = listEntities_("objetivos", filter);
    return result.items || [];
  }

  function getObjetivo(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("objetivos", params.id);
  }

  function createObjetivo(params) {
    Validator.requireFields(params, ["nombre", "planId"]);
    var now = new Date().toISOString();
    var data = Object.assign({
      descripcion: "",
      perspectiva: "procesos",
      peso:        100,
      avancePct:   0,
      estado:      "activo",
    }, params, {
      id:        IdGen.uuid(),
      createdAt: now,
      updatedAt: now,
    });
    createEntity_("objetivos", data);
    AppLogger.info("VRAFController.createObjetivo", { nombre: data.nombre });
    return data;
  }

  function updateObjetivo(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: new Date().toISOString() });
    delete patch.id;
    return updateEntity_("objetivos", params.id, patch);
  }

  // ── Proyectos ────────────────────────────────────────────────────────────────

  function listProyectos(params) {
    var filter = { unidadId: params.wsId || VRAF_WS_ID };
    if (params.objetivoId) filter.objetivoId = params.objetivoId;
    if (params.estado)     filter.estado     = params.estado;
    var result = listEntities_("proyectos", filter);
    return result.items || [];
  }

  function getProyecto(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("proyectos", params.id);
  }

  function createProyecto(params) {
    Validator.requireFields(params, ["nombre"]);
    var now = new Date().toISOString();
    var data = Object.assign({
      descripcion: "",
      estado:      "planificado",
      avancePct:   0,
      prioridad:   "normal",
      unidadId:    params.wsId || VRAF_WS_ID,
    }, params, {
      id:        IdGen.uuid(),
      createdAt: now,
      updatedAt: now,
    });
    createEntity_("proyectos", data);
    return data;
  }

  function updateProyecto(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: new Date().toISOString() });
    delete patch.id;
    return updateEntity_("proyectos", params.id, patch);
  }

  // ── Procesos / Actividades ───────────────────────────────────────────────────

  function listProcesos(params) {
    var filter = { wsId: params.wsId || VRAF_WS_ID };
    if (params.prioridad) filter.prioridad = params.prioridad;
    if (params.semaforo)  filter.semaforo  = params.semaforo;
    var result = listEntities_("procesos", filter);
    return result.items || [];
  }

  function listActividades(params) {
    var filter = {};
    if (params.proyectoId) filter.proyectoId = params.proyectoId;
    if (params.etapaId)    filter.etapaId    = params.etapaId;
    var result = listEntities_("actividades", filter);
    return result.items || [];
  }

  // ── Indicadores / KPIs ───────────────────────────────────────────────────────

  function listIndicadores(params) {
    var filter = { wsId: params.wsId || VRAF_WS_ID };
    if (params.semaforo)        filter.semaforo        = params.semaforo;
    if (params.dashboardDestino) filter.dashboardDestino = params.dashboardDestino;
    var result = listEntities_("indicadores", filter);
    return result.items || [];
  }

  function getIndicador(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("indicadores", params.id);
  }

  function createIndicador(params) {
    Validator.requireFields(params, ["nombre"]);
    var now = new Date().toISOString();
    var data = Object.assign({
      descripcion:     "",
      formula:         "",
      unidadMedida:    "",
      frecuencia:      "mensual",
      metaAnual:       0,
      valorActual:     0,
      semaforo:        "verde",
      tendencia:       "estable",
      perspectiva:     "procesos",
      dashboardDestino: "vraf",
    }, params, {
      id:        IdGen.uuid(),
      wsId:      params.wsId || VRAF_WS_ID,
      createdAt: now,
      updatedAt: now,
    });
    createEntity_("indicadores", data);
    return data;
  }

  function updateIndicador(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: new Date().toISOString() });
    delete patch.id;
    return updateEntity_("indicadores", params.id, patch);
  }

  // ── Solicitudes ──────────────────────────────────────────────────────────────

  function listSolicitudes(params) {
    var filter = { wsId: params.wsId || VRAF_WS_ID };
    if (params.estado) filter.estado = params.estado;
    var result = listEntities_("solicitudes", filter);
    return result.items || [];
  }

  function createSolicitud(params) {
    Validator.requireFields(params, ["titulo", "tipo"]);
    var now = new Date().toISOString();
    var data = Object.assign({
      descripcion:           "",
      estado:                "pendiente",
      prioridad:             "normal",
      tiempoRespuestaHoras:  72,
      solicitanteId:         "",
    }, params, {
      id:        IdGen.uuid(),
      wsId:      params.wsId || VRAF_WS_ID,
      fechaSolicitud: now,
      createdAt: now,
      updatedAt: now,
    });
    createEntity_("solicitudes", data);
    return data;
  }

  function updateSolicitud(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: new Date().toISOString() });
    delete patch.id;
    return updateEntity_("solicitudes", params.id, patch);
  }

  // ── Dashboard resumen ────────────────────────────────────────────────────────

  function getDashboardResumen(params) {
    var wsId = params.wsId || VRAF_WS_ID;

    var planesResult      = listEntities_("planes",      { wsId: wsId });
    var indicadoresResult = listEntities_("indicadores", { wsId: wsId });
    var proyectosResult   = listEntities_("proyectos",   { unidadId: wsId });
    var solicitudesResult = listEntities_("solicitudes", { wsId: wsId });
    var procesosResult    = listEntities_("procesos",    { wsId: wsId });

    var inds = indicadoresResult.items || [];
    var semaforo = { verde: 0, amarillo: 0, rojo: 0 };
    for (var i = 0; i < inds.length; i++) {
      var s = inds[i].semaforo;
      if (semaforo[s] !== undefined) semaforo[s]++;
    }

    var procs = procesosResult.items || [];
    var procsActivos = 0;
    for (var j = 0; j < procs.length; j++) {
      if (procs[j].semaforo !== "completado") procsActivos++;
    }

    return {
      planes:          (planesResult.items || []).length,
      indicadores:     inds.length,
      semaforoKPIs:    semaforo,
      proyectos:       (proyectosResult.items || []).length,
      solicitudes:     (solicitudesResult.items || []).length,
      procesosActivos: procsActivos,
    };
  }

  // ── Public API ────────────────────────────────────────────────────────────────

  return {
    listPlanes:          listPlanes,
    getPlan:             getPlan,
    createPlan:          createPlan,
    updatePlan:          updatePlan,
    deletePlan:          deletePlan,
    listObjetivos:       listObjetivos,
    getObjetivo:         getObjetivo,
    createObjetivo:      createObjetivo,
    updateObjetivo:      updateObjetivo,
    listProyectos:       listProyectos,
    getProyecto:         getProyecto,
    createProyecto:      createProyecto,
    updateProyecto:      updateProyecto,
    listProcesos:        listProcesos,
    listActividades:     listActividades,
    listIndicadores:     listIndicadores,
    getIndicador:        getIndicador,
    createIndicador:     createIndicador,
    updateIndicador:     updateIndicador,
    listSolicitudes:     listSolicitudes,
    createSolicitud:     createSolicitud,
    updateSolicitud:     updateSolicitud,
    getDashboardResumen: getDashboardResumen,
  };

})();

/**
 * Route vraf.* actions via OrgUnitRegistry.
 * Called by OrgUnitRegistry when namespace === "vraf".
 */
function routeVRAFAction_(verb, params, context) {
  switch (verb) {
    case "listPlanes":          return VRAFController.listPlanes(params);
    case "getPlan":             return VRAFController.getPlan(params);
    case "createPlan":          return VRAFController.createPlan(params);
    case "updatePlan":          return VRAFController.updatePlan(params);
    case "deletePlan":          return VRAFController.deletePlan(params);
    case "listObjetivos":       return VRAFController.listObjetivos(params);
    case "getObjetivo":         return VRAFController.getObjetivo(params);
    case "createObjetivo":      return VRAFController.createObjetivo(params);
    case "updateObjetivo":      return VRAFController.updateObjetivo(params);
    case "listProyectos":       return VRAFController.listProyectos(params);
    case "getProyecto":         return VRAFController.getProyecto(params);
    case "createProyecto":      return VRAFController.createProyecto(params);
    case "updateProyecto":      return VRAFController.updateProyecto(params);
    case "listProcesos":        return VRAFController.listProcesos(params);
    case "listActividades":     return VRAFController.listActividades(params);
    case "listIndicadores":     return VRAFController.listIndicadores(params);
    case "getIndicador":        return VRAFController.getIndicador(params);
    case "createIndicador":     return VRAFController.createIndicador(params);
    case "updateIndicador":     return VRAFController.updateIndicador(params);
    case "listSolicitudes":     return VRAFController.listSolicitudes(params);
    case "createSolicitud":     return VRAFController.createSolicitud(params);
    case "updateSolicitud":     return VRAFController.updateSolicitud(params);
    case "getDashboardResumen": return VRAFController.getDashboardResumen(params);
    default:
      throw new Error("Unknown vraf verb: " + verb);
  }
}
