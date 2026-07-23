"use client";

import { cn } from "@/lib/utils";
import type { StatusCardProps, DashboardEstado } from "@/types/executive";

const ESTADO_CONFIG: Record<DashboardEstado, {
  dot: string; bg: string; border: string; text: string; label: string;
}> = {
  ok:       { dot: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400", label: "Operativo" },
  warning:  { dot: "bg-amber-500",   bg: "bg-amber-50 dark:bg-amber-950/30",     border: "border-amber-200 dark:border-amber-800",     text: "text-amber-700 dark:text-amber-400",   label: "Atención" },
  critical: { dot: "bg-red-500",     bg: "bg-red-50 dark:bg-red-950/30",         border: "border-red-200 dark:border-red-800",         text: "text-red-700 dark:text-red-400",       label: "Crítico" },
};

export function StatusCard({ unitKey, label, estado, estadoRazon, cumplimientoPct, color, icon }: StatusCardProps) {
  const cfg = ESTADO_CONFIG[estado];

  return (
    <div className={cn("rounded-xl border p-3 space-y-2", cfg.bg, cfg.border)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0", cfg.dot)} />
          <span className="text-sm font-semibold truncate">{label}</span>
        </div>
        <span className={cn("text-xs font-medium flex-shrink-0", cfg.text)}>{cfg.label}</span>
      </div>

      {estadoRazon && (
        <p className="text-xs text-muted-foreground line-clamp-2 pl-4">{estadoRazon}</p>
      )}

      {cumplimientoPct !== undefined && (
        <div className="pl-4 space-y-1">
          <div className="h-1 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div
              className={cn("h-full rounded-full", cfg.dot)}
              style={{ width: `${cumplimientoPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{cumplimientoPct}% cumplimiento</p>
        </div>
      )}
    </div>
  );
}
