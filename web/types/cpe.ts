// CPE — Compliance & Performance Engine

export type CPEComplianceStatus = "Verde" | "Amarillo" | "Naranja" | "Rojo";
export type CPERiskLevel = "Muy Bajo" | "Bajo" | "Medio" | "Alto" | "Crítico";
export type CPEPlanStatus = "Pendiente" | "En proceso" | "Completado" | "Cancelado" | "Pausado";
export type CPEPlanPriority = "Crítica" | "Alta" | "Media" | "Baja";
export type CPECatalogoTipo =
  | "pesoCumplimiento"
  | "semaforo"
  | "rangoRiesgo"
  | "estadoPlanMejora"
  | "prioridadPlan";

export interface CPESnapshot {
  id: string;
  wsId: string;
  snapshotDate: string;
  year: number;
  month: number;
  organizationalUnitId?: string;
  processId?: string;
  procedureId?: string;
  activityId?: string;
  planId?: string;
  executionId?: string;
  indicatorId?: string;
  plannedActivities: number;
  executedActivities: number;
  validatedEvidence: number;
  requiredEvidence: number;
  planningScore: number;
  executionScore: number;
  documentationScore: number;
  indicatorScore: number | null;
  overallScore: number;
  complianceStatus: CPEComplianceStatus;
  riskLevel: CPERiskLevel;
  calculatedAt: string;
  calculatedBy: string;
  createdAt: string;
}

export interface CPEPlanMejora {
  id: string;
  wsId: string;
  relatedComplianceId?: string;
  title: string;
  description: string;
  priority: CPEPlanPriority;
  responsible: string;
  targetDate: string;
  status: CPEPlanStatus;
  progress: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CPEHistorial {
  id: string;
  wsId: string;
  tipoCalculo: string;
  duracion: number;
  registrosAnalizados: number;
  resultado: string;
  usuario: string;
  createdAt: string;
}

export interface CPECatalogo {
  id: string;
  wsId: string;
  tipo: CPECatalogoTipo;
  valor: string;
  etiqueta: string;
  activo: string;
  orden: number;
  peso?: number;
  umbralMin?: number;
  umbralMax?: number;
  scoreMin?: number;
  scoreMax?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CPEBrecha {
  tipo: "actividad_no_ejecutada" | "evidencia_faltante" | "evidencia_rechazada" | "indicador_sin_datos" | "proceso_sin_plan";
  descripcion: string;
  severidad: "alta" | "media" | "baja";
  entidadId?: string;
  entidadTipo?: string;
  fechaDeteccion: string;
}

export interface CPEDashboard {
  snapshotActual: CPESnapshot | null;
  tendencia: CPESnapshot[];
  brechas: CPEBrecha[];
  planesActivos: number;
  planesVencidos: number;
  ultimoCalculo: string | null;
}

export interface CPEPesosConfig {
  planificacion: number;
  ejecucion: number;
  documentacion: number;
  indicadores: number;
}

export interface CPESemaforoConfig {
  verde: number;
  amarillo: number;
  naranja: number;
  rojo: number;
}

export interface CPEConfig {
  pesos: CPEPesosConfig;
  semaforo: CPESemaforoConfig;
  catalogos: CPECatalogo[];
  isDefault: boolean;
}

export interface CPECalcularParams {
  wsId: string;
  year: number;
  month: number;
  userId?: string;
}

export interface CPECreatePlanParams {
  title: string;
  description: string;
  priority: CPEPlanPriority;
  responsible: string;
  targetDate: string;
  relatedComplianceId?: string;
  notes?: string;
}

export interface CPEUpdatePlanParams {
  title?: string;
  description?: string;
  priority?: CPEPlanPriority;
  responsible?: string;
  targetDate?: string;
  status?: CPEPlanStatus;
  progress?: number;
  notes?: string;
}
