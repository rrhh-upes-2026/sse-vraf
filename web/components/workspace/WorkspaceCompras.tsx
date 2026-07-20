"use client";

import Link from "next/link";
import type { WorkspaceId } from "@/config/nav";
import type {
  ComprasSolicitud,
  ComprasOrden,
  ComprasEstadoOrden,
} from "@/types/entities";
import {
  useComprasDashboard,
  useSolicitudesCompra,
  useOrdenesCompra,
} from "@/hooks/useCompras";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, fmtShortDate } from "@/lib/utils";

// ── helpers ───────────────────────────────────────────────────────────────────

const PRIORIDAD_VARIANT: Record<string, BadgeVariant> = {
  normal:  "default",
  urgente: "warning",
  critica: "danger",
};

const ESTADO_SOL_VARIANT: Record<string, BadgeVariant> = {
  pendiente:   "warning",
  en_revision: "info",
  aprobada:    "success",
  rechazada:   "danger",
  archivada:   "gray",
};

const ESTADO_OC_VARIANT: Record<ComprasEstadoOrden, BadgeVariant> = {
  borrador:  "gray",
  emitida:   "info",
  recibida:  "success",
  pagada:    "success",
  cancelada: "danger",
};

const ESTADO_SOL_LABEL: Record<string, string> = {
  pendiente:   "Pendiente",
  en_revision: "En revisión",
  aprobada:    "Aprobada",
  rechazada:   "Rechazada",
  archivada:   "Archivada",
};

const ESTADO_OC_LABEL: Record<ComprasEstadoOrden, string> = {
  borrador:  "Borrador",
  emitida:   "Emitida",
  recibida:  "Recibida",
  pagada:    "Pagada",
  cancelada: "Cancelada",
};

