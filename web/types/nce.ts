// NCE — Notification & Communication Engine

export type NCENotificationStatus = "pendiente" | "entregada" | "leida" | "archivada" | "fallida";
export type NCENotificationPriority = "baja" | "normal" | "alta" | "urgente";
export type NCEChannel = "interna" | "correo" | "google_chat";
export type NCETemplateType =
  | "alerta_plan"
  | "tarea_vencida"
  | "nueva_recomendacion"
  | "diagnostico_nuevo"
  | "hito_completado"
  | "regla_activada"
  | "evidencia_nueva"
  | "resumen_diario";

export type NCEDigestFrequency = "diario" | "semanal" | "quincenal";
export type NCEDigestStatus = "pendiente" | "generado" | "entregado" | "fallido";

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface NCENotification {
  id: string;
  recipientId: string;
  recipientEmail: string;
  title: string;
  body: string;
  channel: NCEChannel;
  status: NCENotificationStatus;
  priority: NCENotificationPriority;
  templateId?: string;
  templateType?: NCETemplateType;
  sourceEventId?: string;
  sourceEngine?: string;
  metadata: Record<string, unknown>;
  readAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NCETemplate {
  id: string;
  name: string;
  type: NCETemplateType;
  channel: NCEChannel;
  subject: string;
  body: string;
  variables: string[];
  enabled: boolean;
  version: number;
  usageCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NCEUserPreference {
  id: string;
  userId: string;
  userEmail: string;
  enabledChannels: NCEChannel[];
  enabledTypes: NCETemplateType[];
  quietHoursStart?: string;
  quietHoursEnd?: string;
  digestEnabled: boolean;
  digestFrequency: NCEDigestFrequency;
  updatedAt: string;
}

export interface NCEDigest {
  id: string;
  recipientId: string;
  recipientEmail: string;
  frequency: NCEDigestFrequency;
  status: NCEDigestStatus;
  periodStart: string;
  periodEnd: string;
  notificationCount: number;
  summary: Record<string, unknown>;
  generatedAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface NCEDashboard {
  totalNotifications: number;
  pendingNotifications: number;
  deliveredToday: number;
  failedNotifications: number;
  avgDeliveryTime: number;
  activeTemplates: number;
  digestsPending: number;
  readRate: number;
  notificationsByChannel: { channel: NCEChannel; count: number }[];
  notificationsByType: { type: NCETemplateType; count: number }[];
  recentNotifications: NCENotification[];
  notificationsByDay: { date: string; count: number }[];
  generatedAt: string;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface NCENotificationsParams {
  recipientId?: string;
  status?: NCENotificationStatus;
  priority?: NCENotificationPriority;
  channel?: NCEChannel;
  templateType?: NCETemplateType;
  from?: string;
  to?: string;
  limit?: number;
}

export interface NCETemplatesParams {
  type?: NCETemplateType;
  channel?: NCEChannel;
  enabled?: boolean;
  limit?: number;
}

export interface NCEDigestsParams {
  recipientId?: string;
  status?: NCEDigestStatus;
  frequency?: NCEDigestFrequency;
  limit?: number;
}

// ─── Mutation Params ──────────────────────────────────────────────────────────

export interface NCECreateNotificationParams {
  recipientId: string;
  recipientEmail: string;
  templateId?: string;
  templateType?: NCETemplateType;
  variables?: Record<string, string>;
  channel?: NCEChannel;
  priority?: NCENotificationPriority;
  sourceEventId?: string;
  sourceEngine?: string;
}

export interface NCECreateTemplateParams {
  name: string;
  type: NCETemplateType;
  channel: NCEChannel;
  subject: string;
  body: string;
  variables?: string[];
  createdBy?: string;
}

export interface NCEUpdateTemplateParams extends Partial<NCETemplate> {
  id: string;
}

export interface NCEUpdatePreferenceParams {
  userId: string;
  userEmail: string;
  enabledChannels?: NCEChannel[];
  enabledTypes?: NCETemplateType[];
  quietHoursStart?: string;
  quietHoursEnd?: string;
  digestEnabled?: boolean;
  digestFrequency?: NCEDigestFrequency;
}

export interface NCEMarkReadParams {
  notificationId: string;
  recipientId: string;
}

export interface NCEGenerateDigestParams {
  recipientId: string;
  frequency: NCEDigestFrequency;
}
