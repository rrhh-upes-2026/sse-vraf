/**
 * Permission Engine — MASTER HANDOFF §10.
 *
 * Permissions are unique string keys. Components check permissions, never roles.
 * Roles map to permission sets here — this is the only place in the codebase
 * that knows which role has which permission. If a role gains a new capability,
 * update ROLE_PERMISSIONS here; every screen that calls hasPermission() picks it
 * up automatically with no other change required.
 *
 * Usage in components (via usePermissions()):
 *   const { hasPermission } = usePermissions();
 *   if (!hasPermission('process.create')) return null;
 */

import type { RoleCode } from "@/types/roles";

export type Permission =
  // Processes
  | "process.create"
  | "process.edit"
  | "process.delete"
  | "process.view"
  // Activities
  | "activity.create"
  | "activity.edit"
  | "activity.complete"
  | "activity.view"
  // Evidence
  | "evidence.upload"
  | "evidence.replace"
  | "evidence.view"
  | "evidence.approve"
  // Indicators
  | "indicator.view"
  | "indicator.edit"
  // Dashboard
  | "dashboard.view"
  // Reports
  | "report.export"
  // Studio / builders
  | "studio.access"
  | "processBuilder.access"
  | "formBuilder.access"
  | "dataStudio.access"
  // Administration
  | "users.manage"
  | "roles.manage"
  | "workspace.manage"
  // HR domain (Sprint 4)
  | "hr.employee.view"
  | "hr.employee.create"
  | "hr.employee.edit"
  | "hr.hiring.view"
  | "hr.hiring.manage"
  | "hr.hiring.approve"
  | "hr.training.view"
  | "hr.training.manage"
  | "hr.evaluation.view"
  | "hr.evaluation.manage"
  | "hr.personnel-action.approve"
  | "requests.create"
  | "requests.view"
  | "requests.approve"
  // Workspace Administration Suite (Sprint 11)
  | "ws.admin.access"
  | "ws.processes.manage"
  | "ws.processes.publish"
  | "ws.procedures.manage"
  | "ws.indicators.manage"
  | "ws.objectives.manage"
  | "ws.projects.manage"
  | "ws.requests.manage"
  | "ws.forms.manage"
  | "ws.reports.manage"
  | "ws.dashboards.manage"
  | "ws.automations.manage"
  | "ws.documents.manage"
  | "ws.users.manage"
  | "ws.settings.manage"
  | "ws.template.export"
  | "ws.audit.view";

const ALL_PERMISSIONS = new Set<Permission>([
  "process.create", "process.edit", "process.delete", "process.view",
  "activity.create", "activity.edit", "activity.complete", "activity.view",
  "evidence.upload", "evidence.replace", "evidence.view", "evidence.approve",
  "indicator.view", "indicator.edit",
  "dashboard.view",
  "report.export",
  "studio.access", "processBuilder.access", "formBuilder.access", "dataStudio.access",
  "users.manage", "roles.manage", "workspace.manage",
  "hr.employee.view", "hr.employee.create", "hr.employee.edit",
  "hr.hiring.view", "hr.hiring.manage", "hr.hiring.approve",
  "hr.training.view", "hr.training.manage",
  "hr.evaluation.view", "hr.evaluation.manage",
  "hr.personnel-action.approve",
  "requests.create", "requests.view", "requests.approve",
  "ws.admin.access",
  "ws.processes.manage", "ws.processes.publish",
  "ws.procedures.manage",
  "ws.indicators.manage",
  "ws.objectives.manage",
  "ws.projects.manage",
  "ws.requests.manage",
  "ws.forms.manage",
  "ws.reports.manage",
  "ws.dashboards.manage",
  "ws.automations.manage",
  "ws.documents.manage",
  "ws.users.manage",
  "ws.settings.manage",
  "ws.template.export",
  "ws.audit.view",
]);

