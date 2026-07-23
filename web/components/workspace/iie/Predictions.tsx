"use client";

import { useState } from "react";
import { useIIEPredictions } from "@/hooks/useIIE";
import type { IIEEntityType, IIEPredictionHorizon, IIEPredictionPoint } from "@/types/iie";

const TREND_ICON: Record<string, string> = {
  creciente:  "M5 17l7-7 7 7",
  decreciente: "M19 7l-7 7-7-7",
  estable:    "M5 12h14",
  volatil:    "M5 12c2-4 4 4 6 0s4-4 6 0",
};
const TREND_COLOR: Record<string, string> = {
  creciente:  "text-emerald-600",
  decreciente: "text-red-600",
  estable:    "text-yellow-600",
  volatil:    "text-orange-600",
};
const RISK_COLOR: Record<string, string> = {
  bajo: "text-emerald-700", medio: "text-yellow-700", alto: "text-orange-700", critico: "text-red-700",
};
const RISK_BG: Record<string, string> = {
  bajo: "bg-emerald-100", medio: "bg-yellow-100", alto: "bg-orange-100", critico: "bg-red-100",
};
const RISK_LABEL: Record<string, string> = {
  bajo: "Bajo", medio: "Medio", alto: "Alto", critico: "Crítico",
};

const ENTITY_OPTIONS: { value: IIEEntityType | ""; label: string }[] = [
  { value: "", label: "Todas las entidades" },
  { value: "unidad", label: "Unidad" },
  { value: "proceso", label: "Proceso" },
  { value: "indicador", label: "Indicador" },
];
const HORIZON_OPTIONS: { value: IIEPredictionHorizon | ""; label: string }[] = [
  { value: "", label: "Todos los horizontes" },
  { value: "trimestral", label: "Trimestral" },
  { value: "semestral", label: "Semestral" },
  { value: "anual", label: "Anual" },
];

function PredictionChart({ points }: { points: IIEPredictionPoint[] }) {
  if (points.length < 2) return null;

  const W = 480, H = 120, PAD = { t: 10, b: 24, l: 30, r: 10 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;

  const allVals = points.flatMap((p) => [p.lowerBound, p.upperBound, p.predicted]);
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const range = maxV - minV || 1;

  const xScale = (i: number) => PAD.l + (i / (points.length - 1)) * iW;
  const yScale = (v: number) => PAD.t + iH - ((v - minV) / range) * iH;

  const historicalPts = points.filter((p) => p.isHistorical);
  const forecastPts   = points.filter((p) => !p.isHistorical);
  const allPts        = points;

  const toPolyline = (pts: typeof points, key: keyof IIEPredictionPoint) =>
    pts.map((p, i) => {
      const gi = allPts.indexOf(p);
      return `${xScale(gi)},${yScale(p[key] as number)}`;
    }).join(" ");

  const bandPath = (() => {
    const fwd = forecastPts.map((p, i) => {
      const gi = allPts.indexOf(p);
      return `${xScale(gi)},${yScale(p.upperBound)}`;
    });
    const bwd = [...forecastPts].reverse().map((p) => {
      const gi = allPts.indexOf(p);
      return `${xScale(gi)},${yScale(p.lowerBound)}`;
    });
    if (!fwd.length) return "";
    return `M${fwd.join("L")}L${bwd.join("L")}Z`;
  })();

  const splitX = historicalPts.length > 0 ? xScale(historicalPts.length - 1) : PAD.l;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[280px]" style={{ height: H }}>
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = PAD.t + iH * (1 - t);
          return (
            <g key={t}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#E5E7EB" strokeWidth={0.5} />
              <text x={PAD.l - 3} y={y + 4} fontSize={7} textAnchor="end" fill="#9CA3AF">
                {Math.round(minV + t * range)}
              </text>
            </g>
          );
        })}

        {/* Forecast zone divider */}
        {splitX > PAD.l && (
          <line x1={splitX} y1={PAD.t} x2={splitX} y2={PAD.t + iH} stroke="#6D28D9" strokeWidth={0.5} strokeDasharray="3,2" />
        )}

        {/* Confidence band */}
        {bandPath && <path d={bandPath} fill="#6D28D9" fillOpacity={0.08} />}

        {/* Upper / lower bounds (forecast) */}
        {forecastPts.length > 1 && (
          <>
            <polyline points={toPolyline(forecastPts, "upperBound")} fill="none" stroke="#6D28D9" strokeWidth={0.8} strokeDasharray="2,2" strokeOpacity={0.5} />
            <polyline points={toPolyline(forecastPts, "lowerBound")} fill="none" stroke="#6D28D9" strokeWidth={0.8} strokeDasharray="2,2" strokeOpacity={0.5} />
          </>
        )}

        {/* Historical line */}
        {historicalPts.length > 1 && (
          <polyline points={toPolyline(historicalPts, "predicted")} fill="none" stroke="#6D28D9" strokeWidth={1.8} strokeLinejoin="round" />
        )}

        {/* Forecast line */}
        {forecastPts.length > 1 && (
          <polyline points={toPolyline(forecastPts, "predicted")} fill="none" stroke="#6D28D9" strokeWidth={1.8} strokeDasharray="4,3" strokeLinejoin="round" />
        )}

        {/* Points */}
        {allPts.map((p, i) => (
          <circle key={i} cx={xScale(i)} cy={yScale(p.predicted)} r={2.5}
            fill={p.isHistorical ? "#6D28D9" : "white"} stroke="#6D28D9" strokeWidth={1.5} />
        ))}

        {/* X labels */}
        {allPts.map((p, i) => (
          <text key={i} x={xScale(i)} y={H - 6} textAnchor="middle" fontSize={7} fill="#9CA3AF">
            {p.label.slice(0, 6)}
          </text>
        ))}

        {/* Legend */}
        <g transform={`translate(${W - PAD.r - 100}, ${PAD.t})`}>
          <line x1={0} y1={5} x2={12} y2={5} stroke="#6D28D9" strokeWidth={1.5} />
          <text x={15} y={8} fontSize={7} fill="#6B7280">Histórico</text>
          <line x1={0} y1={16} x2={12} y2={16} stroke="#6D28D9" strokeWidth={1.5} strokeDasharray="3,2" />
          <text x={15} y={19} fontSize={7} fill="#6B7280">Pronóstico</text>
        </g>
      </svg>
    </div>
  );
}

