import type { ModuleManifest } from "@/lib/sdk/types";

export const ispManifest: ModuleManifest = {
  id: "isp",
  name: "Identity & Security Platform",
  version: "1.0.0",
  coreVersion: "^1.0.0",
  description:
    "Plataforma centralizada de Identidad y Seguridad. Gestión de usuarios, roles, permisos " +
    "RBAC, sesiones, auditoría de acceso y preparación de contratos para Google OAuth. " +
    "Única autoridad de autenticación y autorización de la plataforma.",
  icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",

  workspace: {
    id: "isp",
    short: "Identidad",
    full: "Identity & Security Platform",
    color: "#1E3A8A",
    bg: "#EFF6FF",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },

  permissions: [
    { key: "isp.read",             description: "Ver usuarios, roles y sesiones propias" },
    { key: "isp.users.manage",     description: "CRUD completo de usuarios" },
    { key: "isp.roles.manage",     description: "CRUD completo de roles" },
    { key: "isp.permissions.manage", description: "Gestionar matriz de permisos RBAC" },
    { key: "isp.sessions.manage",  description: "Ver y cerrar sesiones activas" },
    { key: "isp.audit.read",       description: "Ver registros de auditoría" },
    { key: "isp.config.manage",    description: "Modificar configuración de seguridad" },
    { key: "isp.admin",            description: "Administración total de la plataforma ISP" },
  ],

  entities: [
    { id: "ispUsers",           sheetName: "ISP_Users",           label: "Usuarios" },
    { id: "ispRoles",           sheetName: "ISP_Roles",           label: "Roles" },
    { id: "ispPermissions",     sheetName: "ISP_Permissions",     label: "Permisos" },
    { id: "ispRolePermissions", sheetName: "ISP_RolePermissions", label: "Permisos por Rol" },
    { id: "ispSessions",        sheetName: "ISP_Sessions",        label: "Sesiones" },
    { id: "ispAuditLogs",       sheetName: "ISP_AuditLogs",       label: "Auditoría" },
    { id: "ispConfig",          sheetName: "ISP_Config",          label: "Configuración" },
  ],

  navigation: {
    extensions: [
      {
        id:    "isp-dashboard",
        label: "Dashboard",
        icon:  "M4 20V10M10 20V4M16 20v-7M4 20h16",
        href:  "isp-dashboard",
        order: 1,
      },
      {
        id:    "isp-usuarios",
        label: "Usuarios",
        icon:  "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
        href:  "isp-usuarios",
        order: 2,
      },
      {
        id:    "isp-roles",
        label: "Roles",
        icon:  "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
        href:  "isp-roles",
        order: 3,
      },
      {
        id:    "isp-permisos",
        label: "Permisos",
        icon:  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
        href:  "isp-permisos",
        order: 4,
      },
      {
        id:    "isp-sesiones",
        label: "Sesiones",
        icon:  "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z",
        href:  "isp-sesiones",
        order: 5,
      },
      {
        id:    "isp-auditoria",
        label: "Auditoría",
        icon:  "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        href:  "isp-auditoria",
        order: 6,
      },
      {
        id:    "isp-configuracion",
        label: "Configuración",
        icon:  "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
        href:  "isp-configuracion",
        order: 7,
      },
    ],
  },

  featureFlags: [
    { key: "isp.enabled",      envVar: "NEXT_PUBLIC_FLAG_ISP",           description: "Habilitar Identity & Security Platform" },
    { key: "isp.rbac.strict",  envVar: "NEXT_PUBLIC_FLAG_ISP_RBAC",      description: "Enforce RBAC en todas las rutas" },
    { key: "isp.google.ready", envVar: "NEXT_PUBLIC_FLAG_ISP_GOOGLE",    description: "Contratos Google OAuth preparados (Sprint 013)" },
  ],

  dependencies: [],
  status: "enabled",
};
