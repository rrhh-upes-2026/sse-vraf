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
