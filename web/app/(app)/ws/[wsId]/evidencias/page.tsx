"use client";

import { useParams } from 'next/navigation';
import { useMonitoreoEvidencias } from '@/hooks/useMonitoreoEvidencias';
import { EvidenciaGrid } from '@/components/monitoring/EvidenciaGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { getUnidad } from '@/types/unidad';

export default function EvidenciasPage() {
  const params = useParams();
  const wsId = params?.wsId as string;

  const { data: carpetas = [], isLoading } = useMonitoreoEvidencias(wsId);
  const unidad = getUnidad(wsId);

  const driveRootUrl = unidad?.driveId
    ? `https://drive.google.com/drive/folders/${unidad.driveId}`
    : null;

  const totalArchivos = carpetas.reduce((sum, c) => sum + c.cantidad, 0);

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between border-b border-sse-border pb-4">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">
            Evidencias &mdash; {unidad?.nombre ?? wsId?.toUpperCase()}
          </h1>
          <p className="mt-0.5 text-[13px] text-sse-muted">
            Fuente: Google Drive &middot; Sin duplicar archivos
          </p>
        </div>

        {driveRootUrl && (
          <a
            href={driveRootUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-sse-border bg-sse-surface
                       px-3 py-1.5 text-[12px] text-sse-primary transition-colors
                       hover:bg-black/[0.03] dark:hover:bg-white/[0.03]
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5
                   A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
            Abrir Drive
          </a>
        )}
      </div>

      {/* ── Summary row ─────────────────────────────────────────────────────── */}
      {!isLoading && (
        <dl className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-sse-muted">
          <div className="flex items-baseline gap-1">
            <dt className="sr-only">Carpetas</dt>
            <dd>
              <span className="font-semibold text-sse-ink">{carpetas.length}</span>
              {' '}carpetas
            </dd>
          </div>
          <div className="flex items-baseline gap-1">
            <dt className="sr-only">Total archivos</dt>
            <dd>
              <span className="font-semibold text-sse-ink">{totalArchivos}</span>
              {' '}archivos totales
            </dd>
          </div>
        </dl>
      )}

      {/* ── Grid ────────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))}
        </div>
      ) : (
        <EvidenciaGrid carpetas={carpetas} wsId={wsId} />
      )}
    </div>
  );
}
