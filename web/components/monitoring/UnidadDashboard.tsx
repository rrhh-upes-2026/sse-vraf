'use client';

import { useIndicadores } from '@/hooks/useIndicadores';
import { SemaforoGlobal } from './SemaforoGlobal';
import { IndicadorCard } from './IndicadorCard';
import { getUnidad } from '@/types/unidad';
import { Skeleton } from '@/components/ui/skeleton';
// The hook returns the raw entity Indicador (@/types/entities) but the monitoring
// view-model (porcentaje, resultado, wsId, etc.) is defined in @/types/indicador.
// The data layer shapes the payload to match the view-model; cast here at the boundary.
import type { Indicador as MonitoringIndicador } from '@/types/indicador';

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconRefresh({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function IconFolder({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
  );
}

function IconDocument({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function IconAlertCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type Indicador = MonitoringIndicador;
type Semaforo = 'verde' | 'amarillo' | 'rojo';

function computeOverallSemaforo(indicadores: Indicador[]): Semaforo {
  if (indicadores.length === 0) return 'verde';
  const avgPct = indicadores.reduce((acc, i) => acc + Math.min(i.porcentaje, 100), 0) / indicadores.length;
  if (avgPct >= 80) return 'verde';
  if (avgPct >= 60) return 'amarillo';
  return 'rojo';
}

function formatLastUpdate(iso: string): string {
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

// ── SemaforoPill ──────────────────────────────────────────────────────────────

const SEMAFORO_PILL: Record<Semaforo, { bg: string; text: string; dot: string; label: string }> = {
  verde:    { bg: 'bg-[#DCFCE7]',   text: 'text-[#15803D]',   dot: 'bg-[#22C55E]', label: 'En meta'   },
  amarillo: { bg: 'bg-[#FEF9C3]',   text: 'text-[#A16207]',   dot: 'bg-[#F59E0B]', label: 'En riesgo' },
  rojo:     { bg: 'bg-[#FEE2E2]',   text: 'text-[#B91C1C]',   dot: 'bg-[#EF4444]', label: 'Crítico'   },
};

function SemaforoPill({ semaforo }: { semaforo: Semaforo }) {
  const cfg = SEMAFORO_PILL[semaforo];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── Summary cards ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  value: string | number;
  sub: string;
  valueColor?: string;
}

function SummaryCard({ label, value, sub, valueColor = 'text-sse-ink' }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-sse-border bg-sse-surface p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-sse-muted">{label}</p>
      <p className={`mt-2 text-[28px] font-bold tabular-nums leading-none ${valueColor}`}>{value}</p>
      <p className="mt-1.5 text-[11px] text-sse-muted">{sub}</p>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-sse-border bg-sse-surface py-14 px-8 text-center">
      <IconAlertCircle className="mb-3 h-10 w-10 text-[#EF4444]" />
      <p className="font-medium text-sse-ink">Error al cargar los indicadores</p>
      <p className="mt-1 text-sm text-sse-muted">{message}</p>
      <button
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-sse-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary"
      >
        <IconRefresh className="h-4 w-4" />
        Reintentar
      </button>
    </div>
  );
}

// ── Loading skeletons ─────────────────────────────────────────────────────────

function HeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-1.5 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-3.5 w-36" />
        </div>
      </div>
      <Skeleton className="h-8 w-24 rounded-full" />
    </div>
  );
}

function SummaryStripSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-52 rounded-xl" />
      ))}
    </div>
  );
}

// ── Quick link button ─────────────────────────────────────────────────────────

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-lg border border-sse-border bg-sse-surface px-4 py-2 text-sm font-medium text-sse-ink transition-colors hover:border-sse-primary hover:text-sse-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary"
    >
      {icon}
      {label}
    </a>
  );
}

// ── UnidadDashboard ───────────────────────────────────────────────────────────

