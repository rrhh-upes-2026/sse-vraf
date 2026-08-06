/**
 * AuthService — autenticación de usuarios institucionales.
 *
 * Flujo de login:
 *   1. Validar dominio @upes.edu.sv
 *   2. Verificar rate limit (brute-force)
 *   3. Buscar usuario activo en Sheets
 *   4. Comparar hash de contraseña
 *   5. Registrar auditoría
 *   6. Retornar payload del usuario (Next.js crea el JWT)
 */
var AuthService = {

  login: function (params) {
    Validator.requireFields(params, ["email", "password"]);

    var email     = String(params.email).trim().toLowerCase();
    var password  = String(params.password);
    var ip        = String(params.ip        || "");
    var userAgent = String(params.userAgent || "");

    // Validar dominio antes de tocar la BD
    Validator.domain(email, Config.allowedDomain());

    // Verificar bloqueo por intentos previos
    RateLimiter.check(email);

    // Buscar usuario
    var user = Repository.for("usuarios").findOne({ email: email });
    if (!user || user.activo !== true) {
      AuditService.loginRecord({ email: email, ip: ip, userAgent: userAgent, resultado: "ERROR", motivo: "user_not_found_or_inactive" });
      var e = new Error("Credenciales inválidas."); e.code = "INVALID_CREDENTIALS"; throw e;
    }

    // Verificar que tenga contraseña configurada
    if (!user.passwordHash || !user.passwordSalt) {
      AuditService.loginRecord({ email: email, ip: ip, userAgent: userAgent, resultado: "ERROR", motivo: "no_password_set", usuarioId: user.id });
      var e2 = new Error("Credenciales inválidas. Contacte al administrador."); e2.code = "INVALID_CREDENTIALS"; throw e2;
    }

    // Comparar contraseña
    if (!PasswordService.verify(password, user.passwordSalt, user.passwordHash)) {
      var remaining = RateLimiter.record(email);
      AuditService.loginRecord({ email: email, ip: ip, userAgent: userAgent, resultado: "ERROR", motivo: "invalid_password", usuarioId: user.id });
      var msg = remaining > 0
        ? "Credenciales inválidas. Te quedan " + remaining + " intento(s)."
        : "Credenciales inválidas.";
      var e3 = new Error(msg); e3.code = "INVALID_CREDENTIALS"; throw e3;
    }

    // Éxito — limpiar contador y actualizar último acceso
    RateLimiter.clear(email);
    AuditService.loginRecord({ email: email, ip: ip, userAgent: userAgent, resultado: "OK", motivo: "login_success", usuarioId: user.id });

    try {
      Repository.for("usuarios").update(user.id, { lastLoginAt: new Date().toISOString() });
    } catch (_) {}

    return {
      usuarioId:          user.id,
      nombre:             user.nombre,
      email:              user.email,
      rol:                user.rol,
      unidadId:           user.unidadId,
      mustChangePassword: user.mustChangePassword === true || user.mustChangePassword === "true",
    };
  },

  logout: function (params) {
    if (params && params.userId) {
      AuditService.log({
        accion: "auth.logout", entidadTipo: "session",
        entidadId: params.userId, usuarioId: params.userId, resultado: "ok",
      });
    }
    return { ok: true };
  },

  register: function (params) {
    Validator.requireFields(params, ["email", "nombre", "password"]);

    var email    = String(params.email).trim().toLowerCase();
    var nombre   = String(params.nombre).trim();
    var password = String(params.password);

    Validator.domain(email, Config.allowedDomain());
    Validator.minLength(password, 8, "La contraseña");
    Validator.minLength(nombre, 2, "El nombre");

    // Bloquear roles protegidos en auto-registro
    var rol = String(params.rol || Roles.USUARIO);
    if (Roles.isProtected(rol)) {
      var ef = new Error("No puedes registrarte con ese rol."); ef.code = "FORBIDDEN"; throw ef;
    }
    if (!Roles.isValid(rol)) {
      var ev = new Error("Rol inválido: " + rol); ev.code = "VALIDATION_ERROR"; throw ev;
    }

    // Verificar duplicado
    if (Repository.for("usuarios").exists({ email: email })) {
      var ed = new Error("Ya existe una cuenta con este correo."); ed.code = "DUPLICATE"; throw ed;
    }

    var salt     = Crypto.salt();
    var hash     = Crypto.hash(password, salt);
    var initials = nombre.split(" ").filter(Boolean).slice(0, 2).map(function (n) { return n[0]; }).join("").toUpperCase();
    var userId   = "usr-" + Crypto.uuid().replace(/-/g, "").substring(0, 12);
    var now      = new Date().toISOString();

    Repository.for("usuarios").create({
      id:                 userId,
      nombre:             nombre,
      email:              email,
      unidadId:           String(params.wsId || params.unidadId || ""),
      rol:                rol,
      activo:             true,
      passwordHash:       hash,
      passwordSalt:       salt,
      mustChangePassword: false,
      avatarInitials:     initials,
      lastLoginAt:        null,
      createdAt:          now,
      updatedAt:          now,
    });

    AuditService.log({ accion: "auth.register", entidadTipo: "usuarios", entidadId: userId, usuarioId: userId, resultado: "ok" });

    return { usuarioId: userId, nombre: nombre, email: email, rol: rol };
  },

  getUser: function (params) {
    Validator.requireFields(params, ["email"]);
    var user = Repository.for("usuarios").findOne({ email: String(params.email).trim().toLowerCase() });
    if (!user) return null;
    return {
      usuarioId:  user.id,
      nombre:     user.nombre,
      email:      user.email,
      rol:        user.rol,
      unidadId:   user.unidadId,
      activo:     user.activo,
      lastLoginAt: user.lastLoginAt,
    };
  },

  ping: function () {
    return { status: "ok", instance: Config.instanceName(), version: "2.0.0" };
  },
};
