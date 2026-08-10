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

/** The 5 organizational unit workspaces — statically defined, no module required. */
export const UNIT_WORKSPACES = [
  {
    id: "conta" as WorkspaceId,
    short: "Contabilidad",
    full: "Unidad de Contabilidad",
    color: "#059669",
    bg: "#ECFDF5",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  },
  {
    id: "rrhh" as WorkspaceId,
    short: "Recursos Humanos",
    full: "Unidad de Recursos Humanos",
    color: "#7C3AED",
    bg: "#F5F3FF",
    icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  },
  {
    id: "mant" as WorkspaceId,
    short: "Mantenimiento",
    full: "Unidad de Mantenimiento e Infraestructura",
    color: "#DC2626",
    bg: "#FEF2F2",
    icon: "M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z",
  },
  {
    id: "compras" as WorkspaceId,
    short: "Compras y Almacén",
    full: "Unidad de Compras y Almacén",
    color: "#D97706",
    bg: "#FFFBEB",
    icon: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0",
  },
  {
    id: "salud" as WorkspaceId,
    short: "Salud SSO",
    full: "Comité de Seguridad y Salud Ocupacional",
    color: "#0891B2",
    bg: "#ECFEFF",
    icon: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
  },
] as const;

/** All organizational workspaces in display order. */
export const ALL_ORG_WORKSPACES = [VRAF_WORKSPACE, ...UNIT_WORKSPACES];

export const DEFAULT_WORKSPACE: WorkspaceId = "vraf";

const _ORG_IDS = new Set(ALL_ORG_WORKSPACES.map((w) => w.id as string));

export function isWorkspaceId(value: string): value is WorkspaceId {
  if (_ORG_IDS.has(value)) return true;
  return moduleRegistry.isModuleWorkspace(value);
}

export function getWorkspace(id: string) {
  const orgUnit = ALL_ORG_WORKSPACES.find((w) => w.id === id);
  if (orgUnit) return orgUnit;
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
