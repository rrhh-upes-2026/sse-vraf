/**
 * IIA — Institutional Intelligence Assistant
 * Entity schema definitions.
 */

var IIA_ENTITIES = [
  {
    name:    "IIA_Config",
    columns: ["id", "key", "value", "isSecret", "updatedAt", "updatedBy"],
  },
  {
    name:    "IIA_Conversations",
    columns: ["id", "userId", "title", "messageCount", "lastMessage", "createdAt", "updatedAt", "expiresAt"],
  },
  {
    name:    "IIA_Messages",
    columns: ["id", "conversationId", "userId", "role", "content", "tokensIn", "tokensOut", "latencyMs", "timestamp"],
  },
  {
    name:    "IIA_PromptTemplates",
    columns: ["id", "type", "name", "content", "version", "updatedAt", "updatedBy"],
  },
  {
    name:    "IIA_Actions",
    columns: ["id", "userId", "conversationId", "messageId", "type", "params", "status", "executedAt", "result"],
  },
  {
    name:    "IIA_AuditLog",
    columns: ["id", "userId", "action", "tokensIn", "tokensOut", "latencyMs", "model", "status", "timestamp", "errorMessage"],
  },
  {
    name:    "IIA_UsageMetrics",
    columns: ["id", "date", "totalQueries", "totalTokensIn", "totalTokensOut", "totalErrors", "avgLatencyMs"],
  },
];

function mergeIIAEntities_() {
  IIA_ENTITIES.forEach(function (def) {
    SheetRepository.ensureSheet(def.name, def.columns);
  });
}
