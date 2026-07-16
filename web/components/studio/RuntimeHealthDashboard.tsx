"use client";

import { useState } from "react";
import { cn, fmtShortDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlatformHealth } from "@/hooks/useHealthMonitor";
import type { HealthStatus, HealthMetric, HealthAlert } from "@/types/studio";

// ── health status config ──────────────────────────────────────────────────────

interface StatusConfig {
  label:    string;
  bg:       string;
  border:   string;
  text:     string;
  ring:     string;
  iconPath: string;
}

const STATUS_CONFIG: Record<HealthStatus, StatusConfig> = {
  healthy: {
    label:    "Plataforma saludable",
    bg:       "bg-sse-sem-green-bg",
    border:   "border-sse-sem-green-border",
    text:     "text-sse-sem-green-fg",
    ring:     "ring-sse-sem-green-border",
    iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  degraded: {
    label:    "Plataforma degradada",
    bg:       "bg-sse-sem-amber-bg",
    border:   "border-sse-sem-amber-border",
    text:     "text-sse-sem-amber-fg",
    ring:     "ring-sse-sem-amber-border",
    iconPath: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  },
  critical: {
    label:    "Plataforma crítica",
    bg:       "bg-sse-sem-red-bg",
    border:   "border-sse-sem-red-border",
    text:     "text-sse-sem-red-fg",
    ring:     "ring-sse-sem-red-border",
    iconPath: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
};

const METRIC_STATUS_DOT: Record<HealthStatus, string> = {
  healthy:  "bg-sse-sem-green-fg",
  degraded: "bg-sse-sem-amber-fg",
  critical: "bg-sse-sem-red-fg",
};

const TREND_ICON: Record<string, string> = {
  up:     "↑",
  down:   "↓",
  stable: "→",
};

const ALERT_SEVERITY_STYLE: Record<string, { bg: string; text: string }> = {
  error:   { bg: "bg-sse-sem-red-bg",   text: "text-sse-sem-red-fg" },
  warning: { bg: "bg-sse-sem-amber-bg", text: "text-sse-sem-amber-fg" },
  info:    { bg: "bg-sse-pill-blue-bg", text: "text-sse-primary" },
};

// ── sub-components ────────────────────────────────────────────────────────────

function MetricCard({ metric }: { metric: HealthMetric }) {
  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] text-sse-muted">{metric.label}</p>
        <div className="flex items-center gap-1">
          {metric.trend && (
            <span className={cn(
              "text-[11px]",
              metric.trend === "up"   ? "text-sse-sem-green-fg" :
              metric.trend === "down" ? "text-sse-sem-red-fg"   : "text-sse-muted",
            )}>
              {TREND_ICON[metric.trend]}
            </span>
          )}
          <div className={cn("w-2 h-2 rounded-full", METRIC_STATUS_DOT[metric.status])} />
        </div>
      </div>
      <p className="text-[22px] font-semibold text-sse-ink tabular-nums">
        {String(metric.value)}
      </p>
    </div>
  );
}

function AlertRow({ alert }: { alert: HealthAlert }) {
  const style = ALERT_SEVERITY_STYLE[alert.severity] ?? ALERT_SEVERITY_STYLE.info;
  const alertDate = fmtShortDate(alert.occurredAt);

  return (
    <div className={cn("flex items-start gap-3 rounded-md px-3 py-2.5", style.bg)}>
      <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", METRIC_STATUS_DOT[
        alert.severity === "error" ? "critical" : alert.severity === "warning" ? "degraded" : "healthy"
      ])} />
      <div className="flex-1 min-w-0">
        <p className={cn("text-[12px] font-medium", style.text)}>{alert.message}</p>
        {alert.instanceId && (
          <p className="text-[11px] text-sse-muted mt-0.5 font-mono">{alert.instanceId}</p>
        )}
      </div>
      <span className="text-[11px] text-sse-muted shrink-0">{alertDate}</span>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function RuntimeHealthDashboard() {
  const { health, isLoading } = usePlatformHealth();
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-20 w-full rounded-md" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20 rounded-md" />)}
        </div>
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
    );
  }

  if (!health) return null;

  const statusCfg = STATUS_CONFIG[health.overallStatus];
  const visibleAlerts = showAllAlerts ? health.alerts : health.alerts.slice(0, 3);

  return (
    <div className="space-y-5">
      {/* Overall status banner */}
      <div className={cn(
        "flex items-center gap-4 rounded-lg border px-5 py-4",
        statusCfg.bg,
        statusCfg.border,
      )}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={cn("w-8 h-8 shrink-0", statusCfg.text)}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={statusCfg.iconPath} />
        </svg>
        <div className="flex-1">
          <p className={cn("text-[15px] font-semibold", statusCfg.text)}>
            {statusCfg.label}
          </p>
          <p className="text-[12px] text-sse-muted mt-0.5">
            Última verificación: {new Date(health.checkedAt).toLocaleTimeString("es-SV", {
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className={cn("text-[32px] font-bold tabular-nums", statusCfg.text)}>
            {health.score}
          </p>
          <p className="text-[11px] text-sse-muted">/ 100</p>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-2 rounded-full bg-sse-border overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            health.overallStatus === "healthy"  ? "bg-sse-sem-green-fg" :
            health.overallStatus === "degraded" ? "bg-sse-sem-amber-fg" : "bg-sse-sem-red-fg",
          )}
          style={{ width: `${health.score}%` }}
        />
      </div>

      {/* Metric cards */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-sse-muted mb-2">
          Métricas de plataforma
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {health.metrics.map((m) => <MetricCard key={m.id} metric={m} />)}
        </div>
      </div>

      {/* Alerts */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sse-muted">
            Alertas activas ({health.alerts.length})
          </p>
          {health.alerts.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllAlerts((v) => !v)}
            >
              {showAllAlerts ? "Ver menos" : `Ver todas (${health.alerts.length})`}
            </Button>
          )}
        </div>
        {health.alerts.length === 0 ? (
          <div className="rounded-md border border-sse-sem-green-border bg-sse-sem-green-bg px-4 py-3 text-center">
            <p className="text-[13px] font-medium text-sse-sem-green-fg">
              Sin alertas activas — todo en orden
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleAlerts.map((a) => <AlertRow key={a.id} alert={a} />)}
          </div>
        )}
      </div>
    </div>
  );
}
