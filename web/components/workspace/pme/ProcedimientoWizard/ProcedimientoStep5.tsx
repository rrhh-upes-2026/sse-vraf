"use client";

import type { ProcedimientoWizardDraft } from "./types";

interface Props {
  draft: ProcedimientoWizardDraft;
}

function Row({ label, value }: { label: string; value?: string | number }) {
  return value ? (
    <div className="flex items-start gap-3 py-1.5 border-b border-sse-border last:border-0">
      <span className="text-[12px] text-sse-muted w-40 shrink-0">{label}</span>
      <span className="text-[13px] text-sse-ink">{value}</span>
    </div>
  ) : null;
}

export function ProcedimientoStep5({ draft }: Props) {
  const missing: string[] = [];
  if (!draft.code?.trim())      missing.push("Código");
  if (!draft.name?.trim())      missing.push("Nombre");
  if (!draft.procesoId?.trim()) missing.push("Proceso padre");

  return (
    <div className="space-y-4">
      <h2 className="text-[14px] font-semibold text-sse-ink">Resumen</h2>

      {missing.length > 0 ? (
        <div className="rounded-md border border-sse-sem-yellow-border bg-sse-sem-yellow-bg px-3 py-2 text-[12px] text-sse-sem-yellow-fg">
          Campos requeridos incompletos: {missing.join(", ")}
        </div>
      ) : (
        <div className="rounded-md border border-sse-sem-green-border bg-sse-sem-green-bg px-3 py-2 text-[12px] text-sse-sem-green-fg">
          Todos los campos requeridos están completos. Listo para guardar.
        </div>
      )}

      <div className="divide-y divide-sse-border">
        <Row label="Código"        value={draft.code} />
        <Row label="Nombre"        value={draft.name} />
        <Row label="Versión"       value={draft.version} />
        <Row label="Periodicidad"  value={draft.periodicidad} />
        <Row label="Objetivo"      value={draft.objetivo} />
        <Row label="Responsable"   value={draft.responsiblePosition} />
        <Row label="Observaciones" value={draft.observations} />
      </div>
    </div>
  );
}
