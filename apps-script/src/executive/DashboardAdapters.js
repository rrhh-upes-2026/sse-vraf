/**
 * Dashboard Adapters — one per organizational unit.
 *
 * Each adapter is an IIFE exposing { unitKey, getResumen(wsId) }.
 * Adapters call SheetRepository directly — never call unit controllers.
 * Adapters are registered with ExecutiveDashboardEngine via
 * bootstrapExecutiveEngine_() in Code.js.
 */

// ── Helpers ────────────────────────────────────────────────────────────────────

function _listCount_(entityName, wsId) {
  try {
    var r = listEntities_(entityName, { wsId: wsId });
    return r.items.length;
  } catch (e) { return 0; }
}

function _listCountWhere_(entityName, wsId, field, value) {
  try {
    var q = { wsId: wsId };
    q[field] = value;
    var r = listEntities_(entityName, q);
    return r.items.length;
  } catch (e) { return 0; }
}

function _listItems_(entityName, wsId) {
  try {
    return listEntities_(entityName, { wsId: wsId }).items || [];
  } catch (e) { return []; }
}

function _semaforo_(valor, meta, inverso) {
  if (!meta || meta === 0) return "verde";
  var pct = (valor / meta) * 100;
  if (inverso) {
    return pct <= 50 ? "verde" : pct <= 100 ? "amarillo" : "rojo";
  }
  return pct >= 90 ? "verde" : pct >= 70 ? "amarillo" : "rojo";
}

function _kpi_(id, label, valor, meta, unidad, semaforo, tendencia) {
  return { id: id, label: label, valor: valor, meta: meta,
           unidad: unidad, semaforo: semaforo, tendencia: tendencia };
}

function _alerta_(nivel, mensaje, accion) {
  return { nivel: nivel, mensaje: mensaje, accion: accion || null };
}

function _estadoFromAlertas_(alertas) {
  for (var i = 0; i < alertas.length; i++) {
    if (alertas[i].nivel === "critical") return "critical";
  }
  for (var j = 0; j < alertas.length; j++) {
    if (alertas[j].nivel === "warning") return "warning";
  }
  return "ok";
}

// ── RRHH Dashboard Adapter ─────────────────────────────────────────────────────

var RRHHDashboardAdapter = (function () {
  var UNIT_KEY = "rrhh";

  function getResumen(wsId) {
    var empleados   = _listItems_("empleados", wsId);
    var activos     = empleados.filter(function(e) { return e.estado === "activo"; }).length;
    var contrataciones = _listItems_("contrataciones", wsId);
    var actProc     = contrataciones.filter(function(c) { return c.estado !== "cerrado" && c.estado !== "cancelado"; }).length;

    var kpis = [
      _kpi_("rrhh.empleados", "Empleados activos", activos, activos, "personas", "verde", "estable"),
      _kpi_("rrhh.contrataciones", "Contrataciones en proceso", actProc, 0, "procesos",
            actProc > 5 ? "amarillo" : "verde", "estable"),
    ];

    var alertas = [];
    if (actProc > 10) alertas.push(_alerta_("warning", actProc + " contrataciones pendientes de cierre", "/ws/rrhh/contratacion"));

    return {
      unitKey:  UNIT_KEY,
      label:    "Recursos Humanos",
      color:    "#2563EB",
      icon:     "M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
      estado:   _estadoFromAlertas_(alertas),
      estadoRazon: alertas.length ? alertas[0].mensaje : "Sin alertas",
      kpis:     kpis,
      alertas:  alertas,
      cumplimientoPct: 90,
      resumenFinanciero: null,
      resumenOperativo: {
        descripcion: "Gestión de personal institucional",
        indicadores: [
          { label: "Empleados activos", valor: activos },
          { label: "Contrataciones en proceso", valor: actProc },
        ],
      },
      actividadReciente: [],
    };
  }

  return { unitKey: UNIT_KEY, getResumen: getResumen };
})();

// ── VRAF Dashboard Adapter ─────────────────────────────────────────────────────

