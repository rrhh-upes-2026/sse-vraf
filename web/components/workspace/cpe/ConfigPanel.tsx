"use client";

import { useCPECatalogos, useUpdateCPECatalogo, useCPEHistorial } from "@/hooks/useCPE";

interface Props {
  wsId: string;
}

export function ConfigPanel({ wsId: _wsId }: Props) {
  const { data: pesosData } = useCPECatalogos("pesoCumplimiento");
  const { data: semaforoData } = useCPECatalogos("semaforo");
  const { data: historialData } = useCPEHistorial();
  const updateCat = useUpdateCPECatalogo();

  const pesos    = pesosData?.items ?? [];
  const semaforo = semaforoData?.items ?? [];
  const historial = historialData ?? [];

  const isDefault = pesosData?.isDefault;

  return (
    <div className="space-y-6">
      {/* Pesos */}
      <div className="rounded-lg border border-sse-border bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-medium text-sse-ink">Pesos de Cumplimiento</h2>
          {isDefault && (
            <span className="text-[11px] text-sse-muted bg-sse-surface px-2 py-0.5 rounded">
              Valores por defecto
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {pesos.map((cat) => (
            <div key={cat.valor ?? cat.id} className="text-center">
              <p className="text-[11px] uppercase tracking-wide text-sse-muted mb-1">
                {cat.etiqueta}
              </p>
              <p className="text-2xl font-bold text-sse-ink tabular-nums">
                {cat.peso ?? 0}%
              </p>
              {!isDefault && cat.id && (
                <button
                  onClick={() => updateCat.mutate({ id: cat.id, patch: {} })}
                  className="mt-1 text-[10px] text-sse-muted hover:underline"
                  disabled
                >
                  Editar
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-[11px] text-sse-muted mt-3">
          Total: {pesos.reduce((s, c) => s + (Number(c.peso) || 0), 0)}%
          {" · Los pesos deben sumar 100%."}
        </p>
      </div>

      {/* Semáforo */}
      <div className="rounded-lg border border-sse-border bg-white p-5">
        <h2 className="text-[14px] font-medium text-sse-ink mb-4">Configuración del Semáforo</h2>
        <div className="space-y-2">
          {semaforo.map((cat) => {
            const colorMap: Record<string, string> = {
              verde:    "bg-emerald-100 text-emerald-700",
              amarillo: "bg-yellow-100 text-yellow-700",
              naranja:  "bg-orange-100 text-orange-700",
              rojo:     "bg-red-100 text-red-700",
            };
            return (
              <div
                key={cat.valor ?? cat.id}
                className="flex items-center justify-between rounded-md border border-sse-border px-3 py-2"
              >
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${colorMap[cat.valor ?? ""] ?? ""}`}>
                  {cat.etiqueta}
                </span>
                <span className="text-[13px] text-sse-ink tabular-nums">
                  {cat.scoreMin ?? "?"} – {cat.scoreMax ?? "?"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historial de cálculos */}
      <div className="rounded-lg border border-sse-border bg-white p-5">
        <h2 className="text-[14px] font-medium text-sse-ink mb-4">Historial de Cálculos</h2>
        {historial.length === 0 ? (
          <p className="text-[13px] text-sse-muted">No hay cálculos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-sse-border">
                  <th className="pb-2 text-left font-medium text-sse-muted">Fecha</th>
                  <th className="pb-2 text-left font-medium text-sse-muted">Tipo</th>
                  <th className="pb-2 text-right font-medium text-sse-muted">Registros</th>
                  <th className="pb-2 text-right font-medium text-sse-muted">Duración</th>
                  <th className="pb-2 text-left font-medium text-sse-muted">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {historial.slice(0, 20).map((h) => (
                  <tr key={h.id} className="border-b border-sse-border last:border-0">
                    <td className="py-1.5 text-sse-muted">
                      {new Date(h.createdAt).toLocaleString("es-SV")}
                    </td>
                    <td className="py-1.5 text-sse-ink">{h.tipoCalculo}</td>
                    <td className="py-1.5 text-right tabular-nums">{h.registrosAnalizados}</td>
                    <td className="py-1.5 text-right tabular-nums">{h.duracion}ms</td>
                    <td className="py-1.5 text-sse-ink">{h.resultado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
