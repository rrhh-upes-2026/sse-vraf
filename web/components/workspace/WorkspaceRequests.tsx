"use client";

import { useQuery } from "@tanstack/react-query";
import type { WorkspaceId } from "@/config/nav";
import type { Solicitud } from "@/types/entities";
import { SolicitudesService } from "@/services";
import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";

interface WorkspaceRequestsProps {
  wsId: WorkspaceId;
}

// ── helpers ──────────────────────────────────────────────────────────────────

const ESTADO_BADGE = {
  abierta:    "warning",
  en_atencion: "info",
  cerrada:    "success",
} as const;

const ESTADO_LABEL: Record<Solicitud["estado"], string> = {
  abierta:     "Abierta",
  en_atencion: "En atención",
  cerrada:     "Cerrada",
};

function slaDays(fechaCreacion: string): number {
  return Math.ceil((Date.now() - new Date(fechaCreacion).getTime()) / (1000 * 60 * 60 * 24));
}

type FilterTab = "abierta" | "en_atencion" | "cerrada";

const TABS = [
  { id: "abierta" as FilterTab,     label: "Abiertas" },
  { id: "en_atencion" as FilterTab, label: "En atención" },
  { id: "cerrada" as FilterTab,     label: "Cerradas" },
];

// ── row ───────────────────────────────────────────────────────────────────────

function SolicitudRow({ solicitud }: { solicitud: Solicitud }) {
  const days = slaDays(solicitud.fechaCreacion);
  const isOverdue = days > 5 && solicitud.estado !== "cerrada";

  return (
    <div className="flex items-start gap-3 py-3 border-b border-sse-border last:border-b-0">
      {/* Estado badge */}
      <Badge variant={ESTADO_BADGE[solicitud.estado]} className="mt-0.5 shrink-0">
        {ESTADO_LABEL[solicitud.estado]}
      </Badge>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-sse-ink truncate">{solicitud.asunto}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] font-mono text-sse-muted">{solicitud.id}</span>
          <span className="text-sse-muted text-[11px]">·</span>
          <span className="text-[11px] text-sse-muted">
            Resp: <span className="font-medium text-sse-ink">{solicitud.responsableId}</span>
          </span>
        </div>
      </div>

      {/* SLA chip */}
      <div className="shrink-0 text-right">
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium",
            isOverdue
              ? "bg-sse-sem-red-bg text-sse-sem-red-fg"
              : "bg-sse-pill-gray-bg text-sse-pill-gray-fg",
          )}
        >
          {days}d
        </span>
        <p className="text-[10px] text-sse-muted mt-0.5">
          {fmtShortDate(solicitud.fechaCreacion)}
        </p>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function WorkspaceRequests({ wsId }: WorkspaceRequestsProps) {
  const { hasPermission } = usePermissions();

  const { data: solicitudes, isLoading, isError } = useQuery<Solicitud[]>({
    queryKey: ["solicitudes", wsId],
    queryFn: () => SolicitudesService.list({ unidadId: wsId }),
  });

  const tabsWithCounts = TABS.map((t) => ({
    ...t,
    badge: solicitudes
      ? solicitudes.filter((s) => s.estado === t.id).length
      : undefined,
  }));

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-semibold text-sse-ink">Solicitudes</h1>
        {hasPermission("requests.create") && (
          <Button size="sm" variant="primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva solicitud
          </Button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}
        </div>
      )}

      {/* Error */}
      {isError && (
        <p className="text-[13px] text-sse-muted py-4">No se pudieron cargar las solicitudes.</p>
      )}

      {/* Tabs */}
      {!isLoading && !isError && solicitudes && (
        <Tabs tabs={tabsWithCounts} defaultTab="abierta">
          {(activeTab) => {
            const filtered = solicitudes.filter((s) => s.estado === activeTab);
            if (filtered.length === 0) {
              return (
                <EmptyState
                  icon="M4 13h4l2 3h4l2-3h4M5 5h14v13H5z"
                  title="Sin solicitudes"
                  description="No hay solicitudes en esta categoría."
                />
              );
            }
            return (
              <div className="bg-sse-surface rounded-md border border-sse-border px-4">
                {filtered.map((s) => <SolicitudRow key={s.id} solicitud={s} />)}
              </div>
            );
          }}
        </Tabs>
      )}

      {/* Note */}
      {solicitudes && solicitudes.length > 0 && (
        <p className="text-[12px] text-sse-muted">
          SLA objetivo: respuesta en 5 días hábiles. Días marcados en rojo superan ese límite.
        </p>
      )}
    </div>
  );
}
