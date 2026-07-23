"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listFMIObjectives,  getFMIObjective,  createFMIObjective,  updateFMIObjective,  deleteFMIObjective,
  listFMIDimensions,  getFMIDimension,  createFMIDimension,  updateFMIDimension,  deleteFMIDimension,
  listFMIUnitMeasures, getFMIUnitMeasure, createFMIUnitMeasure, updateFMIUnitMeasure, deleteFMIUnitMeasure,
  listFMIFrequencies, getFMIFrequency, createFMIFrequency, updateFMIFrequency, deleteFMIFrequency,
  listFMIPolarities,
  listFMIFormulas, getFMIFormula, createFMIFormula, updateFMIFormula, deleteFMIFormula,
  listFMIRangeConfigs, getFMIRangeConfig, createFMIRangeConfig, updateFMIRangeConfig, deleteFMIRangeConfig,
} from "@/services/fmi";
import type {
  FMIListParams, FMIListUnitMeasureParams, FMIListFormulaParams,
  FMICreateObjectiveParams, FMIUpdateObjectiveParams,
  FMICreateDimensionParams, FMIUpdateDimensionParams,
  FMICreateUnitMeasureParams, FMIUpdateUnitMeasureParams,
  FMICreateFrequencyParams, FMIUpdateFrequencyParams,
  FMICreateFormulaParams, FMIUpdateFormulaParams,
  FMICreateRangeConfigParams, FMIUpdateRangeConfigParams,
} from "@/types/fmi";

// ─── Query keys ───────────────────────────────────────────────────────────────

const K = {
  objectives:   (p?: FMIListParams)           => ["fmi", "objectives",   p] as const,
  objective:    (id: string)                   => ["fmi", "objective",    id] as const,
  dimensions:   (p?: FMIListParams)           => ["fmi", "dimensions",   p] as const,
  dimension:    (id: string)                   => ["fmi", "dimension",    id] as const,
  unitMeasures: (p?: FMIListUnitMeasureParams) => ["fmi", "unitMeasures", p] as const,
  unitMeasure:  (id: string)                   => ["fmi", "unitMeasure",  id] as const,
  frequencies:  (p?: FMIListParams)           => ["fmi", "frequencies",  p] as const,
  frequency:    (id: string)                   => ["fmi", "frequency",    id] as const,
  polarities:   ["fmi", "polarities"]                                         as const,
  formulas:     (p?: FMIListFormulaParams)    => ["fmi", "formulas",     p] as const,
  formula:      (id: string)                   => ["fmi", "formula",      id] as const,
  rangeConfigs: (p?: FMIListParams)           => ["fmi", "rangeConfigs", p] as const,
  rangeConfig:  (id: string)                   => ["fmi", "rangeConfig",  id] as const,
};

// ─── Objectives ───────────────────────────────────────────────────────────────

export function useFMIObjectives(params?: FMIListParams) {
  return useQuery({ queryKey: K.objectives(params), queryFn: () => listFMIObjectives(params) });
}
export function useFMIObjective(id: string) {
  return useQuery({ queryKey: K.objective(id), queryFn: () => getFMIObjective(id), enabled: !!id });
}
export function useCreateFMIObjective() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: FMICreateObjectiveParams) => createFMIObjective(p),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["fmi", "objectives"] }),
  });
}
export function useUpdateFMIObjective() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: FMIUpdateObjectiveParams) => updateFMIObjective(p),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["fmi", "objectives"] }),
  });
}
export function useDeleteFMIObjective() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFMIObjective(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["fmi", "objectives"] }),
  });
}

// ─── Dimensions ───────────────────────────────────────────────────────────────

export function useFMIDimensions(params?: FMIListParams) {
  return useQuery({ queryKey: K.dimensions(params), queryFn: () => listFMIDimensions(params) });
}
export function useFMIDimension(id: string) {
  return useQuery({ queryKey: K.dimension(id), queryFn: () => getFMIDimension(id), enabled: !!id });
}
export function useCreateFMIDimension() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: FMICreateDimensionParams) => createFMIDimension(p),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["fmi", "dimensions"] }),
  });
}
export function useUpdateFMIDimension() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: FMIUpdateDimensionParams) => updateFMIDimension(p),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["fmi", "dimensions"] }),
  });
}
export function useDeleteFMIDimension() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFMIDimension(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["fmi", "dimensions"] }),
  });
}

