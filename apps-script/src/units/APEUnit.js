/**
 * APE — Activity Planning Engine Unit Definition.
 * Registered in Code.js after registerAllUnits_().
 */
var APE_UNIT_DEF = {
  key:     "ape",
  label:   "Planificación Institucional",
  enabled: true,
  handlers: {
    listPlanes:        function (p) { return APEController.listPlanes(p); },
    getPlan:           function (p) { return APEController.getPlan(p); },
    createPlan:        function (p) { return APEController.createPlan(p); },
    updatePlan:        function (p) { return APEController.updatePlan(p); },
    cambiarEstado:     function (p) { return APEController.cambiarEstado(p); },
    generatePlans:     function (p) { return APEController.generatePlans(p); },
    previewGeneration: function (p) { return APEController.previewGeneration(p); },
    getHistorial:      function (p) { return APEController.getHistorial(p); },
    getDashboard:      function (p) { return APEController.getDashboard(p); },
  },
};
