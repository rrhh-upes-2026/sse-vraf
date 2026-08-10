"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useMonitoreoReportes } from "@/hooks/useMonitoreoReportes";
import { useMonitoreoIndicadores } from "@/hooks/useMonitoreoIndicadores";
import { getUnidad } from "@/types/unidad";
import type { IndicadorMonitoreo } from "@/services/monitoreo";
import type { MesReporte, ArchivoReporte } from "@/services/reportes";

// ─── Constants ────────────────────────────────────────────────────────────────

const MESES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const PERIODO_TO_NUM: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4,
  mayo: 5, junio: 6, julio: 7, agosto: 8,
  septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
};

function periodoToNum(periodo: string): number {
  const s = periodo.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  for (const [name, num] of Object.entries(PERIODO_TO_NUM)) {
    if (s.includes(name)) return num;
  }
  return 0;
}

function getValorMes(ind: IndicadorMonitoreo, mesNum: number): number | null {
  const entry = ind.historial.find((h) => periodoToNum(h.periodo) === mesNum);
  return entry?.valor ?? null;
}

type Semaforo = "verde" | "amarillo" | "rojo" | "gris";

function calcSemaforo(valor: number | null, meta: number | null): Semaforo {
  if (valor === null || meta === null || meta === 0) return "gris";
  const pct = (valor / meta) * 100;
  if (pct >= 80) return "verde";
  if (pct >= 60) return "amarillo";
  return "rojo";
}

function fmtValor(valor: number | null, unidad: string): string {
  if (valor === null) return "—";
  if (unidad === "%") return `${valor}%`;
  if (unidad === "$") return `$${valor.toLocaleString("es-SV")}`;
  return `${valor} ${unidad}`;
}

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

// ─── Semaforo dot ─────────────────────────────────────────────────────────────

function SemaforoDot({ value, size = "sm" }: { value: Semaforo; size?: "sm" | "md" }) {
  const cls = {
    verde:    "bg-emerald-500",
    amarillo: "bg-amber-400",
    rojo:     "bg-red-500",
    gris:     "bg-sse-border",
  }[value];
  const dim = size === "md" ? "h-3 w-3" : "h-2.5 w-2.5";
  return <span className={`inline-block flex-shrink-0 rounded-full ${dim} ${cls}`} />;
}

// ─── Month selector ───────────────────────────────────────────────────────────

