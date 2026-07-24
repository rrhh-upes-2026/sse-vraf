"use client";

import { useState } from "react";
import Link from "next/link";
import { useIDEIndicators, usePublishIDEIndicator, useArchiveIDEIndicator, useSendIDEToReview, useDeleteIDEIndicator } from "@/hooks/useIDE";
import type { IDEStatus, IndicatorDefinition } from "@/types/ide";

const STATUS_STYLES: Record<IDEStatus, string> = {
  borrador:    "bg-amber-100 text-amber-700",
  en_revision: "bg-blue-100 text-blue-700",
  publicado:   "bg-green-100 text-green-700",
  archivado:   "bg-sse-border text-sse-muted",
};

const STATUS_LABELS: Record<IDEStatus, string> = {
  borrador:    "Borrador",
  en_revision: "En revisión",
  publicado:   "Publicado",
  archivado:   "Archivado",
};

function StatusBadge({ status }: { status: IDEStatus }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function ActionMenu({ ind, wsId }: { ind: IndicatorDefinition; wsId: string }) {
  const [open, setOpen] = useState(false);
  const publish = usePublishIDEIndicator();
  const archive = useArchiveIDEIndicator();
  const review  = useSendIDEToReview();
  const remove  = useDeleteIDEIndicator();

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)}
        className="text-[10px] px-2 py-1 rounded border border-sse-border text-sse-ink hover:bg-sse-border">
        ···
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-6 z-20 bg-sse-surface border border-sse-border rounded-lg shadow-md py-1 min-w-[140px]">
            <Link href={`/ws/${wsId}/ide-editar/${ind.id}`} onClick={() => setOpen(false)}
              className="block px-3 py-1.5 text-[11px] text-sse-ink hover:bg-sse-border">
              Editar
            </Link>
            <Link href={`/ws/${wsId}/ide-preview/${ind.id}`} onClick={() => setOpen(false)}
              className="block px-3 py-1.5 text-[11px] text-sse-ink hover:bg-sse-border">
              Vista previa
            </Link>
            {ind.status === "borrador" && (
              <button onClick={() => { void review.mutateAsync(ind.id); setOpen(false); }}
                className="w-full text-left px-3 py-1.5 text-[11px] text-sse-ink hover:bg-sse-border">
                Enviar a revisión
              </button>
            )}
            {(ind.status === "borrador" || ind.status === "en_revision") && (
              <button onClick={() => { void publish.mutateAsync(ind.id); setOpen(false); }}
                className="w-full text-left px-3 py-1.5 text-[11px] text-green-700 hover:bg-green-50">
                Publicar
              </button>
            )}
            {ind.status !== "archivado" && (
              <button onClick={() => { void archive.mutateAsync(ind.id); setOpen(false); }}
                className="w-full text-left px-3 py-1.5 text-[11px] text-sse-muted hover:bg-sse-border">
                Archivar
              </button>
            )}
            <div className="border-t border-sse-border mt-1 pt-1">
              <button onClick={() => { void remove.mutateAsync(ind.id); setOpen(false); }}
                className="w-full text-left px-3 py-1.5 text-[11px] text-red-600 hover:bg-red-50">
                Eliminar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function IDEIndicatorList({ wsId }: { wsId: string }) {
  const [statusFilter, setStatusFilter] = useState<IDEStatus | "">("");
  const [search, setSearch] = useState("");

  const { data: indicators, isLoading } = useIDEIndicators(statusFilter ? { status: statusFilter } : undefined);

  const filtered = (indicators ?? []).filter((i) =>
    !search ||
    i.nombre.toLowerCase().includes(search.toLowerCase()) ||
    i.codigo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar indicador…"
            className="text-[12px] border border-sse-border rounded px-3 py-1.5 bg-sse-surface text-sse-ink focus:outline-none focus:ring-2 focus:ring-amber-500 w-52" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as IDEStatus | "")}
            className="text-[12px] border border-sse-border rounded px-2 py-1.5 bg-sse-surface text-sse-ink focus:outline-none">
            <option value="">Todos los estados</option>
            <option value="borrador">Borrador</option>
            <option value="en_revision">En revisión</option>
            <option value="publicado">Publicado</option>
            <option value="archivado">Archivado</option>
          </select>
        </div>
        <Link href={`/ws/${wsId}/ide-crear`}
          className="text-[12px] px-4 py-1.5 rounded bg-amber-600 text-white hover:bg-amber-700 font-medium">
          + Nuevo Indicador
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 rounded-lg bg-sse-border" />)}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-sse-border">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-sse-border bg-sse-surface">
                <th className="text-left px-3 py-2 text-sse-muted font-medium">Código</th>
                <th className="text-left px-3 py-2 text-sse-muted font-medium">Nombre</th>
                <th className="text-right px-3 py-2 text-sse-muted font-medium hidden md:table-cell">Meta</th>
                <th className="text-center px-3 py-2 text-sse-muted font-medium">Estado</th>
                <th className="text-right px-3 py-2 text-sse-muted font-medium hidden md:table-cell">v</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center text-sse-muted py-8">
                  {search || statusFilter ? "Sin resultados para el filtro aplicado." : "Sin indicadores registrados. Crea el primero."}
                </td></tr>
              )}
              {filtered.map((ind) => (
                <tr key={ind.id} className="border-b border-sse-border hover:bg-sse-surface/50">
                  <td className="px-3 py-2.5 font-mono text-amber-700 text-[11px]">{ind.codigo}</td>
                  <td className="px-3 py-2.5">
                    <Link href={`/ws/${wsId}/ide-preview/${ind.id}`} className="font-medium text-sse-ink hover:text-amber-700">
                      {ind.nombre}
                    </Link>
                    {ind.descripcion && <p className="text-sse-muted text-[10px] mt-0.5 truncate max-w-[240px]">{ind.descripcion}</p>}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-sse-ink hidden md:table-cell">
                    {ind.meta ? ind.meta : <span className="text-sse-muted">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-center"><StatusBadge status={ind.status} /></td>
                  <td className="px-3 py-2.5 text-right text-sse-muted tabular-nums hidden md:table-cell">v{ind.version}</td>
                  <td className="px-3 py-2.5 text-right"><ActionMenu ind={ind} wsId={wsId} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
