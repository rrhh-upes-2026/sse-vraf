/**
 * Compras entity schema definitions — Procurement & Purchasing.
 *
 * All purchasing documents are stored in dedicated sheets. Complex nested
 * objects are kept in a "dataJson" column so the row-level columns remain
 * thin and queryable.
 *
 * Call mergeComprasEntities_() once during initialization (Code.js bootstrap
 * and initializeDatabase) to register these sheets in the global ENTITY_SHEETS.
 */

var COMPRAS_ENTITY_SHEETS = {
  comprasSolicitudes: {
    sheetName: "ComprasSolicitudes",
    columns: [
      "id", "wsId", "titulo", "tipo", "descripcion",
      "solicitanteId", "unidadSolicitante",
      "prioridad", "estado", "etapaActual", "requisicionId",
      "monto", "montoAprobado", "fechaSolicitud", "fechaRequerida",
      "notas", "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },
  comprasRequisiciones: {
    sheetName: "ComprasRequisiciones",
    columns: [
      "id", "wsId", "solicitudId", "codigo",
      "descripcion", "especificaciones", "cantidad", "unidadMedida",
      "presupuestoEstimado", "cuentaPresupuestal",
      "estado", "aprobadoPorId", "fechaAprobacion",
      "cotizacionId", "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },
  comprasCotizaciones: {
    sheetName: "ComprasCotizaciones",
    columns: [
      "id", "wsId", "requisicionId", "proveedorId", "codigoCotizacion",
      "monto", "moneda", "plazoEntregaDias",
      "formaPago", "garantia", "vigenciaDias",
      "estado", "seleccionada", "notasTecnicas", "notasEvaluacion",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },
  comprasProveedores: {
    sheetName: "ComprasProveedores",
    columns: [
      "id", "wsId", "razonSocial", "nombreComercial", "nit", "nrc",
      "tipoProveedor", "categoria", "contactoNombre", "contactoEmail", "contactoTel",
      "direccion", "pais", "calificacion", "estado", "observaciones",
      "ultimaCompraFecha", "totalCompras", "cantidadOrdenes",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },
  comprasOrdenes: {
    sheetName: "ComprasOrdenes",
    columns: [
      "id", "wsId", "codigo", "requisicionId", "proveedorId",
      "cotizacionSeleccionadaId", "monto", "moneda", "plazoEntregaDias",
      "fechaEmision", "fechaEntregaEsperada", "fechaEntregaReal",
      "estado", "autorizadoPorId", "fechaAutorizacion",
      "formaPago", "terminosEntrega",
      "facturaNro", "montoFactura", "fechaFactura",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },
  comprasRecepciones: {
    sheetName: "ComprasRecepciones",
    columns: [
      "id", "wsId", "ordenId", "codigo",
      "cantidadRecibida", "cantidadSolicitada", "unidadMedida",
      "condicion", "observaciones",
      "receptorId", "fechaRecepcion",
      "actaRecepcionId", "estado",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },
  comprasEvaluaciones: {
    sheetName: "ComprasEvaluaciones",
    columns: [
      "id", "wsId", "proveedorId", "ordenId", "periodo",
      "calidadPuntaje", "tiempoEntregaPuntaje", "cumplimientoPuntaje",
      "comunicacionPuntaje", "precioCompetitividadPuntaje",
      "puntajeTotal", "calificacionGlobal",
      "recomendacion", "observaciones", "evaluadorId",
      "dataJson", "createdBy", "createdAt", "updatedAt"
    ],
  },
};

/**
 * Register all compras entity schemas into the global ENTITY_SHEETS.
 * Must be called before any compras CRUD — typically from Code.js bootstrap
 * and initializeDatabase().
 */
function mergeComprasEntities_() {
  var count = 0;
  for (var key in COMPRAS_ENTITY_SHEETS) {
    if (Object.prototype.hasOwnProperty.call(COMPRAS_ENTITY_SHEETS, key)) {
      ENTITY_SHEETS[key] = COMPRAS_ENTITY_SHEETS[key];
      count++;
    }
  }
  AppLogger.info("mergeComprasEntities_: merged compras entities", { count: count });
}
