"use client";

import type { WorkspaceId } from "@/config/nav";
import { useSSODashboard } from "@/hooks/useSSO";
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

export function WorkspaceSSO({ wsId }: { wsId: WorkspaceId }) {
  const { data, isLoading } = useSSODashboard(wsId);

  const riesgosCriticosYAltos = data ? data.riesgos.criticos + data.riesgos.altos : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[20px] font-semibold text-sse-ink">Salud y Seguridad Ocupacional</h1>
        <p className="text-[13px] text-sse-muted mt-0.5">
          Incidentes, riesgos, inspecciones, acciones CAPA y cumplimiento legal
        </p>
      </div>

      {/* Alert: incidentes abiertos */}
      {!isLoading && data && data.incidentes.abiertos > 0 && (
        <div className="flex items-center gap-2 bg-sse-sem-red-bg border border-sse-sem-red-fg/30 rounded-md px-4 py-2.5">
          <svg className="w-4 h-4 text-sse-sem-red-fg shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
          <p className="text-[12px] text-sse-sem-red-fg font-medium">
            {data.incidentes.abiertos} {data.incidentes.abiertos === 1 ? "incidente abierto" : "incidentes abiertos"} requieren atención
          </p>
        </div>
      )}

      {/* Alert: riesgos críticos */}
      {!isLoading && data && data.riesgos.criticos > 0 && (
        <div className="flex items-center gap-2 bg-sse-sem-yellow-bg border border-sse-sem-yellow-fg/30 rounded-md px-4 py-2.5">
          <svg className="w-4 h-4 text-sse-sem-yellow-fg shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
          </svg>
          <p className="text-[12px] text-sse-sem-yellow-fg font-medium">
            {data.riesgos.criticos} {data.riesgos.criticos === 1 ? "riesgo crítico" : "riesgos críticos"} identificados en la Matriz IPER
          </p>
        </div>
      )}

      {/* KPI Grid — Incidentes y Accidentes */}
      <div>
        <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide mb-2">Incidentes y Accidentes</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {isLoading ? (
            [0,1,2].map((i) => <KpiSkeleton key={i} />)
          ) : data ? (
            <>
              <KpiTile label="Total incidentes"   value={data.incidentes.total}    accent="blue" />
              <KpiTile label="Incidentes abiertos" value={data.incidentes.abiertos}
                accent={data.incidentes.abiertos > 0 ? "red" : "green"} />
              <KpiTile label="Accidentes"          value={data.incidentes.accidentes}
                accent={data.incidentes.accidentes > 0 ? "red" : "green"} />
            </>
          ) : null}
        </div>
      </div>

      {/* KPI Grid — Riesgos */}
      <div>
        <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide mb-2">Matriz IPER — Nivel de Riesgo</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {isLoading ? (
            [0,1,2,3].map((i) => <KpiSkeleton key={i} />)
          ) : data ? (
            <>
              <KpiTile label="Críticos"  value={data.riesgos.criticos}
                accent={data.riesgos.criticos > 0 ? "red" : "green"} />
              <KpiTile label="Altos"     value={data.riesgos.altos}
                accent={data.riesgos.altos > 0 ? "yellow" : "green"} />
              <KpiTile label="Medios"    value={data.riesgos.medios}    accent="blue" />
              <KpiTile label="Bajos"     value={data.riesgos.bajos}     accent="green" />
            </>
          ) : null}
        </div>
      </div>

      {/* KPI Grid — Gestión Operativa */}
      <div>
        <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide mb-2">Gestión Operativa</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {isLoading ? (
            [0,1,2,3].map((i) => <KpiSkeleton key={i} />)
          ) : data ? (
            <>
              <KpiTile label="Inspecciones realizadas"   value={data.inspecciones.realizadas}   accent="blue" />
              <KpiTile label="Inspecciones pendientes"   value={data.inspecciones.pendientes}
                accent={data.inspecciones.pendientes > 0 ? "yellow" : "green"} />
              <KpiTile label="Acciones CAPA abiertas"   value={data.acciones.correctivasAbiertas + data.acciones.preventivasAbiertas}
                accent={(data.acciones.correctivasAbiertas + data.acciones.preventivasAbiertas) > 5 ? "yellow" : "blue"} />
              <KpiTile label="Capacitaciones ejecutadas" value={data.capacitaciones.ejecutadas} accent="green" />
            </>
          ) : null}
        </div>
      </div>

      {/* KPI Grid — Cumplimiento y Comité */}
      <div>
        <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide mb-2">Cumplimiento y Gobernanza</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {isLoading ? (
            [0,1,2].map((i) => <KpiSkeleton key={i} />)
          ) : data ? (
            <>
              <KpiTile
                label="Cumplimiento legal"
                value={`${data.cumplimiento.pct}%`}
                sub="requisitos legales"
                accent={data.cumplimiento.pct >= 90 ? "green" : data.cumplimiento.pct >= 70 ? "yellow" : "red"}
              />
              <KpiTile label="Sesiones comité"          value={data.comite.sesionesRealizadas}  accent="blue" />
              <KpiTile
                label="Prom. cierre incidente"
                value={`${data.tiempoPromedioCierreIncidentes}d`}
                sub="días promedio"
                accent={data.tiempoPromedioCierreIncidentes <= 5 ? "green" : data.tiempoPromedioCierreIncidentes <= 10 ? "yellow" : "red"}
              />
            </>
          ) : null}
        </div>
      </div>

      {/* Quick access */}
      <div>
        <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide mb-2">Acceso rápido</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <QuickLink label="Incidentes"
            href="incidentes"
            icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          <QuickLink label="Accidentes"
            href="accidentes"
            icon="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
          <QuickLink label="Inspecciones"
            href="inspecciones-sso"
            icon="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          <QuickLink label="Matriz IPER"
            href="matriz-riesgos"
            icon="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
          <QuickLink label="Acciones CAPA"
            href="acciones-capa"
            icon="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4" />
          <QuickLink label="Control EPP"
            href="epp"
            icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          <QuickLink label="Capacitaciones"
            href="capacitaciones-sso"
            icon="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 0 1 .665 6.479A11.952 11.952 0 0 0 12 20.055a11.952 11.952 0 0 0-6.824-2.998 12.078 12.078 0 0 1 .665-6.479L12 14z" />
          <QuickLink label="Comité SSO"
            href="comite"
            icon="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
          <QuickLink label="Auditorías"
            href="auditorias-sso"
            icon="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
          <QuickLink label="Cumplimiento Legal"
            href="cumplimiento-legal"
            icon="M3 6l3 1m0 0l-3 9a5.002 5.002 0 0 0 6.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 0 0 6.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </div>
      </div>
    </div>
  );
}
