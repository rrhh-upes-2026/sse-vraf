"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { ContaCuentaPagar, ContaEstadoCuentaPagar, ContaPrioridad } from "@/types/entities";
import { useCuentasPagar } from "@/hooks/useContabilidad";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";

const ESTADO_VARIANT: Record<ContaEstadoCuentaPagar, BadgeVariant> = {
  pendiente: "warning",
  parcial:   "info",
  pagada:    "success",
  vencida:   "danger",
  anulada:   "gray",
};

const ESTADO_LABEL: Record<ContaEstadoCuentaPagar, string> = {
  pendiente: "Pendiente",
  parcial:   "Parcial",
  pagada:    "Pagada",
  vencida:   "Vencida",
  anulada:   "Anulada",
};

const PRIORIDAD_VARIANT: Record<ContaPrioridad, BadgeVariant> = {
  normal:  "default",
  urgente: "warning",
  critica: "danger",
};

const FILTROS: Array<{ value: ContaEstadoCuentaPagar | "todas"; label: string }> = [
  { value: "todas",     label: "Todas" },
  { value: "pendiente", label: "Pendientes" },
  { value: "vencida",   label: "Vencidas" },
  { value: "parcial",   label: "Parciales" },
  { value: "pagada",    label: "Pagadas" },
];

function CuentaPagarCard({ cuenta }: { cuenta: ContaCuentaPagar }) {
  const pctPagado = cuenta.monto > 0
    ? Math.round((cuenta.montoPagado / cuenta.monto) * 100)
    : 0;

  return (
    <div className={cn(
      "bg-sse-surface border rounded-md p-4 flex flex-col gap-2 transition-colors",
      cuenta.estado === "vencida"
        ? "border-sse-sem-red-fg/50 bg-sse-sem-red-bg/10"
        : "border-sse-border hover:border-sse-primary/40"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {cuenta.codigo && (
            <p className="text-[11px] font-mono text-sse-primary">{cuenta.codigo}</p>
          )}
          <p className="text-[20px] font-bold text-sse-ink">${cuenta.saldo.toLocaleString()}</p>
          <p className="text-[11px] text-sse-muted">de ${cuenta.monto.toLocaleString()} · {cuenta.moneda}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge variant={ESTADO_VARIANT[cuenta.estado]} className="text-[10px]">
            {ESTADO_LABEL[cuenta.estado]}
          </Badge>
          {cuenta.prioridad !== "normal" && (
            <Badge variant={PRIORIDAD_VARIANT[cuenta.prioridad]} className="text-[10px] capitalize">
              {cuenta.prioridad}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        {cuenta.proveedorRef && (
          <>
            <span className="text-sse-muted">Proveedor</span>
            <span className="font-medium text-sse-ink text-right truncate">{cuenta.proveedorRef}</span>
          </>
        )}
        <span className="text-sse-muted">Emisión</span>
        <span className="font-medium text-sse-ink text-right">{fmtShortDate(cuenta.fechaEmision)}</span>
        {cuenta.fechaVencimiento && (
          <>
            <span className="text-sse-muted">Vencimiento</span>
            <span className={cn(
              "font-medium text-right",
              cuenta.estado === "vencida" ? "text-sse-sem-red-fg" : "text-sse-ink"
            )}>{fmtShortDate(cuenta.fechaVencimiento)}</span>
          </>
        )}
        <span className="text-sse-muted">Plazo</span>
        <span className="font-medium text-sse-ink text-right">{cuenta.diasPlazo} días</span>
      </div>

      {/* Barra de pago */}
      {pctPagado > 0 && (
        <div>
          <div className="flex justify-between text-[10px] text-sse-muted mb-0.5">
            <span>Pagado</span><span>{pctPagado}%</span>
          </div>
          <div className="h-1.5 bg-sse-border rounded-full overflow-hidden">
            <div className="h-full bg-sse-sem-green-fg rounded-full" style={{ width: `${pctPagado}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

export function WorkspaceCuentasPagar({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<ContaEstadoCuentaPagar | "todas">("todas");
  const { data: cuentas, isLoading } = useCuentasPagar({ wsId });

  const filtered = (cuentas ?? []).filter((c) =>
    filtro === "todas" ? c.deletedAt == null : c.estado === filtro,
  );

  const totalSaldo = filtered.reduce((acc, c) => acc + (c.saldo ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Cuentas por Pagar</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Obligaciones pendientes con proveedores</p>
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
          {[0,1,2].map((i) => <SkeletonCard key={i} className="h-[185px]" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon="M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2m2 4h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2z"
          title="Sin cuentas por pagar"
          description="No se encontraron cuentas con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => <CuentaPagarCard key={c.id} cuenta={c} />)}
        </div>
      )}
    </div>
  );
}
