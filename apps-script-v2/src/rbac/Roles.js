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
