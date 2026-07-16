"use client";

import { cn } from "@/lib/utils";
import type { ValidationReport, ValidationIssue } from "@/types/studio";

function IconError() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-sse-sem-red-fg shrink-0">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9V5h2v4h-2zm0 2h2v2h-2v-2z" clipRule="evenodd" />
    </svg>
  );
}

function IconWarning() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-sse-sem-amber-fg shrink-0">
      <path fillRule="evenodd" d="M8.485 3.495A1.5 1.5 0 0110 2.75c.563 0 1.088.316 1.36.813l6.5 11.5A1.5 1.5 0 0116.5 17H3.5a1.5 1.5 0 01-1.36-2.062l6.5-11.5zM10 7.75a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0v-2.5A.75.75 0 0110 7.75zm0 6.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-sse-pill-blue-fg shrink-0">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-.5V10a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );
}

function IssueRow({ issue }: { issue: ValidationIssue }) {
  const iconMap = {
    error:   <IconError />,
    warning: <IconWarning />,
    info:    <IconInfo />,
  };

  return (
    <div className="flex items-start gap-2 py-2.5 border-b border-sse-border last:border-b-0">
      {iconMap[issue.severity]}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono font-medium bg-sse-pill-gray-bg text-sse-ink px-1.5 py-0.5 rounded-sm">
            {issue.code}
          </span>
          <p className="text-[12px] text-sse-ink">{issue.message}</p>
        </div>
        {issue.path && (
          <p className="text-[11px] text-sse-muted font-mono mt-0.5">{issue.path}</p>
        )}
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-sse-surface border border-sse-border rounded-sm px-3 py-2 text-center">
      <p className="text-[20px] font-semibold text-sse-ink">{value}</p>
      <p className="text-[11px] text-sse-muted">{label}</p>
    </div>
  );
}

interface ValidationReportViewProps {
  report: ValidationReport | null;
  isRunning?: boolean;
}

export function ValidationReportView({ report, isRunning = false }: ValidationReportViewProps) {
  if (isRunning) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block w-6 h-6 border-2 border-sse-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-[13px] text-sse-muted">Ejecutando validación…</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="py-12 text-center">
        <p className="text-[14px] text-sse-muted">Ejecuta la validación para ver los resultados.</p>
      </div>
    );
  }

  const errors   = report.issues.filter((i) => i.severity === "error");
  const warnings = report.issues.filter((i) => i.severity === "warning");
  const infos    = report.issues.filter((i) => i.severity === "info");

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex items-center gap-3 rounded-md px-4 py-3 border",
          report.passed
            ? "bg-sse-sem-green-bg border-sse-sem-green-border"
            : "bg-sse-sem-red-bg border-sse-sem-red-border",
        )}
      >
        {report.passed ? (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-sse-sem-green-fg shrink-0">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-sse-sem-red-fg shrink-0">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9V5h2v4h-2zm0 2h2v2h-2v-2z" clipRule="evenodd" />
          </svg>
        )}
        <div>
          <p className={cn("text-[13px] font-semibold", report.passed ? "text-sse-sem-green-fg" : "text-sse-sem-red-fg")}>
            {report.passed ? "Validación exitosa" : "Validación fallida"}
          </p>
          <p className="text-[11px] text-sse-muted">
            {errors.length > 0 && `${errors.length} error${errors.length !== 1 ? "es" : ""}`}
            {errors.length > 0 && warnings.length > 0 && " · "}
            {warnings.length > 0 && `${warnings.length} advertencia${warnings.length !== 1 ? "s" : ""}`}
            {(errors.length > 0 || warnings.length > 0) && infos.length > 0 && " · "}
            {infos.length > 0 && `${infos.length} informativo${infos.length !== 1 ? "s" : ""}`}
            {report.issues.length === 0 && "Sin problemas"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        <StatTile label="Etapas"    value={report.stats.stages} />
        <StatTile label="Actividades" value={report.stats.activities} />
        <StatTile label="Transiciones" value={report.stats.transitions} />
        <StatTile label="Formularios" value={report.stats.forms} />
        <StatTile label="Reglas" value={report.stats.validationRules} />
      </div>

      {report.issues.length > 0 && (
        <div className="bg-sse-surface border border-sse-border rounded-md px-4 py-1">
          {errors.length > 0 && (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-sse-sem-red-fg py-2">
                Errores ({errors.length})
              </p>
              {errors.map((issue, i) => <IssueRow key={i} issue={issue} />)}
            </>
          )}
          {warnings.length > 0 && (
            <>
              <p className={cn("text-[11px] font-semibold uppercase tracking-wide text-sse-sem-amber-fg py-2", errors.length > 0 && "mt-2")}>
                Advertencias ({warnings.length})
              </p>
              {warnings.map((issue, i) => <IssueRow key={i} issue={issue} />)}
            </>
          )}
          {infos.length > 0 && (
            <>
              <p className={cn("text-[11px] font-semibold uppercase tracking-wide text-sse-pill-blue-fg py-2", (errors.length > 0 || warnings.length > 0) && "mt-2")}>
                Informativos ({infos.length})
              </p>
              {infos.map((issue, i) => <IssueRow key={i} issue={issue} />)}
            </>
          )}
        </div>
      )}
    </div>
  );
}
