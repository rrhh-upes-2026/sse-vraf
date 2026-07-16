import type { WorkflowState } from "./workflow";
import type { Permission } from "@/lib/permissions";

// ── Maturity Level ────────────────────────────────────────────────────────────
// Operational maturity — orthogonal to lifecycle status.
// A blueprint can be status:"published" + maturityLevel:"experimental" (first release)
// or status:"deprecated" + maturityLevel:"production" (was widely used, now phased out).

export type MaturityLevel =
  | "draft"
  | "experimental"
  | "pilot"
  | "production"
  | "stable"
  | "deprecated"
  | "archived";

// ── Blueprint Lifecycle ───────────────────────────────────────────────────────

export type BlueprintStatus =
  | "draft"
  | "validating"
  | "published"
  | "deprecated"
  | "archived";

export type BlueprintLifecycleTransition =
  | "submit"       // draft → validating
  | "publish"      // validating → published
  | "reject"       // validating → draft
  | "deprecate"    // published → deprecated
  | "archive"      // deprecated → archived | draft → archived
  | "reactivate";  // deprecated → published

// ── Blueprint Version Record ──────────────────────────────────────────────────

export interface BlueprintVersion {
  id: string;
  blueprintId: string;
  version: string;
  status: BlueprintStatus;
  changelog?: string;
  publishedAt?: string;
  deprecatedAt?: string;
  archivedAt?: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  instanceCount: number;
}

// ── Blueprint Registry Entry ──────────────────────────────────────────────────

export interface BlueprintMetadata {
  id: string;
  nombre: string;
  description?: string;
  category: string;
  unidadId: string;
  ownerName: string;
  status: BlueprintStatus;
  currentVersion: string;
  publishedVersion?: string;
  versions: BlueprintVersion[];
  maturityLevel: MaturityLevel;
  formIds: string[];
  indicatorIds: string[];
  reportIds: string[];
  permissionsRequired: Permission[];
  createdAt: string;
  updatedAt: string;
  totalInstances: number;
  activeInstances: number;
}

// ── Validation ────────────────────────────────────────────────────────────────

export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  severity: ValidationSeverity;
  code: string;
  message: string;
  path?: string;
}

export interface ValidationReport {
  blueprintId: string;
  version: string;
  runAt: string;
  passed: boolean;
  issues: ValidationIssue[];
  stats: {
    stages: number;
    activities: number;
    transitions: number;
    validationRules: number;
    forms: number;
  };
}

// ── Runtime Monitor ───────────────────────────────────────────────────────────

export interface RuntimeStats {
  total: number;
  running: number;
  completed: number;
  blocked: number;
  cancelled: number;
  waiting: number;
  archived: number;
  avgCompletionDays: number | null;
}

export type InstanceHealth = "ok" | "warning" | "critical";

export interface InstanceSummary {
  id: string;
  blueprintId: string;
  blueprintName: string;
  nombre: string;
  estado: WorkflowState;
  currentStageLabel: string;
  assigneeName?: string;
  createdByName: string;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  health: InstanceHealth;
  staleDays?: number;
}

// ── Instance Factory ──────────────────────────────────────────────────────────

export interface InstanceFactoryInput {
  blueprintId: string;
  nombre: string;
  contextData?: Record<string, unknown>;
}

// ── Dependency Graph ──────────────────────────────────────────────────────────

export type DependencyNodeType = "blueprint" | "form" | "indicator" | "report" | "permission";

export interface DependencyNode {
  id: string;
  type: DependencyNodeType;
  label: string;
  broken?: boolean;
  sharedWith?: string[];
}

export interface BlueprintDependencyGraph {
  blueprintId: string;
  blueprintName: string;
  nodes: DependencyNode[];
}

// ── Impact Analysis ───────────────────────────────────────────────────────────

export interface ImpactDependency {
  type: "form" | "indicator" | "report";
  id: string;
  sharedWith: string[];
}

export interface ImpactReport {
  blueprintId: string;
  fromVersion: string;
  toVersion: string;
  activeInstances: number;
  affectedInstanceIds: string[];
  sharedDependencies: ImpactDependency[];
  riskLevel: "low" | "medium" | "high";
  recommendation: string;
}

// ── Runtime Health ────────────────────────────────────────────────────────────

export type HealthStatus = "healthy" | "degraded" | "critical";

export interface HealthAlert {
  id: string;
  severity: "error" | "warning" | "info";
  message: string;
  blueprintId?: string;
  instanceId?: string;
  occurredAt: string;
}

export interface HealthMetric {
  id: string;
  label: string;
  value: number | string;
  status: HealthStatus;
  trend?: "up" | "down" | "stable";
}

export interface PlatformHealth {
  overallStatus: HealthStatus;
  score: number;
  checkedAt: string;
  metrics: HealthMetric[];
  alerts: HealthAlert[];
}
