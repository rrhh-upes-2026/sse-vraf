"use client";

import { useState } from "react";
import { useEIPTimeline } from "@/hooks/useEIP";
import type { EIPTimelineEventType } from "@/types/eip";

const EVENT_ICON: Record<string, string> = {
  planificacion:  "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  ejecucion:      "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  evidencia:      "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  incumplimiento: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  plan_mejora:    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
};

const EVENT_COLOR: Record<string, string> = {
  planificacion:  "bg-blue-100 text-blue-700 border-blue-200",
  ejecucion:      "bg-emerald-100 text-emerald-700 border-emerald-200",
  evidencia:      "bg-purple-100 text-purple-700 border-purple-200",
  incumplimiento: "bg-red-100 text-red-700 border-red-200",
  plan_mejora:    "bg-orange-100 text-orange-700 border-orange-200",
};

const EVENT_LABEL: Record<string, string> = {
  planificacion:  "Planificación",
  ejecucion:      "Ejecución",
  evidencia:      "Evidencia",
  incumplimiento: "Incumplimiento",
  plan_mejora:    "Plan de Mejora",
};

const FILTERS: { key: EIPTimelineEventType | "all"; label: string }[] = [
  { key: "all",            label: "Todos" },
  { key: "planificacion",  label: "Planificación" },
  { key: "ejecucion",      label: "Ejecución" },
  { key: "evidencia",      label: "Evidencia" },
  { key: "incumplimiento", label: "Incumplimiento" },
  { key: "plan_mejora",    label: "Mejora" },
];

export function Timeline() {
  const [filter, setFilter] = useState<EIPTimelineEventType | undefined>(undefined);
  const { data: events = [], isLoading } = useEIPTimeline({
    types: filter ? [filter] : undefined,
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key === "all" ? undefined : f.key as EIPTimelineEventType)}
            className={`rounded-full px-3 py-1 text-[12px] border transition-colors ${
              (f.key === "all" && !filter) || f.key === filter
                ? "bg-[#1D4ED8] text-white border-[#1D4ED8] font-medium"
                : "bg-white text-sse-muted border-sse-border hover:bg-sse-surface"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {isLoading ? (
        <p className="text-[13px] text-sse-muted text-center py-8">Cargando línea de tiempo...</p>
      ) : events.length === 0 ? (
        <p className="text-[13px] text-sse-muted text-center py-8">Sin eventos en el período seleccionado.</p>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-sse-border" />

          <div className="space-y-4">
            {events.map((ev) => {
              const iconPath = EVENT_ICON[ev.type] ?? EVENT_ICON.planificacion;
              const colorClass = EVENT_COLOR[ev.type] ?? "bg-gray-100 text-gray-700 border-gray-200";
              return (
                <div key={ev.id} className="relative flex gap-4 pl-10">
                  {/* Icon bubble */}
                  <div className={`absolute left-0 flex h-9 w-9 items-center justify-center rounded-full border ${colorClass}`}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1 rounded-lg border border-sse-border bg-white px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-medium capitalize rounded-full px-1.5 py-0.5 border ${colorClass}`}>
                            {EVENT_LABEL[ev.type] ?? ev.type}
                          </span>
                          {ev.module && (
                            <span className="text-[10px] text-sse-muted uppercase tracking-wide">{ev.module}</span>
                          )}
                        </div>
                        <p className="text-[13px] font-medium text-sse-ink">{ev.title}</p>
                        {ev.description && (
                          <p className="text-[12px] text-sse-muted mt-0.5">{ev.description}</p>
                        )}
                        {ev.entityLabel && (
                          <p className="text-[11px] text-[#1D4ED8] mt-1">{ev.entityLabel}</p>
                        )}
                      </div>
                      <time className="shrink-0 text-[11px] text-sse-muted tabular-nums">{ev.date}</time>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
