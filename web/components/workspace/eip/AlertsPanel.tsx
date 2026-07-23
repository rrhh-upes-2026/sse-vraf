"use client";

import { useState } from "react";
import { useEIPAlerts } from "@/hooks/useEIP";
import type { EIPAlert, EIPAlertSeverity } from "@/types/eip";

const SEV_COLOR: Record<string, string> = {
  critica:     "border-l-red-500 bg-red-50 dark:bg-red-950/20",
  alta:        "border-l-orange-400 bg-orange-50 dark:bg-orange-950/20",
  media:       "border-l-yellow-400 bg-yellow-50 dark:bg-yellow-950/20",
  informativa: "border-l-blue-400 bg-blue-50 dark:bg-blue-950/20",
};

const SEV_CHIP: Record<string, string> = {
  critica:     "bg-red-100 text-red-700",
  alta:        "bg-orange-100 text-orange-700",
  media:       "bg-yellow-100 text-yellow-700",
  informativa: "bg-blue-100 text-blue-700",
};

const SEV_LABELS: { key: EIPAlertSeverity | "all"; label: string }[] = [
  { key: "all",        label: "Todas" },
  { key: "critica",    label: "Crítica" },
  { key: "alta",       label: "Alta" },
  { key: "media",      label: "Media" },
  { key: "informativa",label: "Informativa" },
];

function AlertCard({ alert }: { alert: EIPAlert }) {
  return (
    <div className={`rounded border-l-4 border border-sse-border px-4 py-3 ${SEV_COLOR[alert.severity] ?? ""}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${SEV_CHIP[alert.severity] ?? ""}`}>
          {alert.severity}
        </span>
        {alert.module && (
          <span className="text-[10px] text-sse-muted uppercase tracking-wide">{alert.module}</span>
        )}
        {alert.entityId && (
          <span className="ml-auto text-[10px] text-sse-muted font-mono">{alert.entityId}</span>
        )}
      </div>
      <p className="text-[13px] font-medium text-sse-ink">{alert.title}</p>
      <p className="text-[12px] text-sse-muted mt-0.5">{alert.description}</p>
      {alert.actionLabel && (
        <p className="text-[11px] text-[#1D4ED8] mt-1.5 font-medium">{alert.actionLabel} →</p>
      )}
    </div>
  );
}

export function AlertsPanel() {
  const [severity, setSeverity] = useState<EIPAlertSeverity | undefined>(undefined);
  const { data: alerts = [], isLoading } = useEIPAlerts(severity);

  const counts = SEV_LABELS.reduce<Record<string, number>>((acc, s) => {
    acc[s.key] = s.key === "all"
      ? alerts.length
      : alerts.filter((a) => a.severity === s.key).length;
    return acc;
  }, {});

  const filtered = severity ? alerts.filter((a) => a.severity === severity) : alerts;

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {SEV_LABELS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSeverity(s.key === "all" ? undefined : s.key as EIPAlertSeverity)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] border transition-colors ${
              (s.key === "all" && !severity) || s.key === severity
                ? "bg-[#1D4ED8] text-white border-[#1D4ED8] font-medium"
                : "bg-white text-sse-muted border-sse-border hover:bg-sse-surface"
            }`}
          >
            {s.label}
            <span className="text-[10px] opacity-75">({counts[s.key] ?? 0})</span>
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <p className="text-[13px] text-sse-muted text-center py-8">Cargando alertas...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-sse-border bg-white py-8 text-center">
          <p className="text-[13px] text-emerald-600 font-medium">Sin alertas activas</p>
          <p className="text-[12px] text-sse-muted mt-1">Todos los indicadores dentro de parámetros normales.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}
