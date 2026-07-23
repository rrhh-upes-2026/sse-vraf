"use client";

import { Select } from "@/components/ui/select";
import { usePMECatalogosPorTipo } from "@/hooks/usePME";
import type { ProcesoWizardDraft } from "./types";

interface Props {
  draft: ProcesoWizardDraft;
  patch: (u: Partial<ProcesoWizardDraft>) => void;
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

export function ProcesoStep2({ draft, patch }: Props) {
  const { data: tipos }      = usePMECatalogosPorTipo("tipoProceso");
  const { data: periodicidades } = usePMECatalogosPorTipo("periodicidad");

  return (
    <div className="space-y-4">
      <h2 className="text-[14px] font-semibold text-sse-ink">Clasificación</h2>
      <Field label="Tipo de Proceso">
        <Select
          value={draft.tipoProcesoId ?? ""}
          onValueChange={(v) => patch({ tipoProcesoId: v })}
          options={[
            { value: "", label: "Sin tipo" },
            ...(tipos ?? []).map((t) => ({ value: t.id, label: t.nombre })),
          ]}
        />
      </Field>
      <Field label="Periodicidad">
        <Select
          value={draft.periodicidad ?? ""}
          onValueChange={(v) => patch({ periodicidad: v })}
          options={[
            { value: "", label: "Sin periodicidad" },
            ...(periodicidades ?? []).map((p) => ({ value: p.nombre, label: p.nombre })),
          ]}
        />
      </Field>
    </div>
  );
}
