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
