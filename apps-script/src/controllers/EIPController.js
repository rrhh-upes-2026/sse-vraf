/**
 * EIPController — Executive Intelligence Platform.
 * Pure read-only consumer. Aggregates data from all engines without modifying them.
 * Does NOT own any entity sheets.
 */
var EIPController = (function () {

  // ── Private helpers ───────────────────────────────────────────────────────────

  function _color_(score) {
    var s = Number(score) || 0;
    if (s >= 90) return "Verde";
    if (s >= 75) return "Amarillo";
    if (s >= 60) return "Naranja";
    return "Rojo";
  }

  function _trend_(curr, prev) {
    var c = Number(curr) || 0;
    var p = Number(prev) || 0;
    if (Math.abs(c - p) < 2) return "stable";
    return c > p ? "up" : "down";
  }

  // ── Cross-engine data loaders ─────────────────────────────────────────────────

  function _snaps_()   { return listEntities_("cpeSnapshots",   {}) || []; }
  function _planes_()  { return listEntities_("apePlanes",      {}) || []; }
  function _ejecs_()   { return listEntities_("aeeEjecuciones", {}) || []; }
  function _evids_()   { return listEntities_("emeEvidencias",  {}) || []; }
  function _inds_()    { return listEntities_("imeIndicadores", {}) || []; }
  function _procs_()   { return listEntities_("pmeProcesos",    {}) || []; }
  function _mejora_()  { return listEntities_("cpePlanesMejora",{}) || []; }

  function _latestSnap_(snaps) {
    var s = (snaps || []).slice();
    s.sort(function (a, b) { return a.calculatedAt > b.calculatedAt ? -1 : 1; });
    return s.length > 0 ? s[0] : null;
  }

  // ── Ranking computations ──────────────────────────────────────────────────────

  function _processRanking_(planes, ejecs) {
    var byProc = {};
    (planes || []).forEach(function (plan) {
      var pid = plan.processId || plan.id;
      if (!byProc[pid]) byProc[pid] = { id: pid, label: pid, planned: 0, executed: 0 };
      byProc[pid].planned++;
      (ejecs || []).forEach(function (e) {
        if (e.planId === plan.id && e.status === "Finalizada") byProc[pid].executed++;
      });
    });
    return Object.keys(byProc).map(function (pid) {
      var p = byProc[pid];
      var score = p.planned > 0 ? Math.min(100, Math.round((p.executed / p.planned) * 100)) : 0;
      return { rank: 0, id: p.id, label: p.label, type: "proceso", score: score, semaforo: _color_(score), trend: "stable", details: { planned: p.planned, executed: p.executed } };
    }).sort(function (a, b) { return b.score - a.score; }).map(function (r, i) { r.rank = i + 1; return r; });
  }

  function _unitRanking_(planes, ejecs) {
    var byUnit = {};
    (planes || []).forEach(function (plan) {
      var uid = plan.organizationalUnitId || "SIN-UNIDAD";
      if (!byUnit[uid]) byUnit[uid] = { id: uid, label: uid, planned: 0, executed: 0 };
      byUnit[uid].planned++;
      (ejecs || []).forEach(function (e) {
        if (e.planId === plan.id && e.status === "Finalizada") byUnit[uid].executed++;
      });
    });
    return Object.keys(byUnit).map(function (uid) {
      var u = byUnit[uid];
      var score = u.planned > 0 ? Math.min(100, Math.round((u.executed / u.planned) * 100)) : 0;
      return { rank: 0, id: u.id, label: u.label, type: "unidad", score: score, semaforo: _color_(score), trend: "stable", details: { planned: u.planned, executed: u.executed } };
    }).sort(function (a, b) { return b.score - a.score; }).map(function (r, i) { r.rank = i + 1; return r; });
  }

  function _indicatorRanking_(inds) {
    return (inds || []).map(function (ind) {
      var hasTarget = ind.targetValue && ind.targetValue !== "";
      var score = hasTarget ? 75 : 25;
      return { rank: 0, id: ind.id, label: ind.name || ind.id, type: "indicador", score: score, semaforo: _color_(score), trend: "stable", details: { unit: ind.unit || "", hasTarget: hasTarget } };
    }).sort(function (a, b) { return b.score - a.score; }).map(function (r, i) { r.rank = i + 1; return r; });
  }

  function _responsableRanking_(ejecs) {
    var byResp = {};
    (ejecs || []).forEach(function (ej) {
      var resp = ej.responsibleUserId || ej.createdBy || "Desconocido";
      if (!byResp[resp]) byResp[resp] = { id: resp, label: resp, total: 0, completed: 0 };
      byResp[resp].total++;
      if (ej.status === "Finalizada") byResp[resp].completed++;
    });
    return Object.keys(byResp).map(function (resp) {
      var r = byResp[resp];
      var score = r.total > 0 ? Math.min(100, Math.round((r.completed / r.total) * 100)) : 0;
      return { rank: 0, id: r.id, label: r.label, type: "responsable", score: score, semaforo: _color_(score), trend: "stable", details: { total: r.total, completed: r.completed } };
    }).sort(function (a, b) { return b.score - a.score; }).map(function (r, i) { r.rank = i + 1; return r; });
  }

  // ── Alert generation ──────────────────────────────────────────────────────────

  function _generateAlerts_(snaps, planesOverdue) {
    var alerts = [];
    var now = new Date().toISOString();

    if (snaps.length >= 2) {
      var curr = Number(snaps[0].overallScore) || 0;
      var prev = Number(snaps[1].overallScore) || 0;
      var drop = prev - curr;
      if (drop >= 10) {
        alerts.push({ id: "alert-drop-" + snaps[0].id, type: "caida_desempeno", severity: drop >= 20 ? "critica" : "alta", title: "Caída de desempeño detectada", description: "El puntaje global cayó " + Math.round(drop) + " puntos respecto al periodo anterior (" + Math.round(prev) + " → " + Math.round(curr) + ").", value: curr, threshold: prev, generatedAt: now });
      }
      var riskOrder = ["Muy Bajo", "Bajo", "Medio", "Alto", "Crítico"];
      var rCurr = riskOrder.indexOf(snaps[0].riskLevel || "");
      var rPrev = riskOrder.indexOf(snaps[1].riskLevel || "");
      if (rCurr > rPrev && rCurr >= 0) {
        alerts.push({ id: "alert-risk-" + snaps[0].id, type: "incremento_riesgo", severity: rCurr >= 4 ? "critica" : rCurr >= 3 ? "alta" : "media", title: "Nivel de riesgo aumentó", description: "El riesgo institucional escaló de \"" + (snaps[1].riskLevel || "N/D") + "\" a \"" + (snaps[0].riskLevel || "N/D") + "\".", generatedAt: now });
      }
    }

    if (snaps.length > 0) {
      var score = Number(snaps[0].overallScore) || 0;
      if (score < 60) {
        alerts.push({ id: "alert-score-" + snaps[0].id, type: "incumplimiento_critico", severity: score < 40 ? "critica" : "alta", title: "Puntaje de cumplimiento crítico", description: "Puntaje global " + Math.round(score) + "/100, por debajo del umbral mínimo aceptable (60).", value: score, threshold: 60, generatedAt: now });
      }
      var docScore = Number(snaps[0].documentationScore) || 0;
      if (docScore < 50) {
        alerts.push({ id: "alert-doc-" + snaps[0].id, type: "documentacion_insuficiente", severity: "media", title: "Documentación insuficiente", description: "Score de documentación: " + Math.round(docScore) + "%. Hay evidencias faltantes o rechazadas.", value: docScore, threshold: 50, generatedAt: now });
      }
    }

    if (planesOverdue.length > 0) {
      alerts.push({ id: "alert-planes-" + new Date().getTime(), type: "planes_mejora_vencidos", severity: planesOverdue.length >= 5 ? "alta" : "media", title: planesOverdue.length + " plan(es) de mejora vencido(s)", description: "Existen " + planesOverdue.length + " planes de mejora con fecha objetivo pasada sin completar.", value: planesOverdue.length, generatedAt: now });
    }

    var sevOrd = { critica: 0, alta: 1, media: 2, informativa: 3 };
    alerts.sort(function (a, b) { return (sevOrd[a.severity] || 3) - (sevOrd[b.severity] || 3); });
    return alerts;
  }

  // ── Heat map builder ──────────────────────────────────────────────────────────

  function _buildHeatMap_(planes, ejecs, type) {
    var ranking = type === "unidad" ? _unitRanking_(planes, ejecs) : _processRanking_(planes, ejecs);
    return ranking.map(function (r) {
      return { id: r.id, label: r.label, type: type || "proceso", score: r.score, semaforo: r.semaforo };
    });
  }

  // ── Public handlers ───────────────────────────────────────────────────────────

  function getDashboard(params) {
    var year  = Number(params.year) || new Date().getFullYear();
    var now   = new Date().toISOString();

    var snaps  = _snaps_();
    snaps.sort(function (a, b) { return a.calculatedAt > b.calculatedAt ? -1 : 1; });
    var latest = snaps.length > 0 ? snaps[0] : null;
    var planes = _planes_();
    var ejecs  = _ejecs_();
    var inds   = _inds_();
    var mejora = _mejora_();

    var overallScore = latest ? Number(latest.overallScore) || 0 : 0;

    var kpis = [
      { id: "kpi-planning",      label: "Planificación",     value: latest ? Number(latest.planningScore)       || 0 : 0, unit: "%", trend: snaps.length >= 2 ? _trend_(latest.planningScore,       snaps[1].planningScore)       : "stable", trendValue: snaps.length >= 2 ? Math.round(Math.abs((Number(latest.planningScore)       || 0) - (Number(snaps[1].planningScore)       || 0))) : 0, semaforo: _color_(latest ? latest.planningScore       : 0), description: "Actividades ejecutadas vs planificadas" },
      { id: "kpi-execution",     label: "Ejecución",         value: latest ? Number(latest.executionScore)      || 0 : 0, unit: "%", trend: snaps.length >= 2 ? _trend_(latest.executionScore,      snaps[1].executionScore)      : "stable", trendValue: snaps.length >= 2 ? Math.round(Math.abs((Number(latest.executionScore)      || 0) - (Number(snaps[1].executionScore)      || 0))) : 0, semaforo: _color_(latest ? latest.executionScore      : 0), description: "Actividades finalizadas" },
      { id: "kpi-documentation", label: "Documentación",    value: latest ? Number(latest.documentationScore)  || 0 : 0, unit: "%", trend: snaps.length >= 2 ? _trend_(latest.documentationScore,  snaps[1].documentationScore)  : "stable", trendValue: snaps.length >= 2 ? Math.round(Math.abs((Number(latest.documentationScore)  || 0) - (Number(snaps[1].documentationScore)  || 0))) : 0, semaforo: _color_(latest ? latest.documentationScore  : 0), description: "Evidencias validadas vs requeridas" },
      { id: "kpi-improvement",   label: "Planes Completados",value: mejora.filter(function (p) { return p.status === "Completado"; }).length, unit: "planes", trend: "stable", trendValue: 0, semaforo: "Verde", description: "Planes de mejora finalizados" },
    ];

    var planesOverdue = mejora.filter(function (p) {
      return (p.status === "Pendiente" || p.status === "En proceso") && p.targetDate && p.targetDate < now;
    });

    var brechas = [];
    (planes || []).forEach(function (plan) {
      if (plan.plannedEndDate && plan.plannedEndDate < now) {
        var ejs = (ejecs || []).filter(function (e) { return e.planId === plan.id && e.status === "Finalizada"; });
        if (ejs.length === 0) {
          brechas.push({ tipo: "actividad_no_ejecutada", descripcion: "Plan vencido sin ejecución: " + (plan.title || plan.id), severidad: "alta", entidadId: plan.id, entidadTipo: "apePlan", fechaDeteccion: now });
        }
      }
    });

    var risks = [];
    if (overallScore < 60) {
      risks.push({ id: "risk-score", type: "cumplimiento_bajo", level: overallScore < 40 ? "critico" : "alto", description: "Puntaje global " + overallScore + "/100 por debajo del umbral.", value: overallScore });
    }
    if (planesOverdue.length > 0) {
      risks.push({ id: "risk-planes", type: "planes_vencidos", level: planesOverdue.length >= 5 ? "alto" : "medio", description: planesOverdue.length + " planes de mejora vencidos.", value: planesOverdue.length });
    }

    return {
      overallScore:    overallScore,
      semaforo:        _color_(overallScore),
      kpis:            kpis,
      topUnits:        _unitRanking_(planes, ejecs).slice(0, 5),
      topProcesses:    _processRanking_(planes, ejecs).slice(0, 5),
      topIndicators:   _indicatorRanking_(inds).slice(0, 5),
      criticalBrechas: brechas.slice(0, 5),
      risks:           risks,
      alerts:          _generateAlerts_(snaps, planesOverdue).slice(0, 10),
      heatMapSummary:  _buildHeatMap_(planes, ejecs, "proceso").slice(0, 8),
      generatedAt:     now,
    };
  }

  function getScorecard(params) {
    var now    = new Date().toISOString();
    var snaps  = _snaps_();
    var latest = _latestSnap_(snaps);
    var planes = _planes_();
    var ejecs  = _ejecs_();
    var inds   = _inds_();

    var planScore = latest ? Number(latest.planningScore)       || 0 : 0;
    var execScore = latest ? Number(latest.executionScore)      || 0 : 0;
    var docScore  = latest ? Number(latest.documentationScore)  || 0 : 0;
    var overall   = latest ? Number(latest.overallScore)        || 0 : 0;

    var ejTotal   = (ejecs || []).length;
    var ejFin     = (ejecs || []).filter(function (e) { return e.status === "Finalizada"; }).length;
    var ejRate    = ejTotal > 0 ? Math.round((ejFin / ejTotal) * 100) : 0;

    var indWithTarget = (inds || []).filter(function (i) { return i.targetValue && i.targetValue !== ""; }).length;
    var indPct = inds.length > 0 ? Math.round((indWithTarget / inds.length) * 100) : 0;

    var items = [
      { id: "bsc-f1", perspective: "financiera",    objective: "Eficiencia documental",              indicator: "Índice de evidencias validadas",              target: 90,  actual: docScore,    unit: "%",        score: docScore,    semaforo: _color_(docScore) },
      { id: "bsc-f2", perspective: "financiera",    objective: "Optimización de procesos de soporte", indicator: "Planes de mejora activos vs completados",   target: 100, actual: null,        unit: "%",        score: 50,          semaforo: _color_(50) },
      { id: "bsc-p1", perspective: "procesos",      objective: "Cumplimiento de planificación",       indicator: "Tasa de planificación ejecutada",           target: 90,  actual: planScore,   unit: "%",        score: planScore,   semaforo: _color_(planScore) },
      { id: "bsc-p2", perspective: "procesos",      objective: "Ejecución efectiva de actividades",   indicator: "Tasa de ejecución operativa",               target: 85,  actual: execScore,   unit: "%",        score: execScore,   semaforo: _color_(execScore) },
      { id: "bsc-p3", perspective: "procesos",      objective: "Gestión de procesos activos",         indicator: "Procesos con plan de actividades vigente",  target: 100, actual: planes.length > 0 ? 75 : 0, unit: "%", score: planes.length > 0 ? 75 : 0, semaforo: _color_(planes.length > 0 ? 75 : 0) },
      { id: "bsc-a1", perspective: "aprendizaje",   objective: "Capacidad de ejecución operativa",    indicator: "Tasa de finalización de actividades",       target: 85,  actual: ejRate,      unit: "%",        score: ejRate,      semaforo: _color_(ejRate) },
      { id: "bsc-a2", perspective: "aprendizaje",   objective: "Gestión del conocimiento",            indicator: "Indicadores con objetivo configurado",      target: 100, actual: indPct,       unit: "%",        score: indPct,      semaforo: _color_(indPct) },
      { id: "bsc-c1", perspective: "clientes",      objective: "Cumplimiento normativo institucional", indicator: "Puntaje global de cumplimiento",           target: 90,  actual: overall,     unit: "%",        score: overall,     semaforo: _color_(overall) },
      { id: "bsc-c2", perspective: "clientes",      objective: "Calidad en la entrega de resultados",  indicator: "Evidencias validadas del total",           target: 95,  actual: docScore,    unit: "%",        score: docScore,    semaforo: _color_(docScore) },
    ];

    var perspectives = { financiera: [], procesos: [], aprendizaje: [], clientes: [] };
    items.forEach(function (item) {
      if (perspectives[item.perspective]) perspectives[item.perspective].push(item);
    });

    var avgScore = items.length > 0 ? Math.round(items.reduce(function (s, i) { return s + i.score; }, 0) / items.length) : 0;

    return { perspectives: perspectives, overallScore: avgScore, generatedAt: now };
  }

  function getHeatMap(params) {
    var type   = params.type || "proceso";
    var planes = _planes_();
    var ejecs  = _ejecs_();
    return _buildHeatMap_(planes, ejecs, type);
  }

  function getTrends(params) {
    var snaps = _snaps_();
    snaps.sort(function (a, b) { return a.snapshotDate > b.snapshotDate ? 1 : -1; });

    function toPoints(field) {
      return snaps.map(function (s) {
        var score = Number(s[field]) || 0;
        var m = Number(s.month) || 1;
        return { period: s.year + "-" + (m < 10 ? "0" + m : m), year: Number(s.year), month: m, score: score, semaforo: _color_(score) };
      });
    }

    return [
      { label: "Cumplimiento Global", entityId: "global",        entityType: "global", color: "#1D4ED8", points: toPoints("overallScore") },
      { label: "Planificación",        entityId: "planning",      entityType: "global", color: "#059669", points: toPoints("planningScore") },
      { label: "Ejecución",            entityId: "execution",     entityType: "global", color: "#0E7490", points: toPoints("executionScore") },
      { label: "Documentación",        entityId: "documentation", entityType: "global", color: "#7C3AED", points: toPoints("documentationScore") },
    ];
  }

  function getAlerts(params) {
    var snaps  = _snaps_();
    snaps.sort(function (a, b) { return a.calculatedAt > b.calculatedAt ? -1 : 1; });
    var mejora = _mejora_();
    var now    = new Date().toISOString();
    var planesOverdue = mejora.filter(function (p) {
      return (p.status === "Pendiente" || p.status === "En proceso") && p.targetDate && p.targetDate < now;
    });
    var alerts = _generateAlerts_(snaps, planesOverdue);
    if (params.severity) {
      alerts = alerts.filter(function (a) { return a.severity === params.severity; });
    }
    return alerts.slice(0, Number(params.limit) || 50);
  }

  function getTimeline(params) {
    var year     = Number(params.year) || new Date().getFullYear();
    var limit    = Number(params.limit) || 50;
    var yearStr  = String(year);
    var typeFilter = params.types ? String(params.types).split(",") : null;
    var events   = [];

    (_planes_() || []).forEach(function (plan) {
      if (plan.plannedStartDate && String(plan.plannedStartDate).indexOf(yearStr) !== -1) {
        events.push({ id: "ev-plan-" + plan.id, type: "planificacion", title: "Plan de actividad creado", description: plan.title || plan.id, date: plan.plannedStartDate, entityId: plan.id, entityType: "apePlan", status: plan.status });
      }
    });

    (_ejecs_() || []).forEach(function (ej) {
      if (ej.executedAt && String(ej.executedAt).indexOf(yearStr) !== -1) {
        events.push({ id: "ev-ej-" + ej.id, type: "ejecucion", title: "Actividad ejecutada", description: (ej.activityName || ej.id) + " — " + (ej.status || ""), date: ej.executedAt, entityId: ej.id, entityType: "aeeEjecucion", status: ej.status });
      }
    });

    (_evids_() || []).forEach(function (ev) {
      if (ev.createdAt && String(ev.createdAt).indexOf(yearStr) !== -1) {
        events.push({ id: "ev-eme-" + ev.id, type: "evidencia", title: "Evidencia cargada", description: ev.title || ev.id, date: ev.createdAt, entityId: ev.id, entityType: "emeEvidencia", status: ev.status });
      }
    });

    (_mejora_() || []).forEach(function (p) {
      if (p.createdAt && String(p.createdAt).indexOf(yearStr) !== -1) {
        events.push({ id: "ev-mejora-" + p.id, type: "plan_mejora", title: "Plan de mejora creado", description: p.title || p.id, date: p.createdAt, entityId: p.id, entityType: "cpePlanMejora", status: p.status });
      }
    });

    if (typeFilter && typeFilter.length > 0) {
      events = events.filter(function (e) { return typeFilter.indexOf(e.type) !== -1; });
    }

    events.sort(function (a, b) { return a.date > b.date ? -1 : 1; });
    return events.slice(0, limit);
  }

  function getRanking(params) {
    var type   = params.type || "proceso";
    var limit  = Number(params.limit) || 20;
    var planes = _planes_();
    var ejecs  = _ejecs_();
    var inds   = _inds_();
    var ranking;

    if      (type === "unidad")      ranking = _unitRanking_(planes, ejecs);
    else if (type === "indicador")   ranking = _indicatorRanking_(inds);
    else if (type === "responsable") ranking = _responsableRanking_(ejecs);
    else                             ranking = _processRanking_(planes, ejecs);

    return ranking.slice(0, limit);
  }

  function getComparativo(params) {
    var type = params.type || "mes-vs-mes";
    var now  = new Date();
    var cY   = Number(params.currentYear)   || now.getFullYear();
    var cM   = Number(params.currentMonth)  || (now.getMonth() + 1);
    var pY   = Number(params.previousYear)  || (cM === 1 ? cY - 1 : cY);
    var pM   = Number(params.previousMonth) || (cM === 1 ? 12 : cM - 1);
    var nowStr = now.toISOString();

    if (type === "mes-vs-mes" || type === "año-vs-año") {
      var snaps = _snaps_();
      var cSnap = snaps.filter(function (s) { return Number(s.year) === cY && Number(s.month) === cM; })[0] || null;
      var pSnap = snaps.filter(function (s) { return Number(s.year) === pY && Number(s.month) === pM; })[0] || null;

      var dims = [
        { id: "overall",       label: "Puntaje Global", c: cSnap ? Number(cSnap.overallScore)       || 0 : 0, p: pSnap ? Number(pSnap.overallScore)       || 0 : 0 },
        { id: "planning",      label: "Planificación",  c: cSnap ? Number(cSnap.planningScore)      || 0 : 0, p: pSnap ? Number(pSnap.planningScore)      || 0 : 0 },
        { id: "execution",     label: "Ejecución",      c: cSnap ? Number(cSnap.executionScore)     || 0 : 0, p: pSnap ? Number(pSnap.executionScore)     || 0 : 0 },
        { id: "documentation", label: "Documentación",  c: cSnap ? Number(cSnap.documentationScore) || 0 : 0, p: pSnap ? Number(pSnap.documentationScore) || 0 : 0 },
      ];

      var items = dims.map(function (d) {
        var variation = d.c - d.p;
        return { entityId: d.id, entityLabel: d.label, current: d.c, previous: d.p, variation: Math.round(variation * 10) / 10, variationPct: d.p > 0 ? Math.round((variation / d.p) * 1000) / 10 : 0, trend: _trend_(d.c, d.p) };
      });

      var pad = function (n) { return n < 10 ? "0" + n : String(n); };
      return { type: type, currentPeriod: cY + "-" + pad(cM), previousPeriod: pY + "-" + pad(pM), items: items, generatedAt: nowStr };
    }

    var planes = _planes_();
    var ejecs  = _ejecs_();
    var ranking = type === "unidad-vs-unidad" ? _unitRanking_(planes, ejecs) : _processRanking_(planes, ejecs);
    var items = ranking.slice(0, 10).map(function (r) {
      return { entityId: r.id, entityLabel: r.label, current: r.score, previous: r.score, variation: 0, variationPct: 0, trend: "stable" };
    });

    return { type: type, currentPeriod: String(cY), previousPeriod: String(pY), items: items, generatedAt: nowStr };
  }

  // ── Public interface ──────────────────────────────────────────────────────────
  return {
    getDashboard:   getDashboard,
    getScorecard:   getScorecard,
    getHeatMap:     getHeatMap,
    getTrends:      getTrends,
    getAlerts:      getAlerts,
    getTimeline:    getTimeline,
    getRanking:     getRanking,
    getComparativo: getComparativo,
  };
})();
