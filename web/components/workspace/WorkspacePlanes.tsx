"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { PlanEstrategico, EstadoPlan, TipoPlan } from "@/types/entities";
import { usePlanes, usePlanesActions } from "@/hooks/usePlanes";
import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EntitySelector } from "@/components/ui/entity-selector";
import { Progress } from "@/components/ui/progress";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Drawer, DrawerSection, DrawerField } from "@/components/ui/drawer";
import { cn, fmtShortDate } from "@/lib/utils";

// ── helpers ──────────────────────────────────────────────────────────────────

const ESTADO_VARIANT: Record<EstadoPlan, BadgeVariant> = {
  borrador:  "gray",
  revision:  "warning",
  aprobado:  "success",
  vigente:   "success",
  cerrado:   "default",
};

const ESTADO_LABEL: Record<EstadoPlan, string> = {
  borrador:  "Borrador",
  revision:  "En revisión",
  aprobado:  "Aprobado",
  vigente:   "Vigente",
  cerrado:   "Cerrado",
};

const TIPO_LABEL: Record<string, string> = {
  estrategico: "Estratégico",
  operativo:   "Operativo",
  mejora:      "Mejora",
  accion:      "Acción",
};

function avanceColor(pct: number): "success" | "warning" | "danger" {
  if (pct >= 70) return "success";
  if (pct >= 40) return "warning";
  return "danger";
}

