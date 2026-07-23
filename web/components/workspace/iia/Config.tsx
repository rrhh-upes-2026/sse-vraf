"use client";

import { useState, useEffect } from "react";
import { useIIAConfig, useUpdateIIAConfig, useIIAStatus } from "@/hooks/useIIA";

const MODELS = [
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemini-2.0-flash-exp",
  "gemini-1.0-pro",
];

interface FormState {
  apiKey:      string;
  model:       string;
  temperature: string;
  maxTokens:   string;
  timeout:     string;
  retries:     string;
  debugMode:   boolean;
}

export function IIAConfig({ wsId }: { wsId: string }) {
  void wsId;
  const { data: config, isLoading } = useIIAConfig();
  const { data: status } = useIIAStatus();
  const update = useUpdateIIAConfig();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState<FormState>({
    apiKey:      "",
    model:       "gemini-1.5-pro",
    temperature: "0.7",
    maxTokens:   "8192",
    timeout:     "30000",
    retries:     "3",
    debugMode:   false,
  });

  useEffect(() => {
    if (config) {
      setForm({
        apiKey:      "",
        model:       config.model       ?? "gemini-1.5-pro",
        temperature: String(config.temperature ?? 0.7),
        maxTokens:   String(config.maxTokens   ?? 8192),
        timeout:     String(config.timeout     ?? 30000),
        retries:     String(config.retries     ?? 3),
        debugMode:   config.debugMode   ?? false,
      });
    }
  }, [config]);

  function set(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };
  }

  async function handleSave() {
    await update.mutateAsync({
      apiKey:      form.apiKey      || undefined,
      model:       form.model       || undefined,
      temperature: parseFloat(form.temperature) || undefined,
      maxTokens:   parseInt(form.maxTokens)     || undefined,
      timeout:     parseInt(form.timeout)        || undefined,
      retries:     parseInt(form.retries)        || undefined,
      debugMode:   form.debugMode,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setForm((prev) => ({ ...prev, apiKey: "" }));
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 rounded-lg bg-sse-border" />)}
      </div>
    );
  }

  const statusColor = {
    available:   "text-green-600 bg-green-50 border-green-200",
    degraded:    "text-amber-600 bg-amber-50 border-amber-200",
    unavailable: "text-red-600 bg-red-50 border-red-200",
  }[status?.status ?? "unavailable"] ?? "text-sse-muted bg-sse-border";

  return (
    <div className="space-y-5 max-w-xl">
      {saved && (
        <div className="rounded-lg border border-green-200 bg-green-50/40 px-4 py-3 text-[12px] text-green-700">
          ✓ Configuración guardada correctamente.
        </div>
      )}

      {/* Gemini status */}
      {status && (
        <div className={`rounded-lg border px-4 py-3 text-[12px] font-medium ${statusColor}`}>
          Gemini API: {status.status}
          {status.reason && <span className="font-normal ml-1">— {status.reason}</span>}
        </div>
      )}

      {/* API Key */}
      <div className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-3">
        <p className="text-[12px] font-semibold text-sse-ink">Autenticación Gemini</p>
        <div>
          <label className="block text-[11px] text-sse-muted mb-0.5">
            API Key{config?.geminiConfigured ? " (dejar vacío para no modificar)" : " *"}
          </label>
          <input
            type="password"
            value={form.apiKey}
            onChange={set("apiKey")}
            placeholder={config?.geminiConfigured ? "••••••••••••••••" : "AIza…"}
            className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-bg text-sse-ink font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <p className="text-[10px] text-sse-muted mt-0.5">
            La clave se almacena obfuscada con XOR+Base64 usando el Script ID. Nunca viaja al navegador.
          </p>
          {config?.geminiConfigured && (
            <p className="text-[10px] text-green-600 mt-0.5">✓ API Key configurada</p>
          )}
        </div>
      </div>

      {/* Model & generation config */}
      <div className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-3">
        <p className="text-[12px] font-semibold text-sse-ink">Modelo y generación</p>

        <div>
          <label className="block text-[11px] text-sse-muted mb-0.5">Modelo</label>
          <select
            value={form.model}
            onChange={set("model")}
            className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Temperatura (0–2)</label>
            <input
              type="number" min="0" max="2" step="0.1"
              value={form.temperature} onChange={set("temperature")}
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Max tokens</label>
            <input
              type="number" min="256" max="32768" step="256"
              value={form.maxTokens} onChange={set("maxTokens")}
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Timeout (ms)</label>
            <input
              type="number" min="5000" max="120000" step="1000"
              value={form.timeout} onChange={set("timeout")}
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-[11px] text-sse-muted mb-0.5">Reintentos</label>
            <input
              type="number" min="0" max="5"
              value={form.retries} onChange={set("retries")}
              className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-bg text-sse-ink focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox" id="debugMode"
            checked={form.debugMode}
            onChange={set("debugMode")}
            className="rounded border-sse-border text-indigo-600 focus:ring-indigo-400"
          />
          <label htmlFor="debugMode" className="text-[12px] text-sse-ink">
            Modo debug (registra prompts completos en AuditLog)
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => void handleSave()}
          disabled={update.isPending}
          className="text-[12px] px-6 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 font-medium"
        >
          {update.isPending ? "Guardando…" : "Guardar configuración"}
        </button>
      </div>
    </div>
  );
}
