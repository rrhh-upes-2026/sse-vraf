/**
 * NCE — Notification & Communication Engine
 * Entity schema definitions.
 */

var NCE_ENTITY_DEFS = [
  {
    key: "nceNotifications",
    sheetName: "NCE_Notifications",
    columns: [
      "id", "recipientId", "recipientEmail",
      "title", "body", "channel",
      "status", "priority",
      "templateId", "templateType",
      "sourceEventId", "sourceEngine",
      "metadata", "readAt", "deliveredAt",
      "createdAt", "updatedAt"
    ],
    idColumn: "id",
    indexes: ["recipientId", "status", "channel", "templateType", "sourceEventId"],
  },
  {
    key: "nceTemplates",
    sheetName: "NCE_Templates",
    columns: [
      "id", "name", "type", "channel",
      "subject", "body", "variables",
      "enabled", "version", "usageCount",
      "createdBy", "createdAt", "updatedAt"
    ],
    idColumn: "id",
    indexes: ["type", "channel", "enabled"],
  },
  {
    key: "nceUserPreferences",
    sheetName: "NCE_UserPreferences",
    columns: [
      "id", "userId", "userEmail",
      "enabledChannels", "enabledTypes",
      "quietHoursStart", "quietHoursEnd",
      "digestEnabled", "digestFrequency",
      "updatedAt"
    ],
    idColumn: "id",
    indexes: ["userId", "userEmail"],
  },
  {
    key: "nceDigests",
    sheetName: "NCE_Digests",
    columns: [
      "id", "recipientId", "recipientEmail",
      "frequency", "status",
      "periodStart", "periodEnd",
      "notificationCount", "summary",
      "generatedAt", "deliveredAt", "createdAt"
    ],
    idColumn: "id",
    indexes: ["recipientId", "status", "frequency"],
  },
];

function mergeNCEEntities_() {
  NCE_ENTITY_DEFS.forEach(function (def) {
    SchemaRegistry.register(def);
  });
}
