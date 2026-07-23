"use client";

import { cn } from "@/lib/utils";
import type { AlertCardProps } from "@/types/executive";

type Nivel = "info" | "warning" | "critical";

const NIVEL_CONFIG: Record<Nivel, { icon: string; bg: string; border: string; title: string; text: string }> = {
  critical: { icon: "🔴", bg: "bg-red-50 dark:bg-red-950/30",     border: "border-red-300 dark:border-red-700",     title: "text-red-800 dark:text-red-300",     text: "text-red-700 dark:text-red-400" },
  warning:  { icon: "🟡", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-300 dark:border-amber-700", title: "text-amber-800 dark:text-amber-300", text: "text-amber-700 dark:text-amber-400" },
  info:     { icon: "🔵", bg: "bg-blue-50 dark:bg-blue-950/30",   border: "border-blue-300 dark:border-blue-700",   title: "text-blue-800 dark:text-blue-300",   text: "text-blue-700 dark:text-blue-400" },
};

export function AlertCard({ alerta, unitLabel }: AlertCardProps) {
  const nivel  = ("nivel" in alerta ? alerta.nivel : "critical") as Nivel;
  const cfg    = NIVEL_CONFIG[nivel];
  const origen = "unitLabel" in alerta ? alerta.unitLabel : unitLabel;
  const accion = "accion" in alerta ? alerta.accion : null;

  return (
    <div className={cn("rounded-lg border p-3 space-y-1.5", cfg.bg, cfg.border)}>
      <div className="flex items-start gap-2">
        <span className="text-base flex-shrink-0">{cfg.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {origen && (
              <span className="text-xs font-medium text-muted-foreground">{origen}</span>
            )}
            <span className={cn("text-xs font-semibold capitalize", cfg.title)}>
              {nivel === "critical" ? "Crítico" : nivel === "warning" ? "Advertencia" : "Info"}
            </span>
          </div>
          <p className={cn("text-sm font-medium mt-0.5", cfg.text)}>{alerta.mensaje}</p>
          {accion && (
            <p className="text-xs text-muted-foreground mt-1">Acción: {accion}</p>
          )}
        </div>
      </div>
    </div>
  );
}
