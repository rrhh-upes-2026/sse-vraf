import type { WorkflowEvent, TimelineEntry, WorkflowEventType } from "@/types/workflow";

interface EventConfig {
  title: (payload: Record<string, unknown>) => string;
  color: string;
  iconPath: string;
}

const EVENT_CONFIG: Record<WorkflowEventType, EventConfig> = {
  WorkflowCreated: {
    title: (p) => `Workflow creado: ${String(p.nombre ?? "")}`,
    color: "#2E6BE6",
    iconPath: "M12 4v16m8-8H4",
  },
  WorkflowStarted: {
    title: () => "Proceso iniciado",
    color: "#2E6BE6",
    iconPath: "M5 12l7-7 7 7M5 12l7 7 7-7",
  },
  StageStarted: {
    title: (p) => `Etapa iniciada: ${String(p.stageLabel ?? "")}`,
    color: "#0F8A8A",
    iconPath: "M9 5l7 7-7 7",
  },
  StageCompleted: {
    title: (p) => `Etapa completada: ${String(p.stageLabel ?? "")}`,
    color: "#12A150",
    iconPath: "M5 13l4 4L19 7",
  },
  ActivityAssigned: {
    title: (p) => `Actividad asignada a ${String(p.assigneeName ?? "")}`,
    color: "#5B4FD0",
    iconPath: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  ActivityStarted: {
    title: (p) => `Actividad iniciada: ${String(p.activityLabel ?? "")}`,
    color: "#5B4FD0",
    iconPath: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z",
  },
  ActivityCompleted: {
    title: (p) => `Actividad completada: ${String(p.activityLabel ?? "")}`,
    color: "#12A150",
    iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  ActivityReopened: {
    title: (p) => `Actividad reabierta: ${String(p.activityLabel ?? "")}`,
    color: "#E5A100",
    iconPath: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  },
  EvidenceAttached: {
    title: (p) => `Evidencia adjuntada: ${String(p.fileName ?? "")}`,
    color: "#2E6BE6",
    iconPath: "M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13",
  },
  EvidenceValidated: {
    title: (p) => `Evidencia validada: ${String(p.fileName ?? "")}`,
    color: "#12A150",
    iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  FormSubmitted: {
    title: (p) => `Formulario completado: ${String(p.formLabel ?? "")}`,
    color: "#5B4FD0",
    iconPath: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  },
  TransitionExecuted: {
    title: (p) => `Transición ejecutada: ${String(p.transitionLabel ?? "")}`,
    color: "#2E6BE6",
    iconPath: "M13 5l7 7-7 7M5 5l7 7-7 7",
  },
  ApprovalGranted: {
    title: (p) => `Aprobación concedida por ${String(p.approverName ?? "")}`,
    color: "#12A150",
    iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944",
  },
  ApprovalRejected: {
    title: (p) => `Aprobación rechazada`,
    color: "#E5484D",
    iconPath: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  WorkflowCompleted: {
    title: () => "Proceso completado exitosamente",
    color: "#12A150",
    iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  WorkflowCancelled: {
    title: (p) => `Proceso cancelado${p.reason ? `: ${String(p.reason)}` : ""}`,
    color: "#E5484D",
    iconPath: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  WorkflowBlocked: {
    title: (p) => `Proceso bloqueado${p.reason ? `: ${String(p.reason)}` : ""}`,
    color: "#E5A100",
    iconPath: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",
  },
  WorkflowResumed: {
    title: () => "Proceso reanudado",
    color: "#2E6BE6",
    iconPath: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263",
  },
  CommentAdded: {
    title: (p) => `Comentario de ${String(p.authorName ?? "")}`,
    color: "#718096",
    iconPath: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  },
  AssigneeChanged: {
    title: (p) =>
      `Reasignado: ${String(p.activityLabel ?? "")} → ${String(p.assigneeName ?? "")}`,
    color: "#5B4FD0",
    iconPath: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  },
};

export function eventToTimelineEntry(event: WorkflowEvent): TimelineEntry {
  const cfg = EVENT_CONFIG[event.type];
  return {
    id: `${event.id}-tl`,
    eventType: event.type,
    title: cfg?.title(event.payload) ?? event.type,
    actorName: event.actorName,
    timestamp: event.occurredAt,
    color: cfg?.color ?? "#718096",
    iconPath: cfg?.iconPath ?? "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  };
}

export function eventsToTimeline(events: WorkflowEvent[]): TimelineEntry[] {
  return events.map(eventToTimelineEntry);
}
