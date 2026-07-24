"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { ProcesoInstitucional, SemaforoColor, EstadoProceso } from "@/types/entities";
import type { ProcessInstance } from "@/types/workflow";
import { useProcesos, useProcesosActions } from "@/hooks/useProcesos";
import { useProcessInstances } from "@/hooks/useWorkflow";
import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Drawer, DrawerSection, DrawerField } from "@/components/ui/drawer";
import { cn, fmtShortDate } from "@/lib/utils";
import { WORKFLOW_STATE_LABEL, WORKFLOW_STATE_VARIANT } from "@/lib/workflowStateConfig";

// ── workflow instances section ────────────────────────────────────────────────

import Link from "next/link";

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
        <p className="text-[10px] text-sse-muted">
          {fmtShortDate(instance.updatedAt)}
        </p>
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
  amarillo: "bg-[#E5A100]",
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

// ── row ───────────────────────────────────────────────────────────────────────

function ProcesoRow({
  proceso,
  onEdit,
  onDelete,
  confirmDeleteId,
  onCancelDelete,
  onConfirmDelete,
  canEdit,
}: {
  proceso: ProcesoInstitucional;
  onEdit: (p: ProcesoInstitucional) => void;
  onDelete: (id: string) => void;
  confirmDeleteId: string | null;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
  canEdit: boolean;
}) {
  const days = daysDiff(proceso.fechaLimite);
  const isConfirming = confirmDeleteId === proceso.id;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-sse-border last:border-b-0">
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

const EMPTY_FORM = {
  nombre: "",
  tipo: "operativo" as ProcesoInstitucional["tipo"],
  objetivo: "",
  alcance: "",
  responsableId: "",
  estado: "borrador" as EstadoProceso,
  prioridad: "media" as ProcesoInstitucional["prioridad"],
  fechaInicio: "",
  fechaLimite: "",
  slaDias: "30",
};

export function WorkspaceProcesses({ wsId }: WorkspaceProcessesProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ProcesoInstitucional | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("process.create");
  const { data: procesos, isLoading, isError } = useProcesos({ unidadId: wsId });
  const actions = useProcesosActions();

  const tabsWithCounts = TABS.map((t) => ({
    ...t,
    badge:
      t.id !== "todos" && procesos
        ? filterProcesos(procesos, t.id).length
        : undefined,
  }));

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDrawerOpen(true);
  }

  function openEdit(p: ProcesoInstitucional) {
    setEditing(p);
    setForm({
      nombre:       p.nombre,
      tipo:         p.tipo,
      objetivo:     p.objetivo,
      alcance:      p.alcance,
      responsableId: p.responsableId,
      estado:       p.estado,
      prioridad:    p.prioridad,
      fechaInicio:  p.fechaInicio ?? "",
      fechaLimite:  p.fechaLimite ?? "",
      slaDias:      String(p.slaDias ?? 30),
    });
    setDrawerOpen(true);
  }

  async function handleSave() {
    const payload = {
      ...form,
      unidadId: wsId,
      slaDias: Number(form.slaDias),
      avancePct: editing?.avancePct ?? 0,
      semaforo: editing?.semaforo ?? "verde" as SemaforoColor,
      deletedAt: null,
    };
    if (editing) {
      await actions.update.mutateAsync({ id: editing.id, patch: payload });
    } else {
      await actions.create.mutateAsync(payload as Partial<ProcesoInstitucional>);
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
      <ActiveInstances wsId={wsId} />

      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-semibold text-sse-ink">Procesos</h1>
        {canEdit && (
          <Button size="sm" variant="primary" onClick={openCreate}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo proceso
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}
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
                    onEdit={openEdit}
                    onDelete={(id) => setConfirmDeleteId(id)}
                    confirmDeleteId={confirmDeleteId}
                    onCancelDelete={() => setConfirmDeleteId(null)}
                    onConfirmDelete={handleConfirmDelete}
                    canEdit={canEdit}
                  />
                ))}
              </div>
            );
          }}
        </Tabs>
      )}

      {/* Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? "Editar proceso" : "Nuevo proceso"}
        width="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.nombre || isPending}>
              {isPending ? "Guardando…" : editing ? "Guardar cambios" : "Crear proceso"}
            </Button>
          </>
        }
      >
        <DrawerSection>
          <DrawerField label="Nombre del proceso" required>
            <Input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej. Gestión de matrículas"
            />
          </DrawerField>

          <div className="grid grid-cols-2 gap-3">
            <DrawerField label="Tipo" required>
              <Select
                value={form.tipo}
                onValueChange={(v) => setForm({ ...form, tipo: v as ProcesoInstitucional["tipo"] })}
                options={TIPO_OPTIONS}
              />
            </DrawerField>
            <DrawerField label="Prioridad" required>
              <Select
                value={form.prioridad}
                onValueChange={(v) => setForm({ ...form, prioridad: v as ProcesoInstitucional["prioridad"] })}
                options={PRIORIDAD_OPTIONS}
              />
            </DrawerField>
          </div>

          <DrawerField label="Estado" required>
            <Select
              value={form.estado}
              onValueChange={(v) => setForm({ ...form, estado: v as EstadoProceso })}
              options={ESTADO_OPTIONS}
            />
          </DrawerField>

          <DrawerField label="Objetivo">
            <Input
              value={form.objetivo}
              onChange={(e) => setForm({ ...form, objetivo: e.target.value })}
              placeholder="Objetivo del proceso…"
            />
          </DrawerField>

          <DrawerField label="Alcance">
            <Input
              value={form.alcance}
              onChange={(e) => setForm({ ...form, alcance: e.target.value })}
              placeholder="Alcance del proceso…"
            />
          </DrawerField>

          <DrawerField label="Responsable (ID)">
            <Input
              value={form.responsableId}
              onChange={(e) => setForm({ ...form, responsableId: e.target.value })}
              placeholder="ID del responsable…"
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
            <DrawerField label="Fecha límite">
              <Input
                type="date"
                value={form.fechaLimite}
                onChange={(e) => setForm({ ...form, fechaLimite: e.target.value })}
              />
            </DrawerField>
          </div>

          <DrawerField label="SLA (días)">
            <Input
              type="number"
              value={form.slaDias}
              onChange={(e) => setForm({ ...form, slaDias: e.target.value })}
              placeholder="30"
            />
          </DrawerField>
        </DrawerSection>
      </Drawer>
    </div>
  );
}
