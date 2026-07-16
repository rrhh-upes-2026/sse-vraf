"use client";

import { useQuery } from "@tanstack/react-query";
import type { WorkspaceId } from "@/config/nav";
import type { Indicador, SemaforoColor } from "@/types/entities";
import { IndicadoresService } from "@/services";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtDate } from "@/lib/utils";

interface WorkspaceIndicatorsProps {
  wsId: WorkspaceId;
}

// ── helpers ──────────────────────────────────────────────────────────────────

const SEMAPHORE_DOT: Record<SemaforoColor, string> = {
  verde:    "bg-sse-sem-green-fg",
  amarillo: "bg-[#E5A100]",
  rojo:     "bg-sse-sem-red-fg",
};

const SEMAPHORE_BAR: Record<SemaforoColor, string> = {
  verde:    "bg-sse-sem-green-fg",
  amarillo: "bg-[#E5A100]",
  rojo:     "bg-sse-sem-red-fg",
};

const SEMAPHORE_TEXT: Record<SemaforoColor, string> = {
  verde:    "text-sse-sem-green-fg",
  amarillo: "text-[#E5A100]",
  rojo:     "text-sse-sem-red-fg",
};

const SEMAPHORE_BADGE_VARIANT = {
  verde:    "success",
  amarillo: "warning",
  rojo:     "danger",
} as const;

const FRECUENCIA_LABEL: Record<Indicador["frecuencia"], string> = {
  mensual:     "Mensual",
  trimestral:  "Trimestral",
  semestral:   "Semestral",
  anual:       "Anual",
};

// ── trend icon ────────────────────────────────────────────────────────────────

function TrendIcon({ tendencia }: { tendencia: Indicador["tendencia"] }) {
  if (tendencia === "sube") {
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-sse-sem-green-fg">
        <path fillRule="evenodd"
          d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
          clipRule="evenodd" />
      </svg>
    );
  }
  if (tendencia === "baja") {
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-sse-sem-red-fg">
        <path fillRule="evenodd"
          d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
          clipRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-sse-muted">
      <path fillRule="evenodd" d="M18 10a1 1 0 01-1 1H3a1 1 0 110-2h14a1 1 0 011 1z" clipRule="evenodd" />
    </svg>
  );
}

// ── card ──────────────────────────────────────────────────────────────────────

function IndicadorCard({ indicador }: { indicador: Indicador }) {
  const pct =
    indicador.meta > 0 ? Math.round((indicador.valorActual / indicador.meta) * 100) : 0;

  return (
    <div className="bg-sse-surface rounded-md border border-sse-border p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-sse-ink leading-snug">{indicador.nombre}</p>
          <p className="text-[11px] text-sse-muted mt-0.5 capitalize">{indicador.categoria}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <TrendIcon tendencia={indicador.tendencia} />
          <Badge variant={SEMAPHORE_BADGE_VARIANT[indicador.semaforo]}>
            <span className={cn("w-1.5 h-1.5 rounded-full", SEMAPHORE_DOT[indicador.semaforo])} />
            {indicador.semaforo}
          </Badge>
        </div>
      </div>

      {/* Value */}
      <div className="flex items-end gap-2">
        <span className={cn("text-[26px] font-bold leading-none", SEMAPHORE_TEXT[indicador.semaforo])}>
          {indicador.valorActual}
        </span>
        <span className="text-[12px] text-sse-muted mb-0.5">{indicador.unidadMedida}</span>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-2 w-full rounded-full bg-sse-border overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", SEMAPHORE_BAR[indicador.semaforo])}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-sse-muted">
            meta: <span className="font-medium text-sse-ink">{indicador.meta} {indicador.unidadMedida}</span>
          </span>
          <span className="text-[11px] font-semibold text-sse-ink">{pct}%</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-sse-border">
        <Badge variant="gray">{FRECUENCIA_LABEL[indicador.frecuencia]}</Badge>
        <span className="text-[10px] text-sse-muted">
          Actualizado{" "}
          {fmtDate(indicador.ultimaActualizacion)}
        </span>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function WorkspaceIndicators({ wsId }: WorkspaceIndicatorsProps) {
  const { data: indicadores, isLoading } = useQuery<Indicador[]>({
    queryKey: ["indicadores", "all"],
    queryFn: () => IndicadoresService.list(),
  });

  const semStats = (indicadores ?? []).reduce(
    (acc, ind) => {
      acc[ind.semaforo] = (acc[ind.semaforo] ?? 0) + 1;
      return acc;
    },
    {} as Record<SemaforoColor, number>,
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-semibold text-sse-ink">Indicadores de gestión</h1>
        {indicadores && indicadores.length > 0 && (
          <div className="flex items-center gap-3">
            {(["verde", "amarillo", "rojo"] as SemaforoColor[]).map((c) =>
              semStats[c] ? (
                <div key={c} className="flex items-center gap-1">
                  <span className={cn("w-2 h-2 rounded-full", SEMAPHORE_DOT[c])} />
                  <span className="text-[12px] text-sse-muted">{semStats[c]}</span>
                </div>
              ) : null,
            )}
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[190px] rounded-md" />)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && (!indicadores || indicadores.length === 0) && (
        <EmptyState
          icon="M4 20a8 8 0 1 1 16 0M12 14l4-4"
          title="Sin indicadores"
          description="No hay indicadores de gestión configurados."
        />
      )}

      {/* Grid */}
      {!isLoading && indicadores && indicadores.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {indicadores.map((ind) => (
            <IndicadorCard key={ind.id} indicador={ind} />
          ))}
        </div>
      )}
    </div>
  );
}
