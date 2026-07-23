/**
 * EME — Evidence Management Engine entity schemas.
 *
 * Three sheets:
 *   emeEvidencias  — one row per institutional evidence item
 *   emeCatalogos   — configurable catalog values (tipos, estados, proveedores, confidencialidad)
 *   emeHistorial   — audit trail for evidence state changes and versioning events
 *
 * Call mergeEMEEntities_() once during initialization.
 *
 * SCOPE: evidence repository ONLY.
 * No compliance calculation, no indicator modification, no file upload implementation.
 * Sprint 006 (Compliance Engine) consumes this data.
 */

var EME_ENTITY_SHEETS = {

  emeEvidencias: {
    sheetName: "EMEEvidencias",
    columns: [
      // Identity
      "id", "wsId",
      // AEE reference (the execution this evidence belongs to)
      "executionId",
      // PME / APE denormalized references (self-contained reads)
      "planId", "activityId", "procedureId", "processId", "organizationalUnitId",
      // Metadata
      "title",
      "description",
      "evidenceType",          // catalog value: tipoEvidencia
      // Storage architecture (provider fields — no connector implemented)
      "storageProvider",       // catalog value: proveedorAlmacenamiento
      "storageReference",      // URL, path, or Drive file ID (simulated in Sprint 005)
      "fileName",              // system filename (with version suffix)
      "originalFileName",      // name as uploaded by user
      "extension",             // e.g. pdf, docx, xlsx
      "mimeType",              // e.g. application/pdf
      "fileSize",              // in bytes (logical)
      "checksum",              // MD5 or SHA-256 (simulated)
      // Versioning
      "version",               // semantic: "1.0", "1.1", "2.0"
      // Status
      "status",                // catalog value: estadoEvidencia
      // Responsibility
      "uploadedBy",
      "uploadedAt",
      // Validation architecture
      "validatedBy",
      "validatedAt",
      "validationStatus",      // aprobada | rechazada | pendiente
      "validationComments",
      // Classification
      "isRequired",            // boolean — flagged by AEE
      "isConfidential",        // boolean — quick flag
      "confidentialityLevel",  // catalog: Pública | Interna | Confidencial | Restringida
      "expirationDate",        // YYYY-MM-DD or empty
      // Tagging
      "tags",                  // JSON array stored as string
      // Free text
      "notes",
      // Audit
      "createdBy", "createdAt", "updatedBy", "updatedAt", "deletedAt",
    ],
  },

  emeCatalogos: {
    sheetName: "EMECatalogos",
    columns: [
      "id", "wsId",
      "tipo",      // tipoEvidencia | estadoEvidencia | proveedorAlmacenamiento | nivelConfidencialidad
      "valor",     // stored key
      "etiqueta",  // display label
      "activo",
      "orden",
      "createdAt", "updatedAt",
    ],
  },

  emeHistorial: {
    sheetName: "EMEHistorial",
    columns: [
      "id", "wsId",
      "evidenciaId",
      "accion",          // creado | actualizado | estado_cambiado | version_nueva | archivado | validado | rechazado
      "estadoAnterior",
      "estadoNuevo",
      "versionAnterior",
      "versionNueva",
      "usuario",
      "detalle",         // JSON string
      "createdAt",
    ],
  },
};

function mergeEMEEntities_() {
  var count = 0;
  for (var key in EME_ENTITY_SHEETS) {
    if (Object.prototype.hasOwnProperty.call(EME_ENTITY_SHEETS, key)) {
      ENTITY_SHEETS[key] = EME_ENTITY_SHEETS[key];
      count++;
    }
  }
  AppLogger.info("mergeEMEEntities_: merged eme entities", { count: count });
}
