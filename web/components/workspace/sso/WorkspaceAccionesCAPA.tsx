"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { SSOAccion, SSOTipoAccion, SSOEstadoAccion } from "@/types/entities";
import { useAccionesSSO } from "@/hooks/useSSO";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const TIPO_VARIANT: Record<SSOTipoAccion, BadgeVariant> = {
  correctiva:  "danger",
  preventiva:  "warning",
  mejora:      "info",
};

const ESTADO_VARIANT: Record<SSOEstadoAccion, BadgeVariant> = {
  pendiente:   "warning",
  en_proceso:  "info",
  verificada:  "purple",
  cerrada:     "success",
  vencida:     "danger",
};

const FILTROS = [
  { value: "todos",      label: "Todas" },
  { value: "pendiente",  label: "Pendientes" },
  { value: "en_proceso", label: "En proceso" },
  { value: "vencida",    label: "Vencidas" },
  { value: "cerrada",    label: "Cerradas" },
];

function AccionCard({ item }: { item: SSOAccion }) {
  const esVencida = item.estado === "vencida";
  const progreso = item.progresoPct ?? 0;

  return (
    <div className={cn(
      "bg-sse-surface border rounded-md p-4 flex flex-col gap-2 hover:border-sse-primary/40 transition-colors",
      esVencida ? "border-sse-sem-red-fg/40" : "border-sse-border"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono text-sse-primary">{item.codigo}</p>
          <p className="text-[13px] font-semibold text-sse-ink leading-snug line-clamp-2 mt-0.5">{item.titulo}</p>
          <p className="text-[11px] text-sse-muted capitalize">{item.area} · {item.origen}</p>
        </div>
        <div className="flex flex-col gap-1 items-end shrink-0">
          <Badge variant={TIPO_VARIANT[item.tipo]} className="text-[10px]">{item.tipo}</Badge>
          <Badge variant={ESTADO_VARIANT[item.estado]} className="text-[10px]">{item.estado.replace("_", " ")}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <span className="text-sse-muted">Responsable</span>
        <span className="font-medium text-sse-ink text-right truncate">{item.responsableRef}</span>
        <span className="text-sse-muted">Vence</span>
        <span className={cn("font-medium text-right", esVencida ? "text-sse-sem-red-fg" : "text-sse-ink")}>
          {item.fechaLimite}
        </span>
      </div>

      {progreso > 0 && (
        <div>
          <div className="flex justify-between text-[10px] mb-0.5">
            <span className="text-sse-muted">Progreso</span>
            <span className="text-sse-ink font-medium">{progreso}%</span>
          </div>
          <div className="h-1.5 bg-sse-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-sse-primary"
              style={{ width: `${Math.min(100, progreso)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function WorkspaceAccionesCAPA({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<string>("todos");
  const { data: items, isLoading } = useAccionesSSO({ wsId });

  const filtered = (items ?? []).filter((i) => {
    if (filtro === "todos") return i.deletedAt == null;
    return i.estado === filtro;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Acciones CAPA</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Acciones correctivas, preventivas y de mejora</p>
        </div>
        {filtered.length > 0 && (
          <p className="text-[11px] text-sse-muted shrink-0">{filtered.length} acciones</p>
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
          icon="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4"
          title="Sin acciones CAPA"
          description="No se encontraron acciones con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((i) => <AccionCard key={i.id} item={i} />)}
        </div>
      )}
    </div>
  );
}
