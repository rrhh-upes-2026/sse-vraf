"use client";

/**
 * TanStack Query hooks for PRO-TH-001 — Contratación service.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ContratacionService } from "@/services/contratacion";
import type {
  ProcesoContratacion,
  EtapaContratacion,
  RequisicionPersonal,
} from "@/types/contratacion";

// ── Query keys ────────────────────────────────────────────────────────────────

export const CONTRATACION_KEYS = {
  all: ["contratacion"] as const,
  procesos: (wsId: string) => ["contratacion", "procesos", wsId] as const,
  proceso: (id: string) => ["contratacion", "proceso", id] as const,
  requisicion: (procesoId: string) => ["contratacion", "requisicion", procesoId] as const,
};

// ── Lista de procesos ─────────────────────────────────────────────────────────

export function useProcesosContratacion(
  wsId: string,
  filtros?: { etapa?: EtapaContratacion; prioridad?: string },
) {
  return useQuery({
    queryKey: [...CONTRATACION_KEYS.procesos(wsId), filtros],
    queryFn: () => ContratacionService.listarProcesos(wsId, filtros),
  });
}

// ── Proceso individual ────────────────────────────────────────────────────────

export function useProcesoContratacion(id: string | null) {
  return useQuery({
    queryKey: CONTRATACION_KEYS.proceso(id ?? ""),
    queryFn: () => ContratacionService.obtenerProceso(id!),
    enabled: !!id,
  });
}

// ── Crear proceso ─────────────────────────────────────────────────────────────

export function useCrearProceso(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ProcesoContratacion>) =>
      ContratacionService.crearProceso(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONTRATACION_KEYS.procesos(wsId) });
    },
  });
}

// ── Avanzar etapa ─────────────────────────────────────────────────────────────

export function useAvanzarEtapa(procesoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (accion: {
      resultado: "aprobado" | "rechazado" | "pendiente";
      notas?: string;
      responsable: string;
    }) => ContratacionService.avanzarEtapa(procesoId, accion),
    onSuccess: (data) => {
      qc.setQueryData(CONTRATACION_KEYS.proceso(procesoId), data);
    },
  });
}

// ── Guardar Requisición ───────────────────────────────────────────────────────

export function useGuardarRequisicion(procesoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<RequisicionPersonal>) =>
      ContratacionService.guardarRequisicion(procesoId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONTRATACION_KEYS.proceso(procesoId) });
      qc.invalidateQueries({ queryKey: CONTRATACION_KEYS.requisicion(procesoId) });
    },
  });
}

// ── Obtener Requisición ───────────────────────────────────────────────────────

export function useRequisicion(procesoId: string | null) {
  return useQuery({
    queryKey: CONTRATACION_KEYS.requisicion(procesoId ?? ""),
    queryFn: () => ContratacionService.obtenerRequisicion(procesoId!),
    enabled: !!procesoId,
  });
}
