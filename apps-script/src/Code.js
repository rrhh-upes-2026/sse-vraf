/**
 * Web App entry point. Deploy this project as a Web App (see README.md) and
 * set APPS_SCRIPT_WEB_APP_URL in web/.env.local to the resulting /exec URL.
 *
 * Request body (JSON, sent as text/plain to stay a CORS simple request):
 *   {
 *     action:    string,   // "<entity>.<verb>" or "auth.<verb>"
 *     params:    object,   // action parameters
 *     userId:    string?,  // acting user id (optional; domain gate is primary auth)
 *     userEmail: string?,  // acting user email (for auth.getUser bridge)
 *     secret:    string?,  // WEBHOOK_SHARED_SECRET if configured
 *   }
 *
 * Response: see response.js — { success, data, metadata, errors, timestamp, requestId }
 *
 * SECURITY: Access is restricted to signed-in Workspace domain users via
 * appsscript.json "access": "DOMAIN". WEBHOOK_SHARED_SECRET adds an optional
 * extra gate for trusted server-side callers (do not use it from the browser
 * adapter — a secret in client JS is not a secret).
 */
// Merge all entity schemas at load time so the router and SheetRepository
// can resolve entity names in every request without per-request overhead.
(function bootstrap_() {
  try {
    mergeWorkspaceAdminEntities_();
  } catch (e) {}
  try {
    mergeBuilderEntities_();
  } catch (e) {}
  try {
    mergeContratacionEntities_();
  } catch (e) {}
  try {
    mergeComprasEntities_();
  } catch (e) {}
  try {
    mergeContabilidadEntities_();
  } catch (e) {}
  try {
    mergeMantenimientoEntities_();
  } catch (e) {}
  try {
    mergeSSOEntities_();
  } catch (e) {}
  try {
    mergeIMEEntities_();
  } catch (e) {}
  try {
    mergePMEEntities_();
  } catch (e) {}
  try {
    mergeAPEEntities_();
  } catch (e) {}
  try {
    mergeAEEEntities_();
  } catch (e) {}
  try {
    mergeEMEEntities_();
  } catch (e) {}
  try {
    mergeCPEEntities_();
  } catch (e) {}
  try {
    mergeIIEEntities_();
  } catch (e) {}
  try {
    mergeIOEEntities_();
  } catch (e) {}
  try {
    bootstrapDashboardAdapters_();
  } catch (e) {}
  try {
    bootstrapKPIAdapters_();
  } catch (e) {}
  try {
    registerAllUnits_();
  } catch (e) {}
  try {
    if (typeof EJECUTIVO_UNIT_DEF !== "undefined") OrgUnitRegistry.register(EJECUTIVO_UNIT_DEF);
  } catch (e) {}
  try {
    if (typeof IME_UNIT_DEF !== "undefined") OrgUnitRegistry.register(IME_UNIT_DEF);
  } catch (e) {}
  try {
    if (typeof PME_UNIT_DEF !== "undefined") OrgUnitRegistry.register(PME_UNIT_DEF);
  } catch (e) {}
  try {
    if (typeof APE_UNIT_DEF !== "undefined") OrgUnitRegistry.register(APE_UNIT_DEF);
  } catch (e) {}
  try {
    if (typeof AEE_UNIT_DEF !== "undefined") OrgUnitRegistry.register(AEE_UNIT_DEF);
  } catch (e) {}
  try {
    if (typeof EME_UNIT_DEF !== "undefined") OrgUnitRegistry.register(EME_UNIT_DEF);
  } catch (e) {}
  try {
    if (typeof CPE_UNIT_DEF !== "undefined") OrgUnitRegistry.register(CPE_UNIT_DEF);
  } catch (e) {}
  try {
    if (typeof EIP_UNIT_DEF !== "undefined") OrgUnitRegistry.register(EIP_UNIT_DEF);
  } catch (e) {}
  try {
    if (typeof IIE_UNIT_DEF !== "undefined") OrgUnitRegistry.register(IIE_UNIT_DEF);
  } catch (e) {}
  try {
    if (typeof IOE_UNIT_DEF !== "undefined") OrgUnitRegistry.register(IOE_UNIT_DEF);
  } catch (e) {}
})();

function doPost(e) {
  var context = createContext_();
  var body;

  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
  } catch (parseErr) {
    return fail_(new Error("Invalid JSON in request body"), { requestId: context.requestId });
  }

  try {
    assertSharedSecret_(body.secret);

    // userEmail: authoritative identity from Google Workspace domain auth.
    // userId: DB id from the verified server-side session; falls back to email.
    var activeEmail = Session.getActiveUser().getEmail();
    context.userEmail = activeEmail || body.userEmail || "";
    context.userId    = body.userId  || context.userEmail;

    AppLogger.info("doPost", {
      action: String(body.action || "").replace(/[\r\n]/g, ""),
      requestId: context.requestId,
      userId: context.userId,
    });

    var routeResult = routeAction_(body.action, body.params || {}, context);

    var meta = buildResponseMeta_(context);
    if (routeResult.pagination) meta.pagination = routeResult.pagination;

    return ok_(routeResult.data, meta);
  } catch (err) {
    AppLogger.error("doPost error", {
      action: body && body.action,
      requestId: context.requestId,
      error: String((err && err.message) || err),
    });

    // Audit the failure for write actions
    if (body && body.action && isWriteAction_(body.action)) {
      AuditService.record({
        accion:      body.action,
        entidadTipo: (body.action || "").split(".")[0],
        entidadId:   body.params && body.params.id || "",
        usuarioId:   context.userId || "",
        resultado:   "error",
        detalle:     { error: String((err && err.message) || err) },
      });
    }

    return fail_(err, buildResponseMeta_(context));
  }
}

function doGet() {
  return jsonOutput_({
    success: true,
    data: { service: Config.instanceName() + " Apps Script BFF", status: "healthy" },
    metadata: { requestId: IdGen.requestId(), durationMs: 0 },
    errors: [],
    timestamp: new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createContext_() {
  return {
    requestId: IdGen.requestId(),
    startMs:   new Date().getTime(),
    userId:    "",
    userEmail: "",
  };
}

function buildResponseMeta_(context) {
  return {
    requestId:  context.requestId,
    durationMs: new Date().getTime() - (context.startMs || 0),
  };
}

function assertSharedSecret_(providedSecret) {
  var expected = Config.webhookSecret();
  if (!expected) return; // not configured — see README before real deployment
  if (providedSecret !== expected) {
    var err = new Error("Unauthorized: invalid or missing secret");
    err.code = "UNAUTHORIZED";
    throw err;
  }
}

function isWriteAction_(action) {
  var verb = String(action || "").split(".")[1] || "";
  return verb === "create" || verb === "update" || verb === "remove";
}
