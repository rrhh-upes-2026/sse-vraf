"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { Solicitud } from "@/types/entities";
import { useSolicitudes, useSolicitudesActions } from "@/hooks/useSolicitudes";
import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Drawer, DrawerSection, DrawerField } from "@/components/ui/drawer";
import { cn, fmtShortDate } from "@/lib/utils";

interface WorkspaceRequestsProps {
  wsId: WorkspaceId;
}

// ── helpers ──────────────────────────────────────────────────────────────────

const ESTADO_BADGE = {
  abierta:     "warning",
  en_atencion: "info",
  cerrada:     "success",
} as const;

const ESTADO_LABEL: Record<Solicitud["estado"], string> = {
  abierta:     "Abierta",
  en_atencion: "En atención",
  cerrada:     "Cerrada",
};

function slaDays(fechaCreacion: string): number {
  return Math.ceil((Date.now() - new Date(fechaCreacion).getTime()) / (1000 * 60 * 60 * 24));
}

type FilterTab = "abierta" | "en_atencion" | "cerrada";

const TABS = [
  { id: "abierta" as FilterTab,     label: "Abiertas" },
  { id: "en_atencion" as FilterTab, label: "En atención" },
  { id: "cerrada" as FilterTab,     label: "Cerradas" },
];

const ESTADO_OPTIONS = [
  { value: "abierta",     label: "Abierta" },
  { value: "en_atencion", label: "En atención" },
  { value: "cerrada",     label: "Cerrada" },
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
  const days = slaDays(solicitud.fechaCreacion);
  const isOverdue = days > 5 && solicitud.estado !== "cerrada";

  return (
    <div className="flex items-start gap-3 py-3 border-b border-sse-border last:border-b-0">
      <Badge variant={ESTADO_BADGE[solicitud.estado]} className="mt-0.5 shrink-0">
        {ESTADO_LABEL[solicitud.estado]}
      </Badge>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-sse-ink truncate">{solicitud.asunto}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] font-mono text-sse-muted">{solicitud.id}</span>
          <span className="text-sse-muted text-[11px]">·</span>
          <span className="text-[11px] text-sse-muted">
            Resp: <span className="font-medium text-sse-ink">{solicitud.responsableId}</span>
          </span>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <div className="text-right">
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

// ── main component ────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  asunto: "",
  responsableId: "",
  solicitanteId: "",
  procesoId: "",
  estado: "abierta" as Solicitud["estado"],
};

export function WorkspaceRequests({ wsId }: WorkspaceRequestsProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Solicitud | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

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
    setDrawerOpen(true);
  }

  function openEdit(s: Solicitud) {
    setEditing(s);
    setForm({
      asunto: s.asunto,
      responsableId: s.responsableId,
      solicitanteId: s.solicitanteId,
      procesoId: s.procesoId,
      estado: s.estado,
    });
    setDrawerOpen(true);
  }

  async function handleSave() {
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
          {(activeTab) => {
            const filtered = solicitudes.filter((s) => s.estado === activeTab);
            if (filtered.length === 0) {
              return (
                <EmptyState
                  icon="M4 13h4l2 3h4l2-3h4M5 5h14v13H5z"
                  title="Sin solicitudes"
                  description="No hay solicitudes en esta categoría."
                  action={canEdit && activeTab === "abierta" ? (
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
        <DrawerSection>
          <DrawerField label="Asunto" required>
            <Input
              value={form.asunto}
              onChange={(e) => setForm({ ...form, asunto: e.target.value })}
              placeholder="Describe brevemente la solicitud…"
            />
          </DrawerField>

          <DrawerField label="Estado">
            <Select
              value={form.estado}
              onValueChange={(v) => setForm({ ...form, estado: v as Solicitud["estado"] })}
              options={ESTADO_OPTIONS}
            />
          </DrawerField>

          <DrawerField label="Responsable (ID)">
            <Input
              value={form.responsableId}
              onChange={(e) => setForm({ ...form, responsableId: e.target.value })}
              placeholder="ID del responsable…"
            />
          </DrawerField>

          <DrawerField label="Solicitante (ID)">
            <Input
              value={form.solicitanteId}
              onChange={(e) => setForm({ ...form, solicitanteId: e.target.value })}
              placeholder="ID del solicitante…"
            />
          </DrawerField>

          <DrawerField label="Proceso vinculado (ID)">
            <Input
              value={form.procesoId}
              onChange={(e) => setForm({ ...form, procesoId: e.target.value })}
              placeholder="ID del proceso…"
            />
          </DrawerField>
        </DrawerSection>
      </Drawer>
    </div>
  );
}
