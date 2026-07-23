"use client";

import type { DashboardUnitSummary } from "@/types/executive";
import { ProgressCard } from "../widgets/ProgressCard";
import { RankingCard }  from "../widgets/RankingCard";

interface Props { unidades: DashboardUnitSummary[]; }

export function ExecCumplimientoInstitucional({ unidades }: Props) {
  const promedio = unidades.length
    ? Math.round(unidades.reduce((s, u) => s + u.cumplimientoPct, 0) / unidades.length)
    : 0;

  const rankingItems = [...unidades]
    .sort((a, b) => b.cumplimientoPct - a.cumplimientoPct)
    .map(u => ({
      label:    u.label,
      valor:    u.cumplimientoPct,
      unidad:   "%",
      semaforo: u.cumplimientoPct >= 90 ? "verde" as const
              : u.cumplimientoPct >= 70 ? "amarillo" as const
              : "rojo" as const,
    }));

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Cumplimiento Institucional</h2>
        <p className="text-sm text-muted-foreground">Promedio: {promedio}%</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Por Unidad</h3>
          <div className="space-y-3">
            {unidades.map(u => (
              <ProgressCard
                key={u.unitKey}
                label={u.label}
                valor={u.cumplimientoPct}
                meta={100}
                unidad="%"
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Ranking</h3>
          <RankingCard
            title="Unidades por cumplimiento"
            items={rankingItems}
            maxItems={6}
          />
        </div>
      </div>
    </section>
  );
}
