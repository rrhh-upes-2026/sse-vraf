"use client";

import Link from "next/link";
import { useAEEDashboard } from "@/hooks/useAEE";
import { Skeleton } from "@/components/ui/skeleton";

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

function fmtDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function WorkspaceAEE({ wsId }: Props) {
  const { data: dashboard, isLoading } = useAEEDashboard();

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
        <h1 className="text-[18px] font-semibold text-sse-ink">Ejecución Institucional</h1>
        <p className="text-[13px] text-sse-muted mt-0.5">
          Registro oficial de la ejecución de actividades planificadas.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Hoy"
          value={dashboard?.today ?? 0}
          sub="ejecuciones registradas"
          href={`/ws/${wsId}/aee-registro`}
          accent="text-sse-sem-green-fg"
        />
        <StatCard
          label="En ejecución"
          value={dashboard?.inProgress ?? 0}
          sub="activas ahora"
          href={`/ws/${wsId}/aee-registro`}
          accent="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Pendientes"
          value={dashboard?.pending ?? 0}
          sub="por ejecutar"
          href={`/ws/${wsId}/aee-mis-actividades`}
          accent="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label="Con incidentes"
          value={dashboard?.withIncidents ?? 0}
          sub="requieren atención"
          href={`/ws/${wsId}/aee-historial`}
          accent={dashboard?.withIncidents ? "text-sse-sem-red-fg" : "text-sse-ink"}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-sse-surface border border-sse-border rounded-md p-4">
          <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-2">
            Tiempo promedio
          </p>
          <p className="text-[22px] font-bold text-sse-ink font-mono">
            {fmtDuration(dashboard?.avgDurationMinutes ?? 0)}
          </p>
          <p className="text-[11px] text-sse-muted mt-1">por ejecución</p>
        </div>
        <div className="bg-sse-surface border border-sse-border rounded-md p-4">
          <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-2">
            Reprogramadas
          </p>
          <p className="text-[22px] font-bold text-sse-ink font-mono">
            {dashboard?.rescheduled ?? 0}
          </p>
          <p className="text-[11px] text-sse-muted mt-1">pendientes de reagendar</p>
        </div>
        <div className="bg-sse-surface border border-sse-border rounded-md p-4">
          <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-2">
            Total registros
          </p>
          <p className="text-[22px] font-bold text-sse-ink font-mono">
            {dashboard?.total ?? 0}
          </p>
          <p className="text-[11px] text-sse-muted mt-1">historial completo</p>
        </div>
      </div>

      {/* Today's executions */}
      {(dashboard?.todayExecutions ?? []).length > 0 && (
        <div className="bg-sse-surface border border-sse-border rounded-md p-4">
          <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-3">
            Ejecuciones de hoy
          </p>
          <div className="space-y-2">
            {dashboard!.todayExecutions.slice(0, 5).map((e) => (
              <Link
                key={e.id}
                href={`/ws/${wsId}/aee-ejecuciones/${e.id}`}
                className="flex items-center justify-between py-1.5 border-b border-sse-border last:border-0 hover:text-sse-primary transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-sse-ink">
                    #{e.executionNumber} — {e.executedBy}
                  </p>
                  <p className="text-[11px] text-sse-muted">
                    {e.startTime && e.endTime ? `${e.startTime} – ${e.endTime}` : e.executionDate}
                  </p>
                </div>
                <span className="text-[11px] text-sse-muted shrink-0 ml-3">{e.status}</span>
              </Link>
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
            href={`/ws/${wsId}/aee-registro/nuevo`}
            className="inline-flex items-center gap-1.5 rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink hover:border-sse-primary/50 transition-colors"
          >
            + Registrar ejecución
          </Link>
          <Link
            href={`/ws/${wsId}/aee-mis-actividades`}
            className="inline-flex items-center gap-1.5 rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink hover:border-sse-primary/50 transition-colors"
          >
            Mis actividades
          </Link>
          <Link
            href={`/ws/${wsId}/aee-historial`}
            className="inline-flex items-center gap-1.5 rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink hover:border-sse-primary/50 transition-colors"
          >
            Ver historial
          </Link>
        </div>
      </div>
    </div>
  );
}
