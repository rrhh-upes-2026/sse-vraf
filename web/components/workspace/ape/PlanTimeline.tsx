"use client";

import Link from "next/link";
import { useAPEPlanes } from "@/hooks/useAPE";
import { Skeleton } from "@/components/ui/skeleton";
import type { APEPlan, APEStatus } from "@/types/ape";

interface Props {
  wsId: string;
  year?: string;
}

const STATUS_COLORS: Record<APEStatus, string> = {
  Programada: "bg-sse-sem-green-fg",
  Próxima:    "bg-blue-500",
  Pendiente:  "bg-amber-500",
  Archivada:  "bg-sse-muted/40",
  Cancelada:  "bg-sse-sem-red-fg",
};

const MONTH_NAMES_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function dayOfYear(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00");
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function daysInYear(year: number): number {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 366 : 365;
}

function pct(dateStr: string, totalDays: number): number {
  return Math.max(0, Math.min(100, (dayOfYear(dateStr) / totalDays) * 100));
}

function durationPct(startStr: string, endStr: string, totalDays: number): number {
  const start = pct(startStr, totalDays);
  const end   = pct(endStr,   totalDays);
  return Math.max(0.5, end - start);
}

export function PlanTimeline({ wsId, year }: Props) {
  const currentYear = year ?? new Date().getFullYear().toString();
  const numYear = parseInt(currentYear, 10);
  const total   = daysInYear(numYear);

  const { data: rawPlanes = [], isLoading } = useAPEPlanes({ year: currentYear });

  const planes = [...rawPlanes].sort((a: APEPlan, b: APEPlan) =>
    a.plannedStartDate.localeCompare(b.plannedStartDate),
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 rounded" />)}
      </div>
    );
  }

  const monthPositions = MONTH_NAMES_SHORT.map((name, i) => {
    const d = new Date(numYear, i, 1);
    return { name, left: pct(`${currentYear}-${String(i + 1).padStart(2, "0")}-01`, total) };
  });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Month axis */}
          <div className="relative h-6 mb-1 border-b border-sse-border">
            {monthPositions.map((m) => (
              <span
                key={m.name}
                className="absolute text-[10px] text-sse-muted transform -translate-x-1/2"
                style={{ left: `${m.left}%` }}
              >
                {m.name}
              </span>
            ))}
          </div>

          {/* Grid + bars */}
          <div className="relative">
            {/* Vertical month lines */}
            {monthPositions.map((m) => (
              <div
                key={m.name}
                className="absolute top-0 bottom-0 border-l border-sse-border/40"
                style={{ left: `${m.left}%` }}
              />
            ))}

            {planes.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-sse-muted">
                No hay planes registrados para {currentYear}.
              </p>
            ) : (
              planes.map((plan: APEPlan) => {
                const leftPct  = pct(plan.plannedStartDate, total);
                const widthPct = durationPct(plan.plannedStartDate, plan.plannedEndDate, total);

                return (
                  <div key={plan.id} className="relative h-9 mb-1 flex items-center group">
                    {/* Label (left of bar) */}
                    <div
                      className="absolute right-[calc(100%-var(--bar-left))] pr-2 truncate text-[11px] text-sse-muted max-w-[180px] hidden sm:block"
                      style={{ "--bar-left": `${leftPct}%` } as React.CSSProperties}
                    />

                    {/* Bar */}
                    <Link
                      href={`/ws/${wsId}/ape-planes/${plan.id}`}
                      className={`absolute h-6 rounded flex items-center px-2 text-white text-[11px] truncate hover:opacity-80 transition-opacity ${STATUS_COLORS[plan.status]}`}
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      title={`${plan.title} — ${plan.plannedStartDate} → ${plan.plannedEndDate}`}
                    >
                      <span className="truncate">{plan.title}</span>
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {(["Programada", "Próxima", "Pendiente", "Archivada", "Cancelada"] as APEStatus[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={`inline-block w-3 h-3 rounded-sm ${STATUS_COLORS[s]}`} />
            <span className="text-[11px] text-sse-muted">{s}</span>
          </div>
        ))}
      </div>

      <p className="text-[12px] text-sse-muted">{planes.length} planes en {currentYear}</p>
    </div>
  );
}
