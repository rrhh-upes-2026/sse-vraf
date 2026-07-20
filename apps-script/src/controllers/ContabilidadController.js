/**
 * ContabilidadController — Contabilidad y Finanzas operations.
 *
 * Scopes all queries to wsId = "contabilidad" and orchestrates accounting
 * business logic. Persistence delegates to the generic SheetRepository via
 * the contabilidad entity schemas:
 *   contaCompromisos, contaRegistros, contaFacturas, contaPagos,
 *   contaConciliaciones, contaCuentasPagar, contaCuentasCobrar.
 *
 * Integration points with Compras (read-only, no data duplication):
 *   ordenCompraId  → comprasOrdenes.id
 *   recepcionId    → comprasRecepciones.id
 *   proveedorId    → comprasProveedores.id
 */
var ContabilidadController = (function () {

  var CONTA_WS_ID = "contabilidad";

  // ── Helpers ────────────────────────────────────────────────────────────────

  function nowIso_() { return new Date().toISOString(); }

  // ── Compromisos Presupuestarios ────────────────────────────────────────────

  function listCompromisos(params) {
    var filter = { wsId: params.wsId || CONTA_WS_ID };
    if (params.estado)          filter.estado          = params.estado;
    if (params.tipo)            filter.tipo            = params.tipo;
    if (params.centroCosto)     filter.centroCosto     = params.centroCosto;
    if (params.cuentaPresupuestal) filter.cuentaPresupuestal = params.cuentaPresupuestal;
    if (params.proveedorId)     filter.proveedorId     = params.proveedorId;
    if (params.ordenCompraId)   filter.ordenCompraId   = params.ordenCompraId;
    var result = listEntities_("contaCompromisos", filter);
    return result.items || [];
  }

  function getCompromiso(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("contaCompromisos", params.id);
  }

  function createCompromiso(params) {
    Validator.requireFields(params, ["concepto", "tipo", "monto"]);
    AppLogger.info("ContabilidadController.createCompromiso", { concepto: params.concepto, monto: params.monto });
    var now = nowIso_();
    var monto = Number(params.monto) || 0;
    var data = Object.assign({
      numero:             "",
      moneda:             "USD",
      cuentaPresupuestal: "",
      centroCosto:        "",
      partida:            "",
      estado:             "borrador",
      etapa:              "formulacion",
      ordenCompraId:      "",
      ordenCompraRef:     "",
      proveedorId:        "",
      proveedorRef:       "",
      fechaVencimiento:   "",
      montoEjecutado:     0,
      saldo:              monto,
      aprobadoPorId:      "",
      fechaAprobacion:    "",
      observaciones:      "",
      dataJson:           "",
      createdBy:          "",
      deletedAt:          "",
    }, params, {
      id:               IdGen.uuid(),
      wsId:             params.wsId || CONTA_WS_ID,
      monto:            monto,
      saldo:            monto - (Number(params.montoEjecutado) || 0),
      fechaCompromiso:  params.fechaCompromiso || now,
      createdAt:        now,
      updatedAt:        now,
    });
    createEntity_("contaCompromisos", data);
    return data;
  }

  function updateCompromiso(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("contaCompromisos", params.id, patch);
  }

  function aprobarCompromiso(params) {
    Validator.requireFields(params, ["id", "aprobadoPorId"]);
    AppLogger.info("ContabilidadController.aprobarCompromiso", { id: params.id });
    var now = nowIso_();
    return updateEntity_("contaCompromisos", params.id, {
      estado:          "comprometido",
      etapa:           "aprobacion",
      aprobadoPorId:   params.aprobadoPorId,
      fechaAprobacion: now,
      updatedAt:       now,
    });
  }

  function anularCompromiso(params) {
    Validator.requireFields(params, ["id"]);
    AppLogger.info("ContabilidadController.anularCompromiso", { id: params.id });
    return updateEntity_("contaCompromisos", params.id, {
      estado:    "anulado",
      updatedAt: nowIso_(),
    });
  }

  // ── Registros Contables ────────────────────────────────────────────────────

  function listRegistros(params) {
    var filter = { wsId: params.wsId || CONTA_WS_ID };
    if (params.tipo)       filter.tipo       = params.tipo;
    if (params.estado)     filter.estado     = params.estado;
    if (params.periodo)    filter.periodo    = params.periodo;
    if (params.centroCosto) filter.centroCosto = params.centroCosto;
    if (params.facturaId)  filter.facturaId  = params.facturaId;
    if (params.pagoId)     filter.pagoId     = params.pagoId;
    var result = listEntities_("contaRegistros", filter);
    return result.items || [];
  }

  function getRegistro(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("contaRegistros", params.id);
  }

  function createRegistro(params) {
    Validator.requireFields(params, ["tipo", "descripcion", "cuentaDebito", "cuentaCredito", "monto"]);
    AppLogger.info("ContabilidadController.createRegistro", { tipo: params.tipo, monto: params.monto });
    var now = nowIso_();
    var fechaAsiento = params.fechaAsiento || now;
    var periodo = params.periodo || fechaAsiento.substring(0, 7);
    var data = Object.assign({
      numero:        "",
      moneda:        "USD",
      centroCosto:   "",
      referenciaId:  "",
      referenciaDoc: "",
      estado:        "borrador",
      compromisoId:  "",
      facturaId:     "",
      pagoId:        "",
      dataJson:      "",
      createdBy:     "",
      deletedAt:     "",
    }, params, {
      id:          IdGen.uuid(),
      wsId:        params.wsId || CONTA_WS_ID,
      monto:       Number(params.monto) || 0,
      fechaAsiento: fechaAsiento,
      periodo:     periodo,
      createdAt:   now,
      updatedAt:   now,
    });
    createEntity_("contaRegistros", data);
    return data;
  }

  function updateRegistro(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("contaRegistros", params.id, patch);
  }

  function anularRegistro(params) {
    Validator.requireFields(params, ["id"]);
    AppLogger.info("ContabilidadController.anularRegistro", { id: params.id });
    return updateEntity_("contaRegistros", params.id, {
      estado:    "anulado",
      updatedAt: nowIso_(),
    });
  }

  // ── Facturas ───────────────────────────────────────────────────────────────

  function listFacturas(params) {
    var filter = { wsId: params.wsId || CONTA_WS_ID };
    if (params.estado)        filter.estado        = params.estado;
    if (params.tipo)          filter.tipo          = params.tipo;
    if (params.proveedorId)   filter.proveedorId   = params.proveedorId;
    if (params.ordenCompraId) filter.ordenCompraId = params.ordenCompraId;
    if (params.recepcionId)   filter.recepcionId   = params.recepcionId;
    var result = listEntities_("contaFacturas", filter);
    return result.items || [];
  }

  function getFactura(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("contaFacturas", params.id);
  }

  function createFactura(params) {
    Validator.requireFields(params, ["numero", "tipo", "proveedorId", "monto"]);
    AppLogger.info("ContabilidadController.createFactura", { numero: params.numero, monto: params.monto });
    var now = nowIso_();
    var monto      = Number(params.monto) || 0;
    var montoIva   = Number(params.montoIva) || 0;
    var montoTotal = Number(params.montoTotal) || (monto + montoIva);
    var data = Object.assign({
      serie:          "",
      proveedorRef:   "",
      ordenCompraId:  "",
      recepcionId:    "",
      fechaVencimiento: "",
      fechaRecepcion: "",
      moneda:         "USD",
      estado:         "pendiente",
      metodoPago:     "",
      cuentaPagarId:  "",
      compromisoId:   "",
      observaciones:  "",
      dataJson:       "",
      createdBy:      "",
      deletedAt:      "",
    }, params, {
      id:          IdGen.uuid(),
      wsId:        params.wsId || CONTA_WS_ID,
      monto:       monto,
      montoIva:    montoIva,
      montoTotal:  montoTotal,
      fechaFactura: params.fechaFactura || now,
      createdAt:   now,
      updatedAt:   now,
    });
    createEntity_("contaFacturas", data);
    return data;
  }

  function updateFactura(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("contaFacturas", params.id, patch);
  }

  function aprobarFactura(params) {
    Validator.requireFields(params, ["id"]);
    AppLogger.info("ContabilidadController.aprobarFactura", { id: params.id });
    return updateEntity_("contaFacturas", params.id, {
      estado:    "aprobada",
      updatedAt: nowIso_(),
    });
  }

  function rechazarFactura(params) {
    Validator.requireFields(params, ["id"]);
    AppLogger.info("ContabilidadController.rechazarFactura", { id: params.id });
    return updateEntity_("contaFacturas", params.id, {
      estado:       "rechazada",
      observaciones: params.observaciones || "",
      updatedAt:    nowIso_(),
    });
  }

  // ── Pagos ──────────────────────────────────────────────────────────────────

  function listPagos(params) {
    var filter = { wsId: params.wsId || CONTA_WS_ID };
    if (params.estado)      filter.estado      = params.estado;
    if (params.tipo)        filter.tipo        = params.tipo;
    if (params.facturaId)   filter.facturaId   = params.facturaId;
    if (params.proveedorId) filter.proveedorId = params.proveedorId;
    var result = listEntities_("contaPagos", filter);
    return result.items || [];
  }

  function getPago(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("contaPagos", params.id);
  }

  function createPago(params) {
    Validator.requireFields(params, ["tipo", "monto"]);
    AppLogger.info("ContabilidadController.createPago", { tipo: params.tipo, monto: params.monto });
    var now = nowIso_();
    var data = Object.assign({
      numeroPago:       "",
      facturaId:        "",
      proveedorId:      "",
      proveedorRef:     "",
      moneda:           "USD",
      estado:           "pendiente",
      fechaAprobacion:  "",
      fechaEjecucion:   "",
      aprobadoPorId:    "",
      ejecutadoPorId:   "",
      referenciaBancaria: "",
      cuentaBancaria:   "",
      concepto:         "",
      registroId:       "",
      dataJson:         "",
      createdBy:        "",
      deletedAt:        "",
    }, params, {
      id:             IdGen.uuid(),
      wsId:           params.wsId || CONTA_WS_ID,
      monto:          Number(params.monto) || 0,
      fechaSolicitud: params.fechaSolicitud || now,
      createdAt:      now,
      updatedAt:      now,
    });
    createEntity_("contaPagos", data);
    return data;
  }

  function updatePago(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("contaPagos", params.id, patch);
  }

  function aprobarPago(params) {
    Validator.requireFields(params, ["id", "aprobadoPorId"]);
    AppLogger.info("ContabilidadController.aprobarPago", { id: params.id });
    var now = nowIso_();
    return updateEntity_("contaPagos", params.id, {
      estado:          "aprobado",
      aprobadoPorId:   params.aprobadoPorId,
      fechaAprobacion: now,
      updatedAt:       now,
    });
  }

  function ejecutarPago(params) {
    Validator.requireFields(params, ["id", "ejecutadoPorId"]);
    AppLogger.info("ContabilidadController.ejecutarPago", { id: params.id });
    var now = nowIso_();
    var patch = {
      estado:            "ejecutado",
      ejecutadoPorId:    params.ejecutadoPorId,
      fechaEjecucion:    now,
      updatedAt:         now,
    };
    if (params.referenciaBancaria) patch.referenciaBancaria = params.referenciaBancaria;
    return updateEntity_("contaPagos", params.id, patch);
  }

  // ── Conciliaciones ─────────────────────────────────────────────────────────

  function listConciliaciones(params) {
    var filter = { wsId: params.wsId || CONTA_WS_ID };
    if (params.estado)  filter.estado  = params.estado;
    if (params.periodo) filter.periodo = params.periodo;
    if (params.cuenta)  filter.cuenta  = params.cuenta;
    var result = listEntities_("contaConciliaciones", filter);
    return result.items || [];
  }

  function getConciliacion(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("contaConciliaciones", params.id);
  }

  function createConciliacion(params) {
    Validator.requireFields(params, ["periodo", "cuenta"]);
    AppLogger.info("ContabilidadController.createConciliacion", { periodo: params.periodo, cuenta: params.cuenta });
    var now = nowIso_();
    var saldoBanco  = Number(params.saldoBanco) || 0;
    var saldoLibros = Number(params.saldoLibros) || 0;
    var data = Object.assign({
      banco:        "",
      estado:       "abierta",
      fechaCierre:  "",
      observaciones: "",
      dataJson:     "",
      createdBy:    "",
      deletedAt:    "",
    }, params, {
      id:           IdGen.uuid(),
      wsId:         params.wsId || CONTA_WS_ID,
      saldoBanco:   saldoBanco,
      saldoLibros:  saldoLibros,
      diferencia:   saldoBanco - saldoLibros,
      fechaInicio:  params.fechaInicio || now,
      createdAt:    now,
      updatedAt:    now,
    });
    createEntity_("contaConciliaciones", data);
    return data;
  }

  function updateConciliacion(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    if (patch.saldoBanco !== undefined || patch.saldoLibros !== undefined) {
      var saldoBanco  = Number(patch.saldoBanco  || 0);
      var saldoLibros = Number(patch.saldoLibros || 0);
      patch.diferencia = saldoBanco - saldoLibros;
    }
    delete patch.id;
    return updateEntity_("contaConciliaciones", params.id, patch);
  }

  function cerrarConciliacion(params) {
    Validator.requireFields(params, ["id"]);
    AppLogger.info("ContabilidadController.cerrarConciliacion", { id: params.id });
    var now = nowIso_();
    return updateEntity_("contaConciliaciones", params.id, {
      estado:      "cerrada",
      fechaCierre: now,
      updatedAt:   now,
    });
  }

  // ── Cuentas por Pagar ──────────────────────────────────────────────────────

  function listCuentasPagar(params) {
    var filter = { wsId: params.wsId || CONTA_WS_ID };
    if (params.estado)      filter.estado      = params.estado;
    if (params.prioridad)   filter.prioridad   = params.prioridad;
    if (params.proveedorId) filter.proveedorId = params.proveedorId;
    if (params.facturaId)   filter.facturaId   = params.facturaId;
    var result = listEntities_("contaCuentasPagar", filter);
    return result.items || [];
  }

  function getCuentaPagar(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("contaCuentasPagar", params.id);
  }

  function createCuentaPagar(params) {
    Validator.requireFields(params, ["proveedorId", "monto"]);
    AppLogger.info("ContabilidadController.createCuentaPagar", { proveedorId: params.proveedorId, monto: params.monto });
    var now = nowIso_();
    var monto = Number(params.monto) || 0;
    var data = Object.assign({
      codigo:        "",
      proveedorRef:  "",
      facturaId:     "",
      ordenCompraId: "",
      montoPagado:   0,
      saldo:         monto,
      moneda:        "USD",
      estado:        "pendiente",
      fechaVencimiento: "",
      fechaPago:     "",
      diasPlazo:     30,
      prioridad:     "normal",
      observaciones: "",
      dataJson:      "",
      createdBy:     "",
      deletedAt:     "",
    }, params, {
      id:           IdGen.uuid(),
      wsId:         params.wsId || CONTA_WS_ID,
      monto:        monto,
      saldo:        monto - (Number(params.montoPagado) || 0),
      fechaEmision: params.fechaEmision || now,
      createdAt:    now,
      updatedAt:    now,
    });
    createEntity_("contaCuentasPagar", data);
    return data;
  }

  function updateCuentaPagar(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("contaCuentasPagar", params.id, patch);
  }

  function saldarCuentaPagar(params) {
    Validator.requireFields(params, ["id", "montoPagado"]);
    AppLogger.info("ContabilidadController.saldarCuentaPagar", { id: params.id, montoPagado: params.montoPagado });
    var now = nowIso_();
    var current = getEntity_("contaCuentasPagar", params.id);
    var montoPagado = Number(params.montoPagado) || 0;
    var monto       = Number(current.monto) || 0;
    var saldo       = monto - montoPagado;
    var estado      = saldo <= 0 ? "pagada" : "parcial";
    return updateEntity_("contaCuentasPagar", params.id, {
      montoPagado: montoPagado,
      saldo:       Math.max(0, saldo),
      estado:      estado,
      fechaPago:   params.fechaPago || now,
      updatedAt:   now,
    });
  }

  // ── Cuentas por Cobrar ─────────────────────────────────────────────────────

  function listCuentasCobrar(params) {
    var filter = { wsId: params.wsId || CONTA_WS_ID };
    if (params.estado) filter.estado = params.estado;
    var result = listEntities_("contaCuentasCobrar", filter);
    return result.items || [];
  }

  function getCuentaCobrar(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("contaCuentasCobrar", params.id);
  }

  function createCuentaCobrar(params) {
    Validator.requireFields(params, ["clienteRef", "concepto", "monto"]);
    AppLogger.info("ContabilidadController.createCuentaCobrar", { clienteRef: params.clienteRef, monto: params.monto });
    var now = nowIso_();
    var monto = Number(params.monto) || 0;
    var data = Object.assign({
      codigo:          "",
      montoCobrado:    0,
      saldo:           monto,
      moneda:          "USD",
      estado:          "pendiente",
      fechaVencimiento: "",
      fechaCobro:      "",
      diasPlazo:       30,
      observaciones:   "",
      dataJson:        "",
      createdBy:       "",
      deletedAt:       "",
    }, params, {
      id:          IdGen.uuid(),
      wsId:        params.wsId || CONTA_WS_ID,
      monto:       monto,
      saldo:       monto - (Number(params.montoCobrado) || 0),
      fechaEmision: params.fechaEmision || now,
      createdAt:   now,
      updatedAt:   now,
    });
    createEntity_("contaCuentasCobrar", data);
    return data;
  }

  function updateCuentaCobrar(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: nowIso_() });
    delete patch.id;
    return updateEntity_("contaCuentasCobrar", params.id, patch);
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────

  function getDashboardResumen(params) {
    var wsId = params.wsId || CONTA_WS_ID;

    var compromisos    = listEntities_("contaCompromisos",    { wsId: wsId }).items || [];
    var facturas       = listEntities_("contaFacturas",       { wsId: wsId }).items || [];
    var pagos          = listEntities_("contaPagos",          { wsId: wsId }).items || [];
    var cuentasPagar   = listEntities_("contaCuentasPagar",   { wsId: wsId }).items || [];
    var conciliaciones = listEntities_("contaConciliaciones", { wsId: wsId }).items || [];

    var compActivos    = compromisos.filter(function (c) { return c.estado === "comprometido" && !c.deletedAt; });
    var compAnulados   = compromisos.filter(function (c) { return c.estado === "anulado"; });
    var montoCometido  = compActivos.reduce(function (acc, c) { return acc + (Number(c.monto) || 0); }, 0);
    var montoEjecutado = compActivos.reduce(function (acc, c) { return acc + (Number(c.montoEjecutado) || 0); }, 0);

    var factPendientes = facturas.filter(function (f) { return f.estado === "pendiente" && !f.deletedAt; });
    var factAprobadas  = facturas.filter(function (f) { return f.estado === "aprobada" && !f.deletedAt; });
    var factPagadas    = facturas.filter(function (f) { return f.estado === "pagada" && !f.deletedAt; });

    var pagosPendientes = pagos.filter(function (p) { return p.estado === "pendiente" && !p.deletedAt; });
    var pagosEjecutados = pagos.filter(function (p) { return p.estado === "ejecutado" && !p.deletedAt; });

    var cpPendientes  = cuentasPagar.filter(function (c) { return c.estado === "pendiente" && !c.deletedAt; });
    var cpVencidas    = cuentasPagar.filter(function (c) { return c.estado === "vencida" && !c.deletedAt; });
    var montoCxP      = cpPendientes.reduce(function (acc, c) { return acc + (Number(c.saldo) || 0); }, 0);

    var tiempoPromedioPago = 0;
    if (pagosEjecutados.length > 0) {
      var totalDias = pagosEjecutados.reduce(function (acc, p) {
        if (!p.fechaSolicitud || !p.fechaEjecucion) return acc;
        var dias = Math.round(
          (new Date(p.fechaEjecucion).getTime() - new Date(p.fechaSolicitud).getTime()) / 86400000
        );
        return acc + dias;
      }, 0);
      tiempoPromedioPago = Math.round(totalDias / pagosEjecutados.length);
    }

    var ejecucionPct = montoCometido > 0
      ? Math.round((montoEjecutado / montoCometido) * 100)
      : 0;

    return {
      compromisosActivos:   compActivos.length,
      montoCometido:        montoCometido,
      montoEjecutado:       montoEjecutado,
      ejecucionPct:         ejecucionPct,
      facturasPendientes:   factPendientes.length,
      facturasAprobadas:    factAprobadas.length,
      facturasPagadas:      factPagadas.length,
      pagosPendientes:      pagosPendientes.length,
      montoPagosPendientes: pagosPendientes.reduce(function (acc, p) { return acc + (Number(p.monto) || 0); }, 0),
      cuentasPorPagar:      cpPendientes.length,
      cuentasVencidas:      cpVencidas.length,
      montoCuentasPagar:    montoCxP,
      tiempoPromedioPago:   tiempoPromedioPago,
      conciliacionesAbiertas: conciliaciones.filter(function (c) { return c.estado === "abierta" && !c.deletedAt; }).length,
    };
  }

  // ── Reportes ───────────────────────────────────────────────────────────────

  function reporteEjecucionPresupuestaria(params) {
    var wsId = params.wsId || CONTA_WS_ID;
    var compromisos = listEntities_("contaCompromisos", { wsId: wsId }).items || [];
    var activos = compromisos.filter(function (c) { return !c.deletedAt; });

    var byCentro = {};
    activos.forEach(function (c) {
      var key = c.centroCosto || "sin_clasificar";
      if (!byCentro[key]) byCentro[key] = { comprometido: 0, ejecutado: 0, saldo: 0, count: 0 };
      byCentro[key].comprometido += Number(c.monto) || 0;
      byCentro[key].ejecutado    += Number(c.montoEjecutado) || 0;
      byCentro[key].saldo        += Number(c.saldo) || 0;
      byCentro[key].count++;
    });

    var rows = Object.keys(byCentro).map(function (k) {
      var d = byCentro[k];
      return {
        centroCosto:  k,
        comprometido: d.comprometido,
        ejecutado:    d.ejecutado,
        saldo:        d.saldo,
        pctEjecucion: d.comprometido > 0 ? Math.round((d.ejecutado / d.comprometido) * 100) : 0,
        compromisos:  d.count,
      };
    });

    return { rows: rows, total: activos.length };
  }

  function reportePagosPeriodo(params) {
    var wsId = params.wsId || CONTA_WS_ID;
    var filter = { wsId: wsId };
    if (params.periodo) filter.periodo = params.periodo;
    var pagos = listEntities_("contaPagos", filter).items || [];
    var activos = pagos.filter(function (p) { return !p.deletedAt; });

    var totalMonto     = activos.reduce(function (acc, p) { return acc + (Number(p.monto) || 0); }, 0);
    var totalEjecutado = activos.filter(function (p) { return p.estado === "ejecutado"; })
      .reduce(function (acc, p) { return acc + (Number(p.monto) || 0); }, 0);

    return {
      pagos:      activos,
      total:      activos.length,
      monto:      totalMonto,
      ejecutado:  totalEjecutado,
      pendiente:  totalMonto - totalEjecutado,
    };
  }

  function reporteFacturasPendientes(params) {
    var wsId = params.wsId || CONTA_WS_ID;
    var facturas = listEntities_("contaFacturas", { wsId: wsId }).items || [];
    var pendientes = facturas.filter(function (f) {
      return (f.estado === "pendiente" || f.estado === "aprobada") && !f.deletedAt;
    });
    var total = pendientes.reduce(function (acc, f) { return acc + (Number(f.montoTotal) || 0); }, 0);
    return { facturas: pendientes, total: pendientes.length, monto: total };
  }

  function reporteProveedoresEjecucion(params) {
    var wsId = params.wsId || CONTA_WS_ID;
    var cuentas = listEntities_("contaCuentasPagar", { wsId: wsId }).items || [];
    var activas = cuentas.filter(function (c) { return !c.deletedAt; });

    var byProv = {};
    activas.forEach(function (c) {
      var key = c.proveedorId || "sin_proveedor";
      if (!byProv[key]) byProv[key] = { proveedorRef: c.proveedorRef || key, monto: 0, pagado: 0, saldo: 0, count: 0 };
      byProv[key].monto  += Number(c.monto) || 0;
      byProv[key].pagado += Number(c.montoPagado) || 0;
      byProv[key].saldo  += Number(c.saldo) || 0;
      byProv[key].count++;
    });

    var rows = Object.keys(byProv).map(function (k) {
      var d = byProv[k];
      return Object.assign({ proveedorId: k }, d);
    });
    rows.sort(function (a, b) { return b.monto - a.monto; });

    return { rows: rows, total: activas.length };
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  return {
    listCompromisos:               listCompromisos,
    getCompromiso:                 getCompromiso,
    createCompromiso:              createCompromiso,
    updateCompromiso:              updateCompromiso,
    aprobarCompromiso:             aprobarCompromiso,
    anularCompromiso:              anularCompromiso,
    listRegistros:                 listRegistros,
    getRegistro:                   getRegistro,
    createRegistro:                createRegistro,
    updateRegistro:                updateRegistro,
    anularRegistro:                anularRegistro,
    listFacturas:                  listFacturas,
    getFactura:                    getFactura,
    createFactura:                 createFactura,
    updateFactura:                 updateFactura,
    aprobarFactura:                aprobarFactura,
    rechazarFactura:               rechazarFactura,
    listPagos:                     listPagos,
    getPago:                       getPago,
    createPago:                    createPago,
    updatePago:                    updatePago,
    aprobarPago:                   aprobarPago,
    ejecutarPago:                  ejecutarPago,
    listConciliaciones:            listConciliaciones,
    getConciliacion:               getConciliacion,
    createConciliacion:            createConciliacion,
    updateConciliacion:            updateConciliacion,
    cerrarConciliacion:            cerrarConciliacion,
    listCuentasPagar:              listCuentasPagar,
    getCuentaPagar:                getCuentaPagar,
    createCuentaPagar:             createCuentaPagar,
    updateCuentaPagar:             updateCuentaPagar,
    saldarCuentaPagar:             saldarCuentaPagar,
    listCuentasCobrar:             listCuentasCobrar,
    getCuentaCobrar:               getCuentaCobrar,
    createCuentaCobrar:            createCuentaCobrar,
    updateCuentaCobrar:            updateCuentaCobrar,
    getDashboardResumen:           getDashboardResumen,
    reporteEjecucionPresupuestaria: reporteEjecucionPresupuestaria,
    reportePagosPeriodo:           reportePagosPeriodo,
    reporteFacturasPendientes:     reporteFacturasPendientes,
    reporteProveedoresEjecucion:   reporteProveedoresEjecucion,
  };

})();

