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
