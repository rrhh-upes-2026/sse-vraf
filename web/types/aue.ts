// AUE — Automation & Event Engine

export type AUEEventStatus    = "pendiente" | "procesando" | "procesado" | "fallido" | "ignorado";
export type AUEEventPriority  = "baja" | "normal" | "alta" | "critica";
export type AUERuleStatus     = "activa" | "inactiva" | "borrador";
export type AUEExecutionStatus = "pendiente" | "ejecutando" | "exitoso" | "fallido" | "reintentando";
export type AUEQueueStatus    = "pendiente" | "procesando" | "completado" | "fallido" | "cancelado";

export type AUEEventType =
  | "entity.created"
  | "entity.updated"
  | "status.changed"
  | "plan.closed"
  | "task.overdue"
  | "evidence.added"
  | "recommendation.new"
  | "diagnosis.new"
  | "alert.new"
  | "plan.new"
  | "task.new"
  | "milestone.completed"
  | "rule.triggered"
  | "queue.retry";

export type AUESourceEngine =
  | "ime" | "pme" | "ape" | "aee" | "eme"
  | "cpe" | "eip" | "iie" | "ioe" | "system";

export type AUEConditionOperator =
  | "eq" | "neq" | "gt" | "gte" | "lt" | "lte"
  | "contains" | "in" | "not_in";

export type AUEActionType =
  | "registrar_evento"
  | "crear_tarea_ioe"
  | "crear_plan_ioe"
  | "cambiar_prioridad"
  | "actualizar_estado"
  | "generar_alerta"
  | "registrar_auditoria"
  | "webhook_externo"
  | "correo_externo"
  | "api_externa";

export type AUEIntegrationTarget =
  | "google_workspace" | "microsoft_365"
  | "slack" | "teams"
  | "correo" | "webhook" | "rest_api";

// ─── Sub-structures ───────────────────────────────────────────────────────────

export interface AUECondition {
  field: string;
  operator: AUEConditionOperator;
  value: unknown;
}

export interface AUEAction {
  type: AUEActionType;
  params: Record<string, unknown>;
}

export interface AUEIntegrationContract {
  target: AUEIntegrationTarget;
  event: string;
  payload: Record<string, unknown>;
  triggerCondition: string;
}

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface AUEEvent {
  id: string;
  eventType: AUEEventType;
  sourceEngine: AUESourceEngine;
  sourceEntityId: string;
  timestamp: string;
  payload: Record<string, unknown>;
  status: AUEEventStatus;
  priority: AUEEventPriority;
  processedAt?: string;
}

export interface AUERule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  eventType: AUEEventType;
  conditions: AUECondition[];
  actions: AUEAction[];
  priority: number;
  version: number;
  executionCount: number;
  lastExecutedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AUEExecution {
  id: string;
  eventId: string;
  ruleId: string;
  ruleName: string;
  status: AUEExecutionStatus;
  startedAt: string;
  finishedAt?: string;
  duration?: number;
  result?: Record<string, unknown>;
  logs: string[];
}

export interface AUEQueue {
  id: string;
  executionId: string;
  scheduledAt: string;
  attempt: number;
  status: AUEQueueStatus;
  nextRetry?: string;
  maxRetries: number;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface AUEDashboard {
  totalEvents: number;
  pendingEvents: number;
  processedEvents: number;
  failedEvents: number;
  avgProcessingTime: number;
  activeRules: number;
  queueSize: number;
  retryCount: number;
  eventsToday: number;
  topRules: { ruleId: string; ruleName: string; count: number }[];
  recentEvents: AUEEvent[];
  recentExecutions: AUEExecution[];
  eventsByDay: { date: string; count: number }[];
  generatedAt: string;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface AUEEventsParams {
  sourceEngine?: AUESourceEngine;
  eventType?: AUEEventType;
  status?: AUEEventStatus;
  priority?: AUEEventPriority;
  from?: string;
  to?: string;
  limit?: number;
}

export interface AUERulesParams {
  enabled?: boolean;
  eventType?: AUEEventType;
  limit?: number;
}

export interface AUEExecutionsParams {
  eventId?: string;
  ruleId?: string;
  status?: AUEExecutionStatus;
  from?: string;
  to?: string;
  limit?: number;
}

export interface AUEQueueParams {
  status?: AUEQueueStatus;
  limit?: number;
}

// ─── Mutation Params ──────────────────────────────────────────────────────────

export interface AUECreateEventParams {
  eventType: AUEEventType;
  sourceEngine: AUESourceEngine;
  sourceEntityId: string;
  payload: Record<string, unknown>;
  priority?: AUEEventPriority;
}

export interface AUECreateRuleParams {
  name: string;
  description?: string;
  eventType: AUEEventType;
  conditions: AUECondition[];
  actions: AUEAction[];
  priority?: number;
  createdBy?: string;
}

export interface AUEUpdateRuleParams extends Partial<AUERule> {
  id: string;
}

export interface AUEProcessEventParams {
  eventId: string;
}
