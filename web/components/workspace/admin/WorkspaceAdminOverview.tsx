"use client";

import Link from "next/link";
import type { WorkspaceId } from "@/config/nav";
import { usePermissions } from "@/hooks/usePermissions";
import { useBlueprints, useKPIs, useRequestTypes, useAutomations, useWorkspaceUsers, useAuditRecords } from "@/hooks/useWorkspaceAdmin";

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  icon: string;
  href: string;
}

function StatCard({ label, value, sub, color, icon, href }: StatCardProps) {
  return (
    <Link href={href} className="block">
      <div className="bg-sse-surface rounded-md border border-sse-border p-4 hover:border-sse-primary/30 hover:shadow-sm transition-all">
        <div className="flex items-start justify-between">
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}18` }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
              className="w-5 h-5" style={{ color }}>
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            className="w-4 h-4 text-sse-muted">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <div className="mt-3">
          <p className="text-[24px] font-bold text-sse-ink tabular-nums">{value}</p>
          <p className="text-[13px] font-medium text-sse-ink mt-0.5">{label}</p>
          {sub && <p className="text-[11px] text-sse-muted mt-0.5">{sub}</p>}
        </div>
      </div>
    </Link>
  );
}

interface RecentActionProps {
  action: string;
  entity: string;
  by: string;
  at: string;
}

function RecentAction({ action, entity, by, at }: RecentActionProps) {
  const actionLabels: Record<string, string> = {
    "blueprint.published": "Proceso publicado",
    "kpi.created": "KPI creado",
    "requestType.updated": "Tipo de solicitud actualizado",
    "user.deactivated": "Usuario desactivado",
    "automation.published": "Automatización publicada",
  };
  const label = actionLabels[action] ?? action;
  const date = new Date(at).toLocaleDateString("es-SV", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-sse-border last:border-0">
      <div className="w-7 h-7 rounded-full bg-sse-hover flex items-center justify-center shrink-0 mt-0.5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
          className="w-3.5 h-3.5 text-sse-muted">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-sse-ink">{label}</p>
        <p className="text-[11px] text-sse-muted truncate">{entity} · {by}</p>
      </div>
      <span className="text-[11px] text-sse-muted shrink-0">{date}</span>
    </div>
  );
}

interface WorkspaceAdminOverviewProps {
  wsId: WorkspaceId;
}

export function WorkspaceAdminOverview({ wsId }: WorkspaceAdminOverviewProps) {
  const { hasPermission } = usePermissions();
  const { data: blueprints, loading: bpLoading } = useBlueprints(wsId);
  const { data: kpis, loading: kpiLoading } = useKPIs(wsId);
  const { data: requestTypes, loading: reqLoading } = useRequestTypes(wsId);
  const { data: automations, loading: autoLoading } = useAutomations(wsId);
  const { data: users, loading: userLoading } = useWorkspaceUsers(wsId);
  const { data: audit } = useAuditRecords(wsId);

  const publishedBlueprints = (blueprints ?? []).filter((b) => b.lifecycle === "published").length;
  const draftBlueprints = (blueprints ?? []).filter((b) => b.lifecycle === "draft").length;
  const publishedKPIs = (kpis ?? []).filter((k) => k.lifecycle === "published").length;
  const activeAutomations = (automations ?? []).filter((a) => a.active).length;
  const activeUsers = (users ?? []).filter((u) => u.activo).length;
  const publishedRequests = (requestTypes ?? []).filter((r) => r.lifecycle === "published").length;

  const recentAudit = (audit ?? []).slice(0, 5);

  const loading = bpLoading || kpiLoading || reqLoading || autoLoading || userLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-semibold text-sse-ink">Suite de Administración</h1>
          <p className="text-[12px] text-sse-muted mt-0.5">
            Configura y mantén tu workspace sin requerir desarrollo de software.
          </p>
        </div>
        {hasPermission("ws.template.export") && (
          <Link
            href={`/ws/${wsId}/admin/config`}
            className="flex items-center gap-1.5 text-[12px] text-sse-primary font-medium px-3 py-1.5 rounded-md border border-sse-primary/30 hover:bg-sse-primary/5 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar Plantilla
          </Link>
        )}
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-sse-surface rounded-md border border-sse-border p-4 h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard
            label="Procesos"
            value={blueprints?.length ?? 0}
            sub={`${publishedBlueprints} publicados · ${draftBlueprints} borradores`}
            color="#2E6BE6"
            icon="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"
            href={`/ws/${wsId}/admin/procesos`}
          />
          <StatCard
            label="Indicadores (KPI)"
            value={kpis?.length ?? 0}
            sub={`${publishedKPIs} publicados`}
            color="#0F8A8A"
            icon="M4 20a8 8 0 1 1 16 0M12 14l4-4"
            href={`/ws/${wsId}/admin/indicadores`}
          />
          <StatCard
            label="Tipos de Solicitud"
            value={requestTypes?.length ?? 0}
            sub={`${publishedRequests} publicados`}
            color="#5B4FD0"
            icon="M4 13h4l2 3h4l2-3h4M5 5h14v13H5z"
            href={`/ws/${wsId}/admin/solicitudes`}
          />
          <StatCard
            label="Automatizaciones"
            value={automations?.length ?? 0}
            sub={`${activeAutomations} activas`}
            color="#E5A100"
            icon="M13 10V3L4 14h7v7l9-11h-7z"
            href={`/ws/${wsId}/admin/automatizaciones`}
          />
          <StatCard
            label="Usuarios"
            value={users?.length ?? 0}
            sub={`${activeUsers} activos`}
            color="#12A150"
            icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197"
            href={`/ws/${wsId}/admin/usuarios`}
          />
          <StatCard
            label="Configuración"
            value="›"
            sub="Ajustes del workspace"
            color="#637083"
            icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z"
            href={`/ws/${wsId}/admin/config`}
          />
        </div>
      )}

      {/* Recent audit */}
      <div className="bg-sse-surface rounded-md border border-sse-border">
        <div className="px-4 py-3 border-b border-sse-border flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-sse-ink">Actividad Reciente</h2>
          <span className="text-[11px] text-sse-muted">Audit Trail</span>
        </div>
        <div className="px-4 py-1">
          {recentAudit.length === 0 ? (
            <p className="text-[12px] text-sse-muted py-4 text-center">Sin actividad reciente.</p>
          ) : (
            recentAudit.map((entry) => (
              <RecentAction
                key={entry.id}
                action={entry.action}
                entity={entry.entityId}
                by={entry.performedBy}
                at={entry.performedAt}
              />
            ))
          )}
        </div>
      </div>

      {/* Sprint-11 compliance badge */}
      <div className="bg-sse-hover rounded-md border border-sse-border px-4 py-3 flex items-center gap-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
          className="w-5 h-5 text-sse-primary shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
        </svg>
        <div>
          <p className="text-[12px] font-medium text-sse-ink">Workspace Auto-Administrado · Sprint 11</p>
          <p className="text-[11px] text-sse-muted">
            Este workspace es completamente configurable sin desarrollo de software.
            Toda acción genera un registro de auditoría.
          </p>
        </div>
      </div>
    </div>
  );
}
