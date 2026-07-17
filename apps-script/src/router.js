/**
 * Action router: "<entity>.<verb>" → repository / service call.
 *
 * Sprint 2 additions over Sprint 1:
 *   • Request context (requestId, startTime, userId) threads through every call
 *   • auth.* actions route to AuthBridge
 *   • resource.* actions route to ResourceService
 *   • Write actions (create, update, remove) are audited via AuditService
 *   • Events are emitted for write actions so future handlers can react
 *   • Pagination metadata is surfaced alongside list results
 *
 * Sprint 13 additions:
 *   • workspace.* actions route to WorkspaceController lifecycle methods
 *   • ws* entity namespaces route to generic CRUD + workspace verbs
 *     (publish, archive, restore, duplicate, toggleActive, recordExecution,
 *      recordKPIValue, getHistory, uploadDocument)
 *   • mergeWorkspaceAdminEntities_ called once at startup
 */

var WRITE_VERBS = { create: true, update: true, remove: true };

// Workspace-admin entity namespaces that support lifecycle operations.
var WS_ENTITY_NAMESPACES = {
  wsBlueprints:   true,
  wsKPIs:         true,
  wsRequestTypes: true,
  wsAutomations:  true,
  wsUsers:        true,
  wsForms:        true,
  wsDocuments:    true,
  wsNotifRules:   true,
  wsSettings:     true,
};

/**
 * Main dispatch function, called by doPost in Code.js.
 *
 * @param {string} action  — e.g. "procesos.list" or "auth.getUser"
 * @param {Object} params  — action-specific parameters
 * @param {Object} context — { requestId, startMs, userId, userEmail }
 * @returns {{ data: *, pagination: Object|null }}
 */
function routeAction_(action, params, context) {
  var parts = String(action || "").split(".");
  var namespace = parts[0];
  var verb      = parts[1];

  AppLogger.info("routeAction_", {
    action: action,
    requestId: context && context.requestId,
    userId: context && context.userId,
  });

  if (!namespace || !verb) {
    throw new Error("Invalid action format — expected '<entity>.<verb>', got: " + action);
  }

  var result;
  var entityId = params && params.id;

  if (namespace === "auth") {
    result = AuthBridge.route(verb, params || {});
    return { data: result, pagination: null };
  }

  if (namespace === "resource") {
    result = routeResourceAction_(verb, params || {}, context);
    return { data: result, pagination: null };
  }

  if (namespace === "platform") {
    result = routePlatformAction_(verb, params || {}, context);
    return { data: result, pagination: null };
  }

  if (namespace === "builder") {
    result = routeBuilderAction_(verb, params || {}, context);
    return { data: result, pagination: null };
  }

  if (namespace === "health") {
    result = HealthController.getHealth(params || {}, context);
    return { data: result, pagination: null };
  }

  if (namespace === "contratacion") {
    result = routeContratacionAction_(verb, params || {});
    return { data: result, pagination: null };
  }

  // Workspace-admin lifecycle verbs routed to WorkspaceController
  if (WS_ENTITY_NAMESPACES[namespace]) {
    var wsResult = routeWorkspaceAction_(namespace, verb, params || {}, context);
    if (wsResult !== undefined) return wsResult;
    // Fall through to generic CRUD for list/get/create/update/remove/restore
  }

  // Generic entity CRUD
  if (!ENTITY_SHEETS[namespace]) {
    throw new Error("Unknown entity: " + namespace);
  }

  if (verb === "list") {
    var listResult = listEntities_(namespace, params);
    return { data: listResult.items, pagination: listResult.pagination };
  }

  if (verb === "get") {
    Validator.requireId(params);
    result = getEntity_(namespace, params.id);
    return { data: result, pagination: null };
  }

  var before = null;

  if (verb === "create") {
    result = createEntity_(namespace, params || {});
    entityId = result && result.id;
  } else if (verb === "update") {
    Validator.requireId(params);
    before = getEntity_(namespace, params.id);
    var patch = Object.assign({}, params);
    delete patch.id;
    result = updateEntity_(namespace, params.id, patch);
  } else if (verb === "remove") {
    Validator.requireId(params);
    removeEntity_(namespace, params.id);
    result = null;
  } else if (verb === "restore") {
    Validator.requireId(params);
    result = restoreEntity_(namespace, params.id);
  } else {
    throw new Error("Unknown verb: " + verb);
  }

  // Audit and event emission for write operations
  if (WRITE_VERBS[verb]) {
    AuditService.record({
      accion:      action,
      entidadTipo: namespace,
      entidadId:   entityId || (params && params.id) || "",
      usuarioId:   context && context.userId || "",
      resultado:   "ok",
      detalle:     before !== null ? { before: before, after: result } : undefined,
    });

    emitWriteEvent_(namespace, verb, result || params, context);
  }

  return { data: result, pagination: null };
}

