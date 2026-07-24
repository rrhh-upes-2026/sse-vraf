"use client";

import { useState } from "react";
import Link from "next/link";
import type { WorkspaceId } from "@/config/nav";
import type { Indicador, SemaforoColor } from "@/types/entities";
import { useIndicadores, useIndicadoresActions } from "@/hooks/useIndicadores";
import { useICEMyIndicators, useICEPeriods, useICECapturas } from "@/hooks/useICE";
import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import { EntitySelector } from "@/components/ui/entity-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Drawer, DrawerSection, DrawerField, DrawerFooter } from "@/components/ui/drawer";
import { useFormState } from "@/hooks/useFormState";
import { useDeleteConfirm } from "@/hooks/useDeleteConfirm";
import { FormError } from "@/components/ui/form-error";
import { HistorialSection } from "@/components/ui/historial-section";
import { SparklineChart } from "@/components/ui/sparkline-chart";
import { cn, fmtDate } from "@/lib/utils";
import {
  SEMAFORO_DOT,
  SEMAFORO_TEXT,
  SEMAFORO_BADGE,
  FRECUENCIA_LABEL,
  FRECUENCIA_OPTIONS,
} from "@/lib/catalogs";

interface WorkspaceIndicatorsProps {
  wsId: WorkspaceId;
}

// ── helpers ──────────────────────────────────────────────────────────────────

const SEMAPHORE_COLOR: Record<SemaforoColor, string> = {
  verde:    "#16A34A",
  amarillo: "#E5A100",
  rojo:     "#DC2626",
};

const CATEGORIA_OPTIONS = [
  { value: "gestion",    label: "Gestión" },
  { value: "desempeno",  label: "Desempeño" },
];

const SENTIDO_OPTIONS = [
  { value: "mayor_mejor", label: "Mayor es mejor" },
  { value: "menor_mejor", label: "Menor es mejor" },
  { value: "neutro",      label: "Neutro" },
];

// ── trend icon ────────────────────────────────────────────────────────────────

function TrendIcon({ tendencia }: { tendencia: Indicador["tendencia"] }) {
  if (tendencia === "sube") {
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-sse-sem-green-fg">
        <path fillRule="evenodd"
          d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
          clipRule="evenodd" />
      </svg>
    );
  }
  if (tendencia === "baja") {
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-sse-sem-red-fg">
        <path fillRule="evenodd"
          d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
          clipRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-sse-muted">
      <path fillRule="evenodd" d="M18 10a1 1 0 01-1 1H3a1 1 0 110-2h14a1 1 0 011 1z" clipRule="evenodd" />
    </svg>
  );
}

// ── card ──────────────────────────────────────────────────────────────────────

