"use client";

import { useEIPDashboard } from "@/hooks/useEIP";
import type { EIPKPICard, EIPRankingItem, EIPAlert, EIPHeatCell } from "@/types/eip";

const SEMAFORO_BG: Record<string, string> = {
  Verde:    "bg-emerald-500",
  Amarillo: "bg-yellow-400",
  Naranja:  "bg-orange-400",
  Rojo:     "bg-red-500",
};

const SEMAFORO_TEXT: Record<string, string> = {
  Verde:    "text-emerald-700",
  Amarillo: "text-yellow-700",
  Naranja:  "text-orange-700",
  Rojo:     "text-red-700",
};

const SEMAFORO_CHIP: Record<string, string> = {
  Verde:    "bg-emerald-100 text-emerald-800",
  Amarillo: "bg-yellow-100 text-yellow-800",
  Naranja:  "bg-orange-100 text-orange-800",
  Rojo:     "bg-red-100 text-red-800",
};

const ALERT_SEV: Record<string, string> = {
  critica:    "border-l-red-500 bg-red-50",
  alta:       "border-l-orange-400 bg-orange-50",
  media:      "border-l-yellow-400 bg-yellow-50",
  informativa:"border-l-blue-400 bg-blue-50",
};

const TREND_ICON: Record<string, string> = {
  up:     "↑",
  down:   "↓",
  stable: "→",
};

const TREND_COLOR: Record<string, string> = {
  up:     "text-emerald-600",
  down:   "text-red-500",
  stable: "text-sse-muted",
};

function KPICard({ kpi }: { kpi: EIPKPICard }) {
  return (
    <div className="rounded-lg border border-sse-border bg-white p-4">
      <div className="flex items-start justify-between">
        <p className="text-[11px] uppercase tracking-wide text-sse-muted">{kpi.label}</p>
        <span className={`text-[11px] font-medium ${SEMAFORO_TEXT[kpi.semaforo] ?? ""}`}>
          {TREND_ICON[kpi.trend]} {kpi.trendValue > 0 ? `${kpi.trendValue}%` : ""}
        </span>
      </div>
      <p className={`text-3xl font-bold tabular-nums mt-1 ${SEMAFORO_TEXT[kpi.semaforo] ?? "text-sse-ink"}`}>
        {kpi.value}{kpi.unit === "%" ? "%" : ""}
      </p>
      {kpi.unit !== "%" && <p className="text-[11px] text-sse-muted mt-0.5">{kpi.unit}</p>}
      {kpi.description && <p className="text-[11px] text-sse-muted mt-1">{kpi.description}</p>}
    </div>
  );
}

