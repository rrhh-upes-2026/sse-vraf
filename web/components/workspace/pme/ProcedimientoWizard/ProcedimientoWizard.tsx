"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePMEProcedimientoActions } from "@/hooks/usePME";
import { Button } from "@/components/ui/button";
import { ProcedimientoStep1 } from "./ProcedimientoStep1";
import { ProcedimientoStep2 } from "./ProcedimientoStep2";
import { ProcedimientoStep3 } from "./ProcedimientoStep3";
import { ProcedimientoStep4 } from "./ProcedimientoStep4";
import { ProcedimientoStep5 } from "./ProcedimientoStep5";
import {
  PROCEDIMIENTO_STEPS,
  PROCEDIMIENTO_WIZARD_DEFAULTS,
  type ProcedimientoWizardDraft,
} from "./types";

interface Props {
  wsId: string;
  defaultProcesoId?: string;
}

function StepIndicator({
  current,
  steps,
}: {
  current: number;
  steps: typeof PROCEDIMIENTO_STEPS;
}) {
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

export function ProcedimientoWizard({ wsId, defaultProcesoId }: Props) {
  const router     = useRouter();
  const { create } = usePMEProcedimientoActions();
  const [step, setStep]   = useState(1);
  const [draft, setDraft] = useState<ProcedimientoWizardDraft>({
    ...PROCEDIMIENTO_WIZARD_DEFAULTS,
    procesoId: defaultProcesoId ?? "",
  });
  const [error, setError] = useState<string | null>(null);

  function patch(updates: Partial<ProcedimientoWizardDraft>) {
    setDraft((prev) => ({ ...prev, ...updates }));
    setError(null);
  }

  function validateStep(s: number): string | null {
    if (s === 1 && !draft.code?.trim()) return "El código es requerido.";
    if (s === 1 && !draft.name?.trim()) return "El nombre es requerido.";
    if (s === 2 && !draft.procesoId?.trim()) return "Debe seleccionar un proceso padre.";
    return null;
  }

  function next() {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setStep((s) => Math.min(s + 1, PROCEDIMIENTO_STEPS.length));
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
      onSuccess: (entity) =>
        router.push(`/ws/${wsId}/procedimientos`),
      onError: (e) =>
        setError(e instanceof Error ? e.message : String(e)),
    });
  }

  const stepProps = { draft, patch };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-[18px] font-semibold text-sse-ink">Nuevo Procedimiento</h1>
        <p className="text-[13px] text-sse-muted mt-0.5">
          Complete los pasos para registrar un procedimiento institucional.
        </p>
      </div>

      <StepIndicator current={step} steps={PROCEDIMIENTO_STEPS} />

      <div className="bg-sse-surface border border-sse-border rounded-md p-5 space-y-4 min-h-[280px]">
        {step === 1 && <ProcedimientoStep1 {...stepProps} />}
        {step === 2 && <ProcedimientoStep2 {...stepProps} />}
        {step === 3 && <ProcedimientoStep3 {...stepProps} />}
        {step === 4 && <ProcedimientoStep4 {...stepProps} />}
        {step === 5 && <ProcedimientoStep5 draft={draft} />}
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
        {step < PROCEDIMIENTO_STEPS.length ? (
          <Button size="sm" onClick={next}>Siguiente</Button>
        ) : (
          <Button size="sm" onClick={submit} disabled={create.isPending}>
            {create.isPending ? "Guardando…" : "Crear Procedimiento"}
          </Button>
        )}
      </div>
    </div>
  );
}
