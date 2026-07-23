"use client";

import { useState } from "react";
import Link from "next/link";
import { useAEEEjecucion, useAEEEjecucionActions, useAEEHistorial } from "@/hooks/useAEE";
import { Skeleton } from "@/components/ui/skeleton";
import type { AEEStatus } from "@/types/aee";
import { AEE_VALID_TRANSITIONS } from "@/types/aee";

interface Props {
  wsId: string;
  id:   string;
}

const STATUS_COLORS: Record<AEEStatus, string> = {
  "Pendiente":                    "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "En ejecución":                 "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "Finalizada":                   "bg-sse-sem-green-bg text-sse-sem-green-fg",
  "Finalizada con observaciones": "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  "Reprogramada":                 "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  "Cancelada":                    "bg-sse-sem-red-bg text-sse-sem-red-fg",
  "No ejecutada":                 "bg-sse-muted/10 text-sse-muted",
};

function fmtDuration(mins?: string | number): string {
  const n = Number(mins);
  if (!n) return "—";
  return n < 60 ? `${n} min` : `${Math.floor(n / 60)}h ${n % 60}m`;
}

function Field({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === "") return null;
  const display = typeof value === "boolean" ? (value ? "Sí" : "No") : String(value);
  return (
    <div>
      <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide">{label}</p>
      <p className="text-[13px] text-sse-ink mt-0.5">{display}</p>
    </div>
  );
}

export function EjecucionDetail({ wsId, id }: Props) {
  const { data: ejecucion, isLoading }  = useAEEEjecucion(id);
  const { data: historial = [] }        = useAEEHistorial(id);
  const { cambiarEstado, archivar }     = useAEEEjecucionActions();
  const [changing, setChanging]         = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-md" />
      </div>
    );
  }

  if (!ejecucion) {
    return (
      <div className="text-center py-12 text-sse-muted">
        <p className="text-[14px]">Ejecución no encontrada.</p>
        <Link href={`/ws/${wsId}/aee-registro`} className="text-sse-primary text-[13px] mt-2 inline-block">
          Volver al registro
        </Link>
      </div>
    );
  }

  const transitions = AEE_VALID_TRANSITIONS[ejecucion.status] ?? [];
  const isArchived  = Boolean(ejecucion.deletedAt);

  const handleTransition = async (newStatus: AEEStatus) => {
    setChanging(true);
    try {
      await cambiarEstado.mutateAsync({ id, status: newStatus });
    } finally {
      setChanging(false);
    }
  };

  const handleArchivar = async () => {
    if (!confirm("¿Archivar esta ejecución? Esta acción no se puede deshacer.")) return;
    setChanging(true);
    try {
      await archivar.mutateAsync({ id });
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-1">
            <Link href={`/ws/${wsId}/aee-registro`} className="text-[12px] text-sse-muted hover:text-sse-ink">
              ← Registro
            </Link>
          </div>
          <h1 className="text-[18px] font-semibold text-sse-ink">
            Ejecución #{ejecucion.executionNumber}
          </h1>
          <p className="text-[12px] text-sse-muted mt-0.5">
            Plan: {ejecucion.planId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isArchived && (
            <span className="text-[11px] bg-sse-muted/10 text-sse-muted px-2 py-0.5 rounded-full">Archivada</span>
          )}
          <span className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-medium ${STATUS_COLORS[ejecucion.status]}`}>
            {ejecucion.status}
          </span>
        </div>
      </div>

      {/* Main fields */}
      <div className="bg-sse-surface border border-sse-border rounded-md p-4 grid grid-cols-2 gap-4">
        <Field label="Fecha de ejecución"  value={ejecucion.executionDate} />
        <Field label="Ejecutado por"       value={ejecucion.executedBy} />
        <Field label="Cargo"               value={ejecucion.responsiblePosition} />
        <Field label="Hora inicio"         value={ejecucion.startTime} />
        <Field label="Hora fin"            value={ejecucion.endTime} />
        <Field label="Duración"            value={fmtDuration(ejecucion.durationMinutes)} />
        <Field label="Resultado"           value={ejecucion.executionResult} />
        <Field label="Riesgo detectado"    value={ejecucion.riskDetected} />
        <Field label="Incidente reportado" value={ejecucion.incidentReported === "true" || ejecucion.incidentReported === true} />
        <Field label="Requiere evidencia"  value={ejecucion.requiresEvidence === "true" || ejecucion.requiresEvidence === true} />
        <Field label="Requiere aprobación" value={ejecucion.requiresApproval === "true" || ejecucion.requiresApproval === true} />
        {(ejecucion.completionNotes) && (
          <div className="col-span-2">
            <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide">Notas de finalización</p>
            <p className="text-[13px] text-sse-ink mt-0.5">{ejecucion.completionNotes}</p>
          </div>
        )}
        {(ejecucion.observations) && (
          <div className="col-span-2">
            <p className="text-[11px] font-medium text-sse-muted uppercase tracking-wide">Observaciones</p>
            <p className="text-[13px] text-sse-ink mt-0.5">{ejecucion.observations}</p>
          </div>
        )}
      </div>

      {/* State transitions */}
      {!isArchived && (transitions.length > 0 || true) && (
        <div className="bg-sse-surface border border-sse-border rounded-md p-4">
          <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-3">
            Acciones
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
            {!ejecucion.deletedAt && (
              <button
                onClick={handleArchivar}
                disabled={changing}
                className="rounded-md border border-sse-sem-red-fg/30 bg-sse-surface px-3 py-1.5 text-[12px] font-medium text-sse-sem-red-fg hover:bg-sse-sem-red-bg transition-colors disabled:opacity-50"
              >
                Archivar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Historial de cambios */}
      {Array.isArray(historial) && historial.length > 0 && (
        <div className="bg-sse-surface border border-sse-border rounded-md p-4">
          <p className="text-[12px] font-medium text-sse-muted uppercase tracking-wide mb-3">
            Historial de cambios
          </p>
          <div className="space-y-2">
            {historial.map((h) => (
              <div key={h.id} className="flex items-start gap-3 text-[12px] py-1 border-b border-sse-border/50 last:border-0">
                <span className="font-mono text-sse-muted shrink-0">{h.createdAt.slice(0, 10)}</span>
                <span className="font-medium text-sse-ink capitalize">{h.accion}</span>
                {h.estadoAnterior && h.estadoNuevo && (
                  <span className="text-sse-muted">{h.estadoAnterior} → {h.estadoNuevo}</span>
                )}
                <span className="text-sse-muted">{h.usuario}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit */}
      <div className="text-[11px] text-sse-muted space-y-0.5">
        {ejecucion.createdAt && <p>Creado: {ejecucion.createdAt.slice(0, 10)} {ejecucion.createdBy && `por ${ejecucion.createdBy}`}</p>}
        {ejecucion.updatedAt && <p>Actualizado: {ejecucion.updatedAt.slice(0, 10)} {ejecucion.updatedBy && `por ${ejecucion.updatedBy}`}</p>}
      </div>
    </div>
  );
}
