"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getIOEDashboard,
  getIOEActionPlans,
  getIOEActionPlan,
  createIOEActionPlan,
  updateIOEActionPlan,
  getIOEMilestones,
  createIOEMilestone,
  updateIOEMilestone,
  getIOETasks,
  createIOETask,
  updateIOETask,
  getIOEDecisions,
  createIOEDecision,
  updateIOEDecision,
  getIOECalendarEvents,
  createIOEFromSource,
  checkIOECompletionEligibility,
  closeIOEPlan,
  getIOEMetrics,
} from "@/services/ioe";
import type {
  IOEActionPlansParams,
  IOEMilestonesParams,
  IOETasksParams,
  IOEDecisionsParams,
  IOECalendarParams,
  IOECreatePlanParams,
  IOEUpdatePlanParams,
  IOECreateMilestoneParams,
  IOEUpdateMilestoneParams,
  IOECreateTaskParams,
  IOEUpdateTaskParams,
  IOECreateDecisionParams,
  IOEUpdateDecisionParams,
  IOECreateFromSourceParams,
} from "@/types/ioe";

export function useIOEDashboard() {
  return useQuery({ queryKey: ["ioe", "dashboard"], queryFn: getIOEDashboard });
}

export function useIOEActionPlans(params?: IOEActionPlansParams) {
  return useQuery({
    queryKey: ["ioe", "plans", params],
    queryFn:  () => getIOEActionPlans(params),
  });
}

export function useIOEActionPlan(id: string | null) {
  return useQuery({
    queryKey: ["ioe", "plan", id],
    queryFn:  () => getIOEActionPlan(id!),
    enabled:  !!id,
  });
}

export function useCreateIOEActionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: IOECreatePlanParams) => createIOEActionPlan(p),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["ioe", "plans"] }),
  });
}

export function useUpdateIOEActionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: IOEUpdatePlanParams) => updateIOEActionPlan(p),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ["ioe", "plans"] });
      qc.invalidateQueries({ queryKey: ["ioe", "dashboard"] });
    },
  });
}

export function useIOEMilestones(params?: IOEMilestonesParams) {
  return useQuery({
    queryKey: ["ioe", "milestones", params],
    queryFn:  () => getIOEMilestones(params),
  });
}

export function useCreateIOEMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: IOECreateMilestoneParams) => createIOEMilestone(p),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["ioe", "milestones"] }),
  });
}

export function useUpdateIOEMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: IOEUpdateMilestoneParams) => updateIOEMilestone(p),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["ioe", "milestones"] }),
  });
}

export function useIOETasks(params?: IOETasksParams) {
  return useQuery({
    queryKey: ["ioe", "tasks", params],
    queryFn:  () => getIOETasks(params),
  });
}

export function useCreateIOETask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: IOECreateTaskParams) => createIOETask(p),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["ioe", "tasks"] }),
  });
}

export function useUpdateIOETask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: IOEUpdateTaskParams) => updateIOETask(p),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ["ioe", "tasks"] });
      qc.invalidateQueries({ queryKey: ["ioe", "plans"] });
    },
  });
}

export function useIOEDecisions(params?: IOEDecisionsParams) {
  return useQuery({
    queryKey: ["ioe", "decisions", params],
    queryFn:  () => getIOEDecisions(params),
  });
}

export function useCreateIOEDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: IOECreateDecisionParams) => createIOEDecision(p),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["ioe", "decisions"] }),
  });
}

export function useUpdateIOEDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: IOEUpdateDecisionParams) => updateIOEDecision(p),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["ioe", "decisions"] }),
  });
}

export function useIOECalendarEvents(params: IOECalendarParams) {
  return useQuery({
    queryKey: ["ioe", "calendar", params],
    queryFn:  () => getIOECalendarEvents(params),
    enabled:  !!(params.from && params.to),
  });
}

export function useCreateIOEFromSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: IOECreateFromSourceParams) => createIOEFromSource(p),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ["ioe", "plans"] });
      qc.invalidateQueries({ queryKey: ["ioe", "dashboard"] });
    },
  });
}

export function useIOECompletionEligibility(planId: string | null) {
  return useQuery({
    queryKey: ["ioe", "eligibility", planId],
    queryFn:  () => checkIOECompletionEligibility(planId!),
    enabled:  !!planId,
  });
}

export function useCloseIOEPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, verificationNote, closedBy }: { planId: string; verificationNote?: string; closedBy?: string }) =>
      closeIOEPlan(planId, verificationNote, closedBy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ioe", "plans"] });
      qc.invalidateQueries({ queryKey: ["ioe", "dashboard"] });
    },
  });
}

export function useIOEMetrics() {
  return useQuery({ queryKey: ["ioe", "metrics"], queryFn: getIOEMetrics });
}
