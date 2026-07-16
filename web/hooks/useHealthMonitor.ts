"use client";

import { useMemo } from "react";
import { useRuntimeStats } from "./useRuntimeMonitor";
import { useBlueprintRegistry } from "./useBlueprintRegistry";
import { computePlatformHealth } from "@/lib/studio/healthCalculator";

export function usePlatformHealth() {
  const { stats, summaries, isLoading: statsLoading } = useRuntimeStats();
  const { data: blueprints = [], isLoading: bpLoading }  = useBlueprintRegistry();

  const isLoading = statsLoading || bpLoading;

  const health = useMemo(() => {
    if (isLoading) return null;
    return computePlatformHealth(
      stats,
      summaries,
      blueprints,
      new Date().toISOString(),
    );
  }, [stats, summaries, blueprints, isLoading]);

  return { health, isLoading };
}
