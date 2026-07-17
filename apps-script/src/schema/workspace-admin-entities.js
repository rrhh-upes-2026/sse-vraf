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
