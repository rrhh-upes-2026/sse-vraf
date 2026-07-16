import type { Permission } from "@/lib/permissions";

// ──────────────────────────────────────────────────────────────────────────────
// State Machine
// ──────────────────────────────────────────────────────────────────────────────

export type WorkflowState =
  | "created"
  | "in_progress"
  | "waiting"
  | "blocked"
  | "completed"
  | "cancelled"
  | "archived";

export type TransitionType =
  | "start"
  | "approve"
  | "reject"
  | "return"
  | "escalate"
  | "cancel"
  | "reopen"
  | "complete"
  | "block"
  | "unblock"
  | "wait"
  | "resume"
  | "archive";

// ──────────────────────────────────────────────────────────────────────────────
// Activity
// ──────────────────────────────────────────────────────────────────────────────

export type ActivityType = "task" | "form" | "approval" | "evidence" | "review";

export type ActivityState =
  | "pendiente"
  | "en_progreso"
  | "completada"
  | "bloqueada"
  | "cancelada";

// ──────────────────────────────────────────────────────────────────────────────
// Stage
// ──────────────────────────────────────────────────────────────────────────────

export type StageState =
  | "pendiente"
  | "activa"
  | "completada"
  | "rechazada"
  | "omitida";

// ──────────────────────────────────────────────────────────────────────────────
// Validation Rules — discriminated union for compile-time exhaustiveness
// ──────────────────────────────────────────────────────────────────────────────

export type ValidationRule =
  | { id: string; label: string; type: "min_evidence"; count: number }
  | { id: string; label: string; type: "mandatory_form"; formId: string }
  | { id: string; label: string; type: "required_approval"; roleCode: string }
  | { id: string; label: string; type: "previous_stage_completed"; stageId: string }
  | { id: string; label: string; type: "permission_required"; permission: Permission };

export interface ValidationResult {
  ruleId: string;
  ruleLabel: string;
  passed: boolean;
  message?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Blueprint — immutable process definition from Process Builder
// ──────────────────────────────────────────────────────────────────────────────

export interface ActivityDefinition {
  id: string;
  label: string;
  type: ActivityType;
  required: boolean;
  description?: string;
  assigneeRole?: string;
  dueDaysAfterStageStart?: number;
  formId?: string;
  evidenceCategory?: string;
  dependencies?: string[];
}

export interface TransitionDefinition {
  id: string;
  type: TransitionType;
  label: string;
  toStageId: string | null; // null = workflow completion
  requiredPermission?: Permission;
  validationRuleIds?: string[]; // rules to check before allowing
  buttonVariant?: "primary" | "success" | "danger" | "warning" | "outline";
  requiresComment?: boolean;
  confirmationMessage?: string;
}

export interface StageDefinition {
  id: string;
  orden: number;
  nombre: string;
  description?: string;
  activities: ActivityDefinition[];
  validationRules: ValidationRule[];
  transitions: TransitionDefinition[];
  autoAdvance?: boolean; // advance when all required activities done
}

export interface ProcessBlueprint {
  id: string;
  nombre: string;
  version: string;
  unidadId: string;
  description?: string;
  category: string;
  stages: StageDefinition[];
  initialStageId: string;
  globalTransitions?: TransitionDefinition[];
  createdAt: string;
  updatedAt: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Instance — runtime execution state (single source of truth)
// ──────────────────────────────────────────────────────────────────────────────

export interface InstanceComment {
  id: string;
  authorId: string;
  authorName: string;
  texto: string;
  creadoEn: string;
}

export interface InstanceActivity {
  defId: string; // references ActivityDefinition.id
  label: string;
  type: ActivityType;
  required: boolean;
  estado: ActivityState;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  startedAt?: string;
  completedAt?: string;
  completedBy?: string;
  formId?: string;
  formSubmission?: Record<string, unknown>;
  attachments?: string[];
  evidenceCategory?: string;
  dependencies?: string[];
  comments?: InstanceComment[];
}

export interface StageInstance {
  defId: string; // references StageDefinition.id
  label: string;
  orden: number;
  estado: StageState;
  activities: InstanceActivity[];
  validationResults?: ValidationResult[];
  startedAt?: string;
  completedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Events — engine-emitted, immutable, drive timeline automatically
// ──────────────────────────────────────────────────────────────────────────────

export type WorkflowEventType =
  | "WorkflowCreated"
  | "WorkflowStarted"
  | "StageStarted"
  | "StageCompleted"
  | "ActivityAssigned"
  | "ActivityStarted"
  | "ActivityCompleted"
  | "ActivityReopened"
  | "EvidenceAttached"
  | "EvidenceValidated"
  | "FormSubmitted"
  | "TransitionExecuted"
  | "ApprovalGranted"
  | "ApprovalRejected"
  | "WorkflowCompleted"
  | "WorkflowCancelled"
  | "WorkflowBlocked"
  | "WorkflowResumed"
  | "CommentAdded"
  | "AssigneeChanged";

export interface WorkflowEvent {
  id: string;
  instanceId: string;
  type: WorkflowEventType;
  stageId?: string;
  activityId?: string;
  actorId: string;
  actorName: string;
  payload: Record<string, unknown>;
  occurredAt: string;
}

export interface TimelineEntry {
  id: string;
  eventType: WorkflowEventType;
  title: string;
  description?: string;
  actorName: string;
  timestamp: string;
  color: string;
  iconPath: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Process Instance — full execution record
// ──────────────────────────────────────────────────────────────────────────────

export interface AssignedUser {
  userId: string;
  userName: string;
  roleInWorkflow: string;
  assignedAt: string;
}

export interface ProcessInstance {
  id: string;
  blueprintId: string;
  blueprintVersion: string;
  blueprintName: string;
  unidadId: string;
  nombre: string;
  estado: WorkflowState;
  currentStageId: string;
  stages: StageInstance[];
  assignedUsers: AssignedUser[];
  auditLog: WorkflowEvent[];
  timeline: TimelineEntry[];
  evidencias: string[];
  indicadorUpdates?: Record<string, number>;
  contextData: Record<string, unknown>;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  updatedAt: string;
  completedAt?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Engine API
// ──────────────────────────────────────────────────────────────────────────────

export interface Actor {
  id: string;
  name: string;
  roleCode: string;
  permissions: Set<Permission>;
}

export interface EngineResult {
  ok: boolean;
  instance: ProcessInstance;
  newEvents: WorkflowEvent[];
  error?: string;
}

export interface CanAdvanceResult {
  ok: boolean;
  blockers: ValidationResult[];
}
