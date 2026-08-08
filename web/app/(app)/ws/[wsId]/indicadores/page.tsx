"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useMonitoreoIndicadores } from '@/hooks/useMonitoreoIndicadores';
import { IndicadorCard } from '@/components/monitoring/IndicadorCard';
import { SemaforoGlobal } from '@/components/monitoring/SemaforoGlobal';
import { Skeleton } from '@/components/ui/skeleton';
import { getUnidad } from '@/types/unidad';

type SemaforoColor = 'verde' | 'amarillo' | 'rojo';
type Filtro = 'todos' | SemaforoColor;

const FILTROS: Filtro[] = ['todos', 'verde', 'amarillo', 'rojo'];

export default function IndicadoresPage() {
  const params = useParams();
  const wsId = params?.wsId as string;

  const { data: indicadores = [], isLoading, refetch } = useMonitoreoIndicadores(wsId);
  const unidad = getUnidad(wsId);
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const filtrados =
    filtro === 'todos'
      ? indicadores
      : indicadores.filter((i) => i.semaforo === filtro);

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-sse-border pb-4">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">
            Indicadores &mdash; {unidad?.nombre ?? wsId?.toUpperCase()}
          </h1>
          <p className="mt-0.5 text-[13px] text-sse-muted">
            Fuente: Google Sheets &middot; Actualización automática cada 10 min
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="flex items-center gap-1 text-[12px] text-sse-primary hover:underline
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary rounded"
        >
          ↻ Actualizar
        </button>
      </div>

      {/* ── Semáforo global ─────────────────────────────────────────────────── */}
      {!isLoading && indicadores.length > 0 && (
        // Monitoring components carry their own narrower local Indicador shape;
        // entity data is structurally compatible at runtime.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <SemaforoGlobal indicadores={indicadores as any} />
      )}

      {/* ── Filter tabs ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTROS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltro(f)}
            className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
              filtro === f
                ? 'bg-sse-primary text-white'
                : 'border border-sse-border bg-sse-surface text-sse-muted hover:border-sse-muted/60'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span className="ml-auto self-center text-[12px] text-sse-muted">
          {filtrados.length} indicador{filtrados.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {/* ── Grid ────────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-xl" />
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <p className="py-12 text-center text-[14px] text-sse-muted">
          {filtro === 'todos'
            ? 'No hay indicadores configurados para esta unidad.'
            : `No hay indicadores con semáforo ${filtro}.`}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((ind) => (
            <IndicadorCard
              key={ind.id}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              indicador={ind as any}
            />
          ))}
        </div>
      )}
    </div>
  );
}