/**
 * Route workspace-admin lifecycle and operational verbs.
 * Returns undefined if the verb is not a workspace-specific one (caller falls
 * through to generic CRUD).
 *
 * @param {string} entityName
 * @param {string} verb
 * @param {Object} params
 * @param {Object} context
 * @returns {{ data: *, pagination: null } | undefined}
 */
function routeWorkspaceAction_(entityName, verb, params, context) {
  var userId = context && context.userId || "";

  switch (verb) {
    case "publish":
      Validator.requireId(params);
      return { data: WorkspaceController.publish(entityName, params.id, userId), pagination: null };

    case "archive":
      Validator.requireId(params);
      return { data: WorkspaceController.archive(entityName, params.id, userId), pagination: null };

    case "restore":
      Validator.requireId(params);
      return { data: WorkspaceController.restore(entityName, params.id, userId), pagination: null };

    case "duplicate":
      Validator.requireId(params);
      return { data: WorkspaceController.duplicate(entityName, params.id, userId), pagination: null };

    case "toggleActive":
      Validator.requireId(params);
      return {
        data: WorkspaceController.toggleActive(entityName, params.id, params.active !== false, userId),
        pagination: null,
      };

    case "recordExecution":
      if (!params.id) throw new Error("id is required for recordExecution");
      return {
        data: WorkspaceController.recordExecution(
          params.id,
          params.status || "success",
          params.errorMessage || "",
          params.actionsExecuted || 0,
          userId
        ),
        pagination: null,
      };

    case "recordKPIValue":
      if (!params.id) throw new Error("id is required for recordKPIValue");
      return {
        data: WorkspaceController.recordKPIValue(
          params.id,
          params.valor,
          params.semaforo || "verde",
          params.fecha || null
        ),
        pagination: null,
      };

    case "getHistory":
      Validator.requireId(params);
      return { data: WorkspaceController.getHistory(entityName, params.id), pagination: null };

    case "uploadDocument":
      if (entityName !== "wsDocuments") return undefined;
      if (!params.wsId) throw new Error("wsId is required for uploadDocument");
      return {
        data: WorkspaceFolderManager.uploadDocument(params.wsId, {
          nombre:       params.nombre,
          descripcion:  params.descripcion,
          categoria:    params.categoria,
          mimeType:     params.mimeType,
          base64Content: params.base64Content,
          tags:         params.tags,
          createdBy:    userId,
        }),
        pagination: null,
      };

    case "upsertByWsId":
      if (entityName !== "wsSettings") return undefined;
      if (!params.wsId) throw new Error("wsId is required for upsertByWsId");
      var settingsPatch = Object.assign({}, params);
      settingsPatch.updatedAt = new Date().toISOString();
      var existingSettings = getEntity_("wsSettings", params.wsId);
      if (existingSettings) {
        return { data: updateEntity_("wsSettings", params.wsId, settingsPatch), pagination: null };
      }
      settingsPatch.id = params.wsId;
      return { data: createEntity_("wsSettings", settingsPatch), pagination: null };

    default:
      return undefined; // fall through to generic CRUD
  }
}

