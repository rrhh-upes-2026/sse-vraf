"use client";

import { useState } from "react";
import { useSolicitudesContratacion, useSolicitudesContratacionActions } from "@/hooks/useSolicitudesContratacion";
import { useActividades, useActividadesActions } from "@/hooks/useActividades";
import { usePermissions } from "@/hooks/usePermissions";
import type { SolicitudContratacion, EtapaContratacion } from "@/types/hr";
import type { Actividad } from "@/types/entities";
import { ETAPAS_CONTRATACION } from "@/types/hr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtDate } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

// Sorted list of all stages by order
const ETAPAS_SORTED = Object.entries(ETAPAS_CONTRATACION)
  .map(([key, val]) => ({ key: key as EtapaContratacion, ...val }))
  .sort((a, b) => a.orden - b.orden);

const CONTRATO_LABEL: Record<string, string> = {
  indefinido:  "Indefinido",
  plazo_fijo:  "Plazo fijo",
  eventual:    "Eventual",
  honorarios:  "Honorarios",
};

const ACTIVIDAD_ESTADO_BADGE: Record<Actividad["estado"], BadgeVariant> = {
  pendiente:  "default",
  en_progreso:"info",
  completada: "success",
  bloqueada:  "danger",
};

const ACTIVIDAD_ESTADO_LABEL: Record<Actividad["estado"], string> = {
  pendiente:  "Pendiente",
  en_progreso:"En progreso",
  completada: "Completada",
  bloqueada:  "Bloqueada",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNextEtapa(current: EtapaContratacion): EtapaContratacion | null {
  const currentOrden = ETAPAS_CONTRATACION[current].orden;
  const next = ETAPAS_SORTED.find((e) => e.orden === currentOrden + 1);
  return next ? next.key : null;
}

// ─── Stage stepper ────────────────────────────────────────────────────────────

function StageStepper({ etapaActual }: { etapaActual: EtapaContratacion }) {
  const currentOrden = ETAPAS_CONTRATACION[etapaActual].orden;

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-start gap-0 min-w-max">
        {ETAPAS_SORTED.map((etapa, idx) => {
          const isPast    = etapa.orden < currentOrden;
          const isCurrent = etapa.orden === currentOrden;
          const isFuture  = etapa.orden > currentOrden;
          const isLast    = idx === ETAPAS_SORTED.length - 1;

          return (
            <div key={etapa.key} className="flex items-start">
              <div className="flex flex-col items-center w-20">
                {/* Circle */}
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                    isPast    && "border-sse-sem-green-fg bg-sse-sem-green-bg",
                    isCurrent && "border-sse-primary bg-sse-primary",
                    isFuture  && "border-sse-border bg-sse-surface",
                  )}
                >
                  {isPast ? (
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-sse-sem-green-fg">
                      <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span
                      className={cn(
                        "text-[11px] font-bold",
                        isCurrent ? "text-white" : "text-sse-muted",
                      )}
                    >
                      {etapa.orden}
                    </span>
                  )}
                </div>

                {/* Label */}
                <p
                  className={cn(
                    "mt-1.5 text-center text-[10px] leading-tight px-0.5",
                    isPast    && "text-sse-sem-green-fg font-medium",
                    isCurrent && "text-sse-primary font-semibold",
                    isFuture  && "text-sse-muted",
                  )}
                >
                  {etapa.label}
                </p>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    "mt-4 h-0.5 w-6 shrink-0",
                    isPast ? "bg-sse-sem-green-fg" : "bg-sse-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Activity row ─────────────────────────────────────────────────────────────

function ActivityRow({ actividad }: { actividad: Actividad }) {
  const { hasPermission }  = usePermissions();
  const { update }         = useActividadesActions();
  const canComplete        =
    hasPermission("activity.complete") &&
    (actividad.estado === "pendiente" || actividad.estado === "en_progreso");

  function handleComplete() {
    update.mutate({ id: actividad.id, patch: { estado: "completada" } });
  }

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-sse-border last:border-b-0">
      {/* Checkbox-style indicator */}
      <button
        type="button"
        onClick={canComplete ? handleComplete : undefined}
        disabled={!canComplete || update.isPending}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
          actividad.estado === "completada"
            ? "border-sse-sem-green-fg bg-sse-sem-green-bg"
            : "border-sse-border bg-sse-surface hover:border-sse-primary",
          !canComplete && "cursor-default",
        )}
        title={canComplete ? "Marcar como completada" : undefined}
        aria-label={canComplete ? `Completar: ${actividad.nombre}` : actividad.nombre}
      >
        {actividad.estado === "completada" && (
          <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3 text-sse-sem-green-fg">
            <path fillRule="evenodd" d="M10.207 3.293a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L4.5 7.586l4.293-4.293a1 1 0 0 1 1.414 0Z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-[13px] leading-snug",
            actividad.estado === "completada"
              ? "text-sse-muted line-through"
              : "text-sse-ink font-medium",
          )}
        >
          {actividad.nombre}
        </p>
        {actividad.descripcion && (
          <p className="text-[11px] text-sse-muted mt-0.5 truncate">{actividad.descripcion}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Badge variant={ACTIVIDAD_ESTADO_BADGE[actividad.estado]}>
          {ACTIVIDAD_ESTADO_LABEL[actividad.estado]}
        </Badge>
        {canComplete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleComplete}
            disabled={update.isPending}
            className="text-sse-sem-green-fg hover:text-sse-sem-green-fg h-7 px-2"
            title="Completar actividad"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
            </svg>
            <span className="sr-only">Completar</span>
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Right panel ─────────────────────────────────────────────────────────────

function SolicitudDetail({ solicitud }: { solicitud: SolicitudContratacion }) {
  const { hasPermission } = usePermissions();
  const { update }        = useSolicitudesContratacionActions();
  const canManage         = hasPermission("hr.hiring.manage");
  const nextEtapa         = getNextEtapa(solicitud.etapaActual);

  const { data: actividades = [], isLoading: actLoading } = useActividades({
    procesoId: solicitud.procesoId,
    etapaId:   solicitud.etapaActual,
  });

  const hasPending = actividades.some(
    (a) => a.estado === "pendiente" || a.estado === "bloqueada",
  );

  function handleAdvance() {
    if (!nextEtapa) return;
    update.mutate({ id: solicitud.id, patch: { etapaActual: nextEtapa } });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[15px] font-semibold text-sse-ink">{solicitud.cargo}</h3>
              <p className="text-[12px] text-sse-muted mt-0.5">
                {CONTRATO_LABEL[solicitud.tipoContrato] ?? solicitud.tipoContrato}
                {solicitud.fechaObjetivo && (
                  <> · Objetivo: {fmtDate(solicitud.fechaObjetivo)}</>
                )}
                {solicitud.candidatos !== undefined && (
                  <> · {solicitud.candidatos} candidato{solicitud.candidatos !== 1 ? "s" : ""}</>
                )}
              </p>
            </div>
            <span className="text-[10px] font-mono text-sse-muted">{solicitud.id}</span>
          </div>

          {solicitud.observaciones && (
            <p className="mt-2 text-[12px] text-sse-muted italic border-t border-sse-border pt-2">
              {solicitud.observaciones}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stage stepper */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso del proceso</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <StageStepper etapaActual={solicitud.etapaActual} />
        </CardContent>
      </Card>

      {/* Current stage activities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Actividades — {ETAPAS_CONTRATACION[solicitud.etapaActual].label}
            </CardTitle>
            {!actLoading && actividades.length > 0 && (
              <span className="text-[11px] text-sse-muted">
                {actividades.filter((a) => a.estado === "completada").length}/{actividades.length} completadas
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {actLoading && (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          )}

          {!actLoading && actividades.length === 0 && (
            <p className="text-[12px] text-sse-muted py-2">
              No hay actividades registradas para esta etapa.
            </p>
          )}

          {!actLoading && actividades.length > 0 && (
            <div>
              {actividades.map((act) => (
                <ActivityRow key={act.id} actividad={act} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advance button */}
      {canManage && nextEtapa && (
        <div className="flex items-center justify-between p-4 bg-sse-surface border border-sse-border rounded-md">
          <div>
            <p className="text-[13px] font-medium text-sse-ink">
              Siguiente etapa: <span className="text-sse-primary">{ETAPAS_CONTRATACION[nextEtapa].label}</span>
            </p>
            {hasPending && (
              <p className="text-[11px] text-sse-sem-amber-fg mt-0.5">
                Hay actividades pendientes en la etapa actual.
              </p>
            )}
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleAdvance}
            disabled={hasPending || update.isPending}
            title={hasPending ? "Completa todas las actividades antes de avanzar" : undefined}
          >
            {update.isPending ? (
              "Guardando..."
            ) : (
              <>
                Avanzar a {ETAPAS_CONTRATACION[nextEtapa].label}
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M4.72 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L8.44 8 4.72 4.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </Button>
        </div>
      )}

      {/* Last stage: process complete */}
      {canManage && !nextEtapa && (
        <div className="flex items-center gap-3 p-4 bg-sse-sem-green-bg border border-sse-sem-green-border rounded-md">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-sse-sem-green-fg shrink-0">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
          </svg>
          <p className="text-[13px] font-medium text-sse-sem-green-fg">
            Proceso completado. El candidato está en onboarding.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Solicitud card (left panel item) ────────────────────────────────────────

function SolicitudCard({
  solicitud,
  isSelected,
  onClick,
}: {
  solicitud: SolicitudContratacion;
  isSelected: boolean;
  onClick: () => void;
}) {
  const currentOrden  = ETAPAS_CONTRATACION[solicitud.etapaActual].orden;
  const totalEtapas   = ETAPAS_SORTED.length;
  const progressWidth = Math.round((currentOrden / totalEtapas) * 100);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-md border p-3 transition-all",
        isSelected
          ? "border-sse-primary bg-sse-pill-blue-bg shadow-sm"
          : "border-sse-border bg-sse-surface hover:border-sse-primary/40 hover:shadow-sm",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-semibold text-sse-ink leading-snug line-clamp-2 flex-1">
          {solicitud.cargo}
        </p>
        {solicitud.candidatos !== undefined && solicitud.candidatos > 0 && (
          <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-sse-pill-gray-bg text-sse-pill-gray-fg">
            {solicitud.candidatos}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-medium",
            isSelected
              ? "bg-sse-primary text-white"
              : "bg-sse-pill-blue-bg text-sse-pill-blue-fg",
          )}
        >
          {ETAPAS_CONTRATACION[solicitud.etapaActual].label}
        </span>
        {solicitud.fechaObjetivo && (
          <span className="text-[10px] text-sse-muted">
            {fmtDate(solicitud.fechaObjetivo)}
          </span>
        )}
      </div>

      {/* Compact progress */}
      <div className="mt-2">
        <div className="h-1 rounded-full bg-sse-border overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isSelected ? "bg-sse-primary" : "bg-sse-pill-blue-fg",
            )}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
        <p className="text-[10px] text-sse-muted mt-1">
          Etapa {currentOrden} de {totalEtapas}
        </p>
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function HiringWorkflow() {
  const { data: solicitudes = [], isLoading } = useSolicitudesContratacion({ unidadId: "rrhh" });
  const [selectedId, setSelectedId]           = useState<string | null>(null);

  const selected = solicitudes.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-semibold text-sse-ink">Proceso de Contratación</h1>
        {!isLoading && (
          <span className="text-[12px] text-sse-muted">
            {solicitudes.length} solicitud{solicitudes.length !== 1 ? "es" : ""}
          </span>
        )}
      </div>

      <div className="flex gap-4 items-start">
        {/* ── Left panel: solicitudes list ── */}
        <div className="w-72 shrink-0 space-y-2">
          {isLoading && (
            <>
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-md border border-sse-border p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-1.5 w-full mt-2" />
                </div>
              ))}
            </>
          )}

          {!isLoading && solicitudes.length === 0 && (
            <Card>
              <CardContent className="p-4">
                <p className="text-[12px] text-sse-muted">No hay solicitudes de contratación.</p>
              </CardContent>
            </Card>
          )}

          {!isLoading && solicitudes.map((s) => (
            <SolicitudCard
              key={s.id}
              solicitud={s}
              isSelected={selectedId === s.id}
              onClick={() => setSelectedId(selectedId === s.id ? null : s.id)}
            />
          ))}
        </div>

        {/* ── Right panel: detail ── */}
        <div className="flex-1 min-w-0">
          {selected ? (
            <SolicitudDetail key={selected.id} solicitud={selected} />
          ) : (
            <Card>
              <CardContent>
                <EmptyState
                  icon="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4"
                  title="Selecciona una solicitud"
                  description="Elige una solicitud de la lista para ver el detalle del proceso de contratación."
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
