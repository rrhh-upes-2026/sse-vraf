"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useIMEIndicadorActions } from "@/hooks/useIME";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STEPS, WIZARD_DEFAULTS, type WizardDraft, type StepId } from "./types";
import { WizardStep1 } from "./WizardStep1";
import { WizardStep2 } from "./WizardStep2";
import { WizardStep3 } from "./WizardStep3";
import { WizardStep4 } from "./WizardStep4";
import { WizardStep5 } from "./WizardStep5";
import { WizardStep6 } from "./WizardStep6";

interface Props {
  wsId: string;
}

function StepIndicator({ steps, current }: { steps: typeof STEPS; current: StepId }) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
      {steps.map((step, idx) => {
        const isDone    = step.id < current;
        const isActive  = step.id === current;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                  isDone   ? "bg-sse-primary text-white" :
                  isActive ? "bg-sse-primary/20 text-sse-primary border border-sse-primary" :
                             "bg-sse-pill-gray-bg text-sse-muted",
                )}
              >
                {isDone ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3 w-3">
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                ) : step.id}
              </div>
              <span
                className={cn(
                  "text-[12px] whitespace-nowrap hidden sm:block",
                  isActive ? "font-semibold text-sse-ink" : "text-sse-muted",
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn("h-px w-6 mx-2 shrink-0", isDone ? "bg-sse-primary" : "bg-sse-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function validateStep(step: StepId, draft: WizardDraft): string | null {
  if (step === 1) {
    if (!draft.code.trim()) return "El código es requerido";
    if (!draft.name.trim()) return "El nombre es requerido";
  }
  if (step === 3) {
    if (!draft.measurementUnit) return "La unidad de medida es requerida";
    if (!draft.frequency)       return "La frecuencia es requerida";
  }
  if (step === 4) {
    if (draft.targetValue == null || draft.targetValue === "") return "El valor meta es requerido";
  }
  return null;
}

export function IndicatorWizard({ wsId }: Props) {
  const router = useRouter();
  const [step,  setStep]  = useState<StepId>(1);
  const [draft, setDraft] = useState<WizardDraft>(WIZARD_DEFAULTS);
  const [error, setError] = useState<string | null>(null);

  const { create } = useIMEIndicadorActions();

  function patch(updates: Partial<WizardDraft>) {
    setDraft((prev) => ({ ...prev, ...updates }));
    setError(null);
  }

  function next() {
    const err = validateStep(step, draft);
    if (err) { setError(err); return; }
    if (step < 6) setStep((s) => (s + 1) as StepId);
  }

  function prev() {
    if (step > 1) setStep((s) => (s - 1) as StepId);
  }

  function submit() {
    const missingRequired = [
      !draft.code && "Código",
      !draft.name && "Nombre",
      !draft.measurementUnit && "Unidad de medida",
      !draft.frequency && "Frecuencia",
      !draft.processId && "Proceso",
      (draft.targetValue == null || draft.targetValue === "") && "Valor meta",
    ].filter(Boolean) as string[];

    if (missingRequired.length > 0) {
      setError("Campos requeridos incompletos: " + missingRequired.join(", "));
      return;
    }

    create.mutate(draft as Parameters<typeof create.mutate>[0], {
      onSuccess: (created) => {
        router.push(`/ws/${wsId}/gestion-indicadores/${created.id}`);
      },
      onError: (err) => {
        setError(String(err instanceof Error ? err.message : err));
      },
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-[18px] font-semibold text-sse-ink">Nuevo Indicador</h1>
        <p className="text-[13px] text-sse-muted mt-0.5">Complete los pasos para definir el indicador institucional</p>
      </div>

      <StepIndicator steps={STEPS} current={step} />

      <div className="bg-sse-surface border border-sse-border rounded-md p-5">
        <h2 className="text-[14px] font-semibold text-sse-ink mb-4">
          {STEPS.find((s) => s.id === step)?.label}
        </h2>

        {step === 1 && <WizardStep1 draft={draft} onChange={patch} />}
        {step === 2 && <WizardStep2 draft={draft} onChange={patch} />}
        {step === 3 && <WizardStep3 draft={draft} onChange={patch} />}
        {step === 4 && <WizardStep4 draft={draft} onChange={patch} />}
        {step === 5 && <WizardStep5 draft={draft} onChange={patch} />}
        {step === 6 && <WizardStep6 draft={draft} />}
      </div>

      {error && (
        <div className="rounded-md border border-sse-sem-red-border bg-sse-sem-red-bg px-3 py-2 text-[12px] text-sse-sem-red-fg">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={step === 1 ? () => router.back() : prev}
        >
          {step === 1 ? "Cancelar" : "Anterior"}
        </Button>

        <div className="flex gap-2">
          {step < 6 ? (
            <Button size="sm" onClick={next}>
              Siguiente
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={submit}
              disabled={create.isPending}
            >
              {create.isPending ? "Guardando…" : "Crear Indicador"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
