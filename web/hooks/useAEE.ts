"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAEEEjecuciones,
  getAEEEjecucion,
  createAEEEjecucion,
  updateAEEEjecucion,
  cambiarEstadoAEE,
  archivarAEEEjecucion,
  getAEEMisActividades,
  listAEECatalogos,
  createAEECatalogo,
  updateAEECatalogo,
  getAEEHistorial,
  getAEEDashboard,
} from "@/services/aee";
import type { AEEExecution, AEEStatus, AEECreateParams, AEECatalogo } from "@/types/aee";

// ── Ejecuciones ───────────────────────────────────────────────────────────────

export function useAEEEjecuciones(query?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["aee", "ejecuciones", query],
    queryFn:  () => listAEEEjecuciones(query),
  });
}

export function useAEEEjecucion(id?: string) {
  return useQuery({
    queryKey: ["aee", "ejecucion", id],
    queryFn:  () => getAEEEjecucion(id!),
    enabled:  Boolean(id),
  });
}

export function useAEEEjecucionActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["aee"] });

  const create = useMutation({
    mutationFn: (payload: AEECreateParams) => createAEEEjecucion(payload),
    onSuccess:  invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<AEEExecution> }) =>
      updateAEEEjecucion(id, patch),
    onSuccess: invalidate,
  });

  const cambiarEstado = useMutation({
    mutationFn: ({ id, status, userId }: { id: string; status: AEEStatus; userId?: string }) =>
      cambiarEstadoAEE(id, status, userId),
    onSuccess: invalidate,
  });

  const archivar = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId?: string }) =>
      archivarAEEEjecucion(id, userId),
    onSuccess: invalidate,
  });

  return { create, update, cambiarEstado, archivar };
}

// ── Mis actividades ────────────────────────────────────────────────────────────

export function useAEEMisActividades(executedBy?: string, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["aee", "mis-actividades", executedBy, params],
    queryFn:  () => getAEEMisActividades(executedBy!, params),
    enabled:  Boolean(executedBy),
  });
}

// ── Catálogos ─────────────────────────────────────────────────────────────────

export function useAEECatalogos(tipo?: "resultadoEjecucion" | "nivelRiesgo") {
  return useQuery({
    queryKey:  ["aee", "catalogos", tipo],
    queryFn:   () => listAEECatalogos(tipo),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAEECatalogoActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["aee", "catalogos"] });

  const create = useMutation({
    mutationFn: (payload: Partial<AEECatalogo>) => createAEECatalogo(payload),
    onSuccess:  invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<AEECatalogo> }) =>
      updateAEECatalogo(id, patch),
    onSuccess: invalidate,
  });

  return { create, update };
}

// ── Historial ──────────────────────────────────────────────────────────────────

export function useAEEHistorial(ejecucionId?: string) {
  return useQuery({
    queryKey: ["aee", "historial", ejecucionId],
    queryFn:  () => getAEEHistorial(ejecucionId),
    enabled:  Boolean(ejecucionId),
  });
}

export function useAEEHistorialCompleto() {
  return useQuery({
    queryKey: ["aee", "historial", "all"],
    queryFn:  () => getAEEHistorial(),
  });
}

// ── Dashboard ──────────────────────────────────────────────────────────────────

export function useAEEDashboard() {
  return useQuery({
    queryKey: ["aee", "dashboard"],
    queryFn:  getAEEDashboard,
  });
}
