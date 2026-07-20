"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { ContaCompromiso, ContaEstadoCompromiso } from "@/types/entities";
import { useCompromisos } from "@/hooks/useContabilidad";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";

const ESTADO_VARIANT: Record<ContaEstadoCompromiso, BadgeVariant> = {
  borrador:     "gray",
  comprometido: "info",
  ejecutado:    "success",
  anulado:      "danger",
};

const ESTADO_LABEL: Record<ContaEstadoCompromiso, string> = {
  borrador:     "Borrador",
  comprometido: "Comprometido",
  ejecutado:    "Ejecutado",
  anulado:      "Anulado",
};

const FILTROS: Array<{ value: ContaEstadoCompromiso | "todos"; label: string }> = [
  { value: "todos",        label: "Todos" },
  { value: "comprometido", label: "Comprometidos" },
  { value: "ejecutado",    label: "Ejecutados" },
  { value: "borrador",     label: "Borradores" },
];

function CompromisoCard({ comp }: { comp: ContaCompromiso }) {
  const pctEjec = comp.monto > 0
    ? Math.round((comp.montoEjecutado / comp.monto) * 100)
    : 0;

  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-4 flex flex-col gap-2 hover:border-sse-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {comp.numero && (
            <p className="text-[11px] font-mono text-sse-primary">{comp.numero}</p>
          )}
          <p className="text-[13px] font-semibold text-sse-ink leading-snug line-clamp-2 mt-0.5">{comp.concepto}</p>
          <p className="text-[11px] text-sse-muted capitalize">{comp.tipo}</p>
        </div>
        <Badge variant={ESTADO_VARIANT[comp.estado]} className="shrink-0 text-[10px]">
          {ESTADO_LABEL[comp.estado]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <span className="text-sse-muted">Monto</span>
        <span className="font-bold text-sse-ink text-right">${comp.monto.toLocaleString()}</span>
        <span className="text-sse-muted">Ejecutado</span>
        <span className="font-medium text-sse-ink text-right">
          ${comp.montoEjecutado.toLocaleString()} <span className="text-sse-muted">({pctEjec}%)</span>
        </span>
        {comp.centroCosto && (
          <>
            <span className="text-sse-muted">Centro costo</span>
            <span className="font-medium text-sse-ink text-right truncate">{comp.centroCosto}</span>
          </>
        )}
        {comp.fechaVencimiento && (
          <>
            <span className="text-sse-muted">Vencimiento</span>
            <span className={cn(
              "font-medium text-right",
              comp.estado === "comprometido" && new Date(comp.fechaVencimiento) < new Date()
                ? "text-sse-sem-red-fg"
                : "text-sse-ink"
            )}>{fmtShortDate(comp.fechaVencimiento)}</span>
          </>
        )}
      </div>

      {/* Barra de ejecución */}
      {comp.estado !== "borrador" && (
        <div className="mt-1">
          <div className="h-1.5 bg-sse-border rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all",
                pctEjec >= 90 ? "bg-sse-sem-red-fg" : pctEjec >= 70 ? "bg-sse-sem-yellow-fg" : "bg-sse-sem-green-fg"
              )}
              style={{ width: `${Math.min(100, pctEjec)}%` }}
            />
          </div>
        </div>
      )}

      {/* Referencia Compras */}
      {comp.ordenCompraRef && (
        <p className="text-[11px] text-sse-muted border-t border-sse-border pt-2">
          OC: <span className="font-medium text-sse-ink">{comp.ordenCompraRef}</span>
          {comp.proveedorRef ? ` · ${comp.proveedorRef}` : ""}
        </p>
      )}
    </div>
  );
}

export function WorkspaceCompromisos({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<ContaEstadoCompromiso | "todos">("todos");
  const { data: compromisos, isLoading } = useCompromisos({ wsId });

  const filtered = (compromisos ?? []).filter((c) =>
    filtro === "todos" ? c.deletedAt == null : c.estado === filtro,
  );

  const totalMonto = filtered.reduce((acc, c) => acc + (c.monto ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Compromisos Presupuestarios</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Ejecución y seguimiento de compromisos de gasto</p>
        </div>
        {filtered.length > 0 && (
          <div className="text-right">
            <p className="text-[11px] text-sse-muted">{filtered.length} compromisos</p>
            <p className="text-[15px] font-bold text-sse-ink">${totalMonto.toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {FILTROS.map((f) => (
          <button key={f.value} onClick={() => setFiltro(f.value)}
            className={cn("px-3 py-1 rounded-full text-[12px] font-medium border transition-colors",
              filtro === f.value
                ? "bg-sse-primary text-white border-sse-primary"
                : "bg-sse-surface text-sse-muted border-sse-border hover:border-sse-primary/40")}>
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[0,1,2].map((i) => <SkeletonCard key={i} className="h-[180px]" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"
          title="Sin compromisos"
          description="No se encontraron compromisos con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => <CompromisoCard key={c.id} comp={c} />)}
        </div>
      )}
    </div>
  );
}
