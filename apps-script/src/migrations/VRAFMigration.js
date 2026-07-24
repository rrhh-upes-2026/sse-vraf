// ============================================================
// OIM — Official Indicator Migration  |  Sprint 017
// VRAF — Vicerrectoría Administrativa y Financiera
//
// Source: TABLA_DE_INDICADORES_DE_VRAF.xlsx (archivo oficial)
// 10 indicadores institucionales, versión 1.0, estado publicado.
// ============================================================

var VRAFMigration = (function () {
  "use strict";

  // ── Raw Excel data (fiel al documento oficial) ────────────

  var VRAF_RAW = [
    {
      excelRow: 2,
      nombre:       "Cumplimiento del PEA",
      descripcion:  "Evalúa el nivel de ejecución y cumplimiento de las actividades, metas, proyectos estratégicos y acciones institucionales definidas en el Plan Estratégico Administrativo y Financiero (PEA), permitiendo monitorear el avance de la gestión y la capacidad de respuesta institucional.",
      pi:           "Cumplimiento estratégico",
      dimension:    "Gobernanza Administrativa",
      criterio_dnes:"3.1.1 – Planeación institucional",
      criterio_cda: "9.1.1 – Gestión administrativa",
      unidadMedida: "%",
      frecuencia:   "Trimestral",
      formulaVisible: "(Actividades ejecutadas / Actividades programadas) × 100",
      formulaEjecutable: "(v1 / v2) * 100",
      variables:    [
        { codigo: "v1", nombre: "Actividades ejecutadas",  descripcion: "Total de actividades completadas en el período", tipo: "numero", orden: 1 },
        { codigo: "v2", nombre: "Actividades programadas", descripcion: "Total de actividades planificadas en el período", tipo: "numero", orden: 2 },
      ],
      polaridad:    "Positiva",
      metaStr:      "≥95%",
      meta:         95,
      rangoStr:     "90–95%",
      rango:        { excelente: { min: 95, max: 100 }, bueno: { min: 90, max: 95 }, aceptable: { min: 85, max: 90 }, critico: { min: 0, max: 85 } },
      herramienta:  "Dashboard estratégico",
      fuente:       "Informes trimestrales de seguimiento, cronograma institucional, matriz de seguimiento PEA",
    },
    {
      excelRow: 3,
      nombre:       "Índice de sostenibilidad financiera",
      descripcion:  "Evalúa la capacidad institucional para mantener la continuidad operativa y financiera mediante el equilibrio adecuado entre ingresos y gastos institucionales, permitiendo identificar la estabilidad económica y capacidad de cobertura financiera.",
      pi:           "Sostenibilidad financiera",
      dimension:    "Gestión Financiera",
      criterio_dnes:"3.1.3 – Sostenibilidad y uso eficiente de recursos institucionales",
      criterio_cda: "9.2.1 – Sostenibilidad económica institucional",
      unidadMedida: "Ratio",
      frecuencia:   "Trimestral",
      formulaVisible: "Ingresos institucionales / Gastos institucionales",
      formulaEjecutable: "v1 / v2",
      variables:    [
        { codigo: "v1", nombre: "Ingresos institucionales", descripcion: "Total de ingresos del período", tipo: "moneda", orden: 1 },
        { codigo: "v2", nombre: "Gastos institucionales",  descripcion: "Total de gastos del período",  tipo: "moneda", orden: 2 },
      ],
      polaridad:    "Positiva",
      metaStr:      "≥1.2",
      meta:         1.2,
      rangoStr:     "1.0–1.2",
      rango:        { excelente: { min: 1.2, max: 9999 }, bueno: { min: 1.0, max: 1.2 }, aceptable: { min: 0.8, max: 1.0 }, critico: { min: 0, max: 0.8 } },
      herramienta:  "Dashboard financiero",
      fuente:       "Estados financieros, informes de ingresos y gastos, ejecución presupuestaria institucional, reportes financieros consolidados",
    },
    {
      excelRow: 4,
      nombre:       "Índice de eficiencia del gasto institucional",
      descripcion:  "Evalúa el nivel de utilización eficiente de los recursos financieros institucionales destinados a procesos estratégicos, administrativos y operativos prioritarios, permitiendo identificar el aprovechamiento y optimización del gasto institucional.",
      pi:           "Eficiencia financiera",
      dimension:    "Gestión Financiera",
      criterio_dnes:"3.1.3 – Uso eficiente de recursos institucionales",
      criterio_cda: "9.2.2 – Eficiencia financiera institucional",
      unidadMedida: "%",
      frecuencia:   "Trimestral",
      formulaVisible: "(Gastos estratégicos / Gastos totales) × 100",
      formulaEjecutable: "(v1 / v2) * 100",
      variables:    [
        { codigo: "v1", nombre: "Gastos estratégicos", descripcion: "Gastos destinados a procesos estratégicos y prioritarios", tipo: "moneda", orden: 1 },
        { codigo: "v2", nombre: "Gastos totales",      descripcion: "Total de gastos institucionales del período",               tipo: "moneda", orden: 2 },
      ],
      polaridad:    "Positiva",
      metaStr:      "≥85%",
      meta:         85,
      rangoStr:     "80–85%",
      rango:        { excelente: { min: 85, max: 100 }, bueno: { min: 80, max: 85 }, aceptable: { min: 75, max: 80 }, critico: { min: 0, max: 75 } },
      herramienta:  "Dashboard financiero",
      fuente:       "Estados financieros, ejecución presupuestaria, informes de gastos institucionales, informes de seguimiento financiero",
    },
    {
      excelRow: 5,
      nombre:       "Procesos administrativos digitalizados",
      descripcion:  "Evalúa el nivel de automatización y digitalización de los procesos administrativos y financieros institucionales mediante herramientas tecnológicas, sistema Uonline y plataformas digitales, permitiendo medir avances en modernización institucional.",
      pi:           "Digitalización",
      dimension:    "Transformación Digital",
      criterio_dnes:"3.4.1 – Sistemas institucionales",
      criterio_cda: "9.3.3 – Innovación tecnológica",
      unidadMedida: "%",
      frecuencia:   "Semestral",
      formulaVisible: "(Procesos digitales / Procesos totales) × 100",
      formulaEjecutable: "(v1 / v2) * 100",
      variables:    [
        { codigo: "v1", nombre: "Procesos digitales", descripcion: "Procesos administrativos digitalizados o automatizados", tipo: "numero", orden: 1 },
        { codigo: "v2", nombre: "Procesos totales",   descripcion: "Total de procesos administrativos identificados",        tipo: "numero", orden: 2 },
      ],
      polaridad:    "Positiva",
      metaStr:      "100% (≥90%)",
      meta:         100,
      rangoStr:     "≥90%",
      rango:        { excelente: { min: 90, max: 100 }, bueno: { min: 80, max: 90 }, aceptable: { min: 70, max: 80 }, critico: { min: 0, max: 70 } },
      herramienta:  "Uonline",
      fuente:       "Reportes de UOnline, manuales de procesos, reportes TI, inventario de procesos digitalizados",
    },
    {
      excelRow: 6,
      nombre:       "Seguimiento KPI institucional",
      descripcion:  "Evalúa el grado de monitoreo, actualización y análisis periódico de indicadores institucionales definidos para las unidades administrativas y estratégicas, permitiendo medir el desempeño y la toma de decisiones basada en evidencia.",
      pi:           "KPI monitoreados",
      dimension:    "Calidad Institucional",
      criterio_dnes:"3.4.2 – Evaluación institucional",
      criterio_cda: "9.5.2 – Seguimiento KPI",
      unidadMedida: "%",
      frecuencia:   "Trimestral",
      formulaVisible: "(KPI monitoreados / KPI definidos) × 100",
      formulaEjecutable: "(v1 / v2) * 100",
      variables:    [
        { codigo: "v1", nombre: "KPI monitoreados", descripcion: "Indicadores con seguimiento actualizado en el período", tipo: "numero", orden: 1 },
        { codigo: "v2", nombre: "KPI definidos",    descripcion: "Total de indicadores definidos para las unidades",      tipo: "numero", orden: 2 },
      ],
      polaridad:    "Positiva",
      metaStr:      "100% (≥95%)",
      meta:         100,
      rangoStr:     "≥95%",
      rango:        { excelente: { min: 95, max: 100 }, bueno: { min: 90, max: 95 }, aceptable: { min: 85, max: 90 }, critico: { min: 0, max: 85 } },
      herramienta:  "Dashboard VRAF",
      fuente:       "Informes de indicadores, dashboard de VRAF, actas de seguimiento, matriz de KPI",
    },
    {
      excelRow: 7,
      nombre:       "Formulación presupuestaria institucional",
      descripcion:  "Evalúa el nivel de cumplimiento en la elaboración, consolidación y aprobación del presupuesto institucional conforme a la planificación estratégica y requerimientos operativos institucionales.",
      pi:           "Cumplimiento presupuestario",
      dimension:    "Planeación Presupuestaria",
      criterio_dnes:"3.1.1 – Planeación institucional y gestión estratégica",
      criterio_cda: "9.3.1 – Gestión presupuestaria institucional",
      unidadMedida: "%",
      frecuencia:   "Anual",
      formulaVisible: "(Presupuesto formulado / Presupuesto programado) × 100",
      formulaEjecutable: "(v1 / v2) * 100",
      variables:    [
        { codigo: "v1", nombre: "Presupuesto formulado",  descripcion: "Monto del presupuesto elaborado y consolidado",         tipo: "moneda", orden: 1 },
        { codigo: "v2", nombre: "Presupuesto programado", descripcion: "Monto del presupuesto planificado según POA institucional", tipo: "moneda", orden: 2 },
      ],
      polaridad:    "Positiva",
      metaStr:      "100% (≥95%)",
      meta:         100,
      rangoStr:     "≥95%",
      rango:        { excelente: { min: 95, max: 100 }, bueno: { min: 90, max: 95 }, aceptable: { min: 85, max: 90 }, critico: { min: 0, max: 85 } },
      herramienta:  "Dashboard financiero",
      fuente:       "Presupuesto institucional aprobado, POA institucional, actas de aprobación presupuestaria, informes financieros",
    },
    {
      excelRow: 8,
      nombre:       "Ejecución presupuestaria institucional",
      descripcion:  "Evalúa el porcentaje de ejecución financiera del presupuesto institucional aprobado durante el período fiscal, permitiendo medir el grado de cumplimiento de metas financieras y operativas institucionales.",
      pi:           "Ejecución financiera institucional",
      dimension:    "Gestión Presupuestaria",
      criterio_dnes:"3.1.3 – Planeación financiera",
      criterio_cda: "9.3.2 – Gestión presupuestaria",
      unidadMedida: "%",
      frecuencia:   "Trimestral",
      formulaVisible: "(Monto ejecutado / Presupuesto aprobado) × 100",
      formulaEjecutable: "(v1 / v2) * 100",
      variables:    [
        { codigo: "v1", nombre: "Monto ejecutado",      descripcion: "Monto financiero ejecutado en el período",          tipo: "moneda", orden: 1 },
        { codigo: "v2", nombre: "Presupuesto aprobado", descripcion: "Presupuesto institucional aprobado para el período", tipo: "moneda", orden: 2 },
      ],
      polaridad:    "Positiva",
      metaStr:      "≥95%",
      meta:         95,
      rangoStr:     "90–95%",
      rango:        { excelente: { min: 95, max: 100 }, bueno: { min: 90, max: 95 }, aceptable: { min: 85, max: 90 }, critico: { min: 0, max: 85 } },
      herramienta:  "Dashboard financiero",
      fuente:       "Informes financieros trimestrales, estados financieros, ejecución presupuestaria institucional, presupuesto aprobado",
    },
    {
      excelRow: 9,
      nombre:       "Desviación presupuestaria institucional",
      descripcion:  "Evalúa la diferencia porcentual entre el presupuesto ejecutado y el presupuesto planificado durante el período fiscal, permitiendo identificar sobre ejecuciones o subejecuciones que puedan afectar la estabilidad financiera institucional.",
      pi:           "Variación presupuestaria",
      dimension:    "Gestión Presupuestaria",
      criterio_dnes:"3.1.3 – Planeación financiera",
      criterio_cda: "9.3.2 – Gestión presupuestaria",
      unidadMedida: "%",
      frecuencia:   "Mensual",
      formulaVisible: "((Monto ejecutado − Presupuesto aprobado) / Presupuesto aprobado) × 100",
      formulaEjecutable: "((v1 - v2) / v2) * 100",
      variables:    [
        { codigo: "v1", nombre: "Monto ejecutado",      descripcion: "Monto financiero ejecutado en el período",          tipo: "moneda", orden: 1 },
        { codigo: "v2", nombre: "Presupuesto aprobado", descripcion: "Presupuesto institucional aprobado para el período", tipo: "moneda", orden: 2 },
      ],
      polaridad:    "Negativa",
      metaStr:      "≤5%",
      meta:         5,
      rangoStr:     "≤8%",
      rango:        { excelente: { min: 0, max: 5 }, bueno: { min: 5, max: 8 }, aceptable: { min: 8, max: 12 }, critico: { min: 12, max: 9999 } },
      herramienta:  "Dashboard financiero",
      fuente:       "Informes presupuestarios, estados financieros, ejecución presupuestaria mensual, reportes financieros",
    },
    {
      excelRow: 10,
      nombre:       "Ejecución de proyectos de inversión",
      descripcion:  "Evalúa el nivel de ejecución financiera y operativa de proyectos estratégicos institucionales respecto a los recursos aprobados y cronogramas establecidos.",
      pi:           "Ejecución inversión",
      dimension:    "Inversión Institucional",
      criterio_dnes:"3.1.3 – Gestión de inversión institucional",
      criterio_cda: "9.3.3 – Gestión financiera y proyectos",
      unidadMedida: "%",
      frecuencia:   "Trimestral",
      formulaVisible: "(Monto ejecutado / Monto aprobado) × 100",
      formulaEjecutable: "(v1 / v2) * 100",
      variables:    [
        { codigo: "v1", nombre: "Monto ejecutado", descripcion: "Monto financiero ejecutado de proyectos de inversión",   tipo: "moneda", orden: 1 },
        { codigo: "v2", nombre: "Monto aprobado",  descripcion: "Monto total aprobado para proyectos de inversión",       tipo: "moneda", orden: 2 },
      ],
      polaridad:    "Positiva",
      metaStr:      "≥90%",
      meta:         90,
      rangoStr:     "85–90%",
      rango:        { excelente: { min: 90, max: 100 }, bueno: { min: 85, max: 90 }, aceptable: { min: 80, max: 85 }, critico: { min: 0, max: 80 } },
      herramienta:  "Seguimiento proyectos",
      fuente:       "Informes técnicos, cronogramas de proyectos, informes financieros, informes de avance físico",
    },
    {
      excelRow: 11,
      nombre:       "Índice de efectividad de inversión institucional",
      descripcion:  "Evalúa el nivel de cumplimiento de objetivos, resultados esperados y beneficios institucionales derivados de proyectos e inversiones ejecutadas, permitiendo valorar el impacto estratégico de las inversiones realizadas.",
      pi:           "Efectividad de inversión institucional",
      dimension:    "Inversión Institucional",
      criterio_dnes:"3.1.3 – Gestión estratégica de recursos",
      criterio_cda: "9.3.3 – Optimización financiera institucional",
      unidadMedida: "%",
      frecuencia:   "Anual",
      formulaVisible: "(Proyectos que alcanzaron objetivos / Total proyectos ejecutados) × 100",
      formulaEjecutable: "(v1 / v2) * 100",
      variables:    [
        { codigo: "v1", nombre: "Proyectos que alcanzaron objetivos", descripcion: "Proyectos que cumplieron sus objetivos y metas establecidas",  tipo: "numero", orden: 1 },
        { codigo: "v2", nombre: "Total proyectos ejecutados",         descripcion: "Total de proyectos finalizados en el período de evaluación",   tipo: "numero", orden: 2 },
      ],
      polaridad:    "Positiva",
      metaStr:      "≥85%",
      meta:         85,
      rangoStr:     "80–85%",
      rango:        { excelente: { min: 85, max: 100 }, bueno: { min: 80, max: 85 }, aceptable: { min: 75, max: 80 }, critico: { min: 0, max: 75 } },
      herramienta:  "Dashboard estratégico / Evaluación institucional",
      fuente:       "Informes de cierre de proyectos, matriz de resultados institucionales, informes técnicos, indicadores de desempeño institucional",
    },
  ];

  // ── Catalog data to seed in FMI ───────────────────────────

  var OBJETIVO = {
    codigo: "OBJ-VRAF-001",
    nombre: "Gestión de Calidad Institucional VRAF",
    descripcion: "Garantizar la excelencia en la gestión administrativa y financiera institucional, mejorando continuamente los procesos, servicios y recursos de la Vicerrectoría Administrativa y Financiera.",
    orden: 1,
  };

  var DIMENSIONES = [
    { codigo: "DIM-VRAF-01", nombre: "Gobernanza Administrativa",  descripcion: "Planificación y ejecución estratégica institucional",                             orden: 1 },
    { codigo: "DIM-VRAF-02", nombre: "Gestión Financiera",         descripcion: "Sostenibilidad y eficiencia en la gestión financiera institucional",               orden: 2 },
    { codigo: "DIM-VRAF-03", nombre: "Transformación Digital",     descripcion: "Digitalización y automatización de procesos administrativos institucionales",      orden: 3 },
    { codigo: "DIM-VRAF-04", nombre: "Calidad Institucional",      descripcion: "Monitoreo y seguimiento de indicadores de desempeño institucional",               orden: 4 },
    { codigo: "DIM-VRAF-05", nombre: "Planeación Presupuestaria",  descripcion: "Formulación y programación del presupuesto institucional",                        orden: 5 },
    { codigo: "DIM-VRAF-06", nombre: "Gestión Presupuestaria",     descripcion: "Ejecución, control y análisis del presupuesto institucional",                     orden: 6 },
    { codigo: "DIM-VRAF-07", nombre: "Inversión Institucional",    descripcion: "Gestión, ejecución y efectividad de proyectos de inversión institucional",        orden: 7 },
  ];

  var UNIT_MEASURES = [
    { codigo: "UM-PCT",   nombre: "Porcentaje", tipo: "cuantitativa" },
    { codigo: "UM-RATIO", nombre: "Ratio",      tipo: "cuantitativa" },
  ];

  var FREQUENCIES = [
    { codigo: "FREC-MENS", nombre: "Mensual",     descripcion: "Medición mensual",     periodoDias: 30  },
    { codigo: "FREC-TRIM", nombre: "Trimestral",  descripcion: "Medición trimestral",  periodoDias: 90  },
    { codigo: "FREC-SEM",  nombre: "Semestral",   descripcion: "Medición semestral",   periodoDias: 180 },
    { codigo: "FREC-ANU",  nombre: "Anual",       descripcion: "Medición anual",       periodoDias: 365 },
  ];

  var POLARITIES_SEED = [
    { codigo: "POL-POS", nombre: "Positiva", descripcion: "Mayor valor = mejor desempeño" },
    { codigo: "POL-NEG", nombre: "Negativa", descripcion: "Menor valor = mejor desempeño" },
  ];

  // ── Helpers ───────────────────────────────────────────────

  function ts_() { return new Date().toISOString(); }
  function uid_() { return IdGen ? IdGen.entityId("OIM") : ("OIM-" + Date.now()); }

  function findByField_(sheetName, field, value) {
    return SheetRepository.for(sheetName).findAll().find(function (r) {
      return r[field] === value;
    }) || null;
  }

  function ensureOne_(sheetName, matchField, matchValue, createData) {
    var existing = findByField_(sheetName, matchField, matchValue);
    if (existing) return { id: existing.id, created: false };
    var repo = SheetRepository.for(sheetName);
    var newRec = Object.assign({ id: uid_() }, createData);
    repo.create(newRec);
    return { id: newRec.id, created: true };
  }

  // ── OIM Report persistence ────────────────────────────────

  var OIM_SHEET = "OIM_ImportHistory";

  function saveReport_(report) {
    SheetRepository.ensureSheet(OIM_SHEET, ["id", "runAt", "sprint", "total", "imported", "rejected", "warnings", "conflictos", "reportJson"]);
    SheetRepository.for(OIM_SHEET).create({
      id:         uid_(),
      runAt:      ts_(),
      sprint:     "017",
      total:      report.total,
      imported:   report.imported,
      rejected:   report.rejected,
      warnings:   report.warnings,
      conflictos: report.conflictos,
      reportJson: JSON.stringify(report),
    });
  }

  function listReports_() {
    try {
      SheetRepository.ensureSheet(OIM_SHEET, ["id", "runAt", "sprint", "total", "imported", "rejected", "warnings", "conflictos", "reportJson"]);
      return SheetRepository.for(OIM_SHEET).findAll().map(function (r) {
        try { return JSON.parse(r.reportJson); } catch (e) { return r; }
      }).reverse();
    } catch (e) { return []; }
  }

  // ── mergeVRAFCatalogs_ ────────────────────────────────────
  // Seeds required FMI catalog entries for the VRAF migration.
  // Idempotent: skips entries that already exist by código.

  function mergeVRAFCatalogs_() {
    var now = ts_();
    var log = [];

    // Objetivo
    var objResult = ensureOne_("FMI_Objectives", "codigo", OBJETIVO.codigo, {
      codigo: OBJETIVO.codigo, nombre: OBJETIVO.nombre, descripcion: OBJETIVO.descripcion,
      estado: "activo", orden: OBJETIVO.orden,
      createdAt: now, updatedAt: now, updatedBy: "migration-017",
    });
    log.push({ cat: "objetivo", codigo: OBJETIVO.codigo, id: objResult.id, created: objResult.created });

    // Dimensiones
    DIMENSIONES.forEach(function (d) {
      var r = ensureOne_("FMI_Dimensions", "codigo", d.codigo, {
        codigo: d.codigo, nombre: d.nombre, descripcion: d.descripcion,
        estado: "activo", orden: d.orden,
        createdAt: now, updatedAt: now, updatedBy: "migration-017",
      });
      log.push({ cat: "dimension", codigo: d.codigo, id: r.id, created: r.created });
    });

    // Unidades de medida
    UNIT_MEASURES.forEach(function (u) {
      var r = ensureOne_("FMI_UnitMeasures", "codigo", u.codigo, {
        codigo: u.codigo, nombre: u.nombre, tipo: u.tipo, estado: "activo",
      });
      log.push({ cat: "unitMeasure", codigo: u.codigo, id: r.id, created: r.created });
    });

    // Frecuencias
    FREQUENCIES.forEach(function (f) {
      var r = ensureOne_("FMI_Frequencies", "codigo", f.codigo, {
        codigo: f.codigo, nombre: f.nombre, descripcion: f.descripcion,
        periodoDias: f.periodoDias, estado: "activo",
      });
      log.push({ cat: "frequency", codigo: f.codigo, id: r.id, created: r.created });
    });

    // Polaridades (seeded, may already exist)
    POLARITIES_SEED.forEach(function (p) {
      var r = ensureOne_("FMI_Polarities", "codigo", p.codigo, {
        codigo: p.codigo, nombre: p.nombre, descripcion: p.descripcion, estado: "activo",
      });
      log.push({ cat: "polarity", codigo: p.codigo, id: r.id, created: r.created });
    });

    // Formulas + variables + RangeConfigs (one per indicator)
    var umPct   = findByField_("FMI_UnitMeasures", "codigo", "UM-PCT");
    var umRatio = findByField_("FMI_UnitMeasures", "codigo", "UM-RATIO");

    VRAF_RAW.forEach(function (ind, i) {
      var formulaCodigo = "FORM-VRAF-" + String(i + 1).padStart(2, "0");
      var rangeCodigo   = "RANG-VRAF-" + String(i + 1).padStart(2, "0");

      // Formula
      var umId = ind.unidadMedida === "Ratio" ? (umRatio ? umRatio.id : "") : (umPct ? umPct.id : "");
      var existingFormula = findByField_("FMI_Formulas", "codigo", formulaCodigo);
      var formulaId;
      if (existingFormula) {
        formulaId = existingFormula.id;
        log.push({ cat: "formula", codigo: formulaCodigo, id: formulaId, created: false });
      } else {
        formulaId = uid_();
        SheetRepository.for("FMI_Formulas").create({
          id: formulaId,
          codigo: formulaCodigo,
          nombre: ind.nombre,
          descripcion: ind.descripcion,
          unidadMedidaId: umId,
          formulaVisible: ind.formulaVisible,
          formulaEjecutable: ind.formulaEjecutable,
          variablesJson: JSON.stringify(ind.variables),
          estado: "activo",
          createdAt: now, updatedAt: now, updatedBy: "migration-017",
        });
        // Variables
        ind.variables.forEach(function (v) {
          SheetRepository.for("FMI_FormulaVariables").create({
            id: uid_(),
            formulaId: formulaId,
            codigo: v.codigo,
            nombre: v.nombre,
            descripcion: v.descripcion,
            tipo: v.tipo,
            orden: v.orden,
          });
        });
        log.push({ cat: "formula", codigo: formulaCodigo, id: formulaId, created: true });
      }

      // RangeConfig
      var existingRange = findByField_("FMI_RangeConfigs", "nombre", rangeCodigo);
      var rangeId;
      if (existingRange) {
        rangeId = existingRange.id;
        log.push({ cat: "rangeConfig", codigo: rangeCodigo, id: rangeId, created: false });
      } else {
        rangeId = uid_();
        var polName = ind.polaridad === "Negativa" ? "negativa" : "positiva";
        SheetRepository.for("FMI_RangeConfigs").create({
          id: rangeId,
          nombre: rangeCodigo,
          descripcion: "Rangos para: " + ind.nombre,
          polaridad: polName,
          excelente: JSON.stringify(ind.rango.excelente),
          bueno:     JSON.stringify(ind.rango.bueno),
          aceptable: JSON.stringify(ind.rango.aceptable),
          critico:   JSON.stringify(ind.rango.critico),
          estado: "activo",
          createdAt: now, updatedAt: now, updatedBy: "migration-017",
        });
        log.push({ cat: "rangeConfig", codigo: rangeCodigo, id: rangeId, created: true });
      }
    });

    return log;
  }

  // ── importVRAFIndicators_ ─────────────────────────────────
  // Migrates each of the 10 VRAF indicators through the IDE.

  function importVRAFIndicators_(responsibleId, unidadId) {
    var catalogLog = mergeVRAFCatalogs_();
    var now        = ts_();
    var results    = [];
    var conflictos = [];
    var warnings   = [];

    // Build ID maps from seeded catalogs
    function getId_(sheetName, field, value) {
      var rec = findByField_(sheetName, field, value);
      return rec ? rec.id : null;
    }

    var objId = getId_("FMI_Objectives", "codigo", "OBJ-VRAF-001");

    var dimMap = {
      "Gobernanza Administrativa":  getId_("FMI_Dimensions", "codigo", "DIM-VRAF-01"),
      "Gestión Financiera":         getId_("FMI_Dimensions", "codigo", "DIM-VRAF-02"),
      "Transformación Digital":     getId_("FMI_Dimensions", "codigo", "DIM-VRAF-03"),
      "Calidad Institucional":      getId_("FMI_Dimensions", "codigo", "DIM-VRAF-04"),
      "Planeación Presupuestaria":  getId_("FMI_Dimensions", "codigo", "DIM-VRAF-05"),
      "Gestión Presupuestaria":     getId_("FMI_Dimensions", "codigo", "DIM-VRAF-06"),
      "Inversión Institucional":    getId_("FMI_Dimensions", "codigo", "DIM-VRAF-07"),
    };
    var umMap  = { "%": getId_("FMI_UnitMeasures", "codigo", "UM-PCT"), "Ratio": getId_("FMI_UnitMeasures", "codigo", "UM-RATIO") };
    var frMap  = { "Mensual": getId_("FMI_Frequencies", "codigo", "FREC-MENS"), "Trimestral": getId_("FMI_Frequencies", "codigo", "FREC-TRIM"), "Semestral": getId_("FMI_Frequencies", "codigo", "FREC-SEM"), "Anual": getId_("FMI_Frequencies", "codigo", "FREC-ANU") };
    var polMap = { "Positiva": getId_("FMI_Polarities", "codigo", "POL-POS"), "Negativa": getId_("FMI_Polarities", "codigo", "POL-NEG") };

    VRAF_RAW.forEach(function (ind, i) {
      var seq        = String(i + 1).padStart(3, "0");
      var codigo     = "VRAF-" + seq;
      var formulaCod = "FORM-VRAF-" + String(i + 1).padStart(2, "0");
      var rangeCod   = "RANG-VRAF-" + String(i + 1).padStart(2, "0");

      var formulaId    = getId_("FMI_Formulas",    "codigo", formulaCod);
      var rangeConfigId = getId_("FMI_RangeConfigs", "nombre",  rangeCod);
      var dimensionId  = dimMap[ind.dimension] || null;
      var unitMeasureId = umMap[ind.unidadMedida] || null;
      var frequencyId  = frMap[ind.frecuencia] || null;
      var polarityId   = polMap[ind.polaridad]  || null;

      var rowResult = {
        excelRow:   ind.excelRow,
        codigo:     codigo,
        nombre:     ind.nombre,
        pi:         ind.pi,
        dimension:  ind.dimension,
        frecuencia: ind.frecuencia,
        polaridad:  ind.polaridad,
        meta:       ind.meta,
        metaStr:    ind.metaStr,
        errors:     [],
        warnings:   [],
        status:     "pending",
        indicatorId: null,
      };

      // Validate catalog references
      if (!objId)          { rowResult.errors.push("Objetivo OBJ-VRAF-001 no encontrado tras seeding."); }
      if (!dimensionId)    { rowResult.errors.push("Dimensión '" + ind.dimension + "' no encontrada."); }
      if (!unitMeasureId)  { rowResult.errors.push("Unidad de medida '" + ind.unidadMedida + "' no encontrada."); }
      if (!frequencyId)    { rowResult.errors.push("Frecuencia '" + ind.frecuencia + "' no encontrada."); }
      if (!formulaId)      { rowResult.errors.push("Fórmula " + formulaCod + " no encontrada tras seeding."); }
      if (!polarityId)     { rowResult.errors.push("Polaridad '" + ind.polaridad + "' no encontrada."); }
      if (!rangeConfigId)  { rowResult.errors.push("Rango " + rangeCod + " no encontrado tras seeding."); }

      if (!responsibleId) {
        rowResult.warnings.push("responsibleId no proporcionado; se dejará vacío.");
        warnings.push(codigo + ": sin responsable asignado.");
      }

      if (rowResult.errors.length > 0) {
        rowResult.status = "rechazado";
        conflictos.push({ codigo: codigo, nombre: ind.nombre, errores: rowResult.errors });
        results.push(rowResult);
        return;
      }

      // DuplicateDetector check
      var dupCheck = IDEController.handle("ide.detectDuplicates", { codigo: codigo, nombre: ind.nombre }, "migration-017");
      if (dupCheck && dupCheck.length > 0) {
        rowResult.warnings.push("Posible duplicado detectado: " + dupCheck.map(function (d) { return d.codigo; }).join(", "));
        rowResult.status = "advertencia";
        warnings.push(codigo + ": posible duplicado.");
        results.push(rowResult);
        return;
      }

      // Create via IDEController (bypasses validation since we already validated)
      try {
        var created = IDEController.handle("ide.createIndicator", {
          codigo:        codigo,
          nombre:        ind.nombre,
          descripcion:   ind.descripcion,
          objetivoId:    objId,
          dimensionId:   dimensionId,
          unitMeasureId: unitMeasureId,
          frequencyId:   frequencyId,
          formulaId:     formulaId,
          polarityId:    polarityId,
          rangeConfigId: rangeConfigId,
          responsibleId: responsibleId || "",
          unidadId:      unidadId || "",
          meta:          ind.meta,
          vigenciaDesde: now.substring(0, 10),
          observaciones: "Migrado automáticamente desde Excel VRAF · Sprint 017 · " + now.substring(0, 10) + " · Criterio DNES: " + ind.criterio_dnes + " · Criterio CdA: " + ind.criterio_cda + " · PI: " + ind.pi + " · Fuente: " + ind.fuente,
        }, "migration-017");

        // After creation, publish directly (indicadores oficiales → estado publicado)
        if (created && created.id) {
          try {
            IDEController.handle("ide.changeStatus", { id: created.id, status: "publicado" }, "migration-017");
          } catch (pubErr) {
            rowResult.warnings.push("Indicador creado pero no publicado: " + pubErr.message);
          }
          rowResult.status     = "importado";
          rowResult.indicatorId = created.id;
        } else {
          rowResult.status = "rechazado";
          rowResult.errors.push("El controlador no devolvió un indicador válido.");
          conflictos.push({ codigo: codigo, nombre: ind.nombre, errores: rowResult.errors });
        }
      } catch (e) {
        rowResult.status = "rechazado";
        rowResult.errors.push("Error al crear: " + e.message);
        conflictos.push({ codigo: codigo, nombre: ind.nombre, errores: rowResult.errors });
      }

      results.push(rowResult);
    });

    var imported = results.filter(function (r) { return r.status === "importado"; }).length;
    var rejected = results.filter(function (r) { return r.status === "rechazado"; }).length;
    var warnCount = results.filter(function (r) { return r.status === "advertencia"; }).length;

    var report = {
      sprintId:    "017",
      fuente:      "TABLA_DE_INDICADORES_DE_VRAF.xlsx",
      runAt:       now,
      total:       VRAF_RAW.length,
      imported:    imported,
      rejected:    rejected,
      warnings:    warnCount,
      conflictos:  conflictos.length,
      catalogLog:  catalogLog,
      rows:        results,
      conflictList: conflictos,
      warningList:  warnings,
      recomendaciones: buildRecomendaciones_(results),
    };

    saveReport_(report);
    return report;
  }

  function buildRecomendaciones_(results) {
    var recs = [];
    var rechazados = results.filter(function (r) { return r.status === "rechazado"; });
    if (rechazados.length === 0) {
      recs.push("Todos los indicadores fueron migrados exitosamente. Proceder con la asignación de responsables y el inicio de captura de datos (Sprint 018).");
    } else {
      recs.push("Revisar los " + rechazados.length + " indicadores rechazados y corregir los conflictos de catálogo reportados.");
      recs.push("Verificar que los catálogos FMI (FMI_Polarities, FMI_Objectives, FMI_Dimensions) contienen los registros esperados.");
    }
    var sinResponsable = results.filter(function (r) { return r.warnings.some(function (w) { return w.includes("responsibleId"); }); });
    if (sinResponsable.length > 0) {
      recs.push("Asignar responsable institucional a " + sinResponsable.length + " indicadores importados desde la vista de edición del IDE.");
    }
    return recs;
  }

  // ── preview ───────────────────────────────────────────────

  function getPreview_() {
    return VRAF_RAW.map(function (ind, i) {
      var seq = String(i + 1).padStart(3, "0");
      return {
        excelRow:       ind.excelRow,
        codigoProposed: "VRAF-" + seq,
        nombre:         ind.nombre,
        pi:             ind.pi,
        dimension:      ind.dimension,
        unidadMedida:   ind.unidadMedida,
        frecuencia:     ind.frecuencia,
        polaridad:      ind.polaridad,
        meta:           ind.meta,
        metaStr:        ind.metaStr,
        rangoStr:       ind.rangoStr,
        formulaVisible: ind.formulaVisible,
        variables:      ind.variables.map(function (v) { return v.nombre; }).join(", "),
        herramienta:    ind.herramienta,
        fuente:         ind.fuente,
        criterio_dnes:  ind.criterio_dnes,
        criterio_cda:   ind.criterio_cda,
      };
    });
  }

  // ── Public API ────────────────────────────────────────────

  return {
    handle: function (action, params) {
      switch (action) {
        case "oim.runMigration":
          return importVRAFIndicators_(params.responsibleId, params.unidadId);
        case "oim.getPreview":
          return getPreview_();
        case "oim.listReports":
          return listReports_();
        case "oim.mergeVRAFCatalogs":
          return mergeVRAFCatalogs_();
        default:
          throw new Error("OIM: acción desconocida: " + action);
      }
    },

    bootstrap: function () {
      SheetRepository.ensureSheet(OIM_SHEET, ["id", "runAt", "sprint", "total", "imported", "rejected", "warnings", "conflictos", "reportJson"]);
    },
  };
})();
