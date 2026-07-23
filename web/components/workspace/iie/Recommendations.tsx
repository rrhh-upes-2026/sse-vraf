"use client";

import { useState } from "react";
import { useIIERecommendations } from "@/hooks/useIIE";
import type { IIEPriority, IIEImpactLevel, IIERecommendationStatus } from "@/types/iie";

const PRIORITY_CHIP: Record<string, string> = {
  critica: "bg-red-100 text-red-800",
  alta:    "bg-orange-100 text-orange-800",
  media:   "bg-yellow-100 text-yellow-800",
  baja:    "bg-gray-100 text-gray-700",
};
const URGENCY_COLOR: Record<string, string> = {
  critica: "text-red-700",
  alta:    "text-orange-700",
  media:   "text-yellow-700",
  baja:    "text-gray-500",
};
const STATUS_CHIP: Record<string, string> = {
  pendiente:  "bg-yellow-100 text-yellow-800",
  en_proceso: "bg-blue-100 text-blue-800",
  completada: "bg-emerald-100 text-emerald-800",
  descartada: "bg-gray-100 text-gray-500",
};
const STATUS_LABEL: Record<string, string> = {
  pendiente:  "Pendiente",
  en_proceso: "En proceso",
  completada: "Completada",
  descartada: "Descartada",
};
const IMPACT_LABEL: Record<string, string> = {
  bajo:         "Bajo",
  medio:        "Medio",
  alto:         "Alto",
  transformador: "Transformador",
};

const PRIORITY_OPTIONS: { value: IIEPriority | ""; label: string }[] = [
  { value: "",        label: "Todas las prioridades" },
  { value: "critica", label: "Crítica" },
  { value: "alta",    label: "Alta" },
  { value: "media",   label: "Media" },
  { value: "baja",    label: "Baja" },
];
const IMPACT_OPTIONS: { value: IIEImpactLevel | ""; label: string }[] = [
  { value: "",             label: "Todos los impactos" },
  { value: "transformador", label: "Transformador" },
  { value: "alto",         label: "Alto" },
  { value: "medio",        label: "Medio" },
  { value: "bajo",         label: "Bajo" },
];
const STATUS_OPTIONS: { value: IIERecommendationStatus | ""; label: string }[] = [
  { value: "",           label: "Todos los estados" },
  { value: "pendiente",  label: "Pendiente" },
  { value: "en_proceso", label: "En proceso" },
  { value: "completada", label: "Completada" },
  { value: "descartada", label: "Descartada" },
];

interface Props { wsId: string }

export function IIERecommendations({ wsId: _wsId }: Props) {
  const [priority, setPriority] = useState<IIEPriority | "">("");
  const [impact,   setImpact]   = useState<IIEImpactLevel | "">("");
  const [status,   setStatus]   = useState<IIERecommendationStatus | "">("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: list = [], isLoading } = useIIERecommendations({
    priority: priority || undefined,
    impact:   impact   || undefined,
    status:   status   || undefined,
    limit: 50,
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-lg border border-sse-border bg-white px-4 py-3">
        <select value={priority} onChange={(e) => setPriority(e.target.value as IIEPriority | "")}
          className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none">
          {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={impact} onChange={(e) => setImpact(e.target.value as IIEImpactLevel | "")}
          className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none">
          {IMPACT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as IIERecommendationStatus | "")}
          className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none">
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="ml-auto self-center text-[11px] text-sse-muted">{list.length} recomendación{list.length !== 1 ? "es" : ""}</span>
      </div>

      {isLoading && (
        <p className="py-10 text-center text-[13px] text-sse-muted">Cargando recomendaciones…</p>
      )}

      {!isLoading && list.length === 0 && (
        <div className="rounded-lg border border-sse-border bg-white py-10 text-center">
          <p className="text-[13px] text-emerald-600">Sin recomendaciones activas para los filtros seleccionados.</p>
        </div>
      )}

      <div className="space-y-2">
        {list.map((rec) => {
          const open = expanded === rec.id;
          return (
            <div key={rec.id} className="rounded-lg border border-sse-border bg-white">
              <button
                className="w-full flex items-start gap-3 px-4 py-3 text-left"
                onClick={() => setExpanded(open ? null : rec.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${PRIORITY_CHIP[rec.priority] ?? ""}`}>{rec.priority}</span>
                    <span className={`text-[10px] font-medium capitalize ${URGENCY_COLOR[rec.urgency] ?? ""}`}>urgencia {rec.urgency}</span>
                    <span className="text-[10px] text-sse-muted">· impacto {IMPACT_LABEL[rec.impact] ?? rec.impact}</span>
                    <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_CHIP[rec.status] ?? ""}`}>{STATUS_LABEL[rec.status] ?? rec.status}</span>
                  </div>
                  <p className="text-[13px] font-medium text-sse-ink">{rec.title}</p>
                  <p className="text-[11px] text-sse-muted mt-0.5 line-clamp-2">{rec.justification}</p>
                </div>
                <svg className={`mt-1 h-4 w-4 shrink-0 text-sse-muted transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {open && (
                <div className="border-t border-sse-border px-4 py-3 space-y-3">
                  <p className="text-[12px] text-sse-ink leading-relaxed">{rec.description}</p>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="rounded border border-sse-border bg-sse-surface px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wide text-sse-muted mb-0.5">¿Por qué?</p>
                      <p className="text-[11px] text-sse-ink">{rec.why}</p>
                    </div>
                    <div className="rounded border border-sse-border bg-sse-surface px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wide text-sse-muted mb-0.5">Impacto esperado</p>
                      <p className="text-[11px] text-sse-ink">{rec.expectedImpact}</p>
                    </div>
                    <div className="rounded border border-sse-border bg-sse-surface px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wide text-sse-muted mb-0.5">Consecuencia si se ignora</p>
                      <p className="text-[11px] text-sse-ink">{rec.consequenceIfIgnored}</p>
                    </div>
                    {rec.suggestedResponsible && (
                      <div className="rounded border border-sse-border bg-sse-surface px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wide text-sse-muted mb-0.5">Responsable sugerido</p>
                        <p className="text-[11px] text-sse-ink">{rec.suggestedResponsible}</p>
                      </div>
                    )}
                  </div>

                  {rec.sourceData.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-sse-muted mb-1.5">Datos fuente</p>
                      <div className="flex flex-wrap gap-2">
                        {rec.sourceData.map((sd, i) => (
                          <div key={i} className="rounded border border-sse-border bg-white px-2 py-1">
                            <p className="text-[10px] text-sse-muted">{sd.label}</p>
                            <p className="text-[11px] font-medium tabular-nums text-sse-ink">
                              {typeof sd.value === "number" ? `${sd.value}%` : sd.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[10px] text-sse-muted">Confianza: <span className="font-medium text-sse-ink tabular-nums">{rec.confidenceScore}%</span></span>
                    {rec.estimatedEffort && (
                      <span className="text-[10px] text-sse-muted">Esfuerzo estimado: <span className="font-medium text-sse-ink">{rec.estimatedEffort}</span></span>
                    )}
                    {rec.appliedRule && (
                      <span className="rounded bg-[#F5F3FF] px-1.5 py-0.5 text-[10px] text-[#6D28D9]">{rec.appliedRule}</span>
                    )}
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
