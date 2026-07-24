"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { Solicitud } from "@/types/entities";
import { useSolicitudes, useSolicitudesActions } from "@/hooks/useSolicitudes";
import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EntitySelector } from "@/components/ui/entity-selector";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Drawer, DrawerSection, DrawerField, DrawerTabs } from "@/components/ui/drawer";
import { TimelineSection } from "@/components/ui/timeline-section";
import type { TimelineEntry } from "@/components/ui/timeline-section";
import { FormError } from "@/components/ui/form-error";
import { cn, fmtShortDate } from "@/lib/utils";

interface WorkspaceRequestsProps {
  wsId: WorkspaceId;
}

// ── helpers ──────────────────────────────────────────────────────────────────

const ESTADO_BADGE: Record<Solicitud["estado"], BadgeVariant> = {
  abierta:     "warning",
  en_atencion: "info",
  cerrada:     "success",
};

const ESTADO_LABEL: Record<Solicitud["estado"], string> = {
  abierta:     "Abierta",
  en_atencion: "En atención",
  cerrada:     "Cerrada",
};

const PRIORIDAD_BADGE: Record<NonNullable<Solicitud["prioridad"]>, BadgeVariant> = {
  baja:    "gray",
  media:   "info",
  alta:    "warning",
  urgente: "danger",
};

const PRIORIDAD_LABEL: Record<NonNullable<Solicitud["prioridad"]>, string> = {
  baja:    "Baja",
  media:   "Media",
  alta:    "Alta",
  urgente: "Urgente",
};

const ACCION_LABEL: Record<NonNullable<Solicitud["bitacora"]>[number]["accion"], string> = {
  creado:          "Creado",
  modificado:      "Modificado",
  estado_cambiado: "Estado cambiado",
  comentario:      "Comentario",
  adjunto:         "Adjunto",
  aprobado:        "Aprobado",
  rechazado:       "Rechazado",
};

function slaDays(fechaCreacion: string): number {
  return Math.ceil((Date.now() - new Date(fechaCreacion).getTime()) / (1000 * 60 * 60 * 24));
}

function fmtTiempoRespuesta(horas: number): string {
  if (horas < 24) return `${horas}h`;
  const days = Math.floor(horas / 24);
  const remaining = horas % 24;
  return remaining > 0 ? `${days}d ${remaining}h` : `${days}d`;
}

function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `hace ${days}d`;
  return fmtShortDate(iso);
}

function mapBitacora(sol: Solicitud): TimelineEntry[] {
  if (!sol.bitacora) return [];
  return sol.bitacora.map((entry) => {
    let variant: BadgeVariant | undefined;
    if (entry.accion === "creado") variant = "success";
    else if (entry.accion === "estado_cambiado") variant = "warning";
    else if (entry.accion === "rechazado") variant = "danger";
    return {
      fecha:   entry.fecha,
      accion:  ACCION_LABEL[entry.accion] ?? entry.accion,
      usuario: entry.usuarioNombre,
      detalle: entry.detalle,
      variant,
    };
  });
}

