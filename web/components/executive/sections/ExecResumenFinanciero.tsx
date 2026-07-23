"use client";

import { cn } from "@/lib/utils";
import type { DashboardUnitSummary, GlobalStats } from "@/types/executive";
import { TrendCard } from "../widgets/TrendCard";

interface Props {
  unidades: DashboardUnitSummary[];
  globales: GlobalStats;
}

function fmtUSD(n: number) {
  return n.toLocaleString("es-SV", { style: "currency", currency: "USD", minimumFractionDigits: 0 });
}

export function ExecResumenFinanciero({ unidades, globales }: Props) {
  const conFinanciero = unidades.filter(u => u.resumenFinanciero);
  const saldoNeto     = globales.resumenFinanciero.saldo - globales.resumenFinanciero.egresos;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">Resumen Financiero</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TrendCard
          label="Saldo / Cuentas por Cobrar"
          valor={globales.resumenFinanciero.saldo}
          unidad="USD"
          tendencia="estable"
          variacion={0}
          semaforo="verde"
        />
        <TrendCard
          label="Egresos / Cuentas por Pagar"
          valor={globales.resumenFinanciero.egresos}
          unidad="USD"
          tendencia="estable"
          variacion={0}
          semaforo={globales.resumenFinanciero.egresos > globales.resumenFinanciero.saldo ? "rojo" : "amarillo"}
        />
        <div className={cn(
          "rounded-xl border p-4 space-y-2",
          saldoNeto >= 0 ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-red-50 dark:bg-red-950/30"
        )}>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Saldo Neto Consolidado</p>
          <p className={cn("text-2xl font-bold tabular-nums", saldoNeto >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
            {fmtUSD(saldoNeto)}
          </p>
          <p className="text-xs text-muted-foreground">Diferencia entre cuentas por cobrar y por pagar</p>
        </div>
      </div>

      {conFinanciero.length > 0 && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h3 className="text-sm font-semibold">Detalle por Unidad</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Unidad</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Saldo / Ingresos</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Egresos</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Neto</th>
                </tr>
              </thead>
              <tbody>
                {conFinanciero.map(u => {
                  const rf   = u.resumenFinanciero!;
                  const neto = rf.saldo - rf.egresos;
                  return (
                    <tr key={u.unitKey} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2 font-medium">{u.label}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-emerald-600 dark:text-emerald-400">{fmtUSD(rf.saldo)}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-red-600 dark:text-red-400">{fmtUSD(rf.egresos)}</td>
                      <td className={cn("px-4 py-2 text-right tabular-nums font-semibold", neto >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                        {fmtUSD(neto)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