/**
 * Route platform.* actions to BootstrapController.
 * Each verb maps to one installation step.
 */
function routePlatformAction_(verb, params, context) {
  switch (verb) {
    case "validate":         return BootstrapController.validate(params, context);
    case "initDatabase":     return BootstrapController.initDatabase(params, context);
    case "initDrive":        return BootstrapController.initDrive(params, context);
    case "installTemplates": return BootstrapController.installTemplates(params, context);
    case "createAdmin":      return BootstrapController.createAdmin(params, context);
    case "configure":        return BootstrapController.configure(params, context);
    case "healthCheck":      return BootstrapController.healthCheck(params, context);
    case "liveTest":         return BootstrapController.liveTest(params, context);
    case "report":           return BootstrapController.report(params, context);
    case "getStatus":        return BootstrapController.getStatus(params, context);
    default:
      throw new Error("Unknown platform verb: " + verb);
  }
}

/**
 * Route builder.* actions to BuilderController.
 * All builder CRUD operations for the No-Code Builder Suite.
 */
function routeBuilderAction_(verb, params, context) {
  params = params || {};
  var userId = context && context.userId || "";

  switch (verb) {
    case "list":             return BuilderController.list(params);
    case "get":              return BuilderController.get(params);
    case "save":             return BuilderController.save(params);
    case "publish":          return BuilderController.publish(Object.assign({}, params, { userId: userId }));
    case "archive":          return BuilderController.archive(params);
    case "delete":           return BuilderController.delete(params);
    case "duplicate":        return BuilderController.duplicate(params);
    case "restoreVersion":   return BuilderController.restoreVersion(params);
    case "getVersionHistory": return BuilderController.getVersionHistory(params);
    case "saveCatalogEntry":  return BuilderController.saveCatalogEntry(params);
    case "deleteCatalogEntry": return BuilderController.deleteCatalogEntry(params);
    case "getProcessList":    return BuilderController.getProcessList(params);
    case "getFormList":       return BuilderController.getFormList(params);
    case "getKPIList":        return BuilderController.getKPIList(params);
    case "getNotificationList": return BuilderController.getNotificationList(params);
    default:
      throw new Error("Unknown builder verb: " + verb);
  }
}

/**
 * Route resource.* actions to ResourceService.
 */
function routeResourceAction_(verb, params, context) {
  switch (verb) {
    case "get":
      Validator.requireId(params);
      return ResourceService.get(params.id, params.enrich === true);
    case "archive":
      Validator.requireId(params);
      return ResourceService.archive(params.id);
    case "create":
      return ResourceService.create(params, params._file || null);
    case "update":
      Validator.requireId(params);
      return ResourceService.update(params.id, params);
    default:
      throw new Error("Unknown resource verb: " + verb);
  }
}

/**
 * Map a write verb + entity to an EVENT_TYPES constant and emit.
 * No-ops silently if there's no registered event for this combination.
 */
function emitWriteEvent_(entityName, verb, payload, context) {
  var singularMap = {
    planes:      "PLAN",
    objetivos:   "OBJETIVO",
    proyectos:   "PROYECTO",
    procesos:    "PROCESO",
    actividades: "ACTIVIDAD",
    evidencias:  "EVIDENCIA",
    indicadores: "INDICADOR",
    solicitudes: "SOLICITUD",
  };

  var entityKey = singularMap[entityName];
  if (!entityKey) return;

  var verbEventMap = {
    create: "CREADO",
    update: "ACTUALIZADO",
    remove: "ELIMINADO",
  };

  var eventSuffix = verbEventMap[verb];
  if (!eventSuffix) return;

  var eventType = EVENT_TYPES[entityKey + "_" + eventSuffix];
  if (!eventType) return;

  EventDispatcher.emit(eventType, {
    entityName: entityName,
    id:         payload && payload.id,
    userId:     context && context.userId,
    requestId:  context && context.requestId,
  });
}
