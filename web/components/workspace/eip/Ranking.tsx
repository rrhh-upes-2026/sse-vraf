"use client";

import { useState } from "react";
import { useEIPRanking } from "@/hooks/useEIP";
import type { EIPRankingType } from "@/types/eip";

const SEMAFORO_BG: Record<string, string> = {
  Verde:    "bg-emerald-500",
  Amarillo: "bg-yellow-400",
  Naranja:  "bg-orange-400",
  Rojo:     "bg-red-500",
};

const SEMAFORO_TEXT: Record<string, string> = {
  Verde:    "text-emerald-700",
  Amarillo: "text-yellow-700",
  Naranja:  "text-orange-700",
  Rojo:     "text-red-700",
};

const RANK_MEDAL: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

const TYPES: { key: EIPRankingType; label: string }[] = [
  { key: "unidad",        label: "Unidades" },
  { key: "proceso",       label: "Procesos" },
  { key: "indicador",     label: "Indicadores" },
  { key: "responsable",   label: "Responsables" },
];

export function Ranking() {
  const [type, setType] = useState<EIPRankingType>("unidad");
  const { data: items = [], isLoading } = useEIPRanking(type);

  return (
    <div className="space-y-4">
      {/* Type selector */}
      <div className="flex rounded-lg border border-sse-border overflow-hidden text-[12px]">
        {TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => setType(t.key)}
            className={`flex-1 px-3 py-1.5 transition-colors ${
              type === t.key
                ? "bg-[#1D4ED8] text-white font-medium"
                : "bg-white text-sse-muted hover:bg-sse-surface"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <p className="text-[13px] text-sse-muted text-center py-8">Cargando ranking...</p>
      ) : items.length === 0 ? (
        <p className="text-[13px] text-sse-muted text-center py-8">Sin datos de ranking disponibles.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border border-sse-border bg-white px-4 py-3">
              {/* Rank */}
              <div className="w-8 text-center">
                {item.rank <= 3 ? (
                  <span className="text-[16px]">{RANK_MEDAL[item.rank]}</span>
                ) : (
                  <span className="text-[13px] font-bold tabular-nums text-sse-muted">{item.rank}</span>
                )}
              </div>

              {/* Label + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[13px] font-medium text-sse-ink truncate">{item.label}</span>
                  <span className={`text-[13px] font-bold tabular-nums shrink-0 ${SEMAFORO_TEXT[item.semaforo] ?? "text-sse-ink"}`}>
                    {item.score}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-sse-border">
                  <div
                    className={`h-2 rounded-full transition-all ${SEMAFORO_BG[item.semaforo] ?? "bg-sse-muted"}`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
                {item.description && (
                  <p className="text-[11px] text-sse-muted mt-1">{item.description}</p>
                )}
              </div>

              {/* Delta */}
              {item.delta !== undefined && item.delta !== null && (
                <div className={`shrink-0 text-[12px] font-medium ${item.delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {item.delta >= 0 ? "↑" : "↓"}{Math.abs(item.delta)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
