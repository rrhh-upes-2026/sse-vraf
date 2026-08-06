/**
 * Config — lee exclusivamente de Script Properties.
 * Nunca valores hardcodeados. Cambiar comportamiento = cambiar la property.
 *
 * Script Properties requeridas en el editor GAS:
 *   SPREADSHEET_ID          ID del Spreadsheet principal
 *   WEBHOOK_SHARED_SECRET   Clave compartida con el frontend Next.js
 *   ALLOWED_DOMAIN          Dominio institucional (default: upes.edu.sv)
 *   DRIVE_ROOT_FOLDER_ID    Carpeta raíz en Drive
 *   GEMINI_API_KEY          API key de Gemini
 *   LOG_LEVEL               DEBUG | INFO | WARN | ERROR (default: INFO)
 *   INSTANCE_NAME           Nombre de la instancia (default: SSE-VRAF)
 */
var Config = (function () {
  var _cache = null;

  function props_() {
    if (!_cache) _cache = PropertiesService.getScriptProperties();
    return _cache;
  }

  return {
    spreadsheetId:     function () { return props_().getProperty("SPREADSHEET_ID") || ""; },
    webhookSecret:     function () { return props_().getProperty("WEBHOOK_SHARED_SECRET") || ""; },
    allowedDomain:     function () { return props_().getProperty("ALLOWED_DOMAIN") || "upes.edu.sv"; },
    driveFolderRoot:   function () { return props_().getProperty("DRIVE_ROOT_FOLDER_ID") || ""; },
    geminiApiKey:      function () { return props_().getProperty("GEMINI_API_KEY") || ""; },
    logLevel:          function () { return props_().getProperty("LOG_LEVEL") || "INFO"; },
    instanceName:      function () { return props_().getProperty("INSTANCE_NAME") || "SSE-VRAF"; },

    // Valores funcionales derivados (no editables por property)
    maxLoginAttempts:  function () { return 5; },
    lockoutMs:         function () { return 15 * 60 * 1000; },   // 15 minutos
    resetTokenTtlMs:   function () { return 30 * 60 * 1000; },   // 30 minutos

    set: function (key, value) {
      props_().setProperty(key, String(value));
      _cache = null; // invalidar caché
    },

    setAll: function (map) {
      props_().setProperties(map, false);
      _cache = null;
    },
  };
})();
