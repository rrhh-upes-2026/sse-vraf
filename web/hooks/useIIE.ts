"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getIIEDashboard,
  getIIEDiagnostics,
  getIIERecommendations,
  getIIEPredictions,
  getIIEAnomalies,
  getIIENarratives,
  getIIEConfiguration,
  updateIIEConfiguration,
  getIIEKnowledgeRules,
  updateIIEKnowledgeRule,
  getIIESemanticModel,
  queryIIESemantic,
} from "@/services/iie";
import type {
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
  IIESemanticQuery,
} from "@/types/iie";

export function useIIEDashboard() {
  return useQuery({
    queryKey: ["iie", "dashboard"],
    queryFn:  getIIEDashboard,
  });
}

export function useIIEDiagnostics(opts?: {
  entityType?: IIEEntityType;
  riskLevel?: IIERiskLevel;
  minConfidence?: number;
  period?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["iie", "diagnostics", opts],
    queryFn:  () => getIIEDiagnostics(opts),
  });
}

export function useIIERecommendations(opts?: {
  priority?: IIEPriority;
  impact?: IIEImpactLevel;
  entityType?: IIEEntityType;
  status?: IIERecommendationStatus;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["iie", "recommendations", opts],
    queryFn:  () => getIIERecommendations(opts),
  });
}

export function useIIEPredictions(opts?: {
  entityType?: IIEEntityType;
  horizon?: IIEPredictionHorizon;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["iie", "predictions", opts],
    queryFn:  () => getIIEPredictions(opts),
  });
}

export function useIIEAnomalies(opts?: {
  type?: IIEAnomalyType;
  severity?: IIERiskLevel;
  isActive?: boolean;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["iie", "anomalies", opts],
    queryFn:  () => getIIEAnomalies(opts),
  });
}

export function useIIENarratives(period?: IIENarrativePeriod) {
  return useQuery({
    queryKey: ["iie", "narratives", period],
    queryFn:  () => getIIENarratives({ period }),
  });
}

export function useIIEConfiguration() {
  return useQuery({
    queryKey: ["iie", "configuration"],
    queryFn:  getIIEConfiguration,
  });
}

export function useUpdateIIEConfiguration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: IIEUpdateConfigParams) => updateIIEConfiguration(params),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["iie", "configuration"] }),
  });
}

export function useIIEKnowledgeRules(opts?: { enabled?: boolean; category?: string }) {
  return useQuery({
    queryKey: ["iie", "rules", opts],
    queryFn:  () => getIIEKnowledgeRules(opts),
  });
}

export function useUpdateIIEKnowledgeRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: IIEUpdateRuleParams) => updateIIEKnowledgeRule(params),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["iie", "rules"] }),
  });
}

export function useIIESemanticModel() {
  return useQuery({
    queryKey: ["iie", "semantic-model"],
    queryFn:  getIIESemanticModel,
    staleTime: Infinity,
  });
}

export function useIIESemanticQuery(query?: IIESemanticQuery) {
  return useQuery({
    queryKey: ["iie", "semantic-query", query],
    queryFn:  () => queryIIESemantic(query!),
    enabled:  !!query,
  });
}
