"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { ContaCuentaCobrar, ContaEstadoCuentaCobrar } from "@/types/entities";
import { useCuentasCobrar } from "@/hooks/useContabilidad";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";

const ESTADO_VARIANT: Record<ContaEstadoCuentaCobrar, BadgeVariant> = {
  pendiente: "warning",
  parcial:   "info",
  cobrada:   "success",
  vencida:   "danger",
  anulada:   "gray",
};

const ESTADO_LABEL: Record<ContaEstadoCuentaCobrar, string> = {
  pendiente: "Pendiente",
  parcial:   "Parcial",
  cobrada:   "Cobrada",
  vencida:   "Vencida",
  anulada:   "Anulada",
};

const FILTROS: Array<{ value: ContaEstadoCuentaCobrar | "todas"; label: string }> = [
  { value: "todas",     label: "Todas" },
  { value: "pendiente", label: "Pendientes" },
  { value: "vencida",   label: "Vencidas" },
  { value: "parcial",   label: "Parciales" },
  { value: "cobrada",   label: "Cobradas" },
];

function CuentaCobrarCard({ cuenta }: { cuenta: ContaCuentaCobrar }) {
  const pctCobrado = cuenta.monto > 0
    ? Math.round((cuenta.montoCobrado / cuenta.monto) * 100)
    : 0;
  const isVencida = cuenta.estado === "vencida";

  return (
    <div className={cn(
      "bg-sse-surface border rounded-md p-4 flex flex-col gap-2 transition-colors",
      isVencida
        ? "border-sse-sem-red-fg/50 bg-sse-sem-red-bg/10"
        : "border-sse-border hover:border-sse-primary/40"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {cuenta.codigo && (
            <p className="text-[11px] font-mono text-sse-primary">{cuenta.codigo}</p>
          )}
          <p className="text-[13px] font-semibold text-sse-ink leading-snug truncate">{cuenta.clienteRef}</p>
          <p className="text-[11px] text-sse-muted line-clamp-1">{cuenta.concepto}</p>
        </div>
        <Badge variant={ESTADO_VARIANT[cuenta.estado]} className="shrink-0 text-[10px]">
          {ESTADO_LABEL[cuenta.estado]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <span className="text-sse-muted">Saldo</span>
        <span className="font-bold text-sse-ink text-right">${cuenta.saldo.toLocaleString()} {cuenta.moneda}</span>
        <span className="text-sse-muted">Monto total</span>
        <span className="font-medium text-sse-ink text-right">${cuenta.monto.toLocaleString()}</span>
        <span className="text-sse-muted">Emisión</span>
        <span className="font-medium text-sse-ink text-right">{fmtShortDate(cuenta.fechaEmision)}</span>
        {cuenta.fechaVencimiento && (
          <>
            <span className="text-sse-muted">Vencimiento</span>
            <span className={cn("font-medium text-right", isVencida ? "text-sse-sem-red-fg" : "text-sse-ink")}>
              {fmtShortDate(cuenta.fechaVencimiento)}
            </span>
          </>
        )}
      </div>

      {pctCobrado > 0 && (
        <div>
          <div className="flex justify-between text-[10px] text-sse-muted mb-0.5">
            <span>Cobrado</span><span>{pctCobrado}%</span>
          </div>
          <div className="h-1.5 bg-sse-border rounded-full overflow-hidden">
            <div className="h-full bg-sse-primary rounded-full" style={{ width: `${pctCobrado}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

export function WorkspaceCuentasCobrar({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<ContaEstadoCuentaCobrar | "todas">("todas");
  const { data: cuentas, isLoading } = useCuentasCobrar({ wsId });

  const filtered = (cuentas ?? []).filter((c) =>
    filtro === "todas" ? c.deletedAt == null : c.estado === filtro,
  );

  const totalSaldo = filtered.reduce((acc, c) => acc + (c.saldo ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Cuentas por Cobrar</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Derechos de cobro — estructura preparada para futura integración</p>
        </div>
        {filtered.length > 0 && (
          <div className="text-right">
            <p className="text-[11px] text-sse-muted">{filtered.length} cuentas</p>
            <p className="text-[15px] font-bold text-sse-ink">${totalSaldo.toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {FILTROS.map((f) => (
          <button key={f.value} onClick={() => setFiltro(f.value)}
            className={cn("px-3 py-1 rounded-full text-[12px] font-medium border transition-colors",
              filtro === f.value
                ? "bg-sse-primary text-white border-sse-primary"
                : "bg-sse-surface text-sse-muted border-sse-border hover:border-sse-primary/40")}>
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[0,1,2].map((i) => <SkeletonCard key={i} className="h-[175px]" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          title="Sin cuentas por cobrar"
          description="No se encontraron cuentas con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => <CuentaCobrarCard key={c.id} cuenta={c} />)}
        </div>
      )}
    </div>
  );
}
