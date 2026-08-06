/**
 * PasswordService — gestión completa del ciclo de vida de contraseñas.
 *
 * Nunca almacena contraseñas en texto plano.
 * Hash: SHA-256(salt + ":" + password) via Crypto.hash().
 */
var PasswordService = {

  verify: function (plainPassword, salt, hash) {
    return Crypto.verify(plainPassword, salt, hash);
  },

  /**
   * Cambia la contraseña de un usuario autenticado.
   * Requiere la contraseña actual para confirmación.
   */
  change: function (userId, currentPassword, newPassword) {
    Validator.minLength(newPassword, 8, "La nueva contraseña");

    var user = Repository.for("usuarios").findById(userId);
    if (!user) {
      var e = new Error("Usuario no encontrado."); e.code = "NOT_FOUND"; throw e;
    }

    // Si el usuario tiene contraseña personal, verificarla antes de cambiar
    if (user.passwordHash && user.passwordSalt) {
      if (!PasswordService.verify(currentPassword, user.passwordSalt, user.passwordHash)) {
        var e2 = new Error("Contraseña actual incorrecta."); e2.code = "INVALID_CREDENTIALS"; throw e2;
      }
    }

    var salt = Crypto.salt();
    var hash = Crypto.hash(newPassword, salt);

    Repository.for("usuarios").update(userId, {
      passwordHash:       hash,
      passwordSalt:       salt,
      mustChangePassword: false,
      updatedAt:          new Date().toISOString(),
    });

    AuditService.log({
      accion: "auth.changePassword", entidadTipo: "usuarios",
      entidadId: userId, usuarioId: userId, resultado: "ok",
    });

    try {
      var u = Repository.for("usuarios").findById(userId);
      if (u) MailService.sendPasswordChanged(u.email, u.nombre);
    } catch (_) {}

    return { changed: true };
  },

  /**
   * Inicia el flujo de recuperación: genera token y envía correo.
   * Siempre retorna { sent: true } — no revela si el email existe.
   */
  forgotPassword: function (email) {
    Validator.domain(email, Config.allowedDomain());

    var user = Repository.for("usuarios").findOne({ email: email });
    if (!user || !user.activo) return { sent: true };

    var token     = Crypto.resetToken();
    var expiresAt = new Date(new Date().getTime() + Config.resetTokenTtlMs()).toISOString();

    Repository.for("passwordResets").create({
      id:        Crypto.uuid(),
      email:     email,
      token:     token,
      expiresAt: expiresAt,
      usado:     false,
      createdAt: new Date().toISOString(),
    });

    try { MailService.sendPasswordReset(email, token); } catch (mailErr) {
      console.error("[PasswordService.forgotPassword] mail error:", mailErr.message);
    }

    AuditService.log({
      accion: "auth.forgotPassword", entidadTipo: "usuarios",
      entidadId: user.id, usuarioId: user.id, resultado: "ok",
    });

    return { sent: true };
  },

  /**
   * Completa el flujo de recuperación: valida token y actualiza contraseña.
   */
  resetPassword: function (token, newPassword) {
    Validator.requireFields({ token: token, newPassword: newPassword }, ["token", "newPassword"]);
    Validator.minLength(newPassword, 8, "La contraseña");

    var reset = Repository.for("passwordResets").findOne({ token: token });

    if (!reset || reset.usado === true || reset.usado === "true") {
      var e = new Error("Token de recuperación inválido o ya utilizado."); e.code = "INVALID_TOKEN"; throw e;
    }
    if (new Date().toISOString() > reset.expiresAt) {
      var e2 = new Error("El token de recuperación ha expirado."); e2.code = "TOKEN_EXPIRED"; throw e2;
    }

    var user = Repository.for("usuarios").findOne({ email: reset.email });
    if (!user) { var e3 = new Error("Usuario no encontrado."); e3.code = "NOT_FOUND"; throw e3; }

    var salt = Crypto.salt();
    var hash = Crypto.hash(newPassword, salt);

    Repository.for("usuarios").update(user.id, {
      passwordHash:       hash,
      passwordSalt:       salt,
      mustChangePassword: false,
      updatedAt:          new Date().toISOString(),
    });

    Repository.for("passwordResets").update(reset.id, { usado: true });

    AuditService.log({
      accion: "auth.resetPassword", entidadTipo: "usuarios",
      entidadId: user.id, usuarioId: user.id, resultado: "ok",
    });

    return { reset: true };
  },
};
