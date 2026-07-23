"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getISPDashboard,
  getISPUsers, getISPUser, createISPUser, updateISPUser, setISPUserStatus,
  getISPRoles, getISPRole, createISPRole, updateISPRole, deleteISPRole, duplicateISPRole,
  getISPPermissions, getISPRolePermissions, assignISPPermissions, checkISPPermission, getISPPermissionMatrix,
  getISPSessions, closeISPSession, closeAllISPSessions,
  ispLogin, ispLogout, ispValidateSession, ispRenewSession,
  getISPAuditLogs,
  getISPConfig, updateISPConfig,
} from "@/services/isp";
import type {
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

// ─── Query keys ───────────────────────────────────────────────────────────────

const K = {
  dashboard:        ["isp", "dashboard"] as const,
  users:            (p?: ISPUsersParams) => ["isp", "users", p] as const,
  user:             (id: string) => ["isp", "user", id] as const,
  roles:            ["isp", "roles"] as const,
  role:             (id: string) => ["isp", "role", id] as const,
  permissions:      (module?: string) => ["isp", "permissions", module] as const,
  rolePermissions:  (roleId: string) => ["isp", "role-permissions", roleId] as const,
  permissionMatrix: ["isp", "permission-matrix"] as const,
  sessions:         (p?: ISPSessionsParams) => ["isp", "sessions", p] as const,
  auditLogs:        (p?: ISPAuditParams) => ["isp", "audit", p] as const,
  config:           ["isp", "config"] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useISPDashboard() {
  return useQuery({ queryKey: K.dashboard, queryFn: getISPDashboard });
}

export function useISPUsers(params?: ISPUsersParams) {
  return useQuery({ queryKey: K.users(params), queryFn: () => getISPUsers(params) });
}

export function useISPUser(id: string) {
  return useQuery({ queryKey: K.user(id), queryFn: () => getISPUser(id), enabled: !!id });
}

export function useISPRoles() {
  return useQuery({ queryKey: K.roles, queryFn: getISPRoles });
}

export function useISPRole(id: string) {
  return useQuery({ queryKey: K.role(id), queryFn: () => getISPRole(id), enabled: !!id });
}

export function useISPPermissions(module?: string) {
  return useQuery({ queryKey: K.permissions(module), queryFn: () => getISPPermissions(module) });
}

export function useISPRolePermissions(roleId: string) {
  return useQuery({
    queryKey: K.rolePermissions(roleId),
    queryFn:  () => getISPRolePermissions(roleId),
    enabled:  !!roleId,
  });
}

export function useISPPermissionMatrix() {
  return useQuery({ queryKey: K.permissionMatrix, queryFn: getISPPermissionMatrix });
}

export function useISPSessions(params?: ISPSessionsParams) {
  return useQuery({ queryKey: K.sessions(params), queryFn: () => getISPSessions(params) });
}

export function useISPAuditLogs(params?: ISPAuditParams) {
  return useQuery({ queryKey: K.auditLogs(params), queryFn: () => getISPAuditLogs(params) });
}

export function useISPConfig() {
  return useQuery({ queryKey: K.config, queryFn: getISPConfig });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateISPUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: ISPCreateUserParams) => createISPUser(params),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["isp", "users"] }); qc.invalidateQueries({ queryKey: K.dashboard }); },
  });
}

export function useUpdateISPUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: ISPUpdateUserParams) => updateISPUser(params),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["isp", "users"] });
      qc.invalidateQueries({ queryKey: K.user(vars.id) });
    },
  });
}

export function useSetISPUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: ISPUserStatus }) => setISPUserStatus(userId, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["isp", "users"] }); qc.invalidateQueries({ queryKey: K.dashboard }); },
  });
}

export function useCreateISPRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: ISPCreateRoleParams) => createISPRole(params),
    onSuccess: () => { qc.invalidateQueries({ queryKey: K.roles }); qc.invalidateQueries({ queryKey: K.permissionMatrix }); },
  });
}

export function useUpdateISPRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: ISPUpdateRoleParams) => updateISPRole(params),
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: K.roles }); qc.invalidateQueries({ queryKey: K.role(vars.id) }); },
  });
}

export function useDeleteISPRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteISPRole(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: K.roles }); qc.invalidateQueries({ queryKey: K.permissionMatrix }); },
  });
}

export function useDuplicateISPRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateISPRole(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: K.roles }); },
  });
}

export function useAssignISPPermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: ISPAssignPermissionsParams) => assignISPPermissions(params),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: K.rolePermissions(vars.roleId) });
      qc.invalidateQueries({ queryKey: K.permissionMatrix });
      qc.invalidateQueries({ queryKey: K.roles });
    },
  });
}

export function useCloseISPSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => closeISPSession(sessionId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["isp", "sessions"] }); qc.invalidateQueries({ queryKey: K.dashboard }); },
  });
}

export function useCloseAllISPSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => closeAllISPSessions(userId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["isp", "sessions"] }); qc.invalidateQueries({ queryKey: K.dashboard }); },
  });
}

export function useISPLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: ISPLoginParams) => ispLogin(params),
    onSuccess: () => { qc.invalidateQueries({ queryKey: K.dashboard }); },
  });
}

export function useISPLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => ispLogout(sessionId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["isp", "sessions"] }); },
  });
}

export function useISPValidateSession() {
  return useMutation({ mutationFn: (sessionId: string) => ispValidateSession(sessionId) });
}

export function useISPRenewSession() {
  return useMutation({ mutationFn: (sessionId: string) => ispRenewSession(sessionId) });
}

export function useCheckISPPermission() {
  return useMutation({
    mutationFn: ({ userId, module, action }: { userId: string; module: string; action: string }) =>
      checkISPPermission(userId, module, action),
  });
}

export function useUpdateISPConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: ISPUpdateConfigParams) => updateISPConfig(params),
    onSuccess: () => { qc.invalidateQueries({ queryKey: K.config }); },
  });
}
