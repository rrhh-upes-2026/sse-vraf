"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { ProyectoEstrategico, ObjetivoEstrategico } from "@/types/entities";
import { useProyectos, useProyectosActions } from "@/hooks/useProyectos";
import { useObjetivos } from "@/hooks/useObjetivos";
import { useProcesos } from "@/hooks/useProcesos";
import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EntitySelector } from "@/components/ui/entity-selector";
import { FormError } from "@/components/ui/form-error";
import { HistorialSection } from "@/components/ui/historial-section";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Drawer, DrawerSection, DrawerField, DrawerFooter } from "@/components/ui/drawer";
import { useFormState } from "@/hooks/useFormState";
import { useDeleteConfirm } from "@/hooks/useDeleteConfirm";

interface WorkspaceProjectsProps {
  wsId: WorkspaceId;
}

// ── constants ──────────────────────────────────────────────────────────────────

const ESTADO_OPTIONS = [
  { value: "activo",     label: "Activo" },
  { value: "pausado",    label: "Pausado" },
  { value: "completado", label: "Completado" },
  { value: "cancelado",  label: "Cancelado" },
];

const ESTADO_BADGE: Record<NonNullable<ProyectoEstrategico["estado"]>, BadgeVariant> = {
  activo:     "success",
  pausado:    "warning",
  completado: "success",
  cancelado:  "danger",
};

const ESTADO_LABEL: Record<NonNullable<ProyectoEstrategico["estado"]>, string> = {
  activo:     "Activo",
  pausado:    "Pausado",
  completado: "Completado",
  cancelado:  "Cancelado",
};

const EMPTY_FORM = {
  nombre:               "",
  descripcion:          "",
  objetivoId:           "",
  responsableId:        "",
  estado:               "activo" as NonNullable<ProyectoEstrategico["estado"]>,
  fechaInicio:          "",
  fechaFin:             "",
  presupuesto:          "",
  fuenteFinanciamiento: "",
  riesgos:              "",
  dependencias:         "",
  beneficiosEsperados:  "",
  observaciones:        "",
};

// ── validation ─────────────────────────────────────────────────────────────────

type FormErrors = {
  nombre?:    string;
  objetivoId?: string;
  fechaFin?:  string;
};

function validate(form: typeof EMPTY_FORM): FormErrors {
  const errors: FormErrors = {};
  if (!form.nombre.trim()) {
    errors.nombre = "El nombre del proyecto es obligatorio.";
  }
  if (!form.objetivoId) {
    errors.objetivoId = "Debes seleccionar un objetivo estratégico.";
  }
  if (form.fechaInicio && form.fechaFin && form.fechaFin < form.fechaInicio) {
    errors.fechaFin = "La fecha de fin no puede ser anterior a la de inicio.";
  }
  return errors;
}

// ── ProjectCard ────────────────────────────────────────────────────────────────

