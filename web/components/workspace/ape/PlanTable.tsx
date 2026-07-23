"use client";

import { useState } from "react";
import Link from "next/link";
import { useAPEPlanes } from "@/hooks/useAPE";
import { Skeleton } from "@/components/ui/skeleton";
import type { APEStatus, APEPriority, APEPlan } from "@/types/ape";

interface Props {
  wsId: string;
  year?: string;
}

const STATUS_COLORS: Record<APEStatus, string> = {
  Programada: "bg-sse-sem-green-bg text-sse-sem-green-fg",
  Próxima:    "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Pendiente:  "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Archivada:  "bg-sse-muted/10 text-sse-muted",
  Cancelada:  "bg-sse-sem-red-bg text-sse-sem-red-fg",
};

const PRIORITY_COLORS: Record<APEPriority, string> = {
  Alta:  "text-sse-sem-red-fg",
  Media: "text-amber-600 dark:text-amber-400",
  Baja:  "text-sse-muted",
};

const ALL_STATUSES: APEStatus[] = ["Programada", "Próxima", "Pendiente", "Archivada", "Cancelada"];

export function PlanTable({ wsId, year }: Props) {
  const currentYear = year ?? new Date().getFullYear().toString();
  const [statusFilter, setStatusFilter] = useState<APEStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<APEPriority | "">("");
  const [search, setSearch] = useState("");

  const { data: planes = [], isLoading } = useAPEPlanes({
    year: currentYear,
    ...(statusFilter ? { status: statusFilter } : {}),
  });

  const filtered = planes.filter((p: APEPlan) => {
    if (priorityFilter && p.priority !== priorityFilter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-1 focus:ring-sse-primary"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as APEStatus | "")}
          className="rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary"
        >
          <option value="">Todos los estados</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as APEPriority | "")}
          className="rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary"
        >
          <option value="">Toda prioridad</option>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border border-sse-border">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-sse-border bg-sse-surface">
              <th className="px-3 py-2 text-left font-medium text-sse-muted">#</th>
              <th className="px-3 py-2 text-left font-medium text-sse-muted">Título</th>
              <th className="px-3 py-2 text-left font-medium text-sse-muted">Periodicidad</th>
              <th className="px-3 py-2 text-left font-medium text-sse-muted">Inicio</th>
              <th className="px-3 py-2 text-left font-medium text-sse-muted">Fin</th>
              <th className="px-3 py-2 text-left font-medium text-sse-muted">Prioridad</th>
              <th className="px-3 py-2 text-left font-medium text-sse-muted">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-sse-muted">
                  No hay planes para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filtered.map((plan: APEPlan, idx: number) => (
                <tr key={plan.id} className="border-b border-sse-border hover:bg-sse-muted/5 transition-colors">
                  <td className="px-3 py-2 font-mono text-sse-muted">
                    {plan.plannedExecutionNumber ?? idx + 1}
                  </td>
                  <td className="px-3 py-2 max-w-[260px]">
                    <Link
                      href={`/ws/${wsId}/ape-planes/${plan.id}`}
                      className="font-medium text-sse-ink hover:text-sse-primary transition-colors truncate block"
                    >
                      {plan.title}
                    </Link>
                    {plan.responsibleUser && (
                      <p className="text-[11px] text-sse-muted truncate">{plan.responsibleUser}</p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-sse-muted">{plan.periodicity}</td>
                  <td className="px-3 py-2 font-mono text-sse-ink">{plan.plannedStartDate}</td>
                  <td className="px-3 py-2 font-mono text-sse-ink">{plan.plannedEndDate}</td>
                  <td className={`px-3 py-2 font-medium ${PRIORITY_COLORS[plan.priority]}`}>
                    {plan.priority}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_COLORS[plan.status]}`}>
                      {plan.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[12px] text-sse-muted text-right">
        {filtered.length} de {planes.length} planes
      </p>
    </div>
  );
}
