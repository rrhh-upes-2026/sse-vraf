"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { usePMECatalogosPorTipo } from "@/hooks/usePME";
import type { ActividadWizardDraft } from "./types";

interface Props {
  draft: ActividadWizardDraft;
  patch: (u: Partial<ActividadWizardDraft>) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-medium text-sse-ink">{label}</label>
      {children}
    </div>
  );
}

export function ActividadStep4({ draft, patch }: Props) {
  const { data: unidades } = usePMECatalogosPorTipo("unidadDuracion");

  return (
    <div className="space-y-4">
      <h2 className="text-[14px] font-semibold text-sse-ink">Duración</h2>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Duración">
          <Input
            type="number"
            value={String(draft.duracion ?? "")}
            onChange={(e) => patch({ duracion: e.target.value })}
            min={0}
            placeholder="0"
          />
        </Field>
        <Field label="Unidad de Duración">
          <Select
            value={draft.unidadDuracionId ?? ""}
            onValueChange={(v) => patch({ unidadDuracionId: v })}
            options={[
              { value: "", label: "Sin unidad" },
              ...(unidades ?? []).map((u) => ({ value: u.id, label: u.nombre })),
            ]}
          />
        </Field>
      </div>
    </div>
  );
}
