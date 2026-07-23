"use client";

import { useState } from "react";
import { useIOEDecisions, useUpdateIOEDecision } from "@/hooks/useIOE";
import type { IOEDecisionStatus } from "@/types/ioe";

const STATUS_CHIP: Record<string, string> = {
  pendiente:    "bg-yellow-100 text-yellow-800",
  implementada: "bg-emerald-100 text-emerald-800",
  revertida:    "bg-red-100 text-red-800",
  cancelada:    "bg-gray-100 text-gray-500",
};
const STATUS_LABEL: Record<string, string> = {
  pendiente: "Pendiente", implementada: "Implementada", revertida: "Revertida", cancelada: "Cancelada",
};

const STATUS_OPTS: { value: IOEDecisionStatus | ""; label: string }[] = [
  { value: "",             label: "Todos los estados" },
  { value: "pendiente",    label: "Pendiente" },
  { value: "implementada", label: "Implementada" },
  { value: "revertida",    label: "Revertida" },
  { value: "cancelada",    label: "Cancelada" },
];

interface Props { wsId: string }

export function IOEDecisions({ wsId: _wsId }: Props) {
  const [status,   setStatus]   = useState<IOEDecisionStatus | "">("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: list = [], isLoading } = useIOEDecisions({
    status: status || undefined,
    limit: 100,
  });

  const updateDecision = useUpdateIOEDecision();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 rounded-lg border border-sse-border bg-white px-4 py-3">
        <select value={status} onChange={(e) => setStatus(e.target.value as IOEDecisionStatus | "")}
          className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none">
          {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="ml-auto self-center text-[11px] text-sse-muted">{list.length} decisión{list.length !== 1 ? "es" : ""}</span>
      </div>

      {isLoading && <p className="py-10 text-center text-[13px] text-sse-muted">Cargando decisiones…</p>}
      {!isLoading && list.length === 0 && (
        <div className="rounded-lg border border-sse-border bg-white py-10 text-center">
          <p className="text-[13px] text-sse-muted">Sin decisiones registradas.</p>
        </div>
      )}

      <div className="space-y-2">
        {list.map((d) => {
          const open = expanded === d.id;
          return (
            <div key={d.id} className="rounded-lg border border-sse-border bg-white overflow-hidden">
              <button className="w-full flex items-start gap-3 px-4 py-3 text-left" onClick={() => setExpanded(open ? null : d.id)}>
                <div className="shrink-0 text-center">
                  <p className="text-[10px] text-sse-muted font-mono">{d.date}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_CHIP[d.status] ?? ""}`}>{STATUS_LABEL[d.status] ?? d.status}</span>
                    <span className="text-[10px] text-sse-muted">{d.origin}</span>
                  </div>
                  <p className="text-[13px] font-medium text-sse-ink">{d.decision}</p>
                  <p className="text-[11px] text-sse-muted mt-0.5">Responsable: {d.responsable}</p>
                </div>
                <svg className={`mt-1 h-4 w-4 shrink-0 text-sse-muted transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {open && (
                <div className="border-t border-sse-border px-4 py-3 space-y-2">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="rounded border border-sse-border bg-sse-surface px-3 py-2">
                      <p className="text-[10px] text-sse-muted mb-0.5">Justificación</p>
                      <p className="text-[11px] text-sse-ink">{d.justification}</p>
                    </div>
                    <div className="rounded border border-sse-border bg-sse-surface px-3 py-2">
                      <p className="text-[10px] text-sse-muted mb-0.5">Resultado esperado</p>
                      <p className="text-[11px] text-sse-ink">{d.expectedResult}</p>
                    </div>
                    <div className="rounded border border-sse-border bg-sse-surface px-3 py-2">
                      <p className="text-[10px] text-sse-muted mb-0.5">Plan de acción</p>
                      <p className="text-[11px] font-mono text-[#0F766E]">{d.actionPlanId}</p>
                    </div>
                  </div>

                  {d.status === "pendiente" && (
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => updateDecision.mutate({ id: d.id, actionPlanId: d.actionPlanId, status: "implementada" })}
                        className="rounded bg-[#0F766E] px-2.5 py-1 text-[11px] text-white hover:bg-[#0D6A62] transition-colors">
                        Marcar implementada
                      </button>
                      <button onClick={() => updateDecision.mutate({ id: d.id, actionPlanId: d.actionPlanId, status: "cancelada" })}
                        className="rounded border border-sse-border px-2.5 py-1 text-[11px] text-sse-muted hover:text-sse-ink transition-colors">
                        Cancelar
                      </button>
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
