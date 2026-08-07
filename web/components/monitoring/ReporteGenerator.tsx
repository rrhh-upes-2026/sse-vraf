'use client';

import { useState, useCallback } from 'react';

interface ReporteGeneratorProps {
  wsId: string;
  unidadNombre: string;
}

type ReportType = 'doc' | 'excel' | 'pdf';
type ToastState = { message: string; type: 'success' | 'error' } | null;

interface RecentReport {
  id: string;
  nombre: string;
  tipo: ReportType;
  fecha: string;
  url: string;
}

const REPORT_TYPE_CONFIG: Record<
  ReportType,
  { label: string; icon: string; description: string }
> = {
  doc: {
    label: 'Google Doc',
    icon: '📄',
    description: 'Informe narrativo con análisis y observaciones',
  },
  excel: {
    label: 'Excel',
    icon: '📊',
    description: 'Datos tabulares para análisis y seguimiento',
  },
  pdf: {
    label: 'PDF',
    icon: '📋',
    description: 'Reporte formal listo para distribución',
  },
};

const TYPE_ICON: Record<ReportType, string> = { doc: '📄', excel: '📊', pdf: '📋' };

// Build period options: current month + last 5 months + current quarter + last 3 quarters
function buildPeriodOptions(): { value: string; label: string; type: 'mensual' | 'trimestral' }[] {
  const now = new Date();
  const options: { value: string; label: string; type: 'mensual' | 'trimestral' }[] = [];

  const MONTHS_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  // Last 6 months (most recent first)
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
    options.push({ value, label, type: 'mensual' });
  }

  // Last 4 quarters
  const currentQ = Math.floor(now.getMonth() / 3) + 1;
  for (let i = 0; i < 4; i++) {
    let q = currentQ - i;
    let y = now.getFullYear();
    while (q <= 0) { q += 4; y -= 1; }
    const value = `${y}-Q${q}`;
    const label = `Q${q} ${y}`;
    options.push({ value, label, type: 'trimestral' });
  }

  return options;
}

