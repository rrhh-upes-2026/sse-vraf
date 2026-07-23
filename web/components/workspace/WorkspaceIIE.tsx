"use client";

import { useIIEDashboard } from "@/hooks/useIIE";

const RISK_COLOR: Record<string, string> = {
  bajo:    "text-emerald-700",
  medio:   "text-yellow-700",
  alto:    "text-orange-700",
  critico: "text-red-700",
};

const RISK_BG: Record<string, string> = {
  bajo:    "bg-emerald-100",
  medio:   "bg-yellow-100",
  alto:    "bg-orange-100",
  critico: "bg-red-100",
};

const RISK_LABEL: Record<string, string> = {
  bajo: "Bajo", medio: "Medio", alto: "Alto", critico: "Crítico",
};

const PRIORITY_CHIP: Record<string, string> = {
  critica: "bg-red-100 text-red-800",
  alta:    "bg-orange-100 text-orange-800",
  media:   "bg-yellow-100 text-yellow-800",
  baja:    "bg-gray-100 text-gray-700",
};

const ANOMALY_COLOR: Record<string, string> = {
  caida_productividad:   "bg-red-400",
  disminucion_cumplimiento: "bg-orange-400",
  cambio_abrupto:        "bg-yellow-400",
  patron_inusual:        "bg-purple-400",
  sobrecarga_operativa:  "bg-blue-400",
  retraso_recurrente:    "bg-pink-400",
  acumulacion_riesgos:   "bg-red-600",
};

interface Props { wsId: string }

