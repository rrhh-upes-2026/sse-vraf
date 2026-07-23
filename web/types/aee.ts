// AEE — Activity Execution Engine types
// SCOPE: execution recording ONLY.
// No evidence, no compliance, no indicator modification.

export type AEEStatus =
  | "Pendiente"
  | "En ejecución"
  | "Finalizada"
  | "Finalizada con observaciones"
  | "Reprogramada"
  | "Cancelada"
  | "No ejecutada";

export interface AEEExecution {
  id: string;
  wsId: string;
  // APE reference
  planId: string;
  // PME references (denormalized)
  activityId?: string;
  procedureId?: string;
  processId?: string;
  organizationalUnitId?: string;
  // Sequence
  executionNumber: string;
  // Temporal
  executionDate: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: string | number;
  // Responsibility
  executedBy: string;
  responsiblePosition?: string;
  // Status & result
  status: AEEStatus;
  executionResult?: string;
  // Notes
  completionNotes?: string;
  observations?: string;
  // Incidents & risks
  requiresEvidence?: string | boolean;
  hasEvidence?: string | boolean;
  riskDetected?: string;
  incidentReported?: string | boolean;
  // Approval architecture (Sprint 005+)
  requiresApproval?: string | boolean;
  approvedBy?: string;
  approvalDate?: string;
  // Audit
  createdBy?: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface AEEExecutionHistory {
  id: string;
  wsId: string;
  ejecucionId: string;
  accion: "creado" | "actualizado" | "estado_cambiado" | "archivado";
  estadoAnterior?: string;
  estadoNuevo?: string;
  usuario: string;
  detalle: string;
  createdAt: string;
}

export interface AEECatalogo {
  id: string;
  wsId: string;
  tipo: "resultadoEjecucion" | "nivelRiesgo";
  valor: string;
  etiqueta: string;
  activo: string | boolean;
  orden: string | number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AEEDashboard {
  total: number;
  today: number;
  pending: number;
  inProgress: number;
  withIncidents: number;
  rescheduled: number;
  avgDurationMinutes: number;
  byStatus: Record<string, number>;
  byUser: Record<string, number>;
  byProcess: Record<string, number>;
  todayExecutions: AEEExecution[];
  pendingExecutions: AEEExecution[];
  inProgressExecutions: AEEExecution[];
}

export interface AEEMisActividades {
  total: number;
  items: import("@/types/ape").APEPlan[];
}

export interface AEECreateParams {
  planId: string;
  activityId?: string;
  procedureId?: string;
  processId?: string;
  organizationalUnitId?: string;
  executionDate: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: string | number;
  executedBy: string;
  responsiblePosition?: string;
  status?: AEEStatus;
  executionResult?: string;
  completionNotes?: string;
  observations?: string;
  requiresEvidence?: boolean;
  riskDetected?: string;
  incidentReported?: boolean;
  requiresApproval?: boolean;
}

// Valid state transitions (mirrors backend VALID_TRANSITIONS)
export const AEE_VALID_TRANSITIONS: Record<AEEStatus, AEEStatus[]> = {
  "Pendiente":                   ["En ejecución", "Reprogramada", "Cancelada", "No ejecutada"],
  "En ejecución":                ["Finalizada", "Finalizada con observaciones", "Reprogramada", "Cancelada"],
  "Finalizada":                  [],
  "Finalizada con observaciones": [],
  "Reprogramada":                ["Pendiente", "Cancelada"],
  "Cancelada":                   [],
  "No ejecutada":                ["Pendiente"],
};
