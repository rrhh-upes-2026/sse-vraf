/**
 * ComprasController — Compras y Adquisiciones operations.
 *
 * Scopes all queries to wsId = "compras" and orchestrates purchasing
 * business logic. Persistence delegates to the generic SheetRepository
 * via the compras entity schemas (comprasSolicitudes, comprasRequisiciones,
 * comprasCotizaciones, comprasProveedores, comprasOrdenes, comprasRecepciones,
 * comprasEvaluaciones).
 */
var ComprasController = (function () {

  var COMPRAS_WS_ID = "compras";

  // ── Solicitudes ──────────────────────────────────────────────────────────────

  function listSolicitudes(params) {
    var filter = { wsId: params.wsId || COMPRAS_WS_ID };
    if (params.estado)      filter.estado      = params.estado;
    if (params.prioridad)   filter.prioridad   = params.prioridad;
    if (params.etapaActual) filter.etapaActual = params.etapaActual;
    var result = listEntities_("comprasSolicitudes", filter);
    return result.items || [];
  }

  function getSolicitud(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("comprasSolicitudes", params.id);
  }

  function createSolicitud(params) {
    Validator.requireFields(params, ["titulo", "tipo"]);
    AppLogger.info("ComprasController.createSolicitud", { titulo: params.titulo, tipo: params.tipo });
    var now = new Date().toISOString();
    var data = Object.assign({
      descripcion:       "",
      solicitanteId:     "",
      unidadSolicitante: "",
      prioridad:         "normal",
      estado:            "pendiente",
      etapaActual:       "solicitud",
      requisicionId:     "",
      monto:             0,
      montoAprobado:     0,
      fechaRequerida:    "",
      notas:             "",
      dataJson:          "",
      createdBy:         "",
      deletedAt:         "",
    }, params, {
      id:            IdGen.uuid(),
      wsId:          params.wsId || COMPRAS_WS_ID,
      fechaSolicitud: now,
      createdAt:     now,
      updatedAt:     now,
    });
    createEntity_("comprasSolicitudes", data);
    return data;
  }

  function updateSolicitud(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: new Date().toISOString() });
    delete patch.id;
    return updateEntity_("comprasSolicitudes", params.id, patch);
  }

  function cambiarEstadoSolicitud(params) {
    Validator.requireFields(params, ["id", "estado"]);
    AppLogger.info("ComprasController.cambiarEstadoSolicitud", { id: params.id, estado: params.estado });
    var now = new Date().toISOString();
    var patch = {
      estado:      params.estado,
      updatedAt:   now,
    };
    if (params.etapaActual) patch.etapaActual = params.etapaActual;
    return updateEntity_("comprasSolicitudes", params.id, patch);
  }

  function archivarSolicitud(params) {
    Validator.requireFields(params, ["id"]);
    AppLogger.info("ComprasController.archivarSolicitud", { id: params.id });
    var now = new Date().toISOString();
    return updateEntity_("comprasSolicitudes", params.id, {
      estado:    "archivada",
      deletedAt: now,
      updatedAt: now,
    });
  }

  // ── Requisiciones ────────────────────────────────────────────────────────────

  function listRequisiciones(params) {
    var filter = { wsId: params.wsId || COMPRAS_WS_ID };
    if (params.solicitudId) filter.solicitudId = params.solicitudId;
    if (params.estado)      filter.estado      = params.estado;
    var result = listEntities_("comprasRequisiciones", filter);
    return result.items || [];
  }

  function getRequisicion(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("comprasRequisiciones", params.id);
  }

  function createRequisicion(params) {
    Validator.requireFields(params, ["solicitudId", "descripcion"]);
    AppLogger.info("ComprasController.createRequisicion", { solicitudId: params.solicitudId });
    var now = new Date().toISOString();
    var data = Object.assign({
      codigo:               "",
      especificaciones:     "",
      cantidad:             1,
      unidadMedida:         "",
      presupuestoEstimado:  0,
      cuentaPresupuestal:   "",
      estado:               "borrador",
      aprobadoPorId:        "",
      fechaAprobacion:      "",
      cotizacionId:         "",
      dataJson:             "",
      createdBy:            "",
      deletedAt:            "",
    }, params, {
      id:        IdGen.uuid(),
      wsId:      params.wsId || COMPRAS_WS_ID,
      createdAt: now,
      updatedAt: now,
    });
    createEntity_("comprasRequisiciones", data);
    return data;
  }

  function updateRequisicion(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: new Date().toISOString() });
    delete patch.id;
    return updateEntity_("comprasRequisiciones", params.id, patch);
  }

  function aprobarRequisicion(params) {
    Validator.requireFields(params, ["id", "aprobadoPorId"]);
    AppLogger.info("ComprasController.aprobarRequisicion", { id: params.id, aprobadoPorId: params.aprobadoPorId });
    var now = new Date().toISOString();
    return updateEntity_("comprasRequisiciones", params.id, {
      estado:          "aprobada",
      aprobadoPorId:   params.aprobadoPorId,
      fechaAprobacion: now,
      updatedAt:       now,
    });
  }

  // ── Cotizaciones ─────────────────────────────────────────────────────────────

  function listCotizaciones(params) {
    var filter = { wsId: params.wsId || COMPRAS_WS_ID };
    if (params.requisicionId) filter.requisicionId = params.requisicionId;
    if (params.proveedorId)   filter.proveedorId   = params.proveedorId;
    if (params.estado)        filter.estado        = params.estado;
    var result = listEntities_("comprasCotizaciones", filter);
    return result.items || [];
  }

  function getCotizacion(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("comprasCotizaciones", params.id);
  }

  function createCotizacion(params) {
    Validator.requireFields(params, ["requisicionId", "proveedorId", "monto"]);
    AppLogger.info("ComprasController.createCotizacion", { requisicionId: params.requisicionId, proveedorId: params.proveedorId });
    var now = new Date().toISOString();
    var data = Object.assign({
      codigoCotizacion:  "",
      moneda:            "USD",
      plazoEntregaDias:  0,
      formaPago:         "",
      garantia:          "",
      vigenciaDias:      30,
      estado:            "pendiente",
      seleccionada:      false,
      notasTecnicas:     "",
      notasEvaluacion:   "",
      dataJson:          "",
      createdBy:         "",
      deletedAt:         "",
    }, params, {
      id:        IdGen.uuid(),
      wsId:      params.wsId || COMPRAS_WS_ID,
      createdAt: now,
      updatedAt: now,
    });
    createEntity_("comprasCotizaciones", data);
    return data;
  }

  function updateCotizacion(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: new Date().toISOString() });
    delete patch.id;
    return updateEntity_("comprasCotizaciones", params.id, patch);
  }

  function seleccionarCotizacion(params) {
    Validator.requireFields(params, ["id"]);
    AppLogger.info("ComprasController.seleccionarCotizacion", { id: params.id });
    var now = new Date().toISOString();

    // Retrieve the target cotizacion to get its requisicionId
    var cotizacion = getEntity_("comprasCotizaciones", params.id);
    if (!cotizacion) throw new Error("Cotizacion " + params.id + " no encontrada");
    var requisicionId = cotizacion.requisicionId;

    // Mark selected cotizacion as seleccionada
    updateEntity_("comprasCotizaciones", params.id, {
      seleccionada: true,
      estado:       "seleccionada",
      updatedAt:    now,
    });

    // Unmark all other cotizaciones for the same requisicion
    var otras = listEntities_("comprasCotizaciones", { requisicionId: requisicionId });
    var items = otras.items || [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].id !== params.id) {
        updateEntity_("comprasCotizaciones", items[i].id, {
          seleccionada: false,
          updatedAt:    now,
        });
      }
    }

    return { id: params.id, seleccionada: true, requisicionId: requisicionId };
  }

  // ── Proveedores ──────────────────────────────────────────────────────────────

  function listProveedores(params) {
    var filter = { wsId: params.wsId || COMPRAS_WS_ID };
    if (params.estado)    filter.estado    = params.estado;
    if (params.categoria) filter.categoria = params.categoria;
    var result = listEntities_("comprasProveedores", filter);
    return result.items || [];
  }

  function getProveedor(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("comprasProveedores", params.id);
  }

  function createProveedor(params) {
    Validator.requireFields(params, ["razonSocial"]);
    AppLogger.info("ComprasController.createProveedor", { razonSocial: params.razonSocial });
    var now = new Date().toISOString();
    var data = Object.assign({
      nombreComercial:  "",
      nit:              "",
      nrc:              "",
      tipoProveedor:    "",
      categoria:        "",
      contactoNombre:   "",
      contactoEmail:    "",
      contactoTel:      "",
      direccion:        "",
      pais:             "",
      calificacion:     "",
      estado:           "activo",
      observaciones:    "",
      ultimaCompraFecha: "",
      totalCompras:     0,
      cantidadOrdenes:  0,
      dataJson:         "",
      createdBy:        "",
      deletedAt:        "",
    }, params, {
      id:        IdGen.uuid(),
      wsId:      params.wsId || COMPRAS_WS_ID,
      createdAt: now,
      updatedAt: now,
    });
    createEntity_("comprasProveedores", data);
    return data;
  }

  function updateProveedor(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: new Date().toISOString() });
    delete patch.id;
    return updateEntity_("comprasProveedores", params.id, patch);
  }

  // ── Órdenes de Compra ────────────────────────────────────────────────────────

  function listOrdenes(params) {
    var filter = { wsId: params.wsId || COMPRAS_WS_ID };
    if (params.estado)       filter.estado       = params.estado;
    if (params.proveedorId)  filter.proveedorId  = params.proveedorId;
    if (params.requisicionId) filter.requisicionId = params.requisicionId;
    var result = listEntities_("comprasOrdenes", filter);
    return result.items || [];
  }

  function getOrden(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("comprasOrdenes", params.id);
  }

  function createOrden(params) {
    Validator.requireFields(params, ["requisicionId", "proveedorId", "monto"]);
    AppLogger.info("ComprasController.createOrden", { requisicionId: params.requisicionId, proveedorId: params.proveedorId });
    var now = new Date().toISOString();
    var data = Object.assign({
      codigo:                   "",
      cotizacionSeleccionadaId: "",
      moneda:                   "USD",
      plazoEntregaDias:         0,
      fechaEmision:             now,
      fechaEntregaEsperada:     "",
      fechaEntregaReal:         "",
      estado:                   "borrador",
      autorizadoPorId:          "",
      fechaAutorizacion:        "",
      formaPago:                "",
      terminosEntrega:          "",
      facturaNro:               "",
      montoFactura:             0,
      fechaFactura:             "",
      dataJson:                 "",
      createdBy:                "",
      deletedAt:                "",
    }, params, {
      id:        IdGen.uuid(),
      wsId:      params.wsId || COMPRAS_WS_ID,
      createdAt: now,
      updatedAt: now,
    });
    createEntity_("comprasOrdenes", data);
    return data;
  }

  function updateOrden(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: new Date().toISOString() });
    delete patch.id;
    return updateEntity_("comprasOrdenes", params.id, patch);
  }

  function autorizarOrden(params) {
    Validator.requireFields(params, ["id", "autorizadoPorId"]);
    AppLogger.info("ComprasController.autorizarOrden", { id: params.id, autorizadoPorId: params.autorizadoPorId });
    var now = new Date().toISOString();
    return updateEntity_("comprasOrdenes", params.id, {
      estado:           "emitida",
      autorizadoPorId:  params.autorizadoPorId,
      fechaAutorizacion: now,
      updatedAt:        now,
    });
  }

  function cancelarOrden(params) {
    Validator.requireFields(params, ["id"]);
    AppLogger.info("ComprasController.cancelarOrden", { id: params.id });
    var now = new Date().toISOString();
    return updateEntity_("comprasOrdenes", params.id, {
      estado:    "cancelada",
      updatedAt: now,
    });
  }

  // ── Recepciones ──────────────────────────────────────────────────────────────

  function listRecepciones(params) {
    var filter = { wsId: params.wsId || COMPRAS_WS_ID };
    if (params.ordenId) filter.ordenId = params.ordenId;
    if (params.estado)  filter.estado  = params.estado;
    var result = listEntities_("comprasRecepciones", filter);
    return result.items || [];
  }

  function getRecepcion(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("comprasRecepciones", params.id);
  }

  function createRecepcion(params) {
    Validator.requireFields(params, ["ordenId", "cantidadRecibida"]);
    AppLogger.info("ComprasController.createRecepcion", { ordenId: params.ordenId });
    var now = new Date().toISOString();
    var data = Object.assign({
      codigo:            "",
      cantidadSolicitada: 0,
      unidadMedida:      "",
      condicion:         "bueno",
      observaciones:     "",
      receptorId:        "",
      fechaRecepcion:    now,
      actaRecepcionId:   "",
      estado:            "recibido",
      dataJson:          "",
      createdBy:         "",
      deletedAt:         "",
    }, params, {
      id:        IdGen.uuid(),
      wsId:      params.wsId || COMPRAS_WS_ID,
      createdAt: now,
      updatedAt: now,
    });
    createEntity_("comprasRecepciones", data);
    return data;
  }

  function updateRecepcion(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: new Date().toISOString() });
    delete patch.id;
    return updateEntity_("comprasRecepciones", params.id, patch);
  }

  // ── Evaluaciones de Proveedor ────────────────────────────────────────────────

  function listEvaluaciones(params) {
    var filter = { wsId: params.wsId || COMPRAS_WS_ID };
    if (params.proveedorId) filter.proveedorId = params.proveedorId;
    if (params.ordenId)     filter.ordenId     = params.ordenId;
    var result = listEntities_("comprasEvaluaciones", filter);
    return result.items || [];
  }

  function getEvaluacion(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("comprasEvaluaciones", params.id);
  }

  function createEvaluacion(params) {
    Validator.requireFields(params, ["proveedorId", "ordenId", "evaluadorId"]);
    AppLogger.info("ComprasController.createEvaluacion", { proveedorId: params.proveedorId, ordenId: params.ordenId });
    var now = new Date().toISOString();

    var calidadPuntaje              = parseFloat(params.calidadPuntaje              || 0);
    var tiempoEntregaPuntaje        = parseFloat(params.tiempoEntregaPuntaje        || 0);
    var cumplimientoPuntaje         = parseFloat(params.cumplimientoPuntaje         || 0);
    var comunicacionPuntaje         = parseFloat(params.comunicacionPuntaje         || 0);
    var precioCompetitividadPuntaje = parseFloat(params.precioCompetitividadPuntaje || 0);

    var puntajeTotal = (calidadPuntaje + tiempoEntregaPuntaje + cumplimientoPuntaje +
                        comunicacionPuntaje + precioCompetitividadPuntaje) / 5;
    puntajeTotal = Math.round(puntajeTotal * 10) / 10;

    var calificacionGlobal;
    if (puntajeTotal >= 90) {
      calificacionGlobal = "A";
    } else if (puntajeTotal >= 70) {
      calificacionGlobal = "B";
    } else if (puntajeTotal >= 50) {
      calificacionGlobal = "C";
    } else {
      calificacionGlobal = "D";
    }

    var data = Object.assign({
      periodo:                    "",
      recomendacion:              "",
      observaciones:              "",
      calidadPuntaje:             0,
      tiempoEntregaPuntaje:       0,
      cumplimientoPuntaje:        0,
      comunicacionPuntaje:        0,
      precioCompetitividadPuntaje: 0,
      dataJson:                   "",
      createdBy:                  "",
    }, params, {
      id:                         IdGen.uuid(),
      wsId:                       params.wsId || COMPRAS_WS_ID,
      calidadPuntaje:             calidadPuntaje,
      tiempoEntregaPuntaje:       tiempoEntregaPuntaje,
      cumplimientoPuntaje:        cumplimientoPuntaje,
      comunicacionPuntaje:        comunicacionPuntaje,
      precioCompetitividadPuntaje: precioCompetitividadPuntaje,
      puntajeTotal:               puntajeTotal,
      calificacionGlobal:         calificacionGlobal,
      createdAt:                  now,
      updatedAt:                  now,
    });
    createEntity_("comprasEvaluaciones", data);
    return data;
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────

  function getDashboardResumen(params) {
    var wsId = params.wsId || COMPRAS_WS_ID;
    AppLogger.info("ComprasController.getDashboardResumen", { wsId: wsId });

    var solicitudesResult   = listEntities_("comprasSolicitudes",   { wsId: wsId });
    var ordenesResult       = listEntities_("comprasOrdenes",       { wsId: wsId });
    var proveedoresResult   = listEntities_("comprasProveedores",   { wsId: wsId });
    var cotizacionesResult  = listEntities_("comprasCotizaciones",  { wsId: wsId });
    var requisicionesResult = listEntities_("comprasRequisiciones", { wsId: wsId });
    var recepcionesResult   = listEntities_("comprasRecepciones",   { wsId: wsId });

    var solicitudes   = solicitudesResult.items   || [];
    var ordenes       = ordenesResult.items       || [];
    var proveedores   = proveedoresResult.items   || [];
    var cotizaciones  = cotizacionesResult.items  || [];
    var requisiciones = requisicionesResult.items || [];
    var recepciones   = recepcionesResult.items   || [];

    var solicitudesActivas  = 0;
    var solicitudesUrgentes = 0;
    for (var i = 0; i < solicitudes.length; i++) {
      if (solicitudes[i].estado !== "archivada") solicitudesActivas++;
      if (solicitudes[i].prioridad === "urgente") solicitudesUrgentes++;
    }

    var ordenesAbiertas  = 0;
    var ordenesCerradas  = 0;
    var montoEjecutado   = 0;
    for (var j = 0; j < ordenes.length; j++) {
      var est = ordenes[j].estado;
      if (est === "borrador" || est === "emitida") {
        ordenesAbiertas++;
      }
      if (est === "recibida" || est === "pagada") {
        ordenesCerradas++;
        montoEjecutado += parseFloat(ordenes[j].monto || 0);
      }
    }

    var proveedoresActivos = 0;
    for (var k = 0; k < proveedores.length; k++) {
      if (proveedores[k].estado === "activo") proveedoresActivos++;
    }

    var cotizacionesPendientes = 0;
    for (var l = 0; l < cotizaciones.length; l++) {
      if (cotizaciones[l].estado === "pendiente") cotizacionesPendientes++;
    }

    return {
      solicitudesActivas:     solicitudesActivas,
      solicitudesUrgentes:    solicitudesUrgentes,
      ordenesAbiertas:        ordenesAbiertas,
      ordenesCerradas:        ordenesCerradas,
      proveedoresActivos:     proveedoresActivos,
      cotizacionesPendientes: cotizacionesPendientes,
      montoEjecutado:         Math.round(montoEjecutado * 100) / 100,
      totalSolicitudes:       solicitudes.length,
      totalRequisiciones:     requisiciones.length,
      totalCotizaciones:      cotizaciones.length,
      totalOrdenes:           ordenes.length,
      totalRecepciones:       recepciones.length,
      totalProveedores:       proveedores.length,
    };
  }

  // ── Reportes ─────────────────────────────────────────────────────────────────

  function reporteComprasPeriodo(params) {
    var wsId  = params.wsId  || COMPRAS_WS_ID;
    var desde = params.desde || "";
    var hasta = params.hasta || "";
    AppLogger.info("ComprasController.reporteComprasPeriodo", { wsId: wsId, desde: desde, hasta: hasta });

    var ordenesResult = listEntities_("comprasOrdenes", { wsId: wsId });
    var ordenes = ordenesResult.items || [];

    var filtered    = [];
    var totalMonto  = 0;
    for (var i = 0; i < ordenes.length; i++) {
      var fecha = ordenes[i].fechaEmision || "";
      if (desde && fecha < desde) continue;
      if (hasta && fecha > hasta) continue;
      filtered.push(ordenes[i]);
      totalMonto += parseFloat(ordenes[i].monto || 0);
    }

    // Group by estado
    var porEstado = {};
    for (var j = 0; j < filtered.length; j++) {
      var est = filtered[j].estado || "sin_estado";
      if (!porEstado[est]) porEstado[est] = { count: 0, monto: 0 };
      porEstado[est].count++;
      porEstado[est].monto += parseFloat(filtered[j].monto || 0);
    }

    // Group by proveedorId
    var porProveedor = {};
    for (var m = 0; m < filtered.length; m++) {
      var pid = filtered[m].proveedorId || "sin_proveedor";
      if (!porProveedor[pid]) porProveedor[pid] = { count: 0, monto: 0 };
      porProveedor[pid].count++;
      porProveedor[pid].monto += parseFloat(filtered[m].monto || 0);
    }

    return {
      periodo:      { desde: desde, hasta: hasta },
      totalOrdenes: filtered.length,
      totalMonto:   Math.round(totalMonto * 100) / 100,
      porEstado:    porEstado,
      porProveedor: porProveedor,
      ordenes:      filtered,
    };
  }

  function reporteProveedores(params) {
    var wsId = params.wsId || COMPRAS_WS_ID;
    AppLogger.info("ComprasController.reporteProveedores", { wsId: wsId });

    var proveedoresResult   = listEntities_("comprasProveedores",   { wsId: wsId });
    var ordenesResult       = listEntities_("comprasOrdenes",       { wsId: wsId });
    var evaluacionesResult  = listEntities_("comprasEvaluaciones",  { wsId: wsId });

    var proveedores  = proveedoresResult.items  || [];
    var ordenes      = ordenesResult.items      || [];
    var evaluaciones = evaluacionesResult.items || [];

    // Index ordenes by proveedorId
    var ordenesPorProveedor = {};
    for (var i = 0; i < ordenes.length; i++) {
      var pid = ordenes[i].proveedorId;
      if (!ordenesPorProveedor[pid]) ordenesPorProveedor[pid] = [];
      ordenesPorProveedor[pid].push(ordenes[i]);
    }

    // Index evaluaciones by proveedorId
    var evalsPorProveedor = {};
    for (var j = 0; j < evaluaciones.length; j++) {
      var eid = evaluaciones[j].proveedorId;
      if (!evalsPorProveedor[eid]) evalsPorProveedor[eid] = [];
      evalsPorProveedor[eid].push(evaluaciones[j]);
    }

    var resultado = [];
    for (var k = 0; k < proveedores.length; k++) {
      var proveedor       = proveedores[k];
      var ordsProveedor   = ordenesPorProveedor[proveedor.id] || [];
      var evalsProveedor  = evalsPorProveedor[proveedor.id]   || [];

      var puntajePromedio = 0;
      if (evalsProveedor.length > 0) {
        var sumPuntaje = 0;
        for (var l = 0; l < evalsProveedor.length; l++) {
          sumPuntaje += parseFloat(evalsProveedor[l].puntajeTotal || 0);
        }
        puntajePromedio = Math.round(sumPuntaje / evalsProveedor.length * 10) / 10;
      }

      var montoTotal = 0;
      for (var m = 0; m < ordsProveedor.length; m++) {
        montoTotal += parseFloat(ordsProveedor[m].monto || 0);
      }

      resultado.push({
        id:                   proveedor.id,
        razonSocial:          proveedor.razonSocial,
        nombreComercial:      proveedor.nombreComercial,
        estado:               proveedor.estado,
        calificacion:         proveedor.calificacion,
        cantidadOrdenes:      ordsProveedor.length,
        montoTotal:           Math.round(montoTotal * 100) / 100,
        cantidadEvaluaciones: evalsProveedor.length,
        puntajePromedio:      puntajePromedio,
      });
    }

    return {
      totalProveedores: proveedores.length,
      proveedores:      resultado,
    };
  }

  // ── Public API ────────────────────────────────────────────────────────────────

  return {
    listSolicitudes:        listSolicitudes,
    getSolicitud:           getSolicitud,
    createSolicitud:        createSolicitud,
    updateSolicitud:        updateSolicitud,
    cambiarEstadoSolicitud: cambiarEstadoSolicitud,
    archivarSolicitud:      archivarSolicitud,
    listRequisiciones:      listRequisiciones,
    getRequisicion:         getRequisicion,
    createRequisicion:      createRequisicion,
    updateRequisicion:      updateRequisicion,
    aprobarRequisicion:     aprobarRequisicion,
    listCotizaciones:       listCotizaciones,
    getCotizacion:          getCotizacion,
    createCotizacion:       createCotizacion,
    updateCotizacion:       updateCotizacion,
    seleccionarCotizacion:  seleccionarCotizacion,
    listProveedores:        listProveedores,
    getProveedor:           getProveedor,
    createProveedor:        createProveedor,
    updateProveedor:        updateProveedor,
    listOrdenes:            listOrdenes,
    getOrden:               getOrden,
    createOrden:            createOrden,
    updateOrden:            updateOrden,
    autorizarOrden:         autorizarOrden,
    cancelarOrden:          cancelarOrden,
    listRecepciones:        listRecepciones,
    getRecepcion:           getRecepcion,
    createRecepcion:        createRecepcion,
    updateRecepcion:        updateRecepcion,
    listEvaluaciones:       listEvaluaciones,
    getEvaluacion:          getEvaluacion,
    createEvaluacion:       createEvaluacion,
    getDashboardResumen:    getDashboardResumen,
    reporteComprasPeriodo:  reporteComprasPeriodo,
    reporteProveedores:     reporteProveedores,
  };

})();

