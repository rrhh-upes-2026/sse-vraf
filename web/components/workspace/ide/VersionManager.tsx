"use client";

import { useState } from "react";
import { useIDEIndicators, useIDEVersions, useDuplicateIDEVersion } from "@/hooks/useIDE";
import type { IndicatorVersion, IDEStatus } from "@/types/ide";

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

function VersionRow({ ver }: { ver: IndicatorVersion }) {
  const dup = useDuplicateIDEVersion();

  return (
    <tr className="border-b border-sse-border hover:bg-sse-surface/50">
      <td className="px-3 py-2.5 tabular-nums text-sse-ink font-mono">v{ver.version}</td>
      <td className="px-3 py-2.5 text-center">
        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[ver.status as IDEStatus]}`}>
          {STATUS_LABELS[ver.status as IDEStatus] ?? ver.status}
        </span>
      </td>
      <td className="px-3 py-2.5 text-sse-muted hidden md:table-cell">
        {ver.publishedAt ? new Date(ver.publishedAt).toLocaleDateString("es-SV") : "—"}
      </td>
      <td className="px-3 py-2.5 text-sse-muted hidden md:table-cell">
        {ver.createdAt ? new Date(ver.createdAt).toLocaleDateString("es-SV") : "—"}
      </td>
      <td className="px-3 py-2.5 text-right">
        <button
          onClick={() => void dup.mutateAsync(ver.id)}
          disabled={dup.isPending}
          className="text-[10px] px-2 py-1 rounded border border-sse-border text-sse-ink hover:bg-sse-border disabled:opacity-50">
          Duplicar como borrador
        </button>
      </td>
    </tr>
  );
}

export function IDEVersionManager({ wsId }: { wsId: string }) {
  void wsId;
  const [selectedId, setSelectedId] = useState("");
  const { data: indicators } = useIDEIndicators();
  const { data: versions, isLoading } = useIDEVersions(selectedId);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[11px] text-sse-muted mb-1">Seleccionar indicador</label>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
          className="text-[12px] border border-sse-border rounded px-3 py-1.5 bg-sse-surface text-sse-ink focus:outline-none focus:ring-2 focus:ring-amber-500 w-72">
          <option value="">Seleccionar indicador…</option>
          {(indicators ?? []).map((i) => (
            <option key={i.id} value={i.id}>{i.codigo} — {i.nombre}</option>
          ))}
        </select>
      </div>

      {selectedId && (
        isLoading ? (
          <div className="animate-pulse space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 rounded-lg bg-sse-border" />)}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-sse-border">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-sse-border bg-sse-surface">
                  <th className="text-left px-3 py-2 text-sse-muted font-medium">Versión</th>
                  <th className="text-center px-3 py-2 text-sse-muted font-medium">Estado</th>
                  <th className="text-left px-3 py-2 text-sse-muted font-medium hidden md:table-cell">Publicado</th>
                  <th className="text-left px-3 py-2 text-sse-muted font-medium hidden md:table-cell">Creado</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {(versions ?? []).length === 0 && (
                  <tr><td colSpan={5} className="text-center text-sse-muted py-6">Sin versiones registradas.</td></tr>
                )}
                {(versions ?? []).map((v) => <VersionRow key={v.id} ver={v} />)}
              </tbody>
            </table>
          </div>
        )
      )}

      {!selectedId && (
        <p className="text-[12px] text-sse-muted">Selecciona un indicador para ver su historial de versiones.</p>
      )}
    </div>
  );
}
