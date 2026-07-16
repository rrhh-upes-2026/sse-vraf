"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { computeImpact } from "@/lib/studio/impactAnalyzer";
import type {
  BlueprintMetadata,
  InstanceSummary,
  ImpactReport,
} from "@/types/studio";

// ── risk display config ───────────────────────────────────────────────────────

interface RiskConfig {
  label:    string;
  bg:       string;
  border:   string;
  text:     string;
  iconPath: string;
}

const RISK_CONFIG: Record<ImpactReport["riskLevel"], RiskConfig> = {
  low: {
    label:    "Riesgo Bajo",
    bg:       "bg-sse-sem-green-bg",
    border:   "border-sse-sem-green-border",
    text:     "text-sse-sem-green-fg",
    iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  medium: {
    label:    "Riesgo Medio",
    bg:       "bg-sse-sem-amber-bg",
    border:   "border-sse-sem-amber-border",
    text:     "text-sse-sem-amber-fg",
    iconPath: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  },
  high: {
    label:    "Riesgo Alto",
    bg:       "bg-sse-sem-red-bg",
    border:   "border-sse-sem-red-border",
    text:     "text-sse-sem-red-fg",
    iconPath: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  },
};

const DEP_TYPE_LABEL: Record<string, string> = {
  form:      "Formulario",
  indicator: "Indicador",
  report:    "Reporte",
};

// ── component ─────────────────────────────────────────────────────────────────

interface ImpactAnalysisProps {
  blueprint:    BlueprintMetadata;
  allBlueprints: BlueprintMetadata[];
  instances:    InstanceSummary[];
  allBlueprintNames?: Record<string, string>;
}

export function ImpactAnalysis({
  blueprint,
  allBlueprints,
  instances,
  allBlueprintNames = {},
}: ImpactAnalysisProps) {
  const report = useMemo(
    () => computeImpact(blueprint, allBlueprints, instances),
    [blueprint, allBlueprints, instances],
  );

  const riskCfg = RISK_CONFIG[report.riskLevel];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-[13px] font-semibold text-sse-ink">Análisis de Impacto</h3>
        <p className="text-[12px] text-sse-muted mt-0.5">
          Publicar{" "}
          <span className="font-mono text-sse-ink">v{report.toVersion}</span>
          {report.fromVersion !== "—" && (
            <> reemplazará <span className="font-mono text-sse-ink">v{report.fromVersion}</span></>
          )}{" "}
          como versión activa.
        </p>
      </div>

      {/* Risk banner */}
      <div
        className={cn(
          "flex items-start gap-3 rounded-md border px-4 py-3",
          riskCfg.bg,
          riskCfg.border,
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={cn("w-5 h-5 shrink-0 mt-0.5", riskCfg.text)}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={riskCfg.iconPath} />
        </svg>
        <div>
          <p className={cn("text-[13px] font-semibold", riskCfg.text)}>{riskCfg.label}</p>
          <p className="text-[12px] text-sse-ink mt-0.5 leading-relaxed">
            {report.recommendation}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-sse-surface border border-sse-border rounded-md px-3 py-2.5">
          <p className="text-[11px] text-sse-muted">Instancias en vuelo</p>
          <p className={cn(
            "text-[20px] font-semibold mt-0.5",
            report.activeInstances > 0 ? "text-sse-sem-amber-fg" : "text-sse-sem-green-fg",
          )}>
            {report.activeInstances}
          </p>
        </div>
        <div className="bg-sse-surface border border-sse-border rounded-md px-3 py-2.5">
          <p className="text-[11px] text-sse-muted">Dependencias compartidas</p>
          <p className={cn(
            "text-[20px] font-semibold mt-0.5",
            report.sharedDependencies.length > 0 ? "text-sse-sem-amber-fg" : "text-sse-sem-green-fg",
          )}>
            {report.sharedDependencies.length}
          </p>
        </div>
        <div className="bg-sse-surface border border-sse-border rounded-md px-3 py-2.5">
          <p className="text-[11px] text-sse-muted">De versión</p>
          <p className="text-[14px] font-semibold text-sse-ink mt-0.5 font-mono">
            {report.fromVersion !== "—" ? `v${report.fromVersion}` : "—"}
          </p>
        </div>
      </div>

      {/* Active instances */}
      {report.affectedInstanceIds.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sse-muted mb-1.5">
            Instancias en ejecución afectadas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {report.affectedInstanceIds.map((id) => (
              <span
                key={id}
                className="font-mono text-[11px] px-2 py-0.5 rounded bg-sse-sem-amber-bg border border-sse-sem-amber-border text-sse-sem-amber-fg"
              >
                {id}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-sse-muted mt-1.5">
            Estas instancias continuarán sobre la versión anterior hasta que completen o sean reiniciadas manualmente.
          </p>
        </div>
      )}

      {/* Shared dependencies */}
      {report.sharedDependencies.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sse-muted mb-1.5">
            Dependencias compartidas con otros blueprints
          </p>
          <div className="divide-y divide-sse-border border border-sse-border rounded-md overflow-hidden">
            {report.sharedDependencies.map((dep) => (
              <div key={dep.id} className="flex items-center gap-3 px-3 py-2 bg-sse-surface">
                <span className="text-[10px] uppercase tracking-wide text-sse-muted w-20 shrink-0">
                  {DEP_TYPE_LABEL[dep.type] ?? dep.type}
                </span>
                <span className="font-mono text-[11px] text-sse-ink flex-1">{dep.id}</span>
                <span className="text-[11px] text-sse-muted shrink-0">
                  {dep.sharedWith.map((bpId) => allBlueprintNames[bpId] ?? bpId).join(", ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