function MonthSelector({
  mesesConIndicadores,
  mesesConReporte,
  selected,
  onSelect,
}: {
  mesesConIndicadores: Set<number>;
  mesesConReporte: Set<number>;
  selected: number;
  onSelect: (n: number) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
      {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => {
        const hasInd = mesesConIndicadores.has(n);
        const hasRep = mesesConReporte.has(n);
        const isSelected = selected === n;
        const hasData = hasInd || hasRep;

        return (
          <button
            key={n}
            onClick={() => hasData && onSelect(n)}
            disabled={!hasData && !isSelected}
            title={MESES[n]}
            className={[
              "relative flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 transition",
              isSelected
                ? "border-sse-primary bg-sse-primary text-white shadow-sm"
                : hasData
                ? "border-sse-border bg-sse-surface text-sse-ink hover:border-sse-primary/50 hover:bg-sse-primary/5"
                : "cursor-default border-dashed border-sse-border/50 text-sse-muted/30",
            ].join(" ")}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wide leading-none">
              {MESES[n]?.slice(0, 3)}
            </span>
            {/* Status dots */}
            <div className="flex gap-0.5">
              <span className={`h-1.5 w-1.5 rounded-full ${
                isSelected ? "bg-white/80" :
                hasInd ? "bg-sse-primary" : "bg-transparent"
              }`} />
              <span className={`h-1.5 w-1.5 rounded-full ${
                isSelected ? "bg-white/80" :
                hasRep ? "bg-emerald-500" : "bg-transparent"
              }`} />
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Indicators dashboard for a month ────────────────────────────────────────

function IndicadoresMes({
  indicadores,
  mesNum,
}: {
  indicadores: IndicadorMonitoreo[];
  mesNum: number;
}) {
  const rows = useMemo(() => {
    return indicadores
      .map((ind) => {
        const valor = getValorMes(ind, mesNum);
        const sem = valor !== null ? calcSemaforo(valor, ind.meta) : "gris";
        return { ind, valor, sem };
      })
      .filter((r) => r.valor !== null);
  }, [indicadores, mesNum]);

  if (rows.length === 0) {
    return (
      <p className="py-4 text-center text-[13px] text-sse-muted">
        No hay resultados de indicadores registrados para este mes.
      </p>
    );
  }

  const counts = { verde: 0, amarillo: 0, rojo: 0, gris: 0 };
  rows.forEach((r) => { counts[r.sem]++; });

  return (
    <div className="space-y-3">
      {/* Traffic light summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { key: "verde" as const,    label: "En meta",    cls: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400" },
          { key: "amarillo" as const, label: "En riesgo",  cls: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400" },
          { key: "rojo" as const,     label: "Bajo meta",  cls: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400" },
        ].map(({ key, label, cls }) => (
          <div key={key} className={`rounded-xl border px-3 py-2.5 ${cls}`}>
            <p className="text-[22px] font-bold leading-none">{counts[key]}</p>
            <p className="mt-0.5 text-[11px] font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Indicator table */}
      <div className="overflow-x-auto rounded-xl border border-sse-border">
        <table className="w-full min-w-[480px] text-[12px]">
          <thead>
            <tr className="border-b border-sse-border bg-sse-surface">
              <th className="px-3 py-2.5 text-left font-semibold text-sse-muted">Indicador</th>
              <th className="px-3 py-2.5 text-right font-semibold text-sse-muted">Resultado</th>
              <th className="px-3 py-2.5 text-right font-semibold text-sse-muted">Meta</th>
              <th className="px-3 py-2.5 text-right font-semibold text-sse-muted">%</th>
              <th className="px-3 py-2.5 text-center font-semibold text-sse-muted">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sse-border">
            {rows.map(({ ind, valor, sem }) => {
              const pct = ind.meta && valor !== null
                ? Math.round((valor / ind.meta) * 100)
                : null;
              return (
                <tr key={ind.id} className="hover:bg-sse-bg/50">
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-sse-ink">{ind.nombre}</p>
                    {ind.responsable && (
                      <p className="text-[10px] text-sse-muted">{ind.responsable}</p>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium text-sse-ink tabular-nums">
                    {fmtValor(valor, ind.unidad)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-sse-muted tabular-nums">
                    {fmtValor(ind.meta, ind.unidad)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-sse-muted">
                    {pct !== null ? `${pct}%` : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-center">
                      <SemaforoDot value={sem} size="md" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Report files for a month ─────────────────────────────────────────────────

function InformeMes({
  mes,
}: {
  mes: MesReporte | undefined;
}) {
  if (!mes) {
    return (
      <p className="py-2 text-[12px] text-sse-muted italic">
        Esta unidad no tiene carpeta de reportes configurada en Drive.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-sse-muted">
          {mes.total > 0
            ? `${mes.total} ${mes.total === 1 ? "archivo subido" : "archivos subidos"}`
            : "Sin archivos subidos aún"}
        </p>
        <a
          href={mes.driveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] text-sse-muted transition hover:text-sse-primary"
        >
          <IconFolder className="h-3.5 w-3.5" />
          Abrir carpeta
        </a>
      </div>

      {mes.total > 0 ? (
        mes.archivos.map((a) => <ArchivoRow key={a.id} archivo={a} />)
      ) : (
        <div className="rounded-lg border border-dashed border-sse-border px-4 py-3 text-center">
          <p className="text-[12px] text-sse-muted">
            El jefe de unidad no ha subido el informe de este mes.
          </p>
          <a
            href={mes.driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-[12px] text-sse-primary hover:underline"
          >
            <IconFolder className="h-3.5 w-3.5" />
            Ir a la carpeta en Drive
          </a>
        </div>
      )}
    </div>
  );
}

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

// ─── Main dashboard panel ─────────────────────────────────────────────────────

function MesDashboard({
  mesNum,
  indicadores,
  mesReporte,
}: {
  mesNum: number;
  indicadores: IndicadorMonitoreo[];
  mesReporte: MesReporte | undefined;
}) {
  return (
    <div className="space-y-4">
      {/* Indicators section */}
      <div className="rounded-xl border border-sse-border bg-sse-surface">
        <div className="border-b border-sse-border px-4 py-3">
          <h3 className="text-[13px] font-semibold text-sse-ink">
            Indicadores — {MESES[mesNum]}
          </h3>
          <p className="text-[11px] text-sse-muted">Resultados registrados en la hoja de indicadores</p>
        </div>
        <div className="px-4 py-4">
          <IndicadoresMes indicadores={indicadores} mesNum={mesNum} />
        </div>
      </div>

      {/* Report section */}
      <div className="rounded-xl border border-sse-border bg-sse-surface">
        <div className="border-b border-sse-border px-4 py-3">
          <h3 className="text-[13px] font-semibold text-sse-ink">
            Informe mensual — {MESES[mesNum]}
          </h3>
          <p className="text-[11px] text-sse-muted">Documento subido por el jefe de unidad</p>
        </div>
        <div className="px-4 py-4">
          <InformeMes mes={mesReporte} />
        </div>
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

  const indicadoresQ = useMonitoreoIndicadores(wsId);
  const reportesQ    = useMonitoreoReportes(wsId);

  const indicadores  = indicadoresQ.data ?? [];
  const reportesData = reportesQ.data;

  // Months that have at least one indicator result
  const mesesConIndicadores = useMemo<Set<number>>(() => {
    const s = new Set<number>();
    indicadores.forEach((ind) => {
      ind.historial.forEach((h) => {
        const n = periodoToNum(h.periodo);
        if (n > 0) s.add(n);
      });
    });
    return s;
  }, [indicadores]);

  // Months that have at least one report file
  const mesesConReporte = useMemo<Set<number>>(() => {
    const s = new Set<number>();
    (reportesData?.meses ?? []).forEach((m) => {
      if (m.total > 0 && m.mes > 0) s.add(m.mes);
    });
    return s;
  }, [reportesData]);

  // Build month map for report lookup
  const mesByNum = useMemo(() => {
    const m = new Map<number, MesReporte>();
    (reportesData?.meses ?? []).forEach((mes) => m.set(mes.mes, mes));
    return m;
  }, [reportesData]);

  // Default: most recent month with indicator data
  const defaultMes = useMemo<number>(() => {
    const all = [...mesesConIndicadores, ...mesesConReporte];
    if (!all.length) return new Date().getMonth() + 1;
    return Math.max(...all);
  }, [mesesConIndicadores, mesesConReporte]);

  const [selectedMes, setSelectedMes] = useState<number | null>(null);
  const activeMes = selectedMes ?? defaultMes;

  const isLoading = indicadoresQ.isLoading || reportesQ.isLoading;
  const isError   = indicadoresQ.isError && reportesQ.isError;

  // Stats
  const totalReportes  = reportesData?.meses.reduce((s, m) => s + m.total, 0) ?? 0;
  const mesesCubiertos = mesesConReporte.size;
  const indConResultado = indicadores.filter((i) => i.resultado !== null).length;

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
            Dashboard mensual: selecciona un mes para ver indicadores e informe de actividades.
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
      {isLoading && (
        <div className="flex items-center gap-3 rounded-xl border border-sse-border bg-sse-surface px-4 py-6">
          <IconLoader className="h-5 w-5 animate-spin text-sse-primary" />
          <p className="text-[13px] text-sse-muted">Cargando datos…</p>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 dark:border-red-900 dark:bg-red-950/20">
          <p className="text-[13px] text-red-600 dark:text-red-400">
            Error al cargar datos. Intenta de nuevo más tarde.
          </p>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-sse-border bg-sse-surface px-4 py-3">
              <p className="text-[24px] font-bold text-sse-ink">{indConResultado}</p>
              <p className="text-[12px] text-sse-muted">Indicadores activos</p>
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
              mesesConIndicadores={mesesConIndicadores}
              mesesConReporte={mesesConReporte}
              selected={activeMes}
              onSelect={(n) => setSelectedMes(n)}
            />
            <div className="mt-3 flex items-center gap-4 text-[11px] text-sse-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sse-primary" /> Con indicadores
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Con informe
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full border border-sse-border" /> Sin datos
              </span>
            </div>
          </div>

          {/* Month dashboard */}
          <MesDashboard
            mesNum={activeMes}
            indicadores={indicadores}
            mesReporte={mesByNum.get(activeMes)}
          />
        </>
      )}
    </div>
  );
}
