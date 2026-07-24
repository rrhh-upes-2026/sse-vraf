"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { ProcesoInstitucional, SemaforoColor, EstadoProceso } from "@/types/entities";
import type { ProcessInstance } from "@/types/workflow";
import { useProcesos, useProcesosActions } from "@/hooks/useProcesos";
import { useProcessInstances } from "@/hooks/useWorkflow";
import { useProyectos } from "@/hooks/useProyectos";
import { useActividades } from "@/hooks/useActividades";
import { useEvidencias } from "@/hooks/useEvidencias";
import { useSolicitudes } from "@/hooks/useSolicitudes";
import { useIndicadores } from "@/hooks/useIndicadores";
import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import { EntitySelector } from "@/components/ui/entity-selector";
import { FormError } from "@/components/ui/form-error";
import { HistorialSection } from "@/components/ui/historial-section";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Drawer, DrawerSection, DrawerField, DrawerFooter } from "@/components/ui/drawer";
import { useFormState } from "@/hooks/useFormState";
import { useDeleteConfirm } from "@/hooks/useDeleteConfirm";
import { cn, fmtShortDate } from "@/lib/utils";
import { WORKFLOW_STATE_LABEL, WORKFLOW_STATE_VARIANT } from "@/lib/workflowStateConfig";

import Link from "next/link";

// ── workflow instances section ────────────────────────────────────────────────

function InstanceRow({ instance, wsId }: { instance: ProcessInstance; wsId: string }) {
  const label   = WORKFLOW_STATE_LABEL[instance.estado]   ?? instance.estado;
  const variant = WORKFLOW_STATE_VARIANT[instance.estado] ?? "gray";
  const completedStages = instance.stages.filter((s) => s.estado === "completada").length;
  const totalStages = instance.stages.length;
  const pct = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  return (
    <Link
      href={`/ws/${wsId}/procesos/${instance.id}`}
      className="flex items-center gap-3 py-3 border-b border-sse-border last:border-b-0 hover:bg-sse-hover px-1 rounded transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13px] font-medium text-sse-ink truncate">{instance.nombre}</p>
          <Badge variant={variant}>{label}</Badge>
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex-1 max-w-[180px]">
            <Progress value={pct} color={instance.estado === "blocked" ? "danger" : undefined} />
          </div>
          <span className="text-[11px] font-medium text-sse-ink">{pct}%</span>
          <span className="text-[11px] text-sse-muted">
            Etapa {completedStages + 1}/{totalStages}
          </span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[11px] text-sse-muted">{instance.blueprintName}</p>
        <p className="text-[10px] text-sse-muted">{fmtShortDate(instance.updatedAt)}</p>
      </div>
    </Link>
  );
}

