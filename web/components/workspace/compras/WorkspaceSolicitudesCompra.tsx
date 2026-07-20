"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { ComprasSolicitud, ComprasEstadoSolicitud, ComprasPrioridad } from "@/types/entities";
import { useSolicitudesCompra } from "@/hooks/useCompras";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";

const ESTADO_VARIANT: Record<ComprasEstadoSolicitud, BadgeVariant> = {
  pendiente:   "warning",
  en_revision: "info",
  aprobada:    "success",
  rechazada:   "danger",
  archivada:   "gray",
};

const ESTADO_LABEL: Record<ComprasEstadoSolicitud, string> = {
  pendiente:   "Pendiente",
  en_revision: "En revisión",
  aprobada:    "Aprobada",
  rechazada:   "Rechazada",
  archivada:   "Archivada",
};

const PRIORIDAD_VARIANT: Record<ComprasPrioridad, BadgeVariant> = {
  normal:  "default",
  urgente: "warning",
  critica: "danger",
};

const FILTROS: Array<{ value: ComprasEstadoSolicitud | "todos"; label: string }> = [
  { value: "todos",      label: "Todas" },
  { value: "pendiente",  label: "Pendientes" },
  { value: "en_revision",label: "En revisión" },
  { value: "aprobada",   label: "Aprobadas" },
  { value: "rechazada",  label: "Rechazadas" },
];

function SolicitudCard({ sol }: { sol: ComprasSolicitud }) {
  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-4 flex flex-col gap-2 hover:border-sse-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-semibold text-sse-ink leading-snug flex-1 line-clamp-2">{sol.titulo}</p>
        <div className="flex gap-1 shrink-0">
          {sol.prioridad !== "normal" && (
            <Badge variant={PRIORIDAD_VARIANT[sol.prioridad]} className="text-[10px]">{sol.prioridad}</Badge>
          )}
          <Badge variant={ESTADO_VARIANT[sol.estado]} className="text-[10px]">
            {ESTADO_LABEL[sol.estado]}
          </Badge>
        </div>
      </div>
      {sol.descripcion && (
        <p className="text-[11px] text-sse-muted line-clamp-2">{sol.descripcion}</p>
      )}
      <div className="flex items-center justify-between text-[11px] text-sse-muted">
        <span>{sol.tipo}</span>
        <span>
          {sol.fechaSolicitud ? fmtShortDate(sol.fechaSolicitud) : "—"}
          {sol.monto ? ` · $${sol.monto.toLocaleString()}` : ""}
        </span>
      </div>
      <p className="text-[11px] text-sse-muted">Etapa: <span className="font-medium text-sse-ink">{sol.etapaActual}</span></p>
    </div>
  );
}

interface WorkspaceSolicitudesCompraProps {
  wsId: WorkspaceId;
}

export function WorkspaceSolicitudesCompra({ wsId }: WorkspaceSolicitudesCompraProps) {
  const [filtro, setFiltro] = useState<ComprasEstadoSolicitud | "todos">("todos");
  const { data: solicitudes, isLoading } = useSolicitudesCompra({ wsId });

  const filtered = (solicitudes ?? []).filter((s) =>
    filtro === "todos" ? s.deletedAt == null : s.estado === filtro,
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[18px] font-semibold text-sse-ink">Solicitudes de Compra</h1>
        <p className="text-[13px] text-sse-muted mt-0.5">Solicitudes de adquisición de bienes y servicios</p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {FILTROS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={cn(
              "px-3 py-1 rounded-full text-[12px] font-medium border transition-colors",
              filtro === f.value
                ? "bg-sse-primary text-white border-sse-primary"
                : "bg-sse-surface text-sse-muted border-sse-border hover:border-sse-primary/40",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[0,1,2,3].map((i) => <SkeletonCard key={i} className="h-[140px]" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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
