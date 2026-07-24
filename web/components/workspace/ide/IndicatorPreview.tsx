"use client";

import Link from "next/link";
import { useIDEIndicator, useIDEVariables } from "@/hooks/useIDE";
import { useFMIObjective, useFMIDimension, useFMIUnitMeasure, useFMIFrequency, useFMIFormula, useFMIRangeConfig } from "@/hooks/useFMI";
import type { IDEStatus } from "@/types/ide";

const STATUS_STYLES: Record<IDEStatus, string> = {
  borrador:    "bg-amber-100 text-amber-700",
  en_revision: "bg-blue-100 text-blue-700",
  publicado:   "bg-green-100 text-green-700",
  archivado:   "bg-sse-border text-sse-muted",
};

const STATUS_LABELS: Record<IDEStatus, string> = {
  borrador:    "Borrador",
  en_revision: "En revisión",
  publicado:   "Publicado",
  archivado:   "Archivado",
};

const LEVEL_COLORS: Record<string, string> = {
  excelente: "bg-green-100 border-green-300 text-green-800",
  bueno:     "bg-teal-100 border-teal-300 text-teal-800",
  aceptable: "bg-amber-100 border-amber-300 text-amber-800",
  critico:   "bg-red-100 border-red-300 text-red-800",
};

const LEVEL_LABELS: Record<string, string> = {
  excelente: "Excelente",
  bueno:     "Bueno",
  aceptable: "Aceptable",
  critico:   "Crítico",
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4">
      <span className="text-[11px] text-sse-muted sm:w-44 shrink-0">{label}</span>
      <span className="text-[12px] text-sse-ink">{value || <span className="text-sse-muted italic">—</span>}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-sse-border bg-sse-surface">
      <div className="px-4 py-3 border-b border-sse-border">
        <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">{title}</p>
      </div>
      <div className="px-4 py-3 space-y-2.5">{children}</div>
    </div>
  );
}

