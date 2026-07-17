"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import { usePermissions } from "@/hooks/usePermissions";
import { useNotificationRules, lifecycleBadge } from "@/hooks/useWorkspaceAdmin";
import { WorkspaceAdminService } from "@/services/workspace-admin";
import type { NotificationRule } from "@/types/workspace-admin";
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

function CanalIcon({ canal }: { canal: NotificationRule["canal"] }) {
  if (canal === "in_app") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-sse-muted">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        In-app
      </span>
    );
  }
  if (canal === "email") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-sse-muted">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
        Correo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-sse-muted">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
      Ambos
    </span>
  );
}

function NotificationCard({
  rule,
  onAction,
}: {
  rule: NotificationRule;
  onAction: () => void;
}) {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("ws.automations.manage");
  const [busy, setBusy] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setBusy(true);
    await WorkspaceAdminService.toggleNotificationRule(rule.id, checked);
    setBusy(false);
    onAction();
  };

  const { label: lcLabel, color: lcColor } = lifecycleBadge(rule.lifecycle);

  return (
    <div className="bg-sse-surface rounded-md border border-sse-border p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ backgroundColor: `${lcColor}18`, color: lcColor }}
            >
              {lcLabel}
            </span>
            <span className={
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold " +
              (rule.active ? "bg-green-50 text-green-700" : "bg-sse-hover text-sse-muted")
            }>
              <span className={"w-1.5 h-1.5 rounded-full " + (rule.active ? "bg-green-500" : "bg-sse-muted")} />
              {rule.active ? "Activa" : "Inactiva"}
            </span>
          </div>
          <p className="text-[13px] font-semibold text-sse-ink">{rule.nombre}</p>
          <p className="text-[11px] text-sse-muted mt-0.5 line-clamp-2">{rule.descripcion}</p>
        </div>
        {canManage && (
          <Switch
            checked={rule.active}
            onCheckedChange={handleToggle}
            disabled={busy}
          />
        )}
      </div>

      {/* Details */}
      <div className="pt-3 border-t border-sse-border space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-sse-muted uppercase w-16 shrink-0">DISPARADOR</span>
          <span className="text-[11px] bg-sse-hover px-2 py-0.5 rounded text-sse-ink">
            {TRIGGER_LABELS[rule.trigger] ?? rule.trigger}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-sse-muted uppercase w-16 shrink-0">CANAL</span>
          <CanalIcon canal={rule.canal} />
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[10px] font-semibold text-sse-muted uppercase w-16 shrink-0 pt-0.5">ROLES</span>
          <div className="flex flex-wrap gap-1">
            {rule.destinatarioRoles.map((rol) => (
              <span
                key={rol}
                className="text-[10px] bg-sse-hover px-1.5 py-0.5 rounded text-sse-ink font-medium"
              >
                {rol}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Message preview */}
      <div className="pt-3 border-t border-sse-border">
        <p className="text-[10px] font-semibold text-sse-muted uppercase mb-1.5">MENSAJE</p>
        <p className="text-[11px] text-sse-muted italic line-clamp-2 bg-sse-hover px-2.5 py-2 rounded">
          {rule.mensaje}
        </p>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-sse-surface rounded-md border border-sse-border p-4 animate-pulse space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="flex gap-2">
            <div className="h-4 w-16 bg-sse-shell-canvas rounded-full" />
            <div className="h-4 w-12 bg-sse-shell-canvas rounded-full" />
          </div>
          <div className="h-4 bg-sse-shell-canvas rounded w-3/4" />
          <div className="h-3 bg-sse-shell-canvas rounded w-full" />
        </div>
        <div className="h-5 w-9 bg-sse-shell-canvas rounded-full" />
      </div>
      <div className="pt-3 border-t border-sse-border space-y-2">
        <div className="h-3 bg-sse-shell-canvas rounded w-2/3" />
        <div className="h-3 bg-sse-shell-canvas rounded w-1/2" />
      </div>
    </div>
  );
}

export function WorkspaceAdminNotifications({ wsId }: { wsId: WorkspaceId }) {
  const { hasPermission } = usePermissions();
  const { data: rules, loading, refetch } = useNotificationRules(wsId);

  const canManage = hasPermission("ws.automations.manage");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-semibold text-sse-ink">Reglas de Notificación</h1>
          <p className="text-[12px] text-sse-muted mt-0.5">
            Configura qué usuarios son notificados y por qué canal ante eventos del sistema.
          </p>
        </div>
        {canManage && (
          <Button variant="primary" size="sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Regla
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !rules || rules.length === 0 ? (
        <div className="bg-sse-surface rounded-md border border-sse-border p-10 text-center flex flex-col items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-10 text-sse-border">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <p className="text-[13px] font-medium text-sse-muted">No hay reglas de notificación configuradas.</p>
          {canManage && (
            <Button variant="primary" size="sm" className="mt-2">Crear primera regla</Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <NotificationCard key={rule.id} rule={rule} onAction={refetch} />
          ))}
        </div>
      )}

      <div className="bg-sse-hover rounded-md border border-sse-border px-4 py-3">
        <p className="text-[11px] text-sse-muted">
          <strong className="text-sse-ink">Canales disponibles:</strong> <em>In-app</em> muestra la notificación dentro de la plataforma.
          <em> Correo</em> envía un mensaje al correo institucional del destinatario.
          <em> Ambos</em> usa los dos canales simultáneamente. Las reglas inactivas no disparan notificaciones.
        </p>
      </div>
    </div>
  );
}
