"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import { usePermissions } from "@/hooks/usePermissions";
import { useAutomations, lifecycleBadge } from "@/hooks/useWorkspaceAdmin";
import { WorkspaceAdminService } from "@/services/workspace-admin";
import type { WorkspaceAutomation } from "@/types/workspace-admin";
import { AutomationDrawer } from "./drawers/AutomationDrawer";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const TRIGGER_LABELS: Record<string, string> = {
  "process.created": "Proceso creado",
  "process.status_changed": "Proceso: cambio de estado",
  "process.completed": "Proceso completado",
  "indicator.threshold_crossed": "KPI: umbral cruzado",
  "request.created": "Solicitud creada",
  "request.approved": "Solicitud aprobada",
  "evidence.uploaded": "Evidencia cargada",
  "evidence.approved": "Evidencia aprobada",
  "sla.warning": "Alerta de SLA",
  "sla.breach": "Incumplimiento de SLA",
  "date.reached": "Fecha programada",
  "form.submitted": "Formulario enviado",
  "user.created": "Usuario creado",
};

const ACTION_LABELS: Record<string, string> = {
  send_notification: "Enviar notificación",
  create_task: "Crear tarea",
  update_field: "Actualizar campo",
  change_status: "Cambiar estado",
  assign_role: "Asignar rol",
  generate_report: "Generar reporte",
  trigger_webhook: "Llamar webhook",
  create_audit_record: "Registrar auditoría",
};

function StatusDot({ success }: { success: boolean }) {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full"
      style={{ backgroundColor: success ? "#12A150" : "#E54D4D" }}
    />
  );
}

