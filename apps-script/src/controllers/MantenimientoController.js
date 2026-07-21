/**
 * MantenimientoController — Mantenimiento e Infraestructura operations.
 *
 * Scopes all queries to wsId = "mantenimiento" and orchestrates maintenance
 * business logic. Persistence delegates to the generic SheetRepository via
 * the mantenimiento entity schemas:
 *   mantoActivos, mantoUbicaciones, mantoPlanes, mantoSolicitudes,
 *   mantoOrdenesTrabajo, mantoInspecciones, mantoHistorial,
 *   mantoCostos, mantoInventarioTecnico.
 *
 * Integration points (foreign keys only — no data duplication):
 *   proveedorId     → comprasProveedores.id     (asset / inventory supplier)
 *   ordenCompraRef  → comprasOrdenes.codigo       (purchase context)
 *   compromisoId    → contaCompromisos.id         (budget commitment)
 *   facturaId       → contaFacturas.id            (invoice for cost)
 */
var MantenimientoController = (function () {

  var MANTO_WS_ID = "mantenimiento";

  // ── Helpers ────────────────────────────────────────────────────────────────

  function nowIso_() { return new Date().toISOString(); }

  function codigoPrefijo_(prefijo) {
    return prefijo + "-" + new Date().getFullYear() + "-" + IdGen.uuid().substring(0, 6).toUpperCase();
  }

  // ── Activos ────────────────────────────────────────────────────────────────

  function listActivos(params) {
    var filter = { wsId: params.wsId || MANTO_WS_ID };
    if (params.estado)      filter.estado      = params.estado;
    if (params.categoria)   filter.categoria   = params.categoria;
    if (params.tipo)        filter.tipo        = params.tipo;
    if (params.ubicacionId) filter.ubicacionId = params.ubicacionId;
    if (params.proveedorId) filter.proveedorId = params.proveedorId;
    var result = listEntities_("mantoActivos", filter);
    return result.items || [];
  }

  function getActivo(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("mantoActivos", params.id);
  }

  function createActivo(params) {
    Validator.requireFields(params, ["nombre", "categoria"]);
    AppLogger.info("MantenimientoController.createActivo", { nombre: params.nombre });
    var now = nowIso_();
    var data = Object.assign({
      codigo:                    codigoPrefijo_("ACT"),
      tipo:                      "",
      marca:                     "",
      modelo:                    "",
      serie:                     "",
      descripcion:               "",
      ubicacionId:               "",
      ubicacionRef:              "",
      responsableId:             "",
      estado:                    "operativo",
      fechaAdquisicion:          "",
      vidaUtilAnios:             0,
      valorAdquisicion:          0,
      valorActual:               0,
      proveedorId:               "",
      proveedorRef:              "",
      ordenCompraRef:            "",
      garantiaFecha:             "",
      garantiaDetalles:          "",
      ultimoMantenimientoFecha:  "",
      proximoMantenimientoFecha: "",
      observaciones:             "",
      dataJson:                  "",
      createdBy:                 "",
      deletedAt:                 "",
    }, params, {
      id:        IdGen.uuid(),
      wsId:      params.wsId || MANTO_WS_ID,
      createdAt: now,
      updatedAt: now,
    });
    createEntity_("mantoActivos", data);
    return data;
  }

  function updateActivo(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("mantoActivos", params.id, patch);
  }

  function cambiarEstadoActivo(params) {
    Validator.requireFields(params, ["id", "estado"]);
    AppLogger.info("MantenimientoController.cambiarEstadoActivo", { id: params.id, estado: params.estado });
    return updateEntity_("mantoActivos", params.id, {
      estado:     params.estado,
      updatedAt:  nowIso_(),
    });
  }

  function darBajaActivo(params) {
    Validator.requireFields(params, ["id"]);
    AppLogger.info("MantenimientoController.darBajaActivo", { id: params.id });
    return updateEntity_("mantoActivos", params.id, {
      estado:     "baja",
      deletedAt:  nowIso_(),
      updatedAt:  nowIso_(),
    });
  }

  // ── Ubicaciones ────────────────────────────────────────────────────────────

  function listUbicaciones(params) {
    var filter = { wsId: params.wsId || MANTO_WS_ID };
    if (params.estado) filter.estado = params.estado;
    if (params.tipo)   filter.tipo   = params.tipo;
    if (params.area)   filter.area   = params.area;
    var result = listEntities_("mantoUbicaciones", filter);
    return result.items || [];
  }

  function getUbicacion(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("mantoUbicaciones", params.id);
  }

  function createUbicacion(params) {
    Validator.requireFields(params, ["nombre", "tipo"]);
    AppLogger.info("MantenimientoController.createUbicacion", { nombre: params.nombre });
    var now = nowIso_();
    var data = Object.assign({
      codigo:        codigoPrefijo_("UBI"),
      descripcion:   "",
      area:          "",
      responsableId: "",
      estado:        "activo",
      dataJson:      "",
      createdBy:     "",
      deletedAt:     "",
    }, params, {
      id:        IdGen.uuid(),
      wsId:      params.wsId || MANTO_WS_ID,
      createdAt: now,
      updatedAt: now,
    });
    createEntity_("mantoUbicaciones", data);
    return data;
  }

  function updateUbicacion(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("mantoUbicaciones", params.id, patch);
  }

  // ── Planes Preventivos ─────────────────────────────────────────────────────

  function listPlanes(params) {
    var filter = { wsId: params.wsId || MANTO_WS_ID };
    if (params.estado)   filter.estado   = params.estado;
    if (params.tipo)     filter.tipo     = params.tipo;
    if (params.activoId) filter.activoId = params.activoId;
    var result = listEntities_("mantoPlanes", filter);
    return result.items || [];
  }

  function getPlan(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("mantoPlanes", params.id);
  }

  function createPlan(params) {
    Validator.requireFields(params, ["nombre", "tipo", "activoId", "frecuencia"]);
    AppLogger.info("MantenimientoController.createPlan", { nombre: params.nombre });
    var now = nowIso_();
    var data = Object.assign({
      codigo:            codigoPrefijo_("PLAN"),
      activoRef:         "",
      descripcion:       "",
      procedimiento:     "",
      duracionHoras:     0,
      costoEstimado:     0,
      tecnicoAsignadoId: "",
      fechaInicio:       "",
      fechaFin:          "",
      estado:            "borrador",
      cumplimientoPct:   0,
      dataJson:          "",
      createdBy:         "",
      deletedAt:         "",
    }, params, {
      id:        IdGen.uuid(),
      wsId:      params.wsId || MANTO_WS_ID,
      createdAt: now,
      updatedAt: now,
    });
    createEntity_("mantoPlanes", data);
    return data;
  }

  function updatePlan(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("mantoPlanes", params.id, patch);
  }

  function activarPlan(params) {
    Validator.requireFields(params, ["id"]);
    AppLogger.info("MantenimientoController.activarPlan", { id: params.id });
    return updateEntity_("mantoPlanes", params.id, {
      estado:    "activo",
      updatedAt: nowIso_(),
    });
  }

  // ── Solicitudes de Servicio ────────────────────────────────────────────────

  function listSolicitudes(params) {
    var filter = { wsId: params.wsId || MANTO_WS_ID };
    if (params.estado)      filter.estado      = params.estado;
    if (params.tipo)        filter.tipo        = params.tipo;
    if (params.prioridad)   filter.prioridad   = params.prioridad;
    if (params.activoId)    filter.activoId    = params.activoId;
    if (params.solicitanteId) filter.solicitanteId = params.solicitanteId;
    var result = listEntities_("mantoSolicitudes", filter);
    return result.items || [];
  }

  function getSolicitud(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("mantoSolicitudes", params.id);
  }

  function createSolicitud(params) {
    Validator.requireFields(params, ["titulo", "tipo", "solicitanteId"]);
    AppLogger.info("MantenimientoController.createSolicitud", { titulo: params.titulo });
    var now = nowIso_();
    var data = Object.assign({
      codigo:          codigoPrefijo_("SOL"),
      unidadSolicitante: "",
      prioridad:       "normal",
      descripcion:     "",
      activoId:        "",
      activoRef:       "",
      ubicacionId:     "",
      ubicacionRef:    "",
      estado:          "pendiente",
      fechaRequerida:  "",
      aprobadoPorId:   "",
      fechaAprobacion: "",
      ordenTrabajoId:  "",
      notas:           "",
      dataJson:        "",
      createdBy:       "",
      deletedAt:       "",
    }, params, {
      id:             IdGen.uuid(),
      wsId:           params.wsId || MANTO_WS_ID,
      fechaSolicitud: params.fechaSolicitud || now,
      createdAt:      now,
      updatedAt:      now,
    });
    createEntity_("mantoSolicitudes", data);
    return data;
  }

  function updateSolicitud(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("mantoSolicitudes", params.id, patch);
  }

  function aprobarSolicitud(params) {
    Validator.requireFields(params, ["id", "aprobadoPorId"]);
    AppLogger.info("MantenimientoController.aprobarSolicitud", { id: params.id });
    var now = nowIso_();
    return updateEntity_("mantoSolicitudes", params.id, {
      estado:          "aprobada",
      aprobadoPorId:   params.aprobadoPorId,
      fechaAprobacion: now,
      updatedAt:       now,
    });
  }

  // ── Órdenes de Trabajo ─────────────────────────────────────────────────────

  function listOrdenes(params) {
    var filter = { wsId: params.wsId || MANTO_WS_ID };
    if (params.estado)             filter.estado             = params.estado;
    if (params.tipo)               filter.tipo               = params.tipo;
    if (params.prioridad)          filter.prioridad          = params.prioridad;
    if (params.activoId)           filter.activoId           = params.activoId;
    if (params.tecnicoAsignadoId)  filter.tecnicoAsignadoId  = params.tecnicoAsignadoId;
    if (params.solicitudId)        filter.solicitudId        = params.solicitudId;
    if (params.planId)             filter.planId             = params.planId;
    var result = listEntities_("mantoOrdenesTrabajo", filter);
    return result.items || [];
  }

  function getOrden(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("mantoOrdenesTrabajo", params.id);
  }

  function createOrden(params) {
    Validator.requireFields(params, ["titulo", "tipo"]);
    AppLogger.info("MantenimientoController.createOrden", { titulo: params.titulo });
    var now = nowIso_();
    var data = Object.assign({
      codigo:           codigoPrefijo_("OT"),
      solicitudId:      "",
      planId:           "",
      prioridad:        "normal",
      descripcion:      "",
      activoId:         "",
      activoRef:        "",
      ubicacionId:      "",
      ubicacionRef:     "",
      tecnicoAsignadoId: "",
      tecnicoRef:       "",
      estado:           "emitida",
      etapaActual:      "solicitud",
      fechaEstimadaFin: "",
      fechaInicio:      "",
      fechaCierre:      "",
      horasEstimadas:   0,
      horasReales:      0,
      diagnostico:      "",
      solucion:         "",
      costoManoObra:    0,
      costoMateriales:  0,
      costoTotal:       0,
      dataJson:         "",
      createdBy:        "",
      deletedAt:        "",
    }, params, {
      id:          IdGen.uuid(),
      wsId:        params.wsId || MANTO_WS_ID,
      fechaEmision: params.fechaEmision || now,
      createdAt:   now,
      updatedAt:   now,
    });
    createEntity_("mantoOrdenesTrabajo", data);
    return data;
  }

  function updateOrden(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("mantoOrdenesTrabajo", params.id, patch);
  }

  function asignarTecnico(params) {
    Validator.requireFields(params, ["id", "tecnicoAsignadoId"]);
    AppLogger.info("MantenimientoController.asignarTecnico", { id: params.id, tecnico: params.tecnicoAsignadoId });
    var now = nowIso_();
    return updateEntity_("mantoOrdenesTrabajo", params.id, {
      tecnicoAsignadoId: params.tecnicoAsignadoId,
      tecnicoRef:        params.tecnicoRef || "",
      estado:            "asignada",
      etapaActual:       "asignacion",
      updatedAt:         now,
    });
  }

  function cerrarOrden(params) {
    Validator.requireFields(params, ["id"]);
    AppLogger.info("MantenimientoController.cerrarOrden", { id: params.id });
    var now = nowIso_();
    var costoManoObra   = Number(params.costoManoObra)   || 0;
    var costoMateriales = Number(params.costoMateriales) || 0;
    return updateEntity_("mantoOrdenesTrabajo", params.id, {
      estado:          "completada",
      etapaActual:     "completado",
      fechaCierre:     now,
      horasReales:     Number(params.horasReales) || 0,
      diagnostico:     params.diagnostico || "",
      solucion:        params.solucion || "",
      costoManoObra:   costoManoObra,
      costoMateriales: costoMateriales,
      costoTotal:      costoManoObra + costoMateriales,
      updatedAt:       now,
    });
  }

  function cancelarOrden(params) {
    Validator.requireFields(params, ["id"]);
    AppLogger.info("MantenimientoController.cancelarOrden", { id: params.id });
    return updateEntity_("mantoOrdenesTrabajo", params.id, {
      estado:    "cancelada",
      updatedAt: nowIso_(),
    });
  }

  // ── Inspecciones ───────────────────────────────────────────────────────────

  function listInspecciones(params) {
    var filter = { wsId: params.wsId || MANTO_WS_ID };
    if (params.estado)    filter.estado    = params.estado;
    if (params.tipo)      filter.tipo      = params.tipo;
    if (params.activoId)  filter.activoId  = params.activoId;
    if (params.tecnicoId) filter.tecnicoId = params.tecnicoId;
    var result = listEntities_("mantoInspecciones", filter);
    return result.items || [];
  }

  function getInspeccion(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("mantoInspecciones", params.id);
  }

  function createInspeccion(params) {
    Validator.requireFields(params, ["tipo", "activoId"]);
    AppLogger.info("MantenimientoController.createInspeccion", { activoId: params.activoId });
    var now = nowIso_();
    var data = Object.assign({
      codigo:          codigoPrefijo_("INS"),
      activoRef:       "",
      ubicacionId:     "",
      ubicacionRef:    "",
      estado:          "programada",
      tecnicoId:       "",
      tecnicoRef:      "",
      fechaEjecucion:  "",
      hallazgos:       "",
      recomendaciones: "",
      condicion:       "",
      requiereOrden:   false,
      ordenGeneradaId: "",
      dataJson:        "",
      createdBy:       "",
      deletedAt:       "",
    }, params, {
      id:              IdGen.uuid(),
      wsId:            params.wsId || MANTO_WS_ID,
      fechaProgramada: params.fechaProgramada || now,
      createdAt:       now,
      updatedAt:       now,
    });
    createEntity_("mantoInspecciones", data);
    return data;
  }

  function updateInspeccion(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("mantoInspecciones", params.id, patch);
  }

  function cerrarInspeccion(params) {
    Validator.requireFields(params, ["id", "condicion"]);
    AppLogger.info("MantenimientoController.cerrarInspeccion", { id: params.id, condicion: params.condicion });
    var now = nowIso_();
    return updateEntity_("mantoInspecciones", params.id, {
      estado:          "completada",
      fechaEjecucion:  now,
      condicion:       params.condicion,
      hallazgos:       params.hallazgos       || "",
      recomendaciones: params.recomendaciones || "",
      requiereOrden:   params.requiereOrden   || false,
      ordenGeneradaId: params.ordenGeneradaId || "",
      updatedAt:       now,
    });
  }

  // ── Historial Técnico (insert-only) ────────────────────────────────────────

  function listHistorial(params) {
    var filter = { wsId: params.wsId || MANTO_WS_ID };
    if (params.activoId)     filter.activoId     = params.activoId;
    if (params.tipo)         filter.tipo         = params.tipo;
    if (params.ordenId)      filter.ordenId      = params.ordenId;
    if (params.inspeccionId) filter.inspeccionId = params.inspeccionId;
    var result = listEntities_("mantoHistorial", filter);
    return result.items || [];
  }

  function getHistorialItem(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("mantoHistorial", params.id);
  }

  function createHistorial(params) {
    Validator.requireFields(params, ["activoId", "tipo", "descripcion"]);
    AppLogger.info("MantenimientoController.createHistorial", { activoId: params.activoId, tipo: params.tipo });
    var now = nowIso_();
    var data = Object.assign({
      inspeccionId: "",
      ordenId:      "",
      tecnicoId:    "",
      costo:        0,
      dataJson:     "",
      createdBy:    "",
    }, params, {
      id:        IdGen.uuid(),
      wsId:      params.wsId || MANTO_WS_ID,
      fecha:     params.fecha || now,
      createdAt: now,
      updatedAt: now,
    });
    createEntity_("mantoHistorial", data);
    return data;
  }

  // ── Costos de Mantenimiento ────────────────────────────────────────────────

  function listCostos(params) {
    var filter = { wsId: params.wsId || MANTO_WS_ID };
    if (params.ordenId)   filter.ordenId   = params.ordenId;
    if (params.activoId)  filter.activoId  = params.activoId;
    if (params.tipo)      filter.tipo      = params.tipo;
    if (params.aprobado)  filter.aprobado  = params.aprobado;
    var result = listEntities_("mantoCostos", filter);
    return result.items || [];
  }

  function getCosto(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("mantoCostos", params.id);
  }

  function createCosto(params) {
    Validator.requireFields(params, ["tipo", "concepto", "monto"]);
    AppLogger.info("MantenimientoController.createCosto", { concepto: params.concepto, monto: params.monto });
    var now = nowIso_();
    var data = Object.assign({
      ordenId:      "",
      activoId:     "",
      activoRef:    "",
      moneda:       "USD",
      compromisoId: "",
      facturaId:    "",
      proveedor:    "",
      aprobado:     false,
      dataJson:     "",
      createdBy:    "",
      deletedAt:    "",
    }, params, {
      id:        IdGen.uuid(),
      wsId:      params.wsId || MANTO_WS_ID,
      monto:     Number(params.monto) || 0,
      fecha:     params.fecha || now,
      createdAt: now,
      updatedAt: now,
    });
    createEntity_("mantoCostos", data);
    return data;
  }

  function updateCosto(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("mantoCostos", params.id, patch);
  }

  // ── Inventario Técnico ─────────────────────────────────────────────────────

  function listInventario(params) {
    var filter = { wsId: params.wsId || MANTO_WS_ID };
    if (params.estado)      filter.estado      = params.estado;
    if (params.categoria)   filter.categoria   = params.categoria;
    if (params.activoId)    filter.activoId    = params.activoId;
    if (params.proveedorId) filter.proveedorId = params.proveedorId;
    var result = listEntities_("mantoInventarioTecnico", filter);
    return result.items || [];
  }

  function getInventarioItem(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("mantoInventarioTecnico", params.id);
  }

  function createInventarioItem(params) {
    Validator.requireFields(params, ["nombre", "categoria", "unidadMedida"]);
    AppLogger.info("MantenimientoController.createInventarioItem", { nombre: params.nombre });
    var now = nowIso_();
    var data = Object.assign({
      codigo:          codigoPrefijo_("INV"),
      descripcion:     "",
      stockActual:     0,
      stockMinimo:     0,
      ubicacionAlmacen: "",
      activoId:        "",
      ordenCompraId:   "",
      proveedorId:     "",
      estado:          "disponible",
      valorUnitario:   0,
      dataJson:        "",
      createdBy:       "",
      deletedAt:       "",
    }, params, {
      id:        IdGen.uuid(),
      wsId:      params.wsId || MANTO_WS_ID,
      createdAt: now,
      updatedAt: now,
    });
    createEntity_("mantoInventarioTecnico", data);
    return data;
  }

  function updateInventarioItem(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("mantoInventarioTecnico", params.id, patch);
  }

  // ── Dashboard y Reportes ───────────────────────────────────────────────────

  function getDashboardResumen(params) {
    var wsId = params.wsId || MANTO_WS_ID;
    AppLogger.info("MantenimientoController.getDashboardResumen", { wsId: wsId });

    var activos      = (listEntities_("mantoActivos",          { wsId: wsId }).items || []);
    var ordenes      = (listEntities_("mantoOrdenesTrabajo",   { wsId: wsId }).items || []);
    var solicitudes  = (listEntities_("mantoSolicitudes",      { wsId: wsId }).items || []);
    var inspecciones = (listEntities_("mantoInspecciones",     { wsId: wsId }).items || []);
    var costos       = (listEntities_("mantoCostos",           { wsId: wsId }).items || []);
    var inventario   = (listEntities_("mantoInventarioTecnico",{ wsId: wsId }).items || []);
    var planes       = (listEntities_("mantoPlanes",           { wsId: wsId }).items || []);

    // Activos KPIs
    var totalActivos      = activos.length;
    var activosOperativos = activos.filter(function(a) { return a.estado === "operativo"; }).length;
    var activosInactivos  = activos.filter(function(a) { return a.estado === "inactivo"; }).length;
    var activosEnManto    = activos.filter(function(a) { return a.estado === "mantenimiento"; }).length;

    // Órdenes KPIs
    var totalOrdenes      = ordenes.length;
    var ordenesAbiertas   = ordenes.filter(function(o) { return o.estado === "emitida" || o.estado === "asignada"; }).length;
    var ordenesEnProceso  = ordenes.filter(function(o) { return o.estado === "en_proceso"; }).length;
    var ordenesCompletadas = ordenes.filter(function(o) { return o.estado === "completada"; }).length;

    // Solicitudes KPIs
    var solicitudesPendientes = solicitudes.filter(function(s) { return s.estado === "pendiente"; }).length;

    // Costos KPIs
    var costoTotal = costos.reduce(function(sum, c) { return sum + (Number(c.monto) || 0); }, 0);

    // Inventario bajo stock
    var itemsBajoStock = inventario.filter(function(i) {
      return (Number(i.stockActual) || 0) <= (Number(i.stockMinimo) || 0);
    }).length;

    // Cumplimiento preventivo
    var planesActivos   = planes.filter(function(p) { return p.estado === "activo"; }).length;
    var cumplimientoPct = planesActivos > 0
      ? Math.round(planes.reduce(function(sum, p) { return sum + (Number(p.cumplimientoPct) || 0); }, 0) / planesActivos)
      : 0;

    return {
      activos: {
        total:       totalActivos,
        operativos:  activosOperativos,
        inactivos:   activosInactivos,
        enManto:     activosEnManto,
      },
      ordenes: {
        total:       totalOrdenes,
        abiertas:    ordenesAbiertas,
        enProceso:   ordenesEnProceso,
        completadas: ordenesCompletadas,
      },
      solicitudes: {
        pendientes: solicitudesPendientes,
      },
      inspecciones: {
        total: inspecciones.length,
      },
      costos: {
        total: costoTotal,
      },
      inventario: {
        itemsBajoStock: itemsBajoStock,
      },
      preventivo: {
        planesActivos:   planesActivos,
        cumplimientoPct: cumplimientoPct,
      },
    };
  }

  function reporteEstadoActivos(params) {
    var wsId = params.wsId || MANTO_WS_ID;
    var activos = (listEntities_("mantoActivos", { wsId: wsId }).items || []);
    var porEstado = {};
    activos.forEach(function(a) {
      porEstado[a.estado] = (porEstado[a.estado] || 0) + 1;
    });
    return { rows: activos, total: activos.length, porEstado: porEstado };
  }

  function reporteOrdenesPeriodo(params) {
    var wsId = params.wsId || MANTO_WS_ID;
    var ordenes = (listEntities_("mantoOrdenesTrabajo", { wsId: wsId }).items || []);
    if (params.desde) {
      ordenes = ordenes.filter(function(o) { return o.fechaEmision >= params.desde; });
    }
    if (params.hasta) {
      ordenes = ordenes.filter(function(o) { return o.fechaEmision <= params.hasta; });
    }
    var costoTotal = ordenes.reduce(function(sum, o) { return sum + (Number(o.costoTotal) || 0); }, 0);
    return { rows: ordenes, total: ordenes.length, costoTotal: costoTotal };
  }

  function reporteCostosActivo(params) {
    Validator.requireFields(params, ["activoId"]);
    var wsId    = params.wsId    || MANTO_WS_ID;
    var activoId = params.activoId;
    var costos  = (listEntities_("mantoCostos", { wsId: wsId, activoId: activoId }).items || []);
    var total   = costos.reduce(function(sum, c) { return sum + (Number(c.monto) || 0); }, 0);
    return { rows: costos, total: costos.length, montoTotal: total, activoId: activoId };
  }

  function reporteCumplimientoPreventivo(params) {
    var wsId   = params.wsId || MANTO_WS_ID;
    var planes = (listEntities_("mantoPlanes", { wsId: wsId }).items || []);
    var activos = planes.filter(function(p) { return p.estado === "activo"; });
    var cumplimiento = activos.length > 0
      ? Math.round(activos.reduce(function(sum, p) { return sum + (Number(p.cumplimientoPct) || 0); }, 0) / activos.length)
      : 0;
    return { rows: planes, total: planes.length, planesActivos: activos.length, cumplimientoPct: cumplimiento };
  }

  function reporteOrdenesTecnico(params) {
    Validator.requireFields(params, ["tecnicoId"]);
    var wsId     = params.wsId || MANTO_WS_ID;
    var tecnicoId = params.tecnicoId;
    var ordenes  = (listEntities_("mantoOrdenesTrabajo", { wsId: wsId, tecnicoAsignadoId: tecnicoId }).items || []);
    var completadas = ordenes.filter(function(o) { return o.estado === "completada"; }).length;
    var horasTotal  = ordenes.reduce(function(sum, o) { return sum + (Number(o.horasReales) || 0); }, 0);
    return { rows: ordenes, total: ordenes.length, completadas: completadas, horasTotal: horasTotal, tecnicoId: tecnicoId };
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  return {
    // Activos
    listActivos:      listActivos,
    getActivo:        getActivo,
    createActivo:     createActivo,
    updateActivo:     updateActivo,
    cambiarEstadoActivo: cambiarEstadoActivo,
    darBajaActivo:    darBajaActivo,
    // Ubicaciones
    listUbicaciones:  listUbicaciones,
    getUbicacion:     getUbicacion,
    createUbicacion:  createUbicacion,
    updateUbicacion:  updateUbicacion,
    // Planes
    listPlanes:       listPlanes,
    getPlan:          getPlan,
    createPlan:       createPlan,
    updatePlan:       updatePlan,
    activarPlan:      activarPlan,
    // Solicitudes
    listSolicitudes:  listSolicitudes,
    getSolicitud:     getSolicitud,
    createSolicitud:  createSolicitud,
    updateSolicitud:  updateSolicitud,
    aprobarSolicitud: aprobarSolicitud,
    // Órdenes de Trabajo
    listOrdenes:      listOrdenes,
    getOrden:         getOrden,
    createOrden:      createOrden,
    updateOrden:      updateOrden,
    asignarTecnico:   asignarTecnico,
    cerrarOrden:      cerrarOrden,
    cancelarOrden:    cancelarOrden,
    // Inspecciones
    listInspecciones: listInspecciones,
    getInspeccion:    getInspeccion,
    createInspeccion: createInspeccion,
    updateInspeccion: updateInspeccion,
    cerrarInspeccion: cerrarInspeccion,
    // Historial
    listHistorial:    listHistorial,
    getHistorialItem: getHistorialItem,
    createHistorial:  createHistorial,
    // Costos
    listCostos:       listCostos,
    getCosto:         getCosto,
    createCosto:      createCosto,
    updateCosto:      updateCosto,
    // Inventario Técnico
    listInventario:       listInventario,
    getInventarioItem:    getInventarioItem,
    createInventarioItem: createInventarioItem,
    updateInventarioItem: updateInventarioItem,
    // Dashboard y Reportes
    getDashboardResumen:           getDashboardResumen,
    reporteEstadoActivos:          reporteEstadoActivos,
    reporteOrdenesPeriodo:         reporteOrdenesPeriodo,
    reporteCostosActivo:           reporteCostosActivo,
    reporteCumplimientoPreventivo: reporteCumplimientoPreventivo,
    reporteOrdenesTecnico:         reporteOrdenesTecnico,
  };

})();

// ── Action Router ────────────────────────────────────────────────────────────

function routeMantenimientoAction_(verb, params, context) {
  switch (verb) {
    // Activos
    case "listActivos":          return MantenimientoController.listActivos(params);
    case "getActivo":            return MantenimientoController.getActivo(params);
    case "createActivo":         return MantenimientoController.createActivo(params);
    case "updateActivo":         return MantenimientoController.updateActivo(params);
    case "cambiarEstadoActivo":  return MantenimientoController.cambiarEstadoActivo(params);
    case "darBajaActivo":        return MantenimientoController.darBajaActivo(params);
    // Ubicaciones
    case "listUbicaciones":      return MantenimientoController.listUbicaciones(params);
    case "getUbicacion":         return MantenimientoController.getUbicacion(params);
    case "createUbicacion":      return MantenimientoController.createUbicacion(params);
    case "updateUbicacion":      return MantenimientoController.updateUbicacion(params);
    // Planes
    case "listPlanes":           return MantenimientoController.listPlanes(params);
    case "getPlan":              return MantenimientoController.getPlan(params);
    case "createPlan":           return MantenimientoController.createPlan(params);
    case "updatePlan":           return MantenimientoController.updatePlan(params);
    case "activarPlan":          return MantenimientoController.activarPlan(params);
    // Solicitudes
    case "listSolicitudes":      return MantenimientoController.listSolicitudes(params);
    case "getSolicitud":         return MantenimientoController.getSolicitud(params);
    case "createSolicitud":      return MantenimientoController.createSolicitud(params);
    case "updateSolicitud":      return MantenimientoController.updateSolicitud(params);
    case "aprobarSolicitud":     return MantenimientoController.aprobarSolicitud(params);
    // Órdenes de Trabajo
    case "listOrdenes":          return MantenimientoController.listOrdenes(params);
    case "getOrden":             return MantenimientoController.getOrden(params);
    case "createOrden":          return MantenimientoController.createOrden(params);
    case "updateOrden":          return MantenimientoController.updateOrden(params);
    case "asignarTecnico":       return MantenimientoController.asignarTecnico(params);
    case "cerrarOrden":          return MantenimientoController.cerrarOrden(params);
    case "cancelarOrden":        return MantenimientoController.cancelarOrden(params);
    // Inspecciones
    case "listInspecciones":     return MantenimientoController.listInspecciones(params);
    case "getInspeccion":        return MantenimientoController.getInspeccion(params);
    case "createInspeccion":     return MantenimientoController.createInspeccion(params);
    case "updateInspeccion":     return MantenimientoController.updateInspeccion(params);
    case "cerrarInspeccion":     return MantenimientoController.cerrarInspeccion(params);
    // Historial
    case "listHistorial":        return MantenimientoController.listHistorial(params);
    case "getHistorialItem":     return MantenimientoController.getHistorialItem(params);
    case "createHistorial":      return MantenimientoController.createHistorial(params);
    // Costos
    case "listCostos":           return MantenimientoController.listCostos(params);
    case "getCosto":             return MantenimientoController.getCosto(params);
    case "createCosto":          return MantenimientoController.createCosto(params);
    case "updateCosto":          return MantenimientoController.updateCosto(params);
    // Inventario Técnico
    case "listInventario":           return MantenimientoController.listInventario(params);
    case "getInventarioItem":        return MantenimientoController.getInventarioItem(params);
    case "createInventarioItem":     return MantenimientoController.createInventarioItem(params);
    case "updateInventarioItem":     return MantenimientoController.updateInventarioItem(params);
    // Dashboard y Reportes
    case "getDashboardResumen":           return MantenimientoController.getDashboardResumen(params);
    case "reporteEstadoActivos":          return MantenimientoController.reporteEstadoActivos(params);
    case "reporteOrdenesPeriodo":         return MantenimientoController.reporteOrdenesPeriodo(params);
    case "reporteCostosActivo":           return MantenimientoController.reporteCostosActivo(params);
    case "reporteCumplimientoPreventivo": return MantenimientoController.reporteCumplimientoPreventivo(params);
    case "reporteOrdenesTecnico":         return MantenimientoController.reporteOrdenesTecnico(params);

    default:
      throw new Error("MantenimientoController: unknown verb '" + verb + "'");
  }
}
