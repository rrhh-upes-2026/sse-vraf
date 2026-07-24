"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { Evidencia, TipoEvidencia } from "@/types/entities";
import { useEvidencias, useEvidenciasActions } from "@/hooks/useEvidencias";
import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Drawer, DrawerSection, DrawerField } from "@/components/ui/drawer";
import { fmtShortDate } from "@/lib/utils";

interface WorkspaceEvidenceProps {
  wsId: WorkspaceId;
}

// ── helpers ──────────────────────────────────────────────────────────────────

const ESTADO_BADGE = {
  pendiente: "warning",
  cargada:   "info",
  validada:  "success",
  rechazada: "danger",
} as const;

const ESTADO_LABEL: Record<Evidencia["estado"], string> = {
  pendiente: "Pendiente",
  cargada:   "Cargada",
  validada:  "Validada",
  rechazada: "Rechazada",
};

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

const TIPO_OPTIONS: { value: TipoEvidencia; label: string }[] = [
  { value: "documento",   label: "Documento" },
  { value: "formulario",  label: "Formulario" },
  { value: "archivo",     label: "Archivo" },
  { value: "registro",    label: "Registro" },
  { value: "fotografia",  label: "Fotografía" },
  { value: "acta",        label: "Acta" },
  { value: "contrato",    label: "Contrato" },
  { value: "informe",     label: "Informe" },
  { value: "comprobante", label: "Comprobante" },
  { value: "otro",        label: "Otro" },
];

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
  return (
    <div className="flex items-center gap-3 py-3 border-b border-sse-border last:border-b-0">
      <TipoIcon tipo={evidencia.tipo} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13px] font-medium text-sse-ink truncate">{evidencia.nombre}</p>
          {evidencia.obligatoria && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-semibold bg-sse-sem-red-bg text-sse-sem-red-fg">
              Obligatoria
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-sse-muted capitalize">{evidencia.tipo}</span>
          <span className="text-sse-muted text-[11px]">·</span>
          <span className="text-[11px] text-sse-muted">v{evidencia.version}</span>
          {evidencia.fechaCarga && (
            <>
              <span className="text-sse-muted text-[11px]">·</span>
              <span className="text-[11px] text-sse-muted">
                {fmtShortDate(evidencia.fechaCarga)}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Badge variant={ESTADO_BADGE[evidencia.estado]}>
          {ESTADO_LABEL[evidencia.estado]}
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
};

export function WorkspaceEvidence({ wsId }: WorkspaceEvidenceProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Evidencia | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

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
    setForm(EMPTY_FORM);
    setDrawerOpen(true);
  }

  function openUpload(e: Evidencia) {
    setEditing(e);
    setForm({
      nombre: e.nombre,
      tipo: e.tipo,
      obligatoria: e.obligatoria,
      actividadId: e.actividadId,
      responsableId: e.responsableId,
      observaciones: e.observaciones ?? "",
    });
    setDrawerOpen(true);
  }

  async function handleSave() {
    if (editing) {
      await actions.update.mutateAsync({
        id: editing.id,
        patch: {
          ...form,
          estado: "cargada",
          version: editing.version + 1,
          fechaCarga: new Date().toISOString(),
        },
      });
    } else {
      await actions.create.mutateAsync({
        ...form,
        estado: "pendiente",
        version: 1,
      } as Partial<Evidencia>);
    }
    setDrawerOpen(false);
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
        title={editing ? "Cargar evidencia" : "Nueva evidencia"}
        subtitle={editing ? `Actualizando: ${editing.nombre}` : undefined}
        width="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.nombre || isPending}>
              {isPending ? "Guardando…" : editing ? "Marcar como cargada" : "Registrar"}
            </Button>
          </>
        }
      >
        <DrawerSection>
          <DrawerField label="Nombre de la evidencia" required>
            <Input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej. Acta de reunión 2024-01"
            />
          </DrawerField>

          <DrawerField label="Tipo" required>
            <Select
              value={form.tipo}
              onValueChange={(v) => setForm({ ...form, tipo: v as TipoEvidencia })}
              options={TIPO_OPTIONS}
            />
          </DrawerField>

          <DrawerField label="Actividad vinculada (ID)">
            <Input
              value={form.actividadId}
              onChange={(e) => setForm({ ...form, actividadId: e.target.value })}
              placeholder="ID de la actividad…"
            />
          </DrawerField>

          <DrawerField label="Responsable (ID)">
            <Input
              value={form.responsableId}
              onChange={(e) => setForm({ ...form, responsableId: e.target.value })}
              placeholder="ID del responsable…"
            />
          </DrawerField>

          <DrawerField label="Observaciones">
            <textarea
              value={form.observaciones}
              onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
              rows={3}
              placeholder="Notas adicionales…"
              className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink outline-none placeholder:text-sse-muted focus:border-sse-primary focus:ring-1 focus:ring-sse-primary/30 resize-none"
            />
          </DrawerField>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.obligatoria}
              onChange={(e) => setForm({ ...form, obligatoria: e.target.checked })}
              className="rounded border-sse-border"
            />
            <span className="text-[13px] text-sse-ink">Evidencia obligatoria</span>
          </label>
        </DrawerSection>
      </Drawer>
    </div>
  );
}
