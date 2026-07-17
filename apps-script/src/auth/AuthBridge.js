/**
 * Authentication bridge — institutional email + OTP flow.
 *
 * Replaces the previous Google OAuth bridge. All auth actions are
 * server-to-server: Next.js calls these endpoints with the shared secret;
 * no browser request ever reaches Apps Script directly.
 *
 * Handled actions:
 *   auth.ping       — health check
 *   auth.sendOtp    — validate user, generate OTP, email it
 *   auth.verifyOtp  — validate OTP, return user payload for session creation
 *   auth.getUser    — retained for backward compatibility / admin tools
 */
var AuthBridge = {
  route: function (verb, params) {
    switch (verb) {
      case "ping":      return AuthBridge.ping();
      case "sendOtp":   return AuthBridge.sendOtp(params);
      case "verifyOtp": return AuthBridge.verifyOtp(params);
      case "getUser":   return AuthBridge.getUser(params);
      default:
        throw new Error("Unknown auth action: auth." + verb);
    }
  },

  /**
   * Step 1 of login.
   * Validates domain + user existence + activo, then generates a
   * 6-digit OTP stored in CacheService (TTL = 10 min) and emails it.
   *
   * @param {{ email: string }} params
   * @returns {{ sent: boolean }}
   */
  sendOtp: function (params) {
    Validator.requireFields(params, ["email"]);
    var email = String(params.email).trim().toLowerCase();

    var domain = email.split("@")[1] || "";
    if (domain !== "upes.edu.sv") {
      throw new Error("Acceso permitido únicamente para cuentas institucionales UPES.");
    }

    var results = listEntities_("usuarios", { email: email });
    if (!results.items || results.items.length === 0) {
      throw new Error("Usuario no autorizado.");
    }
    var usuario = results.items[0];
    if (usuario.activo !== true) {
      throw new Error("Usuario no autorizado.");
    }

    // 6-digit OTP: 100000–999999
    var code = String(Math.floor(100000 + Math.random() * 900000));
    AppCacheService.set("otp:" + email, { code: code }, 600);

    var body =
      "<p>Su código de acceso para <strong>SSE-VRAF</strong> es:</p>" +
      "<p style=\"font-size: 36px; font-weight: bold; letter-spacing: 10px;" +
      "    text-align: center; color: #2E6BE6; margin: 28px 0;\">" + code + "</p>" +
      "<p>Este código vence en <strong>10&nbsp;minutos</strong> y es de un solo uso.</p>" +
      "<p style=\"color: #9e9e9e; font-size: 12px;\">Si usted no solicitó este código, ignore este mensaje.</p>";

    GmailService.sendEmail(
      email,
      "Código de acceso SSE-VRAF",
      GmailService.buildPlatformEmail(body)
    );

    AppLogger.info("AuthBridge.sendOtp: sent", { email: email });
    return { sent: true };
  },

  /**
   * Step 2 of login.
   * Validates the OTP, consumes it (single-use), and returns the user
   * payload that the Next.js route will sign into a session JWT.
   *
   * @param {{ email: string, code: string }} params
   * @returns {{ usuarioId, nombre, email, rol, unidadId }}
   */
  verifyOtp: function (params) {
    Validator.requireFields(params, ["email", "code"]);
    var email = String(params.email).trim().toLowerCase();
    var code  = String(params.code).trim();

    var stored = AppCacheService.get("otp:" + email);
    if (!stored || stored.code !== code) {
      throw new Error("Código inválido o expirado.");
    }

    // Consume immediately — single use
    AppCacheService.remove("otp:" + email);

    var results = listEntities_("usuarios", { email: email });
    if (!results.items || results.items.length === 0) {
      throw new Error("Usuario no autorizado.");
    }
    var u = results.items[0];
    if (u.activo !== true) {
      throw new Error("Usuario no autorizado.");
    }

    AppLogger.info("AuthBridge.verifyOtp: verified", { email: email });
    return {
      usuarioId: u.id,
      nombre:    u.nombre,
      email:     u.email,
      rol:       u.rol,
      unidadId:  u.unidadId,
    };
  },

  /**
   * Lookup by email — retained for admin tooling and migration scripts.
   *
   * @param {{ email: string }} params
   * @returns {{ usuarioId, nombre, email, rol, unidadId, activo } | null}
   */
  getUser: function (params) {
    Validator.requireFields(params, ["email"]);
    var results = listEntities_("usuarios", { email: params.email });
    if (!results.items || results.items.length === 0) return null;
    var u = results.items[0];
    return {
      usuarioId: u.id,
      nombre:    u.nombre,
      email:     u.email,
      rol:       u.rol,
      unidadId:  u.unidadId,
      activo:    u.activo,
    };
  },

  ping: function () {
    return {
      status:   "ok",
      instance: Config.instanceName(),
      sprint:   "3 — Institutional Auth + OTP",
    };
  },
};
