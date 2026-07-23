"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createEntityHooks } from "./useEntity";
import {
  IndicadoresService,
  CatalogosService,
  listIndicadores,
  getIndicador,
  createIndicador,
  updateIndicador,
  activarIndicador,
  desactivarIndicador,
  duplicarIndicador,
  getHistorial,
  listCatalogos,
  getIMEDashboard,
} from "@/services/ime";
import type { IMEIndicador, IMECatalogo, IMECatalogoTipo, IMEDashboardResumen } from "@/types/ime";
import type { ListQuery } from "@/services/adapters/types";

// ── Base entity hooks ─────────────────────────────────────────────────────────

const indicadoresHooks = createEntityHooks<IMEIndicador>("imeIndicadores", IndicadoresService);
const catalogosHooks   = createEntityHooks<IMECatalogo>("imeCatalogos", CatalogosService);

export const {
  useList:    useIMEIndicadoresBase,
  useItem:    useIMEIndicadorBase,
  useActions: useIMEIndicadoresBaseActions,
} = indicadoresHooks;

export const {
  useList:    useIMECatalogosBase,
  useItem:    useIMECatalogoBase,
  useActions: useIMECatalogosActions,
} = catalogosHooks;

// ── Indicadores — domain hooks ────────────────────────────────────────────────

export function useIMEIndicadores(query?: ListQuery & { active?: string; indicatorType?: string; frequency?: string; processId?: string; year?: string | number }) {
  return useQuery<IMEIndicador[]>({
    queryKey: ["imeIndicadores", "list", query],
    queryFn: () => listIndicadores(query as Record<string, unknown>),
    staleTime: 30 * 1000,
  });
}

export function useIMEIndicador(id?: string) {
  return useQuery<IMEIndicador | null>({
    queryKey: ["imeIndicadores", "item", id],
    queryFn: () => getIndicador(id!),
    enabled: !!id,
  });
}

export function useIMEIndicadorActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["imeIndicadores"] });

  const create = useMutation({
    mutationFn: (payload: Partial<IMEIndicador>) => createIndicador(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<IMEIndicador> }) =>
      updateIndicador(id, patch),
    onSuccess: invalidate,
  });

  const activar = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId?: string }) =>
      activarIndicador(id, userId),
    onSuccess: invalidate,
  });

  const desactivar = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId?: string }) =>
      desactivarIndicador(id, userId),
    onSuccess: invalidate,
  });

  const duplicar = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId?: string }) =>
      duplicarIndicador(id, userId),
    onSuccess: invalidate,
  });

  return { create, update, activar, desactivar, duplicar };
}

// ── Historial ─────────────────────────────────────────────────────────────────

export function useIMEHistorial(indicadorId?: string) {
  return useQuery({
    queryKey: ["imeHistorial", indicadorId],
    queryFn: () => getHistorial(indicadorId!),
    enabled: !!indicadorId,
  });
}

// ── Catálogos ─────────────────────────────────────────────────────────────────

export function useIMECatalogos(tipo?: IMECatalogoTipo) {
  return useQuery<IMECatalogo[]>({
    queryKey: ["imeCatalogos", tipo ?? "all"],
    queryFn: () => listCatalogos(tipo),
    staleTime: 5 * 60 * 1000,
  });
}

export function useIMECatalogosPorTipo(tipo: IMECatalogoTipo) {
  return useQuery<IMECatalogo[]>({
    queryKey: ["imeCatalogos", tipo],
    queryFn: () => listCatalogos(tipo),
    staleTime: 5 * 60 * 1000,
    enabled: !!tipo,
  });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function useIMEDashboard() {
  return useQuery<IMEDashboardResumen>({
    queryKey: ["ime", "dashboard"],
    queryFn: () => getIMEDashboard(),
    staleTime: 60 * 1000,
  });
}
