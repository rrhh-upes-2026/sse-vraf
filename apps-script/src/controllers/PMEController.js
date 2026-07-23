/**
 * PME — Process Management Engine Controller.
 *
 * Business logic for institutional processes, procedures, and activities.
 * Persistence delegates to SheetRepository via pmeProcesos / pmeProcedimientos /
 * pmeActividades / pmeCatalogos / pmeHistorial.
 *
 * RULES:
 *  - No physical deletion — only archive (active = false, deletedAt = now)
 *  - All entity codes must be unique within their type across the workspace
 *  - Every state change is recorded in pmeHistorial
 */
var PMEController = (function () {

  var PME_WS_ID = "pme";

  // ── Private helpers ───────────────────────────────────────────────────────────

  function _wsId(params) {
    return params.wsId || PME_WS_ID;
  }

  function _now() {
    return new Date().toISOString();
  }

  function _recordHistorial(entidadTipo, entidadId, accion, usuario, detalle, wsId) {
    try {
      createEntity_("pmeHistorial", {
        id:          IdGen.uuid(),
        wsId:        wsId || PME_WS_ID,
        entidadTipo: entidadTipo,
        entidadId:   entidadId,
        accion:      accion,
        usuario:     usuario || "",
        detalle:     JSON.stringify(detalle || {}),
        createdAt:   _now(),
      });
    } catch (e) {
      AppLogger.warn("PMEController._recordHistorial failed", { error: String(e) });
    }
  }

  function _codeExistsIn(entityName, code, excludeId, wsId) {
    var result = listEntities_(entityName, { wsId: wsId, code: code, _pageSize: 5 });
    var items  = result.items || [];
    for (var i = 0; i < items.length; i++) {
      if (!excludeId || items[i].id !== excludeId) return true;
    }
    return false;
  }

  // ── PROCESOS — List / Get ─────────────────────────────────────────────────────

  function listProcesos(params) {
    var filter = { wsId: _wsId(params) };
    if (params.active !== undefined && params.active !== "") filter.active = params.active;
    if (params.tipoProcesoId) filter.tipoProcesoId = params.tipoProcesoId;
    if (params.periodicidad)  filter.periodicidad  = params.periodicidad;
    if (params.organizationalUnitId) filter.organizationalUnitId = params.organizationalUnitId;
    if (params._page)         filter._page         = params._page;
    if (params._pageSize)     filter._pageSize      = params._pageSize;
    if (params._sortBy)       filter._sortBy        = params._sortBy;
    if (params._sortDir)      filter._sortDir       = params._sortDir;
    return listEntities_("pmeProcesos", filter);
  }

  function getProceso(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("pmeProcesos", params.id);
  }

  // ── PROCESOS — Create ─────────────────────────────────────────────────────────

  function createProceso(params) {
    Validator.requireFields(params, ["code", "name"]);
    var wsId = _wsId(params);

    if (_codeExistsIn("pmeProcesos", params.code, null, wsId)) {
      throw new Error("El código '" + params.code + "' ya está en uso por otro proceso.");
    }

    var now = _now();
    var data = Object.assign({}, params, {
      id:        IdGen.uuid(),
      wsId:      wsId,
      active:    true,
      indicadorIds: params.indicadorIds || "",
      createdBy: params.userId || "",
      createdAt: now,
      updatedBy: params.userId || "",
      updatedAt: now,
      deletedAt: "",
    });
    delete data.userId;

    var entity = createEntity_("pmeProcesos", data);
    _recordHistorial("proceso", entity.id, "creado", data.createdBy, { code: entity.code, name: entity.name }, wsId);
    return entity;
  }

  // ── PROCESOS — Update ─────────────────────────────────────────────────────────

  function updateProceso(params) {
    Validator.requireFields(params, ["id"]);
    var wsId     = _wsId(params);
    var existing = getEntity_("pmeProcesos", params.id);

    if (params.code && params.code !== existing.code) {
      if (_codeExistsIn("pmeProcesos", params.code, params.id, wsId)) {
        throw new Error("El código '" + params.code + "' ya está en uso por otro proceso.");
      }
    }

    var now  = _now();
    var diff = {};

    if (params.name && params.name !== existing.name) {
      diff.nombreCambiado = { desde: existing.name, hacia: params.name };
    }
    if (params.objetivo && params.objetivo !== existing.objetivo) {
      diff.objetivoCambiado = { desde: existing.objetivo, hacia: params.objetivo };
    }
    if ((params.responsibleUser || params.responsiblePosition) &&
        (params.responsibleUser !== existing.responsibleUser || params.responsiblePosition !== existing.responsiblePosition)) {
      diff.responsableCambiado = {
        desde: { position: existing.responsiblePosition, user: existing.responsibleUser },
        hacia: { position: params.responsiblePosition,   user: params.responsibleUser   },
      };
    }

    var patch = Object.assign({}, params, {
      updatedBy: params.userId || "",
      updatedAt: now,
    });
    delete patch.userId;

    var accion = Object.keys(diff).length > 0
      ? (diff.nombreCambiado ? "nombreCambiado" : diff.responsableCambiado ? "responsableCambiado" : "objetivoCambiado")
      : "actualizado";

    var entity = updateEntity_("pmeProcesos", params.id, patch);
    _recordHistorial("proceso", entity.id, accion, patch.updatedBy, diff, wsId);
    return entity;
  }

  // ── PROCESOS — Archive ────────────────────────────────────────────────────────

  function archivarProceso(params) {
    Validator.requireFields(params, ["id"]);
    var wsId = _wsId(params);
    var now  = _now();
    var entity = updateEntity_("pmeProcesos", params.id, {
      active:    false,
      deletedAt: now,
      updatedBy: params.userId || "",
      updatedAt: now,
    });
    _recordHistorial("proceso", entity.id, "archivado", params.userId || "", {}, wsId);
    return entity;
  }

  function activarProceso(params) {
    Validator.requireFields(params, ["id"]);
    var wsId = _wsId(params);
    var now  = _now();
    var entity = updateEntity_("pmeProcesos", params.id, {
      active:    true,
      deletedAt: "",
      updatedBy: params.userId || "",
      updatedAt: now,
    });
    _recordHistorial("proceso", entity.id, "activado", params.userId || "", {}, wsId);
    return entity;
  }

  // ── PROCESOS — Duplicate ──────────────────────────────────────────────────────

  function duplicarProceso(params) {
    Validator.requireFields(params, ["id"]);
    var wsId     = _wsId(params);
    var original = getEntity_("pmeProcesos", params.id);
    var now      = _now();
    var newCode  = original.code + "-COPIA";
    var attempt  = 0;
    while (_codeExistsIn("pmeProcesos", newCode, null, wsId)) {
      attempt++;
      newCode = original.code + "-COPIA" + (attempt > 0 ? attempt : "");
    }
    var copy = Object.assign({}, original, {
      id:        IdGen.uuid(),
      code:      newCode,
      name:      original.name + " (Copia)",
      active:    false,
      createdBy: params.userId || "",
      createdAt: now,
      updatedBy: params.userId || "",
      updatedAt: now,
      deletedAt: "",
    });
    var entity = createEntity_("pmeProcesos", copy);
    _recordHistorial("proceso", entity.id, "duplicado", params.userId || "", { originalId: original.id }, wsId);
    return entity;
  }

  // ── PROCEDIMIENTOS — List / Get ───────────────────────────────────────────────

  function listProcedimientos(params) {
    var filter = { wsId: _wsId(params) };
    if (params.active !== undefined && params.active !== "") filter.active = params.active;
    if (params.procesoId)  filter.procesoId  = params.procesoId;
    if (params.periodicidad) filter.periodicidad = params.periodicidad;
    if (params._page)      filter._page      = params._page;
    if (params._pageSize)  filter._pageSize   = params._pageSize;
    if (params._sortBy)    filter._sortBy     = params._sortBy;
    if (params._sortDir)   filter._sortDir    = params._sortDir;
    return listEntities_("pmeProcedimientos", filter);
  }

  function getProcedimiento(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("pmeProcedimientos", params.id);
  }

  // ── PROCEDIMIENTOS — Create ───────────────────────────────────────────────────

  function createProcedimiento(params) {
    Validator.requireFields(params, ["code", "name", "procesoId"]);
    var wsId = _wsId(params);

    if (_codeExistsIn("pmeProcedimientos", params.code, null, wsId)) {
      throw new Error("El código '" + params.code + "' ya está en uso por otro procedimiento.");
    }

    var now = _now();
    var data = Object.assign({}, params, {
      id:        IdGen.uuid(),
      wsId:      wsId,
      active:    true,
      createdBy: params.userId || "",
      createdAt: now,
      updatedBy: params.userId || "",
      updatedAt: now,
      deletedAt: "",
    });
    delete data.userId;

    var entity = createEntity_("pmeProcedimientos", data);
    _recordHistorial("procedimiento", entity.id, "creado", data.createdBy, { code: entity.code, name: entity.name }, wsId);
    return entity;
  }

  // ── PROCEDIMIENTOS — Update ───────────────────────────────────────────────────

  function updateProcedimiento(params) {
    Validator.requireFields(params, ["id"]);
    var wsId     = _wsId(params);
    var existing = getEntity_("pmeProcedimientos", params.id);

    if (params.code && params.code !== existing.code) {
      if (_codeExistsIn("pmeProcedimientos", params.code, params.id, wsId)) {
        throw new Error("El código '" + params.code + "' ya está en uso por otro procedimiento.");
      }
    }

    var now  = _now();
    var diff = {};
    if (params.name && params.name !== existing.name)
      diff.nombreCambiado = { desde: existing.name, hacia: params.name };
    if (params.objetivo && params.objetivo !== existing.objetivo)
      diff.objetivoCambiado = { desde: existing.objetivo, hacia: params.objetivo };
    if ((params.responsibleUser || params.responsiblePosition) &&
        (params.responsibleUser !== existing.responsibleUser || params.responsiblePosition !== existing.responsiblePosition))
      diff.responsableCambiado = {
        desde: { position: existing.responsiblePosition, user: existing.responsibleUser },
        hacia: { position: params.responsiblePosition,   user: params.responsibleUser   },
      };

    var patch = Object.assign({}, params, {
      updatedBy: params.userId || "",
      updatedAt: now,
    });
    delete patch.userId;

    var accion = Object.keys(diff).length > 0
      ? (diff.nombreCambiado ? "nombreCambiado" : diff.responsableCambiado ? "responsableCambiado" : "objetivoCambiado")
      : "actualizado";

    var entity = updateEntity_("pmeProcedimientos", params.id, patch);
    _recordHistorial("procedimiento", entity.id, accion, patch.updatedBy, diff, wsId);
    return entity;
  }

  // ── PROCEDIMIENTOS — Archive / Activate / Duplicate ──────────────────────────

  function archivarProcedimiento(params) {
    Validator.requireFields(params, ["id"]);
    var wsId = _wsId(params);
    var now  = _now();
    var entity = updateEntity_("pmeProcedimientos", params.id, {
      active:    false,
      deletedAt: now,
      updatedBy: params.userId || "",
      updatedAt: now,
    });
    _recordHistorial("procedimiento", entity.id, "archivado", params.userId || "", {}, wsId);
    return entity;
  }

  function activarProcedimiento(params) {
    Validator.requireFields(params, ["id"]);
    var wsId = _wsId(params);
    var now  = _now();
    var entity = updateEntity_("pmeProcedimientos", params.id, {
      active:    true,
      deletedAt: "",
      updatedBy: params.userId || "",
      updatedAt: now,
    });
    _recordHistorial("procedimiento", entity.id, "activado", params.userId || "", {}, wsId);
    return entity;
  }

  function duplicarProcedimiento(params) {
    Validator.requireFields(params, ["id"]);
    var wsId     = _wsId(params);
    var original = getEntity_("pmeProcedimientos", params.id);
    var now      = _now();
    var newCode  = original.code + "-COPIA";
    var attempt  = 0;
    while (_codeExistsIn("pmeProcedimientos", newCode, null, wsId)) {
      attempt++;
      newCode = original.code + "-COPIA" + (attempt > 0 ? attempt : "");
    }
    var copy = Object.assign({}, original, {
      id:        IdGen.uuid(),
      code:      newCode,
      name:      original.name + " (Copia)",
      active:    false,
      createdBy: params.userId || "",
      createdAt: now,
      updatedBy: params.userId || "",
      updatedAt: now,
      deletedAt: "",
    });
    var entity = createEntity_("pmeProcedimientos", copy);
    _recordHistorial("procedimiento", entity.id, "duplicado", params.userId || "", { originalId: original.id }, wsId);
    return entity;
  }

  // ── ACTIVIDADES — List / Get ──────────────────────────────────────────────────

  function listActividades(params) {
    var filter = { wsId: _wsId(params) };
    if (params.active !== undefined && params.active !== "") filter.active = params.active;
    if (params.procesoId)         filter.procesoId         = params.procesoId;
    if (params.procedimientoId)   filter.procedimientoId   = params.procedimientoId;
    if (params.tipoActividadId)   filter.tipoActividadId   = params.tipoActividadId;
    if (params.estadoOperativoId) filter.estadoOperativoId = params.estadoOperativoId;
    if (params.periodicidad)      filter.periodicidad      = params.periodicidad;
    if (params._page)             filter._page             = params._page;
    if (params._pageSize)         filter._pageSize          = params._pageSize;
    if (params._sortBy)           filter._sortBy            = params._sortBy;
    if (params._sortDir)          filter._sortDir           = params._sortDir;
    return listEntities_("pmeActividades", filter);
  }

  function getActividad(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("pmeActividades", params.id);
  }

  // ── ACTIVIDADES — Create ──────────────────────────────────────────────────────

  function createActividad(params) {
    Validator.requireFields(params, ["code", "name", "procesoId", "procedimientoId"]);
    var wsId = _wsId(params);

    if (_codeExistsIn("pmeActividades", params.code, null, wsId)) {
      throw new Error("El código '" + params.code + "' ya está en uso por otra actividad.");
    }

    var now = _now();
    var data = Object.assign({}, params, {
      id:        IdGen.uuid(),
      wsId:      wsId,
      active:    true,
      indicadorId: params.indicadorId || "",
      createdBy: params.userId || "",
      createdAt: now,
      updatedBy: params.userId || "",
      updatedAt: now,
      deletedAt: "",
    });
    delete data.userId;

    var entity = createEntity_("pmeActividades", data);
    _recordHistorial("actividad", entity.id, "creado", data.createdBy, { code: entity.code, name: entity.name }, wsId);
    return entity;
  }

  // ── ACTIVIDADES — Update ──────────────────────────────────────────────────────

  function updateActividad(params) {
    Validator.requireFields(params, ["id"]);
    var wsId     = _wsId(params);
    var existing = getEntity_("pmeActividades", params.id);

    if (params.code && params.code !== existing.code) {
      if (_codeExistsIn("pmeActividades", params.code, params.id, wsId)) {
        throw new Error("El código '" + params.code + "' ya está en uso por otra actividad.");
      }
    }

    var now  = _now();
    var diff = {};
    if (params.name && params.name !== existing.name)
      diff.nombreCambiado = { desde: existing.name, hacia: params.name };
    if (params.objetivo && params.objetivo !== existing.objetivo)
      diff.objetivoCambiado = { desde: existing.objetivo, hacia: params.objetivo };
    if ((params.responsibleUser || params.responsiblePosition) &&
        (params.responsibleUser !== existing.responsibleUser || params.responsiblePosition !== existing.responsiblePosition))
      diff.responsableCambiado = {
        desde: { position: existing.responsiblePosition, user: existing.responsibleUser },
        hacia: { position: params.responsiblePosition,   user: params.responsibleUser   },
      };

    var patch = Object.assign({}, params, {
      updatedBy: params.userId || "",
      updatedAt: now,
    });
    delete patch.userId;

    var accion = Object.keys(diff).length > 0
      ? (diff.nombreCambiado ? "nombreCambiado" : diff.responsableCambiado ? "responsableCambiado" : "objetivoCambiado")
      : "actualizado";

    var entity = updateEntity_("pmeActividades", params.id, patch);
    _recordHistorial("actividad", entity.id, accion, patch.updatedBy, diff, wsId);
    return entity;
  }

  // ── ACTIVIDADES — Archive / Activate / Duplicate ──────────────────────────────

  function archivarActividad(params) {
    Validator.requireFields(params, ["id"]);
    var wsId = _wsId(params);
    var now  = _now();
    var entity = updateEntity_("pmeActividades", params.id, {
      active:    false,
      deletedAt: now,
      updatedBy: params.userId || "",
      updatedAt: now,
    });
    _recordHistorial("actividad", entity.id, "archivado", params.userId || "", {}, wsId);
    return entity;
  }

  function activarActividad(params) {
    Validator.requireFields(params, ["id"]);
    var wsId = _wsId(params);
    var now  = _now();
    var entity = updateEntity_("pmeActividades", params.id, {
      active:    true,
      deletedAt: "",
      updatedBy: params.userId || "",
      updatedAt: now,
    });
    _recordHistorial("actividad", entity.id, "activado", params.userId || "", {}, wsId);
    return entity;
  }

  function duplicarActividad(params) {
    Validator.requireFields(params, ["id"]);
    var wsId     = _wsId(params);
    var original = getEntity_("pmeActividades", params.id);
    var now      = _now();
    var newCode  = original.code + "-COPIA";
    var attempt  = 0;
    while (_codeExistsIn("pmeActividades", newCode, null, wsId)) {
      attempt++;
      newCode = original.code + "-COPIA" + (attempt > 0 ? attempt : "");
    }
    var copy = Object.assign({}, original, {
      id:        IdGen.uuid(),
      code:      newCode,
      name:      original.name + " (Copia)",
      active:    false,
      createdBy: params.userId || "",
      createdAt: now,
      updatedBy: params.userId || "",
      updatedAt: now,
      deletedAt: "",
    });
    var entity = createEntity_("pmeActividades", copy);
    _recordHistorial("actividad", entity.id, "duplicado", params.userId || "", { originalId: original.id }, wsId);
    return entity;
  }

  // ── CATALOGOS ─────────────────────────────────────────────────────────────────

  function listCatalogos(params) {
    var filter = { wsId: _wsId(params) };
    if (params.tipo)   filter.tipo   = params.tipo;
    if (params.activo !== undefined && params.activo !== "") filter.activo = params.activo;
    if (params._sortBy)  filter._sortBy  = params._sortBy  || "orden";
    if (params._sortDir) filter._sortDir = params._sortDir || "asc";
    return listEntities_("pmeCatalogos", filter);
  }

  function getCatalogo(params) {
    Validator.requireFields(params, ["id"]);
    return getEntity_("pmeCatalogos", params.id);
  }

  function createCatalogo(params) {
    Validator.requireFields(params, ["tipo", "codigo", "nombre"]);
    var wsId = _wsId(params);
    var now  = _now();
    var data = Object.assign({}, params, {
      id:        IdGen.uuid(),
      wsId:      wsId,
      activo:    true,
      orden:     params.orden || 0,
      createdBy: params.userId || "",
      createdAt: now,
      updatedAt: now,
      deletedAt: "",
    });
    delete data.userId;
    return createEntity_("pmeCatalogos", data);
  }

  function updateCatalogo(params) {
    Validator.requireFields(params, ["id"]);
    var now   = _now();
    var patch = Object.assign({}, params, { updatedAt: now });
    delete patch.userId;
    return updateEntity_("pmeCatalogos", params.id, patch);
  }

  function archivarCatalogo(params) {
    Validator.requireFields(params, ["id"]);
    return updateEntity_("pmeCatalogos", params.id, {
      activo:    false,
      deletedAt: _now(),
      updatedAt: _now(),
    });
  }

  // ── HISTORIAL ─────────────────────────────────────────────────────────────────

  function getHistorial(params) {
    var filter = { wsId: _wsId(params) };
    if (params.entidadId)   filter.entidadId   = params.entidadId;
    if (params.entidadTipo) filter.entidadTipo = params.entidadTipo;
    filter._sortBy  = "createdAt";
    filter._sortDir = "desc";
    return listEntities_("pmeHistorial", filter);
  }

  // ── DASHBOARD ─────────────────────────────────────────────────────────────────

  function getDashboard(params) {
    var wsId   = _wsId(params);
    var rPro   = listEntities_("pmeProcesos",       { wsId: wsId, _pageSize: 9999 });
    var rProc  = listEntities_("pmeProcedimientos", { wsId: wsId, _pageSize: 9999 });
    var rAct   = listEntities_("pmeActividades",    { wsId: wsId, _pageSize: 9999 });

    var procesos       = rPro.items  || [];
    var procedimientos = rProc.items || [];
    var actividades    = rAct.items  || [];

    return {
      procesos: {
        total:    procesos.length,
        activos:  procesos.filter(function (p) { return p.active === true || p.active === "true"; }).length,
        archivados: procesos.filter(function (p) { return p.active === false || p.active === "false"; }).length,
      },
      procedimientos: {
        total:    procedimientos.length,
        activos:  procedimientos.filter(function (p) { return p.active === true || p.active === "true"; }).length,
        archivados: procedimientos.filter(function (p) { return p.active === false || p.active === "false"; }).length,
      },
      actividades: {
        total:    actividades.length,
        activos:  actividades.filter(function (a) { return a.active === true || a.active === "true"; }).length,
        archivados: actividades.filter(function (a) { return a.active === false || a.active === "false"; }).length,
      },
    };
  }

  // ── Public API ────────────────────────────────────────────────────────────────

  return {
    listProcesos:            listProcesos,
    getProceso:              getProceso,
    createProceso:           createProceso,
    updateProceso:           updateProceso,
    archivarProceso:         archivarProceso,
    activarProceso:          activarProceso,
    duplicarProceso:         duplicarProceso,
    listProcedimientos:      listProcedimientos,
    getProcedimiento:        getProcedimiento,
    createProcedimiento:     createProcedimiento,
    updateProcedimiento:     updateProcedimiento,
    archivarProcedimiento:   archivarProcedimiento,
    activarProcedimiento:    activarProcedimiento,
    duplicarProcedimiento:   duplicarProcedimiento,
    listActividades:         listActividades,
    getActividad:            getActividad,
    createActividad:         createActividad,
    updateActividad:         updateActividad,
    archivarActividad:       archivarActividad,
    activarActividad:        activarActividad,
    duplicarActividad:       duplicarActividad,
    listCatalogos:           listCatalogos,
    getCatalogo:             getCatalogo,
    createCatalogo:          createCatalogo,
    updateCatalogo:          updateCatalogo,
    archivarCatalogo:        archivarCatalogo,
    getHistorial:            getHistorial,
    getDashboard:            getDashboard,
  };
})();
