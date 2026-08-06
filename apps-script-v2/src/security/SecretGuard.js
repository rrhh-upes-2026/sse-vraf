/**
 * SecretGuard — valida el WEBHOOK_SHARED_SECRET en cada request.
 *
 * Si la property no está configurada, el guard pasa sin restricción
 * (modo desarrollo). En producción, siempre configurar la secret.
 */
var SecretGuard = {
  verify: function (providedSecret) {
    var expected = Config.webhookSecret();
    if (!expected) return; // No configurado — modo desarrollo
    if (providedSecret !== expected) {
      var e = new Error("No autorizado: secret inválido o ausente.");
      e.code = "UNAUTHORIZED";
      throw e;
    }
  },
};
