"use client";

import type { WorkspaceId } from "@/config/nav";
import { useContabilidadDashboard } from "@/hooks/useContabilidad";
import { Skeleton } from "@/components/ui/skeleton";
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

export function WorkspaceContabilidad({ wsId }: { wsId: WorkspaceId }) {
  const { data, isLoading } = useContabilidadDashboard(wsId);

  const fmtUSD = (n: number) => `$${n.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[20px] font-semibold text-sse-ink">Contabilidad y Finanzas</h1>
        <p className="text-[13px] text-sse-muted mt-0.5">
          Ejecución presupuestaria, pagos y registros contables institucionales
        </p>
      </div>

      {/* Alert: cuentas vencidas */}
      {!isLoading && data && data.cuentasVencidas > 0 && (
        <div className="flex items-center gap-2 bg-sse-sem-red-bg border border-sse-sem-red-fg/30 rounded-md px-4 py-2.5">
          <svg className="w-4 h-4 text-sse-sem-red-fg shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
          <p className="text-[12px] text-sse-sem-red-fg font-medium">
            {data.cuentasVencidas} {data.cuentasVencidas === 1 ? "cuenta vencida" : "cuentas vencidas"} por pagar
          </p>
        </div>
      )}

      {/* KPI Grid — row 1: presupuesto */}
      <div>
        <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide mb-2">Ejecución Presupuestaria</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {isLoading ? (
            [0,1,2,3].map((i) => <KpiSkeleton key={i} />)
          ) : data ? (
            <>
              <KpiTile label="Compromisos activos"  value={data.compromisosActivos} accent="blue" />
              <KpiTile label="Monto comprometido"   value={fmtUSD(data.montoCometido)} accent="blue" />
              <KpiTile label="Monto ejecutado"       value={fmtUSD(data.montoEjecutado)} accent="green" />
              <KpiTile label="% Ejecución"           value={`${data.ejecucionPct}%`}
                sub={`${fmtUSD(data.montoCometido - data.montoEjecutado)} disponible`}
                accent={data.ejecucionPct >= 90 ? "red" : data.ejecucionPct >= 70 ? "yellow" : "green"}
              />
            </>
          ) : null}
        </div>
      </div>

      {/* KPI Grid — row 2: facturas y pagos */}
      <div>
        <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide mb-2">Facturas y Pagos</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {isLoading ? (
            [0,1,2,3].map((i) => <KpiSkeleton key={i} />)
          ) : data ? (
            <>
              <KpiTile label="Facturas pendientes"  value={data.facturasPendientes}
                accent={data.facturasPendientes > 5 ? "yellow" : "blue"} />
              <KpiTile label="Facturas pagadas"     value={data.facturasPagadas} accent="green" />
              <KpiTile label="Pagos pendientes"     value={data.pagosPendientes}
                sub={fmtUSD(data.montoPagosPendientes)}
                accent={data.pagosPendientes > 3 ? "yellow" : "blue"} />
              <KpiTile label="T. promedio pago"     value={`${data.tiempoPromedioPago}d`}
                sub="días hábiles"
                accent={data.tiempoPromedioPago > 15 ? "red" : "green"} />
            </>
          ) : null}
        </div>
      </div>

      {/* KPI Grid — row 3: cuentas */}
      <div>
        <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide mb-2">Cuentas y Tesorería</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {isLoading ? (
            [0,1,2].map((i) => <KpiSkeleton key={i} />)
          ) : data ? (
            <>
              <KpiTile label="Cuentas por pagar"    value={data.cuentasPorPagar}
                sub={fmtUSD(data.montoCuentasPagar)}
                accent={data.cuentasVencidas > 0 ? "red" : "blue"} />
              <KpiTile label="Cuentas vencidas"     value={data.cuentasVencidas}
                accent={data.cuentasVencidas > 0 ? "red" : "green"} />
              <KpiTile label="Concil. abiertas"     value={data.conciliacionesAbiertas}
                accent={data.conciliacionesAbiertas > 1 ? "yellow" : "blue"} />
            </>
          ) : null}
        </div>
      </div>

      {/* Quick access */}
      <div>
        <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide mb-2">Acceso rápido</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <QuickLink label="Compromisos"      href="compromisos"
            icon="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
          <QuickLink label="Facturas"         href="facturas"
            icon="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          <QuickLink label="Pagos"            href="pagos"
            icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z" />
          <QuickLink label="Registros"        href="registros-contables"
            icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          <QuickLink label="Cuentas x Pagar"  href="cuentas-pagar"
            icon="M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2m2 4h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2z" />
          <QuickLink label="Conciliaciones"   href="conciliaciones"
            icon="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          <QuickLink label="Cuentas x Cobrar" href="cuentas-cobrar"
            icon="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </div>
      </div>
    </div>
  );
}
