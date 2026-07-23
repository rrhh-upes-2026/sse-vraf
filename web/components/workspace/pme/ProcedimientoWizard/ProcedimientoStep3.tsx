"use client";

import { Select } from "@/components/ui/select";
import { usePMECatalogosPorTipo } from "@/hooks/usePME";
import type { ProcedimientoWizardDraft } from "./types";

interface Props {
  draft: ProcedimientoWizardDraft;
  patch: (u: Partial<ProcedimientoWizardDraft>) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-medium text-sse-ink">{label}</label>
      {children}
    </div>
  );
}

export function ProcedimientoStep3({ draft, patch }: Props) {
  const { data: tipos }        = usePMECatalogosPorTipo("tipoProcedimiento");
  const { data: periodicidades } = usePMECatalogosPorTipo("periodicidad");

  return (
    <div className="space-y-4">
      <h2 className="text-[14px] font-semibold text-sse-ink">Clasificación</h2>
      <Field label="Tipo de Procedimiento">
        <Select
          value={draft.tipoProcedimientoId ?? ""}
          onValueChange={(v) => patch({ tipoProcedimientoId: v })}
          options={[
            { value: "", label: "Sin tipo" },
            ...(tipos ?? []).map((t) => ({ value: t.id, label: t.nombre })),
          ]}
        />
      </Field>
      <Field label="Periodicidad">
        <Select
          value={draft.periodicidad ?? ""}
          onValueChange={(v) => patch({ periodicidad: v })}
          options={[
            { value: "", label: "Sin periodicidad" },
            ...(periodicidades ?? []).map((p) => ({ value: p.nombre, label: p.nombre })),
          ]}
        />
      </Field>
      <div className="flex flex-col gap-1">
        <label className="text-[12px] font-medium text-sse-ink">Objetivo</label>
        <textarea
          value={draft.objetivo ?? ""}
          onChange={(e) => patch({ objetivo: e.target.value })}
          rows={3}
          placeholder="Objetivo del procedimiento…"
          className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink outline-none placeholder:text-sse-muted focus:border-sse-primary focus:ring-1 focus:ring-sse-primary/30 resize-none"
        />
      </div>
    </div>
  );
}
