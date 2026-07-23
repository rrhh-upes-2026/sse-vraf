/**
 * IME — Indicator Management Engine Controller.
 *
 * Business logic for institutional indicator definitions and their catalogs.
 * Persistence delegates to SheetRepository via imeIndicadores / imeCatalogos / imeHistorial.
 */
var IMEController = (function () {

  var IME_WS_ID = "ime";

  // ── Private helpers ───────────────────────────────────────────────────────────

  function _wsId(params) {
    return params.wsId || IME_WS_ID;
  }

  function _now() {
    return new Date().toISOString();
  }

  function _recordHistorial(indicadorId, accion, usuario, detalle, wsId) {
    try {
      createEntity_("imeHistorial", {
        id:          IdGen.uuid(),
        wsId:        wsId || IME_WS_ID,
        indicadorId: indicadorId,
        accion:      accion,
        usuario:     usuario || "",
        detalle:     JSON.stringify(detalle || {}),
        createdAt:   _now(),
      });
    } catch (e) {
      AppLogger.warn("IMEController._recordHistorial failed", { error: String(e) });
    }
  }

  function _codeExists(code, excludeId, wsId) {
    var result = listEntities_("imeIndicadores", { wsId: wsId, code: code, _pageSize: 5 });
    var items  = result.items || [];
    for (var i = 0; i < items.length; i++) {
      if (!excludeId || items[i].id !== excludeId) return true;
    }
    return false;
  }

  // ── Indicadores — List / Get ──────────────────────────────────────────────────

  function listIndicadores(params) {
    var filter = { wsId: _wsId(params) };
    if (params.active !== undefined && params.active !== "")
      filter.active = params.active;
    if (params.indicatorType) filter.indicatorType = params.indicatorType;
    if (params.frequency)     filter.frequency     = params.frequency;
    if (params.processId)     filter.processId     = params.processId;
    if (params.organizationalUnitId) filter.organizationalUnitId = params.organizationalUnitId;
    if (params.year)          filter.year          = params.year;
    if (params._page)         filter._page         = params._page;
    if (params._pageSize)     filter._pageSize      = params._pageSize;
    if (params._sortBy)       filter._sortBy        = params._sortBy;
    if (params._sortDir)      filter._sortDir       = params._sortDir;
    return listEntities_("imeIndicadores", filter);
  }

  function getIndicador(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("imeIndicadores", params.id);
  }

  // ── Indicadores — Create ──────────────────────────────────────────────────────

  function createIndicador(params) {
    Validator.requireFields(params, ["code", "name", "measurementUnit", "frequency", "processId", "targetValue"]);
    var wsId = _wsId(params);

    if (_codeExists(params.code, null, wsId)) {
      throw new Error("El código '" + params.code + "' ya está en uso por otro indicador.");
    }

    var now = _now();
    var data = Object.assign({
      description:          "",
      active:               "true",
      organizationalUnitId: "",
      procedureId:          "",
      strategicPillar:      "",
      strategicObjective:   "",
      indicatorType:        "",
      calculationType:      "promedio",
      polarity:             "positiva",
      warningThreshold:     0,
      criticalThreshold:    0,
      responsiblePosition:  "",
      responsibleUser:      "",
      displayOrder:         0,
      year:                 new Date().getFullYear(),
      version:              "1.0",
      observations:         "",
      updatedBy:            "",
      deletedAt:            "",
    }, params, {
      id:        IdGen.uuid(),
      wsId:      wsId,
      createdAt: now,
      updatedAt: now,
    });

    createEntity_("imeIndicadores", data);
    _recordHistorial(data.id, "creado", data.createdBy, { code: data.code, name: data.name }, wsId);
    return data;
  }

  // ── Indicadores — Update ──────────────────────────────────────────────────────

  function updateIndicador(params) {
    Validator.requireFields(params, ["id"]);
    var existing = getEntity_("imeIndicadores", params.id);
    if (!existing) throw new Error("Indicador no encontrado: " + params.id);

    if (params.code && params.code !== existing.code) {
      if (_codeExists(params.code, params.id, existing.wsId)) {
        throw new Error("El código '" + params.code + "' ya está en uso por otro indicador.");
      }
    }

    var patch = Object.assign({}, params, {
      updatedAt: _now(),
      updatedBy: params.updatedBy || "",
    });
    delete patch.id;
    delete patch.wsId;
    delete patch.createdAt;
    delete patch.createdBy;

    var result = updateEntity_("imeIndicadores", params.id, patch);
    _recordHistorial(params.id, "actualizado", params.updatedBy, { fields: Object.keys(patch) }, existing.wsId);
    return result;
  }

  // ── Indicadores — Activate / Deactivate ──────────────────────────────────────

  function activarIndicador(params) {
    Validator.requireFields(params, ["id"]);
    var result = updateEntity_("imeIndicadores", params.id, {
      active:    "true",
      updatedAt: _now(),
      updatedBy: params.userId || "",
    });
    _recordHistorial(params.id, "activado", params.userId, {}, IME_WS_ID);
    return result;
  }

  function desactivarIndicador(params) {
    Validator.requireFields(params, ["id"]);
    var result = updateEntity_("imeIndicadores", params.id, {
      active:    "false",
      updatedAt: _now(),
      updatedBy: params.userId || "",
    });
    _recordHistorial(params.id, "desactivado", params.userId, {}, IME_WS_ID);
    return result;
  }

  // ── Indicadores — Duplicate ───────────────────────────────────────────────────

  function duplicarIndicador(params) {
    Validator.requireFields(params, ["id"]);
    var source = getEntity_("imeIndicadores", params.id);
    if (!source) throw new Error("Indicador no encontrado: " + params.id);

    var newCode  = source.code + "-COPIA";
    var wsId     = source.wsId || IME_WS_ID;
    var counter  = 1;
    while (_codeExists(newCode, null, wsId)) {
      newCode = source.code + "-COPIA-" + (++counter);
    }

    var now  = _now();
    var copy = Object.assign({}, source, {
      id:        IdGen.uuid(),
      code:      newCode,
      name:      source.name + " (Copia)",
      active:    "false",
      version:   "1.0",
      createdBy: params.userId || "",
      createdAt: now,
      updatedAt: now,
      updatedBy: "",
      deletedAt: "",
    });

    createEntity_("imeIndicadores", copy);
    _recordHistorial(copy.id, "duplicado", params.userId, { sourceId: source.id, sourceCode: source.code }, wsId);
    return copy;
  }

  // ── Historial ─────────────────────────────────────────────────────────────────

  function getHistorial(params) {
    Validator.requireFields(params, ["indicadorId"]);
    var filter = {
      wsId:        _wsId(params),
      indicadorId: params.indicadorId,
      _sortBy:     "createdAt",
      _sortDir:    "desc",
      _pageSize:   50,
    };
    var result = listEntities_("imeHistorial", filter);
    return result.items || [];
  }

  // ── Catálogos — List / Get ────────────────────────────────────────────────────

  function listCatalogos(params) {
    var filter = { wsId: _wsId(params) };
    if (params.tipo)   filter.tipo   = params.tipo;
    if (params.activo !== undefined && params.activo !== "") filter.activo = params.activo;
    filter._sortBy  = "orden";
    filter._sortDir = "asc";
    filter._pageSize = 500;
    var result = listEntities_("imeCatalogos", filter);
    return result.items || [];
  }

  function getCatalogo(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("imeCatalogos", params.id);
  }

  function createCatalogo(params) {
    Validator.requireFields(params, ["tipo", "nombre"]);
    var now = _now();
    var data = Object.assign({
      wsId:        _wsId(params),
      codigo:      "",
      descripcion: "",
      activo:      "true",
      orden:       0,
      createdBy:   "",
      deletedAt:   "",
    }, params, {
      id:        IdGen.uuid(),
      createdAt: now,
      updatedAt: now,
    });
    createEntity_("imeCatalogos", data);
    return data;
  }

  function updateCatalogo(params) {
    Validator.requireFields(params, ["id"]);
    var patch = Object.assign({}, params, { updatedAt: _now() });
    delete patch.id;
    return updateEntity_("imeCatalogos", params.id, patch);
  }

  function archivarCatalogo(params) {
    Validator.requireFields(params, ["id"]);
    return updateEntity_("imeCatalogos", params.id, {
      activo:    "false",
      updatedAt: _now(),
    });
  }

  // ── Dashboard summary ─────────────────────────────────────────────────────────

  function getDashboard(params) {
    var wsId    = _wsId(params);
    var all     = listEntities_("imeIndicadores", { wsId: wsId, _pageSize: 1000 });
    var items   = all.items || [];
    var total   = items.length;
    var activos = 0, inactivos = 0;
    for (var i = 0; i < items.length; i++) {
      if (items[i].active === "true" || items[i].active === true) {
        activos++;
      } else {
        inactivos++;
      }
    }
    return { total: total, activos: activos, inactivos: inactivos };
  }

  // ── Public API ────────────────────────────────────────────────────────────────

  return {
    listIndicadores:   listIndicadores,
    getIndicador:      getIndicador,
    createIndicador:   createIndicador,
    updateIndicador:   updateIndicador,
    activarIndicador:  activarIndicador,
    desactivarIndicador: desactivarIndicador,
    duplicarIndicador: duplicarIndicador,
    getHistorial:      getHistorial,
    listCatalogos:     listCatalogos,
    getCatalogo:       getCatalogo,
    createCatalogo:    createCatalogo,
    updateCatalogo:    updateCatalogo,
    archivarCatalogo:  archivarCatalogo,
    getDashboard:      getDashboard,
  };
})();
