"use client";

import { useQuery } from "@tanstack/react-query";
import { getVRAFDashboardResumen } from "@/services/vraf";
import type { VRAFDashboardResumen } from "@/types/entities";

export function useVRAFDashboard(wsId = "vraf") {
  return useQuery<VRAFDashboardResumen>({
    queryKey: ["vraf", "dashboard", wsId],
    queryFn: () => getVRAFDashboardResumen(wsId),
  });
}
