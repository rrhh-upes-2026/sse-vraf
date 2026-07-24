"use client";

import { useState } from "react";
import { useIDEIndicators, useIDEIndicator, useUpdateIDEIndicator } from "@/hooks/useIDE";
import type { IndicatorDefinition } from "@/types/ide";

interface Dependency { id: string; nombre: string; codigo: string }

function parseDependencias(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

function DepRow({ dep, onRemove }: { dep: Dependency; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-sse-border bg-sse-surface px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-amber-700 font-semibold">{dep.codigo}</span>
        <span className="text-[12px] text-sse-ink">{dep.nombre}</span>
      </div>
      <button onClick={onRemove}
        className="text-[10px] text-red-500 hover:text-red-700 px-2 py-0.5 rounded border border-transparent hover:border-red-200">
        Quitar
      </button>
    </div>
  );
}

function IndicatorDepManager({ ind, allIndicators }: { ind: IndicatorDefinition; allIndicators: IndicatorDefinition[] }) {
  const update = useUpdateIDEIndicator();
  const [adding, setAdding] = useState(false);
  const [addId, setAddId] = useState("");
  const [saved, setSaved] = useState(false);

  const depIds = parseDependencias(ind.dependencias);
  const deps: Dependency[] = depIds
    .map((id) => allIndicators.find((i) => i.id === id))
    .filter((i): i is IndicatorDefinition => !!i)
    .map((i) => ({ id: i.id, nombre: i.nombre, codigo: i.codigo }));

  const available = allIndicators.filter(
    (i) => i.id !== ind.id && !depIds.includes(i.id)
  );

  async function saveDeps(newIds: string[]) {
    await update.mutateAsync({ id: ind.id, dependencias: JSON.stringify(newIds) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleAdd() {
    if (!addId) return;
    await saveDeps([...depIds, addId]);
    setAddId("");
    setAdding(false);
  }

  async function handleRemove(id: string) {
    await saveDeps(depIds.filter((d) => d !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-semibold text-sse-ink">{ind.nombre}</p>
          <p className="text-[10px] font-mono text-amber-700">{ind.codigo}</p>
        </div>
        {saved && <span className="text-[11px] text-green-600 font-medium">Guardado ✓</span>}
      </div>

      {deps.length === 0 ? (
        <p className="text-[12px] text-sse-muted italic">Sin dependencias configuradas.</p>
      ) : (
        <div className="space-y-2">
          {deps.map((d) => (
            <DepRow key={d.id} dep={d} onRemove={() => void handleRemove(d.id)} />
          ))}
        </div>
      )}

      {adding ? (
        <div className="flex gap-2">
          <select value={addId} onChange={(e) => setAddId(e.target.value)}
            className="flex-1 text-[12px] border border-sse-border rounded px-2.5 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-amber-500">
            <option value="">— Seleccionar indicador —</option>
            {available.map((i) => (
              <option key={i.id} value={i.id}>{i.codigo} — {i.nombre}</option>
            ))}
          </select>
          <button onClick={() => void handleAdd()} disabled={!addId || update.isPending}
            className="text-[11px] px-3 py-1.5 rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50">
            Agregar
          </button>
          <button onClick={() => { setAdding(false); setAddId(""); }}
            className="text-[11px] px-3 py-1.5 rounded border border-sse-border text-sse-muted hover:bg-sse-surface">
            Cancelar
          </button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} disabled={available.length === 0}
          className="text-[11px] px-3 py-1.5 rounded border border-sse-border text-sse-ink hover:bg-sse-surface disabled:opacity-40">
          + Agregar dependencia
        </button>
      )}

      {available.length === 0 && !adding && deps.length < allIndicators.length - 1 && (
        <p className="text-[11px] text-sse-muted">No hay más indicadores disponibles para agregar.</p>
      )}
    </div>
  );
}

export function IDEDependencyConfig({ wsId }: { wsId: string }) {
  void wsId;
  const [selectedId, setSelectedId] = useState("");
  const { data: allIndicators, isLoading } = useIDEIndicators();
  const { data: selectedInd } = useIDEIndicator(selectedId);

  const indicators = allIndicators ?? [];

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="rounded-lg border border-sse-border bg-sse-surface p-4">
        <p className="text-[12px] text-sse-muted leading-relaxed">
          Las dependencias registran relaciones entre indicadores. Un indicador puede depender de otros indicadores como insumo
          o antecedente lógico. Esta información se almacena como referencia estructural y no afecta el cálculo de fórmulas.
        </p>
      </div>

      <div>
        <label className="block text-[11px] text-sse-muted mb-1">Indicador a configurar</label>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
          className="w-full text-[12px] border border-sse-border rounded px-3 py-2 bg-sse-surface text-sse-ink focus:outline-none focus:ring-2 focus:ring-amber-500 max-w-sm">
          <option value="">Seleccionar indicador…</option>
          {indicators.map((i) => (
            <option key={i.id} value={i.id}>{i.codigo} — {i.nombre}</option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 rounded-lg bg-sse-border" />)}
        </div>
      )}

      {selectedId && selectedInd && (
        <div className="rounded-lg border border-sse-border p-4">
          <IndicatorDepManager ind={selectedInd} allIndicators={indicators} />
        </div>
      )}

      {!selectedId && !isLoading && (
        <p className="text-[12px] text-sse-muted">Selecciona un indicador para ver y editar sus dependencias.</p>
      )}

      {/* Dependency tree overview */}
      {indicators.some((i) => parseDependencias(i.dependencias).length > 0) && (
        <div className="rounded-lg border border-sse-border bg-sse-surface p-4">
          <p className="text-[11px] font-semibold text-sse-ink mb-3">Mapa de dependencias</p>
          <div className="space-y-2">
            {indicators
              .filter((i) => parseDependencias(i.dependencias).length > 0)
              .map((i) => {
                const depIds = parseDependencias(i.dependencias);
                const depNames = depIds
                  .map((id) => indicators.find((ind) => ind.id === id))
                  .filter(Boolean)
                  .map((ind) => ind!.codigo);
                return (
                  <div key={i.id} className="flex items-start gap-2 text-[11px]">
                    <span className="font-mono text-amber-700 font-semibold shrink-0">{i.codigo}</span>
                    <span className="text-sse-muted">depende de</span>
                    <span className="font-mono text-sse-ink">{depNames.join(", ")}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
