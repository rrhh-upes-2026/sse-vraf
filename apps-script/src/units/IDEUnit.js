// ============================================================
// IDE — Indicator Definition Engine  |  Unit Definition
// ============================================================

var IDE_UNIT_DEF = {
  id:          "ide",
  name:        "Indicator Definition Engine",
  description: "Motor institucional de definición, validación, importación y versionado de indicadores.",
  version:     "1.0.0",
  color:       "#D97706",
  handlers: [
    // Indicator CRUD
    { action: "ide.listIndicators",    handler: function (p, c) { return IDEController.handle("ide.listIndicators",    p, c); } },
    { action: "ide.getIndicator",      handler: function (p, c) { return IDEController.handle("ide.getIndicator",      p, c); } },
    { action: "ide.createIndicator",   handler: function (p, c) { return IDEController.handle("ide.createIndicator",   p, c); } },
    { action: "ide.updateIndicator",   handler: function (p, c) { return IDEController.handle("ide.updateIndicator",   p, c); } },
    { action: "ide.deleteIndicator",   handler: function (p, c) { return IDEController.handle("ide.deleteIndicator",   p, c); } },
    // Validation & preview
    { action: "ide.validateIndicator", handler: function (p, c) { return IDEController.handle("ide.validateIndicator", p, c); } },
    { action: "ide.previewIndicator",  handler: function (p, c) { return IDEController.handle("ide.previewIndicator",  p, c); } },
    // Simulation
    { action: "ide.simulateIndicator", handler: function (p, c) { return IDEController.handle("ide.simulateIndicator", p, c); } },
    // Status transitions
    { action: "ide.publishIndicator",  handler: function (p, c) { return IDEController.handle("ide.publishIndicator",  p, c); } },
    { action: "ide.archiveIndicator",  handler: function (p, c) { return IDEController.handle("ide.archiveIndicator",  p, c); } },
    { action: "ide.sendToReview",      handler: function (p, c) { return IDEController.handle("ide.sendToReview",      p, c); } },
    { action: "ide.sendToDraft",       handler: function (p, c) { return IDEController.handle("ide.sendToDraft",       p, c); } },
    // Versions
    { action: "ide.listVersions",      handler: function (p, c) { return IDEController.handle("ide.listVersions",      p, c); } },
    { action: "ide.duplicateVersion",  handler: function (p, c) { return IDEController.handle("ide.duplicateVersion",  p, c); } },
    // Variable resolution
    { action: "ide.resolveVariables",  handler: function (p, c) { return IDEController.handle("ide.resolveVariables",  p, c); } },
    // Duplicate detection
    { action: "ide.detectDuplicates",  handler: function (p, c) { return IDEController.handle("ide.detectDuplicates",  p, c); } },
    // Import engine
    { action: "ide.prepareImport",     handler: function (p, c) { return IDEController.handle("ide.prepareImport",     p, c); } },
    { action: "ide.getMappingTemplate",handler: function (p, c) { return IDEController.handle("ide.getMappingTemplate",p, c); } },
  ],
};
