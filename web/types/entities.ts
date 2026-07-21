/**
 * Entidades de negocio — MASTER HANDOFF §06 "Modelo de datos".
 * 12 entidades, sin duplicar campos entre módulos (R01 — capturar una sola vez).
 * Estos tipos son el contrato entre UI, Services y el adapter de Apps Script;
 * no dependen de Sheets/Drive concretos (esa capa vive en services/adapters).
 */

import type { RoleCode } from "./roles";
import type { WorkspaceId } from "@/config/nav";

export type SemaforoColor = "verde" | "amarillo" | "rojo";

export type EstadoProceso =
  | "borrador"
  | "activo"
  | "en_riesgo"
  | "completado"
  | "archivado";

/** Cadena obligatoria — MASTER HANDOFF §02. Todo elemento pertenece a ella o no existe. */

export type TipoPlan = "estrategico" | "operativo" | "mejora" | "accion";
export type EstadoPlan = "borrador" | "revision" | "aprobado" | "vigente" | "cerrado";

export interface PlanEstrategico {
  id: string; // RUI: no aplica patrón corto — plan institucional único por período
  wsId: string;
  nombre: string;
  tipo: TipoPlan;
  estado: EstadoPlan;
  periodoInicio: string; // ISO date
  periodoFin: string; // ISO date
  descripcion?: string;
  responsableId?: string;
  avancePct: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

export interface VRAFDashboardResumen {
  planes: number;
  indicadores: number;
  semaforoKPIs: { verde: number; amarillo: number; rojo: number };
  proyectos: number;
  solicitudes: number;
  procesosActivos: number;
}

export interface ObjetivoEstrategico {
  id: string;
  planId: string; // -> PlanEstrategico
  nombre: string;
  descripcion?: string;
}

export interface ProyectoEstrategico {
  id: string;
  objetivoId: string; // -> ObjetivoEstrategico
  nombre: string;
  descripcion?: string;
  unidadId: WorkspaceId;
}

/** NÚCLEO del sistema — objeto inteligente central. No sustituir por "tarea". */
export interface ProcesoInstitucional {
  id: string; // RUI: PROC-[UNIT]-[YY]-[SEQ]
  proyectoId: string; // -> ProyectoEstrategico (R03: obligatorio)
  unidadId: WorkspaceId;
  nombre: string;
  tipo: "estrategico" | "misional" | "apoyo" | "operativo";
  objetivo: string;
  alcance: string;
  responsableId: string; // -> Usuario
  clientesInternos?: string[];
  clientesExternos?: string[];
  normativaAsociada?: string[];
  estado: EstadoProceso;
  avancePct: number; // 0-100
  semaforo: SemaforoColor;
  fechaInicio: string;
  fechaLimite: string;
  slaDias: number;
  prioridad: "baja" | "media" | "alta" | "critica";
  ultimaActualizacion: string;
  createdAt: string;
  deletedAt: string | null; // soft-delete — R06
}

/** Toda actividad pertenece obligatoriamente a un Proceso — R02. Nunca aislada. */
export interface Actividad {
  id: string; // RUI: ACT-[PROC_ID]-[SEQ]
  procesoId: string; // -> ProcesoInstitucional
  etapaId?: string; // etapa del Golden Workflow, si aplica
  nombre: string;
  descripcion?: string;
  responsableId: string; // -> Usuario
  tiempoEsperadoHoras?: number;
  dependenciaId?: string; // -> Actividad
  prioridad: "baja" | "media" | "alta";
  estado: "pendiente" | "en_progreso" | "completada" | "bloqueada";
  puntoControl?: string;
  orden: number;
}

export type TipoEvidencia =
  | "documento"
  | "formulario"
  | "archivo"
  | "registro"
  | "fotografia"
  | "acta"
  | "contrato"
  | "informe"
  | "comprobante"
  | "otro";

export interface Evidencia {
  id: string; // RUI: EV-[ACT_ID]-[SEQ]
  actividadId: string; // -> Actividad
  nombre: string;
  tipo: TipoEvidencia;
  obligatoria: boolean;
  estado: "pendiente" | "cargada" | "validada" | "rechazada";
  driveFileId?: string; // metadata only — el archivo vive en Drive, nunca en Sheets
  version: number;
  responsableId: string;
  fechaCarga?: string;
  observaciones?: string;
}

export interface Indicador {
  id: string; // RUI: KPI-[UNIT]-[SEQ]
  procesoId: string; // -> ProcesoInstitucional
  procedimientoId?: string;
  nombre: string;
  objetivo: string;
  descripcion: string;
  categoria: "gestion" | "desempeno";
  formula: string;
  unidadMedida: string;
  meta: number;
  valorActual: number;
  frecuencia: "mensual" | "trimestral" | "semestral" | "anual";
  responsableId: string;
  fuenteInformacion: string;
  evidenciaRequeridaId?: string;
  dashboardDestino: string;
  reporteDestino: string;
  automatizacionId?: string;
  semaforo: SemaforoColor;
  tendencia: "sube" | "baja" | "estable";
  ultimaActualizacion: string;
}

/** JSON Schema — R07. FormRenderer lo interpreta dinámicamente, sin código nuevo. */
export interface Formulario {
  id: string; // RUI: FORM-[UNIT]-[SEQ]-v[VER]
  nombre: string;
  unidadId: WorkspaceId;
  version: string;
  estado: "borrador" | "publicado" | "archivado";
  schema: Record<string, unknown>; // JSON Schema del formulario
  entidadGeneradaId?: string; // -> Entidad en Data Studio (FORM_PUBLISHED)
  guardadoEnBiblioteca: boolean;
  autor: string;
  fecha: string;
  comentarios?: string;
}

export interface Solicitud {
  id: string; // RUI: SOL-[UNIT]-[YY]-[SEQ]
  procesoId: string;
  unidadId: WorkspaceId;
  asunto: string;
  solicitanteId: string;
  responsableId: string;
  estado: "abierta" | "en_atencion" | "cerrada";
  fechaCreacion: string;
  fechaCierre?: string;
  tiempoRespuestaHoras?: number;
  satisfaccion?: number; // 1-5
}

export interface Usuario {
  id: string; // RUI: USR-[UNIT]-[SEQ]
  nombre: string;
  email: string;
  unidadId: WorkspaceId;
  rol: RoleCode;
  activo: boolean;
  avatarInitials: string;
}

export interface Unidad {
  id: WorkspaceId;
  nombre: string;
  responsableId?: string;
}

// ── Compras domain entities ───────────────────────────────────────────────────

export type ComprasPrioridad = "normal" | "urgente" | "critica";
export type ComprasEstadoSolicitud =
  | "pendiente" | "en_revision" | "aprobada" | "rechazada" | "archivada";
export type ComprasEstadoOrden =
  | "borrador" | "emitida" | "recibida" | "pagada" | "cancelada";
export type ComprasEstadoProveedor = "activo" | "inactivo" | "suspendido";
export type ComprasCalificacion = "A" | "B" | "C" | "D";

export interface ComprasSolicitud {
  id: string;
  wsId: string;
  titulo: string;
  tipo: string;
  descripcion?: string;
  solicitanteId: string;
  unidadSolicitante?: string;
  prioridad: ComprasPrioridad;
  estado: ComprasEstadoSolicitud;
  etapaActual: string;
  requisicionId?: string;
  monto?: number;
  montoAprobado?: number;
  fechaSolicitud: string;
  fechaRequerida?: string;
  notas?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ComprasRequisicion {
  id: string;
  wsId: string;
  solicitudId: string;
  codigo?: string;
  descripcion: string;
  especificaciones?: string;
  cantidad?: number;
  unidadMedida?: string;
  presupuestoEstimado?: number;
  cuentaPresupuestal?: string;
  estado: "pendiente" | "aprobada" | "rechazada" | "completada";
  aprobadoPorId?: string;
  fechaAprobacion?: string;
  cotizacionId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ComprasCotizacion {
  id: string;
  wsId: string;
  requisicionId: string;
  proveedorId: string;
  codigoCotizacion?: string;
  monto: number;
  moneda: string;
  plazoEntregaDias?: number;
  formaPago?: string;
  garantia?: string;
  vigenciaDias?: number;
  estado: "pendiente" | "evaluada" | "seleccionada" | "rechazada";
  seleccionada: boolean;
  notasTecnicas?: string;
  notasEvaluacion?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ComprasProveedor {
  id: string;
  wsId: string;
  razonSocial: string;
  nombreComercial?: string;
  nit?: string;
  nrc?: string;
  tipoProveedor?: string;
  categoria?: string;
  contactoNombre?: string;
  contactoEmail?: string;
  contactoTel?: string;
  direccion?: string;
  pais?: string;
  calificacion?: ComprasCalificacion;
  estado: ComprasEstadoProveedor;
  observaciones?: string;
  ultimaCompraFecha?: string;
  totalCompras?: number;
  cantidadOrdenes?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ComprasOrden {
  id: string;
  wsId: string;
  codigo?: string;
  requisicionId: string;
  proveedorId: string;
  cotizacionSeleccionadaId?: string;
  monto: number;
  moneda: string;
  plazoEntregaDias?: number;
  fechaEmision: string;
  fechaEntregaEsperada?: string;
  fechaEntregaReal?: string;
  estado: ComprasEstadoOrden;
  autorizadoPorId?: string;
  fechaAutorizacion?: string;
  formaPago?: string;
  terminosEntrega?: string;
  facturaNro?: string;
  montoFactura?: number;
  fechaFactura?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ComprasRecepcion {
  id: string;
  wsId: string;
  ordenId: string;
  codigo?: string;
  cantidadRecibida: number;
  cantidadSolicitada?: number;
  unidadMedida?: string;
  condicion: "buena" | "regular" | "rechazada";
  observaciones?: string;
  receptorId: string;
  fechaRecepcion: string;
  actaRecepcionId?: string;
  estado: "registrada" | "validada" | "con_observaciones";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ComprasEvaluacion {
  id: string;
  wsId: string;
  proveedorId: string;
  ordenId: string;
  periodo?: string;
  calidadPuntaje: number;
  tiempoEntregaPuntaje: number;
  cumplimientoPuntaje: number;
  comunicacionPuntaje: number;
  precioCompetitividadPuntaje: number;
  puntajeTotal: number;
  calificacionGlobal: ComprasCalificacion;
  recomendacion?: string;
  observaciones?: string;
  evaluadorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComprasDashboardResumen {
  solicitudesActivas: number;
  solicitudesUrgentes: number;
  ordenesAbiertas: number;
  ordenesCerradas: number;
  proveedoresActivos: number;
  cotizacionesPendientes: number;
  montoEjecutado: number;
  recepcionesPendientes: number;
}

// ── Contabilidad y Finanzas ────────────────────────────────────────────────────

export type ContaEstadoCompromiso = "borrador" | "comprometido" | "ejecutado" | "anulado";
export type ContaEtapaCompromiso  = "formulacion" | "aprobacion" | "ejecucion" | "cierre";
export type ContaTipoCompromiso   = "gasto" | "inversion" | "transferencia";
export type ContaEstadoFactura    = "pendiente" | "aprobada" | "pagada" | "rechazada" | "anulada";
export type ContaTipoFactura      = "electronica" | "fisica" | "credito_fiscal" | "nota_debito" | "nota_credito";
export type ContaEstadoPago       = "pendiente" | "aprobado" | "ejecutado" | "rechazado" | "anulado";
export type ContaTipoPago         = "transferencia" | "cheque" | "efectivo" | "otros";
export type ContaEstadoConciliacion = "abierta" | "en_proceso" | "cerrada";
export type ContaEstadoCuentaPagar  = "pendiente" | "parcial" | "pagada" | "vencida" | "anulada";
export type ContaEstadoCuentaCobrar = "pendiente" | "parcial" | "cobrada" | "vencida" | "anulada";
export type ContaPrioridad          = "normal" | "urgente" | "critica";

/** Compromiso Presupuestario — vincula Compras con ejecución contable */
export interface ContaCompromiso {
  id: string;
  wsId: string;
  numero?: string;
  concepto: string;
  tipo: ContaTipoCompromiso;
  monto: number;
  moneda: string;
  cuentaPresupuestal?: string;
  centroCosto?: string;
  partida?: string;
  estado: ContaEstadoCompromiso;
  etapa: ContaEtapaCompromiso;
  // Compras integration refs (foreign keys only — no duplication)
  ordenCompraId?: string;
  ordenCompraRef?: string;
  proveedorId?: string;
  proveedorRef?: string;
  fechaCompromiso: string;
  fechaVencimiento?: string;
  montoEjecutado: number;
  saldo: number;
  aprobadoPorId?: string;
  fechaAprobacion?: string;
  observaciones?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/** Registro Contable — asiento en el libro diario */
export interface ContaRegistro {
  id: string;
  wsId: string;
  numero?: string;
  tipo: "ingreso" | "egreso" | "transferencia" | "ajuste";
  descripcion: string;
  cuentaDebito: string;
  cuentaCredito: string;
  monto: number;
  moneda: string;
  centroCosto?: string;
  referenciaId?: string;
  referenciaDoc?: string;
  estado: "borrador" | "aprobado" | "anulado";
  fechaAsiento: string;
  periodo: string;
  compromisoId?: string;
  facturaId?: string;
  pagoId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/** Factura — recibida de proveedor; referencia Compras sin duplicar datos */
export interface ContaFactura {
  id: string;
  wsId: string;
  numero: string;
  serie?: string;
  tipo: ContaTipoFactura;
  // Compras integration refs
  proveedorId: string;
  proveedorRef?: string;
  ordenCompraId?: string;
  recepcionId?: string;
  fechaFactura: string;
  fechaVencimiento?: string;
  fechaRecepcion?: string;
  monto: number;
  montoIva: number;
  montoTotal: number;
  moneda: string;
  estado: ContaEstadoFactura;
  metodoPago?: string;
  cuentaPagarId?: string;
  compromisoId?: string;
  observaciones?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/** Pago — ejecución de desembolso */
export interface ContaPago {
  id: string;
  wsId: string;
  numeroPago?: string;
  tipo: ContaTipoPago;
  facturaId?: string;
  proveedorId?: string;
  proveedorRef?: string;
  monto: number;
  moneda: string;
  estado: ContaEstadoPago;
  fechaSolicitud: string;
  fechaAprobacion?: string;
  fechaEjecucion?: string;
  aprobadoPorId?: string;
  ejecutadoPorId?: string;
  referenciaBancaria?: string;
  cuentaBancaria?: string;
  concepto?: string;
  registroId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/** Conciliación Bancaria */
export interface ContaConciliacion {
  id: string;
  wsId: string;
  periodo: string;
  cuenta: string;
  banco?: string;
  saldoBanco: number;
  saldoLibros: number;
  diferencia: number;
  estado: ContaEstadoConciliacion;
  fechaInicio: string;
  fechaCierre?: string;
  observaciones?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/** Cuenta por Pagar — obligación con proveedor */
export interface ContaCuentaPagar {
  id: string;
  wsId: string;
  codigo?: string;
  proveedorId: string;
  proveedorRef?: string;
  facturaId?: string;
  ordenCompraId?: string;
  monto: number;
  montoPagado: number;
  saldo: number;
  moneda: string;
  estado: ContaEstadoCuentaPagar;
  fechaEmision: string;
  fechaVencimiento?: string;
  fechaPago?: string;
  diasPlazo: number;
  prioridad: ContaPrioridad;
  observaciones?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/** Cuenta por Cobrar — estructura preparada para futuro uso */
export interface ContaCuentaCobrar {
  id: string;
  wsId: string;
  codigo?: string;
  clienteRef: string;
  concepto: string;
  monto: number;
  montoCobrado: number;
  saldo: number;
  moneda: string;
  estado: ContaEstadoCuentaCobrar;
  fechaEmision: string;
  fechaVencimiento?: string;
  fechaCobro?: string;
  diasPlazo: number;
  observaciones?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/** KPIs del Dashboard Ejecutivo de Contabilidad */
export interface ContaDashboardResumen {
  compromisosActivos: number;
  montoCometido: number;
  montoEjecutado: number;
  ejecucionPct: number;
  facturasPendientes: number;
  facturasAprobadas: number;
  facturasPagadas: number;
  pagosPendientes: number;
  montoPagosPendientes: number;
  cuentasPorPagar: number;
  cuentasVencidas: number;
  montoCuentasPagar: number;
  tiempoPromedioPago: number;
  conciliacionesAbiertas: number;
}

// ── Mantenimiento e Infraestructura ──────────────────────────────────────────

export type MantoEstadoActivo = "operativo" | "inactivo" | "mantenimiento" | "baja";
export type MantoCategoriaActivo = "equipo" | "infraestructura" | "vehiculo" | "mobiliario" | "tecnologia" | "otro";
export type MantoTipoMantenimiento = "preventivo" | "correctivo" | "predictivo" | "emergencia";
export type MantoEstadoOrden = "emitida" | "asignada" | "en_proceso" | "completada" | "cancelada";
export type MantoEtapaOrden = "solicitud" | "evaluacion" | "asignacion" | "ejecucion" | "inspeccion" | "completado";
export type MantoEstadoSolicitud = "pendiente" | "aprobada" | "rechazada" | "en_proceso" | "completada";
export type MantoEstadoInspeccion = "programada" | "en_proceso" | "completada" | "cancelada";
export type MantoCondicionActivo = "buena" | "regular" | "deficiente" | "critica";
export type MantoPrioridad = "baja" | "normal" | "alta" | "critica";
export type MantoEstadoPlan = "borrador" | "activo" | "pausado" | "completado";
export type MantoFrecuencia = "diaria" | "semanal" | "mensual" | "trimestral" | "semestral" | "anual";
export type MantoEstadoInventario = "disponible" | "agotado" | "reservado" | "descontinuado";

export interface MantoActivo {
  id: string;
  wsId: string;
  codigo: string;
  nombre: string;
  categoria: MantoCategoriaActivo;
  tipo?: string;
  marca?: string;
  modelo?: string;
  serie?: string;
  descripcion?: string;
  ubicacionId?: string;
  ubicacionRef?: string;
  responsableId?: string;
  estado: MantoEstadoActivo;
  fechaAdquisicion?: string;
  vidaUtilAnios?: number;
  valorAdquisicion?: number;
  valorActual?: number;
  proveedorId?: string;
  proveedorRef?: string;
  ordenCompraRef?: string;
  garantiaFecha?: string;
  garantiaDetalles?: string;
  ultimoMantenimientoFecha?: string;
  proximoMantenimientoFecha?: string;
  observaciones?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface MantoUbicacion {
  id: string;
  wsId: string;
  codigo: string;
  nombre: string;
  tipo: string;
  descripcion?: string;
  area?: string;
  responsableId?: string;
  estado: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface MantoPlan {
  id: string;
  wsId: string;
  codigo: string;
  nombre: string;
  tipo: MantoTipoMantenimiento;
  activoId: string;
  activoRef?: string;
  frecuencia: MantoFrecuencia;
  descripcion?: string;
  procedimiento?: string;
  duracionHoras?: number;
  costoEstimado?: number;
  tecnicoAsignadoId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado: MantoEstadoPlan;
  cumplimientoPct: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface MantoSolicitud {
  id: string;
  wsId: string;
  codigo: string;
  solicitanteId: string;
  unidadSolicitante?: string;
  tipo: MantoTipoMantenimiento;
  prioridad: MantoPrioridad;
  titulo: string;
  descripcion?: string;
  activoId?: string;
  activoRef?: string;
  ubicacionId?: string;
  ubicacionRef?: string;
  estado: MantoEstadoSolicitud;
  fechaSolicitud: string;
  fechaRequerida?: string;
  aprobadoPorId?: string;
  fechaAprobacion?: string;
  ordenTrabajoId?: string;
  notas?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface MantoOrdenTrabajo {
  id: string;
  wsId: string;
  codigo: string;
  solicitudId?: string;
  planId?: string;
  tipo: MantoTipoMantenimiento;
  prioridad: MantoPrioridad;
  titulo: string;
  descripcion?: string;
  activoId?: string;
  activoRef?: string;
  ubicacionId?: string;
  ubicacionRef?: string;
  tecnicoAsignadoId?: string;
  tecnicoRef?: string;
  estado: MantoEstadoOrden;
  etapaActual: MantoEtapaOrden;
  fechaEmision: string;
  fechaEstimadaFin?: string;
  fechaInicio?: string;
  fechaCierre?: string;
  horasEstimadas?: number;
  horasReales?: number;
  diagnostico?: string;
  solucion?: string;
  costoManoObra?: number;
  costoMateriales?: number;
  costoTotal?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface MantoInspeccion {
  id: string;
  wsId: string;
  codigo: string;
  activoId: string;
  activoRef?: string;
  ubicacionId?: string;
  ubicacionRef?: string;
  tipo: string;
  estado: MantoEstadoInspeccion;
  tecnicoId?: string;
  tecnicoRef?: string;
  fechaProgramada: string;
  fechaEjecucion?: string;
  hallazgos?: string;
  recomendaciones?: string;
  condicion?: MantoCondicionActivo;
  requiereOrden?: boolean;
  ordenGeneradaId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface MantoHistorial {
  id: string;
  wsId: string;
  activoId: string;
  tipo: string;
  descripcion: string;
  ordenId?: string;
  inspeccionId?: string;
  tecnicoId?: string;
  fecha: string;
  costo?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MantoCosto {
  id: string;
  wsId: string;
  ordenId?: string;
  activoId?: string;
  activoRef?: string;
  tipo: string;
  concepto: string;
  monto: number;
  moneda: string;
  compromisoId?: string;
  facturaId?: string;
  proveedor?: string;
  fecha: string;
  aprobado?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface MantoInventarioTecnico {
  id: string;
  wsId: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  ubicacionAlmacen?: string;
  activoId?: string;
  ordenCompraId?: string;
  proveedorId?: string;
  estado: MantoEstadoInventario;
  valorUnitario?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface MantoDashboardResumen {
  activos: {
    total: number;
    operativos: number;
    inactivos: number;
    enManto: number;
  };
  ordenes: {
    total: number;
    abiertas: number;
    enProceso: number;
    completadas: number;
  };
  solicitudes: {
    pendientes: number;
  };
  inspecciones: {
    total: number;
  };
  costos: {
    total: number;
  };
  inventario: {
    itemsBajoStock: number;
  };
  preventivo: {
    planesActivos: number;
    cumplimientoPct: number;
  };
}

// ── INSERT-only — R06. Nunca UPDATE/DELETE. ───────────────────────────────────
/** INSERT-only — R06. Nunca UPDATE/DELETE. */
export interface HistorialAudit {
  id: string;
  entidadTipo: string;
  entidadId: string;
  usuarioId: string;
  accion: string;
  resultado: string;
  fecha: string;
  detalle?: Record<string, unknown>;
}
