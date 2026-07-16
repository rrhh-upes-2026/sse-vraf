/** Catálogo oficial de eventos del sistema — MASTER HANDOFF §09. 16 eventos. */
export type SystemEvent =
  | "PROCESS_CREATED"
  | "PROCESS_UPDATED"
  | "PROCESS_COMPLETED"
  | "STAGE_COMPLETED"
  | "EVIDENCE_UPLOADED"
  | "INDICATOR_UPDATED"
  | "FORM_SUBMITTED"
  | "FORM_APPROVED"
  | "FORM_PUBLISHED"
  | "REQUEST_CREATED"
  | "REQUEST_CLOSED"
  | "REPORT_GENERATED"
  | "SLA_WARNING"
  | "SLA_BREACHED"
  | "LOGIN_SUCCESS"
  | "PERMISSION_DENIED";

export interface SystemEventPayload<T = Record<string, unknown>> {
  event: SystemEvent;
  entityId: string;
  actorId: string;
  occurredAt: string;
  data: T;
}
