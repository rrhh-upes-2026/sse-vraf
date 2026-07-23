"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listEMEEvidencias,
  getEMEEvidencia,
  createEMEEvidencia,
  updateEMEEvidencia,
  cambiarEstadoEME,
  validarEMEEvidencia,
  nuevaVersionEME,
  archivarEMEEvidencia,
  getEMEMisEvidencias,
  listEMECatalogos,
  createEMECatalogo,
  updateEMECatalogo,
  getEMEHistorial,
  buscarEMEEvidencias,
  getEMEDashboard,
} from "@/services/eme";
import type {
  EMEEvidence,
  EMEStatus,
  EMECreateParams,
  EMECatalogo,
  EMECatalogoTipo,
  EMENuevaVersionParams,
  EMEValidarParams,
} from "@/types/eme";

// ── Evidencias ────────────────────────────────────────────────────────────────

export function useEMEEvidencias(query?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["eme", "evidencias", query],
    queryFn:  () => listEMEEvidencias(query),
  });
}

export function useEMEEvidencia(id?: string) {
  return useQuery({
    queryKey: ["eme", "evidencia", id],
    queryFn:  () => getEMEEvidencia(id!),
    enabled:  Boolean(id),
  });
}

export function useEMEEvidenciaActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["eme"] });

  const create = useMutation({
    mutationFn: (payload: EMECreateParams) => createEMEEvidencia(payload),
    onSuccess:  invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<EMEEvidence> & { userId?: string } }) =>
      updateEMEEvidencia(id, patch),
    onSuccess: invalidate,
  });

  const cambiarEstado = useMutation({
    mutationFn: ({ id, status, userId }: { id: string; status: EMEStatus; userId?: string }) =>
      cambiarEstadoEME(id, status, userId),
    onSuccess: invalidate,
  });

  const validar = useMutation({
    mutationFn: (params: EMEValidarParams) => validarEMEEvidencia(params),
    onSuccess:  invalidate,
  });

  const nuevaVersion = useMutation({
    mutationFn: (params: EMENuevaVersionParams) => nuevaVersionEME(params),
    onSuccess:  invalidate,
  });

  const archivar = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId?: string }) =>
      archivarEMEEvidencia(id, userId),
    onSuccess: invalidate,
  });

  return { create, update, cambiarEstado, validar, nuevaVersion, archivar };
}

// ── Mis evidencias ─────────────────────────────────────────────────────────────

export function useEMEMisEvidencias(
  uploadedBy: string,
  params?: Record<string, unknown>,
) {
  return useQuery({
    queryKey: ["eme", "misEvidencias", uploadedBy, params],
    queryFn:  () => getEMEMisEvidencias(uploadedBy, params),
    enabled:  Boolean(uploadedBy),
  });
}

// ── Catálogos ──────────────────────────────────────────────────────────────────

export function useEMECatalogos(tipo?: EMECatalogoTipo) {
  return useQuery({
    queryKey: ["eme", "catalogos", tipo],
    queryFn:  () => listEMECatalogos(tipo),
  });
}

export function useEMECatalogoActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["eme", "catalogos"] });

  const create = useMutation({
    mutationFn: (payload: Partial<EMECatalogo>) => createEMECatalogo(payload),
    onSuccess:  invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<EMECatalogo> }) =>
      updateEMECatalogo(id, patch),
    onSuccess: invalidate,
  });

  return { create, update };
}

// ── Historial ──────────────────────────────────────────────────────────────────

export function useEMEHistorial(evidenciaId?: string) {
  return useQuery({
    queryKey: ["eme", "historial", evidenciaId],
    queryFn:  () => getEMEHistorial(evidenciaId),
  });
}

// ── Búsqueda ───────────────────────────────────────────────────────────────────

export function useEMEBusqueda(q: string) {
  return useQuery({
    queryKey: ["eme", "busqueda", q],
    queryFn:  () => buscarEMEEvidencias(q),
    enabled:  q.length >= 2,
  });
}

// ── Dashboard ──────────────────────────────────────────────────────────────────

export function useEMEDashboard() {
  return useQuery({
    queryKey: ["eme", "dashboard"],
    queryFn:  () => getEMEDashboard(),
  });
}
