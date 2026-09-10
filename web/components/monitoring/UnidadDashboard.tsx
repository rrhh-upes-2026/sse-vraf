'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useMonitoreoIndicadores } from '@/hooks/useMonitoreoIndicadores';
import { getUnidad } from '@/services/monitoreo';
import type { IndicadorMonitoreo } from '@/services/monitoreo';

type Semaforo = 'verde' | 'amarillo' | 'rojo' | 'gris';

const SEMAFORO_COLORS: Record<Semaforo, { border: string; text: string; bg: string; label: string }> = {
  verde:    { border: '#16A34A', text: '#16A34A', bg: '#F0FDF4', label: 'En cumplimiento' },
  amarillo: { border: '#B45309', text: '#B45309', bg: '#FFFBEB', label: 'En riesgo' },
  rojo:     { border: '#DC2626', text: '#DC2626', bg: '#FEF2F2', label: 'Crítico' },
  gris:     { border: '#94A3B8', text: '#64748B', bg: '#F8FAFC', label: 'Pendiente' },
};

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function computeOverall(indicadores: IndicadorMonitoreo[]) {
  const withData = indicadores.filter((i) => i.porcentaje !== null);
  if (!withData.length) return { pct: null as number | null, semaforo: 'gris' as Semaforo };
  const avg = Math.round(
    withData.reduce((acc, i) => acc + Math.min(i.porcentaje!, 100), 0) / withData.length,
  );
  const semaforo: Semaforo = avg >= 80 ? 'verde' : avg >= 60 ? 'amarillo' : 'rojo';
  return { pct: avg, semaforo };
}

function formatMetaResult(ind: IndicadorMonitoreo) {
  const fmt = (n: number | null) => {
    if (n === null) return '—';
    if (ind.unidad === '%')    return `${n}%`;
    if (ind.unidad === 'h')    return `${n}h`;
    if (ind.unidad === '$')    return `$${n}`;
    if (ind.unidad === 'días') return `${n} días`;
    return String(n);
  };
  return { meta: fmt(ind.meta || null), resultado: fmt(ind.resultado) };
}

const CURRENT_MONTH = new Date().getMonth(); // 0-indexed

const SPANISH_MONTHS: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

function computeTrend(indicadores: IndicadorMonitoreo[]): number[] {
  const byMonth: Record<number, number[]> = {};
  for (const ind of indicadores) {
    for (const h of ind.historial) {
      const monthIdx = SPANISH_MONTHS[h.periodo.toLowerCase()];
      if (monthIdx === undefined || !h.meta || h.meta <= 0) continue;
      const pct = Math.round(Math.min((h.valor / h.meta) * 100, 100));
      if (!byMonth[monthIdx]) byMonth[monthIdx] = [];
      byMonth[monthIdx].push(pct);
    }
  }
  const result: number[] = [];
  for (let i = 0; i <= CURRENT_MONTH; i++) {
    const vals = byMonth[i];
    if (vals && vals.length > 0) {
      result.push(Math.round(vals.reduce((a, b) => a + b, 0) / vals.length));
    }
  }
  return result;
}

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
        {ind.porcentaje === null ? (
          <span className="text-[11px] font-semibold px-2 py-1 rounded-[3px] flex-shrink-0" style={{ background: '#F1F5F9', color: '#64748B' }}>
            Pendiente de captura
          </span>
        ) : (
          <span
            className="font-mono text-[28px] font-bold leading-none tracking-tight flex-shrink-0"
            style={{ color: c.text }}
          >
            {ind.porcentaje}%
          </span>
        )}
      </div>

      {/* Meta / Resultado */}
      <div className="flex gap-4 mb-2.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-medium uppercase tracking-[.07em] text-[#718096]">Meta</span>
          <span className="text-[13px] font-semibold text-[#1A2332] dark:text-[#E2EBF5] tabular-nums">{meta}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-medium uppercase tracking-[.07em] text-[#718096]">Resultado</span>
          <span className="text-[13px] font-semibold text-[#1A2332] dark:text-[#E2EBF5] tabular-nums">
            {ind.resultado === null ? <span className="text-[#94A3B8] italic">Sin datos</span> : resultado}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2.5">
        <ProgressBar pct={ind.porcentaje ?? 0} semaforo={ind.semaforo as Semaforo} />
      </div>

      {/* Bottom: semaforo */}
      <div className="border-t border-[#CBD5E1] dark:border-[#243347] pt-2.5">
        <SemaforoBadge semaforo={ind.semaforo as Semaforo} />
      </div>
    </div>
  );
}

