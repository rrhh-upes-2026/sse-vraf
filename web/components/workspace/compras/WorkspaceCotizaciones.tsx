"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { ComprasCotizacion } from "@/types/entities";
import { useCotizaciones } from "@/hooks/useCompras";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

type EstadoCot = ComprasCotizacion["estado"];

const ESTADO_VARIANT: Record<EstadoCot, BadgeVariant> = {
  pendiente:    "warning",
  evaluada:     "info",
  seleccionada: "success",
  rechazada:    "danger",
};

const ESTADO_LABEL: Record<EstadoCot, string> = {
  pendiente:    "Pendiente",
  evaluada:     "Evaluada",
  seleccionada: "Seleccionada",
  rechazada:    "Rechazada",
};

const FILTROS: Array<{ value: EstadoCot | "todas"; label: string }> = [
  { value: "todas",        label: "Todas" },
  { value: "pendiente",    label: "Pendientes" },
  { value: "evaluada",     label: "Evaluadas" },
  { value: "seleccionada", label: "Seleccionadas" },
];

function CotizacionCard({ cot }: { cot: ComprasCotizacion }) {
  return (
    <div className={cn(
      "bg-sse-surface border rounded-md p-4 flex flex-col gap-2 transition-colors",
      cot.seleccionada
        ? "border-sse-sem-green-fg/40 bg-sse-sem-green-bg/20"
        : "border-sse-border hover:border-sse-primary/40"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono text-sse-muted">{cot.codigoCotizacion ?? cot.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-[20px] font-bold text-sse-ink">${cot.monto.toLocaleString()}</p>
          <p className="text-[11px] text-sse-muted">{cot.moneda}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={ESTADO_VARIANT[cot.estado]} className="text-[10px]">{ESTADO_LABEL[cot.estado]}</Badge>
          {cot.seleccionada && (
            <Badge variant="success" className="text-[10px]">✓ Seleccionada</Badge>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        {cot.plazoEntregaDias != null && (
          <>
            <span className="text-sse-muted">Plazo entrega</span>
            <span className="font-medium text-sse-ink text-right">{cot.plazoEntregaDias} días</span>
          </>
        )}
        {cot.formaPago && (
          <>
            <span className="text-sse-muted">Forma de pago</span>
            <span className="font-medium text-sse-ink text-right truncate">{cot.formaPago}</span>
          </>
        )}
        {cot.vigenciaDias != null && (
          <>
            <span className="text-sse-muted">Vigencia</span>
            <span className="font-medium text-sse-ink text-right">{cot.vigenciaDias} días</span>
          </>
        )}
      </div>
      {cot.notasTecnicas && (
        <p className="text-[11px] text-sse-muted line-clamp-2 border-t border-sse-border pt-2">{cot.notasTecnicas}</p>
      )}
    </div>
  );
}

export function WorkspaceCotizaciones({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<EstadoCot | "todas">("todas");
  const { data: cotizaciones, isLoading } = useCotizaciones({ wsId });

  const filtered = (cotizaciones ?? []).filter((c) =>
    filtro === "todas" ? c.deletedAt == null : c.estado === filtro,
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[18px] font-semibold text-sse-ink">Cotizaciones</h1>
        <p className="text-[13px] text-sse-muted mt-0.5">Propuestas económicas de proveedores por requisición</p>
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
          title="Sin cotizaciones"
          description="No se encontraron cotizaciones con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => <CotizacionCard key={c.id} cot={c} />)}
        </div>
      )}
    </div>
  );
}
