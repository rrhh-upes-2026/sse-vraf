// GWP — Google Workspace Integration Platform

export type GWPConnectionStatus = "connected" | "disconnected" | "error" | "pending";
export type GWPChatStatus       = "available" | "unavailable";
export type GWPMailStatus       = "sent" | "failed";
export type GWPEventStatus      = "confirmed" | "cancelled" | "tentative";
export type GWPSpaceType        = "ROOM" | "DM" | "GROUP_DM";
export type GWPFileRole         = "reader" | "writer" | "commenter" | "owner";
export type GWPReminderMethod   = "email" | "popup";

// ─── Config ────────────────────────────────────────────────────────────────────

export interface GWPConfig {
  clientId:         string;
  redirectUri:      string;
  scopes:           string[];
  workspaceDomain:  string;
  adminEmail:       string;
  connectionStatus: GWPConnectionStatus;
  connectedUser:    string;
  connectedDomain:  string;
  // clientSecret intentionally omitted — server-only
}

// ─── OAuth ─────────────────────────────────────────────────────────────────────

export interface GWPOAuthStatus {
  connected:  boolean;
  userEmail?: string;
  domain?:    string;
  expiresAt?: string;
  scope?:     string;
}

export interface GWPAuthUrlResult {
  authUrl: string;
}

export interface GWPCallbackResult {
  success:    boolean;
  userEmail?: string;
  userId?:    string;
  scope?:     string;
}

export interface GWPRevokeResult {
  success: boolean;
}

export interface GWPRefreshResult {
  success: boolean;
  userId:  string;
}

// ─── Drive ─────────────────────────────────────────────────────────────────────

export interface GWPDriveQuota {
  used:          number;
  total:         number;
  usageInDrive:  number;
}

export interface GWPDriveFile {
  id:            string;
  name:          string;
  mimeType:      string;
  size?:         number;
  webViewLink?:  string;
  modifiedTime?: string;
  createdTime?:  string;
  parents?:      string[];
  version?:      string;
}

export interface GWPDriveRevision {
  id:           string;
  modifiedTime: string;
  mimeType:     string;
  size?:        number;
}

export interface GWPGenerateLinkResult {
  fileId:      string;
  webViewLink: string;
}

// ─── Gmail ─────────────────────────────────────────────────────────────────────

export interface GWPMailLog {
  id:         string;
  userId:     string;
  recipients: string;
  subject:    string;
  sentAt:     string;
  status:     GWPMailStatus;
  threadId?:  string;
  messageId?: string;
  createdAt:  string;
}

// ─── Calendar ──────────────────────────────────────────────────────────────────

export interface GWPCalendarEventDateTime {
  dateTime: string;
  timeZone?: string;
}

export interface GWPCalendarAttendee {
  email:          string;
  responseStatus?: string;
}

export interface GWPCalendarEvent {
  id?:         string;
  summary?:    string;
  description?: string;
  start:       GWPCalendarEventDateTime;
  end:         GWPCalendarEventDateTime;
  attendees?:  GWPCalendarAttendee[];
  status?:     GWPEventStatus;
  htmlLink?:   string;
}

export interface GWPAvailabilityResult {
  [calendarId: string]: {
    busy: { start: string; end: string }[];
  };
}

// ─── Chat ──────────────────────────────────────────────────────────────────────

export interface GWPChatSpace {
  id:   string;
  name: string;
  type: GWPSpaceType;
}

export interface GWPChatLog {
  id:         string;
  spaceId:    string;
  spaceName:  string;
  message:    string;
  sentAt:     string;
  userId:     string;
  status:     string;
  messageId?: string;
  priority?:  string;
  createdAt:  string;
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export interface GWPDashboard {
  oauthStatus:       GWPConnectionStatus;
  authenticatedUser: string;
  domain:            string;
  driveQuota:        GWPDriveQuota | null;
  recentEmails:      GWPMailLog[];
  recentEvents:      GWPCalendarEvent[];
  chatStatus:        GWPChatStatus;
  generatedAt:       string;
}

// ─── Audit ─────────────────────────────────────────────────────────────────────

export interface GWPAuditEntry {
  id:              string;
  service:         string;
  action:          string;
  userId:          string;
  status:          string;
  requestSummary:  string;
  responseSummary: string;
  errorMessage:    string;
  timestamp:       string;
}

// ─── Mutation params ───────────────────────────────────────────────────────────

export interface GWPUpdateConfigParams {
  clientId?:        string;
  clientSecret?:    string;
  redirectUri?:     string;
  scopes?:          string[];
  workspaceDomain?: string;
  adminEmail?:      string;
}

export interface GWPSendMailParams {
  userId:        string;
  to:            string[];
  cc?:           string[];
  bcc?:          string[];
  subject:       string;
  htmlBody?:     string;
  textBody?:     string;
  attachments?:  { name: string; mimeType: string; content: string }[];
  threadId?:     string;
  priority?:     "high" | "normal" | "low";
}

export interface GWPReplyThreadParams extends GWPSendMailParams {
  threadId: string;
}

export interface GWPCreateEventParams {
  userId:       string;
  title:        string;
  description?: string;
  start:        string;
  end:          string;
  attendees?:   string[];
  reminders?:   { method: GWPReminderMethod; minutes: number }[];
  calendarId?:  string;
  timeZone?:    string;
}

export interface GWPUpdateEventParams {
  userId:       string;
  eventId:      string;
  title?:       string;
  description?: string;
  start?:       string;
  end?:         string;
  attendees?:   string[];
  calendarId?:  string;
  timeZone?:    string;
}

export interface GWPSendChatParams {
  userId:    string;
  spaceId:   string;
  text:      string;
  priority?: string;
}

export interface GWPChatCardSection {
  header:   string;
  widgets:  { text: string }[];
}

export interface GWPCreateCardParams {
  userId:  string;
  spaceId: string;
  card: {
    title:     string;
    subtitle?: string;
    sections?: GWPChatCardSection[];
  };
}

export interface GWPReplySpaceParams {
  userId:    string;
  spaceId:   string;
  threadKey: string;
  text:      string;
}

export interface GWPDriveUploadParams {
  userId:    string;
  name:      string;
  mimeType:  string;
  content:   string;
  parentId?: string;
}

export interface GWPDriveUpdateParams {
  userId:    string;
  fileId:    string;
  name?:     string;
  mimeType?: string;
  content?:  string;
}

export interface GWPShareFileParams {
  userId:       string;
  fileId:       string;
  emailAddress: string;
  role?:        GWPFileRole;
}

export interface GWPCheckAvailabilityParams {
  userId:    string;
  emails:    string[];
  startTime: string;
  endTime:   string;
}

export interface GWPAuditParams {
  service?: string;
  action?:  string;
  status?:  string;
  userId?:  string;
  from?:    string;
  to?:      string;
  limit?:   number;
}

export interface GWPListEventsParams {
  userId:      string;
  calendarId?: string;
  maxResults?: number;
}

export interface GWPGetMailLogsParams {
  userId?: string;
  status?: GWPMailStatus;
  limit?:  number;
}

export interface GWPGetChatLogsParams {
  userId?:  string;
  spaceId?: string;
  limit?:   number;
}
