'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Indicador {
  id: string;
  nombre: string;
  descripcion: string;
  meta: number;
  resultado: number;
  unidad: string;
  porcentaje: number;
  semaforo: 'verde' | 'amarillo' | 'rojo';
  tendencia: 'sube' | 'baja' | 'estable';
  responsable: string;
  periodicidad: 'mensual' | 'trimestral' | 'semestral' | 'anual';
  ultimaActualizacion: string;
  historial: { periodo: string; valor: number; meta: number }[];
  wsId: string;
}

interface Props {
  indicadores: Indicador[];
  className?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const COLOR_MAP = {
  verde:    '#22C55E',
  amarillo: '#F59E0B',
  rojo:     '#EF4444',
} as const;

const RING_SIZE       = 120;
const RING_STROKE     = 9;
const RING_RADIUS     = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE   = 2 * Math.PI * RING_RADIUS;

// ── ProgressRing ──────────────────────────────────────────────────────────────

function ProgressRing({
  pct,
  color,
}: {
  pct: number;
  color: string;
}) {
  const capped  = Math.min(Math.max(pct, 0), 100);
  const offset  = CIRCUMFERENCE * (1 - capped / 100);
  const center  = RING_SIZE / 2;

  return (
    <svg
      width={RING_SIZE}
      height={RING_SIZE}
      viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
      aria-hidden="true"
      className="shrink-0"
    >
      {/* Track */}
      <circle
        cx={center}
        cy={center}
        r={RING_RADIUS}
        fill="none"
        stroke="var(--sse-border, #E5E7EB)"
        strokeWidth={RING_STROKE}
      />
      {/* Progress arc — starts from top (−90°) */}
      <circle
        cx={center}
        cy={center}
        r={RING_RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={RING_STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
          transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease',
        }}
      />
      {/* Center label */}
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={20}
        fontWeight={700}
        fill={color}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {pct.toFixed(0)}%
      </text>
    </svg>
  );
}

// ── CountChip ─────────────────────────────────────────────────────────────────

function CountChip({
  emoji,
  count,
  color,
}: {
  emoji: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sse-surface border border-sse-border">
      <span className="text-sm leading-none">{emoji}</span>
      <span
        className="text-[13px] font-semibold tabular-nums leading-none"
        style={{ color }}
      >
        {count}
      </span>
    </div>
  );
}

// ── LoadingSkeleton ───────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Skeleton className="size-[120px] rounded-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-14 rounded-lg" />
        <Skeleton className="h-8 w-14 rounded-lg" />
        <Skeleton className="h-8 w-14 rounded-lg" />
      </div>
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

// ── SemaforoGlobal ────────────────────────────────────────────────────────────

export function SemaforoGlobal({ indicadores, className }: Props) {
  if (!indicadores || indicadores.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-6', className)}>
        <LoadingSkeleton />
      </div>
    );
  }

  const total       = indicadores.length;
  const avgPct      = indicadores.reduce((acc, ind) => acc + ind.porcentaje, 0) / total;
  const capped      = Math.min(Math.max(avgPct, 0), 100);

  const verdeCount  = indicadores.filter((i) => i.semaforo === 'verde').length;
  const amarilloCnt = indicadores.filter((i) => i.semaforo === 'amarillo').length;
  const rojoCount   = indicadores.filter((i) => i.semaforo === 'rojo').length;

  // Determine overall ring color based on the dominant/worst state
  const ringColor =
    rojoCount > 0 && rojoCount >= amarilloCnt
      ? COLOR_MAP.rojo
      : amarilloCnt > 0 && amarilloCnt >= verdeCount
      ? COLOR_MAP.amarillo
      : COLOR_MAP.verde;

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Progress ring with embedded percentage */}
      <ProgressRing pct={capped} color={ringColor} />

      {/* Count chips */}
      <div className="flex items-center gap-2">
        <CountChip emoji="🟢" count={verdeCount}  color={COLOR_MAP.verde}    />
        <CountChip emoji="🟡" count={amarilloCnt} color={COLOR_MAP.amarillo} />
        <CountChip emoji="🔴" count={rojoCount}   color={COLOR_MAP.rojo}     />
      </div>

      {/* Summary label */}
      <p className="text-[12px] text-sse-muted text-center">
        {total} indicador{total !== 1 ? 'es' : ''} &mdash; promedio{' '}
        <span className="font-semibold" style={{ color: ringColor }}>
          {capped.toFixed(1)}%
        </span>
      </p>
    </div>
  );
}
