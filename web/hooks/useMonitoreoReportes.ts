"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReportesHierarchy } from "@/services/reportes";

async function fetchReportes(wsId: string): Promise<ReportesHierarchy> {
  const res = await fetch(`/api/google/reportes?wsId=${wsId}`);
  if (!res.ok) throw new Error(`Failed to fetch reportes for ${wsId}: ${res.status}`);
  return res.json();
}

export function useMonitoreoReportes(wsId: string) {
  return useQuery<ReportesHierarchy, Error>({
    queryKey: ["monitoreo", "reportes", wsId],
    queryFn: () => fetchReportes(wsId),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 10,
    retry: 2,
  });
}
