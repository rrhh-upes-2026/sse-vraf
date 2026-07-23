"use client";

import { Select } from "@/components/ui/select";
import { usePMEProcesos, usePMEProcedimientos } from "@/hooks/usePME";
import type { ActividadWizardDraft } from "./types";

interface Props {
  draft: ActividadWizardDraft;
  patch: (u: Partial<ActividadWizardDraft>) => void;
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

export function ActividadStep2({ draft, patch }: Props) {
  const { data: procesos } = usePMEProcesos({ active: true });
  const { data: procedimientos } = usePMEProcedimientos(
    draft.procesoId ? { procesoId: draft.procesoId, active: true } : undefined,
  );

  return (
    <div className="space-y-4">
      <h2 className="text-[14px] font-semibold text-sse-ink">Jerarquía</h2>
      <Field label="Proceso" required>
        <Select
          value={draft.procesoId ?? ""}
          onValueChange={(v) => patch({ procesoId: v, procedimientoId: "" })}
          options={[
            { value: "", label: "Seleccionar proceso…" },
            ...(procesos ?? []).map((p) => ({ value: p.id, label: `${p.code} — ${p.name}` })),
          ]}
        />
      </Field>
      <Field label="Procedimiento" required>
        <Select
          value={draft.procedimientoId ?? ""}
          onValueChange={(v) => patch({ procedimientoId: v })}
          options={[
            { value: "", label: draft.procesoId ? "Seleccionar procedimiento…" : "Primero seleccione un proceso" },
            ...(procedimientos ?? []).map((p) => ({ value: p.id, label: `${p.code} — ${p.name}` })),
          ]}
        />
      </Field>
    </div>
  );
}