function ActiveInstances({ wsId }: { wsId: string }) {
  const { data: instances, isLoading } = useProcessInstances(wsId);
  const active = instances?.filter((i) =>
    ["in_progress", "waiting", "blocked"].includes(i.estado),
  ) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-14 w-full rounded-md" />
      </div>
    );
  }

  if (active.length === 0) return null;

  return (
    <div className="mb-5">
      <h2 className="text-[12px] font-semibold text-sse-muted uppercase tracking-wide mb-2">
        Instancias activas
      </h2>
      <div className="bg-sse-surface rounded-md border border-sse-border px-4">
        {active.map((inst) => (
          <InstanceRow key={inst.id} instance={inst} wsId={wsId} />
        ))}
      </div>
    </div>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────

const SEMAPHORE_DOT: Record<SemaforoColor, string> = {
  verde:    "bg-sse-sem-green-fg",
  amarillo: "bg-sse-sem-amber-fg",
  rojo:     "bg-sse-sem-red-fg",
};

const PRIORIDAD_BADGE = {
  baja:    "default",
  media:   "info",
  alta:    "warning",
  critica: "danger",
} as const;

const ESTADO_LABEL: Record<EstadoProceso, string> = {
  borrador:   "Borrador",
  activo:     "Activo",
  en_riesgo:  "En riesgo",
  completado: "Completado",
  archivado:  "Archivado",
};

function daysDiff(fecha: string) {
  return Math.ceil((new Date(fecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function plural(n: number, singular: string, pluralStr: string): string {
  return `${n} ${n === 1 ? singular : pluralStr}`;
}

// ── row ───────────────────────────────────────────────────────────────────────

interface ProcesoRowCounts {
  actividades: number;
  evidencias: number;
  solicitudes: number;
  indicadores: number;
}

function ProcesoRow({
  proceso,
  counts,
  onEdit,
  onDelete,
  confirmDeleteId,
  onCancelDelete,
  onConfirmDelete,
  canEdit,
}: {
  proceso: ProcesoInstitucional;
  counts: ProcesoRowCounts;
  onEdit: (p: ProcesoInstitucional) => void;
  onDelete: (id: string) => void;
  confirmDeleteId: string | null;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
  canEdit: boolean;
}) {
  const days = daysDiff(proceso.fechaLimite);
  const isConfirming = confirmDeleteId === proceso.id;

  const countBadges = [
    { count: counts.actividades, label: plural(counts.actividades, "actividad", "actividades") },
    { count: counts.evidencias,  label: plural(counts.evidencias,  "evidencia",  "evidencias") },
    { count: counts.solicitudes, label: plural(counts.solicitudes, "solicitud",  "solicitudes") },
    { count: counts.indicadores, label: plural(counts.indicadores, "indicador",  "indicadores") },
  ];

  return (
    <div className="py-3 border-b border-sse-border last:border-b-0">
      <div className="flex items-center gap-3">
        <span className={cn("w-2.5 h-2.5 rounded-full shrink-0 mt-0.5", SEMAPHORE_DOT[proceso.semaforo])} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13px] font-medium text-sse-ink truncate">{proceso.nombre}</p>
            <Badge variant={PRIORIDAD_BADGE[proceso.prioridad]}>
              {proceso.prioridad.charAt(0).toUpperCase() + proceso.prioridad.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex-1 max-w-[180px]">
              <Progress
                value={proceso.avancePct}
                color={
                  proceso.semaforo === "verde"
                    ? "success"
                    : proceso.semaforo === "amarillo"
                    ? "warning"
                    : "danger"
                }
              />
            </div>
            <span className="text-[11px] font-medium text-sse-ink">{proceso.avancePct}%</span>
          </div>

          {/* Count badges */}
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {countBadges.map(({ count, label }) => (
              <span
                key={label}
                className={cn(
                  "inline-flex items-center px-1.5 py-0 rounded text-[10px] font-medium leading-[16px]",
                  count > 0
                    ? "bg-sse-pill-blue-bg text-sse-pill-blue-fg"
                    : "bg-sse-shell-canvas text-sse-muted",
                )}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="text-right shrink-0">
          {days < 0 ? (
            <span className="text-[11px] font-medium text-sse-sem-red-fg block">Vencido</span>
          ) : days <= 7 ? (
            <span className="text-[11px] font-medium text-sse-sem-amber-fg block">{days}d</span>
          ) : (
            <span className="text-[11px] text-sse-muted block">
              {fmtShortDate(proceso.fechaLimite)}
            </span>
          )}
          <span className="text-[10px] text-sse-muted">{ESTADO_LABEL[proceso.estado]}</span>
        </div>

        {canEdit && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(proceso)}
              className="px-2 py-0.5 rounded text-[11px] text-sse-primary hover:bg-sse-pill-blue-bg"
            >
              Editar
            </button>
            {isConfirming ? (
              <>
                <button
                  onClick={() => onConfirmDelete(proceso.id)}
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
                onClick={() => onDelete(proceso.id)}
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

// ── main component ────────────────────────────────────────────────────────────

interface WorkspaceProcessesProps {
  wsId: WorkspaceId;
}

type FilterTab = "todos" | "activos" | "en_riesgo" | "completados";

const TABS = [
  { id: "todos" as FilterTab,       label: "Todos" },
  { id: "activos" as FilterTab,     label: "Activos" },
  { id: "en_riesgo" as FilterTab,   label: "En riesgo" },
  { id: "completados" as FilterTab, label: "Completados" },
];

function filterProcesos(procesos: ProcesoInstitucional[], tab: FilterTab): ProcesoInstitucional[] {
  switch (tab) {
    case "todos":       return procesos;
    case "activos":     return procesos.filter((p) => p.estado === "activo");
    case "en_riesgo":   return procesos.filter((p) => p.estado === "en_riesgo" || p.semaforo === "rojo");
    case "completados": return procesos.filter((p) => p.estado === "completado");
    default:            return procesos;
  }
}

const TIPO_OPTIONS = [
  { value: "estrategico", label: "Estratégico" },
  { value: "misional",    label: "Misional" },
  { value: "apoyo",       label: "Apoyo" },
  { value: "operativo",   label: "Operativo" },
];

const ESTADO_OPTIONS = [
  { value: "borrador",   label: "Borrador" },
  { value: "activo",     label: "Activo" },
  { value: "en_riesgo",  label: "En riesgo" },
  { value: "completado", label: "Completado" },
  { value: "archivado",  label: "Archivado" },
];

const PRIORIDAD_OPTIONS = [
  { value: "baja",    label: "Baja" },
  { value: "media",   label: "Media" },
  { value: "alta",    label: "Alta" },
  { value: "critica", label: "Crítica" },
];

const CRITICIDAD_OPTIONS = [
  { value: "baja",    label: "Baja" },
  { value: "media",   label: "Media" },
  { value: "alta",    label: "Alta" },
  { value: "critica", label: "Crítica" },
];

type FormState = {
  nombre: string;
  tipo: ProcesoInstitucional["tipo"];
  objetivo: string;
  alcance: string;
  responsableId: string;
  proyectoId: string;
  estado: EstadoProceso;
  prioridad: ProcesoInstitucional["prioridad"];
  fechaInicio: string;
  fechaLimite: string;
  slaDias: string;
  area: string;
  criticidad: NonNullable<ProcesoInstitucional["criticidad"]>;
  riesgos: string;
  dependencias: string;
  observaciones: string;
};

const EMPTY_FORM: FormState = {
  nombre:        "",
  tipo:          "operativo",
  objetivo:      "",
  alcance:       "",
  responsableId: "",
  proyectoId:    "",
  estado:        "borrador",
  prioridad:     "media",
  fechaInicio:   "",
  fechaLimite:   "",
  slaDias:       "30",
  area:          "",
  criticidad:    "media",
  riesgos:       "",
  dependencias:  "",
  observaciones: "",
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.nombre.trim()) {
    errors.nombre = "El nombre del proceso es obligatorio.";
  }
  if (!form.proyectoId) {
    errors.proyectoId = "Debe vincular un proyecto.";
  }
  if (!form.tipo) {
    errors.tipo = "Seleccione un tipo de proceso.";
  }
  if (!form.responsableId) {
    errors.responsableId = "Seleccione un responsable.";
  }
  if (!form.fechaLimite) {
    errors.fechaLimite = "La fecha límite es obligatoria.";
  } else if (form.fechaInicio && form.fechaLimite < form.fechaInicio) {
    errors.fechaLimite = "La fecha límite debe ser posterior a la fecha de inicio.";
  }

  return errors;
}

export function WorkspaceProcesses({ wsId }: WorkspaceProcessesProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing]       = useState<ProcesoInstitucional | null>(null);

  const { form, errors, setField, reset, validate } = useFormState(EMPTY_FORM, validateForm);
  const { confirmId: confirmDeleteId, requestDelete, cancelDelete, confirmDelete } =
    useDeleteConfirm((id) => actions.remove.mutateAsync(id));

  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("process.edit");

  const { data: procesos,    isLoading, isError } = useProcesos({ unidadId: wsId });
  const { data: actividades  }                    = useActividades({ unidadId: wsId });
  const { data: evidencias   }                    = useEvidencias();
  const { data: solicitudes  }                    = useSolicitudes({ unidadId: wsId });
  const { data: indicadores  }                    = useIndicadores();

  const actions = useProcesosActions();

  const tabsWithCounts = TABS.map((t) => ({
    ...t,
    badge:
      t.id !== "todos" && procesos
        ? filterProcesos(procesos, t.id).length
        : undefined,
  }));

  function getCounts(procesoId: string): ProcesoRowCounts {
    const actList = actividades ?? [];
    const actIds  = actList.filter((a) => a.procesoId === procesoId).map((a) => a.id);
    return {
      actividades: actIds.length,
      evidencias:  (evidencias  ?? []).filter((e) => actIds.includes(e.actividadId)).length,
      solicitudes: (solicitudes ?? []).filter((s) => s.procesoId === procesoId).length,
      indicadores: (indicadores ?? []).filter((i) => i.procesoId === procesoId).length,
    };
  }

  function openCreate() {
    setEditing(null);
    reset(EMPTY_FORM);
    setDrawerOpen(true);
  }

  function openEdit(p: ProcesoInstitucional) {
    setEditing(p);
    reset({
      nombre:        p.nombre,
      tipo:          p.tipo,
      objetivo:      p.objetivo,
      alcance:       p.alcance,
      responsableId: p.responsableId,
      proyectoId:    p.proyectoId ?? "",
      estado:        p.estado,
      prioridad:     p.prioridad,
      fechaInicio:   p.fechaInicio ?? "",
      fechaLimite:   p.fechaLimite ?? "",
      slaDias:       String(p.slaDias ?? 30),
      area:          p.area ?? "",
      criticidad:    p.criticidad ?? "media",
      riesgos:       p.riesgos ?? "",
      dependencias:  p.dependencias ?? "",
      observaciones: p.observaciones ?? "",
    });
    setDrawerOpen(true);
  }

  async function handleSave() {
    if (!validate()) return;

    const payload: Partial<ProcesoInstitucional> = {
      nombre:        form.nombre.trim(),
      tipo:          form.tipo,
      objetivo:      form.objetivo,
      alcance:       form.alcance,
      responsableId: form.responsableId,
      proyectoId:    form.proyectoId,
      estado:        form.estado,
      prioridad:     form.prioridad,
      fechaInicio:   form.fechaInicio,
      fechaLimite:   form.fechaLimite,
      slaDias:       Number(form.slaDias),
      area:          form.area || undefined,
      criticidad:    form.criticidad,
      riesgos:       form.riesgos || undefined,
      dependencias:  form.dependencias || undefined,
      observaciones: form.observaciones || undefined,
      unidadId:      wsId,
      avancePct:     editing?.avancePct ?? 0,
      semaforo:      editing?.semaforo  ?? ("verde" as SemaforoColor),
      deletedAt:     null,
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
    <div className="space-y-4">
      <ActiveInstances wsId={wsId} />

      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-semibold text-sse-ink">Procesos</h1>
        {canEdit && (
          <Button size="sm" variant="primary" onClick={openCreate}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo proceso
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-md" />)}
        </div>
      )}

      {isError && (
        <p className="text-[13px] text-sse-muted py-4">No se pudieron cargar los procesos.</p>
      )}

      {!isLoading && !isError && procesos && (
        <Tabs tabs={tabsWithCounts} defaultTab="todos">
          {(activeTab) => {
            const filtered = filterProcesos(procesos, activeTab as FilterTab);
            if (filtered.length === 0) {
              return (
                <EmptyState
                  icon="M9 11l3 3 8-8M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9"
                  title="Sin procesos en esta categoría"
                  description="Cambia el filtro para ver otros procesos."
                  action={canEdit && activeTab === "todos" ? (
                    <Button size="sm" onClick={openCreate}>Crear primer proceso</Button>
                  ) : undefined}
                />
              );
            }
            return (
              <div className="bg-sse-surface rounded-md border border-sse-border px-4">
                {filtered.map((p) => (
                  <ProcesoRow
                    key={p.id}
                    proceso={p}
                    counts={getCounts(p.id)}
                    onEdit={openEdit}
                    onDelete={requestDelete}
                    confirmDeleteId={confirmDeleteId}
                    onCancelDelete={cancelDelete}
                    onConfirmDelete={confirmDelete}
                    canEdit={canEdit}
                  />
                ))}
              </div>
            );
          }}
        </Tabs>
      )}

      {/* Drawer — xl width, 4 sections */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? "Editar proceso" : "Nuevo proceso"}
        subtitle={editing ? editing.nombre : "Complete los campos del nuevo proceso institucional"}
        width="xl"
        footer={
          <DrawerFooter
            onCancel={() => setDrawerOpen(false)}
            onSave={handleSave}
            isPending={isPending}
            isEditing={!!editing}
          />
        }
      >
        {/* ── Sección 1: Identificación ─────────────────────────────────── */}
        <DrawerSection title="Identificación">
          <DrawerField label="Proyecto vinculado" required>
            <EntitySelector
              entityType="proyectos"
              value={form.proyectoId}
              onValueChange={(v) => setField("proyectoId", v)}
              query={{ unidadId: wsId }}
              placeholder="Seleccionar proyecto…"
            />
            <FormError message={errors.proyectoId} />
          </DrawerField>

          <DrawerField label="Nombre del proceso" required>
            <Input
              value={form.nombre}
              onChange={(e) => setField("nombre", e.target.value)}
              placeholder="Ej. Gestión de matrículas"
            />
            <FormError message={errors.nombre} />
          </DrawerField>

          <div className="grid grid-cols-2 gap-3">
            <DrawerField label="Tipo" required>
              <Select
                value={form.tipo}
                onValueChange={(v) => setField("tipo", v as ProcesoInstitucional["tipo"])}
                options={TIPO_OPTIONS}
              />
              <FormError message={errors.tipo} />
            </DrawerField>
            <DrawerField label="Área responsable">
              <Input
                value={form.area}
                onChange={(e) => setField("area", e.target.value)}
                placeholder="Ej. Dirección académica"
              />
            </DrawerField>
          </div>
        </DrawerSection>

        {/* ── Sección 2: Planificación ──────────────────────────────────── */}
        <DrawerSection title="Planificación" className="border-t border-sse-border">
          <div className="grid grid-cols-3 gap-3">
            <DrawerField label="Estado">
              <Select
                value={form.estado}
                onValueChange={(v) => setField("estado", v as EstadoProceso)}
                options={ESTADO_OPTIONS}
              />
            </DrawerField>
            <DrawerField label="Prioridad">
              <Select
                value={form.prioridad}
                onValueChange={(v) => setField("prioridad", v as ProcesoInstitucional["prioridad"])}
                options={PRIORIDAD_OPTIONS}
              />
            </DrawerField>
            <DrawerField label="Criticidad">
              <Select
                value={form.criticidad}
                onValueChange={(v) =>
                  setField("criticidad", v as NonNullable<ProcesoInstitucional["criticidad"]>)
                }
                options={CRITICIDAD_OPTIONS}
              />
            </DrawerField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DrawerField label="Fecha inicio">
              <Input
                type="date"
                value={form.fechaInicio}
                onChange={(e) => setField("fechaInicio", e.target.value)}
              />
            </DrawerField>
            <DrawerField label="Fecha límite" required>
              <Input
                type="date"
                value={form.fechaLimite}
                onChange={(e) => setField("fechaLimite", e.target.value)}
              />
              <FormError message={errors.fechaLimite} />
            </DrawerField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DrawerField label="SLA (días)">
              <Input
                type="number"
                value={form.slaDias}
                onChange={(e) => setField("slaDias", e.target.value)}
                placeholder="30"
                min={1}
              />
            </DrawerField>
            <DrawerField label="Responsable" required>
              <EntitySelector
                entityType="usuarios"
                value={form.responsableId}
                onValueChange={(v) => setField("responsableId", v)}
                placeholder="Seleccionar responsable…"
                allowEmpty
              />
              <FormError message={errors.responsableId} />
            </DrawerField>
          </div>
        </DrawerSection>

        {/* ── Sección 3: Descripción ────────────────────────────────────── */}
        <DrawerSection title="Descripción" className="border-t border-sse-border">
          <DrawerField label="Objetivo del proceso">
            <Input
              value={form.objetivo}
              onChange={(e) => setField("objetivo", e.target.value)}
              placeholder="Objetivo principal del proceso…"
            />
          </DrawerField>

          <DrawerField label="Alcance">
            <Input
              value={form.alcance}
              onChange={(e) => setField("alcance", e.target.value)}
              placeholder="Límites y alcance del proceso…"
            />
          </DrawerField>

          <DrawerField label="Riesgos identificados">
            <Textarea
              value={form.riesgos}
              onChange={(e) => setField("riesgos", e.target.value)}
              placeholder="Describa los riesgos asociados al proceso…"
              rows={3}
            />
          </DrawerField>

          <DrawerField label="Dependencias">
            <Textarea
              value={form.dependencias}
              onChange={(e) => setField("dependencias", e.target.value)}
              placeholder="Procesos, sistemas o recursos de los que depende…"
              rows={3}
            />
          </DrawerField>

          <DrawerField label="Observaciones">
            <Textarea
              value={form.observaciones}
              onChange={(e) => setField("observaciones", e.target.value)}
              placeholder="Observaciones adicionales…"
              rows={3}
            />
          </DrawerField>
        </DrawerSection>

        {/* ── Sección 4: Historial (solo al editar) ─────────────────────── */}
        {editing && (
          <DrawerSection title="Historial" className="border-t border-sse-border">
            <HistorialSection
              historial={editing.historial}
              createdAt={editing.createdAt}
              updatedAt={editing.ultimaActualizacion}
            />
          </DrawerSection>
        )}
      </Drawer>
    </div>
  );
}
