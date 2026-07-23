/**
 * AEE — Activity Execution Engine entity schemas.
 *
 * Three sheets:
 *   aeeEjecuciones  — one row per recorded execution of an APE plan
 *   aeeCatalogos    — configurable catalog values (resultados, niveles de riesgo)
 *   aeeHistorial    — audit trail for execution state changes
 *
 * Call mergeAEEEntities_() once during initialization.
 *
 * SCOPE: execution recording only.
 * No evidence, no compliance calculation, no indicator modification.
 * Sprint 005 (Evidence Engine) adds document management on top of this schema.
 */

var AEE_ENTITY_SHEETS = {

  aeeEjecuciones: {
    sheetName: "AEEEjecuciones",
    columns: [
      // Identity
      "id", "wsId",
      // APE reference (the plan being executed)
      "planId",
      // PME references (denormalized for self-contained reads)
      "activityId", "procedureId", "processId", "organizationalUnitId",
      // Sequence
      "executionNumber",      // position within the plan's execution sequence
      // Temporal
      "executionDate",        // YYYY-MM-DD — actual execution date
      "startTime",            // HH:mm — actual start
      "endTime",              // HH:mm — actual end
      "durationMinutes",      // calculated or entered
      // Responsibility
      "executedBy",           // user ID who executed
      "responsiblePosition",  // cargo/role
      // Status & result
      "status",               // see AEE_ESTADOS
      "executionResult",      // catalog value ID
      // Notes
      "completionNotes",      // main completion note
      "observations",         // additional observations
      // Incidents & risks
      "requiresEvidence",     // boolean — flags for Evidence Engine
      "hasEvidence",          // boolean — set by Evidence Engine (Sprint 005)
      "riskDetected",         // risk level catalog value
      "incidentReported",     // boolean
      // Approval architecture (Sprint 005+)
      "requiresApproval",
      "approvedBy",
      "approvalDate",
      // Audit
      "createdBy", "createdAt", "updatedBy", "updatedAt", "deletedAt",
    ],
  },

  aeeCatalogos: {
    sheetName: "AEECatalogos",
    columns: [
      "id", "wsId",
      "tipo",     // resultadoEjecucion | nivelRiesgo
      "valor",    // stored value (key)
      "etiqueta", // display label
      "activo",   // boolean
      "orden",    // display order
      "createdAt", "updatedAt",
    ],
  },

  aeeHistorial: {
    sheetName: "AEEHistorial",
    columns: [
      "id", "wsId",
      "ejecucionId",
      "accion",   // creado | actualizado | estado_cambiado | archivado
      "estadoAnterior",
      "estadoNuevo",
      "usuario",
      "detalle",  // JSON string
      "createdAt",
    ],
  },
};

function mergeAEEEntities_() {
  var count = 0;
  for (var key in AEE_ENTITY_SHEETS) {
    if (Object.prototype.hasOwnProperty.call(AEE_ENTITY_SHEETS, key)) {
      ENTITY_SHEETS[key] = AEE_ENTITY_SHEETS[key];
      count++;
    }
  }
  AppLogger.info("mergeAEEEntities_: merged aee entities", { count: count });
}