var VRAFDashboardAdapter = (function () {
  var UNIT_KEY = "vraf";

  function getResumen(wsId) {
    var objetivos  = _listItems_("objetivos",  wsId);
    var proyectos  = _listItems_("proyectos",  wsId);
    var indicadores = _listItems_("indicadores", wsId);
    var evidencias  = _listItems_("evidencias",  wsId);

    var objActivos  = objetivos.filter(function(o) { return o.estado !== "cerrado"; }).length;
    var projActivos = proyectos.filter(function(p) { return p.estado === "en_ejecucion" || p.estado === "planificado"; }).length;
    var indRojos    = indicadores.filter(function(i) { return i.semaforo === "rojo"; }).length;
    var evPendientes = evidencias.filter(function(e) { return e.estado === "pendiente"; }).length;

    var alertas = [];
    if (indRojos > 0) alertas.push(_alerta_("warning", indRojos + " indicador(es) en rojo", "/ws/vraf/indicadores"));
    if (evPendientes > 3) alertas.push(_alerta_("warning", evPendientes + " evidencias pendientes", "/ws/vraf/evidencias"));

    return {
      unitKey:  UNIT_KEY,
      label:    "VRAF",
      color:    "#7C3AED",
      icon:     "M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z",
      estado:   _estadoFromAlertas_(alertas),
      estadoRazon: alertas.length ? alertas[0].mensaje : "Sin alertas",
      kpis: [
        _kpi_("vraf.objetivos",   "Objetivos activos",       objActivos,   objActivos, "obj", "verde", "estable"),
        _kpi_("vraf.proyectos",   "Proyectos en ejecución",  projActivos,  projActivos, "proy", "verde", "estable"),
        _kpi_("vraf.ind_rojo",    "Indicadores en rojo",     indRojos,     0,           "ind",
              indRojos > 0 ? "rojo" : "verde", indRojos > 0 ? "alza" : "estable"),
      ],
      alertas:  alertas,
      cumplimientoPct: indRojos === 0 ? 95 : 70,
      resumenFinanciero: null,
      resumenOperativo: {
        descripcion: "Planificación estratégica institucional",
        indicadores: [
          { label: "Objetivos activos",    valor: objActivos },
          { label: "Proyectos activos",    valor: projActivos },
          { label: "Indicadores en rojo",  valor: indRojos },
          { label: "Evidencias pendientes", valor: evPendientes },
        ],
      },
      actividadReciente: [],
    };
  }

  return { unitKey: UNIT_KEY, getResumen: getResumen };
})();

// ── Compras Dashboard Adapter ──────────────────────────────────────────────────

var ComprasDashboardAdapter = (function () {
  var UNIT_KEY = "compras";

  function getResumen(wsId) {
    var requisiciones = _listItems_("requisiciones",  wsId);
    var ordenes       = _listItems_("ordenesCompra",  wsId);
    var cotizaciones  = _listItems_("cotizaciones",   wsId);

    var reqPendientes = requisiciones.filter(function(r) { return r.estado === "pendiente" || r.estado === "revisado"; }).length;
    var ordAbiertas   = ordenes.filter(function(o) { return o.estado === "emitida" || o.estado === "parcial"; }).length;
    var cotPendientes = cotizaciones.filter(function(c) { return c.estado === "pendiente"; }).length;

    var gastoTotal = ordenes.reduce(function(s, o) { return s + (parseFloat(o.montoTotal) || 0); }, 0);

    var alertas = [];
    if (reqPendientes > 5)  alertas.push(_alerta_("warning",  reqPendientes + " requisiciones sin atender", "/ws/compras/requisiciones"));
    if (ordAbiertas > 10)   alertas.push(_alerta_("warning",  ordAbiertas + " órdenes de compra abiertas", "/ws/compras/ordenes"));

    return {
      unitKey:  UNIT_KEY,
      label:    "Compras",
      color:    "#D97706",
      icon:     "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
      estado:   _estadoFromAlertas_(alertas),
      estadoRazon: alertas.length ? alertas[0].mensaje : "Sin alertas",
      kpis: [
        _kpi_("compras.requisiciones", "Requisiciones pendientes",  reqPendientes, 3,  "req",
              _semaforo_(reqPendientes, 3, true),   reqPendientes > 3 ? "alza" : "estable"),
        _kpi_("compras.ordenes",       "Órdenes abiertas",         ordAbiertas,   10, "OC",
              _semaforo_(ordAbiertas, 10, true),    ordAbiertas > 10 ? "alza" : "estable"),
        _kpi_("compras.gasto",         "Gasto total período",      gastoTotal,    0,  "$", "verde", "estable"),
      ],
      alertas:  alertas,
      cumplimientoPct: reqPendientes <= 3 ? 90 : 70,
      resumenFinanciero: { egresos: gastoTotal, saldo: 0 },
      resumenOperativo: {
        descripcion: "Gestión de adquisiciones institucionales",
        indicadores: [
          { label: "Requisiciones pendientes", valor: reqPendientes },
          { label: "Órdenes abiertas",         valor: ordAbiertas },
          { label: "Cotizaciones pendientes",   valor: cotPendientes },
        ],
      },
      actividadReciente: [],
    };
  }

  return { unitKey: UNIT_KEY, getResumen: getResumen };
})();

