// ============================================================
// IDE — Indicator Definition Engine Controller  |  Sprint 016
// ============================================================

var IDEController = (function () {
  "use strict";

  var SHEET_IND = "IDE_Indicators";
  var SHEET_VER = "IDE_IndicatorVersions";
  var STATUSES  = ["borrador", "en_revision", "publicado", "archivado"];

  // ── Repository helpers ─────────────────────────────────────

  var indRepo_ = { get r() { return SheetRepository.for(SHEET_IND); } };
  var verRepo_ = { get r() { return SheetRepository.for(SHEET_VER); } };

  function ts_() { return new Date().toISOString(); }

  // ── IndicatorValidator_ ────────────────────────────────────

  var IndicatorValidator_ = {
    validate: function (data, existingId) {
      var errors = [];
      if (!data.codigo || !String(data.codigo).trim())
        errors.push({ field: "codigo", message: "El código es obligatorio." });
      if (!data.nombre || !String(data.nombre).trim())
        errors.push({ field: "nombre", message: "El nombre es obligatorio." });

      // Unique codigo check
      if (data.codigo) {
        var dupes = indRepo_.r.findAll().filter(function (r) {
          return r.codigo === data.codigo && r.activo !== false && r.id !== (existingId || "");
        });
        if (dupes.length > 0) errors.push({ field: "codigo", message: "El código ya existe." });
      }

      // FMI catalog existence checks
      if (data.objetivoId) {
        var obj = SheetRepository.for("FMI_Objectives").findAll().filter(function (r) { return r.id === data.objetivoId; });
        if (!obj.length) errors.push({ field: "objetivoId", message: "Objetivo no encontrado." });
      }
      if (data.dimensionId) {
        var dim = SheetRepository.for("FMI_Dimensions").findAll().filter(function (r) { return r.id === data.dimensionId; });
        if (!dim.length) errors.push({ field: "dimensionId", message: "Dimensión no encontrada." });
      }
      if (data.unitMeasureId) {
        var um = SheetRepository.for("FMI_UnitMeasures").findAll().filter(function (r) { return r.id === data.unitMeasureId; });
        if (!um.length) errors.push({ field: "unitMeasureId", message: "Unidad de medida no encontrada." });
      }
      if (data.frequencyId) {
        var fr = SheetRepository.for("FMI_Frequencies").findAll().filter(function (r) { return r.id === data.frequencyId; });
        if (!fr.length) errors.push({ field: "frequencyId", message: "Frecuencia no encontrada." });
      }
      if (data.formulaId) {
        var fm = SheetRepository.for("FMI_Formulas").findAll().filter(function (r) { return r.id === data.formulaId; });
        if (!fm.length) errors.push({ field: "formulaId", message: "Fórmula no encontrada." });
      }
      if (data.polarityId) {
        var pol = SheetRepository.for("FMI_Polarities").findAll().filter(function (r) { return r.id === data.polarityId; });
        if (!pol.length) errors.push({ field: "polarityId", message: "Polaridad no encontrada." });
      }
      if (data.rangeConfigId) {
        var rc = SheetRepository.for("FMI_RangeConfigs").findAll().filter(function (r) { return r.id === data.rangeConfigId; });
        if (!rc.length) errors.push({ field: "rangeConfigId", message: "Configuración de rangos no encontrada." });
      }
      if (data.meta !== undefined && data.meta !== null && data.meta !== "") {
        var metaNum = Number(data.meta);
        if (isNaN(metaNum)) errors.push({ field: "meta", message: "La meta debe ser un número." });
      }

      return { valid: errors.length === 0, errors: errors };
    },
  };

  // ── VariableResolver_ ──────────────────────────────────────

  var VariableResolver_ = {
    resolve: function (formulaId) {
      if (!formulaId) return [];
      var formula = SheetRepository.for("FMI_Formulas").findAll()
        .filter(function (r) { return r.id === formulaId; })[0];
      if (!formula) return [];
      return SheetRepository.for("FMI_FormulaVariables").findAll()
        .filter(function (v) { return v.formulaId === formulaId; })
        .sort(function (a, b) { return Number(a.orden) - Number(b.orden); })
        .map(function (v) {
          return { codigo: v.codigo, nombre: v.nombre, descripcion: v.descripcion, tipo: v.tipo };
        });
    },
  };

  // ── PreviewEngine_ ─────────────────────────────────────────

  var PreviewEngine_ = {
    preview: function (data) {
      var resolve = function (sheet, id) {
        if (!id) return null;
        return SheetRepository.for(sheet).findAll().filter(function (r) { return r.id === id; })[0] || null;
      };

      var formula = resolve("FMI_Formulas", data.formulaId);
      var variables = data.formulaId ? VariableResolver_.resolve(data.formulaId) : [];
      var formulaData = formula ? {
        id: formula.id,
        nombre: formula.nombre,
        formulaVisible: formula.formulaVisible,
        variables: variables,
      } : null;

      var exampleCalc = formulaData
        ? formulaData.formulaVisible + " (con valores de ejemplo)"
        : "No se ha asignado fórmula.";

      return {
        indicator:      data,
        objetivo:       resolve("FMI_Objectives",  data.objetivoId),
        dimension:      resolve("FMI_Dimensions",  data.dimensionId),
        unitMeasure:    resolve("FMI_UnitMeasures", data.unitMeasureId),
        frequency:      resolve("FMI_Frequencies", data.frequencyId),
        formula:        formulaData,
        polarity:       resolve("FMI_Polarities",  data.polarityId),
        rangeConfig:    resolve("FMI_RangeConfigs", data.rangeConfigId),
        calculoEjemplo: exampleCalc,
      };
    },
  };

  // ── SimulationService_ ─────────────────────────────────────

  var SimulationService_ = {
    simulate: function (indicatorId, values) {
      var ind = indRepo_.r.findAll().filter(function (r) { return r.id === indicatorId; })[0];
      if (!ind) throw new Error("Indicador no encontrado.");

      if (!ind.formulaId) return { result: null, level: null, levelLabel: "Sin fórmula", interpretation: "El indicador no tiene fórmula asignada.", metaCumplida: false };

      // Use FMIController's calculate
      var calcResult = FMIController.handle("fmi.calculateFormula", { id: ind.formulaId, values: values }, {});
      var result = calcResult.result;

      // Evaluate range
      var levelLabel = "Sin rango";
      var level = null;
      if (ind.rangeConfigId) {
        try {
          var evalResult = FMIController.handle("fmi.evaluateRange", { id: ind.rangeConfigId, value: result }, {});
          level = evalResult.level;
          levelLabel = evalResult.label || level;
        } catch (e) {}
      }

      // Polarity direction for interpretation
      var meta = Number(ind.meta) || 0;
      var polarity = ind.polarityId
        ? (SheetRepository.for("FMI_Polarities").findAll().filter(function (r) { return r.id === ind.polarityId; })[0] || {})
        : {};
      var isPositive = !polarity.codigo || polarity.codigo === "POS";
      var cumple = isPositive ? result >= meta : result <= meta;

      var interpretation = cumple
        ? "El resultado cumple con la meta establecida."
        : "El resultado no alcanza la meta establecida.";

      var unitMeasure = ind.unitMeasureId
        ? (SheetRepository.for("FMI_UnitMeasures").findAll().filter(function (r) { return r.id === ind.unitMeasureId; })[0] || {})
        : {};
      var symbol = unitMeasure.nombre ? " " + unitMeasure.nombre : "";
      var resultFormatted = String(Math.round(result * 100) / 100) + symbol;

      return {
        formulaVisible:  calcResult.formulaVisible || "",
        values:          values,
        result:          result,
        resultFormatted: resultFormatted,
        level:           level,
        levelLabel:      levelLabel,
        interpretation:  interpretation,
        metaCumplida:    cumple,
      };
    },
  };

  // ── VersionManager_ ────────────────────────────────────────

  var VersionManager_ = {
    saveSnapshot: function (indicator, createdBy) {
      var snap = JSON.stringify(indicator);
      verRepo_.r.create({
        id:          IdGen.entityId("IVER"),
        indicatorId: indicator.id,
        version:     indicator.version,
        status:      indicator.status,
        snapshot:    snap,
        publishedAt: indicator.status === "publicado" ? ts_() : "",
        archivedAt:  indicator.status === "archivado" ? ts_() : "",
        createdAt:   ts_(),
        createdBy:   createdBy || "",
      });
    },

    listVersions: function (indicatorId) {
      return verRepo_.r.findAll()
        .filter(function (v) { return v.indicatorId === indicatorId; })
        .sort(function (a, b) { return Number(b.version) - Number(a.version); });
    },

    duplicateVersion: function (versionId, createdBy) {
      var ver = verRepo_.r.findAll().filter(function (v) { return v.id === versionId; })[0];
      if (!ver) throw new Error("Versión no encontrada.");
      var snapshot = JSON.parse(ver.snapshot || "{}");
      snapshot.id = IdGen.entityId("IND");
      snapshot.status = "borrador";
      snapshot.version = 1;
      snapshot.createdAt = ts_();
      snapshot.updatedAt = ts_();
      snapshot.createdBy = createdBy || "";
      snapshot.updatedBy = createdBy || "";
      var created = indRepo_.r.create(snapshot);
      VersionManager_.saveSnapshot(created, createdBy);
      return created;
    },
  };

  // ── DuplicateDetector_ ─────────────────────────────────────

  var DuplicateDetector_ = {
    detect: function (codigo, nombre, excludeId) {
      var all = indRepo_.r.findAll().filter(function (r) { return r.activo !== false && r.id !== (excludeId || ""); });
      var dupes = [];
      all.forEach(function (r) {
        if (r.codigo === codigo)
          dupes.push({ id: r.id, codigo: r.codigo, nombre: r.nombre, status: r.status, reason: "Código duplicado" });
        else if (r.nombre && nombre && r.nombre.toLowerCase() === nombre.toLowerCase())
          dupes.push({ id: r.id, codigo: r.codigo, nombre: r.nombre, status: r.status, reason: "Nombre idéntico" });
      });
      return dupes;
    },
  };

  // ── ImportEngine_ ──────────────────────────────────────────

  var ImportEngine_ = {
    getMappingTemplate: function () {
      return {
        fields: [
          { key: "codigo",        label: "Código",               required: true  },
          { key: "nombre",        label: "Nombre",               required: true  },
          { key: "descripcion",   label: "Descripción",          required: false },
          { key: "meta",          label: "Meta",                 required: false },
          { key: "vigenciaDesde", label: "Vigencia Desde",       required: false },
          { key: "vigenciaHasta", label: "Vigencia Hasta",       required: false },
          { key: "observaciones", label: "Observaciones",        required: false },
        ],
        exampleRow: {
          "Código": "IND-001",
          "Nombre": "Cumplimiento del PEA",
          "Descripción": "Porcentaje de actividades ejecutadas vs programadas",
          "Meta": "90",
          "Vigencia Desde": "2026-01-01",
          "Vigencia Hasta": "2026-12-31",
        },
      };
    },

    prepareImport: function (rows, mapping) {
      var results = rows.map(function (row, idx) {
        var mapped = {};
        mapping.forEach(function (m) {
          if (m.targetField && m.sourceColumn && row[m.sourceColumn] !== undefined) {
            mapped[m.targetField] = row[m.sourceColumn];
          }
        });
        var validation = IndicatorValidator_.validate(mapped, null);
        return {
          rowIndex: idx + 1,
          data:     row,
          mapped:   mapped,
          valid:    validation.valid,
          errors:   validation.errors,
        };
      });

      var valid   = results.filter(function (r) { return r.valid; }).length;
      var invalid = results.filter(function (r) { return !r.valid; }).length;
      return { total: rows.length, valid: valid, invalid: invalid, rows: results };
    },
  };

  // ── IndicatorDefinitionService_ ───────────────────────────

  var Service_ = {
    list: function (params) {
      var all = indRepo_.r.findAll();
      if (params.status)     all = all.filter(function (r) { return r.status === params.status; });
      if (params.objetivoId) all = all.filter(function (r) { return r.objetivoId === params.objetivoId; });
      if (params.dimensionId)all = all.filter(function (r) { return r.dimensionId === params.dimensionId; });
      if (params.activo !== undefined) {
        var active = params.activo !== false && params.activo !== "false";
        all = all.filter(function (r) { return (r.activo !== false) === active; });
      }
      return all;
    },

    get: function (id) {
      var r = indRepo_.r.findAll().filter(function (x) { return x.id === id; })[0];
      if (!r) throw new Error("Indicador " + id + " no encontrado.");
      return r;
    },

    create: function (data, ctx) {
      var user = (ctx && ctx.user && ctx.user.email) || "system";
      var validation = IndicatorValidator_.validate(data, null);
      if (!validation.valid) throw new Error(JSON.stringify(validation.errors));
      var now = ts_();
      var row = {
        id:            IdGen.entityId("IND"),
        codigo:        data.codigo,
        nombre:        data.nombre,
        descripcion:   data.descripcion || "",
        objetivoId:    data.objetivoId || "",
        dimensionId:   data.dimensionId || "",
        unitMeasureId: data.unitMeasureId || "",
        frequencyId:   data.frequencyId || "",
        formulaId:     data.formulaId || "",
        polarityId:    data.polarityId || "",
        rangeConfigId: data.rangeConfigId || "",
        responsibleId: data.responsibleId || "",
        unidadId:      data.unidadId || "",
        meta:          data.meta !== undefined ? Number(data.meta) : 0,
        status:        "borrador",
        version:       1,
        vigenciaDesde: data.vigenciaDesde || "",
        vigenciaHasta: data.vigenciaHasta || "",
        observaciones: data.observaciones || "",
        dependencias:  data.dependencias || "",
        activo:        true,
        createdAt:     now,
        updatedAt:     now,
        createdBy:     user,
        updatedBy:     user,
      };
      var created = indRepo_.r.create(row);
      VersionManager_.saveSnapshot(created, user);
      return created;
    },

    update: function (params, ctx) {
      var user = (ctx && ctx.user && ctx.user.email) || "system";
      var existing = Service_.get(params.id);
      var updated = Object.assign({}, existing, params, {
        updatedAt: ts_(),
        updatedBy: user,
        version:   Number(existing.version) + 1,
      });
      var validation = IndicatorValidator_.validate(updated, params.id);
      if (!validation.valid) throw new Error(JSON.stringify(validation.errors));
      var saved = indRepo_.r.update(params.id, updated);
      VersionManager_.saveSnapshot(saved, user);
      return saved;
    },

    delete: function (id, ctx) {
      var user = (ctx && ctx.user && ctx.user.email) || "system";
      indRepo_.r.update(id, { activo: false, updatedAt: ts_(), updatedBy: user });
      return { deleted: true, id: id };
    },

    changeStatus: function (id, newStatus, ctx) {
      var user = (ctx && ctx.user && ctx.user.email) || "system";
      var existing = Service_.get(id);
      var updated = indRepo_.r.update(id, {
        status:    newStatus,
        version:   Number(existing.version) + 1,
        updatedAt: ts_(),
        updatedBy: user,
      });
      VersionManager_.saveSnapshot(updated, user);
      return updated;
    },
  };

  // ── handle ─────────────────────────────────────────────────

  function handle(action, params, ctx) {
    params = params || {};
    switch (action) {
      // Indicator CRUD
      case "ide.listIndicators":    return Service_.list(params);
      case "ide.getIndicator":      return Service_.get(params.id);
      case "ide.createIndicator":   return Service_.create(params, ctx);
      case "ide.updateIndicator":   return Service_.update(params, ctx);
      case "ide.deleteIndicator":   return Service_.delete(params.id, ctx);

      // Validation
      case "ide.validateIndicator":
        return IndicatorValidator_.validate(params, params.existingId || null);

      // Preview
      case "ide.previewIndicator":
        return PreviewEngine_.preview(params);

      // Simulation
      case "ide.simulateIndicator":
        return SimulationService_.simulate(params.indicatorId, params.values || {});

      // Status transitions
      case "ide.publishIndicator":  return Service_.changeStatus(params.id, "publicado", ctx);
      case "ide.archiveIndicator":  return Service_.changeStatus(params.id, "archivado", ctx);
      case "ide.sendToReview":      return Service_.changeStatus(params.id, "en_revision", ctx);
      case "ide.sendToDraft":       return Service_.changeStatus(params.id, "borrador", ctx);

      // Versions
      case "ide.listVersions":
        return VersionManager_.listVersions(params.indicatorId);
      case "ide.duplicateVersion":
        return VersionManager_.duplicateVersion(params.versionId, (ctx && ctx.user && ctx.user.email));

      // Variable resolution
      case "ide.resolveVariables":
        return VariableResolver_.resolve(params.formulaId);

      // Duplicate detection
      case "ide.detectDuplicates":
        return DuplicateDetector_.detect(params.codigo, params.nombre, params.excludeId);

      // Import engine
      case "ide.prepareImport":
        return ImportEngine_.prepareImport(params.rows || [], params.mapping || []);
      case "ide.getMappingTemplate":
        return ImportEngine_.getMappingTemplate();

      default:
        throw new Error("IDE: acción desconocida — " + action);
    }
  }

  function bootstrap() {}

  return { handle: handle, bootstrap: bootstrap };
})();
