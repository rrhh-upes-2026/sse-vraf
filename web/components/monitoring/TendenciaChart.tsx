'use client';

import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

interface HistorialPoint {
  periodo: string;
  valor: number;
  meta: number;
}

interface Props {
  historial: HistorialPoint[];
  color?: string;
  height?: number;
  className?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PAD_X = 8;
const PAD_Y = 6;
const VIEW_W = 300; // arbitrary; SVG scales via viewBox

function buildPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`)
    .join(' ');
}

// ── TendenciaChart ────────────────────────────────────────────────────────────

export function TendenciaChart({
  historial,
  color = '#22C55E',
  height = 80,
  className,
}: Props) {
  const VIEW_H = height;

  // ── Edge cases ──────────────────────────────────────────────────────────────

  if (!historial || historial.length === 0) {
    return (
      <div
        className={cn(
          'w-full flex items-center justify-center text-[11px] text-sse-muted rounded',
          className,
        )}
        style={{ height }}
      >
        Sin datos históricos
      </div>
    );
  }

  if (historial.length === 1) {
    // Single point — render a flat line
    const pt = historial[0];
    const label = `${pt.valor} (meta ${pt.meta}) — ${pt.periodo}`;
    return (
      <div
        className={cn('w-full flex items-center justify-center text-[11px] text-sse-muted', className)}
        style={{ height }}
        title={label}
      >
        {label}
      </div>
    );
  }

  // ── Coordinate mapping ───────────────────────────────────────────────────────

  const allValues = historial.flatMap((p) => [p.valor, p.meta]);
  const minV      = Math.min(...allValues);
  const maxV      = Math.max(...allValues);
  const range     = maxV - minV || 1;

  const innerW    = VIEW_W - PAD_X * 2;
  const innerH    = VIEW_H - PAD_Y * 2;

  const toX = (i: number) =>
    PAD_X + (i / (historial.length - 1)) * innerW;

  const toY = (v: number) =>
    VIEW_H - PAD_Y - ((v - minV) / range) * innerH;

  // ── Valor series ─────────────────────────────────────────────────────────────

  const valorPts = historial.map((p, i) => ({ x: toX(i), y: toY(p.valor) }));
  const metaPts  = historial.map((p, i) => ({ x: toX(i), y: toY(p.meta) }));

  const valorLine = buildPath(valorPts);
  const metaLine  = buildPath(metaPts);

  // Area fill: close path below valor line
  const areaPath =
    `M ${valorPts[0].x},${VIEW_H - PAD_Y} ` +
    valorPts.map((p) => `L ${p.x},${p.y}`).join(' ') +
    ` L ${valorPts[valorPts.length - 1].x},${VIEW_H - PAD_Y} Z`;

  // ── Period labels (x-axis ticks for first/last and midpoint) ─────────────────

  const labelIndices = [0, Math.floor((historial.length - 1) / 2), historial.length - 1].filter(
    (v, i, arr) => arr.indexOf(v) === i,
  );

  return (
    <div className={cn('w-full', className)}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        width="100%"
        height={height}
        role="img"
        aria-label="Gráfico de tendencia"
      >
        {/* ── Area fill under valor line ─────────────────────────────────── */}
        <path
          d={areaPath}
          fill={color}
          fillOpacity={0.1}
        />

        {/* ── Meta dashed line ───────────────────────────────────────────── */}
        <path
          d={metaLine}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray="5 3"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={0.5}
        />

        {/* ── Valor solid line ───────────────────────────────────────────── */}
        <path
          d={valorLine}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* ── Value dots ─────────────────────────────────────────────────── */}
        {valorPts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === historial.length - 1 ? 3 : 2}
            fill={color}
            opacity={i === historial.length - 1 ? 1 : 0.6}
          >
            <title>
              {historial[i].periodo}: {historial[i].valor} (meta {historial[i].meta})
            </title>
          </circle>
        ))}

        {/* ── X-axis period labels ───────────────────────────────────────── */}
        {labelIndices.map((idx) => {
          const x = toX(idx);
          const anchor =
            idx === 0 ? 'start' : idx === historial.length - 1 ? 'end' : 'middle';
          return (
            <text
              key={idx}
              x={x}
              y={VIEW_H - 0.5}
              textAnchor={anchor}
              fontSize={9}
              fill="currentColor"
              opacity={0.45}
              className="text-sse-muted"
            >
              {historial[idx].periodo}
            </text>
          );
        })}
      </svg>

      {/* ── Legend ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mt-1 justify-end">
        <span className="flex items-center gap-1 text-[10px] text-sse-muted">
          <svg width={16} height={4} aria-hidden="true">
            <line x1={0} y1={2} x2={16} y2={2} stroke={color} strokeWidth={2} />
          </svg>
          Resultado
        </span>
        <span className="flex items-center gap-1 text-[10px] text-sse-muted">
          <svg width={16} height={4} aria-hidden="true">
            <line x1={0} y1={2} x2={16} y2={2} stroke={color} strokeWidth={1.5}
              strokeDasharray="4 2" opacity={0.5} />
          </svg>
          Meta
        </span>
      </div>
    </div>
  );
}
