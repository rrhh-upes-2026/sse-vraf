"use client";

import { useState } from "react";
import { useRunOIMMigration, useMergeOIMCatalogs, useOIMPreview } from "@/hooks/useOIM";
import type { OIMMigrationReport } from "@/types/oim";

interface Props {
  wsId: string;
}

function Badge({ color, label }: { color: string; label: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${color}`}>
      {label}
    </span>
  );
}

function ResultRow({ row }: { row: OIMMigrationReport["rows"][number] }) {
  const badge =
    row.status === "imported"  ? <Badge color="bg-green-100 text-green-700"  label="Importado" /> :
    row.status === "rejected"  ? <Badge color="bg-red-100 text-red-700"      label="Rechazado" /> :
    row.status === "conflict"  ? <Badge color="bg-amber-100 text-amber-700"  label="Conflicto" /> :
                                 <Badge color="bg-sse-border/40 text-sse-muted" label="Válido" />;
  return (
    <div className="flex items-start gap-3 py-2 border-b border-sse-border last:border-0">
      <span className="text-[11px] text-sse-muted w-14 shrink-0 font-mono">{row.codigoGenerado ?? `#${row.seq}`}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-sse-ink truncate">{row.nombre}</p>
        {row.conflictos.length > 0 && (
          <p className="text-[11px] text-red-600 mt-0.5">{row.conflictos[0]}</p>
        )}
        {row.warnings.length > 0 && row.conflictos.length === 0 && (
          <p className="text-[11px] text-amber-600 mt-0.5">{row.warnings[0]}</p>
        )}
      </div>
      <div className="shrink-0">{badge}</div>
    </div>
  );
}

export function MigrationPanel({ wsId }: Props) {
  const [responsibleId, setResponsibleId] = useState("");
  const [unidadId, setUnidadId] = useState("VRAF");
  const [report, setReport] = useState<OIMMigrationReport | null>(null);

  const run   = useRunOIMMigration();
  const merge = useMergeOIMCatalogs();
  const { data: preview, isLoading: prevLoading } = useOIMPreview();

  const handleRun = async () => {
    if (!responsibleId.trim()) return;
    const r = await run.mutateAsync({ responsibleId: responsibleId.trim(), unidadId });
    setReport(r);
  };

  const handleMerge = () => merge.mutate();

  return (
    <div className="space-y-6">
      {/* Run controls */}
      <div className="rounded-xl border border-sse-border bg-sse-surface p-5 space-y-4">
        <h2 className="text-[14px] font-semibold text-sse-ink">Ejecutar Migración Oficial VRAF</h2>
        <p className="text-[12px] text-sse-muted">
          Importa los 10 indicadores VRAF desde el Excel institucional hacia el IDE. Todos pasan por el IndicatorValidator, DuplicateDetector y VersionManager. Resultado: versión 1.0, estado Publicado.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-sse-ink mb-1">
              ID del Responsable <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={responsibleId}
              onChange={(e) => setResponsibleId(e.target.value)}
              placeholder="ej. USR-VRAF-001"
              className="w-full rounded-lg border border-sse-border bg-white px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-sse-ink mb-1">Unidad Institucional</label>
            <input
              type="text"
              value={unidadId}
              onChange={(e) => setUnidadId(e.target.value)}
              className="w-full rounded-lg border border-sse-border bg-white px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRun}
            disabled={run.isPending || !responsibleId.trim()}
            className="text-[12px] px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {run.isPending ? "Ejecutando…" : "Ejecutar Migración"}
          </button>
          <button
            onClick={handleMerge}
            disabled={merge.isPending}
            className="text-[12px] px-4 py-2 rounded-lg border border-sse-border text-sse-ink hover:bg-sse-surface disabled:opacity-50"
          >
            {merge.isPending ? "Fusionando…" : "Solo fusionar catálogos FMI"}
          </button>
        </div>

        {run.isError && (
          <p className="text-[12px] text-red-600 bg-red-50 rounded-lg px-3 py-2">
            Error al ejecutar la migración. Verifica la consola.
          </p>
        )}
        {merge.isSuccess && (
          <p className="text-[12px] text-green-700 bg-green-50 rounded-lg px-3 py-2">
            Catálogos FMI fusionados correctamente.
          </p>
        )}
      </div>

      {/* Result report */}
      {report && (
        <div className="rounded-xl border border-sse-border bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-sse-ink">Resultado de la Migración</h3>
            <span className="text-[11px] text-sse-muted font-mono">{report.runAt}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total",       val: report.total,    color: "bg-sse-surface border-sse-border text-sse-ink" },
              { label: "Importados",  val: report.imported, color: "bg-green-50 border-green-200 text-green-700" },
              { label: "Rechazados",  val: report.rejected, color: report.rejected > 0 ? "bg-red-50 border-red-200 text-red-700" : "bg-sse-surface border-sse-border text-sse-ink" },
              { label: "Conflictos",  val: report.conflictos, color: report.conflictos > 0 ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-sse-surface border-sse-border text-sse-ink" },
            ].map((s) => (
              <div key={s.label} className={`rounded-lg border p-3 ${s.color}`}>
                <p className="text-[20px] font-bold tabular-nums">{s.val}</p>
                <p className="text-[10px] font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="divide-y divide-sse-border">
            {report.rows.map((row) => (
              <ResultRow key={row.seq} row={row} />
            ))}
          </div>

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
      )}

      {/* Preview table */}
      {!report && (
        <div className="rounded-xl border border-sse-border bg-white p-5">
          <h3 className="text-[13px] font-semibold text-sse-ink mb-3">Vista Previa — 10 indicadores VRAF</h3>
          {prevLoading ? (
            <p className="text-[12px] text-sse-muted">Cargando…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-sse-border">
                    <th className="text-left py-2 pr-3 font-semibold text-sse-muted">Código</th>
                    <th className="text-left py-2 pr-3 font-semibold text-sse-muted">Nombre</th>
                    <th className="text-left py-2 pr-3 font-semibold text-sse-muted">Dimensión</th>
                    <th className="text-left py-2 pr-3 font-semibold text-sse-muted">Unidad</th>
                    <th className="text-left py-2 font-semibold text-sse-muted">Frecuencia</th>
                  </tr>
                </thead>
                <tbody>
                  {(preview ?? []).map((row) => (
                    <tr key={row.seq} className="border-b border-sse-border/50 last:border-0 hover:bg-sse-surface/50">
                      <td className="py-1.5 pr-3 font-mono text-indigo-600">{row.codigoPropuesto}</td>
                      <td className="py-1.5 pr-3 text-sse-ink max-w-[200px] truncate">{row.nombre}</td>
                      <td className="py-1.5 pr-3 text-sse-muted">{row.dimension}</td>
                      <td className="py-1.5 pr-3 text-sse-muted">{row.unidadMedida}</td>
                      <td className="py-1.5 text-sse-muted">{row.frecuencia}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
