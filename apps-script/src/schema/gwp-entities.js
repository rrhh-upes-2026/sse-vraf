/**
 * GWP — Google Workspace Integration Platform
 * Entity schemas
 */

var GWP_ENTITIES = {
  gwpOAuthTokens: {
    sheetName: "GWP_OAuthTokens",
    columns: [
      "id", "userId", "userEmail",
      "accessTokenHash",  // XOR-obfuscated, base64-encoded access token
      "refreshTokenHash", // XOR-obfuscated, base64-encoded refresh token
      "expiresAt", "scope", "tokenType",
      "createdAt", "updatedAt",
    ],
    primaryKey: "id",
    indexes: ["userId", "userEmail"],
  },

  gwpConfig: {
    sheetName: "GWP_Config",
    columns: ["id", "key", "value", "isSecret", "updatedAt", "createdAt"],
    primaryKey: "id",
    indexes: ["key"],
  },

  gwpMailLog: {
    sheetName: "GWP_MailLog",
    columns: [
      "id", "userId", "recipients", "subject",
      "sentAt", "status", "threadId", "messageId",
      "attachmentCount", "priority",
      "createdAt",
    ],
    primaryKey: "id",
    indexes: ["userId", "status"],
  },

  gwpDriveMetadata: {
    sheetName: "GWP_DriveMetadata",
    columns: [
      "id", "fileId", "userId", "name", "mimeType",
      "size", "webViewLink", "parents", "modifiedTime",
      "version", "createdAt",
    ],
    primaryKey: "id",
    indexes: ["fileId", "userId"],
  },

  gwpCalendarEvents: {
    sheetName: "GWP_CalendarEvents",
    columns: [
      "id", "eventId", "calendarId", "userId",
      "title", "startTime", "endTime",
      "attendees", "status", "description",
      "createdAt",
    ],
    primaryKey: "id",
    indexes: ["eventId", "userId"],
  },

  gwpChatLog: {
    sheetName: "GWP_ChatLog",
    columns: [
      "id", "spaceId", "spaceName", "message",
      "sentAt", "userId", "status", "messageId", "priority",
      "createdAt",
    ],
    primaryKey: "id",
    indexes: ["userId", "spaceId"],
  },

  gwpAuditLog: {
    sheetName: "GWP_AuditLog",
    columns: [
      "id", "service", "action", "userId",
      "status", "requestSummary", "responseSummary",
      "errorMessage", "timestamp",
    ],
    primaryKey: "id",
    indexes: ["service", "action", "userId", "status"],
  },
};

function mergeGWPEntities_() {
  Object.keys(GWP_ENTITIES).forEach(function (key) {
    ENTITY_SCHEMAS[key] = GWP_ENTITIES[key];
  });
}
