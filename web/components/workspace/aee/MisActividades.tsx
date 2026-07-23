"use client";

import Link from "next/link";
import { useState } from "react";
import { useAEEMisActividades } from "@/hooks/useAEE";
import { Skeleton } from "@/components/ui/skeleton";
import type { APEPlan } from "@/types/ape";

interface Props {
  wsId:      string;
  userId:    string;
  year?:     string;
}

const PRIORITY_ORDER: Record<string, number> = { Alta: 0, Media: 1, Baja: 2 };

const STATUS_COLORS: Record<string, string> = {
  Programada: "bg-sse-sem-green-bg text-sse-sem-green-fg",
  Próxima:    "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Pendiente:  "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

type SortKey = "fecha" | "prioridad" | "proceso" | "procedimiento" | "actividad";

export function MisActividades({ wsId, userId, year }: Props) {
  const currentYear = year ?? new Date().getFullYear().toString();
  const [sortKey, setSortKey] = useState<SortKey>("fecha");

  const { data, isLoading } = useAEEMisActividades(userId, { year: currentYear });
  const plans: APEPlan[] = (data?.items ?? []).slice();

  const sorted = plans.sort((a, b) => {
    switch (sortKey) {
      case "fecha":
        return a.plannedStartDate.localeCompare(b.plannedStartDate);
      case "prioridad":
        return (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9);
      case "proceso":
        return (a.processId ?? "").localeCompare(b.processId ?? "");
      case "procedimiento":
        return (a.procedureId ?? "").localeCompare(b.procedureId ?? "");
      case "actividad":
        return a.activityId.localeCompare(b.activityId);
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-md" />)}
      </div>
    );
  }

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => setSortKey(k)}
      className={`px-3 py-1 rounded text-[12px] font-medium transition-colors ${
        sortKey === k
          ? "bg-sse-primary text-white"
          : "bg-sse-surface border border-sse-border text-sse-muted hover:text-sse-ink"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Sort controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[12px] text-sse-muted">Ordenar:</span>
        <SortBtn k="fecha"        label="Fecha" />
        <SortBtn k="prioridad"    label="Prioridad" />
        <SortBtn k="proceso"      label="Proceso" />
        <SortBtn k="procedimiento"label="Procedimiento" />
        <SortBtn k="actividad"    label="Actividad" />
      </div>

      {sorted.length === 0 ? (
        <div className="py-12 text-center text-[13px] text-sse-muted">
          No tienes actividades planificadas para {currentYear}.
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((plan) => (
            <div
              key={plan.id}
              className="bg-sse-surface border border-sse-border rounded-md p-4 flex items-start justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${STATUS_COLORS[plan.status] ?? "bg-sse-muted/10 text-sse-muted"}`}>
                    {plan.status}
                  </span>
                  <span className={`text-[11px] font-medium ${
                    plan.priority === "Alta"
                      ? "text-sse-sem-red-fg"
                      : plan.priority === "Media"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-sse-muted"
                  }`}>
                    {plan.priority}
                  </span>
                </div>
                <p className="text-[13px] font-medium text-sse-ink leading-snug">{plan.title}</p>
                <div className="flex gap-3 mt-1 text-[11px] text-sse-muted">
                  <span>{plan.plannedStartDate} → {plan.plannedEndDate}</span>
                  {plan.periodicity && <span>{plan.periodicity}</span>}
                  {plan.plannedExecutionNumber && <span>#{plan.plannedExecutionNumber}</span>}
                </div>
              </div>
              <Link
                href={`/ws/${wsId}/aee-registro/nuevo?planId=${plan.id}`}
                className="shrink-0 rounded-md bg-sse-primary px-3 py-1.5 text-[12px] font-medium text-white hover:bg-sse-primary/90 transition-colors"
              >
                Registrar
              </Link>
            </div>
          ))}
        </div>
      )}

      <p className="text-[12px] text-sse-muted">{sorted.length} actividades en {currentYear}</p>
    </div>
  );
}
