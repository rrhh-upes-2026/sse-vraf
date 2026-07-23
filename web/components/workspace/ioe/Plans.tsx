"use client";

import { useState } from "react";
import { useIOEActionPlans, useUpdateIOEActionPlan, useIOECompletionEligibility, useCloseIOEPlan } from "@/hooks/useIOE";
import type { IOEPlanStatus, IOEPriority, IOEOriginEngine } from "@/types/ioe";

const TEAL = "#0F766E";

const STATUS_CHIP: Record<string, string> = {
  borrador:   "bg-gray-100 text-gray-700",
  activo:     "bg-teal-100 text-teal-800",
  en_riesgo:  "bg-orange-100 text-orange-800",
  pausado:    "bg-yellow-100 text-yellow-800",
  completado: "bg-emerald-100 text-emerald-800",
  archivado:  "bg-gray-100 text-gray-500",
};
const STATUS_LABEL: Record<string, string> = {
  borrador: "Borrador", activo: "Activo", en_riesgo: "En Riesgo",
  pausado: "Pausado", completado: "Completado", archivado: "Archivado",
};
const PRIORITY_CHIP: Record<string, string> = {
  critica: "bg-red-100 text-red-800",
  alta:    "bg-orange-100 text-orange-800",
  media:   "bg-yellow-100 text-yellow-800",
  baja:    "bg-gray-100 text-gray-700",
};
const RISK_COLOR: Record<string, string> = {
  bajo: "text-emerald-700", medio: "text-yellow-700", alto: "text-orange-700", critico: "text-red-700",
};

const STATUS_OPTIONS: { value: IOEPlanStatus | ""; label: string }[] = [
  { value: "",           label: "Todos los estados" },
  { value: "borrador",   label: "Borrador" },
  { value: "activo",     label: "Activo" },
  { value: "en_riesgo",  label: "En riesgo" },
  { value: "pausado",    label: "Pausado" },
  { value: "completado", label: "Completado" },
  { value: "archivado",  label: "Archivado" },
];
const PRIORITY_OPTIONS: { value: IOEPriority | ""; label: string }[] = [
  { value: "",        label: "Todas las prioridades" },
  { value: "critica", label: "Crítica" },
  { value: "alta",    label: "Alta" },
  { value: "media",   label: "Media" },
  { value: "baja",    label: "Baja" },
];
const ENGINE_OPTIONS: { value: IOEOriginEngine | ""; label: string }[] = [
  { value: "",        label: "Todos los orígenes" },
  { value: "iie",     label: "IIE — Inteligencia" },
  { value: "cpe",     label: "CPE — Cumplimiento" },
  { value: "eip",     label: "EIP — Ejecutivo" },
  { value: "ape",     label: "APE — Planificación" },
  { value: "aee",     label: "AEE — Ejecución" },
  { value: "manual",  label: "Manual" },
];

function ClosePanel({ planId, onClose }: { planId: string; onClose: () => void }) {
  const [note, setNote] = useState("");
  const { data: elig } = useIOECompletionEligibility(planId);
  const closeMutation = useCloseIOEPlan();

  function handleClose() {
    if (!elig?.eligible) return;
    closeMutation.mutate({ planId, verificationNote: note, closedBy: "Sistema" }, { onSuccess: onClose });
  }

  return (
    <div className="border-t border-sse-border bg-[#F0FDFA] px-4 py-3 space-y-2">
      <p className="text-[11px] font-medium text-[#0F766E]">Cierre formal del plan</p>
      {elig && !elig.eligible && (
        <div className="rounded border border-orange-200 bg-orange-50 px-3 py-2">
          <p className="text-[11px] font-medium text-orange-800 mb-0.5">No elegible aún:</p>
          {elig.reasons.map((r, i) => (
            <p key={i} className="text-[11px] text-orange-700 list-disc ml-3">· {r}</p>
          ))}
        </div>
      )}
      {elig?.eligible && (
        <>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nota de verificación (opcional)…"
            className="w-full rounded border border-sse-border px-3 py-2 text-[12px] text-sse-ink focus:outline-none resize-none"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              disabled={closeMutation.isPending}
              className="rounded bg-[#0F766E] px-3 py-1.5 text-[11px] text-white hover:bg-[#0D6A62] disabled:opacity-50 transition-colors"
            >
              {closeMutation.isPending ? "Cerrando…" : "Confirmar cierre"}
            </button>
            <button onClick={onClose} className="rounded border border-sse-border px-3 py-1.5 text-[11px] text-sse-muted hover:text-sse-ink transition-colors">
              Cancelar
            </button>
          </div>
        </>
      )}
    </div>
  );
}

interface Props { wsId: string }