function RankingMini({ items, label }: { items: EIPRankingItem[]; label: string }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-sse-muted mb-2">{label}</p>
      <div className="space-y-1.5">
        {items.slice(0, 5).map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <span className="text-[11px] text-sse-muted w-4 text-right tabular-nums">{item.rank}.</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] text-sse-ink truncate">{item.label}</span>
                <span className={`text-[11px] font-medium tabular-nums ${SEMAFORO_TEXT[item.semaforo] ?? ""}`}>
                  {item.score}%
                </span>
              </div>
              <div className="h-1 rounded-full bg-sse-border mt-0.5">
                <div
                  className={`h-1 rounded-full ${SEMAFORO_BG[item.semaforo] ?? "bg-sse-muted"}`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeatCellGrid({ cells }: { cells: EIPHeatCell[] }) {
  if (cells.length === 0) return null;
  const HEAT_BG: Record<string, string> = {
    Verde:    "bg-emerald-400",
    Amarillo: "bg-yellow-300",
    Naranja:  "bg-orange-400",
    Rojo:     "bg-red-400",
  };
  return (
    <div className="grid grid-cols-4 gap-1">
      {cells.map((cell) => (
        <div
          key={cell.id}
          className={`rounded p-2 ${HEAT_BG[cell.semaforo] ?? "bg-sse-border"}`}
          title={`${cell.label}: ${cell.score}%`}
        >
          <p className="text-[9px] text-white font-medium truncate">{cell.label}</p>
          <p className="text-[11px] text-white font-bold tabular-nums">{cell.score}%</p>
        </div>
      ))}
    </div>
  );
}

interface Props {
  wsId: string;
}

export function WorkspaceEIP({ wsId: _wsId }: Props) {
  const year = new Date().getFullYear();
  const { data: dash, isLoading } = useEIPDashboard(year);

  if (isLoading) {
    return <div className="flex items-center justify-center py-16 text-[13px] text-sse-muted">Cargando inteligencia ejecutiva...</div>;
  }

  if (!dash) {
    return (
      <div className="rounded-lg border border-sse-border bg-white py-16 text-center">
        <p className="text-[14px] text-sse-muted">Sin datos ejecutivos disponibles.</p>
        <p className="text-[12px] text-sse-muted mt-1">Ejecute un cálculo de cumplimiento en el módulo CPE para generar datos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score principal */}
      <div className="rounded-xl border border-sse-border bg-white p-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-wide text-sse-muted mb-1">Puntaje Institucional</p>
            <p className={`text-6xl font-bold tabular-nums ${SEMAFORO_TEXT[dash.semaforo] ?? "text-sse-ink"}`}>
              {dash.overallScore}
            </p>
            <p className="text-[12px] text-sse-muted">/ 100</p>
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-[12px] font-medium ${SEMAFORO_CHIP[dash.semaforo] ?? ""}`}>
              {dash.semaforo}
            </span>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {dash.kpis.map((kpi) => <KPICard key={kpi.id} kpi={kpi} />)}
          </div>
        </div>
      </div>

      {/* Rankings + Heat Map */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-sse-border bg-white p-5 space-y-5">
          <RankingMini items={dash.topUnits}     label="Top Unidades" />
          <RankingMini items={dash.topProcesses} label="Top Procesos" />
        </div>
        <div className="rounded-lg border border-sse-border bg-white p-5">
          <p className="text-[11px] uppercase tracking-wide text-sse-muted mb-3">Mapa de Calor — Procesos</p>
          <HeatCellGrid cells={dash.heatMapSummary} />
          {dash.heatMapSummary.length === 0 && (
            <p className="text-[12px] text-sse-muted text-center py-4">Sin datos de proceso disponibles.</p>
          )}
        </div>
        <div className="rounded-lg border border-sse-border bg-white p-5">
          <p className="text-[11px] uppercase tracking-wide text-sse-muted mb-3">Top Indicadores</p>
          <RankingMini items={dash.topIndicators} label="" />
        </div>
      </div>

      {/* Alerts + Risks + Brechas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Alerts */}
        <div className="rounded-lg border border-sse-border bg-white p-5">
          <p className="text-[12px] font-medium text-sse-ink mb-3">
            Alertas Ejecutivas
            {dash.alerts.length > 0 && (
              <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] text-red-700">
                {dash.alerts.length}
              </span>
            )}
          </p>
          {dash.alerts.length === 0 ? (
            <p className="text-[12px] text-emerald-600">Sin alertas activas.</p>
          ) : (
            <div className="space-y-2">
              {dash.alerts.map((a: EIPAlert) => (
                <div key={a.id} className={`rounded border-l-4 border border-sse-border px-3 py-2 ${ALERT_SEV[a.severity] ?? ""}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] uppercase font-medium text-sse-muted">{a.severity}</span>
                  </div>
                  <p className="text-[12px] font-medium text-sse-ink">{a.title}</p>
                  <p className="text-[11px] text-sse-muted">{a.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Brechas + Risks */}
        <div className="space-y-4">
          <div className="rounded-lg border border-sse-border bg-white p-5">
            <p className="text-[12px] font-medium text-sse-ink mb-3">Brechas Críticas</p>
            {dash.criticalBrechas.length === 0 ? (
              <p className="text-[12px] text-emerald-600">Sin brechas críticas.</p>
            ) : (
              <div className="space-y-1.5">
                {dash.criticalBrechas.map((b, i) => (
                  <div key={i} className="text-[12px] text-sse-ink border-l-2 border-red-400 pl-2">
                    {b.descripcion}
                  </div>
                ))}
              </div>
            )}
          </div>

          {dash.risks.length > 0 && (
            <div className="rounded-lg border border-sse-border bg-white p-5">
              <p className="text-[12px] font-medium text-sse-ink mb-3">Riesgos Identificados</p>
              <div className="space-y-1.5">
                {dash.risks.map((r) => (
                  <div key={r.id} className="flex items-start gap-2 text-[12px]">
                    <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${r.level === "critico" ? "bg-red-500" : r.level === "alto" ? "bg-orange-400" : "bg-yellow-400"}`} />
                    <p className="text-sse-ink">{r.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
