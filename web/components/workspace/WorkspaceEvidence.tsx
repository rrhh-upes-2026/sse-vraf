"use client";

import { useState } from "react";
import { toast } from "@/components/ui/toast-system";
import type { WorkspaceId } from "@/config/nav";
import type { Evidencia, TipoEvidencia } from "@/types/entities";
import { useEvidencias, useEvidenciasActions } from "@/hooks/useEvidencias";
import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { EntitySelector } from "@/components/ui/entity-selector";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Drawer, DrawerSection, DrawerField, DrawerFooter } from "@/components/ui/drawer";
import { useFormState } from "@/hooks/useFormState";
import { FormError } from "@/components/ui/form-error";
import { HistorialSection } from "@/components/ui/historial-section";
import { Dropzone } from "@/components/ui/dropzone";
import { fmtShortDate } from "@/lib/utils";
import {
  ESTADO_EVIDENCIA_BADGE,
  ESTADO_EVIDENCIA_LABEL,
  ESTADO_REVISION_BADGE,
  ESTADO_REVISION_LABEL,
  ESTADO_REVISION_OPTIONS,
  TIPO_EVIDENCIA_OPTIONS,
} from "@/lib/catalogs";

interface WorkspaceEvidenceProps {
  wsId: WorkspaceId;
}

// ── helpers ──────────────────────────────────────────────────────────────────

const TIPO_ICON: Record<TipoEvidencia, string> = {
  documento:   "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  formulario:  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  archivo:     "M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  registro:    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  fotografia:  "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z",
  acta:        "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  contrato:    "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  informe:     "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  comprobante: "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z",
  otro:        "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z",
};


function TipoIcon({ tipo }: { tipo: TipoEvidencia }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      className="w-4 h-4 text-sse-muted shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d={TIPO_ICON[tipo]} />
    </svg>
  );
}

// ── row ───────────────────────────────────────────────────────────────────────

