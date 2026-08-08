/**
 * Minimal Apps Script RPC client.
 * Replaces the deleted services/adapters/getAppsScriptClient adapter.
 * Reads APPS_SCRIPT_URL from the environment.
 */

interface AppsScriptClient {
  call<T = unknown>(method: string, params?: Record<string, unknown>): Promise<T>;
}

export function getAppsScriptClient(): AppsScriptClient {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) {
    throw new Error("APPS_SCRIPT_URL is not configured.");
  }

  return {
    async call<T>(method: string, params?: Record<string, unknown>): Promise<T> {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, params }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(text || `Apps Script error ${res.status}`);
      }

      const data = await res.json() as { ok?: boolean; error?: string; data?: T } | T;

      // Handle wrapped { ok, data } or { error } envelope
      if (data && typeof data === "object" && !Array.isArray(data)) {
        const envelope = data as { ok?: boolean; error?: string; data?: T };
        if (envelope.error) throw new Error(envelope.error);
        if ("data" in envelope && envelope.data !== undefined) return envelope.data as T;
      }

      return data as T;
    },
  };
}
