"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { ContaConciliacion, ContaEstadoConciliacion } from "@/types/entities";
import { useConciliaciones } from "@/hooks/useContabilidad";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";

const ESTADO_VARIANT: Record<ContaEstadoConciliacion, BadgeVariant> = {
  abierta:    "warning",
  en_proceso: "info",
  cerrada:    "success",
};

const ESTADO_LABEL: Record<ContaEstadoConciliacion, string> = {
  abierta:    "Abierta",
  en_proceso: "En proceso",
  cerrada:    "Cerrada",
};

const FILTROS: Array<{ value: ContaEstadoConciliacion | "todas"; label: string }> = [
  { value: "todas",      label: "Todas" },
  { value: "abierta",    label: "Abiertas" },
  { value: "en_proceso", label: "En proceso" },
  { value: "cerrada",    label: "Cerradas" },
];

function ConciliacionCard({ conc }: { conc: ContaConciliacion }) {
  const difPositiva = conc.diferencia >= 0;
  return (
    <div className={cn(
      "bg-sse-surface border rounded-md p-4 flex flex-col gap-2 transition-colors",
      Math.abs(conc.diferencia) > 0
        ? "border-sse-sem-yellow-fg/40"
        : "border-sse-border hover:border-sse-primary/40"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono text-sse-primary">{conc.periodo}</p>
          <p className="text-[13px] font-semibold text-sse-ink mt-0.5">{conc.cuenta}</p>
          {conc.banco && <p className="text-[11px] text-sse-muted">{conc.banco}</p>}
        </div>
        <Badge variant={ESTADO_VARIANT[conc.estado]} className="shrink-0 text-[10px]">
          {ESTADO_LABEL[conc.estado]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <span className="text-sse-muted">Saldo banco</span>
        <span className="font-medium text-sse-ink text-right">${conc.saldoBanco.toLocaleString()}</span>
        <span className="text-sse-muted">Saldo libros</span>
        <span className="font-medium text-sse-ink text-right">${conc.saldoLibros.toLocaleString()}</span>
        <span className="text-sse-muted font-semibold">Diferencia</span>
        <span className={cn(
          "font-bold text-right",
          conc.diferencia === 0 ? "text-sse-sem-green-fg" : "text-sse-sem-yellow-fg"
        )}>
          {difPositiva ? "+" : ""}{conc.diferencia.toLocaleString()}
        </span>
        <span className="text-sse-muted">Inicio</span>
        <span className="font-medium text-sse-ink text-right">{fmtShortDate(conc.fechaInicio)}</span>
        {conc.fechaCierre && (
          <>
            <span className="text-sse-muted">Cierre</span>
            <span className="font-medium text-sse-ink text-right">{fmtShortDate(conc.fechaCierre)}</span>
          </>
        )}
      </div>

      {conc.observaciones && (
        <p className="text-[11px] text-sse-muted line-clamp-2 border-t border-sse-border pt-2">{conc.observaciones}</p>
      )}
    </div>
  );
}

export function WorkspaceConciliaciones({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<ContaEstadoConciliacion | "todas">("todas");
  const { data: conciliaciones, isLoading } = useConciliaciones({ wsId });

  const filtered = (conciliaciones ?? []).filter((c) =>
    filtro === "todas" ? c.deletedAt == null : c.estado === filtro,
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[18px] font-semibold text-sse-ink">Conciliaciones Bancarias</h1>
        <p className="text-[13px] text-sse-muted mt-0.5">Verificación y cierre de conciliaciones por período</p>
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
          icon="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          title="Sin conciliaciones"
          description="No se encontraron conciliaciones con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => <ConciliacionCard key={c.id} conc={c} />)}
        </div>
      )}
    </div>
  );
}
