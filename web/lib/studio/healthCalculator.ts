import type {
  BlueprintMetadata,
  InstanceSummary,
  RuntimeStats,
  PlatformHealth,
  HealthMetric,
  HealthAlert,
  HealthStatus,
} from "@/types/studio";

function toStatus(score: number): HealthStatus {
  if (score >= 80) return "healthy";
  if (score >= 60) return "degraded";
  return "critical";
}

export function computePlatformHealth(
  stats: RuntimeStats,
  summaries: InstanceSummary[],
  blueprints: BlueprintMetadata[],
  checkedAt: string,
): PlatformHealth {
  const criticalCount = summaries.filter((s) => s.health === "critical").length;
  const warningCount  = summaries.filter((s) => s.health === "warning").length;

  const rawScore = Math.max(0, 100 - criticalCount * 15 - warningCount * 5);
  const score    = Math.round(rawScore);

  const publishedCount   = blueprints.filter((b) => b.status === "published").length;
  const slaCompliancePct =
    stats.total > 0
      ? Math.round(((stats.total - criticalCount) / stats.total) * 100)
      : 100;

  const metrics: HealthMetric[] = [
    {
      id:    "active-instances",
      label: "Instancias activas",
      value: stats.running,
      status: stats.running === 0 ? "healthy" : criticalCount > 0 ? "degraded" : "healthy",
      trend: "stable",
    },
    {
      id:    "sla-compliance",
      label: "Cumplimiento SLA",
      value: `${slaCompliancePct}%`,
      status: slaCompliancePct >= 90 ? "healthy" : slaCompliancePct >= 70 ? "degraded" : "critical",
      trend: criticalCount > 0 ? "down" : "stable",
    },
    {
      id:    "critical-instances",
      label: "Instancias críticas",
      value: criticalCount,
      status: criticalCount === 0 ? "healthy" : criticalCount < 3 ? "degraded" : "critical",
    },
    {
      id:    "published-blueprints",
      label: "Blueprints publicados",
      value: publishedCount,
      status: publishedCount > 0 ? "healthy" : "degraded",
    },
    {
      id:    "avg-completion",
      label: "Tiempo promedio (días)",
      value: stats.avgCompletionDays ?? "—",
      status: "healthy",
      trend: "stable",
    },
    {
      id:    "blocked-instances",
      label: "Instancias bloqueadas",
      value: stats.blocked,
      status: stats.blocked === 0 ? "healthy" : stats.blocked < 3 ? "degraded" : "critical",
    },
  ];

  const alerts: HealthAlert[] = summaries
    .filter((s) => s.health !== "ok")
    .map((s) => ({
      id:         `alert-${s.id}`,
      severity:   s.health === "critical" ? ("error" as const) : ("warning" as const),
      message:
        s.health === "critical"
          ? `"${s.nombre}" atascada ${s.staleDays} días en etapa "${s.currentStageLabel}".`
          : `"${s.nombre}" retrasada ${s.staleDays} días en etapa "${s.currentStageLabel}".`,
      blueprintId: s.blueprintId,
      instanceId:  s.id,
      occurredAt:  s.updatedAt,
    }));

  return {
    overallStatus: toStatus(score),
    score,
    checkedAt,
    metrics,
    alerts,
  };
}
