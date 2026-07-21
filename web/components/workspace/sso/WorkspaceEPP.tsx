"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { SSOEPP, SSOEstadoEPP } from "@/types/entities";
import { useEPP } from "@/hooks/useSSO";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const ESTADO_VARIANT: Record<SSOEstadoEPP, BadgeVariant> = {
  activo:      "success",
  vencido:     "danger",
  deteriorado: "warning",
  baja:        "gray",
};

const ESTADO_LABEL: Record<SSOEstadoEPP, string> = {
  activo:      "Activo",
  vencido:     "Vencido",
  deteriorado: "Deteriorado",
  baja:        "Baja",
};

const FILTROS: Array<{ value: SSOEstadoEPP | "todos" | "por_vencer"; label: string }> = [
  { value: "todos",      label: "Todos" },
  { value: "activo",     label: "Activos" },
  { value: "vencido",    label: "Vencidos" },
  { value: "deteriorado", label: "Deteriorados" },
];

function EPPCard({ item }: { item: SSOEPP }) {
  const esProblema = item.estado === "vencido" || item.estado === "deteriorado";

  return (
    <div className={cn(
      "bg-sse-surface border rounded-md p-4 flex flex-col gap-2 hover:border-sse-primary/40 transition-colors",
      esProblema ? "border-sse-sem-yellow-fg/40" : "border-sse-border"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono text-sse-primary">{item.codigo}</p>
          <p className="text-[13px] font-semibold text-sse-ink leading-snug line-clamp-1 mt-0.5">{item.nombre}</p>
          <p className="text-[11px] text-sse-muted capitalize">{item.categoria} · {item.tipo}</p>
        </div>
        <Badge variant={ESTADO_VARIANT[item.estado]} className="shrink-0 text-[10px]">
          {ESTADO_LABEL[item.estado]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <span className="text-sse-muted">Empleado</span>
        <span className="font-medium text-sse-ink text-right truncate">{item.empleadoRef}</span>
        <span className="text-sse-muted">Entrega</span>
        <span className="font-medium text-sse-ink text-right">{item.fechaEntrega}</span>
        {item.fechaVencimiento && (
          <>
            <span className="text-sse-muted">Vencimiento</span>
            <span className={cn("font-medium text-right", item.estado === "vencido" ? "text-sse-sem-red-fg" : "text-sse-ink")}>
              {item.fechaVencimiento}
            </span>
          </>
        )}
        <span className="text-sse-muted">Cantidad</span>
        <span className="font-medium text-sse-ink text-right">{item.cantidad} {item.unidadMedida}</span>
      </div>
    </div>
  );
}

export function WorkspaceEPP({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<string>("todos");
  const { data: items, isLoading } = useEPP({ wsId });

  const filtered = (items ?? []).filter((i) => {
    if (filtro === "todos") return i.deletedAt == null;
    return i.estado === filtro;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Control de EPP</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Equipos de protección personal entregados a empleados</p>
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
          {[0,1,2].map((i) => <SkeletonCard key={i} className="h-[160px]" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          title="Sin registros de EPP"
          description="No se encontraron equipos de protección con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((i) => <EPPCard key={i.id} item={i} />)}
        </div>
      )}
    </div>
  );
}
