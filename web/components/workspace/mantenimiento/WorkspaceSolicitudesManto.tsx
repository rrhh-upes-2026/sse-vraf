"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { MantoSolicitud, MantoEstadoSolicitud, MantoPrioridad } from "@/types/entities";
import { useSolicitudesManto } from "@/hooks/useMantenimiento";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";

const ESTADO_VARIANT: Record<MantoEstadoSolicitud, BadgeVariant> = {
  pendiente:   "warning",
  aprobada:    "info",
  rechazada:   "danger",
  en_proceso:  "warning",
  completada:  "success",
};

const ESTADO_LABEL: Record<MantoEstadoSolicitud, string> = {
  pendiente:   "Pendiente",
  aprobada:    "Aprobada",
  rechazada:   "Rechazada",
  en_proceso:  "En Proceso",
  completada:  "Completada",
};

const PRIORIDAD_VARIANT: Record<MantoPrioridad, BadgeVariant> = {
  baja:    "gray",
  normal:  "default",
  alta:    "warning",
  critica: "danger",
};

const FILTROS: Array<{ value: MantoEstadoSolicitud | "todos"; label: string }> = [
  { value: "todos",      label: "Todas" },
  { value: "pendiente",  label: "Pendientes" },
  { value: "aprobada",   label: "Aprobadas" },
  { value: "en_proceso", label: "En Proceso" },
  { value: "completada", label: "Completadas" },
];

function SolicitudCard({ sol }: { sol: MantoSolicitud }) {
  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-4 flex flex-col gap-2 hover:border-sse-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] font-mono text-sse-primary">{sol.codigo}</p>
            <Badge variant={PRIORIDAD_VARIANT[sol.prioridad]} className="text-[10px]">
              {sol.prioridad}
            </Badge>
          </div>
          <p className="text-[13px] font-semibold text-sse-ink leading-snug line-clamp-2 mt-0.5">{sol.titulo}</p>
          <p className="text-[11px] text-sse-muted capitalize">{sol.tipo}</p>
        </div>
        <Badge variant={ESTADO_VARIANT[sol.estado]} className="shrink-0 text-[10px]">
          {ESTADO_LABEL[sol.estado]}
        </Badge>
      </div>

      {sol.descripcion && (
        <p className="text-[11px] text-sse-muted line-clamp-2">{sol.descripcion}</p>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <span className="text-sse-muted">Solicitud</span>
        <span className="font-medium text-sse-ink text-right">{fmtShortDate(sol.fechaSolicitud)}</span>
        {sol.fechaRequerida && (
          <>
            <span className="text-sse-muted">Requerida para</span>
            <span className={cn(
              "font-medium text-right",
              sol.estado === "pendiente" && new Date(sol.fechaRequerida) < new Date()
                ? "text-sse-sem-red-fg"
                : "text-sse-ink"
            )}>{fmtShortDate(sol.fechaRequerida)}</span>
          </>
        )}
        {sol.activoRef && (
          <>
            <span className="text-sse-muted">Activo</span>
            <span className="font-medium text-sse-ink text-right truncate">{sol.activoRef}</span>
          </>
        )}
        {sol.ubicacionRef && (
          <>
            <span className="text-sse-muted">Ubicación</span>
            <span className="font-medium text-sse-ink text-right truncate">{sol.ubicacionRef}</span>
          </>
        )}
      </div>

      {sol.ordenTrabajoId && (
        <p className="text-[11px] text-sse-muted border-t border-sse-border pt-2">
          OT vinculada: <span className="font-mono font-medium text-sse-ink">{sol.ordenTrabajoId}</span>
        </p>
      )}
    </div>
  );
}

export function WorkspaceSolicitudesManto({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<MantoEstadoSolicitud | "todos">("todos");
  const { data: solicitudes, isLoading } = useSolicitudesManto({ wsId });

  const filtered = (solicitudes ?? []).filter((s) =>
    filtro === "todos" ? s.deletedAt == null : s.estado === filtro,
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Solicitudes de Servicio</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Solicitudes de mantenimiento recibidas de las unidades</p>
        </div>
        {filtered.length > 0 && (
          <p className="text-[11px] text-sse-muted shrink-0">{filtered.length} solicitudes</p>
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
          icon="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414A1 1 0 0 0 6.586 13H4"
          title="Sin solicitudes"
          description="No se encontraron solicitudes con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((s) => <SolicitudCard key={s.id} sol={s} />)}
        </div>
      )}
    </div>
  );
}
