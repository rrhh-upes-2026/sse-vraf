"use client";

import { Select } from "@/components/ui/select";
import { usePMEProcesos } from "@/hooks/usePME";
import type { ProcedimientoWizardDraft } from "./types";

interface Props {
  draft: ProcedimientoWizardDraft;
  patch: (u: Partial<ProcedimientoWizardDraft>) => void;
}

export function ProcedimientoStep2({ draft, patch }: Props) {
  const { data: procesos } = usePMEProcesos({ active: true });

  return (
    <div className="space-y-4">
      <h2 className="text-[14px] font-semibold text-sse-ink">Proceso Padre</h2>
      <p className="text-[12px] text-sse-muted">
        Seleccione el proceso institucional al que pertenece este procedimiento.
      </p>
      <div className="flex flex-col gap-1">
        <label className="text-[12px] font-medium text-sse-ink">
          Proceso <span className="text-red-500">*</span>
        </label>
        <Select
          value={draft.procesoId ?? ""}
          onValueChange={(v) => patch({ procesoId: v })}
          options={[
            { value: "", label: "Seleccionar proceso…" },
            ...(procesos ?? []).map((p) => ({
              value: p.id,
              label: `${p.code} — ${p.name}`,
            })),
          ]}
        />
      </div>
    </div>
  );
}
