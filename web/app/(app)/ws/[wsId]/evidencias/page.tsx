"use client";

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useEvidencias } from '@/hooks/useEvidencias';
import { EvidenciaGrid } from '@/components/monitoring/EvidenciaGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { getUnidad } from '@/types/unidad';

// ── Label map ────────────────────────────────────────────────────────────────

const TIPO_LABEL: Record<string, string> = {
  documento:   'Documentos',
  formulario:  'Formularios',
  archivo:     'Archivos',
  registro:    'Registros',
  fotografia:  'Fotografías',
  acta:        'Actas',
  contrato:    'Contratos',
  informe:     'Informes',
  comprobante: 'Comprobantes',
  otro:        'Otros',
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function EvidenciasPage() {
  const params = useParams();
  const wsId = params?.wsId as string;

  const { data: evidencias = [], isLoading } = useEvidencias({ wsId });
  const unidad = getUnidad(wsId);

  // Transform entity Evidencia[] into the CarpetaEvidencia[] shape that
  // EvidenciaGrid expects, grouping by tipo as the logical folder dimension.
  const carpetas = useMemo(() => {
    const byTipo = new Map<string, typeof evidencias>();

    for (const ev of evidencias) {
      const key = ev.tipo ?? 'otro';
      const bucket = byTipo.get(key) ?? [];
      bucket.push(ev);
      byTipo.set(key, bucket);
    }

    return Array.from(byTipo.entries()).map(([tipo, items]) => ({
      id: tipo,
      nombre: TIPO_LABEL[tipo] ?? tipo,
      // driveId at folder level: use unit root if configured; individual
      // items carry their own driveFileId links below.
      driveId: unidad?.driveId ?? '',
      cantidad: items.length,
      ultimaModificacion: items.reduce<string>((latest, ev) => {
        const d = ev.fechaCarga ?? '';
        return d > latest ? d : latest;
      }, ''),
      archivos: items.map((ev) => ({
        id:               ev.id,
        nombre:           ev.nombre,
        tipo:             ev.tipo,
        fechaModificacion: ev.fechaCarga ?? '',
        carpeta:          tipo,
        driveId:          ev.driveFileId ?? '',
        driveUrl:         ev.driveFileId
          ? `https://drive.google.com/file/d/${ev.driveFileId}/view`
          : '#',
        wsId,
      })),
    }));
  }, [evidencias, unidad, wsId]);

  // Derive Drive root link from unit config
  const driveRootUrl = unidad?.driveId
    ? `https://drive.google.com/drive/folders/${unidad.driveId}`
    : null;

  // Count stats
  const totalValidadas = evidencias.filter((e) => e.estado === 'validada').length;
  const totalPendientes = evidencias.filter((e) => e.estado === 'pendiente').length;

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
            <dt className="sr-only">Total</dt>
            <dd>
              <span className="font-semibold text-sse-ink">{evidencias.length}</span>
              {' '}evidencias totales
            </dd>
          </div>
          <div className="flex items-baseline gap-1">
            <dt className="sr-only">Validadas</dt>
            <dd>
              <span className="font-semibold text-[#22C55E]">{totalValidadas}</span>
              {' '}validadas
            </dd>
          </div>
          <div className="flex items-baseline gap-1">
            <dt className="sr-only">Pendientes</dt>
            <dd>
              <span className="font-semibold text-[#F59E0B]">{totalPendientes}</span>
              {' '}pendientes
            </dd>
          </div>
          <div className="flex items-baseline gap-1">
            <dt className="sr-only">Carpetas</dt>
            <dd>
              <span className="font-semibold text-sse-ink">{carpetas.length}</span>
              {' '}carpetas
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
        // CarpetaEvidencia in EvidenciaGrid uses a local file-centric shape;
        // our derived carpetas are structurally compatible at runtime.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <EvidenciaGrid carpetas={carpetas as any} wsId={wsId} />
      )}
    </div>
  );
}
