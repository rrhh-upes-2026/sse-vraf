/**
 * Executive Dashboard Engine.
 *
 * Transversal aggregation layer — knows NO unit directly.
 * Each organizational unit registers a DashboardAdapter via register().
 * The engine consolidates all adapters into a unified executive view.
 *
 * DashboardAdapter contract:
 *   { unitKey: string, getResumen(wsId): DashboardUnitResumen }
 *
 * DashboardUnitResumen shape:
 *   {
 *     unitKey, label, color, icon,
 *     estado,           // 'ok' | 'warning' | 'critical'
 *     estadoRazon,
 *     kpis,             // [{ id, label, valor, meta, unidad, semaforo, tendencia }]
 *     alertas,          // [{ nivel, mensaje, accion }]
 *     cumplimientoPct,
 *     resumenFinanciero, // null | { egresos, saldo }
 *     resumenOperativo,  // { descripcion, indicadores: [] }
 *     actividadReciente, // [{ fecha, descripcion, tipo }]
 *   }
 */

var ExecutiveDashboardEngine = (function () {
  var _adapters = {};

  function register(adapter) {
    if (!adapter || !adapter.unitKey || typeof adapter.getResumen !== "function") {
      throw new Error("ExecutiveDashboardEngine: adapter must have unitKey + getResumen()");
    }
    _adapters[adapter.unitKey] = adapter;
    AppLogger.info("ExecutiveDashboardEngine: registered adapter", { unitKey: adapter.unitKey });
  }

  function _collectAlertasCriticas(unidades) {
    var alertas = [];
    for (var i = 0; i < unidades.length; i++) {
      var u = unidades[i];
      for (var j = 0; j < (u.alertas || []).length; j++) {
        var a = u.alertas[j];
        if (a.nivel === "critical") {
          alertas.push({
            unitKey:  u.unitKey,
            unitLabel: u.label,
            nivel:     a.nivel,
            mensaje:   a.mensaje,
            accion:    a.accion || null,
          });
        }
      }
    }
    return alertas;
  }

  function _buildSemaforos(unidades) {
    var sem = {};
    for (var i = 0; i < unidades.length; i++) {
      var u = unidades[i];
      sem[u.unitKey] = u.estado === "critical" ? "rojo"
                     : u.estado === "warning"  ? "amarillo"
                     : "verde";
    }
    return sem;
  }

  function _consolidarFinanciero(unidades) {
    var saldoTotal = 0;
    var egresosTotal = 0;
    for (var i = 0; i < unidades.length; i++) {
      var rf = unidades[i].resumenFinanciero;
      if (rf) {
        saldoTotal   += (rf.saldo   || 0);
        egresosTotal += (rf.egresos || 0);
      }
    }
    return { saldo: saldoTotal, egresos: egresosTotal };
  }

  function _promedioCumplimiento(unidades) {
    if (!unidades.length) return 0;
    var suma = 0;
    for (var i = 0; i < unidades.length; i++) {
      suma += (unidades[i].cumplimientoPct || 0);
    }
    return Math.round(suma / unidades.length);
  }

  function getConsolidatedDashboard(wsId) {
    var unidades = [];
    var errores = [];

    for (var key in _adapters) {
      if (!Object.prototype.hasOwnProperty.call(_adapters, key)) continue;
      try {
        var resumen = _adapters[key].getResumen(wsId);
        unidades.push(resumen);
      } catch (e) {
        AppLogger.warn("ExecutiveDashboardEngine: adapter error", { key: key, error: String(e) });
        errores.push({ unitKey: key, error: String(e) });
      }
    }

    var alertasCriticas = _collectAlertasCriticas(unidades);
    var semaforos = _buildSemaforos(unidades);
    var financiero = _consolidarFinanciero(unidades);
    var cumplimientoPromedio = _promedioCumplimiento(unidades);

    // Aggregate global KPIs across all units
    var kpisGlobales = [];
    for (var i = 0; i < unidades.length; i++) {
      var u = unidades[i];
      for (var j = 0; j < (u.kpis || []).length; j++) {
        kpisGlobales.push(u.kpis[j]);
      }
    }

    // Recent activity across all units (last 10 per unit, merged + sorted)
    var actividadGlobal = [];
    for (var ai = 0; ai < unidades.length; ai++) {
      var au = unidades[ai];
      for (var aj = 0; aj < (au.actividadReciente || []).length; aj++) {
        actividadGlobal.push({
          unitKey:     au.unitKey,
          unitLabel:   au.label,
          fecha:       au.actividadReciente[aj].fecha,
          descripcion: au.actividadReciente[aj].descripcion,
          tipo:        au.actividadReciente[aj].tipo,
        });
      }
    }
    actividadGlobal.sort(function (a, b) {
      return a.fecha > b.fecha ? -1 : a.fecha < b.fecha ? 1 : 0;
    });
    actividadGlobal = actividadGlobal.slice(0, 20);

    return {
      generadoEn:          new Date().toISOString(),
      unidades:            unidades,
      semaforos:           semaforos,
      alertasCriticas:     alertasCriticas,
      kpisGlobales:        kpisGlobales,
      actividadGlobal:     actividadGlobal,
      globales: {
        cumplimientoPromedio: cumplimientoPromedio,
        alertasCriticasCount: alertasCriticas.length,
        resumenFinanciero:    financiero,
        unidadesOk:          unidades.filter(function(u) { return u.estado === "ok"; }).length,
        unidadesWarning:     unidades.filter(function(u) { return u.estado === "warning"; }).length,
        unidadesCritical:    unidades.filter(function(u) { return u.estado === "critical"; }).length,
      },
      errores: errores,
    };
  }

  function getUnitSummary(unitKey, wsId) {
    var adapter = _adapters[unitKey];
    if (!adapter) throw new Error("No adapter registered for unit: " + unitKey);
    return adapter.getResumen(wsId);
  }

  function getRegisteredAdapters() {
    return Object.keys(_adapters);
  }

  return {
    register:                register,
    getConsolidatedDashboard: getConsolidatedDashboard,
    getUnitSummary:          getUnitSummary,
    getRegisteredAdapters:   getRegisteredAdapters,
  };
})();
