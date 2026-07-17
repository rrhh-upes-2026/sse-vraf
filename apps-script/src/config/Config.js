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