function EvidenciaRow({
  evidencia,
  canUpload,
  onUpload,
}: {
  evidencia: Evidencia;
  canUpload: boolean;
  onUpload: (e: Evidencia) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const isVencida = evidencia.fechaVencimiento
    ? evidencia.fechaVencimiento < today
    : false;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-sse-border last:border-b-0">
      <TipoIcon tipo={evidencia.tipo} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13px] font-medium text-sse-ink truncate">{evidencia.nombre}</p>
          <span className="text-[11px] font-mono text-sse-muted">v{evidencia.version}</span>
          {evidencia.obligatoria && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-semibold bg-sse-sem-red-bg text-sse-sem-red-fg">
              Obligatoria
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[11px] text-sse-muted capitalize">{evidencia.tipo}</span>
          {evidencia.fechaCarga && (
            <>
              <span className="text-sse-muted text-[11px]">·</span>
              <span className="text-[11px] text-sse-muted">
                {fmtShortDate(evidencia.fechaCarga)}
              </span>
            </>
          )}
          {evidencia.fechaVencimiento && (
            <>
              <span className="text-sse-muted text-[11px]">·</span>
              <span className={`text-[11px] flex items-center gap-1 ${isVencida ? "text-sse-sem-red-fg font-semibold" : "text-sse-muted"}`}>
                Vence: {fmtShortDate(evidencia.fechaVencimiento)}
                {isVencida && (
                  <span className="inline-flex items-center px-1 py-0.5 rounded-sm text-[9px] font-bold bg-sse-sem-red-bg text-sse-sem-red-fg uppercase">
                    Vencida
                  </span>
                )}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
        {evidencia.estadoRevision && (
          <Badge variant={ESTADO_REVISION_BADGE[evidencia.estadoRevision]}>
            {ESTADO_REVISION_LABEL[evidencia.estadoRevision]}
          </Badge>
        )}
        <Badge variant={ESTADO_EVIDENCIA_BADGE[evidencia.estado]}>
          {ESTADO_EVIDENCIA_LABEL[evidencia.estado]}
        </Badge>
        {canUpload && evidencia.estado === "pendiente" && (
          <Button size="sm" variant="secondary" onClick={() => onUpload(evidencia)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
              className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Cargar
          </Button>
        )}
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

type FilterTab = Evidencia["estado"];

const TABS = [
  { id: "pendiente" as FilterTab, label: "Pendiente" },
  { id: "cargada" as FilterTab,   label: "Cargada" },
  { id: "validada" as FilterTab,  label: "Validada" },
  { id: "rechazada" as FilterTab, label: "Rechazada" },
];

const EMPTY_FORM = {
  nombre: "",
  tipo: "documento" as TipoEvidencia,
  obligatoria: false,
  actividadId: "",
  responsableId: "",
  observaciones: "",
  documentoRelacionadoId: "",
  fechaEmision: "",
  fechaVencimiento: "",
  estadoRevision: "pendiente" as NonNullable<Evidencia["estadoRevision"]>,
  revisorId: "",
  comentariosTexto: "",
  archivoNombre: "",
};

function validateEvidence(form: typeof EMPTY_FORM): Partial<Record<keyof typeof EMPTY_FORM, string>> {
  const errs: Partial<Record<keyof typeof EMPTY_FORM, string>> = {};
  if (!form.nombre.trim()) errs.nombre = "El nombre es obligatorio";
  return errs;
}

export function WorkspaceEvidence({ wsId: _wsId }: WorkspaceEvidenceProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing]       = useState<Evidencia | null>(null);
  const [_selectedFile, setSelectedFile] = useState<File | null>(null);

  const { form, errors, setField, reset, validate } = useFormState(EMPTY_FORM, validateEvidence);

  const { hasPermission } = usePermissions();
  const canUpload = hasPermission("evidence.upload");

  const { data: evidencias, isLoading, isError } = useEvidencias();
  const actions = useEvidenciasActions();

  const tabsWithCounts = TABS.map((t) => ({
    ...t,
    badge: evidencias
      ? evidencias.filter((e) => e.estado === t.id).length
      : undefined,
  }));

  function openCreate() {
    setEditing(null);
    reset(EMPTY_FORM);
    setSelectedFile(null);
    setDrawerOpen(true);
  }

  function openUpload(e: Evidencia) {
    setEditing(e);
    reset({
      nombre:                 e.nombre,
      tipo:                   e.tipo,
      obligatoria:            e.obligatoria,
      actividadId:            e.actividadId,
      responsableId:          e.responsableId,
      observaciones:          e.observaciones ?? "",
      documentoRelacionadoId: e.documentoRelacionadoId ?? "",
      fechaEmision:           e.fechaEmision ?? "",
      fechaVencimiento:       e.fechaVencimiento ?? "",
      estadoRevision:         e.estadoRevision ?? "pendiente",
      revisorId:              e.revisorId ?? "",
      comentariosTexto:       e.comentarios ?? "",
      archivoNombre:          "",
    });
    setSelectedFile(null);
    setDrawerOpen(true);
  }

  async function handleSave() {
    if (!validate()) return;

    try {
      if (editing) {
        await actions.update.mutateAsync({
          id: editing.id,
          patch: {
            nombre: form.nombre,
            tipo: form.tipo,
            obligatoria: form.obligatoria,
            actividadId: form.actividadId,
            responsableId: form.responsableId,
            observaciones: form.observaciones,
            estado: "cargada",
            version: editing.version + 1,
            fechaCarga: new Date().toISOString(),
            documentoRelacionadoId: form.documentoRelacionadoId,
            fechaEmision: form.fechaEmision,
            fechaVencimiento: form.fechaVencimiento,
            estadoRevision: form.estadoRevision,
            revisorId: form.revisorId,
            comentarios: form.comentariosTexto,
          },
        });
        toast.success("Evidencia actualizada correctamente.");
      } else {
        await actions.create.mutateAsync({
          nombre: form.nombre,
          tipo: form.tipo,
          obligatoria: form.obligatoria,
          actividadId: form.actividadId,
          responsableId: form.responsableId,
          observaciones: form.observaciones,
          documentoRelacionadoId: form.documentoRelacionadoId,
          fechaEmision: form.fechaEmision,
          fechaVencimiento: form.fechaVencimiento,
          estadoRevision: form.estadoRevision,
          revisorId: form.revisorId,
          comentarios: form.comentariosTexto,
          estado: "pendiente",
          version: 1,
        } as Partial<Evidencia>);
        toast.success("Evidencia registrada correctamente.");
      }
      setDrawerOpen(false);
    } catch {
      toast.error("No se pudo guardar la evidencia. Verifique su conexión e intente nuevamente.");
    }
  }

  const isPending = actions.create.isPending || actions.update.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-semibold text-sse-ink">Evidencias</h1>
        {canUpload && (
          <Button size="sm" variant="primary" onClick={openCreate}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Cargar evidencia
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}
        </div>
      )}

      {isError && (
        <p className="text-[13px] text-sse-muted py-4">No se pudieron cargar las evidencias.</p>
      )}

      {!isLoading && !isError && evidencias && (
        <Tabs tabs={tabsWithCounts} defaultTab="pendiente">
          {(activeTab) => {
            const filtered = evidencias.filter((e) => e.estado === activeTab);
            if (filtered.length === 0) {
              return (
                <EmptyState
                  icon="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  title="Sin evidencias"
                  description="No hay evidencias en esta categoría."
                  action={canUpload && activeTab === "pendiente" ? (
                    <Button size="sm" onClick={openCreate}>Registrar evidencia</Button>
                  ) : undefined}
                />
              );
            }
            return (
              <div className="bg-sse-surface rounded-md border border-sse-border px-4">
                {filtered.map((e) => (
                  <EvidenciaRow key={e.id} evidencia={e} canUpload={canUpload} onUpload={openUpload} />
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
        title={editing ? "Actualizar evidencia" : "Nueva evidencia"}
        subtitle={editing ? `Actualizando: ${editing.nombre}` : undefined}
        width="lg"
        footer={
          <DrawerFooter
            onCancel={() => setDrawerOpen(false)}
            onSave={handleSave}
            isPending={isPending}
            saveLabel={isPending ? "Guardando…" : editing ? "Actualizar" : "Registrar"}
          />
        }
      >
        {/* Section 1 — Identificación */}
        <DrawerSection title="Identificación">
          <DrawerField label="Nombre de la evidencia" required>
            <Input
              value={form.nombre}
              onChange={(e) => setField("nombre", e.target.value)}
              placeholder="Ej. Acta de reunión 2024-01"
            />
            <FormError message={errors.nombre} />
          </DrawerField>

          <DrawerField label="Tipo" required>
            <Select
              value={form.tipo}
              onValueChange={(v) => setField("tipo", v as TipoEvidencia)}
              options={TIPO_EVIDENCIA_OPTIONS}
            />
          </DrawerField>
        </DrawerSection>

        {/* Section 2 — Archivo */}
        <DrawerSection title="Archivo">
          <DrawerField label="Archivo adjunto">
            <Dropzone
              fileName={form.archivoNombre}
              onFileSelect={(file) => {
                setField("archivoNombre", file.name);
                setSelectedFile(file);
              }}
              accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
            />
          </DrawerField>
        </DrawerSection>

        {/* Section 3 — Relaciones */}
        <DrawerSection title="Relaciones">
          <DrawerField label="Actividad vinculada">
            <EntitySelector
              entityType="actividades"
              value={form.actividadId}
              onValueChange={(v) => setField("actividadId", v)}
              placeholder="Seleccionar actividad…"
              allowEmpty
            />
          </DrawerField>

          <DrawerField label="Documento relacionado">
            <EntitySelector
              entityType="actividades"
              value={form.documentoRelacionadoId}
              onValueChange={(v) => setField("documentoRelacionadoId", v)}
              placeholder="Seleccionar documento…"
              allowEmpty
            />
          </DrawerField>
        </DrawerSection>

        {/* Section 4 — Revisión */}
        <DrawerSection title="Revisión">
          <DrawerField label="Estado de revisión">
            <Select
              value={form.estadoRevision}
              onValueChange={(v) => setField("estadoRevision", v as NonNullable<Evidencia["estadoRevision"]>)}
              options={ESTADO_REVISION_OPTIONS}
            />
          </DrawerField>

          <DrawerField label="Revisor">
            <EntitySelector
              entityType="usuarios"
              value={form.revisorId}
              onValueChange={(v) => setField("revisorId", v)}
              placeholder="Seleccionar revisor…"
              allowEmpty
            />
          </DrawerField>

          <div className="grid grid-cols-2 gap-3">
            <DrawerField label="Fecha de emisión">
              <Input
                type="date"
                value={form.fechaEmision}
                onChange={(e) => setField("fechaEmision", e.target.value)}
              />
            </DrawerField>

            <DrawerField label="Fecha de vencimiento">
              <Input
                type="date"
                value={form.fechaVencimiento}
                onChange={(e) => setField("fechaVencimiento", e.target.value)}
              />
            </DrawerField>
          </div>
        </DrawerSection>

        {/* Section 5 — Responsable */}
        <DrawerSection title="Responsable">
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

        {/* Section 6 — Observaciones */}
        <DrawerSection title="Observaciones">
          <DrawerField label="Observaciones">
            <Textarea
              value={form.observaciones}
              onChange={(e) => setField("observaciones", e.target.value)}
              rows={3}
              placeholder="Notas adicionales…"
            />
          </DrawerField>

          <DrawerField label="Comentarios internos">
            <Textarea
              value={form.comentariosTexto}
              onChange={(e) => setField("comentariosTexto", e.target.value)}
              rows={2}
              placeholder="Comentarios internos…"
            />
          </DrawerField>
        </DrawerSection>

        {/* Section 7 — Obligatoria */}
        <DrawerSection title="Obligatoria">
          <Switch
            checked={form.obligatoria}
            onCheckedChange={(v) => setField("obligatoria", v)}
            label="Evidencia obligatoria"
          />
        </DrawerSection>

        {/* Section 8 — Historial (edit only) */}
        {editing && (
          <DrawerSection title="Historial">
            <HistorialSection historial={editing.historial} />
          </DrawerSection>
        )}

        {/* Section 9 — Firma digital (always, disabled visually) */}
        <DrawerSection title="Firma digital">
          <div className="flex items-center gap-3 rounded-md border border-sse-border bg-sse-surface/50 px-4 py-3 opacity-60 cursor-not-allowed">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
              className="w-5 h-5 text-sse-muted shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-[12px] text-sse-muted">
              Firma digital — disponible en una próxima versión
            </p>
          </div>
        </DrawerSection>
      </Drawer>
    </div>
  );
}
