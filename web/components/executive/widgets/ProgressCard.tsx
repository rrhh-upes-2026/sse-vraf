"use client";

import { cn } from "@/lib/utils";
import type { ProgressCardProps, KPISemaforo } from "@/types/executive";

const SEMAFORO_BAR: Record<KPISemaforo, string> = {
  verde:    "bg-emerald-500",
  amarillo: "bg-amber-500",
  rojo:     "bg-red-500",
};

const SEMAFORO_TEXT: Record<KPISemaforo, string> = {
  verde:    "text-emerald-600 dark:text-emerald-400",
  amarillo: "text-amber-600 dark:text-amber-400",
  rojo:     "text-red-600 dark:text-red-400",
};

function deriveSemaforo(pct: number): KPISemaforo {
  if (pct >= 90) return "verde";
  if (pct >= 70) return "amarillo";
  return "rojo";
}

export function ProgressCard({ label, valor, meta, unidad, color, semaforo }: ProgressCardProps) {
  const pct    = meta > 0 ? Math.min(100, (valor / meta) * 100) : 0;
  const sem    = semaforo ?? deriveSemaforo(pct);
  const barClr = color ? "" : SEMAFORO_BAR[sem];

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={cn("text-sm font-bold tabular-nums", SEMAFORO_TEXT[sem])}>
          {pct.toFixed(0)}%
        </span>
      </div>

      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold tabular-nums">
          {valor.toLocaleString("es-SV")}{unidad ? ` ${unidad}` : ""}
        </span>
        <span className="text-xs text-muted-foreground">
          / {meta.toLocaleString("es-SV")}{unidad ? ` ${unidad}` : ""}
        </span>
      </div>

      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", barClr)}
          style={{ width: `${pct}%`, ...(color ? { backgroundColor: color } : {}) }}
        />
      </div>
    </div>
  );
}
