'use client';

import { useMonitoreoIndicadores } from '@/hooks/useMonitoreoIndicadores';
import type { IndicadorMonitoreo } from '@/services/monitoreo';

type Semaforo = 'verde' | 'amarillo' | 'rojo';

const SEMAFORO_COLORS: Record<Semaforo, { border: string; text: string; bg: string; label: string }> = {
  verde:    { border: '#16A34A', text: '#16A34A', bg: '#F0FDF4', label: 'En cumplimiento' },
  amarillo: { border: '#B45309', text: '#B45309', bg: '#FFFBEB', label: 'En riesgo' },
  rojo:     { border: '#DC2626', text: '#DC2626', bg: '#FEF2F2', label: 'Crítico' },
};

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function computeOverall(indicadores: IndicadorMonitoreo[]) {
  if (!indicadores.length) return { pct: 0, semaforo: 'rojo' as Semaforo };
  const avg = Math.round(
    indicadores.reduce((acc, i) => acc + Math.min(i.porcentaje, 100), 0) / indicadores.length,
  );
  const semaforo: Semaforo = avg >= 80 ? 'verde' : avg >= 60 ? 'amarillo' : 'rojo';
  return { pct: avg, semaforo };
}

function formatMetaResult(ind: IndicadorMonitoreo) {
  const fmt = (n: number) =>
    ind.unidad === '%' ? `${n}%` :
    ind.unidad === 'h' ? `${n}h` :
    ind.unidad === '$' ? `$${n}` :
    ind.unidad === 'días' ? `${n} días` :
    String(n);
  return { meta: fmt(ind.meta), resultado: fmt(ind.resultado) };
}

// ── Mock monthly compliance trend (replaced by real data when Sheets is connected) ──
const MOCK_TREND = [74, 79, 81, 83, 86, 88, 90, 92];
const CURRENT_MONTH = 7; // 0-indexed → Agosto

// ── Sub-components ────────────────────────────────────────────────────────────

function SemaforoBadge({ semaforo }: { semaforo: Semaforo }) {
  const c = SEMAFORO_COLORS[semaforo];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold tracking-widest uppercase rounded-[3px]"
      style={{ background: c.bg, color: c.text }}
    >
      <span className="w-2 h-2 rounded-full" style={{ background: c.text }} />
      {c.label}
    </span>
  );
}

function ProgressBar({ pct, semaforo }: { pct: number; semaforo: Semaforo }) {
  return (
    <div className="h-[5px] rounded-[2px] overflow-hidden" style={{ background: 'var(--sse-shell-canvas, #EDF2F7)' }}>
      <div
        className="h-full rounded-[2px] transition-all"
        style={{ width: `${Math.min(pct, 100)}%`, background: SEMAFORO_COLORS[semaforo].border }}
      />
    </div>
  );
}

