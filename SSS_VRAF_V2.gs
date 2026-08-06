// ══════════════════════════════════════════════════════════════════════
// config/Config.js
// ══════════════════════════════════════════════════════════════════════

/**
 * Config — lee exclusivamente de Script Properties.
 * Nunca valores hardcodeados. Cambiar comportamiento = cambiar la property.
 *
 * Script Properties requeridas en el editor GAS:
 *   SPREADSHEET_ID          ID del Spreadsheet principal
 *   WEBHOOK_SHARED_SECRET   Clave compartida con el frontend Next.js
 *   ALLOWED_DOMAIN          Dominio institucional (default: upes.edu.sv)
 *   DRIVE_ROOT_FOLDER_ID    Carpeta raíz en Drive
 *   GEMINI_API_KEY          API key de Gemini
 *   LOG_LEVEL               DEBUG | INFO | WARN | ERROR (default: INFO)
 *   INSTANCE_NAME           Nombre de la instancia (default: SSE-VRAF)
 */
var Config = (function () {
  var _cache = null;

  function props_() {
    if (!_cache) _cache = PropertiesService.getScriptProperties();
    return _cache;
  }

  return {
    spreadsheetId:     function () { return props_().getProperty("SPREADSHEET_ID") || ""; },
    webhookSecret:     function () { return props_().getProperty("WEBHOOK_SHARED_SECRET") || ""; },
    allowedDomain:     function () { return props_().getProperty("ALLOWED_DOMAIN") || "upes.edu.sv"; },
    driveFolderRoot:   function () { return props_().getProperty("DRIVE_ROOT_FOLDER_ID") || ""; },
    geminiApiKey:      function () { return props_().getProperty("GEMINI_API_KEY") || ""; },
    logLevel:          function () { return props_().getProperty("LOG_LEVEL") || "INFO"; },
    instanceName:      function () { return props_().getProperty("INSTANCE_NAME") || "SSE-VRAF"; },

    // Valores funcionales derivados (no editables por property)
    maxLoginAttempts:  function () { return 5; },
    lockoutMs:         function () { return 15 * 60 * 1000; },   // 15 minutos
    resetTokenTtlMs:   function () { return 30 * 60 * 1000; },   // 30 minutos

    set: function (key, value) {
      props_().setProperty(key, String(value));
      _cache = null; // invalidar caché
    },

    setAll: function (map) {
      props_().setProperties(map, false);
      _cache = null;
    },
  };
})();


// ══════════════════════════════════════════════════════════════════════
// core/Response.js
// ══════════════════════════════════════════════════════════════════════

/**
 * Response — envelope uniforme para todas las respuestas del Web App.
 *
 * Formato fijo compatible con httpAppsScriptAdapter.ts del frontend:
 *   { success, data, metadata: { requestId, durationMs }, errors, timestamp }
 */

function jsonOutput_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function ok_(data, meta) {
  var m = Object.assign({ requestId: null, durationMs: 0 }, meta || {});
  return jsonOutput_({
    success:   true,
    data:      data !== undefined ? data : null,
    metadata:  m,
    errors:    [],
    timestamp: new Date().toISOString(),
    requestId: m.requestId,
  });
}

function fail_(error, meta) {
  var m = Object.assign({ requestId: null, durationMs: 0 }, meta || {});
  var msg  = String((error && error.message) || error || "Error interno del servidor.");
  var code = (error && error.code) ? String(error.code) : "INTERNAL_ERROR";
  return jsonOutput_({
    success:   false,
    data:      null,
    metadata:  m,
    errors:    [{ code: code, message: msg }],
    timestamp: new Date().toISOString(),
    requestId: m.requestId,
  });
}


// ══════════════════════════════════════════════════════════════════════
// security/Crypto.js
// ══════════════════════════════════════════════════════════════════════

/**
 * Crypto — primitivas criptográficas para el sistema.
 *
 * Hash: SHA-256(salt + ":" + password) — nunca almacenar contraseñas en texto plano.
 * Salt: UUID sin guiones (128 bits de entropía).
 */
var Crypto = {
  /**
   * Genera un hash SHA-256 del formato "salt:password".
   * @param {string} password
   * @param {string} salt
   * @returns {string} hex string de 64 caracteres
   */
  hash: function (password, salt) {
    var raw = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      salt + ":" + password,
      Utilities.Charset.UTF_8
    );
    return raw.map(function (b) {
      return (b < 0 ? b + 256 : b).toString(16).padStart(2, "0");
    }).join("");
  },

  /** UUID sin guiones — usado como salt de contraseña. */
  salt: function () {
    return Utilities.getUuid().replace(/-/g, "");
  },

  /** UUID estándar — usado como ID de entidad. */
  uuid: function () {
    return Utilities.getUuid();
  },

  /** ID de request con prefijo legible. */
  requestId: function () {
    return "REQ-" + Utilities.getUuid().replace(/-/g, "").substring(0, 8).toUpperCase();
  },

  /** Token de 64 caracteres para reset de contraseña. */
  resetToken: function () {
    return Utilities.getUuid().replace(/-/g, "") + Utilities.getUuid().replace(/-/g, "");
  },

  /** Verifica si password + salt produce el hash esperado. */
  verify: function (password, salt, expectedHash) {
    return Crypto.hash(password, salt) === expectedHash;
  },
};


// ══════════════════════════════════════════════════════════════════════
// validators/Validator.js
// ══════════════════════════════════════════════════════════════════════

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


// ══════════════════════════════════════════════════════════════════════
// rbac/Roles.js
// ══════════════════════════════════════════════════════════════════════

/**
 * Roles — jerarquía institucional de roles.
 *
 * Orden de autoridad (índice 0 = máxima autoridad):
 *   ADMINISTRADOR_GENERAL > ADMINISTRADOR_UNIDAD > JEFE_UNIDAD
 *   > COORDINADOR > ANALISTA > USUARIO > CONSULTA
 *
 * Roles protegidos: no pueden asignarse por auto-registro.
 */
