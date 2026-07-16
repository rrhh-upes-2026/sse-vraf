/** Roles oficiales — MASTER HANDOFF §10. */
export type RoleCode = "ADMIN" | "HEAD" | "ANALYST" | "OPS" | "AUDIT";

export interface RoleDef {
  code: RoleCode;
  label: string;
  description: string;
}

export const ROLES: Record<RoleCode, RoleDef> = {
  ADMIN: {
    code: "ADMIN",
    label: "Administrador General",
    description: "Acceso transversal total al sistema",
  },
  HEAD: {
    code: "HEAD",
    label: "Jefe de Unidad",
    description: "Gestiona su propio workspace",
  },
  ANALYST: {
    code: "ANALYST",
    label: "Analista",
    description: "Trabajo operativo avanzado",
  },
  OPS: {
    code: "OPS",
    label: "Operativo",
    description: "Ejecución de tareas asignadas",
  },
  AUDIT: {
    code: "AUDIT",
    label: "Auditor",
    description: "Solo lectura transversal",
  },
};

/**
 * The prototype only ever exposes a 2-way demo toggle in the sidebar footer
 * (Administrador General vs Usuario Operativo) — mirrored here rather than
 * inventing a 5-way switcher the original navigation never had.
 */
export type DemoRole = "admin" | "operativo";

export function demoRoleToCode(role: DemoRole): RoleCode {
  return role === "admin" ? "ADMIN" : "OPS";
}

export function demoRoleLabel(role: DemoRole): string {
  return role === "admin" ? "Administrador General" : "Usuario Operativo";
}
