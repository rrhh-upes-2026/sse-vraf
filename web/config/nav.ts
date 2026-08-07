/**
 * Navigation configuration — single source of truth for the app shell's nav.
 *
 * Core owns VRAF (the default workspace) and the universal sidebar sections.
 * All other workspaces are contributed by modules via the moduleRegistry.
 * Do not add module-specific data here — put it in the module manifest.
 */

import { moduleRegistry } from "@/lib/sdk/registry";

// WorkspaceUnit and WorkspaceId are re-exported from the SDK so the rest of
// the codebase can import them from a single location.
export type { WorkspaceUnit } from "@/lib/sdk/types";

export type WorkspaceId =
  | "GLOBAL"
  | "vraf"
  | "rrhh"
  | "conta"
  | "compras"
  | "mant"
  | "salud"
  | "ime"
  | "pme"
  | "ape"
  | "aee"
  | "eme"
  | "cpe"
  | "eip"
  | "iie"
  | "ioe"
  | "aue"
  | "nce"
  | "isp"
  | "gwp"
  | "iia"
  | "fmi"
  | "ide"
  | "oim"
  | "ice";

/**
 * Workspaces that represent real organizational units visible to end users.
 * Engine and framework modules (fmi, ide, oim, ice, iia, etc.) are internal —
 * their functionality surfaces through the standard section pages (Indicadores,
 * Evidencias, Administración, etc.) and must not appear in the workspace switcher.
 */
export const ORG_WORKSPACE_IDS: ReadonlySet<string> = new Set([
  "vraf",
  "rrhh",
  "compras",
  "contabilidad", // manifest id; "conta" is the WorkspaceId alias
  "conta",
  "mantenimiento", // manifest id; "mant" is the WorkspaceId alias
  "mant",
  "salud",
]);

/** VRAF is the Core's built-in workspace — always available, no module required. */
export const VRAF_WORKSPACE = {
  id: "vraf" as WorkspaceId,
  short: "Vicerrectoría A. y F.",
  full: "Vicerrectoría Administrativa y Financiera",
  color: "#2E6BE6",
  bg: "#EAF1FE",
  icon: "M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6",
} as const;

export const DEFAULT_WORKSPACE: WorkspaceId = "vraf";

export function isWorkspaceId(value: string): value is WorkspaceId {
  if (value === VRAF_WORKSPACE.id) return true;
  return moduleRegistry.isModuleWorkspace(value);
}

export function getWorkspace(id: string) {
  if (id === VRAF_WORKSPACE.id) return VRAF_WORKSPACE;
  return moduleRegistry.getWorkspaceUnit(id);
}

export type WorkspaceSectionId =
  | "dashboard"
  | "planes"
  | "objetivos"
  | "proyectos"
  | "procesos"
  | "indicadores"
  | "solicitudes"
  | "evidencias"
  | "reportes"
  | "calendario"
  | "inteligencia"
  | "config"
  | "admin"
  | "configuracion";

export interface WorkspaceSection {
  id: WorkspaceSectionId;
  label: string;
  /** SVG path `d` attribute, 24x24 viewBox */
  icon: string;
  /** Static demo badge count, mirrors the prototype's placeholder values */
  badge?: number;
}

export const WORKSPACE_SECTIONS: WorkspaceSection[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "M4 20V10M10 20V4M16 20v-7M4 20h16",
  },
  {
    id: "indicadores",
    label: "Indicadores",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    id: "evidencias",
    label: "Evidencias",
    icon: "M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  },
  {
    id: "reportes",
    label: "Reportes",
    icon: "M8 3h6l4 4v14H6V5a2 2 0 012-2zM14 3v4h4M9 13h6",
  },
  {
    id: "calendario",
    label: "Calendario",
    icon: "M4 8h16M7 3v3M17 3v3M5 5h14v14H5z",
  },
  {
    id: "inteligencia",
    label: "Inteligencia IA",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z",
  },
  {
    id: "configuracion",
    label: "Configuración",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  },
];

export function getWorkspaceSection(
  id: string,
): WorkspaceSection | undefined {
  return WORKSPACE_SECTIONS.find((s) => s.id === id);
}

/** Mi Trabajo — top-level entry point, sibling of the workspace concept. */
export const MY_WORK_ICON = "M4 4h7v7H4zM13 4h7v4h-7zM13 11h7v9h-7zM4 14h7v6H4z";

/** Administración — items del menú lateral para ADMIN/SUPER_ADMIN. */
export interface AdminNavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    id: "dashboard-ejecutivo",
    label: "Dashboard Ejecutivo",
    href: "/dashboard",
    icon: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
  },
  {
    id: "configuracion",
    label: "Configuración",
    href: "/configuracion",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  },
];

/** Studio builders — §05, reached from a workspace's Configuración screen. */
export interface StudioTool {
  id: string;
  slug: string;
  label: string;
  description: string;
  color: string;
}

export const STUDIO_TOOLS: StudioTool[] = [
  {
    id: "modules",
    slug: "modules",
    label: "Module Registry",
    description: "Módulos instalados, estado, salud y versiones",
    color: "#2E6BE6",
  },
  {
    id: "process-builder",
    slug: "process-builder",
    label: "Process Builder",
    description: "Constructor de procesos institucionales · 8 bloques",
    color: "#2E6BE6",
  },
  {
    id: "form-builder",
    slug: "form-builder",
    label: "Form Builder",
    description: "Constructor visual de formularios · 40+ tipos de campo",
    color: "#5B4FD0",
  },
  {
    id: "data-studio",
    slug: "data-studio",
    label: "Data Studio",
    description: "Entidades de negocio, relaciones e impacto",
    color: "#0F8A8A",
  },
  {
    id: "dashboard-builder",
    slug: "dashboard-builder",
    label: "Dashboard Builder",
    description: "Selección de widgets por workspace",
    color: "#E5A100",
  },
  {
    id: "report-builder",
    slug: "report-builder",
    label: "Report Builder",
    description: "Secciones y frecuencia de reportes automáticos",
    color: "#12A150",
  },
  {
    id: "registry",
    slug: "registry",
    label: "Blueprint Registry",
    description: "Publicación, versionado y ciclo de vida de blueprints",
    color: "#E5484D",
  },
  {
    id: "monitor",
    slug: "monitor",
    label: "Runtime Monitor",
    description: "Instancias activas, salud y métricas de ejecución",
    color: "#0F8A8A",
  },
  {
    id: "health",
    slug: "health",
    label: "Runtime Health",
    description: "Salud de la plataforma, alertas y métricas de SLA",
    color: "#5B4FD0",
  },
];

/** Administración — configuración global, §03. */
export interface AdminTool {
  id: string;
  slug: string;
  label: string;
  description: string;
  color: string;
}

export const ADMIN_TOOLS: AdminTool[] = [
  {
    id: "usuarios",
    slug: "usuarios",
    label: "Usuarios y roles",
    description: "Administración de usuarios, roles y permisos RBAC",
    color: "#2E6BE6",
  },
  {
    id: "catalogos",
    slug: "catalogos",
    label: "Catálogos",
    description: "Catálogo institucional — unidades, tipos, RUI",
    color: "#5B4FD0",
  },
  {
    id: "automatizaciones",
    slug: "automatizaciones",
    label: "Automatizaciones",
    description: "Reglas SI → OCURRE → ENTONCES del sistema",
    color: "#E5484D",
  },
  {
    id: "dashboard-ejecutivo",
    slug: "dashboard-ejecutivo",
    label: "Dashboard Ejecutivo",
    description: "Vista consolidada de las 6 unidades",
    color: "#0F8A8A",
  },
];
