import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import type {
  GWPDashboard,
  GWPConfig,
  GWPOAuthStatus,
  GWPAuthUrlResult,
  GWPCallbackResult,
  GWPRevokeResult,
  GWPRefreshResult,
  GWPDriveFile,
  GWPDriveRevision,
  GWPDriveQuota,
  GWPGenerateLinkResult,
  GWPMailLog,
  GWPCalendarEvent,
  GWPAvailabilityResult,
  GWPChatSpace,
  GWPChatLog,
  GWPAuditEntry,
  GWPUpdateConfigParams,
  GWPSendMailParams,
  GWPReplyThreadParams,
  GWPCreateEventParams,
  GWPUpdateEventParams,
  GWPSendChatParams,
  GWPCreateCardParams,
  GWPReplySpaceParams,
  GWPDriveUploadParams,
  GWPDriveUpdateParams,
  GWPShareFileParams,
  GWPCheckAvailabilityParams,
  GWPAuditParams,
  GWPListEventsParams,
  GWPGetMailLogsParams,
  GWPGetChatLogsParams,
} from "@/types/gwp";

const WS = "gwp";
const c  = () => getAppsScriptClient();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p  = (v: unknown): Record<string, unknown> => (v ?? {}) as any;

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getGWPDashboard(userId?: string): Promise<GWPDashboard> {
  return c().call<GWPDashboard>(`${WS}.getDashboard`, userId ? { userId } : {});
}

// ─── OAuth ────────────────────────────────────────────────────────────────────

export async function getGWPAuthUrl(redirectUri?: string): Promise<GWPAuthUrlResult> {
  return c().call<GWPAuthUrlResult>(`${WS}.getAuthUrl`, redirectUri ? { redirectUri } : {});
}

export async function handleGWPCallback(code: string, state: string, redirectUri?: string): Promise<GWPCallbackResult> {
  return c().call<GWPCallbackResult>(`${WS}.handleCallback`, { code, state, ...(redirectUri ? { redirectUri } : {}) });
}

export async function getGWPOAuthStatus(userId?: string): Promise<GWPOAuthStatus> {
  return c().call<GWPOAuthStatus>(`${WS}.getOAuthStatus`, userId ? { userId } : {});
}

export async function revokeGWPToken(userId: string): Promise<GWPRevokeResult> {
  return c().call<GWPRevokeResult>(`${WS}.revokeToken`, { userId });
}

export async function refreshGWPToken(userId: string): Promise<GWPRefreshResult> {
  return c().call<GWPRefreshResult>(`${WS}.refreshToken`, { userId });
}

// ─── Config ───────────────────────────────────────────────────────────────────

export async function getGWPConfig(): Promise<GWPConfig> {
  return c().call<GWPConfig>(`${WS}.getConfig`, {});
}

export async function updateGWPConfig(params: GWPUpdateConfigParams): Promise<GWPConfig> {
  return c().call<GWPConfig>(`${WS}.updateConfig`, p(params));
}

// ─── Drive ────────────────────────────────────────────────────────────────────

export async function gwpCreateFolder(userId: string, name: string, parentId?: string): Promise<GWPDriveFile> {
  return c().call<GWPDriveFile>(`${WS}.createFolder`, { userId, name, ...(parentId ? { parentId } : {}) });
}

export async function gwpFindFolder(userId: string, name: string, parentId?: string): Promise<GWPDriveFile[]> {
  return c().call<GWPDriveFile[]>(`${WS}.findFolder`, { userId, name, ...(parentId ? { parentId } : {}) });
}

export async function gwpUploadFile(params: GWPDriveUploadParams): Promise<GWPDriveFile> {
  return c().call<GWPDriveFile>(`${WS}.uploadFile`, p(params));
}

export async function gwpUpdateFile(params: GWPDriveUpdateParams): Promise<GWPDriveFile> {
  return c().call<GWPDriveFile>(`${WS}.updateFile`, p(params));
}

export async function gwpMoveFile(userId: string, fileId: string, newParentId: string, oldParentId?: string): Promise<GWPDriveFile> {
  return c().call<GWPDriveFile>(`${WS}.moveFile`, { userId, fileId, newParentId, ...(oldParentId ? { oldParentId } : {}) });
}

