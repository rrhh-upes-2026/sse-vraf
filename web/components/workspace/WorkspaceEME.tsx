"use client";

import Link from "next/link";
import { useEMEDashboard } from "@/hooks/useEME";
import { Skeleton } from "@/components/ui/skeleton";
import type { EMEEvidence } from "@/types/eme";

interface Props {
  wsId: string;
}

function StatCard({
  label,
  value,
  sub,
  href,
  accent,
}: {
  label: string;
  value: number;
  sub?: string;
  href: string;
  accent?: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-sse-surface border border-sse-border rounded-md p-4 hover:border-sse-primary/40 transition-colors"
    >
      <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-[28px] font-bold font-mono ${accent ?? "text-sse-ink"}`}>{value}</p>
      {sub && <p className="text-[11px] text-sse-muted mt-1">{sub}</p>}
    </Link>
  );
}

function fmtSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const STATUS_COLORS: Record<string, string> = {
  "Pendiente":     "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Cargada":       "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "En validación": "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  "Validada":      "bg-sse-sem-green-bg text-sse-sem-green-fg",
  "Rechazada":     "bg-sse-sem-red-bg text-sse-sem-red-fg",
  "Archivada":     "bg-sse-muted/10 text-sse-muted",
};

export function WorkspaceEME({ wsId }: Props) {
  const { data: dashboard, isLoading } = useEMEDashboard();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-56" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-md" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[18px] font-semibold text-sse-ink">Gestión de Evidencias</h1>
        <p className="text-[13px] text-sse-muted mt-0.5">
          Repositorio institucional de evidencias versionadas, clasificadas y auditables.
        </p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total"
          value={dashboard?.total ?? 0}
          sub="evidencias registradas"
          href={`/ws/${wsId}/eme-repositorio`}
          accent="text-sse-ink"
        />
        <StatCard
          label="Pendientes"
          value={dashboard?.pending ?? 0}
          sub="por cargar"
          href={`/ws/${wsId}/eme-repositorio`}
          accent="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label="Validadas"
          value={dashboard?.validated ?? 0}
          sub="aprobadas"
          href={`/ws/${wsId}/eme-repositorio`}
          accent="text-sse-sem-green-fg"
        />
        <StatCard
          label="Rechazadas"
          value={dashboard?.rejected ?? 0}
          sub="requieren atención"
          href={`/ws/${wsId}/eme-validacion`}
          accent={dashboard?.rejected ? "text-sse-sem-red-fg" : "text-sse-ink"}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-sse-surface border border-sse-border rounded-md p-4">
          <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-2">En validación</p>
          <p className="text-[22px] font-bold text-sse-ink font-mono">{dashboard?.inReview ?? 0}</p>
          <p className="text-[11px] text-sse-muted mt-1">pendientes de revisión</p>
        </div>
        <div className="bg-sse-surface border border-sse-border rounded-md p-4">
          <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-2">Hoy</p>
          <p className="text-[22px] font-bold text-sse-ink font-mono">{dashboard?.today ?? 0}</p>
          <p className="text-[11px] text-sse-muted mt-1">evidencias cargadas hoy</p>
        </div>
        <div className="bg-sse-surface border border-sse-border rounded-md p-4">
          <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-2">Tamaño total</p>
          <p className="text-[22px] font-bold text-sse-ink font-mono">{fmtSize(dashboard?.totalSize ?? 0)}</p>
          <p className="text-[11px] text-sse-muted mt-1">almacenamiento lógico</p>
        </div>
      </div>

      {/* By status breakdown */}
      {(dashboard?.byStatus ?? []).length > 0 && (
        <div className="bg-sse-surface border border-sse-border rounded-md p-4">
          <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-3">Por estado</p>
          <div className="flex flex-wrap gap-2">
            {dashboard!.byStatus.filter((s) => s.count > 0).map((s) => (
              <div
                key={s.status}
                className={`rounded-full px-3 py-1 text-[12px] font-medium flex items-center gap-1.5 ${STATUS_COLORS[s.status] ?? "bg-sse-muted/10 text-sse-muted"}`}
              >
                <span>{s.status}</span>
                <span className="font-bold font-mono">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent evidences */}
      {(dashboard?.recentEvidences ?? []).length > 0 && (
        <div className="bg-sse-surface border border-sse-border rounded-md p-4">
          <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-3">
            Últimas evidencias cargadas
          </p>
          <div className="space-y-2">
            {dashboard!.recentEvidences.slice(0, 8).map((e: EMEEvidence) => (
              <Link
                key={e.id}
                href={`/ws/${wsId}/eme-evidencias/${e.id}`}
                className="flex items-center justify-between py-1.5 border-b border-sse-border last:border-0 hover:text-sse-primary transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-sse-ink truncate">{e.title}</p>
                  <p className="text-[11px] text-sse-muted">
                    {e.uploadedBy} · {e.uploadedAt?.slice(0, 10)} · v{e.version}
                  </p>
                </div>
                <span
                  className={`shrink-0 ml-3 text-[11px] font-medium rounded-full px-2 py-0.5 ${STATUS_COLORS[e.status] ?? "bg-sse-muted/10 text-sse-muted"}`}
                >
                  {e.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* By type */}
      {(dashboard?.byType ?? []).length > 0 && (
        <div className="bg-sse-surface border border-sse-border rounded-md p-4">
          <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-3">Por tipo</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {dashboard!.byType.slice(0, 8).map((t) => (
              <div key={t.type} className="text-center">
                <p className="text-[20px] font-bold font-mono text-sse-ink">{t.count}</p>
                <p className="text-[11px] text-sse-muted capitalize">{t.type.replace(/-/g, " ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="bg-sse-surface border border-sse-border rounded-md p-4">
        <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-3">
          Acciones rápidas
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/ws/${wsId}/eme-carga/nuevo`}
            className="inline-flex items-center gap-1.5 rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink hover:border-sse-primary/50 transition-colors"
          >
            + Cargar evidencia
          </Link>
          <Link
            href={`/ws/${wsId}/eme-repositorio`}
            className="inline-flex items-center gap-1.5 rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink hover:border-sse-primary/50 transition-colors"
          >
            Ver repositorio
          </Link>
          <Link
            href={`/ws/${wsId}/eme-validacion`}
            className="inline-flex items-center gap-1.5 rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink hover:border-sse-primary/50 transition-colors"
          >
            Validación
          </Link>
          <Link
            href={`/ws/${wsId}/eme-mis-evidencias`}
            className="inline-flex items-center gap-1.5 rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink hover:border-sse-primary/50 transition-colors"
          >
            Mis evidencias
          </Link>
        </div>
      </div>
    </div>
  );
}
