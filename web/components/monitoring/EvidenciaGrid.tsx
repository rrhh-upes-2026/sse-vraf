'use client';

import { useState } from 'react';

interface Evidencia {
  id: string;
  nombre: string;
  tipo: string;
  tamaño?: number;
  fechaModificacion: string;
  carpeta: string;
  driveId: string;
  driveUrl: string;
  responsable?: string;
  wsId: string;
}

interface CarpetaEvidencia {
  id: string;
  nombre: string;
  driveId: string;
  cantidad: number;
  ultimaModificacion?: string;
  archivos?: Evidencia[];
}

interface EvidenciaGridProps {
  carpetas: CarpetaEvidencia[];
  wsId: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fileIcon(tipo: string): string {
  const t = tipo.toLowerCase();
  if (t.includes('pdf')) return '📄';
  if (t.includes('sheet') || t.includes('xlsx') || t.includes('csv')) return '📊';
  if (t.includes('doc') || t.includes('word')) return '📝';
  if (t.includes('image') || t.includes('png') || t.includes('jpg')) return '🖼️';
  if (t.includes('zip') || t.includes('rar')) return '🗜️';
  if (t.includes('presentation') || t.includes('pptx')) return '📑';
  return '📎';
}

function CarpetaCard({ carpeta }: { carpeta: CarpetaEvidencia }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-xl border border-sse-border bg-sse-surface flex flex-col overflow-hidden
                 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      {/* Card header — clickable to expand */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-start gap-3 p-4 w-full text-left hover:bg-black/[0.03]
                   dark:hover:bg-white/[0.03] transition-colors duration-150 focus:outline-none
                   focus-visible:ring-2 focus-visible:ring-sse-primary rounded-t-xl"
        aria-expanded={expanded}
      >
        {/* Folder icon */}
        <span className="text-2xl mt-0.5 shrink-0" aria-hidden="true">
          📁
        </span>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sse-ink truncate">{carpeta.nombre}</span>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                         bg-sse-primary/10 text-sse-primary shrink-0"
            >
              {carpeta.cantidad} {carpeta.cantidad === 1 ? 'archivo' : 'archivos'}
            </span>
          </div>

          {carpeta.ultimaModificacion && (
            <p className="text-xs text-sse-muted mt-1">
              Actualizado: {formatDate(carpeta.ultimaModificacion)}
            </p>
          )}
        </div>

        {/* Chevron */}
        <span
          className={`text-sse-muted shrink-0 transition-transform duration-200 text-lg mt-0.5 ${
            expanded ? 'rotate-90' : ''
          }`}
          aria-hidden="true"
        >
          ›
        </span>
      </button>

      {/* Drive link — always visible */}
      <div className="px-4 pb-3 flex justify-end border-t border-sse-border/40 pt-2">
        <a
          href={`https://drive.google.com/drive/folders/${carpeta.driveId}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-xs text-sse-primary hover:underline
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary rounded"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0
                 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
          Abrir en Drive
        </a>
      </div>

      {/* Expanded: file list */}
      {expanded && (
        <div className="border-t border-sse-border bg-black/[0.02] dark:bg-white/[0.02]">
          {!carpeta.archivos || carpeta.archivos.length === 0 ? (
            <p className="text-center text-sse-muted text-sm py-6 px-4">
              No hay archivos disponibles en esta carpeta.
            </p>
          ) : (
            <ul className="divide-y divide-sse-border/60">
              {carpeta.archivos.map((archivo) => (
                <li key={archivo.id}>
                  <a
                    href={archivo.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-black/[0.03]
                               dark:hover:bg-white/[0.03] transition-colors duration-100
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary"
                  >
                    <span className="text-base shrink-0" aria-hidden="true">
                      {fileIcon(archivo.tipo)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-sse-ink truncate">{archivo.nombre}</p>
                      <p className="text-xs text-sse-muted">
                        {formatDate(archivo.fechaModificacion)}
                        {archivo.tamaño !== undefined && (
                          <> · {formatBytes(archivo.tamaño)}</>
                        )}
                        {archivo.responsable && <> · {archivo.responsable}</>}
                      </p>
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
                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25
                           2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className="w-16 h-16 rounded-2xl bg-sse-primary/10 flex items-center justify-center
                   text-3xl mb-4"
        aria-hidden="true"
      >
        📂
      </div>
      <h3 className="text-base font-semibold text-sse-ink mb-1">
        No hay carpetas configuradas
      </h3>
      <p className="text-sm text-sse-muted max-w-xs">
        Configure el Google Drive ID en{' '}
        <span className="font-medium text-sse-ink">Configuración</span> para visualizar la
        evidencia documental de esta unidad.
      </p>
    </div>
  );
}

export function EvidenciaGrid({ carpetas, wsId: _wsId }: EvidenciaGridProps) {
  return (
    <section aria-label="Evidencia documental">
      {carpetas.length === 0 ? (
        <div className="grid grid-cols-1">
          <EmptyState />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {carpetas.map((carpeta) => (
            <CarpetaCard key={carpeta.id} carpeta={carpeta} />
          ))}
        </div>
      )}
    </section>
  );
}
