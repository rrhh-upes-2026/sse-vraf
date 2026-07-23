"use client";

import type { WizardDraft } from "./types";
import { Input } from "@/components/ui/input";

interface Props {
  draft: WizardDraft;
  onChange: (patch: Partial<WizardDraft>) => void;
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-medium text-sse-ink">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-sse-muted">{hint}</p>}
    </div>
  );
}

export function WizardStep4({ draft, onChange }: Props) {
  return (
    <div className="space-y-4">
      <Field label="Valor Meta" required hint={`En la unidad: ${draft.measurementUnit || "definida en paso anterior"}`}>
        <Input
          type="number"
          value={String(draft.targetValue ?? "")}
          onChange={(e) => onChange({ targetValue: e.target.value })}
          placeholder="Ej: 95"
          step="any"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Umbral de Advertencia" hint="Valor que activa alerta amarilla">
          <Input
            type="number"
            value={String(draft.warningThreshold ?? "")}
            onChange={(e) => onChange({ warningThreshold: e.target.value })}
            placeholder="Ej: 80"
            step="any"
          />
        </Field>
        <Field label="Umbral Crítico" hint="Valor que activa alerta roja">
          <Input
            type="number"
            value={String(draft.criticalThreshold ?? "")}
            onChange={(e) => onChange({ criticalThreshold: e.target.value })}
            placeholder="Ej: 60"
            step="any"
          />
        </Field>
      </div>

      <Field label="Orden de Visualización" hint="Posición relativa en listados y reportes (0 = sin prioridad)">
        <Input
          type="number"
          value={String(draft.displayOrder ?? "0")}
          onChange={(e) => onChange({ displayOrder: e.target.value })}
          placeholder="0"
          min={0}
        />
      </Field>

      {/* Visual hint about threshold interpretation */}
      {(draft.warningThreshold || draft.criticalThreshold) && (
        <div className="rounded-md border border-sse-border bg-sse-bg p-3 text-[12px] text-sse-muted space-y-1">
          <p className="font-medium text-sse-ink">Interpretación de semáforos</p>
          {draft.polarity === "positiva" ? (
            <>
              <p>• <span className="text-green-600 font-medium">Verde</span>: valor ≥ {draft.targetValue || "meta"}</p>
              <p>• <span className="text-amber-600 font-medium">Amarillo</span>: valor entre {draft.criticalThreshold || "—"} y {draft.warningThreshold || "—"}</p>
              <p>• <span className="text-red-600 font-medium">Rojo</span>: valor &lt; {draft.criticalThreshold || "—"}</p>
            </>
          ) : (
            <>
              <p>• <span className="text-green-600 font-medium">Verde</span>: valor ≤ {draft.targetValue || "meta"}</p>
              <p>• <span className="text-amber-600 font-medium">Amarillo</span>: valor entre {draft.warningThreshold || "—"} y {draft.criticalThreshold || "—"}</p>
              <p>• <span className="text-red-600 font-medium">Rojo</span>: valor &gt; {draft.criticalThreshold || "—"}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
