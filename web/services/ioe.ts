import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import type {
  IOEDashboard,
  IOEActionPlan,
  IOEMilestone,
  IOETask,
  IOEDecision,
  IOECalendarEvent,
  IOEMetrics,
  IOECompletionEligibility,
  IOEActionPlansParams,
  IOEMilestonesParams,
  IOETasksParams,
  IOEDecisionsParams,
  IOECalendarParams,
  IOECreatePlanParams,
  IOEUpdatePlanParams,
  IOECreateMilestoneParams,
  IOEUpdateMilestoneParams,
  IOECreateTaskParams,
  IOEUpdateTaskParams,
  IOECreateDecisionParams,
  IOEUpdateDecisionParams,
  IOECreateFromSourceParams,
} from "@/types/ioe";

const WS = "ioe";
const c = () => getAppsScriptClient();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = (v: unknown): Record<string, unknown> => (v ?? {}) as any;

export async function getIOEDashboard(): Promise<IOEDashboard> {
  return c().call<IOEDashboard>(`${WS}.getDashboard`, {});
}

export async function getIOEActionPlans(params?: IOEActionPlansParams): Promise<IOEActionPlan[]> {
  return c().call<IOEActionPlan[]>(`${WS}.getActionPlans`, p(params));
}

export async function getIOEActionPlan(id: string): Promise<IOEActionPlan> {
  return c().call<IOEActionPlan>(`${WS}.getActionPlan`, { id });
}

export async function createIOEActionPlan(params: IOECreatePlanParams): Promise<IOEActionPlan> {
  return c().call<IOEActionPlan>(`${WS}.createActionPlan`, p(params));
}

export async function updateIOEActionPlan(params: IOEUpdatePlanParams): Promise<IOEActionPlan> {
  return c().call<IOEActionPlan>(`${WS}.updateActionPlan`, p(params));
}

export async function getIOEMilestones(params?: IOEMilestonesParams): Promise<IOEMilestone[]> {
  return c().call<IOEMilestone[]>(`${WS}.getMilestones`, p(params));
}

export async function createIOEMilestone(params: IOECreateMilestoneParams): Promise<IOEMilestone> {
  return c().call<IOEMilestone>(`${WS}.createMilestone`, p(params));
}

export async function updateIOEMilestone(params: IOEUpdateMilestoneParams): Promise<IOEMilestone> {
  return c().call<IOEMilestone>(`${WS}.updateMilestone`, p(params));
}

export async function getIOETasks(params?: IOETasksParams): Promise<IOETask[]> {
  return c().call<IOETask[]>(`${WS}.getTasks`, p(params));
}

export async function createIOETask(params: IOECreateTaskParams): Promise<IOETask> {
  return c().call<IOETask>(`${WS}.createTask`, p(params));
}

export async function updateIOETask(params: IOEUpdateTaskParams): Promise<IOETask> {
  return c().call<IOETask>(`${WS}.updateTask`, p(params));
}

export async function getIOEDecisions(params?: IOEDecisionsParams): Promise<IOEDecision[]> {
  return c().call<IOEDecision[]>(`${WS}.getDecisions`, p(params));
}

export async function createIOEDecision(params: IOECreateDecisionParams): Promise<IOEDecision> {
  return c().call<IOEDecision>(`${WS}.createDecision`, p(params));
}

export async function updateIOEDecision(params: IOEUpdateDecisionParams): Promise<IOEDecision> {
  return c().call<IOEDecision>(`${WS}.updateDecision`, p(params));
}

export async function getIOECalendarEvents(params: IOECalendarParams): Promise<IOECalendarEvent[]> {
  return c().call<IOECalendarEvent[]>(`${WS}.getCalendarEvents`, p(params));
}

export async function createIOEFromSource(params: IOECreateFromSourceParams): Promise<IOEActionPlan> {
  return c().call<IOEActionPlan>(`${WS}.createFromSource`, p(params));
}

export async function checkIOECompletionEligibility(planId: string): Promise<IOECompletionEligibility> {
  return c().call<IOECompletionEligibility>(`${WS}.checkCompletionEligibility`, { planId });
}

export async function closeIOEPlan(
  planId: string,
  verificationNote?: string,
  closedBy?: string,
): Promise<{ success: boolean; planId?: string; closedAt?: string; reasons?: string[] }> {
  return c().call(`${WS}.closePlan`, { planId, verificationNote, closedBy });
}

export async function getIOEMetrics(): Promise<IOEMetrics> {
  return c().call<IOEMetrics>(`${WS}.getMetrics`, {});
}
