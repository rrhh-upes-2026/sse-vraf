"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { KPIDefinicion } from "@/types/executive";
import { ExecutiveKPICard } from "../widgets/ExecutiveKPICard";

interface Props { kpis: KPIDefinicion[]; }

const UNIT_LABELS: Record<string, string> = {
  rrhh:          "Recursos Humanos",
  vraf:          "VRAF",
  compras:       "Compras",
  contabilidad:  "Contabilidad",
  mantenimiento: "Mantenimiento",
  sso:           "SSO",
};

export function ExecIndicadoresGlobales({ kpis }: Props) {
  const visibles = kpis.filter(k => k.visible);
  const units    = Array.from(new Set(visibles.map(k => k.adaptador)));
  const [filter, setFilter] = useState<string>("todos");

  const displayed = filter === "todos"
    ? visibles
    : visibles.filter(k => k.adaptador === filter);

  const semaforoCount = {
    verde:    visibles.filter(k => k.semaforo === "verde").length,
    amarillo: visibles.filter(k => k.semaforo === "amarillo").length,
    rojo:     visibles.filter(k => k.semaforo === "rojo").length,
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold">Indicadores Globales</h2>
          <p className="text-sm text-muted-foreground">{visibles.length} KPIs activos · {semaforoCount.rojo} en rojo</p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />{semaforoCount.verde} verde</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />{semaforoCount.amarillo} amarillo</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />{semaforoCount.rojo} rojo</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {["todos", ...units].map(u => (
          <button
            key={u}
            onClick={() => setFilter(u)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors",
              filter === u
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {u === "todos" ? "Todos" : UNIT_LABELS[u] ?? u}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayed.map(kpi => (
          <ExecutiveKPICard key={kpi.id} kpi={kpi} />
        ))}
        {displayed.length === 0 && (
          <div className="col-span-full text-center py-8 text-sm text-muted-foreground">
            No hay KPIs para este filtro
          </div>
        )}
      </div>
    </section>
  );
}
