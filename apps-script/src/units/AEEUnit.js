/**
 * AEE — Activity Execution Engine Unit Definition.
 * Registered in Code.js after registerAllUnits_().
 */
var AEE_UNIT_DEF = {
  key:     "aee",
  label:   "Ejecución Institucional",
  enabled: true,
  handlers: {
    listEjecuciones:   function (p) { return AEEController.listEjecuciones(p); },
    getEjecucion:      function (p) { return AEEController.getEjecucion(p); },
    createEjecucion:   function (p) { return AEEController.createEjecucion(p); },
    updateEjecucion:   function (p) { return AEEController.updateEjecucion(p); },
    cambiarEstado:     function (p) { return AEEController.cambiarEstado(p); },
    archivarEjecucion: function (p) { return AEEController.archivarEjecucion(p); },
    getMisActividades: function (p) { return AEEController.getMisActividades(p); },
    listCatalogos:     function (p) { return AEEController.listCatalogos(p); },
    createCatalogo:    function (p) { return AEEController.createCatalogo(p); },
    updateCatalogo:    function (p) { return AEEController.updateCatalogo(p); },
    getHistorial:      function (p) { return AEEController.getHistorial(p); },
    getDashboard:      function (p) { return AEEController.getDashboard(p); },
  },
};
