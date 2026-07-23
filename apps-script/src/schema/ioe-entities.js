/**
 * IOE — Institutional Orchestration Engine entity sheet definitions.
 * Merged into ENTITY_SHEETS via mergeIOEEntities_() from Code.js.
 */
var IOE_ENTITY_SHEETS = {
  ioeActionPlans: {
    sheetName: "IOE_ActionPlans",
    columns: [
      "id", "title", "description", "originEngine", "originEntityId", "originEntityLabel",
      "organizationalUnitId", "organizationalUnitLabel", "priority", "status",
      "objective", "expectedImpact", "riskLevel", "owner",
      "startDate", "targetDate", "completionDate", "progress",
      "milestoneCount", "taskCount", "completedMilestones", "completedTasks",
      "overdueTasks", "blockedTasks",
      "createdBy", "createdAt", "updatedAt",
    ],
  },
  ioeMilestones: {
    sheetName: "IOE_Milestones",
    columns: [
      "id", "actionPlanId", "title", "description",
      "plannedDate", "completedDate", "status", "weight",
      "taskCount", "completedTasks",
    ],
  },
  ioeTasks: {
    sheetName: "IOE_Tasks",
    columns: [
      "id", "actionPlanId", "milestoneId", "title", "description",
      "assignedTo", "priority", "status",
      "plannedStart", "plannedEnd", "completedAt",
      "progress", "dependencies", "isBlocked", "blockReason",
    ],
  },
  ioeDecisions: {
    sheetName: "IOE_Decisions",
    columns: [
      "id", "actionPlanId", "date", "origin", "responsable",
      "decision", "justification", "expectedResult", "status",
      "createdAt", "updatedAt",
    ],
  },
};

function mergeIOEEntities_() {
  Object.keys(IOE_ENTITY_SHEETS).forEach(function (key) {
    ENTITY_SHEETS[key] = IOE_ENTITY_SHEETS[key];
  });
}
