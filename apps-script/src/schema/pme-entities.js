/**
 * PME — Process Management Engine entity schemas.
 *
 * Five sheets:
 *   pmeProcesos        — institutional process definitions
 *   pmeProcedimientos  — procedures belonging to a process
 *   pmeActividades     — activities belonging to a procedure
 *   pmeCatalogos       — lookup catalogue items (all types, discriminated by 'tipo')
 *   pmeHistorial       — audit trail for all PME entities
 *
 * Call mergePMEEntities_() once during initialization.
 */

var PME_ENTITY_SHEETS = {

  pmeProcesos: {
    sheetName: "PMEProcesos",
    columns: [
      // Identification
      "id", "wsId", "code", "name", "description", "active",
      // Classification
      "organizationalUnitId", "tipoProcesoId",
      "periodicidad", "objetivo",
      // Responsibility
      "responsiblePosition", "responsibleUser",
      // Configuration
      "displayOrder", "version", "observations",
      // IME integration hook (future use)
      "indicadorIds",
      // Audit
      "createdBy", "createdAt", "updatedBy", "updatedAt", "deletedAt",
    ],
  },

  pmeProcedimientos: {
    sheetName: "PMEProcedimientos",
    columns: [
      // Identification
      "id", "wsId", "code", "name", "description", "active",
      // Hierarchy
      "procesoId",
      // Classification
      "tipoProcedimientoId", "periodicidad", "objetivo",
      // Responsibility
      "responsiblePosition", "responsibleUser",
      // Configuration
      "displayOrder", "version", "observations",
      // Audit
      "createdBy", "createdAt", "updatedBy", "updatedAt", "deletedAt",
    ],
  },

  pmeActividades: {
    sheetName: "PMEActividades",
    columns: [
      // Identification
      "id", "wsId", "code", "name", "description", "active",
      // Hierarchy
      "procesoId", "procedimientoId",
      // Classification
      "tipoActividadId", "estadoOperativoId",
      "periodicidad", "objetivo",
      // Duration
      "duracion", "unidadDuracionId",
      // Responsibility
      "responsiblePosition", "responsibleUser",
      // Configuration
      "displayOrder", "version", "observations",
      // IME integration hook (future use)
      "indicadorId",
      // Audit
      "createdBy", "createdAt", "updatedBy", "updatedAt", "deletedAt",
    ],
  },

  pmeCatalogos: {
    sheetName: "PMECatalogos",
    columns: [
      "id", "wsId",
      "tipo",     // tipoProceso | tipoProcedimiento | tipoActividad |
                  // unidadDuracion | periodicidad | estadoOperativo
      "codigo", "nombre", "descripcion",
      "activo", "orden",
      "createdBy", "createdAt", "updatedAt", "deletedAt",
    ],
  },

  pmeHistorial: {
    sheetName: "PMEHistorial",
    columns: [
      "id", "wsId",
      "entidadTipo",  // proceso | procedimiento | actividad
      "entidadId",
      "accion",       // creado | actualizado | activado | archivado | duplicado |
                      // responsableCambiado | nombreCambiado | objetivoCambiado
      "usuario",
      "detalle",      // JSON string
      "createdAt",
    ],
  },
};

function mergePMEEntities_() {
  var count = 0;
  for (var key in PME_ENTITY_SHEETS) {
    if (Object.prototype.hasOwnProperty.call(PME_ENTITY_SHEETS, key)) {
      ENTITY_SHEETS[key] = PME_ENTITY_SHEETS[key];
      count++;
    }
  }
  AppLogger.info("mergePMEEntities_: merged pme entities", { count: count });
}