export function IDEIndicatorPreview({ wsId, indicatorId }: { wsId: string; indicatorId: string }) {
  const { data: ind, isLoading } = useIDEIndicator(indicatorId);

  // Resolve FMI catalogs (enabled only when IDs are present)
  const { data: objetivo     } = useFMIObjective(ind?.objetivoId    ?? "");
  const { data: dimension    } = useFMIDimension(ind?.dimensionId   ?? "");
  const { data: unitMeasure  } = useFMIUnitMeasure(ind?.unitMeasureId ?? "");
  const { data: frequency    } = useFMIFrequency(ind?.frequencyId   ?? "");
  const { data: formula      } = useFMIFormula(ind?.formulaId       ?? "");
  const { data: rangeConfig  } = useFMIRangeConfig(ind?.rangeConfigId ?? "");
  const { data: variables    } = useIDEVariables(ind?.formulaId     ?? "");

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 rounded-xl bg-sse-border" />
        <div className="h-40 rounded-lg bg-sse-border" />
        <div className="h-40 rounded-lg bg-sse-border" />
      </div>
    );
  }

  if (!ind) {
    return (
      <div className="rounded-lg border border-sse-border p-8 text-center">
        <p className="text-sse-muted text-[13px]">Indicador no encontrado.</p>
        <Link href={`/ws/${wsId}/ide-listado`} className="text-[12px] text-amber-600 hover:underline mt-2 inline-block">
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Header */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-100 rounded px-2 py-0.5">
                {ind.codigo}
              </span>
              <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[ind.status]}`}>
                {STATUS_LABELS[ind.status]}
              </span>
              <span className="text-[10px] text-amber-500">v{ind.version}</span>
            </div>
            <h1 className="text-[18px] font-bold text-amber-900 leading-tight">{ind.nombre}</h1>
            {ind.descripcion && (
              <p className="text-[12px] text-amber-700 mt-1">{ind.descripcion}</p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href={`/ws/${wsId}/ide-editar/${ind.id}`}
              className="text-[11px] px-3 py-1.5 rounded border border-amber-300 text-amber-700 hover:bg-amber-100">
              Editar
            </Link>
            <Link href={`/ws/${wsId}/ide-listado`}
              className="text-[11px] px-3 py-1.5 rounded border border-sse-border text-sse-muted hover:bg-sse-surface">
              ← Listado
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-4">
          <Section title="Clasificación estratégica">
            <InfoRow label="Objetivo" value={objetivo ? `${objetivo.codigo} — ${objetivo.nombre}` : ind.objetivoId} />
            <InfoRow label="Dimensión" value={dimension ? `${dimension.codigo} — ${dimension.nombre}` : ind.dimensionId} />
          </Section>

          <Section title="Medición">
            <InfoRow label="Unidad de medida" value={unitMeasure ? `${unitMeasure.nombre} (${unitMeasure.tipo})` : ind.unitMeasureId} />
            <InfoRow label="Frecuencia" value={frequency?.nombre ?? ind.frequencyId} />
            <InfoRow label="Meta" value={ind.meta != null ? (
              <span className="font-semibold text-amber-700">{ind.meta}</span>
            ) : null} />
          </Section>

          <Section title="Vigencia">
            <InfoRow label="Desde" value={ind.vigenciaDesde ? new Date(ind.vigenciaDesde).toLocaleDateString("es-SV") : null} />
            <InfoRow label="Hasta" value={ind.vigenciaHasta ? new Date(ind.vigenciaHasta).toLocaleDateString("es-SV") : null} />
            <InfoRow label="Creado" value={new Date(ind.createdAt).toLocaleDateString("es-SV")} />
            <InfoRow label="Actualizado" value={new Date(ind.updatedAt).toLocaleDateString("es-SV")} />
          </Section>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Section title="Fórmula y variables">
            {formula ? (
              <div className="space-y-2">
                <InfoRow label="Fórmula" value={`${formula.codigo} — ${formula.nombre}`} />
                {formula.formulaVisible && (
                  <div className="rounded bg-sse-bg border border-sse-border px-3 py-2">
                    <p className="text-[10px] text-sse-muted mb-1">Expresión matemática</p>
                    <p className="text-[13px] font-mono text-sse-ink">{formula.formulaVisible}</p>
                  </div>
                )}
                {variables && variables.length > 0 && (
                  <div>
                    <p className="text-[10px] text-sse-muted mb-1.5">Variables ({variables.length})</p>
                    <div className="space-y-1.5">
                      {variables.map((v) => (
                        <div key={v.codigo} className="rounded border border-sse-border bg-sse-bg px-2.5 py-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-amber-700">{v.codigo}</span>
                            <span className="text-[10px] text-sse-ink">{v.nombre}</span>
                            <span className="text-[9px] text-sse-muted ml-auto">{v.tipo}</span>
                          </div>
                          {v.descripcion && (
                            <p className="text-[10px] text-sse-muted mt-0.5">{v.descripcion}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-sse-muted italic">Sin fórmula asignada.</p>
            )}
          </Section>

          <Section title="Configuración de rangos">
            {rangeConfig ? (
              <div className="space-y-2">
                <InfoRow label="Configuración" value={rangeConfig.nombre} />
                {["excelente", "bueno", "aceptable", "critico"].map((level) => (
                  <div key={level} className={`rounded border px-3 py-1.5 text-[11px] font-medium ${LEVEL_COLORS[level]}`}>
                    {LEVEL_LABELS[level]}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-sse-muted italic">Sin configuración de rangos.</p>
            )}
          </Section>
        </div>
      </div>

      {/* Observations */}
      {ind.observaciones && (
        <Section title="Observaciones">
          <p className="text-[12px] text-sse-ink leading-relaxed">{ind.observaciones}</p>
        </Section>
      )}

      {/* Quick links */}
      <div className="flex flex-wrap gap-2">
        <Link href={`/ws/${wsId}/ide-simulador`}
          className="text-[11px] px-3 py-1.5 rounded border border-sse-border text-sse-ink hover:bg-sse-surface">
          Abrir simulador
        </Link>
        <Link href={`/ws/${wsId}/ide-versiones`}
          className="text-[11px] px-3 py-1.5 rounded border border-sse-border text-sse-ink hover:bg-sse-surface">
          Ver historial de versiones
        </Link>
      </div>
    </div>
  );
}
