"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMonitoreoEvidencias } from "@/hooks/useMonitoreoEvidencias";
import { useEvidenciaMetaStore } from "@/store/useEvidenciaMetaStore";
import { useRoleStore } from "@/store/useRoleStore";
import { getUnidad } from "@/services/monitoreo";
import type { AreaEvidencia, IndicadorEvidencia, MesEvidencia, ArchivoEvidencia } from "@/services/monitoreo";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-SV", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fileIcon(tipo: string): string {
  const t = tipo.toLowerCase();
  if (t.includes("pdf"))    return "📄";
  if (t.includes("sheet") || t.includes("xlsx") || t.includes("csv")) return "📊";
  if (t.includes("doc")  || t.includes("word")) return "📝";
  if (t.includes("image") || t.includes("png") || t.includes("jpg"))  return "🖼️";
  if (t.includes("zip")  || t.includes("rar"))  return "🗜️";
  if (t.includes("pres") || t.includes("pptx")) return "📑";
  return "📎";
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 shrink-0 text-sse-muted transition-transform duration-200 ${open ? "rotate-90" : ""}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0
           0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

// ─── File row ─────────────────────────────────────────────────────────────────

function ArchivoRow({ archivo }: { archivo: ArchivoEvidencia }) {
  return (
    <a
      href={archivo.driveUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]
                 transition-colors duration-100 focus:outline-none focus-visible:ring-2
                 focus-visible:ring-sse-primary"
    >
      <span className="text-base shrink-0" aria-hidden>{fileIcon(archivo.tipo)}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-sse-ink truncate">{archivo.nombre}</p>
        <p className="text-xs text-sse-muted">
          {formatDate(archivo.fechaModificacion)}
          {archivo.tamaño !== undefined && <> · {formatBytes(archivo.tamaño)}</>}
        </p>
      </div>
      <ExternalLinkIcon />
    </a>
  );
}

// ─── Month accordion ──────────────────────────────────────────────────────────

