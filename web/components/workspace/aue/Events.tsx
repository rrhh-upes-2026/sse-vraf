"use client";

import { useState } from "react";
import { useAUEEvents, useProcessAUEEvent } from "@/hooks/useAUE";
import type { AUEEventStatus, AUEEventPriority, AUESourceEngine, AUEEventType } from "@/types/aue";

const PURPLE = "#7C3AED";

const STATUS_CHIP: Record<string, string> = {
  pendiente:  "bg-gray-100 text-gray-700",
  procesando: "bg-yellow-100 text-yellow-800",
  procesado:  "bg-emerald-100 text-emerald-800",
  fallido:    "bg-red-100 text-red-800",
  ignorado:   "bg-gray-100 text-gray-400",
};
const STATUS_LABEL: Record<string, string> = {
  pendiente: "Pendiente", procesando: "Procesando",
  procesado: "Procesado", fallido: "Fallido", ignorado: "Ignorado",
};
const PRIORITY_CHIP: Record<string, string> = {
  baja:   "bg-gray-100 text-gray-600",
  normal: "bg-blue-100 text-blue-700",
  alta:   "bg-orange-100 text-orange-800",
  critica: "bg-red-100 text-red-800",
};

const STATUS_OPTS: { value: AUEEventStatus | ""; label: string }[] = [
  { value: "",           label: "Todos los estados" },
  { value: "pendiente",  label: "Pendiente" },
  { value: "procesando", label: "Procesando" },
  { value: "procesado",  label: "Procesado" },
  { value: "fallido",    label: "Fallido" },
  { value: "ignorado",   label: "Ignorado" },
];

const PRIORITY_OPTS: { value: AUEEventPriority | ""; label: string }[] = [
  { value: "",        label: "Todas" },
  { value: "critica", label: "Crítica" },
  { value: "alta",    label: "Alta" },
  { value: "normal",  label: "Normal" },
  { value: "baja",    label: "Baja" },
];

const ENGINE_OPTS: { value: AUESourceEngine | ""; label: string }[] = [
  { value: "",       label: "Todos los motores" },
  { value: "ime",    label: "IME" },
  { value: "pme",    label: "PME" },
  { value: "ape",    label: "APE" },
  { value: "aee",    label: "AEE" },
  { value: "eme",    label: "EME" },
  { value: "cpe",    label: "CPE" },
  { value: "eip",    label: "EIP" },
  { value: "iie",    label: "IIE" },
  { value: "ioe",    label: "IOE" },
  { value: "system", label: "Sistema" },
];

interface Props { wsId: string }

export function AUEEvents({ wsId: _wsId }: Props) {
  const [status,   setStatus]   = useState<AUEEventStatus | "">("");
  const [priority, setPriority] = useState<AUEEventPriority | "">("");
  const [engine,   setEngine]   = useState<AUESourceEngine | "">("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: events = [], isLoading } = useAUEEvents({
    status:       status   || undefined,
    priority:     priority || undefined,
    sourceEngine: engine   || undefined,
    limit: 100,
  });

  const processEvent = useProcessAUEEvent();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 rounded-lg border border-sse-border bg-white px-4 py-3">
        <select value={status} onChange={(e) => setStatus(e.target.value as AUEEventStatus | "")}
          className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none">
          {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value as AUEEventPriority | "")}
          className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none">
          {PRIORITY_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={engine} onChange={(e) => setEngine(e.target.value as AUESourceEngine | "")}
          className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none">
          {ENGINE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="ml-auto self-center text-[11px] text-sse-muted">{events.length} evento{events.length !== 1 ? "s" : ""}</span>
      </div>

      {isLoading && <p className="py-10 text-center text-[13px] text-sse-muted">Cargando eventos…</p>}
      {!isLoading && events.length === 0 && (
        <div className="rounded-lg border border-sse-border bg-white py-10 text-center">
          <p className="text-[13px] text-sse-muted">Sin eventos para los filtros seleccionados.</p>
        </div>
      )}

      <div className="space-y-1.5">
        {events.map((ev) => {
          const open = expanded === ev.id;
          return (
            <div key={ev.id} className="rounded-lg border border-sse-border bg-white overflow-hidden">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-left" onClick={() => setExpanded(open ? null : ev.id)}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  ev.status === "procesado" ? "bg-emerald-500"
                    : ev.status === "fallido" ? "bg-red-500"
                    : ev.status === "procesando" ? "bg-yellow-500"
                    : "bg-gray-300"
                }`} />
                <span className="w-16 shrink-0 text-[10px] font-mono uppercase text-sse-muted">{ev.sourceEngine}</span>
                <span className="flex-1 text-[12px] font-medium text-sse-ink truncate">{ev.eventType}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium ${PRIORITY_CHIP[ev.priority] ?? ""}`}>{ev.priority}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium ${STATUS_CHIP[ev.status] ?? ""}`}>{STATUS_LABEL[ev.status] ?? ev.status}</span>
                <span className="shrink-0 text-[10px] tabular-nums text-sse-muted">{ev.timestamp.slice(0, 16).replace("T", " ")}</span>
                <svg className={`h-3.5 w-3.5 shrink-0 text-sse-muted transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {open && (
                <div className="border-t border-sse-border px-4 py-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-[11px]">
                    <div><p className="text-sse-muted text-[10px]">ID</p><p className="font-mono text-sse-ink">{ev.id}</p></div>
                    <div><p className="text-sse-muted text-[10px]">Entidad origen</p><p className="font-mono text-sse-ink">{ev.sourceEntityId || "—"}</p></div>
                    <div><p className="text-sse-muted text-[10px]">Procesado en</p><p className="text-sse-ink">{ev.processedAt ? ev.processedAt.slice(0, 16).replace("T", " ") : "—"}</p></div>
                  </div>

                  <div className="rounded border border-sse-border bg-sse-surface px-3 py-2">
                    <p className="text-[10px] text-sse-muted mb-1">Payload</p>
                    <pre className="text-[10px] text-sse-ink overflow-x-auto">{JSON.stringify(ev.payload, null, 2)}</pre>
                  </div>

                  {ev.status === "pendiente" && (
                    <button
                      onClick={() => processEvent.mutate(ev.id)}
                      disabled={processEvent.isPending}
                      className="rounded px-3 py-1.5 text-[11px] text-white disabled:opacity-50 transition-colors"
                      style={{ backgroundColor: PURPLE }}
                    >
                      Procesar ahora
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
