"use client";

import { cn } from "@/lib/utils";
import type { ExecutiveSummaryCardProps, DashboardEstado, KPISemaforo } from "@/types/executive";

const ESTADO_CONFIG: Record<DashboardEstado, { label: string; dot: string; border: string; badge: string }> = {
  ok:       { label: "Operativo",  dot: "bg-emerald-500", border: "border-l-emerald-500", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  warning:  { label: "Atención",   dot: "bg-amber-500",   border: "border-l-amber-500",   badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  critical: { label: "Crítico",    dot: "bg-red-500",     border: "border-l-red-500",     badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" },
};

const SEMAFORO_COLOR: Record<KPISemaforo, string> = {
  verde:    "text-emerald-600 dark:text-emerald-400",
  amarillo: "text-amber-600 dark:text-amber-400",
  rojo:     "text-red-600 dark:text-red-400",
};

export function ExecutiveSummaryCard({ unit, onClick }: ExecutiveSummaryCardProps) {
  const cfg = ESTADO_CONFIG[unit.estado];

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className={cn(
        "rounded-xl border bg-card p-4 border-l-4 transition-shadow",
        cfg.border,
        onClick && "cursor-pointer hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0", cfg.dot)} />
            <h3 className="font-semibold text-sm truncate">{unit.label}</h3>
          </div>
          {unit.estadoRazon && (
            <p className="text-xs text-muted-foreground mt-0.5 ml-4.5 line-clamp-1">{unit.estadoRazon}</p>
          )}
        </div>
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0", cfg.badge)}>
          {cfg.label}
        </span>
      </div>

      {unit.kpis.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {unit.kpis.slice(0, 4).map((kpi) => (
            <div key={kpi.id} className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
              <p className={cn("text-sm font-semibold tabular-nums", SEMAFORO_COLOR[kpi.semaforo])}>
                {kpi.valor}{kpi.unidad === "%" ? "%" : kpi.unidad ? ` ${kpi.unidad}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}

      {unit.alertas.filter(a => a.nivel === "critical").length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-red-600 dark:text-red-400">
            ⚠ {unit.alertas.filter(a => a.nivel === "critical").length} alerta(s) crítica(s)
          </p>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden mr-3">
          <div
            className={cn("h-full rounded-full", cfg.dot)}
            style={{ width: `${unit.cumplimientoPct}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground tabular-nums flex-shrink-0">
          {unit.cumplimientoPct}%
        </span>
      </div>
    </div>
  );
}
