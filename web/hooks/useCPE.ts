"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  calcularCPECumplimiento,
  getCPESnapshot,
  listCPESnapshots,
  getCPEDashboard,
  getCPEBrechas,
  listCPEPlanesMejora,
  getCPEPlanMejora,
  createCPEPlanMejora,
  updateCPEPlanMejora,
  deleteCPEPlanMejora,
  listCPECatalogos,
  updateCPECatalogo,
  getCPEHistorial,
} from "@/services/cpe";
import type {
  CPECatalogoTipo,
  CPECalcularParams,
  CPECreatePlanParams,
  CPEUpdatePlanParams,
} from "@/types/cpe";

export function useCPEDashboard(year?: number) {
  return useQuery({
    queryKey: ["cpe", "dashboard", year],
    queryFn:  () => getCPEDashboard(year),
  });
}

export function useCPESnapshots(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["cpe", "snapshots", params],
    queryFn:  () => listCPESnapshots(params),
  });
}

export function useCPESnapshot(id: string) {
  return useQuery({
    queryKey: ["cpe", "snapshot", id],
    queryFn:  () => getCPESnapshot(id),
    enabled:  !!id,
  });
}

export function useCPEBrechas(year?: number) {
  return useQuery({
    queryKey: ["cpe", "brechas", year],
    queryFn:  () => getCPEBrechas(year),
  });
}

export function useCalcularCPE() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: CPECalcularParams) => calcularCPECumplimiento(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cpe"] });
    },
  });
}

export function useCPEPlanesMejora(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["cpe", "planes", params],
    queryFn:  () => listCPEPlanesMejora(params),
  });
}

export function useCPEPlanMejora(id: string) {
  return useQuery({
    queryKey: ["cpe", "plan", id],
    queryFn:  () => getCPEPlanMejora(id),
    enabled:  !!id,
  });
}

export function useCreateCPEPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CPECreatePlanParams) => createCPEPlanMejora(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cpe", "planes"] });
    },
  });
}

export function useUpdateCPEPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: CPEUpdatePlanParams }) =>
      updateCPEPlanMejora(id, patch),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["cpe", "planes"] });
      qc.invalidateQueries({ queryKey: ["cpe", "plan", id] });
    },
  });
}

export function useDeleteCPEPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCPEPlanMejora(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cpe", "planes"] });
    },
  });
}

export function useCPECatalogos(tipo?: CPECatalogoTipo) {
  return useQuery({
    queryKey: ["cpe", "catalogos", tipo],
    queryFn:  () => listCPECatalogos(tipo),
  });
}

export function useUpdateCPECatalogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) =>
      updateCPECatalogo(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cpe", "catalogos"] });
    },
  });
}

export function useCPEHistorial() {
  return useQuery({
    queryKey: ["cpe", "historial"],
    queryFn:  getCPEHistorial,
  });
}