// Mock recent reports — last 3
function buildMockReports(unidadNombre: string): RecentReport[] {
  const now = new Date();
  const MONTHS_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const past = (offset: number) => {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    return { month: MONTHS_ES[d.getMonth()], year: d.getFullYear() };
  };

  const tipos: ReportType[] = ['pdf', 'excel', 'doc'];

  return [0, 1, 2].map((i) => {
    const { month, year } = past(i + 1);
    const tipo = tipos[i];
    return {
      id: `mock-${i}`,
      nombre: `Reporte ${unidadNombre} — ${month} ${year}`,
      tipo,
      fecha: new Date(year, now.getMonth() - (i + 1), 28).toISOString(),
      url: '#',
    };
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  if (!toast) return null;
  const isSuccess = toast.type === 'success';

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-start gap-3 rounded-lg px-4 py-3 text-sm font-medium
                  border shadow-md animate-in fade-in slide-in-from-bottom-2 duration-200
                  ${
                    isSuccess
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300'
                      : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300'
                  }`}
    >
      <span className="text-base shrink-0 mt-px" aria-hidden="true">
        {isSuccess ? '✅' : '❌'}
      </span>
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 text-current opacity-60 hover:opacity-100 focus:outline-none
                   focus-visible:ring-2 focus-visible:ring-current rounded"
        aria-label="Cerrar notificación"
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10
                   11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0
                   00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  );
}

export function ReporteGenerator({ wsId, unidadNombre }: ReporteGeneratorProps) {
  const periodOptions = buildPeriodOptions();
  const recentReports = buildMockReports(unidadNombre);

  const [selectedPeriod, setSelectedPeriod] = useState<string>(
    periodOptions.length > 0 ? periodOptions[0].value : '',
  );
  const [selectedType, setSelectedType] = useState<ReportType>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const handleGenerate = useCallback(async () => {
    if (!selectedPeriod || isGenerating) return;

    setIsGenerating(true);
    setToast(null);

    try {
      const res = await fetch('/api/reportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wsId, tipo: selectedType, periodo: selectedPeriod }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { message?: string }).message ?? `Error ${res.status}: ${res.statusText}`,
        );
      }

      setToast({
        type: 'success',
        message: `Reporte ${REPORT_TYPE_CONFIG[selectedType].label} generado exitosamente.`,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Ocurrió un error al generar el reporte.';
      setToast({ type: 'error', message });
    } finally {
      setIsGenerating(false);
    }
  }, [wsId, selectedType, selectedPeriod, isGenerating]);

  const periodLabel =
    periodOptions.find((p) => p.value === selectedPeriod)?.label ?? selectedPeriod;

  return (
    <div className="rounded-xl border border-sse-border bg-sse-surface shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-sse-border flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg bg-sse-primary/10 flex items-center justify-center
                     text-lg"
          aria-hidden="true"
        >
          📑
        </div>
        <div>
          <h2 className="text-base font-semibold text-sse-ink">Generar Reporte</h2>
          <p className="text-xs text-sse-muted">{unidadNombre}</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Toast */}
        {toast && <Toast toast={toast} onDismiss={dismissToast} />}

        {/* Period selector */}
        <div>
          <label
            htmlFor="periodo-select"
            className="block text-sm font-medium text-sse-ink mb-1.5"
          >
            Período
          </label>
          <div className="relative">
            <select
              id="periodo-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              disabled={isGenerating}
              className="w-full appearance-none rounded-lg border border-sse-border bg-sse-surface
                         px-3 py-2 pr-9 text-sm text-sse-ink shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-sse-primary
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {periodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}{' '}
                  {opt.type === 'trimestral' ? '(trimestral)' : '(mensual)'}
                </option>
              ))}
            </select>
            <span
              className="pointer-events-none absolute inset-y-0 right-3 flex items-center
                         text-sse-muted"
              aria-hidden="true"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0
                     111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0
                     01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>
        </div>

        {/* Report type buttons */}
        <div>
          <p className="text-sm font-medium text-sse-ink mb-2">Tipo de reporte</p>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(REPORT_TYPE_CONFIG) as [ReportType, (typeof REPORT_TYPE_CONFIG)[ReportType]][]).map(
              ([type, config]) => {
                const isActive = selectedType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    disabled={isGenerating}
                    aria-pressed={isActive}
                    title={config.description}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3
                                text-center transition-all duration-150 focus:outline-none
                                focus-visible:ring-2 focus-visible:ring-sse-primary
                                disabled:opacity-50 disabled:cursor-not-allowed
                                ${
                                  isActive
                                    ? 'border-sse-primary bg-sse-primary/10 text-sse-primary shadow-sm'
                                    : 'border-sse-border bg-sse-surface text-sse-muted hover:border-sse-primary/50 hover:text-sse-ink'
                                }`}
                  >
                    <span className="text-xl" aria-hidden="true">
                      {config.icon}
                    </span>
                    <span className="text-xs font-medium leading-tight">{config.label}</span>
                  </button>
                );
              },
            )}
          </div>
          {selectedType && (
            <p className="mt-1.5 text-xs text-sse-muted">
              {REPORT_TYPE_CONFIG[selectedType].description}
            </p>
          )}
        </div>

        {/* Generate button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || !selectedPeriod}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-sse-primary
                     px-4 py-2.5 text-sm font-semibold text-white shadow-sm
                     hover:opacity-90 active:opacity-80 transition-opacity duration-150
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary
                     focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Generando…
            </>
          ) : (
            <>
              <span aria-hidden="true">{REPORT_TYPE_CONFIG[selectedType].icon}</span>
              Generar {REPORT_TYPE_CONFIG[selectedType].label} — {periodLabel}
            </>
          )}
        </button>

        {/* Recent reports */}
        <div>
          <h3 className="text-sm font-medium text-sse-ink mb-2">Reportes recientes</h3>
          {recentReports.length === 0 ? (
            <p className="text-sm text-sse-muted">No hay reportes generados aún.</p>
          ) : (
            <ul className="divide-y divide-sse-border/60 rounded-lg border border-sse-border overflow-hidden">
              {recentReports.map((report) => (
                <li key={report.id}>
                  <a
                    href={report.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 bg-sse-surface
                               hover:bg-black/[0.03] dark:hover:bg-white/[0.03]
                               transition-colors duration-100 focus:outline-none
                               focus-visible:ring-2 focus-visible:ring-sse-primary"
                  >
                    <span className="text-base shrink-0" aria-hidden="true">
                      {TYPE_ICON[report.tipo]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-sse-ink truncate">{report.nombre}</p>
                      <p className="text-xs text-sse-muted">{formatDate(report.fecha)}</p>
                    </div>
                    <svg
                      className="w-3.5 h-3.5 text-sse-muted shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0
                           005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21
                           3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