/**
 * Route compras.* actions via OrgUnitRegistry.
 * Called by OrgUnitRegistry when namespace === "compras".
 */
function routeComprasAction_(verb, params, context) {
  switch (verb) {
    case "listSolicitudes":        return ComprasController.listSolicitudes(params);
    case "getSolicitud":           return ComprasController.getSolicitud(params);
    case "createSolicitud":        return ComprasController.createSolicitud(params);
    case "updateSolicitud":        return ComprasController.updateSolicitud(params);
    case "cambiarEstadoSolicitud": return ComprasController.cambiarEstadoSolicitud(params);
    case "archivarSolicitud":      return ComprasController.archivarSolicitud(params);
    case "listRequisiciones":      return ComprasController.listRequisiciones(params);
    case "getRequisicion":         return ComprasController.getRequisicion(params);
    case "createRequisicion":      return ComprasController.createRequisicion(params);
    case "updateRequisicion":      return ComprasController.updateRequisicion(params);
    case "aprobarRequisicion":     return ComprasController.aprobarRequisicion(params);
    case "listCotizaciones":       return ComprasController.listCotizaciones(params);
    case "getCotizacion":          return ComprasController.getCotizacion(params);
    case "createCotizacion":       return ComprasController.createCotizacion(params);
    case "updateCotizacion":       return ComprasController.updateCotizacion(params);
    case "seleccionarCotizacion":  return ComprasController.seleccionarCotizacion(params);
    case "listProveedores":        return ComprasController.listProveedores(params);
    case "getProveedor":           return ComprasController.getProveedor(params);
    case "createProveedor":        return ComprasController.createProveedor(params);
    case "updateProveedor":        return ComprasController.updateProveedor(params);
    case "listOrdenes":            return ComprasController.listOrdenes(params);
    case "getOrden":               return ComprasController.getOrden(params);
    case "createOrden":            return ComprasController.createOrden(params);
    case "updateOrden":            return ComprasController.updateOrden(params);
    case "autorizarOrden":         return ComprasController.autorizarOrden(params);
    case "cancelarOrden":          return ComprasController.cancelarOrden(params);
    case "listRecepciones":        return ComprasController.listRecepciones(params);
    case "getRecepcion":           return ComprasController.getRecepcion(params);
    case "createRecepcion":        return ComprasController.createRecepcion(params);
    case "updateRecepcion":        return ComprasController.updateRecepcion(params);
    case "listEvaluaciones":       return ComprasController.listEvaluaciones(params);
    case "getEvaluacion":          return ComprasController.getEvaluacion(params);
    case "createEvaluacion":       return ComprasController.createEvaluacion(params);
    case "getDashboardResumen":    return ComprasController.getDashboardResumen(params);
    case "reporteComprasPeriodo":  return ComprasController.reporteComprasPeriodo(params);
    case "reporteProveedores":     return ComprasController.reporteProveedores(params);
    default:
      throw new Error("Unknown compras verb: " + verb);
  }
}
