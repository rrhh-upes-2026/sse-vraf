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
