"use client";

import { cn } from "@/lib/utils";
import type { ExecutiveDashboardResumen } from "@/types/executive";
import { GaugeCard } from "../widgets/GaugeCard";
import { TrendCard }  from "../widgets/TrendCard";

interface Props { data: ExecutiveDashboardResumen; }

export function ExecResumenEjecutivo({ data }: Props) {
  const g = data.globales;
  const totalUnidades = data.unidades.length;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Resumen Ejecutivo</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Vista consolidada al {new Date(data.generadoEn).toLocaleDateString("es-SV", { dateStyle: "long" })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="col-span-1">
          <GaugeCard
            label="Cumplimiento Institucional"
            valor={g.cumplimientoPromedio}
            meta={100}
            unidad="%"
            size="lg"
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Unidades Operativas</p>
            <p className="text-3xl font-bold mt-1">{totalUnidades}</p>
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Ok</span>
                <span className="font-semibold tabular-nums">{g.unidadesOk}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />Atención</span>
                <span className="font-semibold tabular-nums">{g.unidadesWarning}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" />Crítico</span>
                <span className="font-semibold tabular-nums">{g.unidadesCritical}</span>
              </div>
            </div>
          </div>
        </div>

        <TrendCard
          label="Alertas Críticas"
          valor={g.alertasCriticasCount}
          tendencia={g.alertasCriticasCount === 0 ? "estable" : "alza"}
          variacion={0}
          semaforo={g.alertasCriticasCount === 0 ? "verde" : g.alertasCriticasCount <= 2 ? "amarillo" : "rojo"}
        />

        <div className="rounded-xl border bg-card p-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Resumen Financiero</p>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Por Cobrar / Ingresos</p>
              <p className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                ${g.resumenFinanciero.saldo.toLocaleString("es-SV", { minimumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Egresos / Por Pagar</p>
              <p className="text-lg font-bold tabular-nums text-red-600 dark:text-red-400">
                ${g.resumenFinanciero.egresos.toLocaleString("es-SV", { minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {data.errores.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3">
          <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
            {data.errores.length} unidad(es) con error al cargar: {data.errores.map(e => e.unitKey).join(", ")}
          </p>
        </div>
      )}
    </section>
  );
}
