import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import type {
  AUEDashboard,
  AUEEvent,
  AUERule,
  AUEExecution,
  AUEQueue,
  AUEEventsParams,
  AUERulesParams,
  AUEExecutionsParams,
  AUEQueueParams,
  AUECreateEventParams,
  AUECreateRuleParams,
  AUEUpdateRuleParams,
  AUEProcessEventParams,
} from "@/types/aue";

const WS = "aue";
const c = () => getAppsScriptClient();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = (v: unknown): Record<string, unknown> => (v ?? {}) as any;

export async function getAUEDashboard(): Promise<AUEDashboard> {
  return c().call<AUEDashboard>(`${WS}.getDashboard`, {});
}

export async function getAUEEvents(params?: AUEEventsParams): Promise<AUEEvent[]> {
  return c().call<AUEEvent[]>(`${WS}.getEvents`, p(params));
}

export async function createAUEEvent(params: AUECreateEventParams): Promise<AUEEvent> {
  return c().call<AUEEvent>(`${WS}.createEvent`, p(params));
}

export async function processAUEEvent(params: AUEProcessEventParams): Promise<{ processed: boolean; rulesMatched: number }> {
  return c().call(`${WS}.processEvent`, p(params));
}

export async function getAUERules(params?: AUERulesParams): Promise<AUERule[]> {
  return c().call<AUERule[]>(`${WS}.getRules`, p(params));
}

export async function getAUERule(id: string): Promise<AUERule> {
  return c().call<AUERule>(`${WS}.getRule`, { id });
}

export async function createAUERule(params: AUECreateRuleParams): Promise<AUERule> {
  return c().call<AUERule>(`${WS}.createRule`, p(params));
}

export async function updateAUERule(params: AUEUpdateRuleParams): Promise<AUERule> {
  return c().call<AUERule>(`${WS}.updateRule`, p(params));
}

export async function duplicateAUERule(id: string): Promise<AUERule> {
  return c().call<AUERule>(`${WS}.duplicateRule`, { id });
}

export async function getAUEExecutions(params?: AUEExecutionsParams): Promise<AUEExecution[]> {
  return c().call<AUEExecution[]>(`${WS}.getExecutions`, p(params));
}

export async function getAUEQueue(params?: AUEQueueParams): Promise<AUEQueue[]> {
  return c().call<AUEQueue[]>(`${WS}.getQueue`, p(params));
}

export async function retryAUEExecution(executionId: string): Promise<{ processed: boolean }> {
  return c().call(`${WS}.retryExecution`, { executionId });
}
