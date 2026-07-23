"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  usePMEActividades,
  usePMEActividadActions,
  usePMEProcesos,
  usePMECatalogosPorTipo,
} from "@/hooks/usePME";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { PMEActividad } from "@/types/pme";

interface Props {
  wsId: string;
}

type ViewMode = "table" | "kanban";

function KanbanCard({
  act,
  wsId,
  onArchivar,
  onActivar,
}: {
  act: PMEActividad;
  wsId: string;
  onArchivar: () => void;
  onActivar: () => void;
}) {
  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-3 space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[11px] text-sse-muted">{act.code}</span>
        <span
          className={`text-[10px] rounded-full px-1.5 py-0.5 font-medium ${
            act.active
              ? "bg-sse-sem-green-bg text-sse-sem-green-fg border border-sse-sem-green-border"
              : "bg-sse-border/60 text-sse-muted"
          }`}
        >
          {act.active ? "Activo" : "Archivado"}
        </span>
      </div>
      <p className="text-[13px] text-sse-ink font-medium leading-snug">{act.name}</p>
      {act.periodicidad && (
        <p className="text-[11px] text-sse-muted">{act.periodicidad}</p>
      )}
      <div className="flex items-center gap-2 pt-1 border-t border-sse-border">
        <Link
          href={`/ws/${wsId}/actividades-pme/${act.id}`}
          className="text-[11px] text-sse-primary hover:underline"
        >
          Ver
        </Link>
        {act.active ? (
          <button onClick={onArchivar} className="text-[11px] text-sse-sem-red-fg hover:underline">
            Archivar
          </button>
        ) : (
          <button onClick={onActivar} className="text-[11px] text-sse-sem-green-fg hover:underline">
            Activar
          </button>
        )}
      </div>
    </div>
  );
}

export function WorkspaceActividades({ wsId }: Props) {
  const router     = useRouter();
  const [search, setSearch]           = useState("");
  const [filterProcesoId, setFilterProcesoId] = useState("");
  const [filterEstado, setFilterEstado]       = useState("");
  const [viewMode, setViewMode]               = useState<ViewMode>("kanban");

  const { data: actividades, isLoading } = usePMEActividades();
  const { data: procesos }               = usePMEProcesos({ active: true });
  const { data: estados }                = usePMECatalogosPorTipo("estadoOperativo");
  const { archivar, activar }            = usePMEActividadActions();

  const filtered = (actividades ?? []).filter((a) => {
    const matchSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.code.toLowerCase().includes(search.toLowerCase());
    const matchProceso = !filterProcesoId || a.procesoId === filterProcesoId;
    const matchEstado  = !filterEstado || a.estadoOperativoId === filterEstado;
    return matchSearch && matchProceso && matchEstado;
  });

  const activas    = filtered.filter((a) => a.active);
  const archivadas = filtered.filter((a) => !a.active);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-semibold text-sse-ink">Actividades</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-sse-border overflow-hidden">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 text-[12px] ${
                viewMode === "kanban"
                  ? "bg-sse-primary text-white"
                  : "text-sse-muted hover:text-sse-ink"
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 text-[12px] ${
                viewMode === "table"
                  ? "bg-sse-primary text-white"
                  : "text-sse-muted hover:text-sse-ink"
              }`}
            >
              Tabla
            </button>
          </div>
          <Button size="sm" onClick={() => router.push(`/ws/${wsId}/actividades-pme/nuevo`)}>
            + Nueva Actividad
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar…"
          className="w-56"
        />
        <Select
          value={filterProcesoId}
          onValueChange={setFilterProcesoId}
          options={[
            { value: "", label: "Todos los procesos" },
            ...(procesos ?? []).map((p) => ({ value: p.id, label: p.name })),
          ]}
        />
        <Select
          value={filterEstado}
          onValueChange={setFilterEstado}
          options={[
            { value: "", label: "Todos los estados" },
            ...(estados ?? []).map((e) => ({ value: e.id, label: e.nombre })),
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No hay actividades"
          description="Cree la primera actividad operativa."
          action={
            <Button size="sm" onClick={() => router.push(`/ws/${wsId}/actividades-pme/nuevo`)}>
              + Nueva Actividad
            </Button>
          }
        />
      ) : viewMode === "kanban" ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-[12px] font-semibold text-sse-sem-green-fg uppercase tracking-wide mb-2">
              Activas ({activas.length})
            </h2>
            <div className="space-y-2">
              {activas.map((a) => (
                <KanbanCard
                  key={a.id}
                  act={a}
                  wsId={wsId}
                  onArchivar={() => archivar.mutate({ id: a.id })}
                  onActivar={() => activar.mutate({ id: a.id })}
                />
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-[12px] font-semibold text-sse-muted uppercase tracking-wide mb-2">
              Archivadas ({archivadas.length})
            </h2>
            <div className="space-y-2">
              {archivadas.map((a) => (
                <KanbanCard
                  key={a.id}
                  act={a}
                  wsId={wsId}
                  onArchivar={() => archivar.mutate({ id: a.id })}
                  onActivar={() => activar.mutate({ id: a.id })}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-sse-border">
                <th className="pb-2 text-left font-medium text-sse-muted">Código</th>
                <th className="pb-2 text-left font-medium text-sse-muted">Nombre</th>
                <th className="pb-2 text-left font-medium text-sse-muted">Periodicidad</th>
                <th className="pb-2 text-left font-medium text-sse-muted">Estado</th>
                <th className="pb-2 text-right font-medium text-sse-muted">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sse-border">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-sse-hover">
                  <td className="py-2.5 pr-4">
                    <Link
                      href={`/ws/${wsId}/actividades-pme/${a.id}`}
                      className="font-mono text-[12px] text-sse-primary hover:underline"
                    >
                      {a.code}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-4 text-sse-ink max-w-xs truncate">{a.name}</td>
                  <td className="py-2.5 pr-4 text-sse-muted">{a.periodicidad || "—"}</td>
                  <td className="py-2.5 pr-4">
                    <span
                      className={`text-[11px] rounded-full px-2 py-0.5 font-medium ${
                        a.active
                          ? "bg-sse-sem-green-bg text-sse-sem-green-fg border border-sse-sem-green-border"
                          : "bg-sse-border/60 text-sse-muted"
                      }`}
                    >
                      {a.active ? "Activo" : "Archivado"}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center justify-end gap-2">
                      {a.active ? (
                        <button
                          onClick={() => archivar.mutate({ id: a.id })}
                          className="text-[12px] text-sse-sem-red-fg hover:underline"
                        >
                          Archivar
                        </button>
                      ) : (
                        <button
                          onClick={() => activar.mutate({ id: a.id })}
                          className="text-[12px] text-sse-sem-green-fg hover:underline"
                        >
                          Activar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
