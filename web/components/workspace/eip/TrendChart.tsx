"use client";

import { useState } from "react";
import { useEIPTrends } from "@/hooks/useEIP";
import type { EIPTrendSeries } from "@/types/eip";

const SERIES_COLOR: Record<string, string> = {
  cumplimiento:  "#1D4ED8",
  ejecucion:     "#059669",
  documentacion: "#7C3AED",
  mejora:        "#EA580C",
};

const SERIES_LABEL: Record<string, string> = {
  cumplimiento:  "Cumplimiento",
  ejecucion:     "Ejecución",
  documentacion: "Documentación",
  mejora:        "Mejora",
};

function Sparkline({ series, width, height }: { series: EIPTrendSeries; width: number; height: number }) {
  const pts = series.points;
  if (pts.length < 2) return null;

  const minV = Math.min(...pts.map((p) => p.value));
  const maxV = Math.max(...pts.map((p) => p.value));
  const range = maxV - minV || 1;
  const pad = 8;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const x = (i: number) => pad + (i / (pts.length - 1)) * w;
  const y = (v: number) => pad + h - ((v - minV) / range) * h;

  const polyline = pts.map((p, i) => `${x(i)},${y(p.value)}`).join(" ");
  const areaPath =
    `M ${x(0)},${y(pts[0].value)} ` +
    pts.slice(1).map((p, i) => `L ${x(i + 1)},${y(p.value)}`).join(" ") +
    ` L ${x(pts.length - 1)},${height} L ${x(0)},${height} Z`;

  const color = SERIES_COLOR[series.key] ?? "#6B7280";
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  const delta = last.value - prev.value;

  return (
    <div className="rounded-lg border border-sse-border bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[12px] font-medium text-sse-ink">{SERIES_LABEL[series.key] ?? series.key}</p>
        <div className="flex items-center gap-1.5">
          <p className="text-[20px] font-bold tabular-nums" style={{ color }}>{last.value}%</p>
          <span className={`text-[11px] font-medium ${delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {delta >= 0 ? "↑" : "↓"}{Math.abs(delta).toFixed(1)}
          </span>
        </div>
      </div>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
        <defs>
          <linearGradient id={`grad-${series.key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((v) => (
          <line
            key={v}
            x1={pad}
            y1={y(v)}
            x2={width - pad}
            y2={y(v)}
            stroke="#E5E7EB"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
        ))}
        {/* Area fill */}
        <path d={areaPath} fill={`url(#grad-${series.key})`} />
        {/* Line */}
        <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {/* Last point dot */}
        <circle cx={x(pts.length - 1)} cy={y(last.value)} r="4" fill={color} />
      </svg>
      {/* Labels */}
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-sse-muted">{pts[0].label}</span>
        <span className="text-[10px] text-sse-muted">{last.label}</span>
      </div>
    </div>
  );
}

export function TrendChart() {
  const [months, setMonths] = useState(6);
  const { data: series = [], isLoading } = useEIPTrends({ months });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <p className="text-[13px] text-sse-muted mr-auto">Evolución de indicadores clave en el tiempo</p>
        <div className="flex rounded-lg border border-sse-border overflow-hidden text-[12px]">
          {[3, 6, 12].map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`px-3 py-1.5 transition-colors ${
                months === m
                  ? "bg-[#1D4ED8] text-white font-medium"
                  : "bg-white text-sse-muted hover:bg-sse-surface"
              }`}
            >
              {m}M
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-[13px] text-sse-muted text-center py-8">Cargando tendencias...</p>
      ) : series.length === 0 ? (
        <p className="text-[13px] text-sse-muted text-center py-8">Sin datos de tendencia disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {series.map((s) => (
            <Sparkline key={s.key} series={s} width={300} height={100} />
          ))}
        </div>
      )}
    </div>
  );
}
