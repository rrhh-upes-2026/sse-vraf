"use client";

import { useIOEDashboard } from "@/hooks/useIOE";

const TEAL = "#0F766E";

interface Props { wsId: string }

export function WorkspaceIOE({ wsId: _wsId }: Props) {
  const { data: dash, isLoading } = useIOEDashboard();

  if (isLoading) {
    return <div className="flex items-center justify-center py-16 text-[13px] text-sse-muted">Cargando orquestación institucional…</div>;
  }

  if (!dash) {
    return (
      <div className="rounded-lg border border-sse-border bg-white py-16 text-center">
        <p className="text-[14px] text-sse-muted">Sin planes de acción registrados.</p>
        <p className="text-[12px] text-sse-muted mt-1">Genere un plan desde un diagnóstico IIE, brecha CPE o alerta EIP.</p>
      </div>
    );
  }

  const metricsItems = [
    { label: "T. cierre promedio", value: `${dash.metrics.avgClosureTime}d`,   sub: "días" },
    { label: "Desviación promedio", value: `${dash.metrics.dateDeviationAvg}d`, sub: "días de retraso" },
    { label: "Índice de ejecución", value: `${dash.metrics.executionIndex}%`,  sub: "tareas completadas" },
    { label: "Índice de retraso",   value: `${dash.metrics.delayIndex}%`,      sub: "tareas vencidas" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Planes activos",    value: dash.activePlans,   color: TEAL },
          { label: "Planes críticos",   value: dash.criticalPlans, color: "#DC2626" },
          { label: "Avance promedio",   value: `${dash.avgProgress}%`, color: TEAL },
          { label: "Planes vencidos",   value: dash.overduePlans,  color: "#EA580C" },
          { label: "Tareas atrasadas",  value: dash.lateTasks,     color: "#D97706" },
          { label: "Tareas bloqueadas", value: dash.blockedTasks,  color: "#7C3AED" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-sse-border bg-white px-3 py-3 text-center">
            <p className="text-2xl font-bold tabular-nums" style={{ color: kpi.color }}>{kpi.value}</p>
            <p className="text-[10px] text-sse-muted mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Metrics */}
      <div className="rounded-lg border border-sse-border bg-white p-5">
        <p className="text-[12px] font-medium text-sse-ink mb-3">Métricas de Ejecución</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {metricsItems.map((m) => (
            <div key={m.label} className="rounded border border-sse-border bg-sse-surface px-3 py-2.5 text-center">
              <p className="text-[18px] font-bold tabular-nums" style={{ color: TEAL }}>{m.value}</p>
              <p className="text-[10px] text-sse-muted">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent plans */}
        <div className="rounded-lg border border-sse-border bg-white p-5">
          <p className="text-[12px] font-medium text-sse-ink mb-3">Planes Recientes</p>
          {dash.recentPlans.length === 0 ? (
            <p className="text-[12px] text-sse-muted">Sin planes recientes.</p>
          ) : (
            <div className="space-y-2">
              {dash.recentPlans.map((plan) => (
                <div key={plan.id} className="rounded border border-sse-border px-3 py-2.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-medium capitalize text-sse-muted">{plan.originEngine}</span>
                    <span className={`text-[10px] font-medium px-1.5 rounded-full ${
                      plan.status === "en_riesgo" ? "bg-orange-100 text-orange-800"
                        : plan.status === "completado" ? "bg-emerald-100 text-emerald-800"
                        : "bg-teal-100 text-teal-800"
                    }`}>{plan.status.replace(/_/g, " ")}</span>
                    <span className="ml-auto text-[10px] text-sse-muted">{plan.targetDate}</span>
                  </div>
                  <p className="text-[12px] font-medium text-sse-ink line-clamp-1">{plan.title}</p>
                  <div className="mt-1.5 h-1 rounded-full bg-sse-border">
                    <div className="h-1 rounded-full" style={{ width: `${plan.progress}%`, backgroundColor: TEAL }} />
                  </div>
                  <p className="text-[10px] text-sse-muted mt-0.5 tabular-nums">{plan.progress}% completado</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Urgent milestones */}
        <div className="rounded-lg border border-sse-border bg-white p-5">
          <p className="text-[12px] font-medium text-sse-ink mb-3">Hitos Próximos</p>
          {dash.urgentMilestones.length === 0 ? (
            <p className="text-[12px] text-emerald-600">Sin hitos próximos pendientes.</p>
          ) : (
            <div className="space-y-2">
              {dash.urgentMilestones.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded border border-sse-border px-3 py-2">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${m.status === "retrasado" ? "bg-red-400" : "bg-teal-400"}`} />
                  <p className="flex-1 text-[12px] text-sse-ink line-clamp-1">{m.title}</p>
                  <span className="shrink-0 text-[11px] tabular-nums text-sse-muted">{m.plannedDate}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Owner load */}
      {dash.ownerLoad.length > 0 && (
        <div className="rounded-lg border border-sse-border bg-white p-5">
          <p className="text-[12px] font-medium text-sse-ink mb-3">Carga por Responsable</p>
          <div className="space-y-2">
            {dash.ownerLoad.slice(0, 8).map((o) => (
              <div key={o.owner} className="flex items-center gap-3">
                <p className="w-32 shrink-0 text-[11px] text-sse-ink truncate">{o.owner}</p>
                <div className="flex-1 h-1.5 rounded-full bg-sse-border">
                  <div className="h-1.5 rounded-full" style={{ width: `${o.complianceRate}%`, backgroundColor: TEAL }} />
                </div>
                <span className="shrink-0 w-8 text-right text-[11px] tabular-nums text-sse-muted">{o.complianceRate}%</span>
                <span className="shrink-0 text-[10px] text-sse-muted">{o.activePlans}p · {o.activeTasks}t</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unit load */}
      {dash.unitLoad.length > 0 && (
        <div className="rounded-lg border border-sse-border bg-white p-5">
          <p className="text-[12px] font-medium text-sse-ink mb-3">Carga por Unidad</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {dash.unitLoad.map((u) => (
              <div key={u.unit} className="rounded border border-sse-border bg-sse-surface px-3 py-2">
                <p className="text-[11px] font-medium text-sse-ink truncate">{u.unit}</p>
                <p className="text-[10px] text-sse-muted">{u.planCount} plan{u.planCount !== 1 ? "es" : ""} · {u.taskCount} tareas</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
