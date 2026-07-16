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
 * Entity-specific business rules (R01-R10) are NOT here. They land as named
 * actions in a future sprint, called from this router alongside generic CRUD.
 */

var WRITE_VERBS = { create: true, update: true, remove: true };

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
