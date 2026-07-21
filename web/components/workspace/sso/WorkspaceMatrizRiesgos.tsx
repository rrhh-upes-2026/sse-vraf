"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { SSORiesgo, SSOClasificacion } from "@/types/entities";
import { useRiesgosSSO, usePeligrosSSO } from "@/hooks/useSSO";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const CLASIF_VARIANT: Record<SSOClasificacion, BadgeVariant> = {
  bajo:    "success",
  medio:   "info",
  alto:    "warning",
  critico: "danger",
};

const CLASIF_LABEL: Record<SSOClasificacion, string> = {
  bajo:    "Bajo",
  medio:   "Medio",
  alto:    "Alto",
  critico: "Crítico",
};

const FILTROS: Array<{ value: SSOClasificacion | "todos"; label: string }> = [
  { value: "todos",   label: "Todos" },
  { value: "critico", label: "Críticos" },
  { value: "alto",    label: "Altos" },
  { value: "medio",   label: "Medios" },
  { value: "bajo",    label: "Bajos" },
];

function RiesgoCard({ item }: { item: SSORiesgo }) {
  const nivelColor = {
    bajo:    "bg-sse-sem-green-bg text-sse-sem-green-fg",
    medio:   "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    alto:    "bg-sse-sem-yellow-bg text-sse-sem-yellow-fg",
    critico: "bg-sse-sem-red-bg text-sse-sem-red-fg",
  }[item.clasificacion];

  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-4 flex flex-col gap-2 hover:border-sse-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono text-sse-primary">{item.codigo}</p>
          <p className="text-[13px] font-semibold text-sse-ink leading-snug line-clamp-2 mt-0.5">{item.peligroDesc}</p>
          <p className="text-[11px] text-sse-muted capitalize">{item.area} · {item.actividad}</p>
        </div>
        <Badge variant={CLASIF_VARIANT[item.clasificacion]} className="shrink-0 text-[10px]">
          {CLASIF_LABEL[item.clasificacion]}
        </Badge>
      </div>

      {/* Matriz IPER visual */}
      <div className={cn("flex items-center justify-between rounded px-3 py-2 text-[11px] font-semibold", nivelColor)}>
        <span>P={item.probabilidad} × I={item.impacto}</span>
        <span>Nivel: {item.nivelRiesgo}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <span className="text-sse-muted">Proceso</span>
        <span className="font-medium text-sse-ink text-right truncate">{item.proceso}</span>
        {item.controlesExistentes && (
          <>
            <span className="text-sse-muted">Controles</span>
            <span className="font-medium text-sse-ink text-right truncate">{item.controlesExistentes}</span>
          </>
        )}
      </div>
    </div>
  );
}

export function WorkspaceMatrizRiesgos({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<string>("todos");
  const { data: riesgos, isLoading: loadingRiesgos } = useRiesgosSSO({ wsId });
  const { data: peligros, isLoading: loadingPeligros } = usePeligrosSSO({ wsId });

  const isLoading = loadingRiesgos || loadingPeligros;

  const filtered = (riesgos ?? []).filter((r) => {
    if (filtro === "todos") return r.deletedAt == null;
    return r.clasificacion === filtro;
  });

  const totalesPeligros = (peligros ?? []).filter((p) => p.deletedAt == null).length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Matriz IPER de Riesgos</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Identificación de Peligros y Evaluación de Riesgos — P × I = Nivel</p>
        </div>
        {!isLoading && (
          <div className="text-right">
            <p className="text-[11px] text-sse-muted">{filtered.length} riesgos</p>
            {totalesPeligros > 0 && (
              <p className="text-[11px] text-sse-muted">{totalesPeligros} peligros identificados</p>
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
          {[0,1,2].map((i) => <SkeletonCard key={i} className="h-[180px]" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"
          title="Sin riesgos evaluados"
          description="No se encontraron riesgos con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((r) => <RiesgoCard key={r.id} item={r} />)}
        </div>
      )}
    </div>
  );
}
