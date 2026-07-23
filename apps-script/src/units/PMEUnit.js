/**
 * PME — Process Management Engine Unit Definition.
 * Registered in Code.js after registerAllUnits_().
 */
var PME_UNIT_DEF = {
  key:     "pme",
  label:   "Gestión de Procesos",
  enabled: true,
  handlers: {
    // Procesos
    listProcesos:          function (p) { return PMEController.listProcesos(p); },
    getProceso:            function (p) { return PMEController.getProceso(p); },
    createProceso:         function (p) { return PMEController.createProceso(p); },
    updateProceso:         function (p) { return PMEController.updateProceso(p); },
    archivarProceso:       function (p) { return PMEController.archivarProceso(p); },
    activarProceso:        function (p) { return PMEController.activarProceso(p); },
    duplicarProceso:       function (p) { return PMEController.duplicarProceso(p); },
    // Procedimientos
    listProcedimientos:    function (p) { return PMEController.listProcedimientos(p); },
    getProcedimiento:      function (p) { return PMEController.getProcedimiento(p); },
    createProcedimiento:   function (p) { return PMEController.createProcedimiento(p); },
    updateProcedimiento:   function (p) { return PMEController.updateProcedimiento(p); },
    archivarProcedimiento: function (p) { return PMEController.archivarProcedimiento(p); },
    activarProcedimiento:  function (p) { return PMEController.activarProcedimiento(p); },
    duplicarProcedimiento: function (p) { return PMEController.duplicarProcedimiento(p); },
    // Actividades
    listActividades:       function (p) { return PMEController.listActividades(p); },
    getActividad:          function (p) { return PMEController.getActividad(p); },
    createActividad:       function (p) { return PMEController.createActividad(p); },
    updateActividad:       function (p) { return PMEController.updateActividad(p); },
    archivarActividad:     function (p) { return PMEController.archivarActividad(p); },
    activarActividad:      function (p) { return PMEController.activarActividad(p); },
    duplicarActividad:     function (p) { return PMEController.duplicarActividad(p); },
    // Catálogos
    listCatalogos:         function (p) { return PMEController.listCatalogos(p); },
    getCatalogo:           function (p) { return PMEController.getCatalogo(p); },
    createCatalogo:        function (p) { return PMEController.createCatalogo(p); },
    updateCatalogo:        function (p) { return PMEController.updateCatalogo(p); },
    archivarCatalogo:      function (p) { return PMEController.archivarCatalogo(p); },
    // Historial & Dashboard
    getHistorial:          function (p) { return PMEController.getHistorial(p); },
    getDashboard:          function (p) { return PMEController.getDashboard(p); },
  },
};
