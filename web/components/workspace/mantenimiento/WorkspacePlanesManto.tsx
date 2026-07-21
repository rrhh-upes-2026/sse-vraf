"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { MantoPlan, MantoEstadoPlan } from "@/types/entities";
import { usePlanes } from "@/hooks/useMantenimiento";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";

const ESTADO_VARIANT: Record<MantoEstadoPlan, BadgeVariant> = {
  borrador:   "gray",
  activo:     "success",
  pausado:    "warning",
  completado: "info",
};

const ESTADO_LABEL: Record<MantoEstadoPlan, string> = {
  borrador:   "Borrador",
  activo:     "Activo",
  pausado:    "Pausado",
  completado: "Completado",
};

const FILTROS: Array<{ value: MantoEstadoPlan | "todos"; label: string }> = [
  { value: "todos",     label: "Todos" },
  { value: "activo",    label: "Activos" },
  { value: "borrador",  label: "Borradores" },
  { value: "completado",label: "Completados" },
];

function PlanCard({ plan }: { plan: MantoPlan }) {
  const pct = Math.min(100, Math.max(0, plan.cumplimientoPct ?? 0));
  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-4 flex flex-col gap-2 hover:border-sse-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono text-sse-primary">{plan.codigo}</p>
          <p className="text-[13px] font-semibold text-sse-ink leading-snug line-clamp-2 mt-0.5">{plan.nombre}</p>
          <p className="text-[11px] text-sse-muted capitalize">{plan.tipo} · cada {plan.frecuencia}</p>
        </div>
        <Badge variant={ESTADO_VARIANT[plan.estado]} className="shrink-0 text-[10px]">
          {ESTADO_LABEL[plan.estado]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        {plan.activoRef && (
          <>
            <span className="text-sse-muted">Activo</span>
            <span className="font-medium text-sse-ink text-right truncate">{plan.activoRef}</span>
          </>
        )}
        {plan.duracionHoras != null && plan.duracionHoras > 0 && (
          <>
            <span className="text-sse-muted">Duración est.</span>
            <span className="font-medium text-sse-ink text-right">{plan.duracionHoras}h</span>
          </>
        )}
        {plan.costoEstimado != null && plan.costoEstimado > 0 && (
          <>
            <span className="text-sse-muted">Costo est.</span>
            <span className="font-medium text-sse-ink text-right">${plan.costoEstimado.toLocaleString()}</span>
          </>
        )}
        {plan.fechaInicio && (
          <>
            <span className="text-sse-muted">Período</span>
            <span className="font-medium text-sse-ink text-right">
              {fmtShortDate(plan.fechaInicio)}{plan.fechaFin ? ` – ${fmtShortDate(plan.fechaFin)}` : ""}
            </span>
          </>
        )}
      </div>

      {/* Barra de cumplimiento */}
      {plan.estado === "activo" && (
        <div className="mt-1">
          <div className="flex justify-between text-[10px] text-sse-muted mb-0.5">
            <span>Cumplimiento</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 bg-sse-border rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all",
                pct >= 80 ? "bg-sse-sem-green-fg" : pct >= 60 ? "bg-sse-sem-yellow-fg" : "bg-sse-sem-red-fg"
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function WorkspacePlanesManto({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<MantoEstadoPlan | "todos">("todos");
  const { data: planes, isLoading } = usePlanes({ wsId });

  const filtered = (planes ?? []).filter((p) =>
    filtro === "todos" ? p.deletedAt == null : p.estado === filtro,
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Planes de Mantenimiento Preventivo</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Programación y seguimiento de planes preventivos por activo</p>
        </div>
        {filtered.length > 0 && (
          <p className="text-[11px] text-sse-muted shrink-0">{filtered.length} planes</p>
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
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
          title="Sin planes preventivos"
          description="No se encontraron planes con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => <PlanCard key={p.id} plan={p} />)}
        </div>
      )}
    </div>
  );
}
