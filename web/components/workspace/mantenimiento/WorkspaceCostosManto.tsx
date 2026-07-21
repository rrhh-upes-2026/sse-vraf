"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { MantoCosto } from "@/types/entities";
import { useCostosManto } from "@/hooks/useMantenimiento";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";

type MantoTipoCosto = "mano_obra" | "materiales" | "servicios" | "otro";

const TIPO_VARIANT: Record<string, BadgeVariant> = {
  mano_obra:  "info",
  materiales: "warning",
  servicios:  "purple",
  otro:       "gray",
};

const TIPO_LABEL: Record<string, string> = {
  mano_obra:  "Mano de Obra",
  materiales: "Materiales",
  servicios:  "Servicios",
  otro:       "Otro",
};

const FILTROS: Array<{ value: string; label: string }> = [
  { value: "todos",      label: "Todos" },
  { value: "mano_obra",  label: "Mano de Obra" },
  { value: "materiales", label: "Materiales" },
  { value: "servicios",  label: "Servicios" },
];

function CostoCard({ costo }: { costo: MantoCosto }) {
  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-4 flex flex-col gap-2 hover:border-sse-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-sse-ink leading-snug line-clamp-2">{costo.concepto}</p>
          <p className="text-[11px] text-sse-muted mt-0.5">{fmtShortDate(costo.fecha)}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge variant={TIPO_VARIANT[costo.tipo] ?? "gray"} className="text-[10px]">
            {TIPO_LABEL[costo.tipo] ?? costo.tipo}
          </Badge>
          {costo.aprobado && (
            <Badge variant="success" className="text-[10px]">Aprobado</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <span className="text-sse-muted">Monto</span>
        <span className="font-bold text-sse-ink text-right">
          {costo.moneda === "USD" ? "$" : costo.moneda + " "}
          {costo.monto.toLocaleString()}
        </span>
        {costo.activoRef && (
          <>
            <span className="text-sse-muted">Activo</span>
            <span className="font-medium text-sse-ink text-right truncate">{costo.activoRef}</span>
          </>
        )}
        {costo.proveedor && (
          <>
            <span className="text-sse-muted">Proveedor</span>
            <span className="font-medium text-sse-ink text-right truncate">{costo.proveedor}</span>
          </>
        )}
      </div>

      {/* Integration refs */}
      {(costo.compromisoId || costo.facturaId) && (
        <div className="border-t border-sse-border pt-2 text-[11px] text-sse-muted flex gap-3">
          {costo.compromisoId && (
            <span>Compromiso: <span className="font-mono text-sse-ink">{costo.compromisoId}</span></span>
          )}
          {costo.facturaId && (
            <span>Factura: <span className="font-mono text-sse-ink">{costo.facturaId}</span></span>
          )}
        </div>
      )}
    </div>
  );
}

export function WorkspaceCostosManto({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<string>("todos");
  const { data: costos, isLoading } = useCostosManto({ wsId });

  const filtered = (costos ?? []).filter((c) =>
    filtro === "todos" ? c.deletedAt == null : c.tipo === filtro,
  );

  const totalMonto = filtered.reduce((sum, c) => sum + (c.monto ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Costos de Mantenimiento</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Registro de costos por órdenes de trabajo y activos</p>
        </div>
        {filtered.length > 0 && (
          <div className="text-right">
            <p className="text-[11px] text-sse-muted">{filtered.length} registros</p>
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
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
          title="Sin registros de costos"
          description="No se encontraron costos con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => <CostoCard key={c.id} costo={c} />)}
        </div>
      )}
    </div>
  );
}
