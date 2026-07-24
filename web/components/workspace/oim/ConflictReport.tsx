"use client";

import { useOIMReports } from "@/hooks/useOIM";
import type { OIMMigrationReport } from "@/types/oim";

function ConflictRow({ c }: { c: OIMMigrationReport["conflictList"][number] }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-sse-border last:border-0">
      <div className="shrink-0 mt-0.5">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
          c.accion === "omitir" ? "bg-sse-border/40 text-sse-muted" : "bg-amber-100 text-amber-700"
        }`}>
          {c.accion === "omitir" ? "Omitido" : "Revisar"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-sse-ink">#{c.seq} — {c.nombre}</span>
          <span className="text-[10px] text-sse-muted bg-sse-surface rounded px-1.5 py-0.5">{c.tipo}</span>
        </div>
        <p className="text-[11px] text-red-600 mt-0.5">{c.detalle}</p>
      </div>
    </div>
  );
}

function WarningRow({ w }: { w: { seq: number; nombre: string; mensaje: string } }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-sse-border last:border-0">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-amber-500 shrink-0 mt-0.5">
        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="flex-1 min-w-0">
        <span className="text-[11px] font-medium text-sse-ink">#{w.seq} — {w.nombre}</span>
        <p className="text-[11px] text-amber-600 mt-0.5">{w.mensaje}</p>
      </div>
    </div>
  );
}

export function ConflictReport() {
  const { data: reports, isLoading } = useOIMReports();
  const last = reports?.[0];

  if (isLoading) return <p className="text-[12px] text-sse-muted py-4">Cargando…</p>;
  if (!last) {
    return (
      <div className="rounded-xl border border-sse-border bg-sse-surface p-8 text-center">
        <p className="text-[13px] font-medium text-sse-ink">Sin datos de conflictos</p>
        <p className="text-[12px] text-sse-muted mt-1">Ejecuta la migración para ver los conflictos y warnings detectados.</p>
      </div>
    );
  }

  let parsed: OIMMigrationReport | null = null;
  try { parsed = JSON.parse(last.reportJson) as OIMMigrationReport; } catch { /* keep null */ }

  if (!parsed) {
    return <p className="text-[12px] text-red-600 py-4">No se pudo parsear el reporte de conflictos.</p>;
  }

  const hasConflicts = parsed.conflictList.length > 0;
  const hasWarnings  = parsed.warningList.length > 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-sse-ink">Conflictos y Warnings</h2>
        <p className="text-[11px] text-sse-muted">{last.runAt}</p>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        <div className={`rounded-lg border px-3 py-2 ${hasConflicts ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
          <span className={`text-[11px] font-semibold ${hasConflicts ? "text-red-700" : "text-green-700"}`}>
            {parsed.conflictos} conflicto{parsed.conflictos !== 1 ? "s" : ""}
          </span>
        </div>
        <div className={`rounded-lg border px-3 py-2 ${hasWarnings ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
          <span className={`text-[11px] font-semibold ${hasWarnings ? "text-amber-700" : "text-green-700"}`}>
            {parsed.warnings} warning{parsed.warnings !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Conflicts */}
      {hasConflicts ? (
        <div className="rounded-xl border border-red-200 bg-white p-4">
          <h3 className="text-[12px] font-semibold text-red-700 mb-2">Conflictos Detectados</h3>
          <p className="text-[11px] text-sse-muted mb-3">
            Estos indicadores NO fueron importados. Regla: si falta catálogo → registrar conflicto, nunca auto-crear ni importar.
          </p>
          <div>
            {parsed.conflictList.map((c, i) => (
              <ConflictRow key={i} c={c} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-[12px] text-green-700 font-medium">Sin conflictos en esta ejecución.</p>
        </div>
      )}

      {/* Warnings */}
      {hasWarnings ? (
        <div className="rounded-xl border border-amber-200 bg-white p-4">
          <h3 className="text-[12px] font-semibold text-amber-700 mb-2">Warnings</h3>
          <div>
            {parsed.warningList.map((w, i) => (
              <WarningRow key={i} w={w} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-[12px] text-green-700 font-medium">Sin warnings en esta ejecución.</p>
        </div>
      )}
    </div>
  );
}