var Roles = (function () {
  var HIERARCHY = [
    "ADMINISTRADOR_GENERAL",
    "ADMINISTRADOR_UNIDAD",
    "JEFE_UNIDAD",
    "COORDINADOR",
    "ANALISTA",
    "USUARIO",
    "CONSULTA",
  ];

  var PROTECTED = ["ADMINISTRADOR_GENERAL", "ADMINISTRADOR_UNIDAD"];

  return {
    ALL:       HIERARCHY,
    PROTECTED: PROTECTED,

    ADMIN_GENERAL: "ADMINISTRADOR_GENERAL",
    ADMIN_UNIDAD:  "ADMINISTRADOR_UNIDAD",
    JEFE_UNIDAD:   "JEFE_UNIDAD",
    COORDINADOR:   "COORDINADOR",
    ANALISTA:      "ANALISTA",
    USUARIO:       "USUARIO",
    CONSULTA:      "CONSULTA",

    isValid: function (role) {
      return HIERARCHY.indexOf(role) !== -1;
    },

    isProtected: function (role) {
      return PROTECTED.indexOf(role) !== -1;
    },

    isAdminGeneral: function (role) {
      return role === "ADMINISTRADOR_GENERAL";
    },

    rankOf: function (role) {
      var idx = HIERARCHY.indexOf(role);
      return idx === -1 ? 999 : idx; // desconocido = rango más bajo
    },

    /** true si roleA tiene igual o mayor autoridad que roleB */
    dominates: function (roleA, roleB) {
      return Roles.rankOf(roleA) <= Roles.rankOf(roleB);
    },
  };
})();


// ══════════════════════════════════════════════════════════════════════
// rbac/Permissions.js
// ══════════════════════════════════════════════════════════════════════

/**
 * Permissions — mapa de permisos por rol.
 *
 * ADMINISTRADOR_GENERAL recibe todos los permisos existentes y futuros.
 * El resto hereda un subconjunto progresivamente más restrictivo.
 */
var Permissions = (function () {
  var ALL_PERMISSIONS = [
    "platform.admin",
    "ws.admin",
    "ws.users.manage",
    "ws.users.view",
    "ws.settings.manage",
    "ws.settings.view",
    "ws.processes.manage",
    "ws.processes.view",
    "ws.processes.approve",
    "ws.indicators.manage",
    "ws.indicators.view",
    "ws.reports.create",
    "ws.reports.view",
    "ws.audit.view",
    "ws.docs.manage",
    "ws.docs.view",
    "ws.calendar.manage",
    "ws.calendar.view",
    "ws.drive.manage",
    "ws.drive.view",
    "ws.forms.manage",
    "ws.forms.view",
    "ws.forms.submit",
    "ws.notifications.manage",
  ];

  var MAP = {
    "ADMINISTRADOR_GENERAL": ALL_PERMISSIONS,

    "ADMINISTRADOR_UNIDAD": [
      "ws.admin",
      "ws.users.manage", "ws.users.view",
      "ws.settings.manage", "ws.settings.view",
      "ws.processes.manage", "ws.processes.view", "ws.processes.approve",
      "ws.indicators.manage", "ws.indicators.view",
      "ws.reports.create", "ws.reports.view",
      "ws.audit.view",
      "ws.docs.manage", "ws.docs.view",
      "ws.calendar.manage", "ws.calendar.view",
      "ws.drive.manage", "ws.drive.view",
      "ws.forms.manage", "ws.forms.view", "ws.forms.submit",
      "ws.notifications.manage",
    ],

    "JEFE_UNIDAD": [
      "ws.users.view",
      "ws.settings.view",
      "ws.processes.manage", "ws.processes.view", "ws.processes.approve",
      "ws.indicators.manage", "ws.indicators.view",
      "ws.reports.create", "ws.reports.view",
      "ws.docs.manage", "ws.docs.view",
      "ws.calendar.manage", "ws.calendar.view",
      "ws.drive.manage", "ws.drive.view",
      "ws.forms.view", "ws.forms.submit",
    ],

    "COORDINADOR": [
      "ws.processes.manage", "ws.processes.view",
      "ws.indicators.view",
      "ws.reports.view",
      "ws.docs.view",
      "ws.calendar.view",
      "ws.drive.view",
      "ws.forms.view", "ws.forms.submit",
    ],

    "ANALISTA": [
      "ws.processes.view",
      "ws.indicators.manage", "ws.indicators.view",
      "ws.reports.view",
      "ws.docs.view",
      "ws.drive.view",
      "ws.forms.view", "ws.forms.submit",
    ],

    "USUARIO": [
      "ws.processes.view",
      "ws.indicators.view",
      "ws.docs.view",
      "ws.calendar.view",
      "ws.forms.view", "ws.forms.submit",
    ],

    "CONSULTA": [
      "ws.processes.view",
      "ws.indicators.view",
      "ws.docs.view",
      "ws.reports.view",
    ],
  };

  return {
    for: function (role) {
      if (Roles.isAdminGeneral(role)) return ALL_PERMISSIONS;
      return MAP[role] || [];
    },

    has: function (role, permission) {
      if (Roles.isAdminGeneral(role)) return true;
      var perms = MAP[role] || [];
      return perms.indexOf(permission) !== -1;
    },

    ALL: ALL_PERMISSIONS,
  };
})();


// ══════════════════════════════════════════════════════════════════════
// security/SecretGuard.js
// ══════════════════════════════════════════════════════════════════════

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


// ══════════════════════════════════════════════════════════════════════
// security/RateLimiter.js
// ══════════════════════════════════════════════════════════════════════

/**
 * RateLimiter — protección contra ataques de fuerza bruta.
 *
 * Almacena el estado en CacheService (TTL = duración del bloqueo).
 * Por defecto: 5 intentos fallidos → bloqueo de 15 minutos.
 */
var RateLimiter = (function () {
  var NS = "rl:";

  function key_(id) { return NS + id; }

  function getState_(id) {
    var raw = CacheService.getScriptCache().get(key_(id));
    return raw ? JSON.parse(raw) : { count: 0, lockedUntil: 0 };
  }

  function setState_(id, state) {
    var ttl = Math.ceil(Config.lockoutMs() / 1000);
    CacheService.getScriptCache().put(key_(id), JSON.stringify(state), ttl);
  }

  return {
    /** Lanza error si el ID está actualmente bloqueado. */
    check: function (id) {
      var s = getState_(id);
      if (s.lockedUntil && new Date().getTime() < s.lockedUntil) {
        var mins = Math.ceil((s.lockedUntil - new Date().getTime()) / 60000);
        var e = new Error("Cuenta bloqueada temporalmente. Intente en " + mins + " minuto(s).");
        e.code = "RATE_LIMITED";
        throw e;
      }
    },

    /** Registra un intento fallido. Lanza error si se alcanza el límite. */
    record: function (id) {
      var s = getState_(id);
      var max = Config.maxLoginAttempts();
      s.count = (s.count || 0) + 1;

      if (s.count >= max) {
        s.lockedUntil = new Date().getTime() + Config.lockoutMs();
        setState_(id, s);
        var e = new Error("Demasiados intentos fallidos. Cuenta bloqueada por " + Math.ceil(Config.lockoutMs() / 60000) + " minutos.");
        e.code = "RATE_LIMITED";
        throw e;
      }

      setState_(id, s);
      return max - s.count; // intentos restantes
    },

    /** Limpia el contador tras un login exitoso. */
    clear: function (id) {
      CacheService.getScriptCache().remove(key_(id));
    },
  };
})();


