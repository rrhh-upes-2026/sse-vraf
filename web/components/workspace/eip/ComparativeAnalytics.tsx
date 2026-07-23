"use client";

import { useState } from "react";
import { useEIPComparativo } from "@/hooks/useEIP";
import type { EIPComparativeType } from "@/types/eip";

const COMP_TYPES: { key: EIPComparativeType; label: string }[] = [
  { key: "mes-vs-mes",              label: "Mes vs Mes" },
  { key: "año-vs-año",              label: "Año vs Año" },
  { key: "unidad-vs-unidad",        label: "Unidad vs Unidad" },
  { key: "proceso-vs-proceso",      label: "Proceso vs Proceso" },
  { key: "indicador-vs-indicador",  label: "Indicador vs Indicador" },
];

const TREND_ICON: Record<string, string> = {
  up:     "↑",
  down:   "↓",
  stable: "→",
};

const TREND_COLOR: Record<string, string> = {
  up:     "text-emerald-600",
  down:   "text-red-500",
  stable: "text-sse-muted",
};

export function ComparativeAnalytics() {
  const [type, setType] = useState<EIPComparativeType>("mes-vs-mes");
  const { data: report, isLoading } = useEIPComparativo(type);

  return (
    <div className="space-y-4">
      {/* Type tabs */}
      <div className="flex flex-wrap gap-2">
        {COMP_TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => setType(t.key)}
            className={`rounded-full px-3 py-1.5 text-[12px] border transition-colors ${
              type === t.key
                ? "bg-[#1D4ED8] text-white border-[#1D4ED8] font-medium"
                : "bg-white text-sse-muted border-sse-border hover:bg-sse-surface"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-[13px] text-sse-muted text-center py-8">Cargando análisis comparativo...</p>
      ) : !report ? (
        <p className="text-[13px] text-sse-muted text-center py-8">Sin datos comparativos disponibles.</p>
      ) : (
        <div className="space-y-4">
          {/* Header summary */}
          <div className="rounded-lg border border-sse-border bg-white p-5">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-[11px] text-sse-muted uppercase tracking-wide">{report.baseLabel}</p>
                <p className="text-3xl font-bold tabular-nums text-sse-ink">{report.baseScore}%</p>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <span className={`text-2xl font-bold ${report.delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {report.delta >= 0 ? "↑" : "↓"} {Math.abs(report.delta).toFixed(1)}pp
                </span>
                <div className="h-px w-full bg-sse-border" />
              </div>
              <div className="text-center">
                <p className="text-[11px] text-sse-muted uppercase tracking-wide">{report.compareLabel}</p>
                <p className="text-3xl font-bold tabular-nums text-sse-ink">{report.compareScore}%</p>
              </div>
            </div>
            {report.summary && (
              <p className="text-[12px] text-sse-muted mt-3 border-t border-sse-border pt-3">{report.summary}</p>
            )}
          </div>

          {/* Points table */}
          {report.points.length > 0 && (
            <div className="rounded-lg border border-sse-border bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-sse-border bg-sse-surface">
                      <th className="px-4 py-2.5 text-left font-medium text-sse-muted">Elemento</th>
                      <th className="px-4 py-2.5 text-right font-medium text-sse-muted">{report.baseLabel}</th>
                      <th className="px-4 py-2.5 text-right font-medium text-sse-muted">{report.compareLabel}</th>
                      <th className="px-4 py-2.5 text-right font-medium text-sse-muted">Δ</th>
                      <th className="px-4 py-2.5 font-medium text-sse-muted">Tendencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.points.map((pt) => (
                      <tr key={pt.label} className="border-b border-sse-border last:border-0 hover:bg-sse-surface/50">
                        <td className="px-4 py-2.5 font-medium text-sse-ink">{pt.label}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-sse-muted">{pt.baseValue}%</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-sse-ink">{pt.compareValue}%</td>
                        <td className={`px-4 py-2.5 text-right tabular-nums font-medium ${pt.delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {pt.delta >= 0 ? "+" : ""}{pt.delta.toFixed(1)}
                        </td>
                        <td className={`px-4 py-2.5 font-medium ${TREND_COLOR[pt.trend] ?? "text-sse-muted"}`}>
                          {TREND_ICON[pt.trend] ?? "→"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