// ── Plan card ─────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  onEdit,
  onDelete,
  confirmDeleteId,
  onCancelDelete,
  onConfirmDelete,
  canEdit,
}: {
  plan: PlanEstrategico;
  onEdit: (plan: PlanEstrategico) => void;
  onDelete: (id: string) => void;
  confirmDeleteId: string | null;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
  canEdit: boolean;
}) {
  const estado = plan.estado as EstadoPlan;
  const isConfirming = confirmDeleteId === plan.id;

  return (
    <div className="bg-sse-surface rounded-md border border-sse-border p-4 flex flex-col gap-3 hover:border-sse-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-sse-ink leading-snug line-clamp-2">
            {plan.nombre}
          </p>
          <p className="text-[11px] text-sse-muted mt-0.5">
            {TIPO_LABEL[plan.tipo] ?? plan.tipo}
          </p>
        </div>
        <Badge variant={ESTADO_VARIANT[estado]} className="shrink-0 text-[10px]">
          {ESTADO_LABEL[estado] ?? estado}
        </Badge>
      </div>

      {plan.descripcion && (
        <p className="text-[12px] text-sse-muted line-clamp-2">{plan.descripcion}</p>
      )}

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-sse-muted">Avance</span>
          <span className="text-[11px] font-semibold text-sse-ink">{plan.avancePct ?? 0}%</span>
        </div>
        <Progress value={plan.avancePct ?? 0} color={avanceColor(plan.avancePct ?? 0)} />
      </div>

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

// ── Filter bar ────────────────────────────────────────────────────────────────

const ESTADOS: Array<{ value: EstadoPlan | "todos"; label: string }> = [
  { value: "todos",    label: "Todos" },
  { value: "vigente",  label: "Vigentes" },
  { value: "revision", label: "En revisión" },
  { value: "borrador", label: "Borradores" },
  { value: "cerrado",  label: "Cerrados" },
];

const TIPO_OPTIONS = [
  { value: "estrategico", label: "Estratégico" },
  { value: "operativo",   label: "Operativo" },
  { value: "mejora",      label: "Mejora" },
  { value: "accion",      label: "Acción" },
];

const ESTADO_OPTIONS = [
  { value: "borrador",  label: "Borrador" },
  { value: "revision",  label: "En revisión" },
  { value: "aprobado",  label: "Aprobado" },
  { value: "vigente",   label: "Vigente" },
  { value: "cerrado",   label: "Cerrado" },
];

// ── empty form state ──────────────────────────────────────────────────────────

const EMPTY_FORM = {
  nombre: "",
  tipo: "estrategico" as TipoPlan,
  estado: "borrador" as EstadoPlan,
  periodoInicio: "",
  periodoFin: "",
  descripcion: "",
  responsableId: "",
};

// ── Main component ────────────────────────────────────────────────────────────

interface WorkspacePlanesProps {
  wsId: WorkspaceId;
}

export function WorkspacePlanes({ wsId }: WorkspacePlanesProps) {
  const [estadoFilter, setEstadoFilter] = useState<EstadoPlan | "todos">("todos");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<PlanEstrategico | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: planes, isLoading } = usePlanes({ wsId });
  const actions = usePlanesActions();
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("process.edit");

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
    setForm(EMPTY_FORM);
    setDrawerOpen(true);
  }

  function openEdit(plan: PlanEstrategico) {
    setEditing(plan);
    setForm({
      nombre:        plan.nombre,
      tipo:          plan.tipo,
      estado:        plan.estado,
      periodoInicio: plan.periodoInicio ?? "",
      periodoFin:    plan.periodoFin ?? "",
      descripcion:   plan.descripcion ?? "",
      responsableId: plan.responsableId ?? "",
    });
    setDrawerOpen(true);
  }

  async function handleSave() {
    const payload = {
      ...form,
      wsId,
      avancePct: editing?.avancePct ?? 0,
    };
    if (editing) {
      await actions.update.mutateAsync({ id: editing.id, patch: payload });
    } else {
      await actions.create.mutateAsync(payload as Partial<PlanEstrategico>);
    }
    setDrawerOpen(false);
  }

  async function handleConfirmDelete(id: string) {
    await actions.remove.mutateAsync(id);
    setConfirmDeleteId(null);
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              className="w-3.5 h-3.5">
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
              <div key={e} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-sse-border bg-sse-surface text-[11px]">
                <span className="font-semibold text-sse-ink">{resumen[e]}</span>
                <span className="text-sse-muted">{ESTADO_LABEL[e]}</span>
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
          {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} className="h-[200px]" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          title="Sin planes"
          description={
            estadoFilter === "todos"
              ? "Esta unidad no tiene planes registrados."
              : `No hay planes en estado "${ESTADO_LABEL[estadoFilter as EstadoPlan]}".`
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

      {/* Create / Edit Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? "Editar plan" : "Nuevo plan"}
        subtitle={editing ? editing.nombre : "Registra un nuevo plan institucional"}
        width="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.nombre || isPending}>
              {isPending ? "Guardando…" : editing ? "Guardar cambios" : "Crear plan"}
            </Button>
          </>
        }
      >
        <DrawerSection>
          <DrawerField label="Nombre del plan" required>
            <Input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej. Plan Estratégico Institucional 2024-2028"
            />
          </DrawerField>

          <DrawerField label="Tipo" required>
            <Select
              value={form.tipo}
              onValueChange={(v) => setForm({ ...form, tipo: v as TipoPlan })}
              options={TIPO_OPTIONS}
            />
          </DrawerField>

          <DrawerField label="Estado" required>
            <Select
              value={form.estado}
              onValueChange={(v) => setForm({ ...form, estado: v as EstadoPlan })}
              options={ESTADO_OPTIONS}
            />
          </DrawerField>

          <div className="grid grid-cols-2 gap-3">
            <DrawerField label="Inicio del período">
              <Input
                type="date"
                value={form.periodoInicio}
                onChange={(e) => setForm({ ...form, periodoInicio: e.target.value })}
              />
            </DrawerField>
            <DrawerField label="Fin del período">
              <Input
                type="date"
                value={form.periodoFin}
                onChange={(e) => setForm({ ...form, periodoFin: e.target.value })}
              />
            </DrawerField>
          </div>

          <DrawerField label="Descripción">
            <Textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows={3}
              placeholder="Descripción o alcance del plan…"
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
        </DrawerSection>
      </Drawer>
    </div>
  );
}
