"use client";

import type { KPIDefinicion } from "@/types/executive";
import { TrendCard } from "../widgets/TrendCard";

interface Props { kpis: KPIDefinicion[]; }

export function ExecTendencias({ kpis }: Props) {
  const conTendencia = kpis.filter(k => k.visible && (k.tendencia === "alza" || k.tendencia === "baja"));
  const enAlza  = conTendencia.filter(k => k.tendencia === "alza");
  const enBaja  = conTendencia.filter(k => k.tendencia === "baja");

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Tendencias</h2>
          <p className="text-sm text-muted-foreground">{enAlza.length} en alza · {enBaja.length} en baja</p>
        </div>
      </div>

      {enAlza.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            ↑ En Alza
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {enAlza.slice(0, 6).map(kpi => (
              <TrendCard
                key={kpi.id}
                label={kpi.nombre}
                valor={kpi.valorActual}
                unidad={kpi.unidad}
                tendencia={kpi.tendencia}
                variacion={kpi.variacion}
                semaforo={kpi.semaforo}
                meta={kpi.meta}
              />
            ))}
          </div>
        </div>
      )}

      {enBaja.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
            ↓ En Baja
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {enBaja.slice(0, 6).map(kpi => (
              <TrendCard
                key={kpi.id}
                label={kpi.nombre}
                valor={kpi.valorActual}
                unidad={kpi.unidad}
                tendencia={kpi.tendencia}
                variacion={kpi.variacion}
                semaforo={kpi.semaforo}
                meta={kpi.meta}
              />
            ))}
          </div>
        </div>
      )}

      {conTendencia.length === 0 && (
        <div className="rounded-xl border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Todos los indicadores se mantienen estables</p>
        </div>
      )}
    </section>
  );
}
