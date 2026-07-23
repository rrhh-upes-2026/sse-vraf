/**
 * FMIController — Framework Maestro de Indicadores.
 *
 * Internal services:
 *   ObjectiveService_    — CRUD FMI_Objectives
 *   DimensionService_    — CRUD FMI_Dimensions
 *   UnitMeasureService_  — CRUD FMI_UnitMeasures
 *   FrequencyService_    — CRUD FMI_Frequencies
 *   PolarityService_     — read FMI_Polarities (seeded only)
 *   FormulaService_      — CRUD FMI_Formulas + FMI_FormulaVariables
 *   FormulaEngine_       — evaluates formulaEjecutable with variable values
 *   RangeEngine_         — evaluates a value against a RangeConfig
 *   RangeConfigService_  — CRUD FMI_RangeConfigs
 *
 * Security:
 *   - Reads responsible data from ISP (by responsibleId); never stores personal info.
 *   - No duplicate catalogs from existing modules.
 *   - FormulaEngine uses sandboxed expression evaluation (basic arithmetic only).
 */
var FMIController = (function () {
  "use strict";

  var SHEET = {
    OBJECTIVES:    "FMI_Objectives",
    DIMENSIONS:    "FMI_Dimensions",
    UNIT_MEASURES: "FMI_UnitMeasures",
    FREQUENCIES:   "FMI_Frequencies",
    POLARITIES:    "FMI_Polarities",
    FORMULAS:      "FMI_Formulas",
    FORMULA_VARS:  "FMI_FormulaVariables",
    RANGE_CONFIGS: "FMI_RangeConfigs",
  };

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function _now_()     { return new Date().toISOString(); }
  function _repo_(s)   { return SheetRepository.for(s); }
  function _all_(s)    { try { return _repo_(s).findAll(); } catch(e) { return []; } }

  function _active_(rows) {
    return rows.filter(function(r) { return r.estado !== "inactivo"; });
  }

  function _byId_(rows, id) {
    for (var i = 0; i < rows.length; i++) { if (rows[i].id === id) return rows[i]; }
    return null;
  }

  function _notFound_(entity, id) {
    var err = new Error(entity + " no encontrado: " + id);
    err.code = "NOT_FOUND";
    throw err;
  }

  // ─── ObjectiveService_ ───────────────────────────────────────────────────

  var ObjectiveService_ = {
    list: function (params) {
      var rows = _all_(SHEET.OBJECTIVES);
      if (params && params.estado) rows = rows.filter(function(r) { return r.estado === params.estado; });
      rows.sort(function(a, b) { return (Number(a.orden) || 0) - (Number(b.orden) || 0); });
      return rows;
    },
    get: function (id) {
      var row = _byId_(_all_(SHEET.OBJECTIVES), id);
      if (!row) _notFound_("Objetivo", id);
      return row;
    },
    create: function (params, userId) {
      var now  = _now_();
      var rows = _all_(SHEET.OBJECTIVES);
      var maxOrden = rows.reduce(function(m, r) { return Math.max(m, Number(r.orden) || 0); }, 0);
      var obj  = {
        id:          IdGen.entityId("FMI_OBJ"),
        codigo:      String(params.codigo || "").trim(),
        nombre:      String(params.nombre || "").trim(),
        descripcion: String(params.descripcion || "").trim(),
        estado:      "activo",
        orden:       Number(params.orden) || maxOrden + 1,
        createdAt:   now,
        updatedAt:   now,
        updatedBy:   userId || "",
      };
      if (!obj.codigo) throw new Error("El código es requerido.");
      if (!obj.nombre) throw new Error("El nombre es requerido.");
      _repo_(SHEET.OBJECTIVES).create(obj);
      return obj;
    },
    update: function (id, params, userId) {
      var repo = _repo_(SHEET.OBJECTIVES);
      var row  = _byId_(repo.findAll(), id);
      if (!row) _notFound_("Objetivo", id);
      var upd = {
        updatedAt: _now_(),
        updatedBy: userId || "",
      };
      if (params.codigo      !== undefined) upd.codigo      = String(params.codigo).trim();
      if (params.nombre      !== undefined) upd.nombre      = String(params.nombre).trim();
      if (params.descripcion !== undefined) upd.descripcion = String(params.descripcion).trim();
      if (params.estado      !== undefined) upd.estado      = params.estado;
      if (params.orden       !== undefined) upd.orden       = Number(params.orden);
      repo.update(id, upd);
      return Object.assign({}, row, upd);
    },
    delete: function (id) {
      _repo_(SHEET.OBJECTIVES).remove(id);
      return { deleted: true, id: id };
    },
  };

  // ─── DimensionService_ ───────────────────────────────────────────────────

  var DimensionService_ = {
    list: function (params) {
      var rows = _all_(SHEET.DIMENSIONS);
      if (params && params.estado) rows = rows.filter(function(r) { return r.estado === params.estado; });
      rows.sort(function(a, b) { return (Number(a.orden) || 0) - (Number(b.orden) || 0); });
      return rows;
    },
    get: function (id) {
      var row = _byId_(_all_(SHEET.DIMENSIONS), id);
      if (!row) _notFound_("Dimensión", id);
      return row;
    },
    create: function (params, userId) {
      var now  = _now_();
      var rows = _all_(SHEET.DIMENSIONS);
      var maxOrden = rows.reduce(function(m, r) { return Math.max(m, Number(r.orden) || 0); }, 0);
      var obj  = {
        id:          IdGen.entityId("FMI_DIM"),
        codigo:      String(params.codigo || "").trim(),
        nombre:      String(params.nombre || "").trim(),
        descripcion: String(params.descripcion || "").trim(),
        estado:      "activo",
        orden:       Number(params.orden) || maxOrden + 1,
        createdAt:   now,
        updatedAt:   now,
        updatedBy:   userId || "",
      };
      if (!obj.codigo) throw new Error("El código es requerido.");
      if (!obj.nombre) throw new Error("El nombre es requerido.");
      _repo_(SHEET.DIMENSIONS).create(obj);
      return obj;
    },
    update: function (id, params, userId) {
      var repo = _repo_(SHEET.DIMENSIONS);
      var row  = _byId_(repo.findAll(), id);
      if (!row) _notFound_("Dimensión", id);
      var upd = { updatedAt: _now_(), updatedBy: userId || "" };
      if (params.codigo      !== undefined) upd.codigo      = String(params.codigo).trim();
      if (params.nombre      !== undefined) upd.nombre      = String(params.nombre).trim();
      if (params.descripcion !== undefined) upd.descripcion = String(params.descripcion).trim();
      if (params.estado      !== undefined) upd.estado      = params.estado;
      if (params.orden       !== undefined) upd.orden       = Number(params.orden);
      repo.update(id, upd);
      return Object.assign({}, row, upd);
    },
    delete: function (id) {
      _repo_(SHEET.DIMENSIONS).remove(id);
      return { deleted: true, id: id };
    },
  };

  // ─── UnitMeasureService_ ─────────────────────────────────────────────────

  var UnitMeasureService_ = {
    list: function (params) {
      var rows = _all_(SHEET.UNIT_MEASURES);
      if (params && params.tipo)   rows = rows.filter(function(r) { return r.tipo   === params.tipo;   });
      if (params && params.estado) rows = rows.filter(function(r) { return r.estado === params.estado; });
      return rows;
    },
    get: function (id) {
      var row = _byId_(_all_(SHEET.UNIT_MEASURES), id);
      if (!row) _notFound_("Unidad de Medida", id);
      return row;
    },
    create: function (params) {
      var obj = {
        id:     IdGen.entityId("FMI_UM"),
        codigo: String(params.codigo || "").trim(),
        nombre: String(params.nombre || "").trim(),
        tipo:   params.tipo === "cualitativa" ? "cualitativa" : "cuantitativa",
        estado: "activo",
      };
      if (!obj.codigo) throw new Error("El código es requerido.");
      if (!obj.nombre) throw new Error("El nombre es requerido.");
      _repo_(SHEET.UNIT_MEASURES).create(obj);
      return obj;
    },
    update: function (id, params) {
      var repo = _repo_(SHEET.UNIT_MEASURES);
      var row  = _byId_(repo.findAll(), id);
      if (!row) _notFound_("Unidad de Medida", id);
      var upd = {};
      if (params.codigo !== undefined) upd.codigo = String(params.codigo).trim();
      if (params.nombre !== undefined) upd.nombre = String(params.nombre).trim();
      if (params.tipo   !== undefined) upd.tipo   = params.tipo;
      if (params.estado !== undefined) upd.estado = params.estado;
      repo.update(id, upd);
      return Object.assign({}, row, upd);
    },
    delete: function (id) {
      _repo_(SHEET.UNIT_MEASURES).remove(id);
      return { deleted: true, id: id };
    },
  };

  // ─── FrequencyService_ ───────────────────────────────────────────────────

  var FrequencyService_ = {
    list: function (params) {
      var rows = _all_(SHEET.FREQUENCIES);
      if (params && params.estado) rows = rows.filter(function(r) { return r.estado === params.estado; });
      return rows;
    },
    get: function (id) {
      var row = _byId_(_all_(SHEET.FREQUENCIES), id);
      if (!row) _notFound_("Frecuencia", id);
      return row;
    },
    create: function (params) {
      var obj = {
        id:          IdGen.entityId("FMI_FREQ"),
        codigo:      String(params.codigo || "").trim(),
        nombre:      String(params.nombre || "").trim(),
        descripcion: String(params.descripcion || "").trim(),
        periodoDias: Number(params.periodoDias) || 0,
        estado:      "activo",
      };
      if (!obj.codigo) throw new Error("El código es requerido.");
      if (!obj.nombre) throw new Error("El nombre es requerido.");
      _repo_(SHEET.FREQUENCIES).create(obj);
      return obj;
    },
    update: function (id, params) {
      var repo = _repo_(SHEET.FREQUENCIES);
      var row  = _byId_(repo.findAll(), id);
      if (!row) _notFound_("Frecuencia", id);
      var upd = {};
      if (params.codigo      !== undefined) upd.codigo      = String(params.codigo).trim();
      if (params.nombre      !== undefined) upd.nombre      = String(params.nombre).trim();
      if (params.descripcion !== undefined) upd.descripcion = String(params.descripcion).trim();
      if (params.periodoDias !== undefined) upd.periodoDias = Number(params.periodoDias);
      if (params.estado      !== undefined) upd.estado      = params.estado;
      repo.update(id, upd);
      return Object.assign({}, row, upd);
    },
    delete: function (id) {
      _repo_(SHEET.FREQUENCIES).remove(id);
      return { deleted: true, id: id };
    },
  };

  // ─── PolarityService_ ────────────────────────────────────────────────────

  var PolarityService_ = {
    list: function () { return _all_(SHEET.POLARITIES); },
  };

  // ─── FormulaEngine_ ──────────────────────────────────────────────────────

  var FormulaEngine_ = {
    /**
     * Evaluates formulaEjecutable by substituting variable codes with numeric values.
     * Only basic arithmetic is supported: +, -, *, /, (, ), ^, %, numbers.
     * @param {string}  formulaEjecutable  e.g. "(v1 / v2) * 100"
     * @param {object}  values             e.g. { v1: 80, v2: 100 }
     * @returns {number}
     */
    calculate: function (formulaEjecutable, values) {
      var expr = String(formulaEjecutable);
      // Substitute each variable code with its numeric value
      var keys = Object.keys(values || {});
      // Sort longer keys first to avoid partial substitution
      keys.sort(function(a, b) { return b.length - a.length; });
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var v = parseFloat(values[k]);
        if (isNaN(v)) throw new Error("Variable '" + k + "' debe ser numérica.");
        // Replace all occurrences — use word boundary simulation
        expr = expr.split(k).join(String(v));
      }
      // Validate: only allow safe characters after substitution
      if (!/^[\d\s\+\-\*\/\(\)\.\,\%\^]+$/.test(expr)) {
        throw new Error("Expresión inválida después de sustituir variables: " + expr);
      }
      // Handle exponentiation (^) before eval
      expr = expr.replace(/(\d+\.?\d*)\s*\^\s*(\d+\.?\d*)/g, "Math.pow($1,$2)");
      var result;
      try {
        /* jshint evil: true */
        result = eval(expr); // safe: only digits and operators pass the regex above
      } catch (e) {
        throw new Error("Error al calcular fórmula: " + e.message);
      }
      if (typeof result !== "number" || isNaN(result)) {
        throw new Error("El resultado de la fórmula no es un número válido.");
      }
      return Math.round(result * 100000) / 100000;
    },

    /**
     * Validates that a formula references only declared variable codes.
     */
    validate: function (formulaEjecutable, variables) {
      var expr = String(formulaEjecutable);
      for (var i = 0; i < variables.length; i++) {
        expr = expr.split(variables[i].codigo).join("0");
      }
      return /^[\d\s\+\-\*\/\(\)\.\,\%\^]+$/.test(expr);
    },
  };

  // ─── FormulaService_ ─────────────────────────────────────────────────────

  var FormulaService_ = {
    _loadVariables_: function (formulaId) {
      return _all_(SHEET.FORMULA_VARS)
        .filter(function(v) { return v.formulaId === formulaId; })
        .sort(function(a, b) { return (Number(a.orden) || 0) - (Number(b.orden) || 0); });
    },
    _saveVariables_: function (formulaId, variables) {
      var repo = _repo_(SHEET.FORMULA_VARS);
      // Remove existing
      repo.findAll()
        .filter(function(v) { return v.formulaId === formulaId; })
        .forEach(function(v) { repo.remove(v.id); });
      // Insert new
      (variables || []).forEach(function(v, idx) {
        repo.create({
          id:          IdGen.entityId("FMI_FV"),
          formulaId:   formulaId,
          codigo:      String(v.codigo || "").trim(),
          nombre:      String(v.nombre || "").trim(),
          descripcion: String(v.descripcion || "").trim(),
          tipo:        v.tipo || "numero",
          orden:       Number(v.orden) || idx + 1,
        });
      });
    },
    _enrich_: function (row) {
      row.variables = FormulaService_._loadVariables_(row.id);
      return row;
    },
    list: function (params) {
      var rows = _all_(SHEET.FORMULAS);
      if (params && params.unidadMedidaId) rows = rows.filter(function(r) { return r.unidadMedidaId === params.unidadMedidaId; });
      if (params && params.estado)         rows = rows.filter(function(r) { return r.estado === params.estado; });
      return rows.map(function(r) { return FormulaService_._enrich_(r); });
    },
    get: function (id) {
      var row = _byId_(_all_(SHEET.FORMULAS), id);
      if (!row) _notFound_("Fórmula", id);
      return FormulaService_._enrich_(row);
    },
    create: function (params, userId) {
      var now = _now_();
      var formula = {
        id:               IdGen.entityId("FMI_FORM"),
        codigo:           String(params.codigo || "").trim(),
        nombre:           String(params.nombre || "").trim(),
        descripcion:      String(params.descripcion || "").trim(),
        unidadMedidaId:   String(params.unidadMedidaId || "").trim(),
        formulaVisible:   String(params.formulaVisible || "").trim(),
        formulaEjecutable: String(params.formulaEjecutable || "").trim(),
        variablesJson:    JSON.stringify(params.variables || []),
        estado:           "activo",
        createdAt:        now,
        updatedAt:        now,
        updatedBy:        userId || "",
      };
      if (!formula.codigo) throw new Error("El código es requerido.");
      if (!formula.nombre) throw new Error("El nombre es requerido.");
      // Validate formula
      if (formula.formulaEjecutable && params.variables && params.variables.length > 0) {
        if (!FormulaEngine_.validate(formula.formulaEjecutable, params.variables)) {
          throw new Error("La fórmula referencia variables no declaradas.");
        }
      }
      _repo_(SHEET.FORMULAS).create(formula);
      if (params.variables && params.variables.length > 0) {
        FormulaService_._saveVariables_(formula.id, params.variables);
      }
      formula.variables = params.variables || [];
      return formula;
    },
    update: function (id, params, userId) {
      var repo = _repo_(SHEET.FORMULAS);
      var row  = _byId_(repo.findAll(), id);
      if (!row) _notFound_("Fórmula", id);
      var upd = { updatedAt: _now_(), updatedBy: userId || "" };
      if (params.codigo            !== undefined) upd.codigo            = String(params.codigo).trim();
      if (params.nombre            !== undefined) upd.nombre            = String(params.nombre).trim();
      if (params.descripcion       !== undefined) upd.descripcion       = String(params.descripcion).trim();
      if (params.unidadMedidaId    !== undefined) upd.unidadMedidaId    = String(params.unidadMedidaId).trim();
      if (params.formulaVisible    !== undefined) upd.formulaVisible    = String(params.formulaVisible).trim();
      if (params.formulaEjecutable !== undefined) upd.formulaEjecutable = String(params.formulaEjecutable).trim();
      if (params.estado            !== undefined) upd.estado            = params.estado;
      if (params.variables         !== undefined) upd.variablesJson     = JSON.stringify(params.variables);
      repo.update(id, upd);
      if (params.variables !== undefined) {
        FormulaService_._saveVariables_(id, params.variables);
      }
      var updated = Object.assign({}, row, upd);
      updated.variables = params.variables !== undefined
        ? params.variables
        : FormulaService_._loadVariables_(id);
      return updated;
    },
    delete: function (id) {
      // Remove variables first
      _all_(SHEET.FORMULA_VARS)
        .filter(function(v) { return v.formulaId === id; })
        .forEach(function(v) { _repo_(SHEET.FORMULA_VARS).remove(v.id); });
      _repo_(SHEET.FORMULAS).remove(id);
      return { deleted: true, id: id };
    },
    calculate: function (id, values) {
      var formula = FormulaService_.get(id);
      var result  = FormulaEngine_.calculate(formula.formulaEjecutable, values);
      return { formulaId: id, values: values, result: result };
    },
  };

  // ─── RangeEngine_ ────────────────────────────────────────────────────────

  var RangeEngine_ = {
    /**
     * Evaluates a value against a RangeConfig and returns the range status.
     * Each level is stored as JSON: { min: number, max: number }.
     * Polaridad "positiva" → higher is better (max of excelente ≥ min of critico).
     * Polaridad "negativa" → lower is better (min of excelente ≤ max of critico).
     */
    evaluate: function (value, rangeConfig) {
      var levels = ["excelente", "bueno", "aceptable", "critico"];
      for (var i = 0; i < levels.length; i++) {
        var lvl = levels[i];
        var bounds;
        try { bounds = JSON.parse(String(rangeConfig[lvl])); } catch(e) { continue; }
        if (value >= (bounds.min || 0) && value <= (bounds.max || 0)) return lvl;
      }
      return "critico";
    },
  };

  // ─── RangeConfigService_ ─────────────────────────────────────────────────

  var RangeConfigService_ = {
    _parse_: function (row) {
      ["excelente", "bueno", "aceptable", "critico"].forEach(function(k) {
        try { row[k] = JSON.parse(String(row[k] || "{}")); } catch(e) { row[k] = { min: 0, max: 0 }; }
      });
      return row;
    },
    list: function (params) {
      var rows = _all_(SHEET.RANGE_CONFIGS);
      if (params && params.estado) rows = rows.filter(function(r) { return r.estado === params.estado; });
      return rows.map(function(r) { return RangeConfigService_._parse_(r); });
    },
    get: function (id) {
      var row = _byId_(_all_(SHEET.RANGE_CONFIGS), id);
      if (!row) _notFound_("Configuración de Rangos", id);
      return RangeConfigService_._parse_(row);
    },
    create: function (params, userId) {
      var now = _now_();
      var obj = {
        id:          IdGen.entityId("FMI_RNG"),
        nombre:      String(params.nombre || "").trim(),
        descripcion: String(params.descripcion || "").trim(),
        polaridad:   params.polaridad === "negativa" ? "negativa" : "positiva",
        excelente:   JSON.stringify(params.excelente || { min: 90, max: 100 }),
        bueno:       JSON.stringify(params.bueno     || { min: 75, max: 89  }),
        aceptable:   JSON.stringify(params.aceptable || { min: 60, max: 74  }),
        critico:     JSON.stringify(params.critico   || { min: 0,  max: 59  }),
        estado:      "activo",
        createdAt:   now,
        updatedAt:   now,
        updatedBy:   userId || "",
      };
      if (!obj.nombre) throw new Error("El nombre es requerido.");
      _repo_(SHEET.RANGE_CONFIGS).create(obj);
      return RangeConfigService_._parse_(obj);
    },
    update: function (id, params, userId) {
      var repo = _repo_(SHEET.RANGE_CONFIGS);
      var row  = _byId_(repo.findAll(), id);
      if (!row) _notFound_("Configuración de Rangos", id);
      var upd  = { updatedAt: _now_(), updatedBy: userId || "" };
      if (params.nombre      !== undefined) upd.nombre      = String(params.nombre).trim();
      if (params.descripcion !== undefined) upd.descripcion = String(params.descripcion).trim();
      if (params.polaridad   !== undefined) upd.polaridad   = params.polaridad;
      if (params.excelente   !== undefined) upd.excelente   = JSON.stringify(params.excelente);
      if (params.bueno       !== undefined) upd.bueno       = JSON.stringify(params.bueno);
      if (params.aceptable   !== undefined) upd.aceptable   = JSON.stringify(params.aceptable);
      if (params.critico     !== undefined) upd.critico     = JSON.stringify(params.critico);
      if (params.estado      !== undefined) upd.estado      = params.estado;
      repo.update(id, upd);
      return RangeConfigService_._parse_(Object.assign({}, row, upd));
    },
    delete: function (id) {
      _repo_(SHEET.RANGE_CONFIGS).remove(id);
      return { deleted: true, id: id };
    },
    evaluate: function (id, value) {
      var cfg    = RangeConfigService_.get(id);
      var status = RangeEngine_.evaluate(Number(value), cfg);
      return { rangeConfigId: id, value: Number(value), status: status };
    },
  };

  // ─── Bootstrap seeds ─────────────────────────────────────────────────────

  function _seedUnitMeasures_() {
    var repo = _repo_(SHEET.UNIT_MEASURES);
    var existing = repo.findAll();
    if (existing.length > 0) return;

    var units = [
      { codigo: "PCT",  nombre: "Porcentaje (%)",    tipo: "cuantitativa" },
      { codigo: "RAT",  nombre: "Ratio",              tipo: "cuantitativa" },
      { codigo: "NUM",  nombre: "Número",             tipo: "cuantitativa" },
      { codigo: "CNT",  nombre: "Cantidad",           tipo: "cuantitativa" },
      { codigo: "IDX",  nombre: "Índice",             tipo: "cuantitativa" },
      { codigo: "DIA",  nombre: "Días",               tipo: "cuantitativa" },
      { codigo: "HRS",  nombre: "Horas",              tipo: "cuantitativa" },
      { codigo: "MIN",  nombre: "Minutos",            tipo: "cuantitativa" },
      { codigo: "MES",  nombre: "Meses",              tipo: "cuantitativa" },
      { codigo: "ANO",  nombre: "Años",               tipo: "cuantitativa" },
      { codigo: "USD",  nombre: "Moneda (USD)",       tipo: "cuantitativa" },
      { codigo: "PER",  nombre: "Personas",           tipo: "cuantitativa" },
      { codigo: "ACT",  nombre: "Actividades",        tipo: "cuantitativa" },
      { codigo: "PRC",  nombre: "Procesos",           tipo: "cuantitativa" },
      { codigo: "PRY",  nombre: "Proyectos",          tipo: "cuantitativa" },
      { codigo: "CUR",  nombre: "Cursos",             tipo: "cuantitativa" },
      { codigo: "CAP",  nombre: "Capacitaciones",     tipo: "cuantitativa" },
      { codigo: "DOC",  nombre: "Documentos",         tipo: "cuantitativa" },
      { codigo: "SOL",  nombre: "Solicitudes",        tipo: "cuantitativa" },
      { codigo: "CAS",  nombre: "Casos",              tipo: "cuantitativa" },
      { codigo: "INC",  nombre: "Incidentes",         tipo: "cuantitativa" },
      { codigo: "RCL",  nombre: "Reclamos",           tipo: "cuantitativa" },
      { codigo: "SES",  nombre: "Sesiones",           tipo: "cuantitativa" },
      { codigo: "EVA",  nombre: "Evaluaciones",       tipo: "cuantitativa" },
      { codigo: "NVL",  nombre: "Nivel",              tipo: "cualitativa"  },
      { codigo: "EST",  nombre: "Estado",             tipo: "cualitativa"  },
      { codigo: "CNC",  nombre: "Cumple / No cumple", tipo: "cualitativa"  },
      { codigo: "SIN",  nombre: "Sí / No",            tipo: "cualitativa"  },
      { codigo: "ES5",  nombre: "Escala 1–5",         tipo: "cuantitativa" },
      { codigo: "ES10", nombre: "Escala 1–10",        tipo: "cuantitativa" },
    ];

    units.forEach(function(u) {
      repo.create({ id: IdGen.entityId("FMI_UM"), codigo: u.codigo, nombre: u.nombre, tipo: u.tipo, estado: "activo" });
    });
  }

  function _seedFrequencies_() {
    var repo = _repo_(SHEET.FREQUENCIES);
    if (repo.findAll().length > 0) return;

    var freqs = [
      { codigo: "MENS",  nombre: "Mensual",       descripcion: "Cada 30 días",   periodoDias: 30  },
      { codigo: "BIME",  nombre: "Bimestral",      descripcion: "Cada 60 días",   periodoDias: 60  },
      { codigo: "TRIM",  nombre: "Trimestral",     descripcion: "Cada 90 días",   periodoDias: 90  },
      { codigo: "CUAT",  nombre: "Cuatrimestral",  descripcion: "Cada 120 días",  periodoDias: 120 },
      { codigo: "SEMI",  nombre: "Semestral",      descripcion: "Cada 180 días",  periodoDias: 180 },
      { codigo: "ANUA",  nombre: "Anual",          descripcion: "Cada 365 días",  periodoDias: 365 },
      { codigo: "EVEN",  nombre: "Eventual",       descripcion: "Sin periodicidad fija", periodoDias: 0 },
    ];

    freqs.forEach(function(f) {
      repo.create({
        id:          IdGen.entityId("FMI_FREQ"),
        codigo:      f.codigo,
        nombre:      f.nombre,
        descripcion: f.descripcion,
        periodoDias: f.periodoDias,
        estado:      "activo",
      });
    });
  }

  function _seedPolarities_() {
    var repo = _repo_(SHEET.POLARITIES);
    if (repo.findAll().length > 0) return;

    [
      { codigo: "POS", nombre: "Positiva", descripcion: "Mayor valor = mejor resultado" },
      { codigo: "NEG", nombre: "Negativa", descripcion: "Menor valor = mejor resultado" },
    ].forEach(function(p) {
      repo.create({ id: IdGen.entityId("FMI_POL"), codigo: p.codigo, nombre: p.nombre, descripcion: p.descripcion, estado: "activo" });
    });
  }

  function bootstrap() {
    try { _seedUnitMeasures_(); } catch(e) { AppLogger.warn("FMI bootstrap: seedUnitMeasures error: " + e.message); }
    try { _seedFrequencies_();  } catch(e) { AppLogger.warn("FMI bootstrap: seedFrequencies error: " + e.message); }
    try { _seedPolarities_();   } catch(e) { AppLogger.warn("FMI bootstrap: seedPolarities error: " + e.message); }
  }

  // ─── Public handle ────────────────────────────────────────────────────────

  function handle(action, params, ctx) {
    var uid = (ctx && ctx.userId) || "";
    params  = params || {};

    switch (action) {
      // Objectives
      case "listObjectives":    return ObjectiveService_.list(params);
      case "getObjective":      return ObjectiveService_.get(params.id);
      case "createObjective":   return ObjectiveService_.create(params, uid);
      case "updateObjective":   return ObjectiveService_.update(params.id, params, uid);
      case "deleteObjective":   return ObjectiveService_.delete(params.id);

      // Dimensions
      case "listDimensions":    return DimensionService_.list(params);
      case "getDimension":      return DimensionService_.get(params.id);
      case "createDimension":   return DimensionService_.create(params, uid);
      case "updateDimension":   return DimensionService_.update(params.id, params, uid);
      case "deleteDimension":   return DimensionService_.delete(params.id);

      // Unit Measures
      case "listUnitMeasures":  return UnitMeasureService_.list(params);
      case "getUnitMeasure":    return UnitMeasureService_.get(params.id);
      case "createUnitMeasure": return UnitMeasureService_.create(params);
      case "updateUnitMeasure": return UnitMeasureService_.update(params.id, params);
      case "deleteUnitMeasure": return UnitMeasureService_.delete(params.id);

      // Frequencies
      case "listFrequencies":   return FrequencyService_.list(params);
      case "getFrequency":      return FrequencyService_.get(params.id);
      case "createFrequency":   return FrequencyService_.create(params);
      case "updateFrequency":   return FrequencyService_.update(params.id, params);
      case "deleteFrequency":   return FrequencyService_.delete(params.id);

      // Polarities (read-only seeded catalog)
      case "listPolarities":    return PolarityService_.list();

      // Formulas
      case "listFormulas":      return FormulaService_.list(params);
      case "getFormula":        return FormulaService_.get(params.id);
      case "createFormula":     return FormulaService_.create(params, uid);
      case "updateFormula":     return FormulaService_.update(params.id, params, uid);
      case "deleteFormula":     return FormulaService_.delete(params.id);
      case "calculateFormula":  return FormulaService_.calculate(params.id, params.values);

      // Range Configs
      case "listRangeConfigs":  return RangeConfigService_.list(params);
      case "getRangeConfig":    return RangeConfigService_.get(params.id);
      case "createRangeConfig": return RangeConfigService_.create(params, uid);
      case "updateRangeConfig": return RangeConfigService_.update(params.id, params, uid);
      case "deleteRangeConfig": return RangeConfigService_.delete(params.id);
      case "evaluateRange":     return RangeConfigService_.evaluate(params.id, params.value);

      default:
        var err = new Error("FMIController: acción desconocida: " + action);
        err.code = "UNKNOWN_ACTION";
        throw err;
    }
  }

  return { handle: handle, bootstrap: bootstrap };
})();