/**
 * Route contabilidad.* actions via OrgUnitRegistry.
 * Called by OrgUnitRegistry when namespace === "contabilidad".
 */
function routeContabilidadAction_(verb, params, context) {
  switch (verb) {
    case "listCompromisos":               return ContabilidadController.listCompromisos(params);
    case "getCompromiso":                 return ContabilidadController.getCompromiso(params);
    case "createCompromiso":              return ContabilidadController.createCompromiso(params);
    case "updateCompromiso":              return ContabilidadController.updateCompromiso(params);
    case "aprobarCompromiso":             return ContabilidadController.aprobarCompromiso(params);
    case "anularCompromiso":              return ContabilidadController.anularCompromiso(params);
    case "listRegistros":                 return ContabilidadController.listRegistros(params);
    case "getRegistro":                   return ContabilidadController.getRegistro(params);
    case "createRegistro":                return ContabilidadController.createRegistro(params);
    case "updateRegistro":                return ContabilidadController.updateRegistro(params);
    case "anularRegistro":                return ContabilidadController.anularRegistro(params);
    case "listFacturas":                  return ContabilidadController.listFacturas(params);
    case "getFactura":                    return ContabilidadController.getFactura(params);
    case "createFactura":                 return ContabilidadController.createFactura(params);
    case "updateFactura":                 return ContabilidadController.updateFactura(params);
    case "aprobarFactura":                return ContabilidadController.aprobarFactura(params);
    case "rechazarFactura":               return ContabilidadController.rechazarFactura(params);
    case "listPagos":                     return ContabilidadController.listPagos(params);
    case "getPago":                       return ContabilidadController.getPago(params);
    case "createPago":                    return ContabilidadController.createPago(params);
    case "updatePago":                    return ContabilidadController.updatePago(params);
    case "aprobarPago":                   return ContabilidadController.aprobarPago(params);
    case "ejecutarPago":                  return ContabilidadController.ejecutarPago(params);
    case "listConciliaciones":            return ContabilidadController.listConciliaciones(params);
    case "getConciliacion":               return ContabilidadController.getConciliacion(params);
    case "createConciliacion":            return ContabilidadController.createConciliacion(params);
    case "updateConciliacion":            return ContabilidadController.updateConciliacion(params);
    case "cerrarConciliacion":            return ContabilidadController.cerrarConciliacion(params);
    case "listCuentasPagar":              return ContabilidadController.listCuentasPagar(params);
    case "getCuentaPagar":                return ContabilidadController.getCuentaPagar(params);
    case "createCuentaPagar":             return ContabilidadController.createCuentaPagar(params);
    case "updateCuentaPagar":             return ContabilidadController.updateCuentaPagar(params);
    case "saldarCuentaPagar":             return ContabilidadController.saldarCuentaPagar(params);
    case "listCuentasCobrar":             return ContabilidadController.listCuentasCobrar(params);
    case "getCuentaCobrar":               return ContabilidadController.getCuentaCobrar(params);
    case "createCuentaCobrar":            return ContabilidadController.createCuentaCobrar(params);
    case "updateCuentaCobrar":            return ContabilidadController.updateCuentaCobrar(params);
    case "getDashboardResumen":           return ContabilidadController.getDashboardResumen(params);
    case "reporteEjecucionPresupuestaria": return ContabilidadController.reporteEjecucionPresupuestaria(params);
    case "reportePagosPeriodo":           return ContabilidadController.reportePagosPeriodo(params);
    case "reporteFacturasPendientes":     return ContabilidadController.reporteFacturasPendientes(params);
    case "reporteProveedoresEjecucion":   return ContabilidadController.reporteProveedoresEjecucion(params);
    default:
      throw new Error("Unknown contabilidad verb: " + verb);
  }
}
