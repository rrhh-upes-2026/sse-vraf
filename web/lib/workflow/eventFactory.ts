import type { WorkflowEvent, WorkflowEventType, Actor } from "@/types/workflow";

let _seq = 0;

export function makeEvent(
  type: WorkflowEventType,
  instanceId: string,
  actor: Actor,
  now: string,
  payload: Record<string, unknown>,
  opts?: { stageId?: string; activityId?: string },
): WorkflowEvent {
  return {
    id: `evt-${instanceId}-${(++_seq).toString(36)}-${now.slice(17, 23).replace(/\D/g, "")}`,
    instanceId,
    type,
    actorId: actor.id,
    actorName: actor.name,
    payload,
    occurredAt: now,
    ...(opts?.stageId ? { stageId: opts.stageId } : {}),
    ...(opts?.activityId ? { activityId: opts.activityId } : {}),
  };
}
