// IIE — Institutional Intelligence Engine

export type IIERiskLevel        = "bajo" | "medio" | "alto" | "critico";
export type IIEConfidenceLevel  = "baja" | "media" | "alta" | "muy_alta";
export type IIEImpactLevel      = "bajo" | "medio" | "alto" | "transformador";
export type IIEUrgency          = "baja" | "media" | "alta" | "critica";
export type IIEPriority         = "baja" | "media" | "alta" | "critica";
export type IIENarrativePeriod  = "semanal" | "mensual" | "trimestral" | "anual";
export type IIEPredictionHorizon = "trimestral" | "semestral" | "anual";
export type IIEConditionOperator = "lt" | "lte" | "gt" | "gte" | "eq" | "neq";
export type IIELogicOperator    = "AND" | "OR";
export type IIEConfigParamType  = "number" | "boolean" | "string" | "percentage";
export type IIERecommendationStatus = "pendiente" | "en_proceso" | "completada" | "descartada";
export type IIETrend            = "creciente" | "decreciente" | "estable" | "volatil";
export type IIEEntityType =
  | "unidad" | "proceso" | "procedimiento" | "actividad"
  | "plan" | "ejecucion" | "evidencia" | "indicador"
  | "cumplimiento" | "brecha" | "riesgo" | "plan_mejora";
export type IIEAnomalyType =
  | "caida_productividad" | "disminucion_cumplimiento" | "cambio_abrupto"
  | "acumulacion_riesgos" | "patron_inusual" | "sobrecarga_operativa" | "retraso_recurrente";
export type IIESemanticIntent =
  | "diagnostico" | "recomendacion" | "narrativa" | "prediccion" | "explicacion";

// ─── Knowledge Rules ─────────────────────────────────────────────────────────

export interface IIERuleCondition {
  field: string;
  operator: IIEConditionOperator;
  value: number | string;
  logic?: IIELogicOperator;
}

export interface IIERuleConsequence {
  field: string;
  value: string | number;
}

