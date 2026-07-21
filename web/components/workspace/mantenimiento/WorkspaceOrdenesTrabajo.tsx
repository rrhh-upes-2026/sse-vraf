"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { MantoOrdenTrabajo, MantoEstadoOrden, MantoPrioridad } from "@/types/entities";
import { useOrdenesTrabajo } from "@/hooks/useMantenimiento";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";

const ESTADO_VARIANT: Record<MantoEstadoOrden, BadgeVariant> = {
  emitida:    "info",
  asignada:   "warning",
  en_proceso: "warning",
  completada: "success",
  cancelada:  "gray",
};

const ESTADO_LABEL: Record<MantoEstadoOrden, string> = {
  emitida:    "Emitida",
  asignada:   "Asignada",
  en_proceso: "En Proceso",
  completada: "Completada",
  cancelada:  "Cancelada",
};

const PRIORIDAD_VARIANT: Record<MantoPrioridad, BadgeVariant> = {
  baja:    "gray",
  normal:  "default",
  alta:    "warning",
  critica: "danger",
};

const FILTROS: Array<{ value: MantoEstadoOrden | "todos"; label: string }> = [
  { value: "todos",      label: "Todas" },
  { value: "emitida",    label: "Emitidas" },
  { value: "asignada",   label: "Asignadas" },
  { value: "en_proceso", label: "En Proceso" },
  { value: "completada", label: "Completadas" },
];

function OrdenCard({ orden }: { orden: MantoOrdenTrabajo }) {
  const costoTotal = (orden.costoManoObra ?? 0) + (orden.costoMateriales ?? 0);

  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-4 flex flex-col gap-2 hover:border-sse-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] font-mono text-sse-primary">{orden.codigo}</p>
            <Badge variant={PRIORIDAD_VARIANT[orden.prioridad]} className="text-[10px]">
              {orden.prioridad}
            </Badge>
          </div>
          <p className="text-[13px] font-semibold text-sse-ink leading-snug line-clamp-2 mt-0.5">{orden.titulo}</p>
          <p className="text-[11px] text-sse-muted capitalize">{orden.tipo}</p>
        </div>
        <Badge variant={ESTADO_VARIANT[orden.estado]} className="shrink-0 text-[10px]">
          {ESTADO_LABEL[orden.estado]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        {orden.activoRef && (
          <>
            <span className="text-sse-muted">Activo</span>
            <span className="font-medium text-sse-ink text-right truncate">{orden.activoRef}</span>
          </>
        )}
        {orden.tecnicoRef && (
          <>
            <span className="text-sse-muted">Técnico</span>
            <span className="font-medium text-sse-ink text-right truncate">{orden.tecnicoRef}</span>
          </>
        )}
        <span className="text-sse-muted">Emisión</span>
        <span className="font-medium text-sse-ink text-right">{fmtShortDate(orden.fechaEmision)}</span>
        {orden.fechaEstimadaFin && (
          <>
            <span className="text-sse-muted">Est. fin</span>
            <span className={cn(
              "font-medium text-right",
              orden.estado !== "completada" && new Date(orden.fechaEstimadaFin) < new Date()
                ? "text-sse-sem-red-fg"
                : "text-sse-ink"
            )}>{fmtShortDate(orden.fechaEstimadaFin)}</span>
          </>
        )}
        {orden.horasReales != null && orden.horasReales > 0 && (
          <>
            <span className="text-sse-muted">Horas reales</span>
            <span className="font-medium text-sse-ink text-right">{orden.horasReales}h</span>
          </>
        )}
      </div>

      {orden.estado === "completada" && costoTotal > 0 && (
        <div className="flex justify-between items-center border-t border-sse-border pt-2">
          <span className="text-[11px] text-sse-muted">Costo total</span>
          <span className="text-[12px] font-bold text-sse-ink">${costoTotal.toLocaleString()}</span>
        </div>
      )}

      {orden.etapaActual && (
        <p className="text-[11px] text-sse-muted">
          Etapa: <span className="font-medium text-sse-ink capitalize">{orden.etapaActual.replace("_", " ")}</span>
        </p>
      )}
    </div>
  );
}

export function WorkspaceOrdenesTrabajo({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<MantoEstadoOrden | "todos">("todos");
  const { data: ordenes, isLoading } = useOrdenesTrabajo({ wsId });

  const filtered = (ordenes ?? []).filter((o) =>
    filtro === "todos" ? o.deletedAt == null : o.estado === filtro,
  );

  const costoAcum = filtered.filter(o => o.estado === "completada")
    .reduce((sum, o) => sum + ((o.costoManoObra ?? 0) + (o.costoMateriales ?? 0)), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Órdenes de Trabajo</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Seguimiento de órdenes de mantenimiento preventivo y correctivo</p>
        </div>
        {filtered.length > 0 && (
          <div className="text-right">
            <p className="text-[11px] text-sse-muted">{filtered.length} órdenes</p>
            {costoAcum > 0 && (
              <p className="text-[13px] font-bold text-sse-ink">${costoAcum.toLocaleString()}</p>
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
          {[0,1,2].map((i) => <SkeletonCard key={i} className="h-[200px]" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4"
          title="Sin órdenes de trabajo"
          description="No se encontraron órdenes con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((o) => <OrdenCard key={o.id} orden={o} />)}
        </div>
      )}
    </div>
  );
}
