"use client";

import { useState } from "react";
import { useCPEBrechas } from "@/hooks/useCPE";
import type { CPEBrecha } from "@/types/cpe";

const TIPO_LABEL: Record<string, string> = {
  actividad_no_ejecutada: "Actividad no ejecutada",
  evidencia_faltante:     "Evidencia faltante",
  evidencia_rechazada:    "Evidencia rechazada",
  indicador_sin_datos:    "Indicador sin datos",
  proceso_sin_plan:       "Proceso sin plan",
};

const SEV_CHIP: Record<string, string> = {
  alta:  "bg-red-100 text-red-700",
  media: "bg-yellow-100 text-yellow-700",
  baja:  "bg-blue-100 text-blue-700",
};

const SEV_BORDER: Record<string, string> = {
  alta:  "border-l-red-400",
  media: "border-l-yellow-400",
  baja:  "border-l-blue-400",
};

interface Props {
  wsId: string;
}

export function BrechasPanel({ wsId: _wsId }: Props) {
  const year = new Date().getFullYear();
  const { data: brechas = [], isLoading } = useCPEBrechas(year);

  const [filtroSev, setFiltroSev] = useState<CPEBrecha["severidad"] | "">("");
  const [filtroTipo, setFiltroTipo] = useState<CPEBrecha["tipo"] | "">("");

  const tipos = Array.from(new Set(brechas.map((b) => b.tipo)));

  const filtered = brechas.filter((b) => {
    if (filtroSev && b.severidad !== filtroSev) return false;
    if (filtroTipo && b.tipo !== filtroTipo) return false;
    return true;
  });

  const counts = {
    alta:  brechas.filter((b) => b.severidad === "alta").length,
    media: brechas.filter((b) => b.severidad === "media").length,
    baja:  brechas.filter((b) => b.severidad === "baja").length,
  };

  if (isLoading) {
    return <p className="text-[13px] text-sse-muted py-8 text-center">Cargando brechas...</p>;
  }

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="flex gap-3">
        {(["alta", "media", "baja"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFiltroSev(filtroSev === s ? "" : s)}
            className={`rounded-full px-3 py-1 text-[12px] font-medium transition-all ${
              filtroSev === s
                ? SEV_CHIP[s]
                : "bg-sse-surface text-sse-muted hover:bg-sse-border"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}: {counts[s]}
          </button>
        ))}
      </div>

      {/* Tipo filter */}
      {tipos.length > 1 && (
        <div className="flex items-center gap-2">
          <label className="text-[12px] text-sse-muted">Tipo:</label>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as CPEBrecha["tipo"] | "")}
            className="rounded border border-sse-border px-2 py-1 text-[13px] text-sse-ink focus:outline-none"
          >
            <option value="">Todos</option>
            {tipos.map((t) => (
              <option key={t} value={t}>{TIPO_LABEL[t] ?? t}</option>
            ))}
          </select>
        </div>
      )}

      {/* Brecha list */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-sse-border bg-white py-12 text-center">
          {brechas.length === 0 ? (
            <>
              <p className="text-[14px] font-medium text-emerald-600">Sin brechas detectadas</p>
              <p className="text-[12px] text-sse-muted mt-1">El sistema no encontró incumplimientos en el periodo actual.</p>
            </>
          ) : (
            <p className="text-[13px] text-sse-muted">No hay brechas para el filtro seleccionado.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((b, i) => (
            <div
              key={i}
              className={`rounded-lg border border-sse-border border-l-4 bg-white px-4 py-3 ${SEV_BORDER[b.severidad] ?? ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-medium text-sse-muted">
                      {TIPO_LABEL[b.tipo] ?? b.tipo}
                    </span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${SEV_CHIP[b.severidad] ?? ""}`}>
                      {b.severidad}
                    </span>
                  </div>
                  <p className="text-[13px] text-sse-ink">{b.descripcion}</p>
                  {b.entidadId && (
                    <p className="text-[11px] text-sse-muted mt-0.5">
                      {b.entidadTipo}: {b.entidadId}
                    </p>
                  )}
                </div>
                <p className="text-[11px] text-sse-muted whitespace-nowrap">
                  {new Date(b.fechaDeteccion).toLocaleDateString("es-SV")}
                </p>
              </div>
            </div>
          ))}
          <p className="text-[11px] text-sse-muted pt-1">
            Mostrando {filtered.length} de {brechas.length} brechas
          </p>
        </div>
      )}
    </div>
  );
}
