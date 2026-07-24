// ============================================================
// ICE — Indicator Capture Engine  |  Unit Definition
// ============================================================

var ICE_UNIT_DEF = {
  id:          "ice",
  name:        "Indicator Capture Engine",
  description: "Motor operativo de captura de variables, cálculo automático, aprobaciones y auditoría de indicadores.",
  version:     "1.0.0",
  color:       "#0284C7",
  handlers: [
    // Periods
    { action: "ice.listPeriods",       handler: function (p, c) { return ICEController.handle("ice.listPeriods",       p, c); } },
    { action: "ice.getPeriod",         handler: function (p, c) { return ICEController.handle("ice.getPeriod",         p, c); } },
    { action: "ice.createPeriod",      handler: function (p, c) { return ICEController.handle("ice.createPeriod",      p, c); } },
    { action: "ice.updatePeriod",      handler: function (p, c) { return ICEController.handle("ice.updatePeriod",      p, c); } },
    { action: "ice.openPeriod",        handler: function (p, c) { return ICEController.handle("ice.openPeriod",        p, c); } },
    { action: "ice.reviewPeriod",      handler: function (p, c) { return ICEController.handle("ice.reviewPeriod",      p, c); } },
    { action: "ice.closePeriod",       handler: function (p, c) { return ICEController.handle("ice.closePeriod",       p, c); } },
    { action: "ice.lockPeriod",        handler: function (p, c) { return ICEController.handle("ice.lockPeriod",        p, c); } },
    // Captures
    { action: "ice.listCapturas",      handler: function (p, c) { return ICEController.handle("ice.listCapturas",      p, c); } },
    { action: "ice.getCaptura",        handler: function (p, c) { return ICEController.handle("ice.getCaptura",        p, c); } },
    { action: "ice.createCaptura",     handler: function (p, c) { return ICEController.handle("ice.createCaptura",     p, c); } },
    { action: "ice.updateCaptura",     handler: function (p, c) { return ICEController.handle("ice.updateCaptura",     p, c); } },
    { action: "ice.deleteCaptura",     handler: function (p, c) { return ICEController.handle("ice.deleteCaptura",     p, c); } },
    { action: "ice.calculateCaptura",  handler: function (p, c) { return ICEController.handle("ice.calculateCaptura",  p, c); } },
    { action: "ice.submitCaptura",     handler: function (p, c) { return ICEController.handle("ice.submitCaptura",     p, c); } },
    // Variables
    { action: "ice.listCaptureVars",   handler: function (p, c) { return ICEController.handle("ice.listCaptureVars",   p, c); } },
    { action: "ice.saveCaptureVars",   handler: function (p, c) { return ICEController.handle("ice.saveCaptureVars",   p, c); } },
    // Approvals
    { action: "ice.listApprovals",     handler: function (p, c) { return ICEController.handle("ice.listApprovals",     p, c); } },
    { action: "ice.approve",           handler: function (p, c) { return ICEController.handle("ice.approve",           p, c); } },
    { action: "ice.reject",            handler: function (p, c) { return ICEController.handle("ice.reject",            p, c); } },
    { action: "ice.reopen",            handler: function (p, c) { return ICEController.handle("ice.reopen",            p, c); } },
    // Evidence
    { action: "ice.listEvidenceRefs",  handler: function (p, c) { return ICEController.handle("ice.listEvidenceRefs",  p, c); } },
    { action: "ice.linkEvidence",      handler: function (p, c) { return ICEController.handle("ice.linkEvidence",      p, c); } },
    { action: "ice.unlinkEvidence",    handler: function (p, c) { return ICEController.handle("ice.unlinkEvidence",    p, c); } },
    // Audit
    { action: "ice.listAudit",         handler: function (p, c) { return ICEController.handle("ice.listAudit",         p, c); } },
    // Composite
    { action: "ice.getMyIndicators",   handler: function (p, c) { return ICEController.handle("ice.getMyIndicators",   p, c); } },
    { action: "ice.getCaptureContext", handler: function (p, c) { return ICEController.handle("ice.getCaptureContext",  p, c); } },
  ],
};
