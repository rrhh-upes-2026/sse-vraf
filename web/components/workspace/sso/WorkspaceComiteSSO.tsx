"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { SSOComite, SSOEstadoComite } from "@/types/entities";
import { useComiteSSO } from "@/hooks/useSSO";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const ESTADO_VARIANT: Record<SSOEstadoComite, BadgeVariant> = {
  programada: "info",
  realizada:  "success",
  cancelada:  "gray",
};

const FILTROS: Array<{ value: SSOEstadoComite | "todos"; label: string }> = [
  { value: "todos",      label: "Todas" },
  { value: "programada", label: "Programadas" },
  { value: "realizada",  label: "Realizadas" },
];

function ComiteCard({ item }: { item: SSOComite }) {
  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-4 flex flex-col gap-2 hover:border-sse-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono text-sse-primary">{item.codigo}</p>
          <p className="text-[13px] font-semibold text-sse-ink leading-snug mt-0.5">
            {item.tipo} #{item.numero}
          </p>
          <p className="text-[11px] text-sse-muted">{item.lugar}</p>
        </div>
        <Badge variant={ESTADO_VARIANT[item.estado]} className="shrink-0 text-[10px]">
          {item.estado}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <span className="text-sse-muted">Fecha</span>
        <span className="font-medium text-sse-ink text-right">{item.fecha}</span>
        {item.numAsistentes != null && (
          <>
            <span className="text-sse-muted">Asistentes</span>
            <span className="font-medium text-sse-ink text-right">{item.numAsistentes}</span>
          </>
        )}
        {item.proximaFecha && (
          <>
            <span className="text-sse-muted">Próxima sesión</span>
            <span className="font-medium text-sse-ink text-right">{item.proximaFecha}</span>
          </>
        )}
      </div>

      {item.acuerdos && (
        <p className="text-[11px] text-sse-muted line-clamp-2 border-t border-sse-border pt-2">
          {item.acuerdos}
        </p>
      )}
    </div>
  );
}

export function WorkspaceComiteSSO({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<string>("todos");
  const { data: items, isLoading } = useComiteSSO({ wsId });

  const filtered = (items ?? []).filter((i) => {
    if (filtro === "todos") return i.deletedAt == null;
    return i.estado === filtro;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Comité de Seguridad</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Actas y sesiones del Comité de SSO</p>
        </div>
        {filtered.length > 0 && (
          <p className="text-[11px] text-sse-muted shrink-0">{filtered.length} sesiones</p>
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
          icon="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
          title="Sin sesiones registradas"
          description="No se encontraron sesiones del Comité SSO."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((i) => <ComiteCard key={i.id} item={i} />)}
        </div>
      )}
    </div>
  );
}
