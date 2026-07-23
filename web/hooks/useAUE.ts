"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAUEDashboard,
  getAUEEvents,
  createAUEEvent,
  processAUEEvent,
  getAUERules,
  getAUERule,
  createAUERule,
  updateAUERule,
  duplicateAUERule,
  getAUEExecutions,
  getAUEQueue,
  retryAUEExecution,
} from "@/services/aue";
import type {
  AUEEventsParams,
  AUERulesParams,
  AUEExecutionsParams,
  AUEQueueParams,
  AUECreateEventParams,
  AUECreateRuleParams,
  AUEUpdateRuleParams,
} from "@/types/aue";

export function useAUEDashboard() {
  return useQuery({ queryKey: ["aue", "dashboard"], queryFn: getAUEDashboard });
}

export function useAUEEvents(params?: AUEEventsParams) {
  return useQuery({
    queryKey: ["aue", "events", params],
    queryFn:  () => getAUEEvents(params),
  });
}

export function useCreateAUEEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: AUECreateEventParams) => createAUEEvent(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["aue", "events"] });
      qc.invalidateQueries({ queryKey: ["aue", "dashboard"] });
    },
  });
}

export function useProcessAUEEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => processAUEEvent({ eventId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["aue", "events"] });
      qc.invalidateQueries({ queryKey: ["aue", "executions"] });
      qc.invalidateQueries({ queryKey: ["aue", "queue"] });
      qc.invalidateQueries({ queryKey: ["aue", "dashboard"] });
    },
  });
}

export function useAUERules(params?: AUERulesParams) {
  return useQuery({
    queryKey: ["aue", "rules", params],
    queryFn:  () => getAUERules(params),
  });
}

export function useAUERule(id: string | null) {
  return useQuery({
    queryKey: ["aue", "rule", id],
    queryFn:  () => getAUERule(id!),
    enabled:  !!id,
  });
}

export function useCreateAUERule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: AUECreateRuleParams) => createAUERule(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["aue", "rules"] }),
  });
}

export function useUpdateAUERule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: AUEUpdateRuleParams) => updateAUERule(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["aue", "rules"] });
      qc.invalidateQueries({ queryKey: ["aue", "dashboard"] });
    },
  });
}

export function useDuplicateAUERule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateAUERule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["aue", "rules"] }),
  });
}

export function useAUEExecutions(params?: AUEExecutionsParams) {
  return useQuery({
    queryKey: ["aue", "executions", params],
    queryFn:  () => getAUEExecutions(params),
  });
}

export function useAUEQueue(params?: AUEQueueParams) {
  return useQuery({
    queryKey: ["aue", "queue", params],
    queryFn:  () => getAUEQueue(params),
  });
}

export function useRetryAUEExecution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (executionId: string) => retryAUEExecution(executionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["aue", "queue"] });
      qc.invalidateQueries({ queryKey: ["aue", "executions"] });
      qc.invalidateQueries({ queryKey: ["aue", "dashboard"] });
    },
  });
}