export async function gwpDeleteFile(userId: string, fileId: string): Promise<{ success: boolean; fileId: string }> {
  return c().call(`${WS}.deleteFile`, { userId, fileId });
}

export async function gwpShareFile(params: GWPShareFileParams): Promise<{ id: string; role: string; type: string }> {
  return c().call(`${WS}.shareFile`, p(params));
}

export async function gwpGetFileMetadata(userId: string, fileId: string): Promise<GWPDriveFile> {
  return c().call<GWPDriveFile>(`${WS}.getFileMetadata`, { userId, fileId });
}

export async function gwpGenerateLink(userId: string, fileId: string): Promise<GWPGenerateLinkResult> {
  return c().call<GWPGenerateLinkResult>(`${WS}.generateLink`, { userId, fileId });
}

export async function gwpListVersions(userId: string, fileId: string): Promise<GWPDriveRevision[]> {
  return c().call<GWPDriveRevision[]>(`${WS}.listVersions`, { userId, fileId });
}

export async function gwpGetDriveQuota(userId: string): Promise<GWPDriveQuota> {
  return c().call<GWPDriveQuota>(`${WS}.getDriveQuota`, { userId });
}

// ─── Gmail ────────────────────────────────────────────────────────────────────

export async function gwpSendMail(params: GWPSendMailParams): Promise<GWPMailLog> {
  return c().call<GWPMailLog>(`${WS}.sendMail`, p(params));
}

export async function gwpReplyToThread(params: GWPReplyThreadParams): Promise<GWPMailLog> {
  return c().call<GWPMailLog>(`${WS}.replyToThread`, p(params));
}

export async function gwpGetMailLogs(params?: GWPGetMailLogsParams): Promise<GWPMailLog[]> {
  return c().call<GWPMailLog[]>(`${WS}.getMailLogs`, p(params));
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

export async function gwpCreateEvent(params: GWPCreateEventParams): Promise<GWPCalendarEvent> {
  return c().call<GWPCalendarEvent>(`${WS}.createEvent`, p(params));
}

export async function gwpUpdateEvent(params: GWPUpdateEventParams): Promise<GWPCalendarEvent> {
  return c().call<GWPCalendarEvent>(`${WS}.updateEvent`, p(params));
}

export async function gwpDeleteEvent(userId: string, eventId: string, calendarId?: string): Promise<{ success: boolean; eventId: string }> {
  return c().call(`${WS}.deleteEvent`, { userId, eventId, ...(calendarId ? { calendarId } : {}) });
}

export async function gwpCheckAvailability(params: GWPCheckAvailabilityParams): Promise<GWPAvailabilityResult> {
  return c().call<GWPAvailabilityResult>(`${WS}.checkAvailability`, p(params));
}

export async function gwpListEvents(params: GWPListEventsParams): Promise<GWPCalendarEvent[]> {
  return c().call<GWPCalendarEvent[]>(`${WS}.listEvents`, p(params));
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export async function gwpListSpaces(userId: string): Promise<GWPChatSpace[]> {
  return c().call<GWPChatSpace[]>(`${WS}.listSpaces`, { userId });
}

export async function gwpSendChatMessage(params: GWPSendChatParams): Promise<GWPChatLog> {
  return c().call<GWPChatLog>(`${WS}.sendChatMessage`, p(params));
}

export async function gwpCreateChatCard(params: GWPCreateCardParams): Promise<unknown> {
  return c().call(`${WS}.createChatCard`, p(params));
}

export async function gwpReplyToSpace(params: GWPReplySpaceParams): Promise<unknown> {
  return c().call(`${WS}.replyToSpace`, p(params));
}

export async function gwpGetChatLogs(params?: GWPGetChatLogsParams): Promise<GWPChatLog[]> {
  return c().call<GWPChatLog[]>(`${WS}.getChatLogs`, p(params));
}

// ─── Audit ────────────────────────────────────────────────────────────────────

export async function gwpGetAuditLog(params?: GWPAuditParams): Promise<GWPAuditEntry[]> {
  return c().call<GWPAuditEntry[]>(`${WS}.getAuditLog`, p(params));
}
