"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type {
  PlanEstrategico,
  EstadoPlan,
  TipoPlan,
  ObjetivoEstrategico,
  ProyectoEstrategico,
} from "@/types/entities";
import { usePlanes, usePlanesActions } from "@/hooks/usePlanes";
import { useObjetivos } from "@/hooks/useObjetivos";
import { useProyectos } from "@/hooks/useProyectos";
import { usePermissions } from "@/hooks/usePermissions";
import { useFormState } from "@/hooks/useFormState";
import { useDeleteConfirm } from "@/hooks/useDeleteConfirm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EntitySelector } from "@/components/ui/entity-selector";
import { FormError } from "@/components/ui/form-error";
import { HistorialSection } from "@/components/ui/historial-section";
import { Progress } from "@/components/ui/progress";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Drawer, DrawerSection, DrawerField, DrawerFooter } from "@/components/ui/drawer";
import { cn, fmtShortDate } from "@/lib/utils";
import {
  ESTADO_PLAN_BADGE,
  ESTADO_PLAN_LABEL,
  TIPO_PLAN_LABEL,
  TIPO_PLAN_OPTIONS,
  avanceColor,
} from "@/lib/catalogs";

// ── Plan card ─────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  objetivos,
  proyectos,
  onEdit,
  onDelete,
  confirmDeleteId,
  onCancelDelete,
  onConfirmDelete,
  canEdit,
}: {
  plan: PlanEstrategico;
  objetivos: ObjetivoEstrategico[];
  proyectos: ProyectoEstrategico[];
  onEdit: (plan: PlanEstrategico) => void;
  onDelete: (id: string) => void;
  confirmDeleteId: string | null;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
  canEdit: boolean;
}) {
  const estado = plan.estado as EstadoPlan;
  const isConfirming = confirmDeleteId === plan.id;

  const objetivosCount = objetivos.filter((o) => o.planId === plan.id).length;
  const proyectosCount = proyectos.filter((p) =>
    objetivos.some((o) => o.planId === plan.id && o.id === p.objetivoId),
  ).length;

  return (
    <div className="bg-sse-surface rounded-md border border-sse-border p-4 flex flex-col gap-3 hover:border-sse-primary/40 transition-colors">
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {(plan.codigo || plan.version) && (
            <p className="text-[10px] text-sse-muted font-mono mb-0.5">
              {plan.codigo ?? ""}
              {plan.codigo && plan.version ? " · " : ""}
              {plan.version ? `v${plan.version}` : ""}
            </p>
          )}
          <p className="text-[13px] font-semibold text-sse-ink leading-snug line-clamp-2">
            {plan.nombre}
          </p>
          <p className="text-[11px] text-sse-muted mt-0.5">
            {TIPO_PLAN_LABEL[plan.tipo] ?? plan.tipo}
          </p>
          {plan.responsableId && (
            <p className="text-[11px] text-sse-muted mt-0.5 truncate">
              {plan.responsableId}
            </p>
          )}
        </div>
        <Badge variant={ESTADO_PLAN_BADGE[estado]} className="shrink-0 text-[10px]">
          {ESTADO_PLAN_LABEL[estado] ?? estado}
        </Badge>
      </div>

      {/* Description */}
      {plan.descripcion && (
        <p className="text-[12px] text-sse-muted line-clamp-2">{plan.descripcion}</p>
      )}

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-sse-muted">Avance</span>
          <span className="text-[11px] font-semibold text-sse-ink">{plan.avancePct ?? 0}%</span>
        </div>
        <Progress value={plan.avancePct ?? 0} color={avanceColor(plan.avancePct ?? 0)} />
      </div>

      {/* Related counts */}
      <div className="flex gap-4 text-[11px] text-sse-muted">
        <span>
          <span className="font-semibold text-sse-ink">{objetivosCount}</span>{" "}
          {objetivosCount === 1 ? "objetivo" : "objetivos"}
        </span>
        <span>
          <span className="font-semibold text-sse-ink">{proyectosCount}</span>{" "}
          {proyectosCount === 1 ? "proyecto" : "proyectos"}
        </span>
      </div>

      {/* Footer: period + actions */}
      <div className="flex items-center justify-between text-[11px] text-sse-muted">
        <span>
          {plan.periodoInicio ? fmtShortDate(plan.periodoInicio) : "—"}
          {" — "}
          {plan.periodoFin ? fmtShortDate(plan.periodoFin) : "—"}
        </span>
        {canEdit && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(plan)}
              className="px-2 py-0.5 rounded text-[11px] text-sse-primary hover:bg-sse-pill-blue-bg"
            >
              Editar
            </button>
            {isConfirming ? (
              <span className="flex items-center gap-1">
                <button
                  onClick={() => onConfirmDelete(plan.id)}
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
              </span>
            ) : (
              <button
                onClick={() => onDelete(plan.id)}
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

// ── Filter bar options ────────────────────────────────────────────────────────

const ESTADOS: Array<{ value: EstadoPlan | "todos"; label: string }> = [
  { value: "todos",    label: "Todos" },
  { value: "vigente",  label: "Vigentes" },
  { value: "revision", label: "En revisión" },
  { value: "borrador", label: "Borradores" },
  { value: "cerrado",  label: "Cerrados" },
];

const ESTADO_OPTIONS = [
  { value: "borrador",  label: "Borrador" },
  { value: "revision",  label: "En revisión" },
  { value: "aprobado",  label: "Aprobado" },
  { value: "vigente",   label: "Vigente" },
  { value: "cerrado",   label: "Cerrado" },
];

// ── Empty form state ──────────────────────────────────────────────────────────

const EMPTY_FORM = {
  codigo:          "",
  nombre:          "",
  version:         "",
  tipo:            "estrategico" as TipoPlan,
  estado:          "borrador" as EstadoPlan,
  periodoInicio:   "",
  periodoFin:      "",
  fechaAprobacion: "",
  fechaRevision:   "",
  responsableId:   "",
  documentoUrl:    "",
  descripcion:     "",
  observaciones:   "",
};

type FormState = typeof EMPTY_FORM;

// ── Validation ────────────────────────────────────────────────────────────────

function validateForm(form: FormState): Record<string, string> {
  const errs: Record<string, string> = {};
  if (!form.nombre.trim()) {
    errs.nombre = "El nombre del plan es requerido.";
  }
  if (!form.tipo) {
    errs.tipo = "El tipo es requerido.";
  }
  if (!form.estado) {
    errs.estado = "El estado es requerido.";
  }
  if (form.periodoFin && form.periodoInicio && form.periodoFin < form.periodoInicio) {
    errs.periodoFin = "La fecha de fin no puede ser anterior a la fecha de inicio.";
  }
  return errs;
}

// ── Main component ────────────────────────────────────────────────────────────

interface WorkspacePlanesProps {
  wsId: WorkspaceId;
}

export function WorkspacePlanes({ wsId }: WorkspacePlanesProps) {
  const [estadoFilter, setEstadoFilter] = useState<EstadoPlan | "todos">("todos");
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [editing, setEditing]           = useState<PlanEstrategico | null>(null);

  const { form, errors, setField, reset, validate } = useFormState(EMPTY_FORM, validateForm);
  const actions = usePlanesActions();
  const { confirmId: confirmDeleteId, requestDelete, cancelDelete, confirmDelete } =
    useDeleteConfirm((id) => actions.remove.mutateAsync(id));

  const { data: planes,    isLoading: planesLoading }    = usePlanes({ wsId });
  const { data: objetivos, isLoading: objetivosLoading } = useObjetivos();
  const { data: proyectos, isLoading: proyectosLoading } = useProyectos({ unidadId: wsId });
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("process.edit");

  const isLoading = planesLoading || objetivosLoading || proyectosLoading;

  const filtered = (planes ?? []).filter((p) =>
    estadoFilter === "todos" ? true : p.estado === estadoFilter,
  );

  const resumen = (planes ?? []).reduce(
    (acc, p) => {
      const e = p.estado as EstadoPlan;
      acc[e] = (acc[e] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<EstadoPlan, number>>,
  );

  function openCreate() {
    setEditing(null);
    reset(EMPTY_FORM);
    setDrawerOpen(true);
  }

  function openEdit(plan: PlanEstrategico) {
    setEditing(plan);
    reset({
      codigo:          plan.codigo          ?? "",
      nombre:          plan.nombre,
      version:         plan.version         ?? "",
      tipo:            plan.tipo,
      estado:          plan.estado,
      periodoInicio:   plan.periodoInicio   ?? "",
      periodoFin:      plan.periodoFin      ?? "",
      fechaAprobacion: plan.fechaAprobacion ?? "",
      fechaRevision:   plan.fechaRevision   ?? "",
      responsableId:   plan.responsableId   ?? "",
      documentoUrl:    plan.documentoUrl    ?? "",
      descripcion:     plan.descripcion     ?? "",
      observaciones:   plan.observaciones   ?? "",
    });
    setDrawerOpen(true);
  }

  async function handleSave() {
    if (!validate()) return;
    const payload: Partial<PlanEstrategico> = {
      ...form,
      wsId,
      avancePct: editing?.avancePct ?? 0,
    };
    if (editing) {
      await actions.update.mutateAsync({ id: editing.id, patch: payload });
    } else {
      await actions.create.mutateAsync(payload);
    }
    setDrawerOpen(false);
  }

  const isPending = actions.create.isPending || actions.update.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Planes Institucionales</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">
            Planes estratégicos, operativos y de mejora de la unidad
          </p>
        </div>
        {canEdit && (
          <Button size="sm" variant="primary" onClick={openCreate}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-3.5 h-3.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo plan
          </Button>
        )}
      </div>

      {/* Summary chips */}
      {!isLoading && planes && planes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(["vigente", "revision", "borrador", "cerrado"] as EstadoPlan[]).map((e) =>
            resumen[e] ? (
              <div
                key={e}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-sse-border bg-sse-surface text-[11px]"
              >
                <span className="font-semibold text-sse-ink">{resumen[e]}</span>
                <span className="text-sse-muted">{ESTADO_PLAN_LABEL[e]}</span>
              </div>
            ) : null,
          )}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex gap-1.5 flex-wrap">
        {ESTADOS.map((e) => (
          <button
            key={e.value}
            onClick={() => setEstadoFilter(e.value)}
            className={cn(
              "px-3 py-1 rounded-full text-[12px] font-medium border transition-colors",
              estadoFilter === e.value
                ? "bg-sse-primary text-white border-sse-primary"
                : "bg-sse-surface text-sse-muted border-sse-border hover:border-sse-primary/40",
            )}
          >
            {e.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} className="h-[220px]" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          title="Sin planes"
          description={
            estadoFilter === "todos"
              ? "Esta unidad no tiene planes registrados."
              : `No hay planes en estado "${ESTADO_PLAN_LABEL[estadoFilter as EstadoPlan]}".`
          }
          action={
            canEdit && estadoFilter === "todos" ? (
              <Button size="sm" onClick={openCreate}>Crear primer plan</Button>
            ) : undefined
          }
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              objetivos={objetivos ?? []}
              proyectos={proyectos ?? []}
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

      {/* Create / Edit Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? "Editar plan" : "Nuevo plan"}
        subtitle={editing ? editing.nombre : "Registra un nuevo plan institucional"}
        width="lg"
        footer={
          <DrawerFooter
            onCancel={() => setDrawerOpen(false)}
            onSave={handleSave}
            isPending={isPending}
            isEditing={!!editing}
            saveLabel={isPending ? "Guardando…" : editing ? "Guardar cambios" : "Crear plan"}
          />
        }
      >
        {/* ── Identificación ─────────────────────────────────────────────── */}
        <DrawerSection title="Identificación" className="border-b border-sse-border">
          <div className="grid grid-cols-2 gap-3">
            <DrawerField label="Código del plan">
              <Input
                value={form.codigo}
                onChange={(e) => setField("codigo", e.target.value)}
                placeholder="Ej. PEI-2024"
              />
            </DrawerField>
            <DrawerField label="Versión">
              <Input
                value={form.version}
                onChange={(e) => setField("version", e.target.value)}
                placeholder="Ej. 1.0"
              />
            </DrawerField>
          </div>

          <DrawerField label="Nombre del plan" required>
            <Input
              value={form.nombre}
              onChange={(e) => setField("nombre", e.target.value)}
              placeholder="Ej. Plan Estratégico Institucional 2024-2028"
            />
            <FormError message={errors.nombre} />
          </DrawerField>
        </DrawerSection>

        {/* ── Clasificación ──────────────────────────────────────────────── */}
        <DrawerSection title="Clasificación" className="border-b border-sse-border">
          <div className="grid grid-cols-2 gap-3">
            <DrawerField label="Tipo" required>
              <Select
                value={form.tipo}
                onValueChange={(v) => setField("tipo", v as TipoPlan)}
                options={TIPO_PLAN_OPTIONS}
              />
              <FormError message={errors.tipo} />
            </DrawerField>

            <DrawerField label="Estado" required>
              <Select
                value={form.estado}
                onValueChange={(v) => setField("estado", v as EstadoPlan)}
                options={ESTADO_OPTIONS}
              />
              <FormError message={errors.estado} />
            </DrawerField>
          </div>
        </DrawerSection>

        {/* ── Período ────────────────────────────────────────────────────── */}
        <DrawerSection title="Período" className="border-b border-sse-border">
          <div className="grid grid-cols-2 gap-3">
            <DrawerField label="Inicio del período">
              <Input
                type="date"
                value={form.periodoInicio}
                onChange={(e) => setField("periodoInicio", e.target.value)}
              />
            </DrawerField>
            <DrawerField label="Fin del período">
              <Input
                type="date"
                value={form.periodoFin}
                onChange={(e) => setField("periodoFin", e.target.value)}
              />
              <FormError message={errors.periodoFin} />
            </DrawerField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DrawerField label="Fecha de aprobación">
              <Input
                type="date"
                value={form.fechaAprobacion}
                onChange={(e) => setField("fechaAprobacion", e.target.value)}
              />
            </DrawerField>
            <DrawerField label="Fecha de revisión">
              <Input
                type="date"
                value={form.fechaRevision}
                onChange={(e) => setField("fechaRevision", e.target.value)}
              />
            </DrawerField>
          </div>
        </DrawerSection>

        {/* ── Responsable ────────────────────────────────────────────────── */}
        <DrawerSection title="Responsable" className="border-b border-sse-border">
          <DrawerField label="Responsable del plan">
            <EntitySelector
              entityType="usuarios"
              value={form.responsableId}
              onValueChange={(v) => setField("responsableId", v)}
              placeholder="Seleccionar responsable…"
              allowEmpty
            />
          </DrawerField>
        </DrawerSection>

        {/* ── Documento ──────────────────────────────────────────────────── */}
        <DrawerSection title="Documento oficial" className="border-b border-sse-border">
          <DrawerField label="URL del documento">
            <Input
              value={form.documentoUrl}
              onChange={(e) => setField("documentoUrl", e.target.value)}
              placeholder="https://…"
            />
          </DrawerField>
        </DrawerSection>

        {/* ── Descripción ────────────────────────────────────────────────── */}
        <DrawerSection title="Descripción" className="border-b border-sse-border">
          <DrawerField label="Descripción o alcance">
            <Textarea
              value={form.descripcion}
              onChange={(e) => setField("descripcion", e.target.value)}
              rows={3}
              placeholder="Descripción o alcance del plan…"
            />
          </DrawerField>
        </DrawerSection>

        {/* ── Observaciones ──────────────────────────────────────────────── */}
        <DrawerSection
          title="Observaciones"
          className={editing ? "border-b border-sse-border" : ""}
        >
          <DrawerField label="Observaciones adicionales">
            <Textarea
              value={form.observaciones}
              onChange={(e) => setField("observaciones", e.target.value)}
              rows={3}
              placeholder="Notas u observaciones sobre el plan…"
            />
          </DrawerField>
        </DrawerSection>

        {/* ── Historial (edit only) ──────────────────────────────────────── */}
        {editing && (
          <DrawerSection title="Historial">
            <HistorialSection
              historial={editing.historial}
              createdAt={editing.createdAt}
              updatedAt={editing.updatedAt}
            />
          </DrawerSection>
        )}
      </Drawer>
    </div>
  );
}
