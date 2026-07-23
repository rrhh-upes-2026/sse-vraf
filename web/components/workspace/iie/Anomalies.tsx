"use client";

import { useState } from "react";
import { useIIEAnomalies } from "@/hooks/useIIE";
import type { IIEAnomalyType, IIERiskLevel } from "@/types/iie";

const ANOMALY_COLOR: Record<string, string> = {
  caida_productividad:      "bg-red-400",
  disminucion_cumplimiento: "bg-orange-400",
  cambio_abrupto:           "bg-yellow-400",
  patron_inusual:           "bg-purple-400",
  sobrecarga_operativa:     "bg-blue-400",
  retraso_recurrente:       "bg-pink-400",
  acumulacion_riesgos:      "bg-red-600",
};
const SEVERITY_CHIP: Record<string, string> = {
  bajo:    "bg-emerald-100 text-emerald-800",
  medio:   "bg-yellow-100 text-yellow-800",
  alto:    "bg-orange-100 text-orange-800",
  critico: "bg-red-100 text-red-800",
};
const SEVERITY_LABEL: Record<string, string> = {
  bajo: "Bajo", medio: "Medio", alto: "Alto", critico: "Crítico",
};

const TYPE_OPTIONS: { value: IIEAnomalyType | ""; label: string }[] = [
  { value: "",                          label: "Todos los tipos" },
  { value: "caida_productividad",       label: "Caída productividad" },
  { value: "disminucion_cumplimiento",  label: "Disminución cumplimiento" },
  { value: "cambio_abrupto",            label: "Cambio abrupto" },
  { value: "patron_inusual",            label: "Patrón inusual" },
  { value: "sobrecarga_operativa",      label: "Sobrecarga operativa" },
  { value: "retraso_recurrente",        label: "Retraso recurrente" },
  { value: "acumulacion_riesgos",       label: "Acumulación de riesgos" },
];
const SEVERITY_OPTIONS: { value: IIERiskLevel | ""; label: string }[] = [
  { value: "",        label: "Todas las severidades" },
  { value: "critico", label: "Crítico" },
  { value: "alto",    label: "Alto" },
  { value: "medio",   label: "Medio" },
  { value: "bajo",    label: "Bajo" },
];

interface Props { wsId: string }

export function IIEAnomalies({ wsId: _wsId }: Props) {
  const [type,     setType]     = useState<IIEAnomalyType | "">("");
  const [severity, setSeverity] = useState<IIERiskLevel | "">("");
  const [onlyActive, setOnlyActive] = useState(false);

  const { data: list = [], isLoading } = useIIEAnomalies({
    type:     type     || undefined,
    severity: severity || undefined,
    isActive: onlyActive ? true : undefined,
    limit: 50,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 rounded-lg border border-sse-border bg-white px-4 py-3">
        <select value={type} onChange={(e) => setType(e.target.value as IIEAnomalyType | "")}
          className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none">
          {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={severity} onChange={(e) => setSeverity(e.target.value as IIERiskLevel | "")}
          className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none">
          {SEVERITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)}
            className="h-3.5 w-3.5 rounded accent-[#6D28D9]" />
          <span className="text-[12px] text-sse-ink">Solo activas</span>
        </label>
        <span className="ml-auto self-center text-[11px] text-sse-muted">{list.length} anomalía{list.length !== 1 ? "s" : ""}</span>
      </div>

      {isLoading && <p className="py-10 text-center text-[13px] text-sse-muted">Analizando anomalías…</p>}
      {!isLoading && list.length === 0 && (
        <div className="rounded-lg border border-sse-border bg-white py-10 text-center">
          <p className="text-[13px] text-emerald-600">Sin anomalías detectadas para los filtros seleccionados.</p>
        </div>
      )}

      <div className="space-y-2">
        {list.map((a) => {
          const deviation = a.deviationPct;
          const isDropping = a.observedValue < a.expectedValue;
          return (
            <div key={a.id} className="rounded-lg border border-sse-border bg-white px-4 py-3">
              <div className="flex items-start gap-3">
                <div className={`mt-1.5 h-3 w-3 rounded-full shrink-0 ${ANOMALY_COLOR[a.type] ?? "bg-sse-muted"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${SEVERITY_CHIP[a.severity] ?? ""}`}>
                      {SEVERITY_LABEL[a.severity] ?? a.severity}
                    </span>
                    {a.isActive && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700">Activa</span>
                    )}
                    <span className="text-[10px] text-sse-muted capitalize">{a.type.replace(/_/g, " ")}</span>
                  </div>
                  <p className="text-[13px] font-medium text-sse-ink">{a.entityLabel}</p>
                  <p className="text-[11px] text-sse-muted capitalize">{a.entityType.replace(/_/g, " ")} · {a.metric.replace(/_/g, " ")}</p>
                  <p className="text-[11px] text-sse-muted mt-1">{a.description}</p>
                </div>

                <div className="shrink-0 text-right space-y-1">
                  {/* Deviation bar */}
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-[10px] text-sse-muted">{isDropping ? "↓" : "↑"} {deviation.toFixed(1)}%</span>
                  </div>
                  <p className="text-[12px] font-bold tabular-nums text-sse-ink">
                    <span className="text-red-600">{a.observedValue}%</span>
                    <span className="text-sse-muted text-[11px] mx-1">vs</span>
                    <span className="text-sse-muted">{a.expectedValue}%</span>
                  </p>
                  <p className="text-[10px] text-sse-muted">{a.period}</p>
                </div>
              </div>

              {/* Deviation visual */}
              <div className="mt-2.5 ml-6 relative h-1.5 rounded-full bg-sse-border overflow-hidden">
                <div className="absolute inset-y-0 left-0 rounded-full bg-sse-border" style={{ width: "100%" }} />
                <div
                  className={`absolute inset-y-0 rounded-full ${isDropping ? "bg-red-400" : "bg-emerald-400"}`}
                  style={{ width: `${Math.min(Math.abs(deviation), 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
