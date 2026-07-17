"use client";

import { useState, useEffect, useCallback } from "react";
import type { WorkspaceId } from "@/config/nav";
import { WorkspaceAdminService } from "@/services/workspace-admin";
import type {
  ProcessBlueprint,
  WorkspaceKPI,
  RequestType,
  FormBlueprint,
  WorkspaceDocument,
  NotificationRule,
  WorkspaceAutomation,
  WorkspaceUser,
  WorkspaceSettings,
  AuditRecord,
  ObjectLifecycle,
} from "@/types/workspace-admin";

function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(() => {
    setLoading(true);
    setError(null);
    fetcher()
      .then(setData)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run };
}

export function useBlueprints(wsId: WorkspaceId) {
  return useAsync(() => WorkspaceAdminService.listBlueprints(wsId), [wsId]);
}

export function useKPIs(wsId: WorkspaceId) {
  return useAsync(() => WorkspaceAdminService.listKPIs(wsId), [wsId]);
}

export function useRequestTypes(wsId: WorkspaceId) {
  return useAsync(() => WorkspaceAdminService.listRequestTypes(wsId), [wsId]);
}

export function useAutomations(wsId: WorkspaceId) {
  return useAsync(() => WorkspaceAdminService.listAutomations(wsId), [wsId]);
}

export function useWorkspaceUsers(wsId: WorkspaceId) {
  return useAsync(() => WorkspaceAdminService.listUsers(wsId), [wsId]);
}

export function useWorkspaceSettings(wsId: WorkspaceId) {
  return useAsync(() => WorkspaceAdminService.getSettings(wsId), [wsId]);
}

export function useAuditRecords(wsId: WorkspaceId) {
  return useAsync(() => WorkspaceAdminService.listAuditRecords(wsId), [wsId]);
}

export function useForms(wsId: WorkspaceId) {
  return useAsync(() => WorkspaceAdminService.listForms(wsId), [wsId]);
}

export function useDocuments(wsId: WorkspaceId) {
  return useAsync(() => WorkspaceAdminService.listDocuments(wsId), [wsId]);
}

export function useNotificationRules(wsId: WorkspaceId) {
  return useAsync(() => WorkspaceAdminService.listNotificationRules(wsId), [wsId]);
}

// ── Computed helpers ──────────────────────────────────────────────────────────

export function lifecycleBadge(lc: ObjectLifecycle): { label: string; color: string } {
  switch (lc) {
    case "draft":       return { label: "Borrador",    color: "#637083" };
    case "published":   return { label: "Publicado",   color: "#12A150" };
    case "archived":    return { label: "Archivado",   color: "#E5A100" };
    case "deprecated":  return { label: "Deprecado",   color: "#E54D4D" };
  }
}

export type { ProcessBlueprint, WorkspaceKPI, RequestType, FormBlueprint, WorkspaceDocument, NotificationRule, WorkspaceAutomation, WorkspaceUser, WorkspaceSettings, AuditRecord };