function avatarInitials(nombre: string): string {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

type FilterTab = "abierta" | "en_atencion" | "cerrada";
type DrawerTab = "datos" | "bitacora" | "comentarios" | "adjuntos";

const TABS = [
  { id: "abierta" as FilterTab,     label: "Abiertas" },
  { id: "en_atencion" as FilterTab, label: "En atención" },
  { id: "cerrada" as FilterTab,     label: "Cerradas" },
];

const DRAWER_TABS: { id: DrawerTab; label: string }[] = [
  { id: "datos",        label: "Datos" },
  { id: "bitacora",     label: "Bitácora" },
  { id: "comentarios",  label: "Comentarios" },
  { id: "adjuntos",     label: "Adjuntos" },
];

const ESTADO_OPTIONS = [
  { value: "abierta",     label: "Abierta" },
  { value: "en_atencion", label: "En atención" },
  { value: "cerrada",     label: "Cerrada" },
];

const PRIORIDAD_OPTIONS = [
  { value: "baja",    label: "Baja" },
  { value: "media",   label: "Media" },
  { value: "alta",    label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

// ── row ───────────────────────────────────────────────────────────────────────

function SolicitudRow({
  solicitud,
  onEdit,
  canEdit,
}: {
  solicitud: Solicitud;
  onEdit: (s: Solicitud) => void;
  canEdit: boolean;
}) {
  const isClosed = solicitud.estado === "cerrada";
  const days = slaDays(solicitud.fechaCreacion);
  const isOverdue = days > 5 && !isClosed;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-sse-border last:border-b-0">
      {/* Estado + prioridad badges */}
      <div className="flex flex-col gap-1 mt-0.5 shrink-0">
        <Badge variant={ESTADO_BADGE[solicitud.estado]}>
          {ESTADO_LABEL[solicitud.estado]}
        </Badge>
        {solicitud.prioridad && (
          <Badge variant={PRIORIDAD_BADGE[solicitud.prioridad]}>
            {PRIORIDAD_LABEL[solicitud.prioridad]}
          </Badge>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-sse-ink truncate">{solicitud.asunto}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-[11px] font-mono text-sse-muted">{solicitud.id}</span>
          <span className="text-sse-muted text-[11px]">·</span>
          <span className="text-[11px] text-sse-muted">
            Resp: <span className="font-medium text-sse-ink">{solicitud.responsableId}</span>
          </span>
          {solicitud.fechaCompromiso && (
            <>
              <span className="text-sse-muted text-[11px]">·</span>
              <span className="text-[11px] text-sse-muted">
                Compromiso:{" "}
                <span className="font-medium text-sse-ink">
                  {fmtShortDate(solicitud.fechaCompromiso)}
                </span>
              </span>
            </>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <div className="text-right">
          {isClosed && solicitud.tiempoRespuestaHoras != null ? (
            <>
              <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium bg-sse-sem-green-bg text-sse-sem-green-fg">
                Atendida en {fmtTiempoRespuesta(solicitud.tiempoRespuestaHoras)}
              </span>
            </>
          ) : (
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium",
                isOverdue
                  ? "bg-sse-sem-red-bg text-sse-sem-red-fg"
                  : "bg-sse-pill-gray-bg text-sse-pill-gray-fg",
              )}
            >
              {days}d
            </span>
          )}
          <p className="text-[10px] text-sse-muted mt-0.5">
            {fmtShortDate(solicitud.fechaCreacion)}
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => onEdit(solicitud)}
            className="px-2 py-0.5 rounded text-[11px] text-sse-primary hover:bg-sse-pill-blue-bg"
          >
            Editar
          </button>
        )}
      </div>
    </div>
  );
}

// ── empty state for drawer tabs ───────────────────────────────────────────────

function TabEmpty({ message }: { message: string }) {
  return (
    <p className="text-[12px] text-sse-muted py-6 text-center">{message}</p>
  );
}

// ── main component ────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  asunto: "",
  descripcion: "",
  responsableId: "",
  solicitanteId: "",
  procesoId: "",
  estado: "abierta" as Solicitud["estado"],
  prioridad: "media" as NonNullable<Solicitud["prioridad"]>,
  fechaCompromiso: "",
};