export interface IIEKnowledgeRule {
  id: string;
  name: string;
  description?: string;
  conditions: IIERuleCondition[] | string;
  consequences: IIERuleConsequence[] | string;
  logic: IIELogicOperator;
  weight: number;
  confidence: number;
  enabled: boolean;
  category: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Configuration ────────────────────────────────────────────────────────────

export interface IIEConfiguration {
  id: string;
  key: string;
  value: string | number | boolean;
  label: string;
  description?: string;
  category: string;
  type: IIEConfigParamType;
  min?: number;
  max?: number;
  updatedAt: string;
}

// ─── Model Parameters ─────────────────────────────────────────────────────────

export interface IIEModelParameter {
  id: string;
  model: string;
  parameter: string;
  value: number;
  description?: string;
  updatedAt: string;
}

// ─── Semantic Model ────────────────────────────────────────────────────────────

export interface IIESemanticRelation {
  concept: IIEEntityType;
  relation: string;
  cardinality: string;
}

export interface IIESemanticAttribute {
  name: string;
  type: string;
  description: string;
}

export interface IIESemanticConcept {
  id: IIEEntityType;
  label: string;
  description: string;
  relations: IIESemanticRelation[];
  attributes: IIESemanticAttribute[];
}

export interface IIESemanticModel {
  version: string;
  concepts: IIESemanticConcept[];
  generatedAt: string;
}

// ─── Diagnosis ────────────────────────────────────────────────────────────────

export interface IIEDiagnosticFactor {
  name: string;
  value: number | string;
  impact: "positivo" | "negativo" | "neutro";
  weight: number;
  description: string;
}

export interface IIEDiagnosis {
  id: string;
  entityType: IIEEntityType;
  entityId: string;
  entityLabel: string;
  period: string;
  riskLevel: IIERiskLevel;
  overallScore: number;
  confidenceScore: number;
  confidenceLevel: IIEConfidenceLevel;
  factors: IIEDiagnosticFactor[];
  summary: string;
  appliedRules: string[];
  dataCompleteness: number;
  dataRecency: number;
  generatedAt: string;
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export interface IIERecommendationEvidence {
  source: string;
  value: number | string;
  label: string;
}

export interface IIERecommendation {
  id: string;
  title: string;
  description: string;
  priority: IIEPriority;
  impact: IIEImpactLevel;
  urgency: IIEUrgency;
  justification: string;
  suggestedResponsible?: string;
  entityType?: IIEEntityType;
  entityId?: string;
  entityLabel?: string;
  why: string;
  sourceData: IIERecommendationEvidence[];
  expectedImpact: string;
  consequenceIfIgnored: string;
  confidenceScore: number;
  status: IIERecommendationStatus;
  appliedRule?: string;
  estimatedEffort?: string;
  generatedAt: string;
}

// ─── Predictions ──────────────────────────────────────────────────────────────

export interface IIEPredictionPoint {
  period: string;
  label: string;
  predicted: number;
  lowerBound: number;
  upperBound: number;
  isHistorical: boolean;
}

export interface IIEPrediction {
  id: string;
  entityType: IIEEntityType;
  entityId: string;
  entityLabel: string;
  metric: string;
  horizon: IIEPredictionHorizon;
  model: string;
  currentValue: number;
  predictedValue: number;
  probabilityOfCompliance: number;
  expectedRisk: IIERiskLevel;
  trend: IIETrend;
  points: IIEPredictionPoint[];
  confidenceScore: number;
  assumptions: string[];
  generatedAt: string;
}

// ─── Anomalies ────────────────────────────────────────────────────────────────

export interface IIEAnomaly {
  id: string;
  type: IIEAnomalyType;
  entityType: IIEEntityType;
  entityId: string;
  entityLabel: string;
  severity: IIERiskLevel;
  detectedAt: string;
  description: string;
  metric: string;
  observedValue: number;
  expectedValue: number;
  deviationPct: number;
  period: string;
  recommendationId?: string;
  isActive: boolean;
}

// ─── Narratives ───────────────────────────────────────────────────────────────

export interface IIENarrativeSection {
  title: string;
  content: string;
}

export interface IIEKeyFigure {
  label: string;
  value: string;
  trend: string;
}

export interface IIENarrative {
  id: string;
  period: IIENarrativePeriod;
  periodLabel: string;
  title: string;
  body: string;
  sections: IIENarrativeSection[];
  keyFigures: IIEKeyFigure[];
  generatedAt: string;
  confidenceScore: number;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface IIEIntelligenceDashboard {
  institutionalScore: number;
  riskLevel: IIERiskLevel;
  confidenceScore: number;
  quarterlyPrediction: number;
  predictedRisk: IIERiskLevel;
  executiveNarrative: string;
  topRecommendations: IIERecommendation[];
  topAnomalies: IIEAnomaly[];
  recentDiagnoses: IIEDiagnosis[];
  alertCount: number;
  diagnosisCount: number;
  recommendationCount: number;
  anomalyCount: number;
  dataQuality: number;
  generatedAt: string;
}

// ─── Semantic Query ────────────────────────────────────────────────────────────

export interface IIESemanticQuery {
  intent: IIESemanticIntent;
  entityType?: IIEEntityType;
  entityId?: string;
  period?: string;
  language?: "es";
}

export interface IIESemanticResponse {
  query: IIESemanticQuery;
  result: unknown;
  explanation: string;
  confidenceScore: number;
  sources: string[];
  generatedAt: string;
}

// ─── AI Integration Contracts (future) ────────────────────────────────────────
// These interfaces define the contracts for future AI provider integrations.
// No implementation — only type definitions.

export type AIProvider = "openai" | "claude" | "gemini" | "llama" | "mistral" | "azure_openai" | "ollama";

export interface AIProviderConfig {
  provider: AIProvider;
  enabled: boolean;
  endpoint?: string;
  model?: string;
}

export interface AIProviderContract {
  provider: AIProvider;
  sendQuery(semanticResponse: IIESemanticResponse): Promise<string>;
  isAvailable(): boolean;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface IIEDiagnosticsParams {
  entityType?: IIEEntityType;
  entityId?: string;
  riskLevel?: IIERiskLevel;
  minConfidence?: number;
  period?: string;
  limit?: number;
}

export interface IIERecommendationsParams {
  priority?: IIEPriority;
  impact?: IIEImpactLevel;
  entityType?: IIEEntityType;
  status?: IIERecommendationStatus;
  limit?: number;
}

export interface IIEPredictionsParams {
  entityType?: IIEEntityType;
  entityId?: string;
  horizon?: IIEPredictionHorizon;
  limit?: number;
}

export interface IIEAnomaliesParams {
  type?: IIEAnomalyType;
  entityType?: IIEEntityType;
  severity?: IIERiskLevel;
  isActive?: boolean;
  limit?: number;
}

export interface IIENarrativesParams {
  period?: IIENarrativePeriod;
  limit?: number;
}

export interface IIEKnowledgeRulesParams {
  enabled?: boolean;
  category?: string;
}

export interface IIEUpdateConfigParams {
  key: string;
  value: string | number | boolean;
}

export interface IIEUpdateRuleParams extends Partial<IIEKnowledgeRule> {
  id: string;
}