// ── Contabilidad Dashboard Adapter ─────────────────────────────────────────────

var ContabilidadDashboardAdapter = (function () {
  var UNIT_KEY = "contabilidad";

  function getResumen(wsId) {
    var cuentasCobrar  = _listItems_("cuentasCobrar",     wsId);
    var cuentasPagar   = _listItems_("cuentasPagar",      wsId);
    var compromisos    = _listItems_("compromisos",        wsId);
    var registros      = _listItems_("registrosContables", wsId);

    var ccVencidas     = cuentasCobrar.filter(function(c) { return c.estado === "vencida"; }).length;
    var cpVencidas     = cuentasPagar.filter(function(c)  { return c.estado === "vencida"; }).length;
    var compActivos    = compromisos.filter(function(c)  { return c.estado === "activo";  }).length;

    var totalCobrar = cuentasCobrar.reduce(function(s, c) { return s + (parseFloat(c.monto) || 0); }, 0);
    var totalPagar  = cuentasPagar.reduce(function(s,  c) { return s + (parseFloat(c.monto) || 0); }, 0);
    var saldo       = totalCobrar - totalPagar;

    var alertas = [];
    if (ccVencidas > 0) alertas.push(_alerta_("critical", ccVencidas + " cuentas por cobrar vencidas", "/ws/contabilidad/cuentas-cobrar"));
    if (cpVencidas > 0) alertas.push(_alerta_("warning",  cpVencidas + " cuentas por pagar vencidas",  "/ws/contabilidad/cuentas-pagar"));

    return {
      unitKey:  UNIT_KEY,
      label:    "Contabilidad",
      color:    "#059669",
      icon:     "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
      estado:   _estadoFromAlertas_(alertas),
      estadoRazon: alertas.length ? alertas[0].mensaje : "Sin alertas",
      kpis: [
        _kpi_("conta.cc_vencidas", "CxC vencidas",   ccVencidas,  0, "facturas",
              ccVencidas > 0 ? "rojo" : "verde", ccVencidas > 0 ? "alza" : "estable"),
        _kpi_("conta.cp_vencidas", "CxP vencidas",   cpVencidas,  0, "facturas",
              cpVencidas > 0 ? "amarillo" : "verde", "estable"),
        _kpi_("conta.saldo",       "Saldo neto",      saldo,       0, "$", "verde", "estable"),
        _kpi_("conta.compromisos", "Compromisos activos", compActivos, compActivos, "compromisos", "verde", "estable"),
      ],
      alertas:  alertas,
      cumplimientoPct: (ccVencidas === 0 && cpVencidas === 0) ? 95 : 65,
      resumenFinanciero: { egresos: totalPagar, saldo: saldo },
      resumenOperativo: {
        descripcion: "Gestión financiera y contable institucional",
        indicadores: [
          { label: "Cuentas por cobrar",     valor: totalCobrar },
          { label: "Cuentas por pagar",      valor: totalPagar },
          { label: "Saldo neto",             valor: saldo },
          { label: "Compromisos activos",    valor: compActivos },
        ],
      },
      actividadReciente: [],
    };
  }

  return { unitKey: UNIT_KEY, getResumen: getResumen };
})();

