"use client";

import { cn } from "@/lib/utils";
import type { ExecutiveKPICardProps, KPISemaforo } from "@/types/executive";

const SEMAFORO_COLOR: Record<KPISemaforo, string> = {
  verde:    "text-emerald-600 dark:text-emerald-400",
  amarillo: "text-amber-600 dark:text-amber-400",
  rojo:     "text-red-600 dark:text-red-400",
};

const SEMAFORO_BG: Record<KPISemaforo, string> = {
  verde:    "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
  amarillo: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
  rojo:     "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
};

const SEMAFORO_DOT: Record<KPISemaforo, string> = {
  verde:    "bg-emerald-500",
  amarillo: "bg-amber-500",
  rojo:     "bg-red-500",
};

const TENDENCIA_ICON: Record<string, string> = {
  alza:   "↑",
  baja:   "↓",
  estable: "→",
};

function fmtValor(valor: number, tipo: string, unidad: string): string {
  if (tipo === "moneda") {
    return `$${valor.toLocaleString("es-SV", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  if (tipo === "porcentaje" || unidad === "%") {
    return `${valor.toFixed(1)}%`;
  }
  return `${valor.toLocaleString("es-SV")} ${unidad}`;
}

export function ExecutiveKPICard({ kpi, compact = false }: ExecutiveKPICardProps) {
  const semaforo = kpi.semaforo;
  const pctMeta  = kpi.meta > 0 ? Math.min(100, (kpi.valorActual / kpi.meta) * 100) : null;

  if (compact) {
    return (
      <div className={cn(
        "flex items-center justify-between rounded-lg border px-3 py-2",
        SEMAFORO_BG[semaforo]
      )}>
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn("h-2 w-2 rounded-full flex-shrink-0", SEMAFORO_DOT[semaforo])} />
          <span className="text-sm font-medium text-muted-foreground truncate">{kpi.nombre}</span>
        </div>
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          <span className={cn("text-sm font-bold tabular-nums", SEMAFORO_COLOR[semaforo])}>
            {fmtValor(kpi.valorActual, kpi.tipo, kpi.unidad)}
          </span>
          <span className={cn("text-xs", kpi.tendencia === "alza" ? "text-emerald-500" : kpi.tendencia === "baja" ? "text-red-500" : "text-muted-foreground")}>
            {TENDENCIA_ICON[kpi.tendencia]}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-xl border p-4 space-y-3",
      SEMAFORO_BG[semaforo]
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0", SEMAFORO_DOT[semaforo])} />
            <p className="text-sm font-medium text-muted-foreground leading-tight">{kpi.nombre}</p>
          </div>
          {kpi.descripcion && (
            <p className="text-xs text-muted-foreground/70 mt-0.5 ml-4 line-clamp-1">{kpi.descripcion}</p>
          )}
        </div>
        <span className={cn(
          "text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0",
          kpi.tendencia === "alza" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
          : kpi.tendencia === "baja" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
          : "bg-muted text-muted-foreground"
        )}>
          {TENDENCIA_ICON[kpi.tendencia]} {Math.abs(kpi.variacion)}%
        </span>
      </div>

      <div className="flex items-end justify-between">
        <span className={cn("text-2xl font-bold tabular-nums", SEMAFORO_COLOR[semaforo])}>
          {fmtValor(kpi.valorActual, kpi.tipo, kpi.unidad)}
        </span>
        {kpi.meta > 0 && (
          <span className="text-xs text-muted-foreground">
            meta: {fmtValor(kpi.meta, kpi.tipo, kpi.unidad)}
          </span>
        )}
      </div>

      {pctMeta !== null && (
        <div className="space-y-1">
          <div className="h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", SEMAFORO_DOT[semaforo])}
              style={{ width: `${pctMeta}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">{pctMeta.toFixed(0)}% de meta</p>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground/60">
        <span className="capitalize">{kpi.categoria}</span>
        <span className="capitalize">{kpi.frecuencia}</span>
      </div>
    </div>
  );
}
