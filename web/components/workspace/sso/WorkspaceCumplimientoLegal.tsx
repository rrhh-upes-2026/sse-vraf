"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { SSOCumplimiento, SSOEstadoCumpl } from "@/types/entities";
import { useCumplimientoSSO } from "@/hooks/useSSO";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const ESTADO_VARIANT: Record<SSOEstadoCumpl, BadgeVariant> = {
  cumple:     "success",
  parcial:    "warning",
  no_cumple:  "danger",
  no_aplica:  "gray",
};

const ESTADO_LABEL: Record<SSOEstadoCumpl, string> = {
  cumple:     "Cumple",
  parcial:    "Parcial",
  no_cumple:  "No cumple",
  no_aplica:  "No aplica",
};

const FILTROS: Array<{ value: SSOEstadoCumpl | "todos"; label: string }> = [
  { value: "todos",     label: "Todos" },
  { value: "cumple",    label: "Cumple" },
  { value: "parcial",   label: "Parcial" },
  { value: "no_cumple", label: "No cumple" },
];

function CumplimientoCard({ item }: { item: SSOCumplimiento }) {
  const esCritico = item.estado === "no_cumple";

  return (
    <div className={cn(
      "bg-sse-surface border rounded-md p-4 flex flex-col gap-2 hover:border-sse-primary/40 transition-colors",
      esCritico ? "border-sse-sem-red-fg/40" : "border-sse-border"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono text-sse-primary">{item.codigo}</p>
          <p className="text-[13px] font-semibold text-sse-ink leading-snug line-clamp-2 mt-0.5">{item.descripcion}</p>
          <p className="text-[11px] text-sse-muted">{item.norma} · Art. {item.articulo}</p>
        </div>
        <Badge variant={ESTADO_VARIANT[item.estado]} className="shrink-0 text-[10px]">
          {ESTADO_LABEL[item.estado]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <span className="text-sse-muted">Tipo</span>
        <span className="font-medium text-sse-ink text-right capitalize">{item.tipo}</span>
        {item.fechaVigencia && (
          <>
            <span className="text-sse-muted">Vigencia</span>
            <span className="font-medium text-sse-ink text-right">{item.fechaVigencia}</span>
          </>
        )}
        {item.fechaRevision && (
          <>
            <span className="text-sse-muted">Próx. revisión</span>
            <span className="font-medium text-sse-ink text-right">{item.fechaRevision}</span>
          </>
        )}
      </div>

      {item.observaciones && (
        <p className="text-[11px] text-sse-muted line-clamp-2 border-t border-sse-border pt-2">
          {item.observaciones}
        </p>
      )}
    </div>
  );
}

export function WorkspaceCumplimientoLegal({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<string>("todos");
  const { data: items, isLoading } = useCumplimientoSSO({ wsId });

  const filtered = (items ?? []).filter((i) => {
    if (filtro === "todos") return i.deletedAt == null;
    return i.estado === filtro;
  });

  const totalItems = (items ?? []).filter((i) => i.deletedAt == null);
  const cumpleCount = totalItems.filter((i) => i.estado === "cumple").length;
  const pct = totalItems.length > 0 ? Math.round((cumpleCount / totalItems.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Cumplimiento Legal</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Seguimiento de requisitos legales SSO</p>
        </div>
        {totalItems.length > 0 && (
          <div className="text-right">
            <p className="text-[11px] text-sse-muted">{totalItems.length} requisitos</p>
            <p className={cn("text-[13px] font-bold", pct >= 90 ? "text-sse-sem-green-fg" : pct >= 70 ? "text-sse-sem-yellow-fg" : "text-sse-sem-red-fg")}>
              {pct}% cumple
            </p>
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
          icon="M3 6l3 1m0 0l-3 9a5.002 5.002 0 0 0 6.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 0 0 6.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
          title="Sin requisitos legales"
          description="No se encontraron requisitos con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((i) => <CumplimientoCard key={i.id} item={i} />)}
        </div>
      )}
    </div>
  );
}
