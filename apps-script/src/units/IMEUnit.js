/**
 * IME — Indicator Management Engine Unit Definition.
 *
 * Registers the "ime" namespace with OrgUnitRegistry.
 * All handlers delegate to IMEController.
 */
var IME_UNIT_DEF = {
  key:     "ime",
  label:   "Gestión de Indicadores",
  enabled: true,
  handlers: {
    // Indicadores
    listIndicadores:     function (p) { return IMEController.listIndicadores(p); },
    getIndicador:        function (p) { return IMEController.getIndicador(p); },
    createIndicador:     function (p) { return IMEController.createIndicador(p); },
    updateIndicador:     function (p) { return IMEController.updateIndicador(p); },
    activarIndicador:    function (p) { return IMEController.activarIndicador(p); },
    desactivarIndicador: function (p) { return IMEController.desactivarIndicador(p); },
    duplicarIndicador:   function (p) { return IMEController.duplicarIndicador(p); },
    getHistorial:        function (p) { return IMEController.getHistorial(p); },
    // Catálogos
    listCatalogos:       function (p) { return IMEController.listCatalogos(p); },
    getCatalogo:         function (p) { return IMEController.getCatalogo(p); },
    createCatalogo:      function (p) { return IMEController.createCatalogo(p); },
    updateCatalogo:      function (p) { return IMEController.updateCatalogo(p); },
    archivarCatalogo:    function (p) { return IMEController.archivarCatalogo(p); },
    // Dashboard
    getDashboard:        function (p) { return IMEController.getDashboard(p); },
  },
};
