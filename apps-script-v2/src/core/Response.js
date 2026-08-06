/**
 * Response — envelope uniforme para todas las respuestas del Web App.
 *
 * Formato fijo compatible con httpAppsScriptAdapter.ts del frontend:
 *   { success, data, metadata: { requestId, durationMs }, errors, timestamp }
 */

function jsonOutput_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function ok_(data, meta) {
  var m = Object.assign({ requestId: null, durationMs: 0 }, meta || {});
  return jsonOutput_({
    success:   true,
    data:      data !== undefined ? data : null,
    metadata:  m,
    errors:    [],
    timestamp: new Date().toISOString(),
    requestId: m.requestId,
  });
}

function fail_(error, meta) {
  var m = Object.assign({ requestId: null, durationMs: 0 }, meta || {});
  var msg  = String((error && error.message) || error || "Error interno del servidor.");
  var code = (error && error.code) ? String(error.code) : "INTERNAL_ERROR";
  return jsonOutput_({
    success:   false,
    data:      null,
    metadata:  m,
    errors:    [{ code: code, message: msg }],
    timestamp: new Date().toISOString(),
    requestId: m.requestId,
  });
}
