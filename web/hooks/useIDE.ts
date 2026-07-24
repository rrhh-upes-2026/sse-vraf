"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listIDEIndicators, getIDEIndicator, createIDEIndicator, updateIDEIndicator, deleteIDEIndicator,
  validateIDEIndicator, previewIDEIndicator, simulateIDEIndicator,
  publishIDEIndicator, archiveIDEIndicator, sendIDEToReview, sendIDEToDraft,
  listIDEVersions, duplicateIDEVersion,
  resolveIDEVariables, detectIDEDuplicates,
  prepareIDEImport, getIDEMappingTemplate,
} from "@/services/ide";
import type {
  IDEListParams, IDECreateParams, IDEUpdateParams,
  IDESimulateParams, IDEPrepareImportParams,
} from "@/types/ide";

// ─── Query key factory ────────────────────────────────────────────────────────

const K = {
  all:       ["ide"] as const,
  lists:     () => [...K.all, "list"] as const,
  list:      (p?: IDEListParams) => [...K.lists(), p ?? {}] as const,
  item:      (id: string) => [...K.all, "item", id] as const,
  versions:  (id: string) => [...K.all, "versions", id] as const,
  variables: (formulaId: string) => [...K.all, "variables", formulaId] as const,
  template:  () => [...K.all, "mapping-template"] as const,
};

// ─── Indicator queries ────────────────────────────────────────────────────────

export function useIDEIndicators(params?: IDEListParams) {
  return useQuery({ queryKey: K.list(params), queryFn: () => listIDEIndicators(params) });
}

export function useIDEIndicator(id: string) {
  return useQuery({ queryKey: K.item(id), queryFn: () => getIDEIndicator(id), enabled: !!id });
}

export function useIDEVersions(indicatorId: string) {
  return useQuery({ queryKey: K.versions(indicatorId), queryFn: () => listIDEVersions(indicatorId), enabled: !!indicatorId });
}

export function useIDEVariables(formulaId: string) {
  return useQuery({ queryKey: K.variables(formulaId), queryFn: () => resolveIDEVariables(formulaId), enabled: !!formulaId });
}

export function useIDEMappingTemplate() {
  return useQuery({ queryKey: K.template(), queryFn: () => getIDEMappingTemplate() });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateIDEIndicator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: IDECreateParams) => createIDEIndicator(params),
    onSuccess: () => qc.invalidateQueries({ queryKey: K.lists() }),
  });
}

export function useUpdateIDEIndicator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: IDEUpdateParams) => updateIDEIndicator(params),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: K.lists() });
      qc.invalidateQueries({ queryKey: K.item(vars.id) });
      qc.invalidateQueries({ queryKey: K.versions(vars.id) });
    },
  });
}

export function useDeleteIDEIndicator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIDEIndicator(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: K.lists() }),
  });
}

export function usePublishIDEIndicator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => publishIDEIndicator(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: K.lists() });
      qc.invalidateQueries({ queryKey: K.item(id) });
      qc.invalidateQueries({ queryKey: K.versions(id) });
    },
  });
}

export function useArchiveIDEIndicator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveIDEIndicator(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: K.lists() });
      qc.invalidateQueries({ queryKey: K.item(id) });
    },
  });
}

export function useSendIDEToReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sendIDEToReview(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: K.lists() });
      qc.invalidateQueries({ queryKey: K.item(id) });
    },
  });
}

export function useSendIDEToDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sendIDEToDraft(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: K.lists() });
      qc.invalidateQueries({ queryKey: K.item(id) });
    },
  });
}

export function useDuplicateIDEVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) => duplicateIDEVersion(versionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: K.lists() }),
  });
}

export function useValidateIDEIndicator() {
  return useMutation({
    mutationFn: (params: Parameters<typeof validateIDEIndicator>[0]) => validateIDEIndicator(params),
  });
}

export function usePreviewIDEIndicator() {
  return useMutation({
    mutationFn: (params: Partial<IDECreateParams>) => previewIDEIndicator(params),
  });
}

export function useSimulateIDEIndicator() {
  return useMutation({
    mutationFn: (params: IDESimulateParams) => simulateIDEIndicator(params),
  });
}

export function useDetectIDEDuplicates() {
  return useMutation({
    mutationFn: (params: { codigo?: string; nombre?: string; excludeId?: string }) =>
      detectIDEDuplicates(params),
  });
}

export function usePrepareIDEImport() {
  return useMutation({
    mutationFn: (params: IDEPrepareImportParams) => prepareIDEImport(params),
  });
}
