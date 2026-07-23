"use client";

import type { AlertaInstitucional } from "@/types/executive";
import { AlertCard } from "../widgets/AlertCard";

interface Props {
  alertas: AlertaInstitucional[];
}

export function ExecAlertasInstitucionales({ alertas }: Props) {
  if (alertas.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Alertas Institucionales</h2>
        <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 p-6 text-center">
          <p className="text-2xl mb-2">✅</p>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Sin alertas críticas</p>
          <p className="text-xs text-muted-foreground mt-1">Todas las unidades operan dentro de parámetros normales</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Alertas Institucionales</h2>
        <span className="text-sm font-medium text-red-600 dark:text-red-400">
          {alertas.length} alerta{alertas.length !== 1 ? "s" : ""} crítica{alertas.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-2">
        {alertas.map((alerta, idx) => (
          <AlertCard key={`${alerta.unitKey}-${idx}`} alerta={alerta} />
        ))}
      </div>
    </section>
  );
}
