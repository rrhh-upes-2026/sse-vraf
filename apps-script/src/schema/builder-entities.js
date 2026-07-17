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
