"use client";

import type { WizardDraft } from "./types";
import { Badge } from "@/components/ui/badge";

interface Props {
  draft: WizardDraft;
}

function Row({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="flex gap-3 py-1.5 border-b border-sse-border last:border-0">
      <dt className="text-[12px] text-sse-muted w-40 shrink-0">{label}</dt>
      <dd className="text-[12px] text-sse-ink font-medium flex-1 min-w-0 break-words">
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

export function WizardStep6({ draft }: Props) {
  const missingRequired = [
    !draft.code && "Código",
    !draft.name && "Nombre",
    !draft.measurementUnit && "Unidad de medida",
    !draft.frequency && "Frecuencia",
    !draft.processId && "Proceso",
    (draft.targetValue == null || draft.targetValue === "") && "Valor meta",
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-5">
      {missingRequired.length > 0 && (
        <div className="rounded-md border border-sse-sem-red-border bg-sse-sem-red-bg p-3 text-[12px] text-sse-sem-red-fg">
          <p className="font-medium mb-1">Campos requeridos incompletos</p>
          <ul className="list-disc list-inside space-y-0.5">
            {missingRequired.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>
      )}

      {missingRequired.length === 0 && (
        <div className="rounded-md border border-sse-sem-green-border bg-sse-sem-green-bg p-3 text-[12px] text-sse-sem-green-fg">
          Todos los campos requeridos están completos. Revise el resumen y confirme la creación.
        </div>
      )}

      <Section title="Información General">
        <Row label="Código"    value={draft.code} />
        <Row label="Nombre"    value={draft.name} />
        <Row label="Descripción" value={draft.description} />
        <Row label="Tipo"      value={draft.indicatorType} />
        <Row label="Año"       value={draft.year} />
        <Row label="Versión"   value={draft.version} />
      </Section>

      <Section title="Ubicación Organizacional">
        <Row label="Proceso"          value={draft.processId} />
        <Row label="Procedimiento"    value={draft.procedureId} />
        <Row label="Pilar Estratégico" value={draft.strategicPillar} />
        <Row label="Objetivo Estratégico" value={draft.strategicObjective} />
      </Section>

      <Section title="Configuración Técnica">
        <Row label="Unidad de Medida"  value={draft.measurementUnit} />
        <Row label="Frecuencia"        value={draft.frequency} />
        <Row label="Tipo de Cálculo"   value={draft.calculationType} />
        <Row label="Polaridad"         value={draft.polarity} />
      </Section>

      <Section title="Meta y Medición">
        <Row label="Valor Meta"          value={draft.targetValue} />
        <Row label="Umbral Advertencia"  value={draft.warningThreshold} />
        <Row label="Umbral Crítico"      value={draft.criticalThreshold} />
        <Row label="Orden"               value={draft.displayOrder} />
      </Section>

      <Section title="Responsables">
        <Row label="Cargo Responsable"   value={draft.responsiblePosition} />
        <Row label="Usuario Responsable" value={draft.responsibleUser} />
      </Section>

      <div className="flex items-center gap-2 text-[12px] text-sse-muted">
        Estado inicial:
        <Badge variant="success">Activo</Badge>
      </div>
    </div>
  );
}
