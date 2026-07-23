"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getExecutiveDashboard,
  getExecutiveUnitSummary,
  getAllKPIs,
  getKPIsByDashboard,
  getKPIsByUnit,
  getKPIsByCategoria,
  getKPIsSemaforo,
} from "@/services/executiveDashboard";
import type { KPISemaforo } from "@/types/executive";

export function useExecutiveDashboard(wsId: string) {
  return useQuery({
    queryKey: ["executive", "dashboard", wsId],
    queryFn: () => getExecutiveDashboard(wsId),
    staleTime: 2 * 60 * 1000,
    enabled: !!wsId,
  });
}

export function useExecutiveUnitSummary(wsId: string, unitKey: string) {
  return useQuery({
    queryKey: ["executive", "unit", unitKey, wsId],
    queryFn: () => getExecutiveUnitSummary(wsId, unitKey),
    staleTime: 2 * 60 * 1000,
    enabled: !!wsId && !!unitKey,
  });
}

export function useAllKPIs(wsId: string) {
  return useQuery({
    queryKey: ["kpis", "all", wsId],
    queryFn: () => getAllKPIs(wsId),
    staleTime: 5 * 60 * 1000,
    enabled: !!wsId,
  });
}

export function useKPIsByDashboard(wsId: string, dashboard = "ejecutivo") {
  return useQuery({
    queryKey: ["kpis", "dashboard", dashboard, wsId],
    queryFn: () => getKPIsByDashboard(wsId, dashboard),
    staleTime: 5 * 60 * 1000,
    enabled: !!wsId,
  });
}

export function useKPIsByUnit(wsId: string, unitKey: string) {
  return useQuery({
    queryKey: ["kpis", "unit", unitKey, wsId],
    queryFn: () => getKPIsByUnit(wsId, unitKey),
    staleTime: 5 * 60 * 1000,
    enabled: !!wsId && !!unitKey,
  });
}

export function useKPIsByCategoria(wsId: string, categoria: string) {
  return useQuery({
    queryKey: ["kpis", "categoria", categoria, wsId],
    queryFn: () => getKPIsByCategoria(wsId, categoria),
    staleTime: 5 * 60 * 1000,
    enabled: !!wsId && !!categoria,
  });
}

export function useKPIsSemaforo(wsId: string, color: KPISemaforo) {
  return useQuery({
    queryKey: ["kpis", "semaforo", color, wsId],
    queryFn: () => getKPIsSemaforo(wsId, color),
    staleTime: 5 * 60 * 1000,
    enabled: !!wsId && !!color,
  });
}
