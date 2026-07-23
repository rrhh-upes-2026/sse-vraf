"use client";

import type { DashboardUnitSummary } from "@/types/executive";
import { ExecutiveSummaryCard } from "../widgets/ExecutiveSummaryCard";

interface Props { unidades: DashboardUnitSummary[]; }

export function ExecEstadoUnidades({ unidades }: Props) {
  const critical = unidades.filter(u => u.estado === "critical");
  const warning  = unidades.filter(u => u.estado === "warning");
  const ok       = unidades.filter(u => u.estado === "ok");
  const ordered  = [...critical, ...warning, ...ok];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Estado por Unidad</h2>
        <p className="text-sm text-muted-foreground">
          {ok.length} operativas · {warning.length} con atención · {critical.length} críticas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ordered.map(unit => (
          <ExecutiveSummaryCard key={unit.unitKey} unit={unit} />
        ))}
      </div>
    </section>
  );
}
