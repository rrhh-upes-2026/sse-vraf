import { getAppsScriptClient } from "./adapters/getAppsScriptClient";
import type {
  NCEDashboard,
  NCENotification,
  NCETemplate,
  NCEUserPreference,
  NCEDigest,
  NCENotificationsParams,
  NCETemplatesParams,
  NCEDigestsParams,
  NCECreateNotificationParams,
  NCECreateTemplateParams,
  NCEUpdateTemplateParams,
  NCEUpdatePreferenceParams,
  NCEMarkReadParams,
  NCEGenerateDigestParams,
} from "@/types/nce";

const WS = "nce";
const c = () => getAppsScriptClient();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = (v: unknown): Record<string, unknown> => (v ?? {}) as any;

export async function getNCEDashboard(): Promise<NCEDashboard> {
  return c().call<NCEDashboard>(`${WS}.getDashboard`, {});
}

export async function getNCENotifications(params?: NCENotificationsParams): Promise<NCENotification[]> {
  return c().call<NCENotification[]>(`${WS}.getNotifications`, p(params));
}

export async function createNCENotification(params: NCECreateNotificationParams): Promise<NCENotification> {
  return c().call<NCENotification>(`${WS}.createNotification`, p(params));
}

export async function markNCENotificationRead(params: NCEMarkReadParams): Promise<NCENotification> {
  return c().call<NCENotification>(`${WS}.markRead`, p(params));
}

export async function archiveNCENotification(notificationId: string): Promise<{ archived: boolean; id: string }> {
  return c().call(`${WS}.archiveNotification`, { notificationId });
}

export async function getNCETemplates(params?: NCETemplatesParams): Promise<NCETemplate[]> {
  return c().call<NCETemplate[]>(`${WS}.getTemplates`, p(params));
}

export async function getNCETemplate(id: string): Promise<NCETemplate> {
  return c().call<NCETemplate>(`${WS}.getTemplate`, { id });
}

export async function createNCETemplate(params: NCECreateTemplateParams): Promise<NCETemplate> {
  return c().call<NCETemplate>(`${WS}.createTemplate`, p(params));
}

export async function updateNCETemplate(params: NCEUpdateTemplateParams): Promise<NCETemplate> {
  return c().call<NCETemplate>(`${WS}.updateTemplate`, p(params));
}

export async function getNCEPreference(userId: string, userEmail?: string): Promise<NCEUserPreference> {
  return c().call<NCEUserPreference>(`${WS}.getPreference`, { userId, userEmail });
}

export async function updateNCEPreference(params: NCEUpdatePreferenceParams): Promise<NCEUserPreference> {
  return c().call<NCEUserPreference>(`${WS}.updatePreference`, p(params));
}

export async function generateNCEDigest(params: NCEGenerateDigestParams): Promise<NCEDigest> {
  return c().call<NCEDigest>(`${WS}.generateDigest`, p(params));
}

export async function getNCEDigests(params?: NCEDigestsParams): Promise<NCEDigest[]> {
  return c().call<NCEDigest[]>(`${WS}.getDigests`, p(params));
}

export async function consumeNCEAUEEvents(limit?: number): Promise<{ processed: number }> {
  return c().call(`${WS}.consumeAUEEvents`, { limit: limit ?? 50 });
}
