"use client";

import { useState } from "react";
import { useEIPHeatMap } from "@/hooks/useEIP";
import type { EIPHeatCell, EIPHeatMapType } from "@/types/eip";

const HEAT_BG: Record<string, string> = {
  Verde:    "bg-emerald-400",
  Amarillo: "bg-yellow-300",
  Naranja:  "bg-orange-400",
  Rojo:     "bg-red-400",
};

const HEAT_BORDER: Record<string, string> = {
  Verde:    "border-emerald-500",
  Amarillo: "border-yellow-400",
  Naranja:  "border-orange-500",
  Rojo:     "border-red-500",
};

function HeatCell({ cell }: { cell: EIPHeatCell }) {
  return (
    <div
      className={`rounded-lg border p-3 ${HEAT_BG[cell.semaforo] ?? "bg-sse-border"} ${HEAT_BORDER[cell.semaforo] ?? ""}`}
      title={`${cell.label}: ${cell.score}%`}
    >
      <p className="text-[10px] text-white font-medium leading-tight truncate mb-1">{cell.label}</p>
      <p className="text-[18px] text-white font-bold tabular-nums leading-none">{cell.score}%</p>
      <p className="text-[9px] text-white/70 mt-0.5 capitalize">{cell.semaforo}</p>
    </div>
  );
}

export function HeatMap() {
  const [type, setType] = useState<EIPHeatMapType>("proceso");
  const { data: cells = [], isLoading } = useEIPHeatMap(type);

  const verde    = cells.filter((c) => c.semaforo === "Verde").length;
  const amarillo = cells.filter((c) => c.semaforo === "Amarillo").length;
  const naranja  = cells.filter((c) => c.semaforo === "Naranja").length;
  const rojo     = cells.filter((c) => c.semaforo === "Rojo").length;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg border border-sse-border overflow-hidden text-[12px]">
          {(["proceso", "unidad"] as EIPHeatMapType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-1.5 capitalize transition-colors ${
                type === t
                  ? "bg-[#1D4ED8] text-white font-medium"
                  : "bg-white text-sse-muted hover:bg-sse-surface"
              }`}
            >
              {t === "proceso" ? "Procesos" : "Unidades"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-sse-muted ml-auto">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-400 inline-block" />Verde ({verde})</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-yellow-300 inline-block" />Amarillo ({amarillo})</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-orange-400 inline-block" />Naranja ({naranja})</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-red-400 inline-block" />Rojo ({rojo})</span>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <p className="text-[13px] text-sse-muted text-center py-8">Cargando mapa de calor...</p>
      ) : cells.length === 0 ? (
        <p className="text-[13px] text-sse-muted text-center py-8">Sin datos disponibles.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {cells.map((cell) => (
            <HeatCell key={cell.id} cell={cell} />
          ))}
        </div>
      )}
    </div>
  );
}
