"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { ObjetivoEstrategico } from "@/types/entities";
import { useObjetivos, useObjetivosActions } from "@/hooks/useObjetivos";
import { usePlanes } from "@/hooks/usePlanes";
import { useProyectos } from "@/hooks/useProyectos";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Drawer, DrawerSection, DrawerField } from "@/components/ui/drawer";
import { FormError } from "@/components/ui/form-error";
import { HistorialSection } from "@/components/ui/historial-section";
import { EntitySelector } from "@/components/ui/entity-selector";

interface WorkspaceObjectivesProps {
  wsId: WorkspaceId;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ESTADO_OPTIONS = [
  { value: "borrador",   label: "Borrador" },
  { value: "vigente",    label: "Vigente" },
  { value: "completado", label: "Completado" },
  { value: "cancelado",  label: "Cancelado" },
];

const PRIORIDAD_OPTIONS = [
  { value: "baja",    label: "Baja" },
  { value: "media",   label: "Media" },
  { value: "alta",    label: "Alta" },
  { value: "critica", label: "Crítica" },
];

const ESTADO_BADGE: Record<NonNullable<ObjetivoEstrategico["estado"]>, BadgeVariant> = {
  borrador:   "gray",
  vigente:    "success",
  completado: "info",
  cancelado:  "danger",
};

const ESTADO_LABEL: Record<NonNullable<ObjetivoEstrategico["estado"]>, string> = {
  borrador:   "Borrador",
  vigente:    "Vigente",
  completado: "Completado",
  cancelado:  "Cancelado",
};

const PRIORIDAD_BADGE: Record<NonNullable<ObjetivoEstrategico["prioridad"]>, BadgeVariant> = {
  baja:    "gray",
  media:   "info",
  alta:    "warning",
  critica: "danger",
};

const PRIORIDAD_LABEL: Record<NonNullable<ObjetivoEstrategico["prioridad"]>, string> = {
  baja:    "Baja",
  media:   "Media",
  alta:    "Alta",
  critica: "Crítica",
};

// ── Empty form state ──────────────────────────────────────────────────────────

const EMPTY_FORM = {
  planId:           "",
  nombre:           "",
  estado:           "borrador" as NonNullable<ObjetivoEstrategico["estado"]>,
  prioridad:        "media"    as NonNullable<ObjetivoEstrategico["prioridad"]>,
  descripcion:      "",
  resultadoEsperado:"",
  justificacion:    "",
  metaGeneral:      "",
  fechaObjetivo:    "",
  responsableId:    "",
  observaciones:    "",
};

// ── Row component ─────────────────────────────────────────────────────────────

function ObjetivoRow({
  objetivo,
  proyectoCount,
  onEdit,
  onDelete,
  confirmDeleteId,
  onCancelDelete,
  onConfirmDelete,
  canEdit,
}: {
  objetivo: ObjetivoEstrategico;
  proyectoCount: number;
  onEdit: (obj: ObjetivoEstrategico) => void;
  onDelete: (id: string) => void;
  confirmDeleteId: string | null;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
  canEdit: boolean;
}) {
  const isConfirming = confirmDeleteId === objetivo.id;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-sse-border last:border-b-0">
      <span className="shrink-0 mt-0.5 inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-mono font-semibold bg-sse-pill-blue-bg text-sse-pill-blue-fg">
        {objetivo.id}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-sse-ink leading-snug">{objetivo.nombre}</p>
        {objetivo.descripcion && (
          <p className="text-[12px] text-sse-muted mt-0.5 line-clamp-2">{objetivo.descripcion}</p>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-2 flex-wrap justify-end">
        {objetivo.estado && (
          <Badge variant={ESTADO_BADGE[objetivo.estado]}>
            {ESTADO_LABEL[objetivo.estado]}
          </Badge>
        )}
        {objetivo.prioridad && (
          <Badge variant={PRIORIDAD_BADGE[objetivo.prioridad]}>
            {PRIORIDAD_LABEL[objetivo.prioridad]}
          </Badge>
        )}
        <Badge variant={proyectoCount > 0 ? "info" : "gray"}>
          {proyectoCount} {proyectoCount === 1 ? "proyecto" : "proyectos"}
        </Badge>
        {canEdit && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(objetivo)}
              className="px-2 py-0.5 rounded text-[11px] text-sse-primary hover:bg-sse-pill-blue-bg"
            >
              Editar
            </button>
            {isConfirming ? (
              <>
                <button
                  onClick={() => onConfirmDelete(objetivo.id)}
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
                onClick={() => onDelete(objetivo.id)}
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

// ── Main component ────────────────────────────────────────────────────────────

export function WorkspaceObjectives({ wsId }: WorkspaceObjectivesProps) {
  const [drawerOpen, setDrawerOpen]       = useState(false);
  const [editing, setEditing]             = useState<ObjetivoEstrategico | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [errors, setErrors]               = useState<Partial<Record<keyof typeof EMPTY_FORM, string>>>({});

  const { data: objetivos, isLoading } = useObjetivos();
  const { data: planes }               = usePlanes({ wsId });
  const { data: proyectos }            = useProyectos({ unidadId: wsId });
  const actions                        = useObjetivosActions();
  const { hasPermission }              = usePermissions();
  const canEdit                        = hasPermission("process.edit");

  const planOptions = (planes ?? []).map((p) => ({ value: p.id, label: p.nombre }));

  // ── Helpers ────────────────────────────────────────────────────────────────

  function countProyectos(objetivoId: string): number {
    return (proyectos ?? []).filter((p) => p.objetivoId === objetivoId).length;
  }

  function patch<K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.nombre.trim()) next.nombre = "El nombre es obligatorio.";
    if (!form.planId)        next.planId  = "Debe seleccionar un plan estratégico.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // ── Open / close ───────────────────────────────────────────────────────────

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, planId: planOptions[0]?.value ?? "" });
    setErrors({});
    setDrawerOpen(true);
  }

  function openEdit(obj: ObjetivoEstrategico) {
    setEditing(obj);
    setForm({
      planId:            obj.planId,
      nombre:            obj.nombre,
      estado:            obj.estado     ?? "borrador",
      prioridad:         obj.prioridad  ?? "media",
      descripcion:       obj.descripcion       ?? "",
      resultadoEsperado: obj.resultadoEsperado ?? "",
      justificacion:     obj.justificacion     ?? "",
      metaGeneral:       obj.metaGeneral       ?? "",
      fechaObjetivo:     obj.fechaObjetivo     ?? "",
      responsableId:     obj.responsableId     ?? "",
      observaciones:     obj.observaciones     ?? "",
    });
    setErrors({});
    setDrawerOpen(true);
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!validate()) return;

    const payload: Partial<ObjetivoEstrategico> = {
      planId:            form.planId,
      nombre:            form.nombre.trim(),
      estado:            form.estado,
      prioridad:         form.prioridad,
      descripcion:       form.descripcion       || undefined,
      resultadoEsperado: form.resultadoEsperado || undefined,
      justificacion:     form.justificacion     || undefined,
      metaGeneral:       form.metaGeneral       || undefined,
      fechaObjetivo:     form.fechaObjetivo     || undefined,
      responsableId:     form.responsableId     || undefined,
      observaciones:     form.observaciones     || undefined,
    };

    if (editing) {
      await actions.update.mutateAsync({ id: editing.id, patch: payload });
    } else {
      await actions.create.mutateAsync(payload);
    }
    setDrawerOpen(false);
  }

  async function handleConfirmDelete(id: string) {
    await actions.remove.mutateAsync(id);
    setConfirmDeleteId(null);
  }

  const isPending = actions.create.isPending || actions.update.isPending;
  const canSave   = !!form.nombre.trim() && !!form.planId && !isPending;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-semibold text-sse-ink">Objetivos estratégicos</h1>
        <div className="flex items-center gap-2">
          {objetivos && (
            <span className="text-[12px] text-sse-muted">
              {objetivos.length} objetivo{objetivos.length !== 1 ? "s" : ""}
            </span>
          )}
          {canEdit && (
            <Button size="sm" variant="primary" onClick={openCreate}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo objetivo
            </Button>
          )}
        </div>
      </div>

      {/* Card list */}
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
              action={canEdit
                ? <Button size="sm" onClick={openCreate}>Crear primer objetivo</Button>
                : undefined
              }
            />
          )}

          {!isLoading && objetivos && objetivos.length > 0 && (
            <div>
              {objetivos.map((obj) => (
                <ObjetivoRow
                  key={obj.id}
                  objetivo={obj}
                  proyectoCount={countProyectos(obj.id)}
                  onEdit={openEdit}
                  onDelete={(id) => setConfirmDeleteId(id)}
                  confirmDeleteId={confirmDeleteId}
                  onCancelDelete={() => setConfirmDeleteId(null)}
                  onConfirmDelete={handleConfirmDelete}
                  canEdit={canEdit}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-[12px] text-sse-muted">
        Los objetivos estratégicos son compartidos entre todas las unidades.
      </p>

      {/* Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? "Editar objetivo" : "Nuevo objetivo estratégico"}
        width="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!canSave}>
              {isPending ? "Guardando…" : editing ? "Guardar cambios" : "Crear objetivo"}
            </Button>
          </>
        }
      >
        <DrawerSection>
          {/* Plan vinculado */}
          <DrawerField label="Plan vinculado" required>
            {planOptions.length > 0 ? (
              <Select
                value={form.planId}
                onValueChange={(v) => patch("planId", v)}
                options={planOptions}
                placeholder="Seleccionar plan…"
              />
            ) : (
              <p className="text-[12px] text-sse-muted">Sin planes registrados en esta unidad.</p>
            )}
            <FormError message={errors.planId} />
          </DrawerField>

          {/* Nombre */}
          <DrawerField label="Nombre del objetivo" required>
            <Input
              value={form.nombre}
              onChange={(e) => patch("nombre", e.target.value)}
              placeholder="Ej. Fortalecer la gestión académica"
            />
            <FormError message={errors.nombre} />
          </DrawerField>

          {/* Estado + Prioridad side-by-side */}
          <div className="grid grid-cols-2 gap-3">
            <DrawerField label="Estado">
              <Select
                value={form.estado}
                onValueChange={(v) => patch("estado", v as NonNullable<ObjetivoEstrategico["estado"]>)}
                options={ESTADO_OPTIONS}
              />
            </DrawerField>
            <DrawerField label="Prioridad">
              <Select
                value={form.prioridad}
                onValueChange={(v) => patch("prioridad", v as NonNullable<ObjetivoEstrategico["prioridad"]>)}
                options={PRIORIDAD_OPTIONS}
              />
            </DrawerField>
          </div>

          {/* Descripción */}
          <DrawerField label="Descripción">
            <Textarea
              value={form.descripcion}
              onChange={(e) => patch("descripcion", e.target.value)}
              rows={3}
              placeholder="Descripción del objetivo estratégico…"
            />
          </DrawerField>

          {/* Resultado esperado */}
          <DrawerField label="Resultado esperado">
            <Textarea
              value={form.resultadoEsperado}
              onChange={(e) => patch("resultadoEsperado", e.target.value)}
              rows={2}
              placeholder="Resultado concreto al lograr este objetivo…"
            />
          </DrawerField>

          {/* Justificación */}
          <DrawerField label="Justificación">
            <Textarea
              value={form.justificacion}
              onChange={(e) => patch("justificacion", e.target.value)}
              rows={2}
              placeholder="Por qué este objetivo es prioritario…"
            />
          </DrawerField>

          {/* Meta general */}
          <DrawerField label="Meta general">
            <Input
              value={form.metaGeneral}
              onChange={(e) => patch("metaGeneral", e.target.value)}
              placeholder="Ej. Lograr 85% de eficiencia"
            />
          </DrawerField>

          {/* Fecha objetivo */}
          <DrawerField label="Fecha objetivo">
            <Input
              type="date"
              value={form.fechaObjetivo}
              onChange={(e) => patch("fechaObjetivo", e.target.value)}
            />
          </DrawerField>

          {/* Responsable */}
          <DrawerField label="Responsable">
            <EntitySelector
              entityType="usuarios"
              value={form.responsableId}
              onValueChange={(v) => patch("responsableId", v)}
              placeholder="Seleccionar responsable…"
              allowEmpty
            />
          </DrawerField>

          {/* Observaciones */}
          <DrawerField label="Observaciones">
            <Textarea
              value={form.observaciones}
              onChange={(e) => patch("observaciones", e.target.value)}
              rows={2}
              placeholder="Notas u observaciones adicionales…"
            />
          </DrawerField>

          {/* Historial — only when editing */}
          {editing && (
            <DrawerField label="Historial">
              <HistorialSection historial={editing.historial} />
            </DrawerField>
          )}
        </DrawerSection>
      </Drawer>
    </div>
  );
}
