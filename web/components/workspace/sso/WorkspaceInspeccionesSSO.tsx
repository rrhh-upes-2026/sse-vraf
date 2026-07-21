"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { SSOInspeccion } from "@/types/entities";
import { useInspeccionesSSO } from "@/hooks/useSSO";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const ESTADO_VARIANT: Record<string, BadgeVariant> = {
  programada:  "info",
  en_proceso:  "warning",
  completada:  "success",
  cancelada:   "gray",
};

const FILTROS = [
  { value: "todos",      label: "Todas" },
  { value: "programada", label: "Programadas" },
  { value: "en_proceso", label: "En proceso" },
  { value: "completada", label: "Completadas" },
];

function InspeccionCard({ item }: { item: SSOInspeccion }) {
  const tieneHallazgos = (item.numNoConformes ?? 0) > 0;

  return (
    <div className={cn(
      "bg-sse-surface border rounded-md p-4 flex flex-col gap-2 hover:border-sse-primary/40 transition-colors",
      tieneHallazgos ? "border-sse-sem-yellow-fg/40" : "border-sse-border"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono text-sse-primary">{item.codigo}</p>
          <p className="text-[13px] font-semibold text-sse-ink leading-snug line-clamp-2 mt-0.5">{item.titulo}</p>
          <p className="text-[11px] text-sse-muted capitalize">{item.tipo} · {item.area}</p>
        </div>
        <Badge variant={ESTADO_VARIANT[item.estado] ?? "gray"} className="shrink-0 text-[10px]">
          {item.estado.replace("_", " ")}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <span className="text-sse-muted">Inspector</span>
        <span className="font-medium text-sse-ink text-right truncate">{item.inspectorRef}</span>
        <span className="text-sse-muted">Programada</span>
        <span className="font-medium text-sse-ink text-right">{item.fechaProgramada}</span>
        {item.numHallazgos != null && item.numHallazgos > 0 && (
          <>
            <span className="text-sse-muted">Hallazgos</span>
            <span className={cn("font-bold text-right", tieneHallazgos ? "text-sse-sem-yellow-fg" : "text-sse-ink")}>
              {item.numNoConformes ?? 0} NC / {item.numHallazgos}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export function WorkspaceInspeccionesSSO({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<string>("todos");
  const { data: items, isLoading } = useInspeccionesSSO({ wsId });

  const filtered = (items ?? []).filter((i) => {
    if (filtro === "todos") return i.deletedAt == null;
    return i.estado === filtro;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Inspecciones de Seguridad</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Inspecciones de seguridad programadas y ejecutadas</p>
        </div>
        {filtered.length > 0 && (
          <p className="text-[11px] text-sse-muted shrink-0">{filtered.length} inspecciones</p>
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
          icon="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
          title="Sin inspecciones"
          description="No se encontraron inspecciones con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((i) => <InspeccionCard key={i.id} item={i} />)}
        </div>
      )}
    </div>
  );
}
