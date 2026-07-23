/**
 * Executive Dashboard Controller.
 *
 * Routes "ejecutivo.*" actions to ExecutiveDashboardEngine and KPIEngine.
 * No unit business logic here — pure aggregation and delegation.
 */

var ExecutiveDashboardController = (function () {

  function getDashboard(params, context) {
    var wsId = params.wsId;
    if (!wsId) return { error: "wsId requerido" };
    var data = ExecutiveDashboardEngine.getConsolidatedDashboard(wsId);
    return { ok: true, data: data };
  }

  function getUnitSummary(params, context) {
    var wsId    = params.wsId;
    var unitKey = params.unitKey;
    if (!wsId || !unitKey) return { error: "wsId y unitKey requeridos" };
    var data = ExecutiveDashboardEngine.getUnitSummary(unitKey, wsId);
    return { ok: true, data: data };
  }

  function getAllKPIs(params, context) {
    var wsId = params.wsId;
    if (!wsId) return { error: "wsId requerido" };
    var kpis = KPIEngine.getAllKPIs(wsId);
    return { ok: true, data: kpis, total: kpis.length };
  }

  function getKPIsByDashboard(params, context) {
    var wsId      = params.wsId;
    var dashboard = params.dashboard || "ejecutivo";
    if (!wsId) return { error: "wsId requerido" };
    var kpis = KPIEngine.getKPIsByDashboard(dashboard, wsId);
    return { ok: true, data: kpis, total: kpis.length };
  }

  function getKPIsByUnit(params, context) {
    var wsId    = params.wsId;
    var unitKey = params.unitKey;
    if (!wsId || !unitKey) return { error: "wsId y unitKey requeridos" };
    var kpis = KPIEngine.getKPIsByUnit(unitKey, wsId);
    return { ok: true, data: kpis, total: kpis.length };
  }

  function getKPIsByCategoria(params, context) {
    var wsId      = params.wsId;
    var categoria = params.categoria;
    if (!wsId || !categoria) return { error: "wsId y categoria requeridos" };
    var kpis = KPIEngine.getKPIsByCategoria(categoria, wsId);
    return { ok: true, data: kpis, total: kpis.length };
  }

  function getKPIsSemaforo(params, context) {
    var wsId  = params.wsId;
    var color = params.color;
    if (!wsId || !color) return { error: "wsId y color requeridos" };
    var kpis = KPIEngine.getKPIsSemaforo(color, wsId);
    return { ok: true, data: kpis, total: kpis.length };
  }

  function getRegisteredAdapters(params, context) {
    return {
      ok: true,
      data: {
        dashboardAdapters: ExecutiveDashboardEngine.getRegisteredAdapters(),
        kpiAdapters:       KPIEngine.getRegisteredAdapters(),
      },
    };
  }

  return {
    getDashboard:          getDashboard,
    getUnitSummary:        getUnitSummary,
    getAllKPIs:             getAllKPIs,
    getKPIsByDashboard:    getKPIsByDashboard,
    getKPIsByUnit:         getKPIsByUnit,
    getKPIsByCategoria:    getKPIsByCategoria,
    getKPIsSemaforo:       getKPIsSemaforo,
    getRegisteredAdapters: getRegisteredAdapters,
  };
})();
