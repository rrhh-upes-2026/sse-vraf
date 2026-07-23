"use client";

import type { DashboardUnitSummary } from "@/types/executive";

interface Props { unidades: DashboardUnitSummary[]; }

export function ExecResumenOperativo({ unidades }: Props) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">Resumen Operativo</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {unidades.map(u => (
          <div key={u.unitKey} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">{u.label}</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {u.resumenOperativo.descripcion}
            </p>

            {u.resumenOperativo.indicadores.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {u.resumenOperativo.indicadores.map((ind, idx) => (
                  <div key={idx} className="bg-muted/40 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground leading-tight">{ind.label}</p>
                    <p className="text-sm font-bold tabular-nums mt-0.5">
                      {ind.valor}{ind.unidad ? ` ${ind.unidad}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
