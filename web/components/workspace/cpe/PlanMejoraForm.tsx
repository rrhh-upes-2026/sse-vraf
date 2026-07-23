"use client";

import { useState } from "react";
import { useCreateCPEPlan, useUpdateCPEPlan } from "@/hooks/useCPE";
import type { CPEPlanMejora, CPEPlanPriority, CPEPlanStatus } from "@/types/cpe";

const PRIORIDADES: CPEPlanPriority[] = ["Crítica", "Alta", "Media", "Baja"];
const ESTADOS: CPEPlanStatus[] = ["Pendiente", "En proceso", "Completado", "Cancelado", "Pausado"];

interface Props {
  plan?: CPEPlanMejora;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormState {
  title: string;
  description: string;
  priority: CPEPlanPriority;
  responsible: string;
  targetDate: string;
  status: CPEPlanStatus;
  progress: number;
  notes: string;
}

export function PlanMejoraForm({ plan, onSuccess, onCancel }: Props) {
  const [form, setForm] = useState<FormState>({
    title:       plan?.title ?? "",
    description: plan?.description ?? "",
    priority:    plan?.priority ?? "Media",
    responsible: plan?.responsible ?? "",
    targetDate:  plan?.targetDate ? plan.targetDate.slice(0, 10) : "",
    status:      plan?.status ?? "Pendiente",
    progress:    plan?.progress ?? 0,
    notes:       plan?.notes ?? "",
  });

  const [error, setError] = useState("");

  const create = useCreateCPEPlan();
  const update = useUpdateCPEPlan();
  const isSaving = create.isPending || update.isPending;

  function set(field: keyof FormState, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) { setError("El título es obligatorio."); return; }
    if (!form.responsible.trim()) { setError("El responsable es obligatorio."); return; }
    if (!form.targetDate) { setError("La fecha objetivo es obligatoria."); return; }
    try {
      if (plan) {
        await update.mutateAsync({ id: plan.id, patch: form });
      } else {
        await create.mutateAsync(form);
      }
      onSuccess?.();
    } catch {
      setError("Error al guardar. Intente nuevamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-[12px] text-sse-muted mb-1">Título *</label>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className="w-full rounded border border-sse-border px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:border-[#059669]"
            placeholder="Ej. Regularizar evidencias de actividades vencidas"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[12px] text-sse-muted mb-1">Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            className="w-full rounded border border-sse-border px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:border-[#059669] resize-none"
          />
        </div>

        <div>
          <label className="block text-[12px] text-sse-muted mb-1">Prioridad</label>
          <select
            value={form.priority}
            onChange={(e) => set("priority", e.target.value as CPEPlanPriority)}
            className="w-full rounded border border-sse-border px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none"
          >
            {PRIORIDADES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[12px] text-sse-muted mb-1">Responsable *</label>
          <input
            value={form.responsible}
            onChange={(e) => set("responsible", e.target.value)}
            className="w-full rounded border border-sse-border px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:border-[#059669]"
            placeholder="Nombre o email"
          />
        </div>

        <div>
          <label className="block text-[12px] text-sse-muted mb-1">Fecha objetivo *</label>
          <input
            type="date"
            value={form.targetDate}
            onChange={(e) => set("targetDate", e.target.value)}
            className="w-full rounded border border-sse-border px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none"
          />
        </div>

        {plan && (
          <>
            <div>
              <label className="block text-[12px] text-sse-muted mb-1">Estado</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as CPEPlanStatus)}
                className="w-full rounded border border-sse-border px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none"
              >
                {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[12px] text-sse-muted mb-1">
                Progreso: {form.progress}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={form.progress}
                onChange={(e) => set("progress", Number(e.target.value))}
                className="w-full accent-[#059669]"
              />
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <label className="block text-[12px] text-sse-muted mb-1">Notas</label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={2}
            className="w-full rounded border border-sse-border px-3 py-1.5 text-[13px] text-sse-ink focus:outline-none focus:border-[#059669] resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-sse-border px-3 py-1.5 text-[13px] text-sse-muted hover:bg-sse-surface transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-[#059669] px-3 py-1.5 text-[13px] font-medium text-white hover:bg-[#047857] transition-colors disabled:opacity-50"
        >
          {isSaving ? "Guardando..." : plan ? "Actualizar plan" : "Crear plan"}
        </button>
      </div>
    </form>
  );
}
