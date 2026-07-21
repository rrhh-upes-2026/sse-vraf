"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { MantoUbicacion } from "@/types/entities";
import { useUbicaciones } from "@/hooks/useMantenimiento";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const ESTADO_VARIANT: Record<string, BadgeVariant> = {
  activo:   "success",
  inactivo: "gray",
};

const FILTROS = [
  { value: "todos",    label: "Todas" },
  { value: "activo",   label: "Activas" },
  { value: "inactivo", label: "Inactivas" },
];

function UbicacionCard({ ubi }: { ubi: MantoUbicacion }) {
  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-4 flex flex-col gap-2 hover:border-sse-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono text-sse-primary">{ubi.codigo}</p>
          <p className="text-[13px] font-semibold text-sse-ink leading-snug mt-0.5">{ubi.nombre}</p>
          <p className="text-[11px] text-sse-muted capitalize">{ubi.tipo}{ubi.area ? ` · ${ubi.area}` : ""}</p>
        </div>
        <Badge variant={ESTADO_VARIANT[ubi.estado] ?? "gray"} className="shrink-0 text-[10px]">
          {ubi.estado === "activo" ? "Activa" : "Inactiva"}
        </Badge>
      </div>

      {ubi.descripcion && (
        <p className="text-[11px] text-sse-muted line-clamp-2">{ubi.descripcion}</p>
      )}
    </div>
  );
}

export function WorkspaceUbicaciones({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<string>("todos");
  const { data: ubicaciones, isLoading } = useUbicaciones({ wsId });

  const filtered = (ubicaciones ?? []).filter((u) =>
    filtro === "todos" ? u.deletedAt == null : u.estado === filtro,
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Ubicaciones</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Áreas e instalaciones de la infraestructura institucional</p>
        </div>
        {filtered.length > 0 && (
          <p className="text-[11px] text-sse-muted shrink-0">{filtered.length} ubicaciones</p>
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
          {[0,1,2].map((i) => <SkeletonCard key={i} className="h-[120px]" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z"
          title="Sin ubicaciones"
          description="No se encontraron ubicaciones con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((u) => <UbicacionCard key={u.id} ubi={u} />)}
        </div>
      )}
    </div>
  );
}
