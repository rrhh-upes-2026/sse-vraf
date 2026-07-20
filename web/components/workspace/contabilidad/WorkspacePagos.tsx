"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { ContaPago, ContaEstadoPago } from "@/types/entities";
import { usePagos } from "@/hooks/useContabilidad";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";

const ESTADO_VARIANT: Record<ContaEstadoPago, BadgeVariant> = {
  pendiente: "warning",
  aprobado:  "info",
  ejecutado: "success",
  rechazado: "danger",
  anulado:   "gray",
};

const ESTADO_LABEL: Record<ContaEstadoPago, string> = {
  pendiente: "Pendiente",
  aprobado:  "Aprobado",
  ejecutado: "Ejecutado",
  rechazado: "Rechazado",
  anulado:   "Anulado",
};

const TIPO_LABEL: Record<string, string> = {
  transferencia: "Transferencia",
  cheque:        "Cheque",
  efectivo:      "Efectivo",
  otros:         "Otros",
};

const FILTROS: Array<{ value: ContaEstadoPago | "todos"; label: string }> = [
  { value: "todos",     label: "Todos" },
  { value: "pendiente", label: "Pendientes" },
  { value: "aprobado",  label: "Aprobados" },
  { value: "ejecutado", label: "Ejecutados" },
];

function PagoCard({ pago }: { pago: ContaPago }) {
  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-4 flex flex-col gap-2 hover:border-sse-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {pago.numeroPago && (
            <p className="text-[11px] font-mono text-sse-primary">{pago.numeroPago}</p>
          )}
          <p className="text-[20px] font-bold text-sse-ink">${pago.monto.toLocaleString()}</p>
          <p className="text-[11px] text-sse-muted">{TIPO_LABEL[pago.tipo] ?? pago.tipo} · {pago.moneda}</p>
        </div>
        <Badge variant={ESTADO_VARIANT[pago.estado]} className="shrink-0 text-[10px]">
          {ESTADO_LABEL[pago.estado]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <span className="text-sse-muted">Solicitud</span>
        <span className="font-medium text-sse-ink text-right">{fmtShortDate(pago.fechaSolicitud)}</span>
        {pago.fechaEjecucion && (
          <>
            <span className="text-sse-muted">Ejecutado</span>
            <span className="font-medium text-sse-ink text-right">{fmtShortDate(pago.fechaEjecucion)}</span>
          </>
        )}
        {pago.referenciaBancaria && (
          <>
            <span className="text-sse-muted">Referencia</span>
            <span className="font-medium text-sse-ink text-right truncate">{pago.referenciaBancaria}</span>
          </>
        )}
      </div>

      {pago.proveedorRef && (
        <p className="text-[11px] text-sse-muted border-t border-sse-border pt-2 truncate">
          {pago.proveedorRef}
        </p>
      )}
      {pago.concepto && !pago.proveedorRef && (
        <p className="text-[11px] text-sse-muted border-t border-sse-border pt-2 line-clamp-1">
          {pago.concepto}
        </p>
      )}
    </div>
  );
}

export function WorkspacePagos({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<ContaEstadoPago | "todos">("todos");
  const { data: pagos, isLoading } = usePagos({ wsId });

  const filtered = (pagos ?? []).filter((p) =>
    filtro === "todos" ? p.deletedAt == null : p.estado === filtro,
  );

  const totalMonto = filtered.reduce((acc, p) => acc + (p.monto ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Pagos</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Gestión y ejecución de pagos a proveedores</p>
        </div>
        {filtered.length > 0 && (
          <div className="text-right">
            <p className="text-[11px] text-sse-muted">{filtered.length} pagos</p>
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
          {[0,1,2].map((i) => <SkeletonCard key={i} className="h-[155px]" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z"
          title="Sin pagos"
          description="No se encontraron pagos con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => <PagoCard key={p.id} pago={p} />)}
        </div>
      )}
    </div>
  );
}
