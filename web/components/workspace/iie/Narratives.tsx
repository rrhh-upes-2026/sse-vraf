"use client";

import { useState } from "react";
import { useIIENarratives } from "@/hooks/useIIE";
import type { IIENarrativePeriod } from "@/types/iie";

const PERIOD_TABS: { value: IIENarrativePeriod; label: string }[] = [
  { value: "semanal",     label: "Semanal" },
  { value: "mensual",     label: "Mensual" },
  { value: "trimestral",  label: "Trimestral" },
  { value: "anual",       label: "Anual" },
];

interface Props { wsId: string }

export function IIENarratives({ wsId: _wsId }: Props) {
  const [period, setPeriod] = useState<IIENarrativePeriod>("mensual");

  const { data: list = [], isLoading } = useIIENarratives(period);

  return (
    <div className="space-y-5">
      {/* Period tabs */}
      <div className="flex rounded-lg border border-sse-border bg-white p-1 gap-1 w-fit">
        {PERIOD_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setPeriod(t.value)}
            className={`rounded px-4 py-1.5 text-[12px] font-medium transition-colors ${
              period === t.value
                ? "bg-[#6D28D9] text-white"
                : "text-sse-muted hover:text-sse-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="py-10 text-center text-[13px] text-sse-muted">Generando narrativas…</p>}
      {!isLoading && list.length === 0 && (
        <div className="rounded-lg border border-sse-border bg-white py-10 text-center">
          <p className="text-[13px] text-sse-muted">Sin narrativas disponibles para el período seleccionado.</p>
          <p className="text-[11px] text-sse-muted mt-1">Ejecute un cálculo CPE para generar narrativas de análisis.</p>
        </div>
      )}

      <div className="space-y-6">
        {list.map((n) => (
          <div key={n.id} className="rounded-xl border border-sse-border bg-white overflow-hidden">
            {/* Header */}
            <div className="border-b border-sse-border bg-[#F5F3FF] px-5 py-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#6D28D9] mb-0.5">{n.periodLabel}</p>
                  <h3 className="text-[15px] font-semibold text-sse-ink">{n.title}</h3>
                </div>
                <span className="text-[11px] text-sse-muted tabular-nums">Confianza: <span className="font-medium text-[#6D28D9]">{n.confidenceScore}%</span></span>
              </div>
            </div>

            {/* Key figures */}
            {n.keyFigures.length > 0 && (
              <div className="grid grid-cols-2 gap-px bg-sse-border sm:grid-cols-4">
                {n.keyFigures.map((kf, i) => (
                  <div key={i} className="bg-white px-4 py-3 text-center">
                    <p className="text-[10px] text-sse-muted mb-0.5">{kf.label}</p>
                    <p className="text-[18px] font-bold tabular-nums text-[#6D28D9]">{kf.value}</p>
                    {kf.trend && <p className="text-[10px] text-sse-muted mt-0.5">{kf.trend}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Body */}
            {n.body && (
              <div className="px-5 py-4 border-b border-sse-border">
                <p className="text-[13px] text-sse-ink leading-relaxed">{n.body}</p>
              </div>
            )}

            {/* Sections */}
            {n.sections.length > 0 && (
              <div className="divide-y divide-sse-border">
                {n.sections.map((sec, i) => (
                  <div key={i} className="px-5 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6D28D9] mb-2">{sec.title}</p>
                    <p className="text-[13px] text-sse-ink leading-relaxed">{sec.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-sse-border bg-sse-surface px-5 py-2">
              <p className="text-[10px] text-sse-muted">Generado: {new Date(n.generatedAt).toLocaleDateString("es-SV", { dateStyle: "medium" })}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
