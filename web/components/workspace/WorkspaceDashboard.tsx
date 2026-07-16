"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { WorkspaceId } from "@/config/nav";
import type { ProcesoInstitucional, Indicador, SemaforoColor } from "@/types/entities";
import { useProcesos } from "@/hooks/useProcesos";
import { usePermissions } from "@/hooks/usePermissions";
import { IndicadoresService } from "@/services";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";

// ── helpers ──────────────────────────────────────────────────────────────────

const SEMAPHORE_DOT: Record<SemaforoColor, string> = {
  verde:    "bg-sse-sem-green-fg",
  amarillo: "bg-[#E5A100]",
  rojo:     "bg-sse-sem-red-fg",
};

const SEMAPHORE_BADGE_VARIANT = {
  verde:    "success",
  amarillo: "warning",
  rojo:     "danger",
} as const;

const SEMAPHORE_PROGRESS_COLOR = {
  verde:    "success",
  amarillo: "warning",
  rojo:     "danger",
} as const;

const SEMAPHORE_LABEL: Record<SemaforoColor, string> = {
  verde:    "verde",
  amarillo: "amarillo",
  rojo:     "rojo",
};

const TREND_UP =
  "M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z";
const TREND_DOWN =
  "M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z";
const TREND_FLAT =
  "M18 10a1 1 0 01-1 1H3a1 1 0 110-2h14a1 1 0 011 1z";

