"use client";

import { useState, useEffect } from "react";
import { useISPConfig, useUpdateISPConfig } from "@/hooks/useISP";
import type { ISPConfig } from "@/types/isp";

type FormState = {
  maxSessionDurationMinutes: string;
  maxFailedAttempts:         string;
  lockDurationMinutes:       string;
  multipleSessionsAllowed:   boolean;
  googleOAuthPrepared:       boolean;
};

function toFormState(cfg: ISPConfig): FormState {
  return {
    maxSessionDurationMinutes: String(cfg.maxSessionDurationMinutes),
    maxFailedAttempts:         String(cfg.maxFailedAttempts),
    lockDurationMinutes:       String(cfg.lockDurationMinutes),
    multipleSessionsAllowed:   cfg.multipleSessionsAllowed,
    googleOAuthPrepared:       cfg.googleOAuthPrepared,
  };
}

function ConfigRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="py-4 border-b border-sse-border last:border-b-0 grid md:grid-cols-2 gap-4 items-start">
      <div>
        <p className="text-[13px] font-medium text-sse-ink">{label}</p>
        <p className="text-[11px] text-sse-muted mt-0.5">{description}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

export function ISPConfig({ wsId }: { wsId: string }) {
  void wsId;
  const { data: config, isLoading } = useISPConfig();
  const update = useUpdateISPConfig();

  const [form, setForm] = useState<FormState>({
    maxSessionDurationMinutes: "480",
    maxFailedAttempts:         "5",
    lockDurationMinutes:       "30",
    multipleSessionsAllowed:   false,
    googleOAuthPrepared:       false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (config) setForm(toFormState(config));
  }, [config]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    update.mutate(
      {
        maxSessionDurationMinutes: Number(form.maxSessionDurationMinutes),
        maxFailedAttempts:         Number(form.maxFailedAttempts),
        lockDurationMinutes:       Number(form.lockDurationMinutes),
        multipleSessionsAllowed:   form.multipleSessionsAllowed,
        googleOAuthPrepared:       form.googleOAuthPrepared,
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded bg-sse-border" />)}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-2">
      <div className="rounded-lg border border-sse-border bg-sse-surface px-6">
        <ConfigRow
          label="Duración máxima de sesión"
          description="Tiempo en minutos antes de que una sesión expire automáticamente."
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={10080}
              value={form.maxSessionDurationMinutes}
              onChange={(e) => setForm({ ...form, maxSessionDurationMinutes: e.target.value })}
              className="w-24 text-[13px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink"
            />
            <span className="text-[12px] text-sse-muted">minutos</span>
            <span className="text-[11px] text-blue-600 bg-blue-50 rounded px-1.5 py-0.5">
              ≈ {Math.round(Number(form.maxSessionDurationMinutes) / 60 * 10) / 10}h
            </span>
          </div>
        </ConfigRow>

        <ConfigRow
          label="Intentos fallidos máximos"
          description="Número de intentos de contraseña incorrectos antes de bloquear la cuenta."
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={20}
              value={form.maxFailedAttempts}
              onChange={(e) => setForm({ ...form, maxFailedAttempts: e.target.value })}
              className="w-20 text-[13px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink"
            />
            <span className="text-[12px] text-sse-muted">intentos</span>
          </div>
        </ConfigRow>

        <ConfigRow
          label="Duración del bloqueo"
          description="Tiempo en minutos que permanece bloqueada una cuenta tras superar el límite de intentos."
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={1440}
              value={form.lockDurationMinutes}
              onChange={(e) => setForm({ ...form, lockDurationMinutes: e.target.value })}
              className="w-24 text-[13px] rounded border border-sse-border px-2 py-1.5 bg-sse-surface text-sse-ink"
            />
            <span className="text-[12px] text-sse-muted">minutos</span>
          </div>
        </ConfigRow>

        <ConfigRow
          label="Sesiones múltiples"
          description="Permitir que un mismo usuario tenga más de una sesión activa simultáneamente."
        >
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.multipleSessionsAllowed}
              onChange={(e) => setForm({ ...form, multipleSessionsAllowed: e.target.checked })}
              className="w-4 h-4 accent-blue-700"
            />
            <span className="text-[13px] text-sse-ink">
              {form.multipleSessionsAllowed ? "Permitidas" : "No permitidas (single session)"}
            </span>
          </label>
        </ConfigRow>

        <ConfigRow
          label="Google OAuth preparado"
          description="Marcar cuando el cliente OAuth esté configurado en Google Cloud Console (Sprint 013). No habilita la autenticación por sí solo."
        >
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.googleOAuthPrepared}
              onChange={(e) => setForm({ ...form, googleOAuthPrepared: e.target.checked })}
              className="w-4 h-4 accent-blue-700"
            />
            <span className="text-[13px] text-sse-ink">
              {form.googleOAuthPrepared ? "Preparado (pendiente Sprint 013)" : "No preparado"}
            </span>
          </label>
          {form.googleOAuthPrepared && (
            <p className="text-[10px] text-amber-600 mt-1">
              La implementación de Google OAuth se realizará en Sprint 013. Este flag es solo informativo.
            </p>
          )}
        </ConfigRow>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={update.isPending}
          className="text-[12px] px-5 py-2 rounded bg-[#1E3A8A] text-white hover:bg-blue-900 disabled:opacity-50"
        >
          {update.isPending ? "Guardando…" : "Guardar configuración"}
        </button>
        {saved && (
          <span className="text-[12px] text-green-600 font-medium">✓ Configuración guardada</span>
        )}
      </div>

      <div className="rounded-lg border border-sse-border bg-sse-border/10 p-4 mt-4">
        <p className="text-[11px] font-semibold text-sse-ink mb-2">Contratos Google — Sprint 013</p>
        <p className="text-[11px] text-sse-muted mb-3">
          Las siguientes interfaces están definidas en TypeScript pero no implementadas. Se implementarán en Sprint 013 (Google Identity Integration).
        </p>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { name: "ISPGoogleOAuthContract", desc: "clientId, clientSecret, redirectUri, scopes" },
            { name: "ISPGoogleIdentityContract", desc: "sub, email, name, picture, hd (dominio)" },
            { name: "ISPGoogleWorkspaceContract", desc: "domain, adminEmail, directoryScopes" },
          ].map((c) => (
            <div key={c.name} className="rounded border border-sse-border bg-sse-surface p-3">
              <p className="text-[11px] font-mono font-semibold text-sse-ink">{c.name}</p>
              <p className="text-[10px] text-sse-muted mt-0.5">{c.desc}</p>
              <span className="inline-block mt-1.5 text-[9px] rounded-full bg-amber-100 text-amber-700 px-1.5 py-0.5">
                Pendiente Sprint 013
              </span>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
