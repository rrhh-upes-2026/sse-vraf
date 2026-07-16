"use client";

import { useQuery } from "@tanstack/react-query";
import type { WorkspaceId } from "@/config/nav";
import type { ObjetivoEstrategico, ProyectoEstrategico } from "@/types/entities";
import { ObjetivosService, ProyectosService } from "@/services";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

interface WorkspaceObjectivesProps {
  wsId: WorkspaceId;
}

function ObjetivoRow({
  objetivo,
  proyectoCount,
}: {
  objetivo: ObjetivoEstrategico;
  proyectoCount: number;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-sse-border last:border-b-0">
      {/* ID badge */}
      <span className="shrink-0 mt-0.5 inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-mono font-semibold bg-sse-pill-blue-bg text-sse-pill-blue-fg">
        {objetivo.id}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-sse-ink leading-snug">{objetivo.nombre}</p>
        {objetivo.descripcion && (
          <p className="text-[12px] text-sse-muted mt-0.5 line-clamp-2">{objetivo.descripcion}</p>
        )}
      </div>

      {/* Projects linked */}
      <div className="shrink-0 text-right">
        <Badge variant={proyectoCount > 0 ? "info" : "gray"}>
          {proyectoCount} {proyectoCount === 1 ? "proyecto" : "proyectos"}
        </Badge>
      </div>
    </div>
  );
}

export function WorkspaceObjectives({ wsId }: WorkspaceObjectivesProps) {
  const { data: objetivos, isLoading: loadingObj } = useQuery<ObjetivoEstrategico[]>({
    queryKey: ["objetivos"],
    queryFn: () => ObjetivosService.list(),
  });

  const { data: proyectos, isLoading: loadingProy } = useQuery<ProyectoEstrategico[]>({
    queryKey: ["proyectos", wsId],
    queryFn: () => ProyectosService.list({ unidadId: wsId }),
  });

  const isLoading = loadingObj || loadingProy;

  // Build a count map: objetivoId -> number of proyectos
  const proyectosByObjetivo: Record<string, number> = {};
  (proyectos ?? []).forEach((p) => {
    proyectosByObjetivo[p.objetivoId] = (proyectosByObjetivo[p.objetivoId] ?? 0) + 1;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-semibold text-sse-ink">Objetivos estratégicos</h1>
        {objetivos && (
          <span className="text-[12px] text-sse-muted">
            {objetivos.length} objetivo{objetivos.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan estratégico institucional</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading && (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          )}

          {!isLoading && (!objetivos || objetivos.length === 0) && (
            <EmptyState
              icon="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
              title="Sin objetivos estratégicos"
              description="No se encontraron objetivos en el plan institucional."
            />
          )}

          {!isLoading && objetivos && objetivos.length > 0 && (
            <div>
              {objetivos.map((obj) => (
                <ObjetivoRow
                  key={obj.id}
                  objetivo={obj}
                  proyectoCount={proyectosByObjetivo[obj.id] ?? 0}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Context note */}
      <p className="text-[12px] text-sse-muted">
        Los objetivos estratégicos son compartidos entre todas las unidades. Los proyectos
        mostrados corresponden únicamente a esta unidad.
      </p>
    </div>
  );
}