function fmtCurrency(value: number): string {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

// ── KPI tile ─────────────────────────────────────────────────────────────────

interface KpiTileProps {
  label: string;
  value: number | string;
  sub?: string;
  accent?: "default" | "warning" | "success" | "danger";
  icon: string;
}

function KpiTile({ label, value, sub, accent = "default", icon }: KpiTileProps) {
  const accentClass = {
    default: "text-sse-primary",
    warning: "text-[#E5A100]",
    success: "text-sse-sem-green-fg",
    danger:  "text-sse-sem-red-fg",
  }[accent];
  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-4 flex items-start gap-3">
      <div className={cn("mt-0.5 shrink-0", accentClass)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-sse-muted leading-none mb-1">{label}</p>
        <p className={cn("text-[22px] font-bold leading-none", accentClass)}>{value}</p>
        {sub && <p className="text-[10px] text-sse-muted mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ── Solicitud row ─────────────────────────────────────────────────────────────

function SolicitudRow({ sol, wsId }: { sol: ComprasSolicitud; wsId: WorkspaceId }) {
  return (
    <div className="flex items-center justify-between gap-2 py-2.5 border-b border-sse-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] font-medium text-sse-ink truncate">{sol.titulo}</p>
        <p className="text-[11px] text-sse-muted">
          {sol.fechaSolicitud ? fmtShortDate(sol.fechaSolicitud) : "—"}
          {sol.monto ? ` · ${fmtCurrency(sol.monto)}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {sol.prioridad !== "normal" && (
          <Badge variant={PRIORIDAD_VARIANT[sol.prioridad]} className="text-[10px]">
            {sol.prioridad}
          </Badge>
        )}
        <Badge variant={ESTADO_SOL_VARIANT[sol.estado] ?? "default"} className="text-[10px]">
          {ESTADO_SOL_LABEL[sol.estado] ?? sol.estado}
        </Badge>
      </div>
    </div>
  );
}

// ── Orden row ─────────────────────────────────────────────────────────────────

function OrdenRow({ orden }: { orden: ComprasOrden }) {
  return (
    <div className="flex items-center justify-between gap-2 py-2.5 border-b border-sse-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] font-medium text-sse-ink truncate">
          {orden.codigo ?? orden.id.slice(0, 8).toUpperCase()}
        </p>
        <p className="text-[11px] text-sse-muted">
          {orden.fechaEmision ? fmtShortDate(orden.fechaEmision) : "—"}
          {` · ${fmtCurrency(orden.monto)}`}
        </p>
      </div>
      <Badge variant={ESTADO_OC_VARIANT[orden.estado]} className="shrink-0 text-[10px]">
        {ESTADO_OC_LABEL[orden.estado]}
      </Badge>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface WorkspaceComprasProps {
  wsId: WorkspaceId;
}

export function WorkspaceCompras({ wsId }: WorkspaceComprasProps) {
  const { data: resumen, isLoading: loadingResumen } = useComprasDashboard(wsId);
  const { data: solicitudes, isLoading: loadingSols } = useSolicitudesCompra({ wsId, _pageSize: 6 });
  const { data: ordenes, isLoading: loadingOCs } = useOrdenesCompra({ wsId, _pageSize: 5 });

  const solicitudesUrgentes = (solicitudes ?? []).filter(
    (s) => s.prioridad === "urgente" || s.prioridad === "critica",
  );
  const ordenesAbiertas = (ordenes ?? []).filter(
    (o) => o.estado === "borrador" || o.estado === "emitida",
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[18px] font-semibold text-sse-ink">Dashboard — Compras y Adquisiciones</h1>
        <p className="text-[13px] text-sse-muted mt-0.5">
          Resumen ejecutivo del ciclo de abastecimiento institucional
        </p>
      </div>

      {/* KPI Grid */}
      {loadingResumen && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0,1,2,3].map((i) => <Skeleton key={i} className="h-[88px] rounded-md" />)}
        </div>
      )}
      {resumen && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiTile
            label="Solicitudes activas"
            value={resumen.solicitudesActivas}
            icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
          <KpiTile
            label="Solicitudes urgentes"
            value={resumen.solicitudesUrgentes}
            accent={resumen.solicitudesUrgentes > 0 ? "warning" : "default"}
            icon="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
          />
          <KpiTile
            label="Órdenes abiertas"
            value={resumen.ordenesAbiertas}
            icon="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M15 5a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2"
          />
          <KpiTile
            label="Monto ejecutado"
            value={fmtCurrency(resumen.montoEjecutado)}
            sub="en órdenes cerradas"
            accent="success"
            icon="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33"
          />
          <KpiTile
            label="Órdenes cerradas"
            value={resumen.ordenesCerradas}
            accent="success"
            icon="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
          />
          <KpiTile
            label="Proveedores activos"
            value={resumen.proveedoresActivos}
            icon="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4"
          />
          <KpiTile
            label="Cotizaciones pendientes"
            value={resumen.cotizacionesPendientes}
            accent={resumen.cotizacionesPendientes > 0 ? "warning" : "default"}
            icon="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
          />
          <KpiTile
            label="Recepciones pendientes"
            value={resumen.recepcionesPendientes}
            accent={resumen.recepcionesPendientes > 0 ? "warning" : "default"}
            icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </div>
      )}

      {/* Two-column layout: Solicitudes + Órdenes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Solicitudes recientes */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-semibold text-sse-ink">Solicitudes recientes</h2>
            <Link href={`/ws/${wsId}/solicitudes-compra`}>
              <span className="text-[12px] text-sse-primary hover:underline">Ver todas</span>
            </Link>
          </div>

          {loadingSols && (
            <div className="space-y-2">
              {[0,1,2].map((i) => <Skeleton key={i} className="h-10 w-full rounded" />)}
            </div>
          )}

          {!loadingSols && (solicitudes ?? []).length === 0 && (
            <EmptyState
              icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              title="Sin solicitudes"
              description="No hay solicitudes de compra registradas."
            />
          )}

          {!loadingSols && (solicitudes ?? []).length > 0 && (
            <div>
              {(solicitudes ?? []).map((s) => (
                <SolicitudRow key={s.id} sol={s} wsId={wsId} />
              ))}
            </div>
          )}

          {solicitudesUrgentes.length > 0 && (
            <div className="mt-3 rounded-md bg-[#FEF3C7] dark:bg-[#78350F]/20 border border-[#D97706]/30 px-3 py-2">
              <p className="text-[11.5px] font-medium text-[#92400E] dark:text-[#FCD34D]">
                {solicitudesUrgentes.length} solicitud{solicitudesUrgentes.length > 1 ? "es" : ""} urgente{solicitudesUrgentes.length > 1 ? "s" : ""} requieren atención
              </p>
            </div>
          )}
        </section>

        {/* Órdenes abiertas */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-semibold text-sse-ink">Órdenes de compra</h2>
            <Link href={`/ws/${wsId}/ordenes`}>
              <span className="text-[12px] text-sse-primary hover:underline">Ver todas</span>
            </Link>
          </div>

          {loadingOCs && (
            <div className="space-y-2">
              {[0,1,2].map((i) => <Skeleton key={i} className="h-10 w-full rounded" />)}
            </div>
          )}

          {!loadingOCs && (ordenes ?? []).length === 0 && (
            <EmptyState
              icon="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M15 5a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2"
              title="Sin órdenes"
              description="No hay órdenes de compra registradas."
            />
          )}

          {!loadingOCs && (ordenes ?? []).length > 0 && (
            <div>
              {(ordenes ?? []).map((o) => (
                <OrdenRow key={o.id} orden={o} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Quick links */}
      <section>
        <h2 className="text-[14px] font-semibold text-sse-ink mb-3">Acceso rápido</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { href: "solicitudes-compra", label: "Solicitudes", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
            { href: "requisiciones", label: "Requisiciones", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2" },
            { href: "cotizaciones", label: "Cotizaciones", icon: "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" },
            { href: "ordenes", label: "Órdenes OC", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M15 5a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2" },
            { href: "recepcion", label: "Recepción", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
            { href: "proveedores", label: "Proveedores", icon: "M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" },
          ].map((link) => (
            <Link
              key={link.href}
              href={`/ws/${wsId}/${link.href}`}
              className="flex flex-col items-center gap-1.5 p-3 rounded-md border border-sse-border bg-sse-surface hover:border-sse-primary/40 transition-colors text-center"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                className="w-5 h-5 text-sse-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
              </svg>
              <span className="text-[11px] font-medium text-sse-muted">{link.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
