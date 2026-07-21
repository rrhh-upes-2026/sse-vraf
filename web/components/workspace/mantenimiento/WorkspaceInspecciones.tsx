"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { MantoInspeccion, MantoEstadoInspeccion, MantoCondicionActivo } from "@/types/entities";
import { useInspecciones } from "@/hooks/useMantenimiento";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";

const ESTADO_VARIANT: Record<MantoEstadoInspeccion, BadgeVariant> = {
  programada: "info",
  en_proceso: "warning",
  completada: "success",
  cancelada:  "gray",
};

const ESTADO_LABEL: Record<MantoEstadoInspeccion, string> = {
  programada: "Programada",
  en_proceso: "En Proceso",
  completada: "Completada",
  cancelada:  "Cancelada",
};

const CONDICION_VARIANT: Record<MantoCondicionActivo, BadgeVariant> = {
  buena:      "success",
  regular:    "warning",
  deficiente: "danger",
  critica:    "danger",
};

const FILTROS: Array<{ value: MantoEstadoInspeccion | "todos"; label: string }> = [
  { value: "todos",      label: "Todas" },
  { value: "programada", label: "Programadas" },
  { value: "en_proceso", label: "En Proceso" },
  { value: "completada", label: "Completadas" },
];

function InspeccionCard({ insp }: { insp: MantoInspeccion }) {
  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-4 flex flex-col gap-2 hover:border-sse-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono text-sse-primary">{insp.codigo}</p>
          <p className="text-[13px] font-semibold text-sse-ink leading-snug mt-0.5 capitalize">{insp.tipo}</p>
          {insp.activoRef && (
            <p className="text-[11px] text-sse-muted truncate">{insp.activoRef}</p>
          )}
        </div>
        <Badge variant={ESTADO_VARIANT[insp.estado]} className="shrink-0 text-[10px]">
          {ESTADO_LABEL[insp.estado]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <span className="text-sse-muted">Programada</span>
        <span className={cn(
          "font-medium text-right",
          insp.estado === "programada" && new Date(insp.fechaProgramada) < new Date()
            ? "text-sse-sem-red-fg"
            : "text-sse-ink"
        )}>{fmtShortDate(insp.fechaProgramada)}</span>
        {insp.fechaEjecucion && (
          <>
            <span className="text-sse-muted">Ejecutada</span>
            <span className="font-medium text-sse-ink text-right">{fmtShortDate(insp.fechaEjecucion)}</span>
          </>
        )}
        {insp.tecnicoRef && (
          <>
            <span className="text-sse-muted">Técnico</span>
            <span className="font-medium text-sse-ink text-right truncate">{insp.tecnicoRef}</span>
          </>
        )}
        {insp.condicion && (
          <>
            <span className="text-sse-muted">Condición</span>
            <span className="text-right">
              <Badge variant={CONDICION_VARIANT[insp.condicion as MantoCondicionActivo]} className="text-[10px]">
                {insp.condicion}
              </Badge>
            </span>
          </>
        )}
      </div>

      {insp.hallazgos && (
        <p className="text-[11px] text-sse-muted border-t border-sse-border pt-2 line-clamp-2">
          <span className="font-medium text-sse-ink">Hallazgos: </span>{insp.hallazgos}
        </p>
      )}

      {insp.requiereOrden && (
        <div className="flex items-center gap-1.5 text-[11px] text-sse-sem-yellow-fg">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
          <span>Requiere orden de trabajo</span>
          {insp.ordenGeneradaId && (
            <span className="font-mono text-sse-ink">({insp.ordenGeneradaId})</span>
          )}
        </div>
      )}
    </div>
  );
}

export function WorkspaceInspecciones({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<MantoEstadoInspeccion | "todos">("todos");
  const { data: inspecciones, isLoading } = useInspecciones({ wsId });

  const filtered = (inspecciones ?? []).filter((i) =>
    filtro === "todos" ? i.deletedAt == null : i.estado === filtro,
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Inspecciones Técnicas</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Inspecciones de condición y estado de activos</p>
        </div>
        {filtered.length > 0 && (
          <p className="text-[11px] text-sse-muted shrink-0">{filtered.length} inspecciones</p>
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
          icon="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
          title="Sin inspecciones"
          description="No se encontraron inspecciones con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((i) => <InspeccionCard key={i.id} insp={i} />)}
        </div>
      )}
    </div>
  );
}