function IndicadorCard({
  indicador,
  onEdit,
  onDelete,
  confirmDeleteId,
  onCancelDelete,
  onConfirmDelete,
  canEdit,
}: {
  indicador: Indicador;
  onEdit: (ind: Indicador) => void;
  onDelete: (id: string) => void;
  confirmDeleteId: string | null;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
  canEdit: boolean;
}) {
  const pct =
    indicador.meta > 0 ? Math.round((indicador.valorActual / indicador.meta) * 100) : 0;
  const isConfirming = confirmDeleteId === indicador.id;

  return (
    <div className="bg-sse-surface rounded-md border border-sse-border p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-sse-ink leading-snug">{indicador.nombre}</p>
          <p className="text-[11px] text-sse-muted mt-0.5 capitalize">{indicador.categoria}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <TrendIcon tendencia={indicador.tendencia} />
          <Badge variant={SEMAFORO_BADGE[indicador.semaforo]}>
            <span className={cn("w-1.5 h-1.5 rounded-full", SEMAFORO_DOT[indicador.semaforo])} />
            {indicador.semaforo}
          </Badge>
        </div>
      </div>

      <div className="flex items-end gap-2">
        <span className={cn("text-[26px] font-bold leading-none", SEMAFORO_TEXT[indicador.semaforo])}>
          {indicador.valorActual}
        </span>
        <span className="text-[12px] text-sse-muted mb-0.5">{indicador.unidadMedida}</span>
      </div>

      <div className="space-y-1">
        <div className="h-2 w-full rounded-full bg-sse-border overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", SEMAFORO_DOT[indicador.semaforo])}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-sse-muted">
            meta: <span className="font-medium text-sse-ink">{indicador.meta} {indicador.unidadMedida}</span>
          </span>
          <span className="text-[11px] font-semibold text-sse-ink">{pct}%</span>
        </div>
      </div>

      {indicador.capturas && indicador.capturas.length >= 2 && (
        <SparklineChart
          data={indicador.capturas.map((c) => ({ fecha: c.fecha, valor: c.valor }))}
          meta={indicador.meta}
          color={SEMAPHORE_COLOR[indicador.semaforo]}
          height={36}
          width={120}
        />
      )}

      <div className="flex items-center justify-between pt-1 border-t border-sse-border">
        <Badge variant="gray">{FRECUENCIA_LABEL[indicador.frecuencia]}</Badge>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-sse-muted">
            {fmtDate(indicador.ultimaActualizacion)}
          </span>
          {canEdit && (
            <>
              <button
                onClick={() => onEdit(indicador)}
                className="ml-2 px-2 py-0.5 rounded text-[11px] text-sse-primary hover:bg-sse-pill-blue-bg"
              >
                Editar
              </button>
              {isConfirming ? (
                <>
                  <button
                    onClick={() => onConfirmDelete(indicador.id)}
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
                  onClick={() => onDelete(indicador.id)}
                  className="px-2 py-0.5 rounded text-[11px] text-sse-muted hover:text-sse-sem-red-fg hover:bg-sse-sem-red-bg"
                >
                  Eliminar
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── capture quick-actions bar ─────────────────────────────────────────────────

function CaptureBar({ wsId }: { wsId: string }) {
  const { data: myItems } = useICEMyIndicators();
  const { data: openPeriods } = useICEPeriods({ estado: "abierto" });
  const { data: pending } = useICECapturas({ status: "enviada" });

  const pendingCount = myItems?.filter(
    (i) => !i.captura || i.captura.status === "borrador" || i.captura.status === "rechazada"
  ).length ?? 0;

  return (
    <div className="rounded-xl border border-sse-border bg-sse-surface p-4">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-sse-ink">Captura de indicadores</p>
          <p className="text-[11px] text-sse-muted mt-0.5">
            {openPeriods?.length ? `${openPeriods.length} período${openPeriods.length > 1 ? "s" : ""} abierto${openPeriods.length > 1 ? "s" : ""}` : "Sin períodos abiertos"}
            {pendingCount > 0 && <> · <span className="text-amber-600 font-medium">{pendingCount} pendiente{pendingCount > 1 ? "s" : ""} de captura</span></>}
          </p>
        </div>
        {pending && pending.length > 0 && (
          <span className="text-[10px] font-medium rounded-full px-2.5 py-0.5 bg-amber-100 text-amber-700">
            {pending.length} en revisión
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={`/ws/${wsId}/ice-capturar`}
          className="text-[11px] px-3 py-1.5 rounded-md bg-sky-600 text-white hover:bg-sky-700 font-medium">
          + Capturar
        </Link>
        <Link href={`/ws/${wsId}/ice-mis-indicadores`}
          className="text-[11px] px-3 py-1.5 rounded-md border border-sse-border text-sse-ink hover:bg-sse-hover">
          Mis indicadores
        </Link>
        <Link href={`/ws/${wsId}/ice-historial`}
          className="text-[11px] px-3 py-1.5 rounded-md border border-sse-border text-sse-ink hover:bg-sse-hover">
          Historial
        </Link>
        <Link href={`/ws/${wsId}/ice-aprobaciones`}
          className="text-[11px] px-3 py-1.5 rounded-md border border-sse-border text-sse-ink hover:bg-sse-hover">
          Aprobaciones
        </Link>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  nombre: "",
  descripcion: "",
  categoria: "gestion" as Indicador["categoria"],
  formula: "",
  unidadMedida: "",
  meta: "0",
  valorActual: "0",
  frecuencia: "mensual" as Indicador["frecuencia"],
  responsableId: "",
  fuenteInformacion: "",
  procesoId: "",
  sentido: "mayor_mejor" as "mayor_mejor" | "menor_mejor" | "neutro",
  lineaBase: "",
  observaciones: "",
};

function validateIndicator(form: typeof EMPTY_FORM): Partial<Record<keyof typeof EMPTY_FORM, string>> {
  const errs: Partial<Record<keyof typeof EMPTY_FORM, string>> = {};
  if (!form.nombre.trim()) errs.nombre = "El nombre es requerido";
  if (!form.unidadMedida.trim()) errs.unidadMedida = "La unidad de medida es requerida";
  const metaNum = Number(form.meta);
  if (form.meta === "" || isNaN(metaNum) || metaNum < 0) {
    errs.meta = "La meta debe ser un número mayor o igual a 0";
  }
  return errs;
}

export function WorkspaceIndicators({ wsId }: WorkspaceIndicatorsProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing]       = useState<Indicador | null>(null);

  const { form, errors, setField, reset, validate } = useFormState(EMPTY_FORM, validateIndicator);

  const { data: indicadores, isLoading } = useIndicadores();
  const actions = useIndicadoresActions();

  const { confirmId: confirmDeleteId, requestDelete, cancelDelete, confirmDelete } =
    useDeleteConfirm((id) => actions.remove.mutateAsync(id));
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("indicator.edit");

  const semStats = (indicadores ?? []).reduce(
    (acc, ind) => {
      acc[ind.semaforo] = (acc[ind.semaforo] ?? 0) + 1;
      return acc;
    },
    {} as Record<SemaforoColor, number>,
  );

  function openCreate() {
    setEditing(null);
    reset(EMPTY_FORM);
    setDrawerOpen(true);
  }

  function openEdit(ind: Indicador) {
    setEditing(ind);
    reset({
      nombre:            ind.nombre,
      descripcion:       ind.descripcion,
      categoria:         ind.categoria,
      formula:           ind.formula,
      unidadMedida:      ind.unidadMedida,
      meta:              String(ind.meta),
      valorActual:       String(ind.valorActual),
      frecuencia:        ind.frecuencia,
      responsableId:     ind.responsableId,
      fuenteInformacion: ind.fuenteInformacion,
      procesoId:         ind.procesoId,
      sentido:           ind.sentido ?? "mayor_mejor",
      lineaBase:         String(ind.lineaBase ?? ""),
      observaciones:     ind.observaciones ?? "",
    });
    setDrawerOpen(true);
  }

  async function handleSave() {
    if (!validate()) return;
    const now = new Date().toISOString();
    const payload = {
      ...form,
      meta:                Number(form.meta),
      valorActual:         Number(form.valorActual),
      sentido:             form.sentido,
      lineaBase:           Number(form.lineaBase) || undefined,
      observaciones:       form.observaciones,
      semaforo:            editing?.semaforo ?? "verde" as SemaforoColor,
      tendencia:           editing?.tendencia ?? "estable" as Indicador["tendencia"],
      ultimaActualizacion: now,
      objetivo:            editing?.objetivo ?? "",
      dashboardDestino:    editing?.dashboardDestino ?? "",
      reporteDestino:      editing?.reporteDestino ?? "",
    };
    if (editing) {
      await actions.update.mutateAsync({ id: editing.id, patch: payload });
    } else {
      await actions.create.mutateAsync(payload as Partial<Indicador>);
    }
    setDrawerOpen(false);
  }

  const isPending = actions.create.isPending || actions.update.isPending;

  return (
    <div className="space-y-4">
      <CaptureBar wsId={wsId} />

      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-semibold text-sse-ink">Estado de indicadores</h1>
        <div className="flex items-center gap-3">
          {indicadores && indicadores.length > 0 && (
            <>
              {(["verde", "amarillo", "rojo"] as SemaforoColor[]).map((c) =>
                semStats[c] ? (
                  <div key={c} className="flex items-center gap-1">
                    <span className={cn("w-2 h-2 rounded-full", SEMAFORO_DOT[c])} />
                    <span className="text-[12px] text-sse-muted">{semStats[c]}</span>
                  </div>
                ) : null,
              )}
            </>
          )}
          {canEdit && (
            <Button size="sm" variant="primary" onClick={openCreate}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo indicador
            </Button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[190px] rounded-md" />)}
        </div>
      )}

      {!isLoading && (!indicadores || indicadores.length === 0) && (
        <EmptyState
          icon="M4 20a8 8 0 1 1 16 0M12 14l4-4"
          title="Sin indicadores"
          description="No hay indicadores de gestión configurados."
          action={canEdit ? <Button size="sm" onClick={openCreate}>Crear primer indicador</Button> : undefined}
        />
      )}

      {!isLoading && indicadores && indicadores.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {indicadores.map((ind) => (
            <IndicadorCard
              key={ind.id}
              indicador={ind}
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
        title={editing ? "Editar indicador" : "Nuevo indicador"}
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
        {/* Section 1: Definición */}
        <DrawerSection title="Definición" className="border-b border-sse-border">
          <DrawerField label="Nombre del indicador" required>
            <Input
              value={form.nombre}
              onChange={(e) => setField("nombre", e.target.value)}
              placeholder="Ej. Tasa de aprobación estudiantil"
            />
            <FormError message={errors.nombre} />
          </DrawerField>

          <DrawerField label="Descripción">
            <Textarea
              value={form.descripcion}
              onChange={(e) => setField("descripcion", e.target.value)}
              rows={2}
              placeholder="Descripción del indicador…"
            />
          </DrawerField>

          <div className="grid grid-cols-2 gap-3">
            <DrawerField label="Categoría" required>
              <Select
                value={form.categoria}
                onValueChange={(v) => setField("categoria", v as Indicador["categoria"])}
                options={CATEGORIA_OPTIONS}
              />
            </DrawerField>
            <DrawerField label="Frecuencia" required>
              <Select
                value={form.frecuencia}
                onValueChange={(v) => setField("frecuencia", v as Indicador["frecuencia"])}
                options={FRECUENCIA_OPTIONS}
              />
            </DrawerField>
          </div>
        </DrawerSection>

        {/* Section 2: Fórmula y medición */}
        <DrawerSection title="Fórmula y medición" className="border-b border-sse-border">
          <DrawerField label="Fórmula de cálculo">
            <Input
              value={form.formula}
              onChange={(e) => setField("formula", e.target.value)}
              placeholder="Ej. (Aprobados / Total) * 100"
            />
          </DrawerField>

          <div className="grid grid-cols-3 gap-3">
            <DrawerField label="Unidad de medida" required>
              <Input
                value={form.unidadMedida}
                onChange={(e) => setField("unidadMedida", e.target.value)}
                placeholder="Ej. %"
              />
              <FormError message={errors.unidadMedida} />
            </DrawerField>
            <DrawerField label="Meta">
              <Input
                type="number"
                value={form.meta}
                onChange={(e) => setField("meta", e.target.value)}
                placeholder="0"
              />
              <FormError message={errors.meta} />
            </DrawerField>
            <DrawerField label="Valor actual">
              <Input
                type="number"
                value={form.valorActual}
                onChange={(e) => setField("valorActual", e.target.value)}
                placeholder="0"
              />
            </DrawerField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DrawerField label="Línea base">
              <Input
                type="number"
                value={form.lineaBase}
                onChange={(e) => setField("lineaBase", e.target.value)}
                placeholder="0"
              />
            </DrawerField>
            <DrawerField label="Sentido del indicador">
              <Select
                value={form.sentido}
                onValueChange={(v) => setField("sentido", v as typeof form.sentido)}
                options={SENTIDO_OPTIONS}
              />
            </DrawerField>
          </div>
        </DrawerSection>

        {/* Section 3: Fuente y responsable */}
        <DrawerSection title="Fuente y responsable" className="border-b border-sse-border">
          <DrawerField label="Fuente de información">
            <Input
              value={form.fuenteInformacion}
              onChange={(e) => setField("fuenteInformacion", e.target.value)}
              placeholder="Ej. Sistema académico, reportes mensuales"
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

          <DrawerField label="Proceso vinculado">
            <EntitySelector
              entityType="procesos"
              value={form.procesoId}
              onValueChange={(v) => setField("procesoId", v)}
              placeholder="Seleccionar proceso…"
              allowEmpty
            />
          </DrawerField>
        </DrawerSection>

        {/* Section 4: Observaciones */}
        <DrawerSection title="Observaciones" className={editing ? "border-b border-sse-border" : ""}>
          <DrawerField label="Observaciones">
            <Textarea
              value={form.observaciones}
              onChange={(e) => setField("observaciones", e.target.value)}
              rows={2}
              placeholder="Observaciones adicionales…"
            />
          </DrawerField>
        </DrawerSection>

        {/* Section 5: Historial (edit-only) */}
        {editing && (
          <DrawerSection title="Historial">
            <HistorialSection historial={editing.historial} />
          </DrawerSection>
        )}
      </Drawer>
    </div>
  );
}
