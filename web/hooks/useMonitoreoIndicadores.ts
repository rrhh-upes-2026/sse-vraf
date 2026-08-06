"use client";

import { useQuery } from "@tanstack/react-query";
import type { IndicadorMonitoreo } from "@/services/monitoreo";

async function fetchIndicadores(wsId: string): Promise<IndicadorMonitoreo[]> {
  const res = await fetch(`/api/google/sheets?wsId=${wsId}`);
  if (!res.ok) throw new Error(`Failed to fetch indicators for ${wsId}: ${res.status}`);
  return res.json();
}

/**
 * React Query hook for monitoring indicators.
 * Auto-refreshes every 10 minutes; data is considered fresh for 5 minutes.
 */
export function useMonitoreoIndicadores(wsId: string) {
  return useQuery<IndicadorMonitoreo[], Error>({
    queryKey: ["monitoreo", "indicadores", wsId],
    queryFn: () => fetchIndicadores(wsId),
    staleTime: 1000 * 60 * 5,       // 5 min
    refetchInterval: 1000 * 60 * 10, // auto-refresh 10 min
    retry: 2,
  });
}
