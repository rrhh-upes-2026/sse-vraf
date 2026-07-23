"use client";

import { useState } from "react";
import { useIOETasks, useUpdateIOETask } from "@/hooks/useIOE";
import type { IOETaskStatus, IOEPriority } from "@/types/ioe";

const TEAL = "#0F766E";

const STATUS_CHIP: Record<string, string> = {
  pendiente:   "bg-gray-100 text-gray-700",
  en_progreso: "bg-teal-100 text-teal-800",
  completada:  "bg-emerald-100 text-emerald-800",
  bloqueada:   "bg-red-100 text-red-800",
  cancelada:   "bg-gray-100 text-gray-400",
};
const STATUS_LABEL: Record<string, string> = {
  pendiente: "Pendiente", en_progreso: "En progreso", completada: "Completada",
  bloqueada: "Bloqueada", cancelada: "Cancelada",
};
const PRIORITY_CHIP: Record<string, string> = {
  critica: "bg-red-100 text-red-800",
  alta:    "bg-orange-100 text-orange-800",
  media:   "bg-yellow-100 text-yellow-800",
  baja:    "bg-gray-100 text-gray-700",
};

const STATUS_OPTS: { value: IOETaskStatus | ""; label: string }[] = [
  { value: "",            label: "Todas" },
  { value: "pendiente",   label: "Pendiente" },
  { value: "en_progreso", label: "En progreso" },
  { value: "bloqueada",   label: "Bloqueada" },
  { value: "completada",  label: "Completada" },
];
const PRIORITY_OPTS: { value: IOEPriority | ""; label: string }[] = [
  { value: "",        label: "Todas" },
  { value: "critica", label: "Crítica" },
  { value: "alta",    label: "Alta" },
  { value: "media",   label: "Media" },
  { value: "baja",    label: "Baja" },
];

interface Props { wsId: string }

export function IOETasks({ wsId: _wsId }: Props) {
  const [status,   setStatus]   = useState<IOETaskStatus | "">("");
  const [priority, setPriority] = useState<IOEPriority | "">("");
  const [overdue,  setOverdue]  = useState(false);
  const [owner,    setOwner]    = useState("");

  const { data: tasks = [], isLoading } = useIOETasks({
    status:   status   || undefined,
    priority: priority || undefined,
    assignedTo: owner  || undefined,
    overdue:  overdue  || undefined,
    limit: 100,
  });

  const updateTask = useUpdateIOETask();
  const today = new Date().toISOString().slice(0, 10);

  function setProgress(task: typeof tasks[0], progress: number) {
    const nextStatus: IOETaskStatus = progress >= 100 ? "completada" : progress > 0 ? "en_progreso" : "pendiente";
    updateTask.mutate({ id: task.id, actionPlanId: task.actionPlanId, progress, status: nextStatus,
      completedAt: progress >= 100 ? new Date().toISOString() : undefined });
  }

  const uniqueOwners = Array.from(new Set(tasks.map((t) => t.assignedTo).filter(Boolean))).sort();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 rounded-lg border border-sse-border bg-white px-4 py-3">
        <select value={status} onChange={(e) => setStatus(e.target.value as IOETaskStatus | "")}
          className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none">
          {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value as IOEPriority | "")}
          className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none">
          {PRIORITY_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {uniqueOwners.length > 0 && (
          <select value={owner} onChange={(e) => setOwner(e.target.value)}
            className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none">
            <option value="">Todos los responsables</option>
            {uniqueOwners.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )}
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={overdue} onChange={(e) => setOverdue(e.target.checked)} className="h-3.5 w-3.5 rounded accent-[#0F766E]" />
          <span className="text-[12px] text-sse-ink">Solo vencidas</span>
        </label>
        <span className="ml-auto self-center text-[11px] text-sse-muted">{tasks.length} tarea{tasks.length !== 1 ? "s" : ""}</span>
      </div>

      {isLoading && <p className="py-10 text-center text-[13px] text-sse-muted">Cargando tareas…</p>}
      {!isLoading && tasks.length === 0 && (
        <div className="rounded-lg border border-sse-border bg-white py-10 text-center">
          <p className="text-[13px] text-sse-muted">Sin tareas para los filtros seleccionados.</p>
        </div>
      )}

      <div className="space-y-2">
        {tasks.map((task) => {
          const isOverdue = task.plannedEnd < today && task.status !== "completada" && task.status !== "cancelada";
          return (
            <div key={task.id} className={`rounded-lg border bg-white px-4 py-3 ${task.isBlocked ? "border-red-200 bg-red-50/30" : isOverdue ? "border-orange-200" : "border-sse-border"}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${PRIORITY_CHIP[task.priority] ?? ""}`}>{task.priority}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_CHIP[task.status] ?? ""}`}>{STATUS_LABEL[task.status] ?? task.status}</span>
                    {task.isBlocked && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">Bloqueada</span>}
                    {isOverdue && !task.isBlocked && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700">Vencida</span>}
                  </div>
                  <p className="text-[13px] font-medium text-sse-ink">{task.title}</p>
                  {task.description && <p className="text-[11px] text-sse-muted mt-0.5 line-clamp-1">{task.description}</p>}
                  {task.blockReason && <p className="text-[11px] text-red-600 mt-0.5">{task.blockReason}</p>}
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-sse-muted">
                    <span>Responsable: <span className="font-medium text-sse-ink">{task.assignedTo}</span></span>
                    <span>{task.plannedStart} → {task.plannedEnd}</span>
                  </div>
                </div>

                {/* Progress control */}
                {task.status !== "completada" && task.status !== "cancelada" && !task.isBlocked && (
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    <span className="text-[11px] font-bold tabular-nums" style={{ color: TEAL }}>{task.progress}%</span>
                    <input type="range" min={0} max={100} step={10} value={task.progress}
                      onChange={(e) => setProgress(task, Number(e.target.value))}
                      className="w-20 accent-[#0F766E]" />
                  </div>
                )}
                {task.status === "completada" && (
                  <svg className="h-5 w-5 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-2 h-1 rounded-full bg-sse-border">
                <div className="h-1 rounded-full transition-all" style={{ width: `${task.progress}%`, backgroundColor: task.isBlocked ? "#EF4444" : TEAL }} />
              </div>

              {task.dependencies.length > 0 && (
                <p className="mt-1 text-[10px] text-sse-muted">Depende de: {task.dependencies.length} tarea{task.dependencies.length !== 1 ? "s" : ""}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