export function UnidadDashboard({ wsId }: { wsId: string }) {
  const { data, isLoading, error, refetch } = useIndicadores({ wsId });
  // Cast: the service layer returns data shaped as the monitoring view-model.
  const indicadores = (data ?? []) as unknown as Indicador[];
  const unidad = getUnidad(wsId);

  // ── Aggregates ──
  const totalIndicadores = indicadores.length;
  const onTrack  = indicadores.filter((i) => i.semaforo === 'verde').length;
  const atRisk   = indicadores.filter((i) => i.semaforo === 'amarillo').length;
  const critical = indicadores.filter((i) => i.semaforo === 'rojo').length;

  const overallPct =
    totalIndicadores > 0
      ? Math.round(
          indicadores.reduce((acc, i) => acc + Math.min(i.porcentaje, 100), 0) / totalIndicadores,
        )
      : 0;

  const overallSemaforo = computeOverallSemaforo(indicadores);

  const lastUpdate =
    indicadores.length > 0
      ? indicadores.reduce(
          (latest, i) => (i.ultimaActualizacion > latest ? i.ultimaActualizacion : latest),
          indicadores[0].ultimaActualizacion,
        )
      : null;

  // ── Error ──
  if (error) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Error desconocido'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header row ── */}
      {isLoading ? (
        <HeaderSkeleton />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {unidad && (
              <div
                className="h-10 w-1.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: unidad.color }}
                aria-hidden="true"
              />
            )}
            <div>
              <h1 className="text-xl font-semibold text-sse-ink">
                {unidad?.nombre ?? wsId}
              </h1>
              {lastUpdate && (
                <p className="mt-0.5 text-xs text-sse-muted">
                  Actualizado: {formatLastUpdate(lastUpdate)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {totalIndicadores > 0 && <SemaforoPill semaforo={overallSemaforo} />}
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-sse-border px-3 py-1.5 text-sm text-sse-muted transition-colors hover:text-sse-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary"
            >
              <IconRefresh className="h-3.5 w-3.5" />
              Actualizar
            </button>
          </div>
        </div>
      )}

      {/* ── Summary strip ── */}
      {isLoading ? (
        <SummaryStripSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Cumplimiento Global"
            value={`${overallPct}%`}
            sub={`${totalIndicadores} indicador${totalIndicadores !== 1 ? 'es' : ''} en seguimiento`}
          />
          <SummaryCard
            label="En Meta"
            value={onTrack}
            sub="indicadores verdes"
            valueColor="text-[#16A34A]"
          />
          <SummaryCard
            label="En Riesgo / Críticos"
            value={atRisk + critical}
            sub={`${atRisk} en riesgo · ${critical} crítico${critical !== 1 ? 's' : ''}`}
            valueColor={(atRisk + critical) > 0 ? 'text-[#DC2626]' : 'text-sse-ink'}
          />
        </div>
      )}

      {/* ── Semáforo global ── */}
      {isLoading ? (
        <div className="flex flex-col items-center py-4">
          <Skeleton className="h-[120px] w-[120px] rounded-full" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-8 w-14 rounded-lg" />
            <Skeleton className="h-8 w-14 rounded-lg" />
            <Skeleton className="h-8 w-14 rounded-lg" />
          </div>
          <Skeleton className="mt-3 h-3 w-32" />
        </div>
      ) : indicadores.length > 0 ? (
        <div className="rounded-xl border border-sse-border bg-sse-surface py-6">
          <SemaforoGlobal indicadores={indicadores} />
        </div>
      ) : null}

      {/* ── Indicadores grid ── */}
      {isLoading ? (
        <GridSkeleton />
      ) : indicadores.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-sse-border py-16 text-center">
          <p className="font-medium text-sse-ink">Sin indicadores disponibles</p>
          <p className="mt-1 text-sm text-sse-muted">
            Configure el Google Sheets ID en Configuración para comenzar el seguimiento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {indicadores.map((indicador) => (
            <IndicadorCard key={indicador.id} indicador={indicador} />
          ))}
        </div>
      )}

      {/* ── Quick links ── */}
      {!isLoading && (
        <div className="flex flex-wrap gap-3 border-t border-sse-border pt-4">
          <QuickLink
            href={`/${wsId}/evidencias`}
            icon={<IconFolder className="h-4 w-4" />}
            label="Ver Evidencias"
          />
          <QuickLink
            href={`/${wsId}/reporte`}
            icon={<IconDocument className="h-4 w-4" />}
            label="Generar Reporte"
          />
          <QuickLink
            href={`/${wsId}/calendario`}
            icon={<IconCalendar className="h-4 w-4" />}
            label="Ver Calendario"
          />
        </div>
      )}
    </div>
  );
}
