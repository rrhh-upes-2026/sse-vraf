"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listProcesos,
  getProceso,
  createProceso,
  updateProceso,
  archivarProceso,
  activarProceso,
  duplicarProceso,
  listProcedimientos,
  getProcedimiento,
  createProcedimiento,
  updateProcedimiento,
  archivarProcedimiento,
  activarProcedimiento,
  duplicarProcedimiento,
  listActividades,
  getActividad,
  createActividad,
  updateActividad,
  archivarActividad,
  activarActividad,
  duplicarActividad,
  listPMECatalogos,
  getPMEHistorial,
  getPMEDashboard,
} from "@/services/pme";
import type {
  PMEProceso,
  PMEProcedimiento,
  PMEActividad,
  PMECatalogoTipo,
} from "@/types/pme";

// ── Procesos ──────────────────────────────────────────────────────────────────

export function usePMEProcesos(query?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["pme", "procesos", query],
    queryFn:  () => listProcesos(query),
  });
}

export function usePMEProceso(id?: string) {
  return useQuery({
    queryKey: ["pme", "proceso", id],
    queryFn:  () => getProceso(id!),
    enabled:  Boolean(id),
  });
}

export function usePMEProcesoActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["pme"] });

  const create = useMutation({
    mutationFn: (payload: Partial<PMEProceso>) => createProceso(payload),
    onSuccess:  invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<PMEProceso> }) =>
      updateProceso(id, patch),
    onSuccess: invalidate,
  });

  const archivar = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId?: string }) => archivarProceso(id, userId),
    onSuccess:  invalidate,
  });

  const activar = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId?: string }) => activarProceso(id, userId),
    onSuccess:  invalidate,
  });

  const duplicar = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId?: string }) => duplicarProceso(id, userId),
    onSuccess:  invalidate,
  });

  return { create, update, archivar, activar, duplicar };
}

// ── Procedimientos ────────────────────────────────────────────────────────────

export function usePMEProcedimientos(query?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["pme", "procedimientos", query],
    queryFn:  () => listProcedimientos(query),
  });
}

export function usePMEProcedimiento(id?: string) {
  return useQuery({
    queryKey: ["pme", "procedimiento", id],
    queryFn:  () => getProcedimiento(id!),
    enabled:  Boolean(id),
  });
}

export function usePMEProcedimientoActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["pme"] });

  const create = useMutation({
    mutationFn: (payload: Partial<PMEProcedimiento>) => createProcedimiento(payload),
    onSuccess:  invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<PMEProcedimiento> }) =>
      updateProcedimiento(id, patch),
    onSuccess: invalidate,
  });

  const archivar = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId?: string }) =>
      archivarProcedimiento(id, userId),
    onSuccess: invalidate,
  });

  const activar = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId?: string }) =>
      activarProcedimiento(id, userId),
    onSuccess: invalidate,
  });

  const duplicar = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId?: string }) =>
      duplicarProcedimiento(id, userId),
    onSuccess: invalidate,
  });

  return { create, update, archivar, activar, duplicar };
}

// ── Actividades ───────────────────────────────────────────────────────────────

export function usePMEActividades(query?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["pme", "actividades", query],
    queryFn:  () => listActividades(query),
  });
}

export function usePMEActividad(id?: string) {
  return useQuery({
    queryKey: ["pme", "actividad", id],
    queryFn:  () => getActividad(id!),
    enabled:  Boolean(id),
  });
}

export function usePMEActividadActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["pme"] });

  const create = useMutation({
    mutationFn: (payload: Partial<PMEActividad>) => createActividad(payload),
    onSuccess:  invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<PMEActividad> }) =>
      updateActividad(id, patch),
    onSuccess: invalidate,
  });

  const archivar = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId?: string }) =>
      archivarActividad(id, userId),
    onSuccess: invalidate,
  });

  const activar = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId?: string }) => activarActividad(id, userId),
    onSuccess:  invalidate,
  });

  const duplicar = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId?: string }) =>
      duplicarActividad(id, userId),
    onSuccess: invalidate,
  });

  return { create, update, archivar, activar, duplicar };
}

// ── Catálogos ─────────────────────────────────────────────────────────────────

export function usePMECatalogos(tipo?: PMECatalogoTipo) {
  return useQuery({
    queryKey: ["pme", "catalogos", tipo],
    queryFn:  () => listPMECatalogos(tipo),
  });
}

export function usePMECatalogosPorTipo(tipo: PMECatalogoTipo) {
  return useQuery({
    queryKey:  ["pme", "catalogos", tipo],
    queryFn:   () => listPMECatalogos(tipo),
    staleTime: 5 * 60 * 1000,
  });
}

// ── Historial ─────────────────────────────────────────────────────────────────

export function usePMEHistorial(entidadId?: string, entidadTipo?: string) {
  return useQuery({
    queryKey: ["pme", "historial", entidadId, entidadTipo],
    queryFn:  () => getPMEHistorial(entidadId!, entidadTipo),
    enabled:  Boolean(entidadId),
  });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function usePMEDashboard() {
  return useQuery({
    queryKey: ["pme", "dashboard"],
    queryFn:  getPMEDashboard,
  });
}
