"use client";

import type { WizardDraft } from "./types";
import { Input } from "@/components/ui/input";
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

export function WizardStep1({ draft, onChange }: Props) {
  const { data: tipos } = useIMECatalogosPorTipo("tipoIndicador");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Código" required>
          <Input
            value={draft.code}
            onChange={(e) => onChange({ code: e.target.value.toUpperCase() })}
            placeholder="Ej: IND-001"
            maxLength={30}
          />
        </Field>
        <Field label="Versión">
          <Input
            value={String(draft.version ?? "1.0")}
            onChange={(e) => onChange({ version: e.target.value })}
            placeholder="1.0"
          />
        </Field>
      </div>

      <Field label="Nombre del Indicador" required>
        <Input
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Nombre descriptivo del indicador"
          maxLength={120}
        />
      </Field>

      <Field label="Descripción">
        <textarea
          value={String(draft.description ?? "")}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Descripción detallada del indicador…"
          rows={3}
          className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink outline-none placeholder:text-sse-muted focus:border-sse-primary focus:ring-1 focus:ring-sse-primary/30 resize-none"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Tipo de Indicador">
          <Select
            value={String(draft.indicatorType ?? "")}
            onValueChange={(v) => onChange({ indicatorType: v })}
            options={[
              { value: "", label: "Seleccionar tipo…" },
              ...(tipos ?? []).map((t) => ({ value: t.nombre, label: t.nombre })),
            ]}
          />
        </Field>
        <Field label="Año">
          <Input
            type="number"
            value={String(draft.year ?? new Date().getFullYear())}
            onChange={(e) => onChange({ year: e.target.value })}
            min={2020}
            max={2035}
          />
        </Field>
      </div>

      <Field label="Observaciones">
        <textarea
          value={String(draft.observations ?? "")}
          onChange={(e) => onChange({ observations: e.target.value })}
          placeholder="Notas o consideraciones adicionales…"
          rows={2}
          className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink outline-none placeholder:text-sse-muted focus:border-sse-primary focus:ring-1 focus:ring-sse-primary/30 resize-none"
        />
      </Field>
    </div>
  );
}
