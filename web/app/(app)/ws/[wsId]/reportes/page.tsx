"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useMonitoreoReportes } from "@/hooks/useMonitoreoReportes";
import { getUnidad } from "@/types/unidad";
import type { MesReporte, ArchivoReporte } from "@/services/reportes";

// ─── Constants ────────────────────────────────────────────────────────────────

const MESES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function fmtFecha(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-SV", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
  } catch { return iso; }
}

function fmtTamano(bytes: number): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

// ─── Month selector ───────────────────────────────────────────────────────────

function MonthSelector({
  mesesConReporte,
  selected,
  onSelect,
}: {
  mesesConReporte: Set<number>;
  selected: number;
  onSelect: (n: number) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
      {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => {
        const hasRep = mesesConReporte.has(n);
        const isSelected = selected === n;

        return (
          <button
            key={n}
            onClick={() => onSelect(n)}
            title={MESES[n]}
            className={[
              "relative flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 transition",
              isSelected
                ? "border-sse-primary bg-sse-primary text-white shadow-sm"
                : hasRep
                ? "border-sse-border bg-sse-surface text-sse-ink hover:border-sse-primary/50 hover:bg-sse-primary/5"
                : "border-dashed border-sse-border/50 text-sse-muted/40 hover:border-sse-border hover:text-sse-muted",
            ].join(" ")}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wide leading-none">
              {MESES[n]?.slice(0, 3)}
            </span>
            <span className={`h-1.5 w-1.5 rounded-full ${
              isSelected ? "bg-white/80" : hasRep ? "bg-emerald-500" : "bg-transparent"
            }`} />
          </button>
        );
      })}
    </div>
  );
}

// ─── Report file row ──────────────────────────────────────────────────────────

