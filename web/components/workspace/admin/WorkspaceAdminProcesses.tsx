"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import { usePermissions } from "@/hooks/usePermissions";
import { useBlueprints, lifecycleBadge } from "@/hooks/useWorkspaceAdmin";
import { WorkspaceAdminService } from "@/services/workspace-admin";
import type { ProcessBlueprint, ObjectLifecycle } from "@/types/workspace-admin";

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
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ backgroundColor: `${color}18`, color }}
    >
      {label}
    </span>
  );
}

function BlueprintRow({
  bp,
  wsId,
  onAction,
}: {
  bp: ProcessBlueprint;
  wsId: WorkspaceId;
  onAction: () => void;
}) {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("ws.processes.manage");
  const canPublish = hasPermission("ws.processes.publish");
  const [busy, setBusy] = useState(false);

  const handlePublish = async () => {
    if (!confirm(`¿Publicar "${bp.nombre}"? Esto creará un Blueprint de Runtime activo.`)) return;
    setBusy(true);
    await WorkspaceAdminService.publishBlueprint(bp.id);
    setBusy(false);
    onAction();
  };

  const handleArchive = async () => {
    if (!confirm(`¿Archivar "${bp.nombre}"?`)) return;
    setBusy(true);
    await WorkspaceAdminService.archiveBlueprint(bp.id);
    setBusy(false);
    onAction();
  };

  const handleDuplicate = async () => {
    setBusy(true);
    await WorkspaceAdminService.duplicateBlueprint(bp.id);
    setBusy(false);
    onAction();
  };

  return (
    <tr className="border-b border-sse-border last:border-0 hover:bg-sse-hover/50 transition-colors">
      <td className="py-3 px-4">
        <div>
          <p className="text-[13px] font-medium text-sse-ink">{bp.nombre}</p>
          <p className="text-[11px] text-sse-muted mt-0.5 line-clamp-1">{bp.descripcion}</p>
        </div>
      </td>
      <td className="py-3 px-3">
        <span className="text-[12px] text-sse-muted">{TIPO_LABELS[bp.tipo] ?? bp.tipo}</span>
      </td>
      <td className="py-3 px-3">
        <LifecyclePill lifecycle={bp.lifecycle} />
      </td>
      <td className="py-3 px-3">
        <span className="text-[12px] tabular-nums text-sse-muted">v{bp.version}</span>
      </td>
      <td className="py-3 px-3">
        <span
          className="text-[11px] font-semibold"
          style={{ color: PRIORIDAD_COLORS[bp.prioridad] }}
        >
          {bp.prioridad.charAt(0).toUpperCase() + bp.prioridad.slice(1)}
        </span>
      </td>
      <td className="py-3 px-3">
        <span className="text-[12px] text-sse-muted">{bp.slaDias}d</span>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {canPublish && bp.lifecycle === "draft" && (
            <button
              onClick={handlePublish}
              disabled={busy}
              className="text-[11px] font-medium text-sse-primary hover:underline disabled:opacity-50"
            >
              Publicar
            </button>
          )}
          {canManage && bp.lifecycle !== "archived" && (
            <button
              onClick={handleArchive}
              disabled={busy}
              className="text-[11px] text-sse-muted hover:text-sse-ink disabled:opacity-50"
            >
              Archivar
            </button>
          )}
          {canManage && (
            <button
              onClick={handleDuplicate}
              disabled={busy}
              className="text-[11px] text-sse-muted hover:text-sse-ink disabled:opacity-50"
            >
              Duplicar
            </button>
          )}
        </div>
      </td>
    </tr>
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

  const canManage = hasPermission("ws.processes.manage");

  const filtered = (blueprints ?? []).filter((bp) => {
    if (filter !== "all" && bp.lifecycle !== filter) return false;
    if (search && !bp.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: blueprints?.length ?? 0,
    draft: (blueprints ?? []).filter((b) => b.lifecycle === "draft").length,
    published: (blueprints ?? []).filter((b) => b.lifecycle === "published").length,
    archived: (blueprints ?? []).filter((b) => b.lifecycle === "archived").length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-semibold text-sse-ink">Gestión de Procesos</h1>
          <p className="text-[12px] text-sse-muted mt-0.5">
            Blueprints de proceso · Publicar crea un Runtime Blueprint activo.
          </p>
        </div>
        {canManage && (
          <button className="flex items-center gap-1.5 text-[12px] font-medium bg-sse-primary text-white px-3 py-1.5 rounded-md hover:bg-sse-primary/90 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Proceso
          </button>
        )}
      </div>

      {/* Lifecycle filters */}
      <div className="flex items-center gap-1">
        {(["all", "draft", "published", "archived"] as const).map((lc) => {
          const labels: Record<string, string> = { all: "Todos", draft: "Borrador", published: "Publicados", archived: "Archivados" };
          const active = filter === lc;
          return (
            <button
              key={lc}
              onClick={() => setFilter(lc)}
              className={
                "px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors " +
                (active
                  ? "bg-sse-primary/10 text-sse-primary"
                  : "text-sse-muted hover:bg-sse-hover hover:text-sse-ink")
              }
            >
              {labels[lc]}
              <span className="ml-1.5 text-[10px] opacity-70">{counts[lc as keyof typeof counts]}</span>
            </button>
          );
        })}

        <div className="ml-auto">
          <input
            type="search"
            placeholder="Buscar proceso..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-[12px] px-3 py-1.5 rounded-md border border-sse-border bg-sse-surface text-sse-ink placeholder:text-sse-muted focus:outline-none focus:ring-1 focus:ring-sse-primary/50 w-48"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-sse-surface rounded-md border border-sse-border overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-5 h-5 border-2 border-sse-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[13px] text-sse-muted">No se encontraron procesos.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-sse-border">
                {["Proceso", "Tipo", "Estado", "Versión", "Prioridad", "SLA", "Acciones"].map((h) => (
                  <th key={h} className="text-[11px] font-semibold text-sse-muted uppercase tracking-wide py-2.5 px-3 first:px-4 last:px-4 last:text-right">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((bp) => (
                <BlueprintRow key={bp.id} bp={bp} wsId={wsId} onAction={refetch} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Info box */}
      <div className="bg-sse-hover rounded-md border border-sse-border px-4 py-3">
        <p className="text-[11px] text-sse-muted">
          <strong className="text-sse-ink">Ciclo de vida:</strong> Borrador → Publicado → Archivado → Deprecado.
          Publicar un proceso crea un <em>Runtime Blueprint</em> disponible para instanciación.
          Los procesos eliminados se marcan con <code>deletedAt</code> (soft delete).
        </p>
      </div>
    </div>
  );
}
