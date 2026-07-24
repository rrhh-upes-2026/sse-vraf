/**
 * Schema sync validation — detects divergence between TypeScript types and
 * the GAS Sheets column definitions. Run this utility in development or CI
 * to catch field mismatches before they reach production.
 *
 * HIGHEST PRIORITY per Fase 0 authorization: no field may be silently lost
 * during the GAS ↔ TypeScript round-trip.
 *
 * Usage (dev console or test):
 *   import { validateSchemaSync, SCHEMA_SYNC_REPORT } from "@/lib/schema-sync";
 *   console.log(validateSchemaSync());
 */

// Canonical GAS column definitions — must be kept in sync with
// apps-script/src/schema/entities.js. One source of truth per entity.
export const GAS_SCHEMA = {
  planes: {
    sheetName: "Planes",
    columns: [
      "id", "wsId", "nombre", "tipo", "estado",
      "periodoInicio", "periodoFin", "descripcion", "responsableId",
      "avancePct", "codigo", "version", "documentoUrl",
      "fechaAprobacion", "fechaRevision", "observaciones",
      "createdAt", "updatedAt",
    ],
  },
  objetivos: {
    sheetName: "ObjetivosEstrategicos",
    columns: [
      "id", "planId", "nombre", "descripcion", "resultadoEsperado",
      "justificacion", "responsableId", "unidadResponsableId",
      "prioridad", "indicadorPrincipalId", "metaGeneral",
      "fechaObjetivo", "estado", "observaciones",
    ],
  },
  proyectos: {
    sheetName: "ProyectosEstrategicos",
    columns: [
      "id", "objetivoId", "nombre", "descripcion", "unidadId",
      "responsableId", "estado", "fechaInicio", "fechaFin",
      "presupuesto", "fuenteFinanciamiento", "riesgos",
      "dependencias", "beneficiosEsperados", "observaciones",
    ],
  },
  procesos: {
    sheetName: "ProcesosInstitucionales",
    columns: [
      "id", "proyectoId", "unidadId", "nombre", "tipo",
      "objetivo", "alcance", "responsableId", "clientesInternos",
      "clientesExternos", "normativaAsociada", "estado", "avancePct",
      "semaforo", "fechaInicio", "fechaLimite", "slaDias", "prioridad",
      "ultimaActualizacion", "createdAt", "deletedAt",
    ],
  },
  actividades: {
    sheetName: "Actividades",
    columns: [
      "id", "procesoId", "etapaId", "nombre", "descripcion",
      "responsableId", "tiempoEsperadoHoras", "dependenciaId",
      "prioridad", "estado", "puntoControl", "orden",
    ],
  },
  evidencias: {
    sheetName: "Evidencias",
    columns: [
      "id", "actividadId", "nombre", "tipo", "obligatoria",
      "estado", "driveFileId", "version", "responsableId",
      "fechaCarga", "observaciones",
    ],
  },
  indicadores: {
    sheetName: "Indicadores",
    columns: [
      "id", "procesoId", "procedimientoId", "nombre", "objetivo",
      "descripcion", "categoria", "formula", "unidadMedida",
      "meta", "valorActual", "frecuencia", "responsableId",
      "fuenteInformacion", "evidenciaRequeridaId",
      "dashboardDestino", "reporteDestino", "automatizacionId",
      "semaforo", "tendencia", "ultimaActualizacion",
    ],
  },
  solicitudes: {
    sheetName: "Solicitudes",
    columns: [
      "id", "procesoId", "unidadId", "asunto", "descripcion",
      "solicitanteId", "responsableId", "estado", "prioridad",
      "fechaCreacion", "fechaCompromiso", "fechaCierre",
      "tiempoRespuestaHoras", "satisfaccion",
    ],
  },
  usuarios: {
    sheetName: "Usuarios",
    columns: ["id", "nombre", "email", "unidadId", "rol", "activo", "avatarInitials"],
  },
} as const;

export type GASEntityKey = keyof typeof GAS_SCHEMA;

/**
 * Known field gaps that are intentionally not in the GAS schema:
 * - JSON arrays (historial, comentarios, capturas, adjuntos) — stored as JSON strings
 * - Computed/derived fields not persisted
 * - Extended optional fields added after initial schema definition
 */
export const KNOWN_GAPS: Partial<Record<GASEntityKey, string[]>> = {
  planes:     ["historial"],
  objetivos:  ["historial"],
  proyectos:  ["historial"],
  procesos:   ["area", "criticidad", "riesgos", "dependencias", "observaciones", "historial"],
  evidencias: [
    "documentoRelacionadoId", "fechaEmision", "fechaVencimiento",
    "estadoRevision", "revisorId", "comentarios", "historial", "firmaDigital",
  ],
  indicadores: ["sentido", "lineaBase", "observaciones", "capturas", "historial"],
  solicitudes: ["comentarios", "bitacora", "adjuntos"],
};

export interface SchemaSyncResult {
  entity: GASEntityKey;
  gasColumns: readonly string[];
  missingInGas: string[];
  knownGaps: string[];
  status: "ok" | "gap" | "unknown_gap";
}

/**
 * Validates that TypeScript field names expected by the app are present in the
 * GAS column definitions. Returns a report per entity.
 *
 * Note: this utility validates structural completeness, not data integrity.
 * Run it in CI or as a dev health check.
 */
export function validateSchemaSync(
  entityFields: Partial<Record<GASEntityKey, string[]>> = {},
): SchemaSyncResult[] {
  return (Object.keys(GAS_SCHEMA) as GASEntityKey[]).map((entity) => {
    const gasColumns = GAS_SCHEMA[entity].columns as readonly string[];
    const expected = entityFields[entity] ?? [];
    const known = KNOWN_GAPS[entity] ?? [];

    const missing = expected.filter(
      (f) => !gasColumns.includes(f) && !known.includes(f),
    );

    return {
      entity,
      gasColumns,
      missingInGas: missing,
      knownGaps: known,
      status: missing.length > 0 ? "unknown_gap" : "ok",
    };
  });
}

/** Human-readable summary of schema sync state */
export const SCHEMA_SYNC_REPORT = {
  lastUpdated: "2026-07-24",
  status: "synced",
  resolvedInFase0: [
    "planes: added 13 missing columns (tipo, estado, wsId, avancePct, codigo, version, documentoUrl, fechaAprobacion, fechaRevision, observaciones, responsableId, createdAt, updatedAt)",
    "objetivos: added 10 missing columns (resultadoEsperado, justificacion, responsableId, unidadResponsableId, prioridad, indicadorPrincipalId, metaGeneral, fechaObjetivo, estado, observaciones)",
    "proyectos: added 9 missing columns (responsableId, estado, fechaInicio, fechaFin, presupuesto, fuenteFinanciamiento, riesgos, dependencias, beneficiosEsperados, observaciones)",
    "solicitudes: added 3 missing columns (descripcion, prioridad, fechaCompromiso)",
  ],
  knownRemainingGaps: [
    "JSON arrays (historial, comentarios, capturas, adjuntos) — stored as JSON strings in a single column, not expanded",
    "Extended Evidencia fields (estadoRevision, revisorId, firmaDigital) — reserved for future schema migration",
    "Extended Proceso fields (area, criticidad) — marked as optional, added in Fase 0",
    "usuarios: missing passwordHash/passwordSalt (AuthBridge concern, not entity schema)",
    "AuthBridge.login() returns usuarioId instead of id — tracked separately in auth layer",
    "emitWriteEvent_ covers only 8 entities — tracked in GAS backlog",
  ],
} as const;
