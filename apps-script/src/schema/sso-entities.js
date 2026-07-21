/**
 * Salud y Seguridad Ocupacional entity schema definitions.
 *
 * Incidents, accidents, inspections, hazard identification, risk assessment
 * (IPER matrix), corrective/preventive actions, EPP control, SSO training,
 * committee sessions, internal audits, and legal compliance tracking.
 *
 * Integration points (foreign keys only — no data duplication):
 *   empleadoId      → empleados.id            (RRHH)
 *   responsableId   → empleados.id            (RRHH)
 *   activoId        → mantoActivos.id          (Mantenimiento)
 *   proveedorId     → comprasProveedores.id    (Compras — EPP)
 *   ordenCompraRef  → comprasOrdenes.codigo    (Compras — EPP)
 *   compromisoId    → contaCompromisos.id      (Contabilidad — costos)
 *
 * Call mergeSSOEntities_() in Code.js bootstrap and initializeDatabase.
 */

var SSO_ENTITY_SHEETS = {

  ssoIncidentes: {
    sheetName: "SSOIncidentes",
    columns: [
      "id", "wsId", "codigo",
      "titulo", "descripcion",
      "tipo", "area", "proceso",
      // RRHH integration
      "empleadoId", "empleadoRef",
      "fechaIncidente", "horaIncidente",
      "ubicacion",
      // Mantenimiento integration
      "activoId",
      "gravedad", "estado", "etapa",
      "investigadorId", "fechaInvestigacion",
      "causaRaiz", "accionesGeneradas",
      "diasPerdidos",
      // Contabilidad integration
      "costoEstimado", "compromisoId",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

  ssoAccidentes: {
    sheetName: "SSOAccidentes",
    columns: [
      "id", "wsId", "codigo",
      // SSO integration
      "incidenteId",
      // RRHH integration
      "empleadoId", "empleadoRef",
      "tipo", "area", "proceso",
      "fechaAccidente", "horaAccidente",
      "descripcion", "causas",
      "lesionTipo", "parteCuerpo", "gravedad",
      "testigos",
      "diasIncapacidad",
      // Contabilidad integration
      "costosAtencion", "compromisoId",
      "estado",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

  ssoInspecciones: {
    sheetName: "SSOInspecciones",
    columns: [
      "id", "wsId", "codigo", "titulo",
      "tipo",
      "area", "proceso",
      // RRHH integration
      "inspectorId", "inspectorRef",
      "fechaProgramada", "fechaEjecucion",
      "hallazgos", "observaciones",
      "numHallazgos", "numConformes", "numNoConformes",
      "estado",
      "accionesGeneradas",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

  ssoPeligros: {
    sheetName: "SSOPeligros",
    columns: [
      "id", "wsId", "codigo",
      "area", "proceso", "actividad",
      "tipo", "descripcion", "fuente",
      "personasExpuestas",
      "controlesExistentes",
      "estado",
      // Mantenimiento integration
      "activoId",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

  ssoRiesgos: {
    sheetName: "SSORiesgos",
    columns: [
      "id", "wsId", "codigo",
      // SSO integration
      "peligroId",
      "area", "proceso", "actividad", "peligroDesc",
      "probabilidad", "impacto", "nivelRiesgo", "clasificacion",
      "controlesExistentes", "accionesRecomendadas",
      // RRHH integration
      "responsableId",
      "fechaRevision",
      "estado",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

  ssoAcciones: {
    sheetName: "SSOAcciones",
    columns: [
      "id", "wsId", "codigo",
      "tipo", "origen", "origenId",
      "titulo", "descripcion",
      // RRHH integration
      "responsableId", "responsableRef",
      "area",
      "prioridad",
      "fechaAsignacion", "fechaLimite", "fechaCierre",
      "progresoPct",
      // RRHH integration
      "verificadoPorId", "fechaVerificacion",
      "estado",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

  ssoEPP: {
    sheetName: "SSOEPP",
    columns: [
      "id", "wsId", "codigo",
      "nombre", "descripcion", "categoria",
      // RRHH integration
      "empleadoId", "empleadoRef",
      "tipo", "talla", "marca", "modelo",
      "fechaEntrega", "fechaVencimiento",
      "cantidad", "unidadMedida",
      "estado",
      // Compras integration
      "proveedorId", "ordenCompraRef",
      // Contabilidad integration
      "costo", "compromisoId",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

  ssoCapacitaciones: {
    sheetName: "SSOCapacitaciones",
    columns: [
      "id", "wsId", "codigo", "titulo",
      "tipo", "modalidad",
      "instructor", "entidad",
      "fechaInicio", "fechaFin", "duracionHoras",
      "participantesIds",
      "numParticipantes", "numAprobados",
      "tematica", "objetivo",
      "estado",
      // Contabilidad integration
      "costo", "compromisoId",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

  ssoComite: {
    sheetName: "SSOComite",
    columns: [
      "id", "wsId", "codigo",
      "tipo", "numero", "fecha", "lugar",
      // RRHH integration
      "presidenteId", "secretarioId",
      "miembros",
      "numAsistentes",
      "agenda", "acuerdos", "compromisos",
      "estado",
      "proximaFecha",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

  ssoAuditorias: {
    sheetName: "SSOAuditorias",
    columns: [
      "id", "wsId", "codigo", "titulo",
      "tipo", "normaRef",
      // RRHH integration
      "auditorId", "auditorRef",
      "fechaProgramada", "fechaEjecucion",
      "alcance", "metodologia",
      "hallazgos", "noConformidades",
      "numHallazgos", "numNC",
      "planAccion",
      "estado",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

  ssoCumplimiento: {
    sheetName: "SSOCumplimiento",
    columns: [
      "id", "wsId", "codigo",
      "norma", "articulo", "descripcion",
      "tipo",
      // RRHH integration
      "responsableId",
      "fechaVigencia", "fechaRevision",
      "evidencia",
      "estado",
      "observaciones",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

};

/**
 * Register all SSO entity schemas into the global ENTITY_SHEETS.
 * Called from Code.js bootstrap and initializeDatabase().
 */
function mergeSSOEntities_() {
  var count = 0;
  for (var key in SSO_ENTITY_SHEETS) {
    if (Object.prototype.hasOwnProperty.call(SSO_ENTITY_SHEETS, key)) {
      ENTITY_SHEETS[key] = SSO_ENTITY_SHEETS[key];
      count++;
    }
  }
  AppLogger.info("mergeSSOEntities_: merged SSO entities", { count: count });
}
