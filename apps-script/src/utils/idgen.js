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
   * Generate a new ID for a named entity. Currently returns a UUID for all
   * entity types; override per-entity in the sprint that owns RUI formatting.
   * @param {string} entityName
   * @returns {string}
   */
  forEntity: function (entityName) {
    return IdGen.uuid();
  },
};