// ─── Unit Measures ────────────────────────────────────────────────────────────

export function useFMIUnitMeasures(params?: FMIListUnitMeasureParams) {
  return useQuery({ queryKey: K.unitMeasures(params), queryFn: () => listFMIUnitMeasures(params) });
}
export function useFMIUnitMeasure(id: string) {
  return useQuery({ queryKey: K.unitMeasure(id), queryFn: () => getFMIUnitMeasure(id), enabled: !!id });
}
export function useCreateFMIUnitMeasure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: FMICreateUnitMeasureParams) => createFMIUnitMeasure(p),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["fmi", "unitMeasures"] }),
  });
}
export function useUpdateFMIUnitMeasure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: FMIUpdateUnitMeasureParams) => updateFMIUnitMeasure(p),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["fmi", "unitMeasures"] }),
  });
}
export function useDeleteFMIUnitMeasure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFMIUnitMeasure(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["fmi", "unitMeasures"] }),
  });
}

// ─── Frequencies ──────────────────────────────────────────────────────────────

export function useFMIFrequencies(params?: FMIListParams) {
  return useQuery({ queryKey: K.frequencies(params), queryFn: () => listFMIFrequencies(params) });
}
export function useFMIFrequency(id: string) {
  return useQuery({ queryKey: K.frequency(id), queryFn: () => getFMIFrequency(id), enabled: !!id });
}
export function useCreateFMIFrequency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: FMICreateFrequencyParams) => createFMIFrequency(p),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["fmi", "frequencies"] }),
  });
}
export function useUpdateFMIFrequency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: FMIUpdateFrequencyParams) => updateFMIFrequency(p),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["fmi", "frequencies"] }),
  });
}
export function useDeleteFMIFrequency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFMIFrequency(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["fmi", "frequencies"] }),
  });
}

// ─── Polarities (read-only) ───────────────────────────────────────────────────

export function useFMIPolarities() {
  return useQuery({ queryKey: K.polarities, queryFn: listFMIPolarities });
}

// ─── Formulas ─────────────────────────────────────────────────────────────────

export function useFMIFormulas(params?: FMIListFormulaParams) {
  return useQuery({ queryKey: K.formulas(params), queryFn: () => listFMIFormulas(params) });
}
export function useFMIFormula(id: string) {
  return useQuery({ queryKey: K.formula(id), queryFn: () => getFMIFormula(id), enabled: !!id });
}
export function useCreateFMIFormula() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: FMICreateFormulaParams) => createFMIFormula(p),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["fmi", "formulas"] }),
  });
}
export function useUpdateFMIFormula() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: FMIUpdateFormulaParams) => updateFMIFormula(p),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["fmi", "formulas"] }),
  });
}
export function useDeleteFMIFormula() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFMIFormula(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["fmi", "formulas"] }),
  });
}

// ─── Range Configs ────────────────────────────────────────────────────────────

export function useFMIRangeConfigs(params?: FMIListParams) {
  return useQuery({ queryKey: K.rangeConfigs(params), queryFn: () => listFMIRangeConfigs(params) });
}
export function useFMIRangeConfig(id: string) {
  return useQuery({ queryKey: K.rangeConfig(id), queryFn: () => getFMIRangeConfig(id), enabled: !!id });
}
export function useCreateFMIRangeConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: FMICreateRangeConfigParams) => createFMIRangeConfig(p),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["fmi", "rangeConfigs"] }),
  });
}
export function useUpdateFMIRangeConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: FMIUpdateRangeConfigParams) => updateFMIRangeConfig(p),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["fmi", "rangeConfigs"] }),
  });
}
export function useDeleteFMIRangeConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFMIRangeConfig(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["fmi", "rangeConfigs"] }),
  });
}
