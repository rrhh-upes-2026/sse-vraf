import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import type {
  IIEIntelligenceDashboard,
  IIEDiagnosis,
  IIERecommendation,
  IIEPrediction,
  IIEAnomaly,
  IIENarrative,
  IIEConfiguration,
  IIEKnowledgeRule,
  IIESemanticModel,
  IIESemanticQuery,
  IIESemanticResponse,
  IIERiskLevel,
  IIEPriority,
  IIEImpactLevel,
  IIEEntityType,
  IIERecommendationStatus,
  IIEPredictionHorizon,
  IIEAnomalyType,
  IIENarrativePeriod,
  IIEUpdateConfigParams,
  IIEUpdateRuleParams,
} from "@/types/iie";

const IIE_WS = "iie";

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getIIEDashboard(): Promise<IIEIntelligenceDashboard> {
  const client = getAppsScriptClient();
  return client.call<IIEIntelligenceDashboard>("iie.getDashboard", { wsId: IIE_WS });
}

// ── Diagnostics ───────────────────────────────────────────────────────────────

export async function getIIEDiagnostics(opts?: {
  entityType?: IIEEntityType;
  entityId?: string;
  riskLevel?: IIERiskLevel;
  minConfidence?: number;
  period?: string;
  limit?: number;
}): Promise<IIEDiagnosis[]> {
  const client = getAppsScriptClient();
  const params: Record<string, unknown> = { wsId: IIE_WS };
  if (opts?.entityType)    params.entityType   = opts.entityType;
  if (opts?.entityId)      params.entityId     = opts.entityId;
  if (opts?.riskLevel)     params.riskLevel    = opts.riskLevel;
  if (opts?.minConfidence) params.minConfidence = opts.minConfidence;
  if (opts?.period)        params.period       = opts.period;
  if (opts?.limit)         params.limit        = opts.limit;
  return client.call<IIEDiagnosis[]>("iie.getDiagnostics", params);
}

// ── Recommendations ───────────────────────────────────────────────────────────

export async function getIIERecommendations(opts?: {
  priority?: IIEPriority;
  impact?: IIEImpactLevel;
  entityType?: IIEEntityType;
  status?: IIERecommendationStatus;
  limit?: number;
}): Promise<IIERecommendation[]> {
  const client = getAppsScriptClient();
  const params: Record<string, unknown> = { wsId: IIE_WS };
  if (opts?.priority)    params.priority   = opts.priority;
  if (opts?.impact)      params.impact     = opts.impact;
  if (opts?.entityType)  params.entityType = opts.entityType;
  if (opts?.status)      params.status     = opts.status;
  if (opts?.limit)       params.limit      = opts.limit;
  return client.call<IIERecommendation[]>("iie.getRecommendations", params);
}

// ── Predictions ───────────────────────────────────────────────────────────────

export async function getIIEPredictions(opts?: {
  entityType?: IIEEntityType;
  entityId?: string;
  horizon?: IIEPredictionHorizon;
  limit?: number;
}): Promise<IIEPrediction[]> {
  const client = getAppsScriptClient();
  const params: Record<string, unknown> = { wsId: IIE_WS };
  if (opts?.entityType) params.entityType = opts.entityType;
  if (opts?.entityId)   params.entityId   = opts.entityId;
  if (opts?.horizon)    params.horizon    = opts.horizon;
  if (opts?.limit)      params.limit      = opts.limit;
  return client.call<IIEPrediction[]>("iie.getPredictions", params);
}

// ── Anomalies ─────────────────────────────────────────────────────────────────

export async function getIIEAnomalies(opts?: {
  type?: IIEAnomalyType;
  entityType?: IIEEntityType;
  severity?: IIERiskLevel;
  isActive?: boolean;
  limit?: number;
}): Promise<IIEAnomaly[]> {
  const client = getAppsScriptClient();
  const params: Record<string, unknown> = { wsId: IIE_WS };
  if (opts?.type)       params.type       = opts.type;
  if (opts?.entityType) params.entityType = opts.entityType;
  if (opts?.severity)   params.severity   = opts.severity;
  if (opts?.isActive !== undefined) params.isActive = opts.isActive;
  if (opts?.limit)      params.limit      = opts.limit;
  return client.call<IIEAnomaly[]>("iie.getAnomalies", params);
}

// ── Narratives ────────────────────────────────────────────────────────────────

export async function getIIENarratives(opts?: {
  period?: IIENarrativePeriod;
  limit?: number;
}): Promise<IIENarrative[]> {
  const client = getAppsScriptClient();
  const params: Record<string, unknown> = { wsId: IIE_WS };
  if (opts?.period) params.period = opts.period;
  if (opts?.limit)  params.limit  = opts.limit;
  return client.call<IIENarrative[]>("iie.getNarratives", params);
}

// ── Configuration ─────────────────────────────────────────────────────────────

export async function getIIEConfiguration(): Promise<IIEConfiguration[]> {
  const client = getAppsScriptClient();
  return client.call<IIEConfiguration[]>("iie.getConfiguration", { wsId: IIE_WS });
}

export async function updateIIEConfiguration(params: IIEUpdateConfigParams): Promise<IIEConfiguration> {
  const client = getAppsScriptClient();
  return client.call<IIEConfiguration>("iie.updateConfiguration", { wsId: IIE_WS, ...params });
}

// ── Knowledge Rules ───────────────────────────────────────────────────────────

export async function getIIEKnowledgeRules(opts?: {
  enabled?: boolean;
  category?: string;
}): Promise<IIEKnowledgeRule[]> {
  const client = getAppsScriptClient();
  const params: Record<string, unknown> = { wsId: IIE_WS };
  if (opts?.enabled !== undefined) params.enabled  = opts.enabled;
  if (opts?.category)              params.category = opts.category;
  return client.call<IIEKnowledgeRule[]>("iie.getKnowledgeRules", params);
}

export async function updateIIEKnowledgeRule(params: IIEUpdateRuleParams): Promise<IIEKnowledgeRule> {
  const client = getAppsScriptClient();
  return client.call<IIEKnowledgeRule>("iie.updateKnowledgeRule", { wsId: IIE_WS, ...params });
}

// ── Semantic Model ────────────────────────────────────────────────────────────

export async function getIIESemanticModel(): Promise<IIESemanticModel> {
  const client = getAppsScriptClient();
  return client.call<IIESemanticModel>("iie.getSemanticModel", { wsId: IIE_WS });
}

// ── InstitutionalSemanticService — AI integration entry point ─────────────────

export async function queryIIESemantic(query: IIESemanticQuery): Promise<IIESemanticResponse> {
  const client = getAppsScriptClient();
  return client.call<IIESemanticResponse>("iie.semanticQuery", { wsId: IIE_WS, ...query });
}
