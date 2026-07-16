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

export interface PlanEstrategico {
  id: string; // RUI: no aplica patrón corto — plan institucional único por período
  nombre: string;
  periodoInicio: string; // ISO date
  periodoFin: string; // ISO date
  descripcion?: string;
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