export const ROLE_PERMISSIONS: Record<RoleCode, ReadonlySet<Permission>> = {
  ADMIN: ALL_PERMISSIONS,

  HEAD: new Set<Permission>([
    "process.create", "process.edit", "process.view",
    "activity.create", "activity.edit", "activity.complete", "activity.view",
    "evidence.upload", "evidence.replace", "evidence.view", "evidence.approve",
    "indicator.view", "indicator.edit",
    "dashboard.view",
    "report.export",
    "processBuilder.access",
    "workspace.manage",
    "hr.employee.view", "hr.employee.create", "hr.employee.edit",
    "hr.hiring.view", "hr.hiring.manage", "hr.hiring.approve",
    "hr.training.view", "hr.training.manage",
    "hr.evaluation.view", "hr.evaluation.manage",
    "hr.personnel-action.approve",
    "requests.create", "requests.view", "requests.approve",
    "ws.admin.access",
    "ws.processes.manage", "ws.processes.publish",
    "ws.procedures.manage",
    "ws.indicators.manage",
    "ws.objectives.manage",
    "ws.projects.manage",
    "ws.requests.manage",
    "ws.forms.manage",
    "ws.reports.manage",
    "ws.dashboards.manage",
    "ws.automations.manage",
    "ws.documents.manage",
    "ws.users.manage",
    "ws.settings.manage",
    "ws.audit.view",
  ]),

  ANALYST: new Set<Permission>([
    "process.edit", "process.view",
    "activity.create", "activity.edit", "activity.complete", "activity.view",
    "evidence.upload", "evidence.replace", "evidence.view",
    "indicator.view", "indicator.edit",
    "dashboard.view",
    "report.export",
    "processBuilder.access",
    "hr.employee.view",
    "hr.hiring.view", "hr.hiring.manage",
    "hr.training.view", "hr.training.manage",
    "hr.evaluation.view",
    "requests.create", "requests.view",
  ]),

  OPS: new Set<Permission>([
    "process.view",
    "activity.complete", "activity.view",
    "evidence.upload", "evidence.view",
    "indicator.view",
    "dashboard.view",
    "hr.employee.view",
    "hr.hiring.view",
    "hr.training.view",
    "hr.evaluation.view",
    "requests.create", "requests.view",
  ]),

  AUDIT: new Set<Permission>([
    "process.view",
    "activity.view",
    "evidence.view",
    "indicator.view",
    "dashboard.view",
    "report.export",
  ]),
};

/**
 * Quick actions surfaced in Mi Trabajo and contextual menus.
 * Each action has a label, an href, and the required permission.
 */
export interface QuickAction {
  id: string;
  label: string;
  icon: string; // SVG path d
  href: string;
  permission: Permission;
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "new-process",
    label: "Nuevo Proceso",
    icon: "M12 4v16m8-8H4",
    href: "/studio/process-builder",
    permission: "process.create",
  },
  {
    id: "new-employee",
    label: "Nuevo Empleado",
    icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
    href: "/ws/rrhh/empleados",
    permission: "hr.employee.create",
  },
  {
    id: "new-hiring",
    label: "Nueva Contratación",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    href: "/ws/rrhh/contratacion",
    permission: "hr.hiring.manage",
  },
  {
    id: "upload-evidence",
    label: "Cargar Evidencia",
    icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
    href: "/mi-trabajo",
    permission: "evidence.upload",
  },
  {
    id: "process-builder",
    label: "Process Builder",
    icon: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7",
    href: "/studio/process-builder",
    permission: "processBuilder.access",
  },
  {
    id: "generate-report",
    label: "Generar Reporte",
    icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    href: "/studio/report-builder",
    permission: "report.export",
  },
  {
    id: "view-dashboard",
    label: "Ver Dashboard",
    icon: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
    href: "/admin/dashboard-ejecutivo",
    permission: "dashboard.view",
  },
  {
    id: "manage-users",
    label: "Gestionar Usuarios",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    href: "/admin/usuarios",
    permission: "users.manage",
  },
];
