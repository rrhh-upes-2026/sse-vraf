"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import { usePermissions } from "@/hooks/usePermissions";
import { useBlueprints, lifecycleBadge } from "@/hooks/useWorkspaceAdmin";
import { WorkspaceAdminService } from "@/services/workspace-admin";
import type { ProcessBlueprint, ObjectLifecycle } from "@/types/workspace-admin";
import { ProcessDrawer } from "./drawers/ProcessDrawer";
import { Button } from "@/components/ui/button";

const TIPO_LABELS: Record<string, string> = {
  estrategico: "Estratégico",
  misional: "Misional",
  apoyo: "Apoyo",
  operativo: "Operativo",
};

const PRIORIDAD_COLORS: Record<string, string> = {
  baja: "#12A150",
  media: "#E5A100",
  alta: "#E54D4D",
  critica: "#9B1C1C",
};

function LifecyclePill({ lifecycle }: { lifecycle: ObjectLifecycle }) {
  const { label, color } = lifecycleBadge(lifecycle);
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${color}18`, color }}>
      {label}
    </span>
  );
}

function Skeleton() {
  return (
    <div className="space-y-2 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-9 flex-1 animate-pulse rounded-md bg-sse-shell-canvas" />
          <div className="h-9 w-20 animate-pulse rounded-md bg-sse-shell-canvas" />
          <div className="h-9 w-24 animate-pulse rounded-md bg-sse-shell-canvas" />
        </div>
      ))}
    </div>
  );
}

interface WorkspaceAdminProcessesProps {
  wsId: WorkspaceId;
}

export function WorkspaceAdminProcesses({ wsId }: WorkspaceAdminProcessesProps) {
  const { hasPermission } = usePermissions();
  const { data: blueprints, loading, refetch } = useBlueprints(wsId);
  const [filter, setFilter] = useState<ObjectLifecycle | "all">("all");
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<ProcessBlueprint | null>(null);

  const canManage = hasPermission("ws.processes.manage");
  const canPublish = hasPermission("ws.processes.publish");

  const filtered = (blueprints ?? []).filter((bp) => {
    if (filter !== "all" && bp.lifecycle !== filter) return false;
    if (search && !bp.nombre.toLowerCase().includes(search.toLowerCase()) && !bp.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: blueprints?.length ?? 0,
    draft: (blueprints ?? []).filter((b) => b.lifecycle === "draft").length,
    published: (blueprints ?? []).filter((b) => b.lifecycle === "published").length,
    archived: (blueprints ?? []).filter((b) => b.lifecycle === "archived").length,
  };

  function openNew() { setSelected(null); setDrawerOpen(true); }
  function openEdit(bp: ProcessBlueprint) { setSelected(bp); setDrawerOpen(true); }

  async function handlePublish(bp: ProcessBlueprint) {
    if (!confirm(`¿Publicar "${bp.nombre}"? Esto creará un Blueprint de Runtime activo.`)) return;
    await WorkspaceAdminService.publishBlueprint(bp.id);
    refetch();
  }

  async function handleArchive(bp: ProcessBlueprint) {
    if (!confirm(`¿Archivar "${bp.nombre}"?`)) return;
    await WorkspaceAdminService.archiveBlueprint(bp.id);
    refetch();
  }

  async function handleDuplicate(bp: ProcessBlueprint) {
    await WorkspaceAdminService.duplicateBlueprint(bp.id);
    refetch();
  }

  async function handleDelete(bp: ProcessBlueprint) {
    if (!confirm(`¿Eliminar "${bp.nombre}"? Esta acción es un soft delete.`)) return;
    await WorkspaceAdminService.deleteBlueprint(bp.id);
    refetch();
  }

  return (
    <div className="space-y-4">
      <ProcessDrawer
        wsId={wsId}
        blueprint={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSaved={refetch}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-semibold text-sse-ink">Gestión de Procesos</h1>
          <p className="mt-0.5 text-[12px] text-sse-muted">
            Blueprints de proceso · Publicar crea un Runtime Blueprint activo.
          </p>
        </div>
        {canManage && (
          <Button variant="primary" size="sm" onClick={openNew}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Proceso
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1">
        {(["all", "draft", "published", "archived"] as const).map((lc) => {
          const labels: Record<string, string> = { all: "Todos", draft: "Borrador", published: "Publicados", archived: "Archivados" };
          const active = filter === lc;
          return (
            <button
              key={lc}
              onClick={() => setFilter(lc)}
              className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${active ? "bg-sse-primary/10 text-sse-primary" : "text-sse-muted hover:bg-sse-shell-canvas hover:text-sse-ink"}`}
            >
              {labels[lc]}
              <span className="ml-1.5 text-[10px] opacity-70">{counts[lc as keyof typeof counts]}</span>
            </button>
          );
        })}
        <div className="ml-auto">
          <input
            type="search"
            placeholder="Buscar proceso…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[12px] text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-1 focus:ring-sse-primary/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border border-sse-border bg-sse-surface">
        {loading ? (
          <Skeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-10 text-sse-border">
              <path strokeLinecap="round" d="M9 11l3 3 8-8M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9" />
            </svg>
            <p className="text-[13px] font-medium text-sse-muted">No hay procesos{filter !== "all" ? ` en estado "${filter}"` : ""}</p>
            {canManage && filter === "all" && (
              <Button variant="primary" size="sm" onClick={openNew} className="mt-2">Crear primer proceso</Button>
            )}
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-sse-border">
                {["Proceso", "Tipo", "Estado", "Ver.", "Prioridad", "SLA", "Acciones"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-sse-muted first:px-4 last:px-4 last:text-right">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((bp) => (
                <tr
                  key={bp.id}
                  className="cursor-pointer border-b border-sse-border/60 transition-colors last:border-0 hover:bg-sse-shell-canvas"
                  onClick={() => openEdit(bp)}
                >
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-medium text-sse-ink">{bp.nombre}</p>
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-sse-muted">{bp.id}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-[12px] text-sse-muted">{TIPO_LABELS[bp.tipo] ?? bp.tipo}</span>
                  </td>
                  <td className="px-3 py-3">
                    <LifecyclePill lifecycle={bp.lifecycle} />
                  </td>
                  <td className="px-3 py-3">
                    <span className="tabular-nums text-[12px] text-sse-muted">v{bp.version}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-[11px] font-semibold capitalize" style={{ color: PRIORIDAD_COLORS[bp.prioridad] }}>
                      {bp.prioridad}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-[12px] text-sse-muted">{bp.slaDias}d</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {canPublish && bp.lifecycle === "draft" && (
                        <button onClick={() => handlePublish(bp)} className="text-[11px] font-medium text-sse-primary hover:underline">
                          Publicar
                        </button>
                      )}
                      {canManage && bp.lifecycle !== "archived" && (
                        <button onClick={() => handleArchive(bp)} className="text-[11px] text-sse-muted hover:text-sse-ink">
                          Archivar
                        </button>
                      )}
                      {canManage && (
                        <button onClick={() => handleDuplicate(bp)} className="text-[11px] text-sse-muted hover:text-sse-ink">
                          Duplicar
                        </button>
                      )}
                      {canManage && (
                        <button onClick={() => handleDelete(bp)} className="text-[11px] text-sse-sem-red-fg hover:underline">
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="rounded-md border border-sse-border bg-sse-shell-canvas px-4 py-3">
        <p className="text-[11px] text-sse-muted">
          <strong className="text-sse-ink">Ciclo de vida:</strong> Borrador → Publicado → Archivado → Deprecado.
          Haz clic en cualquier fila para editar. Publicar crea un <em>Runtime Blueprint</em> activo para instanciación.
        </p>
      </div>
    </div>
  );
}
