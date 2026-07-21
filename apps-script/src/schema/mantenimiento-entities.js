/**
 * Mantenimiento e Infraestructura entity schema definitions.
 *
 * Assets, locations, preventive plans, service requests, work orders,
 * inspections, technical history, maintenance costs, and technical inventory.
 *
 * Integration points (foreign keys only — no data duplication):
 *   proveedorId      → comprasProveedores.id       (asset supplier)
 *   ordenCompraRef   → comprasOrdenes.codigo        (purchase context)
 *   compromisoId     → contaCompromisos.id          (budget commitment)
 *   facturaId        → contaFacturas.id             (invoice for cost)
 *
 * Call mergeMantenimientoEntities_() in Code.js bootstrap and initializeDatabase.
 */

var MANTENIMIENTO_ENTITY_SHEETS = {

  mantoActivos: {
    sheetName: "MantoActivos",
    columns: [
      "id", "wsId", "codigo", "nombre",
      "categoria", "tipo", "marca", "modelo", "serie", "descripcion",
      "ubicacionId", "ubicacionRef",
      "responsableId",
      "estado",
      "fechaAdquisicion", "vidaUtilAnios", "valorAdquisicion", "valorActual",
      // Compras integration refs
      "proveedorId", "proveedorRef", "ordenCompraRef",
      "garantiaFecha", "garantiaDetalles",
      "ultimoMantenimientoFecha", "proximoMantenimientoFecha",
      "observaciones",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

  mantoUbicaciones: {
    sheetName: "MantoUbicaciones",
    columns: [
      "id", "wsId", "codigo", "nombre",
      "tipo", "descripcion", "area",
      "responsableId",
      "estado",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

  mantoPlanes: {
    sheetName: "MantoPlanes",
    columns: [
      "id", "wsId", "codigo", "nombre",
      "tipo", "activoId", "activoRef",
      "frecuencia", "descripcion", "procedimiento",
      "duracionHoras", "costoEstimado",
      "tecnicoAsignadoId",
      "fechaInicio", "fechaFin",
      "estado", "cumplimientoPct",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

  mantoSolicitudes: {
    sheetName: "MantoSolicitudes",
    columns: [
      "id", "wsId", "codigo",
      "solicitanteId", "unidadSolicitante",
      "tipo", "prioridad",
      "titulo", "descripcion",
      "activoId", "activoRef",
      "ubicacionId", "ubicacionRef",
      "estado",
      "fechaSolicitud", "fechaRequerida",
      "aprobadoPorId", "fechaAprobacion",
      "ordenTrabajoId",
      "notas",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

  mantoOrdenesTrabajo: {
    sheetName: "MantoOrdenesTrabajo",
    columns: [
      "id", "wsId", "codigo",
      "solicitudId", "planId",
      "tipo", "prioridad",
      "titulo", "descripcion",
      "activoId", "activoRef",
      "ubicacionId", "ubicacionRef",
      "tecnicoAsignadoId", "tecnicoRef",
      "estado", "etapaActual",
      "fechaEmision", "fechaEstimadaFin", "fechaInicio", "fechaCierre",
      "horasEstimadas", "horasReales",
      "diagnostico", "solucion",
      "costoManoObra", "costoMateriales", "costoTotal",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

  mantoInspecciones: {
    sheetName: "MantoInspecciones",
    columns: [
      "id", "wsId", "codigo",
      "activoId", "activoRef",
      "ubicacionId", "ubicacionRef",
      "tipo", "estado",
      "tecnicoId", "tecnicoRef",
      "fechaProgramada", "fechaEjecucion",
      "hallazgos", "recomendaciones",
      "condicion", "requiereOrden",
      "ordenGeneradaId",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

  mantoHistorial: {
    sheetName: "MantoHistorial",
    columns: [
      "id", "wsId",
      "activoId",
      "tipo", "descripcion",
      "ordenId", "inspeccionId",
      "tecnicoId",
      "fecha", "costo",
      "dataJson", "createdBy", "createdAt", "updatedAt"
    ],
  },

  mantoCostos: {
    sheetName: "MantoCostos",
    columns: [
      "id", "wsId",
      "ordenId", "activoId", "activoRef",
      "tipo", "concepto",
      "monto", "moneda",
      // Contabilidad integration refs
      "compromisoId", "facturaId",
      "proveedor",
      "fecha", "aprobado",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

  mantoInventarioTecnico: {
    sheetName: "MantoInventarioTecnico",
    columns: [
      "id", "wsId", "codigo",
      "nombre", "descripcion",
      "categoria", "unidadMedida",
      "stockActual", "stockMinimo",
      "ubicacionAlmacen",
      "activoId",
      // Compras integration refs
      "ordenCompraId", "proveedorId",
      "estado", "valorUnitario",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

};

/**
 * Register all mantenimiento entity schemas into the global ENTITY_SHEETS.
 * Called from Code.js bootstrap and initializeDatabase().
 */
function mergeMantenimientoEntities_() {
  var count = 0;
  for (var key in MANTENIMIENTO_ENTITY_SHEETS) {
    if (Object.prototype.hasOwnProperty.call(MANTENIMIENTO_ENTITY_SHEETS, key)) {
      ENTITY_SHEETS[key] = MANTENIMIENTO_ENTITY_SHEETS[key];
      count++;
    }
  }
  AppLogger.info("mergeMantenimientoEntities_: merged mantenimiento entities", { count: count });
}