export function IOEPlans({ wsId: _wsId }: Props) {
  const [status,   setStatus]   = useState<IOEPlanStatus | "">("");
  const [priority, setPriority] = useState<IOEPriority | "">("");
  const [engine,   setEngine]   = useState<IOEOriginEngine | "">("");
  const [overdue,  setOverdue]  = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [closing,  setClosing]  = useState<string | null>(null);

  const { data: plans = [], isLoading } = useIOEActionPlans({
    status:  status  || undefined,
    priority: priority || undefined,
    originEngine: engine || undefined,
    overdue: overdue || undefined,
    limit: 50,
  });

  const updatePlan = useUpdateIOEActionPlan();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 rounded-lg border border-sse-border bg-white px-4 py-3">
        <select value={status} onChange={(e) => setStatus(e.target.value as IOEPlanStatus | "")}
          className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none">
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value as IOEPriority | "")}
          className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none">
          {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={engine} onChange={(e) => setEngine(e.target.value as IOEOriginEngine | "")}
          className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none">
          {ENGINE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={overdue} onChange={(e) => setOverdue(e.target.checked)} className="h-3.5 w-3.5 rounded accent-[#0F766E]" />
          <span className="text-[12px] text-sse-ink">Solo vencidos</span>
        </label>
        <span className="ml-auto self-center text-[11px] text-sse-muted">{plans.length} plan{plans.length !== 1 ? "es" : ""}</span>
      </div>

      {isLoading && <p className="py-10 text-center text-[13px] text-sse-muted">Cargando planes…</p>}
      {!isLoading && plans.length === 0 && (
        <div className="rounded-lg border border-sse-border bg-white py-10 text-center">
          <p className="text-[13px] text-sse-muted">Sin planes para los filtros seleccionados.</p>
        </div>
      )}

      <div className="space-y-2">
        {plans.map((plan) => {
          const open = expanded === plan.id;
          return (
            <div key={plan.id} className="rounded-lg border border-sse-border bg-white overflow-hidden">
              <button className="w-full flex items-start gap-3 px-4 py-3 text-left" onClick={() => setExpanded(open ? null : plan.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${PRIORITY_CHIP[plan.priority] ?? ""}`}>{plan.priority}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_CHIP[plan.status] ?? ""}`}>{STATUS_LABEL[plan.status] ?? plan.status}</span>
                    <span className="text-[10px] text-sse-muted uppercase">{plan.originEngine}</span>
                    <span className={`ml-auto text-[10px] font-medium ${RISK_COLOR[plan.riskLevel] ?? ""}`}>riesgo {plan.riskLevel}</span>
                  </div>
                  <p className="text-[13px] font-medium text-sse-ink">{plan.title}</p>
                  <p className="text-[11px] text-sse-muted mt-0.5">{plan.owner} · {plan.organizationalUnitLabel}</p>
                </div>
                <div className="shrink-0 text-right mr-2 space-y-1">
                  <p className="text-[14px] font-bold tabular-nums" style={{ color: TEAL }}>{plan.progress}%</p>
                  <p className="text-[10px] text-sse-muted">{plan.completedTasks}/{plan.taskCount} tareas</p>
                </div>
                <svg className={`mt-1 h-4 w-4 shrink-0 text-sse-muted transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Progress bar */}
              <div className="px-4 pb-2">
                <div className="h-1 rounded-full bg-sse-border">
                  <div className="h-1 rounded-full transition-all" style={{ width: `${plan.progress}%`, backgroundColor: TEAL }} />
                </div>
              </div>

              {open && (
                <div className="border-t border-sse-border px-4 py-3 space-y-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="rounded border border-sse-border bg-sse-surface px-3 py-2">
                      <p className="text-[10px] text-sse-muted mb-0.5">Objetivo</p>
                      <p className="text-[11px] text-sse-ink">{plan.objective}</p>
                    </div>
                    <div className="rounded border border-sse-border bg-sse-surface px-3 py-2">
                      <p className="text-[10px] text-sse-muted mb-0.5">Impacto esperado</p>
                      <p className="text-[11px] text-sse-ink">{plan.expectedImpact}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Hitos",   total: plan.milestoneCount, done: plan.completedMilestones },
                      { label: "Tareas",  total: plan.taskCount,      done: plan.completedTasks },
                      { label: "Vencidas", total: plan.overdueTasks,  done: plan.blockedTasks, isRisk: true },
                    ].map((s) => (
                      <div key={s.label} className="rounded border border-sse-border bg-white px-3 py-2 text-center">
                        <p className={`text-[16px] font-bold tabular-nums ${s.isRisk && s.total > 0 ? "text-red-600" : ""}`} style={!s.isRisk || s.total === 0 ? { color: TEAL } : {}}>
                          {s.isRisk ? s.total : `${s.done}/${s.total}`}
                        </p>
                        <p className="text-[10px] text-sse-muted">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-[10px] text-sse-muted">
                    <span>Inicio: <span className="font-medium text-sse-ink">{plan.startDate}</span></span>
                    <span>Meta: <span className="font-medium text-sse-ink">{plan.targetDate}</span></span>
                    {plan.completionDate && <span>Cierre: <span className="font-medium text-emerald-700">{plan.completionDate}</span></span>}
                  </div>

                  {plan.status !== "completado" && plan.status !== "archivado" && (
                    <div className="flex gap-2 flex-wrap">
                      {(["activo", "en_riesgo", "pausado"] as const).map((s) => s !== plan.status && (
                        <button key={s} onClick={() => updatePlan.mutate({ id: plan.id, status: s })}
                          className="rounded border border-sse-border px-2.5 py-1 text-[11px] text-sse-muted hover:text-sse-ink capitalize transition-colors">
                          → {STATUS_LABEL[s]}
                        </button>
                      ))}
                      <button onClick={() => setClosing(closing === plan.id ? null : plan.id)}
                        className="rounded border border-teal-300 px-2.5 py-1 text-[11px] text-[#0F766E] hover:bg-teal-50 transition-colors">
                        Cerrar plan
                      </button>
                    </div>
                  )}
                </div>
              )}

              {closing === plan.id && (
                <ClosePanel planId={plan.id} onClose={() => setClosing(null)} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
