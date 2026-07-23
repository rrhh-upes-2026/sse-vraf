/**
 * EME — Evidence Management Engine Controller.
 *
 * Manages institutional evidence associated with AEE executions.
 * Scope: evidence repository ONLY.
 * No file upload connectors, no compliance calculation, no indicator modification.
 *
 * STATE MACHINE:
 *   Pendiente      → Cargada | Archivada
 *   Cargada        → En validación | Archivada
 *   En validación  → Validada | Rechazada
 *   Validada       → Archivada
 *   Rechazada      → Cargada | Archivada
 *   Archivada      → (terminal)
 *
 * VERSIONING:
 *   Initial version: "1.0"
 *   nuevaVersion() increments the minor part; major bumps reserved for significant replacements.
 *   Original evidence rows are never deleted — each version creates a new row.
 *
 * CATALOG TYPES:
 *   tipoEvidencia             — Documento PDF | Documento Word | Excel | Imagen | …
 *   estadoEvidencia           — Pendiente | Cargada | En validación | Validada | Rechazada | Archivada
 *   proveedorAlmacenamiento   — Google Drive | OneDrive | SharePoint | Local | AWS S3 | Azure Blob
 *   nivelConfidencialidad     — Pública | Interna | Confidencial | Restringida
 */
var EMEController = (function () {

  var EME_WS_ID = "eme";

  // ── Private helpers ──────────────────────────────────────────────────────────

  function _wsId(params) {
    return params.wsId || EME_WS_ID;
  }

  function _now() {
    return new Date().toISOString();
  }

  var ALLOWED_STATES = [
    "Pendiente",
    "Cargada",
    "En validación",
    "Validada",
    "Rechazada",
    "Archivada",
  ];

  var VALID_TRANSITIONS = {
    "Pendiente":     ["Cargada", "Archivada"],
    "Cargada":       ["En validación", "Archivada"],
    "En validación": ["Validada", "Rechazada"],
    "Validada":      ["Archivada"],
    "Rechazada":     ["Cargada", "Archivada"],
    "Archivada":     [],
  };

  // Default catalog values — returned when the sheet is empty (isDefault: true)
  var DEFAULT_CATALOGOS = {
    tipoEvidencia: [
      { valor: "documento-pdf",    etiqueta: "Documento PDF",    orden: 1 },
      { valor: "documento-word",   etiqueta: "Documento Word",   orden: 2 },
      { valor: "excel",            etiqueta: "Excel",            orden: 3 },
      { valor: "imagen",           etiqueta: "Imagen",           orden: 4 },
      { valor: "fotografia",       etiqueta: "Fotografía",       orden: 5 },
      { valor: "video",            etiqueta: "Video",            orden: 6 },
      { valor: "audio",            etiqueta: "Audio",            orden: 7 },
      { valor: "presentacion",     etiqueta: "Presentación",     orden: 8 },
      { valor: "formulario",       etiqueta: "Formulario",       orden: 9 },
      { valor: "acta",             etiqueta: "Acta",             orden: 10 },
      { valor: "constancia",       etiqueta: "Constancia",       orden: 11 },
      { valor: "contrato",         etiqueta: "Contrato",         orden: 12 },
      { valor: "factura",          etiqueta: "Factura",          orden: 13 },
      { valor: "enlace",           etiqueta: "Enlace",           orden: 14 },
      { valor: "google-drive",     etiqueta: "Google Drive",     orden: 15 },
      { valor: "otro",             etiqueta: "Otro",             orden: 16 },
    ],
    estadoEvidencia: [
      { valor: "Pendiente",     etiqueta: "Pendiente",     orden: 1 },
      { valor: "Cargada",       etiqueta: "Cargada",       orden: 2 },
      { valor: "En validación", etiqueta: "En validación", orden: 3 },
      { valor: "Validada",      etiqueta: "Validada",      orden: 4 },
      { valor: "Rechazada",     etiqueta: "Rechazada",     orden: 5 },
      { valor: "Archivada",     etiqueta: "Archivada",     orden: 6 },
    ],
    proveedorAlmacenamiento: [
      { valor: "google-drive", etiqueta: "Google Drive",  orden: 1 },
      { valor: "onedrive",     etiqueta: "OneDrive",      orden: 2 },
      { valor: "sharepoint",   etiqueta: "SharePoint",    orden: 3 },
      { valor: "local",        etiqueta: "Local",         orden: 4 },
      { valor: "aws-s3",       etiqueta: "AWS S3",        orden: 5 },
      { valor: "azure-blob",   etiqueta: "Azure Blob",    orden: 6 },
    ],
    nivelConfidencialidad: [
      { valor: "publica",       etiqueta: "Pública",       orden: 1 },
      { valor: "interna",       etiqueta: "Interna",       orden: 2 },
      { valor: "confidencial",  etiqueta: "Confidencial",  orden: 3 },
      { valor: "restringida",   etiqueta: "Restringida",   orden: 4 },
    ],
  };

  function _record(evidenciaId, accion, fields, usuario, wsId) {
    try {
      createEntity_("emeHistorial", {
        id:              IdGen.uuid(),
        wsId:            wsId || EME_WS_ID,
        evidenciaId:     evidenciaId,
        accion:          accion,
        estadoAnterior:  fields.estadoAnterior  || "",
        estadoNuevo:     fields.estadoNuevo     || "",
        versionAnterior: fields.versionAnterior || "",
        versionNueva:    fields.versionNueva    || "",
        usuario:         usuario                || "",
        detalle:         JSON.stringify(fields.detalle || {}),
        createdAt:       _now(),
      });
    } catch (e) {
      AppLogger.warn("EMEController._record: failed to write historial", { error: e.message });
    }
  }

  function _assertExecution(executionId) {
    if (!executionId) throw new Error("executionId es requerido.");
    var rows = listEntities_("aeeEjecuciones", { id: executionId });
    if (!rows || rows.length === 0) {
      throw new Error("La ejecución indicada no existe: " + executionId);
    }
    var execution = rows[0];
    if (execution.deletedAt) {
      throw new Error("La ejecución está archivada y no puede recibir nuevas evidencias.");
    }
    return execution;
  }

  function _incrementVersion(currentVersion) {
    if (!currentVersion) return "1.0";
    var parts = String(currentVersion).split(".");
    var major = parseInt(parts[0], 10) || 1;
    var minor = parseInt(parts[1], 10) || 0;
    return major + "." + (minor + 1);
  }

  function _simulateStorageReference(fileName, provider) {
    var ts = new Date().getTime();
    switch (provider) {
      case "google-drive":  return "https://drive.google.com/file/d/simulated-" + ts;
      case "onedrive":      return "https://1drv.ms/simulated-" + ts;
      case "sharepoint":    return "https://sharepoint.com/sites/sse/simulated-" + ts;
      case "aws-s3":        return "s3://sse-bucket/evidencias/" + ts + "-" + (fileName || "file");
      case "azure-blob":    return "https://ssestorage.blob.core.windows.net/evidencias/" + ts;
      default:              return "/evidencias/local/" + ts + "-" + (fileName || "file");
    }
  }

  // ── Handlers ──────────────────────────────────────────────────────────────────

  function listEvidencias(params) {
    var query = {};
    if (params.executionId) query.executionId    = params.executionId;
    if (params.status)      query.status         = params.status;
    if (params.evidenceType)query.evidenceType   = params.evidenceType;
    if (params.uploadedBy)  query.uploadedBy     = params.uploadedBy;
    if (params.processId)   query.processId      = params.processId;
    if (params.organizationalUnitId) query.organizationalUnitId = params.organizationalUnitId;

    var pageSize = parseInt(params._pageSize, 10) || 200;
    var rows = listEntities_("emeEvidencias", query, pageSize);

    // Text search (title, description, tags)
    if (params.q) {
      var q = String(params.q).toLowerCase();
      rows = rows.filter(function (r) {
        return (r.title       || "").toLowerCase().indexOf(q) !== -1 ||
               (r.description || "").toLowerCase().indexOf(q) !== -1 ||
               (r.tags        || "").toLowerCase().indexOf(q) !== -1 ||
               (r.originalFileName || "").toLowerCase().indexOf(q) !== -1;
      });
    }

    // Date range
    if (params.dateFrom) {
      rows = rows.filter(function (r) { return (r.uploadedAt || "") >= params.dateFrom; });
    }
    if (params.dateTo) {
      rows = rows.filter(function (r) { return (r.uploadedAt || "") <= params.dateTo + "T23:59:59"; });
    }

    return { total: rows.length, items: rows };
  }

  function getEvidencia(params) {
    if (!params.id) throw new Error("id es requerido.");
    var rows = listEntities_("emeEvidencias", { id: params.id });
    if (!rows || rows.length === 0) throw new Error("Evidencia no encontrada: " + params.id);
    return rows[0];
  }

  function createEvidencia(params) {
    var wsId = _wsId(params);

    // Require valid execution
    _assertExecution(params.executionId);

    // Validate required fields
    if (!params.title)         throw new Error("title es requerido.");
    if (!params.evidenceType)  throw new Error("evidenceType es requerido.");
    if (!params.uploadedBy)    throw new Error("uploadedBy es requerido.");

    var now = _now();
    var id  = IdGen.uuid();

    // Simulate storage reference if not provided
    var storageRef = params.storageReference ||
      _simulateStorageReference(params.originalFileName, params.storageProvider || "local");

    var entity = {
      id:                   id,
      wsId:                 wsId,
      executionId:          params.executionId,
      planId:               params.planId               || "",
      activityId:           params.activityId           || "",
      procedureId:          params.procedureId          || "",
      processId:            params.processId            || "",
      organizationalUnitId: params.organizationalUnitId || "",
      title:                params.title,
      description:          params.description          || "",
      evidenceType:         params.evidenceType,
      storageProvider:      params.storageProvider      || "local",
      storageReference:     storageRef,
      fileName:             params.fileName             || params.originalFileName || "",
      originalFileName:     params.originalFileName      || "",
      extension:            params.extension            || "",
      mimeType:             params.mimeType             || "",
      fileSize:             params.fileSize             || 0,
      checksum:             params.checksum             || "",
      version:              "1.0",
      status:               "Cargada",
      uploadedBy:           params.uploadedBy,
      uploadedAt:           now,
      validatedBy:          "",
      validatedAt:          "",
      validationStatus:     "pendiente",
      validationComments:   "",
      isRequired:           params.isRequired           === true || params.isRequired === "true",
      isConfidential:       params.isConfidential       === true || params.isConfidential === "true",
      confidentialityLevel: params.confidentialityLevel || "interna",
      expirationDate:       params.expirationDate       || "",
      tags:                 Array.isArray(params.tags) ? JSON.stringify(params.tags) : (params.tags || "[]"),
      notes:                params.notes                || "",
      createdBy:            params.uploadedBy,
      createdAt:            now,
      updatedBy:            params.uploadedBy,
      updatedAt:            now,
      deletedAt:            "",
    };

    createEntity_("emeEvidencias", entity);

    _record(id, "creado", {
      estadoNuevo:  "Cargada",
      versionNueva: "1.0",
      detalle:      { title: entity.title, evidenceType: entity.evidenceType },
    }, params.uploadedBy, wsId);

    return entity;
  }

  function updateEvidencia(params) {
    if (!params.id) throw new Error("id es requerido.");

    var rows = listEntities_("emeEvidencias", { id: params.id });
    if (!rows || rows.length === 0) throw new Error("Evidencia no encontrada: " + params.id);
    var current = rows[0];

    if (current.deletedAt) throw new Error("No se puede editar una evidencia archivada.");

    var now   = _now();
    var patch = {
      title:               params.title               !== undefined ? params.title               : current.title,
      description:         params.description         !== undefined ? params.description         : current.description,
      evidenceType:        params.evidenceType        !== undefined ? params.evidenceType        : current.evidenceType,
      storageProvider:     params.storageProvider     !== undefined ? params.storageProvider     : current.storageProvider,
      storageReference:    params.storageReference    !== undefined ? params.storageReference    : current.storageReference,
      fileName:            params.fileName            !== undefined ? params.fileName            : current.fileName,
      originalFileName:    params.originalFileName    !== undefined ? params.originalFileName    : current.originalFileName,
      extension:           params.extension           !== undefined ? params.extension           : current.extension,
      mimeType:            params.mimeType            !== undefined ? params.mimeType            : current.mimeType,
      fileSize:            params.fileSize            !== undefined ? params.fileSize            : current.fileSize,
      confidentialityLevel:params.confidentialityLevel !== undefined ? params.confidentialityLevel : current.confidentialityLevel,
      isConfidential:      params.isConfidential      !== undefined ? params.isConfidential      : current.isConfidential,
      expirationDate:      params.expirationDate      !== undefined ? params.expirationDate      : current.expirationDate,
      tags:                params.tags               !== undefined
        ? (Array.isArray(params.tags) ? JSON.stringify(params.tags) : params.tags)
        : current.tags,
      notes:               params.notes              !== undefined ? params.notes                : current.notes,
      updatedBy:           params.updatedBy           || params.userId || "",
      updatedAt:           now,
    };

    updateEntity_("emeEvidencias", params.id, patch);

    _record(params.id, "actualizado", {
      estadoAnterior: current.status,
      estadoNuevo:    current.status,
      detalle:        { campos: Object.keys(patch) },
    }, patch.updatedBy, current.wsId);

    return Object.assign({}, current, patch);
  }

  function cambiarEstado(params) {
    if (!params.id)     throw new Error("id es requerido.");
    if (!params.status) throw new Error("status es requerido.");

    if (ALLOWED_STATES.indexOf(params.status) === -1) {
      throw new Error("Estado inválido: " + params.status);
    }

    var rows = listEntities_("emeEvidencias", { id: params.id });
    if (!rows || rows.length === 0) throw new Error("Evidencia no encontrada: " + params.id);
    var current = rows[0];

    if (current.deletedAt) throw new Error("La evidencia está archivada.");

    var allowed = VALID_TRANSITIONS[current.status] || [];
    if (allowed.indexOf(params.status) === -1) {
      throw new Error(
        "Transición inválida: " + current.status + " → " + params.status +
        ". Permitidas: " + (allowed.join(", ") || "ninguna")
      );
    }

    var now   = _now();
    var patch = { status: params.status, updatedBy: params.userId || "", updatedAt: now };
    updateEntity_("emeEvidencias", params.id, patch);

    _record(params.id, "estado_cambiado", {
      estadoAnterior: current.status,
      estadoNuevo:    params.status,
    }, params.userId || "", current.wsId);

    return Object.assign({}, current, patch);
  }

  function validarEvidencia(params) {
    if (!params.id)               throw new Error("id es requerido.");
    if (!params.validationStatus) throw new Error("validationStatus es requerido.");

    var validStatuses = ["aprobada", "rechazada", "pendiente"];
    if (validStatuses.indexOf(params.validationStatus) === -1) {
      throw new Error("validationStatus inválido: " + params.validationStatus);
    }

    var rows = listEntities_("emeEvidencias", { id: params.id });
    if (!rows || rows.length === 0) throw new Error("Evidencia no encontrada: " + params.id);
    var current = rows[0];

    if (current.status !== "En validación") {
      throw new Error("Solo evidencias en estado 'En validación' pueden ser validadas.");
    }

    var now        = _now();
    var newStatus  = params.validationStatus === "aprobada" ? "Validada" : "Rechazada";

    var patch = {
      validatedBy:        params.userId || "",
      validatedAt:        now,
      validationStatus:   params.validationStatus,
      validationComments: params.validationComments || "",
      status:             newStatus,
      updatedBy:          params.userId || "",
      updatedAt:          now,
    };

    updateEntity_("emeEvidencias", params.id, patch);

    _record(params.id, params.validationStatus === "aprobada" ? "validado" : "rechazado", {
      estadoAnterior: current.status,
      estadoNuevo:    newStatus,
      detalle:        { validationComments: patch.validationComments },
    }, params.userId || "", current.wsId);

    return Object.assign({}, current, patch);
  }

  function nuevaVersion(params) {
    if (!params.id)         throw new Error("id es requerido.");
    if (!params.uploadedBy) throw new Error("uploadedBy es requerido.");

    var rows = listEntities_("emeEvidencias", { id: params.id });
    if (!rows || rows.length === 0) throw new Error("Evidencia no encontrada: " + params.id);
    var current = rows[0];

    if (current.deletedAt) throw new Error("No se puede versionar una evidencia archivada.");

    var now        = _now();
    var newVersion = _incrementVersion(current.version);
    var newId      = IdGen.uuid();

    var storageRef = params.storageReference ||
      _simulateStorageReference(params.originalFileName || current.originalFileName, params.storageProvider || current.storageProvider);

    var newEntity = {
      id:                   newId,
      wsId:                 current.wsId,
      executionId:          current.executionId,
      planId:               current.planId,
      activityId:           current.activityId,
      procedureId:          current.procedureId,
      processId:            current.processId,
      organizationalUnitId: current.organizationalUnitId,
      title:                current.title,
      description:          params.description          || current.description,
      evidenceType:         params.evidenceType         || current.evidenceType,
      storageProvider:      params.storageProvider      || current.storageProvider,
      storageReference:     storageRef,
      fileName:             params.fileName             || current.fileName,
      originalFileName:     params.originalFileName     || current.originalFileName,
      extension:            params.extension            || current.extension,
      mimeType:             params.mimeType             || current.mimeType,
      fileSize:             params.fileSize             || current.fileSize,
      checksum:             params.checksum             || "",
      version:              newVersion,
      status:               "Cargada",
      uploadedBy:           params.uploadedBy,
      uploadedAt:           now,
      validatedBy:          "",
      validatedAt:          "",
      validationStatus:     "pendiente",
      validationComments:   "",
      isRequired:           current.isRequired,
      isConfidential:       current.isConfidential,
      confidentialityLevel: params.confidentialityLevel || current.confidentialityLevel,
      expirationDate:       params.expirationDate       || current.expirationDate,
      tags:                 params.tags
        ? (Array.isArray(params.tags) ? JSON.stringify(params.tags) : params.tags)
        : current.tags,
      notes:                params.notes               || current.notes,
      createdBy:            params.uploadedBy,
      createdAt:            now,
      updatedBy:            params.uploadedBy,
      updatedAt:            now,
      deletedAt:            "",
    };

    // Archive the current version (mark with deletedAt so it's excluded from active listings)
    updateEntity_("emeEvidencias", current.id, { deletedAt: now });

    createEntity_("emeEvidencias", newEntity);

    _record(current.id, "version_nueva", {
      estadoAnterior:  current.status,
      estadoNuevo:     "Cargada",
      versionAnterior: current.version,
      versionNueva:    newVersion,
      detalle:         { newId: newId, notes: params.notes },
    }, params.uploadedBy, current.wsId);

    _record(newId, "creado", {
      estadoNuevo:     "Cargada",
      versionNueva:    newVersion,
      detalle:         { previousId: current.id, previousVersion: current.version },
    }, params.uploadedBy, current.wsId);

    return newEntity;
  }

  function archivarEvidencia(params) {
    if (!params.id) throw new Error("id es requerido.");

    var rows = listEntities_("emeEvidencias", { id: params.id });
    if (!rows || rows.length === 0) throw new Error("Evidencia no encontrada: " + params.id);
    var current = rows[0];

    if (current.deletedAt) throw new Error("La evidencia ya está archivada.");

    var now   = _now();
    var patch = { status: "Archivada", deletedAt: now, updatedBy: params.userId || "", updatedAt: now };
    updateEntity_("emeEvidencias", params.id, patch);

    _record(params.id, "archivado", {
      estadoAnterior: current.status,
      estadoNuevo:    "Archivada",
    }, params.userId || "", current.wsId);

    return Object.assign({}, current, patch);
  }

  function getMisEvidencias(params) {
    if (!params.uploadedBy) throw new Error("uploadedBy es requerido.");
    var rows = listEntities_("emeEvidencias", { uploadedBy: params.uploadedBy }, 500);
    if (params.status) {
      rows = rows.filter(function (r) { return r.status === params.status; });
    }
    return { total: rows.length, items: rows };
  }

  function listCatalogos(params) {
    var rows = listEntities_("emeCatalogos", { wsId: _wsId(params) }, 500);

    if (params.tipo) {
      rows = rows.filter(function (r) { return r.tipo === params.tipo; });
    }

    if (rows.length > 0) {
      return { total: rows.length, items: rows, isDefault: false };
    }

    // Sheet is empty — return defaults
    var defaults = params.tipo
      ? (DEFAULT_CATALOGOS[params.tipo] || []).map(function (item, i) {
          return Object.assign({ id: "default-" + i, wsId: EME_WS_ID, tipo: params.tipo, activo: true }, item);
        })
      : Object.keys(DEFAULT_CATALOGOS).reduce(function (acc, tipo) {
          DEFAULT_CATALOGOS[tipo].forEach(function (item, i) {
            acc.push(Object.assign({ id: tipo + "-default-" + i, wsId: EME_WS_ID, tipo: tipo, activo: true }, item));
          });
          return acc;
        }, []);

    return { total: defaults.length, items: defaults, isDefault: true };
  }

  function createCatalogo(params) {
    if (!params.tipo || !params.valor || !params.etiqueta) {
      throw new Error("tipo, valor y etiqueta son requeridos.");
    }
    var now    = _now();
    var entity = {
      id:        IdGen.uuid(),
      wsId:      _wsId(params),
      tipo:      params.tipo,
      valor:     params.valor,
      etiqueta:  params.etiqueta,
      activo:    params.activo !== false,
      orden:     params.orden || 99,
      createdAt: now,
      updatedAt: now,
    };
    createEntity_("emeCatalogos", entity);
    return entity;
  }

  function updateCatalogo(params) {
    if (!params.id) throw new Error("id es requerido.");
    var now   = _now();
    var patch = { updatedAt: now };
    if (params.etiqueta !== undefined) patch.etiqueta = params.etiqueta;
    if (params.activo   !== undefined) patch.activo   = params.activo;
    if (params.orden    !== undefined) patch.orden    = params.orden;
    updateEntity_("emeCatalogos", params.id, patch);
    return Object.assign({ id: params.id }, patch);
  }

  function getHistorial(params) {
    var query = { wsId: _wsId(params) };
    if (params.evidenciaId) query.evidenciaId = params.evidenciaId;
    var rows = listEntities_("emeHistorial", query, 1000);
    return rows;
  }

  function buscarEvidencias(params) {
    if (!params.q) throw new Error("q (query) es requerido.");
    var q = String(params.q).toLowerCase();

    var rows = listEntities_("emeEvidencias", {}, 1000);
    var results = rows.filter(function (r) {
      return (r.title            || "").toLowerCase().indexOf(q) !== -1 ||
             (r.description      || "").toLowerCase().indexOf(q) !== -1 ||
             (r.tags             || "").toLowerCase().indexOf(q) !== -1 ||
             (r.processId        || "").toLowerCase().indexOf(q) !== -1 ||
             (r.activityId       || "").toLowerCase().indexOf(q) !== -1 ||
             (r.uploadedBy       || "").toLowerCase().indexOf(q) !== -1 ||
             (r.originalFileName || "").toLowerCase().indexOf(q) !== -1 ||
             (r.evidenceType     || "").toLowerCase().indexOf(q) !== -1;
    });

    return { total: results.length, items: results };
  }

  function getDashboard(params) {
    var wsId = _wsId(params);
    var all  = listEntities_("emeEvidencias", {}, 5000);

    var byStatus = {};
    ALLOWED_STATES.forEach(function (s) { byStatus[s] = 0; });

    var byType    = {};
    var byUnit    = {};
    var byUser    = {};
    var today     = new Date().toISOString().slice(0, 10);
    var todayList = [];
    var totalSize = 0;

    all.forEach(function (e) {
      // status counts
      if (byStatus[e.status] !== undefined) byStatus[e.status]++;

      // by type
      if (e.evidenceType) {
        byType[e.evidenceType] = (byType[e.evidenceType] || 0) + 1;
      }

      // by unit
      if (e.organizationalUnitId) {
        byUnit[e.organizationalUnitId] = (byUnit[e.organizationalUnitId] || 0) + 1;
      }

      // by user
      if (e.uploadedBy) {
        byUser[e.uploadedBy] = (byUser[e.uploadedBy] || 0) + 1;
      }

      // today
      if (e.uploadedAt && e.uploadedAt.slice(0, 10) === today) {
        todayList.push(e);
      }

      // size
      totalSize += parseInt(e.fileSize, 10) || 0;
    });

    var recent = all
      .slice()
      .sort(function (a, b) {
        return (b.uploadedAt || "").localeCompare(a.uploadedAt || "");
      })
      .slice(0, 10);

    return {
      total:      all.length,
      pending:    byStatus["Pendiente"]     || 0,
      uploaded:   byStatus["Cargada"]       || 0,
      inReview:   byStatus["En validación"] || 0,
      validated:  byStatus["Validada"]      || 0,
      rejected:   byStatus["Rechazada"]     || 0,
      archived:   byStatus["Archivada"]     || 0,
      today:      todayList.length,
      totalSize:  totalSize,
      byStatus:   Object.keys(byStatus).map(function (k) { return { status: k, count: byStatus[k] }; }),
      byType:     Object.keys(byType).map(function (k) { return { type: k, count: byType[k] }; }),
      byUnit:     Object.keys(byUnit).map(function (k) { return { unitId: k, count: byUnit[k] }; }),
      byUser:     Object.keys(byUser).map(function (k) { return { userId: k, count: byUser[k] }; }),
      recentEvidences: recent,
      todayEvidences:  todayList.slice(0, 5),
    };
  }

  return {
    listEvidencias:   listEvidencias,
    getEvidencia:     getEvidencia,
    createEvidencia:  createEvidencia,
    updateEvidencia:  updateEvidencia,
    cambiarEstado:    cambiarEstado,
    validarEvidencia: validarEvidencia,
    nuevaVersion:     nuevaVersion,
    archivarEvidencia:archivarEvidencia,
    getMisEvidencias: getMisEvidencias,
    listCatalogos:    listCatalogos,
    createCatalogo:   createCatalogo,
    updateCatalogo:   updateCatalogo,
    getHistorial:     getHistorial,
    buscarEvidencias: buscarEvidencias,
    getDashboard:     getDashboard,
  };
})();
