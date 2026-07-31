/** Roles oficiales — jerarquía institucional UPES. */
export type RoleCode =
  | "ADMINISTRADOR_GENERAL"
  | "ADMINISTRADOR_UNIDAD"
  | "JEFE_UNIDAD"
  | "COORDINADOR"
  | "ANALISTA"
  | "USUARIO"
  | "CONSULTA";

export interface RoleDef {
  code: RoleCode;
  label: string;
  description: string;
}

export const ROLES: Record<RoleCode, RoleDef> = {
  ADMINISTRADOR_GENERAL: {
    code: "ADMINISTRADOR_GENERAL",
    label: "Administrador General",
    description: "Acceso transversal total — todas las unidades y configuraciones",
  },
  ADMINISTRADOR_UNIDAD: {
    code: "ADMINISTRADOR_UNIDAD",
    label: "Administrador de Unidad",
    description: "Administración completa de su unidad asignada",
  },
  JEFE_UNIDAD: {
    code: "JEFE_UNIDAD",
    label: "Jefe de Unidad",
    description: "Gestión operativa y estratégica de su workspace",
  },
  COORDINADOR: {
    code: "COORDINADOR",
    label: "Coordinador",
    description: "Coordinación de procesos, solicitudes y seguimiento",
  },
  ANALISTA: {
    code: "ANALISTA",
    label: "Analista",
    description: "Trabajo analítico, registro de indicadores y KPIs",
  },
  USUARIO: {
    code: "USUARIO",
    label: "Usuario",
    description: "Operaciones básicas dentro de un workspace",
  },
  CONSULTA: {
    code: "CONSULTA",
    label: "Consulta",
    description: "Solo lectura — no puede crear ni modificar datos",
  },
};

/**
 * Demo toggle: Administrador General vs Usuario operativo.
 */
export type DemoRole = "admin" | "operativo";

export function demoRoleToCode(role: DemoRole): RoleCode {
  return role === "admin" ? "ADMINISTRADOR_GENERAL" : "USUARIO";
}

export function demoRoleLabel(role: DemoRole): string {
  return role === "admin" ? "Administrador General" : "Usuario Operativo";
}

/** Roles that cannot be self-assigned via registration or user creation forms. */
export const PROTECTED_ROLES: ReadonlySet<RoleCode> = new Set([
  "ADMINISTRADOR_GENERAL",
  "ADMINISTRADOR_UNIDAD",
]);
