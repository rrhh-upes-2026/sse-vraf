/**
 * CPE — Compliance & Performance Engine entity schemas.
 * Merged into ENTITY_SHEETS at bootstrap so SheetRepository can resolve them.
 */
var CPE_ENTITY_SHEETS = {
  cpeSnapshots: {
    sheetName: "CPESnapshots",
    columns: [
      "id", "wsId", "snapshotDate", "year", "month",
      "organizationalUnitId", "processId", "procedureId", "activityId",
      "planId", "executionId", "indicatorId",
      "plannedActivities", "executedActivities",
      "validatedEvidence", "requiredEvidence",
      "planningScore", "executionScore", "documentationScore", "indicatorScore",
      "overallScore", "complianceStatus", "riskLevel",
      "calculatedAt", "calculatedBy", "createdAt"
    ],
  },
  cpePlanesMejora: {
    sheetName: "CPEPlanesMejora",
    columns: [
      "id", "wsId", "relatedComplianceId", "title", "description",
      "priority", "responsible", "targetDate", "status", "progress",
      "notes", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },
  cpeHistorial: {
    sheetName: "CPEHistorial",
    columns: [
      "id", "wsId", "tipoCalculo", "duracion", "registrosAnalizados",
      "resultado", "usuario", "createdAt"
    ],
  },
  cpeCatalogos: {
    sheetName: "CPECatalogos",
    columns: [
      "id", "wsId", "tipo", "valor", "etiqueta", "activo", "orden",
      "peso", "umbralMin", "umbralMax", "scoreMin", "scoreMax",
      "createdAt", "updatedAt"
    ],
  },
};

function mergeCPEEntities_() {
  Object.keys(CPE_ENTITY_SHEETS).forEach(function (key) {
    ENTITY_SHEETS[key] = CPE_ENTITY_SHEETS[key];
  });
}