function ProjectCard({
  proyecto,
  objetivo,
  procesoCount,
  onEdit,
  onDelete,
  confirmDeleteId,
  onCancelDelete,
  onConfirmDelete,
  canEdit,
}: {
  proyecto:        ProyectoEstrategico;
  objetivo:        ObjetivoEstrategico | undefined;
  procesoCount:    number;
  onEdit:          (p: ProyectoEstrategico) => void;
  onDelete:        (id: string) => void;
  confirmDeleteId: string | null;
  onCancelDelete:  () => void;
  onConfirmDelete: (id: string) => void;
  canEdit:         boolean;
}) {
  const isConfirming  = confirmDeleteId === proyecto.id;
  const estadoVariant = proyecto.estado ? ESTADO_BADGE[proyecto.estado] : "gray";
  const estadoLabel   = proyecto.estado ? ESTADO_LABEL[proyecto.estado] : null;

  return (
    <div className="bg-sse-surface rounded-md border border-sse-border p-4 flex flex-col gap-2">
      {/* Header row: name + estado badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-sse-ink leading-snug">{proyecto.nombre}</p>
          {proyecto.descripcion && (
            <p className="text-[12px] text-sse-muted mt-0.5 line-clamp-2">{proyecto.descripcion}</p>
          )}
        </div>
        {estadoLabel && (
          <Badge variant={estadoVariant}>{estadoLabel}</Badge>
        )}
      </div>

      {/* Linked objective */}
      {objetivo && (
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            className="w-3.5 h-3.5 text-sse-muted shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
          </svg>
          <span className="text-[11px] text-sse-muted truncate">{objetivo.nombre}</span>
        </div>
      )}

      {/* Meta pills: procesos count + presupuesto */}
      {(procesoCount > 0 || (proyecto.presupuesto !== undefined && proyecto.presupuesto !== null)) && (
        <div className="flex items-center gap-3 flex-wrap">
          {procesoCount > 0 && (
            <Badge variant="info">
              {procesoCount} proceso{procesoCount !== 1 ? "s" : ""}
            </Badge>
          )}
          {proyecto.presupuesto !== undefined && proyecto.presupuesto !== null && (
            <span className="text-[11px] font-medium text-sse-ink">
              ${proyecto.presupuesto.toLocaleString("es-SV")}
            </span>
          )}
        </div>
      )}

      {/* Responsable */}
      {proyecto.responsableId && (
        <p className="text-[11px] text-sse-muted">
          Responsable: {proyecto.responsableId}
        </p>
      )}

      {/* Date range */}
      {(proyecto.fechaInicio || proyecto.fechaFin) && (
        <div className="flex items-center gap-2 flex-wrap text-[11px] text-sse-muted">
          {proyecto.fechaInicio && (
            <span>Inicio: {new Date(proyecto.fechaInicio).toLocaleDateString("es-SV")}</span>
          )}
          {proyecto.fechaInicio && proyecto.fechaFin && (
            <span className="text-sse-border" aria-hidden>·</span>
          )}
          {proyecto.fechaFin && (
            <span>Fin: {new Date(proyecto.fechaFin).toLocaleDateString("es-SV")}</span>
          )}
        </div>
      )}

      {/* Footer: id + action buttons */}
      <div className="flex items-center justify-between mt-1 pt-2 border-t border-sse-border">
        <span className="text-[10px] font-mono text-sse-muted truncate">{proyecto.id}</span>
        {canEdit && (
          <div className="flex items-center gap-1 shrink-0">
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

// ── main component ─────────────────────────────────────────────────────────────

export function WorkspaceProjects({ wsId }: WorkspaceProjectsProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing]       = useState<ProyectoEstrategico | null>(null);

  const { form, errors, setField, reset, validate: validateForm } = useFormState(EMPTY_FORM, validate);
  const { confirmId: confirmDeleteId, requestDelete, cancelDelete, confirmDelete } =
    useDeleteConfirm((id) => actions.remove.mutateAsync(id));

  const { data: proyectos, isLoading: loadingProy } = useProyectos({ unidadId: wsId });
  const { data: objetivos }                          = useObjetivos();
  const { data: procesos }                           = useProcesos({ unidadId: wsId });
  const actions                                      = useProyectosActions();
  const { hasPermission }                            = usePermissions();
  const canEdit                                      = hasPermission("process.edit");

  const objetivoMap: Record<string, ObjetivoEstrategico> = {};
  (objetivos ?? []).forEach((o) => { objetivoMap[o.id] = o; });
  const objetivoOptions = (objetivos ?? []).map((o) => ({ value: o.id, label: o.nombre }));

  function getProcesoCount(proyectoId: string): number {
    return (procesos ?? []).filter((p) => p.proyectoId === proyectoId).length;
  }

  // ── handlers ────────────────────────────────────────────────────────────────

  function openCreate() {
    setEditing(null);
    reset(EMPTY_FORM);
    setDrawerOpen(true);
  }

  function openEdit(p: ProyectoEstrategico) {
    setEditing(p);
    reset({
      nombre:               p.nombre,
      descripcion:          p.descripcion          ?? "",
      objetivoId:           p.objetivoId,
      responsableId:        p.responsableId        ?? "",
      estado:               p.estado               ?? "activo",
      fechaInicio:          p.fechaInicio          ?? "",
      fechaFin:             p.fechaFin             ?? "",
      presupuesto:          p.presupuesto !== undefined ? String(p.presupuesto) : "",
      fuenteFinanciamiento: p.fuenteFinanciamiento ?? "",
      riesgos:              p.riesgos              ?? "",
      dependencias:         p.dependencias         ?? "",
      beneficiosEsperados:  p.beneficiosEsperados  ?? "",
      observaciones:        p.observaciones        ?? "",
    });
    setDrawerOpen(true);
  }

  async function handleSave() {
    if (!validateForm()) return;

    const payload = {
      ...form,
      unidadId:    wsId,
      presupuesto: form.presupuesto ? Number(form.presupuesto) : undefined,
    };
    if (editing) {
      await actions.update.mutateAsync({ id: editing.id, patch: payload });
    } else {
      await actions.create.mutateAsync(payload as Partial<ProyectoEstrategico>);
    }
    setDrawerOpen(false);
  }

  const isPending = actions.create.isPending || actions.update.isPending;

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-semibold text-sse-ink">Proyectos estratégicos</h1>
          {!loadingProy && proyectos && proyectos.length > 0 && (
            <p className="text-[12px] text-sse-muted mt-0.5">
              {proyectos.length} proyecto{proyectos.length !== 1 ? "s" : ""} en esta unidad
            </p>
          )}
        </div>
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

      {/* Loading skeletons */}
      {loadingProy && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-[150px] rounded-md" />)}
        </div>
      )}

      {/* Empty state */}
      {!loadingProy && (!proyectos || proyectos.length === 0) && (
        <EmptyState
          icon="M6 3v6M6 15v6M18 3v18M6 9a3 3 0 0 0 3 3h6"
          title="Sin proyectos"
          description="Esta unidad no tiene proyectos estratégicos registrados."
          action={canEdit
            ? <Button size="sm" onClick={openCreate}>Crear primer proyecto</Button>
            : undefined
          }
        />
      )}

      {/* Card grid */}
      {!loadingProy && proyectos && proyectos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {proyectos.map((proy) => (
            <ProjectCard
              key={proy.id}
              proyecto={proy}
              objetivo={objetivoMap[proy.objetivoId]}
              procesoCount={getProcesoCount(proy.id)}
              onEdit={openEdit}
              onDelete={requestDelete}
              confirmDeleteId={confirmDeleteId}
              onCancelDelete={cancelDelete}
              onConfirmDelete={confirmDelete}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}

      {/* Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? "Editar proyecto" : "Nuevo proyecto estratégico"}
        width="lg"
        footer={
          <DrawerFooter
            onCancel={() => setDrawerOpen(false)}
            onSave={handleSave}
            isPending={isPending}
            isEditing={!!editing}
          />
        }
      >
        {/* Sección 1 — Identificación */}
        <DrawerSection title="Identificación">
          <DrawerField label="Objetivo estratégico vinculado" required>
            {objetivoOptions.length > 0 ? (
              <Select
                value={form.objetivoId}
                onValueChange={(v) => setField("objetivoId", v)}
                options={objetivoOptions}
                placeholder="Seleccionar objetivo…"
              />
            ) : (
              <p className="text-[12px] text-sse-muted">
                No hay objetivos registrados. Crea un objetivo primero.
              </p>
            )}
            <FormError message={errors.objetivoId} />
          </DrawerField>

          <DrawerField label="Nombre del proyecto" required>
            <Input
              value={form.nombre}
              onChange={(e) => setField("nombre", e.target.value)}
              placeholder="Ej. Modernización del sistema académico"
            />
            <FormError message={errors.nombre} />
          </DrawerField>

          <DrawerField label="Estado">
            <Select
              value={form.estado}
              onValueChange={(v) =>
                setField("estado", v as NonNullable<ProyectoEstrategico["estado"]>)
              }
              options={ESTADO_OPTIONS}
            />
          </DrawerField>

          <DrawerField label="Responsable">
            <EntitySelector
              entityType="usuarios"
              value={form.responsableId}
              onValueChange={(v) => setField("responsableId", v)}
              placeholder="Seleccionar responsable…"
              allowEmpty
            />
          </DrawerField>
        </DrawerSection>

        {/* Sección 2 — Planificación */}
        <DrawerSection title="Planificación">
          <DrawerField label="Descripción">
            <Textarea
              value={form.descripcion}
              onChange={(e) => setField("descripcion", e.target.value)}
              rows={3}
              placeholder="Descripción del proyecto…"
            />
          </DrawerField>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <DrawerField label="Fecha inicio">
              <Input
                type="date"
                value={form.fechaInicio}
                onChange={(e) => setField("fechaInicio", e.target.value)}
              />
            </DrawerField>
            <DrawerField label="Fecha fin">
              <Input
                type="date"
                value={form.fechaFin}
                onChange={(e) => setField("fechaFin", e.target.value)}
              />
              <FormError message={errors.fechaFin} />
            </DrawerField>
          </div>

          <DrawerField label="Presupuesto (USD)">
            <Input
              type="number"
              value={form.presupuesto}
              onChange={(e) => setField("presupuesto", e.target.value)}
              placeholder="0.00"
            />
          </DrawerField>

          <DrawerField label="Fuente de financiamiento">
            <Input
              value={form.fuenteFinanciamiento}
              onChange={(e) => setField("fuenteFinanciamiento", e.target.value)}
              placeholder="Ej. Fondos propios, donación internacional…"
            />
          </DrawerField>

          <DrawerField label="Beneficios esperados">
            <Textarea
              value={form.beneficiosEsperados}
              onChange={(e) => setField("beneficiosEsperados", e.target.value)}
              rows={3}
              placeholder="Describe los beneficios esperados del proyecto…"
            />
          </DrawerField>
        </DrawerSection>

        {/* Sección 3 — Contexto */}
        <DrawerSection title="Contexto">
          <DrawerField label="Riesgos identificados">
            <Textarea
              value={form.riesgos}
              onChange={(e) => setField("riesgos", e.target.value)}
              rows={3}
              placeholder="Describe los riesgos identificados…"
            />
          </DrawerField>

          <DrawerField label="Dependencias">
            <Textarea
              value={form.dependencias}
              onChange={(e) => setField("dependencias", e.target.value)}
              rows={3}
              placeholder="Describe las dependencias del proyecto…"
            />
          </DrawerField>

          <DrawerField label="Observaciones">
            <Textarea
              value={form.observaciones}
              onChange={(e) => setField("observaciones", e.target.value)}
              rows={3}
              placeholder="Observaciones adicionales…"
            />
          </DrawerField>

          {editing && (
            <DrawerField label="Historial de cambios">
              <HistorialSection historial={editing.historial} />
            </DrawerField>
          )}
        </DrawerSection>
      </Drawer>
    </div>
  );
}
