import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import type {
  ISPDashboard,
  ISPUser,
  ISPRole,
  ISPPermission,
  ISPSession,
  ISPAuditLog,
  ISPConfig,
  ISPPermissionMatrixResult,
  ISPCheckPermissionResult,
  ISPLoginResult,
  ISPValidateSessionResult,
  ISPUsersParams,
  ISPSessionsParams,
  ISPAuditParams,
  ISPCreateUserParams,
  ISPUpdateUserParams,
  ISPCreateRoleParams,
  ISPUpdateRoleParams,
  ISPAssignPermissionsParams,
  ISPLoginParams,
  ISPUpdateConfigParams,
  ISPUserStatus,
} from "@/types/isp";

const WS = "isp";
const c = () => getAppsScriptClient();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = (v: unknown): Record<string, unknown> => (v ?? {}) as any;

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getISPDashboard(): Promise<ISPDashboard> {
  return c().call<ISPDashboard>(`${WS}.getDashboard`, {});
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getISPUsers(params?: ISPUsersParams): Promise<ISPUser[]> {
  return c().call<ISPUser[]>(`${WS}.getUsers`, p(params));
}

export async function getISPUser(id: string): Promise<ISPUser> {
  return c().call<ISPUser>(`${WS}.getUser`, { id });
}

export async function createISPUser(params: ISPCreateUserParams): Promise<ISPUser> {
  return c().call<ISPUser>(`${WS}.createUser`, p(params));
}

export async function updateISPUser(params: ISPUpdateUserParams): Promise<ISPUser> {
  return c().call<ISPUser>(`${WS}.updateUser`, p(params));
}

export async function setISPUserStatus(userId: string, status: ISPUserStatus): Promise<ISPUser> {
  return c().call<ISPUser>(`${WS}.setUserStatus`, { userId, status });
}

// ─── Roles ────────────────────────────────────────────────────────────────────

export async function getISPRoles(): Promise<ISPRole[]> {
  return c().call<ISPRole[]>(`${WS}.getRoles`, {});
}

export async function getISPRole(id: string): Promise<ISPRole> {
  return c().call<ISPRole>(`${WS}.getRole`, { id });
}

export async function createISPRole(params: ISPCreateRoleParams): Promise<ISPRole> {
  return c().call<ISPRole>(`${WS}.createRole`, p(params));
}

export async function updateISPRole(params: ISPUpdateRoleParams): Promise<ISPRole> {
  return c().call<ISPRole>(`${WS}.updateRole`, p(params));
}

export async function deleteISPRole(id: string): Promise<{ deleted: boolean; id: string }> {
  return c().call(`${WS}.deleteRole`, { id });
}

export async function duplicateISPRole(id: string): Promise<ISPRole> {
  return c().call<ISPRole>(`${WS}.duplicateRole`, { id });
}

// ─── Permissions ──────────────────────────────────────────────────────────────

export async function getISPPermissions(module?: string): Promise<ISPPermission[]> {
  return c().call<ISPPermission[]>(`${WS}.getPermissions`, module ? { module } : {});
}

export async function getISPRolePermissions(roleId: string): Promise<ISPPermission[]> {
  return c().call<ISPPermission[]>(`${WS}.getRolePermissions`, { roleId });
}

export async function assignISPPermissions(params: ISPAssignPermissionsParams): Promise<{ assigned: number; roleId: string }> {
  return c().call(`${WS}.assignPermissions`, p(params));
}

export async function checkISPPermission(userId: string, module: string, action: string): Promise<ISPCheckPermissionResult> {
  return c().call<ISPCheckPermissionResult>(`${WS}.checkPermission`, { userId, module, action });
}

export async function getISPPermissionMatrix(): Promise<ISPPermissionMatrixResult> {
  return c().call<ISPPermissionMatrixResult>(`${WS}.getPermissionMatrix`, {});
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function getISPSessions(params?: ISPSessionsParams): Promise<ISPSession[]> {
  return c().call<ISPSession[]>(`${WS}.getSessions`, p(params));
}

export async function closeISPSession(sessionId: string): Promise<{ closed: boolean; sessionId: string }> {
  return c().call(`${WS}.closeSession`, { sessionId });
}

export async function closeAllISPSessions(userId: string): Promise<{ closed: number }> {
  return c().call(`${WS}.closeAllUserSessions`, { userId });
}

// ─── Authentication ───────────────────────────────────────────────────────────

export async function ispLogin(params: ISPLoginParams): Promise<ISPLoginResult> {
  return c().call<ISPLoginResult>(`${WS}.login`, p(params));
}

export async function ispLogout(sessionId: string): Promise<{ success: boolean }> {
  return c().call(`${WS}.logout`, { sessionId });
}

export async function ispValidateSession(sessionId: string): Promise<ISPValidateSessionResult> {
  return c().call<ISPValidateSessionResult>(`${WS}.validateSession`, { sessionId });
}

export async function ispRenewSession(sessionId: string): Promise<{ renewed: boolean; sessionId: string; expiresAt: string }> {
  return c().call(`${WS}.renewSession`, { sessionId });
}

// ─── Audit ────────────────────────────────────────────────────────────────────

export async function getISPAuditLogs(params?: ISPAuditParams): Promise<ISPAuditLog[]> {
  return c().call<ISPAuditLog[]>(`${WS}.getAuditLogs`, p(params));
}

// ─── Config ───────────────────────────────────────────────────────────────────

export async function getISPConfig(): Promise<ISPConfig> {
  return c().call<ISPConfig>(`${WS}.getConfig`, {});
}

export async function updateISPConfig(params: ISPUpdateConfigParams): Promise<ISPConfig> {
  return c().call<ISPConfig>(`${WS}.updateConfig`, p(params));
}
