"use client";

import type { WizardDraft } from "./types";
import { Select } from "@/components/ui/select";
import { useIMECatalogosPorTipo } from "@/hooks/useIME";

interface Props {
  draft: WizardDraft;
  onChange: (patch: Partial<WizardDraft>) => void;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-medium text-sse-ink">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export function WizardStep2({ draft, onChange }: Props) {
  const { data: procesos }     = useIMECatalogosPorTipo("proceso");
  const { data: procedimientos } = useIMECatalogosPorTipo("procedimiento");
  const { data: pilares }      = useIMECatalogosPorTipo("pilarEstrategico");
  const { data: objetivos }    = useIMECatalogosPorTipo("objetivoEstrategico");

  return (
    <div className="space-y-4">
      <Field label="Proceso" required>
        <Select
          value={String(draft.processId ?? "")}
          onValueChange={(v) => onChange({ processId: v })}
          options={[
            { value: "", label: "Seleccionar proceso…" },
            ...(procesos ?? []).map((p) => ({ value: p.id, label: p.nombre })),
          ]}
        />
      </Field>

      <Field label="Procedimiento">
        <Select
          value={String(draft.procedureId ?? "")}
          onValueChange={(v) => onChange({ procedureId: v })}
          options={[
            { value: "", label: "Seleccionar procedimiento…" },
            ...(procedimientos ?? []).map((p) => ({ value: p.id, label: p.nombre })),
          ]}
        />
      </Field>

      <Field label="Pilar Estratégico">
        <Select
          value={String(draft.strategicPillar ?? "")}
          onValueChange={(v) => onChange({ strategicPillar: v })}
          options={[
            { value: "", label: "Sin pilar estratégico" },
            ...(pilares ?? []).map((p) => ({ value: p.nombre, label: p.nombre })),
          ]}
        />
      </Field>

      <Field label="Objetivo Estratégico">
        <Select
          value={String(draft.strategicObjective ?? "")}
          onValueChange={(v) => onChange({ strategicObjective: v })}
          options={[
            { value: "", label: "Sin objetivo estratégico" },
            ...(objetivos ?? []).map((o) => ({ value: o.nombre, label: o.nombre })),
          ]}
        />
      </Field>
    </div>
  );
}
