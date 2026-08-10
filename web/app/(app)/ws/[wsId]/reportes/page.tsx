"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMonitoreoReportes } from "@/hooks/useMonitoreoReportes";
import { getUnidad } from "@/types/unidad";
import type { ArchivoReporte, MesReporte } from "@/services/reportes";

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconDoc({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

function IconFolder({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v8.25m0 0A2.25 2.25 0 0 0 4.5 16.5h15a2.25 2.25 0 0 0 2.25-2.25V12" />
    </svg>
  );
}

function IconExtLink({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

function IconLoader({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function IconChevron({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const MESES_ES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function fmtTamano(bytes: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtFecha(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-SV", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ─── Coverage grid (12-month visual) ─────────────────────────────────────────

function CoverageGrid({
  meses,
  selected,
  onSelect,
}: {
  meses: MesReporte[];
  selected: number | null;
  onSelect: (mes: number) => void;
}) {
  // Build a map from month number → reporte
  const byMes = new Map(meses.map((m) => [m.mes, m]));

  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
      {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => {
        const mes = byMes.get(n);
        const hasFiles = (mes?.total ?? 0) > 0;
        const isSelected = selected === n;

        return (
          <button
            key={n}
            onClick={() => onSelect(n)}
            title={MESES_ES[n]}
            className={[
              "flex flex-col items-center gap-1 rounded-xl border px-1 py-2 transition",
              isSelected
                ? "border-sse-primary bg-sse-primary text-white"
                : hasFiles
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                : mes
                ? "border-sse-border bg-sse-surface text-sse-muted hover:border-sse-primary/40"
                : "border-dashed border-sse-border text-sse-muted/40 cursor-default",
            ].join(" ")}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide leading-none">
              {MESES_ES[n]?.slice(0, 3)}
            </span>
            <span className={[
              "h-1.5 w-1.5 rounded-full",
              isSelected ? "bg-white" : hasFiles ? "bg-emerald-500" : "bg-sse-border",
            ].join(" ")} />
          </button>
        );
      })}
    </div>
  );
}

// ─── File row ─────────────────────────────────────────────────────────────────

function ArchivoRow({ archivo }: { archivo: ArchivoReporte }) {
  return (
    <a
      href={archivo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-xl border border-sse-border bg-sse-surface px-4 py-3 transition hover:border-sse-primary/40 hover:bg-sse-primary/[0.02]"
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-sse-primary/10">
        <IconDoc className="h-5 w-5 text-sse-primary" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-sse-ink group-hover:text-sse-primary transition-colors">
          {archivo.nombre}
        </p>
        <p className="mt-0.5 text-[11px] text-sse-muted">
          {archivo.tipoLabel}
          {archivo.tamano ? ` · ${fmtTamano(archivo.tamano)}` : ""}
          {" · "}{fmtFecha(archivo.modificadoEn)}
        </p>
      </div>

      <IconExtLink className="h-4 w-4 flex-shrink-0 text-sse-muted opacity-0 transition group-hover:opacity-100" />
    </a>
  );
}

// ─── Month detail panel ───────────────────────────────────────────────────────

function MesDetail({ mes }: { mes: MesReporte }) {
  const mesLabel = MESES_ES[mes.mes] ?? mes.nombre;
  const hasFiles = mes.total > 0;

  return (
    <div className="rounded-xl border border-sse-border bg-sse-bg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sse-border px-4 py-3">
        <div>
          <h3 className="text-[14px] font-semibold text-sse-ink">
            {mesLabel} {mes.anio > 0 ? mes.anio : ""}
          </h3>
          <p className="text-[12px] text-sse-muted">
            {hasFiles
              ? `${mes.total} ${mes.total === 1 ? "informe subido" : "informes subidos"}`
              : "Sin informes subidos aún"}
          </p>
        </div>
        <a
          href={mes.driveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-sse-border px-3 py-1.5 text-[12px] text-sse-muted transition hover:border-sse-primary hover:text-sse-primary"
        >
          <IconFolder className="h-3.5 w-3.5" />
          Ver carpeta
        </a>
      </div>

      {/* Files */}
      <div className="px-4 py-3">
        {hasFiles ? (
          <div className="space-y-2">
            {mes.archivos.map((a) => (
              <ArchivoRow key={a.id} archivo={a} />
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-[13px] text-sse-muted">
            El jefe de unidad aún no ha subido el informe de este mes.
            <br />
            <a
              href={mes.driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sse-primary hover:underline"
            >
              <IconFolder className="h-3.5 w-3.5" />
              Abrir carpeta en Drive
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Stats cards ──────────────────────────────────────────────────────────────

function StatCard({ value, label, sub }: { value: string | number; label: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-sse-border bg-sse-surface px-4 py-3">
      <p className="text-[26px] font-bold text-sse-ink leading-none">{value}</p>
      <p className="mt-1 text-[12px] font-medium text-sse-ink">{label}</p>
      {sub && <p className="text-[11px] text-sse-muted">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportesPage() {
  const params = useParams();
  const wsId = params?.wsId as string;
  const unidad = getUnidad(wsId);
  const unidadNombre = unidad?.nombre ?? wsId?.toUpperCase() ?? "Unidad";

  const { data, isLoading, isError, error, refetch } = useMonitoreoReportes(wsId);

  // Default: select the most recent month that has files, or first month
  const defaultSelected = (() => {
    if (!data?.meses.length) return null;
    const withFiles = [...data.meses].filter((m) => m.total > 0).sort((a, b) => b.mes - a.mes);
    return withFiles.length ? withFiles[0].mes : data.meses[0].mes;
  })();

  const [selectedMes, setSelectedMes] = useState<number | null>(null);
  const activeMes = selectedMes ?? defaultSelected;

  const mesByNum = new Map((data?.meses ?? []).map((m) => [m.mes, m]));
  const detail = activeMes !== null ? mesByNum.get(activeMes) : undefined;

  // Stats
  const totalArchivos = data?.meses.reduce((s, m) => s + m.total, 0) ?? 0;
  const mesesConArchivos = data?.meses.filter((m) => m.total > 0).length ?? 0;
  const cobertura = data?.meses.length
    ? Math.round((mesesConArchivos / data.meses.length) * 100)
    : 0;

  // Most recent upload
  const ultimoArchivo = (() => {
    if (!data) return null;
    const all = data.meses.flatMap((m) => m.archivos);
    if (!all.length) return null;
    return all.sort((a, b) => b.modificadoEn.localeCompare(a.modificadoEn))[0];
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-sse-primary/10">
          <IconDoc className="h-6 w-6 text-sse-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-[20px] font-semibold text-sse-ink leading-tight">
            Reportes Mensuales &mdash; {unidadNombre}
          </h1>
          <p className="mt-1 text-[13px] text-sse-muted">
            Informes de actividades cargados por el jefe de unidad. Selecciona un mes para ver los documentos.
          </p>
        </div>
        {data?.carpetaUrl && (
          <a
            href={data.carpetaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-sse-border px-3 py-1.5 text-[12px] text-sse-muted transition hover:border-sse-primary hover:text-sse-primary"
          >
            <IconFolder className="h-4 w-4" />
            Drive
          </a>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center gap-3 rounded-xl border border-sse-border bg-sse-surface px-4 py-6">
          <IconLoader className="h-5 w-5 animate-spin text-sse-primary" />
          <p className="text-[13px] text-sse-muted">Cargando reportes desde Drive…</p>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 dark:border-red-900 dark:bg-red-950/20">
          <p className="text-[13px] font-medium text-red-700 dark:text-red-400">
            No se pudieron cargar los reportes
          </p>
          <p className="mt-1 text-[12px] text-red-600 dark:text-red-500">
            {error?.message ?? "Intenta de nuevo más tarde."}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-lg border border-red-300 px-3 py-1.5 text-[12px] text-red-600 transition hover:bg-red-100 dark:border-red-800 dark:text-red-400"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* No folder configured */}
      {data?.mensaje && !isLoading && (
        <div className="rounded-xl border border-sse-border bg-sse-surface px-4 py-8 text-center">
          <IconFolder className="mx-auto mb-3 h-10 w-10 text-sse-muted opacity-30" />
          <p className="text-[13px] text-sse-muted">{data.mensaje}</p>
        </div>
      )}

      {/* Dashboard */}
      {data && !data.mensaje && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard value={totalArchivos} label="Informes subidos" />
            <StatCard value={`${mesesConArchivos} / ${data.meses.length}`} label="Meses cubiertos" />
            <StatCard value={`${cobertura}%`} label="Cobertura anual" />
            <StatCard
              value={ultimoArchivo ? fmtFecha(ultimoArchivo.modificadoEn) : "—"}
              label="Última carga"
              sub={ultimoArchivo ? (ultimoArchivo.nombre.slice(0, 28) + (ultimoArchivo.nombre.length > 28 ? "…" : "")) : undefined}
            />
          </div>

          {/* Coverage grid */}
          <div className="rounded-xl border border-sse-border bg-sse-surface px-4 py-4">
            <p className="mb-3 text-[12px] font-semibold text-sse-muted uppercase tracking-wide">
              Cobertura por mes — selecciona para ver detalle
            </p>
            <CoverageGrid
              meses={data.meses}
              selected={activeMes}
              onSelect={(n) => setSelectedMes(n)}
            />
            <div className="mt-3 flex items-center gap-4 text-[11px] text-sse-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
                Con informe
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm border border-sse-border bg-sse-surface" />
                Sin informe
              </span>
            </div>
          </div>

          {/* Month detail */}
          {detail ? (
            <MesDetail mes={detail} />
          ) : (
            activeMes !== null && (
              <div className="rounded-xl border border-sse-border bg-sse-surface px-4 py-6 text-center">
                <p className="text-[13px] text-sse-muted">
                  {MESES_ES[activeMes]} no está configurado en Drive.
                </p>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
