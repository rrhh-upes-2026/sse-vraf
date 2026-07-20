/**
 * Contabilidad entity schema definitions — Accounting & Finance.
 *
 * Budget commitments, accounting journals, invoices, payments, bank
 * reconciliations, accounts payable, and accounts receivable are each stored
 * in dedicated sheets. Complex nested objects go in "dataJson" so row-level
 * columns stay thin and queryable.
 *
 * Integration points with Compras (read-only references, no data duplication):
 *   ordenCompraId  → comprasOrdenes.id
 *   recepcionId    → comprasRecepciones.id
 *   proveedorId    → comprasProveedores.id
 *
 * Call mergeContabilidadEntities_() once during bootstrap (Code.js) and
 * initializeDatabase() to register these sheets in the global ENTITY_SHEETS.
 */

var CONTABILIDAD_ENTITY_SHEETS = {

  contaCompromisos: {
    sheetName: "ContaCompromisos",
    columns: [
      "id", "wsId", "numero", "concepto",
      "tipo", "monto", "moneda",
      "cuentaPresupuestal", "centroCosto", "partida",
      "estado", "etapa",
      // Compras integration refs (no duplication — foreign keys only)
      "ordenCompraId", "ordenCompraRef",
      "proveedorId",   "proveedorRef",
      "fechaCompromiso", "fechaVencimiento",
      "montoEjecutado", "saldo",
      "aprobadoPorId", "fechaAprobacion",
      "observaciones",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

  contaRegistros: {
    sheetName: "ContaRegistros",
    columns: [
      "id", "wsId", "numero", "tipo",
      "descripcion", "cuentaDebito", "cuentaCredito",
      "monto", "moneda", "centroCosto",
      "referenciaId", "referenciaDoc",
      "estado", "fechaAsiento", "periodo",
      // Integration refs
      "compromisoId", "facturaId", "pagoId",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

  contaFacturas: {
    sheetName: "ContaFacturas",
    columns: [
      "id", "wsId", "numero", "serie", "tipo",
      // Compras integration refs
      "proveedorId", "proveedorRef",
      "ordenCompraId", "recepcionId",
      "fechaFactura", "fechaVencimiento", "fechaRecepcion",
      "monto", "montoIva", "montoTotal", "moneda",
      "estado", "metodoPago",
      "cuentaPagarId", "compromisoId",
      "observaciones",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

  contaPagos: {
    sheetName: "ContaPagos",
    columns: [
      "id", "wsId", "numeroPago", "tipo",
      // Integration refs
      "facturaId", "proveedorId", "proveedorRef",
      "monto", "moneda",
      "estado",
      "fechaSolicitud", "fechaAprobacion", "fechaEjecucion",
      "aprobadoPorId", "ejecutadoPorId",
      "referenciaBancaria", "cuentaBancaria", "concepto",
      "registroId",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

  contaConciliaciones: {
    sheetName: "ContaConciliaciones",
    columns: [
      "id", "wsId", "periodo", "cuenta", "banco",
      "saldoBanco", "saldoLibros", "diferencia",
      "estado", "fechaInicio", "fechaCierre",
      "observaciones",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

  contaCuentasPagar: {
    sheetName: "ContaCuentasPagar",
    columns: [
      "id", "wsId", "codigo",
      // Integration refs
      "proveedorId", "proveedorRef",
      "facturaId", "ordenCompraId",
      "monto", "montoPagado", "saldo", "moneda",
      "estado", "fechaEmision", "fechaVencimiento", "fechaPago",
      "diasPlazo", "prioridad",
      "observaciones",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

  contaCuentasCobrar: {
    sheetName: "ContaCuentasCobrar",
    columns: [
      "id", "wsId", "codigo",
      "clienteRef", "concepto",
      "monto", "montoCobrado", "saldo", "moneda",
      "estado", "fechaEmision", "fechaVencimiento", "fechaCobro",
      "diasPlazo",
      "observaciones",
      "dataJson", "createdBy", "createdAt", "updatedAt", "deletedAt"
    ],
  },

};

/**
 * Register all contabilidad entity schemas into the global ENTITY_SHEETS.
 * Must be called before any contabilidad CRUD — from Code.js bootstrap
 * and initializeDatabase().
 */
function mergeContabilidadEntities_() {
  var count = 0;
  for (var key in CONTABILIDAD_ENTITY_SHEETS) {
    if (Object.prototype.hasOwnProperty.call(CONTABILIDAD_ENTITY_SHEETS, key)) {
      ENTITY_SHEETS[key] = CONTABILIDAD_ENTITY_SHEETS[key];
      count++;
    }
  }
  AppLogger.info("mergeContabilidadEntities_: merged contabilidad entities", { count: count });
}
