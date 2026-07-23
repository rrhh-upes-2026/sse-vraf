"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAEEEjecucionActions, useAEECatalogos } from "@/hooks/useAEE";
import { useAPEPlanes } from "@/hooks/useAPE";
import type { AEECreateParams, AEEStatus } from "@/types/aee";

interface Props {
  wsId:      string;
  planId?:   string;
}

const STEPS = [
  "Información",
  "Fecha y horario",
  "Resultado",
  "Observaciones",
  "Incidentes y riesgos",
  "Resumen",
];

const INITIAL: AEECreateParams = {
  planId:            "",
  executedBy:        "",
  executionDate:     "",
  startTime:         "",
  endTime:           "",
  durationMinutes:   "",
  responsiblePosition: "",
  status:            "Finalizada",
  executionResult:   "",
  completionNotes:   "",
  observations:      "",
  requiresEvidence:  false,
  riskDetected:      "sin-riesgo",
  incidentReported:  false,
  requiresApproval:  false,
};

function calcDuration(start: string, end: string): number {
  if (!start || !end) return 0;
  const [h1, m1] = start.split(":").map(Number);
  const [h2, m2] = end.split(":").map(Number);
  return Math.max(0, (h2 * 60 + m2) - (h1 * 60 + m1));
}

export function RegistroEjecucionWizard({ wsId, planId: initialPlanId }: Props) {
  const router = useRouter();
  const { create } = useAEEEjecucionActions();
  const { data: planesData = [] } = useAPEPlanes({ _pageSize: 500 });
  const { data: resultadosData }  = useAEECatalogos("resultadoEjecucion");
  const { data: riesgosData }     = useAEECatalogos("nivelRiesgo");

  const planes     = Array.isArray(planesData) ? planesData : [];
  const resultados = resultadosData?.items ?? [];
  const riesgos    = riesgosData?.items    ?? [];

  const [step, setStep]   = useState(0);
  const [form, setForm]   = useState<AEECreateParams>({
    ...INITIAL,
    planId: initialPlanId ?? "",
  });
  const [error, setError] = useState("");

  const set = <K extends keyof AEECreateParams>(k: K, v: AEECreateParams[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const selectedPlan = planes.find((p) => p.id === form.planId);

  // Duration auto-calc
  const autoDuration = calcDuration(form.startTime ?? "", form.endTime ?? "");

  function validateStep(): string {
    switch (step) {
      case 0:
        if (!form.planId)     return "Selecciona una actividad planificada.";
        if (!form.executedBy) return "El responsable de ejecución es requerido.";
        return "";
      case 1:
        if (!form.executionDate) return "La fecha de ejecución es requerida.";
        if (form.startTime && form.endTime && form.startTime > form.endTime)
          return "La hora de inicio no puede ser posterior a la hora de fin.";
        return "";
      case 2:
        if (!form.status)          return "Selecciona un estado de ejecución.";
        if (!form.executionResult) return "Selecciona el resultado de la ejecución.";
        return "";
      default:
        return "";
    }
  }

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const prev = () => { setError(""); setStep((s) => Math.max(s - 1, 0)); };

  const handleSubmit = async () => {
    const payload: AEECreateParams = {
      ...form,
      durationMinutes: form.durationMinutes || autoDuration || undefined,
    };
    try {
      await create.mutateAsync(payload);
      router.push(`/ws/${wsId}/aee-registro`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al registrar la ejecución.");
    }
  };

  const inputCls = "w-full rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:ring-1 focus:ring-sse-primary";
  const labelCls = "block text-[12px] font-medium text-sse-muted mb-1";

  return (
    <div className="space-y-6 max-w-xl">
      {/* Step indicator */}
      <div className="flex gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-1">
            <div className={`h-1.5 w-full rounded-full transition-colors ${
              i < step ? "bg-sse-primary" : i === step ? "bg-sse-primary/60" : "bg-sse-border"
            }`} />
            <span className={`text-[10px] ${i === step ? "text-sse-primary font-medium" : "text-sse-muted"}`}>
              {i + 1}
            </span>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-[16px] font-semibold text-sse-ink">
          Paso {step + 1}: {STEPS[step]}
        </h2>
      </div>

      {/* Step 0: Información */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Actividad planificada *</label>
            <select
              value={form.planId}
              onChange={(e) => set("planId", e.target.value)}
              className={inputCls}
            >
              <option value="">Seleccionar plan...</option>
              {planes
                .filter((p) => p.status !== "Archivada" && p.status !== "Cancelada")
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.plannedStartDate})
                  </option>
                ))}
            </select>
          </div>
          {selectedPlan && (
            <div className="bg-sse-muted/5 rounded-md border border-sse-border p-3 text-[12px] space-y-1">
              <p><span className="text-sse-muted">Periodicidad:</span> <span className="text-sse-ink">{selectedPlan.periodicity}</span></p>
              <p><span className="text-sse-muted">Fecha planif.:</span> <span className="text-sse-ink">{selectedPlan.plannedStartDate} → {selectedPlan.plannedEndDate}</span></p>
              {selectedPlan.responsibleUser && <p><span className="text-sse-muted">Responsable plan:</span> <span className="text-sse-ink">{selectedPlan.responsibleUser}</span></p>}
            </div>
          )}
          <div>
            <label className={labelCls}>Ejecutado por (ID o nombre) *</label>
            <input type="text" value={form.executedBy} onChange={(e) => set("executedBy", e.target.value)} className={inputCls} placeholder="ID o nombre del responsable" />
          </div>
          <div>
            <label className={labelCls}>Cargo / Posición</label>
            <input type="text" value={form.responsiblePosition ?? ""} onChange={(e) => set("responsiblePosition", e.target.value)} className={inputCls} placeholder="Cargo del responsable" />
          </div>
        </div>
      )}

      {/* Step 1: Fecha y horario */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Fecha de ejecución *</label>
            <input type="date" value={form.executionDate} onChange={(e) => set("executionDate", e.target.value)} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Hora inicio</label>
              <input type="time" value={form.startTime ?? ""} onChange={(e) => set("startTime", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Hora fin</label>
              <input type="time" value={form.endTime ?? ""} onChange={(e) => set("endTime", e.target.value)} className={inputCls} />
            </div>
          </div>
          {autoDuration > 0 && (
            <p className="text-[12px] text-sse-primary">
              Duración calculada: {autoDuration} minutos
            </p>
          )}
          <div>
            <label className={labelCls}>Duración real (minutos)</label>
            <input
              type="number"
              min={0}
              value={(form.durationMinutes ?? autoDuration) || ""}
              onChange={(e) => set("durationMinutes", e.target.value)}
              className={inputCls}
              placeholder="Auto-calculado de hora inicio/fin"
            />
          </div>
        </div>
      )}

      {/* Step 2: Resultado */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Estado de ejecución *</label>
            <select value={form.status ?? ""} onChange={(e) => set("status", e.target.value as AEEStatus)} className={inputCls}>
              <option value="">Seleccionar estado...</option>
              <option value="Finalizada">Finalizada</option>
              <option value="Finalizada con observaciones">Finalizada con observaciones</option>
              <option value="Reprogramada">Reprogramada</option>
              <option value="Cancelada">Cancelada</option>
              <option value="No ejecutada">No ejecutada</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Resultado de ejecución *</label>
            <select value={form.executionResult ?? ""} onChange={(e) => set("executionResult", e.target.value)} className={inputCls}>
              <option value="">Seleccionar resultado...</option>
              {resultados.map((r) => (
                <option key={r.id} value={r.valor}>{r.etiqueta}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Step 3: Observaciones */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Notas de finalización</label>
            <textarea rows={3} value={form.completionNotes ?? ""} onChange={(e) => set("completionNotes", e.target.value)} className={inputCls} placeholder="Describe cómo se completó la actividad..." />
          </div>
          <div>
            <label className={labelCls}>Observaciones adicionales</label>
            <textarea rows={3} value={form.observations ?? ""} onChange={(e) => set("observations", e.target.value)} className={inputCls} placeholder="Cualquier observación relevante..." />
          </div>
        </div>
      )}

      {/* Step 4: Incidentes y riesgos */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Nivel de riesgo detectado</label>
            <select value={form.riskDetected ?? "sin-riesgo"} onChange={(e) => set("riskDetected", e.target.value)} className={inputCls}>
              {riesgos.map((r) => (
                <option key={r.id} value={r.valor}>{r.etiqueta}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form.incidentReported)}
                onChange={(e) => set("incidentReported", e.target.checked)}
                className="w-4 h-4 rounded border-sse-border"
              />
              <span className="text-[13px] text-sse-ink">Se reportó un incidente durante la ejecución</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form.requiresEvidence)}
                onChange={(e) => set("requiresEvidence", e.target.checked)}
                className="w-4 h-4 rounded border-sse-border"
              />
              <span className="text-[13px] text-sse-ink">Esta ejecución requiere evidencia documental</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form.requiresApproval)}
                onChange={(e) => set("requiresApproval", e.target.checked)}
                className="w-4 h-4 rounded border-sse-border"
              />
              <span className="text-[13px] text-sse-ink">Requiere aprobación (arquitectura preparada para Sprint 005)</span>
            </label>
          </div>
        </div>
      )}

      {/* Step 5: Resumen */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="bg-sse-surface border border-sse-border rounded-md p-4 space-y-2 text-[13px]">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div><span className="text-sse-muted">Plan:</span> <span className="text-sse-ink font-medium">{selectedPlan?.title ?? form.planId}</span></div>
              <div><span className="text-sse-muted">Ejecutado por:</span> <span className="text-sse-ink">{form.executedBy}</span></div>
              <div><span className="text-sse-muted">Fecha:</span> <span className="text-sse-ink font-mono">{form.executionDate}</span></div>
              <div><span className="text-sse-muted">Horario:</span> <span className="text-sse-ink font-mono">{form.startTime || "—"} – {form.endTime || "—"}</span></div>
              <div><span className="text-sse-muted">Duración:</span> <span className="text-sse-ink font-mono">{form.durationMinutes || autoDuration || "—"} min</span></div>
              <div><span className="text-sse-muted">Estado:</span> <span className="text-sse-ink">{form.status}</span></div>
              <div><span className="text-sse-muted">Resultado:</span> <span className="text-sse-ink">{form.executionResult || "—"}</span></div>
              <div><span className="text-sse-muted">Riesgo:</span> <span className="text-sse-ink">{form.riskDetected}</span></div>
              <div><span className="text-sse-muted">Incidente:</span> <span className="text-sse-ink">{form.incidentReported ? "Sí" : "No"}</span></div>
              <div><span className="text-sse-muted">Evidencia req.:</span> <span className="text-sse-ink">{form.requiresEvidence ? "Sí" : "No"}</span></div>
            </div>
            {form.completionNotes && (
              <div className="pt-2 border-t border-sse-border">
                <p className="text-sse-muted text-[11px] mb-0.5">Notas</p>
                <p className="text-sse-ink">{form.completionNotes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-sse-sem-red-bg border border-sse-sem-red-fg/30 px-4 py-2 text-[13px] text-sse-sem-red-fg">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between gap-3 pt-2">
        <button
          onClick={prev}
          disabled={step === 0}
          className="rounded-md border border-sse-border bg-sse-surface px-4 py-2 text-[13px] font-medium text-sse-ink hover:border-sse-primary/50 transition-colors disabled:opacity-40"
        >
          Anterior
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            className="rounded-md bg-sse-primary px-4 py-2 text-[13px] font-medium text-white hover:bg-sse-primary/90 transition-colors"
          >
            Siguiente
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={create.isPending}
            className="rounded-md bg-sse-primary px-4 py-2 text-[13px] font-medium text-white hover:bg-sse-primary/90 transition-colors disabled:opacity-50"
          >
            {create.isPending ? "Guardando..." : "Registrar ejecución"}
          </button>
        )}
      </div>
    </div>
  );
}
