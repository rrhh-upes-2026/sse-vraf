"use client";

import { Input } from "@/components/ui/input";
import type { ProcedimientoWizardDraft } from "./types";

interface Props {
  draft: ProcedimientoWizardDraft;
  patch: (u: Partial<ProcedimientoWizardDraft>) => void;
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

export function ProcedimientoStep1({ draft, patch }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-[14px] font-semibold text-sse-ink">Identificación</h2>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Código" required>
          <Input
            value={draft.code ?? ""}
            onChange={(e) => patch({ code: e.target.value.toUpperCase() })}
            placeholder="PROC-001"
          />
        </Field>
        <Field label="Versión">
          <Input
            value={draft.version ?? ""}
            onChange={(e) => patch({ version: e.target.value })}
            placeholder="1.0"
          />
        </Field>
      </div>
      <Field label="Nombre" required>
        <Input
          value={draft.name ?? ""}
          onChange={(e) => patch({ name: e.target.value })}
          maxLength={120}
          placeholder="Nombre del procedimiento"
        />
      </Field>
      <Field label="Descripción">
        <textarea
          value={draft.description ?? ""}
          onChange={(e) => patch({ description: e.target.value })}
          rows={3}
          placeholder="Descripción del procedimiento…"
          className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink outline-none placeholder:text-sse-muted focus:border-sse-primary focus:ring-1 focus:ring-sse-primary/30 resize-none"
        />
      </Field>
    </div>
  );
}
