"use client";

import type { WizardDraft } from "./types";
import { Input } from "@/components/ui/input";

interface Props {
  draft: WizardDraft;
  onChange: (patch: Partial<WizardDraft>) => void;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-medium text-sse-ink">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-sse-muted">{hint}</p>}
    </div>
  );
}

export function WizardStep5({ draft, onChange }: Props) {
  return (
    <div className="space-y-4">
      <Field label="Cargo Responsable" hint="Cargo institucional responsable del cumplimiento del indicador">
        <Input
          value={String(draft.responsiblePosition ?? "")}
          onChange={(e) => onChange({ responsiblePosition: e.target.value })}
          placeholder="Ej: Jefe de Recursos Humanos"
          maxLength={100}
        />
      </Field>

      <Field label="Usuario Responsable" hint="Nombre del funcionario responsable de registrar mediciones">
        <Input
          value={String(draft.responsibleUser ?? "")}
          onChange={(e) => onChange({ responsibleUser: e.target.value })}
          placeholder="Ej: Juan Pérez"
          maxLength={100}
        />
      </Field>

      <div className="rounded-md border border-sse-border bg-sse-bg p-3 text-[12px] text-sse-muted">
        <p className="font-medium text-sse-ink mb-1">Nota sobre responsabilidades</p>
        <p>El responsable definido aquí recibirá notificaciones cuando el indicador requiera actualización o se encuentre en estado crítico. Esta información puede modificarse posteriormente sin crear una nueva versión del indicador.</p>
      </div>
    </div>
  );
}
