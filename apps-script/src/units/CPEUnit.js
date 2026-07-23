/**
 * CPE — Compliance & Performance Engine unit definition.
 * Registered with OrgUnitRegistry so the router can dispatch cpe.* actions.
 */
var CPE_UNIT_DEF = {
  key:     "cpe",
  label:   "Cumplimiento Institucional",
  enabled: true,
  handlers: {
    calcularCumplimiento: CPEController.calcularCumplimiento,
    getSnapshot:          CPEController.getSnapshot,
    listSnapshots:        CPEController.listSnapshots,
    getDashboard:         CPEController.getDashboard,
    getBrechas:           CPEController.getBrechas,
    listPlanesMejora:     CPEController.listPlanesMejora,
    getPlanMejora:        CPEController.getPlanMejora,
    createPlanMejora:     CPEController.createPlanMejora,
    updatePlanMejora:     CPEController.updatePlanMejora,
    deletePlanMejora:     CPEController.deletePlanMejora,
    listCatalogos:        CPEController.listCatalogos,
    updateCatalogo:       CPEController.updateCatalogo,
    getHistorial:         CPEController.getHistorial,
  },
};
