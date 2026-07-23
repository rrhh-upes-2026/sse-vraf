"use client";

import Link from "next/link";
import { useAPEDashboard } from "@/hooks/useAPE";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  wsId: string;
}

const CURRENT_YEAR = new Date().getFullYear().toString();

const STATUS_COLORS: Record<string, string> = {
  Programada: "text-sse-sem-green-fg",
  Próxima:    "text-blue-600 dark:text-blue-400",
  Pendiente:  "text-amber-600 dark:text-amber-400",
  Archivada:  "text-sse-muted",
  Cancelada:  "text-sse-sem-red-fg",
};

function StatCard({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: number;
  sub?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-sse-surface border border-sse-border rounded-md p-4 hover:border-sse-primary/40 transition-colors"
    >
      <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-3">{label}</p>
      <p className="text-[28px] font-bold text-sse-ink font-mono">{value}</p>
      {sub && <p className="text-[12px] text-sse-muted mt-1">{sub}</p>}
    </Link>
  );
}

export function WorkspaceAPE({ wsId }: Props) {
  const { data: dashboard, isLoading } = useAPEDashboard(CURRENT_YEAR);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-56" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  const total = dashboard?.total ?? 0;
  const programadas = dashboard?.byStatus?.["Programada"] ?? 0;
  const proximas    = dashboard?.byStatus?.["Próxima"]    ?? 0;
  const pendientes  = dashboard?.byStatus?.["Pendiente"]  ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[18px] font-semibold text-sse-ink">Planificación Institucional</h1>
        <p className="text-[13px] text-sse-muted mt-0.5">
          Planes de actividades para el año {CURRENT_YEAR}.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Planes"
          value={total}
          sub={`Año ${CURRENT_YEAR}`}
          href={`/ws/${wsId}/ape-tabla`}
        />
        <StatCard
          label="Programadas"
          value={programadas}
          href={`/ws/${wsId}/ape-tabla`}
        />
        <StatCard
          label="Próximas"
          value={proximas}
          href={`/ws/${wsId}/ape-tabla`}
        />
        <StatCard
          label="Pendientes"
          value={pendientes}
          href={`/ws/${wsId}/ape-tabla`}
        />
      </div>

      {/* Próximas ejecuciones */}
      {(dashboard?.upcoming ?? []).length > 0 && (
        <div className="bg-sse-surface border border-sse-border rounded-md p-4">
          <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-3">
            Próximas ejecuciones
          </p>
          <div className="space-y-2">
            {dashboard!.upcoming.slice(0, 5).map((plan) => (
              <Link
                key={plan.id}
                href={`/ws/${wsId}/ape-planes/${plan.id}`}
                className="flex items-center justify-between py-2 border-b border-sse-border last:border-0 hover:text-sse-primary transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-sse-ink truncate">{plan.title}</p>
                  <p className="text-[12px] text-sse-muted">{plan.plannedStartDate}</p>
                </div>
                <span className={`text-[11px] font-medium shrink-0 ml-3 ${STATUS_COLORS[plan.status] ?? "text-sse-muted"}`}>
                  {plan.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="bg-sse-surface border border-sse-border rounded-md p-4">
        <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-3">
          Acciones rápidas
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/ws/${wsId}/ape-planes/nuevo`}
            className="inline-flex items-center gap-1.5 rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink hover:border-sse-primary/50 transition-colors"
          >
            + Nuevo Plan
          </Link>
          <Link
            href={`/ws/${wsId}/ape-calendario`}
            className="inline-flex items-center gap-1.5 rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink hover:border-sse-primary/50 transition-colors"
          >
            Ver Calendario
          </Link>
          <Link
            href={`/ws/${wsId}/ape-cronograma`}
            className="inline-flex items-center gap-1.5 rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink hover:border-sse-primary/50 transition-colors"
          >
            Ver Cronograma
          </Link>
        </div>
      </div>
    </div>
  );
}
