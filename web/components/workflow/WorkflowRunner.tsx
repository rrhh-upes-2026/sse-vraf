"use client";

import { useWorkflowEngine } from "@/hooks/useWorkflowEngine";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkflowHeader } from "./WorkflowHeader";
import { WorkflowProgressBar } from "./WorkflowProgressBar";
import { ActivityList } from "./ActivityList";
import { TransitionPanel } from "./TransitionPanel";
import { WorkflowTimeline } from "./WorkflowTimeline";
import { fmtShortDate } from "@/lib/utils";

interface WorkflowRunnerProps {
  instanceId:   string;
  blueprintId?: string;
}

export function WorkflowRunner({ instanceId, blueprintId }: WorkflowRunnerProps) {
  const {
    instance,
    blueprint,
    currentStage,
    currentStageDef,
    availableTransitions,
    isLoading,
    completeActivity,
    reopenActivity,
    addComment,
    executeTransition,
    canAdvance,
  } = useWorkflowEngine(instanceId, blueprintId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="bg-sse-surface border border-sse-border rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1 pr-4">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-8 w-24 shrink-0" />
          </div>
          <div className="flex gap-5 pt-3 border-t border-sse-border">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        {/* Progress bar skeleton */}
        <div className="bg-sse-surface border border-sse-border rounded-lg px-4 py-3">
          <div className="flex items-start gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start flex-1">
                <div className="flex flex-col items-center w-14">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-2 w-10 mt-1" />
                </div>
                {i < 4 && <Skeleton className="h-0.5 flex-1 mt-3.5" />}
              </div>
            ))}
          </div>
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <Skeleton className="h-36 w-full rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
          <Skeleton className="h-80 w-full rounded-md" />
        </div>
      </div>
    );
  }

  if (!instance || !blueprint) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <p className="text-[14px] font-medium text-sse-ink mb-1">Proceso no encontrado</p>
          <p className="text-[12px] text-sse-muted">
            No se pudo cargar la instancia <code className="font-mono">{instanceId}</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <WorkflowHeader instance={instance} blueprint={blueprint} currentStage={currentStage} />

      {/* Stage progress */}
      <WorkflowProgressBar stages={instance.stages} currentStageId={instance.currentStageId} />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column: stage + activities + transitions */}
        <div className="lg:col-span-2 space-y-4">
          {/* Current stage info */}
          <div className="bg-sse-surface border border-sse-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[14px] font-semibold text-sse-ink">
                  {currentStage?.label ?? "Etapa actual"}
                </h2>
                {currentStageDef?.description && (
                  <p className="text-[12px] text-sse-muted mt-0.5">
                    {currentStageDef.description}
                  </p>
                )}
              </div>
              {currentStage?.startedAt && (
                <span className="text-[11px] text-sse-muted shrink-0">
                  Iniciada{" "}
                  {fmtShortDate(currentStage.startedAt)}
                </span>
              )}
            </div>

            {/* Activities */}
            {currentStage && (
              <ActivityList
                activities={currentStage.activities}
                stageId={currentStage.defId}
                onCompleteActivity={(activityId, data) =>
                  completeActivity(currentStage.defId, activityId, data)
                }
                onReopenActivity={(activityId) =>
                  reopenActivity(currentStage.defId, activityId)
                }
                onAddComment={(activityId, texto) =>
                  addComment(currentStage.defId, activityId, texto)
                }
              />
            )}
          </div>

          {/* Transition panel */}
          {availableTransitions.length > 0 && (
            <div className="bg-sse-surface border border-sse-border rounded-lg p-4">
              <TransitionPanel
                transitions={availableTransitions}
                instance={instance}
                blueprint={blueprint}
                canAdvance={canAdvance}
                onExecute={async (transitionId, comment) => {
                  await executeTransition(transitionId, comment);
                }}
              />
            </div>
          )}
        </div>

        {/* Right column: timeline */}
        <div className="bg-sse-surface border border-sse-border rounded-lg p-4">
          <h3 className="text-[13px] font-semibold text-sse-ink mb-3">Línea de tiempo</h3>
          <WorkflowTimeline entries={instance.timeline} />
        </div>
      </div>
    </div>
  );
}
