"use client";

import { useState } from "react";
import { useAUEExecutions } from "@/hooks/useAUE";
import { useAUEEvents } from "@/hooks/useAUE";
import type { AUEExecutionStatus } from "@/types/aue";

const PURPLE = "#7C3AED";

const STATUS_COLOR: Record<string, string> = {
  exitoso:      "text-emerald-700",
  fallido:      "text-red-700",
  reintentando: "text-amber-700",
  ejecutando:   "text-yellow-700",
  pendiente:    "text-gray-600",
};

interface Props { wsId: string }

export function AUEAudit({ wsId: _wsId }: Props) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [status,   setStatus]   = useState<AUEExecutionStatus | "">("");

  const { data: executions = [], isLoading: execLoading } = useAUEExecutions({
    status: status || undefined,
    from:   dateFrom || undefined,
    to:     dateTo   || undefined,
    limit: 200,
  });

  const { data: events = [], isLoading: eventsLoading } = useAUEEvents({
    from: dateFrom || undefined,
    to:   dateTo   || undefined,
    limit: 200,
  });

  const isLoading = execLoading || eventsLoading;

  // Build unified audit trail sorted by time descending
  const auditRows = [
    ...executions.map((ex) => ({
      kind:      "execution" as const,
      timestamp: ex.startedAt,
      status:    ex.status,
      label:     `Ejecución: ${ex.ruleName}`,
      sub:       `Evento ${ex.eventId}`,
      duration:  ex.duration,
      logs:      ex.logs,
      id:        ex.id,
    })),
    ...events.map((ev) => ({
      kind:      "event" as const,
      timestamp: ev.timestamp,
      status:    ev.status,
      label:     `Evento: ${ev.eventType}`,
      sub:       `Motor: ${ev.sourceEngine.toUpperCase()} · ${ev.sourceEntityId}`,
      duration:  undefined as number | undefined,
      logs:      [] as string[],
      id:        ev.id,
    })),
  ].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-lg border border-sse-border bg-white px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-sse-muted">Desde</span>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-sse-muted">Hasta</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as AUEExecutionStatus | "")}
          className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none">
          <option value="">Todos los resultados</option>
          <option value="exitoso">Exitoso</option>
          <option value="fallido">Fallido</option>
          <option value="reintentando">Reintentando</option>
        </select>
        <span className="ml-auto self-center text-[11px] text-sse-muted">{auditRows.length} registros</span>
      </div>

      {isLoading && <p className="py-10 text-center text-[13px] text-sse-muted">Cargando auditoría…</p>}

      {/* Audit summary stats */}
      {!isLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total registros",  value: auditRows.length, color: PURPLE },
            { label: "Ejecuciones",      value: executions.length, color: PURPLE },
            { label: "Exitosas",         value: executions.filter((e) => e.status === "exitoso").length, color: "#059669" },
            { label: "Fallidas",         value: executions.filter((e) => e.status === "fallido").length,  color: "#DC2626" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-sse-border bg-white px-4 py-3 text-center">
              <p className="text-[20px] font-bold tabular-nums" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] text-sse-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Timeline */}
      {!isLoading && auditRows.length === 0 && (
        <div className="rounded-lg border border-sse-border bg-white py-10 text-center">
          <p className="text-[13px] text-sse-muted">Sin registros de auditoría.</p>
        </div>
      )}

      {!isLoading && auditRows.length > 0 && (
        <div className="rounded-lg border border-sse-border bg-white divide-y divide-sse-border">
          {auditRows.map((row) => (
            <div key={row.id} className="flex items-start gap-3 px-4 py-3">
              {/* Kind indicator */}
              <div className="shrink-0 mt-0.5">
                {row.kind === "execution" ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: PURPLE }}>
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#6B7280" }}>
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[12px] font-medium text-sse-ink">{row.label}</span>
                  <span className={`text-[10px] font-medium ${STATUS_COLOR[row.status] ?? "text-gray-600"}`}>{row.status}</span>
                  {row.duration != null && (
                    <span className="text-[10px] tabular-nums text-sse-muted">{row.duration}ms</span>
                  )}
                </div>
                <p className="text-[11px] text-sse-muted">{row.sub}</p>
                {row.logs.length > 0 && (
                  <div className="mt-1.5 rounded bg-gray-50 border border-sse-border px-2 py-1.5 space-y-0.5">
                    {row.logs.slice(0, 3).map((log, i) => (
                      <p key={i} className={`text-[9px] font-mono ${
                        log.startsWith("[ERROR]") ? "text-red-600"
                          : log.startsWith("[OK]")  ? "text-emerald-700"
                          : "text-gray-600"
                      }`}>{log}</p>
                    ))}
                    {row.logs.length > 3 && (
                      <p className="text-[9px] text-sse-muted">+{row.logs.length - 3} más</p>
                    )}
                  </div>
                )}
              </div>

              <span className="shrink-0 text-[10px] tabular-nums text-sse-muted">{row.timestamp.slice(0, 16).replace("T", " ")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
