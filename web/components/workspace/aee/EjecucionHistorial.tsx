"use client";

import { useState } from "react";
import Link from "next/link";
import { useAEEEjecuciones } from "@/hooks/useAEE";
import { Skeleton } from "@/components/ui/skeleton";
import type { AEEExecution, AEEStatus } from "@/types/aee";

interface Props {
  wsId: string;
}

const STATUS_COLORS: Record<AEEStatus, string> = {
  "Pendiente":                    "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "En ejecución":                 "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "Finalizada":                   "bg-sse-sem-green-bg text-sse-sem-green-fg",
  "Finalizada con observaciones": "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  "Reprogramada":                 "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  "Cancelada":                    "bg-sse-sem-red-bg text-sse-sem-red-fg",
  "No ejecutada":                 "bg-sse-muted/10 text-sse-muted",
};

const ALL_STATUSES: AEEStatus[] = [
  "Pendiente", "En ejecución", "Finalizada",
  "Finalizada con observaciones", "Reprogramada", "Cancelada", "No ejecutada",
];

export function EjecucionHistorial({ wsId }: Props) {
  const [statusFilter, setStatusFilter] = useState<AEEStatus | "">("");
  const [search, setSearch]             = useState("");
  const [dateFrom, setDateFrom]         = useState("");
  const [dateTo, setDateTo]             = useState("");

  const { data: rawData, isLoading } = useAEEEjecuciones({
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(dateFrom ? { executionDate: dateFrom } : {}),
    _pageSize: 500,
  });

  const ejecuciones: AEEExecution[] = Array.isArray(rawData) ? rawData : [];

  const filtered = ejecuciones.filter((e) => {
    if (search && !e.executedBy.toLowerCase().includes(search.toLowerCase()) &&
        !e.planId.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateTo && e.executionDate > dateTo) return false;
    return true;
  });

  const fmtDuration = (mins?: string | number) => {
    const n = Number(mins);
    if (!n) return "—";
    return n < 60 ? `${n}m` : `${Math.floor(n / 60)}h ${n % 60}m`;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 rounded" />)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Buscar por responsable o plan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-1 focus:ring-sse-primary"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AEEStatus | "")}
          className="rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary"
        >
          <option value="">Todos los estados</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary" />
        <input type="date" value={dateTo}   onChange={(e) => setDateTo(e.target.value)}   className="rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border border-sse-border">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-sse-border bg-sse-surface">
              <th className="px-3 py-2 text-left font-medium text-sse-muted">#</th>
              <th className="px-3 py-2 text-left font-medium text-sse-muted">Fecha</th>
              <th className="px-3 py-2 text-left font-medium text-sse-muted">Responsable</th>
              <th className="px-3 py-2 text-left font-medium text-sse-muted">Horario</th>
              <th className="px-3 py-2 text-left font-medium text-sse-muted">Duración</th>
              <th className="px-3 py-2 text-left font-medium text-sse-muted">Resultado</th>
              <th className="px-3 py-2 text-left font-medium text-sse-muted">Estado</th>
              <th className="px-3 py-2 text-left font-medium text-sse-muted">Incidente</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-sse-muted">
                  No hay ejecuciones para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filtered.map((e: AEEExecution) => (
                <tr key={e.id} className="border-b border-sse-border hover:bg-sse-muted/5 transition-colors">
                  <td className="px-3 py-2 font-mono text-sse-muted">{e.executionNumber}</td>
                  <td className="px-3 py-2 font-mono text-sse-ink">{e.executionDate}</td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/ws/${wsId}/aee-ejecuciones/${e.id}`}
                      className="font-medium text-sse-ink hover:text-sse-primary transition-colors"
                    >
                      {e.executedBy}
                    </Link>
                    {e.responsiblePosition && (
                      <p className="text-[11px] text-sse-muted">{e.responsiblePosition}</p>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-sse-muted">
                    {e.startTime && e.endTime ? `${e.startTime}–${e.endTime}` : "—"}
                  </td>
                  <td className="px-3 py-2 font-mono text-sse-ink">
                    {fmtDuration(e.durationMinutes)}
                  </td>
                  <td className="px-3 py-2 text-sse-muted text-[12px]">
                    {e.executionResult || "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_COLORS[e.status]}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {(e.incidentReported === "true" || e.incidentReported === true) ? (
                      <span className="text-sse-sem-red-fg font-bold">!</span>
                    ) : (
                      <span className="text-sse-muted">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[12px] text-sse-muted text-right">
        {filtered.length} de {ejecuciones.length} ejecuciones
      </p>
    </div>
  );
}
