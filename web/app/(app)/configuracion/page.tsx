"use client";

import { useState, useEffect, useCallback } from "react";
import { UNIDADES } from "@/types/unidad";

// ── Types ──────────────────────────────────────────────────────────────────────

interface UnitConfig {
  spreadsheetId: string;
  driveFolderId: string;
}

interface GlobalConfig {
  units: Record<string, UnitConfig>;
  geminiApiKey: string;
  webhookSecret: string;
}

const STORAGE_KEY = "sse-vraf-config-v1";

const DEFAULT_CONFIG: GlobalConfig = {
  units: Object.fromEntries(
    UNIDADES.map((u) => [u.id, { spreadsheetId: "", driveFolderId: "" }])
  ),
  geminiApiKey: "",
  webhookSecret: "",
};

// ── Icons ──────────────────────────────────────────────────────────────────────

function IconCog({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function IconKey({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
    </svg>
  );
}

function IconInfo({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  );
}

// ── Field component ────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
  type?: string;
}

function Field({ label, placeholder, value, onChange, mono, type = "text" }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[12px] font-medium text-sse-muted">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={[
          "w-full rounded-lg border border-sse-border bg-white px-3 py-2",
          "text-[13px] text-sse-ink placeholder:text-sse-muted/60",
          "focus:border-sse-primary focus:outline-none focus:ring-1 focus:ring-sse-primary",
          "dark:bg-sse-surface",
          mono ? "font-mono" : "",
        ].join(" ")}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-[14px] font-semibold text-sse-ink">{title}</h2>
      {subtitle && <p className="mt-0.5 text-[12px] text-sse-muted">{subtitle}</p>}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<GlobalConfig>(DEFAULT_CONFIG);
  const [saved, setSaved]   = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GlobalConfig;
        setConfig((prev) => ({
          ...prev,
          ...parsed,
          units: { ...prev.units, ...(parsed.units ?? {}) },
        }));
      }
    } catch {
      // Ignore parse errors — use defaults
    }
  }, []);

  const updateUnit = useCallback(
    (id: string, field: keyof UnitConfig, value: string) => {
      setConfig((prev) => ({
        ...prev,
        units: {
          ...prev.units,
          [id]: { ...prev.units[id], [field]: value },
        },
      }));
      setSaved(false);
    },
    []
  );

  const updateGlobal = useCallback(
    (field: "geminiApiKey" | "webhookSecret", value: string) => {
      setConfig((prev) => ({ ...prev, [field]: value }));
      setSaved(false);
    },
    []
  );

  function handleSave() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // localStorage might be unavailable in some environments
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      {/* Page header */}
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-sse-primary/10">
          <IconCog className="h-6 w-6 text-sse-primary" />
        </div>
        <div>
          <h1 className="text-[20px] font-semibold text-sse-ink leading-tight">
            Configuración Google Workspace
          </h1>
          <p className="mt-1 text-[13px] text-sse-muted">
            Conecta la plataforma con tus fuentes de datos oficiales
          </p>
        </div>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 rounded-xl border border-sse-border bg-sse-surface px-4 py-3">
        <IconInfo className="mt-0.5 h-4 w-4 flex-shrink-0 text-sse-muted" />
        <p className="text-[12px] text-sse-muted">
          Las IDs se guardan localmente en este navegador. Configura las
          variables de entorno en tu servidor para producción (
          <code className="rounded bg-black/[0.05] px-1 py-0.5 font-mono text-[11px] dark:bg-white/[0.08]">
            .env.local
          </code>
          ).
        </p>
      </div>

      {/* Units section */}
      <div className="rounded-xl border border-sse-border bg-sse-surface overflow-hidden">
        <div className="border-b border-sse-border px-5 py-4">
          <SectionHeader
            title="Unidades — Google Sheets y Drive"
            subtitle="Introduce el ID del spreadsheet y el ID de la carpeta de Drive para cada unidad"
          />
        </div>

        <div className="divide-y divide-sse-border">
          {UNIDADES.map((unidad) => {
            const unitCfg = config.units[unidad.id] ?? { spreadsheetId: "", driveFolderId: "" };
            return (
              <div key={unidad.id} className="px-5 py-5">
                {/* Unit title */}
                <div className="mb-4 flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: unidad.color }}
                  />
                  <div>
                    <p className="text-[13px] font-semibold text-sse-ink">{unidad.nombre}</p>
                    <p className="text-[11px] text-sse-muted">
                      {unidad.codigo} &middot; {unidad.periodicidad}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field
                    label="SPREADSHEET_ID"
                    placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                    value={unitCfg.spreadsheetId}
                    onChange={(v) => updateUnit(unidad.id, "spreadsheetId", v)}
                    mono
                  />
                  <Field
                    label="DRIVE_FOLDER_ID"
                    placeholder="0BwwA4oUTeiV1TGRPeTVjaWRDY1E"
                    value={unitCfg.driveFolderId}
                    onChange={(v) => updateUnit(unidad.id, "driveFolderId", v)}
                    mono
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* API keys section */}
      <div className="rounded-xl border border-sse-border bg-sse-surface overflow-hidden">
        <div className="border-b border-sse-border px-5 py-4">
          <div className="flex items-center gap-2">
            <IconKey className="h-4 w-4 text-sse-muted" />
            <SectionHeader
              title="Claves de API"
              subtitle="Se almacenan localmente. No las compartas en repositorios de código."
            />
          </div>
        </div>

        <div className="space-y-4 px-5 py-5">
          <Field
            label="GEMINI_API_KEY"
            placeholder="AIzaSy…"
            value={config.geminiApiKey}
            onChange={(v) => updateGlobal("geminiApiKey", v)}
            mono
            type="password"
          />
          <Field
            label="WEBHOOK_SHARED_SECRET"
            placeholder="whsec_…"
            value={config.webhookSecret}
            onChange={(v) => updateGlobal("webhookSecret", v)}
            mono
            type="password"
          />
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center justify-between rounded-xl border border-sse-border bg-sse-surface px-5 py-4">
        <div>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#059669]">
              <IconCheck className="h-4 w-4" />
              Configuración guardada
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          className={[
            "inline-flex items-center gap-2 rounded-lg px-5 py-2.5",
            "text-[13px] font-semibold text-white",
            "bg-sse-primary hover:bg-sse-primary/90 active:scale-[0.98]",
            "transition-all duration-100",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary focus-visible:ring-offset-2",
          ].join(" ")}
        >
          Guardar configuración
        </button>
      </div>
    </div>
  );
}
