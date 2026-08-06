'use client';

import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// ── Types ─────────────────────────────────────────────────────────────────────

type AnalysisType = 'tendencias' | 'anomalias' | 'mejoras' | 'narrativa';

interface AnalysisConfig {
  type: AnalysisType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface HistoryItem {
  id: string;
  type: AnalysisType;
  label: string;
  date: string;
  preview: string;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconBrain({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  );
}

function IconTrend({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
    </svg>
  );
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function IconBulb({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  );
}

function IconDocument({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function IconKey({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
    </svg>
  );
}

// Spinner — pure CSS, no external dependency
function Spinner() {
  return (
    <span
      className="inline-block h-5 w-5 rounded-full border-2 border-sse-primary border-t-transparent animate-spin"
      role="status"
      aria-label="Procesando"
    />
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ANALYSIS_CONFIGS: AnalysisConfig[] = [
  {
    type: 'tendencias',
    label: 'Analizar Tendencias',
    description: 'Detecta patrones de mejora o deterioro en el historial de cada indicador',
    icon: <IconTrend className="h-5 w-5" />,
  },
  {
    type: 'anomalias',
    label: 'Detectar Anomalías',
    description: 'Identifica valores atípicos o desviaciones inesperadas respecto a la meta',
    icon: <IconSearch className="h-5 w-5" />,
  },
  {
    type: 'mejoras',
    label: 'Sugerir Mejoras',
    description: 'Propone acciones correctivas priorizadas según impacto y factibilidad',
    icon: <IconBulb className="h-5 w-5" />,
  },
  {
    type: 'narrativa',
    label: 'Generar Narrativa Ejecutiva',
    description: 'Redacta un resumen formal del período para informes y actas',
    icon: <IconDocument className="h-5 w-5" />,
  },
];

const ANALYSIS_LABEL: Record<AnalysisType, string> = {
  tendencias: 'Análisis de Tendencias',
  anomalias:  'Detección de Anomalías',
  mejoras:    'Sugerencias de Mejora',
  narrativa:  'Narrativa Ejecutiva',
};

// ── Mock history (2 recent entries) ──────────────────────────────────────────

const MOCK_HISTORY: HistoryItem[] = [
  {
    id: 'hist-1',
    type: 'tendencias',
    label: 'Análisis de Tendencias',
    date: '2026-08-05T14:30:00',
    preview:
      'Los indicadores financieros muestran mejora sostenida del 12% respecto al trimestre anterior. El indicador de días de ciclo presenta tendencia descendente favorable. Se recomienda mantener las medidas actuales.',
  },
  {
    id: 'hist-2',
    type: 'narrativa',
    label: 'Narrativa Ejecutiva',
    date: '2026-07-31T09:15:00',
    preview:
      'Durante julio 2026 la unidad alcanzó un cumplimiento global del 87%, superando la meta trimestral del 80%. Cuatro de seis indicadores se encuentran en estado verde. El indicador de gestión de proveedores requiere atención prioritaria.',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-SV', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface AnalysisButtonProps {
  config: AnalysisConfig;
  active: boolean;
  loading: boolean;
  onClick: () => void;
}

function AnalysisButton({ config, active, loading, onClick }: AnalysisButtonProps) {
  const isThisLoading = active && loading;

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={[
        'group flex w-full items-start gap-3 rounded-xl border p-4 text-left',
        'transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary',
        active
          ? 'border-sse-primary bg-sse-primary/5'
          : 'border-sse-border bg-sse-surface hover:border-sse-primary/50',
        loading && !active ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      ].join(' ')}
      aria-pressed={active}
    >
      <span
        className={[
          'mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
          active ? 'bg-sse-primary text-white' : 'bg-sse-primary/10 text-sse-primary',
        ].join(' ')}
      >
        {isThisLoading ? <Spinner /> : config.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${active ? 'text-sse-primary' : 'text-sse-ink'}`}>
          {config.label}
        </p>
        <p className="mt-0.5 text-[11px] text-sse-muted line-clamp-2">{config.description}</p>
      </div>
    </button>
  );
}

interface ResultPanelProps {
  analysisType: AnalysisType | null;
  isLoading: boolean;
  result: string | null;
  error: string | null;
}

function ResultPanel({ analysisType, isLoading, result, error }: ResultPanelProps) {
  if (!analysisType) return null;

  const label = ANALYSIS_LABEL[analysisType];

  return (
    <div className="rounded-xl border border-sse-border bg-sse-surface overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center gap-2 border-b border-sse-border bg-sse-primary/5 px-4 py-3">
        <IconBrain className="h-4 w-4 text-sse-primary" />
        <p className="text-sm font-semibold text-sse-ink">{label}</p>
        {isLoading && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-sse-muted">
            <Spinner />
            Analizando con Gemini…
          </span>
        )}
      </div>

      <div className="p-4">
        {isLoading && (
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[85%]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[78%]" />
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-lg border border-[#FEE2E2] bg-[#FFF5F5] px-4 py-3">
            <p className="text-sm font-medium text-[#B91C1C]">Error al procesar el análisis</p>
            <p className="mt-0.5 text-[12px] text-[#B91C1C]/80">{error}</p>
          </div>
        )}

        {!isLoading && result && (
          <div className="space-y-3">
            {/* Render paragraphs preserving line breaks */}
            {result.split('\n\n').map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-sse-ink whitespace-pre-wrap">
                {para}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryItem({ item }: { item: HistoryItem }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-sse-border bg-sse-surface p-4">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-sse-primary/10 text-sse-primary">
        <IconClock className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
          <p className="text-sm font-medium text-sse-ink">{item.label}</p>
          <p className="text-[10px] tabular-nums text-sse-muted">{formatDateTime(item.date)}</p>
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-sse-muted line-clamp-2">{item.preview}</p>
      </div>
    </div>
  );
}

// ── InteligenciaCenter ────────────────────────────────────────────────────────

export function InteligenciaCenter({ wsId }: { wsId: string }) {
  const [activeType, setActiveType]   = useState<AnalysisType | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult]           = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  async function handleAnalysis(type: AnalysisType) {
    // Clicking the same button while loading does nothing
    if (isAnalyzing) return;

    setActiveType(type);
    setIsAnalyzing(true);
    setResult(null);
    setAnalysisError(null);

    try {
      const res = await fetch('/api/inteligencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wsId, type }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }

      const json = await res.json();
      // Accept either { result } or { text } from the API
      const text: string = json.result ?? json.text ?? JSON.stringify(json, null, 2);
      setResult(text);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Error al procesar el análisis');
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-sse-primary/10">
          <IconBrain className="h-6 w-6 text-sse-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-sse-ink">Análisis con Gemini AI</h1>
          <p className="text-sm text-sse-muted">
            Análisis inteligente de indicadores · unidad <span className="font-medium text-sse-ink">{wsId.toUpperCase()}</span>
          </p>
        </div>
      </div>

      {/* ── Analysis buttons ── */}
      <div>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-sse-muted">
          Tipo de análisis
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ANALYSIS_CONFIGS.map((config) => (
            <AnalysisButton
              key={config.type}
              config={config}
              active={activeType === config.type}
              loading={isAnalyzing}
              onClick={() => handleAnalysis(config.type)}
            />
          ))}
        </div>
      </div>

      {/* ── Result panel ── */}
      <ResultPanel
        analysisType={activeType}
        isLoading={isAnalyzing}
        result={result}
        error={analysisError}
      />

      {/* ── History ── */}
      <div>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-sse-muted">
          Análisis recientes
        </h2>
        <div className="space-y-3">
          {MOCK_HISTORY.map((item) => (
            <HistoryItem key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* ── API key note ── */}
      <div className="flex items-start gap-2.5 rounded-xl border border-sse-border bg-sse-surface px-4 py-3">
        <IconKey className="mt-0.5 h-4 w-4 flex-shrink-0 text-sse-muted" />
        <p className="text-[12px] text-sse-muted">
          Requiere{' '}
          <code className="rounded bg-black/[0.05] px-1 py-0.5 font-mono text-[11px] dark:bg-white/[0.08]">
            GEMINI_API_KEY
          </code>{' '}
          configurado en el sistema. Consulte al administrador si el análisis no responde.
        </p>
      </div>
    </div>
  );
}
