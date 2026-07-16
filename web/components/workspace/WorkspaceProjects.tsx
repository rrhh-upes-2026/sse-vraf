"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { WorkspaceId } from "@/config/nav";
import type { ProyectoEstrategico, ObjetivoEstrategico, ProcesoInstitucional } from "@/types/entities";
import { ProyectosService, ObjetivosService, ProcesosService } from "@/services";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

interface WorkspaceProjectsProps {
  wsId: WorkspaceId;
}

function ProjectCard({
  proyecto,
  objetivo,
  procesoCount,
}: {
  proyecto: ProyectoEstrategico;
  objetivo: ObjetivoEstrategico | undefined;
  procesoCount: number;
}) {
  return (
    <div className="bg-sse-surface rounded-md border border-sse-border p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-sse-ink leading-snug">{proyecto.nombre}</p>
          {proyecto.descripcion && (
            <p className="text-[12px] text-sse-muted mt-0.5 line-clamp-2">{proyecto.descripcion}</p>
          )}
        </div>
        <Badge variant="info">{procesoCount} proceso{procesoCount !== 1 ? "s" : ""}</Badge>
      </div>

      {objetivo && (
        <div className="flex items-center gap-1.5 mt-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            className="w-3.5 h-3.5 text-sse-muted shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
          </svg>
          <span className="text-[11px] text-sse-muted truncate">{objetivo.nombre}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 mt-1.5">
        <span className="text-[10px] font-mono text-sse-muted">{proyecto.id}</span>
      </div>
    </div>
  );
}

export function WorkspaceProjects({ wsId }: WorkspaceProjectsProps) {
  const { hasPermission } = usePermissions();

  const { data: proyectos, isLoading: loadingProy } = useQuery<ProyectoEstrategico[]>({
    queryKey: ["proyectos", wsId],
    queryFn: () => ProyectosService.list({ unidadId: wsId }),
  });

  const { data: objetivos } = useQuery<ObjetivoEstrategico[]>({
    queryKey: ["objetivos"],
    queryFn: () => ObjetivosService.list(),
  });

  const { data: procesos } = useQuery<ProcesoInstitucional[]>({
    queryKey: ["procesos", wsId],
    queryFn: () => ProcesosService.list({ unidadId: wsId }),
  });

  // Build a map objetivoId -> ObjetivoEstrategico
  const objetivoMap: Record<string, ObjetivoEstrategico> = {};
  (objetivos ?? []).forEach((o) => { objetivoMap[o.id] = o; });

  // Build a count map: proyectoId -> count of procesos
  const procesosByProy: Record<string, number> = {};
  (procesos ?? []).forEach((p) => {
    procesosByProy[p.proyectoId] = (procesosByProy[p.proyectoId] ?? 0) + 1;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-semibold text-sse-ink">Proyectos estratégicos</h1>
        {hasPermission("process.create") && (
          <Link href="/studio/process-builder">
            <Button size="sm" variant="primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo proyecto
            </Button>
          </Link>
        )}
      </div>

      {loadingProy && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-[110px] rounded-md" />)}
        </div>
      )}

      {!loadingProy && (!proyectos || proyectos.length === 0) && (
        <EmptyState
          icon="M6 3v6M6 15v6M18 3v18M6 9a3 3 0 0 0 3 3h6"
          title="Sin proyectos"
          description="Esta unidad no tiene proyectos estratégicos registrados."
          action={
            hasPermission("process.create") ? (
              <Link href="/studio/process-builder">
                <Button size="sm">Crear primer proyecto</Button>
              </Link>
            ) : undefined
          }
        />
      )}

      {!loadingProy && proyectos && proyectos.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {proyectos.map((proy) => (
              <ProjectCard
                key={proy.id}
                proyecto={proy}
                objetivo={objetivoMap[proy.objetivoId]}
                procesoCount={procesosByProy[proy.id] ?? 0}
              />
            ))}
          </div>
          <p className="text-[12px] text-sse-muted">
            {proyectos.length} proyecto{proyectos.length !== 1 ? "s" : ""} en esta unidad
          </p>
        </>
      )}
    </div>
  );
}
