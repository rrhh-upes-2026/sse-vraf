"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { SSOIncidente, SSOGravedad } from "@/types/entities";
import { useIncidentesSSO } from "@/hooks/useSSO";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const GRAVEDAD_VARIANT: Record<SSOGravedad, BadgeVariant> = {
  leve:     "info",
  moderado: "warning",
  grave:    "danger",
  fatal:    "danger",
};

const ESTADO_VARIANT: Record<string, BadgeVariant> = {
  abierto:    "danger",
  en_proceso: "warning",
  cerrado:    "success",
  cancelado:  "gray",
};

const FILTROS = [
  { value: "todos",      label: "Todos" },
  { value: "abierto",    label: "Abiertos" },
  { value: "en_proceso", label: "En proceso" },
  { value: "cerrado",    label: "Cerrados" },
];

function IncidenteCard({ item }: { item: SSOIncidente }) {
  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-4 flex flex-col gap-2 hover:border-sse-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono text-sse-primary">{item.codigo}</p>
          <p className="text-[13px] font-semibold text-sse-ink leading-snug line-clamp-2 mt-0.5">{item.titulo}</p>
          <p className="text-[11px] text-sse-muted capitalize">{item.tipo} · {item.area}</p>
        </div>
        <div className="flex flex-col gap-1 items-end shrink-0">
          <Badge variant={GRAVEDAD_VARIANT[item.gravedad]} className="text-[10px]">
            {item.gravedad}
          </Badge>
          <Badge variant={ESTADO_VARIANT[item.estado] ?? "gray"} className="text-[10px]">
            {item.estado.replace("_", " ")}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <span className="text-sse-muted">Empleado</span>
        <span className="font-medium text-sse-ink text-right truncate">{item.empleadoRef}</span>
        <span className="text-sse-muted">Fecha</span>
        <span className="font-medium text-sse-ink text-right">{item.fechaIncidente}</span>
        {item.diasPerdidos != null && item.diasPerdidos > 0 && (
          <>
            <span className="text-sse-muted">Días perdidos</span>
            <span className="font-bold text-sse-sem-red-fg text-right">{item.diasPerdidos}</span>
          </>
        )}
        <span className="text-sse-muted">Etapa</span>
        <span className="font-medium text-sse-ink text-right capitalize">{item.etapa.replace("_", " ")}</span>
      </div>
    </div>
  );
}

export function WorkspaceIncidentes({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<string>("todos");
  const { data: items, isLoading } = useIncidentesSSO({ wsId });

  const filtered = (items ?? []).filter((i) => {
    if (filtro === "todos") return i.deletedAt == null;
    return i.estado === filtro;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Incidentes Laborales</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Registro y seguimiento de incidentes ocupacionales</p>
        </div>
        {filtered.length > 0 && (
          <p className="text-[11px] text-sse-muted shrink-0">{filtered.length} registros</p>
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
          icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          title="Sin incidentes"
          description="No se encontraron incidentes con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((i) => <IncidenteCard key={i.id} item={i} />)}
        </div>
      )}
    </div>
  );
}
