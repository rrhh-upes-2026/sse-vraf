"use client";

import { useOIMPreview } from "@/hooks/useOIM";

export function PreviewTable() {
  const { data: rows, isLoading, isError } = useOIMPreview();

  if (isLoading) return <p className="text-[12px] text-sse-muted py-4">Cargando vista previa…</p>;
  if (isError)   return <p className="text-[12px] text-red-600 py-4">Error al cargar la vista previa.</p>;
  if (!rows?.length) return <p className="text-[12px] text-sse-muted py-4">Sin datos.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-sse-ink">Vista Previa — 10 Indicadores VRAF</h2>
        <span className="text-[11px] text-sse-muted">{rows.length} indicadores listos para importar</span>
      </div>

      <p className="text-[12px] text-sse-muted">
        Contenido exacto del Excel institucional &ldquo;TABLA DE INDICADORES DE VRAF&rdquo;. Ningún dato fue inventado. Los códigos VRAF-001 a VRAF-010 se generan automáticamente al importar.
      </p>

      <div className="overflow-x-auto rounded-xl border border-sse-border">
        <table className="w-full text-[11px] bg-white">
          <thead className="bg-sse-surface border-b border-sse-border">
            <tr>
              {["#", "Código Propuesto", "Nombre del Indicador", "Dimensión", "Unidad de Medida", "Frecuencia", "Polaridad", "Meta", "Herramienta"].map((h) => (
                <th key={h} className="text-left px-3 py-2.5 font-semibold text-sse-muted whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.seq} className="border-b border-sse-border/50 last:border-0 hover:bg-indigo-50/30">
                <td className="px-3 py-2 text-sse-muted tabular-nums">{row.seq}</td>
                <td className="px-3 py-2 font-mono text-indigo-600 whitespace-nowrap">{row.codigoPropuesto}</td>
                <td className="px-3 py-2 text-sse-ink max-w-[220px]">
                  <div className="truncate" title={row.nombre}>{row.nombre}</div>
                  <div className="text-[10px] text-sse-muted truncate max-w-[200px]" title={row.descripcion}>{row.descripcion}</div>
                </td>
                <td className="px-3 py-2 text-sse-muted whitespace-nowrap">{row.dimension}</td>
                <td className="px-3 py-2 text-sse-muted whitespace-nowrap">{row.unidadMedida}</td>
                <td className="px-3 py-2 text-sse-muted whitespace-nowrap">{row.frecuencia}</td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    row.polaridad === "Positiva" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {row.polaridad}
                  </span>
                </td>
                <td className="px-3 py-2 text-sse-muted tabular-nums whitespace-nowrap">{row.meta}{row.unidadMedida === "%" ? "%" : ""}</td>
                <td className="px-3 py-2 text-sse-muted max-w-[160px]">
                  <div className="truncate" title={row.herramienta}>{row.herramienta}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formula column separately */}
      <div className="rounded-xl border border-sse-border bg-white p-4 space-y-3">
        <h3 className="text-[12px] font-semibold text-sse-ink">Fórmulas Institucionales</h3>
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.seq} className="flex items-start gap-3">
              <span className="font-mono text-[10px] text-indigo-600 shrink-0 w-20 mt-0.5">{row.codigoPropuesto}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-sse-ink font-medium truncate">{row.nombre}</p>
                <p className="text-[11px] text-sse-muted font-mono bg-sse-surface rounded px-2 py-1 mt-1 overflow-x-auto whitespace-nowrap">{row.formula}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
