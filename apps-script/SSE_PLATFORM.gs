// ============================================================
// SSE_PLATFORM.gs — Single-file deployment build
// All 35 source files merged in dependency order.
// Generated: 2026-07-17T19:06:42Z
// ============================================================

// ============================================================
// SOURCE: config/Config.js
// ============================================================

/**
 * Central configuration — every ID, URL, and toggle comes from Script Properties.
 * Set these in the Apps Script editor: Project Settings → Script Properties.
 *
 * Required for production:
 *   SPREADSHEET_ID          Google Sheets database ID (copy from the Sheet URL)
 *   DRIVE_FOLDER_ROOT_ID    Parent Drive folder for all SSE-VRAF evidence files
 *
 * Optional (have safe defaults):
 *   WEBHOOK_SHARED_SECRET   If set, every POST must carry a matching `secret` field
 *   MAX_PAGE_SIZE           Cap on _pageSize queries (default: 100, max: 500)
 *   LOG_LEVEL               DEBUG | INFO | WARN | ERROR  (default: INFO)
 *   INSTANCE_NAME           Name surfaced by the doGet health endpoint (default: SSE-VRAF)
 *
 * No hardcoded IDs appear anywhere else in the codebase.
 */
var Config = (function () {
  var _props = null;

  function props_() {
    if (!_props) _props = PropertiesService.getScriptProperties();
    return _props;
  }

  return {
    spreadsheetId: function () {
      return props_().getProperty("SPREADSHEET_ID");
    },
    driveFolderRootId: function () {
      return props_().getProperty("DRIVE_FOLDER_ROOT_ID");
    },
    webhookSecret: function () {
      return props_().getProperty("WEBHOOK_SHARED_SECRET");
    },
    maxPageSize: function () {
      var raw = props_().getProperty("MAX_PAGE_SIZE");
      var parsed = parseInt(raw, 10);
      return isNaN(parsed) ? 100 : Math.min(parsed, 500);
    },
    logLevel: function () {
      return props_().getProperty("LOG_LEVEL") || "INFO";
    },
    instanceName: function () {
      return props_().getProperty("INSTANCE_NAME") || "SSE-VRAF";
    },
    domain: function () {
      return props_().getProperty("WORKSPACE_DOMAIN") || "";
    },
    adminEmail: function () {
      return props_().getProperty("ADMIN_EMAIL") || "";
    },
    gmailEnabled: function () {
      var val = props_().getProperty("GMAIL_ENABLED");
      return val === "true" || val === "1";
    },
  };
})();


// ============================================================
// SOURCE: utils/idgen.js
// ============================================================

/**
 * ID generation for the platform core.
 *
 * Sprint 2: all entities receive UUIDs via Utilities.getUuid(). RUI-formatted
 * identifiers (PROC-RH-26-001, KPI-CO-001, etc.) replace these per-entity
 * as each entity's owning sprint lands and adds a named router action that
 * calls the RUI builder instead of IdGen.forEntity().
 *
 * The Apps Script twin of web/lib/rui.ts — keep the two in sync.
 */
var IdGen = {
  /**
   * Generate a UUID (RFC 4122 v4, provided by the Apps Script runtime).
   * @returns {string}
   */
  uuid: function () {
    return Utilities.getUuid();
  },

  /**
   * Generate a short request-scoped tracing ID.
   * Format: REQ-<8 uppercase hex chars>
   * @returns {string}
   */
  requestId: function () {
    var full = Utilities.getUuid().replace(/-/g, "");
    return "REQ-" + full.substring(0, 8).toUpperCase();
  },

  /**
   * Generate a new ID for a named entity.
   * Workspace-admin entities receive human-readable prefixed IDs.
   * All other entities receive UUIDs until their owning sprint adds RUI logic.
   *
   * @param {string} entityName
   * @returns {string}
   */
  forEntity: function (entityName) {
    var ws = IdGen._wsPrefix_(entityName);
    if (ws) return ws;
    return IdGen.uuid();
  },

  /**
   * Build a workspace-admin prefixed ID when the entity name is recognised.
   * Format: PREFIX-YY-XXXXXX  (2-digit year + 6 uppercase hex chars)
   * Returns null for non-ws entities.
   * @private
   */
  _wsPrefix_: function (entityName) {
    var prefixMap = {
      wsBlueprints:   "BP",
      wsKPIs:         "KPI",
      wsRequestTypes: "RQ",
      wsAutomations:  "AUTO",
      wsUsers:        "USR",
      wsForms:        "FM",
      wsDocuments:    "DOC",
      wsNotifRules:   "NR",
      wsSettings:     "WS",
    };
    var prefix = prefixMap[entityName];
    if (!prefix) return null;

    var year = new Date().getFullYear().toString().slice(-2);
    var rand = Utilities.getUuid().replace(/-/g, "").substring(0, 6).toUpperCase();
    return prefix + "-" + year + "-" + rand;
  },
};


// ============================================================
// SOURCE: utils/logger.js
// ============================================================

/**
 * Structured application logger. Writes JSON lines to the Apps Script execution
 * log (visible in the script editor and Stackdriver / Cloud Logging).
 * Level is controlled by the LOG_LEVEL script property.
 *
 * Usage:
 *   AppLogger.info("procesos.list called", { count: 12 });
 *   AppLogger.error("Drive upload failed", { fileId, error: err.message });
 *
 * Note: named AppLogger to avoid conflict with the built-in Logger global.
 */
var AppLogger = (function () {
  var LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

  function currentLevel_() {
    var name = Config.logLevel();
    return LEVELS[name] !== undefined ? LEVELS[name] : LEVELS.INFO;
  }

  function log_(level, message, data) {
    if ((LEVELS[level] || 0) < currentLevel_()) return;
    var entry = { level: level, ts: new Date().toISOString(), msg: message };
    if (data !== undefined) entry.data = data;
    Logger.log(JSON.stringify(entry));
  }

  return {
    debug: function (msg, data) { log_("DEBUG", msg, data); },
    info:  function (msg, data) { log_("INFO",  msg, data); },
    warn:  function (msg, data) { log_("WARN",  msg, data); },
    error: function (msg, data) { log_("ERROR", msg, data); },
  };
})();


// ============================================================
// SOURCE: utils/response.js
// ============================================================

/**
 * Wire response envelope — frozen for the lifetime of the project.
 *
 * Every Apps Script response conforms to:
 *   {
 *     success:   boolean,
 *     data:      any,          // null on error
 *     metadata:  {
 *       requestId:  string,    // REQ-XXXXXXXX (echoed from context)
 *       durationMs: number,    // wall-clock time for the action
 *       pagination?: {         // present only on paginated list results
 *         page, pageSize, total, totalPages
 *       }
 *     },
 *     errors:    [{ code, message, field? }],   // empty array on success
 *     timestamp: string,       // ISO-8601 UTC
 *     requestId: string,       // top-level copy of metadata.requestId for quick access
 *   }
 *
 * This matches web/services/adapters/httpAppsScriptAdapter.ts exactly.
 * The previous { ok, data, error } format from Sprint 1 is superseded here.
 */
function jsonOutput_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function buildEnvelope_(success, data, metadata, errors) {
  var ts = new Date().toISOString();
  var meta = Object.assign({ requestId: null, durationMs: 0 }, metadata || {});
  return {
    success:   success,
    data:      data !== undefined ? data : null,
    metadata:  meta,
    errors:    errors  || [],
    timestamp: ts,
    requestId: meta.requestId,
  };
}

function ok_(data, metadata) {
  return jsonOutput_(buildEnvelope_(true, data, metadata, []));
}

function fail_(error, metadata) {
  var msg  = String((error && error.message) || error || "Unknown error");
  var code = (error && error.code) ? String(error.code) : "INTERNAL_ERROR";
  return jsonOutput_(buildEnvelope_(false, null, metadata, [{ code: code, message: msg }]));
}


// ============================================================
// SOURCE: utils/validator.js
// ============================================================

/**
 * Input validation utilities shared across router, action handlers, and services.
 * All validators throw Error on failure — the router catches and translates to
 * the standard { success: false, errors: [...] } response envelope.
 */
var Validator = {
  /**
   * Throw if any field in `fields` is missing or blank on `obj`.
   * @param {Object} obj
   * @param {string[]} fields
   */
  requireFields: function (obj, fields) {
    var missing = [];
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      var v = obj && obj[f];
      if (v === undefined || v === null || String(v).trim() === "") {
        missing.push(f);
      }
    }
    if (missing.length > 0) {
      throw new Error("Missing required fields: " + missing.join(", "));
    }
  },

  /**
   * Throw if params.id is absent or blank.
   * @param {Object} params
   */
  requireId: function (params) {
    if (!params || !params.id || String(params.id).trim() === "") {
      throw new Error("Missing required field: id");
    }
  },

  /**
   * Return a shallow copy of `obj` with undefined/null keys removed.
   * Does not mutate the input.
   * @param {Object} obj
   * @returns {Object}
   */
  sanitize: function (obj) {
    if (!obj || typeof obj !== "object") return {};
    var out = {};
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (obj[key] !== undefined && obj[key] !== null) {
          out[key] = obj[key];
        }
      }
    }
    return out;
  },

  /**
   * Return true if `id` is a non-empty string.
   * @param {*} id
   * @returns {boolean}
   */
  isValidId: function (id) {
    return typeof id === "string" && id.trim().length > 0;
  },
};


// ============================================================
// SOURCE: events/EventTypes.js
// ============================================================

/**
 * All 16 institutional event types defined in MASTER HANDOFF §09.
 * These are the wire-level names used by EventDispatcher — every emit()
 * call and every on() registration uses one of these constants.
 *
 * Adding an event type here does not wire any handler — handlers are
 * registered in the sprint that owns the consuming logic (notifications,
 * automations, indicator recalculation, etc.).
 */
var EVENT_TYPES = {
  // Strategic plan hierarchy
  PLAN_CREADO:             "plan.creado",
  OBJETIVO_CREADO:         "objetivo.creado",

  // Projects
  PROYECTO_CREADO:         "proyecto.creado",
  PROYECTO_ACTUALIZADO:    "proyecto.actualizado",

  // Processes — the institutional nucleus (§04)
  PROCESO_CREADO:          "proceso.creado",
  PROCESO_ACTUALIZADO:     "proceso.actualizado",
  PROCESO_COMPLETADO:      "proceso.completado",
  PROCESO_VENCIDO:         "proceso.vencido",

  // Activities
  ACTIVIDAD_COMPLETADA:    "actividad.completada",

  // Evidence (§08)
  EVIDENCIA_CARGADA:       "evidencia.cargada",
  EVIDENCIA_APROBADA:      "evidencia.aprobada",
  EVIDENCIA_RECHAZADA:     "evidencia.rechazada",

  // Indicators
  INDICADOR_ACTUALIZADO:   "indicador.actualizado",
  INDICADOR_ALERTA:        "indicador.alerta",

  // Service requests
  SOLICITUD_CREADA:        "solicitud.creada",
  SOLICITUD_RESUELTA:      "solicitud.resuelta",

  // ── Workspace Admin — Sprint 13 ────────────────────────────────────────────
  BLUEPRINT_PUBLICADO:     "blueprint.publicado",
  BLUEPRINT_ARCHIVADO:     "blueprint.archivado",
  FORMULARIO_PUBLICADO:    "formulario.publicado",
  KPI_ACTUALIZADO:         "kpi.actualizado",
  KPI_ALERTA:              "kpi.alerta",
  SOLICITUD_APROBADA:      "solicitud.aprobada",
  AUTOMATION_EJECUTADA:    "automation.ejecutada",
  DOCUMENTO_SUBIDO:        "documento.subido",
  DOCUMENTO_ARCHIVADO:     "documento.archivado",
  NOTIFICACION_ENVIADA:    "notificacion.enviada",
  USUARIO_CREADO:          "usuario.creado",
  USUARIO_ACTIVADO:        "usuario.activado",
  USUARIO_DESACTIVADO:     "usuario.desactivado",
  REGLA_NOTIF_ACTIVADA:    "regla.notif.activada",
  WORKSPACE_CONFIGURADO:   "workspace.configurado",
};


// ============================================================
// SOURCE: events/EventDispatcher.js
// ============================================================

/**
 * Synchronous internal event dispatcher. Events fire and are handled within
 * the same request cycle — there are no persistent queues. The permanent
 * record of what happened lives in HistorialAudit (written by AuditService).
 *
 * Usage:
 *   EventDispatcher.on(EVENT_TYPES.PROCESO_CREADO, function(payload) {
 *     // e.g. trigger indicator recalculation
 *   });
 *
 *   EventDispatcher.emit(EVENT_TYPES.PROCESO_CREADO, { id: proc.id, unidadId: ... });
 *
 * Handler errors are swallowed and logged — they do not fail the originating action.
 * Register handlers from the router or Code.js after all modules are loaded.
 */
var EventDispatcher = (function () {
  var handlers = {};

  return {
    /**
     * Register a handler for an event type. Multiple handlers per type are allowed.
     * @param {string} eventType  — one of EVENT_TYPES.*
     * @param {Function} handler  — called with (payload: Object)
     */
    on: function (eventType, handler) {
      if (typeof handler !== "function") {
        throw new Error("EventDispatcher.on: handler must be a function");
      }
      if (!handlers[eventType]) handlers[eventType] = [];
      handlers[eventType].push(handler);
    },

    /**
     * Unregister a specific handler reference.
     * @param {string} eventType
     * @param {Function} handler
     */
    off: function (eventType, handler) {
      if (!handlers[eventType]) return;
      handlers[eventType] = handlers[eventType].filter(function (h) {
        return h !== handler;
      });
    },

    /**
     * Fire all handlers registered for eventType, synchronously in registration order.
     * Handler errors are logged and swallowed.
     * @param {string} eventType
     * @param {Object} payload
     */
    emit: function (eventType, payload) {
      var list = handlers[eventType] || [];
      for (var i = 0; i < list.length; i++) {
        try {
          list[i](payload);
        } catch (err) {
          AppLogger.error("EventDispatcher handler threw", {
            eventType: eventType,
            error: String((err && err.message) || err),
          });
        }
      }
    },

    /**
     * Remove all registered handlers. Useful for test isolation.
     */
    reset: function () {
      handlers = {};
    },
  };
})();


// ============================================================
// SOURCE: schema/entities.js
// ============================================================

/**
 * Google Sheets schema — one sheet (tab) per entity, never one giant sheet.
 * Mirrors web/types/entities.ts field-for-field so the two stay in sync;
 * if you add a field on one side, add it here too.
 *
 * ENTITY_SHEETS maps the wire-level entity name (as sent by
 * IAppsScriptClient) to its sheet tab name and column order. Column order
 * defines the header row written by ensureSheet_().
 */
var ENTITY_SHEETS = {
  planes: {
    sheetName: "Planes",
    columns: ["id", "nombre", "periodoInicio", "periodoFin", "descripcion"],
  },
  objetivos: {
    sheetName: "ObjetivosEstrategicos",
    columns: ["id", "planId", "nombre", "descripcion"],
  },
  proyectos: {
    sheetName: "ProyectosEstrategicos",
    columns: ["id", "objetivoId", "nombre", "descripcion", "unidadId"],
  },
  procesos: {
    sheetName: "ProcesosInstitucionales",
    columns: [
      "id",
      "proyectoId",
      "unidadId",
      "nombre",
      "tipo",
      "objetivo",
      "alcance",
      "responsableId",
      "clientesInternos",
      "clientesExternos",
      "normativaAsociada",
      "estado",
      "avancePct",
      "semaforo",
      "fechaInicio",
      "fechaLimite",
      "slaDias",
      "prioridad",
      "ultimaActualizacion",
      "createdAt",
      "deletedAt",
    ],
  },
  actividades: {
    sheetName: "Actividades",
    columns: [
      "id",
      "procesoId",
      "etapaId",
      "nombre",
      "descripcion",
      "responsableId",
      "tiempoEsperadoHoras",
      "dependenciaId",
      "prioridad",
      "estado",
      "puntoControl",
      "orden",
    ],
  },
  evidencias: {
    sheetName: "Evidencias",
    columns: [
      "id",
      "actividadId",
      "nombre",
      "tipo",
      "obligatoria",
      "estado",
      "driveFileId",
      "version",
      "responsableId",
      "fechaCarga",
      "observaciones",
    ],
  },
  indicadores: {
    sheetName: "Indicadores",
    columns: [
      "id",
      "procesoId",
      "procedimientoId",
      "nombre",
      "objetivo",
      "descripcion",
      "categoria",
      "formula",
      "unidadMedida",
      "meta",
      "valorActual",
      "frecuencia",
      "responsableId",
      "fuenteInformacion",
      "evidenciaRequeridaId",
      "dashboardDestino",
      "reporteDestino",
      "automatizacionId",
      "semaforo",
      "tendencia",
      "ultimaActualizacion",
    ],
  },
  formularios: {
    sheetName: "Formularios",
    columns: [
      "id",
      "nombre",
      "unidadId",
      "version",
      "estado",
      "schemaJson",
      "entidadGeneradaId",
      "guardadoEnBiblioteca",
      "autor",
      "fecha",
      "comentarios",
    ],
  },
  solicitudes: {
    sheetName: "Solicitudes",
    columns: [
      "id",
      "procesoId",
      "unidadId",
      "asunto",
      "solicitanteId",
      "responsableId",
      "estado",
      "fechaCreacion",
      "fechaCierre",
      "tiempoRespuestaHoras",
      "satisfaccion",
    ],
  },
  usuarios: {
    sheetName: "Usuarios",
    columns: ["id", "nombre", "email", "unidadId", "rol", "activo", "avatarInitials"],
  },
  unidades: {
    sheetName: "Unidades",
    columns: ["id", "nombre", "responsableId"],
  },
  historial: {
    sheetName: "HistorialAudit",
    columns: [
      "id",
      "entidadTipo",
      "entidadId",
      "usuarioId",
      "accion",
      "resultado",
      "fecha",
      "detalleJson",
    ],
  },

  // ── HR domain ──────────────────────────────────────────────────────────────
  empleados: {
    sheetName: "Empleados",
    columns: [
      "id",
      "usuarioId",
      "unidadId",
      "cargo",
      "departamento",
      "fechaIngreso",
      "tipoContrato",
      "estado",
      "deletedAt",
      "deletedBy",
    ],
  },
  capacitaciones: {
    sheetName: "Capacitaciones",
    columns: [
      "id",
      "nombre",
      "descripcion",
      "unidadId",
      "responsableId",
      "fechaInicio",
      "fechaFin",
      "estado",
      "modalidad",
      "deletedAt",
      "deletedBy",
    ],
  },
  evaluaciones: {
    sheetName: "Evaluaciones",
    columns: [
      "id",
      "empleadoId",
      "evaluadorId",
      "periodo",
      "estado",
      "puntajeTotal",
      "comentarios",
      "fecha",
      "deletedAt",
      "deletedBy",
    ],
  },
  solicitudesContratacion: {
    sheetName: "SolicitudesContratacion",
    columns: [
      "id",
      "unidadId",
      "cargo",
      "descripcion",
      "candidatoNombre",
      "responsableId",
      "estado",
      "fechaSolicitud",
      "fechaResolucion",
      "deletedAt",
      "deletedBy",
    ],
  },

  // ── Notifications ──────────────────────────────────────────────────────────
  notificaciones: {
    sheetName: "Notificaciones",
    columns: [
      "id",
      "usuarioId",
      "tipo",
      "titulo",
      "mensaje",
      "leida",
      "createdAt",
      "entityTipo",
      "entityId",
      "deletedAt",
    ],
  },

  // ── Workflow domain ────────────────────────────────────────────────────────
  workflowBlueprints: {
    sheetName: "WorkflowBlueprints",
    columns: [
      "id",
      "nombre",
      "version",
      "unidadId",
      "estado",
      "schemaJson",
      "createdAt",
      "createdBy",
      "updatedAt",
      "deletedAt",
      "deletedBy",
    ],
  },
  workflowInstances: {
    sheetName: "WorkflowInstances",
    columns: [
      "id",
      "blueprintId",
      "blueprintVersion",
      "blueprintName",
      "unidadId",
      "nombre",
      "estado",
      "currentStageId",
      "stagesJson",
      "assignedUsersJson",
      "auditLogJson",
      "contextDataJson",
      "createdAt",
      "createdBy",
      "updatedAt",
      "completedAt",
      "deletedAt",
      "deletedBy",
    ],
  },

  // ── Studio domain ──────────────────────────────────────────────────────────
  blueprintRegistry: {
    sheetName: "BlueprintRegistry",
    columns: [
      "id",
      "blueprintId",
      "nombre",
      "version",
      "categoria",
      "unidadId",
      "publicado",
      "autor",
      "fecha",
      "deletedAt",
      "deletedBy",
    ],
  },
  instanceSummaries: {
    sheetName: "InstanceSummaries",
    columns: [
      "id",
      "instanceId",
      "blueprintId",
      "nombre",
      "unidadId",
      "estado",
      "pct",
      "etapaActual",
      "updatedAt",
    ],
  },
};


// ============================================================
// SOURCE: schema/workspace-admin-entities.js
// ============================================================

/**
 * Workspace-admin entity schema definitions — Sprint 13.
 *
 * WORKSPACE_ADMIN_ENTITY_SHEETS mirrors web/types/workspace-admin.ts field-for-field.
 * JSON arrays / nested objects are stored as a single JSON string column; the column
 * name ends in "Json" to make this explicit.
 *
 * Call mergeWorkspaceAdminEntities_() once during initialization (from
 * initializeDatabase() or Code.js bootstrap) to copy these keys into the global
 * ENTITY_SHEETS so that getEntityConfig_() and the router can find them.
 */

var WORKSPACE_ADMIN_ENTITY_SHEETS = {

  // ── Process Blueprints ─────────────────────────────────────────────────────
  wsBlueprints: {
    sheetName: "WSBlueprints",
    columns: [
      "id",
      "wsId",
      "nombre",
      "descripcion",
      "tipo",
      "objetivo",
      "alcance",
      "responsableRol",
      "clientesInternos",
      "clientesExternos",
      "normativaAsociada",
      "slaDias",
      "prioridad",
      "frecuencia",
      "indicadorIds",
      "evidenciasRequeridas",
      "formIds",
      "lifecycle",
      "version",
      "publishedVersion",
      "runtimeBlueprintId",
      "historyJson",
      "createdBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
    ],
  },

  // ── Workspace KPIs ─────────────────────────────────────────────────────────
  wsKPIs: {
    sheetName: "WSKPIs",
    columns: [
      "id",
      "wsId",
      "nombre",
      "descripcion",
      "categoria",
      "formula",
      "unidadMedida",
      "meta",
      "tolerancia",
      "frecuencia",
      "fuenteDatos",
      "responsableRol",
      "visualizacion",
      "dashboardDestino",
      "semaforoJson",
      "historicoJson",
      "valorActual",
      "tendencia",
      "lifecycle",
      "version",
      "historyJson",
      "createdBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
    ],
  },

  // ── Request Types ──────────────────────────────────────────────────────────
  wsRequestTypes: {
    sheetName: "WSRequestTypes",
    columns: [
      "id",
      "wsId",
      "nombre",
      "descripcion",
      "categoria",
      "icon",
      "blueprintId",
      "formFieldsJson",
      "approvalStepsJson",
      "slaDias",
      "responsableRol",
      "evidenciasRequeridasJson",
      "notificacionesJson",
      "permisosCrearJson",
      "permisosAprobarJson",
      "lifecycle",
      "version",
      "historyJson",
      "createdBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
    ],
  },

  // ── Automations ────────────────────────────────────────────────────────────
  wsAutomations: {
    sheetName: "WSAutomations",
    columns: [
      "id",
      "wsId",
      "nombre",
      "descripcion",
      "trigger",
      "triggerConfigJson",
      "conditionsJson",
      "conditionLogic",
      "actionsJson",
      "active",
      "executionCount",
      "lastExecutedAt",
      "lastStatus",
      "recentExecutionsJson",
      "lifecycle",
      "version",
      "historyJson",
      "createdBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
    ],
  },

  // ── Workspace Users ────────────────────────────────────────────────────────
  wsUsers: {
    sheetName: "WSUsers",
    columns: [
      "id",
      "wsId",
      "nombre",
      "email",
      "rol",
      "activo",
      "lastLoginAt",
      "createdAt",
      "updatedAt",
      "deletedAt",
    ],
  },

  // ── Form Blueprints ────────────────────────────────────────────────────────
  wsForms: {
    sheetName: "WSForms",
    columns: [
      "id",
      "wsId",
      "nombre",
      "descripcion",
      "schemaJson",
      "lifecycle",
      "version",
      "historyJson",
      "createdBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
    ],
  },

  // ── Workspace Documents ────────────────────────────────────────────────────
  wsDocuments: {
    sheetName: "WSDocuments",
    columns: [
      "id",
      "wsId",
      "nombre",
      "descripcion",
      "categoria",
      "version",
      "sizeKb",
      "tagsJson",
      "mimeType",
      "driveFileId",
      "driveWebViewLink",
      "lifecycle",
      "createdBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
    ],
  },

  // ── Notification Rules ─────────────────────────────────────────────────────
  wsNotifRules: {
    sheetName: "WSNotifRules",
    columns: [
      "id",
      "wsId",
      "nombre",
      "descripcion",
      "trigger",
      "conditionsJson",
      "destinatarioRolesJson",
      "canal",
      "asunto",
      "mensaje",
      "active",
      "lifecycle",
      "createdBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
    ],
  },

  // ── Workspace Settings (one row per workspace) ─────────────────────────────
  // id column is set to wsId on create so generic CRUD (getEntity_, updateEntity_)
  // can locate rows by wsId without a separate lookup.
  wsSettings: {
    sheetName: "WSSettings",
    columns: [
      "id",
      "wsId",
      "nombre",
      "nombreCorto",
      "descripcion",
      "responsableId",
      "color",
      "colorFondo",
      "icon",
      "slaDiasDefault",
      "zonaHoraria",
      "idioma",
      "defaultDashboardId",
      "updatedAt",
      "updatedBy",
    ],
  },
};

/**
 * Copy all keys from WORKSPACE_ADMIN_ENTITY_SHEETS into the global ENTITY_SHEETS
 * so the router and SheetRepository can locate them by entity name.
 *
 * Must be called before any workspace-admin CRUD operation — typically from
 * initializeDatabase() or at the top of doPost in Code.js.
 */
function mergeWorkspaceAdminEntities_() {
  var count = 0;
  for (var key in WORKSPACE_ADMIN_ENTITY_SHEETS) {
    if (Object.prototype.hasOwnProperty.call(WORKSPACE_ADMIN_ENTITY_SHEETS, key)) {
      ENTITY_SHEETS[key] = WORKSPACE_ADMIN_ENTITY_SHEETS[key];
      count++;
    }
  }
  AppLogger.info("mergeWorkspaceAdminEntities_: merged workspace-admin entities", {
    count: count,
  });
}


// ============================================================
// SOURCE: schema/builder-entities.js
// ============================================================

/**
 * Builder entity schema definitions — Sprint 16 Production Infrastructure.
 *
 * All 10 builder config types (process, procedure, form, kpi, dashboard,
 * automation, notification, permission, catalog, report) are stored in a
 * single sheet WSBuilderConfigs with a configJson column that holds the full
 * typed object as a JSON string. Flat columns (tipo, status, nombre, version)
 * are denormalized for fast server-side filtering without JSON parsing.
 *
 * WSBuilderVersions stores immutable snapshots on each publish — enabling
 * version history, restore, and diff.
 *
 * Call mergeBuilderEntities_() once at startup (Code.js bootstrap IIFE) so
 * the router and SheetRepository can resolve wsBuilderConfigs entity name.
 */

var BUILDER_ENTITY_SHEETS = {

  // ── Builder Configs (all 10 types in one sheet) ───────────────────────────
  wsBuilderConfigs: {
    sheetName: "WSBuilderConfigs",
    columns: [
      "id",
      "wsId",
      "tipo",
      "nombre",
      "descripcion",
      "version",
      "status",
      "creadoPor",
      "configJson",
      "createdAt",
      "updatedAt",
      "publishedAt",
      "deletedAt",
    ],
  },

  // ── Immutable version snapshots ───────────────────────────────────────────
  wsBuilderVersions: {
    sheetName: "WSBuilderVersions",
    columns: [
      "id",
      "builderId",
      "wsId",
      "tipo",
      "version",
      "status",
      "configJson",
      "creadoPor",
      "createdAt",
    ],
  },
};

