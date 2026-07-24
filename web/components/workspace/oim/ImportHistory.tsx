"use client";

import { useState } from "react";
import { useOIMReports } from "@/hooks/useOIM";
import type { OIMMigrationReport } from "@/types/oim";

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    success: "bg-green-100 text-green-700",
    partial: "bg-amber-100 text-amber-700",
    failed:  "bg-red-100 text-red-700",
  };
  const label: Record<string, string> = {
    success: "Exitosa",
    partial: "Parcial",
    failed:  "Fallida",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${map[status] ?? "bg-sse-border/40 text-sse-muted"}`}>
      {label[status] ?? status}
    </span>
  );
}

export function ImportHistory() {
  const { data: reports, isLoading } = useOIMReports();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (isLoading) return <p className="text-[12px] text-sse-muted py-4">Cargando historial…</p>;
  if (!reports?.length) {
    return (
      <div className="rounded-xl border border-sse-border bg-sse-surface p-8 text-center">
        <p className="text-[13px] font-medium text-sse-ink">Sin ejecuciones registradas</p>
        <p className="text-[12px] text-sse-muted mt-1">El historial aparece aquí después de ejecutar la primera migración.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-sse-ink">Historial de Importaciones</h2>
        <span className="text-[11px] text-sse-muted">{reports.length} ejecución{reports.length !== 1 ? "es" : ""}</span>
      </div>

      <div className="space-y-2">
        {reports.map((r) => {
          const isOpen = expanded === r.id;
          let parsed: OIMMigrationReport | null = null;
          if (isOpen) {
            try { parsed = JSON.parse(r.reportJson) as OIMMigrationReport; } catch { /* keep null */ }
          }

          return (
            <div key={r.id} className="rounded-xl border border-sse-border bg-white overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : r.id)}
                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-sse-surface/50 text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[12px] font-medium text-sse-ink">{r.sprintId}</span>
                    <StatusPill status={r.status} />
                  </div>
                  <p className="text-[11px] text-sse-muted mt-0.5">{r.runAt} · {r.runBy}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-[12px] font-bold text-green-700 tabular-nums">{r.imported}</p>
                    <p className="text-[10px] text-sse-muted">importados</p>
                  </div>
                  {r.rejected > 0 && (
                    <div className="text-right">
                      <p className="text-[12px] font-bold text-red-600 tabular-nums">{r.rejected}</p>
                      <p className="text-[10px] text-sse-muted">rechazados</p>
                    </div>
                  )}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 text-sse-muted transition-transform ${isOpen ? "rotate-180" : ""}`}>
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>

              {isOpen && parsed && (
                <div className="border-t border-sse-border px-4 py-3 space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: "Total",      val: parsed.total },
                      { label: "Importados", val: parsed.imported },
                      { label: "Rechazados", val: parsed.rejected },
                      { label: "Warnings",   val: parsed.warnings },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg bg-sse-surface border border-sse-border px-3 py-2">
                        <p className="text-[16px] font-bold text-sse-ink tabular-nums">{s.val}</p>
                        <p className="text-[10px] text-sse-muted">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {parsed.rows.map((row) => (
                      <div key={row.seq} className="flex items-center gap-2 text-[11px]">
                        <span className="font-mono text-indigo-600 w-20 shrink-0">{row.codigoGenerado ?? "—"}</span>
                        <span className="text-sse-ink flex-1 truncate">{row.nombre}</span>
                        <span className={`shrink-0 ${row.status === "imported" ? "text-green-600" : "text-red-600"}`}>
                          {row.status === "imported" ? "✓" : "✗"}
                        </span>
                      </div>
                    ))}
                  </div>
                  {parsed.recomendaciones.length > 0 && (
                    <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
                      {parsed.recomendaciones.map((rec, i) => (
                        <p key={i} className="text-[11px] text-blue-700">• {rec}</p>
                      ))}
                    </div>
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
