"use client";

import { Input } from "@/components/ui/input";
import type { ProcesoWizardDraft } from "./types";

interface Props {
  draft: ProcesoWizardDraft;
  patch: (u: Partial<ProcesoWizardDraft>) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-medium text-sse-ink">{label}</label>
      {children}
    </div>
  );
}

export function ProcesoStep4({ draft, patch }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-[14px] font-semibold text-sse-ink">Responsables</h2>
      <Field label="Cargo Responsable">
        <Input
          value={draft.responsiblePosition ?? ""}
          onChange={(e) => patch({ responsiblePosition: e.target.value })}
          placeholder="Ej. Jefe de Administración"
        />
      </Field>
      <Field label="Usuario Responsable">
        <Input
          value={draft.responsibleUser ?? ""}
          onChange={(e) => patch({ responsibleUser: e.target.value })}
          placeholder="correo@upes.edu.sv"
        />
      </Field>
    </div>
  );
}
