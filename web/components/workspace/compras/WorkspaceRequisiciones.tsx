"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { ComprasRequisicion } from "@/types/entities";
import { useRequisiciones } from "@/hooks/useCompras";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";

type EstadoReq = ComprasRequisicion["estado"];

const ESTADO_VARIANT: Record<EstadoReq, BadgeVariant> = {
  pendiente:   "warning",
  aprobada:    "success",
  rechazada:   "danger",
  completada:  "default",
};

const ESTADO_LABEL: Record<EstadoReq, string> = {
  pendiente:  "Pendiente",
  aprobada:   "Aprobada",
  rechazada:  "Rechazada",
  completada: "Completada",
};

const FILTROS: Array<{ value: EstadoReq | "todas"; label: string }> = [
  { value: "todas",     label: "Todas" },
  { value: "pendiente", label: "Pendientes" },
  { value: "aprobada",  label: "Aprobadas" },
  { value: "rechazada", label: "Rechazadas" },
];

function RequisicionCard({ req }: { req: ComprasRequisicion }) {
  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-4 flex flex-col gap-2 hover:border-sse-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-mono text-sse-primary">{req.codigo ?? req.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-[13px] font-semibold text-sse-ink leading-snug line-clamp-2 mt-0.5">{req.descripcion}</p>
        </div>
        <Badge variant={ESTADO_VARIANT[req.estado]} className="shrink-0 text-[10px]">
          {ESTADO_LABEL[req.estado]}
        </Badge>
      </div>

      {req.especificaciones && (
        <p className="text-[11px] text-sse-muted line-clamp-2">{req.especificaciones}</p>
      )}

      <div className="flex items-center justify-between text-[11px] text-sse-muted">
        <span>{req.cantidad ? `${req.cantidad} ${req.unidadMedida ?? ""}` : "—"}</span>
        {req.presupuestoEstimado ? (
          <span className="font-medium text-sse-ink">${req.presupuestoEstimado.toLocaleString()}</span>
        ) : null}
      </div>

      {req.fechaAprobacion && (
        <p className="text-[11px] text-sse-muted">
          Aprobada: <span className="font-medium text-sse-ink">{fmtShortDate(req.fechaAprobacion)}</span>
        </p>
      )}
    </div>
  );
}

export function WorkspaceRequisiciones({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<EstadoReq | "todas">("todas");
  const { data: requisiciones, isLoading } = useRequisiciones({ wsId });

  const filtered = (requisiciones ?? []).filter((r) =>
    filtro === "todas" ? r.deletedAt == null : r.estado === filtro,
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[18px] font-semibold text-sse-ink">Requisiciones</h1>
        <p className="text-[13px] text-sse-muted mt-0.5">Especificaciones formales de bienes y servicios a adquirir</p>
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
          {[0,1,2].map((i) => <SkeletonCard key={i} className="h-[150px]" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2"
          title="Sin requisiciones"
          description="No se encontraron requisiciones con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((r) => <RequisicionCard key={r.id} req={r} />)}
        </div>
      )}
    </div>
  );
}
