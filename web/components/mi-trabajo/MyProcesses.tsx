"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import type { RoleCode } from "@/types/roles";
import type { WorkspaceId } from "@/config/nav";
import type { ProcesoInstitucional, SemaforoColor, EstadoProceso } from "@/types/entities";
import { useProcesos, useProcesosActions } from "@/hooks/useProcesos";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SkeletonCard } from "@/components/ui/skeleton";
import { fmtShortDate } from "@/lib/utils";

const SEMAPHORE_BADGE: Record<SemaforoColor, "success" | "warning" | "danger"> = {
  verde: "success",
  amarillo: "warning",
  rojo: "danger",
};

const ESTADO_LABEL: Record<EstadoProceso, string> = {
  borrador: "Borrador",
  activo: "Activo",
  en_riesgo: "En riesgo",
  completado: "Completado",
  archivado: "Archivado",
};

const PRIORIDAD_BADGE: Record<ProcesoInstitucional["prioridad"], "info" | "default" | "warning" | "danger"> = {
  baja: "default",
  media: "info",
  alta: "warning",
  critica: "danger",
};

function daysDiff(fechaLimite: string) {
  const diff = new Date(fechaLimite).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function DueDateChip({ fechaLimite }: { fechaLimite: string }) {
  const days = daysDiff(fechaLimite);
  if (days < 0) {
    return <span className="text-[11px] font-medium text-sse-danger">Vencido hace {Math.abs(days)} días</span>;
  }
  if (days <= 7) {
    return <span className="text-[11px] font-medium text-sse-warning">{days} días restantes</span>;
  }
  return (
    <span className="text-[11px] text-sse-muted">
      {fmtShortDate(fechaLimite)}
    </span>
  );
}

function ProcesoCard({ proceso }: { proceso: ProcesoInstitucional }) {
  const { hasPermission } = usePermissions();

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-[14px] line-clamp-2 flex-1">{proceso.nombre}</CardTitle>
          <Badge variant={SEMAPHORE_BADGE[proceso.semaforo]} className="shrink-0">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background:
                  proceso.semaforo === "verde"
                    ? "var(--sse-sem-green-fg)"
                    : proceso.semaforo === "amarillo"
                    ? "#E5A100"
                    : "var(--sse-sem-red-fg)",
              }}
            />
            {ESTADO_LABEL[proceso.estado]}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant={PRIORIDAD_BADGE[proceso.prioridad]}>
            {proceso.prioridad.charAt(0).toUpperCase() + proceso.prioridad.slice(1)}
          </Badge>
          <DueDateChip fechaLimite={proceso.fechaLimite} />
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-sse-muted">Avance</span>
            <span className="text-[11px] font-semibold text-sse-ink">{proceso.avancePct}%</span>
          </div>
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

        {hasPermission("process.edit") && (
          <Link href={`/ws/${proceso.unidadId}/procesos`}>
            <Button variant="outline" size="sm" className="w-full text-[12px]">
              Abrir proceso
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export function MyProcesses() {
  const { data: session } = useSession();
  const usuarioId = session?.user?.usuarioId;

  const { data: procesos, isLoading, isError } = useProcesos(
    usuarioId ? { responsableId: usuarioId } : undefined,
  );

  if (!usuarioId) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-sse-ink">Mis Procesos</h2>
        <span className="text-[12px] text-sse-muted">
          {procesos ? `${procesos.length} proceso${procesos.length !== 1 ? "s" : ""}` : ""}
        </span>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {isError && (
        <Card>
          <CardContent>
            <p className="text-[13px] text-sse-muted">No se pudieron cargar los procesos.</p>
          </CardContent>
        </Card>
      )}

      {procesos && procesos.length === 0 && (
        <Card>
          <CardContent>
            <p className="text-[13px] text-sse-muted">No tienes procesos asignados.</p>
          </CardContent>
        </Card>
      )}

      {procesos && procesos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {procesos.map((p) => (
            <ProcesoCard key={p.id} proceso={p} />
          ))}
        </div>
      )}
    </section>
  );
}
