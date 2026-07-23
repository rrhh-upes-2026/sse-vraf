"use client";

import { useEIPScorecard } from "@/hooks/useEIP";
import type { EIPScorecardItem, BSCPerspective } from "@/types/eip";

const PERSPECTIVE_LABEL: Record<BSCPerspective, string> = {
  financiera:  "Financiera",
  procesos:    "Procesos Internos",
  aprendizaje: "Aprendizaje y Crecimiento",
  clientes:    "Clientes / Partes Interesadas",
};

const PERSPECTIVE_COLOR: Record<BSCPerspective, string> = {
  financiera:  "bg-blue-600",
  procesos:    "bg-emerald-600",
  aprendizaje: "bg-purple-600",
  clientes:    "bg-orange-500",
};

const SEMAFORO_CHIP: Record<string, string> = {
  Verde:    "bg-emerald-100 text-emerald-800",
  Amarillo: "bg-yellow-100 text-yellow-800",
  Naranja:  "bg-orange-100 text-orange-800",
  Rojo:     "bg-red-100 text-red-800",
};

function ScorecardRow({ item }: { item: EIPScorecardItem }) {
  const progress = item.target > 0 ? Math.min(100, Math.round(((item.actual ?? 0) / item.target) * 100)) : 0;
  return (
    <tr className="border-b border-sse-border last:border-0 hover:bg-sse-surface/40">
      <td className="px-4 py-2.5">
        <p className="text-[13px] text-sse-ink">{item.objective}</p>
        <p className="text-[11px] text-sse-muted">{item.indicator}</p>
      </td>
      <td className="px-4 py-2.5 text-right tabular-nums text-[13px] text-sse-muted">
        {item.target}{item.unit === "%" ? "%" : ` ${item.unit}`}
      </td>
      <td className="px-4 py-2.5 text-right tabular-nums text-[13px] font-medium text-sse-ink">
        {item.actual !== null ? `${item.actual}${item.unit === "%" ? "%" : ""}` : "N/D"}
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-sse-border">
            <div
              className="h-1.5 rounded-full bg-[#1D4ED8] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[11px] text-sse-muted tabular-nums w-8 text-right">{progress}%</span>
        </div>
      </td>
      <td className="px-4 py-2.5">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${SEMAFORO_CHIP[item.semaforo] ?? ""}`}>
          {item.semaforo}
        </span>
      </td>
    </tr>
  );
}

const PERSPECTIVES: BSCPerspective[] = ["financiera", "procesos", "aprendizaje", "clientes"];

export function Scorecard() {
  const { data: scorecard, isLoading } = useEIPScorecard();

  if (isLoading) {
    return <p className="text-[13px] text-sse-muted text-center py-8">Cargando scorecard...</p>;
  }

  if (!scorecard) {
    return <p className="text-[13px] text-sse-muted text-center py-8">Sin datos disponibles.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Overall BSC score */}
      <div className="flex items-center gap-4 rounded-lg border border-sse-border bg-white px-5 py-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-sse-muted">Puntaje BSC Global</p>
          <p className="text-3xl font-bold text-[#1D4ED8] tabular-nums">{scorecard.overallScore}</p>
        </div>
        <div className="flex-1 h-2 rounded-full bg-sse-border">
          <div className="h-2 rounded-full bg-[#1D4ED8]" style={{ width: `${scorecard.overallScore}%` }} />
        </div>
        <p className="text-[12px] text-sse-muted">{scorecard.overallScore}/100</p>
      </div>

      {/* Perspective tables */}
      {PERSPECTIVES.map((persp) => {
        const items = scorecard.perspectives[persp] ?? [];
        const avgScore = items.length > 0
          ? Math.round(items.reduce((s, i) => s + i.score, 0) / items.length)
          : 0;
        return (
          <div key={persp} className="rounded-lg border border-sse-border bg-white overflow-hidden">
            <div className={`flex items-center gap-3 px-4 py-2.5 ${PERSPECTIVE_COLOR[persp]}`}>
              <p className="text-[13px] font-medium text-white">{PERSPECTIVE_LABEL[persp]}</p>
              <span className="ml-auto text-[12px] text-white/80">{avgScore}%</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-sse-border bg-sse-surface">
                    <th className="px-4 py-2 text-left font-medium text-sse-muted">Objetivo / Indicador</th>
                    <th className="px-4 py-2 text-right font-medium text-sse-muted">Meta</th>
                    <th className="px-4 py-2 text-right font-medium text-sse-muted">Real</th>
                    <th className="px-4 py-2 font-medium text-sse-muted">Progreso</th>
                    <th className="px-4 py-2 font-medium text-sse-muted">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-3 text-center text-[12px] text-sse-muted">Sin indicadores en esta perspectiva.</td>
                    </tr>
                  ) : (
                    items.map((item) => <ScorecardRow key={item.id} item={item} />)
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