export function WorkspaceIIE({ wsId: _wsId }: Props) {
  const { data: dash, isLoading } = useIIEDashboard();

  if (isLoading) {
    return <div className="flex items-center justify-center py-16 text-[13px] text-sse-muted">Analizando inteligencia institucional...</div>;
  }

  if (!dash) {
    return (
      <div className="rounded-lg border border-sse-border bg-white py-16 text-center">
        <p className="text-[14px] text-sse-muted">Sin datos de inteligencia disponibles.</p>
        <p className="text-[12px] text-sse-muted mt-1">Ejecute un cálculo CPE para generar datos de análisis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Institutional Score */}
      <div className="rounded-xl border border-sse-border bg-white p-6">
        <div className="flex items-center gap-6">
          <div className="text-center shrink-0">
            <p className="text-[11px] uppercase tracking-wide text-sse-muted mb-1">Puntaje Institucional</p>
            <p className={`text-6xl font-bold tabular-nums ${RISK_COLOR[dash.riskLevel] ?? "text-sse-ink"}`}>{dash.institutionalScore}</p>
            <p className="text-[12px] text-sse-muted">/ 100</p>
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-[12px] font-medium ${RISK_BG[dash.riskLevel] ?? ""} ${RISK_COLOR[dash.riskLevel] ?? ""}`}>
              Riesgo {RISK_LABEL[dash.riskLevel] ?? dash.riskLevel}
            </span>
          </div>

          <div className="flex-1 space-y-3">
            {/* Prediction */}
            <div className="rounded-lg border border-sse-border bg-sse-surface px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-wide text-sse-muted">Predicción Trimestral</p>
                <span className={`text-[11px] font-medium ${RISK_COLOR[dash.predictedRisk] ?? ""}`}>Riesgo {RISK_LABEL[dash.predictedRisk]}</span>
              </div>
              <p className={`text-2xl font-bold tabular-nums mt-1 ${RISK_COLOR[dash.predictedRisk] ?? "text-sse-ink"}`}>{dash.quarterlyPrediction}%</p>
            </div>

            {/* Data quality */}
            <div className="rounded-lg border border-sse-border bg-sse-surface px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] uppercase tracking-wide text-sse-muted">Calidad de Datos</p>
                <span className="text-[12px] font-medium text-sse-ink tabular-nums">{dash.dataQuality}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-sse-border">
                <div className="h-1.5 rounded-full bg-[#6D28D9] transition-all" style={{ width: `${dash.dataQuality}%` }} />
              </div>
            </div>

            {/* Counters */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Recomendaciones", value: dash.recommendationCount, color: "text-orange-600" },
                { label: "Anomalías",       value: dash.anomalyCount,        color: "text-red-600" },
                { label: "Diagnósticos",    value: dash.diagnosisCount,      color: "text-[#6D28D9]" },
              ].map((item) => (
                <div key={item.label} className="rounded border border-sse-border bg-white px-3 py-2 text-center">
                  <p className={`text-xl font-bold tabular-nums ${item.color}`}>{item.value}</p>
                  <p className="text-[10px] text-sse-muted">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Executive Narrative */}
      <div className="rounded-lg border border-[#6D28D9]/20 bg-[#F5F3FF] px-5 py-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[#6D28D9] mb-2">Narrativa Ejecutiva</p>
        <p className="text-[13px] text-sse-ink leading-relaxed">{dash.executiveNarrative}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Recommendations */}
        <div className="rounded-lg border border-sse-border bg-white p-5">
          <p className="text-[12px] font-medium text-sse-ink mb-3">
            Recomendaciones Prioritarias
            {dash.topRecommendations.length > 0 && (
              <span className="ml-2 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] text-orange-700">{dash.topRecommendations.length}</span>
            )}
          </p>
          {dash.topRecommendations.length === 0 ? (
            <p className="text-[12px] text-emerald-600">Sin recomendaciones activas.</p>
          ) : (
            <div className="space-y-2">
              {dash.topRecommendations.map((rec) => (
                <div key={rec.id} className="rounded border border-sse-border px-3 py-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${PRIORITY_CHIP[rec.priority] ?? ""}`}>{rec.priority}</span>
                    <span className="text-[10px] text-sse-muted capitalize">{rec.impact} impacto</span>
                  </div>
                  <p className="text-[12px] font-medium text-sse-ink">{rec.title}</p>
                  <p className="text-[11px] text-sse-muted mt-0.5 line-clamp-2">{rec.justification}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Anomalies */}
        <div className="rounded-lg border border-sse-border bg-white p-5">
          <p className="text-[12px] font-medium text-sse-ink mb-3">
            Anomalías Detectadas
            {dash.topAnomalies.length > 0 && (
              <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] text-red-700">{dash.topAnomalies.length}</span>
            )}
          </p>
          {dash.topAnomalies.length === 0 ? (
            <p className="text-[12px] text-emerald-600">Sin anomalías detectadas.</p>
          ) : (
            <div className="space-y-2">
              {dash.topAnomalies.map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded border border-sse-border px-3 py-2.5">
                  <div className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${ANOMALY_COLOR[a.type] ?? "bg-sse-muted"}`} />
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-sse-ink capitalize">{a.type.replace(/_/g, " ")}</p>
                    <p className="text-[11px] text-sse-muted">{a.description}</p>
                    <p className="text-[10px] text-sse-muted mt-0.5">
                      Observado: <span className="font-medium tabular-nums text-sse-ink">{a.observedValue}%</span>
                      {" "}vs esperado: <span className="tabular-nums">{a.expectedValue}%</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Diagnoses */}
      {dash.recentDiagnoses.length > 0 && (
        <div className="rounded-lg border border-sse-border bg-white p-5">
          <p className="text-[12px] font-medium text-sse-ink mb-3">Diagnósticos Recientes</p>
          <div className="space-y-2">
            {dash.recentDiagnoses.map((d) => (
              <div key={d.id} className="flex items-start gap-3 rounded border border-sse-border px-4 py-3">
                <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${RISK_BG[d.riskLevel] ?? ""} ${RISK_COLOR[d.riskLevel] ?? ""}`}>
                  {RISK_LABEL[d.riskLevel] ?? d.riskLevel}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-sse-ink">{d.entityLabel}</p>
                  <p className="text-[11px] text-sse-muted mt-0.5 line-clamp-2">{d.summary}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[13px] font-bold tabular-nums text-[#6D28D9]">{d.overallScore}%</p>
                  <p className="text-[10px] text-sse-muted">conf. {d.confidenceScore}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
