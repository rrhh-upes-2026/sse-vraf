"use client";

import { Input } from "@/components/ui/input";
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

export function ProcedimientoStep4({ draft, patch }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-[14px] font-semibold text-sse-ink">Responsables</h2>
      <Field label="Cargo Responsable">
        <Input
          value={draft.responsiblePosition ?? ""}
          onChange={(e) => patch({ responsiblePosition: e.target.value })}
          placeholder="Ej. Coordinador de Operaciones"
        />
      </Field>
      <Field label="Usuario Responsable">
        <Input
          value={draft.responsibleUser ?? ""}
          onChange={(e) => patch({ responsibleUser: e.target.value })}
          placeholder="correo@upes.edu.sv"
        />
      </Field>
      <Field label="Observaciones">
        <textarea
          value={draft.observations ?? ""}
          onChange={(e) => patch({ observations: e.target.value })}
          rows={2}
          placeholder="Notas adicionales…"
          className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink outline-none placeholder:text-sse-muted focus:border-sse-primary focus:ring-1 focus:ring-sse-primary/30 resize-none"
        />
      </Field>
    </div>
  );
}
