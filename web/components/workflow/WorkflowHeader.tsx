"use client";

import type { ProcessInstance, ProcessBlueprint, StageInstance } from "@/types/workflow";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { fmtDate } from "@/lib/utils";
import { WORKFLOW_STATE_LABEL, WORKFLOW_STATE_VARIANT } from "@/lib/workflowStateConfig";

// ── component ─────────────────────────────────────────────────────────────────

interface WorkflowHeaderProps {
  instance:     ProcessInstance;
  blueprint:    ProcessBlueprint;
  currentStage: StageInstance | undefined;
}

export function WorkflowHeader({
  instance,
  blueprint,
  currentStage,
}: WorkflowHeaderProps) {
  const cfg            = WORKFLOW_STATE_VARIANT[instance.estado] ?? "gray";
  const label          = WORKFLOW_STATE_LABEL[instance.estado] ?? instance.estado;
  const totalStages    = instance.stages.length;
  const currentOrden   = currentStage?.orden ?? 0;

  return (
    <div className="bg-sse-surface border border-sse-border rounded-lg p-4">
      {/* Top row: name + estado + progress */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h1 className="text-[16px] font-semibold text-sse-ink leading-tight truncate">
              {instance.nombre}
            </h1>
            <Badge variant={cfg}>{label}</Badge>
          </div>
          <p className="text-[12px] text-sse-muted">
            {blueprint.nombre}
            {blueprint.version && (
              <span className="text-sse-muted/60"> · v{blueprint.version}</span>
            )}
            {blueprint.category && (
              <span className="text-sse-muted/60"> · {blueprint.category}</span>
            )}
          </p>
          {currentStage && (
            <p className="text-[11px] text-sse-muted mt-0.5">
              Etapa actual:{" "}
              <span className="font-medium text-sse-ink">{currentStage.label}</span>
            </p>
          )}
        </div>

        {/* Progress counter */}
        <div className="shrink-0 text-right w-28">
          <p className="text-[13px] font-semibold text-sse-ink mb-1">
            Etapa {currentOrden} de {totalStages}
          </p>
          <Progress
            value={totalStages > 0 ? Math.round((currentOrden / totalStages) * 100) : 0}
            color="primary"
          />
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-5 mt-3 pt-3 border-t border-sse-border flex-wrap">
        <div>
          <span className="text-[10px] uppercase tracking-wide text-sse-muted">
            Creado por
          </span>
          <p className="text-[12px] font-medium text-sse-ink">
            {instance.createdByName}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wide text-sse-muted">
            Fecha de inicio
          </span>
          <p className="text-[12px] font-medium text-sse-ink">
            {fmtDate(instance.createdAt)}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wide text-sse-muted">
            Actualizado
          </span>
          <p className="text-[12px] font-medium text-sse-ink">
            {fmtDate(instance.updatedAt)}
          </p>
        </div>
        {instance.completedAt && (
          <div>
            <span className="text-[10px] uppercase tracking-wide text-sse-muted">
              Completado
            </span>
            <p className="text-[12px] font-medium text-sse-sem-green-fg">
              {fmtDate(instance.completedAt)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
