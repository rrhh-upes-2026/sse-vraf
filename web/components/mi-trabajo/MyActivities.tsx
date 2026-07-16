"use client";

import { useSession } from "next-auth/react";
import type { Actividad } from "@/types/entities";
import { useActividades, useActividadesActions } from "@/hooks/useActividades";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const ESTADO_BADGE: Record<Actividad["estado"], BadgeVariant> = {
  pendiente: "default",
  en_progreso: "info",
  completada: "success",
  bloqueada: "danger",
};

const ESTADO_LABEL: Record<Actividad["estado"], string> = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completada: "Completada",
  bloqueada: "Bloqueada",
};

const PRIORIDAD_DOT: Record<Actividad["prioridad"], string> = {
  baja: "bg-sse-pill-gray-fg",
  media: "bg-sse-primary",
  alta: "bg-sse-warning",
};

function ActivityRow({ actividad }: { actividad: Actividad }) {
  const { hasPermission } = usePermissions();
  const { update } = useActividadesActions();

  const canComplete = hasPermission("activity.complete") && actividad.estado !== "completada";

  function handleComplete() {
    update.mutate({ id: actividad.id, patch: { estado: "completada" } });
  }

  return (
    <div className="flex items-start gap-3 py-3 border-b border-sse-border last:border-b-0">
      {/* Priority indicator */}
      <span
        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${PRIORIDAD_DOT[actividad.prioridad]}`}
      />

      <div className="flex-1 min-w-0">
        <p
          className={`text-[13px] font-medium leading-snug ${
            actividad.estado === "completada" ? "text-sse-muted line-through" : "text-sse-ink"
          }`}
        >
          {actividad.nombre}
        </p>
        {actividad.descripcion && (
          <p className="text-[11px] text-sse-muted mt-0.5 line-clamp-1">{actividad.descripcion}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Badge variant={ESTADO_BADGE[actividad.estado]}>{ESTADO_LABEL[actividad.estado]}</Badge>
        {canComplete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleComplete}
            disabled={update.isPending}
            className="text-sse-success hover:text-sse-success"
            title="Marcar como completada"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
}

export function MyActivities() {
  const { data: session } = useSession();
  const usuarioId = session?.user?.usuarioId;

  const { data: actividades, isLoading } = useActividades(
    usuarioId ? { responsableId: usuarioId } : undefined,
  );

  const pending = actividades?.filter(
    (a) => a.estado === "pendiente" || a.estado === "en_progreso",
  ) ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mis Actividades</CardTitle>
          {pending.length > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 bg-sse-pill-blue-bg text-sse-pill-blue-fg rounded-sm">
              {pending.length} pendiente{pending.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        )}

        {!isLoading && pending.length === 0 && (
          <p className="text-[13px] text-sse-muted py-2">Sin actividades pendientes.</p>
        )}

        {!isLoading && pending.length > 0 && (
          <div>
            {pending.map((a) => (
              <ActivityRow key={a.id} actividad={a} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
