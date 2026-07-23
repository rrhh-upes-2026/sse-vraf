"use client";

import { cn } from "@/lib/utils";
import type { KPISemaforo } from "@/types/executive";

interface Props {
  semaforos: Record<string, KPISemaforo>;
}

const UNIT_LABELS: Record<string, string> = {
  rrhh:          "Recursos Humanos",
  vraf:          "VRAF",
  compras:       "Compras",
  contabilidad:  "Contabilidad",
  mantenimiento: "Mantenimiento",
  sso:           "SSO",
};

const UNIT_ICONS: Record<string, string> = {
  rrhh:          "👥",
  vraf:          "📊",
  compras:       "🛒",
  contabilidad:  "📒",
  mantenimiento: "🔧",
  sso:           "🦺",
};

const SEMAFORO_CONFIG: Record<KPISemaforo, { label: string; dot: string; ring: string; bg: string }> = {
  verde:    { label: "Operativo",  dot: "bg-emerald-500", ring: "ring-emerald-300 dark:ring-emerald-700", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  amarillo: { label: "Atención",   dot: "bg-amber-500",   ring: "ring-amber-300 dark:ring-amber-700",     bg: "bg-amber-50 dark:bg-amber-950/40" },
  rojo:     { label: "Crítico",    dot: "bg-red-500",     ring: "ring-red-300 dark:ring-red-700",         bg: "bg-red-50 dark:bg-red-950/40" },
};

export function ExecSemaforos({ semaforos }: Props) {
  const entries = Object.entries(semaforos);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">Semáforos por Unidad</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {entries.map(([unitKey, semaforo]) => {
          const cfg = SEMAFORO_CONFIG[semaforo];
          return (
            <div key={unitKey} className={cn("rounded-xl border p-4 flex flex-col items-center gap-3 text-center", cfg.bg)}>
              <div className={cn("h-14 w-14 rounded-full ring-4 flex items-center justify-center text-2xl", cfg.ring)}>
                {UNIT_ICONS[unitKey] ?? "🏢"}
              </div>
              <div>
                <p className="text-xs font-semibold leading-tight">{UNIT_LABELS[unitKey] ?? unitKey}</p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className={cn("h-2 w-2 rounded-full", cfg.dot)} />
                  <span className="text-xs text-muted-foreground">{cfg.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-6 text-xs text-muted-foreground border-t pt-3">
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Verde: operativo dentro de parámetros</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-amber-500" /> Amarillo: requiere atención</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500" /> Rojo: situación crítica</span>
      </div>
    </section>
  );
}
