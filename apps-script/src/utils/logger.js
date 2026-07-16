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
