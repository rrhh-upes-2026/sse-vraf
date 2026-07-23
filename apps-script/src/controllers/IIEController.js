/**
 * IIEController — Institutional Intelligence Engine.
 *
 * Pure analytical engine. Contains 5 internal sub-engines:
 *   1. DiagnosisEngine      — structured institutional diagnosis via rules
 *   2. RecommendationEngine — prioritized, explainable recommendations
 *   3. PredictionEngine     — deterministic linear-trend forecasting
 *   4. AnomalyDetectionEngine — pattern & deviation detection
 *   5. NarrativeEngine      — template-based executive text generation
 *
 * Plus: InstitutionalSemanticService — structured semantic query endpoint
 * for future AI provider integration (no AI implemented here).
 *
 * Reads from: cpeSnapshots, cpePlanesMejora, apePlanes, aeeEjecuciones,
 *             emeEvidencias, imeIndicadores, pmeProcesos + own config sheets.
 * Writes to:  iieConfiguration, iieKnowledgeRules only (own config sheets).
 * NEVER writes to: IME, PME, APE, AEE, EME, CPE, EIP sheets.
 */
var IIEController = (function () {
  var IIE_WS = "iie";

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA LOADERS — cross-engine reads via SheetRepository contracts
  // ═══════════════════════════════════════════════════════════════════════════

  function _snaps_()   { try { return listEntities_("cpeSnapshots",    {}) || []; } catch (e) { return []; } }
  function _planes_()  { try { return listEntities_("apePlanes",       {}) || []; } catch (e) { return []; } }
  function _ejecs_()   { try { return listEntities_("aeeEjecuciones",  {}) || []; } catch (e) { return []; } }
  function _evids_()   { try { return listEntities_("emeEvidencias",   {}) || []; } catch (e) { return []; } }
  function _inds_()    { try { return listEntities_("imeIndicadores",  {}) || []; } catch (e) { return []; } }
  function _procs_()   { try { return listEntities_("pmeProcesos",     {}) || []; } catch (e) { return []; } }
  function _mejora_()  { try { return listEntities_("cpePlanesMejora", {}) || []; } catch (e) { return []; } }
  function _config_()  { try { return listEntities_("iieConfiguration",  {}) || []; } catch (e) { return []; } }
  function _rules_()   { try { return listEntities_("iieKnowledgeRules", {}) || []; } catch (e) { return []; } }
  function _mparams_() { try { return listEntities_("iieModelParameters",{}) || []; } catch (e) { return []; } }

  // ─── Config access helpers ─────────────────────────────────────────────────

  function _cfgNum_(key, def) {
    var items = _config_();
    var item = items.find(function (c) { return c.key === key; });
    return item ? Number(item.value) : def;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCORING & CLASSIFICATION HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  function _riskLevel_(score) {
    var verde    = _cfgNum_("cumplimiento.umbral.verde",    90);
    var amarillo = _cfgNum_("cumplimiento.umbral.amarillo", 75);
    var naranja  = _cfgNum_("cumplimiento.umbral.naranja",  60);
    if (score >= verde)    return "bajo";
    if (score >= amarillo) return "medio";
    if (score >= naranja)  return "alto";
    return "critico";
  }

  function _confidenceLevel_(score) {
    if (score >= 80) return "muy_alta";
    if (score >= 60) return "alta";
    if (score >= 40) return "media";
    return "baja";
  }

  // ─── Confidence score (0-100) based on 4 data quality dimensions ──────────

  function _confidence_(dataCount, recencyDays, indicatorCoverage, documentationRate) {
    var wData  = _cfgNum_("confianza.peso.datos",          0.25);
    var wRec   = _cfgNum_("confianza.peso.actualidad",     0.25);
    var wCov   = _cfgNum_("confianza.peso.cobertura",      0.30);
    var wDoc   = _cfgNum_("confianza.peso.documentacion",  0.20);
    var dataSrc = Math.min(100, (dataCount || 0) * 5);
    var recency = Math.max(0, 100 - Math.min(100, recencyDays || 30));
    var cov     = Math.min(100, indicatorCoverage || 0);
    var doc     = Math.min(100, documentationRate || 0);
    return Math.round(dataSrc * wData + recency * wRec + cov * wCov + doc * wDoc);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGINE 1 — RULES ENGINE
  // ═══════════════════════════════════════════════════════════════════════════

  function _parseJson_(str, def) {
    if (!str) return def;
    if (typeof str !== "string") return str;
    try { return JSON.parse(str); } catch (e) { return def; }
  }

  function _evalCondition_(ctx, cond) {
    var val = ctx[cond.field];
    if (val === undefined || val === null) return false;
    switch (cond.operator) {
      case "lt":  return Number(val) <  Number(cond.value);
      case "lte": return Number(val) <= Number(cond.value);
      case "gt":  return Number(val) >  Number(cond.value);
      case "gte": return Number(val) >= Number(cond.value);
      case "eq":  return String(val) === String(cond.value);
      case "neq": return String(val) !== String(cond.value);
      default:    return false;
    }
  }

  function _applyRules_(rules, ctx) {
    var results = [];
    rules.forEach(function (rule) {
      if (!rule.enabled && rule.enabled !== undefined) return;
      var conditions   = _parseJson_(rule.conditions,   []);
      var consequences = _parseJson_(rule.consequences, []);
      var logic = (rule.logic || "AND").toUpperCase();
      var matched = logic === "OR"
        ? conditions.some(function (c)  { return _evalCondition_(ctx, c); })
        : conditions.every(function (c) { return _evalCondition_(ctx, c); });
      if (matched) {
        results.push({
          ruleId:      rule.id,
          ruleName:    rule.name,
          consequences: consequences,
          weight:       Number(rule.weight)     || 1,
          confidence:   Number(rule.confidence) || 80,
        });
      }
    });
    return results;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGINE 2 — DIAGNOSIS ENGINE
  // ═══════════════════════════════════════════════════════════════════════════

  function _aggregateMetrics_(snaps, ejecs, evids, inds) {
    var totalScore = 0, totalBrechas = 0, totalEvidencias = 0;
    (snaps || []).forEach(function (s) {
      totalScore     += Number(s.overallScore || 0);
      totalBrechas   += Number(s.brechas || 0);
    });
    var avgScore = snaps && snaps.length > 0 ? Math.round(totalScore / snaps.length) : 0;

    var evidCount = (evids || []).length;
    var indCount  = (inds  || []).length;
    var indWithMeta = (inds || []).filter(function (i) { return Number(i.meta || 0) > 0; }).length;
    var indCoverage = indCount > 0 ? Math.round((indWithMeta / indCount) * 100) : 0;
    var docRate  = evidCount > 0 ? Math.min(100, evidCount * 10) : 0;

    return {
      cumplimiento:       avgScore,
      brechas:            totalBrechas,
      evidencias:         evidCount,
      indicatorCoverage:  indCoverage,
      dataCount:          (snaps || []).length,
      recencyDays:        7,
      documentationRate:  docRate,
    };
  }

  function _buildDiagnosis_(entityType, entityId, entityLabel, metrics, rules) {
    var applied = _applyRules_(rules, metrics);
    var score   = metrics.cumplimiento || 0;
    var riskOverride;

    applied.forEach(function (r) {
      r.consequences.forEach(function (c) {
        if (c.field === "riskLevel") riskOverride = String(c.value);
      });
    });

    var riskLevel = riskOverride || _riskLevel_(score);
    var conf = _confidence_(metrics.dataCount, metrics.recencyDays, metrics.indicatorCoverage, metrics.documentationRate);

    var factors = [
      { name: "Cumplimiento",   value: score,                     impact: score >= 75 ? "positivo" : "negativo",                              weight: 0.4, description: "Tasa de cumplimiento de actividades planificadas" },
      { name: "Brechas",        value: metrics.brechas || 0,      impact: (metrics.brechas || 0) > 5 ? "negativo" : "neutro",                 weight: 0.2, description: "Número de brechas detectadas en el período" },
      { name: "Evidencias",     value: metrics.evidencias || 0,   impact: (metrics.evidencias || 0) > 0 ? "positivo" : "negativo",            weight: 0.2, description: "Documentos de evidencia registrados" },
      { name: "Cobertura Ind.", value: metrics.indicatorCoverage || 0, impact: (metrics.indicatorCoverage || 0) >= 70 ? "positivo" : "negativo", weight: 0.2, description: "Porcentaje de indicadores con meta definida" },
    ];

    var summary = _diagSummary_(entityLabel, riskLevel, score, metrics);

    return {
      id:              IdGen.id(),
      entityType:      entityType,
      entityId:        entityId,
      entityLabel:     entityLabel,
      period:          new Date().toISOString().slice(0, 7),
      riskLevel:       riskLevel,
      overallScore:    score,
      confidenceScore: conf,
      confidenceLevel: _confidenceLevel_(conf),
      factors:         factors,
      summary:         summary,
      appliedRules:    applied.map(function (r) { return r.ruleName; }),
      dataCompleteness: Math.min(100, (metrics.dataCount || 0) * 10),
      dataRecency:      Math.max(0, 100 - (metrics.recencyDays || 30)),
      generatedAt:     new Date().toISOString(),
    };
  }

  function _diagSummary_(label, risk, score, m) {
    var parts = [label + " presenta nivel de riesgo " + risk + " con " + score + "% de cumplimiento."];
    if ((m.brechas || 0) > 10) parts.push("Se identificaron " + m.brechas + " brechas que requieren atención prioritaria.");
    if (score < 70) parts.push("El cumplimiento está por debajo del umbral mínimo institucional (70%).");
    if ((m.evidencias || 0) === 0) parts.push("No se registran evidencias documentales en el período analizado.");
    if ((m.indicatorCoverage || 0) < 50) parts.push("La cobertura de indicadores es insuficiente.");
    return parts.join(" ");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGINE 3 — RECOMMENDATION ENGINE
  // ═══════════════════════════════════════════════════════════════════════════

  function _buildRecommendations_(diagnoses, rules) {
    var recs = [];
    diagnoses.forEach(function (d) {
      if (d.riskLevel === "critico" || d.riskLevel === "alto") {
        recs.push({
          id:          IdGen.id(),
          title:       "Revisar planificación — " + d.entityLabel,
          description: "El nivel de riesgo " + d.riskLevel + " requiere intervención en la planificación institucional.",
          priority:    d.riskLevel === "critico" ? "critica" : "alta",
          impact:      "alto",
          urgency:     d.riskLevel === "critico" ? "critica" : "alta",
          justification:        d.summary,
          suggestedResponsible: "Dirección de " + d.entityLabel,
          entityType:  d.entityType,
          entityId:    d.entityId,
          entityLabel: d.entityLabel,
          why:         "Análisis operativo detecta incumplimiento sostenido en " + d.entityLabel + " con " + d.overallScore + "% de cumplimiento.",
          sourceData:  d.factors.map(function (f) { return { source: f.name, value: f.value, label: f.description }; }),
          expectedImpact:        "Reducción del riesgo de " + d.riskLevel + " a medio en 60 días con seguimiento activo.",
          consequenceIfIgnored:  "Escalamiento del riesgo institucional y posible impacto en procesos acreditación.",
          confidenceScore:       d.confidenceScore,
          status:       "pendiente",
          appliedRule:  d.appliedRules[0] || null,
          estimatedEffort: d.riskLevel === "critico" ? "Alta" : "Media",
          generatedAt:  new Date().toISOString(),
        });
      }

      var hasNoEvid = d.factors.some(function (f) { return f.name === "Evidencias" && Number(f.value) === 0; });
      if (hasNoEvid) {
        recs.push({
          id:          IdGen.id(),
          title:       "Completar documentación — " + d.entityLabel,
          description: "No existen evidencias documentadas en el período actual.",
          priority:    "media",
          impact:      "medio",
          urgency:     "media",
          justification:        "La ausencia de evidencias impacta el puntaje de calidad documental.",
          entityType:  d.entityType,
          entityId:    d.entityId,
          entityLabel: d.entityLabel,
          why:         "Ausencia total de documentación en el período analizado.",
          sourceData:  [{ source: "Evidencias", value: 0, label: "Documentos registrados" }],
          expectedImpact:       "Mejora del 10–15% en el puntaje de cumplimiento documental.",
          consequenceIfIgnored: "Deterioro continuo del indicador de calidad documental.",
          confidenceScore:      Math.min(d.confidenceScore, 70),
          status:       "pendiente",
          generatedAt:  new Date().toISOString(),
        });
      }

      var lowInd = d.factors.some(function (f) { return f.name === "Cobertura Ind." && Number(f.value) < 50; });
      if (lowInd) {
        recs.push({
          id:          IdGen.id(),
          title:       "Ampliar cobertura de indicadores — " + d.entityLabel,
          description: "La cobertura de indicadores con meta definida es inferior al 50%.",
          priority:    "media",
          impact:      "medio",
          urgency:     "baja",
          justification:        "Los indicadores sin meta no pueden ser evaluados para el cálculo de cumplimiento.",
          entityType:  d.entityType,
          entityId:    d.entityId,
          entityLabel: d.entityLabel,
          why:         "Solo " + (d.factors.find(function (f) { return f.name === "Cobertura Ind."; }) || { value: 0 }).value + "% de indicadores tienen meta definida.",
          sourceData:  [{ source: "Cobertura Indicadores", value: d.factors.find(function (f) { return f.name === "Cobertura Ind."; }) ? d.factors.find(function (f) { return f.name === "Cobertura Ind."; }).value : 0, label: "% con meta" }],
          expectedImpact:       "Mayor precisión en el cálculo de cumplimiento.",
          consequenceIfIgnored: "Evaluación institucional basada en datos incompletos.",
          confidenceScore:      80,
          status:       "pendiente",
          generatedAt:  new Date().toISOString(),
        });
      }
    });

    var order = { critica: 0, alta: 1, media: 2, baja: 3 };
    recs.sort(function (a, b) { return (order[a.priority] || 3) - (order[b.priority] || 3); });
    return recs;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGINE 4 — PREDICTION ENGINE (deterministic)
  // ═══════════════════════════════════════════════════════════════════════════

  function _linearSlope_(values) {
    var n = values.length;
    if (n < 2) return 0;
    var sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    values.forEach(function (v, i) { sumX += i; sumY += v; sumXY += i * v; sumX2 += i * i; });
    var denom = n * sumX2 - sumX * sumX;
    return denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  }

  function _buildHistoricalScores_(snaps) {
    var byPeriod = {};
    (snaps || []).forEach(function (s) {
      var period = String(s.year || new Date().getFullYear());
      if (!byPeriod[period]) byPeriod[period] = [];
      byPeriod[period].push(Number(s.overallScore || 0));
    });
    return Object.keys(byPeriod).sort().map(function (p) {
      var vals = byPeriod[p];
      var avg = Math.round(vals.reduce(function (a, b) { return a + b; }, 0) / vals.length);
      return { period: p, label: p, score: avg };
    });
  }

  function _buildPrediction_(entityType, entityId, entityLabel, hist, horizon) {
    var smoothing = _cfgNum_("prediccion.smoothing", 0.3);
    var uncFactor = _cfgNum_("prediccion.uncertainty_factor", 3);
    var maxUnc    = _cfgNum_("prediccion.max_uncertainty", 20);

    var historical = (hist || []).map(function (h) {
      return { period: h.period, label: h.label, predicted: h.score, lowerBound: h.score - 5, upperBound: Math.min(100, h.score + 5), isHistorical: true };
    });

    var scores  = (hist || []).map(function (h) { return h.score; });
    var slope   = _linearSlope_(scores);
    var last    = scores.length > 0 ? scores[scores.length - 1] : 70;
    var steps   = horizon === "anual" ? 12 : horizon === "semestral" ? 6 : 3;
    var now     = new Date();

    var future = [];
    for (var i = 1; i <= steps; i++) {
      var pred  = Math.max(0, Math.min(100, last + slope * i));
      var unc   = Math.min(maxUnc, i * uncFactor);
      var d     = new Date(now);
      d.setMonth(d.getMonth() + i);
      var lbl   = d.toISOString().slice(0, 7);
      future.push({ period: lbl, label: lbl, predicted: Math.round(pred), lowerBound: Math.max(0, Math.round(pred - unc)), upperBound: Math.min(100, Math.round(pred + unc)), isHistorical: false });
    }

    var finalScore = future.length > 0 ? future[future.length - 1].predicted : last;
    var trend = Math.abs(slope) < 0.5 ? "estable" : slope > 0 ? "creciente" : "decreciente";

    return {
      id:           IdGen.id(),
      entityType:   entityType,
      entityId:     entityId,
      entityLabel:  entityLabel,
      metric:       "cumplimiento",
      horizon:      horizon || "trimestral",
      model:        "linear_trend",
      currentValue: last,
      predictedValue:         finalScore,
      probabilityOfCompliance: finalScore >= 75 ? Math.min(95, finalScore) : Math.max(5, finalScore),
      expectedRisk: _riskLevel_(finalScore),
      trend:        trend,
      points:       historical.concat(future),
      confidenceScore: Math.max(40, Math.min(90, 80 - (hist || []).length * 2)),
      assumptions:  [
        "La tendencia histórica se mantiene sin eventos disruptivos externos.",
        "Los recursos institucionales permanecen sin cambios significativos.",
        "Las reglas de negocio configuradas son representativas del comportamiento real.",
      ],
      generatedAt: new Date().toISOString(),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGINE 5 — ANOMALY DETECTION ENGINE
  // ═══════════════════════════════════════════════════════════════════════════

  function _detectAnomalies_(snaps) {
    var dropThreshold  = _cfgNum_("anomalia.umbral.caida",       15);
    var sustainedPers  = _cfgNum_("anomalia.periodos.sostenido",  3);
    var anomalies = [];
    var byEntity  = {};

    (snaps || []).forEach(function (s) {
      var key = String(s.organizationalUnitId || "global") + "_" + String(s.processId || "");
      if (!byEntity[key]) byEntity[key] = { entityType: "unidad", entityId: s.organizationalUnitId || "global", entityLabel: s.entityLabel || "Global", scores: [] };
      byEntity[key].scores.push({ period: String(s.year || ""), score: Number(s.overallScore || 0) });
    });

    Object.keys(byEntity).forEach(function (key) {
      var ent    = byEntity[key];
      var scores = ent.scores.sort(function (a, b) { return a.period.localeCompare(b.period); });
      if (scores.length < 2) return;

      var last = scores[scores.length - 1].score;
      var prev = scores[scores.length - 2].score;
      var deviation = prev > 0 ? Math.round(((last - prev) / prev) * 100) : 0;

      // Sudden drop
      if (deviation <= -dropThreshold) {
        anomalies.push({
          id:            IdGen.id(),
          type:          "caida_productividad",
          entityType:    ent.entityType,
          entityId:      ent.entityId,
          entityLabel:   ent.entityLabel,
          severity:      deviation <= -(dropThreshold * 1.67) ? "critico" : "alto",
          detectedAt:    new Date().toISOString(),
          description:   "Caída abrupta del " + Math.abs(deviation) + "% respecto al período anterior.",
          metric:        "cumplimiento",
          observedValue: last,
          expectedValue: prev,
          deviationPct:  deviation,
          period:        scores[scores.length - 1].period,
          isActive:      true,
        });
      }

      // Sustained decrease
      if (scores.length >= sustainedPers) {
        var sustDecreasing = true;
        for (var i = scores.length - 1; i >= scores.length - sustainedPers; i--) {
          if (i === 0 || scores[i].score >= scores[i - 1].score) { sustDecreasing = false; break; }
        }
        if (sustDecreasing) {
          var oldScore = scores[scores.length - sustainedPers].score;
          var deviSust = oldScore > 0 ? Math.round(((last - oldScore) / oldScore) * 100) : 0;
          anomalies.push({
            id:            IdGen.id(),
            type:          "disminucion_cumplimiento",
            entityType:    ent.entityType,
            entityId:      ent.entityId,
            entityLabel:   ent.entityLabel,
            severity:      "alto",
            detectedAt:    new Date().toISOString(),
            description:   "Disminución sostenida durante " + sustainedPers + " períodos consecutivos (" + deviSust + "% acumulado).",
            metric:        "cumplimiento",
            observedValue: last,
            expectedValue: oldScore,
            deviationPct:  deviSust,
            period:        scores[scores.length - 1].period,
            isActive:      true,
          });
        }
      }
    });

    return anomalies;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGINE 6 — NARRATIVE ENGINE (template-based, no AI)
  // ═══════════════════════════════════════════════════════════════════════════

  function _buildNarrative_(period, periodLabel, ctx) {
    var score       = ctx.overallScore || 0;
    var risk        = ctx.riskLevel || "medio";
    var recs        = (ctx.recommendations || []).length;
    var anomalies   = (ctx.anomalies || []).length;
    var trend       = ctx.trend || "estable";
    var prevScore   = ctx.prevScore || score;
    var delta       = score - prevScore;

    var trendText = { creciente: "una mejora del " + Math.abs(Math.round(delta)) + "%", decreciente: "un retroceso del " + Math.abs(Math.round(delta)) + "%", estable: "estabilidad", volatil: "variabilidad" }[trend] || "estabilidad";

    var sections = [
      {
        title: "Resumen Ejecutivo",
        content: "La institución registra un puntaje de cumplimiento del " + score + "% con nivel de riesgo " + risk +
          " para el período " + periodLabel + ". Se evidencia " + trendText + " respecto al período anterior.",
      },
      {
        title: "Hallazgos del Período",
        content: (recs > 0
          ? "El motor de análisis generó " + recs + " recomendación" + (recs > 1 ? "es" : "") + " activa" + (recs > 1 ? "s" : "") + ". "
          : "No se identificaron hallazgos críticos en el período. ") +
          (anomalies > 0
            ? "Se detectaron " + anomalies + " anomalía" + (anomalies > 1 ? "s" : "") + " que requieren seguimiento inmediato."
            : "No se detectaron anomalías significativas en el comportamiento operativo."),
      },
      {
        title: "Diagnóstico Institucional",
        content: score >= 90
          ? "El desempeño institucional se encuentra en nivel óptimo. Se recomienda mantener las prácticas actuales y enfocar esfuerzos en mejora continua."
          : score >= 75
          ? "El desempeño institucional es satisfactorio. Se recomienda abordar las brechas identificadas para alcanzar el nivel óptimo."
          : score >= 60
          ? "El desempeño institucional está en nivel de alerta. Se requiere intervención en los procesos con mayor rezago."
          : "El desempeño institucional está en nivel crítico. Se requiere intervención inmediata y revisión integral de la planificación.",
      },
      {
        title: "Proyección",
        content: "Con base en la tendencia " + trend + ", se proyecta " +
          (trend === "creciente" ? "continuar la mejora" : trend === "decreciente" ? "una posible disminución" : "estabilidad") +
          " en el próximo período. El seguimiento de las " + recs + " recomendación" + (recs !== 1 ? "es" : "") +
          " activa" + (recs !== 1 ? "s" : "") + " es clave para mantener o mejorar el nivel actual.",
      },
    ];

    return {
      id:           IdGen.id(),
      period:       period,
      periodLabel:  periodLabel,
      title:        "Informe Ejecutivo Institucional — " + periodLabel,
      body:         sections.map(function (s) { return s.title + ": " + s.content; }).join(" "),
      sections:     sections,
      keyFigures:   [
        { label: "Cumplimiento",    value: score + "%",                                         trend: trend },
        { label: "Nivel de Riesgo", value: risk.charAt(0).toUpperCase() + risk.slice(1),        trend: anomalies > 0 ? "negativo" : "estable" },
        { label: "Recomendaciones", value: String(recs),                                         trend: recs > 5 ? "negativo" : "positivo" },
        { label: "Anomalías",       value: String(anomalies),                                    trend: anomalies > 0 ? "negativo" : "positivo" },
      ],
      generatedAt:  new Date().toISOString(),
      confidenceScore: ctx.confidenceScore || 75,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SEMANTIC MODEL — Institutional ontology for future AI integration
  // ═══════════════════════════════════════════════════════════════════════════

  function _getSemanticModel_() {
    return {
      version: "1.0.0",
      concepts: [
        { id: "unidad", label: "Unidad Institucional", description: "Dependencia o área organizacional responsable de la ejecución de procesos institucionales.", relations: [{ concept: "proceso", relation: "gestiona", cardinality: "1:N" }, { concept: "plan", relation: "ejecuta", cardinality: "1:N" }, { concept: "cumplimiento", relation: "tiene", cardinality: "1:1" }], attributes: [{ name: "nombre", type: "string", description: "Nombre oficial de la unidad" }, { name: "cumplimiento", type: "number", description: "Porcentaje de cumplimiento en el período" }] },
        { id: "proceso", label: "Proceso Institucional", description: "Conjunto sistematizado de actividades que transforma insumos en productos o servicios institucionales.", relations: [{ concept: "unidad", relation: "pertenece_a", cardinality: "N:1" }, { concept: "actividad", relation: "contiene", cardinality: "1:N" }, { concept: "indicador", relation: "medido_por", cardinality: "N:N" }], attributes: [{ name: "nombre", type: "string", description: "Nombre del proceso" }, { name: "estado", type: "string", description: "Estado operacional" }] },
        { id: "actividad", label: "Actividad", description: "Tarea específica y planificada dentro de un proceso institucional.", relations: [{ concept: "proceso", relation: "pertenece_a", cardinality: "N:1" }, { concept: "ejecucion", relation: "genera", cardinality: "1:N" }, { concept: "evidencia", relation: "requiere", cardinality: "N:N" }], attributes: [{ name: "nombre", type: "string", description: "Nombre de la actividad" }, { name: "fechaProgramada", type: "date", description: "Fecha planificada de ejecución" }] },
        { id: "plan", label: "Plan Estratégico/Operativo", description: "Documento de planificación que define actividades, metas e indicadores para un período.", relations: [{ concept: "unidad", relation: "ejecutado_por", cardinality: "N:1" }, { concept: "actividad", relation: "incluye", cardinality: "1:N" }], attributes: [{ name: "periodo", type: "string", description: "Período del plan" }, { name: "progreso", type: "number", description: "Porcentaje de ejecución" }] },
        { id: "ejecucion", label: "Registro de Ejecución", description: "Evidencia formal de que una actividad fue ejecutada en la fecha y condiciones previstas.", relations: [{ concept: "actividad", relation: "corresponde_a", cardinality: "N:1" }, { concept: "evidencia", relation: "genera", cardinality: "1:N" }], attributes: [{ name: "fechaEjecucion", type: "date", description: "Fecha real de ejecución" }, { name: "estado", type: "string", description: "Estado de la ejecución" }] },
        { id: "evidencia", label: "Evidencia Documental", description: "Documento o registro que acredita la ejecución o resultado de una actividad institucional.", relations: [{ concept: "ejecucion", relation: "respalda", cardinality: "N:1" }, { concept: "cumplimiento", relation: "contribuye_a", cardinality: "N:1" }], attributes: [{ name: "tipo", type: "string", description: "Tipo de evidencia" }, { name: "estado", type: "string", description: "Estado de validación" }] },
        { id: "indicador", label: "Indicador de Desempeño", description: "Métrica cuantitativa o cualitativa que mide el grado de cumplimiento de objetivos institucionales.", relations: [{ concept: "proceso", relation: "mide", cardinality: "N:1" }, { concept: "cumplimiento", relation: "determina", cardinality: "N:1" }], attributes: [{ name: "meta", type: "number", description: "Valor meta del indicador" }, { name: "actual", type: "number", description: "Valor actual alcanzado" }] },
        { id: "cumplimiento", label: "Cumplimiento Institucional", description: "Nivel de adherencia a la planificación institucional medido en porcentaje.", relations: [{ concept: "brecha", relation: "genera", cardinality: "1:N" }, { concept: "riesgo", relation: "determina", cardinality: "1:N" }], attributes: [{ name: "porcentaje", type: "number", description: "Porcentaje de cumplimiento" }, { name: "semaforo", type: "string", description: "Clasificación semafórica" }] },
        { id: "brecha", label: "Brecha Institucional", description: "Diferencia medible entre el desempeño esperado y el desempeño real en un período.", relations: [{ concept: "cumplimiento", relation: "originada_por", cardinality: "N:1" }, { concept: "plan_mejora", relation: "atendida_por", cardinality: "N:N" }], attributes: [{ name: "descripcion", type: "string", description: "Descripción de la brecha" }, { name: "severidad", type: "string", description: "Nivel de severidad" }] },
        { id: "riesgo", label: "Riesgo Institucional", description: "Probabilidad de incumplimiento o impacto negativo sobre los objetivos institucionales.", relations: [{ concept: "cumplimiento", relation: "asociado_a", cardinality: "N:1" }, { concept: "plan_mejora", relation: "mitigado_por", cardinality: "N:N" }], attributes: [{ name: "nivel", type: "string", description: "Nivel de riesgo: bajo/medio/alto/crítico" }, { name: "probabilidad", type: "number", description: "Probabilidad estimada (0-100)" }] },
        { id: "plan_mejora", label: "Plan de Mejora", description: "Conjunto estructurado de acciones para corregir brechas, mitigar riesgos y elevar el cumplimiento.", relations: [{ concept: "brecha", relation: "atiende", cardinality: "N:N" }, { concept: "riesgo", relation: "mitiga", cardinality: "N:N" }], attributes: [{ name: "progreso", type: "number", description: "Porcentaje de avance" }, { name: "estado", type: "string", description: "Estado del plan" }] },
      ],
      generatedAt: new Date().toISOString(),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INSTITUTIONAL SEMANTIC SERVICE — single AI integration entry point
  // ═══════════════════════════════════════════════════════════════════════════

  function _semanticQuery_(query) {
    var snaps = _snaps_();
    var rules = _rules_();
    var metrics = _aggregateMetrics_(snaps, _ejecs_(), _evids_(), _inds_());
    var result, explanation, sources;

    switch (query.intent) {
      case "diagnostico":
        result = _buildDiagnosis_(query.entityType || "unidad", query.entityId || "global", query.entityId || "Institución", metrics, rules);
        explanation = "Diagnóstico generado mediante " + rules.filter(function (r) { return r.enabled !== false; }).length + " reglas de conocimiento activas.";
        sources = ["cpeSnapshots", "iieKnowledgeRules"];
        break;

      case "recomendacion":
        var diag = [_buildDiagnosis_("unidad", "global", "Institución", metrics, rules)];
        result = _buildRecommendations_(diag, rules);
        explanation = "Recomendaciones generadas desde el motor de reglas de negocio institucional.";
        sources = ["cpeSnapshots", "iieKnowledgeRules"];
        break;

      case "narrativa":
        var dashCtx = { overallScore: metrics.cumplimiento, riskLevel: _riskLevel_(metrics.cumplimiento), confidenceScore: _confidence_(metrics.dataCount, metrics.recencyDays, metrics.indicatorCoverage, metrics.documentationRate), trend: "estable", recommendations: [], anomalies: [] };
        result = _buildNarrative_("mensual", new Date().toISOString().slice(0, 7), dashCtx);
        explanation = "Narrativa construida mediante plantillas dinámicas estructuradas. Sin generación por IA.";
        sources = ["cpeSnapshots", "apePlanes", "aeeEjecuciones"];
        break;

      case "prediccion":
        var hist = _buildHistoricalScores_(snaps);
        result = _buildPrediction_("unidad", "global", "Institución", hist, "trimestral");
        explanation = "Predicción calculada mediante regresión lineal determinística sobre datos históricos.";
        sources = ["cpeSnapshots"];
        break;

      case "explicacion":
        result = { concept: query.entityType || "cumplimiento", model: _getSemanticModel_() };
        explanation = "Explicación derivada del modelo semántico institucional v1.0.";
        sources = ["iieSemanticModel"];
        break;

      default:
        result = null;
        explanation = "Intención no reconocida: " + String(query.intent);
        sources = [];
    }

    return {
      query:          query,
      result:         result,
      explanation:    explanation,
      confidenceScore: 75,
      sources:        sources,
      generatedAt:    new Date().toISOString(),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DASHBOARD AGGREGATOR
  // ═══════════════════════════════════════════════════════════════════════════

  function _buildDashContext_() {
    var snaps   = _snaps_();
    var rules   = _rules_();
    var metrics = _aggregateMetrics_(snaps, _ejecs_(), _evids_(), _inds_());
    var diag    = _buildDiagnosis_("unidad", "global", "Institución", metrics, rules);
    var anom    = _detectAnomalies_(snaps);
    var recs    = _buildRecommendations_([diag], rules);
    var hist    = _buildHistoricalScores_(snaps);
    var pred    = _buildPrediction_("unidad", "global", "Institución", hist, "trimestral");

    return { metrics: metrics, diagnosis: diag, anomalies: anom, recommendations: recs, prediction: pred };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  function getDashboard(params) {
    var ctx      = _buildDashContext_();
    var d        = ctx.diagnosis;
    var pred     = ctx.prediction;
    var maxRecs  = _cfgNum_("recomendacion.limite.dashboard", 5);
    var narrative = _buildNarrative_("mensual", new Date().toISOString().slice(0, 7), {
      overallScore: d.overallScore, riskLevel: d.riskLevel, confidenceScore: d.confidenceScore,
      trend: pred.trend, recommendations: ctx.recommendations, anomalies: ctx.anomalies,
    });

    return {
      institutionalScore:    d.overallScore,
      riskLevel:             d.riskLevel,
      confidenceScore:       d.confidenceScore,
      quarterlyPrediction:   pred.predictedValue,
      predictedRisk:         pred.expectedRisk,
      executiveNarrative:    narrative.sections[0].content,
      topRecommendations:    ctx.recommendations.slice(0, maxRecs),
      topAnomalies:          ctx.anomalies.slice(0, 5),
      recentDiagnoses:       [d],
      alertCount:            ctx.anomalies.length,
      diagnosisCount:        1,
      recommendationCount:   ctx.recommendations.length,
      anomalyCount:          ctx.anomalies.length,
      dataQuality:           d.confidenceScore,
      generatedAt:           new Date().toISOString(),
    };
  }

  function getDiagnostics(params) {
    var p    = params || {};
    var snaps = _snaps_();
    var rules = _rules_();
    var metrics = _aggregateMetrics_(snaps, _ejecs_(), _evids_(), _inds_());
    var diag = _buildDiagnosis_("unidad", "global", "Institución", metrics, rules);

    if (p.riskLevel && diag.riskLevel !== p.riskLevel) return [];
    if (p.minConfidence && diag.confidenceScore < Number(p.minConfidence)) return [];
    return [diag].slice(0, p.limit || 50);
  }

  function getRecommendations(params) {
    var p   = params || {};
    var ctx = _buildDashContext_();
    var res = ctx.recommendations;
    if (p.priority) res = res.filter(function (r) { return r.priority === p.priority; });
    if (p.status)   res = res.filter(function (r) { return r.status === p.status; });
    return res.slice(0, p.limit || 50);
  }

  function getPredictions(params) {
    var p    = params || {};
    var hist = _buildHistoricalScores_(_snaps_());
    var pred = _buildPrediction_("unidad", "global", "Institución", hist, p.horizon || "trimestral");
    return [pred];
  }

  function getAnomalies(params) {
    var p   = params || {};
    var res = _detectAnomalies_(_snaps_());
    if (p.severity)             res = res.filter(function (a) { return a.severity === p.severity; });
    if (p.type)                 res = res.filter(function (a) { return a.type === p.type; });
    if (p.isActive !== undefined) res = res.filter(function (a) { return Boolean(a.isActive) === Boolean(p.isActive); });
    return res.slice(0, p.limit || 50);
  }

  function getNarratives(params) {
    var p   = params || {};
    var ctx = _buildDashContext_();
    var dashCtx = {
      overallScore: ctx.diagnosis.overallScore,
      riskLevel: ctx.diagnosis.riskLevel,
      confidenceScore: ctx.diagnosis.confidenceScore,
      trend: ctx.prediction.trend,
      recommendations: ctx.recommendations,
      anomalies: ctx.anomalies,
    };
    var periods = p.period ? [p.period] : ["semanal", "mensual", "trimestral", "anual"];
    var now = new Date();
    var qtr = Math.ceil((now.getMonth() + 1) / 3);
    var labels = {
      semanal:    "Semana " + now.toISOString().slice(0, 10),
      mensual:    now.toISOString().slice(0, 7),
      trimestral: "Q" + qtr + " " + now.getFullYear(),
      anual:      String(now.getFullYear()),
    };
    return periods.map(function (p_) { return _buildNarrative_(p_, labels[p_] || p_, dashCtx); });
  }

  function getConfiguration(params) {
    return _config_();
  }

  function updateConfiguration(params) {
    var p = params || {};
    if (!p.key || p.value === undefined) throw new Error("key y value son requeridos");
    var items = _config_();
    var existing = items.find(function (c) { return c.key === p.key; });
    if (!existing) throw new Error("Clave de configuración no encontrada: " + p.key);
    return updateEntity_("iieConfiguration", existing.id, { value: String(p.value), updatedAt: new Date().toISOString() });
  }

  function getKnowledgeRules(params) {
    var p   = params || {};
    var res = _rules_();
    if (p.enabled !== undefined) res = res.filter(function (r) { return Boolean(r.enabled) === Boolean(p.enabled); });
    if (p.category)              res = res.filter(function (r) { return r.category === p.category; });
    return res;
  }

  function updateKnowledgeRule(params) {
    var p = params || {};
    if (!p.id) throw new Error("id es requerido");
    var payload = Object.assign({}, p, { updatedAt: new Date().toISOString() });
    return updateEntity_("iieKnowledgeRules", p.id, payload);
  }

  function getSemanticModel(params) {
    return _getSemanticModel_();
  }

  function semanticQuery(params) {
    var p = params || {};
    if (!p.intent) throw new Error("intent es requerido");
    return _semanticQuery_(p);
  }

  return {
    getDashboard:        getDashboard,
    getDiagnostics:      getDiagnostics,
    getRecommendations:  getRecommendations,
    getPredictions:      getPredictions,
    getAnomalies:        getAnomalies,
    getNarratives:       getNarratives,
    getConfiguration:    getConfiguration,
    updateConfiguration: updateConfiguration,
    getKnowledgeRules:   getKnowledgeRules,
    updateKnowledgeRule: updateKnowledgeRule,
    getSemanticModel:    getSemanticModel,
    semanticQuery:       semanticQuery,
  };
})();
