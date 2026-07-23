/**
 * IOE — Institutional Orchestration Engine
 * OrgUnitRegistry registration definition.
 */
var IOE_UNIT_DEF = {
  key:     "ioe",
  label:   "Institutional Orchestration Engine",
  enabled: true,
  handlers: {
    getDashboard:               function (p) { return IOEController.getDashboard(p); },
    getActionPlans:             function (p) { return IOEController.getActionPlans(p); },
    getActionPlan:              function (p) { return IOEController.getActionPlan(p); },
    createActionPlan:           function (p) { return IOEController.createActionPlan(p); },
    updateActionPlan:           function (p) { return IOEController.updateActionPlan(p); },
    getMilestones:              function (p) { return IOEController.getMilestones(p); },
    createMilestone:            function (p) { return IOEController.createMilestone(p); },
    updateMilestone:            function (p) { return IOEController.updateMilestone(p); },
    getTasks:                   function (p) { return IOEController.getTasks(p); },
    createTask:                 function (p) { return IOEController.createTask(p); },
    updateTask:                 function (p) { return IOEController.updateTask(p); },
    getDecisions:               function (p) { return IOEController.getDecisions(p); },
    createDecision:             function (p) { return IOEController.createDecision(p); },
    updateDecision:             function (p) { return IOEController.updateDecision(p); },
    getCalendarEvents:          function (p) { return IOEController.getCalendarEvents(p); },
    createFromSource:           function (p) { return IOEController.createFromSource(p); },
    checkCompletionEligibility: function (p) { return IOEController.checkCompletionEligibility(p); },
    closePlan:                  function (p) { return IOEController.closePlan(p); },
    getMetrics:                 function (p) { return IOEController.getMetrics(p); },
  },
};
