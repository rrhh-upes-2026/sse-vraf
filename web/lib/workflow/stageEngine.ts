import type {
  StageInstance,
  StageDefinition,
  InstanceActivity,
  ProcessInstance,
} from "@/types/workflow";
import { areRequiredActivitiesDone } from "./activityEngine";

export function startStage(stage: StageInstance, now: string): StageInstance {
  return { ...stage, estado: "activa", startedAt: now };
}

export function completeStage(
  stage: StageInstance,
  actorId: string,
  now: string,
): StageInstance {
  return { ...stage, estado: "completada", completedAt: now, approvedBy: actorId };
}

export function rejectStage(
  stage: StageInstance,
  reason: string,
  now: string,
): StageInstance {
  return { ...stage, estado: "rechazada", rejectedAt: now, rejectionReason: reason };
}

export function reactivateStage(stage: StageInstance, now: string): StageInstance {
  return {
    ...stage,
    estado: "activa",
    startedAt: now,
    completedAt: undefined,
    approvedBy: undefined,
    activities: stage.activities.map((a) => ({ ...a, estado: "pendiente" as const })),
  };
}

export function isStageReadyToAdvance(
  stage: StageInstance,
  def: StageDefinition,
): boolean {
  // All required activities must be done
  if (!areRequiredActivitiesDone(stage.activities)) return false;
  // autoAdvance: engine advances without explicit transition
  return def.autoAdvance === true;
}

export function findStageInstance(
  instance: ProcessInstance,
  stageId: string,
): StageInstance | undefined {
  return instance.stages.find((s) => s.defId === stageId);
}

export function updateStageInInstance(
  instance: ProcessInstance,
  updated: StageInstance,
): ProcessInstance {
  return {
    ...instance,
    stages: instance.stages.map((s) =>
      s.defId === updated.defId ? updated : s,
    ),
  };
}

export function updateActivityInStage(
  stage: StageInstance,
  activityId: string,
  updater: (a: InstanceActivity) => InstanceActivity,
): StageInstance {
  return {
    ...stage,
    activities: stage.activities.map((a) =>
      a.defId === activityId ? updater(a) : a,
    ),
  };
}

export function getStageCompletionPct(stages: StageInstance[]): number {
  if (stages.length === 0) return 0;
  const done = stages.filter((s) => s.estado === "completada").length;
  return Math.round((done / stages.length) * 100);
}