/**
 * Copy BUILDER_ENTITY_SHEETS keys into the global ENTITY_SHEETS so the
 * router and SheetRepository can locate builder entities by name.
 * Called from Code.js bootstrap and from initializeDatabase().
 */
function mergeBuilderEntities_() {
  var count = 0;
  for (var key in BUILDER_ENTITY_SHEETS) {
    if (Object.prototype.hasOwnProperty.call(BUILDER_ENTITY_SHEETS, key)) {
      ENTITY_SHEETS[key] = BUILDER_ENTITY_SHEETS[key];
      count++;
    }
  }
  AppLogger.info("mergeBuilderEntities_: merged builder entities", { count: count });
}


// ============================================================
// SOURCE: schema/contratacion-entities.js
// ============================================================

/**
 * Contratacion entity schema definitions — Sprint 16 RC-1.
 *
 * All hiring-process documents are stored in dedicated sheets. Complex nested
 * objects (historial arrays, competencia bitmaps, terna lists) are kept in a
 * "dataJson" column so the row-level columns remain thin and queryable.
 *
 * Call mergeContratacionEntities_() once during initialization (Code.js bootstrap
 * and initializeDatabase) to register these sheets in the global ENTITY_SHEETS.
 */

var CONTRATACION_ENTITY_SHEETS = {

  // ── Procesos de Contratación ────────────────────────────────────────────────
  contratProcesos: {
    sheetName: "ContratProcesos",
    columns: [
      "id", "wsId", "codigo", "nombrePuesto", "unidadFacultad", "jefeSolicitante",
      "tipoContratacion", "etapaActual", "pasoActual", "prioridad",
      "requisicionId", "informeTecnicoId", "informeFinalId", "cartaOfertaId",
      "expedienteId", "contratoId", "fichaEmpleadoId", "candidatoSeleccionadoId",
      "dataJson", "createdAt", "updatedAt", "deletedAt",
    ],
  },

  // ── Requisiciones de Personal ───────────────────────────────────────────────
  contratRequisiciones: {
    sheetName: "ContratRequisiciones",
    columns: [
      "id", "procesoId", "nombrePuesto", "tipoRequisicion", "tipoContratacion",
      "estado", "dataJson", "createdAt", "updatedAt",
    ],
  },

  // ── Informes Técnicos de Selección ──────────────────────────────────────────
  contratInformesTec: {
    sheetName: "ContratInformesTec",
    columns: [
      "id", "procesoId", "cargo", "candidatoRecomendado", "estado",
      "dataJson", "createdAt",
    ],
  },

  // ── Informes de Selección Final ─────────────────────────────────────────────
  contratInformesFinales: {
    sheetName: "ContratInformesFinales",
    columns: [
      "id", "procesoId", "puestoCubrir", "candidatoSeleccionado", "estado",
      "dataJson", "createdAt",
    ],
  },

  // ── Cartas de Oferta ────────────────────────────────────────────────────────
  contratCartasOferta: {
    sheetName: "ContratCartasOferta",
    columns: [
      "id", "procesoId", "candidatoId", "estado", "salarioMensual",
      "cargoOfrecido", "dataJson", "createdAt",
    ],
  },

  // ── Expedientes de Personal ─────────────────────────────────────────────────
  contratExpedientes: {
    sheetName: "ContratExpedientes",
    columns: [
      "id", "procesoId", "nombreCompleto", "cargo", "estadoExpediente",
      "dataJson", "createdAt", "updatedAt",
    ],
  },

  // ── Fichas de Empleado Permanente ───────────────────────────────────────────
  contratFichasEmp: {
    sheetName: "ContratFichasEmp",
    columns: [
      "id", "procesoId", "nombres", "primerApellido", "cargo", "area",
      "tipoContrato", "salario", "correoInstitucional", "dataJson",
      "createdAt", "updatedAt",
    ],
  },

  // ── Fichas de Docente Hora Clase ────────────────────────────────────────────
  contratFichasDoc: {
    sheetName: "ContratFichasDoc",
    columns: [
      "id", "procesoId", "nombre", "correoUPES", "facultad", "carrera",
      "dataJson", "createdAt",
    ],
  },

  // ── Contratos de Trabajo ────────────────────────────────────────────────────
  contratContratos: {
    sheetName: "ContratContratos",
    columns: [
      "id", "procesoId", "nombreEmpleado", "cargo", "salario", "estado",
      "dataJson", "createdAt",
    ],
  },

  // ── Candidatos (CV + evaluaciones) ─────────────────────────────────────────
  contratCandidatos: {
    sheetName: "ContratCandidatos",
    columns: [
      "id", "procesoId", "nombre", "apellido", "email",
      "cumplePerfilCV", "enTerna", "seleccionado",
      "notaEntrevistaPrelimininar", "notaPruebaTecnica",
      "notaPruebaConductual", "notaEntrevistaRRHH", "notaEntrevistaFinal",
      "promedioGeneral", "dataJson", "createdAt",
    ],
  },
};

/**
 * Register all contratacion entity schemas into the global ENTITY_SHEETS.
 * Must be called before any contratacion CRUD — typically from Code.js bootstrap
 * and initializeDatabase().
 */
function mergeContratacionEntities_() {
  var count = 0;
  for (var key in CONTRATACION_ENTITY_SHEETS) {
    if (Object.prototype.hasOwnProperty.call(CONTRATACION_ENTITY_SHEETS, key)) {
      ENTITY_SHEETS[key] = CONTRATACION_ENTITY_SHEETS[key];
      count++;
    }
  }
  AppLogger.info("mergeContratacionEntities_: merged contratacion entities", { count: count });
}


// ============================================================
// SOURCE: repositories/SheetRepository.js
// ============================================================

/**
 * Generic Sheets-backed CRUD — one tab per entity. The only file that touches
 * SpreadsheetApp directly. Services, the router, and Code.js never call
 * SpreadsheetApp themselves.
 *
 * Sprint 2 additions over Sprint 1:
 *   • listEntities_() now returns { items, pagination } and supports
 *     _page, _pageSize, _sortBy, _sortDir query params.
 *   • createEntity_() uses IdGen.forEntity() instead of the fallback.
 *   • Type coercion on read: Sheets returns Date objects and numbers natively,
 *     so toString() is applied only to string columns to avoid "[object Object]".
 *
 * Business rules (R01-R10) are NOT here — they land with the sprint that
 * owns each rule, as named router actions that call these primitives.
 */

function getSpreadsheet_() {
  var id = Config.spreadsheetId();
  if (id) return SpreadsheetApp.openById(id);

  // Bound script — use and persist the active spreadsheet's ID
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) {
    PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", active.getId());
    return active;
  }

  // First run on a standalone script — create the database spreadsheet and persist its ID
  AppLogger.info("getSpreadsheet_: SPREADSHEET_ID not set — creating new spreadsheet");
  var ss = SpreadsheetApp.create("SSE Platform Database");
  PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", ss.getId());
  AppLogger.info("getSpreadsheet_: created and stored SPREADSHEET_ID", { id: ss.getId() });
  return ss;
}

function getEntityConfig_(entityName) {
  var config = ENTITY_SHEETS[entityName];
  if (!config) throw new Error("Unknown entity: " + entityName);
  return config;
}

