/**
 * HR domain types — Sprint 4.
 * These extend the core entity model with RRHH-specific data.
 * All HR entities flow through the adapter layer (never imported directly in components).
 */

import type { WorkspaceId } from "@/config/nav";

export type EmpleadoCategoria = "ejecutivo" | "profesional" | "tecnico" | "administrativo" | "operativo";
export type EmpleadoEstado    = "activo" | "inactivo" | "suspendido" | "retirado";
export type TipoContrato      = "indefinido" | "plazo_fijo" | "eventual" | "honorarios";

export interface Empleado {
  id: string; // EMP-UNIT-YY-SEQ
  usuarioId?: string; // -> Usuario (if they have system access)
  unidadId: WorkspaceId;
  nombres: string;
  apellidos: string;
  email: string;
  dui?: string;
  fechaNacimiento?: string;
  telefono?: string;
  cargo: string;
  categoria: EmpleadoCategoria;
  tipoContrato: TipoContrato;
  fechaIngreso: string;
  fechaEgreso?: string;
  estado: EmpleadoEstado;
  salario: number;
  diasVacacionesPendientes?: number;
  evaluacionUltimaPuntuacion?: number;
  capacitacionesCompletas?: number;
  avatarInitials?: string;
  createdAt: string;
}

export interface ContratoEmpleado {
  id: string;
  empleadoId: string;
  tipo: TipoContrato;
  fechaInicio: string;
  fechaFin?: string;
  salario: number;
  cargo: string;
  estado: "activo" | "vencido" | "rescindido";
  driveFileId?: string;
  createdAt: string;
}

export type EtapaContratacion =
  | "solicitud"
  | "revision"
  | "publicacion"
  | "recepcion_candidatos"
  | "evaluacion"
  | "entrevistas"
  | "seleccion"
  | "aprobacion"
  | "contratacion"
  | "onboarding";

export const ETAPAS_CONTRATACION: Record<EtapaContratacion, { label: string; orden: number }> = {
  solicitud:           { label: "Solicitud",           orden: 1 },
  revision:            { label: "Revisión",            orden: 2 },
  publicacion:         { label: "Publicación",         orden: 3 },
  recepcion_candidatos:{ label: "Recepción",           orden: 4 },
  evaluacion:          { label: "Evaluación",          orden: 5 },
  entrevistas:         { label: "Entrevistas",         orden: 6 },
  seleccion:           { label: "Selección",           orden: 7 },
  aprobacion:          { label: "Aprobación",          orden: 8 },
  contratacion:        { label: "Contratación",        orden: 9 },
  onboarding:          { label: "Onboarding",          orden: 10 },
};

export interface SolicitudContratacion {
  id: string; // CONT-YY-SEQ
  unidadId: WorkspaceId;
  procesoId: string; // -> ProcesoInstitucional
  cargo: string;
  categoria: EmpleadoCategoria;
  justificacion: string;
  tipoContrato: TipoContrato;
  salarioPropuesto: number;
  responsableId: string; // -> Usuario (HR)
  solicitanteId: string; // -> Usuario (requesting unit head)
  etapaActual: EtapaContratacion;
  candidatos?: number;
  candidatoSeleccionadoId?: string;
  fechaCreacion: string;
  fechaObjetivo?: string;
  observaciones?: string;
}

export interface CapacitacionEmpleado {
  id: string;
  empleadoId: string;
  nombre: string;
  tipo: "interna" | "externa" | "virtual" | "certificacion";
  proveedor: string;
  fechaInicio: string;
  fechaFin: string;
  duracionHoras: number;
  estado: "programada" | "en_progreso" | "completada" | "cancelada";
  certificado?: boolean;
  driveFileId?: string;
}

export type EvaluacionNivel = "excelente" | "bueno" | "aceptable" | "deficiente";

export interface EvaluacionDesempeno {
  id: string;
  empleadoId: string;
  periodo: string;
  evaluadorId: string;
  puntuacion: number; // 0–100
  nivel: EvaluacionNivel;
  fortalezas?: string;
  areasOportunidad?: string;
  metasSiguientePeriodo?: string;
  estado: "borrador" | "enviada" | "aprobada";
  driveFileId?: string;
  fecha: string;
}

export interface AccionPersonal {
  id: string;
  empleadoId: string;
  tipo: "aumento" | "ascenso" | "traslado" | "suspension" | "reconocimiento" | "amonestacion" | "egreso";
  descripcion: string;
  efectoEconomico?: number;
  fechaEfectiva: string;
  aprobadoPor: string;
  estado: "pendiente" | "aprobada" | "rechazada";
  driveFileId?: string;
  createdAt: string;
}
