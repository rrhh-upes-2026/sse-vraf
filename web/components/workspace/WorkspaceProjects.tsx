"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { ProyectoEstrategico, ObjetivoEstrategico } from "@/types/entities";
import { useProyectos, useProyectosActions } from "@/hooks/useProyectos";
import { useObjetivos } from "@/hooks/useObjetivos";
import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EntitySelector } from "@/components/ui/entity-selector";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Drawer, DrawerSection, DrawerField } from "@/components/ui/drawer";

interface WorkspaceProjectsProps {
  wsId: WorkspaceId;
}

function ProjectCard({
  proyecto,
  objetivo,
  onEdit,
  onDelete,
  confirmDeleteId,
  onCancelDelete,
  onConfirmDelete,
  canEdit,
}: {
  proyecto: ProyectoEstrategico;
  objetivo: ObjetivoEstrategico | undefined;
  onEdit: (p: ProyectoEstrategico) => void;
  onDelete: (id: string) => void;
  confirmDeleteId: string | null;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
  canEdit: boolean;
}) {
  const isConfirming = confirmDeleteId === proyecto.id;

  return (
    <div className="bg-sse-surface rounded-md border border-sse-border p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-sse-ink leading-snug">{proyecto.nombre}</p>
          {proyecto.descripcion && (
            <p className="text-[12px] text-sse-muted mt-0.5 line-clamp-2">{proyecto.descripcion}</p>
          )}
        </div>
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

      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px] font-mono text-sse-muted">{proyecto.id}</span>
        {canEdit && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(proyecto)}
              className="px-2 py-0.5 rounded text-[11px] text-sse-primary hover:bg-sse-pill-blue-bg"
            >
              Editar
            </button>
            {isConfirming ? (
              <>
                <button
                  onClick={() => onConfirmDelete(proyecto.id)}
                  className="px-2 py-0.5 rounded text-[11px] text-sse-sem-red-fg hover:bg-sse-sem-red-bg"
                >
                  Confirmar
                </button>
                <button
                  onClick={onCancelDelete}
                  className="px-2 py-0.5 rounded text-[11px] text-sse-muted hover:bg-sse-shell-canvas"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={() => onDelete(proyecto.id)}
                className="px-2 py-0.5 rounded text-[11px] text-sse-muted hover:text-sse-sem-red-fg hover:bg-sse-sem-red-bg"
              >
                Eliminar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const ESTADO_OPTIONS = [
  { value: "activo",     label: "Activo" },
  { value: "pausado",    label: "Pausado" },
  { value: "completado", label: "Completado" },
  { value: "cancelado",  label: "Cancelado" },
];

const EMPTY_FORM = {
  nombre: "",
  descripcion: "",
  objetivoId: "",
  responsableId: "",
  estado: "activo" as NonNullable<ProyectoEstrategico["estado"]>,
  fechaInicio: "",
  fechaFin: "",
  presupuesto: "",
};

export function WorkspaceProjects({ wsId }: WorkspaceProjectsProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ProyectoEstrategico | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: proyectos, isLoading: loadingProy } = useProyectos({ unidadId: wsId });
  const { data: objetivos } = useObjetivos();
  const actions = useProyectosActions();
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("process.create");

  const objetivoMap: Record<string, ObjetivoEstrategico> = {};
  (objetivos ?? []).forEach((o) => { objetivoMap[o.id] = o; });

  const objetivoOptions = (objetivos ?? []).map((o) => ({ value: o.id, label: o.nombre }));

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDrawerOpen(true);
  }

  function openEdit(p: ProyectoEstrategico) {
    setEditing(p);
    setForm({
      nombre:        p.nombre,
      descripcion:   p.descripcion ?? "",
      objetivoId:    p.objetivoId,
      responsableId: p.responsableId ?? "",
      estado:        p.estado ?? "activo",
      fechaInicio:   p.fechaInicio ?? "",
      fechaFin:      p.fechaFin ?? "",
      presupuesto:   p.presupuesto ? String(p.presupuesto) : "",
    });
    setDrawerOpen(true);
  }

  async function handleSave() {
    const payload = {
      ...form,
      unidadId: wsId,
      presupuesto: form.presupuesto ? Number(form.presupuesto) : undefined,
    };
    if (editing) {
      await actions.update.mutateAsync({ id: editing.id, patch: payload });
    } else {
      await actions.create.mutateAsync(payload as Partial<ProyectoEstrategico>);
    }
    setDrawerOpen(false);
  }

  async function handleConfirmDelete(id: string) {
    await actions.remove.mutateAsync(id);
    setConfirmDeleteId(null);
  }

  const isPending = actions.create.isPending || actions.update.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-semibold text-sse-ink">Proyectos estratégicos</h1>
        {canEdit && (
          <Button size="sm" variant="primary" onClick={openCreate}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo proyecto
          </Button>
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
          action={canEdit ? <Button size="sm" onClick={openCreate}>Crear primer proyecto</Button> : undefined}
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
                onEdit={openEdit}
                onDelete={(id) => setConfirmDeleteId(id)}
                confirmDeleteId={confirmDeleteId}
                onCancelDelete={() => setConfirmDeleteId(null)}
                onConfirmDelete={handleConfirmDelete}
                canEdit={canEdit}
              />
            ))}
          </div>
          <p className="text-[12px] text-sse-muted">
            {proyectos.length} proyecto{proyectos.length !== 1 ? "s" : ""} en esta unidad
          </p>
        </>
      )}

      {/* Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? "Editar proyecto" : "Nuevo proyecto estratégico"}
        width="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.nombre || isPending}>
              {isPending ? "Guardando…" : editing ? "Guardar cambios" : "Crear proyecto"}
            </Button>
          </>
        }
      >
        <DrawerSection>
          <DrawerField label="Nombre del proyecto" required>
            <Input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej. Modernización del sistema académico"
            />
          </DrawerField>

          <DrawerField label="Descripción">
            <Textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows={3}
              placeholder="Descripción del proyecto…"
            />
          </DrawerField>

          <DrawerField label="Objetivo estratégico vinculado" required>
            {objetivoOptions.length > 0 ? (
              <Select
                value={form.objetivoId}
                onValueChange={(v) => setForm({ ...form, objetivoId: v })}
                options={objetivoOptions}
                placeholder="Seleccionar objetivo…"
              />
            ) : (
              <p className="text-[12px] text-sse-muted">
                No hay objetivos registrados. Crea un objetivo primero.
              </p>
            )}
          </DrawerField>

          <DrawerField label="Estado">
            <Select
              value={form.estado}
              onValueChange={(v) => setForm({ ...form, estado: v as NonNullable<ProyectoEstrategico["estado"]> })}
              options={ESTADO_OPTIONS}
            />
          </DrawerField>

          <DrawerField label="Responsable">
            <EntitySelector
              entityType="usuarios"
              value={form.responsableId}
              onValueChange={(v) => setForm({ ...form, responsableId: v })}
              placeholder="Seleccionar responsable…"
              allowEmpty
            />
          </DrawerField>

          <div className="grid grid-cols-2 gap-3">
            <DrawerField label="Fecha inicio">
              <Input
                type="date"
                value={form.fechaInicio}
                onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
              />
            </DrawerField>
            <DrawerField label="Fecha fin">
              <Input
                type="date"
                value={form.fechaFin}
                onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
              />
            </DrawerField>
          </div>

          <DrawerField label="Presupuesto (USD)">
            <Input
              type="number"
              value={form.presupuesto}
              onChange={(e) => setForm({ ...form, presupuesto: e.target.value })}
              placeholder="0.00"
            />
          </DrawerField>
        </DrawerSection>
      </Drawer>
    </div>
  );
}
