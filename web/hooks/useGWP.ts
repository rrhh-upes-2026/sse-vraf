"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGWPDashboard, getGWPAuthUrl, handleGWPCallback, getGWPOAuthStatus,
  revokeGWPToken, refreshGWPToken,
  getGWPConfig, updateGWPConfig,
  gwpCreateFolder, gwpFindFolder, gwpUploadFile, gwpUpdateFile,
  gwpMoveFile, gwpDeleteFile, gwpShareFile, gwpGetFileMetadata,
  gwpGenerateLink, gwpListVersions, gwpGetDriveQuota,
  gwpSendMail, gwpReplyToThread, gwpGetMailLogs,
  gwpCreateEvent, gwpUpdateEvent, gwpDeleteEvent,
  gwpCheckAvailability, gwpListEvents,
  gwpListSpaces, gwpSendChatMessage, gwpCreateChatCard,
  gwpReplyToSpace, gwpGetChatLogs,
  gwpGetAuditLog,
} from "@/services/gwp";
import type {
  GWPUpdateConfigParams, GWPSendMailParams, GWPReplyThreadParams,
  GWPCreateEventParams, GWPUpdateEventParams,
  GWPSendChatParams, GWPCreateCardParams, GWPReplySpaceParams,
  GWPDriveUploadParams, GWPDriveUpdateParams, GWPShareFileParams,
  GWPCheckAvailabilityParams, GWPAuditParams,
  GWPListEventsParams, GWPGetMailLogsParams, GWPGetChatLogsParams,
} from "@/types/gwp";

// ─── Query keys ───────────────────────────────────────────────────────────────

const K = {
  dashboard:    (uid?: string)  => ["gwp", "dashboard", uid]     as const,
  oauthStatus:  (uid?: string)  => ["gwp", "oauth-status", uid]  as const,
  config:                          ["gwp", "config"]              as const,
  driveQuota:   (uid: string)   => ["gwp", "drive-quota", uid]   as const,
  mailLogs:     (p?: GWPGetMailLogsParams)   => ["gwp", "mail-logs", p]    as const,
  events:       (p?: GWPListEventsParams)    => ["gwp", "events", p]       as const,
  spaces:       (uid: string)   => ["gwp", "spaces", uid]        as const,
  chatLogs:     (p?: GWPGetChatLogsParams)   => ["gwp", "chat-logs", p]    as const,
  auditLog:     (p?: GWPAuditParams)         => ["gwp", "audit", p]        as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useGWPDashboard(userId?: string) {
  return useQuery({ queryKey: K.dashboard(userId), queryFn: () => getGWPDashboard(userId) });
}

export function useGWPOAuthStatus(userId?: string) {
  return useQuery({
    queryKey: K.oauthStatus(userId),
    queryFn:  () => getGWPOAuthStatus(userId),
    refetchInterval: 30_000,
  });
}

export function useGWPConfig() {
  return useQuery({ queryKey: K.config, queryFn: getGWPConfig });
}

export function useGWPDriveQuota(userId: string) {
  return useQuery({
    queryKey: K.driveQuota(userId),
    queryFn:  () => gwpGetDriveQuota(userId),
    enabled:  !!userId,
  });
}

export function useGWPMailLogs(params?: GWPGetMailLogsParams) {
  return useQuery({ queryKey: K.mailLogs(params), queryFn: () => gwpGetMailLogs(params) });
}

export function useGWPEvents(params: GWPListEventsParams) {
  return useQuery({
    queryKey: K.events(params),
    queryFn:  () => gwpListEvents(params),
    enabled:  !!params.userId,
  });
}

export function useGWPSpaces(userId: string) {
  return useQuery({
    queryKey: K.spaces(userId),
    queryFn:  () => gwpListSpaces(userId),
    enabled:  !!userId,
  });
}

export function useGWPChatLogs(params?: GWPGetChatLogsParams) {
  return useQuery({ queryKey: K.chatLogs(params), queryFn: () => gwpGetChatLogs(params) });
}

export function useGWPAuditLog(params?: GWPAuditParams) {
  return useQuery({ queryKey: K.auditLog(params), queryFn: () => gwpGetAuditLog(params) });
}

// ─── Auth mutations ───────────────────────────────────────────────────────────

export function useGetGWPAuthUrl() {
  return useMutation({ mutationFn: (redirectUri?: string) => getGWPAuthUrl(redirectUri) });
}

export function useHandleGWPCallback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, state, redirectUri }: { code: string; state: string; redirectUri?: string }) =>
      handleGWPCallback(code, state, redirectUri),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gwp"] });
    },
  });
}

