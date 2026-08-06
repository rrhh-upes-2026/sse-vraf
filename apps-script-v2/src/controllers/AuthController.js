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
