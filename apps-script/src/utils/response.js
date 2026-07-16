/**
 * Wire response envelope — frozen for the lifetime of the project.
 *
 * Every Apps Script response conforms to:
 *   {
 *     success:   boolean,
 *     data:      any,          // null on error
 *     metadata:  {
 *       requestId:  string,    // REQ-XXXXXXXX (echoed from context)
 *       durationMs: number,    // wall-clock time for the action
 *       pagination?: {         // present only on paginated list results
 *         page, pageSize, total, totalPages
 *       }
 *     },
 *     errors:    [{ code, message, field? }],   // empty array on success
 *     timestamp: string,       // ISO-8601 UTC
 *     requestId: string,       // top-level copy of metadata.requestId for quick access
 *   }
 *
 * This matches web/services/adapters/httpAppsScriptAdapter.ts exactly.
 * The previous { ok, data, error } format from Sprint 1 is superseded here.
 */
function jsonOutput_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function buildEnvelope_(success, data, metadata, errors) {
  var ts = new Date().toISOString();
  var meta = Object.assign({ requestId: null, durationMs: 0 }, metadata || {});
  return {
    success:   success,
    data:      data !== undefined ? data : null,
    metadata:  meta,
    errors:    errors  || [],
    timestamp: ts,
    requestId: meta.requestId,
  };
}

function ok_(data, metadata) {
  return jsonOutput_(buildEnvelope_(true, data, metadata, []));
}

function fail_(error, metadata) {
  var msg  = String((error && error.message) || error || "Unknown error");
  var code = (error && error.code) ? String(error.code) : "INTERNAL_ERROR";
  return jsonOutput_(buildEnvelope_(false, null, metadata, [{ code: code, message: msg }]));
}
