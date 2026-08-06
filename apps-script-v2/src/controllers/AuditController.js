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
