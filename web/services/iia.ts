import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import type {
  IIAConfig,
  IIADashboard,
  IIAChatResponse,
  IIAConversation,
  IIAConversationDetail,
  IIAPromptTemplate,
  IIAUsageRecord,
  IIAChatParams,
  IIAUpdateConfigParams,
  IIAUpdatePromptParams,
  IIAListConversationsParams,
  IIAGetHistoryParams,
  IIAGeminiStatusResult,
} from "@/types/iia";

const WS = "iia";
const c = () => getAppsScriptClient();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = (v: unknown): Record<string, unknown> => (v ?? {}) as any;

// ─── Chat ─────────────────────────────────────────────────────────────────────

export async function iiaChat(params: IIAChatParams): Promise<IIAChatResponse> {
  return c().call<IIAChatResponse>(`${WS}.chat`, p(params));
}

// ─── Conversations ────────────────────────────────────────────────────────────

export async function listIIAConversations(params?: IIAListConversationsParams): Promise<IIAConversation[]> {
  return c().call<IIAConversation[]>(`${WS}.listConversations`, p(params));
}

export async function getIIAConversation(id: string): Promise<IIAConversationDetail> {
  return c().call<IIAConversationDetail>(`${WS}.getConversation`, { id });
}

export async function deleteIIAConversation(id: string): Promise<{ deleted: boolean; id: string }> {
  return c().call(`${WS}.deleteConversation`, { id });
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getIIADashboard(): Promise<IIADashboard> {
  return c().call<IIADashboard>(`${WS}.getDashboard`, {});
}

// ─── Config ───────────────────────────────────────────────────────────────────

export async function getIIAConfig(): Promise<IIAConfig> {
  return c().call<IIAConfig>(`${WS}.getConfig`, {});
}

export async function updateIIAConfig(params: IIAUpdateConfigParams): Promise<IIAConfig> {
  return c().call<IIAConfig>(`${WS}.updateConfig`, p(params));
}

// ─── Prompt templates ────────────────────────────────────────────────────────

export async function listIIAPrompts(): Promise<IIAPromptTemplate[]> {
  return c().call<IIAPromptTemplate[]>(`${WS}.listPrompts`, {});
}

export async function updateIIAPrompt(params: IIAUpdatePromptParams): Promise<IIAPromptTemplate> {
  return c().call<IIAPromptTemplate>(`${WS}.updatePrompt`, p(params));
}

// ─── History ─────────────────────────────────────────────────────────────────

export async function getIIAHistory(params?: IIAGetHistoryParams): Promise<IIAUsageRecord[]> {
  return c().call<IIAUsageRecord[]>(`${WS}.getHistory`, p(params));
}

// ─── Status / Admin ──────────────────────────────────────────────────────────

export async function checkIIAStatus(): Promise<IIAGeminiStatusResult> {
  return c().call<IIAGeminiStatusResult>(`${WS}.checkStatus`, {});
}

export async function clearIIAHistory(): Promise<{ cleared: number }> {
  return c().call(`${WS}.clearHistory`, {});
}
