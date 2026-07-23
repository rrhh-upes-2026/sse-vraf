"use client";

import type { WizardDraft } from "./types";
import { Select } from "@/components/ui/select";
import { useIMECatalogosPorTipo } from "@/hooks/useIME";

interface Props {
  draft: WizardDraft;
  onChange: (patch: Partial<WizardDraft>) => void;
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-medium text-sse-ink">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-sse-muted">{hint}</p>}
    </div>
  );
}

export function WizardStep3({ draft, onChange }: Props) {
  const { data: unidades }    = useIMECatalogosPorTipo("unidadMedida");
  const { data: frecuencias } = useIMECatalogosPorTipo("frecuencia");
  const { data: polaridades } = useIMECatalogosPorTipo("polaridad");

  return (
    <div className="space-y-4">
      <Field label="Unidad de Medida" required>
        <Select
          value={String(draft.measurementUnit ?? "")}
          onValueChange={(v) => onChange({ measurementUnit: v })}
          options={[
            { value: "", label: "Seleccionar unidad…" },
            ...(unidades ?? []).map((u) => ({ value: u.nombre, label: u.nombre })),
          ]}
        />
      </Field>

      <Field label="Frecuencia de Medición" required hint="Con qué periodicidad se mide el indicador">
        <Select
          value={String(draft.frequency ?? "")}
          onValueChange={(v) => onChange({ frequency: v })}
          options={[
            { value: "", label: "Seleccionar frecuencia…" },
            ...(frecuencias ?? []).map((f) => ({ value: f.nombre, label: f.nombre })),
          ]}
        />
      </Field>

      <Field label="Tipo de Cálculo" hint="Cómo se agrega el valor cuando hay múltiples mediciones en el periodo">
        <Select
          value={String(draft.calculationType ?? "promedio")}
          onValueChange={(v) => onChange({ calculationType: v as WizardDraft["calculationType"] })}
          options={[
            { value: "promedio", label: "Promedio" },
            { value: "suma",     label: "Suma acumulada" },
            { value: "ultimo",   label: "Último valor" },
            { value: "minimo",   label: "Mínimo" },
            { value: "maximo",   label: "Máximo" },
          ]}
        />
      </Field>

      <Field label="Polaridad" hint="Tendencia deseada del indicador">
        <Select
          value={String(draft.polarity ?? "positiva")}
          onValueChange={(v) => onChange({ polarity: v as WizardDraft["polarity"] })}
          options={[
            { value: "positiva", label: "Positiva — mayor es mejor" },
            { value: "negativa", label: "Negativa — menor es mejor" },
            { value: "neutra",   label: "Neutra — sin tendencia definida" },
            ...(polaridades ?? [])
              .filter((p) => !["positiva","negativa","neutra"].includes(p.nombre))
              .map((p) => ({ value: p.nombre, label: p.nombre })),
          ]}
        />
      </Field>
    </div>
  );
}
