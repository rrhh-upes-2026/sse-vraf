import type { EntityName, IAppsScriptClient, ListQuery } from "./types";

/** Frozen response envelope from apps-script/src/utils/response.js */
interface AppsScriptEnvelope<T> {
  success: boolean;
  data: T;
  metadata: {
    requestId: string | null;
    durationMs: number;
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
  errors: Array<{ code: string; message: string; field?: string }>;
  timestamp: string;
  requestId: string | null;
}

/**
 * Talks to the deployed Google Apps Script Web App, which acts as the sole
 * Backend-for-Frontend. Apps Script exposes one doPost(e) entry point that
 * dispatches on `action` (e.g. "procesos.list") against its Sheets/Drive
 * services — this adapter is the only place in the frontend that knows the
 * wire format.
 *
 * CORS note: Apps Script Web Apps cannot respond to OPTIONS preflight
 * requests, so the request must stay a CORS "simple request". That means no
 * Content-Type: application/json from the browser. The body is still valid
 * JSON text; doPost() in Code.js parses it the same way regardless.
 */
export class HttpAppsScriptAdapter implements IAppsScriptClient {
  constructor(private readonly baseUrl: string) {}

  async call<T>(action: string, params?: Record<string, unknown>): Promise<T> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, params }),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Apps Script HTTP error (${res.status}): ${action}`);
    }

    const envelope = (await res.json()) as AppsScriptEnvelope<T>;

    if (!envelope.success) {
      const msg =
        envelope.errors?.[0]?.message ??
        `Apps Script returned an error for action: ${action}`;
      throw new Error(msg);
    }

    return envelope.data;
  }

  list<T>(entity: EntityName, query?: ListQuery): Promise<T[]> {
    return this.call<T[]>(`${entity}.list`, query as Record<string, unknown>);
  }

  get<T>(entity: EntityName, id: string): Promise<T | null> {
    return this.call<T | null>(`${entity}.get`, { id });
  }

  create<T extends { id?: string }>(entity: EntityName, payload: Partial<T>): Promise<T> {
    return this.call<T>(`${entity}.create`, payload as Record<string, unknown>);
  }

  update<T>(entity: EntityName, id: string, patch: Partial<T>): Promise<T> {
    return this.call<T>(`${entity}.update`, { id, ...patch } as Record<string, unknown>);
  }

  remove(entity: EntityName, id: string): Promise<void> {
    return this.call<void>(`${entity}.remove`, { id });
  }
}