function TrendChart({ trendData }: { trendData: number[] }) {
  const actual = trendData;
  const max = Math.max(...actual, 100);
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
  const queryClient = useQueryClient();
  const { data, isLoading, error, dataUpdatedAt } = useMonitoreoIndicadores(wsId);
  const indicadores = data ?? [];

  const { pct: overallPct, semaforo: overallSemaforo } = computeOverall(indicadores);
  const enMeta   = indicadores.filter((i) => i.semaforo === 'verde').length;
  const criticos = indicadores.filter((i) => i.semaforo === 'rojo').length;
  const enRiesgo = indicadores.filter((i) => i.semaforo === 'amarillo').length;

  const unidad = getUnidad(wsId);
  const unidadNombre = unidad?.nombre ?? wsId.toUpperCase();

  const now = new Date();
  const mesActual = now.toLocaleDateString('es-SV', { month: 'long', year: 'numeric' });
  const mesActualLabel = mesActual.charAt(0).toUpperCase() + mesActual.slice(1);

  const ultimaActualizacion = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })
    : null;

  const semaforoC = SEMAFORO_COLORS[overallSemaforo];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-8">
        <p className="font-semibold text-[#1A2332] dark:text-[#E2EBF5]">No fue posible obtener la información de Google Workspace.</p>
        <p className="text-sm text-[#718096] mt-1">{error.message}</p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['monitoreo', 'indicadores', wsId] })}
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
            {mesActualLabel} · Plan Estratégico 2026–2028
          </p>
          {ultimaActualizacion && (
            <div className="flex items-center gap-1.5 text-[12px] text-[#718096] mt-1">
              <span className="w-[7px] h-[7px] rounded-full bg-[#16A34A] animate-pulse flex-shrink-0" />
              Última actualización: {ultimaActualizacion}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 pt-1 flex-wrap justify-end">
          {unidad?.sheetId && (
            <a
              href={`https://docs.google.com/spreadsheets/d/${unidad.sheetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] font-medium text-[#059669] bg-white dark:bg-[#162032] border border-[#CBD5E1] dark:border-[#243347] px-3 py-1.5 rounded-[4px] hover:border-[#059669] transition-colors"
            >
              Abrir Sheets
            </a>
          )}
          {unidad?.folderId && (
            <a
              href={`https://drive.google.com/drive/folders/${unidad.folderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] font-medium text-[#1B5E8F] bg-white dark:bg-[#162032] border border-[#CBD5E1] dark:border-[#243347] px-3 py-1.5 rounded-[4px] hover:border-[#1B5E8F] transition-colors"
            >
              Abrir Drive
            </a>
          )}
          <button
            onClick={async () => {
              const res = await fetch(`/api/google/sheets?wsId=${wsId}&refresh=true`);
              if (res.ok) {
                const fresh: IndicadorMonitoreo[] = await res.json();
                queryClient.setQueryData(['monitoreo', 'indicadores', wsId], fresh);
              }
            }}
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
              {overallPct === null ? '—' : `${overallPct}%`}
            </span>
            <SemaforoBadge semaforo={overallSemaforo} />
            <span className="text-[13px] text-[#4A5568] dark:text-[#A0B4C8] mt-1">{mesActualLabel}</span>
          </div>
          {/* Stats */}
          {[
            { val: indicadores.length, label: 'Indicadores' },
            { val: enMeta,             label: 'En meta',    color: '#16A34A' },
            { val: enRiesgo,           label: 'En riesgo',  color: enRiesgo > 0 ? '#D97706' : undefined },
            { val: criticos,           label: 'Críticos',   color: criticos > 0 ? '#DC2626' : undefined },
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

      {/* ── Trend chart — only shown when GAS has historial data ── */}
      {(() => {
        const trendData = computeTrend(indicadores);
        if (trendData.length === 0) return null;
        return (
          <>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-bold uppercase tracking-[.1em] text-[#718096]">
                Tendencia de cumplimiento
              </span>
              <div className="flex-1 h-px bg-[#CBD5E1] dark:bg-[#243347]" />
              <span className="text-[11px] text-[#718096] bg-white dark:bg-[#162032] border border-[#CBD5E1] dark:border-[#243347] rounded-full px-2 py-px">
                Ene – Dic {new Date().getFullYear()}
              </span>
            </div>

            <div className="bg-white dark:bg-[#162032] border border-[#CBD5E1] dark:border-[#243347] rounded-[6px] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] font-semibold uppercase tracking-[.06em] text-[#4A5568] dark:text-[#A0B4C8]">
                  % cumplimiento mensual
                </span>
                <div className="flex gap-3 text-[11px] text-[#718096]">
                  <span><span className="inline-block w-2 h-2 rounded-[2px] bg-[#1B5E8F] mr-1 opacity-65 align-middle" />Real</span>
                  <span><span className="inline-block w-2 h-2 rounded-[2px] bg-[#DC2626] mr-1 opacity-50 align-middle" />Meta mín. (60%)</span>
                </div>
              </div>
              <TrendChart trendData={trendData} />
            </div>
          </>
        );
      })()}

    </div>
  );
}
