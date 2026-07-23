// IOE — Institutional Orchestration Engine

export type IOEPlanStatus      = "borrador" | "activo" | "en_riesgo" | "pausado" | "completado" | "archivado";
export type IOEMilestoneStatus = "pendiente" | "en_progreso" | "completado" | "retrasado" | "cancelado";
export type IOETaskStatus      = "pendiente" | "en_progreso" | "completada" | "bloqueada" | "cancelada";
export type IOEDecisionStatus  = "pendiente" | "implementada" | "revertida" | "cancelada";
export type IOEPriority        = "baja" | "media" | "alta" | "critica";
export type IOERiskLevel       = "bajo" | "medio" | "alto" | "critico";
export type IOEOriginEngine    = "iie" | "cpe" | "eip" | "ape" | "aee" | "manual";
export type IOECalendarView    = "mes" | "semana";
export type IOECalendarEventType = "plan" | "hito" | "tarea";
export type IOESourceType =
  | "iie_diagnosis" | "iie_recommendation"
  | "cpe_gap" | "cpe_plan_mejora"
  | "eip_alert" | "manual";

// ─── Future integration contracts (types only) ────────────────────────────────

export type IOEIntegrationTarget = "notification_engine" | "automation_engine" | "collaboration_engine";

export interface IOEIntegrationContract {
  target: IOEIntegrationTarget;
  event: string;
  payload: Record<string, unknown>;
  triggerCondition: string;
}

// ─── Action Plan ──────────────────────────────────────────────────────────────

export interface IOEActionPlan {
  id: string;
  title: string;
  description: string;
  originEngine: IOEOriginEngine;
  originEntityId?: string;
  originEntityLabel?: string;
  organizationalUnitId: string;
  organizationalUnitLabel: string;
  priority: IOEPriority;
  status: IOEPlanStatus;
  objective: string;
  expectedImpact: string;
  riskLevel: IOERiskLevel;
  owner: string;
  startDate: string;
  targetDate: string;
  completionDate?: string;
  progress: number;
  milestoneCount: number;
  taskCount: number;
  completedMilestones: number;
  completedTasks: number;
  overdueTasks: number;
  blockedTasks: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Milestone ────────────────────────────────────────────────────────────────

export interface IOEMilestone {
  id: string;
  actionPlanId: string;
  title: string;
  description?: string;
  plannedDate: string;
  completedDate?: string;
  status: IOEMilestoneStatus;
  weight: number;
  taskCount: number;
  completedTasks: number;
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export interface IOETask {
  id: string;
  actionPlanId: string;
  milestoneId?: string;
  title: string;
  description?: string;
  assignedTo: string;
  priority: IOEPriority;
  status: IOETaskStatus;
  plannedStart: string;
  plannedEnd: string;
  completedAt?: string;
  progress: number;
  dependencies: string[];
  isBlocked: boolean;
  blockReason?: string;
}

// ─── Decision ─────────────────────────────────────────────────────────────────

export interface IOEDecision {
  id: string;
  actionPlanId: string;
  date: string;
  origin: string;
  responsable: string;
  decision: string;
  justification: string;
  expectedResult: string;
  status: IOEDecisionStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface IOEMetrics {
  avgClosureTime: number;
  dateDeviationAvg: number;
  executionIndex: number;
  delayIndex: number;
}

export interface IOEOwnerLoad {
  owner: string;
  activePlans: number;
  activeTasks: number;
  completedTasks: number;
  overdueTasks: number;
  complianceRate: number;
}

export interface IOEUnitLoad {
  unit: string;
  planCount: number;
  taskCount: number;
}

export interface IOEDashboard {
  activePlans: number;
  criticalPlans: number;
  avgProgress: number;
  overduePlans: number;
  lateTasks: number;
  blockedTasks: number;
  metrics: IOEMetrics;
  ownerLoad: IOEOwnerLoad[];
  recentPlans: IOEActionPlan[];
  urgentMilestones: IOEMilestone[];
  unitLoad: IOEUnitLoad[];
  generatedAt: string;
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

export interface IOECalendarEvent {
  id: string;
  type: IOECalendarEventType;
  title: string;
  start: string;
  end: string;
  status: string;
  priority: IOEPriority;
  owner?: string;
  unit?: string;
  relatedPlanId?: string;
}

// ─── Completion Eligibility ───────────────────────────────────────────────────

export interface IOECompletionEligibility {
  planId: string;
  eligible: boolean;
  pendingTasks: number;
  pendingMilestones: number;
  reasons: string[];
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface IOEActionPlansParams {
  status?: IOEPlanStatus;
  priority?: IOEPriority;
  originEngine?: IOEOriginEngine;
  organizationalUnitId?: string;
  owner?: string;
  overdue?: boolean;
  limit?: number;
}

export interface IOEMilestonesParams {
  actionPlanId?: string;
  status?: IOEMilestoneStatus;
  limit?: number;
}

export interface IOETasksParams {
  actionPlanId?: string;
  milestoneId?: string;
  assignedTo?: string;
  status?: IOETaskStatus;
  priority?: IOEPriority;
  overdue?: boolean;
  limit?: number;
}

export interface IOEDecisionsParams {
  actionPlanId?: string;
  status?: IOEDecisionStatus;
  limit?: number;
}

export interface IOECalendarParams {
  from: string;
  to: string;
  view?: IOECalendarView;
  owner?: string;
  unit?: string;
  types?: IOECalendarEventType[];
}

// ─── Mutation Params ──────────────────────────────────────────────────────────

export interface IOECreatePlanParams {
  title: string;
  description: string;
  originEngine: IOEOriginEngine;
  originEntityId?: string;
  originEntityLabel?: string;
  organizationalUnitId: string;
  organizationalUnitLabel?: string;
  priority: IOEPriority;
  objective: string;
  expectedImpact: string;
  riskLevel?: IOERiskLevel;
  owner: string;
  startDate: string;
  targetDate: string;
  createdBy?: string;
}

export interface IOEUpdatePlanParams extends Partial<IOEActionPlan> {
  id: string;
}

export interface IOECreateMilestoneParams {
  actionPlanId: string;
  title: string;
  description?: string;
  plannedDate: string;
  weight: number;
}

export interface IOEUpdateMilestoneParams extends Partial<IOEMilestone> {
  id: string;
}

export interface IOECreateTaskParams {
  actionPlanId: string;
  milestoneId?: string;
  title: string;
  description?: string;
  assignedTo: string;
  priority: IOEPriority;
  plannedStart: string;
  plannedEnd: string;
  dependencies?: string[];
}

export interface IOEUpdateTaskParams extends Partial<IOETask> {
  id: string;
}

export interface IOECreateDecisionParams {
  actionPlanId: string;
  origin: string;
  responsable: string;
  decision: string;
  justification: string;
  expectedResult: string;
}

export interface IOEUpdateDecisionParams extends Partial<IOEDecision> {
  id: string;
}

export interface IOECreateFromSourceParams {
  sourceType: IOESourceType;
  sourceId: string;
  sourceLabel: string;
  owner: string;
  organizationalUnitId: string;
  organizationalUnitLabel: string;
  targetDate: string;
  priority?: IOEPriority;
}
