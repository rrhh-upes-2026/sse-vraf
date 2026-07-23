"use client";

import { useState } from "react";
import { useIIEDiagnostics } from "@/hooks/useIIE";
import type { IIEEntityType, IIERiskLevel } from "@/types/iie";

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

const ENTITY_OPTIONS: { value: IIEEntityType | ""; label: string }[] = [
  { value: "",          label: "Todos los tipos" },
  { value: "unidad",    label: "Unidad" },
  { value: "proceso",   label: "Proceso" },
  { value: "actividad", label: "Actividad" },
  { value: "indicador", label: "Indicador" },
  { value: "plan",      label: "Plan" },
];
const RISK_OPTIONS: { value: IIERiskLevel | ""; label: string }[] = [
  { value: "",        label: "Todos los niveles" },
  { value: "bajo",    label: "Bajo" },
  { value: "medio",   label: "Medio" },
  { value: "alto",    label: "Alto" },
  { value: "critico", label: "Crítico" },
];

const IMPACT_DOT: Record<string, string> = {
  positivo: "bg-emerald-400",
  negativo: "bg-red-400",
  neutro:   "bg-gray-300",
};

interface Props { wsId: string }

export function IIEDiagnostics({ wsId: _wsId }: Props) {
  const [entityType, setEntityType] = useState<IIEEntityType | "">("");
  const [riskLevel,  setRiskLevel]  = useState<IIERiskLevel | "">("");
  const [minConf,    setMinConf]    = useState<number>(0);
  const [expanded,   setExpanded]   = useState<string | null>(null);

  const { data: list = [], isLoading } = useIIEDiagnostics({
    entityType: entityType || undefined,
    riskLevel:  riskLevel  || undefined,
    minConfidence: minConf > 0 ? minConf : undefined,
    limit: 50,
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-lg border border-sse-border bg-white px-4 py-3">
        <select
          value={entityType}
          onChange={(e) => setEntityType(e.target.value as IIEEntityType | "")}
          className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none"
        >
          {ENTITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select
          value={riskLevel}
          onChange={(e) => setRiskLevel(e.target.value as IIERiskLevel | "")}
          className="rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none"
        >
          {RISK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-sse-muted">Confianza mín.</span>
          <input
            type="number"
            min={0} max={100}
            value={minConf}
            onChange={(e) => setMinConf(Number(e.target.value))}
            className="w-16 rounded border border-sse-border bg-sse-surface px-2 py-1.5 text-[12px] text-sse-ink focus:outline-none"
          />
          <span className="text-[11px] text-sse-muted">%</span>
        </div>

        <span className="ml-auto self-center text-[11px] text-sse-muted">{list.length} diagnóstico{list.length !== 1 ? "s" : ""}</span>
      </div>

      {isLoading && (
        <p className="py-10 text-center text-[13px] text-sse-muted">Cargando diagnósticos…</p>
      )}

      {!isLoading && list.length === 0 && (
        <div className="rounded-lg border border-sse-border bg-white py-10 text-center">
          <p className="text-[13px] text-sse-muted">Sin diagnósticos para los filtros seleccionados.</p>
        </div>
      )}

      <div className="space-y-2">
        {list.map((d) => {
          const open = expanded === d.id;
          return (
            <div key={d.id} className="rounded-lg border border-sse-border bg-white">
              <button
                className="w-full flex items-start gap-4 px-4 py-3 text-left"
                onClick={() => setExpanded(open ? null : d.id)}
              >
                <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${RISK_BG[d.riskLevel] ?? ""} ${RISK_COLOR[d.riskLevel] ?? ""}`}>
                  {RISK_LABEL[d.riskLevel] ?? d.riskLevel}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-sse-ink">{d.entityLabel}</p>
                  <p className="text-[11px] text-sse-muted capitalize">{d.entityType.replace(/_/g, " ")} · {d.period}</p>
                </div>
                <div className="shrink-0 text-right mr-2">
                  <p className="text-[13px] font-bold tabular-nums text-[#6D28D9]">{d.overallScore}%</p>
                  <p className="text-[10px] text-sse-muted">conf. {d.confidenceScore}%</p>
                </div>
                <svg className={`mt-1 h-4 w-4 shrink-0 text-sse-muted transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {open && (
                <div className="border-t border-sse-border px-4 py-3 space-y-3">
                  <p className="text-[12px] text-sse-ink leading-relaxed">{d.summary}</p>

                  {/* Data quality bars */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Completitud de datos", value: d.dataCompleteness },
                      { label: "Recencia de datos",    value: d.dataRecency },
                    ].map((bar) => (
                      <div key={bar.label}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] text-sse-muted">{bar.label}</span>
                          <span className="text-[10px] font-medium tabular-nums text-sse-ink">{bar.value}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-sse-border">
                          <div className="h-1.5 rounded-full bg-[#6D28D9]" style={{ width: `${bar.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Factors */}
                  {d.factors.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-sse-muted mb-1.5">Factores diagnósticos</p>
                      <div className="space-y-1">
                        {d.factors.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-[11px]">
                            <span className={`h-2 w-2 rounded-full shrink-0 ${IMPACT_DOT[f.impact] ?? "bg-gray-300"}`} />
                            <span className="text-sse-ink font-medium">{f.name}</span>
                            <span className="tabular-nums text-sse-muted ml-auto">{typeof f.value === "number" ? `${f.value}%` : f.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Applied rules */}
                  {d.appliedRules.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {d.appliedRules.map((r, i) => (
                        <span key={i} className="rounded bg-[#F5F3FF] px-1.5 py-0.5 text-[10px] text-[#6D28D9]">{r}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
