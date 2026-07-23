/**
 * KPI Engine v1.
 *
 * Completely generic indicator engine — no hardcoded KPIs.
 * Each organizational unit registers a KPIAdapter via register().
 * KPIs are declared via configuration, not implemented manually.
 *
 * KPIAdapter contract:
 *   { unitKey: string, getKPIs(wsId): KPIDefinicion[] }
 *
 * KPIDefinicion shape (all fields):
 *   {
 *     id, nombre, descripcion, unidad, categoria, grupo,
 *     origen, adaptador, consulta, formula, tipo,
 *     meta, valorActual, valorAnterior, variacion, tendencia,
 *     semaforo, frecuencia, responsable, dashboard, visible, orden
 *   }
 */

var KPIEngine = (function () {
  var _adapters = {};

  function register(adapter) {
    if (!adapter || !adapter.unitKey || typeof adapter.getKPIs !== "function") {
      throw new Error("KPIEngine: adapter must have unitKey + getKPIs()");
    }
    _adapters[adapter.unitKey] = adapter;
    AppLogger.info("KPIEngine: registered adapter", { unitKey: adapter.unitKey });
  }

  function _calcVariacion(actual, anterior) {
    if (!anterior || anterior === 0) return 0;
    return Math.round(((actual - anterior) / Math.abs(anterior)) * 100 * 10) / 10;
  }

  function _calcTendencia(variacion, tipo) {
    if (Math.abs(variacion) < 1) return "estable";
    // For 'porcentaje' and 'numero' KPIs: positive variacion = alza
    return variacion > 0 ? "alza" : "baja";
  }

  function _calcSemaforo(kpi) {
    if (!kpi.meta || kpi.meta === 0) return "verde";
    var pct = (kpi.valorActual / kpi.meta) * 100;

    // Inverse KPIs (lower is better) — identified by negative meta or flag
    if (kpi.inverso) {
      if (pct <= 50)  return "verde";
      if (pct <= 100) return "amarillo";
      return "rojo";
    }

    // Normal KPIs (higher is better)
    if (pct >= 90)  return "verde";
    if (pct >= 70)  return "amarillo";
    return "rojo";
  }

  function _enrichKPI(kpi) {
    var variacion = _calcVariacion(kpi.valorActual, kpi.valorAnterior);
    var tendencia = _calcTendencia(variacion, kpi.tipo);
    var semaforo  = kpi.semaforo || _calcSemaforo(kpi);
    return Object.assign({}, kpi, {
      variacion: variacion,
      tendencia: tendencia,
      semaforo:  semaforo,
    });
  }

  function getAllKPIs(wsId) {
    var allKPIs = [];
    for (var key in _adapters) {
      if (!Object.prototype.hasOwnProperty.call(_adapters, key)) continue;
      try {
        var kpis = _adapters[key].getKPIs(wsId);
        for (var i = 0; i < kpis.length; i++) {
          allKPIs.push(_enrichKPI(kpis[i]));
        }
      } catch (e) {
        AppLogger.warn("KPIEngine: adapter error", { key: key, error: String(e) });
      }
    }
    allKPIs.sort(function (a, b) { return (a.orden || 0) - (b.orden || 0); });
    return allKPIs;
  }

  function getKPIsByDashboard(dashboard, wsId) {
    var all = getAllKPIs(wsId);
    return all.filter(function (k) {
      return k.dashboard === dashboard && k.visible !== false;
    });
  }

  function getKPIsByUnit(unitKey, wsId) {
    var adapter = _adapters[unitKey];
    if (!adapter) throw new Error("No KPI adapter for unit: " + unitKey);
    var kpis = adapter.getKPIs(wsId);
    return kpis.map(_enrichKPI);
  }

  function getKPIsByCategoria(categoria, wsId) {
    var all = getAllKPIs(wsId);
    return all.filter(function (k) { return k.categoria === categoria; });
  }

  function getKPIsSemaforo(color, wsId) {
    var all = getAllKPIs(wsId);
    return all.filter(function (k) { return k.semaforo === color; });
  }

  function getRegisteredAdapters() {
    return Object.keys(_adapters);
  }

  return {
    register:            register,
    getAllKPIs:           getAllKPIs,
    getKPIsByDashboard:  getKPIsByDashboard,
    getKPIsByUnit:       getKPIsByUnit,
    getKPIsByCategoria:  getKPIsByCategoria,
    getKPIsSemaforo:     getKPIsSemaforo,
    getRegisteredAdapters: getRegisteredAdapters,
  };
})();