export function useRevokeGWPToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => revokeGWPToken(userId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gwp"] }); },
  });
}

export function useRefreshGWPToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => refreshGWPToken(userId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gwp", "oauth-status"] }); },
  });
}

// ─── Config mutations ─────────────────────────────────────────────────────────

export function useUpdateGWPConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: GWPUpdateConfigParams) => updateGWPConfig(params),
    onSuccess: () => { qc.invalidateQueries({ queryKey: K.config }); },
  });
}

// ─── Drive mutations ──────────────────────────────────────────────────────────

export function useGWPCreateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, name, parentId }: { userId: string; name: string; parentId?: string }) =>
      gwpCreateFolder(userId, name, parentId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gwp", "drive-quota"] }); },
  });
}

export function useGWPFindFolder() {
  return useMutation({
    mutationFn: ({ userId, name, parentId }: { userId: string; name: string; parentId?: string }) =>
      gwpFindFolder(userId, name, parentId),
  });
}

export function useGWPUploadFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: GWPDriveUploadParams) => gwpUploadFile(params),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gwp", "drive-quota"] }); },
  });
}

export function useGWPUpdateFile() {
  return useMutation({ mutationFn: (params: GWPDriveUpdateParams) => gwpUpdateFile(params) });
}

export function useGWPMoveFile() {
  return useMutation({
    mutationFn: ({ userId, fileId, newParentId, oldParentId }: { userId: string; fileId: string; newParentId: string; oldParentId?: string }) =>
      gwpMoveFile(userId, fileId, newParentId, oldParentId),
  });
}

export function useGWPDeleteFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, fileId }: { userId: string; fileId: string }) => gwpDeleteFile(userId, fileId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gwp", "drive-quota"] }); },
  });
}

export function useGWPShareFile() {
  return useMutation({ mutationFn: (params: GWPShareFileParams) => gwpShareFile(params) });
}

export function useGWPGetFileMetadata() {
  return useMutation({
    mutationFn: ({ userId, fileId }: { userId: string; fileId: string }) => gwpGetFileMetadata(userId, fileId),
  });
}

export function useGWPGenerateLink() {
  return useMutation({
    mutationFn: ({ userId, fileId }: { userId: string; fileId: string }) => gwpGenerateLink(userId, fileId),
  });
}

export function useGWPListVersions() {
  return useMutation({
    mutationFn: ({ userId, fileId }: { userId: string; fileId: string }) => gwpListVersions(userId, fileId),
  });
}

// ─── Gmail mutations ──────────────────────────────────────────────────────────

export function useGWPSendMail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: GWPSendMailParams) => gwpSendMail(params),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gwp", "mail-logs"] }); },
  });
}

export function useGWPReplyToThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: GWPReplyThreadParams) => gwpReplyToThread(params),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gwp", "mail-logs"] }); },
  });
}

// ─── Calendar mutations ───────────────────────────────────────────────────────

export function useGWPCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: GWPCreateEventParams) => gwpCreateEvent(params),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gwp", "events"] }); },
  });
}

export function useGWPUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: GWPUpdateEventParams) => gwpUpdateEvent(params),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gwp", "events"] }); },
  });
}

export function useGWPDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, eventId, calendarId }: { userId: string; eventId: string; calendarId?: string }) =>
      gwpDeleteEvent(userId, eventId, calendarId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gwp", "events"] }); },
  });
}

export function useGWPCheckAvailability() {
  return useMutation({
    mutationFn: (params: GWPCheckAvailabilityParams) => gwpCheckAvailability(params),
  });
}

// ─── Chat mutations ───────────────────────────────────────────────────────────

export function useGWPSendChatMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: GWPSendChatParams) => gwpSendChatMessage(params),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gwp", "chat-logs"] }); },
  });
}

export function useGWPCreateChatCard() {
  return useMutation({ mutationFn: (params: GWPCreateCardParams) => gwpCreateChatCard(params) });
}

export function useGWPReplyToSpace() {
  return useMutation({ mutationFn: (params: GWPReplySpaceParams) => gwpReplyToSpace(params) });
}
