import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import type {
  EIPExecutiveDashboard,
  EIPScorecard,
  EIPHeatCell,
  EIPTrendSeries,
  EIPAlert,
  EIPTimelineEvent,
  EIPTimelineEventType,
  EIPRankingItem,
  EIPComparativeReport,
  EIPAlertSeverity,
  EIPHeatMapType,
  EIPRankingType,
  EIPComparativeType,
} from "@/types/eip";

const EIP_WS = "eip";

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getEIPDashboard(year?: number): Promise<EIPExecutiveDashboard> {
  const client = getAppsScriptClient();
  const params: Record<string, unknown> = { wsId: EIP_WS };
  if (year) params.year = year;
  return client.call<EIPExecutiveDashboard>("eip.getDashboard", params);
}

// ── Scorecard ─────────────────────────────────────────────────────────────────

export async function getEIPScorecard(): Promise<EIPScorecard> {
  const client = getAppsScriptClient();
  return client.call<EIPScorecard>("eip.getScorecard", { wsId: EIP_WS });
}

// ── Heat Map ──────────────────────────────────────────────────────────────────

export async function getEIPHeatMap(type?: EIPHeatMapType): Promise<EIPHeatCell[]> {
  const client = getAppsScriptClient();
  const params: Record<string, unknown> = { wsId: EIP_WS };
  if (type) params.type = type;
  return client.call<EIPHeatCell[]>("eip.getHeatMap", params);
}

// ── Trends ────────────────────────────────────────────────────────────────────

export async function getEIPTrends(
  period?: string,
  year?: number,
  months?: number,
): Promise<EIPTrendSeries[]> {
  const client = getAppsScriptClient();
  const params: Record<string, unknown> = { wsId: EIP_WS };
  if (period) params.period = period;
  if (year) params.year = year;
  if (months) params.months = months;
  return client.call<EIPTrendSeries[]>("eip.getTrends", params);
}

// ── Alerts ────────────────────────────────────────────────────────────────────

export async function getEIPAlerts(
  severity?: EIPAlertSeverity,
  limit?: number,
): Promise<EIPAlert[]> {
  const client = getAppsScriptClient();
  const params: Record<string, unknown> = { wsId: EIP_WS };
  if (severity) params.severity = severity;
  if (limit) params.limit = limit;
  return client.call<EIPAlert[]>("eip.getAlerts", params);
}

// ── Timeline ──────────────────────────────────────────────────────────────────

export async function getEIPTimeline(
  year?: number,
  limit?: number,
  types?: EIPTimelineEventType[],
): Promise<EIPTimelineEvent[]> {
  const client = getAppsScriptClient();
  const params: Record<string, unknown> = { wsId: EIP_WS };
  if (year) params.year = year;
  if (limit) params.limit = limit;
  if (types && types.length > 0) params.types = types.join(",");
  return client.call<EIPTimelineEvent[]>("eip.getTimeline", params);
}

// ── Ranking ───────────────────────────────────────────────────────────────────

export async function getEIPRanking(
  type?: EIPRankingType,
  limit?: number,
): Promise<EIPRankingItem[]> {
  const client = getAppsScriptClient();
  const params: Record<string, unknown> = { wsId: EIP_WS };
  if (type) params.type = type;
  if (limit) params.limit = limit;
  return client.call<EIPRankingItem[]>("eip.getRanking", params);
}

// ── Comparativo ───────────────────────────────────────────────────────────────

export async function getEIPComparativo(
  type?: EIPComparativeType,
  currentYear?: number,
  currentMonth?: number,
  previousYear?: number,
  previousMonth?: number,
): Promise<EIPComparativeReport> {
  const client = getAppsScriptClient();
  const params: Record<string, unknown> = { wsId: EIP_WS };
  if (type) params.type = type;
  if (currentYear) params.currentYear = currentYear;
  if (currentMonth) params.currentMonth = currentMonth;
  if (previousYear) params.previousYear = previousYear;
  if (previousMonth) params.previousMonth = previousMonth;
  return client.call<EIPComparativeReport>("eip.getComparativo", params);
}
