"use client";

import Link from "next/link";
import { usePMEDashboard } from "@/hooks/usePME";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  wsId: string;
}

function StatCard({
  label,
  total,
  activos,
  archivados,
  href,
}: {
  label: string;
  total: number;
  activos: number;
  archivados: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-sse-surface border border-sse-border rounded-md p-4 hover:border-sse-primary/40 transition-colors"
    >
      <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-3">{label}</p>
      <p className="text-[28px] font-bold text-sse-ink font-mono">{total}</p>
      <div className="flex gap-4 mt-2">
        <span className="text-[12px] text-sse-sem-green-fg">{activos} activos</span>
        <span className="text-[12px] text-sse-muted">{archivados} archivados</span>
      </div>
    </Link>
  );
}

export function WorkspacePME({ wsId }: Props) {
  const { data: dashboard, isLoading } = usePMEDashboard();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[18px] font-semibold text-sse-ink">Gestión de Procesos</h1>
        <p className="text-[13px] text-sse-muted mt-0.5">
          Estructura operativa institucional: procesos, procedimientos y actividades.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Procesos"
          total={dashboard?.procesos.total ?? 0}
          activos={dashboard?.procesos.activos ?? 0}
          archivados={dashboard?.procesos.archivados ?? 0}
          href={`/ws/${wsId}/procesos-pme`}
        />
        <StatCard
          label="Procedimientos"
          total={dashboard?.procedimientos.total ?? 0}
          activos={dashboard?.procedimientos.activos ?? 0}
          archivados={dashboard?.procedimientos.archivados ?? 0}
          href={`/ws/${wsId}/procedimientos`}
        />
        <StatCard
          label="Actividades"
          total={dashboard?.actividades.total ?? 0}
          activos={dashboard?.actividades.activos ?? 0}
          archivados={dashboard?.actividades.archivados ?? 0}
          href={`/ws/${wsId}/actividades-pme`}
        />
      </div>

      <div className="bg-sse-surface border border-sse-border rounded-md p-4">
        <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-3">
          Acciones rápidas
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/ws/${wsId}/procesos-pme/nuevo`}
            className="inline-flex items-center gap-1.5 rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink hover:border-sse-primary/50 transition-colors"
          >
            + Nuevo Proceso
          </Link>
          <Link
            href={`/ws/${wsId}/procedimientos/nuevo`}
            className="inline-flex items-center gap-1.5 rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink hover:border-sse-primary/50 transition-colors"
          >
            + Nuevo Procedimiento
          </Link>
          <Link
            href={`/ws/${wsId}/actividades-pme/nuevo`}
            className="inline-flex items-center gap-1.5 rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink hover:border-sse-primary/50 transition-colors"
          >
            + Nueva Actividad
          </Link>
        </div>
      </div>
    </div>
  );
}
