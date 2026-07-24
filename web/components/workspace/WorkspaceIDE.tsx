"use client";

import Link from "next/link";
import { useIDEIndicators } from "@/hooks/useIDE";

const PILLARS = [
  { label: "Validador Institucional", desc: "Valida código único, objetivo, dimensión, responsable, fórmula, variables, meta y rangos antes de guardar.", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-amber-700 bg-amber-50 border-amber-200" },
  { label: "Motor de Fórmulas", desc: "Integra el FormulaEngine del FMI. El indicador solo referencia un formulaId; nunca duplica fórmulas.", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4", color: "text-teal-700 bg-teal-50 border-teal-200" },
  { label: "VariableResolver", desc: "Lee automáticamente las variables de FormulaEngine. El usuario no vuelve a definirlas en el indicador.", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z", color: "text-violet-700 bg-violet-50 border-violet-200" },
  { label: "PreviewEngine", desc: "Muestra en tiempo real nombre, descripción, variables, meta, polaridad, forma de cálculo y resultado esperado.", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z", color: "text-blue-700 bg-blue-50 border-blue-200" },
  { label: "Simulador", desc: "Permite ingresar valores de ejemplo para calcular el resultado, el nivel del semáforo y la interpretación, sin guardar nada.", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-green-700 bg-green-50 border-green-200" },
  { label: "ImportEngine", desc: "Infraestructura para importar indicadores desde Excel, CSV y JSON. Todo pasa por el validador antes de insertarse.", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12", color: "text-rose-700 bg-rose-50 border-rose-200" },
  { label: "Control de Versiones", desc: "Cada cambio genera un snapshot. Permite publicar, archivar y duplicar versiones. Las publicadas nunca se sobrescriben.", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { label: "Detector de Duplicados", desc: "Detecta código repetido, nombre idéntico e indicadores equivalentes antes de guardar o importar.", icon: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z", color: "text-red-700 bg-red-50 border-red-200" },
];

function IDEStats({ wsId }: { wsId: string }) {
  const all      = useIDEIndicators();
  const draft    = useIDEIndicators({ status: "borrador" });
  const review   = useIDEIndicators({ status: "en_revision" });
  const published= useIDEIndicators({ status: "publicado" });
  const archived = useIDEIndicators({ status: "archivado" });

  const stat = (label: string, n: number | undefined, color: string) => (
    <div className={`rounded-lg border p-4 ${color}`}>
      <p className="text-[22px] font-bold tabular-nums">{n ?? "—"}</p>
      <p className="text-[11px] font-medium mt-0.5">{label}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {stat("Total", all.data?.length, "bg-sse-surface border-sse-border text-sse-ink")}
      {stat("Borrador", draft.data?.length, "bg-amber-50 border-amber-200 text-amber-700")}
      {stat("En revisión", review.data?.length, "bg-blue-50 border-blue-200 text-blue-700")}
      {stat("Publicados", published.data?.length, "bg-green-50 border-green-200 text-green-700")}
      {stat("Archivados", archived.data?.length, "bg-sse-border/40 border-sse-border text-sse-muted")}
    </div>
  );
}

export function WorkspaceIDE({ wsId }: { wsId: string }) {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-amber-600 mt-0.5 shrink-0">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <p className="text-[13px] font-semibold text-amber-800">Motor IDE — Sprint 016 listo</p>
            <p className="text-[12px] text-amber-700 mt-0.5">
              Infraestructura completa para definir, validar, simular e importar indicadores institucionales. Consume el FMI como base. Estándar para todas las unidades.
            </p>
          </div>
        </div>
      </div>

      {/* Live stats */}
      <IDEStats wsId={wsId} />

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Link href={`/ws/${wsId}/ide-crear`}
          className="text-[12px] px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 font-medium">
          + Nuevo Indicador
        </Link>
        <Link href={`/ws/${wsId}/ide-listado`}
          className="text-[12px] px-4 py-2 rounded-lg border border-sse-border text-sse-ink hover:bg-sse-surface">
          Ver todos los indicadores
        </Link>
        <Link href={`/ws/${wsId}/ide-simulador`}
          className="text-[12px] px-4 py-2 rounded-lg border border-sse-border text-sse-ink hover:bg-sse-surface">
          Abrir Simulador
        </Link>
        <Link href={`/ws/${wsId}/ide-importacion`}
          className="text-[12px] px-4 py-2 rounded-lg border border-sse-border text-sse-ink hover:bg-sse-surface">
          Preparar importación
        </Link>
      </div>

      {/* Pillars */}
      <div>
        <p className="text-[12px] font-semibold text-sse-ink mb-3">Componentes del Motor</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PILLARS.map((p) => (
            <div key={p.label} className={`rounded-lg border p-3.5 ${p.color}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 shrink-0">
                  <path d={p.icon} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-[11px] font-semibold">{p.label}</p>
              </div>
              <p className="text-[11px] opacity-80 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* States guide */}
      <div className="rounded-lg border border-sse-border p-4 bg-sse-surface">
        <p className="text-[12px] font-semibold text-sse-ink mb-3">Estados del Indicador</p>
        <div className="flex flex-wrap gap-2">
          {[
            { s: "Borrador", c: "bg-amber-100 text-amber-700", d: "En construcción. No disponible para captura." },
            { s: "En revisión", c: "bg-blue-100 text-blue-700", d: "Pendiente de aprobación." },
            { s: "Publicado", c: "bg-green-100 text-green-700", d: "Disponible para captura de datos." },
            { s: "Archivado", c: "bg-sse-border text-sse-muted", d: "Fuera de uso. Solo consulta." },
          ].map((s) => (
            <div key={s.s} className="flex items-center gap-2">
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${s.c}`}>{s.s}</span>
              <span className="text-[11px] text-sse-muted">{s.d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
