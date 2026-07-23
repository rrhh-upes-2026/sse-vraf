"use client";

import { useState } from "react";
import Link from "next/link";
import { useEMEEvidencias, useEMECatalogos } from "@/hooks/useEME";
import { Skeleton } from "@/components/ui/skeleton";
import type { EMEEvidence, EMEStatus } from "@/types/eme";

interface Props {
  wsId: string;
}

const STATUS_COLORS: Record<EMEStatus, string> = {
  "Pendiente":     "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Cargada":       "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "En validación": "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  "Validada":      "bg-sse-sem-green-bg text-sse-sem-green-fg",
  "Rechazada":     "bg-sse-sem-red-bg text-sse-sem-red-fg",
  "Archivada":     "bg-sse-muted/10 text-sse-muted",
};

const CONF_LABELS: Record<string, string> = {
  publica:      "Pública",
  interna:      "Interna",
  confidencial: "Confidencial",
  restringida:  "Restringida",
};

const ALL_STATUSES: EMEStatus[] = [
  "Pendiente", "Cargada", "En validación", "Validada", "Rechazada", "Archivada",
];

function fmtSize(bytes: number | string): string {
  const n = Number(bytes);
  if (!n) return "—";
  if (n < 1024)        return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function parseTags(raw: string): string[] {
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

export function EvidenciaRepositorio({ wsId }: Props) {
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState<EMEStatus | "">("");
  const [typeFilter, setType]       = useState("");
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");
  const [unitFilter, setUnit]       = useState("");
  const [processFilter, setProcess] = useState("");
  const [tagFilter, setTag]         = useState("");

  const { data: tiposData }   = useEMECatalogos("tipoEvidencia");
  const tipos = tiposData?.items ?? [];

  const { data: rawData, isLoading } = useEMEEvidencias({
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(typeFilter   ? { evidenceType: typeFilter } : {}),
    ...(unitFilter   ? { organizationalUnitId: unitFilter } : {}),
    ...(processFilter? { processId: processFilter } : {}),
    ...(dateFrom     ? { dateFrom } : {}),
    ...(dateTo       ? { dateTo } : {}),
    ...(search       ? { q: search } : {}),
    _pageSize: 500,
  });

  const items: EMEEvidence[] = Array.isArray(rawData)
    ? rawData
    : (rawData as { items?: EMEEvidence[] })?.items ?? [];

  const filtered = items.filter((e) => {
    if (tagFilter) {
      const tags = parseTags(e.tags);
      if (!tags.some((t) => t.toLowerCase().includes(tagFilter.toLowerCase()))) return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 rounded" />)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filters row 1 */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Buscar por título, descripción, archivo, tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-1 focus:ring-sse-primary"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatus(e.target.value as EMEStatus | "")}
          className="rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary"
        >
          <option value="">Todos los estados</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setType(e.target.value)}
          className="rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary"
        >
          <option value="">Todos los tipos</option>
          {tipos.map((t) => <option key={t.id} value={t.valor}>{t.etiqueta}</option>)}
        </select>
      </div>

      {/* Filters row 2 */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Unidad organizacional..."
          value={unitFilter}
          onChange={(e) => setUnit(e.target.value)}
          className="rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-1 focus:ring-sse-primary"
        />
        <input
          type="text"
          placeholder="Proceso..."
          value={processFilter}
          onChange={(e) => setProcess(e.target.value)}
          className="rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-1 focus:ring-sse-primary"
        />
        <input
          type="text"
          placeholder="Etiqueta..."
          value={tagFilter}
          onChange={(e) => setTag(e.target.value)}
          className="rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-1 focus:ring-sse-primary"
        />
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary" />
        <input type="date" value={dateTo}   onChange={(e) => setDateTo(e.target.value)}
          className="rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border border-sse-border">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-sse-border bg-sse-surface">
              <th className="px-3 py-2 text-left font-medium text-sse-muted">Título</th>
              <th className="px-3 py-2 text-left font-medium text-sse-muted">Tipo</th>
              <th className="px-3 py-2 text-left font-medium text-sse-muted">Versión</th>
              <th className="px-3 py-2 text-left font-medium text-sse-muted">Responsable</th>
              <th className="px-3 py-2 text-left font-medium text-sse-muted">Fecha</th>
              <th className="px-3 py-2 text-left font-medium text-sse-muted">Tamaño</th>
              <th className="px-3 py-2 text-left font-medium text-sse-muted">Confidencial.</th>
              <th className="px-3 py-2 text-left font-medium text-sse-muted">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-sse-muted">
                  No hay evidencias para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filtered.map((e: EMEEvidence) => (
                <tr key={e.id} className="border-b border-sse-border hover:bg-sse-muted/5 transition-colors">
                  <td className="px-3 py-2 max-w-[220px]">
                    <Link
                      href={`/ws/${wsId}/eme-evidencias/${e.id}`}
                      className="font-medium text-sse-ink hover:text-sse-primary transition-colors truncate block"
                    >
                      {e.title}
                    </Link>
                    {e.originalFileName && (
                      <p className="text-[11px] text-sse-muted truncate">{e.originalFileName}</p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-sse-muted text-[12px] capitalize">
                    {e.evidenceType?.replace(/-/g, " ") || "—"}
                  </td>
                  <td className="px-3 py-2 font-mono text-sse-muted text-[12px]">
                    v{e.version}
                  </td>
                  <td className="px-3 py-2 text-sse-muted text-[12px]">{e.uploadedBy || "—"}</td>
                  <td className="px-3 py-2 font-mono text-sse-muted text-[12px]">
                    {e.uploadedAt?.slice(0, 10) || "—"}
                  </td>
                  <td className="px-3 py-2 font-mono text-sse-muted text-[12px]">
                    {fmtSize(e.fileSize)}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-sse-muted">
                    {CONF_LABELS[e.confidentialityLevel] ?? e.confidentialityLevel ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_COLORS[e.status as EMEStatus] ?? "bg-sse-muted/10 text-sse-muted"}`}>
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[12px] text-sse-muted text-right">
        {filtered.length} de {items.length} evidencias
      </p>
    </div>
  );
}