function MesPanel({ mes }: { mes: MesEvidencia }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-sse-border/60 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 w-full px-3 py-2 text-left
                   hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary"
        aria-expanded={open}
      >
        <span className="text-base" aria-hidden>📅</span>
        <span className="flex-1 text-[13px] font-medium text-sse-ink">{mes.nombre}</span>
        <span className="text-xs text-sse-muted tabular-nums mr-1">
          {mes.total} {mes.total === 1 ? "archivo" : "archivos"}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="border-t border-sse-border/60 bg-black/[0.01] dark:bg-white/[0.01]">
          {mes.archivos.length === 0 ? (
            <p className="text-center text-xs text-sse-muted py-4">
              Carpeta vacía — sin archivos subidos aún.
            </p>
          ) : (
            <ul className="divide-y divide-sse-border/40">
              {mes.archivos.map((a) => (
                <li key={a.id}><ArchivoRow archivo={a} /></li>
              ))}
            </ul>
          )}
          <div className="px-4 py-2 flex justify-end border-t border-sse-border/40">
            <a
              href={mes.driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-sse-primary hover:underline
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary rounded"
            >
              <ExternalLinkIcon />
              Abrir carpeta del mes
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Edit panel for indicator description ─────────────────────────────────────

function EditDescripcionPanel({
  wsId,
  indicador,
  descripcion,
  onClose,
}: {
  wsId: string;
  indicador: IndicadorEvidencia;
  descripcion: string;
  onClose: () => void;
}) {
  const [value, setValue] = useState(descripcion);
  const { setMeta } = useEvidenciaMetaStore();

  function save() {
    setMeta(wsId, indicador.id, { descripcion: value });
    onClose();
  }

  return (
    <div className="border-t border-sse-border bg-amber-50/60 dark:bg-amber-900/10 px-4 py-3 space-y-2">
      <label className="block text-xs font-semibold text-sse-muted uppercase tracking-wide">
        Descripción de evidencia requerida
      </label>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        placeholder="Describe qué documentos/archivos se deben subir para respaldar este indicador..."
        className="w-full rounded-lg border border-sse-border bg-sse-surface px-3 py-2 text-sm
                   text-sse-ink placeholder:text-sse-muted resize-none
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary"
      />
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-sse-muted hover:text-sse-ink px-3 py-1.5 rounded-md
                     hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={save}
          className="text-xs font-semibold text-white bg-sse-primary px-4 py-1.5 rounded-md
                     hover:bg-sse-primary/90 transition-colors focus:outline-none
                     focus-visible:ring-2 focus-visible:ring-sse-primary"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}

// ─── Indicator card ───────────────────────────────────────────────────────────

function IndicadorCard({
  wsId,
  indicador,
  isAdmin,
}: {
  wsId: string;
  indicador: IndicadorEvidencia;
  isAdmin: boolean;
}) {
  const [open, setOpen]     = useState(false);
  const [editing, setEditing] = useState(false);
  const { getMeta }           = useEvidenciaMetaStore();

  const meta        = getMeta(wsId, indicador.id);
  const descripcion = meta.descripcion ?? "";

  const totalMeses    = indicador.meses.length;
  const mesesConDatos = indicador.meses.filter((m) => m.total > 0).length;

  return (
    <div className="rounded-xl border border-sse-border bg-sse-surface shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <button
          type="button"
          onClick={() => { setOpen((v) => !v); setEditing(false); }}
          className="flex items-start gap-3 flex-1 text-left focus:outline-none
                     focus-visible:ring-2 focus-visible:ring-sse-primary rounded-lg"
          aria-expanded={open}
        >
          <span className="text-xl mt-0.5 shrink-0" aria-hidden>📁</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sse-ink text-sm leading-snug">{indicador.nombre}</p>
            <p className="text-xs text-sse-muted mt-0.5">
              {mesesConDatos} / {totalMeses} {totalMeses === 1 ? "mes" : "meses"} con archivos
              {" · "}
              <span className="font-medium">{indicador.totalArchivos}</span> archivos totales
            </p>
            {descripcion && !open && (
              <p className="text-xs text-sse-muted mt-1 line-clamp-1 italic">{descripcion}</p>
            )}
          </div>
          <ChevronIcon open={open} />
        </button>

        {/* Admin: edit description button */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => { setEditing((v) => !v); setOpen(true); }}
            title="Editar descripción de evidencia"
            className="text-xs text-sse-muted hover:text-sse-primary px-2 py-1 rounded-md
                       hover:bg-sse-primary/10 transition-colors shrink-0
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary"
          >
            ✏️
          </button>
        )}
      </div>

      {/* Expanded content */}
      {open && (
        <>
          {/* Description section */}
          {editing ? (
            <EditDescripcionPanel
              wsId={wsId}
              indicador={indicador}
              descripcion={descripcion}
              onClose={() => setEditing(false)}
            />
          ) : (
            <div className="px-4 pb-3 border-t border-sse-border/40 pt-3">
              <p className="text-xs font-semibold text-sse-muted uppercase tracking-wide mb-1">
                Evidencia requerida
              </p>
              {descripcion ? (
                <p className="text-sm text-sse-ink">{descripcion}</p>
              ) : (
                <p className="text-sm text-sse-muted italic">
                  {isAdmin
                    ? "Sin descripción — usa el botón ✏️ para agregar qué evidencia debe subirse."
                    : "Sin descripción de evidencia requerida."}
                </p>
              )}
            </div>
          )}

          {/* Monthly folders */}
          {indicador.meses.length > 0 && (
            <div className="px-4 pb-4 pt-1 space-y-2 border-t border-sse-border/40">
              <p className="text-xs font-semibold text-sse-muted uppercase tracking-wide pt-1">
                Control mensual
              </p>
              {indicador.meses.map((mes) => (
                <MesPanel key={mes.id} mes={mes} />
              ))}
            </div>
          )}

          {/* Drive link */}
          <div className="px-4 py-2 flex justify-end border-t border-sse-border/40">
            <a
              href={indicador.driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-sse-primary hover:underline
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary rounded"
            >
              <ExternalLinkIcon />
              Abrir carpeta del indicador
            </a>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Area section ─────────────────────────────────────────────────────────────

function AreaSection({
  wsId,
  area,
  isAdmin,
}: {
  wsId: string;
  area: AreaEvidencia;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(true);
  const totalArchivos   = area.indicadores.reduce((s, i) => s + i.totalArchivos, 0);

  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 w-full text-left group
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary rounded"
        aria-expanded={open}
      >
        <ChevronIcon open={open} />
        <h2 className="text-[15px] font-semibold text-sse-ink group-hover:text-sse-primary transition-colors">
          {area.nombre}
        </h2>
        <span className="text-xs text-sse-muted">
          {area.indicadores.length} indicadores · {totalArchivos} archivos
        </span>
        <a
          href={area.driveUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="ml-auto inline-flex items-center gap-1 text-xs text-sse-primary hover:underline
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary rounded shrink-0"
        >
          <ExternalLinkIcon />
          Drive
        </a>
      </button>

      {open && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {area.indicadores.map((ind) => (
            <IndicadorCard key={ind.id} wsId={wsId} indicador={ind} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EvidenciasPage() {
  const params  = useParams();
  const wsId    = params?.wsId as string;
  const unidad  = getUnidad(wsId);
  const { role } = useRoleStore();
  const isAdmin  = role === "admin";

  const { data, isLoading, error } = useMonitoreoEvidencias(wsId);

  const totalIndicadores = data?.areas.reduce((s, a) => s + a.indicadores.length, 0) ?? 0;
  const totalArchivos    = data?.areas.reduce((s, a) =>
    s + a.indicadores.reduce((si, i) => si + i.totalArchivos, 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-sse-border pb-4">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">
            Evidencias — {unidad?.nombre ?? wsId?.toUpperCase()}
          </h1>
          <p className="mt-0.5 text-[13px] text-sse-muted">
            Fuente: Google Drive · Organizado por área, indicador y mes
          </p>
        </div>

        {data?.carpetaUrl && (
          <a
            href={data.carpetaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-sse-border bg-sse-surface
                       px-3 py-1.5 text-[12px] text-sse-primary transition-colors
                       hover:bg-black/[0.03] dark:hover:bg-white/[0.03]
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary"
          >
            <ExternalLinkIcon />
            Abrir Drive
          </a>
        )}
      </div>

      {/* Summary */}
      {!isLoading && data && (
        <dl className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-sse-muted">
          <div className="flex items-baseline gap-1">
            <dd><span className="font-semibold text-sse-ink">{data.areas.length}</span> áreas</dd>
          </div>
          <div className="flex items-baseline gap-1">
            <dd><span className="font-semibold text-sse-ink">{totalIndicadores}</span> indicadores</dd>
          </div>
          <div className="flex items-baseline gap-1">
            <dd><span className="font-semibold text-sse-ink">{totalArchivos}</span> archivos totales</dd>
          </div>
        </dl>
      )}

      {/* States */}
      {isLoading && (
        <div className="space-y-6">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-64 rounded" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {Array.from({ length: 3 }, (_, j) => (
                  <Skeleton key={j} className="h-24 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 px-4 py-6 text-center">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">
            No se pudo cargar la evidencia
          </p>
          <p className="text-xs text-red-600 dark:text-red-500 mt-1">{error.message}</p>
        </div>
      )}

      {!isLoading && !error && data && data.areas.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <span className="text-5xl mb-4" aria-hidden>📂</span>
          <h3 className="text-base font-semibold text-sse-ink mb-1">
            {data.mensaje ?? "Sin carpetas de evidencia"}
          </h3>
          <p className="text-sm text-sse-muted max-w-xs">
            Configura la carpeta raíz de evidencias en Google Drive para esta unidad.
          </p>
        </div>
      )}

      {/* Areas */}
      {!isLoading && !error && data && data.areas.length > 0 && (
        <div className="space-y-8">
          {data.areas.map((area) => (
            <AreaSection key={area.id} wsId={wsId} area={area} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}
