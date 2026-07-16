/**
 * Workspace Administration Suite — Sprint 11.
 *
 * Types for all self-managed workspace objects.
 * Every object follows the Draft → Published → Archived → Deprecated lifecycle.
 * Blueprints are the persistent store; Publishing creates a Runtime Blueprint.
 */

import type { WorkspaceId } from "@/config/nav";

// ── Lifecycle ─────────────────────────────────────────────────────────────────

export type ObjectLifecycle = "draft" | "published" | "archived" | "deprecated";

export interface VersionRecord {
  version: number;
  changedBy: string;
  changedAt: string;
  summary: string;
  lifecycle: ObjectLifecycle;
}

export interface AuditRecord {
  id: string;
  wsId: WorkspaceId;
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  performedAt: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}

// ── Process Blueprint ─────────────────────────────────────────────────────────

export type ProcessType = "estrategico" | "misional" | "apoyo" | "operativo";
export type ProcessFrequency = "puntual" | "diaria" | "semanal" | "mensual" | "trimestral" | "anual";

export interface ProcessBlueprint {
  id: string;                   // BP-[UNIT]-[YY]-[SEQ]
  wsId: WorkspaceId;
  nombre: string;
  descripcion: string;
  tipo: ProcessType;
  objetivo: string;
  alcance: string;
  responsableRol: string;
  clientesInternos?: string[];
  clientesExternos?: string[];
  normativaAsociada?: string[];
  slaDias: number;
  prioridad: "baja" | "media" | "alta" | "critica";
  frecuencia: ProcessFrequency;
  indicadorIds: string[];       // -> WorkspaceKPI
  evidenciasRequeridas: string[];
  formIds: string[];            // -> FormBlueprint
  lifecycle: ObjectLifecycle;
  version: number;
  publishedVersion?: number;
  runtimeBlueprintId?: string; // set when lifecycle = "published"
  history: VersionRecord[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ── Procedure ─────────────────────────────────────────────────────────────────

export interface ProcedureActivity {
  id: string;
  nombre: string;
  descripcion?: string;
  responsableRol: string;
  tiempoEstimadoMin: number;
  evidenciaRequerida?: string;
  observaciones?: string;
  attachments?: string[];
  orden: number;
}

export interface ProcedureSection {
  id: string;
  titulo: string;
  descripcion?: string;
  activities: ProcedureActivity[];
  orden: number;
}

export interface ProcedureBlueprint {
  id: string;                   // PROC-[UNIT]-[YY]-[SEQ]
  wsId: WorkspaceId;
  blueprintId?: string;         // parent process blueprint
  nombre: string;
  descripcion: string;
  objetivo: string;
  alcance: string;
  sections: ProcedureSection[];
  responsableRol: string;
  approvedBy?: string;
  approvedAt?: string;
  lifecycle: ObjectLifecycle;
  version: number;
  history: VersionRecord[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ── KPI / Indicator ───────────────────────────────────────────────────────────

export type KPICategory = "gestion" | "desempeno" | "calidad" | "eficiencia" | "satisfaccion";
export type KPIFrequency = "diaria" | "semanal" | "mensual" | "trimestral" | "semestral" | "anual";
export type KPIVisualization = "gauge" | "line" | "bar" | "number" | "table" | "pie";
export type SemaforoColor = "verde" | "amarillo" | "rojo";

export interface KPISemaphore {
  verde: { min: number; max: number };
  amarillo: { min: number; max: number };
  rojo: { min: number; max: number };
}

export interface KPIHistoricalValue {
  fecha: string;
  valor: number;
  semaforo: SemaforoColor;
  nota?: string;
}

export interface WorkspaceKPI {
  id: string;                   // KPI-[UNIT]-[SEQ]
  wsId: WorkspaceId;
  nombre: string;
  descripcion: string;
  categoria: KPICategory;
  formula: string;
  unidadMedida: string;
  meta: number;
  tolerancia: number;           // % deviation before yellow
  frecuencia: KPIFrequency;
  fuenteDatos: string;
  responsableRol: string;
  visualizacion: KPIVisualization;
  semaforo: KPISemaphore;
  dashboardDestino: string;
  valorActual?: number;
  tendencia?: "sube" | "baja" | "estable";
  historico: KPIHistoricalValue[];
  lifecycle: ObjectLifecycle;
  version: number;
  history: VersionRecord[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ── Objective / Project ───────────────────────────────────────────────────────

export interface WorkspaceObjective {
  id: string;                   // OBJ-[UNIT]-[SEQ]
  wsId: WorkspaceId;
  nombre: string;
  descripcion: string;
  metaGeneral: string;
  periodoInicio: string;
  periodoFin: string;
  responsableRol: string;
  kpiIds: string[];
  projectIds: string[];
  lifecycle: ObjectLifecycle;
  version: number;
  history: VersionRecord[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceProject {
  id: string;                   // PROJ-[UNIT]-[SEQ]
  wsId: WorkspaceId;
  objectiveId: string;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  responsableRol: string;
  presupuesto?: number;
  avancePct: number;
  blueprintIds: string[];
  lifecycle: ObjectLifecycle;
  version: number;
  history: VersionRecord[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ── Request Catalog ───────────────────────────────────────────────────────────

export type ApprovalType = "simple" | "sequential" | "parallel" | "unanimous";

export interface WorkflowApprovalStep {
  id: string;
  nombre: string;
  responsableRol: string;
  slaDias: number;
  tipo: ApprovalType;
  condicion?: string;
  notifyOnApprove: boolean;
  notifyOnReject: boolean;
  orden: number;
}

export interface RequestFormField {
  id: string;
  tipo: "texto" | "numero" | "fecha" | "select" | "multiselect" | "archivo" | "checkbox" | "textarea";
  etiqueta: string;
  requerido: boolean;
  opciones?: string[];
  validacion?: string;
  orden: number;
}

export interface RequestType {
  id: string;                   // REQ-[UNIT]-[SEQ]
  wsId: WorkspaceId;
  nombre: string;
  descripcion: string;
  categoria: string;
  icon: string;
  blueprintId?: string;
  formFields: RequestFormField[];
  approvalSteps: WorkflowApprovalStep[];
  slaDias: number;
  responsableRol: string;
  evidenciasRequeridas: string[];
  notificaciones: {
    alCrear: boolean;
    alAprobar: boolean;
    alRechazar: boolean;
    alCerrar: boolean;
    alVencerSLA: boolean;
  };
  permisosCrear: string[];      // role codes that may create
  permisosAprobar: string[];    // role codes that may approve
  lifecycle: ObjectLifecycle;
  version: number;
  history: VersionRecord[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ── Form Blueprint ─────────────────────────────────────────────────────────────

export interface FormBlueprint {
  id: string;                   // FORM-[UNIT]-[SEQ]-v[VER]
  wsId: WorkspaceId;
  nombre: string;
  descripcion?: string;
  schema: Record<string, unknown>;
  lifecyle: ObjectLifecycle;
  version: number;
  history: VersionRecord[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export type WidgetType = "kpi_card" | "bar_chart" | "line_chart" | "pie_chart" | "table" | "list" | "gauge" | "calendar" | "activity_feed";
export type WidgetSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface DashboardWidget {
  id: string;
  tipo: WidgetType;
  titulo: string;
  kpiId?: string;
  dataSource?: string;
  filtros?: Record<string, unknown>;
  size: WidgetSize;
  col: number;                  // grid column start (1-12)
  row: number;
  colSpan: number;
  rowSpan: number;
  config?: Record<string, unknown>;
}

export interface DashboardConfig {
  id: string;                   // DASH-[UNIT]-[SEQ]
  wsId: WorkspaceId;
  nombre: string;
  descripcion?: string;
  isDefault: boolean;
  widgets: DashboardWidget[];
  permisosVer: string[];
  filters?: Record<string, unknown>;
  lifecycle: ObjectLifecycle;
  version: number;
  history: VersionRecord[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ── Automation ────────────────────────────────────────────────────────────────

export type TriggerType =
  | "process.created" | "process.status_changed" | "process.completed"
  | "indicator.threshold_crossed" | "request.created" | "request.approved"
  | "evidence.uploaded" | "evidence.approved" | "sla.warning" | "sla.breach"
  | "date.reached" | "form.submitted" | "user.created";

export type ActionType =
  | "send_notification" | "create_task" | "update_field"
  | "change_status" | "assign_role" | "generate_report"
  | "trigger_webhook" | "create_audit_record";

export interface AutomationCondition {
  field: string;
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "is_empty";
  value: string;
}

export interface AutomationAction {
  id: string;
  tipo: ActionType;
  config: Record<string, unknown>;
  orden: number;
}

export interface AutomationExecution {
  id: string;
  automationId: string;
  triggeredAt: string;
  status: "success" | "failed" | "partial";
  actionsExecuted: number;
  errorMessage?: string;
}

export interface WorkspaceAutomation {
  id: string;                   // AUTO-[UNIT]-[SEQ]
  wsId: WorkspaceId;
  nombre: string;
  descripcion: string;
  trigger: TriggerType;
  triggerConfig?: Record<string, unknown>;
  conditions: AutomationCondition[];
  conditionLogic: "AND" | "OR";
  actions: AutomationAction[];
  active: boolean;
  executionCount: number;
  lastExecutedAt?: string;
  lastStatus?: "success" | "failed" | "partial";
  recentExecutions: AutomationExecution[];
  lifecycle: ObjectLifecycle;
  version: number;
  history: VersionRecord[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ── Document Management ───────────────────────────────────────────────────────

export type DocumentCategory = "politica" | "manual" | "procedimiento" | "instructivo" | "formato" | "reglamento" | "otro";

export interface WorkspaceDocument {
  id: string;                   // DOC-[UNIT]-[SEQ]
  wsId: WorkspaceId;
  nombre: string;
  descripcion?: string;
  categoria: DocumentCategory;
  driveFileId?: string;
  mimeType?: string;
  sizeKb?: number;
  version: number;
  tags: string[];
  responsableRol: string;
  lifecycle: ObjectLifecycle;
  history: VersionRecord[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ── Notification Rule ─────────────────────────────────────────────────────────

export interface NotificationRule {
  id: string;                   // NOTIF-[UNIT]-[SEQ]
  wsId: WorkspaceId;
  nombre: string;
  descripcion: string;
  trigger: TriggerType;
  conditions: AutomationCondition[];
  destinatarioRoles: string[];
  canal: "in_app" | "email" | "both";
  asunto: string;
  mensaje: string;
  active: boolean;
  lifecycle: ObjectLifecycle;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ── Workspace Settings ────────────────────────────────────────────────────────

export interface WorkspaceSettings {
  wsId: WorkspaceId;
  nombre: string;
  nombreCorto: string;
  descripcion?: string;
  responsableId: string;
  color: string;
  colorFondo: string;
  icon: string;
  slaDiasDefault: number;
  zonaHoraria: string;
  idioma: string;
  defaultDashboardId?: string;
  updatedAt: string;
  updatedBy: string;
}

// ── Workspace Template ────────────────────────────────────────────────────────

export interface WorkspaceTemplate {
  id: string;                   // TMPL-[UNIT]-[YY]-[SEQ]
  nombre: string;
  descripcion: string;
  sourceWsId: WorkspaceId;
  exportedBy: string;
  exportedAt: string;
  blueprints: number;
  kpis: number;
  requestTypes: number;
  automations: number;
  forms: number;
  dashboards: number;
  schemaVersion: string;
}

// ── Workspace User (scoped) ───────────────────────────────────────────────────

export type RoleCode = "ADMIN" | "HEAD" | "ANALYST" | "OPS" | "AUDIT";

export interface WorkspaceUser {
  id: string;                   // USR-[UNIT]-[SEQ]
  wsId: WorkspaceId;
  nombre: string;
  email: string;
  rol: RoleCode;
  activo: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}