function AutomationCard({
  auto,
  onAction,
  onEdit,
}: {
  auto: WorkspaceAutomation;
  onAction: () => void;
  onEdit: (auto: WorkspaceAutomation) => void;
}) {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("ws.automations.manage");
  const [busy, setBusy] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setBusy(true);
    await WorkspaceAdminService.toggleAutomation(auto.id, checked);
    setBusy(false);
    onAction();
  };

  const handlePublish = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`¿Publicar la automatización "${auto.nombre}"?`)) return;
    setBusy(true);
    await WorkspaceAdminService.publishAutomation(auto.id);
    setBusy(false);
    onAction();
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`¿Archivar la automatización "${auto.nombre}"?`)) return;
    setBusy(true);
    await WorkspaceAdminService.archiveAutomation(auto.id);
    setBusy(false);
    onAction();
  };

  const { label: lcLabel, color: lcColor } = lifecycleBadge(auto.lifecycle);
  const successRate = auto.recentExecutions.length > 0
    ? Math.round((auto.recentExecutions.filter((e) => e.status === "success").length / auto.recentExecutions.length) * 100)
    : null;

  return (
    <div
      className="bg-sse-surface rounded-md border border-sse-border p-4 cursor-pointer hover:bg-sse-shell-canvas transition-colors"
      onClick={() => onEdit(auto)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ backgroundColor: `${lcColor}18`, color: lcColor }}
            >
              {lcLabel}
            </span>
            <span className={
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold " +
              (auto.active ? "bg-green-50 text-green-700" : "bg-sse-hover text-sse-muted")
            }>
              {auto.active ? "Activa" : "Inactiva"}
            </span>
          </div>
          <p className="text-[13px] font-semibold text-sse-ink">{auto.nombre}</p>
          <p className="text-[11px] text-sse-muted mt-0.5 line-clamp-2">{auto.descripcion}</p>
        </div>
        {canManage && (
          <div onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={auto.active}
              onCheckedChange={handleToggle}
              disabled={busy}
            />
          </div>
        )}
      </div>

      {/* Trigger / Actions */}
      <div className="mt-3 pt-3 border-t border-sse-border space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-sse-muted uppercase w-16 shrink-0">CUANDO</span>
          <span className="text-[11px] bg-sse-hover px-2 py-0.5 rounded text-sse-ink">
            {TRIGGER_LABELS[auto.trigger] ?? auto.trigger}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[10px] font-semibold text-sse-muted uppercase w-16 shrink-0 pt-0.5">HACER</span>
          <div className="flex flex-wrap gap-1">
            {auto.actions.map((a) => (
              <span key={a.id} className="text-[10px] bg-sse-hover px-1.5 py-0.5 rounded text-sse-ink">
                {ACTION_LABELS[a.tipo] ?? a.tipo}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-3 pt-3 border-t border-sse-border grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-[14px] font-bold text-sse-ink tabular-nums">{auto.executionCount}</p>
          <p className="text-[10px] text-sse-muted">Ejecuciones</p>
        </div>
        <div className="text-center">
          <p className="text-[14px] font-bold tabular-nums" style={{ color: successRate !== null && successRate >= 90 ? "#12A150" : "#E5A100" }}>
            {successRate !== null ? `${successRate}%` : "—"}
          </p>
          <p className="text-[10px] text-sse-muted">Éxito</p>
        </div>
        <div className="text-center">
          <p className="text-[14px] font-bold text-sse-ink tabular-nums">{auto.actions.length}</p>
          <p className="text-[10px] text-sse-muted">Acciones</p>
        </div>
      </div>

      {/* Recent executions */}
      {auto.recentExecutions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-sse-border">
          <p className="text-[10px] text-sse-muted font-medium mb-1.5">ÚLTIMAS EJECUCIONES</p>
          <div className="space-y-1">
            {auto.recentExecutions.slice(0, 3).map((ex) => (
              <div key={ex.id} className="flex items-center gap-2">
                <StatusDot success={ex.status === "success"} />
                <span className="text-[11px] text-sse-muted flex-1 truncate">
                  {new Date(ex.triggeredAt).toLocaleDateString("es-SV", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
                {ex.errorMessage && (
                  <span className="text-[10px] text-red-600 truncate max-w-[120px]">{ex.errorMessage}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {canManage && (
        <div className="mt-3 pt-3 border-t border-sse-border flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          {auto.lifecycle === "draft" && (
            <button
              onClick={handlePublish}
              disabled={busy}
              className="text-[11px] font-medium text-sse-primary hover:underline disabled:opacity-50"
            >
              Publicar
            </button>
          )}
          {auto.lifecycle !== "archived" && (
            <button
              onClick={handleArchive}
              disabled={busy}
              className="text-[11px] text-sse-muted hover:text-sse-ink disabled:opacity-50"
            >
              Archivar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function WorkspaceAdminAutomations({ wsId }: { wsId: WorkspaceId }) {
  const { hasPermission } = usePermissions();
  const { data: automations, loading, refetch } = useAutomations(wsId);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<WorkspaceAutomation | null>(null);

  const canManage = hasPermission("ws.automations.manage");

  const filtered = (automations ?? []).filter((a) => {
    if (filter === "active") return a.active;
    if (filter === "inactive") return !a.active;
    return true;
  });

  const counts = {
    all: automations?.length ?? 0,
    active: (automations ?? []).filter((a) => a.active).length,
    inactive: (automations ?? []).filter((a) => !a.active).length,
  };

  function openNew() { setSelectedAutomation(null); setDrawerOpen(true); }
  function openEdit(auto: WorkspaceAutomation) { setSelectedAutomation(auto); setDrawerOpen(true); }

  return (
    <div className="space-y-4">
      <AutomationDrawer
        wsId={wsId}
        automation={selectedAutomation}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSaved={refetch}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-semibold text-sse-ink">Gestión de Automatizaciones</h1>
          <p className="text-[12px] text-sse-muted mt-0.5">
            Reglas SI → OCURRE → ENTONCES · Sin código.
          </p>
        </div>
        {canManage && (
          <Button variant="primary" size="sm" onClick={openNew}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Automatización
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1">
        {(["all", "active", "inactive"] as const).map((f) => {
          const labels = { all: "Todas", active: "Activas", inactive: "Inactivas" };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                "px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors " +
                (filter === f
                  ? "bg-sse-primary/10 text-sse-primary"
                  : "text-sse-muted hover:bg-sse-shell-canvas hover:text-sse-ink")
              }
            >
              {labels[f]}
              <span className="ml-1.5 text-[10px] opacity-70">{counts[f]}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-sse-surface rounded-md border border-sse-border h-56 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-sse-surface rounded-md border border-sse-border p-8 text-center">
          <p className="text-[13px] text-sse-muted">No se encontraron automatizaciones.</p>
          {canManage && filter === "all" && (
            <Button variant="primary" size="sm" onClick={openNew} className="mt-3">
              Crear primera automatización
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((auto) => (
            <AutomationCard key={auto.id} auto={auto} onAction={refetch} onEdit={openEdit} />
          ))}
        </div>
      )}

      <div className="bg-sse-hover rounded-md border border-sse-border px-4 py-3">
        <p className="text-[11px] text-sse-muted">
          <strong className="text-sse-ink">Sin código:</strong> Define condiciones, acciones y el motor de automatización
          las ejecuta. Cada ejecución queda en el log. Versiones y auditoría completa.
        </p>
      </div>
    </div>
  );
}
