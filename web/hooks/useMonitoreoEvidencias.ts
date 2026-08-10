"use client";

import { useQuery } from "@tanstack/react-query";
import type { EvidenciaHierarchy } from "@/services/monitoreo";

async function fetchEvidencias(wsId: string): Promise<EvidenciaHierarchy> {
  const res = await fetch(`/api/google/drive?wsId=${wsId}`);
  if (!res.ok) throw new Error(`Failed to fetch evidencias for ${wsId}: ${res.status}`);
  return res.json();
}

export function useMonitoreoEvidencias(wsId: string) {
  return useQuery<EvidenciaHierarchy, Error>({
    queryKey: ["monitoreo", "evidencias", wsId],
    queryFn: () => fetchEvidencias(wsId),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 10,
    retry: 2,
  });
}
