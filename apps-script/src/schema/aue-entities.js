/**
 * AUE — Automation & Event Engine
 * Entity sheet definitions merged into ENTITY_SHEETS at bootstrap.
 */
var AUE_ENTITY_SHEETS = {
  aueEvents: {
    sheetName: "AUE_Events",
    columns: [
      "id", "eventType", "sourceEngine", "sourceEntityId",
      "timestamp", "payload", "status", "priority", "processedAt",
    ],
  },
  aueRules: {
    sheetName: "AUE_Rules",
    columns: [
      "id", "name", "description", "enabled", "eventType",
      "conditions", "actions", "priority", "version",
      "executionCount", "lastExecutedAt", "createdBy", "createdAt", "updatedAt",
    ],
  },
  aueExecutions: {
    sheetName: "AUE_Executions",
    columns: [
      "id", "eventId", "ruleId", "ruleName", "status",
      "startedAt", "finishedAt", "duration", "result", "logs",
    ],
  },
  aueQueue: {
    sheetName: "AUE_Queue",
    columns: [
      "id", "executionId", "scheduledAt", "attempt",
      "status", "nextRetry", "maxRetries",
    ],
  },
};

function mergeAUEEntities_() {
  Object.keys(AUE_ENTITY_SHEETS).forEach(function (key) {
    ENTITY_SHEETS[key] = AUE_ENTITY_SHEETS[key];
  });
}
