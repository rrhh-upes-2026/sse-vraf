"use client";

import { cn } from "@/lib/utils";
import type { TrendCardProps, KPISemaforo } from "@/types/executive";

const SEMAFORO_COLOR: Record<KPISemaforo, string> = {
  verde:    "text-emerald-600 dark:text-emerald-400",
  amarillo: "text-amber-600 dark:text-amber-400",
  rojo:     "text-red-600 dark:text-red-400",
};

const SEMAFORO_BG: Record<KPISemaforo, string> = {
  verde:    "bg-emerald-50 dark:bg-emerald-950/30",
  amarillo: "bg-amber-50 dark:bg-amber-950/30",
  rojo:     "bg-red-50 dark:bg-red-950/30",
};

export function TrendCard({ label, valor, unidad, tendencia, variacion, semaforo, meta }: TrendCardProps) {
  const sem = semaforo ?? "verde";
  const isUp = tendencia === "alza";
  const isDown = tendencia === "baja";

  return (
    <div className={cn("rounded-xl border p-4 space-y-2", semaforo ? SEMAFORO_BG[sem] : "bg-card")}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>

      <div className="flex items-end gap-2">
        <span className={cn("text-3xl font-bold tabular-nums", semaforo ? SEMAFORO_COLOR[sem] : "text-foreground")}>
          {typeof valor === "number" ? valor.toLocaleString("es-SV") : valor}
        </span>
        {unidad && <span className="text-sm text-muted-foreground mb-1">{unidad}</span>}
      </div>

      <div className="flex items-center gap-2">
        <span className={cn(
          "inline-flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full",
          isUp   ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
          : isDown ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
          : "bg-muted text-muted-foreground"
        )}>
          {isUp ? "↑" : isDown ? "↓" : "→"}
          {Math.abs(variacion)}%
        </span>
        {meta !== undefined && meta > 0 && (
          <span className="text-xs text-muted-foreground">
            meta: {meta.toLocaleString("es-SV")}{unidad ? ` ${unidad}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}
