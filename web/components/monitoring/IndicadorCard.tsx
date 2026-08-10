'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// ── Types ────────────────────────────────────────────────────────────────────

interface Indicador {
  id: string;
  nombre: string;
  descripcion: string;
  meta: number;
  resultado: number | null;
  unidad: string;
  porcentaje: number | null;
  semaforo: 'verde' | 'amarillo' | 'rojo' | 'gris';
  tendencia: 'sube' | 'baja' | 'estable';
  responsable: string;
  periodicidad: 'mensual' | 'trimestral' | 'semestral' | 'anual';
  ultimaActualizacion: string;
  historial: { periodo: string; valor: number; meta: number }[];
  wsId: string;
}

interface Props {
  indicador: Indicador;
  onClick?: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SEMAFORO_COLOR: Record<Indicador['semaforo'], string> = {
  verde:    '#22C55E',
  amarillo: '#F59E0B',
  rojo:     '#EF4444',
  gris:     '#94A3B8',
};

const TENDENCIA_ICON: Record<Indicador['tendencia'], string> = {
  sube:    '↑',
  baja:    '↓',
  estable: '→',
};

const TENDENCIA_COLOR: Record<Indicador['tendencia'], string> = {
  sube:    'text-[#22C55E]',
  baja:    'text-[#EF4444]',
  estable: 'text-sse-muted',
};

const PERIODICIDAD_LABEL: Record<Indicador['periodicidad'], string> = {
  mensual:    'Mensual',
  trimestral: 'Trimestral',
  semestral:  'Semestral',
  anual:      'Anual',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-SV', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatValue(value: number | null, unidad: string): string {
  if (value === null) return '—';
  if (unidad === '$') return `$${value.toLocaleString('es-SV', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  if (unidad === '%') return `${value.toFixed(1)}%`;
  if (unidad === 'días') return `${value} días`;
  return `${value}`;
}

// ── MiniSparkline ─────────────────────────────────────────────────────────────

function MiniSparkline({
  historial,
  color,
}: {
  historial: Indicador['historial'];
  color: string;
}) {
  const WIDTH  = 80;
  const HEIGHT = 32;
  const PAD    = 3;

  const points = historial.slice(-6);

  if (points.length < 2) {
    return (
      <svg width={WIDTH} height={HEIGHT} aria-hidden="true">
        <line x1={PAD} y1={HEIGHT / 2} x2={WIDTH - PAD} y2={HEIGHT / 2}
          stroke={color} strokeWidth={1} strokeDasharray="2 2" opacity={0.4} />
      </svg>
    );
  }

  const values  = points.map((p) => p.valor);
  const minV    = Math.min(...values);
  const maxV    = Math.max(...values);
  const range   = maxV - minV || 1;

  const toX = (i: number) => PAD + (i / (points.length - 1)) * (WIDTH - PAD * 2);
  const toY = (v: number) => HEIGHT - PAD - ((v - minV) / range) * (HEIGHT - PAD * 2);

  const polyPoints = points.map((p, i) => `${toX(i)},${toY(p.valor)}`).join(' ');

  // Area fill path
  const areaPath =
    `M ${toX(0)},${HEIGHT - PAD} ` +
    points.map((p, i) => `L ${toX(i)},${toY(p.valor)}`).join(' ') +
    ` L ${toX(points.length - 1)},${HEIGHT - PAD} Z`;

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <path d={areaPath} fill={color} fillOpacity={0.12} />
      <polyline
        points={polyPoints}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Last value dot */}
      <circle
        cx={toX(points.length - 1)}
        cy={toY(values[values.length - 1])}
        r={2}
        fill={color}
      />
    </svg>
  );
}

// ── IndicadorCard ─────────────────────────────────────────────────────────────

export function IndicadorCard({ indicador, onClick }: Props) {
  const {
    nombre,
    descripcion,
    meta,
    resultado,
    unidad,
    porcentaje,
    semaforo,
    tendencia,
    responsable,
    periodicidad,
    ultimaActualizacion,
    historial,
  } = indicador;

  const semaforoColor = SEMAFORO_COLOR[semaforo] ?? '#94A3B8';
  const barPct = porcentaje !== null ? Math.min(porcentaje, 100) : 0;

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      className={cn(
        'bg-sse-surface border border-sse-border rounded-xl p-4',
        'transition-shadow duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:border-sse-muted/40',
      )}
    >
      {/* Header row: semáforo dot + nombre + sparkline */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-start gap-2 min-w-0">
          <span
            className="mt-[3px] shrink-0 size-2.5 rounded-full"
            style={{ backgroundColor: semaforoColor }}
            aria-label={`Semáforo ${semaforo}`}
          />
          <span className="text-[13px] font-semibold text-sse-ink leading-tight line-clamp-2">
            {nombre}
          </span>
        </div>
        <div className="shrink-0 mt-0.5">
          <MiniSparkline historial={historial} color={semaforoColor} />
        </div>
      </div>

      {/* Descripcion */}
      <p className="text-[11px] text-sse-muted leading-snug truncate mb-3 pl-[18px]">
        {descripcion}
      </p>

      {/* Resultado / Meta */}
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[15px] font-bold text-sse-ink tabular-nums">
          {formatValue(resultado, unidad)}
        </span>
        <span className="text-[11px] text-sse-muted">
          meta: {formatValue(meta, unidad)}
        </span>
      </div>

      {/* Progress bar (4px height) */}
      <div
        className="w-full rounded-full overflow-hidden mb-3"
        style={{ height: 4, backgroundColor: 'var(--sse-border, #E5E7EB)' }}
        role="progressbar"
        aria-valuenow={barPct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${barPct}%`, backgroundColor: semaforoColor }}
        />
      </div>

      {/* Porcentaje row */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[12px] font-semibold tabular-nums"
          style={{ color: semaforoColor }}
        >
          {porcentaje !== null ? `${porcentaje.toFixed(1)}%` : '—'}
        </span>
        <span
          className={cn('text-[13px] font-bold', TENDENCIA_COLOR[tendencia])}
          aria-label={`Tendencia: ${tendencia}`}
          title={tendencia}
        >
          {TENDENCIA_ICON[tendencia]}
        </span>
      </div>

      {/* Footer metadata */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-sse-border">
        <div className="min-w-0">
          <p className="text-[11px] text-sse-muted truncate" title={responsable}>
            {responsable}
          </p>
          <p className="text-[10px] text-sse-muted/70 mt-0.5">
            {formatDate(ultimaActualizacion)}
          </p>
        </div>
        <Badge variant="gray" className="shrink-0 text-[10px]">
          {PERIODICIDAD_LABEL[periodicidad]}
        </Badge>
      </div>
    </div>
  );
}
