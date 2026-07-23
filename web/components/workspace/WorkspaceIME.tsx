"use client";

import { useRouter } from "next/navigation";
import { useIMEDashboard, useIMEIndicadores } from "@/hooks/useIME";
import type { WorkspaceId } from "@/config/nav";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface Props {
  wsId: WorkspaceId;
}

function StatCard({ label, value, color }: { label: string; value: number | undefined; color: string }) {
  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-4 flex flex-col gap-1">
      <p className="text-[12px] text-sse-muted">{label}</p>
      <p className="text-[28px] font-bold" style={{ color }}>
        {value ?? "—"}
      </p>
    </div>
  );
}

export function WorkspaceIME({ wsId }: Props) {
  const router = useRouter();
  const { data: resumen, isLoading: loadingResumen } = useIMEDashboard();
  const { data: recientes, isLoading: loadingRecientes } = useIMEIndicadores({
    active: "true",
    _pageSize: 5,
    _sortBy: "updatedAt",
    _sortDir: "desc",
  } as Parameters<typeof useIMEIndicadores>[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold text-sse-ink">Gestión de Indicadores</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">
            Motor de indicadores institucionales (IME)
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => router.push(`/ws/${wsId}/gestion-indicadores/nuevo`)}
        >
          + Nuevo Indicador
        </Button>
      </div>

      {/* Stats */}
      {loadingResumen ? (
        <div className="grid grid-cols-3 gap-4">
          {[0,1,2].map((i) => <Skeleton key={i} className="h-20 rounded-md" />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total"     value={resumen?.total}     color="#7C3AED" />
          <StatCard label="Activos"   value={resumen?.activos}   color="#059669" />
          <StatCard label="Inactivos" value={resumen?.inactivos} color="#6B7280" />
        </div>
      )}

      {/* Recent active indicators */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold text-sse-ink">Indicadores Activos Recientes</h2>
          <button
            onClick={() => router.push(`/ws/${wsId}/gestion-indicadores`)}
            className="text-[12px] text-sse-primary hover:underline"
          >
            Ver todos →
          </button>
        </div>

        {loadingRecientes ? (
          <div className="space-y-2">
            {[0,1,2].map((i) => <Skeleton key={i} className="h-14 rounded-md" />)}
          </div>
        ) : (recientes ?? []).length === 0 ? (
          <div className="rounded-md border border-sse-border bg-sse-surface p-6 text-center">
            <p className="text-[13px] text-sse-muted">No hay indicadores activos.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => router.push(`/ws/${wsId}/gestion-indicadores/nuevo`)}
            >
              Crear primer indicador
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {(recientes ?? []).map((ind) => (
              <button
                key={ind.id}
                onClick={() => router.push(`/ws/${wsId}/gestion-indicadores/${ind.id}`)}
                className="w-full text-left bg-sse-surface border border-sse-border rounded-md px-4 py-2.5 hover:border-sse-primary/40 transition-colors flex items-center gap-3"
              >
                <span className="text-[11px] font-mono text-sse-muted bg-sse-bg border border-sse-border rounded px-1.5 py-0.5 shrink-0">
                  {ind.code}
                </span>
                <span className="text-[13px] text-sse-ink font-medium flex-1 truncate">{ind.name}</span>
                <span className="text-[11px] text-sse-muted shrink-0">{ind.frequency}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
