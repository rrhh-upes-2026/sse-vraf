"use client";

import { useRouter } from "next/navigation";
import { useIMEIndicador, useIMEIndicadorActions, useIMEHistorial } from "@/hooks/useIME";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtShortDate } from "@/lib/utils";

interface Props {
  wsId: string;
  indicadorId: string;
}

function Row({ label, value }: { label: string; value: string | number | undefined | null }) {
  return (
    <div className="flex gap-3 py-2 border-b border-sse-border last:border-0">
      <dt className="text-[12px] text-sse-muted w-44 shrink-0">{label}</dt>
      <dd className="text-[12px] text-sse-ink font-medium flex-1">
        {value != null && value !== "" ? String(value) : <span className="text-sse-muted font-normal">—</span>}
      </dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold text-sse-muted uppercase tracking-wide mb-2">{title}</h3>
      <dl className="bg-sse-surface border border-sse-border rounded-md px-4 py-1">
        {children}
      </dl>
    </div>
  );
}

export function IndicatorDetail({ wsId, indicadorId }: Props) {
  const router = useRouter();
  const { data: ind,      isLoading: loadingInd  } = useIMEIndicador(indicadorId);
  const { data: historial, isLoading: loadingHist } = useIMEHistorial(indicadorId);
  const { activar, desactivar, duplicar }           = useIMEIndicadorActions();

  if (loadingInd) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 rounded-md" />
        <Skeleton className="h-40 rounded-md" />
      </div>
    );
  }

  if (!ind) {
    return (
      <div className="p-6 rounded-md border border-sse-sem-red-border bg-sse-sem-red-bg text-[13px] text-sse-sem-red-fg">
        Indicador no encontrado.
      </div>
    );
  }

  const isActive = ind.active === "true";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono text-sse-muted bg-sse-bg border border-sse-border rounded px-1.5 py-0.5">
              {ind.code}
            </span>
            <Badge variant={isActive ? "success" : "gray"}>
              {isActive ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <h1 className="text-[18px] font-semibold text-sse-ink">{ind.name}</h1>
          {ind.description && (
            <p className="text-[13px] text-sse-muted mt-1">{ind.description}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/ws/${wsId}/gestion-indicadores/${ind.id}/editar`)}
          >
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => duplicar.mutate({ id: ind.id })}
            disabled={duplicar.isPending}
          >
            Duplicar
          </Button>
          {isActive ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => desactivar.mutate({ id: ind.id })}
              disabled={desactivar.isPending}
            >
              Desactivar
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => activar.mutate({ id: ind.id })}
              disabled={activar.isPending}
            >
              Activar
            </Button>
          )}
        </div>
      </div>

      {/* Data sections */}
      <Section title="Información General">
        <Row label="Tipo de Indicador"  value={ind.indicatorType} />
        <Row label="Año"                value={ind.year} />
        <Row label="Versión"            value={ind.version} />
        <Row label="Observaciones"      value={ind.observations} />
      </Section>

      <Section title="Ubicación Organizacional">
        <Row label="Proceso"             value={ind.processId} />
        <Row label="Procedimiento"       value={ind.procedureId} />
        <Row label="Pilar Estratégico"   value={ind.strategicPillar} />
        <Row label="Objetivo Estratégico" value={ind.strategicObjective} />
      </Section>

      <Section title="Configuración Técnica">
        <Row label="Unidad de Medida"   value={ind.measurementUnit} />
        <Row label="Frecuencia"         value={ind.frequency} />
        <Row label="Tipo de Cálculo"    value={ind.calculationType} />
        <Row label="Polaridad"          value={ind.polarity} />
      </Section>

      <Section title="Meta y Medición">
        <Row label="Valor Meta"          value={ind.targetValue} />
        <Row label="Umbral Advertencia"  value={ind.warningThreshold} />
        <Row label="Umbral Crítico"      value={ind.criticalThreshold} />
        <Row label="Orden"               value={ind.displayOrder} />
      </Section>

      <Section title="Responsables">
        <Row label="Cargo Responsable"   value={ind.responsiblePosition} />
        <Row label="Usuario Responsable" value={ind.responsibleUser} />
      </Section>

      <Section title="Auditoría">
        <Row label="Creado por"    value={ind.createdBy} />
        <Row label="Creado el"     value={ind.createdAt ? fmtShortDate(ind.createdAt) : ""} />
        <Row label="Actualizado por" value={ind.updatedBy} />
        <Row label="Actualizado el"  value={ind.updatedAt ? fmtShortDate(ind.updatedAt) : ""} />
      </Section>

      {/* Historial */}
      <div>
        <h3 className="text-[11px] font-semibold text-sse-muted uppercase tracking-wide mb-2">Historial de Cambios</h3>
        {loadingHist ? (
          <Skeleton className="h-24 rounded-md" />
        ) : (historial ?? []).length === 0 ? (
          <p className="text-[12px] text-sse-muted">Sin historial registrado.</p>
        ) : (
          <div className="space-y-1.5">
            {(historial ?? []).map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-3 rounded-md border border-sse-border bg-sse-surface px-3 py-2"
              >
                <span className="text-[11px] font-medium text-sse-primary capitalize w-24 shrink-0">{h.accion}</span>
                <span className="text-[11px] text-sse-muted flex-1">{h.usuario || "Sistema"}</span>
                <span className="text-[11px] text-sse-muted shrink-0">
                  {h.createdAt ? fmtShortDate(h.createdAt) : "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
