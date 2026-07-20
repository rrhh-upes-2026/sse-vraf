"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { ComprasOrden, ComprasEstadoOrden } from "@/types/entities";
import { useOrdenesCompra } from "@/hooks/useCompras";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";

const ESTADO_VARIANT: Record<ComprasEstadoOrden, BadgeVariant> = {
  borrador:  "gray",
  emitida:   "info",
  recibida:  "success",
  pagada:    "success",
  cancelada: "danger",
};

const ESTADO_LABEL: Record<ComprasEstadoOrden, string> = {
  borrador:  "Borrador",
  emitida:   "Emitida",
  recibida:  "Recibida",
  pagada:    "Pagada",
  cancelada: "Cancelada",
};

const FILTROS: Array<{ value: ComprasEstadoOrden | "todas"; label: string }> = [
  { value: "todas",    label: "Todas" },
  { value: "emitida",  label: "Emitidas" },
  { value: "recibida", label: "Recibidas" },
  { value: "pagada",   label: "Pagadas" },
  { value: "borrador", label: "Borradores" },
];

function OrdenCard({ orden }: { orden: ComprasOrden }) {
  const isAbiert = orden.estado === "borrador" || orden.estado === "emitida";
  return (
    <div className={cn(
      "bg-sse-surface border rounded-md p-4 flex flex-col gap-2 transition-colors hover:border-sse-primary/40",
      "border-sse-border"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono text-sse-primary">{orden.codigo ?? orden.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-[20px] font-bold text-sse-ink">${orden.monto.toLocaleString()}</p>
          <p className="text-[11px] text-sse-muted">{orden.moneda}</p>
        </div>
        <Badge variant={ESTADO_VARIANT[orden.estado]} className="shrink-0 text-[10px]">
          {ESTADO_LABEL[orden.estado]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <span className="text-sse-muted">Emisión</span>
        <span className="font-medium text-sse-ink text-right">{fmtShortDate(orden.fechaEmision)}</span>
        {orden.fechaEntregaEsperada && (
          <>
            <span className="text-sse-muted">Entrega esperada</span>
            <span className={cn(
              "font-medium text-right",
              isAbiert && new Date(orden.fechaEntregaEsperada) < new Date()
                ? "text-sse-sem-red-fg"
                : "text-sse-ink"
            )}>{fmtShortDate(orden.fechaEntregaEsperada)}</span>
          </>
        )}
        {orden.formaPago && (
          <>
            <span className="text-sse-muted">Pago</span>
            <span className="font-medium text-sse-ink text-right truncate">{orden.formaPago}</span>
          </>
        )}
      </div>

      {orden.facturaNro && (
        <p className="text-[11px] text-sse-muted border-t border-sse-border pt-2">
          Factura: <span className="font-medium text-sse-ink">{orden.facturaNro}</span>
          {orden.montoFactura ? ` · $${orden.montoFactura.toLocaleString()}` : ""}
        </p>
      )}
    </div>
  );
}

export function WorkspaceOrdenesCompra({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<ComprasEstadoOrden | "todas">("todas");
  const { data: ordenes, isLoading } = useOrdenesCompra({ wsId });

  const filtered = (ordenes ?? []).filter((o) =>
    filtro === "todas" ? o.deletedAt == null : o.estado === filtro,
  );

  const totalMonto = filtered.reduce((acc, o) => acc + (o.monto ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Órdenes de Compra</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Historial y seguimiento de órdenes emitidas</p>
        </div>
        {filtered.length > 0 && (
          <div className="text-right">
            <p className="text-[11px] text-sse-muted">{filtered.length} órdenes</p>
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
          icon="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M15 5a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2"
          title="Sin órdenes"
          description="No se encontraron órdenes de compra con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((o) => <OrdenCard key={o.id} orden={o} />)}
        </div>
      )}
    </div>
  );
}