export function WorkspaceRequests({ wsId }: WorkspaceRequestsProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Solicitud | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [activeTab, setActiveTab] = useState<DrawerTab>("datos");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: solicitudes, isLoading, isError } = useSolicitudes({ unidadId: wsId });
  const actions = useSolicitudesActions();
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("requests.create");

  const tabsWithCounts = TABS.map((t) => ({
    ...t,
    badge: solicitudes
      ? solicitudes.filter((s) => s.estado === t.id).length
      : undefined,
  }));

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setActiveTab("datos");
    setDrawerOpen(true);
  }

  function openEdit(s: Solicitud) {
    setEditing(s);
    setForm({
      asunto:          s.asunto,
      descripcion:     s.descripcion ?? "",
      responsableId:   s.responsableId,
      solicitanteId:   s.solicitanteId,
      procesoId:       s.procesoId,
      estado:          s.estado,
      prioridad:       s.prioridad ?? "media",
      fechaCompromiso: s.fechaCompromiso ?? "",
    });
    setErrors({});
    setActiveTab("datos");
    setDrawerOpen(true);
  }

  async function handleSave() {
    // Validate
    const nextErrors: Record<string, string> = {};
    if (!form.asunto.trim()) {
      nextErrors.asunto = "El asunto es obligatorio.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setActiveTab("datos");
      return;
    }

    const now = new Date().toISOString();
    const payload = {
      ...form,
      unidadId: wsId,
      fechaCreacion: editing?.fechaCreacion ?? now,
    };
    if (editing) {
      await actions.update.mutateAsync({ id: editing.id, patch: payload });
    } else {
      await actions.create.mutateAsync(payload as Partial<Solicitud>);
    }
    setDrawerOpen(false);
  }

  const isPending = actions.create.isPending || actions.update.isPending;

  // ── drawer form (shared between tabs and standalone) ──────────────────────

  const formContent = (
    <>
      {/* Section 1: Identificación */}
      <DrawerSection title="Identificación">
        <DrawerField label="Asunto" required>
          <Input
            value={form.asunto}
            onChange={(e) => {
              setForm({ ...form, asunto: e.target.value });
              if (errors.asunto) setErrors({ ...errors, asunto: "" });
            }}
            placeholder="Describe brevemente la solicitud…"
          />
          <FormError message={errors.asunto} />
        </DrawerField>

        <DrawerField label="Descripción">
          <Textarea
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            rows={3}
            placeholder="Detalle adicional de la solicitud…"
          />
        </DrawerField>
      </DrawerSection>

      {/* Section 2: Clasificación */}
      <DrawerSection title="Clasificación">
        <div className="grid grid-cols-2 gap-3">
          <DrawerField label="Estado">
            <Select
              value={form.estado}
              onValueChange={(v) => setForm({ ...form, estado: v as Solicitud["estado"] })}
              options={ESTADO_OPTIONS}
            />
          </DrawerField>
          <DrawerField label="Prioridad">
            <Select
              value={form.prioridad}
              onValueChange={(v) =>
                setForm({ ...form, prioridad: v as NonNullable<Solicitud["prioridad"]> })
              }
              options={PRIORIDAD_OPTIONS}
            />
          </DrawerField>
        </div>

        <DrawerField label="Fecha compromiso">
          <Input
            type="date"
            value={form.fechaCompromiso}
            onChange={(e) => setForm({ ...form, fechaCompromiso: e.target.value })}
          />
        </DrawerField>
      </DrawerSection>

      {/* Section 3: Personas */}
      <DrawerSection title="Personas">
        <DrawerField label="Responsable">
          <EntitySelector
            entityType="usuarios"
            value={form.responsableId}
            onValueChange={(v) => setForm({ ...form, responsableId: v })}
            placeholder="Seleccionar responsable…"
            allowEmpty
          />
        </DrawerField>

        <DrawerField label="Solicitante">
          <EntitySelector
            entityType="usuarios"
            value={form.solicitanteId}
            onValueChange={(v) => setForm({ ...form, solicitanteId: v })}
            placeholder="Seleccionar solicitante…"
            allowEmpty
          />
        </DrawerField>

        <DrawerField label="Proceso vinculado">
          <EntitySelector
            entityType="procesos"
            value={form.procesoId}
            onValueChange={(v) => setForm({ ...form, procesoId: v })}
            placeholder="Seleccionar proceso…"
            allowEmpty
          />
        </DrawerField>
      </DrawerSection>
    </>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-semibold text-sse-ink">Solicitudes</h1>
        {canEdit && (
          <Button size="sm" variant="primary" onClick={openCreate}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva solicitud
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}
        </div>
      )}

      {isError && (
        <p className="text-[13px] text-sse-muted py-4">No se pudieron cargar las solicitudes.</p>
      )}

      {!isLoading && !isError && solicitudes && (
        <Tabs tabs={tabsWithCounts} defaultTab="abierta">
          {(activeFilterTab) => {
            const filtered = solicitudes.filter((s) => s.estado === activeFilterTab);
            if (filtered.length === 0) {
              return (
                <EmptyState
                  icon="M4 13h4l2 3h4l2-3h4M5 5h14v13H5z"
                  title="Sin solicitudes"
                  description="No hay solicitudes en esta categoría."
                  action={canEdit && activeFilterTab === "abierta" ? (
                    <Button size="sm" onClick={openCreate}>Crear solicitud</Button>
                  ) : undefined}
                />
              );
            }
            return (
              <div className="bg-sse-surface rounded-md border border-sse-border px-4">
                {filtered.map((s) => (
                  <SolicitudRow key={s.id} solicitud={s} onEdit={openEdit} canEdit={canEdit} />
                ))}
              </div>
            );
          }}
        </Tabs>
      )}

      {solicitudes && solicitudes.length > 0 && (
        <p className="text-[12px] text-sse-muted">
          SLA objetivo: respuesta en 5 días hábiles. Días marcados en rojo superan ese límite.
        </p>
      )}

      {/* Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? "Editar solicitud" : "Nueva solicitud"}
        width="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.asunto || isPending}>
              {isPending ? "Guardando…" : editing ? "Guardar cambios" : "Crear solicitud"}
            </Button>
          </>
        }
      >
        {editing ? (
          <>
            {/* Tabs for edit mode */}
            <DrawerTabs
              tabs={DRAWER_TABS}
              active={activeTab}
              onChange={(id) => setActiveTab(id as DrawerTab)}
            />

            {activeTab === "datos" && formContent}

            {activeTab === "bitacora" && (
              <DrawerSection>
                <TimelineSection
                  entries={mapBitacora(editing)}
                  title="Línea de tiempo"
                />
              </DrawerSection>
            )}

            {activeTab === "comentarios" && (
              <DrawerSection>
                {!editing.comentarios || editing.comentarios.length === 0 ? (
                  <TabEmpty message="Sin comentarios registrados." />
                ) : (
                  <div className="space-y-3">
                    {editing.comentarios.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-start gap-3 p-3 rounded-md bg-sse-shell-canvas border border-sse-border"
                      >
                        {/* Avatar */}
                        <div className="shrink-0 w-7 h-7 rounded-full bg-sse-pill-blue-bg text-sse-pill-blue-fg flex items-center justify-center text-[10px] font-bold">
                          {avatarInitials(c.usuarioNombre)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-medium text-sse-ink">
                              {c.usuarioNombre}
                            </span>
                            <span className="text-[10px] text-sse-muted">
                              {fmtRelative(c.fecha)}
                            </span>
                          </div>
                          <p className="text-[12px] text-sse-ink mt-0.5 whitespace-pre-wrap">
                            {c.texto}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DrawerSection>
            )}

            {activeTab === "adjuntos" && (
              <DrawerSection>
                {!editing.adjuntos || editing.adjuntos.length === 0 ? (
                  <TabEmpty message="Sin adjuntos." />
                ) : (
                  <ul className="space-y-1.5">
                    {editing.adjuntos.map((filename) => (
                      <li
                        key={filename}
                        className="flex items-center gap-2 py-2 px-3 rounded-md bg-sse-shell-canvas border border-sse-border"
                      >
                        {/* Paperclip icon */}
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          className="w-3.5 h-3.5 text-sse-muted shrink-0"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
                          />
                        </svg>
                        <span className="text-[12px] text-sse-ink truncate">{filename}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </DrawerSection>
            )}
          </>
        ) : (
          /* Create mode: no tabs, just form */
          formContent
        )}
      </Drawer>
    </div>
  );
}