// ── Mantenimiento Dashboard Adapter ───────────────────────────────────────────

var MantenimientoDashboardAdapter = (function () {
  var UNIT_KEY = "mantenimiento";

  function getResumen(wsId) {
    var activos    = _listItems_("mantoActivos",        wsId);
    var ordenes    = _listItems_("mantoOrdenesTrabajo", wsId);
    var solicitudes = _listItems_("mantoSolicitudes",   wsId);
    var inventario  = _listItems_("mantoInventarioTecnico", wsId);

    var operativos  = activos.filter(function(a) { return a.estado === "operativo"; }).length;
    var ordAbiertas = ordenes.filter(function(o) { return o.estado === "emitida" || o.estado === "asignada" || o.estado === "en_proceso"; }).length;
    var solPendientes = solicitudes.filter(function(s) { return s.estado === "pendiente"; }).length;
    var bajoStock   = inventario.filter(function(i) { return (parseFloat(i.stockActual) || 0) <= (parseFloat(i.stockMinimo) || 0); }).length;

    var costoTotal = ordenes.filter(function(o) { return o.estado === "completada"; })
      .reduce(function(s, o) { return s + (parseFloat(o.costoTotal) || 0); }, 0);

    var alertas = [];
    if (bajoStock > 0)    alertas.push(_alerta_("warning",  bajoStock + " ítems con stock bajo mínimo",    "/ws/mantenimiento/inventario-tecnico"));
    if (solPendientes > 3) alertas.push(_alerta_("warning", solPendientes + " solicitudes sin atender",     "/ws/mantenimiento/solicitudes-manto"));

    return {
      unitKey:  UNIT_KEY,
      label:    "Mantenimiento",
      color:    "#DC2626",
      icon:     "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
      estado:   _estadoFromAlertas_(alertas),
      estadoRazon: alertas.length ? alertas[0].mensaje : "Sin alertas",
      kpis: [
        _kpi_("manto.activos_op",  "Activos operativos",        operativos,    activos.length, "activos",
              _semaforo_(operativos, activos.length), "estable"),
        _kpi_("manto.ordenes",     "Órdenes abiertas",          ordAbiertas,   5,  "OT",
              _semaforo_(ordAbiertas, 5, true), "estable"),
        _kpi_("manto.bajo_stock",  "Ítems bajo stock mínimo",   bajoStock,     0,  "ítems",
              bajoStock > 0 ? "amarillo" : "verde", "estable"),
        _kpi_("manto.costo",       "Costo mantenimiento",       costoTotal,    0,  "$", "verde", "estable"),
      ],
      alertas:  alertas,
      cumplimientoPct: bajoStock === 0 && solPendientes === 0 ? 92 : 75,
      resumenFinanciero: { egresos: costoTotal, saldo: 0 },
      resumenOperativo: {
        descripcion: "Gestión de activos e infraestructura institucional",
        indicadores: [
          { label: "Activos operativos",       valor: operativos },
          { label: "Órdenes abiertas",         valor: ordAbiertas },
          { label: "Solicitudes pendientes",    valor: solPendientes },
          { label: "Ítems bajo stock mínimo",  valor: bajoStock },
        ],
      },
      actividadReciente: [],
    };
  }

  return { unitKey: UNIT_KEY, getResumen: getResumen };
})();

// ── SSO Dashboard Adapter ──────────────────────────────────────────────────────

