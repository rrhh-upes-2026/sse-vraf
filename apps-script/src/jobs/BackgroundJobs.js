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
