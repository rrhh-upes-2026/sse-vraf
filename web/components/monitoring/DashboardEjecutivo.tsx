'use client';

import { useQuery } from '@tanstack/react-query';
import { UNIDADES } from '@/types/unidad';
import { Skeleton } from '@/components/ui/skeleton';
import type { Indicador } from '@/types/indicador';
import type { UnidadConfig } from '@/types/unidad';

// ── Types ─────────────────────────────────────────────────────────────────────

interface UnitData {
  unidad: UnidadConfig;
  indicadores: Indicador[];
}

interface UnitMetrics {
  unidad: UnidadConfig;
  count: number;
  pct: number;
  semaforo: 'verde' | 'amarillo' | 'rojo';
  verdeCount: number;
  amarilloCount: number;
  rojoCount: number;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconAlert({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );
}

function IconRefresh({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeUnitMetrics(unidad: UnidadConfig, indicadores: Indicador[]): UnitMetrics {
  const withData = indicadores.filter((i) => i.porcentaje != null);
  const count = indicadores.length;
  const pct =
    withData.length > 0
      ? Math.round(
          withData.reduce((acc, i) => acc + Math.min(i.porcentaje!, 100), 0) / withData.length,
        )
      : 0;
  const verdeCount    = indicadores.filter((i) => i.semaforo === 'verde').length;
  const amarilloCount = indicadores.filter((i) => i.semaforo === 'amarillo').length;
  const rojoCount     = indicadores.filter((i) => i.semaforo === 'rojo').length;

  const semaforo: UnitMetrics['semaforo'] =
    rojoCount > 0 ? 'rojo' : amarilloCount > 0 ? 'amarillo' : 'verde';

  return { unidad, count, pct, semaforo, verdeCount, amarilloCount, rojoCount };
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-SV', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

// ── Stat tile ─────────────────────────────────────────────────────────────────

interface StatTileProps {
  label: string;
  value: string | number;
  sub?: string;
  valueColor?: string;
  accent?: string; // hex color for left border accent
}

function StatTile({ label, value, sub, valueColor = 'text-sse-ink', accent }: StatTileProps) {
  return (
    <div
      className="relative rounded-xl border border-sse-border bg-sse-surface p-5 overflow-hidden"
      style={accent ? { borderLeftColor: accent, borderLeftWidth: 3 } : undefined}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-sse-muted">{label}</p>
      <p className={`mt-2 text-[32px] font-bold tabular-nums leading-none ${valueColor}`}>{value}</p>
      {sub && <p className="mt-1.5 text-[11px] text-sse-muted">{sub}</p>}
    </div>
  );
}

// ── Semáforo chip ─────────────────────────────────────────────────────────────

const CHIP_STYLE = {
  verde:    { bg: 'bg-[#DCFCE7]',   text: 'text-[#15803D]',   label: 'En meta'   },
  amarillo: { bg: 'bg-[#FEF9C3]',   text: 'text-[#A16207]',   label: 'En riesgo' },
  rojo:     { bg: 'bg-[#FEE2E2]',   text: 'text-[#B91C1C]',   label: 'Crítico'   },
} as const;

function SemaforoChip({ semaforo }: { semaforo: keyof typeof CHIP_STYLE }) {
  const { bg, text, label } = CHIP_STYLE[semaforo];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}

// ── Unit ranking row ──────────────────────────────────────────────────────────

function UnitRow({ metrics }: { metrics: UnitMetrics }) {
  const { unidad, count, pct, semaforo } = metrics;

  return (
    <tr className="border-b border-sse-border last:border-0 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
      {/* Unit name + color indicator */}
      <td className="py-3 pl-4 pr-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-7 w-1 flex-shrink-0 rounded-full" style={{ backgroundColor: unidad.color }} aria-hidden="true" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-sse-ink">{unidad.nombre}</p>
            <p className="text-[10px] text-sse-muted">{unidad.codigo}</p>
          </div>
        </div>
      </td>

      {/* Progress bar */}
      <td className="hidden py-3 px-3 sm:table-cell" style={{ width: '35%' }}>
        <div className="flex items-center gap-2">
          <div
            className="flex-1 rounded-full overflow-hidden"
            style={{ height: 6, backgroundColor: 'var(--sse-border, #E5E7EB)' }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: unidad.color }}
            />
          </div>
        </div>
      </td>

      {/* % value */}
      <td className="py-3 px-3 text-right">
        <span className="text-sm font-semibold tabular-nums text-sse-ink">{pct}%</span>
      </td>

      {/* Semáforo chip */}
      <td className="py-3 px-3">
        <SemaforoChip semaforo={semaforo} />
      </td>

      {/* Indicadores count */}
      <td className="py-3 pl-2 pr-4 text-right">
        <span className="text-sm tabular-nums text-sse-muted">{count}</span>
      </td>
    </tr>
  );
}

// ── Alert strip ───────────────────────────────────────────────────────────────

function AlertStrip({ units }: { units: UnitMetrics[] }) {
  if (units.length === 0) return null;

  const names = units.map((u) => u.unidad.nombre).join(', ');
  const totalRojo = units.reduce((acc, u) => acc + u.rojoCount, 0);

  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-[#FEE2E2] bg-[#FFF5F5] px-4 py-3"
      role="alert"
    >
      <IconAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#DC2626]" />
      <div>
        <p className="text-sm font-semibold text-[#B91C1C]">
          {totalRojo} indicador{totalRojo !== 1 ? 'es' : ''} en estado crítico
        </p>
        <p className="text-[12px] text-[#B91C1C]/80">
          Unidades afectadas: {names}. Revisar y aplicar medidas correctivas.
        </p>
      </div>
    </div>
  );
}

// ── Loading skeletons ─────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-7 w-72" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

// ── DashboardEjecutivo ────────────────────────────────────────────────────────

export function DashboardEjecutivo() {
  const { data: unitsData = [], isLoading, error, refetch } = useQuery<UnitData[]>({
    queryKey: ['dashboard-ejecutivo'],
    queryFn: async () => {
      const settled = await Promise.allSettled(
        UNIDADES.filter((u) => u.activo).map(async (unidad) => {
          const res = await fetch(`/api/google/sheets?wsId=${unidad.id}`);
          if (!res.ok) return { unidad, indicadores: [] as Indicador[] };
          const indicadores: Indicador[] = await res.json();
          return { unidad, indicadores };
        }),
      );
      return settled
        .filter((r): r is PromiseFulfilledResult<UnitData> => r.status === 'fulfilled')
        .map((r) => r.value);
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // ── Aggregates ──
  const unitMetrics: UnitMetrics[] = unitsData.map(({ unidad, indicadores }) =>
    computeUnitMetrics(unidad, indicadores),
  );

  const allIndicadores = unitsData.flatMap((u) => u.indicadores);
  const totalIndicadores = allIndicadores.length;
  const enRiesgo = allIndicadores.filter((i) => i.semaforo === 'amarillo').length;
  const criticos = allIndicadores.filter((i) => i.semaforo === 'rojo').length;
  const allWithData = allIndicadores.filter((i) => i.porcentaje != null);
  const overallPct =
    allWithData.length > 0
      ? Math.round(
          allWithData.reduce((acc, i) => acc + Math.min(i.porcentaje!, 100), 0) / allWithData.length,
        )
      : 0;

  const alertUnits = unitMetrics.filter((u) => u.rojoCount > 0);

  // ── Loading ──
  if (isLoading) return <DashboardSkeleton />;

  // ── Error ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-sse-border bg-sse-surface py-14 px-8 text-center">
        <IconAlert className="mb-3 h-10 w-10 text-[#EF4444]" />
        <p className="font-medium text-sse-ink">Error al cargar el dashboard ejecutivo</p>
        <p className="mt-1 text-sm text-sse-muted">
          {error instanceof Error ? error.message : 'Error de red'}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-sse-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary"
        >
          <IconRefresh className="h-4 w-4" />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Title row ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-sse-ink">
            Dashboard Ejecutivo Institucional
          </h1>
          <p className="mt-0.5 text-sm text-sse-muted">
            Vista consolidada · {formatDate(new Date().toISOString())}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-sse-border px-3 py-1.5 text-sm text-sse-muted transition-colors hover:text-sse-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary"
        >
          <IconRefresh className="h-3.5 w-3.5" />
          Actualizar todo
        </button>
      </div>

      {/* ── Stat tiles ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Total Indicadores"
          value={totalIndicadores}
          sub={`${UNIDADES.length} unidades monitoreadas`}
          accent="#2563EB"
        />
        <StatTile
          label="Cumplimiento Global"
          value={`${overallPct}%`}
          sub="promedio institucional"
          valueColor={overallPct >= 80 ? 'text-[#16A34A]' : overallPct >= 60 ? 'text-[#D97706]' : 'text-[#DC2626]'}
          accent="#2563EB"
        />
        <StatTile
          label="En Riesgo"
          value={enRiesgo}
          sub="indicadores amarillos"
          valueColor={enRiesgo > 0 ? 'text-[#D97706]' : 'text-sse-ink'}
          accent="#D97706"
        />
        <StatTile
          label="Críticos"
          value={criticos}
          sub="indicadores rojos"
          valueColor={criticos > 0 ? 'text-[#DC2626]' : 'text-sse-ink'}
          accent="#DC2626"
        />
      </div>

      {/* ── Unit ranking ── */}
      <div className="rounded-xl border border-sse-border bg-sse-surface overflow-hidden">
        <div className="border-b border-sse-border px-4 py-3">
          <h2 className="text-sm font-semibold text-sse-ink">Ranking por Unidad</h2>
          <p className="text-[11px] text-sse-muted">Ordenado por % de cumplimiento</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-sse-border bg-black/[0.02] dark:bg-white/[0.02]">
                <th className="py-2 pl-4 pr-2 text-[10px] font-semibold uppercase tracking-wider text-sse-muted">
                  Unidad
                </th>
                <th className="hidden py-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-sse-muted sm:table-cell">
                  Avance
                </th>
                <th className="py-2 px-3 text-right text-[10px] font-semibold uppercase tracking-wider text-sse-muted">
                  %
                </th>
                <th className="py-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-sse-muted">
                  Estado
                </th>
                <th className="py-2 pl-2 pr-4 text-right text-[10px] font-semibold uppercase tracking-wider text-sse-muted">
                  Indicadores
                </th>
              </tr>
            </thead>
            <tbody>
              {unitMetrics
                .slice()
                .sort((a, b) => b.pct - a.pct)
                .map((metrics) => (
                  <UnitRow key={metrics.unidad.id} metrics={metrics} />
                ))}
            </tbody>
          </table>
        </div>

        {unitMetrics.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-sse-muted">No hay datos disponibles.</p>
          </div>
        )}
      </div>

      {/* ── Alert strip ── */}
      {alertUnits.length > 0 && <AlertStrip units={alertUnits} />}
    </div>
  );
}
