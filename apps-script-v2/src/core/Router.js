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
