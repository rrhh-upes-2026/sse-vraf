"use client";

import { useAUEDashboard } from "@/hooks/useAUE";

const PURPLE = "#7C3AED";

interface Props { wsId: string }

export function WorkspaceAUE({ wsId: _wsId }: Props) {
  const { data: dash, isLoading } = useAUEDashboard();

  if (isLoading) {
    return <div className="flex items-center justify-center py-16 text-[13px] text-sse-muted">Cargando motor de automatización…</div>;
  }

  if (!dash) {
    return (
      <div className="rounded-lg border border-sse-border bg-white py-16 text-center">
        <p className="text-[14px] text-sse-muted">Sin eventos registrados.</p>
        <p className="text-[12px] text-sse-muted mt-1">Los eventos se generan automáticamente desde cualquier motor del ecosistema.</p>
      </div>
    );
  }

  // Inline sparkline SVG for events by day
  const days = dash.eventsByDay;
  const maxCount = Math.max(...days.map((d) => d.count), 1);
  const W = 280;
  const H = 48;
  const pts = days.map((d, i) => ({
    x: days.length > 1 ? (i / (days.length - 1)) * W : W / 2,
    y: H - (d.count / maxCount) * (H - 4) - 2,
  }));
  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = pts.length > 0
    ? `M${pts[0].x},${H} ` + pts.map((p) => `L${p.x},${p.y}`).join(" ") + ` L${pts[pts.length - 1].x},${H} Z`
    : "";

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {[
          { label: "Total eventos",    value: dash.totalEvents,       color: PURPLE },
          { label: "Hoy",              value: dash.eventsToday,       color: PURPLE },
          { label: "Pendientes",       value: dash.pendingEvents,     color: "#D97706" },
          { label: "Procesados",       value: dash.processedEvents,   color: "#059669" },
          { label: "Fallidos",         value: dash.failedEvents,      color: "#DC2626" },
          { label: "Reglas activas",   value: dash.activeRules,       color: PURPLE },
          { label: "Cola",             value: dash.queueSize,         color: "#EA580C" },
          { label: "Reintentos",       value: dash.retryCount,        color: "#7C3AED" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-sse-border bg-white px-3 py-3 text-center">
            <p className="text-xl font-bold tabular-nums" style={{ color: kpi.color }}>{kpi.value}</p>
            <p className="text-[10px] text-sse-muted mt-0.5 leading-tight">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Events by day chart */}
        <div className="rounded-lg border border-sse-border bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] font-medium text-sse-ink">Eventos por día</p>
            <p className="text-[11px] text-sse-muted">{dash.avgProcessingTime}ms promedio</p>
          </div>
          {days.length > 0 ? (
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
              <defs>
                <linearGradient id="aue-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PURPLE} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={PURPLE} stopOpacity="0.01" />
                </linearGradient>
              </defs>
              {area && <path d={area} fill="url(#aue-grad)" />}
              {pts.length > 1 && (
                <polyline points={polyline} fill="none" stroke={PURPLE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              )}
              {pts.map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="2.5" fill={PURPLE} />
              ))}
            </svg>
          ) : (
            <p className="text-[12px] text-sse-muted py-4 text-center">Sin datos de eventos.</p>
          )}
          <div className="flex justify-between mt-1">
            {days.length > 0 && <span className="text-[9px] text-sse-muted">{days[0]?.date}</span>}
            {days.length > 1 && <span className="text-[9px] text-sse-muted">{days[days.length - 1]?.date}</span>}
          </div>
        </div>

        {/* Top rules */}
        <div className="rounded-lg border border-sse-border bg-white p-5">
          <p className="text-[12px] font-medium text-sse-ink mb-3">Top reglas ejecutadas</p>
          {dash.topRules.length === 0 ? (
            <p className="text-[12px] text-sse-muted">Sin ejecuciones registradas.</p>
          ) : (
            <div className="space-y-2">
              {dash.topRules.map((r, i) => {
                const maxC = dash.topRules[0]?.count || 1;
                const pct = Math.round((r.count / maxC) * 100);
                return (
                  <div key={r.ruleId} className="flex items-center gap-3">
                    <span className="w-4 text-[10px] tabular-nums text-sse-muted shrink-0">{i + 1}</span>
                    <span className="w-36 shrink-0 text-[11px] text-sse-ink truncate">{r.ruleName}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-sse-border">
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: PURPLE }} />
                    </div>
                    <span className="w-8 text-right text-[10px] tabular-nums text-sse-muted shrink-0">{r.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent events */}
        <div className="rounded-lg border border-sse-border bg-white p-5">
          <p className="text-[12px] font-medium text-sse-ink mb-3">Eventos recientes</p>
          {dash.recentEvents.length === 0 ? (
            <p className="text-[12px] text-sse-muted">Sin eventos recientes.</p>
          ) : (
            <div className="space-y-1.5">
              {dash.recentEvents.map((e) => (
                <div key={e.id} className="flex items-center gap-2 py-1 border-b border-sse-border last:border-0">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    e.status === "procesado" ? "bg-emerald-500"
                      : e.status === "fallido" ? "bg-red-500"
                      : e.status === "procesando" ? "bg-yellow-500"
                      : "bg-gray-300"
                  }`} />
                  <span className="text-[10px] text-sse-muted font-mono shrink-0 uppercase">{e.sourceEngine}</span>
                  <span className="flex-1 text-[11px] text-sse-ink truncate">{e.eventType}</span>
                  <span className="text-[9px] text-sse-muted shrink-0">{e.timestamp.slice(11, 16)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent executions */}
        <div className="rounded-lg border border-sse-border bg-white p-5">
          <p className="text-[12px] font-medium text-sse-ink mb-3">Ejecuciones recientes</p>
          {dash.recentExecutions.length === 0 ? (
            <p className="text-[12px] text-sse-muted">Sin ejecuciones registradas.</p>
          ) : (
            <div className="space-y-1.5">
              {dash.recentExecutions.map((ex) => (
                <div key={ex.id} className="flex items-center gap-2 py-1 border-b border-sse-border last:border-0">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    ex.status === "exitoso" ? "bg-emerald-500"
                      : ex.status === "fallido" ? "bg-red-500"
                      : ex.status === "reintentando" ? "bg-yellow-500"
                      : "bg-gray-300"
                  }`} />
                  <span className="flex-1 text-[11px] text-sse-ink truncate">{ex.ruleName}</span>
                  {ex.duration != null && (
                    <span className="text-[9px] tabular-nums text-sse-muted shrink-0">{ex.duration}ms</span>
                  )}
                  <span className="text-[9px] text-sse-muted shrink-0">{ex.startedAt.slice(11, 16)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
