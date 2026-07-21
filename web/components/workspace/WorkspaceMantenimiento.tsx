"use client";

import type { WorkspaceId } from "@/config/nav";
import { useMantenimientoDashboard } from "@/hooks/useMantenimiento";
import { cn } from "@/lib/utils";

function KpiTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "green" | "yellow" | "red" | "blue";
}) {
  const accentClass = {
    green:  "text-sse-sem-green-fg",
    yellow: "text-sse-sem-yellow-fg",
    red:    "text-sse-sem-red-fg",
    blue:   "text-sse-primary",
  }[accent ?? "blue"];

  return (
    <div className="bg-sse-surface border border-sse-border rounded-md p-4 flex flex-col gap-1">
      <p className="text-[11px] text-sse-muted uppercase tracking-wide">{label}</p>
      <p className={cn("text-[22px] font-bold leading-none", accentClass)}>{value}</p>
      {sub && <p className="text-[11px] text-sse-muted">{sub}</p>}
    </div>
  );
}

function KpiSkeleton() {
  return <div className="bg-sse-surface border border-sse-border rounded-md p-4 h-[80px] animate-pulse" />;
}

function QuickLink({ label, href, icon }: { label: string; href: string; icon: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 bg-sse-surface border border-sse-border rounded-md px-3 py-2 text-[12px] font-medium text-sse-ink hover:border-sse-primary/40 transition-colors"
    >
      <svg className="w-4 h-4 text-sse-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      {label}
    </a>
  );
}

export function WorkspaceMantenimiento({ wsId }: { wsId: WorkspaceId }) {
  const { data, isLoading } = useMantenimientoDashboard(wsId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[20px] font-semibold text-sse-ink">Mantenimiento e Infraestructura</h1>
        <p className="text-[13px] text-sse-muted mt-0.5">
          Activos institucionales, órdenes de trabajo y gestión de mantenimiento preventivo
        </p>
      </div>

      {/* Alert: stock bajo */}
      {!isLoading && data && data.inventario.itemsBajoStock > 0 && (
        <div className="flex items-center gap-2 bg-sse-sem-yellow-bg border border-sse-sem-yellow-fg/30 rounded-md px-4 py-2.5">
          <svg className="w-4 h-4 text-sse-sem-yellow-fg shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
          <p className="text-[12px] text-sse-sem-yellow-fg font-medium">
            {data.inventario.itemsBajoStock} {data.inventario.itemsBajoStock === 1 ? "ítem" : "ítems"} con stock por debajo del mínimo
          </p>
        </div>
      )}

      {/* KPI Grid — Activos */}
      <div>
        <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide mb-2">Estado de Activos</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {isLoading ? (
            [0,1,2,3].map((i) => <KpiSkeleton key={i} />)
          ) : data ? (
            <>
              <KpiTile label="Total activos"     value={data.activos.total}      accent="blue" />
              <KpiTile label="Operativos"         value={data.activos.operativos} accent="green" />
              <KpiTile label="En mantenimiento"   value={data.activos.enManto}
                accent={data.activos.enManto > 0 ? "yellow" : "green"} />
              <KpiTile label="Inactivos / baja"   value={data.activos.inactivos}
                accent={data.activos.inactivos > 0 ? "red" : "green"} />
            </>
          ) : null}
        </div>
      </div>

      {/* KPI Grid — Órdenes de Trabajo */}
      <div>
        <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide mb-2">Órdenes de Trabajo</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {isLoading ? (
            [0,1,2,3].map((i) => <KpiSkeleton key={i} />)
          ) : data ? (
            <>
              <KpiTile label="Total órdenes"     value={data.ordenes.total}      accent="blue" />
              <KpiTile label="Abiertas"           value={data.ordenes.abiertas}
                accent={data.ordenes.abiertas > 5 ? "yellow" : "blue"} />
              <KpiTile label="En proceso"         value={data.ordenes.enProceso}  accent="yellow" />
              <KpiTile label="Completadas"        value={data.ordenes.completadas} accent="green" />
            </>
          ) : null}
        </div>
      </div>

      {/* KPI Grid — Preventivo, Solicitudes, Costos */}
      <div>
        <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide mb-2">Resumen General</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {isLoading ? (
            [0,1,2,3].map((i) => <KpiSkeleton key={i} />)
          ) : data ? (
            <>
              <KpiTile label="Solicitudes pendientes" value={data.solicitudes.pendientes}
                accent={data.solicitudes.pendientes > 3 ? "yellow" : "blue"} />
              <KpiTile label="Planes activos"     value={data.preventivo.planesActivos} accent="blue" />
              <KpiTile label="Cumplimiento prev." value={`${data.preventivo.cumplimientoPct}%`}
                sub="plan preventivo"
                accent={data.preventivo.cumplimientoPct >= 80 ? "green" : data.preventivo.cumplimientoPct >= 60 ? "yellow" : "red"} />
              <KpiTile label="Costo total"        value={`$${data.costos.total.toLocaleString()}`} accent="blue" />
            </>
          ) : null}
        </div>
      </div>

      {/* Quick access */}
      <div>
        <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide mb-2">Acceso rápido</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <QuickLink label="Activos"
            href="activos"
            icon="M5 8h14M5 8a2 2 0 1 0 0-4h14a2 2 0 1 0 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8m-9 4h4" />
          <QuickLink label="Órdenes de Trabajo"
            href="ordenes-trabajo"
            icon="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4" />
          <QuickLink label="Solicitudes"
            href="solicitudes-manto"
            icon="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414A1 1 0 0 0 6.586 13H4" />
          <QuickLink label="Planes Preventivos"
            href="planes-manto"
            icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
          <QuickLink label="Inspecciones"
            href="inspecciones"
            icon="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          <QuickLink label="Costos"
            href="costos-manto"
            icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          <QuickLink label="Inventario Técnico"
            href="inventario-tecnico"
            icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          <QuickLink label="Ubicaciones"
            href="ubicaciones"
            icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
        </div>
      </div>
    </div>
  );
}
