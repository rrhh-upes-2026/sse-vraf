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
