"use client";

import { useQuery } from "@tanstack/react-query";
import type { CarpetaEvidencia } from "@/services/monitoreo";

async function fetchEvidencias(wsId: string): Promise<CarpetaEvidencia[]> {
  const res = await fetch(`/api/google/drive?wsId=${wsId}`);
  if (!res.ok) throw new Error(`Failed to fetch evidencias for ${wsId}: ${res.status}`);
  return res.json();
}

/**
 * React Query hook for monitoring evidence folders.
 * Auto-refreshes every 10 minutes; data is considered fresh for 5 minutes.
 */
export function useMonitoreoEvidencias(wsId: string) {
  return useQuery<CarpetaEvidencia[], Error>({
    queryKey: ["monitoreo", "evidencias", wsId],
    queryFn: () => fetchEvidencias(wsId),
    staleTime: 1000 * 60 * 5,       // 5 min
    refetchInterval: 1000 * 60 * 10, // auto-refresh 10 min
    retry: 2,
  });
}