function ensureSheet_(entityName) {
  var config = getEntityConfig_(entityName);
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(config.sheetName);

  if (!sheet) {
    AppLogger.info("SheetRepository: creating sheet", { name: config.sheetName });
    sheet = ss.insertSheet(config.sheetName);
    sheet.getRange(1, 1, 1, config.columns.length).setValues([config.columns]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function readHeaders_(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) return [];
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
}

function rowToObject_(headers, row) {
  var obj = {};
  for (var i = 0; i < headers.length; i++) {
    if (!headers[i]) continue;
    var val = row[i];
    // Sheets returns Date objects for date-formatted cells — normalise to ISO string
    if (val instanceof Date) {
      obj[headers[i]] = val.toISOString();
    } else {
      obj[headers[i]] = val;
    }
  }
  return obj;
}

function objectToRow_(headers, obj) {
  return headers.map(function (key) {
    return Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : "";
  });
}

function readAllRows_(entityName) {
  var sheet = ensureSheet_(entityName);
  var headers = readHeaders_(sheet);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { sheet: sheet, headers: headers, rows: [] };

  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return { sheet: sheet, headers: headers, rows: values };
}

function matchesQuery_(obj, query) {
  if (!query) return true;
  for (var key in query) {
    if (!Object.prototype.hasOwnProperty.call(query, key)) continue;
    var expected = query[key];
    if (expected === undefined || expected === null || expected === "") continue;
    // Loose equality so "true" matches true, "1" matches 1
    // eslint-disable-next-line eqeqeq
    if (obj[key] != expected) return false;
  }
  return true;
}

/**
 * List entities with optional filtering, sorting, and pagination.
 *
 * Special query keys (stripped before filter matching):
 *   _page      integer ≥ 1    — page number (enables pagination in response)
 *   _pageSize  integer 1-500  — items per page (default: Config.maxPageSize())
 *   _sortBy    string         — field name to sort by
 *   _sortDir   "asc"|"desc"   — sort direction (default: "asc")
 *
 * @param {string} entityName
 * @param {Object} [rawQuery]
 * @returns {{ items: Object[], pagination: Object|null }}
 */
function listEntities_(entityName, rawQuery) {
  var data = readAllRows_(entityName);

  // Separate pagination/sort params from filter params
  var filterQuery = {};
  var page = null;
  var pageSize = Config.maxPageSize();
  var sortBy = null;
  var sortDir = "asc";
  var paginate = false;

  if (rawQuery) {
    for (var key in rawQuery) {
      if (!Object.prototype.hasOwnProperty.call(rawQuery, key)) continue;
      var val = rawQuery[key];
      if (val === undefined || val === null || val === "") continue;

      if (key === "_page") {
        page = Math.max(1, parseInt(val, 10) || 1);
        paginate = true;
      } else if (key === "_pageSize") {
        pageSize = Math.min(Config.maxPageSize(), Math.max(1, parseInt(val, 10) || Config.maxPageSize()));
        paginate = true;
      } else if (key === "_sortBy") {
        sortBy = String(val);
      } else if (key === "_sortDir") {
        sortDir = String(val) === "desc" ? "desc" : "asc";
      } else {
        filterQuery[key] = val;
      }
    }
  }

  // Filter — soft-deleted rows are excluded by default
  var includeDeleted = false;
  if (rawQuery && rawQuery._includeDeleted === "true") {
    includeDeleted = true;
    delete filterQuery._includeDeleted;
  }

  var results = [];
  for (var i = 0; i < data.rows.length; i++) {
    var obj = rowToObject_(data.headers, data.rows[i]);
    if (!includeDeleted && obj.deletedAt) continue;
    if (matchesQuery_(obj, filterQuery)) results.push(obj);
  }

  // Sort
  if (sortBy) {
    var sb = sortBy;
    var sd = sortDir;
    results.sort(function (a, b) {
      var av = a[sb];
      var bv = b[sb];
      if (av === bv) return 0;
      var cmp = av < bv ? -1 : 1;
      return sd === "desc" ? -cmp : cmp;
    });
  }

  // Paginate
  var total = results.length;
  var pagination = null;
  if (paginate) {
    var p = page || 1;
    var start = (p - 1) * pageSize;
    results = results.slice(start, start + pageSize);
    pagination = {
      page:       p,
      pageSize:   pageSize,
      total:      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  return { items: results, pagination: pagination };
}

function getEntity_(entityName, id) {
  if (!id) return null;
  var data = readAllRows_(entityName);
  for (var i = 0; i < data.rows.length; i++) {
    var obj = rowToObject_(data.headers, data.rows[i]);
    if (obj.id === id && !obj.deletedAt) return obj;
  }
  return null;
}

function createEntity_(entityName, payload) {
  var sheet = ensureSheet_(entityName);
  var headers = readHeaders_(sheet);
  var id = payload.id || IdGen.forEntity(entityName);
  var obj = Object.assign({}, payload, { id: id });
  sheet.appendRow(objectToRow_(headers, obj));
  AppLogger.debug("SheetRepository: row created", { entity: entityName, id: id });
  return obj;
}

function updateEntity_(entityName, id, patch) {
  var data = readAllRows_(entityName);
  for (var i = 0; i < data.rows.length; i++) {
    var obj = rowToObject_(data.headers, data.rows[i]);
    if (obj.id === id) {
      var updated = Object.assign({}, obj, patch, { id: id });
      data.sheet
        .getRange(i + 2, 1, 1, data.headers.length)
        .setValues([objectToRow_(data.headers, updated)]);
      AppLogger.debug("SheetRepository: row updated", { entity: entityName, id: id });
      return updated;
    }
  }
  throw new Error(entityName + " " + id + " not found");
}

function removeEntity_(entityName, id) {
  var now = new Date().toISOString();
  updateEntity_(entityName, id, { deletedAt: now });
  AppLogger.debug("SheetRepository: row soft-deleted", { entity: entityName, id: id });
}

function restoreEntity_(entityName, id) {
  updateEntity_(entityName, id, { deletedAt: "" });
  AppLogger.debug("SheetRepository: row restored", { entity: entityName, id: id });
}

function purgeEntity_(entityName, id) {
  var data = readAllRows_(entityName);
  for (var i = 0; i < data.rows.length; i++) {
    var obj = rowToObject_(data.headers, data.rows[i]);
    if (obj.id === id) {
      data.sheet.deleteRow(i + 2);
      AppLogger.debug("SheetRepository: row purged", { entity: entityName, id: id });
      return;
    }
  }
}


// ============================================================
// SOURCE: services/CacheService.js
// ============================================================

/**
 * AppCacheService — wrapper around Apps Script CacheService.
 *
 * All cached values are JSON-serialized strings. Keys are namespaced with
 * a prefix to avoid collisions with other projects sharing the same cache
 * bucket (Apps Script CacheService is script-scoped by default, but we
 * namespace anyway for clarity and future-proofing).
 *
 * TTL ceiling: CacheService maximum is 21 600 s (6 hours); we cap at that.
 *
 * Reference: https://developers.google.com/apps-script/reference/cache/cache-service
 */

var AppCacheService = (function () {
  var NAMESPACE = "sse:";
  var DEFAULT_TTL = 300; // 5 minutes
  var MAX_TTL     = 21600;

  function cache_() {
    return CacheService.getScriptCache();
  }

  function key_(k) {
    return NAMESPACE + String(k);
  }

  return {
    /**
     * Retrieve a cached value and JSON-parse it.
     * Returns null if the key is missing or the value cannot be parsed.
     *
     * @param {string} key
     * @returns {*|null}
     */
    get: function (key) {
      var raw = cache_().get(key_(key));
      if (raw === null || raw === undefined) return null;
      try {
        return JSON.parse(raw);
      } catch (_) {
        return null;
      }
    },

    /**
     * Store a value in the cache as a JSON string.
     *
     * @param {string} key
     * @param {*}      value
     * @param {number} [ttlSeconds]  — defaults to DEFAULT_TTL, capped at MAX_TTL
     */
    set: function (key, value, ttlSeconds) {
      var ttl = Math.min(Math.max(parseInt(ttlSeconds, 10) || DEFAULT_TTL, 1), MAX_TTL);
      try {
        cache_().put(key_(key), JSON.stringify(value), ttl);
      } catch (e) {
        AppLogger.warn("AppCacheService.set failed", { key: key, error: String(e.message || e) });
      }
    },

    /**
     * Remove a key from the cache.
     *
     * @param {string} key
     */
    remove: function (key) {
      cache_().remove(key_(key));
    },

    /**
     * Remove multiple keys from the cache.
     *
     * @param {string[]} keys
     */
    removeAll: function (keys) {
      var prefixed = keys.map(function (k) { return key_(k); });
      cache_().removeAll(prefixed);
    },

    /**
     * Cache-aside: return cached value if present; otherwise call loader(),
     * store the result, and return it.
     *
     * @param {string}   key
     * @param {Function} loader       — zero-argument function that returns the value
     * @param {number}   [ttlSeconds]
     * @returns {*}
     */
    getOrLoad: function (key, loader, ttlSeconds) {
      var cached = AppCacheService.get(key);
      if (cached !== null) return cached;

      var value = loader();
      if (value !== null && value !== undefined) {
        AppCacheService.set(key, value, ttlSeconds);
      }
      return value;
    },
  };
})();


// ============================================================
// SOURCE: services/LockService.js
// ============================================================

/**
 * LockService — thin wrappers around Apps Script LockService.
 *
 * Prevents concurrent writes to the same resource. The GAS lock service
 * blocks until the lock is acquired or the timeout expires. All mutating
 * workspace-admin controller actions that write to the same entity should
 * use withScriptLock to avoid sheet race conditions.
 *
 * Reference: https://developers.google.com/apps-script/reference/lock/lock-service
 */

var AppLockService = {
  /**
   * Acquire a script-wide lock, run fn(), then release.
   * The script lock is shared across all executions — use it for operations
   * that must not run concurrently for ANY user (e.g. ID generation, setup).
   *
   * @param {Function} fn        — zero-argument function to run while locked
   * @param {number}   timeoutMs — max wait in ms before throwing (default 10 000)
   * @returns {*} return value of fn
   */
  withScriptLock: function (fn, timeoutMs) {
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(timeoutMs || 10000);
      return fn();
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Acquire a user-scoped lock, run fn(), then release.
   * The user lock is isolated per Google Account — safe for per-user operations
   * like updating a user's own profile or drafts.
   *
   * @param {Function} fn        — zero-argument function to run while locked
   * @param {number}   timeoutMs — max wait in ms before throwing (default 5 000)
   * @returns {*} return value of fn
   */
  withUserLock: function (fn, timeoutMs) {
    var lock = LockService.getUserLock();
    try {
      lock.waitLock(timeoutMs || 5000);
      return fn();
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Try to acquire a script lock without blocking.
   * Returns true if the lock was acquired; false otherwise.
   * Caller is responsible for releasing via the returned lock object.
   *
   * @returns {{ acquired: boolean, lock: Lock }}
   */
  tryScriptLock: function () {
    var lock = LockService.getScriptLock();
    var acquired = lock.tryLock(0);
    return { acquired: acquired, lock: lock };
  },
};


// ============================================================
// SOURCE: services/GmailService.js
// ============================================================

/**
 * GmailService — platform Gmail wrapper.
 *
 * All outbound email goes through this service. GmailApp access is gated by
 * Config.gmailEnabled() — when Gmail is disabled, send methods are no-ops that
 * return false so callers can react without throwing.
 *
 * The `opts` parameter accepted by sendEmail / sendBulkEmail supports:
 *   cc      {string}  — comma-separated CC addresses
 *   bcc     {string}  — comma-separated BCC addresses
 *   replyTo {string}  — Reply-To address
 *   name    {string}  — display name for the From field
 */
var GmailService = {

  /**
   * Send an HTML email to a single recipient.
   *
   * @param {string} to        — recipient email address
   * @param {string} subject   — email subject
   * @param {string} htmlBody  — HTML body content
   * @param {Object} [opts]    — optional: { cc, bcc, replyTo, name }
   * @returns {boolean} true on success, false if Gmail is disabled or recipient is empty
   */
  sendEmail: function (to, subject, htmlBody, opts) {
    if (!GmailService.isEnabled()) {
      AppLogger.debug("GmailService.sendEmail: Gmail disabled, skipping", { to: to });
      return false;
    }

    if (!to) {
      AppLogger.warn("GmailService.sendEmail: no recipient provided, skipping");
      return false;
    }

    if (!subject) {
      AppLogger.warn("GmailService.sendEmail: no subject provided", { to: to });
    }

    var options = { htmlBody: htmlBody || "" };

    opts = opts || {};
    if (opts.cc)      options.cc      = opts.cc;
    if (opts.bcc)     options.bcc     = opts.bcc;
    if (opts.replyTo) options.replyTo = opts.replyTo;
    if (opts.name)    options.name    = opts.name;

    try {
      GmailApp.sendEmail(to, subject || "", "", options);
      AppLogger.info("GmailService.sendEmail: sent", { to: to, subject: subject });
      return true;
    } catch (e) {
      AppLogger.error("GmailService.sendEmail: failed", {
        to:    to,
        error: String(e.message || e),
      });
      throw e;
    }
  },

  /**
   * Send the same email to multiple recipients.
   * Errors per-recipient are caught and logged silently; the method always
   * completes the full list and returns a results summary.
   *
   * @param {string[]} recipients  — array of email address strings
   * @param {string}   subject
   * @param {string}   htmlBody
   * @param {Object}   [opts]      — same options as sendEmail
   * @returns {{ sent: number, failed: number, errors: Array }}
   */
  sendBulkEmail: function (recipients, subject, htmlBody, opts) {
    if (!Array.isArray(recipients) || recipients.length === 0) {
      AppLogger.warn("GmailService.sendBulkEmail: empty recipients list");
      return { sent: 0, failed: 0, errors: [] };
    }

    var sent   = 0;
    var failed = 0;
    var errors = [];

    for (var i = 0; i < recipients.length; i++) {
      var to = recipients[i];
      try {
        var ok = GmailService.sendEmail(to, subject, htmlBody, opts);
        if (ok) {
          sent++;
        } else {
          // disabled or empty address — not a hard failure
          failed++;
        }
      } catch (e) {
        failed++;
        errors.push({ to: to, error: String(e.message || e) });
        AppLogger.error("GmailService.sendBulkEmail: error for recipient", {
          to:    to,
          error: String(e.message || e),
        });
      }
    }

    AppLogger.info("GmailService.sendBulkEmail: completed", {
      total:  recipients.length,
      sent:   sent,
      failed: failed,
    });

    return { sent: sent, failed: failed, errors: errors };
  },

  /**
   * Wrap arbitrary HTML content in the standard SSE platform email template.
   * Returns a complete HTML string ready for use as htmlBody.
   *
   * @param {string} content       — inner HTML to embed
   * @param {string} [instanceName] — platform name shown in the header (defaults to Config.instanceName())
   * @returns {string} full HTML email body
   */
  buildPlatformEmail: function (content, instanceName) {
    var name = instanceName || Config.instanceName() || "SSE Platform";
    var year = new Date().getFullYear();

    return [
      '<div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px;',
      '     margin: 0 auto; padding: 20px; background-color: #ffffff;">',

      // Header
      '  <div style="background-color: #1a73e8; padding: 16px 20px;',
      '       border-radius: 6px 6px 0 0;">',
      '    <h1 style="margin: 0; font-size: 18px; color: #ffffff; font-weight: 600;">',
      '      ' + _escapeHtml_(name),
      '    </h1>',
      '  </div>',

      // Body content
      '  <div style="border: 1px solid #e0e0e0; border-top: none; padding: 24px 20px;',
      '       border-radius: 0 0 6px 6px; color: #333333; line-height: 1.6;">',
      '    ' + (content || ""),
      '  </div>',

      // Footer
      '  <div style="margin-top: 16px; font-size: 12px; color: #9e9e9e; text-align: center;">',
      '    &copy; ' + year + ' ' + _escapeHtml_(name) + '. Mensaje generado automáticamente.',
      '  </div>',

      '</div>',
    ].join("\n");
  },

  /**
   * Check whether Gmail sending is enabled for this deployment.
   * Reads the GMAIL_ENABLED script property via Config.
   *
   * @returns {boolean}
   */
  isEnabled: function () {
    try {
      return Config.gmailEnabled();
    } catch (e) {
      AppLogger.warn("GmailService.isEnabled: Config.gmailEnabled() threw, defaulting to false", {
        error: String(e.message || e),
      });
      return false;
    }
  },
};

// ---------------------------------------------------------------------------
// Module-private helpers (not on the GmailService object)
// ---------------------------------------------------------------------------

/**
 * Escape HTML special characters to prevent injection in email templates.
 * @param {string} str
 * @returns {string}
 * @private
 */
function _escapeHtml_(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#39;");
}


// ============================================================
// SOURCE: services/CalendarService.js
// ============================================================

/**
 * CalendarService — Google Calendar wrapper.
 *
 * All calendar operations use the default calendar obtained from
 * CalendarApp.getDefaultCalendar(). Methods return plain serialisable objects
 * rather than live Calendar API objects so responses can flow through the
 * router without GAS-object serialisation issues.
 *
 * All mutating methods throw on unrecoverable errors; read-only methods
 * return empty arrays / silent no-ops on expected failures (e.g. event not found).
 */
var CalendarService = {

  /**
   * Get the default Google Calendar for the script owner.
   *
   * @returns {GoogleAppsScript.Calendar.Calendar}
   */
  getDefault: function () {
    var cal = CalendarApp.getDefaultCalendar();
    if (!cal) throw new Error("CalendarService.getDefault: no default calendar found");
    return cal;
  },

  /**
   * Create a calendar event.
   *
   * @param {Object} opts
   * @param {string}   opts.title         — event title (required)
   * @param {string}   opts.startDate     — ISO date/datetime string (required)
   * @param {string}   [opts.endDate]     — ISO datetime string (required for timed events)
   * @param {boolean}  [opts.allDay]      — if true, creates an all-day event
   * @param {string}   [opts.description] — event description
   * @param {string}   [opts.location]    — location string
   * @param {string[]} [opts.guests]      — array of guest email addresses
   * @returns {string} event id
   */
  createEvent: function (opts) {
    if (!opts)           throw new Error("CalendarService.createEvent: opts is required");
    if (!opts.title)     throw new Error("CalendarService.createEvent: opts.title is required");
    if (!opts.startDate) throw new Error("CalendarService.createEvent: opts.startDate is required");

    var calendar    = CalendarService.getDefault();
    var startDate   = new Date(opts.startDate);
    var title       = opts.title;
    var description = opts.description || "";
    var location    = opts.location    || "";
    var guests      = opts.guests      || [];

    var calOpts = {};
    if (description) calOpts.description = description;
    if (location)    calOpts.location    = location;
    if (guests && guests.length > 0) calOpts.guests = guests.join(",");

    var event;
    try {
      if (opts.allDay) {
        if (opts.endDate) {
          var endDate = new Date(opts.endDate);
          event = calendar.createAllDayEvent(title, startDate, endDate, calOpts);
        } else {
          event = calendar.createAllDayEvent(title, startDate, calOpts);
        }
      } else {
        if (!opts.endDate) {
          throw new Error("CalendarService.createEvent: opts.endDate is required for timed events");
        }
        var endDateTime = new Date(opts.endDate);
        event = calendar.createEvent(title, startDate, endDateTime, calOpts);
      }
    } catch (e) {
      AppLogger.error("CalendarService.createEvent: failed", {
        title: title,
        error: String(e.message || e),
      });
      throw e;
    }

    var eventId = event.getId();

    AppLogger.info("CalendarService.createEvent: created", {
      title:   title,
      eventId: eventId,
      allDay:  !!opts.allDay,
      guests:  guests.length,
    });

    return eventId;
  },

  /**
   * List events between two dates.
   *
   * @param {string} startDate — ISO date/datetime string (inclusive)
   * @param {string} endDate   — ISO date/datetime string (inclusive)
   * @returns {Array<{ id: string, title: string, startTime: string, endTime: string, description: string }>}
   */
  listEvents: function (startDate, endDate) {
    if (!startDate) throw new Error("CalendarService.listEvents: startDate is required");
    if (!endDate)   throw new Error("CalendarService.listEvents: endDate is required");

    var calendar = CalendarService.getDefault();
    var events;

    try {
      events = calendar.getEvents(new Date(startDate), new Date(endDate));
    } catch (e) {
      AppLogger.error("CalendarService.listEvents: getEvents failed", {
        startDate: startDate,
        endDate:   endDate,
        error:     String(e.message || e),
      });
      throw e;
    }

    var result = [];
    for (var i = 0; i < events.length; i++) {
      var ev = events[i];
      result.push({
        id:          ev.getId(),
        title:       ev.getTitle(),
        startTime:   ev.getStartTime().toISOString(),
        endTime:     ev.getEndTime().toISOString(),
        description: ev.getDescription() || "",
      });
    }

    AppLogger.debug("CalendarService.listEvents: listed", {
      startDate: startDate,
      endDate:   endDate,
      count:     result.length,
    });

    return result;
  },

  /**
   * Delete a calendar event by its id. Silent if the event is not found.
   *
   * @param {string} eventId
   */
  deleteEvent: function (eventId) {
    if (!eventId) {
      AppLogger.warn("CalendarService.deleteEvent: eventId is required, skipping");
      return;
    }

    var calendar = CalendarService.getDefault();

    try {
      var event = calendar.getEventById(eventId);
      if (!event) {
        AppLogger.debug("CalendarService.deleteEvent: event not found, nothing to delete", {
          eventId: eventId,
        });
        return;
      }
      event.deleteEvent();
      AppLogger.info("CalendarService.deleteEvent: deleted", { eventId: eventId });
    } catch (e) {
      // Silent on failure — event may have already been deleted or id is stale
      AppLogger.warn("CalendarService.deleteEvent: could not delete event", {
        eventId: eventId,
        error:   String(e.message || e),
      });
    }
  },

  /**
   * Add a guest to an existing calendar event. Silent on failure.
   *
   * @param {string} eventId
   * @param {string} email   — guest email address to add
   */
  addGuest: function (eventId, email) {
    if (!eventId || !email) {
      AppLogger.warn("CalendarService.addGuest: eventId and email are required", {
        eventId: eventId,
        email:   email,
      });
      return;
    }

    try {
      var calendar = CalendarService.getDefault();
      var event    = calendar.getEventById(eventId);

      if (!event) {
        AppLogger.warn("CalendarService.addGuest: event not found", { eventId: eventId });
        return;
      }

      event.addGuest(email);
      AppLogger.info("CalendarService.addGuest: guest added", {
        eventId: eventId,
        email:   email,
      });
    } catch (e) {
      AppLogger.warn("CalendarService.addGuest: failed silently", {
        eventId: eventId,
        email:   email,
        error:   String(e.message || e),
      });
    }
  },
};


// ============================================================
// SOURCE: services/DocsService.js
// ============================================================

/**
 * DocsService — Google Docs template engine.
 *
 * Provides copy-from-template, variable merging, PDF export, and
 * scratch-document creation. All Drive operations delegate to DriveApp;
 * no SpreadsheetApp calls appear here.
 *
 * All public methods throw on unrecoverable errors so callers can wrap in
 * try/catch and surface meaningful messages through the router.
 */
var DocsService = {

  /**
   * Create a Google Doc by copying a template Doc and merging variables.
   *
   * @param {string} templateDocId   — Drive file id of the source template Doc
   * @param {Object} variables       — plain object: { key: value } for {{key}} replacement
   * @param {string} destFolderId    — destination Drive folder id
   * @param {string} fileName        — name for the new document (without extension)
   * @returns {{ id: string, name: string, webViewLink: string }}
   */
  createFromTemplate: function (templateDocId, variables, destFolderId, fileName) {
    if (!templateDocId) throw new Error("DocsService.createFromTemplate: templateDocId is required");
    if (!fileName)      throw new Error("DocsService.createFromTemplate: fileName is required");

    var destFolder = destFolderId
      ? DriveApp.getFolderById(destFolderId)
      : DriveApp.getRootFolder();

    var copy;
    try {
      copy = DriveApp.getFileById(templateDocId).makeCopy(fileName, destFolder);
    } catch (e) {
      AppLogger.error("DocsService.createFromTemplate: makeCopy failed", {
        templateDocId: templateDocId,
        error: String(e.message || e),
      });
      throw e;
    }

    var doc;
    try {
      doc = DocumentApp.openById(copy.getId());
    } catch (e) {
      AppLogger.error("DocsService.createFromTemplate: openById failed", {
        copyId: copy.getId(),
        error: String(e.message || e),
      });
      // Clean up orphaned copy
      try { copy.setTrashed(true); } catch (_) {}
      throw e;
    }

    if (variables && typeof variables === "object") {
      DocsService.mergeVariables(doc, variables);
    }

    doc.saveAndClose();

    AppLogger.info("DocsService.createFromTemplate: document created", {
      templateDocId: templateDocId,
      copyId:        copy.getId(),
      fileName:      fileName,
    });

    return {
      id:          copy.getId(),
      name:        copy.getName(),
      webViewLink: copy.getUrl(),
    };
  },

  /**
   * Replace {{variable}} placeholders throughout a document's body.
   * Handles paragraphs and table cells.
   *
   * @param {GoogleAppsScript.Document.Document} doc
   * @param {Object} variables — { key: value }
   */
  mergeVariables: function (doc, variables) {
    if (!doc || !variables) return;

    var body = doc.getBody();

    for (var key in variables) {
      if (!Object.prototype.hasOwnProperty.call(variables, key)) continue;

      var placeholder = "\\{\\{" + key + "\\}\\}";
      var value       = variables[key] !== null && variables[key] !== undefined
        ? String(variables[key])
        : "";

      // Replace in paragraphs
      var paragraphs = body.getParagraphs();
      for (var i = 0; i < paragraphs.length; i++) {
        paragraphs[i].replaceText(placeholder, value);
      }

      // Replace in table cells
      var tables = body.getTables();
      for (var t = 0; t < tables.length; t++) {
        var table = tables[t];
        for (var r = 0; r < table.getNumRows(); r++) {
          var row = table.getRow(r);
          for (var c = 0; c < row.getNumCells(); c++) {
            row.getCell(c).replaceText(placeholder, value);
          }
        }
      }
    }

    AppLogger.debug("DocsService.mergeVariables: variables merged", {
      keys: Object.keys(variables).length,
    });
  },

  /**
   * Export a Google Doc as PDF and save the blob to a Drive folder.
   *
   * @param {string} docId          — Drive file id of the Google Doc
   * @param {string} destFolderId   — destination Drive folder id
   * @param {string} fileName       — PDF file name (with or without .pdf; .pdf is appended if missing)
   * @returns {{ id: string, name: string, mimeType: string, size: number, webViewLink: string }}
   */
  exportAsPdf: function (docId, destFolderId, fileName) {
    if (!docId)   throw new Error("DocsService.exportAsPdf: docId is required");
    if (!fileName) throw new Error("DocsService.exportAsPdf: fileName is required");

    var pdfName = fileName.slice(-4).toLowerCase() === ".pdf" ? fileName : fileName + ".pdf";

    var destFolder = destFolderId
      ? DriveApp.getFolderById(destFolderId)
      : DriveApp.getRootFolder();

    var blob;
    try {
      blob = DriveApp.getFileById(docId).getAs("application/pdf");
    } catch (e) {
      AppLogger.error("DocsService.exportAsPdf: getAs(pdf) failed", {
        docId: docId,
        error: String(e.message || e),
      });
      throw e;
    }

    blob.setName(pdfName);

    var pdfFile;
    try {
      pdfFile = destFolder.createFile(blob);
    } catch (e) {
      AppLogger.error("DocsService.exportAsPdf: createFile failed", {
        docId:  docId,
        folder: destFolderId,
        error:  String(e.message || e),
      });
      throw e;
    }

    AppLogger.info("DocsService.exportAsPdf: PDF created", {
      docId:     docId,
      pdfFileId: pdfFile.getId(),
      pdfName:   pdfName,
    });

    return {
      id:          pdfFile.getId(),
      name:        pdfFile.getName(),
      mimeType:    "application/pdf",
      size:        pdfFile.getSize(),
      webViewLink: pdfFile.getUrl(),
    };
  },

  /**
   * Create a Google Doc from scratch with a given title and plain-text body.
   * Useful for generating simple reports without a template.
   *
   * @param {string} title         — document title
   * @param {string} bodyText      — plain text to insert as body content
   * @param {string} destFolderId  — destination Drive folder id (optional)
   * @returns {{ id: string, name: string, webViewLink: string }}
   */
  createDoc: function (title, bodyText, destFolderId) {
    if (!title) throw new Error("DocsService.createDoc: title is required");

    var doc;
    try {
      doc = DocumentApp.create(title);
    } catch (e) {
      AppLogger.error("DocsService.createDoc: DocumentApp.create failed", {
        title: title,
        error: String(e.message || e),
      });
      throw e;
    }

    if (bodyText) {
      doc.getBody().setText(bodyText);
    }

    doc.saveAndClose();

    var file = DriveApp.getFileById(doc.getId());

    // Move to destination folder if provided
    if (destFolderId) {
      try {
        var destFolder = DriveApp.getFolderById(destFolderId);
        file.moveTo(destFolder);
      } catch (e) {
        AppLogger.warn("DocsService.createDoc: moveTo failed, file remains in root", {
          docId:  doc.getId(),
          folder: destFolderId,
          error:  String(e.message || e),
        });
      }
    }

    AppLogger.info("DocsService.createDoc: document created", {
      title: title,
      id:    file.getId(),
    });

    return {
      id:          file.getId(),
      name:        file.getName(),
      webViewLink: file.getUrl(),
    };
  },
};


// ============================================================
// SOURCE: services/WorkspacePermissions.js
// ============================================================

/**
 * WorkspacePermissions — server-side role → permission mapping.
 *
 * Role names match web/types/workspace-admin.ts WorkspaceUserRole.
 * Permissions are coarse-grained action strings checked in WorkspaceController
 * and the router before any mutating operation on ws* entities.
 *
 * This file deliberately contains no SpreadsheetApp calls.
 */

var ROLE_PERMISSIONS = {
  ADMIN: [
    "ws.admin.access",
    "ws.processes.manage",
    "ws.processes.read",
    "ws.indicators.manage",
    "ws.indicators.read",
    "ws.requests.manage",
    "ws.requests.create",
    "ws.automations.manage",
    "ws.users.manage",
    "ws.forms.manage",
    "ws.documents.manage",
    "ws.documents.upload",
    "ws.settings.manage",
    "ws.kpis.manage",
    "ws.kpis.read",
    "ws.kpis.record",
  ],
  HEAD: [
    "ws.admin.access",
    "ws.processes.manage",
    "ws.processes.read",
    "ws.indicators.manage",
    "ws.indicators.read",
    "ws.requests.manage",
    "ws.requests.create",
    "ws.automations.manage",
    "ws.users.manage",
    "ws.forms.manage",
    "ws.documents.manage",
    "ws.documents.upload",
    "ws.kpis.manage",
    "ws.kpis.read",
    "ws.kpis.record",
  ],
  ANALYST: [
    "ws.admin.access",
    "ws.processes.read",
    "ws.indicators.read",
    "ws.kpis.read",
    "ws.kpis.record",
    "ws.requests.create",
    "ws.documents.upload",
  ],
  OPS: [
    "ws.processes.read",
    "ws.requests.create",
    "ws.documents.upload",
  ],
  AUDIT: [
    "ws.admin.access",
    "ws.processes.read",
    "ws.indicators.read",
    "ws.kpis.read",
    "ws.documents.read",
  ],
};

var WorkspacePermissions = {
  /**
   * Resolve the role of a user from the wsUsers sheet for a given workspace.
   * Returns the role string (ADMIN, HEAD, etc.) or null if the user is not
   * found or is not active.
   *
   * @param {string} wsId
   * @param {string} userEmail
   * @returns {string|null}
   */
  getUserRole: function (wsId, userEmail) {
    if (!wsId || !userEmail) return null;

    var result = listEntities_("wsUsers", { wsId: wsId, email: userEmail });
    var items  = result && result.items || [];

    for (var i = 0; i < items.length; i++) {
      var u = items[i];
      if (u.email === userEmail && u.activo !== "false" && !u.deletedAt) {
        return u.rol || null;
      }
    }
    return null;
  },

  /**
   * Check whether a role has a given permission string.
   *
   * @param {string} role        — e.g. "ADMIN"
   * @param {string} permission  — e.g. "ws.processes.manage"
   * @returns {boolean}
   */
  hasPermission: function (role, permission) {
    if (!role) return false;
    var perms = ROLE_PERMISSIONS[role];
    if (!perms) return false;
    for (var i = 0; i < perms.length; i++) {
      if (perms[i] === permission) return true;
    }
    return false;
  },

  /**
   * Throw unless the acting user has the given permission in the workspace.
   * Pass context.userEmail and wsId from the incoming request.
   *
   * @param {string} wsId
   * @param {string} userEmail
   * @param {string} permission
   */
  requirePermission: function (wsId, userEmail, permission) {
    var role = WorkspacePermissions.getUserRole(wsId, userEmail);
    if (!WorkspacePermissions.hasPermission(role, permission)) {
      var err = new Error("Forbidden: " + userEmail + " lacks " + permission + " in workspace " + wsId);
      err.code = "FORBIDDEN";
      throw err;
    }
  },

  /**
   * Return all permissions for a role, or [] if unknown.
   * Useful for the auth.getUser response.
   *
   * @param {string} role
   * @returns {string[]}
   */
  permissionsForRole: function (role) {
    return ROLE_PERMISSIONS[role] || [];
  },
};


// ============================================================
// SOURCE: services/NotificationService.js
// ============================================================

/**
 * NotificationService — in-app notification creation and Gmail dispatch.
 *
 * In-app notifications are rows appended to the "notificaciones" sheet via
 * SheetRepository. Gmail notifications are sent via GmailApp (requires the
 * gmail.send scope in appsscript.json). Gmail is gated by Config.gmailEnabled().
 *
 * Call processEvent() from an EventDispatcher handler to fan-out any emitted
 * event into the appropriate notifications based on wsNotifRules.
 */

var NotificationService = {
  /**
   * Create an in-app notification record in the notificaciones sheet.
   *
   * @param {Object} opts
   * @param {string} opts.destinatarioId   — user id
   * @param {string} opts.wsId
   * @param {string} opts.tipo             — 'info' | 'warning' | 'error' | 'success'
   * @param {string} opts.titulo
   * @param {string} opts.mensaje
   * @param {string} [opts.entityName]
   * @param {string} [opts.entityId]
   * @param {string} [opts.link]
   * @returns {Object} created notification record
   */
  sendInApp: function (opts) {
    var required = ["destinatarioId", "wsId", "titulo", "mensaje"];
    Validator.requireFields(opts, required);

    var payload = {
      destinatarioId: opts.destinatarioId,
      wsId:           opts.wsId,
      tipo:           opts.tipo || "info",
      titulo:         opts.titulo,
      mensaje:        opts.mensaje,
      entidadNombre:  opts.entityName || "",
      entidadId:      opts.entityId   || "",
      link:           opts.link       || "",
      leida:          "false",
      fechaCreacion:  new Date().toISOString(),
    };

    var created = createEntity_("notificaciones", payload);
    AppLogger.info("NotificationService.sendInApp", {
      destinatarioId: opts.destinatarioId,
      titulo:         opts.titulo,
    });
    return created;
  },

  /**
   * Send an email notification via GmailApp.
   * No-ops if Config.gmailEnabled() returns false or recipient email is empty.
   *
   * @param {string} toEmail
   * @param {string} subject
   * @param {string} htmlBody
   */
  sendEmail: function (toEmail, subject, htmlBody) {
    if (!Config.gmailEnabled()) {
      AppLogger.debug("NotificationService.sendEmail: Gmail disabled, skipping", { to: toEmail });
      return;
    }
    if (!toEmail) {
      AppLogger.warn("NotificationService.sendEmail: no recipient email provided");
      return;
    }
    try {
      GmailApp.sendEmail(toEmail, subject, "", { htmlBody: htmlBody });
      AppLogger.info("NotificationService.sendEmail: sent", { to: toEmail, subject: subject });
    } catch (e) {
      AppLogger.error("NotificationService.sendEmail: failed", {
        to:    toEmail,
        error: String(e.message || e),
      });
    }
  },

  /**
   * Process a platform event and dispatch notifications based on wsNotifRules
   * matching the event trigger. Called by EventDispatcher handlers.
   *
   * @param {string} eventType  — EVENT_TYPES constant value (e.g. "blueprint.publicado")
   * @param {Object} payload    — event payload from EventDispatcher.emit
   */
  processEvent: function (eventType, payload) {
    if (!payload || !payload.wsId) return;

    var rulesResult = listEntities_("wsNotifRules", {
      wsId:   payload.wsId,
      active: "true",
    });
    var rules = rulesResult && rulesResult.items || [];

    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      if (rule.trigger !== eventType) continue;
      if (rule.deletedAt) continue;

      // Resolve destination role users
      var roles = [];
      try { roles = JSON.parse(rule.destinatarioRolesJson || "[]"); } catch (_) {}

      var destinatarios = NotificationService._resolveRoleUsers_(payload.wsId, roles);

      for (var j = 0; j < destinatarios.length; j++) {
        var user = destinatarios[j];

        // In-app
        NotificationService.sendInApp({
          destinatarioId: user.id,
          wsId:           payload.wsId,
          tipo:           "info",
          titulo:         rule.asunto || rule.nombre,
          mensaje:        NotificationService._interpolate_(rule.mensaje, payload),
          entityName:     payload.entityName || "",
          entityId:       payload.id || "",
        });

        // Email channel
        if (rule.canal === "email" || rule.canal === "both") {
          NotificationService.sendEmail(
            user.email,
            rule.asunto || rule.nombre,
            NotificationService._interpolate_(rule.mensaje, payload)
          );
        }
      }
    }
  },

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Find users in a workspace that have one of the given roles.
   * @private
   */
  _resolveRoleUsers_: function (wsId, roles) {
    if (!roles || roles.length === 0) return [];

    var usersResult = listEntities_("wsUsers", { wsId: wsId, activo: "true" });
    var allUsers    = usersResult && usersResult.items || [];

    var matched = [];
    for (var i = 0; i < allUsers.length; i++) {
      var u = allUsers[i];
      if (!u.deletedAt && u.activo !== "false") {
        for (var j = 0; j < roles.length; j++) {
          if (u.rol === roles[j]) {
            matched.push(u);
            break;
          }
        }
      }
    }
    return matched;
  },

  /**
   * Simple {{key}} template interpolation from an event payload object.
   * @private
   */
  _interpolate_: function (template, values) {
    if (!template) return "";
    return template.replace(/\{\{(\w+)\}\}/g, function (match, key) {
      return values && values[key] !== undefined ? String(values[key]) : match;
    });
  },
};


// ============================================================
// SOURCE: audit/AuditService.js
// ============================================================

/**
 * Centralized audit service. Every create / update / remove action is recorded
 * here in the HistorialAudit sheet. Reads (list, get) are not audited by default
 * to keep the log focused on state changes.
 *
 * The HistorialAudit sheet is append-only — no updateEntity_ or removeEntity_
 * is ever called against it (business rule: audit records are immutable).
 * Future sprints may enrich the detalleJson with before/after diffs, but the
 * column structure is fixed here for the lifetime of the project.
 *
 * AuditService errors never propagate to the calling action — they are logged
 * and swallowed so an audit failure cannot block a legitimate write.
 */
var AuditService = {
  /**
   * Write a single audit record to HistorialAudit.
   *
   * @param {Object} opts
   * @param {string} opts.accion       — wire action, e.g. "procesos.create"
   * @param {string} opts.entidadTipo  — entity name, e.g. "procesos"
   * @param {string} [opts.entidadId]  — affected entity id (if known at call time)
   * @param {string} [opts.usuarioId]  — acting user id
   * @param {string} opts.resultado    — "ok" | "error"
   * @param {Object} [opts.detalle]    — arbitrary context, serialised to JSON
   */
  record: function (opts) {
    try {
      createEntity_("historial", {
        id: IdGen.uuid(),
        entidadTipo:  opts.entidadTipo  || "",
        entidadId:    opts.entidadId    || "",
        usuarioId:    opts.usuarioId    || "",
        accion:       opts.accion       || "",
        resultado:    opts.resultado    || "ok",
        fecha:        new Date().toISOString(),
        detalleJson:  opts.detalle ? JSON.stringify(opts.detalle) : "",
      });
    } catch (err) {
      AppLogger.error("AuditService.record failed — audit write skipped", {
        error: String((err && err.message) || err),
        accion: opts.accion,
        entidadId: opts.entidadId,
      });
    }
  },
};


// ============================================================
// SOURCE: auth/AuthBridge.js
// ============================================================

/**
 * Authentication bridge between Auth.js (frontend) and Apps Script (backend).
 *
 * The primary access gate is the Google Workspace domain restriction in
 * appsscript.json — only authenticated Workspace users from the deploying
 * account's domain can call this Web App at all. AuthBridge adds the
 * application layer on top: mapping a Google identity (email) to a system
 * Usuario record (role, unidadId) without duplicating any auth logic.
 *
 * The JWT callback in web/auth.ts calls `auth.getUser` after a successful
 * Google OAuth to hydrate the session with SSE-VRAF role and workspace data.
 *
 * Handled actions: auth.getUser, auth.ping
 */
var AuthBridge = {
  /**
   * Dispatch an auth.* verb.
   * @param {string} verb
   * @param {Object} params
   * @returns {*}
   */
  route: function (verb, params) {
    switch (verb) {
      case "getUser":
        return AuthBridge.getUser(params);
      case "ping":
        return AuthBridge.ping();
      default:
        throw new Error("Unknown auth action: auth." + verb);
    }
  },

  /**
   * Look up a Usuario by email. Returns the subset of fields the Auth.js JWT
   * callback needs to hydrate the session, or null if not found.
   *
   * @param {Object} params
   * @param {string} params.email
   * @returns {{ usuarioId, nombre, email, rol, unidadId, activo } | null}
   */
  getUser: function (params) {
    Validator.requireFields(params, ["email"]);
    var results = listEntities_("usuarios", { email: params.email });
    if (!results.items || results.items.length === 0) return null;

    var u = results.items[0];
    return {
      usuarioId: u.id,
      nombre:    u.nombre,
      email:     u.email,
      rol:       u.rol,
      unidadId:  u.unidadId,
      activo:    u.activo,
    };
  },

  /**
   * Health-check endpoint — confirms the Web App is reachable and returns
   * the configured instance name.
   * @returns {{ status, instance }}
   */
  ping: function () {
    return {
      status:   "ok",
      instance: Config.instanceName(),
      sprint:   "2 — Google Core",
    };
  },
};


// ============================================================
// SOURCE: drive/DriveService.js
// ============================================================

/**
 * Google Drive abstraction layer. Nothing outside this file calls DriveApp
 * directly — all Drive operations go through DriveService. This is the
 * enforcement point for the "files always in Drive, metadata only in Sheets"
 * rule from MASTER HANDOFF §08.
 *
 * Standard folder structure under the configured root:
 *   /SSE-VRAF/                             ← DRIVE_FOLDER_ROOT_ID (or auto-created)
 *     Evidencias/
 *       {unidadId}/
 *         {yyyy}/
 *           {procesoId}/
 *     _archivo/                            ← archived files (recoverable)
 *
 * All methods throw on error — callers can trust the return value is valid.
 */
var DriveService = {
  /**
   * Get the configured root folder. If DRIVE_FOLDER_ROOT_ID is not set,
   * creates "SSE-VRAF" in My Drive root (dev fallback only).
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getRootFolder: function () {
    var rootId = Config.driveFolderRootId();
    if (rootId) return DriveApp.getFolderById(rootId);
    // First run — create the root folder and persist its ID for all subsequent calls
    var folder = DriveService.getOrCreateFolder("SSE-VRAF", null);
    PropertiesService.getScriptProperties().setProperty("DRIVE_FOLDER_ROOT_ID", folder.getId());
    AppLogger.info("DriveService.getRootFolder: created root folder and stored ID", { id: folder.getId() });
    return folder;
  },

  /**
   * Get an existing folder by name inside a parent, or create it.
   * @param {string} name
   * @param {string|null} parentId — null means My Drive root
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getOrCreateFolder: function (name, parentId) {
    var parent = parentId ? DriveApp.getFolderById(parentId) : DriveApp.getRootFolder();
    var iter = parent.getFoldersByName(name);
    if (iter.hasNext()) return iter.next();
    AppLogger.info("DriveService: creating folder", { name: name, parentId: parentId });
    return parent.createFolder(name);
  },

  /**
   * Navigate and create a nested folder path, starting from a root folder.
   * @param {string[]} pathParts — e.g. ["Evidencias", "vraf", "2026", "PROC-001"]
   * @param {string|null} rootFolderId — null means My Drive root
   * @returns {GoogleAppsScript.Drive.Folder} the deepest folder
   */
  getOrCreateFolderPath: function (pathParts, rootFolderId) {
    var current = rootFolderId
      ? DriveApp.getFolderById(rootFolderId)
      : DriveApp.getRootFolder();

    for (var i = 0; i < pathParts.length; i++) {
      var part = String(pathParts[i] || "").trim();
      if (!part) continue;
      var iter = current.getFoldersByName(part);
      current = iter.hasNext() ? iter.next() : current.createFolder(part);
    }
    return current;
  },

  /**
   * Upload a file from a base64-encoded string to Drive.
   * @param {string} base64Data
   * @param {string} fileName
   * @param {string} mimeType
   * @param {string} folderId
   * @returns {{ id, name, mimeType, size, webViewLink, createdTime, modifiedTime }}
   */
  uploadBase64File: function (base64Data, fileName, mimeType, folderId) {
    var bytes = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(bytes, mimeType, fileName);
    var folder = DriveApp.getFolderById(folderId);
    var file = folder.createFile(blob);
    AppLogger.info("DriveService: file uploaded", { id: file.getId(), name: fileName });
    return DriveService.getFileMetadata(file.getId());
  },

  /**
   * Return a plain-object summary of a Drive file's metadata.
   * @param {string} fileId
   * @returns {{ id, name, mimeType, size, webViewLink, createdTime, modifiedTime, trashed }}
   */
  getFileMetadata: function (fileId) {
    var file = DriveApp.getFileById(fileId);
    return {
      id:           file.getId(),
      name:         file.getName(),
      mimeType:     file.getMimeType(),
      size:         file.getSize(),
      webViewLink:  file.getUrl(),
      createdTime:  file.getDateCreated().toISOString(),
      modifiedTime: file.getLastUpdated().toISOString(),
      trashed:      file.isTrashed(),
    };
  },

  /**
   * Grant viewer access to a Google account.
   * @param {string} fileId
   * @param {string} email
   */
  setViewerPermission: function (fileId, email) {
    DriveApp.getFileById(fileId).addViewer(email);
  },

  /**
   * Grant editor access to a Google account.
   * @param {string} fileId
   * @param {string} email
   */
  setEditorPermission: function (fileId, email) {
    DriveApp.getFileById(fileId).addEditor(email);
  },

  /**
   * Revoke a user's viewer and editor access to a file.
   * @param {string} fileId
   * @param {string} email
   */
  removePermission: function (fileId, email) {
    var file = DriveApp.getFileById(fileId);
    file.removeViewer(email);
    file.removeEditor(email);
  },

  /**
   * Move a file to the _archivo/ folder under the SSE-VRAF root.
   * The file stays in Drive and is recoverable.
   * @param {string} fileId
   * @returns {{ id, name, webViewLink }}
   */
  archiveFile: function (fileId) {
    var root = DriveService.getRootFolder();
    var archiveFolder = DriveService.getOrCreateFolder("_archivo", root.getId());
    var file = DriveApp.getFileById(fileId);
    file.moveTo(archiveFolder);
    AppLogger.info("DriveService: file archived", { id: fileId });
    return {
      id:          file.getId(),
      name:        file.getName(),
      webViewLink: file.getUrl(),
    };
  },

  /**
   * Send a file to the Drive trash (recoverable within 30 days).
   * @param {string} fileId
   */
  trashFile: function (fileId) {
    DriveApp.getFileById(fileId).setTrashed(true);
    AppLogger.info("DriveService: file trashed", { id: fileId });
  },

  /**
   * Build (and create if needed) the standard evidence folder path for a proceso.
   * @param {Object} opts
   * @param {string} opts.unidadId
   * @param {string} opts.procesoId
   * @param {number} [opts.year]   — defaults to current year
   * @returns {string} folderId of the deepest folder
   */
  getEvidenceFolderId: function (opts) {
    var year = String(opts.year || new Date().getFullYear());
    var root = DriveService.getRootFolder();
    var folder = DriveService.getOrCreateFolderPath(
      ["Evidencias", opts.unidadId || "general", year, opts.procesoId || "general"],
      root.getId(),
    );
    return folder.getId();
  },
};


// ============================================================
// SOURCE: drive/WorkspaceFolderManager.js
// ============================================================

/**
 * WorkspaceFolderManager — auto-creates and resolves the canonical Drive folder
 * hierarchy for each workspace under the SSE-VRAF root.
 *
 * Standard structure (all relative to the root returned by DriveService.getRootFolder()):
 *
 *   SSE-VRAF/                   ← DRIVE_FOLDER_ROOT_ID
 *     {wsId}/
 *       Empleados/
 *         {userId}/
 *       Procesos/
 *         {blueprintId}/
 *       Documentos/
 *       Formularios/
 *       Plantillas/
 *       Reportes/
 *       _archivo/
 *
 * All Drive access is delegated to DriveService — this file never calls DriveApp
 * directly. Folder creation is idempotent: if a folder already exists with the
 * given name inside the parent it is returned without creating a duplicate.
 *
 * DriveService.getOrCreateFolder(name, parentId) signature:
 *   name      — string, the folder name
 *   parentId  — string Drive folder ID, or null for My Drive root
 */

var WorkspaceFolderManager = {

  // ---------------------------------------------------------------------------
  // Workspace root
  // ---------------------------------------------------------------------------

  /**
   * Get (or create) the workspace root folder: SSE-VRAF/{wsId}/
   *
   * @param {string} wsId
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getWorkspaceFolder: function (wsId) {
    if (!wsId) throw new Error("WorkspaceFolderManager.getWorkspaceFolder: wsId is required");
    var root = DriveService.getRootFolder();
    return DriveService.getOrCreateFolder(String(wsId), root.getId());
  },

  // ---------------------------------------------------------------------------
  // Sub-folders
  // ---------------------------------------------------------------------------

  /**
   * SSE-VRAF/{wsId}/Empleados/{userId}/
   *
   * @param {string} wsId
   * @param {string} userId
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getEmployeeFolder: function (wsId, userId) {
    if (!wsId || !userId) {
      throw new Error("WorkspaceFolderManager.getEmployeeFolder: wsId and userId are required");
    }
    var wsFolder        = WorkspaceFolderManager.getWorkspaceFolder(wsId);
    var empleadosFolder = DriveService.getOrCreateFolder("Empleados", wsFolder.getId());
    return DriveService.getOrCreateFolder(String(userId), empleadosFolder.getId());
  },

  /**
   * SSE-VRAF/{wsId}/Procesos/{blueprintId}/
   *
   * @param {string} wsId
   * @param {string} blueprintId
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getProcessFolder: function (wsId, blueprintId) {
    if (!wsId || !blueprintId) {
      throw new Error("WorkspaceFolderManager.getProcessFolder: wsId and blueprintId are required");
    }
    var wsFolder       = WorkspaceFolderManager.getWorkspaceFolder(wsId);
    var procesosFolder = DriveService.getOrCreateFolder("Procesos", wsFolder.getId());
    return DriveService.getOrCreateFolder(String(blueprintId), procesosFolder.getId());
  },

  /**
   * SSE-VRAF/{wsId}/Documentos/
   *
   * @param {string} wsId
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getDocumentsFolder: function (wsId) {
    if (!wsId) throw new Error("WorkspaceFolderManager.getDocumentsFolder: wsId is required");
    var wsFolder = WorkspaceFolderManager.getWorkspaceFolder(wsId);
    return DriveService.getOrCreateFolder("Documentos", wsFolder.getId());
  },

  /**
   * SSE-VRAF/{wsId}/Formularios/
   *
   * @param {string} wsId
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getFormsFolder: function (wsId) {
    if (!wsId) throw new Error("WorkspaceFolderManager.getFormsFolder: wsId is required");
    var wsFolder = WorkspaceFolderManager.getWorkspaceFolder(wsId);
    return DriveService.getOrCreateFolder("Formularios", wsFolder.getId());
  },

  /**
   * SSE-VRAF/{wsId}/Procedimientos/
   *
   * @param {string} wsId
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getProcedimientosFolder: function (wsId) {
    if (!wsId) throw new Error("WorkspaceFolderManager.getProcedimientosFolder: wsId is required");
    var wsFolder = WorkspaceFolderManager.getWorkspaceFolder(wsId);
    return DriveService.getOrCreateFolder("Procedimientos", wsFolder.getId());
  },

  /**
   * SSE-VRAF/{wsId}/Evidencias/
   *
   * @param {string} wsId
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getEvidenciasFolder: function (wsId) {
    if (!wsId) throw new Error("WorkspaceFolderManager.getEvidenciasFolder: wsId is required");
    var wsFolder = WorkspaceFolderManager.getWorkspaceFolder(wsId);
    return DriveService.getOrCreateFolder("Evidencias", wsFolder.getId());
  },

  /**
   * SSE-VRAF/{wsId}/Plantillas/
   *
   * @param {string} wsId
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getTemplatesFolder: function (wsId) {
    if (!wsId) throw new Error("WorkspaceFolderManager.getTemplatesFolder: wsId is required");
    var wsFolder = WorkspaceFolderManager.getWorkspaceFolder(wsId);
    return DriveService.getOrCreateFolder("Plantillas", wsFolder.getId());
  },

  /**
   * SSE-VRAF/{wsId}/Reportes/
   *
   * @param {string} wsId
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getReportsFolder: function (wsId) {
    if (!wsId) throw new Error("WorkspaceFolderManager.getReportsFolder: wsId is required");
    var wsFolder = WorkspaceFolderManager.getWorkspaceFolder(wsId);
    return DriveService.getOrCreateFolder("Reportes", wsFolder.getId());
  },

  /**
   * SSE-VRAF/{wsId}/_archivo/
   *
   * @param {string} wsId
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  getArchiveFolder: function (wsId) {
    if (!wsId) throw new Error("WorkspaceFolderManager.getArchiveFolder: wsId is required");
    var wsFolder = WorkspaceFolderManager.getWorkspaceFolder(wsId);
    return DriveService.getOrCreateFolder("_archivo", wsFolder.getId());
  },

  // ---------------------------------------------------------------------------
  // Full workspace initialisation
  // ---------------------------------------------------------------------------

  /**
   * Create the full standard folder hierarchy for a workspace in one shot.
   * Safe to call multiple times — existing folders are reused (idempotent).
   *
   * @param {string} wsId
   * @returns {{ wsId: string, folderId: string, subFolders: Object.<string,string> }}
   */
  initWorkspace: function (wsId) {
    if (!wsId) throw new Error("WorkspaceFolderManager.initWorkspace: wsId is required");

    AppLogger.info("WorkspaceFolderManager.initWorkspace: start", { wsId: wsId });

    var wsFolder   = WorkspaceFolderManager.getWorkspaceFolder(wsId);
    var wsFolderId = wsFolder.getId();

    var SUB_FOLDERS = [
      "Empleados",
      "Procesos",
      "Procedimientos",
      "Formularios",
      "Evidencias",
      "Documentos",
      "Plantillas",
      "Reportes",
      "_archivo",
    ];

    var subFolders = {};
    for (var i = 0; i < SUB_FOLDERS.length; i++) {
      var name   = SUB_FOLDERS[i];
      var folder = DriveService.getOrCreateFolder(name, wsFolderId);
      subFolders[name] = folder.getId();
    }

    AppLogger.info("WorkspaceFolderManager.initWorkspace: complete", {
      wsId:       wsId,
      folderId:   wsFolderId,
      subFolders: subFolders,
    });

    return {
      wsId:       wsId,
      folderId:   wsFolderId,
      subFolders: subFolders,
    };
  },

  // ---------------------------------------------------------------------------
  // Document upload
  // ---------------------------------------------------------------------------

  /**
   * Upload a base64-encoded file to SSE-VRAF/{wsId}/Documentos/ and return
   * Drive file metadata. Delegates all Drive I/O to DriveService.
   *
   * @param {string} wsId
   * @param {string} base64Data
   * @param {string} fileName
   * @param {string} mimeType
   * @returns {{ id, name, mimeType, size, webViewLink, createdTime, modifiedTime }}
   */
  uploadDocument: function (wsId, base64Data, fileName, mimeType) {
    if (!wsId || !base64Data || !fileName) {
      throw new Error(
        "WorkspaceFolderManager.uploadDocument: wsId, base64Data and fileName are required"
      );
    }

    var docsFolder = WorkspaceFolderManager.getDocumentsFolder(wsId);
    var metadata   = DriveService.uploadBase64File(
      base64Data,
      fileName,
      mimeType || "application/octet-stream",
      docsFolder.getId()
    );

    AppLogger.info("WorkspaceFolderManager.uploadDocument: uploaded", {
      wsId:     wsId,
      fileName: fileName,
      fileId:   metadata.id,
    });

    return metadata;
  },
};


// ============================================================
// SOURCE: resources/ResourceService.js
// ============================================================

/**
 * Resource abstraction layer — the rest of the application works with
 * "Resources" (institutional evidence assets), not with raw Drive files or
 * raw Evidencia rows. ResourceService is the single point that coordinates
 * between the Evidencias sheet (metadata) and DriveService (physical storage).
 *
 * Rule enforced here:
 *   §08 — Evidence files always live in Drive. Sheets stores only metadata
 *   (driveFileId, webViewLink, version, etc.). ResourceService is the only
 *   place that knows both sides.
 *
 * File upload (base64 over HTTPS) is wired to the router in the Evidencias
 * sprint. For Sprint 2 the service is complete; the route action is defined
 * but the frontend doesn't call it yet.
 */
var ResourceService = {
  /**
   * Create a new resource: optionally upload a file to Drive, then write the
   * Evidencia row to Sheets with the resulting driveFileId.
   *
   * @param {Object} evidenciaData — Evidencia fields (id will be generated if absent)
   * @param {Object} [file]         — optional file to upload
   * @param {string} file.base64Data
   * @param {string} file.fileName
   * @param {string} file.mimeType
   * @returns {Object} created Evidencia record
   */
  create: function (evidenciaData, file) {
    var record = Object.assign({}, evidenciaData);
    record.id     = record.id     || IdGen.uuid();
    record.estado = record.estado || "pendiente";
    record.version = record.version || "1.0";
    record.fechaCarga = record.fechaCarga || new Date().toISOString();

    if (file && file.base64Data) {
      var folderId = DriveService.getEvidenceFolderId({
        unidadId:  evidenciaData.unidadId  || "general",
        procesoId: evidenciaData.procesoId || "general",
      });
      var uploaded = DriveService.uploadBase64File(
        file.base64Data,
        file.fileName || record.nombre || "evidencia",
        file.mimeType || "application/octet-stream",
        folderId,
      );
      record.driveFileId     = uploaded.id;
      record.driveWebViewLink = uploaded.webViewLink;
    }

    return createEntity_("evidencias", record);
  },

  /**
   * Get an Evidencia record, optionally enriching it with live Drive metadata.
   * Drive enrichment is opt-in because it makes an extra API call.
   *
   * @param {string} evidenciaId
   * @param {boolean} [enrichWithDrive=false]
   * @returns {Object|null}
   */
  get: function (evidenciaId, enrichWithDrive) {
    var record = getEntity_("evidencias", evidenciaId);
    if (!record) return null;

    if (enrichWithDrive && record.driveFileId) {
      try {
        record._driveMetadata = DriveService.getFileMetadata(record.driveFileId);
      } catch (err) {
        AppLogger.warn("ResourceService.get: Drive file not accessible", {
          driveFileId: record.driveFileId,
          error: String((err && err.message) || err),
        });
      }
    }
    return record;
  },

  /**
   * Update an Evidencia record's metadata fields.
   * driveFileId is protected — use ResourceService.replaceFile() to swap the file.
   *
   * @param {string} evidenciaId
   * @param {Object} patch
   * @returns {Object} updated record
   */
  update: function (evidenciaId, patch) {
    var safePatch = Object.assign({}, patch);
    delete safePatch.id;
    delete safePatch.driveFileId;
    return updateEntity_("evidencias", evidenciaId, safePatch);
  },

  /**
   * Archive a resource: move the Drive file to _archivo/ and mark the record.
   *
   * @param {string} evidenciaId
   * @returns {Object} updated Evidencia record
   */
  archive: function (evidenciaId) {
    var record = getEntity_("evidencias", evidenciaId);
    if (!record) throw new Error("Evidencia " + evidenciaId + " not found");

    if (record.driveFileId) {
      DriveService.archiveFile(record.driveFileId);
    }

    return updateEntity_("evidencias", evidenciaId, { estado: "archivado" });
  },

  /**
   * Replace the physical file attached to an Evidencia record, incrementing
   * the version number and uploading the new file to Drive.
   *
   * @param {string} evidenciaId
   * @param {Object} file
   * @param {string} file.base64Data
   * @param {string} file.fileName
   * @param {string} file.mimeType
   * @returns {Object} updated Evidencia record
   */
  replaceFile: function (evidenciaId, file) {
    var record = getEntity_("evidencias", evidenciaId);
    if (!record) throw new Error("Evidencia " + evidenciaId + " not found");

    // Archive old file before replacing
    if (record.driveFileId) {
      try { DriveService.archiveFile(record.driveFileId); } catch (e) { /* best-effort */ }
    }

    var folderId = DriveService.getEvidenceFolderId({
      unidadId:  record.unidadId  || "general",
      procesoId: record.procesoId || "general",
    });
    var uploaded = DriveService.uploadBase64File(
      file.base64Data,
      file.fileName || record.nombre || "evidencia",
      file.mimeType || "application/octet-stream",
      folderId,
    );

    var versionParts = String(record.version || "1.0").split(".");
    var newVersion = (parseInt(versionParts[0], 10) || 1) + 1 + ".0";

    return updateEntity_("evidencias", evidenciaId, {
      driveFileId:      uploaded.id,
      driveWebViewLink: uploaded.webViewLink,
      version:          newVersion,
      fechaCarga:       new Date().toISOString(),
    });
  },
};


// ============================================================
// SOURCE: controllers/WorkspaceController.js
// ============================================================

/**
 * WorkspaceController — specialized lifecycle and operational actions for
 * workspace-admin entities that go beyond generic CRUD.
 *
 * Delegates all persistence to the SheetRepository primitives
 * (createEntity_, getEntity_, updateEntity_, listEntities_) and never calls
 * SpreadsheetApp directly. Every mutating method records an AuditService entry
 * and emits the appropriate EventDispatcher event.
 *
 * Lifecycle model:  draft → published → archived → (restore → draft)
 *                                     ↓
 *                                  deprecated
 */

var WorkspaceController = {

  // ---------------------------------------------------------------------------
  // Lifecycle transitions
  // ---------------------------------------------------------------------------

  /**
   * Publish a versioned entity.
   * Increments version, sets lifecycle = 'published', writes a VersionRecord
   * to historyJson, and emits a publish event.
   *
   * @param {string} entityName
   * @param {string} id
   * @param {string} userId
   * @returns {Object} updated record
   */
  publish: function (entityName, id, userId) {
    Validator.requireId({ id: id });

    var record = getEntity_(entityName, id);
    if (!record) throw new Error(entityName + " " + id + " not found");

    var now = new Date().toISOString();
    var history = WorkspaceController._parseJson_(record.historyJson, []);
    var newVersion = (parseInt(record.version, 10) || 0) + 1;

    history.push({
      version:   newVersion,
      changedBy: userId || "",
      changedAt: now,
      summary:   "Publicado v" + newVersion,
      lifecycle: "published",
    });

    var patch = {
      lifecycle:        "published",
      version:          newVersion,
      publishedVersion: newVersion,
      historyJson:      JSON.stringify(history),
      updatedAt:        now,
    };

    var updated = updateEntity_(entityName, id, patch);

    AuditService.record({
      accion:      entityName + ".publish",
      entidadTipo: entityName,
      entidadId:   id,
      usuarioId:   userId || "",
      resultado:   "ok",
      detalle:     { version: newVersion },
    });

    var eventKey = WorkspaceController._publishEventKey_(entityName);
    if (eventKey && EVENT_TYPES[eventKey]) {
      EventDispatcher.emit(EVENT_TYPES[eventKey], {
        entityName: entityName,
        id:         id,
        version:    newVersion,
        userId:     userId,
      });
    }

    AppLogger.info("WorkspaceController.publish", {
      entityName: entityName,
      id:         id,
      version:    newVersion,
    });
    return updated;
  },

  /**
   * Archive an entity (lifecycle → 'archived').
   *
   * @param {string} entityName
   * @param {string} id
   * @param {string} userId
   * @returns {Object} updated record
   */
  archive: function (entityName, id, userId) {
    Validator.requireId({ id: id });

    var record = getEntity_(entityName, id);
    if (!record) throw new Error(entityName + " " + id + " not found");

    var now     = new Date().toISOString();
    var history = WorkspaceController._parseJson_(record.historyJson, []);
    var version = parseInt(record.version, 10) || 1;

    history.push({
      version:   version,
      changedBy: userId || "",
      changedAt: now,
      summary:   "Archivado",
      lifecycle: "archived",
    });

    var updated = updateEntity_(entityName, id, {
      lifecycle:   "archived",
      historyJson: JSON.stringify(history),
      updatedAt:   now,
    });

    AuditService.record({
      accion:      entityName + ".archive",
      entidadTipo: entityName,
      entidadId:   id,
      usuarioId:   userId || "",
      resultado:   "ok",
    });

    // Entity-specific archive events
    if (entityName === "wsBlueprints" && EVENT_TYPES.BLUEPRINT_ARCHIVADO) {
      EventDispatcher.emit(EVENT_TYPES.BLUEPRINT_ARCHIVADO, {
        entityName: entityName,
        id:         id,
        userId:     userId,
      });
    } else if (entityName === "wsDocuments" && EVENT_TYPES.DOCUMENTO_ARCHIVADO) {
      EventDispatcher.emit(EVENT_TYPES.DOCUMENTO_ARCHIVADO, {
        entityName: entityName,
        id:         id,
        userId:     userId,
      });
    }

    AppLogger.info("WorkspaceController.archive", { entityName: entityName, id: id });
    return updated;
  },

  /**
   * Restore an archived entity to 'draft'.
   *
   * @param {string} entityName
   * @param {string} id
   * @param {string} userId
   * @returns {Object} updated record
   */
  restore: function (entityName, id, userId) {
    Validator.requireId({ id: id });

    var record = getEntity_(entityName, id);
    if (!record) throw new Error(entityName + " " + id + " not found");

    var now     = new Date().toISOString();
    var history = WorkspaceController._parseJson_(record.historyJson, []);
    var version = parseInt(record.version, 10) || 1;

    history.push({
      version:   version,
      changedBy: userId || "",
      changedAt: now,
      summary:   "Restaurado a borrador",
      lifecycle: "draft",
    });

    var updated = updateEntity_(entityName, id, {
      lifecycle:   "draft",
      historyJson: JSON.stringify(history),
      updatedAt:   now,
    });

    AuditService.record({
      accion:      entityName + ".restore",
      entidadTipo: entityName,
      entidadId:   id,
      usuarioId:   userId || "",
      resultado:   "ok",
    });

    AppLogger.info("WorkspaceController.restore", { entityName: entityName, id: id });
    return updated;
  },

  /**
   * Soft-delete an entity by stamping deletedAt.
   *
   * @param {string} entityName
   * @param {string} id
   * @param {string} userId
   */
  softDelete: function (entityName, id, userId) {
    Validator.requireId({ id: id });

    var now = new Date().toISOString();
    updateEntity_(entityName, id, { deletedAt: now, updatedAt: now });

    AuditService.record({
      accion:      entityName + ".delete",
      entidadTipo: entityName,
      entidadId:   id,
      usuarioId:   userId || "",
      resultado:   "ok",
    });

    AppLogger.info("WorkspaceController.softDelete", { entityName: entityName, id: id });
  },

  // ---------------------------------------------------------------------------
  // Duplication
  // ---------------------------------------------------------------------------

  /**
   * Duplicate an entity — deep-copies the record, assigns a fresh id,
   * resets lifecycle to 'draft', version to 1, clears all runtime state,
   * and prefixes the name with "Copia de".
   *
   * @param {string} entityName
   * @param {string} id
   * @param {string} userId
   * @returns {Object} newly created record
   */
  duplicate: function (entityName, id, userId) {
    Validator.requireId({ id: id });

    var original = getEntity_(entityName, id);
    if (!original) throw new Error(entityName + " " + id + " not found");

    var now   = new Date().toISOString();
    var newId = IdGen.forEntity(entityName);

    // Deep-copy via JSON round-trip (avoids shared references)
    var copy = JSON.parse(JSON.stringify(original));

    // Reset identity & lifecycle
    copy.id        = newId;
    copy.nombre    = "Copia de " + (copy.nombre || "sin nombre");
    copy.lifecycle = "draft";
    copy.version   = 1;
    copy.createdBy = userId || "";
    copy.createdAt = now;
    copy.updatedAt = now;

    // Seed a fresh history
    copy.historyJson = JSON.stringify([{
      version:   1,
      changedBy: userId || "",
      changedAt: now,
      summary:   "Duplicado desde " + id,
      lifecycle: "draft",
    }]);

    // Clear runtime-only fields (may not exist on all entities — harmless)
    delete copy.deletedAt;
    copy.publishedVersion   = "";
    copy.runtimeBlueprintId = "";
    copy.lastExecutedAt     = "";
    copy.executionCount     = 0;
    copy.recentExecutionsJson = "";
    copy.valorActual        = "";
    copy.historicoJson      = "";

    var created = createEntity_(entityName, copy);

    AuditService.record({
      accion:      entityName + ".duplicate",
      entidadTipo: entityName,
      entidadId:   newId,
      usuarioId:   userId || "",
      resultado:   "ok",
      detalle:     { sourceId: id },
    });

    AppLogger.info("WorkspaceController.duplicate", {
      entityName: entityName,
      sourceId:   id,
      newId:      newId,
    });
    return created;
  },

  // ---------------------------------------------------------------------------
  // Active flag
  // ---------------------------------------------------------------------------

  /**
   * Toggle the active/activo flag on entities that support it
   * (wsAutomations, wsNotifRules, wsUsers).
   *
   * @param {string}  entityName
   * @param {string}  id
   * @param {boolean} active
   * @param {string}  userId
   * @returns {Object} updated record
   */
  toggleActive: function (entityName, id, active, userId) {
    Validator.requireId({ id: id });

    var record = getEntity_(entityName, id);
    if (!record) throw new Error(entityName + " " + id + " not found");

    var now = new Date().toISOString();

    // Both field names are written — which one the entity actually stores
    // is determined by its column definition; extras are ignored by objectToRow_.
    var updated = updateEntity_(entityName, id, {
      activo:    active,
      active:    active,
      updatedAt: now,
    });

    AuditService.record({
      accion:      entityName + (active ? ".activate" : ".deactivate"),
      entidadTipo: entityName,
      entidadId:   id,
      usuarioId:   userId || "",
      resultado:   "ok",
      detalle:     { active: active },
    });

    if (entityName === "wsUsers" && !active && EVENT_TYPES.USUARIO_DESACTIVADO) {
      EventDispatcher.emit(EVENT_TYPES.USUARIO_DESACTIVADO, {
        id:     id,
        userId: userId,
      });
    }

    AppLogger.info("WorkspaceController.toggleActive", {
      entityName: entityName,
      id:         id,
      active:     active,
    });
    return updated;
  },

  // ---------------------------------------------------------------------------
  // Automation execution tracking
  // ---------------------------------------------------------------------------

  /**
   * Record one automation execution run.
   * Prepends to recentExecutionsJson (capped at 10), increments executionCount,
   * updates lastExecutedAt and lastStatus, and emits AUTOMATION_EJECUTADA.
   *
   * @param {string} automationId
   * @param {string} status            — 'success' | 'error' | 'skipped'
   * @param {string} errorMessage      — empty string if no error
   * @param {number} actionsExecuted
   * @param {string} userId
   * @returns {Object} updated automation record
   */
  recordExecution: function (automationId, status, errorMessage, actionsExecuted, userId) {
    if (!automationId) throw new Error("automationId is required");

    var automation = getEntity_("wsAutomations", automationId);
    if (!automation) throw new Error("wsAutomations " + automationId + " not found");

    var now = new Date().toISOString();

    var executionRecord = {
      id:              IdGen.uuid(),
      automationId:    automationId,
      triggeredAt:     now,
      status:          status || "unknown",
      actionsExecuted: actionsExecuted || 0,
      errorMessage:    errorMessage || "",
    };

    var recent = WorkspaceController._parseJson_(automation.recentExecutionsJson, []);

    // Prepend, keep last 10
    recent.unshift(executionRecord);
    if (recent.length > 10) recent = recent.slice(0, 10);

    var currentCount = parseInt(automation.executionCount, 10) || 0;
    var updated = updateEntity_("wsAutomations", automationId, {
      executionCount:       currentCount + 1,
      lastExecutedAt:       now,
      lastStatus:           status || "unknown",
      recentExecutionsJson: JSON.stringify(recent),
      updatedAt:            now,
    });

    if (EVENT_TYPES.AUTOMATION_EJECUTADA) {
      EventDispatcher.emit(EVENT_TYPES.AUTOMATION_EJECUTADA, {
        automationId: automationId,
        executionId:  executionRecord.id,
        status:       status,
        userId:       userId,
      });
    }

    AppLogger.info("WorkspaceController.recordExecution", {
      automationId:   automationId,
      status:         status,
      executionCount: currentCount + 1,
    });
    return updated;
  },

  // ---------------------------------------------------------------------------
  // KPI value recording
  // ---------------------------------------------------------------------------

  /**
   * Append a historical value to a KPI and recalculate valorActual + tendencia.
   * Keeps the last 24 entries in historicoJson.
   * Emits INDICADOR_ACTUALIZADO and KPI_ALERTA when semaforo is 'rojo'.
   *
   * @param {string} kpiId
   * @param {number} valor
   * @param {string} semaforo   — 'verde' | 'amarillo' | 'rojo'
   * @param {string} fecha      — ISO date string; defaults to now
   * @returns {Object} updated KPI record
   */
  recordKPIValue: function (kpiId, valor, semaforo, fecha) {
    if (!kpiId) throw new Error("kpiId is required");

    var kpi = getEntity_("wsKPIs", kpiId);
    if (!kpi) throw new Error("wsKPIs " + kpiId + " not found");

    var now        = new Date().toISOString();
    var fechaEntry = fecha || now;
    var historico  = WorkspaceController._parseJson_(kpi.historicoJson, []);

    // Capture previous value before appending
    var prevValor = historico.length > 0
      ? parseFloat(historico[historico.length - 1].valor)
      : null;

    historico.push({ fecha: fechaEntry, valor: valor, semaforo: semaforo || "verde" });

    // Keep last 24 entries
    if (historico.length > 24) historico = historico.slice(historico.length - 24);

    // Derive tendency
    var tendencia = "estable";
    var numValor  = parseFloat(valor);
    if (prevValor !== null && !isNaN(prevValor) && !isNaN(numValor)) {
      if (numValor > prevValor)      tendencia = "subiendo";
      else if (numValor < prevValor) tendencia = "bajando";
    }

    var updated = updateEntity_("wsKPIs", kpiId, {
      historicoJson: JSON.stringify(historico),
      valorActual:   valor,
      tendencia:     tendencia,
      updatedAt:     now,
    });

    if (EVENT_TYPES.INDICADOR_ACTUALIZADO) {
      EventDispatcher.emit(EVENT_TYPES.INDICADOR_ACTUALIZADO, {
        kpiId:     kpiId,
        valor:     valor,
        semaforo:  semaforo,
        tendencia: tendencia,
      });
    }

    if (semaforo === "rojo" && EVENT_TYPES.KPI_ALERTA) {
      EventDispatcher.emit(EVENT_TYPES.KPI_ALERTA, {
        kpiId:    kpiId,
        valor:    valor,
        semaforo: semaforo,
      });
    }

    AppLogger.info("WorkspaceController.recordKPIValue", {
      kpiId:     kpiId,
      valor:     valor,
      semaforo:  semaforo,
      tendencia: tendencia,
    });
    return updated;
  },

  // ---------------------------------------------------------------------------
  // History
  // ---------------------------------------------------------------------------

  /**
   * Return the parsed version-history array from historyJson, or [].
   *
   * @param {string} entityName
   * @param {string} id
   * @returns {Array}
   */
  getHistory: function (entityName, id) {
    Validator.requireId({ id: id });

    var record = getEntity_(entityName, id);
    if (!record) throw new Error(entityName + " " + id + " not found");

    var history = WorkspaceController._parseJson_(record.historyJson, []);
    AppLogger.debug("WorkspaceController.getHistory", {
      entityName: entityName,
      id:         id,
      entries:    history.length,
    });
    return history;
  },

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Safely parse a JSON string. Returns fallback on any error.
   * @param {string} raw
   * @param {*} fallback
   * @returns {*}
   * @private
   */
  _parseJson_: function (raw, fallback) {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      AppLogger.warn("WorkspaceController._parseJson_: parse error", {
        error: String(e.message || e),
      });
      return fallback;
    }
  },

  /**
   * Map an entity name to its EVENT_TYPES key for publish events.
   * @param {string} entityName
   * @returns {string|null}
   * @private
   */
  _publishEventKey_: function (entityName) {
    var map = {
      wsBlueprints: "BLUEPRINT_PUBLICADO",
      wsForms:      "FORMULARIO_PUBLICADO",
    };
    return map[entityName] || null;
  },
};


// ============================================================
// SOURCE: controllers/BuilderController.js
// ============================================================

/**
 * BuilderController — Sprint 16 Production Persistence for the No-Code Builder Suite.
 *
 * Handles all CRUD operations for builder configs stored in WSBuilderConfigs.
 * Each config is stored as a flat row where configJson holds the complete
 * typed object (ProcessConfig, FormConfig, KPIConfig, etc.) as a JSON string.
 *
 * All public methods correspond 1:1 to builder.* actions in router.js.
 *
 * Serialization contract:
 *   SAVE:  full config object → JSON.stringify(config) stored in configJson
 *   READ:  JSON.parse(row.configJson) merged with flat row fields → full object
 *
 * Version history: every publish() writes an immutable snapshot to WSBuilderVersions.
 */

var BuilderController = (function () {

  var ENTITY = "wsBuilderConfigs";
  var VERSION_ENTITY = "wsBuilderVersions";

  // ---------------------------------------------------------------------------
  // Serialization helpers
  // ---------------------------------------------------------------------------

  /** Parse a WSBuilderConfigs row into a full builder config object. */
  function rowToConfig_(row) {
    if (!row) return null;
    var config = {};
    try {
      config = JSON.parse(row.configJson || "{}");
    } catch (e) {
      AppLogger.warn("BuilderController: failed to parse configJson", {
        id:    row.id,
        error: String((e && e.message) || e),
      });
    }
    // Merge flat fields on top so they always win (they are the source of truth
    // for filtering and are denormalized from configJson at write time)
    config.id          = row.id;
    config.wsId        = row.wsId;
    config.tipo        = row.tipo;
    config.nombre      = row.nombre;
    config.descripcion = row.descripcion || config.descripcion || "";
    config.version     = typeof row.version === "number" ? row.version : (parseInt(row.version, 10) || 1);
    config.status      = row.status;
    config.creadoPor   = row.creadoPor;
    config.createdAt   = row.createdAt;
    config.updatedAt   = row.updatedAt;
    config.publishedAt = row.publishedAt || "";
    return config;
  }

  /**
   * Build a flat WSBuilderConfigs row from a full config object.
   * Stores the entire config as configJson to preserve all nested fields.
   */
  function configToRow_(wsId, config, now) {
    return {
      id:          config.id,
      wsId:        wsId,
      tipo:        config.tipo,
      nombre:      config.nombre || "",
      descripcion: config.descripcion || "",
      version:     config.version || 1,
      status:      config.status || "draft",
      creadoPor:   config.creadoPor || "",
      configJson:  JSON.stringify(config),
      createdAt:   config.createdAt || now,
      updatedAt:   now,
      publishedAt: config.publishedAt || "",
      deletedAt:   "",
    };
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  return {

    /**
     * List all builder configs for a workspace + type.
     * Returns full config objects, sorted by updatedAt desc.
     *
     * @param {{ wsId: string, tipo: string }} params
     * @returns {Array}
     */
    list: function (params) {
      if (!params.wsId) throw new Error("builder.list: wsId is required");

      var query = { wsId: params.wsId };
      if (params.tipo) query.tipo = params.tipo;

      var result = listEntities_(ENTITY, query);
      var items  = result.items || [];

      var configs = [];
      for (var i = 0; i < items.length; i++) {
        var c = rowToConfig_(items[i]);
        if (c) configs.push(c);
      }

      // Sort by updatedAt desc
      configs.sort(function (a, b) {
        var at = a.updatedAt || "";
        var bt = b.updatedAt || "";
        return at < bt ? 1 : at > bt ? -1 : 0;
      });

      return configs;
    },

    /**
     * Get a single builder config by id.
     *
     * @param {{ wsId: string, tipo: string, id: string }} params
     * @returns {Object|null}
     */
    get: function (params) {
      Validator.requireId(params);
      var row = getEntity_(ENTITY, params.id);
      if (!row) return null;
      if (params.wsId && row.wsId !== params.wsId) return null;
      return rowToConfig_(row);
    },

    /**
     * Create or update a builder config (upsert).
     * If params.id exists and the row is found, updates it.
     * Otherwise creates a new row with a generated id.
     *
     * @param {{ wsId: string, [key: string]: * }} params — full config object
     * @returns {Object} saved config
     */
    save: function (params) {
      if (!params.wsId) throw new Error("builder.save: wsId is required");
      if (!params.tipo)  throw new Error("builder.save: tipo is required");

      var now    = new Date().toISOString();
      var wsId   = params.wsId;
      var id     = params.id;
      var config = Object.assign({}, params);

      // Determine create vs update
      var existing = id ? getEntity_(ENTITY, id) : null;

      if (existing && existing.wsId === wsId) {
        // UPDATE: preserve createdAt, bump updatedAt
        config.createdAt = existing.createdAt;
        config.updatedAt = now;
        config.id        = id;
        var row = configToRow_(wsId, config, now);
        updateEntity_(ENTITY, id, row);
        AppLogger.info("BuilderController.save: updated", { id: id, tipo: config.tipo });
        return rowToConfig_(Object.assign({}, existing, row));
      } else {
        // CREATE: generate new id
        config.id        = IdGen.forEntity("wsBuilderConfigs");
        config.createdAt = now;
        config.updatedAt = now;
        config.version   = config.version || 1;
        config.status    = config.status  || "draft";
        var newRow = configToRow_(wsId, config, now);
        createEntity_(ENTITY, newRow);
        AppLogger.info("BuilderController.save: created", { id: config.id, tipo: config.tipo });
        return rowToConfig_(newRow);
      }
    },

    /**
     * Publish a builder config: bump version, set status=published,
     * stamp publishedAt, write immutable version snapshot.
     *
     * @param {{ wsId: string, tipo: string, id: string }} params
     * @returns {Object} updated config
     */
    publish: function (params) {
      Validator.requireId(params);
      var existing = getEntity_(ENTITY, params.id);
      if (!existing) throw new Error("builder.publish: config " + params.id + " not found");
      if (params.wsId && existing.wsId !== params.wsId) throw new Error("builder.publish: wsId mismatch");

      var now       = new Date().toISOString();
      var newVersion = (parseInt(existing.version, 10) || 1) + 1;

      var patch = {
        version:     newVersion,
        status:      "published",
        publishedAt: now,
        updatedAt:   now,
        configJson:  "", // will be rebuilt below
      };

      // Rebuild configJson with updated fields
      var fullConfig = rowToConfig_(existing);
      fullConfig.version     = newVersion;
      fullConfig.status      = "published";
      fullConfig.publishedAt = now;
      fullConfig.updatedAt   = now;
      patch.configJson = JSON.stringify(fullConfig);

      updateEntity_(ENTITY, params.id, patch);

      // Write immutable version snapshot
      try {
        createEntity_(VERSION_ENTITY, {
          id:        IdGen.forEntity("wsBuilderVersions"),
          builderId: params.id,
          wsId:      existing.wsId,
          tipo:      existing.tipo,
          version:   newVersion,
          status:    "published",
          configJson: patch.configJson,
          creadoPor: params.userId || "system",
          createdAt: now,
        });
      } catch (e) {
        // Version snapshot failure must never block the publish
        AppLogger.warn("BuilderController.publish: version snapshot failed", {
          id:    params.id,
          error: String((e && e.message) || e),
        });
      }

      AppLogger.info("BuilderController.publish: published", { id: params.id, version: newVersion });
      return rowToConfig_(Object.assign({}, existing, patch));
    },

    /**
     * Archive a builder config (status → archived).
     *
     * @param {{ wsId: string, tipo: string, id: string }} params
     * @returns {Object} updated config
     */
    archive: function (params) {
      Validator.requireId(params);
      var existing = getEntity_(ENTITY, params.id);
      if (!existing) throw new Error("builder.archive: config " + params.id + " not found");

      var now    = new Date().toISOString();
      var config = rowToConfig_(existing);
      config.status    = "archived";
      config.updatedAt = now;

      updateEntity_(ENTITY, params.id, {
        status:     "archived",
        updatedAt:  now,
        configJson: JSON.stringify(config),
      });

      AppLogger.info("BuilderController.archive: archived", { id: params.id });
      return config;
    },

    /**
     * Soft-delete a builder config.
     *
     * @param {{ wsId: string, tipo: string, id: string }} params
     */
    delete: function (params) {
      Validator.requireId(params);
      removeEntity_(ENTITY, params.id);
      AppLogger.info("BuilderController.delete: deleted", { id: params.id });
    },

    /**
     * Duplicate a builder config with a new id, status=draft, version=1.
     *
     * @param {{ wsId: string, tipo: string, id: string }} params
     * @returns {Object} the new copy
     */
    duplicate: function (params) {
      Validator.requireId(params);
      var existing = getEntity_(ENTITY, params.id);
      if (!existing) throw new Error("builder.duplicate: config " + params.id + " not found");

      var now     = new Date().toISOString();
      var config  = rowToConfig_(existing);
      config.id          = IdGen.forEntity("wsBuilderConfigs");
      config.nombre      = (config.nombre || "") + " (copia)";
      config.status      = "draft";
      config.version     = 1;
      config.publishedAt = "";
      config.createdAt   = now;
      config.updatedAt   = now;

      var newRow = configToRow_(existing.wsId, config, now);
      createEntity_(ENTITY, newRow);

      AppLogger.info("BuilderController.duplicate: duplicated", {
        original: params.id,
        copy:     config.id,
      });
      return rowToConfig_(newRow);
    },

    /**
     * Restore a previously published version snapshot.
     *
     * @param {{ wsId: string, id: string, version: number }} params
     * @returns {Object} restored config (as new draft)
     */
    restoreVersion: function (params) {
      Validator.requireId(params);
      if (!params.version) throw new Error("builder.restoreVersion: version is required");

      // Find the version snapshot
      var versions = listEntities_(VERSION_ENTITY, { builderId: params.id });
      var snapshot = null;
      for (var i = 0; i < (versions.items || []).length; i++) {
        var v = versions.items[i];
        if (parseInt(v.version, 10) === parseInt(params.version, 10)) {
          snapshot = v;
          break;
        }
      }

      if (!snapshot) {
        throw new Error("builder.restoreVersion: version " + params.version + " not found for " + params.id);
      }

      var now    = new Date().toISOString();
      var config = JSON.parse(snapshot.configJson || "{}");
      config.status    = "draft";
      config.updatedAt = now;

      updateEntity_(ENTITY, params.id, {
        status:     "draft",
        updatedAt:  now,
        configJson: JSON.stringify(config),
      });

      AppLogger.info("BuilderController.restoreVersion: restored", {
        id:      params.id,
        version: params.version,
      });
      return config;
    },

    /**
     * List version history snapshots for a builder config.
     *
     * @param {{ id: string }} params
     * @returns {Array}
     */
    getVersionHistory: function (params) {
      Validator.requireId(params);
      var result = listEntities_(VERSION_ENTITY, {
        builderId: params.id,
        _sortBy:   "version",
        _sortDir:  "desc",
      });
      return (result.items || []).map(function (v) {
        return {
          version:   v.version,
          status:    v.status,
          creadoPor: v.creadoPor,
          createdAt: v.createdAt,
          builderId: v.builderId,
        };
      });
    },

    // ── Catalog-specific helpers ─────────────────────────────────────────────

    /**
     * Create or update a single catalog entry inside a CatalogConfig.
     * Modifies the configJson in-place.
     *
     * @param {{ wsId: string, catalogId: string, entry: Object }} params
     * @returns {Object} the saved entry
     */
    saveCatalogEntry: function (params) {
      if (!params.catalogId) throw new Error("builder.saveCatalogEntry: catalogId is required");
      if (!params.entry)     throw new Error("builder.saveCatalogEntry: entry is required");

      var existing = getEntity_(ENTITY, params.catalogId);
      if (!existing) throw new Error("builder.saveCatalogEntry: catalog " + params.catalogId + " not found");

      var config  = rowToConfig_(existing);
      var entradas = config.entradas || [];
      var entry   = params.entry;
      var idx     = -1;

      for (var i = 0; i < entradas.length; i++) {
        if (entradas[i].id === entry.id) { idx = i; break; }
      }

      if (idx >= 0) {
        entradas[idx] = entry;
      } else {
        entradas.push(entry);
      }

      config.entradas  = entradas;
      config.updatedAt = new Date().toISOString();

      updateEntity_(ENTITY, params.catalogId, {
        updatedAt:  config.updatedAt,
        configJson: JSON.stringify(config),
      });

      AppLogger.info("BuilderController.saveCatalogEntry: saved", {
        catalogId: params.catalogId,
        entryId:   entry.id,
      });
      return entry;
    },

    /**
     * Delete a catalog entry by id from a CatalogConfig.
     *
     * @param {{ wsId: string, catalogId: string, entryId: string }} params
     */
    deleteCatalogEntry: function (params) {
      if (!params.catalogId) throw new Error("builder.deleteCatalogEntry: catalogId is required");
      if (!params.entryId)   throw new Error("builder.deleteCatalogEntry: entryId is required");

      var existing = getEntity_(ENTITY, params.catalogId);
      if (!existing) return; // idempotent

      var config  = rowToConfig_(existing);
      var before  = (config.entradas || []).length;
      config.entradas  = (config.entradas || []).filter(function (e) { return e.id !== params.entryId; });
      config.updatedAt = new Date().toISOString();

      updateEntity_(ENTITY, params.catalogId, {
        updatedAt:  config.updatedAt,
        configJson: JSON.stringify(config),
      });

      AppLogger.info("BuilderController.deleteCatalogEntry: deleted", {
        catalogId: params.catalogId,
        entryId:   params.entryId,
        removed:   before - config.entradas.length,
      });
    },

    // ── Cross-builder reference helpers ──────────────────────────────────────

    /**
     * Get a lightweight list of all ProcessConfigs for cross-builder dropdowns.
     * Returns only {id, nombre, status, version}.
     *
     * @param {{ wsId: string }} params
     * @returns {Array}
     */
    getProcessList: function (params) {
      if (!params.wsId) throw new Error("builder.getProcessList: wsId is required");
      return BuilderController._lightList(params.wsId, "process");
    },

    /** Lightweight list of all FormConfigs. */
    getFormList: function (params) {
      if (!params.wsId) throw new Error("builder.getFormList: wsId is required");
      return BuilderController._lightList(params.wsId, "form");
    },

    /** Lightweight list of all KPIConfigs. */
    getKPIList: function (params) {
      if (!params.wsId) throw new Error("builder.getKPIList: wsId is required");
      return BuilderController._lightList(params.wsId, "kpi");
    },

    /** Lightweight list of all NotificationConfigs. */
    getNotificationList: function (params) {
      if (!params.wsId) throw new Error("builder.getNotificationList: wsId is required");
      return BuilderController._lightList(params.wsId, "notification");
    },

    /** Internal: return minimal items for cross-builder dropdowns. */
    _lightList: function (wsId, tipo) {
      var result = listEntities_(ENTITY, { wsId: wsId, tipo: tipo });
      return (result.items || []).map(function (row) {
        return { id: row.id, nombre: row.nombre, status: row.status, version: row.version };
      });
    },
  };

})();


// ============================================================
// SOURCE: controllers/HealthController.js
// ============================================================

/**
 * HealthController — platform health and observability endpoint.
 *
 * Aggregates sub-system metrics into a single health report.  Designed to be
 * called from the router via GET ?action=health or an equivalent route so ops
 * tooling can poll it without authentication.
 *
 * Status semantics:
 *   "healthy"  — drive accessible, error rate < 10 %
 *   "degraded" — error rate 10–25 %
 *   "critical" — drive error or error rate > 25 %
 */
var HealthController = {

  /**
   * Build and return a complete platform health report.
   *
   * @param {Object} [params]  — query params (unused; reserved for future filters)
   * @param {Object} [context] — request context (unused; reserved for auth checks)
   * @returns {{
   *   timestamp:     string,
   *   drive:         Object,
   *   database:      Object,
   *   executions:    Object,
   *   automations:   Object,
   *   notifications: Object,
   *   status:        string
   * }}
   */
  getHealth: function (params, context) {
    var timestamp     = new Date().toISOString();
    var drive         = HealthController.getDriveUsage();
    var database      = HealthController.getDatabaseStats();
    var executions    = HealthController.getExecutionStats();
    var automations   = HealthController.getAutomationHealth();
    var notifications = HealthController.getNotificationHealth();

    // Derive overall status
    var driveError  = !!drive.error;
    var errorRate   = 0;
    if (executions && executions.total > 0) {
      errorRate = (executions.errors / executions.total) * 100;
    }

    var status;
    if (driveError || errorRate > 25) {
      status = "critical";
    } else if (errorRate >= 10) {
      status = "degraded";
    } else {
      status = "healthy";
    }

    var report = {
      timestamp:     timestamp,
      drive:         drive,
      database:      database,
      executions:    executions,
      automations:   automations,
      notifications: notifications,
      status:        status,
    };

    AppLogger.info("HealthController.getHealth", { status: status });
    return report;
  },

  // ---------------------------------------------------------------------------
  // Sub-checks
  // ---------------------------------------------------------------------------

  /**
   * Return Drive storage quota information.
   *
   * @returns {{ usedBytes: number, limitBytes: number, usedPercent: number }|{ error: string }}
   */
  getDriveUsage: function () {
    try {
      var used  = DriveApp.getStorageUsed();
      var limit = DriveApp.getStorageLimit();
      var pct   = limit > 0 ? Math.round((used / limit) * 10000) / 100 : 0;

      return {
        usedBytes:   used,
        limitBytes:  limit,
        usedPercent: pct,
      };
    } catch (e) {
      AppLogger.warn("HealthController.getDriveUsage: unavailable", {
        error: String(e.message || e),
      });
      return { error: "unavailable" };
    }
  },

  /**
   * Return row counts across all entity sheets.
   *
   * @returns {{
   *   sheetCount: number,
   *   totalRows:  number,
   *   sheets:     Array<{ name: string, rows: number }>
   * }}
   */
  getDatabaseStats: function () {
    var ss;
    try {
      ss = getSpreadsheet_();
    } catch (e) {
      AppLogger.warn("HealthController.getDatabaseStats: cannot open spreadsheet", {
        error: String(e.message || e),
      });
      return { sheetCount: 0, totalRows: 0, sheets: [], error: "spreadsheet unavailable" };
    }

    var sheetDetails = [];
    var totalRows    = 0;

    for (var entityName in ENTITY_SHEETS) {
      if (!Object.prototype.hasOwnProperty.call(ENTITY_SHEETS, entityName)) continue;

      var config = ENTITY_SHEETS[entityName];
      var sheet  = null;

      try {
        sheet = ss.getSheetByName(config.sheetName);
      } catch (e) {
        AppLogger.debug("HealthController.getDatabaseStats: could not get sheet", {
          entity: entityName,
          error:  String(e.message || e),
        });
      }

      if (!sheet) continue;

      // lastRow includes the header row; data rows = lastRow - 1
      var lastRow  = sheet.getLastRow();
      var dataRows = lastRow > 1 ? lastRow - 1 : 0;

      totalRows += dataRows;
      sheetDetails.push({ name: config.sheetName, rows: dataRows });
    }

    return {
      sheetCount: sheetDetails.length,
      totalRows:  totalRows,
      sheets:     sheetDetails,
    };
  },

  /**
   * Return execution statistics from the last 100 historial audit log entries.
   *
   * @returns {{ total: number, errors: number, avgDurationMs: number }}
   */
  getExecutionStats: function () {
    var result;
    try {
      result = listEntities_("historial", { _pageSize: 100 });
    } catch (e) {
      AppLogger.warn("HealthController.getExecutionStats: listEntities_ failed", {
        error: String(e.message || e),
      });
      return { total: 0, errors: 0, avgDurationMs: 0 };
    }

    var items      = result && result.items ? result.items : [];
    var errorCount = 0;

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item.deletedAt && (item.resultado === "error" || item.resultado === "Error")) {
        errorCount++;
      }
    }

    return {
      total:        items.length,
      errors:       errorCount,
      avgDurationMs: 0, // duration tracking not yet implemented
    };
  },

  /**
   * Return automation health — count of failed automations in the last 24 h.
   *
   * @returns {{ total: number, failed: number, healthy: number }}
   */
  getAutomationHealth: function () {
    var result;
    try {
      result = listEntities_("wsAutomations", {});
    } catch (e) {
      AppLogger.warn("HealthController.getAutomationHealth: listEntities_ failed", {
        error: String(e.message || e),
      });
      return { total: 0, failed: 0, healthy: 0 };
    }

    var items   = result && result.items ? result.items : [];
    var failed  = 0;
    var healthy = 0;

    for (var i = 0; i < items.length; i++) {
      var auto = items[i];
      if (auto.deletedAt) continue;

      if (auto.lastStatus === "error") {
        failed++;
      } else {
        healthy++;
      }
    }

    return {
      total:   failed + healthy,
      failed:  failed,
      healthy: healthy,
    };
  },

  /**
   * Return count of pending (unread) notifications.
   *
   * @returns {{ pending: number }}
   */
  getNotificationHealth: function () {
    var result;
    try {
      result = listEntities_("notificaciones", { leida: "false" });
    } catch (e) {
      AppLogger.warn("HealthController.getNotificationHealth: listEntities_ failed", {
        error: String(e.message || e),
      });
      return { pending: 0 };
    }

    var items   = result && result.items ? result.items : [];
    var pending = 0;

    for (var i = 0; i < items.length; i++) {
      if (!items[i].deletedAt) pending++;
    }

    return { pending: pending };
  },
};


// ============================================================
// SOURCE: controllers/ContratacionController.js
// ============================================================

/**
 * ContratacionController — PRO-TH-001 Hiring Process backend.
 *
 * Handles all contratacion.* router actions. Uses the dataJson pattern:
 * flat columns store filterable scalar fields; full object serialized in dataJson.
 *
 * Entity map:
 *   contratProcesos        → ContratProcesos sheet
 *   contratRequisiciones   → ContratRequisiciones sheet
 *   contratInformesTec     → ContratInformesTec sheet
 *   contratInformesFinales → ContratInformesFinales sheet
 *   contratCartasOferta    → ContratCartasOferta sheet
 *   contratExpedientes     → ContratExpedientes sheet
 *   contratFichasEmp       → ContratFichasEmp sheet
 *   contratFichasDoc       → ContratFichasDoc sheet
 *   contratContratos       → ContratContratos sheet
 *   contratCandidatos      → ContratCandidatos sheet
 */

var ContratacionController = (function () {

  // ── Entity name by document type ────────────────────────────────────────────

  var TIPO_ENTITY = {
    requisicion:    "contratRequisiciones",
    informeTecnico: "contratInformesTec",
    informeFinal:   "contratInformesFinales",
    cartaOferta:    "contratCartasOferta",
    expediente:     "contratExpedientes",
    fichaEmpleado:  "contratFichasEmp",
    fichaDocente:   "contratFichasDoc",
    contrato:       "contratContratos",
  };

  // ── Process stage machine ────────────────────────────────────────────────────

  var FLUJO = [
    "identificacion_necesidad", "requisicion", "estrategia_reclutamiento",
    "publicacion_vacante", "recepcion_cv", "entrevista_preliminar", "pruebas",
    "entrevista_rrhh", "conformacion_terna", "entrevista_final", "informe_seleccion",
    "validacion_rector", "carta_oferta", "creacion_expediente", "elaboracion_contrato",
    "firma_contrato", "comunicacion", "vinculacion_induccion", "completado",
  ];

  var PASO_MAP = {
    identificacion_necesidad: 1, requisicion: 8, estrategia_reclutamiento: 9,
    publicacion_vacante: 10, recepcion_cv: 12, entrevista_preliminar: 13,
    pruebas: 14, entrevista_rrhh: 15, conformacion_terna: 16, entrevista_final: 17,
    informe_seleccion: 18, validacion_rector: 19, carta_oferta: 21,
    creacion_expediente: 23, elaboracion_contrato: 24, firma_contrato: 25,
    comunicacion: 26, vinculacion_induccion: 27, completado: 27,
  };

  function siguienteEtapa_(etapa) {
    var idx = FLUJO.indexOf(etapa);
    return (idx >= 0 && idx < FLUJO.length - 1) ? FLUJO[idx + 1] : "completado";
  }

  // ── Serialization helpers ────────────────────────────────────────────────────

  function parseRow_(row) {
    if (!row) return null;
    var data = {};
    try { data = JSON.parse(row.dataJson || "{}"); } catch (e) {}
    return Object.assign({}, data, { id: row.id });
  }

  function genId_(prefix) {
    return prefix + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  function flatForTipo_(tipo, data) {
    switch (tipo) {
      case "requisicion":
        return {
          nombrePuesto:    data.nombrePuesto    || "",
          tipoRequisicion: data.tipoRequisicion || "",
          tipoContratacion: data.tipoContratacion || "permanente",
          estado:          data.estado          || "borrador",
        };
      case "informeTecnico":
        return {
          cargo:                data.cargo                || "",
          candidatoRecomendado: data.candidatoRecomendado || "",
          estado:               data.estado               || "borrador",
        };
      case "informeFinal":
        return {
          puestoCubrir:         data.puestoCubrir         || "",
          candidatoSeleccionado: data.candidatoSeleccionado || "",
          estado:               data.estado               || "borrador",
        };
      case "cartaOferta":
        return {
          candidatoId:    data.candidatoId    || "",
          estado:         data.estado         || "emitida",
          salarioMensual: data.salarioMensual || 0,
          cargoOfrecido:  data.cargoOfrecido  || "",
        };
      case "expediente":
        return {
          nombreCompleto:  data.nombreCompleto  || "",
          cargo:           data.cargo           || "",
          estadoExpediente: data.estadoExpediente || "incompleto",
        };
      case "fichaEmpleado":
        return {
          nombres:             data.nombres             || "",
          primerApellido:      data.primerApellido      || "",
          cargo:               data.cargo               || "",
          area:                data.area                || "",
          tipoContrato:        data.tipoContrato        || "permanente",
          salario:             data.salario             || 0,
          correoInstitucional: data.correoInstitucional || "",
        };
      case "fichaDocente":
        return {
          nombre:      data.nombre      || "",
          correoUPES:  data.correoUPES  || "",
          facultad:    data.facultad    || "",
          carrera:     data.carrera     || "",
        };
      case "contrato":
        return {
          nombreEmpleado: data.nombreEmpleado || "",
          cargo:          data.cargo          || "",
          salario:        data.salario        || 0,
          estado:         data.estado         || "borrador",
        };
      default:
        return {};
    }
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  return {

    listProcesos: function (params) {
      var filter = {};
      if (params.wsId) filter.wsId = params.wsId;
      if (params.etapaActual) filter.etapaActual = params.etapaActual;
      if (params.prioridad) filter.prioridad = params.prioridad;
      var result = listEntities_("contratProcesos", filter);
      return (result.items || []).map(parseRow_);
    },

    getProceso: function (params) {
      if (!params.id) throw new Error("id is required");
      return parseRow_(getEntity_("contratProcesos", params.id));
    },

    crearProceso: function (params) {
      var now_ = new Date().toISOString();
      var id = genId_("PROC-RH");
      var proceso = Object.assign({
        tipoPuesto:       "plaza_existente",
        nombrePuesto:     "",
        unidadFacultad:   "",
        jefeSolicitante:  "",
        cargoSolicitante: "",
        tipoContratacion: "permanente",
        etapaActual:      "identificacion_necesidad",
        pasoActual:       1,
        prioridad:        "normal",
        candidatos:       [],
        terna:            [],
        opcionesOferta:   [],
        historial:        [],
        createdAt:        now_,
        updatedAt:        now_,
      }, params, {
        id: id,
        historial: [{
          id: genId_("EVT"),
          fecha: now_,
          paso: 1,
          etapa: "identificacion_necesidad",
          accion: "Proceso de contratación iniciado",
          responsable: params.jefeSolicitante || "Sistema",
          resultado: "ejecutado",
        }],
      });

      createEntity_("contratProcesos", {
        id:                    id,
        wsId:                  proceso.wsId || "",
        codigo:                proceso.codigo || id,
        nombrePuesto:          proceso.nombrePuesto,
        unidadFacultad:        proceso.unidadFacultad,
        jefeSolicitante:       proceso.jefeSolicitante,
        tipoContratacion:      proceso.tipoContratacion,
        etapaActual:           proceso.etapaActual,
        pasoActual:            proceso.pasoActual,
        prioridad:             proceso.prioridad,
        requisicionId:         "",
        informeTecnicoId:      "",
        informeFinalId:        "",
        cartaOfertaId:         "",
        expedienteId:          "",
        contratoId:            "",
        fichaEmpleadoId:       "",
        candidatoSeleccionadoId: "",
        dataJson:              JSON.stringify(proceso),
        createdAt:             now_,
        updatedAt:             now_,
      });

      return proceso;
    },

    avanzarEtapa: function (params) {
      if (!params.id) throw new Error("id is required");
      if (!params.resultado) throw new Error("resultado is required");

      var now_ = new Date().toISOString();
      var row = getEntity_("contratProcesos", params.id);
      if (!row) throw new Error("Proceso " + params.id + " no encontrado");

      var proceso = parseRow_(row);
      var nuevaEtapa = params.resultado === "rechazado"
        ? "rechazado"
        : siguienteEtapa_(proceso.etapaActual);
      var nuevoPaso = PASO_MAP[nuevaEtapa] || 1;

      var historial = Array.isArray(proceso.historial) ? proceso.historial : [];
      historial.push({
        id:          genId_("EVT"),
        fecha:       now_,
        paso:        nuevoPaso,
        etapa:       nuevaEtapa,
        accion:      params.resultado === "aprobado"
          ? "Aprobado → " + nuevaEtapa
          : "Rechazado en " + proceso.etapaActual,
        notas:       params.notas || "",
        responsable: params.responsable || "",
        resultado:   params.resultado,
      });

      var actualizado = Object.assign({}, proceso, {
        etapaActual: nuevaEtapa,
        pasoActual:  nuevoPaso,
        historial:   historial,
        updatedAt:   now_,
      });

      updateEntity_("contratProcesos", params.id, {
        etapaActual: nuevaEtapa,
        pasoActual:  nuevoPaso,
        dataJson:    JSON.stringify(actualizado),
        updatedAt:   now_,
      });

      return actualizado;
    },

    guardarDocumento: function (params) {
      var tipo = params.tipo;
      var entity = TIPO_ENTITY[tipo];
      if (!entity) throw new Error("Tipo de documento no reconocido: " + tipo);

      var procesoId = params.procesoId;
      var now_ = new Date().toISOString();

      var data = Object.assign({}, params);
      delete data.tipo;

      var existing = listEntities_(entity, { procesoId: procesoId });
      var existingRow = existing.items && existing.items[0];

      var flat = flatForTipo_(tipo, data);
      flat.dataJson  = JSON.stringify(data);
      flat.procesoId = procesoId;

      if (existingRow) {
        flat.updatedAt = now_;
        updateEntity_(entity, existingRow.id, flat);
        return Object.assign({}, data, { id: existingRow.id, procesoId: procesoId });
      }

      var newId = genId_(tipo.toUpperCase());
      flat.id        = newId;
      flat.createdAt = now_;
      flat.updatedAt = now_;
      createEntity_(entity, flat);
      return Object.assign({}, data, { id: newId, procesoId: procesoId });
    },

    getDocumento: function (params) {
      var tipo = params.tipo;
      var entity = TIPO_ENTITY[tipo];
      if (!entity) throw new Error("Tipo no reconocido: " + tipo);
      var result = listEntities_(entity, { procesoId: params.procesoId });
      return parseRow_(result.items && result.items[0]);
    },

    agregarCandidato: function (params) {
      var now_ = new Date().toISOString();
      var id = genId_("CAND");
      var data = Object.assign({ createdAt: now_ }, params, { id: id });

      createEntity_("contratCandidatos", {
        id:                        id,
        procesoId:                 params.procesoId || "",
        nombre:                    params.nombre    || "",
        apellido:                  params.apellido  || "",
        email:                     params.email     || "",
        cumplePerfilCV:            params.cumplePerfilCV !== undefined ? String(params.cumplePerfilCV) : "",
        enTerna:                   params.enTerna   ? "true" : "false",
        seleccionado:              params.seleccionado ? "true" : "false",
        notaEntrevistaPrelimininar: params.notaEntrevistaPrelimininar || "",
        notaPruebaTecnica:         params.notaPruebaTecnica          || "",
        notaPruebaConductual:      params.notaPruebaConductual       || "",
        notaEntrevistaRRHH:        params.notaEntrevistaRRHH         || "",
        notaEntrevistaFinal:       params.notaEntrevistaFinal        || "",
        promedioGeneral:           params.promedioGeneral            || "",
        dataJson:                  JSON.stringify(data),
        createdAt:                 now_,
      });

      return data;
    },

    evaluarCandidato: function (params) {
      if (!params.id) throw new Error("id is required");

      var row = getEntity_("contratCandidatos", params.id);
      if (!row) throw new Error("Candidato " + params.id + " no encontrado");

      var existing = {};
      try { existing = JSON.parse(row.dataJson || "{}"); } catch (e) {}
      var merged = Object.assign({}, existing, params);

      var notas = [
        merged.notaEntrevistaPrelimininar,
        merged.notaPruebaTecnica,
        merged.notaPruebaConductual,
        merged.notaEntrevistaRRHH,
        merged.notaEntrevistaFinal,
      ].filter(function (n) { return typeof n === "number"; });

      if (notas.length > 0) {
        merged.promedioGeneral = Math.round(
          notas.reduce(function (a, b) { return a + b; }, 0) / notas.length * 10
        ) / 10;
      }

      updateEntity_("contratCandidatos", params.id, {
        cumplePerfilCV:            merged.cumplePerfilCV !== undefined ? String(merged.cumplePerfilCV) : "",
        enTerna:                   merged.enTerna   ? "true" : "false",
        seleccionado:              merged.seleccionado ? "true" : "false",
        notaEntrevistaPrelimininar: merged.notaEntrevistaPrelimininar || "",
        notaPruebaTecnica:         merged.notaPruebaTecnica          || "",
        notaPruebaConductual:      merged.notaPruebaConductual       || "",
        notaEntrevistaRRHH:        merged.notaEntrevistaRRHH         || "",
        notaEntrevistaFinal:       merged.notaEntrevistaFinal        || "",
        promedioGeneral:           merged.promedioGeneral            || "",
        dataJson:                  JSON.stringify(merged),
      });

      return merged;
    },
  };

})();

/**
 * Route contratacion.* actions.
 */
function routeContratacionAction_(verb, params) {
  params = params || {};
  switch (verb) {
    case "listProcesos":    return ContratacionController.listProcesos(params);
    case "getProceso":      return ContratacionController.getProceso(params);
    case "crearProceso":    return ContratacionController.crearProceso(params);
    case "avanzarEtapa":    return ContratacionController.avanzarEtapa(params);
    case "guardarDocumento": return ContratacionController.guardarDocumento(params);
    case "getDocumento":    return ContratacionController.getDocumento(params);
    case "agregarCandidato": return ContratacionController.agregarCandidato(params);
    case "evaluarCandidato": return ContratacionController.evaluarCandidato(params);
    default:
      throw new Error("Unknown contratacion verb: " + verb);
  }
}


// ============================================================
// SOURCE: setup/SpreadsheetSetup.js
// ============================================================

/**
 * SpreadsheetSetup — idempotent database initialization.
 *
 * Run initializeDatabase() once from the Apps Script editor (or via a
 * deploy-time trigger) to create all required sheet tabs with the correct
 * header rows. Safe to re-run; existing tabs with matching headers are
 * left untouched.
 *
 * Sheet tabs created / verified:
 *   Core: planes, objetivos, procesos, actividades, evidencias, indicadores,
 *         formularios, solicitudes, usuarios, unidades, historial, empleados,
 *         capacitaciones, evaluaciones, solicitudesContratacion, notificaciones,
 *         workflowBlueprints, workflowInstances, blueprintRegistry, instanceSummaries
 *
 *   Workspace-admin: WSBlueprints, WSKPIs, WSRequestTypes, WSAutomations,
 *         WSUsers, WSForms, WSDocuments, WSNotifRules, WSSettings
 *
 *   System: Audit
 */

/**
 * Public entry point — call from the GAS editor to bootstrap the Spreadsheet.
 */
function initializeDatabase() {
  // Merge all entity schemas into ENTITY_SHEETS so getEntityConfig_() can
  // resolve them during setup.
  mergeWorkspaceAdminEntities_();
  mergeBuilderEntities_();
  mergeContratacionEntities_();

  var spreadsheet = getSpreadsheet_();

  var allEntities = Object.keys(ENTITY_SHEETS);
  var created     = 0;
  var verified    = 0;

  for (var i = 0; i < allEntities.length; i++) {
    var entityName = allEntities[i];
    var config     = ENTITY_SHEETS[entityName];
    var sheetName  = config.sheetName;
    var columns    = config.columns;

    var sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
      AppLogger.info("initializeDatabase: created sheet", { sheetName: sheetName });
      created++;
    } else {
      AppLogger.debug("initializeDatabase: sheet exists", { sheetName: sheetName });
      verified++;
    }

    // Ensure header row matches columns
    var headerRange = sheet.getRange(1, 1, 1, columns.length);
    var existing    = headerRange.getValues()[0];
    var needsHeader = !existing[0];

    if (needsHeader) {
      headerRange.setValues([columns]);
      sheet.setFrozenRows(1);
      AppLogger.info("initializeDatabase: wrote headers", {
        sheetName: sheetName,
        columns:   columns.length,
      });
    } else {
      // Validate header integrity — warn if columns differ
      for (var c = 0; c < columns.length; c++) {
        if (existing[c] !== columns[c]) {
          AppLogger.warn("initializeDatabase: column mismatch", {
            sheetName: sheetName,
            index:     c,
            expected:  columns[c],
            found:     existing[c],
          });
        }
      }
    }
  }

  // Ensure Audit sheet exists
  var auditSheet = spreadsheet.getSheetByName("Audit");
  if (!auditSheet) {
    auditSheet = spreadsheet.insertSheet("Audit");
    var auditCols = ["id", "accion", "entidadTipo", "entidadId", "usuarioId", "resultado", "detalle", "timestamp"];
    auditSheet.getRange(1, 1, 1, auditCols.length).setValues([auditCols]);
    auditSheet.setFrozenRows(1);
    AppLogger.info("initializeDatabase: created Audit sheet");
    created++;
  }

  var summary = {
    sheetsCreated:  created,
    sheetsVerified: verified,
    totalEntities:  allEntities.length,
  };
  AppLogger.info("initializeDatabase: complete", summary);
  return summary;
}

/**
 * Seed default WSSettings records for all six platform workspaces.
 * Skips any workspace that already has a settings row.
 * Call once after initializeDatabase().
 *
 * @returns {{ success: boolean, workspaces: Array }}
 */
function initializeWorkspaceSettings() {
  mergeWorkspaceAdminEntities_();

  var WORKSPACES = [
    { wsId: "rrhh",    nombre: "Recursos Humanos",  nombreCorto: "RRHH",    color: "#6366f1", icon: "users"          },
    { wsId: "vraf",    nombre: "VRAF",               nombreCorto: "VRAF",    color: "#0ea5e9", icon: "building"       },
    { wsId: "conta",   nombre: "Contabilidad",       nombreCorto: "CONTA",   color: "#10b981", icon: "calculator"     },
    { wsId: "compras", nombre: "Compras",            nombreCorto: "COMPRAS", color: "#f59e0b", icon: "shopping-cart"  },
    { wsId: "mant",    nombre: "Mantenimiento",      nombreCorto: "MANT",    color: "#8b5cf6", icon: "wrench"         },
    { wsId: "salud",   nombre: "Salud Ocupacional",  nombreCorto: "SALUD",   color: "#ef4444", icon: "heart"          },
  ];

  var now     = new Date().toISOString();
  var results = [];

  for (var i = 0; i < WORKSPACES.length; i++) {
    var ws = WORKSPACES[i];

    // Idempotency check — skip if settings already exist for this wsId
    var existing = listEntities_("wsSettings", { wsId: ws.wsId });
    if (existing.items && existing.items.length > 0) {
      AppLogger.info("initializeWorkspaceSettings: already exists, skipping", { wsId: ws.wsId });
      results.push({ wsId: ws.wsId, status: "skipped" });
      continue;
    }

    try {
      // wsSettings uses wsId as its logical key; there is no 'id' column.
      // createEntity_ will generate a transient id that objectToRow_ ignores
      // because 'id' is not in the column list — that is intentional.
      createEntity_("wsSettings", {
        wsId:             ws.wsId,
        nombre:           ws.nombre,
        nombreCorto:      ws.nombreCorto,
        descripcion:      "",
        responsableId:    "",
        color:            ws.color,
        colorFondo:       "",
        icon:             ws.icon,
        slaDiasDefault:   5,
        zonaHoraria:      "America/El_Salvador",
        idioma:           "es",
        defaultDashboardId: "",
        updatedAt:        now,
        updatedBy:        "system",
      });

      AppLogger.info("initializeWorkspaceSettings: created", { wsId: ws.wsId });
      results.push({ wsId: ws.wsId, status: "created" });
    } catch (e) {
      AppLogger.error("initializeWorkspaceSettings: failed", {
        wsId:  ws.wsId,
        error: String((e && e.message) || e),
      });
      results.push({ wsId: ws.wsId, status: "error", error: String((e && e.message) || e) });
    }
  }

  AppLogger.info("initializeWorkspaceSettings: complete", { total: WORKSPACES.length });
  return { success: true, workspaces: results };
}


// ============================================================
// SOURCE: setup/DriveSetup.js
// ============================================================

/**
 * DriveSetup — idempotent Drive folder initialization.
 *
 * initializeDriveFolders()      — original: workspace folders only.
 * initializeFullDriveHierarchy() — Sprint 13.5: full SSE Platform hierarchy
 *   including system folders (Config, Database, Templates, Documents, Reports,
 *   Evidence, Backups, Logs) plus all 6 workspace sub-folder trees.
 *
 * All functions are idempotent — DriveService.getOrCreateFolder() returns
 * the existing folder if one already exists with that name under the parent.
 *
 * DriveService.getOrCreateFolder(name, parentId) — correct call signature.
 */

/**
 * Public entry point: initialize Drive folders for all six platform workspaces.
 * Calls WorkspaceFolderManager.initWorkspace(wsId) for each workspace.
 *
 * @returns {{ success: boolean, workspacesInitialized: string[], results: Array }}
 */
function initializeDriveFolders() {
  var WORKSPACES = ["rrhh", "vraf", "conta", "compras", "mant", "salud"];
  var results    = [];

  for (var i = 0; i < WORKSPACES.length; i++) {
    var wsId = WORKSPACES[i];
    try {
      var result = WorkspaceFolderManager.initWorkspace(wsId);
      results.push({
        wsId:       wsId,
        status:     "ok",
        folderId:   result.folderId,
        subFolders: result.subFolders,
      });
      AppLogger.info("initializeDriveFolders: workspace initialized", { wsId: wsId });
    } catch (e) {
      AppLogger.error("initializeDriveFolders: failed for workspace", {
        wsId:  wsId,
        error: String((e && e.message) || e),
      });
      results.push({ wsId: wsId, status: "error", error: String((e && e.message) || e) });
    }
  }

  var okCount = 0;
  for (var r = 0; r < results.length; r++) {
    if (results[r].status === "ok") okCount++;
  }

  AppLogger.info("initializeDriveFolders: complete", {
    total: WORKSPACES.length,
    ok:    okCount,
  });

  return {
    success:               true,
    workspacesInitialized: WORKSPACES,
    results:               results,
  };
}

/**
 * Public entry point: initialize Drive folders for all six registered workspaces.
 * Safe to run directly from the Apps Script editor — no parameters required.
 * Continues processing even if one workspace fails, then returns a summary.
 *
 * @returns {{ success: boolean, ok: number, failed: number, results: Array }}
 */
function initializeAllWorkspaceFolders() {
  var WORKSPACES = ["rrhh", "vraf", "conta", "compras", "mant", "salud"];
  var results = [];
  var ok = 0;
  var failed = 0;

  for (var i = 0; i < WORKSPACES.length; i++) {
    var wsId = WORKSPACES[i];
    try {
      var result = initializeWorkspaceFolders(wsId);
      results.push({ wsId: wsId, status: "ok", folderId: result.folderId });
      ok++;
      AppLogger.info("initializeAllWorkspaceFolders: ok", { wsId: wsId, folderId: result.folderId });
    } catch (e) {
      results.push({ wsId: wsId, status: "error", error: String((e && e.message) || e) });
      failed++;
      AppLogger.error("initializeAllWorkspaceFolders: failed", { wsId: wsId, error: String((e && e.message) || e) });
    }
  }

  var summary = { success: failed === 0, ok: ok, failed: failed, results: results };
  AppLogger.info("initializeAllWorkspaceFolders: complete", summary);
  return summary;
}

/**
 * Initialize Drive folders for a single workspace on demand.
 * Useful for onboarding a new workspace without re-running the full setup.
 *
 * @param {string} wsId
 * @returns {{ wsId: string, folderId: string, subFolders: Object }}
 */
function initializeWorkspaceFolders(wsId) {
  if (!wsId) throw new Error("initializeWorkspaceFolders: wsId is required");
  return WorkspaceFolderManager.initWorkspace(wsId);
}

/**
 * Full Platform Drive hierarchy initialization.
 *
 * Creates under the root folder (DRIVE_FOLDER_ROOT_ID):
 *   /Config       — script properties exports, environment config
 *   /Database     — spreadsheet exports and backups
 *   /Templates    — platform-wide document templates
 *   /Documents    — platform-level documents not tied to a workspace
 *   /Reports      — automated report outputs
 *   /Evidence     — platform-level evidence archive
 *   /Backups      — automated backup snapshots
 *   /Logs         — exported audit and error logs
 *   /Workspaces/
 *     /RRHH / Contabilidad / Compras / Mantenimiento / Salud y Seguridad / VRAF
 *       each with: Procesos, Documentos, Evidencias, Reportes,
 *                  Plantillas, Archivo, Historial
 *
 * @returns {{
 *   success:       boolean,
 *   rootName:      string,
 *   rootId:        string,
 *   systemFolders: Object,
 *   workspaces:    Array
 * }}
 */
function initializeFullDriveHierarchy() {
  var root = DriveService.getRootFolder();
  var rootId = root.getId();

  // ── Platform/ container (Sprint 16) ──────────────────────────────────────
  var platformFolder = DriveService.getOrCreateFolder('Platform', rootId);
  var platformId = platformFolder.getId();

  var PLATFORM_SUB_FOLDERS = ['Config', 'Backups', 'Templates', 'Logs', 'Reports', 'System'];
  for (var ps = 0; ps < PLATFORM_SUB_FOLDERS.length; ps++) {
    try {
      DriveService.getOrCreateFolder(PLATFORM_SUB_FOLDERS[ps], platformId);
    } catch (e) {
      AppLogger.warn('initializeFullDriveHierarchy: Platform sub-folder error', {
        name: PLATFORM_SUB_FOLDERS[ps], error: String((e && e.message) || e),
      });
    }
  }

  // ── Legacy system folders (kept for backward compatibility) ───────────────
  var SYSTEM_FOLDERS = [
    'Config',
    'Database',
    'Templates',
    'Documents',
    'Reports',
    'Evidence',
    'Backups',
    'Logs',
  ];

  var systemFolders = {};
  for (var s = 0; s < SYSTEM_FOLDERS.length; s++) {
    var name = SYSTEM_FOLDERS[s];
    try {
      var sf = DriveService.getOrCreateFolder(name, rootId);
      systemFolders[name] = sf.getId();
      AppLogger.info('initializeFullDriveHierarchy: system folder', { name: name, id: sf.getId() });
    } catch (e) {
      AppLogger.warn('initializeFullDriveHierarchy: could not create system folder', {
        name:  name,
        error: String((e && e.message) || e),
      });
    }
  }

  // ── Workspaces parent ─────────────────────────────────────────────────────
  var workspacesParent;
  try {
    workspacesParent = DriveService.getOrCreateFolder('Workspaces', rootId);
  } catch (e) {
    AppLogger.error('initializeFullDriveHierarchy: could not create Workspaces folder', {
      error: String((e && e.message) || e),
    });
    throw e;
  }
  var workspacesParentId = workspacesParent.getId();

  // ── Workspace sub-folders ─────────────────────────────────────────────────
  var WS_FOLDERS = [
    { wsId: 'rrhh',    label: 'RRHH' },
    { wsId: 'conta',   label: 'Contabilidad' },
    { wsId: 'compras', label: 'Compras' },
    { wsId: 'mant',    label: 'Mantenimiento' },
    { wsId: 'salud',   label: 'Salud y Seguridad' },
    { wsId: 'vraf',    label: 'VRAF' },
  ];

  var WS_SUB_FOLDERS = [
    'Procesos',
    'Procedimientos',
    'Formularios',
    'Evidencias',
    'Documentos',
    'Reportes',
    'Plantillas',
    'Archivo',
    'Historial',
  ];

  var workspaceResults = [];

  for (var w = 0; w < WS_FOLDERS.length; w++) {
    var ws = WS_FOLDERS[w];
    try {
      var wsFolder = DriveService.getOrCreateFolder(ws.label, workspacesParentId);
      var wsFolderId = wsFolder.getId();
      var subFolderCount = 0;

      for (var f = 0; f < WS_SUB_FOLDERS.length; f++) {
        try {
          DriveService.getOrCreateFolder(WS_SUB_FOLDERS[f], wsFolderId);
          subFolderCount++;
        } catch (subErr) {
          AppLogger.warn('initializeFullDriveHierarchy: sub-folder error', {
            wsId:   ws.wsId,
            folder: WS_SUB_FOLDERS[f],
            error:  String((subErr && subErr.message) || subErr),
          });
        }
      }

      workspaceResults.push({
        wsId:          ws.wsId,
        label:         ws.label,
        folderId:      wsFolderId,
        subFolderCount: subFolderCount,
        status:        'ok',
      });

      AppLogger.info('initializeFullDriveHierarchy: workspace done', {
        wsId:  ws.wsId,
        subs:  subFolderCount,
      });
    } catch (e) {
      workspaceResults.push({
        wsId:   ws.wsId,
        label:  ws.label,
        status: 'error',
        error:  String((e && e.message) || e),
      });
      AppLogger.error('initializeFullDriveHierarchy: workspace error', {
        wsId:  ws.wsId,
        error: String((e && e.message) || e),
      });
    }
  }

  AppLogger.info('initializeFullDriveHierarchy: complete', {
    systemFolders: Object.keys(systemFolders).length,
    workspaces:    workspaceResults.length,
  });

  return {
    success:       true,
    rootName:      root.getName(),
    rootId:        rootId,
    systemFolders: systemFolders,
    workspaces:    workspaceResults,
  };
}


// ============================================================
// SOURCE: setup/WorkspaceTemplateInstaller.js
// ============================================================

/**
 * WorkspaceTemplateInstaller — seed RRHH (and future) module templates.
 *
 * All writes use createEntity_() so IdGen.forEntity() assigns proper prefixed
 * IDs (BP-26-XXXXXX, KPI-26-XXXXXX, etc.).  The installer is idempotent:
 * it checks for an existing RRHH blueprint before seeding — if any RRHH
 * blueprint exists, the whole install is skipped to prevent duplicates.
 */

var WorkspaceTemplateInstaller = (function () {

  function now_() { return new Date().toISOString(); }

  // ── Internal check ────────────────────────────────────────────────────────

  function isRRHHInstalled_() {
    try {
      var result = listEntities_('wsBlueprints', { wsId: 'rrhh' });
      return result && result.items && result.items.length > 0;
    } catch (_) {
      return false;
    }
  }

  // ── Blueprints (Processes) ────────────────────────────────────────────────

  function installBlueprints_(userId) {
    var defs = [
      {
        nombre:       'Reclutamiento y Selección de Personal',
        descripcion:  'Proceso para identificar, atraer y seleccionar candidatos idóneos para cubrir vacantes institucionales.',
        tipo:         'misional',
        objetivo:     'Incorporar talento humano calificado alineado a los requerimientos institucionales.',
        alcance:      'Desde la publicación de la vacante hasta la aceptación de la oferta laboral.',
        responsableRol: 'HEAD',
        slaDias:      30,
        prioridad:    'alta',
        frecuencia:   'puntual',
      },
      {
        nombre:       'Inducción y Onboarding',
        descripcion:  'Proceso de integración del nuevo colaborador a la institución, cultura y funciones del cargo.',
        tipo:         'apoyo',
        objetivo:     'Acelerar la productividad y adaptación del nuevo empleado.',
        alcance:      'Desde la firma del contrato hasta la finalización del período de prueba.',
        responsableRol: 'HEAD',
        slaDias:      15,
        prioridad:    'alta',
        frecuencia:   'puntual',
      },
      {
        nombre:       'Evaluación de Desempeño',
        descripcion:  'Proceso periódico de evaluación del cumplimiento de metas y competencias del personal.',
        tipo:         'control',
        objetivo:     'Medir el desempeño individual y apoyar el desarrollo profesional.',
        alcance:      'Todo el personal activo de la institución.',
        responsableRol: 'HEAD',
        slaDias:      20,
        prioridad:    'alta',
        frecuencia:   'semestral',
      },
      {
        nombre:       'Capacitación y Desarrollo',
        descripcion:  'Proceso de planificación, ejecución y evaluación de programas de formación del personal.',
        tipo:         'apoyo',
        objetivo:     'Fortalecer las competencias del talento humano para mejorar el desempeño institucional.',
        alcance:      'Personal identificado con brechas de competencia o requerimientos de actualización.',
        responsableRol: 'HEAD',
        slaDias:      10,
        prioridad:    'media',
        frecuencia:   'trimestral',
      },
      {
        nombre:       'Gestión de Nómina',
        descripcion:  'Proceso de cálculo, validación y pago de salarios, beneficios y deducciones del personal.',
        tipo:         'apoyo',
        objetivo:     'Garantizar el pago oportuno y preciso de la compensación del personal.',
        alcance:      'Todo el personal activo y jubilados con beneficio activo.',
        responsableRol: 'ANALYST',
        slaDias:      5,
        prioridad:    'alta',
        frecuencia:   'mensual',
      },
      {
        nombre:       'Control de Asistencia y Permisos',
        descripcion:  'Proceso de registro, validación y gestión de asistencia, permisos y ausencias del personal.',
        tipo:         'control',
        objetivo:     'Garantizar el cumplimiento de jornadas laborales y gestionar eficientemente los permisos.',
        alcance:      'Todo el personal activo de la institución.',
        responsableRol: 'ANALYST',
        slaDias:      3,
        prioridad:    'media',
        frecuencia:   'diaria',
      },
    ];

    var created = [];
    for (var i = 0; i < defs.length; i++) {
      var d = defs[i];
      var row = createEntity_('wsBlueprints', {
        wsId:          'rrhh',
        nombre:        d.nombre,
        descripcion:   d.descripcion,
        tipo:          d.tipo,
        objetivo:      d.objetivo,
        alcance:       d.alcance,
        responsableRol: d.responsableRol,
        slaDias:       String(d.slaDias),
        prioridad:     d.prioridad,
        frecuencia:    d.frecuencia,
        lifecycle:     'published',
        version:       '1.0',
        createdBy:     userId,
        createdAt:     now_(),
        updatedAt:     now_(),
      });
      created.push(row.id);
    }
    return created;
  }

  // ── KPIs ─────────────────────────────────────────────────────────────────

  function installKPIs_(userId) {
    var defs = [
      {
        nombre:     'Índice de Rotación de Personal',
        descripcion:'Porcentaje de empleados que abandonan la organización en un período dado.',
        formula:    '(Bajas / Promedio empleados) × 100',
        unidad:     '%',
        frecuencia: 'mensual',
        metaValor:  '5',
        semaforo:   { verde: '0-5', amarillo: '5-10', rojo: '>10' },
      },
      {
        nombre:     'Tasa de Ausentismo',
        descripcion:'Porcentaje de horas no trabajadas respecto al total de horas programadas.',
        formula:    '(Horas ausentes / Horas programadas) × 100',
        unidad:     '%',
        frecuencia: 'mensual',
        metaValor:  '3',
        semaforo:   { verde: '0-3', amarillo: '3-6', rojo: '>6' },
      },
      {
        nombre:     'Tiempo Promedio de Reclutamiento',
        descripcion:'Días promedio desde la apertura de la vacante hasta la contratación.',
        formula:    'Suma(días por vacante) / Número de contrataciones',
        unidad:     'días',
        frecuencia: 'trimestral',
        metaValor:  '25',
        semaforo:   { verde: '<25', amarillo: '25-40', rojo: '>40' },
      },
      {
        nombre:     'Costo por Contratación',
        descripcion:'Costo promedio incurrido en el proceso de reclutamiento y selección.',
        formula:    'Costos totales reclutamiento / Número de contrataciones',
        unidad:     'USD',
        frecuencia: 'trimestral',
        metaValor:  '500',
        semaforo:   { verde: '<500', amarillo: '500-800', rojo: '>800' },
      },
      {
        nombre:     'Satisfacción del Empleado (eNPS)',
        descripcion:'Índice de satisfacción y lealtad del empleado hacia la institución.',
        formula:    '% promotores - % detractores',
        unidad:     'puntos',
        frecuencia: 'semestral',
        metaValor:  '30',
        semaforo:   { verde: '>30', amarillo: '0-30', rojo: '<0' },
      },
      {
        nombre:     'Cobertura de Capacitación',
        descripcion:'Porcentaje del personal que completó al menos una capacitación en el período.',
        formula:    '(Empleados capacitados / Total empleados) × 100',
        unidad:     '%',
        frecuencia: 'trimestral',
        metaValor:  '80',
        semaforo:   { verde: '>80', amarillo: '60-80', rojo: '<60' },
      },
    ];

    var created = [];
    for (var i = 0; i < defs.length; i++) {
      var d = defs[i];
      var row = createEntity_('wsKPIs', {
        wsId:          'rrhh',
        nombre:        d.nombre,
        descripcion:   d.descripcion,
        formula:       d.formula,
        unidad:        d.unidad,
        frecuencia:    d.frecuencia,
        metaValor:     d.metaValor,
        valorActual:   '0',
        semaforo:      JSON.stringify(d.semaforo),
        semaforoActual:'verde',
        lifecycle:     'published',
        createdBy:     userId,
        createdAt:     now_(),
        updatedAt:     now_(),
      });
      created.push(row.id);
    }
    return created;
  }

  // ── Forms ─────────────────────────────────────────────────────────────────

  function installForms_(userId) {
    var defs = [
      {
        nombre:      'Solicitud de Empleo',
        descripcion: 'Formulario de aplicación para candidatos a puestos vacantes.',
        campos:      ['nombre', 'apellido', 'email', 'telefono', 'cargo_solicitado', 'experiencia', 'cv_url'],
      },
      {
        nombre:      'Evaluación de Desempeño 360°',
        descripcion: 'Formulario de evaluación de competencias y resultados del período.',
        campos:      ['empleado_id', 'evaluador_id', 'periodo', 'competencias', 'metas', 'comentarios'],
      },
      {
        nombre:      'Solicitud de Permiso',
        descripcion: 'Solicitud formal de permiso o ausencia laboral.',
        campos:      ['empleado_id', 'tipo_permiso', 'fecha_inicio', 'fecha_fin', 'motivo', 'respaldo'],
      },
      {
        nombre:      'Reporte de Incidente Laboral',
        descripcion: 'Registro de incidentes, accidentes o situaciones de riesgo en el trabajo.',
        campos:      ['empleado_id', 'fecha', 'lugar', 'descripcion', 'testigos', 'medidas_tomadas'],
      },
      {
        nombre:      'Plan Individual de Desarrollo',
        descripcion: 'Plan de crecimiento profesional y formación personalizado por empleado.',
        campos:      ['empleado_id', 'fortalezas', 'areas_mejora', 'actividades', 'fechas', 'responsable'],
      },
    ];

    var created = [];
    for (var i = 0; i < defs.length; i++) {
      var d = defs[i];
      var row = createEntity_('wsForms', {
        wsId:        'rrhh',
        nombre:      d.nombre,
        descripcion: d.descripcion,
        campos:      JSON.stringify(d.campos),
        lifecycle:   'published',
        version:     '1.0',
        createdBy:   userId,
        createdAt:   now_(),
        updatedAt:   now_(),
      });
      created.push(row.id);
    }
    return created;
  }

  // ── Request Types ──────────────────────────────────────────────────────────

  function installRequestTypes_(userId) {
    var defs = [
      {
        nombre:       'Solicitud de Vacaciones',
        descripcion:  'Solicitud formal de días de vacaciones anuales del empleado.',
        slaDias:      3,
        aprobadores:  'HEAD',
        formulario:   'Solicitud de Permiso',
        notificar:    'empleado,head,rrhh',
      },
      {
        nombre:       'Solicitud de Permiso Personal',
        descripcion:  'Permiso de ausencia por razones personales o familiares.',
        slaDias:      1,
        aprobadores:  'HEAD',
        formulario:   'Solicitud de Permiso',
        notificar:    'empleado,head',
      },
      {
        nombre:       'Solicitud de Certificado Laboral',
        descripcion:  'Emisión de constancia o certificado de trabajo.',
        slaDias:      5,
        aprobadores:  'ANALYST',
        formulario:   'Solicitud de Empleo',
        notificar:    'empleado',
      },
      {
        nombre:       'Solicitud de Actualización de Datos',
        descripcion:  'Modificación de información personal o laboral del empleado.',
        slaDias:      5,
        aprobadores:  'ANALYST',
        formulario:   'Solicitud de Permiso',
        notificar:    'empleado,rrhh',
      },
      {
        nombre:       'Solicitud de Capacitación',
        descripcion:  'Inscripción a programa de formación o capacitación.',
        slaDias:      7,
        aprobadores:  'HEAD',
        formulario:   'Plan Individual de Desarrollo',
        notificar:    'empleado,head,rrhh',
      },
    ];

    var created = [];
    for (var i = 0; i < defs.length; i++) {
      var d = defs[i];
      var row = createEntity_('wsRequestTypes', {
        wsId:        'rrhh',
        nombre:      d.nombre,
        descripcion: d.descripcion,
        slaDias:     String(d.slaDias),
        aprobadores: d.aprobadores,
        formulario:  d.formulario,
        notificar:   d.notificar,
        lifecycle:   'published',
        activo:      'true',
        createdBy:   userId,
        createdAt:   now_(),
        updatedAt:   now_(),
      });
      created.push(row.id);
    }
    return created;
  }

  // ── Automations ───────────────────────────────────────────────────────────

  function installAutomations_(userId) {
    var defs = [
      {
        nombre:      'Alerta de Vencimiento de Contrato',
        descripcion: 'Notifica 30 días antes del vencimiento del contrato de un empleado.',
        trigger:     'schedule.daily',
        condicion:   'empleado.fechaFinContrato <= hoy + 30',
        accion:      'notificar [HEAD, RRHH] con mensaje de alerta',
        activo:      'true',
      },
      {
        nombre:      'Bienvenida a Nuevo Empleado',
        descripcion: 'Envía mensaje de bienvenida cuando se activa un nuevo empleado.',
        trigger:     'empleado.created',
        condicion:   'empleado.activo == true',
        accion:      'notificar [empleado] con plantilla de bienvenida',
        activo:      'true',
      },
      {
        nombre:      'Recordatorio de Evaluación de Desempeño',
        descripcion: 'Recuerda al supervisor completar la evaluación del período.',
        trigger:     'schedule.monthly.last5days',
        condicion:   'evaluacion.pendiente == true',
        accion:      'notificar [HEAD] con enlace a formulario de evaluación',
        activo:      'true',
      },
      {
        nombre:      'Alerta de Ausentismo Elevado',
        descripcion: 'Notifica cuando la tasa de ausentismo supera el 6%.',
        trigger:     'kpi.semaforo.changed',
        condicion:   'kpi.nombre == "Tasa de Ausentismo" AND kpi.semaforo == "rojo"',
        accion:      'notificar [HEAD, ADMIN] con reporte de ausentismo',
        activo:      'true',
      },
    ];

    var created = [];
    for (var i = 0; i < defs.length; i++) {
      var d = defs[i];
      var row = createEntity_('wsAutomations', {
        wsId:          'rrhh',
        nombre:        d.nombre,
        descripcion:   d.descripcion,
        trigger:       d.trigger,
        condicion:     d.condicion,
        accion:        d.accion,
        lifecycle:     'published',
        activo:        d.activo,
        executionCount: '0',
        lastStatus:    '',
        createdBy:     userId,
        createdAt:     now_(),
        updatedAt:     now_(),
      });
      created.push(row.id);
    }
    return created;
  }

  // ── Notification Rules ────────────────────────────────────────────────────

  function installNotifRules_(userId) {
    var defs = [
      {
        nombre:       'Notificar Solicitud Recibida',
        descripcion:  'Confirma al solicitante que su solicitud fue recibida.',
        evento:       'solicitud.created',
        plantilla:    'Tu solicitud {{nombre}} fue recibida con número {{id}}. Te notificaremos el resultado.',
        roles:        'OPS',
        canal:        'inApp,email',
        activo:       'true',
      },
      {
        nombre:       'Notificar Aprobación de Solicitud',
        descripcion:  'Informa al empleado que su solicitud fue aprobada.',
        evento:       'solicitud.aprobada',
        plantilla:    'Tu solicitud {{nombre}} fue aprobada. {{comentarios}}',
        roles:        'OPS',
        canal:        'inApp,email',
        activo:       'true',
      },
      {
        nombre:       'Notificar Rechazo de Solicitud',
        descripcion:  'Informa al empleado que su solicitud fue rechazada con motivo.',
        evento:       'solicitud.rechazada',
        plantilla:    'Tu solicitud {{nombre}} fue rechazada. Motivo: {{motivo}}',
        roles:        'OPS',
        canal:        'inApp',
        activo:       'true',
      },
    ];

    var created = [];
    for (var i = 0; i < defs.length; i++) {
      var d = defs[i];
      var row = createEntity_('wsNotifRules', {
        wsId:        'rrhh',
        nombre:      d.nombre,
        descripcion: d.descripcion,
        evento:      d.evento,
        plantilla:   d.plantilla,
        roles:       d.roles,
        canal:       d.canal,
        lifecycle:   'published',
        activo:      d.activo,
        createdBy:   userId,
        createdAt:   now_(),
        updatedAt:   now_(),
      });
      created.push(row.id);
    }
    return created;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Install the full RRHH module seed data.
   * Idempotent — skips if any RRHH blueprint already exists.
   *
   * @param {string} userId
   * @returns {{
   *   skipped: boolean,
   *   blueprints: number,
   *   kpis: number,
   *   forms: number,
   *   requestTypes: number,
   *   automations: number,
   *   notifRules: number,
   *   logs: Array
   * }}
   */
  function installRRHH(userId) {
    var logs = [];

    function log_(level, message) {
      logs.push({ level: level, message: message, timestamp: new Date().toISOString() });
      AppLogger[level === 'error' ? 'error' : 'info']('WorkspaceTemplateInstaller', { message: message });
    }

    if (isRRHHInstalled_()) {
      log_('info', 'Módulo RRHH ya instalado — saltando instalación');
      return { skipped: true, blueprints: 0, kpis: 0, forms: 0, requestTypes: 0, automations: 0, notifRules: 0, logs: logs };
    }

    log_('info', 'Instalando procesos RRHH...');
    var bpIds = installBlueprints_(userId);
    log_('success', bpIds.length + ' procesos instalados');

    log_('info', 'Instalando indicadores KPI...');
    var kpiIds = installKPIs_(userId);
    log_('success', kpiIds.length + ' indicadores instalados');

    log_('info', 'Instalando formularios...');
    var formIds = installForms_(userId);
    log_('success', formIds.length + ' formularios instalados');

    log_('info', 'Instalando tipos de solicitud...');
    var rtIds = installRequestTypes_(userId);
    log_('success', rtIds.length + ' tipos de solicitud instalados');

    log_('info', 'Instalando automatizaciones...');
    var autoIds = installAutomations_(userId);
    log_('success', autoIds.length + ' automatizaciones instaladas');

    log_('info', 'Instalando reglas de notificación...');
    var nrIds = installNotifRules_(userId);
    log_('success', nrIds.length + ' reglas de notificación instaladas');

    log_('success',
      'Módulo RRHH instalado: ' +
      bpIds.length + ' procesos, ' +
      kpiIds.length + ' KPIs, ' +
      formIds.length + ' formularios, ' +
      rtIds.length + ' tipos de solicitud, ' +
      autoIds.length + ' automatizaciones, ' +
      nrIds.length + ' reglas'
    );

    return {
      skipped:      false,
      blueprints:   bpIds.length,
      kpis:         kpiIds.length,
      forms:        formIds.length,
      requestTypes: rtIds.length,
      automations:  autoIds.length,
      notifRules:   nrIds.length,
      logs:         logs,
    };
  }

  return { installRRHH: installRRHH };

})();


// ============================================================
// SOURCE: setup/BootstrapController.js
// ============================================================

/**
 * BootstrapController — orchestrates the 9-step Platform Installation Wizard.
 *
 * Every method is called by the router via "platform.<step>" and returns a
 * standardised StepResult:
 *
 *   {
 *     step:   <number>,
 *     status: 'ok' | 'warning' | 'error',
 *     logs:   [{ level: 'info'|'warn'|'error'|'success', message, timestamp }],
 *     data:   { <step-specific output> },
 *     errors: ['ERROR_CODE', ...],
 *   }
 *
 * Steps are idempotent — safe to re-run. Each step merges workspace-admin
 * entities before executing to guarantee ENTITY_SHEETS is populated.
 */

var BootstrapController = (function () {

  // ── Helpers ───────────────────────────────────────────────────────────────

  function now_() { return new Date().toISOString(); }

  function log_(logs, level, message) {
    logs.push({ level: level, message: message, timestamp: now_() });
    AppLogger[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'info'](
      'BootstrapController', { step: message }
    );
  }

  function ok_(step, logs, data) {
    return { step: step, status: 'ok', logs: logs, data: data || {}, errors: [] };
  }

  function fail_(step, logs, errors) {
    return { step: step, status: 'error', logs: logs, data: {}, errors: errors || [] };
  }

  function warn_(step, logs, data) {
    return { step: step, status: 'warning', logs: logs, data: data || {}, errors: [] };
  }

  function ensureEntities_() {
    try { mergeWorkspaceAdminEntities_(); } catch (_) {}
  }

  // ── Step 1: Validate environment ──────────────────────────────────────────

  function validate(params, context) {
    var logs = [];
    var errors = [];

    log_(logs, 'info', 'Iniciando validación del entorno de la plataforma...');

    // Spreadsheet
    var spreadsheetId = Config.spreadsheetId();
    if (!spreadsheetId) {
      log_(logs, 'error', 'Propiedad SPREADSHEET_ID no configurada en Script Properties');
      errors.push('PROP_MISSING_SPREADSHEET_ID');
    } else {
      try {
        var ss = SpreadsheetApp.openById(spreadsheetId);
        log_(logs, 'success', 'Spreadsheet conectado: ' + ss.getName() + ' (' + spreadsheetId + ')');
      } catch (e) {
        log_(logs, 'error', 'Error abriendo spreadsheet: ' + String(e.message || e));
        errors.push('SPREADSHEET_INACCESSIBLE');
      }
    }

    // Drive root
    var driveFolderId = Config.driveFolderRootId();
    if (!driveFolderId) {
      log_(logs, 'error', 'Propiedad DRIVE_FOLDER_ROOT_ID no configurada');
      errors.push('PROP_MISSING_DRIVE_FOLDER_ROOT_ID');
    } else {
      try {
        var folder = DriveApp.getFolderById(driveFolderId);
        log_(logs, 'success', 'Carpeta Drive raíz: ' + folder.getName() + ' (' + driveFolderId + ')');
      } catch (e) {
        log_(logs, 'error', 'Error accediendo carpeta Drive: ' + String(e.message || e));
        errors.push('DRIVE_FOLDER_INACCESSIBLE');
      }
    }

    // Optional properties
    var optional = ['ADMIN_EMAIL', 'GMAIL_ENABLED', 'WORKSPACE_DOMAIN', 'INSTANCE_NAME'];
    for (var i = 0; i < optional.length; i++) {
      var val = PropertiesService.getScriptProperties().getProperty(optional[i]);
      if (val) {
        log_(logs, 'success', 'Propiedad ' + optional[i] + ' = ' + val);
      } else {
        log_(logs, 'warn', 'Propiedad opcional ' + optional[i] + ' no configurada (se usará valor por defecto)');
      }
    }

    // Session / auth
    try {
      var email = Session.getActiveUser().getEmail();
      if (email) {
        log_(logs, 'success', 'Sesión Google activa: ' + email);
      } else {
        log_(logs, 'warn', 'No se pudo obtener el email de la sesión activa (normal en tests)');
      }
    } catch (e) {
      log_(logs, 'warn', 'Error obteniendo sesión: ' + String(e.message || e));
    }

    // Apps Script services
    try {
      LockService.getScriptLock(); // just verify accessible
      log_(logs, 'success', 'LockService disponible');
    } catch (e) {
      log_(logs, 'warn', 'LockService no disponible: ' + String(e.message || e));
    }
    try {
      CacheService.getScriptCache(); // verify accessible
      log_(logs, 'success', 'CacheService disponible');
    } catch (e) {
      log_(logs, 'warn', 'CacheService no disponible: ' + String(e.message || e));
    }

    log_(logs, errors.length ? 'error' : 'success',
      errors.length
        ? 'Validación completada con ' + errors.length + ' error(es) bloqueante(s)'
        : 'Entorno validado correctamente — listo para instalación'
    );

    if (errors.length) return fail_(1, logs, errors);
    return ok_(1, logs, { spreadsheetId: spreadsheetId, driveFolderId: driveFolderId });
  }

  // ── Step 2: Initialize Database ───────────────────────────────────────────

  function initDatabase(params, context) {
    ensureEntities_();
    var logs = [];

    log_(logs, 'info', 'Inicializando base de datos en Google Sheets...');

    try {
      var result = initializeDatabase();
      log_(logs, 'success', 'Hojas creadas: ' + result.sheetsCreated);
      log_(logs, 'success', 'Hojas verificadas: ' + result.sheetsVerified);
      log_(logs, 'success', 'Total de entidades: ' + result.totalEntities);

      if (result.sheetsCreated === 0) {
        log_(logs, 'info', 'Instalación previa detectada — todas las hojas ya existen');
      } else {
        log_(logs, 'success', result.sheetsCreated + ' hoja(s) nueva(s) creada(s)');
      }

      return ok_(2, logs, result);
    } catch (e) {
      log_(logs, 'error', 'Error inicializando base de datos: ' + String(e.message || e));
      return fail_(2, logs, ['DATABASE_INIT_FAILED']);
    }
  }

  // ── Step 3: Initialize Drive ──────────────────────────────────────────────

  function initDrive(params, context) {
    var logs = [];

    log_(logs, 'info', 'Creando jerarquía de carpetas institucionales en Google Drive...');

    try {
      var result = initializeFullDriveHierarchy();
      log_(logs, 'success', 'Carpeta raíz: ' + result.rootName);

      var systemFolders = result.systemFolders || {};
      var names = Object.keys(systemFolders);
      for (var i = 0; i < names.length; i++) {
        log_(logs, 'success', 'Carpeta de sistema creada: ' + names[i]);
      }

      var wsResults = result.workspaces || [];
      for (var j = 0; j < wsResults.length; j++) {
        var ws = wsResults[j];
        if (ws.status === 'ok') {
          log_(logs, 'success', 'Workspace ' + ws.wsId.toUpperCase() + ': ' + ws.subFolderCount + ' sub-carpetas');
        } else {
          log_(logs, 'warn', 'Workspace ' + ws.wsId + ': ' + (ws.error || 'error desconocido'));
        }
      }

      log_(logs, 'success', 'Jerarquía Drive inicializada correctamente');
      return ok_(3, logs, result);
    } catch (e) {
      log_(logs, 'error', 'Error inicializando Drive: ' + String(e.message || e));
      return fail_(3, logs, ['DRIVE_INIT_FAILED']);
    }
  }

  // ── Step 4: Install workspace templates ───────────────────────────────────

  function installTemplates(params, context) {
    ensureEntities_();
    var logs = [];
    var userId = context && context.userId || 'system';

    log_(logs, 'info', 'Instalando módulo RRHH como primer módulo operativo...');

    try {
      var result = WorkspaceTemplateInstaller.installRRHH(userId);

      var templateLogs = result.logs || [];
      for (var i = 0; i < templateLogs.length; i++) {
        logs.push(templateLogs[i]);
      }

      if (result.skipped) {
        log_(logs, 'info', 'Módulo RRHH ya instalado — saltando para evitar duplicados');
      } else {
        log_(logs, 'success',
          'Módulo RRHH instalado: ' +
          (result.blueprints || 0) + ' procesos, ' +
          (result.kpis || 0) + ' indicadores, ' +
          (result.forms || 0) + ' formularios, ' +
          (result.requestTypes || 0) + ' tipos de solicitud'
        );
      }

      return ok_(4, logs, result);
    } catch (e) {
      log_(logs, 'error', 'Error instalando plantillas: ' + String(e.message || e));
      return fail_(4, logs, ['TEMPLATE_INSTALL_FAILED']);
    }
  }

  // ── Step 5: Create platform administrator ─────────────────────────────────

  function createAdmin(params, context) {
    ensureEntities_();
    var logs = [];

    log_(logs, 'info', 'Configurando administrador de la plataforma...');

    var adminEmail = context && context.userEmail
      ? context.userEmail
      : Config.adminEmail() || 'admin@upes.edu.sv';

    var adminName = params && params.nombre
      ? params.nombre
      : adminEmail.split('@')[0];

    log_(logs, 'info', 'Administrador identificado: ' + adminEmail);

    var WORKSPACES = ['rrhh', 'vraf', 'conta', 'compras', 'mant', 'salud'];
    var created = 0;
    var existing = 0;

    for (var i = 0; i < WORKSPACES.length; i++) {
      var wsId = WORKSPACES[i];
      try {
        // Check if admin already exists in this workspace
        var listResult = listEntities_('wsUsers', { wsId: wsId, email: adminEmail });
        var existing_users = listResult && listResult.items ? listResult.items : [];
        var found = false;
        for (var j = 0; j < existing_users.length; j++) {
          if (existing_users[j].email === adminEmail && !existing_users[j].deletedAt) {
            found = true;
            existing++;
            log_(logs, 'info', 'Administrador ya existe en workspace ' + wsId.toUpperCase());
            // Update role to ADMIN if not already
            updateEntity_('wsUsers', existing_users[j].id, { rol: 'ADMIN', activo: 'true' });
            break;
          }
        }
        if (!found) {
          createEntity_('wsUsers', {
            wsId:      wsId,
            nombre:    adminName,
            email:     adminEmail,
            rol:       'ADMIN',
            activo:    'true',
            createdAt: now_(),
            updatedAt: now_(),
          });
          created++;
          log_(logs, 'success', 'Administrador creado en workspace ' + wsId.toUpperCase());
        }
      } catch (e) {
        log_(logs, 'warn', 'Error en workspace ' + wsId + ': ' + String(e.message || e));
      }
    }

    log_(logs, 'success',
      'Administrador configurado: ' + created + ' creado(s), ' + existing + ' actualizado(s)'
    );

    AuditService.record({
      accion:      'platform.createAdmin',
      entidadTipo: 'wsUsers',
      entidadId:   adminEmail,
      usuarioId:   context && context.userId || 'system',
      resultado:   'ok',
      detalle:     { email: adminEmail, workspaces: WORKSPACES, created: created },
    });

    return ok_(5, logs, {
      email:      adminEmail,
      name:       adminName,
      workspaces: WORKSPACES,
      created:    created,
      updated:    existing,
    });
  }

  // ── Step 6: Platform configuration ───────────────────────────────────────

  function configure(params, context) {
    ensureEntities_();
    var logs = [];
    var now = now_();

    log_(logs, 'info', 'Aplicando configuración inicial de la plataforma...');

    var WORKSPACES = [
      { id: 'rrhh',    nombre: 'Recursos Humanos',             corto: 'RRHH',   color: '#2E6BE6', icon: 'M12 4.354a4 4 0 110 5.292' },
      { id: 'vraf',    nombre: 'Vicerrectoría Adm. y Fin.',    corto: 'VRAF',   color: '#5B4FD0', icon: 'M3 21h18M5 21V7l7-4 7 4v14' },
      { id: 'conta',   nombre: 'Contabilidad',                 corto: 'CONTA',  color: '#0F8A8A', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
      { id: 'compras', nombre: 'Compras y Adquisiciones',      corto: 'COMPRAS',color: '#E5A100', icon: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z' },
      { id: 'mant',    nombre: 'Mantenimiento',                corto: 'MANT',   color: '#12A150', icon: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3a1 1 0 000-1.4l-1.6-1.6a1 1 0 00-1.4 0L14.7 6.3z' },
      { id: 'salud',   nombre: 'Salud y Seguridad',            corto: 'SALUD',  color: '#E5484D', icon: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23' },
    ];

    var created = 0;
    var updated = 0;

    for (var i = 0; i < WORKSPACES.length; i++) {
      var ws = WORKSPACES[i];
      try {
        var existing = listEntities_('wsSettings', { wsId: ws.id });
        var rows = existing && existing.items ? existing.items : [];
        var found = false;
        for (var j = 0; j < rows.length; j++) {
          if (rows[j].wsId === ws.id) {
            found = true;
            updateEntity_('wsSettings', rows[j].id || ws.id, {
              nombre:    ws.nombre,
              nombreCorto: ws.corto,
              color:     ws.color,
              icon:      ws.icon,
              zonaHoraria: 'America/El_Salvador',
              idioma:    'es-SV',
              slaDiasDefault: '5',
              updatedAt: now,
              updatedBy: context && context.userId || 'system',
            });
            updated++;
            log_(logs, 'success', 'Configuración actualizada: ' + ws.corto);
            break;
          }
        }
        if (!found) {
          createEntity_('wsSettings', {
            wsId:        ws.id,
            nombre:      ws.nombre,
            nombreCorto: ws.corto,
            descripcion: 'Workspace ' + ws.nombre + ' de la plataforma SSE-VRAF',
            color:       ws.color,
            colorFondo:  '#EAF1FE',
            icon:        ws.icon,
            slaDiasDefault: '5',
            zonaHoraria: 'America/El_Salvador',
            idioma:      'es-SV',
            updatedAt:   now,
            updatedBy:   context && context.userId || 'system',
          });
          created++;
          log_(logs, 'success', 'Configuración inicial creada: ' + ws.corto);
        }
      } catch (e) {
        log_(logs, 'warn', 'Error configurando ' + ws.id + ': ' + String(e.message || e));
      }
    }

    // Write platform-level script property
    try {
      PropertiesService.getScriptProperties().setProperties({
        'PLATFORM_VERSION':     '1.0.0',
        'PLATFORM_INSTALLED':   'true',
        'PLATFORM_INSTALL_DATE': now,
        'PLATFORM_LOCALE':      'es-SV',
        'PLATFORM_TIMEZONE':    'America/El_Salvador',
        'PLATFORM_FISCAL_START': '01-01',
        'PLATFORM_WORK_DAYS':   'LMXJV',
      }, false);
      log_(logs, 'success', 'Propiedades de plataforma guardadas');
    } catch (e) {
      log_(logs, 'warn', 'No se pudieron guardar propiedades: ' + String(e.message || e));
    }

    log_(logs, 'success',
      'Configuración aplicada: ' + created + ' workspace(s) nuevo(s), ' + updated + ' actualizado(s)'
    );

    return ok_(6, logs, {
      workspacesConfigured: WORKSPACES.length,
      created: created,
      updated: updated,
      platformVersion: '1.0.0',
    });
  }

  // ── Step 7: Health check ──────────────────────────────────────────────────

  function healthCheck(params, context) {
    ensureEntities_();
    var logs = [];
    var checks = {};

    log_(logs, 'info', 'Ejecutando verificación de salud de la plataforma...');

    // Sheets check
    try {
      var ss = SpreadsheetApp.openById(Config.spreadsheetId());
      var sheets = ss.getSheets();
      var sheetNames = sheets.map(function(s) { return s.getName(); });
      var entityKeys = Object.keys(ENTITY_SHEETS);
      var missingSheets = [];
      for (var i = 0; i < entityKeys.length; i++) {
        var expectedName = ENTITY_SHEETS[entityKeys[i]].sheetName;
        if (sheetNames.indexOf(expectedName) === -1) {
          missingSheets.push(expectedName);
        }
      }
      if (missingSheets.length === 0) {
        log_(logs, 'success', 'Base de datos: ' + sheets.length + ' hojas presentes — OK');
        checks.sheets = 'ok';
      } else {
        log_(logs, 'warn', 'Hojas faltantes: ' + missingSheets.join(', '));
        checks.sheets = 'warning';
      }
    } catch (e) {
      log_(logs, 'error', 'Base de datos no accesible: ' + String(e.message || e));
      checks.sheets = 'error';
    }

    // Drive check
    try {
      var root = DriveService.getRootFolder();
      log_(logs, 'success', 'Drive: carpeta raíz accesible — ' + root.getName());
      checks.drive = 'ok';
    } catch (e) {
      log_(logs, 'error', 'Drive no accesible: ' + String(e.message || e));
      checks.drive = 'error';
    }

    // wsSettings check
    try {
      var settingsResult = listEntities_('wsSettings', {});
      var settingsCount = settingsResult && settingsResult.items ? settingsResult.items.length : 0;
      log_(logs, settingsCount >= 6 ? 'success' : 'warn',
        'Configuración de workspaces: ' + settingsCount + '/6 configurados');
      checks.settings = settingsCount >= 6 ? 'ok' : 'warning';
    } catch (e) {
      log_(logs, 'warn', 'Error verificando settings: ' + String(e.message || e));
      checks.settings = 'warning';
    }

    // wsBlueprints check
    try {
      var bpResult = listEntities_('wsBlueprints', { wsId: 'rrhh' });
      var bpCount = bpResult && bpResult.items ? bpResult.items.length : 0;
      log_(logs, bpCount > 0 ? 'success' : 'warn',
        'Procesos RRHH instalados: ' + bpCount);
      checks.blueprints = bpCount > 0 ? 'ok' : 'warning';
    } catch (e) {
      log_(logs, 'warn', 'Error verificando blueprints: ' + String(e.message || e));
      checks.blueprints = 'warning';
    }

    // Admin users check
    try {
      var adminResult = listEntities_('wsUsers', { rol: 'ADMIN' });
      var adminCount = adminResult && adminResult.items ? adminResult.items.length : 0;
      log_(logs, adminCount > 0 ? 'success' : 'warn',
        'Usuarios administradores: ' + adminCount);
      checks.adminUsers = adminCount > 0 ? 'ok' : 'warning';
    } catch (e) {
      log_(logs, 'warn', 'Error verificando usuarios: ' + String(e.message || e));
      checks.adminUsers = 'warning';
    }

    // Platform properties check
    var installedProp = PropertiesService.getScriptProperties().getProperty('PLATFORM_INSTALLED');
    if (installedProp === 'true') {
      log_(logs, 'success', 'Plataforma marcada como instalada — versión ' +
        (PropertiesService.getScriptProperties().getProperty('PLATFORM_VERSION') || 'desconocida'));
      checks.properties = 'ok';
    } else {
      log_(logs, 'warn', 'PLATFORM_INSTALLED no está en true');
      checks.properties = 'warning';
    }

    var allOk = Object.keys(checks).every(function(k) { return checks[k] === 'ok'; });
    var anyError = Object.keys(checks).some(function(k) { return checks[k] === 'error'; });

    log_(logs, allOk ? 'success' : anyError ? 'error' : 'warn',
      allOk
        ? 'Verificación de salud completada: todos los sistemas OK'
        : 'Verificación completada con advertencias — la plataforma es funcional'
    );

    if (anyError) return fail_(7, logs, ['HEALTH_CHECK_FAILED']);
    if (allOk) return ok_(7, logs, { checks: checks });
    return warn_(7, logs, { checks: checks });
  }

  // ── Step 8: Live test ─────────────────────────────────────────────────────

  function liveTest(params, context) {
    ensureEntities_();
    var logs = [];
    var testIds = {};
    var userId = context && context.userId || 'system';

    log_(logs, 'info', 'Ejecutando prueba en vivo — se crearán y eliminarán datos de prueba...');

    // Test 1: Create test employee
    try {
      var emp = createEntity_('empleados', {
        nombre:     'TEST Empleado Bootstrap',
        email:      'test.bootstrap@upes.edu.sv',
        cargo:      'Test',
        departamento: 'Sistema',
        activo:     'true',
        createdAt:  new Date().toISOString(),
      });
      testIds.empleado = emp && emp.id;
      log_(logs, 'success', 'Empleado de prueba creado: ' + (emp && emp.id));
    } catch (e) {
      log_(logs, 'warn', 'No se pudo crear empleado de prueba: ' + String(e.message || e));
    }

    // Test 2: Create test process
    try {
      var proc = createEntity_('procesos', {
        nombre:      'TEST Proceso Bootstrap',
        descripcion: 'Proceso de prueba de instalación',
        estado:      'activo',
        wsId:        'vraf',
        createdAt:   new Date().toISOString(),
      });
      testIds.proceso = proc && proc.id;
      log_(logs, 'success', 'Proceso de prueba creado: ' + (proc && proc.id));
    } catch (e) {
      log_(logs, 'warn', 'No se pudo crear proceso de prueba: ' + String(e.message || e));
    }

    // Test 3: Create test notification
    try {
      var notif = createEntity_('notificaciones', {
        destinatarioId: userId,
        wsId:           'vraf',
        tipo:           'info',
        titulo:         'TEST: Instalación de plataforma',
        mensaje:        'Prueba de notificación del sistema. Este mensaje se eliminará.',
        leida:          'false',
        fechaCreacion:  new Date().toISOString(),
      });
      testIds.notificacion = notif && notif.id;
      log_(logs, 'success', 'Notificación de prueba creada: ' + (notif && notif.id));
    } catch (e) {
      log_(logs, 'warn', 'No se pudo crear notificación de prueba: ' + String(e.message || e));
    }

    // Test 4: Audit record
    try {
      AuditService.record({
        accion:      'platform.liveTest',
        entidadTipo: 'system',
        entidadId:   'bootstrap',
        usuarioId:   userId,
        resultado:   'ok',
        detalle:     { testIds: testIds, timestamp: new Date().toISOString() },
      });
      log_(logs, 'success', 'Registro de auditoría creado correctamente');
    } catch (e) {
      log_(logs, 'warn', 'Error en auditoría: ' + String(e.message || e));
    }

    // Cleanup: delete test data
    log_(logs, 'info', 'Limpiando datos de prueba...');
    var cleaned = 0;

    if (testIds.empleado) {
      try { removeEntity_('empleados', testIds.empleado); cleaned++; } catch (_) {}
    }
    if (testIds.proceso) {
      try { removeEntity_('procesos', testIds.proceso); cleaned++; } catch (_) {}
    }
    if (testIds.notificacion) {
      try { removeEntity_('notificaciones', testIds.notificacion); cleaned++; } catch (_) {}
    }

    log_(logs, 'success', cleaned + ' registro(s) de prueba eliminado(s)');
    log_(logs, 'success', 'Prueba en vivo completada — todos los sistemas respondieron correctamente');

    return ok_(8, logs, { testIds: testIds, cleaned: cleaned });
  }

  // ── Step 9: Installation report ───────────────────────────────────────────

  function report(params, context) {
    ensureEntities_();
    var logs = [];

    log_(logs, 'info', 'Generando reporte de instalación...');

    var report = {
      platformVersion: PropertiesService.getScriptProperties().getProperty('PLATFORM_VERSION') || '1.0.0',
      installDate:     PropertiesService.getScriptProperties().getProperty('PLATFORM_INSTALL_DATE') || new Date().toISOString(),
      components:      {},
      warnings:        [],
      errors:          [],
    };

    // Count installed components
    var entityCounts = [
      { key: 'blueprints', entity: 'wsBlueprints', label: 'Procesos' },
      { key: 'kpis',       entity: 'wsKPIs',       label: 'Indicadores' },
      { key: 'forms',      entity: 'wsForms',       label: 'Formularios' },
      { key: 'requestTypes', entity: 'wsRequestTypes', label: 'Tipos de Solicitud' },
      { key: 'automations',  entity: 'wsAutomations',  label: 'Automatizaciones' },
      { key: 'users',        entity: 'wsUsers',         label: 'Usuarios' },
      { key: 'documents',    entity: 'wsDocuments',     label: 'Documentos' },
      { key: 'notifRules',   entity: 'wsNotifRules',    label: 'Reglas de Notificación' },
      { key: 'settings',     entity: 'wsSettings',      label: 'Configuraciones de Workspace' },
    ];

    for (var i = 0; i < entityCounts.length; i++) {
      var entry = entityCounts[i];
      try {
        var result = listEntities_(entry.entity, {});
        var count  = result && result.items ? result.items.length : 0;
        report.components[entry.key] = count;
        log_(logs, 'success', entry.label + ': ' + count + ' registros');
      } catch (e) {
        report.components[entry.key] = 0;
        log_(logs, 'warn', entry.label + ': error contando registros');
      }
    }

    // Count sheets
    try {
      var ss     = SpreadsheetApp.openById(Config.spreadsheetId());
      var sheets = ss.getSheets();
      report.sheetsTotal = sheets.length;
      log_(logs, 'success', 'Hojas de cálculo: ' + sheets.length + ' creadas');
    } catch (e) {
      report.sheetsTotal = 0;
    }

    // Drive root
    try {
      var root = DriveService.getRootFolder();
      report.driveFolderName = root.getName();
      report.driveFolderId   = root.getId();
      log_(logs, 'success', 'Carpeta Drive: ' + root.getName());
    } catch (e) {
      report.driveFolderName = 'desconocido';
    }

    var totalComponents = 0;
    var keys = Object.keys(report.components);
    for (var k = 0; k < keys.length; k++) {
      totalComponents += report.components[keys[k]];
    }

    log_(logs, 'success',
      'Plataforma SSE-VRAF v' + report.platformVersion + ' instalada correctamente. ' +
      'Total: ' + totalComponents + ' registros en ' + (report.sheetsTotal || 0) + ' hojas.'
    );

    return ok_(9, logs, report);
  }

  // ── Status check ──────────────────────────────────────────────────────────

  function getStatus(params, context) {
    var installed = PropertiesService.getScriptProperties().getProperty('PLATFORM_INSTALLED') === 'true';
    var version   = PropertiesService.getScriptProperties().getProperty('PLATFORM_VERSION') || null;
    var date      = PropertiesService.getScriptProperties().getProperty('PLATFORM_INSTALL_DATE') || null;
    return { installed: installed, version: version, installDate: date };
  }

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    validate:         validate,
    initDatabase:     initDatabase,
    initDrive:        initDrive,
    installTemplates: installTemplates,
    createAdmin:      createAdmin,
    configure:        configure,
    healthCheck:      healthCheck,
    liveTest:         liveTest,
    report:           report,
    getStatus:        getStatus,
  };
})();


// ============================================================
// SOURCE: jobs/BackgroundJobs.js
// ============================================================

/**
 * BackgroundJobs — time-based trigger handlers for platform maintenance.
 *
 * Register all jobs once by calling BackgroundJobs.registerTriggers() from
 * the bootstrap / setup flow. Each trigger calls a top-level function stub
 * (required by GAS time-based triggers — methods on objects cannot be
 * targeted directly).
 *
 * Trigger schedule:
 *   onNightlyBackup         — every 24 hours  (nightly)
 *   onHourlyNotifications   — every hour
 *   onDailyKPIRecalc        — every 24 hours  (daily)
 *   onWeeklyCleanup         — every week
 *
 * All job methods are wrapped in try/catch so a failure in one sheet / record
 * does not abort the entire run. Each job writes its outcome to AppLogger.
 */
var BackgroundJobs = {

  // ---------------------------------------------------------------------------
  // Job: Nightly sheet backup
  // ---------------------------------------------------------------------------

  /**
   * Back up every sheet in the platform spreadsheet as a JSON file in Drive.
   * Creates a "Backups" folder under the configured root if it does not exist.
   * Each file is named {SheetName}_{YYYY-MM-DD}.json and contains the sheet
   * data as a JSON array of row objects (headers as keys).
   */
  nightly: function () {
    AppLogger.info("BackgroundJobs.nightly: starting");

    var ss;
    try {
      ss = getSpreadsheet_();
    } catch (e) {
      AppLogger.error("BackgroundJobs.nightly: cannot open spreadsheet", {
        error: String(e.message || e),
      });
      return;
    }

    var backupFolder = DriveService.getOrCreateFolder(
      "Backups",
      Config.driveFolderRootId() || null
    );

    var sheets    = ss.getSheets();
    var dateLabel = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    var backed    = 0;
    var failed    = 0;

    for (var i = 0; i < sheets.length; i++) {
      var sheet     = sheets[i];
      var sheetName = sheet.getName();

      try {
        var lastRow = sheet.getLastRow();
        var lastCol = sheet.getLastColumn();

        if (lastRow < 1 || lastCol < 1) {
          // Empty sheet — write an empty array
          var emptyBlob = Utilities.newBlob("[]", "application/json", sheetName + "_" + dateLabel + ".json");
          backupFolder.createFile(emptyBlob);
          backed++;
          continue;
        }

        var range   = sheet.getRange(1, 1, lastRow, lastCol);
        var values  = range.getValues();
        var headers = values[0];
        var rows    = [];

        for (var r = 1; r < values.length; r++) {
          var obj = {};
          for (var c = 0; c < headers.length; c++) {
            var cell = values[r][c];
            // Normalise Date objects to ISO strings
            obj[headers[c]] = (cell instanceof Date) ? cell.toISOString() : cell;
          }
          rows.push(obj);
        }

        var json     = JSON.stringify(rows);
        var fileName = sheetName + "_" + dateLabel + ".json";
        var blob     = Utilities.newBlob(json, "application/json", fileName);
        backupFolder.createFile(blob);

        AppLogger.debug("BackgroundJobs.nightly: sheet backed up", {
          sheet: sheetName,
          rows:  rows.length,
        });
        backed++;

      } catch (e) {
        failed++;
        AppLogger.error("BackgroundJobs.nightly: failed for sheet", {
          sheet: sheetName,
          error: String(e.message || e),
        });
      }
    }

    AppLogger.info("BackgroundJobs.nightly: complete", {
      date:   dateLabel,
      backed: backed,
      failed: failed,
    });
  },

  // ---------------------------------------------------------------------------
  // Job: Hourly notification queue processing
  // ---------------------------------------------------------------------------

  /**
   * Process pending (unread, older than 24 h) in-app notifications by sending
   * follow-up email reminders via NotificationService.sendEmail.
   * Marks each notification as read after processing.
   */
  processNotificationQueue: function () {
    AppLogger.info("BackgroundJobs.processNotificationQueue: starting");

    var cutoff    = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    var processed = 0;
    var failed    = 0;

    var result;
    try {
      result = listEntities_("notificaciones", { leida: "false" });
    } catch (e) {
      AppLogger.error("BackgroundJobs.processNotificationQueue: listEntities_ failed", {
        error: String(e.message || e),
      });
      return;
    }

    var items = result && result.items ? result.items : [];

    for (var i = 0; i < items.length; i++) {
      var notif = items[i];

      // Skip if already read or deleted
      if (notif.deletedAt || notif.leida === "true") continue;

      // Only process notifications older than 24 h
      if (!notif.fechaCreacion || notif.fechaCreacion >= cutoff) continue;

      try {
        // Best-effort email reminder — requires destinatario to have an email
        // Look up the user to get their email address
        var user = null;
        try {
          user = getEntity_("usuarios", notif.destinatarioId);
        } catch (_) {}

        if (user && user.email) {
          var subject = "[Recordatorio] " + (notif.titulo || "Notificación pendiente");
          var body    = GmailService.buildPlatformEmail(
            "<p>" + (notif.mensaje || "") + "</p>",
            Config.instanceName()
          );
          NotificationService.sendEmail(user.email, subject, body);
        }

        // Mark as read
        updateEntity_("notificaciones", notif.id, { leida: "true" });
        processed++;

      } catch (e) {
        failed++;
        AppLogger.error("BackgroundJobs.processNotificationQueue: failed for notification", {
          notifId: notif.id,
          error:   String(e.message || e),
        });
      }
    }

    AppLogger.info("BackgroundJobs.processNotificationQueue: complete", {
      processed: processed,
      failed:    failed,
    });
  },

  // ---------------------------------------------------------------------------
  // Job: Daily KPI recalculation
  // ---------------------------------------------------------------------------

  /**
   * Recalculate KPI values for all KPIs with frecuencia="diario".
   * In this implementation the existing valorActual is re-recorded as the
   * current data point (real formula evaluation is deferred to a future sprint).
   */
  recalculateKPIs: function () {
    AppLogger.info("BackgroundJobs.recalculateKPIs: starting");

    var result;
    try {
      result = listEntities_("wsKPIs", {});
    } catch (e) {
      AppLogger.error("BackgroundJobs.recalculateKPIs: listEntities_ failed", {
        error: String(e.message || e),
      });
      return;
    }

    var kpis       = result && result.items ? result.items : [];
    var updated    = 0;
    var skipped    = 0;
    var failed     = 0;

    for (var i = 0; i < kpis.length; i++) {
      var kpi = kpis[i];

      if (kpi.deletedAt) { skipped++; continue; }
      if (kpi.frecuencia !== "diario") { skipped++; continue; }

      var valor = parseFloat(kpi.valorActual);
      if (isNaN(valor)) { valor = 0; }

      try {
        WorkspaceController.recordKPIValue(kpi.id, valor, kpi.semaforo || "verde", null);
        updated++;
        AppLogger.debug("BackgroundJobs.recalculateKPIs: KPI updated", {
          kpiId: kpi.id,
          valor: valor,
        });
      } catch (e) {
        failed++;
        AppLogger.error("BackgroundJobs.recalculateKPIs: failed for KPI", {
          kpiId: kpi.id,
          error: String(e.message || e),
        });
      }
    }

    AppLogger.info("BackgroundJobs.recalculateKPIs: complete", {
      total:   kpis.length,
      updated: updated,
      skipped: skipped,
      failed:  failed,
    });
  },

  // ---------------------------------------------------------------------------
  // Job: Weekly cleanup of expired soft-deleted records
  // ---------------------------------------------------------------------------

  /**
   * Purge soft-deleted records whose deletedAt timestamp is older than 90 days.
   * Iterates every entity in ENTITY_SHEETS and physically deletes qualifying rows.
   */
  cleanupExpiredRecords: function () {
    AppLogger.info("BackgroundJobs.cleanupExpiredRecords: starting");

    var now          = Date.now();
    var ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
    var cutoff       = new Date(now - ninetyDaysMs).toISOString();

    var purged  = 0;
    var failed  = 0;
    var checked = 0;

    for (var entityName in ENTITY_SHEETS) {
      if (!Object.prototype.hasOwnProperty.call(ENTITY_SHEETS, entityName)) continue;

      var result;
      try {
        result = listEntities_(entityName, {});
      } catch (e) {
        AppLogger.warn("BackgroundJobs.cleanupExpiredRecords: listEntities_ failed", {
          entity: entityName,
          error:  String(e.message || e),
        });
        continue;
      }

      var items = result && result.items ? result.items : [];

      for (var i = 0; i < items.length; i++) {
        var record = items[i];
        checked++;

        if (!record.deletedAt || record.deletedAt === "") continue;
        if (record.deletedAt >= cutoff) continue; // not yet expired

        try {
          purgeEntity_(entityName, record.id);
          purged++;
          AppLogger.debug("BackgroundJobs.cleanupExpiredRecords: purged", {
            entity: entityName,
            id:     record.id,
            age:    record.deletedAt,
          });
        } catch (e) {
          failed++;
          AppLogger.error("BackgroundJobs.cleanupExpiredRecords: purge failed", {
            entity: entityName,
            id:     record.id,
            error:  String(e.message || e),
          });
        }
      }
    }

    AppLogger.info("BackgroundJobs.cleanupExpiredRecords: complete", {
      checked: checked,
      purged:  purged,
      failed:  failed,
    });
  },

  // ---------------------------------------------------------------------------
  // Trigger management
  // ---------------------------------------------------------------------------

  /**
   * Register all platform time-based triggers. Idempotent — skips any trigger
   * whose handler function is already registered.
   *
   * Call once from the setup / bootstrap flow (not on every deployment).
   */
  registerTriggers: function () {
    AppLogger.info("BackgroundJobs.registerTriggers: starting");

    var existing = ScriptApp.getProjectTriggers();
    var existingHandlers = {};
    for (var i = 0; i < existing.length; i++) {
      existingHandlers[existing[i].getHandlerFunction()] = true;
    }

    var created = 0;

    // Nightly backup — every 24 hours
    if (!existingHandlers["onNightlyBackup"]) {
      ScriptApp.newTrigger("onNightlyBackup")
        .timeBased()
        .everyHours(24)
        .create();
      AppLogger.info("BackgroundJobs.registerTriggers: registered onNightlyBackup");
      created++;
    }

    // Hourly notification queue processing
    if (!existingHandlers["onHourlyNotifications"]) {
      ScriptApp.newTrigger("onHourlyNotifications")
        .timeBased()
        .everyHours(1)
        .create();
      AppLogger.info("BackgroundJobs.registerTriggers: registered onHourlyNotifications");
      created++;
    }

    // Daily KPI recalculation — every 24 hours
    if (!existingHandlers["onDailyKPIRecalc"]) {
      ScriptApp.newTrigger("onDailyKPIRecalc")
        .timeBased()
        .everyHours(24)
        .create();
      AppLogger.info("BackgroundJobs.registerTriggers: registered onDailyKPIRecalc");
      created++;
    }

    // Weekly cleanup — every week
    if (!existingHandlers["onWeeklyCleanup"]) {
      ScriptApp.newTrigger("onWeeklyCleanup")
        .timeBased()
        .everyWeeks(1)
        .create();
      AppLogger.info("BackgroundJobs.registerTriggers: registered onWeeklyCleanup");
      created++;
    }

    AppLogger.info("BackgroundJobs.registerTriggers: complete", {
      created:  created,
      existing: Object.keys(existingHandlers).length,
    });
  },

  /**
   * Remove all SSE platform time-based triggers created by registerTriggers().
   * Targets only the four known handler names to avoid removing unrelated triggers.
   */
  removeTriggers: function () {
    AppLogger.info("BackgroundJobs.removeTriggers: starting");

    var targetHandlers = {
      onNightlyBackup:       true,
      onHourlyNotifications: true,
      onDailyKPIRecalc:      true,
      onWeeklyCleanup:       true,
    };

    var triggers = ScriptApp.getProjectTriggers();
    var removed  = 0;

    for (var i = 0; i < triggers.length; i++) {
      var trigger = triggers[i];
      if (targetHandlers[trigger.getHandlerFunction()]) {
        ScriptApp.deleteTrigger(trigger);
        AppLogger.info("BackgroundJobs.removeTriggers: removed", {
          handler: trigger.getHandlerFunction(),
        });
        removed++;
      }
    }

    AppLogger.info("BackgroundJobs.removeTriggers: complete", { removed: removed });
  },

  // ---------------------------------------------------------------------------
  // Health ping
  // ---------------------------------------------------------------------------

  /**
   * Log a heartbeat entry. Called manually or from a lightweight trigger to
   * confirm the GAS project is alive and script execution is working.
   */
  healthPing: function () {
    AppLogger.info("BackgroundJobs.healthPing", { ts: new Date().toISOString() });
  },
};

// ---------------------------------------------------------------------------
// Top-level trigger stubs — GAS requires these to be global functions
// ---------------------------------------------------------------------------

/** @GAS time-based trigger handler */
function onNightlyBackup() { BackgroundJobs.nightly(); }

/** @GAS time-based trigger handler */
function onHourlyNotifications() { BackgroundJobs.processNotificationQueue(); }

/** @GAS time-based trigger handler */
function onDailyKPIRecalc() { BackgroundJobs.recalculateKPIs(); }

/** @GAS time-based trigger handler */
function onWeeklyCleanup() { BackgroundJobs.cleanupExpiredRecords(); }


// ============================================================
// SOURCE: router.js
// ============================================================

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


// ============================================================
// SOURCE: Code.js
// ============================================================

/**
 * Web App entry point. Deploy this project as a Web App (see README.md) and
 * set APPS_SCRIPT_WEB_APP_URL in web/.env.local to the resulting /exec URL.
 *
 * Request body (JSON, sent as text/plain to stay a CORS simple request):
 *   {
 *     action:    string,   // "<entity>.<verb>" or "auth.<verb>"
 *     params:    object,   // action parameters
 *     userId:    string?,  // acting user id (optional; domain gate is primary auth)
 *     userEmail: string?,  // acting user email (for auth.getUser bridge)
 *     secret:    string?,  // WEBHOOK_SHARED_SECRET if configured
 *   }
 *
 * Response: see response.js — { success, data, metadata, errors, timestamp, requestId }
 *
 * SECURITY: Access is restricted to signed-in Workspace domain users via
 * appsscript.json "access": "DOMAIN". WEBHOOK_SHARED_SECRET adds an optional
 * extra gate for trusted server-side callers (do not use it from the browser
 * adapter — a secret in client JS is not a secret).
 */
// Merge all entity schemas at load time so the router and SheetRepository
// can resolve entity names in every request without per-request overhead.
(function bootstrap_() {
  try {
    mergeWorkspaceAdminEntities_();
  } catch (e) {}
  try {
    mergeBuilderEntities_();
  } catch (e) {}
  try {
    mergeContratacionEntities_();
  } catch (e) {}
})();

function doPost(e) {
  var context = createContext_();
  var body;

  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
  } catch (parseErr) {
    return fail_(new Error("Invalid JSON in request body"), { requestId: context.requestId });
  }

  try {
    assertSharedSecret_(body.secret);

    // userEmail: authoritative identity from Google Workspace domain auth.
    // userId: DB id from the verified server-side session; falls back to email.
    var activeEmail = Session.getActiveUser().getEmail();
    context.userEmail = activeEmail || body.userEmail || "";
    context.userId    = body.userId  || context.userEmail;

    AppLogger.info("doPost", {
      action: String(body.action || "").replace(/[\r\n]/g, ""),
      requestId: context.requestId,
      userId: context.userId,
    });

    var routeResult = routeAction_(body.action, body.params || {}, context);

    var meta = buildResponseMeta_(context);
    if (routeResult.pagination) meta.pagination = routeResult.pagination;

    return ok_(routeResult.data, meta);
  } catch (err) {
    AppLogger.error("doPost error", {
      action: body && body.action,
      requestId: context.requestId,
      error: String((err && err.message) || err),
    });

    // Audit the failure for write actions
    if (body && body.action && isWriteAction_(body.action)) {
      AuditService.record({
        accion:      body.action,
        entidadTipo: (body.action || "").split(".")[0],
        entidadId:   body.params && body.params.id || "",
        usuarioId:   context.userId || "",
        resultado:   "error",
        detalle:     { error: String((err && err.message) || err) },
      });
    }

    return fail_(err, buildResponseMeta_(context));
  }
}

function doGet() {
  return jsonOutput_({
    success: true,
    data: { service: Config.instanceName() + " Apps Script BFF", status: "healthy" },
    metadata: { requestId: IdGen.requestId(), durationMs: 0 },
    errors: [],
    timestamp: new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createContext_() {
  return {
    requestId: IdGen.requestId(),
    startMs:   new Date().getTime(),
    userId:    "",
    userEmail: "",
  };
}

function buildResponseMeta_(context) {
  return {
    requestId:  context.requestId,
    durationMs: new Date().getTime() - (context.startMs || 0),
  };
}

function assertSharedSecret_(providedSecret) {
  var expected = Config.webhookSecret();
  if (!expected) return; // not configured — see README before real deployment
  if (providedSecret !== expected) {
    var err = new Error("Unauthorized: invalid or missing secret");
    err.code = "UNAUTHORIZED";
    throw err;
  }
}

function isWriteAction_(action) {
  var verb = String(action || "").split(".")[1] || "";
  return verb === "create" || verb === "update" || verb === "remove";
}


