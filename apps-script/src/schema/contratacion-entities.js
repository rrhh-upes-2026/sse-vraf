/**
 * Contratacion entity schema definitions — Sprint 16 RC-1.
 *
 * All hiring-process documents are stored in dedicated sheets. Complex nested
 * objects (historial arrays, competencia bitmaps, terna lists) are kept in a
 * "dataJson" column so the row-level columns remain thin and queryable.
 *
 * Call mergeContratacionEntities_() once during initialization (Code.js bootstrap
 * and initializeDatabase) to register these sheets in the global ENTITY_SHEETS.
 */

var CONTRATACION_ENTITY_SHEETS = {

  // ── Procesos de Contratación ────────────────────────────────────────────────
  contratProcesos: {
    sheetName: "ContratProcesos",
    columns: [
      "id", "wsId", "codigo", "nombrePuesto", "unidadFacultad", "jefeSolicitante",
      "tipoContratacion", "etapaActual", "pasoActual", "prioridad",
      "requisicionId", "informeTecnicoId", "informeFinalId", "cartaOfertaId",
      "expedienteId", "contratoId", "fichaEmpleadoId", "candidatoSeleccionadoId",
      "dataJson", "createdAt", "updatedAt", "deletedAt",
    ],
  },

  // ── Requisiciones de Personal ───────────────────────────────────────────────
  contratRequisiciones: {
    sheetName: "ContratRequisiciones",
    columns: [
      "id", "procesoId", "nombrePuesto", "tipoRequisicion", "tipoContratacion",
      "estado", "dataJson", "createdAt", "updatedAt",
    ],
  },

  // ── Informes Técnicos de Selección ──────────────────────────────────────────
  contratInformesTec: {
    sheetName: "ContratInformesTec",
    columns: [
      "id", "procesoId", "cargo", "candidatoRecomendado", "estado",
      "dataJson", "createdAt",
    ],
  },

  // ── Informes de Selección Final ─────────────────────────────────────────────
  contratInformesFinales: {
    sheetName: "ContratInformesFinales",
    columns: [
      "id", "procesoId", "puestoCubrir", "candidatoSeleccionado", "estado",
      "dataJson", "createdAt",
    ],
  },

  // ── Cartas de Oferta ────────────────────────────────────────────────────────
  contratCartasOferta: {
    sheetName: "ContratCartasOferta",
    columns: [
      "id", "procesoId", "candidatoId", "estado", "salarioMensual",
      "cargoOfrecido", "dataJson", "createdAt",
    ],
  },

  // ── Expedientes de Personal ─────────────────────────────────────────────────
  contratExpedientes: {
    sheetName: "ContratExpedientes",
    columns: [
      "id", "procesoId", "nombreCompleto", "cargo", "estadoExpediente",
      "dataJson", "createdAt", "updatedAt",
    ],
  },

  // ── Fichas de Empleado Permanente ───────────────────────────────────────────
  contratFichasEmp: {
    sheetName: "ContratFichasEmp",
    columns: [
      "id", "procesoId", "nombres", "primerApellido", "cargo", "area",
      "tipoContrato", "salario", "correoInstitucional", "dataJson",
      "createdAt", "updatedAt",
    ],
  },

  // ── Fichas de Docente Hora Clase ────────────────────────────────────────────
  contratFichasDoc: {
    sheetName: "ContratFichasDoc",
    columns: [
      "id", "procesoId", "nombre", "correoUPES", "facultad", "carrera",
      "dataJson", "createdAt",
    ],
  },

  // ── Contratos de Trabajo ────────────────────────────────────────────────────
  contratContratos: {
    sheetName: "ContratContratos",
    columns: [
      "id", "procesoId", "nombreEmpleado", "cargo", "salario", "estado",
      "dataJson", "createdAt",
    ],
  },

  // ── Candidatos (CV + evaluaciones) ─────────────────────────────────────────
  contratCandidatos: {
    sheetName: "ContratCandidatos",
    columns: [
      "id", "procesoId", "nombre", "apellido", "email",
      "cumplePerfilCV", "enTerna", "seleccionado",
      "notaEntrevistaPrelimininar", "notaPruebaTecnica",
      "notaPruebaConductual", "notaEntrevistaRRHH", "notaEntrevistaFinal",
      "promedioGeneral", "dataJson", "createdAt",
    ],
  },
};

/**
 * Register all contratacion entity schemas into the global ENTITY_SHEETS.
 * Must be called before any contratacion CRUD — typically from Code.js bootstrap
 * and initializeDatabase().
 */
function mergeContratacionEntities_() {
  var count = 0;
  for (var key in CONTRATACION_ENTITY_SHEETS) {
    if (Object.prototype.hasOwnProperty.call(CONTRATACION_ENTITY_SHEETS, key)) {
      ENTITY_SHEETS[key] = CONTRATACION_ENTITY_SHEETS[key];
      count++;
    }
  }
  AppLogger.info("mergeContratacionEntities_: merged contratacion entities", { count: count });
}