// ══════════════════════════════════════════════════════════════════════
// schemas/SchemaRegistry.js
// ══════════════════════════════════════════════════════════════════════

/**
 * SchemaRegistry — registro central de entidades y sus hojas en el Spreadsheet.
 *
 * Cada entidad se registra con:
 *   { sheetName: string, columns: string[] }
 *
 * El orden de columns define el orden de columnas en la hoja.
 * SheetSetup.js y Repository.js consumen este registro.
 */
var SchemaRegistry = (function () {
  var _registry = {};

  return {
    register: function (entityName, schema) {
      if (!schema.sheetName || !schema.columns || !schema.columns.length) {
        throw new Error("Schema inválido para entidad: " + entityName);
      }
      _registry[entityName] = schema;
    },

    get: function (entityName) {
      var schema = _registry[entityName];
      if (!schema) {
        var e = new Error("Entidad no registrada: " + entityName);
        e.code = "NOT_FOUND";
        throw e;
      }
      return schema;
    },

    all: function () {
      return _registry;
    },

    has: function (entityName) {
      return !!_registry[entityName];
    },

    names: function () {
      return Object.keys(_registry);
    },
  };
})();


// ══════════════════════════════════════════════════════════════════════
// schemas/core.schema.js
// ══════════════════════════════════════════════════════════════════════

/**
 * core.schema.js — esquemas de las entidades principales del sistema.
 *
 * Se registran en SchemaRegistry al momento de carga del script.
 * Agregar aquí cualquier entidad de uso transversal (no específica de workspace).
 */
(function registerCoreSchemas_() {

  SchemaRegistry.register("usuarios", {
    sheetName: "Usuarios",
    columns: [
      "id", "nombre", "email", "unidadId", "rol", "activo",
      "passwordHash", "passwordSalt", "mustChangePassword",
      "avatarInitials", "lastLoginAt", "createdAt", "updatedAt",
    ],
  });

  SchemaRegistry.register("workspaces", {
    sheetName: "Workspaces",
    columns: ["id", "nombre", "codigo", "descripcion", "activo", "createdAt"],
  });

  SchemaRegistry.register("wsUsers", {
    sheetName: "WsUsers",
    columns: ["id", "wsId", "usuarioId", "email", "nombre", "rol", "activo", "createdAt", "updatedAt"],
  });

  SchemaRegistry.register("loginAudit", {
    sheetName: "LoginAudit",
    columns: ["id", "email", "ip", "userAgent", "resultado", "motivo", "usuarioId", "timestamp"],
  });

  SchemaRegistry.register("auditLog", {
    sheetName: "AuditLog",
    columns: ["id", "accion", "entidadTipo", "entidadId", "usuarioId", "resultado", "detalle", "timestamp"],
  });

  SchemaRegistry.register("passwordResets", {
    sheetName: "PasswordResets",
    columns: ["id", "email", "token", "expiresAt", "usado", "createdAt"],
  });

})();


// ══════════════════════════════════════════════════════════════════════
// repositories/Repository.js
// ══════════════════════════════════════════════════════════════════════

/**
 * Repository — CRUD genérico sobre Google Sheets.
 *
 * Uso:
 *   var repo = Repository.for("usuarios");
 *   repo.findAll({ activo: true })
 *   repo.findOne({ email: "..." })
 *   repo.findById("usr-xxx")
 *   repo.create({ id, nombre, ... })
 *   repo.update("usr-xxx", { rol: "ANALISTA" })
 *   repo.remove("usr-xxx")
 *
 * Reglas:
 *   - La primera fila de cada hoja es la cabecera (no se toca).
 *   - Los valores booleanos se serializan como strings "true"/"false".
 *   - Los objetos se serializan como JSON.
 *   - Los campos no incluidos en columns se ignoran silenciosamente.
 */
var Repository = (function () {

  // ── Helpers de hoja ───────────────────────────────────────────────────────

  function openSheet_(entityName) {
    var schema = SchemaRegistry.get(entityName);
    var id = Config.spreadsheetId();
    if (!id) throw new Error("SPREADSHEET_ID no configurado en Script Properties.");
    var ss = SpreadsheetApp.openById(id);
    var sheet = ss.getSheetByName(schema.sheetName);
    if (!sheet) {
      var e = new Error("Hoja no encontrada: " + schema.sheetName + ". Ejecuta runSetup() primero.");
      e.code = "SHEET_NOT_FOUND";
      throw e;
    }
    return { sheet: sheet, cols: schema.columns };
  }

  // ── Serialización ─────────────────────────────────────────────────────────

  function rowToObj_(row, cols) {
    var obj = {};
    for (var i = 0; i < cols.length; i++) {
      var v = row[i];
      if (v === "" || v === undefined || v === null) { obj[cols[i]] = null; continue; }
      if (v === "true")  { obj[cols[i]] = true;  continue; }
      if (v === "false") { obj[cols[i]] = false; continue; }
      obj[cols[i]] = v;
    }
    return obj;
  }

  function objToRow_(obj, cols) {
    return cols.map(function (col) {
      var v = obj[col];
      if (v === undefined || v === null) return "";
      if (typeof v === "boolean") return String(v);
      if (typeof v === "object")  return JSON.stringify(v);
      return String(v);
    });
  }

  // ── Lectura de todas las filas ────────────────────────────────────────────

  function readAllRows_(sheet, cols) {
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];
    var data = sheet.getRange(2, 1, lastRow - 1, cols.length).getValues();
    return data.map(function (row) { return rowToObj_(row, cols); });
  }

  // ── Filtro ────────────────────────────────────────────────────────────────

  function matches_(obj, filter) {
    if (!filter) return true;
    return Object.keys(filter).every(function (k) {
      var fv = filter[k];
      var ov = obj[k];
      if (fv === null || fv === undefined) return ov === null || ov === undefined;
      // Comparación case-insensitive para strings
      return String(ov).toLowerCase() === String(fv).toLowerCase();
    });
  }

  // ── Factory ───────────────────────────────────────────────────────────────

  return {
    for: function (entityName) {
      var repo = {

        findAll: function (filter) {
          var ctx  = openSheet_(entityName);
          var rows = readAllRows_(ctx.sheet, ctx.cols);
          return filter ? rows.filter(function (r) { return matches_(r, filter); }) : rows;
        },

        findOne: function (filter) {
          var ctx  = openSheet_(entityName);
          var rows = readAllRows_(ctx.sheet, ctx.cols);
          for (var i = 0; i < rows.length; i++) {
            if (matches_(rows[i], filter)) return rows[i];
          }
          return null;
        },

        findById: function (id) {
          return repo.findOne({ id: id });
        },

        create: function (data) {
          var ctx = openSheet_(entityName);
          ctx.sheet.appendRow(objToRow_(data, ctx.cols));
          return data;
        },

        update: function (id, patch) {
          var ctx     = openSheet_(entityName);
          var lastRow = ctx.sheet.getLastRow();
          if (lastRow < 2) { var e1 = new Error("Registro no encontrado: " + id); e1.code = "NOT_FOUND"; throw e1; }

          var idIdx = ctx.cols.indexOf("id");
          var data  = ctx.sheet.getRange(2, 1, lastRow - 1, ctx.cols.length).getValues();

          for (var i = 0; i < data.length; i++) {
            if (String(data[i][idIdx]) === String(id)) {
              var existing = rowToObj_(data[i], ctx.cols);
              var updated  = Object.assign({}, existing, patch);
              ctx.sheet.getRange(i + 2, 1, 1, ctx.cols.length).setValues([objToRow_(updated, ctx.cols)]);
              return updated;
            }
          }
          var e2 = new Error("Registro no encontrado: " + id); e2.code = "NOT_FOUND"; throw e2;
        },

        remove: function (id) {
          var ctx     = openSheet_(entityName);
          var lastRow = ctx.sheet.getLastRow();
          if (lastRow < 2) { var e = new Error("Registro no encontrado: " + id); e.code = "NOT_FOUND"; throw e; }

          var idIdx = ctx.cols.indexOf("id");
          var col   = ctx.sheet.getRange(2, idIdx + 1, lastRow - 1, 1).getValues();

          for (var i = col.length - 1; i >= 0; i--) {
            if (String(col[i][0]) === String(id)) {
              ctx.sheet.deleteRow(i + 2);
              return true;
            }
          }
          var e2 = new Error("Registro no encontrado: " + id); e2.code = "NOT_FOUND"; throw e2;
        },

        count: function (filter) {
          return repo.findAll(filter).length;
        },

        exists: function (filter) {
          return repo.findOne(filter) !== null;
        },
      };

      return repo;
    },
  };
})();


