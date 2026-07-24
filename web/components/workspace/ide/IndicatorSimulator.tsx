"use client";

import { useState } from "react";
import { useIDEIndicators, useIDEVariables, useSimulateIDEIndicator } from "@/hooks/useIDE";
import type { IDESimulationResult } from "@/types/ide";

const LEVEL_STYLES: Record<string, string> = {
  excelente: "bg-green-100 border-green-300 text-green-800",
  bueno:     "bg-teal-100 border-teal-300 text-teal-800",
  aceptable: "bg-amber-100 border-amber-300 text-amber-800",
  critico:   "bg-red-100 border-red-300 text-red-800",
};

export function IDEIndicatorSimulator({ wsId }: { wsId: string }) {
  void wsId;
  const [selectedId, setSelectedId] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<IDESimulationResult | null>(null);

  const { data: indicators } = useIDEIndicators({ status: "publicado" });
  const selected = (indicators ?? []).find((i) => i.id === selectedId);
  const { data: variables } = useIDEVariables(selected?.formulaId ?? "");
  const simulate = useSimulateIDEIndicator();

  function handleSelectIndicator(id: string) {
    setSelectedId(id);
    setValues({});
    setResult(null);
  }

  async function handleSimulate() {
    if (!selectedId) return;
    const numericValues: Record<string, number> = {};
    Object.entries(values).forEach(([k, v]) => { numericValues[k] = Number(v) || 0; });
    const res = await simulate.mutateAsync({ indicatorId: selectedId, values: numericValues });
    setResult(res);
  }

  const levelKey = result?.level?.toLowerCase() ?? "";
  const levelStyle = LEVEL_STYLES[levelKey] ?? "bg-sse-surface border-sse-border text-sse-ink";

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Indicator selector */}
      <div>
        <label className="block text-[11px] text-sse-muted mb-1">Indicador a simular *</label>
        <select value={selectedId} onChange={(e) => handleSelectIndicator(e.target.value)}
          className="w-full text-[12px] border border-sse-border rounded px-3 py-2 bg-sse-surface text-sse-ink focus:outline-none focus:ring-2 focus:ring-amber-500">
          <option value="">Seleccionar indicador publicado…</option>
          {(indicators ?? []).map((i) => (
            <option key={i.id} value={i.id}>{i.codigo} — {i.nombre}</option>
          ))}
        </select>
        {(indicators ?? []).length === 0 && (
          <p className="text-[11px] text-sse-muted mt-1">No hay indicadores publicados. Publica un indicador primero.</p>
        )}
      </div>

      {/* Selected indicator info */}
      {selected && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-[12px] font-semibold text-amber-800">{selected.nombre}</p>
          {selected.descripcion && <p className="text-[11px] text-amber-700 mt-0.5">{selected.descripcion}</p>}
          <p className="text-[11px] text-amber-600 mt-1">Meta: {selected.meta || "—"}</p>
        </div>
      )}

      {/* Variable inputs */}
      {selected && variables && variables.length > 0 && (
        <div className="space-y-3">
          <p className="text-[12px] font-semibold text-sse-ink">Variables de la fórmula</p>
          {variables.map((v) => (
            <div key={v.codigo}>
              <label className="block text-[11px] text-sse-muted mb-0.5">
                {v.nombre} <span className="font-mono text-amber-600">({v.codigo})</span>
                {v.descripcion && <span className="text-sse-muted"> — {v.descripcion}</span>}
              </label>
              <input
                type="number" step="any"
                value={values[v.codigo] ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, [v.codigo]: e.target.value }))}
                placeholder="Valor de ejemplo"
                className="w-full text-[12px] border border-sse-border rounded px-2 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-amber-500 max-w-xs"
              />
            </div>
          ))}
        </div>
      )}

      {selected && (!variables || variables.length === 0) && (
        <p className="text-[12px] text-sse-muted italic">Este indicador no tiene fórmula con variables asignada.</p>
      )}

      {/* Simulate button */}
      {selected && (
        <button
          onClick={() => void handleSimulate()}
          disabled={simulate.isPending || !selectedId}
          className="text-[12px] px-5 py-2 rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 font-medium">
          {simulate.isPending ? "Calculando…" : "Simular"}
        </button>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-3">
          <div className={`rounded-lg border p-4 ${levelStyle}`}>
            <p className="text-[11px] font-medium mb-2">Resultado de la simulación</p>
            <p className="text-[28px] font-bold tabular-nums">{result.resultFormatted}</p>
            <p className="text-[12px] font-medium mt-1">{result.levelLabel}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-sse-border p-3 bg-sse-surface">
              <p className="text-[10px] text-sse-muted mb-0.5">Meta cumplida</p>
              <p className={`text-[13px] font-semibold ${result.metaCumplida ? "text-green-700" : "text-red-600"}`}>
                {result.metaCumplida ? "Sí" : "No"}
              </p>
            </div>
            <div className="rounded-lg border border-sse-border p-3 bg-sse-surface">
              <p className="text-[10px] text-sse-muted mb-0.5">Resultado numérico</p>
              <p className="text-[13px] font-semibold text-sse-ink tabular-nums">{result.result}</p>
            </div>
          </div>

          <div className="rounded-lg border border-sse-border p-3 bg-sse-surface">
            <p className="text-[10px] text-sse-muted mb-0.5">Interpretación</p>
            <p className="text-[12px] text-sse-ink">{result.interpretation}</p>
          </div>

          {result.formulaVisible && (
            <div className="rounded-lg border border-sse-border p-3 bg-sse-surface">
              <p className="text-[10px] text-sse-muted mb-0.5">Fórmula aplicada</p>
              <p className="text-[12px] font-mono text-sse-ink">{result.formulaVisible}</p>
            </div>
          )}

          <p className="text-[10px] text-sse-muted italic">
            Esta es una simulación con valores de ejemplo. No se ha guardado ningún dato.
          </p>
        </div>
      )}
    </div>
  );
}
