"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { SSOCapacitacion, SSOEstadoCapac } from "@/types/entities";
import { useCapacitacionesSSO } from "@/hooks/useSSO";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const ESTADO_VARIANT: Record<SSOEstadoCapac, BadgeVariant> = {
  programada:  "info",
  en_proceso:  "warning",
  completada:  "success",
  cancelada:   "gray",
};

const ESTADO_LABEL: Record<SSOEstadoCapac, string> = {
  programada:  "Programada",
  en_proceso:  "En proceso",
  completada:  "Completada",
  cancelada:   "Cancelada",
};

const FILTROS: Array<{ value: SSOEstadoCapac | "todos"; label: string }> = [
  { value: "todos",      label: "Todas" },
  { value: "programada", label: "Programadas" },
  { value: "en_proceso", label: "En proceso" },
  { value: "completada", label: "Completadas" },
];

function CapacitacionCard({ item }: { item: SSOCapacitacion }) {
  const aprobacionPct = item.numParticipantes && item.numParticipantes > 0 && item.numAprobados != null
    ? Math.round((item.numAprobados / item.numParticipantes) * 100)
    : null;

  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-4 flex flex-col gap-2 hover:border-sse-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono text-sse-primary">{item.codigo}</p>
          <p className="text-[13px] font-semibold text-sse-ink leading-snug line-clamp-2 mt-0.5">{item.titulo}</p>
          <p className="text-[11px] text-sse-muted capitalize">{item.tipo} · {item.modalidad}</p>
        </div>
        <Badge variant={ESTADO_VARIANT[item.estado]} className="shrink-0 text-[10px]">
          {ESTADO_LABEL[item.estado]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <span className="text-sse-muted">Instructor</span>
        <span className="font-medium text-sse-ink text-right truncate">{item.instructor}</span>
        <span className="text-sse-muted">Inicio</span>
        <span className="font-medium text-sse-ink text-right">{item.fechaInicio}</span>
        <span className="text-sse-muted">Duración</span>
        <span className="font-medium text-sse-ink text-right">{item.duracionHoras}h</span>
        {item.numParticipantes != null && (
          <>
            <span className="text-sse-muted">Participantes</span>
            <span className="font-medium text-sse-ink text-right">{item.numParticipantes}</span>
          </>
        )}
      </div>

      {aprobacionPct !== null && item.estado === "completada" && (
        <div>
          <div className="flex justify-between text-[10px] mb-0.5">
            <span className="text-sse-muted">Aprobación</span>
            <span className={cn("font-medium", aprobacionPct >= 80 ? "text-sse-sem-green-fg" : "text-sse-sem-yellow-fg")}>
              {item.numAprobados}/{item.numParticipantes} ({aprobacionPct}%)
            </span>
          </div>
          <div className="h-1.5 bg-sse-border rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full", aprobacionPct >= 80 ? "bg-sse-sem-green-fg" : "bg-sse-sem-yellow-fg")}
              style={{ width: `${Math.min(100, aprobacionPct)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function WorkspaceCapacitacionesSSO({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<string>("todos");
  const { data: items, isLoading } = useCapacitacionesSSO({ wsId });

  const filtered = (items ?? []).filter((i) => {
    if (filtro === "todos") return i.deletedAt == null;
    return i.estado === filtro;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Capacitaciones SSO</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Plan de capacitación en seguridad y salud ocupacional</p>
        </div>
        {filtered.length > 0 && (
          <p className="text-[11px] text-sse-muted shrink-0">{filtered.length} capacitaciones</p>
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
          icon="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 0 1 .665 6.479A11.952 11.952 0 0 0 12 20.055a11.952 11.952 0 0 0-6.824-2.998 12.078 12.078 0 0 1 .665-6.479L12 14z"
          title="Sin capacitaciones"
          description="No se encontraron capacitaciones con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((i) => <CapacitacionCard key={i.id} item={i} />)}
        </div>
      )}
    </div>
  );
}
