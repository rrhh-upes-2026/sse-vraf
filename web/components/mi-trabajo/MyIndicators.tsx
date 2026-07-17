"use client";

import { useSession } from "@/lib/auth-client";
import type { Indicador, SemaforoColor } from "@/types/entities";
import { useIndicadores } from "@/hooks/useIndicadores";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtShortDate } from "@/lib/utils";

const SEMAPHORE_COLORS: Record<SemaforoColor, string> = {
  verde:    "bg-sse-sem-green-fg",
  amarillo: "bg-[#E5A100]",
  rojo:     "bg-sse-sem-red-fg",
};

const SEMAPHORE_TEXT: Record<SemaforoColor, string> = {
  verde:    "text-sse-sem-green-fg",
  amarillo: "text-[#E5A100]",
  rojo:     "text-sse-sem-red-fg",
};

function TrendIcon({ tendencia }: { tendencia: Indicador["tendencia"] }) {
  if (tendencia === "sube") {
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-sse-sem-green-fg">
        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
      </svg>
    );
  }
  if (tendencia === "baja") {
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-sse-sem-red-fg">
        <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-sse-muted">
      <path fillRule="evenodd" d="M18 10a1 1 0 01-1 1H3a1 1 0 110-2h14a1 1 0 011 1z" clipRule="evenodd" />
    </svg>
  );
}

function pct(valorActual: number, meta: number): number {
  if (meta === 0) return 0;
  return Math.round((valorActual / meta) * 100);
}

function IndicadorCard({ indicador }: { indicador: Indicador }) {
  const ratio = pct(indicador.valorActual, indicador.meta);
  const barColor = SEMAPHORE_COLORS[indicador.semaforo];

  return (
    <div className="py-3 border-b border-sse-border last:border-b-0">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-sse-ink truncate">{indicador.nombre}</p>
          <p className="text-[11px] text-sse-muted mt-0.5 capitalize">{indicador.frecuencia}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`w-2 h-2 rounded-full ${SEMAPHORE_COLORS[indicador.semaforo]}`} />
          <TrendIcon tendencia={indicador.tendencia} />
        </div>
      </div>

      <div className="flex items-end gap-3">
        <div>
          <span className={`text-[20px] font-bold leading-none ${SEMAPHORE_TEXT[indicador.semaforo]}`}>
            {indicador.valorActual}
          </span>
          <span className="text-[11px] text-sse-muted ml-1">{indicador.unidadMedida}</span>
        </div>
        <div className="text-[11px] text-sse-muted mb-0.5">
          meta: <span className="font-medium text-sse-ink">{indicador.meta} {indicador.unidadMedida}</span>
        </div>
      </div>

      <div className="mt-2 space-y-1">
        <div className="h-1.5 w-full rounded-full bg-sse-border overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.min(ratio, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-sse-muted">
            {fmtShortDate(indicador.ultimaActualizacion)}
          </span>
          <span className="text-[10px] font-medium text-sse-muted">{ratio}% de meta</span>
        </div>
      </div>
    </div>
  );
}

export function MyIndicators() {
  const { user } = useSession();
  const usuarioId = user?.usuarioId;

  const { data: indicadores, isLoading } = useIndicadores(
    usuarioId ? { responsableId: usuarioId } : undefined,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mis Indicadores</CardTitle>
          {indicadores && indicadores.length > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 bg-sse-pill-gray-bg text-sse-pill-gray-fg rounded-sm">
              {indicadores.length} KPI{indicadores.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading && (
          <div className="space-y-4">
            {[0, 1].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        )}

        {!isLoading && (!indicadores || indicadores.length === 0) && (
          <p className="text-[13px] text-sse-muted py-2">Sin indicadores asignados.</p>
        )}

        {!isLoading && indicadores && indicadores.length > 0 && (
          <div>
            {indicadores.map((ind) => (
              <IndicadorCard key={ind.id} indicador={ind} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
