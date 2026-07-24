"use client";

import { useOIMReports } from "@/hooks/useOIM";
import type { OIMMigrationReport } from "@/types/oim";

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    imported: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    conflict: "bg-amber-100 text-amber-700",
    valid:    "bg-blue-100 text-blue-700",
    preview:  "bg-sse-border/40 text-sse-muted",
  };
  const label: Record<string, string> = {
    imported: "Importado",
    rejected: "Rechazado",
    conflict: "Conflicto",
    valid:    "Válido",
    preview:  "Vista previa",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${map[status] ?? "bg-sse-border/40 text-sse-muted"}`}>
      {label[status] ?? status}
    </span>
  );
}

function ReportDetail({ report }: { report: OIMMigrationReport }) {
  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total",      val: report.total,     cls: "bg-sse-surface border-sse-border text-sse-ink" },
          { label: "Importados", val: report.imported,  cls: "bg-green-50 border-green-200 text-green-700" },
          { label: "Rechazados", val: report.rejected,  cls: report.rejected  > 0 ? "bg-red-50 border-red-200 text-red-700"   : "bg-sse-surface border-sse-border text-sse-ink" },
          { label: "Conflictos", val: report.conflictos,cls: report.conflictos> 0 ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-sse-surface border-sse-border text-sse-ink" },
          { label: "Warnings",   val: report.warnings,  cls: report.warnings  > 0 ? "bg-blue-50 border-blue-200 text-blue-700"   : "bg-sse-surface border-sse-border text-sse-ink" },
        ].map((s) => (
          <div key={s.label} className={`rounded-lg border p-3 ${s.cls}`}>
            <p className="text-[20px] font-bold tabular-nums">{s.val}</p>
            <p className="text-[10px] font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Per-row validation */}
      <div className="rounded-xl border border-sse-border bg-white overflow-hidden">
        <div className="bg-sse-surface border-b border-sse-border px-4 py-2.5">
          <p className="text-[12px] font-semibold text-sse-ink">Resultados por indicador</p>
        </div>
        <div className="divide-y divide-sse-border">
          {report.rows.map((row) => (
            <div key={row.seq} className="px-4 py-3 flex items-start gap-3">
              <span className="text-[11px] font-mono text-sse-muted w-20 shrink-0 mt-0.5">
                {row.codigoGenerado ?? `—`}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[12px] font-medium text-sse-ink">{row.nombre}</p>
                  <StatusChip status={row.status} />
                </div>
                {row.catalogRefs.dimensionId && (
                  <p className="text-[10px] text-sse-muted mt-0.5">
                    dim:{row.catalogRefs.dimensionId} · fórmula:{row.catalogRefs.formulaId} · rango:{row.catalogRefs.rangoId}
                  </p>
                )}
                {row.conflictos.map((c, i) => (
                  <p key={i} className="text-[11px] text-red-600 mt-0.5">✗ {c}</p>
                ))}
                {row.warnings.map((w, i) => (
                  <p key={i} className="text-[11px] text-amber-600 mt-0.5">⚠ {w}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Catalog log */}
      {Object.keys(report.catalogLog).length > 0 && (
        <div className="rounded-xl border border-sse-border bg-white p-4">
          <p className="text-[12px] font-semibold text-sse-ink mb-2">Catálogos FMI creados en esta ejecución</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(report.catalogLog).map(([key, n]) => (
              <div key={key} className="rounded-lg bg-teal-50 border border-teal-200 px-3 py-1.5">
                <span className="text-[11px] text-teal-700 font-medium">{key}</span>
                <span className="text-[10px] text-teal-600 ml-1">+{n}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {report.recomendaciones.length > 0 && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
          <p className="text-[11px] font-semibold text-blue-800 mb-1">Recomendaciones</p>
          <ul className="space-y-0.5">
            {report.recomendaciones.map((r, i) => (
              <li key={i} className="text-[11px] text-blue-700">• {r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ValidationReport() {
  const { data: reports, isLoading } = useOIMReports();
  const last = reports?.[0];

  if (isLoading) return <p className="text-[12px] text-sse-muted py-4">Cargando reporte…</p>;
  if (!last) {
    return (
      <div className="rounded-xl border border-sse-border bg-sse-surface p-8 text-center">
        <p className="text-[13px] font-medium text-sse-ink">Sin reportes de migración aún</p>
        <p className="text-[12px] text-sse-muted mt-1">Ejecuta la migración desde el Panel de Importación para generar el primer reporte.</p>
      </div>
    );
  }

  let parsed: OIMMigrationReport | null = null;
  try { parsed = JSON.parse(last.reportJson) as OIMMigrationReport; } catch { /* keep null */ }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-sse-ink">Reporte de Validación</h2>
        <div className="text-right">
          <p className="text-[11px] text-sse-muted">{last.runAt}</p>
          <p className="text-[10px] text-sse-muted">Sprint: {last.sprintId}</p>
        </div>
      </div>
      {parsed ? <ReportDetail report={parsed} /> : (
        <p className="text-[12px] text-red-600">No se pudo parsear el reporte. Revisa el historial.</p>
      )}
    </div>
  );
}