interface Props { wsId: string }

export function IIEPredictions({ wsId: _wsId }: Props) {
  const [entityType, setEntityType] = useState<IIEEntityType | "">("");
  const [horizon,    setHorizon]    = useState<IIEPredictionHorizon | "">("");
  const [expanded,   setExpanded]   = useState<string | null>(null);

  const { data: list = [], isLoading } = useIIEPredictions({
    entityType: entityType || undefined,
    horizon:    horizon    || undefined,
    limit: 30,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 rounded-lg border border-sse-border bg-white px-4 py-3">
        <select value={entityType} onChange={(e) => setEntityType(e.target.value as IIEEntityType | "")}
          className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none">
          {ENTITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={horizon} onChange={(e) => setHorizon(e.target.value as IIEPredictionHorizon | "")}
          className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none">
          {HORIZON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="ml-auto self-center text-[11px] text-sse-muted">{list.length} predicción{list.length !== 1 ? "es" : ""}</span>
      </div>

      {isLoading && <p className="py-10 text-center text-[13px] text-sse-muted">Calculando predicciones…</p>}
      {!isLoading && list.length === 0 && (
        <div className="rounded-lg border border-sse-border bg-white py-10 text-center">
          <p className="text-[13px] text-sse-muted">Sin predicciones disponibles.</p>
        </div>
      )}

      <div className="space-y-2">
        {list.map((pred) => {
          const open = expanded === pred.id;
          return (
            <div key={pred.id} className="rounded-lg border border-sse-border bg-white">
              <button
                className="w-full flex items-start gap-4 px-4 py-3 text-left"
                onClick={() => setExpanded(open ? null : pred.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${RISK_BG[pred.expectedRisk] ?? ""} ${RISK_COLOR[pred.expectedRisk] ?? ""}`}>
                      {RISK_LABEL[pred.expectedRisk] ?? pred.expectedRisk}
                    </span>
                    <span className="text-[10px] text-sse-muted capitalize">{pred.horizon} · {pred.entityType.replace(/_/g, " ")}</span>
                    <svg className={`h-3.5 w-3.5 ${TREND_COLOR[pred.trend] ?? ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d={TREND_ICON[pred.trend] ?? ""} />
                    </svg>
                    <span className={`text-[10px] font-medium capitalize ${TREND_COLOR[pred.trend] ?? ""}`}>{pred.trend}</span>
                  </div>
                  <p className="text-[13px] font-medium text-sse-ink">{pred.entityLabel}</p>
                  <p className="text-[11px] text-sse-muted">{pred.metric.replace(/_/g, " ")}</p>
                </div>

                <div className="shrink-0 text-right mr-2 space-y-0.5">
                  <p className="text-[11px] text-sse-muted">Actual → Pronóstico</p>
                  <p className="text-[14px] font-bold tabular-nums text-sse-ink">
                    <span className="text-sse-muted text-[12px]">{pred.currentValue}%</span>
                    <span className="mx-1 text-sse-muted">→</span>
                    <span className="text-[#6D28D9]">{pred.predictedValue}%</span>
                  </p>
                  <p className="text-[10px] text-sse-muted">P.cumplimiento: <span className="font-medium text-sse-ink tabular-nums">{pred.probabilityOfCompliance}%</span></p>
                </div>

                <svg className={`mt-1 h-4 w-4 shrink-0 text-sse-muted transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {open && (
                <div className="border-t border-sse-border px-4 py-3 space-y-3">
                  <PredictionChart points={pred.points} />

                  {pred.assumptions.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-sse-muted mb-1.5">Supuestos del modelo</p>
                      <ul className="space-y-0.5 pl-3">
                        {pred.assumptions.map((a, i) => (
                          <li key={i} className="text-[11px] text-sse-muted list-disc list-inside">{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-[10px] text-sse-muted">
                    <span>Modelo: <span className="font-medium text-sse-ink">{pred.model}</span></span>
                    <span>Confianza: <span className="font-medium tabular-nums text-sse-ink">{pred.confidenceScore}%</span></span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
