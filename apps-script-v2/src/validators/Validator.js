/**
 * Validator — validaciones de entrada reutilizables.
 * Todos los métodos lanzan Error con code "VALIDATION_ERROR" en caso de fallo.
 */
var Validator = {
  requireFields: function (params, fields) {
    var missing = (fields || []).filter(function (f) {
      var v = params && params[f];
      return v === undefined || v === null || v === "";
    });
    if (missing.length > 0) {
      var e = new Error("Campos requeridos: " + missing.join(", "));
      e.code = "VALIDATION_ERROR";
      throw e;
    }
  },

  email: function (value) {
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())) {
      var e = new Error("Formato de correo inválido.");
      e.code = "VALIDATION_ERROR";
      throw e;
    }
  },

  domain: function (email, domain) {
    var allowed = domain || Config.allowedDomain();
    var d = String(email || "").toLowerCase().split("@")[1] || "";
    if (d !== allowed) {
      var e = new Error("Acceso permitido únicamente para cuentas institucionales UPES (@" + allowed + ").");
      e.code = "DOMAIN_INVALID";
      throw e;
    }
  },

  minLength: function (value, min, label) {
    if (!value || String(value).length < min) {
      var e = new Error((label || "El campo") + " debe tener al menos " + min + " caracteres.");
      e.code = "VALIDATION_ERROR";
      throw e;
    }
  },

  maxLength: function (value, max, label) {
    if (value && String(value).length > max) {
      var e = new Error((label || "El campo") + " no puede superar " + max + " caracteres.");
      e.code = "VALIDATION_ERROR";
      throw e;
    }
  },

  oneOf: function (value, allowed, label) {
    if (!allowed || allowed.indexOf(value) === -1) {
      var e = new Error((label || "Valor") + " inválido. Opciones: " + (allowed || []).join(", ") + ".");
      e.code = "VALIDATION_ERROR";
      throw e;
    }
  },

  notEmpty: function (value, label) {
    if (!value || String(value).trim() === "") {
      var e = new Error((label || "El campo") + " no puede estar vacío.");
      e.code = "VALIDATION_ERROR";
      throw e;
    }
  },
};
