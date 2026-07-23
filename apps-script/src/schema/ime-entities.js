/**
 * IME — Indicator Management Engine entity schemas.
 *
 * Three sheets:
 *   imeIndicadores — one row per institutional indicator definition
 *   imeCatalogos   — lookup catalogue items (all types share one sheet, discriminated by 'tipo')
 *   imeHistorial   — audit trail of every state change on an indicator
 *
 * Call mergeIMEEntities_() once during initialization.
 */

var IME_ENTITY_SHEETS = {

  imeIndicadores: {
    sheetName: "IMEIndicadores",
    columns: [
      // Identification
      "id", "wsId", "code", "name", "description", "active",
      // Classification
      "organizationalUnitId", "processId", "procedureId",
      "strategicPillar", "strategicObjective",
      // Technical configuration
      "indicatorType", "measurementUnit", "frequency",
      "calculationType", "polarity",
      "targetValue", "warningThreshold", "criticalThreshold",
      // Responsibility
      "responsiblePosition", "responsibleUser",
      // General
      "displayOrder", "year", "version", "observations",
      // Audit
      "createdBy", "createdAt", "updatedBy", "updatedAt", "deletedAt",
    ],
  },

  imeCatalogos: {
    sheetName: "IMECatalogos",
    columns: [
      "id", "wsId",
      "tipo",     // tipoIndicador | frecuencia | polaridad | unidadMedida |
                  // pilarEstrategico | objetivoEstrategico | proceso | procedimiento
      "codigo", "nombre", "descripcion",
      "activo", "orden",
      "createdBy", "createdAt", "updatedAt", "deletedAt",
    ],
  },

  imeHistorial: {
    sheetName: "IMEHistorial",
    columns: [
      "id", "wsId",
      "indicadorId",
      "accion",   // creado | actualizado | activado | desactivado | duplicado
      "usuario",
      "detalle",  // JSON string
      "createdAt",
    ],
  },
};

function mergeIMEEntities_() {
  var count = 0;
  for (var key in IME_ENTITY_SHEETS) {
    if (Object.prototype.hasOwnProperty.call(IME_ENTITY_SHEETS, key)) {
      ENTITY_SHEETS[key] = IME_ENTITY_SHEETS[key];
      count++;
    }
  }
  AppLogger.info("mergeIMEEntities_: merged ime entities", { count: count });
}
