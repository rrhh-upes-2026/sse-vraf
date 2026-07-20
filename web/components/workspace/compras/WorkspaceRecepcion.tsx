"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { ComprasRecepcion } from "@/types/entities";
import { useRecepciones } from "@/hooks/useCompras";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";

type EstadoRec = ComprasRecepcion["estado"];
type CondicionRec = ComprasRecepcion["condicion"];

const ESTADO_VARIANT: Record<EstadoRec, BadgeVariant> = {
  registrada:         "info",
  validada:           "success",
  con_observaciones:  "warning",
};

const ESTADO_LABEL: Record<EstadoRec, string> = {
  registrada:         "Registrada",
  validada:           "Validada",
  con_observaciones:  "Con observaciones",
};

const CONDICION_VARIANT: Record<CondicionRec, BadgeVariant> = {
  buena:     "success",
  regular:   "warning",
  rechazada: "danger",
};

const CONDICION_LABEL: Record<CondicionRec, string> = {
  buena:     "Buena",
  regular:   "Regular",
  rechazada: "Rechazada",
};

const FILTROS: Array<{ value: EstadoRec | "todas"; label: string }> = [
  { value: "todas",              label: "Todas" },
  { value: "registrada",         label: "Registradas" },
  { value: "validada",           label: "Validadas" },
  { value: "con_observaciones",  label: "Con observaciones" },
];

function RecepcionCard({ rec }: { rec: ComprasRecepcion }) {
  const pct = rec.cantidadSolicitada
    ? Math.round((rec.cantidadRecibida / rec.cantidadSolicitada) * 100)
    : null;

  return (
    <div className={cn(
      "bg-sse-surface border rounded-md p-4 flex flex-col gap-2 transition-colors",
      rec.condicion === "rechazada"
        ? "border-sse-sem-red-fg/40 bg-sse-sem-red-bg/10"
        : "border-sse-border hover:border-sse-primary/40"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono text-sse-primary">
            {rec.codigo ?? rec.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-[13px] font-semibold text-sse-ink mt-0.5">
            {rec.cantidadRecibida} {rec.unidadMedida ?? "uds."} recibidas
          </p>
          {rec.cantidadSolicitada && (
            <p className="text-[11px] text-sse-muted">
              de {rec.cantidadSolicitada} solicitadas
              {pct !== null && ` · ${pct}%`}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={ESTADO_VARIANT[rec.estado]} className="text-[10px]">
            {ESTADO_LABEL[rec.estado]}
          </Badge>
          <Badge variant={CONDICION_VARIANT[rec.condicion]} className="text-[10px]">
            {CONDICION_LABEL[rec.condicion]}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <span className="text-sse-muted">Fecha recepción</span>
        <span className="font-medium text-sse-ink text-right">{fmtShortDate(rec.fechaRecepcion)}</span>
        <span className="text-sse-muted">Orden</span>
        <span className="font-medium text-sse-ink text-right font-mono truncate">{rec.ordenId.slice(0, 8).toUpperCase()}</span>
      </div>

      {rec.observaciones && (
        <p className="text-[11px] text-sse-muted line-clamp-2 border-t border-sse-border pt-2">
          {rec.observaciones}
        </p>
      )}
    </div>
  );
}

export function WorkspaceRecepcion({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<EstadoRec | "todas">("todas");
  const { data: recepciones, isLoading } = useRecepciones({ wsId });

  const filtered = (recepciones ?? []).filter((r) =>
    filtro === "todas" ? r.deletedAt == null : r.estado === filtro,
  );

  const validadas = (recepciones ?? []).filter((r) => r.estado === "validada").length;
  const conObs    = (recepciones ?? []).filter((r) => r.estado === "con_observaciones").length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Recepción de Bienes</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Registro y validación de bienes y servicios recibidos</p>
        </div>
        {(recepciones ?? []).length > 0 && (
          <div className="text-right text-[11px] text-sse-muted space-y-0.5">
            <p>{validadas} validadas</p>
            {conObs > 0 && <p className="text-sse-sem-yellow-fg">{conObs} con observaciones</p>}
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
          {[0,1,2].map((i) => <SkeletonCard key={i} className="h-[160px]" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
          title="Sin recepciones"
          description="No se encontraron recepciones con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((r) => <RecepcionCard key={r.id} rec={r} />)}
        </div>
      )}
    </div>
  );
}
