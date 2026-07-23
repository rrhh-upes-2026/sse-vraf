// ISP — Identity & Security Platform

export type ISPUserStatus    = "activo" | "inactivo" | "bloqueado" | "pendiente";
export type ISPSessionStatus = "activa" | "expirada" | "cerrada" | "invalida";
export type ISPAuditResult   = "exitoso" | "fallido" | "denegado";

export type ISPAuditAction =
  | "login"
  | "logout"
  | "login_failed"
  | "access_denied"
  | "permission_changed"
  | "role_changed"
  | "user_created"
  | "user_updated"
  | "user_locked"
  | "user_unlocked"
  | "session_expired"
  | "session_closed"
  | "role_created"
  | "role_updated"
  | "role_deleted"
  | "permission_created"
  | "config_changed";

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface ISPUser {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  username: string;
  status: ISPUserStatus;
  roleId: string;
  roleName?: string;
  organizationalUnitId: string;
  lastLogin?: string;
  failedAttempts: number;
  lockedUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISPRole {
  id: string;
  name: string;
  description: string;
  level: number;
  isSystem: boolean;
  permissionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ISPPermission {
  id: string;
  module: string;
  action: string;
  description: string;
  createdAt: string;
}

export interface ISPRolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  revoked: boolean;
  createdAt: string;
}

export interface ISPSession {
  id: string;
  userId: string;
  userEmail?: string;
  loginAt: string;
  lastActivity: string;
  expiresAt: string;
  ipAddress: string;
  userAgent: string;
  status: ISPSessionStatus;
}

export interface ISPAuditLog {
  id: string;
  userId: string;
  userEmail?: string;
  action: ISPAuditAction;
  module: string;
  entity?: string;
  entityId?: string;
  result: ISPAuditResult;
  ipAddress?: string;
  timestamp: string;
  details: Record<string, unknown>;
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

export interface ISPDashboard {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  lockedUsers: number;
  activeSessions: number;
  expiredSessions: number;
  failedAttemptsToday: number;
  totalRoles: number;
  totalPermissions: number;
  recentActivity: ISPAuditLog[];
  activityByDay: { date: string; count: number }[];
  generatedAt: string;
}

// ─── Config ────────────────────────────────────────────────────────────────

export interface ISPConfig {
  maxSessionDurationMinutes: number;
  maxFailedAttempts: number;
  lockDurationMinutes: number;
  multipleSessionsAllowed: boolean;
  googleOAuthPrepared: boolean;
}

// ─── RBAC ──────────────────────────────────────────────────────────────────

export interface ISPPermissionMatrixEntry {
  roleId: string;
  roleName: string;
  level: number;
  permissions: Record<string, boolean>;
}

export interface ISPPermissionMatrixResult {
  roles: ISPRole[];
  permissions: ISPPermission[];
  matrix: ISPPermissionMatrixEntry[];
}

export interface ISPCheckPermissionResult {
  allowed: boolean;
  reason?: string;
}

// ─── Auth results ──────────────────────────────────────────────────────────

export interface ISPLoginResult {
  success: boolean;
  sessionId?: string;
  userId?: string;
  roleId?: string;
  roleName?: string;
  message?: string;
}

export interface ISPValidateSessionResult {
  valid: boolean;
  userId?: string;
  sessionId?: string;
  expiresAt?: string;
  roleName?: string;
}

// ─── Google contracts (Sprint 013 preparation — not implemented) ───────────

export interface ISPGoogleOAuthContract {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface ISPGoogleIdentityContract {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  hd?: string;
}

export interface ISPGoogleWorkspaceContract {
  domain: string;
  adminEmail: string;
  directoryScopes: string[];
}

// ─── Query params ──────────────────────────────────────────────────────────

export interface ISPUsersParams {
  status?: ISPUserStatus;
  roleId?: string;
  organizationalUnitId?: string;
  search?: string;
  limit?: number;
}

export interface ISPSessionsParams {
  userId?: string;
  status?: ISPSessionStatus;
  from?: string;
  to?: string;
  limit?: number;
}

export interface ISPAuditParams {
  userId?: string;
  module?: string;
  action?: ISPAuditAction;
  result?: ISPAuditResult;
  from?: string;
  to?: string;
  limit?: number;
}

// ─── Mutation params ────────────────────────────────────────────────────────

export interface ISPCreateUserParams {
  employeeId: string;
  fullName: string;
  email: string;
  username: string;
  password: string;
  roleId: string;
  organizationalUnitId?: string;
}

export interface ISPUpdateUserParams {
  id: string;
  fullName?: string;
  roleId?: string;
  organizationalUnitId?: string;
  status?: ISPUserStatus;
}

export interface ISPCreateRoleParams {
  name: string;
  description: string;
  level?: number;
}

export interface ISPUpdateRoleParams {
  id: string;
  name?: string;
  description?: string;
  level?: number;
}

export interface ISPAssignPermissionsParams {
  roleId: string;
  permissionIds: string[];
}

export interface ISPLoginParams {
  username: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ISPUpdateConfigParams extends Partial<ISPConfig> {}
