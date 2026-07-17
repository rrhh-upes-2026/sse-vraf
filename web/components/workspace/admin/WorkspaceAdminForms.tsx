"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import { usePermissions } from "@/hooks/usePermissions";
import { useForms, lifecycleBadge } from "@/hooks/useWorkspaceAdmin";
import { WorkspaceAdminService } from "@/services/workspace-admin";
import type { FormBlueprint, ObjectLifecycle } from "@/types/workspace-admin";
import { Button } from "@/components/ui/button";

function fieldCount(form: FormBlueprint): number {
  const fields = (form.schema as Record<string, unknown>).fields;
  return Array.isArray(fields) ? fields.length : 0;
}

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

function CardSkeleton() {
  return (
    <div className="bg-sse-surface rounded-md border border-sse-border p-4 animate-pulse space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-sse-shell-canvas rounded w-3/4" />
          <div className="h-3 bg-sse-shell-canvas rounded w-full" />
          <div className="h-3 bg-sse-shell-canvas rounded w-2/3" />
        </div>
        <div className="h-5 w-16 bg-sse-shell-canvas rounded-full" />
      </div>
      <div className="flex gap-2 pt-2 border-t border-sse-border">
        <div className="h-3 w-20 bg-sse-shell-canvas rounded" />
        <div className="h-3 w-16 bg-sse-shell-canvas rounded" />
      </div>
    </div>
  );
}

function FormCard({
  form,
  onAction,
}: {
  form: FormBlueprint;
  onAction: () => void;
}) {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("ws.forms.manage");
  const [busy, setBusy] = useState(false);

  const handlePublish = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`¿Publicar el formulario "${form.nombre}"?`)) return;
    setBusy(true);
    await WorkspaceAdminService.publishForm(form.id);
    setBusy(false);
    onAction();
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`¿Archivar el formulario "${form.nombre}"?`)) return;
    setBusy(true);
    await WorkspaceAdminService.archiveForm(form.id);
    setBusy(false);
    onAction();
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setBusy(true);
    await WorkspaceAdminService.duplicateForm(form.id);
    setBusy(false);
    onAction();
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`Vista previa de "${form.nombre}" — disponible próximamente.`);
  };

  const fields = fieldCount(form);

  return (
    <div className="bg-sse-surface rounded-md border border-sse-border p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-sse-ink truncate">{form.nombre}</p>
          {form.descripcion && (
            <p className="text-[11px] text-sse-muted mt-0.5 line-clamp-2">{form.descripcion}</p>
          )}
        </div>
        <LifecyclePill lifecycle={form.lifecycle} />
      </div>

      <div className="flex items-center gap-3 text-[11px] text-sse-muted">
        <div className="flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h3.75" />
          </svg>
          <span>{fields} {fields === 1 ? "campo" : "campos"}</span>
        </div>
        <div className="flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
          </svg>
          <span>v{form.version}</span>
        </div>
        <span className="text-sse-muted/60 font-mono text-[10px]">{form.id}</span>
      </div>

      {canManage && (
        <div className="flex items-center gap-2 pt-2 border-t border-sse-border">
          {form.lifecycle === "draft" && (
            <button
              onClick={handlePublish}
              disabled={busy}
              className="text-[11px] font-medium text-sse-primary hover:underline disabled:opacity-50"
            >
              Publicar
            </button>
          )}
          {form.lifecycle !== "archived" && (
            <button
              onClick={handleArchive}
              disabled={busy}
              className="text-[11px] text-sse-muted hover:text-sse-ink disabled:opacity-50"
            >
              Archivar
            </button>
          )}
          <button
            onClick={handleDuplicate}
            disabled={busy}
            className="text-[11px] text-sse-muted hover:text-sse-ink disabled:opacity-50"
          >
            Duplicar
          </button>
          <button
            onClick={handlePreview}
            className="text-[11px] text-sse-muted hover:text-sse-ink ml-auto"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-3.5 inline mr-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Preview
          </button>
        </div>
      )}
    </div>
  );
}

export function WorkspaceAdminForms({ wsId }: { wsId: WorkspaceId }) {
  const { hasPermission } = usePermissions();
  const { data: forms, loading, refetch } = useForms(wsId);
  const [filter, setFilter] = useState<ObjectLifecycle | "all">("all");

  const canManage = hasPermission("ws.forms.manage");

  const filtered = (forms ?? []).filter((f) => filter === "all" || f.lifecycle === filter);

  const counts = {
    all: forms?.length ?? 0,
    draft: (forms ?? []).filter((f) => f.lifecycle === "draft").length,
    published: (forms ?? []).filter((f) => f.lifecycle === "published").length,
    archived: (forms ?? []).filter((f) => f.lifecycle === "archived").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-semibold text-sse-ink">Gestión de Formularios</h1>
          <p className="text-[12px] text-sse-muted mt-0.5">
            Formularios versionados · Cada publicación genera una nueva versión inmutable.
          </p>
        </div>
        {canManage && (
          <Button variant="primary" size="sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Formulario
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1">
        {(["all", "draft", "published", "archived"] as const).map((lc) => {
          const labels: Record<string, string> = { all: "Todos", draft: "Borrador", published: "Publicados", archived: "Archivados" };
          return (
            <button
              key={lc}
              onClick={() => setFilter(lc)}
              className={
                "px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors " +
                (filter === lc
                  ? "bg-sse-primary/10 text-sse-primary"
                  : "text-sse-muted hover:bg-sse-shell-canvas hover:text-sse-ink")
              }
            >
              {labels[lc]}
              <span className="ml-1.5 text-[10px] opacity-70">{counts[lc as keyof typeof counts]}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-sse-surface rounded-md border border-sse-border p-10 text-center flex flex-col items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-10 text-sse-border">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-[13px] font-medium text-sse-muted">
            No hay formularios{filter !== "all" ? ` en estado "${filter}"` : ""}
          </p>
          {canManage && filter === "all" && (
            <Button variant="primary" size="sm" className="mt-2">Crear primer formulario</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((form) => (
            <FormCard key={form.id} form={form} onAction={refetch} />
          ))}
        </div>
      )}

      <div className="bg-sse-hover rounded-md border border-sse-border px-4 py-3 space-y-1">
        <p className="text-[12px] font-semibold text-sse-ink">Versionado de formularios</p>
        <p className="text-[11px] text-sse-muted">
          Cada formulario publicado genera una versión inmutable. Las respuestas existentes siempre referencian
          la versión con la que fueron capturadas. Para modificar un formulario publicado, duplícalo y edita
          el borrador resultante antes de publicar la nueva versión.
        </p>
      </div>
    </div>
  );
}
