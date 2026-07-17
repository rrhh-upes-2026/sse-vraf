import type { IAppsScriptClient } from "./types";
import { MockAppsScriptAdapter } from "./mockAppsScriptAdapter";
import { HttpAppsScriptAdapter } from "./httpAppsScriptAdapter";

let instance: IAppsScriptClient | null = null;

/**
 * The single DI seam for the whole app: every service in services/ resolves
 * its client through this factory instead of constructing an adapter directly.
 *
 * Server-side (SSR, Server Components, Route Handlers, auth callbacks):
 *   Uses APPS_SCRIPT_WEB_APP_URL directly with WEBHOOK_SHARED_SECRET injected
 *   into every request body. Falls back to MockAppsScriptAdapter when the URL
 *   is not configured (local dev without a deployed backend).
 *
 * Client-side (browser, React hooks):
 *   Proxies through /api/apps-script, which adds the secret server-side so it
 *   is never exposed in the browser bundle. NEXT_PUBLIC_APPS_SCRIPT_ENABLED
 *   must be "true" for live mode; otherwise MockAppsScriptAdapter is used.
 */
export function getAppsScriptClient(): IAppsScriptClient {
  if (instance) return instance;

  if (typeof window === "undefined") {
    // Server-side path
    const url    = process.env.APPS_SCRIPT_WEB_APP_URL;
    const secret = process.env.WEBHOOK_SHARED_SECRET;
    instance = url ? new HttpAppsScriptAdapter(url, secret) : new MockAppsScriptAdapter();
  } else {
    // Client-side path — proxy route adds the secret
    const enabled = process.env.NEXT_PUBLIC_APPS_SCRIPT_ENABLED === "true";
    instance = enabled ? new HttpAppsScriptAdapter("/api/apps-script") : new MockAppsScriptAdapter();
  }

  return instance;
}

/** Test/dev-only escape hatch to swap the singleton (e.g. inject a fake in tests). */
export function setAppsScriptClient(client: IAppsScriptClient) {
  instance = client;
}
