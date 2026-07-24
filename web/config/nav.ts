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
  | "config"
  | "admin";

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
    id: "planes",
    label: "Planes",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    id: "objetivos",
    label: "Objetivos",
    icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  },
  {
    id: "proyectos",
    label: "Proyectos",
    icon: "M6 3v6M6 15v6M18 3v18M6 9a3 3 0 0 0 3 3h6",
  },
  {
    id: "procesos",
    label: "Procesos",
    icon: "M9 11l3 3 8-8M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9",
    badge: 5,
  },
  {
    id: "indicadores",
    label: "Indicadores",
    icon: "M4 20a8 8 0 1 1 16 0M12 14l4-4",
  },
  {
    id: "solicitudes",
    label: "Solicitudes",
    icon: "M4 13h4l2 3h4l2-3h4M5 5h14v13H5z",
    badge: 3,
  },
  {
    id: "evidencias",
    label: "Evidencias",
    icon: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  },
  {
    id: "reportes",
    label: "Reportes",
    icon: "M8 3h6l4 4v14H6V5a2 2 0 0 1 2-2zM14 3v4h4M9 13h6",
  },
  {
    id: "calendario",
    label: "Calendario",
    icon: "M4 8h16M7 3v3M17 3v3M5 5h14v14H5z",
  },
  {
    id: "config",
    label: "Configuración",
    icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 12a8 8 0 0 1 16 0",
  },
  {
    id: "admin",
    label: "Administración",
    icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z",
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
    id: "usuarios",
    label: "Usuarios",
    href: "/system/usuarios",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    id: "roles",
    label: "Roles y permisos",
    href: "/system/roles",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    id: "configuracion",
    label: "Configuración",
    href: "/system/configuracion",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    id: "indicadores-def",
    label: "Definición de indicadores",
    href: "/system/indicadores",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    id: "plataforma",
    label: "Plataforma",
    href: "/system/platform",
    icon: "M5 12H3l9-9 9 9h-2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7",
  },
  {
    id: "wizard",
    label: "Asistente de instalación",
    href: "/system/platform/wizard",
    icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
  },
  {
    id: "diagnostico",
    label: "Diagnóstico",
    href: "/system/diagnostico",
    icon: "M22 12h-4l-3 9L9 3l-3 9H2",
  },
  {
    id: "sincronizacion",
    label: "Sincronización",
    href: "/system/sincronizacion",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  },
  {
    id: "auditoria",
    label: "Auditoría",
    href: "/system/auditoria",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
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
