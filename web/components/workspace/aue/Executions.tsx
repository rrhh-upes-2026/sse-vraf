"use client";

import { useState } from "react";
import { useAUEExecutions, useRetryAUEExecution } from "@/hooks/useAUE";
import type { AUEExecutionStatus } from "@/types/aue";

const PURPLE = "#7C3AED";

const STATUS_CHIP: Record<string, string> = {
  pendiente:    "bg-gray-100 text-gray-700",
  ejecutando:   "bg-yellow-100 text-yellow-800",
  exitoso:      "bg-emerald-100 text-emerald-800",
  fallido:      "bg-red-100 text-red-800",
  reintentando: "bg-amber-100 text-amber-800",
};
const STATUS_LABEL: Record<string, string> = {
  pendiente: "Pendiente", ejecutando: "Ejecutando",
  exitoso: "Exitoso", fallido: "Fallido", reintentando: "Reintentando",
};

const STATUS_OPTS: { value: AUEExecutionStatus | ""; label: string }[] = [
  { value: "",             label: "Todos" },
  { value: "pendiente",    label: "Pendiente" },
  { value: "exitoso",      label: "Exitoso" },
  { value: "fallido",      label: "Fallido" },
  { value: "reintentando", label: "Reintentando" },
];

interface Props { wsId: string }

export function AUEExecutions({ wsId: _wsId }: Props) {
  const [status,   setStatus]   = useState<AUEExecutionStatus | "">("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: executions = [], isLoading } = useAUEExecutions({
    status: status || undefined,
    limit: 100,
  });

  const retry = useRetryAUEExecution();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 rounded-lg border border-sse-border bg-white px-4 py-3">
        <select value={status} onChange={(e) => setStatus(e.target.value as AUEExecutionStatus | "")}
          className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none">
          {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="ml-auto self-center text-[11px] text-sse-muted">{executions.length} ejecución{executions.length !== 1 ? "es" : ""}</span>
      </div>

      {isLoading && <p className="py-10 text-center text-[13px] text-sse-muted">Cargando ejecuciones…</p>}
      {!isLoading && executions.length === 0 && (
        <div className="rounded-lg border border-sse-border bg-white py-10 text-center">
          <p className="text-[13px] text-sse-muted">Sin ejecuciones para el filtro seleccionado.</p>
        </div>
      )}

      <div className="space-y-2">
        {executions.map((ex) => {
          const open = expanded === ex.id;
          return (
            <div key={ex.id} className={`rounded-lg border bg-white overflow-hidden ${ex.status === "fallido" ? "border-red-200" : "border-sse-border"}`}>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-left" onClick={() => setExpanded(open ? null : ex.id)}>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${STATUS_CHIP[ex.status] ?? ""}`}>
                  {STATUS_LABEL[ex.status] ?? ex.status}
                </span>
                <span className="flex-1 text-[12px] font-medium text-sse-ink truncate">{ex.ruleName}</span>
                {ex.duration != null && (
                  <span className="shrink-0 text-[10px] tabular-nums text-sse-muted">{ex.duration}ms</span>
                )}
                <span className="shrink-0 text-[10px] tabular-nums text-sse-muted">{ex.startedAt.slice(0, 16).replace("T", " ")}</span>
                <svg className={`h-3.5 w-3.5 shrink-0 text-sse-muted transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {open && (
                <div className="border-t border-sse-border px-4 py-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-[11px]">
                    <div><p className="text-sse-muted text-[10px]">ID ejecución</p><p className="font-mono text-sse-ink">{ex.id}</p></div>
                    <div><p className="text-sse-muted text-[10px]">ID evento</p><p className="font-mono text-sse-ink">{ex.eventId}</p></div>
                    <div><p className="text-sse-muted text-[10px]">ID regla</p><p className="font-mono text-sse-ink">{ex.ruleId}</p></div>
                    <div>
                      <p className="text-sse-muted text-[10px]">Duración</p>
                      <p className="tabular-nums text-sse-ink">{ex.duration != null ? `${ex.duration}ms` : "—"}</p>
                    </div>
                  </div>

                  {/* Logs */}
                  <div className="rounded border border-sse-border bg-gray-900 px-3 py-2 overflow-x-auto">
                    <p className="text-[10px] text-gray-400 mb-1">Logs</p>
                    {ex.logs.length === 0 ? (
                      <p className="text-[10px] text-gray-500">Sin logs.</p>
                    ) : (
                      <div className="space-y-0.5">
                        {ex.logs.map((log, i) => (
                          <p key={i} className={`text-[10px] font-mono ${
                            log.startsWith("[ERROR]") ? "text-red-400"
                              : log.startsWith("[WARN]") ? "text-yellow-400"
                              : log.startsWith("[OK]") ? "text-emerald-400"
                              : log.startsWith("[SKIP]") ? "text-gray-500"
                              : "text-gray-300"
                          }`}>{log}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  {ex.status === "fallido" && (
                    <button
                      onClick={() => retry.mutate(ex.id)}
                      disabled={retry.isPending}
                      className="rounded border border-red-200 px-2.5 py-1 text-[11px] text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      Reintentar ejecución
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
