"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import { usePermissions } from "@/hooks/usePermissions";
import { useRequestTypes, lifecycleBadge } from "@/hooks/useWorkspaceAdmin";
import { WorkspaceAdminService } from "@/services/workspace-admin";
import type { RequestType } from "@/types/workspace-admin";

function RequestTypeCard({ req, onAction }: { req: RequestType; onAction: () => void }) {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("ws.requests.manage");
  const [busy, setBusy] = useState(false);

  const handlePublish = async () => {
    if (!confirm(`¿Publicar el tipo de solicitud "${req.nombre}"?`)) return;
    setBusy(true);
    await WorkspaceAdminService.publishRequestType(req.id);
    setBusy(false);
    onAction();
  };

  const { label, color } = lifecycleBadge(req.lifecycle);

  return (
    <div className="bg-sse-surface rounded-md border border-sse-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="w-9 h-9 rounded-md bg-sse-hover flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            className="w-5 h-5 text-sse-primary">
            <path strokeLinecap="round" strokeLinejoin="round" d={req.icon} />
          </svg>
        </div>
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {label}
        </span>
      </div>

      <div className="mt-3">
        <p className="text-[13px] font-semibold text-sse-ink">{req.nombre}</p>
        <p className="text-[11px] text-sse-muted mt-0.5 line-clamp-2">{req.descripcion}</p>
      </div>

      {/* Meta */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-[16px] font-bold text-sse-ink tabular-nums">{req.formFields.length}</p>
          <p className="text-[10px] text-sse-muted">Campos</p>
        </div>
        <div className="text-center">
          <p className="text-[16px] font-bold text-sse-ink tabular-nums">{req.approvalSteps.length}</p>
          <p className="text-[10px] text-sse-muted">Aprobaciones</p>
        </div>
        <div className="text-center">
          <p className="text-[16px] font-bold text-sse-ink tabular-nums">{req.slaDias}d</p>
          <p className="text-[10px] text-sse-muted">SLA</p>
        </div>
      </div>

      {/* Approval steps preview */}
      {req.approvalSteps.length > 0 && (
        <div className="mt-3 pt-3 border-t border-sse-border">
          <p className="text-[10px] text-sse-muted font-medium mb-1.5">FLUJO DE APROBACIÓN</p>
          <div className="flex items-center gap-1.5">
            {req.approvalSteps.map((step, i) => (
              <div key={step.id} className="flex items-center gap-1.5">
                {i > 0 && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                    className="w-3 h-3 text-sse-muted">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
                <span className="text-[10px] bg-sse-hover px-1.5 py-0.5 rounded text-sse-ink">
                  {step.responsableRol}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {canManage && (
        <div className="mt-3 pt-3 border-t border-sse-border flex items-center gap-3">
          {req.lifecycle === "draft" && (
            <button
              onClick={handlePublish}
              disabled={busy}
              className="text-[11px] font-medium text-sse-primary hover:underline disabled:opacity-50"
            >
              Publicar
            </button>
          )}
          <button className="text-[11px] text-sse-muted hover:text-sse-ink">
            Editar
          </button>
          <button className="text-[11px] text-sse-muted hover:text-sse-ink">
            Duplicar
          </button>
          <span className="ml-auto text-[10px] text-sse-muted">v{req.version}</span>
        </div>
      )}
    </div>
  );
}

export function WorkspaceAdminRequests({ wsId }: { wsId: WorkspaceId }) {
  const { hasPermission } = usePermissions();
  const { data: requestTypes, loading, refetch } = useRequestTypes(wsId);
  const [filter, setFilter] = useState<string>("all");

  const canManage = hasPermission("ws.requests.manage");

  const categories = Array.from(new Set((requestTypes ?? []).map((r) => r.categoria)));

  const filtered = (requestTypes ?? []).filter((r) => filter === "all" || r.categoria === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-semibold text-sse-ink">Catálogo de Solicitudes</h1>
          <p className="text-[12px] text-sse-muted mt-0.5">
            Define tipos de solicitud con formularios, flujos de aprobación y SLA.
          </p>
        </div>
        {canManage && (
          <button className="flex items-center gap-1.5 text-[12px] font-medium bg-sse-primary text-white px-3 py-1.5 rounded-md hover:bg-sse-primary/90 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Tipo
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-1 flex-wrap">
        {["all", ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={
              "px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors " +
              (filter === cat
                ? "bg-sse-primary/10 text-sse-primary"
                : "text-sse-muted hover:bg-sse-hover hover:text-sse-ink")
            }
          >
            {cat === "all" ? "Todos" : cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-sse-surface rounded-md border border-sse-border h-48 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-sse-surface rounded-md border border-sse-border p-8 text-center">
          <p className="text-[13px] text-sse-muted">No se encontraron tipos de solicitud.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((req) => (
            <RequestTypeCard key={req.id} req={req} onAction={refetch} />
          ))}
        </div>
      )}

      {/* Capabilities info */}
      <div className="bg-sse-hover rounded-md border border-sse-border px-4 py-3">
        <p className="text-[11px] text-sse-muted">
          <strong className="text-sse-ink">Cada tipo de solicitud incluye:</strong> Formulario dinámico ·
          Flujo de aprobación configurable · SLA con alertas automáticas ·
          Notificaciones por rol · Evidencias requeridas · Control de permisos por rol.
        </p>
      </div>
    </div>
  );
}