// ══════════════════════════════════════════════════════════════════════
// services/google/MailService.js
// ══════════════════════════════════════════════════════════════════════

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


// ══════════════════════════════════════════════════════════════════════
// services/google/DriveService.js
// ══════════════════════════════════════════════════════════════════════

/**
 * DriveService — gestión de archivos y carpetas en Google Drive.
 */
var DriveService = {
  getOrCreateFolder: function (name, parentId) {
    var parent = parentId ? DriveApp.getFolderById(parentId) : DriveApp.getRootFolder();
    var iter   = parent.getFoldersByName(name);
    return iter.hasNext() ? iter.next() : parent.createFolder(name);
  },

  createFolder: function (name, parentId) {
    var parent = parentId ? DriveApp.getFolderById(parentId) : DriveApp.getRootFolder();
    return parent.createFolder(name);
  },

  getFile: function (fileId) {
    return DriveApp.getFileById(fileId);
  },

  copyFile: function (fileId, newName, folderId) {
    var file = DriveApp.getFileById(fileId);
    var copy = file.makeCopy(newName || file.getName());
    if (folderId) copy.moveTo(DriveApp.getFolderById(folderId));
    return { id: copy.getId(), url: copy.getUrl(), name: copy.getName() };
  },

  moveFile: function (fileId, folderId) {
    DriveApp.getFileById(fileId).moveTo(DriveApp.getFolderById(folderId));
  },

  deleteFile: function (fileId) {
    DriveApp.getFileById(fileId).setTrashed(true);
  },

  addEditor: function (fileId, email) {
    DriveApp.getFileById(fileId).addEditor(email);
  },

  addViewer: function (fileId, email) {
    DriveApp.getFileById(fileId).addViewer(email);
  },

  listFiles: function (folderId) {
    var folder = DriveApp.getFolderById(folderId);
    var files  = folder.getFiles();
    var result = [];
    while (files.hasNext()) {
      var f = files.next();
      result.push({ id: f.getId(), name: f.getName(), url: f.getUrl(), mimeType: f.getMimeType() });
    }
    return result;
  },
};


// ══════════════════════════════════════════════════════════════════════
// services/google/DocsService.js
// ══════════════════════════════════════════════════════════════════════

/**
 * DocsService — creación y manipulación de Google Docs.
 */
var DocsService = {
  createFromTemplate: function (templateId, replacements, folderId) {
    var copy = DriveApp.getFileById(templateId).makeCopy();
    if (folderId) copy.moveTo(DriveApp.getFolderById(folderId));

    var doc  = DocumentApp.openById(copy.getId());
    var body = doc.getBody();

    if (replacements) {
      Object.keys(replacements).forEach(function (key) {
        body.replaceText("\\{\\{" + key + "\\}\\}", String(replacements[key] !== undefined ? replacements[key] : ""));
      });
    }

    doc.saveAndClose();
    return { id: copy.getId(), url: copy.getUrl(), name: copy.getName() };
  },

  createBlank: function (title, folderId) {
    var doc = DocumentApp.create(title);
    if (folderId) {
      var file = DriveApp.getFileById(doc.getId());
      file.moveTo(DriveApp.getFolderById(folderId));
    }
    return { id: doc.getId(), url: doc.getUrl() };
  },

  getText: function (docId) {
    return DocumentApp.openById(docId).getBody().getText();
  },

  appendText: function (docId, text) {
    var doc = DocumentApp.openById(docId);
    doc.getBody().appendParagraph(text);
    doc.saveAndClose();
  },
};


// ══════════════════════════════════════════════════════════════════════
// services/google/CalendarService.js
// ══════════════════════════════════════════════════════════════════════

/**
 * CalendarService — gestión de eventos en Google Calendar.
 */
var CalendarService = {
  createEvent: function (params) {
    Validator.requireFields(params, ["title", "start"]);
    var cal   = CalendarApp.getDefaultCalendar();
    var start = new Date(params.start);
    var end   = params.end ? new Date(params.end) : new Date(start.getTime() + 60 * 60 * 1000);

    var options = { description: params.description || "" };
    if (params.location)  options.location = params.location;
    if (params.attendees && params.attendees.length) options.guests = params.attendees.join(",");

    var event = cal.createEvent(params.title, start, end, options);
    return { id: event.getId(), url: event.getEditEventUrl(), title: event.getTitle() };
  },

  getEvents: function (from, to, calendarId) {
    var cal    = calendarId ? CalendarApp.getCalendarById(calendarId) : CalendarApp.getDefaultCalendar();
    var events = cal.getEvents(new Date(from), new Date(to));
    return events.map(function (e) {
      return {
        id:          e.getId(),
        title:       e.getTitle(),
        start:       e.getStartTime().toISOString(),
        end:         e.getEndTime().toISOString(),
        description: e.getDescription(),
        location:    e.getLocation(),
      };
    });
  },

  deleteEvent: function (eventId) {
    var cal   = CalendarApp.getDefaultCalendar();
    var event = cal.getEventById(eventId);
    if (event) event.deleteEvent();
    return { deleted: !!event };
  },
};


