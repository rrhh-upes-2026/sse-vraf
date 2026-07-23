"use client";

import { useState } from "react";
import Link from "next/link";
import { useAPEPlan, useAPEPlanActions, useAPEHistorial } from "@/hooks/useAPE";
import { Skeleton } from "@/components/ui/skeleton";
import type { APEStatus } from "@/types/ape";

interface Props {
  wsId: string;
  id:   string;
}

const STATUS_COLORS: Record<APEStatus, string> = {
  Programada: "bg-sse-sem-green-bg text-sse-sem-green-fg",
  Próxima:    "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Pendiente:  "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Archivada:  "bg-sse-muted/10 text-sse-muted",
  Cancelada:  "bg-sse-sem-red-bg text-sse-sem-red-fg",
};

const ALLOWED_TRANSITIONS: Record<APEStatus, APEStatus[]> = {
  Programada: ["Próxima", "Archivada", "Cancelada"],
  Próxima:    ["Pendiente", "Archivada", "Cancelada"],
  Pendiente:  ["Archivada", "Cancelada"],
  Archivada:  ["Programada"],
  Cancelada:  [],
};

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide">{label}</p>
      <p className="text-[13px] text-sse-ink mt-0.5">{value}</p>
    </div>
  );
}

export function PlanDetail({ wsId, id }: Props) {
  const { data: plan, isLoading } = useAPEPlan(id);
  const { data: historial = [] }  = useAPEHistorial(id);
  const { cambiarEstado }         = useAPEPlanActions();
  const [changing, setChanging]   = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 rounded-md" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-12 text-sse-muted">
        <p className="text-[14px]">Plan no encontrado.</p>
        <Link href={`/ws/${wsId}/ape-planes`} className="text-sse-primary text-[13px] mt-2 inline-block">
          Volver a planes
        </Link>
      </div>
    );
  }

  const transitions = ALLOWED_TRANSITIONS[plan.status] ?? [];

  const handleTransition = async (newStatus: APEStatus) => {
    setChanging(true);
    try {
      await cambiarEstado.mutateAsync({ id, status: newStatus });
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/ws/${wsId}/ape-planes`} className="text-[12px] text-sse-muted hover:text-sse-ink">
              ← Planes
            </Link>
          </div>
          <h1 className="text-[18px] font-semibold text-sse-ink">{plan.title}</h1>
          <p className="text-[12px] text-sse-muted mt-0.5">
            {plan.periodicity} · #{plan.plannedExecutionNumber ?? "—"} · {plan.year}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-medium ${STATUS_COLORS[plan.status]}`}>
          {plan.status}
        </span>
      </div>

      {/* Fields grid */}
      <div className="bg-sse-surface border border-sse-border rounded-md p-4 grid grid-cols-2 gap-4">
        <Field label="Fecha inicio"   value={plan.plannedStartDate} />
        <Field label="Fecha fin"      value={plan.plannedEndDate} />
        <Field label="Mes"            value={plan.plannedMonth} />
        <Field label="Trimestre"      value={plan.plannedQuarter ? `Q${plan.plannedQuarter}` : null} />
        <Field label="Semestre"       value={plan.plannedSemester ? `S${plan.plannedSemester}` : null} />
        <Field label="Semana ISO"     value={plan.plannedWeek} />
        <Field label="Prioridad"      value={plan.priority} />
        <Field label="Horas planif."  value={plan.plannedHours} />
        <Field label="Responsable"    value={plan.responsibleUser} />
        <Field label="Cargo"          value={plan.responsiblePosition} />
        {plan.description && (
          <div className="col-span-2">
            <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide">Descripción</p>
            <p className="text-[13px] text-sse-ink mt-0.5">{plan.description}</p>
          </div>
        )}
        {plan.notes && (
          <div className="col-span-2">
            <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide">Notas</p>
            <p className="text-[13px] text-sse-ink mt-0.5">{plan.notes}</p>
          </div>
        )}
      </div>

      {/* State transitions */}
      {transitions.length > 0 && (
        <div className="bg-sse-surface border border-sse-border rounded-md p-4">
          <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-3">
            Cambiar estado
          </p>
          <div className="flex flex-wrap gap-2">
            {transitions.map((s) => (
              <button
                key={s}
                onClick={() => handleTransition(s)}
                disabled={changing}
                className="rounded-md border border-sse-border bg-sse-surface px-3 py-1.5 text-[12px] font-medium text-sse-ink hover:border-sse-primary/50 transition-colors disabled:opacity-50"
              >
                → {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Historial */}
      {historial.length > 0 && (
        <div className="bg-sse-surface border border-sse-border rounded-md p-4">
          <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-3">
            Historial
          </p>
          <div className="space-y-2">
            {historial.map((h) => (
              <div key={h.id} className="flex items-start gap-3 text-[12px] py-1 border-b border-sse-border/50 last:border-0">
                <span className="font-mono text-sse-muted shrink-0">{h.createdAt.slice(0, 10)}</span>
                <span className="font-medium text-sse-ink capitalize">{h.accion}</span>
                <span className="text-sse-muted">{h.detalle}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit */}
      <div className="text-[11px] text-sse-muted space-y-0.5">
        {plan.createdAt && <p>Creado: {plan.createdAt.slice(0, 10)} {plan.createdBy && `por ${plan.createdBy}`}</p>}
        {plan.updatedAt && <p>Actualizado: {plan.updatedAt.slice(0, 10)} {plan.updatedBy && `por ${plan.updatedBy}`}</p>}
      </div>
    </div>
  );
}
