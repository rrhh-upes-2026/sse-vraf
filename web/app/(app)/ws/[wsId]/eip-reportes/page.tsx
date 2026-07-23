"use client";

import { useEIPDashboard, useEIPScorecard } from "@/hooks/useEIP";

export default function EIPReportesPage() {
  const year = new Date().getFullYear();
  const { data: dash, isLoading: loadingDash } = useEIPDashboard(year);
  const { data: scorecard, isLoading: loadingScore } = useEIPScorecard();

  const isLoading = loadingDash || loadingScore;

  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold text-sse-ink">Reportes Ejecutivos</h1>
      <p className="text-[13px] text-sse-muted">
        Resumen consolidado de la plataforma ejecutiva. Exportable a PDF desde el menú del navegador (Archivo → Imprimir).
      </p>

      {isLoading ? (
        <p className="text-[13px] text-sse-muted text-center py-8">Generando reporte...</p>
      ) : !dash ? (
        <div className="rounded-lg border border-sse-border bg-white py-12 text-center">
          <p className="text-[14px] text-sse-muted">Sin datos para generar reporte.</p>
          <p className="text-[12px] text-sse-muted mt-1">Ejecute un cálculo CPE para generar datos ejecutivos.</p>
        </div>
      ) : (
        <div className="space-y-6 print:space-y-4">
          {/* Cover */}
          <div className="rounded-xl border border-sse-border bg-[#1D4ED8] p-8 text-white">
            <p className="text-[11px] uppercase tracking-widest text-white/60 mb-2">Reporte Ejecutivo Institucional</p>
            <h2 className="text-2xl font-bold mb-1">Executive Intelligence Platform</h2>
            <p className="text-[13px] text-white/70">Año {year} — Generado automáticamente</p>
            <div className="mt-6 flex items-center gap-8">
              <div>
                <p className="text-[11px] text-white/60">Puntaje Global</p>
                <p className="text-5xl font-bold tabular-nums">{dash.overallScore}</p>
              </div>
              <div>
                <p className="text-[11px] text-white/60">Estado</p>
                <p className="text-xl font-semibold">{dash.semaforo}</p>
              </div>
            </div>
          </div>

          {/* KPIs summary */}
          <div className="rounded-lg border border-sse-border bg-white p-5">
            <h3 className="text-[14px] font-semibold text-sse-ink mb-4">KPIs Estratégicos</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {dash.kpis.map((kpi) => (
                <div key={kpi.id} className="rounded border border-sse-border p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-sse-muted mb-1">{kpi.label}</p>
                  <p className="text-2xl font-bold tabular-nums text-sse-ink">{kpi.value}{kpi.unit === "%" ? "%" : ""}</p>
                  <p className="text-[10px] text-sse-muted">{kpi.semaforo}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scorecard summary */}
          {scorecard && (
            <div className="rounded-lg border border-sse-border bg-white p-5">
              <h3 className="text-[14px] font-semibold text-sse-ink mb-1">Balanced Scorecard</h3>
              <p className="text-[12px] text-sse-muted mb-4">Puntaje BSC Global: <span className="font-bold text-[#1D4ED8]">{scorecard.overallScore}/100</span></p>
              {(["financiera", "procesos", "aprendizaje", "clientes"] as const).map((persp) => {
                const items = scorecard.perspectives[persp] ?? [];
                const avg = items.length > 0
                  ? Math.round(items.reduce((s, i) => s + i.score, 0) / items.length)
                  : 0;
                const LABEL: Record<string, string> = {
                  financiera:  "Financiera",
                  procesos:    "Procesos Internos",
                  aprendizaje: "Aprendizaje y Crecimiento",
                  clientes:    "Clientes / Partes Interesadas",
                };
                return (
                  <div key={persp} className="flex items-center gap-3 border-b border-sse-border py-2 last:border-0">
                    <p className="flex-1 text-[12px] text-sse-ink">{LABEL[persp]}</p>
                    <div className="w-32 h-1.5 rounded-full bg-sse-border">
                      <div className="h-1.5 rounded-full bg-[#1D4ED8]" style={{ width: `${avg}%` }} />
                    </div>
                    <p className="text-[12px] font-medium tabular-nums text-sse-ink w-10 text-right">{avg}%</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Alerts summary */}
          {dash.alerts.length > 0 && (
            <div className="rounded-lg border border-sse-border bg-white p-5">
              <h3 className="text-[14px] font-semibold text-sse-ink mb-3">
                Alertas Ejecutivas
                <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] text-red-700">{dash.alerts.length}</span>
              </h3>
              <div className="space-y-2">
                {dash.alerts.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-start gap-2 text-[12px]">
                    <span className={`mt-0.5 shrink-0 h-2 w-2 rounded-full ${a.severity === "critica" ? "bg-red-500" : a.severity === "alta" ? "bg-orange-400" : "bg-yellow-400"}`} />
                    <p className="text-sse-ink"><span className="font-medium">{a.title}</span> — {a.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brechas */}
          {dash.criticalBrechas.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-5">
              <h3 className="text-[14px] font-semibold text-red-800 mb-3">Brechas Críticas</h3>
              <div className="space-y-1.5">
                {dash.criticalBrechas.map((b, i) => (
                  <p key={i} className="text-[12px] text-red-700 border-l-2 border-red-400 pl-2">{b.descripcion}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
