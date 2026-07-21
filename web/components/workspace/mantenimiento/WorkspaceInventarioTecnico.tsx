"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { MantoInventarioTecnico, MantoEstadoInventario } from "@/types/entities";
import { useInventarioTecnico } from "@/hooks/useMantenimiento";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const ESTADO_VARIANT: Record<MantoEstadoInventario, BadgeVariant> = {
  disponible:    "success",
  agotado:       "danger",
  reservado:     "warning",
  descontinuado: "gray",
};

const ESTADO_LABEL: Record<MantoEstadoInventario, string> = {
  disponible:    "Disponible",
  agotado:       "Agotado",
  reservado:     "Reservado",
  descontinuado: "Descontinuado",
};

const FILTROS: Array<{ value: MantoEstadoInventario | "todos" | "bajo_stock"; label: string }> = [
  { value: "todos",       label: "Todos" },
  { value: "disponible",  label: "Disponibles" },
  { value: "agotado",     label: "Agotados" },
  { value: "bajo_stock",  label: "Bajo stock" },
];

function InventarioCard({ item }: { item: MantoInventarioTecnico }) {
  const stockPct = item.stockMinimo > 0
    ? Math.round((item.stockActual / item.stockMinimo) * 100)
    : 100;
  const bajoStock = item.stockActual <= item.stockMinimo;

  return (
    <div className={cn(
      "bg-sse-surface border rounded-md p-4 flex flex-col gap-2 hover:border-sse-primary/40 transition-colors",
      bajoStock ? "border-sse-sem-yellow-fg/40" : "border-sse-border"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono text-sse-primary">{item.codigo}</p>
          <p className="text-[13px] font-semibold text-sse-ink leading-snug line-clamp-2 mt-0.5">{item.nombre}</p>
          <p className="text-[11px] text-sse-muted capitalize">{item.categoria}</p>
        </div>
        <Badge variant={ESTADO_VARIANT[item.estado]} className="shrink-0 text-[10px]">
          {ESTADO_LABEL[item.estado]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <span className="text-sse-muted">Stock actual</span>
        <span className={cn("font-bold text-right", bajoStock ? "text-sse-sem-yellow-fg" : "text-sse-ink")}>
          {item.stockActual} {item.unidadMedida}
        </span>
        <span className="text-sse-muted">Stock mínimo</span>
        <span className="font-medium text-sse-ink text-right">{item.stockMinimo} {item.unidadMedida}</span>
        {item.valorUnitario != null && item.valorUnitario > 0 && (
          <>
            <span className="text-sse-muted">Valor unitario</span>
            <span className="font-medium text-sse-ink text-right">${item.valorUnitario.toLocaleString()}</span>
          </>
        )}
        {item.ubicacionAlmacen && (
          <>
            <span className="text-sse-muted">Almacén</span>
            <span className="font-medium text-sse-ink text-right truncate">{item.ubicacionAlmacen}</span>
          </>
        )}
      </div>

      {bajoStock && (
        <div className="mt-1">
          <div className="flex justify-between text-[10px] mb-0.5">
            <span className="text-sse-sem-yellow-fg font-medium">Stock bajo mínimo</span>
            <span className="text-sse-muted">{stockPct}%</span>
          </div>
          <div className="h-1.5 bg-sse-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-sse-sem-yellow-fg"
              style={{ width: `${Math.min(100, stockPct)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function WorkspaceInventarioTecnico({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<string>("todos");
  const { data: items, isLoading } = useInventarioTecnico({ wsId });

  const filtered = (items ?? []).filter((i) => {
    if (i.deletedAt != null && filtro !== "todos") return false;
    if (filtro === "todos")       return i.deletedAt == null;
    if (filtro === "bajo_stock")  return i.stockActual <= i.stockMinimo;
    return i.estado === filtro;
  });

  const valorTotal = filtered.reduce((sum, i) => sum + ((i.valorUnitario ?? 0) * (i.stockActual ?? 0)), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Inventario Técnico</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Repuestos, materiales y suministros de mantenimiento</p>
        </div>
        {filtered.length > 0 && (
          <div className="text-right">
            <p className="text-[11px] text-sse-muted">{filtered.length} ítems</p>
            {valorTotal > 0 && (
              <p className="text-[13px] font-bold text-sse-ink">${valorTotal.toLocaleString()}</p>
            )}
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
          {[0,1,2].map((i) => <SkeletonCard key={i} className="h-[180px]" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          title="Sin ítems en inventario"
          description="No se encontraron ítems con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((i) => <InventarioCard key={i.id} item={i} />)}
        </div>
      )}
    </div>
  );
}
