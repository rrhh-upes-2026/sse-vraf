"use client";

import { useState } from "react";
import { useCPEPlanesMejora, useDeleteCPEPlan } from "@/hooks/useCPE";
import { PlanMejoraForm } from "./PlanMejoraForm";
import type { CPEPlanMejora, CPEPlanStatus } from "@/types/cpe";

const STATUS_CHIP: Record<string, string> = {
  "Pendiente":  "bg-gray-100 text-gray-700",
  "En proceso": "bg-blue-100 text-blue-700",
  "Completado": "bg-emerald-100 text-emerald-700",
  "Cancelado":  "bg-red-100 text-red-700",
  "Pausado":    "bg-yellow-100 text-yellow-700",
};

const PRIORITY_COLOR: Record<string, string> = {
  "Crítica": "text-red-600",
  "Alta":    "text-orange-600",
  "Media":   "text-yellow-600",
  "Baja":    "text-blue-600",
};

interface Props {
  wsId: string;
}

export function PlanMejoraList({ wsId: _wsId }: Props) {
  const [filtroStatus, setFiltroStatus] = useState<CPEPlanStatus | "">("");
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CPEPlanMejora | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data, isLoading } = useCPEPlanesMejora(filtroStatus ? { status: filtroStatus } : {});
  const deletePlan = useDeleteCPEPlan();

  const items = data?.items ?? [];

  function handleDelete(id: string) {
    deletePlan.mutate(id, {
      onSuccess: () => setConfirmDelete(null),
    });
  }

  if (showForm || editingPlan) {
    return (
      <div className="rounded-lg border border-sse-border bg-white p-6">
        <h2 className="text-[14px] font-medium text-sse-ink mb-4">
          {editingPlan ? "Editar Plan de Mejora" : "Nuevo Plan de Mejora"}
        </h2>
        <PlanMejoraForm
          plan={editingPlan ?? undefined}
          onSuccess={() => { setShowForm(false); setEditingPlan(null); }}
          onCancel={() => { setShowForm(false); setEditingPlan(null); }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value as CPEPlanStatus | "")}
          className="rounded border border-sse-border px-2 py-1.5 text-[13px] text-sse-ink focus:outline-none"
        >
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En proceso">En proceso</option>
          <option value="Completado">Completado</option>
          <option value="Cancelado">Cancelado</option>
          <option value="Pausado">Pausado</option>
        </select>
        <button
          onClick={() => setShowForm(true)}
          className="ml-auto rounded-md bg-[#059669] px-3 py-1.5 text-[13px] font-medium text-white hover:bg-[#047857] transition-colors"
        >
          + Nuevo plan
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <p className="text-[13px] text-sse-muted text-center py-8">Cargando...</p>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-sse-border bg-white py-12 text-center">
          <p className="text-[13px] text-sse-muted">No hay planes de mejora registrados.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-3 text-[12px] text-[#059669] hover:underline"
          >
            Crear primer plan
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((plan) => (
            <div key={plan.id} className="rounded-lg border border-sse-border bg-white p-4">
              {confirmDelete === plan.id ? (
                <div className="flex items-center justify-between">
                  <p className="text-[13px] text-sse-ink">¿Eliminar este plan?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="text-[12px] text-sse-muted hover:underline"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      disabled={deletePlan.isPending}
                      className="text-[12px] text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[11px] font-semibold ${PRIORITY_COLOR[plan.priority] ?? "text-sse-muted"}`}>
                        {plan.priority}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_CHIP[plan.status] ?? ""}`}>
                        {plan.status}
                      </span>
                      {plan.status !== "Completado" && plan.targetDate && plan.targetDate < new Date().toISOString() && (
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-red-100 text-red-700">
                          Vencido
                        </span>
                      )}
                    </div>
                    <p className="text-[14px] font-medium text-sse-ink">{plan.title}</p>
                    {plan.description && (
                      <p className="text-[12px] text-sse-muted mt-0.5 line-clamp-2">{plan.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-[11px] text-sse-muted">
                      <span>Responsable: {plan.responsible}</span>
                      <span>Fecha: {plan.targetDate ? new Date(plan.targetDate).toLocaleDateString("es-SV") : "—"}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-sse-border">
                        <div
                          className="h-1.5 rounded-full bg-[#059669] transition-all"
                          style={{ width: `${plan.progress ?? 0}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-sse-muted tabular-nums">{plan.progress ?? 0}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setEditingPlan(plan)}
                      className="text-[12px] text-sse-muted hover:text-sse-ink"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setConfirmDelete(plan.id)}
                      className="text-[12px] text-red-500 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