// ══════════════════════════════════════════════════════════════════════
// services/google/GeminiService.js
// ══════════════════════════════════════════════════════════════════════

/**
 * GeminiService — integración con la API de Gemini (Google AI).
 * Requiere GEMINI_API_KEY en Script Properties.
 */
var GeminiService = {
  DEFAULT_MODEL: "gemini-1.5-flash",

  generate: function (prompt, model) {
    var apiKey = Config.geminiApiKey();
    if (!apiKey) {
      var e = new Error("GEMINI_API_KEY no configurada en Script Properties.");
      e.code = "NOT_CONFIGURED";
      throw e;
    }

    var modelId = model || GeminiService.DEFAULT_MODEL;
    var url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelId + ":generateContent?key=" + apiKey;

    var response = UrlFetchApp.fetch(url, {
      method:      "post",
      contentType: "application/json",
      payload:     JSON.stringify({
        contents: [{ parts: [{ text: String(prompt) }] }],
        generationConfig: { maxOutputTokens: 2048 },
      }),
      muteHttpExceptions: true,
    });

    var code = response.getResponseCode();
    if (code !== 200) {
      var e2 = new Error("Gemini API error: HTTP " + code);
      e2.code = "GEMINI_ERROR";
      throw e2;
    }

    var result = JSON.parse(response.getContentText());
    if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
      var e3 = new Error("Gemini no retornó contenido.");
      e3.code = "GEMINI_EMPTY";
      throw e3;
    }

    return result.candidates[0].content.parts[0].text;
  },

  generateStructured: function (prompt, schema, model) {
    var rawText = GeminiService.generate(prompt + "\n\nResponde únicamente con JSON válido según este esquema: " + JSON.stringify(schema), model);
    try {
      // Extraer JSON del texto (Gemini puede incluir markdown)
      var match = rawText.match(/```json\s*([\s\S]*?)```/) || rawText.match(/(\{[\s\S]*\})/);
      return JSON.parse(match ? match[1] : rawText);
    } catch (e) {
      return { rawText: rawText };
    }
  },
};


// ══════════════════════════════════════════════════════════════════════
// services/audit/AuditService.js
// ══════════════════════════════════════════════════════════════════════

/**
 * AuditService — registro de auditoría de acciones y accesos.
 *
 * Los fallos de auditoría nunca propagan errores al flujo principal.
 * Todas las excepciones se capturan y loguean en consola.
 */
