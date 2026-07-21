/**
 * SSOController — Salud y Seguridad Ocupacional operations.
 *
 * Scopes all queries to wsId = "salud" and orchestrates SSO business logic.
 * Persistence delegates to the generic SheetRepository via the SSO entity schemas:
 *   ssoIncidentes, ssoAccidentes, ssoInspecciones, ssoPeligros, ssoRiesgos,
 *   ssoAcciones, ssoEPP, ssoCapacitaciones, ssoComite, ssoAuditorias, ssoCumplimiento.
 *
 * Integration points (foreign keys only — no data duplication):
 *   empleadoId      → empleados.id            (RRHH)
 *   activoId        → mantoActivos.id          (Mantenimiento — riesgos de infraestructura)
 *   proveedorId     → comprasProveedores.id    (Compras — EPP)
 *   ordenCompraRef  → comprasOrdenes.codigo    (Compras — EPP)
 *   compromisoId    → contaCompromisos.id      (Contabilidad — costos SSO)
 */
var SSOController = (function () {

  var SSO_WS_ID = "salud";

  // ── Helpers ────────────────────────────────────────────────────────────────

  function nowIso_() { return new Date().toISOString(); }

  function codigoPrefijo_(prefijo) {
    return prefijo + "-" + new Date().getFullYear() + "-" + IdGen.uuid().substring(0, 6).toUpperCase();
  }

  function calcularNivelRiesgo_(probabilidad, impacto) {
    var nivel = (Number(probabilidad) || 1) * (Number(impacto) || 1);
    if (nivel >= 15) return { nivelRiesgo: nivel, clasificacion: "critico" };
    if (nivel >= 9)  return { nivelRiesgo: nivel, clasificacion: "alto" };
    if (nivel >= 4)  return { nivelRiesgo: nivel, clasificacion: "medio" };
    return { nivelRiesgo: nivel, clasificacion: "bajo" };
  }

  // ── Incidentes ─────────────────────────────────────────────────────────────

  function listIncidentes(params) {
    var filter = { wsId: params.wsId || SSO_WS_ID };
    if (params.estado)     filter.estado     = params.estado;
    if (params.tipo)       filter.tipo       = params.tipo;
    if (params.gravedad)   filter.gravedad   = params.gravedad;
    if (params.area)       filter.area       = params.area;
    if (params.empleadoId) filter.empleadoId = params.empleadoId;
    var result = listEntities_("ssoIncidentes", filter);
    return result.items || [];
  }

  function getIncidente(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("ssoIncidentes", params.id);
  }

  function createIncidente(params) {
    Validator.requireFields(params, ["titulo", "tipo", "gravedad"]);
    AppLogger.info("SSOController.createIncidente", { titulo: params.titulo, gravedad: params.gravedad });
    var now = nowIso_();
    var data = Object.assign({
      codigo:             codigoPrefijo_("INC"),
      descripcion:        "",
      area:               "",
      proceso:            "",
      empleadoId:         "",
      empleadoRef:        "",
      horaIncidente:      "",
      ubicacion:          "",
      activoId:           "",
      estado:             "reportado",
      etapa:              "reporte",
      investigadorId:     "",
      fechaInvestigacion: "",
      causaRaiz:          "",
      accionesGeneradas:  "",
      diasPerdidos:       0,
      costoEstimado:      0,
      compromisoId:       "",
      dataJson:           "",
      createdBy:          "",
      deletedAt:          "",
    }, params, {
      id:             IdGen.uuid(),
      wsId:           params.wsId || SSO_WS_ID,
      fechaIncidente: params.fechaIncidente || now,
      createdAt:      now,
      updatedAt:      now,
    });
    createEntity_("ssoIncidentes", data);
    return data;
  }

  function updateIncidente(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("ssoIncidentes", params.id, patch);
  }

  function clasificarIncidente(params) {
    Validator.requireFields(params, ["id", "causaRaiz"]);
    AppLogger.info("SSOController.clasificarIncidente", { id: params.id });
    var now = nowIso_();
    return updateEntity_("ssoIncidentes", params.id, {
      estado:            "clasificado",
      etapa:             "plan_accion",
      causaRaiz:         params.causaRaiz,
      fechaInvestigacion: params.fechaInvestigacion || now,
      investigadorId:    params.investigadorId || "",
      updatedAt:         now,
    });
  }

  function cerrarIncidente(params) {
    Validator.requireFields(params, ["id"]);
    AppLogger.info("SSOController.cerrarIncidente", { id: params.id });
    var now = nowIso_();
    return updateEntity_("ssoIncidentes", params.id, {
      estado:     "cerrado",
      etapa:      "completado",
      diasPerdidos:      Number(params.diasPerdidos)   || 0,
      costoEstimado:     Number(params.costoEstimado)  || 0,
      accionesGeneradas: params.accionesGeneradas || "",
      updatedAt:  now,
    });
  }

  // ── Accidentes ─────────────────────────────────────────────────────────────

  function listAccidentes(params) {
    var filter = { wsId: params.wsId || SSO_WS_ID };
    if (params.estado)     filter.estado     = params.estado;
    if (params.gravedad)   filter.gravedad   = params.gravedad;
    if (params.area)       filter.area       = params.area;
    if (params.empleadoId) filter.empleadoId = params.empleadoId;
    if (params.incidenteId) filter.incidenteId = params.incidenteId;
    var result = listEntities_("ssoAccidentes", filter);
    return result.items || [];
  }

  function getAccidente(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("ssoAccidentes", params.id);
  }

  function createAccidente(params) {
    Validator.requireFields(params, ["tipo", "gravedad", "empleadoId"]);
    AppLogger.info("SSOController.createAccidente", { tipo: params.tipo, gravedad: params.gravedad });
    var now = nowIso_();
    var data = Object.assign({
      codigo:          codigoPrefijo_("ACC"),
      incidenteId:     "",
      empleadoRef:     "",
      proceso:         "",
      area:            "",
      horaAccidente:   "",
      descripcion:     "",
      causas:          "",
      lesionTipo:      "",
      parteCuerpo:     "",
      testigos:        "",
      diasIncapacidad: 0,
      costosAtencion:  0,
      compromisoId:    "",
      estado:          "registrado",
      dataJson:        "",
      createdBy:       "",
      deletedAt:       "",
    }, params, {
      id:             IdGen.uuid(),
      wsId:           params.wsId || SSO_WS_ID,
      fechaAccidente: params.fechaAccidente || now,
      createdAt:      now,
      updatedAt:      now,
    });
    createEntity_("ssoAccidentes", data);
    return data;
  }

  function updateAccidente(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("ssoAccidentes", params.id, patch);
  }

  function cerrarAccidente(params) {
    Validator.requireFields(params, ["id"]);
    AppLogger.info("SSOController.cerrarAccidente", { id: params.id });
    return updateEntity_("ssoAccidentes", params.id, {
      estado:          "cerrado",
      diasIncapacidad: Number(params.diasIncapacidad) || 0,
      costosAtencion:  Number(params.costosAtencion)  || 0,
      updatedAt:       nowIso_(),
    });
  }

  // ── Inspecciones SSO ───────────────────────────────────────────────────────

  function listInspeccionesSso(params) {
    var filter = { wsId: params.wsId || SSO_WS_ID };
    if (params.estado)      filter.estado      = params.estado;
    if (params.tipo)        filter.tipo        = params.tipo;
    if (params.area)        filter.area        = params.area;
    if (params.inspectorId) filter.inspectorId = params.inspectorId;
    var result = listEntities_("ssoInspecciones", filter);
    return result.items || [];
  }

  function getInspeccionSso(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("ssoInspecciones", params.id);
  }

  function createInspeccionSso(params) {
    Validator.requireFields(params, ["titulo", "tipo", "area"]);
    AppLogger.info("SSOController.createInspeccionSso", { titulo: params.titulo });
    var now = nowIso_();
    var data = Object.assign({
      codigo:            codigoPrefijo_("INS-SSO"),
      proceso:           "",
      inspectorId:       "",
      inspectorRef:      "",
      fechaEjecucion:    "",
      hallazgos:         "",
      observaciones:     "",
      numHallazgos:      0,
      numConformes:      0,
      numNoConformes:    0,
      estado:            "programada",
      accionesGeneradas: "",
      dataJson:          "",
      createdBy:         "",
      deletedAt:         "",
    }, params, {
      id:              IdGen.uuid(),
      wsId:            params.wsId || SSO_WS_ID,
      fechaProgramada: params.fechaProgramada || now,
      createdAt:       now,
      updatedAt:       now,
    });
    createEntity_("ssoInspecciones", data);
    return data;
  }

  function updateInspeccionSso(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("ssoInspecciones", params.id, patch);
  }

  function cerrarInspeccionSso(params) {
    Validator.requireFields(params, ["id"]);
    AppLogger.info("SSOController.cerrarInspeccionSso", { id: params.id });
    var now = nowIso_();
    return updateEntity_("ssoInspecciones", params.id, {
      estado:            "completada",
      fechaEjecucion:    now,
      hallazgos:         params.hallazgos         || "",
      observaciones:     params.observaciones      || "",
      numHallazgos:      Number(params.numHallazgos)    || 0,
      numConformes:      Number(params.numConformes)    || 0,
      numNoConformes:    Number(params.numNoConformes)   || 0,
      accionesGeneradas: params.accionesGeneradas  || "",
      updatedAt:         now,
    });
  }

  // ── Peligros ───────────────────────────────────────────────────────────────

  function listPeligros(params) {
    var filter = { wsId: params.wsId || SSO_WS_ID };
    if (params.estado)   filter.estado   = params.estado;
    if (params.tipo)     filter.tipo     = params.tipo;
    if (params.area)     filter.area     = params.area;
    if (params.activoId) filter.activoId = params.activoId;
    var result = listEntities_("ssoPeligros", filter);
    return result.items || [];
  }

  function getPeligro(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("ssoPeligros", params.id);
  }

  function createPeligro(params) {
    Validator.requireFields(params, ["tipo", "descripcion", "area"]);
    AppLogger.info("SSOController.createPeligro", { tipo: params.tipo, area: params.area });
    var now = nowIso_();
    var data = Object.assign({
      codigo:            codigoPrefijo_("PEL"),
      proceso:           "",
      actividad:         "",
      fuente:            "",
      personasExpuestas: 0,
      controlesExistentes: "",
      estado:            "identificado",
      activoId:          "",
      dataJson:          "",
      createdBy:         "",
      deletedAt:         "",
    }, params, {
      id:        IdGen.uuid(),
      wsId:      params.wsId || SSO_WS_ID,
      createdAt: now,
      updatedAt: now,
    });
    createEntity_("ssoPeligros", data);
    return data;
  }

  function updatePeligro(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("ssoPeligros", params.id, patch);
  }

  // ── Riesgos (Matriz IPER) ──────────────────────────────────────────────────

  function listRiesgos(params) {
    var filter = { wsId: params.wsId || SSO_WS_ID };
    if (params.estado)         filter.estado         = params.estado;
    if (params.clasificacion)  filter.clasificacion  = params.clasificacion;
    if (params.area)           filter.area           = params.area;
    if (params.peligroId)      filter.peligroId      = params.peligroId;
    if (params.responsableId)  filter.responsableId  = params.responsableId;
    var result = listEntities_("ssoRiesgos", filter);
    return result.items || [];
  }

  function getRiesgo(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("ssoRiesgos", params.id);
  }

  function createRiesgo(params) {
    Validator.requireFields(params, ["area", "probabilidad", "impacto"]);
    AppLogger.info("SSOController.createRiesgo", { area: params.area });
    var now = nowIso_();
    var nivel = calcularNivelRiesgo_(params.probabilidad, params.impacto);
    var data = Object.assign({
      codigo:                codigoPrefijo_("RIE"),
      peligroId:             "",
      proceso:               "",
      actividad:             "",
      peligroDesc:           "",
      controlesExistentes:   "",
      accionesRecomendadas:  "",
      responsableId:         "",
      fechaRevision:         "",
      estado:                "vigente",
      dataJson:              "",
      createdBy:             "",
      deletedAt:             "",
    }, params, {
      id:            IdGen.uuid(),
      wsId:          params.wsId || SSO_WS_ID,
      probabilidad:  Number(params.probabilidad) || 1,
      impacto:       Number(params.impacto)      || 1,
      nivelRiesgo:   nivel.nivelRiesgo,
      clasificacion: nivel.clasificacion,
      createdAt:     now,
      updatedAt:     now,
    });
    createEntity_("ssoRiesgos", data);
    return data;
  }

  function updateRiesgo(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    // Recalculate risk level if probability or impact changed
    if (params.probabilidad != null || params.impacto != null) {
      var existing = getEntity_("ssoRiesgos", params.id);
      var prob   = Number(params.probabilidad) || Number(existing.probabilidad) || 1;
      var impact = Number(params.impacto)      || Number(existing.impacto)      || 1;
      var nivel  = calcularNivelRiesgo_(prob, impact);
      patch.nivelRiesgo   = nivel.nivelRiesgo;
      patch.clasificacion = nivel.clasificacion;
    }
    delete patch.id;
    return updateEntity_("ssoRiesgos", params.id, patch);
  }

  // ── Acciones Correctivas y Preventivas (CAPA) ──────────────────────────────

  function listAccionesSso(params) {
    var filter = { wsId: params.wsId || SSO_WS_ID };
    if (params.tipo)          filter.tipo          = params.tipo;
    if (params.estado)        filter.estado        = params.estado;
    if (params.prioridad)     filter.prioridad     = params.prioridad;
    if (params.origen)        filter.origen        = params.origen;
    if (params.responsableId) filter.responsableId = params.responsableId;
    if (params.area)          filter.area          = params.area;
    var result = listEntities_("ssoAcciones", filter);
    return result.items || [];
  }

  function getAccionSso(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("ssoAcciones", params.id);
  }

  function createAccionSso(params) {
    Validator.requireFields(params, ["tipo", "titulo", "responsableId"]);
    AppLogger.info("SSOController.createAccionSso", { tipo: params.tipo, titulo: params.titulo });
    var now = nowIso_();
    var data = Object.assign({
      codigo:          codigoPrefijo_("CAPA"),
      origen:          "",
      origenId:        "",
      descripcion:     "",
      responsableRef:  "",
      area:            "",
      prioridad:       "media",
      fechaLimite:     "",
      fechaCierre:     "",
      progresoPct:     0,
      verificadoPorId: "",
      fechaVerificacion: "",
      estado:          "pendiente",
      dataJson:        "",
      createdBy:       "",
      deletedAt:       "",
    }, params, {
      id:              IdGen.uuid(),
      wsId:            params.wsId || SSO_WS_ID,
      fechaAsignacion: params.fechaAsignacion || now,
      createdAt:       now,
      updatedAt:       now,
    });
    createEntity_("ssoAcciones", data);
    return data;
  }

  function updateAccionSso(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("ssoAcciones", params.id, patch);
  }

  function verificarAccion(params) {
    Validator.requireFields(params, ["id", "verificadoPorId"]);
    AppLogger.info("SSOController.verificarAccion", { id: params.id });
    var now = nowIso_();
    return updateEntity_("ssoAcciones", params.id, {
      estado:           "verificada",
      progresoPct:      100,
      verificadoPorId:  params.verificadoPorId,
      fechaVerificacion: now,
      updatedAt:        now,
    });
  }

  function cerrarAccionSso(params) {
    Validator.requireFields(params, ["id"]);
    AppLogger.info("SSOController.cerrarAccionSso", { id: params.id });
    var now = nowIso_();
    return updateEntity_("ssoAcciones", params.id, {
      estado:      "cerrada",
      fechaCierre: now,
      progresoPct: 100,
      updatedAt:   now,
    });
  }

  // ── EPP — Equipos de Protección Personal ───────────────────────────────────

  function listEPP(params) {
    var filter = { wsId: params.wsId || SSO_WS_ID };
    if (params.estado)     filter.estado     = params.estado;
    if (params.categoria)  filter.categoria  = params.categoria;
    if (params.empleadoId) filter.empleadoId = params.empleadoId;
    var result = listEntities_("ssoEPP", filter);
    return result.items || [];
  }

  function getEPPItem(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("ssoEPP", params.id);
  }

  function createEPPItem(params) {
    Validator.requireFields(params, ["nombre", "categoria", "empleadoId"]);
    AppLogger.info("SSOController.createEPPItem", { nombre: params.nombre });
    var now = nowIso_();
    var data = Object.assign({
      codigo:        codigoPrefijo_("EPP"),
      descripcion:   "",
      empleadoRef:   "",
      tipo:          "",
      talla:         "",
      marca:         "",
      modelo:        "",
      fechaVencimiento: "",
      cantidad:      1,
      unidadMedida:  "unidad",
      estado:        "entregado",
      // Compras integration
      proveedorId:   "",
      ordenCompraRef: "",
      // Contabilidad integration
      costo:         0,
      compromisoId:  "",
      dataJson:      "",
      createdBy:     "",
      deletedAt:     "",
    }, params, {
      id:           IdGen.uuid(),
      wsId:         params.wsId || SSO_WS_ID,
      fechaEntrega: params.fechaEntrega || now,
      createdAt:    now,
      updatedAt:    now,
    });
    createEntity_("ssoEPP", data);
    return data;
  }

  function updateEPPItem(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("ssoEPP", params.id, patch);
  }

  // ── Capacitaciones SSO ─────────────────────────────────────────────────────

  function listCapacitacionesSso(params) {
    var filter = { wsId: params.wsId || SSO_WS_ID };
    if (params.estado)    filter.estado    = params.estado;
    if (params.tipo)      filter.tipo      = params.tipo;
    if (params.modalidad) filter.modalidad = params.modalidad;
    var result = listEntities_("ssoCapacitaciones", filter);
    return result.items || [];
  }

  function getCapacitacionSso(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("ssoCapacitaciones", params.id);
  }

  function createCapacitacionSso(params) {
    Validator.requireFields(params, ["titulo", "tipo"]);
    AppLogger.info("SSOController.createCapacitacionSso", { titulo: params.titulo });
    var now = nowIso_();
    var data = Object.assign({
      codigo:           codigoPrefijo_("CAP-SSO"),
      modalidad:        "presencial",
      instructor:       "",
      entidad:          "",
      fechaFin:         "",
      duracionHoras:    0,
      participantesIds: "",
      numParticipantes: 0,
      numAprobados:     0,
      tematica:         "",
      objetivo:         "",
      estado:           "programada",
      // Contabilidad integration
      costo:            0,
      compromisoId:     "",
      dataJson:         "",
      createdBy:        "",
      deletedAt:        "",
    }, params, {
      id:          IdGen.uuid(),
      wsId:        params.wsId || SSO_WS_ID,
      fechaInicio: params.fechaInicio || now,
      createdAt:   now,
      updatedAt:   now,
    });
    createEntity_("ssoCapacitaciones", data);
    return data;
  }

  function updateCapacitacionSso(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("ssoCapacitaciones", params.id, patch);
  }

  function finalizarCapacitacionSso(params) {
    Validator.requireFields(params, ["id"]);
    AppLogger.info("SSOController.finalizarCapacitacionSso", { id: params.id });
    return updateEntity_("ssoCapacitaciones", params.id, {
      estado:          "finalizada",
      numParticipantes: Number(params.numParticipantes) || 0,
      numAprobados:     Number(params.numAprobados)     || 0,
      updatedAt:        nowIso_(),
    });
  }

  // ── Comité SSO ─────────────────────────────────────────────────────────────

  function listActasComite(params) {
    var filter = { wsId: params.wsId || SSO_WS_ID };
    if (params.estado) filter.estado = params.estado;
    if (params.tipo)   filter.tipo   = params.tipo;
    var result = listEntities_("ssoComite", filter);
    return result.items || [];
  }

  function getActaComite(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("ssoComite", params.id);
  }

  function createActaComite(params) {
    Validator.requireFields(params, ["tipo", "fecha"]);
    AppLogger.info("SSOController.createActaComite", { tipo: params.tipo, fecha: params.fecha });
    var now = nowIso_();
    var data = Object.assign({
      codigo:       codigoPrefijo_("COM"),
      numero:       "",
      lugar:        "",
      presidenteId: "",
      secretarioId: "",
      miembros:     "",
      numAsistentes: 0,
      agenda:       "",
      acuerdos:     "",
      compromisos:  "",
      estado:       "convocada",
      proximaFecha: "",
      dataJson:     "",
      createdBy:    "",
      deletedAt:    "",
    }, params, {
      id:        IdGen.uuid(),
      wsId:      params.wsId || SSO_WS_ID,
      createdAt: now,
      updatedAt: now,
    });
    createEntity_("ssoComite", data);
    return data;
  }

  function updateActaComite(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("ssoComite", params.id, patch);
  }

  // ── Auditorías SSO ─────────────────────────────────────────────────────────

  function listAuditoriasSSO(params) {
    var filter = { wsId: params.wsId || SSO_WS_ID };
    if (params.estado) filter.estado = params.estado;
    if (params.tipo)   filter.tipo   = params.tipo;
    var result = listEntities_("ssoAuditorias", filter);
    return result.items || [];
  }

  function getAuditoriaSSO(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("ssoAuditorias", params.id);
  }

  function createAuditoriaSSO(params) {
    Validator.requireFields(params, ["titulo", "tipo"]);
    AppLogger.info("SSOController.createAuditoriaSSO", { titulo: params.titulo });
    var now = nowIso_();
    var data = Object.assign({
      codigo:          codigoPrefijo_("AUD-SSO"),
      normaRef:        "",
      auditorId:       "",
      auditorRef:      "",
      fechaEjecucion:  "",
      alcance:         "",
      metodologia:     "",
      hallazgos:       "",
      noConformidades: "",
      numHallazgos:    0,
      numNC:           0,
      planAccion:      "",
      estado:          "programada",
      dataJson:        "",
      createdBy:       "",
      deletedAt:       "",
    }, params, {
      id:              IdGen.uuid(),
      wsId:            params.wsId || SSO_WS_ID,
      fechaProgramada: params.fechaProgramada || now,
      createdAt:       now,
      updatedAt:       now,
    });
    createEntity_("ssoAuditorias", data);
    return data;
  }

  function updateAuditoriaSSO(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("ssoAuditorias", params.id, patch);
  }

  function cerrarAuditoriaSSO(params) {
    Validator.requireFields(params, ["id"]);
    AppLogger.info("SSOController.cerrarAuditoriaSSO", { id: params.id });
    var now = nowIso_();
    return updateEntity_("ssoAuditorias", params.id, {
      estado:          "completada",
      fechaEjecucion:  now,
      hallazgos:       params.hallazgos       || "",
      noConformidades: params.noConformidades || "",
      numHallazgos:    Number(params.numHallazgos) || 0,
      numNC:           Number(params.numNC)         || 0,
      planAccion:      params.planAccion      || "",
      updatedAt:       now,
    });
  }

  // ── Cumplimiento Legal ─────────────────────────────────────────────────────

  function listCumplimiento(params) {
    var filter = { wsId: params.wsId || SSO_WS_ID };
    if (params.estado) filter.estado = params.estado;
    if (params.tipo)   filter.tipo   = params.tipo;
    var result = listEntities_("ssoCumplimiento", filter);
    return result.items || [];
  }

  function getCumplimiento(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("ssoCumplimiento", params.id);
  }

  function createCumplimiento(params) {
    Validator.requireFields(params, ["norma", "descripcion"]);
    AppLogger.info("SSOController.createCumplimiento", { norma: params.norma });
    var now = nowIso_();
    var data = Object.assign({
      codigo:       codigoPrefijo_("CUM"),
      articulo:     "",
      tipo:         "legal",
      responsableId: "",
      fechaVigencia: "",
      fechaRevision: "",
      evidencia:    "",
      estado:       "en_proceso",
      observaciones: "",
      dataJson:     "",
      createdBy:    "",
      deletedAt:    "",
    }, params, {
      id:        IdGen.uuid(),
      wsId:      params.wsId || SSO_WS_ID,
      createdAt: now,
      updatedAt: now,
    });
    createEntity_("ssoCumplimiento", data);
    return data;
  }

  function updateCumplimiento(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("ssoCumplimiento", params.id, patch);
  }

  // ── Dashboard y Reportes ───────────────────────────────────────────────────

  function getDashboardResumen(params) {
    var wsId = params.wsId || SSO_WS_ID;
    AppLogger.info("SSOController.getDashboardResumen", { wsId: wsId });

    var incidentes       = (listEntities_("ssoIncidentes",    { wsId: wsId }).items || []);
    var accidentes       = (listEntities_("ssoAccidentes",    { wsId: wsId }).items || []);
    var inspecciones     = (listEntities_("ssoInspecciones",  { wsId: wsId }).items || []);
    var riesgos          = (listEntities_("ssoRiesgos",       { wsId: wsId }).items || []);
    var acciones         = (listEntities_("ssoAcciones",      { wsId: wsId }).items || []);
    var capacitaciones   = (listEntities_("ssoCapacitaciones",{ wsId: wsId }).items || []);
    var comite           = (listEntities_("ssoComite",        { wsId: wsId }).items || []);
    var cumplimiento     = (listEntities_("ssoCumplimiento",  { wsId: wsId }).items || []);

    // Incidentes KPIs
    var incidentesTotal       = incidentes.filter(function(i) { return i.deletedAt == null; }).length;
    var incidentesAbiertos    = incidentes.filter(function(i) { return i.estado !== "cerrado"; }).length;

    // Accidentes
    var accidentesTotal       = accidentes.filter(function(a) { return a.deletedAt == null; }).length;

    // Tiempo promedio de cierre (días)
    var cerrados = incidentes.filter(function(i) { return i.estado === "cerrado" && i.fechaIncidente; });
    var tiempoProm = 0;
    if (cerrados.length > 0) {
      var totalDias = cerrados.reduce(function(sum, i) {
        return sum + (Number(i.diasPerdidos) || 0);
      }, 0);
      tiempoProm = Math.round(totalDias / cerrados.length);
    }

    // Inspecciones
    var inspeccionesRealizadas = inspecciones.filter(function(i) { return i.estado === "completada"; }).length;
    var inspeccionesPendientes = inspecciones.filter(function(i) { return i.estado === "programada"; }).length;

    // Riesgos por clasificación
    var riesgosAltos  = riesgos.filter(function(r) { return r.clasificacion === "alto"   && r.estado === "vigente"; }).length;
    var riesgosMedios = riesgos.filter(function(r) { return r.clasificacion === "medio"  && r.estado === "vigente"; }).length;
    var riesgosBajos  = riesgos.filter(function(r) { return r.clasificacion === "bajo"   && r.estado === "vigente"; }).length;

    // Acciones CAPA
    var accionesCorrectivasAbiertas = acciones.filter(function(a) { return a.tipo === "correctiva" && a.estado !== "cerrada"; }).length;
    var accionesPreventivas         = acciones.filter(function(a) { return a.tipo === "preventiva" && a.estado !== "cerrada"; }).length;

    // Capacitaciones
    var capacitacionesEjecutadas = capacitaciones.filter(function(c) { return c.estado === "finalizada"; }).length;

    // Comité — participación promedio
    var comiteTotal = comite.filter(function(c) { return c.estado === "realizada" || c.estado === "aprobada"; }).length;

    // Cumplimiento legal
    var cumplimientoTotal = cumplimiento.filter(function(c) { return c.deletedAt == null; }).length;
    var cumplimientoCumple = cumplimiento.filter(function(c) { return c.estado === "cumple"; }).length;
    var cumplimientoPct = cumplimientoTotal > 0 ? Math.round((cumplimientoCumple / cumplimientoTotal) * 100) : 0;

    return {
      incidentes: {
        total:    incidentesTotal,
        abiertos: incidentesAbiertos,
      },
      accidentes: {
        total: accidentesTotal,
      },
      inspecciones: {
        realizadas: inspeccionesRealizadas,
        pendientes: inspeccionesPendientes,
      },
      riesgos: {
        altos:  riesgosAltos,
        medios: riesgosMedios,
        bajos:  riesgosBajos,
      },
      acciones: {
        correctivasAbiertas: accionesCorrectivasAbiertas,
        preventivasAbiertas: accionesPreventivas,
      },
      capacitaciones: {
        ejecutadas: capacitacionesEjecutadas,
      },
      comite: {
        sesionesRealizadas: comiteTotal,
      },
      cumplimiento: {
        pct: cumplimientoPct,
      },
      tiempoPromediosCierreIncidentes: tiempoProm,
    };
  }

  function reporteIncidentesPeriodo(params) {
    var wsId = params.wsId || SSO_WS_ID;
    var items = (listEntities_("ssoIncidentes", { wsId: wsId }).items || []);
    if (params.desde) items = items.filter(function(i) { return i.fechaIncidente >= params.desde; });
    if (params.hasta) items = items.filter(function(i) { return i.fechaIncidente <= params.hasta; });
    var porTipo = {};
    items.forEach(function(i) { porTipo[i.tipo] = (porTipo[i.tipo] || 0) + 1; });
    return { rows: items, total: items.length, porTipo: porTipo };
  }

  function reporteAccidentesArea(params) {
    var wsId = params.wsId || SSO_WS_ID;
    var items = (listEntities_("ssoAccidentes", { wsId: wsId }).items || []);
    var porArea = {};
    items.forEach(function(a) { porArea[a.area || "sin_area"] = (porArea[a.area || "sin_area"] || 0) + 1; });
    return { rows: items, total: items.length, porArea: porArea };
  }

  function reporteAccionesPendientes(params) {
    var wsId = params.wsId || SSO_WS_ID;
    var items = (listEntities_("ssoAcciones", { wsId: wsId }).items || []).filter(
      function(a) { return a.estado !== "cerrada"; }
    );
    var vencidas = items.filter(function(a) {
      return a.fechaLimite && a.fechaLimite < new Date().toISOString();
    }).length;
    return { rows: items, total: items.length, vencidas: vencidas };
  }

  function reporteIndicadoresAccidentalidad(params) {
    var wsId = params.wsId || SSO_WS_ID;
    var incidentes  = (listEntities_("ssoIncidentes",  { wsId: wsId }).items || []);
    var accidentes  = (listEntities_("ssoAccidentes",  { wsId: wsId }).items || []);
    var totalDias   = accidentes.reduce(function(s, a) { return s + (Number(a.diasIncapacidad) || 0); }, 0);
    var totalCosto  = incidentes.reduce(function(s, i) { return s + (Number(i.costoEstimado)   || 0); }, 0);
    return {
      totalIncidentes:  incidentes.length,
      totalAccidentes:  accidentes.length,
      totalDiasIncapacidad: totalDias,
      costoTotalEstimado:   totalCosto,
    };
  }

  function reporteCumplimientoLegal(params) {
    var wsId = params.wsId || SSO_WS_ID;
    var items = (listEntities_("ssoCumplimiento", { wsId: wsId }).items || []);
    var porEstado = {};
    items.forEach(function(c) { porEstado[c.estado] = (porEstado[c.estado] || 0) + 1; });
    var pct = items.length > 0
      ? Math.round(((porEstado["cumple"] || 0) / items.length) * 100)
      : 0;
    return { rows: items, total: items.length, porEstado: porEstado, cumplimientoPct: pct };
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  return {
    // Incidentes
    listIncidentes:       listIncidentes,
    getIncidente:         getIncidente,
    createIncidente:      createIncidente,
    updateIncidente:      updateIncidente,
    clasificarIncidente:  clasificarIncidente,
    cerrarIncidente:      cerrarIncidente,
    // Accidentes
    listAccidentes:       listAccidentes,
    getAccidente:         getAccidente,
    createAccidente:      createAccidente,
    updateAccidente:      updateAccidente,
    cerrarAccidente:      cerrarAccidente,
    // Inspecciones SSO
    listInspeccionesSso:  listInspeccionesSso,
    getInspeccionSso:     getInspeccionSso,
    createInspeccionSso:  createInspeccionSso,
    updateInspeccionSso:  updateInspeccionSso,
    cerrarInspeccionSso:  cerrarInspeccionSso,
    // Peligros
    listPeligros:         listPeligros,
    getPeligro:           getPeligro,
    createPeligro:        createPeligro,
    updatePeligro:        updatePeligro,
    // Riesgos (Matriz IPER)
    listRiesgos:          listRiesgos,
    getRiesgo:            getRiesgo,
    createRiesgo:         createRiesgo,
    updateRiesgo:         updateRiesgo,
    // Acciones CAPA
    listAccionesSso:      listAccionesSso,
    getAccionSso:         getAccionSso,
    createAccionSso:      createAccionSso,
    updateAccionSso:      updateAccionSso,
    verificarAccion:      verificarAccion,
    cerrarAccionSso:      cerrarAccionSso,
    // EPP
    listEPP:              listEPP,
    getEPPItem:           getEPPItem,
    createEPPItem:        createEPPItem,
    updateEPPItem:        updateEPPItem,
    // Capacitaciones SSO
    listCapacitacionesSso:      listCapacitacionesSso,
    getCapacitacionSso:         getCapacitacionSso,
    createCapacitacionSso:      createCapacitacionSso,
    updateCapacitacionSso:      updateCapacitacionSso,
    finalizarCapacitacionSso:   finalizarCapacitacionSso,
    // Comité
    listActasComite:      listActasComite,
    getActaComite:        getActaComite,
    createActaComite:     createActaComite,
    updateActaComite:     updateActaComite,
    // Auditorías
    listAuditoriasSSO:    listAuditoriasSSO,
    getAuditoriaSSO:      getAuditoriaSSO,
    createAuditoriaSSO:   createAuditoriaSSO,
    updateAuditoriaSSO:   updateAuditoriaSSO,
    cerrarAuditoriaSSO:   cerrarAuditoriaSSO,
    // Cumplimiento legal
    listCumplimiento:     listCumplimiento,
    getCumplimiento:      getCumplimiento,
    createCumplimiento:   createCumplimiento,
    updateCumplimiento:   updateCumplimiento,
    // Dashboard y Reportes
    getDashboardResumen:             getDashboardResumen,
    reporteIncidentesPeriodo:        reporteIncidentesPeriodo,
    reporteAccidentesArea:           reporteAccidentesArea,
    reporteAccionesPendientes:       reporteAccionesPendientes,
    reporteIndicadoresAccidentalidad: reporteIndicadoresAccidentalidad,
    reporteCumplimientoLegal:        reporteCumplimientoLegal,
  };

})();

// ── Action Router ────────────────────────────────────────────────────────────

function routeSSOAction_(verb, params, context) {
  switch (verb) {
    // Incidentes
    case "listIncidentes":       return SSOController.listIncidentes(params);
    case "getIncidente":         return SSOController.getIncidente(params);
    case "createIncidente":      return SSOController.createIncidente(params);
    case "updateIncidente":      return SSOController.updateIncidente(params);
    case "clasificarIncidente":  return SSOController.clasificarIncidente(params);
    case "cerrarIncidente":      return SSOController.cerrarIncidente(params);
    // Accidentes
    case "listAccidentes":       return SSOController.listAccidentes(params);
    case "getAccidente":         return SSOController.getAccidente(params);
    case "createAccidente":      return SSOController.createAccidente(params);
    case "updateAccidente":      return SSOController.updateAccidente(params);
    case "cerrarAccidente":      return SSOController.cerrarAccidente(params);
    // Inspecciones SSO
    case "listInspeccionesSso":  return SSOController.listInspeccionesSso(params);
    case "getInspeccionSso":     return SSOController.getInspeccionSso(params);
    case "createInspeccionSso":  return SSOController.createInspeccionSso(params);
    case "updateInspeccionSso":  return SSOController.updateInspeccionSso(params);
    case "cerrarInspeccionSso":  return SSOController.cerrarInspeccionSso(params);
    // Peligros
    case "listPeligros":         return SSOController.listPeligros(params);
    case "getPeligro":           return SSOController.getPeligro(params);
    case "createPeligro":        return SSOController.createPeligro(params);
    case "updatePeligro":        return SSOController.updatePeligro(params);
    // Riesgos (Matriz IPER)
    case "listRiesgos":          return SSOController.listRiesgos(params);
    case "getRiesgo":            return SSOController.getRiesgo(params);
    case "createRiesgo":         return SSOController.createRiesgo(params);
    case "updateRiesgo":         return SSOController.updateRiesgo(params);
    // Acciones CAPA
    case "listAccionesSso":      return SSOController.listAccionesSso(params);
    case "getAccionSso":         return SSOController.getAccionSso(params);
    case "createAccionSso":      return SSOController.createAccionSso(params);
    case "updateAccionSso":      return SSOController.updateAccionSso(params);
    case "verificarAccion":      return SSOController.verificarAccion(params);
    case "cerrarAccionSso":      return SSOController.cerrarAccionSso(params);
    // EPP
    case "listEPP":              return SSOController.listEPP(params);
    case "getEPPItem":           return SSOController.getEPPItem(params);
    case "createEPPItem":        return SSOController.createEPPItem(params);
    case "updateEPPItem":        return SSOController.updateEPPItem(params);
    // Capacitaciones SSO
    case "listCapacitacionesSso":    return SSOController.listCapacitacionesSso(params);
    case "getCapacitacionSso":       return SSOController.getCapacitacionSso(params);
    case "createCapacitacionSso":    return SSOController.createCapacitacionSso(params);
    case "updateCapacitacionSso":    return SSOController.updateCapacitacionSso(params);
    case "finalizarCapacitacionSso": return SSOController.finalizarCapacitacionSso(params);
    // Comité
    case "listActasComite":      return SSOController.listActasComite(params);
    case "getActaComite":        return SSOController.getActaComite(params);
    case "createActaComite":     return SSOController.createActaComite(params);
    case "updateActaComite":     return SSOController.updateActaComite(params);
    // Auditorías
    case "listAuditoriasSSO":    return SSOController.listAuditoriasSSO(params);
    case "getAuditoriaSSO":      return SSOController.getAuditoriaSSO(params);
    case "createAuditoriaSSO":   return SSOController.createAuditoriaSSO(params);
    case "updateAuditoriaSSO":   return SSOController.updateAuditoriaSSO(params);
    case "cerrarAuditoriaSSO":   return SSOController.cerrarAuditoriaSSO(params);
    // Cumplimiento legal
    case "listCumplimiento":     return SSOController.listCumplimiento(params);
    case "getCumplimiento":      return SSOController.getCumplimiento(params);
    case "createCumplimiento":   return SSOController.createCumplimiento(params);
    case "updateCumplimiento":   return SSOController.updateCumplimiento(params);
    // Dashboard y Reportes
    case "getDashboardResumen":             return SSOController.getDashboardResumen(params);
    case "reporteIncidentesPeriodo":        return SSOController.reporteIncidentesPeriodo(params);
    case "reporteAccidentesArea":           return SSOController.reporteAccidentesArea(params);
    case "reporteAccionesPendientes":       return SSOController.reporteAccionesPendientes(params);
    case "reporteIndicadoresAccidentalidad": return SSOController.reporteIndicadoresAccidentalidad(params);
    case "reporteCumplimientoLegal":        return SSOController.reporteCumplimientoLegal(params);

    default:
      throw new Error("SSOController: unknown verb '" + verb + "'");
  }
}
