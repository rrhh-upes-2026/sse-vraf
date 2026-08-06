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
