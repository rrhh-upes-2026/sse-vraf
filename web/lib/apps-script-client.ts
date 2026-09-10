/**
 * Minimal Apps Script RPC client.
 * Replaces the deleted services/adapters/getAppsScriptClient adapter.
 * Reads APPS_SCRIPT_URL from the environment.
 */

interface AppsScriptClient {
  call<T = unknown>(method: string, params?: Record<string, unknown>): Promise<T>;
}

export function getAppsScriptClient(): AppsScriptClient {
  const url = process.env.APPS_SCRIPT_WEB_APP_URL ?? process.env.APPS_SCRIPT_URL;
  if (!url) {
    throw new Error("APPS_SCRIPT_URL is not configured.");
  }

  return {
    async call<T>(method: string, params?: Record<string, unknown>): Promise<T> {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: method, params }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(text || `Apps Script error ${res.status}`);
      }

      const data = await res.json() as unknown;

      // Handle GAS envelope: { error: true, code: number, message: string } or { ok: true, data: T }
      if (data && typeof data === "object" && !Array.isArray(data)) {
        const obj = data as Record<string, unknown>;
        if (obj["error"] === true) {
          const message = typeof obj["message"] === "string" ? obj["message"] : "Error de Apps Script";
          const err = new Error(message) as Error & { gasCode?: number };
          err.gasCode = typeof obj["code"] === "number" ? obj["code"] : 400;
          throw err;
        }
        if ("data" in obj && obj["data"] !== undefined) return obj["data"] as T;
      }

      return data as T;
    },
  };
}