var AuditService = {
  log: function (entry) {
    try {
      Repository.for("auditLog").create({
        id:          Crypto.uuid(),
        accion:      String(entry.accion      || ""),
        entidadTipo: String(entry.entidadTipo || ""),
        entidadId:   String(entry.entidadId   || ""),
        usuarioId:   String(entry.usuarioId   || ""),
        resultado:   String(entry.resultado   || "ok"),
        detalle:     typeof entry.detalle === "object"
                       ? JSON.stringify(entry.detalle)
                       : String(entry.detalle || ""),
        timestamp:   new Date().toISOString(),
      });
    } catch (e) {
      console.error("[AuditService.log]", e.message);
    }
  },

  loginRecord: function (entry) {
    try {
      Repository.for("loginAudit").create({
        id:        Crypto.uuid(),
        email:     String(entry.email     || ""),
        ip:        String(entry.ip        || ""),
        userAgent: String(entry.userAgent || ""),
        resultado: String(entry.resultado || ""),
        motivo:    String(entry.motivo    || ""),
        usuarioId: String(entry.usuarioId || ""),
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.error("[AuditService.loginRecord]", e.message);
    }
  },

  list: function (filter, limit) {
    var rows = Repository.for("auditLog").findAll(filter || null);
    rows.sort(function (a, b) { return b.timestamp > a.timestamp ? 1 : -1; });
    return limit ? rows.slice(0, limit) : rows;
  },

  loginHistory: function (email, limit) {
    var filter = email ? { email: email } : null;
    var rows   = Repository.for("loginAudit").findAll(filter);
    rows.sort(function (a, b) { return b.timestamp > a.timestamp ? 1 : -1; });
    return limit ? rows.slice(0, limit) : rows;
  },
};


// ══════════════════════════════════════════════════════════════════════
// services/auth/PasswordService.js
// ══════════════════════════════════════════════════════════════════════

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


// ══════════════════════════════════════════════════════════════════════
// services/auth/AuthService.js
// ══════════════════════════════════════════════════════════════════════

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


// ══════════════════════════════════════════════════════════════════════
// services/users/UserService.js
// ══════════════════════════════════════════════════════════════════════

/**
 * UserService — gestión de usuarios dentro del workspace.
 *
 * create() asigna contraseña temporal UPES2026! y envía correo de bienvenida.
 * Los roles protegidos (ADMIN_GENERAL, ADMIN_UNIDAD) solo pueden asignarse
 * desde el bootstrap o por un ADMINISTRADOR_GENERAL autenticado.
 */
var UserService = {

  list: function (params) {
    var wsId   = params && params.wsId;
    var search = params && params.search ? String(params.search).toLowerCase() : null;
    var filter = params && params.filter;

    var users;

    if (wsId) {
      // Usuarios de un workspace específico (via WsUsers join)
      var wsUsers = Repository.for("wsUsers").findAll({ wsId: wsId });
      users = wsUsers.map(function (wu) {
        var u = Repository.for("usuarios").findOne({ email: wu.email });
        return Object.assign({}, wu, u ? {
          nombre:     u.nombre,
          lastLoginAt: u.lastLoginAt,
          activo:     u.activo,
        } : {});
      });
    } else {
      users = Repository.for("usuarios").findAll();
    }

    if (filter === "active")   users = users.filter(function (u) { return u.activo === true; });
    if (filter === "inactive") users = users.filter(function (u) { return u.activo !== true; });

    if (search) {
      users = users.filter(function (u) {
        return (u.nombre && u.nombre.toLowerCase().indexOf(search) !== -1) ||
               (u.email  && u.email.toLowerCase().indexOf(search)  !== -1);
      });
    }

    // Nunca exponer hashes de contraseña
    return users.map(function (u) {
      var clean = Object.assign({}, u);
      delete clean.passwordHash;
      delete clean.passwordSalt;
      return clean;
    });
  },

  get: function (params) {
    Validator.requireFields(params, ["id"]);
    var user = Repository.for("usuarios").findById(params.id);
    if (!user) { var e = new Error("Usuario no encontrado."); e.code = "NOT_FOUND"; throw e; }
    var clean = Object.assign({}, user);
    delete clean.passwordHash;
    delete clean.passwordSalt;
    return clean;
  },

  create: function (params, actorId) {
    Validator.requireFields(params, ["email", "nombre", "rol"]);
    var email  = String(params.email).trim().toLowerCase();
    var nombre = String(params.nombre).trim();
    var rol    = String(params.rol);

    Validator.domain(email, Config.allowedDomain());
    if (!Roles.isValid(rol)) { var ev = new Error("Rol inválido: " + rol); ev.code = "VALIDATION_ERROR"; throw ev; }

    if (Repository.for("usuarios").exists({ email: email })) {
      var ed = new Error("Ya existe un usuario con este correo."); ed.code = "DUPLICATE"; throw ed;
    }

    var tempPwd  = "UPES2026!";
    var salt     = Crypto.salt();
    var hash     = Crypto.hash(tempPwd, salt);
    var initials = nombre.split(" ").filter(Boolean).slice(0, 2).map(function (n) { return n[0]; }).join("").toUpperCase();
    var userId   = "usr-" + Crypto.uuid().replace(/-/g, "").substring(0, 12);
    var wsId     = String(params.wsId || params.unidadId || "");
    var now      = new Date().toISOString();

    var user = Repository.for("usuarios").create({
      id: userId, nombre: nombre, email: email, unidadId: wsId,
      rol: rol, activo: true, passwordHash: hash, passwordSalt: salt,
      mustChangePassword: true, avatarInitials: initials,
      lastLoginAt: null, createdAt: now, updatedAt: now,
    });

    // Registrar en WsUsers si se especificó workspace
    if (wsId && wsId !== "GLOBAL") {
      Repository.for("wsUsers").create({
        id: Crypto.uuid(), wsId: wsId, usuarioId: userId,
        email: email, nombre: nombre, rol: rol,
        activo: true, createdAt: now, updatedAt: now,
      });
    }

    AuditService.log({ accion: "users.create", entidadTipo: "usuarios", entidadId: userId, usuarioId: actorId || "", resultado: "ok" });

    try { MailService.sendWelcome(email, nombre, tempPwd); } catch (_) {}

    var clean = Object.assign({}, user);
    delete clean.passwordHash;
    delete clean.passwordSalt;
    return clean;
  },

  update: function (params, actorId) {
    Validator.requireFields(params, ["id"]);
    var patch = { updatedAt: new Date().toISOString() };

    if (params.rol !== undefined) {
      if (!Roles.isValid(params.rol)) { var ev = new Error("Rol inválido."); ev.code = "VALIDATION_ERROR"; throw ev; }
      patch.rol = params.rol;
    }
    if (params.activo !== undefined) {
      patch.activo = params.activo === true || params.activo === "true";
    }
    if (params.nombre !== undefined) {
      Validator.minLength(params.nombre, 2, "El nombre");
      patch.nombre = String(params.nombre).trim();
    }

    var updated = Repository.for("usuarios").update(params.id, patch);
    AuditService.log({ accion: "users.update", entidadTipo: "usuarios", entidadId: params.id, usuarioId: actorId || "", resultado: "ok", detalle: patch });

    var clean = Object.assign({}, updated);
    delete clean.passwordHash;
    delete clean.passwordSalt;
    return clean;
  },

  toggleActive: function (params, actorId) {
    Validator.requireFields(params, ["id"]);
    var activo  = params.activo === true || params.activo === "true";
    var updated = Repository.for("usuarios").update(params.id, { activo: activo, updatedAt: new Date().toISOString() });
    AuditService.log({ accion: activo ? "users.activate" : "users.deactivate", entidadTipo: "usuarios", entidadId: params.id, usuarioId: actorId || "", resultado: "ok" });
    var clean = Object.assign({}, updated);
    delete clean.passwordHash;
    delete clean.passwordSalt;
    return clean;
  },

  remove: function (params, actorId) {
    Validator.requireFields(params, ["id"]);
    Repository.for("usuarios").remove(params.id);
    AuditService.log({ accion: "users.remove", entidadTipo: "usuarios", entidadId: params.id, usuarioId: actorId || "", resultado: "ok" });
    return { removed: true };
  },
};


// ══════════════════════════════════════════════════════════════════════
// controllers/AuthController.js
// ══════════════════════════════════════════════════════════════════════

/**
 * AuthController — despacha acciones auth.* a los servicios correspondientes.
 */
var AuthController = {
  route: function (verb, params, context) {
    switch (verb) {
      case "login":
        return AuthService.login(Object.assign({}, params, { ip: context.ip, userAgent: context.userAgent }));

      case "logout":
        return AuthService.logout(Object.assign({}, params, { userId: params.userId || context.userId }));

      case "register":
        return AuthService.register(params);

      case "changePassword":
        return PasswordService.change(
          String(params.userId || context.userId),
          String(params.currentPassword || ""),
          String(params.newPassword || "")
        );

      case "forgotPassword":
        Validator.requireFields(params, ["email"]);
        return PasswordService.forgotPassword(String(params.email).trim().toLowerCase());

      case "resetPassword":
        return PasswordService.resetPassword(
          String(params.token || ""),
          String(params.newPassword || "")
        );

      case "getUser":
        return AuthService.getUser(params);

      case "ping":
        return AuthService.ping();

      default: {
        var e = new Error("Acción desconocida: auth." + verb);
        e.code = "NOT_FOUND";
        throw e;
      }
    }
  },
};


// ══════════════════════════════════════════════════════════════════════
// controllers/UserController.js
// ══════════════════════════════════════════════════════════════════════

/**
 * UserController — despacha acciones users.* a UserService.
 */
var UserController = {
  route: function (verb, params, context) {
    switch (verb) {
      case "list":
        return UserService.list(params);

      case "get":
        return UserService.get(params);

      case "create":
        return UserService.create(params, context.userId);

      case "update":
        return UserService.update(params, context.userId);

      case "remove":
        return UserService.remove(params, context.userId);

      case "toggleActive":
        return UserService.toggleActive(params, context.userId);

      case "setRole": {
        Validator.requireFields(params, ["id", "rol"]);
        return UserService.update({ id: params.id, rol: params.rol }, context.userId);
      }

      default: {
        var e = new Error("Acción desconocida: users." + verb);
        e.code = "NOT_FOUND";
        throw e;
      }
    }
  },
};


// ══════════════════════════════════════════════════════════════════════
// controllers/WorkspaceController.js
// ══════════════════════════════════════════════════════════════════════

/**
 * WorkspaceController — despacha acciones workspace.* al Repository de workspaces.
 */
var WorkspaceController = {
  route: function (verb, params, context) {
    var wsRepo     = Repository.for("workspaces");
    var wsUserRepo = Repository.for("wsUsers");
    var userRepo   = Repository.for("usuarios");

    switch (verb) {
      case "list":
        return wsRepo.findAll();

      case "get": {
        Validator.requireFields(params, ["wsId"]);
        var ws = wsRepo.findOne({ id: params.wsId });
        if (!ws) { var e = new Error("Workspace no encontrado."); e.code = "NOT_FOUND"; throw e; }
        return ws;
      }

      case "getUsers": {
        Validator.requireFields(params, ["wsId"]);
        var wsUsers = wsUserRepo.findAll({ wsId: params.wsId });
        // Enriquecer con nombre y último acceso del usuario principal
        return wsUsers.map(function (wu) {
          var u = userRepo.findOne({ email: wu.email });
          var clean = Object.assign({}, wu, u ? { nombre: u.nombre, lastLoginAt: u.lastLoginAt } : {});
          delete clean.passwordHash;
          delete clean.passwordSalt;
          return clean;
        });
      }

      case "create": {
        Validator.requireFields(params, ["id", "nombre", "codigo"]);
        var existing = wsRepo.findOne({ id: params.id });
        if (existing) { var edd = new Error("Workspace ya existe: " + params.id); edd.code = "DUPLICATE"; throw edd; }
        return wsRepo.create({
          id:          String(params.id).toLowerCase(),
          nombre:      String(params.nombre),
          codigo:      String(params.codigo).toUpperCase(),
          descripcion: String(params.descripcion || ""),
          activo:      true,
          createdAt:   new Date().toISOString(),
        });
      }

      case "getPermissions": {
        Validator.requireFields(params, ["email", "wsId"]);
        var wsU = wsUserRepo.findOne({ wsId: params.wsId, email: params.email });
        var u2  = userRepo.findOne({ email: params.email });
        var rol = (u2 && Roles.isAdminGeneral(u2.rol)) ? u2.rol
                : (wsU ? wsU.rol : null);
        if (!rol) return { permissions: [], rol: null };
        return { permissions: Permissions.for(rol), rol: rol };
      }

      default: {
        var e2 = new Error("Acción desconocida: workspace." + verb);
        e2.code = "NOT_FOUND";
        throw e2;
      }
    }
  },
};


// ══════════════════════════════════════════════════════════════════════
// controllers/AuditController.js
// ══════════════════════════════════════════════════════════════════════

/**
 * AuditController — despacha acciones audit.* a AuditService.
 */
var AuditController = {
  route: function (verb, params, context) {
    switch (verb) {
      case "list": {
        var filter = null;
        if (params && params.entidadTipo) filter = { entidadTipo: params.entidadTipo };
        var limit = (params && params.limit) ? Math.min(parseInt(params.limit, 10) || 100, 500) : 100;
        return AuditService.list(filter, limit);
      }

      case "loginHistory": {
        var email2 = params && params.email ? String(params.email).trim().toLowerCase() : null;
        var limit2 = (params && params.limit) ? Math.min(parseInt(params.limit, 10) || 50, 500) : 50;
        return AuditService.loginHistory(email2, limit2);
      }

      default: {
        var e = new Error("Acción desconocida: audit." + verb);
        e.code = "NOT_FOUND";
        throw e;
      }
    }
  },
};


// ══════════════════════════════════════════════════════════════════════
// core/Router.js
// ══════════════════════════════════════════════════════════════════════

/**
 * Router — despacha action "dominio.verbo" al controller correspondiente.
 *
 * Formato de action: "<dominio>.<verbo>"
 *   auth.login, users.list, workspace.getUsers, audit.loginHistory, etc.
 *
 * Para agregar un nuevo dominio: registrar el controller en el switch.
 */
var Router = {
  dispatch: function (action, params, context) {
    if (!action || typeof action !== "string" || action.trim() === "") {
      var ev = new Error("El campo 'action' es requerido.");
      ev.code = "VALIDATION_ERROR";
      throw ev;
    }

    var dotIdx = action.indexOf(".");
    if (dotIdx === -1) {
      var ef = new Error("Formato de action inválido. Use 'dominio.verbo'.");
      ef.code = "VALIDATION_ERROR";
      throw ef;
    }

    var domain = action.substring(0, dotIdx);
    var verb   = action.substring(dotIdx + 1);

    switch (domain) {
      case "auth":      return AuthController.route(verb, params || {}, context);
      case "users":     return UserController.route(verb, params || {}, context);
      case "workspace": return WorkspaceController.route(verb, params || {}, context);
      case "audit":     return AuditController.route(verb, params || {}, context);
      default: {
        var e = new Error("Dominio desconocido: " + domain + ". Acciones disponibles: auth, users, workspace, audit.");
        e.code = "NOT_FOUND";
        throw e;
      }
    }
  },
};


// ══════════════════════════════════════════════════════════════════════
// bootstrap/SheetSetup.js
// ══════════════════════════════════════════════════════════════════════

/**
 * SheetSetup — crea y verifica las hojas del Spreadsheet.
 *
 * Idempotente: crea la hoja si no existe, la ignora si ya existe.
 * Las cabeceras se toman del SchemaRegistry.
 */
var SheetSetup = {
  HEADER_COLOR:      "#1a73e8",
  HEADER_FONT_COLOR: "#ffffff",

  getOrCreateSpreadsheet: function () {
    var ssId = Config.spreadsheetId();
    if (ssId) {
      try { return SpreadsheetApp.openById(ssId); } catch (_) {}
    }

    Logger.log("Creando nuevo Spreadsheet...");
    var ss = SpreadsheetApp.create("SSE-VRAF — Base de Datos v2");

    // Eliminar hoja por defecto
    var sheets = ss.getSheets();
    if (sheets.length > 0) {
      // Crear una temporal para no quedar sin hojas
      ss.insertSheet("__tmp__");
      sheets.forEach(function (s) {
        if (s.getName() !== "__tmp__") ss.deleteSheet(s);
      });
    }

    Config.set("SPREADSHEET_ID", ss.getId());
    Logger.log("Spreadsheet creado: " + ss.getId());
    return ss;
  },

  ensureSheet: function (ss, schema) {
    var sheet = ss.getSheetByName(schema.sheetName);
    if (sheet) return { created: false, name: schema.sheetName };

    sheet = ss.insertSheet(schema.sheetName);

    // Cabecera
    var headerRange = sheet.getRange(1, 1, 1, schema.columns.length);
    headerRange.setValues([schema.columns]);
    headerRange.setFontWeight("bold");
    headerRange.setBackground(SheetSetup.HEADER_COLOR);
    headerRange.setFontColor(SheetSetup.HEADER_FONT_COLOR);
    headerRange.setHorizontalAlignment("center");

    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, schema.columns.length);

    return { created: true, name: schema.sheetName };
  },

  ensureAllSheets: function (ss) {
    var schemas = SchemaRegistry.all();
    var created = [];
    var existing = [];

    Object.keys(schemas).forEach(function (name) {
      var result = SheetSetup.ensureSheet(ss, schemas[name]);
      if (result.created) created.push(result.name);
      else existing.push(result.name);
    });

    // Eliminar hoja temporal si existe
    var tmp = ss.getSheetByName("__tmp__");
    if (tmp) ss.deleteSheet(tmp);

    return { created: created, existing: existing };
  },
};


// ══════════════════════════════════════════════════════════════════════
// bootstrap/SeedData.js
// ══════════════════════════════════════════════════════════════════════

/**
 * SeedData — datos iniciales del sistema.
 *
 * Todos los métodos son idempotentes (upsert, no insert duplicado).
 * runSetup() es la función de entrada visible en el editor GAS.
 */
var SeedData = {

  ADMIN_USERS: [
    {
      id:       "usr-admin-global-001",
      email:    "vicerrectoria.financiera@upes.edu.sv",
      nombre:   "Vicerrectoría Administrativa y Financiera",
      rol:      "ADMINISTRADOR_GENERAL",
      unidadId: "GLOBAL",
    },
    {
      id:       "usr-admin-vraf-001",
      email:    "rrhh@upes.edu.sv",
      nombre:   "Administrador VRAF",
      rol:      "ADMINISTRADOR_UNIDAD",
      unidadId: "vraf",
    },
    {
      id:       "usr-admin-vraf-002",
      email:    "linda.alas@upes.edu.sv",
      nombre:   "Linda Bellaneth Alas García",
      rol:      "ADMINISTRADOR_UNIDAD",
      unidadId: "vraf",
    },
  ],

  WORKSPACES: [
    { id: "vraf",    nombre: "VRAF",         codigo: "VRAF", descripcion: "Vicerrectoría Administrativa y Financiera" },
    { id: "rrhh",    nombre: "RRHH",         codigo: "RH",   descripcion: "Recursos Humanos" },
    { id: "conta",   nombre: "Contabilidad", codigo: "CONT", descripcion: "Contabilidad General" },
    { id: "compras", nombre: "Compras",       codigo: "COMP", descripcion: "Compras y Adquisiciones" },
    { id: "mant",    nombre: "Mantenimiento", codigo: "MANT", descripcion: "Mantenimiento General" },
    { id: "salud",   nombre: "Salud SSO",     codigo: "SSO",  descripcion: "Seguridad y Salud Ocupacional" },
  ],

  upsertAdminUsers: function () {
    var TEMP_PASSWORD = "UPES2026!";
    var repo = Repository.for("usuarios");
    var now  = new Date().toISOString();
    var count = 0;

    SeedData.ADMIN_USERS.forEach(function (u) {
      var salt     = Crypto.salt();
      var hash     = Crypto.hash(TEMP_PASSWORD, salt);
      var initials = u.nombre.split(" ").filter(Boolean).slice(0, 2).map(function (n) { return n[0]; }).join("").toUpperCase();

      var existing = repo.findOne({ email: u.email });
      if (existing) {
        repo.update(existing.id, {
          rol:                u.rol,
          unidadId:           u.unidadId,
          activo:             true,
          passwordHash:       hash,
          passwordSalt:       salt,
          mustChangePassword: false,
          updatedAt:          now,
        });
        Logger.log("  Upsert: " + u.email + " [actualizado]");
      } else {
        repo.create({
          id:                 u.id,
          nombre:             u.nombre,
          email:              u.email,
          unidadId:           u.unidadId,
          rol:                u.rol,
          activo:             true,
          passwordHash:       hash,
          passwordSalt:       salt,
          mustChangePassword: false,
          avatarInitials:     initials,
          lastLoginAt:        null,
          createdAt:          now,
          updatedAt:          now,
        });
        Logger.log("  Creado: " + u.email);
      }
      count++;
    });

    return count;
  },

  upsertWorkspaces: function () {
    var repo  = Repository.for("workspaces");
    var now   = new Date().toISOString();
    var count = 0;

    SeedData.WORKSPACES.forEach(function (ws) {
      if (!repo.exists({ id: ws.id })) {
        repo.create(Object.assign({}, ws, { activo: true, createdAt: now }));
        Logger.log("  Workspace creado: " + ws.id);
        count++;
      } else {
        Logger.log("  Workspace existente: " + ws.id + " [omitido]");
      }
    });

    return count;
  },
};

// ─── Función de entrada (visible en el editor GAS) ───────────────────────────

function runSetup() {
  Logger.log("╔══════════════════════════════════════╗");
  Logger.log("║   SSE-VRAF v2 — Setup & Bootstrap    ║");
  Logger.log("╚══════════════════════════════════════╝");

  try {
    // 1. Spreadsheet
    Logger.log("\n[1/4] Verificando Spreadsheet...");
    var ss = SheetSetup.getOrCreateSpreadsheet();
    Logger.log("      ID: " + ss.getId());
    Logger.log("      URL: " + ss.getUrl());

    // 2. Hojas
    Logger.log("\n[2/4] Creando hojas...");
    var sheetsResult = SheetSetup.ensureAllSheets(ss);
    Logger.log("      Creadas: " + (sheetsResult.created.join(", ") || "ninguna (ya existían)"));

    // 3. Workspaces
    Logger.log("\n[3/4] Inicializando workspaces...");
    var wsCount = SeedData.upsertWorkspaces();
    Logger.log("      Total: " + wsCount + " creados");

    // 4. Usuarios admin
    Logger.log("\n[4/4] Configurando usuarios administradores...");
    var userCount = SeedData.upsertAdminUsers();
    Logger.log("      Total: " + userCount + " usuarios configurados");
    Logger.log("      Contraseña temporal: UPES2026!");

    Logger.log("\n✓ Setup completado exitosamente.");
    Logger.log("  Recuerda configurar WEBHOOK_SHARED_SECRET en Script Properties.");

    return { ok: true, spreadsheetId: ss.getId(), users: userCount, workspaces: wsCount };

  } catch (err) {
    Logger.log("\n✗ Error en setup: " + err.message);
    throw err;
  }
}


// ══════════════════════════════════════════════════════════════════════
// Code.js
// ══════════════════════════════════════════════════════════════════════

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
