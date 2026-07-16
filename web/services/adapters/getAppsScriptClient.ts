import type { IAppsScriptClient } from "./types";
import { MockAppsScriptAdapter } from "./mockAppsScriptAdapter";
import { HttpAppsScriptAdapter } from "./httpAppsScriptAdapter";

let instance: IAppsScriptClient | null = null;

/**
 * The single DI seam for the whole app: every service in services/ resolves
 * its client through this factory instead of constructing an adapter
 * directly. Set APPS_SCRIPT_WEB_APP_URL once the real Apps Script project is
 * deployed and every feature built against IAppsScriptClient switches over
 * with no code changes above this file.
 */
export function getAppsScriptClient(): IAppsScriptClient {
  if (instance) return instance;

  const url = process.env.APPS_SCRIPT_WEB_APP_URL;
  instance = url ? new HttpAppsScriptAdapter(url) : new MockAppsScriptAdapter();
  return instance;
}

/** Test/dev-only escape hatch to swap the singleton (e.g. inject a fake in tests). */
export function setAppsScriptClient(client: IAppsScriptClient) {
  instance = client;
}
