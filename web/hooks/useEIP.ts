"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getEIPDashboard,
  getEIPScorecard,
  getEIPHeatMap,
  getEIPTrends,
  getEIPAlerts,
  getEIPTimeline,
  getEIPRanking,
  getEIPComparativo,
} from "@/services/eip";
import type {
  EIPAlertSeverity,
  EIPHeatMapType,
  EIPRankingType,
  EIPComparativeType,
  EIPTimelineEventType,
} from "@/types/eip";

export function useEIPDashboard(year?: number) {
  return useQuery({
    queryKey: ["eip", "dashboard", year],
    queryFn:  () => getEIPDashboard(year),
  });
}

export function useEIPScorecard() {
  return useQuery({
    queryKey: ["eip", "scorecard"],
    queryFn:  getEIPScorecard,
  });
}

export function useEIPHeatMap(type?: EIPHeatMapType) {
  return useQuery({
    queryKey: ["eip", "heatmap", type],
    queryFn:  () => getEIPHeatMap(type),
  });
}

export function useEIPTrends(opts?: { months?: number; period?: string; year?: number }) {
  const { months, period, year } = opts ?? {};
  return useQuery({
    queryKey: ["eip", "trends", months, period, year],
    queryFn:  () => getEIPTrends(period, year, months),
  });
}

export function useEIPAlerts(severity?: EIPAlertSeverity, limit?: number) {
  return useQuery({
    queryKey: ["eip", "alerts", severity, limit],
    queryFn:  () => getEIPAlerts(severity, limit),
  });
}

export function useEIPTimeline(opts?: { types?: EIPTimelineEventType[]; year?: number; limit?: number }) {
  const { types, year, limit } = opts ?? {};
  return useQuery({
    queryKey: ["eip", "timeline", year, limit, types],
    queryFn:  () => getEIPTimeline(year, limit, types),
  });
}

export function useEIPRanking(type?: EIPRankingType, limit?: number) {
  return useQuery({
    queryKey: ["eip", "ranking", type, limit],
    queryFn:  () => getEIPRanking(type, limit),
  });
}

export function useEIPComparativo(type?: EIPComparativeType) {
  return useQuery({
    queryKey: ["eip", "comparativo", type],
    queryFn:  () => getEIPComparativo(type),
  });
}
