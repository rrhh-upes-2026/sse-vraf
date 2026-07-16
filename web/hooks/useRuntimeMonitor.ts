"use client";

import { useQuery } from "@tanstack/react-query";
import { InstanceSummariesService } from "@/services/studio";
import type { InstanceSummary, RuntimeStats } from "@/types/studio";

// ── query keys ────────────────────────────────────────────────────────────────

export const monitorKeys = {
  all:       () => ["instanceSummaries"] as const,
  list:      (filter?: { blueprintId?: string }) =>
               ["instanceSummaries", "list", filter] as const,
};

// ── helpers ───────────────────────────────────────────────────────────────────

function computeStats(summaries: InstanceSummary[]): RuntimeStats {
  const running   = summaries.filter((s) => s.estado === "in_progress").length;
  const completed = summaries.filter((s) => s.estado === "completed").length;
  const blocked   = summaries.filter((s) => s.estado === "blocked").length;
  const cancelled = summaries.filter((s) => s.estado === "cancelled").length;
  const waiting   = summaries.filter((s) => s.estado === "waiting").length;
  const archived  = summaries.filter((s) => s.estado === "archived").length;

  const completedWithDates = summaries.filter(
    (s) => s.estado === "completed" && s.completedAt,
  );
  const avgCompletionDays =
    completedWithDates.length === 0
      ? null
      : Math.round(
          completedWithDates.reduce((sum, s) => {
            const start = new Date(s.startedAt).getTime();
            const end   = new Date(s.completedAt!).getTime();
            return sum + (end - start) / 86_400_000;
          }, 0) / completedWithDates.length,
        );

  return {
    total: summaries.length,
    running,
    completed,
    blocked,
    cancelled,
    waiting,
    archived,
    avgCompletionDays,
  };
}

// ── hooks ─────────────────────────────────────────────────────────────────────

export function useInstanceSummaries(blueprintId?: string) {
  const filter = blueprintId ? { blueprintId } : undefined;
  return useQuery({
    queryKey: monitorKeys.list(filter),
    queryFn:  () => InstanceSummariesService.list(filter),
  });
}

export function useRuntimeStats(blueprintId?: string) {
  const { data: summaries = [], isLoading, error } = useInstanceSummaries(blueprintId);
  return {
    stats:     computeStats(summaries),
    summaries,
    isLoading,
    error,
  };
}
