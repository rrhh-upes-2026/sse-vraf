/**
 * APE — Activity Planning Engine entity schemas.
 *
 * Two sheets:
 *   apePlanes    — one row per planned execution of a PME activity
 *   apeHistorial — audit trail for plan state changes
 *
 * Call mergeAPEEntities_() once during initialization.
 *
 * SCOPE: planning only. No tracking, no evidence, no compliance.
 * Follow-up Engine (Sprint 004) adds execution state on top of this schema.
 */

var APE_ENTITY_SHEETS = {

  apePlanes: {
    sheetName: "APEPlanes",
    columns: [
      // Identity
      "id", "wsId",
      // PME references (never duplicate the actual data)
      "activityId", "processId", "procedureId", "organizationalUnitId",
      // Plan description
      "title", "description",
      // Temporal scope
      "year",
      "plannedStartDate", "plannedEndDate",
      // Temporal classification
      "plannedMonth",          // 1-12
      "plannedQuarter",        // 1-4
      "plannedSemester",       // 1-2
      "plannedWeek",           // 1-53 (ISO week)
      "plannedExecutionNumber", // position within the activity's annual plan sequence
      // Periodicidad (copied from activity at generation time for self-contained reads)
      "periodicity",
      // Responsibility
      "responsibleUser", "responsiblePosition",
      // Planning metadata
      "priority",   // Alta | Media | Baja
      "status",     // Programada | Próxima | Pendiente | Archivada | Cancelada
      "plannedHours",
      // Future-engine hooks (populated by Sprint 004+)
      "dependencies",  // JSON array of plan IDs
      "notes",
      // Audit
      "createdBy", "createdAt", "updatedBy", "updatedAt", "deletedAt",
    ],
  },

  apeHistorial: {
    sheetName: "APEHistorial",
    columns: [
      "id", "wsId",
      "planId",
      "accion",   // generado | actualizado | programado | proximo | pendiente | archivado | cancelado | regenerado
      "usuario",
      "detalle",  // JSON string
      "createdAt",
    ],
  },
};

function mergeAPEEntities_() {
  var count = 0;
  for (var key in APE_ENTITY_SHEETS) {
    if (Object.prototype.hasOwnProperty.call(APE_ENTITY_SHEETS, key)) {
      ENTITY_SHEETS[key] = APE_ENTITY_SHEETS[key];
      count++;
    }
  }
  AppLogger.info("mergeAPEEntities_: merged ape entities", { count: count });
}
