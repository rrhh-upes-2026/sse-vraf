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
