"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAPEPlanes,
  getAPEPlan,
  createAPEPlan,
  updateAPEPlan,
  cambiarEstadoAPE,
  generateAPEPlans,
  previewAPEGeneration,
  getAPEHistorial,
  getAPEDashboard,
} from "@/services/ape";
import type { APEPlan, APEStatus, APEGenerateParams } from "@/types/ape";

// ── Planes ─────────────────────────────────────────────────────────────────────

export function useAPEPlanes(query?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["ape", "planes", query],
    queryFn:  () => listAPEPlanes(query),
  });
}

export function useAPEPlan(id?: string) {
  return useQuery({
    queryKey: ["ape", "plan", id],
    queryFn:  () => getAPEPlan(id!),
    enabled:  Boolean(id),
  });
}

export function useAPEPlanActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["ape"] });

  const create = useMutation({
    mutationFn: (payload: Partial<APEPlan>) => createAPEPlan(payload),
    onSuccess:  invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<APEPlan> }) =>
      updateAPEPlan(id, patch),
    onSuccess: invalidate,
  });

  const cambiarEstado = useMutation({
    mutationFn: ({ id, status, userId }: { id: string; status: APEStatus; userId?: string }) =>
      cambiarEstadoAPE(id, status, userId),
    onSuccess: invalidate,
  });

  return { create, update, cambiarEstado };
}

// ── Generación automática ──────────────────────────────────────────────────────

export function useAPEGenerate() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["ape"] });

  const generate = useMutation({
    mutationFn: (params: APEGenerateParams) => generateAPEPlans(params),
    onSuccess:  invalidate,
  });

  const preview = useMutation({
    mutationFn: (params: APEGenerateParams) => previewAPEGeneration(params),
  });

  return { generate, preview };
}

// ── Historial ──────────────────────────────────────────────────────────────────

export function useAPEHistorial(planId?: string) {
  return useQuery({
    queryKey: ["ape", "historial", planId],
    queryFn:  () => getAPEHistorial(planId!),
    enabled:  Boolean(planId),
  });
}

// ── Dashboard ──────────────────────────────────────────────────────────────────

export function useAPEDashboard(year?: string) {
  return useQuery({
    queryKey: ["ape", "dashboard", year],
    queryFn:  () => getAPEDashboard(year),
  });
}
