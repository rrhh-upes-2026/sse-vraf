"use client";

import { useState, useEffect } from "react";
import { useGWPConfig, useUpdateGWPConfig as useGWPSaveConfig } from "@/hooks/useGWP";

interface FormState {
  clientId:        string;
  clientSecret:    string;
  redirectUri:     string;
  scopes:          string;
  workspaceDomain: string;
  adminEmail:      string;
}

const DEFAULT_SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/chat.messages",
  "https://www.googleapis.com/auth/chat.spaces.readonly",
].join(" ");

export function GWPConfig({ wsId }: { wsId: string }) {
  void wsId;
  const { data: config, isLoading } = useGWPConfig();
  const saveConfig = useGWPSaveConfig();

  const [form, setForm] = useState<FormState>({
    clientId:        "",
    clientSecret:    "",
    redirectUri:     "",
    scopes:          DEFAULT_SCOPES,
    workspaceDomain: "",
    adminEmail:      "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (config) {
      setForm({
        clientId:        config.clientId        ?? "",
        clientSecret:    "",
        redirectUri:     config.redirectUri      ?? "",
        scopes:          Array.isArray(config.scopes) ? config.scopes.join(" ") : DEFAULT_SCOPES,
        workspaceDomain: config.workspaceDomain  ?? "",
        adminEmail:      config.adminEmail       ?? "",
      });
    }
  }, [config]);

  function set(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSave() {
    await saveConfig.mutateAsync({
      clientId:        form.clientId        || undefined,
      clientSecret:    form.clientSecret    || undefined,
      redirectUri:     form.redirectUri     || undefined,
      scopes:          form.scopes ? form.scopes.split(/\s+/).filter(Boolean) : undefined,
      workspaceDomain: form.workspaceDomain || undefined,
      adminEmail:      form.adminEmail      || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setForm((prev) => ({ ...prev, clientSecret: "" }));
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 rounded-lg bg-sse-border" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {saved && (
        <div className="rounded-lg border border-green-200 bg-green-50/40 px-4 py-3 text-[12px] text-green-700">
          ✓ Configuración guardada correctamente.
        </div>
      )}

      {/* OAuth 2.0 credentials */}
      <div className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-4">
        <p className="text-[12px] font-semibold text-sse-ink">Credenciales OAuth 2.0</p>
        <p className="text-[11px] text-sse-muted -mt-2">
          Estas credenciales provienen de Google Cloud Console → APIs &amp; Services → Credentials. El clientSecret se almacena obfuscado en el servidor y nunca es retornado al cliente.
        </p>

        <div>
          <label className="block text-[11px] text-sse-muted mb-0.5">Client ID *</label>
          <input value={form.clientId} onChange={set("clientId")}
            placeholder="000000000000-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
            className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink font-mono focus:outline-none focus:ring-2 focus:ring-green-400" />
        </div>

        <div>
          <label className="block text-[11px] text-sse-muted mb-0.5">
            Client Secret{config?.clientId ? " (dejar vacío para no modificar)" : " *"}
          </label>
          <input type="password" value={form.clientSecret} onChange={set("clientSecret")}
            placeholder={config?.clientId ? "••••••••••••••••" : "GOCSPX-…"}
            className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink font-mono focus:outline-none focus:ring-2 focus:ring-green-400" />
          <p className="text-[10px] text-sse-muted mt-0.5">
            El secreto se almacena obfuscado con XOR+Base64 usando el Script ID como clave. Nunca viaja al navegador.
          </p>
        </div>

        <div>
          <label className="block text-[11px] text-sse-muted mb-0.5">Redirect URI *</label>
          <input value={form.redirectUri} onChange={set("redirectUri")}
            placeholder="https://tu-dominio.com/api/gwp/callback"
            className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink font-mono focus:outline-none focus:ring-2 focus:ring-green-400" />
          <p className="text-[10px] text-sse-muted mt-0.5">
            Debe coincidir exactamente con la URI registrada en Google Cloud Console.
          </p>
        </div>
      </div>

      {/* Workspace config */}
      <div className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-4">
        <p className="text-[12px] font-semibold text-sse-ink">Configuración de Workspace</p>

        <div>
          <label className="block text-[11px] text-sse-muted mb-0.5">Dominio Workspace</label>
          <input value={form.workspaceDomain} onChange={set("workspaceDomain")}
            placeholder="upes.edu.sv"
            className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink focus:outline-none focus:ring-2 focus:ring-green-400" />
        </div>

        <div>
          <label className="block text-[11px] text-sse-muted mb-0.5">Email de administrador</label>
          <input value={form.adminEmail} onChange={set("adminEmail")}
            placeholder="admin@upes.edu.sv"
            className="w-full text-[12px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink focus:outline-none focus:ring-2 focus:ring-green-400" />
        </div>
      </div>

      {/* Scopes */}
      <div className="rounded-lg border border-sse-border bg-sse-surface p-4 space-y-3">
        <p className="text-[12px] font-semibold text-sse-ink">Scopes OAuth autorizados</p>
        <p className="text-[11px] text-sse-muted">Separados por espacio. Deben coincidir con los configurados en Google Cloud Console.</p>
        <textarea rows={6} value={form.scopes} onChange={set("scopes")}
          className="w-full text-[11px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink font-mono focus:outline-none focus:ring-2 focus:ring-green-400" />
        <div className="flex flex-wrap gap-1.5">
          {form.scopes.split(/\s+/).filter(Boolean).map((s) => (
            <span key={s} className="text-[10px] rounded bg-green-50 text-green-700 px-1.5 py-0.5 font-mono">
              {s.replace("https://www.googleapis.com/auth/", "")}
            </span>
          ))}
        </div>
      </div>

      {/* Connection status */}
      {config && (
        <div className="rounded-lg border border-sse-border bg-sse-surface p-4">
          <p className="text-[12px] font-semibold text-sse-ink mb-3">Estado de conexión actual</p>
          <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
            {[
              { label: "Estado",   value: config.connectionStatus ?? "—" },
              { label: "Usuario",  value: config.connectedUser    ?? "—" },
              { label: "Dominio",  value: config.connectedDomain  ?? "—" },
              { label: "Client ID configurado", value: config.clientId ? "Sí" : "No" },
            ].map(({ label, value }) => (
              <div key={label}>
                <span className="text-sse-muted">{label}: </span>
                <span className="text-sse-ink font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saveConfig.isPending}
          className="text-[12px] px-6 py-2 rounded bg-[#0F9D58] text-white hover:bg-green-700 disabled:opacity-50 font-medium">
          {saveConfig.isPending ? "Guardando…" : "Guardar configuración"}
        </button>
      </div>
    </div>
  );
}
