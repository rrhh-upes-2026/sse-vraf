/**
 * FMI Unit Definition — Framework Maestro de Indicadores.
 * 32 handlers proxied to FMIController.
 */

var FMI_UNIT_DEF = {
  namespace: "fmi",
  handlers: {
    // Objectives
    listObjectives:    function(p, ctx) { return FMIController.handle("listObjectives",    p, ctx); },
    getObjective:      function(p, ctx) { return FMIController.handle("getObjective",      p, ctx); },
    createObjective:   function(p, ctx) { return FMIController.handle("createObjective",   p, ctx); },
    updateObjective:   function(p, ctx) { return FMIController.handle("updateObjective",   p, ctx); },
    deleteObjective:   function(p, ctx) { return FMIController.handle("deleteObjective",   p, ctx); },
    // Dimensions
    listDimensions:    function(p, ctx) { return FMIController.handle("listDimensions",    p, ctx); },
    getDimension:      function(p, ctx) { return FMIController.handle("getDimension",      p, ctx); },
    createDimension:   function(p, ctx) { return FMIController.handle("createDimension",   p, ctx); },
    updateDimension:   function(p, ctx) { return FMIController.handle("updateDimension",   p, ctx); },
    deleteDimension:   function(p, ctx) { return FMIController.handle("deleteDimension",   p, ctx); },
    // Unit Measures
    listUnitMeasures:  function(p, ctx) { return FMIController.handle("listUnitMeasures",  p, ctx); },
    getUnitMeasure:    function(p, ctx) { return FMIController.handle("getUnitMeasure",    p, ctx); },
    createUnitMeasure: function(p, ctx) { return FMIController.handle("createUnitMeasure", p, ctx); },
    updateUnitMeasure: function(p, ctx) { return FMIController.handle("updateUnitMeasure", p, ctx); },
    deleteUnitMeasure: function(p, ctx) { return FMIController.handle("deleteUnitMeasure", p, ctx); },
    // Frequencies
    listFrequencies:   function(p, ctx) { return FMIController.handle("listFrequencies",   p, ctx); },
    getFrequency:      function(p, ctx) { return FMIController.handle("getFrequency",      p, ctx); },
    createFrequency:   function(p, ctx) { return FMIController.handle("createFrequency",   p, ctx); },
    updateFrequency:   function(p, ctx) { return FMIController.handle("updateFrequency",   p, ctx); },
    deleteFrequency:   function(p, ctx) { return FMIController.handle("deleteFrequency",   p, ctx); },
    // Polarities (read-only)
    listPolarities:    function(p, ctx) { return FMIController.handle("listPolarities",    p, ctx); },
    // Formulas
    listFormulas:      function(p, ctx) { return FMIController.handle("listFormulas",      p, ctx); },
    getFormula:        function(p, ctx) { return FMIController.handle("getFormula",        p, ctx); },
    createFormula:     function(p, ctx) { return FMIController.handle("createFormula",     p, ctx); },
    updateFormula:     function(p, ctx) { return FMIController.handle("updateFormula",     p, ctx); },
    deleteFormula:     function(p, ctx) { return FMIController.handle("deleteFormula",     p, ctx); },
    calculateFormula:  function(p, ctx) { return FMIController.handle("calculateFormula",  p, ctx); },
    // Range Configs
    listRangeConfigs:  function(p, ctx) { return FMIController.handle("listRangeConfigs",  p, ctx); },
    getRangeConfig:    function(p, ctx) { return FMIController.handle("getRangeConfig",    p, ctx); },
    createRangeConfig: function(p, ctx) { return FMIController.handle("createRangeConfig", p, ctx); },
    updateRangeConfig: function(p, ctx) { return FMIController.handle("updateRangeConfig", p, ctx); },
    deleteRangeConfig: function(p, ctx) { return FMIController.handle("deleteRangeConfig", p, ctx); },
    evaluateRange:     function(p, ctx) { return FMIController.handle("evaluateRange",     p, ctx); },
  },
};
