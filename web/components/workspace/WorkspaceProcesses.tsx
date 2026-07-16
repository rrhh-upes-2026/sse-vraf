"use client";

import Link from "next/link";
import type { WorkspaceId } from "@/config/nav";
import type { ProcesoInstitucional, SemaforoColor, EstadoProceso } from "@/types/entities";
import type { ProcessInstance, WorkflowState } from "@/types/workflow";
import { useProcesos } from "@/hooks/useProcesos";
import { useProcessInstances } from "@/hooks/useWorkflow";
import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";
import { WORKFLOW_STATE_LABEL, WORKFLOW_STATE_VARIANT } from "@/lib/workflowStateConfig";

// ── workflow instances section ────────────────────────────────────────────────

function InstanceRow({ instance, wsId }: { instance: ProcessInstance; wsId: string }) {
  const label   = WORKFLOW_STATE_LABEL[instance.estado]   ?? instance.estado;
  const variant = WORKFLOW_STATE_VARIANT[instance.estado] ?? "gray";
  const completedStages = instance.stages.filter((s) => s.estado === "completada").length;
  const totalStages = instance.stages.length;
  const pct = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  return (
    <Link
      href={`/ws/${wsId}/procesos/${instance.id}`}
      className="flex items-center gap-3 py-3 border-b border-sse-border last:border-b-0 hover:bg-sse-hover px-1 rounded transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13px] font-medium text-sse-ink truncate">{instance.nombre}</p>
          <Badge variant={variant}>{label}</Badge>
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex-1 max-w-[180px]">
            <Progress value={pct} color={instance.estado === "blocked" ? "danger" : undefined} />
          </div>
          <span className="text-[11px] font-medium text-sse-ink">{pct}%</span>
          <span className="text-[11px] text-sse-muted">
            Etapa {completedStages + 1}/{totalStages}
          </span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[11px] text-sse-muted">{instance.blueprintName}</p>
        <p className="text-[10px] text-sse-muted">
          {fmtShortDate(instance.updatedAt)}
        </p>
      </div>
    </Link>
  );
}

