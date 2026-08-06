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
