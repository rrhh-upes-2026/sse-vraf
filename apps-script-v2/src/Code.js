/**
 * Code.js — punto de entrada único del Web App.
 *
 * doPost(e): recibe todas las peticiones del frontend Next.js.
 * doGet():   health check (acceso libre para verificar el deploy).
 *
 * Protocolo de request:
 *   POST body (JSON): { action, params, secret?, userId?, userEmail?, ip?, userAgent? }
 *
 * Protocolo de response:
 *   { success, data, metadata: { requestId, durationMs }, errors, timestamp }
 */

function doPost(e) {
  var startMs    = new Date().getTime();
  var requestId  = "REQ-" + Utilities.getUuid().replace(/-/g, "").substring(0, 8).toUpperCase();
  var meta       = function () { return { requestId: requestId, durationMs: new Date().getTime() - startMs }; };
  var body       = {};

  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
  } catch (_) {
    return fail_({ message: "JSON inválido en el cuerpo del request.", code: "PARSE_ERROR" }, meta());
  }

  var context = {
    requestId: requestId,
    startMs:   startMs,
    userId:    String(body.userId    || body.userEmail || ""),
    userEmail: String(body.userEmail || ""),
    ip:        String(body.ip        || ""),
    userAgent: String(body.userAgent || ""),
  };

  try {
    SecretGuard.verify(body.secret);

    var result = Router.dispatch(body.action, body.params || {}, context);

    return ok_(result, meta());

  } catch (err) {
    console.error("[doPost] " + String(body.action) + " → " + String(err && err.message || err));
    return fail_(err, meta());
  }
}

function doGet() {
  return jsonOutput_({
    success:   true,
    data:      { service: Config.instanceName(), status: "healthy", version: "2.0.0" },
    metadata:  { requestId: "HEALTH", durationMs: 0 },
    errors:    [],
    timestamp: new Date().toISOString(),
    requestId: "HEALTH",
  });
}
