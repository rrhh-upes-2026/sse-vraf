// APE — Activity Planning Engine types
// SCOPE: planning ONLY. No tracking, execution state, or compliance.

export type APEStatus =
  | "Programada"
  | "Próxima"
  | "Pendiente"
  | "Archivada"
  | "Cancelada";

export type APEPriority = "Alta" | "Media" | "Baja";

export type APEPeriodicity =
  | "Única"
  | "Diaria"
  | "Semanal"
  | "Quincenal"
  | "Mensual"
  | "Bimestral"
  | "Trimestral"
  | "Cuatrimestral"
  | "Semestral"
  | "Anual"
  | "Personalizada";

export interface APEPlan {
  id: string;
  wsId: string;
  // PME references
  activityId: string;
  processId?: string;
  procedureId?: string;
  organizationalUnitId?: string;
  // Plan description
  title: string;
  description?: string;
  year: string;
  // Temporal scope
  plannedStartDate: string;
  plannedEndDate: string;
  // Temporal classification
  plannedMonth?: string;
  plannedQuarter?: string;
  plannedSemester?: string;
  plannedWeek?: string;
  plannedExecutionNumber?: string;
  // Periodicity (copied from activity at generation time)
  periodicity: APEPeriodicity;
  // Responsibility
  responsibleUser?: string;
  responsiblePosition?: string;
  // Planning metadata
  priority: APEPriority;
  status: APEStatus;
  plannedHours?: string | number;
  // Future-engine hooks
  dependencies?: string;
  notes?: string;
  // Audit
  createdBy?: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface APEHistorial {
  id: string;
  wsId: string;
  planId: string;
  accion:
    | "generado"
    | "actualizado"
    | "programado"
    | "proximo"
    | "pendiente"
    | "archivado"
    | "cancelado"
    | "regenerado";
  usuario: string;
  detalle: string;
  createdAt: string;
}

export interface APEOccurrence {
  startDate: string;
  endDate: string;
  month: number;
  quarter: number;
  semester: number;
  week: number;
  number: number;
}

export interface APEPreview {
  count: number;
  occurrences: APEOccurrence[];
}

export interface APEGenerateResult {
  created: number;
  plans: APEPlan[];
}

export interface APEGenerateParams {
  activityId: string;
  year: string | number;
  periodicity: APEPeriodicity;
  mode?: "nuevo" | "regenerar" | "mantener" | "duplicar";
  title?: string;
  description?: string;
  processId?: string;
  procedureId?: string;
  organizationalUnitId?: string;
  responsibleUser?: string;
  responsiblePosition?: string;
  priority?: APEPriority;
  plannedHours?: string | number;
  customDates?: string;
}

export interface APEDashboard {
  year: string;
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byMonth: Record<string, number>;
  byUnit: Record<string, number>;
  byUser: Record<string, number>;
  upcoming: APEPlan[];
}