function daysDiff(fecha: string) {
  return Math.ceil((new Date(fecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// ── sub-components ────────────────────────────────────────────────────────────

function SemaferoSummary({ procesos }: { procesos: ProcesoInstitucional[] }) {
  const counts: Record<SemaforoColor, number> = { verde: 0, amarillo: 0, rojo: 0 };
  procesos.forEach((p) => { counts[p.semaforo] += 1; });

  return (
    <div className="flex items-center gap-5">
      {(["verde", "amarillo", "rojo"] as SemaforoColor[]).map((color) => (
        <div key={color} className="flex items-center gap-1.5">
          <span className={cn("w-2.5 h-2.5 rounded-full", SEMAPHORE_DOT[color])} />
          <span className="text-[13px] font-semibold text-sse-ink">{counts[color]}</span>
          <span className="text-[12px] text-sse-muted capitalize">{SEMAPHORE_LABEL[color]}</span>
        </div>
      ))}
    </div>
  );
}

function ProcessCard({ proceso, wsId }: { proceso: ProcesoInstitucional; wsId: WorkspaceId }) {
  const days = daysDiff(proceso.fechaLimite);
  return (
    <div className="bg-sse-surface rounded-md border border-sse-border p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium text-sse-ink leading-snug line-clamp-2 flex-1">
          {proceso.nombre}
        </p>
        <Badge variant={SEMAPHORE_BADGE_VARIANT[proceso.semaforo]} className="shrink-0">
          <span className={cn("w-1.5 h-1.5 rounded-full", SEMAPHORE_DOT[proceso.semaforo])} />
          {proceso.semaforo}
        </Badge>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-sse-muted">Avance</span>
          <span className="text-[11px] font-semibold text-sse-ink">{proceso.avancePct}%</span>
        </div>
        <Progress value={proceso.avancePct} color={SEMAPHORE_PROGRESS_COLOR[proceso.semaforo]} />
      </div>

      <div className="flex items-center justify-between">
        {days < 0 ? (
          <span className="text-[11px] font-medium text-sse-sem-red-fg">Vencido {Math.abs(days)}d</span>
        ) : days <= 7 ? (
          <span className="text-[11px] font-medium text-sse-sem-amber-fg">{days}d restantes</span>
        ) : (
          <span className="text-[11px] text-sse-muted">
            {fmtShortDate(proceso.fechaLimite)}
          </span>
        )}
        <Link href={`/ws/${wsId}/procesos`}>
          <span className="text-[11px] text-sse-primary hover:underline">Ver</span>
        </Link>
      </div>
    </div>
  );
}

function KpiTile({ indicador }: { indicador: Indicador }) {
  const pct = indicador.meta > 0 ? Math.round((indicador.valorActual / indicador.meta) * 100) : 0;
  const trendPath = indicador.tendencia === "sube" ? TREND_UP : indicador.tendencia === "baja" ? TREND_DOWN : TREND_FLAT;
  const trendColor =
    indicador.tendencia === "sube"
      ? "text-sse-sem-green-fg"
      : indicador.tendencia === "baja"
      ? "text-sse-sem-red-fg"
      : "text-sse-muted";

  return (
    <div className="bg-sse-surface rounded-md border border-sse-border p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-[12px] font-medium text-sse-muted leading-snug line-clamp-2">{indicador.nombre}</p>
        <svg viewBox="0 0 20 20" fill="currentColor" className={cn("w-4 h-4 shrink-0 mt-0.5", trendColor)}>
          <path fillRule="evenodd" d={trendPath} clipRule="evenodd" />
        </svg>
      </div>
      <div className="flex items-end gap-1.5 mb-2">
        <span className="text-[22px] font-bold text-sse-ink leading-none">{indicador.valorActual}</span>
        <span className="text-[12px] text-sse-muted mb-0.5">{indicador.unidadMedida}</span>
      </div>
      <div className="space-y-1">
        <div className="h-1.5 w-full rounded-full bg-sse-border overflow-hidden">
          <div
            className={cn("h-full rounded-full", SEMAPHORE_DOT[indicador.semaforo])}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-sse-muted">
          meta: <span className="font-medium text-sse-ink">{indicador.meta} {indicador.unidadMedida}</span>
          {" · "}{pct}%
        </p>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

interface WorkspaceDashboardProps {
  wsId: WorkspaceId;
  unitColor: string;
  unitName: string;
}

export function WorkspaceDashboard({ wsId, unitColor, unitName }: WorkspaceDashboardProps) {
  const { hasPermission, isLoaded } = usePermissions();

  const { data: procesos, isLoading: loadingProcesos } = useProcesos({ unidadId: wsId });

  const { data: indicadores, isLoading: loadingIndicadores } = useQuery<Indicador[]>({
    queryKey: ["indicadores", wsId],
    queryFn: () => IndicadoresService.list(),
  });

  const visibleProcesos = (procesos ?? []).slice(0, 4);
  const visibleIndicadores = (indicadores ?? []).slice(0, 3);

  const quickActions = [
    {
      id: "nuevo-proceso",
      label: "Nuevo proceso",
      icon: "M12 4v16m8-8H4",
      href: `/studio/process-builder`,
      permission: "process.create" as const,
    },
    {
      id: "cargar-evidencia",
      label: "Cargar evidencia",
      icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
      href: `/ws/${wsId}/evidencias`,
      permission: "evidence.upload" as const,
    },
    {
      id: "generar-reporte",
      label: "Generar reporte",
      icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      href: `/ws/${wsId}/reportes`,
      permission: "report.export" as const,
    },
    {
      id: "ver-indicadores",
      label: "Ver indicadores",
      icon: "M4 20a8 8 0 1 1 16 0M12 14l4-4",
      href: `/ws/${wsId}/indicadores`,
      permission: "indicator.view" as const,
    },
  ];

  const visibleActions = isLoaded
    ? quickActions.filter((a) => hasPermission(a.permission))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">{unitName}</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Resumen del workspace</p>
        </div>
        {procesos && procesos.length > 0 && (
          <SemaferoSummary procesos={procesos} />
        )}
        {loadingProcesos && <Skeleton className="h-6 w-48" />}
      </div>

      {/* Process grid */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold text-sse-ink">Procesos activos</h2>
          <Link href={`/ws/${wsId}/procesos`}>
            <span className="text-[12px] text-sse-primary hover:underline">Ver todos</span>
          </Link>
        </div>

        {loadingProcesos && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} className="h-[140px]" />)}
          </div>
        )}

        {!loadingProcesos && visibleProcesos.length === 0 && (
          <EmptyState
            icon="M9 11l3 3 8-8M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9"
            title="Sin procesos"
            description="Esta unidad no tiene procesos activos."
          />
        )}

        {!loadingProcesos && visibleProcesos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visibleProcesos.map((p) => (
              <ProcessCard key={p.id} proceso={p} wsId={wsId} />
            ))}
          </div>
        )}
      </section>

      {/* KPI row */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold text-sse-ink">Indicadores clave</h2>
          <Link href={`/ws/${wsId}/indicadores`}>
            <span className="text-[12px] text-sse-primary hover:underline">Ver todos</span>
          </Link>
        </div>

        {loadingIndicadores && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-[110px] w-full rounded-md" />)}
          </div>
        )}

        {!loadingIndicadores && visibleIndicadores.length === 0 && (
          <p className="text-[13px] text-sse-muted">No hay indicadores configurados.</p>
        )}

        {!loadingIndicadores && visibleIndicadores.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {visibleIndicadores.map((ind) => (
              <KpiTile key={ind.id} indicador={ind} />
            ))}
          </div>
        )}
      </section>

      {/* Quick actions */}
      {isLoaded && visibleActions.length > 0 && (
        <section>
          <h2 className="text-[14px] font-semibold text-sse-ink mb-3">Acciones rápidas</h2>
          <div className="flex flex-wrap gap-2">
            {visibleActions.map((action) => (
              <Link key={action.id} href={action.href}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                    className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                  </svg>
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
