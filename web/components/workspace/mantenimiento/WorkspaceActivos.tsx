"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { MantoActivo, MantoEstadoActivo } from "@/types/entities";
import { useActivos } from "@/hooks/useMantenimiento";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";

const ESTADO_VARIANT: Record<MantoEstadoActivo, BadgeVariant> = {
  operativo:     "success",
  inactivo:      "gray",
  mantenimiento: "warning",
  baja:          "danger",
};

const ESTADO_LABEL: Record<MantoEstadoActivo, string> = {
  operativo:     "Operativo",
  inactivo:      "Inactivo",
  mantenimiento: "En Manto.",
  baja:          "Baja",
};

const FILTROS: Array<{ value: MantoEstadoActivo | "todos"; label: string }> = [
  { value: "todos",         label: "Todos" },
  { value: "operativo",     label: "Operativos" },
  { value: "mantenimiento", label: "En Manto." },
  { value: "inactivo",      label: "Inactivos" },
];

function ActivoCard({ activo }: { activo: MantoActivo }) {
  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-4 flex flex-col gap-2 hover:border-sse-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono text-sse-primary">{activo.codigo}</p>
          <p className="text-[13px] font-semibold text-sse-ink leading-snug line-clamp-2 mt-0.5">{activo.nombre}</p>
          <p className="text-[11px] text-sse-muted capitalize">{activo.categoria}{activo.tipo ? ` · ${activo.tipo}` : ""}</p>
        </div>
        <Badge variant={ESTADO_VARIANT[activo.estado]} className="shrink-0 text-[10px]">
          {ESTADO_LABEL[activo.estado]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        {activo.marca && (
          <>
            <span className="text-sse-muted">Marca / Modelo</span>
            <span className="font-medium text-sse-ink text-right truncate">
              {activo.marca}{activo.modelo ? ` ${activo.modelo}` : ""}
            </span>
          </>
        )}
        {activo.serie && (
          <>
            <span className="text-sse-muted">Serie</span>
            <span className="font-mono text-sse-ink text-right truncate">{activo.serie}</span>
          </>
        )}
        {activo.ubicacionRef && (
          <>
            <span className="text-sse-muted">Ubicación</span>
            <span className="font-medium text-sse-ink text-right truncate">{activo.ubicacionRef}</span>
          </>
        )}
        {activo.valorActual != null && activo.valorActual > 0 && (
          <>
            <span className="text-sse-muted">Valor actual</span>
            <span className="font-bold text-sse-ink text-right">${activo.valorActual.toLocaleString()}</span>
          </>
        )}
      </div>

      {activo.proximoMantenimientoFecha && (
        <p className="text-[11px] text-sse-muted border-t border-sse-border pt-2">
          Próx. manto: <span className={cn(
            "font-medium",
            new Date(activo.proximoMantenimientoFecha) < new Date()
              ? "text-sse-sem-red-fg"
              : "text-sse-ink"
          )}>{fmtShortDate(activo.proximoMantenimientoFecha)}</span>
        </p>
      )}

      {activo.garantiaFecha && (
        <p className="text-[11px] text-sse-muted">
          Garantía hasta: <span className="font-medium text-sse-ink">{fmtShortDate(activo.garantiaFecha)}</span>
        </p>
      )}
    </div>
  );
}

export function WorkspaceActivos({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<MantoEstadoActivo | "todos">("todos");
  const { data: activos, isLoading } = useActivos({ wsId });

  const filtered = (activos ?? []).filter((a) =>
    filtro === "todos" ? a.deletedAt == null : a.estado === filtro,
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Activos Institucionales</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Registro y seguimiento de activos físicos e infraestructura</p>
        </div>
        {filtered.length > 0 && (
          <p className="text-[11px] text-sse-muted shrink-0">{filtered.length} activos</p>
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
          icon="M5 8h14M5 8a2 2 0 1 0 0-4h14a2 2 0 1 0 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8m-9 4h4"
          title="Sin activos"
          description="No se encontraron activos con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((a) => <ActivoCard key={a.id} activo={a} />)}
        </div>
      )}
    </div>
  );
}
