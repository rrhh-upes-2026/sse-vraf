"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMonitoreoReportes } from "@/hooks/useMonitoreoReportes";
import { useReportesStore } from "@/store/useReportesStore";
import { getUnidad } from "@/types/unidad";
import type { ArchivoReporte, MesReporte, InformeAnalizado } from "@/services/reportes";

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconDoc({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

function IconSpark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
  );
}

function IconFolder({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v8.25m0 0A2.25 2.25 0 0 0 4.5 16.5h15a2.25 2.25 0 0 0 2.25-2.25V12m0 0v-.75A2.25 2.25 0 0 0 19.5 9h-3.379a1.5 1.5 0 0 1-1.06-.44L13.44 6.44a1.5 1.5 0 0 0-1.06-.44H9" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function IconWarn({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
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

// ─── Month names ──────────────────────────────────────────────────────────────

const MESES_ES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// ─── Sentiment badge ──────────────────────────────────────────────────────────

function SentimentBadge({ value }: { value: InformeAnalizado["sentimientoGeneral"] }) {
  const cfg = {
    positivo: { label: "Positivo", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    neutral:  { label: "Neutral",  cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    negativo: { label: "Negativo", cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  }[value] ?? { label: "—", cls: "bg-sse-border text-sse-muted" };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── Analysis panel ───────────────────────────────────────────────────────────

function AnalysisPanel({ analysis }: { analysis: InformeAnalizado }) {
  return (
    <div className="mt-4 space-y-4 rounded-xl border border-sse-border bg-sse-bg px-5 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconSpark className="h-4 w-4 text-sse-primary" />
          <span className="text-[12px] font-semibold text-sse-primary uppercase tracking-wide">
            Análisis IA
          </span>
        </div>
        <SentimentBadge value={analysis.sentimientoGeneral} />
      </div>

      {/* Executive summary */}
      <p className="text-[13px] text-sse-ink leading-relaxed">{analysis.resumenEjecutivo}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Logros */}
        {analysis.logros.length > 0 && (
          <div>
            <p className="mb-1.5 text-[11px] font-semibold text-sse-muted uppercase tracking-wide">Logros</p>
            <ul className="space-y-1">
              {analysis.logros.map((l, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[12px] text-sse-ink">
                  <IconCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                  {l}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Desafíos */}
        {analysis.desafios.length > 0 && (
          <div>
            <p className="mb-1.5 text-[11px] font-semibold text-sse-muted uppercase tracking-wide">Desafíos</p>
            <ul className="space-y-1">
              {analysis.desafios.map((d, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[12px] text-sse-ink">
                  <IconWarn className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actividades */}
      {analysis.actividadesPrincipales.length > 0 && (
        <div>
          <p className="mb-1.5 text-[11px] font-semibold text-sse-muted uppercase tracking-wide">
            Actividades principales
          </p>
          <ul className="space-y-1">
            {analysis.actividadesPrincipales.map((a, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[12px] text-sse-ink">
                <span className="mt-[3px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sse-primary" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Indicadores mencionados */}
      {analysis.indicadoresMencionados.length > 0 && (
        <div>
          <p className="mb-1.5 text-[11px] font-semibold text-sse-muted uppercase tracking-wide">
            Indicadores mencionados
          </p>
          <div className="overflow-x-auto rounded-lg border border-sse-border">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-sse-border bg-sse-surface">
                  <th className="px-3 py-2 text-left font-medium text-sse-muted">Indicador</th>
                  <th className="px-3 py-2 text-left font-medium text-sse-muted">Valor</th>
                  <th className="px-3 py-2 text-left font-medium text-sse-muted">Observación</th>
                </tr>
              </thead>
              <tbody>
                {analysis.indicadoresMencionados.map((ind, i) => (
                  <tr key={i} className="border-b border-sse-border last:border-0">
                    <td className="px-3 py-2 font-medium text-sse-ink">{ind.nombre}</td>
                    <td className="px-3 py-2 text-sse-ink">{ind.valor ?? "—"}</td>
                    <td className="px-3 py-2 text-sse-muted">{ind.observacion ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recomendaciones IA */}
      {analysis.recomendacionesIA.length > 0 && (
        <div className="rounded-lg border border-sse-primary/20 bg-sse-primary/5 px-4 py-3">
          <div className="mb-2 flex items-center gap-1.5">
            <IconSpark className="h-3.5 w-3.5 text-sse-primary" />
            <p className="text-[11px] font-semibold text-sse-primary uppercase tracking-wide">
              Recomendaciones para el siguiente mes
            </p>
          </div>
          <ol className="space-y-1">
            {analysis.recomendacionesIA.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-sse-ink">
                <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-sse-primary text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                {r}
              </li>
            ))}
          </ol>
        </div>
      )}

      <p className="text-[10px] text-sse-muted">
        Analizado el {new Date(analysis.analizadoEn).toLocaleString("es-SV")}
      </p>
    </div>
  );
}

// ─── File row ─────────────────────────────────────────────────────────────────

function ArchivoRow({
  archivo,
  wsId,
  mesNombre,
  mesNum,
  anio,
}: {
  archivo: ArchivoReporte;
  wsId: string;
  mesNombre: string;
  mesNum: number;
  anio: number;
}) {
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getAnalysis, setAnalysis } = useReportesStore();
  const existing = getAnalysis(archivo.id);

  const isPdf =
    archivo.mime === "application/pdf" ||
    archivo.mime === "application/vnd.google-apps.document" ||
    archivo.nombre.toLowerCase().endsWith(".pdf") ||
    archivo.nombre.toLowerCase().endsWith(".docx");

  async function analyze() {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/reportes/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: archivo.id,
          wsId,
          mesNombre,
          mesNum,
          anio,
          fileName: archivo.nombre,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const data: InformeAnalizado = await res.json();
      setAnalysis(archivo.id, data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al analizar");
    } finally {
      setAnalyzing(false);
    }
  }

  const fmt = new Intl.DateTimeFormat("es-SV", { day: "2-digit", month: "short", year: "numeric" });
  const date = fmt.format(new Date(archivo.modificadoEn));
  const kb = archivo.tamano ? Math.round(archivo.tamano / 1024) : null;

  return (
    <div className="rounded-xl border border-sse-border bg-sse-surface">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-sse-primary/10">
          <IconDoc className="h-5 w-5 text-sse-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <a
            href={archivo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[13px] font-medium text-sse-ink hover:text-sse-primary transition-colors"
          >
            <span className="truncate">{archivo.nombre}</span>
            <IconExtLink className="h-3 w-3 flex-shrink-0 opacity-60" />
          </a>
          <p className="mt-0.5 text-[11px] text-sse-muted">
            {archivo.tipoLabel} · {date}{kb !== null ? ` · ${kb} KB` : ""}
          </p>
        </div>

        {isPdf && (
          <button
            onClick={analyze}
            disabled={analyzing}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-sse-primary/30 bg-sse-primary/5 px-3 py-1.5 text-[12px] font-medium text-sse-primary transition hover:bg-sse-primary/10 disabled:opacity-50"
          >
            {analyzing ? (
              <IconLoader className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <IconSpark className="h-3.5 w-3.5" />
            )}
            {analyzing ? "Analizando…" : existing ? "Re-analizar" : "Analizar IA"}
          </button>
        )}
      </div>

      {error && (
        <p className="border-t border-sse-border px-4 py-2 text-[12px] text-red-500">{error}</p>
      )}

      {existing && <AnalysisPanel analysis={existing} />}
    </div>
  );
}

// ─── Month card ───────────────────────────────────────────────────────────────

function MesCard({ mes, wsId }: { mes: MesReporte; wsId: string }) {
  const [open, setOpen] = useState(false);
  const hasFiles = mes.total > 0;
  const mesLabel = MESES_ES[mes.mes] ?? mes.nombre;

  return (
    <div className="overflow-hidden rounded-xl border border-sse-border bg-sse-surface">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-sse-bg"
      >
        {/* Month number badge */}
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-[13px] font-bold ${
            hasFiles
              ? "bg-sse-primary text-white"
              : "bg-sse-border text-sse-muted"
          }`}
        >
          {String(mes.mes).padStart(2, "0")}
        </div>

        <div className="flex-1">
          <p className="text-[14px] font-semibold text-sse-ink">
            {mesLabel} {mes.anio > 0 ? mes.anio : ""}
          </p>
          <p className="text-[12px] text-sse-muted">
            {hasFiles
              ? `${mes.total} ${mes.total === 1 ? "informe cargado" : "informes cargados"}`
              : "Sin informes cargados"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={mes.driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-sse-muted transition hover:text-sse-primary"
          >
            <IconFolder className="h-3.5 w-3.5" />
            Drive
          </a>
          <svg
            className={`h-4 w-4 text-sse-muted transition-transform ${open ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-sse-border px-4 py-3">
          {hasFiles ? (
            <div className="space-y-3">
              {mes.archivos.map((a) => (
                <ArchivoRow
                  key={a.id}
                  archivo={a}
                  wsId={wsId}
                  mesNombre={mes.nombre}
                  mesNum={mes.mes}
                  anio={mes.anio}
                />
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-sse-muted">
              Aún no hay informes en esta carpeta. El jefe de unidad debe subir el informe
              mensual directamente en Drive.
            </p>
          )}
        </div>
      )}
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

  const totalArchivos = data?.meses.reduce((s, m) => s + m.total, 0) ?? 0;
  const mesesConArchivos = data?.meses.filter((m) => m.total > 0).length ?? 0;

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
            Informes de actividades cargados por el jefe de unidad. Usa &ldquo;Analizar IA&rdquo; para
            extraer datos automáticamente y obtener recomendaciones para el mes siguiente.
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
            Abrir en Drive
          </a>
        )}
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-sse-border bg-sse-surface px-4 py-3">
            <p className="text-[24px] font-bold text-sse-ink">{totalArchivos}</p>
            <p className="text-[12px] text-sse-muted">Informes cargados</p>
          </div>
          <div className="rounded-xl border border-sse-border bg-sse-surface px-4 py-3">
            <p className="text-[24px] font-bold text-sse-ink">{mesesConArchivos}</p>
            <p className="text-[12px] text-sse-muted">Meses con informe</p>
          </div>
          <div className="rounded-xl border border-sse-border bg-sse-surface px-4 py-3">
            <p className="text-[24px] font-bold text-sse-ink">{data.meses.length}</p>
            <p className="text-[12px] text-sse-muted">Meses configurados</p>
          </div>
        </div>
      )}

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
            Error al cargar los reportes
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

      {/* No reportes folder */}
      {data?.mensaje && (
        <div className="rounded-xl border border-sse-border bg-sse-surface px-4 py-6 text-center">
          <IconFolder className="mx-auto mb-2 h-8 w-8 text-sse-muted opacity-40" />
          <p className="text-[13px] text-sse-muted">{data.mensaje}</p>
        </div>
      )}

      {/* Month cards */}
      {data && !data.mensaje && (
        <div className="space-y-3">
          {data.meses.map((mes) => (
            <MesCard key={mes.id} mes={mes} wsId={wsId} />
          ))}
          {data.meses.length === 0 && (
            <div className="rounded-xl border border-sse-border bg-sse-surface px-4 py-6 text-center">
              <IconFolder className="mx-auto mb-2 h-8 w-8 text-sse-muted opacity-40" />
              <p className="text-[13px] text-sse-muted">
                No se encontraron carpetas de meses en la carpeta de reportes.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
