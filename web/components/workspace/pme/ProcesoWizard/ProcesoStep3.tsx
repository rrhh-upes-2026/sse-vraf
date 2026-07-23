"use client";

import type { ProcesoWizardDraft } from "./types";

interface Props {
  draft: ProcesoWizardDraft;
  patch: (u: Partial<ProcesoWizardDraft>) => void;
}

export function ProcesoStep3({ draft, patch }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-[14px] font-semibold text-sse-ink">Objetivo</h2>
      <div className="flex flex-col gap-1">
        <label className="text-[12px] font-medium text-sse-ink">Objetivo del Proceso</label>
        <textarea
          value={draft.objetivo ?? ""}
          onChange={(e) => patch({ objetivo: e.target.value })}
          rows={5}
          placeholder="Describa el propósito y alcance del proceso…"
          className="w-full rounded-md border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink outline-none placeholder:text-sse-muted focus:border-sse-primary focus:ring-1 focus:ring-sse-primary/30 resize-none"
        />
      </div>
    </div>
  );
}
