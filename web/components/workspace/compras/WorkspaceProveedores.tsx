"use client";

import { useState } from "react";
import type { WorkspaceId } from "@/config/nav";
import type { ComprasProveedor, ComprasCalificacion, ComprasEstadoProveedor } from "@/types/entities";
import { useProveedores } from "@/hooks/useCompras";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";

const ESTADO_VARIANT: Record<ComprasEstadoProveedor, BadgeVariant> = {
  activo:     "success",
  inactivo:   "gray",
  suspendido: "danger",
};

const ESTADO_LABEL: Record<ComprasEstadoProveedor, string> = {
  activo:     "Activo",
  inactivo:   "Inactivo",
  suspendido: "Suspendido",
};

const CALIFICACION_VARIANT: Record<ComprasCalificacion, BadgeVariant> = {
  A: "success",
  B: "info",
  C: "warning",
  D: "danger",
};

const FILTROS: Array<{ value: ComprasEstadoProveedor | "todos"; label: string }> = [
  { value: "todos",      label: "Todos" },
  { value: "activo",     label: "Activos" },
  { value: "inactivo",   label: "Inactivos" },
  { value: "suspendido", label: "Suspendidos" },
];

function ProveedorCard({ prov }: { prov: ComprasProveedor }) {
  return (
    <div className={cn(
      "bg-sse-surface border rounded-md p-4 flex flex-col gap-2 transition-colors",
      prov.estado === "suspendido"
        ? "border-sse-sem-red-fg/40 opacity-70"
        : "border-sse-border hover:border-sse-primary/40"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-sse-ink leading-snug truncate">
            {prov.razonSocial}
          </p>
          {prov.nombreComercial && prov.nombreComercial !== prov.razonSocial && (
            <p className="text-[11px] text-sse-muted truncate">{prov.nombreComercial}</p>
          )}
          {prov.nit && (
            <p className="text-[11px] font-mono text-sse-muted">NIT: {prov.nit}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge variant={ESTADO_VARIANT[prov.estado]} className="text-[10px]">
            {ESTADO_LABEL[prov.estado]}
          </Badge>
          {prov.calificacion && (
            <Badge variant={CALIFICACION_VARIANT[prov.calificacion]} className="text-[10px]">
              Cal. {prov.calificacion}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        {prov.categoria && (
          <>
            <span className="text-sse-muted">Categoría</span>
            <span className="font-medium text-sse-ink text-right truncate">{prov.categoria}</span>
          </>
        )}
        {prov.contactoNombre && (
          <>
            <span className="text-sse-muted">Contacto</span>
            <span className="font-medium text-sse-ink text-right truncate">{prov.contactoNombre}</span>
          </>
        )}
        {prov.cantidadOrdenes != null && (
          <>
            <span className="text-sse-muted">Órdenes</span>
            <span className="font-medium text-sse-ink text-right">{prov.cantidadOrdenes}</span>
          </>
        )}
        {prov.totalCompras != null && (
          <>
            <span className="text-sse-muted">Total compras</span>
            <span className="font-medium text-sse-ink text-right">${prov.totalCompras.toLocaleString()}</span>
          </>
        )}
        {prov.ultimaCompraFecha && (
          <>
            <span className="text-sse-muted">Última compra</span>
            <span className="font-medium text-sse-ink text-right">{fmtShortDate(prov.ultimaCompraFecha)}</span>
          </>
        )}
      </div>

      {prov.contactoEmail && (
        <p className="text-[11px] text-sse-muted border-t border-sse-border pt-2 truncate">
          {prov.contactoEmail}
          {prov.contactoTel ? ` · ${prov.contactoTel}` : ""}
        </p>
      )}
    </div>
  );
}

export function WorkspaceProveedores({ wsId }: { wsId: WorkspaceId }) {
  const [filtro, setFiltro] = useState<ComprasEstadoProveedor | "todos">("todos");
  const { data: proveedores, isLoading } = useProveedores({ wsId });

  const filtered = (proveedores ?? []).filter((p) =>
    filtro === "todos" ? p.deletedAt == null : p.estado === filtro,
  );

  const activos = (proveedores ?? []).filter((p) => p.estado === "activo").length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-sse-ink">Proveedores</h1>
          <p className="text-[13px] text-sse-muted mt-0.5">Registro y calificación de proveedores habilitados</p>
        </div>
        {activos > 0 && (
          <div className="text-right">
            <p className="text-[11px] text-sse-muted">{activos} activos</p>
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
          {[0,1,2].map((i) => <SkeletonCard key={i} className="h-[170px]" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4"
          title="Sin proveedores"
          description="No se encontraron proveedores con el filtro seleccionado."
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => <ProveedorCard key={p.id} prov={p} />)}
        </div>
      )}
    </div>
  );
}
