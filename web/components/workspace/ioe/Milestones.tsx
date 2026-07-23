"use client";

import { useState } from "react";
import { useIOEMilestones, useUpdateIOEMilestone } from "@/hooks/useIOE";
import type { IOEMilestoneStatus } from "@/types/ioe";

const TEAL = "#0F766E";

const STATUS_CHIP: Record<string, string> = {
  pendiente:   "bg-gray-100 text-gray-700",
  en_progreso: "bg-teal-100 text-teal-800",
  completado:  "bg-emerald-100 text-emerald-800",
  retrasado:   "bg-red-100 text-red-800",
  cancelado:   "bg-gray-100 text-gray-400",
};
const STATUS_LABEL: Record<string, string> = {
  pendiente: "Pendiente", en_progreso: "En progreso", completado: "Completado",
  retrasado: "Retrasado", cancelado: "Cancelado",
};
const STATUS_OPTS: { value: IOEMilestoneStatus | ""; label: string }[] = [
  { value: "",            label: "Todos" },
  { value: "pendiente",   label: "Pendiente" },
  { value: "en_progreso", label: "En progreso" },
  { value: "completado",  label: "Completado" },
  { value: "retrasado",   label: "Retrasado" },
];

interface Props { wsId: string }

export function IOEMilestones({ wsId: _wsId }: Props) {
  const [status, setStatus] = useState<IOEMilestoneStatus | "">("");
  const updateMilestone = useUpdateIOEMilestone();

  const { data: list = [], isLoading } = useIOEMilestones({
    status: status || undefined,
    limit: 100,
  });

  function markComplete(id: string, actionPlanId: string) {
    updateMilestone.mutate({ id, actionPlanId, status: "completado", completedDate: new Date().toISOString().slice(0, 10) });
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-lg border border-sse-border bg-white px-4 py-3">
        {STATUS_OPTS.map((o) => (
          <button key={o.value} onClick={() => setStatus(o.value as IOEMilestoneStatus | "")}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
              status === o.value ? "bg-[#0F766E] text-white" : "border border-sse-border text-sse-muted hover:text-sse-ink"
            }`}>
            {o.label}
          </button>
        ))}
        <span className="ml-auto self-center text-[11px] text-sse-muted">{list.length} hito{list.length !== 1 ? "s" : ""}</span>
      </div>

      {isLoading && <p className="py-10 text-center text-[13px] text-sse-muted">Cargando hitos…</p>}
      {!isLoading && list.length === 0 && (
        <div className="rounded-lg border border-sse-border bg-white py-10 text-center">
          <p className="text-[13px] text-sse-muted">Sin hitos para el filtro seleccionado.</p>
        </div>
      )}

      <div className="space-y-2">
        {list.map((m) => {
          const overdue = m.plannedDate < today && m.status !== "completado" && m.status !== "cancelado";
          return (
            <div key={m.id} className={`rounded-lg border bg-white ${overdue ? "border-red-200" : "border-sse-border"}`}>
              <div className="flex items-start gap-3 px-4 py-3">
                {/* Weight arc indicator */}
                <div className="mt-0.5 shrink-0 flex h-8 w-8 items-center justify-center rounded-full border-2" style={{ borderColor: TEAL }}>
                  <span className="text-[9px] font-bold tabular-nums" style={{ color: TEAL }}>{m.weight}%</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_CHIP[m.status] ?? ""}`}>
                      {STATUS_LABEL[m.status] ?? m.status}
                    </span>
                    {overdue && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">Vencido</span>}
                  </div>
                  <p className="text-[13px] font-medium text-sse-ink">{m.title}</p>
                  {m.description && <p className="text-[11px] text-sse-muted mt-0.5 line-clamp-2">{m.description}</p>}
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-sse-muted">
                    <span>Fecha: <span className="font-medium text-sse-ink">{m.plannedDate}</span></span>
                    {m.completedDate && <span>Completado: <span className="font-medium text-emerald-700">{m.completedDate}</span></span>}
                    <span>Tareas: <span className="font-medium tabular-nums text-sse-ink">{m.completedTasks}/{m.taskCount}</span></span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
                  {m.status !== "completado" && m.status !== "cancelado" && (
                    <button
                      onClick={() => markComplete(m.id, m.actionPlanId)}
                      disabled={updateMilestone.isPending}
                      className="rounded border border-teal-300 px-2.5 py-1 text-[11px] text-[#0F766E] hover:bg-teal-50 disabled:opacity-50 transition-colors"
                    >
                      Completar
                    </button>
                  )}
                  <button
                    onClick={() => updateMilestone.mutate({ id: m.id, actionPlanId: m.actionPlanId, status: "en_progreso" })}
                    disabled={m.status === "en_progreso" || m.status === "completado" || m.status === "cancelado" || updateMilestone.isPending}
                    className="rounded border border-sse-border px-2.5 py-1 text-[11px] text-sse-muted hover:text-sse-ink disabled:opacity-30 transition-colors"
                  >
                    Iniciar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
