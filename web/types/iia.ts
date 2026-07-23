// IIA — Institutional Intelligence Assistant (Gemini-powered)

export type IIAGeminiStatus  = "available" | "unavailable" | "degraded";
export type IIARole          = "user" | "assistant" | "system";
export type IIAActionStatus  = "pending" | "authorized" | "executed" | "failed" | "denied";
export type IIAPromptType    = "institutional" | "executive" | "analytical" | "operational" | "administrative";
export type IIAContextSource = "iie" | "gwp" | "isp" | "ioe" | "nce";
export type IIAActionType    =
  | "create_plan"
  | "create_task"
  | "send_email"
  | "schedule_meeting"
  | "create_notification"
  | "query_indicators"
  | "query_risks"
  | "query_evidences"
  | "generate_summary"
  | "register_event";

// ─── Core entities ─────────────────────────────────────────────────────────────

export interface IIAConfig {
  model:            string;
  temperature:      number;
  maxTokens:        number;
  timeout:          number;
  retries:          number;
  debugMode:        boolean;
  geminiConfigured: boolean;
}

export interface IIAAction {
  id?:          string;
  type:         IIAActionType;
  params:       Record<string, unknown>;
  status:       IIAActionStatus;
  executedAt?:  string;
  result?:      string;
  authorizedBy?: string;
}

export interface IIAMessage {
  id:             string;
  conversationId: string;
  userId:         string;
  role:           IIARole;
  content:        string;
  timestamp:      string;
  tokensIn?:      number;
  tokensOut?:     number;
  latencyMs?:     number;
  actions?:       IIAAction[];
}

export interface IIAConversation {
  id:           string;
  userId:       string;
  title:        string;
  messageCount: number;
  lastMessage:  string;
  createdAt:    string;
  updatedAt:    string;
  expiresAt:    string;
}

export interface IIAConversationDetail extends IIAConversation {
  messages: IIAMessage[];
}

export interface IIADashboard {
  totalQueries:        number;
  avgResponseTimeMs:   number;
  totalTokensIn:       number;
  totalTokensOut:      number;
  actionsExecuted:     number;
  errors:              number;
  activeModel:         string;
  geminiStatus:        IIAGeminiStatus;
  activeConversations: number;
  generatedAt:         string;
}

export interface IIAPromptTemplate {
  id:        string;
  type:      IIAPromptType;
  name:      string;
  content:   string;
  version:   number;
  updatedAt: string;
  updatedBy: string;
}

export interface IIAUsageRecord {
  id:           string;
  userId:       string;
  action:       string;
  tokensIn:     number;
  tokensOut:    number;
  latencyMs:    number;
  model:        string;
  status:       "success" | "error";
  timestamp:    string;
  errorMessage: string;
}

// ─── Mutation params ────────────────────────────────────────────────────────────

export interface IIAChatParams {
  userId:          string;
  conversationId?: string;
  message:         string;
  promptType?:     IIAPromptType;
  contextSources?: IIAContextSource[];
}

export interface IIAChatResponse {
  conversationId: string;
  messageId:      string;
  response:       string;
  tokensIn:       number;
  tokensOut:      number;
  latencyMs:      number;
  model:          string;
  actions:        IIAAction[];
}

export interface IIAUpdateConfigParams {
  apiKey?:      string;
  model?:       string;
  temperature?: number;
  maxTokens?:   number;
  timeout?:     number;
  retries?:     number;
  debugMode?:   boolean;
}

export interface IIAUpdatePromptParams {
  id:       string;
  content:  string;
  version?: number;
}

export interface IIAListConversationsParams {
  userId?: string;
  limit?:  number;
}

export interface IIAGetHistoryParams {
  userId?:  string;
  limit?:   number;
  status?:  "success" | "error";
}

export interface IIAGeminiStatusResult {
  status:  IIAGeminiStatus;
  reason?: string;
}
