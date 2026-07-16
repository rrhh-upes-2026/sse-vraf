import type { InstanceActivity, InstanceComment } from "@/types/workflow";

let _ctr = 0;
function nanoId(): string {
  return `${Date.now().toString(36)}-${(++_ctr).toString(36)}`;
}

export function assignActivity(
  activity: InstanceActivity,
  assigneeId: string,
  assigneeName: string,
): InstanceActivity {
  return {
    ...activity,
    assigneeId,
    assigneeName,
    estado: activity.estado === "pendiente" ? "en_progreso" : activity.estado,
    startedAt: activity.startedAt ?? new Date().toISOString(),
  };
}

export function completeActivity(
  activity: InstanceActivity,
  actorId: string,
  now: string,
  data?: { formSubmission?: Record<string, unknown>; attachments?: string[] },
): InstanceActivity {
  return {
    ...activity,
    estado: "completada",
    completedAt: now,
    completedBy: actorId,
    ...(data?.formSubmission !== undefined ? { formSubmission: data.formSubmission } : {}),
    ...(data?.attachments?.length
      ? { attachments: [...(activity.attachments ?? []), ...data.attachments] }
      : {}),
  };
}

export function reopenActivity(activity: InstanceActivity): InstanceActivity {
  if (activity.estado !== "completada") return activity;
  return {
    ...activity,
    estado: "pendiente",
    completedAt: undefined,
    completedBy: undefined,
    formSubmission: undefined,
  };
}

export function delegateActivity(
  activity: InstanceActivity,
  newAssigneeId: string,
  newAssigneeName: string,
): InstanceActivity {
  return { ...activity, assigneeId: newAssigneeId, assigneeName: newAssigneeName };
}

export function addComment(
  activity: InstanceActivity,
  authorId: string,
  authorName: string,
  texto: string,
  now: string,
): InstanceActivity {
  const comment: InstanceComment = {
    id: nanoId(),
    authorId,
    authorName,
    texto,
    creadoEn: now,
  };
  return { ...activity, comments: [...(activity.comments ?? []), comment] };
}

export function areRequiredActivitiesDone(activities: InstanceActivity[]): boolean {
  return activities.filter((a) => a.required).every((a) => a.estado === "completada");
}

export function allActivitiesDone(activities: InstanceActivity[]): boolean {
  return activities.every((a) => a.estado === "completada" || a.estado === "cancelada");
}
