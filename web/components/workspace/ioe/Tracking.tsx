"use client";

import { useIOEActionPlans, useIOETasks, useIOEMetrics } from "@/hooks/useIOE";

const TEAL = "#0F766E";

interface Props { wsId: string }

export function IOETracking({ wsId: _wsId }: Props) {
  const { data: plans  = [], isLoading: plansLoading }   = useIOEActionPlans({ limit: 50 });
  const { data: tasks  = [], isLoading: tasksLoading }   = useIOETasks({ limit: 200 });
  const { data: metrics,     isLoading: metricsLoading } = useIOEMetrics();

  const isLoading = plansLoading || tasksLoading || metricsLoading;
  const today = new Date().toISOString().slice(0, 10);

  // Compliance by owner
  const ownerMap: Record<string, { total: number; done: number; overdue: number }> = {};
  tasks.forEach((t) => {
    if (!t.assignedTo) return;
    if (!ownerMap[t.assignedTo]) ownerMap[t.assignedTo] = { total: 0, done: 0, overdue: 0 };
    ownerMap[t.assignedTo].total++;
    if (t.status === "completada") ownerMap[t.assignedTo].done++;
    if (t.status !== "completada" && t.status !== "cancelada" && t.plannedEnd < today) ownerMap[t.assignedTo].overdue++;
  });

  const ownerRows = Object.entries(ownerMap).map(([owner, d]) => ({
    owner,
    ...d,
    rate: d.total > 0 ? Math.round((d.done / d.total) * 100) : 100,
  })).sort((a, b) => a.rate - b.rate);

  // Plans by status
  const statusCount: Record<string, number> = {};
  plans.forEach((p) => { statusCount[p.status] = (statusCount[p.status] || 0) + 1; });

  const statusItems = [
    { key: "activo",     label: "Activo",     color: TEAL },
    { key: "en_riesgo",  label: "En riesgo",  color: "#EA580C" },
    { key: "pausado",    label: "Pausado",    color: "#D97706" },
    { key: "completado", label: "Completado", color: "#059669" },
    { key: "borrador",   label: "Borrador",   color: "#6B7280" },
  ];
  const totalPlans = plans.length || 1;

  return (
    <div className="space-y-6">
      {isLoading && <p className="py-10 text-center text-[13px] text-sse-muted">Calculando seguimiento…</p>}

      {!isLoading && (
        <>
          {/* Metrics row */}
          {metrics && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "T. cierre prom.",    value: `${metrics.avgClosureTime}d`,     sub: "días promedio" },
                { label: "Desviación prom.",   value: `${metrics.dateDeviationAvg}d`,   sub: "días de retraso" },
                { label: "Índice ejecución",   value: `${metrics.executionIndex}%`,     sub: "tareas completadas" },
                { label: "Índice de retraso",  value: `${metrics.delayIndex}%`,         sub: "tareas vencidas" },
              ].map((m) => (
                <div key={m.label} className="rounded-lg border border-sse-border bg-white px-4 py-3 text-center">
                  <p className="text-[22px] font-bold tabular-nums" style={{ color: TEAL }}>{m.value}</p>
                  <p className="text-[11px] font-medium text-sse-ink">{m.label}</p>
                  <p className="text-[10px] text-sse-muted">{m.sub}</p>
                </div>
              ))}
            </div>
          )}

          {/* Plans by status */}
          <div className="rounded-lg border border-sse-border bg-white p-5">
            <p className="text-[12px] font-medium text-sse-ink mb-3">Distribución de planes</p>
            <div className="space-y-2.5">
              {statusItems.map((s) => {
                const count = statusCount[s.key] || 0;
                const pct   = Math.round((count / totalPlans) * 100);
                return (
                  <div key={s.key} className="flex items-center gap-3">
                    <span className="w-20 shrink-0 text-[11px] text-sse-ink">{s.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-sse-border">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: s.color }} />
                    </div>
                    <span className="w-10 text-right text-[11px] tabular-nums text-sse-muted">{count}</span>
                    <span className="w-8 text-right text-[10px] tabular-nums text-sse-muted">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compliance by owner */}
          {ownerRows.length > 0 && (
            <div className="rounded-lg border border-sse-border bg-white p-5">
              <p className="text-[12px] font-medium text-sse-ink mb-3">Cumplimiento por responsable</p>
              <div className="space-y-2">
                {ownerRows.map((o) => (
                  <div key={o.owner} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 text-[11px] text-sse-ink truncate">{o.owner}</span>
                    <div className="flex-1 h-2 rounded-full bg-sse-border">
                      <div className="h-2 rounded-full transition-all" style={{
                        width: `${o.rate}%`,
                        backgroundColor: o.rate >= 80 ? "#059669" : o.rate >= 60 ? "#D97706" : "#DC2626",
                      }} />
                    </div>
                    <span className="w-8 text-right text-[11px] font-medium tabular-nums text-sse-ink">{o.rate}%</span>
                    <span className="text-[10px] text-sse-muted shrink-0">{o.done}/{o.total}</span>
                    {o.overdue > 0 && (
                      <span className="shrink-0 rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-medium text-red-700">{o.overdue} vencidas</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overdue plans */}
          {plans.filter((p) => p.status !== "completado" && p.status !== "archivado" && p.targetDate < today).length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-5">
              <p className="text-[12px] font-medium text-red-800 mb-2">
                Planes vencidos
                <span className="ml-2 rounded-full bg-red-200 px-1.5 py-0.5 text-[10px] text-red-800">
                  {plans.filter((p) => p.status !== "completado" && p.status !== "archivado" && p.targetDate < today).length}
                </span>
              </p>
              <div className="space-y-1.5">
                {plans.filter((p) => p.status !== "completado" && p.status !== "archivado" && p.targetDate < today).map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-[12px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                    <span className="flex-1 text-red-800 truncate">{p.title}</span>
                    <span className="shrink-0 tabular-nums text-red-600 text-[11px]">{p.targetDate}</span>
                    <span className="shrink-0 text-[10px] text-red-500">{p.owner}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
