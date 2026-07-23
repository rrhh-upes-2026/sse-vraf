// EIP — Executive Intelligence Platform

export type EIPSemaforoColor = "Verde" | "Amarillo" | "Naranja" | "Rojo";
export type EIPAlertSeverity = "critica" | "alta" | "media" | "informativa";
export type EIPTrend = "up" | "down" | "stable";
export type EIPRankingType = "unidad" | "proceso" | "indicador" | "responsable";
export type EIPHeatMapType = "unidad" | "proceso";
export type BSCPerspective = "financiera" | "procesos" | "aprendizaje" | "clientes";

export type EIPTimelineEventType =
  | "planificacion"
  | "ejecucion"
  | "evidencia"
  | "incumplimiento"
  | "plan_mejora";

export type EIPComparativeType =
  | "mes-vs-mes"
  | "año-vs-año"
  | "unidad-vs-unidad"
  | "proceso-vs-proceso"
  | "indicador-vs-indicador";

export interface EIPKPICard {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: EIPTrend;
  trendValue: number;
  semaforo: EIPSemaforoColor;
  description?: string;
}

export interface EIPRankingItem {
  rank: number;
  id: string;
  label: string;
  type: EIPRankingType;
  score: number;
  semaforo: EIPSemaforoColor;
  trend: EIPTrend;
  description?: string;
  delta?: number | null;
  details?: Record<string, string | number | boolean>;
}

export interface EIPBrecha {
  tipo: string;
  descripcion: string;
  severidad: "alta" | "media" | "baja";
  entidadId?: string;
  entidadTipo?: string;
  fechaDeteccion: string;
}

export interface EIPRisk {
  id: string;
  type: string;
  level: "bajo" | "medio" | "alto" | "critico";
  description: string;
  entityId?: string;
  entityType?: string;
  value?: number;
}

export interface EIPHeatCell {
  id: string;
  label: string;
  type: EIPHeatMapType;
  score: number;
  semaforo: EIPSemaforoColor;
}

export interface EIPTrendPoint {
  period: string;
  label: string;
  year: number;
  month: number;
  score: number;
  value: number;
  semaforo: EIPSemaforoColor;
}

export interface EIPTrendSeries {
  key: string;
  label: string;
  entityId: string;
  entityType: string;
  color: string;
  points: EIPTrendPoint[];
}

export interface EIPAlert {
  id: string;
  type: string;
  severity: EIPAlertSeverity;
  title: string;
  description: string;
  entityId?: string;
  entityType?: string;
  module?: string;
  actionLabel?: string;
  value?: number;
  threshold?: number;
  generatedAt: string;
}

export interface EIPTimelineEvent {
  id: string;
  type: EIPTimelineEventType;
  title: string;
  description: string;
  date: string;
  entityId: string;
  entityType: string;
  entityLabel?: string;
  module?: string;
  status?: string;
  severity?: string;
}

export interface EIPScorecardItem {
  id: string;
  perspective: BSCPerspective;
  objective: string;
  indicator: string;
  target: number;
  actual: number | null;
  unit: string;
  score: number;
  semaforo: EIPSemaforoColor;
}

export interface EIPScorecard {
  perspectives: Record<BSCPerspective, EIPScorecardItem[]>;
  overallScore: number;
  generatedAt: string;
}

export interface EIPComparativePoint {
  entityId: string;
  entityLabel: string;
  label: string;
  current: number;
  previous: number;
  baseValue: number;
  compareValue: number;
  variation: number;
  variationPct: number;
  delta: number;
  trend: EIPTrend;
}

export interface EIPComparativeReport {
  type: EIPComparativeType;
  currentPeriod: string;
  previousPeriod: string;
  baseLabel: string;
  compareLabel: string;
  baseScore: number;
  compareScore: number;
  delta: number;
  summary?: string;
  items: EIPComparativePoint[];
  points: EIPComparativePoint[];
  generatedAt: string;
}

export interface EIPExecutiveDashboard {
  overallScore: number;
  semaforo: EIPSemaforoColor;
  kpis: EIPKPICard[];
  topUnits: EIPRankingItem[];
  topProcesses: EIPRankingItem[];
  topIndicators: EIPRankingItem[];
  criticalBrechas: EIPBrecha[];
  risks: EIPRisk[];
  alerts: EIPAlert[];
  heatMapSummary: EIPHeatCell[];
  generatedAt: string;
}

// Query params
export interface EIPDashboardParams {
  year?: number;
}

export interface EIPTrendParams {
  period?: string;
  entityId?: string;
  entityType?: string;
  year?: number;
}

export interface EIPRankingParams {
  type?: EIPRankingType;
  year?: number;
  limit?: number;
}

export interface EIPComparativoParams {
  type?: EIPComparativeType;
  currentYear?: number;
  currentMonth?: number;
  previousYear?: number;
  previousMonth?: number;
}

export interface EIPTimelineParams {
  year?: number;
  types?: EIPTimelineEventType[];
  limit?: number;
}

export interface EIPAlertsParams {
  severity?: EIPAlertSeverity;
  year?: number;
  limit?: number;
}

export interface EIPHeatMapParams {
  type?: EIPHeatMapType;
  year?: number;
}