function ActiveInstances({ wsId }: { wsId: string }) {
  const { data: instances, isLoading } = useProcessInstances(wsId);
  const active = instances?.filter((i) =>
    ["in_progress", "waiting", "blocked"].includes(i.estado),
  ) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-14 w-full rounded-md" />
      </div>
    );
  }

  if (active.length === 0) return null;

  return (
    <div className="mb-5">
      <h2 className="text-[12px] font-semibold text-sse-muted uppercase tracking-wide mb-2">
        Instancias activas
      </h2>
      <div className="bg-sse-surface rounded-md border border-sse-border px-4">
        {active.map((inst) => (
          <InstanceRow key={inst.id} instance={inst} wsId={wsId} />
        ))}
      </div>
    </div>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────

const SEMAPHORE_DOT: Record<SemaforoColor, string> = {
  verde:    "bg-sse-sem-green-fg",
  amarillo: "bg-[#E5A100]",
  rojo:     "bg-sse-sem-red-fg",
};

const PRIORIDAD_BADGE = {
  baja:    "default",
  media:   "info",
  alta:    "warning",
  critica: "danger",
} as const;

const ESTADO_LABEL: Record<EstadoProceso, string> = {
  borrador:   "Borrador",
  activo:     "Activo",
  en_riesgo:  "En riesgo",
  completado: "Completado",
  archivado:  "Archivado",
};

function daysDiff(fecha: string) {
  return Math.ceil((new Date(fecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// ── row ───────────────────────────────────────────────────────────────────────

function ProcesoRow({ proceso }: { proceso: ProcesoInstitucional }) {
  const days = daysDiff(proceso.fechaLimite);

  return (
    <div className="flex items-center gap-3 py-3 border-b border-sse-border last:border-b-0">
      {/* Semaforo dot */}
      <span className={cn("w-2.5 h-2.5 rounded-full shrink-0 mt-0.5", SEMAPHORE_DOT[proceso.semaforo])} />

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13px] font-medium text-sse-ink truncate">{proceso.nombre}</p>
          <Badge variant={PRIORIDAD_BADGE[proceso.prioridad]}>
            {proceso.prioridad.charAt(0).toUpperCase() + proceso.prioridad.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex-1 max-w-[180px]">
            <Progress
              value={proceso.avancePct}
              color={
                proceso.semaforo === "verde"
                  ? "success"
                  : proceso.semaforo === "amarillo"
                  ? "warning"
                  : "danger"
              }
            />
          </div>
          <span className="text-[11px] font-medium text-sse-ink">{proceso.avancePct}%</span>
        </div>
      </div>

      {/* Due date */}
      <div className="text-right shrink-0">
        {days < 0 ? (
          <span className="text-[11px] font-medium text-sse-sem-red-fg block">Vencido</span>
        ) : days <= 7 ? (
          <span className="text-[11px] font-medium text-sse-sem-amber-fg block">{days}d</span>
        ) : (
          <span className="text-[11px] text-sse-muted block">
            {fmtShortDate(proceso.fechaLimite)}
          </span>
        )}
        <span className="text-[10px] text-sse-muted">{ESTADO_LABEL[proceso.estado]}</span>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

interface WorkspaceProcessesProps {
  wsId: WorkspaceId;
}

type FilterTab = "todos" | "activos" | "en_riesgo" | "completados";

const TABS = [
  { id: "todos" as FilterTab,       label: "Todos" },
  { id: "activos" as FilterTab,     label: "Activos" },
  { id: "en_riesgo" as FilterTab,   label: "En riesgo" },
  { id: "completados" as FilterTab, label: "Completados" },
];

function filterProcesos(procesos: ProcesoInstitucional[], tab: FilterTab): ProcesoInstitucional[] {
  switch (tab) {
    case "todos":       return procesos;
    case "activos":     return procesos.filter((p) => p.estado === "activo");
    case "en_riesgo":   return procesos.filter((p) => p.estado === "en_riesgo" || p.semaforo === "rojo");
    case "completados": return procesos.filter((p) => p.estado === "completado");
    default:            return procesos;
  }
}

export function WorkspaceProcesses({ wsId }: WorkspaceProcessesProps) {
  const { hasPermission } = usePermissions();
  const { data: procesos, isLoading, isError } = useProcesos({ unidadId: wsId });

  const tabsWithCounts = TABS.map((t) => ({
    ...t,
    badge:
      t.id !== "todos" && procesos
        ? filterProcesos(procesos, t.id).length
        : undefined,
  }));

  return (
    <div className="space-y-4">
      {/* Active workflow instances */}
      <ActiveInstances wsId={wsId} />

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-semibold text-sse-ink">Procesos</h1>
        {hasPermission("process.create") && (
          <Link href="/studio/process-builder">
            <Button size="sm" variant="primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo proceso
            </Button>
          </Link>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}
        </div>
      )}

      {/* Error */}
      {isError && (
        <p className="text-[13px] text-sse-muted py-4">No se pudieron cargar los procesos.</p>
      )}

      {/* Content */}
      {!isLoading && !isError && procesos && (
        <Tabs tabs={tabsWithCounts} defaultTab="todos">
          {(activeTab) => {
            const filtered = filterProcesos(procesos, activeTab as FilterTab);
            if (filtered.length === 0) {
              return (
                <EmptyState
                  icon="M9 11l3 3 8-8M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9"
                  title="Sin procesos en esta categoría"
                  description="Cambia el filtro para ver otros procesos."
                />
              );
            }
            return (
              <div className="bg-sse-surface rounded-md border border-sse-border px-4">
                {filtered.map((p) => <ProcesoRow key={p.id} proceso={p} />)}
              </div>
            );
          }}
        </Tabs>
      )}
    </div>
  );
}
