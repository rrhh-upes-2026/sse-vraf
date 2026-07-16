"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { InstanceActions } from "./InstanceActions";
import { cn, fmtDate } from "@/lib/utils";
import { WORKFLOW_STATE_LABEL, WORKFLOW_STATE_VARIANT } from "@/lib/workflowStateConfig";
import type { InstanceSummary, InstanceHealth } from "@/types/studio";

type SortKey = keyof Pick<
  InstanceSummary,
  "nombre" | "blueprintName" | "estado" | "currentStageLabel" | "updatedAt" | "health"
>;

type SortDir = "asc" | "desc";

const HEALTH_DOT: Record<InstanceHealth, string> = { // no shared config — health display is table-specific
  ok:       "bg-sse-sem-green-fg",
  warning:  "bg-sse-sem-amber-fg",
  critical: "bg-sse-sem-red-fg",
};

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={cn("ml-1 text-[10px]", active ? "text-sse-primary" : "text-sse-muted")}>
      {active && dir === "asc" ? "▲" : "▼"}
    </span>
  );
}

interface InstanceTableProps {
  summaries: InstanceSummary[];
  isLoading?: boolean;
  onAction?: (action: string, id: string) => void;
}

export function InstanceTable({ summaries, isLoading, onAction }: InstanceTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = [...summaries].sort((a, b) => {
    const av = a[sortKey] ?? "";
    const bv = b[sortKey] ?? "";
    const cmp = String(av).localeCompare(String(bv), "es");
    return sortDir === "asc" ? cmp : -cmp;
  });

  const thClass =
    "text-left text-[11px] font-semibold text-sse-muted uppercase tracking-wide px-3 py-2 select-none cursor-pointer hover:text-sse-ink whitespace-nowrap";
  const tdClass = "px-3 py-2.5 text-[13px] text-sse-ink";

  if (isLoading) {
    return (
      <div className="rounded-md border border-sse-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-sse-border bg-sse-surface">
              {["Instancia", "Blueprint", "Estado", "Etapa", "Asignado", "Salud", "Actualizado", "Acciones"].map(
                (h) => (
                  <th key={h} className={thClass}>
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-sse-border">
                {Array.from({ length: 8 }).map((__, j) => (
                  <td key={j} className={tdClass}>
                    <Skeleton className={cn("h-4", j === 0 ? "w-40" : "w-24")} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="rounded-md border border-sse-border bg-sse-surface">
        <p className="text-center text-sse-muted text-[13px] py-16">
          No hay instancias
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-sse-border overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-sse-border bg-sse-surface">
            {(
              [
                { key: "nombre",            label: "Instancia"   },
                { key: "blueprintName",     label: "Blueprint"   },
                { key: "estado",            label: "Estado"      },
                { key: "currentStageLabel", label: "Etapa actual"},
              ] as { key: SortKey; label: string }[]
            ).map(({ key, label }) => (
              <th key={key} className={thClass} onClick={() => handleSort(key)}>
                {label}
                <SortIcon active={sortKey === key} dir={sortDir} />
              </th>
            ))}
            <th className={cn(thClass, "cursor-default hover:text-sse-muted")}>
              Asignado a
            </th>
            <th
              className={thClass}
              onClick={() => handleSort("health")}
            >
              Salud
              <SortIcon active={sortKey === "health"} dir={sortDir} />
            </th>
            <th className={cn(thClass, "cursor-default hover:text-sse-muted")}>
              Días atascado
            </th>
            <th
              className={thClass}
              onClick={() => handleSort("updatedAt")}
            >
              Actualizado
              <SortIcon active={sortKey === "updatedAt"} dir={sortDir} />
            </th>
            <th className={cn(thClass, "cursor-default hover:text-sse-muted")}>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s, idx) => (
            <tr
              key={s.id}
              className={cn(
                "border-b border-sse-border transition-colors hover:bg-sse-surface",
                idx % 2 === 0 ? "bg-transparent" : "bg-sse-surface/40",
              )}
            >
              <td className={tdClass}>
                <p className="font-medium leading-snug">{s.nombre}</p>
                <p className="text-[11px] text-sse-muted mt-0.5">{s.id}</p>
              </td>
              <td className={cn(tdClass, "text-sse-muted text-[12px]")}>
                {s.blueprintName}
              </td>
              <td className={tdClass}>
                <Badge variant={WORKFLOW_STATE_VARIANT[s.estado]}>
                  {WORKFLOW_STATE_LABEL[s.estado]}
                </Badge>
              </td>
              <td className={cn(tdClass, "text-[12px] text-sse-muted")}>
                {s.currentStageLabel}
              </td>
              <td className={cn(tdClass, "text-[12px] text-sse-muted")}>
                {s.assigneeName ?? <span className="italic">Sin asignar</span>}
              </td>
              <td className={tdClass}>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "inline-block w-2 h-2 rounded-full shrink-0",
                      HEALTH_DOT[s.health],
                    )}
                  />
                  <span className="text-[12px] text-sse-muted capitalize">
                    {s.health}
                  </span>
                </div>
              </td>
              <td className={cn(tdClass, "text-[12px]")}>
                {s.staleDays != null ? (
                  <span
                    className={cn(
                      s.staleDays >= 14
                        ? "text-sse-sem-red-fg font-semibold"
                        : "text-sse-sem-amber-fg",
                    )}
                  >
                    {s.staleDays}d
                  </span>
                ) : (
                  <span className="text-sse-muted">—</span>
                )}
              </td>
              <td className={cn(tdClass, "text-[12px] text-sse-muted whitespace-nowrap")}>
                {fmtDate(s.updatedAt)}
              </td>
              <td className={tdClass}>
                <InstanceActions summary={s} onAction={onAction} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
