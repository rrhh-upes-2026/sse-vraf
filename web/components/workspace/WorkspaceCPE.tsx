"use client";

import { useCPEDashboard, useCalcularCPE } from "@/hooks/useCPE";

const STATUS_COLOR: Record<string, string> = {
  Verde:    "bg-emerald-100 text-emerald-800",
  Amarillo: "bg-yellow-100 text-yellow-800",
  Naranja:  "bg-orange-100 text-orange-800",
  Rojo:     "bg-red-100 text-red-800",
};

const RISK_COLOR: Record<string, string> = {
  "Muy Bajo": "text-emerald-600",
  "Bajo":     "text-green-600",
  "Medio":    "text-yellow-600",
  "Alto":     "text-orange-600",
  "Crítico":  "text-red-600",
};

const BRECHA_COLOR: Record<string, string> = {
  alta:  "border-red-300 bg-red-50",
  media: "border-yellow-300 bg-yellow-50",
  baja:  "border-blue-300 bg-blue-50",
};

const BRECHA_LABEL: Record<string, string> = {
  actividad_no_ejecutada: "Actividad no ejecutada",
  evidencia_faltante:     "Evidencia faltante",
  evidencia_rechazada:    "Evidencia rechazada",
  indicador_sin_datos:    "Indicador sin datos",
  proceso_sin_plan:       "Proceso sin plan",
};

interface Props {
  wsId: string;
}

export function WorkspaceCPE({ wsId }: Props) {
  const year = new Date().getFullYear();
  const { data: dashboard, isLoading } = useCPEDashboard(year);
  const calcular = useCalcularCPE();

  const snap = dashboard?.snapshotActual;

  function handleCalcular() {
    const month = new Date().getMonth() + 1;
    calcular.mutate({ wsId, year, month });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-[13px] text-sse-muted">
        Cargando...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header action */}
      <div className="flex items-center justify-between">
        <div />
        <button
          onClick={handleCalcular}
          disabled={calcular.isPending}
          className="rounded-md bg-[#059669] px-3 py-1.5 text-[13px] font-medium text-white hover:bg-[#047857] transition-colors disabled:opacity-50"
        >
          {calcular.isPending ? "Calculando..." : "Calcular cumplimiento"}
        </button>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ScoreCard label="Planificación"   value={snap?.planningScore}      suffix="%" />
        <ScoreCard label="Ejecución"        value={snap?.executionScore}     suffix="%" />
        <ScoreCard label="Documentación"   value={snap?.documentationScore} suffix="%" />
        <ScoreCard label="Indicadores"     value={null}                     suffix="%" note="Sin datos" />
      </div>

      {/* Overall + status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="col-span-1 rounded-lg border border-sse-border bg-white p-5 text-center">
          <p className="text-[11px] uppercase tracking-wide text-sse-muted mb-1">Puntaje Global</p>
          <p className="text-5xl font-bold text-sse-ink tabular-nums">
            {snap?.overallScore ?? "—"}
          </p>
          <p className="text-[12px] text-sse-muted mt-1">/ 100</p>
          {snap && (
            <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_COLOR[snap.complianceStatus] ?? ""}`}>
              {snap.complianceStatus}
            </span>
          )}
        </div>

        <div className="col-span-1 rounded-lg border border-sse-border bg-white p-5">
          <p className="text-[11px] uppercase tracking-wide text-sse-muted mb-3">Nivel de Riesgo</p>
          <p className={`text-2xl font-semibold ${snap ? (RISK_COLOR[snap.riskLevel] ?? "text-sse-ink") : "text-sse-muted"}`}>
            {snap?.riskLevel ?? "Sin cálculo"}
          </p>
          {snap && (
            <p className="mt-1 text-[12px] text-sse-muted">
              Último cálculo: {new Date(snap.calculatedAt).toLocaleDateString("es-SV")}
            </p>
          )}
        </div>

        <div className="col-span-1 rounded-lg border border-sse-border bg-white p-5">
          <p className="text-[11px] uppercase tracking-wide text-sse-muted mb-3">Planes de Mejora</p>
          <div className="flex gap-6">
            <div>
              <p className="text-2xl font-semibold text-sse-ink tabular-nums">
                {dashboard?.planesActivos ?? 0}
              </p>
              <p className="text-[11px] text-sse-muted">Activos</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-red-600 tabular-nums">
                {dashboard?.planesVencidos ?? 0}
              </p>
              <p className="text-[11px] text-sse-muted">Vencidos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tendencia */}
      {dashboard && dashboard.tendencia.length > 1 && (
        <div className="rounded-lg border border-sse-border bg-white p-5">
          <p className="text-[12px] font-medium text-sse-ink mb-3">Tendencia de Cumplimiento</p>
          <div className="flex items-end gap-1 h-20">
            {dashboard.tendencia.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-sm bg-[#059669] opacity-80"
                  style={{ height: `${s.overallScore}%` }}
                  title={`${s.month}/${s.year}: ${s.overallScore}`}
                />
                <span className="text-[9px] text-sse-muted">{s.month}/{String(s.year).slice(-2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brechas */}
      {dashboard && dashboard.brechas.length > 0 && (
        <div className="rounded-lg border border-sse-border bg-white p-5">
          <p className="text-[12px] font-medium text-sse-ink mb-3">
            Brechas detectadas ({dashboard.brechas.length})
          </p>
          <div className="space-y-2">
            {dashboard.brechas.slice(0, 5).map((b, i) => (
              <div key={i} className={`rounded border px-3 py-2 ${BRECHA_COLOR[b.severidad] ?? ""}`}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-wide">
                    {BRECHA_LABEL[b.tipo] ?? b.tipo}
                  </span>
                  <span className={`text-[10px] uppercase ${b.severidad === "alta" ? "text-red-600" : b.severidad === "media" ? "text-yellow-700" : "text-blue-600"}`}>
                    {b.severidad}
                  </span>
                </div>
                <p className="text-[12px] text-sse-ink mt-0.5">{b.descripcion}</p>
              </div>
            ))}
            {dashboard.brechas.length > 5 && (
              <p className="text-[11px] text-sse-muted">
                +{dashboard.brechas.length - 5} brechas adicionales — ver panel completo.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreCard({
  label,
  value,
  suffix,
  note,
}: {
  label: string;
  value: number | null | undefined;
  suffix?: string;
  note?: string;
}) {
  return (
    <div className="rounded-lg border border-sse-border bg-white p-4 text-center">
      <p className="text-[11px] uppercase tracking-wide text-sse-muted mb-1">{label}</p>
      {value != null ? (
        <p className="text-2xl font-bold text-sse-ink tabular-nums">
          {value}{suffix}
        </p>
      ) : (
        <p className="text-[13px] text-sse-muted">{note ?? "—"}</p>
      )}
    </div>
  );
}
