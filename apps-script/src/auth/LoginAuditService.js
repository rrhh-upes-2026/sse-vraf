/**
 * LoginAuditService — append-only authentication event log.
 *
 * Writes every auth event (success and failure) to a Sheet named "login_audit".
 * Creates the sheet with headers on first use if it doesn't exist.
 * All errors are caught internally so auth flow is never blocked by a logging failure.
 *
 * Columns:
 *   fecha | correo | ip | userAgent | resultado | motivo | usuarioId | rol | unidad
 *
 * Recorded events (motivo values):
 *   OK    → otp_sent, login_success
 *   ERROR → domain_invalid, user_not_found, user_inactive, cooldown_Xs,
 *            otp_expired, invalid_code_attempt_N, max_attempts_locked,
 *            account_locked, user_not_found_on_verify, user_inactive_on_verify
 */
var LoginAuditService = (function () {
  var SHEET_NAME = "login_audit";
  var HEADERS    = ["fecha", "correo", "ip", "userAgent", "resultado", "motivo", "usuarioId", "rol", "unidad"];

  function getOrCreateSheet_() {
    var ss    = SpreadsheetApp.openById(Config.spreadsheetId());
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      // Widen columns for readability
      sheet.setColumnWidth(1, 180); // fecha
      sheet.setColumnWidth(2, 200); // correo
      sheet.setColumnWidth(4, 300); // userAgent
    }
    return sheet;
  }

  return {
    /**
     * Append one row to login_audit.
     *
     * @param {{
     *   email:      string,
     *   ip?:        string,
     *   userAgent?: string,
     *   resultado:  "OK" | "ERROR",
     *   motivo:     string,
     *   usuarioId?: string,
     *   rol?:       string,
     *   unidad?:    string,
     * }} entry
     */
    record: function (entry) {
      try {
        var sheet = getOrCreateSheet_();
        sheet.appendRow([
          new Date().toISOString(),
          entry.email     || "",
          entry.ip        || "",
          entry.userAgent || "",
          entry.resultado || "",
          entry.motivo    || "",
          entry.usuarioId || "",
          entry.rol       || "",
          entry.unidad    || "",
        ]);
      } catch (e) {
        AppLogger.warn("LoginAuditService.record: failed", {
          email: entry.email,
          error: String(e.message || e),
        });
      }
    },
  };
})();
