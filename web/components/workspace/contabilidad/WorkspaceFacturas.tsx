"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { ContaFactura, ContaEstadoFactura } from "@/types/entities";
import { useFacturas } from "@/hooks/useContabilidad";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";

const ESTADO_VARIANT: Record<ContaEstadoFactura, BadgeVariant> = {
  pendiente: "warning",
  aprobada:  "info",
  pagada:    "success",
  rechazada: "danger",
  anulada:   "gray",
};

const ESTADO_LABEL: Record<ContaEstadoFactura, string> = {
  pendiente: "Pendiente",
  aprobada:  "Aprobada",
  pagada:    "Pagada",
  rechazada: "Rechazada",
  anulada:   "Anulada",
};

const FILTROS: Array<{ value: ContaEstadoFactura | "todas"; label: string }> = [
  { value: "todas",     label: "Todas" },
  { value: "pendiente", label: "Pendientes" },
  { value: "aprobada",  label: "Aprobadas" },
  { value: "pagada",    label: "Pagadas" },
  { value: "rechazada", label: "Rechazadas" },
];

function FacturaCard({ factura }: { factura: ContaFactura }) {
  const isVencida = factura.estado === "pendiente" && factura.fechaVencimiento &&
    new Date(factura.fechaVencimiento) < new Date();

  return (
    <div className={cn(
      "bg-sse-surface border rounded-md p-4 flex flex-col gap-2 transition-colors",
      isVencida
        ? "border-sse-sem-red-fg/40 bg-sse-sem-red-bg/10"
        : "border-sse-border hover:border-sse-primary/40"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono text-sse-primary">{factura.numero}{factura.serie ? `-${factura.serie}` : ""}</p>
          <p className="text-[20px] font-bold text-sse-ink">${factura.montoTotal.toLocaleString()}</p>
          <p className="text-[11px] text-sse-muted capitalize">{factura.tipo.replace(/_/g, " ")} · {factura.moneda}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={ESTADO_VARIANT[factura.estado]} className="text-[10px]">
            {ESTADO_LABEL[factura.estado]}
          </Badge>
          {isVencida && <Badge variant="danger" className="text-[10px]">Vencida</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <span className="text-sse-muted">Fecha factura</span>
        <span className="font-medium text-sse-ink text-right">{fmtShortDate(factura.fechaFactura)}</span>
        {factura.fechaVencimiento && (
          <>
            <span className="text-sse-muted">Vencimiento</span>
            <span className={cn("font-medium text-right", isVencida ? "text-sse-sem-red-fg" : "text-sse-ink")}>
              {fmtShortDate(factura.fechaVencimiento)}
            </span>
          </>
        )}
        {factura.montoIva > 0 && (
          <>
            <span className="text-sse-muted">IVA</span>
            <span className="font-medium text-sse-ink text-right">${factura.montoIva.toLocaleString()}</span>
          </>
        )}
      </div>

      {factura.proveedorRef && (
        <p className="text-[11px] text-sse-muted border-t border-sse-border pt-2 truncate">
          Proveedor: <span className="font-medium text-sse-ink">{factura.proveedorRef}</span>
        </p>
      )}
    </div>
  );
}

export function WorkspaceFacturas({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<ContaEstadoFactura | "todas">("todas");
  const { data: facturas, isLoading } = useFacturas({ wsId });

  const filtered = (facturas ?? []).filter((f) =>
    filtro === "todas" ? f.deletedAt == null : f.estado === filtro,
  );

  const totalMonto = filtered.reduce((acc, f) => acc + (f.montoTotal ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Facturas</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Registro y aprobación de facturas de proveedores</p>
        </div>
        {filtered.length > 0 && (
          <div className="text-right">
            <p className="text-[11px] text-sse-muted">{filtered.length} facturas</p>
            <p className="text-[15px] font-bold text-sse-ink">${totalMonto.toLocaleString()}</p>
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
          {[0,1,2].map((i) => <SkeletonCard key={i} className="h-[160px]" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
          title="Sin facturas"
          description="No se encontraron facturas con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((f) => <FacturaCard key={f.id} factura={f} />)}
        </div>
      )}
    </div>
  );
}
