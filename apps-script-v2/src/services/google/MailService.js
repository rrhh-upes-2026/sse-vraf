/**
 * MailService — envío de correos institucionales via GmailApp.
 */
var MailService = {
  _brand: "Sistema de Seguimiento Estratégico — UPES",
  _color: "#2E6BE6",

  _wrap: function (content) {
    return [
      "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px'>",
      "<div style='border-bottom:3px solid " + MailService._color + ";padding-bottom:16px;margin-bottom:24px'>",
      "<span style='color:" + MailService._color + ";font-size:18px;font-weight:bold'>SSE-VRAF</span>",
      "</div>",
      content,
      "<div style='border-top:1px solid #eee;margin-top:24px;padding-top:16px'>",
      "<p style='color:#999;font-size:11px;margin:0'>" + MailService._brand + "</p>",
      "</div>",
      "</div>",
    ].join("");
  },

  send: function (to, subject, htmlBody) {
    GmailApp.sendEmail(to, subject, "", {
      htmlBody: htmlBody,
      name:     "SSE-VRAF",
    });
  },

  sendPasswordReset: function (to, token) {
    var shortCode = token.substring(0, 8).toUpperCase();
    var content = [
      "<h2 style='color:#1a1a1a'>Recuperación de contraseña</h2>",
      "<p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>",
      "<p>Usa este código de recuperación (válido por <strong>30 minutos</strong>):</p>",
      "<div style='background:#f0f4ff;border:1px solid " + MailService._color + ";border-radius:8px;",
      "     padding:20px;text-align:center;margin:24px 0'>",
      "<code style='font-size:24px;font-weight:bold;letter-spacing:6px;color:" + MailService._color + "'>",
      shortCode + "</code>",
      "</div>",
      "<p style='color:#666;font-size:13px'>Si no solicitaste este cambio, ignora este correo. Tu contraseña actual no ha sido modificada.</p>",
    ].join("");

    MailService.send(to, "Recuperación de contraseña — SSE-VRAF", MailService._wrap(content));
  },

  sendWelcome: function (to, nombre, tempPassword) {
    var content = [
      "<h2 style='color:#1a1a1a'>¡Bienvenido, " + nombre + "!</h2>",
      "<p>Se ha creado tu cuenta en el Sistema de Seguimiento Estratégico de VRAF.</p>",
      "<table style='border-collapse:collapse;margin:16px 0'>",
      "<tr><td style='padding:8px 16px 8px 0;color:#666'>Correo:</td><td style='padding:8px 0;font-weight:bold'>" + to + "</td></tr>",
      "<tr><td style='padding:8px 16px 8px 0;color:#666'>Contraseña temporal:</td><td style='padding:8px 0;font-weight:bold;font-family:monospace'>" + tempPassword + "</td></tr>",
      "</table>",
      "<p style='color:#c0392b;font-size:13px'><strong>⚠ Deberás cambiar tu contraseña al iniciar sesión por primera vez.</strong></p>",
    ].join("");

    MailService.send(to, "Bienvenido al sistema SSE-VRAF", MailService._wrap(content));
  },

  sendPasswordChanged: function (to, nombre) {
    var content = [
      "<h2 style='color:#1a1a1a'>Contraseña actualizada</h2>",
      "<p>Hola <strong>" + nombre + "</strong>,</p>",
      "<p>Tu contraseña ha sido actualizada exitosamente.</p>",
      "<p style='color:#666;font-size:13px'>Si no realizaste este cambio, contacta al administrador inmediatamente.</p>",
    ].join("");

    MailService.send(to, "Contraseña actualizada — SSE-VRAF", MailService._wrap(content));
  },
};
