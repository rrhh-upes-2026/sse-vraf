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
 *   Calls Apps Script directly using NEXT_PUBLIC_APPS_SCRIPT_URL. The browser
 *   sends Google Workspace session cookies automatically (credentials: "include"),
 *   so domain-restricted Web Apps authenticate via those cookies. Falls back to
 *   MockAppsScriptAdapter when the URL is not configured (local dev).
 */
export function getAppsScriptClient(): IAppsScriptClient {
  if (instance) return instance;

  if (typeof window === "undefined") {
    // Server-side path
    const url    = process.env.APPS_SCRIPT_WEB_APP_URL;
    const secret = process.env.WEBHOOK_SHARED_SECRET;
    instance = url ? new HttpAppsScriptAdapter(url, secret) : new MockAppsScriptAdapter();
  } else {
    // Client-side path — calls Apps Script directly using the browser's Google session cookies
    const url = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
    instance = url ? new HttpAppsScriptAdapter(url) : new MockAppsScriptAdapter();
  }

  return instance;
}

/** Test/dev-only escape hatch to swap the singleton (e.g. inject a fake in tests). */
export function setAppsScriptClient(client: IAppsScriptClient) {
  instance = client;
}
