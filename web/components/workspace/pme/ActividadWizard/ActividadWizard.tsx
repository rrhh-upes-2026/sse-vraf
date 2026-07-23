"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePMEActividadActions } from "@/hooks/usePME";
import { Button } from "@/components/ui/button";
import { ActividadStep1 } from "./ActividadStep1";
import { ActividadStep2 } from "./ActividadStep2";
import { ActividadStep3 } from "./ActividadStep3";
import { ActividadStep4 } from "./ActividadStep4";
import { ActividadStep5 } from "./ActividadStep5";
import { ActividadStep6 } from "./ActividadStep6";
import { ACTIVIDAD_STEPS, ACTIVIDAD_WIZARD_DEFAULTS, type ActividadWizardDraft } from "./types";

interface Props {
  wsId: string;
  defaultProcesoId?: string;
  defaultProcedimientoId?: string;
}

function StepIndicator({ current, steps }: { current: number; steps: typeof ACTIVIDAD_STEPS }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors ${
              s.id < current
                ? "bg-sse-primary text-white"
                : s.id === current
                  ? "bg-sse-primary text-white ring-2 ring-sse-primary/30"
                  : "bg-sse-border text-sse-muted"
            }`}
          >
            {s.id < current ? "✓" : s.id}
          </div>
          <span
            className={`hidden sm:inline text-[12px] font-medium ${
              s.id === current ? "text-sse-ink" : "text-sse-muted"
            }`}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && <div className="w-6 h-px bg-sse-border" />}
        </div>
      ))}
    </div>
  );
}

export function ActividadWizard({ wsId, defaultProcesoId, defaultProcedimientoId }: Props) {
  const router     = useRouter();
  const { create } = usePMEActividadActions();
  const [step, setStep]   = useState(1);
  const [draft, setDraft] = useState<ActividadWizardDraft>({
    ...ACTIVIDAD_WIZARD_DEFAULTS,
    procesoId:       defaultProcesoId ?? "",
    procedimientoId: defaultProcedimientoId ?? "",
  });
  const [error, setError] = useState<string | null>(null);

  function patch(updates: Partial<ActividadWizardDraft>) {
    setDraft((prev) => ({ ...prev, ...updates }));
    setError(null);
  }

  function validateStep(s: number): string | null {
    if (s === 1 && !draft.code?.trim()) return "El código es requerido.";
    if (s === 1 && !draft.name?.trim()) return "El nombre es requerido.";
    if (s === 2 && !draft.procesoId?.trim()) return "Debe seleccionar un proceso.";
    if (s === 2 && !draft.procedimientoId?.trim()) return "Debe seleccionar un procedimiento.";
    return null;
  }

  function next() {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setStep((s) => Math.min(s + 1, ACTIVIDAD_STEPS.length));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
  }

  function submit() {
    for (let s = 1; s <= 2; s++) {
      const err = validateStep(s);
      if (err) { setError(err); setStep(s); return; }
    }
    create.mutate(draft, {
      onSuccess: () => router.push(`/ws/${wsId}/actividades-pme`),
      onError:   (e) => setError(e instanceof Error ? e.message : String(e)),
    });
  }

  const stepProps = { draft, patch };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-[18px] font-semibold text-sse-ink">Nueva Actividad</h1>
        <p className="text-[13px] text-sse-muted mt-0.5">
          Complete los pasos para registrar una actividad operativa.
        </p>
      </div>

      <StepIndicator current={step} steps={ACTIVIDAD_STEPS} />

      <div className="bg-sse-surface border border-sse-border rounded-md p-5 space-y-4 min-h-[280px]">
        {step === 1 && <ActividadStep1 {...stepProps} />}
        {step === 2 && <ActividadStep2 {...stepProps} />}
        {step === 3 && <ActividadStep3 {...stepProps} />}
        {step === 4 && <ActividadStep4 {...stepProps} />}
        {step === 5 && <ActividadStep5 {...stepProps} />}
        {step === 6 && <ActividadStep6 draft={draft} />}
      </div>

      {error && (
        <div className="rounded-md border border-sse-sem-red-border bg-sse-sem-red-bg px-3 py-2 text-[12px] text-sse-sem-red-fg">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={step === 1 ? () => router.back() : back}>
          {step === 1 ? "Cancelar" : "Atrás"}
        </Button>
        {step < ACTIVIDAD_STEPS.length ? (
          <Button size="sm" onClick={next}>Siguiente</Button>
        ) : (
          <Button size="sm" onClick={submit} disabled={create.isPending}>
            {create.isPending ? "Guardando…" : "Crear Actividad"}
          </Button>
        )}
      </div>
    </div>
  );
}
