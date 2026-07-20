/**
 * Authentication bridge — institutional email + OTP flow.
 *
 * Security controls:
 *   - Domain enforcement (upes.edu.sv only)
 *   - User existence + activo check at every step
 *   - Resend cooldown: 60 s between OTP sends; same code reused within the window
 *   - Brute-force lockout: 5 wrong codes → 15-min lockout per email
 *   - Single-use OTP: cache key deleted on first correct verification
 *   - Full audit trail via LoginAuditService → login_audit sheet
 *
 * CacheService keys (namespaced "sse:" by AppCacheService):
 *   otp:{email}    { code, issuedAt }            TTL 600 s (10 min)
 *   fails:{email}  { count, lockedUntil }         TTL 900 s (15 min)
 *
 * Handled actions: auth.ping | auth.sendOtp | auth.verifyOtp | auth.getUser
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

  // ─────────────────────────────────────────────────────────────
  // STEP 1 — send OTP
  // ─────────────────────────────────────────────────────────────
  /**
   * Validates domain, looks up user, enforces resend cooldown, stores OTP
   * in CacheService, and sends it via GmailApp. Logs every outcome.
   *
   * @param {{ email: string, ip?: string, userAgent?: string }} params
   * @returns {{ sent: boolean }}
   */
  sendOtp: function (params) {
    Validator.requireFields(params, ["email"]);
    var email     = String(params.email).trim().toLowerCase();
    var ip        = String(params.ip        || "");
    var userAgent = String(params.userAgent || "");

    // 1. Domain gate — enforced before any Sheets read
    var domain = email.split("@")[1] || "";
    var allowedDomain = Config.domain() || "upes.edu.sv";
    if (!domain || domain !== allowedDomain) {
      LoginAuditService.record({
        email: email, ip: ip, userAgent: userAgent,
        resultado: "ERROR", motivo: "domain_invalid",
      });
      throw new Error("Acceso permitido únicamente para cuentas institucionales UPES.");
    }

    // 2. User lookup
    var results = listEntities_("usuarios", { email: email });
    if (!results.items || results.items.length === 0) {
      LoginAuditService.record({
        email: email, ip: ip, userAgent: userAgent,
        resultado: "ERROR", motivo: "user_not_found",
      });
      throw new Error("Usuario no autorizado.");
    }
    var usuario = results.items[0];
    if (usuario.activo !== true) {
      LoginAuditService.record({
        email: email, ip: ip, userAgent: userAgent,
        resultado: "ERROR", motivo: "user_inactive",
        usuarioId: usuario.id, rol: usuario.rol, unidad: usuario.unidadId,
      });
      throw new Error("Usuario no autorizado.");
    }

    // 3. Resend cooldown — prevent OTP spam
    var otpKey   = "otp:" + email;
    var existing = AppCacheService.get(otpKey);
    var now      = new Date().getTime();
    var COOLDOWN_MS = 60 * 1000; // 60 seconds
    var otpCode;

    if (existing) {
      var elapsed = now - (existing.issuedAt || 0);

      if (elapsed < COOLDOWN_MS) {
        var waitSec = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
        LoginAuditService.record({
          email: email, ip: ip, userAgent: userAgent,
          resultado: "ERROR", motivo: "cooldown_" + waitSec + "s",
          usuarioId: usuario.id, rol: usuario.rol, unidad: usuario.unidadId,
        });
        throw new Error("Por favor espere " + waitSec + " segundo(s) antes de solicitar otro código.");
      }

      // Cooldown passed: reuse the same code (avoids confusion with multiple codes),
      // refresh TTL and issuedAt so the 10-min window restarts from now.
      otpCode = existing.code;
    } else {
      // Generate a new 6-digit OTP (100 000–999 999)
      otpCode = String(Math.floor(100000 + Math.random() * 900000));
    }

    AppCacheService.set(otpKey, { code: otpCode, issuedAt: now }, 600);

    // 4. Email delivery
    var body =
      "<p>Su código de acceso para <strong>SSE-VRAF</strong> es:</p>" +
      "<p style=\"font-size: 36px; font-weight: bold; letter-spacing: 10px;" +
      "    text-align: center; color: #2E6BE6; margin: 28px 0;\">" + otpCode + "</p>" +
      "<p>Este código vence en <strong>10&nbsp;minutos</strong> y es de un solo uso.</p>" +
      "<p style=\"color: #9e9e9e; font-size: 12px;\">Si usted no solicitó este código, ignore este mensaje.</p>";

    GmailService.sendEmail(
      email,
      "Código de acceso SSE-VRAF",
      GmailService.buildPlatformEmail(body)
    );

    LoginAuditService.record({
      email: email, ip: ip, userAgent: userAgent,
      resultado: "OK", motivo: "otp_sent",
      usuarioId: usuario.id, rol: usuario.rol, unidad: usuario.unidadId,
    });
    AppLogger.info("AuthBridge.sendOtp: sent", { email: email });
    return { sent: true };
  },

  // ─────────────────────────────────────────────────────────────
  // STEP 2 — verify OTP
  // ─────────────────────────────────────────────────────────────
  /**
   * Validates the OTP against cache. Wrong codes increment a failure counter;
   * 5 consecutive failures trigger a 15-min lockout. On success the OTP is
   * consumed and the failure counter is cleared.
   *
   * @param {{ email: string, code: string, ip?: string, userAgent?: string }} params
   * @returns {{ usuarioId, nombre, email, rol, unidadId }}
   */
  verifyOtp: function (params) {
    Validator.requireFields(params, ["email", "code"]);
    var email     = String(params.email).trim().toLowerCase();
    var code      = String(params.code).trim();
    var ip        = String(params.ip        || "");
    var userAgent = String(params.userAgent || "");

    var LOCK_TTL_SEC = 900; // 15 min
    var MAX_ATTEMPTS = 5;
    var failKey   = "fails:" + email;
    var failState = AppCacheService.get(failKey) || { count: 0, lockedUntil: 0 };
    var now       = new Date().getTime();

    // 1. Lockout check — reject immediately if account is locked
    if (failState.lockedUntil && now < failState.lockedUntil) {
      var remaining = Math.ceil((failState.lockedUntil - now) / 60000);
      LoginAuditService.record({
        email: email, ip: ip, userAgent: userAgent,
        resultado: "ERROR", motivo: "account_locked",
      });
      throw new Error("Cuenta bloqueada temporalmente. Intente nuevamente en " + remaining + " minuto(s).");
    }

    // 2. OTP presence check
    var stored = AppCacheService.get("otp:" + email);
    if (!stored) {
      // OTP expired (TTL elapsed) or was never issued
      LoginAuditService.record({
        email: email, ip: ip, userAgent: userAgent,
        resultado: "ERROR", motivo: "otp_expired",
      });
      throw new Error("Código inválido o expirado.");
    }

    // 3. Code comparison
    if (stored.code !== code) {
      failState.count = (failState.count || 0) + 1;

      if (failState.count >= MAX_ATTEMPTS) {
        failState.lockedUntil = now + 15 * 60 * 1000;
        AppCacheService.set(failKey, failState, LOCK_TTL_SEC);
        LoginAuditService.record({
          email: email, ip: ip, userAgent: userAgent,
          resultado: "ERROR", motivo: "max_attempts_locked",
        });
        throw new Error("Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.");
      }

      AppCacheService.set(failKey, failState, LOCK_TTL_SEC);
      var left = MAX_ATTEMPTS - failState.count;
      LoginAuditService.record({
        email: email, ip: ip, userAgent: userAgent,
        resultado: "ERROR", motivo: "invalid_code_attempt_" + failState.count,
      });
      throw new Error("Código inválido o expirado. Te quedan " + left + " intento(s).");
    }

    // 4. Correct code — consume OTP and clear failure counter
    AppCacheService.remove("otp:" + email);
    AppCacheService.remove(failKey);

    // 5. Re-validate user (activo may have changed since sendOtp)
    var results = listEntities_("usuarios", { email: email });
    if (!results.items || results.items.length === 0) {
      LoginAuditService.record({
        email: email, ip: ip, userAgent: userAgent,
        resultado: "ERROR", motivo: "user_not_found_on_verify",
      });
      throw new Error("Usuario no autorizado.");
    }
    var u = results.items[0];
    if (u.activo !== true) {
      LoginAuditService.record({
        email: email, ip: ip, userAgent: userAgent,
        resultado: "ERROR", motivo: "user_inactive_on_verify",
        usuarioId: u.id, rol: u.rol, unidad: u.unidadId,
      });
      throw new Error("Usuario no autorizado.");
    }

    LoginAuditService.record({
      email: email, ip: ip, userAgent: userAgent,
      resultado: "OK", motivo: "login_success",
      usuarioId: u.id, rol: u.rol, unidad: u.unidadId,
    });
    AppLogger.info("AuthBridge.verifyOtp: success", { email: email });

    return {
      usuarioId: u.id,
      nombre:    u.nombre,
      email:     u.email,
      rol:       u.rol,
      unidadId:  u.unidadId,
    };
  },

  // ─────────────────────────────────────────────────────────────
  // Admin / compatibility
  // ─────────────────────────────────────────────────────────────
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