function IndicadorCard({ ind }: { ind: IndicadorMonitoreo }) {
  const c = SEMAFORO_COLORS[ind.semaforo as Semaforo];
  const { meta, resultado } = formatMetaResult(ind);
  // Mock evidence counts — replaced by Drive data in next iteration
  const required = 5;
  const loaded = ind.semaforo === 'rojo' ? 2 : ind.semaforo === 'amarillo' ? 3 : 4;
  const evPct = Math.round((loaded / required) * 100);
  const evSemaforo: Semaforo = evPct >= 80 ? 'verde' : evPct >= 60 ? 'amarillo' : 'rojo';

  return (
    <div
      className="bg-white dark:bg-[#162032] border border-[#CBD5E1] dark:border-[#243347] rounded-[5px] p-4 flex flex-col gap-0 hover:shadow-md transition-shadow"
      style={{ borderLeftWidth: 3, borderLeftColor: c.border }}
    >
      {/* Top: name + % */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <span className="text-[13px] font-semibold text-[#1A2332] dark:text-[#E2EBF5] leading-snug flex-1">
          {ind.nombre}
        </span>
        <span
          className="font-mono text-[28px] font-bold leading-none tracking-tight flex-shrink-0"
          style={{ color: c.text }}
        >
          {ind.porcentaje}%
        </span>
      </div>

      {/* Meta / Resultado */}
      <div className="flex gap-4 mb-2.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-medium uppercase tracking-[.07em] text-[#718096]">Meta</span>
          <span className="text-[13px] font-semibold text-[#1A2332] dark:text-[#E2EBF5] tabular-nums">{meta}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-medium uppercase tracking-[.07em] text-[#718096]">Resultado</span>
          <span className="text-[13px] font-semibold text-[#1A2332] dark:text-[#E2EBF5] tabular-nums">{resultado}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <ProgressBar pct={ind.porcentaje} semaforo={ind.semaforo as Semaforo} />
      </div>

      {/* Bottom: evidencias + Editar */}
      <div className="flex items-center justify-between gap-2 border-t border-[#CBD5E1] dark:border-[#243347] pt-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-medium uppercase tracking-[.06em] text-[#718096] whitespace-nowrap">
            Evidencias
          </span>
          <span className="text-[12px] text-[#4A5568] dark:text-[#A0B4C8] tabular-nums">
            {required} req / {loaded} carg
          </span>
          <span
            className="text-[11px] font-semibold px-1.5 py-px rounded-[3px] tabular-nums"
            style={{ background: SEMAFORO_COLORS[evSemaforo].bg, color: SEMAFORO_COLORS[evSemaforo].text }}
          >
            {evPct}%
          </span>
        </div>
        <button
          disabled
          className="text-[11px] font-medium text-[#718096] bg-[#F7FAFC] dark:bg-[#1C2A3E] border border-[#CBD5E1] dark:border-[#243347] px-2.5 py-1 rounded-[3px] opacity-60 flex-shrink-0 cursor-default"
        >
          Editar
        </button>
      </div>
    </div>
  );
}

function TrendChart({ trendData }: { trendData: number[] }) {
  const actual = trendData;
  const projected = [91, 90, 89, 88]; // Sep-Dic projected
  const all = [...actual, ...projected];
  const max = Math.max(...all, 100);
  const chartH = 150;
  const _chartW = 840;
  const barW = 42;
  const xStep = 70;
  const xStart = 50;
  const yScale = (v: number) => chartH - (v / max) * chartH + 10;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 900 200`} className="w-full min-w-[520px]" style={{ display: 'block' }}>
        {/* Grid lines */}
        {[100, 80, 60, 40].map((v, _i) => {
          const y = yScale(v);
          return (
            <g key={v}>
              <line x1={xStart} y1={y} x2={xStart + xStep * 12} y2={y}
                stroke={v === 60 ? '#DC2626' : '#CBD5E1'}
                strokeWidth={v === 60 ? 0.8 : 0.5}
                strokeDasharray={v === 60 ? '4,4' : '3,4'}
                opacity={v === 60 ? 0.4 : 1}
              />
              <text x={xStart - 6} y={y + 3} textAnchor="end" fontSize={9}
                fill={v === 60 ? '#DC2626' : '#718096'}
                fontFamily="'Courier New',monospace"
                opacity={v === 60 ? 0.7 : 1}
              >{v}%</text>
            </g>
          );
        })}

        {/* Projected separator */}
        <line x1={xStart + xStep * actual.length} y1={10} x2={xStart + xStep * actual.length} y2={chartH + 10}
          stroke="#CBD5E1" strokeWidth={1} strokeDasharray="5,4" opacity={0.6} />
        <text x={xStart + xStep * actual.length + 4} y={22} fontSize={9} fill="#718096">→ proyectado</text>

        {/* Actual bars */}
        {actual.map((v, i) => {
          const x = xStart + xStep * i - barW / 2;
          const y = yScale(v);
          const h = chartH + 10 - y;
          const isCurrent = i === actual.length - 1;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={h}
                fill={isCurrent ? '#1B5E8F' : '#1B5E8F'}
                opacity={isCurrent ? 0.95 : 0.65}
                rx={2}
              />
              <text x={xStart + xStep * i} y={y - 3} textAnchor="middle" fontSize={9.5}
                fill="#1B5E8F" fontFamily="'Courier New',monospace" fontWeight={isCurrent ? '700' : '400'}
              >{v}%</text>
            </g>
          );
        })}

        {/* Projected bars */}
        {projected.map((v, i) => {
          const x = xStart + xStep * (actual.length + i) - barW / 2;
          const y = yScale(v);
          const h = chartH + 10 - y;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={h} fill="#CBD5E1" opacity={0.7} rx={2} />
              <text x={xStart + xStep * (actual.length + i)} y={y - 3} textAnchor="middle"
                fontSize={9.5} fill="#718096" fontFamily="'Courier New',monospace"
              >{v}%</text>
            </g>
          );
        })}

        {/* Month labels */}
        {MONTH_LABELS.map((m, i) => (
          <text key={m} x={xStart + xStep * i} y={180} textAnchor="middle" fontSize={10}
            fill={i === CURRENT_MONTH ? '#1B5E8F' : i >= actual.length ? '#718096' : '#4A5568'}
            fontWeight={i === CURRENT_MONTH ? '700' : '400'}
          >{m}</text>
        ))}

        {/* X axis */}
        <line x1={xStart - 10} y1={chartH + 10} x2={xStart + xStep * 12} y2={chartH + 10}
          stroke="#CBD5E1" strokeWidth={1} />
      </svg>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function UnidadDashboard({ wsId }: { wsId: string }) {
  const { data, isLoading, error, refetch } = useMonitoreoIndicadores(wsId);
  const indicadores = data ?? [];

  const { pct: overallPct, semaforo: overallSemaforo } = computeOverall(indicadores);
  const enMeta   = indicadores.filter((i) => i.semaforo === 'verde').length;
  const criticos = indicadores.filter((i) => i.semaforo === 'rojo').length;
  const totalEvidencias = indicadores.length * 5; // mock: 5 per indicator

  const unidadNombre = wsId === 'rrhh' ? 'Recursos Humanos'
    : wsId === 'conta' ? 'Contabilidad'
    : wsId === 'compras' ? 'Compras'
    : wsId === 'mant' ? 'Mantenimiento'
    : wsId === 'salud' ? 'Salud SSO'
    : wsId === 'vraf' ? 'VRAF'
    : wsId.toUpperCase();

  const mesActual = 'Agosto 2026';
  const semaforoC = SEMAFORO_COLORS[overallSemaforo];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-8">
        <p className="font-semibold text-[#1A2332] dark:text-[#E2EBF5]">Error al cargar indicadores</p>
        <p className="text-sm text-[#718096] mt-1">{error.message}</p>
        <button onClick={() => refetch()}
          className="mt-4 text-sm font-medium text-[#1B5E8F] underline underline-offset-2">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[.1em] text-[#1B5E8F]">
            Unidad de Gestión
          </span>
          <h1 className="text-[22px] font-bold text-[#1A2332] dark:text-[#E2EBF5] leading-tight">
            {unidadNombre}
          </h1>
          <p className="text-[13px] text-[#4A5568] dark:text-[#A0B4C8]">
            {mesActual} · Plan Estratégico 2026–2028
          </p>
          <div className="flex items-center gap-1.5 text-[12px] text-[#718096] mt-1">
            <span className="w-[7px] h-[7px] rounded-full bg-[#16A34A] animate-pulse flex-shrink-0" />
            Última actualización: hace 5 min
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button onClick={() => refetch()}
            className="text-[12px] font-medium text-[#4A5568] dark:text-[#A0B4C8] bg-white dark:bg-[#162032] border border-[#CBD5E1] dark:border-[#243347] px-3 py-1.5 rounded-[4px] hover:border-[#1B5E8F] hover:text-[#1B5E8F] transition-colors">
            Actualizar
          </button>
        </div>
      </div>

      {/* ── Summary strip ── */}
      {isLoading ? (
        <div className="h-[100px] rounded-[6px] bg-[#CBD5E1] dark:bg-[#243347] animate-pulse" />
      ) : (
        <div className="flex rounded-[6px] border border-[#CBD5E1] dark:border-[#243347] bg-white dark:bg-[#162032] overflow-hidden shadow-sm">
          {/* Accent bar */}
          <div className="w-[5px] flex-shrink-0" style={{ background: semaforoC.border }} />
          {/* Main pct */}
          <div className="flex flex-col gap-1 px-6 py-4 flex-1">
            <span className="text-[11px] font-semibold uppercase tracking-[.08em] text-[#718096]">
              Cumplimiento general
            </span>
            <span className="font-mono text-[52px] font-bold leading-none tracking-tight" style={{ color: semaforoC.text }}>
              {overallPct}%
            </span>
            <SemaforoBadge semaforo={overallSemaforo} />
            <span className="text-[13px] text-[#4A5568] dark:text-[#A0B4C8] mt-1">{mesActual}</span>
          </div>
          {/* Stats */}
          {[
            { val: indicadores.length, label: 'Indicadores' },
            { val: enMeta,             label: 'En meta',    color: '#16A34A' },
            { val: criticos,           label: 'Críticos',   color: criticos > 0 ? '#DC2626' : undefined },
            { val: totalEvidencias,    label: 'Evidencias' },
          ].map((s) => (
            <div key={s.label} className="flex flex-col gap-1 px-6 py-4 justify-center border-l border-[#CBD5E1] dark:border-[#243347]">
              <span className="font-mono text-[24px] font-bold leading-none" style={{ color: s.color ?? '#1A2332' }}
                    /* dark override inline, can't use dark: with dynamic color */
              >{s.val}</span>
              <span className="text-[11px] uppercase tracking-[.04em] text-[#718096]">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Indicators section header ── */}
      <div className="flex items-center gap-2.5 mt-1">
        <span className="text-[11px] font-bold uppercase tracking-[.1em] text-[#718096]">
          Indicadores del período
        </span>
        <div className="flex-1 h-px bg-[#CBD5E1] dark:bg-[#243347]" />
        <span className="text-[11px] text-[#718096] bg-white dark:bg-[#162032] border border-[#CBD5E1] dark:border-[#243347] rounded-full px-2 py-px tabular-nums">
          {indicadores.length} indicadores
        </span>
      </div>

      {/* ── Indicator cards ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[170px] rounded-[5px] bg-[#CBD5E1] dark:bg-[#243347] animate-pulse" />
          ))}
        </div>
      ) : indicadores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-[#CBD5E1] dark:border-[#243347] rounded-[5px] text-center">
          <p className="font-medium text-[#1A2332] dark:text-[#E2EBF5]">Sin indicadores configurados</p>
          <p className="text-sm text-[#718096] mt-1">Conecta Google Sheets en Configuración para comenzar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {indicadores.map((ind) => (
            <IndicadorCard key={ind.id} ind={ind} />
          ))}
        </div>
      )}

      {/* ── Trend chart ── */}
      <div className="flex items-center gap-2.5">
        <span className="text-[11px] font-bold uppercase tracking-[.1em] text-[#718096]">
          Tendencia de cumplimiento
        </span>
        <div className="flex-1 h-px bg-[#CBD5E1] dark:bg-[#243347]" />
        <span className="text-[11px] text-[#718096] bg-white dark:bg-[#162032] border border-[#CBD5E1] dark:border-[#243347] rounded-full px-2 py-px">
          Ene – Dic 2026
        </span>
      </div>

      <div className="bg-white dark:bg-[#162032] border border-[#CBD5E1] dark:border-[#243347] rounded-[6px] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[12px] font-semibold uppercase tracking-[.06em] text-[#4A5568] dark:text-[#A0B4C8]">
            % cumplimiento mensual
          </span>
          <div className="flex gap-3 text-[11px] text-[#718096]">
            <span><span className="inline-block w-2 h-2 rounded-[2px] bg-[#1B5E8F] mr-1 opacity-65 align-middle" />Real</span>
            <span><span className="inline-block w-2 h-2 rounded-[2px] bg-[#CBD5E1] mr-1 align-middle" />Proyectado</span>
            <span><span className="inline-block w-2 h-2 rounded-[2px] bg-[#DC2626] mr-1 opacity-50 align-middle" />Meta mín. (60%)</span>
          </div>
        </div>
        <TrendChart trendData={MOCK_TREND} />
      </div>

    </div>
  );
}