function ArchivoRow({ archivo }: { archivo: ArchivoReporte }) {
  return (
    <a
      href={archivo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-xl border border-sse-border bg-sse-surface px-4 py-3 transition hover:border-sse-primary/40"
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

// ─── Month detail ─────────────────────────────────────────────────────────────

function MesDetail({ mes, mesNum }: { mes: MesReporte | undefined; mesNum: number }) {
  return (
    <div className="rounded-xl border border-sse-border bg-sse-surface">
      <div className="flex items-center justify-between border-b border-sse-border px-4 py-3">
        <div>
          <h3 className="text-[13px] font-semibold text-sse-ink">
            Informe — {MESES[mesNum]}
          </h3>
          <p className="text-[11px] text-sse-muted">
            {mes
              ? mes.total > 0
                ? `${mes.total} ${mes.total === 1 ? "archivo" : "archivos"} subidos`
                : "Sin archivos subidos aún"
              : "Sin carpeta configurada para este mes"}
          </p>
        </div>
        {mes?.driveUrl && (
          <a
            href={mes.driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-sse-border px-3 py-1.5 text-[12px] text-sse-muted transition hover:border-sse-primary hover:text-sse-primary"
          >
            <IconFolder className="h-3.5 w-3.5" />
            Carpeta
          </a>
        )}
      </div>

      <div className="px-4 py-4">
        {!mes ? (
          <p className="py-2 text-center text-[12px] text-sse-muted italic">
            No hay carpeta para este mes en Drive.
          </p>
        ) : mes.total === 0 ? (
          <div className="rounded-lg border border-dashed border-sse-border px-4 py-6 text-center">
            <p className="text-[13px] text-sse-muted">
              No se ha subido ningún informe para {MESES[mesNum]}.
            </p>
            <a
              href={mes.driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[12px] text-sse-primary hover:underline"
            >
              <IconFolder className="h-3.5 w-3.5" />
              Subir a Drive
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {mes.archivos.map((a) => <ArchivoRow key={a.id} archivo={a} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportesPage() {
  const params = useParams();
  const wsId = params?.wsId as string;
  const unidad = getUnidad(wsId);
  const unidadNombre = unidad?.nombre ?? wsId?.toUpperCase() ?? "Unidad";

  const reportesQ = useMonitoreoReportes(wsId);
  const reportesData = reportesQ.data;

  const mesesConReporte = useMemo<Set<number>>(() => {
    const s = new Set<number>();
    (reportesData?.meses ?? []).forEach((m) => {
      if (m.total > 0 && m.mes > 0) s.add(m.mes);
    });
    return s;
  }, [reportesData]);

  const mesByNum = useMemo(() => {
    const m = new Map<number, MesReporte>();
    (reportesData?.meses ?? []).forEach((mes) => m.set(mes.mes, mes));
    return m;
  }, [reportesData]);

  const defaultMes = useMemo<number>(() => {
    if (mesesConReporte.size > 0) return Math.max(...mesesConReporte);
    return new Date().getMonth() + 1;
  }, [mesesConReporte]);

  const [selectedMes, setSelectedMes] = useState<number | null>(null);
  const activeMes = selectedMes ?? defaultMes;

  const totalReportes  = reportesData?.meses.reduce((s, m) => s + m.total, 0) ?? 0;
  const mesesCubiertos = mesesConReporte.size;
  const totalMeses     = reportesData?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-sse-primary/10">
          <IconDoc className="h-6 w-6 text-sse-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-[20px] font-semibold text-sse-ink leading-tight">
            Reportes — {unidadNombre}
          </h1>
          <p className="mt-1 text-[13px] text-sse-muted">
            Selecciona un mes para ver el informe de actividades subido por la unidad.
          </p>
        </div>
        {reportesData?.carpetaUrl && (
          <a
            href={reportesData.carpetaUrl}
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
      {reportesQ.isLoading && (
        <div className="flex items-center gap-3 rounded-xl border border-sse-border bg-sse-surface px-4 py-6">
          <IconLoader className="h-5 w-5 animate-spin text-sse-primary" />
          <p className="text-[13px] text-sse-muted">Cargando reportes…</p>
        </div>
      )}

      {reportesQ.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 dark:border-red-900 dark:bg-red-950/20">
          <p className="text-[13px] text-red-600 dark:text-red-400">
            Error al cargar los reportes. Intenta de nuevo más tarde.
          </p>
        </div>
      )}

      {reportesData?.mensaje && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 dark:border-amber-900 dark:bg-amber-950/20">
          <p className="text-[13px] text-amber-700 dark:text-amber-400">
            {reportesData.mensaje}
          </p>
        </div>
      )}

      {!reportesQ.isLoading && !reportesQ.isError && !reportesData?.mensaje && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-sse-border bg-sse-surface px-4 py-3">
              <p className="text-[24px] font-bold text-sse-ink">{totalMeses}</p>
              <p className="text-[12px] text-sse-muted">Meses configurados</p>
            </div>
            <div className="rounded-xl border border-sse-border bg-sse-surface px-4 py-3">
              <p className="text-[24px] font-bold text-sse-ink">{mesesCubiertos}</p>
              <p className="text-[12px] text-sse-muted">Meses con informe</p>
            </div>
            <div className="rounded-xl border border-sse-border bg-sse-surface px-4 py-3">
              <p className="text-[24px] font-bold text-sse-ink">{totalReportes}</p>
              <p className="text-[12px] text-sse-muted">Documentos subidos</p>
            </div>
          </div>

          {/* Month selector */}
          <div className="rounded-xl border border-sse-border bg-sse-surface px-4 py-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-sse-muted">
              Selecciona un mes
            </p>
            <MonthSelector
              mesesConReporte={mesesConReporte}
              selected={activeMes}
              onSelect={(n) => setSelectedMes(n)}
            />
            <div className="mt-3 flex items-center gap-4 text-[11px] text-sse-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Con informe subido
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full border border-dashed border-sse-border" /> Sin informe
              </span>
            </div>
          </div>

          {/* Month detail */}
          <MesDetail mes={mesByNum.get(activeMes)} mesNum={activeMes} />
        </>
      )}
    </div>
  );
}
