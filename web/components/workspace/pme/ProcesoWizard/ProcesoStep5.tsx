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

export function ProcesoStep5({ draft, patch }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-[14px] font-semibold text-sse-ink">Configuración</h2>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Orden de Visualización">
          <Input
            type="number"
            value={String(draft.displayOrder ?? "")}
            onChange={(e) => patch({ displayOrder: Number(e.target.value) })}
            min={0}
          />
        </Field>
      </div>
      <Field label="Observaciones">
        <textarea
          value={draft.observations ?? ""}
          onChange={(e) => patch({ observations: e.target.value })}
          rows={3}
          placeholder="Notas adicionales…"
          className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink outline-none placeholder:text-sse-muted focus:border-sse-primary focus:ring-1 focus:ring-sse-primary/30 resize-none"
        />
      </Field>
    </div>
  );
}