var SSODashboardAdapter = (function () {
  var UNIT_KEY = "salud";

  function getResumen(wsId) {
    var incidentes    = _listItems_("ssoIncidentes",   wsId);
    var riesgos       = _listItems_("ssoRiesgos",      wsId);
    var acciones      = _listItems_("ssoAcciones",     wsId);
    var cumplimiento  = _listItems_("ssoCumplimiento", wsId);

    var incAbiertos   = incidentes.filter(function(i) { return i.estado === "abierto" || i.estado === "en_proceso"; }).length;
    var riesgoCriticos = riesgos.filter(function(r) { return r.clasificacion === "critico"; }).length;
    var accionesVencidas = acciones.filter(function(a) { return a.estado === "vencida"; }).length;

    var totalCumpl    = cumplimiento.length;
    var cumpleCumpl   = cumplimiento.filter(function(c) { return c.estado === "cumple"; }).length;
    var cumplPct      = totalCumpl > 0 ? Math.round((cumpleCumpl / totalCumpl) * 100) : 100;

    var alertas = [];
    if (incAbiertos > 0)     alertas.push(_alerta_("critical", incAbiertos + " incidente(s) laboral(es) abierto(s)",       "/ws/salud/incidentes"));
    if (riesgoCriticos > 0)  alertas.push(_alerta_("critical", riesgoCriticos + " riesgo(s) crítico(s) sin controlar",     "/ws/salud/matriz-riesgos"));
    if (accionesVencidas > 0) alertas.push(_alerta_("warning", accionesVencidas + " acción(es) CAPA vencida(s)",           "/ws/salud/acciones-capa"));

    return {
      unitKey:  UNIT_KEY,
      label:    "SSO",
      color:    "#0891B2",
      icon:     "M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0z",
      estado:   _estadoFromAlertas_(alertas),
      estadoRazon: alertas.length ? alertas[0].mensaje : "Sin alertas SSO",
      kpis: [
        _kpi_("sso.incidentes",   "Incidentes abiertos",   incAbiertos,     0,  "incidentes",
              incAbiertos > 0 ? "rojo" : "verde", "estable"),
        _kpi_("sso.riesgos_crit", "Riesgos críticos",      riesgoCriticos,  0,  "riesgos",
              riesgoCriticos > 0 ? "rojo" : "verde", "estable"),
        _kpi_("sso.cumplimiento", "Cumplimiento legal",    cumplPct,        90, "%",
              _semaforo_(cumplPct, 90), cumplPct >= 90 ? "alza" : "baja"),
        _kpi_("sso.acc_vencidas", "Acciones CAPA vencidas", accionesVencidas, 0, "acciones",
              accionesVencidas > 0 ? "amarillo" : "verde", "estable"),
      ],
      alertas:  alertas,
      cumplimientoPct: cumplPct,
      resumenFinanciero: null,
      resumenOperativo: {
        descripcion: "Seguridad y salud ocupacional institucional",
        indicadores: [
          { label: "Incidentes abiertos",    valor: incAbiertos },
          { label: "Riesgos críticos",       valor: riesgoCriticos },
          { label: "Cumplimiento legal",     valor: cumplPct + "%" },
          { label: "Acciones CAPA vencidas", valor: accionesVencidas },
        ],
      },
      actividadReciente: [],
    };
  }

  return { unitKey: UNIT_KEY, getResumen: getResumen };
})();

// ── Bootstrap helper ───────────────────────────────────────────────────────────

/**
 * Register all dashboard adapters with ExecutiveDashboardEngine.
 * Called from Code.js bootstrap after all unit controllers are loaded.
 */
function bootstrapDashboardAdapters_() {
  ExecutiveDashboardEngine.register(RRHHDashboardAdapter);
  ExecutiveDashboardEngine.register(VRAFDashboardAdapter);
  ExecutiveDashboardEngine.register(ComprasDashboardAdapter);
  ExecutiveDashboardEngine.register(ContabilidadDashboardAdapter);
  ExecutiveDashboardEngine.register(MantenimientoDashboardAdapter);
  ExecutiveDashboardEngine.register(SSODashboardAdapter);
  AppLogger.info("bootstrapDashboardAdapters_: 6 adapters registered");
}
