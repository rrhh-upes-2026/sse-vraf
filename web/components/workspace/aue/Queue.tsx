"use client";

import { useState } from "react";
import { useAUEQueue, useRetryAUEExecution } from "@/hooks/useAUE";
import type { AUEQueueStatus } from "@/types/aue";

const PURPLE = "#7C3AED";

const STATUS_CHIP: Record<string, string> = {
  pendiente:   "bg-gray-100 text-gray-700",
  procesando:  "bg-yellow-100 text-yellow-800",
  completado:  "bg-emerald-100 text-emerald-800",
  fallido:     "bg-red-100 text-red-800",
  cancelado:   "bg-gray-100 text-gray-400",
};

const TABS: { value: AUEQueueStatus | ""; label: string }[] = [
  { value: "",          label: "Todos" },
  { value: "pendiente", label: "Pendiente" },
  { value: "procesando", label: "Procesando" },
  { value: "completado", label: "Completado" },
  { value: "fallido",   label: "Fallido" },
];

interface Props { wsId: string }

export function AUEQueue({ wsId: _wsId }: Props) {
  const [status, setStatus] = useState<AUEQueueStatus | "">("");

  const { data: queue = [], isLoading } = useAUEQueue({
    status: status || undefined,
    limit: 100,
  });

  const retry = useRetryAUEExecution();

  return (
    <div className="space-y-4">
      {/* Status tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-lg border border-sse-border bg-white px-4 py-3">
        {TABS.map((t) => (
          <button key={t.value} onClick={() => setStatus(t.value)}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
              status === t.value ? "text-white" : "border border-sse-border text-sse-muted hover:text-sse-ink"
            }`}
            style={status === t.value ? { backgroundColor: PURPLE } : {}}>
            {t.label}
          </button>
        ))}
        <span className="ml-auto self-center text-[11px] text-sse-muted">{queue.length} entrada{queue.length !== 1 ? "s" : ""}</span>
      </div>

      {isLoading && <p className="py-10 text-center text-[13px] text-sse-muted">Cargando cola…</p>}
      {!isLoading && queue.length === 0 && (
        <div className="rounded-lg border border-sse-border bg-white py-10 text-center">
          <p className="text-[13px] text-sse-muted">Cola vacía para el estado seleccionado.</p>
        </div>
      )}

      <div className="space-y-2">
        {queue.map((entry) => (
          <div key={entry.id} className={`rounded-lg border bg-white px-4 py-3 ${entry.status === "fallido" ? "border-red-200 bg-red-50/20" : "border-sse-border"}`}>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_CHIP[entry.status] ?? ""}`}>{entry.status}</span>
                  {entry.attempt > 1 && (
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-medium text-amber-800">
                      Intento {entry.attempt}/{entry.maxRetries}
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-mono text-sse-muted">{entry.executionId}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-[10px] text-sse-muted">
                  <span>Programado: <span className="font-medium text-sse-ink">{entry.scheduledAt.slice(0, 16).replace("T", " ")}</span></span>
                  {entry.nextRetry && entry.status === "fallido" && (
                    <span>Próximo reintento: <span className="font-medium text-sse-ink">{entry.nextRetry.slice(0, 16).replace("T", " ")}</span></span>
                  )}
                </div>
              </div>

              {entry.status === "fallido" && entry.attempt < entry.maxRetries && (
                <button
                  onClick={() => retry.mutate(entry.executionId)}
                  disabled={retry.isPending}
                  className="shrink-0 rounded border border-red-200 px-2.5 py-1 text-[11px] text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  Reintentar
                </button>
              )}
            </div>

            {/* Progress bar for processing */}
            {entry.status === "procesando" && (
              <div className="mt-2 h-1 rounded-full bg-sse-border overflow-hidden">
                <div className="h-1 rounded-full animate-pulse" style={{ width: "60%", backgroundColor: PURPLE }} />
              </div>
            )}

            {/* Retry exhaustion notice */}
            {entry.status === "fallido" && entry.attempt >= entry.maxRetries && (
              <p className="mt-1.5 text-[10px] text-red-600">Máximo de reintentos alcanzado ({entry.maxRetries}). Intervención manual requerida.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
